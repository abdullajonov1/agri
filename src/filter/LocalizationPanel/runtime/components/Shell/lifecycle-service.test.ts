jest.mock("../../../../../gis/feature-layer-data", () => ({
  isMapImageOwnedLayer: jest.fn((l: { owned?: boolean }) => Boolean(l.owned)),
}));
jest.mock("../../../../../shared/map-connection-service", () => ({ MAP_CONNECTION_RETRY_MS: 700 }));
jest.mock("../../../../../store/agri-dashboard-store", () => ({
  subscribeDashboardPack: jest.fn(),
  getDashboardPack: jest.fn(() => ({ phase: "ready" })),
}));
jest.mock("../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { getDashboardPack, subscribeDashboardPack } from "../../../../../store/agri-dashboard-store";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import type { LocalizationWidgetProps } from "../host";
import type { GeoWidgetState } from "../../widget-state";
import { componentDidMount, componentDidUpdate, componentWillUnmount } from "./lifecycle-service";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const flush = async (): Promise<void> => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); };

const mk = (init: FakeHostInit = {}): FakeHost =>
  makeFakeHost({
    hydrateNotificationCache: jest.fn(),
    onDashboardPackForNotifications: jest.fn(),
    initializeTheme: jest.fn(),
    handleDocumentClick: jest.fn(),
    handleWidgetSelection: jest.fn(),
    handlePolygonMapClickPhase: jest.fn(),
    handleRequestMasterFilterState: jest.fn(),
    ensureInitialization: jest.fn(),
    applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    emitGraffTableSearchClear: jest.fn(),
    clearPolygonFilterGuards: jest.fn(),
    clearRegionYearSettleRepaintTimers: jest.fn(),
    updateNotificationScrollHint: jest.fn(),
    ...init,
  });

beforeEach(() => {
  jest.clearAllMocks();
  m(getDashboardPack).mockReturnValue({ phase: "ready" });
});

describe("componentDidMount", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("wires subscriptions, listeners, connecting state and the init timer", () => {
    const unbind = jest.fn();
    m(subscribeDashboardPack).mockReturnValue(unbind);
    const h = mk({ _isMounted: false });
    componentDidMount(h);
    expect(h._isMounted).toBe(true);
    expect(h.hydrateNotificationCache).toHaveBeenCalled();
    expect(h.onDashboardPackForNotifications).toHaveBeenCalledWith({ phase: "ready" });
    expect(h._unbindNotificationPack).toBe(unbind);
    expect(h.state.connectionStatus).toBe("connecting");
    expect(h.initializeTheme).toHaveBeenCalled();

    document.dispatchEvent(new Event("widgetSelectionChanged"));
    document.dispatchEvent(new Event("agriPolygonMapClickPhase"));
    document.dispatchEvent(new Event("requestMasterFilterState"));
    document.dispatchEvent(new Event("mousedown"));
    expect(h.handleWidgetSelection).toHaveBeenCalledTimes(1);
    expect(h.handlePolygonMapClickPhase).toHaveBeenCalledTimes(1);
    expect(h.handleRequestMasterFilterState).toHaveBeenCalledTimes(1);
    expect(h.handleDocumentClick).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(3000);
    expect(h.ensureInitialization).toHaveBeenCalledTimes(1);
    componentWillUnmount(h);
  });

  it("resetAllFilters clears the selection and refreshes when connected", async () => {
    const h = mk({ state: { connectionStatus: "connected", yil: "2024", viloyat: "A", polygonMode: true } });
    componentDidMount(h);
    h.state = { ...h.state, connectionStatus: "connected" };
    document.dispatchEvent(new Event("resetAllFilters"));
    jest.useRealTimers();
    await flush();
    expect(h.state).toMatchObject({ yil: "", viloyat: "", polygonMode: false, yilOptions: [], initialPreselectionProcessed: true });
    expect(h._allowClearOnce).toBe(true);
    expect(h.applyMapFiltersOptimized).toHaveBeenCalledWith({ mode: "home", reason: "reset" });
    expect(h.broadcastFilterState).toHaveBeenCalled();
    expect(h.emitGraffTableSearchClear).toHaveBeenCalled();
    componentWillUnmount(h);
  });

  it("resetAllFilters does not refresh when disconnected and swallows refresh errors", async () => {
    const h = mk();
    componentDidMount(h);
    h.state = { ...h.state, connectionStatus: "connecting" };
    document.dispatchEvent(new Event("resetAllFilters"));
    jest.useRealTimers();
    await flush();
    expect(h.applyMapFiltersOptimized).not.toHaveBeenCalled();
    h.state = { ...h.state, connectionStatus: "connected" };
    m(h.applyMapFiltersOptimized).mockRejectedValue(new Error("x"));
    document.dispatchEvent(new Event("resetAllFilters"));
    await flush();
    expect(h.emitGraffTableSearchClear).not.toHaveBeenCalled();
    componentWillUnmount(h);
  });

  it("resetAllFilters is ignored when unmounted", () => {
    const h = mk();
    componentDidMount(h);
    h._isMounted = false;
    const before = h.setState.mock.calls.length;
    document.dispatchEvent(new Event("resetAllFilters"));
    expect(h.setState.mock.calls.length).toBe(before);
    componentWillUnmount(h);
  });
});

