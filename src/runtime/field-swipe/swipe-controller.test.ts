import {
  createFieldSwipeController,
  SWIPE_COMPARE_LAYER_ID,
  type SwipeControllerDeps,
  type SwipeStatus,
} from "./swipe-controller";
import { VEGETATION_IMAGE_LAYER_ID } from "../../gis/polygon-api/vegetation-media-layer";
import { getSwipeCompareState, resetSwipeCompareState } from "../../shared/agri-swipe-state";

jest.mock("../../gis/agri-polygon-api-source", () => ({ fetchPolygonExportImageTiff: jest.fn() }));
jest.mock("esri/widgets/Swipe", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("esri/core/reactiveUtils", () => ({ watch: jest.fn() }), { virtual: true });

interface FakeLayer { id: string; visible: boolean; title?: string }
interface FakeList<T> {
  items: T[];
  add: (item: T, index?: number) => void;
  remove: (item: T) => void;
  removeAll: () => void;
  indexOf: (item: T) => number;
  find: (fn: (item: T) => boolean) => T | undefined;
  getItemAt: (i: number) => T | undefined;
  readonly length: number;
}

function makeList<T>(onChange?: () => void, initial: T[] = []): FakeList<T> {
  const items = [...initial];
  return {
    items,
    add: (item, index) => {
      items.splice(index ?? items.length, 0, item);
      onChange?.();
    },
    remove: (item) => {
      const i = items.indexOf(item);
      if (i >= 0) items.splice(i, 1);
      onChange?.();
    },
    removeAll: () => {
      items.length = 0;
    },
    indexOf: (item) => items.indexOf(item),
    find: (fn) => items.find(fn),
    getItemAt: (i) => items[i],
    get length() {
      return items.length;
    },
  };
}

interface FakeSwipe {
  position: number;
  leadingLayers: FakeList<FakeLayer>;
  trailingLayers: FakeList<FakeLayer>;
  destroy: jest.Mock;
}

interface SwipeProps {
  leadingLayers: FakeLayer[];
  trailingLayers: FakeLayer[];
  position: number;
}

function setup() {
  const changeListeners: Array<() => void> = [];
  const notify = (): void => {
    changeListeners.forEach((fn) => { fn(); });
  };
  const main: FakeLayer = { id: VEGETATION_IMAGE_LAYER_ID, visible: true };
  const other: FakeLayer = { id: "other", visible: true };
  const layers = makeList<FakeLayer>(notify, [main, other]);
  const view = {
    map: {
      layers: Object.assign(layers, {
        on: (_event: string, fn: () => void) => {
          changeListeners.push(fn);
          return { remove: jest.fn() };
        },
      }),
    },
    ui: { add: jest.fn(), remove: jest.fn() },
    spatialReference: null,
  };
  const swipes: FakeSwipe[] = [];
  let positionCb: ((p: number) => void) | null = null;
  const fetchImage = jest.fn();
  const deps = {
    fetchImage,
    resolveOverlayExtent: jest.fn(() => Promise.resolve({})),
    createVegetationMediaLayer: jest.fn(
      (o: { id: string; title: string }): FakeLayer => ({ id: o.id, title: o.title, visible: true }),
    ),
    createSwipe: jest.fn((props: SwipeProps) => {
      const s: FakeSwipe = {
        position: props.position,
        leadingLayers: makeList<FakeLayer>(undefined, props.leadingLayers),
        trailingLayers: makeList<FakeLayer>(undefined, props.trailingLayers),
        destroy: jest.fn(),
      };
      swipes.push(s);
      return s;
    }),
    watchPosition: jest.fn((_s: unknown, cb: (p: number) => void) => {
      positionCb = cb;
      return { remove: jest.fn() };
    }),
  };
  const controller = createFieldSwipeController(
    view as unknown as __esri.MapView,
    deps as unknown as SwipeControllerDeps,
  );
  return {
    controller, view, layers, main, swipes, deps, fetchImage,
    emitPosition: (p: number): void => { positionCb?.(p); },
  };
}

const PARAMS = { uniqueid: "u1", regionId: 3, date: "2025-06-01", indexKey: "ndvi" as const };
const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};
const okResult = { canvas: {}, bbox: [0, 0, 1, 1], epsgCode: 4326, width: 1, height: 1, values: null };

