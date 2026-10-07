import type Extent from "esri/geometry/Extent";
import type FeatureLayer from "esri/layers/FeatureLayer";
import type EsriMap from "esri/Map";
import type { AdminBoundaryView } from "./boundary-modules";
import type { AgriAdminBoundarySyncResult, BoundarySyncContext } from "./boundary-sync-context";

type Props = Record<string, unknown>;

const mockGetDetached = jest.fn<Promise<FeatureLayer>, [unknown, string]>();
const mockExtentOnly = jest.fn<Promise<Extent | null>, [FeatureLayer | null, string]>();
const mockSyncDistrict = jest.fn<Promise<AgriAdminBoundarySyncResult>, [BoundarySyncContext]>();
const mockSyncRegion = jest.fn<Promise<AgriAdminBoundarySyncResult>, [BoundarySyncContext]>();
const mockLoadModules = jest.fn();
const mockRegisterToken = jest.fn();

class FakeGraphicsLayer {
  constructor(props: Props) {
    Object.assign(this, props, { type: "graphics" });
  }
  removeAll(): void {
    /* no-op */
  }
}

jest.mock("./boundary-modules", () => ({
  getAgriRegionBoundaryUrl: () => "https://s/regions/5",
  getDistrictLayerUrlCandidates: () => ["https://s/tuman/0", "https://s/district/3"],
  getDetachedQueryLayer: (cls: unknown, url: string) => mockGetDetached(cls, url),
  loadBoundaryModules: () => mockLoadModules(),
  registerServerToken: (im: unknown) => mockRegisterToken(im),
}));
jest.mock("./boundary-outline-query", () => ({
  queryLayerExtentOnly: (l: FeatureLayer | null, w: string) => mockExtentOnly(l, w),
}));
jest.mock("./boundary-sync-district", () => ({
  syncSingleDistrict: (ctx: BoundarySyncContext) => mockSyncDistrict(ctx),
}));
jest.mock("./boundary-sync-region", () => ({
  syncRegionWithDistricts: (ctx: BoundarySyncContext) => mockSyncRegion(ctx),
}));

import {
  clearAgriAdminBoundaries,
  queryAgriAdminBoundaryExtentOnly,
  setAgriAdminBordersVisible,
  syncAgriAdminBoundaries,
} from "./boundary-sync";
import { AGRI_ADMIN_BORDERS_STORAGE_KEY } from "./boundary-preference";

const VALID = { xmin: 0, ymin: 0, xmax: 10, ymax: 10 } as unknown as Extent;

const queryLayer = (fields: string[] = ["parent_cod"]): FeatureLayer =>
  ({ fields: fields.map((name) => ({ name, type: "integer" })) }) as unknown as FeatureLayer;

interface FakeMap {
  layers: { items: Props[]; find(p: (l: Props) => boolean): Props | undefined; toArray(): Props[]; length: number };
  add: (l: Props) => void;
  remove: (l: Props) => void;
  reorder: jest.Mock;
}

function fakeMap(): FakeMap {
  const items: Props[] = [];
  const layers = {
    items,
    find: (p: (l: Props) => boolean) => items.find(p),
    toArray: () => items.slice(),
    get length() {
      return items.length;
    },
  };
  return {
    layers,
    add: (l: Props) => items.push(l),
    remove: (l: Props) => {
      const i = items.indexOf(l);
      if (i >= 0) items.splice(i, 1);
    },
    reorder: jest.fn(),
  };
}

function fakeView(): { view: AdminBoundaryView; map: FakeMap } {
  const map = fakeMap();
  const view = {
    map: map as unknown as EsriMap,
    graphics: { toArray: (): never[] => [], remove: jest.fn(), add: jest.fn() },
  } as unknown as AdminBoundaryView;
  return { view, map };
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  mockLoadModules.mockResolvedValue({
    FeatureLayer: "FL",
    GraphicsLayer: FakeGraphicsLayer,
    Graphic: "G",
    IdentityManager: "IM",
  });
  mockGetDetached.mockResolvedValue(queryLayer());
  mockSyncDistrict.mockResolvedValue({ extent: VALID, level: "district" });
  mockSyncRegion.mockResolvedValue({ extent: VALID, level: "region" });
});

