jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { setAccessConfig } from "../../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../../data/agri-query-gateway";
import { fetchLastProcessedAtCalendarWindow } from "./status-calendar";
import { countDistinctViaOidCursor } from "./status-oid-cursor";
import { countDistinctUniqueIdsByRegionParallel } from "./status-region-parallel";
import { listRegionsForProcessedDay } from "./status-regions-day";
import { makeFakeVegLayer, type FakeAttrs, type FakeQuery } from "../__test-utils__/veg-fake-layer";

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
});

describe("fetchLastProcessedAtCalendarWindow", () => {
  test("returns consecutive Tashkent days ending at MAX(processed_at)", async () => {
    // 2024-03-01 02:00 UTC = 07:00 Tashkent on 2024-03-01
    const layer = makeFakeVegLayer(() => [{ max_processed_at: Date.UTC(2024, 2, 1, 2) }]);
    await expect(fetchLastProcessedAtCalendarWindow(layer, "processed_at", 3)).resolves.toEqual([
      "2024-03-01",
      "2024-02-29",
      "2024-02-28",
    ]);
    expect(layer.executed[0].where).toBe("processed_at IS NOT NULL");
  });

  test("reads the raw date field when the stat alias is missing", async () => {
    const layer = makeFakeVegLayer(() => [{ PROCESSED_AT: Date.UTC(2024, 0, 1, 20) }]);
    await expect(fetchLastProcessedAtCalendarWindow(layer, "processed_at", 1)).resolves.toEqual([
      "2024-01-02",
    ]);
  });

  test("returns [] when there is no max date", async () => {
    const layer = makeFakeVegLayer(() => []);
    await expect(fetchLastProcessedAtCalendarWindow(layer, "processed_at", 5)).resolves.toEqual([]);
  });
});

describe("listRegionsForProcessedDay", () => {
  test("keeps regions with a positive row count", async () => {
    const layer = makeFakeVegLayer(() => [
      { region: 1703, row_cnt: 2 },
      { REGION: "1724", ROW_CNT: 1 },
      { region: 1730, row_cnt: 0 },
      { region: "", row_cnt: 3 },
    ]);
    await expect(listRegionsForProcessedDay(layer, "w", "region", "objectid", "2024-01-01")).resolves.toEqual([
      "1703",
      "1724",
    ]);
    expect(layer.executed[0].groupByFieldsForStatistics).toEqual(["region"]);
  });

  test("swallows query errors and returns []", async () => {
    const layer = makeFakeVegLayer(() => {
      throw new Error("bad sql");
    });
    await expect(listRegionsForProcessedDay(layer, "w", "region", "objectid", "d")).resolves.toEqual([]);
  });
});

describe("countDistinctUniqueIdsByRegionParallel", () => {
  test("returns per-region counts and drops zero regions", async () => {
    const layer = makeFakeVegLayer(() => [], {
      queryFeatureCount: async (q: FakeQuery) => {
        const where = String(q.where);
        if (where.includes("'1703'")) return 4;
        if (where.includes("'O''x'")) return 0;
        return 2;
      },
    });
    const out = await countDistinctUniqueIdsByRegionParallel(layer, "base", "region", "uniqueid", ["1703", "1724", "O'x"], "d");
    expect(Array.from(out?.entries() ?? [])).toEqual([
      ["1703", 4],
      ["1724", 2],
    ]);
    const wheres = (layer.queryFeatureCount?.mock.calls ?? []).map((c) => String(c[0].where));
    expect(wheres).toContain("base AND region='O''x'");
  });

  test("returns null when any region count is unavailable", async () => {
    const layer = makeFakeVegLayer(() => [], {
      queryFeatureCount: async (q: FakeQuery) => (String(q.where).includes("'2'") ? Number.NaN : 1),
    });
    await expect(
      countDistinctUniqueIdsByRegionParallel(layer, "base", "region", "uniqueid", ["1", "2"], "d"),
    ).resolves.toBeNull();
  });
});

describe("countDistinctViaOidCursor", () => {
  test("counts distinct uniqueids per region across cursor pages", async () => {
    const page1: FakeAttrs[] = [
      { objectid: 1, uniqueid: "a", region: "1703" },
      { objectid: 2, uniqueid: "a", region: "1703" },
      { objectid: 3, uniqueid: "b", region: "1724" },
    ];
    const layer = makeFakeVegLayer((q) => {
      const where = String(q.where);
      if (where === "w") return page1;
      if (where === "w AND objectid > 3") return [{ OBJECTID: 4, UniqueId: "c", Region: "1703" }];
      return [];
    });
    const out = await countDistinctViaOidCursor(layer, "w", "region", "uniqueid", "objectid", "d", 3);
    expect(Array.from(out.entries()).sort()).toEqual([
      ["1703", 2],
      ["1724", 1],
    ]);
    expect(layer.executed.map((q) => q.where)).toEqual(["w", "w AND objectid > 3"]);
  });

  test("stops when objectids are missing (no cursor progress)", async () => {
    const layer = makeFakeVegLayer(() => [
      { uniqueid: "a", region: "1" },
      { uniqueid: "b", region: "1" },
    ]);
    const out = await countDistinctViaOidCursor(layer, "w", "region", "uniqueid", "objectid", "d", 2);
    expect(out.get("1")).toBe(2);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });
});
