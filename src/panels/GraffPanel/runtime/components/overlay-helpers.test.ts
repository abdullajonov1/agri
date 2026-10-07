jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));

const mockSetContext = jest.fn();
jest.mock("../../../../gis/agri-vegetation-overlay-prefetch", () => ({
  setVegetationOverlayContext: (...args: unknown[]): void => {
    mockSetContext(...args);
  },
  getVegetationOverlayDateForRegion: (): string | null => null,
}));
const mockApi = {
  seasonMonths: [] as number[],
  withoutImagery: false,
  withImagery: false,
  walk: jest.fn(),
  pick: jest.fn(),
  dates: jest.fn(),
  tiff: jest.fn(),
};
jest.mock("../../../../gis/agri-polygon-api-source", () => ({
  getExportImageSeasonMonths: (): number[] => mockApi.seasonMonths,
  isRegionDateWithoutImagery: (): boolean => mockApi.withoutImagery,
  isRegionDateWithImagery: (): boolean => mockApi.withImagery,
  resolveExportImageWithDateWalk: (...a: unknown[]): unknown => mockApi.walk(...a),
  pickExportRasterDate: (...a: unknown[]): unknown => mockApi.pick(...a),
  fetchPolygonAvailableDates: (...a: unknown[]): unknown => mockApi.dates(...a),
  fetchPolygonExportImageTiff: (...a: unknown[]): unknown => mockApi.tiff(...a),
}));

import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import {
  attachMapHoverPrefetch,
  awaitPendingOverlayWalk,
  builduniqueidWhere,
  clearPolygonSelectionFromMapClick,
  detachMapHoverPrefetch,
  getCarriedOverlayDate,
  handleDocumentMouseDown,
  handlePopupPolygonSelectionFastPath,
  isRegionalInteractionEnabled,
  kickOptimisticVegetationOverlay,
  markOverlayDateVerified,
  observeGraphViewport,
  prefetchVegetationForMapPoint,
  rememberRasterDateForUniqueid,
  resolveFieldCaseInsensitive,
  scheduleGraphViewportRefresh,
  updateGraphViewportSize,
} from "./overlay-helpers";

type StatePatch = Partial<AgriGraffWidgetState> | ((prev: AgriGraffWidgetState) => Partial<AgriGraffWidgetState> | null);

const makeHost = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost => {
  const host = {
    state: {
      selectedIndices: ["ndvi"],
      regionalFilters: { viloyat: "", tuman: "", yil: "", uzspace: "", vh: "" },
      graphViewportWidth: 300,
      graphViewportHeight: 200,
      viewMode: "graph",
      connectionStatus: "connected",
      ...state,
    },
    _isMounted: true,
    _lastSuccessfulOverlayDate: null,
    _lastSuccessfulOverlayRegionId: null,
    _lastSuccessfulOverlayYear: null,
    _lastSuccessfulOverlayIndex: null,
    _optimisticDateBeforeClear: null,
    _latestRasterDateByUniqueid: new Map<string, string>(),
    _verifiedOverlayDates: new Set<string>(),
    _pendingOverlayWalk: null,
    _mapHoverPrefetchHandle: null,
    _hoverPrefetchTimer: null,
    _hoverPrefetchUniqueid: "",
    _graphViewportRaf: null,
    _selectionPageResolveToken: 0,
    _extentBeforeTableSelection: null,
    graphSvgWrapRef: { current: null },
    graphContainerRef: { current: null },
    monthPickerRef: { current: null },
    graphResizeObserver: null,
    resolveCurrentRegionId: (): number | undefined => 1724,
    resolveCurrentYear: (): number | undefined => 2024,
    resolveCropIdForUniqueid: (): number | null => 3,
    beginVegetationImageSurfaceLoading: jest.fn(),
    applyVegetationImageOverlay: jest.fn((): Promise<void> => Promise.resolve()),
    markOverlayDateVerified: jest.fn(),
    updateGraphViewportSize: jest.fn(),
    scheduleGraphViewportRefresh: jest.fn(),
    syncExternalPolygonSelection: jest.fn(),
    cancelVegetationImageOverlay: jest.fn(),
    buildWhereClause: (): string => "1=1",
    fetchRegionalTimeseries: jest.fn(),
    fetchData: jest.fn((): Promise<void> => Promise.resolve()),
    detachMapHoverPrefetch: jest.fn(),
    prefetchVegetationForMapPoint: jest.fn((): Promise<void> => Promise.resolve()),
    rememberRasterDateForUniqueid: jest.fn(),
    ...extra,
  } as unknown as GraffWidgetHost;
  host.getCarriedOverlayDate = (r: number | undefined, y: number | undefined): string | null =>
    getCarriedOverlayDate(host, r, y);
  host.setState = ((patch: StatePatch, cb?: () => void): void => {
    const next = typeof patch === "function" ? patch(host.state) : patch;
    if (next) host.state = { ...host.state, ...next };
    cb?.();
  }) as GraffWidgetHost["setState"];
  return host;
};

