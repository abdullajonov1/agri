import { combineAccessWhereIfFieldsExist } from "../../shared/agri-access-config";
import { escapeArcGIS, dateEqualsClause } from "../../shared/agri-sql";
import type { AgriAttributes, AgriLayerWithMaxRecordCount } from "../agri-layer-types";
import { dateRangeInclusiveClause } from "./veg-time";
import type {
  VegetationCropBreakdownParams,
  VegetationStatusCountsParams,
} from "./veg-types";

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
export function withVegAccessWhere(mainWhere: string): string {
  return combineAccessWhereIfFieldsExist(mainWhere, VEG_LAYER_ACCESS_FIELDS);
}
/**
 * Cache-key suffix for the access WHERE queryVegFeatures applies. Empty when
 * access adds nothing (keys stay as before); otherwise a compact FNV-1a hash
 * so persisted entries are never shared between access scopes.
 */
export function vegAccessCacheTag(): string {
  const access = withVegAccessWhere("1=1");
  if (access === "1=1") return "";
  let hash = 0x811c9dc5;
  for (let i = 0; i < access.length; i += 1) {
    hash = Math.imul(hash ^ access.charCodeAt(i), 0x01000193) >>> 0;
  }
  return `|acc=${hash.toString(36)}`;
}
/** agri_vegetation_indices px_all comes from a 3m x 3m raster: 9 m² / 10,000. */
export const VEG_PIXEL_AREA_HA = 0.0009;
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
/**
 * `crop_id='x'` / `crop_id IN ('x','y')` for a crop id list: trimmed, blanks
 * dropped, duplicates removed (first occurrence order kept). Null when empty.
 */
export function buildCropClause(
  cropIds: ReadonlyArray<string | null | undefined>,
  field = "crop_id",
): string | null {
  const ids = Array.from(
    new Set(cropIds.map((id) => String(id ?? "").trim()).filter(Boolean)),
  ).map((id) => `'${escapeArcGIS(id)}'`);
  if (ids.length === 0) return null;
  return ids.length === 1 ? `${field}=${ids[0]}` : `${field} IN (${ids.join(",")})`;
}
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
  const cropClause = buildCropClause([
    ...(params.cropIds || []),
    params.cropId,
  ]);
  if (cropClause) clauses.push(cropClause);
  return clauses;
}
export const VEG_STATUS_ROW_PAGE_SIZE = 2000;
export const VEG_STATUS_ROW_MAX_PAGES = 250;
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
  const cropClause = buildCropClause([
    ...(params.cropIds || []),
    params.cropId,
  ]);
  if (cropClause) clauses.push(cropClause);
  return clauses.join(" AND ");
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
export function resolveVegetationUniqueIdPageSize(
  layer: AgriLayerWithMaxRecordCount | null | undefined,
): number {
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
export function readVegAttr(
  attrs: AgriAttributes | null | undefined,
  ...names: string[]
): unknown {
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
