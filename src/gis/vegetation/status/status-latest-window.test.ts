jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("../__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);
// Agri_table hectares: unavailable by default (px fallback), set per test.
const mockTableArea = jest.fn();
jest.mock("../../agri-table-data-source", () => ({
  ...jest.requireActual("../../agri-table-data-source"),
  queryAgriTableAreaByUniqueId: (scope: unknown) => mockTableArea(scope),
}));
// Window resolution has its own tests (status-vh-window.test.ts); here one
// plain 10-day range ending at `date` stands in for the per-crop windows,
// unless a test sets `mockWindows` (real per-region × crop windows).
type TestWindow = { region: string | null; cropId: string | null; startDate: string; endDate: string; lookbackStart: string };
let mockWindows: TestWindow[] | null = null;
jest.mock("./status-vh-window", () => {
  const actual = jest.requireActual("./status-vh-window");
  const { dateRangeInclusiveClause } = jest.requireActual("../veg-base");
  return {
    ...actual,
    resolveVhStatusWindows: async (params: { date: string }) => {
      const endDate = String(params.date || "").trim();
      const startDate = actual.vhStatusWindowStart(endDate);
      const scope = actual.buildScopeClauses(params);
      const empty = { where: null, windows: [], startDate: "", endDate: "", scopeClauses: [], regionField: "region", cropField: "crop_id" };
      if (!startDate || !scope) return empty;
      if (mockWindows) {
        return {
          where: actual.buildVhWindowsWhere(mockWindows, "region", "crop_id", scope),
          windows: mockWindows,
          startDate: mockWindows[0].startDate,
          endDate: mockWindows[0].endDate,
          scopeClauses: scope,
          regionField: "region",
          cropField: "crop_id",
        };
      }
      return {
        where: [dateRangeInclusiveClause("raster_date", startDate, endDate), ...scope].join(" AND "),
        windows: [],
        startDate,
        endDate,
        scopeClauses: scope,
        regionField: "region",
        cropField: "crop_id",
      };
    },
  };
});

import { setAccessConfig } from "../../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../../data/agri-query-gateway";
import { MAX_HEAVY_QUERIES_PER_SERVICE, resetStatsQueryScheduler } from "../../../data/agri-query-scheduler";
import { VEG_PIXEL_AREA_HA } from "../veg-base";
import {
  queryVegetationLatestStatusAreas,
  queryVegetationLatestStatusCounts,
  queryVegetationLatestStatusSummary,
  vegetationLatestStatusCache,
  vegetationLatestStatusCountsCache,
  vegetationVhSummaryCache,
} from "./status-latest-window";
import { queryVegetationUniqueIdsForStatus } from "./status-uniqueids";
import { queryVegetationCropStatsForStatus } from "./status-crop-stats";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeAttrs,
  type FakeQuery,
  type FakeResponder,
  type FakeVegLayer,
} from "../__test-utils__/veg-fake-layer";

/** One grouped scan = 16 uniqueid slices fired in parallel. */
const SLICES = 16;

/** Apply `uniqueid < 'x'` / `uniqueid >= 'x'` predicates like the server would. */
const inUidRange = (where: string, id: unknown): boolean => {
  const value = String(id ?? "");
  for (const m of where.matchAll(/uniqueid (<|>=) '([^']*)'/g)) {
    if (m[1] === "<" ? !(value < m[2]) : !(value >= m[2])) return false;
  }
  return true;
};

const useLayer = (
  respond: FakeResponder,
  opts: { fields?: string[]; maxRecordCount?: number } = {},
): FakeVegLayer => {
  const layer = makeFakeVegLayer(
    async (q) => {
      const res = await respond(q);
      const rows = Array.isArray(res) ? res : res.rows;
      return rows.filter((r) => inUidRange(String(q.where || ""), r.uniqueid));
    },
    { maxRecordCount: opts.maxRecordCount },
  );
  setVegLayer(layer, opts.fields ?? DEFAULT_VEG_FIELDS);
  return layer;
};

