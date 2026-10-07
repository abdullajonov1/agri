jest.mock("jimu-arcgis", () => ({ JimuMapView: class {} }));
jest.mock("jimu-core", () => ({
  DataSourceManager: { getInstance: jest.fn() },
  DataSource: class {},
  QueriableDataSource: class {},
}));
jest.mock("../../../../../../gis/feature-layer-data", () => ({
  safeLoadMapImageTree: jest.fn(),
  getQueryableLayer: jest.fn(),
}));
jest.mock("../../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: jest.fn(),
}));
jest.mock("../../../../../../data/agri-query-gateway", () => ({
  dedupedQueryFeatures: jest.fn(),
}));
jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  getAgriVegetationIndicesLayer: jest.fn(),
}));
jest.mock("../../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import type { JimuMapView } from "jimu-arcgis";
import type { DataSource, IMDataSourceInfo, IMUseDataSource } from "jimu-core";
import { DataSourceManager } from "jimu-core";
import { getQueryableLayer, safeLoadMapImageTree } from "../../../../../../gis/feature-layer-data";
import { getAgriTableDataLayer } from "../../../../../../gis/agri-table-data-source";
import { dedupedQueryFeatures } from "../../../../../../data/agri-query-gateway";
import { getAgriVegetationIndicesLayer } from "../../../../../../gis/agri-vegetation-data-source";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import {
  buildLayerViloyatIndex,
  detectNdviStatusDateFieldsFromLayer,
  fetchFilterOptions,
  flDistinctFromLayer,
  getUniqueValues,
  onDataSourceCreated,
  onDataSourceInfoChange,
  resolveFeatureLayerFromOneUseDataSource,
  resolveFeatureLayersFromUseDataSources,
  resolveSpatialMapLayers,
  retryMapConnection,
  runInitialDataLoad,
} from "./connection-layer";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const asLayer = (o: object): __esri.FeatureLayer => o as unknown as __esri.FeatureLayer;
const useDs = (o: { dataSourceId?: string; rootDataSourceId?: string }): IMUseDataSource => o as unknown as IMUseDataSource;
const asView = (o: object): JimuMapView => o as unknown as JimuMapView;

beforeEach(() => {
  jest.resetAllMocks();
  m(getQueryableLayer).mockImplementation((l: unknown) => ((l as { q?: boolean } | undefined)?.q ? l : null));
  m(safeLoadMapImageTree).mockResolvedValue(undefined);
  m(getAgriVegetationIndicesLayer).mockResolvedValue({});
});

describe("resolveFeatureLayerFromOneUseDataSource", () => {
  const host = (): FakeHost => makeFakeHost();

  it("returns null without a dataSourceId", async () => {
    expect(await resolveFeatureLayerFromOneUseDataSource(host(), useDs({}), null)).toBeNull();
  });

  it("resolves via the JimuLayerView matched by dataSourceId or root id", async () => {
    const layer = { q: true };
    const view = asView({
      view: { map: {} },
      getAllJimuLayerViews: () => [{ layerDataSourceId: "root", layer }],
    });
    const got = await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "child", rootDataSourceId: "root" }), view);
    expect(got).toBe(layer);
  });

  it("resolves via a MapImage leaf sublayer, skipping parents with nested children", async () => {
    const leaf = { title: "leaf", createQuery: jest.fn() };
    const parent = { sublayers: { toArray: () => [{}] } };
    const root = { allSublayers: { toArray: () => [parent, leaf] } };
    const view = asView({
      view: { map: {} },
      getAllJimuLayerViews: () => [{ dataSourceId: "d", layer: root }],
    });
    const got = await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "d" }), view);
    expect(got).toBe(leaf);
  });

  it("falls back to ds.getLayer", async () => {
    const lyr = { q: true };
    m(DataSourceManager.getInstance).mockReturnValue({ getDataSource: () => ({ getLayer: () => Promise.resolve(lyr) }) });
    expect(await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "d" }), null)).toBe(lyr);
  });

  it("falls back to matching a map layer by data source url", async () => {
    const cand = { url: "u", q: true };
    m(DataSourceManager.getInstance).mockReturnValue({ getDataSource: () => ({ url: "u" }) });
    const view = asView({ view: { map: { layers: { toArray: () => [{ url: "x" }, cand] } } }, getAllJimuLayerViews: () => [] });
    expect(await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "d" }), view)).toBe(cand);
  });

  it("returns null when nothing resolves, and when lookups throw", async () => {
    m(DataSourceManager.getInstance).mockReturnValue({ getDataSource: () => null });
    expect(await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "d" }), null)).toBeNull();
    m(DataSourceManager.getInstance).mockImplementation(() => { throw new Error("boom"); });
    m(safeLoadMapImageTree).mockRejectedValue(new Error("load"));
    expect(await resolveFeatureLayerFromOneUseDataSource(host(), useDs({ dataSourceId: "d" }), null)).toBeNull();
  });
});

