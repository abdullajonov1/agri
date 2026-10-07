jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import {
  apostropheVariants,
  buildEfficiencyRangeWhere,
  buildTuriMapClause,
  clampEfficiencyValue,
  exactOrClause,
  expandDistrictVariants,
  expandRegionVariants,
  getMavsumGroupedValues,
  hasActiveLandTypeFilter,
  hasFieldIn,
  isEfficiencyRangeActive,
  landTypeIdForValue,
  layerFieldKind,
  matchIndexedValues,
  mergeEfficiencyIntoFilters,
  MONTHLY_FIELDS,
  normalizeFarmerTaxSearchValue,
  normalizeLandTypeValue,
  normalizeValueToken,
  resolveEfficiencyField,
  valueIndexCache,
} from "./where-values";
import { getQueryUrl } from "./query-cache";
import { fields, makeLayer, uniqueLayerUrl } from "./__test-utils__/fake-layer";

describe("efficiency range", () => {
  test("resolveEfficiencyField prefers eff, then efficiency, then wp_tot (case-insensitive)", () => {
    expect(resolveEfficiencyField(["WP_TOT", "Efficiency", "EFF"])).toBe("EFF");
    expect(resolveEfficiencyField(["wp_tot", "Efficiency"])).toBe("Efficiency");
    expect(resolveEfficiencyField(["wp_tot"])).toBe("wp_tot");
    expect(resolveEfficiencyField(["other"])).toBeNull();
  });

  test("clampEfficiencyValue rounds and clamps to 0..100", () => {
    expect(clampEfficiencyValue(-5)).toBe(0);
    expect(clampEfficiencyValue(150)).toBe(100);
    expect(clampEfficiencyValue(42.6)).toBe(43);
  });

  test.each([
    [null, 100, false],
    [0, undefined, false],
    [0, 100, false],
    [Number.NaN, 50, false],
    [10, 100, true],
    [0, 90, true],
  ])("isEfficiencyRangeActive(%p, %p) = %p", (min, max, expected) => {
    expect(isEfficiencyRangeActive(min, max)).toBe(expected);
  });

  test("buildEfficiencyRangeWhere returns empty for full range", () => {
    expect(buildEfficiencyRangeWhere(0, 100, ["eff"])).toBe("");
  });

  test("buildEfficiencyRangeWhere uses the layer field and swaps inverted bounds", () => {
    expect(buildEfficiencyRangeWhere(80, 20, ["Efficiency"])).toBe(
      "Efficiency >= 20 AND Efficiency <= 80",
    );
  });

  test("buildEfficiencyRangeWhere defaults to eff only when field list is unknown", () => {
    expect(buildEfficiencyRangeWhere(10, 90, [])).toBe("eff >= 10 AND eff <= 90");
    expect(buildEfficiencyRangeWhere(10, 90, ["other"])).toBe("");
  });

  test("mergeEfficiencyIntoFilters returns same object when inactive, clamped copy otherwise", () => {
    const filters = { yil: "2025" };
    expect(mergeEfficiencyIntoFilters(filters, 0, 100)).toBe(filters);
    const merged = mergeEfficiencyIntoFilters(filters, -3, 55.4);
    expect(merged).toEqual({ yil: "2025", effMin: 0, effMax: 55 });
    expect(filters).toEqual({ yil: "2025" });
  });
});

describe("field metadata", () => {
  test("hasFieldIn is case-insensitive", () => {
    expect(hasFieldIn(["Region_ID"], "region_id")).toBe(true);
    expect(hasFieldIn(["x"], "region_id")).toBe(false);
  });

  test("layerFieldKind classifies esri types and reports unknown without metadata", () => {
    const layer = makeLayer({
      fields: fields(
        ["a", "esriFieldTypeInteger"],
        ["b", "esriFieldTypeDouble"],
        ["c", "esriFieldTypeOID"],
        ["d", "esriFieldTypeString"],
        ["e"],
      ),
    });
    expect(layerFieldKind(layer, "A")).toBe("numeric");
    expect(layerFieldKind(layer, "b")).toBe("numeric");
    expect(layerFieldKind(layer, "c")).toBe("numeric");
    expect(layerFieldKind(layer, "d")).toBe("string");
    expect(layerFieldKind(layer, "e")).toBe("unknown");
    expect(layerFieldKind(layer, "missing")).toBe("unknown");
    expect(layerFieldKind(null, "a")).toBe("unknown");
  });
});

