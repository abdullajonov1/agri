import type { RegionWidgetHost } from "../region-host";
import type { AgriDisplayLanguage } from "../widget";
import { React } from "jimu-core";
import { DataSourceComponent } from "jimu-core";
import { JimuMapViewComponent } from "jimu-arcgis";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { SortDescIcon, SortAscIcon } from "../SortIcons";
import { default as AgriChartLoader } from "../../../../shared/AgriChartLoader";
import { Button } from "jimu-ui";
import { agriNoDataLabel } from "../../../../shared/agriNoDataLabel";
import { AgriRegionBarChart } from "../AgriRegionBarChart";
import { translateAgriPlaceForDisplay } from "../../../../shared/agri-place-display";

function translateForDisplay(
  text: string,
  language: AgriDisplayLanguage,
  placeKind?: "region" | "district",
): string {
  return translateAgriPlaceForDisplay(text, language, placeKind ?? "region");
}

export function render(host: RegionWidgetHost) {
  const {
    regionalLoading,
    regionalError,
    regionalData,
    selectedRegion,
    displayCountMenuOpen,
    sortMode,
    connectionStatus,
    currentView,
    selectedViloyatForDrillDown,
    currentFilters,
    language,
    isDarkTheme,
    widgetSize,
    cursorTooltip,
  } = host.state;

  const labelColumnWidth = host.calculateDynamicYAxisWidth();
  const yAxisWidth = labelColumnWidth + 2;
  const chartTrackRightInset = 0;
  const chartBarGap = 6;

  const currentData =
    currentView === "viloyat"
      ? regionalData.viloyatlar
      : regionalData.tumanlar;

  // Build display names first so alpha sort is stable and matches UI language.
  const chartDataBase = [...currentData].map((r) => {
    const displayBase = r.name.replace(
      currentView === "viloyat" ? /\s*viloyat(?:i)?$/i : /\s*tumani$/i,
      "",
    );
    const displayName = translateForDisplay(displayBase, language, currentView === "viloyat" ? "region" : "district");
    return { ...r, displayName };
  });

  const sorted =
    sortMode === "value_asc"
      ? [...chartDataBase].sort((a, b) => a.maydon - b.maydon)
      : [...chartDataBase].sort((a, b) => b.maydon - a.maydon);

  const effectiveDisplayCount = host.getEffectiveDisplayCount();

  const limited =
    currentView === "viloyat"
      ? sorted
      : effectiveDisplayCount > 0
        ? sorted.slice(0, effectiveDisplayCount)
        : sorted;

  const chartData = limited.map((r, i) => ({
    ...r, // keep original `name` for selection notifications
    index: i + 1,
    displayName: (r as any).displayName,
  }));

  const rowCount = Math.max(chartData.length, 1);
  const measuredChartHeight = host.state.chartAreaHeight;
  const chartAreaHeight = Math.max(measuredChartHeight, rowCount * 20);

  const breadcrumb =
    currentView === "viloyat"
      ? language === "en"
        ? "By regions"
        : language === "ru"
          ? "Статистика по областям"
          : language === "uz_lat"
            ? "Viloyatlar kesimida"
            : "Вилоят кесимида"
      : `${translateForDisplay(
          (selectedViloyatForDrillDown ?? "").replace(
            /\s*viloyat(?:i)?$/i,
            "",
          ),
          language,
          "region",
        )} - ${
          language === "en"
            ? "by districts"
            : language === "ru"
            ? "по районам"
            : language === "uz_lat"
              ? "tumanlar kesimida"
              : "туманлар кесимида"
        }`;

  const unitLabel = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";

  // Scale bars to the largest row: max maydon = 100% of the track.
  // (Previously axis was inflated for value-label reserve, leaving a large
  // empty gap after the top district.)
  const maxMaydon = chartData.reduce(
    (max, item) => Math.max(max, Number(item.maydon) || 0),
    0,
  );
  const chartAxisMax = maxMaydon > 0 ? maxMaydon : 1;

  const chartViewKey = `${currentView}:${selectedViloyatForDrillDown ?? ""}:${sortMode}:${effectiveDisplayCount}`;

  const countFilterLabel =
    language === "en"
      ? "Row count"
      : language === "ru"
      ? "Количество строк"
      : language === "uz_lat"
        ? "Qatorlar soni"
        : "Қаторлар сони";

  const sortTitle =
    sortMode === "value_asc"
      ? language === "en"
        ? "Ascending"
        : language === "ru"
        ? "По возрастанию"
        : language === "uz_lat"
          ? "O'sish"
          : "Ўсиш"
      : language === "en"
        ? "Descending"
        : language === "ru"
        ? "По убыванию"
        : language === "uz_lat"
          ? "Kamayish"
          : "Камайиш";

  const selectYearTitle =
    language === "en"
      ? "📅 Select a year"
      : language === "ru"
      ? "📅 Выберите год"
      : language === "uz_lat"
        ? "📅 Yilni tanlang"
        : "📅 Йилни танланг";

  const selectYearBody =
    language === "en"
      ? "Select a year first to view statistics"
      : language === "ru"
      ? "Чтобы просматривать статистику, сначала выберите год"
      : language === "uz_lat"
        ? "Statistikani ko‘rish uchun avval yilni tanlang"
        : "Статистикани кўриш учун аввал йилни танланг";

  const backButtonText =
    language === "en" ? "Back" : language === "ru" ? "Назад" : language === "uz_lat" ? "Orqaga" : "Орқага";

  const showBackButton =
    currentView === "tuman" || !!selectedRegion?.trim();

  const retryButtonText =
    language === "en"
      ? "Reload"
      : language === "ru"
      ? "Перезагрузить"
      : language === "uz_lat"
        ? "Qayta yuklash"
        : "Қайта юкла";

  const mapErrorFallback =
    language === "en"
      ? "Could not connect to the map."
      : language === "ru"
      ? "Не удалось подключиться к карте."
      : language === "uz_lat"
        ? "Xaritaga ulana olmadik."
        : "Харитага улана олмадик.";

  return (
    <div
      className={`agri-v11-regional-stats-card ${isDarkTheme ? "agri-v11-region-dark" : "agri-v11-region-light"}`}
      data-region-size={widgetSize}
      ref={host._rootRef}
      onMouseLeave={host.handleWidgetPointerLeave}
    >
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
            key={String(host.props.useDataSources[0]?.dataSourceId || "ds-0")}
            useDataSource={host.props.useDataSources[0]}
            onDataSourceCreated={host.onDataSourceCreated}
          />
        )}
        <JimuMapViewComponent
          useMapWidgetId={host.props.useMapWidgetIds?.[0]}
          onActiveViewChange={host.onActiveViewChange}
        />
      </div>

      <div className="agri-v11-regional-stats-content">
        <div className="agri-v11-regional-stats-header">
          <div className="agri-v11-regional-stats-header-left">
            <div className="agri-v11-regional-stats-navigation">
              {showBackButton && (
                <button
                  className="agri-v11-regional-stats-back-button"
                  onClick={host.navigateBack}
                  title={backButtonText}
                  aria-label={backButtonText}
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="agri-v11-regional-stats-header-title">{breadcrumb}</div>
          </div>
          <div className="agri-v11-regional-stats-header-controls">
            {currentView === "tuman" && (
              <div
                ref={host._countFilterRef}
                className={`agri-v11-regional-stats-count-filter ${displayCountMenuOpen ? "is-open" : ""}`}
              >
                <div
                  className="agri-v11-regional-stats-count-menu"
                  role="listbox"
                  aria-label={countFilterLabel}
                  aria-expanded={displayCountMenuOpen}
                >
                  {host.getDisplayCountOptions().reverse().map((count) => (
                    <button
                      key={count}
                      type="button"
                      role="option"
                      aria-selected={effectiveDisplayCount === count}
                      className={`agri-v11-regional-stats-count-pill ${effectiveDisplayCount === count ? "is-active" : ""} ${
                        !displayCountMenuOpen && effectiveDisplayCount !== count
                          ? "is-collapsed"
                          : ""
                      }`}
                      onClick={() => host.handleDisplayCountPillClick(count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="agri-v11-regional-stats-sort-buttons">
              <button
                type="button"
                className="agri-v11-regional-stats-sort-button active"
                onClick={host.cycleSortMode}
                onMouseDown={(e) => e.preventDefault()}
                title={sortTitle}
                aria-label={sortTitle}
              >
                {sortMode === "value_desc" ? (
                  <SortDescIcon />
                ) : (
                  <SortAscIcon />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className="agri-v11-regional-stats-body"
          ref={host._chartAreaRef}
        >
        {connectionStatus === "connecting" ? (
          <div className="agri-v11-regional-stats-loading-container">
            <AgriChartLoader />
          </div>
        ) : connectionStatus === "failed" ? (
          <div className="agri-v11-regional-stats-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <p>{regionalError || mapErrorFallback}</p>
          </div>
        ) : !currentFilters.yil ? (
          <div className="agri-v11-regional-stats-loading-container">
            <AgriChartLoader />
          </div>
        ) : regionalLoading ? (
          <div className="agri-v11-regional-stats-loading-container">
            <AgriChartLoader />
          </div>
        ) : regionalError ? (
          <div className="agri-v11-regional-stats-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <p>{regionalError}</p>
            <Button onClick={host.fetchRegionalData} type="primary" size="sm">
              {retryButtonText}
            </Button>
          </div>
        ) : currentData.length === 0 ? (
          <div className="agri-v11-regional-stats-no-data">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <h3>{agriNoDataLabel(language)}</h3>
          </div>
        ) : (
          <div
            className="agri-v11-regional-stats-chart-scroll"
            ref={host._chartContainerRef}
            onMouseMove={host.handleChartSurfaceMove}
          >
            <AgriRegionBarChart
              data={chartData}
              chartAreaHeight={chartAreaHeight}
              chartBarGap={chartBarGap}
              chartTrackRightInset={chartTrackRightInset}
              nameColumnWidth={labelColumnWidth}
              chartAxisMax={chartAxisMax}
              unitLabel={unitLabel}
              selectedRegion={selectedRegion}
              viewKey={chartViewKey}
              formatNumber={(value) => host.formatNumber(value)}
              onRowClick={host.handleBarRowClick}
              onRowPointerEnter={host.handleBarRowPointerEnter}
              onRowPointerMove={host.handleBarRowPointerMove}
            />
          </div>
        )}
        </div>
      </div>

      {cursorTooltip.visible && cursorTooltip.data ? (
        <div
          ref={host._cursorTooltipRef}
          className="agri-v11-regional-tooltip agri-v11-regional-tooltip-cursor-follow"
        >
          {host.renderCursorTooltipContent(cursorTooltip.data)}
        </div>
      ) : null}
    </div>
  );
}
