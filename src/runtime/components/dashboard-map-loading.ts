/**
 * Map-boot loading watchers for the AgriDashboard shell: poll for the embedded
 * MapView, then watch its `ready` flag to drive the map spinner.
 */
import type { JimuMapView } from "jimu-arcgis";
import type { DashboardWidgetHost } from "../dashboard-host";
import {
  resolveJimuMapView,
  isMapViewReady,
  MAP_VIEW_WATCH_MAX_ATTEMPTS,
  MAP_VIEW_WATCH_INTERVAL_MS,
} from "../../shared/map-connection-service";

/**
 * The legacy `watch()` / `when()` surface the watcher relies on. `watch` is
 * feature-detected at runtime because newer API typings no longer declare it.
 */
interface WatchableMapView {
  watch?: (property: string, callback: () => void) => { remove?: () => void };
  when?: (onFulfilled?: () => void, onRejected?: () => void) => Promise<unknown>;
}

export function getActiveJimuMapView(host: DashboardWidgetHost): JimuMapView | null {
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

export function getMapLoadingState(host: DashboardWidgetHost, jimuMapView: JimuMapView | null): boolean {
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
  const view = jimuMapView?.view as WatchableMapView | undefined;
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
