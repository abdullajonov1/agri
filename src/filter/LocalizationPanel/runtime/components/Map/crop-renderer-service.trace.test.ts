const mockLog = jest.fn();
jest.mock("../../../../../gis/agri-debug-log", () => ({
  agroV5Log: (...args: unknown[]) => mockLog(...args),
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  getDetachedQueryLayerFor: jest.fn(() => Promise.resolve(null)),
  getMapImageParentLayer: jest.fn(() => null),
  isMapImageGroupSublayer: jest.fn(() => false),
  isMapImageOwnedLayer: jest.fn(() => false),
  safeLoadMapLayer: jest.fn(() => Promise.resolve()),
}));

import type { AgriMapLayer } from "../../../../localization/agri-map-layer";
import { refreshCropLayer } from "./crop-renderer-service";

describe("crop-renderer-service failure traces", () => {
  beforeEach(() => mockLog.mockClear());

  it("swallows a throwing refresh and logs the error", () => {
    const layer = {
      refresh: () => {
        throw new Error("refresh boom");
      },
    } as unknown as AgriMapLayer;

    expect(() =>
      refreshCropLayer({} as Parameters<typeof refreshCropLayer>[0], layer),
    ).not.toThrow();
    expect(mockLog).toHaveBeenCalledWith("cropRenderer:refresh-failed", { error: "refresh boom" });
  });
});
