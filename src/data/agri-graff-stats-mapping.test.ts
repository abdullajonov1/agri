const timeseriesMock = jest.fn();

jest.mock("./agri-stats-store", () => ({
  getGraffRegionalTimeseriesCached: (opts: Record<string, unknown>): Promise<unknown> =>
    timeseriesMock(opts),
}));

import {
  buildGraffPolygonRasterCacheKey,
  buildGraffPolygonSeriesScopeKey,
  buildTumanToDistrictMap,
  buildTuriToCropIdMap,
  buildViloyatToRegionMap,
  mergeRegionalTimeseriesGroups,
  queryGraffRegionalTimeseriesMerged,
  resolveGraffCropIds,
  resolveGraffDistrictNumber,
  type GraffRegionalTimeseriesRow,
} from "./agri-graff-stats";
import type { AgriRegionDistrictMappingRow } from "../gis/agri-table-data-source";

const mapping = (
  viloyat: string,
  region: number,
  tuman: string,
  district: number,
  count = 1,
): AgriRegionDistrictMappingRow => ({ viloyat, region, tuman, district, count });

describe("polygon scope / raster keys", () => {
  test("series scope key strips braces and nulls non-finite ids", () => {
    expect(JSON.parse(buildGraffPolygonSeriesScopeKey({ uniqueid: "{ab}", regionId: 3, year: 2024 }))).toEqual({
      uniqueid: "ab",
      regionId: 3,
      year: 2024,
    });
    expect(
      JSON.parse(buildGraffPolygonSeriesScopeKey({ uniqueid: "", regionId: NaN, year: null })),
    ).toEqual({ uniqueid: "", regionId: null, year: null });
  });

  test("raster cache key format", () => {
    expect(
      buildGraffPolygonRasterCacheKey({
        uniqueid: "{AB}",
        regionId: 7,
        rasterDate: "2024-05-01",
        indiceType: "ndvi",
      }),
    ).toBe("AB|7|2024-05-01|ndvi");
  });
});

describe("region/district lookup maps", () => {
  test("viloyat -> region keeps first finite code per normalized name", () => {
    const map = buildViloyatToRegionMap([
      mapping("Andijon", 1, "a", 10),
      mapping("ANDIJON", 99, "b", 11),
      mapping("Buxoro", NaN, "c", 12),
      mapping("", 5, "d", 13),
    ]);
    expect(map).toEqual({ andijon: 1 });
  });

  test("viloyat map tolerates null input", () => {
    expect(buildViloyatToRegionMap(null as unknown as AgriRegionDistrictMappingRow[])).toEqual({});
  });

  test("tuman -> district uses majority vote by count", () => {
    const map = buildTumanToDistrictMap([
      mapping("A", 1, "Chust", 5, 2),
      mapping("A", 1, "Chust", 6, 10),
      mapping("A", 1, "Chust", 7, 3),
      mapping("A", 1, "Pop", 8, 0),
      mapping("A", 1, "Bad", NaN, 100),
    ]);
    expect(map).toEqual({ chust: 6, pop: 8 });
  });

  test("turi -> crop id uses canonical crop key, first wins", () => {
    const map = buildTuriToCropIdMap([
      { turi: "Bug'doy", cropId: "11" },
      { turi: "Буғдой", cropId: "12" },
      { turi: "Paxta", cropId: "" },
      { turi: "", cropId: "13" },
    ]);
    expect(map).toEqual({ bugdoy: "11" });
  });
});

describe("resolveGraffCropIds", () => {
  const dict = { bugdoy: "11", paxta: "22" };

  test("resolves list, dedupes and reports unresolved", () => {
    expect(resolveGraffCropIds(["Wheat", "Bug'doy", "Kiwi"], "", dict)).toEqual({
      cropIds: ["11"],
      unresolved: ["Kiwi"],
    });
  });

  test("falls back to single turi, or nothing", () => {
    expect(resolveGraffCropIds([], "Paxta", dict)).toEqual({ cropIds: ["22"], unresolved: [] });
    expect(resolveGraffCropIds([], "", dict)).toEqual({ cropIds: [], unresolved: [] });
  });
});

