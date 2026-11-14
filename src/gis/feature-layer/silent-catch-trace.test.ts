const mockLog = jest.fn();
jest.mock("../agri-debug-log", () => ({
  agroV5Log: (...args: unknown[]) => mockLog(...args),
}));

import type { AgriLayerLike, AgriMapViewHostLike } from "../agri-layer-types";
import { getFeatureLayerFromView } from "./where-and-resolve";
import { distinctValues } from "./lookup/lookup-query";

afterEach(() => mockLog.mockReset());

describe("silent catches leave a debug trace", () => {
  test("getFeatureLayerFromView returns null and logs when the map throws", async () => {
    const map = {};
    Object.defineProperty(map, "allLayers", {
      get() {
        throw new Error("map destroyed");
      },
    });
    const view = { view: { map } } as unknown as AgriMapViewHostLike;

    const result = await getFeatureLayerFromView(view);

    expect(result).toBeNull();
    expect(mockLog).toHaveBeenCalledWith(
      "whereAndResolve.firstLayerFromView",
      { error: "map destroyed" },
    );
  });

  test("distinctValues returns [] and logs when both query paths fail", async () => {
    const layer = {
      url: "",
      createQuery: () => ({}),
      queryFeatures: () => Promise.reject(new Error("native down")),
    } as unknown as AgriLayerLike;

    const result = await distinctValues(layer, "f");

    expect(result).toEqual([]);
    expect(mockLog).toHaveBeenCalledWith(
      "lookupQuery.distinctQueryFeatures",
      { error: "native down" },
    );
    expect(mockLog).toHaveBeenCalledWith(
      "lookupQuery.distinctJson",
      expect.objectContaining({ error: expect.any(String) }),
    );
  });
});
