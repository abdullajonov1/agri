jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({
  getAgriVegetationIndicesLayer: jest.fn(() => Promise.resolve({})),
  peekVegetationRecentDayRegionCounts: jest.fn((): null => null),
  queryVegetationRecentDayRegionCounts: jest.fn(() => Promise.resolve([])),
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  regionSoatoToDisplayName: jest.fn((code: string) =>
    code === "1703" ? "Andijon viloyati" : "",
  ),
}));

import {
  getAgriVegetationIndicesLayer,
  peekVegetationRecentDayRegionCounts,
  queryVegetationRecentDayRegionCounts,
  type VegetationRecentDayGroup,
} from "../../../../../gis/agri-vegetation-data-source";
import { makeFakeHost } from "../__test-utils__/fake-host";
import {
  beginNotificationPrefetch,
  formatFieldCount,
  formatNotificationDate,
  hydrateNotificationCache,
  loadNotificationFeed,
  onDashboardPackForNotifications,
  onNotificationsMenuOpened,
  resolveRegionNotificationName,
  updateNotificationScrollHint,
} from "./notifications-service";

const peekMock = jest.mocked(peekVegetationRecentDayRegionCounts);
const queryMock = jest.mocked(queryVegetationRecentDayRegionCounts);
const layerMock = jest.mocked(getAgriVegetationIndicesLayer);

const DAYS: VegetationRecentDayGroup[] = [
  {
    date: "2025-06-01",
    totalFields: 3,
    regions: [{ regionCode: "1703", fieldCount: 3 }],
  } as VegetationRecentDayGroup,
];

