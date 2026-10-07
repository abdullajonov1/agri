jest.mock("jimu-arcgis", () => ({ JimuMapView: class {} }));
const mockGetDataSource = jest.fn();
jest.mock("jimu-core", () => ({
  DataSourceManager: { getInstance: (): unknown => ({ getDataSource: mockGetDataSource }) },
}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../../shared/agri-crop-labels", () => ({
  getCropDisplayName: (v: string, lang: string): string => `crop:${v}:${lang}`,
}));
jest.mock("../../../../shared/agri-place-display", () => ({
  translateAgriPlaceForDisplay: (t: string, lang: string, kind: string): string => `${kind}:${t}:${lang}`,
}));
jest.mock("../../../../filter/localization/vh-constants", () => ({
  NDVI_STATUS_TO_VH: { juda_yaxshi: "1-Juda yaxshi", yaxshi: "2-Yaxshi", orta: "3-O'rta", past: "4-Past", other: "9-Other" },
}));
const mockGetTable = jest.fn();
jest.mock("../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): unknown => mockGetTable(),
}));
const mockBuildSymbol = jest.fn((type: string | undefined, halo?: boolean): string => `sym:${type}:${String(!!halo)}`);
const mockClearGraphics = jest.fn();
jest.mock("../graff-map-utils", () => ({
  buildSelectionSymbol: (t: string | undefined, h?: boolean): string => mockBuildSymbol(t, h),
  clearMapSelectionGraphics: (v: unknown): void => mockClearGraphics(v),
}));
const mockGetQueryable = jest.fn();
jest.mock("../../../../gis/feature-layer-data", () => ({
  getQueryableLayer: (l: unknown): unknown => mockGetQueryable(l),
}));
const mockBootstrap = jest.fn();
jest.mock("../../../../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: (): unknown => mockBootstrap(),
}));

import type { JimuMapView } from "jimu-arcgis";
import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import * as ch from "./connection-handlers";

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));
const asView = (v: unknown): JimuMapView => v as JimuMapView;
const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    makeRegionDistrictKey: (s: string | null): string => (s ? s.toLowerCase() : ""),
    getConfiguredFilterFields: (): string[] => ["tuman"],
    ...extra,
  });

describe("retryMapConnection / onActiveViewChange", () => {
  test("retry resets connection state", () => {
    const host = wired({ connectionStatus: "failed", mapConnectionAttempts: 3, error: "x" });
    ch.retryMapConnection(host);
    expect(host.state).toMatchObject({ connectionStatus: "connecting", mapConnectionAttempts: 0, error: null });
  });
  test("null view detaches prefetch and clears layer", () => {
    const host = wired();
    ch.onActiveViewChange(host, asView(null));
    expect(asMock(host.detachMapHoverPrefetch)).toHaveBeenCalled();
    expect(host.state.activeMapView).toBeNull();
  });
  test("ready view initializes connection immediately", () => {
    const host = wired();
    const view = asView({ view: { ready: true } });
    ch.onActiveViewChange(host, view);
    expect(host.state.activeMapView).toBe(view);
    expect(asMock(host.initializeMapConnection)).toHaveBeenCalledWith(view);
  });
  test("non-ready view waits for ready watch then removes it", () => {
    const host = wired();
    const remove = jest.fn();
    let cb: (ready: boolean) => void = () => undefined;
    const view = asView({
      view: {
        ready: false,
        watch: (_p: string, fn: (r: boolean) => void): { remove: () => void } => {
          cb = fn;
          return { remove };
        },
      },
    });
    ch.onActiveViewChange(host, view);
    cb(false);
    expect(asMock(host.initializeMapConnection)).not.toHaveBeenCalled();
    cb(true);
    expect(remove).toHaveBeenCalled();
    expect(asMock(host.initializeMapConnection)).toHaveBeenCalledWith(view);
  });
});

