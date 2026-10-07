jest.mock("jimu-core", () => ({}));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockProjectionLoad = jest.fn((): Promise<void> => Promise.resolve());
jest.mock("esri/geometry/projection", () => ({ load: (): Promise<void> => mockProjectionLoad() }), { virtual: true });
const mockWarm = jest.fn();
jest.mock("../../../../gis/agri-polygon-api-source", () => ({ warmPolygonApiConnection: (): void => mockWarm() }));
const mockIndices = jest.fn((): Promise<unknown> => Promise.resolve({}));
jest.mock("../../../../gis/agri-vegetation-data-source", () => ({ getAgriVegetationIndicesLayer: (): Promise<unknown> => mockIndices() }));
const mockUnbind = jest.fn();
const mockBind = jest.fn((_h: unknown): (() => void) => mockUnbind);
jest.mock("../../../../data/agri-filter-bus", () => ({ bindMasterFilter: (h: unknown): (() => void) => mockBind(h) }));
const mockIsMapImage = jest.fn((): boolean => false);
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => mockIsMapImage() }));
jest.mock("../../../../shared/map-connection-service", () => ({ MAP_CONNECTION_RETRY_MS: 1000 }));

import { asMock, makeStubHost } from "../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import type { GraffWidgetProps } from "../graff-state";
import * as lh from "./lifecycle-handlers";

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    MAX_CONNECTION_ATTEMPTS: 3,
    graphResizeObserver: null,
    initializationTimer: null,
    _activeController: null,
    getConfiguredFilterFields: (): string[] => ["a"],
    handleThemeChange: jest.fn(),
    handleAppLanguageChanged: jest.fn(),
    handleMasterFilterChanged: jest.fn(),
    handlePopupPolygonSelectionFastPath: jest.fn(),
    handleExternalTableSearchChanged: jest.fn(),
    handleExternalTableRowSelected: jest.fn(),
    handleDocumentMouseDown: jest.fn(),
    handleResetAll: jest.fn(),
    handleDateIndexNavigate: jest.fn(),
    updateGraphViewportSize: jest.fn(),
    ...extra,
  });
const asProps = (p: Record<string, unknown>): GraffWidgetProps => p as unknown as GraffWidgetProps;
const asState = (s: Partial<AgriGraffWidgetState>): AgriGraffWidgetState => ({ ...makeStubHost().state, ...s });

describe("componentDidMount", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockIsMapImage.mockReturnValue(false);
    mockWarm.mockClear();
    mockBind.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  test("marks mounted, warms caches, binds events and schedules initialization", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const host = wired();
    lh.componentDidMount(host);
    expect(host._isMounted).toBe(true);
    expect(host.state.connectionStatus).toBe("connecting");
    expect(asMock(host.initializeTheme)).toHaveBeenCalled();
    expect(asMock(host.refreshFiltersFromConfig)).toHaveBeenCalled();
    expect(mockWarm).toHaveBeenCalled();
    expect(asMock(host.publishVegetationOverlayContext)).toHaveBeenCalled();
    expect(mockBind).toHaveBeenCalledWith(host.handleMasterFilterChanged);
    const names = addSpy.mock.calls.map((c) => c[0]);
    expect(names).toEqual(
      expect.arrayContaining(["agriV11ThemeToggled", "languageChanged", "widgetSelectionChanged", "agriGraff4TableSearchChanged", "agriGraff4TableRowSelected", "mousedown", "resetAllFilters", "graffDateIndexNavigate"]),
    );
    expect(asMock(host.observeGraphViewport)).not.toHaveBeenCalled();
    jest.advanceTimersByTime(3100);
    expect(asMock(host.ensureInitialization)).toHaveBeenCalled();
    addSpy.mockRestore();
    lh.componentWillUnmount(host);
  });
  test("graph mode observes viewport; layer definition expression and data source are cleared", () => {
    const layer = { definitionExpression: "x" } as unknown as __esri.FeatureLayer;
    const setDef = jest.fn();
    const host = wired({ viewMode: "graph", featureLayer: layer, dataSource: { setDefinitionExpression: setDef } as unknown as AgriGraffWidgetState["dataSource"] });
    lh.componentDidMount(host);
    expect(asMock(host.observeGraphViewport)).toHaveBeenCalled();
    expect(layer.definitionExpression).toBe("");
    expect(setDef).toHaveBeenCalledWith("");
    lh.componentWillUnmount(host);
  });
  test("leaves map-image owned layer expression alone and survives warm-up failure", () => {
    mockIsMapImage.mockReturnValue(true);
    mockWarm.mockImplementationOnce(() => {
      throw new Error("warm");
    });
    const layer = { definitionExpression: "keep" } as unknown as __esri.FeatureLayer;
    const host = wired({ featureLayer: layer });
    expect(() => lh.componentDidMount(host)).not.toThrow();
    expect(layer.definitionExpression).toBe("keep");
    lh.componentWillUnmount(host);
  });
  test("best-effort warmups tolerate rejections", async () => {
    mockIndices.mockRejectedValueOnce(new Error("i"));
    mockProjectionLoad.mockRejectedValueOnce(new Error("p"));
    const host = wired();
    lh.componentDidMount(host);
    await Promise.resolve();
    lh.componentWillUnmount(host);
  });
  test("_onReset blanks filters and refetches only when connected", () => {
    const host = wired({ connectionStatus: "connected", regionalFilters: { viloyat: "A", tuman: "", yil: "1", uzspace: "", vh: "" } });
    lh.componentDidMount(host);
    host.state = { ...host.state, connectionStatus: "connected" };
    host._onReset();
    expect(host._allowClearOnce).toBe(true);
    expect(host.state.localFilters).toEqual({ a: "" });
    expect(host.state.regionalFilters.viloyat).toBe("");
    expect(asMock(host.applyMapFilters)).toHaveBeenCalled();
    expect(asMock(host.fetchData)).toHaveBeenCalled();
    const idle = wired();
    lh.componentDidMount(idle);
    idle._onReset();
    expect(asMock(idle.fetchData)).not.toHaveBeenCalled();
    host._isMounted = false;
    host._onReset();
    lh.componentWillUnmount(host);
    lh.componentWillUnmount(idle);
  });
  test("popup fast-path unbinder removes its listener", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const host = wired();
    lh.componentDidMount(host);
    host._unbindPopupPolygonSelection();
    expect(removeSpy).toHaveBeenCalledWith("widgetSelectionChanged", host.handlePopupPolygonSelectionFastPath);
    removeSpy.mockRestore();
    lh.componentWillUnmount(host);
  });
});

