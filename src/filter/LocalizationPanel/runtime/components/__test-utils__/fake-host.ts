/**
 * Minimal LocalizationHost double for unit-testing the extracted services.
 * Only the members a test touches need to be supplied; everything else is
 * a harmless default. setState merges synchronously and runs the callback.
 */
import type {
  LocalizationHost,
  LocalizationWidgetProps,
} from "../host";
import type { GeoWidgetState } from "../../widget-state";
import { createInitialGeoState } from "../Shell/initial-state";

export type FakeHostInit = Omit<Partial<LocalizationHost>, "state" | "props"> & {
  state?: Partial<GeoWidgetState>;
  props?: Partial<LocalizationWidgetProps>;
};

type StatePatch =
  | Partial<GeoWidgetState>
  | ((prev: GeoWidgetState) => Partial<GeoWidgetState> | null)
  | null;

export type FakeHost = LocalizationHost & {
  setState: jest.Mock<void, [StatePatch, (() => void)?]>;
};

const trimString = (s: string | null | undefined): string =>
  String(s ?? "").trim();

export function makeFakeHost(init: FakeHostInit = {}): FakeHost {
  const { state, props, ...rest } = init;
  const host: Record<string, unknown> = {
    props: { config: {}, ...props },
    state: { ...createInitialGeoState(), ...state },
    _isMounted: true,
    _notificationBodyRef: { current: null },
    _notificationLoadToken: 0,
    _notificationPaintFrame: 0,
    _notificationWidgetsReady: false,
    _notificationLoadStarted: false,
    _regionToViloyat: {},
    _viloyatToRegion: {},
    _tumanToDistrict: {},
    _turiToCropId: {},
    _ndviDateFieldMap: {},
    _vhUniqueIdCache: {},
    _vhBarComputeMemo: new Map(),
    _vhBarComputeInFlight: new Map(),
    _polygonAreaQueryCache: new Map(),
    _cropDistinctValueCache: new Map(),
    _cropRenderedLayers: new Set(),
    _originalLayerRenderers: new Map(),
    _cropRendererRequestId: 0,
    _lastShownRegionYearLayers: [],
    _regionYearSettleRepaintTimers: [],
    _polygonFilterGuardTimers: [],
    _chartDimOrder: [],
    _lastBroadcastDetail: null,
    _lastBroadcastDigest: "",
    _lastVhBarComputeKey: "",
    _lastVhBarData: null,
    _broadcastGeneration: 0,
    _reuseVhBarDataOnNextBroadcast: false,
    _vhMapUniqueIds: null,
    _vhRegionChartUniqueIds: null,
    _farmerMapUniqueIds: null,
    _preFarmerSearchGeo: null,
    _farmerSearchApplying: false,
    _graffSearchDebounceTimer: null,
    _graffAutoCompleteRequestId: 0,
    _vhBarUsedDate: null,
    _vhBarUsedDateGeo: null,
    _zoomRequestId: 0,
    _filterDataRequestId: 0,
    _mapSurfaceLoadingToken: 0,
    _lastHomeGoToAt: 0,
    _geographyApplyId: 0,
    _vhResolveGen: 0,
    _lastGeographySelectionTs: 0,
    _dsOnlyRetryCount: 0,
    _homeExtent: null,
    _prevPolygonModeForZoomGuard: false,
    _deferVhUniqueIdResolve: false,
    _allowClearOnce: false,
    _suppressLegacyVhOnMap: false,
    _vhUniqueIdsCropScoped: false,
    _vhUniqueIdsReadyForApply: false,
    _ndviBucketToIds: {},
    _layerToViloyatKeys: {},
    _viloyatKeyToLayerKeys: {},
    _readyFired: false,
    _retryTimeout: null,
    _dsOnlyRetryTimer: null,
    _dataSourceInfoDebounceTimer: null,
    _initialDataLoadPromise: null,
    _mapClickHandle: null,
    _mapInteractionHandle: null,
    _mapConnectionPromise: null,
    _primaryDataSourceId: null,
    initializationTimer: null,
    MAX_CONNECTION_ATTEMPTS: 3,
    _districtZoomRequestId: 0,
    normalizeApos: (s: string) => trimString(s),
    makeRegionDistrictKey: (raw: string | null | undefined) =>
      trimString(raw).toLowerCase(),
    getSelectedTurlar: (): string[] => [],
    getEffectiveViloyat: () => "",
    setMapNoData: jest.fn(),
    setMapSurfaceLoading: jest.fn(),
    broadcastFilterState: jest.fn(),
    getChartFilterFlags: () => ({
      filterPieByVh: false,
      filterVhBarByCrop: false,
    }),
    ...rest,
  };
  host.setState = jest.fn((patch: StatePatch, cb?: () => void): void => {
    const prev = host.state as GeoWidgetState;
    const next = typeof patch === "function" ? patch(prev) : patch;
    host.state = { ...prev, ...(next || {}) };
    cb?.();
  });
  return host as unknown as FakeHost;
}
