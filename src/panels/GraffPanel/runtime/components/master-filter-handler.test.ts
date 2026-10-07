jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockClear = jest.fn();
jest.mock("../graff-map-utils", () => ({ clearMapSelectionGraphics: (v: unknown): void => mockClear(v) }));

import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import { handleMasterFilterChanged } from "./master-filter-handler";

type Regional = AgriGraffWidgetState["regionalFilters"];
const reg = (r: Partial<Regional>): Regional => ({ viloyat: "", tuman: "", yil: "", uzspace: "", vh: "", ...r });
const ev = (detail: Record<string, unknown> | null): Event => ({ detail }) as unknown as Event;

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    normalizeApos: (s: string): string => s,
    filtersChanged: (a: Regional, b: Regional): boolean =>
      a.viloyat !== b.viloyat ||
      a.tuman !== b.tuman ||
      a.yil !== b.yil ||
      a.uzspace !== b.uzspace ||
      a.vh !== b.vh ||
      JSON.stringify(a.turlar || []) !== JSON.stringify(b.turlar || []),
    getFeatureLayerForViloyat: jest.fn(() => undefined),
    ...extra,
  });

const events: CustomEvent[] = [];
beforeAll(() => document.addEventListener("widgetSelectionChanged", (e) => events.push(e as CustomEvent)));
beforeEach(() => {
  events.length = 0;
  mockClear.mockClear();
});

describe("handleMasterFilterChanged guards", () => {
  test("ignores unmounted, missing filters, and own events", () => {
    const gone = wired({}, { _isMounted: false });
    handleMasterFilterChanged(gone, ev({ filters: { yil: "1" } }));
    const host = wired();
    handleMasterFilterChanged(host, ev(null));
    handleMasterFilterChanged(host, ev({}));
    handleMasterFilterChanged(host, ev({ filters: { yil: "1" }, source: "AgriGraffWidget" }));
    for (const h of [gone, host]) {
      expect(asMock(h.setState)).not.toHaveBeenCalled();
      expect(asMock(h.syncExternalPolygonSelection)).not.toHaveBeenCalled();
    }
  });
  test("drops events older than the last generation or timestamp, records newest", () => {
    const host = wired({}, { _lastMasterFilterBroadcastGeneration: 5, _lastMasterFilterTs: 1000 });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1" }, meta: { broadcastGeneration: 4 } }));
    handleMasterFilterChanged(host, ev({ filters: { yil: "1" }, meta: { timestamp: 900 } }));
    expect(asMock(host.setState)).not.toHaveBeenCalled();
    handleMasterFilterChanged(host, ev({ filters: { yil: "2024" }, meta: { broadcastGeneration: 6, timestamp: 2000 } }));
    expect(host._lastMasterFilterBroadcastGeneration).toBe(6);
    expect(host._lastMasterFilterTs).toBe(2000);
    expect(host.state.regionalFilters.yil).toBe("2024");
  });
});

describe("handleMasterFilterChanged data changes", () => {
  test("applies new filters, resets table state and schedules refresh", () => {
    const host = wired({
      regionalFilters: reg({ yil: "2023" }),
      records: [{ uniqueid: "x" }],
      currentPage: 4,
      selectedMonth: 3,
      language: "ru" as AgriGraffWidgetState["language"],
    });
    handleMasterFilterChanged(
      host,
      ev({
        filters: { yil: 2024, viloyat: "Xorazm", tuman: "Urganch", turi: "Paxta", vh: "Yaxshi", ndviDate: "2024-05-01", language: "en", barCategoryField: " f ", barCategoryValue: "v" },
        vhUniqueids: [" a ", "a", "b", ""],
        meta: { whereClause: "region = 17 AND district='1733'" },
      }),
    );
    expect(host.state.regionalFilters).toEqual({ viloyat: "Xorazm", tuman: "Urganch", yil: "2024", uzspace: "Paxta", turlar: ["Paxta"], vh: "Yaxshi" });
    expect(host.state).toMatchObject({
      vhUniqueids: ["a", "b"],
      selectedNdviDate: "2024-05-01",
      regionalRegionCode: 17,
      regionalDistrictCode: 1733,
      records: [],
      currentPage: 1,
      loading: true,
      language: "en",
      selectedMonth: null,
    });
    expect(host._barCategoryField).toBe("f");
    expect(host._barCategoryValue).toBe("v");
    expect(asMock(host.storeRegionDistrictMappingRow)).toHaveBeenCalledWith("Xorazm", 17, "Urganch", 1733);
    expect(asMock(host.publishVegetationOverlayContext)).toHaveBeenCalled();
    expect(asMock(host.scheduleRefresh)).toHaveBeenCalled();
  });
  test("viloyat from scope.lockedViloyat and layer routing", () => {
    const layer = { id: "L" };
    const host = wired({}, { getFeatureLayerForViloyat: jest.fn(() => layer) });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1" }, scope: { lockedViloyat: "Buxoro" } }));
    expect(host.state.regionalFilters.viloyat).toBe("Buxoro");
    expect(host.state.featureLayer).toBe(layer);
    expect(asMock(host.getFeatureLayerForViloyat)).toHaveBeenCalledWith("Buxoro");
  });
  test("stale region/district codes are dropped when geography changes without fresh codes", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A", tuman: "T", yil: "1" }), regionalRegionCode: 9, regionalDistrictCode: 8 });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", viloyat: "B", tuman: "U" } }));
    expect(host.state.regionalRegionCode).toBeNull();
    expect(host.state.regionalDistrictCode).toBeNull();
    expect(asMock(host.storeRegionDistrictMappingRow)).not.toHaveBeenCalled();
    const keep = wired({ regionalFilters: reg({ viloyat: "A", yil: "1" }), regionalRegionCode: 9 });
    handleMasterFilterChanged(keep, ev({ filters: { yil: "2", viloyat: "A" } }));
    expect(keep.state.regionalRegionCode).toBe(9);
    const republic = wired({ regionalFilters: reg({ viloyat: "A", yil: "1" }), regionalRegionCode: 9 });
    handleMasterFilterChanged(republic, ev({ filters: { yil: "1" } }));
    expect(republic.state.regionalRegionCode).toBeNull();
  });
  test("returning to republic resets indices; parent change clears vh unless included", () => {
    const host = wired({ regionalFilters: reg({ viloyat: "A", yil: "1", vh: "q" }), selectedIndices: ["savi"], vhUniqueids: ["z"] });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1" } }));
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
    expect(host.state.regionalFilters.vh).toBe("");
    const keepVh = wired({ regionalFilters: reg({ viloyat: "A", yil: "1", vh: "q" }) });
    handleMasterFilterChanged(keepVh, ev({ filters: { yil: "2", viloyat: "A", vh: "q" } }));
    expect(keepVh.state.regionalFilters.vh).toBe("q");
  });
  test("turlar list sets uzspace when single and dedupes", () => {
    const host = wired();
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", turlar: ["Paxta", "Paxta", ""] } }));
    expect(host.state.regionalFilters).toMatchObject({ uzspace: "", turlar: ["Paxta"] });
    const two = wired();
    handleMasterFilterChanged(two, ev({ filters: { yil: "1", turlar: ["A", "B"] } }));
    expect(two.state.regionalFilters.turlar).toEqual(["A", "B"]);
  });
  test("farmer INN activates search and survives geography change; otherwise search is cleared", () => {
    const withInn = wired({ regionalFilters: reg({ yil: "1" }), searchText: "old" });
    handleMasterFilterChanged(withInn, ev({ filters: { yil: "2", farmerInn: " 123 " } }));
    expect(withInn.state).toMatchObject({ farmerInn: "123", searchText: "123", isSearchActive: true });
    const cleared = wired({ regionalFilters: reg({ yil: "1" }), searchText: "old", isSearchActive: true, searchError: "e", searchResultCount: 3 });
    handleMasterFilterChanged(cleared, ev({ filters: { yil: "2" } }));
    expect(cleared.state).toMatchObject({ farmerInn: "", searchText: "", isSearchActive: false, searchError: null, searchResultCount: null });
    expect(cleared._extentBeforeTableSelection).toBeNull();
  });
});

