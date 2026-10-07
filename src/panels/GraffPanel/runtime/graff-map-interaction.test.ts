jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("./graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockIdentity = jest.fn(() => Promise.resolve());
const mockDetachedFor = jest.fn();
jest.mock("../../../gis/feature-layer-data", () => ({
  ensureAgriServerIdentityToken: (): unknown => mockIdentity(),
  getDetachedQueryLayerForUrl: (u: string): unknown => mockDetachedFor(u),
  isMapImageOwnedLayer: (): boolean => false,
  resolveQueryableServiceUrl: (l: { url?: string }): string | undefined => l?.url,
}));
jest.mock("../../../gis/agri-table-data-source", () => ({ AGRI_TABLE_JOIN_FIELD: "uniqueid" }));
jest.mock("../../../data/agri-uniqueid-sql", () => ({
  buildUniqueidUpperEqualsWhere: (id: string, f: string): string => `UPPER(${f})='${id.toUpperCase()}'`,
  stripUniqueidBraces: (v: string | null | undefined): string => String(v ?? "").replace(/[{}]/g, ""),
}));
jest.mock("../../../gis/agri-polygon-api-source", () => ({
  mapStretch01ToIndexRange: (t: number, lo: number | undefined, hi: number | undefined): number => (lo ?? 0) + t * ((hi ?? 1) - (lo ?? 0)),
  sampleIndexFromRgba: (r: number, _g: number, _b: number, a: number): number | null => (a === 0 ? null : r / 255),
}));
const mockClearGraphics = jest.fn();
jest.mock("./graff-map-utils", () => ({
  clearMapSelectionGraphics: (v: unknown): void => mockClearGraphics(v),
  isLayerTreeVisible: (): boolean => true,
}));
const mockCopy = jest.fn();
jest.mock("./graff-clipboard", () => ({ copyUniqueIdToClipboard: (s: string): unknown => mockCopy(s) }));

import { asMock, makeStubHost } from "./__test-utils__/stub-host";
import type { AgriGraffWidgetState } from "./graff-state";
import type { GraffMapInteractionHost } from "./graff-map-interaction";
import * as mi from "./graff-map-interaction";

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));
const makeHost = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffMapInteractionHost =>
  makeStubHost(state, {
    _lastAppliedPolygonClickedAt: 0,
    _selectionCommittedAt: 0,
    _tableRowClickGeneration: 0,
    _missingVegetationRasterKeys: new Set<string>(["old"]),
    _detachedSpatialQueryLayers: new Map<string, unknown>(),
    isRegionalInteractionEnabled: jest.fn(() => true),
    getTableSpatialQueryCandidates: jest.fn(() => []),
    buildWhereClause: jest.fn(() => "yil=1"),
    builduniqueidWhere: jest.fn((id: string) => `uniqueid='${id}'`),
    highlightFeature: jest.fn(() => Promise.resolve()),
    ...extra,
  }) as unknown as GraffMapInteractionHost;

const events: CustomEvent[] = [];
beforeAll(() => document.addEventListener("widgetSelectionChanged", (e) => events.push(e as CustomEvent)));
beforeEach(() => {
  events.length = 0;
  mockClearGraphics.mockClear();
  mockCopy.mockClear();
});

