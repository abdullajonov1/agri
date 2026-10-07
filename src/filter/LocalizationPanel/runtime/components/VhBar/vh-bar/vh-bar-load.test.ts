jest.mock("../../../../../localization/resolve-geo-codes", () => ({
  buildVhUniqueIdCacheKey: jest.fn(() => "KEY"),
}));
jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationUniqueIdsForStatus: jest.fn(),
}));
jest.mock("../../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { buildVhUniqueIdCacheKey } from "../../../../../localization/resolve-geo-codes";
import { queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import { loadNdviBucketIds, resolveVhRegionChartUniqueIdsBackground } from "./vh-bar-load";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;

const params = { status: "yaxshi", regionNum: 3, cropIds: ["1"], ndviDate: "2024-05-01", vhCategory: "2-Yaxshi" };

/** Host whose cache setter really stores the entry (mirrors the widget). */
const mkBg = (init: FakeHostInit = {}): FakeHost => {
  const host: FakeHost = makeFakeHost({
    setVhUniqueIdCacheEntry: jest.fn((k: string, ids: string[]) => { host._vhUniqueIdCache[k] = ids; }),
    state: { vh: "2-Yaxshi" },
    ...init,
  });
  return host;
};

beforeEach(() => {
  jest.clearAllMocks();
  m(buildVhUniqueIdCacheKey).mockReturnValue("KEY");
});

describe("resolveVhRegionChartUniqueIdsBackground", () => {
  it("queries, caches and rebroadcasts region-wide ids", async () => {
    m(queryVegetationUniqueIdsForStatus).mockResolvedValue(["a", "b"]);
    const host = mkBg();
    await resolveVhRegionChartUniqueIdsBackground(host, 0, params);
    expect(m(queryVegetationUniqueIdsForStatus).mock.calls[0][0]).toEqual({
      region: 3, district: undefined, date: "2024-05-01", ndviStatus: "yaxshi", cropIds: ["1"],
    });
    expect(host.setVhUniqueIdCacheEntry).toHaveBeenCalledWith("KEY", ["a", "b"]);
    expect(host._vhRegionChartUniqueIds).toEqual(["a", "b"]);
    expect(host._reuseVhBarDataOnNextBroadcast).toBe(true);
    expect(host.broadcastFilterState).toHaveBeenCalled();
  });

  it("omits cropIds when empty and uses the cache when available", async () => {
    m(queryVegetationUniqueIdsForStatus).mockResolvedValue([]);
    await resolveVhRegionChartUniqueIdsBackground(mkBg(), 0, { ...params, cropIds: [] });
    expect(m(queryVegetationUniqueIdsForStatus).mock.calls[0][0].cropIds).toBeUndefined();
    m(queryVegetationUniqueIdsForStatus).mockClear();
    const cached = mkBg({ _vhUniqueIdCache: { KEY: ["cached"] } });
    await resolveVhRegionChartUniqueIdsBackground(cached, 0, params);
    expect(queryVegetationUniqueIdsForStatus).not.toHaveBeenCalled();
    expect(cached._vhRegionChartUniqueIds).toEqual(["cached"]);
  });

  it("drops results when superseded, not current, or VH was cleared", async () => {
    m(queryVegetationUniqueIdsForStatus).mockResolvedValue(["a"]);
    const gen = mkBg({ _vhResolveGen: 5 });
    await resolveVhRegionChartUniqueIdsBackground(gen, 4, params);
    const notCurrent = mkBg();
    await resolveVhRegionChartUniqueIdsBackground(notCurrent, 0, params, () => false);
    const noVh = mkBg({ state: { vh: "" } });
    await resolveVhRegionChartUniqueIdsBackground(noVh, 0, params);
    for (const h of [gen, notCurrent, noVh]) {
      expect(h.broadcastFilterState).not.toHaveBeenCalled();
      expect(h._vhRegionChartUniqueIds).toBeNull();
    }
  });

  it("does not store ids when it becomes stale during the query", async () => {
    const host = mkBg();
    m(queryVegetationUniqueIdsForStatus).mockImplementation(() => { host._isMounted = false; return Promise.resolve(["a"]); });
    await resolveVhRegionChartUniqueIdsBackground(host, 0, params);
    expect(host.setVhUniqueIdCacheEntry).not.toHaveBeenCalled();
  });

  it("falls back to an empty list on failure and rebroadcasts", async () => {
    m(queryVegetationUniqueIdsForStatus).mockRejectedValue(new Error("down"));
    const host = mkBg();
    await resolveVhRegionChartUniqueIdsBackground(host, 0, params);
    expect(host._vhRegionChartUniqueIds).toEqual([]);
    expect(host.broadcastFilterState).toHaveBeenCalled();
  });

  it("stays silent on failure when stale", async () => {
    m(queryVegetationUniqueIdsForStatus).mockRejectedValue(new Error("down"));
    const host = mkBg({ _isMounted: false });
    await resolveVhRegionChartUniqueIdsBackground(host, 0, params);
    expect(host.broadcastFilterState).not.toHaveBeenCalled();
  });
});

describe("loadNdviBucketIds", () => {
  interface Q { where?: string; outFields?: string[]; resultOffset?: number; resultRecordCount?: number; returnGeometry?: boolean }
  const layerWith = (pages: Array<Array<Record<string, unknown>>>, fieldNames: string[]): { layer: __esri.FeatureLayer; queries: Q[] } => {
    const queries: Q[] = [];
    let i = 0;
    const layer = {
      fields: fieldNames.map((name) => ({ name })),
      createQuery: (): Q => { const q: Q = {}; queries.push(q); return q; },
      queryFeatures: jest.fn(() => Promise.resolve({ features: (pages[i++] ?? []).map((attributes) => ({ attributes })) })),
    } as unknown as __esri.FeatureLayer;
    return { layer, queries };
  };
  const mk = (layer: __esri.FeatureLayer | undefined, init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      buildNdviSpatialWhere: () => "region=3",
      ...init,
      state: { ndviDate: "2024-05-01", featureLayer: layer, featureLayers: [], ...init.state },
    });
  const full = (prefix: string): Array<Record<string, unknown>> =>
    Array.from({ length: 2000 }, (_, i) => ({ uniqueid: `${prefix}${i}` }));

  it("returns early without date, layer, known category or status field", async () => {
    const { layer } = layerWith([], ["status_2024_05_01"]);
    const a = mk(layer, { state: { ndviDate: " " } });
    await loadNdviBucketIds(a, "2-Yaxshi");
    const b = mk(undefined);
    await loadNdviBucketIds(b, "2-Yaxshi");
    const c = mk(layer);
    await loadNdviBucketIds(c, "unknown");
    const noField = layerWith([], ["other"]);
    const d = mk(noField.layer);
    await loadNdviBucketIds(d, "2-Yaxshi");
    for (const h of [a, b, c, d]) expect(h._ndviBucketToIds).toEqual({});
    expect(layer.queryFeatures).not.toHaveBeenCalled();
    expect(noField.layer.queryFeatures).not.toHaveBeenCalled();
  });

  it("collects distinct join ids using the derived status field and spatial WHERE", async () => {
    const { layer, queries } = layerWith([[{ uniqueid: "a" }, { uniqueid: "" }, { uniqueid: null }, { uniqueid: "b" }, { uniqueid: "a" }]], ["STATUS_2024_05_01"]);
    const h = mk(layer);
    await loadNdviBucketIds(h, "2-Yaxshi");
    expect(queries[0].where).toBe("(region=3) AND status_2024_05_01 = 'yaxshi'");
    expect(queries[0]).toMatchObject({ outFields: ["uniqueid"], returnGeometry: false, resultOffset: 0, resultRecordCount: 2000 });
    expect(h._ndviBucketToIds["2-Yaxshi"]).toEqual(["a", "b"]);
  });

  it("uses the mapped date field and custom join field, skipping a 1=0 spatial clause", async () => {
    const { layer, queries } = layerWith([[{ pid: "x" }]], ["st_custom"]);
    const h = mk(layer, {
      buildNdviSpatialWhere: () => "1=0",
      _ndviDateFieldMap: { "2024-05-01": "st_custom" },
      props: { config: { polygonJoinField: "pid" } },
    });
    await loadNdviBucketIds(h, "1-Juda yaxshi");
    expect(queries[0].where).toBe("st_custom = 'juda_yaxshi'");
    expect(h._ndviBucketToIds["1-Juda yaxshi"]).toEqual(["x"]);
  });

  it("stops paging when a full page adds no new ids", async () => {
    const { layer, queries } = layerWith([full("a"), full("a"), [{ uniqueid: "z" }]], ["status_2024_05_01"]);
    const h = mk(layer);
    await loadNdviBucketIds(h, "3-O'rta");
    expect(queries.map((q) => q.resultOffset)).toEqual([0, 2000]);
    expect(h._ndviBucketToIds["3-O'rta"]).toHaveLength(2000);
  });

  it("continues to the next page while full pages add new ids", async () => {
    const { layer, queries } = layerWith([full("a"), full("b"), [{ uniqueid: "z" }]], ["status_2024_05_01"]);
    const h = mk(layer);
    await loadNdviBucketIds(h, "4-Past");
    expect(queries.map((q) => q.resultOffset)).toEqual([0, 2000, 4000]);
    expect(h._ndviBucketToIds["4-Past"]).toHaveLength(4001);
  });
});
