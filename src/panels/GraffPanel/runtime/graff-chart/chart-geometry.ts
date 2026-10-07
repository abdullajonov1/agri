/**
 * Pure geometry helpers for the Graff vegetation chart (no React / DOM).
 */
import type { GraffIndexKey } from "../graff-graph-constants";
import {
  buildGraffSmoothPath,
  resolveDefaultDateRangeIndices,
} from "../graff-timeseries-helpers";
import type {
  GraffChartGuide,
  GraffChartPadding,
  GraffChartPointValue,
  GraffChartScales,
  GraffLineSeries,
  GraffSeriesByIndex,
  GraffSeriesPoint,
} from "./chart-types";

/** Horizontal inset inside the plot so edge dots are not clipped. */
const INNER_PADDING_X = 8;
const Y_AXIS_TICK_STEPS = 4;
/** Share of uniform (index-based) spacing in the blended x position. */
const UNIFORM_X_WEIGHT = 0.75;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_TICK_MAX_RANGE_MS = 31 * DAY_MS;

export interface GraffChartDateRange<T> {
  sortedRows: T[];
  lastRangeIndex: number;
  effectiveRangeStart: number;
  effectiveRangeEnd: number;
  rangeStartDate: string | undefined;
  rangeEndDate: string | undefined;
  rangeStartPercent: number;
  rangeEndPercent: number;
}

/** Sort rows by date and clamp the user's range slider indices onto them. */
export function resolveChartDateRange<T extends { raster_date: string }>(
  rows: T[],
  startIndex: number | null | undefined,
  endIndex: number | null | undefined,
): GraffChartDateRange<T> {
  const sortedRowsBase = [...rows].sort(
    (a, b) =>
      new Date(a.raster_date).getTime() - new Date(b.raster_date).getTime(),
  );
  const lastRangeIndex = Math.max(sortedRowsBase.length - 1, 0);
  const defaultRange = resolveDefaultDateRangeIndices(sortedRowsBase);
  const effectiveRangeStart = Math.min(
    Math.max(startIndex ?? defaultRange.startIndex, 0),
    lastRangeIndex,
  );
  const effectiveRangeEnd = Math.max(
    effectiveRangeStart,
    Math.min(endIndex ?? defaultRange.endIndex, lastRangeIndex),
  );
  return {
    sortedRows: sortedRowsBase.slice(effectiveRangeStart, effectiveRangeEnd + 1),
    lastRangeIndex,
    effectiveRangeStart,
    effectiveRangeEnd,
    rangeStartDate: sortedRowsBase[effectiveRangeStart]?.raster_date,
    rangeEndDate: sortedRowsBase[effectiveRangeEnd]?.raster_date,
    rangeStartPercent: lastRangeIndex
      ? (effectiveRangeStart / lastRangeIndex) * 100
      : 0,
    rangeEndPercent: lastRangeIndex
      ? (effectiveRangeEnd / lastRangeIndex) * 100
      : 100,
  };
}

const readRowField = (row: object, key: string): unknown =>
  (row as Record<string, unknown>)[key];

const toOptionalNumber = (raw: unknown): number | undefined =>
  raw == null || Number.isNaN(Number(raw)) ? undefined : Number(raw);

/** Build per-index point lists (valid dates + finite values only). */
export function buildSeriesByIndex(
  rows: Array<{ raster_date: string }>,
  indices: GraffIndexKey[],
): GraffSeriesByIndex {
  return indices.reduce((acc, idx) => {
    acc[idx] = rows
      .map((row, rowIndex) => {
        const rawValue = readRowField(row, idx);
        return {
          date: new Date(row.raster_date),
          value: rawValue == null ? Number.NaN : Number(rawValue),
          sourceIndex: rowIndex,
          min: toOptionalNumber(readRowField(row, `${idx}_min`)),
          max: toOptionalNumber(readRowField(row, `${idx}_max`)),
        };
      })
      .filter(
        (point) =>
          !Number.isNaN(point.date.getTime()) && Number.isFinite(point.value),
      )
      .map((point, sourceIndex) => ({ ...point, sourceIndex }));
    return acc;
  }, {} as GraffSeriesByIndex);
}

