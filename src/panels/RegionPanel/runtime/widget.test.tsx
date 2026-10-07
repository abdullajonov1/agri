jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceComponent: (): null => null,
  DataSourceManager: {},
}));
jest.mock("jimu-arcgis", () => ({ JimuMapViewComponent: (): null => null }));
jest.mock("jimu-ui", () => ({ Button: (): null => null }));

const mockHandlerNames = [
  "componentDidMount",
  "componentWillUnmount",
  "handleDocumentClickForCountFilter",
  "toggleDisplayCountMenu",
  "getCurrentDataLength",
  "getEffectiveDisplayCount",
  "getDisplayCountOptions",
  "resolveDisplayCountForData",
  "handleDisplayCountPillClick",
  "applyDisplayCount",
  "cycleSortMode",
  "syncThemeState",
  "handleAgriV10ThemeChanged",
  "resolveWidgetSize",
  "setupResizeObserver",
  "componentDidUpdate",
  "handleMasterFilterChange",
  "notifyAgriFilter",
  "beginSelectionNotify",
  "onActiveViewChange",
  "resolveFeatureLayerFromUseDataSource",
  "resolveFeatureLayerFromOneUseDataSource",
  "splitLabelTwoLines",
  "calculateDynamicYAxisWidth",
  "resolveFeatureLayersFromUseDataSources",
  "detectAreaField",
  "onDataSourceCreated",
  "normalizeApos",
  "buildWhereForAggregates",
  "buildVhScopedWheres",
  "queryAggregates",
  "fetchRegionalData",
  "fetchRegionalDataDeduped",
  "handleRegionSelectionClick",
  "navigateBack",
  "formatNumber",
  "clampCursorPosition",
  "applyTooltipPosition",
  "bindPointerTracking",
  "unbindPointerTracking",
  "handleGlobalPointerMove",
  "hideCursorTooltip",
  "handleWidgetPointerLeave",
  "handleBarRowClick",
  "handleBarRowPointerEnter",
  "handleBarRowPointerMove",
  "handleBarPointerEnter",
  "handleBarPointerMove",
  "handleChartSurfaceMove",
  "renderCursorTooltipContent",
];

jest.mock("./components/region-handlers", () => {
  const names = mockHandlerNames;
  const mocks: Record<string, unknown> = {};
  for (const n of names) mocks[n] = jest.fn();
  mocks.getClientPoint = jest.requireActual("./components/region/region-nav").getClientPoint;
  return mocks;
});
jest.mock("./components/render-panel", () => ({
  render: jest.fn(() => null),
}));

import { render } from "@testing-library/react";
import { React } from "jimu-core";
import AgriRegion from "./widget";
import * as handlers from "./components/region-handlers";
import { render as renderPanel } from "./components/render-panel";
import type { RegionWidgetProps } from "./region-host";

type Fn = (...a: unknown[]) => unknown;
const handlerMocks = handlers as unknown as Record<string, jest.Mock>;

const makeInstance = (config: Record<string, unknown> = {}): AgriRegion => {
  const ref = React.createRef<AgriRegion>();
  const props = { id: "w", config } as unknown as RegionWidgetProps;
  render(<AgriRegion ref={ref} {...props} />);
  if (!ref.current) throw new Error("widget did not mount");
  return ref.current;
};

