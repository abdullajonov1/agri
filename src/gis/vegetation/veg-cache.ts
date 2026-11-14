import { getAgriPersistentCache } from "../../data/agri-persistent-cache";
import { vegAccessCacheTag } from "./veg-sql";
import type {
  VegetationAvgNdviUniqueRow,
  VegetationCropBreakdownRow,
  VegetationLatestDateByRegion,
  VegetationPolygonSeriesRow,
  VegetationRecentDayGroup,
  VegetationSeriesRow,
  VegetationStatusCount,
} from "./veg-types";

/** In-flight / session cache so AgriPopup + AgriGraff share one FeatureServer hit. */
export const vegetationSeriesByUniqueIdCache = new Map<
  string,
  Promise<VegetationPolygonSeriesRow[]>
>();
export const vegetationRegionalTimeseriesCache = new Map<
  string,
  Promise<VegetationSeriesRow[]>
>();
/**
 * Distinct raster_date values (as "YYYY-MM-DD", ascending) available for a
 * region/district — drives the NDVI date picker. Replaces the old
 * "scan the polygon layer for status_YYYY_MM_DD columns" approach, which
 * only worked against a layer that actually had those wide columns
 * (Agri_table_data doesn't).
 */
export const vegetationAvailableDatesCache = new Map<string, Promise<string[]>>();
export const vegetationLatestDatesByRegionCache = new Map<
  string,
  Promise<VegetationLatestDateByRegion[]>
>();
export const vegetationDistinctCropIdsCache = new Map<string, Promise<string[]>>();
export const vegetationMaxRasterDateCache = new Map<string, Promise<string | null>>();
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
export const vegetationStatusCountsCache = new Map<
  string,
  Promise<VegetationStatusCount[]>
>();
export const vegetationAssignedUniqueIdsCache = new Map<
  string,
  Map<string, string[]>
>();
export const vegetationStatusStatsCache = new Map<
  string,
  Promise<VegetationStatusCount[]>
>();
export const vegetationCropBreakdownCache = new Map<
  string,
  Promise<VegetationCropBreakdownRow[]>
>();
export const vegetationCropStatsCache = new Map<
  string,
  Promise<VegetationCropBreakdownRow[]>
>();
/** Crop cardinality is a short list; one page always covers it. */
export const vegetationRecentDaysCache = new Map<
  string,
  Promise<VegetationRecentDayGroup[]>
>();
/**
 * Last N Tashkent calendar days from MAX(processed_at), with DISTINCT uniqueid
 * counts per region. Empty days are kept so the UI shows a true 5-day window.
 */
export function vegetationRecentDaysCacheKey(dayCount: number): string {
  const n = Math.max(1, Math.min(14, Math.floor(Number(dayCount)) || 5));
  // v8: fixed calendar window (no skip-empty backfill) + Tashkent day bounds
  return `v8-processed_at-calendar-window|${n}${vegAccessCacheTag()}`;
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