const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

beforeEach(() => {
  mockApi.seasonMonths = [];
  mockApi.withoutImagery = false;
  mockApi.withImagery = false;
  mockApi.walk.mockReset();
  mockApi.pick.mockReset();
  mockApi.dates.mockReset();
  mockApi.tiff.mockReset();
  mockSetContext.mockReset();
});

describe("viewport helpers", () => {
  test("updateGraphViewportSize only updates on >=2px change", () => {
    const wrap = document.createElement("div");
    wrap.getBoundingClientRect = (): DOMRect => ({ width: 301, height: 200 }) as DOMRect;
    const host = makeHost({}, { graphSvgWrapRef: { current: wrap } });
    updateGraphViewportSize(host);
    expect(host.state.graphViewportWidth).toBe(300);
    wrap.getBoundingClientRect = (): DOMRect => ({ width: 50, height: 500 }) as DOMRect;
    updateGraphViewportSize(host);
    expect(host.state.graphViewportWidth).toBe(120);
    expect(host.state.graphViewportHeight).toBe(500);
  });

  test("updateGraphViewportSize no-op without wrap", () => {
    const host = makeHost();
    expect(() => updateGraphViewportSize(host)).not.toThrow();
  });

  test("scheduleGraphViewportRefresh runs after two frames", () => {
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    });
    const host = makeHost();
    (host as unknown as { _graphViewportRaf: number | null })._graphViewportRaf = 5;
    const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation((): void => undefined);
    scheduleGraphViewportRefresh(host);
    expect(cancel).toHaveBeenCalledWith(5);
    expect(host.updateGraphViewportSize).toHaveBeenCalled();
    raf.mockRestore();
    cancel.mockRestore();
  });

  test("observeGraphViewport schedules refresh when wrap exists", () => {
    const wrap = document.createElement("div");
    const host = makeHost({}, { graphSvgWrapRef: { current: wrap }, graphContainerRef: { current: document.createElement("div") } });
    observeGraphViewport(host);
    expect(host.scheduleGraphViewportRefresh).toHaveBeenCalled();
    const empty = makeHost();
    observeGraphViewport(empty);
    expect(empty.scheduleGraphViewportRefresh).not.toHaveBeenCalled();
  });
});

describe("small helpers", () => {
  test("handleDocumentMouseDown closes picker on outside click", () => {
    const picker = document.createElement("div");
    const inside = document.createElement("span");
    picker.appendChild(inside);
    const host = makeHost({ isMonthPickerOpen: true }, { monthPickerRef: { current: picker } });
    handleDocumentMouseDown(host, { target: inside } as unknown as MouseEvent);
    expect(host.state.isMonthPickerOpen).toBe(true);
    handleDocumentMouseDown(host, { target: document.body } as unknown as MouseEvent);
    expect(host.state.isMonthPickerOpen).toBe(false);
  });

  test("builduniqueidWhere and resolveFieldCaseInsensitive", () => {
    const host = makeHost({
      featureLayer: { fields: [{ name: "UniqueID" }] } as unknown as __esri.FeatureLayer,
    });
    expect(builduniqueidWhere(host, "abc")).toContain("UPPER(uniqueid)");
    expect(resolveFieldCaseInsensitive(host, "uniqueid")).toBe("UniqueID");
    expect(resolveFieldCaseInsensitive(host, "nope")).toBeNull();
    expect(resolveFieldCaseInsensitive(makeHost(), "x")).toBeNull();
  });

  test("isRegionalInteractionEnabled requires viloyat", () => {
    expect(isRegionalInteractionEnabled(makeHost())).toBe(false);
    expect(
      isRegionalInteractionEnabled(makeHost({ regionalFilters: { viloyat: " V ", tuman: "", yil: "", uzspace: "", vh: "" } })),
    ).toBe(true);
  });

  test("handlePopupPolygonSelectionFastPath routes AgriPopup events", () => {
    const host = makeHost();
    const fire = (detail: Record<string, unknown>): void =>
      handlePopupPolygonSelectionFastPath(host, new CustomEvent("x", { detail }));
    fire({ source: "Other", polygonMode: true, uniqueid: "U" });
    expect(host.syncExternalPolygonSelection).not.toHaveBeenCalled();
    fire({ source: "AgriPopup", polygonMode: true, uniqueid: "U", regionId: "1724", clickedAt: 5 });
    expect(host.syncExternalPolygonSelection).toHaveBeenLastCalledWith("U", true, 1724, 5);
    fire({ source: "AgriPopup", polygonMode: false });
    expect(host.syncExternalPolygonSelection).toHaveBeenLastCalledWith("", false, null, undefined);
  });
});

