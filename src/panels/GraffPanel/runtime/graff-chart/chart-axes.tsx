/**
 * Axis grid, selected-point extrema, x-axis ticks and crosshair guides for
 * the Graff vegetation chart.
 */
import { React } from "jimu-core";
import type { GraffMonthTick } from "./chart-geometry";
import type { GraffChartRenderCtx } from "./chart-render-ctx";
import type { GraffChartGuide } from "./chart-types";

const CHART_FONT = "'Manrope', sans-serif";
const MAX_COLOR = "#34d399";
const MIN_COLOR = "#f87171";
const VALUE_COLOR = "#fbbf24";
/** Tick labels closer than this (px) to a selected extremum are hidden. */
const EXTREMUM_TICK_GAP = 11;

const isOutsidePlot = (ctx: GraffChartRenderCtx, y: number): boolean => {
  const { padding, chartHeight } = ctx.layout;
  return y < padding.top - 1 || y > padding.top + chartHeight + 1;
};

const renderYTickLabel = (ctx: GraffChartRenderCtx, value: number) => {
  const { yScale } = ctx.scales;
  const y = yScale(value);
  // Hide axis labels that fall outside the plot (e.g. clipped "0.00").
  if (isOutsidePlot(ctx, y)) return null;
  // If a selected min/max sits on this tick, skip the tick
  // number so the colored extremum label owns that row.
  const selPt = ctx.selectionGuide?.point;
  const extremumNearTick =
    !!selPt &&
    [selPt.min, selPt.max].some(
      (ext) =>
        ext != null &&
        Number.isFinite(ext) &&
        Math.abs(yScale(ext) - y) < EXTREMUM_TICK_GAP,
    );
  if (extremumNearTick) return null;
  return (
    <g key={value}>
      <text
        x={ctx.layout.padding.left - 12}
        y={y + 4}
        textAnchor="end"
        fontSize={ctx.layout.axisTickFont}
        fill={ctx.theme.themeText}
        fontWeight="400"
        fontFamily={CHART_FONT}
      >
        {value.toFixed(2)}
      </text>
    </g>
  );
};

const renderExtremum = (
  ctx: GraffChartRenderCtx,
  kind: "min" | "max",
  value: number | undefined,
  color: string,
) => {
  if (value == null || !Number.isFinite(value)) return null;
  const y = ctx.scales.yScale(value);
  if (isOutsidePlot(ctx, y)) return null;
  const { padding, axisTickFont } = ctx.layout;
  const tickLen = 8;
  return (
    <g
      key={`y-sel-${kind}`}
      className={`graph-y-sel-extremum graph-y-sel-extremum--${kind}`}
    >
      <line
        x1={padding.left - tickLen}
        y1={y}
        x2={padding.left + 3}
        y2={y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={padding.left} cy={y} r={2.4} fill={color} />
      <text
        x={padding.left - 12}
        y={y + 3.5}
        textAnchor="end"
        fontSize={Math.max(9, axisTickFont - 1)}
        fill={color}
        fontWeight="700"
        fontFamily={CHART_FONT}
      >
        {value.toFixed(2)}
      </text>
    </g>
  );
};

/** Selected-point min/max — left column with Y-axis numbers. */
const renderSelectionExtrema = (ctx: GraffChartRenderCtx) => {
  if (!ctx.selectionGuide) return null;
  const pt = ctx.selectionGuide.point;
  return (
    <g className="graph-y-sel-extrema" pointerEvents="none">
      {renderExtremum(ctx, "max", pt.max, MAX_COLOR)}
      {renderExtremum(ctx, "min", pt.min, MIN_COLOR)}
    </g>
  );
};

export const renderChartGrid = (ctx: GraffChartRenderCtx) => {
  const { padding, chartHeight, chartWidth } = ctx.layout;
  const { themeGrid } = ctx.theme;
  return (
    <g className="grid">
      {ctx.yAxisTickValues.map((value) => renderYTickLabel(ctx, value))}

      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke={themeGrid}
        strokeWidth="1.2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke={themeGrid}
        strokeWidth="1.2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />

      {renderSelectionExtrema(ctx)}
    </g>
  );
};

export const renderMonthTicks = (
  ctx: GraffChartRenderCtx,
  monthTickPoints: GraffMonthTick[],
) => {
  const { monthTickY, monthTickFont } = ctx.layout;
  return monthTickPoints.map((tick, i) => (
    <text
      key={i}
      x={tick.x}
      y={monthTickY}
      textAnchor="middle"
      fontSize={tick.daily ? 8 : monthTickFont}
      fill={ctx.theme.themeText}
      fontWeight="400"
      fontFamily={CHART_FONT}
      transform={
        tick.daily ? `rotate(-38, ${tick.x}, ${monthTickY})` : undefined
      }
    >
      {tick.label}
    </text>
  ));
};

export const renderCrosshair = (
  ctx: GraffChartRenderCtx,
  guide: GraffChartGuide,
  variant: "selection" | "hover",
) => {
  const { xScale, yScale } = ctx.scales;
  const { padding, chartHeight } = ctx.layout;
  const pt = guide.point;
  const lineX = xScale(pt.date, pt.sourceIndex);
  const yVal = yScale(pt.value);
  const yMin = pt.min != null ? yScale(pt.min) : null;
  const yMax = pt.max != null ? yScale(pt.max) : null;
  const halfTick = 12 / 2;
  const isSelection = variant === "selection";
  // Hover guide is a bit softer so the sticky selection line stays primary.
  const lineStroke = isSelection
    ? "rgba(16, 185, 129, 0.55)"
    : "rgba(16, 185, 129, 0.28)";
  const markerOpacity = isSelection ? 1 : 0.7;
  const renderMarker = (y: number, stroke: string) => (
    <line
      x1={lineX - halfTick}
      y1={y}
      x2={lineX + halfTick}
      y2={y}
      stroke={stroke}
      strokeWidth={2}
      opacity={markerOpacity}
    />
  );
  return (
    <g
      key={`graph-crosshair-${variant}`}
      className={`graph-crosshair graph-crosshair--${variant}`}
      pointerEvents="none"
    >
      <line
        x1={lineX}
        y1={padding.top}
        x2={lineX}
        y2={padding.top + chartHeight}
        stroke={lineStroke}
        strokeWidth={isSelection ? 1.5 : 1.2}
        strokeDasharray="6,4"
      />
      {yMin != null && renderMarker(yMin, MIN_COLOR)}
      {yMax != null && renderMarker(yMax, MAX_COLOR)}
      {renderMarker(yVal, VALUE_COLOR)}
    </g>
  );
};
