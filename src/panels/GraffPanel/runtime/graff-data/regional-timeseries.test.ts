jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));

const mockQueryMerged = jest.fn();
jest.mock("../../../../data/agri-graff-stats", () => ({
  buildGraffRegionalScopeKey: (opts: Record<string, unknown>): string => JSON.stringify(opts),
  queryGraffRegionalTimeseriesMerged: (...args: unknown[]): unknown => mockQueryMerged(...args),
}));

const mockGetDashboardPack = jest.fn();
jest.mock("../../../../store/agri-dashboard-store", () => ({
  waitForDashboardPackReady: (): Promise<void> => Promise.resolve(),
  getDashboardPack: (): unknown => mockGetDashboardPack(),
}));

import { fetchGraffRegionalTimeseries, type GraffDataServiceHost } from "./regional-timeseries";
import type { AgriGraffWidgetState } from "../graff-state";

type HostState = Partial<AgriGraffWidgetState>;

const baseFilters = { viloyat: "", tuman: "", yil: "2024", uzspace: "", turlar: [] as string[], vh: "" };

const makeHost = (state: HostState = {}, overrides: Partial<GraffDataServiceHost> = {}): GraffDataServiceHost => {
  const host = {
    state: {
      viewMode: "graph",
      regionalFilters: { ...baseFilters },
      regionalRegionCode: null,
      regionalDistrictCode: null,
      vegetationData: [],
      vegetationError: null,
      selectedIndices: ["ndvi"],
      language: "en",
      ...state,
    },
    _isMounted: true,
    _hasCompletedGraphFetch: false,
    _vegetationDataRequestId: 0,
    _regionalTimeseriesRequestId: 0,
    _regionalTimeseriesRequestKey: "",
    _regionalTimeseriesAppliedKey: "",
    _regionalTimeseriesLoadedAvgFields: new Set<string>(),
    _viloyatToRegion: { sirdaryo: 1724 },
    _turiToCropId: {},
    beginGraphFetch: jest.fn(),
    ensureRegionDistrictForSelection: jest.fn((): Promise<void> => Promise.resolve()),
    normalizeApos: (s: string): string => s,
    makeRegionDistrictKey: (raw: string | null | undefined): string => String(raw || "").toLowerCase(),
    resolveDistrictNumber: jest.fn((): number | undefined => undefined),
    resolveCropIdForTuri: jest.fn((turi: string): string | undefined => (turi === "paxta" ? "7" : undefined)),
    applyGraphData: jest.fn(),
    ...overrides,
  } as unknown as GraffDataServiceHost;
  host.setState = ((patch: HostState): void => {
    host.state = { ...host.state, ...patch };
  }) as GraffDataServiceHost["setState"];
  return host;
};

const row = (date: string, ndvi: number): Record<string, unknown> => ({ date, ndvi, polygon_count: 2 });

beforeEach(() => {
  mockQueryMerged.mockReset();
  mockGetDashboardPack.mockReset();
  mockGetDashboardPack.mockReturnValue({ phase: "idle" });
});

describe("fetchGraffRegionalTimeseries guards", () => {
  test("skips when a polygon is selected", async () => {
    const host = makeHost({ selecteduniqueid: "U1" });
    await fetchGraffRegionalTimeseries(host);
    expect(host.beginGraphFetch).not.toHaveBeenCalled();
  });

  test("skips outside graph view", async () => {
    const host = makeHost({ viewMode: "table" });
    await fetchGraffRegionalTimeseries(host);
    expect(host.beginGraphFetch).not.toHaveBeenCalled();
  });

  test("keeps spinner when year is missing", async () => {
    const host = makeHost({ regionalFilters: { ...baseFilters, yil: "" } });
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.loadingVegetation).toBe(true);
    expect(mockQueryMerged).not.toHaveBeenCalled();
  });

  test("fails closed with localized error for unresolved region", async () => {
    const host = makeHost({ regionalFilters: { ...baseFilters, viloyat: "Unknown" } });
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.vegetationError).toBe("Could not determine the selected region code.");
    expect(host.state.loadingVegetation).toBe(false);
    expect(host._hasCompletedGraphFetch).toBe(true);
  });

  test.each([
    ["ru", "Не удалось определить код выбранного района."],
    ["uz_lat", "Tanlangan tuman kodi aniqlanmadi."],
    ["uz_cyr", "Танланган туман коди аниқланмади."],
  ])("unresolved district error in %s", async (language, message) => {
    const host = makeHost({
      language: language as AgriGraffWidgetState["language"],
      regionalFilters: { ...baseFilters, viloyat: "sirdaryo", tuman: "X" },
    });
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.vegetationError).toBe(message);
  });

  test("fails closed when crop cannot be resolved", async () => {
    const host = makeHost({ language: "ru", regionalFilters: { ...baseFilters, turlar: ["olma"] } });
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.vegetationError).toBe("Не удалось определить код выбранной культуры.");
  });

  test("stale after ensure returns silently", async () => {
    const host = makeHost();
    host.ensureRegionDistrictForSelection = jest.fn((): Promise<void> => {
      host._isMounted = false;
      return Promise.resolve();
    });
    await fetchGraffRegionalTimeseries(host);
    expect(mockQueryMerged).not.toHaveBeenCalled();
  });
});