describe("formatFieldValue", () => {
  const host = wired({ language: "en" as AgriGraffWidgetState["language"] });
  test("empty values are N/A", () => {
    expect(ch.formatFieldValue(host, "x", null)).toBe("N/A");
    expect(ch.formatFieldValue(host, "x", undefined)).toBe("N/A");
    expect(ch.formatFieldValue(host, "x", "")).toBe("N/A");
  });
  test("area is formatted with grouping and 2 decimals; NaN falls through", () => {
    expect(ch.formatFieldValue(host, "maydon", "12345.678")).toBe("12,345.68");
    expect(ch.formatFieldValue(host, "Area_ha", 3)).toBe("3");
    expect(ch.formatFieldValue(host, "maydon", "abc")).toBe("abc");
  });
  test("dates are formatted; invalid dates fall through", () => {
    expect(ch.formatFieldValue(host, "sana", "2024-03-05T12:00:00Z")).toMatch(/Mar 2024/);
    expect(ch.formatFieldValue(host, "start_date", "garbage")).toBe("garbage");
    const boom = { toString: (): string => "obj" };
    expect(ch.formatFieldValue(host, "date", boom)).toBe("obj");
  });
  test("viloyat, tuman and crop fields are translated", () => {
    expect(ch.formatFieldValue(host, "viloyat", "A")).toBe("region:A:en");
    expect(ch.formatFieldValue(host, "tuman", "B")).toBe("district:B:en");
    for (const f of ["turi", "uzspace", "ekin_turi", "crop_type"]) {
      expect(ch.formatFieldValue(host, f, "Paxta")).toBe("crop:Paxta:en");
    }
    expect(ch.formatFieldValue(host, "other", 5)).toBe("5");
  });
});

describe("getStatusValueForRecord", () => {
  const langs: Array<[string, string[]]> = [
    ["en", ["Excellent", "Good", "Moderate", "Poor"]],
    ["ru", ["Очень хороший", "Хороший", "Средний", "Низкий"]],
    ["uz_lat", ["Juda yaxshi", "Yaxshi", "O'rta", "Past"]],
    ["uz", ["Жуда яхши", "Яхши", "Ўрта", "Паст"]],
  ];
  const keys = ["juda_yaxshi", "yaxshi", "orta", "past"];
  test.each(langs)("localizes categories for %s", (lang, labels) => {
    const host = wired({ language: lang as AgriGraffWidgetState["language"] }, { getStatusFieldNameForCurrentDate: (): string => "st" });
    keys.forEach((k, i) => {
      expect(ch.getStatusValueForRecord(host, { st: ` ${k.toUpperCase().replace("_", " ")} ` })).toBe(
        k === "juda_yaxshi" || k === "yaxshi" || k === "orta" || k === "past" ? labels[i] : "",
      );
    });
  });
  test("N/A paths and unknown categories", () => {
    const none = wired({}, { getStatusFieldNameForCurrentDate: (): null => null });
    expect(ch.getStatusValueForRecord(none, { st: "x" })).toBe("N/A");
    const host = wired({}, { getStatusFieldNameForCurrentDate: (): string => "st", formatFieldValue: jest.fn((f: string, v: unknown) => `fmt:${f}:${String(v)}`) });
    expect(ch.getStatusValueForRecord(host, {})).toBe("N/A");
    expect(ch.getStatusValueForRecord(host, { st: "" })).toBe("N/A");
    expect(ch.getStatusValueForRecord(host, { st: "mystery" })).toBe("fmt:st:mystery");
    expect(ch.getStatusValueForRecord(host, { st: "other" })).toBe("9-Other".length ? "9-Other" : "");
  });
});

