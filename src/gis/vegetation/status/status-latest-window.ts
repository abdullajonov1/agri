/**
 * Per-field Vegetatsiya Holati: each field's newest ndvi_status — inside its
 * crop's 10-day VH window, or its last reading earlier in the season when the
 * window has none (see status-vh-window). The VH bar sums these per status
 * (hectares from Agri_table `maydon`), and the click path (map polygons,
 * AgriRegion bars, VH-first Pie) uses the same assignment.
 */

import { type VegetationStatusCount, type VegetationCropBreakdownRow, getAgriVegetationIndicesLayer, resolveVegetationUniqueIdPageSize, VEG_STATUS_ROW_MAX_PAGES, VEG_PIXEL_AREA_HA, queryVegFeatures, agriVhLog, dateRangeInclusiveClause, shiftYmd, type VegQuery } from "../veg-base";
import { errorMessage } from "../../agri-layer-types";
import { escapeArcGIS } from "../../../data/agri-sql";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { rememberAsync } from "../../../data/agri-persistent-cache";
import { buildSpatialJoinWhere, queryAgriTableAreaByUniqueId, type AgriTableAreaRow } from "../../agri-table-data-source";
import { buildVhWindowsWhere, normalizeCropIds, resolveVhStatusWindows, VH_STATUS_WINDOW_DAYS, type VhCropWindow, type VhResolvedWindows, type VhWindowParams } from "./status-vh-window";

export { VH_STATUS_WINDOW_DAYS, vhStatusWindowStart } from "./status-vh-window";

/**
 * Every request on this service costs ~3.4 s regardless of size, so the
 * per-field scan is split by the uniqueid's first character and the slices
 * run in parallel (a viloyat finishes in ~one round instead of 6+ serial
 * pages). Bounds are contiguous, so every id falls in exactly one slice
 * under any collation (digits < letters, case-insensitive or not).
 */
const UNIQUEID_PARTITION_BOUNDS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f",
];

export type VegetationLatestStatusParams = VhWindowParams;

export interface VegetationLatestStatusSummary {
  startDate: string;
  endDate: string;
  /** One row per status: distinct fields, px area, assigned uniqueids. */
  rows: VegetationStatusCount[];
  /** status → crop mix of the fields assigned to that status. */
  cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]>;
  /** Per-field assignment behind rows (raw uniqueid, status, crop, px). */
  fields: VhFieldAssignment[];
  fieldCount: number;
  truncated: boolean;
}

export interface VhFieldAssignment {
  uniqueId: string;
  status: string;
  cropId: string;
  pxAll: number;
}

const EMPTY_SUMMARY = (startDate: string, endDate: string): VegetationLatestStatusSummary => ({
  startDate,
  endDate,
  rows: [],
  cropRowsByStatus: {},
  fields: [],
  fieldCount: 0,
  truncated: false,
});

export const vegetationLatestStatusCache = new Map<
  string,
  Promise<VegetationLatestStatusSummary>
>();
const LATEST_STATUS_CACHE_MAX = 32;

type Reading = {
  status: string;
  cropId: string;
  lastDate: number;
  rowCount: number;
  pxAll: number;
};

const readAttribute = (attributes: Record<string, unknown>, field: string): unknown =>
  attributes?.[field] ??
  attributes?.[field.toLowerCase()] ??
  attributes?.[field.toUpperCase()];

