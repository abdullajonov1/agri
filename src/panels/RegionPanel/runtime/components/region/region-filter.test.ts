jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({}));

type MasterHandler = (e: Event) => void;
const mockBind = jest.fn();
const mockGetLayer = jest.fn();
const mockDark = jest.fn();
jest.mock("../../../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: MasterHandler): (() => void) => mockBind(h) as () => void,
}));
jest.mock("../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../../../../shared/agri-language", () => ({
  ...jest.requireActual("../../../../../shared/agri-language"),
  detectIsDarkTheme: (): boolean => mockDark() as boolean,
}));

import type { JimuMapView } from "jimu-arcgis";
import type { AgriRegionState } from "../../widget";
import type { RegionWidgetHost } from "../../region-host";
import { makeStubHost } from "../../__test-utils__/stub-host";
import {
  applyDisplayCount,
  beginSelectionNotify,
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
  cycleSortMode,
  getCurrentDataLength,
  getDisplayCountOptions,
  getEffectiveDisplayCount,
  handleAgriV10ThemeChanged,
  handleDisplayCountPillClick,
  handleDocumentClickForCountFilter,
  handleMasterFilterChange,
  notifyAgriFilter,
  onActiveViewChange,
  resolveDisplayCountForData,
  resolveFeatureLayerFromUseDataSource,
  resolveWidgetSize,
  setupResizeObserver,
  syncThemeState,
  toggleDisplayCountMenu,
} from "./region-filter";

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `r${i}`, maydon: i + 1 }));

const masterEvent = (detail: Record<string, unknown>): Event =>
  new CustomEvent("masterFilterChanged", { detail });

describe("lifecycle", () => {
  it("binds listeners on mount and removes them on unmount", () => {
    const add = jest.spyOn(document, "addEventListener");
    const remove = jest.spyOn(document, "removeEventListener");
    const unbind = jest.fn();
    mockBind.mockReturnValue(unbind);
    const host = makeStubHost({}, { _isMounted: false });
    componentDidMount(host);
    expect(host._isMounted).toBe(true);
    expect(mockBind).toHaveBeenCalledWith(host.handleMasterFilterChange);
    expect(host.setupResizeObserver).toHaveBeenCalled();
    expect(host.syncThemeState).toHaveBeenCalled();
    expect(host.state.connectionStatus).toBe("connecting");
    expect(add.mock.calls.map((c) => c[0])).toEqual(expect.arrayContaining(["mousedown", "agriV11ThemeToggled"]));

    const disconnect = jest.fn();
    host._resizeObserver = { disconnect } as unknown as ResizeObserver;
    componentWillUnmount(host);
    expect(host._isMounted).toBe(false);
    expect(disconnect).toHaveBeenCalled();
    expect(unbind).toHaveBeenCalled();
    expect(host.unbindPointerTracking).toHaveBeenCalled();
    expect(remove.mock.calls.map((c) => c[0])).toEqual(expect.arrayContaining(["mousedown", "agriV11ThemeToggled"]));
    add.mockRestore();
    remove.mockRestore();
  });
});

