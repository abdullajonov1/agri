jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import {
  haystackMatchesRegion,
  inferRegionDisplayFromHaystack,
  scoreHaystackForFilters,
  scoreLayerForFilters,
} from "./haystack-scoring";

describe("scoreHaystackForFilters", () => {
  test("adds 10 for the year and 25 for the region", () => {
    // Arrange
    const haystack = "Agri Samarkand 2025 year";

    // Act
    const score = scoreHaystackForFilters(haystack, {
      yil: "2025",
      viloyat: "Samarqand viloyati",
    });

    // Assert
    expect(score).toBe(35);
  });

  test("scores only the region when the year is absent", () => {
    expect(
      scoreHaystackForFilters("water ferghana", {
        yil: "2025",
        viloyat: "Farg'ona viloyati",
      }),
    ).toBe(25);
  });

  test("ignores a year that is not four digits", () => {
    expect(scoreHaystackForFilters("agri 25", { yil: "25", viloyat: "" })).toBe(0);
  });

  test("returns 0 when nothing matches", () => {
    expect(
      scoreHaystackForFilters("basemap", { yil: "2024", viloyat: "Xorazm viloyati" }),
    ).toBe(0);
  });
});

describe("haystackMatchesRegion", () => {
  test("matches region aliases in a layer title", () => {
    expect(haystackMatchesRegion("water ferghana 2025", "Farg'ona viloyati")).toBe(true);
  });

  test("is false for an empty region or an unrelated title", () => {
    expect(haystackMatchesRegion("water ferghana 2025", "")).toBe(false);
    expect(haystackMatchesRegion("", "Farg'ona viloyati")).toBe(false);
    expect(haystackMatchesRegion("agri andijan 2025", "Xorazm viloyati")).toBe(false);
  });
});

describe("inferRegionDisplayFromHaystack", () => {
  test("returns the canonical region label found in the text", () => {
    expect(inferRegionDisplayFromHaystack("agri andijan 2026 year")).toBe(
      "Andijon viloyati",
    );
  });

  test("returns null when no region is mentioned", () => {
    expect(inferRegionDisplayFromHaystack("world hillshade")).toBeNull();
  });
});

describe("scoreLayerForFilters", () => {
  test("scores title + url together", () => {
    const layer = {
      title: "Agri Andijan",
      url: "https://example.test/arcgis/rest/services/agri_2026/MapServer/0",
    };
    expect(
      scoreLayerForFilters(layer, { yil: "2026", viloyat: "Andijon viloyati" }),
    ).toBe(35);
  });

  test("tolerates a missing layer", () => {
    expect(scoreLayerForFilters(null, { yil: "2026", viloyat: "" })).toBe(0);
  });
});
