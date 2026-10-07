const mockEsriRequest = jest.fn();

class MockExtent {
  xmin?: number;
  ymin?: number;
  xmax?: number;
  ymax?: number;
  constructor(props: { xmin?: number; ymin?: number; xmax?: number; ymax?: number }) {
    Object.assign(this, props);
  }
}

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (names: string[]) =>
    Promise.resolve(
      names.map((name) => {
        if (name === "esri/request") return mockEsriRequest;
        if (name === "esri/geometry/Extent") return MockExtent;
        if (name === "esri/config") return { request: { interceptors: [] } };
        throw new Error(`unexpected module ${name}`);
      }),
    ),
}));

import {
  countWhereUncached,
  distinctValues,
  invalidateAgriQueryCache,
  queryLayerExtent,
  queryLayerJson,
  runStatsQueryUncached,
} from "./lookup-query";
import { queryCountCache, queryJsonCache } from "../primitives";
import type { AgriLayerLike } from "../../agri-layer-types";
import type { FakeQuery } from "../__test-utils__/fake-layer";
import { asFeatureSet, asQuery, makeLayer, uniqueLayerUrl } from "../__test-utils__/fake-layer";

type Rows = Array<Record<string, unknown>>;

const respond = (data: unknown): void => {
  mockEsriRequest.mockResolvedValueOnce({ data });
};

/** Queryable layer whose createQuery hands back the recorded query objects. */
function queryLayer(opts: {
  url?: string;
  rows?: Rows;
  count?: number;
  fail?: boolean;
  exceeded?: boolean;
  maxRecordCount?: number;
}): { layer: AgriLayerLike; queries: FakeQuery[] } {
  const queries: FakeQuery[] = [];
  const layer: AgriLayerLike & { maxRecordCount?: number } = makeLayer({
    url: opts.url,
    createQuery: () => {
      const q: FakeQuery = {};
      queries.push(q);
      return asQuery(q);
    },
    queryFeatures: jest.fn(() =>
      opts.fail
        ? Promise.reject(new Error("layer failed"))
        : Promise.resolve(
            asFeatureSet({
              features: (opts.rows ?? []).map((attributes) => ({ attributes })),
              exceededTransferLimit: opts.exceeded,
            }),
          ),
    ),
    queryFeatureCount: jest.fn(() =>
      opts.fail ? Promise.reject(new Error("count failed")) : Promise.resolve(opts.count ?? 0),
    ),
  });
  if (opts.maxRecordCount) layer.maxRecordCount = opts.maxRecordCount;
  return { layer, queries };
}

beforeEach(() => {
  mockEsriRequest.mockReset();
  invalidateAgriQueryCache(true);
});

describe("queryLayerJson", () => {
  test("throws when the layer has no URL", async () => {
    await expect(queryLayerJson(makeLayer(), {})).rejects.toThrow("Layer has no URL");
  });

  test("sends f=json with params and caches identical requests", async () => {
    const layer = makeLayer({ url: uniqueLayerUrl("json") });
    respond({ count: 5 });
    const a = await queryLayerJson(layer, { where: "1=1", returnCountOnly: true });
    const b = await queryLayerJson(layer, { returnCountOnly: true, where: "1=1" });
    expect(a).toEqual({ count: 5 });
    expect(b).toBe(a);
    expect(mockEsriRequest).toHaveBeenCalledTimes(1);
    const [url, options] = mockEsriRequest.mock.calls[0];
    expect(url).toMatch(/\/MapServer\/0\/query$/);
    expect(options.query).toEqual({ f: "json", where: "1=1", returnCountOnly: true });
  });

  test("REST error payloads reject and are evicted from the cache", async () => {
    const layer = makeLayer({ url: uniqueLayerUrl("jsonerr") });
    respond({ error: { message: "Invalid query" } });
    await expect(queryLayerJson(layer, { where: "bad" })).rejects.toThrow("Invalid query");
    expect(queryJsonCache.size).toBe(0);
    respond({ count: 1 });
    await expect(queryLayerJson(layer, { where: "bad" })).resolves.toEqual({ count: 1 });
  });

  test("invalidateAgriQueryCache(true) forces a refetch", async () => {
    const layer = makeLayer({ url: uniqueLayerUrl("json") });
    respond({ count: 1 });
    respond({ count: 2 });
    await queryLayerJson(layer, { where: "x" });
    invalidateAgriQueryCache(true);
    await expect(queryLayerJson(layer, { where: "x" })).resolves.toEqual({ count: 2 });
  });

  test("invalidateAgriQueryCache() without force only prunes expired entries", () => {
    queryCountCache.set("stale", { expires: 0, value: Promise.resolve(1) });
    queryCountCache.set("live", { expires: Date.now() + 60_000, value: Promise.resolve(2) });
    invalidateAgriQueryCache();
    expect(Array.from(queryCountCache.keys())).toEqual(["live"]);
  });
});

describe("countWhereUncached", () => {
  test("uses layer.queryFeatureCount and defaults where to 1=1", async () => {
    const { layer, queries } = queryLayer({ count: 42 });
    await expect(countWhereUncached(layer, "")).resolves.toBe(42);
    expect(queries[0]).toEqual({ where: "1=1", returnGeometry: false });
  });

  test("falls back to REST returnCountOnly when the layer query fails", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("count"), fail: true });
    respond({ count: 7 });
    await expect(countWhereUncached(layer, "a=1")).resolves.toBe(7);
    expect(mockEsriRequest.mock.calls[0][1].query).toMatchObject({ returnCountOnly: true, where: "a=1" });
  });

  test("returns 0 when both paths fail", async () => {
    await expect(countWhereUncached(makeLayer(), "a=1")).resolves.toBe(0);
  });
});

