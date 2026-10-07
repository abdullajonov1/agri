import type { GraffWidgetHost } from "../graff-host";
import { describeThrown, eventDetail, setDataSourceDefinitionExpression } from "../graff-guards";
import { graffLog } from "../graff-log";
import * as projection from "esri/geometry/projection";
import { warmPolygonApiConnection } from "../../../../gis/agri-polygon-api-source";
import { getAgriVegetationIndicesLayer } from "../../../../gis/agri-vegetation-data-source";
import { bindMasterFilter } from "../../../../data/agri-filter-bus";
import { isMapImageOwnedLayer } from "../../../../gis/feature-layer-data";
import { AllWidgetProps, DataSource, QueriableDataSource } from "jimu-core";
import type { AgriGraffWidgetState } from "../widget";
import type { GraffWidgetProps } from "../graff-state";
import { MAP_CONNECTION_RETRY_MS } from "../../../../shared/map-connection-service";
import type { AgriLanguage } from "../../../../shared/agri-language";

export function componentDidMount(host: GraffWidgetHost) {
  host._isMounted = true;
  host.setState({ connectionStatus: "connecting" });
  host.initializeTheme();
  host.refreshFiltersFromConfig();

  // Warm cold paths so the first field's index raster is not paying
  // TLS + FeatureLayer + projection engine startup on click.
  try {
    warmPolygonApiConnection();
    host.publishVegetationOverlayContext();
    void getAgriVegetationIndicesLayer().catch(() => {
      /* best-effort */
    });
    void projection.load().catch(() => {
      /* best-effort */
    });
  } catch {
    /* ignore */
  }

  document.addEventListener(
    "agriV11ThemeToggled",
    host.handleThemeChange as EventListener,
  );
  document.addEventListener(
    "languageChanged",
    host.handleAppLanguageChanged as EventListener,
  );

  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChanged);
  // Bypass Localization for overlay kickoff — Popup notify → Graff same tick.
  host._unbindPopupPolygonSelection = (() => {
    const handler = host.handlePopupPolygonSelectionFastPath as EventListener;
    document.addEventListener("widgetSelectionChanged", handler);
    return () => document.removeEventListener("widgetSelectionChanged", handler);
  })();
  document.addEventListener(
    "agriGraff4TableSearchChanged",
    host.handleExternalTableSearchChanged as EventListener,
  );
  document.addEventListener(
    "agriGraff4TableRowSelected",
    host.handleExternalTableRowSelected as EventListener,
  );

  document.addEventListener("mousedown", host.handleDocumentMouseDown);
  document.addEventListener(
    "resetAllFilters",
    host.handleResetAll as EventListener,
  );
  document.addEventListener(
    "graffDateIndexNavigate",
    host.handleDateIndexNavigate as EventListener,
  );

  host._onReset = () => {
    if (!host._isMounted) return;

    const fields = host.getConfiguredFilterFields();
    const blankLocal = fields.reduce(
      (acc, f) => {
        acc[f] = "";
        return acc;
      },
      {} as Record<string, string>,
    );
    const blankExternal = fields.reduce(
      (acc, f) => {
        acc[f] = "";
        return acc;
      },
      {} as Record<string, string>,
    );

    // ✅ include vh
    const blankRegional = {
      viloyat: "",
      tuman: "",
      yil: "",
      uzspace: "",
      vh: "",
    };

    host._allowClearOnce = true;

    host.setState(
      {
        localFilters: blankLocal,
        externalFilters: blankExternal,
        regionalFilters: blankRegional,
        vhUniqueids: null,
        records: [],
        currentPage: 1,
        loading: true,
        lastUpdateTimestamp: Date.now(),
        isProcessingExternalUpdate: false,
      },
      () => {
        if (host.state.connectionStatus === "connected") {
          host.applyMapFilters();
          host.fetchData();
        }
      },
    );
  };

  if (
    host.state.featureLayer &&
    !isMapImageOwnedLayer(host.state.featureLayer)
  ) {
    host.state.featureLayer.definitionExpression = "";
  }
  if (host.state.dataSource) {
    setDataSourceDefinitionExpression(host.state.dataSource, "");
  }

  host.initializationTimer = setTimeout(() => {
    host.ensureInitialization();
  }, 3000);

  window.addEventListener("resize", host.updateGraphViewportSize);
  if (host.state.viewMode === "graph") {
    host.observeGraphViewport();
  }
}

