import type { DashboardWidgetHost } from "../../dashboard-host";
import type { AgriDashboardState } from "../../widget";
import * as layout from "../dashboard-layout";
import * as loading from "../dashboard-map-loading";

type StatePatch = Partial<AgriDashboardState>;

export interface DashboardHostStub {
  host: DashboardWidgetHost;
  setState: jest.Mock<void, [StatePatch]>;
}

/** Ref objects with writable `current` for tests. */
export const ref = <T>(current: T | null): { current: T | null } => ({ current });

/**
 * Dashboard host wired to the real layout / map-loading implementations.
 * Individual members can be replaced through `overrides`.
 */
export const makeDashboardHost = (
  state: StatePatch = {},
  overrides: Partial<DashboardWidgetHost> = {},
): DashboardHostStub => {
  const host = {
    props: { id: "dash", config: {} },
    state: { mapLoading: false, dashboardLoading: false, mapPopupOpen: false, mapPopupPinned: false, ...state },
    dashboardRootRef: ref<HTMLDivElement>(null),
    mapSlotRef: ref<HTMLElement>(null),
    indicatorOverlayRef: ref<HTMLDivElement>(null),
    dateIndexOverlayRef: ref<HTMLDivElement>(null),
    portalHost: null,
    portalReady: false,
    resizeListenerAttached: false,
    dashboardResizeObserver: null,
    layoutObserversReady: false,
    mapLayoutRaf: 0,
    lastMapSlotSize: { w: 0, h: 0 },
    mapReadyWatchHandle: null,
    mapUpdatingWatchHandle: null,
    watchedMapView: null,
    mapLoadingRetryTimer: null,
    embeddedMapReady: false,
    mapViewWatchAttempts: 0,
    lastMapWatchWidgetId: "",
    mapIndicatorHost: null,
    getActiveMapWidgetId: () => "map1",
  } as unknown as DashboardWidgetHost;

  const bind = <A extends unknown[], R>(fn: (h: DashboardWidgetHost, ...args: A) => R) =>
    (...args: A): R => fn(host, ...args);

  Object.assign(host, {
    createPortalHost: bind(layout.createPortalHost),
    ensurePortalHost: bind(layout.ensurePortalHost),
    removePortalHost: bind(layout.removePortalHost),
    bringPortalHostToFront: bind(layout.bringPortalHostToFront),
    onWindowResize: bind(layout.onWindowResize),
    ensureLayoutObservers: bind(layout.ensureLayoutObservers),
    scheduleMapSlotLayout: bind(layout.scheduleMapSlotLayout),
    findSharedLayoutSurface: bind(layout.findSharedLayoutSurface),
    readDashboardCssPx: bind(layout.readDashboardCssPx),
    applyIndicatorOverlayBounds: bind(layout.applyIndicatorOverlayBounds),
    applyDateIndexOverlayBounds: bind(layout.applyDateIndexOverlayBounds),
    clearOverlayLayout: bind(layout.clearOverlayLayout),
    getActiveJimuMapView: bind(loading.getActiveJimuMapView),
    detachMapLoadingWatchers: bind(loading.detachMapLoadingWatchers),
    setMapLoading: bind(loading.setMapLoading),
    getMapLoadingState: bind(loading.getMapLoadingState),
    updateMapLoadingState: bind(loading.updateMapLoadingState),
    attachMapLoadingWatchers: bind(loading.attachMapLoadingWatchers),
    scheduleMapLoadingWatchers: bind(loading.scheduleMapLoadingWatchers),
    getDashboardLoadingState: bind(loading.getDashboardLoadingState),
    ...overrides,
  });

  const setState = jest.fn((patch: StatePatch) => {
    host.state = { ...host.state, ...patch };
  });
  host.setState = setState as unknown as DashboardWidgetHost["setState"];
  return { host, setState };
};
