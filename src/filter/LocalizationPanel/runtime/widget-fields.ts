import { React } from "jimu-core";
import type { ChartDim } from "../../../gis/agri-chart-filter-order";
import type { ShownRegionYearLayer } from "../../../gis/feature-layer-data";
import type { AgriMapLayer } from "../../localization/agri-map-layer";
import type { VHBarData } from "../../localization/vh-constants";
import type {
  LocalizationBroadcastDetail,
  LocalizationHost,
  LocalizationWidgetProps,
  TimerHandle,
} from "./components/host";
import type { GeoWidgetState } from "./widget-state";

/**
 * Instance bookkeeping for AgriLocalization (request ids, caches, timers,
 * refs). Kept apart from the widget so the component file only wires
 * lifecycle + delegates to the extracted services.
 */
export abstract class LocalizationWidgetFields extends React.PureComponent<
  LocalizationWidgetProps,
  GeoWidgetState
> {
  _prevDefinitionExpression = "";
  /**
   * Previous polygonMode observed in applyMapFiltersOptimized. Used only to
   * skip a bare non-geography zoom pass that coincides with popup close
   * (AgriPopup restores the pre-field extent). Geography zooms (region /
   * district / Back) always run even when the same setState cleared
   * polygonMode.
   */
  _prevPolygonModeForZoomGuard = false;
  _mapUpdateScheduled = false;
  _onReset: () => void;
  initializationTimer: TimerHandle | null = null;
  _retryTimeout: TimerHandle | null = null;
  _graffSearchDebounceTimer: TimerHandle | null = null;
  _dataSourceInfoDebounceTimer: TimerHandle | null = null;
  _isMounted = false;
  _mapClickHandle: __esri.Handle | null = null;
  _mapInteractionHandle: __esri.Handle | null = null;
  /** Re-checks MapImage visibility/DE after popup identify + goTo settle. */
  _polygonFilterGuardTimers: ReturnType<typeof setTimeout>[] = [];
  /**
   * After geography goTo, MapImage export is often aborted mid-flight — fields
   * stay blank until a manual zoom. These timers reassert DE + refresh once
   * the view has settled.
   */
  _regionYearSettleRepaintTimers: ReturnType<typeof setTimeout>[] = [];
  _zoomRequestId = 0;
  _districtZoomRequestId = 0;
  /** Only the newest filter-data request may finish the global loading state. */
  _filterDataRequestId = 0;
  /** Only the newest graff autocomplete query may apply results. */
  _graffAutoCompleteRequestId = 0;
  /**
   * Only the newest geography apply pipeline may finish map sync + broadcast.
   * Without this, a slow Quva apply can broadcast after Back already cleared
   * tuman, briefly re-scoping Indicators/Graff to the old district.
   */
  _geographyApplyId = 0;
  _readyFired = false;
  /** Coalesces map/data-source/fallback startup into one network pipeline. */
  _initialDataLoadPromise: Promise<void> | null = null;
  /** Prevents MapView ready callbacks from resolving the same layers twice. */
  _mapConnectionPromise: Promise<void> | null = null;
  /** Last fully emitted filter payload; identical broadcasts are skipped. */
  _lastBroadcastDigest = '';
  /** Cached detail for late subscribers (indicators mount after first broadcast). */
  _lastBroadcastDetail: LocalizationBroadcastDetail | null = null;
  /**
   * Invalidates in-flight computeVhBarData → masterFilterChanged sends.
   * A slow VH query for Dang'ara must not overwrite a newer Sirdaryo broadcast.
   */
  _broadcastGeneration = 0;
  /** Newest geography selection timestamp from widgetSelectionChanged. */
  _lastGeographySelectionTs = 0;
  _homeExtent: __esri.Extent | null = null;
  // Prevent repeated "home" goTo calls during rapid filter clearing.
  _lastHomeGoToAt = 0;
  // Set by syncRegionYearLayerVisibility() each time filters change — the
  // region+year layer(s) actually shown, with live sublayer refs, so the
  // zoom step can query their real (tuman-aware) extent instead of the
  // whole region's fullExtent.
  _lastShownRegionYearLayers: ShownRegionYearLayer[] = [];
  _graffSearchWrapRef = React.createRef<HTMLDivElement>();
  _yilToolbarItemRef = React.createRef<HTMLDivElement>();
  _languageToolbarItemRef = React.createRef<HTMLDivElement>();
  _indexInfoToolbarItemRef = React.createRef<HTMLDivElement>();
  _notificationsToolbarItemRef = React.createRef<HTMLDivElement>();
  _notificationBodyRef = React.createRef<HTMLDivElement>();
  _notificationLoadToken = 0;
  _unbindNotificationPack: (() => void) | null = null;
  _notificationPaintFrame = 0;
  /** Widgets have reached a year-scoped pack; notification queries may start. */
  _notificationWidgetsReady = false;
  /** Feed was filled from cache or a request was started. */
  _notificationLoadStarted = false;

  _originalLayerRenderers = new Map<AgriMapLayer, AgriMapLayer["renderer"]>();
  _cropRenderedLayers = new Set<AgriMapLayer>();
  _cropRendererRequestId = 0;
  _cropRendererAutoEnabled = false;
  /** Cache distinct crop values per layer URL+field+where — avoids re-querying
   * the same shown region/year sublayer on every filter tick. */
  _cropDistinctValueCache = new Map<string, string[]>();

  /** Cache of NDVI bucket → polygon join IDs (uniqueid) for current yil/viloyat. */
  _ndviBucketToIds: Record<string, string[]> = {};

  /**
   * Uniqueids for the current Vegetatsiya Holati (AgriBar) selection, resolved
   * from agri_vegetation_indices.ndvi_status. null = no VH filter active.
   * Scoped to the selected tuman when one is set — used for map DE only.
   */
  _vhMapUniqueIds: string[] | null = null;
  /**
   * Same VH(+crop) uniqueids at viloyat/region scope (no district). Used by
   * AgriRegion "Tumanlar kesimida" so selecting a tuman + VH still shows every
   * district's bar, not only the focused tuman.
   */
  _vhRegionChartUniqueIds: string[] | null = null;
  /**
   * Uniqueids for the header STIR (`selectedFarmerInn`) selection — scopes
   * MapImage + VH bar the same way VH uniqueids do.
   */
  _farmerMapUniqueIds: string[] | null = null;
  /** True while applying a header STIR selection (skip geo-echo search clear). */
  _farmerSearchApplying = false;
  /**
   * Geography before a committed STIR selection — restored when search is
   * cleared (X) so republic / viloyat / tuman return to the prior scope.
   */
  _preFarmerSearchGeo: { viloyat: string; tuman: string } | null = null;
  /** Bumps on every VH resolve so stale async pages never write the map. */
  _vhResolveGen = 0;
  /** True after VH-only path already resolved uniqueids for this apply. */
  _vhUniqueIdsReadyForApply = false;
  /**
   * When true, applyFiltersPersistent skips await resolveVhMapUniqueIds so
   * crop/tuman map DE can apply immediately. Uniqueids are resolved after
   * map paint when a VH status is still active (see applyMapFiltersOptimized).
   */
  _deferVhUniqueIdResolve = false;
  /**
   * While deferred VH uniqueids reload, never fall back to the polygon `vh`
   * attribute filter (it does not store bar categories like "4-Past" and
   * blanks the MapImage). Geography + turi stay visible until ids arrive.
   */
  _suppressLegacyVhOnMap = false;
  /**
   * Cache: status|date|region|district|crops → uniqueids.
   * The key carries the full query scope, so entries stay valid across
   * viloyat/tuman switches — going back to a previous geography must not
   * re-page the whole uniqueid list. Bounded instead of cleared.
   */
  _vhUniqueIdCache: Record<string, string[]> = {};
  /** Last successful VH bar payload — reused on VH-only selection toggles. */
  _lastVhBarData: VHBarData | null = null;
  /**
   * Single-flight + memo for computeVhBarData. Identical year/geo/crop keys
   * share one in-flight promise so startup broadcast storms do not fan out
   * duplicate republic VH query batches.
   */
  _vhBarComputeInFlight = new Map<string, Promise<VHBarData | null>>();
  _vhBarComputeMemo = new Map<string, VHBarData>();
  _lastVhBarComputeKey = "";
  /** Canonical uniqueid → maydon maps cached by yil/geography/crop WHERE. */
  _polygonAreaQueryCache = new Map<
    string,
    Promise<Map<string, number>>
  >();
  /** Skip recomputing VH bar counts when only the selected category changes. */
  _reuseVhBarDataOnNextBroadcast = false;
  /**
   * Order in which Pie (turi) vs VH (vh) were first selected. Drives which
   * widget chart is scoped by the other; map always applies both when set.
   */
  _chartDimOrder: ChartDim[] = [];
  /**
   * True when `_vhMapUniqueIds` were resolved with vegetation `crop_id`
   * (crop selected before VH). False when VH-first / crop_id fallback — map
   * must AND MapImage `turi` text with the status-wide uniqueids.
   */
  _vhUniqueIdsCropScoped = false;

  /** Mapping of logical NDVI date (e.g. '2025-06-12') → polygon status field name (e.g. 'status_2025_06_12'). */
  _ndviDateFieldMap: Record<string, string> = {};

  /** Viloyat name → region number (from layer attribute `region`). Used to filter by code instead of name. */
  _viloyatToRegion: Record<string, number> = {};
  /** Region number → viloyat display name (from Agri_table_data). Used by notifications. */
  _regionToViloyat: Record<string, string> = {};
  /** Tuman name → district number (from layer attribute `district`). Used to filter by code instead of name. */
  _tumanToDistrict: Record<string, number> = {};
  /**
   * Crop type name (turi) → crop_id. agri_vegetation_indices (the source
   * behind the VH "Vegetatsiya Holati" bar, computed in computeVhBarData())
   * has no human-readable turi field, only crop_id — Agri_table_data has
   * both, so this is resolved the same way region/district are.
   */
  _turiToCropId: Record<string, string> = {};
  /**
   * NDVI date that computeVhBarData actually used (first date with rows).
   * resolveVhMapUniqueIds must reuse this — taking "latest available" alone
   * often yields 0 uniqueids while the VH chart still shows data.
   */
  _vhBarUsedDate: string | null = null;
  /**
   * Geography (`viloyat|tuman`) the bar date above was proved on. Available
   * NDVI dates differ per viloyat, so the date may only be trusted as-is for
   * the same scope; elsewhere it is just the first candidate to probe.
   */
  _vhBarUsedDateGeo: string | null = null;
  /** Layer identity -> normalized viloyat keys found in that layer. */
  _layerToViloyatKeys: Record<string, string[]> = {};
  /** Normalized viloyat key -> layer identities that contain that viloyat. */
  _viloyatKeyToLayerKeys: Record<string, string[]> = {};

  /** Monotonic token so a stale apply cannot clear a newer map overlay. */
  _mapSurfaceLoadingToken = 0;
  _allowClearOnce = false;
  _primaryDataSourceId: string | null = null;
  _dsOnlyRetryTimer: ReturnType<typeof setTimeout> | null = null;
  _dsOnlyRetryCount = 0;

  /** This instance viewed through the interface the extracted services use. */
  protected abstract get host(): LocalizationHost;
}
