import type { RegionFilterUpdates, RegionWidgetHost } from "../../region-host";
import { messageOf, panelEventDetail } from "../../../../panel-filter-detail";
import { regionLog as regionLogFn } from "../../region-log";
import { bindMasterFilter } from "../../../../../data/agri-filter-bus";
import { detectIsDarkTheme, normalizeLanguage } from "../../../../../shared/agri-language";
import type { WidgetSize, AgriRegionState } from "../../widget";
import { JimuMapView } from "jimu-arcgis";
import { getAgriTableDataLayer } from "../../../../../gis/agri-table-data-source";

export function componentDidMount(host: RegionWidgetHost) {
  regionLogFn("componentDidMount — this build IS running", {
    widgetId: host.props?.id,
    buildMarker: "agri-region10-2026-07-08-diagnostic",
  });
  host._isMounted = true;

  // Master filter — shared in-memory store (AgriLocalization is source of truth)
  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChange);
  document.addEventListener("mousedown", host.handleDocumentClickForCountFilter);
  document.addEventListener(
    "agriV11ThemeToggled",
    host.handleAgriV10ThemeChanged as EventListener,
  );

  host.setupResizeObserver();
  host.syncThemeState();

  host.setState({ connectionStatus: "connecting" });
}
export function componentWillUnmount(host: RegionWidgetHost) {
  host._isMounted = false;
  host.unbindPointerTracking();
  if (host._resizeObserver) {
    host._resizeObserver.disconnect();
    host._resizeObserver = null;
  }
  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;
  document.removeEventListener(
    "mousedown",
    host.handleDocumentClickForCountFilter,
  );
  document.removeEventListener(
    "agriV11ThemeToggled",
    host.handleAgriV10ThemeChanged as EventListener,
  );
}
export const handleDocumentClickForCountFilter = (host: RegionWidgetHost, event: MouseEvent): void => {
  if (!host.state.displayCountMenuOpen) return;
  const root = host._countFilterRef.current;
  if (root && event.target instanceof Node && root.contains(event.target)) {
    return;
  }
  host.setState({ displayCountMenuOpen: false });
};
export const toggleDisplayCountMenu = (host: RegionWidgetHost): void => {
  host.setState((prev) => ({
    displayCountMenuOpen: !prev.displayCountMenuOpen,
  }));
};
export const getCurrentDataLength = (host: RegionWidgetHost): number => {
  const { currentView, regionalData } = host.state;
  return currentView === "viloyat"
    ? regionalData.viloyatlar.length
    : regionalData.tumanlar.length;
};
export const getEffectiveDisplayCount = (host: RegionWidgetHost): number => {
  const dataLength = host.getCurrentDataLength();
  const { displayCount } = host.state;
  if (dataLength <= 0) return displayCount > 0 ? displayCount : 15;
  return Math.min(displayCount > 0 ? displayCount : 15, dataLength);
};
export const getDisplayCountOptions = (host: RegionWidgetHost): number[] => {
  const dataLength = host.getCurrentDataLength();
  const effectiveCount = host.getEffectiveDisplayCount();
  const max = Math.max(dataLength, effectiveCount, 1);
  const options = new Set<number>();

  for (const opt of [5, 10, 15, 20, 25, 30, 40, 50]) {
    if (opt <= max) options.add(opt);
  }
  if (dataLength > 0) options.add(dataLength);
  if (effectiveCount > 0) options.add(effectiveCount);

  return Array.from(options).sort((a, b) => a - b);
};
export const resolveDisplayCountForData = (host: RegionWidgetHost, dataLength: number): number => {
  const { displayCount } = host.state;
  if (dataLength <= 0) return displayCount > 0 ? displayCount : 15;
  // Never show more rows than available — if default 15 but region has fewer, use max.
  return Math.min(displayCount > 0 ? displayCount : 15, dataLength);
};
export const handleDisplayCountPillClick = (host: RegionWidgetHost, count: number): void => {
  if (host.state.displayCountMenuOpen) {
    host.applyDisplayCount(count);
    return;
  }

  if (count === host.getEffectiveDisplayCount()) {
    host.toggleDisplayCountMenu();
  }
};
export const applyDisplayCount = (host: RegionWidgetHost, count: number): void => {
  host.setState({
    displayCount: count,
    displayCountMenuOpen: false,
  });
};
export const cycleSortMode = (host: RegionWidgetHost): void => {
  host.setState((prev) => ({
    sortMode: prev.sortMode === "value_desc" ? "value_asc" : "value_desc",
  }));
};
export const syncThemeState = (host: RegionWidgetHost) => {
  if (!host._isMounted) return;
  const nextIsDark = detectIsDarkTheme();
  if (nextIsDark !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme: nextIsDark });
  }
};
export const handleAgriV10ThemeChanged = (host: RegionWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const detail = panelEventDetail(event);
  const nextIsDark =
    typeof detail.isDarkTheme === "boolean"
      ? detail.isDarkTheme
      : String(detail.theme || "").toLowerCase() === "dark";
  if (nextIsDark !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme: nextIsDark });
  }
};
export const resolveWidgetSize = (host: RegionWidgetHost, width: number): WidgetSize => {
  if (width < 360) return "xs";
  if (width < 520) return "sm";
  if (width < 760) return "md";
  return "lg";
};
export const setupResizeObserver = (regionHost: RegionWidgetHost) => {
  if (
    typeof window === "undefined" ||
    typeof ResizeObserver === "undefined"
  ) {
    return;
  }

  const updateSize = () => {
    const host = regionHost._rootRef.current;
    if (!host || !regionHost._isMounted) return;
    const nextSize = regionHost.resolveWidgetSize(host.clientWidth || 0);
    const nextWidth = host.clientWidth || 0;
    const nextChartHeight = Math.floor(
      regionHost._chartAreaRef.current?.clientHeight || 0,
    );
    if (
      nextSize !== regionHost.state.widgetSize ||
      nextWidth !== regionHost.state.containerWidth ||
      nextChartHeight !== regionHost.state.chartAreaHeight
    ) {
      regionHost.setState({
        widgetSize: nextSize,
        containerWidth: nextWidth,
        chartAreaHeight: nextChartHeight,
      });
    }
  };

  updateSize();
  regionHost._resizeObserver = new ResizeObserver(() => updateSize());
  if (regionHost._rootRef.current) {
    regionHost._resizeObserver.observe(regionHost._rootRef.current);
  }
  if (regionHost._chartAreaRef.current) {
    regionHost._resizeObserver.observe(regionHost._chartAreaRef.current);
    regionHost._chartAreaObserved = true;
  }
};
export function componentDidUpdate(host: RegionWidgetHost): void {
  const chartArea = host._chartAreaRef.current;
  if (!chartArea || !host._resizeObserver || host._chartAreaObserved) return;

  host._resizeObserver.observe(chartArea);
  host._chartAreaObserved = true;
  const nextChartHeight = Math.floor(chartArea.clientHeight || 0);
  if (
    nextChartHeight > 0 &&
    nextChartHeight !== host.state.chartAreaHeight
  ) {
    host.setState({ chartAreaHeight: nextChartHeight });
  }
}
export const handleMasterFilterChange = (host: RegionWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const d = panelEventDetail(event);
  if (!d.filters) return;

  const f = d.filters;

  const nextTurlar: string[] = Array.from(
    new Set<string>(
      (Array.isArray(f.turlar) ? f.turlar : f.turi ? [f.turi] : ([] as unknown[]))
        .map((value: unknown) => host.normalizeApos(String(value || "")))
        .filter(Boolean),
    ),
  );
  const nextVh = String(f.vh || "").trim();
  const nextFilterPieByVh = Boolean(f.filterPieByVh);
  const nextTuman = String(f.tuman || "").trim();
  // Prefer viloyat-wide chart ids from Localization. Map/Graff still get
  // district-scoped `vhUniqueids`; using those here collapsed "Tumanlar
  // kesimida" to the selected tuman after VH.
  const normalizeIdList = (raw: unknown): string[] | null => {
    if (!Array.isArray(raw)) return null;
    return Array.from(
      new Set<string>(
        raw
          .map((value: unknown) => String(value || "").trim())
          .filter(Boolean),
      ),
    );
  };
  const regionChartIds = normalizeIdList(d.vhRegionChartUniqueids);
  const nextVhUniqueids: string[] | null = !nextVh
    ? null
    : regionChartIds != null
      ? regionChartIds
      : !nextTuman
        ? normalizeIdList(d.vhUniqueids)
        : null;
  const next = {
    yil: f.yil || "",
    viloyat: f.viloyat || "",
    tuman: f.tuman || "",
    turi: f.turi || "",
    turlar: nextTurlar,
    vh: nextVh,
    vhUniqueids: nextVhUniqueids,
    filterPieByVh: nextFilterPieByVh,
  };

  const lockedViloyat = d?.scope?.lockedViloyat
    ? String(d.scope.lockedViloyat)
    : null;
  const isLocked = Boolean(d?.scope?.locked);
  const language = normalizeLanguage(
    f.language || host.state.language,
  );

  const prev = host.state.currentFilters;

  const languageChanged = language !== host.state.language;
  // VH and Pie (ekin turi) must not refetch Region — hudud bars ignore both.
  const meaningfulChanged =
    next.yil !== prev.yil ||
    next.viloyat !== prev.viloyat ||
    next.tuman !== prev.tuman ||
    lockedViloyat !== host.state.lockedViloyat ||
    isLocked !== host.state.isLocked;

  // If only language changed, update UI strings without re-fetching data.
  if (!meaningfulChanged && languageChanged) {
    host.setState({ language, regionalError: null }, () => {
      // UI re-renders automatically; no data refetch needed.
    });
    return;
  }

  if (!meaningfulChanged) return;

  const effectiveViloyat = lockedViloyat || next.viloyat || "";
  const nextViloyatKey = host.normalizeApos(String(effectiveViloyat || ""))
    .trim()
    .toLowerCase();
  const highlightKey = host.normalizeApos(
    String(host.state.selectedRegion || ""),
  )
    .trim()
    .toLowerCase();
  const pendingHighlight = (host._pendingBackToViloyatHighlight || "").trim();
  const pendingKey = host.normalizeApos(pendingHighlight).toLowerCase();

  // Back → viloyat list with highlight: master filter still has viloyat set.
  // Stay on the viloyat list for every echo while that highlight is active
  // (pending once, then selectedRegion === viloyat + currentView === viloyat).
  const stayOnViloyatListHighlight =
    !next.tuman &&
    !!nextViloyatKey &&
    ((pendingKey && pendingKey === nextViloyatKey) ||
      (host.state.currentView === "viloyat" &&
        !host.state.selectedViloyatForDrillDown &&
        !!highlightKey &&
        highlightKey === nextViloyatKey));

  if (stayOnViloyatListHighlight) {
    host._pendingBackToViloyatHighlight = null;
    const highlightName = pendingHighlight || host.state.selectedRegion;
    const prevLocked = host.state.lockedViloyat;
    const needsBarRefetch =
      next.yil !== prev.yil || lockedViloyat !== prevLocked;
    host.setState(
      {
        currentFilters: {
          ...host.state.currentFilters,
          yil: next.yil,
          // Keep UI at viloyat list: do NOT store viloyat filter here,
          // otherwise the next echo looks like a fresh drill-down.
          viloyat: "",
          tuman: "",
          turi: next.turi,
          turlar: next.turlar,
          vh: next.vh,
          vhUniqueids: next.vhUniqueids,
          filterPieByVh: next.filterPieByVh,
        },
        lockedViloyat,
        isLocked,
        language,
        regionalError: null,
        currentView: "viloyat",
        selectedViloyatForDrillDown: null,
        selectedRegion: highlightName,
      },
      () => {
        if (needsBarRefetch) host.fetchRegionalDataDeduped();
      },
    );
    return;
  }

  host.setState(
    {
      currentFilters: {
        ...host.state.currentFilters,
        yil: next.yil,
        viloyat: next.viloyat,
        tuman: next.tuman,
        turi: next.turi,
        turlar: next.turlar,
        vh: next.vh,
        vhUniqueids: next.vhUniqueids,
        filterPieByVh: next.filterPieByVh,
      },
      lockedViloyat,
      isLocked,
      language,
      regionalError: null,
    },
    () => {
      // ✅ If user is locked, "top" view should effectively be tumans of locked viloyat
      const eff = lockedViloyat || next.viloyat || "";

      if (next.tuman) {
        host.setState(
          {
            currentView: "tuman",
            selectedViloyatForDrillDown: eff,
            selectedRegion: next.tuman,
          },
          host.fetchRegionalDataDeduped,
        );
      } else if (eff) {
        // External / first-time viloyat selection → show that viloyat's tumans.
        host.setState(
          {
            currentView: "tuman",
            selectedViloyatForDrillDown: eff,
            selectedRegion: null,
          },
          host.fetchRegionalDataDeduped,
        );
      } else {
        host.setState(
          {
            currentView: "viloyat",
            selectedViloyatForDrillDown: null,
            selectedRegion: null,
          },
          host.fetchRegionalDataDeduped,
        );
      }
    },
  );
};
export const notifyAgriFilter = (host: RegionWidgetHost, updates: RegionFilterUpdates, generation?: number) => {
  if (
    generation !== undefined &&
    generation !== host._selectionNotifyGeneration
  ) {
    regionLogFn("notifyAgriFilter:SKIP-stale-generation", {
      generation,
      current: host._selectionNotifyGeneration,
      updates,
    });
    return;
  }

  const detail = {
    ...updates,
    source: "AgriRegion",
    timestamp: Date.now(),
  };

  regionLogFn("notifyAgriFilter:dispatching", { detail });
  document.dispatchEvent(
    new CustomEvent("widgetSelectionChanged", {
      detail,
      bubbles: true,
    }),
  );
};
/** Capture a generation token before any await that later notifies filters. */
export const beginSelectionNotify = (host: RegionWidgetHost): number => {
  host._selectionNotifyGeneration += 1;
  return host._selectionNotifyGeneration;
};
export const onActiveViewChange = async (host: RegionWidgetHost, jimuMapView: JimuMapView) => {
  if (!jimuMapView) return;

  try {
    // Agri_table_data is an external Table, not part of the map or a
    // builder-assigned Data Source — it is loaded directly by URL.
    const { layer: featureLayer } = await getAgriTableDataLayer();
    const featureLayers = [featureLayer];

    const area = host.detectAreaField(featureLayer);
    const statMode: "sum" | "count" = area ? "sum" : "count";

    host.setState({
      activeMapView: jimuMapView,
      featureLayer,
      featureLayers,
      connectionStatus: "connected",
      regionalError: null,
      areaField: area,
      statMode,
    });
  } catch (err) {
    host.setState({
      regionalError: `Connection error: ${messageOf(err) || err}`,
      connectionStatus: "failed",
    });
  }
};
export const resolveFeatureLayerFromUseDataSource = async (host: RegionWidgetHost, jimuMapView: JimuMapView): Promise<__esri.FeatureLayer | null> => {
  if (!jimuMapView?.view?.map) return null;

  const useDs = host.props.useDataSources?.[0];
  if (!useDs?.dataSourceId) return null;

  return host.resolveFeatureLayerFromOneUseDataSource(useDs, jimuMapView);
};
