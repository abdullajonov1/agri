jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockIsMapImage = jest.fn((): boolean => false);
jest.mock("../../../../gis/feature-layer-data", () => ({
  isMapImageOwnedLayer: (): boolean => mockIsMapImage(),
}));
const mockQueryIds = jest.fn();
jest.mock("../../../../gis/agri-table-data-source", () => ({
  buildSpatialJoinWhere: (ids: string[]): string => `uniqueid IN (${ids.join(",")})`,
  queryAgriUniqueIdsForWhere: (w: string): unknown => mockQueryIds(w),
}));

import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import * as dh from "./data-handlers";

type Regional = AgriGraffWidgetState["regionalFilters"];
const reg = (r: Partial<Regional>): Regional => ({ viloyat: "", tuman: "", yil: "", uzspace: "", vh: "", ...r });
const ev = (detail: Record<string, unknown> | null): CustomEvent => ({ detail }) as unknown as CustomEvent;

interface FakeLayer {
  objectIdField?: string;
  fields?: Array<{ name: string }>;
  definitionExpression?: string;
  createQuery: jest.Mock;
  queryFeatures: jest.Mock;
  queryFeatureCount: jest.Mock;
}
const makeLayer = (over: Partial<FakeLayer> = {}): FakeLayer => ({
  objectIdField: "OID",
  createQuery: jest.fn(() => ({}) as Record<string, unknown>),
  queryFeatures: jest.fn(() => Promise.resolve({ features: [] })),
  queryFeatureCount: jest.fn(() => Promise.resolve(0)),
  ...over,
});
const asLayer = (l: FakeLayer): __esri.FeatureLayer => l as unknown as __esri.FeatureLayer;

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    normalizeApos: (s: string): string => s,
    makeRegionDistrictKey: (s: string): string => s.toLowerCase(),
    filtersChanged: (a: Regional, b: Regional): boolean => JSON.stringify(a) !== JSON.stringify(b),
    getConfiguredFilterFields: (): string[] => ["tuman"],
    RECORDS_PER_PAGE: 10,
    _tableDataRequestId: 0,
    buildWhereClause: jest.fn((): string => "yil=2024"),
    getDisplayFields: (): string[] => ["uniqueid", "tuman"],
    getStatusFieldNameForCurrentDate: (): string | null => null,
    getTableOrderByFields: (): string[] => ["OID"],
    ...extra,
  });

describe("fetchFilterOptions", () => {
  test("dedupes concurrent calls and clears the in-flight promise", async () => {
    let resolve: () => void = () => undefined;
    const pending = new Promise<void>((r) => {
      resolve = r;
    });
    const host = wired({}, { fetchFilterOptionsOnce: jest.fn(() => pending) });
    const a = dh.fetchFilterOptions(host);
    const b = dh.fetchFilterOptions(host);
    expect(b).toBe(a);
    expect(asMock(host.fetchFilterOptionsOnce)).toHaveBeenCalledTimes(1);
    resolve();
    await a;
    expect(host._filterOptionsPromise).toBeNull();
  });
});

