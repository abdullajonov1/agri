import type { GraffWidgetHost } from "../../graff-host";
import type { ChartVegetationRow, AgriGraffWidgetState } from "../../widget";
import { resolveDefaultDateRangeIndices } from "../../graff-timeseries-helpers";
import type { VegetationIndiceType } from "../../../../../gis/agri-polygon-api-source";
import { Table, ChartLine } from "lucide-react";
import { GRAFF_INDEX_BUTTONS } from "../../graff-graph-constants";
import { React } from "jimu-core";
import AgriChartLoader from "../../../../../shared/AgriChartLoader";
import { setVegetationOverlayContext } from "../../../../../gis/agri-vegetation-overlay-prefetch";
import { extractGraffYearToken } from "../../../../../data/agri-graff-date";

export const INDEX_COLORS: Record<string, string> = {
  ndvi: "#00d084",
  savi: "#7aa5ff",
  rvi: "#ffb347",
  ci: "#c78bff",
  evi: "#ff4d8d",
  ndwi: "#2ec4f1",
};
/** Like Agrobank IndexDynamicsChart: keep previous series while refetching. */
export const beginGraphFetch = (host: GraffWidgetHost): void => {
  const hadData = (host.state.vegetationData?.length || 0) > 0;
  if (!hadData) host._hasCompletedGraphFetch = false;
  if (!host.state.loadingVegetation) {
    host.setState({ loadingVegetation: true, vegetationError: null });
  } else {
    host.setState({ vegetationError: null });
  }
};
export const applyGraphData = (host: GraffWidgetHost, nextData: ChartVegetationRow[], extra?: Partial<AgriGraffWidgetState>, options?: { animate?: boolean }): void => {
  host._hasCompletedGraphFetch = true;
  const animate = options?.animate !== false;
  const patch: Partial<AgriGraffWidgetState> = { ...(extra || {}) };
  // Null range = reset to default window (last 3 months of available data).
  if (
    Object.prototype.hasOwnProperty.call(patch, "dateRangeStartIndex") &&
    Object.prototype.hasOwnProperty.call(patch, "dateRangeEndIndex") &&
    patch.dateRangeStartIndex == null &&
    patch.dateRangeEndIndex == null
  ) {
    const defaults = resolveDefaultDateRangeIndices(nextData || []);
    patch.dateRangeStartIndex = defaults.startIndex;
    patch.dateRangeEndIndex = defaults.endIndex;
  }
  host.setState({
    vegetationData: nextData,
    loadingVegetation: false,
    vegetationError: null,
    ...(animate
      ? { chartAnimKey: (host.state.chartAnimKey || 0) + 1 }
      : {}),
    ...patch,
  } as any);
};
export const switchToTable = (host: GraffWidgetHost) => {
  if (host.state.viewMode === "table") return;
  // Drop any in-flight graph series so a late response cannot leave
  // loadingVegetation stuck / overwrite the next graph open.
  // Keep vegetationData so returning to graph can morph without a cold loader.
  host._vegetationDataRequestId++;
  host._regionalTimeseriesRequestId++;
  host._regionalTimeseriesRequestKey = "";
  host._hasCompletedTableFetch = false;
  host.setState(
    {
      viewMode: "table",
      vegetationError: null,
      loadingVegetation: false,
      loading: true,
      isMonthPickerOpen: false,
    },
    () => {
      if (host.state.viewMode !== "table") return;
      if (host.state.selecteduniqueid) {
        host._pendingScrollUniqueid = host.state.selecteduniqueid;
      }
      const hasFilterOptions = Object.keys(host.state.filterOptions || {}).length > 0;
      if (hasFilterOptions) host.fetchData();
      else host.fetchFilterOptions();
    },
  );
};
export const switchToGraph = (host: GraffWidgetHost) => {
  if (host.state.viewMode === "graph") return;
  // Drop any in-flight table page so a late response cannot leave loading stuck.
  host._tableDataRequestId++;
  host._hasCompletedTableFetch = true;
  const hadData = (host.state.vegetationData?.length || 0) > 0;
  const canReusePolygonGraph =
    !!host.state.selecteduniqueid &&
    hadData &&
    !host.state.vegetationError;
  // Cold-start loader only when there is no previous series (Agrobank morph).
  if (!hadData) host._hasCompletedGraphFetch = false;
  host.setState(
    {
      viewMode: "graph",
      error: null,
      vegetationError: null,
      loading: false,
      // Keep previous series + selected date visible when data is already loaded.
      loadingVegetation: canReusePolygonGraph ? false : !hadData,
      isMonthPickerOpen: false,
    },
    () => {
      if (host.state.viewMode !== "graph") return;
      if (canReusePolygonGraph) {
        host._hasCompletedGraphFetch = true;
        const date = host.state.selectedNdviDate;
        const indexKey = (host.state.selectedChartIndexKey ||
          "ndvi") as VegetationIndiceType;
        if (date && host.state.selecteduniqueid) {
          void host.applyVegetationImageOverlay(
            host.state.selecteduniqueid,
            date,
            indexKey,
          );
        }
        return;
      }
      if (host.state.selecteduniqueid) {
        host.fetchVegetationData();
      } else {
        host.fetchRegionalTimeseries();
      }
    },
  );
};
export const renderViewModeToggle = (host: GraffWidgetHost, activeMode: "table" | "graph") => {
  const { language } = host.state;
  const viewTableLabel =
    language === "en"
      ? "Table"
      : language === "ru"
        ? "Таблица"
        : language === "uz_lat"
          ? "Jadval"
          : "Жадвал";
  const viewGraphLabel =
    language === "en"
      ? "Chart"
      : language === "ru"
        ? "График"
        : language === "uz_lat"
          ? "Grafik"
          : "График";
  const groupLabel =
    language === "en"
      ? "View mode"
      : language === "ru"
        ? "Режим просмотра"
        : language === "uz_lat"
          ? "Ko‘rinish"
          : "Кўриниш";
  const isGraph = activeMode === "graph";

  return (
    <button
      type="button"
      className={`graff-view-toggle${isGraph ? " graff-view-toggle--graph" : ""}`}
      role="switch"
      aria-label={groupLabel}
      aria-checked={isGraph}
      title={isGraph ? viewGraphLabel : viewTableLabel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isGraph) host.switchToTable();
        else host.switchToGraph();
      }}
    >
      <Table
        className="graff-view-toggle__icon graff-view-toggle__icon--table"
        strokeWidth={2}
        aria-hidden="true"
      />
      <ChartLine
        className="graff-view-toggle__icon graff-view-toggle__icon--graph"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className="graff-view-toggle__thumb" aria-hidden="true">
        {isGraph ? (
          <ChartLine size={13} strokeWidth={2} />
        ) : (
          <Table size={13} strokeWidth={2} />
        )}
      </span>
    </button>
  );
};
export const renderGraphLegend = (host: GraffWidgetHost) => {
  const { selectedIndices, language } = host.state;
  const regionalInteraction = host.isRegionalInteractionEnabled();
  const indexButtons = GRAFF_INDEX_BUTTONS;
  const allColor = "#DC2626";
  const isAllSelected = indexButtons.every((btn) =>
    selectedIndices.includes(btn.key),
  );
  const allLabel =
    language === "en"
      ? "All"
      : language === "ru"
        ? "Все"
        : language === "uz_lat"
          ? "Barchasi"
          : "Барчаси";

  return (
    <div
      className="index-buttons-horizontal"
      role="group"
      aria-label={
        language === "en"
          ? "Index indicators"
          : language === "ru"
            ? "Индекс показателей"
            : language === "uz_lat"
              ? "Index ko‘rsatkichlari"
              : "Индекс кўрсаткичлари"
      }
    >
      <button
        type="button"
        className={`index-btn-h${isAllSelected ? " active" : ""}`}
        disabled={!regionalInteraction}
        onClick={host.handleToggleAllIndices}
        style={{ "--legend-color": allColor } as React.CSSProperties}
        aria-pressed={isAllSelected}
      >
        <span
          className="index-btn-h-dot"
          style={{ opacity: isAllSelected ? 1 : 0.45 }}
        />
        <span className="index-btn-h-label">{allLabel}</span>
      </button>
      {indexButtons.map((btn) => {
        const isActive = selectedIndices.includes(btn.key);
        return (
          <button
            key={btn.key}
            type="button"
            className={`index-btn-h${isActive ? " active" : ""}`}
            disabled={!regionalInteraction}
            onClick={() => host.handleIndexChange(btn.key)}
            style={{ "--legend-color": btn.color } as React.CSSProperties}
            aria-pressed={isActive}
          >
            <span
              className="index-btn-h-dot"
              style={{ opacity: isActive ? 1 : 0.45 }}
            />
            <span className="index-btn-h-label">{btn.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export const renderGraphHeader = (host: GraffWidgetHost) => {
  const { language } = host.state;
  const indicatorLabel =
    language === "en"
      ? "Index Indicators"
      : language === "ru"
        ? "Индекс Показателей"
        : language === "uz_lat"
          ? "Index Ko'rsatkichlari"
          : "Индекс Кўрсаткичлари";

  return (
    <div className="graff-index-top">
      <div className="graff-index-top-label">
        <span>{indicatorLabel}</span>
      </div>
      {host.renderGraphLegend()}
      <div className="graff-index-top-right">
        {host.renderViewModeToggle("graph")}
      </div>
    </div>
  );
};
export const wrapGraphFrame = (host: GraffWidgetHost, body: React.ReactNode, options?: { refreshLoading?: boolean }) =>
  (
    <div
      className={`vegetation-graph-container${
        options?.refreshLoading ? " vegetation-graph-container--loading" : ""
      }`}
    >
      {host.renderGraphHeader()}
      <div className="graff-graph-body">{body}</div>
      {options?.refreshLoading ? <AgriChartLoader /> : null}
    </div>
  );
export const toggleMonthPicker = (host: GraffWidgetHost) => {
  if (!host.isRegionalInteractionEnabled()) return;

  host.setState((prev) => {
    if (prev.isMonthPickerOpen) {
      return {
        isMonthPickerOpen: false,
        monthPickerPlacement: prev.monthPickerPlacement,
      };
    }
    return {
      isMonthPickerOpen: true,
      monthPickerPlacement: host.resolveMonthPickerPlacement(),
    };
  });
};
export const resolveMonthPickerPlacement = (host: GraffWidgetHost): "up" | "down" => {
  const pickerRoot = host.monthPickerRef.current;
  if (!pickerRoot || typeof window === "undefined") return "down";

  const button = pickerRoot.querySelector(
    ".graff-month-button",
  ) as HTMLElement | null;
  const anchorRect = (button || pickerRoot).getBoundingClientRect();

  // 4 visible rows (including "all months") + panel padding/border.
  const estimatedPanelHeight = 132;
  const gap = 6;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // Dropdown is clipped by the widget card (overflow hidden), so place it
  // based on room inside that container first, then viewport as fallback.
  const card = pickerRoot.closest(".kadastr-status-card") as
    | HTMLElement
    | null;
  const cardRect = card?.getBoundingClientRect();
  const lowerBound = cardRect
    ? Math.min(cardRect.bottom, viewportHeight)
    : viewportHeight;
  const upperBound = cardRect ? Math.max(cardRect.top, 0) : 0;

  const spaceBelow = lowerBound - anchorRect.bottom;
  const spaceAbove = anchorRect.top - upperBound;

  if (spaceBelow < estimatedPanelHeight + gap && spaceAbove > spaceBelow) {
    return "up";
  }
  return "down";
};
export const handleMonthOptionClick = (host: GraffWidgetHost, month: number | null) => {
  if (!host.isRegionalInteractionEnabled()) return;

  host.setState(
    {
      selectedMonth: month,
      isMonthPickerOpen: false,
      chartTooltip: null,
      selectedNdviDate: null,
    },
    host.scheduleGraphViewportRefresh,
  );
};
/** Numeric region_id for the currently selected viloyat — same resolution as fetchRegionalTimeseries. */
export function resolveCurrentRegionId(host: GraffWidgetHost): number | undefined {
  const { viloyat } = host.state.regionalFilters;
  const effectiveViloyat = host.normalizeApos(viloyat);
  const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
  const storedRegionCode =
    host.state.regionalRegionCode != null &&
    Number.isFinite(host.state.regionalRegionCode)
      ? host.state.regionalRegionCode
      : null;

  // Prefer name→region mapping over cached regionalRegionCode — the cache
  // can briefly belong to the previous viloyat during rapid clicks, which
  // makes /available-dates return [] and blank the polygon chart.
  const mappedRegionFromName =
    /^\d+$/.test(effectiveViloyat) && effectiveViloyat
      ? Number(effectiveViloyat)
      : vilKey
        ? host._viloyatToRegion[vilKey]
        : undefined;
  const regionNum =
    mappedRegionFromName !== undefined &&
    Number.isFinite(mappedRegionFromName)
      ? mappedRegionFromName
      : storedRegionCode ?? undefined;

  return regionNum !== undefined && Number.isFinite(regionNum)
    ? regionNum
    : undefined;
}
/** Publish region/year for Popup-side TIFF prefetch. */
export const publishVegetationOverlayContext = (host: GraffWidgetHost): void => {
  const regionId = host.resolveCurrentRegionId();
  const year = host.resolveCurrentYear();
  if (regionId === undefined && year === undefined) return;
  setVegetationOverlayContext({
    regionId,
    year,
    // Never publish a date from a different region — Popup would prefetch
    // export-image with a scene date that does not exist there (HTTP 400).
    lastDate: host.getCarriedOverlayDate(regionId, year),
    lastIndex: host._lastSuccessfulOverlayIndex,
  });
};
/** Numeric year parsed from regionalFilters.yil. */
export function resolveCurrentYear(host: GraffWidgetHost): number | undefined {
  const year = extractGraffYearToken(host.state.regionalFilters?.yil);
  return year ? Number(year) : undefined;
}
