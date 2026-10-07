const regionMappingsMock = jest.fn();
const turiMappingsMock = jest.fn();

jest.mock("../gis/agri-table-data-source", () => ({
  queryAgriRegionDistrictMappings: (): Promise<unknown> => regionMappingsMock(),
  queryAgriTuriCropMappings: (): Promise<unknown> => turiMappingsMock(),
}));

import { clearAgriDashboardBootstrapCache, getAgriDashboardBootstrap } from "./agri-bootstrap";

const REGION_ROWS = [{ viloyat: "A", region: 1, tuman: "B", district: 2, count: 1 }];
const TURI_ROWS = [{ turi: "Paxta", cropId: "7" }];

beforeEach(() => {
  localStorage.clear();
  clearAgriDashboardBootstrapCache();
  regionMappingsMock.mockReset();
  turiMappingsMock.mockReset();
});

describe("getAgriDashboardBootstrap", () => {
  test("queries both mappings once and shares the promise", async () => {
    regionMappingsMock.mockResolvedValue(REGION_ROWS);
    turiMappingsMock.mockResolvedValue(TURI_ROWS);
    const [a, b] = await Promise.all([getAgriDashboardBootstrap(), getAgriDashboardBootstrap()]);
    expect(a).toEqual({ regionDistrictRows: REGION_ROWS, turiCropRows: TURI_ROWS });
    expect(b).toBe(a);
    expect(regionMappingsMock).toHaveBeenCalledTimes(1);
  });

  test("persists across module reloads (page refresh)", async () => {
    regionMappingsMock.mockResolvedValue(REGION_ROWS);
    turiMappingsMock.mockResolvedValue(TURI_ROWS);
    await getAgriDashboardBootstrap();
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("./agri-bootstrap");
      await expect(fresh.getAgriDashboardBootstrap()).resolves.toEqual({
        regionDistrictRows: REGION_ROWS,
        turiCropRows: TURI_ROWS,
      });
    });
    expect(regionMappingsMock).toHaveBeenCalledTimes(1);
  });

  test("failure is not cached so the next call retries", async () => {
    regionMappingsMock.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(REGION_ROWS);
    turiMappingsMock.mockResolvedValue(TURI_ROWS);
    await expect(getAgriDashboardBootstrap()).rejects.toThrow("offline");
    await expect(getAgriDashboardBootstrap()).resolves.toEqual(
      expect.objectContaining({ regionDistrictRows: REGION_ROWS }),
    );
    expect(regionMappingsMock).toHaveBeenCalledTimes(2);
  });

  test("clear drops memory and persisted copies", async () => {
    regionMappingsMock.mockResolvedValue(REGION_ROWS);
    turiMappingsMock.mockResolvedValue(TURI_ROWS);
    await getAgriDashboardBootstrap();
    clearAgriDashboardBootstrapCache();
    await getAgriDashboardBootstrap();
    expect(regionMappingsMock).toHaveBeenCalledTimes(2);
  });
});
