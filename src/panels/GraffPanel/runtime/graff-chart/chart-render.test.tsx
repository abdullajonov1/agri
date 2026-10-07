jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
// Source uses `import ReactDOM from "react-dom"` (webpack synthetic default);
// ts-jest has no esModuleInterop, so expose the CJS module as `default` too.
jest.mock("react-dom", () => {
  const actual: Record<string, unknown> = jest.requireActual("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("../../../../gis/agri-vegetation-data-source", () => ({
  formatArcgisDateToYmd: (): string | null => null,
}));

import { React } from "jimu-core";
import { fireEvent, render } from "@testing-library/react";
import { renderChartDefs } from "./chart-svg-defs";
import { renderChartGrid, renderCrosshair, renderMonthTicks } from "./chart-axes";
import { renderLineSeries } from "./chart-series";
import { renderDateRangeSlider, renderFloatingTooltip } from "./chart-overlays";
import type { GraffChartRenderCtx } from "./chart-render-ctx";
import type { GraffChartDateRange } from "./chart-geometry";
import type { GraffGraphHost, GraffLineSeries } from "./chart-types";
import type { AgriGraffWidgetState } from "../graff-state";

type StatePatch = Partial<AgriGraffWidgetState>;

const series: GraffLineSeries[] = [
  {
    key: "ndvi",
    color: "#00d084",
    path: "M 0 0 L 10 10",
    areaPath: "M 0 0 Z",
    points: [
      { x: 60, y: 40, value: 0.5, date: new Date("2024-01-01T00:00:00Z"), sourceIndex: 0, min: 0.2, max: 0.7 },
      { x: 120, y: 30, value: 0.6, date: new Date("2024-01-11T00:00:00Z"), sourceIndex: 1 },
    ],
  },
];

const makeHost = (state: StatePatch = {}): GraffGraphHost => {
  const wrap = document.createElement("div");
  wrap.getBoundingClientRect = (): DOMRect => ({ left: 10, top: 200, width: 300, height: 150 }) as DOMRect;
  const host = {
    state: {
      polygonAvailableDates: [],
      isDarkTheme: false,
      chartAnimKey: 1,
      selectedChartIndexKey: "ndvi",
      ...state,
    },
    graphSvgWrapRef: { current: wrap },
    resolveAgainstAvailableDates: (): string | null => null,
    formatLocalDateYmd: (d: Date): string => d.toISOString().slice(0, 10),
  } as unknown as GraffGraphHost;
  host.setState = jest.fn((patch: StatePatch): void => {
    host.state = { ...host.state, ...patch };
  }) as unknown as GraffGraphHost["setState"];
  return host;
};

const makeCtx = (overrides: Partial<GraffChartRenderCtx> = {}): GraffChartRenderCtx => ({
  host: makeHost(),
  language: "en",
  layout: {
    graphWidth: 400,
    graphHeight: 200,
    isNarrow: false,
    compactChart: false,
    padding: { top: 10, right: 10, bottom: 30, left: 50 },
    chartWidth: 340,
    chartHeight: 160,
    monthTickY: 190,
    lineStrokeWidth: 2,
    axisTickFont: 11,
    monthTickFont: 10,
  },
  theme: { themeText: "#111", themeGrid: "#ccc" },
  isIpadLayout: false,
  isMultiIndexMode: false,
  finalIndices: ["ndvi"],
  indexColorMap: { ndvi: "#00d084", savi: "#1", rvi: "#2", ci: "#3", evi: "#4", ndwi: "#5" },
  scales: { xScale: (_d: Date, i = 0): number => 60 + i * 60, yScale: (v: number): number => 170 - v * 160 },
  lineSeries: series,
  yAxisTickValues: [0, 0.5, 1, 5],
  selectionGuide: null,
  chartTooltip: null,
  selectedNdviDate: null,
  interactions: {
    setChartTooltipForIndex: jest.fn(),
    findNearestSeriesPoint: jest.fn(() => ({ date: new Date(), value: 1, sourceIndex: 0 })),
    handleChartMouseMove: jest.fn(),
    handleChartMouseLeave: jest.fn(),
    handleChartClick: jest.fn(),
  },
  ...overrides,
});

const inSvg = (node: React.ReactNode): ReturnType<typeof render> => render(<svg>{node}</svg>);

describe("renderChartDefs", () => {
  test("renders a gradient per series and glow filters", () => {
    const { container } = inSvg(renderChartDefs(series));
    expect(container.querySelector("#areaFill-ndvi")).not.toBeNull();
    expect(container.querySelector("#lineGlow")).not.toBeNull();
    expect(container.querySelector("#dotGlow")).not.toBeNull();
  });
});

