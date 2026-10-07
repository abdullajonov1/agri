const mockUserGroups: { ids: string[] } = { ids: [] };
jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: { groups: { id: string }[] } } => ({
      user: { groups: mockUserGroups.ids.map((id) => ({ id })) },
    }),
  }),
}));
const mockLoadModules = jest.fn<Promise<unknown[]>, [string[]]>();
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]) => mockLoadModules(mods),
}));
jest.mock("../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("./__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);

import { setAccessConfig } from "../../shared/agri-access-config";
import { setAgriPersistentCache } from "../../data/agri-persistent-cache";
import { clearAgriQueryGatewayCache } from "../../data/agri-query-gateway";
import {
  agriNotifyLog,
  agriVhLog,
  buildVegetationCropScopeWhere,
  buildVegetationScopeClauses,
  buildVegetationStatusWhere,
  dateRangeInclusiveClause,
  formatArcgisDateToYmd,
  formatEpochToTashkentYmd,
  getAgriVegetationIndicesLayer,
  getAgriVegetationIndicesUrl,
  peekVegetationRecentDayRegionCounts,
  processedAtTashkentDayWhere,
  queryDistinctFieldCount,
  queryVegFeatures,
  readVegAttr,
  resolveVegetationUniqueIdPageSize,
  shiftYmd,
  vegetationRecentDaysCacheKey,
  VH_CATEGORY_TO_NDVI_STATUS,
} from "./veg-base";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeQuery,
} from "./__test-utils__/veg-fake-layer";

type DebugGlobals = { __AGRO_V5_DEBUG?: boolean; __AGRO_V5_VH_DEBUG?: boolean };

beforeEach(() => {
  setAccessConfig(undefined);
  mockUserGroups.ids = [];
  clearAgriQueryGatewayCache();
  localStorage.clear();
  mockLoadModules.mockReset();
});

describe("formatArcgisDateToYmd", () => {
  test("formats epoch ms, Date and ISO strings in UTC", () => {
    expect(formatArcgisDateToYmd(Date.UTC(2024, 8, 13, 23, 59))).toBe("2024-09-13");
    expect(formatArcgisDateToYmd(new Date(Date.UTC(2023, 0, 5)))).toBe("2023-01-05");
    expect(formatArcgisDateToYmd("2022-12-31T00:00:00Z")).toBe("2022-12-31");
  });

  test("returns null for null, undefined and unparseable values", () => {
    expect(formatArcgisDateToYmd(null)).toBeNull();
    expect(formatArcgisDateToYmd(undefined)).toBeNull();
    expect(formatArcgisDateToYmd("not a date")).toBeNull();
  });
});

describe("dateRangeInclusiveClause", () => {
  test("uses an exclusive next-day upper bound", () => {
    expect(dateRangeInclusiveClause("raster_date", "2024-05-01", "2024-05-31")).toBe(
      "raster_date >= DATE '2024-05-01' AND raster_date < DATE '2024-06-01'",
    );
  });

  test("rolls over leap day and year end", () => {
    expect(dateRangeInclusiveClause("d", "2024-02-01", "2024-02-29")).toContain(
      "d < DATE '2024-03-01'",
    );
    expect(dateRangeInclusiveClause("d", "2024-12-01", "2024-12-31")).toContain(
      "d < DATE '2025-01-01'",
    );
  });

  test("fails closed on malformed or inverted ranges", () => {
    expect(dateRangeInclusiveClause("d", "2024-5-1", "2024-05-31")).toBe("1=0");
    expect(dateRangeInclusiveClause("d", "2024-05-01", "x' OR 1=1 --")).toBe("1=0");
    expect(dateRangeInclusiveClause("d", "2024-06-01", "2024-05-01")).toBe("1=0");
  });

  test("trims whitespace around dates", () => {
    expect(dateRangeInclusiveClause("d", " 2024-05-01 ", "2024-05-01 ")).toBe(
      "d >= DATE '2024-05-01' AND d < DATE '2024-05-02'",
    );
  });
});

