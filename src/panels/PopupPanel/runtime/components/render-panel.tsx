import type { PopupWidgetHost } from "../popup-host";
import { LineChart, BarChart3, Sprout, CalendarDays, Inbox } from "lucide-react";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { React } from "jimu-core";
import { renderChart } from "./render-popup-chart";
import { renderPopup } from "./render-popup";
import { AgriHiddenConnectors } from "../../../../gis/AgriHiddenConnectors";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "../popup-constants";

export const renderChartIcon = (host: PopupWidgetHost, type: "bar" | "line" = "bar"): JSX.Element =>
  type === "line" ? (
      <LineChart className="agri3-chart-icon" strokeWidth={2} aria-hidden="true" />
    ) : (
      <BarChart3 className="agri3-chart-icon" strokeWidth={2} aria-hidden="true" />
    );

export const renderLatestIndices = (host: PopupWidgetHost) => {
  const { loadingLatestIndices, latestIndexDate, latestIndexValues } =
    host.state;

  const hasValues = !!latestIndexValues;
  const showBlockingLoader = loadingLatestIndices && !hasValues;
  const showRefreshLoader = loadingLatestIndices && hasValues;

  return (
    <div className="agri3-field-list agri3-indices-list">
      <div className="agri3-field-row agri3-indices-header-row">
        <span className="agri3-field-label agri3-indices-title">
          <Sprout size={14} strokeWidth={2.2} aria-hidden="true" />
          {host.tr("indices.title")}
        </span>
        {latestIndexDate && !loadingLatestIndices && (
          <span className="agri3-field-value agri3-indices-date">
            <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
            {latestIndexDate}
          </span>
        )}
      </div>
      {showBlockingLoader ? (
        <div className="agri3-indices-loading-container">
          <AgriChartLoader label={host.tr("indices.loading")} />
        </div>
      ) : hasValues ? (
        <div
          className={`agri3-indices-body${
            showRefreshLoader ? " agri3-indices-body--loading" : ""
          }`}
        >
          {showRefreshLoader ? (
            <AgriChartLoader label={host.tr("indices.loading")} />
          ) : null}
          {popupVegIndexFields.filter(
            (f) => latestIndexValues[f] != null,
          ).map((f) => (
            <div
              className={`agri3-field-row agri3-index-row agri3-index-row--${f}`}
              key={f}
            >
              <span
                className={`agri3-field-label agri3-index-label agri3-index-label--${f}`}
              >
                <span className="agri3-index-dot" aria-hidden="true" />
                {f.toUpperCase()}
              </span>
              <span className="agri3-field-value">
                {latestIndexValues[f].toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="agri3-status-indicator agri3-status-waiting">
          <Inbox className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
          {host.tr("indices.none")}
        </div>
      )}
    </div>
  );
};


export { renderChart, renderPopup };

export function render(host: PopupWidgetHost) {
  const { useMapWidgetIds, useDataSources } = host.props;
  const themeClass = host.state.isDarkTheme
    ? "agri3-theme-dark"
    : "agri3-theme-light";

  return (
    <div className={`agri3-attr-card ${themeClass}`}>
      {host.renderPopup()}

      <AgriHiddenConnectors
        useDataSources={useDataSources}
        useMapWidgetIds={useMapWidgetIds}
        onDataSourceCreated={host.onDataSourceCreated}
        onActiveViewChange={host.onActiveViewChange}
      />

      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          width: "8px",
          height: "8px",
          background: host.state.featureLayers?.length
            ? "#10b981"
            : "#94a3b8",
          borderRadius: "50%",
          opacity: 0.6,
          transition: "all 0.3s ease",
          pointerEvents: "none",
        }}
        title={
          host.state.featureLayers?.length
            ? host.tr("status.ready")
            : host.tr("status.loading")
        }
      />
    </div>
  );
}
