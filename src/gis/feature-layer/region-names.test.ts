import {
  extractYearFromHaystack,
  haystackHasKnownRegionToken,
  haystackMatchesYear,
  looksLikeRegionYearLayerHaystack,
  normalizeRegionToken,
  pickYearRegionLayerPool,
  regionAliasTokens,
  regionDisplayNameToSoato,
  regionFilterValuesEqual,
  regionSoatoToDisplayName,
} from "./region-names";

describe("region token normalization", () => {
  test("normalizeRegionToken drops apostrophes, suffixes and punctuation", () => {
    expect(normalizeRegionToken("Farg‘ona viloyati")).toBe("fargona");
    expect(normalizeRegionToken("Fergana Region")).toBe("fergana");
    expect(normalizeRegionToken("Samarqand viloyat")).toBe("samarqand");
    expect(normalizeRegionToken("")).toBe("");
  });

  test("regionFilterValuesEqual ignores spelling variants", () => {
    expect(regionFilterValuesEqual("Farg'ona viloyati", "Farg’ona")).toBe(true);
    expect(regionFilterValuesEqual("Andijon", "Namangan")).toBe(false);
  });

  test("regionAliasTokens returns the full alias group", () => {
    const tokens = regionAliasTokens("Fergana");
    expect(tokens.has("fargona")).toBe(true);
    expect(tokens.has("ferghana")).toBe(true);
    expect(regionAliasTokens("").size).toBe(0);
    expect(Array.from(regionAliasTokens("Unknownland"))).toEqual(["unknownland"]);
  });
});

describe("SOATO mapping", () => {
  test("regionSoatoToDisplayName resolves agri region codes", () => {
    expect(regionSoatoToDisplayName(" 1730 ")).toBe("Farg'ona viloyati");
    expect(regionSoatoToDisplayName("9999")).toBeNull();
  });

  test("regionDisplayNameToSoato resolves Uzbek and English names", () => {
    expect(regionDisplayNameToSoato("Farg‘ona viloyati")).toBe("1730");
    expect(regionDisplayNameToSoato("Samarkand")).toBe("1718");
    expect(regionDisplayNameToSoato("Bukhara")).toBe("1706");
    expect(regionDisplayNameToSoato("Atlantis")).toBeNull();
    expect(regionDisplayNameToSoato("")).toBeNull();
  });
});

describe("haystack helpers", () => {
  test("extractYearFromHaystack finds the first 19xx/20xx year", () => {
    expect(extractYearFromHaystack("agri andijan 2026 year")).toBe("2026");
    expect(extractYearFromHaystack("no year")).toBeNull();
  });

  test("looksLikeRegionYearLayerHaystack requires a year plus 'year' or 'agri'", () => {
    expect(looksLikeRegionYearLayerHaystack("agri andijan 2026")).toBe(true);
    expect(looksLikeRegionYearLayerHaystack("Water Fergana 2025 year")).toBe(true);
    expect(looksLikeRegionYearLayerHaystack("Water Fergana 2025")).toBe(false);
    expect(looksLikeRegionYearLayerHaystack("agri andijan")).toBe(false);
  });

  test("haystackHasKnownRegionToken detects region aliases", () => {
    expect(haystackHasKnownRegionToken("agri Kashkadarya 2026")).toBe(true);
    expect(haystackHasKnownRegionToken("agri 2026 republic data")).toBe(false);
    expect(haystackHasKnownRegionToken("")).toBe(false);
  });

  test("haystackMatchesYear only accepts 4-digit years", () => {
    expect(haystackMatchesYear("Agri 2025", "2025")).toBe(true);
    expect(haystackMatchesYear("Agri 2025", "2024")).toBe(false);
    expect(haystackMatchesYear("Agri 2025", "25")).toBe(false);
    expect(haystackMatchesYear("Agri 2025")).toBe(false);
  });
});

describe("pickYearRegionLayerPool", () => {
  interface Item {
    name: string;
    score: number;
    regionMatch: boolean;
  }
  const item = (name: string, regionMatch: boolean): Item => ({ name, score: 0, regionMatch });
  const hay = (i: Item): string => i.name;

  test("filters by year then region", () => {
    const scored = [
      item("fergana 2025", true),
      item("andijan 2025", false),
      item("fergana 2024", true),
    ];
    const pool = pickYearRegionLayerPool(scored, 3, { yil: "2025", viloyat: "Farg'ona" }, hay);
    expect(pool.map((p) => p.name)).toEqual(["fergana 2025"]);
  });

  test("returns the year pool when no region wanted", () => {
    const scored = [item("a 2025", false), item("b 2025", false), item("c 2024", false)];
    expect(pickYearRegionLayerPool(scored, 3, { yil: "2025" }, hay)).toHaveLength(2);
  });

  test("falls back to the single region match when no title has the year", () => {
    const scored = [item("fergana", true), item("andijan", false)];
    const pool = pickYearRegionLayerPool(scored, 2, { yil: "2025", viloyat: "Farg'ona" }, hay);
    expect(pool.map((p) => p.name)).toEqual(["fergana"]);
  });

  test("single-layer services are kept even when their title year differs", () => {
    const scored = [item("water 2024", false)];
    const pool = pickYearRegionLayerPool(scored, 1, { yil: "2025", viloyat: "Farg'ona" }, hay);
    expect(pool).toHaveLength(1);
  });

  test("returns empty when several layers exist but none match year or region", () => {
    const scored = [item("a 2024", false), item("b 2023", false)];
    expect(pickYearRegionLayerPool(scored, 2, { yil: "2025" }, hay)).toEqual([]);
  });

  test("region wanted but no year-pool region match: uses global region matches", () => {
    const scored = [item("x 2025", false), item("y 2025", false), item("fergana 2024", true)];
    const pool = pickYearRegionLayerPool(scored, 3, { yil: "2025", viloyat: "Farg'ona" }, hay);
    expect(pool.map((p) => p.name)).toEqual(["fergana 2024"]);
  });

  test("region wanted, nothing matches anywhere: keeps the year pool", () => {
    const scored = [item("x 2025", false), item("y 2025", false)];
    const pool = pickYearRegionLayerPool(scored, 2, { yil: "2025", viloyat: "Farg'ona" }, hay);
    expect(pool).toHaveLength(2);
  });
});