export interface GraffChartAxis {
  axisMinValue: number;
  axisMaxValue: number;
  axisRange: number;
}

/** Y scale always starts at 0 (product rule) — never below even for negatives. */
export function computeChartAxis(rawMaxValue: number): GraffChartAxis {
  const topPadding = Math.max(rawMaxValue * 0.06, 0.02);
  const axisMinValue = 0;
  const axisMaxValue = Math.max(rawMaxValue + topPadding, axisMinValue + 0.01);
  return {
    axisMinValue,
    axisMaxValue,
    axisRange: Math.max(axisMaxValue - axisMinValue, 0.001),
  };
}

export interface GraffScaleInput {
  dataPoints: GraffSeriesPoint[];
  padding: GraffChartPadding;
  chartWidth: number;
  chartHeight: number;
  axis: GraffChartAxis;
}

export function createChartScales({
  dataPoints,
  padding,
  chartWidth,
  chartHeight,
  axis,
}: GraffScaleInput): GraffChartScales {
  const minDate = dataPoints[0].date.getTime();
  const maxDate = dataPoints[dataPoints.length - 1].date.getTime();
  const dateRange = Math.max(maxDate - minDate, 1);
  const plotWidth = chartWidth - INNER_PADDING_X * 2;
  const rawXScale = (date: Date) =>
    padding.left +
    INNER_PADDING_X +
    ((date.getTime() - minDate) / dateRange) * plotWidth;
  const xScale = (date: Date, sourceIndex?: number) => {
    if (
      sourceIndex == null ||
      dataPoints.length < 3 ||
      sourceIndex < 0 ||
      sourceIndex >= dataPoints.length
    ) {
      return rawXScale(date);
    }
    const uniformX =
      padding.left +
      INNER_PADDING_X +
      (sourceIndex / Math.max(dataPoints.length - 1, 1)) * plotWidth;
    // Blend date-based spacing with uniform spacing so dense points spread out visually.
    return rawXScale(date) * (1 - UNIFORM_X_WEIGHT) + uniformX * UNIFORM_X_WEIGHT;
  };
  const yScale = (value: number) =>
    padding.top +
    chartHeight -
    ((value - axis.axisMinValue) / axis.axisRange) * chartHeight;
  return { xScale, yScale };
}

export function buildYAxisTicks(axis: GraffChartAxis): number[] {
  const ticks: number[] = [];
  for (let i = 0; i <= Y_AXIS_TICK_STEPS; i++) {
    ticks.push(axis.axisMinValue + (axis.axisRange * i) / Y_AXIS_TICK_STEPS);
  }
  return ticks;
}

