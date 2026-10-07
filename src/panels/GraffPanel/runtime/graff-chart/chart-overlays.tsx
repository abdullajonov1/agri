/**
 * Non-SVG chart chrome: date range slider and the floating hover tooltip
 * (portaled to document.body).
 */
import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { formatGraffRangeDate } from "../../../../data/agri-graff-date";
import type { GraffChartDateRange } from "./chart-geometry";
import { graffChartMaxLabel, graffChartMinLabel } from "./chart-labels";
import type { GraffChartRenderCtx } from "./chart-render-ctx";
import type { GraffGraphHost } from "./chart-types";

const TOOLTIP_BOX_WIDTH = 156;
const TOOLTIP_BOX_HEIGHT = 92;
const TOOLTIP_EDGE_GAP = 8;
const DEFAULT_INDICATOR_COLOR = "#fbbf24";

export const renderDateRangeSlider = (
  host: GraffGraphHost,
  range: GraffChartDateRange<unknown>,
) => {
  const { lastRangeIndex, effectiveRangeStart, effectiveRangeEnd } = range;
  return (
    <div className="graff-date-range" aria-label="Chart date range">
      <div
        className="graff-date-range-track"
        style={
          {
            '--range-start': `${range.rangeStartPercent}%`,
            '--range-end': `${range.rangeEndPercent}%`,
          } as React.CSSProperties
        }
      >
        <input
          className="graff-date-range-input graff-date-range-input-start"
          type="range"
          min={0}
          max={lastRangeIndex}
          step={1}
          value={effectiveRangeStart}
          disabled={lastRangeIndex < 1}
          aria-label="Start date"
          onChange={(event) => {
            const next = Math.min(
              Number(event.currentTarget.value),
              effectiveRangeEnd,
            );
            host.setState({ dateRangeStartIndex: next, chartTooltip: null });
          }}
        />
        <input
          className="graff-date-range-input graff-date-range-input-end"
          type="range"
          min={0}
          max={lastRangeIndex}
          step={1}
          value={effectiveRangeEnd}
          disabled={lastRangeIndex < 1}
          aria-label="End date"
          onChange={(event) => {
            const next = Math.max(
              Number(event.currentTarget.value),
              effectiveRangeStart,
            );
            host.setState({ dateRangeEndIndex: next, chartTooltip: null });
          }}
        />
      </div>
      <div className="graff-date-range-labels">
        <span>{formatGraffRangeDate(range.rangeStartDate)}</span>
        <span>{formatGraffRangeDate(range.rangeEndDate)}</span>
      </div>
    </div>
  );
};

type FloatingTooltipModel = {
  left: number;
  top: number;
  minStr: string;
  maxStr: string;
  valStr: string;
  dateStr: string;
  indicatorColor: string;
  key: string;
};

const buildFloatingTooltip = (
  ctx: GraffChartRenderCtx,
): FloatingTooltipModel | null => {
  const { chartTooltip, host, language } = ctx;
  if (!chartTooltip) return null;
  const pt = chartTooltip.point;
  const lineX = ctx.scales.xScale(pt.date, pt.sourceIndex);
  const wrapRect = host.graphSvgWrapRef.current?.getBoundingClientRect();
  if (!wrapRect) return null;

  let left = wrapRect.left + lineX - TOOLTIP_BOX_WIDTH / 2;
  left = Math.max(
    TOOLTIP_EDGE_GAP,
    Math.min(left, window.innerWidth - TOOLTIP_BOX_WIDTH - TOOLTIP_EDGE_GAP),
  );
  const top = Math.max(
    TOOLTIP_EDGE_GAP,
    wrapRect.top - TOOLTIP_BOX_HEIGHT - 10,
  );
  const dateLocale = language === "ru" ? "ru-RU" : "en-GB";
  return {
    left,
    top,
    minStr: pt.min != null ? pt.min.toFixed(4) : "—",
    maxStr: pt.max != null ? pt.max.toFixed(4) : "—",
    valStr: pt.value.toFixed(4),
    dateStr: pt.date.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    indicatorColor:
      ctx.indexColorMap[chartTooltip.indexKey] || DEFAULT_INDICATOR_COLOR,
    key: chartTooltip.indexKey,
  };
};

const renderTooltipRow = (label: React.ReactNode, value: string) => (
  <div className="graff-chart-tooltip__row">
    <span className="graff-chart-tooltip__label">{label}</span>
    <span className="graff-chart-tooltip__value">{value}</span>
  </div>
);

export const renderFloatingTooltip = (ctx: GraffChartRenderCtx) => {
  const tooltip = buildFloatingTooltip(ctx);
  if (!tooltip) return null;
  return ReactDOM.createPortal(
    <div
      className={`graff-chart-tooltip${
        ctx.host.state.isDarkTheme ? "" : " graff-chart-tooltip--light"
      }`}
      style={{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }}
    >
      <div className="graff-chart-tooltip__title">{tooltip.dateStr}</div>
      <div className="graff-chart-tooltip__content">
        {renderTooltipRow(graffChartMaxLabel(ctx.language), tooltip.maxStr)}
        {renderTooltipRow(
          <>
            <span
              className="graff-chart-tooltip__dot"
              style={{ background: tooltip.indicatorColor }}
            />
            {tooltip.key.toUpperCase()}
          </>,
          tooltip.valStr,
        )}
        {renderTooltipRow(graffChartMinLabel(ctx.language), tooltip.minStr)}
      </div>
    </div>,
    document.body,
  );
};
