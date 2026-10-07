import {
  assembleLocalizationWhere,
  buildNdviDateNotNullSqlClause,
  buildNdviStatusEqualsSqlClause,
  buildNdviTableWhereWithRegion,
  buildTableDateEqualsWhere,
  buildTumanDistrictSqlClause,
  buildUniqueIdSqlClause,
  buildViloyatRegionSqlClause,
  buildYearClauseForLayerFields,
  resolveNdviStatusFieldName,
  type AposHelpers,
} from "./map-where-clauses";
import { makeRegionDistrictKey, normalizeLocalizationApos } from "./geo-keys";

const helpers: AposHelpers = {
  normalizeApos: normalizeLocalizationApos,
  makeRegionDistrictKey,
  eqAposSmart: (field: string, raw: string): string => `${field} = '${raw}'`,
};

describe("buildUniqueIdSqlClause", () => {
  test("returns empty string for blank input", () => {
    expect(buildUniqueIdSqlClause("  ")).toBe("");
  });

  test("expands bare id into bare and braced variants", () => {
    expect(buildUniqueIdSqlClause("abc")).toBe(
      "(uniqueid='abc' OR uniqueid='{abc}')",
    );
  });

  test("expands braced id and honours custom field", () => {
    expect(buildUniqueIdSqlClause("{x1}", "gid")).toBe(
      "(gid='{x1}' OR gid='x1')",
    );
  });

  test("escapes quotes", () => {
    expect(buildUniqueIdSqlClause("a'b")).toContain("uniqueid='a''b'");
  });
});

describe("buildViloyatRegionSqlClause", () => {
  test("empty viloyat yields empty clause", () => {
    expect(buildViloyatRegionSqlClause("", {}, helpers)).toBe("");
  });

  test("numeric viloyat filters region directly", () => {
    expect(buildViloyatRegionSqlClause("07", {}, helpers)).toBe("region = '7'");
  });

  test("mapped name uses region number", () => {
    expect(
      buildViloyatRegionSqlClause("Samarqand", { samarqand: 14 }, helpers),
    ).toBe("region = '14'");
  });

  test("unmapped name falls back to text equality", () => {
    expect(buildViloyatRegionSqlClause("Navoiy", {}, helpers)).toBe(
      "viloyat = 'Navoiy'",
    );
  });
});

describe("buildTumanDistrictSqlClause", () => {
  test("empty tuman yields empty clause", () => {
    expect(buildTumanDistrictSqlClause("", {}, helpers)).toBe("");
  });

  test("numeric tuman filters district directly", () => {
    expect(buildTumanDistrictSqlClause("12", {}, helpers)).toBe(
      "district = '12'",
    );
  });

  test("prefers region-scoped key when viloyat maps to a region", () => {
    const map = { "region:3|olot": 301, olot: 999 };
    expect(
      buildTumanDistrictSqlClause("Olot", map, helpers, {
        rawViloyat: "Buxoro",
        viloyatToRegion: { buxoro: 3 },
      }),
    ).toBe("district = '301'");
  });

  test("numeric viloyat scopes lookup by region number", () => {
    const map = { "region:5|olot": 501 };
    expect(
      buildTumanDistrictSqlClause("Olot", map, helpers, { rawViloyat: "5" }),
    ).toBe("district = '501'");
  });

  test("uses viloyat-name scoped key when region unknown", () => {
    const map = { "viloyat:buxoro|olot": 42 };
    expect(
      buildTumanDistrictSqlClause("Olot", map, helpers, { rawViloyat: "Buxoro" }),
    ).toBe("district = '42'");
  });

  test("falls back to bare tuman key, then text equality", () => {
    expect(buildTumanDistrictSqlClause("Olot", { olot: 7 }, helpers)).toBe(
      "district = '7'",
    );
    expect(buildTumanDistrictSqlClause("Olot", {}, helpers)).toBe(
      "tuman = 'Olot'",
    );
  });
});