describe("initializeMapConnection", () => {
  const goodFields = ["uniqueid", "tuman", "f_name", "f_inn", "maydon", "turi", "vh", "viloyat", "yil"].map((name) => ({ name }));
  const layer = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
    loaded: true,
    fields: goodFields,
    title: "T",
    load: jest.fn(() => Promise.resolve()),
    ...over,
  });
  const view = asView({ view: { id: "v" } });

  test("does nothing when unmounted", async () => {
    const host = wired({}, { _isMounted: false });
    await ch.initializeMapConnection(host, view);
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("fails when the table layer cannot be loaded", async () => {
    mockGetTable.mockRejectedValue(new Error("x"));
    const host = wired();
    await ch.initializeMapConnection(host, view);
    expect(host.state.connectionStatus).toBe("failed");
  });
  test("fails when layer.load rejects", async () => {
    mockGetTable.mockResolvedValue({ layer: layer({ loaded: false, load: jest.fn(() => Promise.reject(new Error("nope"))) }) });
    const host = wired();
    await ch.initializeMapConnection(host, view);
    expect(host.state.error).toContain("nope");
  });
  test("fails when layer has no fields, no configured fields, or missing required fields", async () => {
    mockGetTable.mockResolvedValue({ layer: layer({ fields: [] }) });
    const a = wired();
    await ch.initializeMapConnection(a, view);
    expect(a.state.connectionStatus).toBe("failed");
    mockGetTable.mockResolvedValue({ layer: layer() });
    const b = wired({}, { getConfiguredFilterFields: (): string[] => [] });
    await ch.initializeMapConnection(b, view);
    expect(b.state.connectionStatus).toBe("failed");
    mockGetTable.mockResolvedValue({ layer: layer({ fields: [{ name: "uniqueid" }] }) });
    const c = wired();
    await ch.initializeMapConnection(c, view);
    expect(c.state.error).toContain("missing required fields");
    expect(c.state.error).toContain("tuman");
  });
  test("connects, attaches hover prefetch, resolves spatial layers and loads filters", async () => {
    const fl = layer();
    mockGetTable.mockResolvedValue({ layer: fl });
    const spatial = [{ id: "s" }];
    const host = wired({}, { resolveFeatureLayersFromUseDataSources: jest.fn(() => Promise.resolve(spatial)) });
    await ch.initializeMapConnection(host, view);
    await flush();
    expect(host.state.connectionStatus).toBe("connected");
    expect(host.state.featureLayer).toBe(fl);
    expect(host.state.configuredFields).toEqual(["tuman"]);
    expect(asMock(host.attachMapHoverPrefetch)).toHaveBeenCalled();
    expect(host.state.spatialClickLayers).toBe(spatial);
    expect(asMock(host.fetchAndStoreRegionDistrictMappings)).toHaveBeenCalled();
    expect(asMock(host.buildViloyatKeyToLayerIndex)).toHaveBeenCalled();
    expect(asMock(host.fetchFilterOptions)).toHaveBeenCalled();
  });
  test("tolerates prefetch and spatial resolution failures", async () => {
    mockGetTable.mockResolvedValue({ layer: layer() });
    const host = wired(
      {},
      {
        attachMapHoverPrefetch: jest.fn(() => {
          throw new Error("p");
        }),
        resolveFeatureLayersFromUseDataSources: jest.fn(() => Promise.reject(new Error("s"))),
      },
    );
    await ch.initializeMapConnection(host, view);
    await flush();
    expect(asMock(host.fetchFilterOptions)).toHaveBeenCalled();
  });
});

describe("selection graphics", () => {
  const feature = (): { geometry: { type: string; extent?: { expand: jest.Mock } }; clone: jest.Mock; symbol?: unknown } => {
    const f = {
      geometry: { type: "polygon", extent: { expand: jest.fn(() => "expanded") } },
      clone: jest.fn(() => ({ symbol: undefined as unknown })),
    };
    return f;
  };
  test("addSelectionGlow adds halo then core with symbols", () => {
    const addMany = jest.fn();
    const f = feature();
    ch.addSelectionGlow(wired(), { graphics: { addMany } } as unknown as __esri.MapView, f as unknown as __esri.Graphic);
    const [added] = addMany.mock.calls[0] as Array<Array<{ symbol: string }>>;
    expect(added.map((g) => g.symbol)).toEqual(["sym:polygon:true", "sym:polygon:false"]);
  });
  test("highlightFeature clears, glows and animates to the feature", async () => {
    const goTo = jest.fn(() => Promise.resolve());
    const mapView = asView({ view: { goTo } });
    const host = wired();
    const f = feature();
    await ch.highlightFeature(host, f as unknown as __esri.Graphic, mapView);
    expect(mockClearGraphics).toHaveBeenCalled();
    expect(asMock(host.addSelectionGlow)).toHaveBeenCalled();
    expect(goTo).toHaveBeenCalledWith("expanded", expect.objectContaining({ duration: 700 }));
  });
  test("highlightFeature swallows goTo and glow failures", async () => {
    const f = feature();
    const throwingGoTo = asView({
      view: {
        goTo: (): void => {
          throw new Error("g");
        },
      },
    });
    await expect(ch.highlightFeature(wired(), f as unknown as __esri.Graphic, throwingGoTo)).resolves.toBeUndefined();
    const failingGlow = wired({}, {
      addSelectionGlow: jest.fn(() => {
        throw new Error("glow");
      }),
    });
    await expect(ch.highlightFeature(failingGlow, f as unknown as __esri.Graphic, asView({ view: {} }))).resolves.toBeUndefined();
  });
});

