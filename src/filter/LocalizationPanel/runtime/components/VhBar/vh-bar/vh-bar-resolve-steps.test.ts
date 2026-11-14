jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationAvailableDates: jest.fn(() => Promise.resolve([])),
  queryVegetationUniqueIdsForStatus: jest.fn(() => Promise.resolve([])),
}));

import {
  buildDateWalk,
  buildFallbackDates,
  collectCropIds,
  extractSelectedYear,
  filterDatesByYear,
  hasDistrict,
  mergeDateCandidates,
  probeDates,
} from "./vh-bar-resolve-steps";

describe("vh-bar-resolve-steps pure helpers", () => {
  it("extracts a plausible year or empty string", () => {
    expect(extractSelectedYear("2025 yil")).toBe("2025");
    expect(extractSelectedYear("")).toBe("");
    expect(extractSelectedYear(undefined)).toBe("");
  });

  it("filters dates by year and keeps all when no year", () => {
    const dates = ["2024-05-01", "2025-05-01"];
    expect(filterDatesByYear(dates, "2025")).toEqual(["2025-05-01"]);
    expect(filterDatesByYear(dates, "")).toEqual(dates);
  });

  it("builds a newest-first capped walk without mutating input", () => {
    const dates = ["2025-01-01", "2025-02-01", "2025-03-01", "2024-01-01"];
    expect(buildDateWalk(dates, 2, "2025")).toEqual(["2025-03-01", "2025-02-01"]);
    expect(dates[0]).toBe("2025-01-01");
  });

  it("merges preferred dates ahead of walk without duplicates", () => {
    expect(mergeDateCandidates(["b"], ["a", "b", "c"])).toEqual(["b", "a", "c"]);
  });

  it("builds fallback dates excluding tried ones", () => {
    expect(buildFallbackDates(["2025-01-01", "2025-02-01"], "2025", ["2025-02-01"])).toEqual([
      "2025-01-01",
    ]);
  });

  it("collects unique non-empty crop ids", () => {
    const map: Record<string, string | undefined> = { a: "1", b: "1", c: undefined, d: "2" };
    expect(collectCropIds(["a", "b", "c", "d"], (t) => map[t])).toEqual(["1", "2"]);
  });

  it("detects a finite district", () => {
    expect(hasDistrict(0)).toBe(true);
    expect(hasDistrict(undefined)).toBe(false);
    expect(hasDistrict(NaN)).toBe(false);
  });

  it("probeDates stops at first date with ids", async () => {
    const fetchIds = jest.fn((_c: string[], d: string) =>
      Promise.resolve(d === "d2" ? ["x"] : []),
    );
    const result = await probeDates(fetchIds, [], ["d1", "d2", "d3"], undefined, () => true);
    expect(result).toEqual({ ids: ["x"], date: "d2", stale: false });
    expect(fetchIds).toHaveBeenCalledTimes(2);
  });

  it("probeDates reports stale and stops", async () => {
    const fetchIds = jest.fn(() => Promise.resolve(["x"]));
    const result = await probeDates(fetchIds, [], ["d1", "d2"], undefined, () => false);
    expect(result.stale).toBe(true);
    expect(fetchIds).toHaveBeenCalledTimes(1);
  });
});
