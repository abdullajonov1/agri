import {
  clearAgriQueryGatewayCache,
  dedupedQueryFeatureCount,
  dedupedQueryFeatures,
} from "./agri-query-gateway";
import type { AgriQueryableLayer } from "../types/agri-layer";

type FakeQuery = Record<string, unknown>;

const makeLayer = (
  overrides: Partial<AgriQueryableLayer> = {},
): AgriQueryableLayer & { queries: FakeQuery[] } => {
  const queries: FakeQuery[] = [];
  return {
    url: "https://example.test/FeatureServer/0",
    objectIdField: "OBJECTID",
    queries,
    createQuery: () => {
      const q: FakeQuery = {};
      queries.push(q);
      return q as unknown as __esri.Query;
    },
    queryFeatures: jest.fn(
      async () => ({ features: [] }) as unknown as __esri.FeatureSet,
    ),
    ...overrides,
  };
};

describe("agri-query-gateway", () => {
  beforeEach(() => clearAgriQueryGatewayCache());

  test("concurrent identical specs share one queryFeatures call", async () => {
    const layer = makeLayer();
    await Promise.all([
      dedupedQueryFeatures(layer, { where: "a=1", outFields: ["x", "y"] }),
      dedupedQueryFeatures(layer, { where: "a=1", outFields: ["y", "x"] }),
    ]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });

  test("statistics order does not change the dedupe key", async () => {
    const layer = makeLayer();
    const s1 = { statisticType: "sum", onStatisticField: "a", outStatisticFieldName: "sa" };
    const s2 = { statisticType: "count", onStatisticField: "b", outStatisticFieldName: "cb" };
    await Promise.all([
      dedupedQueryFeatures(layer, { outStatistics: [s1, s2] }),
      dedupedQueryFeatures(layer, { outStatistics: [s2, s1] }),
    ]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });

  test("different WHERE clauses run separately", async () => {
    const layer = makeLayer();
    await Promise.all([
      dedupedQueryFeatures(layer, { where: "a=1" }),
      dedupedQueryFeatures(layer, { where: "a=2" }),
    ]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });

  test("copies every spec field onto the query", async () => {
    const layer = makeLayer();
    await dedupedQueryFeatures(layer, {
      outFields: ["a"],
      groupByFieldsForStatistics: ["g"],
      returnDistinctValues: true,
      orderByFields: ["a DESC"],
      returnGeometry: false,
      returnCountOnly: false,
      num: 10,
      resultRecordCount: 5,
      resultOffset: 2,
    });
    expect(layer.queries[0]).toEqual({
      where: "1=1",
      outFields: ["a"],
      groupByFieldsForStatistics: ["g"],
      returnDistinctValues: true,
      orderByFields: ["a DESC"],
      returnGeometry: false,
      returnCountOnly: false,
      num: 10,
      resultRecordCount: 5,
      resultOffset: 2,
    });
  });

  test("a finished query is not reused (in-flight only)", async () => {
    const layer = makeLayer();
    await dedupedQueryFeatures(layer, { where: "a=1" });
    await dedupedQueryFeatures(layer, { where: "a=1" });
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });

  test("a rejected query frees its slot", async () => {
    const queryFeatures = jest
      .fn()
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValueOnce({ features: [] });
    const layer = makeLayer({ queryFeatures });
    await expect(dedupedQueryFeatures(layer, { where: "a=1" })).rejects.toThrow("503");
    await expect(dedupedQueryFeatures(layer, { where: "a=1" })).resolves.toEqual({
      features: [],
    });
  });

  describe("dedupedQueryFeatureCount", () => {
    test("prefers queryFeatureCount when available", async () => {
      const queryFeatureCount = jest.fn(async () => 12);
      const layer = makeLayer({ queryFeatureCount });
      await expect(dedupedQueryFeatureCount(layer, "a=1")).resolves.toBe(12);
      expect(queryFeatureCount).toHaveBeenCalledWith({ where: "a=1" });
    });

    test("falls back to a count-only queryFeatures", async () => {
      const layer = makeLayer({
        queryFeatures: jest.fn(
          async () => ({ count: 7 }) as unknown as __esri.FeatureSet,
        ),
      });
      await expect(dedupedQueryFeatureCount(layer, "a=1")).resolves.toBe(7);
      expect(layer.queries[0]).toMatchObject({
        where: "a=1",
        returnCountOnly: true,
        returnGeometry: false,
        outFields: ["OBJECTID"],
      });
    });

    test("uses totalCount, then 0, when count is missing", async () => {
      const withTotal = makeLayer({
        queryFeatures: jest.fn(
          async () => ({ totalCount: 4 }) as unknown as __esri.FeatureSet,
        ),
      });
      await expect(dedupedQueryFeatureCount(withTotal, "b=1")).resolves.toBe(4);
      const empty = makeLayer({
        url: "https://example.test/other",
        queryFeatures: jest.fn(async () => ({}) as unknown as __esri.FeatureSet),
      });
      await expect(dedupedQueryFeatureCount(empty, "b=1")).resolves.toBe(0);
    });
  });
});