describe("componentWillUnmount", () => {
  it("removes listeners, timers and handles and restores layer definitions", () => {
    const unbind = jest.fn();
    const mapRemove = jest.fn();
    const interactionRemove = jest.fn();
    const plain = { definitionExpression: "x=1" };
    const owned = { owned: true, definitionExpression: "y=1" };
    const single = { definitionExpression: "z=1" };
    const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const h = mk({
      _unbindNotificationPack: unbind,
      _notificationPaintFrame: 5,
      initializationTimer: setTimeout(() => undefined, 9999),
      _retryTimeout: setTimeout(() => undefined, 9999),
      _dsOnlyRetryTimer: setTimeout(() => undefined, 9999),
      _graffSearchDebounceTimer: setTimeout(() => undefined, 9999),
      _dataSourceInfoDebounceTimer: setTimeout(() => undefined, 9999),
      _mapClickHandle: { remove: mapRemove } as never,
      _mapInteractionHandle: { remove: interactionRemove } as never,
      state: { featureLayers: [plain, owned] as never, featureLayer: single as never },
    });
    h._onReset = jest.fn();
    componentWillUnmount(h);
    expect(h._isMounted).toBe(false);
    expect(unbind).toHaveBeenCalled();
    expect(h._unbindNotificationPack).toBeNull();
    expect(cancel).toHaveBeenCalledWith(5);
    expect(h._notificationPaintFrame).toBe(0);
    expect(h._dsOnlyRetryTimer).toBeNull();
    expect(h._graffSearchDebounceTimer).toBeNull();
    expect(h._dataSourceInfoDebounceTimer).toBeNull();
    expect(mapRemove).toHaveBeenCalled();
    expect(interactionRemove).toHaveBeenCalled();
    expect(h._zoomRequestId).toBe(1);
    expect(h.clearPolygonFilterGuards).toHaveBeenCalled();
    expect(h.clearRegionYearSettleRepaintTimers).toHaveBeenCalled();
    expect(plain.definitionExpression).toBe("");
    expect(owned.definitionExpression).toBe("y=1");
    expect(single.definitionExpression).toBe("");
    cancel.mockRestore();
  });

  it("tolerates handle removal errors and read-only layers", () => {
    const throwing = { remove: () => { throw new Error("x"); } };
    const ro = Object.defineProperty({}, "definitionExpression", { set: () => { throw new Error("ro"); } });
    const h = mk({
      _mapClickHandle: throwing as never,
      _mapInteractionHandle: throwing as never,
      state: { featureLayers: [ro] as never },
    });
    h._onReset = jest.fn();
    expect(() => componentWillUnmount(h)).not.toThrow();
    expect(h._mapClickHandle).toBeNull();
  });
});

describe("componentDidUpdate", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const prevProps = {} as LocalizationWidgetProps;
  const prevState = (over: Partial<GeoWidgetState>): GeoWidgetState => ({ ...makeFakeHost().state, ...over });

  it("bumps the connection attempt counter while connecting with a linked map and no view", () => {
    const h = mk({
      props: { useMapWidgetIds: ["m"] as never },
      state: { connectionStatus: "connecting", mapConnectionAttempts: 1, activeMapView: null },
    });
    componentDidUpdate(h, prevProps, prevState({ mapConnectionAttempts: 0 }));
    jest.advanceTimersByTime(700);
    expect(h.state.mapConnectionAttempts).toBe(2);
  });

  it("replaces a pending retry timer and respects the maximum attempts / unmount", () => {
    const h = mk({
      props: { useMapWidgetIds: ["m"] as never },
      _retryTimeout: setTimeout(() => undefined, 9999),
      state: { connectionStatus: "connecting", mapConnectionAttempts: 1 },
    });
    componentDidUpdate(h, prevProps, prevState({ mapConnectionAttempts: 0 }));
    h._isMounted = false;
    jest.advanceTimersByTime(700);
    expect(h.state.mapConnectionAttempts).toBe(1);

    const max = mk({
      props: { useMapWidgetIds: ["m"] as never },
      state: { connectionStatus: "connecting", mapConnectionAttempts: 3 },
    });
    componentDidUpdate(max, prevProps, prevState({ mapConnectionAttempts: 2 }));
    jest.advanceTimersByTime(700);
    expect(max.state.mapConnectionAttempts).toBe(3);
  });

  it("does not retry without a linked map or when the counter did not change", () => {
    const a = mk({ state: { connectionStatus: "connecting", mapConnectionAttempts: 1 } });
    componentDidUpdate(a, prevProps, prevState({ mapConnectionAttempts: 0 }));
    const b = mk({ props: { useMapWidgetIds: ["m"] as never }, state: { connectionStatus: "connecting", mapConnectionAttempts: 1 } });
    componentDidUpdate(b, prevProps, prevState({ mapConnectionAttempts: 1 }));
    jest.advanceTimersByTime(700);
    expect(a.state.mapConnectionAttempts).toBe(1);
    expect(b.state.mapConnectionAttempts).toBe(1);
  });

  it("updates the scroll hint when the notifications menu opens or its content changes", () => {
    (window as unknown as { requestAnimationFrame: (cb: () => void) => number }).requestAnimationFrame = (cb) => { cb(); return 1; };
    const days: GeoWidgetState["notificationDays"] = [];
    const h = mk({ state: { openToolbarMenu: "notifications", notificationDays: days } });
    componentDidUpdate(h, prevProps, prevState({ openToolbarMenu: null, notificationDays: days }));
    expect(h.updateNotificationScrollHint).toHaveBeenCalledTimes(1);
    componentDidUpdate(h, prevProps, prevState({ openToolbarMenu: "notifications", notificationDays: days }));
    expect(h.updateNotificationScrollHint).toHaveBeenCalledTimes(1);
    componentDidUpdate(h, prevProps, prevState({ openToolbarMenu: "notifications", notificationDays: [], notificationLoading: false }));
    expect(h.updateNotificationScrollHint).toHaveBeenCalledTimes(2);
  });
});
