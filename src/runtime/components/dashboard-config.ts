/**
 * Pure config / layout helpers for the AgriDashboard shell. No React or
 * ArcGIS runtime: everything here maps plain (or seamless-immutable) config
 * values to the plain objects the embedded panels receive.
 */
import type { UseDataSource } from "jimu-core";
import type { AgriPopupConfig, IndicatorChildConfig } from "../../config";
import { hasAsMutable } from "../../shared/agri-plain-object";

export const DEFAULT_LEFT_PANEL_WIDTH_PERCENT = 26;
const MIN_LEFT_PANEL_WIDTH_PERCENT = 18;
const MAX_LEFT_PANEL_WIDTH_PERCENT = 45;

export const DEFAULT_BOTTOM_ROW_FRACTION = 38;
const MIN_BOTTOM_ROW_FRACTION = 28;
const MAX_BOTTOM_ROW_FRACTION = 55;

/** Vegetation TIFF export can outlast a map redraw (export-image timeout ~25s). */
const VEGETATION_SURFACE_LOADING_SAFETY_MS = 28000;
const MAP_SURFACE_LOADING_SAFETY_MS = 12000;

/** seamless-immutable values expose `asMutable`; plain objects do not. */
export const hasAsMutableFn = hasAsMutable;

/** Deep-unwrap an immutable config, or shallow-copy a plain one. */
export function toPlainConfigRecord(cfg: unknown): Record<string, unknown> {
  if (hasAsMutableFn(cfg)) {
    return cfg.asMutable({ deep: true }) as Record<string, unknown>;
  }
  return { ...(cfg as Record<string, unknown>) };
}

/** Same unwrapping for the `agriPopup` sub-config; falsy values become `{}`. */
export function toPlainPopupConfig(value: unknown): AgriPopupConfig {
  if (!value) return {};
  if (hasAsMutableFn(value)) {
    return value.asMutable({ deep: true }) as AgriPopupConfig;
  }
  return { ...(value as AgriPopupConfig) };
}

/** `props.useDataSources` (immutable array, plain array or missing) as a plain array. */
export function toMutableUseDataSources(value: unknown): UseDataSource[] {
  if (hasAsMutable<UseDataSource[]>(value)) {
    return value.asMutable({ deep: true });
  }
  return Array.from((value as ArrayLike<UseDataSource>) || []);
}

/** Plain config handed to the embedded Indicator (crop area) panel. */
export function buildIndicatorChildConfig(
  baseConfig: Record<string, unknown>,
): Record<string, unknown> {
  const indicator = (baseConfig.indicator || {}) as IndicatorChildConfig;
  const endpoint = String(
    indicator.apiEndpoint || indicator.apiUrl || "",
  ).trim();
  const useApiDataSource =
    indicator.useApiDataSource === true && endpoint.length > 0;

  return {
    useApiDataSource,
    apiEndpoint: endpoint,
    responseField: indicator.responseField || "total",
    statOperation: indicator.statOperation || "sum",
    attributeField: indicator.attributeField || "maydon",
    label: indicator.label || "Ekin maydonlari",
    unitLabel: indicator.unitLabel || "ga",
    decimalPlaces: indicator.decimalPlaces ?? 0,
    excludeZeroValues: indicator.excludeZeroValues !== false,
    mapOverlayMode: true,
  };
}

/** Plain config handed to the embedded Popup panel. */
export function buildPopupChildConfig(
  popup: AgriPopupConfig,
): Record<string, unknown> {
  return {
    fieldsToShow: popup.fieldsToShow || [],
    titleField: popup.titleField || "",
    labels: popup.labels || {},
    settings: {
      zoomToSelection: popup.settings?.zoomToSelection !== false,
      showMapPopup: !!popup.settings?.showMapPopup,
      showAttachments: popup.settings?.showAttachments !== false,
    },
    selectedFieldsMap: popup.selectedFieldsMap,
    chartEnabled: !!popup.chartEnabled,
    chartType: popup.chartType || "bar",
    chartTitle: popup.chartTitle || "",
    chartFields: popup.chartFields || [],
    chartColor: popup.chartColor || "#00a8e8",
  };
}

/** CSS width of the left (Region) column for a configured percentage. */
export function leftPanelWidthCss(rawPercent: unknown): string {
  const raw = Number(rawPercent ?? DEFAULT_LEFT_PANEL_WIDTH_PERCENT);
  const pct = Number.isFinite(raw)
    ? Math.min(
        MAX_LEFT_PANEL_WIDTH_PERCENT,
        Math.max(MIN_LEFT_PANEL_WIDTH_PERCENT, raw),
      )
    : DEFAULT_LEFT_PANEL_WIDTH_PERCENT;
  // Slight bump from base 25%; kept smaller than the earlier +1cm enlarge.
  return `calc(${pct}% + 0.35cm)`;
}

/** Top / bottom grid-row `fr` values for a configured bottom-row fraction. */
export function rowFrValues(rawFraction: unknown): { top: number; bottom: number } {
  const raw = Number(rawFraction ?? DEFAULT_BOTTOM_ROW_FRACTION);
  const bottom = Number.isFinite(raw)
    ? Math.min(MAX_BOTTOM_ROW_FRACTION, Math.max(MIN_BOTTOM_ROW_FRACTION, raw))
    : DEFAULT_BOTTOM_ROW_FRACTION;
  return { top: 100 - bottom, bottom };
}

/** How long the map-surface spinner may stay up before the safety timer clears it. */
export function mapSurfaceLoadingSafetyMs(reason: unknown): number {
  const text = String(reason || "");
  return text === "vegetation-raster" || text === "vegetation-raster-cancel"
    ? VEGETATION_SURFACE_LOADING_SAFETY_MS
    : MAP_SURFACE_LOADING_SAFETY_MS;
}
