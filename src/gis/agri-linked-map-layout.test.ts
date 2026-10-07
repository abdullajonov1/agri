interface WidgetJson {
  manifest?: { name?: string };
  uri?: string;
}

const appState: {
  appConfig: { widgets: Record<string, WidgetJson> } | null;
  appRuntimeInfo: { appMode: string };
} = { appConfig: { widgets: {} }, appRuntimeInfo: { appMode: "RUN" } };

jest.mock("jimu-core", () => ({
  AppMode: { Design: "DESIGN", Run: "RUN" },
  getAppStore: () => ({ getState: () => appState }),
}));
jest.mock("./agri-data-source-engine", () => ({
  toPlainArray: (v: unknown) => (Array.isArray(v) ? v : []),
}));

import {
  AgriLinkedMapLayoutManager,
  discoverMapWidgetIdInApp,
  isKnownMapWidgetId,
} from "./agri-linked-map-layout";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function setRect(el: HTMLElement, r: DOMRect): void {
  el.getBoundingClientRect = () => r;
}

/** Map widget DOM: <div class="layout-item"><div class="widget-renderer" data-widgetid=id/></div> */
function mountMap(id: string, r: DOMRect, parent: HTMLElement = document.body): HTMLElement {
  const item = document.createElement("div");
  item.className = "layout-item";
  const renderer = document.createElement("div");
  renderer.className = "widget-renderer";
  renderer.setAttribute("data-widgetid", id);
  const view = document.createElement("div");
  view.className = "esri-view";
  renderer.appendChild(view);
  item.appendChild(renderer);
  parent.appendChild(item);
  setRect(item, r);
  return item;
}

beforeEach(() => {
  document.body.innerHTML = "";
  appState.appConfig = { widgets: {} };
  appState.appRuntimeInfo = { appMode: "RUN" };
});

describe("isKnownMapWidgetId", () => {
  test("empty id is unknown", () => {
    expect(isKnownMapWidgetId("")).toBe(false);
    expect(isKnownMapWidgetId(null)).toBe(false);
  });

  test("detects map widgets by manifest name or uri", () => {
    appState.appConfig = {
      widgets: { w1: { manifest: { name: "Map" } }, w2: { uri: "widgets/arcgis/arcgis-map/" }, w3: { uri: "x" } },
    };
    expect(isKnownMapWidgetId("w1")).toBe(true);
    expect(isKnownMapWidgetId("w2")).toBe(true);
    expect(isKnownMapWidgetId("w3")).toBe(false);
  });

  test("falls back to DOM renderer presence", () => {
    mountMap("domMap", rect(0, 0, 10, 10));
    expect(isKnownMapWidgetId("domMap")).toBe(true);
  });
});

describe("discoverMapWidgetIdInApp", () => {
  test("returns null when no map widgets", () => {
    appState.appConfig = { widgets: { a: { uri: "text" } } };
    expect(discoverMapWidgetIdInApp({ hostWidgetId: "host" })).toBeNull();
  });

  test("skips the host and its embedded children", () => {
    appState.appConfig = {
      widgets: { host: { manifest: { name: "map" } }, "host-pie": { manifest: { name: "map" } }, m: { manifest: { name: "map" } } },
    };
    expect(discoverMapWidgetIdInApp({ hostWidgetId: "host" })).toBe("m");
  });

  test("without slot, first candidate wins", () => {
    appState.appConfig = { widgets: { m1: { manifest: { name: "map" } }, m2: { manifest: { name: "map" } } } };
    expect(discoverMapWidgetIdInApp({ hostWidgetId: "h" })).toBe("m1");
  });

  test("prefers the map overlapping the slot", () => {
    appState.appConfig = { widgets: { m1: { manifest: { name: "map" } }, m2: { manifest: { name: "map" } } } };
    mountMap("m1", rect(1000, 1000, 100, 100));
    mountMap("m2", rect(0, 0, 100, 100));
    const slot = document.createElement("div");
    setRect(slot, rect(0, 0, 200, 200));
    expect(discoverMapWidgetIdInApp({ hostWidgetId: "h", getSlotElement: () => slot })).toBe("m2");
  });

  test("when none overlap, nearest map to slot centre wins", () => {
    appState.appConfig = { widgets: { m1: { manifest: { name: "map" } }, m2: { manifest: { name: "map" } } } };
    mountMap("m1", rect(2000, 2000, 10, 10));
    mountMap("m2", rect(500, 500, 10, 10));
    const slot = document.createElement("div");
    setRect(slot, rect(0, 0, 100, 100));
    expect(discoverMapWidgetIdInApp({ hostWidgetId: "h", getSlotElement: () => slot })).toBe("m2");
  });
});

