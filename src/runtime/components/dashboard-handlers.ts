import type { DashboardWidgetHost } from "../dashboard-host";
import { setAccessConfig } from "../../shared/agri-access-config";
import { setAgriServiceUrls } from "../../shared/agri-service-urls";
import { getAppStore, AppMode, React, Immutable } from "jimu-core";
import { agroV5Log } from "../../gis/agri-debug-log";
import type { AllWidgetProps } from "jimu-core";
import type { IMConfig, AgriPopupConfig, IndicatorChildConfig } from "../../config";
import type { AgriDashboardState, ChildSuffix } from "../widget";
import { clearDashboardCaches } from "../../data/agri-dashboard-cache-clear";
import { resolveJimuMapView, isMapViewReady, MAP_VIEW_WATCH_MAX_ATTEMPTS, MAP_VIEW_WATCH_INTERVAL_MS } from "../../shared/map-connection-service";

const mountedAgriDashboardIds = new Set<string>();

/**
 * Access + service URL module state. Idempotent; safe on every config change.
 * Kept out of render() (React purity) but applied in constructor so the first
 * paint of Localization/Graff already sees the correct access WHERE.
 */
export const syncConfigSideEffects = (host: DashboardWidgetHost): void => {
  setAccessConfig(host.props.config?.accessConfig);
  setAgriServiceUrls((host.props.config as any)?.serviceUrls);
};

export function isBuilderDesignMode(host: DashboardWidgetHost): boolean {
  return getAppStore().getState().appRuntimeInfo?.appMode === AppMode.Design;
}

export function getUiLanguage(host: DashboardWidgetHost): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const fromStorage =
      localStorage.getItem("app_lang") ||
      localStorage.getItem("agri_app_lang");
    return String(fromUrl || fromStorage || "uz_lat");
  } catch {
    return "uz_lat";
  }
}

export function componentDidMount(host: DashboardWidgetHost): void {
  // Re-apply in case Builder mutated config between construct and mount.
  host.syncConfigSideEffects();
  // The Builder settings surface only needs the lightweight render preview.
  // Do not start map retries, document-wide observers or portal layout work.
  if (host.isBuilderDesignMode()) return;

  if (mountedAgriDashboardIds.size > 0) {
    agroV5Log("AgriDashboard:single-instance-warn", {
      existingIds: Array.from(mountedAgriDashboardIds),
      widgetId: host.props.id,
    });
  }
  mountedAgriDashboardIds.add(String(host.props.id));

  document.documentElement.classList.add("agri-dashboard-active");
  host.setupMapSlotObserver();
  host.scheduleMapSlotLayout(true);
  host.scheduleMapLoadingWatchers();
  document.addEventListener(
    "agriMapSurfaceLoading",
    host.handleMapSurfaceLoading as EventListener,
  );
  document.addEventListener(
    "agriMapNoData",
    host.handleMapNoData as EventListener,
  );
  document.addEventListener(
    "agriMapPopupVisibility",
    host.handleMapPopupVisibility as EventListener,
  );
  requestAnimationFrame(() => {
    host.ensurePortalHost();
    host.forceUpdate(() => {
      host.syncIndicatorOverlayLayout();
    });
  });
}

