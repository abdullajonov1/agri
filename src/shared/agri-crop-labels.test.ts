import {
  buildTurlarSqlClause,
  getCropCanonicalKey,
  getCropColor,
  getCropDisplayName,
  getCropTuriMatchValues,
  getTuriCropLookupKey,
  normalizeCropName,
} from "./agri-crop-labels";

describe("normalizeCropName", () => {
  test("folds apostrophe variants, nbsp and whitespace", () => {
    expect(normalizeCropName("  Bug’doy  ")).toBe("Bug'doy");
    expect(normalizeCropName("Sarimsoq   piyoz")).toBe("Sarimsoq piyoz");
    expect(normalizeCropName(null)).toBe("");
  });
});

describe("getCropCanonicalKey", () => {
  test.each([
    ["Bug'doy", "bugdoy"],
    ["Буғдой", "bugdoy"],
    ["Bugʻdoy", "bugdoy"],
    ["Wheat", "bugdoy"],
    ["Пшеница", "bugdoy"],
    ["G'oza", "paxta"],
    ["Нут", "noxat"],
    ["sarimsoq piyoz", "sarimsoq"],
    ["Yer yong'oq", "yeryongoq"],
    ["Makkajo'xori", "makkajoxori"],
  ])("%s -> %s", (raw, key) => {
    expect(getCropCanonicalKey(raw)).toBe(key);
    expect(getTuriCropLookupKey(raw)).toBe(key);
  });

  test("unknown crops collapse to apostrophe/space-free lowercase", () => {
    expect(getCropCanonicalKey("Yangi O'simlik")).toBe("yangiosimlik");
  });

  test("empty input gives empty key", () => {
    expect(getCropCanonicalKey("   ")).toBe("");
    expect(getCropCanonicalKey(undefined)).toBe("");
  });
});

describe("getCropDisplayName", () => {
  test("localizes across languages from any spelling", () => {
    expect(getCropDisplayName("bugdoy", "en")).toBe("Wheat");
    expect(getCropDisplayName("Bug'doy", "ru")).toBe("Пшеница");
    expect(getCropDisplayName("Wheat", "uz_cyr")).toBe("Буғдой");
    expect(getCropDisplayName("Rice", "uz_lat")).toBe("Sholi");
  });

  test("unknown or empty crop returns trimmed raw value", () => {
    expect(getCropDisplayName("  Kiwi ", "en")).toBe("Kiwi");
    expect(getCropDisplayName("", "en")).toBe("");
    expect(getCropDisplayName(null, "en")).toBe("");
  });
});

describe("getCropColor", () => {
  test("known crops use the fixed color map", () => {
    expect(getCropColor("Bug'doy")).toBe("#D9A300");
    expect(getCropColor("Cotton")).toBe("#E8E1D1");
  });

  test("unknown crops cycle through palette by index", () => {
    expect(getCropColor("kiwi")).toBe("#1E7AE6");
    expect(getCropColor("kiwi", 1)).toBe("#202124");
    expect(getCropColor("kiwi", 15)).toBe("#1E7AE6");
  });
});

describe("getCropTuriMatchValues", () => {
  test("includes canonical, every label, raw and aliases", () => {
    const values = getCropTuriMatchValues("Wheat");
    expect(values).toEqual(
      expect.arrayContaining(["bugdoy", "Буғдой", "Bug'doy", "Пшеница", "Wheat", "bug'doy"]),
    );
    expect(new Set(values).size).toBe(values.length);
  });

  test("unknown crop yields canonical and raw", () => {
    expect(getCropTuriMatchValues("Kiwi")).toEqual(["kiwi", "Kiwi"]);
  });

  test("empty input yields nothing", () => {
    expect(getCropTuriMatchValues("")).toEqual([]);
  });
});

describe("buildTurlarSqlClause", () => {
  test("empty input returns empty string", () => {
    expect(buildTurlarSqlClause("turi", [])).toBe("");
    expect(buildTurlarSqlClause("turi", ["", null])).toBe("");
  });

  test("single literal is not wrapped", () => {
    expect(buildTurlarSqlClause("turi", ["kiwi"])).toBe("turi='kiwi'");
  });

  test("multiple spellings are OR-ed and apostrophes expanded/escaped", () => {
    const sql = buildTurlarSqlClause("turi", ["bugdoy"]);
    expect(sql.startsWith("(") && sql.endsWith(")")).toBe(true);
    expect(sql).toContain("turi='Буғдой'");
    expect(sql).toContain("turi='Bug''doy'");
    expect(sql).toContain("turi='Wheat'");
  });

  test("dedupes literals across values of the same crop", () => {
    const one = buildTurlarSqlClause("turi", ["bugdoy"]);
    const two = buildTurlarSqlClause("turi", ["bugdoy", "Wheat"]);
    expect(two).toBe(one);
  });
});
