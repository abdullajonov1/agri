jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { buildFarmerTaxWhere, buildLandTypeWhere } from "./lookup-where";
import { getQueryUrl, valueIndexCache } from "../primitives";
import { fields, makeLayer, uniqueLayerUrl } from "../__test-utils__/fake-layer";

const stringTaxLayer = makeLayer({ fields: fields(["tax_number", "esriFieldTypeString"]) });
const numericTaxLayer = makeLayer({ fields: fields(["TAX_NUMBER", "esriFieldTypeDouble"]) });

describe("buildFarmerTaxWhere", () => {
  test("returns empty for input without digits", () => {
    expect(buildFarmerTaxWhere("abc", ["tax_number"])).toBe("");
  });

  test("returns 1=0 when the layer has fields but no tax_number", () => {
    expect(buildFarmerTaxWhere("123", ["full_name"])).toBe("1=0");
  });

  test("full 9-digit STIR on a string field is an exact quoted match", () => {
    expect(buildFarmerTaxWhere("123456789", ["tax_number"], stringTaxLayer)).toBe(
      "tax_number='123456789'",
    );
  });

  test("full STIR on a numeric field is an unquoted match using the real field name", () => {
    expect(buildFarmerTaxWhere("123 456 789", ["TAX_NUMBER"], numericTaxLayer)).toBe(
      "TAX_NUMBER=123456789",
    );
  });

  test("full STIR with unknown field kind ORs quoted and numeric forms", () => {
    expect(buildFarmerTaxWhere("123456789", [])).toBe(
      "(tax_number='123456789' OR tax_number=123456789)",
    );
  });

  test("partial STIR on a string field uses LIKE prefix", () => {
    expect(buildFarmerTaxWhere("1234", ["tax_number"], stringTaxLayer)).toBe(
      "tax_number LIKE '1234%'",
    );
  });

  test("partial STIR on a numeric field uses a numeric range", () => {
    expect(buildFarmerTaxWhere("1234", ["TAX_NUMBER"], numericTaxLayer)).toBe(
      "(TAX_NUMBER>=123400000 AND TAX_NUMBER<123500000)",
    );
  });

  test("partial STIR with unknown kind ORs range and LIKE prefix", () => {
    expect(buildFarmerTaxWhere("12", ["tax_number"])).toBe(
      "((tax_number>=120000000 AND tax_number<130000000) OR tax_number LIKE '12%')",
    );
  });
});

describe("buildLandTypeWhere", () => {
  test("returns empty for Barchasi / unknown values", () => {
    expect(buildLandTypeWhere("Barchasi", "", ["type_id"])).toBe("");
    expect(buildLandTypeWhere(null, undefined, ["type_id"])).toBe("");
  });

  test("uses quoted type_id when field kind is unknown", () => {
    expect(buildLandTypeWhere("Lalmi", null, ["type_id"])).toBe("type_id='2'");
  });

  test("uses numeric type_id when the layer says so; id wins over label", () => {
    const layer = makeLayer({ fields: fields(["type_id", "esriFieldTypeInteger"]) });
    expect(buildLandTypeWhere("Lalmi", "1", ["type_id"], layer)).toBe("type_id=1");
  });

  test("falls back to type_id when field list is unknown", () => {
    expect(buildLandTypeWhere("sugoriladigan", null, [])).toBe("type_id='1'");
  });

  test("adds label variants on type / yer_turi text fields", () => {
    const where = buildLandTypeWhere("Lalmi", null, ["type", "yer_turi"]);
    expect(where).toBe("(type='Lalmi' OR yer_turi='Lalmi')");
  });

  test("irrigated labels include apostrophe spellings", () => {
    const where = buildLandTypeWhere("Sug'oriladigan", null, ["type"]);
    expect(where).toContain("type='Sug''oriladigan'");
    expect(where).toContain("type='Sug’orilgan'");
    expect(where).toContain("type='Sugoriladigan'");
  });

  test("returns empty when no land-type field exists", () => {
    expect(buildLandTypeWhere("Lalmi", null, ["other"])).toBe("");
  });

  test("uses indexed type_id values when the index is loaded", () => {
    const layer = makeLayer({
      url: uniqueLayerUrl("landtype"),
      fields: fields(["type_id", "esriFieldTypeString"]),
    });
    valueIndexCache.set(getQueryUrl(layer), { type_id: ["1", "2"] });
    expect(buildLandTypeWhere("Lalmi", null, ["type_id"], layer)).toBe("type_id='2'");
  });
});
