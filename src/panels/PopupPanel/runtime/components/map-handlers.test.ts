import { makePopupHost } from "../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../popup-host";
import type { AgriLayerLike, PopupUseDataSource } from "../popup-types";
import type { JimuMapView } from "jimu-arcgis";

const mockDetachedFor = jest.fn();
const mockFindByUrl = jest.fn();
const mockFindById = jest.fn();
const mockAllLayers = jest.fn();
const mockLoadLayer = jest.fn();
const mockDiscover = jest.fn();
const mockGetInstance = jest.fn();
const mockGetDataSource = jest.fn();
const mockSelectedIds = jest.fn();

jest.mock("../../../../gis/feature-layer-data", () => ({
  isMapImageGroupSublayer: (l: { isGroup?: boolean }) => !!l?.isGroup,
  getDetachedQueryLayerFor: (...a: unknown[]) => mockDetachedFor(...a),
  getQueryableLayer: (l: { queryable?: unknown; queryFeatures?: unknown } | null | undefined) =>
    l?.queryable ?? (typeof l?.queryFeatures === "function" ? l : null),
  isQueryableFieldLayer: (l: { queryFeatures?: unknown } | null | undefined) => typeof l?.queryFeatures === "function",
  getAgriLayerMapKey: (l: { url?: string } | null | undefined) => l?.url || "",
  getAllFeatureLayersFromMap: (...a: unknown[]) => mockAllLayers(...a),
  safeLoadMapLayer: (...a: unknown[]) => mockLoadLayer(...a),
  findQueryableLayerOnMapByUrl: (...a: unknown[]) => mockFindByUrl(...a),
  findQueryableLayerOnMapById: (...a: unknown[]) => mockFindById(...a),
  normalizeQueryableLayerUrl: (u: string) => u.replace(/\/+$/, "").toLowerCase(),
  extractMapLayerIdFromDsId: (id: string) => (id.includes("__") ? id.split("__")[1] : ""),
}));
jest.mock("../../../../gis/agri-linked-map-layout", () => ({
  discoverMapWidgetIdInApp: (...a: unknown[]) => mockDiscover(...a),
}));
jest.mock("../../../../gis/agri-data-source-engine", () => ({
  getSelectedDsIds: (...a: unknown[]) => mockSelectedIds(...a),
}));
jest.mock("jimu-arcgis", () => ({
  JimuMapView: class {},
  MapViewManager: { getInstance: () => mockGetInstance() },
}));
jest.mock("jimu-core", () => ({
  DataSourceManager: { getInstance: () => ({ getDataSource: (id: string) => mockGetDataSource(id) }) },
}));
// jest moduleNameMapper routes every esri/* import to ONE shared module, so a
// single generic stand-in class serves Graphic, GraphicsLayer and symbols.
jest.mock("esri/Graphic", () => ({
  default: class {
    items: unknown[] = [];
    constructor(o: Record<string, unknown> = {}) { Object.assign(this, o); }
    addMany(g: unknown[]): void { this.items.push(...g); }
    remove(g: unknown): void { this.items = this.items.filter((i) => i !== g); }
  },
}), { virtual: true });

import {
  addResolvedLayer,
  cleanupHighlight,
  clearHighlight,
  collectLayersFromDataSources,
  expandUseDataSourceEntries,
  getDetachedQueryLayer,
  getLinkedMapWidgetId,
  getMapViewFromManager,
  handleLanguageChange,
  handleMapViewReady,
  handleThemeChange,
  highlightPolygon,
  initializeMapConnection,
  layerKeysMatch,
  layerSupportsAttachments,
  onActiveViewChange,
  queryFeatureByObjectIdCached,
  resolveFeatureLayerForUseDataSource,
  restoreDriftedDefinitionExpressions,
  restoreExtentBeforeSelection,
  scheduleMapInitRetry,
  scheduleMapViewFallback,
  setupHighlightLayer,
  setupThemeObserver,
  snapshotDefinitionExpressions,
  toLiveMapLayer,
} from "./map-handlers";

type Obj = Record<string, unknown>;
const asLayer = (o: Obj): __esri.FeatureLayer => o as unknown as __esri.FeatureLayer;
const asAgri = (o: Obj): AgriLayerLike => o as unknown as AgriLayerLike;
const asJmv = (o: Obj): JimuMapView => o as unknown as JimuMapView;
const asView = (o: Obj): __esri.MapView => o as unknown as __esri.MapView;
const asGeom = (o: Obj): __esri.Geometry => o as unknown as __esri.Geometry;
const q = (url: string, extra: Obj = {}): Obj => ({ url, queryFeatures: (): undefined => undefined, ...extra });

beforeEach(() => {
  [mockDetachedFor, mockFindByUrl, mockFindById, mockAllLayers, mockLoadLayer, mockDiscover, mockGetInstance, mockGetDataSource, mockSelectedIds].forEach((m) => m.mockReset());
  mockGetInstance.mockReturnValue(null);
});

