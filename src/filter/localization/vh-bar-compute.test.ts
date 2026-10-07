import type { VhServiceStatusRow } from "./vh-bar-aggregate";

const mockFlags = { republic: true, region: true };

const mockQueryDistinctRegions = jest.fn<Promise<number[]>, [{ year: string }]>();
const mockQueryLatestByRegion = jest.fn<
  Promise<Array<{ region: number; date: string }>>,
  [{ year: string }]
>();
const mockQueryMaxDate = jest.fn<Promise<string | null>, [Record<string, unknown>]>();
const mockQueryDates = jest.fn<Promise<string[]>, [Record<string, unknown>]>();
const mockByRegionScopes = jest.fn<
  Promise<VhServiceStatusRow[]>,
  [Array<{ region: number; date: string }>, string[] | undefined]
>();
const mockByStatus = jest.fn<Promise<VhServiceStatusRow[]>, [Record<string, unknown>]>();
const mockCounts = jest.fn<Promise<VhServiceStatusRow[]>, [Record<string, unknown>]>();

jest.mock("../../gis/agri-vegetation-data-source", () => ({
  queryVegetationDistinctRegions: (a: { year: string }) => mockQueryDistinctRegions(a),
  queryVegetationLatestDatesByRegion: (a: { year: string }) => mockQueryLatestByRegion(a),
  queryVegetationMaxRasterDate: (a: Record<string, unknown>) => mockQueryMaxDate(a),
  queryVegetationAvailableDates: (a: Record<string, unknown>) => mockQueryDates(a),
  get REPUBLIC_VH_USE_STATUS_STATS(): boolean {
    return mockFlags.republic;
  },
  get REGION_VH_BAR_USE_STATUS_STATS(): boolean {
    return mockFlags.region;
  },
}));

jest.mock("../../data/agri-stats-store", () => ({
  getVhBarStatusCountsByRegionScopesCached: (
    s: Array<{ region: number; date: string }>,
    c: string[] | undefined,
  ) => mockByRegionScopes(s, c),
  getVhBarStatusCountsByStatusCached: (a: Record<string, unknown>) => mockByStatus(a),
  getVhBarStatusCountsCached: (a: Record<string, unknown>) => mockCounts(a),
}));

import { executeVhBarCompute, type VhBarComputeDeps } from "./vh-bar-compute";
import { makeRegionDistrictKey, normalizeLocalizationApos } from "./geo-keys";

const row = (status: string, areaHa: number, count = 1): VhServiceStatusRow => ({
  ndvi_status: status,
  areaHa,
  count,
});

function makeDeps(overrides: Partial<VhBarComputeDeps> = {}): VhBarComputeDeps {
  return {
    state: { viloyat: "", lockedViloyat: null, tuman: "", yil: "2025" },
    isMounted: () => true,
    viloyatToRegion: { buxoro: 3 },
    tumanToDistrict: { "region:3|olot": 301 },
    normalizeApos: normalizeLocalizationApos,
    makeRegionDistrictKey,
    getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: false }),
    getSelectedTurlar: () => [],
    resolveCropIdForTuri: () => null,
    getVhBarUsedDate: () => null,
    setVhBarUsedDate: jest.fn(),
    setState: jest.fn(),
    prefetchVhStatusUniqueIds: jest.fn(),
    log: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFlags.republic = true;
  mockFlags.region = true;
});

