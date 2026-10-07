jest.mock("../gis/feature-layer-data", () => ({
  withAgriAccessWhere: (where: string): string => where,
}));

import {
  buildIndicatorStatsWhere,
  buildPieStatsWhere,
  buildRegionAggregatesWhere,
  buildYearLikeClause,
  extractYearDigits,
  joinAndClauses,
} from "./agri-where-builder";

describe("agri-where-builder", () => {
  describe("extractYearDigits", () => {
    test("pulls a 4-digit year out of free text", () => {
      expect(extractYearDigits("Hosil 2025-yil")).toBe("2025");
    });

    test("falls back to all digits only when digitFallback is on", () => {
      expect(extractYearDigits("v12a3")).toBe("123");
      expect(extractYearDigits("v12a3", false)).toBe("");
    });

    test("returns empty for blank input", () => {
      expect(extractYearDigits(null)).toBe("");
      expect(extractYearDigits("   ")).toBe("");
    });
  });

  describe("buildYearLikeClause", () => {
    test("prefix-matches a year on the default field", () => {
      expect(buildYearLikeClause("2025")).toBe("yil LIKE '2025%'");
    });

    test("honours a custom field", () => {
      expect(buildYearLikeClause("2024", { field: "year" })).toBe(
        "year LIKE '2024%'",
      );
    });

    test("uses a contains match when no digits survive", () => {
      expect(buildYearLikeClause("abc", { digitFallback: false })).toBe(
        "yil LIKE '%abc%'",
      );
    });

    test("escapes quotes and strips LIKE wildcards in the fallback", () => {
      expect(buildYearLikeClause("a'%_b", { digitFallback: false })).toBe(
        "yil LIKE '%a''b%'",
      );
    });

    test("returns 1=0 when the fallback sanitises to nothing", () => {
      expect(buildYearLikeClause("%%", { digitFallback: false })).toBe("1=0");
    });

    test("returns empty for blank input", () => {
      expect(buildYearLikeClause("")).toBe("");
    });
  });

  describe("joinAndClauses", () => {
    test("joins non-empty fragments with AND", () => {
      expect(joinAndClauses(["a=1", "", null, " b=2 "])).toBe("a=1 AND b=2");
    });

    test("returns the fallback when nothing is left", () => {
      expect(joinAndClauses([undefined, ""])).toBe("1=1");
      expect(joinAndClauses([], "1=0")).toBe("1=0");
    });
  });

  describe("buildRegionAggregatesWhere", () => {
    test("is 1=0 without a year", () => {
      expect(buildRegionAggregatesWhere({ yil: "", view: "viloyat" })).toBe(
        "1=0",
      );
    });

    test("republic view filters by year only and ignores crops", () => {
      expect(
        buildRegionAggregatesWhere({
          yil: "2025",
          view: "viloyat",
          viloyat: "Andijon",
          turi: "Bug'doy",
        }),
      ).toBe("yil LIKE '2025%'");
    });

    test("drilled tuman view adds the viloyat", () => {
      expect(
        buildRegionAggregatesWhere({
          yil: "2025",
          view: "tuman",
          viloyat: "Andijon",
        }),
      ).toBe("yil LIKE '2025%' AND viloyat='Andijon'");
    });

    test("a locked viloyat wins over the selected one", () => {
      expect(
        buildRegionAggregatesWhere({
          yil: "2025",
          view: "viloyat",
          viloyat: "Andijon",
          lockedViloyat: "Buxoro",
        }),
      ).toBe("yil LIKE '2025%' AND viloyat='Buxoro'");
    });
  });

  describe("buildPieStatsWhere", () => {
    test("uses the numeric district code when given", () => {
      expect(
        buildPieStatsWhere(
          { yil: "2025", viloyat: "Andijon", tuman: "Asaka", districtCode: 1703 },
          { includeCategory: false },
        ),
      ).toBe("viloyat='Andijon' AND district = '1703' AND yil LIKE '2025%'");
    });

    test("a numeric tuman becomes a district code", () => {
      expect(
        buildPieStatsWhere({ yil: "", viloyat: "Andijon", tuman: "1703" }),
      ).toBe("viloyat='Andijon' AND district = '1703'");
    });

    test("tuman is dropped when viloyat is excluded", () => {
      expect(
        buildPieStatsWhere(
          { yil: "2025", viloyat: "Andijon", tuman: "Asaka" },
          { includeViloyat: false },
        ),
      ).toBe("yil LIKE '2025%'");
    });

    test("escapes the farmer INN", () => {
      expect(
        buildPieStatsWhere({ yil: "", farmerInn: "12' OR '1'='1" }),
      ).toBe("UPPER(f_inn)=UPPER('12'' OR ''1''=''1')");
    });

    test("empty input yields 1=1", () => {
      expect(buildPieStatsWhere({ yil: "" })).toBe("1=1");
    });
  });

  describe("buildIndicatorStatsWhere", () => {
    test("combines year, geography and the zero filter", () => {
      expect(
        buildIndicatorStatsWhere(
          { yil: "2025", viloyat: "Andijon" },
          { excludeZeroField: "maydon", yearField: "yil" },
        ),
      ).toBe("yil LIKE '2025%' AND viloyat='Andijon' AND (maydon > 0)");
    });

    test("omits viloyat when includeViloyat is false", () => {
      expect(
        buildIndicatorStatsWhere(
          { yil: "2025", viloyat: "Andijon" },
          { includeViloyat: false },
        ),
      ).toBe("yil LIKE '2025%'");
    });

    test("adds a tuman clause when a tuman is selected", () => {
      expect(
        buildIndicatorStatsWhere({ yil: "", tuman: "1703" }),
      ).toBe("district = '1703'");
    });
  });
});
