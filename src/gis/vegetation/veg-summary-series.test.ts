const esriRequestMock = jest.fn();
const getAccessWhereMock = jest.fn((): string => "1=1");

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.resolve([esriRequestMock]),
}));
jest.mock("../../shared/agri-access-config", () => ({
  getAccessWhere: () => getAccessWhereMock(),
}));

import { clearAgriPersistentCache } from "../../data/agri-persistent-cache";
import {
  SUMMARY_INDEX_KEYS,
  buildSummaryOutStatistics,
  buildSummaryWhere,
  mapSummaryRows,
  queryIndexSummaryAvailableDates,
  queryIndexSummaryTimeseries,
  translateAccessWhereForSummary,
  vegetationSummaryDatesCache,
  vegetationSummaryTimeseriesCache,
} from "./veg-summary-series";

const BASE = { startDate: "2025-04-01", endDate: "2025-04-30" };

beforeEach(() => {
  esriRequestMock.mockReset();
  getAccessWhereMock.mockReset();
  getAccessWhereMock.mockReturnValue("1=1");
  vegetationSummaryTimeseriesCache.clear();
  vegetationSummaryDatesCache.clear();
  localStorage.clear();
  clearAgriPersistentCache();
});

describe("translateAccessWhereForSummary", () => {
  test("renames region and district outside literals", () => {
    expect(translateAccessWhereForSummary("region='1' AND district IN ('2','3')")).toBe(
      "region_id='1' AND district_id IN ('2','3')",
    );
  });
  test("returns null when an unknown field is compared to a region-like literal", () => {
    expect(translateAccessWhereForSummary("viloyat_name='region'")).toBeNull();
  });
  test("keeps literals untouched for allowed fields", () => {
    expect(translateAccessWhereForSummary("crop_id='region'")).toBe("crop_id='region'");
  });
  test("returns null for unknown fields", () => {
    expect(translateAccessWhereForSummary("turi='x'")).toBeNull();
    expect(translateAccessWhereForSummary("ndvi_status='a'")).toBeNull();
  });
  test("handles 1=1 and 1=0", () => {
    expect(translateAccessWhereForSummary("1=1")).toBe("");
    expect(translateAccessWhereForSummary("1=0")).toBe("1=0");
  });
});

