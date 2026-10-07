jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
const mockLoadModules = jest.fn<Promise<unknown[]>, [string[]]>();
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]) => mockLoadModules(mods),
}));
jest.mock("../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("./__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);

import { setAccessConfig } from "../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../data/agri-query-gateway";
import {
  VEG_PIXEL_AREA_HA,
  vegetationAvgNdviByUniqueIdCache,
  vegetationAvgNdviOidCursorCache,
  vegetationRecentDaysCache,
  vegetationStatusStatsCache,
} from "./veg-base";
import {
  queryVegetationAvgNdviByUniqueId,
  queryVegetationRecentDayRegionCounts,
  queryVegetationStatusCountsByRegionScopes,
} from "./veg-top";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeQuery,
  type FakeResponder,
  type FakeVegLayer,
} from "./__test-utils__/veg-fake-layer";

const useLayer = (
  respond: FakeResponder,
  opts: { maxRecordCount?: number; queryFeatureCount?: (q: FakeQuery) => Promise<number> } = {},
): FakeVegLayer => {
  const layer = makeFakeVegLayer(respond, opts);
  setVegLayer(layer, DEFAULT_VEG_FIELDS);
  return layer;
};

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  mockLoadModules.mockReset();
  mockLoadModules.mockRejectedValue(new Error("no REST in tests"));
  [
    vegetationAvgNdviByUniqueIdCache,
    vegetationAvgNdviOidCursorCache,
    vegetationRecentDaysCache,
    vegetationStatusStatsCache,
  ].forEach((m) => m.clear());
});

