import type { PopupWidgetHost } from "../popup-host";
import { React } from "jimu-core";
import { renderChartPanel, renderChartTrigger } from "./render-popup-parts";

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

  // Collect numeric data for chart
  const dataPoints: { label: string; value: number }[] = [];
  for (const fieldName of chartFields) {
    const raw = attrs[fieldName];
    const numVal = typeof raw === "number" ? raw : parseFloat(raw as string); // parseFloat coerces non-strings itself
    if (!isNaN(numVal)) {
      dataPoints.push({
        label: host.getFieldAlias(fieldName),
        value: numVal,
      });
    }
  }

  if (dataPoints.length === 0) return null;

  const chartLabel = chartTitle || dataPoints[0]?.label || "Grafik";
  const hoverIndex = host.state.chartHoverIndex;

  const svgWidth = 340;
  const svgHeight = 168;
  const padding = { top: 12, right: 12, bottom: 8, left: 40 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...dataPoints.map((d) => d.value), 0);
  const yMax = host.niceChartMax(maxVal);
  const scaleY = (v: number) => chartH - (v / yMax) * chartH;

  const isDark = host.state.isDarkTheme;
  const axisColor = isDark ? "rgba(255,255,255,0.55)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.14)" : "#dbeafe";
  const chartBodyBg = isDark ? "transparent" : "#ffffff";
  const highlightFill = isDark
    ? "rgba(0, 168, 232, 0.12)"
    : "rgba(0, 168, 232, 0.1)";

  const gridLines = 4;
  const gridStep = yMax / gridLines;

  const barLayout =
    chartType === "bar"
      ? (() => {
          const barGap = Math.max(6, Math.min(10, chartW / dataPoints.length / 4));
          const barW = Math.max(
            8,
            (chartW - (dataPoints.length - 1) * barGap) / dataPoints.length,
          );
          return dataPoints.map((d, i) => {
            const x = padding.left + i * (barW + barGap);
            const barH = Math.max(2, (d.value / yMax) * chartH);
            const y = padding.top + chartH - barH;
            return { ...d, i, x, y, barW, barH, centerX: x + barW / 2 };
          });
        })()
      : [];

  const linePoints =
    chartType === "line"
      ? (() => {
          const stepX =
            dataPoints.length > 1 ? chartW / (dataPoints.length - 1) : 0;
          return dataPoints.map((d, i) => ({
            ...d,
            i,
            x:
              padding.left +
              (dataPoints.length > 1 ? i * stepX : chartW / 2),
            y: padding.top + scaleY(d.value),
          }));
        })()
      : [];

  const hoverPoint =
    hoverIndex != null
      ? chartType === "bar"
        ? barLayout[hoverIndex]
        : linePoints[hoverIndex]
      : null;

  const tooltipLeftPct = hoverPoint
    ? Math.max(8, Math.min(82, (hoverPoint.x / svgWidth) * 100))
    : 0;
  const tooltipTopPct = hoverPoint
    ? Math.max(6, Math.min(58, (hoverPoint.y / svgHeight) * 100 - 18))
    : 0;

  const chartSvg = (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="agri3-chart-svg"
      style={{ background: chartBodyBg }}
    >
      <rect
        x={padding.left}
        y={padding.top}
        width={chartW}
        height={chartH}
        fill={isDark ? "rgba(255,255,255,0.02)" : "#ffffff"}
        rx={6}
      />

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = gridStep * i;
        const y = padding.top + scaleY(val);
        return (
          <g key={`grid-${i}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
              strokeDasharray="3 5"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              fill={axisColor}
              fontSize={10}
              textAnchor="end"
            >
              {host.formatChartTick(val)}
            </text>
          </g>
        );
      })}

      {chartType === "bar" &&
        barLayout.map((bar) => (
          <g key={`bar-${bar.i}`}>
            {hoverIndex === bar.i && (
              <rect
                x={bar.x - 3}
                y={padding.top}
                width={bar.barW + 6}
                height={chartH}
                fill={highlightFill}
                rx={5}
              />
            )}
            <path
              d={host.buildRoundedBarPath(bar.x, bar.y, bar.barW, bar.barH, 5)}
              fill={chartColor}
              opacity={hoverIndex == null || hoverIndex === bar.i ? 1 : 0.45}
              className="agri3-chart-bar"
              onMouseEnter={() => { host.setChartHover(bar.i); }}
            />
            <rect
              x={bar.x}
              y={padding.top}
              width={bar.barW}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => { host.setChartHover(bar.i); }}
            />
          </g>
        ))}

      {chartType === "line" && (
        <g>
          {hoverIndex != null && linePoints[hoverIndex] && (
            <line
              x1={linePoints[hoverIndex].x}
              y1={padding.top}
              x2={linePoints[hoverIndex].x}
              y2={padding.top + chartH}
              stroke={chartColor}
              strokeWidth={1.5}
              opacity={0.35}
            />
          )}
          <path
            d={host.buildSmoothLinePath(linePoints)}
            fill="none"
            stroke={chartColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {linePoints.map((p) => (
            <g key={`pt-${p.i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === p.i ? 5.5 : 4}
                fill={isDark ? "#0b1a30" : "#ffffff"}
                stroke={chartColor}
                strokeWidth={hoverIndex === p.i ? 2.5 : 2}
                className="agri3-chart-point"
                onMouseEnter={() => { host.setChartHover(p.i); }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="transparent"
                onMouseEnter={() => { host.setChartHover(p.i); }}
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );

  const chartBody = (
    <div
      className="agri3-chart-body"
      onMouseLeave={host.clearChartHover}
    >
      {hoverPoint && (
        <div
          className="agri3-chart-tooltip"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
          }}
        >
          <div className="agri3-chart-tooltip-label">{hoverPoint.label}</div>
          <div className="agri3-chart-tooltip-value">
            {host.formatChartTooltipValue(hoverPoint.value)}
          </div>
        </div>
      )}
      {chartSvg}
    </div>
  );

  if (!chartExpanded) {
    return renderChartTrigger(host, chartType, chartLabel);
  }

  return renderChartPanel(host, chartType, chartLabel, pinned, chartBody);
};
