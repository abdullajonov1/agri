const mockLog = jest.fn();
jest.mock("../../../../../../gis/agri-debug-log", () => ({
  agroV5Log: (...args: unknown[]) => mockLog(...args),
}));
jest.mock("../../../../../localization/map-filter-apply", () => ({
  spatialWhereFromPrimarySync: jest.fn(() => null),
}));
jest.mock("../../../../../../gis/agri-table-data-source", () => ({
  buildSpatialJoinWhere: jest.fn(() => "unused"),
  queryAgriUniqueIdsForWhere: jest.fn(() => Promise.reject(new Error("ids down"))),
}));
jest.mock("../../../../../../gis/feature-layer-data", () => ({
  ensureRegionYearMapImagesReady: jest.fn(),
  unlockShownRegionYearFieldScales: jest.fn(),
  refreshRegionYearMapExports: jest.fn(),
  isMapImageOwnedLayer: jest.fn(() => false),
}));

import { mirrorWhereOnSpatialLayers } from "./map-filter-layer-sync";

describe("map-filter-layer-sync failure traces", () => {
  beforeEach(() => mockLog.mockClear());

  it("hides the layer with 1=0 and logs when the uniqueid query fails", async () => {
    const layer = { definitionExpression: "1=1" };

    await mirrorWhereOnSpatialLayers(
      [layer] as unknown as Parameters<typeof mirrorWhereOnSpatialLayers>[0],
      "crop = 1",
    );

    expect(layer.definitionExpression).toBe("1=0");
    expect(mockLog).toHaveBeenCalledWith("resolveSpatialWhere:failed", { error: "ids down" });
  });
});