const day = (ymd: string): number => Date.parse(`${ymd}T00:00:00Z`);
const isGrouped = (q: FakeQuery): boolean => Boolean(q.groupByFieldsForStatistics?.length);

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  resetStatsQueryScheduler();
  localStorage.clear();
  vegetationLatestStatusCache.clear();
  vegetationLatestStatusCountsCache.clear();
  vegetationVhSummaryCache.clear();
  mockWindows = null;
  mockTableArea.mockReset();
  mockTableArea.mockRejectedValue(new Error("table offline"));
});

describe("queryVegetationLatestStatusSummary", () => {
  test("each field counted once with its newest status, area from that reading", async () => {
    const layer = useLayer(() => [
      // f1: orta earlier, yaxshi on the newest day → yaxshi
      { uniqueid: "F1", ndvi_status: "orta", crop_id: "3", last_date: day("2026-09-22"), row_count: 2, max_px_all: 900 },
      { uniqueid: "f1", ndvi_status: "yaxshi", crop_id: "3", last_date: day("2026-09-29"), row_count: 1, max_px_all: 1000 },
      // f2: only seen on the partial last day
      { uniqueid: "{F2}", ndvi_status: "past", crop_id: "4", last_date: day("2026-09-30"), row_count: 1, max_px_all: 200 },
      // f3: same day duplicates → majority rows
      { uniqueid: "f3", ndvi_status: "past", crop_id: "3", last_date: day("2026-09-25"), row_count: 1, max_px_all: 50 },
      { uniqueid: "f3", ndvi_status: "orta", crop_id: "3", last_date: day("2026-09-25"), row_count: 3, max_px_all: 40 },
      { uniqueid: "", ndvi_status: "past", last_date: day("2026-09-25"), row_count: 1, max_px_all: 9 },
    ]);
    const summary = await queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });

    expect(summary.startDate).toBe("2026-09-21");
    expect(summary.fieldCount).toBe(3);
    const byStatus = Object.fromEntries(summary.rows.map((r) => [r.ndvi_status, r]));
    expect(byStatus.yaxshi).toEqual({ ndvi_status: "yaxshi", count: 1, areaHa: 1000 * VEG_PIXEL_AREA_HA, uniqueIds: ["F1"] });
    expect(byStatus.past).toEqual({ ndvi_status: "past", count: 1, areaHa: 200 * VEG_PIXEL_AREA_HA, uniqueIds: ["{F2}"] });
    expect(byStatus.orta).toEqual({ ndvi_status: "orta", count: 1, areaHa: 40 * VEG_PIXEL_AREA_HA, uniqueIds: ["f3"] });
    expect(summary.cropRowsByStatus.orta).toEqual([{ cropId: "3", areaHa: 40 * VEG_PIXEL_AREA_HA, fieldCount: 1 }]);

    const q = layer.executed[0];
    expect(q.where).toContain("raster_date >= DATE '2026-09-21'");
    expect(q.where).toContain("raster_date < DATE '2026-10-01'");
    expect(q.where).toContain("region='1724'");
    expect(q.groupByFieldsForStatistics).toEqual(["uniqueid", "ndvi_status", "crop_id"]);
  });

  test("the scan is split into 16 contiguous uniqueid slices fired in parallel", async () => {
    const layer = useLayer(() => []);
    await queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });
    const slices = layer.executed.map((q) => String(q.where).replace(/^.*\) AND /, ""));
    expect(slices).toHaveLength(SLICES);
    expect(slices[0]).toBe("uniqueid < '1'");
    expect(slices).toContain("uniqueid >= '9' AND uniqueid < 'a'");
    expect(slices[SLICES - 1]).toBe("uniqueid >= 'f'");
    // Every possible id lands in exactly one slice.
    for (const id of ["0", "00ab", "1", "9f", "A1", "a", "e9", "f", "ff", "{F2}", ""]) {
      expect(layer.executed.filter((q) => inUidRange(String(q.where), id))).toHaveLength(1);
    }
  });

  test("crop, district and farmer filters reach the WHERE; empty farmer list short-circuits", async () => {
    const layer = useLayer(() => []);
    await queryVegetationLatestStatusSummary({
      date: "2026-09-30",
      district: 5,
      cropIds: ["3", "4"],
      uniqueIds: ["abc"],
    });
    const where = String(layer.executed[0].where);
    expect(where).toContain("district='5'");
    expect(where).toContain("crop_id IN ('3','4')");
    expect(where).toContain("'abc'");

    const none = await queryVegetationLatestStatusSummary({ date: "2026-09-30", uniqueIds: [] });
    expect(none.rows).toEqual([]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(SLICES);
  });

  test("pages by uniqueid keyset; a field cut at the page edge is re-read whole", async () => {
    const id = (i: number): string => `id-${String(i).padStart(4, "0")}`;
    // 600 fields; id-0499 has two status groups straddling the 500-row page.
    const all: FakeAttrs[] = [];
    for (let i = 0; i < 600; i += 1) {
      if (i === 499) {
        all.push({ uniqueid: id(i), ndvi_status: "orta", last_date: day("2026-09-22"), row_count: 1, max_px_all: 1 });
      }
      all.push({ uniqueid: id(i), ndvi_status: "yaxshi", last_date: day("2026-09-30"), row_count: 1, max_px_all: 1 });
    }
    const layer = useLayer(
      (q) => all.filter((r) => inUidRange(String(q.where), r.uniqueid)).slice(0, 500),
      { maxRecordCount: 500 },
    );
    const summary = await queryVegetationLatestStatusSummary({ date: "2026-09-30" });
    expect(summary.fieldCount).toBe(600);
    expect(summary.rows).toEqual([
      expect.objectContaining({ ndvi_status: "yaxshi", count: 600 }),
    ]);
    // All ids start with "i" → one slice pages twice; 15 slices are empty.
    expect(layer.executed).toHaveLength(SLICES + 1);
    expect(layer.executed.every((q) => q.resultOffset === undefined)).toBe(true);
    expect(layer.executed[SLICES].where).toContain(`uniqueid >= '${id(499)}'`);
  });

  test("viloyat: falls back to raw rows when the grouped query is rejected; newest raster_date wins", async () => {
    const layer = useLayer(
      (q) => {
        if (isGrouped(q)) throw new Error("aggregated query not supported");
        if (String(q.where).includes("objectid > ")) return [];
        return [
          { objectid: 1, uniqueid: "a", ndvi_status: "past", px_all: 10, raster_date: day("2026-09-22") },
          { objectid: 2, uniqueid: "a", ndvi_status: "juda_yaxshi", px_all: 12, raster_date: day("2026-09-28") },
          { objectid: 3, uniqueid: "b", ndvi_status: "orta", px_all: 5, raster_date: day("2026-09-30") },
        ];
      },
      { maxRecordCount: 500 },
    );
    const summary = await queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });
    const byStatus = Object.fromEntries(summary.rows.map((r) => [r.ndvi_status, r.uniqueIds]));
    expect(byStatus).toEqual({ juda_yaxshi: ["a"], orta: ["b"] });
    expect(layer.executed.some((q) => !isGrouped(q))).toBe(true);
  });

  test("caches by WHERE and evicts on error", async () => {
    let fail = true;
    const layer = useLayer(() => {
      if (fail) throw new Error("x");
      return [];
    });
    await expect(queryVegetationLatestStatusSummary({ date: "2026-09-30" })).rejects.toThrow("x");
    fail = false;
    const afterFailure = layer.queryFeatures.mock.calls.length;
    await queryVegetationLatestStatusSummary({ date: "2026-09-30" });
    expect(layer.queryFeatures.mock.calls.length).toBe(afterFailure + SLICES);
    await queryVegetationLatestStatusSummary({ date: "2026-09-30" });
    expect(layer.queryFeatures.mock.calls.length).toBe(afterFailure + SLICES);
  });
});