describe("componentDidUpdate", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("schedules a retry while connecting without a map view", () => {
    const host = wired({ connectionStatus: "connecting", mapConnectionAttempts: 1 }, { props: { useMapWidgetIds: ["m"], config: {} } });
    lh.componentDidUpdate(host, host.props, asState({ mapConnectionAttempts: 0 }));
    jest.advanceTimersByTime(1100);
    expect(host.state.mapConnectionAttempts).toBe(2);
    lh.componentDidUpdate(host, host.props, asState({ mapConnectionAttempts: 1 }));
    lh.componentDidUpdate(host, host.props, asState({ mapConnectionAttempts: 0 }));
    host._isMounted = false;
    jest.advanceTimersByTime(1100);
    expect(host.state.mapConnectionAttempts).toBe(2);
  });
  test("fails after max attempts", () => {
    const host = wired({ connectionStatus: "connecting", mapConnectionAttempts: 3 }, { props: { useMapWidgetIds: [], config: {} } });
    lh.componentDidUpdate(host, host.props, asState({ mapConnectionAttempts: 2 }));
    expect(host.state.connectionStatus).toBe("failed");
  });
  test("config change refreshes filters; graph switch observes viewport", () => {
    const host = wired({ viewMode: "graph" });
    lh.componentDidUpdate(host, asProps({ config: { other: true } }), asState({ viewMode: "table" }));
    expect(asMock(host.refreshFiltersFromConfig)).toHaveBeenCalled();
    expect(asMock(host.observeGraphViewport)).toHaveBeenCalled();
  });
  test("graph layout changes schedule a viewport refresh; resizes too", () => {
    const host = wired({ viewMode: "graph", language: "en" as AgriGraffWidgetState["language"] });
    lh.componentDidUpdate(host, host.props, asState({ viewMode: "graph", language: "ru" as AgriGraffWidgetState["language"], selectedIndices: host.state.selectedIndices, vegetationData: host.state.vegetationData }));
    expect(asMock(host.scheduleGraphViewportRefresh)).toHaveBeenCalledTimes(1);
    const resized = wired({ viewMode: "graph", graphViewportWidth: 500 });
    lh.componentDidUpdate(resized, resized.props, asState({ viewMode: "graph", graphViewportWidth: 400, selectedIndices: resized.state.selectedIndices, vegetationData: resized.state.vegetationData }));
    expect(asMock(resized.scheduleGraphViewportRefresh)).toHaveBeenCalledTimes(1);
    const table = wired({ viewMode: "table" });
    lh.componentDidUpdate(table, table.props, asState({ viewMode: "table", graphViewportWidth: 1, selectedIndices: table.state.selectedIndices, vegetationData: table.state.vegetationData }));
    expect(asMock(table.scheduleGraphViewportRefresh)).not.toHaveBeenCalled();
  });
  test("selected month without data resets month state", () => {
    const rows = [{ raster_date: "2024-03-10" }] as unknown as AgriGraffWidgetState["vegetationData"];
    const host = wired({ viewMode: "graph", selectedMonth: 5, vegetationData: rows, chartTooltip: null, selectedNdviDate: "d" });
    lh.componentDidUpdate(host, host.props, asState({ viewMode: "graph", selectedMonth: 5, vegetationData: [] }));
    expect(host.state).toMatchObject({ selectedMonth: null, isMonthPickerOpen: false, selectedNdviDate: null });
    const keep = wired({ viewMode: "graph", selectedMonth: 2, vegetationData: rows });
    lh.componentDidUpdate(keep, keep.props, asState({ viewMode: "graph", selectedMonth: 2, vegetationData: [] }));
    expect(keep.state.selectedMonth).toBe(2);
  });
  test("broadcasts date/index selection when relevant state changed", () => {
    const host = wired({ selectedNdviDate: "new" });
    lh.componentDidUpdate(host, host.props, asState({ selectedNdviDate: "old", selectedIndices: host.state.selectedIndices, vegetationData: host.state.vegetationData }));
    expect(asMock(host.broadcastDateIndexSelection)).toHaveBeenCalled();
    const same = wired();
    lh.componentDidUpdate(same, same.props, asState({ selectedIndices: same.state.selectedIndices, vegetationData: same.state.vegetationData, polygonAvailableDates: same.state.polygonAvailableDates }));
    expect(asMock(same.broadcastDateIndexSelection)).not.toHaveBeenCalled();
  });
});

