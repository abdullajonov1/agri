/**
 * Query URL resolution, the shared one-hour query caches, and small helpers
 * (layer label, extent validation, opt-in debug log) used by every query path.
 */
import type { AgriLayerLike } from "../agri-layer-types";

/** Disabled by default. Enable: localStorage agri_fl_data_debug=1 */
export function flLog(phase: string, detail?: Record<string, unknown>): void {
  try {
    if (globalThis.localStorage?.getItem("agri_fl_data_debug") !== "1") return;
    (globalThis as { console?: Console }).console?.log?.("[AgriFLData]", phase, detail ?? {});
  } catch {
    /* storage access can throw in sandboxed iframes — logging is optional */
  }
}

export function layerLabel(layer: AgriLayerLike | null | undefined): string {
  return String(layer?.title || layer?.url || layer?.id || "unknown");
}

export function getQueryUrl(layer: AgriLayerLike | null | undefined): string {
  const base = String(layer?.url || "").replace(/\/+$/, "");
  if (!base) return "";
  const layerId = layer?.layerId;
  const hasIndex = /\/\d+$/.test(base);
  const withIndex =
    hasIndex || layerId === undefined || layerId === null
      ? base
      : `${base}/${layerId}`;
  return `${withIndex}/query`;
}

export const QUERY_CACHE_TTL_MS = 60 * 60 * 1000;

/** One statistics row (`outStatistics` / `groupBy` result attributes). */
export type AgriStatsRow = Record<string, unknown>;

type TimedPromiseCache<T> = Map<string, { expires: number; value: Promise<T> }>;
export const queryCountCache: TimedPromiseCache<number> = new Map();
export const queryStatsCache: TimedPromiseCache<AgriStatsRow[]> = new Map();
/** Raw REST JSON responses — shape depends on the query parameters. */
export const queryJsonCache: TimedPromiseCache<unknown> = new Map();

export function pruneTimedCache<T>(
  cache: TimedPromiseCache<T>,
  now = Date.now(),
): void {
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }
}

export function cacheKey(
  layer: AgriLayerLike | null | undefined,
  kind: string,
  payload: string,
): string {
  return `${getQueryUrl(layer) || layerLabel(layer)}|${kind}|${payload}`;
}

/** Deterministic JSON-ish serialization (sorted keys) for cache keys. */
export function stableCachePayload(value: unknown): string {
  if (value === undefined) return "__undefined__";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableCachePayload(item)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableCachePayload(obj[key])}`)
    .join(",")}}`;
}

/** Envelope fields read by isValidMapExtent (esri Extent or REST JSON). */
export interface ExtentLike {
  xmin?: number | null;
  ymin?: number | null;
  xmax?: number | null;
  ymax?: number | null;
}

/** Validate extent envelope before view.goTo (guards null / world bounds). */
export function isValidMapExtent(extent: ExtentLike | null | undefined): boolean {
  if (!extent) return false;
  const xmin = Number(extent.xmin ?? 0);
  const ymin = Number(extent.ymin ?? 0);
  const xmax = Number(extent.xmax ?? 0);
  const ymax = Number(extent.ymax ?? 0);
  return (
    Number.isFinite(xmin) &&
    Number.isFinite(ymin) &&
    Number.isFinite(xmax) &&
    Number.isFinite(ymax) &&
    !(xmin === 0 && ymin === 0 && xmax === 0 && ymax === 0) &&
    !(xmin === -180 && ymin === -90 && xmax === 180 && ymax === 90) &&
    Math.abs(xmax - xmin) > 0.001 &&
    Math.abs(ymax - ymin) > 0.001
  );
}
