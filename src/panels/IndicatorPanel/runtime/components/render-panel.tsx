import type { IndicatorWidgetHost } from "../indicator-host";
import { React } from "jimu-core";
import { DataSourceComponent } from "jimu-core";
import { JimuMapViewComponent } from "jimu-arcgis";
import { default as AgriDashboardSpinner } from "../../../../shared/AgriDashboardSpinner";
import { default as AgriAnimatedCount } from "../../../../shared/AgriAnimatedCount";

export function render(host: IndicatorWidgetHost) {
  const {
    vegetationArea,
    loading,
    error,
    connectionStatus,
    lastUpdate,
    selectedYil,
    selectedViloyat,
    selectedTuman,
    selectedYerToifas,
    groupResults,
    language,
  } = host.state;

  const { config, useDataSources, useMapWidgetIds } = host.props;
  const useApiDataSource = !!config?.useApiDataSource;

  const defaultStatLabel =
    language === "en"
      ? "Crop area"
      : language === "ru"
        ? "Площадь посевов"
      : language === "uz_lat"
        ? "Ekin maydonlari"
        : "Экин майдонлари";

  const configuredLabel = String(config?.label || "").trim();
  const usesDefaultLabel =
    !configuredLabel ||
    ["Ekin maydonlari", "Площадь посевов", "Экин майдонлари", "Crop area"].includes(
      configuredLabel,
    );
  const label = usesDefaultLabel ? defaultStatLabel : configuredLabel;

  const defaultUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
  const configuredUnit = String(config?.unitLabel || "").trim();
  const usesDefaultUnit =
    !configuredUnit || ["ga", "га"].includes(configuredUnit.toLowerCase());
  const unitLabel = usesDefaultUnit ? defaultUnit : configuredUnit;

  const groupByField = (config?.groupByField || "").trim();
  const isGrouped = !!groupByField;
  const statOp = (config?.statOperation || (isGrouped ? "count" : "sum")) as
    | "count"
    | "sum"
    | "avg"
    | "min"
    | "max"
    | "first";
  const isCountMode = isGrouped && statOp === "count";
  const effectiveUnit = isCountMode ? "" : unitLabel || "";

  const resolveCategoryLabel = (
    v: string | number | null | undefined,
  ): string => {
    if (v == null) return host.labelNoValue();
    if (
      (config?.categoryMode || "AUTO") === "ENUM" &&
      Array.isArray(config?.enumCategories)
    ) {
      const hit = config.enumCategories.find(
        (c: { label: string; value: string | number | null }) =>
          (c.value == null && v == null) || String(c.value) === String(v),
      );
      if (hit?.label) return hit.label;
    }
    return String(v);
  };

  const dVal = config?.displayGroupValue;
  const bucketCaption = isGrouped
    ? dVal === undefined
      ? language === "en"
        ? `Total (${groupByField})`
        : language === "ru"
        ? `Итого по полю ${groupByField}`
        : language === "uz_lat"
          ? `Jami (${groupByField})`
          : `Жами (${groupByField})`
      : `${groupByField} = ${resolveCategoryLabel(dVal)}`
    : null;

  const isInitializing =
    !useApiDataSource &&
    (connectionStatus === "connecting" || connectionStatus === "idle");

  const customStyles = host.getCustomStyles();

  const themeClass = host.state.isDarkTheme ? "dark-theme" : "light-theme";

  const { widgetSize } = host.state;

  // Show republic-wide data when no viloyat is selected (removed hideUntilViloyat gate).
  // The indicator now renders its aggregate value for the whole country when only yil is set.

  const mapOverlayMode = !!config?.mapOverlayMode;
  // One continuous spinner until the first aggregate arrives. Do not drop
  // the loader while waiting for year/connect (that caused spinner → "-" →
  // spinner → value). Soft refreshes keep the previous number visible.
  const waitingForYear = !(selectedYil || "").trim();
  const showBlockingLoader =
    !error &&
    vegetationArea == null &&
    (isInitializing || loading || waitingForYear);

  return (
    <div
      ref={host._containerRef}
      className={`vegetation-stats-widget ${themeClass}${mapOverlayMode ? " map-overlay-mode" : ""}`}
      data-ind-size={widgetSize}
      style={customStyles.container}
    >
      {!useApiDataSource && useDataSources && useDataSources.length > 0 && (
        <DataSourceComponent
          useDataSource={useDataSources[0]}
          onDataSourceCreated={host.onDataSourceCreated}
          onDataSourceInfoChange={host.onDataSourceInfoChange}
        />
      )}

      {!useApiDataSource && useMapWidgetIds?.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={host.onActiveViewChange}
        />
      )}

      {/* Body */}
      {showBlockingLoader ? (
        <div className="loading-indicator">
          <AgriDashboardSpinner compact size={40} />
        </div>
      ) : error && vegetationArea == null ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{host.translateKnownError(String(error || ""))}</p>
          {!useApiDataSource && connectionStatus === "failed" && (
            <button
              className="retry-button"
              onClick={host.retryMapConnection}
            >
              {language === "en"
                ? "Reconnect"
                : language === "ru"
                ? "Повторить подключение"
                : language === "uz_lat"
                  ? "Qayta ulanish"
                  : "Қайта уланиш"}
            </button>
          )}
        </div>
      ) : (
        <div className="widget-content">
          <div className="stat-main">
            <div
              className="stat-label"
              style={
                Object.keys(customStyles.statLabel).length
                  ? customStyles.statLabel
                  : undefined
              }
            >
              {label}
            </div>

            <div
              className="stat-value"
              style={
                Object.keys(customStyles.statValue).length
                  ? customStyles.statValue
                  : undefined
              }
            >
              <AgriAnimatedCount
                value={vegetationArea}
                emptyFallback="-"
              />
              {effectiveUnit && <span className="unit">{effectiveUnit}</span>}
            </div>

            {isGrouped && (
              <div className="group-caption" title={bucketCaption || ""}>
                <small>{bucketCaption}</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
