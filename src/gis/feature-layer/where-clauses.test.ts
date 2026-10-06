jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { buildCropSelectionWhere, textMatchClause } from "./where-clauses";

const numericRegionLayer = {
  declaredClass: "test.Layer",
  url: "https://example.test/arcgis/rest/services/where_clauses_numeric/MapServer/0",
  fields: [{ name: "region_id", type: "esriFieldTypeInteger" }],
};

describe("textMatchClause", () => {
  test("returns empty when none of the fields exist on the layer", () => {
    expect(textMatchClause(["mavsum"], ["year"], "Bahor")).toBe("");
  });

  test("builds a single equality for a plain text value", () => {
    expect(textMatchClause(["mavsum"], ["mavsum"], "Bahor")).toBe("mavsum='Bahor'");
  });

  test("ORs apostrophe spelling variants", () => {
    const clause = textMatchClause(["full_name"], ["full_name"], "G'ulom");
    expect(clause.startsWith("(")).toBe(true);
    expect(clause).toContain(" OR ");
    expect(clause).toContain("full_name='G''ulom'");
  });

  test("maps a region name to its numeric SOATO on an *_id field", () => {
    expect(
      textMatchClause(
        ["region_id"],
        ["region_id"],
        "Samarqand viloyati",
        numericRegionLayer,
        "region",
      ),
    ).toBe("region_id=1718");
  });
});

describe("buildCropSelectionWhere", () => {
  test("returns empty when neither crop name nor id is given", () => {
    expect(buildCropSelectionWhere("", null, [])).toBe("");
  });

  test("uses a numeric crop_id clause for digit ids", () => {
    expect(buildCropSelectionWhere("", "12", ["crop_id"])).toBe("crop_id=12");
  });

  test("ORs id and name clauses when field metadata is unknown", () => {
    expect(buildCropSelectionWhere("Paxta", "5", [])).toBe(
      "(crop_id=5 OR crop='Paxta')",
    );
  });

  test("skips clauses for fields the layer does not have", () => {
    expect(buildCropSelectionWhere("Paxta", "5", ["year"])).toBe("");
  });
});
