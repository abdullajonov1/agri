import type { IndicatorWidgetHost } from "../indicator-host";
import { bindMasterFilter } from "../../../../data/agri-filter-bus";
import { normalizeLanguage } from "../../../../shared/agri-language";
import { normalizeApos } from "../../../../data/agri-sql";
import { AllWidgetProps } from "jimu-core";
import type { VegetationStatsWidgetState } from "../widget";
import { MAP_CONNECTION_RETRY_MS } from "../../../../shared/map-connection-service";
import { agriVhIndicatorLog } from "../../../../gis/agri-debug-log";

// cross-iframe event bus so widgets inside builder/preview/iframe can talk
const BUS: Document = window.top?.document ?? document;

export function componentDidMount(host: IndicatorWidgetHost) {
  host._isMounted = true;

  // connection mode
  if (!host.props.config?.useApiDataSource)
    host.setState({ connectionStatus: "connecting" });
  else
    host.setState({ connectionStatus: "connected" }, () =>
      host.fetchApiData(),
    );

  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChanged);

  // keep reset support
  BUS.addEventListener("resetAllFilters", host._onReset as EventListener);
  BUS.addEventListener("resetAllWidgets", host._onReset as EventListener);

  // optional: url hydration if you still want it
  window.addEventListener("popstate", host.readFiltersFromUrl);

  // initial hydration (if url has values)
  host.readFiltersFromUrl();

  host.setupAutoRefresh();

  // theme
  host.initializeTheme();
  BUS.addEventListener(
    "agriV11ThemeToggled",
    host.handleThemeChange as EventListener,
  );
  if (BUS !== document) {
    document.addEventListener(
      "agriV11ThemeToggled",
      host.handleThemeChange as EventListener,
    );
  }

  // responsive sizing (deferred to ensure DOM is ready)
  setTimeout(() => {
    if (
      host._isMounted &&
      host._containerRef.current &&
      typeof ResizeObserver !== "undefined"
    ) {
      host._resizeObserver = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect?.width ?? 0;
        const next: "xs" | "sm" | "md" | "lg" =
          w < 180 ? "xs" : w < 260 ? "sm" : w < 340 ? "md" : "lg";
        if (next !== host.state.widgetSize)
          host.setState({ widgetSize: next });
      });
      host._resizeObserver.observe(host._containerRef.current);
    }
  }, 0);

  // init guard
  host.initializationTimer = setTimeout(
    () => host.ensureInitialization(),
    3000,
  );
}

