jest.mock("../../echarts-setup", () => ({
  toPieSliceData: (data: unknown): { name?: string } =>
    data && typeof data === "object" && "name" in data ? { name: String((data as { name: unknown }).name) } : {},
}));
const mockMappings = jest.fn();
jest.mock("../../../../../gis/agri-table-data-source", () => ({
  queryAgriRegionDistrictMappings: (): unknown => mockMappings(),
}));

import type { PieWidgetHost } from "../../pie-host";
import type { PieEChartsOption } from "../../echarts-setup";
import {
  applyCategoryFilter,
  handleSliceClick,
  resolveNdviDateForVhPie,
  resolveRegionDistrictForPie,
  updatePieChart,
} from "./pie-data-chart";

type PieState = PieWidgetHost["state"];
type StatePatch = Partial<PieState>;

interface ChartDatum {
  name: string;
  rawKey?: string;
  value: number;
  percentage?: number;
}

interface PieSeries {
  silent: boolean;
  cursor: string;
  animationDurationUpdate?: number;
  itemStyle: { borderWidth: number; borderRadius: number };
  data: Array<{ selected: boolean; itemStyle: { opacity: number; borderWidth: number } }>;
}

const makeHost = (state: StatePatch = {}, chartData: ChartDatum[] = []): {
  host: PieWidgetHost;
  setOption: jest.Mock;
  dispatchAction: jest.Mock;
} => {
  const setOption = jest.fn();
  const dispatchAction = jest.fn();
  const chart = { setOption, dispatchAction };
  const host = {
    state: { selectedCategories: [], viloyat: "", lockedViloyat: "", isDarkTheme: false, ...state },
    _pieHasRendered: false,
    _pieChart: chart,
    ensurePieChart: (): unknown => chart,
    getChartDataForPie: (): ChartDatum[] => chartData,
    normalizeName: (s: string): string => String(s || "").trim().toLowerCase(),
    getSliceBorderColor: (): string => "#fff",
    isIpadLayout: (): boolean => false,
    getCropColor: (): string => "#123456",
    schedulePieChartResize: jest.fn(),
    cropIdsToTuriNames: (ids: string[]): string[] => ids.map((id) => `T${id}`),
    makeViloyatKey: (s: string | null | undefined): string => String(s || "").trim().toLowerCase(),
  } as unknown as PieWidgetHost;
  host.setState = ((patch: StatePatch, cb?: () => void): void => {
    host.state = { ...host.state, ...patch };
    cb?.();
  }) as PieWidgetHost["setState"];
  return { host, setOption, dispatchAction };
};

const seriesOf = (setOption: jest.Mock, call = 0): PieSeries =>
  ((setOption.mock.calls[call][0] as PieEChartsOption).series as unknown as PieSeries[])[0];

describe("updatePieChart", () => {
  test("no chart -> no-op", () => {
    const { host } = makeHost();
    host.ensurePieChart = (): null => null;
    expect(() => updatePieChart(host)).not.toThrow();
  });

  test("first render: non-interactive, full replace, single slice has no border", () => {
    const { host, setOption } = makeHost({}, [{ name: "Paxta", value: 10 }, { name: "Empty", value: 0 }]);
    updatePieChart(host);
    const [option, opts] = setOption.mock.calls[0] as [PieEChartsOption, Record<string, unknown>];
    expect(opts).toEqual({ notMerge: true, lazyUpdate: false });
    expect(option.animation).toBe(true);
    const s = seriesOf(setOption);
    expect(s.silent).toBe(true);
    expect(s.cursor).toBe("default");
    expect(s.itemStyle.borderWidth).toBe(0);
    expect(s.data[1].itemStyle.opacity).toBe(0);
    expect(host._pieHasRendered).toBe(true);
    expect(host.schedulePieChartResize).toHaveBeenCalled();
  });

  test("data update merges series; selection dims others", () => {
    const data = Array.from({ length: 9 }, (_v, i) => ({ name: `C${i}`, rawKey: `c${i}`, value: i + 1 }));
    const { host, setOption } = makeHost({ viloyat: "V", selectedCategories: ["c1"] }, data);
    host._pieHasRendered = true;
    updatePieChart(host, "data");
    expect(setOption.mock.calls[0][1]).toEqual({ notMerge: false, replaceMerge: ["series"], lazyUpdate: false });
    const s = seriesOf(setOption);
    expect(s.silent).toBe(false);
    expect(s.itemStyle.borderWidth).toBe(1);
    expect(s.itemStyle.borderRadius).toBe(6);
    expect(s.data[1].selected).toBe(true);
    expect(s.data[0].itemStyle.opacity).toBe(0.28);

    updatePieChart(host, "selection");
    expect(setOption.mock.calls[1][1]).toEqual({ notMerge: false, lazyUpdate: false });
    expect((setOption.mock.calls[1][0] as PieEChartsOption).animation).toBe(false);
  });

  test("many slices use smallest radius; tooltip formatter returns name", () => {
    const data = Array.from({ length: 12 }, (_v, i) => ({ name: `C${i}`, value: 1 }));
    const { host, setOption } = makeHost({ isDarkTheme: true }, data);
    updatePieChart(host);
    expect(seriesOf(setOption).itemStyle.borderRadius).toBe(4);
    const tooltip = (setOption.mock.calls[0][0] as PieEChartsOption).tooltip as {
      formatter: (p: unknown) => string;
      backgroundColor: string;
    };
    expect(tooltip.backgroundColor).toBe("#1f2030");
    expect(tooltip.formatter({ name: " Paxta " })).toBe("Paxta");
    expect(tooltip.formatter({ data: { name: "X" } })).toBe("X");
    expect(tooltip.formatter(null)).toBe("");
  });
});

