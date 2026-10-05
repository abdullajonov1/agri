import type { JimuMapView } from "jimu-arcgis";
import type { AllWidgetProps, DataSource, React } from "jimu-core";
import type { ChartDim, ChartFilterFlags } from "../../../../gis/agri-chart-filter-order";
import type { ShownRegionYearLayer } from "../../../../gis/feature-layer-data";
import type { MapZoomRequest } from "../../../localization/map-zoom-policy";
import type { VHBarData } from "../../../localization/vh-constants";
import type { FilterState, GeoWidgetState, GraffSearchRecord } from "../widget";

/**
 * Widget members the extracted Localization modules read or call.
 * The widget instance is passed as the host.
 */
export interface LocalizationHost {
  props: AllWidgetProps<any>;
  state: GeoWidgetState;
  setState: React.Component<any, GeoWidgetState>["setState"];
  _isMounted: boolean;
  _notificationBodyRef: React.RefObject<HTMLDivElement>;
  _notificationLoadToken: number;
  _notificationPaintFrame: number;
  _notificationWidgetsReady: boolean;
  _notificationLoadStarted: boolean;
  _regionToViloyat: Record<string, string>;
  _graffSearchDebounceTimer: any;
  _graffAutoCompleteRequestId: number;
  _farmerMapUniqueIds: string[] | null;
  _farmerSearchApplying: boolean;
  _preFarmerSearchGeo: { viloyat: string; tuman: string } | null;
  _zoomRequestId: number;
  _originalLayerRenderers: Map<any, __esri.Renderer | null>;
  _cropRenderedLayers: Set<any>;
  _cropRendererRequestId: number;
  _cropDistinctValueCache: Map<string, string[]>;
  _suppressLegacyVhOnMap: boolean;
  _vhUniqueIdsCropScoped: boolean;
  _lastShownRegionYearLayers: ShownRegionYearLayer[];
  _regionYearSettleRepaintTimers: ReturnType<typeof setTimeout>[];
  getAdminBoundarySelection: () => {
    viloyat: string;
    tuman: string;
    regionCode?: number;
    districtCode?: number;
    districtNames?: string[];
    districtCodes?: number[];
  };
  getCropRendererTargetLayers: () => any[];
  cropDistinctCacheKey: (layer: any, field: string, where: string) => string;
  queryDistinctCropValues: (layer: any, field: string, where: string) => Promise<string[]>;
  buildCropUniqueValueInfosFromValues: (field: string, distinctValues: string[]) => any[];
  refreshCropLayer: (layer: any) => void;
  applyCropRenderer: (requestId: number) => Promise<void>;
  getLayerMatchStateForViloyat: (
    layer: __esri.FeatureLayer,
    effectiveViloyat: string,
  ) => "match" | "mismatch" | "unknown";
  clearRegionYearSettleRepaintTimers: () => void;
  repaintShownRegionYearLayers: (phase: string) => void;
  syncShownRegionYearLayers: (map: any) => ShownRegionYearLayer[];
  getEffectiveViloyat: () => string;
  broadcastFilterState: (opts?: { pendingOnly?: boolean }) => void;
  applyMapFiltersOptimized: (
    zoomRequest?: MapZoomRequest,
    isApplyCurrent?: () => boolean,
  ) => Promise<void>;
  fetchDataWithCurrentState: () => Promise<void>;
  emitGraffTableSearchChanged: (
    query: string,
    options?: { preserveSelection?: boolean },
  ) => void;
  emitGraffTableSearchClear: (options?: { preserveSelection?: boolean }) => void;
  getGraffDisplayFields: () => string[];
  buildGraffSearchTextWhere: (raw: string, layer?: __esri.FeatureLayer) => string;
  buildGraffSearchScopeWhere: () => string;
  runGraffAutoComplete: (term: string) => Promise<void>;
  clearFarmerSearchAndRestoreGeo: () => void;
  applyFarmerSearchSelection: (inn: string) => Promise<void>;
  fetchAndStoreRegionDistrictMappings: () => Promise<void>;
  beginNotificationPrefetch: () => void;
  loadNotificationFeed: () => Promise<void>;
  updateNotificationScrollHint: () => void;
  _vhMapUniqueIds: string[] | null;
  _ndviDateFieldMap: Record<string, string>;
  _viloyatToRegion: Record<string, number>;
  _tumanToDistrict: Record<string, number>;
  getSelectedTurlar: () => string[];
  findLayerFieldName: (layer: __esri.FeatureLayer, name: string) => string | null;
  getAposHelpers: () => {
    normalizeApos: (s: string) => string;
    makeRegionDistrictKey: (raw: string | null | undefined) => string;
    eqAposSmart: (field: string, value: string) => string;
  };
  normalizeApos: (s: string) => string;
  getGeoCodeHelpers: () => {
    normalizeApos: (s: string) => string;
    makeRegionDistrictKey: (raw: string | null | undefined) => string;
  };
  buildYearClauseForLayer: (layer: __esri.FeatureLayer) => string;
  buildTurlarClause: (field?: string, values?: string[]) => string;
  buildUniqueIdClause: (raw: string, layer?: __esri.FeatureLayer) => string;
  buildViloyatRegionClause: () => string;
  buildTumanDistrictClause: () => string;
  buildNdviSpatialWhere: (includeTuri?: boolean) => string;
  buildNdviStatusClauseForCurrentVh: () => string;
  buildNdviDateClauseWithoutVh: () => string;
  buildWhereClause: (
    includeVh?: boolean,
    includeTuri?: boolean,
    includeViloyat?: boolean,
    layer?: __esri.FeatureLayer,
  ) => string;
  _chartDimOrder: ChartDim[];
  _lastBroadcastDetail: any;
  _lastBroadcastDigest: string;
  _lastVhBarComputeKey: string;
  _ndviBucketToIds: Record<string, string[]>;
  _reuseVhBarDataOnNextBroadcast: boolean;
  _vhBarComputeInFlight: Map<string, Promise<VHBarData | null>>;
  _vhBarComputeMemo: Map<string, VHBarData>;
  _vhBarUsedDate: string | null;
  _vhBarUsedDateGeo: string | null;
  _vhRegionChartUniqueIds: string[] | null;
  _vhResolveGen: number;
  _vhUniqueIdCache: Record<string, string[]>;
  makeRegionDistrictKey: (raw: string | null | undefined) => string;
  makeVhBarDateGeoKey: () => string;
  getChartFilterFlags: (vh?: string, turlar?: string[]) => ChartFilterFlags;
  getCropIdsForVhUniqueIdScope: () => string[];
  resolveCropIdForTuri: (turi: string) => string | undefined;
  getGeoScopedVhBarUsedDate: () => string;
  setVhUniqueIdCacheEntry: (key: string, ids: string[]) => void;
  buildVhMapUniqueIdCacheKey: () => string | null;
  makeVhBarComputeKey: () => string;
  executeComputeVhBarData: () => Promise<VHBarData | null>;
  prefetchVhStatusUniqueIds: (ndviDate: string) => void;
  _allowClearOnce: boolean;
  _deferVhUniqueIdResolve: boolean;
  _districtZoomRequestId: number;
  _filterDataRequestId: number;
  _homeExtent: __esri.Extent | null;
  _lastHomeGoToAt: number;
  _mapSurfaceLoadingToken: number;
  _polygonAreaQueryCache: Map<string, Promise<Map<string, number>>>;
  _prevDefinitionExpression: string;
  _prevPolygonModeForZoomGuard: boolean;
  _vhUniqueIdsReadyForApply: boolean;
  setMapNoData: (noData: boolean, reason: string) => void;
  setMapSurfaceLoading: (loading: boolean, reason: string) => void;
  getLayerKey: (layer: __esri.FeatureLayer) => string;
  buildWhereForLayer: (
    layer: __esri.FeatureLayer,
    includeVh?: boolean,
    includeTuri?: boolean,
    forStats?: boolean,
  ) => string;
  applyInstantCropPaletteNoRefresh: () => void;
  syncCropRenderer: () => Promise<void>;
  setShownRegionYearOpacity: (opacity: number) => void;
  scheduleShownRegionYearSettleRepaint: (
    requestId: number,
    delayMs: number,
    phase: string,
  ) => void;
  waitForShownRegionYearRedraw: (refresh: boolean) => Promise<void>;
  applyFiltersPersistent: (
    isCurrent?: () => boolean,
    opts?: { vhDeferredSecondPass?: boolean },
  ) => Promise<void>;
  resolveVhMapUniqueIds: (isCurrent?: () => boolean) => Promise<string[] | null>;
  zoomToSelectedDistrict: (
    view: __esri.MapView | __esri.SceneView,
  ) => Promise<boolean>;
  resolveVhRegionChartUniqueIdsBackground: (
    resolveGen: number,
    params: {
      status: string;
      regionNum: number;
      cropIds: string[];
      ndviDate: string;
      vhCategory: string;
    },
    isCurrent?: () => boolean,
  ) => Promise<void>;
  _dataSourceInfoDebounceTimer: any;
  _dsOnlyRetryCount: number;
  _dsOnlyRetryTimer: ReturnType<typeof setTimeout> | null;
  _initialDataLoadPromise: Promise<void> | null;
  _layerToViloyatKeys: Record<string, string[]>;
  _mapClickHandle: __esri.Handle | null;
  _mapConnectionPromise: Promise<void> | null;
  _mapInteractionHandle: __esri.Handle | null;
  _primaryDataSourceId: string | null;
  _readyFired: boolean;
  _turiToCropId: Record<string, string>;
  _viloyatKeyToLayerKeys: Record<string, string[]>;
  initializationTimer: any;
  getMapWidgetId: () => string | null;
  getEffectiveUseDataSources: () => any[];
  getPortalSelf: (jimuMapView: JimuMapView) => Promise<{
    username: string | null;
    groups: Array<{ id: string; title: string }>;
    portalUrl: string;
  }>;
  resolveAllowedViloyats: (groups: Array<{ id: string; title: string }>) => string[];
  attachMapClickDispatcher: (jimuMapView: JimuMapView) => void;
  initializeMapConnection: (jimuMapView: JimuMapView) => Promise<void>;
  initializeMapConnectionOnce: (jimuMapView: JimuMapView) => Promise<void>;
  initializeDataSourceOnlyConnection: (failureMessage?: string) => Promise<void>;
  finalizeConnection: (
    featureLayers: __esri.FeatureLayer[],
    jimuMapView: JimuMapView | null,
  ) => Promise<void>;
  resolveFeatureLayerFromOneUseDataSource: (
    useDs: any,
    jimuMapView: JimuMapView | null,
  ) => Promise<__esri.FeatureLayer | null>;
  resolveSpatialMapLayers: (jimuMapView: JimuMapView | null) => Promise<__esri.FeatureLayer[]>;
  resolveFeatureLayersFromUseDataSources: (
    jimuMapView: JimuMapView | null,
  ) => Promise<__esri.FeatureLayer[]>;
  buildLayerViloyatIndex: () => Promise<void>;
  eqAposSmart: (field: string, raw: string) => string;
  getUniqueValues: (fieldName: string) => Promise<string[]>;
  flDistinctFromLayer: (
    layer: __esri.FeatureLayer,
    fieldName: string,
    where: string,
  ) => Promise<string[]>;
  fetchFilterOptions: () => Promise<void>;
  runInitialDataLoad: () => Promise<void>;
  resolveThemeState: () => boolean;
  applyThemeToDom: (isDarkTheme: boolean) => void;
  retryMapConnection: () => void;
  _normId: (s?: string) => string;
  onNotificationsMenuOpened: () => void;
  _lastGeographySelectionTs: number;
  _lastVhBarData: VHBarData | null;
  _geographyApplyId: number;
  _broadcastGeneration: number;
  normalizeTurlar: (raw: unknown, fallback?: string) => string[];
  syncChartDimOrder: (nextVh: string, nextTurlar: string[], resetGeography: boolean) => void;
  clearPolygonFilterGuards: () => void;
  schedulePolygonFilterGuards: () => void;
  _polygonFilterGuardTimers: ReturnType<typeof setTimeout>[];
  reassertPolygonGeographyFilter: (phase: string) => void;
  ensureRegionDistrictForSelection: () => Promise<void>;
  ensureCropIdForSelection: () => Promise<void>;
  isVhMapUniqueIdCacheWarm: () => boolean;
  warmYearRegionMapImages: () => void;
  getLatestNdviDateForBar: (primaryLayer?: __esri.FeatureLayer) => string | null;
  computeVhBarData: () => Promise<VHBarData | null>;
  hydrateNotificationCache: () => void;
  _unbindNotificationPack: (() => void) | null;
  onDashboardPackForNotifications: (pack: { phase?: string; filter?: { yil?: string } }) => void;
  initializeTheme: () => void;
  handleDocumentClick: (event: MouseEvent) => void;
  _onReset: () => void;
  handleWidgetSelection: (event: Event) => Promise<void>;
  handlePolygonMapClickPhase: (event: Event) => void;
  handleRequestMasterFilterState: () => void;
  ensureInitialization: () => void;
  _retryTimeout: any;
  MAX_CONNECTION_ATTEMPTS: number;
  onDataSourceCreated: (ds: DataSource) => void;
  onDataSourceInfoChange: (info: any) => void;
  onActiveViewChange: (jimuMapView: JimuMapView) => void;
  _graffSearchWrapRef: React.RefObject<HTMLDivElement>;
  _notificationsToolbarItemRef: React.RefObject<HTMLDivElement>;
  _indexInfoToolbarItemRef: React.RefObject<HTMLDivElement>;
  _yilToolbarItemRef: React.RefObject<HTMLDivElement>;
  _languageToolbarItemRef: React.RefObject<HTMLDivElement>;
  handleGraffSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGraffSearchFocus: () => void;
  handleGraffSearchClear: () => void;
  handleGraffSearchRowClick: (record: GraffSearchRecord) => void;
  toggleToolbarMenu: (menu: "yil" | "language" | "indexInfo" | "notifications") => void;
  applyThemeByValue: (value: "light" | "dark") => void;
  toggleProfileMenu: () => void;
  closeProfileMenu: () => void;
  handleLogout: () => void;
  applyYil: (selectedYil: string) => void;
  applyLanguage: (lang: FilterState["language"]) => void;
  openIndexInfoDetail: (key: string) => void;
  closeIndexInfoMenu: () => void;
  onNotificationBodyScroll: () => void;
  formatNotificationDate: (ymd: string) => string;
  formatFieldCount: (value: number) => string;
  resolveRegionNotificationName: (regionCode: string) => string;
}
