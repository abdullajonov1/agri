import type { VhServiceStatusRow } from "./vh-bar-aggregate";

type CountsResult = {
  rows: VhServiceStatusRow[];
  startDate: string;
  endDate: string;
};

const mockQueryDates = jest.fn<Promise<string[]>, [Record<string, unknown>]>();
/** Fields + hectares per status in the per-crop VH windows (getVhBarLatestStatusCountsCached). */
const mockCounts = jest.fn<Promise<CountsResult>, [Record<string, unknown>]>();

jest.mock("../../gis/agri-vegetation-data-source", () => ({
  queryVegetationAvailableDates: (a: Record<string, unknown>) => mockQueryDates(a),
}));

jest.mock("../../data/agri-stats-store", () => ({
  getVhBarLatestStatusCountsCached: (a: Record<string, unknown>) => mockCounts(a),
}));

const mockSummary = jest.fn<Promise<CountsResult | null>, [Record<string, unknown>]>();

jest.mock("../../gis/vegetation/status/status-counts-summary", () => ({
  queryStatusCountsSummary: (a: Record<string, unknown>) => mockSummary(a),
}));

import { executeVhBarCompute, type VhBarComputeDeps } from "./vh-bar-compute";
import { makeRegionDistrictKey, normalizeLocalizationApos } from "./geo-keys";

const row = (status: string, areaHa: number, count = 1): VhServiceStatusRow => ({
  ndvi_status: status,
  areaHa,
  count,
});

const counts = (rows: VhServiceStatusRow[], endDate = "2025-09-30"): CountsResult => ({
  rows,
  startDate: "2025-04-21",
  endDate,
});

const areaOf = (
  out: { categories: Array<{ category: string; count: number }> } | null,
): Record<string, number> =>
  Object.fromEntries((out?.categories || []).map((c) => [c.category, c.count]));

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

const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

beforeEach(() => {
  jest.resetAllMocks();
  mockSummary.mockResolvedValue(null);
});

