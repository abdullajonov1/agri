jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("./__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);

import { setAccessConfig } from "../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../data/agri-query-gateway";
import {
  VEG_AVG_FIELDS,
  VEG_PIXEL_AREA_HA,
  vegetationAvailableDatesCache,
  vegetationAvgNdviByUniqueIdCache,
  vegetationAvgNdviOidCursorCache,
  vegetationDistinctCropIdsCache,
  vegetationDistinctDistrictsCache,
  vegetationDistinctRegionsCache,
  vegetationLatestDatesByRegionCache,
  vegetationMaxDateByRegionCache,
  vegetationMaxRasterDateCache,
  vegetationRegionalTimeseriesCache,
  vegetationSeriesByUniqueIdCache,
} from "./veg-base";
import {
  queryVegetationAvailableDates,
  queryVegetationAvgNdviByUniqueIdOnce,
  queryVegetationAvgNdviByUniqueIdPaged,
  queryVegetationDistinctCropIds,
  queryVegetationDistinctDistricts,
  queryVegetationDistinctRegions,
  queryVegetationLatestDatesByRegion,
  queryVegetationMaxRasterDate,
  queryVegetationMaxRasterDateByRegion,
  queryVegetationRegionalTimeseries,
  queryVegetationSeriesForUniqueId,
} from "./veg-series";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeAttrs,
  type FakeQuery,
  type FakeResponder,
  type FakeVegLayer,
} from "./__test-utils__/veg-fake-layer";

const useLayer = (
  respond: FakeResponder,
  opts: { fields?: string[]; maxRecordCount?: number } = {},
): FakeVegLayer => {
  const layer = makeFakeVegLayer(respond, { maxRecordCount: opts.maxRecordCount });
  setVegLayer(layer, opts.fields ?? DEFAULT_VEG_FIELDS);
  return layer;
};

const statNames = (q: FakeQuery): string[] =>
  (q.outStatistics ?? []).map((s) => String(s.outStatisticFieldName));

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  [
    vegetationSeriesByUniqueIdCache,
    vegetationRegionalTimeseriesCache,
    vegetationAvailableDatesCache,
    vegetationLatestDatesByRegionCache,
    vegetationDistinctCropIdsCache,
    vegetationDistinctRegionsCache,
    vegetationDistinctDistrictsCache,
    vegetationMaxRasterDateCache,
    vegetationMaxDateByRegionCache,
    vegetationAvgNdviByUniqueIdCache,
    vegetationAvgNdviOidCursorCache,
  ].forEach((m) => m.clear());
});