export const handleMasterFilterChanged = (host: IndicatorWidgetHost, event: Event) => {
  if (!host._isMounted) return;
  if (host._isResetting) return;

  const d: any = (event as CustomEvent)?.detail || {};
  if (!d?.filters) return;

  // ignore self if ever dispatched (defensive)
  if (d?.source === "VegetationStatsWidget") return;

  const eventTs =
    typeof d?.meta?.timestamp === "number" && Number.isFinite(d.meta.timestamp)
      ? d.meta.timestamp
      : 0;
  const eventGen =
    typeof d?.meta?.broadcastGeneration === "number" &&
    Number.isFinite(d.meta.broadcastGeneration)
      ? d.meta.broadcastGeneration
      : 0;
  if (
    eventGen > 0 &&
    host._lastMasterFilterBroadcastGeneration > 0 &&
    eventGen < host._lastMasterFilterBroadcastGeneration
  ) {
    return;
  }
  if (
    eventTs > 0 &&
    host._lastMasterFilterTs > 0 &&
    eventTs < host._lastMasterFilterTs
  ) {
    return;
  }
  if (eventGen > 0) host._lastMasterFilterBroadcastGeneration = eventGen;
  if (eventTs > 0) host._lastMasterFilterTs = eventTs;

  const filters = d.filters || {};
  const scope = d.scope || {};

  const hasField = (k: string) =>
    Object.prototype.hasOwnProperty.call(filters, k);
  const nextLanguage = hasField("language")
    ? normalizeLanguage(
        (filters.language as string | null | undefined) ??
          host.state.language,
      )
    : host.state.language;

  // ✅ IMPORTANT: if AgriFilter locked viloyat, we must use it
  const effectiveViloyat = normalizeApos(
    scope.lockedViloyat || filters.viloyat || "",
  );

  const nextYil = (filters.yil ?? "").toString();
  const nextVil = effectiveViloyat;
  const nextTum = normalizeApos(filters.tuman || "");
  const nextTurlar = host.normalizeTurlar(
    filters.turlar,
    filters.turi || filters.tur || "",
  );
  const nextTuri = nextTurlar.length === 1 ? nextTurlar[0] : "";
  const nextVh = normalizeApos(filters.vh || "");
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
  const nextVhUniqueids: string[] | null = !nextVh
    ? null
    : normalizeIdList((event as CustomEvent).detail?.vhUniqueids);
  const nextBarField = filters.barCategoryField ?? null;
  const nextBarValue = filters.barCategoryValue ?? null;
  const nextUniqueid = filters.polygonMode
    ? String(filters.uniqueid || "").trim()
    : "";

  // NDVI date (e.g. picked by clicking a point on AgriGraff's chart) is
  // intentionally NEVER applied as a filter on this indicator — same as
  // the Vegetatsiya Holati (AgriBar) selection below. Selecting a date
  // elsewhere in the dashboard must not change what this widget shows,
  // so filters.ndviDate / filters.ndviDateLocked are not even read here.

  // VH selection filters this indicator via resolved uniqueids from Localization.
  const vhChanged =
    nextVh !== host.state.selectedVegetationStatus ||
    JSON.stringify(nextVhUniqueids) !==
      JSON.stringify(host.state.vhUniqueids);

  const filterChanged =
    nextYil !== host.state.selectedYil ||
    nextVil !== host.state.selectedViloyat ||
    nextTum !== host.state.selectedTuman ||
    nextTuri !== host.state.selectedYerToifas ||
    JSON.stringify(nextTurlar) !== JSON.stringify(host.state.selectedYerToifalari) ||
    nextUniqueid !== host.state.selectedUniqueid ||
    vhChanged;

  const languageChanged = nextLanguage !== host.state.language;

  if (nextVh || host.state.selectedVegetationStatus) {
    agriVhIndicatorLog("1-filtr-qabul", {
      widgetId: host.props?.id,
      vh: nextVh,
      prevVh: host.state.selectedVegetationStatus,
      vhUniqueidsCount: Array.isArray(nextVhUniqueids)
        ? nextVhUniqueids.length
        : nextVhUniqueids,
      vhUniqueidsSample: Array.isArray(nextVhUniqueids)
        ? nextVhUniqueids.slice(0, 3)
        : null,
      yil: nextYil,
      viloyat: nextVil,
      tuman: nextTum,
      turlar: nextTurlar,
      vhChanged,
      filterChanged,
      willRefetch: filterChanged,
    });
  }

  if (!filterChanged && !languageChanged) {
    // Still sync VH/bar tracking without a refetch.
    if (
      nextVh !== host.state.selectedVegetationStatus ||
      nextBarField !== host.state.barCategoryField ||
      nextBarValue !== host.state.barCategoryValue ||
      JSON.stringify(nextVhUniqueids) !==
        JSON.stringify(host.state.vhUniqueids)
    ) {
      void host.prepareVhJoinIds(nextVhUniqueids);
      host.setState({
        selectedVegetationStatus: nextVh,
        vhUniqueids: nextVhUniqueids,
        barCategoryField: nextBarField,
        barCategoryValue: nextBarValue,
      });
    }
    return;
  }

  if (!filterChanged && languageChanged) {
    host.setState({ language: nextLanguage });
    return;
  }

  // Mark the time of this filter event so setupAutoRefresh can avoid
  // firing a duplicate refreshData() shortly after this immediate fetch.
  host._lastFilterEventMs = Date.now();

  

  host.setState(
    {
      language: nextLanguage,
      selectedYil: nextYil,
      selectedViloyat: nextVil,
      selectedTuman: nextTum,
      selectedYerToifas: nextTuri,
      selectedYerToifalari: nextTurlar,
      selectedVegetationStatus: nextVh,
      vhUniqueids: nextVhUniqueids,
      barCategoryField: nextBarField,
      barCategoryValue: nextBarValue,
      selectedUniqueid: nextUniqueid,
      // Keep a single canonical layer for all scopes.
      // Only WHERE changes when viloyat/tuman changes.
      featureLayer:
        host._canonicalFeatureLayer ||
        host.getDefaultFeatureLayer(host.state.featureLayers),

      // Soft refresh: keep previous number visible; only cold-start uses spinner.
      loading: host.state.vegetationArea == null,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      // Adapt VH uniqueids to Agri_table_data's id style before querying —
      // vegetation ids are lower-case unbraced GUIDs and PostgreSQL string
      // equality is case-sensitive, so a raw IN (...) join can miss rows.
      void host.prepareVhJoinIds(nextVhUniqueids).finally(() => {
        if (!host._isMounted) return;
        host.refreshData();
      });
      setTimeout(() => {
        if (host._isMounted)
          host.setState({ isHandlingExternalEvent: false });
      }, 150);
    },
  );
};

