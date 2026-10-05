import { JimuMapView } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSource,
  React,
  type IMState,
} from "jimu-core";
import "./AgriFilter.css";
import { type ShownRegionYearLayer } from "../../../gis/feature-layer-data";
import { logoutFromAccount } from "../../../shared/agri-logout";
import {
  buildTurlarSqlClause,
  getTuriCropLookupKey,
} from "../../../shared/agri-crop-labels";
import { MAX_MAP_CONNECTION_ATTEMPTS } from "../../../shared/map-connection-service";
import {
  type ChartDim,
  type ChartFilterFlags,
} from "../../../gis/agri-chart-filter-order";
import {
  type VHBarData,
  type VHBarDataItem,
} from "../../localization/vh-constants";
import {
  makeRegionDistrictKey as makeRegionDistrictKeyShared,
  normalizeLocalizationApos,
} from "../../localization/geo-keys";
import { normalizeTurlarList } from "../../localization/broadcast-detail";
import { getFeatureLayerKey } from "../../localization/layer-utils";
import {
  type MapZoomMode,
  type MapZoomReason,
  type MapZoomRequest,
} from "../../localization/map-zoom-policy";
import { normalizeConnectionId } from "../../localization/connection-ids";
import type { LocalizationHost } from "./components/host";
import { agriLog, debugCatch } from "./components/localization-log";
import {
  buildNdviDateClauseWithoutVh,
  buildNdviSpatialWhere,
  buildNdviStatusClauseForCurrentVh,
  buildTumanDistrictClause,
  buildUniqueIdClause,
  buildViloyatRegionClause,
  buildWhereClause,
} from "./components/Filters/where-builders";
import {
  beginNotificationPrefetch,
  formatFieldCount,
  formatNotificationDate,
  hydrateNotificationCache,
  loadNotificationFeed,
  onDashboardPackForNotifications,
  onNotificationsMenuOpened,
  resolveRegionNotificationName,
  updateNotificationScrollHint,
} from "./components/Toolbar/notifications-service";
import {
  applyFarmerSearchSelection,
  buildGraffSearchScopeWhere,
  buildGraffSearchTextWhere,
  clearFarmerSearchAndRestoreGeo,
  emitGraffTableRowSelected,
  emitGraffTableSearchChanged,
  emitGraffTableSearchClear,
  formatGraffSearchCellValue,
  getGraffDisplayFields,
  getGraffSearchFieldLabel,
  handleGraffSearchClear,
  handleGraffSearchFocus,
  handleGraffSearchInputChange,
  handleGraffSearchRowClick,
  runGraffAutoComplete,
} from "./components/GraffSearch/graff-search-service";
import {
  applyCropRenderer,
  applyInstantCropPaletteNoRefresh,
  getCropRendererTargetLayers,
  queryDistinctCropValues,
  refreshCropLayer,
  resetCropRenderer,
  syncCropRenderer,
} from "./components/Map/crop-renderer-service";
import {
  buildWhereForLayer,
  clearRegionYearSettleRepaintTimers,
  repaintShownRegionYearLayers,
  scheduleShownRegionYearSettleRepaint,
  setShownRegionYearOpacity,
  syncShownRegionYearLayers,
  waitForShownRegionYearRedraw,
  warmYearRegionMapImages,
} from "./components/Map/region-year-layers";
import {
  buildVhMapUniqueIdCacheKey,
  computeVhBarData,
  executeComputeVhBarData,
  getGeoScopedVhBarUsedDate,
  getLatestNdviDateForBar,
  isVhMapUniqueIdCacheWarm,
  loadNdviBucketIds,
  makeVhBarComputeKey,
  prefetchVhStatusUniqueIds,
  publishVhBarPartial,
  resolveVhMapUniqueIds,
  resolveVhRegionChartUniqueIdsBackground,
  setVhUniqueIdCacheEntry,
} from "./components/VhBar/vh-bar-service";
import {
  applyFiltersPersistent,
  applyMapFiltersOptimized,
  buildTableWhereWithRegion,
  fetchDataWithCurrentState,
  getPolygonAreasWithCurrentFilter,
  setMapNoData,
  zoomToSelectedDistrict,
} from "./components/Map/map-filter-service";
import {
  attachMapClickDispatcher,
  buildLayerViloyatIndex,
  detectNdviStatusDateFieldsFromLayer,
  ensureCropIdForSelection,
  ensureRegionDistrictForSelection,
  fetchAndStoreRegionDistrictMappings,
  fetchFilterOptions,
  finalizeConnection,
  flDistinctFromLayer,
  getEffectiveUseDataSources,
  getPortalSelf,
  getUniqueValues,
  initializeDataSourceOnlyConnection,
  initializeMapConnection,
  initializeMapConnectionOnce,
  onActiveViewChange,
  onDataSourceCreated,
  onDataSourceInfoChange,
  reassertPolygonGeographyFilter,
  resolveFeatureLayerFromOneUseDataSource,
  resolveFeatureLayersFromUseDataSources,
  resolveSpatialMapLayers,
  retryMapConnection,
  runInitialDataLoad,
} from "./components/Connection/connection-service";
import {
  resolveThemeState,
  initializeTheme,
  applyThemeToDom,
  handleThemeChange,
  handleDocumentClick,
  applyThemeByValue,
} from "./components/Theme/theme-service";
import {
  getAdminBoundarySelection,
  setMapSurfaceLoading,
  getLayerMatchStateForViloyat,
  handlePolygonMapClickPhase,
  ensureInitialization,
  resolveGroupScope,
  resolveAllowedViloyats,
  toggleToolbarMenu,
  handleYilChange,
  applyLanguage,
  applyYil,
  handleNdviDateChange,
  syncChartDimOrder,
} from "./components/Shell/panel-handlers";
import {
  handleWidgetSelection,
} from "./components/Shell/selection-service";
import {
  broadcastFilterState,
} from "./components/Shell/broadcast-service";
import {
  componentDidMount,
  componentWillUnmount,
  componentDidUpdate,
} from "./components/Shell/lifecycle-service";
import {
  render,
} from "./components/Shell/render-panel";
import { createInitialGeoState } from "./components/Shell/initial-state";
import type { FilterState, GeoWidgetState, GraffSearchRecord } from "./widget-state";
import {
  getEffectiveViloyat,
  findLayerFieldName,
  cropDistinctCacheKey,
  buildCropUniqueValueInfosFromValues,
  buildYearClauseForLayer,
  handleRequestMasterFilterState,
  getMapWidgetId,
  schedulePolygonFilterGuards,
  eqAposSmart,
  getAposHelpers,
  getChartFilterFlags,
  getCropIdsForVhUniqueIdScope,
  buildTableDateWhere,
  getGeoCodeHelpers,
  makeVhBarDateGeoKey,
} from "./components/Shell/panel-helpers";