describe("getCarriedOverlayDate", () => {
  test("returns date only for same region/year", () => {
    const host = makeHost();
    expect(getCarriedOverlayDate(host, 1, 2024)).toBeNull();
    Object.assign(host, {
      _lastSuccessfulOverlayDate: "2024-05-01",
      _lastSuccessfulOverlayRegionId: 1,
      _lastSuccessfulOverlayYear: 2024,
    });
    expect(getCarriedOverlayDate(host, 1, 2024)).toBe("2024-05-01");
    expect(getCarriedOverlayDate(host, 2, 2024)).toBeNull();
    expect(getCarriedOverlayDate(host, 1, 2023)).toBeNull();
    expect(getCarriedOverlayDate(host, undefined, 2024)).toBeNull();
  });
});

describe("markOverlayDateVerified / rememberRasterDateForUniqueid", () => {
  test("marks keys and caps the set", () => {
    const host = makeHost();
    markOverlayDateVerified(host, "", "2024-01-01");
    markOverlayDateVerified(host, "U", "");
    expect(host._verifiedOverlayDates.size).toBe(0);
    for (let i = 0; i < 260; i++) markOverlayDateVerified(host, `U${i}`, "2024-01-01T00:00");
    expect(host._verifiedOverlayDates.size).toBe(256);
    expect(host._verifiedOverlayDates.has("U259|2024-01-01")).toBe(true);
  });

  test("remembers picked date unless a verified one exists", () => {
    const host = makeHost();
    mockApi.pick.mockReturnValue("2024-06-01");
    rememberRasterDateForUniqueid(host, "{U}", ["2024-06-01"]);
    expect(host._latestRasterDateByUniqueid.get("U")).toBe("2024-06-01");
    host._verifiedOverlayDates.add("U|2024-06-01");
    mockApi.pick.mockReturnValue("2024-07-01");
    rememberRasterDateForUniqueid(host, "U", ["2024-07-01"]);
    expect(host._latestRasterDateByUniqueid.get("U")).toBe("2024-06-01");
    rememberRasterDateForUniqueid(host, "", ["x"]);
    rememberRasterDateForUniqueid(host, "Z", []);
    expect(host._latestRasterDateByUniqueid.has("Z")).toBe(false);
  });
});

describe("awaitPendingOverlayWalk", () => {
  test("undefined when nothing pending for id", async () => {
    await expect(awaitPendingOverlayWalk(makeHost(), "U")).resolves.toBeUndefined();
  });
  test("resolves walk date or null", async () => {
    const host = makeHost();
    host._pendingOverlayWalk = { uniqueid: "U", promise: Promise.resolve({ date: "2024-01-02" }) };
    await expect(awaitPendingOverlayWalk(host, "U")).resolves.toBe("2024-01-02");
    host._pendingOverlayWalk = { uniqueid: "U", promise: Promise.resolve(null) };
    await expect(awaitPendingOverlayWalk(host, "U")).resolves.toBeNull();
    host._pendingOverlayWalk = { uniqueid: "U", promise: Promise.reject(new Error("x")) };
    await expect(awaitPendingOverlayWalk(host, "U")).resolves.toBeNull();
  });
  test("times out to undefined", async () => {
    const host = makeHost();
    host._pendingOverlayWalk = { uniqueid: "U", promise: new Promise(() => undefined) };
    await expect(awaitPendingOverlayWalk(host, "U", 5)).resolves.toBeUndefined();
  });
});