export function componentDidUpdate(host: DashboardWidgetHost, prevProps: AllWidgetProps<IMConfig>, prevState: AgriDashboardState): void {
  if (prevProps.config !== host.props.config) {
    host.syncConfigSideEffects();
  }
  if (host.isBuilderDesignMode()) return;
  host.ensurePortalHost();
  host.ensureLayoutObservers();

  const prevCfg = prevProps.config as any;
  const nextCfg = host.props.config as any;
  const layoutSizeChanged =
    prevCfg?.leftPanelWidthPercent !== nextCfg?.leftPanelWidthPercent ||
    prevCfg?.bottomRowFraction !== nextCfg?.bottomRowFraction;
  const layoutChromeChanged =
    prevState.mapPopupOpen !== host.state.mapPopupOpen ||
    prevState.mapPopupPinned !== host.state.mapPopupPinned ||
    prevState.indicatorsOpen !== host.state.indicatorsOpen ||
    prevState.indicatorsAnimPhase !== host.state.indicatorsAnimPhase ||
    prevState.mapLoading !== host.state.mapLoading ||
    prevState.mapSurfaceLoading !== host.state.mapSurfaceLoading;
  // Never resize on every React render — that used to couple with map DOM
  // paints and keep Chromium at ~100% CPU.
  if (layoutSizeChanged || layoutChromeChanged) {
    host.scheduleMapSlotLayout(true);
  }

  // Only re-bind map watchers when the active map id or loading state changes.
  const nextMap = String(host.getActiveMapWidgetId() || "");
  if (
    nextMap !== host.lastMapWatchWidgetId ||
    prevState.mapLoading !== host.state.mapLoading
  ) {
    host.scheduleMapLoadingWatchers();
  }
  if (
    prevState.indicatorsOpen !== host.state.indicatorsOpen ||
    prevState.indicatorsAnimPhase !== host.state.indicatorsAnimPhase
  ) {
    return;
  }
  host.syncIndicatorOverlayLayout();
}

export const toggleIndicatorsDrawer = (host: DashboardWidgetHost, event: React.MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
  event.stopPropagation();

  const now = Date.now();
  if (now - host.lastIndicatorToggleAt < 750) return;
  host.lastIndicatorToggleAt = now;

  const opening = !host.state.indicatorsOpen;
  if (host.indicatorAnimTimer) {
    clearTimeout(host.indicatorAnimTimer);
    host.indicatorAnimTimer = null;
  }

  host.setState({
    indicatorsOpen: opening,
    indicatorsAnimPhase: opening ? "expanding" : "collapsing",
  });

  host.indicatorAnimTimer = setTimeout(
    () => {
      host.indicatorAnimTimer = null;
      if (!host.dashboardRootRef.current) return;
      host.setState({
        indicatorsAnimPhase: opening ? "expanded" : "collapsed",
      });
    },
    opening ? 780 : 720,
  );
};

export function componentWillUnmount(host: DashboardWidgetHost): void {
  mountedAgriDashboardIds.delete(String(host.props.id));

  if (host.indicatorAnimTimer) {
    clearTimeout(host.indicatorAnimTimer);
    host.indicatorAnimTimer = null;
  }
  document.documentElement.classList.remove("agri-dashboard-active");
  document.removeEventListener(
    "agriMapSurfaceLoading",
    host.handleMapSurfaceLoading as EventListener,
  );
  document.removeEventListener(
    "agriMapNoData",
    host.handleMapNoData as EventListener,
  );
  document.removeEventListener(
    "agriMapPopupVisibility",
    host.handleMapPopupVisibility as EventListener,
  );
  host.dashboardRootRef.current?.classList.remove("agri-popup-open");
  host.dashboardRootRef.current?.classList.remove("agri-popup-pinned");
  host.dashboardResizeObserver?.disconnect();
  host.dashboardResizeObserver = null;
  host.layoutObserversReady = false;
  window.removeEventListener("resize", host.onWindowResize);
  if (host.mapLayoutRaf) cancelAnimationFrame(host.mapLayoutRaf);
  if (host.mapSurfaceLoadingSafetyTimer) {
    clearTimeout(host.mapSurfaceLoadingSafetyTimer);
    host.mapSurfaceLoadingSafetyTimer = null;
  }
  host.detachMapLoadingWatchers();
  host.clearIndicatorOverlayLayout();
  host.removePortalHost();
  clearDashboardCaches();
}

export const handleMapSurfaceLoading = (host: DashboardWidgetHost, event: Event): void => {
  const detail = (event as CustomEvent)?.detail || {};
  const loading = !!detail.loading;
  if (host.mapSurfaceLoadingSafetyTimer) {
    clearTimeout(host.mapSurfaceLoadingSafetyTimer);
    host.mapSurfaceLoadingSafetyTimer = null;
  }
  if (loading) {
    // Vegetation TIFF can take longer than map redraw; keep overlay up to
    // the export-image client timeout (~25s), otherwise 12s for map ops.
    const reason = String(detail.reason || "");
    const safetyMs =
      reason === "vegetation-raster" || reason === "vegetation-raster-cancel"
        ? 28000
        : 12000;
    host.mapSurfaceLoadingSafetyTimer = setTimeout(() => {
      host.mapSurfaceLoadingSafetyTimer = null;
      if (host.state.mapSurfaceLoading) {
        host.setState({ mapSurfaceLoading: false });
      }
    }, safetyMs);
  }
  if (loading && host.state.mapNoData) {
    host.setState({ mapSurfaceLoading: true, mapNoData: false });
  } else if (host.state.mapSurfaceLoading !== loading) {
    host.setState({ mapSurfaceLoading: loading });
  }
};

