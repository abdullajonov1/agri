const mockBind = jest.fn();
jest.mock("../../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (cb: unknown): unknown => mockBind(cb),
}));
jest.mock("../../../../gis/agri-debug-log", () => ({ agriVhIndicatorLog: jest.fn() }));

import type { AllWidgetProps } from "jimu-core";
import { makeIndicatorHost } from "../__test-utils__/indicator-host-stub";
import type { IndicatorWidgetHost } from "../indicator-host";
import type { IndicatorConfig, VegetationStatsWidgetState } from "../widget";
import {
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
  handleMasterFilterChanged,
} from "./filter-handlers";

type Props = AllWidgetProps<IndicatorConfig>;

const ev = (detail: unknown): Event => new CustomEvent("masterFilterChanged", { detail });

const lifecycleOverrides = (): Partial<IndicatorWidgetHost> => ({
  handleMasterFilterChanged: jest.fn(),
  readFiltersFromUrl: jest.fn(),
  setupAutoRefresh: jest.fn(),
  handleThemeChange: jest.fn(),
  ensureInitialization: jest.fn(),
  prepareVhJoinIds: jest.fn(() => Promise.resolve()),
  getDefaultFeatureLayer: jest.fn(() => undefined),
  _lastMasterFilterBroadcastGeneration: 0,
  _lastMasterFilterTs: 0,
  normalizeTurlar: (raw: unknown, fallback?: string): string[] =>
    Array.isArray(raw) ? raw.map(String) : fallback ? [fallback] : [],
  MAX_CONNECTION_ATTEMPTS: 3,
  _containerRef: { current: null } as unknown as IndicatorWidgetHost["_containerRef"],
});

describe("componentDidMount / componentWillUnmount", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockBind.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it("connecting mode: binds listeners, hydrates, starts the init guard", () => {
    const unbind = jest.fn();
    mockBind.mockReturnValue(unbind);
    const { host } = makeIndicatorHost({}, {}, lifecycleOverrides());
    host._isMounted = false;
    componentDidMount(host);
    expect(host._isMounted).toBe(true);
    expect(host.state.connectionStatus).toBe("connecting");
    expect(mockBind).toHaveBeenCalledWith(host.handleMasterFilterChanged);
    expect(host.readFiltersFromUrl).toHaveBeenCalled();
    expect(host.setupAutoRefresh).toHaveBeenCalled();
    expect(host.initializeTheme).toHaveBeenCalled();
    jest.advanceTimersByTime(3001);
    expect(host.ensureInitialization).toHaveBeenCalled();

    const abort = new AbortController();
    host._abortController = abort;
    const disconnect = jest.fn();
    host._resizeObserver = { disconnect } as unknown as ResizeObserver;
    host.initializationTimer = setTimeout(() => undefined, 9999);
    host.throttledFetchData = { cancel: jest.fn() } as unknown as IndicatorWidgetHost["throttledFetchData"];
    host.refreshTimer = setInterval(() => undefined, 9999);
    componentWillUnmount(host);
    expect(host._isMounted).toBe(false);
    expect(unbind).toHaveBeenCalled();
    expect(host._unbindMasterFilter).toBeNull();
    expect(disconnect).toHaveBeenCalled();
    expect(host._resizeObserver).toBeNull();
    expect(abort.signal.aborted).toBe(true);
    expect(host._abortController).toBeNull();
  });

  it("API mode: connects immediately and fetches", () => {
    mockBind.mockReturnValue(jest.fn());
    const { host } = makeIndicatorHost({}, { useApiDataSource: true }, lifecycleOverrides());
    componentDidMount(host);
    expect(host.state.connectionStatus).toBe("connected");
    expect(host.fetchApiData).toHaveBeenCalled();
  });

  it("derives widget size breakpoints from the observed width", () => {
    mockBind.mockReturnValue(jest.fn());
    let roCallback: (entries: Array<{ contentRect: { width: number } }>) => void = () => undefined;
    const observe = jest.fn();
    const original = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      constructor(cb: typeof roCallback) {
        roCallback = cb;
      }
      observe = observe;
      disconnect = jest.fn();
    };
    const el = document.createElement("div");
    const { host } = makeIndicatorHost({}, {}, {
      ...lifecycleOverrides(),
      _containerRef: { current: el } as unknown as IndicatorWidgetHost["_containerRef"],
    });
    componentDidMount(host);
    jest.advanceTimersByTime(1);
    expect(observe).toHaveBeenCalledWith(el);
    roCallback([{ contentRect: { width: 100 } }]);
    expect(host.state.widgetSize).toBe("xs");
    roCallback([{ contentRect: { width: 200 } }]);
    expect(host.state.widgetSize).toBe("sm");
    roCallback([{ contentRect: { width: 300 } }]);
    expect(host.state.widgetSize).toBe("md");
    roCallback([{ contentRect: { width: 500 } }]);
    expect(host.state.widgetSize).toBe("lg");
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
  });

  it("unmount tolerates missing optional resources", () => {
    const { host } = makeIndicatorHost({}, {}, lifecycleOverrides());
    host._unbindMasterFilter = null;
    expect(() => componentWillUnmount(host)).not.toThrow();
  });
});

