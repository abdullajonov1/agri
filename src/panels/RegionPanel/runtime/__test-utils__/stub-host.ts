import type { AgriRegionState } from "../widget";
import type { RegionWidgetHost } from "../region-host";

type SetStateCallback = () => void;
type StateUpdater = (prev: AgriRegionState, props: unknown) => Partial<AgriRegionState> | null;

export const makeRegionState = (overrides: Partial<AgriRegionState> = {}): AgriRegionState => ({
  regionalLoading: false,
  regionalError: null,
  regionalData: { viloyatlar: [], tumanlar: [], totalArea: 0 },
  lockedViloyat: null,
  isLocked: false,
  currentFilters: {
    yil: "",
    viloyat: "",
    tuman: "",
    turi: "",
    turlar: [],
    vh: "",
    vhUniqueids: null,
    filterPieByVh: false,
  },
  currentView: "viloyat",
  selectedViloyatForDrillDown: null,
  selectedRegion: null,
  displayCount: 15,
  displayCountMenuOpen: false,
  sortMode: "value_desc",
  isDarkTheme: false,
  widgetSize: "md",
  containerWidth: 0,
  chartAreaHeight: 0,
  featureLayers: [],
  areaField: null,
  statMode: "sum",
  connectionStatus: "connected",
  language: "uz_lat",
  cursorTooltip: { visible: false, data: null },
  ...overrides,
});

/**
 * A RegionWidgetHost whose methods are all jest.fn() stubs. `setState` merges
 * into `host.state` synchronously (like a flushed React update) and runs the
 * callback, so handler chains can be asserted on the resulting state.
 */
export const makeStubHost = (
  stateOverrides: Partial<AgriRegionState> = {},
  hostOverrides: Partial<Record<keyof RegionWidgetHost, unknown>> = {},
): RegionWidgetHost => {
  const base: Record<string, unknown> = {
    props: { id: "w1", config: {}, useDataSources: undefined },
    state: makeRegionState(stateOverrides),
    _isMounted: true,
    _unbindMasterFilter: jest.fn(),
    _resizeObserver: null,
    _countFilterRef: { current: null },
    _rootRef: { current: null },
    _chartAreaRef: { current: null },
    _chartContainerRef: { current: null },
    _cursorTooltipRef: { current: null },
    _chartAreaObserved: false,
    _pendingBackToViloyatHighlight: "",
    _selectionNotifyGeneration: 0,
    _regionalRequestId: 0,
    _lastRegionalFetchKey: "",
    _pointerTracking: false,
    TOOLTIP_PAD: 10,
    TOOLTIP_OFFSET_X: 16,
    TOOLTIP_OFFSET_Y: 14,
  };
  const fnNames: Array<keyof RegionWidgetHost> = [
    "handleMasterFilterChange",
    "handleDocumentClickForCountFilter",
    "handleAgriV10ThemeChanged",
    "setupResizeObserver",
    "syncThemeState",
    "unbindPointerTracking",
    "getCurrentDataLength",
    "getEffectiveDisplayCount",
    "applyDisplayCount",
    "toggleDisplayCountMenu",
    "fetchRegionalDataDeduped",
    "detectAreaField",
    "resolveFeatureLayerFromOneUseDataSource",
    "buildWhereForAggregates",
    "buildVhScopedWheres",
    "queryAggregates",
    "resolveDisplayCountForData",
    "fetchRegionalData",
    "notifyAgriFilter",
    "handleGlobalPointerMove",
    "hideCursorTooltip",
    "clampCursorPosition",
    "applyTooltipPosition",
    "handleRegionSelectionClick",
    "handleBarPointerEnter",
    "handleBarPointerMove",
    "getClientPoint",
    "bindPointerTracking",
    "resolveWidgetSize",
    "formatNumber",
    "calculateDynamicYAxisWidth",
    "handleWidgetPointerLeave",
    "onDataSourceCreated",
    "onActiveViewChange",
    "navigateBack",
    "getDisplayCountOptions",
    "handleDisplayCountPillClick",
    "cycleSortMode",
    "handleChartSurfaceMove",
    "handleBarRowClick",
    "handleBarRowPointerEnter",
    "handleBarRowPointerMove",
    "renderCursorTooltipContent",
    "normalizeApos",
  ];
  for (const name of fnNames) base[name] = jest.fn();
  base.beginSelectionNotify = jest.fn(() => {
    const host = base as unknown as RegionWidgetHost;
    host._selectionNotifyGeneration += 1;
    return host._selectionNotifyGeneration;
  });
  base.normalizeApos = jest.fn((s: string) => s);
  base.buildVhScopedWheres = jest.fn((w: string) => Promise.resolve([w]));
  base.setState = jest.fn((partial: Partial<AgriRegionState> | StateUpdater, cb?: SetStateCallback) => {
    const host = base as unknown as RegionWidgetHost;
    const patch = typeof partial === "function" ? partial(host.state, host.props) : partial;
    if (patch) host.state = { ...host.state, ...patch };
    cb?.();
  });
  Object.assign(base, hostOverrides);
  return base as unknown as RegionWidgetHost;
};