describe("resolveSpatialMapLayers / resolveFeatureLayersFromUseDataSources", () => {
  it("resolves each use-data-source, de-duplicates and drops nulls", async () => {
    const a = asLayer({ id: "a" });
    const resolve = jest.fn()
      .mockResolvedValueOnce(a).mockResolvedValueOnce(a).mockResolvedValueOnce(null);
    const h = makeFakeHost({
      resolveFeatureLayerFromOneUseDataSource: resolve,
      props: { useDataSources: [useDs({ dataSourceId: "1" }), useDs({ dataSourceId: "2" }), useDs({ dataSourceId: "3" })] as never },
    });
    expect(await resolveSpatialMapLayers(h, null)).toEqual([a]);
  });

  it("uses asMutable() when present and tolerates missing sources", async () => {
    const mutable = jest.fn(() => [useDs({ dataSourceId: "1" })]);
    const resolve = jest.fn(() => Promise.resolve(null));
    const h = makeFakeHost({
      resolveFeatureLayerFromOneUseDataSource: resolve,
      props: { useDataSources: { asMutable: mutable } as never },
    });
    expect(await resolveSpatialMapLayers(h, null)).toEqual([]);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(await resolveSpatialMapLayers(makeFakeHost(), null)).toEqual([]);
  });

  it("loads the singleton agri table layer or returns [] on failure", async () => {
    const layer = { url: "u" };
    m(getAgriTableDataLayer).mockResolvedValueOnce({ layer });
    expect(await resolveFeatureLayersFromUseDataSources(makeFakeHost(), null)).toEqual([layer]);
    m(getAgriTableDataLayer).mockRejectedValueOnce(new Error("x"));
    expect(await resolveFeatureLayersFromUseDataSources(makeFakeHost(), null)).toEqual([]);
  });
});

describe("buildLayerViloyatIndex", () => {
  it("indexes viloyat keys per layer and reverse index, tolerating failures", async () => {
    const l1 = asLayer({ id: "1" });
    const l2 = asLayer({ id: "2" });
    const l3 = asLayer({ id: "3" });
    m(dedupedQueryFeatures)
      .mockResolvedValueOnce({ features: [{ attributes: { viloyat: "Andijon" } }, { attributes: { viloyat: null } }, { attributes: { viloyat: "Toshkent" } }] })
      .mockResolvedValueOnce({ features: [{ attributes: { viloyat: "ANDIJON" } }] })
      .mockRejectedValueOnce(new Error("fail"));
    const h = makeFakeHost({
      getLayerKey: (l) => (l as unknown as { id: string }).id,
      state: { featureLayers: [l1, l2, l3] },
    });
    await buildLayerViloyatIndex(h);
    expect(h._layerToViloyatKeys).toEqual({ "1": ["andijon", "toshkent"], "2": ["andijon"], "3": [] });
    expect(h._viloyatKeyToLayerKeys).toEqual({ andijon: ["1", "2"], toshkent: ["1"] });
  });

  it("falls back to the single featureLayer", async () => {
    m(dedupedQueryFeatures).mockResolvedValue({ features: [] });
    const h = makeFakeHost({ getLayerKey: () => "k", state: { featureLayer: asLayer({}), featureLayers: [] } });
    await buildLayerViloyatIndex(h);
    expect(h._layerToViloyatKeys).toEqual({ k: [] });
  });
});