describe("republic retry and season fallback", () => {
  const win = (region: string, lookbackStart = "2026-09-21"): TestWindow => ({
    region,
    cropId: "10",
    startDate: "2026-09-21",
    endDate: "2026-09-30",
    lookbackStart,
  });

  test("republic: scanned per viloyat straight away (no combined scan), never walking raw rows", async () => {
    mockWindows = [win("1724"), win("1730")];
    const layer = useLayer((q) => {
      const where = String(q.where);
      const both = where.includes("region='1724'") && where.includes("region='1730'");
      // The combined republic scan times out on the server — it must not be sent.
      if (both) throw new Error("combined republic scan sent");
      if (where.includes("region='1724'")) {
        return [{ uniqueid: "a1", ndvi_status: "yaxshi", crop_id: "10", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 }];
      }
      return [{ uniqueid: "b2", ndvi_status: "past", crop_id: "10", last_date: day("2026-09-28"), row_count: 1, max_px_all: 200 }];
    });
    const summary = await queryVegetationLatestStatusSummary({ date: "2026-09-30" });

    expect(summary.fields.map((f) => f.uniqueId).sort()).toEqual(["a1", "b2"]);
    expect(Object.fromEntries(summary.rows.map((r) => [r.ndvi_status, r.count]))).toEqual({ yaxshi: 1, past: 1 });
    expect(layer.executed.every(isGrouped)).toBe(true);
    // 16 slices per viloyat, no combined slices.
    expect(layer.queryFeatures.mock.calls.length).toBe(2 * SLICES);
  });

  test("viloyat: registered fields with no window reading take their newest season reading, by uniqueid", async () => {
    mockWindows = [win("1724", "2026-06-01")];
    const layer = useLayer((q) => {
      const where = String(q.where);
      if (where.includes("uniqueid IN")) {
        return [
          { uniqueid: "B2", ndvi_status: "orta", crop_id: "10", last_date: day("2026-08-01"), row_count: 1, max_px_all: 300 },
          { uniqueid: "B2", ndvi_status: "past", crop_id: "10", last_date: day("2026-08-15"), row_count: 2, max_px_all: 500 },
        ];
      }
      return [{ uniqueid: "a1", ndvi_status: "yaxshi", crop_id: "10", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 }];
    });
    mockTableArea.mockResolvedValue(
      new Map([
        ["a1", [{ uniqueId: "a1", region: "1724", cropId: "10", maydon: 1 }]],
        ["b2", [{ uniqueId: "B2", region: "1724", cropId: "10", maydon: 2 }]],
        // Crop without a window here → not a candidate.
        ["c3", [{ uniqueId: "c3", region: "1724", cropId: "6", maydon: 3 }]],
      ]),
    );
    const summary = await queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });

    expect(mockTableArea).toHaveBeenCalledWith({ region: 1724, district: undefined, year: "2026" });
    const byId = Object.fromEntries(summary.fields.map((f) => [f.uniqueId, f]));
    expect(Object.keys(byId).sort()).toEqual(["B2", "a1"]);
    expect(byId.B2).toEqual({ uniqueId: "B2", status: "past", cropId: "10", pxAll: 500 });
    expect(byId.a1.status).toBe("yaxshi");

    const fallback = layer.executed.filter((q) => String(q.where).includes("uniqueid IN"));
    expect(fallback).toHaveLength(1);
    expect(fallback[0].where).toContain("raster_date >= DATE '2026-06-01' AND raster_date < DATE '2026-09-21'");
    expect(fallback[0].where).toContain("region='1724'");
    expect(fallback[0].where).toContain("crop_id='10'");
    expect(fallback[0].where).toContain("'B2'");
    expect(fallback[0].where).not.toContain("'c3'");
  });

  test("the Agri_table read starts after the vegetation scan, not beside it (server overload)", async () => {
    mockWindows = [win("1724", "2026-06-01")];
    let releaseScan: () => void = () => undefined;
    const scanGate = new Promise<void>((resolve) => {
      releaseScan = resolve;
    });
    useLayer(async () => {
      await scanGate;
      return [{ uniqueid: "a1", ndvi_status: "yaxshi", crop_id: "10", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 }];
    });
    mockTableArea.mockResolvedValue(new Map());
    const pending = queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockTableArea).not.toHaveBeenCalled();
    releaseScan();
    await pending;
    expect(mockTableArea).toHaveBeenCalledWith({ region: 1724, district: undefined, year: "2026" });
  });

  test("a failed slice cancels the scan's queued requests", async () => {
    mockWindows = [win("1724")];
    const layer = useLayer(() => {
      throw new Error("Wait timeout for the request exceeded.");
    });
    await expect(queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 })).rejects.toThrow();
    // The lane's in-flight grouped requests + one raw-fallback page — not all 16 slices.
    expect(layer.queryFeatures.mock.calls.length).toBeLessThanOrEqual(MAX_HEAVY_QUERIES_PER_SERVICE + 1);
  });

  test("no lookback beyond the window → no table read for the fallback", async () => {
    mockWindows = [win("1724")];
    useLayer(() => [
      { uniqueid: "a1", ndvi_status: "yaxshi", crop_id: "10", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 },
    ]);
    await queryVegetationLatestStatusSummary({ date: "2026-09-30", region: 1724 });
    expect(mockTableArea).not.toHaveBeenCalled();
  });
});

