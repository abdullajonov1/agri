jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("../__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);

import { setAccessConfig } from "../../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../../data/agri-query-gateway";
import {
  VEG_CROP_STATS_MAX_ROWS,
  VEG_PIXEL_AREA_HA,
  VEG_STATUS_ROW_PAGE_SIZE,
  vegetationCropBreakdownCache,
  vegetationCropStatsCache,
  vegetationStatusStatsCache,
} from "../veg-base";
import { queryVegetationCropStatsForStatus } from "./status-crop-stats";
import { queryVegetationCropBreakdownForStatus } from "./status-crop-breakdown";
import { queryVegetationStatusCountsByStatus } from "./status-by-status";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeAttrs,
  type FakeResponder,
  type FakeVegLayer,
} from "../__test-utils__/veg-fake-layer";

const useLayer = (respond: FakeResponder, fields: string[] = DEFAULT_VEG_FIELDS): FakeVegLayer => {
  const layer = makeFakeVegLayer(respond);
  setVegLayer(layer, fields);
  return layer;
};

const params = { date: "2024-05-01", ndviStatus: " Past ", region: 1724, district: 5 };

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  vegetationCropStatsCache.clear();
  vegetationCropBreakdownCache.clear();
  vegetationStatusStatsCache.clear();
});

describe("queryVegetationCropStatsForStatus", () => {
  test("blank status/date short-circuits", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationCropStatsForStatus({ date: "", ndviStatus: "past" })).resolves.toEqual([]);
    await expect(queryVegetationCropStatsForStatus({ date: "2024-05-01", ndviStatus: "" })).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("groups by crop_id with counts and summed area, dropping empty groups", async () => {
    const layer = useLayer(() => [
      { crop_id: "3", row_count: 4, sum_px_all: 1000 },
      { CROP_ID: "4", ROW_COUNT: 1, SUM_PX_ALL: 0 },
      { crop_id: "", row_count: 9, sum_px_all: 9 },
      { crop_id: "5", row_count: 0, sum_px_all: 0 },
    ]);
    const rows = await queryVegetationCropStatsForStatus(params);
    expect(rows).toEqual([
      { cropId: "3", areaHa: 1000 * VEG_PIXEL_AREA_HA, fieldCount: 4 },
      { cropId: "4", areaHa: 0, fieldCount: 1 },
    ]);
    const q = layer.executed[0];
    expect(q.where).toContain("ndvi_status='past'");
    expect(q.where).toContain("district='5'");
    expect(q.groupByFieldsForStatistics).toEqual(["crop_id"]);
    expect(q.num).toBe(VEG_CROP_STATS_MAX_ROWS);
  });

  test("uses a renamed crop field and caches the request", async () => {
    const layer = useLayer(() => [{ CropID: "7", row_count: 1, sum_px_all: 1 }], ["CropID", "uniqueid"]);
    await queryVegetationCropStatsForStatus(params);
    const rows = await queryVegetationCropStatsForStatus(params);
    expect(rows[0].cropId).toBe("7");
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
    expect(layer.executed[0].groupByFieldsForStatistics).toEqual(["CropID"]);
  });

  test("evicts failed requests", async () => {
    let fail = true;
    const layer = useLayer(() => {
      if (fail) throw new Error("x");
      return [];
    });
    await expect(queryVegetationCropStatsForStatus(params)).rejects.toThrow("x");
    fail = false;
    await expect(queryVegetationCropStatsForStatus(params)).resolves.toEqual([]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });
});

describe("queryVegetationCropBreakdownForStatus", () => {
  test("returns [] when no uniqueid field exists", async () => {
    const layer = useLayer(() => [], ["crop_id"]);
    await expect(queryVegetationCropBreakdownForStatus(params)).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("assigns each uniqueid to the crop with the largest area", async () => {
    useLayer(() => [
      { uniqueid: "A", crop_id: "3", max_px_all: 100 },
      { uniqueid: "a", crop_id: "4", max_px_all: 300 },
      { uniqueid: "b", crop_id: "3", max_px_all: 50 },
      { uniqueid: "c", crop_id: "", max_px_all: 50 },
      { uniqueid: "", crop_id: "3", max_px_all: 50 },
    ]);
    const rows = await queryVegetationCropBreakdownForStatus(params);
    expect(rows).toEqual([
      { cropId: "4", areaHa: 300 * VEG_PIXEL_AREA_HA, fieldCount: 1 },
      { cropId: "3", areaHa: 50 * VEG_PIXEL_AREA_HA, fieldCount: 1 },
    ]);
  });

  test("pages by offset and stops when the server repeats a page", async () => {
    const full: FakeAttrs[] = Array.from({ length: VEG_STATUS_ROW_PAGE_SIZE }, (_, i) => ({
      uniqueid: `u${i}`,
      crop_id: "3",
      max_px_all: 1,
    }));
    const layer = useLayer(() => full);
    const rows = await queryVegetationCropBreakdownForStatus(params);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ cropId: "3", fieldCount: VEG_STATUS_ROW_PAGE_SIZE });
    expect(rows[0].areaHa).toBeCloseTo(VEG_STATUS_ROW_PAGE_SIZE * VEG_PIXEL_AREA_HA, 6);
    expect(layer.executed.map((q) => q.resultOffset)).toEqual([0, VEG_STATUS_ROW_PAGE_SIZE]);
  });

  test("caches by WHERE", async () => {
    const layer = useLayer(() => []);
    await queryVegetationCropBreakdownForStatus(params);
    await queryVegetationCropBreakdownForStatus(params);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });
});

describe("queryVegetationStatusCountsByStatus", () => {
  test("blank date returns []", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationStatusCountsByStatus({ date: " " })).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("maps grouped rows to counts and area", async () => {
    const layer = useLayer(() => [
      { ndvi_status: "Juda_Yaxshi", row_count: 2, sum_px_all: 100 },
      { ndvi_status: "past", row_count: -1, sum_px_all: 50 },
      { ndvi_status: "orta", row_count: 0, sum_px_all: 0 },
      { ndvi_status: null, row_count: 5, sum_px_all: 5 },
    ]);
    const rows = await queryVegetationStatusCountsByStatus({ date: "2024-05-01", cropIds: ["1"] });
    expect(rows).toEqual([
      { ndvi_status: "juda_yaxshi", count: 2, areaHa: 100 * VEG_PIXEL_AREA_HA, uniqueIds: [] },
      { ndvi_status: "past", count: 0, areaHa: 50 * VEG_PIXEL_AREA_HA, uniqueIds: [] },
    ]);
    expect(layer.executed[0].where).toContain("crop_id='1'");
  });
});
