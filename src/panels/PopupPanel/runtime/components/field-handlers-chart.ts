import type { PopupWidgetHost } from "../popup-host";
import { niceChartMax as niceChartMaxShared, formatChartTick as formatChartTickShared, formatChartTooltipValue as formatChartTooltipValueShared } from "../popup-format-helpers";

export const toggleChartExpanded = (host: PopupWidgetHost): void => {
  host.setState((prev) => ({ chartExpanded: !prev.chartExpanded }));
};

export const clearChartHover = (host: PopupWidgetHost): void => {
  if (host.state.chartHoverIndex != null) {
    host.setState({ chartHoverIndex: null });
  }
};

export const setChartHover = (host: PopupWidgetHost, index: number): void => {
  if (host.state.chartHoverIndex !== index) {
    host.setState({ chartHoverIndex: index });
  }
};

export function niceChartMax(host: PopupWidgetHost, value: number): number {
  return niceChartMaxShared(value);
}

export function formatChartTick(host: PopupWidgetHost, value: number): string {
  return formatChartTickShared(value);
}

export function formatChartTooltipValue(host: PopupWidgetHost, value: number): string {
  return formatChartTooltipValueShared(value);
}

export function buildSmoothLinePath(host: PopupWidgetHost, points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function buildRoundedBarPath(host: PopupWidgetHost, x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height);
  const bottom = y + height;
  return [
    `M ${x} ${bottom}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${bottom}`,
    "Z",
  ].join(" ");
}