describe("spelling variants", () => {
  test("apostropheVariants normalizes every apostrophe glyph and emits all encodings", () => {
    const variants = apostropheVariants("  Farg‘ona ");
    expect(variants).toEqual(
      expect.arrayContaining(["Farg'ona", "Farg’ona", "Farg`ona", "Fargʻona", "Farg‘ona", "Fargʼona"]),
    );
    expect(new Set(variants).size).toBe(variants.length);
  });

  test("apostropheVariants of a value without apostrophes is a single entry", () => {
    expect(apostropheVariants("Andijon")).toEqual(["Andijon"]);
    expect(apostropheVariants("   ")).toEqual([]);
  });

  test("expandRegionVariants adds and strips the viloyati suffix", () => {
    expect(expandRegionVariants("Andijon")).toEqual(["Andijon", "Andijon viloyati"]);
    expect(expandRegionVariants("Andijon viloyati")).toEqual(["Andijon", "Andijon viloyati"]);
    expect(expandRegionVariants("")).toEqual([]);
  });

  test("expandRegionVariants handles Cyrillic suffix", () => {
    expect(expandRegionVariants("Андижон")).toEqual(
      expect.arrayContaining(["Андижон", "Андижон вилояти"]),
    );
    expect(expandRegionVariants("Андижон вилояти")).toEqual(
      expect.arrayContaining(["Андижон", "Андижон вилояти"]),
    );
  });

  test("expandRegionVariants does not append viloyati to a value ending in 'viloyat'", () => {
    expect(expandRegionVariants("Andijon viloyat")).toEqual(["Andijon viloyat"]);
  });

  test("expandDistrictVariants strips a known suffix and adds the others", () => {
    const v = expandDistrictVariants("Bag'dod tumani");
    expect(v).toEqual(expect.arrayContaining(["Bag'dod", "Bag'dod tumani", "Bag’dod tumani"]));
    expect(v).toContain("Bag'dod tumani shahri");
    expect(expandDistrictVariants(" ")).toEqual([]);
  });

  test("getMavsumGroupedValues expands grouped seasons", () => {
    expect(getMavsumGroupedValues("Ikkilamchi")).toEqual(
      expect.arrayContaining(["Ikkilamchi"]),
    );
    expect(getMavsumGroupedValues("birlamchi")).toEqual(
      expect.arrayContaining(["birlamchi", "Birlamchi va umummavsumiy", "Umumiy va birlamchi mavsum"]),
    );
    expect(getMavsumGroupedValues("Bahor")).toEqual(["Bahor"]);
    expect(getMavsumGroupedValues("")).toEqual([]);
  });
});

describe("buildTuriMapClause", () => {
  test("returns empty when nothing selected", () => {
    expect(buildTuriMapClause(makeLayer(), [])).toBe("");
    expect(buildTuriMapClause(makeLayer(), "  ")).toBe("");
  });

  test("returns empty when layer has fields but no turi field", () => {
    const layer = makeLayer({ fields: fields(["other", "esriFieldTypeString"]) });
    expect(buildTuriMapClause(layer, "paxta")).toBe("");
  });

  test("uses the layer's turi field name and ORs crop spelling variants", () => {
    const layer = makeLayer({ fields: fields(["TURI", "esriFieldTypeString"]) });
    const clause = buildTuriMapClause(layer, "bugdoy");
    expect(clause.startsWith("(")).toBe(true);
    expect(clause).toContain("TURI='bugdoy'");
    expect(clause).toMatch(/TURI='Bug''doy'/);
  });

  test("defaults to turi when layer fields are unknown and escapes quotes", () => {
    const clause = buildTuriMapClause(null, "x'y");
    expect(clause).toContain("turi='x''y'");
  });
});