export type { VHBarData, VHBarDataItem };
export type { FilterState, GeoWidgetState, GraffSearchRecord };

export default class AgriLocalization extends React.PureComponent<
  AllWidgetProps<any>,
  GeoWidgetState
> {
  private _prevDefinitionExpression = "";
  /**
   * Previous polygonMode observed in applyMapFiltersOptimized. Used only to
   * skip a bare non-geography zoom pass that coincides with popup close
   * (AgriPopup restores the pre-field extent). Geography zooms (region /
   * district / Back) always run even when the same setState cleared
   * polygonMode.
   */
  private _prevPolygonModeForZoomGuard = false;
  private _mapUpdateScheduled = false;
  private _onReset: () => void;
  private initializationTimer: any;
  private _retryTimeout: any;
  private _graffSearchDebounceTimer: any = null;
  private _dataSourceInfoDebounceTimer: any = null;
  private _isMounted = false;
  private _mapClickHandle: __esri.Handle | null = null;
  private _mapInteractionHandle: __esri.Handle | null = null;
  /** Re-checks MapImage visibility/DE after popup identify + goTo settle. */
  private _polygonFilterGuardTimers: ReturnType<typeof setTimeout>[] = [];
  /**
   * After geography goTo, MapImage export is often aborted mid-flight — fields
   * stay blank until a manual zoom. These timers reassert DE + refresh once
   * the view has settled.
   */
  private _regionYearSettleRepaintTimers: ReturnType<typeof setTimeout>[] = [];
  private _zoomRequestId = 0;
  private _districtZoomRequestId = 0;
  /** Only the newest filter-data request may finish the global loading state. */
  private _filterDataRequestId = 0;
  /** Only the newest graff autocomplete query may apply results. */
  private _graffAutoCompleteRequestId = 0;
  /**
   * Only the newest geography apply pipeline may finish map sync + broadcast.
   * Without this, a slow Quva apply can broadcast after Back already cleared
   * tuman, briefly re-scoping Indicators/Graff to the old district.
   */
  private _geographyApplyId = 0;
  private _readyFired = false;
  /** Coalesces map/data-source/fallback startup into one network pipeline. */
  private _initialDataLoadPromise: Promise<void> | null = null;
  /** Prevents MapView ready callbacks from resolving the same layers twice. */
  private _mapConnectionPromise: Promise<void> | null = null;
  /** Last fully emitted filter payload; identical broadcasts are skipped. */
  private _lastBroadcastDigest = '';
  /** Cached detail for late subscribers (indicators mount after first broadcast). */
  private _lastBroadcastDetail: any = null;
  /**
   * Invalidates in-flight computeVhBarData → masterFilterChanged sends.
   * A slow VH query for Dang'ara must not overwrite a newer Sirdaryo broadcast.
   */
  private _broadcastGeneration = 0;
  /** Newest geography selection timestamp from widgetSelectionChanged. */
  private _lastGeographySelectionTs = 0;
  private _homeExtent: __esri.Extent | null = null;
  // Prevent repeated "home" goTo calls during rapid filter clearing.
  private _lastHomeGoToAt = 0;
  // Set by syncRegionYearLayerVisibility() each time filters change — the
  // region+year layer(s) actually shown, with live sublayer refs, so the
  // zoom step can query their real (tuman-aware) extent instead of the
  // whole region's fullExtent.
  private _lastShownRegionYearLayers: ShownRegionYearLayer[] = [];
  private _graffSearchWrapRef = React.createRef<HTMLDivElement>();
  private _yilToolbarItemRef = React.createRef<HTMLDivElement>();
  private _languageToolbarItemRef = React.createRef<HTMLDivElement>();
  private _indexInfoToolbarItemRef = React.createRef<HTMLDivElement>();
  private _notificationsToolbarItemRef = React.createRef<HTMLDivElement>();
  private _notificationBodyRef = React.createRef<HTMLDivElement>();
  private _notificationLoadToken = 0;
  private _unbindNotificationPack: (() => void) | null = null;
  private _notificationPaintFrame = 0;
  /** Widgets have reached a year-scoped pack; notification queries may start. */
  private _notificationWidgetsReady = false;
  /** Feed was filled from cache or a request was started. */
  private _notificationLoadStarted = false;

  private _originalLayerRenderers = new Map<any, __esri.Renderer | null>();
  private _cropRenderedLayers = new Set<any>();
  private _cropRendererRequestId = 0;
  private _cropRendererAutoEnabled = false;
  /** Cache distinct crop values per layer URL+field+where — avoids re-querying
   * the same shown region/year sublayer on every filter tick. */
  private _cropDistinctValueCache = new Map<string, string[]>();

  /** Cache of NDVI bucket → polygon join IDs (uniqueid) for current yil/viloyat. */
  private _ndviBucketToIds: Record<string, string[]> = {};

  /**
   * Uniqueids for the current Vegetatsiya Holati (AgriBar) selection, resolved
   * from agri_vegetation_indices.ndvi_status. null = no VH filter active.
   * Scoped to the selected tuman when one is set — used for map DE only.
   */
  private _vhMapUniqueIds: string[] | null = null;
  /**
   * Same VH(+crop) uniqueids at viloyat/region scope (no district). Used by
   * AgriRegion "Tumanlar kesimida" so selecting a tuman + VH still shows every
   * district's bar, not only the focused tuman.
   */
  private _vhRegionChartUniqueIds: string[] | null = null;
  /**
   * Uniqueids for the header STIR (`selectedFarmerInn`) selection — scopes
   * MapImage + VH bar the same way VH uniqueids do.
   */
  private _farmerMapUniqueIds: string[] | null = null;
  /** True while applying a header STIR selection (skip geo-echo search clear). */
  private _farmerSearchApplying = false;
  /**
   * Geography before a committed STIR selection — restored when search is
   * cleared (X) so republic / viloyat / tuman return to the prior scope.
   */
  private _preFarmerSearchGeo: { viloyat: string; tuman: string } | null = null;
  /** Bumps on every VH resolve so stale async pages never write the map. */
  private _vhResolveGen = 0;
  /** True after VH-only path already resolved uniqueids for this apply. */
  private _vhUniqueIdsReadyForApply = false;
  /**
   * When true, applyFiltersPersistent skips await resolveVhMapUniqueIds so
   * crop/tuman map DE can apply immediately. Uniqueids are resolved after
   * map paint when a VH status is still active (see applyMapFiltersOptimized).
   */
  private _deferVhUniqueIdResolve = false;
  /**
   * While deferred VH uniqueids reload, never fall back to the polygon `vh`
   * attribute filter (it does not store bar categories like "4-Past" and
   * blanks the MapImage). Geography + turi stay visible until ids arrive.
   */
  private _suppressLegacyVhOnMap = false;
  /**
   * Cache: status|date|region|district|crops → uniqueids.
   * The key carries the full query scope, so entries stay valid across
   * viloyat/tuman switches — going back to a previous geography must not
   * re-page the whole uniqueid list. Bounded instead of cleared.
   */
  private _vhUniqueIdCache: Record<string, string[]> = {};
  /** Last successful VH bar payload — reused on VH-only selection toggles. */
  private _lastVhBarData: VHBarData | null = null;
  /**
   * Single-flight + memo for computeVhBarData. Identical year/geo/crop keys
   * share one in-flight promise so startup broadcast storms do not fan out
   * duplicate republic VH query batches.
   */
  private _vhBarComputeInFlight = new Map<string, Promise<VHBarData | null>>();
  private _vhBarComputeMemo = new Map<string, VHBarData>();
  private _lastVhBarComputeKey = "";
  /** Canonical uniqueid → maydon maps cached by yil/geography/crop WHERE. */
  private _polygonAreaQueryCache = new Map<
    string,
    Promise<Map<string, number>>
  >();
  /** Skip recomputing VH bar counts when only the selected category changes. */
  private _reuseVhBarDataOnNextBroadcast = false;
  /**
   * Order in which Pie (turi) vs VH (vh) were first selected. Drives which
   * widget chart is scoped by the other; map always applies both when set.
   */
  private _chartDimOrder: ChartDim[] = [];
  /**
   * True when `_vhMapUniqueIds` were resolved with vegetation `crop_id`
   * (crop selected before VH). False when VH-first / crop_id fallback — map
   * must AND MapImage `turi` text with the status-wide uniqueids.
   */
  private _vhUniqueIdsCropScoped = false;

  /** Mapping of logical NDVI date (e.g. '2025-06-12') → polygon status field name (e.g. 'status_2025_06_12'). */
  private _ndviDateFieldMap: Record<string, string> = {};

  /** Viloyat name → region number (from layer attribute `region`). Used to filter by code instead of name. */
  private _viloyatToRegion: Record<string, number> = {};
  /** Region number → viloyat display name (from Agri_table_data). Used by notifications. */
  private _regionToViloyat: Record<string, string> = {};
  /** Tuman name → district number (from layer attribute `district`). Used to filter by code instead of name. */
  private _tumanToDistrict: Record<string, number> = {};
  /**
   * Crop type name (turi) → crop_id. agri_vegetation_indices (the source
   * behind the VH "Vegetatsiya Holati" bar, computed in computeVhBarData())
   * has no human-readable turi field, only crop_id — Agri_table_data has
   * both, so this is resolved the same way region/district are.
   */
  private _turiToCropId: Record<string, string> = {};
  /**
   * NDVI date that computeVhBarData actually used (first date with rows).
   * resolveVhMapUniqueIds must reuse this — taking "latest available" alone
   * often yields 0 uniqueids while the VH chart still shows data.
   */
  private _vhBarUsedDate: string | null = null;
  /**
   * Geography (`viloyat|tuman`) the bar date above was proved on. Available
   * NDVI dates differ per viloyat, so the date may only be trusted as-is for
   * the same scope; elsewhere it is just the first candidate to probe.
   */
  private _vhBarUsedDateGeo: string | null = null;
  /** Layer identity -> normalized viloyat keys found in that layer. */
  private _layerToViloyatKeys: Record<string, string[]> = {};
  /** Normalized viloyat key -> layer identities that contain that viloyat. */
  private _viloyatKeyToLayerKeys: Record<string, string[]> = {};

  // Canonicalize keys used for viloyat/tuman → region/district dictionaries
  private makeRegionDistrictKey(raw: string | null | undefined): string {
    return makeRegionDistrictKeyShared(raw);
  }

  private resolveCropIdForTuri = (turi: string): string | undefined => {
    const key = getTuriCropLookupKey(turi);
    return key ? this._turiToCropId[key] : undefined;
  };

  private getLayerKey(layer: __esri.FeatureLayer): string {
    return getFeatureLayerKey(layer);
  }

  private getEffectiveViloyat(): string {
    return getEffectiveViloyat(this as unknown as LocalizationHost);
  }

  private getAdminBoundarySelection(): {
    viloyat: string;
    tuman: string;
    regionCode?: number;
    districtCode?: number;
    districtNames?: string[];
    districtCodes?: number[];
  } {
    return getAdminBoundarySelection(this as unknown as LocalizationHost);
  }

  private findLayerFieldName(
    layer: __esri.FeatureLayer,
    name: string,
  ): string | null {
    return findLayerFieldName(this as unknown as LocalizationHost, layer, name);
  }

  private getCropRendererTargetLayers = (): any[] =>
    getCropRendererTargetLayers(this as unknown as LocalizationHost);

  private cropDistinctCacheKey = (
    layer: any,
    field: string,
    where: string,
  ): string =>
    cropDistinctCacheKey(this as unknown as LocalizationHost, layer, field, where);

  private queryDistinctCropValues = (layer: any, field: string, where: string): Promise<string[]> =>
    queryDistinctCropValues(this as unknown as LocalizationHost, layer, field, where);

  private buildCropUniqueValueInfosFromValues = (
    field: string,
    distinctValues: string[],
  ): any[] =>
    buildCropUniqueValueInfosFromValues(this as unknown as LocalizationHost, field, distinctValues);

  private refreshCropLayer = (layer: any): void =>
    refreshCropLayer(this as unknown as LocalizationHost, layer);

  private resetCropRenderer = (): void =>
    resetCropRenderer(this as unknown as LocalizationHost);

  private applyCropRenderer = (requestId: number): Promise<void> =>
    applyCropRenderer(this as unknown as LocalizationHost, requestId);

  private syncCropRenderer = (): Promise<void> =>
    syncCropRenderer(this as unknown as LocalizationHost);

  private applyInstantCropPaletteNoRefresh = (): void =>
    applyInstantCropPaletteNoRefresh(this as unknown as LocalizationHost);

  private warmYearRegionMapImages = (): void =>
    warmYearRegionMapImages(this as unknown as LocalizationHost);

  private setShownRegionYearOpacity = (opacity: number): void =>
    setShownRegionYearOpacity(this as unknown as LocalizationHost, opacity);

  /** Monotonic token so a stale apply cannot clear a newer map overlay. */
  private _mapSurfaceLoadingToken = 0;

  private setMapSurfaceLoading = (loading: boolean, reason: string): void => {
    return setMapSurfaceLoading(this as unknown as LocalizationHost, loading, reason);
  };

  private setMapNoData = (noData: boolean, reason: string): void =>
    setMapNoData(this as unknown as LocalizationHost, noData, reason);

  private clearRegionYearSettleRepaintTimers = (): void =>
    clearRegionYearSettleRepaintTimers(this as unknown as LocalizationHost);

  private repaintShownRegionYearLayers = (phase: string): void =>
    repaintShownRegionYearLayers(this as unknown as LocalizationHost, phase);

  private scheduleShownRegionYearSettleRepaint = (requestId: number, delayMs: number, phase: string): void =>
    scheduleShownRegionYearSettleRepaint(this as unknown as LocalizationHost, requestId, delayMs, phase);

  private waitForShownRegionYearRedraw = (refresh = true): Promise<void> =>
    waitForShownRegionYearRedraw(this as unknown as LocalizationHost, refresh);

  private getLayerMatchStateForViloyat(
    layer: __esri.FeatureLayer,
    effectiveViloyat: string,
  ): "match" | "mismatch" | "unknown" {
    return getLayerMatchStateForViloyat(this as unknown as LocalizationHost, layer, effectiveViloyat);
  }

  private buildWhereForLayer(
    layer: __esri.FeatureLayer,
    includeVh = false,
    includeTuri = true,
    forStats = false,
  ): string {
    return buildWhereForLayer(
      this as unknown as LocalizationHost,
      layer,
      includeVh,
      includeTuri,
      forStats,
    );
  }

  private buildYearClauseForLayer(layer: __esri.FeatureLayer): string {
    return buildYearClauseForLayer(this as unknown as LocalizationHost, layer);
  }

  private _allowClearOnce = false;
  private _primaryDataSourceId: string | null = null;
  private _dsOnlyRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private _dsOnlyRetryCount = 0;
  private _normId = (s?: string) => normalizeConnectionId(s);

  private normalizeApos = (s: string) => normalizeLocalizationApos(s);

  MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;

  constructor(props: AllWidgetProps<any>) {
    super(props);
    this.state = createInitialGeoState();
  }

  /* ---------------------- Lifecycle ---------------------- */
  componentDidMount() {
    return componentDidMount(this as unknown as LocalizationHost);
  }

  componentWillUnmount() {
    return componentWillUnmount(this as unknown as LocalizationHost);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<any>,
    prevState: GeoWidgetState,
  ) {
    return componentDidUpdate(this as unknown as LocalizationHost, prevProps, prevState);
  }

  /* ---------------------- Widget Selection Handler (SINGLE ENTRY POINT) ---------------------- */

  private handleWidgetSelection = async (event: Event) => {
    return handleWidgetSelection(this as unknown as LocalizationHost, event);
  };

  /* ---------------------- Broadcast Current State ---------------------- */

  private handleRequestMasterFilterState = (): void => {
    return handleRequestMasterFilterState(this as unknown as LocalizationHost);
  };

  private broadcastFilterState = (opts?: { pendingOnly?: boolean }) => {
    return broadcastFilterState(this as unknown as LocalizationHost, opts);
  };

  private getPortalSelf = (jimuMapView: JimuMapView): Promise<{
    username: string | null;
    groups: Array<{ id: string; title: string }>;
    portalUrl: string;
  }> =>
    getPortalSelf(this as unknown as LocalizationHost, jimuMapView);

  private resolveGroupScope = (
    groups: Array<{ id: string; title: string }>,
  ): { viewItemId: string; viloyat: string } | null => {
    return resolveGroupScope(this as unknown as LocalizationHost, groups);
  };

  private resolveAllowedViloyats = (
    groups: Array<{ id: string; title: string }>,
  ): string[] => {
    return resolveAllowedViloyats(this as unknown as LocalizationHost, groups);
  };

  private getEffectiveUseDataSources(): any[] {
    return getEffectiveUseDataSources(this as unknown as LocalizationHost);
  }

  private getMapWidgetId(): string | null {
    return getMapWidgetId(this as unknown as LocalizationHost);
  }

  private attachMapClickDispatcher = (jimuMapView: JimuMapView): void =>
    attachMapClickDispatcher(this as unknown as LocalizationHost, jimuMapView);

  onActiveViewChange = (jimuMapView: JimuMapView) =>
    onActiveViewChange(this as unknown as LocalizationHost, jimuMapView);

  private static agriLog(
    phase: string,
    detail?: Record<string, unknown>,
  ): void {
    agriLog(phase, detail);
  }

  private static debugCatch(phase: string, err: unknown): void {
    debugCatch(phase, err);
  }

  private initializeMapConnection = (jimuMapView: JimuMapView): Promise<void> =>
    initializeMapConnection(this as unknown as LocalizationHost, jimuMapView);

  /**
   * Portal MapImageLayer identify/goTo can finish after the polygon event and
   * restore a stale visible-sublayer snapshot. Re-assert the current
   * year/region/district filter after each async phase settles. The shared
   * sync helper does not reassign an identical definitionExpression, so the
   * normal path causes no extra export; it only repairs a layer that drifted.
   */
  private clearPolygonFilterGuards = (): void => {
    this._polygonFilterGuardTimers.forEach((timer) => clearTimeout(timer));
    this._polygonFilterGuardTimers = [];
  };

  private reassertPolygonGeographyFilter = (phase: string): void =>
    reassertPolygonGeographyFilter(this as unknown as LocalizationHost, phase);

  private handlePolygonMapClickPhase = (event: Event): void => {
    return handlePolygonMapClickPhase(this as unknown as LocalizationHost, event);
  };

  private schedulePolygonFilterGuards = (): void => {
    return schedulePolygonFilterGuards(this as unknown as LocalizationHost);
  };

  private initializeMapConnectionOnce = (jimuMapView: JimuMapView) =>
    initializeMapConnectionOnce(this as unknown as LocalizationHost, jimuMapView);

  private initializeDataSourceOnlyConnection = (failureMessage = "Could not resolve a queryable layer for the selected data source(s)."): Promise<void> =>
    initializeDataSourceOnlyConnection(this as unknown as LocalizationHost, failureMessage);

  private finalizeConnection = (featureLayers: __esri.FeatureLayer[], jimuMapView: JimuMapView | null): Promise<void> =>
    finalizeConnection(this as unknown as LocalizationHost, featureLayers, jimuMapView);

  private resolveFeatureLayerFromOneUseDataSource = (useDs: any, jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer | null> =>
    resolveFeatureLayerFromOneUseDataSource(this as unknown as LocalizationHost, useDs, jimuMapView);

  private resolveSpatialMapLayers = (jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer[]> =>
    resolveSpatialMapLayers(this as unknown as LocalizationHost, jimuMapView);

  private resolveFeatureLayersFromUseDataSources = (jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer[]> =>
    resolveFeatureLayersFromUseDataSources(this as unknown as LocalizationHost, jimuMapView);

  private buildLayerViloyatIndex = (): Promise<void> =>
    buildLayerViloyatIndex(this as unknown as LocalizationHost);

  private detectNdviStatusDateFieldsFromLayer = (): void =>
    detectNdviStatusDateFieldsFromLayer(this as unknown as LocalizationHost);

  onDataSourceCreated = (ds: DataSource) =>
    onDataSourceCreated(this as unknown as LocalizationHost, ds);

  onDataSourceInfoChange = (info: any) =>
    onDataSourceInfoChange(this as unknown as LocalizationHost, info);

  retryMapConnection = () =>
    retryMapConnection(this as unknown as LocalizationHost);

  private runInitialDataLoad = (): Promise<void> =>
    runInitialDataLoad(this as unknown as LocalizationHost);

  ensureInitialization = async () => {
    return ensureInitialization(this as unknown as LocalizationHost);
  };

  private getUniqueValues = (fieldName: string): Promise<string[]> =>
    getUniqueValues(this as unknown as LocalizationHost, fieldName);

  private fetchFilterOptions = () =>
    fetchFilterOptions(this as unknown as LocalizationHost);

  private async flDistinctFromLayer(
    layer: __esri.FeatureLayer,
    fieldName: string,
    where: string,
  ): Promise<string[]> {
    return flDistinctFromLayer(
      this as unknown as LocalizationHost,
      layer,
      fieldName,
      where,
    );
  }

  private fetchAndStoreRegionDistrictMappings = (): Promise<void> =>
    fetchAndStoreRegionDistrictMappings(this as unknown as LocalizationHost);

  private ensureRegionDistrictForSelection = (): Promise<void> =>
    ensureRegionDistrictForSelection(this as unknown as LocalizationHost);

  private ensureCropIdForSelection = (): Promise<void> =>
    ensureCropIdForSelection(this as unknown as LocalizationHost);

  /* ---------------------- UI Handlers ---------------------- */

  private resolveThemeState = (): boolean => {
    return resolveThemeState(this as unknown as LocalizationHost);
  };

  private initializeTheme = () => {
    return initializeTheme(this as unknown as LocalizationHost);
  };

  private applyThemeToDom = (isDarkTheme: boolean): void => {
    return applyThemeToDom(this as unknown as LocalizationHost, isDarkTheme);
  };

  private handleThemeChange = (event: any) => {
    return handleThemeChange(this as unknown as LocalizationHost, event);
  };

  private handleDocumentClick = (event: MouseEvent): void => {
    return handleDocumentClick(this as unknown as LocalizationHost, event);
  };

  private toggleToolbarMenu = (
    menu: "yil" | "language" | "indexInfo" | "notifications",
  ): void => {
    return toggleToolbarMenu(this as unknown as LocalizationHost, menu);
  };

  private hydrateNotificationCache = (): void =>
    hydrateNotificationCache(this as unknown as LocalizationHost);

  private onDashboardPackForNotifications = (pack: {
    phase?: string;
    filter?: { yil?: string };
  }): void =>
    onDashboardPackForNotifications(this as unknown as LocalizationHost, pack);

  private beginNotificationPrefetch = (): void =>
    beginNotificationPrefetch(this as unknown as LocalizationHost);

  private onNotificationsMenuOpened = (): void =>
    onNotificationsMenuOpened(this as unknown as LocalizationHost);

  private loadNotificationFeed = (): Promise<void> =>
    loadNotificationFeed(this as unknown as LocalizationHost);

  private formatNotificationDate = (ymd: string): string =>
    formatNotificationDate(this as unknown as LocalizationHost, ymd);

  private resolveRegionNotificationName = (regionCode: string): string =>
    resolveRegionNotificationName(this as unknown as LocalizationHost, regionCode);

  private formatFieldCount = (value: number): string =>
    formatFieldCount(this as unknown as LocalizationHost, value);

  private updateNotificationScrollHint = (): void =>
    updateNotificationScrollHint(this as unknown as LocalizationHost);

  private onNotificationBodyScroll = (): void => {
    this.updateNotificationScrollHint();
  };

  private openIndexInfoDetail = (key: string): void => {
    this.setState({ selectedIndexInfoKey: key });
  };

  /** "×" / backdrop click — dismiss the indexInfo popover entirely. */
  private closeIndexInfoMenu = (): void => {
    this.setState({ openToolbarMenu: null, selectedIndexInfoKey: null });
  };

  private toggleProfileMenu = (): void => {
    this.setState((prev) => ({ showProfileMenu: !prev.showProfileMenu }));
  };

  private closeProfileMenu = (): void => {
    this.setState({ showProfileMenu: false });
  };

  private handleLogout = (): void => {
    this.setState({ showProfileMenu: false });
    void logoutFromAccount();
  };

  private handleYilChange = (event: any) => {
    return handleYilChange(this as unknown as LocalizationHost, event);
  };

  private applyLanguage = (lang: FilterState["language"]) => {
    return applyLanguage(this as unknown as LocalizationHost, lang);
  };

  private applyYil = (selectedYil: string) => {
    return applyYil(this as unknown as LocalizationHost, selectedYil);
  };

  private applyThemeByValue = (value: "light" | "dark") => {
    return applyThemeByValue(this as unknown as LocalizationHost, value);
  };

  private emitGraffTableSearchChanged = (query: string, options?: { preserveSelection?: boolean }) =>
    emitGraffTableSearchChanged(this as unknown as LocalizationHost, query, options);

  private emitGraffTableSearchClear = (options?: { preserveSelection?: boolean; }) =>
    emitGraffTableSearchClear(this as unknown as LocalizationHost, options);

  private emitGraffTableRowSelected = (record: GraffSearchRecord) =>
    emitGraffTableRowSelected(this as unknown as LocalizationHost, record);

  private getGraffDisplayFields = (): string[] =>
    getGraffDisplayFields(this as unknown as LocalizationHost);

  private buildGraffSearchTextWhere = (raw: string, layer?: __esri.FeatureLayer): string =>
    buildGraffSearchTextWhere(this as unknown as LocalizationHost, raw, layer);

  private buildGraffSearchScopeWhere = (): string =>
    buildGraffSearchScopeWhere(this as unknown as LocalizationHost);

  private getGraffSearchFieldLabel = (fieldName: string, language: FilterState["language"]): string =>
    getGraffSearchFieldLabel(this as unknown as LocalizationHost, fieldName, language);

  private formatGraffSearchCellValue = (fieldName: string, rawValue: unknown): string =>
    formatGraffSearchCellValue(this as unknown as LocalizationHost, fieldName, rawValue);

  private runGraffAutoComplete = (term: string) =>
    runGraffAutoComplete(this as unknown as LocalizationHost, term);

  private handleGraffSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleGraffSearchInputChange(this as unknown as LocalizationHost, event);

  private handleGraffSearchFocus = (): void =>
    handleGraffSearchFocus(this as unknown as LocalizationHost);

  private clearFarmerSearchAndRestoreGeo = (): void =>
    clearFarmerSearchAndRestoreGeo(this as unknown as LocalizationHost);

  private handleGraffSearchClear = () =>
    handleGraffSearchClear(this as unknown as LocalizationHost);

  private handleGraffSearchRowClick = (record: GraffSearchRecord) =>
    handleGraffSearchRowClick(this as unknown as LocalizationHost, record);

  private applyFarmerSearchSelection = (inn: string): Promise<void> =>
    applyFarmerSearchSelection(this as unknown as LocalizationHost, inn);


  private handleNdviDateChange = (event: any) => {
    return handleNdviDateChange(this as unknown as LocalizationHost, event);
  };

  /* ---------------------- WHERE Clause Builder ---------------------- */

  private eqAposSmart(field: string, raw: string): string {
    return eqAposSmart(this as unknown as LocalizationHost, field, raw);
  }

  private getAposHelpers = () =>
    getAposHelpers(this as unknown as LocalizationHost);

  private normalizeTurlar = (raw: unknown, fallback = ""): string[] =>
    normalizeTurlarList(raw, fallback);

  private getSelectedTurlar = (): string[] =>
    this.normalizeTurlar(this.state.turlar, this.state.turi || "");

  private getChartFilterFlags = (
    vh = String(this.state.vh || "").trim(),
    turlar = this.getSelectedTurlar(),
  ): ChartFilterFlags =>
    getChartFilterFlags(this as unknown as LocalizationHost, vh, turlar);

  private getCropIdsForVhUniqueIdScope = (): string[] => {
    return getCropIdsForVhUniqueIdScope(this as unknown as LocalizationHost);
  };

  private syncChartDimOrder = (
    nextVh: string,
    nextTurlar: string[],
    resetGeography: boolean,
  ): void => {
    return syncChartDimOrder(this as unknown as LocalizationHost, nextVh, nextTurlar, resetGeography);
  };

  private buildTurlarClause = (
    field = "turi",
    values: string[] = this.getSelectedTurlar(),
  ): string => buildTurlarSqlClause(field, values);

  private buildUniqueIdClause(raw: string, layer?: __esri.FeatureLayer): string {
    return buildUniqueIdClause(this as unknown as LocalizationHost, raw, layer);
  }

  private buildViloyatRegionClause(): string {
    return buildViloyatRegionClause(this as unknown as LocalizationHost);
  }

  private buildTumanDistrictClause(): string {
    return buildTumanDistrictClause(this as unknown as LocalizationHost);
  }

  private buildNdviSpatialWhere(includeTuri = true): string {
    return buildNdviSpatialWhere(this as unknown as LocalizationHost, includeTuri);
  }

  private buildNdviStatusClauseForCurrentVh(): string {
    return buildNdviStatusClauseForCurrentVh(this as unknown as LocalizationHost);
  }

  private buildNdviDateClauseWithoutVh(): string {
    return buildNdviDateClauseWithoutVh(this as unknown as LocalizationHost);
  }

  private buildWhereClause(
    includeVh = true,
    includeTuri = true,
    includeViloyat = true,
    layer?: __esri.FeatureLayer,
  ): string {
    return buildWhereClause(
      this as unknown as LocalizationHost,
      includeVh,
      includeTuri,
      includeViloyat,
      layer,
    );
  }

  private getLatestNdviDateForBar(primaryLayer?: __esri.FeatureLayer): string | null {
    return getLatestNdviDateForBar(this as unknown as LocalizationHost, primaryLayer);
  }

  private computeVhBarData = (): Promise<VHBarData | null> =>
    computeVhBarData(this as unknown as LocalizationHost);

  private makeVhBarComputeKey = (): string =>
    makeVhBarComputeKey(this as unknown as LocalizationHost);

  private executeComputeVhBarData = (): Promise<VHBarData | null> =>
    executeComputeVhBarData(this as unknown as LocalizationHost);

  private publishVhBarPartial = (vhBarData: VHBarData): void =>
    publishVhBarPartial(this as unknown as LocalizationHost, vhBarData);

  private buildTableDateWhere(
    dateField: string,
    ndviDate: string,
  ): string | null {
    return buildTableDateWhere(this as unknown as LocalizationHost, dateField, ndviDate);
  }

  private buildTableWhereWithRegion(
    dateField: string,
    ndviDate: string,
    tableFieldNames: string[],
  ): string | null {
    return buildTableWhereWithRegion(
      this as unknown as LocalizationHost,
      dateField,
      ndviDate,
      tableFieldNames,
    );
  }

  private getPolygonAreasWithCurrentFilter = (opts?: { includeTuri?: boolean; }): Promise<Map<string, number>> =>
    getPolygonAreasWithCurrentFilter(this as unknown as LocalizationHost, opts);

  private getGeoCodeHelpers = () =>
    getGeoCodeHelpers(this as unknown as LocalizationHost);

  private makeVhBarDateGeoKey = (): string =>
    makeVhBarDateGeoKey(this as unknown as LocalizationHost);

  private getGeoScopedVhBarUsedDate = (): string =>
    getGeoScopedVhBarUsedDate(this as unknown as LocalizationHost);

  private setVhUniqueIdCacheEntry = (key: string, ids: string[]): void =>
    setVhUniqueIdCacheEntry(this as unknown as LocalizationHost, key, ids);

  private buildVhMapUniqueIdCacheKey = (): string | null =>
    buildVhMapUniqueIdCacheKey(this as unknown as LocalizationHost);


  private isVhMapUniqueIdCacheWarm = (): boolean =>
    isVhMapUniqueIdCacheWarm(this as unknown as LocalizationHost);

  private prefetchVhStatusUniqueIds = (ndviDate: string): void =>
    prefetchVhStatusUniqueIds(this as unknown as LocalizationHost, ndviDate);

  private resolveVhMapUniqueIds = (isCurrent?: () => boolean): Promise<string[] | null> =>
    resolveVhMapUniqueIds(this as unknown as LocalizationHost, isCurrent);

  private resolveVhRegionChartUniqueIdsBackground = (resolveGen: number, params: { status: string; regionNum: number; cropIds: string[]; ndviDate: string; vhCategory: string; }, isCurrent?: () => boolean): Promise<void> =>
    resolveVhRegionChartUniqueIdsBackground(this as unknown as LocalizationHost, resolveGen, params, isCurrent);

  private syncShownRegionYearLayers = (map: any): ShownRegionYearLayer[] =>
    syncShownRegionYearLayers(this as unknown as LocalizationHost, map);
  private loadNdviBucketIds = (vhCategory: string): Promise<void> =>
    loadNdviBucketIds(this as unknown as LocalizationHost, vhCategory);

  private async applyFiltersPersistent(
    isCurrent?: () => boolean,
    opts?: { vhDeferredSecondPass?: boolean },
  ): Promise<void> {
    return applyFiltersPersistent(this as unknown as LocalizationHost, isCurrent, opts);
  }

  private zoomToSelectedDistrict = (view: any): Promise<boolean> =>
    zoomToSelectedDistrict(this as unknown as LocalizationHost, view);
  private applyMapFiltersOptimized = (zoomRequest: MapZoomRequest = { mode: "none", reason: "other" }, isApplyCurrent?: () => boolean): Promise<void> =>
    applyMapFiltersOptimized(this as unknown as LocalizationHost, zoomRequest, isApplyCurrent);

  private fetchDataWithCurrentState = () =>
    fetchDataWithCurrentState(this as unknown as LocalizationHost);

  /* ---------------------- Render ---------------------- */

  render() {
    return render(this as unknown as LocalizationHost);
  }
}