describe("queryVegetationLatestStatusAreas (hectares from Agri_table maydon)", () => {
  const rows = (): FakeAttrs[] => [
    { uniqueid: "{A1}", ndvi_status: "yaxshi", crop_id: "10", last_date: day("2026-09-29"), row_count: 1, max_px_all: 1000 },
    { uniqueid: "b2", ndvi_status: "yaxshi", crop_id: "6", last_date: day("2026-09-28"), row_count: 1, max_px_all: 2000 },
    { uniqueid: "c3", ndvi_status: "past", crop_id: "10", last_date: day("2026-09-27"), row_count: 1, max_px_all: 3000 },
  ];

  test("same-crop row wins, another crop's row is the same land, no row keeps the px estimate", async () => {
    useLayer(rows);
    mockTableArea.mockResolvedValue(
      new Map([
        ["a1", [{ cropId: "10", maydon: 1.2 }, { cropId: "10", maydon: 0.3 }, { cropId: "15", maydon: 9 }]],
        ["b2", [{ cropId: "15", maydon: 2.5 }, { cropId: "16", maydon: 1.75 }]],
      ]),
    );
    const out = await queryVegetationLatestStatusAreas({ date: "2026-09-30", region: 1724, district: 5 });

    expect(mockTableArea).toHaveBeenCalledWith({ region: 1724, district: 5, year: "2026" });
    const byStatus = Object.fromEntries(out.rows.map((r) => [r.ndvi_status, r]));
    expect(byStatus.yaxshi.count).toBe(2);
    expect(byStatus.yaxshi.areaHa).toBeCloseTo(1.5 + 2.5, 10);
    expect(byStatus.yaxshi.uniqueIds.slice().sort()).toEqual(["b2", "{A1}"]);
    expect(byStatus.past.areaHa).toBeCloseTo(3000 * VEG_PIXEL_AREA_HA, 10);
    expect(out.cropRowsByStatus.yaxshi).toHaveLength(2);
    expect(out.cropRowsByStatus.yaxshi).toEqual(
      expect.arrayContaining([
        { cropId: "10", areaHa: 1.5, fieldCount: 1 },
        { cropId: "6", areaHa: 2.5, fieldCount: 1 },
      ]),
    );
    expect(out.startDate).toBe("2026-09-21");
    expect(out.endDate).toBe("2026-09-30");
  });

  test("table failure falls back to px areas", async () => {
    useLayer(rows);
    const out = await queryVegetationLatestStatusAreas({ date: "2026-09-30", region: 1724 });
    const yaxshi = out.rows.find((r) => r.ndvi_status === "yaxshi");
    expect(yaxshi?.areaHa).toBeCloseTo(3000 * VEG_PIXEL_AREA_HA, 10);
  });

  test("no fields → no table read", async () => {
    useLayer(() => []);
    await expect(queryVegetationLatestStatusAreas({ date: "2026-09-30", region: 1724 })).resolves.toEqual(
      expect.objectContaining({ rows: [] }),
    );
    expect(mockTableArea).not.toHaveBeenCalled();
  });
});

