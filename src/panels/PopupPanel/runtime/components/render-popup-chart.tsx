import type { PopupWidgetHost } from "../popup-host";
import { React } from "jimu-core";
import { renderChartPanel, renderChartTrigger } from "./render-popup-parts";
import {
  CHART_H,
  CHART_W,
  PADDING,
  SVG_HEIGHT,
  SVG_WIDTH,
  collectDataPoints,
  computeBarLayout,
  computeLinePoints,
  computeScaleY,
  getChartPalette,
  renderBars,
  renderChartTooltip,
  renderGrid,
  renderLine,
} from "./render-popup-chart-parts";

export const renderChart = (host: PopupWidgetHost) => {
  const config = host.props.config;
  if (!config?.chartEnabled) return null;

  const chartFields = config.chartFields || [];
  const chartType = config.chartType || "bar";
  const chartTitle = config.chartTitle || "";
  const chartColor = config.chartColor || "#00a8e8";
  const attrs = host.state.selectedAttrs;
  const pinned = host.state.pinToCorner;
  const chartExpanded = pinned || host.state.chartExpanded;

  if (!attrs || chartFields.length === 0) return null;

  const dataPoints = collectDataPoints(host, attrs, chartFields);
  if (dataPoints.length === 0) return null;

  const chartLabel = chartTitle || dataPoints[0]?.label || "Grafik";
  if (!chartExpanded) {
    return renderChartTrigger(host, chartType, chartLabel);
  }

  const hoverIndex = host.state.chartHoverIndex;
  const maxVal = Math.max(...dataPoints.map((d) => d.value), 0);
  const yMax = host.niceChartMax(maxVal);
  const scaleY = computeScaleY(yMax);
  const palette = getChartPalette(host.state.isDarkTheme);

  const barLayout = chartType === "bar" ? computeBarLayout(dataPoints, yMax) : [];
  const linePoints = chartType === "line" ? computeLinePoints(dataPoints, scaleY) : [];
  const hoverPoint =
    hoverIndex != null
      ? chartType === "bar"
        ? barLayout[hoverIndex]
        : linePoints[hoverIndex]
      : null;

  const chartSvg = (
    <svg
      width="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="agri3-chart-svg"
      style={{ background: palette.chartBodyBg }}
    >
      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={CHART_W}
        height={CHART_H}
        fill={palette.plotFill}
        rx={6}
      />
      {renderGrid(host, yMax, scaleY, palette)}
      {chartType === "bar" &&
        renderBars(host, barLayout, hoverIndex, chartColor, palette)}
      {chartType === "line" &&
        renderLine(host, linePoints, hoverIndex, chartColor, palette)}
    </svg>
  );

  const chartBody = (
    <div className="agri3-chart-body" onMouseLeave={host.clearChartHover}>
      {renderChartTooltip(host, hoverPoint)}
      {chartSvg}
    </div>
  );

  return renderChartPanel(host, chartType, chartLabel, pinned, chartBody);
};
