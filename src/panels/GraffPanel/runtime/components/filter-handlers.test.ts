jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({
  escapeArcGIS: (s: string): string => s.replace(/'/g, "''"),
  withAgriAccessWhere: (s: string): string => s,
  isMapImageOwnedLayer: (): boolean => false,
}));
jest.mock("../../../../controller/agri-where-builder", () => ({
  buildYearLikeClause: (y: string): string => `yil LIKE '%${y}%'`,
}));
const mockBootstrap = jest.fn();
jest.mock("../../../../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: (): unknown => mockBootstrap(),
}));
jest.mock("../../../../shared/agri-crop-labels", () => ({
  getTuriCropLookupKey: (t: string): string => String(t).toLowerCase(),
}));
jest.mock("../../../../filter/localization/vh-constants", () => ({
  VH_TO_NDVI_STATUS: { Yaxshi: "good" },
}));
jest.mock("../../../../data/agri-uniqueid-sql", () => ({
  normalizeUniqueidKey: (v: string | null | undefined): string => String(v ?? "").toUpperCase(),
  recordMatchesUniqueidKey: (a: string, b: string): boolean => a.toUpperCase() === b.toUpperCase(),
}));

import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import * as fh from "./filter-handlers";
import type { AgriGraffWidgetState } from "../graff-state";

type Regional = AgriGraffWidgetState["regionalFilters"];
const reg = (r: Partial<Regional>): Regional => ({ viloyat: "", tuman: "", yil: "", uzspace: "", vh: "", ...r });
const ev = (detail: Record<string, unknown> | null): CustomEvent => ({ detail }) as unknown as CustomEvent;
const field = (name: string, type = "small-integer"): __esri.Field => ({ name, type, alias: `${name}-alias` }) as unknown as __esri.Field;
const layerOf = (fields: __esri.Field[], extra: Record<string, unknown> = {}): __esri.FeatureLayer =>
  ({ fields, ...extra }) as unknown as __esri.FeatureLayer;

const wiredHost = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    normalizeApos: (s: string): string => s,
    makeRegionDistrictKey: (s: string): string => s.toLowerCase(),
    eqAposSmart: (f: string, v: string): string => `${f}='${v}'`,
    resolveDistrictNumber: (): number | undefined => undefined,
    buildTumanNameClause: (t: string): string => `tuman='${t}'`,
    getCategoryFieldName: (): string => "turi",
    buildVhUniqueIdsClause: (): string => "",
    buildNdviStatusClauseForCurrentVh: (): string => "",
    resolveFieldCaseInsensitive: (): string | null => null,
    buildSearchWhere: (s: string): string => `name LIKE '${s}'`,
    filtersChanged: (a: Regional, b: Regional): boolean => JSON.stringify(a) !== JSON.stringify(b),
    ...extra,
  });