describe("buildVegetationScopeClauses", () => {
  test("returns no clauses for an empty scope", () => {
    expect(buildVegetationScopeClauses({})).toEqual([]);
  });

  test("adds region/district and skips non-finite codes", () => {
    expect(buildVegetationScopeClauses({ region: 1724, district: 1724401 })).toEqual([
      "region='1724'",
      "district='1724401'",
    ]);
    expect(buildVegetationScopeClauses({ region: Number.NaN })).toEqual([]);
  });

  test("extracts a 4-digit year from free text into a calendar-year window", () => {
    expect(buildVegetationScopeClauses({ year: "2024 yil" })).toEqual([
      "raster_date >= DATE '2024-01-01' AND raster_date < DATE '2025-01-01'",
    ]);
    expect(buildVegetationScopeClauses({ year: "yil" })).toEqual([]);
  });

  test("single date overrides start/end range", () => {
    const clauses = buildVegetationScopeClauses({
      date: "2024-05-10",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(clauses).toHaveLength(1);
    expect(clauses[0]).toContain("2024-05-10");
    expect(clauses[0]).not.toContain("2024-12-31");
  });

  test("uses inclusive range only when both ends are present", () => {
    expect(buildVegetationScopeClauses({ startDate: "2024-01-01" })).toEqual([]);
    expect(
      buildVegetationScopeClauses({ startDate: "2024-01-01", endDate: "2024-01-31" }),
    ).toEqual(["raster_date >= DATE '2024-01-01' AND raster_date < DATE '2024-02-01'"]);
  });

  test("deduplicates crop ids and escapes quotes", () => {
    expect(buildVegetationScopeClauses({ cropId: " 5 ", cropIds: ["5"] })).toEqual([
      "crop_id='5'",
    ]);
    expect(buildVegetationScopeClauses({ cropIds: ["1", "O'g", "", "1"] })).toEqual([
      "crop_id IN ('1','O''g')",
    ]);
  });
});

describe("buildVegetationStatusWhere / buildVegetationCropScopeWhere", () => {
  test("status where joins date, scope and crop filter", () => {
    const where = buildVegetationStatusWhere({
      date: "2024-05-10",
      region: 1724,
      district: 1724401,
      cropIds: ["3", "4"],
      cropId: "3",
    });
    expect(where).toContain("raster_date");
    expect(where).toContain("region='1724'");
    expect(where).toContain("district='1724401'");
    expect(where).toContain("crop_id IN ('3','4')");
    expect(where.split(" AND ").length).toBeGreaterThanOrEqual(4);
  });

  test("status where with a single crop uses equality", () => {
    expect(buildVegetationStatusWhere({ date: "2024-05-10", cropId: "9" })).toContain(
      "crop_id='9'",
    );
  });

  test("invalid date fails closed", () => {
    expect(buildVegetationStatusWhere({ date: "bogus" })).toBe("1=0");
  });

  test("crop scope where includes escaped ndvi_status", () => {
    const where = buildVegetationCropScopeWhere(
      { date: "2024-05-10", ndviStatus: "x", region: 1703 },
      "o'rta",
    );
    expect(where).toContain("ndvi_status='o''rta'");
    expect(where).toContain("region='1703'");
    expect(where).not.toContain("district");
  });
});

describe("resolveVegetationUniqueIdPageSize", () => {
  test.each([
    [null, 2000],
    [{}, 2000],
    [{ maxRecordCount: 400 }, 2000],
    [{ maxRecordCount: 5000.7 }, 5000],
    [{ maxRecordCount: 500 }, 500],
    [{ maxRecordCount: 50000 }, 10000],
  ])("%p -> %p", (layer, expected) => {
    expect(resolveVegetationUniqueIdPageSize(layer)).toBe(expected);
  });
});

describe("readVegAttr", () => {
  test("prefers exact names, then case-insensitive match, in argument order", () => {
    const attrs = { OBJECTID: 7, Region: "1724", uniqueid: "u1" };
    expect(readVegAttr(attrs, "objectid")).toBe(7);
    expect(readVegAttr(attrs, "missing", "region")).toBe("1724");
    expect(readVegAttr(attrs, "uniqueid", "Region")).toBe("u1");
  });

  test("returns undefined for missing attrs or names", () => {
    expect(readVegAttr(null, "a")).toBeUndefined();
    expect(readVegAttr({ a: 1 }, "b")).toBeUndefined();
  });
});

describe("shiftYmd", () => {
  test("shifts across month and year boundaries", () => {
    expect(shiftYmd("2024-01-01", -1)).toBe("2023-12-31");
    expect(shiftYmd("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftYmd("2024-09-13", 0)).toBe("2024-09-13");
  });

  test("returns null for malformed input", () => {
    expect(shiftYmd("2024-09", 1)).toBeNull();
    expect(shiftYmd("aaaa-bb-cc", 1)).toBeNull();
    expect(shiftYmd("", 1)).toBeNull();
  });
});

describe("Tashkent day helpers", () => {
  test("formatEpochToTashkentYmd shifts UTC evening into the next local day", () => {
    expect(formatEpochToTashkentYmd(Date.UTC(2024, 8, 12, 19, 0))).toBe("2024-09-13");
    expect(formatEpochToTashkentYmd(Date.UTC(2024, 8, 12, 18, 59))).toBe("2024-09-12");
    expect(formatEpochToTashkentYmd(new Date(Date.UTC(2024, 0, 1)))).toBe("2024-01-01");
    expect(formatEpochToTashkentYmd("2024-12-31T20:00:00Z")).toBe("2025-01-01");
  });

  test("formatEpochToTashkentYmd returns null for invalid input", () => {
    expect(formatEpochToTashkentYmd(null)).toBeNull();
    expect(formatEpochToTashkentYmd("nope")).toBeNull();
    expect(formatEpochToTashkentYmd(Number.NaN)).toBeNull();
  });

  test("processedAtTashkentDayWhere builds a UTC TIMESTAMP window for the local day", () => {
    expect(processedAtTashkentDayWhere("processed_at", "2024-09-13")).toBe(
      "processed_at >= TIMESTAMP '2024-09-12 19:00:00' AND processed_at < TIMESTAMP '2024-09-13 19:00:00'",
    );
  });

  test("processedAtTashkentDayWhere fails closed on invalid dates", () => {
    expect(processedAtTashkentDayWhere("p", "2024-13-01")).toBe("1=0");
    expect(processedAtTashkentDayWhere("p", "2024-09")).toBe("1=0");
    expect(processedAtTashkentDayWhere("p", "0999-01-01")).toBe("1=0");
  });
});

describe("recent-days cache key and peek", () => {
  test("cache key clamps day count to 1..14 and defaults to 5", () => {
    expect(vegetationRecentDaysCacheKey(5)).toBe("v8-processed_at-calendar-window|5");
    expect(vegetationRecentDaysCacheKey(0)).toMatch(/\|5$/);
    expect(vegetationRecentDaysCacheKey(Number.NaN)).toMatch(/\|5$/);
    expect(vegetationRecentDaysCacheKey(100)).toMatch(/\|14$/);
    expect(vegetationRecentDaysCacheKey(-3)).toMatch(/\|1$/);
    expect(vegetationRecentDaysCacheKey(3.9)).toMatch(/\|3$/);
  });

  test("peek returns only a persisted array", () => {
    expect(peekVegetationRecentDayRegionCounts(5)).toBeNull();
    const groups = [{ date: "2024-09-13", regions: [], totalFields: 0 }];
    setAgriPersistentCache("veg-recent-days", vegetationRecentDaysCacheKey(5), groups);
    expect(peekVegetationRecentDayRegionCounts(5)).toEqual(groups);
    setAgriPersistentCache("veg-recent-days", vegetationRecentDaysCacheKey(3), { bad: 1 });
    expect(peekVegetationRecentDayRegionCounts(3)).toBeNull();
  });
});

describe("debug logging", () => {
  const g = globalThis as typeof globalThis & DebugGlobals;
  afterEach(() => {
    delete g.__AGRO_V5_DEBUG;
    delete g.__AGRO_V5_VH_DEBUG;
    jest.restoreAllMocks();
  });

  test("agriNotifyLog only emits summary phases when debug is on", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    agriNotifyLog("query:start");
    expect(log).not.toHaveBeenCalled();
    g.__AGRO_V5_DEBUG = true;
    agriNotifyLog("count:page");
    agriNotifyLog("query:done", { n: 1 });
    agriNotifyLog("count:x-failed");
    agriNotifyLog("load:error");
    expect(log.mock.calls.map((c) => c[0])).toEqual([
      "[AgriNotify] query:done",
      "[AgriNotify] count:x-failed",
      "[AgriNotify] load:error",
    ]);
  });

  test("agriVhLog emits under the VH flag", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    agriVhLog("phase-a");
    expect(log).not.toHaveBeenCalled();
    g.__AGRO_V5_VH_DEBUG = true;
    agriVhLog("phase-b", { k: 1 });
    expect(log).toHaveBeenCalledWith("[AgriVH] phase-b", { k: 1 });
  });
});

describe("constants and url", () => {
  test("VH category labels map to ndvi_status values", () => {
    expect(VH_CATEGORY_TO_NDVI_STATUS["4-Past"]).toBe("past");
    expect(VH_CATEGORY_TO_NDVI_STATUS["1-Juda yaxshi"]).toBe("juda_yaxshi");
  });

  test("vegetation url comes from service config", () => {
    expect(getAgriVegetationIndicesUrl()).toMatch(/agri_vegetation_indices\/FeatureServer\/\d+$/);
  });

  test("getAgriVegetationIndicesLayer returns the loader handle", async () => {
    const layer = makeFakeVegLayer(() => []);
    setVegLayer(layer, DEFAULT_VEG_FIELDS);
    const handle = await getAgriVegetationIndicesLayer();
    expect(handle.fields).toEqual(DEFAULT_VEG_FIELDS);
  });
});

describe("queryVegFeatures", () => {
  test("normalizes query props and defaults where/returnGeometry", async () => {
    const layer = makeFakeVegLayer(() => [{ a: 1 }]);
    const res = await queryVegFeatures(layer, { outFields: "ndvi", num: 10 });
    expect(res.features).toHaveLength(1);
    const q: FakeQuery = layer.executed[0];
    expect(q.where).toBe("1=1");
    expect(q.outFields).toEqual(["ndvi"]);
    expect(q.returnGeometry).toBe(false);
    expect(q.num).toBe(10);
  });

  test("keeps array outFields and ordering", async () => {
    const layer = makeFakeVegLayer(() => []);
    await queryVegFeatures(layer, {
      where: "region='1'",
      outFields: ["a", "b"],
      orderByFields: ["a ASC"],
      returnGeometry: true,
    });
    expect(layer.executed[0]).toMatchObject({
      where: "region='1'",
      outFields: ["a", "b"],
      orderByFields: ["a ASC"],
      returnGeometry: true,
    });
  });

  test("denied access turns every vegetation query into 1=0", async () => {
    const layer = makeFakeVegLayer(() => []);
    setAccessConfig({
      fullAccessGroups: [],
      rules: [
        {
          id: "r1",
          title: "Region",
          field: "region",
          rules: [{ id: "a1", operator: "equal", value: "1724", groups: ["g1"] }],
        },
      ],
    });
    // User has no matching group -> denied -> every veg query becomes 1=0.
    await queryVegFeatures(layer, { where: "district='5'" });
    expect(layer.executed[0].where).toBe("1=0");
  });

  test("applies region access rule that uses vegetation-schema fields", async () => {
    mockUserGroups.ids = ["g1"];
    setAccessConfig({
      fullAccessGroups: [],
      rules: [
        {
          id: "r1",
          title: "Region",
          field: "region",
          rules: [{ id: "a1", operator: "equal", value: "1724", groups: ["g1"] }],
        },
      ],
    });
    const layer = makeFakeVegLayer(() => []);
    await queryVegFeatures(layer, { where: "district='5'" });
    const where = String(layer.executed[0].where);
    expect(where).toContain("1724");
    expect(where).toContain("(district='5')");
  });

  test("skips viloyat access rules (field absent on vegetation table)", async () => {
    mockUserGroups.ids = ["g1"];
    setAccessConfig({
      fullAccessGroups: [],
      rules: [
        {
          id: "r1",
          title: "Viloyat",
          field: "viloyat",
          rules: [{ id: "a1", operator: "equal", value: "Toshkent", groups: ["g1"] }],
        },
      ],
    });
    const layer = makeFakeVegLayer(() => []);
    await queryVegFeatures(layer, { where: "district='5'" });
    expect(layer.executed[0].where).toBe("district='5'");
  });
});

describe("queryDistinctFieldCount", () => {
  test("uses layer.queryFeatureCount with distinct flags when available", async () => {
    const layer = makeFakeVegLayer(() => [], { queryFeatureCount: async () => 42 });
    await expect(queryDistinctFieldCount(layer, "a=1", "uniqueid")).resolves.toBe(42);
    const q = layer.queryFeatureCount?.mock.calls[0][0];
    expect(q).toMatchObject({
      where: "a=1",
      outFields: ["uniqueid"],
      returnDistinctValues: true,
      returnCountOnly: true,
      returnGeometry: false,
    });
    expect(mockLoadModules).not.toHaveBeenCalled();
  });

  test("falls back to REST when the API count throws", async () => {
    const esriRequest = jest.fn(async () => ({ data: { count: 7 } }));
    mockLoadModules.mockResolvedValue([esriRequest]);
    const layer = makeFakeVegLayer(() => [], {
      url: "https://h/x/FeatureServer/1/",
      queryFeatureCount: async () => {
        throw new Error("unsupported");
      },
    });
    await expect(queryDistinctFieldCount(layer, "a=1", "uniqueid")).resolves.toBe(7);
    const [url, opts] = esriRequest.mock.calls[0] as unknown as [
      string,
      { query: Record<string, unknown> },
    ];
    expect(url).toBe("https://h/x/FeatureServer/1/query");
    expect(opts.query).toMatchObject({
      where: "a=1",
      outFields: "uniqueid",
      returnDistinctValues: true,
      returnCountOnly: true,
    });
  });

  test("REST fallback resolves a bare FeatureServer url to the configured sublayer", async () => {
    const esriRequest = jest.fn(async () => ({ data: { count: 3 } }));
    mockLoadModules.mockResolvedValue([esriRequest]);
    const layer = makeFakeVegLayer(() => [], { url: "https://h/x/FeatureServer" });
    await expect(queryDistinctFieldCount(layer, "a=1", "u")).resolves.toBe(3);
    const url = String((esriRequest.mock.calls[0] as unknown as [string])[0]);
    expect(url).toBe(`${getAgriVegetationIndicesUrl()}/query`);
  });

  test("returns null when the API returns a non-finite count and REST reports an error", async () => {
    const esriRequest = jest.fn(async () => ({ data: { error: { message: "bad" } } }));
    mockLoadModules.mockResolvedValue([esriRequest]);
    const layer = makeFakeVegLayer(() => [], { queryFeatureCount: async () => Number.NaN });
    await expect(queryDistinctFieldCount(layer, "a=1", "u")).resolves.toBeNull();
  });

  test("returns null when module loading fails", async () => {
    mockLoadModules.mockRejectedValue(new Error("offline"));
    const layer = makeFakeVegLayer(() => []);
    await expect(queryDistinctFieldCount(layer, "a=1", "u")).resolves.toBeNull();
  });
});
