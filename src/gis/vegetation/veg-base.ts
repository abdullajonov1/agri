import { combineAccessWhereIfFieldsExist } from "../../shared/agri-access-config";
import { getAgriServiceUrls } from "../../shared/agri-service-urls";
import { createSingletonLayerLoader } from "../../shared/agri-singleton-layer-loader";
import { dedupedQueryFeatures } from "../../data/agri-query-gateway";
import { escapeArcGIS, dateEqualsClause } from "../../data/agri-sql";
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { getAgriPersistentCache } from "../../data/agri-persistent-cache";

/** Fields present on agri_vegetation_indices — access rules using only these apply. */
const VEG_LAYER_ACCESS_FIELDS = [
  "region",
  "district",
  "crop_id",
  "turi",
  "raster_date",
  "ndvi_status",
  "uniqueid",
  "yil",
  "year",
  "px_all",
] as const;
/**
 * Attach client access WHERE when it only references vegetation-schema fields
 * (e.g. `region=1724`). Rules on `viloyat` are skipped here — that field is
 * absent on this table; Localization UI lock (lockedViloyat) scopes those users.
 */
function withVegAccessWhere(mainWhere: string): string {
  return combineAccessWhereIfFieldsExist(mainWhere, VEG_LAYER_ACCESS_FIELDS);
}
/** agri_vegetation_indices px_all comes from a 3m x 3m raster: 9 m² / 10,000. */
export const VEG_PIXEL_AREA_HA = 0.0009;
/** VH / crop-window diagnostics — visible in browser console. */
export function agriVhLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  try {
    // eslint-disable-next-line no-console
    console.log(`[AgriVH] ${phase}`, detail ?? "");
  } catch {
    /* ignore */
  }
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
  try {
    if (
      phase === "query:start" ||
      phase === "query:done" ||
      phase === "dates:window" ||
      phase === "count:day-done" ||
      phase.endsWith(":error") ||
      phase.endsWith("-failed")
    ) {
      // eslint-disable-next-line no-console
      console.log(`[AgriNotify] ${phase}`, detail ?? "");
    }
  } catch {
    /* ignore */
  }
}
export function getAgriVegetationIndicesUrl(): string {
  return getAgriServiceUrls().vegetationIndicesUrl;
}
export interface AgriVegetationLayerHandle {
  layer: any;
  fields: string[];
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
  layer: any,
  query: any,
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
    groupByFieldsForStatistics: query.groupByFieldsForStatistics,
    outStatistics: query.outStatistics,
    orderByFields: query.orderByFields,
    returnGeometry: query.returnGeometry ?? false,
    returnDistinctValues: query.returnDistinctValues,
    num: query.num,
    resultRecordCount: query.resultRecordCount,
    resultOffset: query.resultOffset,
  });
}
/** In-flight / session cache so AgriPopup + AgriGraff share one FeatureServer hit. */
export const vegetationSeriesByUniqueIdCache = new Map<
  string,
  Promise<Array<Record<string, any>>>
>();
export const VEG_AVG_FIELDS = [
  "ndvi",
  "ndvi_min",
  "ndvi_max",
  "savi",
  "savi_min",
  "savi_max",
  "evi",
  "rvi",
  "rvi_min",
  "rvi_max",
  "ci",
  "ci_min",
  "ci_max",
  "ndwi",
  "ndwi_min",
  "ndwi_max",
];
/** Lighter republic overview: means only (no min/max bands) — ~6 avgs vs 16. */
export const VEG_AVG_FIELDS_CORE = [
  "ndvi",
  "savi",
  "evi",
  "rvi",
  "ci",
  "ndwi",
];
export interface VegetationRegionalTimeseriesParams {
  region?: number;
  district?: number;
  /** yyyy-mm-dd */
  startDate?: string;
  /** yyyy-mm-dd */
  endDate?: string;
  /**
   * Crop type filter. agri_vegetation_indices has no human-readable crop
   * name field, only crop_id — callers must resolve the selected turi name
   * to its crop_id first (e.g. via a turi -> crop_id lookup built from
   * Agri_table_data, which carries both).
  */
  cropId?: string;
  /** Multiple selected crops; queried together so one uniqueid is still counted once. */
  cropIds?: string[];
  /** Optional vegetation status selected in the VH widget. */
  ndviStatus?: string;
  /**
   * Subset of VEG_AVG_FIELDS to average.
   * - No region (republic / cold start): pass `["ndvi"]` (or other selected
   *   columns) — do not AVG SAVI/EVI/… until a viloyat/tuman is chosen or
   *   the user toggles more legend indices.
   * - Viloyat/tuman: omit this to load the full min/max band set once.
   */
  avgFields?: string[];
}
export const vegetationRegionalTimeseriesCache = new Map<
  string,
  Promise<Array<Record<string, any>>>
