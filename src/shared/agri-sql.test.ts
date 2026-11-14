import {
  dateEqualsClause,
  escapeArcGIS,
  escapeLikeLiteral,
  isExactArcGisYmd,
  normalizeApos,
  normalizeAposKey,
} from "./agri-sql";

describe("agri-sql", () => {
  test("dateEqualsClause rejects SQL in the date", () => {
    expect(dateEqualsClause("raster_date", "2024-01-01' OR '1'='1")).toBe(
      "1=0",
    );
  });

  test("dateEqualsClause rejects a bad field name", () => {
    expect(dateEqualsClause("raster_date;drop", "2024-01-01")).toBe("1=0");
  });

  test("dateEqualsClause builds a half-open day range", () => {
    expect(dateEqualsClause("raster_date", "2024-01-01")).toBe(
      "raster_date >= DATE '2024-01-01' AND raster_date < DATE '2024-01-02'",
    );
  });

  test("escapeArcGIS doubles quotes", () => {
    expect(escapeArcGIS("a'b")).toBe("a''b");
  });

  test("escapeLikeLiteral strips LIKE metacharacters", () => {
    expect(escapeLikeLiteral("%")).toBe("");
    expect(escapeLikeLiteral("_")).toBe("");
    expect(escapeLikeLiteral("a'b")).toBe("a''b");
  });

  test("normalizeApos does not trim; normalizeAposKey does", () => {
    expect(normalizeApos("  trim  ")).toBe("  trim  ");
    expect(normalizeAposKey("  Farg\u02BBona  ")).toBe("Farg'ona");
  });

  test("isExactArcGisYmd accepts only padded dates", () => {
    expect(isExactArcGisYmd("2024-01-01")).toBe(true);
    expect(isExactArcGisYmd("2024-1-1")).toBe(false);
    expect(isExactArcGisYmd("2024-01-01' OR '1'='1")).toBe(false);
  });
});