describe("executeVhBarCompute early exits", () => {
  test("unknown viloyat yields zero result", async () => {
    const out = await executeVhBarCompute(
      makeDeps({ state: { viloyat: "Atlantis", lockedViloyat: null, tuman: "", yil: "2025" } }),
    );
    expect(out?.totalCount).toBe(0);
  });

  test("unknown tuman yields zero result", async () => {
    const out = await executeVhBarCompute(
      makeDeps({ state: { viloyat: "Buxoro", lockedViloyat: null, tuman: "Nowhere", yil: "2025" } }),
    );
    expect(out?.totalCount).toBe(0);
    expect(mockQueryMaxDate).not.toHaveBeenCalled();
  });

  test("unresolvable crop yields zero result", async () => {
    const out = await executeVhBarCompute(
      makeDeps({
        getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
        getSelectedTurlar: () => ["g", "x"],
        resolveCropIdForTuri: (t: string) => (t === "g" ? "1" : null),
      }),
    );
    expect(out?.totalCount).toBe(0);
  });

  test("missing year yields zero result", async () => {
    const out = await executeVhBarCompute(
      makeDeps({ state: { viloyat: "", lockedViloyat: null, tuman: "", yil: "yo'q" } }),
    );
    expect(out?.totalCount).toBe(0);
  });

  test("empty farmer selection yields zero result", async () => {
    const out = await executeVhBarCompute(makeDeps({ farmerUniqueIds: [] }));
    expect(out?.totalCount).toBe(0);
    expect(mockQueryLatestByRegion).not.toHaveBeenCalled();
  });
});

describe("executeVhBarCompute republic path", () => {
  test("unlocked: latest dates per region, status stats aggregated", async () => {
    mockQueryLatestByRegion.mockResolvedValue([
      { region: 1, date: "2025-09-01" },
      { region: 2, date: "2025-09-05" },
    ]);
    mockByRegionScopes.mockResolvedValue([row("yaxshi", 10), row("past", 30)]);
    const deps = makeDeps();
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(40);
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-05");
    expect(deps.log).toHaveBeenCalledWith("computeVhBarData:republic-result", expect.any(Object));
  });

  test("locked date uses distinct regions and falls back to per-scope counts", async () => {
    mockQueryDistinctRegions.mockResolvedValue([1, 2]);
    mockByRegionScopes.mockResolvedValue([]);
    mockCounts.mockResolvedValue([row("orta", 5)]);
    const out = await executeVhBarCompute(
      makeDeps({
        state: {
          viloyat: "",
          lockedViloyat: null,
          tuman: "",
          yil: "2025",
          ndviDate: "2025-08-01",
          ndviDateLocked: true,
        },
      }),
    );
    expect(mockCounts).toHaveBeenCalledTimes(2);
    expect(mockCounts).toHaveBeenCalledWith({ region: 1, date: "2025-08-01", cropIds: undefined });
    expect(out?.totalCount).toBe(10);
  });

  test("status-stats failure falls back to exact counts", async () => {
    mockQueryLatestByRegion.mockResolvedValue([{ region: 1, date: "2025-09-01" }]);
    mockByRegionScopes.mockRejectedValue(new Error("boom"));
    mockCounts.mockResolvedValue([row("yaxshi", 7)]);
    const out = await executeVhBarCompute(makeDeps());
    expect(out?.totalCount).toBe(7);
  });

  test("status stats disabled uses exact counts directly", async () => {
    mockFlags.republic = false;
    mockQueryLatestByRegion.mockResolvedValue([{ region: 1, date: "2025-09-01" }]);
    mockCounts.mockResolvedValue([row("yaxshi", 3)]);
    const out = await executeVhBarCompute(makeDeps());
    expect(mockByRegionScopes).not.toHaveBeenCalled();
    expect(out?.totalCount).toBe(3);
  });

  test("no scopes clears used date", async () => {
    mockQueryLatestByRegion.mockResolvedValue([]);
    const deps = makeDeps();
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(0);
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith(null);
  });

  test("unmounted after query returns null", async () => {
    mockQueryLatestByRegion.mockResolvedValue([{ region: 1, date: "2025-09-01" }]);
    const out = await executeVhBarCompute(makeDeps({ isMounted: () => false }));
    expect(out).toBeNull();
  });

  test("query failure logs and returns null", async () => {
    mockQueryLatestByRegion.mockRejectedValue(new Error("net"));
    const deps = makeDeps();
    expect(await executeVhBarCompute(deps)).toBeNull();
    expect(deps.log).toHaveBeenCalledWith("computeVhBarData:republic-failed", { error: "net" });
  });
});