describe("detectNdviStatusDateFieldsFromLayer", () => {
  const withFields = (names: string[], init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      ...init,
      state: { featureLayer: asLayer({ fields: names.map((name) => ({ name })) }), featureLayers: [], ...init.state },
    });

  it("does nothing without a layer", () => {
    const h = makeFakeHost();
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.setState).not.toHaveBeenCalled();
  });

  it("normalises dates, sorts them and selects the latest by default", () => {
    const h = withFields(["objectid", "status_2025_06_12", "STATUS_2025_05_01", "status_2025_06_12", "status_foo_bar"]);
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.state.ndviDateOptions).toEqual(["2025-05-01", "2025-06-12", "foo-bar"].sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      return Number.isNaN(ta) || Number.isNaN(tb) ? a.localeCompare(b) : ta - tb;
    }));
    expect(h._ndviDateFieldMap["2025-06-12"]).toBe("status_2025_06_12");
  });

  it("keeps a still-valid current date", () => {
    const h = withFields(["status_2025_06_12", "status_2025_07_01"], { state: { ndviDate: "2025-06-12" } });
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.state.ndviDate).toBe("2025-06-12");
    expect(h.state.ndviDateOptions).toEqual(["2025-06-12", "2025-07-01"]);
  });

  it("falls back to the latest when the current date is gone", () => {
    const h = withFields(["status_2025_06_12", "status_2025_07_01"], { state: { ndviDate: "2020-01-01" } });
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.state.ndviDate).toBe("2025-07-01");
  });

  it("honours a custom prefix and resets when no fields match", () => {
    const h = withFields(["x_20250101"], {
      props: { config: { polygonStatusPrefix: "x_" } },
    });
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.state.ndviDateOptions).toEqual(["2025-01-01"]);
    const none = withFields(["other"]);
    detectNdviStatusDateFieldsFromLayer(none);
    expect(none._ndviDateFieldMap).toEqual({});
    expect(none.state.ndviDateOptions).toEqual([]);
    expect(none.state.ndviDate).toBe("");
  });

  it("does not setState when unmounted", () => {
    const h = withFields(["status_2025_06_12"], { _isMounted: false });
    detectNdviStatusDateFieldsFromLayer(h);
    expect(h.setState).not.toHaveBeenCalled();
    expect(h._ndviDateFieldMap).toEqual({ "2025-06-12": "status_2025_06_12" });
  });
});

describe("onDataSourceCreated", () => {
  const ds = (id: string, listen = jest.fn()): DataSource => ({ id, setListenSelection: listen }) as unknown as DataSource;
  const settle = async (): Promise<void> => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); };

  it("adopts the first data source as primary and disables selection listening", async () => {
    const listen = jest.fn();
    const h = makeFakeHost({ initializeDataSourceOnlyConnection: jest.fn(() => Promise.resolve()) });
    onDataSourceCreated(h, ds("a", listen));
    await settle();
    expect(h._primaryDataSourceId).toBe("a");
    expect(listen).toHaveBeenCalledWith(false);
    expect(h.initializeDataSourceOnlyConnection).toHaveBeenCalled();
  });

  it("ignores non-primary data sources", () => {
    const h = makeFakeHost({ _primaryDataSourceId: "a" });
    onDataSourceCreated(h, ds("b"));
    expect(h.setState).not.toHaveBeenCalled();
  });

  it("starts the initial data load when already connected", async () => {
    const h = makeFakeHost({ runInitialDataLoad: jest.fn(() => Promise.resolve()), state: { connectionStatus: "connected" } });
    onDataSourceCreated(h, ds("a"));
    await settle();
    expect(h.runInitialDataLoad).toHaveBeenCalled();
  });

  it("waits for the map connection when a map widget is linked", async () => {
    const h = makeFakeHost({
      initializeDataSourceOnlyConnection: jest.fn(),
      runInitialDataLoad: jest.fn(),
      props: { useMapWidgetIds: ["m"] as never },
    });
    onDataSourceCreated(h, ds("a"));
    await settle();
    expect(h.initializeDataSourceOnlyConnection).not.toHaveBeenCalled();
    expect(h.runInitialDataLoad).not.toHaveBeenCalled();
    expect(h.state.dataSource).toBeDefined();
  });
});