describe("queryVegetationLatestStatusCounts (VH bar)", () => {
  const rows = (): FakeAttrs[] => [
    { uniqueid: "a", ndvi_status: "past", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 },
    { uniqueid: "b", ndvi_status: "past", last_date: day("2026-09-28"), row_count: 1, max_px_all: 300 },
  ];

  test("hectares per status without id lists, with the window bounds; persisted across a fresh session", async () => {
    const layer = useLayer(rows);
    mockTableArea.mockResolvedValue(new Map([["a", [{ cropId: "", maydon: 0.5 }]], ["b", [{ cropId: "", maydon: 0.25 }]]]));
    const first = await queryVegetationLatestStatusCounts({ date: "2026-09-30", region: 1724 });
    expect(first).toEqual({
      rows: [{ ndvi_status: "past", count: 2, areaHa: 0.75, uniqueIds: [] }],
      startDate: "2026-09-21",
      endDate: "2026-09-30",
    });
    // New page load: memory caches empty, localStorage still warm.
    vegetationLatestStatusCache.clear();
    vegetationLatestStatusCountsCache.clear();
    vegetationVhSummaryCache.clear();
    await expect(queryVegetationLatestStatusCounts({ date: "2026-09-30", region: 1724 })).resolves.toEqual(first);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(SLICES);
  });

  test("farmer-scoped counts are not persisted", async () => {
    const layer = useLayer(rows);
    await queryVegetationLatestStatusCounts({ date: "2026-09-30", region: 1724, uniqueIds: ["a"] });
    vegetationLatestStatusCache.clear();
    vegetationLatestStatusCountsCache.clear();
    vegetationVhSummaryCache.clear();
    await queryVegetationLatestStatusCounts({ date: "2026-09-30", region: 1724, uniqueIds: ["a"] });
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2 * SLICES);
  });
});