describe("buildWhereClause", () => {
  test("returns 1=0 without year or search", () => {
    expect(fh.buildWhereClause(wiredHost())).toBe("1=0");
  });
  test("year only yields the year clause", () => {
    expect(fh.buildWhereClause(wiredHost({ regionalFilters: reg({ yil: "2024" }) }))).toBe("yil LIKE '%2024%'");
  });
  test("numeric viloyat and tuman use region/district columns", () => {
    const host = wiredHost({
      regionalFilters: reg({ yil: "2024", viloyat: "1733", tuman: "5" }),
      featureLayer: layerOf([field("region"), field("district")]),
    });
    expect(fh.buildWhereClause(host)).toBe("region = 1733 AND district = 5 AND yil LIKE '%2024%'");
  });
  test("string typed region/district are quoted", () => {
    const host = wiredHost({
      regionalFilters: reg({ yil: "2024", viloyat: "17", tuman: "5" }),
      featureLayer: layerOf([field("region", "string"), field("district", "string")]),
    });
    expect(fh.buildWhereClause(host)).toContain("region = '17' AND district = '5'");
  });
  test("viloyat name maps via _viloyatToRegion, string and numeric", () => {
    const host = wiredHost(
      { regionalFilters: reg({ yil: "1", viloyat: "Xorazm" }), featureLayer: layerOf([field("region"), field("district")]) },
      { _viloyatToRegion: { xorazm: 9 } },
    );
    expect(fh.buildWhereClause(host)).toContain("region = 9");
    const host2 = wiredHost(
      { regionalFilters: reg({ yil: "1", viloyat: "Xorazm" }), featureLayer: layerOf([field("region", "string")]) },
      { _viloyatToRegion: { xorazm: 9 } },
    );
    expect(fh.buildWhereClause(host2)).toContain("region = '9'");
  });
  test("falls back to name clauses when no region columns", () => {
    const host = wiredHost({ regionalFilters: reg({ yil: "1", viloyat: "Xorazm", tuman: "Urganch", uzspace: "Paxta" }) });
    const where = fh.buildWhereClause(host);
    expect(where).toContain("viloyat='Xorazm'");
    expect(where).toContain("tuman='Urganch'");
    expect(where).toContain("turi='Paxta'");
  });
  test("district resolved by name; no tuman clause when builder returns empty", () => {
    const host = wiredHost(
      { regionalFilters: reg({ yil: "1", tuman: "Urganch" }), featureLayer: layerOf([field("district")]) },
      { resolveDistrictNumber: (): number => 12 },
    );
    expect(fh.buildWhereClause(host)).toContain("district = 12");
    const host2 = wiredHost({ regionalFilters: reg({ yil: "1", tuman: "X" }) }, { buildTumanNameClause: (): string => "" });
    expect(fh.buildWhereClause(host2)).toBe("yil LIKE '%1%'");
  });
  test("vh with resolved ids uses ids clause, or 1=0 when empty", () => {
    const filters = reg({ yil: "1", vh: "Yaxshi" });
    const a = wiredHost({ regionalFilters: filters, vhUniqueids: ["a"] }, { buildVhUniqueIdsClause: (): string => "uniqueid IN ('a')" });
    expect(fh.buildWhereClause(a)).toContain("uniqueid IN ('a')");
    const b = wiredHost({ regionalFilters: filters, vhUniqueids: [] });
    expect(fh.buildWhereClause(b)).toContain("1=0");
    const c = wiredHost({ regionalFilters: filters, vhUniqueids: null });
    expect(fh.buildWhereClause(c)).toBe("yil LIKE '%1%'");
  });
  test("no vh uses ndvi status clause", () => {
    const host = wiredHost({ regionalFilters: reg({ yil: "1" }) }, { buildNdviStatusClauseForCurrentVh: (): string => "st='good'" });
    expect(fh.buildWhereClause(host)).toContain("st='good'");
  });
  test("farmerInn and search clauses", () => {
    const a = wiredHost({ regionalFilters: reg({ yil: "1" }), farmerInn: "12'3" }, { resolveFieldCaseInsensitive: (): string => "F_INN" });
    expect(fh.buildWhereClause(a)).toContain("UPPER(F_INN)=UPPER('12''3')");
    const b = wiredHost({ regionalFilters: reg({}), searchText: "ali", isSearchActive: true });
    expect(fh.buildWhereClause(b)).toBe("(name LIKE 'ali')");
    const c = wiredHost({ regionalFilters: reg({}), searchText: "ali", isSearchActive: true }, { buildSearchWhere: (): string => "1=0" });
    expect(fh.buildWhereClause(c)).toBe("1=1");
  });
});

describe("fetchAndStoreRegionDistrictMappings", () => {
  test("stores rows and first crop id per turi", async () => {
    mockBootstrap.mockResolvedValue({
      regionDistrictRows: [{ viloyat: "A", region: 1, tuman: "B", district: 2, count: 3 }],
      turiCropRows: [{ turi: "Paxta", cropId: "3" }, { turi: "paxta", cropId: "9" }, { turi: "", cropId: "1" }],
    });
    const host = wiredHost();
    await fh.fetchAndStoreRegionDistrictMappings(host);
    expect(asMock(host.storeRegionDistrictMappingRow)).toHaveBeenCalledWith("A", 1, "B", 2, 3);
    expect(host._turiToCropId).toEqual({ paxta: "3" });
  });
  test("swallows bootstrap failure", async () => {
    mockBootstrap.mockRejectedValue(new Error("boom"));
    await expect(fh.fetchAndStoreRegionDistrictMappings(wiredHost())).resolves.toBeUndefined();
  });
});

