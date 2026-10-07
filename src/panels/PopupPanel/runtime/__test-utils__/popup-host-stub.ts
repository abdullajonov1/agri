import type { PopupWidgetHost } from "../popup-host";
import type { Config, State } from "../popup-types";
import * as layout from "../components/layout-handlers";
import * as fields from "../components/field-handlers";

type StatePatch = Partial<State>;
type StateUpdater = StatePatch | ((prev: State) => StatePatch);

export const basePopupState = (): State => ({
  currentLang: "en",
  isDarkTheme: true,
  featureLayers: [],
  layerKeyToDsId: {},
  dataSourcesById: {},
  lastClickedDsId: null,
  lastClickedLayerKey: null,
  pinToCorner: false,
  loadingAttachments: false,
  attachments: [],
  attachmentsError: null,
  attachmentsExpanded: false,
  loading: false,
  error: null,
  selectedAttrs: null,
  selectedOID: null,
  objectIdField: null,
  showPopup: false,
  popupMinimized: false,
  popupPosition: null,
  clickScreenPoint: null,
  debugInfo: {} as State["debugInfo"],
  chartExpanded: false,
  chartHoverIndex: null,
  loadingLatestIndices: false,
  latestIndexDate: null,
  latestIndexValues: null,
});

export interface RectInit {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const makeRect = ({ left, top, width, height }: RectInit): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

/** A fake MapView whose container reports the given bounding rect. */
export const makeView = (rect: RectInit): __esri.MapView => {
  const container = document.createElement("div");
  container.getBoundingClientRect = () => makeRect(rect);
  return { container } as unknown as __esri.MapView;
};

export interface PopupHostStub {
  host: PopupWidgetHost;
  setState: jest.Mock<void, [StateUpdater, (() => void)?]>;
}

/**
 * Popup host wired to the real layout/field handler implementations so
 * cross-calls (host.getPopupWidth → layout.getPopupWidth …) behave as in
 * the widget. Override any member via `overrides`.
 */
export const makePopupHost = (
  state: StatePatch = {},
  props: { id?: string; config?: Config } = {},
  overrides: Partial<PopupWidgetHost> = {},
): PopupHostStub => {
  const host = {
    props: { id: props.id ?? "popup-widget", config: props.config ?? {} },
    state: { ...basePopupState(), ...state },
    POPUP_MARGIN: 10,
    POPUP_WIDTH: 300,
    DASHBOARD_POPUP_VERTICAL_INSET: 20,
    DASHBOARD_POPUP_HORIZONTAL_INSET: 30,
    _isMounted: true,
    _isDraggingPopup: false,
    _popupLayoutTimer: null,
    _popupLayoutRaf: 0,
    _popupDragOffset: { x: 0, y: 0 },
    _featureQueryCache: new Map(),
    _clickGeneration: 0,
    _latestIndicesRequestId: 0,
    _extentBeforeSelection: null,
    _popupRef: { current: null },
    mapAreaResizeObserver: null,
    forceUpdate: jest.fn(),
    clearHighlight: jest.fn(),
    notifyGraffPolygonSelection: jest.fn(),
    restoreExtentBeforeSelection: jest.fn(),
    broadcastPopupVisibility: jest.fn(),
    minimizePopup: jest.fn(),
  } as unknown as PopupWidgetHost;

  const bind = <A extends unknown[], R>(fn: (h: PopupWidgetHost, ...args: A) => R) =>
    (...args: A): R => fn(host, ...args);

  Object.assign(host, {
    getPopupWidth: bind(layout.getPopupWidth),
    getPinnedPopupHeight: bind(layout.getPinnedPopupHeight),
    getPopupDimensions: bind(layout.getPopupDimensions),
    getResolvedTheme: bind(layout.getResolvedTheme),
    pruneFeatureQueryCache: bind(layout.pruneFeatureQueryCache),
    getFeatureQueryCacheKey: bind(layout.getFeatureQueryCacheKey),
    tr: bind(layout.tr),
    isDashboardEmbedded: bind(layout.isDashboardEmbedded),
    getCropOverlayTop: bind(layout.getCropOverlayTop),
    getMapAreaRect: bind(layout.getMapAreaRect),
    getEffectiveMapBottom: bind(layout.getEffectiveMapBottom),
    popupPositionsEqual: bind(layout.popupPositionsEqual),
    applyPopupPosition: bind(layout.applyPopupPosition),
    schedulePopupLayout: bind(layout.schedulePopupLayout),
    schedulePopupLayoutAfterContent: bind(layout.schedulePopupLayoutAfterContent),
    calculatePinnedPosition: bind(layout.calculatePinnedPosition),
    repositionPinnedIfNeeded: bind(layout.repositionPinnedIfNeeded),
    clampPopupToMapContainer: bind(layout.clampPopupToMapContainer),
    onPopupDragMove: bind(layout.onPopupDragMove),
    onPopupDragEnd: bind(layout.onPopupDragEnd),
    calculatePopupPosition: bind(fields.calculatePopupPosition),
    getClickedLayer: bind(fields.getClickedLayer),
    findFieldMetaOnLayer: bind(fields.findFieldMetaOnLayer),
    normalizeFieldAlias: bind(fields.normalizeFieldAlias),
    resolveFieldName: bind(fields.resolveFieldName),
    resolveAliasFromLiveLayers: bind(fields.resolveAliasFromLiveLayers),
    resolveAliasFromDataSourceSchema: bind(fields.resolveAliasFromDataSourceSchema),
    isDateField: bind(fields.isDateField),
    formatDateSmart: bind(fields.formatDateSmart),
    revokeAllAttachmentUrls: bind(fields.revokeAllAttachmentUrls),
    ...overrides,
  });

  const setState = jest.fn((update: StateUpdater, cb?: () => void) => {
    const patch = typeof update === "function" ? update(host.state) : update;
    host.state = { ...host.state, ...patch };
    cb?.();
  });
  host.setState = setState as unknown as PopupWidgetHost["setState"];
  return { host, setState };
};