describe("componentDidUpdate", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const withProps = (host: IndicatorWidgetHost, props: Partial<Props>): void => {
    host.props = { ...host.props, ...props } as Props;
  };
  const prevState = (patch: Partial<VegetationStatsWidgetState> = {}): VegetationStatsWidgetState => ({
    ...makeIndicatorHost().host.state,
    ...patch,
  });

  it("switching to the API source connects and fetches", () => {
    const { host } = makeIndicatorHost({}, { useApiDataSource: true }, lifecycleOverrides());
    const prevProps = { config: {} } as Props;
    componentDidUpdate(host, prevProps, prevState());
    expect(host.state.connectionStatus).toBe("connected");
    expect(host.fetchApiData).toHaveBeenCalled();
    expect(host.setupAutoRefresh).toHaveBeenCalled();
  });

  it("switching away from the API source reconnects", () => {
    const { host } = makeIndicatorHost({ connectionStatus: "connected" }, {}, lifecycleOverrides());
    componentDidUpdate(host, { config: { useApiDataSource: true } } as Props, prevState());
    expect(host.state.connectionStatus).toBe("connecting");
  });

  it("retries map connection then fails after max attempts", () => {
    const { host } = makeIndicatorHost({ connectionStatus: "connecting", mapConnectionAttempts: 1 }, {}, lifecycleOverrides());
    withProps(host, { useMapWidgetIds: ["m"] } as unknown as Partial<Props>);
    // The shared stub merges object patches only; support updater functions here.
    host.setState = ((
      patch: Partial<VegetationStatsWidgetState> | ((p: VegetationStatsWidgetState) => Partial<VegetationStatsWidgetState>),
    ): void => {
      const next = typeof patch === "function" ? patch(host.state) : patch;
      host.state = { ...host.state, ...next };
    }) as IndicatorWidgetHost["setState"];
    componentDidUpdate(host, host.props, prevState({ mapConnectionAttempts: 0 }));
    jest.advanceTimersByTime(2001);
    expect(host.state.mapConnectionAttempts).toBe(2);

    const failing = makeIndicatorHost({ connectionStatus: "connecting", mapConnectionAttempts: 3 }, {}, lifecycleOverrides());
    withProps(failing.host, { useMapWidgetIds: ["m"] } as unknown as Partial<Props>);
    componentDidUpdate(failing.host, failing.host.props, prevState({ mapConnectionAttempts: 2 }));
    expect(failing.host.state.connectionStatus).toBe("failed");
  });

  it("does nothing when config and attempts are unchanged", () => {
    const { host, setState } = makeIndicatorHost({}, {}, lifecycleOverrides());
    componentDidUpdate(host, host.props, prevState());
    expect(setState).not.toHaveBeenCalled();
  });
});

