import type { DashboardChildProps, DashboardWidgetHost } from "../dashboard-host";
import { setAccessConfig } from "../../shared/agri-access-config";
import { setAgriServiceUrls } from "../../shared/agri-service-urls";
import { getAppStore, AppMode, React, Immutable } from "jimu-core";
import { agroV5Log } from "../../gis/agri-debug-log";
import type { AllWidgetProps } from "jimu-core";
import type { IMConfig, AgriPopupConfig } from "../../config";
import type { AgriDashboardState, ChildSuffix } from "../widget";
import type { IndicatorChildPropsSet } from "../AgriMapIndicatorDrawer";
import { clearDashboardCaches } from "../../data/agri-dashboard-cache-clear";
import {
  buildIndicatorChildConfig,
  buildPopupChildConfig,
  leftPanelWidthCss,
  mapSurfaceLoadingSafetyMs,
  rowFrValues,
  toMutableUseDataSources,
  toPlainConfigRecord,
  toPlainPopupConfig,
} from "./dashboard-config";

// Map-loading watchers and DOM layout live in their own modules; re-exported
// here so this file stays the single entry point for the widget class.
export {
  getActiveJimuMapView,
  detachMapLoadingWatchers,
  setMapLoading,
  getMapLoadingState,
  updateMapLoadingState,
  attachMapLoadingWatchers,
  scheduleMapLoadingWatchers,
  getDashboardLoadingState,
  updateDashboardLoadingState,
} from "./dashboard-map-loading";
export {
  createPortalHost,
  ensurePortalHost,
  removePortalHost,
  bringPortalHostToFront,
  onWindowResize,
  ensureLayoutObservers,
  setupMapSlotObserver,
  scheduleMapSlotLayout,
  findSharedLayoutSurface,
  readDashboardCssPx,
  applyIndicatorOverlayBounds,
  applyDateIndexOverlayBounds,
  syncIndicatorOverlayLayout,
  clearOverlayLayout,
  clearIndicatorOverlayLayout,
} from "./dashboard-layout";

/** `detail` of the agriMapSurfaceLoading / agriMapNoData / agriMapPopupVisibility events. */
interface MapSurfaceEventDetail {
  loading?: unknown;
  reason?: unknown;
  noData?: unknown;
  open?: unknown;
  pinned?: unknown;
}

const readMapSurfaceDetail = (event: Event): MapSurfaceEventDetail =>
  ((event as CustomEvent<MapSurfaceEventDetail | null>)?.detail || {}) as MapSurfaceEventDetail;

const mountedAgriDashboardIds = new Set<string>();

/**
 * Access + service URL module state. Idempotent; safe on every config change.
 * Kept out of render() (React purity) but applied in constructor so the first
 * paint of Localization/Graff already sees the correct access WHERE.
 */