describe("queryVegetationAvgNdviByUniqueId", () => {
  test("rejects missing dates or missing region without querying", async () => {
    const layer = useLayer(() => []);
    await expect(
      queryVegetationAvgNdviByUniqueId({ region: 1, startDate: "", endDate: "2024-05-01" }),
    ).resolves.toEqual([]);
    await expect(
      queryVegetationAvgNdviByUniqueId({ startDate: "2024-05-01", endDate: "2024-05-31" }),
    ).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("returns single-page rows and merges cropId + cropIds", async () => {
    const layer = useLayer(() => [{ uniqueid: "u1", avg_ndvi: 0.4, max_px_all: 100 }]);
    const rows = await queryVegetationAvgNdviByUniqueId({
      region: 1724,
      district: Number.NaN,
      cropId: "3",
      cropIds: ["4", "3"],
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(rows).toEqual([
      { uniqueid: "u1", avgNdvi: 0.4, maxPxAll: 100, areaHa: 100 * VEG_PIXEL_AREA_HA },
    ]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
    const where = String(layer.executed[0].where);
    expect(where).toContain("crop_id IN ('4','3')");
    expect(where).not.toContain("district");
  });

  test("switches to sharded paging when the first page is truncated", async () => {
    const layer = useLayer((q) =>
      q.groupByFieldsForStatistics && String(q.where).includes("LIKE")
        ? []
        : { rows: [{ uniqueid: "u1", avg_ndvi: 0.4, max_px_all: 1 }], exceededTransferLimit: true },
    );
    const rows = await queryVegetationAvgNdviByUniqueId({
      region: 1724,
      district: 5,
      startDate: "2024-05-01",
      endDate: "2024-05-31",
    });
    expect(rows.map((r) => r.uniqueid)).toEqual(["u1"]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1 + 17);
  });
});

describe("queryVegetationStatusCountsByRegionScopes", () => {
  test("empty or invalid scopes produce no queries", async () => {
    const layer = useLayer(() => []);
    await expect(
      queryVegetationStatusCountsByRegionScopes([
        { region: Number.NaN, date: "2024-05-01" },
        { region: 1, date: " " },
      ]),
    ).resolves.toEqual([]);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  test("single region per date uses the per-region status stats", async () => {
    const layer = useLayer(() => [
      { ndvi_status: "Past", row_count: 3, sum_px_all: 1000 },
      { ndvi_status: "", row_count: 1, sum_px_all: 1 },
      { ndvi_status: "orta", row_count: 0, sum_px_all: 0 },
    ]);
    const out = await queryVegetationStatusCountsByRegionScopes([{ region: 1703, date: "2024-05-01" }], ["7"]);
    expect(out).toEqual([
      { ndvi_status: "past", count: 3, areaHa: 1000 * VEG_PIXEL_AREA_HA, uniqueIds: [] },
    ]);
    const where = String(layer.executed[0].where);
    expect(where).toContain("region='1703'");
    expect(where).toContain("crop_id='7'");
  });

  test("groups regions sharing a date into one region IN query", async () => {
    const layer = useLayer(() => [
      { NDVI_STATUS: "yaxshi", ROW_COUNT: 10, SUM_PX_ALL: 20 },
    ]);
    const out = await queryVegetationStatusCountsByRegionScopes(
      [
        { region: 1703, date: "2024-05-01" },
        { region: 1706, date: "2024-05-01" },
        { region: 1703, date: "2024-05-01" },
        { region: 1708, date: "2024-05-02" },
      ],
      ["1", "2", "1"],
    );
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
    const wheres = layer.executed.map((q) => String(q.where));
    const multi = wheres.find((w) => w.includes("region IN"));
    expect(multi).toContain("region IN ('1703','1706')");
    expect(multi).toContain("crop_id IN ('1','2')");
    expect(wheres.some((w) => w.includes("region='1708'"))).toBe(true);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ ndvi_status: "yaxshi", count: 10 });
  });

  test("multi-region query with a single crop uses equality", async () => {
    const layer = useLayer(() => []);
    await queryVegetationStatusCountsByRegionScopes(
      [
        { region: 1, date: "2024-05-01" },
        { region: 2, date: "2024-05-01" },
      ],
      ["5"],
    );
    expect(String(layer.executed[0].where)).toContain("crop_id='5'");
  });
});

describe("queryVegetationRecentDayRegionCounts", () => {
  const MAX_PROCESSED = Date.UTC(2024, 8, 13, 3, 0); // 08:00 Tashkent

  const isMaxQuery = (q: FakeQuery): boolean =>
    (q.outStatistics ?? []).some((s) => s.outStatisticFieldName === "max_processed_at");
  const isRegionList = (q: FakeQuery): boolean =>
    (q.groupByFieldsForStatistics ?? []).includes("region");

  test("returns an empty feed when no processed_at exists", async () => {
    useLayer(() => []);
    await expect(queryVegetationRecentDayRegionCounts(3)).resolves.toEqual([]);
  });

  test("counts distinct uniqueids per region for each calendar day", async () => {
    const layer = useLayer(
      (q) => {
        if (isMaxQuery(q)) return [{ max_processed_at: MAX_PROCESSED }];
        if (isRegionList(q)) {
          return String(q.where).includes(">= TIMESTAMP '2024-09-12 19:00:00'")
            ? [
                { region: "1703", row_cnt: 5 },
                { region: "1724", row_cnt: 9 },
                { region: "1730", row_cnt: 0 },
              ]
            : [];
        }
        return [];
      },
      {
        queryFeatureCount: async (q) => (String(q.where).includes("'1724'") ? 8 : 3),
      },
    );
    const out = await queryVegetationRecentDayRegionCounts(2);
    expect(out.map((g) => g.date)).toEqual(["2024-09-13", "2024-09-12"]);
    expect(out[0]).toEqual({
      date: "2024-09-13",
      regions: [
        { regionCode: "1724", fieldCount: 8 },
        { regionCode: "1703", fieldCount: 3 },
      ],
      totalFields: 11,
    });
    expect(out[1]).toEqual({ date: "2024-09-12", regions: [], totalFields: 0 });
    expect(layer.queryFeatureCount).toHaveBeenCalledTimes(2);
  });

  test("falls back to DATE clause and then OID cursor when distinct counts fail", async () => {
    const layer = useLayer(
      (q) => {
        if (isMaxQuery(q)) return [{ max_processed_at: MAX_PROCESSED }];
        const where = String(q.where);
        if (isRegionList(q)) {
          // TIMESTAMP window returns nothing; DATE fallback has data.
          return where.includes("TIMESTAMP") ? [] : [{ region: "1724", row_cnt: 4 }];
        }
        if ((q.outFields ?? []).includes("objectid")) {
          if (where.includes("objectid >")) return [];
          return [
            { objectid: 1, uniqueid: "a", region: "1724" },
            { objectid: 2, uniqueid: "a", region: "1724" },
            { objectid: 3, uniqueid: "b", region: "1724" },
            { objectid: 4, uniqueid: "", region: "1724" },
          ];
        }
        return [];
      },
      { queryFeatureCount: async () => Number.NaN },
    );
    const out = await queryVegetationRecentDayRegionCounts(1);
    expect(out).toEqual([
      { date: "2024-09-13", regions: [{ regionCode: "1724", fieldCount: 2 }], totalFields: 2 },
    ]);
    expect(layer.executed.some((q) => String(q.where).includes("TIMESTAMP"))).toBe(true);
  });
});
