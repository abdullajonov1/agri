import type { AgriSingletonLayerHandle } from "../../shared/agri-singleton-layer-loader";

/** Loaded agri_vegetation_indices FeatureLayer + its field names. */
export type AgriVegetationLayerHandle = AgriSingletonLayerHandle;

/** One regional (aggregated per raster_date) vegetation index row. */
export type VegetationSeriesRow = Record<string, unknown>;

/**
 * One agri_vegetation_indices row (outFields "*") for a single polygon.
 * Known columns are listed for readers; values come straight from the
 * service, so every column is optional and nullable.
 */
export interface VegetationPolygonSeriesRow {
  [field: string]: unknown;
  objectid?: number | null;
  id?: number | null;
  raster_id?: number | null;
  uniqueid?: string | null;
  raster_date?: number | string | null;
  processed_at?: number | string | null;
  ndvi?: number | null;
  ndvi_min?: number | null;
  ndvi_max?: number | null;
  savi?: number | null;
  savi_min?: number | null;
  savi_max?: number | null;
  evi?: number | null;
  rvi?: number | null;
  rvi_min?: number | null;
  rvi_max?: number | null;
  ci?: number | null;
  ci_min?: number | null;
  ci_max?: number | null;
  ndwi?: number | null;
  ndwi_min?: number | null;
  ndwi_max?: number | null;
  pixel_count?: number | null;
  mean_red?: number | null;
  mean_nir?: number | null;
  mean_green?: number | null;
}

/** esri Query plus the REST paging props the JS API typings omit. */
export type VegQuery = __esri.Query & {
  resultRecordCount?: number;
  resultOffset?: number;
};

/**
 * Query members read by queryVegFeatures — an esri Query satisfies it, plus
 * the REST paging props the JS API typings omit.
 */
export interface VegQueryLike {
  where?: string | null;
  outFields?: string[] | string | null;
  groupByFieldsForStatistics?: string[] | null;
  outStatistics?: unknown[] | null;
  orderByFields?: string[] | null;
  returnGeometry?: boolean | null;
  returnDistinctValues?: boolean | null;
  num?: number | null;
  resultRecordCount?: number | null;
  resultOffset?: number | null;
}
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
export interface VegetationScopeParams {
  region?: number;
  district?: number;
}
export interface VegetationLatestDateByRegion {
  region: number;
  /** Latest "YYYY-MM-DD" that has vegetation rows for this region. */
  date: string;
}
export interface VegetationAvgNdviUniqueRow {
  uniqueid: string;
  avgNdvi: number;
  maxPxAll: number;
  areaHa: number;
}
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
export interface VegetationUniqueIdsForStatusParams
  extends VegetationStatusCountsParams {
  /** ndvi_status value, e.g. "past" | "orta" | "yaxshi" | "juda_yaxshi" */
  ndviStatus: string;
  /** Read ids from agri_field_status_year (same scope rule as the VH bar summary). */
  useYearSummary?: boolean;
}
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