describe("display count", () => {
  it("closes the menu on outside click only", () => {
    const inside = document.createElement("div");
    const child = document.createElement("span");
    inside.appendChild(child);
    const host = makeStubHost({ displayCountMenuOpen: true });
    host._countFilterRef = { current: inside };
    const ev = (target: EventTarget): MouseEvent => {
      const e = new MouseEvent("mousedown");
      Object.defineProperty(e, "target", { value: target });
      return e;
    };
    handleDocumentClickForCountFilter(host, ev(child));
    expect(host.state.displayCountMenuOpen).toBe(true);
    handleDocumentClickForCountFilter(host, ev(document.body));
    expect(host.state.displayCountMenuOpen).toBe(false);
    const closed = makeStubHost();
    handleDocumentClickForCountFilter(closed, ev(document.body));
    expect(closed.setState).not.toHaveBeenCalled();
  });

  it("toggles the menu and cycles sort mode", () => {
    const host = makeStubHost();
    toggleDisplayCountMenu(host);
    expect(host.state.displayCountMenuOpen).toBe(true);
    toggleDisplayCountMenu(host);
    expect(host.state.displayCountMenuOpen).toBe(false);
    cycleSortMode(host);
    expect(host.state.sortMode).toBe("value_asc");
    cycleSortMode(host);
    expect(host.state.sortMode).toBe("value_desc");
  });

  it("measures the current data by view", () => {
    const data = { viloyatlar: rows(3), tumanlar: rows(7), totalArea: 0 };
    expect(getCurrentDataLength(makeStubHost({ regionalData: data }))).toBe(3);
    expect(getCurrentDataLength(makeStubHost({ regionalData: data, currentView: "tuman" }))).toBe(7);
  });

  it("caps the effective count by data length and falls back to 15", () => {
    const host = makeStubHost({ displayCount: 10 }, { getCurrentDataLength: () => 4 });
    expect(getEffectiveDisplayCount(host)).toBe(4);
    const empty = makeStubHost({ displayCount: 0 }, { getCurrentDataLength: () => 0 });
    expect(getEffectiveDisplayCount(empty)).toBe(15);
    const noCount = makeStubHost({ displayCount: 0 }, { getCurrentDataLength: () => 40 });
    expect(getEffectiveDisplayCount(noCount)).toBe(15);
    expect(resolveDisplayCountForData(makeStubHost({ displayCount: 10 }), 4)).toBe(4);
    expect(resolveDisplayCountForData(makeStubHost({ displayCount: 10 }), 0)).toBe(10);
    expect(resolveDisplayCountForData(makeStubHost({ displayCount: 0 }), 0)).toBe(15);
    expect(resolveDisplayCountForData(makeStubHost({ displayCount: 0 }), 99)).toBe(15);
  });

  it("builds sorted, de-duplicated pill options", () => {
    const host = makeStubHost({}, { getCurrentDataLength: () => 22, getEffectiveDisplayCount: () => 15 });
    expect(getDisplayCountOptions(host)).toEqual([5, 10, 15, 20, 22]);
    const none = makeStubHost({}, { getCurrentDataLength: () => 0, getEffectiveDisplayCount: () => 0 });
    expect(getDisplayCountOptions(none)).toEqual([]);
  });

  it("applies a count when the menu is open, toggles when the active pill is clicked", () => {
    const open = makeStubHost({ displayCountMenuOpen: true }, { applyDisplayCount: jest.fn() });
    handleDisplayCountPillClick(open, 10);
    expect(open.applyDisplayCount).toHaveBeenCalledWith(10);

    const closed = makeStubHost({}, { getEffectiveDisplayCount: () => 15 });
    handleDisplayCountPillClick(closed, 10);
    expect(closed.toggleDisplayCountMenu).not.toHaveBeenCalled();
    handleDisplayCountPillClick(closed, 15);
    expect(closed.toggleDisplayCountMenu).toHaveBeenCalled();

    const host = makeStubHost({ displayCountMenuOpen: true });
    applyDisplayCount(host, 20);
    expect(host.state.displayCount).toBe(20);
    expect(host.state.displayCountMenuOpen).toBe(false);
  });
});

describe("theme", () => {
  it("syncs theme only when mounted and changed", () => {
    mockDark.mockReturnValue(true);
    const host = makeStubHost();
    syncThemeState(host);
    expect(host.state.isDarkTheme).toBe(true);
    (host.setState as jest.Mock).mockClear();
    syncThemeState(host);
    expect(host.setState).not.toHaveBeenCalled();
    const unmounted = makeStubHost({}, { _isMounted: false });
    syncThemeState(unmounted);
    expect(unmounted.setState).not.toHaveBeenCalled();
  });

  it("reads isDarkTheme or theme from the event", () => {
    const host = makeStubHost();
    handleAgriV10ThemeChanged(host, new CustomEvent("t", { detail: { theme: "DARK" } }));
    expect(host.state.isDarkTheme).toBe(true);
    handleAgriV10ThemeChanged(host, new CustomEvent("t", { detail: { isDarkTheme: false } }));
    expect(host.state.isDarkTheme).toBe(false);
    (host.setState as jest.Mock).mockClear();
    handleAgriV10ThemeChanged(host, new CustomEvent("t", { detail: { theme: "light" } }));
    expect(host.setState).not.toHaveBeenCalled();
    const unmounted = makeStubHost({}, { _isMounted: false });
    handleAgriV10ThemeChanged(unmounted, new CustomEvent("t", { detail: { theme: "dark" } }));
    expect(unmounted.state.isDarkTheme).toBe(false);
  });
});

