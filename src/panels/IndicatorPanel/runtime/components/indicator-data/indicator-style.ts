import type { IndicatorWidgetHost } from "../../indicator-host";
import type { IndicatorConfig } from "../../widget";

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
export const handleThemeChange = (host: IndicatorWidgetHost, event: any): void => {
  const detail = (event as CustomEvent)?.detail;
  if (detail?.theme) {
    host.setState({ isDarkTheme: detail.theme === "dark" });
  } else {
    host.initializeTheme();
  }
};
export const getCustomStyles = (host: IndicatorWidgetHost) => {
  const cfg = (host.props.config || {}) as IndicatorConfig;

  const backgroundColorRaw = (cfg.backgroundColor ?? "").toString().trim();
  const hasBgOverride = backgroundColorRaw.length > 0;

  const textColorRaw = (cfg.textColor ?? "").toString().trim();
  const labelColorRaw = (cfg.labelColor ?? "").toString().trim();

  const borderRadiusCfg =
    typeof cfg.borderRadius === "number"
      ? cfg.borderRadius
      : typeof cfg.borderRadius === "string" && cfg.borderRadius.trim() !== ""
        ? Number(cfg.borderRadius)
        : null;

  const iconSizeCfg =
    typeof cfg.iconSize === "number"
      ? cfg.iconSize
      : typeof cfg.iconSize === "string" && cfg.iconSize.trim() !== ""
        ? Number(cfg.iconSize)
        : null;

  const iconOpacityCfg =
    typeof cfg.iconOpacity === "number"
      ? cfg.iconOpacity
      : typeof cfg.iconOpacity === "string" && cfg.iconOpacity.trim() !== ""
        ? Number(cfg.iconOpacity)
        : null;

  const containerStyles: any = {};

  if (borderRadiusCfg != null && Number.isFinite(borderRadiusCfg))
    containerStyles.borderRadius = `${borderRadiusCfg}px`;
  if (textColorRaw) containerStyles.color = textColorRaw;

  if (hasBgOverride) {
    const isGradient = /gradient/i.test(backgroundColorRaw);
    if (isGradient) containerStyles.background = backgroundColorRaw;
    else containerStyles.backgroundColor = backgroundColorRaw;
  }

  const statLabel: any = {};
  if (labelColorRaw) statLabel.color = labelColorRaw;

  const statValue: any = {};
  if (textColorRaw) statValue.color = textColorRaw;

  const iconContainer: any = {};
  if (iconSizeCfg != null && Number.isFinite(iconSizeCfg)) {
    iconContainer.width = `${iconSizeCfg}px`;
    iconContainer.height = `${iconSizeCfg}px`;
  }

  const icon: any = {};
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
