/**
 * Graff vegetation chart renderer, moved verbatim out of AgriGraffWidget.
 * `host` is the widget instance: state, setState, geometry cache and the
 * overlay/fetch methods stay owned by the widget.
 *
 * Geometry, layout, interactions and SVG parts live in ./graff-chart/.
 */
import { React } from "jimu-core";
import { TriangleAlert } from "lucide-react";
import AgriChartLoader from "../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../shared/agriNoDataLabel";
import {
  GRAFF_INDEX_BUTTONS,
  GRAFF_INDEX_ORDER,
  type GraffIndexKey,
} from "./graff-graph-constants";
import { renderChartGrid, renderCrosshair, renderMonthTicks } from "./graff-chart/chart-axes";
import {
  buildLineSeries,
  buildMinMaxAreaPath,
  buildMonthTickPoints,
  buildSeriesByIndex,
  buildYAxisTicks,
  computeChartAxis,
  createChartScales,
  isSameGuidePoint,
  resolveChartDateRange,
  type GraffChartAxis,
} from "./graff-chart/chart-geometry";
import { createChartInteractions } from "./graff-chart/chart-interactions";
import { graffChartErrorTitle, graffChartMonthLabels, graffChartRetryLabel } from "./graff-chart/chart-labels";
import {
  computeChartLayout,
  detectIpadLayout,
  resolveChartTheme,
  type GraffChartLayout,
} from "./graff-chart/chart-layout";
import { renderDateRangeSlider, renderFloatingTooltip } from "./graff-chart/chart-overlays";
import type { GraffChartRenderCtx } from "./graff-chart/chart-render-ctx";
import { renderLineSeries } from "./graff-chart/chart-series";
import { renderChartDefs } from "./graff-chart/chart-svg-defs";
import type {
  GraffChartGeometryCache,
  GraffChartGuide,
  GraffChartScales,
  GraffGraphHost,
  GraffSeriesByIndex,
  GraffSeriesPoint,
} from "./graff-chart/chart-types";

export type { GraffChartGeometryCache, GraffGraphHost } from "./graff-chart/chart-types";

const renderNoData = (language: string) => (
  <div className="kadastr-status-no-data">
    <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
    <h3>{agriNoDataLabel(language)}</h3>
  </div>
);

/** Loader / error / empty frames; null when the chart itself should render. */
const renderGraphStatus = (host: GraffGraphHost): React.ReactElement | null => {
  const { vegetationData, loadingVegetation, vegetationError, selecteduniqueid, language } = host.state;
  const hasGraphData = !!(vegetationData && vegetationData.length > 0);
  const awaitingFirstGraphData = !host._hasCompletedGraphFetch;
  // Loader only on cold start — keep previous series while refetching (Agrobank morph).
  if (!hasGraphData && (loadingVegetation || awaitingFirstGraphData)) {
    return host.wrapGraphFrame(
      <div className="kadastr-status-loading-container">
        <AgriChartLoader />
      </div>,
    );
  }
  if (vegetationError) {
    const onRetry = selecteduniqueid ? host.fetchVegetationData : host.fetchRegionalTimeseries;
    return host.wrapGraphFrame(
      <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <h3>{graffChartErrorTitle(language)}</h3>
        <p>{host.localizeRuntimeMessage(vegetationError)}</p>
        <button onClick={onRetry} className="kadastr-status-retry-button">
          {graffChartRetryLabel(language)}
        </button>
      </div>,
    );
  }
  // Empty state only after a real fetch returned zero rows.
  if (!loadingVegetation && host._hasCompletedGraphFetch && !hasGraphData) {
    return host.wrapGraphFrame(renderNoData(language));
  }
  return null;
};

const resolveFinalIndices = (selectedIndices: string[]): GraffIndexKey[] => {
  const activeIndices = GRAFF_INDEX_ORDER.filter((idx) => selectedIndices.includes(idx));
  return activeIndices.length > 0 ? activeIndices : ["ndvi"];
};

const INDEX_COLOR_MAP = GRAFF_INDEX_BUTTONS.reduce(
  (acc, item) => {
    acc[item.key] = item.color;
    return acc;
  },
  {} as Record<GraffIndexKey, string>,
);