describe("fetchFilterOptionsOnce", () => {
  test("does nothing when unmounted or not connected", async () => {
    const a = wired({ connectionStatus: "idle" });
    await dh.fetchFilterOptionsOnce(a);
    const b = wired({ connectionStatus: "connected" }, { _isMounted: false });
    await dh.fetchFilterOptionsOnce(b);
    expect(asMock(a.setState)).not.toHaveBeenCalled();
    expect(asMock(b.setState)).not.toHaveBeenCalled();
  });
  test("reports an error when no filter fields are configured", async () => {
    const host = wired({ connectionStatus: "connected" }, { getConfiguredFilterFields: (): string[] => [] });
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.error).toBeTruthy();
    expect(host.state.loading).toBe(false);
  });
  test("graph mode defers table loads and fetches regional timeseries", async () => {
    const timer = setTimeout(() => undefined, 10000);
    const host = wired({ connectionStatus: "connected", viewMode: "graph" }, { initializationTimer: timer });
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.initialDataLoaded).toBe(true);
    expect(host.state.loadingVegetation).toBe(true);
    expect(host.initializationTimer).toBeNull();
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
    expect(asMock(host.fetchData)).not.toHaveBeenCalled();
  });
  test("graph mode with selected polygon keeps vegetation state and skips regional fetch", async () => {
    const host = wired({ connectionStatus: "connected", viewMode: "graph", selecteduniqueid: "u", loadingVegetation: false });
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.loadingVegetation).toBe(false);
    expect(asMock(host.fetchRegionalTimeseries)).not.toHaveBeenCalled();
  });
  test("table mode without layer reports missing data source", async () => {
    const host = wired({ connectionStatus: "connected", viewMode: "table" });
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.loadingFilters).toBe(false);
    expect(host.state.error).toBeTruthy();
  });
  test("table mode loads options per field then fetches data", async () => {
    const host = wired(
      { connectionStatus: "connected", viewMode: "table", featureLayer: asLayer(makeLayer()) },
      { getConfiguredFilterFields: (): string[] => ["a", "b"], getUniqueValues: jest.fn((f: string) => Promise.resolve(f === "a" ? ["1"] : null)) },
    );
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.filterOptions).toEqual({ a: ["1"], b: [] });
    expect(host.state.initialDataLoaded).toBe(true);
    expect(asMock(host.fetchData)).toHaveBeenCalled();
  });
  test("table mode surfaces errors and honors unmount mid-flight", async () => {
    const host = wired(
      { connectionStatus: "connected", viewMode: "table", featureLayer: asLayer(makeLayer()) },
      { getUniqueValues: jest.fn(() => Promise.reject(new Error("bad"))) },
    );
    await dh.fetchFilterOptionsOnce(host);
    expect(host.state.error).toContain("bad");
    const gone = wired(
      { connectionStatus: "connected", viewMode: "table", featureLayer: asLayer(makeLayer()) },
      { getUniqueValues: jest.fn(() => Promise.resolve(["x"])) },
    );
    asMock(gone.getUniqueValues).mockImplementation(() => {
      gone._isMounted = false;
      return Promise.resolve(["x"]);
    });
    await dh.fetchFilterOptionsOnce(gone);
    expect(gone.state.initialDataLoaded).toBe(false);
  });
  test("viewMode switched to graph during load triggers regional fetch", async () => {
    const host = wired(
      { connectionStatus: "connected", viewMode: "table", featureLayer: asLayer(makeLayer()) },
      {},
    );
    asMock(host.getUniqueValues).mockImplementation(() => {
      host.state = { ...host.state, viewMode: "graph" };
      return Promise.resolve(["x"]);
    });
    await dh.fetchFilterOptionsOnce(host);
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
  });
});

describe("getUniqueValues", () => {
  test("queries the feature layer with distinct values, de-duplicated and sorted", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({
      createQuery: jest.fn(() => q),
      queryFeatures: jest.fn(() =>
        Promise.resolve({ features: [{ attributes: { f: "b" } }, { attributes: { f: "a" } }, { attributes: { f: "b" } }, { attributes: { f: "" } }, { attributes: { f: null } }] }),
      ),
    });
    const host = wired({ featureLayer: asLayer(layer) });
    expect(await dh.getUniqueValues(host, "f")).toEqual(["a", "b"]);
    expect(q).toMatchObject({ where: "1=1", returnDistinctValues: true, orderByFields: ["f"], returnGeometry: false });
  });
  test("returns [] when layer query throws", async () => {
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.reject(new Error("x"))) });
    expect(await dh.getUniqueValues(wired({ featureLayer: asLayer(layer) }), "f")).toEqual([]);
  });
  test("falls back to data source records", async () => {
    const ds = { query: jest.fn(() => Promise.resolve({ records: [{ getData: (): Record<string, string> => ({ f: "z" }) }, { getData: (): Record<string, string> => ({ f: "y" }) }, { getData: (): null => null }] })) };
    const host = wired({ dataSource: ds as unknown as AgriGraffWidgetState["dataSource"] });
    expect(await dh.getUniqueValues(host, "f")).toEqual(["y", "z"]);
    expect(ds.query).toHaveBeenCalledWith(expect.objectContaining({ returnDistinctValues: true, orderByFields: ["f"] }));
  });
  test("data source edge cases return []", async () => {
    expect(await dh.getUniqueValues(wired(), "f")).toEqual([]);
    const none = { query: jest.fn(() => Promise.resolve(null)) };
    expect(await dh.getUniqueValues(wired({ dataSource: none as unknown as AgriGraffWidgetState["dataSource"] }), "f")).toEqual([]);
    const bad = { query: jest.fn(() => Promise.reject(new Error("x"))) };
    expect(await dh.getUniqueValues(wired({ dataSource: bad as unknown as AgriGraffWidgetState["dataSource"] }), "f")).toEqual([]);
  });
});

