import {
  buildLineSeries,
  buildMinMaxAreaPath,
  buildMonthTickPoints,
  buildSeriesByIndex,
  buildYAxisTicks,
  computeChartAxis,
  createChartScales,
  findNearestPointAcrossSeries,
  findNearestPointByX,
  isSameGuidePoint,
  resolveChartDateRange,
  toChartTooltipPoint,
} from "./chart-geometry";
import type { GraffChartScales, GraffSeriesPoint } from "./chart-types";

const padding = { top: 10, right: 5, bottom: 30, left: 50 };

const point = (iso: string, value: number, sourceIndex: number, extra: Partial<GraffSeriesPoint> = {}): GraffSeriesPoint => ({
  date: new Date(iso),
  value,
  sourceIndex,
  ...extra,
});

const identityScales: GraffChartScales = {
  xScale: (date) => date.getUTCDate(),
  yScale: (value) => value * 10,
};

describe("resolveChartDateRange", () => {
  const rows = [
    { raster_date: "2024-03-01" },
    { raster_date: "2024-01-01" },
    { raster_date: "2024-02-01" },
  ];

  test("sorts rows and clamps explicit indices", () => {
    const range = resolveChartDateRange(rows, -5, 10);
    expect(range.sortedRows.map((r) => r.raster_date)).toEqual([
      "2024-01-01",
      "2024-02-01",
      "2024-03-01",
    ]);
    expect(range.effectiveRangeStart).toBe(0);
    expect(range.effectiveRangeEnd).toBe(2);
    expect(range.rangeStartPercent).toBe(0);
    expect(range.rangeEndPercent).toBe(100);
    expect(range.rangeStartDate).toBe("2024-01-01");
    expect(range.rangeEndDate).toBe("2024-03-01");
  });

  test("keeps end >= start and slices the window", () => {
    const range = resolveChartDateRange(rows, 2, 1);
    expect(range.effectiveRangeStart).toBe(2);
    expect(range.effectiveRangeEnd).toBe(2);
    expect(range.sortedRows).toHaveLength(1);
  });

  test("single row reports 0..100 percent", () => {
    const range = resolveChartDateRange([{ raster_date: "2024-01-01" }], null, null);
    expect(range.lastRangeIndex).toBe(0);
    expect(range.rangeStartPercent).toBe(0);
    expect(range.rangeEndPercent).toBe(100);
  });
});

describe("buildSeriesByIndex", () => {
  test("drops invalid dates / non-finite values and renumbers sourceIndex", () => {
    const rows = [
      { raster_date: "2024-01-01", ndvi: 0.5, ndvi_min: "0.1", ndvi_max: null as number | null },
      { raster_date: "bad-date", ndvi: 0.6 },
      { raster_date: "2024-01-03", ndvi: null },
      { raster_date: "2024-01-04", ndvi: "0.7", ndvi_min: "x" },
    ];
    const series = buildSeriesByIndex(rows, ["ndvi"]);
    expect(series.ndvi).toHaveLength(2);
    expect(series.ndvi[0]).toMatchObject({ value: 0.5, min: 0.1, max: undefined, sourceIndex: 0 });
    expect(series.ndvi[1]).toMatchObject({ value: 0.7, min: undefined, sourceIndex: 1 });
  });
});

