import {
  buildDistrictLookupKeys,
  buildVhUniqueIdCacheKey,
  hasDistrictMappingForSelection,
  listDistrictsForViloyat,
  resolveDistrictNumberFromMaps,
  resolveRegionNumberFromMaps,
  storeScopedRegionDistrictMapping,
  type GeoCodeHelpers,
} from "./resolve-geo-codes";
import { makeRegionDistrictKey, normalizeLocalizationApos } from "./geo-keys";

const helpers: GeoCodeHelpers = {
  normalizeApos: normalizeLocalizationApos,
  makeRegionDistrictKey,
};

describe("resolveRegionNumberFromMaps", () => {
  test("blank, numeric, mapped, unmapped", () => {
    expect(resolveRegionNumberFromMaps("", {}, helpers)).toBeUndefined();
    expect(resolveRegionNumberFromMaps("08", {}, helpers)).toBe(8);
    expect(resolveRegionNumberFromMaps("Buxoro", { buxoro: 3 }, helpers)).toBe(3);
    expect(resolveRegionNumberFromMaps("Xiva", { buxoro: 3 }, helpers)).toBeUndefined();
  });
});

describe("buildDistrictLookupKeys", () => {
  test("empty tuman yields no keys", () => {
    expect(buildDistrictLookupKeys("Buxoro", "", {}, helpers)).toEqual([]);
    expect(
      buildDistrictLookupKeys("Buxoro", "x", {}, { ...helpers, makeRegionDistrictKey: () => "" }),
    ).toEqual([]);
  });

  test("scoped keys then bare key", () => {
    expect(buildDistrictLookupKeys("Buxoro", "Olot", { buxoro: 3 }, helpers)).toEqual([
      "region:3|olot",
      "viloyat:buxoro|olot",
      "olot",
    ]);
    expect(buildDistrictLookupKeys("", "Olot", {}, helpers)).toEqual(["olot"]);
  });
});

describe("storeScopedRegionDistrictMapping", () => {
  test("stores region and scoped district keys", () => {
    const v2r: Record<string, number> = {};
    const t2d: Record<string, number> = {};
    storeScopedRegionDistrictMapping("Buxoro", "3", "Olot", 301, v2r, t2d, helpers);
    expect(v2r).toEqual({ buxoro: 3 });
    expect(t2d).toEqual({ "region:3|olot": 301, "viloyat:buxoro|olot": 301 });
  });

  test("skips district when tuman or district missing", () => {
    const v2r: Record<string, number> = {};
    const t2d: Record<string, number> = {};
    storeScopedRegionDistrictMapping("", "", "Olot", "", v2r, t2d, helpers);
    storeScopedRegionDistrictMapping(null, null, null, 5, v2r, t2d, helpers);
    expect(v2r).toEqual({});
    expect(t2d).toEqual({});
  });

  test("higher vote wins conflicts; without vote tracking later writes win", () => {
    const v2r: Record<string, number> = {};
    const t2d: Record<string, number> = {};
    const votes: Record<string, number> = {};
    storeScopedRegionDistrictMapping("Q", 14, "Qamashi", 100, v2r, t2d, helpers, {
      count: 50,
      tumanToDistrictVotes: votes,
    });
    storeScopedRegionDistrictMapping("Q", 14, "Qamashi", 999, v2r, t2d, helpers, {
      count: 2,
      tumanToDistrictVotes: votes,
    });
    expect(t2d["region:14|qamashi"]).toBe(100);
    storeScopedRegionDistrictMapping("Q", 14, "Qamashi", 200, v2r, t2d, helpers, {
      count: 80,
      tumanToDistrictVotes: votes,
    });
    expect(t2d["region:14|qamashi"]).toBe(200);
    expect(votes["region:14|qamashi"]).toBe(80);

    const plain: Record<string, number> = {};
    storeScopedRegionDistrictMapping("", 1, "A", 10, v2r, plain, helpers);
    storeScopedRegionDistrictMapping("", 1, "A", 20, v2r, plain, helpers, { count: -1 });
    expect(plain["region:1|a"]).toBe(20);
  });
});

describe("resolveDistrictNumberFromMaps", () => {
  const t2d = { "region:3|olot": 301, "viloyat:navoiy|karmana": 77, olot: 999 };

  test("blank and numeric", () => {
    expect(resolveDistrictNumberFromMaps("", t2d, helpers)).toBeUndefined();
    expect(resolveDistrictNumberFromMaps("12", t2d, helpers)).toBe(12);
  });

  test("scoped lookup order", () => {
    expect(
      resolveDistrictNumberFromMaps("Olot", t2d, helpers, {
        rawViloyat: "Buxoro",
        viloyatToRegion: { buxoro: 3 },
      }),
    ).toBe(301);
    expect(resolveDistrictNumberFromMaps("Karmana", t2d, helpers, { rawViloyat: "Navoiy" })).toBe(77);
    expect(resolveDistrictNumberFromMaps("Olot", t2d, helpers)).toBe(999);
    expect(resolveDistrictNumberFromMaps("Nowhere", t2d, helpers)).toBeUndefined();
  });

  test("hasDistrictMappingForSelection", () => {
    expect(hasDistrictMappingForSelection("Buxoro", "Olot", t2d, { buxoro: 3 }, helpers)).toBe(true);
    expect(hasDistrictMappingForSelection("Buxoro", "Zzz", t2d, { buxoro: 3 }, helpers)).toBe(false);
  });
});

describe("listDistrictsForViloyat", () => {
  test("collects names and codes under region and viloyat prefixes", () => {
    const t2d = {
      "region:3|olot": 301,
      "viloyat:buxoro|olot": 301,
      "viloyat:buxoro|jondor": 302,
      "region:4|karmana": 401,
      bare: 1,
    };
    const out = listDistrictsForViloyat("Buxoro", t2d, { buxoro: 3 }, helpers);
    expect(out.names.sort()).toEqual(["jondor", "olot"]);
    expect(out.codes.sort()).toEqual([301, 302]);
  });

  test("no prefixes yields empty", () => {
    expect(listDistrictsForViloyat("", { a: 1 }, {}, helpers)).toEqual({ names: [], codes: [] });
  });
});

describe("buildVhUniqueIdCacheKey", () => {
  test("joins parts with sorted crop ids", () => {
    expect(
      buildVhUniqueIdCacheKey({
        status: "yaxshi",
        ndviDate: "2025-09-01",
        regionNum: 3,
        cropIds: ["b", "a"],
      }),
    ).toBe("yaxshi|2025-09-01|3||a,b");
    expect(
      buildVhUniqueIdCacheKey({
        status: "past",
        ndviDate: "d",
        regionNum: 3,
        districtNum: 301,
        cropIds: [],
      }),
    ).toBe("past|d|3|301|");
  });
});
