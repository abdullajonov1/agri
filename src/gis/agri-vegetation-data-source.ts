/**
 * Shared access to the external agri_vegetation_indices Table (NDVI/SAVI/
 * EVI/RVI/CI vegetation index readings per polygon per raster_date).
 *
 * This replaces the previous apisoil.sgm.uzspace.uz REST API dependency
 * used by AgriGraff10's graph view: same underlying data, served directly
 * from ArcGIS Server (same portal/token as every other AgriDashboard data
 * source), so the chart no longer depends on a separate external
 * microservice being reachable.
 */

export { dateEqualsClause } from "../data/agri-sql";

export { agriVhLog, agriVegetationLog, getAgriVegetationIndicesUrl, getAgriVegetationIndicesLayer, VEG_AVG_FIELDS_CORE, formatArcgisDateToYmd, dateRangeInclusiveClause, REPUBLIC_VH_USE_STATUS_STATS, REGION_VH_BAR_USE_STATUS_STATS, VH_CATEGORY_TO_NDVI_STATUS, peekVegetationRecentDayRegionCounts } from "./vegetation/veg-base";
export type { AgriVegetationLayerHandle, VegetationRegionalTimeseriesParams, VegetationScopeParams, VegetationLatestDateByRegion, VegetationAvgNdviUniqueRow, VegetationStatusCountsParams, VegetationStatusCount, VegetationUniqueIdsForStatusParams, VegetationCropBreakdownParams, VegetationCropBreakdownRow, VegetationRecentRegionRow, VegetationRecentDayGroup } from "./vegetation/veg-base";
export { queryVegetationSeriesForUniqueId, queryVegetationRegionalTimeseries, queryVegetationAvailableDates, queryVegetationLatestDatesByRegion, queryVegetationDistinctCropIds, queryVegetationDistinctRegions, queryVegetationDistinctDistricts, queryVegetationMaxRasterDate, queryVegetationMaxRasterDateByRegion } from "./vegetation/veg-series";
export { queryVegetationStatusCounts, queryVegetationStatusCountsByStatus, queryVegetationUniqueIdsForStatus, queryVegetationCropStatsForStatus, queryVegetationCropBreakdownForStatus } from "./vegetation/veg-status";
export { queryVegetationAvgNdviByUniqueId, queryVegetationStatusCountsByRegionScopes, queryVegetationRecentDayRegionCounts } from "./vegetation/veg-top";
