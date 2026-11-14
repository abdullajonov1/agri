import { vegAccessCacheTag, type VegetationStatusCountsParams, getAgriVegetationIndicesLayer, queryVegFeatures, dateRangeInclusiveClause, formatArcgisDateToYmd, shiftYmd, agriVhLog, type VegQuery } from "../veg-base";
import { escapeArcGIS } from "../../../data/agri-sql";
import { buildSpatialJoinWhere } from "../../agri-table-data-source";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { rememberAsync } from "../../../data/agri-persistent-cache";
import { getAgriDashboardBootstrap } from "../../../data/agri-bootstrap";
import { getTuriCropLookupKey } from "../../../shared/agri-crop-labels";
import { errorMessage } from "../../agri-layer-types";

/**
 * Vegetatsiya Holati window: every crop's last VH_STATUS_WINDOW_DAYS days
 * ending at that crop's own newest raster_date (per viloyat), capped by the
 * working date. Crops are processed on their own schedules — one shared end
 * date would drop crops that stopped earlier.
 *
 * Seasonal crops (VH_wheat.xls reference tables): Bug'doy is assessed only
 * in Mart–Aprel and Paxta in Iyun–Sentabr. Outside the season they keep the
 * last 10 days of their season (e.g. Paxta in October → late September).
 *
 * The main scan reads only the 10-day windows (a season-long grouped scan
 * over the republic fails on the server). A field with no reading in its
 * window falls back to its newest reading earlier in the season (the
 * selected year for non-seasonal crops) — fetched by uniqueid for just those
 * fields (see status-latest-window).
 */
export const VH_STATUS_WINDOW_DAYS = 10;

/** Canonical crop key → inclusive [first month, last month] of its VH season. */
export const VH_CROP_SEASON_MONTHS: Record<string, readonly [number, number]> = {
  bugdoy: [3, 4],
  paxta: [6, 9],
};

/** First day of the inclusive window that ends at `endYmd`. */
export function vhStatusWindowStart(
  endYmd: string,
  days: number = VH_STATUS_WINDOW_DAYS,
): string {
  const end = String(endYmd || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) return "";
  return shiftYmd(end, -(Math.max(1, Math.floor(days)) - 1)) || "";
}

export interface VhWindowParams extends VegetationStatusCountsParams {
  /** Window length in days (default VH_STATUS_WINDOW_DAYS). */
  windowDays?: number;
}

/** One region × crop window; null = the row had no region / crop_id. */
export interface VhCropWindow {
  region: string | null;
  cropId: string | null;
  /** 10-day window start (season-clamped). */
  startDate: string;
  endDate: string;
  /** Fallback reach: season start, or Jan 1 for non-seasonal crops. */
  lookbackStart: string;
}

export interface VhResolvedWindows {
  /** Vegetation WHERE for all windows + scope; null when nothing qualifies. */
  where: string | null;
  windows: VhCropWindow[];
  /** Earliest window start / latest window end ("" when empty). */
  startDate: string;
  endDate: string;
  /** region / district / crop / STIR clauses ANDed into every WHERE. */
  scopeClauses: string[];
  regionField: string;
  cropField: string;
}

const EMPTY_WINDOWS: VhResolvedWindows = {
  where: null,
  windows: [],
  startDate: "",
  endDate: "",
  scopeClauses: [],
  regionField: "",
  cropField: "",
};

const readAttribute = (attributes: Record<string, unknown>, field: string): unknown =>
  attributes?.[field] ??
  attributes?.[field.toLowerCase()] ??
  attributes?.[field.toUpperCase()];

const quoteList = (values: string[]): string =>
  values.map((value) => `'${escapeArcGIS(value)}'`).join(",");

export const normalizeCropIds = (params: VegetationStatusCountsParams): string[] =>
  Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  ).sort();

export function buildCropClause(cropIds: string[]): string | null {
  if (cropIds.length === 1) return `crop_id='${escapeArcGIS(cropIds[0])}'`;
  if (cropIds.length > 1) return `crop_id IN (${quoteList(cropIds)})`;
  return null;
}

/** region / district / crop / STIR clauses; null when STIR has no parcels. */
export function buildScopeClauses(params: VegetationStatusCountsParams): string[] | null {
  const clauses: string[] = [];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const cropClause = buildCropClause(normalizeCropIds(params));
  if (cropClause) clauses.push(cropClause);
  if (Array.isArray(params.uniqueIds)) {
    const ids = params.uniqueIds.map((v) => String(v || "").trim()).filter(Boolean);
    // Farmer STIR with no parcels → nothing can match.
    if (!ids.length) return null;
    clauses.push(buildSpatialJoinWhere(ids));
  }
  return clauses;
}