export const handleMapNoData = (host: DashboardWidgetHost, event: Event): void => {
  const detail = (event as CustomEvent)?.detail || {};
  const mapNoData = !!detail.noData;
  if (host.state.mapNoData !== mapNoData) {
    host.setState({ mapNoData });
  }
};

export const handleMapPopupVisibility = (host: DashboardWidgetHost, event: Event): void => {
  const detail = (event as CustomEvent)?.detail || {};
  const open = !!detail.open;
  // Dock NDVI left of popup only when explicitly pinned.
  const nextPinned = open && detail.pinned === true;
  const openChanged = host.state.mapPopupOpen !== open;
  const pinChanged = host.state.mapPopupPinned !== nextPinned;

  if (!openChanged && !pinChanged) {
    if (open) host.syncIndicatorOverlayLayout();
    return;
  }

  // Popup open → auto-collapse indicator drawer so it doesn't cover the map/popup.
  const shouldCollapseIndicators =
    open &&
    openChanged &&
    (host.state.indicatorsOpen ||
      host.state.indicatorsAnimPhase === "expanded" ||
      host.state.indicatorsAnimPhase === "expanding");

  if (shouldCollapseIndicators && host.indicatorAnimTimer) {
    clearTimeout(host.indicatorAnimTimer);
    host.indicatorAnimTimer = null;
  }

  host.setState(
    ({
      mapPopupOpen: open,
      mapPopupPinned: nextPinned,
      ...(shouldCollapseIndicators
        ? {
            indicatorsOpen: false,
            indicatorsAnimPhase: "collapsing" as const,
          }
        : {}),
    } as any),
    () => {
      host.dashboardRootRef.current?.classList.toggle("agri-popup-open", open);
      host.dashboardRootRef.current?.classList.toggle(
        "agri-popup-pinned",
        nextPinned,
      );
      host.syncIndicatorOverlayLayout();
      if (open) {
        requestAnimationFrame(() => host.syncIndicatorOverlayLayout());
        window.setTimeout(() => host.syncIndicatorOverlayLayout(), 80);
      }
      if (shouldCollapseIndicators) {
        host.indicatorAnimTimer = setTimeout(() => {
          host.indicatorAnimTimer = null;
          if (!host.dashboardRootRef.current) return;
          host.setState({ indicatorsAnimPhase: "collapsed" });
        }, 720);
      }
    },
  );
};

export function createPortalHost(dashboardHost: DashboardWidgetHost): HTMLElement {
  const surface = dashboardHost.findSharedLayoutSurface() || document.body;
  let host = surface.querySelector(
    ":scope > .agri-dashboard-portal-host",
  ) as HTMLElement | null;

  if (!host) {
    host = document.createElement("div");
    host.className = "agri-dashboard-portal-host";
    surface.appendChild(host);
  } else if (host.parentElement !== surface) {
    surface.appendChild(host);
  }

  if (surface !== document.body) {
    const surfaceStyle = getComputedStyle(surface);
    if (surfaceStyle.position === "static") {
      surface.style.setProperty("position", "relative");
    }
  }

  return host;
}

export function ensurePortalHost(host: DashboardWidgetHost): HTMLElement {
  if (!host.portalHost || !host.portalHost.isConnected) {
    host.portalHost = host.createPortalHost();
    host.portalReady = true;
  }
  return host.portalHost;
}

export function removePortalHost(host: DashboardWidgetHost): void {
  host.portalHost?.remove();
  host.portalHost = null;
  host.portalReady = false;
}