describe("map-handlers: detached layers and definition expression guard", () => {
  test("getDetachedQueryLayer registers client by trimmed URL", async () => {
    const detached = { id: "d" };
    mockDetachedFor.mockResolvedValue(detached);
    const { host } = makePopupHost({}, {}, { _queryOnlyLayers: new Map() });
    expect(await getDetachedQueryLayer(host, asAgri({ url: " https://s/0/// " }))).toBe(detached);
    expect(host._queryOnlyLayers.get("https://s/0")).toBe(detached);
  });

  test("getDetachedQueryLayer returns null for group, missing or unavailable", async () => {
    const { host } = makePopupHost({}, {}, { _queryOnlyLayers: new Map() });
    expect(await getDetachedQueryLayer(host, null)).toBeNull();
    expect(await getDetachedQueryLayer(host, asAgri({ isGroup: true }))).toBeNull();
    mockDetachedFor.mockResolvedValue(null);
    expect(await getDetachedQueryLayer(host, asAgri({ url: "u" }))).toBeNull();
    mockDetachedFor.mockResolvedValue({});
    await getDetachedQueryLayer(host, asAgri({ id: "no-url" }));
    expect(host._queryOnlyLayers.size).toBe(0);
  });

  test("snapshot skips nulls/duplicates and tolerates throwing getters", () => {
    const { host } = makePopupHost();
    const a = asAgri({ definitionExpression: "x=1" });
    const b = asAgri({});
    const bad = {} as AgriLayerLike;
    Object.defineProperty(bad, "definitionExpression", { get: () => { throw new Error("no"); } });
    const snap = snapshotDefinitionExpressions(host, [a, null, a, b, bad, undefined]);
    expect(Array.from(snap.values())).toEqual(["x=1", ""]);
  });

  test("restore re-applies only drifted expressions", () => {
    const { host } = makePopupHost();
    const drifted = asAgri({ definitionExpression: "" });
    const stable = asAgri({ definitionExpression: "a=1" });
    restoreDriftedDefinitionExpressions(host, new Map([[drifted, "tuman=3"], [stable, "a=1"]]));
    expect(drifted.definitionExpression).toBe("tuman=3");
    expect(stable.definitionExpression).toBe("a=1");
    const readonly = {} as AgriLayerLike;
    Object.defineProperty(readonly, "definitionExpression", { get: () => "", set: () => { throw new Error("ro"); } });
    expect(() => restoreDriftedDefinitionExpressions(host, new Map([[readonly, "z"]]))).not.toThrow();
  });
});

describe("map-handlers: queryFeatureByObjectIdCached", () => {
  const make = (layerOver: Obj = {}, hostOver: Partial<PopupWidgetHost> = {}) => {
    const feature = { attributes: { OBJECTID: 1 }, geometry: {} };
    const queryObj: Obj = {};
    const queryFeatures = jest.fn((): Promise<{ features: Obj[] }> => Promise.resolve({ features: [feature] }));
    const detached = { createQuery: () => queryObj, queryFeatures };
    const layer = asLayer({ title: "L", definitionExpression: "t=1", createQuery: () => queryObj, queryFeatures, ...layerOver });
    const { host } = makePopupHost({}, {}, {
      getDetachedQueryLayer: jest.fn(() => Promise.resolve(detached as unknown as __esri.FeatureLayer)),
      _featureQueryCacheTtlMs: 1000,
      ...hostOver,
    });
    return { host, layer, feature, queryObj, queryFeatures };
  };

  test("queries detached client by oid and caches the result", async () => {
    const { host, layer, feature, queryObj, queryFeatures } = make();
    const a = await queryFeatureByObjectIdCached(host, layer, "OBJECTID", "12", ["*"]);
    const b = await queryFeatureByObjectIdCached(host, layer, "OBJECTID", "12", ["*"]);
    expect(a).toBe(feature);
    expect(b).toBe(feature);
    expect(queryFeatures).toHaveBeenCalledTimes(1);
    expect(queryObj).toMatchObject({ where: "OBJECTID = 12", outFields: ["*"], returnGeometry: true });
  });

  test("falls back to live layer and restores drifted definitionExpression", async () => {
    const { host, layer, queryFeatures } = make({}, { getDetachedQueryLayer: jest.fn(() => Promise.resolve(null)) });
    queryFeatures.mockImplementation(() => {
      (layer as unknown as Obj).definitionExpression = "";
      return Promise.resolve({ features: [{ attributes: {} }] });
    });
    await queryFeatureByObjectIdCached(host, layer, "OBJECTID", 3, ["*"]);
    expect(layer.definitionExpression).toBe("t=1");
  });

  test("empty result is evicted from cache and returns null", async () => {
    const { host, layer, queryFeatures } = make();
    queryFeatures.mockResolvedValue({ features: [] });
    expect(await queryFeatureByObjectIdCached(host, layer, "OBJECTID", 1, ["*"])).toBeNull();
    expect(host._featureQueryCache.size).toBe(0);
  });

  test("rejected query is evicted and rethrown", async () => {
    const { host, layer, queryFeatures } = make();
    queryFeatures.mockRejectedValue(new Error("down"));
    await expect(queryFeatureByObjectIdCached(host, layer, "OBJECTID", 1, ["*"])).rejects.toThrow("down");
    expect(host._featureQueryCache.size).toBe(0);
  });
});