/**
 * crop_id → season months for the seasonal crops, from the Agri_table
 * turi ↔ crop_id bootstrap (one turi may own several crop_ids). Empty when
 * the mapping is unavailable — every crop then uses the plain 10-day window.
 */
export async function loadVhSeasonCropIds(): Promise<Map<string, readonly [number, number]>> {
  const out = new Map<string, readonly [number, number]>();
  try {
    const { turiCropRows } = await getAgriDashboardBootstrap();
    for (const row of turiCropRows || []) {
      const season = VH_CROP_SEASON_MONTHS[getTuriCropLookupKey(row.turi)];
      const cropId = String(row.cropId ?? "").trim();
      if (season && cropId) out.set(cropId, season);
    }
  } catch (error) {
    agriVhLog("vh-window:season-crops-unavailable", { error: errorMessage(error) });
  }
  return out;
}

const lastDayOfMonth = (year: number, month: number): string =>
  new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

const monthStart = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, "0")}-01`;

/** `field IN (…)` / `field IS NULL` for a list that may contain null. */
function inOrNull(field: string, values: Array<string | null>): string {
  const ids = Array.from(new Set(values.filter((v): v is string => v != null))).sort();
  const parts: string[] = [];
  if (ids.length === 1) parts.push(`${field}='${escapeArcGIS(ids[0])}'`);
  else if (ids.length > 1) parts.push(`${field} IN (${quoteList(ids)})`);
  if (values.some((v) => v == null)) parts.push(`${field} IS NULL`);
  return parts.length > 1 ? `(${parts.join(" OR ")})` : parts[0] || "1=0";
}

/**
 * Which rows may set a crop's window end: the selected year up to the
 * working date, and for seasonal crops only their season months.
 */
function buildEligibilityClause(
  year: number,
  endBound: string,
  seasons: Map<string, readonly [number, number]>,
): string {
  const yearStart = `${year}-01-01`;
  const seasonal = Array.from(seasons.keys()).sort();
  const parts: string[] = [];
  parts.push(
    seasonal.length
      ? `(${dateRangeInclusiveClause("raster_date", yearStart, endBound)} AND (crop_id IS NULL OR crop_id NOT IN (${quoteList(seasonal)})))`
      : `(${dateRangeInclusiveClause("raster_date", yearStart, endBound)})`,
  );
  const idsBySeason = new Map<string, string[]>();
  for (const [cropId, [from, to]] of seasons) {
    const key = `${from}-${to}`;
    idsBySeason.set(key, [...(idsBySeason.get(key) || []), cropId]);
  }
  for (const [key, ids] of Array.from(idsBySeason.entries()).sort()) {
    const [from, to] = key.split("-").map(Number);
    const start = monthStart(year, from);
    const end = lastDayOfMonth(year, to) < endBound ? lastDayOfMonth(year, to) : endBound;
    if (start > end) continue;
    parts.push(
      `(${dateRangeInclusiveClause("raster_date", start, end)} AND crop_id IN (${quoteList(ids.sort())}))`,
    );
  }
  return `(${parts.join(" OR ")})`;
}

export const vhWindowCache = new Map<string, Promise<VhCropWindow[]>>();
const VH_WINDOW_CACHE_MAX = 64;

/**
 * Per region × crop window ending at the newest eligible raster_date.
 * `params.date` is the cap (working date, or the year's last day when the
 * calendar is not locked).
 */
export async function resolveVhStatusWindows(params: VhWindowParams): Promise<VhResolvedWindows> {
  const endBound = String(params.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endBound)) return EMPTY_WINDOWS;
  const scopeClauses = buildScopeClauses(params);
  if (!scopeClauses) return EMPTY_WINDOWS;
  const days = Math.max(1, Math.floor(params.windowDays ?? VH_STATUS_WINDOW_DAYS));
  const year = Number(endBound.slice(0, 4));

  const [{ fields }, seasons] = await Promise.all([
    getAgriVegetationIndicesLayer(),
    loadVhSeasonCropIds(),
  ]);
  const fieldByLower = new Map(fields.map((f) => [String(f).toLowerCase(), String(f)]));
  const regionField = fieldByLower.get("region") || "";
  const cropField = fieldByLower.get("crop_id") || "";
  const usableSeasons = cropField ? seasons : new Map<string, readonly [number, number]>();

  const maxWhere = [
    buildEligibilityClause(year, endBound, usableSeasons),
    "raster_date IS NOT NULL",
    ...scopeClauses,
  ].join(" AND ");
  const groupFields = [regionField, cropField].filter(Boolean);

  const windows = await rememberAsync({
    memory: vhWindowCache,
    namespace: "veg-vh-window",
    key: `v2|${maxWhere}|g=${groupFields.join(",")}|d=${days}${vegAccessCacheTag()}`,
    // STIR lists are per-selection — keep them out of localStorage.
    ...(Array.isArray(params.uniqueIds) ? { ttlMs: 0 } : {}),
    factory: async (): Promise<VhCropWindow[]> => {
      const startedAt = Date.now();
      const { layer } = await getAgriVegetationIndicesLayer();
      const query: VegQuery = layer.createQuery();
      query.where = maxWhere;
      if (groupFields.length) {
        query.groupByFieldsForStatistics = groupFields;
        query.outFields = groupFields;
      }
      query.outStatistics = asStatisticDefinitions([
        { statisticType: "max", onStatisticField: "raster_date", outStatisticFieldName: "last_date" },
      ]);
      query.returnGeometry = false;
      const result = await queryVegFeatures(layer, query);
      if (result?.exceededTransferLimit) {
        agriVhLog("vh-window:max-truncated", { where: maxWhere });
      }
      const out: VhCropWindow[] = [];
      for (const feature of result?.features ?? []) {
        const attrs = (feature?.attributes || {}) as Record<string, unknown>;
        const endDate = formatArcgisDateToYmd(readAttribute(attrs, "last_date"));
        if (!endDate) continue;
        const rawRegion = regionField ? readAttribute(attrs, regionField) : null;
        const rawCrop = cropField ? readAttribute(attrs, cropField) : null;
        const region = rawRegion == null || String(rawRegion).trim() === "" ? null : String(rawRegion).trim();
        const cropId = rawCrop == null || String(rawCrop).trim() === "" ? null : String(rawCrop).trim();
        let startDate = vhStatusWindowStart(endDate, days);
        const season = cropId ? usableSeasons.get(cropId) : undefined;
        const lookbackStart = monthStart(Number(endDate.slice(0, 4)), season ? season[0] : 1);
        if (startDate < lookbackStart) startDate = lookbackStart;
        out.push({ region, cropId, startDate, endDate, lookbackStart });
      }
      out.sort((a, b) =>
        `${a.region}|${a.cropId}`.localeCompare(`${b.region}|${b.cropId}`),
      );
      agriVhLog("vh-window:done", { ms: Date.now() - startedAt, windows: out.length });
      return out;
    },
  });
  while (vhWindowCache.size > VH_WINDOW_CACHE_MAX) {
    const oldestKey = vhWindowCache.keys().next().value;
    if (!oldestKey) break;
    vhWindowCache.delete(oldestKey);
  }

  if (!windows.length) return EMPTY_WINDOWS;
  return {
    where: buildVhWindowsWhere(windows, regionField, cropField, scopeClauses),
    windows,
    startDate: windows.reduce((min, w) => (!min || w.startDate < min ? w.startDate : min), ""),
    endDate: windows.reduce((max, w) => (w.endDate > max ? w.endDate : max), ""),
    scopeClauses,
    regionField,
    cropField,
  };
}

/**
 * Vegetation WHERE over the given 10-day windows: windows sharing a date range
 * collapse into one clause over every region × crop that uses it.
 */
export function buildVhWindowsWhere(
  windows: VhCropWindow[],
  regionField: string,
  cropField: string,
  scopeClauses: string[],
): string | null {
  if (!windows.length) return null;
  const byRange = new Map<string, Map<string | null, Array<string | null>>>();
  for (const w of windows) {
    const rangeKey = `${w.startDate}|${w.endDate}`;
    const regions = byRange.get(rangeKey) || new Map<string | null, Array<string | null>>();
    regions.set(w.region, [...(regions.get(w.region) || []), w.cropId]);
    byRange.set(rangeKey, regions);
  }
  const rangeClauses = Array.from(byRange.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rangeKey, regions]) => {
      const [start, end] = rangeKey.split("|");
      const pairs = Array.from(regions.entries()).map(([region, crops]) => {
        const parts = [
          ...(regionField ? [inOrNull(regionField, [region])] : []),
          ...(cropField ? [inOrNull(cropField, crops)] : []),
        ];
        return parts.length ? `(${parts.join(" AND ")})` : "1=1";
      });
      return `(${dateRangeInclusiveClause("raster_date", start, end)} AND (${pairs.join(" OR ")}))`;
    });
  return [`(${rangeClauses.join(" OR ")})`, ...scopeClauses].join(" AND ");
}
