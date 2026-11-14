import type { LocalizationHost } from "../host";

/** Members of LocalizationHost used by each Map service file (type-only slices; callers pass the full host). */

export type CropRendererHost = Pick<LocalizationHost,
  | "_cropDistinctValueCache" | "_cropRenderedLayers" | "_cropRendererRequestId" | "_isMounted"
  | "_lastShownRegionYearLayers" | "_originalLayerRenderers" | "applyCropRenderer"
  | "buildCropUniqueValueInfosFromValues" | "cropDistinctCacheKey" | "findLayerFieldName"
  | "getCropRendererTargetLayers" | "getSelectedTurlar" | "queryDistinctCropValues"
  | "refreshCropLayer" | "state">;

export type RegionYearLayersHost = Pick<LocalizationHost,
  | "_farmerMapUniqueIds" | "_isMounted" | "_lastShownRegionYearLayers" | "_regionYearSettleRepaintTimers"
  | "_suppressLegacyVhOnMap" | "_vhMapUniqueIds" | "_vhUniqueIdsCropScoped" | "_zoomRequestId"
  | "buildViloyatRegionClause" | "buildWhereClause" | "clearRegionYearSettleRepaintTimers"
  | "getAdminBoundarySelection" | "getEffectiveViloyat" | "getLayerMatchStateForViloyat"
  | "getSelectedTurlar" | "repaintShownRegionYearLayers" | "state" | "syncShownRegionYearLayers">;

export type MapFilterFetchHost = Pick<LocalizationHost,
  | "_filterDataRequestId" | "_isMounted" | "_vhMapUniqueIds" | "buildWhereForLayer"
  | "getEffectiveViloyat" | "getSelectedTurlar" | "setMapNoData" | "setState" | "state">;

export type MapFilterLayerSyncHost = Pick<LocalizationHost,
  | "_lastShownRegionYearLayers" | "applyInstantCropPaletteNoRefresh" | "getEffectiveViloyat"
  | "state" | "syncShownRegionYearLayers">;

export type MapFilterHelpersHost = Pick<LocalizationHost,
  | "_deferVhUniqueIdResolve" | "_districtZoomRequestId" | "_isMounted" | "_lastShownRegionYearLayers"
  | "_polygonAreaQueryCache" | "_prevDefinitionExpression" | "_suppressLegacyVhOnMap" | "_tumanToDistrict"
  | "_vhUniqueIdsReadyForApply" | "_viloyatToRegion" | "buildNdviDateClauseWithoutVh"
  | "buildNdviStatusClauseForCurrentVh" | "buildTurlarClause" | "buildWhereClause" | "buildWhereForLayer"
  | "findLayerFieldName" | "getEffectiveViloyat" | "normalizeApos" | "props" | "resolveVhMapUniqueIds" | "state"> & MapFilterLayerSyncHost;

export type MapFilterPaintStageHost = Pick<LocalizationHost,
  | "_deferVhUniqueIdResolve" | "_lastShownRegionYearLayers" | "_mapSurfaceLoadingToken"
  | "_suppressLegacyVhOnMap" | "_vhMapUniqueIds" | "_vhUniqueIdsReadyForApply" | "applyFiltersPersistent"
  | "broadcastFilterState" | "fetchDataWithCurrentState" | "getChartFilterFlags" | "resolveVhMapUniqueIds"
  | "setMapNoData" | "setMapSurfaceLoading" | "setShownRegionYearOpacity" | "state" | "syncCropRenderer"
  | "waitForShownRegionYearRedraw">;

export type MapFilterZoomExtentHost = Pick<LocalizationHost, "_lastShownRegionYearLayers">;

export type MapFilterApplyHost = Pick<LocalizationHost,
  | "_allowClearOnce" | "_homeExtent" | "_isMounted" | "_lastHomeGoToAt" | "_lastShownRegionYearLayers"
  | "_prevDefinitionExpression" | "_prevPolygonModeForZoomGuard" | "_vhMapUniqueIds" | "_zoomRequestId"
  | "getAdminBoundarySelection" | "getEffectiveViloyat" | "getSelectedTurlar" | "props"
  | "scheduleShownRegionYearSettleRepaint" | "state" | "zoomToSelectedDistrict">
  & MapFilterPaintStageHost & MapFilterZoomExtentHost;