describe("AgriRegion widget shell", () => {
  beforeEach(() => {
    for (const n of mockHandlerNames) handlerMocks[n].mockClear();
    (renderPanel as jest.Mock).mockClear();
  });

  it("starts in count mode without a configured area field", () => {
    const w = makeInstance();
    expect(w.state.areaField).toBeNull();
    expect(w.state.statMode).toBe("count");
    expect(w.state.connectionStatus).toBe("idle");
    expect(w.state.displayCount).toBe(15);
    expect(w.state.sortMode).toBe("value_desc");
  });

  it("starts in sum mode with a configured area field", () => {
    const w = makeInstance({ areaField: "maydon" });
    expect(w.state.areaField).toBe("maydon");
    expect(w.state.statMode).toBe("sum");
  });

  it("delegates lifecycle and rendering to the handler modules with itself as host", () => {
    const w = makeInstance();
    expect(handlerMocks.componentDidMount).toHaveBeenCalledWith(w);
    expect(renderPanel).toHaveBeenCalledWith(w);
    w.componentDidUpdate();
    expect(handlerMocks.componentDidUpdate).toHaveBeenCalledWith(w);
  });

  it("delegates every handler with its arguments", () => {
    const w = makeInstance();
    const ev = new Event("x");
    const me = new MouseEvent("mousemove");
    const row = { name: "A", maydon: 1 };
    const rm = {} as React.MouseEvent<HTMLButtonElement>;
    const calls: Array<[string, Fn, unknown[]]> = [
      ["handleDocumentClickForCountFilter", w.handleDocumentClickForCountFilter as Fn, [me]],
      ["toggleDisplayCountMenu", w.toggleDisplayCountMenu as Fn, []],
      ["getCurrentDataLength", w.getCurrentDataLength as Fn, []],
      ["getEffectiveDisplayCount", w.getEffectiveDisplayCount as Fn, []],
      ["getDisplayCountOptions", w.getDisplayCountOptions as Fn, []],
      ["resolveDisplayCountForData", w.resolveDisplayCountForData as Fn, [7]],
      ["handleDisplayCountPillClick", w.handleDisplayCountPillClick as Fn, [5]],
      ["applyDisplayCount", w.applyDisplayCount as Fn, [5]],
      ["cycleSortMode", w.cycleSortMode as Fn, []],
      ["syncThemeState", w.syncThemeState as Fn, []],
      ["handleAgriV10ThemeChanged", w.handleAgriV10ThemeChanged as Fn, [ev]],
      ["resolveWidgetSize", w.resolveWidgetSize as Fn, [400]],
      ["setupResizeObserver", w.setupResizeObserver as Fn, []],
      ["handleMasterFilterChange", w.handleMasterFilterChange as Fn, [ev]],
      ["notifyAgriFilter", w.notifyAgriFilter as Fn, [{ viloyat: "A" }, 3]],
      ["beginSelectionNotify", w.beginSelectionNotify as Fn, []],
      ["onActiveViewChange", w.onActiveViewChange as Fn, [{}]],
      ["resolveFeatureLayerFromUseDataSource", w.resolveFeatureLayerFromUseDataSource as Fn, [{}]],
      ["resolveFeatureLayerFromOneUseDataSource", w.resolveFeatureLayerFromOneUseDataSource as Fn, [{ dataSourceId: "d" }, {}]],
      ["splitLabelTwoLines", w.splitLabelTwoLines as Fn, ["L"]],
      ["calculateDynamicYAxisWidth", w.calculateDynamicYAxisWidth as Fn, []],
      ["resolveFeatureLayersFromUseDataSources", w.resolveFeatureLayersFromUseDataSources as Fn, [{}]],
      ["detectAreaField", w.detectAreaField as Fn, [{}]],
      ["onDataSourceCreated", w.onDataSourceCreated as Fn, [{}]],
      ["normalizeApos", w.normalizeApos as Fn, ["s"]],
      ["buildWhereForAggregates", w.buildWhereForAggregates.bind(w) as Fn, ["tuman", "A"]],
      ["buildVhScopedWheres", w.buildVhScopedWheres as Fn, ["W"]],
      ["queryAggregates", w.queryAggregates as Fn, ["viloyat", "W", "region"]],
      ["fetchRegionalData", w.fetchRegionalData as Fn, []],
      ["fetchRegionalDataDeduped", w.fetchRegionalDataDeduped as Fn, []],
      ["handleRegionSelectionClick", w.handleRegionSelectionClick as Fn, [{ name: "A" }, 1, undefined]],
      ["navigateBack", w.navigateBack as Fn, []],
      ["formatNumber", w.formatNumber as Fn, [5, 2]],
      ["clampCursorPosition", w.clampCursorPosition as Fn, [1, 2]],
      ["applyTooltipPosition", w.applyTooltipPosition as Fn, [1, 2]],
      ["bindPointerTracking", w.bindPointerTracking as Fn, []],
      ["unbindPointerTracking", w.unbindPointerTracking as Fn, []],
      ["handleGlobalPointerMove", w.handleGlobalPointerMove as Fn, [me]],
      ["hideCursorTooltip", w.hideCursorTooltip as Fn, []],
      ["handleWidgetPointerLeave", w.handleWidgetPointerLeave as Fn, []],
      ["handleBarRowClick", w.handleBarRowClick as Fn, [row]],
      ["handleBarRowPointerEnter", w.handleBarRowPointerEnter as Fn, [row, rm]],
      ["handleBarRowPointerMove", w.handleBarRowPointerMove as Fn, [row, rm]],
      ["handleBarPointerEnter", w.handleBarPointerEnter as Fn, [row, 0, rm]],
      ["handleBarPointerMove", w.handleBarPointerMove as Fn, [row, 0, rm]],
      ["handleChartSurfaceMove", w.handleChartSurfaceMove as Fn, [{}]],
      ["renderCursorTooltipContent", w.renderCursorTooltipContent as Fn, [row]],
    ];
    for (const [name, fn, args] of calls) {
      fn(...args);
      expect(handlerMocks[name]).toHaveBeenCalledWith(w, ...args);
    }
  });

  it("unmount delegates to componentWillUnmount", () => {
    const ref = React.createRef<AgriRegion>();
    const { unmount } = render(<AgriRegion ref={ref} {...({ id: "w" } as unknown as RegionWidgetProps)} />);
    const instance = ref.current;
    unmount();
    expect(handlerMocks.componentWillUnmount).toHaveBeenCalledWith(instance);
  });

  it("exposes the static debug logger", () => {
    expect(() => AgriRegion.regionLog("phase", { a: 1 })).not.toThrow();
  });

  // Fixed bug: widget.tsx getClientPoint forwards `args` as ONE array argument
  // (getClientPoint(this, args)) instead of spreading it, so the nav helper
  // never finds clientX/clientY and the cursor tooltip is always positioned
  // from (0, 0).
  it("getClientPoint reads coordinates from the event arguments", () => {
    const w = makeInstance();
    expect(w.getClientPoint({ clientX: 7, clientY: 8 })).toEqual({ x: 7, y: 8 });
  });
});