export function componentDidUpdate(host: GraffWidgetHost, prevProps: GraffWidgetProps, prevState: AgriGraffWidgetState) {
  const { connectionStatus, mapConnectionAttempts } = host.state;
  const { useMapWidgetIds } = host.props;

  const shouldRetryConnection =
    connectionStatus === "connecting" &&
    useMapWidgetIds &&
    useMapWidgetIds.length > 0 &&
    !host.state.activeMapView &&
    mapConnectionAttempts !== prevState.mapConnectionAttempts &&
    mapConnectionAttempts < host.MAX_CONNECTION_ATTEMPTS;

  if (shouldRetryConnection) {
    if (host._retryTimeout) {
      clearTimeout(host._retryTimeout);
    }

    host._retryTimeout = setTimeout(() => {
      if (!host._isMounted) return;

      host.setState((prevState) => ({
        mapConnectionAttempts: prevState.mapConnectionAttempts + 1,
      }));
    }, MAP_CONNECTION_RETRY_MS);
  } else if (
    connectionStatus === "connecting" &&
    mapConnectionAttempts >= host.MAX_CONNECTION_ATTEMPTS &&
    prevState.mapConnectionAttempts !== mapConnectionAttempts
  ) {
    host.setState({
      connectionStatus: "failed",
    });
  }

  if (host.props.config !== prevProps.config) {
    host.refreshFiltersFromConfig();
  }

  if (host.state.viewMode === "graph" && prevState.viewMode !== "graph") {
    host.observeGraphViewport();
  }

  const graphLayoutChanged =
    host.state.viewMode === "graph" &&
    (prevState.selectedIndices !== host.state.selectedIndices ||
      prevState.language !== host.state.language ||
      prevState.loadingVegetation !== host.state.loadingVegetation ||
      prevState.vegetationData !== host.state.vegetationData);

  if (
    host.state.viewMode === "graph" &&
    host.state.selectedMonth != null &&
    prevState.vegetationData !== host.state.vegetationData
  ) {
    const hasSelectedMonthData = (host.state.vegetationData || []).some(
      (row) =>
        new Date(row.raster_date).getMonth() ===
        host.state.selectedMonth,
    );
    if (!hasSelectedMonthData) {
      host.setState({
        selectedMonth: null,
        isMonthPickerOpen: false,
        chartTooltip: null,
        selectedNdviDate: null,
      });
    }
  }

  if (graphLayoutChanged) {
    host.scheduleGraphViewportRefresh();
  }

  if (
    host.state.viewMode === "graph" &&
    (prevState.graphViewportWidth !== host.state.graphViewportWidth ||
      prevState.graphViewportHeight !== host.state.graphViewportHeight)
  ) {
    host.scheduleGraphViewportRefresh();
  }

  // Index → Jadval: switchToTable already calls fetchData. Never runAutoSearch
  // here — that used to zoom the map whenever searchText was non-empty (even
  // from typing in the header before a dropdown row was chosen).

  // Regional timeseries refetch is owned by handleMasterFilterChanged /
  // switchToGraph — avoid a second overlapping fetch in componentDidUpdate.

  // Centralized here (instead of at every setState call site that can
  // change selectedNdviDate/selectedChartIndexKey — chart click, polygon
  // switch, deselect, filter change, etc.) so the bottom-left map
  // indicator always reflects whichever one actually won, regardless of
  // which code path caused it.
  if (
    prevState.selectedNdviDate !== host.state.selectedNdviDate ||
    prevState.selectedChartIndexKey !== host.state.selectedChartIndexKey ||
    prevState.vegetationData !== host.state.vegetationData ||
    prevState.selecteduniqueid !== host.state.selecteduniqueid ||
    prevState.polygonAvailableDates !== host.state.polygonAvailableDates
  ) {
    host.broadcastDateIndexSelection();
  }
}