describe("uniqueid + crop lookups share the bar's assignment", () => {
  const rows = (): FakeAttrs[] => [
    { uniqueid: "a", ndvi_status: "past", crop_id: "3", last_date: day("2026-09-29"), row_count: 1, max_px_all: 100 },
    { uniqueid: "b", ndvi_status: "past", crop_id: "4", last_date: day("2026-09-28"), row_count: 1, max_px_all: 300 },
    { uniqueid: "c", ndvi_status: "orta", crop_id: "3", last_date: day("2026-09-27"), row_count: 1, max_px_all: 50 },
  ];

  test("queryVegetationUniqueIdsForStatus returns the window assignment, one query for all statuses", async () => {
    const layer = useLayer(rows);
    await expect(
      queryVegetationUniqueIdsForStatus({ date: "2026-09-30", region: 1724, ndviStatus: "PAST" }),
    ).resolves.toEqual(["a", "b"]);
    await expect(
      queryVegetationUniqueIdsForStatus({ date: "2026-09-30", region: 1724, ndviStatus: "orta" }),
    ).resolves.toEqual(["c"]);
    await expect(
      queryVegetationUniqueIdsForStatus({ date: "2026-09-30", region: 1724, ndviStatus: "yaxshi" }),
    ).resolves.toEqual([]);
    await expect(queryVegetationUniqueIdsForStatus({ date: "", ndviStatus: "past" })).resolves.toEqual([]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(SLICES);
  });

  test("queryVegetationCropStatsForStatus partitions the bucket by crop_id", async () => {
    useLayer(rows);
    const crops = await queryVegetationCropStatsForStatus({ date: "2026-09-30", ndviStatus: " Past ", region: 1724 });
    expect(crops).toEqual([
      { cropId: "3", areaHa: 100 * VEG_PIXEL_AREA_HA, fieldCount: 1 },
      { cropId: "4", areaHa: 300 * VEG_PIXEL_AREA_HA, fieldCount: 1 },
    ]);
    await expect(queryVegetationCropStatsForStatus({ date: "2026-09-30", ndviStatus: "" })).resolves.toEqual([]);
  });
});