describe("handleSliceClick", () => {
  test("ignored without viloyat or name", () => {
    const { host } = makeHost();
    handleSliceClick(host, { name: "A" }, 0);
    expect(host.state.selectedCategories).toEqual([]);
    const withV = makeHost({ viloyat: "V" }).host;
    handleSliceClick(withV, {}, 0);
    expect(withV.state.selectedCategories).toEqual([]);
  });

  test("toggles selection and broadcasts", () => {
    const { host } = makeHost({ viloyat: "V" });
    const listener = jest.fn();
    document.addEventListener("widgetSelectionChanged", listener);
    handleSliceClick(host, { rawKey: "7" }, 2);
    expect(host.state.selectedCategories).toEqual(["7"]);
    expect(host.state.activeSlice).toBe(2);
    expect(host.state.turi).toBe("7");
    const detail = (listener.mock.calls[0][0] as CustomEvent<{ turi: string; turlar: string[] }>).detail;
    expect(detail.turi).toBe("T7");
    handleSliceClick(host, { rawKey: "8" }, 3);
    expect(host.state.turi).toBe("");
    handleSliceClick(host, { rawKey: "7" }, 2);
    expect(host.state.selectedCategories).toEqual(["8"]);
    expect(host.state.activeSlice).toBeNull();
    document.removeEventListener("widgetSelectionChanged", listener);
  });

  test("iPad shows tooltip after click", () => {
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    });
    const { host, dispatchAction } = makeHost({ lockedViloyat: "V" });
    host.isIpadLayout = (): boolean => true;
    handleSliceClick(host, { name: "A" }, 4);
    expect(dispatchAction).toHaveBeenCalledWith({ type: "showTip", seriesIndex: 0, dataIndex: 4 });
    raf.mockRestore();
  });
});

test("applyCategoryFilter dispatches categoryFilterChanged", async () => {
  const { host } = makeHost({ selectedCategories: ["1"], yil: "2024" } as unknown as StatePatch);
  const listener = jest.fn();
  document.addEventListener("categoryFilterChanged", listener);
  await applyCategoryFilter(host);
  document.removeEventListener("categoryFilterChanged", listener);
  const detail = (listener.mock.calls[0][0] as CustomEvent<{ turi: string; yil: string }>).detail;
  expect(detail).toEqual(expect.objectContaining({ turi: "T1", yil: "2024", source: "AgriPie" }));
});

test("resolveNdviDateForVhPie prefers explicit then field name", () => {
  expect(resolveNdviDateForVhPie(makeHost({ ndviDate: " 2024-05-01 " } as unknown as StatePatch).host)).toBe("2024-05-01");
  expect(
    resolveNdviDateForVhPie(makeHost({ barCategoryField: "ndvi_status_2024_06_15" } as unknown as StatePatch).host),
  ).toBe("2024-06-15");
  expect(resolveNdviDateForVhPie(makeHost().host)).toBe("");
});

describe("resolveRegionDistrictForPie", () => {
  test("empty without viloyat", async () => {
    await expect(resolveRegionDistrictForPie(makeHost().host)).resolves.toEqual({});
  });

  test("picks highest-vote region and district", async () => {
    mockMappings.mockResolvedValue([
      { viloyat: "Sirdaryo", region: 1, tuman: "A", district: 11, count: 2 },
      { viloyat: "Sirdaryo", region: 2, tuman: "A", district: 12, count: 5 },
      { viloyat: "Sirdaryo", region: 3, tuman: "B", district: 13, count: null },
      { viloyat: "Xorazm", region: 9, tuman: "A", district: 99, count: 100 },
    ]);
    const { host } = makeHost({ viloyat: "Sirdaryo", tuman: "A" } as unknown as StatePatch);
    await expect(resolveRegionDistrictForPie(host)).resolves.toEqual({ region: 2, district: 12 });
    const noTuman = makeHost({ lockedViloyat: "Sirdaryo" } as unknown as StatePatch).host;
    await expect(resolveRegionDistrictForPie(noTuman)).resolves.toEqual({ region: 2, district: undefined });
  });
});
