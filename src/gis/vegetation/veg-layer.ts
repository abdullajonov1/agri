import { getAgriServiceUrls } from "../../shared/agri-service-urls";
import { createSingletonLayerLoader } from "../../shared/agri-singleton-layer-loader";
import { dedupedQueryFeatures } from "../../data/agri-query-gateway";
import { queryRestJson } from "../../data/agri-rest-query";
import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../shared/agri-http";
import type { AgriLayerUrlLike, AgriQueryableLayer } from "../../types/agri-layer";
import { agroV5Log } from "../../shared/agri-debug-log";
import { errorMessage } from "../agri-layer-types";
import { withVegAccessWhere } from "./veg-sql";
import type { AgriVegetationLayerHandle, VegQueryLike } from "./veg-types";

/** VH / crop-window diagnostics — opt-in via `window.__AGRO_V5_VH_DEBUG = true`. */
export function agriVhLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  agroV5Log(phase, detail, "agriVh");
}
/** Optional diagnostic hook; intentionally quiet in the published dashboard. */
export function agriVegetationLog(
  _phase: string,
  _detail?: Record<string, unknown>,
): void {
  /* no-op */
}
/** Notification feed diagnostics — summary only (avoid page spam). */
export function agriNotifyLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  if (
    phase === "query:start" ||
    phase === "query:done" ||
    phase === "dates:window" ||
    phase === "count:day-done" ||
    phase.endsWith(":error") ||
    phase.endsWith("-failed")
  ) {
    // Opt-in via `window.__AGRO_V5_DEBUG = true`.
    agroV5Log(phase, detail, "notify");
  }
}
export function getAgriVegetationIndicesUrl(): string {
  return getAgriServiceUrls().vegetationIndicesUrl;
}
const getAgriVegetationIndicesLayerCached = createSingletonLayerLoader(
  getAgriVegetationIndicesUrl,
  agriVegetationLog,
);
/**
 * Loads (once) the external agri_vegetation_indices Table by URL. Cached as
 * a singleton promise so every widget shares the same loaded layer instance
 * — mirrors getAgriTableDataLayer() in agri-table-data-source.ts.
 */
export async function getAgriVegetationIndicesLayer(): Promise<AgriVegetationLayerHandle> {
  return getAgriVegetationIndicesLayerCached();
}
export async function queryVegFeatures(
  layer: AgriQueryableLayer,
  query: VegQueryLike,
): Promise<__esri.FeatureSet> {
  const outFields = query.outFields;
  // Single choke point for access — do not also wrap at every WHERE builder.
  const where = withVegAccessWhere(String(query.where || "1=1"));
  return dedupedQueryFeatures(layer, {
    where,
    outFields: Array.isArray(outFields)
      ? outFields
      : outFields
        ? [String(outFields)]
        : undefined,
    // `?? undefined`: the gateway treats null and undefined identically.
    groupByFieldsForStatistics: query.groupByFieldsForStatistics ?? undefined,
    outStatistics: query.outStatistics ?? undefined,
    orderByFields: query.orderByFields ?? undefined,
    returnGeometry: query.returnGeometry ?? false,
    returnDistinctValues: query.returnDistinctValues ?? undefined,
    num: query.num ?? undefined,
    resultRecordCount: query.resultRecordCount ?? undefined,
    resultOffset: query.resultOffset ?? undefined,
  });
}
function resolveVegetationQueryUrl(
  layer: AgriLayerUrlLike | null | undefined,
): string {
  const raw = String(layer?.url || getAgriVegetationIndicesUrl() || "").replace(
    /\/$/,
    "",
  );
  if (/\/FeatureServer\/\d+$/i.test(raw)) return raw;
  if (/\/FeatureServer$/i.test(raw)) {
    const configured = String(getAgriVegetationIndicesUrl() || "").replace(
      /\/$/,
      "",
    );
    if (/\/FeatureServer\/\d+$/i.test(configured)) return configured;
  }
  return raw;
}
/**
 * ArcGIS: returnDistinctValues=true + returnCountOnly=true → distinct field count.
 * One HTTP call per region (typically 3–6 regions/day).
 */
export async function queryDistinctFieldCount(
  layer: AgriQueryableLayer,
  where: string,
  field: string,
): Promise<number | null> {
  // 1) FeatureLayer.queryFeatureCount with distinct flag
  try {
    // returnCountOnly is a REST param the JS API Query typings omit.
    const query: __esri.Query & { returnCountOnly?: boolean } =
      layer.createQuery();
    query.where = where;
    query.outFields = [field];
    query.returnDistinctValues = true;
    query.returnGeometry = false;
    query.returnCountOnly = true;
    if (typeof layer.queryFeatureCount === "function") {
      const count = await layer.queryFeatureCount(query);
      if (Number.isFinite(count) && count >= 0) return Number(count);
    }
  } catch (err) {
    agriNotifyLog("count:distinct-api-failed", {
      where: where.slice(0, 120),
      error: errorMessage(err),
    });
  }

  // 2) Direct REST (most reliable for returnCountOnly + returnDistinctValues)
  try {
    const base = resolveVegetationQueryUrl(layer);
    const data = await queryRestJson(
      `${base}/query`,
      {
        f: "json",
        where,
        outFields: field,
        returnDistinctValues: true,
        returnCountOnly: true,
        returnGeometry: false,
      },
      { timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS },
    );
    const count = Number(data.count);
    if (Number.isFinite(count) && count >= 0) return count;
  } catch (err) {
    agriNotifyLog("count:distinct-rest-failed", {
      where: where.slice(0, 120),
      error: errorMessage(err),
    });
  }

  return null;
}