describe("resolveGraffDistrictNumber", () => {
  const rows = [
    mapping("Andijon", 1, "Markaz", 101),
    mapping("Buxoro", 2, "Markaz", 201),
    mapping("Buxoro2", 2, "Chet", 202),
  ];
  const vToR = { andijon: 1, buxoro: 2, buxoro3: 2 };

  test("empty tuman -> undefined", () => {
    expect(resolveGraffDistrictNumber("Andijon", "", rows, vToR)).toBeUndefined();
  });

  test("exact viloyat+tuman match disambiguates shared names", () => {
    expect(resolveGraffDistrictNumber("Buxoro", "Markaz", rows, vToR)).toBe(201);
    expect(resolveGraffDistrictNumber("andijon", "markaz", rows, vToR)).toBe(101);
  });

  test("falls back to region code match when viloyat spelling differs", () => {
    expect(resolveGraffDistrictNumber("Buxoro3", "Chet", rows, vToR)).toBe(202);
  });

  test("falls back to tuman-only match when viloyat unknown or empty", () => {
    expect(resolveGraffDistrictNumber("Unknown", "Chet", rows, vToR)).toBe(202);
    expect(resolveGraffDistrictNumber("", "Markaz", rows, vToR)).toBe(101);
  });

  test("returns undefined when tuman not present", () => {
    expect(resolveGraffDistrictNumber("Andijon", "Nowhere", rows, vToR)).toBeUndefined();
  });
});

describe("mergeRegionalTimeseriesGroups date parsing", () => {
  const base = { ndvi: 0.5, polygon_count: 1 } as unknown as GraffRegionalTimeseriesRow;

  test("accepts epoch seconds / ms and drops invalid dates", () => {
    const ms = Date.UTC(2024, 0, 2);
    const merged = mergeRegionalTimeseriesGroups([
      [
        { ...base, date: String(ms / 1000) },
        { ...base, date: ms as unknown as string },
        { ...base, date: "not a date" },
      ],
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].date).toBe("2024-01-02");
    expect(merged[0].polygon_count).toBe(2);
  });

  test("index with no finite values becomes null; ranges default to 0", () => {
    const merged = mergeRegionalTimeseriesGroups([
      [{ date: "2024-01-01", polygon_count: 0 } as unknown as GraffRegionalTimeseriesRow],
    ]);
    expect(merged[0].ndvi).toBeNull();
    expect(merged[0].ndvi_min).toBe(0);
    expect(merged[0].ndvi_max).toBe(0);
  });
});

describe("queryGraffRegionalTimeseriesMerged", () => {
  beforeEach(() => timeseriesMock.mockReset());

  test("queries once per crop and merges by date", async () => {
    timeseriesMock.mockImplementation((opts: { cropId?: string }) =>
      Promise.resolve([
        { date: "2024-05-01", ndvi: opts.cropId === "1" ? 0.2 : 0.4, polygon_count: 1 },
      ]),
    );
    const rows = await queryGraffRegionalTimeseriesMerged({
      region: 1,
      cropIds: ["1", "2"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(timeseriesMock).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(1);
    expect(rows[0].ndvi).toBeCloseTo(0.3);
    expect(rows[0].polygon_count).toBe(2);
  });

  test("no crop ids -> single unscoped query", async () => {
    timeseriesMock.mockResolvedValue([]);
    await queryGraffRegionalTimeseriesMerged({
      cropIds: [],
      startDate: "a",
      endDate: "b",
      ndviStatus: "good",
    });
    expect(timeseriesMock).toHaveBeenCalledTimes(1);
    expect(timeseriesMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ cropId: undefined, ndviStatus: "good" }),
    );
  });
});