export function bringPortalHostToFront(dashboardHost: DashboardWidgetHost): void {
  const host = dashboardHost.portalHost;
  const surface = dashboardHost.findSharedLayoutSurface();
  // Only move when not already last — appendChild on an existing last child
  // still fires MutationObserver / layout work for no visual gain.
  if (
    host &&
    surface &&
    host.parentElement === surface &&
    surface.lastElementChild !== host
  ) {
    surface.appendChild(host);
  }
}

export function toPlainConfig(host: DashboardWidgetHost): Record<string, unknown> {
  const cfg = host.props.config;
  if (cfg && typeof (cfg as any).asMutable === "function") {
    return (cfg as any).asMutable({ deep: true });
  }
  return { ...(cfg as any) };
}

export function toPlainPopup(host: DashboardWidgetHost, value: unknown): AgriPopupConfig {
  if (!value) return {};
  if (typeof (value as any).asMutable === "function") {
    return (value as any).asMutable({ deep: true });
  }
  return { ...(value as AgriPopupConfig) };
}

export function getIndicatorConfig(host: DashboardWidgetHost, baseConfig: Record<string, unknown>): Record<string, unknown> {
  const indicator = (baseConfig.indicator || {}) as IndicatorChildConfig;
  const endpoint = String(
    indicator.apiEndpoint || indicator.apiUrl || "",
  ).trim();
  const useApiDataSource =
    indicator.useApiDataSource === true && endpoint.length > 0;

  return {
    useApiDataSource,
    apiEndpoint: endpoint,
    responseField: indicator.responseField || "total",
    statOperation: indicator.statOperation || "sum",
    attributeField: indicator.attributeField || "maydon",
    label: indicator.label || "Ekin maydonlari",
    unitLabel: indicator.unitLabel || "ga",
    decimalPlaces: indicator.decimalPlaces ?? 0,
    excludeZeroValues: indicator.excludeZeroValues !== false,
    mapOverlayMode: true,
  };
}

export function getPopupConfig(host: DashboardWidgetHost, baseConfig: Record<string, unknown>): Record<string, unknown> {
  const popup = host.toPlainPopup(baseConfig.agriPopup);
  return {
    fieldsToShow: popup.fieldsToShow || [],
    titleField: popup.titleField || "",
    labels: popup.labels || {},
    settings: {
      zoomToSelection: popup.settings?.zoomToSelection !== false,
      showMapPopup: !!popup.settings?.showMapPopup,
      showAttachments: popup.settings?.showAttachments !== false,
    },
    selectedFieldsMap: popup.selectedFieldsMap,
    chartEnabled: !!popup.chartEnabled,
    chartType: popup.chartType || "bar",
    chartTitle: popup.chartTitle || "",
    chartFields: popup.chartFields || [],
    chartColor: popup.chartColor || "#00a8e8",
  };
}

export function childProps(host: DashboardWidgetHost, suffix: ChildSuffix, config?: Record<string, unknown>): AllWidgetProps<any> {
  const mapWidgetId = host.getActiveMapWidgetId();
  const mapIds = Immutable.from([mapWidgetId]);
  const webMapDataSourceId = String(
    (host.toPlainConfig() as any).webMapDataSourceId || "",
  );
  const dataSources = (host.props.useDataSources as any)?.asMutable
    ? (host.props.useDataSources as any).asMutable({ deep: true })
    : Array.from((host.props.useDataSources as any) || []);
  const featureDataSources = dataSources.filter(
    (source: any) => source?.dataSourceId !== webMapDataSourceId,
  );

  return {
    ...host.props,
    id: `${host.props.id}-${suffix}`,
    config: config || host.toPlainConfig(),
    useMapWidgetIds: mapIds,
    useDataSources: Immutable.from(featureDataSources),
  };
}