describe("AgriLinkedMapLayoutManager", () => {
  test("clears and does nothing without a slot or map", () => {
    const onMapResolved = jest.fn();
    const mgr = new AgriLinkedMapLayoutManager({
      scope: "dashboard",
      hostWidgetId: "h",
      getSlotElement: () => null,
      getUseMapWidgetIds: () => [],
      onMapResolved,
    });
    mgr.layoutNow();
    expect(onMapResolved).not.toHaveBeenCalled();
    expect(mgr.getResolvedMapWidgetId()).toBeNull();
  });

  test("positions the linked map over the slot, then clears on destroy", () => {
    appState.appConfig = { widgets: { m: { manifest: { name: "map" } } } };
    const surface = document.createElement("div");
    document.body.appendChild(surface);
    const hostItem = document.createElement("div");
    hostItem.className = "layout-item";
    const slot = document.createElement("div");
    hostItem.appendChild(slot);
    surface.appendChild(hostItem);
    setRect(slot, rect(50, 60, 300, 200));
    setRect(surface, rect(10, 20, 1000, 1000));
    const item = mountMap("m", rect(50, 60, 300, 200), surface);

    const onMapResolved = jest.fn();
    const resizeMapView = jest.fn();
    const mgr = new AgriLinkedMapLayoutManager({
      scope: "plm",
      hostWidgetId: "h",
      getSlotElement: () => slot,
      getUseMapWidgetIds: () => ["m"],
      onMapResolved,
      resizeMapView,
    });
    mgr.layoutNow();
    mgr.layoutNow();

    expect(onMapResolved).toHaveBeenCalledTimes(1);
    expect(onMapResolved).toHaveBeenCalledWith("m");
    expect(resizeMapView).toHaveBeenCalledTimes(2);
    expect(item.classList.contains("plm-managed-map")).toBe(true);
    expect(item.style.getPropertyValue("position")).toBe("absolute");
    expect(item.style.getPropertyValue("top")).toBe("40px");
    expect(item.style.getPropertyValue("left")).toBe("40px");
    expect(item.style.getPropertyValue("width")).toBe("300px");
    const renderer = item.querySelector(".widget-renderer") as HTMLElement;
    expect(renderer.classList.contains("plm-managed-map-renderer")).toBe(true);
    expect((item.querySelector(".esri-view") as HTMLElement).style.getPropertyValue("border-radius")).toBe("20px");

    mgr.destroy();
    expect(item.classList.contains("plm-managed-map")).toBe(false);
    expect(item.style.getPropertyValue("position")).toBe("");
  });

  test("in design mode requests map settings for an auto-discovered map", () => {
    appState.appConfig = { widgets: { m: { manifest: { name: "map" } } } };
    appState.appRuntimeInfo = { appMode: "DESIGN" };
    const slot = document.createElement("div");
    document.body.appendChild(slot);
    setRect(slot, rect(0, 0, 100, 100));
    mountMap("m", rect(0, 0, 100, 100));
    const events: unknown[] = [];
    const handler = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener("agri-main:map-settings-request", handler);
    const mgr = new AgriLinkedMapLayoutManager({
      scope: "dashboard",
      hostWidgetId: "h",
      getSlotElement: () => slot,
      getUseMapWidgetIds: () => [],
    });
    mgr.layoutNow();
    mgr.layoutNow();
    window.removeEventListener("agri-main:map-settings-request", handler);
    expect(events).toEqual([{ widgetId: "h", mapWidgetId: "m" }]);
  });

  test("scheduleLayout defers sync to the next animation frame", () => {
    appState.appConfig = { widgets: { m: { manifest: { name: "map" } } } };
    const slot = document.createElement("div");
    document.body.appendChild(slot);
    mountMap("m", rect(0, 0, 10, 10));
    const onMapResolved = jest.fn();
    const rafSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    const mgr = new AgriLinkedMapLayoutManager({
      scope: "dashboard",
      hostWidgetId: "h",
      getSlotElement: () => slot,
      getUseMapWidgetIds: () => ["m"],
      onMapResolved,
    });
    mgr.scheduleLayout();
    rafSpy.mockRestore();
    expect(onMapResolved).toHaveBeenCalledWith("m");
  });
});
