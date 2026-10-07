type Attrs = Record<string, unknown>;

interface QueryRecord {
  [key: string]: unknown;
}

interface FakeTableLayer {
  objectIdField?: string;
  createQuery: () => QueryRecord;
  queryFeatures: jest.Mock<Promise<{ features: Array<{ attributes: Attrs }> }>, [QueryRecord]>;
}

const layerRef: { current: FakeTableLayer | null; loadError: Error | null } = {
  current: null,
  loadError: null,
};

jest.mock("../shared/agri-singleton-layer-loader", () => ({
  createSingletonLayerLoader: () => () =>
    layerRef.loadError
      ? Promise.reject(layerRef.loadError)
      : Promise.resolve({ layer: layerRef.current, fields: [] }),
}));
jest.mock("../shared/agri-access-config", () => ({
  combineAccessWhere: (where: string) => `ACCESS AND (${where})`,
}));

type TableModule = typeof import("./agri-table-data-source");

function loadFresh(): TableModule {
  let mod: TableModule | undefined;
  jest.isolateModules(() => {
    mod = jest.requireActual<TableModule>("./agri-table-data-source");
  });
  if (!mod) throw new Error("module did not load");
  return mod;
}

function useLayer(pages: Array<Array<Attrs>>, objectIdField?: string): FakeTableLayer {
  let call = 0;
  const layer: FakeTableLayer = {
    objectIdField,
    createQuery: () => ({}),
    queryFeatures: jest.fn((_query: QueryRecord) => {
      const page = pages[Math.min(call++, pages.length - 1)] || [];
      return Promise.resolve({ features: page.map((attributes) => ({ attributes })) });
    }),
  };
  layerRef.current = layer;
  return layer;
}

beforeEach(() => {
  layerRef.current = null;
  layerRef.loadError = null;
});

describe("getAgriTableDataUrl / buildSpatialJoinWhere", () => {
  test("url comes from service config", () => {
    expect(loadFresh().getAgriTableDataUrl()).toMatch(/Agri_table_data\/FeatureServer\/2$/);
  });

  test("empty input -> 1=0", () => {
    const m = loadFresh();
    expect(m.buildSpatialJoinWhere([])).toBe("1=0");
    expect(m.buildSpatialJoinWhere(["", " ", "{}"])).toBe("1=0");
  });

  test("expands braced and bare variants and escapes quotes", () => {
    const m = loadFresh();
    expect(m.buildSpatialJoinWhere(["{AB}"])).toBe("uniqueid IN ('{AB}','AB')");
    expect(m.buildSpatialJoinWhere(["a'b"])).toBe("uniqueid IN ('a''b','{a''b}')");
  });
});

describe("queryAgriRecordByUniqueId", () => {
  test("blank id short-circuits", async () => {
    const m = loadFresh();
    expect(await m.queryAgriRecordByUniqueId("  ")).toBeNull();
  });

  test("queries one record by escaped uniqueid", async () => {
    const layer = useLayer([[{ uniqueid: "x", viloyat: "Andijon" }]]);
    const m = loadFresh();
    expect(await m.queryAgriRecordByUniqueId(" o'k ")).toEqual({ uniqueid: "x", viloyat: "Andijon" });
    expect(layer.queryFeatures.mock.calls[0][0]).toMatchObject({
      where: "uniqueid='o''k'",
      outFields: ["*"],
      returnGeometry: false,
      num: 1,
    });
  });

  test("returns null when not found", async () => {
    useLayer([[]]);
    expect(await loadFresh().queryAgriRecordByUniqueId("x")).toBeNull();
  });
});

describe("queryAgriUniqueIdsForFarmerInn", () => {
  test("blank INN short-circuits", async () => {
    expect(await loadFresh().queryAgriUniqueIdsForFarmerInn(" ")).toEqual([]);
  });

  test("scopes by the given WHERE and pages until a short page, deduping ids", async () => {
    const full = Array.from({ length: 2000 }, (_, i) => ({ uniqueid: `id${i % 1500}` }));
    const layer = useLayer([full, [{ uniqueid: "last" }, { uniqueid: "" }, { uniqueid: null }]], "OID");
    const ids = await loadFresh().queryAgriUniqueIdsForFarmerInn("123", "viloyat='A'");
    expect(ids).toHaveLength(1501);
    expect(ids).toContain("last");
    const [q1, q2] = layer.queryFeatures.mock.calls.map((c) => c[0]);
    expect(q1).toMatchObject({
      where: "(viloyat='A') AND (UPPER(f_inn)=UPPER('123'))",
      outFields: ["uniqueid", "OID"],
      orderByFields: ["OID ASC"],
      resultOffset: 0,
      resultRecordCount: 2000,
      returnDistinctValues: false,
    });
    expect(q2.resultOffset).toBe(2000);
  });

  test("trivial scope is ignored", async () => {
    const layer = useLayer([[]]);
    await loadFresh().queryAgriUniqueIdsForFarmerInn("9", "1=1");
    expect(layer.queryFeatures.mock.calls[0][0].where).toBe("UPPER(f_inn)=UPPER('9')");
  });
});