describe("kickOptimisticVegetationOverlay", () => {
  test("returns early without region", () => {
    const host = makeHost({}, { resolveCurrentRegionId: (): undefined => undefined });
    kickOptimisticVegetationOverlay(host, "U");
    expect(mockSetContext).not.toHaveBeenCalled();
    expect(host.beginVegetationImageSurfaceLoading).not.toHaveBeenCalled();
  });

  test("unproven date walks available dates and applies hit", async () => {
    mockApi.walk.mockResolvedValue({ date: "2024-05-05", result: { ok: true } });
    const host = makeHost({ selecteduniqueid: "U" });
    kickOptimisticVegetationOverlay(host, "U");
    expect(host.beginVegetationImageSurfaceLoading).toHaveBeenCalled();
    await flush();
    expect(host.markOverlayDateVerified).toHaveBeenCalledWith("U", "2024-05-05");
    expect(host.applyVegetationImageOverlay).toHaveBeenCalledWith("U", "2024-05-05", "ndvi", { ok: true });
  });

  test("proven cached date applies overlay directly", () => {
    const host = makeHost();
    host._latestRasterDateByUniqueid.set("U", "2024-05-05");
    host._verifiedOverlayDates.add("U|2024-05-05");
    kickOptimisticVegetationOverlay(host, "U");
    expect(mockApi.walk).not.toHaveBeenCalled();
    expect(host.applyVegetationImageOverlay).toHaveBeenCalledWith("U", "2024-05-05", "ndvi");
  });

  test("out-of-season guess is refused", () => {
    mockApi.seasonMonths = [7];
    mockApi.withImagery = true;
    mockApi.walk.mockResolvedValue(null);
    const host = makeHost();
    host._latestRasterDateByUniqueid.set("U", "2024-05-05");
    kickOptimisticVegetationOverlay(host, "U");
    expect(mockApi.walk).toHaveBeenCalled();
  });
});

describe("map hover prefetch", () => {
  test("detach removes handle and timer", () => {
    const remove = jest.fn();
    const host = makeHost({}, { _mapHoverPrefetchHandle: { remove }, _hoverPrefetchTimer: 3 });
    detachMapHoverPrefetch(host);
    expect(remove).toHaveBeenCalled();
    expect(host._hoverPrefetchTimer).toBeNull();
  });

  test("attach registers pointer-move that debounces prefetch", () => {
    jest.useFakeTimers();
    let handler: ((e: __esri.ViewPointerMoveEvent) => void) | null = null;
    const view = {
      scale: 1000,
      on: (_name: string, cb: (e: __esri.ViewPointerMoveEvent) => void): { remove: () => void } => {
        handler = cb;
        return { remove: (): void => undefined };
      },
    } as unknown as __esri.MapView;
    const host = makeHost();
    attachMapHoverPrefetch(host, view);
    expect(host.detachMapHoverPrefetch).toHaveBeenCalled();
    handler!({} as __esri.ViewPointerMoveEvent);
    jest.advanceTimersByTime(300);
    expect(host.prefetchVegetationForMapPoint).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test("prefetchVegetationForMapPoint fetches dates then tiff", async () => {
    mockApi.dates.mockResolvedValue(["2024-05-01"]);
    mockApi.tiff.mockResolvedValue({});
    const host = makeHost();
    host.rememberRasterDateForUniqueid = (id: string): void => {
      host._latestRasterDateByUniqueid.set(id, "2024-05-01");
    };
    const view = {
      hitTest: (): Promise<unknown> =>
        Promise.resolve({ results: [{ graphic: { attributes: null } }, { graphic: { attributes: { UNIQUEID: "{P1}" } } }] }),
    } as unknown as __esri.MapView;
    await prefetchVegetationForMapPoint(host, view, {} as __esri.ViewPointerMoveEvent, 1724, 2024);
    expect(mockApi.tiff).toHaveBeenCalledWith(expect.objectContaining({ uniqueid: "P1", rasterDate: "2024-05-01" }));
    await prefetchVegetationForMapPoint(host, view, {} as __esri.ViewPointerMoveEvent, 1724, 2024);
    expect(mockApi.tiff).toHaveBeenCalledTimes(1);
  });

  test("prefetch swallows hitTest errors", async () => {
    const view = { hitTest: (): Promise<unknown> => Promise.reject(new Error("x")) } as unknown as __esri.MapView;
    await expect(
      prefetchVegetationForMapPoint(makeHost(), view, {} as __esri.ViewPointerMoveEvent, 1, 2024),
    ).resolves.toBeUndefined();
  });
});

describe("clearPolygonSelectionFromMapClick", () => {
  test("resets selection, restores extent and refetches", () => {
    const goTo = jest.fn((): Promise<void> => Promise.resolve());
    const view = { goTo, graphics: { removeAll: jest.fn() }, map: { findLayerById: (): null => null } };
    const host = makeHost(
      { selecteduniqueid: "U", activeMapView: { view } as unknown as AgriGraffWidgetState["activeMapView"] },
      { _extentBeforeTableSelection: { xmin: 0 } },
    );
    const listener = jest.fn();
    document.addEventListener("widgetSelectionChanged", listener);
    clearPolygonSelectionFromMapClick(host);
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(host.state.selecteduniqueid).toBe("");
    expect(goTo).toHaveBeenCalled();
    expect(host.cancelVegetationImageOverlay).toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();
    expect(host.fetchRegionalTimeseries).toHaveBeenCalled();
    expect(host.fetchData).toHaveBeenCalled();
  });
});