describe("onDataSourceInfoChange", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const info = (o: object): IMDataSourceInfo => o as unknown as IMDataSourceInfo;

  it("debounces refetches when records arrive", () => {
    const h = makeFakeHost({ fetchDataWithCurrentState: jest.fn(() => Promise.resolve()), state: { connectionStatus: "connected" } });
    onDataSourceInfoChange(h, info({ records: [] }));
    onDataSourceInfoChange(h, info({ records: [] }));
    jest.advanceTimersByTime(299);
    expect(h.fetchDataWithCurrentState).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2);
    expect(h.fetchDataWithCurrentState).toHaveBeenCalledTimes(1);
  });

  it("ignores unmounted, disconnected, empty and record-less info", () => {
    const fetchFn = jest.fn(() => Promise.resolve());
    const connected = { connectionStatus: "connected" as const };
    onDataSourceInfoChange(makeFakeHost({ _isMounted: false, fetchDataWithCurrentState: fetchFn, state: connected }), info({ records: [] }));
    onDataSourceInfoChange(makeFakeHost({ fetchDataWithCurrentState: fetchFn }), info({ records: [] }));
    onDataSourceInfoChange(makeFakeHost({ fetchDataWithCurrentState: fetchFn, state: connected }), null);
    onDataSourceInfoChange(makeFakeHost({ fetchDataWithCurrentState: fetchFn, state: connected }), info({}));
    jest.advanceTimersByTime(1000);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("skips the fetch when unmounted before the timer fires", () => {
    const h = makeFakeHost({ fetchDataWithCurrentState: jest.fn(() => Promise.resolve()), state: { connectionStatus: "connected" } });
    onDataSourceInfoChange(h, info({ records: [] }));
    h._isMounted = false;
    jest.advanceTimersByTime(400);
    expect(h.fetchDataWithCurrentState).not.toHaveBeenCalled();
  });
});

describe("retryMapConnection", () => {
  it("resets the connection state", () => {
    const h = makeFakeHost({ state: { connectionStatus: "failed", error: "x", mapConnectionAttempts: 3 } });
    retryMapConnection(h);
    expect(h.state.connectionStatus).toBe("connecting");
    expect(h.state.mapConnectionAttempts).toBe(0);
    expect(h.state.error).toBeNull();
  });
});

describe("runInitialDataLoad", () => {
  const loadHost = (init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      buildLayerViloyatIndex: jest.fn(() => Promise.resolve()),
      fetchFilterOptions: jest.fn(() => Promise.resolve()),
      fetchAndStoreRegionDistrictMappings: jest.fn(() => Promise.resolve()),
      applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
      warmYearRegionMapImages: jest.fn(),
      fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
      broadcastFilterState: jest.fn(),
      state: { connectionStatus: "connected" },
      ...init,
    });

  it("is a no-op when not connected, unmounted, or already ready", async () => {
    await runInitialDataLoad(makeFakeHost());
    const a = loadHost({ _isMounted: false });
    await runInitialDataLoad(a);
    const b = loadHost({ _readyFired: true });
    await runInitialDataLoad(b);
    expect(a.applyMapFiltersOptimized).not.toHaveBeenCalled();
    expect(b.applyMapFiltersOptimized).not.toHaveBeenCalled();
  });

  it("runs the pipeline once, fires ready, clears the timer and de-duplicates concurrent calls", async () => {
    const timer = setTimeout(() => undefined, 10000);
    const h = loadHost({ initializationTimer: timer });
    const p1 = runInitialDataLoad(h);
    const p2 = runInitialDataLoad(h);
    expect(p2).toBe(p1);
    await p1;
    expect(h.buildLayerViloyatIndex).toHaveBeenCalledTimes(1);
    expect(h.warmYearRegionMapImages).toHaveBeenCalled();
    expect(h._readyFired).toBe(true);
    expect(h.initializationTimer).toBeNull();
    expect(h.broadcastFilterState).toHaveBeenCalledTimes(1);
    expect(h._initialDataLoadPromise).toBeNull();
    expect(getAgriVegetationIndicesLayer).toHaveBeenCalled();
  });

  it("stops after the parallel loads when unmounted meanwhile", async () => {
    const h = loadHost();
    m(h.fetchFilterOptions).mockImplementation(() => { h._isMounted = false; return Promise.resolve(); });
    await runInitialDataLoad(h);
    expect(h.applyMapFiltersOptimized).not.toHaveBeenCalled();
    expect(h._readyFired).toBe(false);
  });
});