describe("NDVI status clauses", () => {
  const layerFields = [{ name: "STATUS_2025_09_01" }, null, { name: "yil" }];

  test("resolveNdviStatusFieldName uses map then prefix", () => {
    expect(
      resolveNdviStatusFieldName("2025-09-01", "status_", {
        "2025-09-01": "custom",
      }),
    ).toBe("custom");
    expect(resolveNdviStatusFieldName("2025-09-01", "status_", {})).toBe(
      "status_2025_09_01",
    );
  });

  test("equals clause built when field exists and category known", () => {
    expect(
      buildNdviStatusEqualsSqlClause({
        ndviDate: "2025-09-01",
        vhCategory: "2-Yaxshi",
        prefix: "status_",
        dateFieldMap: {},
        layerFields,
      }),
    ).toBe("status_2025_09_01 = 'yaxshi'");
  });

  test("equals clause empty on missing inputs, unknown category, or missing field", () => {
    const base = {
      ndviDate: "2025-09-01",
      vhCategory: "2-Yaxshi",
      prefix: "status_",
      dateFieldMap: {},
      layerFields,
    };
    expect(buildNdviStatusEqualsSqlClause({ ...base, ndviDate: "" })).toBe("");
    expect(buildNdviStatusEqualsSqlClause({ ...base, vhCategory: "zzz" })).toBe(
      "",
    );
    expect(
      buildNdviStatusEqualsSqlClause({ ...base, layerFields: undefined }),
    ).toBe("");
  });

  test("not-null clause", () => {
    const base = {
      ndviDate: "2025-09-01",
      prefix: "status_",
      dateFieldMap: {},
      layerFields,
    };
    expect(buildNdviDateNotNullSqlClause(base)).toBe(
      "status_2025_09_01 IS NOT NULL",
    );
    expect(buildNdviDateNotNullSqlClause({ ...base, ndviDate: " " })).toBe("");
    expect(buildNdviDateNotNullSqlClause({ ...base, layerFields: [] })).toBe("");
  });
});

describe("assembleLocalizationWhere", () => {
  const base = {
    yearClause: "yil = 2025",
    includeViloyat: false,
    viloyatClause: "",
    includeTuman: false,
    tumanClause: "",
    includeTuri: false,
    cropClause: "",
    includeVh: false,
    vhCategory: "",
    vhUniqueIds: null as string[] | null,
    uniqueIdClause: "",
    buildSpatialJoinWhere: (ids: string[]): string =>
      ids.length ? `uniqueid IN (${ids.join(",")})` : "1=0",
    withAccessWhere: (w: string): string => w,
  };

  test("missing or impossible year short-circuits", () => {
    expect(assembleLocalizationWhere({ ...base, yearClause: "" })).toBe("1=0");
    expect(assembleLocalizationWhere({ ...base, yearClause: "1=0" })).toBe(
      "1=0",
    );
  });

  test("required viloyat without clause yields 1=0", () => {
    expect(assembleLocalizationWhere({ ...base, includeViloyat: true })).toBe(
      "1=0",
    );
  });

  test("joins every enabled fragment and applies access wrapper", () => {
    const result = assembleLocalizationWhere({
      ...base,
      includeViloyat: true,
      viloyatClause: "region = '1'",
      includeTuman: true,
      tumanClause: "district = '2'",
      includeTuri: true,
      cropClause: "turi = 'g'",
      farmerInnClause: "f_inn='1'",
      includeVh: true,
      vhCategory: "2-Yaxshi",
      vhUniqueIds: ["a", "b"],
      uniqueIdClause: "uniqueid='x'",
      withAccessWhere: (w: string): string => `(${w}) AND acl`,
    });
    expect(result).toBe(
      "(yil = 2025 AND region = '1' AND district = '2' AND turi = 'g' AND f_inn='1' AND uniqueid IN (a,b) AND uniqueid='x') AND acl",
    );
  });

  test("empty VH id list yields 1=0; null list is skipped", () => {
    expect(
      assembleLocalizationWhere({
        ...base,
        includeVh: true,
        vhCategory: "2-Yaxshi",
        vhUniqueIds: [],
      }),
    ).toBe("1=0");
    expect(
      assembleLocalizationWhere({
        ...base,
        includeVh: true,
        vhCategory: "2-Yaxshi",
        vhUniqueIds: null as string[] | null,
      }),
    ).toBe("yil = 2025");
  });
});

