import { getAppStore } from "jimu-core";
import { makeDashboardHost } from "./__test-utils__/dashboard-host-stub";
import * as handlers from "./dashboard-handlers";
import * as accessCfg from "../../shared/agri-access-config";
import * as urls from "../../shared/agri-service-urls";
import * as cache from "../../data/agri-dashboard-cache-clear";
import type { DashboardWidgetHost } from "../dashboard-host";

jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: jest.fn(),
}));
jest.mock("../../shared/agri-access-config", () => ({
  ...jest.requireActual("../../shared/agri-access-config"),
  setAccessConfig: jest.fn(),
}));
jest.mock("../../shared/agri-service-urls", () => ({
  ...jest.requireActual("../../shared/agri-service-urls"),
  setAgriServiceUrls: jest.fn(),
}));
jest.mock("../../data/agri-dashboard-cache-clear", () => ({ clearDashboardCaches: jest.fn() }));
jest.mock("../../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

const mockStore = getAppStore as unknown as jest.Mock<{ getState: () => { appRuntimeInfo?: { appMode?: string } } }, []>;

/** Test-only: replace a mocked host member. */
const stub = <K extends keyof DashboardWidgetHost>(host: DashboardWidgetHost, key: K, value: DashboardWidgetHost[K]): void => {
  (host as unknown as Record<string, unknown>)[key as string] = value;
};

/** Test-only: point the root ref at a fixture element. */
const setRoot = (host: DashboardWidgetHost, el: HTMLDivElement | null): void => {
  (host.dashboardRootRef as { current: HTMLDivElement | null }).current = el;
};

const custom = (detail: Record<string, unknown>): Event => new CustomEvent("x", { detail });

describe("config side effects and mode helpers", () => {
  beforeEach(() => jest.clearAllMocks());

  test("syncConfigSideEffects forwards access and service config", () => {
    const { host } = makeDashboardHost();
    (host.props as unknown as { config: unknown }).config = { accessConfig: { a: 1 }, serviceUrls: { u: "x" } };
    handlers.syncConfigSideEffects(host);
    expect(accessCfg.setAccessConfig).toHaveBeenCalledWith({ a: 1 });
    expect(urls.setAgriServiceUrls).toHaveBeenCalledWith({ u: "x" });
  });

  test("isBuilderDesignMode reads the app mode", () => {
    const { host } = makeDashboardHost();
    mockStore.mockReturnValue({ getState: () => ({ appRuntimeInfo: { appMode: "DESIGN" } }) });
    const design = handlers.isBuilderDesignMode(host);
    mockStore.mockReturnValue({ getState: () => ({}) });
    expect(handlers.isBuilderDesignMode(host)).toBe(false);
    expect(typeof design).toBe("boolean");
  });

  test("getUiLanguage prefers url, then storage, then default", () => {
    const { host } = makeDashboardHost();
    window.localStorage.clear();
    expect(handlers.getUiLanguage(host)).toBe("uz_lat");
    window.localStorage.setItem("agri_app_lang", "ru");
    expect(handlers.getUiLanguage(host)).toBe("ru");
    window.localStorage.setItem("app_lang", "en");
    expect(handlers.getUiLanguage(host)).toBe("en");
    window.localStorage.clear();
  });

  test("getUiLanguage falls back when storage throws", () => {
    const { host } = makeDashboardHost();
    const spy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(handlers.getUiLanguage(host)).toBe("uz_lat");
    spy.mockRestore();
  });

  test("simple getters derive from props and id", () => {
    const { host } = makeDashboardHost();
    (host.props as unknown as { config: unknown }).config = { leftPanelWidthPercent: 30, bottomRowFraction: 40 };
    expect(handlers.getActiveMapWidgetId(host)).toBe("dash-embedded-map");
    expect(handlers.getLeftPanelWidth(host)).toContain("30");
    expect(handlers.getRowFrValues(host)).toEqual({ top: 60, bottom: 40 });
  });
});

describe("lifecycle", () => {
  const prep = () => {
    const stubbed = makeDashboardHost();
    const { host } = stubbed;
    const calls = {
      sync: jest.fn(),
      design: jest.fn(() => false),
      setupObs: jest.fn(),
      layout: jest.fn(),
      watchers: jest.fn(),
      ensurePortal: jest.fn(() => document.createElement("div")),
      ensureObs: jest.fn(),
      syncOverlay: jest.fn(),
      forceUpdate: jest.fn((cb?: () => void) => cb?.()),
      detach: jest.fn(),
      clearOverlay: jest.fn(),
      removePortal: jest.fn(),
    };
    stub(host, "syncConfigSideEffects", calls.sync);
    stub(host, "isBuilderDesignMode", calls.design);
    stub(host, "setupMapSlotObserver", calls.setupObs);
    stub(host, "scheduleMapSlotLayout", calls.layout);
    stub(host, "scheduleMapLoadingWatchers", calls.watchers);
    stub(host, "ensurePortalHost", calls.ensurePortal);
    stub(host, "ensureLayoutObservers", calls.ensureObs);
    stub(host, "syncIndicatorOverlayLayout", calls.syncOverlay);
    stub(host, "forceUpdate", calls.forceUpdate);
    stub(host, "detachMapLoadingWatchers", calls.detach);
    stub(host, "clearIndicatorOverlayLayout", calls.clearOverlay);
    stub(host, "removePortalHost", calls.removePortal);
    stub(host, "handleMapSurfaceLoading", jest.fn());
    stub(host, "handleMapNoData", jest.fn());
    stub(host, "handleMapPopupVisibility", jest.fn());
    return { ...stubbed, calls };
  };

  beforeEach(() => jest.clearAllMocks());

  test("mount in design mode only re-syncs config", () => {
    const { host, calls } = prep();
    calls.design.mockReturnValue(true);
    handlers.componentDidMount(host);
    expect(calls.sync).toHaveBeenCalled();
    expect(calls.setupObs).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(false);
  });

  test("mount wires observers, listeners and runs the raf layout; unmount undoes it", () => {
    const { host, calls } = prep();
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    const dispatchOn = jest.spyOn(document, "addEventListener");
    handlers.componentDidMount(host);
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(true);
    expect(calls.setupObs).toHaveBeenCalled();
    expect(calls.layout).toHaveBeenCalledWith(true);
    expect(calls.watchers).toHaveBeenCalled();
    expect(calls.ensurePortal).toHaveBeenCalled();
    expect(calls.syncOverlay).toHaveBeenCalled();
    expect(dispatchOn.mock.calls.map((c) => c[0])).toEqual(
      expect.arrayContaining(["agriMapSurfaceLoading", "agriMapNoData", "agriMapPopupVisibility"]),
    );

    const disconnect = jest.fn();
    stub(host, "dashboardResizeObserver", { disconnect } as unknown as ResizeObserver);
    const root0 = document.createElement("div");
    root0.classList.add("agri-popup-open");
    setRoot(host, root0);
    stub(host, "mapSurfaceLoadingSafetyTimer", setTimeout(() => undefined, 10000));
    handlers.componentWillUnmount(host);
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(false);
    expect(disconnect).toHaveBeenCalled();
    expect(host.dashboardRootRef.current.classList.contains("agri-popup-open")).toBe(false);
    expect(host.mapSurfaceLoadingSafetyTimer).toBeNull();
    expect(calls.detach).toHaveBeenCalled();
    expect(calls.removePortal).toHaveBeenCalled();
    expect(cache.clearDashboardCaches).toHaveBeenCalled();
    raf.mockRestore();
    dispatchOn.mockRestore();
  });

  test("a second mounted dashboard logs a single-instance warning", () => {
    const first = prep();
    const second = prep();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    handlers.componentDidMount(first.host);
    handlers.componentDidMount(second.host);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { agroV5Log } = jest.requireMock("../../gis/agri-debug-log") as { agroV5Log: jest.Mock };
    expect(agroV5Log).toHaveBeenCalledWith("AgriDashboard:single-instance-warn", expect.any(Object));
    handlers.componentWillUnmount(first.host);
    handlers.componentWillUnmount(second.host);
    jest.restoreAllMocks();
  });

  test("update re-syncs config only when config changed and skips work in design mode", () => {
    const { host, calls } = prep();
    const prevProps = { ...host.props, config: { different: true } } as unknown as typeof host.props;
    calls.design.mockReturnValue(true);
    handlers.componentDidUpdate(host, prevProps, host.state);
    expect(calls.sync).toHaveBeenCalled();
    expect(calls.ensurePortal).not.toHaveBeenCalled();
  });

  test("update schedules layout on size/chrome change and rebinds watchers on map change", () => {
    const { host, calls } = prep();
    const prevState = { ...host.state, mapPopupOpen: true };
    handlers.componentDidUpdate(host, host.props, prevState);
    expect(calls.ensurePortal).toHaveBeenCalled();
    expect(calls.ensureObs).toHaveBeenCalled();
    expect(calls.layout).toHaveBeenCalledWith(true);
    expect(calls.watchers).toHaveBeenCalled(); // lastMapWatchWidgetId differs from "map1"
    expect(calls.syncOverlay).toHaveBeenCalled();
  });

  test("update does nothing extra when nothing changed, and skips overlay sync while drawer animates", () => {
    const { host, calls } = prep();
    host.lastMapWatchWidgetId = "map1";
    handlers.componentDidUpdate(host, host.props, host.state);
    expect(calls.layout).not.toHaveBeenCalled();
    expect(calls.watchers).not.toHaveBeenCalled();
    expect(calls.syncOverlay).toHaveBeenCalledTimes(1);

    calls.syncOverlay.mockClear();
    handlers.componentDidUpdate(host, host.props, { ...host.state, indicatorsOpen: true });
    expect(calls.layout).toHaveBeenCalledWith(true);
    expect(calls.syncOverlay).not.toHaveBeenCalled();
  });
});

describe("toggleIndicatorsDrawer", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const event = () => ({ preventDefault: jest.fn(), stopPropagation: jest.fn() }) as unknown as React.MouseEvent<HTMLButtonElement>;

  test("opens, animates to expanded, then debounces rapid clicks", () => {
    const { host, setState } = makeDashboardHost();
    setRoot(host, document.createElement("div"));
    host.lastIndicatorToggleAt = 0;
    jest.setSystemTime(10000);
    const e = event();
    handlers.toggleIndicatorsDrawer(host, e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(setState).toHaveBeenLastCalledWith({ indicatorsOpen: true, indicatorsAnimPhase: "expanding" });
    handlers.toggleIndicatorsDrawer(host, event());
    expect(setState).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(780);
    expect(setState).toHaveBeenLastCalledWith({ indicatorsAnimPhase: "expanded" });
  });

  test("closes after the debounce window and skips the final phase when unmounted", () => {
    const { host, setState } = makeDashboardHost({ indicatorsOpen: true });
    host.lastIndicatorToggleAt = 0;
    jest.setSystemTime(10000);
    handlers.toggleIndicatorsDrawer(host, event());
    expect(setState).toHaveBeenLastCalledWith({ indicatorsOpen: false, indicatorsAnimPhase: "collapsing" });
    jest.advanceTimersByTime(720);
    expect(setState).toHaveBeenCalledTimes(1);
  });
});

describe("map surface events", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("loading=true sets state and a safety timeout that clears it", () => {
    const { host, setState } = makeDashboardHost();
    handlers.handleMapSurfaceLoading(host, custom({ loading: true }));
    expect(setState).toHaveBeenCalledWith({ mapSurfaceLoading: true });
    jest.advanceTimersByTime(30000);
    expect(setState).toHaveBeenLastCalledWith({ mapSurfaceLoading: false });
    expect(host.mapSurfaceLoadingSafetyTimer).toBeNull();
  });

  test("loading=true while no-data clears the no-data flag in one update", () => {
    const { host, setState } = makeDashboardHost({ mapNoData: true });
    handlers.handleMapSurfaceLoading(host, custom({ loading: true }));
    expect(setState).toHaveBeenCalledWith({ mapSurfaceLoading: true, mapNoData: false });
  });

  test("loading=false cancels the pending safety timer and is a no-op when unchanged", () => {
    const { host, setState } = makeDashboardHost({ mapSurfaceLoading: true });
    handlers.handleMapSurfaceLoading(host, custom({ loading: true }));
    setState.mockClear();
    handlers.handleMapSurfaceLoading(host, custom({ loading: false }));
    expect(setState).toHaveBeenCalledWith({ mapSurfaceLoading: false });
    jest.advanceTimersByTime(30000);
    expect(setState).toHaveBeenCalledTimes(1);
    handlers.handleMapSurfaceLoading(host, custom({}));
    expect(setState).toHaveBeenCalledTimes(1);
  });

  test("handleMapNoData only updates on change", () => {
    const { host, setState } = makeDashboardHost({ mapNoData: false });
    handlers.handleMapNoData(host, custom({ noData: false }));
    expect(setState).not.toHaveBeenCalled();
    handlers.handleMapNoData(host, custom({ noData: true }));
    expect(setState).toHaveBeenCalledWith({ mapNoData: true });
  });
});