/** Closed band path between per-point max (top) and min (bottom). */
export function buildMinMaxAreaPath(
  dataPoints: GraffSeriesPoint[],
  { xScale, yScale }: GraffChartScales,
): string {
  if (dataPoints.length === 0) return "";
  const valid = dataPoints.filter((d) => d.min != null && d.max != null);
  if (valid.length < 2) return "";
  const top = valid
    .map((d, index) => {
      const x = xScale(d.date, d.sourceIndex);
      const y = yScale(d.max as number);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");
  const bottom = valid
    .slice()
    .reverse()
    .map((d) => `L ${xScale(d.date, d.sourceIndex)} ${yScale(d.min as number)}`)
    .join(" ");
  return `${top} ${bottom} Z`;
}

export function buildLineSeries(
  indices: GraffIndexKey[],
  seriesByIndex: GraffSeriesByIndex,
  { xScale, yScale }: GraffChartScales,
  baselineY: number,
  colorMap: Record<GraffIndexKey, string>,
): GraffLineSeries[] {
  return indices.map((idx) => {
    const points = (seriesByIndex[idx] || []).map((d) => ({
      x: xScale(d.date, d.sourceIndex),
      y: yScale(d.value),
      value: d.value,
      date: d.date,
      min: d.min,
      max: d.max,
      sourceIndex: d.sourceIndex,
    }));
    const areaPath =
      points.length < 2
        ? ""
        : `${buildGraffSmoothPath(points)} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
    return {
      key: idx,
      color: colorMap[idx],
      points,
      path: buildGraffSmoothPath(points),
      areaPath,
    };
  });
}

export type GraffMonthTick = { x: number; label: string; daily?: boolean };

const formatDayMonth = (date: Date): string =>
  `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;

/**
 * For a one-month (or shorter) range show every observation date;
 * otherwise keep the compact one-label-per-month axis.
 */
export function buildMonthTickPoints(
  dataPoints: GraffSeriesPoint[],
  xScale: GraffChartScales["xScale"],
  monthLabels: string[],
  graphWidth: number,
): GraffMonthTick[] {
  if (dataPoints.length === 0) return [];
  const visibleRangeMs = Math.max(
    dataPoints[dataPoints.length - 1].date.getTime() -
      dataPoints[0].date.getTime(),
    0,
  );
  if (visibleRangeMs <= DAILY_TICK_MAX_RANGE_MS) {
    return dataPoints.map((point) => ({
      x: xScale(point.date, point.sourceIndex),
      label: formatDayMonth(point.date),
      daily: true,
    }));
  }
  const seen = new Set<string>();
  const ticks: GraffMonthTick[] = [];
  for (const d of dataPoints) {
    const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      ticks.push({
        x: xScale(d.date, d.sourceIndex),
        label: monthLabels[d.date.getMonth()],
      });
    }
  }
  if (graphWidth < 560 && ticks.length > 5) {
    return ticks.filter((_, index) => index % 2 === 0);
  }
  return ticks;
}

/** Point whose x position is closest to svgX (first wins on ties). */
export function findNearestPointByX<P extends { date: Date; sourceIndex: number }>(
  points: P[],
  xScale: GraffChartScales["xScale"],
  svgX: number,
): P | null {
  if (points.length === 0) return null;
  let nearest = 0;
  let minDist = Math.abs(xScale(points[0].date, points[0].sourceIndex) - svgX);
  for (let i = 1; i < points.length; i++) {
    const distance = Math.abs(
      xScale(points[i].date, points[i].sourceIndex) - svgX,
    );
    if (distance < minDist) {
      minDist = distance;
      nearest = i;
    }
  }
  return points[nearest];
}

export type GraffNearestSeriesHit = GraffChartGuide & { distance: number };

/** Euclidean-nearest rendered dot across all line series. */
export function findNearestPointAcrossSeries(
  lineSeries: GraffLineSeries[],
  svgX: number,
  svgY: number,
): GraffNearestSeriesHit | null {
  let best: GraffNearestSeriesHit | null = null;
  for (const series of lineSeries) {
    for (const p of series.points) {
      const distance = Math.hypot(p.x - svgX, p.y - svgY);
      if (!best || distance < best.distance) {
        best = {
          distance,
          indexKey: series.key,
          point: {
            date: p.date,
            value: p.value,
            min: p.min,
            max: p.max,
            sourceIndex: p.sourceIndex,
          },
        };
      }
    }
  }
  return best;
}

/** True when both guides point at the same sample of the same index. */
export function isSameGuidePoint(
  a: GraffChartGuide | null,
  b: GraffChartGuide | null,
): boolean {
  if (!a || !b) return false;
  if (a.indexKey !== b.indexKey) return false;
  const aIdx = a.point.sourceIndex;
  const bIdx = b.point.sourceIndex;
  if (aIdx != null && bIdx != null) return aIdx === bIdx;
  return a.point.date.getTime() === b.point.date.getTime();
}

/** Copy a point, dropping a missing / negative sourceIndex. */
export function toChartTooltipPoint(
  point: GraffChartPointValue,
): GraffChartPointValue {
  return {
    date: point.date,
    value: point.value,
    min: point.min,
    max: point.max,
    ...(point.sourceIndex != null && point.sourceIndex >= 0
      ? { sourceIndex: point.sourceIndex }
      : {}),
  };
}
