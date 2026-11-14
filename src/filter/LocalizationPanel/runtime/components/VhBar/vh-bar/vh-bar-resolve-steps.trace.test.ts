const mockLog = jest.fn();
jest.mock("../../../../../../gis/agri-debug-log", () => ({
  agroV5Log: (...args: unknown[]) => mockLog(...args),
}));
jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationAvailableDates: jest.fn(() => Promise.reject(new Error("dates down"))),
  queryVegetationUniqueIdsForStatus: jest.fn(() => Promise.resolve([])),
}));

import { probeFallbackDates, type VhResolveCtx } from "./vh-bar-resolve-steps";

describe("probeFallbackDates failure trace", () => {
  beforeEach(() => mockLog.mockClear());

  it("returns the empty result and logs the error when dates cannot load", async () => {
    const ctx = {
      host: { state: { ndviDateOptions: [], yil: "2025" } },
      regionNum: 1,
      districtNum: 2,
      stillOk: () => true,
    } as unknown as VhResolveCtx;

    const result = await probeFallbackDates(ctx, jest.fn(), [], []);

    expect(result).toEqual({ ids: [], date: null, stale: false });
    expect(mockLog).toHaveBeenCalledWith("vhBar:resolve-ids-failed", { error: "dates down" });
  });
});
