/**
 * Per-field newest-status scan of the vegetation layer: grouped, uniqueid-sliced
 * and keyset-paged, with a raw OID walk as the single-viloyat fallback.
 */

import { vegAccessCacheTag, getAgriVegetationIndicesLayer, resolveVegetationUniqueIdPageSize, VEG_STATUS_ROW_MAX_PAGES, queryVegFeatures, agriVhLog, type VegQuery } from "../veg-base";
import { errorMessage } from "../../agri-layer-types";
import { escapeArcGIS } from "../../../shared/agri-sql";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { withHeavyQuerySlot } from "../../../data/agri-query-scheduler";
import {
  EMPTY_SUMMARY,
  isBetterReading,
  partitionClauses,
  readAttribute,
  summarizeFields,
  toTime,
  type Reading,
  type VegetationLatestStatusSummary,
} from "./status-latest-window-math";

export const vegetationLatestStatusCache = new Map<
  string,
  Promise<VegetationLatestStatusSummary>
>();
const LATEST_STATUS_CACHE_MAX = 32;

/**
 * One request of the VH scans, through the per-service heavy lane: the
 * republic scan sends 16 slices (and the per-region retry and the season
 * fallback more), which together exhausted the server's instances.
 */
export function queryVegHeavy(
  layer: Parameters<typeof queryVegFeatures>[0],
  query: Parameters<typeof queryVegFeatures>[1],
  scan?: { failed: boolean },
): Promise<__esri.FeatureSet> {
  const lane = String((layer as { url?: unknown } | null)?.url ?? "agri-vegetation");
  return withHeavyQuerySlot(lane, async () => {
    // A queued request of a scan that already failed is not sent.
    if (scan?.failed) throw new Error("VH scan cancelled");
    try {
      return await queryVegFeatures(layer, query);
    } catch (error) {
      // Mark the scan before the slot passes to the next queued request.
      if (scan) scan.failed = true;
      throw error;
    }
  });
}

type VegLayer = Awaited<ReturnType<typeof getAgriVegetationIndicesLayer>>["layer"];

interface ScanContext {
  layer: VegLayer;
  uniqueIdField: string;
  cropField: string;
  oidField: string;
  pageSize: number;
}

interface ScanState {
  byUniqueId: Map<string, { rawId: string; best: Reading }>;
  pagesFetched: number;
  truncated: boolean;
}

const createScanState = (): ScanState => ({ byUniqueId: new Map(), pagesFetched: 0, truncated: false });

/** Resolve the layer's id / crop / OID field names; `missingFields` when it has no uniqueid. */
async function resolveScanContext(): Promise<ScanContext | { missingFields: string[] }> {
  const { layer, fields } = await getAgriVegetationIndicesLayer();
  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  const uniqueIdField =
    fieldByLower.get("uniqueid") ||
    fieldByLower.get("unique_id") ||
    fieldByLower.get("globalid") ||
    fieldByLower.get("global_id");
  if (!uniqueIdField) return { missingFields: fields.map(String) };
  return {
    layer,
    uniqueIdField,
    cropField: fieldByLower.get("crop_id") || fieldByLower.get("cropid") || "",
    oidField: String(layer.objectIdField || "objectid"),
    pageSize: resolveVegetationUniqueIdPageSize(layer),
  };
}

function considerReading(state: ScanState, rawIdValue: unknown, reading: Reading): void {
  if (rawIdValue == null || String(rawIdValue).trim() === "") return;
  if (!reading.status) return;
  const rawId = String(rawIdValue).trim();
  const key = rawId.replace(/[{}]/g, "").toLowerCase();
  const prev = state.byUniqueId.get(key);
  if (!prev || isBetterReading(reading, prev.best)) {
    state.byUniqueId.set(key, { rawId: prev?.rawId ?? rawId, best: reading });
  }
}

const readStatus = (attrs: Record<string, unknown>): string =>
  String(readAttribute(attrs, "ndvi_status") || "").trim().toLowerCase();

const readCrop = (ctx: ScanContext, attrs: Record<string, unknown>): string =>
  ctx.cropField ? String(readAttribute(attrs, ctx.cropField) ?? "").trim() : "";

/**
 * Keyset paging on uniqueid (`uniqueid >= last`), not resultOffset: this
 * service does not advertise supportsPaginationOnAggregatedQueries.
 */