describe("buildSummaryWhere", () => {
  test("region and district", () => {
    expect(buildSummaryWhere({ ...BASE, region: 3, district: 12 })).toBe(
      "region_id='3' AND district_id='12' AND raster_date >= DATE '2025-04-01' AND raster_date <= DATE '2025-04-30' AND valid_fields > 0",
    );
  });
  test("single crop", () => {
    expect(buildSummaryWhere({ ...BASE, cropId: " 5 " })).toContain("crop_id='5'");
  });
  test("multi crop deduped", () => {
    const where = buildSummaryWhere({ ...BASE, cropIds: ["a", "b", "a"], cropId: "b" });
    expect(where).toContain("crop_id IN ('a','b')");
  });
  test("null when ndviStatus set or dates invalid", () => {
    expect(buildSummaryWhere({ ...BASE, ndviStatus: "yaxshi" })).toBeNull();
    expect(buildSummaryWhere({ startDate: "bad", endDate: "2025-04-30" })).toBeNull();
    expect(buildSummaryWhere({ endDate: "2025-04-30" })).toBeNull();
  });
  test("combines translated access", () => {
    getAccessWhereMock.mockReturnValue("region='1'");
    expect(buildSummaryWhere(BASE)).toMatch(/^\(region_id='1'\) AND \(raster_date/);
  });
  test("null for untranslatable access, 1=0 for denied", () => {
    getAccessWhereMock.mockReturnValue("turi='x'");
    expect(buildSummaryWhere(BASE)).toBeNull();
    getAccessWhereMock.mockReturnValue("1=0");
    expect(buildSummaryWhere(BASE)).toBe("1=0");
  });
});

describe("buildSummaryOutStatistics", () => {
  test("contains weighted fields and polygon_count", () => {
    const names = buildSummaryOutStatistics().map((s) => s.outStatisticFieldName);
    expect(names).toContain("wsum_ndre");
    expect(names).toContain("polygon_count");
    expect(names).toHaveLength(SUMMARY_INDEX_KEYS.length * 4 + 1);
  });
});

describe("mapSummaryRows", () => {
  test("weighted mean, null when weight is zero, sorted without mutation", () => {
    const input = [
      { raster_date: 2, polygon_count: 0, wsum_ndvi: 0, w_ndvi: 0 },
      { raster_date: 1, polygon_count: 2, wsum_ndvi: 1.2, w_ndvi: 2, min_ndvi: 0.1, max_ndvi: 0.9 },
    ];
    const out = mapSummaryRows(input);
    expect(out.map((r) => r.date)).toEqual([1, 2]);
    expect(out[0].ndvi).toBeCloseTo(0.6);
    expect(out[0].ndvi_min).toBe(0.1);
    expect(out[0].ndvi_max).toBe(0.9);
    expect(out[1].ndvi).toBeNull();
    expect(out[1].ndvi_min).toBeNull();
    expect(input[0].raster_date).toBe(2);
  });
});

describe("queryIndexSummaryTimeseries", () => {
  const ok = {
    data: {
      features: [
        { attributes: { raster_date: 1, polygon_count: 2, wsum_ndvi: 1.2, w_ndvi: 2 } },
      ],
    },
  };
  test("maps rows on success", async () => {
    esriRequestMock.mockResolvedValue(ok);
    const rows = await queryIndexSummaryTimeseries(BASE);
    expect(rows).toHaveLength(1);
    expect(rows?.[0].ndvi).toBeCloseTo(0.6);
    expect(esriRequestMock.mock.calls[0][0]).toMatch(/\/query$/);
  });
  test("data.error returns null and is not cached", async () => {
    esriRequestMock.mockResolvedValue({ data: { error: { message: "boom" } } });
    expect(await queryIndexSummaryTimeseries(BASE)).toBeNull();
    expect(await queryIndexSummaryTimeseries(BASE)).toBeNull();
    expect(esriRequestMock).toHaveBeenCalledTimes(2);
  });
  test("empty features returns null", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [] } });
    expect(await queryIndexSummaryTimeseries(BASE)).toBeNull();
  });
  test("access 1=0 returns empty array without request", async () => {
    getAccessWhereMock.mockReturnValue("1=0");
    expect(await queryIndexSummaryTimeseries(BASE)).toEqual([]);
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
  test("not applicable returns null without request", async () => {
    expect(await queryIndexSummaryTimeseries({ ...BASE, ndviStatus: "x" })).toBeNull();
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
});

describe("queryIndexSummaryAvailableDates", () => {
  const DAY1 = Date.UTC(2025, 3, 1);
  const DAY2 = Date.UTC(2025, 3, 11);
  const queryOf = (): Record<string, string> => esriRequestMock.mock.calls[0][1].query;
  test("region and district where, request shape", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [{ attributes: { raster_date: DAY1 } }] } });
    await queryIndexSummaryAvailableDates({ region: 3, district: 12 });
    const q = queryOf();
    expect(q.where).toBe("region_id='3' AND district_id='12' AND valid_fields > 0");
    expect(q.groupByFieldsForStatistics).toBe("raster_date");
    expect(q.orderByFields).toBe("raster_date ASC");
    expect(JSON.parse(q.outStatistics)[0].statisticType).toBe("count");
    expect(esriRequestMock.mock.calls[0][0]).toMatch(/\/query$/);
  });
  test("region only and no scope", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [{ attributes: { raster_date: DAY1 } }] } });
    await queryIndexSummaryAvailableDates({ region: 3 });
    expect(queryOf().where).toBe("region_id='3' AND valid_fields > 0");
    esriRequestMock.mockClear();
    await queryIndexSummaryAvailableDates({});
    expect(queryOf().where).toBe("valid_fields > 0");
  });
  test("district only", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [{ attributes: { raster_date: DAY1 } }] } });
    await queryIndexSummaryAvailableDates({ district: 12 });
    expect(queryOf().where).toBe("district_id='12' AND valid_fields > 0");
  });
  test("maps epoch ms to sorted deduped ymd", async () => {
    esriRequestMock.mockResolvedValue({
      data: { features: [DAY2, DAY1, DAY2].map((raster_date) => ({ attributes: { raster_date } })) },
    });
    expect(await queryIndexSummaryAvailableDates({ region: 3 })).toEqual(["2025-04-01", "2025-04-11"]);
  });
  test("combines translated access", async () => {
    getAccessWhereMock.mockReturnValue("region='1'");
    esriRequestMock.mockResolvedValue({ data: { features: [{ attributes: { raster_date: DAY1 } }] } });
    await queryIndexSummaryAvailableDates({ district: 2 });
    expect(queryOf().where).toBe("(region_id='1') AND (district_id='2' AND valid_fields > 0)");
  });
  test("data.error returns null and is not cached", async () => {
    esriRequestMock.mockResolvedValue({ data: { error: { message: "boom" } } });
    expect(await queryIndexSummaryAvailableDates({ region: 3 })).toBeNull();
    expect(await queryIndexSummaryAvailableDates({ region: 3 })).toBeNull();
    expect(esriRequestMock).toHaveBeenCalledTimes(2);
  });
  test("zero features returns null", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [] } });
    expect(await queryIndexSummaryAvailableDates({ region: 3 })).toBeNull();
  });
  test("untranslatable access returns null, 1=0 returns [] without request", async () => {
    getAccessWhereMock.mockReturnValue("turi='x'");
    expect(await queryIndexSummaryAvailableDates({})).toBeNull();
    getAccessWhereMock.mockReturnValue("1=0");
    expect(await queryIndexSummaryAvailableDates({})).toEqual([]);
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
});
