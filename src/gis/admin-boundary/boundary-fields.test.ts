import {
  buildNumericOrStringEquals,
  equalsAnyEscaped,
  escapeSql,
  expandDistrictNameVariants,
  expandRegionNameVariants,
  fieldValueKind,
  findFieldMeta,
  hostedParentCodFromName,
  pickField,
  pickFields,
} from "./boundary-fields";

const chegara = {
  fields: [
    { name: "OBJECTID", type: "esriFieldTypeOID" },
    { name: "SOATO", type: "esriFieldTypeString" },
    { name: "parent_cod", type: "esriFieldTypeInteger" },
    { name: "tuman_nomi", type: "esriFieldTypeString" },
    { name: "shape_area", type: "esriFieldTypeDouble" },
    { name: "notes", type: "esriFieldTypeBlob" },
  ],
};

describe("hostedParentCodFromName", () => {
  test("resolves a viloyat label to its Hosted parent_cod", () => {
    expect(hostedParentCodFromName("Farg'ona viloyati")).toBe(1730);
    expect(hostedParentCodFromName("Samarqand")).toBe(1718);
  });

  test("resolves English aliases", () => {
    expect(hostedParentCodFromName("Fergana")).toBe(1730);
    expect(hostedParentCodFromName("Bukhara")).toBe(1706);
  });

  test("distinguishes Toshkent city from the viloyat", () => {
    expect(hostedParentCodFromName("Toshkent shahri")).toBe(1726);
    expect(hostedParentCodFromName("Toshkent")).toBe(1727);
  });

  test("returns null for empty or unknown names", () => {
    expect(hostedParentCodFromName("")).toBeNull();
    expect(hostedParentCodFromName("Atlantis")).toBeNull();
  });
});

describe("field picking", () => {
  test("pickField matches case-insensitively and returns the real name", () => {
    expect(pickField(chegara, ["soato"])).toBe("SOATO");
    expect(pickField(chegara, ["missing", "TUMAN_NOMI"])).toBe("tuman_nomi");
    expect(pickField(null, ["soato"])).toBeNull();
  });

  test("pickFields keeps candidate order and drops duplicates", () => {
    expect(pickFields(chegara, ["tuman_nomi", "soato", "SOATO", "x"])).toEqual([
      "tuman_nomi",
      "SOATO",
    ]);
  });

  test("findFieldMeta returns the field definition", () => {
    expect(findFieldMeta(chegara, "PARENT_COD")?.type).toBe("esriFieldTypeInteger");
    expect(findFieldMeta(undefined, "x")).toBeUndefined();
  });

  test("fieldValueKind classifies string / number / unknown", () => {
    expect(fieldValueKind(chegara, "soato")).toBe("string");
    expect(fieldValueKind(chegara, "parent_cod")).toBe("number");
    expect(fieldValueKind(chegara, "shape_area")).toBe("number");
    expect(fieldValueKind(chegara, "notes")).toBe("unknown");
    expect(fieldValueKind(chegara, "missing")).toBe("unknown");
  });
});

describe("SQL helpers", () => {
  test("escapeSql doubles single quotes", () => {
    expect(escapeSql("Farg'ona")).toBe("Farg''ona");
  });

  test("equalsAnyEscaped builds one or OR-ed comparisons", () => {
    expect(equalsAnyEscaped("name", [])).toBe("1=0");
    expect(equalsAnyEscaped("name", [" ", "A"])).toBe("name='A'");
    expect(equalsAnyEscaped("name", ["A", "B'C"])).toBe("(name='A' OR name='B''C')");
  });

  test("buildNumericOrStringEquals covers both column kinds", () => {
    expect(buildNumericOrStringEquals("parent_cod", 1730)).toBe(
      "(parent_cod = 1730 OR parent_cod = '1730')",
    );
  });
});

describe("name variants", () => {
  test("expandRegionNameVariants adds suffix and apostrophe spellings", () => {
    const variants = expandRegionNameVariants("Farg'ona viloyati");
    expect(variants).toEqual(
      expect.arrayContaining([
        "Farg'ona viloyati",
        "Farg'ona",
        "Farg'ona vil.",
        "Fargʻona viloyati",
        "Farg’ona",
      ]),
    );
    expect(expandRegionNameVariants("  ")).toEqual([]);
  });

  test("expandDistrictNameVariants adds tumani and title-case forms", () => {
    const variants = expandDistrictNameVariants(["qamashi tumani", ""]);
    expect(variants).toEqual(
      expect.arrayContaining([
        "qamashi tumani",
        "qamashi",
        "Qamashi",
        "Qamashi tumani",
      ]),
    );
    expect(expandDistrictNameVariants([])).toEqual([]);
  });
});
