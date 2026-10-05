/**
 * Shared FeatureLayer data access for embedded Agri widgets.
 *
 * All embedded widgets in AgroWidgetV5 read ONLY from the ArcGIS
 * FeatureLayer or MapImageLayer sublayer (water_table) — no external HTTP API.
 *
 * Field mapping (UI filter -> FeatureLayer field), with name-field fallbacks:
 *   yil      -> year
 *   viloyat  -> region_id  (fallback: viloyat)
 *   tuman    -> distrct_id (fallback: tuman)
 *   mavsum   -> season_id  (fallback: mavsum)
 *   fermer   -> full_name
 *   farmerTax -> tax_number (STIR qidiruv; dropdown fermer bilan bir vaqtda emas)
 *   crop     -> crop_id    (fallback: crop)
 *   manba    -> real_name
 *   kanal    -> real_n1
 *   minMax   -> minmax
 *
 * Metric fields:
 *   area     -> area_ha (SUM)
 *   count    -> objectid (COUNT)
 *   yield    -> yield   (MEDIAN)
 *   eff      -> wp_tot  (MEDIAN)
 *   monthly  -> uw3_m3 .. uw10_m3 (SUM)
 *   total    -> uwt_m3  (SUM)
 */

export {
  isAgriAdminBoundaryLayer,
  isMapImageSublayer,
  isRegionSoatoCode,
  shouldRefreshMapImageParentOnly,
} from "./map-image-predicates";

export { escapeArcGIS } from "../data/agri-sql";

export { withAgriAccessWhere, resolveEfficiencyField, clampEfficiencyValue, isEfficiencyRangeActive, buildEfficiencyRangeWhere, mergeEfficiencyIntoFilters, MONTHLY_FIELDS, REGION_SOATO_TO_UZ_NAME, regionSoatoToDisplayName, regionDisplayNameToSoato, extractMapLayerIdFromDsId, isMapImageGroupSublayer, safeLoadMapLayer, isQueryableFieldLayer, getLayerFieldNames, extractYearFromHaystack, normalizeMapServiceUrl, normalizeQueryableLayerUrl, getAgriLayerMapKey, getMapImageParentLayer, isMapImageOwnedLayer, ensureAgriServerIdentityToken, resolveQueryableServiceUrl, refreshRegionYearMapExports, normalizeRegionToken, regionFilterValuesEqual, looksLikeRegionYearLayerHaystack, haystackHasKnownRegionToken, haystackMatchesYear, pickYearRegionLayerPool, apostropheVariants, expandRegionVariants, expandDistrictVariants, getMavsumGroupedValues, layerFieldKind, FARMER_TAX_NUMBER_FIELD, normalizeFarmerTaxSearchValue, landTypeIdForValue, hasActiveLandTypeFilter, flLog, installPbfJsonWorkaround, disableLayerPbf, getQueryUrl, isValidMapExtent, getDetachedQueryLayerForUrl } from "./feature-layer/primitives";
export type { AgriFilters, ResolvedFeatureLayer, ShownRegionYearLayer, LayerFieldKind, PickWhereWithMavsumFallbackResult, PickWhereProgressiveResult } from "./feature-layer/primitives";
export { normalizeRegionDisplayValue, canonicalizeRegionFilterValue, safeLoadMapImageTree, isAgriWaterTableLayer, getDetachedQueryLayerFor, collectQueryableFieldLayers, getQueryableLayer, unlockShownRegionYearFieldScales, collectRegionYearLeafLayers, getAllFeatureLayersFromMap, buildFarmerTaxWhere, buildLandTypeWhere, invalidateAgriQueryCache, queryLayerJson, queryLayerExtent, distinctValues } from "./feature-layer/layer-lookup";
export { findQueryableLayerOnMapByUrl, findQueryableLayerOnMapById, syncRegionYearLayerVisibility, preloadRegionYearMapImages, scoreHaystackForFilters, haystackMatchesRegion, inferRegionDisplayFromHaystack, prepareValueIndex, buildCropSelectionWhere, quickLayerFeatureCount, countWhere, pickWhereWithMavsumFallback, sumField, sumFields, medianField, sumByGroup, cropStatsByGroup } from "./feature-layer/map-and-stats";
export { ensureRegionYearMapImagesReady, resolveFeatureLayerForFilters, getFeatureLayerFromView, buildAgriWhere, pickWhereWithProgressiveFallback, medianFieldWithMavsumFallback } from "./feature-layer/where-and-resolve";
