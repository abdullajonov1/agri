import {
  buildGraffSmoothPath,
  mergeRegionalTimeseriesFieldsIntoChart,
  regionalTimeseriesRowToYmd,
  resolveDefaultDateRangeIndices,
  type RegionalTimeseriesRow,
} from "./graff-timeseries-helpers";

const row = (date: string, extra: Partial<RegionalTimeseriesRow> = {}): RegionalTimeseriesRow => ({
  date,
  ndvi: 0.5, ndvi_min: 0.1, ndvi_max: 0.9,
  savi: 0.2, savi_min: 0, savi_max: 0.3,
  rvi: 1, rvi_min: 0, rvi_max: 2,
  ci: 1, ci_min: 0, ci_max: 2,
  evi: 0.3,
  ndwi: 0.1, ndwi_min: 0, ndwi_max: 0.2,
  polygon_count: 3,
  ...extra,
});

describe("regionalTimeseriesRowToYmd", () => {
  test("parses iso, epoch seconds and ms", () => {
    expect(regionalTimeseriesRowToYmd({ date: "2024-05-03T10:00:00Z" })).toBe("2024-05-03");
    expect(regionalTimeseriesRowToYmd({ raster_date: 1704067200 })).toBe("2024-01-01");
    expect(regionalTimeseriesRowToYmd({ raster_date: "1704067200000" })).toBe("2024-01-01");
  });
  test("prefers raster_date and rejects invalid", () => {
    expect(regionalTimeseriesRowToYmd({ raster_date: "2024-02-02", date: "2020-01-01" })).toBe("2024-02-02");
    expect(regionalTimeseriesRowToYmd({})).toBeNull();
    expect(regionalTimeseriesRowToYmd({ date: "garbage" })).toBeNull();
  });
});

describe("mergeRegionalTimeseriesFieldsIntoChart", () => {
  test("adds new dates and sorts", () => {
    const merged = mergeRegionalTimeseriesFieldsIntoChart(
      [{ date: "2024-02-01", ndvi: 0.4 }],
      [row("2024-01-01")],
      ["ndvi"],
    );
    expect(merged.map((r) => (r as { date: string }).date)).toEqual(["2024-01-01", "2024-02-01"]);
  });

  test("does not overwrite finite values with NaN/null", () => {
    const merged = mergeRegionalTimeseriesFieldsIntoChart(
      [{ date: "2024-01-01", ndvi: 0.4, savi: 0.1 }],
      [row("2024-01-01", { ndvi: Number.NaN, savi: 0.7, polygon_count: 9 })],
      ["ndvi", "savi", "missingField"],
    );
    expect(merged).toHaveLength(1);
    const first = merged[0] as Record<string, unknown>;
    expect(first.ndvi).toBe(0.4);
    expect(first.savi).toBe(0.7);
    expect(first.polygon_count).toBe(9);
    expect(first.raster_date).toBe("2024-01-01");
  });

  test("skips rows without valid dates", () => {
    const merged = mergeRegionalTimeseriesFieldsIntoChart(
      [{ date: "bad" }],
      [row("also-bad")],
      ["ndvi"],
    );
    expect(merged).toEqual([]);
  });
});

describe("buildGraffSmoothPath", () => {
  test("handles 0/1 points", () => {
    expect(buildGraffSmoothPath([])).toBe("");
    expect(buildGraffSmoothPath([{ x: 1, y: 2 }])).toBe("M 1 2");
  });
  test("builds cubic segments", () => {
    const d = buildGraffSmoothPath([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }]);
    expect(d.startsWith("M 0 0")).toBe(true);
    expect(d.match(/C /g)).toHaveLength(2);
    expect(d.endsWith("20 0")).toBe(true);
  });
});

describe("resolveDefaultDateRangeIndices", () => {
  test("short inputs", () => {
    expect(resolveDefaultDateRangeIndices([])).toEqual({ startIndex: 0, endIndex: 0 });
    expect(resolveDefaultDateRangeIndices([{ date: "2024-01-01" }])).toEqual({ startIndex: 0, endIndex: 0 });
  });
  test("last N months window", () => {
    const rows = ["2024-01-01", "2024-03-01", "2024-05-01", "2024-06-01", "2024-07-01"].map((d) => ({ raster_date: d }));
    expect(resolveDefaultDateRangeIndices(rows, 2)).toEqual({ startIndex: 2, endIndex: 4 });
    expect(resolveDefaultDateRangeIndices(rows)).toEqual({ startIndex: 2, endIndex: 4 });
  });
  test("invalid end date returns full range", () => {
    expect(resolveDefaultDateRangeIndices([{ date: "2024-01-01" }, { date: "x" }])).toEqual({ startIndex: 0, endIndex: 1 });
  });
});
