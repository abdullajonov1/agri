import {
  APOSTROPHE_VARIANTS,
  buildTumanEqualsSql,
  eqAposSmart,
  escapeAgriValue,
  escapeArcGIS,
  escapeLikePattern,
  normalizeApos,
  sanitizeLikeInput,
} from "./agri-sql";

/** True when every single quote in `sql` is balanced (literals closed). */
const quotesBalanced = (sql: string): boolean =>
  (sql.replace(/''/g, "").match(/'/g) || []).length % 2 === 0;

describe("agri-sql injection hardening", () => {
  test("escapeArcGIS neutralises a classic OR-1=1 payload", () => {
    const payload = "x' OR '1'='1";
    const sql = `viloyat = '${escapeArcGIS(payload)}'`;
    expect(sql).toBe("viloyat = 'x'' OR ''1''=''1'");
    expect(quotesBalanced(sql)).toBe(true);
  });

  test("escapeArcGIS handles null, undefined and numbers", () => {
    expect(escapeArcGIS(null)).toBe("");
    expect(escapeArcGIS(undefined)).toBe("");
    expect(escapeArcGIS(42)).toBe("42");
  });

  test("escapeAgriValue is an alias of escapeArcGIS", () => {
    expect(escapeAgriValue("a'b")).toBe(escapeArcGIS("a'b"));
  });

  test("sanitizeLikeInput strips %, _ and backslash", () => {
    expect(sanitizeLikeInput("50%_\\x")).toBe("50x");
    expect(escapeLikePattern("a%b")).toBe("ab");
    expect(sanitizeLikeInput(null)).toBe("");
  });

  test("normalizeApos folds apostrophe glyphs to ASCII", () => {
    expect(normalizeApos("Farg‘ona")).toBe("Farg'ona");
    expect(normalizeApos("Fargʻona")).toBe("Farg'ona");
    expect(normalizeApos("Farg`ona")).toBe("Farg'ona");
  });

  test("eqAposSmart returns a plain equality when there is no apostrophe", () => {
    expect(eqAposSmart("viloyat", "Andijon")).toBe("viloyat='Andijon'");
  });

  test("eqAposSmart returns empty for blank input", () => {
    expect(eqAposSmart("viloyat", "   ")).toBe("");
    expect(eqAposSmart("viloyat", null)).toBe("");
  });

  test("eqAposSmart ORs one equality per apostrophe variant", () => {
    const sql = eqAposSmart("viloyat", "Farg'ona");
    expect(sql.startsWith("(")).toBe(true);
    expect(sql.split(" OR ")).toHaveLength(APOSTROPHE_VARIANTS.length);
    expect(sql).toContain("viloyat='Farg''ona'");
    expect(quotesBalanced(sql)).toBe(true);
  });

  test("eqAposSmart keeps an injection payload inside literals", () => {
    const sql = eqAposSmart("viloyat", "x' OR '1'='1");
    expect(quotesBalanced(sql)).toBe(true);
    // Every OR-part must be a single field='…' literal comparison.
    const parts = sql.replace(/^\(|\)$/g, "").split(/ OR (?=viloyat=)/);
    parts.forEach((part) => {
      expect(part).toMatch(/^viloyat='(?:[^']|'')*'$/);
    });
  });

  test("buildTumanEqualsSql uses the numeric district code for digits", () => {
    expect(buildTumanEqualsSql("tuman", "1703")).toBe("district = '1703'");
  });

  test("buildTumanEqualsSql adds the bare and 'tumani' spellings", () => {
    const sql = buildTumanEqualsSql("tuman", "Qamashi tumani");
    expect(sql).toContain("tuman='Qamashi tumani'");
    expect(sql).toContain("tuman='Qamashi'");
  });

  test("buildTumanEqualsSql returns empty for blank input", () => {
    expect(buildTumanEqualsSql("tuman", "")).toBe("");
  });
});