>();
/** Normalizes an ArcGIS date attribute (epoch ms, Date, or string) to "YYYY-MM-DD". */
export function formatArcgisDateToYmd(value: any): string | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
/**
 * Whole-day equality clause for a Date field — safer than `field = DATE
 * 'YYYY-MM-DD'`, which can miss rows if the stored value carries a
 * non-midnight time component.
 * @deprecated import from `data/agri-sql` — re-exported for existing callers.
 */
// dateEqualsClause: see re-export from agri-sql above.

/** Inclusive raster_date window: startYmd .. endYmd (both calendar days). */
export function dateRangeInclusiveClause(
  dateField: string,
  startYmd: string,
  endYmd: string,
): string {
  const start = String(startYmd || "").trim();
  const end = String(endYmd || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return "1=0";
  }
  if (start > end) return "1=0";
  const endParts = end.split("-").map((p) => parseInt(p, 10));
  const next = new Date(
    Date.UTC(endParts[0], endParts[1] - 1, endParts[2] + 1),
  );
  const nextYmd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  return `${dateField} >= DATE '${start}' AND ${dateField} < DATE '${nextYmd}'`;
}
export interface VegetationScopeParams {
  region?: number;
  district?: number;
}
/**
 * Distinct raster_date values (as "YYYY-MM-DD", ascending) available for a
 * region/district — drives the NDVI date picker. Replaces the old
 * "scan the polygon layer for status_YYYY_MM_DD columns" approach, which
 * only worked against a layer that actually had those wide columns
 * (Agri_table_data doesn't).
 */
export const vegetationAvailableDatesCache = new Map<string, Promise<string[]>>();
export interface VegetationLatestDateByRegion {
  region: number;
  /** Latest "YYYY-MM-DD" that has vegetation rows for this region. */
  date: string;
}
export const vegetationLatestDatesByRegionCache = new Map<
  string,
  Promise<VegetationLatestDateByRegion[]>
>();
export function buildVegetationScopeClauses(params: {
  region?: number;
  district?: number;
  year?: string;
  cropId?: string;
  cropIds?: string[];
  startDate?: string;
  endDate?: string;
  /** Single-day equality when set (overrides start/end). */
  date?: string;
}): string[] {
  const clauses: string[] = [];
  if (params.region != null && Number.isFinite(params.region)) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null && Number.isFinite(params.district)) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const year = String(params.year || "").match(/\b(18|19|20)\d{2}\b/)?.[0];
  if (year) {
    const nextYear = String(Number(year) + 1);
    clauses.push(
      `raster_date >= DATE '${year}-01-01' AND raster_date < DATE '${nextYear}-01-01'`,
    );
  }
  if (params.date) {
    clauses.push(dateEqualsClause("raster_date", params.date));
  } else if (params.startDate && params.endDate) {
    clauses.push(
      dateRangeInclusiveClause(
        "raster_date",
        params.startDate,
        params.endDate,
      ),
    );
  }
  const cropFilter = Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  );
  if (cropFilter.length === 1) {
    clauses.push(`crop_id='${escapeArcGIS(cropFilter[0])}'`);
  } else if (cropFilter.length > 1) {
    clauses.push(
      `crop_id IN (${cropFilter.map((v) => `'${escapeArcGIS(v)}'`).join(",")})`,
    );
  }
  return clauses;
}
export const vegetationDistinctCropIdsCache = new Map<string, Promise<string[]>>();
export const vegetationMaxRasterDateCache = new Map<string, Promise<string | null>>();
export interface VegetationAvgNdviUniqueRow {
  uniqueid: string;
  avgNdvi: number;
  maxPxAll: number;
  areaHa: number;
}
export const vegetationAvgNdviByUniqueIdCache = new Map<
  string,
  Promise<{
    rows: VegetationAvgNdviUniqueRow[];
    truncated: boolean;
    maxRecordCount: number;
    exceededTransferLimit: boolean;
  }>
>();
export const vegetationAvgNdviOidCursorCache = new Map<
  string,
  Promise<VegetationAvgNdviUniqueRow[]>
>();
export const vegetationDistinctRegionsCache = new Map<string, Promise<number[]>>();
export const vegetationDistinctDistrictsCache = new Map<string, Promise<number[]>>();
export const vegetationMaxDateByRegionCache = new Map<
  string,
  Promise<Map<number, string>>