export function getStableIndicatorChildProps(host: DashboardWidgetHost, indicatorConfig: Record<string, unknown>, baseConfig: Record<string, unknown>): {
    indicator: AllWidgetProps<any>;
    yield: AllWidgetProps<any>;
    unused: AllWidgetProps<any>;
    reserve: AllWidgetProps<any>;
  } {
  const mapWidgetId = host.getActiveMapWidgetId();
  const webMapDataSourceId = String(
    (baseConfig as any).webMapDataSourceId || "",
  );
  const dataSources = (host.props.useDataSources as any)?.asMutable
    ? (host.props.useDataSources as any).asMutable({ deep: true })
    : Array.from((host.props.useDataSources as any) || []);
  const featureIds = dataSources
    .filter((source: any) => source?.dataSourceId !== webMapDataSourceId)
    .map((source: any) => String(source?.dataSourceId || ""))
    .join(",");
  const signature = [
    host.props.id,
    mapWidgetId,
    webMapDataSourceId,
    featureIds,
    JSON.stringify(indicatorConfig || {}),
    JSON.stringify({
      useApiDataSource: (baseConfig as any)?.useApiDataSource,
      apiEndpoint: (baseConfig as any)?.apiEndpoint,
      apiUrl: (baseConfig as any)?.apiUrl,
    }),
  ].join("|");

  if (
    host.indicatorChildPropsCache &&
    host.indicatorChildPropsCache.signature === signature
  ) {
    return host.indicatorChildPropsCache;
  }

  const next = {
    signature,
    indicator: host.childProps("indicator", indicatorConfig),
    yield: host.childProps("indicator-yield", baseConfig),
    unused: host.childProps("indicator-unused-land", baseConfig),
    reserve: host.childProps("indicator-reserve-land", baseConfig),
  };
  host.indicatorChildPropsCache = next;
  return next;
}

export function getLeftPanelWidth(host: DashboardWidgetHost): string {
  const raw = Number(host.props.config?.leftPanelWidthPercent ?? 26);
  const pct = Number.isFinite(raw) ? Math.min(45, Math.max(18, raw)) : 26;
  // Slight bump from base 25%; kept smaller than the earlier +1cm enlarge.
  return `calc(${pct}% + 0.35cm)`;
}

export function getRowFrValues(host: DashboardWidgetHost): { top: number; bottom: number } {
  const raw = Number(host.props.config?.bottomRowFraction ?? 38);
  const bottom = Number.isFinite(raw)
    ? Math.min(55, Math.max(28, raw))
    : 38;
  return { top: 100 - bottom, bottom };
}

export function getActiveMapWidgetId(host: DashboardWidgetHost): string {
  return `${host.props.id}-embedded-map`;
}

export function getActiveJimuMapView(host: DashboardWidgetHost): any | null {
  return resolveJimuMapView(host.getActiveMapWidgetId());
}

export function detachMapLoadingWatchers(host: DashboardWidgetHost): void {
  host.mapReadyWatchHandle?.remove?.();
  host.mapUpdatingWatchHandle?.remove?.();
  host.mapReadyWatchHandle = null;
  host.mapUpdatingWatchHandle = null;
  host.watchedMapView = null;
  if (host.mapLoadingRetryTimer) {
    clearTimeout(host.mapLoadingRetryTimer);
    host.mapLoadingRetryTimer = null;
  }
}

export function setMapLoading(host: DashboardWidgetHost, mapLoading: boolean): void {
  if (host.state.mapLoading !== mapLoading) {
    host.setState({ mapLoading });
  }
}

export function getMapLoadingState(host: DashboardWidgetHost, jimuMapView: any | null): boolean {
  if (!host.getActiveMapWidgetId()) return false;
  const view = jimuMapView?.view;
  if (!view) return !host.embeddedMapReady;
  // Initial boot only — ignore interactive zoom/pan redraws (`updating`).
  return !isMapViewReady(jimuMapView);
}

export const updateMapLoadingState = (host: DashboardWidgetHost): void => {
  host.setMapLoading(host.getMapLoadingState(host.getActiveJimuMapView()));
};

