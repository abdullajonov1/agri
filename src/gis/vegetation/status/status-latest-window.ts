/**
 * Per-field Vegetatsiya Holati: each field's newest ndvi_status — inside its
 * crop's 10-day VH window, or its last reading earlier in the season when the
 * window has none (see status-vh-window). The VH bar sums these per status
 * (hectares from Agri_table `maydon`), and the click path (map polygons,
 * AgriRegion bars, VH-first Pie) uses the same assignment.
 */


import { vegAccessCacheTag, type VegetationStatusCount, type VegetationCropBreakdownRow, getAgriVegetationIndicesLayer, VEG_PIXEL_AREA_HA, agriVhLog, dateRangeInclusiveClause, shiftYmd, type VegQuery } from "../veg-base";
import { errorMessage } from "../../agri-layer-types";
import { escapeArcGIS } from "../../../shared/agri-sql";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { rememberAsync } from "../../../data/agri-persistent-cache";
import { buildSpatialJoinWhere, queryAgriTableAreaByUniqueId, type AgriTableAreaRow } from "../../agri-table-data-source";
import { buildVhWindowsWhere, normalizeCropIds, resolveVhStatusWindows, VH_STATUS_WINDOW_DAYS, type VhCropWindow, type VhResolvedWindows } from "./status-vh-window";
import {
  EMPTY_SUMMARY,
  isBetterReading,
  readAttribute,
  runLimited,
  summarizeFields,
  tableScope,
  toTime,
  type Reading,
  type VegetationLatestStatusParams,
  type VegetationLatestStatusSummary,
  type VhFieldAssignment,
} from "./status-latest-window-math";
import { loadLatestStatus, queryVegHeavy } from "./status-latest-window-scan";

export { VH_STATUS_WINDOW_DAYS, vhStatusWindowStart } from "./status-vh-window";
export type { VegetationLatestStatusParams, VegetationLatestStatusSummary, VhFieldAssignment } from "./status-latest-window-math";
export { vegetationLatestStatusCache } from "./status-latest-window-scan";

/** Republic: one grouped scan per viloyat (3 at a time; requests share the heavy lane). */
async function loadPerRegion(resolved: VhResolvedWindows): Promise<VegetationLatestStatusSummary> {
  const byRegion = new Map<string | null, VhCropWindow[]>();
  for (const w of resolved.windows) byRegion.set(w.region, [...(byRegion.get(w.region) || []), w]);
  const parts = await runLimited(
    Array.from(byRegion.values(), (windows) => async () => {
      const where = buildVhWindowsWhere(windows, resolved.regionField, resolved.cropField, resolved.scopeClauses);
      return where ? loadLatestStatus(where, resolved.startDate, resolved.endDate, true) : null;
    }),
    3,
  );
  return summarizeFields(
    parts.flatMap((part) => part?.fields ?? []),
    resolved.startDate,
    resolved.endDate,
    parts.some((part) => Boolean(part?.truncated)),
  );
}

/** uniqueids per fallback query, and fallback queries in flight (republic: ~80k candidates). */
const SEASON_FALLBACK_CHUNK = 300;
const SEASON_FALLBACK_CONCURRENCY = 8;

/**
 * Fields registered in Agri_table for a monitored crop but with no reading in
 * that crop's 10-day window take their newest reading earlier in the season.
 * Only those fields are queried (by uniqueid, grouped, small chunks).
 */
