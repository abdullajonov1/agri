import type { LocalizationHost } from "../host";

/** Minimal host slices used by the Toolbar notification service (type-only). */
export type NotificationHydrateHost = Pick<LocalizationHost, "_notificationLoadStarted" | "setState">;

export type NotificationDashboardPackHost = Pick<
  LocalizationHost,
  "_notificationWidgetsReady" | "_notificationPaintFrame" | "_isMounted" | "beginNotificationPrefetch"
>;

export type NotificationPrefetchHost = Pick<
  LocalizationHost,
  "_isMounted" | "_notificationWidgetsReady" | "_notificationLoadStarted" | "setState" | "loadNotificationFeed"
>;

export type NotificationMenuOpenedHost = Pick<
  LocalizationHost,
  | "state"
  | "_isMounted"
  | "_notificationWidgetsReady"
  | "_notificationLoadStarted"
  | "setState"
  | "loadNotificationFeed"
  | "beginNotificationPrefetch"
>;

export type NotificationFeedHost = Pick<
  LocalizationHost,
  | "_isMounted"
  | "_notificationWidgetsReady"
  | "_notificationLoadStarted"
  | "_notificationLoadToken"
  | "_regionToViloyat"
  | "setState"
  | "fetchAndStoreRegionDistrictMappings"
>;

export type NotificationLanguageHost = Pick<LocalizationHost, "state">;

export type NotificationRegionNameHost = Pick<LocalizationHost, "state" | "_regionToViloyat">;

export type NotificationScrollHost = Pick<
  LocalizationHost,
  "_isMounted" | "_notificationBodyRef" | "state" | "setState"
>;
