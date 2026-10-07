import type { IndicatorWidgetHost } from "../../indicator-host";
import type { React } from "jimu-core";
import type { IndicatorConfig } from "../../widget";
import { readPanelEventDetail } from "../../../../panel-filter-detail";

export interface IndicatorCustomStyles {
  container: React.CSSProperties;
  statLabel: React.CSSProperties;
  statValue: React.CSSProperties;
  iconContainer: React.CSSProperties;
  icon: React.CSSProperties;
  hasBgOverride: boolean;
}

/** Number from a config value that may be typed as number or numeric string. */
const readConfigNumber = (value: number | string | undefined): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return null;
};

export function setupAutoRefresh(host: IndicatorWidgetHost) {
  if (host.refreshTimer) {
    clearInterval(host.refreshTimer);
    host.refreshTimer = null;
  }

  const { autoRefresh, refreshInterval } = (host.props.config ||
    {}) as IndicatorConfig;
  if (autoRefresh !== false && refreshInterval) {
    const intervalMs = (refreshInterval || 5) * 60 * 1000;
    // Restart the interval each time this is called so that a filter
    // change (which already triggers refreshData immediately) resets the
    // countdown — avoiding a redundant server round-trip shortly after.
    host.refreshTimer = setInterval(() => {
      if (!host._isMounted) return;
      // Only auto-refresh when the user is not actively interacting
      // (filter changes already trigger refreshData via masterFilterChanged).
      const idleMs = Date.now() - (host._lastFilterEventMs ?? 0);
      if (idleMs >= intervalMs) host.refreshData();
    }, intervalMs);
  }
}
export const initializeTheme = (host: IndicatorWidgetHost): void => {
  const saved = window.localStorage?.getItem("agri_v11_app_theme");
  const dom = document.documentElement.getAttribute("data-theme");
  let isDarkTheme = true;
  if (saved !== null && saved !== undefined) {
    isDarkTheme = saved === "dark";
  } else if (dom === "light" || dom === "dark") {
    isDarkTheme = dom === "dark";
  }
  host.setState({ isDarkTheme });
};
export const handleThemeChange = (host: IndicatorWidgetHost, event: Event): void => {
  const detail = readPanelEventDetail(event);
  if (detail.theme) {
    host.setState({ isDarkTheme: detail.theme === "dark" });
  } else {
    host.initializeTheme();
  }
};
export const getCustomStyles = (host: IndicatorWidgetHost): IndicatorCustomStyles => {
  const cfg = (host.props.config || {}) as IndicatorConfig;

  const backgroundColorRaw = (cfg.backgroundColor ?? "").toString().trim();
  const hasBgOverride = backgroundColorRaw.length > 0;

  const textColorRaw = (cfg.textColor ?? "").toString().trim();
  const labelColorRaw = (cfg.labelColor ?? "").toString().trim();

  const borderRadiusCfg = readConfigNumber(cfg.borderRadius);
  const iconSizeCfg = readConfigNumber(cfg.iconSize);
  const iconOpacityCfg = readConfigNumber(cfg.iconOpacity);

  const containerStyles: React.CSSProperties = {};

  if (borderRadiusCfg != null && Number.isFinite(borderRadiusCfg))
    containerStyles.borderRadius = `${borderRadiusCfg}px`;
  if (textColorRaw) containerStyles.color = textColorRaw;

  if (hasBgOverride) {
    const isGradient = /gradient/i.test(backgroundColorRaw);
    if (isGradient) containerStyles.background = backgroundColorRaw;
    else containerStyles.backgroundColor = backgroundColorRaw;
  }

  const statLabel: React.CSSProperties = {};
  if (labelColorRaw) statLabel.color = labelColorRaw;

  const statValue: React.CSSProperties = {};
  if (textColorRaw) statValue.color = textColorRaw;

  const iconContainer: React.CSSProperties = {};
  if (iconSizeCfg != null && Number.isFinite(iconSizeCfg)) {
    iconContainer.width = `${iconSizeCfg}px`;
    iconContainer.height = `${iconSizeCfg}px`;
  }

  const icon: React.CSSProperties = {};
  if (iconOpacityCfg != null && Number.isFinite(iconOpacityCfg)) {
    icon.opacity = Math.max(0, Math.min(1, iconOpacityCfg / 100));
  }

  return {
    container: containerStyles,
    statLabel,
    statValue,
    iconContainer,
    icon,
    hasBgOverride,
  };
};