describe("notifications-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    peekMock.mockReturnValue(null);
    localStorage.clear();
  });

  test("hydrateNotificationCache does nothing on cache miss", () => {
    const host = makeFakeHost();
    hydrateNotificationCache(host);
    expect(host.setState).not.toHaveBeenCalled();
    expect(host._notificationLoadStarted).toBe(false);
  });

  test("hydrateNotificationCache fills state from cache", () => {
    peekMock.mockReturnValue(DAYS);
    const host = makeFakeHost();
    hydrateNotificationCache(host);
    expect(host._notificationLoadStarted).toBe(true);
    expect(host.state.notificationDays).toBe(DAYS);
  });

  describe("onDashboardPackForNotifications", () => {
    let rafSpy: jest.SpyInstance<number, [FrameRequestCallback]>;
    beforeEach(() => {
      rafSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback): number => {
          cb(0);
          return 7;
        });
    });
    afterEach(() => rafSpy.mockRestore());

    test("ignores packs without year or non-final phase", () => {
      const begin = jest.fn();
      const host = makeFakeHost({ beginNotificationPrefetch: begin });
      onDashboardPackForNotifications(host, { phase: "ready", filter: {} });
      onDashboardPackForNotifications(host, { phase: "loading", filter: { yil: "2025" } });
      expect(host._notificationWidgetsReady).toBe(false);
      expect(begin).not.toHaveBeenCalled();
    });

    test("starts prefetch after two frames once ready", () => {
      const begin = jest.fn();
      const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation((): void => undefined);
      const host = makeFakeHost({
        beginNotificationPrefetch: begin,
        _notificationPaintFrame: 3,
      });
      onDashboardPackForNotifications(host, { phase: "ready", filter: { yil: "2025" } });
      expect(cancel).toHaveBeenCalledWith(3);
      expect(host._notificationWidgetsReady).toBe(true);
      expect(begin).toHaveBeenCalledTimes(1);
      // second call is ignored once ready
      onDashboardPackForNotifications(host, { phase: "error", filter: { yil: "2025" } });
      expect(begin).toHaveBeenCalledTimes(1);
      cancel.mockRestore();
    });

    test("does not prefetch when unmounted before paint", () => {
      const begin = jest.fn();
      const host = makeFakeHost({ beginNotificationPrefetch: begin, _isMounted: false });
      onDashboardPackForNotifications(host, { phase: "error", filter: { yil: "2024" } });
      expect(begin).not.toHaveBeenCalled();
    });
  });

  describe("beginNotificationPrefetch", () => {
    test("requires mount + ready + not started", () => {
      const load = jest.fn(() => Promise.resolve());
      const host = makeFakeHost({ loadNotificationFeed: load });
      beginNotificationPrefetch(host);
      expect(load).not.toHaveBeenCalled();
      host._notificationWidgetsReady = true;
      host._notificationLoadStarted = true;
      beginNotificationPrefetch(host);
      expect(load).not.toHaveBeenCalled();
    });

    test("uses cache when available, otherwise loads feed", () => {
      const load = jest.fn(() => Promise.resolve());
      peekMock.mockReturnValue(DAYS);
      const cached = makeFakeHost({ loadNotificationFeed: load, _notificationWidgetsReady: true });
      beginNotificationPrefetch(cached);
      expect(cached.state.notificationDays).toBe(DAYS);
      expect(load).not.toHaveBeenCalled();

      peekMock.mockReturnValue(null);
      const cold = makeFakeHost({ loadNotificationFeed: load, _notificationWidgetsReady: true });
      beginNotificationPrefetch(cold);
      expect(load).toHaveBeenCalledTimes(1);
      expect(cold._notificationLoadStarted).toBe(true);
    });
  });

  describe("onNotificationsMenuOpened", () => {
    test("retries after an error when widgets are ready", () => {
      const load = jest.fn(() => Promise.resolve());
      const host = makeFakeHost({
        loadNotificationFeed: load,
        _notificationWidgetsReady: true,
        _notificationLoadStarted: true,
        state: { notificationError: "boom" },
      });
      onNotificationsMenuOpened(host);
      expect(load).toHaveBeenCalled();
      expect(host._notificationLoadStarted).toBe(false);
    });

    test("does not retry an error before widgets are ready", () => {
      const load = jest.fn(() => Promise.resolve());
      const host = makeFakeHost({ loadNotificationFeed: load, state: { notificationError: "x" } });
      onNotificationsMenuOpened(host);
      expect(load).not.toHaveBeenCalled();
    });

    test("shows loading while widgets are not ready", () => {
      const host = makeFakeHost();
      onNotificationsMenuOpened(host);
      expect(host.state.notificationLoading).toBe(true);
    });

    test("skips when days exist or load already started", () => {
      const begin = jest.fn();
      const withDays = makeFakeHost({ beginNotificationPrefetch: begin, state: { notificationDays: DAYS } });
      onNotificationsMenuOpened(withDays);
      const started = makeFakeHost({ beginNotificationPrefetch: begin, _notificationLoadStarted: true });
      onNotificationsMenuOpened(started);
      expect(begin).not.toHaveBeenCalled();
      const ready = makeFakeHost({ beginNotificationPrefetch: begin, _notificationWidgetsReady: true });
      onNotificationsMenuOpened(ready);
      expect(begin).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadNotificationFeed", () => {
    test("returns early when widgets are not ready", async () => {
      const host = makeFakeHost();
      await loadNotificationFeed(host);
      expect(host.setState).not.toHaveBeenCalled();
    });

    test("loads days, drops stale cache keys and fetches mappings", async () => {
      localStorage.setItem("agri_v5_pc:veg-recent-days:old", "1");
      localStorage.setItem("agri_v5_pc:veg-recent-days:v8-processed_at-calendar-window", "2");
      localStorage.setItem("other", "3");
      queryMock.mockResolvedValue(DAYS);
      const fetchMappings = jest.fn(() => Promise.resolve());
      const host = makeFakeHost({
        _notificationWidgetsReady: true,
        fetchAndStoreRegionDistrictMappings: fetchMappings,
      });
      await loadNotificationFeed(host);
      expect(layerMock).toHaveBeenCalled();
      expect(fetchMappings).toHaveBeenCalled();
      expect(host.state.notificationDays).toBe(DAYS);
      expect(host.state.notificationLoading).toBe(false);
      expect(localStorage.getItem("agri_v5_pc:veg-recent-days:old")).toBeNull();
      expect(localStorage.getItem("agri_v5_pc:veg-recent-days:v8-processed_at-calendar-window")).toBe("2");
      expect(localStorage.getItem("other")).toBe("3");
    });

    test("skips mapping fetch when region names are known", async () => {
      const fetchMappings = jest.fn(() => Promise.resolve());
      const host = makeFakeHost({
        _notificationWidgetsReady: true,
        _regionToViloyat: { "1703": "Andijon" },
        fetchAndStoreRegionDistrictMappings: fetchMappings,
      });
      await loadNotificationFeed(host);
      expect(fetchMappings).not.toHaveBeenCalled();
    });

    test("reports errors", async () => {
      queryMock.mockRejectedValue(new Error("offline"));
      const host = makeFakeHost({ _notificationWidgetsReady: true, _regionToViloyat: { a: "b" } });
      await loadNotificationFeed(host);
      expect(host.state.notificationError).toBe("offline");
      expect(host.state.notificationLoading).toBe(false);
    });

    test("ignores a stale response", async () => {
      let resolveDays: (d: VegetationRecentDayGroup[]) => void = () => undefined;
      queryMock.mockReturnValue(new Promise((r) => { resolveDays = r; }));
      const host = makeFakeHost({ _notificationWidgetsReady: true, _regionToViloyat: { a: "b" } });
      const pending = loadNotificationFeed(host);
      host._notificationLoadToken += 1;
      await Promise.resolve();
      await Promise.resolve();
      resolveDays(DAYS);
      await pending;
      expect(host.state.notificationDays).toEqual([]);
    });
  });

  test("formatNotificationDate per language", () => {
    expect(formatNotificationDate(makeFakeHost({ state: { language: "en" } }), "2025-06-01")).toBe("06/01/2025");
    expect(formatNotificationDate(makeFakeHost({ state: { language: "ru" } }), "2025-06-01")).toBe("01.06.2025");
    expect(formatNotificationDate(makeFakeHost(), "bad")).toBe("bad");
  });

  test("resolveRegionNotificationName prefers live mapping, then static, then code", () => {
    const host = makeFakeHost({ _regionToViloyat: { "1706": "Buxoro viloyati" }, state: { language: "uz_lat" } });
    expect(resolveRegionNotificationName(host, "1706")).toContain("Buxoro");
    expect(resolveRegionNotificationName(host, " 1703 ")).toContain("Andijon");
    expect(resolveRegionNotificationName(host, "9999")).toBe("9999");
  });

  test("formatFieldCount groups digits per locale", () => {
    expect(formatFieldCount(makeFakeHost({ state: { language: "en" } }), 12345)).toBe("12,345");
    expect(formatFieldCount(makeFakeHost({ state: { language: "ru" } }), 0)).toBe("0");
    expect(formatFieldCount(makeFakeHost({ state: { language: "uz_lat" } }), Number.NaN)).toMatch(/0|NaN/);
  });

  describe("updateNotificationScrollHint", () => {
    const bodyWith = (scrollHeight: number, scrollTop: number, clientHeight: number): HTMLDivElement => {
      const el = document.createElement("div");
      Object.defineProperty(el, "scrollHeight", { value: scrollHeight });
      Object.defineProperty(el, "clientHeight", { value: clientHeight });
      el.scrollTop = scrollTop;
      return el;
    };

    test("sets the hint only when it changes", () => {
      const host = makeFakeHost({ _notificationBodyRef: { current: bodyWith(500, 0, 200) } });
      updateNotificationScrollHint(host);
      expect(host.state.notificationCanScrollDown).toBe(true);
      updateNotificationScrollHint(host);
      expect(host.setState).toHaveBeenCalledTimes(1);
    });

    test("no hint without element or when unmounted", () => {
      const host = makeFakeHost();
      updateNotificationScrollHint(host);
      expect(host.setState).not.toHaveBeenCalled();
      const unmounted = makeFakeHost({ _isMounted: false, state: { notificationCanScrollDown: true } });
      updateNotificationScrollHint(unmounted);
      expect(unmounted.setState).not.toHaveBeenCalled();
    });
  });
});
