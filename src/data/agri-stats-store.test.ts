const queryMock = jest.fn();

jest.mock("./agri-query-gateway", () => ({
  dedupedQueryFeatures: (layer: unknown, spec: Record<string, unknown>): Promise<unknown> =>
    queryMock(layer, spec),
}));
jest.mock("../gis/agri-vegetation-data-source", () => ({
  queryVegetationStatusCounts: jest.fn(),
  queryVegetationStatusCountsByStatus: jest.fn(),
  queryVegetationStatusCountsByRegionScopes: jest.fn(),
  queryVegetationRegionalTimeseries: jest.fn(),
  queryVegetationSeriesForUniqueId: jest.fn(),
}));

import {
  clearAgriStatsStoreCache,
  getOutStatisticCached,
  getOutStatisticCachedNullable,
  getPieCategoryStatsCached,
  getRegionGroupFeaturesCached,
} from "./agri-stats-store";
import { resetStatsQueryScheduler } from "./agri-query-scheduler";

interface TestField {
  name: string;
  type: string;
}

let urlSeq = 0;
function makeLayer(fields: TestField[] = [], objectIdField = "OBJECTID"): __esri.FeatureLayer {
  urlSeq += 1;
  return {
    url: `https://example.test/FeatureServer/${urlSeq}`,
    objectIdField,
    fields,
  } as unknown as __esri.FeatureLayer;
}

function features(rows: Array<Record<string, unknown>>): { features: Array<{ attributes: Record<string, unknown> }> } {
  return { features: rows.map((attributes) => ({ attributes })) };
}

beforeEach(() => {
  queryMock.mockReset();
  localStorage.clear();
  clearAgriStatsStoreCache();
  resetStatsQueryScheduler();
});