describe("handleMapPopupVisibility", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (state: Parameters<typeof makeDashboardHost>[0] = {}) => {
    const stubbed = makeDashboardHost(state);
    const sync = jest.fn();
    stub(stubbed.host, "syncIndicatorOverlayLayout", sync);
    const root = document.createElement("div");
    setRoot(stubbed.host, root);
    return { ...stubbed, sync, root };
  };

  test("unchanged state only re-syncs the overlay when open", () => {
    const { host, sync, setState } = setup({ mapPopupOpen: true, mapPopupPinned: false });
    handlers.handleMapPopupVisibility(host, custom({ open: true }));
    expect(sync).toHaveBeenCalledTimes(1);
    expect(setState).not.toHaveBeenCalled();
  });

  test("opening collapses an open drawer, toggles root classes and schedules follow-ups", () => {
    const { host, sync, setState, root } = setup({ indicatorsOpen: true });
    host.indicatorAnimTimer = setTimeout(() => undefined, 5000);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    // jsdom setState stub ignores callbacks, so invoke them manually.
    setState.mockImplementation(((patch: object, cb?: () => void) => {
      host.state = { ...host.state, ...patch };
      cb?.();
    }) as never);
    handlers.handleMapPopupVisibility(host, custom({ open: true, pinned: true }));
    expect(setState).toHaveBeenCalledWith(
      { mapPopupOpen: true, mapPopupPinned: true, indicatorsOpen: false, indicatorsAnimPhase: "collapsing" },
      expect.any(Function),
    );
    expect(root.classList.contains("agri-popup-open")).toBe(true);
    expect(root.classList.contains("agri-popup-pinned")).toBe(true);
    jest.advanceTimersByTime(100);
    expect(sync.mock.calls.length).toBeGreaterThanOrEqual(3);
    jest.advanceTimersByTime(720);
    expect(setState).toHaveBeenLastCalledWith({ indicatorsAnimPhase: "collapsed" });
    jest.restoreAllMocks();
  });

  test("closing a popup does not collapse indicators; pinned only counts while open", () => {
    const { host, setState } = setup({ mapPopupOpen: true, mapPopupPinned: true });
    handlers.handleMapPopupVisibility(host, custom({ open: false, pinned: true }));
    expect(setState).toHaveBeenCalledWith({ mapPopupOpen: false, mapPopupPinned: false }, expect.any(Function));
  });
});

