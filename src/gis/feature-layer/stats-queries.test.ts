const mockEsriRequest = jest.fn();

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (names: string[]) =>
    Promise.resolve(
      names.map((name) => (name === "esri/request" ? mockEsriRequest : { request: { interceptors: [] } })),
    ),
}));

import {
  countWhere,
  cropStatsByGroup,
  medianField,
  pickWhereWithMavsumFallback,
  quickLayerFeatureCount,
  sumByGroup,
  sumField,
  sumFields,
} from "./stats-queries";
import { invalidateAgriQueryCache } from "./layer-lookup";
import type { AgriLayerLike } from "../agri-layer-types";
import type { FakeQuery } from "./__test-utils__/fake-layer";
import { asFeatureSet, asQuery, makeLayer, uniqueLayerUrl } from "./__test-utils__/fake-layer";

type Rows = Array<Record<string, unknown>>;

/** Layer whose count depends on WHERE and whose stats come from `rows`. */
function statsLayer(opts: {
  counts?: Record<string, number>;
  rows?: Rows;
  objectIdField?: string;
}): { layer: AgriLayerLike; queries: FakeQuery[] } {
  const queries: FakeQuery[] = [];
  const layer = makeLayer({
    title: uniqueLayerUrl("stats"),
    objectIdField: opts.objectIdField,
    createQuery: () => {
      const q: FakeQuery = {};
      queries.push(q);
      return asQuery(q);
    },
    queryFeatureCount: jest.fn((q?: unknown) =>
      Promise.resolve(opts.counts?.[String((q as FakeQuery).where)] ?? 0),
    ),
    queryFeatures: jest.fn(() =>
      Promise.resolve(asFeatureSet({ features: (opts.rows ?? []).map((attributes) => ({ attributes })) })),
    ),
  });
  return { layer, queries };
}

beforeEach(() => {
  mockEsriRequest.mockReset();
  invalidateAgriQueryCache(true);
});

describe("countWhere", () => {
  test("caches counts per layer + WHERE", async () => {
    const { layer } = statsLayer({ counts: { "a=1": 5 } });
    await expect(countWhere(layer, "a=1")).resolves.toBe(5);
    await expect(quickLayerFeatureCount(layer, "a=1")).resolves.toBe(5);
    expect(layer.queryFeatureCount).toHaveBeenCalledTimes(1);
  });

  test("empty WHERE counts everything", async () => {
    const { layer } = statsLayer({ counts: { "1=1": 9 } });
    await expect(countWhere(layer, "")).resolves.toBe(9);
  });
});

describe("pickWhereWithMavsumFallback", () => {
  test("keeps strict WHERE when it has rows", async () => {
    const { layer } = statsLayer({ counts: { strict: 3, relaxed: 10 } });
    await expect(pickWhereWithMavsumFallback(layer, "strict", "relaxed")).resolves.toEqual({
      where: "strict",
      count: 3,
      mavsumRelaxed: false,
    });
  });

  test("relaxes when strict is empty and relaxed has rows", async () => {
    const { layer } = statsLayer({ counts: { relaxed: 10 } });
    await expect(pickWhereWithMavsumFallback(layer, "strict", "relaxed")).resolves.toEqual({
      where: "relaxed",
      count: 10,
      mavsumRelaxed: true,
    });
  });

  test("does not relax when disabled or identical; returns strict when both empty", async () => {
    const { layer } = statsLayer({ counts: { relaxed: 10 } });
    await expect(
      pickWhereWithMavsumFallback(layer, "strict", "relaxed", { allowRelax: false }),
    ).resolves.toMatchObject({ where: "strict", mavsumRelaxed: false });
    await expect(pickWhereWithMavsumFallback(layer, "strict", "")).resolves.toMatchObject({
      where: "strict",
      count: 0,
    });
    await expect(pickWhereWithMavsumFallback(layer, "strict", "other")).resolves.toMatchObject({
      where: "strict",
      count: 0,
      mavsumRelaxed: false,
    });
  });
});

