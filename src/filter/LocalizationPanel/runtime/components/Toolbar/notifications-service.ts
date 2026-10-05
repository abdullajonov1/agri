import {
  getAgriVegetationIndicesLayer,
  peekVegetationRecentDayRegionCounts,
  queryVegetationRecentDayRegionCounts,
} from "../../../../../gis/agri-vegetation-data-source";
import { regionSoatoToDisplayName } from "../../../../../gis/feature-layer-data";
import { translateAgriPlaceForDisplay } from "../../../../../shared/agri-place-display";
import type { LocalizationHost } from "../host";

/** localStorage hit only — no layer load and no statistics request. */
export const hydrateNotificationCache = (host: LocalizationHost): void => {
  const cached = peekVegetationRecentDayRegionCounts(5);
  if (!cached) return;
  host._notificationLoadStarted = true;
  host.setState({
    notificationDays: cached,
    notificationLoading: false,
    notificationError: null,
  });
};

export const onDashboardPackForNotifications = (host: LocalizationHost, pack: {
  phase?: string;
  filter?: { yil?: string };
}): void => {
  if (host._notificationWidgetsReady) return;
  const yil = String(pack?.filter?.yil || "").trim();
  if (!yil) return;
  if (pack.phase !== "ready" && pack.phase !== "error") return;
  host._notificationWidgetsReady = true;
  if (host._notificationPaintFrame) {
    cancelAnimationFrame(host._notificationPaintFrame);
  }
  // Wait until the widget frame has been painted, then start the feed.
  host._notificationPaintFrame = requestAnimationFrame(() => {
    host._notificationPaintFrame = requestAnimationFrame(() => {
      host._notificationPaintFrame = 0;
      if (!host._isMounted) return;
      host.beginNotificationPrefetch();
    });
  });
};

export const beginNotificationPrefetch = (host: LocalizationHost): void => {
  if (!host._isMounted || !host._notificationWidgetsReady) return;
  if (host._notificationLoadStarted) return;
  host._notificationLoadStarted = true;
  const cached = peekVegetationRecentDayRegionCounts(5);
  if (cached) {
    host.setState({
      notificationDays: cached,
      notificationLoading: false,
      notificationError: null,
    });
    return;
  }
  void host.loadNotificationFeed();
};

export const onNotificationsMenuOpened = (host: LocalizationHost): void => {
  if (host.state.notificationError) {
    if (!host._notificationWidgetsReady) return;
    host._notificationLoadStarted = false;
    void host.loadNotificationFeed();
    return;
  }
  if (host.state.notificationDays.length) return;
  if (host._notificationLoadStarted) return;
  if (!host._notificationWidgetsReady) {
    host.setState({ notificationLoading: true, notificationError: null });
    return;
  }
  host.beginNotificationPrefetch();
};

export const loadNotificationFeed = async (host: LocalizationHost): Promise<void> => {
  if (!host._notificationWidgetsReady) return;
  host._notificationLoadStarted = true;
  const token = ++host._notificationLoadToken;
  if (!host._isMounted) return;
  host.setState({ notificationLoading: true, notificationError: null });
  try {
    // Drop stale notification aggregates from older logic (row-count / skip-empty window).
    try {
      const prefix = "agri_v5_pc:veg-recent-days:";
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          key.startsWith(prefix) &&
          !key.includes("v8-processed_at-calendar-window")
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore */
    }
    // Warm portal token + region id → viloyat names from Agri_table_data.
    await Promise.all([
      getAgriVegetationIndicesLayer(),
      Object.keys(host._regionToViloyat).length
        ? Promise.resolve()
        : host.fetchAndStoreRegionDistrictMappings(),
    ]);
    const days = await queryVegetationRecentDayRegionCounts(5);
    if (!host._isMounted || token !== host._notificationLoadToken) return;
    try {
      // eslint-disable-next-line no-console
      console.log("[AgriNotify] UI received days", days);
    } catch {
      /* ignore */
    }
    host.setState({
      notificationDays: days,
      notificationLoading: false,
      notificationError: null,
    });
  } catch (err: any) {
    if (!host._isMounted || token !== host._notificationLoadToken) return;
    host.setState({
      notificationLoading: false,
      notificationError: String(err?.message || err || "Failed to load"),
    });
  }
};

export const formatNotificationDate = (host: LocalizationHost, ymd: string): string => {
  const parts = String(ymd || "").split("-");
  if (parts.length !== 3) return ymd;
  const [y, m, d] = parts;
  if (host.state.language === "en") return `${m}/${d}/${y}`;
  return `${d}.${m}.${y}`;
};

export const resolveRegionNotificationName = (host: LocalizationHost, regionCode: string): string => {
  const code = String(regionCode || "").trim();
  // Prefer live Agri_table_data mapping (region → viloyat); static map is fallback only.
  const rawName =
    host._regionToViloyat[code] ||
    regionSoatoToDisplayName(code) ||
    code;
  return translateAgriPlaceForDisplay(
    rawName,
    host.state.language,
    "region",
  );
};

export const formatFieldCount = (host: LocalizationHost, value: number): string => {
  const lang = host.state.language;
  const locale =
    lang === "en" ? "en-US" : lang === "ru" ? "ru-RU" : "uz-UZ";
  try {
    return Number(value || 0).toLocaleString(locale);
  } catch {
    return String(value || 0);
  }
};

export const updateNotificationScrollHint = (host: LocalizationHost): void => {
  if (!host._isMounted) return;
  const el = host._notificationBodyRef.current;
  const canScroll = !!(
    el &&
    el.scrollHeight - el.scrollTop - el.clientHeight > 10
  );
  if (canScroll !== host.state.notificationCanScrollDown) {
    host.setState({ notificationCanScrollDown: canScroll });
  }
};
