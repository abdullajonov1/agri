const mockSeasonMonths = jest.fn<number[], [string, (number | null | undefined)?]>();
const mockWithoutImagery = jest.fn<boolean, [number | null | undefined, string]>();

jest.mock("./export-image-knowledge", () => ({
  getExportImageSeasonMonths: (uid: string, crop?: number | null) => mockSeasonMonths(uid, crop),
  isRegionDateWithoutImagery: (region: number | null | undefined, date: string) =>
    mockWithoutImagery(region, date),
}));

import {
  listExportRasterDateCandidates,
  pickExportRasterDate,
  pickLatestUsableExportDate,
  resolveCropIdFromAttributes,
  resolveRegionIdFromAttributes,
} from "./export-date-pick";

const DATES = ["2024-09-10", "2024-03-05", "bad", "2024-04-20T00:00:00", "2024-04-01"];

beforeEach(() => {
  mockSeasonMonths.mockReset().mockReturnValue([]);
  mockWithoutImagery.mockReset().mockReturnValue(false);
});

describe("pickLatestUsableExportDate", () => {
  test("returns newest valid date, trimming time parts", () => {
    expect(pickLatestUsableExportDate(DATES)).toBe("2024-09-10");
  });

  test("filters by season months", () => {
    expect(pickLatestUsableExportDate(DATES, { months: [3, 4] })).toBe("2024-04-20");
  });

  test("honours exclusions and region imagery gaps", () => {
    mockWithoutImagery.mockImplementation((_r, d) => d === "2024-04-20");
    expect(
      pickLatestUsableExportDate(DATES, { months: [3, 4], regionId: 3, exclude: ["2024-04-01"] }),
    ).toBe("2024-03-05");
  });

  test("returns null for empty / null input or no match", () => {
    expect(pickLatestUsableExportDate(null)).toBeNull();
    expect(pickLatestUsableExportDate([])).toBeNull();
    expect(pickLatestUsableExportDate(DATES, { months: [12] })).toBeNull();
  });
});

describe("listExportRasterDateCandidates", () => {
  test("defaults to one candidate", () => {
    expect(listExportRasterDateCandidates(DATES)).toEqual(["2024-09-10"]);
  });

  test("lists newest->oldest within the learned season", () => {
    mockSeasonMonths.mockReturnValue([3, 4]);
    expect(listExportRasterDateCandidates(DATES, { uniqueid: "u", cropId: 6, limit: 5 })).toEqual([
      "2024-04-20",
      "2024-04-01",
      "2024-03-05",
    ]);
    expect(mockSeasonMonths).toHaveBeenCalledWith("u", 6);
  });

  test("limit below 1 is treated as 1", () => {
    expect(listExportRasterDateCandidates(DATES, { limit: 0 })).toHaveLength(1);
  });

  test("returns [] when nothing in season", () => {
    mockSeasonMonths.mockReturnValue([12]);
    expect(listExportRasterDateCandidates(DATES, { limit: 3 })).toEqual([]);
  });

  test("pickExportRasterDate returns first candidate or null", () => {
    expect(pickExportRasterDate(DATES, { exclude: ["2024-09-10"] })).toBe("2024-04-20");
    expect(pickExportRasterDate([])).toBeNull();
  });
});

describe("resolveCropIdFromAttributes", () => {
  test("prefers numeric crop_id (any case)", () => {
    expect(resolveCropIdFromAttributes({ CROP_ID: "4", turi: "Bug'doy" })).toBe(4);
    expect(resolveCropIdFromAttributes({ cropId: 9 })).toBe(9);
  });

  test("falls back to wheat turi -> 6", () => {
    expect(resolveCropIdFromAttributes({ crop_id: 0, Turi: "Bug'doy" })).toBe(6);
    expect(resolveCropIdFromAttributes({ turi: "bugdoy" })).toBe(6);
  });

  test("returns null for unknown crops or empty input", () => {
    expect(resolveCropIdFromAttributes({ turi: "Paxta" })).toBeNull();
    expect(resolveCropIdFromAttributes(null)).toBeNull();
    expect(resolveCropIdFromAttributes({ crop_id: "abc" })).toBeNull();
  });
});

describe("resolveRegionIdFromAttributes", () => {
  test("reads region / region_id / regionId as positive numbers", () => {
    expect(resolveRegionIdFromAttributes({ REGION: "12" })).toBe(12);
    expect(resolveRegionIdFromAttributes({ region_id: 3 })).toBe(3);
    expect(resolveRegionIdFromAttributes({ regionId: 0, other: 5 })).toBeNull();
    expect(resolveRegionIdFromAttributes(undefined)).toBeNull();
  });
});
