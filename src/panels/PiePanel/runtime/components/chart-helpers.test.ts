jest.mock("jimu-core", () => ({}));
jest.mock("jimu-arcgis", () => ({}));
const mockBuildPieStatsWhere = jest.fn();
jest.mock("../../../../controller/agri-where-builder", () => ({
  buildPieStatsWhere: (...args: unknown[]): unknown => mockBuildPieStatsWhere(...args),
}));
const mockVhIds = jest.fn();
jest.mock("../../../../gis/agri-chart-filter-order", () => ({
  getPieVhFilterUniqueIds: (): unknown => mockVhIds(),
}));
const mockMappings = jest.fn();
const mockTableLayer = jest.fn();
jest.mock("../../../../gis/agri-table-data-source", () => ({
  buildSpatialJoinWhere: (ids: string[]): string => `uniqueid IN (${ids.length})`,
  queryAgriTuriCropMappings: (): unknown => mockMappings(),
  getAgriTableDataLayer: (): unknown => mockTableLayer(),
}));
jest.mock("../../../../gis/feature-layer-data", () => ({
  escapeArcGIS: (s: string): string => s.replace(/'/g, "''"),
}));
const mockBootstrap = jest.fn();
jest.mock("../../../../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: (): unknown => mockBootstrap(),
}));
jest.mock("../../../../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

import * as helpers from "./chart-helpers";
import type { PieWidgetHost } from "../pie-host";

type PieState = PieWidgetHost["state"];
type StatePatch = Partial<PieState>;

/** Fake host whose methods delegate to the real helpers (host is the first arg). */
const makeHost = (state: StatePatch = {}, extra: Record<string, unknown> = {}): PieWidgetHost => {
  const host = {
    state: { isDarkTheme: false, connectionStatus: "connected", featureLayers: [], ...state },
    props: {},
    _isMounted: true,
    _cropMapsReady: false,
    _cropIdToTuri: {},
    _turiToCropId: {},
    _viloyatKeyToLayerIndex: {},
    _featureLayersInitPromise: null,
    _didInitOnce: false,
    CONNECTION_TIMEOUT_MS: 50,
    fetchCategoryData: jest.fn((): Promise<void> => Promise.resolve()),
  } as unknown as PieWidgetHost;
  const bind = <A extends unknown[], R>(fn: (h: PieWidgetHost, ...a: A) => R) =>
    (...a: A): R => fn(host, ...a);
  Object.assign(host, {
    normalizeName: bind(helpers.normalizeName),
    resolveCropIdToTuri: bind(helpers.resolveCropIdToTuri),
    resolveTuriToCropId: bind(helpers.resolveTuriToCropId),
    cropIdsToTuriNames: bind(helpers.cropIdsToTuriNames),
    makeAposVariants: bind(helpers.makeAposVariants),
    makeViloyatKey: bind(helpers.makeViloyatKey),
    isRepublicLayer: bind(helpers.isRepublicLayer),
    findFieldByPossibleNames: bind(helpers.findFieldByPossibleNames),
    getFeatureLayerForViloyat: bind(helpers.getFeatureLayerForViloyat),
    getDefaultFeatureLayer: bind(helpers.getDefaultFeatureLayer),
    resolveFeatureLayersFromUseDataSources: bind(helpers.resolveFeatureLayersFromUseDataSources),
    buildViloyatKeyToLayerIndex: bind(helpers.buildViloyatKeyToLayerIndex),
    waitForMapToLoad: bind(helpers.waitForMapToLoad),
    connectToMap: bind(helpers.connectToMap),
    initializeAfterConnection: bind(helpers.initializeAfterConnection),
    ...extra,
  });
  host.setState = ((patch: StatePatch, cb?: () => void): void => {
    host.state = { ...host.state, ...patch };
    cb?.();
  }) as PieWidgetHost["setState"];
  return host;
};

const layer = (id: string, title = id): __esri.FeatureLayer =>
  ({ id, title, fields: [] }) as unknown as __esri.FeatureLayer;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("slice styling", () => {
  test("border color follows theme", () => {
    expect(helpers.getSliceBorderColor(makeHost())).toBe("#ffffff");
    expect(helpers.getSliceBorderColor(makeHost({ isDarkTheme: true }))).toBe("#1f2030");
  });

  test("gradient derived from base color", () => {
    const style = helpers.getSliceFillStyle(makeHost(), "#101010");
    expect(typeof style).toBe("object");
    const stops = (style as { colorStops: Array<{ color: string }> }).colorStops;
    expect(stops.map((s) => s.color)).toEqual(["#323232", "#101010", "#000000"]);
  });

  test("#fff uses the grey light-slice gradient", () => {
    const style = helpers.getSliceFillStyle(makeHost(), "#fff") as { colorStops: Array<{ color: string }> };
    expect(style.colorStops[0].color).toBe("#f8fafc");
  });

  // Fixed bug (chart-helpers.ts getSliceFillStyle): color is lower-cased and then
  // compared with "#E8E1D1" (upper case), so paxta's light slice never gets
  // the grey gradient that keeps it visible on a light background.
  test("paxta #E8E1D1 uses the grey light-slice gradient", () => {
    const style = helpers.getSliceFillStyle(makeHost(), "#E8E1D1") as { colorStops: Array<{ color: string }> };
    expect(style.colorStops[0].color).toBe("#f8fafc");
  });
});

describe("theme", () => {
  afterEach(() => localStorage.clear());

  test("initializeTheme reads saved theme, defaults dark", () => {
    const host = makeHost();
    helpers.initializeTheme(host);
    expect(host.state.isDarkTheme).toBe(true);
    localStorage.setItem("agri_v11_app_theme", "light");
    helpers.initializeTheme(host);
    expect(host.state.isDarkTheme).toBe(false);
  });

  test("handleThemeToggled prefers event detail then storage", () => {
    const host = makeHost();
    helpers.handleThemeToggled(host, new CustomEvent("t", { detail: { isDark: false } }));
    localStorage.setItem("agri_v11_app_theme", "dark");
    helpers.handleThemeToggled(host, new Event("t"));
    expect(host.state.isDarkTheme).toBe(true);
  });
});

describe("data source events", () => {
  test("onDataSourceCreated disables selection listening and fetches", () => {
    const setListenSelection = jest.fn();
    const host = makeHost();
    helpers.onDataSourceCreated(host, { setListenSelection } as unknown as Parameters<typeof helpers.onDataSourceCreated>[1]);
    expect(setListenSelection).toHaveBeenCalledWith(false);
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  test("onDataSourceInfoChange fetches only for record payloads", () => {
    const host = makeHost();
    helpers.onDataSourceInfoChange(host, { status: "x" });
    helpers.onDataSourceInfoChange(host, null);
    expect(host.fetchCategoryData).not.toHaveBeenCalled();
    helpers.onDataSourceInfoChange(host, { records: [] });
    expect(host.fetchCategoryData).toHaveBeenCalledTimes(1);
    helpers.onDataSourceInfoChange(makeHost({ connectionStatus: "idle" }), { records: [] });
  });
});

describe("field lookup", () => {
  const ds = { getSchema: (): unknown => ({ fields: { Crop_ID: {}, ekin_turi_name: {} } }) };

  test("findFieldByPossibleNames exact then partial", () => {
    const host = makeHost({ dataSource: ds } as unknown as StatePatch);
    expect(helpers.findFieldByPossibleNames(host, ["crop_id"])).toBe("Crop_ID");
    expect(helpers.findFieldByPossibleNames(host, ["ekin_turi"])).toBe("ekin_turi_name");
    expect(helpers.findFieldByPossibleNames(host, ["zzz"])).toBeNull();
    expect(helpers.findFieldByPossibleNames(makeHost(), ["x"])).toBeNull();
  });

  test("findCategoryField prefers layer fields, then data source, then default", () => {
    const fl = { fields: [{ name: "TURI" }] } as unknown as __esri.FeatureLayer;
    expect(helpers.findCategoryField(makeHost(), fl)).toBe("TURI");
    const host = makeHost({ dataSource: ds } as unknown as StatePatch);
    expect(helpers.findCategoryField(host)).toBe("Crop_ID");
    expect(helpers.findCategoryField(makeHost())).toBe("crop_id");
  });
});

describe("where builders", () => {
  test("buildWhereClauseForDS maps crop ids to turi names", () => {
    mockBuildPieStatsWhere.mockReturnValue("W");
    const host = makeHost({ yil: "2024", turlar: ["7"] } as unknown as StatePatch);
    host._cropIdToTuri = { "7": "Paxta" };
    expect(helpers.buildWhereClauseForDS(host, { includeCategory: false, districtCode: 5 })).toBe("W");
    const [filters, opts] = mockBuildPieStatsWhere.mock.calls[0] as [Record<string, unknown>, Record<string, unknown>];
    expect(filters.yil).toBe("2024");
    expect(filters.turi).toBe("Paxta");
    expect(filters.districtCode).toBe(5);
    expect(opts).toEqual({ includeCategory: false, includeViloyat: true });
  });

  test("buildPieVhWhereChunks", () => {
    expect(helpers.buildPieVhWhereChunks(makeHost())).toBeNull();
    const host = makeHost({ filterPieByVh: true } as unknown as StatePatch);
    mockVhIds.mockReturnValue(null);
    expect(helpers.buildPieVhWhereChunks(host)).toBeNull();
    expect(helpers.buildPieVhWhereChunks(host, [])).toEqual(["1=0"]);
    const ids = Array.from({ length: 1700 }, (_v, i) => `id${i}`);
    expect(helpers.buildPieVhWhereChunks(host, ids)).toEqual([
      "uniqueid IN (800)",
      "uniqueid IN (800)",
      "uniqueid IN (100)",
    ]);
  });

  test("eqAposSmart and makeAposVariants", () => {
    const host = makeHost();
    expect(helpers.makeAposVariants(host, "")).toEqual([""]);
    expect(helpers.makeAposVariants(host, "paxta")).toEqual(["paxta"]);
    expect(helpers.makeAposVariants(host, "bug'doy").length).toBeGreaterThan(1);
    expect(helpers.eqAposSmart(host, "turi", "")).toBe("");
    expect(helpers.eqAposSmart(host, "turi", "paxta")).toBe("turi='paxta'");
    expect(helpers.eqAposSmart(host, "turi", "bug'doy")).toMatch(/^\(turi='bug''doy' OR /);
  });

  test("makeViloyatKey strips apostrophes and whitespace", () => {
    const host = makeHost();
    expect(helpers.makeViloyatKey(host, null)).toBe("");
    expect(helpers.makeViloyatKey(host, "  Farg'ona   viloyati ")).toBe("fargona viloyati");
  });
});

describe("crop id maps", () => {
  test("ensureCropIdMaps builds both directions once", async () => {
    mockMappings.mockResolvedValue([
      { cropId: "7", turi: "Paxta" },
      { cropId: "", turi: "x" },
      { cropId: "7", turi: "Cotton" },
    ]);
    const host = makeHost();
    await helpers.ensureCropIdMaps(host);
    await helpers.ensureCropIdMaps(host);
    expect(mockMappings).toHaveBeenCalledTimes(1);
    expect(helpers.resolveCropIdToTuri(host, "7")).toBe("Paxta");
    expect(helpers.resolveCropIdToTuri(host, "99")).toBe("99");
    expect(helpers.resolveCropIdToTuri(host, "")).toBe("");
    expect(helpers.resolveTuriToCropId(host, "paxta")).toBe("7");
    expect(helpers.resolveTuriToCropId(host, "7")).toBe("7");
    expect(helpers.resolveTuriToCropId(host, "olma")).toBe("olma");
    expect(helpers.resolveTuriToCropId(host, " ")).toBe("");
    expect(helpers.turiNamesToCropIds(Object.assign(host, {}), ["Paxta", "paxta", ""])).toEqual(["7"]);
    expect(helpers.cropIdsToTuriNames(host, ["7", "7"])).toHaveLength(1);
    expect(helpers.getCropColor(host, "7", 0)).toMatch(/^#/);
    expect(helpers.getCategoryDisplayName(host, "7", "en")).toBeTruthy();
  });
});

describe("feature layer routing", () => {
  test("getDefaultFeatureLayer prefers republic layer", () => {
    const a = layer("a");
    const r = layer("rep", "Respublika");
    const host = makeHost({ featureLayers: [a, r] } as unknown as StatePatch);
    expect(helpers.getDefaultFeatureLayer(host)).toBe(r);
    expect(helpers.getDefaultFeatureLayer(host, [a])).toBe(a);
  });

  test("getFeatureLayerForViloyat uses index or falls back", () => {
    const a = layer("a");
    const b = layer("b");
    const host = makeHost({ featureLayers: [a, b] } as unknown as StatePatch);
    host._viloyatKeyToLayerIndex = { sirdaryo: 1 };
    expect(helpers.getFeatureLayerForViloyat(host, "Sirdaryo")).toBe(b);
    expect(helpers.getFeatureLayerForViloyat(host, "Xorazm")).toBe(a);
    expect(helpers.getFeatureLayerForViloyat(host, "")).toBeUndefined();
    expect(helpers.getFeatureLayerForViloyat(makeHost(), "x")).toBeUndefined();
  });

  test("resolveFeatureLayersFromUseDataSources returns table layer or []", async () => {
    const l = layer("t");
    mockTableLayer.mockResolvedValueOnce({ layer: l });
    await expect(helpers.resolveFeatureLayersFromUseDataSources(makeHost())).resolves.toEqual([l]);
    mockTableLayer.mockRejectedValueOnce(new Error("x"));
    await expect(helpers.resolveFeatureLayersFromUseDataSources(makeHost())).resolves.toEqual([]);
  });

  test("buildViloyatKeyToLayerIndex maps bootstrap rows when multiple layers", async () => {
    const host = makeHost();
    await helpers.buildViloyatKeyToLayerIndex(host, [layer("a")]);
    expect(mockBootstrap).not.toHaveBeenCalled();
    mockBootstrap.mockResolvedValueOnce({ regionDistrictRows: [{ viloyat: "Sirdaryo" }, { viloyat: "" }] });
    await helpers.buildViloyatKeyToLayerIndex(host, [layer("a"), layer("b")]);
    expect(host._viloyatKeyToLayerIndex).toEqual({ sirdaryo: 0 });
    mockBootstrap.mockRejectedValueOnce(new Error("down"));
    await expect(helpers.buildViloyatKeyToLayerIndex(host, [layer("a"), layer("b")])).resolves.toBeUndefined();
  });

  test("ensureFeatureLayersResolved initialises once and routes", async () => {
    const t = layer("t");
    mockTableLayer.mockResolvedValue({ layer: t });
    const host = makeHost();
    await expect(helpers.ensureFeatureLayersResolved(host)).resolves.toBe(t);
    expect(host.state.activeFeatureLayer).toBe(t);
    await expect(helpers.ensureFeatureLayersResolved(host)).resolves.toBe(t);
    const routed = makeHost({ featureLayers: [t], viloyat: "Sirdaryo" } as unknown as StatePatch);
    await expect(helpers.ensureFeatureLayersResolved(routed)).resolves.toBe(t);
    expect(routed.state.activeFeatureLayer).toBe(t);
  });
});

describe("map connection", () => {
  test("waitForMapToLoad rejects invalid, resolves ready, watches otherwise", async () => {
    const host = makeHost();
    await expect(helpers.waitForMapToLoad(host, null as unknown as Parameters<typeof helpers.waitForMapToLoad>[1])).rejects.toThrow(
      "Invalid map view provided",
    );
    const ready = { view: { ready: true } } as unknown as Parameters<typeof helpers.waitForMapToLoad>[1];
    await expect(helpers.waitForMapToLoad(host, ready)).resolves.toBeUndefined();
    const remove = jest.fn();
    const watching = {
      view: {
        ready: false,
        watch: (_p: string, cb: (v: boolean) => void): { remove: () => void } => {
          setTimeout(() => cb(true), 0);
          return { remove };
        },
      },
    } as unknown as Parameters<typeof helpers.waitForMapToLoad>[1];
    await expect(helpers.waitForMapToLoad(host, watching)).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalled();
    const never = {
      view: { ready: false, watch: (): { remove: () => void } => ({ remove }) },
    } as unknown as Parameters<typeof helpers.waitForMapToLoad>[1];
    await expect(helpers.waitForMapToLoad(host, never)).rejects.toThrow("Map load timeout");
  });

  test("connectToMap stores view; throws without map", async () => {
    const host = makeHost();
    await expect(helpers.connectToMap(host, {} as Parameters<typeof helpers.connectToMap>[1])).rejects.toThrow();
    const jmv = { view: { map: {} } } as unknown as Parameters<typeof helpers.connectToMap>[1];
    await helpers.connectToMap(host, jmv);
    expect(host.state.activeMapView).toBe(jmv);
    expect(host.state.connectionStatus).toBe("connected");
  });

  test("initializeAfterConnection runs once and applies external filters", () => {
    const host = makeHost({ activeMapView: {} } as unknown as StatePatch);
    (host as unknown as { props: Record<string, unknown> }).props = { externalFilters: { yil: "2024", viloyat: "V" } };
    helpers.initializeAfterConnection(host);
    helpers.initializeAfterConnection(host);
    expect(host.state.yil).toBe("2024");
    expect(host.fetchCategoryData).toHaveBeenCalledTimes(1);
    const plain = makeHost({ activeMapView: {} } as unknown as StatePatch);
    helpers.initializeAfterConnection(plain);
    expect(plain.fetchCategoryData).toHaveBeenCalled();
    const noMap = makeHost();
    helpers.initializeAfterConnection(noMap);
    expect(noMap.fetchCategoryData).not.toHaveBeenCalled();
  });

  test("onActiveViewChange without view proceeds without map", async () => {
    const host = makeHost({ mapConnectionAttempts: 0 } as unknown as StatePatch);
    await helpers.onActiveViewChange(host, null as unknown as Parameters<typeof helpers.onActiveViewChange>[1]);
    expect(host.state.mapLoadingStatus).toBe("failed");
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  test("onActiveViewChange connects, or reports errors and continues", async () => {
    const jmv = { view: { ready: true, map: {} } } as unknown as Parameters<typeof helpers.onActiveViewChange>[1];
    const host = makeHost({ connectionStatus: "idle" } as unknown as StatePatch);
    await helpers.onActiveViewChange(host, jmv);
    expect(host.state.mapLoadingStatus).toBe("loaded");
    expect(host.state.connectionStatus).toBe("connected");

    const failing = makeHost({}, {
      waitForMapToLoad: (): Promise<void> => Promise.reject(new Error("Map load timeout")),
    });
    await helpers.onActiveViewChange(failing, jmv);
    expect(failing.state.mapLoadingStatus).toBe("failed");
    expect(String(failing.state.error)).toContain("Map initialization issue");
  });

  test("retryMapConnection resets state", () => {
    const host = makeHost({ mapConnectionAttempts: 3 } as unknown as StatePatch);
    helpers.retryMapConnection(host);
    expect(host.state.connectionStatus).toBe("idle");
    expect(host.state.mapConnectionAttempts).toBe(0);
  });
});