>();
export interface VegetationStatusCountsParams extends VegetationScopeParams {
  /** "YYYY-MM-DD" */
  date: string;
  /**
   * Crop type filter. agri_vegetation_indices has no human-readable crop
   * name field, only crop_id — callers must resolve the selected turi name
   * to its crop_id first (e.g. via a turi -> crop_id lookup built from
   * Agri_table_data, which carries both).
   */
  cropId?: string;
  /** Multiple selected crops; queried together so one uniqueid is counted once. */
  cropIds?: string[];
  /**
   * Optional STIR-scoped polygon ids. When set, status counts are limited to
   * these uniqueids (header farmer search).
   */
  uniqueIds?: string[];
}
export interface VegetationStatusCount {
  ndvi_status: string;
  /** Number of distinct polygon/field uniqueids in this status. */
  count: number;
  /** Raster area counted once per uniqueid (3m x 3m pixel = 0.0009 ha). */
  areaHa: number;
  /** Stable polygon IDs assigned to this status after deduplication. */
  uniqueIds: string[];
}
export const VEG_STATUS_ROW_PAGE_SIZE = 2000;
export const VEG_STATUS_ROW_MAX_PAGES = 250;
export const vegetationStatusCountsCache = new Map<
  string,
  Promise<VegetationStatusCount[]>
>();
export const vegetationAssignedUniqueIdsCache = new Map<
  string,
  Map<string, string[]>
>();
/**
 * Kill-switch for lightweight VH bar totals (groupBy ndvi_status only).
 * When true, **republic** overview uses status stats (fast).
 */
export const REPUBLIC_VH_USE_STATUS_STATS = true;
/**
 * When true, viloyat/tuman VH **bar paint** uses the same 1-RT status-stats
 * path as republic. Exact uniqueid majority-vote remains the fallback when
 * stats return empty, and map VH clicks still resolve uniqueids separately.
 * Set false if bar totals must match exact vote before any VH bucket click.
 */
export const REGION_VH_BAR_USE_STATUS_STATS = true;
export const vegetationStatusStatsCache = new Map<
  string,
  Promise<VegetationStatusCount[]>
>();
export function buildVegetationStatusWhere(
  params: VegetationStatusCountsParams,
): string {
  const clauses: string[] = [dateEqualsClause("raster_date", params.date)];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const requestedCropIds = Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );
  if (requestedCropIds.length === 1) {
    clauses.push(`crop_id='${escapeArcGIS(requestedCropIds[0])}'`);
  } else if (requestedCropIds.length > 1) {
    clauses.push(
      `crop_id IN (${requestedCropIds
        .map((value) => `'${escapeArcGIS(value)}'`)
        .join(",")})`,
    );
  }
  return clauses.join(" AND ");
}
export interface VegetationUniqueIdsForStatusParams
  extends VegetationStatusCountsParams {
  /** ndvi_status value, e.g. "past" | "orta" | "yaxshi" | "juda_yaxshi" */
  ndviStatus: string;
}
const VEG_UNIQUEID_PAGE_SIZE = 2000;
export const VEG_UNIQUEID_MAX_PAGES = 50;
 // up to ~100k ids at default page size
/** Hard ceiling — never ask the service for more than this per page. */
const VEG_UNIQUEID_PAGE_SIZE_MAX = 10000;
/**
 * Prefer the layer's maxRecordCount so large viloyat VH uniqueid sets need
 * fewer round-trips (same rows, fewer Network rows / same ArcGIS auth token).
 */
export function resolveVegetationUniqueIdPageSize(layer: any): number {
  const fromLayer = Number(layer?.maxRecordCount);
  if (Number.isFinite(fromLayer) && fromLayer >= 500) {
    return Math.min(Math.floor(fromLayer), VEG_UNIQUEID_PAGE_SIZE_MAX);
  }
  return VEG_UNIQUEID_PAGE_SIZE;
}
/** VH bar category label → ndvi_status value in agri_vegetation_indices. */
export const VH_CATEGORY_TO_NDVI_STATUS: Record<string, string> = {
  "1-Juda yaxshi": "juda_yaxshi",
  "2-Yaxshi": "yaxshi",
  "3-O'rta": "orta",
  "4-Past": "past",
};
export interface VegetationCropBreakdownParams {
  date: string;
  ndviStatus: string;
  region?: number;
  district?: number;
}
export interface VegetationCropBreakdownRow {
  cropId: string;
  areaHa: number;
  fieldCount: number;
}
export const vegetationCropBreakdownCache = new Map<
  string,
  Promise<VegetationCropBreakdownRow[]>
>();
export const vegetationCropStatsCache = new Map<
  string,
  Promise<VegetationCropBreakdownRow[]>
>();
/** Crop cardinality is a short list; one page always covers it. */
export const VEG_CROP_STATS_MAX_ROWS = 200;
export function buildVegetationCropScopeWhere(
  params: VegetationCropBreakdownParams,
  status: string,
): string {
  const clauses: string[] = [
    dateEqualsClause("raster_date", params.date),
    `ndvi_status='${escapeArcGIS(status)}'`,
  ];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  return clauses.join(" AND ");
}
export interface VegetationRecentRegionRow {
  regionCode: string;
  fieldCount: number;
}
export interface VegetationRecentDayGroup {
  /** YYYY-MM-DD — calendar day of processed_at (when rows were loaded) */
  date: string;
  regions: VegetationRecentRegionRow[];
  totalFields: number;
}
export const vegetationRecentDaysCache = new Map<
  string,
  Promise<VegetationRecentDayGroup[]>