describe("executeVhBarCompute region path", () => {
  const regionState = { viloyat: "Buxoro", lockedViloyat: null as string | null, tuman: "Olot", yil: "2025" };

  test("walks dates newest-first until non-empty and publishes used date", async () => {
    mockQueryMaxDate.mockResolvedValue("2025-09-10");
    mockQueryDates.mockResolvedValue(["2024-12-01", "2025-08-01", "2025-09-01", "2025-09-10"]);
    mockByStatus.mockResolvedValue([]);
    mockCounts
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([row("yaxshi", 12)]);
    const deps = makeDeps({ state: regionState });
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(12);
    expect(mockQueryMaxDate).toHaveBeenCalledWith(
      expect.objectContaining({ region: 3, district: 301, year: "2025" }),
    );
    expect(deps.setState).toHaveBeenCalledWith({
      ndviDateOptions: ["2025-08-01", "2025-09-01", "2025-09-10"],
    });
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-01");
    expect(deps.prefetchVhStatusUniqueIds).toHaveBeenCalledWith("2025-09-01");
    expect(deps.setState).toHaveBeenCalledWith({ ndviDate: "2025-09-01" });
  });

  test("numeric region/district and locked date with farmer filter", async () => {
    mockCounts.mockResolvedValue([row("past", 4)]);
    const deps = makeDeps({
      state: {
        viloyat: "3",
        lockedViloyat: null,
        tuman: "12",
        yil: "2025",
        ndviDate: "2025-07-01",
        ndviDateLocked: true,
      },
      farmerUniqueIds: [" a ", "a", ""],
    });
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(4);
    expect(mockByStatus).not.toHaveBeenCalled();
    expect(mockCounts).toHaveBeenCalledWith({
      region: 3,
      district: 12,
      date: "2025-07-01",
      cropIds: undefined,
      uniqueIds: ["a"],
    });
    expect(deps.setState).not.toHaveBeenCalled();
  });

  test("crop filter passes single crop id to max date query", async () => {
    mockQueryMaxDate.mockResolvedValue("2025-09-10");
    mockQueryDates.mockRejectedValue(new Error("x"));
    mockByStatus.mockResolvedValue([row("yaxshi", 2)]);
    const out = await executeVhBarCompute(
      makeDeps({
        state: { ...regionState, tuman: "" },
        getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
        getSelectedTurlar: () => ["g"],
        resolveCropIdForTuri: () => "7",
      }),
    );
    expect(mockQueryMaxDate).toHaveBeenCalledWith(expect.objectContaining({ cropId: "7" }));
    expect(out?.totalCount).toBe(2);
  });

  test("no candidate dates clears used date", async () => {
    mockQueryMaxDate.mockRejectedValue(new Error("x"));
    mockQueryDates.mockResolvedValue([]);
    const deps = makeDeps({ state: regionState });
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(0);
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith(null);
  });

  test("all candidates empty or failing returns zero result", async () => {
    mockQueryMaxDate.mockResolvedValue("2025-09-10");
    mockQueryDates.mockResolvedValue([]);
    mockByStatus.mockRejectedValue(new Error("x"));
    mockCounts.mockRejectedValue(new Error("y"));
    const deps = makeDeps({ state: regionState });
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(0);
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith(null);
  });

  test("unmounted during region walk returns null", async () => {
    mockQueryMaxDate.mockResolvedValue("2025-09-10");
    mockQueryDates.mockResolvedValue([]);
    expect(
      await executeVhBarCompute(makeDeps({ state: regionState, isMounted: () => false })),
    ).toBeNull();
  });

  test("status stats disabled skips by-status query", async () => {
    mockFlags.region = false;
    mockQueryMaxDate.mockResolvedValue("2025-09-10");
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockResolvedValue([row("orta", 1)]);
    const out = await executeVhBarCompute(makeDeps({ state: regionState }));
    expect(mockByStatus).not.toHaveBeenCalled();
    expect(out?.totalCount).toBe(1);
  });
});