export function attachMapLoadingWatchers(host: DashboardWidgetHost): void {
  const mapWidgetId = host.getActiveMapWidgetId();
  if (!mapWidgetId) {
    host.detachMapLoadingWatchers();
    host.mapViewWatchAttempts = 0;
    host.lastMapWatchWidgetId = "";
    host.setMapLoading(false);
    return;
  }

  if (mapWidgetId !== host.lastMapWatchWidgetId) {
    host.mapViewWatchAttempts = 0;
    host.lastMapWatchWidgetId = mapWidgetId;
  }

  const jimuMapView = host.getActiveJimuMapView();
  const view = jimuMapView?.view as any;
  if (!view) {
    if (host.mapViewWatchAttempts >= MAP_VIEW_WATCH_MAX_ATTEMPTS) {
      host.detachMapLoadingWatchers();
      host.setMapLoading(false);
      return;
    }
    host.mapViewWatchAttempts += 1;
    host.detachMapLoadingWatchers();
    host.setMapLoading(true);
    host.scheduleMapLoadingWatchers(MAP_VIEW_WATCH_INTERVAL_MS);
    return;
  }

  host.mapViewWatchAttempts = 0;

  if (host.watchedMapView === view) {
    host.updateMapLoadingState();
    return;
  }

  host.detachMapLoadingWatchers();
  host.watchedMapView = view;
  const update = host.updateMapLoadingState;
  if (typeof view.watch === "function") {
    host.mapReadyWatchHandle = view.watch("ready", update);
    // Do not watch `updating` — manual zoom/pan would flash the map loader.
  }
  if (typeof view.when === "function") {
    void view.when(update, update);
  }
  update();
}

export const scheduleMapLoadingWatchers = (host: DashboardWidgetHost, delay = 0): void => {
  if (host.mapLoadingRetryTimer) clearTimeout(host.mapLoadingRetryTimer);
  host.mapLoadingRetryTimer = setTimeout(() => {
    host.mapLoadingRetryTimer = null;
    host.attachMapLoadingWatchers();
  }, delay);
};

export function getDashboardLoadingState(host: DashboardWidgetHost): boolean {
  const root = host.dashboardRootRef.current;
  if (!root) return false;
  return !!root.querySelector(
    [
      ".agri-v11-regional-stats-loading-container",
      ".land-category-loading-container",
      ".land-category-chart-container--loading",
      ".kadastr-status-loading-container",
      ".vegetation-graph-container--loading",
      ".construction-years-loading-container",
      ".agri-status-root--loading",
      ".loading-indicator",
    ].join(","),
  );
}

/** Kept for optional future UI; not driven by document MutationObserver. */
export function updateDashboardLoadingState(host: DashboardWidgetHost): void {
  const dashboardLoading = host.getDashboardLoadingState();
  if (host.state.dashboardLoading !== dashboardLoading) {
    host.setState({ dashboardLoading });
  }
}

export const onWindowResize = (host: DashboardWidgetHost): void => {
  host.scheduleMapSlotLayout(true);
};

export function ensureLayoutObservers(host: DashboardWidgetHost): void {
  if (!host.resizeListenerAttached) {
    window.addEventListener("resize", host.onWindowResize, {
      passive: true,
    });
    host.resizeListenerAttached = true;
  }
  if (typeof ResizeObserver === "undefined") {
    return;
  }

  const root = host.dashboardRootRef.current;
  const slot = host.mapSlotRef.current;
  if (!root && !slot) return;

  // Create observer once; may attach root before slot exists on first paint.
  if (!host.dashboardResizeObserver) {
    host.dashboardResizeObserver = new ResizeObserver(() => {
      host.scheduleMapSlotLayout(false);
    });
  }

  // Observe only dashboard chrome size — never document.body. ArcGIS tile
  // paints mutate the map DOM constantly; a document MutationObserver that
  // called view.resize() created a CPU spin loop.
  if (root) {
    try {
      host.dashboardResizeObserver.observe(root);
    } catch {
      /* already observing */
    }
  }
  if (slot) {
    try {
      host.dashboardResizeObserver.observe(slot);
    } catch {
      /* already observing */
    }
  }
  // Ready only when the map slot is watched — otherwise first paint with
  // root-only would permanently skip slot size changes.
  if (root && slot) {
    host.layoutObserversReady = true;
  }
}

export function setupMapSlotObserver(host: DashboardWidgetHost): void {
  host.ensureLayoutObservers();
}

/**
 * Ask the MapView to reflow. Skips when the map-slot pixel size is unchanged
 * unless `force` (window resize, first mount, map ready).
 */