describe("resolveWidgetSize", () => {
  it.each([
    [100, "xs"],
    [360, "sm"],
    [520, "md"],
    [760, "lg"],
  ])("maps %i px to %s", (width, size) => {
    expect(resolveWidgetSize(makeStubHost(), width)).toBe(size);
  });
});

describe("resize observer", () => {
  type ObserverCallback = () => void;
  let callback: ObserverCallback | null = null;
  const observe = jest.fn();
  const originalRO = globalThis.ResizeObserver;

  beforeEach(() => {
    observe.mockReset();
    callback = null;
    globalThis.ResizeObserver = class {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect = jest.fn();
      unobserve = jest.fn();
    } as unknown as typeof ResizeObserver;
  });
  afterEach(() => {
    globalThis.ResizeObserver = originalRO;
  });

  const sized = (w: number, h: number): HTMLDivElement => {
    const el = document.createElement("div");
    Object.defineProperty(el, "clientWidth", { value: w, configurable: true });
    Object.defineProperty(el, "clientHeight", { value: h, configurable: true });
    return el;
  };

  it("measures, observes both nodes and updates on change", () => {
    const root = sized(600, 0);
    const chart = sized(0, 240.7);
    const host = makeStubHost({}, { resolveWidgetSize: (w: number) => (w > 500 ? "md" : "xs") });
    host._rootRef = { current: root };
    host._chartAreaRef = { current: chart };
    setupResizeObserver(host);
    expect(host.state).toMatchObject({ widgetSize: "md", containerWidth: 600, chartAreaHeight: 240 });
    expect(observe).toHaveBeenCalledTimes(2);
    expect(host._chartAreaObserved).toBe(true);
    (host.setState as jest.Mock).mockClear();
    callback?.();
    expect(host.setState).not.toHaveBeenCalled();
    Object.defineProperty(root, "clientWidth", { value: 300 });
    callback?.();
    expect(host.state.widgetSize).toBe("xs");
  });

  it("does nothing without ResizeObserver or when unmounted", () => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const host = makeStubHost();
    setupResizeObserver(host);
    expect(host._resizeObserver).toBeNull();
  });

  it("componentDidUpdate observes a late chart area once", () => {
    const obs = { observe: jest.fn() } as unknown as ResizeObserver;
    const host = makeStubHost({ chartAreaHeight: 0 });
    host._resizeObserver = obs;
    componentDidUpdate(host);
    expect(obs.observe).not.toHaveBeenCalled();
    host._chartAreaRef = { current: sized(10, 120) };
    componentDidUpdate(host);
    expect(obs.observe).toHaveBeenCalledTimes(1);
    expect(host.state.chartAreaHeight).toBe(120);
    componentDidUpdate(host);
    expect(obs.observe).toHaveBeenCalledTimes(1);
  });
});