async function pageGroupedSlice(
  ctx: ScanContext,
  state: ScanState,
  scan: { failed: boolean },
  sliceWhere: string,
): Promise<void> {
  const { layer, uniqueIdField, oidField, pageSize } = ctx;
  const groupFields = [uniqueIdField, "ndvi_status", ...(ctx.cropField ? [ctx.cropField] : [])];
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

    const result = await queryVegHeavy(layer, query, scan);
    const features = result?.features ?? [];
    if (!features.length) return;
    state.pagesFetched += 1;

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
      considerReading(state, rawId, {
        status: readStatus(attrs),
        cropId: readCrop(ctx, attrs),
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
    if (page === VEG_STATUS_ROW_MAX_PAGES - 1) state.truncated = true;
  }
}

async function scanGrouped(ctx: ScanContext, state: ScanState, where: string): Promise<void> {
  const groupedScan = { failed: false };
  await Promise.all(
    partitionClauses(ctx.uniqueIdField).map((slice) =>
      pageGroupedSlice(ctx, state, groupedScan, `(${where}) AND ${slice}`).catch((error: unknown) => {
        groupedScan.failed = true;
        throw error;
      }),
    ),
  );
}

/** Raw rows by OID — affordable for one viloyat, minutes long for the republic. */
async function scanRawByOid(ctx: ScanContext, state: ScanState, where: string): Promise<void> {
  const { layer, uniqueIdField, oidField, pageSize } = ctx;
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
      ...(ctx.cropField ? [ctx.cropField] : []),
    ];
    query.returnGeometry = false;
    query.resultRecordCount = pageSize;

    const result = await queryVegHeavy(layer, query);
    const features = result?.features ?? [];
    if (!features.length) break;
    state.pagesFetched += 1;
    let pageMaxOid = lastOid;
    for (const feature of features) {
      const attrs = (feature?.attributes || {}) as Record<string, unknown>;
      const oid = Number(readAttribute(attrs, oidField));
      if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
      considerReading(state, readAttribute(attrs, uniqueIdField), {
        status: readStatus(attrs),
        cropId: readCrop(ctx, attrs),
        lastDate: toTime(readAttribute(attrs, "raster_date")),
        rowCount: 1,
        pxAll: Number(readAttribute(attrs, "px_all")) || 0,
      });
    }
    if (!(pageMaxOid > lastOid)) {
      state.truncated = true;
      break;
    }
    lastOid = pageMaxOid;
    if (features.length < pageSize) break;
    if (page === VEG_STATUS_ROW_MAX_PAGES - 1) state.truncated = true;
  }
}

async function runLatestStatusScan(
  ctx: ScanContext,
  where: string,
  startDate: string,
  endDate: string,
  allowRawFallback: boolean,
): Promise<VegetationLatestStatusSummary> {
  const startedAt = Date.now();
  let state = createScanState();
  let path = "grouped";
  try {
    await scanGrouped(ctx, state, where);
  } catch (groupedError) {
    agriVhLog("latest-status:grouped-failed", {
      where,
      error: errorMessage(groupedError),
      rawFallback: allowRawFallback,
    });
    if (!allowRawFallback) throw groupedError;
    path = "raw-oid";
    state = createScanState();
    await scanRawByOid(ctx, state, where);
  }

  const summary = summarizeFields(
    Array.from(state.byUniqueId.values(), ({ rawId, best }) => ({
      uniqueId: rawId,
      status: best.status,
      cropId: best.cropId,
      pxAll: best.pxAll,
    })),
    startDate,
    endDate,
    state.truncated,
  );
  agriVhLog("latest-status:done", {
    where,
    path,
    startDate,
    endDate,
    pagesFetched: state.pagesFetched,
    ms: Date.now() - startedAt,
    truncated: state.truncated,
    fieldCount: summary.fieldCount,
    rows: summary.rows.map((row) => ({
      ndvi_status: row.ndvi_status,
      count: row.count,
      areaHa: Math.round(row.areaHa),
    })),
  });
  return summary;
}

function rememberLatestStatus(cacheKey: string, request: Promise<VegetationLatestStatusSummary>): void {
  vegetationLatestStatusCache.set(cacheKey, request);
  while (vegetationLatestStatusCache.size > LATEST_STATUS_CACHE_MAX) {
    const oldestKey = vegetationLatestStatusCache.keys().next().value;
    if (!oldestKey) break;
    vegetationLatestStatusCache.delete(oldestKey);
  }
}

/**
 * Per-field newest status for an arbitrary vegetation WHERE (already carrying
 * the raster_date window). Grouped by uniqueid+status(+crop) on the server,
 * uniqueid-sliced in parallel with keyset paging inside each slice. When the
 * service rejects the grouped query, `allowRawFallback` walks raw rows by OID.
 */
export async function loadLatestStatus(
  where: string,
  startDate: string,
  endDate: string,
  allowRawFallback: boolean,
): Promise<VegetationLatestStatusSummary> {
  const ctx = await resolveScanContext();
  if ("missingFields" in ctx) {
    agriVhLog("latest-status:FAILED-no-uniqueid-field", { fields: ctx.missingFields });
    return EMPTY_SUMMARY(startDate, endDate);
  }
  const cacheKey = `${where}|id=${ctx.uniqueIdField}|crop=${ctx.cropField}${vegAccessCacheTag()}`;
  const cached = vegetationLatestStatusCache.get(cacheKey);
  if (cached) return cached;

  const request = runLatestStatusScan(ctx, where, startDate, endDate, allowRawFallback);
  rememberLatestStatus(cacheKey, request);
  try {
    return await request;
  } catch (error) {
    vegetationLatestStatusCache.delete(cacheKey);
    throw error;
  }
}