describe("getUniqueValues / flDistinctFromLayer / fetchFilterOptions", () => {
  it("returns [] without layers", async () => {
    expect(await getUniqueValues(makeFakeHost(), "tuman")).toEqual([]);
  });

  it("merges distinct values across layers, numeric-sorting yil", async () => {
    const values: Record<string, string[]> = { a: ["10", "2"], b: ["2", "1"] };
    const h = makeFakeHost({
      flDistinctFromLayer: jest.fn((l: __esri.FeatureLayer) => Promise.resolve(values[(l as unknown as { id: string }).id])),
      state: { featureLayers: [asLayer({ id: "a" }), asLayer({ id: "b" })] },
    });
    expect(await getUniqueValues(h, "yil")).toEqual(["1", "2", "10"]);
    expect(await getUniqueValues(h, "tuman")).toEqual(["1", "10", "2"]);
  });

  it("flDistinctFromLayer filters blanks, sorts and swallows errors", async () => {
    const h = makeFakeHost();
    m(dedupedQueryFeatures).mockResolvedValueOnce({ features: [{ attributes: { yil: 2024 } }, { attributes: { yil: "" } }, { attributes: { yil: null } }, { attributes: { yil: 2023 } }, { attributes: { yil: 2024 } }] });
    expect(await flDistinctFromLayer(h, asLayer({}), "yil", "")).toEqual(["2023", "2024"]);
    expect(m(dedupedQueryFeatures).mock.calls[0][1]).toMatchObject({ where: "1=1", orderByFields: ["yil ASC"] });
    m(dedupedQueryFeatures).mockResolvedValueOnce({ features: [{ attributes: { n: "b" } }, { attributes: { n: "a" } }] });
    expect(await flDistinctFromLayer(h, asLayer({}), "n", "x=1")).toEqual(["a", "b"]);
    m(dedupedQueryFeatures).mockRejectedValueOnce(new Error("x"));
    expect(await flDistinctFromLayer(h, asLayer({}), "n", "x=1")).toEqual([]);
  });

  it("fetchFilterOptions picks latest year and resets selections", async () => {
    const h = makeFakeHost({
      getUniqueValues: jest.fn(() => Promise.resolve(["2024", "2022", "2023"])),
      state: { connectionStatus: "connected", viloyat: "V", tuman: "T", vh: "good", yil: "" },
    });
    await fetchFilterOptions(h);
    expect(h.state.yilOptions).toEqual(["2022", "2023", "2024"]);
    expect(h.state.yil).toBe("2024");
    expect(h.state.viloyat).toBe("");
    expect(h.state.tuman).toBe("");
    expect(h.state.vh).toBe("");
    expect(h.state.loadingFilters).toBe(false);
  });

  it("fetchFilterOptions keeps a still-valid year, and falls back to string compare for non-numeric", async () => {
    const h = makeFakeHost({
      getUniqueValues: jest.fn(() => Promise.resolve(["b", "a"])),
      state: { connectionStatus: "connected", yil: "a" },
    });
    await fetchFilterOptions(h);
    expect(h.state.yilOptions).toEqual(["a", "b"]);
    expect(h.state.yil).toBe("a");
  });

  it("fetchFilterOptions reports failures and guards state", async () => {
    const h = makeFakeHost({
      getUniqueValues: jest.fn(() => Promise.reject(new Error("nope"))),
      state: { connectionStatus: "connected" },
    });
    await fetchFilterOptions(h);
    expect(h.state.error).toBe("Failed to fetch initial filters: nope");
    expect(h.state.loadingFilters).toBe(false);

    const off = makeFakeHost({ _isMounted: false, state: { connectionStatus: "connected" } });
    await fetchFilterOptions(off);
    expect(off.setState).not.toHaveBeenCalled();
    const disc = makeFakeHost();
    await fetchFilterOptions(disc);
    expect(disc.setState).not.toHaveBeenCalled();
  });

  it("fetchFilterOptions drops results when unmounted mid-flight", async () => {
    const h = makeFakeHost({
      getUniqueValues: jest.fn(() => { h._isMounted = false; return Promise.resolve(["2024"]); }),
      state: { connectionStatus: "connected" },
    });
    await fetchFilterOptions(h);
    expect(h.state.yilOptions).not.toEqual(["2024"]);
  });
});