describe("executeVhBarCompute status-counts summary", () => {
  const buxoro = { viloyat: "Buxoro", lockedViloyat: null, tuman: "", yil: "2025" };

  test("unlocked viloyat builds the bar from summary rows", async () => {
    mockQueryDates.mockResolvedValue(["2025-09-20", "2025-09-30", "2025-09-10"]);
    mockSummary.mockResolvedValue(counts([row("yaxshi", 70, 7)]));
    const deps = makeDeps({ state: buxoro });
    const out = await executeVhBarCompute(deps);
    expect(mockSummary).toHaveBeenCalledWith({
      year: 2025,
      region: 3,
      district: undefined,
      cropIds: undefined,
    });
    expect(mockCounts).not.toHaveBeenCalled();
    expect(areaOf(out)["2-Yaxshi"]).toBe(70);
    await flush();
    expect(deps.setState).toHaveBeenCalledWith({ ndviDate: "2025-09-30" });
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-30");
  });

  test("summary resolves the bar while calendar dates are still pending", async () => {
    let resolveDates: (d: string[]) => void = () => undefined;
    mockQueryDates.mockReturnValue(new Promise<string[]>((r) => (resolveDates = r)));
    mockSummary.mockResolvedValue(counts([row("yaxshi", 70, 7)]));
    const deps = makeDeps({ state: buxoro });
    const out = await executeVhBarCompute(deps);
    expect(areaOf(out)["2-Yaxshi"]).toBe(70);
    expect(deps.setState).not.toHaveBeenCalled();
    expect(deps.setVhBarUsedDate).not.toHaveBeenCalled();
    resolveDates(["2025-09-20", "2025-09-30"]);
    await flush();
    expect(deps.setState).toHaveBeenCalledWith({ ndviDateOptions: ["2025-09-20", "2025-09-30"] });
    expect(deps.setState).toHaveBeenCalledWith({ ndviDate: "2025-09-30" });
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-30");
    expect(deps.prefetchVhStatusUniqueIds).toHaveBeenCalledWith("2025-09-30");
  });

  test("unmounted before dates resolve makes no setState", async () => {
    let resolveDates: (d: string[]) => void = () => undefined;
    mockQueryDates.mockReturnValue(new Promise<string[]>((r) => (resolveDates = r)));
    mockSummary.mockResolvedValue(counts([row("yaxshi", 70, 7)]));
    let mounted = true;
    const deps = makeDeps({ state: buxoro, isMounted: () => mounted });
    await executeVhBarCompute(deps);
    mounted = false;
    resolveDates(["2025-09-30"]);
    await flush();
    expect(deps.setState).not.toHaveBeenCalled();
    expect(deps.setVhBarUsedDate).not.toHaveBeenCalled();
  });

  test("old scan path still waits for the dates", async () => {
    let resolveDates: (d: string[]) => void = () => undefined;
    mockQueryDates.mockReturnValue(new Promise<string[]>((r) => (resolveDates = r)));
    mockCounts.mockResolvedValue(counts([row("past", 5)]));
    const deps = makeDeps({ state: buxoro });
    let settled = false;
    const pending = executeVhBarCompute(deps).then((o) => {
      settled = true;
      return o;
    });
    await flush();
    expect(settled).toBe(false);
    resolveDates(["2025-09-30"]);
    const out = await pending;
    expect(areaOf(out)["4-Past"]).toBe(5);
    expect(deps.setState).toHaveBeenCalledWith({ ndviDate: "2025-09-30" });
  });

  test("null summary falls back to the old scan", async () => {
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockResolvedValue(counts([row("past", 5)]));
    const out = await executeVhBarCompute(makeDeps({ state: buxoro }));
    expect(mockCounts).toHaveBeenCalledTimes(1);
    expect(areaOf(out)["4-Past"]).toBe(5);
  });

  test("locked calendar day skips the summary", async () => {
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockResolvedValue(counts([row("past", 5)], "2025-07-01"));
    await executeVhBarCompute(
      makeDeps({ state: { ...buxoro, ndviDate: "2025-07-01", ndviDateLocked: true } }),
    );
    expect(mockSummary).not.toHaveBeenCalled();
    expect(mockCounts).toHaveBeenCalledTimes(1);
  });

  test("farmer filter skips the summary", async () => {
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockResolvedValue(counts([row("past", 5)]));
    await executeVhBarCompute(makeDeps({ state: buxoro, farmerUniqueIds: ["u1"] }));
    expect(mockSummary).not.toHaveBeenCalled();
  });

  test("republic unlocked calls the summary without region", async () => {
    mockSummary.mockResolvedValue(counts([row("orta", 9)]));
    const out = await executeVhBarCompute(makeDeps());
    expect(mockSummary).toHaveBeenCalledWith({
      year: 2025,
      region: undefined,
      district: undefined,
      cropIds: undefined,
    });
    expect(mockCounts).not.toHaveBeenCalled();
    expect(areaOf(out)["3-O'rta"]).toBe(9);
  });
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
    expect(mockCounts).not.toHaveBeenCalled();
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
    expect(mockCounts).not.toHaveBeenCalled();
  });
});

