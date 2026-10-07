const mockInitPieChart = jest.fn();
jest.mock("../../echarts-setup", () => ({
  initPieChart: (el: HTMLElement): unknown => mockInitPieChart(el),
  toPieSliceData: (data: unknown): { name?: string; rawKey?: string } =>
    data && typeof data === "object" ? (data as { name?: string; rawKey?: string }) : {},
}));
const mockBindMasterFilter = jest.fn();
jest.mock("../../../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (cb: unknown): unknown => mockBindMasterFilter(cb),
}));
const mockStatsCached = jest.fn();
jest.mock("../../../../../data/agri-stats-store", () => ({
  getPieCategoryStatsCached: (args: unknown): unknown => mockStatsCached(args),
}));
jest.mock("../../../../../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));
jest.mock("../../../../../gis/agri-chart-filter-order", () => ({
  getPieVhFilterUniqueIdsSig: (): string => "SIG",
}));

import type { PieWidgetHost } from "../../pie-host";
import type { AgriPieProps, AgriPieState } from "../../widget";
import {
  attachPieResizeObserver,
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
  detachPieResizeObserver,
  ensurePieChart,
  findAreaStatisticField,
  formatCenterArea,
  formatCenterPercent,
  getCenterAllLabel,
  getChartDataForPie,
  getPieCenterContent,
  handleMasterFilterChange,
  handleResize,
  isIpadLayout,
  queryCategoryStatsJSON,
  schedulePieChartResize,
  selectCategoryByName,
  updateFiltersFromProps,
} from "./pie-data-events";

type StatePatch = Partial<AgriPieState>;

const baseState = (patch: StatePatch = {}): AgriPieState =>
  ({
    loading: false,
    error: null,
    categoryData: { categories: [], totalValue: 0 },
    vh: "",
    ndviDate: "",
    barCategoryField: null,
    barCategoryValue: null,
    yil: "2025",
    viloyat: "",
    lockedViloyat: "",
    tuman: "",
    turi: "",
    turlar: [],
    filterPieByVh: false,
    pieVhUniqueIdsSig: "",
    farmerInn: "",
    activeSlice: null,
    selectedCategory: null,
    selectedCategories: [],
    hoveredSlice: null,
    isHandlingExternalEvent: false,
    mapConnectionAttempts: 0,
    mapLoadingStatus: "idle",
    connectionStatus: "idle",
    debugInfo: "",
    language: "ru",
    isDarkTheme: false,
    lastFilterEventTimestamp: 0,
    ...patch,
  }) as AgriPieState;

const makeHost = (state: StatePatch = {}, overrides: Partial<PieWidgetHost> = {}): PieWidgetHost => {
  const host = {
    props: {} as AgriPieProps,
    state: baseState(state),
    _cropMapsReady: true,
    _isMounted: true,
    CONNECTION_TIMEOUT_MS: 1000,
    MAX_CONNECTION_ATTEMPTS: 3,
    normalizeName: (s: string): string => String(s || "").trim().toLowerCase(),
    turiNamesToCropIds: (names: string[]): string[] => names,
    getFeatureLayerForViloyat: jest.fn(() => undefined),
    getDefaultFeatureLayer: jest.fn(() => undefined),
    fetchCategoryData: jest.fn(),
    ensureCropIdMaps: jest.fn(() => Promise.resolve()),
    initializeTheme: jest.fn(),
    updatePieChart: jest.fn(),
    schedulePieChartResize: jest.fn(),
    initializeAfterConnection: jest.fn(),
    updateFiltersFromProps: jest.fn(),
    handleMasterFilterChange: jest.fn(),
    handleThemeToggled: jest.fn(),
    handleResize: jest.fn(),
    detachPieResizeObserver: jest.fn(),
    attachPieResizeObserver: jest.fn(),
    handleSliceClick: jest.fn(),
    forceUpdate: jest.fn(),
    getCategoryDisplayName: (k: string): string => `N:${k}`,
    getCenterAllLabel: (): string => "ALL",
    isIpadLayout: (): boolean => false,
    ...overrides,
  } as unknown as PieWidgetHost;
  host.setState = ((patch: StatePatch | ((p: AgriPieState) => StatePatch), cb?: () => void): void => {
    const p = typeof patch === "function" ? patch(host.state) : patch;
    host.state = { ...host.state, ...p };
    cb?.();
  }) as PieWidgetHost["setState"];
  return host;
};

const filterEvent = (detail: unknown): Event => new CustomEvent("masterFilterChanged", { detail });

describe("handleMasterFilterChange", () => {
  it("ignores events without filters", () => {
    const host = makeHost();
    handleMasterFilterChange(host, filterEvent({}));
    expect(host.fetchCategoryData).not.toHaveBeenCalled();
  });

  it("defers until crop maps are ready, then re-dispatches", async () => {
    const host = makeHost({}, { _cropMapsReady: false });
    const ev = filterEvent({ filters: { yil: "2024" } });
    handleMasterFilterChange(host, ev);
    await Promise.resolve();
    await Promise.resolve();
    expect(host.handleMasterFilterChange).toHaveBeenCalledWith(ev);
  });

  it("does not re-dispatch after unmount while waiting for crop maps", async () => {
    const host = makeHost({}, { _cropMapsReady: false });
    handleMasterFilterChange(host, filterEvent({ filters: { yil: "2024" } }));
    host._isMounted = false;
    await Promise.resolve();
    await Promise.resolve();
    expect(host.handleMasterFilterChange).not.toHaveBeenCalled();
  });

  it("does nothing when nothing changed", () => {
    const host = makeHost();
    handleMasterFilterChange(host, filterEvent({ filters: { yil: "2025" } }));
    expect(host.fetchCategoryData).not.toHaveBeenCalled();
  });

  it("parent change resets selection, normalizes names and fetches", () => {
    const host = makeHost({ turlar: ["a"], selectedCategories: ["a"] });
    handleMasterFilterChange(
      host,
      filterEvent({ filters: { yil: "2024", viloyat: " Andijon ", tuman: "X" }, scope: { lockedViloyat: "Sirdaryo" } }),
    );
    expect(host.state.yil).toBe("2024");
    expect(host.state.viloyat).toBe("andijon");
    expect(host.state.tuman).toBe("x");
    expect(host.state.lockedViloyat).toBe("sirdaryo");
    expect(host.state.selectedCategories).toEqual([]);
    expect(host.state.activeSlice).toBeNull();
    expect(host.getFeatureLayerForViloyat).toHaveBeenCalledWith("andijon");
    expect(host.fetchCategoryData).toHaveBeenCalledTimes(1);
  });

  it("clears locked viloyat when scope sends a falsy value and uses default layer", () => {
    const host = makeHost({ lockedViloyat: "x" });
    handleMasterFilterChange(host, filterEvent({ filters: { yil: "2025" }, scope: { lockedViloyat: "" } }));
    expect(host.state.lockedViloyat).toBe("");
    expect(host.getDefaultFeatureLayer).toHaveBeenCalled();
  });

  it("crop-only change keeps selection and computes activeSlice", () => {
    const host = makeHost({
      categoryData: {
        categories: [
          { key: "Wheat", value: 1, percentage: 50 },
          { key: "Corn", value: 1, percentage: 50 },
        ],
        totalValue: 2,
      },
    });
    handleMasterFilterChange(host, filterEvent({ filters: { turlar: ["corn"] } }));
    expect(host.state.turlar).toEqual(["corn"]);
    expect(host.state.turi).toBe("corn");
    expect(host.state.selectedCategory).toBe("corn");
    expect(host.state.activeSlice).toBe(1);
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  it("falls back to single turi and yields activeSlice null when no category matches", () => {
    const host = makeHost();
    handleMasterFilterChange(host, filterEvent({ filters: { turi: "Rice" } }));
    expect(host.state.turlar).toEqual(["rice"]);
    expect(host.state.activeSlice).toBeNull();
  });

  it("empty turi clears crop selection", () => {
    const host = makeHost({ turlar: ["rice"] });
    handleMasterFilterChange(host, filterEvent({ filters: { turi: "" } }));
    expect(host.state.turlar).toEqual([]);
    expect(host.state.turi).toBe("");
  });

  it("bar/vh/language/filterPieByVh fields update state", () => {
    const host = makeHost({ barCategoryValue: "old" });
    handleMasterFilterChange(
      host,
      filterEvent({
        filters: {
          vh: "VH1",
          ndviDate: "2025-06-01",
          filterPieByVh: true,
          farmerInn: " 123 ",
          barCategoryField: "status",
          language: "en",
        },
      }),
    );
    expect(host.state.vh).toBe("VH1");
    expect(host.state.barCategoryValue).toBeNull();
    expect(host.state.barCategoryField).toBe("status");
    expect(host.state.ndviDate).toBe("2025-06-01");
    expect(host.state.pieVhUniqueIdsSig).toBe("SIG");
    expect(host.state.farmerInn).toBe("123");
    expect(host.state.language).toBe("en");
  });

  it("explicit barCategoryValue is kept even with vh and invalid language falls back", () => {
    const host = makeHost();
    handleMasterFilterChange(
      host,
      filterEvent({ filters: { vh: "V", barCategoryValue: "z", language: "xx" } }),
    );
    expect(host.state.barCategoryValue).toBe("z");
    expect(host.state.language).toBe("ru");
  });
});

describe("componentDidMount / WillUnmount", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockBindMasterFilter.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it("wires listeners and unbinds them on unmount", () => {
    const unbind = jest.fn();
    mockBindMasterFilter.mockReturnValue(unbind);
    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const host = makeHost({}, { _isMounted: false });
    componentDidMount(host);
    expect(host._isMounted).toBe(true);
    expect(host.initializeTheme).toHaveBeenCalled();
    expect(host.updatePieChart).toHaveBeenCalledWith("data");
    expect(addSpy).toHaveBeenCalledWith("agriV11ThemeToggled", host.handleThemeToggled);
    expect(host.state.debugInfo).toBe("Widget mounted");

    const dispose = jest.fn();
    host._pieChart = { dispose } as unknown as PieWidgetHost["_pieChart"];
    host._fetchDebounceTimer = setTimeout(() => undefined, 5000);
    componentWillUnmount(host);
    expect(host._isMounted).toBe(false);
    expect(unbind).toHaveBeenCalled();
    expect(host._unbindMasterFilter).toBeNull();
    expect(removeSpy).toHaveBeenCalledWith("agriV11ThemeToggled", host.handleThemeToggled);
    expect(host.detachPieResizeObserver).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalled();
    expect(host._pieChart).toBeNull();
    expect(host._pieStableKeys).toEqual([]);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("proceeds after timeout when connection is still loading", () => {
    mockBindMasterFilter.mockReturnValue(jest.fn());
    const host = makeHost({ mapLoadingStatus: "loading" });
    componentDidMount(host);
    host.state = { ...host.state, mapLoadingStatus: "loading" };
    jest.advanceTimersByTime(1001);
    expect(host.state.connectionStatus).toBe("connected");
    expect(host.state.debugInfo).toBe("Timeout reached, proceeding");
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  it("timeout does nothing when not loading", () => {
    mockBindMasterFilter.mockReturnValue(jest.fn());
    const host = makeHost();
    componentDidMount(host);
    host.state = { ...host.state, mapLoadingStatus: "loaded", connectionStatus: "connected" };
    jest.advanceTimersByTime(1001);
    expect(host.fetchCategoryData).not.toHaveBeenCalled();
  });

  it("unmount without chart or timer is safe", () => {
    const host = makeHost();
    host._unbindMasterFilter = null;
    expect(() => componentWillUnmount(host)).not.toThrow();
  });
});

describe("updateFiltersFromProps", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("no-op when unchanged", () => {
    const host = makeHost({ yil: "2025" });
    updateFiltersFromProps(host, { yil: "2025" });
    expect(host.fetchCategoryData).not.toHaveBeenCalled();
  });

  it("applies changes, fetches and resets the handling flag", () => {
    const host = makeHost();
    updateFiltersFromProps(host, { yil: "2024", viloyat: "V", tuman: "T", turi: "R" });
    expect(host.state.yil).toBe("2024");
    expect(host.state.isHandlingExternalEvent).toBe(true);
    expect(host.getFeatureLayerForViloyat).toHaveBeenCalledWith("V");
    expect(host.fetchCategoryData).toHaveBeenCalled();
    jest.advanceTimersByTime(301);
    expect(host.state.isHandlingExternalEvent).toBe(false);
  });
});

describe("area field + stats query", () => {
  it("falls back to host lookup when layer has no preferred area field", () => {
    const host = makeHost({}, { findFieldByPossibleNames: jest.fn(() => "AREA_X") });
    const fl = { fields: [] } as unknown as __esri.FeatureLayer;
    expect(findAreaStatisticField(host, fl)).toBe("AREA_X");
  });

  it("queryCategoryStatsJSON delegates with defaults", async () => {
    mockStatsCached.mockResolvedValue([{ key: "a", value: 1 }]);
    const host = makeHost({}, { findAreaStatisticField: jest.fn(() => "AR") });
    const fl = { objectIdField: "FID" } as unknown as __esri.FeatureLayer;
    const out = await queryCategoryStatsJSON(host, fl, "", "cat");
    expect(out).toEqual([{ key: "a", value: 1 }]);
    expect(mockStatsCached).toHaveBeenCalledWith({
      layer: fl,
      where: "1=1",
      categoryField: "cat",
      areaField: "AR",
      objectIdField: "FID",
    });
  });

  it("queryCategoryStatsJSON defaults object id field", async () => {
    mockStatsCached.mockResolvedValue([]);
    const host = makeHost({}, { findAreaStatisticField: jest.fn(() => null) });
    await queryCategoryStatsJSON(host, {} as unknown as __esri.FeatureLayer, "w=1", "c");
    expect(mockStatsCached).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: "w=1", objectIdField: "OBJECTID" }),
    );
  });
});

describe("componentDidUpdate", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("applies new external filters", () => {
    const host = makeHost();
    const filters = { yil: "2020" };
    host.props = { externalFilters: filters } as unknown as AgriPieProps;
    componentDidUpdate(host, {} as AgriPieProps, host.state);
    expect(host.updateFiltersFromProps).toHaveBeenCalledWith(filters);
  });

  it("initializes after connection transitions to connected", () => {
    const host = makeHost({ connectionStatus: "connected" });
    componentDidUpdate(host, {} as AgriPieProps, baseState({ connectionStatus: "connecting" }));
    jest.advanceTimersByTime(101);
    expect(host.initializeAfterConnection).toHaveBeenCalled();
  });

  it("retries map connection while attempts remain", () => {
    const host = makeHost({ mapLoadingStatus: "failed", mapConnectionAttempts: 1 });
    host.props = { useMapWidgetIds: ["m"] } as unknown as AgriPieProps;
    componentDidUpdate(host, {} as AgriPieProps, baseState({ mapConnectionAttempts: 0 }));
    jest.advanceTimersByTime(2001);
    expect(host.state.mapConnectionAttempts).toBe(2);
    expect(host.state.mapLoadingStatus).toBe("idle");
  });

  it("gives up after max attempts and fetches", () => {
    const host = makeHost({ mapLoadingStatus: "failed", mapConnectionAttempts: 3 });
    host.props = { useMapWidgetIds: ["m"] } as unknown as AgriPieProps;
    componentDidUpdate(host, {} as AgriPieProps, baseState({ mapConnectionAttempts: 2 }));
    expect(host.state.connectionStatus).toBe("connected");
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  it("refreshes chart data vs selection", () => {
    const host = makeHost();
    componentDidUpdate(host, {} as AgriPieProps, baseState({ language: "en" }));
    expect(host.updatePieChart).toHaveBeenLastCalledWith("data");
    const host2 = makeHost({ activeSlice: 2 });
    componentDidUpdate(host2, {} as AgriPieProps, { ...host2.state, activeSlice: 1 });
    expect(host2.updatePieChart).toHaveBeenCalledWith("selection");
    const host3 = makeHost();
    componentDidUpdate(host3, {} as AgriPieProps, host3.state);
    expect(host3.updatePieChart).not.toHaveBeenCalled();
  });
});

describe("selectCategoryByName", () => {
  it("clears selection for null", () => {
    const host = makeHost({ turlar: ["a"], activeSlice: 1 });
    selectCategoryByName(host, null);
    expect(host.state.turlar).toEqual([]);
    expect(host.state.activeSlice).toBeNull();
  });

  it("selects and finds slice index case-insensitively", () => {
    const host = makeHost({
      categoryData: { categories: [{ key: "A", value: 1, percentage: 1 }, { key: "B", value: 1, percentage: 1 }], totalValue: 2 },
    });
    selectCategoryByName(host, "b");
    expect(host.state.activeSlice).toBe(1);
    expect(host.state.selectedCategories).toEqual(["b"]);
    selectCategoryByName(host, "zzz");
    expect(host.state.activeSlice).toBeNull();
  });
});

describe("resize handling", () => {
  it("schedulePieChartResize debounces via rAF and resizes chart", () => {
    const callbacks: FrameRequestCallback[] = [];
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const resize = jest.fn();
    const host = makeHost();
    host._pieChart = { resize } as unknown as PieWidgetHost["_pieChart"];
    schedulePieChartResize(host);
    schedulePieChartResize(host);
    expect(cancel).toHaveBeenCalledTimes(1);
    callbacks[1](0);
    expect(resize).toHaveBeenCalledTimes(1);
    expect(host._pieResizeRaf).toBe(0);
    raf.mockRestore();
    cancel.mockRestore();
  });

  it("handleResize forces update only when layout class flips", () => {
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    const host = makeHost({}, { isIpadLayout: (): boolean => true });
    host._lastIpadLayout = true;
    handleResize(host);
    expect(host.schedulePieChartResize).toHaveBeenCalled();
    expect(host.forceUpdate).not.toHaveBeenCalled();
    host._lastIpadLayout = false;
    handleResize(host);
    expect(host.forceUpdate).toHaveBeenCalled();
    expect(host.updatePieChart).toHaveBeenCalledWith("selection");
    expect(host._lastIpadLayout).toBe(true);
    raf.mockRestore();
  });

  it("isIpadLayout follows window width", () => {
    const host = makeHost();
    Object.defineProperty(window, "innerWidth", { value: 1366, configurable: true });
    expect(isIpadLayout(host)).toBe(true);
    Object.defineProperty(window, "innerWidth", { value: 1920, configurable: true });
    expect(isIpadLayout(host)).toBe(false);
  });
});

describe("resize observer", () => {
  class FakeRO {
    static instances: FakeRO[] = [];
    observe = jest.fn();
    disconnect = jest.fn();
    constructor(public cb: () => void) {
      FakeRO.instances.push(this);
    }
  }
  const original = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  beforeEach(() => {
    FakeRO.instances = [];
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeRO;
  });
  afterEach(() => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
  });

  it("observes the stage once and re-creates on stage change", () => {
    const stage = document.createElement("div");
    stage.className = "land-category-echart-stage";
    const el = document.createElement("div");
    stage.appendChild(el);
    const host = makeHost();
    attachPieResizeObserver(host, el);
    attachPieResizeObserver(host, el);
    expect(FakeRO.instances).toHaveLength(1);
    expect(FakeRO.instances[0].observe).toHaveBeenCalledWith(stage);
    FakeRO.instances[0].cb();
    expect(host.schedulePieChartResize).toHaveBeenCalled();

    const el2 = document.createElement("div");
    attachPieResizeObserver(host, el2);
    expect(FakeRO.instances).toHaveLength(2);
    expect(FakeRO.instances[0].disconnect).toHaveBeenCalled();
    expect(FakeRO.instances[1].observe).toHaveBeenCalledWith(el2);
  });

  it("skips when ResizeObserver unavailable", () => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const host = makeHost();
    attachPieResizeObserver(host, document.createElement("div"));
    expect(FakeRO.instances).toHaveLength(0);
  });

  it("detach disconnects and cancels pending frame", () => {
    const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const host = makeHost();
    const disconnect = jest.fn();
    host._pieResizeObserver = { disconnect } as unknown as ResizeObserver;
    host._pieResizeRaf = 5;
    detachPieResizeObserver(host);
    expect(cancel).toHaveBeenCalledWith(5);
    expect(disconnect).toHaveBeenCalled();
    expect(host._pieResizeObserver).toBeNull();
    expect(host._pieResizeRaf).toBe(0);
    cancel.mockRestore();
  });
});

describe("getChartDataForPie", () => {
  it("keeps positive slices sorted desc and records stable keys", () => {
    const host = makeHost({
      categoryData: {
        categories: [
          { key: "A", value: 1, percentage: 10 },
          { key: "Z", value: 0, percentage: 0 },
          { key: "B", value: 5, percentage: 50 },
        ],
        totalValue: 6,
      },
    });
    const out = getChartDataForPie(host);
    expect(out.map((d) => d.rawKey)).toEqual(["B", "A"]);
    expect(out[0]).toEqual({ name: "N:B", rawKey: "B", value: 5, percentage: 50 });
    expect(host._pieStableKeys).toEqual(["B", "A"]);
    expect(host._pieStableRawKeys).toEqual({ B: "B", A: "A" });
  });
});

describe("ensurePieChart", () => {
  const makeChart = (): { on: jest.Mock; dispose: jest.Mock } => ({ on: jest.fn(), dispose: jest.fn() });

  it("returns null without a DOM host", () => {
    const host = makeHost({}, { _pieChartRef: { current: null } });
    expect(ensurePieChart(host)).toBeNull();
  });

  it("creates chart once, wires click, attaches observer", () => {
    const chart = makeChart();
    mockInitPieChart.mockReturnValue(chart);
    const el = document.createElement("div");
    const host = makeHost({}, { _pieChartRef: { current: el } });
    expect(ensurePieChart(host)).toBe(chart);
    expect(host.attachPieResizeObserver).toHaveBeenCalledWith(el);
    const handler = chart.on.mock.calls[0][1] as (p: { dataIndex?: unknown; data?: unknown }) => void;
    handler({ dataIndex: 2, data: { rawKey: "r", name: "n" } });
    expect(host.handleSliceClick).toHaveBeenCalledWith({ rawKey: "r", name: "n" }, 2);
    handler({ data: {} });
    expect(host.handleSliceClick).toHaveBeenCalledTimes(1);
    mockInitPieChart.mockClear();
    ensurePieChart(host);
    expect(mockInitPieChart).not.toHaveBeenCalled();
  });

  it("disposes and recreates when host element changes", () => {
    const old = makeChart();
    const fresh = makeChart();
    mockInitPieChart.mockReturnValue(fresh);
    const el = document.createElement("div");
    const host = makeHost({}, { _pieChartRef: { current: el } });
    host._pieChart = old as unknown as PieWidgetHost["_pieChart"];
    host._pieChartHostEl = document.createElement("div");
    host._pieStableKeys = ["x"];
    expect(ensurePieChart(host)).toBe(fresh);
    expect(old.dispose).toHaveBeenCalled();
    expect(host._pieChartHostEl).toBe(el);
    expect(host._pieStableKeys).toEqual([]);
  });
});

describe("center content formatting", () => {
  it("formats area with language unit and precision", () => {
    expect(formatCenterArea(makeHost({ language: "en" }), 50.26)).toMatch(/^50[.,]3 ha$/);
    expect(formatCenterArea(makeHost({ language: "uz_lat" }), 1234.6)).toMatch(/ga$/);
    expect(formatCenterArea(makeHost({ language: "uz_cyr" }), NaN)).toBe("0 га");
  });

  it("formats percent", () => {
    const host = makeHost();
    expect(formatCenterPercent(host, 50)).toBe("50%");
    expect(formatCenterPercent(host, 33.333)).toBe("33.3%");
    expect(formatCenterPercent(host, Infinity)).toBe("0%");
  });

  it("returns localized All label", () => {
    expect(getCenterAllLabel(makeHost({ language: "en" }))).toBe("All");
    expect(getCenterAllLabel(makeHost({ language: "ru" }))).toBe("Все");
    expect(getCenterAllLabel(makeHost({ language: "uz_lat" }))).toBe("Barchasi");
    expect(getCenterAllLabel(makeHost({ language: "uz_cyr" }))).toBe("Барчаси");
  });

  const data = [
    { name: "Wheat", rawKey: "wheat", value: 30 },
    { name: "Corn", rawKey: "corn", value: 70 },
  ];

  it("shows total when nothing selected", () => {
    const out = getPieCenterContent(makeHost(), data);
    expect(out).toEqual({ showPercent: true, percent: 100, area: 100, label: "ALL" });
  });

  it("zero total gives zero percent", () => {
    expect(getPieCenterContent(makeHost(), []).percent).toBe(0);
  });

  it("shows selected share using categoryData total", () => {
    const host = makeHost({
      selectedCategories: ["Wheat"],
      categoryData: { categories: [], totalValue: 200 },
    });
    const out = getPieCenterContent(host, data);
    expect(out.area).toBe(30);
    expect(out.percent).toBe(15);
    expect(out.label).toBe("Wheat");
  });

  it("falls back to total when selection matches nothing", () => {
    const out = getPieCenterContent(makeHost({ selectedCategories: ["nope"] }), data);
    expect(out.label).toBe("ALL");
    expect(out.area).toBe(100);
  });
});