describe("sums", () => {
  test("sumField reads stat_v, any case, or the first value", async () => {
    await expect(sumField(statsLayer({ rows: [{ STAT_V: "12.5" }] }).layer, "", "a")).resolves.toBe(12.5);
    await expect(sumField(statsLayer({ rows: [{ other: 4 }] }).layer, "", "a")).resolves.toBe(4);
    await expect(sumField(statsLayer({ rows: [] }).layer, "", "a")).resolves.toBe(0);
  });

  test("sumFields maps s0..sN back to field names (case-insensitive)", async () => {
    const { layer, queries } = statsLayer({ rows: [{ S0: 10, s1: null }] });
    await expect(sumFields(layer, "w", ["area", "water"])).resolves.toEqual({ area: 10, water: 0 });
    expect(queries[0].outStatistics).toEqual([
      { statisticType: "sum", onStatisticField: "area", outStatisticFieldName: "s0" },
      { statisticType: "sum", onStatisticField: "water", outStatisticFieldName: "s1" },
    ]);
  });

  test("sumByGroup drops empty names and zero totals, sorts by total desc", async () => {
    const { layer } = statsLayer({
      rows: [
        { TUMAN: "A", STAT_TOTAL: 5 },
        { TUMAN: " B ", STAT_TOTAL: 20 },
        { TUMAN: "", STAT_TOTAL: 100 },
        { TUMAN: "C", STAT_TOTAL: 0 },
      ],
    });
    await expect(sumByGroup(layer, "", "tuman", "area")).resolves.toEqual([
      { name: "B", total: 20 },
      { name: "A", total: 5 },
    ]);
  });
});

describe("cropStatsByGroup", () => {
  test("counts by objectIdField with optional avg and label", async () => {
    const { layer, queries } = statsLayer({
      objectIdField: "FID",
      rows: [
        { crop_id: 1, stat_cnt: 4, stat_avg: 0.5, stat_label: "Paxta" },
        { crop_id: 2, stat_cnt: 2 },
        { crop_id: 3, stat_cnt: 0 },
        { crop_id: "", stat_cnt: 9 },
      ],
    });
    await expect(cropStatsByGroup(layer, "", "crop_id", "ndvi", "turi")).resolves.toEqual([
      { id: "1", label: "Paxta", count: 4, avg: 0.5 },
      { id: "2", label: "2", count: 2, avg: 0 },
    ]);
    const stats = queries[0].outStatistics as Array<Record<string, unknown>>;
    expect(stats.map((s) => s.statisticType)).toEqual(["count", "avg", "max"]);
    expect(stats[0].onStatisticField).toBe("FID");
  });

  test("defaults to objectid and omits avg/label stats when fields not given", async () => {
    const { layer, queries } = statsLayer({ rows: [] });
    await cropStatsByGroup(layer, "", "crop_id");
    expect(queries[0].outStatistics).toEqual([
      { statisticType: "count", onStatisticField: "objectid", outStatisticFieldName: "stat_cnt" },
    ]);
  });
});

describe("medianField", () => {
  test("uses server-side percentile_cont when available", async () => {
    const { layer } = statsLayer({ rows: [{ STAT_MED: 7 }] });
    await expect(medianField(layer, "", "ndvi")).resolves.toBe(7);
  });

  test("falls back to client-side median (odd and even counts)", async () => {
    const url = uniqueLayerUrl("median");
    const odd = makeLayer({ url });
    mockEsriRequest
      .mockResolvedValueOnce({ data: { features: [{ attributes: { stat_med: null } }] } })
      .mockResolvedValueOnce({
        data: { features: [{ attributes: { v: 3 } }, { attributes: { v: 1 } }, { attributes: { v: "x" } }, { attributes: { v: 2 } }] },
      });
    await expect(medianField(odd, "a=1", "v")).resolves.toBe(2);
    expect(mockEsriRequest.mock.calls[1][1].query.where).toBe("(a=1) AND v IS NOT NULL");

    const even = makeLayer({ url: uniqueLayerUrl("median") });
    mockEsriRequest
      .mockResolvedValueOnce({ data: { features: [] } })
      .mockResolvedValueOnce({ data: { features: [{ attributes: { v: 4 } }, { attributes: { v: 1 } }] } });
    await expect(medianField(even, "", "v")).resolves.toBe(2.5);
  });

  test("returns 0 when there are no values or the fallback fails", async () => {
    const empty = makeLayer({ url: uniqueLayerUrl("median") });
    mockEsriRequest
      .mockResolvedValueOnce({ data: { features: [] } })
      .mockResolvedValueOnce({ data: { features: [] } });
    await expect(medianField(empty, "", "v")).resolves.toBe(0);

    await expect(medianField(makeLayer({ title: "no-url-median" }), "", "v")).resolves.toBe(0);
  });
});
