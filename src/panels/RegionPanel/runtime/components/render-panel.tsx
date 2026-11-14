import type { RegionWidgetHost } from "../region-host";
import type { AgriDisplayLanguage } from "../widget";
import { React } from "jimu-core";

import { translateAgriPlaceForDisplay } from "../../../../shared/agri-place-display";
import { pickLabel } from "../../../../shared/agri-i18n";
import {
  BACK_BUTTON,
  BREADCRUMB_BY_DISTRICTS,
  BREADCRUMB_BY_REGIONS,
  COUNT_FILTER_LABEL,
  MAP_ERROR_FALLBACK,
  RETRY_BUTTON,
  SORT_ASCENDING,
  SORT_DESCENDING,
  UNIT_LABEL,
} from "./render-panel-messages";
import {
  renderBody,
  renderCursorTooltip,
  renderHeader,
  renderHiddenSources,
} from "./render-panel-parts";

function translateForDisplay(
  text: string,
  language: AgriDisplayLanguage,
  placeKind?: "region" | "district",
): string {
  return translateAgriPlaceForDisplay(text, language, placeKind ?? "region");
}

export function render(host: RegionWidgetHost) {
  const {
    regionalData,
    selectedRegion,
    sortMode,
    currentView,
    selectedViloyatForDrillDown,
    language,
    isDarkTheme,
    widgetSize,
  } = host.state;

  const labelColumnWidth = host.calculateDynamicYAxisWidth();
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
    displayName: r.displayName,
  }));

  const rowCount = Math.max(chartData.length, 1);
  const measuredChartHeight = host.state.chartAreaHeight;
  const chartAreaHeight = Math.max(measuredChartHeight, rowCount * 20);

  const breadcrumb =
    currentView === "viloyat"
      ? pickLabel(BREADCRUMB_BY_REGIONS, language)
      : `${translateForDisplay(
          (selectedViloyatForDrillDown ?? "").replace(
            /\s*viloyat(?:i)?$/i,
            "",
          ),
          language,
          "region",
        )} - ${pickLabel(BREADCRUMB_BY_DISTRICTS, language)}`;

  const unitLabel = pickLabel(UNIT_LABEL, language);

  // Scale bars to the largest row: max maydon = 100% of the track.
  // (Previously axis was inflated for value-label reserve, leaving a large
  // empty gap after the top district.)
  const maxMaydon = chartData.reduce(
    (max, item) => Math.max(max, Number(item.maydon) || 0),
    0,
  );
  const chartAxisMax = maxMaydon > 0 ? maxMaydon : 1;

  const chartViewKey = `${currentView}:${selectedViloyatForDrillDown ?? ""}:${sortMode}:${effectiveDisplayCount}`;

  const countFilterLabel = pickLabel(COUNT_FILTER_LABEL, language);

  const sortTitle = pickLabel(
    sortMode === "value_asc" ? SORT_ASCENDING : SORT_DESCENDING,
    language,
  );

  const backButtonText = pickLabel(BACK_BUTTON, language);

  const showBackButton =
    currentView === "tuman" || !!selectedRegion?.trim();

  const retryButtonText = pickLabel(RETRY_BUTTON, language);

  const mapErrorFallback = pickLabel(MAP_ERROR_FALLBACK, language);

  return (
    <div
      className={`agri-v11-regional-stats-card ${isDarkTheme ? "agri-v11-region-dark" : "agri-v11-region-light"}`}
      data-region-size={widgetSize}
      ref={host._rootRef}
      onMouseLeave={host.handleWidgetPointerLeave}
    >
      {renderHiddenSources(host)}

      <div className="agri-v11-regional-stats-content">
        {renderHeader(host, {
          showBackButton,
          backButtonText,
          breadcrumb,
          countFilterLabel,
          sortTitle,
          effectiveDisplayCount,
        })}

        {renderBody(host, {
          mapErrorFallback,
          retryButtonText,
          chartData,
          chartAreaHeight,
          chartBarGap,
          chartTrackRightInset,
          labelColumnWidth,
          chartAxisMax,
          unitLabel,
          chartViewKey,
          currentDataLength: currentData.length,
        })}
      </div>

      {renderCursorTooltip(host)}
    </div>
  );
}