export function componentWillUnmount(host: IndicatorWidgetHost) {
  host._isMounted = false;

  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;

  BUS.removeEventListener("resetAllFilters", host._onReset as EventListener);
  BUS.removeEventListener("resetAllWidgets", host._onReset as EventListener);

  window.removeEventListener("popstate", host.readFiltersFromUrl);
  BUS.removeEventListener(
    "agriV11ThemeToggled",
    host.handleThemeChange as EventListener,
  );
  if (BUS !== document) {
    document.removeEventListener(
      "agriV11ThemeToggled",
      host.handleThemeChange as EventListener,
    );
  }

  if (host._resizeObserver) {
    host._resizeObserver.disconnect();
    host._resizeObserver = null;
  }

  if (host.throttledFetchData?.cancel) host.throttledFetchData.cancel();
  if (host.initializationTimer) clearTimeout(host.initializationTimer);
  if (host.refreshTimer) clearInterval(host.refreshTimer);

  if (host._abortController) {
    host._abortController.abort();
    host._abortController = null;
  }
}

export function componentDidUpdate(host: IndicatorWidgetHost, prevProps: AllWidgetProps<any>, prevState: VegetationStatsWidgetState) {
  const { connectionStatus, mapConnectionAttempts } = host.state;
  const { useMapWidgetIds, config } = host.props;

  if (prevProps.config !== config) {
    if (prevProps.config?.useApiDataSource !== config?.useApiDataSource) {
      if (config?.useApiDataSource) {
        host.setState({ connectionStatus: "connected" }, () =>
          host.fetchApiData(),
        );
      } else {
        host.setState({ connectionStatus: "connecting" });
      }
    }
    host.setupAutoRefresh();
  }

  if (
    !config?.useApiDataSource &&
    connectionStatus === "connecting" &&
    useMapWidgetIds &&
    useMapWidgetIds.length > 0 &&
    !host.state.activeMapView &&
    mapConnectionAttempts !== prevState.mapConnectionAttempts
  ) {
    if (mapConnectionAttempts < host.MAX_CONNECTION_ATTEMPTS) {
      setTimeout(() => {
        
        host.setState((ps) => ({
          mapConnectionAttempts: ps.mapConnectionAttempts + 1,
        }));
      }, MAP_CONNECTION_RETRY_MS);
    } else {
      host.setState({ connectionStatus: "failed" });
    }
  }
}