describe("executeVhBarCompute republic path", () => {
  test("unlocked: one call for the whole year, every crop on its own window", async () => {
    mockCounts.mockResolvedValue(counts([row("yaxshi", 300, 30), row("past", 100, 10)]));
    const deps = makeDeps();
    const out = await executeVhBarCompute(deps);
    expect(mockCounts).toHaveBeenCalledTimes(1);
    expect(mockCounts).toHaveBeenCalledWith({
      region: undefined,
      district: undefined,
      date: "2025-12-31",
      cropIds: undefined,
      uniqueIds: undefined,
    });
    expect(areaOf(out)).toEqual({
      "1-Juda yaxshi": 0,
      "2-Yaxshi": 300,
      "3-O'rta": 0,
      "4-Past": 100,
    });
    expect(out?.totalCount).toBe(400);
    expect(out?.categories.find((c) => c.category === "2-Yaxshi")?.percentage).toBe(75);
    expect(mockQueryDates).not.toHaveBeenCalled();
    expect(deps.prefetchVhStatusUniqueIds).not.toHaveBeenCalled();
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-30");
    expect(deps.log).toHaveBeenCalledWith("computeVhBarData:republic-result", expect.any(Object));
  });

  test("locked date caps every window end", async () => {
    mockCounts.mockResolvedValue(counts([row("orta", 0.5)], "2025-08-01"));
    await executeVhBarCompute(
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
    expect(mockCounts).toHaveBeenCalledWith(expect.objectContaining({ date: "2025-08-01" }));
  });

  test("no fields clears used date", async () => {
    mockCounts.mockResolvedValue(counts([]));
    const deps = makeDeps();
    const out = await executeVhBarCompute(deps);
    expect(out?.totalCount).toBe(0);
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith(null);
  });

  test("query failure logs and returns null", async () => {
    mockCounts.mockRejectedValue(new Error("boom"));
    const deps = makeDeps();
    await expect(executeVhBarCompute(deps)).resolves.toBeNull();
    expect(deps.log).toHaveBeenCalledWith("computeVhBarData:republic-failed", { error: "boom" });
  });

  test("unmounted after query returns null", async () => {
    mockCounts.mockResolvedValue(counts([row("orta", 0.5)]));
    await expect(executeVhBarCompute(makeDeps({ isMounted: () => false }))).resolves.toBeNull();
  });
});

describe("executeVhBarCompute region path", () => {
  const buxoro = { viloyat: "Buxoro", lockedViloyat: null, tuman: "", yil: "2025" };

  test("viloyat: hectares per class, calendar options, NDVI date follows the newest window", async () => {
    mockQueryDates.mockResolvedValue(["2024-12-30", "2025-09-20", "2025-09-30"]);
    mockCounts.mockResolvedValue(
      counts([row("juda_yaxshi", 120, 3), row("Juda Yaxshi", 30, 1), row("orta", 50, 2)]),
    );
    const deps = makeDeps({ state: buxoro });
    const out = await executeVhBarCompute(deps);

    expect(mockCounts).toHaveBeenCalledWith({
      region: 3,
      district: undefined,
      date: "2025-12-31",
      cropIds: undefined,
      uniqueIds: undefined,
    });
    // Spellings of one class land in the same bucket.
    expect(areaOf(out)["1-Juda yaxshi"]).toBe(150);
    expect(out?.categories.find((c) => c.category === "1-Juda yaxshi")?.fieldCount).toBe(4);
    expect(areaOf(out)["3-O'rta"]).toBe(50);
    expect(deps.setState).toHaveBeenCalledWith({ ndviDateOptions: ["2025-09-20", "2025-09-30"] });
    expect(deps.setState).toHaveBeenCalledWith({ ndviDate: "2025-09-30" });
    expect(deps.setVhBarUsedDate).toHaveBeenCalledWith("2025-09-30");
    expect(deps.prefetchVhStatusUniqueIds).toHaveBeenCalledWith("2025-09-30");
    expect(deps.log).toHaveBeenCalledWith(
      "computeVhBarData:region-result",
      expect.objectContaining({ windowStart: "2025-04-21", windowEnd: "2025-09-30" }),
    );
  });

  test("numeric region/district, locked date, crop and farmer filters reach the query", async () => {
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockResolvedValue(counts([row("yaxshi", 0.6)], "2025-07-01"));
    const deps = makeDeps({
      state: {
        viloyat: "3",
        lockedViloyat: null,
        tuman: "301",
        yil: "2025",
        ndviDate: "2025-07-01",
        ndviDateLocked: true,
      },
      getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
      getSelectedTurlar: () => ["Noxot", "No'xat"],
      resolveCropIdForTuri: () => "9",
      farmerUniqueIds: ["u1", "u1", " "],
    });
    await executeVhBarCompute(deps);
    expect(mockCounts).toHaveBeenCalledWith({
      region: 3,
      district: 301,
      date: "2025-07-01",
      cropIds: ["9"],
      uniqueIds: ["u1"],
    });
    // A locked calendar day is never overwritten by the window end.
    expect(deps.setState).not.toHaveBeenCalledWith({ ndviDate: expect.any(String) });
  });

  test("calendar lookup failure does not block the bar", async () => {
    mockQueryDates.mockRejectedValue(new Error("dates down"));
    mockCounts.mockResolvedValue(counts([row("past", 0.3)]));
    const out = await executeVhBarCompute(makeDeps({ state: buxoro }));
    expect(areaOf(out)["4-Past"]).toBe(0.3);
  });

  test("region failure logs region-failed", async () => {
    mockQueryDates.mockResolvedValue([]);
    mockCounts.mockRejectedValue(new Error("x"));
    const deps = makeDeps({ state: buxoro });
    await expect(executeVhBarCompute(deps)).resolves.toBeNull();
    expect(deps.log).toHaveBeenCalledWith("computeVhBarData:region-failed", { error: "x" });
  });
});