describe("fetchData", () => {
  const connectedTable = (over: Partial<AgriGraffWidgetState> = {}): Partial<AgriGraffWidgetState> => ({
    connectionStatus: "connected",
    viewMode: "table",
    regionalFilters: reg({ yil: "2024" }),
    ...over,
  });

  test("early exits: unmounted, disconnected, non-table", async () => {
    const a = wired(connectedTable(), { _isMounted: false });
    await dh.fetchData(a);
    expect(asMock(a.setState)).not.toHaveBeenCalled();
    const b = wired({ connectionStatus: "idle", loading: true });
    await dh.fetchData(b);
    expect(b.state.loading).toBe(false);
    expect(b._hasCompletedTableFetch).toBe(true);
    const c = wired(connectedTable({ viewMode: "graph", loading: true }));
    await dh.fetchData(c);
    expect(c.state.loading).toBe(false);
  });
  test("errors when no configured fields", async () => {
    const host = wired(connectedTable(), { getConfiguredFilterFields: (): string[] => [] });
    await dh.fetchData(host);
    expect(host.state.error).toBeTruthy();
    expect(host._hasCompletedTableFetch).toBe(true);
  });
  test("no year and no search clears records and applies map filters", async () => {
    const host = wired(connectedTable({ regionalFilters: reg({}), records: [{ uniqueid: "x" }] }));
    await dh.fetchData(host);
    expect(asMock(host.applyMapFilters)).toHaveBeenCalled();
    expect(host.state.records).toEqual([]);
    expect(host.state.totalRecordCount).toBe(0);
  });
  test("pending VH ids keeps the spinner without querying", async () => {
    const layer = makeLayer();
    const host = wired(connectedTable({ regionalFilters: reg({ yil: "2024", vh: "x" }), featureLayer: asLayer(layer) }));
    await dh.fetchData(host);
    expect(host.state.loading).toBe(true);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });
  test("missing layer reports an error", async () => {
    const host = wired(connectedTable());
    await dh.fetchData(host);
    expect(host.state.error).toContain("AgriGraff4");
    expect(host.state.loading).toBe(false);
  });
  test("queries count then page, maps oid and sets records", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({
      createQuery: jest.fn(() => q),
      queryFeatureCount: jest.fn(() => Promise.resolve(35)),
      queryFeatures: jest.fn(() => Promise.resolve({ features: [{ attributes: { OID: 5, uniqueid: "a", tuman: "T" } }] })),
    });
    const host = wired(connectedTable({ featureLayer: asLayer(layer), currentPage: 3 }), { _pendingScrollUniqueid: null });
    await dh.fetchData(host, { preservePage: true });
    expect(layer.definitionExpression).toBe("yil=2024");
    expect(host.state.records).toEqual([{ OID: 5, uniqueid: "a", tuman: "T", objectid: 5 }]);
    expect(host.state.totalRecordCount).toBe(35);
    expect(host.state.currentPage).toBe(3);
    expect(q).toMatchObject({ num: 10, start: 20, returnGeometry: false });
    expect(q.outFields).toEqual(["tuman", "uniqueid", "OID"]);
    expect(host._hasCompletedTableFetch).toBe(true);
  });
  test("clamps page to total pages and adds status field", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({
      createQuery: jest.fn(() => q),
      queryFeatureCount: jest.fn(() => Promise.resolve(5)),
    });
    const host = wired(connectedTable({ featureLayer: asLayer(layer), currentPage: 9 }), { getStatusFieldNameForCurrentDate: (): string => "st_x" });
    await dh.fetchData(host, { preservePage: true });
    expect(host.state.currentPage).toBe(1);
    expect(q.outFields).toContain("st_x");
  });
  test("skips setting definitionExpression on map-image layers and tolerates count failure", async () => {
    mockIsMapImage.mockReturnValueOnce(true);
    const layer = makeLayer({ queryFeatureCount: jest.fn(() => Promise.reject(new Error("c"))) });
    const host = wired(connectedTable({ featureLayer: asLayer(layer) }));
    await dh.fetchData(host);
    expect(layer.definitionExpression).toBeUndefined();
    expect(host.state.totalRecordCount).toBe(0);
  });
  test("tolerates definitionExpression assignment failure", async () => {
    const layer = makeLayer();
    Object.defineProperty(layer, "definitionExpression", {
      set: () => {
        throw new Error("ro");
      },
    });
    const host = wired(connectedTable({ featureLayer: asLayer(layer) }));
    await dh.fetchData(host);
    expect(host.state.error).toBeNull();
  });
  test("drops rows from other districts for a named tuman", async () => {
    const layer = makeLayer({
      queryFeatureCount: jest.fn(() => Promise.resolve(3)),
      queryFeatures: jest.fn(() =>
        Promise.resolve({
          features: [
            { attributes: { OID: 1, tuman: "Urganch tumani" } },
            { attributes: { OID: 2, tuman: "Xiva tumani" } },
            { attributes: { OID: 3, tuman: "" } },
          ],
        }),
      ),
    });
    const host = wired(connectedTable({ featureLayer: asLayer(layer), regionalFilters: reg({ yil: "2024", tuman: "Urganch" }) }));
    await dh.fetchData(host);
    expect(host.state.records.map((r) => r.objectid)).toEqual([1, 3]);
  });
  test("pending scroll: scrolls when record present, else ensures visibility", async () => {
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.resolve({ features: [{ attributes: { OID: 1, uniqueid: "u1" } }] })) });
    const present = wired(connectedTable({ featureLayer: asLayer(layer) }), {
      _pendingScrollUniqueid: "u1",
      recordMatchesUniqueid: (r: { uniqueid?: string }, id: string): boolean => r.uniqueid === id,
    });
    await dh.fetchData(present);
    expect(asMock(present.scheduleScrollSelectedRowIntoCenter)).toHaveBeenCalled();
    expect(present._pendingScrollUniqueid).toBeNull();
    const absent = wired(connectedTable({ featureLayer: asLayer(layer) }), {
      _pendingScrollUniqueid: "zz",
      recordMatchesUniqueid: (): boolean => false,
    });
    await dh.fetchData(absent);
    expect(asMock(absent.ensureSelectedRowVisible)).toHaveBeenCalledWith("zz");
  });
  test("query failure sets error; stale request ignored", async () => {
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.reject(new Error("boom"))) });
    const host = wired(connectedTable({ featureLayer: asLayer(layer) }));
    await dh.fetchData(host);
    expect(host.state.error).toBe("boom");
    const stale = makeLayer({
      queryFeatures: jest.fn(() => {
        return Promise.reject(new Error("late"));
      }),
    });
    const h2 = wired(connectedTable({ featureLayer: asLayer(stale) }));
    asMock(h2.buildWhereClause).mockImplementation(() => {
      h2._tableDataRequestId += 1;
      return "w";
    });
    await dh.fetchData(h2);
    expect(h2.state.error).toBeNull();
  });
  test("active search without year still queries", async () => {
    const layer = makeLayer();
    const host = wired(connectedTable({ featureLayer: asLayer(layer), regionalFilters: reg({}), isSearchActive: true, searchText: "ali" }));
    await dh.fetchData(host);
    expect(layer.queryFeatures).toHaveBeenCalled();
  });
});

