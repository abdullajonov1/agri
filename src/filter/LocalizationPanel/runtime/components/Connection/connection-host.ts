import type { LocalizationHost } from "../host";

/** Members of LocalizationHost used by connection/connection-init.ts. */
export type ConnectionInitHost = Pick<
  LocalizationHost,
  | "_allowClearOnce"
  | "_dsOnlyRetryCount"
  | "_dsOnlyRetryTimer"
  | "_homeExtent"
  | "_isMounted"
  | "_lastShownRegionYearLayers"
  | "_mapClickHandle"
  | "_mapConnectionPromise"
  | "_mapInteractionHandle"
  | "_viewReadyWatchHandle"
  | "_zoomRequestId"
  | "attachMapClickDispatcher"
  | "finalizeConnection"
  | "getEffectiveUseDataSources"
  | "getEffectiveViloyat"
  | "getMapWidgetId"
  | "getPortalSelf"
  | "initializeDataSourceOnlyConnection"
  | "initializeMapConnection"
  | "initializeMapConnectionOnce"
  | "normalizeApos"
  | "props"
  | "resolveAllowedViloyats"
  | "resolveFeatureLayersFromUseDataSources"
  | "resolveSpatialMapLayers"
  | "runInitialDataLoad"
  | "setState"
  | "state"
  | "syncShownRegionYearLayers"
>;

/** Members of LocalizationHost used by connection/connection-layer.ts. */
export type ConnectionLayerHost = Pick<
  LocalizationHost,
  | "_allowClearOnce"
  | "_dataSourceInfoDebounceTimer"
  | "_initialDataLoadPromise"
  | "_isMounted"
  | "_layerToViloyatKeys"
  | "_ndviDateFieldMap"
  | "_primaryDataSourceId"
  | "_readyFired"
  | "_viloyatKeyToLayerKeys"
  | "applyMapFiltersOptimized"
  | "broadcastFilterState"
  | "buildLayerViloyatIndex"
  | "fetchAndStoreRegionDistrictMappings"
  | "fetchDataWithCurrentState"
  | "fetchFilterOptions"
  | "flDistinctFromLayer"
  | "getLayerKey"
  | "getUniqueValues"
  | "initializationTimer"
  | "initializeDataSourceOnlyConnection"
  | "makeRegionDistrictKey"
  | "props"
  | "resolveFeatureLayerFromOneUseDataSource"
  | "runInitialDataLoad"
  | "setState"
  | "state"
  | "warmYearRegionMapImages"
>;

/** Members of LocalizationHost used by connection/connection-selection.ts. */
export type ConnectionSelectionHost = Pick<
  LocalizationHost,
  | "_regionToViloyat"
  | "_tumanToDistrict"
  | "_turiToCropId"
  | "_viloyatToRegion"
  | "buildTurlarClause"
  | "buildViloyatRegionClause"
  | "eqAposSmart"
  | "getGeoCodeHelpers"
  | "getSelectedTurlar"
  | "makeRegionDistrictKey"
  | "resolveCropIdForTuri"
  | "state"
>;
