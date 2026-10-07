jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockClear = jest.fn();
jest.mock("../graff-map-utils", () => ({ clearMapSelectionGraphics: (v: unknown): void => mockClear(v) }));
jest.mock("../../../../data/agri-uniqueid-sql", () => ({
  buildGidvSmartWhere: (raw: string, field: string): string => `gidv(${field}:${raw})`,
}));
jest.mock("../../../../data/agri-sql", () => ({ escapeLikeLiteral: (s: string): string => s.replace(/'/g, "''") }));
jest.mock("../../../../gis/feature-layer-data", () => ({
  escapeArcGIS: (s: string): string => s.replace(/'/g, "''"),
  isMapImageOwnedLayer: (): boolean => false,
}));
jest.mock("../../../../controller/agri-where-builder", () => ({
  buildYearLikeClause: (y: string): string => `yil~${y}`,
}));
jest.mock("./master-filter-handler", () => ({ handleMasterFilterChanged: jest.fn() }));
jest.mock("./spatial-candidates", () => ({ findSpatialFeatureByUniqueId: jest.fn(), getTableSpatialQueryCandidates: jest.fn() }));

import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState, RecordData } from "../graff-state";
import * as sh from "./search-handlers";

type Regional = AgriGraffWidgetState["regionalFilters"];
const reg = (r: Partial<Regional>): Regional => ({ viloyat: "", tuman: "", yil: "", uzspace: "", vh: "", ...r });
const ev = (detail: Record<string, unknown> | null): Event => ({ detail }) as unknown as Event;
const field = (name: string, type = "small-integer"): { name: string; type: string } => ({ name, type });

interface FakeLayer {
  fields: Array<{ name: string; type: string }>;
  definitionExpression?: string;
  createQuery: jest.Mock;
  queryFeatures: jest.Mock;
}
const makeLayer = (over: Partial<FakeLayer> = {}): FakeLayer => ({
  fields: [],
  createQuery: jest.fn(() => ({}) as Record<string, unknown>),
  queryFeatures: jest.fn(() => Promise.resolve({ features: [] })),
  ...over,
});
const asLayer = (l: FakeLayer): __esri.FeatureLayer => l as unknown as __esri.FeatureLayer;
const mapViewWith = (goTo: jest.Mock = jest.fn(() => Promise.resolve())): AgriGraffWidgetState["activeMapView"] =>
  ({ view: { goTo } }) as unknown as AgriGraffWidgetState["activeMapView"];

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    normalizeApos: (s: string): string => s,
    makeRegionDistrictKey: (s: string): string => s.toLowerCase(),
    eqAposSmart: (f: string, v: string): string => `${f}='${v}'`,
    resolveDistrictNumber: (): number | undefined => undefined,
    buildTumanNameClause: (t: string): string => `tuman='${t}'`,
    getCategoryFieldName: (): string => "turi",
    resolveFieldCaseInsensitive: (n: string): string | null => (n === "f_name" ? "F_NAME" : null),
    buildSearchWhere: jest.fn((s: string): string => `search(${s})`),
    buildWhereClause: jest.fn((): string => "base"),
    _viloyatToRegion: {},
    ...extra,
  });

describe("getSearchField / where builders", () => {
  test("getSearchField reads plain and immutable config", () => {
    expect(sh.getSearchField(makeStubHost({}, { props: { config: { searchField: "gidv" } } }))).toBe("gidv");
    expect(sh.getSearchField(makeStubHost({}, { props: { config: { get: (): string => "gidv" } } }))).toBe("gidv");
    expect(sh.getSearchField(makeStubHost({}, { props: { config: { searchField: "x" } } }))).toBe("uniqueid");
    expect(sh.getSearchField(makeStubHost({}, { props: {} }))).toBe("uniqueid");
  });
  test("buildGidvWhere delegates with default field", () => {
    expect(sh.buildGidvWhere(wired(), "abc")).toBe("gidv(gidv:abc)");
    expect(sh.buildGidvWhere(wired(), "abc", "f")).toBe("gidv(f:abc)");
  });
  test("buildSearchWhere ORs INN and farmer name, escaping quotes", () => {
    const host = wired();
    expect(sh.buildSearchWhere(host, "  o'brien ")).toBe("(UPPER(f_inn) LIKE UPPER('%o''brien%') OR UPPER(F_NAME) LIKE UPPER('%o''brien%'))");
    expect(sh.buildSearchWhere(host, "  ")).toBe("1=0");
  });
});

describe("runAutoSearch", () => {
  test("ignores when unmounted; empty term resets search UI", async () => {
    const gone = wired({}, { _isMounted: false });
    await sh.runAutoSearch(gone, "x");
    expect(asMock(gone.setState)).not.toHaveBeenCalled();
    const host = wired({ searchLoading: true, searchError: "e", searchResultCount: 4 });
    await sh.runAutoSearch(host, "  ");
    expect(host.state).toMatchObject({ searchLoading: false, searchError: null, searchResultCount: null });
  });
  test("reports missing map/layer", async () => {
    const host = wired();
    await sh.runAutoSearch(host, "ali");
    expect(host.state.searchError).toBeTruthy();
  });
  test("composes regional clauses with numeric region/district", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({ fields: [field("region"), field("district")], createQuery: jest.fn(() => q) });
    const host = wired({
      featureLayer: asLayer(layer),
      activeMapView: mapViewWith(),
      regionalFilters: reg({ viloyat: "17", tuman: "5", yil: "2024", uzspace: "Paxta" }),
    });
    await sh.runAutoSearch(host, "ali");
    expect(q.where).toBe("search(ali) AND region = 17 AND district = 5 AND yil~2024 AND turi='Paxta'");
    expect(host.state.searchError).toBe("Излаш бўйича объект топилмади.");
    expect(host.state.searchResultCount).toBe(0);
    expect(host.state.searchLoading).toBe(false);
  });
  test("string typed region/district columns are quoted; name lookup via mapping", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({ fields: [field("region", "string"), field("district", "string")], createQuery: jest.fn(() => q) });
    const host = wired(
      { featureLayer: asLayer(layer), activeMapView: mapViewWith(), regionalFilters: reg({ viloyat: "Xorazm", tuman: "Urganch" }) },
      { _viloyatToRegion: { xorazm: 9 }, resolveDistrictNumber: (): number => 12 },
    );
    await sh.runAutoSearch(host, "a");
    expect(q.where).toBe("search(a) AND region = '9' AND district = '12'");
    const q2: Record<string, unknown> = {};
    const numeric = wired(
      { featureLayer: asLayer(makeLayer({ fields: [field("region")], createQuery: jest.fn(() => q2) })), activeMapView: mapViewWith(), regionalFilters: reg({ viloyat: "Xorazm" }) },
      { _viloyatToRegion: { xorazm: 9 } },
    );
    await sh.runAutoSearch(numeric, "a");
    expect(q2.where).toBe("search(a) AND region = 9");
    const q3: Record<string, unknown> = {};
    const strNum = wired({ featureLayer: asLayer(makeLayer({ fields: [field("region", "string")], createQuery: jest.fn(() => q3) })), activeMapView: mapViewWith(), regionalFilters: reg({ viloyat: "17" }) });
    await sh.runAutoSearch(strNum, "a");
    expect(q3.where).toBe("search(a) AND region = '17'");
  });
  test("falls back to name clauses without region columns", async () => {
    const q: Record<string, unknown> = {};
    const layer = makeLayer({ createQuery: jest.fn(() => q) });
    const host = wired(
      { featureLayer: asLayer(layer), activeMapView: mapViewWith(), regionalFilters: reg({ viloyat: "A", tuman: "B", uzspace: "C" }) },
      { getCategoryFieldName: (): null => null },
    );
    await sh.runAutoSearch(host, "a");
    expect(q.where).toBe("search(a) AND viloyat='A' AND tuman='B'");
    const q2: Record<string, unknown> = {};
    const noTuman = wired(
      { featureLayer: asLayer(makeLayer({ createQuery: jest.fn(() => q2) })), activeMapView: mapViewWith(), regionalFilters: reg({ tuman: "B" }) },
      { buildTumanNameClause: (): string => "" },
    );
    await sh.runAutoSearch(noTuman, "a");
    expect(q2.where).toBe("search(a)");
  });
  test("found feature: highlights spatial polygon, zooms and selects it", async () => {
    const goTo = jest.fn(() => Promise.resolve());
    const expand = jest.fn(() => "expanded");
    const spatial = { geometry: { extent: { expand } } };
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.resolve({ features: [{ attributes: { uniqueid: "U1" } }] })) });
    const host = wired(
      { featureLayer: asLayer(layer), activeMapView: mapViewWith(goTo), regionalFilters: reg({ yil: "1" }), currentPage: 5 },
      { findSpatialFeatureByUniqueId: jest.fn(() => Promise.resolve(spatial)) },
    );
    await sh.runAutoSearch(host, "ali");
    expect(mockClear).toHaveBeenCalled();
    expect(asMock(host.addSelectionGlow)).toHaveBeenCalled();
    expect(goTo).toHaveBeenCalledWith("expanded", expect.objectContaining({ duration: 700 }));
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(host.state).toMatchObject({ selecteduniqueid: "U1", searchText: "ali", isSearchActive: true, currentPage: 1, searchResultCount: 1, searchLoading: false });
    expect(asMock(host.fetchData)).toHaveBeenCalled();
  });
  test("goTo and highlight failures are tolerated; geometry fallback used without extent", async () => {
    const goTo = jest.fn(() => Promise.reject(new Error("interrupted")));
    const geometry = { id: "geom" };
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.resolve({ features: [{ attributes: { uniqueid: "U1" } }] })) });
    const host = wired(
      { featureLayer: asLayer(layer), activeMapView: mapViewWith(goTo), regionalFilters: reg({ yil: "1" }) },
      {
        findSpatialFeatureByUniqueId: jest.fn(() => Promise.resolve({ geometry })),
        addSelectionGlow: jest.fn(() => {
          throw new Error("glow");
        }),
      },
    );
    await sh.runAutoSearch(host, "ali");
    expect(goTo).toHaveBeenCalledWith(geometry, expect.anything());
    expect(host.state.selecteduniqueid).toBe("U1");
  });
  test("feature without uniqueid is counted but does not select", async () => {
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.resolve({ features: [{ attributes: {} }] })) });
    const find = jest.fn();
    const host = wired({ featureLayer: asLayer(layer), activeMapView: mapViewWith(), regionalFilters: reg({ yil: "1" }) }, { findSpatialFeatureByUniqueId: find });
    await sh.runAutoSearch(host, "ali");
    expect(find).not.toHaveBeenCalled();
    expect(host.state.selecteduniqueid).toBeUndefined();
    expect(host.state.searchResultCount).toBe(1);
  });
  test("query failure sets message and always clears the loader", async () => {
    const layer = makeLayer({ queryFeatures: jest.fn(() => Promise.reject(new Error("boom"))) });
    const host = wired({ featureLayer: asLayer(layer), activeMapView: mapViewWith() });
    await sh.runAutoSearch(host, "ali");
    expect(host.state.searchError).toBe("boom");
    expect(host.state.searchLoading).toBe(false);
    const nameless = makeLayer({ queryFeatures: jest.fn(() => Promise.reject("x")) });
    const h2 = wired({ featureLayer: asLayer(nameless), activeMapView: mapViewWith() });
    await sh.runAutoSearch(h2, "ali");
    expect(h2.state.searchError).toBe("Излаш амалга ошмади.");
  });
});