describe("handleMasterFilterChange", () => {
  const filters = (extra: Record<string, unknown> = {}) => ({ yil: "2024", ...extra });

  it("ignores events when unmounted or without filters", () => {
    const host = makeStubHost({}, { _isMounted: false });
    handleMasterFilterChange(host, masterEvent({ filters: filters() }));
    const mounted = makeStubHost();
    handleMasterFilterChange(mounted, masterEvent({}));
    expect(host.setState).not.toHaveBeenCalled();
    expect(mounted.setState).not.toHaveBeenCalled();
  });

  it("stores a new year and shows the viloyat list", () => {
    const host = makeStubHost();
    handleMasterFilterChange(host, masterEvent({ filters: filters({ turlar: ["A", "A", ""], vh: " good " }) }));
    expect(host.state.currentFilters).toMatchObject({ yil: "2024", turlar: ["A"], vh: "good" });
    expect(host.state.currentView).toBe("viloyat");
    expect(host.fetchRegionalDataDeduped).toHaveBeenCalled();
  });

  it("falls back to the single turi as the crop list", () => {
    const host = makeStubHost();
    handleMasterFilterChange(host, masterEvent({ filters: filters({ turi: "Bugdoy" }) }));
    expect(host.state.currentFilters.turlar).toEqual(["Bugdoy"]);
  });

  it("switches to the tuman list on a viloyat selection", () => {
    const host = makeStubHost();
    handleMasterFilterChange(host, masterEvent({ filters: filters({ viloyat: "Andijon" }) }));
    expect(host.state).toMatchObject({
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon",
      selectedRegion: null,
    });
  });

  it("selects the tuman when one is present", () => {
    const host = makeStubHost();
    handleMasterFilterChange(host, masterEvent({ filters: filters({ viloyat: "Andijon", tuman: "Asaka" }) }));
    expect(host.state).toMatchObject({ currentView: "tuman", selectedRegion: "Asaka" });
  });

  it("uses the locked viloyat from scope", () => {
    const host = makeStubHost();
    handleMasterFilterChange(
      host,
      masterEvent({ filters: filters(), scope: { lockedViloyat: "Locked", locked: true } }),
    );
    expect(host.state).toMatchObject({
      lockedViloyat: "Locked",
      isLocked: true,
      currentView: "tuman",
      selectedViloyatForDrillDown: "Locked",
    });
  });

  it("derives VH unique ids from chart ids, falling back to vhUniqueids without a tuman", () => {
    const withChart = makeStubHost();
    handleMasterFilterChange(
      withChart,
      masterEvent({ filters: filters({ vh: "good" }), vhRegionChartUniqueids: ["1", "1", "2"], vhUniqueids: ["9"] }),
    );
    expect(withChart.state.currentFilters.vhUniqueids).toEqual(["1", "2"]);

    const fallback = makeStubHost();
    handleMasterFilterChange(fallback, masterEvent({ filters: filters({ vh: "good" }), vhUniqueids: ["9"] }));
    expect(fallback.state.currentFilters.vhUniqueids).toEqual(["9"]);

    const withTuman = makeStubHost();
    handleMasterFilterChange(
      withTuman,
      masterEvent({ filters: filters({ vh: "good", viloyat: "A", tuman: "B" }), vhUniqueids: ["9"] }),
    );
    expect(withTuman.state.currentFilters.vhUniqueids).toBeNull();
  });

  it("only updates language when nothing meaningful changed", () => {
    const host = makeStubHost({
      currentFilters: { ...makeStubHost().state.currentFilters, yil: "2024" },
      regionalError: "old",
    });
    handleMasterFilterChange(host, masterEvent({ filters: filters({ language: "en" }) }));
    expect(host.state.language).toBe("en");
    expect(host.state.regionalError).toBeNull();
    expect(host.fetchRegionalDataDeduped).not.toHaveBeenCalled();
  });

  it("ignores an identical event", () => {
    const host = makeStubHost({
      currentFilters: { ...makeStubHost().state.currentFilters, yil: "2024" },
    });
    handleMasterFilterChange(host, masterEvent({ filters: filters() }));
    expect(host.setState).not.toHaveBeenCalled();
  });

  it("keeps the viloyat list highlighted after Back while master still echoes the viloyat", () => {
    const host = makeStubHost({
      currentFilters: { ...makeStubHost().state.currentFilters, yil: "2024" },
    });
    host._pendingBackToViloyatHighlight = "Andijon";
    handleMasterFilterChange(host, masterEvent({ filters: filters({ viloyat: "Andijon" }) }));
    expect(host.state).toMatchObject({
      currentView: "viloyat",
      selectedViloyatForDrillDown: null,
      selectedRegion: "Andijon",
    });
    expect(host.state.currentFilters.viloyat).toBe("");
    expect(host._pendingBackToViloyatHighlight).toBeNull();
    expect(host.fetchRegionalDataDeduped).not.toHaveBeenCalled();
  });

  it("refetches during the highlight mode when the year changed", () => {
    const host = makeStubHost();
    host._pendingBackToViloyatHighlight = "Andijon";
    handleMasterFilterChange(host, masterEvent({ filters: filters({ viloyat: "Andijon" }) }));
    expect(host.fetchRegionalDataDeduped).toHaveBeenCalled();
  });
});