describe("external event handlers", () => {
  const dispatched: CustomEvent[] = [];
  beforeAll(() => {
    document.addEventListener("widgetSelectionChanged", (e) => dispatched.push(e as CustomEvent));
  });
  beforeEach(() => {
    dispatched.length = 0;
  });

  test("handleConstructionYearChange updates year, resets vh, broadcasts", () => {
    const host = wiredHost({ regionalFilters: reg({ yil: "2023", vh: "x" }) });
    fh.handleConstructionYearChange(host, ev({ year: 2024 }));
    expect(host.state.regionalFilters.yil).toBe("2024");
    expect(host.state.regionalFilters.vh).toBe("");
    expect(asMock(host.scheduleRefresh)).toHaveBeenCalled();
    expect(dispatched.some((e) => e.detail.yil === "2024")).toBe(true);
  });
  test("handleConstructionYearChange ignores own source, unmounted, unchanged", () => {
    const host = wiredHost({ regionalFilters: reg({ yil: "2024" }) });
    fh.handleConstructionYearChange(host, ev({ source: "AgriGraffWidget", year: 1 }));
    fh.handleConstructionYearChange(host, ev(null));
    fh.handleConstructionYearChange(host, ev({ yil: "2024", vh: "" }));
    expect(asMock(host.setState)).not.toHaveBeenCalled();
    host._isMounted = false;
    fh.handleConstructionYearChange(host, ev({ yil: "1" }));
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });

  test("handleLandCategoryChange resets selection, clears graphics, refetches", () => {
    const removeAll = jest.fn();
    const host = wiredHost({
      regionalFilters: reg({ yil: "2024", vh: "v" }),
      viewMode: "graph",
      activeMapView: { view: { graphics: { removeAll } } } as unknown as AgriGraffWidgetState["activeMapView"],
    });
    fh.handleLandCategoryChange(host, ev({ category: " Paxta ", viloyat: "A", tuman: "B", year: 2025 }));
    expect(host.state.regionalFilters).toEqual({ viloyat: "A", tuman: "B", yil: "2025", uzspace: "Paxta", vh: "v" });
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(removeAll).toHaveBeenCalled();
    expect(asMock(host.applyMapFilters)).toHaveBeenCalled();
    expect(asMock(host.throttledFetchData)).toHaveBeenCalled();
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
  });
  test("handleLandCategoryChange tolerates graphics failure and ignores no-op", () => {
    const host = wiredHost({
      regionalFilters: reg({ yil: "2024" }),
      activeMapView: {
        view: {
          graphics: {
            removeAll: (): void => {
              throw new Error("x");
            },
          },
        },
      } as unknown as AgriGraffWidgetState["activeMapView"],
    });
    expect(() => fh.handleLandCategoryChange(host, ev({ turi: "A" }))).not.toThrow();
    const same = wiredHost({ regionalFilters: reg({ yil: "2024" }) });
    fh.handleLandCategoryChange(same, ev({ source: "AgriGraffWidget" }));
    fh.handleLandCategoryChange(same, ev({ yil: "2024" }));
    expect(asMock(same.setState)).not.toHaveBeenCalled();
  });

  test("handleRegionalChange resets vh, indices on return to republic", () => {
    const host = wiredHost({
      regionalFilters: reg({ viloyat: "A", yil: "1", vh: "q" }),
      selectedIndices: ["savi"],
    });
    fh.handleRegionalChange(host, ev({ yil: 2024 }));
    expect(host.state.regionalFilters).toEqual(reg({ yil: "2024" }));
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
    expect(asMock(host.scheduleRefresh)).toHaveBeenCalled();
    fh.handleRegionalChange(host, ev({ source: "AgriGraffWidget" }));
  });
  test("handleRegionalChange keeps indices otherwise", () => {
    const host = wiredHost({ regionalFilters: reg({ yil: "1" }), selectedIndices: ["savi"] });
    fh.handleRegionalChange(host, ev({ viloyat: "B", yil: "1", uzspace: "u", tuman: "t" }));
    expect(host.state.selectedIndices).toEqual(["savi"]);
  });

  test("handleGeneralFilterChange merges detail and clears vh on parent change", () => {
    const host = wiredHost({ regionalFilters: reg({ viloyat: "A", yil: "1", vh: "k" }) });
    fh.handleGeneralFilterChange(host, ev({ viloyat: "B", tumanNomi: "T", year: 2, tur: "c" }));
    expect(host.state.regionalFilters).toEqual({ viloyat: "B", tuman: "T", yil: "2", uzspace: "c", vh: "" });
  });
  test("handleGeneralFilterChange honors explicit vh and no-ops", () => {
    const host = wiredHost({ regionalFilters: reg({ viloyat: "A", yil: "1" }) });
    fh.handleGeneralFilterChange(host, ev({ viloyat: "B", vh: "z" }));
    expect(host.state.regionalFilters.vh).toBe("z");
    fh.handleGeneralFilterChange(host, ev({ vh: "z" }));
    fh.handleGeneralFilterChange(host, ev({ source: "AgriGraffWidget" }));
    expect(asMock(host.setState)).toHaveBeenCalledTimes(1);
  });
});

