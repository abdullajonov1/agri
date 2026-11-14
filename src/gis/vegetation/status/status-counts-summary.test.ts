const esriRequestMock = jest.fn();
const getAccessWhereMock = jest.fn((): string => "1=1");

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.resolve([esriRequestMock]),
}));
jest.mock("../../../shared/agri-access-config", () => ({
  getAccessWhere: () => getAccessWhereMock(),
}));

import { clearAgriPersistentCache } from "../../../data/agri-persistent-cache";
import {
  buildStatusCountsWhere,
  mapStatusCountRows,
  queryStatusCountsSummary,
  statusCountsSummaryCache,
} from "./status-counts-summary";

const BASE = { year: 2025 };

beforeEach(() => {
  esriRequestMock.mockReset();
  getAccessWhereMock.mockReset();
  getAccessWhereMock.mockReturnValue("1=1");
  statusCountsSummaryCache.clear();
  localStorage.clear();
  clearAgriPersistentCache();
});

describe("buildStatusCountsWhere", () => {
  test("republic uses only the year", () => {
    expect(buildStatusCountsWhere(BASE)).toBe("year = 2025");
  });
  test("region and district", () => {
    expect(buildStatusCountsWhere({ ...BASE, region: 3, district: 12 })).toBe(
      "year = 2025 AND region_id='3' AND district_id='12'",
    );
  });
  test("single crop is trimmed", () => {
    expect(buildStatusCountsWhere({ ...BASE, cropIds: [" 5 "] })).toBe(
      "year = 2025 AND crop_id='5'",
    );
  });
  test("multi crop is deduped", () => {
    expect(buildStatusCountsWhere({ ...BASE, cropIds: ["a", "b", "a", " "] })).toBe(
      "year = 2025 AND crop_id IN ('a','b')",
    );
  });
  test("invalid year returns null", () => {
    expect(buildStatusCountsWhere({ year: 1800 })).toBeNull();
    expect(buildStatusCountsWhere({ year: 2025.5 })).toBeNull();
    expect(buildStatusCountsWhere({ year: Number.NaN })).toBeNull();
  });
  test("combines translated access", () => {
    getAccessWhereMock.mockReturnValue("region='1'");
    expect(buildStatusCountsWhere(BASE)).toBe("(region_id='1') AND (year = 2025)");
  });
  test("access 1=0 returns 1=0", () => {
    getAccessWhereMock.mockReturnValue("1=0");
    expect(buildStatusCountsWhere(BASE)).toBe("1=0");
  });
  test("access with unknown field returns null", () => {
    getAccessWhereMock.mockReturnValue("turi='x'");
    expect(buildStatusCountsWhere(BASE)).toBeNull();
  });
});

describe("mapStatusCountRows", () => {
  test("maps codes 1..4 and skips unknown codes without mutation", () => {
    const input = [
      { status_code: 1, field_count_sum: 5, area_ha_sum: 10.5 },
      { status_code: 2, field_count_sum: 4, area_ha_sum: 8 },
      { status_code: 3, field_count_sum: 3, area_ha_sum: 6 },
      { status_code: 4, field_count_sum: 2, area_ha_sum: 4 },
      { status_code: 0, field_count_sum: 9, area_ha_sum: 9 },
    ];
    const copy = JSON.parse(JSON.stringify(input));
    const out = mapStatusCountRows(input);
    expect(out).toEqual([
      { ndvi_status: "juda_yaxshi", count: 5, areaHa: 10.5, uniqueIds: [] },
      { ndvi_status: "yaxshi", count: 4, areaHa: 8, uniqueIds: [] },
      { ndvi_status: "orta", count: 3, areaHa: 6, uniqueIds: [] },
      { ndvi_status: "past", count: 2, areaHa: 4, uniqueIds: [] },
    ]);
    expect(input).toEqual(copy);
  });
});

describe("queryStatusCountsSummary", () => {
  const ok = {
    data: {
      features: [
        { attributes: { status_code: 2, field_count_sum: 4, area_ha_sum: 8 } },
      ],
    },
  };
  test("returns mapped rows on success", async () => {
    esriRequestMock.mockResolvedValue(ok);
    const res = await queryStatusCountsSummary(BASE);
    expect(res).toEqual({
      rows: [{ ndvi_status: "yaxshi", count: 4, areaHa: 8, uniqueIds: [] }],
      startDate: "",
      endDate: "",
    });
    expect(esriRequestMock.mock.calls[0][0]).toMatch(/\/query$/);
    expect(esriRequestMock.mock.calls[0][1].query.groupByFieldsForStatistics).toBe(
      "status_code",
    );
  });
  test("data.error returns null and is not cached", async () => {
    esriRequestMock.mockResolvedValue({ data: { error: { message: "boom" } } });
    expect(await queryStatusCountsSummary(BASE)).toBeNull();
    expect(await queryStatusCountsSummary(BASE)).toBeNull();
    expect(esriRequestMock).toHaveBeenCalledTimes(2);
  });
  test("zero features returns null", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [] } });
    expect(await queryStatusCountsSummary(BASE)).toBeNull();
  });
  test("access 1=0 returns empty rows without request", async () => {
    getAccessWhereMock.mockReturnValue("1=0");
    expect(await queryStatusCountsSummary(BASE)).toEqual({
      rows: [],
      startDate: "",
      endDate: "",
    });
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
  test("invalid year returns null without request", async () => {
    expect(await queryStatusCountsSummary({ year: 1 })).toBeNull();
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
});
