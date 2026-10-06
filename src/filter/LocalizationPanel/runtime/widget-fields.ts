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
  protected _prevDefinitionExpression = "";
  /**
   * Previous polygonMode observed in applyMapFiltersOptimized. Used only to
   * skip a bare non-geography zoom pass that coincides with popup close
   * (AgriPopup restores the pre-field extent). Geography zooms (region /
   * district / Back) always run even when the same setState cleared
   * polygonMode.
   */
  protected _prevPolygonModeForZoomGuard = false;
  protected _mapUpdateScheduled = false;
  protected _onReset: () => void;
  protected initializationTimer: TimerHandle | null = null;
  protected _retryTimeout: TimerHandle | null = null;
  protected _graffSearchDebounceTimer: TimerHandle | null = null;
  protected _dataSourceInfoDebounceTimer: TimerHandle | null = null;
  protected _isMounted = false;
  protected _mapClickHandle: __esri.Handle | null = null;
  protected _mapInteractionHandle: __esri.Handle | null = null;
  /** Re-checks MapImage visibility/DE after popup identify + goTo settle. */
  protected _polygonFilterGuardTimers: ReturnType<typeof setTimeout>[] = [];
  /**
   * After geography goTo, MapImage export is often aborted mid-flight — fields
   * stay blank until a manual zoom. These timers reassert DE + refresh once
   * the view has settled.
   */
  protected _regionYearSettleRepaintTimers: ReturnType<typeof setTimeout>[] = [];
  protected _zoomRequestId = 0;
  protected _districtZoomRequestId = 0;
  /** Only the newest filter-data request may finish the global loading state. */
  protected _filterDataRequestId = 0;
  /** Only the newest graff autocomplete query may apply results. */
  protected _graffAutoCompleteRequestId = 0;
  /**
   * Only the newest geography apply pipeline may finish map sync + broadcast.
   * Without this, a slow Quva apply can broadcast after Back already cleared
   * tuman, briefly re-scoping Indicators/Graff to the old district.
   */
  protected _geographyApplyId = 0;
  protected _readyFired = false;
  /** Coalesces map/data-source/fallback startup into one network pipeline. */
  protected _initialDataLoadPromise: Promise<void> | null = null;
  /** Prevents MapView ready callbacks from resolving the same layers twice. */
  protected _mapConnectionPromise: Promise<void> | null = null;
  /** Last fully emitted filter payload; identical broadcasts are skipped. */
  protected _lastBroadcastDigest = '';
  /** Cached detail for late subscribers (indicators mount after first broadcast). */
  protected _lastBroadcastDetail: LocalizationBroadcastDetail | null = null;
  /**
   * Invalidates in-flight computeVhBarData → masterFilterChanged sends.
   * A slow VH query for Dang'ara must not overwrite a newer Sirdaryo broadcast.
   */
  protected _broadcastGeneration = 0;
  /** Newest geography selection timestamp from widgetSelectionChanged. */
  protected _lastGeographySelectionTs = 0;
  protected _homeExtent: __esri.Extent | null = null;
  // Prevent repeated "home" goTo calls during rapid filter clearing.
  protected _lastHomeGoToAt = 0;
  // Set by syncRegionYearLayerVisibility() each time filters change — the
  // region+year layer(s) actually shown, with live sublayer refs, so the
  // zoom step can query their real (tuman-aware) extent instead of the
  // whole region's fullExtent.
  protected _lastShownRegionYearLayers: ShownRegionYearLayer[] = [];
  protected _graffSearchWrapRef = React.createRef<HTMLDivElement>();
  protected _yilToolbarItemRef = React.createRef<HTMLDivElement>();
  protected _languageToolbarItemRef = React.createRef<HTMLDivElement>();
  protected _indexInfoToolbarItemRef = React.createRef<HTMLDivElement>();
  protected _notificationsToolbarItemRef = React.createRef<HTMLDivElement>();
  protected _notificationBodyRef = React.createRef<HTMLDivElement>();
  protected _notificationLoadToken = 0;
  protected _unbindNotificationPack: (() => void) | null = null;
  protected _notificationPaintFrame = 0;
  /** Widgets have reached a year-scoped pack; notification queries may start. */
  protected _notificationWidgetsReady = false;
  /** Feed was filled from cache or a request was started. */
  protected _notificationLoadStarted = false;

  protected _originalLayerRenderers = new Map<AgriMapLayer, __esri.Renderer | null>();
  protected _cropRenderedLayers = new Set<AgriMapLayer>();
  protected _cropRendererRequestId = 0;
  protected _cropRendererAutoEnabled = false;
  /** Cache distinct crop values per layer URL+field+where — avoids re-querying
   * the same shown region/year sublayer on every filter tick. */
  protected _cropDistinctValueCache = new Map<string, string[]>();

  /** Cache of NDVI bucket → polygon join IDs (uniqueid) for current yil/viloyat. */
  protected _ndviBucketToIds: Record<string, string[]> = {};

  /**
   * Uniqueids for the current Vegetatsiya Holati (AgriBar) selection, resolved
   * from agri_vegetation_indices.ndvi_status. null = no VH filter active.
   * Scoped to the selected tuman when one is set — used for map DE only.
   */
  protected _vhMapUniqueIds: string[] | null = null;
  /**
   * Same VH(+crop) uniqueids at viloyat/region scope (no district). Used by
   * AgriRegion "Tumanlar kesimida" so selecting a tuman + VH still shows every
   * district's bar, not only the focused tuman.
   */
  protected _vhRegionChartUniqueIds: string[] | null = null;
  /**
   * Uniqueids for the header STIR (`selectedFarmerInn`) selection — scopes
   * MapImage + VH bar the same way VH uniqueids do.
   */
  protected _farmerMapUniqueIds: string[] | null = null;
  /** True while applying a header STIR selection (skip geo-echo search clear). */
  protected _farmerSearchApplying = false;
  /**
   * Geography before a committed STIR selection — restored when search is
   * cleared (X) so republic / viloyat / tuman return to the prior scope.
   */
  protected _preFarmerSearchGeo: { viloyat: string; tuman: string } | null = null;
  /** Bumps on every VH resolve so stale async pages never write the map. */
  protected _vhResolveGen = 0;
  /** True after VH-only path already resolved uniqueids for this apply. */
  protected _vhUniqueIdsReadyForApply = false;
  /**
   * When true, applyFiltersPersistent skips await resolveVhMapUniqueIds so
   * crop/tuman map DE can apply immediately. Uniqueids are resolved after
   * map paint when a VH status is still active (see applyMapFiltersOptimized).
   */
  protected _deferVhUniqueIdResolve = false;
  /**
   * While deferred VH uniqueids reload, never fall back to the polygon `vh`
   * attribute filter (it does not store bar categories like "4-Past" and
   * blanks the MapImage). Geography + turi stay visible until ids arrive.
   */
  protected _suppressLegacyVhOnMap = false;
  /**
   * Cache: status|date|region|district|crops → uniqueids.
   * The key carries the full query scope, so entries stay valid across
   * viloyat/tuman switches — going back to a previous geography must not
   * re-page the whole uniqueid list. Bounded instead of cleared.
   */
  protected _vhUniqueIdCache: Record<string, string[]> = {};
  /** Last successful VH bar payload — reused on VH-only selection toggles. */
  protected _lastVhBarData: VHBarData | null = null;
  /**
   * Single-flight + memo for computeVhBarData. Identical year/geo/crop keys
   * share one in-flight promise so startup broadcast storms do not fan out
   * duplicate republic VH query batches.
   */
  protected _vhBarComputeInFlight = new Map<string, Promise<VHBarData | null>>();
  protected _vhBarComputeMemo = new Map<string, VHBarData>();
  protected _lastVhBarComputeKey = "";
  /** Canonical uniqueid → maydon maps cached by yil/geography/crop WHERE. */
  protected _polygonAreaQueryCache = new Map<
    string,
    Promise<Map<string, number>>
  >();
  /** Skip recomputing VH bar counts when only the selected category changes. */
  protected _reuseVhBarDataOnNextBroadcast = false;
  /**
   * Order in which Pie (turi) vs VH (vh) were first selected. Drives which
   * widget chart is scoped by the other; map always applies both when set.
   */
  protected _chartDimOrder: ChartDim[] = [];
  /**
   * True when `_vhMapUniqueIds` were resolved with vegetation `crop_id`
   * (crop selected before VH). False when VH-first / crop_id fallback — map
   * must AND MapImage `turi` text with the status-wide uniqueids.
   */
  protected _vhUniqueIdsCropScoped = false;

  /** Mapping of logical NDVI date (e.g. '2025-06-12') → polygon status field name (e.g. 'status_2025_06_12'). */
  protected _ndviDateFieldMap: Record<string, string> = {};

  /** Viloyat name → region number (from layer attribute `region`). Used to filter by code instead of name. */
  protected _viloyatToRegion: Record<string, number> = {};
  /** Region number → viloyat display name (from Agri_table_data). Used by notifications. */
  protected _regionToViloyat: Record<string, string> = {};
  /** Tuman name → district number (from layer attribute `district`). Used to filter by code instead of name. */
  protected _tumanToDistrict: Record<string, number> = {};
  /**
   * Crop type name (turi) → crop_id. agri_vegetation_indices (the source
   * behind the VH "Vegetatsiya Holati" bar, computed in computeVhBarData())
   * has no human-readable turi field, only crop_id — Agri_table_data has
   * both, so this is resolved the same way region/district are.
   */
  protected _turiToCropId: Record<string, string> = {};
  /**
   * NDVI date that computeVhBarData actually used (first date with rows).
   * resolveVhMapUniqueIds must reuse this — taking "latest available" alone
   * often yields 0 uniqueids while the VH chart still shows data.
   */
  protected _vhBarUsedDate: string | null = null;
  /**
   * Geography (`viloyat|tuman`) the bar date above was proved on. Available
   * NDVI dates differ per viloyat, so the date may only be trusted as-is for
   * the same scope; elsewhere it is just the first candidate to probe.
   */
  protected _vhBarUsedDateGeo: string | null = null;
  /** Layer identity -> normalized viloyat keys found in that layer. */
  protected _layerToViloyatKeys: Record<string, string[]> = {};
  /** Normalized viloyat key -> layer identities that contain that viloyat. */
  protected _viloyatKeyToLayerKeys: Record<string, string[]> = {};

  /** Monotonic token so a stale apply cannot clear a newer map overlay. */
  protected _mapSurfaceLoadingToken = 0;
  protected _allowClearOnce = false;
  protected _primaryDataSourceId: string | null = null;
  protected _dsOnlyRetryTimer: ReturnType<typeof setTimeout> | null = null;
  protected _dsOnlyRetryCount = 0;

  /** This instance viewed through the interface the extracted services use. */
  protected get host(): LocalizationHost {
    return this as unknown as LocalizationHost;
  }
}