describe("getConfiguredFilterFields / refreshFiltersFromConfig", () => {
  test("defaults to required fields when no config", () => {
    const host = makeStubHost({}, { props: { config: {} } });
    expect(ch.getConfiguredFilterFields(host)).toContain("uniqueid");
  });
  test("uses data source id from state or props", () => {
    const cfg = { filterFields: { ds1: ["a"], ds2: ["b", "c"] } };
    const a = makeStubHost({ dataSource: { id: "ds2" } as unknown as AgriGraffWidgetState["dataSource"] }, { props: { config: cfg } });
    expect(ch.getConfiguredFilterFields(a)).toEqual(["b", "c"]);
    const b = makeStubHost({}, { props: { config: cfg, useDataSources: [{ dataSourceId: "ds1" }] } });
    expect(ch.getConfiguredFilterFields(b)).toEqual(["a"]);
    const c = makeStubHost({}, { props: { config: cfg, useDataSources: [{ dataSourceId: "zz" }] } });
    expect(ch.getConfiguredFilterFields(c)).toEqual([]);
    const d = makeStubHost({}, { props: { config: cfg } });
    expect(ch.getConfiguredFilterFields(d)).toEqual([]);
  });
  test("refresh builds empty option and filter maps, or clears", () => {
    const host = wired({}, { getConfiguredFilterFields: (): string[] => ["a", "b"] });
    ch.refreshFiltersFromConfig(host);
    expect(host.state.configuredFields).toEqual(["a", "b"]);
    expect(host.state.filterOptions).toEqual({ a: [], b: [] });
    expect(host.state.localFilters).toEqual({ a: "", b: "" });
    const none = wired({ localFilters: { x: "1" } }, { getConfiguredFilterFields: (): string[] => [] });
    ch.refreshFiltersFromConfig(none);
    expect(none.state.localFilters).toEqual({});
  });
});

describe("resolveFeatureLayerFromDataSource", () => {
  beforeEach(() => {
    mockGetQueryable.mockReset();
    mockGetDataSource.mockReset();
  });
  const mapView = (layers: unknown[] = [], jlvs: unknown[] = []): JimuMapView =>
    asView({ view: { map: { layers: { toArray: (): unknown[] => layers } } }, getAllJimuLayerViews: (): unknown[] => jlvs });
  const hostWith = (useDs: unknown): GraffWidgetHost => makeStubHost({}, { props: { useDataSources: useDs ? [useDs] : [] } });

  test("null when no map or no data source id", async () => {
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), asView({}))).toBeNull();
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith(null), mapView())).toBeNull();
  });
  test("resolves via jimu layer view (dataSourceId or root id)", async () => {
    mockGetQueryable.mockImplementation((l: unknown) => l);
    const lyr = { id: "L" };
    const found = await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView([], [{ layerDataSourceId: "a", layer: lyr }]));
    expect(found).toBe(lyr);
    const viaRoot = await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a", rootDataSourceId: "r" }), mapView([], [{ dataSourceId: "r", layer: lyr }]));
    expect(viaRoot).toBe(lyr);
    const override = await ch.resolveFeatureLayerFromDataSource(hostWith(null), mapView([], [{ layer: { dataSourceId: "o" } }]), { dataSourceId: "o" } as never);
    expect(override).toEqual({ dataSourceId: "o" });
  });
  test("resolves via data source getLayer, ds.layer and map url match", async () => {
    mockGetQueryable.mockImplementation((l: unknown) => (l && (l as { ok?: boolean }).ok ? l : null));
    const viaGetLayer = { ok: true, n: 1 };
    mockGetDataSource.mockReturnValue({ getLayer: (): Promise<unknown> => Promise.resolve(viaGetLayer) });
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView())).toBe(viaGetLayer);
    const dsLayer = { ok: true, n: 2 };
    mockGetDataSource.mockReturnValue({ layer: dsLayer });
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView())).toBe(dsLayer);
    const mapLayer = { ok: true, url: "http://x", n: 3 };
    mockGetDataSource.mockReturnValue({ url: "http://x" });
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView([{ url: "http://other" }, mapLayer]))).toBe(mapLayer);
  });
  test("null when nothing matches or the data source throws", async () => {
    mockGetQueryable.mockReturnValue(null);
    mockGetDataSource.mockReturnValue({ url: "http://x" });
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView([{ url: "http://x" }]))).toBeNull();
    mockGetDataSource.mockReturnValue(undefined);
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView())).toBeNull();
    mockGetDataSource.mockImplementation(() => {
      throw new Error("ds");
    });
    expect(await ch.resolveFeatureLayerFromDataSource(hostWith({ dataSourceId: "a" }), mapView())).toBeNull();
  });
  test("resolveFeatureLayersFromUseDataSources collects only resolved layers", async () => {
    const host = makeStubHost(
      {},
      {
        props: { useDataSources: [{ dataSourceId: "a" }, { dataSourceId: "b" }] },
        resolveFeatureLayerFromDataSource: jest.fn((_v: unknown, ds: { dataSourceId: string }) => Promise.resolve(ds.dataSourceId === "a" ? { id: "A" } : null)),
      },
    );
    expect(await ch.resolveFeatureLayersFromUseDataSources(host, mapView())).toEqual([{ id: "A" }]);
    const empty = makeStubHost({}, { props: {} });
    expect(await ch.resolveFeatureLayersFromUseDataSources(empty, mapView())).toEqual([]);
  });
});

