import { pickLabel, type AgriLabel } from "../../../../../shared/agri-i18n";
import { FORMULA_LABEL, INDEX_INFO_HEADER, YIL_HEADER } from "./toolbar-messages";

const UNKNOWN_LANGUAGE = "fr";

type PickedLabels = Readonly<Record<"en" | "ru" | "uz_lat" | "uz_cyr" | "unknown", string>>;

const pickAllLanguages = (label: AgriLabel): PickedLabels => ({
  en: pickLabel(label, "en"),
  ru: pickLabel(label, "ru"),
  uz_lat: pickLabel(label, "uz_lat"),
  uz_cyr: pickLabel(label, "uz_cyr"),
  unknown: pickLabel(label, UNKNOWN_LANGUAGE),
});

describe("toolbar-messages AgriLabel maps", () => {
  test("YIL_HEADER matches the year menu header chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Year",
      ru: "Год",
      uz_lat: "Yil",
      uz_cyr: "Йил",
      unknown: "Йил",
    };

    // Act
    const actual = pickAllLanguages(YIL_HEADER);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("FORMULA_LABEL matches the index info formula chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Formula",
      ru: "Формула",
      uz_lat: "Formula",
      uz_cyr: "Формула",
      unknown: "Формула",
    };

    // Act
    const actual = pickAllLanguages(FORMULA_LABEL);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("INDEX_INFO_HEADER matches the index info header chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "About indices",
      ru: "Инфо про индексы",
      uz_lat: "Indekslar haqida",
      uz_cyr: "Индекслар ҳақида",
      unknown: "Индекслар ҳақида",
    };

    // Act
    const actual = pickAllLanguages(INDEX_INFO_HEADER);

    // Assert
    expect(actual).toEqual(expected);
  });
});