describe("map-handlers: theme and language", () => {
  test("handleThemeChange prefers explicit flag, then theme string, then resolved theme", () => {
    const { host, setState } = makePopupHost({ isDarkTheme: true }, {}, { getResolvedTheme: jest.fn(() => true) });
    handleThemeChange(host, new CustomEvent("t", { detail: { isDarkTheme: false } }));
    expect(setState).toHaveBeenLastCalledWith({ isDarkTheme: false });
    handleThemeChange(host, new CustomEvent("t", { detail: { theme: "DARK" } }));
    expect(host.state.isDarkTheme).toBe(true);
    handleThemeChange(host, new CustomEvent("t", { detail: { theme: "Light" } }));
    expect(host.state.isDarkTheme).toBe(false);
    setState.mockClear();
    handleThemeChange(host, null);
    expect(host.state.isDarkTheme).toBe(true);
    handleThemeChange(host, new CustomEvent("t", { detail: {} }));
    expect(setState).toHaveBeenCalledTimes(1);
  });

  test("handleThemeChange / handleLanguageChange ignore events when unmounted", () => {
    const { host, setState } = makePopupHost({}, {}, { _isMounted: false });
    handleThemeChange(host, new CustomEvent("t", { detail: { isDarkTheme: false } }));
    handleLanguageChange(host, new CustomEvent("l", { detail: { lang: "ru" } }));
    expect(setState).not.toHaveBeenCalled();
  });

  test("handleLanguageChange normalizes lang and skips no-ops", () => {
    const { host, setState } = makePopupHost({ currentLang: "en" });
    handleLanguageChange(host, new CustomEvent("l", { detail: { language: "ru" } }));
    expect(host.state.currentLang).toBe("ru");
    setState.mockClear();
    handleLanguageChange(host, new CustomEvent("l", { detail: { code: "ru" } }));
    expect(setState).not.toHaveBeenCalled();
    handleLanguageChange(host, undefined);
  });

  test("setupThemeObserver reacts to DOM mutations", async () => {
    const { host } = makePopupHost({ isDarkTheme: true }, {}, { getResolvedTheme: jest.fn(() => false) });
    setupThemeObserver(host);
    document.body.classList.add("theme-flip");
    await new Promise((r) => setTimeout(r, 0));
    expect(host.state.isDarkTheme).toBe(false);
    host.themeObserver.disconnect();
    document.body.classList.remove("theme-flip");
  });
});

describe("map-handlers: highlight and extent", () => {
  const makeView = (): { view: __esri.MapView; added: unknown[]; removed: unknown[]; goTo: jest.Mock; removeAll: jest.Mock } => {
    const added: unknown[] = [];
    const removed: unknown[] = [];
    const goTo = jest.fn(() => Promise.resolve());
    const removeAll = jest.fn();
    const view = asView({ map: { add: (l: unknown) => added.push(l), remove: (l: unknown) => removed.push(l) }, goTo, graphics: { removeAll } });
    return { view, added, removed, goTo, removeAll };
  };

  test("layerSupportsAttachments reads capability flag", () => {
    const { host } = makePopupHost();
    expect(layerSupportsAttachments(host, null)).toBe(false);
  });

  test("setupHighlightLayer adds a single graphics layer", () => {
    const { view, added } = makeView();
    const { host } = makePopupHost({}, {}, { _highlightLayer: null as never });
    setupHighlightLayer(host, view);
    setupHighlightLayer(host, view);
    expect(added).toHaveLength(1);
    expect(host._highlightLayer).toBe(added[0]);
    expect((host._highlightLayer as unknown as Obj).id).toBe("agri-polygon-highlight");
  });

  test("highlightPolygon replaces previous graphics with halo and core", () => {
    const { view, removeAll } = makeView();
    const { host } = makePopupHost({ jimuMapView: asJmv({ view }) }, {}, { _highlightLayer: null as never, clearHighlight: jest.fn(() => clearHighlight(host)) });
    highlightPolygon(host, asGeom({}));
    expect(host._highlightLayer).toBeNull();
    setupHighlightLayer(host, view);
    const geom = asGeom({ type: "polygon" });
    highlightPolygon(host, geom);
    const first = (host._highlightLayer as unknown as { items: unknown[] }).items;
    expect(first).toHaveLength(2);
    expect(removeAll).toHaveBeenCalled();
    highlightPolygon(host, geom);
    expect((host._highlightLayer as unknown as { items: unknown[] }).items).toHaveLength(2);
    expect((host._highlightLayer as unknown as { items: unknown[] }).items).not.toContain(first[0]);
    highlightPolygon(host, null as never);
  });

  test("highlightPolygon survives a view without graphics collection", () => {
    const { host } = makePopupHost({ jimuMapView: asJmv({ view: { graphics: { removeAll: () => { throw new Error("x"); } } } }) }, {}, { _highlightLayer: { addMany: jest.fn() } as never, clearHighlight: jest.fn() });
    expect(() => highlightPolygon(host, asGeom({}))).not.toThrow();
    expect((host._highlightLayer as unknown as { addMany: jest.Mock }).addMany).toHaveBeenCalled();
  });

  test("clearHighlight is safe without a layer and removes both graphics", () => {
    const { host: none } = makePopupHost({}, {}, { _highlightLayer: null as never });
    expect(() => clearHighlight(none)).not.toThrow();
    const remove = jest.fn();
    const { host } = makePopupHost({}, {}, { _highlightLayer: { remove } as never, _highlightHaloGraphic: {} as never, _highlightGraphic: {} as never });
    clearHighlight(host);
    expect(remove).toHaveBeenCalledTimes(2);
    expect(host._highlightGraphic).toBeNull();
    expect(host._highlightHaloGraphic).toBeNull();
  });

  test("cleanupHighlight removes layer from map and forgets saved extent", () => {
    const { view, removed } = makeView();
    const layer = {};
    const { host } = makePopupHost({ jimuMapView: asJmv({ view }) }, {}, { _highlightLayer: layer as never, _extentBeforeSelection: {} as never });
    cleanupHighlight(host);
    expect(removed).toEqual([layer]);
    expect(host._highlightLayer).toBeNull();
    expect(host._extentBeforeSelection).toBeNull();
  });

  test("restoreExtentBeforeSelection zooms back unless disabled", () => {
    const { view, goTo } = makeView();
    const extent = { saved: true };
    const jmv = asJmv({ view });
    const { host } = makePopupHost({ jimuMapView: jmv }, {}, { _extentBeforeSelection: extent as never });
    restoreExtentBeforeSelection(host);
    expect(goTo).toHaveBeenCalledWith(extent, { duration: 400 });
    expect(host._extentBeforeSelection).toBeNull();
    restoreExtentBeforeSelection(host);
    expect(goTo).toHaveBeenCalledTimes(1);

    const off = makePopupHost({ jimuMapView: jmv }, { config: { settings: { zoomToSelection: false } } as never }, { _extentBeforeSelection: extent as never }).host;
    restoreExtentBeforeSelection(off);
    expect(goTo).toHaveBeenCalledTimes(1);
    expect(off._extentBeforeSelection).toBeNull();

    goTo.mockImplementationOnce(() => { throw new Error("x"); });
    const thrower = makePopupHost({ jimuMapView: jmv }, {}, { _extentBeforeSelection: extent as never }).host;
    expect(() => restoreExtentBeforeSelection(thrower)).not.toThrow();
  });
});

