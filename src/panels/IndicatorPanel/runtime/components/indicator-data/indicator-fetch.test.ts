const mockPackReady = jest.fn();
const mockGetPack = jest.fn();
jest.mock("../../../../../store/agri-dashboard-store", () => ({
  waitForDashboardPackReady: (ms: number): unknown => mockPackReady(ms),
  getDashboardPack: (): unknown => mockGetPack(),
}));
const mockMatch = jest.fn();
jest.mock("../../../../../data/agri-dashboard-pack-match", () => ({
  matchIndicatorDashboardPack: (...a: unknown[]): unknown => mockMatch(...a),
}));
const mockOutStat = jest.fn();
jest.mock("../../../../../data/agri-indicator-stats", () => ({
  queryIndicatorOutStatNullable: (a: unknown): unknown => mockOutStat(a),
}));
jest.mock("../../../../../gis/agri-debug-log", () => ({ agriVhIndicatorLog: jest.fn() }));
const mockApiValue = jest.fn();
jest.mock("./indicator-api-client", () => ({
  requestIndicatorApiValue: (...a: unknown[]): unknown => mockApiValue(...a),
}));

import { makeIndicatorHost } from "../../__test-utils__/indicator-host-stub";
import type { IndicatorWidgetHost } from "../../indicator-host";
import type { IndicatorConfig, VegetationStatsWidgetState } from "../../widget";
import { fetchApiData, fetchData } from "./indicator-fetch";

type StatePatch = Partial<VegetationStatsWidgetState>;

interface FakeLayer {
  url: string;
  objectIdField: string;
  fields: Array<{ name: string }>;
  createQuery: () => Record<string, unknown>;
  queryFeatures: jest.Mock;
}

const makeLayer = (attrs: Record<string, unknown> | null, url = "http://l/0", fields: string[] = ["maydon", "objectid"]): FakeLayer => ({
  url,
  objectIdField: "objectid",
  fields: fields.map((name) => ({ name })),
  createQuery: (): Record<string, unknown> => ({}),
  queryFeatures: jest.fn(async () => ({ features: attrs ? [{ attributes: attrs }] : [] })),
});

const asLayer = (l: FakeLayer): __esri.FeatureLayer => l as unknown as __esri.FeatureLayer;

const setup = (
  state: StatePatch = {},
  config: IndicatorConfig = {},
  overrides: Partial<IndicatorWidgetHost> = {},
): { host: IndicatorWidgetHost; setState: jest.Mock } => {
  const stub = makeIndicatorHost(
    { connectionStatus: "connected", ...state },
    config,
    {
      buildApiUrl: () => "http://api/x",
      buildWhereClause: () => "1=1",
      nz: (f: string) => `${f} > 0`,
      isRepublicLayer: () => false,
      getFeatureLayerForViloyat: () => undefined,
      fetchGroupedStats: jest.fn(async () => undefined),
      ...overrides,
    },
  );
  return stub;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPackReady.mockResolvedValue(undefined);
  mockGetPack.mockReturnValue(null);
  mockMatch.mockReturnValue(null);
});

