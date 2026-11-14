import type { LocalizationHost } from "../host";

// Narrow slices of LocalizationHost per Shell service (type-only; callers still pass the full host).

export type BroadcastHost = Pick<
  LocalizationHost,
  "_broadcastGeneration" |
  "_chartDimOrder" |
  "_isMounted" |
  "_lastBroadcastDetail" |
  "_lastBroadcastDigest" |
  "_lastVhBarData" |
  "_lastVhBarDataKey" |
  "_reuseVhBarDataOnNextBroadcast" |
  "_vhBarComputeMemo" |
  "_vhMapUniqueIds" |
  "_vhRegionChartUniqueIds" |
  "buildWhereClause" |
  "computeVhBarData" |
  "getChartFilterFlags" |
  "getGeoScopedVhBarUsedDate" |
  "getLatestNdviDateForBar" |
  "makeVhBarComputeKey" |
  "normalizeTurlar" |
  "props" |
  "state"
>;

export type LifecycleHost = Pick<
  LocalizationHost,
  "MAX_CONNECTION_ATTEMPTS" |
  "_allowClearOnce" |
  "_dataSourceInfoDebounceTimer" |
  "_dsOnlyRetryTimer" |
  "_farmerMapUniqueIds" |
  "_graffSearchDebounceTimer" |
  "_isMounted" |
  "_mapClickHandle" |
  "_mapInteractionHandle" |
  "_notificationPaintFrame" |
  "_onReset" |
  "_preFarmerSearchGeo" |
  "_retryTimeout" |
  "_unbindLandOverlay" |
  "_unbindNotificationPack" |
  "_viewReadyWatchHandle" |
  "_zoomRequestId" |
  "applyMapFiltersOptimized" |
  "broadcastFilterState" |
  "clearPolygonFilterGuards" |
  "clearRegionYearSettleRepaintTimers" |
  "emitGraffTableSearchClear" |
  "ensureInitialization" |
  "fetchDataWithCurrentState" |
  "handleDocumentClick" |
  "handlePolygonMapClickPhase" |
  "handleRequestMasterFilterState" |
  "handleWidgetSelection" |
  "hydrateNotificationCache" |
  "initializationTimer" |
  "initializeTheme" |
  "onDashboardPackForNotifications" |
  "props" |
  "repaintShownRegionYearLayers" |
  "setState" |
  "state" |
  "updateNotificationScrollHint"
>;

export type PanelHandlersHost = Pick<
  LocalizationHost,
  "_chartDimOrder" |
  "_isMounted" |
  "_lastShownRegionYearLayers" |
  "_ndviBucketToIds" |
  "_normId" |
  "_tumanToDistrict" |
  "_viloyatKeyToLayerKeys" |
  "_viloyatToRegion" |
  "applyMapFiltersOptimized" |
  "broadcastFilterState" |
  "fetchDataWithCurrentState" |
  "getChartFilterFlags" |
  "getEffectiveViloyat" |
  "getGeoCodeHelpers" |
  "getLayerKey" |
  "makeRegionDistrictKey" |
  "normalizeApos" |
  "onNotificationsMenuOpened" |
  "retryMapConnection" |
  "runInitialDataLoad" |
  "setState" |
  "state" |
  "syncShownRegionYearLayers" |
  "warmYearRegionMapImages"
>;

export type PanelHelpersHost = Pick<
  LocalizationHost,
  "_chartDimOrder" |
  "_isMounted" |
  "_lastBroadcastDetail" |
  "_polygonFilterGuardTimers" |
  "_turiToCropId" |
  "clearPolygonFilterGuards" |
  "eqAposSmart" |
  "getChartFilterFlags" |
  "getSelectedTurlar" |
  "makeRegionDistrictKey" |
  "normalizeApos" |
  "props" |
  "reassertPolygonGeographyFilter" |
  "resolveCropIdForTuri" |
  "state"
>;

export type SelectionApplyHost = Pick<
  LocalizationHost,
  "_deferVhUniqueIdResolve" |
  "_isMounted" |
  "_mapSurfaceLoadingToken" |
  "_reuseVhBarDataOnNextBroadcast" |
  "_suppressLegacyVhOnMap" |
  "_tumanToDistrict" |
  "_vhMapUniqueIds" |
  "_vhRegionChartUniqueIds" |
  "_vhUniqueIdsCropScoped" |
  "_vhUniqueIdsReadyForApply" |
  "_viloyatToRegion" |
  "applyMapFiltersOptimized" |
  "broadcastFilterState" |
  "ensureCropIdForSelection" |
  "ensureRegionDistrictForSelection" |
  "fetchDataWithCurrentState" |
  "getEffectiveViloyat" |
  "getGeoCodeHelpers" |
  "getSelectedTurlar" |
  "isVhMapUniqueIdCacheWarm" |
  "makeRegionDistrictKey" |
  "resolveVhMapUniqueIds" |
  "setMapSurfaceLoading" |
  "setState" |
  "state"
>;

export type SelectionServiceHost = Pick<
  LocalizationHost,
  "_broadcastGeneration" |
  "_chartDimOrder" |
  "_geographyApplyId" |
  "_isMounted" |
  "_lastGeographySelectionTs" |
  "_mapSurfaceLoadingToken" |
  "broadcastFilterState" |
  "clearPolygonFilterGuards" |
  "getChartFilterFlags" |
  "setMapSurfaceLoading" |
  "setState" |
  "state"
> &
  SelectionStepsHost &
  SelectionApplyHost;

export type SelectionStepsHost = Pick<
  LocalizationHost,
  "_farmerMapUniqueIds" |
  "_farmerSearchApplying" |
  "_graffSearchDebounceTimer" |
  "_lastVhBarData" |
  "_ndviBucketToIds" |
  "_preFarmerSearchGeo" |
  "_reuseVhBarDataOnNextBroadcast" |
  "_vhBarUsedDate" |
  "_vhBarUsedDateGeo" |
  "_vhMapUniqueIds" |
  "_vhRegionChartUniqueIds" |
  "_vhUniqueIdCache" |
  "_vhUniqueIdsCropScoped" |
  "_vhUniqueIdsReadyForApply" |
  "broadcastFilterState" |
  "emitGraffTableSearchClear" |
  "getChartFilterFlags" |
  "getSelectedTurlar" |
  "normalizeApos" |
  "normalizeTurlar" |
  "schedulePolygonFilterGuards" |
  "state" |
  "syncChartDimOrder"
>;

export type RenderPanelHost = Pick<
  LocalizationHost,
  "_graffSearchWrapRef" |
  "_indexInfoToolbarItemRef" |
  "_languageToolbarItemRef" |
  "_notificationBodyRef" |
  "_notificationsToolbarItemRef" |
  "_yilToolbarItemRef" |
  "applyLanguage" |
  "applyThemeByValue" |
  "applyYil" |
  "closeIndexInfoMenu" |
  "closeProfileMenu" |
  "formatFieldCount" |
  "formatNotificationDate" |
  "getEffectiveUseDataSources" |
  "getEffectiveViloyat" |
  "handleExportReport" |
  "handleGraffSearchClear" |
  "handleGraffSearchFocus" |
  "handleGraffSearchInputChange" |
  "handleGraffSearchRowClick" |
  "handleLogout" |
  "onActiveViewChange" |
  "onDataSourceCreated" |
  "onDataSourceInfoChange" |
  "onNotificationBodyScroll" |
  "openIndexInfoDetail" |
  "props" |
  "resolveRegionNotificationName" |
  "retryMapConnection" |
  "state" |
  "toggleProfileMenu" |
  "toggleToolbarMenu"
>;