describe("fetchGraffRegionalTimeseries data", () => {
  test("republic scope queries selected avg fields and applies sorted rows", async () => {
    mockQueryMerged.mockResolvedValue([row("2024-03-01", 0.5), row("2024-01-01", 0.3)]);
    const host = makeHost({ selectedIndices: ["ndvi", "savi"] });
    await fetchGraffRegionalTimeseries(host);
    const args = mockQueryMerged.mock.calls[0][0] as { avgFields?: string[]; region?: number };
    expect(args.avgFields).toEqual(["ndvi", "savi"]);
    expect(args.region).toBeUndefined();
    const applied = (host.applyGraphData as jest.Mock).mock.calls[0][0] as Array<{ raster_date: string }>;
    expect(applied.map((r) => r.raster_date)).toEqual(["2024-01-01", "2024-03-01"]);
    expect(host._regionalTimeseriesLoadedAvgFields.has("savi")).toBe(true);
  });

  test("viloyat scope uses full stats and region number", async () => {
    mockQueryMerged.mockResolvedValue([row("2024-02-01", 0.4)]);
    const host = makeHost({
      regionalFilters: { ...baseFilters, viloyat: "sirdaryo", turlar: ["paxta"] },
    });
    await fetchGraffRegionalTimeseries(host);
    const args = mockQueryMerged.mock.calls[0][0] as { avgFields?: string[]; region?: number; cropIds: string[] };
    expect(args.region).toBe(1724);
    expect(args.avgFields).toBeUndefined();
    expect(args.cropIds).toEqual(["7"]);
    expect(host._regionalTimeseriesLoadedAvgFields.size).toBe(6);
  });

  test("numeric viloyat and stored district code are used", async () => {
    mockQueryMerged.mockResolvedValue([]);
    const host = makeHost({
      regionalDistrictCode: 55,
      regionalFilters: { ...baseFilters, viloyat: "1735", tuman: "T" },
    });
    await fetchGraffRegionalTimeseries(host);
    const args = mockQueryMerged.mock.calls[0][0] as { region?: number; district?: number };
    expect(args.region).toBe(1735);
    expect(args.district).toBe(55);
  });

  test("skips refetch when same scope already applied", async () => {
    mockQueryMerged.mockResolvedValue([row("2024-01-01", 0.3)]);
    const host = makeHost();
    await fetchGraffRegionalTimeseries(host);
    host.state = { ...host.state, vegetationData: [{ raster_date: "2024-01-01" }] as AgriGraffWidgetState["vegetationData"] };
    await fetchGraffRegionalTimeseries(host);
    expect(mockQueryMerged).toHaveBeenCalledTimes(1);
    expect(host.state.loadingVegetation).toBe(false);
  });

  test("augments existing republic series with missing index", async () => {
    mockQueryMerged.mockResolvedValueOnce([row("2024-01-01", 0.3)]);
    const host = makeHost();
    await fetchGraffRegionalTimeseries(host);
    host.state = {
      ...host.state,
      selectedIndices: ["ndvi", "evi"],
      vegetationData: [{ date: "2024-01-01", raster_date: "2024-01-01", ndvi: 0.3 }] as unknown as AgriGraffWidgetState["vegetationData"],
    };
    mockQueryMerged.mockResolvedValueOnce([{ date: "2024-01-01", evi: 0.8, polygon_count: 2 }]);
    await fetchGraffRegionalTimeseries(host);
    const args = mockQueryMerged.mock.calls[1][0] as { avgFields?: string[] };
    expect(args.avgFields).toEqual(["evi"]);
    const applied = (host.applyGraphData as jest.Mock).mock.calls[1][0] as Array<Record<string, unknown>>;
    expect(applied[0].ndvi).toBe(0.3);
    expect(applied[0].evi).toBe(0.8);
  });

  test("uses dashboard pack rows when scope matches", async () => {
    const host = makeHost();
    const scopeKey = JSON.stringify({
      region: null,
      district: null,
      cropIds: [],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      vh: "",
    });
    mockGetDashboardPack.mockReturnValue({
      phase: "ready",
      graff: { scopeKey, rows: [row("2024-05-01", 0.6)] },
    });
    await fetchGraffRegionalTimeseries(host);
    expect(mockQueryMerged).not.toHaveBeenCalled();
    expect((host.applyGraphData as jest.Mock).mock.calls[0][0]).toHaveLength(1);
  });

  test("query failure surfaces error message", async () => {
    mockQueryMerged.mockRejectedValue(new Error("server down"));
    const host = makeHost();
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.vegetationError).toBe("server down");
    expect(host.state.vegetationData).toEqual([]);
    expect(host._regionalTimeseriesAppliedKey).toBe("");
  });

  test("failure without message uses default text", async () => {
    mockQueryMerged.mockRejectedValue("x");
    const host = makeHost();
    await fetchGraffRegionalTimeseries(host);
    expect(host.state.vegetationError).toBe("Вилоят вақт қатори юклана олмади.");
  });

  test("stale response is discarded", async () => {
    const host = makeHost();
    mockQueryMerged.mockImplementation((): Promise<unknown[]> => {
      host._regionalTimeseriesRequestId += 1;
      return Promise.resolve([row("2024-01-01", 0.3)]);
    });
    await fetchGraffRegionalTimeseries(host);
    expect(host.applyGraphData).not.toHaveBeenCalled();
  });
});