describe("queryAgriAdminBoundaryExtentOnly", () => {
  test("no selection -> level none without loading modules", async () => {
    expect(await queryAgriAdminBoundaryExtentOnly({})).toEqual({ extent: null, level: "none" });
    expect(mockLoadModules).not.toHaveBeenCalled();
  });

  test("region code -> region extent via parent_cod WHERE", async () => {
    mockExtentOnly.mockResolvedValue(VALID);
    const res = await queryAgriAdminBoundaryExtentOnly({ regionCode: 1703 });
    expect(res).toEqual({ extent: VALID, level: "region" });
    expect(mockGetDetached).toHaveBeenCalledWith("FL", "https://s/regions/5");
    expect(mockExtentOnly.mock.calls[0][1]).toContain("1703");
  });

  test("invalid region extent is dropped", async () => {
    mockExtentOnly.mockResolvedValue({ xmin: 5, xmax: 1 } as unknown as Extent);
    expect(await queryAgriAdminBoundaryExtentOnly({ regionCode: 1703 })).toEqual({ extent: null, level: "region" });
  });

  test("tuman -> tries district services until a valid extent is found", async () => {
    mockGetDetached
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue(queryLayer(["soato", "district"]));
    mockExtentOnly.mockResolvedValueOnce(null).mockResolvedValue(VALID);
    const res = await queryAgriAdminBoundaryExtentOnly({ tuman: "Quva", districtCode: "1730212" });
    expect(res).toEqual({ extent: VALID, level: "district" });
    expect(mockGetDetached.mock.calls.map((c) => c[1])).toEqual(["https://s/tuman/0", "https://s/district/3"]);
  });

  test("module load failure -> level none", async () => {
    mockLoadModules.mockRejectedValue(new Error("no api"));
    expect(await queryAgriAdminBoundaryExtentOnly({ regionCode: 1703 })).toEqual({ extent: null, level: "none" });
  });
});

describe("syncAgriAdminBoundaries", () => {
  test("no map -> none", async () => {
    expect(await syncAgriAdminBoundaries(null, { tuman: "x" })).toEqual({ extent: null, level: "none" });
  });

  test("tuman selection delegates to syncSingleDistrict with full context", async () => {
    const { view, map } = fakeView();
    const res = await syncAgriAdminBoundaries(view, { viloyat: "Andijon", tuman: " Quva " });
    expect(res.level).toBe("district");
    expect(mockRegisterToken).toHaveBeenCalledWith("IM");
    const ctx = mockSyncDistrict.mock.calls[0][0];
    expect(ctx.tuman).toBe("Quva");
    expect(ctx.bordersVisible).toBe(true);
    expect(map.layers.items.map((l) => l.id)).toEqual(["agri-region-boundary", "agri-district-boundary"]);
    expect(mockSyncRegion).not.toHaveBeenCalled();
  });

  test("region-only selection delegates to syncRegionWithDistricts", async () => {
    const { view } = fakeView();
    const res = await syncAgriAdminBoundaries(view, { regionCode: 1703 });
    expect(res.level).toBe("region");
    expect(mockSyncRegion).toHaveBeenCalledTimes(1);
  });

  test("empty selection hides both outlines", async () => {
    const { view, map } = fakeView();
    const res = await syncAgriAdminBoundaries(view, {});
    expect(res).toEqual({ extent: null, level: "none" });
    expect(map.layers.items.every((l) => l.visible === false)).toBe(true);
  });

  test("errors are swallowed into level none", async () => {
    const { view } = fakeView();
    mockGetDetached.mockRejectedValue(new Error("regions 500"));
    expect(await syncAgriAdminBoundaries(view, { regionCode: 1703 })).toEqual({ extent: null, level: "none" });
  });
});

describe("visibility toggle and clear", () => {
  test("hiding persists preference and hides outline layers without syncing", async () => {
    const { view, map } = fakeView();
    await syncAgriAdminBoundaries(view, { regionCode: 1703 });
    map.layers.items.forEach((l) => {
      l.visible = true;
    });
    await setAgriAdminBordersVisible(view, false);
    expect(window.localStorage.getItem(AGRI_ADMIN_BORDERS_STORAGE_KEY)).toBe("0");
    expect(map.layers.items.every((l) => l.visible === false)).toBe(true);
    expect(mockSyncRegion).toHaveBeenCalledTimes(1);
  });

  test("showing re-syncs the last selection", async () => {
    const { view } = fakeView();
    await syncAgriAdminBoundaries(view, { regionCode: 1703 });
    await setAgriAdminBordersVisible(view, true);
    expect(mockSyncRegion).toHaveBeenCalledTimes(2);
    expect(mockSyncRegion.mock.calls[1][0].bordersVisible).toBe(true);
  });

  test("toggle without a view only stores the preference", async () => {
    await setAgriAdminBordersVisible(null, false);
    expect(window.localStorage.getItem(AGRI_ADMIN_BORDERS_STORAGE_KEY)).toBe("0");
  });

  test("clear forgets the selection and hides outlines", async () => {
    const { view, map } = fakeView();
    await syncAgriAdminBoundaries(view, { regionCode: 1703 });
    await clearAgriAdminBoundaries(view);
    expect(map.layers.items.every((l) => l.visible === false)).toBe(true);
    await setAgriAdminBordersVisible(view, true);
    // last selection is empty -> no region sync
    expect(mockSyncRegion).toHaveBeenCalledTimes(1);
    await expect(clearAgriAdminBoundaries(null)).resolves.toBeUndefined();
  });
});