>();
export function readVegAttr(attrs: Record<string, any>, ...names: string[]): any {
  if (!attrs) return undefined;
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(attrs, name)) return attrs[name];
    const lower = name.toLowerCase();
    for (const key of Object.keys(attrs)) {
      if (key.toLowerCase() === lower) return attrs[key];
    }
  }
  return undefined;
}
export function shiftYmd(ymd: string, deltaDays: number): string | null {
  const parts = String(ymd || "").split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
/** Uzbekistan (Asia/Tashkent) is UTC+5 year-round (no DST). */
const TASHKENT_TZ_OFFSET_MS = 5 * 60 * 60 * 1000;
function epochMsFromDateValue(value: any): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const ms =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}
/** Calendar day in Tashkent for a processed_at timestamp. */
export function formatEpochToTashkentYmd(value: any): string | null {
  const ms = epochMsFromDateValue(value);
  if (ms == null) return null;
  const shifted = new Date(ms + TASHKENT_TZ_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function tashkentDayBoundsMs(
  ymd: string,
): { startMs: number; endMs: number } | null {
  const parts = String(ymd || "")
    .trim()
    .split("-")
    .map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  // Midnight Tashkent = that civil date at 00:00 UTC minus +5h.
  const startMs = Date.UTC(y, m - 1, d) - TASHKENT_TZ_OFFSET_MS;
  return { startMs, endMs: startMs + 24 * 60 * 60 * 1000 };
}
function formatUtcSqlTimestamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
/**
 * One Tashkent calendar day of processed_at (overnight loads stay on local day).
 * Prefer TIMESTAMP range; fall back callers already use DATE for raster_date.
 */
export function processedAtTashkentDayWhere(dateField: string, ymd: string): string {
  const bounds = tashkentDayBoundsMs(ymd);
  if (!bounds) return "1=0";
  return (
    `${dateField} >= TIMESTAMP '${formatUtcSqlTimestamp(bounds.startMs)}' ` +
    `AND ${dateField} < TIMESTAMP '${formatUtcSqlTimestamp(bounds.endMs)}'`
  );
}
function resolveVegetationQueryUrl(layer: any): string {
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
  layer: any,
  where: string,
  field: string,
): Promise<number | null> {
  // 1) FeatureLayer.queryFeatureCount with distinct flag
  try {
    const query = layer.createQuery();
    query.where = where;
    query.outFields = [field];
    query.returnDistinctValues = true;
    query.returnGeometry = false;
    (query as any).returnCountOnly = true;
    if (typeof layer.queryFeatureCount === "function") {
      const count = await layer.queryFeatureCount(query);
      if (Number.isFinite(count) && count >= 0) return Number(count);
    }
  } catch (err) {
    agriNotifyLog("count:distinct-api-failed", {
      where: where.slice(0, 120),
      error: String((err as any)?.message || err),
    });
  }

  // 2) Direct REST (most reliable for returnCountOnly + returnDistinctValues)
  try {
    const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
    const base = resolveVegetationQueryUrl(layer);
    const res = await esriRequest(`${base}/query`, {
      query: {
        f: "json",
        where,
        outFields: field,
        returnDistinctValues: true,
        returnCountOnly: true,
        returnGeometry: false,
      },
      responseType: "json",
    });
    if (res?.data?.error) {
      throw new Error(String(res.data.error.message || "query error"));
    }
    const count = Number(res?.data?.count);
    if (Number.isFinite(count) && count >= 0) return count;
  } catch (err) {
    agriNotifyLog("count:distinct-rest-failed", {
      where: where.slice(0, 120),
      error: String((err as any)?.message || err),
    });
  }

  return null;
}
/**
 * Last N Tashkent calendar days from MAX(processed_at), with DISTINCT uniqueid
 * counts per region. Empty days are kept so the UI shows a true 5-day window.
 */
export function vegetationRecentDaysCacheKey(dayCount: number): string {
  const n = Math.max(1, Math.min(14, Math.floor(Number(dayCount)) || 5));
  // v8: fixed calendar window (no skip-empty backfill) + Tashkent day bounds
  return `v8-processed_at-calendar-window|${n}`;
}
/** Saved feed only. Does not open a layer or send a statistics request. */
export function peekVegetationRecentDayRegionCounts(
  dayCount = 5,
): VegetationRecentDayGroup[] | null {
  const cached = getAgriPersistentCache<VegetationRecentDayGroup[]>(
    "veg-recent-days",
    vegetationRecentDaysCacheKey(dayCount),
  );
  return Array.isArray(cached) ? cached : null;
}