describe("componentWillUnmount", () => {
  test("tears down listeners, timers, observers and clears indicator", () => {
    const events: CustomEvent[] = [];
    const listener = (e: Event): void => {
      events.push(e as CustomEvent);
    };
    document.addEventListener("graffDateIndexSelectionChanged", listener);
    const abort = jest.fn();
    const cancel = jest.fn();
    const disconnect = jest.fn();
    const unbind = jest.fn();
    const unbindPopup = jest.fn();
    const layer = { definitionExpression: "x" } as unknown as __esri.FeatureLayer;
    const raf = jest.spyOn(window, "cancelAnimationFrame").mockImplementation((): void => undefined);
    const host = wired(
      { featureLayer: layer },
      {
        _activeController: { abort },
        throttledFetchData: { cancel },
        graphResizeObserver: { disconnect },
        _unbindMasterFilter: unbind,
        _unbindPopupPolygonSelection: unbindPopup,
        _updateDebounceTimer: setTimeout(() => undefined, 9999),
        _debounceTimer: setTimeout(() => undefined, 9999),
        _searchDebounceTimer: setTimeout(() => undefined, 9999),
        initializationTimer: setTimeout(() => undefined, 9999),
        _retryTimeout: setTimeout(() => undefined, 9999),
        _graphViewportRaf: 7,
      },
    );
    lh.componentWillUnmount(host);
    document.removeEventListener("graffDateIndexSelectionChanged", listener);
    expect(host._isMounted).toBe(false);
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(events[0].detail).toMatchObject({ date: null, navigable: false });
    expect(unbind).toHaveBeenCalled();
    expect(unbindPopup).toHaveBeenCalled();
    expect(host._unbindMasterFilter).toBeNull();
    expect(asMock(host.detachMapHoverPrefetch)).toHaveBeenCalled();
    expect(abort).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(host.graphResizeObserver).toBeNull();
    expect(raf).toHaveBeenCalledWith(7);
    expect(host.initializationTimer).toBeNull();
    expect(host._retryTimeout).toBeNull();
    expect(host._updateDebounceTimer).toBeNull();
    expect(layer.definitionExpression).toBe("");
    raf.mockRestore();
  });
  test("tolerates abort and layer reset failures", () => {
    const layer = {} as unknown as __esri.FeatureLayer;
    Object.defineProperty(layer, "definitionExpression", {
      set: () => {
        throw new Error("destroyed");
      },
    });
    const host = wired(
      { featureLayer: layer },
      {
        _activeController: {
          abort: (): void => {
            throw new Error("a");
          },
        },
      },
    );
    expect(() => lh.componentWillUnmount(host)).not.toThrow();
  });
});

