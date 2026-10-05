

export { getPortalSelf, getEffectiveUseDataSources, attachMapClickDispatcher, onActiveViewChange, initializeMapConnection, reassertPolygonGeographyFilter, initializeMapConnectionOnce, initializeDataSourceOnlyConnection, finalizeConnection } from "./connection/connection-init";
export { resolveFeatureLayerFromOneUseDataSource, resolveSpatialMapLayers, resolveFeatureLayersFromUseDataSources, buildLayerViloyatIndex, detectNdviStatusDateFieldsFromLayer, onDataSourceCreated, onDataSourceInfoChange, retryMapConnection, runInitialDataLoad, getUniqueValues, fetchFilterOptions, flDistinctFromLayer } from "./connection/connection-layer";
export { fetchAndStoreRegionDistrictMappings, ensureRegionDistrictForSelection, ensureCropIdForSelection } from "./connection/connection-selection";