describe("buildYearClauseForLayerFields", () => {
  test("empty yil yields 1=0", () => {
    expect(buildYearClauseForLayerFields("", [])).toBe("1=0");
  });

  test("non-digit yil uses contains LIKE", () => {
    expect(buildYearClauseForLayerFields("abc", [])).toBe("yil LIKE '%abc%'");
  });

  test("numeric field uses equality", () => {
    for (const type of ["small-integer", "integer", "single", "double"]) {
      expect(
        buildYearClauseForLayerFields("2025 yil", [{ name: "YIL", type }]),
      ).toBe("yil = 2025");
    }
  });

  test("string or unknown field uses prefix LIKE", () => {
    expect(
      buildYearClauseForLayerFields("2024", [{ name: "yil", type: "string" }]),
    ).toBe("yil LIKE '2024%'");
    expect(buildYearClauseForLayerFields("2024", undefined)).toBe(
      "yil LIKE '2024%'",
    );
  });
});

describe("buildTableDateEqualsWhere", () => {
  test("valid date builds equality", () => {
    expect(buildTableDateEqualsWhere("sana", " 2025-09-01 ")).toBe(
      "sana = '2025-09-01'",
    );
  });

  test("invalid or missing inputs return null", () => {
    expect(buildTableDateEqualsWhere("", "2025-09-01")).toBeNull();
    expect(buildTableDateEqualsWhere("sana", "")).toBeNull();
    expect(buildTableDateEqualsWhere("sana", "2025-9-1")).toBeNull();
    expect(buildTableDateEqualsWhere("sana", "2025-09-01' OR 1=1")).toBeNull();
  });
});

describe("buildNdviTableWhereWithRegion", () => {
  const base = {
    dateField: "sana",
    ndviDate: "2025-09-01",
    tableFieldNames: ["yil", "region", "viloyat", "district", "tuman", "turi"],
    yil: "2025",
    viloyat: "",
    tuman: "",
    lockedViloyat: null as string | null,
    viloyatToRegion: { Buxoro: 3 },
    tumanToDistrict: { Olot: 301 },
    normalizeApos: (s: string): string => s.trim(),
    cropClause: "",
  };

  test("returns null on invalid date", () => {
    expect(buildNdviTableWhereWithRegion({ ...base, ndviDate: "x" })).toBeNull();
  });

  test("maps names to region/district numbers and appends crop", () => {
    expect(
      buildNdviTableWhereWithRegion({
        ...base,
        viloyat: "Buxoro",
        tuman: "Olot",
        cropClause: "turi = 'g'",
      }),
    ).toBe(
      "sana = '2025-09-01' AND yil LIKE '2025%' AND region = '3' AND district = '301' AND turi = 'g'",
    );
  });

  test("numeric codes go straight to region/district", () => {
    expect(
      buildNdviTableWhereWithRegion({ ...base, viloyat: "4", tuman: "12" }),
    ).toBe(
      "sana = '2025-09-01' AND yil LIKE '2025%' AND region = '4' AND district = '12'",
    );
  });

  test("unmapped names fall back to text fields", () => {
    expect(
      buildNdviTableWhereWithRegion({
        ...base,
        yil: "",
        lockedViloyat: "Navoiy",
        tuman: "Karmana",
      }),
    ).toBe("sana = '2025-09-01' AND viloyat = 'Navoiy' AND tuman = 'Karmana'");
  });

  test("tables without region/district use text fields; missing fields skip", () => {
    expect(
      buildNdviTableWhereWithRegion({
        ...base,
        tableFieldNames: ["viloyat", "tuman"],
        viloyat: "Buxoro",
        tuman: "Olot",
        cropClause: "turi = 'g'",
      }),
    ).toBe("sana = '2025-09-01' AND viloyat = 'Buxoro' AND tuman = 'Olot'");
    expect(
      buildNdviTableWhereWithRegion({
        ...base,
        tableFieldNames: [],
        viloyat: "Buxoro",
        tuman: "Olot",
      }),
    ).toBe("sana = '2025-09-01'");
  });

  test("blank tuman after normalization is ignored", () => {
    expect(
      buildNdviTableWhereWithRegion({ ...base, yil: "", tuman: "   " }),
    ).toBe("sana = '2025-09-01'");
  });
});