describe("applyMapFilters", () => {
  test("no layer and no data source is a no-op", async () => {
    const host = wired();
    await dh.applyMapFilters(host);
    expect(asMock(host.buildWhereClause)).not.toHaveBeenCalled();
  });
  test("skips when VH ids are pending", async () => {
    const host = wired({ featureLayer: asLayer(makeLayer()), regionalFilters: reg({ vh: "x" }), vhUniqueids: null });
    await dh.applyMapFilters(host);
    expect(asMock(host.buildWhereClause)).not.toHaveBeenCalled();
  });
  test("applies where to layer and data source", async () => {
    const layer = makeLayer();
    const setDef = jest.fn();
    const host = wired({ featureLayer: asLayer(layer), dataSource: { setDefinitionExpression: setDef } as unknown as AgriGraffWidgetState["dataSource"] });
    await dh.applyMapFilters(host);
    expect(layer.definitionExpression).toBe("yil=2024");
    expect(setDef).toHaveBeenCalledWith("yil=2024");
  });
  test("mirrors a uniqueid join onto spatial layers when viloyat selected", async () => {
    mockQueryIds.mockResolvedValue(["a", "b"]);
    const spatial = makeLayer({ definitionExpression: "old" });
    const owned = makeLayer({ definitionExpression: "keep" });
    const host = wired({
      featureLayer: asLayer(makeLayer()),
      spatialClickLayers: [asLayer(spatial), asLayer(owned)],
      regionalFilters: reg({ viloyat: "A", yil: "2024" }),
    });
    mockIsMapImage.mockImplementation((): boolean => false);
    await dh.applyMapFilters(host);
    expect(spatial.definitionExpression).toBe("uniqueid IN (a,b)");
    expect(mockQueryIds).toHaveBeenCalledWith("yil=2024");
  });
  test("uses 1=1 / 1=0 directly and skips map-image layers; swallows errors", async () => {
    const spatial = makeLayer();
    const filters = reg({ viloyat: "A" });
    const all = wired({ featureLayer: asLayer(makeLayer()), spatialClickLayers: [asLayer(spatial)], regionalFilters: filters }, { buildWhereClause: (): string => "1=0" });
    await dh.applyMapFilters(all);
    expect(spatial.definitionExpression).toBe("1=0");
    const blank = wired({ featureLayer: asLayer(makeLayer()), spatialClickLayers: [asLayer(spatial)], regionalFilters: filters }, { buildWhereClause: (): string => "" });
    await dh.applyMapFilters(blank);
    expect(spatial.definitionExpression).toBe("1=1");
    const owned = makeLayer();
    mockIsMapImage.mockImplementation((): boolean => true);
    await dh.applyMapFilters(wired({ spatialClickLayers: [asLayer(owned)], featureLayer: asLayer(makeLayer()), regionalFilters: filters }));
    expect(owned.definitionExpression).toBeUndefined();
    mockIsMapImage.mockImplementation((): boolean => false);
    mockQueryIds.mockRejectedValue(new Error("x"));
    await expect(dh.applyMapFilters(wired({ spatialClickLayers: [asLayer(makeLayer())], featureLayer: asLayer(makeLayer()), regionalFilters: filters }))).resolves.toBeUndefined();
  });
  test("layer assignment failure is non-fatal", async () => {
    const layer = makeLayer();
    Object.defineProperty(layer, "definitionExpression", {
      set: () => {
        throw new Error("ro");
      },
    });
    const host = wired({ featureLayer: asLayer(layer) });
    await expect(dh.applyMapFilters(host)).resolves.toBeUndefined();
  });
});