async function withSeasonFallback(
  base: VegetationLatestStatusSummary,
  resolved: VhResolvedWindows,
  params: VegetationLatestStatusParams,
): Promise<VegetationLatestStatusSummary> {
  const windowByKey = new Map<string, VhCropWindow>();
  for (const w of resolved.windows) {
    if (w.region != null && w.cropId != null && w.lookbackStart < w.startDate) {
      windowByKey.set(`${w.region}|${w.cropId}`, w);
    }
  }
  if (!windowByKey.size) return base;

  const startedAt = Date.now();
  let table: Map<string, AgriTableAreaRow[]>;
  try {
    table = await queryAgriTableAreaByUniqueId(tableScope(params));
  } catch (error) {
    agriVhLog("latest-status:season-fallback-skipped", { error: errorMessage(error) });
    return base;
  }

  const assigned = new Set(base.fields.map((f) => f.uniqueId.replace(/[{}]/g, "").trim().toLowerCase()));
  const candidates = new Map<VhCropWindow, string[]>();
  for (const [key, rows] of table) {
    if (assigned.has(key)) continue;
    for (const row of rows) {
      const region = params.region != null ? String(params.region) : row.region;
      const w = windowByKey.get(`${region}|${row.cropId}`);
      if (!w) continue;
      candidates.set(w, [...(candidates.get(w) || []), row.uniqueId]);
      break;
    }
  }
  const candidateCount = Array.from(candidates.values()).reduce((n, ids) => n + ids.length, 0);
  if (!candidateCount) return base;

  const { layer } = await getAgriVegetationIndicesLayer();
  const oidField = String(layer.objectIdField || "objectid");
  const found = new Map<string, { rawId: string; reading: Reading }>();
  const tasks: Array<() => Promise<void>> = [];
  for (const [w, ids] of candidates) {
    const dayBefore = shiftYmd(w.startDate, -1) || w.startDate;
    for (let i = 0; i < ids.length; i += SEASON_FALLBACK_CHUNK) {
      const chunk = ids.slice(i, i + SEASON_FALLBACK_CHUNK);
      tasks.push(async () => {
        const query: VegQuery = layer.createQuery();
        query.where = [
          dateRangeInclusiveClause("raster_date", w.lookbackStart, dayBefore),
          `region='${escapeArcGIS(String(w.region))}'`,
          `crop_id='${escapeArcGIS(String(w.cropId))}'`,
          buildSpatialJoinWhere(chunk),
          ...resolved.scopeClauses,
        ].join(" AND ");
        query.groupByFieldsForStatistics = ["uniqueid", "ndvi_status", "crop_id"];
        query.outFields = ["uniqueid", "ndvi_status", "crop_id"];
        query.outStatistics = asStatisticDefinitions([
          { statisticType: "max", onStatisticField: "raster_date", outStatisticFieldName: "last_date" },
          { statisticType: "count", onStatisticField: oidField, outStatisticFieldName: "row_count" },
          { statisticType: "max", onStatisticField: "px_all", outStatisticFieldName: "max_px_all" },
        ]);
        query.returnGeometry = false;
        const result = await queryVegHeavy(layer, query);
        for (const feature of result?.features ?? []) {
          const attrs = (feature?.attributes || {}) as Record<string, unknown>;
          const rawId = String(readAttribute(attrs, "uniqueid") ?? "").trim();
          const status = String(readAttribute(attrs, "ndvi_status") ?? "").trim().toLowerCase();
          if (!rawId || !status) continue;
          const reading: Reading = {
            status,
            cropId: String(readAttribute(attrs, "crop_id") ?? "").trim(),
            lastDate: toTime(readAttribute(attrs, "last_date")),
            rowCount: Math.max(1, Number(readAttribute(attrs, "row_count")) || 0),
            pxAll: Number(readAttribute(attrs, "max_px_all")) || 0,
          };
          const key = rawId.replace(/[{}]/g, "").toLowerCase();
          const prev = found.get(key);
          if (!assigned.has(key) && (!prev || isBetterReading(reading, prev.reading))) {
            found.set(key, { rawId: prev?.rawId ?? rawId, reading });
          }
        }
      });
    }
  }
  try {
    await runLimited(tasks, SEASON_FALLBACK_CONCURRENCY);
  } catch (error) {
    agriVhLog("latest-status:season-fallback-failed", { error: errorMessage(error) });
    return base;
  }

  agriVhLog("latest-status:season-fallback", {
    candidates: candidateCount,
    found: found.size,
    queries: tasks.length,
    ms: Date.now() - startedAt,
  });
  if (!found.size) return base;
  return summarizeFields(
    [
      ...base.fields,
      ...Array.from(found.values(), ({ rawId, reading }) => ({
        uniqueId: rawId,
        status: reading.status,
        cropId: reading.cropId,
        pxAll: reading.pxAll,
      })),
    ],
    base.startDate,
    base.endDate,
    base.truncated,
  );
}