export const scheduleMapSlotLayout = (host: DashboardWidgetHost, force = false): void => {
  if (host.mapLayoutRaf) cancelAnimationFrame(host.mapLayoutRaf);
  host.mapLayoutRaf = requestAnimationFrame(() => {
    host.mapLayoutRaf = 0;
    const slot = host.mapSlotRef.current;
    if (slot) {
      const w = Math.round(slot.clientWidth);
      const h = Math.round(slot.clientHeight);
      if (
        !force &&
        w === host.lastMapSlotSize.w &&
        h === host.lastMapSlotSize.h
      ) {
        return;
      }
      host.lastMapSlotSize = { w, h };
    }
    const view = host.getActiveJimuMapView()?.view as
      | { resize?: () => void }
      | undefined;
    view?.resize?.();
  });
};

export function findSharedLayoutSurface(host: DashboardWidgetHost): HTMLElement | null {
  const dashboardRoot = host.dashboardRootRef.current;
  if (!dashboardRoot) return null;

  const dashboardItem = dashboardRoot.closest(
    ".layout-item, .builder-layout-item",
  ) as HTMLElement | null;
  return dashboardItem?.parentElement || null;
}

export function readDashboardCssPx(host: DashboardWidgetHost, variable: string, fallback: number): number {
  const root = host.dashboardRootRef.current;
  if (!root) return fallback;
  const raw = getComputedStyle(root).getPropertyValue(variable).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function applyIndicatorOverlayBounds(dashboardHost: DashboardWidgetHost, slotEl: HTMLElement, overlayEl: HTMLElement): void {
  const slotRect = slotEl.getBoundingClientRect();
  const surface = dashboardHost.findSharedLayoutSurface();
  const host = overlayEl.parentElement;
  const onLayoutSurface =
    !!surface &&
    !!host &&
    (host === surface || host.parentElement === surface);

  const topOffset = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-top",
    10,
  );
  const leftOffset = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-left",
    10,
  );
  const height = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-height",
    58,
  );

  let top = slotRect.top + topOffset;
  let left = slotRect.left + leftOffset;
  let positionMode: "fixed" | "absolute" = "fixed";

  if (onLayoutSurface && surface) {
    const surfaceRect = surface.getBoundingClientRect();
    top = slotRect.top - surfaceRect.top + surface.scrollTop + topOffset;
    left = slotRect.left - surfaceRect.left + surface.scrollLeft + leftOffset;
    positionMode = "absolute";
  }

  const entries: Array<[string, string]> = [
    ["position", positionMode],
    ["top", `${top}px`],
    ["left", `${left}px`],
    ["height", `${height}px`],
    ["min-height", `${height}px`],
    ["max-height", `${height}px`],
    ["right", "auto"],
    ["bottom", "auto"],
    ["margin", "0"],
    ["padding", "0"],
    ["transform", "none"],
    ["z-index", "40"],
    ["box-sizing", "border-box"],
  ];

  entries.forEach(([key, value]) => {
    overlayEl.style.setProperty(key, value, "important");
  });
  overlayEl.style.removeProperty("width");
  overlayEl.style.removeProperty("min-width");
  overlayEl.style.removeProperty("max-width");
  overlayEl.style.removeProperty("overflow");
  overlayEl.style.removeProperty("pointer-events");
  overlayEl.classList.add("agri-dashboard-managed-indicator");
}

