/**
 * Viewport-driven layout + theme constants for the Graff vegetation chart.
 */
import type { GraffChartPadding } from "./chart-types";

const MIN_GRAPH_SIZE = 120;
const NARROW_WIDTH = 640;
const COMPACT_WIDTH = 720;

const IPAD_MEDIA_QUERIES = [
  "(min-width: 1080px) and (max-width: 1400px) and (min-height: 780px) and (max-aspect-ratio: 3/2)",
  "(min-width: 1080px) and (max-width: 1400px) and (max-height: 910px) and (min-height: 500px)",
  "(min-width: 1024px) and (max-width: 1400px) and (min-height: 760px) and (max-height: 1100px)",
];

/** iPad-band viewport (or iPadOS Safari reporting a desktop UA). */
export function detectIpadLayout(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    (IPAD_MEDIA_QUERIES.some((query) => window.matchMedia(query).matches) ||
      // iPadOS Safari (incl. “Request Desktop Website”) often reports odd sizes
      (/iPad|Macintosh/.test(navigator.userAgent) &&
        navigator.maxTouchPoints > 1))
  );
}

export interface GraffChartLayout {
  graphWidth: number;
  graphHeight: number;
  isNarrow: boolean;
  compactChart: boolean;
  padding: GraffChartPadding;
  chartWidth: number;
  chartHeight: number;
  monthTickY: number;
  lineStrokeWidth: number;
  axisTickFont: number;
  monthTickFont: number;
}

/** Calculate SVG dimensions from live container size. */
export function computeChartLayout(
  viewportWidth: number,
  viewportHeight: number,
  isIpadLayout: boolean,
): GraffChartLayout {
  const graphWidth = Math.max(viewportWidth, MIN_GRAPH_SIZE);
  const graphHeight = Math.max(viewportHeight, MIN_GRAPH_SIZE);
  const isNarrow = graphWidth < NARROW_WIDTH;
  const compactChart = graphWidth < COMPACT_WIDTH;
  const padding = {
    top: compactChart ? 8 : 12,
    right: compactChart ? 6 : 8,
    bottom: compactChart ? 32 : 36,
    left: compactChart ? 50 : 56,
  };
  const chartWidth = graphWidth - padding.left - padding.right;
  const chartHeight = graphHeight - padding.top - padding.bottom;
  return {
    graphWidth,
    graphHeight,
    isNarrow,
    compactChart,
    padding,
    chartWidth,
    chartHeight,
    monthTickY: padding.top + chartHeight + (isNarrow ? 16 : 17),
    // Short viewports scale the SVG down — keep strokes readable on iPad band.
    // Safari often fails stroke-dash draw anim → line stays at offset 100 (invisible).
    lineStrokeWidth: isIpadLayout ? 3.8 : 2.85,
    axisTickFont: 10,
    monthTickFont: 10,
  };
}

export interface GraffChartTheme {
  themeText: string;
  themeGrid: string;
}

export function resolveChartTheme(isDarkTheme: boolean): GraffChartTheme {
  return {
    themeText: isDarkTheme ? "#e9f8ff" : "#111827",
    themeGrid: isDarkTheme
      ? "rgba(233, 248, 255, 0.28)"
      : "rgba(15, 23, 42, 0.12)",
  };
}

/** Max sampled dots per series so dense series don't look cluttered. */
export function resolveMaxVisibleDots(
  chartWidth: number,
  isIpadLayout: boolean,
): number {
  if (isIpadLayout) {
    return Math.max(8, Math.min(14, Math.floor(chartWidth / 48)));
  }
  return Math.max(18, Math.min(42, Math.floor(chartWidth / 16)));
}

export interface GraffDotStyle {
  radius: number;
  strokeWidth: number;
  outerRingWidth: number;
  outerRadius: number;
  glowRadius: number;
}

/**
 * Dot sizing. Dark: no colored outer ring — bump radius so size matches ring
 * look. iPad / short windows: slightly smaller markers.
 */
export function resolveDotStyle(
  isIpadLayout: boolean,
  isLightTheme: boolean,
  isActive: boolean,
  isHovered: boolean,
): GraffDotStyle {
  const pick = (active: number, hovered: number, base: number) =>
    isActive ? active : isHovered ? hovered : base;
  const baseRadius = isIpadLayout ? pick(5.2, 4.4, 3.5) : pick(7.6, 6.4, 5.1);
  const outerRingWidth = isLightTheme ? (isIpadLayout ? 1.2 : 1.6) : 0;
  const radius = isLightTheme
    ? baseRadius
    : baseRadius + (isIpadLayout ? 0.8 : 1.2);
  const strokeWidth = isIpadLayout ? pick(2, 1.7, 1.35) : pick(2.6, 2.2, 1.7);
  return {
    radius,
    strokeWidth,
    outerRingWidth,
    outerRadius: radius + strokeWidth / 2 + outerRingWidth / 2 + 0.4,
    glowRadius: isIpadLayout ? radius + 1.4 : radius + 2.2,
  };
}