export const handleExternalCategory = async (host: IndicatorWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  const nextTuri = normalizeApos(
    d.turi || d.tur || d.category || d.yerToifas || "",
  );
  const nextYil = (d.yil ?? host.state.selectedYil ?? "").toString();
  const nextVil = normalizeApos(
    d.viloyat ?? host.state.selectedViloyat ?? "",
  );
  const nextTum = normalizeApos(
    d.tuman ?? host.state.selectedTuman ?? "",
  );

  host.setState(
    {
      selectedYil: nextYil,
      selectedViloyat: nextVil,
      selectedTuman: nextTum,
      selectedYerToifas: nextTuri,
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleConstructionYearChanged = (host: IndicatorWidgetHost, event: any) => {
  if (host._isResetting) return;
  const { detail } = event || {};
  if (detail?.source === "VegetationStatsWidget") return;

  host.setState(
    {
      selectedYil: detail?.year ? detail.year.toString() : "",
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleRegionChange = (host: IndicatorWidgetHost, event: any): void => {
  if (host._isResetting) return;
  if (!event?.detail) return;

  const { viloyat, tuman, source } = event.detail;
  if (source === "VegetationStatsWidget") return;

  host.setState(
    {
      selectedViloyat: normalizeApos(viloyat || ""),
      selectedTuman: normalizeApos(tuman || ""),
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleYilChange = (host: IndicatorWidgetHost, event: any): void => {
  if (host._isResetting) return;
  if (!event?.detail) return;

  const { yil, source } = event.detail;
  if (source === "VegetationStatsWidget") return;

  host.setState(
    {
      selectedYil: yil ? yil.toString() : "",
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleWaterSupplyFilterChange = (host: IndicatorWidgetHost, event: CustomEvent) => {
  if (host._isResetting) return;

  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  const now = Date.now();
  if (now - host.state.lastFilterEventTimestamp < 200) return;

  // ✅ CHANGED: support turi + old tur
  const turi = d.turi || d.tur || d.yerToifas || "";

  host.setState(
    {
      selectedViloyat: normalizeApos(d.massivNom || d.viloyat || ""),
      selectedTuman: normalizeApos(d.tumanNomi || d.tuman || ""),
      selectedYil: d.yil || "",
      selectedYerToifas: normalizeApos(turi),
      loading: true,
      lastFilterEventTimestamp: now,
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleCategorySelection = (host: IndicatorWidgetHost, event: CustomEvent) => {
  if (host._isResetting) return;

  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  // ✅ CHANGED: support turi + old tur
  const turi = d.turi || d.tur || d.category || "";

  host.setState(
    {
      selectedYerToifas: normalizeApos(turi),
      selectedYil: d.yil || host.state.selectedYil,
      selectedViloyat: normalizeApos(
        d.viloyat || host.state.selectedViloyat,
      ),
      selectedTuman: normalizeApos(d.tuman || host.state.selectedTuman),
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleKadastrFiltersChanged = (host: IndicatorWidgetHost, event: any) => {
  if (host._isResetting) return;

  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  // ✅ CHANGED: support turi + old tur
  const turi = d.turi || d.tur || "";

  host.setState(
    {
      selectedViloyat: normalizeApos(d.viloyat || ""),
      selectedTuman: normalizeApos(d.tuman || ""),
      selectedYil: d.yil || "",
      selectedYerToifas: normalizeApos(turi),
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleKadastrFiltersReset = (host: IndicatorWidgetHost) =>
  host._onReset();

export const handleVegetationStatusChange = (host: IndicatorWidgetHost, event: CustomEvent) => {
  if (host._isResetting) return;

  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  host.setState(
    {
      selectedVegetationStatus: d.status || d.vh || "",
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const handleCropTypeChange = (host: IndicatorWidgetHost, event: CustomEvent) => {
  if (host._isResetting) return;

  const d = event?.detail || {};
  if (d.source === "VegetationStatsWidget") return;

  host.setState(
    {
      selectedCropType: normalizeApos(d.cropType || d.ekin_turi || ""),
      loading: true,
      lastFilterEventTimestamp: Date.now(),
      isHandlingExternalEvent: true,
    },
    () => {
      host.refreshData();
      setTimeout(
        () =>
          host._isMounted &&
          host.setState({ isHandlingExternalEvent: false }),
        200,
      );
    },
  );
};

export const refreshData = (host: IndicatorWidgetHost) => {
  if (host.props.config?.useApiDataSource) {
    if (!host.shouldFetchForViloyat()) {
      // Keep the spinner until Localization publishes a year — do not
      // flash "-" / empty between map-connect and the first aggregate.
      host.setState({
        loading: true,
        error: null,
        vegetationArea: null,
        totalArea: null,
        featureCount: 0,
      });
      return;
    }
    host.fetchApiData();
  } else {
    if (host.state.connectionStatus === "connected") {
      if (!host.shouldFetchForViloyat()) {
        host.setState({
          loading: true,
          error: null,
          vegetationArea: null,
          totalArea: null,
          featureCount: 0,
        });
        return;
      }
      host.throttledFetchData();
    } else {
      host.setState({ loading: true });
      setTimeout(() => {
        if (
          host._isMounted &&
          host.state.connectionStatus === "connected" &&
          host.shouldFetchForViloyat()
        )
          host.throttledFetchData();
      }, 1000);
    }
  }
};

export function readFiltersFromUrl(host: IndicatorWidgetHost): void {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    const yil = urlParams.get("yil") || "";
    const viloyat = urlParams.get("viloyat") || "";
    const tuman = urlParams.get("tuman") || "";
    const turi = urlParams.get("turi") || urlParams.get("tur") || "";
    const vh = urlParams.get("vh") || "";
    const ekin = urlParams.get("ekin_turi") || "";

    const nextVil = normalizeApos(viloyat);
    const nextTum = normalizeApos(tuman);
    const nextTuri = normalizeApos(turi);

    const changed =
      yil !== host.state.selectedYil ||
      nextVil !== host.state.selectedViloyat ||
      nextTum !== host.state.selectedTuman ||
      nextTuri !== host.state.selectedYerToifas ||
      normalizeApos(vh) !== host.state.selectedVegetationStatus ||
      normalizeApos(ekin) !== host.state.selectedCropType;

    if (!changed) return;

    host.setState(
      {
        selectedYil: yil,
        selectedViloyat: nextVil,
        selectedTuman: nextTum,
        selectedYerToifas: nextTuri,
        selectedVegetationStatus: normalizeApos(vh),
        selectedCropType: normalizeApos(ekin),
      },
      () => {
        // if something is already connected, refresh immediately
        if (host.props.config?.useApiDataSource) host.fetchApiData();
        else if (host.state.connectionStatus === "connected")
          host.throttledFetchData();
      },
    );
  } catch (error) {

  }
}
