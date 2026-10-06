jest.mock("../feature-layer-data", () => ({
  canonicalizeRegionFilterValue: (value: string): string => value,
}));

import {
  buildDistrictWhereAttempts,
  buildRegionScopeClause,
  buildSingleDistrictAttempts,
  featureBelongsToViloyat,
  filterDistrictFeaturesToViloyat,
  maxDistrictsForViloyat,
  resolveDistrictCode,
  resolveDistrictWhere,
  resolveRegionParentCod,
  resolveRegionWhere,
  soatoRangeForPrefix,
} from "./boundary-where";

const textSoatoLayer = {
  fields: [
    { name: "soato", type: "esriFieldTypeString" },
    { name: "viloyat_no", type: "esriFieldTypeString" },
    { name: "tuman_nomi", type: "esriFieldTypeString" },
  ],
};
const numericSoatoLayer = {
  fields: [
    { name: "district", type: "esriFieldTypeInteger" },
    { name: "parent_cod", type: "esriFieldTypeInteger" },
  ],
};

describe("selection resolution", () => {
  test("resolveRegionParentCod prefers a 4-digit regionCode", () => {
    expect(resolveRegionParentCod({ regionCode: "1730", viloyat: "Samarqand" })).toBe(
      1730,
    );
  });

  test("resolveRegionParentCod falls back to numeric viloyat, then name", () => {
    expect(resolveRegionParentCod({ viloyat: "1718" })).toBe(1718);
    expect(resolveRegionParentCod({ viloyat: "Fergana" })).toBe(1730);
    expect(resolveRegionParentCod({})).toBeNull();
  });

  test("resolveDistrictCode reads districtCode then a numeric tuman", () => {
    expect(resolveDistrictCode({ districtCode: 1730401 })).toBe("1730401");
    expect(resolveDistrictCode({ tuman: " 1730402 " })).toBe("1730402");
    expect(resolveDistrictCode({ tuman: "Qamashi" })).toBeNull();
  });
});

describe("WHERE builders", () => {
  test("soatoRangeForPrefix spans the region's district codes", () => {
    expect(soatoRangeForPrefix("1730")).toEqual({ lo: 1730000, hi: 1731000 });
  });

  test("resolveRegionWhere uses the layer parent field or 1=0", () => {
    expect(resolveRegionWhere(numericSoatoLayer, 1730)).toBe(
      "(parent_cod = 1730 OR parent_cod = '1730')",
    );
    expect(resolveRegionWhere(null, 1730)).toBe(
      "(parent_cod = 1730 OR parent_cod = '1730')",
    );
    expect(resolveRegionWhere(numericSoatoLayer, null)).toBe("1=0");
  });

  test("buildDistrictWhereAttempts orders soato, region link, then names", () => {
    const attempts = buildDistrictWhereAttempts(textSoatoLayer, {
      parentCod: 1730,
      viloyat: "Farg'ona",
      districtNames: ["Oltiariq"],
      districtCodes: ["1730401", "x"],
    });
    expect(attempts.map((a) => a.mode)).toEqual([
      "soato-prefix:soato",
      "code-list-text:soato",
      "region-text:viloyat_no",
      "region-name:viloyat_no",
      "name-list:tuman_nomi",
    ]);
    expect(attempts[0].where).toBe("soato LIKE '1730%'");
    expect(attempts[1].where).toBe("soato IN ('1730401')");
  });

  test("buildDistrictWhereAttempts uses numeric forms on numeric fields", () => {
    const attempts = buildDistrictWhereAttempts(numericSoatoLayer, {
      parentCod: 1730,
      viloyat: "",
      districtNames: [],
      districtCodes: [1730401],
    });
    expect(attempts.map((a) => a.where)).toEqual([
      "(district >= 1730000 AND district < 1731000)",
      "district IN (1730401)",
      "parent_cod = 1730",
    ]);
  });

  test("buildRegionScopeClause picks the soato field, else region name", () => {
    expect(buildRegionScopeClause(numericSoatoLayer, 1730, "")).toBe(
      "(district >= 1730000 AND district < 1731000)",
    );
    expect(buildRegionScopeClause(textSoatoLayer, 1730, "")).toBe(
      "soato LIKE '1730%'",
    );
    expect(buildRegionScopeClause(textSoatoLayer, null, "Sirdaryo")).toContain(
      "viloyat_no='Sirdaryo'",
    );
    expect(buildRegionScopeClause({ fields: [] }, null, "")).toBeNull();
  });

  test("buildSingleDistrictAttempts scopes name matches to the viloyat", () => {
    const attempts = buildSingleDistrictAttempts(textSoatoLayer, {
      tuman: "Qamashi",
      districtCode: "1710212",
      parentCod: 1710,
      viloyat: "Qashqadaryo",
    });
    expect(attempts[0]).toEqual({
      where: "soato = '1710212'",
      mode: "district-code-text:soato",
      field: "soato",
    });
    expect(attempts[1].mode).toBe("district-name:tuman_nomi");
    expect(attempts[1].where).toMatch(/\) AND soato LIKE '1710%'$/);
  });

  test("resolveDistrictWhere prefers name fields, else the code", () => {
    expect(resolveDistrictWhere(textSoatoLayer, null, "Qamashi tumani")).toBe(
      "(tuman_nomi='Qamashi tumani' OR tuman_nomi='Qamashi')",
    );
    expect(resolveDistrictWhere(numericSoatoLayer, "1710212", "Qamashi")).toBe(
      "district = '1710212'",
    );
    expect(resolveDistrictWhere({ fields: [] }, null, "Qamashi")).toBe(
      "(district='Qamashi' OR district='Qamashi tumani')",
    );
    expect(resolveDistrictWhere(numericSoatoLayer, null, null)).toBe("1=0");
  });
});