describe("selected polygon handling", () => {
  test("geography change clears selection, graphics and broadcasts deselect", () => {
    const host = wired(
      { regionalFilters: reg({ yil: "1" }), selecteduniqueid: "{A}", viewMode: "graph", activeMapView: { view: { id: "v" } } as unknown as AgriGraffWidgetState["activeMapView"] },
      { _extentBeforeTableSelection: {} },
    );
    handleMasterFilterChanged(host, ev({ filters: { yil: "2" } }));
    expect(asMock(host.syncExternalPolygonSelection)).toHaveBeenCalledWith("", false, null);
    expect(host.state.selecteduniqueid).toBe("");
    expect(host._extentBeforeTableSelection).toBeNull();
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
    expect(events.some((e) => e.detail.polygonMode === false && e.detail.uniqueid === "")).toBe(true);
    expect(host.state.loadingVegetation).toBe(true);
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
  });
  test("VH status excluding the polygon releases the field", () => {
    const host = wired({ regionalFilters: reg({ yil: "1" }), selecteduniqueid: "A" });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", vh: "Yaxshi" }, vhUniqueids: ["b"] }));
    expect(host.state.selecteduniqueid).toBe("");
  });
  test("VH change keeping the polygon in graph mode refreshes vegetation series", () => {
    const host = wired({ regionalFilters: reg({ yil: "1" }), selecteduniqueid: "A", viewMode: "graph" });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", vh: "Yaxshi" }, vhUniqueids: ["a"] }));
    expect(host.state.selecteduniqueid).toBe("A");
    expect(asMock(host.fetchVegetationData)).toHaveBeenCalled();
    expect(asMock(host.fetchRegionalTimeseries)).not.toHaveBeenCalled();
  });
  test("polygon-only events sync selection without refetching data", () => {
    const host = wired({ regionalFilters: reg({ yil: "1" }), language: "ru" as AgriGraffWidgetState["language"] });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", uniqueid: " U1 ", polygonMode: true, uniqueidClickedAt: 77, language: "en" } }));
    expect(asMock(host.syncExternalPolygonSelection)).toHaveBeenCalledWith("U1", true, null, 77);
    expect(asMock(host.scheduleRefresh)).not.toHaveBeenCalled();
    expect(host.state.language).toBe("en");
  });
  test("unchanged data and same ndvi date only updates language when it differs", () => {
    const host = wired({ regionalFilters: reg({ yil: "1" }), selectedNdviDate: "d", language: "ru" as AgriGraffWidgetState["language"] });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", ndviDate: "d", language: "ru" } }));
    expect(asMock(host.setState)).not.toHaveBeenCalled();
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", ndviDate: "d", language: "uz" } }));
    expect(host.state.language).toBe("uz");
    expect(asMock(host.scheduleRefresh)).not.toHaveBeenCalled();
  });
  test("polygon sync passes uniqueid through when geography is unchanged and no click timestamp", () => {
    const host = wired({ regionalFilters: reg({ yil: "1" }) });
    handleMasterFilterChanged(host, ev({ filters: { yil: "1", polygonMode: false } }));
    expect(asMock(host.syncExternalPolygonSelection)).toHaveBeenCalledWith("", false, null, undefined);
  });
});
