import { areaUnitLabel } from "./agri-area-unit";

describe("areaUnitLabel", () => {
  it.each([
    ["en", "ha"],
    ["ru", "га"],
    ["uz_lat", "ga"],
    ["uz_cyr", "га"],
  ])("returns the unit for %s", (language, expected) => {
    expect(areaUnitLabel(language)).toBe(expected);
  });

  it("falls back to the Cyrillic unit for unknown or missing languages", () => {
    expect(areaUnitLabel("xx")).toBe("га");
    expect(areaUnitLabel(undefined)).toBe("га");
    expect(areaUnitLabel(null)).toBe("га");
  });
});