/** Reuse cached geometry when nothing that shapes it changed. */
const resolveGeometry = (
  host: GraffGraphHost,
  cacheKey: string,
  build: () => GraffChartGeometryCache,
): GraffChartGeometryCache => {
  if (host._chartGeometryCacheKey === cacheKey && host._chartGeometryCache) {
    return host._chartGeometryCache;
  }
  const geometry = build();
  host._chartGeometryCacheKey = cacheKey;
  host._chartGeometryCache = geometry;
  return geometry;
};

const buildGeometryCacheKey = (
  host: GraffGraphHost,
  dataPoints: GraffSeriesPoint[],
  finalIndices: GraffIndexKey[],
  layout: GraffChartLayout,
  axis: GraffChartAxis,
): string => {
  const { vegetationData, selectedMonth, dateRangeStartIndex, dateRangeEndIndex } = host.state;
  return [
    vegetationData?.length ?? 0,
    dataPoints[0]?.date?.getTime?.() ?? 0,
    dataPoints[dataPoints.length - 1]?.date?.getTime?.() ?? 0,
    finalIndices.join(","),
    layout.graphWidth,
    layout.graphHeight,
    selectedMonth ?? "",
    dateRangeStartIndex,
    dateRangeEndIndex,
    Math.round(axis.axisMaxValue * 1000),
  ].join("|");
};

/** Persistent guide for the chart-selected date (survives mouse leave). */
const resolveSelectionGuide = (
  host: GraffGraphHost,
  seriesByIndex: GraffSeriesByIndex,
  primaryIndex: GraffIndexKey,
): GraffChartGuide | null => {
  const { selectedNdviDate } = host.state;
  if (!selectedNdviDate) return null;
  const indexKey = (host.state.selectedChartIndexKey || primaryIndex) as GraffIndexKey;
  const series = seriesByIndex[indexKey] || [];
  const advertised = host.state.polygonAvailableDates || [];
  for (const p of series) {
    const ymd =
      host.resolveAgainstAvailableDates(p.date, advertised) ||
      host.formatLocalDateYmd(p.date);
    if (ymd !== selectedNdviDate) continue;
    return {
      indexKey,
      point: { date: p.date, value: p.value, min: p.min, max: p.max, sourceIndex: p.sourceIndex },
    };
  }
  return null;
};

const buildGeometry = (
  dataPoints: GraffSeriesPoint[],
  finalIndices: GraffIndexKey[],
  seriesByIndex: GraffSeriesByIndex,
  scales: GraffChartScales,
  axis: GraffChartAxis,
  layout: GraffChartLayout,
): GraffChartGeometryCache => ({
  yAxisTickValues: buildYAxisTicks(axis),
  minMaxAreaPath: buildMinMaxAreaPath(dataPoints, scales),
  lineSeries: buildLineSeries(
    finalIndices,
    seriesByIndex,
    scales,
    layout.padding.top + layout.chartHeight,
    INDEX_COLOR_MAP,
  ),
});

const renderChartSvg = (ctx: GraffChartRenderCtx, monthTickPoints: ReturnType<typeof buildMonthTickPoints>) => {
  const { layout, interactions, selectionGuide, chartTooltip } = ctx;
  const { padding, graphWidth, graphHeight } = layout;
  // Sticky selection line always stays; hover adds a second line only when
  // the cursor is over a different point.
  const hoverGuide =
    chartTooltip && !isSameGuidePoint(selectionGuide, chartTooltip) ? chartTooltip : null;
  return (
    <svg
      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      className="graph-svg"
      onMouseMove={interactions.handleChartMouseMove}
      onMouseLeave={interactions.handleChartMouseLeave}
      onClick={interactions.handleChartClick}
    >
      {renderChartDefs(ctx.lineSeries)}

      {/* Subtle background fill for chart area */}
      <rect
        x={padding.left}
        y={padding.top}
        width={layout.chartWidth}
        height={layout.chartHeight}
        fill="transparent"
        stroke="none"
        rx="0"
      />

      {/* Chart content */}
      <g>
        {renderChartGrid(ctx)}
        {renderLineSeries(ctx)}
        {renderMonthTicks(ctx, monthTickPoints)}
        {/* X-axis title removed by request */}
        {/* Y-axis title (INDEX) removed by request */}
      </g>

      {/* Sticky selection crosshair + optional hover crosshair */}
      {selectionGuide ? renderCrosshair(ctx, selectionGuide, "selection") : null}
      {hoverGuide ? renderCrosshair(ctx, hoverGuide, "hover") : null}
    </svg>
  );
};