describe("notifyAgriFilter / beginSelectionNotify", () => {
  it("dispatches widgetSelectionChanged with source and timestamp", () => {
    const received: Array<Record<string, unknown>> = [];
    const listener = (e: Event): void => {
      received.push((e as CustomEvent<Record<string, unknown>>).detail);
    };
    document.addEventListener("widgetSelectionChanged", listener);
    const host = makeStubHost();
    notifyAgriFilter(host, { viloyat: "A" });
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ viloyat: "A", source: "AgriRegion" });
    expect(typeof received[0].timestamp).toBe("number");
  });

  it("drops notifications from a superseded generation", () => {
    const listener = jest.fn();
    document.addEventListener("widgetSelectionChanged", listener);
    const host = makeStubHost();
    const stale = beginSelectionNotify(host);
    beginSelectionNotify(host);
    notifyAgriFilter(host, { viloyat: "A" }, stale);
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(listener).not.toHaveBeenCalled();
    expect(host._selectionNotifyGeneration).toBe(2);
  });
});

describe("onActiveViewChange", () => {
  const view = {} as JimuMapView;

  it("ignores a missing view", async () => {
    const host = makeStubHost();
    await onActiveViewChange(host, null as unknown as JimuMapView);
    expect(host.setState).not.toHaveBeenCalled();
  });

  it("connects, detects the area field and picks sum mode", async () => {
    const layer = { id: "L" };
    mockGetLayer.mockResolvedValue({ layer });
    const host = makeStubHost({ connectionStatus: "connecting" }, { detectAreaField: jest.fn(() => "maydon") });
    await onActiveViewChange(host, view);
    const state: AgriRegionState = host.state;
    expect(state).toMatchObject({ connectionStatus: "connected", areaField: "maydon", statMode: "sum", activeMapView: view });
    expect(state.featureLayers).toEqual([layer]);
  });

  it("uses count mode when there is no area field", async () => {
    mockGetLayer.mockResolvedValue({ layer: {} });
    const host = makeStubHost({}, { detectAreaField: jest.fn(() => null) });
    await onActiveViewChange(host, view);
    expect(host.state.statMode).toBe("count");
  });

  it("records a connection error on failure", async () => {
    mockGetLayer.mockRejectedValue(new Error("down"));
    const host = makeStubHost();
    await onActiveViewChange(host, view);
    expect(host.state.connectionStatus).toBe("failed");
    expect(host.state.regionalError).toBe("Connection error: down");
  });
});

describe("resolveFeatureLayerFromUseDataSource", () => {
  const view = { view: { map: {} } } as unknown as JimuMapView;

  it("returns null without a map view or data source id", async () => {
    const host = makeStubHost();
    expect(await resolveFeatureLayerFromUseDataSource(host, {} as JimuMapView)).toBeNull();
    expect(await resolveFeatureLayerFromUseDataSource(host, view)).toBeNull();
  });

  it("delegates the first use-data-source to the resolver", async () => {
    const layer = { id: "L" };
    const resolver = jest.fn().mockResolvedValue(layer);
    const host = makeStubHost({}, { resolveFeatureLayerFromOneUseDataSource: resolver });
    host.props = { ...host.props, useDataSources: [{ dataSourceId: "ds1" }] } as unknown as RegionWidgetHost["props"];
    expect(await resolveFeatureLayerFromUseDataSource(host, view)).toBe(layer);
    expect(resolver).toHaveBeenCalledWith({ dataSourceId: "ds1" }, view);
  });
});
