const mockStats = jest.fn();
const mockBreakdown = jest.fn();
jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({
  VH_CATEGORY_TO_NDVI_STATUS: { Alo: "good" } as Record<string, string>,
  queryVegetationCropStatsForStatus: (a: unknown): unknown => mockStats(a),
  queryVegetationCropBreakdownForStatus: (a: unknown): unknown => mockBreakdown(a),
}));
jest.mock("../../../../../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));
const mockMappings = jest.fn();
const mockGetLayer = jest.fn();
const mockExpand = jest.fn();
jest.mock("../../../../../gis/agri-table-data-source", () => ({
  queryAgriTuriCropMappings: (): unknown => mockMappings(),
  getAgriTableDataLayer: (): unknown => mockGetLayer(),
  expandUniqueIdsForAgriTable: (ids: unknown): unknown => mockExpand(ids),
}));
const mockVhIds = jest.fn();
jest.mock("../../../../../gis/agri-chart-filter-order", () => ({
  getPieVhFilterUniqueIds: (): unknown => mockVhIds(),
  getPieVhFilterUniqueIdsSig: (): string => "sig",
}));
const mockPackReady = jest.fn();
const mockGetPack = jest.fn();
jest.mock("../../../../../store/agri-dashboard-store", () => ({
  waitForDashboardPackReady: (ms: number): unknown => mockPackReady(ms),
  getDashboardPack: (): unknown => mockGetPack(),
}));
const mockMatchPack = jest.fn();
jest.mock("../../../../../data/agri-dashboard-pack-match", () => ({
  matchPieDashboardPack: (...a: unknown[]): unknown => mockMatchPack(...a),
}));

import type { PieWidgetHost } from "../../pie-host";
import type { AgriPieState } from "../../widget";
import {
  _doFetchCategoryData,
  fetchCategoryData,
  fetchPieCategoriesViaVegetation,
  makeQueryKey,
} from "./pie-data-fetch";

type StatePatch = Partial<AgriPieState>;

const makeHost = (state: StatePatch = {}, overrides: Partial<PieWidgetHost> = {}): PieWidgetHost => {
  const host = {
    state: {
      yil: "2025",
      viloyat: "",
      lockedViloyat: "",
      tuman: "",
      vh: "",
      barCategoryField: null,
      barCategoryValue: null,
      filterPieByVh: false,
      pieVhUniqueIdsSig: "",
      ndviDate: "",
      selectedCategories: [],
      turlar: [],
      turi: "",
      loading: false,
      error: null,
      connectionStatus: "connected",
      ...state,
    },
    _isMounted: true,
    _fetchCounter: 0,
    _lastFetchKey: "",
    _pendingVhPieFetchKey: "",
    _hasCompletedFetch: false,
    _cropMapsReady: false,
    _cropIdToTuri: {} as Record<string, string>,
    _turiToCropId: {} as Record<string, string>,
    _fetchDebounceTimer: null,
    normalizeName: (s: string): string => String(s || "").trim().toLowerCase(),
    makeQueryKey: (...a: Parameters<typeof makeQueryKey> extends [PieWidgetHost, ...infer R] ? R : never): string =>
      makeQueryKey({} as PieWidgetHost, ...a),
    ensureCropIdMaps: jest.fn(() => Promise.resolve()),
    findCategoryField: jest.fn(() => "crop_id"),
    resolveNdviDateForVhPie: jest.fn(() => "2025-06-01"),
    resolveRegionDistrictForPie: jest.fn(() => Promise.resolve({ region: 1, district: undefined })),
    fetchPieCategoriesViaVegetation: jest.fn(() => Promise.resolve(false)),
    buildWhereClauseForDS: jest.fn(() => "1=1"),
    buildPieVhWhereChunks: jest.fn(() => null),
    queryCategoryStatsJSON: jest.fn(() => Promise.resolve([{ key: "1", value: 30 }, { key: "2", value: 70 }])),
    _doFetchCategoryData: jest.fn(),
    ...overrides,
  } as unknown as PieWidgetHost;
  host.setState = ((patch: StatePatch | ((p: AgriPieState) => StatePatch), cb?: () => void): void => {
    const p = typeof patch === "function" ? patch(host.state) : patch;
    host.state = { ...host.state, ...p };
    cb?.();
  }) as PieWidgetHost["setState"];
  return host;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetLayer.mockResolvedValue({ layer: { objectIdField: "OID" } });
  mockVhIds.mockReturnValue(null);
  mockPackReady.mockResolvedValue(undefined);
  mockGetPack.mockReturnValue(null);
  mockMatchPack.mockReturnValue(null);
  mockExpand.mockImplementation((ids: string[]) => Promise.resolve(ids.map((i) => i.toUpperCase())));
});