describe("map-handlers: linked map discovery", () => {
  const hostWith = (props: Obj): PopupWidgetHost => {
    const h = makePopupHost().host;
    h.props = { id: "w1-popup", ...props } as never;
    return h;
  };

  test("getLinkedMapWidgetId reads plain, mutable or toArray id lists", () => {
    expect(getLinkedMapWidgetId(hostWith({ useMapWidgetIds: ["m1"] }))).toBe("m1");
    expect(getLinkedMapWidgetId(hostWith({ useMapWidgetIds: { length: 1, asMutable: () => ["m2"] } }))).toBe("m2");
    expect(getLinkedMapWidgetId(hostWith({ useMapWidgetIds: { length: 1, toArray: () => ["m3"] } }))).toBe("m3");
  });

  test("falls back to DOM discovery with host id stripped of -popup", () => {
    mockDiscover.mockImplementation((o: { hostWidgetId: string; getSlotElement: () => HTMLElement | null }) => {
      expect(o.hostWidgetId).toBe("w1");
      return o.getSlotElement() ? "found" : "none";
    });
    const h = hostWith({});
    expect(getLinkedMapWidgetId(h)).toBe("none");
    const scoped = document.createElement("div");
    scoped.className = "widget-renderer";
    scoped.setAttribute("data-widgetid", "w1");
    scoped.innerHTML = '<div class="agri-dashboard-map-slot"></div>';
    document.body.appendChild(scoped);
    expect(getLinkedMapWidgetId(h)).toBe("found");
    scoped.remove();
    const loose = document.createElement("div");
    loose.className = "agri-dashboard-map-slot";
    document.body.appendChild(loose);
    expect(getLinkedMapWidgetId(h)).toBe("found");
    loose.remove();
  });

  describe("getMapViewFromManager", () => {
    test("null when manager missing or throws", () => {
      const { host } = makePopupHost();
      expect(getMapViewFromManager(host, "m")).toBeNull();
      mockGetInstance.mockImplementation(() => { throw new Error("x"); });
      expect(getMapViewFromManager(host, "m")).toBeNull();
    });
    test("prefers group's active view, then first loaded view in the group", () => {
      const { host } = makePopupHost();
      const active = { view: {} };
      mockGetInstance.mockReturnValue({ getJimuMapViewGroup: () => ({ getActiveJimuMapView: () => active }) });
      expect(getMapViewFromManager(host, "m")).toBe(active);
      const loaded = { view: {} };
      mockGetInstance.mockReturnValue({ getJimuMapViewGroup: () => ({ getActiveJimuMapView: () => ({}), getAllJimuMapViews: () => [null, {}, loaded] }) });
      expect(getMapViewFromManager(host, "m")).toBe(loaded);
    });
    test("falls back to global views, preferring active ones", () => {
      const { host } = makePopupHost();
      const inactive = { view: {}, isActive: false };
      const activeOne = { view: {}, isActive: true };
      mockGetInstance.mockReturnValue({ getAllJimuMapViews: () => [{}, inactive, activeOne] });
      expect(getMapViewFromManager(host, null)).toBe(activeOne);
      mockGetInstance.mockReturnValue({ getAllJimuMapViews: () => [inactive] });
      expect(getMapViewFromManager(host, null)).toBe(inactive);
      mockGetInstance.mockReturnValue({});
      expect(getMapViewFromManager(host, null)).toBeNull();
    });
  });
});

