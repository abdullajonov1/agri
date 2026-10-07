jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("../__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);

import { setAccessConfig } from "../../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../../data/agri-query-gateway";
import {
  VEG_PIXEL_AREA_HA,
  vegetationAssignedUniqueIdsCache,
  vegetationStatusCountsCache,
} from "../veg-base";
import { queryVegetationStatusCounts } from "./status-counts";
import { queryVegetationUniqueIdsForStatus } from "./status-uniqueids";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeAttrs,
  type FakeQuery,
  type FakeResponder,
  type FakeVegLayer,
} from "../__test-utils__/veg-fake-layer";

const useLayer = (
  respond: FakeResponder,
  opts: { fields?: string[]; maxRecordCount?: number } = {},
): FakeVegLayer => {
  const layer = makeFakeVegLayer(respond, { maxRecordCount: opts.maxRecordCount });
  setVegLayer(layer, opts.fields ?? DEFAULT_VEG_FIELDS);
  return layer;
};

const isGrouped = (q: FakeQuery): boolean => Boolean(q.groupByFieldsForStatistics?.length);
const byStatus = (rows: { ndvi_status: string }[]): Record<string, unknown> =>
  Object.fromEntries(rows.map((r) => [r.ndvi_status, r]));

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  vegetationStatusCountsCache.clear();
  vegetationAssignedUniqueIdsCache.clear();
});

