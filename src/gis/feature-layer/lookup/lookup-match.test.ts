jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import {
  addTextEqTerms,
  getRegionMatchTokens,
  literalVariantsForMatch,
  matchRegionValuesFromIndex,
} from "./lookup-match";
import { canonicalizeRegionFilterValue, normalizeRegionDisplayValue } from "./lookup-region";
import { getQueryUrl, valueIndexCache } from "../primitives";
import { fields, makeLayer, uniqueLayerUrl } from "../__test-utils__/fake-layer";

describe("lookup-region", () => {
  test("normalizeRegionDisplayValue maps SOATO codes to names and keeps other text", () => {
    expect(normalizeRegionDisplayValue("1703")).toBe("Andijon viloyati");
    expect(normalizeRegionDisplayValue("9999")).toBe("9999");
    expect(normalizeRegionDisplayValue(" Andijon ")).toBe("Andijon");
    expect(normalizeRegionDisplayValue("")).toBe("");
    expect(canonicalizeRegionFilterValue("1718")).toBe("Samarqand viloyati");
  });
});

describe("getRegionMatchTokens", () => {
  test("returns the alias group for a known region (including SOATO input)", () => {
    expect(getRegionMatchTokens("1730")).toEqual(
      expect.arrayContaining(["fargona", "fergana", "ferghana"]),
    );
    expect(getRegionMatchTokens("Samarqand viloyati")).toContain("samarkand");
  });

  test("returns the normalized token itself for unknown regions, [] for empty", () => {
    expect(getRegionMatchTokens("Atlantis")).toEqual(["atlantis"]);
    expect(getRegionMatchTokens("")).toEqual([]);
  });
});

describe("literalVariantsForMatch", () => {
  test("region kind canonicalizes SOATO and adds viloyati variants", () => {
    expect(literalVariantsForMatch("1703", "region")).toEqual(["Andijon", "Andijon viloyati"]);
  });

  test("district kind expands district suffixes", () => {
    expect(literalVariantsForMatch("Rishton", "district")).toContain("Rishton tumani");
  });

  test("default kind only expands apostrophes", () => {
    expect(literalVariantsForMatch("Bahor", "default")).toEqual(["Bahor"]);
  });
});

describe("addTextEqTerms", () => {
  const collect = (
    field: string,
    literals: string[],
    layer: Parameters<typeof addTextEqTerms>[2],
    value: string,
  ): string[] => {
    const out: string[] = [];
    addTextEqTerms(field, literals, layer, value, (t) => out.push(t));
    return out;
  };

  test("emits quoted literals when there is no index", () => {
    expect(collect("tuman", ["A'b", "C"], null, "A'b")).toEqual(["tuman='A''b'", "tuman='C'"]);
  });

  test("numeric fields only receive fully numeric values", () => {
    const layer = makeLayer({ fields: fields(["region_id", "esriFieldTypeInteger"]) });
    expect(collect("region_id", ["1730", "Farg'ona", "17a"], layer, "x")).toEqual([
      "region_id=1730",
    ]);
  });

  test("index matches replace literals; empty index match falls back to literals", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("addterms") });
    valueIndexCache.set(getQueryUrl(layer), { tuman: ["Rishton tumani"] });
    expect(collect("tuman", ["Rishton"], layer, "Rishton")).toEqual(["tuman='Rishton tumani'"]);
    expect(collect("tuman", ["Zzz"], layer, "Zzz")).toEqual(["tuman='Zzz'"]);
  });
});

describe("matchRegionValuesFromIndex", () => {
  test("null without layer or index; [] for empty index", () => {
    expect(matchRegionValuesFromIndex(null, "viloyat", "Andijon")).toBeNull();
    const layer = makeLayer({ url: uniqueLayerUrl("regidx") });
    expect(matchRegionValuesFromIndex(layer, "viloyat", "Andijon")).toBeNull();
    valueIndexCache.set(getQueryUrl(layer), { viloyat: [] });
    expect(matchRegionValuesFromIndex(layer, "viloyat", "Andijon")).toEqual([]);
  });

  test("matches by name variants and by SOATO code", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("regidx") });
    valueIndexCache.set(getQueryUrl(layer), {
      viloyat: ["Andijon viloyati", "Namangan viloyati"],
      region_id: ["1703", "1714"],
    });
    expect(matchRegionValuesFromIndex(layer, "viloyat", "Andijon")).toEqual(["Andijon viloyati"]);
    expect(matchRegionValuesFromIndex(layer, "region_id", "Andijon viloyati", "1703")).toEqual([
      "1703",
    ]);
  });

  test("returns [] when nothing in the index resembles the region", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("regidx") });
    valueIndexCache.set(getQueryUrl(layer), { viloyat: ["Namangan viloyati"] });
    expect(matchRegionValuesFromIndex(layer, "viloyat", "Xorazm")).toEqual([]);
  });
});