describe("theme and language", () => {
  afterEach(() => {
    window.localStorage.removeItem("agri_v11_app_theme");
    document.documentElement.removeAttribute("data-theme");
  });
  test("initializeTheme prefers saved theme, then DOM attribute, defaulting to dark", () => {
    const a = wired();
    lh.initializeTheme(a);
    expect(a.state.isDarkTheme).toBe(true);
    document.documentElement.setAttribute("data-theme", "light");
    const b = wired();
    lh.initializeTheme(b);
    expect(b.state.isDarkTheme).toBe(false);
    window.localStorage.setItem("agri_v11_app_theme", "dark");
    const c = wired();
    lh.initializeTheme(c);
    expect(c.state.isDarkTheme).toBe(true);
    document.documentElement.setAttribute("data-theme", "weird");
    window.localStorage.removeItem("agri_v11_app_theme");
    const d = wired({ isDarkTheme: false });
    lh.initializeTheme(d);
    expect(d.state.isDarkTheme).toBe(true);
  });
  test("handleThemeChange uses event detail or re-reads theme", () => {
    const host = wired();
    lh.handleThemeChange(host, { detail: { isDarkTheme: false } } as unknown as CustomEvent);
    expect(host.state.isDarkTheme).toBe(false);
    lh.handleThemeChange(host, new Event("x"));
    expect(asMock(host.initializeTheme)).toHaveBeenCalled();
    const gone = wired({}, { _isMounted: false });
    lh.handleThemeChange(gone, { detail: { isDarkTheme: true } } as unknown as CustomEvent);
    expect(asMock(gone.setState)).not.toHaveBeenCalled();
  });
  test.each([
    ["russian", "ru"],
    ["RU", "ru"],
    ["uz", "uz_lat"],
    ["uz-latin", "uz_lat"],
    ["cyrillic", "uz_cyr"],
    ["uz_cyrl", "uz_cyr"],
  ])("handleAppLanguageChanged maps %s to %s", (raw, expected) => {
    const host = wired({ language: "en" as AgriGraffWidgetState["language"] });
    lh.handleAppLanguageChanged(host, { detail: { lang: raw } } as unknown as CustomEvent);
    expect(host.state.language).toBe(expected);
  });
  test("handleAppLanguageChanged ignores unknown, empty, same and unmounted", () => {
    const host = wired({ language: "ru" as AgriGraffWidgetState["language"] });
    lh.handleAppLanguageChanged(host, { detail: { language: "klingon" } } as unknown as CustomEvent);
    lh.handleAppLanguageChanged(host, { detail: {} } as unknown as CustomEvent);
    lh.handleAppLanguageChanged(host, { detail: { code: "ru" } } as unknown as CustomEvent);
    expect(asMock(host.setState)).not.toHaveBeenCalled();
    host._isMounted = false;
    lh.handleAppLanguageChanged(host, { detail: { lang: "uz" } } as unknown as CustomEvent);
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
});

describe("data source hooks", () => {
  test("onDataSourceCreated disables selection listening and loads filters when connected", () => {
    const setListenSelection = jest.fn();
    const ds = { setListenSelection } as unknown as Parameters<typeof lh.onDataSourceCreated>[1];
    const host = wired({ connectionStatus: "connected" });
    lh.onDataSourceCreated(host, ds);
    expect(setListenSelection).toHaveBeenCalledWith(false);
    expect(host.state.dataSource).toBe(ds);
    expect(asMock(host.refreshFiltersFromConfig)).toHaveBeenCalled();
    expect(asMock(host.fetchFilterOptions)).toHaveBeenCalled();
    const idle = wired();
    lh.onDataSourceCreated(idle, {} as Parameters<typeof lh.onDataSourceCreated>[1]);
    expect(asMock(idle.fetchFilterOptions)).not.toHaveBeenCalled();
  });
  test("onDataSourceInfoChange refetches only for record updates while connected", () => {
    const host = wired({ connectionStatus: "connected", records: [{ uniqueid: "x" }], currentPage: 3 });
    lh.onDataSourceInfoChange(host, { records: [] });
    expect(host.state).toMatchObject({ records: [], currentPage: 1, loading: true });
    expect(asMock(host.fetchData)).toHaveBeenCalledTimes(1);
    for (const info of [null, "x", {}, { records: "nope" }]) lh.onDataSourceInfoChange(host, info);
    const idle = wired();
    lh.onDataSourceInfoChange(idle, { records: [] });
    const gone = wired({ connectionStatus: "connected" }, { _isMounted: false });
    lh.onDataSourceInfoChange(gone, { records: [] });
    expect(asMock(idle.fetchData)).not.toHaveBeenCalled();
    expect(asMock(gone.fetchData)).not.toHaveBeenCalled();
    expect(asMock(host.fetchData)).toHaveBeenCalledTimes(1);
  });
});