describe("runStatsQueryUncached", () => {
  const stats = [{ statisticType: "sum", onStatisticField: "area", outStatisticFieldName: "s" }];

  test("ungrouped stats prefer REST JSON", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("stats"), rows: [{ s: 99 }] });
    respond({ features: [{ attributes: { s: 1 } }] });
    await expect(runStatsQueryUncached(layer, "", stats)).resolves.toEqual([{ s: 1 }]);
    expect(mockEsriRequest.mock.calls[0][1].query.outStatistics).toBe(JSON.stringify(stats));
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("grouped stats prefer the layer query and set groupBy fields", async () => {
    const { layer, queries } = queryLayer({ url: uniqueLayerUrl("stats"), rows: [{ g: "a", s: 2 }] });
    await expect(runStatsQueryUncached(layer, "x=1", stats, ["g"])).resolves.toEqual([
      { g: "a", s: 2 },
    ]);
    expect(queries[0]).toMatchObject({ where: "x=1", groupByFieldsForStatistics: ["g"] });
    expect(mockEsriRequest).not.toHaveBeenCalled();
  });

  test("grouped stats fall back to JSON with groupByFieldsForStatistics", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("stats"), fail: true });
    respond({ features: [{ attributes: { g: "b" } }, {}] });
    await expect(runStatsQueryUncached(layer, "x=1", stats, ["g", "h"])).resolves.toEqual([
      { g: "b" },
      {},
    ]);
    expect(mockEsriRequest.mock.calls[0][1].query.groupByFieldsForStatistics).toBe("g,h");
  });

  test("ungrouped stats fall back to the layer when JSON fails", async () => {
    const { layer } = queryLayer({ rows: [{ s: 3 }] });
    await expect(runStatsQueryUncached(layer, "", stats)).resolves.toEqual([{ s: 3 }]);
  });

  test("returns [] when every path fails", async () => {
    await expect(runStatsQueryUncached(makeLayer(), "", stats, ["g"])).resolves.toEqual([]);
  });
});

describe("distinctValues", () => {
  test("returns trimmed unique non-empty values from the layer query", async () => {
    const { layer, queries } = queryLayer({
      rows: [{ f: " A " }, { f: "A" }, { f: "" }, { f: null }, { f: "B" }],
      maxRecordCount: 500,
    });
    await expect(distinctValues(layer, "f")).resolves.toEqual(["A", "B"]);
    expect(queries[0]).toMatchObject({
      where: "1=1",
      returnDistinctValues: true,
      outFields: ["f"],
      num: 500,
    });
  });

  test("returns [] when the page was truncated", async () => {
    const { layer } = queryLayer({ rows: [{ f: "A" }], exceeded: true });
    await expect(distinctValues(layer, "f")).resolves.toEqual([]);
  });

  test("falls back to REST JSON and caps page size at 2000", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("distinct"), fail: true, maxRecordCount: 5000 });
    respond({ features: [{ attributes: { f: "X" } }] });
    await expect(distinctValues(layer, "f", "")).resolves.toEqual(["X"]);
    expect(mockEsriRequest.mock.calls[0][1].query).toMatchObject({
      where: "1=1",
      resultRecordCount: 2000,
    });
  });

  test("REST truncated page and REST failure both yield []", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("distinct"), fail: true });
    respond({ features: [{ attributes: { f: "X" } }], exceededTransferLimit: true });
    await expect(distinctValues(layer, "f")).resolves.toEqual([]);
    await expect(distinctValues(makeLayer(), "f")).resolves.toEqual([]);
  });
});

describe("queryLayerExtent", () => {
  const validExtent = { xmin: 60, ymin: 40, xmax: 61, ymax: 41 };

  test("returns null without a layer", async () => {
    await expect(queryLayerExtent(null, "1=1")).resolves.toBeNull();
  });

  test("uses layer.queryExtent when it returns a valid extent", async () => {
    const queryExtent = jest.fn(() => Promise.resolve({ extent: validExtent as unknown as __esri.Extent }));
    const { layer } = queryLayer({});
    layer.queryExtent = queryExtent;
    await expect(queryLayerExtent(layer, " ")).resolves.toBe(validExtent);
    expect(queryExtent).toHaveBeenCalledWith(expect.objectContaining({ where: "1=1", returnGeometry: true }));
  });

  test("falls back to REST returnExtentOnly", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("extent") });
    respond({ extent: validExtent });
    const ext = await queryLayerExtent(layer, "a=1");
    expect(ext).toBeInstanceOf(MockExtent);
    expect(ext).toMatchObject(validExtent);
  });

  test("computes the bbox from returned geometries when extent-only is invalid", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("extent") });
    respond({ extent: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 } });
    respond({
      features: [
        { geometry: { rings: [[[60, 40], [61, 40], [Number.NaN, 1]]] } },
        { geometry: { paths: [[[62, 42]]] } },
        { geometry: { x: 59, y: 39 } },
        { geometry: null },
      ],
    });
    const ext = await queryLayerExtent(layer, "a=1");
    expect(ext).toMatchObject({ xmin: 59, ymin: 39, xmax: 62, ymax: 42 });
  });

  test("returns null when no features come back", async () => {
    const { layer } = queryLayer({ url: uniqueLayerUrl("extent") });
    respond({});
    respond({ features: [] });
    await expect(queryLayerExtent(layer, "a=1")).resolves.toBeNull();
  });
});