export const renderGraffGraph = (host: GraffGraphHost) => {
  const status = renderGraphStatus(host);
  if (status) return status;

  const { vegetationData, loadingVegetation, selectedIndices, chartTooltip, selectedNdviDate, language } = host.state;
  const finalIndices = resolveFinalIndices(selectedIndices);
  const primaryIndex = finalIndices[0];
  const isIpadLayout = detectIpadLayout();
  const layout = computeChartLayout(host.state.graphViewportWidth, host.state.graphViewportHeight, isIpadLayout);

  const range = resolveChartDateRange(vegetationData, host.state.dateRangeStartIndex, host.state.dateRangeEndIndex);
  const seriesByIndex = buildSeriesByIndex(range.sortedRows, finalIndices);
  const dataPoints = seriesByIndex[primaryIndex] || [];

  // Find min/max values across selected indicators for comparison scale
  const allSeriesPoints = finalIndices.flatMap((idx) => seriesByIndex[idx]);
  const values = allSeriesPoints.map((d) => d.value).filter((v) => Number.isFinite(v));
  const allMaxs = allSeriesPoints
    .map((d) => d.max)
    .filter((v): v is number => v != null && Number.isFinite(v));
  if (values.length === 0 || dataPoints.length === 0) {
    return renderNoData(language);
  }

  const axis = computeChartAxis(Math.max(...values, ...allMaxs));
  const scales = createChartScales({
    dataPoints,
    padding: layout.padding,
    chartWidth: layout.chartWidth,
    chartHeight: layout.chartHeight,
    axis,
  });
  const { yAxisTickValues, lineSeries } = resolveGeometry(
    host,
    buildGeometryCacheKey(host, dataPoints, finalIndices, layout, axis),
    () => buildGeometry(dataPoints, finalIndices, seriesByIndex, scales, axis, layout),
  );
  const isMultiIndexMode = finalIndices.length > 1;

  const ctx: GraffChartRenderCtx = {
    host,
    language,
    layout,
    theme: resolveChartTheme(host.state.isDarkTheme),
    isIpadLayout,
    isMultiIndexMode,
    finalIndices,
    indexColorMap: INDEX_COLOR_MAP,
    scales,
    lineSeries,
    yAxisTickValues,
    selectionGuide: resolveSelectionGuide(host, seriesByIndex, primaryIndex),
    chartTooltip,
    selectedNdviDate,
    interactions: createChartInteractions({
      host,
      isMultiIndexMode,
      primaryIndex,
      graphWidth: layout.graphWidth,
      graphHeight: layout.graphHeight,
      dataPoints,
      seriesByIndex,
      lineSeries,
      xScale: scales.xScale,
    }),
  };
  const monthTickPoints = buildMonthTickPoints(
    dataPoints,
    scales.xScale,
    graffChartMonthLabels(language),
    layout.graphWidth,
  );
  const hasGraphData = !!(vegetationData && vegetationData.length > 0);
  const isRefreshing = !!loadingVegetation && hasGraphData;

  return (
    <div
      className={`vegetation-graph-container ${layout.isNarrow ? "is-narrow" : ""} ${layout.compactChart ? "is-compact" : ""}${
        isIpadLayout ? " is-ipad-layout" : ""
      }${isRefreshing ? " vegetation-graph-container--loading" : ""}`}
      ref={host.graphContainerRef}
    >
      {host.renderGraphHeader()}
      {isRefreshing ? <AgriChartLoader /> : null}

      {renderDateRangeSlider(host, range)}

      {/* Chart area - center */}
      <div className="graff-chart-area">
        <div className="graph-svg-wrap" ref={host.graphSvgWrapRef}>
          {renderChartSvg(ctx, monthTickPoints)}
          {renderFloatingTooltip(ctx)}
        </div>
      </div>
    </div>
  );
};
