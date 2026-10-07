import { translateAgriPlaceForDisplay } from "./agri-place-display";

describe("translateAgriPlaceForDisplay", () => {
  test("returns empty/blank input unchanged after trim", () => {
    expect(translateAgriPlaceForDisplay("   ", "ru")).toBe("");
    expect(translateAgriPlaceForDisplay(null as unknown as string, "en")).toBe("");
  });

  describe("Karakalpakstan special-case", () => {
    test.each([
      ["en", "Qoraqalpog'iston Respublikasi", "Republic of Karakalpakstan"],
      ["en", "Qoraqalpog'iston", "Karakalpakstan"],
      ["ru", "Qoraqalpogʻiston Respublikasi", "Республика Каракалпакстан"],
      ["ru", "Qoraqalpog‘iston", "Каракалпакстан"],
      ["uz_lat", "Қорақалпоғистон Республикаси", "Qoraqalpog'iston Respublikasi"],
      ["uz_lat", "Qoraqalpog'iston", "Qoraqalpog'iston"],
      ["uz_cyr", "Qoraqalpog'iston Respublikasi", "Қорақалпоғистон Республикаси"],
      ["uz_cyr", "Qoraqalpog'iston", "Қорақалпоғистон"],
    ] as const)("%s: %s -> %s", (lang, input, expected) => {
      expect(translateAgriPlaceForDisplay(input, lang)).toBe(expected);
    });
  });

  describe("uz_lat", () => {
    test("transliterates Cyrillic to Latin and folds apostrophes", () => {
      expect(translateAgriPlaceForDisplay("Самарқанд вилояти", "uz_lat")).toBe(
        "Samarqand viloyati",
      );
      expect(translateAgriPlaceForDisplay("Bo‘stonliq tumani", "uz_lat")).toBe(
        "Bo'stonliq tumani",
      );
    });

    test("keeps Latin input intact", () => {
      expect(translateAgriPlaceForDisplay("Chust tumani", "uz_lat")).toBe("Chust tumani");
    });
  });

  describe("uz_cyr", () => {
    test("transliterates Latin digraphs to Cyrillic", () => {
      expect(translateAgriPlaceForDisplay("Shahrisabz", "uz_cyr")).toBe("Шаҳрисабз");
      expect(translateAgriPlaceForDisplay("Chust tumani", "uz_cyr")).toBe("Чуст тумани");
      expect(translateAgriPlaceForDisplay("Farg'ona", "uz_cyr")).toBe("Фарғона");
      expect(translateAgriPlaceForDisplay("Bo'ston", "uz_cyr")).toBe("Бўстон");
    });

    test("handles yo' as Йў rather than Ё", () => {
      expect(translateAgriPlaceForDisplay("Yo'lchi", "uz_cyr")).toBe("Йўлчи");
      expect(translateAgriPlaceForDisplay("yo'l", "uz_cyr")).toBe("йўл");
    });

    test("leaves digits and punctuation untouched", () => {
      expect(translateAgriPlaceForDisplay("Zona-2", "uz_cyr")).toBe("Зона-2");
    });
  });

  describe("en", () => {
    test("appends Region for region kind", () => {
      expect(translateAgriPlaceForDisplay("Samarqand viloyati", "en")).toBe("Samarkand Region");
      expect(translateAgriPlaceForDisplay("Buxoro", "en", "region")).toBe("Bukhara Region");
    });

    test("appends District for district suffix or kind", () => {
      expect(translateAgriPlaceForDisplay("Chust tumani", "en")).toBe("Chust District");
      expect(translateAgriPlaceForDisplay("Urgut", "en", "district")).toBe("Urgut District");
    });

    test("appends City for shahri suffix", () => {
      expect(translateAgriPlaceForDisplay("Chirchiq shahri", "en", "district")).toMatch(/City$/);
    });

    test("does not double-append when translation already says City", () => {
      expect(translateAgriPlaceForDisplay("Toshkent shahri", "en")).toBe("Tashkent City");
    });

    test("transliterates unknown names", () => {
      expect(translateAgriPlaceForDisplay("Xo'jabeshtepa tumani", "en")).toBe("Khojabeshtepa District");
    });
  });

  describe("ru", () => {
    test("uses official oblast names", () => {
      expect(translateAgriPlaceForDisplay("Andijon viloyati", "ru")).toBe("Андижанская область");
      expect(translateAgriPlaceForDisplay("Farg'ona", "ru", "region")).toBe(
        "Ферганская область",
      );
    });

    test("uses official district names, including apostrophe variants", () => {
      expect(translateAgriPlaceForDisplay("Bo'stonliq tumani", "ru")).toBe(
        "Бостанлыкский район",
      );
      expect(translateAgriPlaceForDisplay("Mirzacho‘l", "ru", "district")).toBe(
        "Мирзачульский район",
      );
    });

    test("resolves Cyrillic Uzbek district input", () => {
      expect(translateAgriPlaceForDisplay("Чуст тумани", "ru")).toBe("Чустский район");
    });

    test("cities get a 'город' prefix", () => {
      expect(translateAgriPlaceForDisplay("Chirchiq shahri", "ru")).toBe("город Чирчик");
    });

    test("district kind falls back to city gazetteer", () => {
      expect(translateAgriPlaceForDisplay("Chirchiq", "ru", "district")).toBe("город Чирчик");
    });

    test("transliterates unknown names with kind-specific suffix", () => {
      expect(translateAgriPlaceForDisplay("Yangishahar tumani", "ru")).toBe(
        "Янгишахарский район",
      );
      expect(translateAgriPlaceForDisplay("Yangishahar viloyati", "ru")).toBe(
        "Янгишахарская область",
      );
      expect(translateAgriPlaceForDisplay("Yangishahar shahri", "ru")).toBe(
        "город Янгишахар",
      );
    });

    test("transliteration maps g', o' and ng digraphs", () => {
      expect(translateAgriPlaceForDisplay("G'o'ng tumani", "ru")).toBe("Гунгский район");
    });
  });
});