export const vegetationVhSummaryCache = new Map<string, Promise<VegetationLatestStatusSummary>>();
const VH_SUMMARY_CACHE_MAX = 32;

/**
 * Per-field status for one scope: newest reading in the 10-day windows
 * (`date` caps every crop's window end), plus the season fallback for
 * window-less fields. The republic is scanned per viloyat (never by walking
 * raw rows).
 */
export async function queryVegetationLatestStatusSummary(
  params: VegetationLatestStatusParams,
): Promise<VegetationLatestStatusSummary> {
  const resolved = await resolveVhStatusWindows(params);
  if (!resolved.where) return EMPTY_SUMMARY(resolved.startDate, resolved.endDate);
  const where = resolved.where;
  const key = `${where}|r=${params.region ?? ""}|d=${params.district ?? ""}|y=${String(params.date || "").slice(0, 4)}${vegAccessCacheTag()}`;
  const cached = vegetationVhSummaryCache.get(key);
  if (cached) return cached;

  const request = (async (): Promise<VegetationLatestStatusSummary> => {
    // The Agri_table read (fallback candidates + hectares) starts after the
    // vegetation scan, not beside it: run together, the two 16-slice scans
    // exhausted the server and the scan timed out (2026-11-05).
    let base: VegetationLatestStatusSummary;
    const regionCount = new Set(resolved.windows.map((w) => w.region)).size;
    if (params.region == null && regionCount > 1) {
      // Republic: straight to one scan per viloyat. The combined republic
      // scan timed out (60 s) on every slice even 4 at a time (2026-11-05),
      // so trying it first only held the server for a minute before this.
      agriVhLog("latest-status:per-region", { regions: regionCount });
      base = await loadPerRegion(resolved);
    } else {
      base = await loadLatestStatus(where, resolved.startDate, resolved.endDate, params.region != null);
    }
    return withSeasonFallback(base, resolved, params);
  })();
  vegetationVhSummaryCache.set(key, request);
  while (vegetationVhSummaryCache.size > VH_SUMMARY_CACHE_MAX) {
    const oldestKey = vegetationVhSummaryCache.keys().next().value;
    if (!oldestKey) break;
    vegetationVhSummaryCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (error) {
    vegetationVhSummaryCache.delete(key);
    throw error;
  }
}

/**
 * Hectares for one assigned field from Agri_table `maydon` — the column the
 * indicator sums. Prefers the row with the field's VH crop; another crop's
 * row is the same land (repeat crop); no row → the px estimate.
 */
function fieldAreaHa(field: VhFieldAssignment, tableRows: AgriTableAreaRow[] | undefined): number | null {
  if (!tableRows?.length) return null;
  const sameCrop = tableRows.filter((row) => row.cropId === field.cropId);
  if (sameCrop.length) return sameCrop.reduce((sum, row) => sum + row.maydon, 0);
  return Math.max(...tableRows.map((row) => row.maydon));
}

export interface VegetationLatestStatusAreas {
  /** Per status: distinct fields, Agri_table hectares, assigned uniqueids. */
  rows: VegetationStatusCount[];
  cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]>;
  startDate: string;
  endDate: string;
}

/**
 * The summary's per-field assignment with hectares from Agri_table `maydon`
 * (same scope + year), so VH totals match the indicator for the same fields.
 * Falls back to px area when the table cannot be read.
 */