describe("axis + scales", () => {
  test("axis starts at 0 and pads the top", () => {
    const axis = computeChartAxis(1);
    expect(axis.axisMinValue).toBe(0);
    expect(axis.axisMaxValue).toBeCloseTo(1.06);
    expect(axis.axisRange).toBeCloseTo(1.06);
    expect(computeChartAxis(0).axisMaxValue).toBeCloseTo(0.02);
  });

  test("y ticks are 5 evenly spaced values", () => {
    expect(buildYAxisTicks({ axisMinValue: 0, axisMaxValue: 1, axisRange: 1 })).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test("x scale uses raw dates for < 3 points and blends otherwise", () => {
    const axis = { axisMinValue: 0, axisMaxValue: 1, axisRange: 1 };
    const two = [point("2024-01-01", 0.1, 0), point("2024-01-11", 0.2, 1)];
    const scales = createChartScales({ dataPoints: two, padding, chartWidth: 116, chartHeight: 100, axis });
    expect(scales.xScale(two[0].date, 0)).toBe(58);
    expect(scales.xScale(two[1].date, 1)).toBe(158);
    expect(scales.yScale(0)).toBe(110);
    expect(scales.yScale(1)).toBe(10);

    const three = [point("2024-01-01", 0.1, 0), point("2024-01-02", 0.2, 1), point("2024-01-11", 0.3, 2)];
    const blended = createChartScales({ dataPoints: three, padding, chartWidth: 116, chartHeight: 100, axis });
    // raw x = 58 + 10, uniform x = 58 + 50 → 0.25 * 68 + 0.75 * 108
    expect(blended.xScale(three[1].date, 1)).toBeCloseTo(98);
    expect(blended.xScale(three[1].date)).toBeCloseTo(68);
    expect(blended.xScale(three[1].date, 7)).toBeCloseTo(68);
  });
});

describe("paths", () => {
  test("min/max band needs two complete points", () => {
    expect(buildMinMaxAreaPath([], identityScales)).toBe("");
    expect(buildMinMaxAreaPath([point("2024-01-01", 1, 0, { min: 0, max: 2 })], identityScales)).toBe("");
    const path = buildMinMaxAreaPath(
      [point("2024-01-01", 1, 0, { min: 0, max: 2 }), point("2024-01-02", 1, 1, { min: 0.5, max: 1.5 })],
      identityScales,
    );
    expect(path).toBe("M 1 20 L 2 15 L 2 5 L 1 0 Z");
  });

  test("line series closes area to the baseline and keeps colors", () => {
    const rows = [
      { raster_date: "2024-01-01", ndvi: 1 },
      { raster_date: "2024-01-02", ndvi: 2 },
    ];
    const seriesByIndex = buildSeriesByIndex(rows, ["ndvi"]);
    const [line] = buildLineSeries(["ndvi"], seriesByIndex, identityScales, 99, {
      ndvi: "#0f0",
      savi: "",
      rvi: "",
      ci: "",
      evi: "",
      ndwi: "",
    });
    expect(line.color).toBe("#0f0");
    expect(line.points.map((p) => [p.x, p.y])).toEqual([[1, 10], [2, 20]]);
    expect(line.path.startsWith("M 1 10")).toBe(true);
    expect(line.areaPath.endsWith("L 2 99 L 1 99 Z")).toBe(true);
  });
});

describe("buildMonthTickPoints", () => {
  test("daily labels within a month", () => {
    const ticks = buildMonthTickPoints(
      [point("2024-01-05T00:00:00", 1, 0), point("2024-01-20T00:00:00", 1, 1)],
      identityScales.xScale,
      [],
      800,
    );
    expect(ticks.map((t) => t.label)).toEqual(["05.01", "20.01"]);
    expect(ticks.every((t) => t.daily)).toBe(true);
  });

  test("one label per month, thinned on narrow charts", () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const pts = labels.map((_, i) => point(`2024-0${i + 1}-10T00:00:00`, 1, i));
    expect(buildMonthTickPoints(pts, identityScales.xScale, labels, 800).map((t) => t.label)).toEqual(labels);
    expect(buildMonthTickPoints(pts, identityScales.xScale, labels, 500).map((t) => t.label)).toEqual(["Jan", "Mar", "May", "Jul"]);
    expect(buildMonthTickPoints([], identityScales.xScale, labels, 500)).toEqual([]);
  });
});

describe("nearest point lookup", () => {
  const pts = [point("2024-01-01", 1, 0), point("2024-01-05", 2, 1), point("2024-01-09", 3, 2)];

  test("by x picks the closest (first on ties)", () => {
    expect(findNearestPointByX([], identityScales.xScale, 3)).toBeNull();
    expect(findNearestPointByX(pts, identityScales.xScale, 6)?.value).toBe(2);
    expect(findNearestPointByX(pts, identityScales.xScale, 3)?.value).toBe(1);
  });

  test("across series uses euclidean distance", () => {
    const hit = findNearestPointAcrossSeries(
      [
        { key: "ndvi", color: "", path: "", areaPath: "", points: [{ x: 0, y: 0, value: 1, date: pts[0].date, sourceIndex: 0 }] },
        { key: "evi", color: "", path: "", areaPath: "", points: [{ x: 10, y: 10, value: 2, date: pts[1].date, sourceIndex: 0 }] },
      ],
      9,
      9,
    );
    expect(hit?.indexKey).toBe("evi");
    expect(hit?.distance).toBeCloseTo(Math.SQRT2);
    expect(findNearestPointAcrossSeries([], 0, 0)).toBeNull();
  });
});

describe("guide helpers", () => {
  const date = new Date("2024-01-01");

  test("isSameGuidePoint compares index, then sourceIndex or date", () => {
    expect(isSameGuidePoint(null, null)).toBe(false);
    expect(isSameGuidePoint({ indexKey: "ndvi", point: { date, value: 1 } }, { indexKey: "evi", point: { date, value: 1 } })).toBe(false);
    expect(isSameGuidePoint({ indexKey: "ndvi", point: { date, value: 1, sourceIndex: 1 } }, { indexKey: "ndvi", point: { date, value: 2, sourceIndex: 2 } })).toBe(false);
    expect(isSameGuidePoint({ indexKey: "ndvi", point: { date, value: 1 } }, { indexKey: "ndvi", point: { date: new Date(date), value: 2, sourceIndex: 3 } })).toBe(true);
  });

  test("toChartTooltipPoint drops negative / missing sourceIndex", () => {
    expect(toChartTooltipPoint({ date, value: 1, sourceIndex: -1 })).not.toHaveProperty("sourceIndex");
    expect(toChartTooltipPoint({ date, value: 1 })).not.toHaveProperty("sourceIndex");
    expect(toChartTooltipPoint({ date, value: 1, min: 0, sourceIndex: 0 })).toEqual({ date, value: 1, min: 0, max: undefined, sourceIndex: 0 });
  });
});