describe("getPieCategoryStatsCached", () => {
  test("sums area per category and drops empty/zero rows", async () => {
    queryMock.mockResolvedValue(
      features([
        { crop_id: "1", agg: 10 },
        { crop_id: "2", agg: 0 },
        { crop_id: null, agg: 5 },
        { crop_id: "3", agg: "2.5" },
      ]),
    );
    const layer = makeLayer();
    const rows = await getPieCategoryStatsCached({
      layer,
      where: "yil=2024",
      categoryField: "crop_id",
      areaField: "maydon",
    });
    expect(rows).toEqual([
      { key: "1", value: 10 },
      { key: "3", value: 2.5 },
    ]);
    const spec = queryMock.mock.calls[0][1];
    expect(spec).toEqual(
      expect.objectContaining({
        where: "yil=2024",
        groupByFieldsForStatistics: ["crop_id"],
        returnGeometry: false,
        outStatistics: [{ statisticType: "sum", onStatisticField: "maydon", outStatisticFieldName: "agg" }],
      }),
    );
  });

  test("counts object ids when no area field", async () => {
    queryMock.mockResolvedValue(features([{ c: "a", agg: 3 }]));
    await getPieCategoryStatsCached({ layer: makeLayer(), where: "1=1", categoryField: "c" });
    expect(queryMock.mock.calls[0][1].outStatistics[0]).toEqual({
      statisticType: "count",
      onStatisticField: "OBJECTID",
      outStatisticFieldName: "agg",
    });
  });

  test("caches results and shares in-flight queries", async () => {
    queryMock.mockResolvedValue(features([{ c: "a", agg: 1 }]));
    const layer = makeLayer();
    const opts = { layer, where: "1=1", categoryField: "c" };
    const [a, b] = await Promise.all([getPieCategoryStatsCached(opts), getPieCategoryStatsCached(opts)]);
    await getPieCategoryStatsCached(opts);
    expect(a).toEqual(b);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  test("different where clauses are cached separately", async () => {
    queryMock.mockResolvedValue(features([]));
    const layer = makeLayer();
    await getPieCategoryStatsCached({ layer, where: "a=1", categoryField: "c" });
    await getPieCategoryStatsCached({ layer, where: "a=2", categoryField: "c" });
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  test("persisted cache survives in-memory clear", async () => {
    queryMock.mockResolvedValue(features([{ c: "a", agg: 4 }]));
    const layer = makeLayer();
    const opts = { layer, where: "p=1", categoryField: "c" };
    await getPieCategoryStatsCached(opts);
    // Simulate a reload: fresh module instance (empty memory map), same localStorage.
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("./agri-stats-store");
      await expect(fresh.getPieCategoryStatsCached(opts)).resolves.toEqual([
        { key: "a", value: 4 },
      ]);
    });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  test("failed query is not cached and error propagates", async () => {
    queryMock.mockRejectedValueOnce(new Error("503")).mockResolvedValueOnce(features([{ c: "x", agg: 1 }]));
    const opts = { layer: makeLayer(), where: "1=1", categoryField: "c" };
    await expect(getPieCategoryStatsCached(opts)).rejects.toThrow("503");
    await expect(getPieCategoryStatsCached(opts)).resolves.toEqual([{ key: "x", value: 1 }]);
  });
});

describe("getRegionGroupFeaturesCached", () => {
  test("sum mode groups by name + resolved code field (service casing)", async () => {
    queryMock.mockResolvedValue(features([{ viloyat: "A", REGION: 1, sum_m: 5 }]));
    const layer = makeLayer([
      { name: "viloyat", type: "string" },
      { name: "REGION", type: "integer" },
    ]);
    const out = await getRegionGroupFeaturesCached({
      layer,
      where: "1=1",
      groupField: "viloyat",
      codeField: "region",
      statMode: "sum",
      areaField: "maydon",
    });
    expect(out).toHaveLength(1);
    const spec = queryMock.mock.calls[0][1];
    expect(spec.groupByFieldsForStatistics).toEqual(["viloyat", "REGION"]);
    expect(spec.orderByFields).toEqual(["sum_m DESC"]);
    expect(spec.outStatistics[0]).toEqual({
      statisticType: "sum",
      onStatisticField: "maydon",
      outStatisticFieldName: "sum_m",
    });
  });

  test("falls back to name-only grouping when code field is missing or same as group", async () => {
    queryMock.mockResolvedValue(features([]));
    const layer = makeLayer([{ name: "tuman", type: "string" }], "FID");
    await getRegionGroupFeaturesCached({
      layer,
      where: "1=1",
      groupField: "tuman",
      codeField: "district",
      statMode: "sum",
      areaField: "",
    });
    const spec = queryMock.mock.calls[0][1];
    expect(spec.groupByFieldsForStatistics).toEqual(["tuman"]);
    // sum without area field degrades to count on the layer object id
    expect(spec.outStatistics[0]).toEqual({
      statisticType: "count",
      onStatisticField: "FID",
      outStatisticFieldName: "cnt_m",
    });

    await getRegionGroupFeaturesCached({
      layer,
      where: "2=2",
      groupField: "tuman",
      codeField: "TUMAN",
      statMode: "count",
    });
    expect(queryMock.mock.calls[1][1].groupByFieldsForStatistics).toEqual(["tuman"]);
  });

  test("layer without fields array groups by name only", async () => {
    queryMock.mockResolvedValue(features([]));
    const layer = { url: "u-nofields" } as unknown as __esri.FeatureLayer;
    await getRegionGroupFeaturesCached({
      layer,
      where: "1=1",
      groupField: "viloyat",
      codeField: "region",
      statMode: "count",
    });
    expect(queryMock.mock.calls[0][1].groupByFieldsForStatistics).toEqual(["viloyat"]);
    expect(queryMock.mock.calls[0][1].outStatistics[0].onStatisticField).toBe("OBJECTID");
  });
});

describe("getOutStatisticCached(Nullable)", () => {
  test("returns numeric aggregate", async () => {
    queryMock.mockResolvedValue(features([{ agg: "12.5" }]));
    await expect(
      getOutStatisticCachedNullable({
        layer: makeLayer(),
        where: "",
        statisticType: "sum",
        onStatisticField: "maydon",
      }),
    ).resolves.toBe(12.5);
    expect(queryMock.mock.calls[0][1].where).toBe("1=1");
  });

  test.each([[[]], [[{ agg: null }]], [[{ agg: "" }]], [[{ agg: "abc" }]]])(
    "missing/invalid aggregate %p -> null (and 0 for non-nullable)",
    async (rows) => {
      queryMock.mockResolvedValue(features(rows as Array<Record<string, unknown>>));
      const layer = makeLayer();
      const opts = { layer, where: "w", statisticType: "avg" as const, onStatisticField: "x" };
      await expect(getOutStatisticCachedNullable(opts)).resolves.toBeNull();
      await expect(getOutStatisticCached(opts)).resolves.toBe(0);
    },
  );

  test("custom output field name is read back", async () => {
    queryMock.mockResolvedValue(features([{ total: 9 }]));
    await expect(
      getOutStatisticCached({
        layer: makeLayer(),
        where: "1=1",
        statisticType: "count",
        onStatisticField: "OBJECTID",
        outStatisticFieldName: "total",
      }),
    ).resolves.toBe(9);
  });

  test("null query response yields null", async () => {
    queryMock.mockResolvedValue(null);
    await expect(
      getOutStatisticCachedNullable({
        layer: makeLayer(),
        where: "1=1",
        statisticType: "max",
        onStatisticField: "x",
      }),
    ).resolves.toBeNull();
  });
});
