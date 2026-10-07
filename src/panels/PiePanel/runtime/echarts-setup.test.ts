const mockUse = jest.fn();
const mockInit = jest.fn();
jest.mock("echarts/core", () => ({
  use: (m: unknown): void => { mockUse(m); },
  init: (el: unknown): unknown => mockInit(el),
}));
jest.mock("echarts/charts", () => ({ PieChart: { id: "pie" } }));
jest.mock("echarts/components", () => ({
  LegendComponent: { id: "legend" },
  TitleComponent: { id: "title" },
  TooltipComponent: { id: "tooltip" },
}));
jest.mock("echarts/renderers", () => ({ CanvasRenderer: { id: "canvas" } }));

import {
  initPieChart,
  PIE_ECHARTS_MODULES,
  PIE_REGISTERED_SERIES_TYPES,
  toPieSliceData,
} from "./echarts-setup";

describe("echarts-setup", () => {
  it("registers exactly the pie modules once at import time", () => {
    expect(mockUse).toHaveBeenCalledTimes(1);
    expect(mockUse).toHaveBeenCalledWith([...PIE_ECHARTS_MODULES]);
    expect(PIE_ECHARTS_MODULES).toHaveLength(5);
    expect(PIE_REGISTERED_SERIES_TYPES).toEqual(["pie"]);
  });

  it("initPieChart delegates to echarts.init with the element", () => {
    const chart = { id: "chart" };
    mockInit.mockReturnValue(chart);
    const el = document.createElement("div");
    expect(initPieChart(el)).toBe(chart);
    expect(mockInit).toHaveBeenCalledWith(el);
  });

  describe("toPieSliceData", () => {
    it("reads rawKey and name as strings", () => {
      expect(toPieSliceData({ rawKey: 5, name: "Wheat", extra: 1 })).toEqual({ rawKey: "5", name: "Wheat" });
    });

    it("omits missing fields", () => {
      expect(toPieSliceData({ name: "A" })).toEqual({ name: "A" });
      expect(toPieSliceData({ rawKey: null })).toEqual({});
    });

    it("returns an empty object for non-objects", () => {
      expect(toPieSliceData(undefined)).toEqual({});
      expect(toPieSliceData("x")).toEqual({});
    });
  });
});
