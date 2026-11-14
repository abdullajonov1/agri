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
  fieldStatusIdsCache,
  queryFieldStatusUniqueIds,
} from "./field-status-summary";

const BASE = { year: 2025, ndviStatus: "yaxshi" };
const rows = (ids: string[], start = 1) => ({
  data: {
    features: ids.map((uniqueid, i) => ({
      attributes: { uniqueid, objectid: start + i },
    })),
  },
});

beforeEach(() => {
  esriRequestMock.mockReset();
  getAccessWhereMock.mockReset();
  getAccessWhereMock.mockReturnValue("1=1");
  fieldStatusIdsCache.clear();
  localStorage.clear();
  clearAgriPersistentCache();
});

describe("queryFieldStatusUniqueIds", () => {
  test("builds where for region, district and crops", async () => {
    esriRequestMock.mockResolvedValue(rows(["a"]));
    await queryFieldStatusUniqueIds({
      ...BASE,
      region: 3,
      district: 12,
      cropIds: [" a ", "b", "a"],
    });
    const call = esriRequestMock.mock.calls[0];
    expect(call[0]).toMatch(/\/query$/);
    expect(call[1].query.where).toBe(
      "(year = 2025 AND status_code = 2 AND region_id='3' AND district_id='12' AND crop_id IN ('a','b')) AND objectid > -1",
    );
    expect(call[1].query.orderByFields).toBe("objectid ASC");
    expect(call[1].query.resultRecordCount).toBe(2000);
  });
  test("single crop uses equality", async () => {
    esriRequestMock.mockResolvedValue(rows([]));
    await queryFieldStatusUniqueIds({ ...BASE, cropIds: ["5"] });
    expect(esriRequestMock.mock.calls[0][1].query.where).toContain("crop_id='5'");
  });
  test("unknown status returns null without request", async () => {
    expect(await queryFieldStatusUniqueIds({ ...BASE, ndviStatus: "zzz" })).toBeNull();
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
  test("status is lowercased and trimmed", async () => {
    esriRequestMock.mockResolvedValue(rows(["a"]));
    await queryFieldStatusUniqueIds({ ...BASE, ndviStatus: " PAST " });
    expect(esriRequestMock.mock.calls[0][1].query.where).toContain("status_code = 4");
  });
  test("invalid year returns null without request", async () => {
    expect(await queryFieldStatusUniqueIds({ ...BASE, year: 1800 })).toBeNull();
    expect(await queryFieldStatusUniqueIds({ ...BASE, year: 2025.5 })).toBeNull();
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
  test("access 1=0 returns empty without request", async () => {
    getAccessWhereMock.mockReturnValue("1=0");
    expect(await queryFieldStatusUniqueIds(BASE)).toEqual([]);
    expect(esriRequestMock).not.toHaveBeenCalled();
  });
  test("access with unknown field returns null", async () => {
    getAccessWhereMock.mockReturnValue("turi='x'");
    expect(await queryFieldStatusUniqueIds(BASE)).toBeNull();
  });
  test("pages by objectid and dedupes ids", async () => {
    const first = Array.from({ length: 2000 }, (_, i) => `{ID-${i}}`);
    esriRequestMock
      .mockResolvedValueOnce(rows(first))
      .mockResolvedValueOnce(rows(["id-0", " ", "new1", "new2"], 2001));
    const res = await queryFieldStatusUniqueIds(BASE);
    expect(esriRequestMock).toHaveBeenCalledTimes(2);
    expect(esriRequestMock.mock.calls[1][1].query.where).toContain("objectid > 2000");
    expect(res).toHaveLength(2002);
    expect(res?.[0]).toBe("{ID-0}");
    expect(res).toContain("new2");
  });
  test("data.error returns null and is not cached", async () => {
    esriRequestMock.mockResolvedValue({ data: { error: { message: "boom" } } });
    expect(await queryFieldStatusUniqueIds(BASE)).toBeNull();
    expect(await queryFieldStatusUniqueIds(BASE)).toBeNull();
    expect(esriRequestMock).toHaveBeenCalledTimes(2);
  });
  test("zero rows returns empty array", async () => {
    esriRequestMock.mockResolvedValue({ data: { features: [] } });
    expect(await queryFieldStatusUniqueIds(BASE)).toEqual([]);
  });
});