describe("map-handlers: map view readiness scheduling", () => {
  afterEach(() => jest.useRealTimers());

  test("handleMapViewReady ignores events for other maps", () => {
    const { host } = makePopupHost({}, {}, { getLinkedMapWidgetId: jest.fn(() => "m1"), scheduleMapViewFallback: jest.fn() });
    handleMapViewReady(host, new CustomEvent("r", { detail: { mapWidgetId: "other" } }));
    expect(host.scheduleMapViewFallback).not.toHaveBeenCalled();
    handleMapViewReady(host, new CustomEvent("r", { detail: { mapWidgetId: "m1" } }));
    handleMapViewReady(host, new Event("r"));
    expect(host.scheduleMapViewFallback).toHaveBeenCalledTimes(2);
  });

  test("scheduleMapViewFallback with live view only retries when layers are missing", () => {
    const jmv = asJmv({ view: {} });
    const retry = jest.fn();
    const empty = makePopupHost({ jimuMapView: jmv, featureLayers: [] }, {}, { scheduleMapInitRetry: retry }).host;
    scheduleMapViewFallback(empty);
    expect(retry).toHaveBeenCalledWith(jmv);
    const full = makePopupHost({ jimuMapView: jmv, featureLayers: [asLayer({})] }, {}, { scheduleMapInitRetry: retry }).host;
    scheduleMapViewFallback(full);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  test("scheduleMapViewFallback activates manager view immediately", () => {
    const found = asJmv({ view: {} });
    const { host } = makePopupHost({}, {}, {
      getLinkedMapWidgetId: jest.fn(() => "m1"),
      getMapViewFromManager: jest.fn(() => found),
      onActiveViewChange: jest.fn(),
    });
    scheduleMapViewFallback(host);
    expect(host.onActiveViewChange).toHaveBeenCalledWith(found);
  });

  test("scheduleMapViewFallback does nothing without a linked map id", () => {
    const { host } = makePopupHost({}, {}, { getLinkedMapWidgetId: jest.fn((): null => null), getMapViewFromManager: jest.fn((): null => null), onActiveViewChange: jest.fn() });
    scheduleMapViewFallback(host);
    expect(host.mapViewFallbackTimer).toBeUndefined();
  });

  test("scheduleMapViewFallback retries once after 600ms and replaces pending timer", () => {
    jest.useFakeTimers();
    const late = asJmv({ view: {} });
    const manager = jest.fn().mockReturnValueOnce(null).mockReturnValueOnce(null).mockReturnValue(late);
    const { host } = makePopupHost({}, {}, {
      getLinkedMapWidgetId: jest.fn(() => "m1"),
      getMapViewFromManager: manager,
      onActiveViewChange: jest.fn(),
    });
    scheduleMapViewFallback(host);
    scheduleMapViewFallback(host);
    jest.advanceTimersByTime(600);
    expect(host.onActiveViewChange).toHaveBeenCalledTimes(1);
    expect(host.onActiveViewChange).toHaveBeenCalledWith(late);
    expect(host.mapViewFallbackTimer).toBeNull();
  });

  test("scheduleMapViewFallback timer is a no-op when unmounted or view appeared", () => {
    jest.useFakeTimers();
    const { host } = makePopupHost({}, {}, {
      getLinkedMapWidgetId: jest.fn(() => "m1"),
      getMapViewFromManager: jest.fn((): null => null),
      onActiveViewChange: jest.fn(),
    });
    scheduleMapViewFallback(host);
    host._isMounted = false;
    jest.advanceTimersByTime(600);
    expect(host.onActiveViewChange).not.toHaveBeenCalled();
  });

  test("scheduleMapInitRetry honours max retries and re-initializes after 800ms", () => {
    jest.useFakeTimers();
    const jmv = asJmv({});
    const { host } = makePopupHost({}, {}, { mapInitRetryCount: 0, maxMapInitRetries: 2, initializeMapConnection: jest.fn(() => Promise.resolve()) });
    scheduleMapInitRetry(host, jmv);
    scheduleMapInitRetry(host, jmv);
    expect(host.mapInitRetryCount).toBe(2);
    scheduleMapInitRetry(host, jmv);
    expect(host.mapInitRetryCount).toBe(2);
    jest.advanceTimersByTime(800);
    expect(host.initializeMapConnection).toHaveBeenCalledTimes(1);
    expect(host.mapInitRetryTimer).toBeNull();
  });

  test("scheduleMapInitRetry timer is skipped when unmounted", () => {
    jest.useFakeTimers();
    const { host } = makePopupHost({}, {}, { mapInitRetryCount: 0, maxMapInitRetries: 3, initializeMapConnection: jest.fn() });
    scheduleMapInitRetry(host, asJmv({}));
    host._isMounted = false;
    jest.advanceTimersByTime(800);
    expect(host.initializeMapConnection).not.toHaveBeenCalled();
  });
});

describe("map-handlers: data source resolution", () => {
  test("expandUseDataSourceEntries adds child sources once", () => {
    mockGetDataSource.mockImplementation((id: string) =>
      id === "parent" ? { getChildDataSources: () => [{ id: "c1" }, { id: "c1" }, { id: "" }, { id: "parent" }] } : null,
    );
    const { host } = makePopupHost();
    const out = expandUseDataSourceEntries(host, [
      { dataSourceId: "parent" } as PopupUseDataSource,
      { dataSourceId: "parent" } as PopupUseDataSource,
      { dataSourceId: "" } as PopupUseDataSource,
      { dataSourceId: "solo" } as PopupUseDataSource,
    ]);
    expect(out).toEqual([
      { dataSourceId: "parent" },
      { dataSourceId: "c1", mainDataSourceId: "parent" },
      { dataSourceId: "solo" },
    ]);
  });

  test("addResolvedLayer registers queryable layers once with their data source", () => {
    const { host } = makePopupHost();
    const target: __esri.FeatureLayer[] = [];
    const map: Record<string, string> = {};
    const seen = new Set<string>();
    const layer = asAgri(q("u1"));
    addResolvedLayer(host, target, map, seen, layer, "ds1");
    addResolvedLayer(host, target, map, seen, layer, "ds2");
    addResolvedLayer(host, target, map, seen, asAgri({ url: "u2" }), "ds3");
    addResolvedLayer(host, target, map, seen, asAgri(q("")), "ds4");
    addResolvedLayer(host, target, map, seen, asAgri(q("u5")));
    expect(target).toHaveLength(2);
    expect(map).toEqual({ u1: "ds1" });
  });

  test("collectLayersFromDataSources merges cached and manager data sources", () => {
    const cachedLayer = q("u1");
    const liveLayer = q("u2");
    mockGetDataSource.mockImplementation((id: string) => (id === "ds2" ? { getLayer: () => liveLayer } : null));
    const real = makePopupHost({ dataSourcesById: { ds1: { layer: cachedLayer } as never } });
    const host = real.host;
    host.addResolvedLayer = (t, m, s, l, d) => addResolvedLayer(host, t, m, s, l, d);
    host.toLiveMapLayer = jest.fn((l) => l as never);
    const jmv = asJmv({ view: { map: {} } });
    const res = collectLayersFromDataSources(host, jmv, [
      { dataSourceId: "ds1" } as PopupUseDataSource,
      { dataSourceId: "ds2" } as PopupUseDataSource,
      { dataSourceId: "" } as PopupUseDataSource,
    ]);
    expect(res.layers.map((l) => l.url)).toEqual(["u1", "u2"]);
    expect(res.layerKeyToDsId).toEqual({ u1: "ds1", u2: "ds2" });
  });

  test("collectLayersFromDataSources supports cached getLayer()", () => {
    const real = makePopupHost({ dataSourcesById: { ds1: { getLayer: () => q("u9") } as never } });
    const host = real.host;
    host.addResolvedLayer = (t, m, s, l, d) => addResolvedLayer(host, t, m, s, l, d);
    host.toLiveMapLayer = jest.fn((l) => l as never);
    mockGetDataSource.mockReturnValue(null);
    expect(collectLayersFromDataSources(host, asJmv({}), [{ dataSourceId: "ds1" } as PopupUseDataSource]).layers).toHaveLength(1);
  });

  test("toLiveMapLayer prefers URL match, then id match, then queryable self", () => {
    const { host } = makePopupHost();
    const map = {} as __esri.Map;
    expect(toLiveMapLayer(host, null, map)).toBeNull();
    const byUrl = { by: "url" };
    mockFindByUrl.mockReturnValueOnce(byUrl);
    expect(toLiveMapLayer(host, asAgri({ url: "u", id: 1 }), map)).toBe(byUrl);
    const byId = { by: "id" };
    mockFindByUrl.mockReturnValue(null);
    mockFindById.mockReturnValueOnce(byId);
    expect(toLiveMapLayer(host, asAgri({ url: "u", id: 1 }), map)).toBe(byId);
    expect(mockFindById).toHaveBeenCalledWith(map, "1");
    const self = asAgri({ id: "x", queryFeatures: (): undefined => undefined });
    expect(toLiveMapLayer(host, self, map)).toBe(self);
    const plain = asAgri({ url: "p" });
    expect(toLiveMapLayer(host, plain, null)).toBe(plain);
  });

  test("layerKeysMatch compares key, id, then normalized URL", () => {
    const { host } = makePopupHost();
    expect(layerKeysMatch(host, null, asAgri({}))).toBe(false);
    expect(layerKeysMatch(host, asAgri({ url: "same" }), asAgri({ url: "same" }))).toBe(true);
    expect(layerKeysMatch(host, asAgri({ id: 1, url: "a" }), asAgri({ id: "1", url: "b" }))).toBe(true);
    expect(layerKeysMatch(host, asAgri({ url: "http://x/0/" }), asAgri({ url: "HTTP://X/0" }))).toBe(true);
    expect(layerKeysMatch(host, asAgri({ id: 1, url: "a" }), asAgri({ id: 2, url: "b" }))).toBe(false);
    expect(layerKeysMatch(host, asAgri({}), asAgri({}))).toBe(false);
  });

  describe("resolveFeatureLayerForUseDataSource", () => {
    const live = (l: unknown): __esri.FeatureLayer => ({ live: l }) as unknown as __esri.FeatureLayer;
    const mk = () => makePopupHost({}, {}, { toLiveMapLayer: jest.fn((l) => live(l)) }).host;
    const withMap = (extra: Obj = {}): JimuMapView => asJmv({ view: { map: {} }, ...extra });
    const use = (id: string): PopupUseDataSource => ({ dataSourceId: id }) as PopupUseDataSource;

    test("returns null without id or map", async () => {
      const host = mk();
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), null)).toBeNull();
      expect(await resolveFeatureLayerForUseDataSource(host, asJmv({ view: {} }), use("a"))).toBeNull();
    });

    test("uses layer view API, then layer view list by dsId, then by layer id hint", async () => {
      const host = mk();
      const apiLayer = q("api");
      const viaApi = await resolveFeatureLayerForUseDataSource(host, withMap({ getJimuLayerViewByDataSourceId: () => ({ layer: apiLayer }) }), use("a"));
      expect(viaApi).toEqual({ live: apiLayer });

      const listLayer = q("list");
      const viaList = await resolveFeatureLayerForUseDataSource(host, withMap({ getAllJimuLayerViews: () => [{ dataSourceId: "x" }, { layerDataSourceId: "a", layer: listLayer }] }), use("a"));
      expect(viaList).toEqual({ live: listLayer });

      const hintLayer = q("hint", { id: "7" });
      const viaHint = await resolveFeatureLayerForUseDataSource(host, withMap({ getAllJimuLayerViews: () => [{ layer: hintLayer }] }), use("map__7"));
      expect(viaHint).toEqual({ live: hintLayer });
    });

    test("falls back to data source layer, schema fetch tolerated, then URL lookup", async () => {
      const host = mk();
      const dsLayer = q("ds");
      mockGetDataSource.mockReturnValue({ fetchSchema: () => Promise.reject(new Error("no")), getJimuLayer: () => dsLayer });
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), use("a"))).toEqual({ live: dsLayer });

      const byUrl = { found: "byUrl" };
      mockFindByUrl.mockReturnValue(byUrl);
      mockGetDataSource.mockReturnValue({ url: "https://svc/0" });
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), use("a"))).toBe(byUrl);
      mockFindByUrl.mockReturnValue(null);
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), use("a"))).toBeNull();
      mockGetDataSource.mockReturnValue(null);
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), use("a"))).toBeNull();
    });

    test("swallows unexpected errors", async () => {
      const host = mk();
      mockGetDataSource.mockImplementation(() => { throw new Error("mgr"); });
      expect(await resolveFeatureLayerForUseDataSource(host, withMap(), use("a"))).toBeNull();
    });
  });
});