export async function queryVegetationLatestStatusAreas(
  params: VegetationLatestStatusParams,
): Promise<VegetationLatestStatusAreas> {
  const summary = await queryVegetationLatestStatusSummary(params);
  const pxResult: VegetationLatestStatusAreas = {
    rows: summary.rows,
    cropRowsByStatus: summary.cropRowsByStatus,
    startDate: summary.startDate,
    endDate: summary.endDate,
  };
  if (!summary.fields.length) return pxResult;

  let table: Map<string, AgriTableAreaRow[]>;
  const tableStartedAt = Date.now();
  try {
    table = await queryAgriTableAreaByUniqueId(tableScope(params));
  } catch (error) {
    agriVhLog("latest-status:table-area-failed", { error: errorMessage(error) });
    return pxResult;
  }

  const byStatus = new Map<string, { count: number; areaHa: number; ids: string[] }>();
  const cropByStatus = new Map<string, Map<string, { areaHa: number; count: number }>>();
  let pxFallbacks = 0;
  for (const field of summary.fields) {
    const key = field.uniqueId.replace(/[{}]/g, "").trim().toLowerCase();
    let areaHa = fieldAreaHa(field, table.get(key));
    if (areaHa == null) {
      pxFallbacks += 1;
      areaHa = field.pxAll * VEG_PIXEL_AREA_HA;
    }
    const bucket = byStatus.get(field.status) || { count: 0, areaHa: 0, ids: [] };
    bucket.count += 1;
    bucket.areaHa += areaHa;
    bucket.ids.push(field.uniqueId);
    byStatus.set(field.status, bucket);
    if (field.cropId) {
      const crops = cropByStatus.get(field.status) || new Map<string, { areaHa: number; count: number }>();
      const crop = crops.get(field.cropId) || { areaHa: 0, count: 0 };
      crop.areaHa += areaHa;
      crop.count += 1;
      crops.set(field.cropId, crop);
      cropByStatus.set(field.status, crops);
    }
  }
  const cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]> = {};
  for (const [status, crops] of cropByStatus) {
    cropRowsByStatus[status] = Array.from(crops.entries(), ([cropId, crop]) => ({
      cropId,
      areaHa: crop.areaHa,
      fieldCount: crop.count,
    }));
  }
  agriVhLog("latest-status:table-area", {
    tableMs: Date.now() - tableStartedAt,
    fields: summary.fields.length,
    pxFallbacks,
  });
  return {
    rows: Array.from(byStatus.entries(), ([status, bucket]) => ({
      ndvi_status: status,
      count: bucket.count,
      areaHa: bucket.areaHa,
      uniqueIds: bucket.ids,
    })),
    cropRowsByStatus,
    startDate: summary.startDate,
    endDate: summary.endDate,
  };
}

export interface VegetationLatestStatusCounts {
  /** One row per status: distinct fields + hectares (uniqueid lists dropped). */
  rows: VegetationStatusCount[];
  startDate: string;
  endDate: string;
}

export const vegetationLatestStatusCountsCache = new Map<
  string,
  Promise<VegetationLatestStatusCounts>
>();
const LATEST_STATUS_COUNTS_CACHE_MAX = 64;

/**
 * VH bar buckets: distinct fields + Agri_table hectares per status.
 * Counts (without uniqueid lists) persist for AGRI_PERSIST_TTL_MS so the bar
 * is paid once per hour, not per page load.
 */
export async function queryVegetationLatestStatusCounts(
  params: VegetationLatestStatusParams,
): Promise<VegetationLatestStatusCounts> {
  const load = async (): Promise<VegetationLatestStatusCounts> => {
    const areas = await queryVegetationLatestStatusAreas(params);
    return {
      rows: areas.rows.map((row) => ({ ...row, uniqueIds: [] })),
      startDate: areas.startDate,
      endDate: areas.endDate,
    };
  };
  // Farmer STIR lists are per-selection; the summary cache already covers them.
  if (Array.isArray(params.uniqueIds)) return load();

  const key = JSON.stringify({
    date: String(params.date || "").trim(),
    days: params.windowDays ?? VH_STATUS_WINDOW_DAYS,
    region: params.region ?? null,
    district: params.district ?? null,
    cropIds: normalizeCropIds(params),
    access: vegAccessCacheTag(),
  });
  const promise = rememberAsync({
    memory: vegetationLatestStatusCountsCache,
    namespace: "veg-vh-status-counts-v5",
    key,
    factory: load,
  });
  while (vegetationLatestStatusCountsCache.size > LATEST_STATUS_COUNTS_CACHE_MAX) {
    const oldestKey = vegetationLatestStatusCountsCache.keys().next().value;
    if (!oldestKey) break;
    vegetationLatestStatusCountsCache.delete(oldestKey);
  }
  return promise;
}
