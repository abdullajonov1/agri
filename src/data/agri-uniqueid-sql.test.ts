import {
  buildGidvSmartWhere,
  buildUniqueidPlainOrBracedWhere,
  buildUniqueidUpperEqualsWhere,
  normalizeUniqueidKey,
  recordMatchesUniqueidKey,
  stripUniqueidBraces,
} from "./agri-uniqueid-sql";

const GUID = "1A2B3C4D-1111-2222-3333-444455556666";

describe("uniqueid key helpers", () => {
  test("normalizeUniqueidKey strips braces, trims and lowercases", () => {
    expect(normalizeUniqueidKey(` {${GUID}} `)).toBe(GUID.toLowerCase());
    expect(normalizeUniqueidKey(null)).toBe("");
    expect(normalizeUniqueidKey(undefined)).toBe("");
  });

  test("stripUniqueidBraces preserves case", () => {
    expect(stripUniqueidBraces(`{${GUID}}`)).toBe(GUID);
    expect(stripUniqueidBraces(null)).toBe("");
  });

  test("recordMatchesUniqueidKey compares case/brace-insensitively", () => {
    expect(recordMatchesUniqueidKey(`{${GUID}}`, GUID.toLowerCase())).toBe(true);
    expect(recordMatchesUniqueidKey("abc", "abd")).toBe(false);
  });

  test("recordMatchesUniqueidKey is false for empty target or record", () => {
    expect(recordMatchesUniqueidKey("", "")).toBe(false);
    expect(recordMatchesUniqueidKey(null, "x")).toBe(false);
    expect(recordMatchesUniqueidKey("x", "{}")).toBe(false);
  });
});

describe("buildUniqueidUpperEqualsWhere", () => {
  test("empty term matches nothing", () => {
    expect(buildUniqueidUpperEqualsWhere("  ")).toBe("1=0");
    expect(buildUniqueidUpperEqualsWhere(undefined as unknown as string)).toBe("1=0");
  });

  test("ORs raw, braced and bare variants (deduplicated)", () => {
    expect(buildUniqueidUpperEqualsWhere("abc")).toBe(
      "(UPPER(uniqueid)=UPPER('abc') OR UPPER(uniqueid)=UPPER('{abc}'))",
    );
    expect(buildUniqueidUpperEqualsWhere("{abc}", "gid")).toBe(
      "(UPPER(gid)=UPPER('{abc}') OR UPPER(gid)=UPPER('abc'))",
    );
  });

  test("escapes single quotes", () => {
    expect(buildUniqueidUpperEqualsWhere("a'b")).toContain("UPPER('a''b')");
  });
});

describe("buildUniqueidPlainOrBracedWhere", () => {
  test("empty yields 1=0", () => {
    expect(buildUniqueidPlainOrBracedWhere("{}")).toBe("1=0");
  });

  test("normalizes and matches plain or braced", () => {
    const id = GUID.toLowerCase();
    expect(buildUniqueidPlainOrBracedWhere(`{${GUID}}`)).toBe(
      `(uniqueid = '${id}' OR uniqueid = '{${id}}')`,
    );
  });

  test("escapes injection attempts", () => {
    expect(buildUniqueidPlainOrBracedWhere("x' OR '1'='1")).toBe(
      "(uniqueid = 'x'' or ''1''=''1' OR uniqueid = '{x'' or ''1''=''1}')",
    );
  });
});

describe("buildGidvSmartWhere", () => {
  test("empty yields 1=0", () => {
    expect(buildGidvSmartWhere("")).toBe("1=0");
  });

  test("short term: exact match only", () => {
    expect(buildGidvSmartWhere("abc")).toBe("(UPPER(gidv)=UPPER('abc'))");
  });

  test("8+ char core adds LIKE with metacharacters stripped", () => {
    expect(buildGidvSmartWhere("abcd_123%x")).toContain(
      "UPPER(gidv) LIKE UPPER('%abcd123x%')",
    );
  });

  test("GUID adds braced and all region prefixes", () => {
    const where = buildGidvSmartWhere(GUID);
    expect(where).toContain(`UPPER(gidv)=UPPER('{${GUID}}')`);
    for (const p of ["SU", "NV", "FR", "BH", "GZ", "TV", "HR"]) {
      expect(where).toContain(`UPPER(gidv)=UPPER('${p}{${GUID}}')`);
    }
    expect(where.startsWith("(") && where.endsWith(")")).toBe(true);
  });

  test("prefixed term SU{...} also tries the bare braced core", () => {
    const where = buildGidvSmartWhere("SU{abc}", "g");
    expect(where).toContain("UPPER(g)=UPPER('SU{abc}')");
    expect(where).toContain("UPPER(g)=UPPER('{abc}')");
  });
});