describe("fetchApiData", () => {
  it("does nothing when unmounted", async () => {
    const { host } = setup();
    host._isMounted = false;
    await fetchApiData(host);
    expect(mockApiValue).not.toHaveBeenCalled();
  });

  it("stays in loading state when the year is not published", async () => {
    const { host } = setup({ vegetationArea: 5 }, {}, { shouldFetchForViloyat: () => false });
    await fetchApiData(host);
    expect(host.state.loading).toBe(true);
    expect(host.state.vegetationArea).toBeNull();
    expect(mockApiValue).not.toHaveBeenCalled();
  });

  it("builds the request URL from filters and stores a rounded value", async () => {
    mockApiValue.mockResolvedValue(12.3456);
    const { host } = setup(
      { selectedYil: "2025", selectedCropType: "Bug`doy", selectedYerToifas: "Sug`oriladigan", selectedViloyat: "Andijon", selectedTuman: "Asaka" },
      { decimalPlaces: 2, responseField: "total" },
    );
    await fetchApiData(host);
    const [url, signal, field] = mockApiValue.mock.calls[0] as [string, AbortSignal, string];
    const params = new URL(url).searchParams;
    expect(url.startsWith("http://api/x?")).toBe(true);
    expect(params.get("yil")).toBe("2025");
    expect(params.get("ekin_turi")).toBe("Bug'doy");
    expect(params.get("turi")).toBe("Sug'oriladigan");
    expect(params.get("viloyat")).toBeTruthy();
    expect(params.get("tuman")).toBeTruthy();
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(field).toBe("total");
    expect(host.state.vegetationArea).toBe(12.35);
    expect(host.state.totalArea).toBe(12.35);
    expect(host.state.loading).toBe(false);
    expect(host.state.error).toBeNull();
    expect(host._abortController).toBeNull();
  });

  it("uses custom yerToifasParam and treats null API value as zero", async () => {
    mockApiValue.mockResolvedValue(null);
    const { host } = setup({ selectedYerToifas: "A" }, { yerToifasParam: " cat " });
    await fetchApiData(host);
    const url = mockApiValue.mock.calls[0][0] as string;
    expect(new URL(url).searchParams.get("cat")).toBe("A");
    expect(host.state.vegetationArea).toBe(0);
  });

  it("reports API errors", async () => {
    mockApiValue.mockRejectedValue(new Error("HTTP 500"));
    const { host } = setup();
    await fetchApiData(host);
    expect(host.state.error).toBe("HTTP 500");
    expect(host.state.loading).toBe(false);
  });

  it("uses a default message for non-Error rejections", async () => {
    mockApiValue.mockRejectedValue("nope");
    const { host } = setup();
    await fetchApiData(host);
    expect(host.state.error).toBe("Failed to fetch data from API");
  });

  it("ignores abort errors silently", async () => {
    mockApiValue.mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }));
    const { host } = setup();
    await fetchApiData(host);
    expect(host.state.error).toBeNull();
  });

  it("drops results of superseded requests", async () => {
    let resolve: (v: number) => void = () => undefined;
    mockApiValue.mockImplementation(() => new Promise<number>((r) => { resolve = r; }));
    const { host } = setup();
    const p = fetchApiData(host);
    await Promise.resolve();
    host._requestId += 1;
    resolve(9);
    await p;
    expect(host.state.vegetationArea).toBeNull();
  });

  it("aborts the previous in-flight controller", async () => {
    mockApiValue.mockResolvedValue(1);
    const { host } = setup();
    const old = new AbortController();
    host._abortController = old;
    await fetchApiData(host);
    expect(old.signal.aborted).toBe(true);
  });
});

describe("fetchData routing", () => {
  it("delegates to the API source when configured", async () => {
    const fetchApi = jest.fn(async () => undefined);
    const { host } = setup({}, { useApiDataSource: true }, { fetchApiData: fetchApi });
    await fetchData(host);
    expect(fetchApi).toHaveBeenCalled();
  });

  it("stays loading when year not published", async () => {
    const { host } = setup({}, {}, { shouldFetchForViloyat: () => false });
    await fetchData(host);
    expect(host.state.loading).toBe(true);
    expect(host.state.featureCount).toBe(0);
  });

  it("waits for VH uniqueids when a VH is active", async () => {
    const { host } = setup({ selectedVegetationStatus: "Alo", vhUniqueids: null });
    await fetchData(host);
    expect(host.state.loading).toBe(true);
    expect(host._requestId).toBe(0);
  });

  it("uses grouped stats when groupByField is configured", async () => {
    const grouped = jest.fn(async () => undefined);
    const { host } = setup({ selectedVegetationStatus: "Alo", vhUniqueids: ["a"] }, { groupByField: "turi" }, { fetchGroupedStats: grouped });
    await fetchData(host);
    expect(grouped).toHaveBeenCalled();
  });

  it("does not query while disconnected", async () => {
    const { host } = setup({ connectionStatus: "connecting", selectedVegetationStatus: "Alo", vhUniqueids: [] });
    await fetchData(host);
    expect(host._requestId).toBe(0);
  });

  it("errors when no feature layer is available", async () => {
    const { host } = setup();
    await fetchData(host);
    expect(host.state.error).toBe("No feature layer available");
    expect(host.state.loading).toBe(false);
  });
});