export const syncConfigSideEffects = (host: DashboardWidgetHost): void => {
  setAccessConfig(host.props.config?.accessConfig);
  setAgriServiceUrls(host.props.config?.serviceUrls);
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

  const prevCfg = prevProps.config;
  const nextCfg = host.props.config;
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
  const detail = readMapSurfaceDetail(event);
  const loading = !!detail.loading;
  if (host.mapSurfaceLoadingSafetyTimer) {
    clearTimeout(host.mapSurfaceLoadingSafetyTimer);
    host.mapSurfaceLoadingSafetyTimer = null;
  }
  if (loading) {
    // Vegetation TIFF can take longer than map redraw; keep overlay up to
    // the export-image client timeout (~25s), otherwise 12s for map ops.
    const safetyMs = mapSurfaceLoadingSafetyMs(detail.reason);
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
  const detail = readMapSurfaceDetail(event);
  const mapNoData = !!detail.noData;
  if (host.state.mapNoData !== mapNoData) {
    host.setState({ mapNoData });
  }
};

export const handleMapPopupVisibility = (host: DashboardWidgetHost, event: Event): void => {
  const detail = readMapSurfaceDetail(event);
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

  const afterPopupStateApplied = (): void => {
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
  };

  const popupState = { mapPopupOpen: open, mapPopupPinned: nextPinned };
  if (shouldCollapseIndicators) {
    host.setState(
      {
        ...popupState,
        indicatorsOpen: false,
        indicatorsAnimPhase: "collapsing",
      },
      afterPopupStateApplied,
    );
  } else {
    host.setState(popupState, afterPopupStateApplied);
  }
};

export function toPlainConfig(host: DashboardWidgetHost): Record<string, unknown> {
  return toPlainConfigRecord(host.props.config);
}

export function toPlainPopup(host: DashboardWidgetHost, value: unknown): AgriPopupConfig {
  return toPlainPopupConfig(value);
}

export function getIndicatorConfig(host: DashboardWidgetHost, baseConfig: Record<string, unknown>): Record<string, unknown> {
  return buildIndicatorChildConfig(baseConfig);
}

export function getPopupConfig(host: DashboardWidgetHost, baseConfig: Record<string, unknown>): Record<string, unknown> {
  return buildPopupChildConfig(host.toPlainPopup(baseConfig.agriPopup));
}

/**
 * Props for one embedded panel. `P` is the panel's own props type: the
 * dashboard hands every panel a plain config record and the panel's props
 * type describes how it reads that record (cast at this single boundary).
 */
export function childProps<P = DashboardChildProps>(host: DashboardWidgetHost, suffix: ChildSuffix, config?: Record<string, unknown>): P {
  const mapWidgetId = host.getActiveMapWidgetId();
  const mapIds = Immutable.from([mapWidgetId]);
  const webMapDataSourceId = String(
    host.toPlainConfig().webMapDataSourceId || "",
  );
  const dataSources = toMutableUseDataSources(host.props.useDataSources);
  const featureDataSources = dataSources.filter(
    (source) => source?.dataSourceId !== webMapDataSourceId,
  );

  const props: DashboardChildProps = {
    ...host.props,
    id: `${host.props.id}-${suffix}`,
    config: config || host.toPlainConfig(),
    useMapWidgetIds: mapIds,
    useDataSources: Immutable.from(featureDataSources),
  };
  return props as unknown as P;
}

export function getStableIndicatorChildProps(host: DashboardWidgetHost, indicatorConfig: Record<string, unknown>, baseConfig: Record<string, unknown>): IndicatorChildPropsSet {
  const mapWidgetId = host.getActiveMapWidgetId();
  const webMapDataSourceId = String(baseConfig.webMapDataSourceId || "");
  const dataSources = toMutableUseDataSources(host.props.useDataSources);
  const featureIds = dataSources
    .filter((source) => source?.dataSourceId !== webMapDataSourceId)
    .map((source) => String(source?.dataSourceId || ""))
    .join(",");
  const signature = [
    host.props.id,
    mapWidgetId,
    webMapDataSourceId,
    featureIds,
    JSON.stringify(indicatorConfig || {}),
    JSON.stringify({
      useApiDataSource: baseConfig?.useApiDataSource,
      apiEndpoint: baseConfig?.apiEndpoint,
      apiUrl: baseConfig?.apiUrl,
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
    indicator: host.childProps<IndicatorChildPropsSet["indicator"]>("indicator", indicatorConfig),
    yield: host.childProps<IndicatorChildPropsSet["yield"]>("indicator-yield", baseConfig),
    unused: host.childProps<IndicatorChildPropsSet["unused"]>("indicator-unused-land", baseConfig),
    reserve: host.childProps<IndicatorChildPropsSet["reserve"]>("indicator-reserve-land", baseConfig),
  };
  host.indicatorChildPropsCache = next;
  return next;
}

export function getLeftPanelWidth(host: DashboardWidgetHost): string {
  return leftPanelWidthCss(host.props.config?.leftPanelWidthPercent);
}

export function getRowFrValues(host: DashboardWidgetHost): { top: number; bottom: number } {
  return rowFrValues(host.props.config?.bottomRowFraction);
}

export function getActiveMapWidgetId(host: DashboardWidgetHost): string {
  return `${host.props.id}-embedded-map`;
}