describe("uniqueid style detection and expansion", () => {
  test("detects braced upper-case ids and adapts input ids", async () => {
    useLayer([[{ uniqueid: "{ABC-1}" }, { UNIQUEID: "{DEF-2}" }]]);
    const m = loadFresh();
    // falls back to the upper-case UNIQUEID attribute name
    expect(await m.getAgriTableUniqueIdSamples()).toEqual(["{ABC-1}", "{DEF-2}"]);
    expect(await m.getAgriTableUniqueIdStyle()).toEqual({ braced: true, letterCase: "upper" });
    expect(await m.expandUniqueIdsForAgriTable(["abc-1", " ", "{abc-2}"])).toEqual([
      "abc-1",
      "{ABC-1}",
      "{abc-2}",
      "{ABC-2}",
    ]);
  });

  test("lower / mixed / digit-only styles", async () => {
    useLayer([[{ uniqueid: "abc" }]]);
    expect(await loadFresh().getAgriTableUniqueIdStyle()).toEqual({ braced: false, letterCase: "lower" });
    useLayer([[{ uniqueid: "Abc" }]]);
    expect(await loadFresh().getAgriTableUniqueIdStyle()).toEqual({ braced: false, letterCase: "mixed" });
    useLayer([[{ uniqueid: "123" }]]);
    expect(await loadFresh().getAgriTableUniqueIdStyle()).toEqual({ braced: false, letterCase: "mixed" });
    useLayer([[]]);
    expect(await loadFresh().getAgriTableUniqueIdStyle()).toBeNull();
  });

  test("unknown style (load failure) covers common GUID spellings", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    layerRef.loadError = new Error("offline");
    const m = loadFresh();
    expect(await m.expandUniqueIdsForAgriTable(["{ab}"])).toEqual(["{ab}", "ab", "AB", "{AB}"]);
    warn.mockRestore();
  });

  test("sample WHERE goes through the access clause", () => {
    expect(loadFresh().agriTableUniqueIdSampleWhere()).toBe("ACCESS AND (uniqueid IS NOT NULL)");
  });
});

describe("mapping queries", () => {
  test("region/district mappings drop incomplete rows and default count to 1", async () => {
    const layer = useLayer([
      [
        { viloyat: " Andijon ", region: "1703", tuman: "Asaka", district: 1703202, cnt: 15 },
        { viloyat: "Andijon", region: 1703, tuman: "Quva", district: "x", cnt: 1 },
        { viloyat: "", region: 1, tuman: "a", district: 2, cnt: 3 },
        { viloyat: "Fargona", region: 1730, tuman: "Quva", district: 1730212, cnt: 0 },
      ],
    ]);
    const m = loadFresh();
    const rows = await m.queryAgriRegionDistrictMappings();
    expect(rows).toEqual([
      { viloyat: "Andijon", region: 1703, tuman: "Asaka", district: 1703202, count: 15 },
      { viloyat: "Fargona", region: 1730, tuman: "Quva", district: 1730212, count: 1 },
    ]);
    // cached
    await m.queryAgriRegionDistrictMappings();
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
    expect(layer.queryFeatures.mock.calls[0][0]).toMatchObject({
      where: "ACCESS AND (1=1)",
      groupByFieldsForStatistics: ["viloyat", "region", "tuman", "district"],
    });
  });

  test("turi/crop mappings keep complete pairs", async () => {
    useLayer([[{ turi: "Paxta", crop_id: 2 }, { turi: "", crop_id: 3 }, { turi: "Bug'doy", crop_id: null }]]);
    expect(await loadFresh().queryAgriTuriCropMappings()).toEqual([{ turi: "Paxta", cropId: "2" }]);
  });

  test("failed mapping queries are not cached", async () => {
    layerRef.loadError = new Error("offline");
    const m = loadFresh();
    await expect(m.queryAgriTuriCropMappings()).rejects.toThrow("offline");
    await expect(m.queryAgriRegionDistrictMappings()).rejects.toThrow("offline");
    layerRef.loadError = null;
    useLayer([[{ turi: "Paxta", crop_id: 2 }]]);
    expect(await m.queryAgriTuriCropMappings()).toHaveLength(1);
  });
});

export {};
