jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("./__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);
jest.mock("./veg-summary-series", () => ({
  queryIndexSummaryTimeseries: jest.fn(),
  queryIndexSummaryAvailableDates: jest.fn().mockResolvedValue(null),
}));

import { setAccessConfig } from "../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../data/agri-query-gateway";
import { vegetationAvailableDatesCache, vegetationRegionalTimeseriesCache } from "./veg-base";
import { queryVegetationAvailableDates, queryVegetationRegionalTimeseries } from "./veg-series";
import { queryIndexSummaryAvailableDates, queryIndexSummaryTimeseries } from "./veg-summary-series";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeResponder,
  type FakeVegLayer,
} from "./__test-utils__/veg-fake-layer";

const summaryMock = queryIndexSummaryTimeseries as jest.Mock;
const datesMock = queryIndexSummaryAvailableDates as jest.Mock;

const useLayer = (respond: FakeResponder): FakeVegLayer => {
  const layer = makeFakeVegLayer(respond, {});
  setVegLayer(layer, DEFAULT_VEG_FIELDS);
  return layer;
};

const window = { startDate: "2024-01-01", endDate: "2024-01-31" };

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  vegetationRegionalTimeseriesCache.clear();
  summaryMock.mockReset();
  datesMock.mockReset();
  vegetationAvailableDatesCache.clear();
});

describe("queryVegetationRegionalTimeseries summary routing", () => {
  test("returns summary rows without querying the raw layer", async () => {
    const rows = [{ date: "2024-01-05", ndvi: 0.5, polygon_count: 3 }];
    summaryMock.mockResolvedValue(rows);
    const layer = useLayer(() => [{ raster_date: 1, ndvi: 0.1 }]);
    await expect(
      queryVegetationRegionalTimeseries({ ...window, region: 1724 }),
    ).resolves.toEqual(rows);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("falls back to the raw query when summary returns null", async () => {
    summaryMock.mockResolvedValue(null);
    const layer = useLayer(() => [{ raster_date: 1, ndvi: 0.1 }]);
    const rows = await queryVegetationRegionalTimeseries({ ...window, region: 1724 });
    expect(summaryMock).toHaveBeenCalledTimes(1);
    expect(layer.queryFeatures).toHaveBeenCalled();
    expect(rows.length).toBeGreaterThan(0);
  });

  test("skips the summary when ndviStatus is set", async () => {
    const layer = useLayer(() => [{ raster_date: 1, ndvi: 0.1 }]);
    await queryVegetationRegionalTimeseries({ ...window, ndviStatus: "good" });
    expect(summaryMock).not.toHaveBeenCalled();
    expect(layer.queryFeatures).toHaveBeenCalled();
  });

  test("returns [] without any query when there is no date window", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationRegionalTimeseries({ region: 1724 })).resolves.toEqual([]);
    expect(summaryMock).not.toHaveBeenCalled();
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });
});

describe("queryVegetationAvailableDates summary routing", () => {
  test("returns summary dates without querying the raw layer", async () => {
    datesMock.mockResolvedValue(["2024-01-05", "2024-01-15"]);
    const layer = useLayer(() => [{ raster_date: 1 }]);
    await expect(queryVegetationAvailableDates({ region: 1724 })).resolves.toEqual([
      "2024-01-05",
      "2024-01-15",
    ]);
    expect(datesMock).toHaveBeenCalledWith({ region: 1724, district: undefined });
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("queries the raw layer when summary returns null", async () => {
    datesMock.mockResolvedValue(null);
    const layer = useLayer(() => [{ raster_date: Date.UTC(2024, 0, 5) }]);
    const dates = await queryVegetationAvailableDates({ region: 1724 });
    expect(layer.queryFeatures).toHaveBeenCalled();
    expect(dates).toEqual(["2024-01-05"]);
  });
});
