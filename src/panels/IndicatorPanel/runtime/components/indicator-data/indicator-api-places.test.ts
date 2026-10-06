import {
  canonicalIndicatorApiPlaces,
  normalizeUzbekPlaceForApi,
} from "./indicator-api-places";

describe("indicator API place", () => {
  test("sends one normalized pair and does not invent suffixes", () => {
    expect(canonicalIndicatorApiPlaces("Farg'ona", "Qo'qon tumani")).toEqual({
      viloyat: "Farg'ona",
      tuman: "Qo'qon tumani",
    });
  });

  test("folds apostrophe glyphs before the single request", () => {
    expect(normalizeUzbekPlaceForApi("Farg\u02BBona")).toBe("Farg'ona");
    expect(canonicalIndicatorApiPlaces("Farg\u02BBona", "")).toEqual({
      viloyat: "Farg'ona",
      tuman: "",
    });
  });
});
