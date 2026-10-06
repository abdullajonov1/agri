/**
 * Map-layer selection and statistics — public facade.
 *
 * Implementation lives in cohesive modules; this file keeps the historical
 * import path stable for every caller:
 * - map-layer-find:          find a queryable layer on the map by URL / id
 * - region-year-visibility:  show/hide region+year layers, preload metadata
 * - haystack-scoring:        year/region scoring of layer titles and URLs
 * - where-clauses:           value index + text / crop WHERE builders
 * - stats-queries:           cached count / SUM / MEDIAN / grouped stats
 */
export { findQueryableLayerOnMapByUrl, findQueryableLayerOnMapById } from "./map-layer-find";
export { syncRegionYearLayerVisibility, preloadRegionYearMapImages } from "./region-year-visibility";
export { scoreHaystackForFilters, haystackMatchesRegion, inferRegionDisplayFromHaystack, scoreLayerForFilters } from "./haystack-scoring";
export { prepareValueIndex, textMatchClause, buildCropSelectionWhere } from "./where-clauses";
export { quickLayerFeatureCount, countWhere, pickWhereWithMavsumFallback, sumField, sumFields, medianField, sumByGroup, cropStatsByGroup } from "./stats-queries";