export function applyDateIndexOverlayBounds(host: DashboardWidgetHost, slotEl: HTMLElement, overlayEl: HTMLElement): void {
  const slotRect = slotEl.getBoundingClientRect();
  const bottomOffset = host.readDashboardCssPx(
    "--agri-dashboard-date-index-bottom",
    12,
  );
  const popupWidth = host.readDashboardCssPx(
    "--agri-dashboard-popup-width",
    340,
  );
  const popupInsetX = host.readDashboardCssPx(
    "--agri-dashboard-popup-inset-x",
    16,
  );
  const dateIndexGap = host.readDashboardCssPx(
    "--agri-dashboard-date-index-gap",
    8,
  );
  const cardWidth = host.readDashboardCssPx(
    "--agri-dashboard-date-index-width",
    210,
  );
  const navSize = host.readDashboardCssPx(
    "--agri-dashboard-date-index-nav-size",
    34,
  );
  const navGap = host.readDashboardCssPx(
    "--agri-dashboard-date-index-nav-gap",
    6,
  );
  const hasDayNav = !!overlayEl.querySelector(
    ".agri-date-index-shell.has-day-nav",
  );
  const width = hasDayNav
    ? cardWidth + 2 * (navSize + navGap)
    : cardWidth;
  const height = host.readDashboardCssPx(
    "--agri-dashboard-date-index-height",
    66,
  );

  // Always use fixed + high z-index so the card is never trapped under the
  // map-slot stacking context (popup lives in a higher portal layer).
  // Default: bottom-right of the map slot.
  let top = slotRect.bottom - height - bottomOffset;
  let left = slotRect.right - width - 10;
  let zIndex = "45";

  // Left of popup only when pinned; unpinned keeps bottom-right.
  // In pin mode also sit at the bottom edge of the popup (left of it).
  if (host.state.mapPopupOpen && host.state.mapPopupPinned) {
    const popupEl = document.querySelector(
      ".agri-dashboard-agri-host .agri3-popup-direct, .agri3-popup-direct.is-pinned, .agri3-popup-direct",
    ) as HTMLElement | null;
    if (popupEl) {
      const popupRect = popupEl.getBoundingClientRect();
      left = Math.max(8, popupRect.left - width - dateIndexGap);
      top = Math.max(8, popupRect.bottom - height);
    } else {
      left =
        slotRect.right - width - (popupWidth + popupInsetX + dateIndexGap);
      top = slotRect.bottom - height - bottomOffset;
    }
    zIndex = "10001";
  } else if (host.state.mapPopupOpen) {
    zIndex = "10001";
  }

  const entries: Array<[string, string]> = [
    ["position", "fixed"],
    ["top", `${Math.round(top)}px`],
    ["left", `${Math.round(left)}px`],
    ["width", `${width}px`],
    ["height", `${height}px`],
    ["max-width", `${width}px`],
    ["min-width", `${width}px`],
    ["min-height", `${height}px`],
    ["max-height", `${height}px`],
    ["right", "auto"],
    ["bottom", "auto"],
    ["margin", "0"],
    ["padding", "0"],
    ["transform", "none"],
    ["overflow", "hidden"],
    ["z-index", zIndex],
    ["pointer-events", "auto"],
    ["box-sizing", "border-box"],
  ];

  entries.forEach(([key, value]) => {
    overlayEl.style.setProperty(key, value, "important");
  });
  overlayEl.classList.add("agri-dashboard-managed-indicator");
}

export function syncIndicatorOverlayLayout(host: DashboardWidgetHost): void {
  host.ensurePortalHost();
  host.bringPortalHostToFront();
  const slot = host.mapSlotRef.current;
  if (slot) host.mapIndicatorHost = slot;
  const overlay = host.indicatorOverlayRef.current;
  if (slot && overlay) {
    if (slot.contains(overlay)) {
      host.clearOverlayLayout(overlay);
    } else {
      host.applyIndicatorOverlayBounds(slot, overlay);
    }
  }
  const dateIndexOverlay = host.dateIndexOverlayRef.current;
  if (slot && dateIndexOverlay) {
    // Always position via JS so the NDVI card can sit left of the pinned
    // popup while it is open (CSS-only path was leaving it under the popup).
    host.applyDateIndexOverlayBounds(slot, dateIndexOverlay);
  }
}

export function clearOverlayLayout(host: DashboardWidgetHost, overlay: HTMLElement | null): void {
  if (!overlay) return;
  [
    "position",
    "top",
    "left",
    "right",
    "bottom",
    "width",
    "height",
    "max-width",
    "min-width",
    "min-height",
    "max-height",
    "z-index",
    "margin",
    "padding",
    "transform",
    "overflow",
    "box-sizing",
  ].forEach((key) => {
    overlay.style.removeProperty(key);
  });
  overlay.classList.remove("agri-dashboard-managed-indicator");
}

export function clearIndicatorOverlayLayout(host: DashboardWidgetHost): void {
  host.clearOverlayLayout(host.indicatorOverlayRef.current);
  host.clearOverlayLayout(host.dateIndexOverlayRef.current);
}
