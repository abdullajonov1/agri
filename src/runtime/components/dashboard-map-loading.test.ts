import type { JimuMapView } from "jimu-arcgis";

const mockResolve = jest.fn<JimuMapView | null, [string]>(() => null);

jest.mock("../../shared/map-connection-service", () => ({
  ...jest.requireActual("../../shared/map-connection-service"),
  resolveJimuMapView: (id: string) => mockResolve(id),
}));

import { makeDashboardHost } from "./__test-utils__/dashboard-host-stub";
import {
  attachMapLoadingWatchers,
  detachMapLoadingWatchers,
  getDashboardLoadingState,
  getMapLoadingState,
  scheduleMapLoadingWatchers,
  setMapLoading,
  updateDashboardLoadingState,
} from "./dashboard-map-loading";
import { MAP_VIEW_WATCH_INTERVAL_MS, MAP_VIEW_WATCH_MAX_ATTEMPTS } from "../../shared/map-connection-service";

/** Test-only: point a component ref at a fixture element. */
const setRef = <T,>(ref: { readonly current: T | null }, value: T): void => {
  (ref as { current: T | null }).current = value;
};

interface FakeView {
  ready?: boolean;
  watch: jest.Mock<{ remove: jest.Mock }, [string, () => void]>;
  when: jest.Mock<Promise<unknown>, [(() => void)?, (() => void)?]>;
}

const fakeView = (ready: boolean): FakeView => ({
  ready,
  watch: jest.fn<{ remove: jest.Mock }, [string, () => void]>(() => ({ remove: jest.fn() })),
  when: jest.fn(async () => undefined),
});

const jmv = (view: FakeView): JimuMapView => ({ view }) as unknown as JimuMapView;

beforeEach(() => {
  mockResolve.mockReset();
  mockResolve.mockReturnValue(null);
});

describe("map loading state", () => {
  test("setMapLoading only updates on change", () => {
    const { host, setState } = makeDashboardHost({ mapLoading: false });
    setMapLoading(host, false);
    expect(setState).not.toHaveBeenCalled();
    setMapLoading(host, true);
    expect(host.state.mapLoading).toBe(true);
  });

  test("getMapLoadingState handles no widget, no view and ready view", () => {
    const none = makeDashboardHost({}, { getActiveMapWidgetId: () => "" }).host;
    expect(getMapLoadingState(none, null)).toBe(false);
    const { host } = makeDashboardHost();
    expect(getMapLoadingState(host, null)).toBe(true);
    host.embeddedMapReady = true;
    expect(getMapLoadingState(host, null)).toBe(false);
    expect(getMapLoadingState(host, jmv(fakeView(false)))).toBe(true);
    expect(getMapLoadingState(host, jmv(fakeView(true)))).toBe(false);
  });

  test("detachMapLoadingWatchers removes handles and clears the timer", () => {
    const { host } = makeDashboardHost();
    const remove = jest.fn();
    host.mapReadyWatchHandle = { remove };
    host.mapLoadingRetryTimer = setTimeout(() => undefined, 1000);
    detachMapLoadingWatchers(host);
    expect(remove).toHaveBeenCalled();
    expect(host.mapReadyWatchHandle).toBeNull();
    expect(host.mapLoadingRetryTimer).toBeNull();
  });
});

describe("attachMapLoadingWatchers", () => {
  afterEach(() => jest.useRealTimers());

  test("no map widget clears loading", () => {
    const { host } = makeDashboardHost({ mapLoading: true }, { getActiveMapWidgetId: () => "" });
    attachMapLoadingWatchers(host);
    expect(host.state.mapLoading).toBe(false);
    expect(host.lastMapWatchWidgetId).toBe("");
  });

  test("polls while the view is missing and gives up after max attempts", () => {
    jest.useFakeTimers();
    const { host } = makeDashboardHost();
    attachMapLoadingWatchers(host);
    expect(host.state.mapLoading).toBe(true);
    expect(host.mapViewWatchAttempts).toBe(1);
    expect(host.lastMapWatchWidgetId).toBe("map1");
    jest.advanceTimersByTime(MAP_VIEW_WATCH_INTERVAL_MS * (MAP_VIEW_WATCH_MAX_ATTEMPTS + 2));
    expect(host.mapViewWatchAttempts).toBe(MAP_VIEW_WATCH_MAX_ATTEMPTS);
    expect(host.state.mapLoading).toBe(false);
  });

  test("watches ready on a new view and short-circuits for the same view", () => {
    const view = fakeView(false);
    mockResolve.mockReturnValue(jmv(view));
    const { host } = makeDashboardHost();
    attachMapLoadingWatchers(host);
    expect(view.watch).toHaveBeenCalledWith("ready", expect.any(Function));
    expect(view.when).toHaveBeenCalled();
    expect(host.watchedMapView).toBe(view);
    expect(host.state.mapLoading).toBe(true);

    view.ready = true;
    attachMapLoadingWatchers(host);
    expect(view.watch).toHaveBeenCalledTimes(1);
    expect(host.state.mapLoading).toBe(false);
  });

  test("scheduleMapLoadingWatchers defers attach", () => {
    jest.useFakeTimers();
    const attach = jest.fn();
    const { host } = makeDashboardHost({}, { attachMapLoadingWatchers: attach });
    scheduleMapLoadingWatchers(host, 50);
    scheduleMapLoadingWatchers(host, 50);
    jest.advanceTimersByTime(60);
    expect(attach).toHaveBeenCalledTimes(1);
    expect(host.mapLoadingRetryTimer).toBeNull();
  });
});

describe("dashboard loading state", () => {
  test("detects loading markers inside the dashboard root", () => {
    const { host } = makeDashboardHost();
    expect(getDashboardLoadingState(host)).toBe(false);
    const root = document.createElement("div");
    setRef(host.dashboardRootRef, root);
    expect(getDashboardLoadingState(host)).toBe(false);
    const spinner = document.createElement("div");
    spinner.className = "loading-indicator";
    root.appendChild(spinner);
    updateDashboardLoadingState(host);
    expect(host.state.dashboardLoading).toBe(true);
  });
});
