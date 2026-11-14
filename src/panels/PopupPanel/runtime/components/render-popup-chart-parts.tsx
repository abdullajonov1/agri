import type { PopupWidgetHost } from "../popup-host";
import { React } from "jimu-core";

export interface DataPoint {
  label: string;
  value: number;
}

export interface ChartPoint extends DataPoint {
  i: number;
  x: number;
  y: number;
}

export interface BarPoint extends ChartPoint {
  barW: number;
  barH: number;
  centerX: number;
}

export const SVG_WIDTH = 340;
export const SVG_HEIGHT = 168;
export const PADDING = { top: 12, right: 12, bottom: 8, left: 40 };
export const CHART_W = SVG_WIDTH - PADDING.left - PADDING.right;
export const CHART_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;
export const GRID_LINES = 4;

export interface ChartPalette {
  axisColor: string;
  gridColor: string;
  chartBodyBg: string;
  highlightFill: string;
  plotFill: string;
  pointFill: string;
}

export const getChartPalette = (isDark: boolean): ChartPalette => ({
  axisColor: isDark ? "rgba(255,255,255,0.55)" : "#94a3b8",
  gridColor: isDark ? "rgba(255,255,255,0.14)" : "#dbeafe",
  chartBodyBg: isDark ? "transparent" : "#ffffff",
  highlightFill: isDark ? "rgba(0, 168, 232, 0.12)" : "rgba(0, 168, 232, 0.1)",
  plotFill: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
  pointFill: isDark ? "#0b1a30" : "#ffffff",
});

export const collectDataPoints = (
  host: PopupWidgetHost,
  attrs: Record<string, unknown>,
  chartFields: string[],
): DataPoint[] => {
  const dataPoints: DataPoint[] = [];
  for (const fieldName of chartFields) {
    const raw = attrs[fieldName];
    const numVal = typeof raw === "number" ? raw : parseFloat(raw as string); // parseFloat coerces non-strings itself
    if (!isNaN(numVal)) {
      dataPoints.push({ label: host.getFieldAlias(fieldName), value: numVal });
    }
  }
  return dataPoints;
};

export const computeScaleY = (yMax: number) => (v: number): number =>
  CHART_H - (v / yMax) * CHART_H;

export const computeBarLayout = (dataPoints: DataPoint[], yMax: number): BarPoint[] => {
  const barGap = Math.max(6, Math.min(10, CHART_W / dataPoints.length / 4));
  const barW = Math.max(
    8,
    (CHART_W - (dataPoints.length - 1) * barGap) / dataPoints.length,
  );
  return dataPoints.map((d, i) => {
    const x = PADDING.left + i * (barW + barGap);
    const barH = Math.max(2, (d.value / yMax) * CHART_H);
    const y = PADDING.top + CHART_H - barH;
    return { ...d, i, x, y, barW, barH, centerX: x + barW / 2 };
  });
};

export const computeLinePoints = (
  dataPoints: DataPoint[],
  scaleY: (v: number) => number,
): ChartPoint[] => {
  const stepX = dataPoints.length > 1 ? CHART_W / (dataPoints.length - 1) : 0;
  return dataPoints.map((d, i) => ({
    ...d,
    i,
    x: PADDING.left + (dataPoints.length > 1 ? i * stepX : CHART_W / 2),
    y: PADDING.top + scaleY(d.value),
  }));
};

export const computeTooltipPosition = (
  hoverPoint: ChartPoint,
): { leftPct: number; topPct: number } => ({
  leftPct: Math.max(8, Math.min(82, (hoverPoint.x / SVG_WIDTH) * 100)),
  topPct: Math.max(6, Math.min(58, (hoverPoint.y / SVG_HEIGHT) * 100 - 18)),
});

export const renderGrid = (
  host: PopupWidgetHost,
  yMax: number,
  scaleY: (v: number) => number,
  palette: ChartPalette,
) => {
  const gridStep = yMax / GRID_LINES;
  return Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
    const val = gridStep * i;
    const y = PADDING.top + scaleY(val);
    return (
      <g key={`grid-${i}`}>
        <line
          x1={PADDING.left}
          y1={y}
          x2={SVG_WIDTH - PADDING.right}
          y2={y}
          stroke={palette.gridColor}
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        <text
          x={PADDING.left - 8}
          y={y + 4}
          fill={palette.axisColor}
          fontSize={10}
          textAnchor="end"
        >
          {host.formatChartTick(val)}
        </text>
      </g>
    );
  });
};

export const renderBars = (
  host: PopupWidgetHost,
  barLayout: BarPoint[],
  hoverIndex: number | null,
  chartColor: string,
  palette: ChartPalette,
) =>
  barLayout.map((bar) => (
    <g key={`bar-${bar.i}`}>
      {hoverIndex === bar.i && (
        <rect
          x={bar.x - 3}
          y={PADDING.top}
          width={bar.barW + 6}
          height={CHART_H}
          fill={palette.highlightFill}
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
        y={PADDING.top}
        width={bar.barW}
        height={CHART_H}
        fill="transparent"
        onMouseEnter={() => { host.setChartHover(bar.i); }}
      />
    </g>
  ));

export const renderLine = (
  host: PopupWidgetHost,
  linePoints: ChartPoint[],
  hoverIndex: number | null,
  chartColor: string,
  palette: ChartPalette,
) => (
  <g>
    {hoverIndex != null && linePoints[hoverIndex] && (
      <line
        x1={linePoints[hoverIndex].x}
        y1={PADDING.top}
        x2={linePoints[hoverIndex].x}
        y2={PADDING.top + CHART_H}
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
          fill={palette.pointFill}
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
);

export const renderChartTooltip = (
  host: PopupWidgetHost,
  hoverPoint: ChartPoint | null | undefined,
) => {
  if (!hoverPoint) return null;
  const { leftPct, topPct } = computeTooltipPosition(hoverPoint);
  return (
    <div
      className="agri3-chart-tooltip"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <div className="agri3-chart-tooltip-label">{hoverPoint.label}</div>
      <div className="agri3-chart-tooltip-value">
        {host.formatChartTooltipValue(hoverPoint.value)}
      </div>
    </div>
  );
};