describe("external filter update", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("processExternalFilterUpdate debounces applyExternalFilterUpdate", () => {
    const host = wiredHost({ externalFilters: { a: "1" }, lastUpdateTimestamp: 0 });
    fh.processExternalFilterUpdate(host, "src", { a: "2" });
    expect(asMock(host.applyExternalFilterUpdate)).not.toHaveBeenCalled();
    jest.advanceTimersByTime(250);
    expect(asMock(host.applyExternalFilterUpdate)).toHaveBeenCalledWith("src", { a: "2" });
  });
  test("processExternalFilterUpdate skips when busy, empty, or unchanged", () => {
    const busy = wiredHost({ isProcessingExternalUpdate: true });
    fh.processExternalFilterUpdate(busy, "s", { a: "1" });
    const recent = wiredHost({ lastUpdateTimestamp: Date.now() });
    fh.processExternalFilterUpdate(recent, "s", { a: "1" });
    const empty = wiredHost();
    fh.processExternalFilterUpdate(empty, "s", {});
    const same = wiredHost({ externalFilters: { a: "1" } });
    fh.processExternalFilterUpdate(same, "s", { a: "1" });
    jest.advanceTimersByTime(500);
    for (const h of [busy, recent, empty, same]) expect(asMock(h.applyExternalFilterUpdate)).not.toHaveBeenCalled();
  });
  test("applyExternalFilterUpdate when disconnected only stores filters", async () => {
    const host = wiredHost({ connectionStatus: "idle", externalFilters: { a: "1" } });
    await fh.applyExternalFilterUpdate(host, "s", { b: "2" });
    expect(host.state.externalFilters).toEqual({ a: "1", b: "2" });
    expect(asMock(host.scheduleRefresh)).not.toHaveBeenCalled();
  });
  test("applyExternalFilterUpdate when connected refreshes then clears flag", async () => {
    const host = wiredHost({ connectionStatus: "connected" });
    await fh.applyExternalFilterUpdate(host, "s", { b: "2" });
    expect(host.state.isProcessingExternalUpdate).toBe(true);
    expect(asMock(host.scheduleRefresh)).toHaveBeenCalled();
    jest.advanceTimersByTime(150);
    expect(host.state.isProcessingExternalUpdate).toBe(false);
    host._isMounted = false;
    await fh.applyExternalFilterUpdate(host, "s", { c: "1" });
  });
});