describe("viloyat layer index", () => {
  const multiLayer = (rows: Array<string | null>, over: Record<string, unknown> = {}): __esri.FeatureLayer =>
    ({
      fields: [{ name: "viloyat" }],
      load: jest.fn(() => Promise.resolve()),
      createQuery: (): Record<string, unknown> => ({}),
      queryFeatures: jest.fn(() => Promise.resolve({ features: rows.map((v) => ({ attributes: { viloyat: v } })) })),
      ...over,
    }) as unknown as __esri.FeatureLayer;

  test("multiple layers: first layer wins per key; failing layer is skipped; loads when no fields", async () => {
    const l0 = multiLayer(["A", null]);
    const l1 = multiLayer(["A", "B"], { fields: [] });
    const l2 = multiLayer([], { queryFeatures: jest.fn(() => Promise.reject(new Error("q"))) });
    const host = wired({ featureLayers: [l0, l1, l2] });
    await ch.buildViloyatKeyToLayerIndex(host);
    expect(host._viloyatKeyToLayerIndex).toEqual({ a: 0, b: 1 });
    expect((l1 as unknown as { load: jest.Mock }).load).toHaveBeenCalled();
  });
  test("single layer uses bootstrap rows; failure leaves empty map", async () => {
    mockBootstrap.mockResolvedValue({ regionDistrictRows: [{ viloyat: "A" }, { viloyat: "A" }, { viloyat: "B" }] });
    const host = wired({ featureLayer: multiLayer([]) });
    await ch.buildViloyatKeyToLayerIndex(host);
    expect(host._viloyatKeyToLayerIndex).toEqual({ a: 0, b: 0 });
    mockBootstrap.mockRejectedValue(new Error("x"));
    await ch.buildViloyatKeyToLayerIndex(host);
    expect(host._viloyatKeyToLayerIndex).toEqual({});
  });
  test("no layers yields empty map", async () => {
    const host = wired();
    await ch.buildViloyatKeyToLayerIndex(host);
    expect(host._viloyatKeyToLayerIndex).toEqual({});
  });
  test("getFeatureLayerForViloyat picks mapped layer, else the active one", () => {
    const l0 = multiLayer([]);
    const l1 = multiLayer([]);
    const host = wired({ featureLayers: [l0, l1], featureLayer: l0 }, { _viloyatKeyToLayerIndex: { b: 1 } });
    expect(ch.getFeatureLayerForViloyat(host, "B")).toBe(l1);
    expect(ch.getFeatureLayerForViloyat(host, "zz")).toBe(l0);
    expect(ch.getFeatureLayerForViloyat(wired(), "B")).toBeUndefined();
    const single = wired({ featureLayer: l0 }, { _viloyatKeyToLayerIndex: {} });
    expect(ch.getFeatureLayerForViloyat(single, "")).toBe(l0);
  });
});

describe("ensureInitialization", () => {
  test("loads filter options once connected without data", () => {
    const host = wired({ featureLayer: {} as __esri.FeatureLayer, connectionStatus: "connected", initialDataLoaded: false });
    ch.ensureInitialization(host);
    expect(host.state.loading).toBe(true);
    expect(asMock(host.fetchFilterOptions)).toHaveBeenCalled();
  });
  test("retries when failed at max attempts", () => {
    const host = wired({ connectionStatus: "failed", mapConnectionAttempts: 3 }, { MAX_CONNECTION_ATTEMPTS: 3 });
    ch.ensureInitialization(host);
    expect(asMock(host.retryMapConnection)).toHaveBeenCalled();
  });
  test("no-ops when unmounted or nothing to do", () => {
    const gone = wired({ connectionStatus: "failed" }, { _isMounted: false, MAX_CONNECTION_ATTEMPTS: 0 });
    ch.ensureInitialization(gone);
    expect(asMock(gone.retryMapConnection)).not.toHaveBeenCalled();
    const idle = wired({ connectionStatus: "idle" });
    ch.ensureInitialization(idle);
    expect(asMock(idle.fetchFilterOptions)).not.toHaveBeenCalled();
  });
});
