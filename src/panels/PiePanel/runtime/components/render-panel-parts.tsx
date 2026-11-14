import type { PieChartDatum, PieWidgetHost } from "../pie-host";
import type { CssVarStyle } from "../../../panel-filter-detail";
import { React } from "jimu-core";
import { TriangleAlert } from "lucide-react";
import { Button } from "jimu-ui";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";

export const formatAreaValue = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const digits = safe >= 100 ? 0 : safe >= 10 ? 1 : 2;
  return safe.toLocaleString("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).replace(/,/g, ".");
};

export const renderMapFailure = (host: PieWidgetHost, error: string | null): JSX.Element => (
  <div className="land-category-error">
    <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
    <p>
      {error || "Харитага уланишда хатолик. Қайта уриниб кўринг."}
    </p>
    <Button
      onClick={host.retryMapConnection}
      type="primary"
      size="sm"
    >
      Қайта уланиш
    </Button>
  </div>
);

export const renderFetchError = (host: PieWidgetHost, error: string): JSX.Element => (
  <div className="land-category-error">
    <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
    <p>{error}</p>
    <Button
      onClick={() => { host.fetchCategoryData(); }}
      type="primary"
      size="sm"
    >
      Қайта уриниш
    </Button>
  </div>
);

export const renderBlockingLoader = (): JSX.Element => (
  <div className="land-category-loading-container">
    <AgriChartLoader />
  </div>
);

export const renderNoData = (language: Parameters<typeof agriNoDataLabel>[0]): JSX.Element => (
  <div className="land-category-no-data">
    <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
    <h3>{agriNoDataLabel(language)}</h3>
  </div>
);

export const renderPieCenter = (
  host: PieWidgetHost,
  chartData: PieChartDatum[],
  selectedCategories: string[],
): JSX.Element => {
  const center = host.getPieCenterContent(chartData);
  const isMultiLabel =
    selectedCategories.length > 1 &&
    center.label !== host.getCenterAllLabel();
  return (
    <div className="land-category-pie-center" aria-hidden="true">
      {center.showPercent ? (
        <p className="land-category-pie-center-value">
          {host.formatCenterPercent(center.percent)}
        </p>
      ) : null}
      <p className="land-category-pie-center-area">
        {host.formatCenterArea(center.area)}
      </p>
      <p
        key={center.label}
        title={center.label}
        className={`land-category-pie-center-label land-category-pie-center-label--muted land-category-pie-center-line--enter${
          isMultiLabel
            ? " land-category-pie-center-label--multi"
            : ""
        }`}
      >
        {center.label}
      </p>
    </div>
  );
};

interface LegendArgs {
  host: PieWidgetHost;
  chartData: PieChartDatum[];
  selectedCategories: string[];
  sliceInteractive: boolean;
  showRefreshLoader: boolean;
  areaUnit: string;
}

export const renderLegend = ({
  host,
  chartData,
  selectedCategories,
  sliceInteractive,
  showRefreshLoader,
  areaUnit,
}: LegendArgs): JSX.Element => (
  <div
    className="category-legend"
    style={{
      // Always allow scroll; only clicks are gated by sliceInteractive.
      pointerEvents: showRefreshLoader ? "none" : "auto",
      opacity: showRefreshLoader ? 0.35 : 1,
    }}
    aria-disabled={showRefreshLoader}
  >
    <div className="category-legend-inner">
    {chartData.map((entry, index) => {
      const accentColor = host.getCropColor(
        entry.rawKey || entry.name,
        index,
      );

      return (
        <button
          type="button"
          key={entry.rawKey || entry.name}
          className={`legend-item ${selectedCategories.some((selected) => host.normalizeName(selected) === host.normalizeName(entry.rawKey || entry.name)) ? "legend-item-selected" : ""}`}
          onClick={() =>
            { sliceInteractive &&
            host.handleSliceClick(entry, index); }
          }
          disabled={!sliceInteractive}
          style={
            {
              cursor: sliceInteractive ? "pointer" : "default",
              pointerEvents: sliceInteractive ? "auto" : "none",
              "--legend-accent": accentColor,
            } as React.CSSProperties & CssVarStyle
          }
        >
          <div
            className="legend-color"
            style={{ backgroundColor: accentColor }}
          />
          <span className="legend-label" title={entry.name}>
            {entry.name}
          </span>
          <span className="legend-value">
            <span className="legend-area-value">
              {`${formatAreaValue(Number(entry.value) || 0)} ${areaUnit}`}
            </span>
          </span>
        </button>
      );
    })}
    </div>
  </div>
);