describe("value index matching", () => {
  test("normalizeValueToken strips apostrophes, suffixes and punctuation", () => {
    expect(normalizeValueToken("Bog‘dod tumani")).toBe("bogdod");
    expect(normalizeValueToken("Farg'ona viloyati")).toBe("fargona");
    expect(normalizeValueToken("Toshkent shahri")).toBe("toshkent");
    expect(normalizeValueToken("")).toBe("");
  });

  test("matchIndexedValues returns null when no index exists", () => {
    expect(matchIndexedValues(null, "mavsum", "x")).toBeNull();
    const layer = makeLayer({ url: uniqueLayerUrl("noidx") });
    expect(matchIndexedValues(layer, "mavsum", "x")).toBeNull();
  });

  test("matchIndexedValues prefers exact normalized matches, then substring", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("idx") });
    valueIndexCache.set(getQueryUrl(layer), {
      tuman: ["Bog'dod tumani", "Bog'dodobod", "Rishton"],
      empty: [],
    });
    expect(matchIndexedValues(layer, "TUMAN", "Bog‘dod")).toEqual(["Bog'dod tumani"]);
    expect(matchIndexedValues(layer, "tuman", "risht")).toEqual(["Rishton"]);
    expect(matchIndexedValues(layer, "tuman", "zz")).toEqual([]);
    expect(matchIndexedValues(layer, "tuman", "  ")).toEqual([]);
    expect(matchIndexedValues(layer, "empty", "anything")).toEqual([]);
  });
});

describe("exactOrClause", () => {
  test("returns empty when no alias exists or no values given", () => {
    expect(exactOrClause(["mavsum"], ["a"], ["year"])).toBe("");
    expect(exactOrClause(["mavsum"], [], ["mavsum"])).toBe("");
  });

  test("ORs every value over every available alias, deduplicated and escaped", () => {
    expect(
      exactOrClause(["season_id", "mavsum"], ["A'b", "A'b", " "], ["mavsum", "season_id"]),
    ).toBe("(season_id='A''b' OR mavsum='A''b')");
  });

  test("single term is not wrapped", () => {
    expect(exactOrClause(["mavsum"], ["x"], ["mavsum"])).toBe("mavsum='x'");
  });

  test("numeric mode keeps digits only and skips non-numeric values", () => {
    expect(exactOrClause(["crop_id"], ["id-12", "abc", "7"], ["crop_id"], true)).toBe(
      "(crop_id=12 OR crop_id=7)",
    );
    expect(exactOrClause(["crop_id"], ["abc"], ["crop_id"], true)).toBe("");
  });
});

describe("farmer tax + land type", () => {
  test("normalizeFarmerTaxSearchValue keeps at most 9 digits", () => {
    expect(normalizeFarmerTaxSearchValue("12-34 567 8901")).toBe("123456789");
    expect(normalizeFarmerTaxSearchValue("abc")).toBe("");
  });

  test.each([
    ["", ""],
    ["Barchasi", ""],
    ["umumiy", ""],
    ["1", "sugoriladigan"],
    ["Sug‘oriladigan", "sugoriladigan"],
    ["Sug'orilgan", "sugoriladigan"],
    ["2", "lalmi"],
    ["Lalmi", "lalmi"],
    ["boshqa", ""],
  ])("normalizeLandTypeValue(%p) = %p", (input, expected) => {
    expect(normalizeLandTypeValue(input)).toBe(expected);
  });

  test("landTypeIdForValue maps to water_table type ids", () => {
    expect(landTypeIdForValue("sugoriladigan")).toBe("1");
    expect(landTypeIdForValue("lalmi")).toBe("2");
    expect(landTypeIdForValue("x")).toBe("");
  });

  test("hasActiveLandTypeFilter checks id first, then label", () => {
    expect(hasActiveLandTypeFilter(null, "2")).toBe(true);
    expect(hasActiveLandTypeFilter("Lalmi", null)).toBe(true);
    expect(hasActiveLandTypeFilter("Barchasi", "")).toBe(false);
    expect(hasActiveLandTypeFilter()).toBe(false);
  });
});

test("MONTHLY_FIELDS covers March..October water use", () => {
  expect(MONTHLY_FIELDS.map((m) => m.month)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
  expect(MONTHLY_FIELDS[0]).toEqual({ field: "uw3_m3", month: 3, key: "uw3_m3" });
});