describe("fetchData stats", () => {
  it("count: runs an outStatistics query on the object id field", async () => {
    const layer = makeLayer({ agg: 41.6 });
    const { host } = setup({}, { statOperation: "count" }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.vegetationArea).toBe(42);
    expect(host.state.totalArea).toBe(42);
    expect(host.state.error).toBeNull();
    expect(host._abortController).toBeNull();
  });

  it("avg with decimal places", async () => {
    const layer = makeLayer({ agg: 3.14159 });
    const { host } = setup({}, { statOperation: "avg", attributeField: "maydon", decimalPlaces: 2 }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.vegetationArea).toBe(3.14);
  });

  it("appends the non-zero predicate when excludeZeroValues is set", async () => {
    const layer = makeLayer({ agg: 1 });
    const spy = jest.spyOn(layer, "createQuery");
    const created: Array<Record<string, unknown>> = [];
    spy.mockImplementation(() => {
      const q: Record<string, unknown> = {};
      created.push(q);
      return q;
    });
    const { host } = setup({}, { statOperation: "max", attributeField: "maydon", excludeZeroValues: true }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(created[0].where).toBe("1=1 AND maydon > 0");
    expect(created[0].outStatistics).toEqual([{ onStatisticField: "maydon", statisticType: "max", outStatisticFieldName: "agg" }]);
  });

  it("non-count aggregation without a field reports a config error", async () => {
    const layer = makeLayer({ agg: 1 });
    const { host } = setup({}, { statOperation: "min" }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.error).toBe("Select attribute field for this aggregation");
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  it("first: orders by the field and returns the first row", async () => {
    const layer = makeLayer({ maydon: 7.4 });
    const created: Array<Record<string, unknown>> = [];
    layer.createQuery = (): Record<string, unknown> => {
      const q: Record<string, unknown> = {};
      created.push(q);
      return q;
    };
    const { host } = setup({}, { statOperation: "first", attributeField: "maydon" }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(created[0].orderByFields).toEqual(["maydon ASC"]);
    expect(created[0].num).toBe(1);
    expect(host.state.vegetationArea).toBe(7);
    expect(host.state.featureCount).toBe(1);
  });

  it("first: empty result yields zero", async () => {
    const layer = makeLayer(null);
    const { host } = setup({}, { statOperation: "first", attributeField: "maydon" }, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.vegetationArea).toBe(0);
    expect(host.state.featureCount).toBe(0);
  });

  it("falls back to state.featureLayer when no canonical layer", async () => {
    const layer = makeLayer({ agg: 5 });
    const { host } = setup({ featureLayer: asLayer(layer) }, {});
    await fetchData(host);
    expect(host.state.vegetationArea).toBe(5);
  });

  it("reports query failures", async () => {
    const layer = makeLayer({ agg: 1 });
    layer.queryFeatures.mockRejectedValue(new Error("bad query"));
    const { host } = setup({ selectedVegetationStatus: "Alo", vhUniqueids: ["a"] }, {}, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.error).toBe("bad query");
    expect(host.state.loading).toBe(false);
  });

  it("uses a default message when the failure has no message", async () => {
    const layer = makeLayer({ agg: 1 });
    layer.queryFeatures.mockRejectedValue({});
    const { host } = setup({}, {}, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.error).toBe("Query failed");
  });

  it("abort during query only clears loading", async () => {
    const layer = makeLayer({ agg: 1 });
    layer.queryFeatures.mockRejectedValue(Object.assign(new Error("a"), { name: "AbortError" }));
    const { host } = setup({}, {}, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(host.state.error).toBeNull();
    expect(host.state.loading).toBe(false);
  });
});

describe("fetchData sum", () => {
  const sumCfg: IndicatorConfig = { statOperation: "sum", attributeField: "maydon", decimalPlaces: 1 };

  it("uses a matching dashboard pack for default sum(maydon)", async () => {
    mockMatch.mockReturnValue({ value: 123.46 });
    const layer = makeLayer(null);
    const { host } = setup({}, sumCfg, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(mockPackReady).toHaveBeenCalledWith(2500);
    expect(host.state.vegetationArea).toBe(123.5);
    expect(mockOutStat).not.toHaveBeenCalled();
  });

  it("does not consume the pack when a VH is active", async () => {
    mockMatch.mockReturnValue({ value: 1 });
    mockOutStat.mockResolvedValue(10);
    const layer = makeLayer(null);
    const { host } = setup({ selectedVegetationStatus: "Alo", vhUniqueids: ["a"] }, sumCfg, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(mockPackReady).not.toHaveBeenCalled();
    expect(host.state.vegetationArea).toBe(10);
  });

  it("sums via outStatistics on the canonical layer for republic overview", async () => {
    mockOutStat.mockResolvedValue(55.55);
    const layer = makeLayer(null);
    const { host } = setup({ featureLayers: [asLayer(layer)] }, sumCfg, { _canonicalFeatureLayer: asLayer(layer) });
    await fetchData(host);
    expect(mockOutStat).toHaveBeenCalledWith({ layer, where: "1=1", statisticType: "sum", onStatisticField: "maydon" });
    expect(host.state.vegetationArea).toBe(55.5);
  });

  it("sums across distinct non-republic regional layers", async () => {
    mockOutStat.mockResolvedValueOnce(10).mockResolvedValueOnce(5);
    const canonical = makeLayer(null, "http://l/canon");
    const a = makeLayer(null, "http://l/a");
    const b = makeLayer(null, "http://l/b");
    const { host } = setup({ featureLayers: [asLayer(a), asLayer(b)] }, { statOperation: "sum", attributeField: "area_x" }, { _canonicalFeatureLayer: asLayer(canonical) });
    a.fields = [{ name: "area_x" }];
    b.fields = [{ name: "AREA_X" }];
    await fetchData(host);
    expect(mockOutStat).toHaveBeenCalledTimes(2);
    expect(host.state.vegetationArea).toBe(15);
  });

  it("skips layers that lack the field and treats missing rows as zero", async () => {
    mockOutStat.mockResolvedValue(null);
    const canonical = makeLayer(null, "http://l/canon");
    const a = makeLayer(null, "http://l/a", ["nothing"]);
    const b = makeLayer(null, "http://l/b", ["maydon"]);
    const { host } = setup({ featureLayers: [asLayer(a), asLayer(b)] }, sumCfg, { _canonicalFeatureLayer: asLayer(canonical) });
    await fetchData(host);
    expect(mockOutStat).toHaveBeenCalledTimes(1);
    expect(host.state.vegetationArea).toBe(0);
  });

  it("with a viloyat selected, queries the routed layer using viloyat-scoped WHERE", async () => {
    mockOutStat.mockResolvedValue(8);
    const routed = makeLayer(null, "http://l/routed");
    const canonical = makeLayer(null, "http://l/canon");
    const buildWhereClause = jest.fn((includeViloyat?: boolean) => (includeViloyat ? "viloyat='X'" : "1=1"));
    const { host } = setup(
      { selectedViloyat: "X", featureLayers: [asLayer(routed)] },
      { ...sumCfg, excludeZeroValues: true },
      { _canonicalFeatureLayer: asLayer(canonical), buildWhereClause, getFeatureLayerForViloyat: () => asLayer(routed) },
    );
    await fetchData(host);
    expect(mockOutStat).toHaveBeenCalledWith(expect.objectContaining({ layer: routed, where: "viloyat='X' AND maydon > 0" }));
    expect(host.state.vegetationArea).toBe(8);
  });

  it("with a viloyat selected falls back to canonical layer when routing finds none", async () => {
    mockOutStat.mockResolvedValue(2);
    const canonical = makeLayer(null, "http://l/canon");
    const { host } = setup({ selectedViloyat: "X" }, sumCfg, { _canonicalFeatureLayer: asLayer(canonical) });
    await fetchData(host);
    expect(mockOutStat).toHaveBeenCalledWith(expect.objectContaining({ layer: canonical }));
  });

  it("drops results when superseded mid-sum", async () => {
    let resolve: (v: number) => void = () => undefined;
    mockOutStat.mockImplementation(() => new Promise<number>((r) => { resolve = r; }));
    const canonical = makeLayer(null);
    const { host } = setup({}, sumCfg, { _canonicalFeatureLayer: asLayer(canonical) });
    const p = fetchData(host);
    await new Promise((r) => setTimeout(r, 0));
    host._requestId += 1;
    resolve(3);
    await p;
    expect(host.state.vegetationArea).toBeNull();
  });
});
