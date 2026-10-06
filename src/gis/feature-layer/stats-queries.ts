/**
 * Cached count / statistics queries (SUM, MEDIAN, grouped SUM / AVG) with the
 * mavsum-relaxation fallback used by the dashboard widgets.
 */
import { cacheKey, queryCountCache, QUERY_CACHE_TTL_MS, type PickWhereWithMavsumFallbackResult, queryStatsCache, flLog, layerLabel } from "./primitives";
import { pruneAgriQueryCache, countWhereUncached, runStatsQueryUncached, queryLayerJson } from "./layer-lookup";
import type { AgriStatsRow } from "./query-cache";
import { type AgriLayerLike, errorMessage } from "../agri-layer-types";

/** Fast feature count for layer selection (shared one-hour cache). */
export async function quickLayerFeatureCount(
  layer: AgriLayerLike | null | undefined,
  where: string,
): Promise<number> {
  return countWhere(layer, where);
}
/** Count features matching the WHERE clause (shared one-hour cache). */
export async function countWhere(
  layer: AgriLayerLike | null | undefined,
  where: string,
): Promise<number> {
  const w = where || "1=1";
  const key = cacheKey(layer, "count", w);
  const now = Date.now();
  pruneAgriQueryCache(now);
  const hit = queryCountCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const job = countWhereUncached(layer, w);
  queryCountCache.set(key, { expires: now + QUERY_CACHE_TTL_MS, value: job });
  return job;
}
/**
 * Region+year scoped layers may not store UI mavsum labels (e.g. Samarqand 2025).
 * Combined layers (e.g. test_gusniddin) may also store different mavsum/type_id values.
 * When strict WHERE returns 0 rows, retry without mavsum and/or land type.
 */