describe("child props and config helpers", () => {
  test("toPlainConfig / toPlainPopup / getIndicatorConfig / getPopupConfig", () => {
    const { host } = makeDashboardHost();
    (host.props as unknown as { config: unknown }).config = { a: 1 };
    stub(host, "toPlainPopup", (v: unknown) => handlers.toPlainPopup(host, v));
    expect(handlers.toPlainConfig(host)).toEqual({ a: 1 });
    expect(handlers.toPlainPopup(host, null)).toEqual({});
    expect(handlers.toPlainPopup(host, { x: 1 })).toEqual({ x: 1 });
    expect(handlers.getIndicatorConfig(host, { a: 1 })).toBeDefined();
    expect(handlers.getPopupConfig(host, { agriPopup: { title: "t" } })).toBeDefined();
  });

  test("childProps scopes id, map and excludes the web-map data source", () => {
    const { host } = makeDashboardHost();
    (host.props as unknown as Record<string, unknown>).useDataSources = [
      { dataSourceId: "wm" },
      { dataSourceId: "fl" },
    ];
    stub(host, "toPlainConfig", () => ({ webMapDataSourceId: "wm" }));
    const props = handlers.childProps(host, "indicator");
    expect(props.id).toBe("dash-indicator");
    expect(props.config).toEqual({ webMapDataSourceId: "wm" });
    expect([...props.useMapWidgetIds]).toEqual(["map1"]);
    expect(props.useDataSources.map((s) => s.dataSourceId)).toEqual(["fl"]);
    const custom = handlers.childProps(host, "indicator", { z: 1 });
    expect(custom.config).toEqual({ z: 1 });
  });

  test("getStableIndicatorChildProps caches by signature", () => {
    const { host } = makeDashboardHost();
    const childProps = jest.fn((suffix: string) => ({ suffix }));
    stub(host, "childProps", childProps as unknown as DashboardWidgetHost["childProps"]);
    const first = handlers.getStableIndicatorChildProps(host, { k: 1 }, { webMapDataSourceId: "wm" });
    expect(first.indicator).toEqual({ suffix: "indicator" });
    expect(first.reserve).toEqual({ suffix: "indicator-reserve-land" });
    host.indicatorChildPropsCache = first as DashboardWidgetHost["indicatorChildPropsCache"];
    expect(handlers.getStableIndicatorChildProps(host, { k: 1 }, { webMapDataSourceId: "wm" })).toBe(first);
    expect(childProps).toHaveBeenCalledTimes(4);
    const next = handlers.getStableIndicatorChildProps(host, { k: 2 }, { webMapDataSourceId: "wm" });
    expect(next).not.toBe(first);
  });
});
