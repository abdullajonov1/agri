import { translateUzbekPlaceToEnglish } from "./english-place-names";

describe("translateUzbekPlaceToEnglish", () => {
  test("returns empty string for empty / nullish input", () => {
    expect(translateUzbekPlaceToEnglish("")).toBe("");
    expect(translateUzbekPlaceToEnglish("   ")).toBe("");
    expect(translateUzbekPlaceToEnglish(null as unknown as string)).toBe("");
  });

  test("maps known region names case-insensitively", () => {
    expect(translateUzbekPlaceToEnglish("Andijon", "region")).toBe("Andijan");
    expect(translateUzbekPlaceToEnglish("  SAMARQAND ")).toBe("Samarkand");
    expect(translateUzbekPlaceToEnglish("Toshkent shahri")).toBe("Tashkent City");
  });

  test("strips viloyat / viloyati / tumani suffixes", () => {
    expect(translateUzbekPlaceToEnglish("Buxoro viloyati")).toBe("Bukhara");
    expect(translateUzbekPlaceToEnglish("Xorazm viloyat")).toBe("Khorezm");
    expect(translateUzbekPlaceToEnglish("Guliston tumani", "district")).toBe("Gulistan");
  });

  test("normalizes apostrophe variants before lookup", () => {
    expect(translateUzbekPlaceToEnglish("Farg‘ona")).toBe("Fergana");
    expect(translateUzbekPlaceToEnglish("Farg'ona")).toBe("Fergana");
    expect(translateUzbekPlaceToEnglish("Qoraqalpogʻiston")).toBe("Karakalpakstan");
    expect(translateUzbekPlaceToEnglish("Bo'evut")).toBe("Boyovut");
    expect(translateUzbekPlaceToEnglish("Qo'qon")).toBe("Kokand");
  });

  test("collapses internal whitespace", () => {
    expect(translateUzbekPlaceToEnglish("toshkent    shahri")).toBe("Tashkent City");
  });

  test("transliterates unknown names (g' -> gh, o' -> o, x -> kh) in title case", () => {
    expect(translateUzbekPlaceToEnglish("xo'jaobod-g'arbiy")).toBe("Khojaobod-Gharbiy");
    expect(translateUzbekPlaceToEnglish("yangi qishloq")).toBe("Yangi Qishloq");
  });
});