describe("queryVegetationStatusCounts (grouped path)", () => {
  test("assigns each uniqueid to its majority status, ties broken by area then name", async () => {
    const layer = useLayer(() => [
      // u1: past x3 vs orta x1 -> past
      { uniqueid: "U1", ndvi_status: "past", row_count: 3, max_px_all: 100 },
      { uniqueid: "u1", ndvi_status: "orta", row_count: 1, max_px_all: 500 },
      // u2: tie on rows, larger px wins -> yaxshi
      { uniqueid: "u2", ndvi_status: "orta", row_count: 2, max_px_all: 10 },
      { uniqueid: "u2", ndvi_status: "yaxshi", row_count: 2, max_px_all: 20 },
      // u3: full tie -> alphabetical (orta < past)
      { uniqueid: "u3", ndvi_status: "Past", row_count: 1, max_px_all: 5 },
      { uniqueid: "u3", ndvi_status: "orta", row_count: 1, max_px_all: 5 },
      // ignored rows
      { uniqueid: "", ndvi_status: "past", row_count: 1, max_px_all: 1 },
      { uniqueid: "u4", ndvi_status: " ", row_count: 1, max_px_all: 1 },
    ]);
    const rows = await queryVegetationStatusCounts({ date: "2024-05-01", region: 1724 });
    expect(byStatus(rows)).toEqual({
      past: { ndvi_status: "past", count: 1, areaHa: 100 * VEG_PIXEL_AREA_HA, uniqueIds: ["U1"] },
      yaxshi: { ndvi_status: "yaxshi", count: 1, areaHa: 20 * VEG_PIXEL_AREA_HA, uniqueIds: ["u2"] },
      orta: { ndvi_status: "orta", count: 1, areaHa: 5 * VEG_PIXEL_AREA_HA, uniqueIds: ["u3"] },
    });
    const q = layer.executed[0];
    expect(q.groupByFieldsForStatistics).toEqual(["uniqueid", "ndvi_status"]);
    expect(q.where).toContain("region='1724'");
  });

  test("publishes the id->status assignment so uniqueid lookups skip the server", async () => {
    const layer = useLayer(() => [
      { uniqueid: "a", ndvi_status: "past", row_count: 1, max_px_all: 1 },
      { uniqueid: "b", ndvi_status: "past", row_count: 1, max_px_all: 1 },
    ]);
    await queryVegetationStatusCounts({ date: "2024-05-01", district: 5 });
    const calls = layer.queryFeatures.mock.calls.length;
    const ids = await queryVegetationUniqueIdsForStatus({
      date: "2024-05-01",
      district: 5,
      ndviStatus: "PAST",
    });
    expect(ids).toEqual(["a", "b"]);
    expect(layer.queryFeatures.mock.calls.length).toBe(calls);
  });

  test("pages grouped results by offset until a short page", async () => {
    const page = (start: number, n: number): FakeAttrs[] =>
      Array.from({ length: n }, (_, i) => ({
        uniqueid: `id-${start + i}`,
        ndvi_status: "yaxshi",
        row_count: 1,
        max_px_all: 1,
      }));
    const layer = useLayer(
      (q) => (q.resultOffset === 0 ? page(0, 500) : q.resultOffset === 500 ? page(500, 10) : []),
      { maxRecordCount: 500 },
    );
    const rows = await queryVegetationStatusCounts({ date: "2024-05-01" });
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(510);
    expect(layer.executed.map((q) => q.resultOffset)).toEqual([0, 500]);
  });

  test("falls back to raw-row OID cursor when grouped pagination stalls", async () => {
    const grouped: FakeAttrs[] = Array.from({ length: 500 }, (_, i) => ({
      uniqueid: `g-${i}`,
      ndvi_status: "past",
      row_count: 1,
      max_px_all: 1,
    }));
    const layer = useLayer(
      (q) => {
        if (isGrouped(q)) return grouped; // same page every offset -> stall
        const where = String(q.where);
        if (where.includes("objectid > 2")) return [];
        return [
          { objectid: 1, uniqueid: "r1", ndvi_status: "orta", px_all: 40 },
          { objectid: 2, uniqueid: "r1", ndvi_status: "orta", px_all: 60 },
        ];
      },
      { maxRecordCount: 500 },
    );
    const rows = await queryVegetationStatusCounts({ date: "2024-05-01" });
    expect(rows).toEqual([
      { ndvi_status: "orta", count: 1, areaHa: 60 * VEG_PIXEL_AREA_HA, uniqueIds: ["r1"] },
    ]);
    expect(layer.executed.some((q) => String(q.where).includes("objectid > 2"))).toBe(false);
  });

  test("raw fallback without OID progress marks the result truncated (no assignment cache)", async () => {
    useLayer((q) => {
      if (isGrouped(q)) throw new Error("grouped not supported");
      return [{ uniqueid: "r1", ndvi_status: "orta", px_all: 1 }];
    });
    const rows = await queryVegetationStatusCounts({ date: "2024-05-01" });
    expect(rows[0].count).toBe(1);
    expect(vegetationAssignedUniqueIdsCache.size).toBe(0);
  });

  test("empty uniqueIds filter short-circuits to []", async () => {
    const layer = useLayer(() => []);
    await expect(
      queryVegetationStatusCounts({ date: "2024-05-01", uniqueIds: [] }),
    ).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("farmer uniqueIds and crop filters are added to WHERE", async () => {
    const layer = useLayer(() => []);
    await queryVegetationStatusCounts({
      date: "2024-05-01",
      uniqueIds: ["{abc}", " "],
      cropIds: ["1", "2"],
    });
    const where = String(layer.executed[0].where);
    expect(where).toContain("crop_id IN ('1','2')");
    expect(where).toContain("'abc'");
    expect(where).toContain("'{abc}'");
  });

  test("returns [] when the layer has no uniqueid-like field", async () => {
    const layer = useLayer(() => [], { fields: ["objectid", "ndvi_status"] });
    await expect(queryVegetationStatusCounts({ date: "2024-05-01" })).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("caches by WHERE and evicts on error", async () => {
    let fail = true;
    const layer = useLayer(() => {
      if (fail) throw new Error("down");
      return [];
    });
    // Both grouped and raw paths throw -> request rejects.
    await expect(queryVegetationStatusCounts({ date: "2024-05-01", cropId: "x" })).rejects.toThrow("down");
    fail = false;
    await queryVegetationStatusCounts({ date: "2024-05-01", cropId: "x" });
    const n = layer.queryFeatures.mock.calls.length;
    await queryVegetationStatusCounts({ date: "2024-05-01", cropId: "x" });
    expect(layer.queryFeatures.mock.calls.length).toBe(n);
  });
});

describe("queryVegetationUniqueIdsForStatus", () => {
  test("blank status or date returns [] without loading", async () => {
    const layer = useLayer(() => []);
    await expect(queryVegetationUniqueIdsForStatus({ date: "2024-05-01", ndviStatus: " " })).resolves.toEqual([]);
    await expect(queryVegetationUniqueIdsForStatus({ date: "", ndviStatus: "past" })).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("pages with an objectid cursor and dedupes ids", async () => {
    const first: FakeAttrs[] = Array.from({ length: 500 }, (_, i) => ({
      objectid: i + 1,
      uniqueid: `u${i % 400}`,
    }));
    const layer = useLayer(
      (q) => {
        const where = String(q.where);
        if (where.includes("objectid > 500")) return [{ OBJECTID: 501, uniqueid: "u-last" }];
        return first;
      },
      { maxRecordCount: 500 },
    );
    const ids = await queryVegetationUniqueIdsForStatus({
      date: "2024-05-01",
      region: 1724,
      cropIds: ["3"],
      cropId: "4",
      ndviStatus: "O'rta",
    });
    expect(ids).toHaveLength(401);
    expect(ids[ids.length - 1]).toBe("u-last");
    const q0 = layer.executed[0];
    expect(q0.where).toContain("ndvi_status='o''rta'");
    expect(q0.where).toContain("crop_id IN ('3','4')");
    expect(q0.orderByFields).toEqual(["objectid ASC"]);
    expect(layer.executed[1].where).toMatch(/^\(.*\) AND objectid > 500$/);
  });

  test("stops when the cursor does not advance", async () => {
    const layer = useLayer(() => Array.from({ length: 500 }, () => ({ uniqueid: "same" })), {
      maxRecordCount: 500,
    });
    const ids = await queryVegetationUniqueIdsForStatus({ date: "2024-05-01", ndviStatus: "past" });
    expect(ids).toEqual(["same"]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });

  test("stops when a full page yields no new ids", async () => {
    let oid = 0;
    const layer = useLayer(
      () => Array.from({ length: 500 }, () => ({ objectid: ++oid, uniqueid: "dup" })),
      { maxRecordCount: 500 },
    );
    const ids = await queryVegetationUniqueIdsForStatus({ date: "2024-05-01", ndviStatus: "past" });
    expect(ids).toEqual(["dup"]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });
});
