import type { PieChartDatum, PieWidgetHost } from "../pie-host";
import { React, DataSourceComponent } from "jimu-core";

import { JimuMapViewComponent } from "jimu-arcgis";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { areaUnitLabel } from "../../../../shared/agri-area-unit";
import { pickLabel } from "../../../../shared/agri-i18n";
import { CROP_TYPE_TITLE } from "../../../panel-messages";
import {
  renderBlockingLoader,
  renderFetchError,
  renderLegend,
  renderMapFailure,
  renderNoData,
  renderPieCenter,
} from "./render-panel-parts";

export const renderRadarPieChart = (host: PieWidgetHost, _chartData: PieChartDatum[], _containerWidth: number = 300, _containerHeight: number = 300): JSX.Element => {
  return (
    <div
      ref={host._pieChartRef}
      className="land-category-echart"
    />
  );
};

export function render(host: PieWidgetHost) {
  const {
    loading,
    error,
    categoryData,
    selectedCategories,
    mapLoadingStatus,
    connectionStatus,
    debugInfo,
    yil,
    viloyat,
    lockedViloyat,
    language,
    isDarkTheme,
  } = host.state;

  const { categories } = categoryData;

  const sortedCategories = [...categories].sort((a, b) => b.value - a.value);
  // Display every crop type returned by the grouped service query. The
  // legend is scrollable, so a long list does not overflow the widget.
  const visibleCategories = sortedCategories;

  const themeClass = isDarkTheme ? "dark-theme" : "light-theme";
  const areaUnit = areaUnitLabel(language);

  const titleText =
    pickLabel(CROP_TYPE_TITLE, language);

  const chartData = visibleCategories.map((category) => ({
    name: host.getCategoryDisplayName(category.key, language),
    rawKey: category.key,
    value: category.value,
    percentage: category.percentage,
  }));

  let statusIndicator:
    | "idle"
    | "loading"
    | "connecting"
    | "connected"
    | "failed" = "idle";
  if (mapLoadingStatus === "loading") statusIndicator = "loading";
  else if (mapLoadingStatus === "loaded" && connectionStatus === "connecting")
    { statusIndicator = "connecting"; }
  else if (connectionStatus === "connected") statusIndicator = "connected";
  else if (mapLoadingStatus === "failed" || connectionStatus === "failed")
    { statusIndicator = "failed"; }

  const showDebugInfo = false; // ✅ Disabled debug panel

  const sliceInteractive = !!(lockedViloyat || viloyat || "").trim();
  const isIpadLayout = host.isIpadLayout();
  const hasChartData = categories.length > 0;
  const awaitingFirstData = !host._hasCompletedFetch;

  // Loader until first fetch finishes — never flash "no data" during connect/refresh.
  const showBlockingLoader =
    !yil ||
    mapLoadingStatus === "loading" ||
    connectionStatus === "idle" ||
    connectionStatus === "connecting" ||
    (connectionStatus === "connected" &&
      !hasChartData &&
      (loading || awaitingFirstData));

  // Overlay loader on any subsequent data change (region, year, filters…).
  const showRefreshLoader =
    connectionStatus === "connected" && loading && hasChartData;

  // Empty state only after a real fetch returned zero categories.
  const showNoData =
    !!yil &&
    connectionStatus === "connected" &&
    !loading &&
    host._hasCompletedFetch &&
    !hasChartData;

  return (
    <div
      className={`land-category-card ${themeClass}${
        isIpadLayout ? " land-category-card--ipad" : ""
      }`}
    >
      {showDebugInfo && (
        <div
          className="debug-info"
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            fontSize: "10px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "2px 5px",
            borderRadius: "3px",
            maxWidth: "200px",
            zIndex: 1000,
          }}
        >
          <div>Status: {statusIndicator}</div>
          <div>Map: {mapLoadingStatus}</div>
          <div>Connection: {connectionStatus}</div>
          <div>Categories: {categories.length}</div>
          <div>Debug: {debugInfo}</div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {host.props.useDataSources?.length > 0 && (
          <DataSourceComponent
            useDataSource={host.props.useDataSources[0]}
            onDataSourceCreated={host.onDataSourceCreated}
            onDataSourceInfoChange={host.onDataSourceInfoChange}
          />
        )}
        {host.props.useMapWidgetIds?.length > 0 && (
          <JimuMapViewComponent
            useMapWidgetId={host.props.useMapWidgetIds[0]}
            onActiveViewChange={host.onActiveViewChange}
          />
        )}
      </div>

      <div className="land-category-content">
        <div className="land-category-header">
          <div className="land-category-title-wrap">
            <div className="land-category-title">{titleText}</div>
          </div>
        </div>

        {mapLoadingStatus === "failed" && connectionStatus !== "connected" ? (
          renderMapFailure(host, error)
        ) : error ? (
          renderFetchError(host, error)
        ) : showBlockingLoader ? (
          renderBlockingLoader()
        ) : showNoData ? (
          renderNoData(language)
        ) : (
          <div
            className={`land-category-main-content${
              isIpadLayout ? " land-category-main-content--no-legend" : ""
            }`}
          >
            {showRefreshLoader ? <AgriChartLoader /> : null}
            <div
              className={`land-category-chart-container${
                showRefreshLoader ? " land-category-chart-container--loading" : ""
              }`}
            >
              <div className="land-category-echart-stage">
              {host.renderRadarPieChart(chartData, 400, 400)}
              {!showRefreshLoader
                ? renderPieCenter(host, chartData, selectedCategories)
                : null}
              </div>
            </div>

            {isIpadLayout
              ? null
              : renderLegend({
                  host,
                  chartData,
                  selectedCategories,
                  sliceInteractive,
                  showRefreshLoader,
                  areaUnit,
                })}
          </div>
        )}
      </div>
    </div>
  );
}