describe("syncGraffExternalPolygonSelection", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("selects a new polygon from the map: resets state and kicks overlay + data", () => {
    const removeAll = jest.fn();
    const host = makeHost(
      {
        selectedNdviDate: " 2024-05-01 ",
        regionalRegionCode: 5,
        searchText: "abc",
        isSearchActive: true,
        farmerInn: "1",
        connectionStatus: "connected",
        activeMapView: { view: { graphics: { removeAll } } } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      { _lastSuccessfulOverlayDate: "2023-01-01" },
    );
    mi.syncGraffExternalPolygonSelection(host, "{A}", true, 9, 100);
    expect(host._lastAppliedPolygonClickedAt).toBe(100);
    expect(host._polygonSelectionOrigin).toBe("map");
    expect(host._optimisticDateBeforeClear).toBe("2024-05-01");
    expect(host._missingVegetationRasterKeys.size).toBe(0);
    expect(removeAll).toHaveBeenCalled();
    expect(host.state).toMatchObject({
      selecteduniqueid: "{A}",
      viewMode: "table",
      loading: true,
      regionalRegionCode: 9,
      searchText: "",
      isSearchActive: false,
      farmerInn: "",
    });
    expect(host._pendingScrollUniqueid).toBe("{A}");
    expect(asMock(host.kickOptimisticVegetationOverlay)).toHaveBeenCalledWith("{A}");
    expect(asMock(host.fetchVegetationData)).toHaveBeenCalled();
    expect(asMock(host.fetchData)).not.toHaveBeenCalled();
    jest.advanceTimersByTime(450);
    expect(asMock(host.fetchData)).toHaveBeenCalled();
  });
  test("deferred table reload is skipped if selection changed or unmounted", () => {
    const host = makeHost({ connectionStatus: "connected" });
    mi.syncGraffExternalPolygonSelection(host, "A", true);
    host.state = { ...host.state, selecteduniqueid: "B" };
    jest.advanceTimersByTime(450);
    expect(asMock(host.fetchData)).not.toHaveBeenCalled();
  });
  test("keeps region code when hint is missing and falls back to last overlay date; swallows graphics errors", () => {
    const host = makeHost(
      {
        regionalRegionCode: 5,
        activeMapView: {
          view: {
            graphics: {
              removeAll: (): void => {
                throw new Error("x");
              },
            },
          },
        } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      { _lastSuccessfulOverlayDate: "2023-01-01" },
    );
    mi.syncGraffExternalPolygonSelection(host, "A", true, null);
    expect(host.state.regionalRegionCode).toBe(5);
    expect(host._optimisticDateBeforeClear).toBe("2023-01-01");
    expect(host.state.searchText).toBeUndefined();
  });
  test("drops stale notifications", () => {
    const host = makeHost({}, { _lastAppliedPolygonClickedAt: 500 });
    mi.syncGraffExternalPolygonSelection(host, "A", true, null, 100);
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("same polygon clicked later on map clears selection; echoes are ignored", () => {
    const host = makeHost({ selecteduniqueid: "A" }, { _selectionCommittedAt: 100 });
    mi.syncGraffExternalPolygonSelection(host, "{A}", true, null, 50 + 100);
    expect(asMock(host.clearPolygonSelectionFromMapClick)).toHaveBeenCalledTimes(1);
    const echo = makeHost({ selecteduniqueid: "A" }, { _selectionCommittedAt: 100 });
    mi.syncGraffExternalPolygonSelection(echo, "A", true, null, 90);
    expect(asMock(echo.clearPolygonSelectionFromMapClick)).not.toHaveBeenCalled();
  });
  test("polygonMode false clears selection, restores extent, resets where and refetches", () => {
    const goTo = jest.fn(() => Promise.resolve());
    const layer = { definitionExpression: "old" } as unknown as __esri.FeatureLayer;
    const setDef = jest.fn();
    const host = makeHost(
      {
        selecteduniqueid: "A",
        viewMode: "graph",
        connectionStatus: "connected",
        featureLayer: layer,
        dataSource: { setDefinitionExpression: setDef } as unknown as AgriGraffWidgetState["dataSource"],
        activeMapView: { view: { goTo } } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      { _extentBeforeTableSelection: { id: "ext" }, _polygonSelectionOrigin: "map", _selectionCommittedAt: 5 },
    );
    mi.syncGraffExternalPolygonSelection(host, "", false);
    expect(goTo).toHaveBeenCalledWith({ id: "ext" }, expect.objectContaining({ duration: 700 }));
    expect(host._extentBeforeTableSelection).toBeNull();
    expect(host._polygonSelectionOrigin).toBeNull();
    expect(host.state.selecteduniqueid).toBe("");
    expect(layer.definitionExpression).toBe("yil=1");
    expect(setDef).toHaveBeenCalledWith("yil=1");
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
    expect(asMock(host.fetchData)).toHaveBeenCalled();
    expect(mockClearGraphics).toHaveBeenCalled();
  });
  test("polygonMode false tolerates goTo/where failures and does nothing without a current selection", () => {
    const host = makeHost(
      {
        selecteduniqueid: "A",
        activeMapView: {
          view: {
            goTo: (): void => {
              throw new Error("g");
            },
          },
        } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      {
        _extentBeforeTableSelection: {},
        buildWhereClause: jest.fn(() => {
          throw new Error("w");
        }),
      },
    );
    expect(() => mi.syncGraffExternalPolygonSelection(host, "", false)).not.toThrow();
    const none = makeHost();
    mi.syncGraffExternalPolygonSelection(none, "", false);
    expect(asMock(none.setState)).not.toHaveBeenCalled();
    const where1 = makeHost({ selecteduniqueid: "A", featureLayer: {} as __esri.FeatureLayer }, { buildWhereClause: jest.fn(() => "") });
    mi.syncGraffExternalPolygonSelection(where1, "", false);
    expect(where1.state.featureLayer?.definitionExpression).toBe("1=0");
  });
});

describe("handleGraffRowClick", () => {
  const mapView = (extra: Record<string, unknown> = {}): AgriGraffWidgetState["activeMapView"] =>
    ({ view: { goTo: jest.fn(() => Promise.resolve()), extent: { clone: (): string => "cloned" }, ...extra } }) as unknown as AgriGraffWidgetState["activeMapView"];
  const layer = (): __esri.FeatureLayer => ({}) as unknown as __esri.FeatureLayer;
  const spatial = (url: string): __esri.FeatureLayer => ({ url, title: url }) as unknown as __esri.FeatureLayer;
  const detachedWith = (features: unknown[]): unknown => ({
    createQuery: (): Record<string, unknown> => ({}),
    queryFeatures: jest.fn(() => Promise.resolve({ features })),
  });

  beforeEach(() => {
    mockDetachedFor.mockReset();
    mockIdentity.mockClear();
  });

  test("blocked when interaction disabled", async () => {
    const host = makeHost({}, { isRegionalInteractionEnabled: jest.fn(() => false) });
    await mi.handleGraffRowClick(host, { uniqueid: "A" });
    expect(asMock(host.setState)).not.toHaveBeenCalled();
    expect(mockCopy).not.toHaveBeenCalled();
  });
  test("copies the uniqueid but stops when layer or map are missing", async () => {
    const host = makeHost({});
    await mi.handleGraffRowClick(host, { uniqueid: "A" });
    expect(mockCopy).toHaveBeenCalledWith("A");
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("clicking the selected row toggles it off, restores extent and broadcasts", async () => {
    const view = mapView();
    const featureLayer = layer();
    const host = makeHost(
      { selecteduniqueid: "{A}", activeMapView: view, featureLayer, viewMode: "graph" },
      { _extentBeforeTableSelection: { id: "ext" } },
    );
    await mi.handleGraffRowClick(host, { uniqueid: "A" });
    expect(view?.view.goTo).toHaveBeenCalledWith({ id: "ext" }, expect.anything());
    expect(host.state.selecteduniqueid).toBe("");
    expect(featureLayer.definitionExpression).toBe("yil=1");
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
    expect(events.some((e) => e.detail.polygonMode === false)).toBe(true);
    expect(mockClearGraphics).toHaveBeenCalled();
  });
  test("toggle-off tolerates goTo failure", async () => {
    const view = mapView({
      goTo: jest.fn(() => Promise.reject(new Error("interrupted"))),
    });
    const host = makeHost({ selecteduniqueid: "A", activeMapView: view, featureLayer: layer() }, { _extentBeforeTableSelection: {} });
    await expect(mi.handleGraffRowClick(host, { uniqueid: "A" })).resolves.toBeUndefined();
    expect(host.state.selecteduniqueid).toBe("");
  });
  test("selecting a row queries detached spatial layer, highlights, and commits selection", async () => {
    const view = mapView();
    const featureLayer = layer();
    const feature = { id: "f" };
    const detached = detachedWith([feature]);
    mockDetachedFor.mockResolvedValue(detached);
    const host = makeHost(
      { activeMapView: view, featureLayer },
      { getTableSpatialQueryCandidates: jest.fn(() => [spatial("http://a"), spatial("http://b")]) },
    );
    await mi.handleGraffRowClick(host, { uniqueid: "abc" });
    expect(mockDetachedFor).toHaveBeenCalledTimes(1);
    expect(asMock(host.highlightFeature)).toHaveBeenCalledWith(feature, view);
    expect(host._extentBeforeTableSelection).toBe("cloned");
    expect(host._polygonSelectionOrigin).toBe("table");
    expect(host.state.selecteduniqueid).toBe("abc");
    expect(host.state.loading).toBe(false);
    expect(featureLayer.definitionExpression).toBe("(yil=1) AND uniqueid='abc'");
    expect(asMock(host.fetchVegetationData)).toHaveBeenCalled();
    expect(asMock(host.ensureSelectedRowVisible)).toHaveBeenCalledWith("abc");
    expect(events.some((e) => e.detail.polygonMode === true && e.detail.uniqueid === "abc")).toBe(true);
    expect(host._detachedSpatialQueryLayers.get("http://a")).toBe(detached);
  });
  test("uses cached detached layer, skips layers without url or detached, survives query failures", async () => {
    const view = mapView();
    const failing = { createQuery: (): Record<string, unknown> => ({}), queryFeatures: jest.fn(() => Promise.reject(new Error("q"))) };
    const cache = new Map<string, unknown>([["http://cached", failing]]);
    mockDetachedFor.mockImplementation((u: string) => (u === "http://bad" ? Promise.reject(new Error("d")) : Promise.resolve(null)));
    const host = makeHost(
      { activeMapView: view, featureLayer: layer() },
      {
        _detachedSpatialQueryLayers: cache,
        getTableSpatialQueryCandidates: jest.fn(() => [spatial(""), spatial("http://bad"), spatial("http://none"), spatial("http://cached")]),
      },
    );
    await mi.handleGraffRowClick(host, { uniqueid: "abc" });
    expect(failing.queryFeatures).toHaveBeenCalled();
    expect(asMock(host.highlightFeature)).not.toHaveBeenCalled();
    expect(host.state.selecteduniqueid).toBe("abc");
  });
  test("record without uniqueid falls back to objectid and skips the spatial query", async () => {
    const detached = detachedWith([{ id: "f" }]);
    mockDetachedFor.mockResolvedValue(detached);
    const host = makeHost(
      { activeMapView: mapView(), featureLayer: layer() },
      { getTableSpatialQueryCandidates: jest.fn(() => [spatial("http://a")]) },
    );
    await mi.handleGraffRowClick(host, { objectid: 7 });
    expect((detached as { queryFeatures: jest.Mock }).queryFeatures).not.toHaveBeenCalled();
    expect(host.state.selecteduniqueid).toBe("7");
  });
  test("selected where falls back to the unique clause when base is 1=0; broadcast/where errors are swallowed", async () => {
    const featureLayer = layer();
    const host = makeHost(
      { activeMapView: mapView(), featureLayer },
      { buildWhereClause: jest.fn(() => "1=0") },
    );
    await mi.handleGraffRowClick(host, { uniqueid: "abc" });
    expect(featureLayer.definitionExpression).toBe("uniqueid='abc'");
    const throwing = makeHost(
      { activeMapView: mapView(), featureLayer: layer() },
      { buildWhereClause: jest.fn(() => { throw new Error("w"); }) },
    );
    await expect(mi.handleGraffRowClick(throwing, { uniqueid: "abc" })).resolves.toBeUndefined();
  });
  test("a newer click aborts the older one", async () => {
    let release: (v: unknown) => void = () => undefined;
    mockDetachedFor.mockImplementation(() => new Promise((r) => { release = r; }));
    const host = makeHost(
      { activeMapView: mapView(), featureLayer: layer() },
      { getTableSpatialQueryCandidates: jest.fn(() => [spatial("http://a")]) },
    );
    const p = mi.handleGraffRowClick(host, { uniqueid: "one" });
    await flush();
    host._tableRowClickGeneration += 1;
    release(detachedWith([]));
    await p;
    expect(host.state.selecteduniqueid).toBeUndefined();
  });
  test("unexpected failure sets error", async () => {
    mockIdentity.mockRejectedValueOnce(new Error("id"));
    const host = makeHost({ activeMapView: mapView(), featureLayer: layer() });
    await mi.handleGraffRowClick(host, { uniqueid: "abc" });
    expect(host.state.loading).toBe(false);
    expect(host.state.error).toBeTruthy();
  });
});

describe("hover tooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });
  test("ensure creates once and reuses while connected", () => {
    const host = makeHost();
    const a = mi.ensureGraffHoverTooltipEl(host);
    expect(a?.isConnected).toBe(true);
    expect(mi.ensureGraffHoverTooltipEl(host)).toBe(a);
    a?.remove();
    expect(mi.ensureGraffHoverTooltipEl(host)).not.toBe(a);
  });
  test("update writes label, value and position; hide removes visibility", () => {
    const tooltip = document.createElement("div");
    tooltip.innerHTML = '<span class="agri-graff-raster-hover-tooltip__label"></span><span class="agri-graff-raster-hover-tooltip__value"></span>';
    const host = makeHost({ selectedChartIndexKey: "savi" }, { ensureVegetationHoverTooltipEl: jest.fn(() => tooltip), getIndexDisplayColor: jest.fn(() => "red"), _vegetationHoverTooltipEl: tooltip });
    mi.updateGraffHoverTooltip(host, 0.4567, 10, 20);
    expect(tooltip.querySelector(".agri-graff-raster-hover-tooltip__label")?.textContent).toBe("SAVI");
    expect(tooltip.querySelector(".agri-graff-raster-hover-tooltip__value")?.textContent).toBe("0.46");
    expect(tooltip.style.left).toBe("10px");
    expect(tooltip.classList.contains("is-visible")).toBe(true);
    mi.hideGraffHoverTooltip(host);
    expect(tooltip.classList.contains("is-visible")).toBe(false);
  });
  test("update is a no-op without tooltip; default index is NDVI", () => {
    const none = makeHost({}, { ensureVegetationHoverTooltipEl: jest.fn(() => null) });
    expect(() => mi.updateGraffHoverTooltip(none, 1, 1, 1)).not.toThrow();
    const bare = document.createElement("div");
    const host = makeHost({}, { ensureVegetationHoverTooltipEl: jest.fn(() => bare), getIndexDisplayColor: jest.fn(() => "blue") });
    mi.updateGraffHoverTooltip(host, 1, 1, 1);
    expect(asMock(host.getIndexDisplayColor)).toHaveBeenCalledWith("ndvi");
    expect(() => mi.hideGraffHoverTooltip(makeHost())).not.toThrow();
  });
  test("detach removes handles and element, tolerating failures", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const remove = jest.fn();
    const host = makeHost({}, {
      _vegetationHoverHandle: { remove },
      _vegetationHoverLeaveHandle: { remove: (): void => { throw new Error("x"); } },
      _vegetationHoverTooltipEl: el,
    });
    mi.detachGraffRasterHover(host);
    expect(remove).toHaveBeenCalled();
    expect(host._vegetationHoverHandle).toBeNull();
    expect(host._vegetationHoverTooltipEl).toBeNull();
    expect(el.isConnected).toBe(false);
    const stubborn = document.createElement("div");
    const parent = document.createElement("div");
    parent.appendChild(stubborn);
    parent.removeChild = (): never => { throw new Error("rm"); };
    const h2 = makeHost({}, { _vegetationHoverTooltipEl: stubborn });
    expect(() => mi.detachGraffRasterHover(h2)).not.toThrow();
  });
});

describe("sampleGraffRasterValue", () => {
  const point = (x: number, y: number): __esri.Point => ({ x, y }) as unknown as __esri.Point;
  const base = { xmin: 0, ymin: 0, xmax: 2, ymax: 2, width: 2, height: 2 };
  test("null without sample or outside bounds", () => {
    expect(mi.sampleGraffRasterValue(makeHost(), point(1, 1))).toBeNull();
    const host = makeHost({}, { _vegetationRasterSample: { ...base, values: new Float32Array([1, 2, 3, 4]) } });
    expect(mi.sampleGraffRasterValue(host, point(-1, 1))).toBeNull();
    expect(mi.sampleGraffRasterValue(host, point(1, 5))).toBeNull();
  });
  test("reads float values top-down, rejecting non-finite", () => {
    const host = makeHost({}, { _vegetationRasterSample: { ...base, values: new Float32Array([1, 2, 3, NaN]) } });
    expect(mi.sampleGraffRasterValue(host, point(0.5, 1.5))).toBe(1);
    expect(mi.sampleGraffRasterValue(host, point(1.5, 1.5))).toBe(2);
    expect(mi.sampleGraffRasterValue(host, point(0.5, 0.5))).toBe(3);
    expect(mi.sampleGraffRasterValue(host, point(1.5, 0.5))).toBeNull();
  });
  test("values above the index max are re-mapped from the 0..1 stretch", () => {
    const host = makeHost({}, { _vegetationRasterSample: { ...base, values: new Float32Array([0.5, 0, 0, 0]), indexMin: 0, indexMax: 0.2 } });
    expect(mi.sampleGraffRasterValue(host, point(0.5, 1.5))).toBeCloseTo(0.1);
  });
  test("falls back to rgba sampling", () => {
    const rgba = new Uint8ClampedArray(16);
    rgba.set([255, 0, 0, 255], 0);
    const host = makeHost({}, { _vegetationRasterSample: { ...base, rgba, indexMin: 0, indexMax: 2 } });
    expect(mi.sampleGraffRasterValue(host, point(0.5, 1.5))).toBe(2);
    expect(mi.sampleGraffRasterValue(host, point(1.5, 1.5))).toBeNull();
    const bad = makeHost({}, { _vegetationRasterSample: { ...base, rgba: new Uint8ClampedArray(3) } });
    expect(mi.sampleGraffRasterValue(bad, point(0.5, 0.5))).toBeNull();
  });
});

describe("attachGraffRasterHover", () => {
  interface FakeView {
    on: jest.Mock;
    toMap: jest.Mock;
    toScreen: jest.Mock;
    container: { getBoundingClientRect: () => { left: number; top: number } } | null;
  }
  const makeView = (over: Partial<FakeView> = {}): FakeView => ({
    on: jest.fn((_evt: string, _cb: unknown) => ({ remove: jest.fn() })),
    toMap: jest.fn(() => ({ x: 1, y: 1 })),
    toScreen: jest.fn(() => ({ x: 5, y: 6 })),
    container: { getBoundingClientRect: () => ({ left: 100, top: 200 }) },
    ...over,
  });
  const attach = (view: FakeView, extra: Record<string, unknown> = {}): GraffMapInteractionHost => {
    const host = makeHost({}, { _vegetationRasterSample: {}, ensureVegetationHoverTooltipEl: jest.fn(() => document.createElement("div")), sampleVegetationRasterValue: jest.fn(() => 0.5), ...extra });
    mi.attachGraffRasterHover(host, view as unknown as __esri.MapView);
    return host;
  };
  const moveHandler = (view: FakeView): ((e: { x: number; y: number }) => void) => view.on.mock.calls[0][1] as (e: { x: number; y: number }) => void;

  test("does nothing without a raster sample or tooltip", () => {
    const view = makeView();
    const host = makeHost({}, { _vegetationRasterSample: null });
    mi.attachGraffRasterHover(host, view as unknown as __esri.MapView);
    expect(view.on).not.toHaveBeenCalled();
    const v2 = makeView();
    attach(v2, { ensureVegetationHoverTooltipEl: jest.fn(() => null) });
    expect(v2.on).not.toHaveBeenCalled();
  });
  test("pointer-move shows tooltip at screen position; leave hides it", () => {
    const view = makeView();
    const host = attach(view);
    moveHandler(view)({ x: 1, y: 2 });
    expect(asMock(host.updateVegetationHoverTooltip)).toHaveBeenCalledWith(0.5, 105, 206);
    (view.on.mock.calls[1][1] as () => void)();
    expect(asMock(host.hideVegetationHoverTooltip)).toHaveBeenCalled();
  });
  test("pointer-move hides on every miss path", () => {
    const cases: Array<Partial<FakeView>> = [{ toMap: jest.fn(() => null) }, { toScreen: jest.fn(() => null) }, { container: null }, { toMap: jest.fn(() => { throw new Error("t"); }) }];
    for (const over of cases) {
      const view = makeView(over);
      const host = attach(view);
      moveHandler(view)({ x: 0, y: 0 });
      expect(asMock(host.hideVegetationHoverTooltip)).toHaveBeenCalled();
      expect(asMock(host.updateVegetationHoverTooltip)).not.toHaveBeenCalled();
    }
    const nullSample = makeView();
    const h = attach(nullSample, { sampleVegetationRasterValue: jest.fn(() => null) });
    moveHandler(nullSample)({ x: 0, y: 0 });
    expect(asMock(h.hideVegetationHoverTooltip)).toHaveBeenCalled();
  });
  test("pointer-move hides when sample was cleared or unmounted", () => {
    const view = makeView();
    const host = attach(view);
    host._vegetationRasterSample = null;
    moveHandler(view)({ x: 0, y: 0 });
    expect(asMock(host.hideVegetationHoverTooltip)).toHaveBeenCalled();
    expect(asMock(host.sampleVegetationRasterValue)).not.toHaveBeenCalled();
  });
});