describe("client-side viloyat guard", () => {
  const filter = {
    parentCod: 1730,
    viloyat: "Farg'ona",
    districtNames: ["Oltiariq"],
    districtCodes: [1730401],
  };

  test("featureBelongsToViloyat matches code, prefix, parent and names", () => {
    expect(featureBelongsToViloyat({ SOATO: "1730401" }, filter)).toBe(true);
    expect(featureBelongsToViloyat({ soato: "1730999" }, filter)).toBe(true);
    expect(featureBelongsToViloyat({ parent_cod: 1730 }, filter)).toBe(true);
    expect(featureBelongsToViloyat({ viloyat_no: "Farg'ona" }, filter)).toBe(true);
    expect(featureBelongsToViloyat({ tuman_nomi: "Oltiariq tumani" }, filter)).toBe(
      true,
    );
    expect(featureBelongsToViloyat({ soato: "1710212" }, filter)).toBe(false);
    expect(featureBelongsToViloyat(null, filter)).toBe(false);
  });

  test("filterDistrictFeaturesToViloyat drops neighbours", () => {
    const features = [
      { attributes: { soato: "1730401" } },
      { attributes: { soato: "1710212" } },
    ];
    expect(filterDistrictFeaturesToViloyat(features, filter)).toEqual([
      features[0],
    ]);
    expect(filterDistrictFeaturesToViloyat([], filter)).toEqual([]);
  });

  test("filterDistrictFeaturesToViloyat keeps all when nothing to match on", () => {
    const features = [{ attributes: { foo: "bar" } }];
    const open = { parentCod: null, viloyat: "", districtNames: [], districtCodes: [] };
    expect(filterDistrictFeaturesToViloyat(features, open)).toBe(features);
  });

  test("maxDistrictsForViloyat allows headroom", () => {
    expect(maxDistrictsForViloyat([])).toBe(30);
    expect(maxDistrictsForViloyat([1, 2, 3])).toBe(15);
    expect(maxDistrictsForViloyat(new Array(55).fill(1))).toBe(60);
  });
});
