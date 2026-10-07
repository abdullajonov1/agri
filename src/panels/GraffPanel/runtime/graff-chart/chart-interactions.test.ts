jest.mock("../graff-log", () => ({ graffLog: jest.fn() }));

import type { React } from "jimu-core";
import { createChartInteractions, handleChartPointSelection } from "./chart-interactions";
import type { GraffGraphHost, GraffLineSeries, GraffSeriesByIndex, GraffSeriesPoint } from "./chart-types";
import type { AgriGraffWidgetState } from "../graff-state";

type StatePatch = Partial<AgriGraffWidgetState>;

const makeHost = (state: Partial<AgriGraffWidgetState> = {}): GraffGraphHost => {
  const host = {
    state: { selecteduniqueid: "U1", polygonAvailableDates: [], selectedIndices: ["ndvi"], ...state },
    _vegetationImageLayer: null,
    resolveAgainstAvailableDates: (raw: unknown): string | null =>
      raw instanceof Date ? raw.toISOString().slice(0, 10) : null,
    formatLocalDateYmd: (): string => "",
    applyVegetationImageOverlay: jest.fn((): Promise<void> => Promise.resolve()),
    cancelVegetationImageOverlay: jest.fn(),
  } as unknown as GraffGraphHost;
  host.setState = ((patch: StatePatch): void => {
    host.state = { ...host.state, ...patch };
  }) as GraffGraphHost["setState"];
  return host;
};

const pt = (iso: string, value: number, sourceIndex: number): GraffSeriesPoint => ({
  date: new Date(iso),
  value,
  sourceIndex,
});

const points = [pt("2024-01-01", 0.2, 0), pt("2024-01-11", 0.5, 1), pt("2024-01-21", 0.8, 2)];
const xScale = (_date: Date, sourceIndex = 0): number => sourceIndex * 100;

const seriesByIndex = { ndvi: points } as unknown as GraffSeriesByIndex;
const lineSeries: GraffLineSeries[] = [
  {
    key: "ndvi",
    color: "#0f0",
    path: "",
    areaPath: "",
    points: points.map((p) => ({ ...p, x: p.sourceIndex * 100, y: 50 })),
  },
];

const mouse = (clientX: number, clientY = 50): React.MouseEvent<SVGSVGElement> =>
  ({
    clientX,
    clientY,
    currentTarget: {
      getBoundingClientRect: (): DOMRect => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect,
    },
  }) as unknown as React.MouseEvent<SVGSVGElement>;

const build = (host: GraffGraphHost, isMultiIndexMode = false): ReturnType<typeof createChartInteractions> =>
  createChartInteractions({
    host,
    isMultiIndexMode,
    primaryIndex: "ndvi",
    graphWidth: 200,
    graphHeight: 100,
    dataPoints: points,
    seriesByIndex,
    lineSeries,
    xScale,
  });

describe("handleChartPointSelection", () => {
  test("skips without polygon", () => {
    const host = makeHost({ selecteduniqueid: undefined });
    handleChartPointSelection(host, "ndvi", points[0]);
    expect(host.state.selectedNdviDate).toBeUndefined();
  });

  test("skips when date cannot be resolved", () => {
    const host = makeHost();
    handleChartPointSelection(host, "ndvi", { date: "bad" as unknown as Date, value: 1 });
    expect(host.applyVegetationImageOverlay).not.toHaveBeenCalled();
  });

  test("selects date and requests overlay, then toggles off", () => {
    const host = makeHost();
    handleChartPointSelection(host, "ndvi", points[1]);
    expect(host.state.selectedNdviDate).toBe("2024-01-11");
    expect(host.state.selectedChartIndexKey).toBe("ndvi");
    expect(host.applyVegetationImageOverlay).toHaveBeenCalledWith("U1", "2024-01-11", "ndvi");

    handleChartPointSelection(host, "ndvi", points[1]);
    expect(host.state.selectedNdviDate).toBeNull();
    expect(host.cancelVegetationImageOverlay).toHaveBeenCalled();
  });

  test("same date different index re-requests overlay", () => {
    const host = makeHost({ selectedNdviDate: "2024-01-11", selectedChartIndexKey: "ndvi" });
    handleChartPointSelection(host, "evi", points[1]);
    expect(host.applyVegetationImageOverlay).toHaveBeenCalledWith("U1", "2024-01-11", "evi");
  });
});

describe("createChartInteractions", () => {
  test("mouse move sets tooltip for nearest point; leave clears", () => {
    const host = makeHost();
    const api = build(host);
    api.handleChartMouseMove(mouse(105));
    expect(host.state.chartTooltip?.point.value).toBe(0.5);
    api.handleChartMouseLeave();
    expect(host.state.chartTooltip).toBeNull();
  });

  test("multi-index mouse move clears tooltip", () => {
    const host = makeHost({ chartTooltip: { indexKey: "ndvi", point: { date: new Date(), value: 1 } } });
    build(host, true).handleChartMouseMove(mouse(10));
    expect(host.state.chartTooltip).toBeNull();
  });

  test("findNearestSeriesPoint and setChartTooltipForIndex", () => {
    const host = makeHost();
    const api = build(host);
    expect(api.findNearestSeriesPoint(190, "ndvi")?.value).toBe(0.8);
    expect(api.findNearestSeriesPoint(10, "evi")).toBeNull();
    api.setChartTooltipForIndex("savi", points[0]);
    expect(host.state.chartTooltip?.indexKey).toBe("savi");
  });

  test("click without polygon is ignored", () => {
    const host = makeHost({ selecteduniqueid: undefined });
    build(host).handleChartClick(mouse(0));
    expect(host.applyVegetationImageOverlay).not.toHaveBeenCalled();
  });

  test("single index click selects nearest point", () => {
    const host = makeHost();
    build(host).handleChartClick(mouse(0));
    expect(host.state.selectedNdviDate).toBe("2024-01-01");
  });

  test("multi-index click only selects near a dot", () => {
    const host = makeHost();
    const api = build(host, true);
    api.handleChartClick(mouse(50, 10));
    expect(host.applyVegetationImageOverlay).not.toHaveBeenCalled();
    api.handleChartClick(mouse(200, 50));
    expect(host.state.selectedNdviDate).toBe("2024-01-21");
  });
});
