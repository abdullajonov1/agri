import { pickLabel, type AgriLabel } from "./agri-i18n";

describe("pickLabel", () => {
  const label: AgriLabel = {
    en: "English",
    ru: "Russian",
    uz_lat: "Latin",
    uz_cyr: "Cyrillic",
  };

  it("returns the English label for en", () => {
    expect(pickLabel(label, "en")).toBe("English");
  });

  it("returns the Russian label for ru", () => {
    expect(pickLabel(label, "ru")).toBe("Russian");
  });

  it("returns the Latin label for uz_lat", () => {
    expect(pickLabel(label, "uz_lat")).toBe("Latin");
  });

  it("returns the Cyrillic label for uz_cyr", () => {
    expect(pickLabel(label, "uz_cyr")).toBe("Cyrillic");
  });

  it("falls back to Cyrillic for unknown language", () => {
    expect(pickLabel(label, "de")).toBe("Cyrillic");
  });

  it("falls back to Cyrillic for undefined and null", () => {
    expect(pickLabel(label, undefined)).toBe("Cyrillic");
    expect(pickLabel(label, null)).toBe("Cyrillic");
  });
});