/** ArcGIS date stats come back as epoch ms; tolerate string dates too. */
const toTime = (raw: unknown): number => {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  const parsed = Date.parse(String(raw ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Newest reading wins; same day falls back to the old majority/area rule. */
const isBetterReading = (a: Reading, b: Reading): boolean =>
  a.lastDate !== b.lastDate
    ? a.lastDate > b.lastDate
    : a.rowCount !== b.rowCount
      ? a.rowCount > b.rowCount
      : a.pxAll !== b.pxAll
        ? a.pxAll > b.pxAll
        : a.status.localeCompare(b.status) < 0;

function partitionClauses(field: string): string[] {
  const bounds = UNIQUEID_PARTITION_BOUNDS;
  const out = [`${field} < '${bounds[0]}'`];
  for (let i = 1; i < bounds.length; i += 1) {
    out.push(`${field} >= '${bounds[i - 1]}' AND ${field} < '${bounds[i]}'`);
  }
  out.push(`${field} >= '${bounds[bounds.length - 1]}'`);
  return out;
}

/** Status rows (px area) + crop mix from per-field assignments. */
function summarizeFields(
  fields: VhFieldAssignment[],
  startDate: string,
  endDate: string,
  truncated: boolean,
): VegetationLatestStatusSummary {
  const byStatus = new Map<string, { count: number; pxAll: number; ids: string[] }>();
  const cropByStatus = new Map<string, Map<string, { pxAll: number; count: number }>>();
  for (const field of fields) {
    const bucket = byStatus.get(field.status) || { count: 0, pxAll: 0, ids: [] };
    bucket.count += 1;
    bucket.pxAll += field.pxAll;
    bucket.ids.push(field.uniqueId);
    byStatus.set(field.status, bucket);
    if (field.cropId) {
      const crops = cropByStatus.get(field.status) || new Map<string, { pxAll: number; count: number }>();
      const crop = crops.get(field.cropId) || { pxAll: 0, count: 0 };
      crop.pxAll += field.pxAll;
      crop.count += 1;
      crops.set(field.cropId, crop);
      cropByStatus.set(field.status, crops);
    }
  }
  const cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]> = {};
  for (const [status, crops] of cropByStatus) {
    cropRowsByStatus[status] = Array.from(crops.entries(), ([cropId, crop]) => ({
      cropId,
      areaHa: crop.pxAll * VEG_PIXEL_AREA_HA,
      fieldCount: crop.count,
    }));
  }
  return {
    startDate,
    endDate,
    rows: Array.from(byStatus.entries(), ([status, bucket]) => ({
      ndvi_status: status,
      count: bucket.count,
      areaHa: bucket.pxAll * VEG_PIXEL_AREA_HA,
      uniqueIds: bucket.ids,
    })),
    cropRowsByStatus,
    fields,
    fieldCount: fields.length,
    truncated,
  };
}

/**
 * Per-field newest status for an arbitrary vegetation WHERE (already carrying
 * the raster_date window). Grouped by uniqueid+status(+crop) on the server,
 * uniqueid-sliced in parallel with keyset paging inside each slice. When the
 * service rejects the grouped query, `allowRawFallback` walks raw rows by
 * OID — affordable for one viloyat, minutes long for the republic.
 */
async function loadLatestStatus(
  where: string,
  startDate: string,
  endDate: string,
  allowRawFallback: boolean,
): Promise<VegetationLatestStatusSummary> {
  const { layer, fields } = await getAgriVegetationIndicesLayer();
  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  const uniqueIdField =
    fieldByLower.get("uniqueid") ||
    fieldByLower.get("unique_id") ||
    fieldByLower.get("globalid") ||
    fieldByLower.get("global_id");
  if (!uniqueIdField) {
    agriVhLog("latest-status:FAILED-no-uniqueid-field", { fields });
    return EMPTY_SUMMARY(startDate, endDate);
  }
  const cropField = fieldByLower.get("crop_id") || fieldByLower.get("cropid") || "";
  const oidField = String(layer.objectIdField || "objectid");

  const cacheKey = `${where}|id=${uniqueIdField}|crop=${cropField}`;
  const cached = vegetationLatestStatusCache.get(cacheKey);
  if (cached) return cached;

  const request = (async (): Promise<VegetationLatestStatusSummary> => {
    const startedAt = Date.now();
    const byUniqueId = new Map<string, { rawId: string; best: Reading }>();
    let pagesFetched = 0;
    let truncated = false;
    let path = "grouped";

    const consider = (rawIdValue: unknown, reading: Reading): void => {
      if (rawIdValue == null || String(rawIdValue).trim() === "") return;
      if (!reading.status) return;
      const rawId = String(rawIdValue).trim();
      const key = rawId.replace(/[{}]/g, "").toLowerCase();
      const prev = byUniqueId.get(key);
      if (!prev || isBetterReading(reading, prev.best)) {
        byUniqueId.set(key, { rawId: prev?.rawId ?? rawId, best: reading });
      }
    };
    const readStatus = (attrs: Record<string, unknown>): string =>
      String(readAttribute(attrs, "ndvi_status") || "").trim().toLowerCase();
    const readCrop = (attrs: Record<string, unknown>): string =>
      cropField ? String(readAttribute(attrs, cropField) ?? "").trim() : "";

    const pageSize = resolveVegetationUniqueIdPageSize(layer);
    const groupFields = [uniqueIdField, "ndvi_status", ...(cropField ? [cropField] : [])];

    // Keyset paging on uniqueid (`uniqueid >= last`), not resultOffset: this
    // service does not advertise supportsPaginationOnAggregatedQueries.
    const pageGroupedSlice = async (sliceWhere: string): Promise<void> => {
      let cursor: string | null = null;
      for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
        const query: VegQuery = layer.createQuery();
        query.where =
          cursor == null
            ? sliceWhere
            : `(${sliceWhere}) AND ${uniqueIdField} >= '${escapeArcGIS(cursor)}'`;
        query.groupByFieldsForStatistics = groupFields;
        query.orderByFields = groupFields.map((field) => `${field} ASC`);
        query.outFields = groupFields;
        query.outStatistics = asStatisticDefinitions([
          { statisticType: "max", onStatisticField: "raster_date", outStatisticFieldName: "last_date" },
          { statisticType: "count", onStatisticField: oidField, outStatisticFieldName: "row_count" },
          { statisticType: "max", onStatisticField: "px_all", outStatisticFieldName: "max_px_all" },
        ]);
        query.returnGeometry = false;
        query.resultRecordCount = pageSize;

        const result = await queryVegFeatures(layer, query);
        const features = result?.features ?? [];
        if (!features.length) return;
        pagesFetched += 1;

        // A full page may cut the last field's status groups in half — leave
        // that field for the next page, which starts at it (>=).
        const full = features.length >= pageSize;
        const lastAttrs = (features[features.length - 1]?.attributes || {}) as Record<string, unknown>;
        const lastId = full ? String(readAttribute(lastAttrs, uniqueIdField) ?? "") : "";
        let consumed = 0;
        for (const feature of features) {
          const attrs = (feature?.attributes || {}) as Record<string, unknown>;
          const rawId = readAttribute(attrs, uniqueIdField);
          if (full && String(rawId ?? "") === lastId) continue;
          consumed += 1;
          consider(rawId, {
            status: readStatus(attrs),
            cropId: readCrop(attrs),
            lastDate: toTime(readAttribute(attrs, "last_date")),
            rowCount: Math.max(1, Number(readAttribute(attrs, "row_count")) || 0),
            pxAll: Number(readAttribute(attrs, "max_px_all")) || 0,
          });
        }

        if (!full) return;
        if (!consumed || !lastId || lastId === cursor) {
          throw new Error("Vegetation grouped pagination did not advance.");
        }
        cursor = lastId;
        if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
      }
    };

    try {
      await Promise.all(
        partitionClauses(uniqueIdField).map((slice) =>
          pageGroupedSlice(`(${where}) AND ${slice}`),
        ),
      );
    } catch (groupedError) {
      agriVhLog("latest-status:grouped-failed", {
        where,
        error: errorMessage(groupedError),
        rawFallback: allowRawFallback,
      });
      if (!allowRawFallback) throw groupedError;
      path = "raw-oid";
      byUniqueId.clear();
      pagesFetched = 0;
      truncated = false;
      let lastOid = -1;
      for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
        const query: VegQuery = layer.createQuery();
        query.where = lastOid < 0 ? where : `(${where}) AND ${oidField} > ${lastOid}`;
        query.orderByFields = [`${oidField} ASC`];
        query.outFields = [
          oidField,
          uniqueIdField,
          "ndvi_status",
          "px_all",
          "raster_date",
          ...(cropField ? [cropField] : []),
        ];
        query.returnGeometry = false;
        query.resultRecordCount = pageSize;

        const result = await queryVegFeatures(layer, query);
        const features = result?.features ?? [];
        if (!features.length) break;
        pagesFetched += 1;
        let pageMaxOid = lastOid;
        for (const feature of features) {
          const attrs = (feature?.attributes || {}) as Record<string, unknown>;
          const oid = Number(readAttribute(attrs, oidField));
          if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
          consider(readAttribute(attrs, uniqueIdField), {
            status: readStatus(attrs),
            cropId: readCrop(attrs),
            lastDate: toTime(readAttribute(attrs, "raster_date")),
            rowCount: 1,
            pxAll: Number(readAttribute(attrs, "px_all")) || 0,
          });
        }
        if (!(pageMaxOid > lastOid)) {
          truncated = true;
          break;
        }
        lastOid = pageMaxOid;
        if (features.length < pageSize) break;
        if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
      }
    }

    const summary = summarizeFields(
      Array.from(byUniqueId.values(), ({ rawId, best }) => ({
        uniqueId: rawId,
        status: best.status,
        cropId: best.cropId,
        pxAll: best.pxAll,
      })),
      startDate,
      endDate,
      truncated,
    );
    agriVhLog("latest-status:done", {
      where,
      path,
      startDate,
      endDate,
      pagesFetched,
      ms: Date.now() - startedAt,
      truncated,
      fieldCount: summary.fieldCount,
      rows: summary.rows.map((row) => ({
        ndvi_status: row.ndvi_status,
        count: row.count,
        areaHa: Math.round(row.areaHa),
      })),
    });
    return summary;
  })();

  vegetationLatestStatusCache.set(cacheKey, request);
  while (vegetationLatestStatusCache.size > LATEST_STATUS_CACHE_MAX) {
    const oldestKey = vegetationLatestStatusCache.keys().next().value;
    if (!oldestKey) break;
    vegetationLatestStatusCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (error) {
    vegetationLatestStatusCache.delete(cacheKey);
    throw error;
  }
}

/** Agri_table scope matching a VH scope (same viloyat / tuman / year). */
const tableScope = (params: VegetationLatestStatusParams) => ({
  region: params.region,
  district: params.district,
  year: String(params.date || "").trim().slice(0, 4),
});

/** Run `tasks` with at most `limit` in flight. */
async function runLimited<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

/** Republic retry: one grouped scan per viloyat (3 at a time) when the combined scan fails. */
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
        const result = await queryVegFeatures(layer, query);
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
 * window-less fields. A failed republic scan retries per viloyat instead of
 * walking raw rows.
 */
export async function queryVegetationLatestStatusSummary(
  params: VegetationLatestStatusParams,
): Promise<VegetationLatestStatusSummary> {
  const resolved = await resolveVhStatusWindows(params);
  if (!resolved.where) return EMPTY_SUMMARY(resolved.startDate, resolved.endDate);
  const where = resolved.where;
  const key = `${where}|r=${params.region ?? ""}|d=${params.district ?? ""}|y=${String(params.date || "").slice(0, 4)}`;
  const cached = vegetationVhSummaryCache.get(key);
  if (cached) return cached;

  const request = (async (): Promise<VegetationLatestStatusSummary> => {
    // The Agri_table read (fallback candidates + hectares) does not depend on
    // the vegetation scan — start it now so both run side by side; its
    // promise is cached, so later callers share it.
    if (resolved.windows.some((w) => w.lookbackStart < w.startDate)) {
      void queryAgriTableAreaByUniqueId(tableScope(params)).catch(() => undefined);
    }
    let base: VegetationLatestStatusSummary;
    try {
      base = await loadLatestStatus(where, resolved.startDate, resolved.endDate, params.region != null);
    } catch (error) {
      if (params.region != null || resolved.windows.length < 2) throw error;
      agriVhLog("latest-status:per-region-retry", {
        regions: new Set(resolved.windows.map((w) => w.region)).size,
      });
      base = await loadPerRegion(resolved);
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