describe("queryVegetationSeriesForUniqueId", () => {
  test("blank id returns [] without querying", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationSeriesForUniqueId("  ")).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("queries braced and bare variants in one OR query ordered by date", async () => {
    const layer = useLayer(() => [
      { raster_date: 1, ndvi: 0.4 },
      { raster_date: 2, ndvi: 0.5 },
    ]);
    const rows = await queryVegetationSeriesForUniqueId("{ABC-1}");
    expect(rows).toEqual([
      { raster_date: 1, ndvi: 0.4 },
      { raster_date: 2, ndvi: 0.5 },
    ]);
    const q = layer.executed[0];
    expect(q.where).toBe("uniqueid='{ABC-1}' OR uniqueid='ABC-1'");
    expect(q.outFields).toEqual(["*"]);
    expect(q.orderByFields).toEqual(["raster_date ASC"]);
  });

  test("braced and bare ids share one cache entry", async () => {
    const layer = useLayer(() => [{ ndvi: 1 }]);
    await queryVegetationSeriesForUniqueId("abc");
    await queryVegetationSeriesForUniqueId("{abc}");
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });

  test("escapes quotes in ids", async () => {
    const layer = useLayer(() => []);
    await queryVegetationSeriesForUniqueId("a'b");
    expect(layer.executed[0].where).toBe("uniqueid='a''b' OR uniqueid='{a''b}'");
  });

  test("failed request is evicted so the next call retries", async () => {
    let fail = true;
    const layer = useLayer(() => {
      if (fail) throw new Error("boom");
      return [{ ndvi: 2 }];
    });
    await expect(queryVegetationSeriesForUniqueId("x1")).rejects.toThrow("boom");
    fail = false;
    await expect(queryVegetationSeriesForUniqueId("x1")).resolves.toEqual([{ ndvi: 2 }]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });

  test("keeps at most 64 cached series", async () => {
    useLayer(() => []);
    for (let i = 0; i < 70; i++) {
      await queryVegetationSeriesForUniqueId(`id-${i}`);
    }
    expect(vegetationSeriesByUniqueIdCache.size).toBe(64);
    expect(vegetationSeriesByUniqueIdCache.has("id-0")).toBe(false);
    expect(vegetationSeriesByUniqueIdCache.has("id-69")).toBe(true);
  });
});

describe("queryVegetationRegionalTimeseries", () => {
  test("requires a date window", async () => {
    const layer = useLayer(() => []);
    await expect(
      queryVegetationRegionalTimeseries({ region: 1, startDate: "2024-01-01" }),
    ).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("builds scoped WHERE and averages only known fields", async () => {
    const layer = useLayer(() => [
      { raster_date: 111, avg_ndvi: 0.6, polygon_count: 12 },
      { raster_date: 222, avg_ndvi: 0.7 },
    ]);
    const rows = await queryVegetationRegionalTimeseries({
      region: 1724,
      district: 1724401,
      ndviStatus: "past",
      startDate: "2024-05-01",
      endDate: "2024-05-31",
      cropIds: ["3", "4"],
      avgFields: ["ndvi", "bogus"],
    });
    const q = layer.executed[0];
    expect(q.where).toBe(
      "region='1724' AND district='1724401' AND ndvi_status='past' AND " +
        "raster_date >= DATE '2024-05-01' AND raster_date <= DATE '2024-05-31' AND crop_id IN ('3','4')",
    );
    expect(statNames(q)).toEqual(["avg_ndvi", "polygon_count"]);
    expect(q.groupByFieldsForStatistics).toEqual(["raster_date"]);

    expect(rows[0]).toMatchObject({
      date: 111,
      polygon_count: 12,
      ndvi: 0.6,
      ndvi_min: 0.6,
      ndvi_max: 0.6,
      savi: null,
      savi_min: null,
    });
    expect(rows[1].polygon_count).toBe(0);
    expect(Object.keys(rows[0]).sort()).toEqual(
      ["date", "polygon_count", ...VEG_AVG_FIELDS].sort(),
    );
  });

  test("falls back to the full field set when no requested field is valid", async () => {
    const layer = useLayer(() => []);
    await queryVegetationRegionalTimeseries({
      startDate: "2024-05-01",
      endDate: "2024-05-31",
      cropId: "9",
      avgFields: ["nope"],
    });
    expect(statNames(layer.executed[0])).toHaveLength(VEG_AVG_FIELDS.length + 1);
    expect(layer.executed[0].where).toContain("crop_id='9'");
  });

  test("uses the real avg_min value when present", async () => {
    useLayer(() => [{ raster_date: 1, avg_ndvi: 0.5, avg_ndvi_min: 0.1 }]);
    const [row] = await queryVegetationRegionalTimeseries({
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(row.ndvi_min).toBe(0.1);
    expect(row.ndvi_max).toBe(0.5);
  });

  test("identical requests reuse the cached promise", async () => {
    const layer = useLayer(() => []);
    const p = { startDate: "2024-05-01", endDate: "2024-05-31" };
    await queryVegetationRegionalTimeseries(p);
    await queryVegetationRegionalTimeseries(p);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });
});

describe("queryVegetationAvailableDates", () => {
  test("returns distinct sorted YYYY-MM-DD dates and skips invalid values", async () => {
    const layer = useLayer(() => [
      { raster_date: Date.UTC(2024, 4, 20) },
      { raster_date: Date.UTC(2024, 4, 1) },
      { raster_date: Date.UTC(2024, 4, 20, 12) },
      { raster_date: null },
    ]);
    await expect(queryVegetationAvailableDates()).resolves.toEqual([
      "2024-05-01",
      "2024-05-20",
    ]);
    expect(layer.executed[0].where).toBe("1=1");
  });

  test("scopes by region and district", async () => {
    const layer = useLayer(() => []);
    await queryVegetationAvailableDates({ region: 1724, district: 5 });
    expect(layer.executed[0].where).toBe("region='1724' AND district='5'");
  });
});

describe("queryVegetationLatestDatesByRegion", () => {
  test("returns latest date per region sorted by region code", async () => {
    const layer = useLayer(() => [
      { region: 1730, max_raster_date: Date.UTC(2024, 8, 1) },
      { region: 1703, max_raster_date: Date.UTC(2024, 8, 10) },
      { region: "x", max_raster_date: Date.UTC(2024, 8, 10) },
      { region: 1706, max_raster_date: null },
      { region: 1708, raster_date: Date.UTC(2024, 7, 31) },
    ]);
    const out = await queryVegetationLatestDatesByRegion({ year: "2024" });
    expect(out).toEqual([
      { region: 1703, date: "2024-09-10" },
      { region: 1708, date: "2024-08-31" },
      { region: 1730, date: "2024-09-01" },
    ]);
    expect(layer.executed[0].where).toContain("raster_date >= DATE '2024-01-01'");
  });

  test("omits the year window when no year is given", async () => {
    const layer = useLayer(() => []);
    await queryVegetationLatestDatesByRegion();
    expect(layer.executed[0].where).toBe("region IS NOT NULL AND raster_date IS NOT NULL");
  });
});

describe("distinct scans", () => {
  test("crop ids: groups by crop_id, keeps requested filter, drops blanks", async () => {
    const layer = useLayer(() => [{ crop_id: "3" }, { crop_id: " " }, { crop_id: 4 }]);
    const out = await queryVegetationDistinctCropIds({ region: 1, year: "2024", cropIds: ["3", "4", "3"] });
    expect(out).toEqual(["3", "4"]);
    const q = layer.executed[0];
    expect(q.where).toContain("crop_id IN ('3','4')");
    expect(q.where).toMatch(/crop_id IS NOT NULL$/);
    expect(q.groupByFieldsForStatistics).toEqual(["crop_id"]);
  });

  test("crop ids with no scope only filters nulls", async () => {
    const layer = useLayer(() => []);
    await queryVegetationDistinctCropIds();
    expect(layer.executed[0].where).toBe("crop_id IS NOT NULL");
  });

  test("regions: filters non-numeric codes and adds year window", async () => {
    const layer = useLayer(() => [{ region: 1703 }, { region: "abc" }, { region: "1724" }]);
    await expect(queryVegetationDistinctRegions({ year: "FY 2023" })).resolves.toEqual([
      1703, 1724,
    ]);
    expect(layer.executed[0].where).toBe(
      "region IS NOT NULL AND raster_date >= DATE '2023-01-01' AND raster_date < DATE '2024-01-01'",
    );
  });

  test("districts: non-finite region short-circuits", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationDistinctDistricts({ region: Number.NaN })).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("districts: scoped query returns numeric districts", async () => {
    const layer = useLayer(() => [{ district: 1724401 }, { district: null }, { district: "z" }]);
    const out = await queryVegetationDistinctDistricts({
      region: 1724,
      cropId: "3",
      startDate: "2024-05-01",
      endDate: "2024-05-02",
    });
    // Number(null) === 0 is finite, so a null district yields 0.
    expect(out).toEqual([1724401, 0]);
    expect(layer.executed[0].where).toMatch(/^region='1724' AND raster_date .* AND crop_id='3' AND district IS NOT NULL$/);
  });

  test("max raster date: applies an inclusive cap and formats result", async () => {
    const layer = useLayer(() => [{ max_raster_date: Date.UTC(2024, 5, 30) }]);
    await expect(
      queryVegetationMaxRasterDate({ region: 1, cropId: "3", endDateCap: "2024-06-30" }),
    ).resolves.toBe("2024-06-30");
    expect(layer.executed[0].where).toBe(
      "region='1' AND crop_id='3' AND raster_date < DATE '2024-07-01' AND raster_date IS NOT NULL",
    );
  });

  test("max raster date: ignores malformed cap and returns null for empty result", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationMaxRasterDate({ endDateCap: "June" })).resolves.toBeNull();
    expect(layer.executed[0].where).toBe("raster_date IS NOT NULL");
  });

  test("max date by region: no year means no query", async () => {
    const layer = useLayer(() => []);
    const out = await queryVegetationMaxRasterDateByRegion({ year: "" });
    expect(out.size).toBe(0);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("max date by region: maps region -> latest date with cap", async () => {
    const layer = useLayer(() => [
      { region: 1703, max_raster_date: Date.UTC(2024, 8, 1) },
      { region: "bad", max_raster_date: Date.UTC(2024, 8, 1) },
      { region: 1706, max_raster_date: null },
    ]);
    const out = await queryVegetationMaxRasterDateByRegion({ year: "2024", endDateCap: "2024-12-31" });
    expect(Array.from(out.entries())).toEqual([[1703, "2024-09-01"]]);
    expect(layer.executed[0].where).toContain("raster_date < DATE '2025-01-01'");
  });
});

describe("queryVegetationAvgNdviByUniqueIdOnce", () => {
  test("maps rows, computes area and reports not truncated", async () => {
    const layer = useLayer(
      () => [
        { uniqueid: " u1 ", avg_ndvi: 0.5, max_px_all: 1000 },
        { uniqueid: "", avg_ndvi: 0.5, max_px_all: 1 },
        { uniqueid: "u2", avg_ndvi: "nan", max_px_all: 1 },
        { uniqueid: "u3", avg_ndvi: 0.2, max_px_all: null },
      ],
      { maxRecordCount: 2000 },
    );
    const res = await queryVegetationAvgNdviByUniqueIdOnce({
      region: 1724,
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(res.truncated).toBe(false);
    expect(res.maxRecordCount).toBe(2000);
    expect(res.rows).toEqual([
      { uniqueid: "u1", avgNdvi: 0.5, maxPxAll: 1000, areaHa: 1000 * VEG_PIXEL_AREA_HA },
      { uniqueid: "u3", avgNdvi: 0.2, maxPxAll: 0, areaHa: 0 },
    ]);
    const q = layer.executed[0];
    expect(q.where).toMatch(/uniqueid IS NOT NULL AND ndvi IS NOT NULL$/);
    expect(q.num).toBe(2000);
    expect(statNames(q)).toEqual(["avg_ndvi", "max_px_all"]);
  });

  test("clamps maxRecordCount and flags exceededTransferLimit as truncated", async () => {
    useLayer(() => ({ rows: [], exceededTransferLimit: true }), { maxRecordCount: 100 });
    const res = await queryVegetationAvgNdviByUniqueIdOnce({
      region: 1,
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(res.maxRecordCount).toBe(500);
    expect(res.truncated).toBe(true);
    expect(res.exceededTransferLimit).toBe(true);
  });

  test("treats a full page as truncated and honours renamed id field", async () => {
    const rows: FakeAttrs[] = Array.from({ length: 500 }, (_, i) => ({
      UniqueID: `u${i}`,
      avg_ndvi: 0.1,
      max_px_all: 1,
    }));
    const layer = useLayer(() => rows, {
      maxRecordCount: 500,
      fields: ["UniqueID", "NDVI", "PX_ALL"],
    });
    const res = await queryVegetationAvgNdviByUniqueIdOnce({
      region: 1,
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(res.truncated).toBe(true);
    expect(res.rows).toHaveLength(500);
    expect(layer.executed[0].groupByFieldsForStatistics).toEqual(["UniqueID"]);
    expect((layer.executed[0].outStatistics ?? [])[0].onStatisticField).toBe("NDVI");
  });
});

describe("queryVegetationAvgNdviByUniqueIdPaged", () => {
  const base = {
    region: 1724,
    startDate: "2024-05-01",
    endDate: "2024-05-31",
  };

  test("fans out to 17 uniqueid-prefix shards and merges with seed rows", async () => {
    const layer = useLayer((q) =>
      String(q.where).includes("LIKE 'a%')") && !String(q.where).includes(" > '")
        ? [{ uniqueid: "a1", avg_ndvi: 0.3, max_px_all: 10 }]
        : [],
    );
    const seed = [{ uniqueid: "s1", avgNdvi: 0.9, maxPxAll: 1, areaHa: VEG_PIXEL_AREA_HA }];
    const rows = await queryVegetationAvgNdviByUniqueIdPaged({ ...base, seedRows: seed, pageSize: 0 });
    expect(rows.map((r) => r.uniqueid).sort()).toEqual(["a1", "s1"]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(17);
    expect(layer.executed.every((q) => q.num === 2000)).toBe(true);
    expect(layer.executed.some((q) => String(q.where).includes("NOT ("))).toBe(true);
  });

  test("continues a full shard page with a uniqueid cursor", async () => {
    const full: FakeAttrs[] = Array.from({ length: 500 }, (_, i) => ({
      uniqueid: `0-${String(i).padStart(3, "0")}`,
      avg_ndvi: 0.5,
      max_px_all: 2,
    }));
    const layer = useLayer((q) => {
      const where = String(q.where);
      if (!where.includes("LIKE '0%')")) return [];
      if (where.includes("> '0-499'")) return [{ uniqueid: "0-500", avg_ndvi: 0.4, max_px_all: 1 }];
      return full;
    });
    const rows = await queryVegetationAvgNdviByUniqueIdPaged({ ...base, seedRows: [], pageSize: 100 });
    expect(rows).toHaveLength(501);
    expect(layer.executed.some((q) => String(q.where).includes("uniqueid > '0-499'"))).toBe(true);
  });

  test("seed row is replaced by a fresher shard row with the same id", async () => {
    useLayer((q) =>
      String(q.where).includes("LIKE 'b%')") ? [{ uniqueid: "b1", avg_ndvi: 0.1, max_px_all: 5 }] : [],
    );
    const rows = await queryVegetationAvgNdviByUniqueIdPaged({
      ...base,
      seedRows: [{ uniqueid: "b1", avgNdvi: 0.9, maxPxAll: 1, areaHa: 0 }],
      pageSize: 600,
    });
    expect(rows).toEqual([
      { uniqueid: "b1", avgNdvi: 0.1, maxPxAll: 5, areaHa: 5 * VEG_PIXEL_AREA_HA },
    ]);
  });
});