export function componentWillUnmount(host: GraffWidgetHost) {
  host._isMounted = false;

  host.cancelVegetationImageOverlay();
  // Clear the bottom-left date/index indicator so it doesn't keep
  // showing stale info once this chart is gone.
  try {
    document.dispatchEvent(
      new CustomEvent("graffDateIndexSelectionChanged", {
        detail: {
          date: null,
          indexKey: null,
          value: null,
          availableDates: [],
          navigable: false,
        },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }

  document.removeEventListener(
    "agriV11ThemeToggled",
    host.handleThemeChange as EventListener,
  );
  document.removeEventListener(
    "languageChanged",
    host.handleAppLanguageChanged as EventListener,
  );

  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;
  host._unbindPopupPolygonSelection?.();
  host._unbindPopupPolygonSelection = null;
  host.detachMapHoverPrefetch();
  document.removeEventListener(
    "agriGraff4TableSearchChanged",
    host.handleExternalTableSearchChanged as EventListener,
  );
  document.removeEventListener(
    "agriGraff4TableRowSelected",
    host.handleExternalTableRowSelected as EventListener,
  );

  if (host._updateDebounceTimer) {
    clearTimeout(host._updateDebounceTimer);
    host._updateDebounceTimer = null;
  }

  document.removeEventListener(
    "resetAllFilters",
    host.handleResetAll as EventListener,
  );
  document.removeEventListener(
    "graffDateIndexNavigate",
    host.handleDateIndexNavigate as EventListener,
  );
  document.removeEventListener("mousedown", host.handleDocumentMouseDown);

  try {
    host._activeController?.abort();
  } catch (err) {
    // Aborting an already-settled controller during unmount is harmless.
    graffLog("unmount:abort-failed", { error: describeThrown(err) });
  }
  if (host._debounceTimer) clearTimeout(host._debounceTimer);
  if (host._searchDebounceTimer) clearTimeout(host._searchDebounceTimer);

  if (host.throttledFetchData && host.throttledFetchData.cancel) {
    host.throttledFetchData.cancel();
  }

  if (host.initializationTimer) {
    clearTimeout(host.initializationTimer);
    host.initializationTimer = null;
  }

  if (host._retryTimeout) {
    clearTimeout(host._retryTimeout);
    host._retryTimeout = null;
  }

  window.removeEventListener("resize", host.updateGraphViewportSize);
  host.graphResizeObserver?.disconnect();
  host.graphResizeObserver = null;
  if (host._graphViewportRaf != null) {
    window.cancelAnimationFrame(host._graphViewportRaf);
    host._graphViewportRaf = null;
  }

  if (
    host.state.featureLayer &&
    !isMapImageOwnedLayer(host.state.featureLayer)
  ) {
    try {
      host.state.featureLayer.definitionExpression = "";
    } catch (err) {
      // Layer destroyed with the map — nothing left to reset.
      graffLog("unmount:reset-definition-failed", { error: describeThrown(err) });
    }
  }
}

export const initializeTheme = (host: GraffWidgetHost): void => {
  const savedTheme =
    typeof window !== "undefined"
      ? window.localStorage?.getItem("agri_v11_app_theme")
      : null;
  const domTheme =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : null;

  let isDarkTheme = true;
  if (savedTheme !== null && savedTheme !== undefined) {
    isDarkTheme = savedTheme === "dark";
  } else if (domTheme === "light" || domTheme === "dark") {
    isDarkTheme = domTheme === "dark";
  }

  host.setState({ isDarkTheme });
};

export const handleAppLanguageChanged = (host: GraffWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const d = eventDetail<{ lang?: unknown; language?: unknown; code?: unknown }>(event);
  const raw = d.lang ?? d.language ?? d.code;
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!v) return;

  let next: AgriLanguage = "ru";
  if (v === "ru" || v === "rus" || v === "russian") next = "ru";
  else if (
    v === "uz_lat" ||
    v === "uz-lat" ||
    v === "uz_latin" ||
    v === "uz-latin" ||
    v === "uz"
  )
    next = "uz_lat";
  else if (
    v === "uz_cyr" ||
    v === "uz-cyr" ||
    v === "uz_cyrl" ||
    v === "uz-cyrl" ||
    v === "uz_cyrillic" ||
    v === "uz-cyrillic" ||
    v === "cyrillic"
  )
    next = "uz_cyr";
  else return;

  if (next === host.state.language) return;
  host.setState({ language: next });
};

export const handleThemeChange = (host: GraffWidgetHost, event: CustomEvent<{ isDarkTheme?: boolean }> | Event): void => {
  if (!host._isMounted) return;

  const detail = (event as CustomEvent<{ isDarkTheme?: boolean }>)?.detail;
  if (detail && typeof detail.isDarkTheme === "boolean") {
    const { isDarkTheme } = detail;
    host.setState({ isDarkTheme });
    return;
  }

  // Fallback when event detail is absent/incomplete.
  host.initializeTheme();
};

export const onDataSourceCreated = (host: GraffWidgetHost, ds: DataSource) => {
  const qds = ds as QueriableDataSource;
  if (typeof qds.setListenSelection === "function") {
    qds.setListenSelection(false);
  }

  host.setState({ dataSource: qds, error: null }, () => {
    host.refreshFiltersFromConfig();
    if (host.state.connectionStatus === "connected") {
      host.setState({ loading: true });
      host.fetchFilterOptions();
    }
  });
};

// 📥 Centralized: DS change => single fetch
export const onDataSourceInfoChange = (host: GraffWidgetHost, info: unknown) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;
  if (!info || typeof info !== "object") return;

  if (!Array.isArray((info as { records?: unknown }).records)) return;

  host.setState(
    {
      records: [],
      currentPage: 1,
      loading: true,
      error: null,
    },
    () => {
      host.fetchData();
    },
  );
};