describe("filter state handlers", () => {
  test("handleFilterChange updates localFilters and throttles fetch", async () => {
    const host = wired({ connectionStatus: "connected", localFilters: { a: "1" } });
    await dh.handleFilterChange(host, "b", "2");
    expect(host.state.localFilters).toEqual({ a: "1", b: "2" });
    expect(host.state.loading).toBe(true);
    expect(asMock(host.throttledFetchData)).toHaveBeenCalled();
    const idle = wired({ connectionStatus: "idle" });
    await dh.handleFilterChange(idle, "b", "2");
    expect(asMock(idle.setState)).not.toHaveBeenCalled();
  });
  test("handleResetFilters blanks everything and refetches", async () => {
    const host = wired({ connectionStatus: "connected", records: [{ uniqueid: "x" }], regionalFilters: reg({ viloyat: "A" }), vhUniqueids: ["x"] }, { getConfiguredFilterFields: (): string[] => ["a", "b"] });
    await dh.handleResetFilters(host);
    expect(host.state.localFilters).toEqual({ a: "", b: "" });
    expect(host.state.regionalFilters).toEqual(reg({}));
    expect(host.state.vhUniqueids).toBeNull();
    expect(host.state.records).toEqual([]);
    expect(host._allowClearOnce).toBe(true);
    expect(asMock(host.applyMapFilters)).toHaveBeenCalled();
    expect(asMock(host.throttledFetchData)).toHaveBeenCalled();
    const idle = wired({ connectionStatus: "idle" });
    await dh.handleResetFilters(idle);
    expect(asMock(idle.setState)).not.toHaveBeenCalled();
  });
  test("filtersChanged compares regional slices", () => {
    expect(dh.filtersChanged(wired(), reg({ yil: "1" }), reg({ yil: "2" }))).toBe(true);
    expect(dh.filtersChanged(wired(), reg({ yil: "1" }), reg({ yil: "1" }))).toBe(false);
  });
  test("handleGeoFilterChanged normalizes payload", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A", yil: "1" }), selectedIndices: ["savi"] });
    dh.handleGeoFilterChanged(host, ev({ source: "GeoFilter", massivNom: "B", tumanNomi: "T", year: 2024, category: "c", vh: "z" }));
    expect(host.state.regionalFilters).toEqual({ viloyat: "B", tuman: "T", yil: "2024", uzspace: "c", vh: "z" });
    expect(host.state.selectedIndices).toEqual(["savi"]);
    expect(asMock(host.throttledFetchData)).toHaveBeenCalled();
  });
  test("handleGeoFilterChanged resets indices when returning to republic; ignores others", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A", yil: "1" }), selectedIndices: ["savi"] });
    dh.handleGeoFilterChanged(host, ev({ source: "GeoFilter", yil: "1" }));
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
    const other = wired();
    dh.handleGeoFilterChanged(other, ev({ source: "Other" }));
    dh.handleGeoFilterChanged(other, ev(null));
    dh.handleGeoFilterChanged(other, ev({ source: "GeoFilter" }));
    expect(asMock(other.setState)).not.toHaveBeenCalled();
    const gone = wired({}, { _isMounted: false });
    dh.handleGeoFilterChanged(gone, ev({ source: "GeoFilter", yil: "5" }));
    expect(asMock(gone.setState)).not.toHaveBeenCalled();
  });
  test("handleResetAll clears filters only when changed", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A" }), selectedIndices: ["evi"] });
    dh.handleResetAll(host);
    expect(host.state.regionalFilters).toEqual(reg({}));
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
    expect(asMock(host.refetchDebounced)).toHaveBeenCalled();
    const clean = wired();
    dh.handleResetAll(clean);
    expect(asMock(clean.setState)).not.toHaveBeenCalled();
    const yearOnly = wired({ regionalFilters: reg({ yil: "1" }), selectedIndices: ["evi"] });
    dh.handleResetAll(yearOnly);
    expect(yearOnly.state.selectedIndices).toEqual(["evi"]);
  });
});