describe("createFieldSwipeController", () => {
  beforeEach(() => {
    resetSwipeCompareState();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("goes loading then ready and adds layer above main with a swipe", async () => {
    const t = setup();
    const statuses: SwipeStatus[] = [];
    t.controller.subscribe((s) => statuses.push(s.status));
    t.fetchImage.mockResolvedValue(okResult);

    t.controller.setCompare(PARAMS);
    await flush();

    expect(statuses).toEqual(["loading", "ready"]);
    expect(t.fetchImage).toHaveBeenCalledWith({
      uniqueid: "u1", regionId: 3, rasterDate: "2025-06-01", indiceType: "ndvi", stretch: "fixed",
    });
    expect(t.layers.items.map((l) => l.id)).toEqual([
      VEGETATION_IMAGE_LAYER_ID, SWIPE_COMPARE_LAYER_ID, "other",
    ]);
    expect(t.layers.items[1].title).toBe("Compare NDVI 2025-06-01");
    expect(t.view.ui.add).toHaveBeenCalledTimes(1);
    expect(getSwipeCompareState()).toEqual({ active: true, position: 50 });
  });

  it("ignores a stale response", async () => {
    const t = setup();
    let resolveFirst: (v: unknown) => void = () => undefined;
    t.fetchImage.mockReturnValueOnce(new Promise((r) => { resolveFirst = r; }));
    t.fetchImage.mockResolvedValueOnce(okResult);

    t.controller.setCompare(PARAMS);
    t.controller.setCompare({ ...PARAMS, date: "2025-06-10" });
    await flush();
    resolveFirst(okResult);
    await flush();

    expect(t.deps.createVegetationMediaLayer).toHaveBeenCalledTimes(1);
    expect(t.layers.items.filter((l) => l.id === SWIPE_COMPARE_LAYER_ID)).toHaveLength(1);
  });

  it("reports error, keeps main layer, and clears active state", async () => {
    const t = setup();
    const statuses: SwipeStatus[] = [];
    t.controller.subscribe((s) => statuses.push(s.status));
    t.fetchImage.mockRejectedValue(new Error("boom"));

    t.controller.setCompare(PARAMS);
    await flush();

    expect(statuses).toEqual(["loading", "error"]);
    expect(t.layers.items).toContain(t.main);
    expect(t.layers.items.some((l) => l.id === SWIPE_COMPARE_LAYER_ID)).toBe(false);
    expect(getSwipeCompareState().active).toBe(false);
  });

  it("retry refetches with the kept params", async () => {
    const t = setup();
    t.fetchImage.mockRejectedValueOnce(new Error("boom"));
    t.fetchImage.mockResolvedValueOnce(okResult);
    const statuses: SwipeStatus[] = [];
    t.controller.subscribe((s) => statuses.push(s.status));

    t.controller.setCompare(PARAMS);
    await flush();
    t.controller.retry();
    await flush();

    expect(t.fetchImage).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual(["loading", "error", "loading", "ready"]);
  });

  it("rebinds leadingLayers when the main layer is replaced", async () => {
    const t = setup();
    t.fetchImage.mockResolvedValue(okResult);
    t.controller.setCompare(PARAMS);
    await flush();

    const newMain: FakeLayer = { id: VEGETATION_IMAGE_LAYER_ID, visible: true };
    t.layers.remove(t.main);
    t.layers.add(newMain, 0);

    expect(t.swipes[0].leadingLayers.items).toEqual([newMain]);
    const compare = t.layers.find((l) => l.id === SWIPE_COMPARE_LAYER_ID) as FakeLayer;
    expect(t.layers.indexOf(compare)).toBe(t.layers.indexOf(newMain) + 1);
  });

  it("hides the compare layer when main is removed and shows it when it returns", async () => {
    const t = setup();
    t.fetchImage.mockResolvedValue(okResult);
    t.controller.setCompare(PARAMS);
    await flush();
    const compare = t.layers.find((l) => l.id === SWIPE_COMPARE_LAYER_ID) as FakeLayer;

    t.layers.remove(t.main);
    expect(compare.visible).toBe(false);

    t.layers.add({ id: VEGETATION_IMAGE_LAYER_ID, visible: true }, 0);
    expect(compare.visible).toBe(true);
  });

  it("syncs swipe position to shared state and setPosition updates the swipe", async () => {
    const t = setup();
    t.fetchImage.mockResolvedValue(okResult);
    t.controller.setCompare(PARAMS);
    await flush();

    t.emitPosition(30);
    expect(getSwipeCompareState().position).toBe(30);
    t.controller.setPosition(85);
    expect(t.swipes[0].position).toBe(85);
    expect(getSwipeCompareState().position).toBe(85);
  });

  it("notifies subscribers with the divider position", async () => {
    const t = setup();
    t.fetchImage.mockResolvedValue(okResult);
    const states: Array<{ status: SwipeStatus; position: number }> = [];
    t.controller.subscribe((s) => states.push({ status: s.status, position: s.position }));

    t.controller.setCompare(PARAMS);
    await flush();
    expect(states[states.length - 1]).toEqual({ status: "ready", position: 50 });

    t.emitPosition(30);
    expect(states[states.length - 1]).toEqual({ status: "ready", position: 30 });

    t.controller.setPosition(85);
    expect(states[states.length - 1]).toEqual({ status: "ready", position: 85 });
  });

  it("setCompare(null) removes layer and swipe and goes idle", async () => {
    const t = setup();
    t.fetchImage.mockResolvedValue(okResult);
    t.controller.setCompare(PARAMS);
    await flush();
    const statuses: SwipeStatus[] = [];
    t.controller.subscribe((s) => statuses.push(s.status));

    t.controller.setCompare(null);

    expect(statuses).toEqual(["idle"]);
    expect(t.layers.items.some((l) => l.id === SWIPE_COMPARE_LAYER_ID)).toBe(false);
    expect(t.view.ui.remove).toHaveBeenCalledWith(t.swipes[0]);
    expect(t.swipes[0].destroy).toHaveBeenCalledTimes(1);
    expect(getSwipeCompareState().active).toBe(false);
  });

  it("destroy twice is safe and ignores late responses", async () => {
    const t = setup();
    let resolveFetch: (v: unknown) => void = () => undefined;
    t.fetchImage.mockReturnValue(new Promise((r) => { resolveFetch = r; }));
    t.controller.setCompare(PARAMS);

    t.controller.destroy();
    expect(() => { t.controller.destroy(); }).not.toThrow();
    resolveFetch(okResult);
    await flush();

    expect(t.deps.createVegetationMediaLayer).not.toHaveBeenCalled();
    expect(t.layers.items).toContain(t.main);
  });
});
