/**
 * Line paths + sampled dots for each Graff vegetation index series.
 */
import { React } from "jimu-core";
import { resolveDotStyle, resolveMaxVisibleDots } from "./chart-layout";
import type { GraffChartRenderCtx } from "./chart-render-ctx";
import type { GraffLineSeries, GraffLineSeriesPoint } from "./chart-types";

const INNER_DOT_STROKE = "#ffffff";

const renderSeriesLines = (
  ctx: GraffChartRenderCtx,
  series: GraffLineSeries,
  seriesIdx: number,
) => {
  const { isIpadLayout, isMultiIndexMode, layout, interactions } = ctx;
  const staticSuffix = isIpadLayout ? " graff-line-path--static" : "";
  const animationDelay = isIpadLayout ? undefined : `${70 + seriesIdx * 130}ms`;
  const dashProps = {
    pathLength: isIpadLayout ? undefined : 100,
    strokeDasharray: isIpadLayout ? undefined : 100,
    strokeDashoffset: isIpadLayout ? undefined : 100,
  };
  return (
    <>
      <path
        className={`graff-line-path graff-line-path--glow${staticSuffix}`}
        d={series.path}
        {...dashProps}
        fill="none"
        stroke={series.color}
        strokeWidth={layout.lineStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={isIpadLayout ? undefined : "url(#lineGlow)"}
        style={{ pointerEvents: "none", animationDelay }}
      />
      <path
        className={`graff-line-path${staticSuffix}`}
        d={series.path}
        {...dashProps}
        fill="none"
        stroke={series.color}
        strokeWidth={layout.lineStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.98, animationDelay }}
        onMouseMove={(e) => {
          if (!isMultiIndexMode) return;
          e.stopPropagation();
          const svg = e.currentTarget.ownerSVGElement;
          if (!svg) return;
          const rect = svg.getBoundingClientRect();
          const svgX =
            ((e.clientX - rect.left) / rect.width) * layout.graphWidth;
          const point = interactions.findNearestSeriesPoint(svgX, series.key);
          if (point) {
            interactions.setChartTooltipForIndex(series.key, point);
          }
        }}
      />
    </>
  );
};

const renderSeriesDot = (
  ctx: GraffChartRenderCtx,
  series: GraffLineSeries,
  seriesIdx: number,
  d: GraffLineSeriesPoint,
  i: number,
) => {
  const { host, isIpadLayout, isMultiIndexMode, chartTooltip, selectedNdviDate } = ctx;
  const totalPoints = series.points.length;
  // Thin visible markers a bit so dense series don't look cluttered.
  const maxVisibleDots = resolveMaxVisibleDots(ctx.layout.chartWidth, isIpadLayout);
  const sampleStep = Math.max(1, Math.ceil(totalPoints / maxVisibleDots));
  const localDateStr =
    host.resolveAgainstAvailableDates(
      d.date,
      host.state.polygonAvailableDates || [],
    ) || host.formatLocalDateYmd(d.date);
  const isActive =
    !!selectedNdviDate &&
    localDateStr === selectedNdviDate &&
    (!isMultiIndexMode || host.state.selectedChartIndexKey === series.key);
  const isHovered =
    !!chartTooltip &&
    chartTooltip.indexKey === series.key &&
    chartTooltip.point?.sourceIndex === d.sourceIndex;
  const isSampled = i % sampleStep === 0 || i === totalPoints - 1;
  if (!isSampled && !isActive && !isHovered) return null;
  const isInstantReveal = isHovered && !isSampled && !isActive;
  const isLightTheme = !host.state.isDarkTheme;
  const dot = resolveDotStyle(isIpadLayout, isLightTheme, isActive, isHovered);
  return (
    <g
      key={`${series.key}-${i}`}
      className={`graff-line-dot-group${
        isInstantReveal ? " graff-line-dot-group--instant" : ""
      }`}
      style={{
        animationDelay: isInstantReveal
          ? undefined
          : `${160 + seriesIdx * 120 + Math.floor(i / sampleStep) * 28}ms`,
      }}
      onMouseMove={(e) => {
        if (!isMultiIndexMode) return;
        e.stopPropagation();
        ctx.interactions.setChartTooltipForIndex(series.key, {
          date: d.date,
          value: d.value,
          min: d.min,
          max: d.max,
          sourceIndex: d.sourceIndex,
        });
      }}
    >
      <circle
        className="graff-line-dot-glow"
        cx={d.x}
        cy={d.y}
        r={dot.glowRadius}
        fill={series.color}
        stroke="none"
        filter="url(#dotGlow)"
        style={{ pointerEvents: "none" }}
      />
      {isLightTheme ? (
        <circle
          className="graff-line-dot-ring"
          cx={d.x}
          cy={d.y}
          r={dot.outerRadius}
          fill="none"
          stroke={series.color}
          strokeWidth={dot.outerRingWidth}
        />
      ) : null}
      <circle
        className="graff-line-dot"
        cx={d.x}
        cy={d.y}
        r={dot.radius}
        fill={series.color}
        stroke={INNER_DOT_STROKE}
        strokeWidth={dot.strokeWidth}
        style={{ transition: "r 0.2s ease" }}
      >
        <title>
          {`${series.key.toUpperCase()}: ${d.value.toFixed(4)}`}
          {"\n"}
          {d.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </title>
      </circle>
    </g>
  );
};

export const renderLineSeries = (ctx: GraffChartRenderCtx) =>
  ctx.lineSeries.map((series, seriesIdx) => (
    <g key={`${series.key}-${ctx.host.state.chartAnimKey}`}>
      {series.areaPath && ctx.finalIndices.length <= 2 && (
        <path
          d={series.areaPath}
          fill={`url(#areaFill-${series.key})`}
          opacity={0.92}
        />
      )}
      {series.path && renderSeriesLines(ctx, series, seriesIdx)}
      {series.points.map((d, i) => renderSeriesDot(ctx, series, seriesIdx, d, i))}
    </g>
  ));
