const mockSummary = jest.fn();
const mockRaw = jest.fn();
jest.mock("./field-status-summary", () => ({
  queryFieldStatusUniqueIds: (p: unknown) => mockSummary(p),
}));
jest.mock("./status-latest-window", () => ({
  queryVegetationLatestStatusSummary: (p: unknown) => mockRaw(p),
}));

import { queryVegetationUniqueIdsForStatus } from "./status-uniqueids";

const base = { region: 17, date: "2025-06-01", ndviStatus: "past" };

describe("queryVegetationUniqueIdsForStatus year summary", () => {
  beforeEach(() => {
    mockSummary.mockReset();
    mockRaw.mockReset();
    mockRaw.mockResolvedValue({ rows: [{ ndvi_status: "past", uniqueIds: ["raw1"] }] });
  });

  it("returns summary ids without the raw scan", async () => {
    mockSummary.mockResolvedValue(["s1"]);
    const ids = await queryVegetationUniqueIdsForStatus({
      ...base,
      cropId: " 3 ",
      cropIds: ["3", "4"],
      useYearSummary: true,
    });
    expect(ids).toEqual(["s1"]);
    expect(mockSummary).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2025, region: 17, cropIds: ["3", "4"], ndviStatus: "past" }),
    );
    expect(mockRaw).not.toHaveBeenCalled();
  });

  it("falls back to the raw path when the summary returns null", async () => {
    mockSummary.mockResolvedValue(null);
    const ids = await queryVegetationUniqueIdsForStatus({ ...base, useYearSummary: true });
    expect(ids).toEqual(["raw1"]);
  });

  it("skips the summary when the flag is off", async () => {
    await queryVegetationUniqueIdsForStatus(base);
    expect(mockSummary).not.toHaveBeenCalled();
    expect(mockRaw).toHaveBeenCalled();
  });

  it("skips the summary when STIR uniqueIds are set", async () => {
    await queryVegetationUniqueIdsForStatus({ ...base, uniqueIds: ["a"], useYearSummary: true });
    expect(mockSummary).not.toHaveBeenCalled();
    expect(mockRaw).toHaveBeenCalled();
  });
});