describe("makeQueryKey", () => {
  const h = {} as PieWidgetHost;
  it("joins all parts with pipes, blanking nullish values", () => {
    expect(makeQueryKey(h, "2025", "V", "T", "vh", "f", "v", true, "s", "d")).toBe("2025|V|T|vh|f|v|vhPie|s|d");
    expect(makeQueryKey(h, "", "", "", "")).toBe("||||||||");
  });
});

describe("fetchCategoryData (debounce)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("shows loader, debounces and replaces a pending timer", () => {
    const host = makeHost();
    fetchCategoryData(host);
    expect(host.state.loading).toBe(true);
    fetchCategoryData(host);
    jest.advanceTimersByTime(20);
    expect(host._doFetchCategoryData).toHaveBeenCalledTimes(1);
  });

  it("does not re-set loading when already loading", () => {
    const host = makeHost({ loading: true });
    const spy = jest.spyOn(host, "setState");
    fetchCategoryData(host);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("_doFetchCategoryData", () => {
  it("stops loader when the same key already completed", async () => {
    const host = makeHost({ loading: true });
    host._lastFetchKey = host.makeQueryKey("2025", "", "", "", null, null, false, "", "");
    await _doFetchCategoryData(host);
    expect(host.state.loading).toBe(false);
    expect(host.ensureCropIdMaps).not.toHaveBeenCalled();
  });

  it("keeps waiting when the VH-pending key is still loading", async () => {
    const host = makeHost({ loading: true });
    host._pendingVhPieFetchKey = host.makeQueryKey("2025", "", "", "", null, null, false, "", "");
    await _doFetchCategoryData(host);
    expect(host.state.loading).toBe(true);
    expect(mockGetLayer).not.toHaveBeenCalled();
  });

  it("empties the pie when yil is missing", async () => {
    const host = makeHost({ yil: "" });
    await _doFetchCategoryData(host);
    expect(host.state.categoryData).toEqual({ categories: [], totalValue: 0 });
    expect(host.state.loading).toBe(false);
    expect(host._hasCompletedFetch).toBe(false);
  });

  it("does nothing when not connected", async () => {
    const host = makeHost({ connectionStatus: "idle" });
    await _doFetchCategoryData(host);
    expect(mockGetLayer).not.toHaveBeenCalled();
    expect(host._fetchCounter).toBe(0);
  });

  it("loads and aggregates crop stats into categories", async () => {
    const host = makeHost({ selectedCategories: ["1"] });
    await _doFetchCategoryData(host);
    expect(host.state.loading).toBe(false);
    expect(host.state.categoryData.totalValue).toBe(100);
    expect(host.state.categoryData.categories).toHaveLength(2);
    expect(host.state.selectedCategories).toEqual(["1"]);
    expect(host._hasCompletedFetch).toBe(true);
    expect(host._lastFetchKey).toBe("2025||||||||");
    expect(host.state.debugInfo).toContain("Loaded 2 categories");
  });

  it("merges the same crop across VH where chunks", async () => {
    const queryCategoryStatsJSON = jest.fn(() => Promise.resolve([{ key: "1", value: 10 }, { key: " ", value: 5 }]));
    const host = makeHost(
      { filterPieByVh: true, vh: "Alo" },
      {
        queryCategoryStatsJSON,
        buildPieVhWhereChunks: jest.fn(() => ["a", "b"]),
        buildWhereClauseForDS: jest.fn(() => "yil=2025"),
      },
    );
    mockVhIds.mockReturnValue(["x"]);
    await _doFetchCategoryData(host);
    expect(mockExpand).toHaveBeenCalledWith(["x"]);
    expect(queryCategoryStatsJSON).toHaveBeenCalledTimes(2);
    expect(queryCategoryStatsJSON).toHaveBeenNthCalledWith(1, expect.anything(), "(yil=2025) AND (a)", "crop_id");
    expect(host.state.categoryData.totalValue).toBe(20);
    expect(host.state.categoryData.categories).toHaveLength(1);
  });

  it("uses chunk alone when where clause is 1=1 and skips geography for VH-scoped ids", async () => {
    const buildWhereClauseForDS = jest.fn(() => "1=1");
    const queryCategoryStatsJSON = jest.fn(() => Promise.resolve([]));
    const host = makeHost(
      { filterPieByVh: true, vh: "Alo", viloyat: "V" },
      { buildWhereClauseForDS, queryCategoryStatsJSON, buildPieVhWhereChunks: jest.fn(() => ["c"]) },
    );
    mockVhIds.mockReturnValue(["x"]);
    await _doFetchCategoryData(host);
    expect(buildWhereClauseForDS).toHaveBeenCalledWith(expect.objectContaining({ includeViloyat: false }));
    expect(queryCategoryStatsJSON).toHaveBeenCalledWith(expect.anything(), "c", "crop_id");
  });

  it("falls back to raw ids when expandUniqueIds fails", async () => {
    mockExpand.mockRejectedValue(new Error("boom"));
    const buildPieVhWhereChunks = jest.fn(() => null);
    const host = makeHost({ filterPieByVh: true, vh: "Alo" }, { buildPieVhWhereChunks });
    mockVhIds.mockReturnValue(["x", "y"]);
    await _doFetchCategoryData(host);
    expect(buildPieVhWhereChunks).toHaveBeenCalledWith(["x", "y"]);
  });

  it("returns early after VH vegetation handled the pie", async () => {
    const host = makeHost(
      { filterPieByVh: true, vh: "Alo" },
      { fetchPieCategoriesViaVegetation: jest.fn(() => Promise.resolve(true)) },
    );
    await _doFetchCategoryData(host);
    expect(host.queryCategoryStatsJSON).not.toHaveBeenCalled();
    expect(host._lastFetchKey).not.toBe("");
  });

  it("keeps loader and remembers pending key when VH ids are not ready", async () => {
    const host = makeHost({ filterPieByVh: true, vh: "Alo" });
    mockVhIds.mockReturnValue(null);
    await _doFetchCategoryData(host);
    expect(host.state.loading).toBe(true);
    expect(host._pendingVhPieFetchKey).not.toBe("");
    expect(host._lastFetchKey).toBe("");
    expect(host.queryCategoryStatsJSON).not.toHaveBeenCalled();
  });

  it("uses a matching dashboard pack instead of querying", async () => {
    mockMatchPack.mockReturnValue({ rows: [{ key: "7", value: 10 }] });
    const host = makeHost({ selectedCategories: ["nope"] });
    await _doFetchCategoryData(host);
    expect(mockPackReady).toHaveBeenCalledWith(2500);
    expect(host.queryCategoryStatsJSON).not.toHaveBeenCalled();
    expect(host.state.categoryData.categories.map((c) => c.key)).toEqual(["7"]);
    expect(host.state.selectedCategories).toEqual([]);
    expect(host._hasCompletedFetch).toBe(true);
  });

  it("reports an error when no category field exists", async () => {
    const host = makeHost({}, { findCategoryField: jest.fn(() => null) });
    // category field falls back to "crop_id", so only per-layer lookup yields none
    await _doFetchCategoryData(host);
    expect(host.queryCategoryStatsJSON).not.toHaveBeenCalled();
    expect(host.state.categoryData.categories).toEqual([]);
    expect(host.state.loading).toBe(false);
  });

  it("surfaces thrown errors with their message", async () => {
    const host = makeHost({}, { queryCategoryStatsJSON: jest.fn(() => Promise.reject(new Error("net down"))) });
    await _doFetchCategoryData(host);
    expect(host.state.error).toBe("net down");
    expect(host.state.loading).toBe(false);
    expect(host._hasCompletedFetch).toBe(true);
  });

  it("uses default error text for message-less failures", async () => {
    const host = makeHost({}, { queryCategoryStatsJSON: jest.fn(() => Promise.reject(new Error(""))) });
    await _doFetchCategoryData(host);
    expect(host.state.error).toBe("Failed to load data from layer.");
  });

  it("discards stale results when a newer fetch started", async () => {
    let resolveStats: (v: Array<{ key: string; value: number }>) => void = () => undefined;
    const host = makeHost(
      {},
      {
        queryCategoryStatsJSON: jest.fn(
          () => new Promise<Array<{ key: string; value: number }>>((r) => { resolveStats = r; }),
        ),
      },
    );
    const p = _doFetchCategoryData(host);
    await new Promise((r) => setTimeout(r, 0));
    host._fetchCounter += 1;
    resolveStats([{ key: "1", value: 5 }]);
    await p;
    expect(host.state.categoryData).toBeUndefined();
    expect(host._hasCompletedFetch).toBe(false);
  });
});

describe("fetchPieCategoriesViaVegetation", () => {
  it("returns false when the VH category or NDVI date is unknown", async () => {
    expect(await fetchPieCategoriesViaVegetation(makeHost({ vh: "Unknown" }), 0)).toBe(false);
    const noDate = makeHost({ vh: "Alo" }, { resolveNdviDateForVhPie: jest.fn(() => "") });
    expect(await fetchPieCategoriesViaVegetation(noDate, 0)).toBe(false);
  });

  it("returns true without state change when superseded", async () => {
    const host = makeHost({ vh: "Alo" });
    expect(await fetchPieCategoriesViaVegetation(host, 99)).toBe(true);
    expect(mockStats).not.toHaveBeenCalled();
  });

  it("builds categories, registers crop mappings and syncs selection", async () => {
    mockStats.mockResolvedValue([
      { cropId: "1", areaHa: 60 },
      { cropId: "1", areaHa: 20 },
      { cropId: "2", areaHa: 20 },
      { cropId: "", areaHa: 99 },
    ]);
    mockMappings.mockResolvedValue([
      { cropId: "1", turi: "Bugdoy" },
      { cropId: "", turi: "x" },
      { cropId: "2", turi: "" },
    ]);
    const host = makeHost({ vh: "Alo", selectedCategories: ["1"] });
    expect(await fetchPieCategoriesViaVegetation(host, 0)).toBe(true);
    expect(mockStats).toHaveBeenCalledWith({ date: "2025-06-01", ndviStatus: "good", region: 1, district: undefined });
    expect(host._cropIdToTuri).toEqual({ "1": "Bugdoy" });
    expect(host._cropMapsReady).toBe(true);
    expect(host.state.categoryData.totalValue).toBe(100);
    const first = host.state.categoryData.categories.find((c) => c.key === "1");
    expect(first?.value).toBe(80);
    expect(host.state.selectedCategories).toEqual(["1"]);
    expect(host.state.turi).toBe("1");
    expect(host._hasCompletedFetch).toBe(true);
  });

  it("returns false (join path) when stats fail at region scale", async () => {
    mockStats.mockRejectedValue(new Error("x"));
    const host = makeHost({ vh: "Alo" });
    expect(await fetchPieCategoriesViaVegetation(host, 0)).toBe(false);
    expect(mockBreakdown).not.toHaveBeenCalled();
  });

  it("falls back to exact breakdown for district scope", async () => {
    mockStats.mockRejectedValue(new Error("x"));
    mockBreakdown.mockResolvedValue([{ cropId: "3", areaHa: 10 }]);
    mockMappings.mockResolvedValue([]);
    const host = makeHost(
      { vh: "Alo" },
      { resolveRegionDistrictForPie: jest.fn(() => Promise.resolve({ region: 1, district: 4 })) },
    );
    expect(await fetchPieCategoriesViaVegetation(host, 0)).toBe(true);
    expect(mockBreakdown).toHaveBeenCalledWith({ date: "2025-06-01", ndviStatus: "good", region: 1, district: 4 });
    expect(host.state.categoryData.categories[0].key).toBe("3");
  });

  it("returns false when the crop mix is empty", async () => {
    mockStats.mockResolvedValue([{ cropId: "1", areaHa: 0 }]);
    mockMappings.mockResolvedValue([]);
    expect(await fetchPieCategoriesViaVegetation(makeHost({ vh: "Alo" }), 0)).toBe(false);
  });
});