describe("field and sort helpers", () => {
  test("getDisplayFields defaults and configured", () => {
    expect(fh.getDisplayFields(wiredHost())).toContain("uniqueid");
    const host = wiredHost({}, { props: { config: { displayFields: ["a", "b"] } } });
    expect(fh.getDisplayFields(host)).toEqual(["a", "b"]);
  });
  test("getMaydonSortFieldName exact, fuzzy, none", () => {
    expect(fh.getMaydonSortFieldName(wiredHost({}, { getDisplayFields: (): string[] => ["x", "Maydon"] }))).toBe("Maydon");
    expect(fh.getMaydonSortFieldName(wiredHost({}, { getDisplayFields: (): string[] => ["x", "total_area"] }))).toBe("total_area");
    expect(fh.getMaydonSortFieldName(wiredHost({}, { getDisplayFields: (): string[] => ["x"] }))).toBeNull();
  });
  test("getTableOrderByFields", () => {
    const base = { getMaydonSortFieldName: (): string => "maydon" };
    expect(fh.getTableOrderByFields(wiredHost({}, base))).toEqual(["objectid"]);
    expect(fh.getTableOrderByFields(wiredHost({ tableSort: { column: "maydon", order: "asc" } }, base))).toEqual(["maydon ASC"]);
    expect(
      fh.getTableOrderByFields(
        wiredHost({ tableSort: { column: "maydon", order: "asc" }, featureLayer: layerOf([], { objectIdField: "OID" }) }, { getMaydonSortFieldName: (): null => null }),
      ),
    ).toEqual(["OID"]);
  });
  test("toggleMaydonSort cycles desc, asc, null and refetches in table mode", () => {
    const host = wiredHost({}, { getMaydonSortFieldName: (): string => "maydon" });
    fh.toggleMaydonSort(host);
    expect(host.state.tableSort).toEqual({ column: "maydon", order: "desc" });
    fh.toggleMaydonSort(host);
    expect(host.state.tableSort).toEqual({ column: "maydon", order: "asc" });
    fh.toggleMaydonSort(host);
    expect(host.state.tableSort).toBeNull();
    expect(asMock(host.fetchData)).toHaveBeenCalledTimes(3);
    const none = wiredHost({}, { getMaydonSortFieldName: (): null => null });
    fh.toggleMaydonSort(none);
    expect(asMock(none.setState)).not.toHaveBeenCalled();
    const graph = wiredHost({ viewMode: "graph" }, { getMaydonSortFieldName: (): string => "m" });
    fh.toggleMaydonSort(graph);
    expect(asMock(graph.fetchData)).not.toHaveBeenCalled();
  });
  test("buildVhUniqueIdsClause", () => {
    expect(fh.buildVhUniqueIdsClause(wiredHost())).toBe("");
    expect(fh.buildVhUniqueIdsClause(wiredHost({ vhUniqueids: [] }))).toBe("1=0");
    expect(fh.buildVhUniqueIdsClause(wiredHost({ vhUniqueids: ["a", "b'c"] }))).toBe("uniqueid IN ('a','b''c')");
    const many = Array.from({ length: 450 }, (_, i) => String(i));
    expect(fh.buildVhUniqueIdsClause(wiredHost({ vhUniqueids: many }))).toMatch(/^\(uniqueid IN .* OR uniqueid IN .*\)$/);
  });
  test("getStatusFieldNameForCurrentDate", () => {
    const fl = layerOf([field("Status_2025_06_12"), field("Broadcast")]);
    expect(fh.getStatusFieldNameForCurrentDate(wiredHost({ selectedNdviDate: "2025-06-12" }))).toBeNull();
    expect(fh.getStatusFieldNameForCurrentDate(wiredHost({ featureLayer: fl }))).toBeNull();
    expect(fh.getStatusFieldNameForCurrentDate(wiredHost({ featureLayer: fl, selectedNdviDate: "2025-06-12" }))).toBe("Status_2025_06_12");
    expect(fh.getStatusFieldNameForCurrentDate(wiredHost({ featureLayer: fl, selectedNdviDate: "2025-01-01" }))).toBeNull();
    expect(fh.getStatusFieldNameForCurrentDate(wiredHost({ featureLayer: fl }, { _barCategoryField: "broadcast" }))).toBe("Broadcast");
    const custom = wiredHost({ featureLayer: layerOf([field("st_2025_06_12")]), selectedNdviDate: "2025-06-12" }, { props: { config: { polygonStatusPrefix: "st_" } } });
    expect(fh.getStatusFieldNameForCurrentDate(custom)).toBe("st_2025_06_12");
  });
  test("buildNdviStatusClauseForCurrentVh", () => {
    const filters = reg({ vh: "Yaxshi" });
    const base = { getStatusFieldNameForCurrentDate: (): string => "st" };
    expect(fh.buildNdviStatusClauseForCurrentVh(wiredHost({ selectedNdviDate: "d" }, base))).toBe("");
    expect(fh.buildNdviStatusClauseForCurrentVh(wiredHost({ regionalFilters: filters }, base))).toBe("");
    expect(fh.buildNdviStatusClauseForCurrentVh(wiredHost({ regionalFilters: filters, selectedNdviDate: "d" }, base))).toBe("st = 'good'");
    expect(fh.buildNdviStatusClauseForCurrentVh(wiredHost({ regionalFilters: reg({ vh: "?" }), selectedNdviDate: "d" }, base))).toBe("");
    expect(
      fh.buildNdviStatusClauseForCurrentVh(wiredHost({ regionalFilters: filters, selectedNdviDate: "d" }, { getStatusFieldNameForCurrentDate: (): null => null })),
    ).toBe("");
    expect(
      fh.buildNdviStatusClauseForCurrentVh(wiredHost({ regionalFilters: reg({ vh: "?" }) }, { ...base, _barCategoryField: "f", _barCategoryValue: "bar's" })),
    ).toBe("st = 'bar''s'");
  });
  test("getFieldDisplayName and unique id helpers", () => {
    const fl = layerOf([field("Maydon")]);
    expect(fh.getFieldDisplayName(wiredHost({ featureLayer: fl }), "maydon")).toBe("Maydon-alias");
    expect(fh.getFieldDisplayName(wiredHost({ featureLayer: fl }), "zzz")).toBe("zzz");
    expect(fh.getFieldDisplayName(wiredHost(), "q")).toBe("q");
    const host = wiredHost();
    expect(fh.normalizeUniqueidKey(host, "ab")).toBe("AB");
    expect(fh.recordMatchesUniqueid(host, { uniqueid: "ab" }, "AB")).toBe(true);
    expect(fh.recordMatchesUniqueid(host, { objectid: 7 }, "7")).toBe(true);
  });
});