describe("handleMasterFilterChanged", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const make = (state: Partial<VegetationStatsWidgetState> = {}): IndicatorWidgetHost => {
    const overrides = lifecycleOverrides();
    overrides.refreshData = jest.fn();
    return makeIndicatorHost(state, {}, overrides).host;
  };

  it("ignores unmounted, resetting, filterless and self-sourced events", () => {
    const h1 = make();
    h1._isMounted = false;
    handleMasterFilterChanged(h1, ev({ filters: { yil: "2024" } }));
    const h2 = make();
    h2._isResetting = true;
    handleMasterFilterChanged(h2, ev({ filters: { yil: "2024" } }));
    const h3 = make();
    handleMasterFilterChanged(h3, ev({}));
    handleMasterFilterChanged(h3, ev({ source: "VegetationStatsWidget", filters: { yil: "2024" } }));
    for (const h of [h1, h2, h3]) {
      expect(h.state.selectedYil).toBe("");
      expect(h.refreshData).not.toHaveBeenCalled();
    }
  });

  it("drops stale events by broadcast generation and timestamp", () => {
    const h = make();
    h._lastMasterFilterBroadcastGeneration = 5;
    handleMasterFilterChanged(h, ev({ filters: { yil: "2024" }, meta: { broadcastGeneration: 4 } }));
    expect(h.state.selectedYil).toBe("");
    const h2 = make();
    h2._lastMasterFilterTs = 100;
    handleMasterFilterChanged(h2, ev({ filters: { yil: "2024" }, meta: { timestamp: 50 } }));
    expect(h2.state.selectedYil).toBe("");
  });

  it("records newer generation/timestamp and applies the filter + refetches", async () => {
    const h = make();
    handleMasterFilterChanged(
      h,
      ev({
        filters: { yil: 2024, viloyat: "Farg‘ona", tuman: "Quva", turlar: ["a", "b"], language: "en" },
        meta: { broadcastGeneration: 3, timestamp: 77 },
      }),
    );
    expect(h._lastMasterFilterBroadcastGeneration).toBe(3);
    expect(h._lastMasterFilterTs).toBe(77);
    expect(h.state.selectedYil).toBe("2024");
    expect(h.state.selectedViloyat).toBe("Farg'ona");
    expect(h.state.selectedTuman).toBe("Quva");
    expect(h.state.selectedYerToifalari).toEqual(["a", "b"]);
    expect(h.state.selectedYerToifas).toBe("");
    expect(h.state.language).toBe("en");
    expect(h.state.isHandlingExternalEvent).toBe(true);
    expect(h.state.loading).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(h.refreshData).toHaveBeenCalled();
    jest.advanceTimersByTime(151);
    expect(h.state.isHandlingExternalEvent).toBe(false);
  });

  it("scope.lockedViloyat overrides the filter's viloyat", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { viloyat: "A" }, scope: { lockedViloyat: "Locked" } }));
    expect(h.state.selectedViloyat).toBe("Locked");
  });

  it("single crop sets selectedYerToifas; polygon mode sets uniqueid", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { turi: "Bugdoy", polygonMode: true, uniqueid: " u1 " } }));
    expect(h.state.selectedYerToifas).toBe("Bugdoy");
    expect(h.state.selectedUniqueid).toBe("u1");
  });

  it("VH selection stores deduplicated uniqueids", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { vh: "Alo" }, vhUniqueids: ["a", " a ", "", "b"] }));
    expect(h.state.selectedVegetationStatus).toBe("Alo");
    expect(h.state.vhUniqueids).toEqual(["a", "b"]);
    expect(h.prepareVhJoinIds).toHaveBeenCalledWith(["a", "b"]);
  });

  it("VH without an id array yields null uniqueids; clearing VH resets them", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { vh: "Alo" } }));
    expect(h.state.vhUniqueids).toBeNull();
    handleMasterFilterChanged(h, ev({ filters: { vh: "" }, vhUniqueids: ["a"] }));
    expect(h.state.selectedVegetationStatus).toBe("");
    expect(h.state.vhUniqueids).toBeNull();
  });

  it("language-only change updates language without refetch", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { yil: "", language: "en" } }));
    expect(h.state.language).toBe("en");
    expect(h.refreshData).not.toHaveBeenCalled();
    expect(h.state.isHandlingExternalEvent).toBe(false);
  });

  it("bar-only change syncs tracking state without refetch", () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { barCategoryField: "status", barCategoryValue: "x" } }));
    expect(h.state.barCategoryField).toBe("status");
    expect(h.state.barCategoryValue).toBe("x");
    expect(h.prepareVhJoinIds).toHaveBeenCalledWith(null);
    expect(h.refreshData).not.toHaveBeenCalled();
  });

  it("identical filters are a complete no-op", () => {
    const h = make({ selectedYil: "2024", language: "uz_lat" });
    handleMasterFilterChanged(h, ev({ filters: { yil: "2024" } }));
    expect(h.refreshData).not.toHaveBeenCalled();
    expect(h.prepareVhJoinIds).not.toHaveBeenCalled();
  });

  it("does not refresh if unmounted while joining VH ids", async () => {
    const h = make();
    handleMasterFilterChanged(h, ev({ filters: { yil: "2030" } }));
    h._isMounted = false;
    await Promise.resolve();
    await Promise.resolve();
    expect(h.refreshData).not.toHaveBeenCalled();
  });
});