describe("refetch", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  test("refetchDebounced debounces refetchNow by 150ms", () => {
    const host = wired();
    dh.refetchDebounced(host);
    dh.refetchDebounced(host);
    jest.advanceTimersByTime(149);
    expect(asMock(host.refetchNow)).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2);
    expect(asMock(host.refetchNow)).toHaveBeenCalledTimes(1);
  });
  test("refetchNow sets loading and fetches when connected", () => {
    const host = wired({ connectionStatus: "connected" });
    dh.refetchNow(host);
    expect(host.state.loading).toBe(true);
    expect(asMock(host.fetchData)).toHaveBeenCalled();
    const idle = wired({ connectionStatus: "idle" });
    dh.refetchNow(idle);
    expect(asMock(idle.setState)).not.toHaveBeenCalled();
  });
});

describe("url and field resolvers", () => {
  test("buildApiUrlWithFilters", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A", yil: "2024", vh: "x" }) });
    expect(dh.buildApiUrlWithFilters(host, "/api")).toBe("/api?viloyat=A&yil=2024&vh=x");
    expect(dh.buildApiUrlWithFilters(wired(), "/api")).toBe("/api");
  });
  test("getCategoryFieldName prefers turi over others", () => {
    const fl = { fields: [{ name: "Type" }, { name: "TURI" }] } as unknown as __esri.FeatureLayer;
    expect(dh.getCategoryFieldName(wired({ featureLayer: fl }))).toBe("TURI");
    expect(dh.getCategoryFieldName(wired({ featureLayer: { fields: [{ name: "z" }] } as unknown as __esri.FeatureLayer }))).toBeNull();
    expect(dh.getCategoryFieldName(wired())).toBeNull();
  });
  test("getVhFieldName", () => {
    const fl = { fields: [{ name: "a" }, { name: "Vh" }] } as unknown as __esri.FeatureLayer;
    expect(dh.getVhFieldName(wired({ featureLayer: fl }))).toBe("Vh");
    expect(dh.getVhFieldName(wired({ featureLayer: { fields: [] } as unknown as __esri.FeatureLayer }))).toBeNull();
    expect(dh.getVhFieldName(wired())).toBeNull();
  });
  test("getPolygonJoinFieldName", () => {
    expect(dh.getPolygonJoinFieldName(wired())).toBe("uniqueid");
    expect(dh.getPolygonJoinFieldName(wired({ featureLayer: { fields: [{ name: "UniqueID" }] } as unknown as __esri.FeatureLayer }))).toBe("UniqueID");
    expect(dh.getPolygonJoinFieldName(wired({ featureLayer: { fields: [{ name: "x" }] } as unknown as __esri.FeatureLayer }))).toBe("uniqueid");
  });
});