describe("clearSelectionAfterSearchClear", () => {
  const events: CustomEvent[] = [];
  beforeAll(() => document.addEventListener("widgetSelectionChanged", (e) => events.push(e as CustomEvent)));
  beforeEach(() => {
    events.length = 0;
    mockClear.mockClear();
  });

  test("no-op without selection", async () => {
    const host = wired();
    await sh.clearSelectionAfterSearchClear(host);
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("clears selection, restores extent, resets where and broadcasts", async () => {
    const goTo = jest.fn(() => Promise.resolve());
    const layer = makeLayer();
    const host = wired(
      { selecteduniqueid: "A", featureLayer: asLayer(layer), activeMapView: mapViewWith(goTo), viewMode: "graph" },
      { _extentBeforeTableSelection: { id: "ext" } },
    );
    await sh.clearSelectionAfterSearchClear(host);
    expect(mockClear).toHaveBeenCalled();
    expect(goTo).toHaveBeenCalledWith({ id: "ext" }, expect.anything());
    expect(host._extentBeforeTableSelection).toBeNull();
    expect(host.state.selecteduniqueid).toBe("");
    expect(layer.definitionExpression).toBe("base");
    expect(events.some((e) => e.detail.polygonMode === false)).toBe(true);
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
  });
  test("tolerates goTo and where failures", async () => {
    const goTo = jest.fn(() => Promise.reject(new Error("x")));
    const host = wired(
      { selecteduniqueid: "A", featureLayer: asLayer(makeLayer()), activeMapView: mapViewWith(goTo) },
      {
        _extentBeforeTableSelection: {},
        buildWhereClause: jest.fn(() => {
          throw new Error("w");
        }),
      },
    );
    await expect(sh.clearSelectionAfterSearchClear(host)).resolves.toBeUndefined();
    expect(host.state.selecteduniqueid).toBe("");
    expect(asMock(host.fetchRegionalTimeseries)).not.toHaveBeenCalled();
  });
});

describe("handleExternalTableSearchChanged", () => {
  test("ignored when unmounted", () => {
    const host = wired({}, { _isMounted: false });
    sh.handleExternalTableSearchChanged(host, ev({ query: "x" }));
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("empty query clears search, selection (unless preserved) and refetches when connected", () => {
    const host = wired({ connectionStatus: "connected", searchText: "x", isSearchActive: true, farmerInn: "1" });
    sh.handleExternalTableSearchChanged(host, ev({ query: "  " }));
    expect(host.state).toMatchObject({ searchText: "", isSearchActive: false, farmerInn: "" });
    expect(asMock(host.clearSelectionAfterSearchClear)).toHaveBeenCalled();
    expect(asMock(host.fetchData)).toHaveBeenCalled();
    const kept = wired({ connectionStatus: "idle" });
    sh.handleExternalTableSearchChanged(kept, ev({ query: "", preserveSelection: true }));
    expect(asMock(kept.clearSelectionAfterSearchClear)).not.toHaveBeenCalled();
    expect(asMock(kept.fetchData)).not.toHaveBeenCalled();
    sh.handleExternalTableSearchChanged(kept, ev(null));
    expect(kept.state.searchText).toBe("");
  });
  test("numeric query commits farmerInn; text query keeps the previous one", () => {
    const host = wired({ connectionStatus: "connected", farmerInn: " 99 " });
    sh.handleExternalTableSearchChanged(host, ev({ query: "123456" }));
    expect(host.state).toMatchObject({ searchText: "123456", isSearchActive: true, farmerInn: "123456" });
    expect(asMock(host.fetchData)).toHaveBeenCalledTimes(1);
    const text = wired({ connectionStatus: "idle", farmerInn: " 99 " });
    sh.handleExternalTableSearchChanged(text, ev({ query: "ali" }));
    expect(text.state.farmerInn).toBe("99");
    expect(asMock(text.fetchData)).not.toHaveBeenCalled();
    const short = wired({});
    sh.handleExternalTableSearchChanged(short, ev({ query: "1234" }));
    expect(short.state.farmerInn).toBe("");
  });
});

describe("handleExternalTableRowSelected", () => {
  const rec = (uniqueid: string): RecordData => ({ uniqueid });
  test("ignores unmounted, own source, and records without uniqueid", async () => {
    const gone = wired({}, { _isMounted: false });
    await sh.handleExternalTableRowSelected(gone, ev({ record: rec("a") }));
    const host = wired();
    await sh.handleExternalTableRowSelected(host, ev({ source: "AgriGraffWidget", record: rec("a") }));
    await sh.handleExternalTableRowSelected(host, ev({}));
    await sh.handleExternalTableRowSelected(host, ev({ record: {} }));
    expect(asMock(gone.handleRowClick)).not.toHaveBeenCalled();
    expect(asMock(host.handleRowClick)).not.toHaveBeenCalled();
  });
  test("clicks directly when the row is already loaded (brace-insensitive)", async () => {
    const host = wired({ records: [rec("{abc}")] });
    await sh.handleExternalTableRowSelected(host, ev({ record: rec("abc") }));
    expect(asMock(host.handleRowClick)).toHaveBeenCalledWith(rec("abc"));
    expect(host.state.records).toHaveLength(1);
  });
  test("prepends missing rows before clicking", async () => {
    const host = wired({ records: [rec("x")] });
    await sh.handleExternalTableRowSelected(host, ev({ record: rec("{new}") }));
    expect(host.state.records.map((r) => r.uniqueid)).toEqual(["{new}", "x"]);
    expect(asMock(host.handleRowClick)).toHaveBeenCalledWith(rec("{new}"));
  });
  test("does not duplicate if the row appeared concurrently", async () => {
    const host = wired({ records: [] });
    const original = asMock(host.setState).getMockImplementation();
    asMock(host.setState).mockImplementation((upd: unknown, cb?: () => void) => {
      host.state = { ...host.state, records: [rec("new")] };
      original?.(upd, cb);
    });
    await sh.handleExternalTableRowSelected(host, ev({ record: rec("new") }));
    expect(host.state.records).toHaveLength(1);
  });
});
