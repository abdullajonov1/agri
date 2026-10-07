/**
 * AgriPolygon is a thin host: each method must forward `this` (as the
 * PopupWidgetHost) plus its arguments to the matching handler function.
 * Handler modules are replaced with recording stubs so the delegation
 * contract is verified without exercising the handlers themselves.
 */
const mockEngine = { syncSelection: jest.fn() };
const mockHandlers: Record<string, Record<string, jest.Mock>> = {};

const makeHandlerModule = (name: string): unknown =>
  new Proxy({}, {
    get: (_target, key: string | symbol) => {
      if (key === "__esModule") return true;
      if (typeof key !== "string") return undefined;
      const bucket = (mockHandlers[name] = mockHandlers[name] || {});
      if (!bucket[key]) {
        bucket[key] = jest.fn((...args: unknown[]) => {
          if (name === "layout" && key === "getResolvedTheme") return true;
          return `${name}.${key}(${args.length - 1})`;
        });
      }
      return bucket[key];
    },
  });

jest.mock("../../../gis/agri-engine-registry", () => ({
  getSharedAgriDataSourceEngine: jest.fn(() => mockEngine),
}));
jest.mock("./components/layout-handlers", () => makeHandlerModule("layout"));
jest.mock("./components/map-handlers", () => makeHandlerModule("map"));
jest.mock("./components/click-handlers", () => makeHandlerModule("click"));
jest.mock("./components/field-handlers", () => makeHandlerModule("field"));
jest.mock("./components/render-panel", () => makeHandlerModule("panel"));

import AgriPolygon from "./widget";
import { getSharedAgriDataSourceEngine } from "../../../gis/agri-engine-registry";
import type { Config } from "./popup-types";

type Delegation = [method: string, module: string, handler: string, args: unknown[]];

const instance = (): AgriPolygon =>
  new AgriPolygon({ id: "w-1", config: {} as Config } as ConstructorParameters<typeof AgriPolygon>[0]);

const clearAll = (): void => {
  Object.values(mockHandlers).forEach((m) => Object.values(m).forEach((f) => f.mockClear()));
};

const callOn = (w: AgriPolygon, method: string, args: unknown[]): unknown =>
  ((w as unknown as Record<string, (...a: unknown[]) => unknown>)[method]).apply(w, args);

describe("AgriPolygon construction", () => {
  beforeEach(() => jest.clearAllMocks());

  test("acquires the shared engine for its widget id and starts with a closed popup", () => {
    const w = instance();
    expect(getSharedAgriDataSourceEngine).toHaveBeenCalledWith("w-1");
    expect(w.dataSourceEngine).toBe(mockEngine);
    expect(w.state).toMatchObject({
      isDarkTheme: true,
      pinToCorner: true,
      showPopup: false,
      popupMinimized: false,
      featureLayers: [],
      selectedAttrs: null,
      loading: false,
      latestIndexValues: null,
    });
    expect(w.POPUP_WIDTH).toBe(340);
    expect(w.maxMapInitRetries).toBe(12);
    expect(w._featureQueryCacheTtlMs).toBe(3600000);
  });
});