describe("chart axes", () => {
  test("grid renders in-plot tick labels only", () => {
    const { container } = inSvg(renderChartGrid(makeCtx()));
    const labels = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(labels).toEqual(["0.00", "0.50", "1.00"]);
  });

  test("selection extrema replace nearby tick labels", () => {
    const ctx = makeCtx({
      selectionGuide: { indexKey: "ndvi", point: { date: new Date(), value: 0.6, min: 0.5, max: 1.0 } },
    });
    const { container } = inSvg(renderChartGrid(ctx));
    expect(container.querySelector(".graph-y-sel-extremum--max")).not.toBeNull();
    expect(container.querySelector(".graph-y-sel-extremum--min")).not.toBeNull();
    const plainTicks = Array.from(container.querySelectorAll("g > g:not([class]) > text")).map((t) => t.textContent);
    expect(plainTicks).toEqual(["0.00"]);
  });

  test("month ticks rotate daily labels", () => {
    const ctx = makeCtx();
    const { container } = inSvg(
      <>{renderMonthTicks(ctx, [{ x: 10, label: "Jan", daily: false }, { x: 20, label: "05", daily: true }] as never)}</>,
    );
    const texts = container.querySelectorAll("text");
    expect(texts).toHaveLength(2);
    expect(texts[1].getAttribute("transform")).toContain("rotate");
    expect(texts[0].getAttribute("transform")).toBeNull();
  });

  test("crosshair draws value/min/max markers", () => {
    const ctx = makeCtx();
    const guide = { indexKey: "ndvi" as const, point: { date: new Date(), value: 0.5, min: 0.1, max: 0.9, sourceIndex: 1 } };
    const { container } = inSvg(renderCrosshair(ctx, guide, "selection"));
    expect(container.querySelector(".graph-crosshair--selection")).not.toBeNull();
    expect(container.querySelectorAll("line")).toHaveLength(4);
    const hover = inSvg(renderCrosshair(ctx, { ...guide, point: { date: new Date(), value: 0.5 } }, "hover"));
    expect(hover.container.querySelectorAll("line")).toHaveLength(2);
  });
});

describe("renderLineSeries", () => {
  test("renders paths, area fill and dots (light theme ring)", () => {
    const { container } = inSvg(<>{renderLineSeries(makeCtx())}</>);
    expect(container.querySelectorAll("path.graff-line-path")).toHaveLength(2);
    expect(container.querySelector('path[fill="url(#areaFill-ndvi)"]')).not.toBeNull();
    expect(container.querySelectorAll(".graff-line-dot")).toHaveLength(2);
    expect(container.querySelectorAll(".graff-line-dot-ring")).toHaveLength(2);
    expect(container.querySelector("title")?.textContent).toContain("NDVI: 0.5000");
  });

  test("multi-index hover on line and dot sets tooltip", () => {
    const host = makeHost({ isDarkTheme: true });
    const ctx = makeCtx({ host, isMultiIndexMode: true, isIpadLayout: true, finalIndices: ["ndvi", "evi", "ci"] });
    const { container } = inSvg(<>{renderLineSeries(ctx)}</>);
    expect(container.querySelector(".graff-line-dot-ring")).toBeNull();
    expect(container.querySelector('path[fill="url(#areaFill-ndvi)"]')).toBeNull();
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.getBoundingClientRect = (): DOMRect => ({ left: 0, top: 0, width: 400, height: 200 }) as DOMRect;
    fireEvent.mouseMove(container.querySelectorAll("path.graff-line-path")[1], { clientX: 100 });
    expect(ctx.interactions.findNearestSeriesPoint).toHaveBeenCalled();
    fireEvent.mouseMove(container.querySelector(".graff-line-dot-group") as Element);
    expect(ctx.interactions.setChartTooltipForIndex).toHaveBeenCalledTimes(2);
  });

  test("active selected date dot", () => {
    const ctx = makeCtx({ selectedNdviDate: "2024-01-11" });
    const { container } = inSvg(<>{renderLineSeries(ctx)}</>);
    expect(container.querySelectorAll(".graff-line-dot")).toHaveLength(2);
  });
});

describe("chart overlays", () => {
  const range = {
    lastRangeIndex: 4,
    effectiveRangeStart: 1,
    effectiveRangeEnd: 3,
    rangeStartPercent: 25,
    rangeEndPercent: 75,
    rangeStartDate: "2024-01-01",
    rangeEndDate: "2024-03-01",
  } as unknown as GraffChartDateRange<unknown>;

  test("date range slider clamps start/end changes", () => {
    const host = makeHost();
    const { getByLabelText } = render(renderDateRangeSlider(host, range));
    fireEvent.change(getByLabelText("Start date"), { target: { value: "4" } });
    expect(host.state.dateRangeStartIndex).toBe(3);
    fireEvent.change(getByLabelText("End date"), { target: { value: "0" } });
    expect(host.state.dateRangeEndIndex).toBe(1);
  });

  test("floating tooltip portal renders values", () => {
    const ctx = makeCtx({
      chartTooltip: { indexKey: "ndvi", point: { date: new Date("2024-01-11"), value: 0.6, max: 0.9, sourceIndex: 1 } },
    });
    const { unmount } = render(<div>{renderFloatingTooltip(ctx)}</div>);
    const tip = document.body.querySelector(".graff-chart-tooltip") as HTMLElement;
    expect(tip).not.toBeNull();
    expect(tip.className).toContain("--light");
    expect(tip.textContent).toContain("0.6000");
    expect(tip.textContent).toContain("0.9000");
    expect(tip.textContent).toContain("—");
    unmount();
  });

  test("floating tooltip is null without tooltip or wrap", () => {
    expect(renderFloatingTooltip(makeCtx())).toBeNull();
    const host = makeHost();
    (host.graphSvgWrapRef as { current: HTMLDivElement | null }).current = null;
    expect(
      renderFloatingTooltip(
        makeCtx({ host, chartTooltip: { indexKey: "ndvi", point: { date: new Date(), value: 1 } } }),
      ),
    ).toBeNull();
  });
});