describe("map-handlers: onActiveViewChange", () => {
  const make = (state: Parameters<typeof makePopupHost>[0] = {}, over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
    makePopupHost(state, {}, {
      detachMapClick: jest.fn(),
      cleanupHighlight: jest.fn(),
      observeMapAreaResize: jest.fn(),
      attachMapClick: jest.fn(),
      setupHighlightLayer: jest.fn(),
      initializeMapConnection: jest.fn(() => Promise.resolve()),
      repositionPinnedIfNeeded: jest.fn(),
      connectedMapViewId: "",
      _clickHandle: null as never,
      ...over,
    }).host;

  test("clears state when map view is gone", () => {
    const disconnect = jest.fn();
    const host = make({ jimuMapView: asJmv({}), featureLayers: [asLayer({})] }, { mapAreaResizeObserver: { disconnect } as never, connectedMapViewId: "old" });
    onActiveViewChange(host, null as never);
    expect(disconnect).toHaveBeenCalled();
    expect(host.mapAreaResizeObserver).toBeNull();
    expect(host.connectedMapViewId).toBe("");
    expect(host.state).toMatchObject({ jimuMapView: null, featureLayers: [], objectIdField: null, error: "No map view provided" });
  });

  test("connects a ready view: attach click, highlight layer, init connection", async () => {
    const view = { ready: true };
    const jmv = asJmv({ id: "v1", view });
    const host = make();
    onActiveViewChange(host, jmv);
    await new Promise((r) => setTimeout(r, 0));
    expect(host.connectedMapViewId).toBe("v1");
    expect(host.state.jimuMapView).toBe(jmv);
    expect(host.observeMapAreaResize).toHaveBeenCalledWith(view);
    expect(host.attachMapClick).toHaveBeenCalledWith(jmv);
    expect(host.setupHighlightLayer).toHaveBeenCalledWith(view);
    expect(host.initializeMapConnection).toHaveBeenCalledWith(jmv);
    expect(host.repositionPinnedIfNeeded).toHaveBeenCalled();
  });

  test("waits for a not-ready view to become ready", async () => {
    let cb: (ready: boolean) => Promise<void> = () => Promise.resolve();
    const remove = jest.fn();
    const view = { ready: false, watch: (_p: string, fn: typeof cb) => { cb = fn; return { remove }; } };
    const jmv = asJmv({ mapWidgetId: "mw", view });
    const host = make();
    onActiveViewChange(host, jmv);
    expect(host.setupHighlightLayer).not.toHaveBeenCalled();
    await cb(false);
    expect(remove).not.toHaveBeenCalled();
    await cb(true);
    expect(remove).toHaveBeenCalled();
    expect(host.setupHighlightLayer).toHaveBeenCalledWith(view);
    expect(host.initializeMapConnection).toHaveBeenCalled();
  });

  test("re-entry for the same connected map avoids setState and only repairs wiring", () => {
    const jmv = asJmv({ id: "v1", view: {} });
    const host = make({ jimuMapView: jmv, featureLayers: [] }, { connectedMapViewId: "v1" });
    onActiveViewChange(host, jmv);
    expect(host.attachMapClick).toHaveBeenCalledWith(jmv);
    expect(host.initializeMapConnection).toHaveBeenCalledWith(jmv);
    expect(host.setState).not.toHaveBeenCalled();
    const wired = make({ jimuMapView: jmv, featureLayers: [asLayer({})] }, { connectedMapViewId: "v1", _clickHandle: { remove: jest.fn() } });
    onActiveViewChange(wired, jmv);
    expect(wired.attachMapClick).not.toHaveBeenCalled();
    expect(wired.initializeMapConnection).not.toHaveBeenCalled();
  });

  test("view lost before state callback is a no-op", () => {
    const jmv = asJmv({ id: "v2" });
    const host = make();
    onActiveViewChange(host, jmv);
    expect(host.attachMapClick).not.toHaveBeenCalled();
  });
});

describe("map-handlers: initializeMapConnection", () => {
  const viewWithMap = { map: {} };
  const jmv = asJmv({ view: viewWithMap });

  const make = (over: Partial<PopupWidgetHost> = {}, state: Parameters<typeof makePopupHost>[0] = {}, useDataSources?: unknown): PopupWidgetHost => {
    const h = makePopupHost(state, {}, {
      expandUseDataSourceEntries: jest.fn((l: PopupUseDataSource[]) => l),
      dataSourceEngine: { syncSelection: jest.fn() } as never,
      snapshotDefinitionExpressions: jest.fn(() => new Map()),
      restoreDriftedDefinitionExpressions: jest.fn(),
      toLiveMapLayer: jest.fn((l) => l as never),
      collectLayersFromDataSources: jest.fn((): { layers: never[]; layerKeyToDsId: Record<string, string> } => ({ layers: [], layerKeyToDsId: {} })),
      resolveFeatureLayerForUseDataSource: jest.fn(() => Promise.resolve(null)),
      attachMapClick: jest.fn(),
      scheduleMapInitRetry: jest.fn(),
      _clickHandle: null as never,
      mapInitRetryCount: 3,
      ...over,
    }).host;
    h.addResolvedLayer = (t, m, s, l, d) => addResolvedLayer(h, t, m, s, l, d);
    h.props = { ...h.props, useDataSources: useDataSources } as never;
    return h;
  };

  test("skips when unmounted or no map", async () => {
    const h = make({ _isMounted: false });
    await initializeMapConnection(h, jmv);
    expect(mockAllLayers).not.toHaveBeenCalled();
    const h2 = make();
    await initializeMapConnection(h2, asJmv({ view: {} }));
    await initializeMapConnection(h2, null as never);
    expect(mockAllLayers).not.toHaveBeenCalled();
  });

  test("stores resolved map layers and attaches click after state commit", async () => {
    mockAllLayers.mockReturnValue([q("u1", { id: "a", title: "A", objectIdField: "OID" }), q("u2")]);
    const h = make();
    await initializeMapConnection(h, jmv);
    expect(mockLoadLayer).toHaveBeenCalledTimes(2);
    expect(h.restoreDriftedDefinitionExpressions).toHaveBeenCalled();
    expect(h.mapInitRetryCount).toBe(0);
    expect(h.state.featureLayers).toHaveLength(2);
    expect(h.state.error).toBeNull();
    expect((h.state.debugInfo as Obj).layerInfo).toEqual([
      { id: "a", title: "A", url: "u1", objectIdField: "OID" },
      { id: undefined, title: undefined, url: "u2", objectIdField: undefined },
    ]);
    expect(h.attachMapClick).toHaveBeenCalledWith(jmv);
  });

  test("merges data source layers with their ds ids, deduplicating", async () => {
    mockAllLayers.mockReturnValue([q("u1")]);
    const dsLayer = asLayer(q("u2"));
    const extra = asLayer(q("u3"));
    const h = make({
      expandUseDataSourceEntries: jest.fn(() => [{ dataSourceId: "ds1" } as PopupUseDataSource, { dataSourceId: "ds2" } as PopupUseDataSource]),
      collectLayersFromDataSources: jest.fn(() => ({ layers: [dsLayer, asLayer(q("u1"))], layerKeyToDsId: { u2: "ds1" } })),
      resolveFeatureLayerForUseDataSource: jest.fn((_j, u) => Promise.resolve((u as PopupUseDataSource).dataSourceId === "ds2" ? extra : null)),
    }, {}, { asMutable: () => [{ dataSourceId: "ds1" }] });
    await initializeMapConnection(h, jmv);
    expect(h.state.featureLayers.map((l) => l.url)).toEqual(["u1", "u2", "u3"]);
    expect(h.state.layerKeyToDsId).toEqual({ u2: "ds1", u3: "ds2" });
  });

  test("no layers: attaches click, clears state and schedules retry", async () => {
    mockAllLayers.mockReturnValue([]);
    const withDs = make({ expandUseDataSourceEntries: jest.fn(() => [{ dataSourceId: "d" } as PopupUseDataSource]) }, { featureLayers: [asLayer({})] });
    await initializeMapConnection(withDs, jmv);
    expect(withDs.attachMapClick).toHaveBeenCalledWith(jmv);
    expect(withDs.state.featureLayers).toEqual([]);
    expect(withDs.state.error).toBe("None of the selected layers were found on the map. Ensure the chosen layers exist in the selected Map widget.");
    expect(withDs.scheduleMapInitRetry).toHaveBeenCalledWith(jmv);

    const plain = make();
    await initializeMapConnection(plain, jmv);
    expect(plain.state.error).toBeNull();
    expect(plain.scheduleMapInitRetry).toHaveBeenCalled();
  });

  test("no layers and error already shown does not re-set state", async () => {
    mockAllLayers.mockReturnValue([]);
    const h = make({ expandUseDataSourceEntries: jest.fn(() => [{ dataSourceId: "d" } as PopupUseDataSource]), _clickHandle: { remove: jest.fn() } }, { error: "None of the selected layers were found on the map. Ensure the chosen layers exist in the selected Map widget." });
    await initializeMapConnection(h, jmv);
    expect(h.setState).not.toHaveBeenCalled();
    expect(h.attachMapClick).not.toHaveBeenCalled();
  });

  test("unchanged layer set only re-attaches the click handler", async () => {
    mockAllLayers.mockReturnValue([q("u1")]);
    const existing = asLayer(q("u1"));
    const h = make({ _clickHandle: { remove: jest.fn() } }, { featureLayers: [existing] });
    await initializeMapConnection(h, jmv);
    expect(h.setState).not.toHaveBeenCalled();
    expect(h.attachMapClick).toHaveBeenCalledWith(jmv);
  });

  test("unmounted during layer loading aborts before state update", async () => {
    mockAllLayers.mockReturnValue([q("u1")]);
    const h = make();
    mockLoadLayer.mockImplementation(() => { h._isMounted = false; return Promise.resolve(); });
    await initializeMapConnection(h, jmv);
    expect(h.setState).not.toHaveBeenCalled();
  });
});