describe("AgriPolygon delegation", () => {
  const view = {} as __esri.MapView;
  const layer = {} as __esri.FeatureLayer;
  const jmv = {} as never;

  const table: Delegation[] = [
    ["getPopupWidth", "layout", "getPopupWidth", [view]],
    ["getPinnedPopupHeight", "layout", "getPinnedPopupHeight", [view, 4]],
    ["getPopupDimensions", "layout", "getPopupDimensions", [view, true, { x: 1, y: 2 }]],
    ["pruneFeatureQueryCache", "layout", "pruneFeatureQueryCache", [5]],
    ["getFeatureQueryCacheKey", "layout", "getFeatureQueryCacheKey", [layer, "OID", 1, ["*"]]],
    ["tr", "layout", "tr", ["key", { a: 1 }]],
    ["isDashboardEmbedded", "layout", "isDashboardEmbedded", []],
    ["getCropOverlayTop", "layout", "getCropOverlayTop", []],
    ["getMapAreaRect", "layout", "getMapAreaRect", [view]],
    ["observeMapAreaResize", "layout", "observeMapAreaResize", [view]],
    ["getEffectiveMapBottom", "layout", "getEffectiveMapBottom", [view, 2]],
    ["popupPositionsEqual", "layout", "popupPositionsEqual", [{ x: 1, y: 1 }, { x: 1, y: 1 }, 2]],
    ["applyPopupPosition", "layout", "applyPopupPosition", [{ x: 1, y: 1 }]],
    ["schedulePopupLayout", "layout", "schedulePopupLayout", []],
    ["schedulePopupLayoutAfterContent", "layout", "schedulePopupLayoutAfterContent", []],
    ["calculatePinnedPosition", "layout", "calculatePinnedPosition", [view]],
    ["repositionPinnedIfNeeded", "layout", "repositionPinnedIfNeeded", []],
    ["togglePinToCorner", "layout", "togglePinToCorner", []],
    ["handleOutsideClick", "layout", "handleOutsideClick", [new MouseEvent("click")]],
    ["onPopupDragMove", "layout", "onPopupDragMove", [new MouseEvent("mousemove")]],
    ["onPopupDragEnd", "layout", "onPopupDragEnd", []],
    ["clampPopupToMapContainer", "layout", "clampPopupToMapContainer", [{ x: 1, y: 2 }, view]],

    ["getDetachedQueryLayer", "map", "getDetachedQueryLayer", [null]],
    ["snapshotDefinitionExpressions", "map", "snapshotDefinitionExpressions", [[]]],
    ["restoreDriftedDefinitionExpressions", "map", "restoreDriftedDefinitionExpressions", [new Map()]],
    ["queryFeatureByObjectIdCached", "map", "queryFeatureByObjectIdCached", [layer, "OID", 1, ["*"]]],
    ["setupThemeObserver", "map", "setupThemeObserver", []],
    ["handleThemeChange", "map", "handleThemeChange", [null]],
    ["handleLanguageChange", "map", "handleLanguageChange", [null]],
    ["layerSupportsAttachments", "map", "layerSupportsAttachments", [layer]],
    ["setupHighlightLayer", "map", "setupHighlightLayer", [view]],
    ["highlightPolygon", "map", "highlightPolygon", [{} as __esri.Geometry]],
    ["clearHighlight", "map", "clearHighlight", []],
    ["restoreExtentBeforeSelection", "map", "restoreExtentBeforeSelection", []],
    ["cleanupHighlight", "map", "cleanupHighlight", []],
    ["getLinkedMapWidgetId", "map", "getLinkedMapWidgetId", []],
    ["getMapViewFromManager", "map", "getMapViewFromManager", ["m"]],
    ["handleMapViewReady", "map", "handleMapViewReady", [new Event("x")]],
    ["scheduleMapViewFallback", "map", "scheduleMapViewFallback", []],
    ["scheduleMapInitRetry", "map", "scheduleMapInitRetry", [jmv]],
    ["expandUseDataSourceEntries", "map", "expandUseDataSourceEntries", [[]]],
    ["addResolvedLayer", "map", "addResolvedLayer", [[], {}, new Set<string>(), null, "ds"]],
    ["collectLayersFromDataSources", "map", "collectLayersFromDataSources", [jmv, []]],
    ["onActiveViewChange", "map", "onActiveViewChange", [jmv]],
    ["initializeMapConnection", "map", "initializeMapConnection", [jmv]],
    ["toLiveMapLayer", "map", "toLiveMapLayer", [null, null]],
    ["layerKeysMatch", "map", "layerKeysMatch", [null, null]],
    ["resolveFeatureLayerForUseDataSource", "map", "resolveFeatureLayerForUseDataSource", [jmv, null]],

    ["attachMapClick", "click", "attachMapClick", [jmv]],
    ["ensureMapClickAttached", "click", "ensureMapClickAttached", []],
    ["handleXyPageClosed", "click", "handleXyPageClosed", []],
    ["handleMasterFilterChanged", "click", "handleMasterFilterChanged", [new Event("x")]],
    ["handleWidgetSelectionChanged", "click", "handleWidgetSelectionChanged", [new Event("x")]],
    ["openPopupForUniqueid", "click", "openPopupForUniqueid", ["u", { zoom: false }]],
    ["handleSharedMapClick", "click", "handleSharedMapClick", [new Event("x")]],
    ["detachMapClick", "click", "detachMapClick", []],
    ["toClickQueryGeometry", "click", "toClickQueryGeometry", [view, { x: 1, y: 2 }, { x: 3 }]],
    ["findHitGraphic", "click", "findHitGraphic", [null, []]],
    ["pickClickGraphic", "click", "pickClickGraphic", [null, []]],
    ["isHighlightLayer", "click", "isHighlightLayer", [null]],
    ["isLayerEffectivelyVisible", "click", "isLayerEffectivelyVisible", [null, view]],
    ["isAgriculturalFieldLayer", "click", "isAgriculturalFieldLayer", [null]],
    ["isAgriculturalFieldGraphic", "click", "isAgriculturalFieldGraphic", [{} as __esri.Graphic, null]],
    ["getClickTargetLayers", "click", "getClickTargetLayers", [view]],
    ["resolveClickLayers", "click", "resolveClickLayers", [view, jmv]],
    ["resolveClickFeatureAt", "click", "resolveClickFeatureAt", [{} as __esri.ViewClickEvent, view, []]],
    ["findAttributeValueCaseInsensitive", "click", "findAttributeValueCaseInsensitive", [{}, "f"]],
    ["notifyGraffPolygonSelection", "click", "notifyGraffPolygonSelection", ["u", true, 1, 2]],
    ["broadcastPopupVisibility", "click", "broadcastPopupVisibility", [true]],
    ["fetchLatestVegetationIndices", "click", "fetchLatestVegetationIndices", ["u"]],
    ["resolveDisplayAttrs", "click", "resolveDisplayAttrs", [{}]],
    ["onViewClick", "click", "onViewClick", [{} as __esri.ViewClickEvent]],

    ["componentDidMount", "field", "componentDidMount", []],
    ["componentWillUnmount", "field", "componentWillUnmount", []],
    ["fetchAttachmentPreview", "field", "fetchAttachmentPreview", ["url"]],
    ["revokeAllAttachmentUrls", "field", "revokeAllAttachmentUrls", []],
    ["isImageContentType", "field", "isImageContentType", ["image/png"]],
    ["bytesToSize", "field", "bytesToSize", [10]],
    ["loadAttachmentsForOid", "field", "loadAttachmentsForOid", [layer, 3]],
    ["isDateField", "field", "isDateField", ["d"]],
    ["getClickedLayer", "field", "getClickedLayer", []],
    ["resolveFieldName", "field", "resolveFieldName", ["k"]],
    ["normalizeFieldAlias", "field", "normalizeFieldAlias", [null, "n"]],
    ["findFieldMetaOnLayer", "field", "findFieldMetaOnLayer", [null, "n"]],
    ["resolveAliasFromLiveLayers", "field", "resolveAliasFromLiveLayers", ["n"]],
    ["resolveAliasFromDataSourceSchema", "field", "resolveAliasFromDataSourceSchema", ["n", null]],
    ["getFieldAlias", "field", "getFieldAlias", ["n"]],
    ["formatDateSmart", "field", "formatDateSmart", [1]],
    ["formatValue", "field", "formatValue", ["n", 1]],
    ["getOutFields", "field", "getOutFields", [layer, "OID"]],
    ["calculatePopupPosition", "field", "calculatePopupPosition", [{ x: 1, y: 2 }, view]],
    ["componentDidUpdate", "field", "componentDidUpdate", [{}, {}]],
    ["closePopup", "field", "closePopup", [{ restoreExtent: true }]],
    ["minimizePopup", "field", "minimizePopup", []],
    ["expandPopup", "field", "expandPopup", []],
    ["onDataSourceCreated", "field", "onDataSourceCreated", [{}]],
    ["toggleChartExpanded", "field", "toggleChartExpanded", []],
    ["clearChartHover", "field", "clearChartHover", []],
    ["setChartHover", "field", "setChartHover", [2]],
    ["niceChartMax", "field", "niceChartMax", [7]],
    ["formatChartTick", "field", "formatChartTick", [7]],
    ["formatChartTooltipValue", "field", "formatChartTooltipValue", [7]],
    ["buildSmoothLinePath", "field", "buildSmoothLinePath", [[{ x: 1, y: 2 }]]],
    ["buildRoundedBarPath", "field", "buildRoundedBarPath", [1, 2, 3, 4, 5]],

    ["renderChartIcon", "panel", "renderChartIcon", ["line"]],
    ["renderLatestIndices", "panel", "renderLatestIndices", []],
    ["renderChart", "panel", "renderChart", []],
    ["renderPopup", "panel", "renderPopup", []],
    ["render", "panel", "render", []],
  ];

  test.each(table)("%s forwards to %s.%s with the widget as host", (method, module, handler, args) => {
    const w = instance();
    clearAll();
    callOn(w, method, args);
    const stub = mockHandlers[module][handler];
    expect(stub).toHaveBeenCalledTimes(1);
    expect(stub.mock.calls[0][0]).toBe(w);
    expect(stub.mock.calls[0].slice(1, 1 + args.length)).toEqual(args);
  });

  test("returns the handler result unchanged", () => {
    const w = instance();
    expect(w.tr("some.key")).toBe("layout.tr(2)");
    expect(w.getFieldAlias("f")).toBe("field.getFieldAlias(1)");
  });

  test("default arguments are applied for optional parameters", () => {
    const w = instance();
    w.getEffectiveMapBottom({} as __esri.MapView);
    expect(mockHandlers.layout.getEffectiveMapBottom.mock.calls.pop()?.[2]).toBe(4);
    w.popupPositionsEqual(null, { x: 0, y: 0 });
    expect(mockHandlers.layout.popupPositionsEqual.mock.calls.pop()?.[3]).toBe(1);
    w.getPopupDimensions();
    expect(mockHandlers.layout.getPopupDimensions.mock.calls.pop()?.slice(2)).toEqual([false, undefined]);
    w.renderChartIcon();
    expect(mockHandlers.panel.renderChartIcon.mock.calls.pop()?.[1]).toBe("bar");
    w.pruneFeatureQueryCache();
    expect(typeof mockHandlers.layout.pruneFeatureQueryCache.mock.calls.pop()?.[1]).toBe("number");
  });
});
