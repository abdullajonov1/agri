import type { PieChartDatum, PieWidgetHost } from "../pie-host";
import type { CssVarStyle } from "../../../panel-filter-detail";
import { React } from "jimu-core";
import { DataSourceComponent } from "jimu-core";
import { JimuMapViewComponent } from "jimu-arcgis";
import { TriangleAlert } from "lucide-react";
import { Button } from "jimu-ui";
import { default as AgriChartLoader } from "../../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";

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
    activeSlice,
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
  const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";

  const titleText =
    language === "en"
      ? "Crop Type"
      : language === "ru"
      ? "Тип культуры"
      : language === "uz_lat"
        ? "Ekin Turi"
        : "Экин Тури";

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
    statusIndicator = "connecting";
  else if (connectionStatus === "connected") statusIndicator = "connected";
  else if (mapLoadingStatus === "failed" || connectionStatus === "failed")
    statusIndicator = "failed";

  const showDebugInfo = false; // ✅ Disabled debug panel

  const formatAreaValue = (value: number) => {
    const safe = Number.isFinite(value) ? value : 0;
    const digits = safe >= 100 ? 0 : safe >= 10 ? 1 : 2;
    return safe.toLocaleString("ru-RU", {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    }).replace(/,/g, ".");
  };

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
        ) : error ? (
          <div className="land-category-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <p>{error}</p>
            <Button
              onClick={() => host.fetchCategoryData()}
              type="primary"
              size="sm"
            >
              Қайта уриниш
            </Button>
          </div>
        ) : showBlockingLoader ? (
          <div className="land-category-loading-container">
            <AgriChartLoader />
          </div>
        ) : showNoData ? (
          <div className="land-category-no-data">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <h3>{agriNoDataLabel(language)}</h3>
          </div>
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
              {!showRefreshLoader ? (
                (() => {
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
                })()
              ) : null}
              </div>
            </div>

            {isIpadLayout ? null : (
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
                      sliceInteractive &&
                      host.handleSliceClick(entry, index)
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