export async function pickWhereWithMavsumFallback(
  layer: AgriLayerLike | null | undefined,
  strictWhere: string,
  relaxedWhere: string,
  options?: { regionScoped?: boolean; allowRelax?: boolean },
): Promise<PickWhereWithMavsumFallbackResult> {
  const strict = String(strictWhere || "1=1").trim();
  const relaxed = String(relaxedWhere || strict).trim();
  const allowRelax = options?.allowRelax !== false && relaxed !== strict;

  const strictCount = await countWhere(layer, strict);
  if (strictCount > 0 || !allowRelax) {
    return { where: strict, count: strictCount, mavsumRelaxed: false };
  }

  const relaxedCount = await countWhere(layer, relaxed);
  if (relaxedCount > 0) {
    flLog("pickWhereWithMavsumFallback relaxed", {
      layer: layerLabel(layer),
      strictCount,
      relaxedCount,
      strictPreview:
        strict.length > 120 ? `${strict.slice(0, 120)}…` : strict,
    });
    return { where: relaxed, count: relaxedCount, mavsumRelaxed: true };
  }

  return { where: strict, count: strictCount, mavsumRelaxed: false };
}
async function runStatsQuery(
  layer: AgriLayerLike | null | undefined,
  where: string,
  outStatistics: Array<Record<string, unknown>>,
  groupBy?: string[],
): Promise<AgriStatsRow[]> {
  const w = where || "1=1";
  const payload = JSON.stringify({ outStatistics, groupBy: groupBy || [] });
  const key = cacheKey(layer, "stats", `${w}|${payload}`);
  const now = Date.now();
  pruneAgriQueryCache(now);
  const hit = queryStatsCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const job = runStatsQueryUncached(layer, w, outStatistics, groupBy);
  queryStatsCache.set(key, { expires: now + QUERY_CACHE_TTL_MS, value: job });
  return job;
}
/** SUM of a single field for the WHERE clause. */
export async function sumField(
  layer: AgriLayerLike | null | undefined,
  where: string,
  field: string,
): Promise<number> {
  const rows = await runStatsQuery(layer, where, [
    {
      statisticType: "sum",
      onStatisticField: field,
      outStatisticFieldName: "stat_v",
    },
  ]);
  const attrs = rows[0] || {};
  const val =
    attrs.stat_v ?? attrs.STAT_V ?? Object.values(attrs)[0];
  return Number(val) || 0;
}
/** SUM of several fields in one query. Returns a map field->sum. */
export async function sumFields(
  layer: AgriLayerLike | null | undefined,
  where: string,
  fields: string[],
): Promise<Record<string, number>> {
  const rows = await runStatsQuery(
    layer,
    where,
    fields.map((f, i) => ({
      statisticType: "sum",
      onStatisticField: f,
      outStatisticFieldName: `s${i}`,
    })),
  );
  const attrs: AgriStatsRow = rows[0] || {};
  const lowerAttrs: AgriStatsRow = {};
  for (const k of Object.keys(attrs)) lowerAttrs[k.toLowerCase()] = attrs[k];
  const out: Record<string, number> = {};
  fields.forEach((f, i) => {
    out[f] = Number(lowerAttrs[`s${i}`]) || 0;
  });
  return out;
}
/** MEDIAN of a field. Tries percentile_cont, falls back to client-side. */
export async function medianField(
  layer: AgriLayerLike | null | undefined,
  where: string,
  field: string,
): Promise<number> {
  // 1) Server-side percentile_cont (ArcGIS 10.9.1+)
  const rows = await runStatsQuery(layer, where, [
    {
      statisticType: "percentile_cont",
      onStatisticField: field,
      outStatisticFieldName: "stat_med",
      statisticParameters: { value: 0.5 },
    },
  ]);
  const attrs: AgriStatsRow = rows[0] || {};
  for (const k of Object.keys(attrs)) {
    if (k.toLowerCase() === "stat_med" && attrs[k] !== null) {
      return Number(attrs[k]) || 0;
    }
  }

  // 2) Client-side median over non-null values (JSON to avoid PBF issues)
  const w = `(${where || "1=1"}) AND ${field} IS NOT NULL`;
  try {
    const data = await queryLayerJson(layer, {
      where: w,
      returnGeometry: false,
      outFields: field,
      resultRecordCount: 4000,
    });
    const values = (data?.features || [])
      .map((feat) => Number(feat?.attributes?.[field]))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
    flLog("median client-side", {
      layer: layerLabel(layer),
      where: w,
      field,
      valueCount: values.length,
    });
    if (!values.length) return 0;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  } catch (err: unknown) {
    flLog("median client-side FAILED", {
      layer: layerLabel(layer),
      field,
      error: errorMessage(err),
    });
    return 0;
  }
}
/** Group by a field and SUM another. Returns sorted [{name, total}] desc. */
export async function sumByGroup(
  layer: AgriLayerLike | null | undefined,
  where: string,
  groupField: string,
  sumF: string,
): Promise<Array<{ name: string; total: number }>> {
  const rows = await runStatsQuery(
    layer,
    where,
    [
      {
        statisticType: "sum",
        onStatisticField: sumF,
        outStatisticFieldName: "stat_total",
      },
    ],
    [groupField],
  );
  return rows
    .map((a: AgriStatsRow) => {
      const lower: AgriStatsRow = {};
      for (const k of Object.keys(a)) lower[k.toLowerCase()] = a[k];
      return {
        name: String(lower[groupField.toLowerCase()] ?? "").trim(),
        total: Number(lower.stat_total) || 0,
      };
    })
    .filter((row) => row.name && row.total > 0)
    .sort((a, b) => b.total - a.total);
}
/**
 * Group by crop_id (or any field): count, AVG of numeric field, MAX of label.
 * Single server round-trip — works when percentile_cont+groupBy does not.
 */
export async function cropStatsByGroup(
  layer: AgriLayerLike | null | undefined,
  where: string,
  groupField: string,
  valueField?: string,
  labelField?: string,
): Promise<
  Array<{ id: string; label: string; count: number; avg: number }>
> {
  const oidField =
    String(layer?.objectIdField || "objectid").trim() || "objectid";
  const stats: Array<Record<string, unknown>> = [
    {
      statisticType: "count",
      onStatisticField: oidField,
      outStatisticFieldName: "stat_cnt",
    },
  ];
  if (valueField) {
    stats.push({
      statisticType: "avg",
      onStatisticField: valueField,
      outStatisticFieldName: "stat_avg",
    });
  }
  if (labelField) {
    stats.push({
      statisticType: "max",
      onStatisticField: labelField,
      outStatisticFieldName: "stat_label",
    });
  }
  const rows = await runStatsQuery(layer, where, stats, [groupField]);
  return rows
    .map((a: AgriStatsRow) => {
      const lower: AgriStatsRow = {};
      for (const k of Object.keys(a)) lower[k.toLowerCase()] = a[k];
      const id = String(lower[groupField.toLowerCase()] ?? "").trim();
      return {
        id,
        label: String(lower.stat_label ?? "").trim() || id,
        count: Number(lower.stat_cnt) || 0,
        avg: Number(lower.stat_avg) || 0,
      };
    })
    .filter((row) => row.id && row.count > 0);
}
