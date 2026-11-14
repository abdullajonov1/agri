import { pickLabel, type AgriLabel } from "../shared/agri-i18n";
import {
  CROP_TYPE_TITLE,
  INDICATOR_DEFAULT_STAT,
  INDICATOR_RECONNECT,
  PIE_CENTER_ALL,
  REGION_TOOLTIP_PERCENT,
  REGION_TOOLTIP_VALUE,
  VEGETATION_CATEGORY_LABELS,
  VEGETATION_SELECT_REGION_BODY,
  VEGETATION_SELECT_REGION_TITLE,
  VEGETATION_TITLE,
  indicatorGroupTotal,
} from "./panel-messages";

const UNKNOWN_LANGUAGE = "fr";

type PickedLabels = Readonly<Record<"en" | "ru" | "uz_lat" | "uz_cyr" | "unknown", string>>;

const pickAllLanguages = (label: AgriLabel): PickedLabels => ({
  en: pickLabel(label, "en"),
  ru: pickLabel(label, "ru"),
  uz_lat: pickLabel(label, "uz_lat"),
  uz_cyr: pickLabel(label, "uz_cyr"),
  unknown: pickLabel(label, UNKNOWN_LANGUAGE),
});

describe("panel-messages AgriLabel maps", () => {
  test("CROP_TYPE_TITLE matches the pie panel title chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Crop Type",
      ru: "Тип культуры",
      uz_lat: "Ekin Turi",
      uz_cyr: "Экин Тури",
      unknown: "Экин Тури",
    };

    // Act
    const actual = pickAllLanguages(CROP_TYPE_TITLE);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("REGION_TOOLTIP_VALUE matches the region tooltip value chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Value:",
      ru: "Значение:",
      uz_lat: "Qiymat:",
      uz_cyr: "Қиймат:",
      unknown: "Қиймат:",
    };

    // Act
    const actual = pickAllLanguages(REGION_TOOLTIP_VALUE);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("REGION_TOOLTIP_PERCENT matches the region tooltip percentage chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Percentage:",
      ru: "Процент:",
      uz_lat: "Foiz:",
      uz_cyr: "Фоиз:",
      unknown: "Фоиз:",
    };

    // Act
    const actual = pickAllLanguages(REGION_TOOLTIP_PERCENT);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("PIE_CENTER_ALL matches the pie center label chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "All",
      ru: "Все",
      uz_lat: "Barchasi",
      uz_cyr: "Барчаси",
      unknown: "Барчаси",
    };

    // Act
    const actual = pickAllLanguages(PIE_CENTER_ALL);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("INDICATOR_DEFAULT_STAT matches the indicator default stat chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Crop area",
      ru: "Площадь посевов",
      uz_lat: "Ekin maydonlari",
      uz_cyr: "Экин майдонлари",
      unknown: "Экин майдонлари",
    };

    // Act
    const actual = pickAllLanguages(INDICATOR_DEFAULT_STAT);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("INDICATOR_RECONNECT matches the indicator reconnect button chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Reconnect",
      ru: "Повторить подключение",
      uz_lat: "Qayta ulanish",
      uz_cyr: "Қайта уланиш",
      unknown: "Қайта уланиш",
    };

    // Act
    const actual = pickAllLanguages(INDICATOR_RECONNECT);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("VEGETATION_TITLE matches the vegetation panel title chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Vegetation Status",
      ru: "Состояние вегетации",
      uz_lat: "Vegetatsiya Holati",
      uz_cyr: "Вегетация Ҳолати",
      unknown: "Вегетация Ҳолати",
    };

    // Act
    const actual = pickAllLanguages(VEGETATION_TITLE);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("VEGETATION_SELECT_REGION_TITLE matches the select-region title chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Select a region",
      ru: "Выберите регион",
      uz_lat: "Viloyatni tanlang",
      uz_cyr: "Вилоятни танланг",
      unknown: "Вилоятни танланг",
    };

    // Act
    const actual = pickAllLanguages(VEGETATION_SELECT_REGION_TITLE);

    // Assert
    expect(actual).toEqual(expected);
  });

  test("VEGETATION_SELECT_REGION_BODY matches the select-region body chain", () => {
    // Arrange
    const expected: PickedLabels = {
      en: "Select a region first to view vegetation status",
      ru: "Чтобы увидеть состояние вегетации, сначала выберите регион",
      uz_lat: "Vegetatsiya holatini ko‘rish uchun avval viloyatni tanlang",
      uz_cyr: "Вегетация ҳолатини кўриш учун аввал вилоятни танланг",
      unknown: "Вегетация ҳолатини кўриш учун аввал вилоятни танланг",
    };

    // Act
    const actual = pickAllLanguages(VEGETATION_SELECT_REGION_BODY);

    // Assert
    expect(actual).toEqual(expected);
  });

  test.each([
    [
      "1-Juda yaxshi",
      { en: "Excellent", ru: "Очень хороший", uz_lat: "A'lo", uz_cyr: "Жуда яхши" },
    ],
    [
      "2-Yaxshi",
      { en: "Good", ru: "Хороший", uz_lat: "Yaxshi", uz_cyr: "Яхши" },
    ],
    [
      "3-O'rta",
      { en: "Moderate", ru: "Средний", uz_lat: "O'rta", uz_cyr: "Ўрта" },
    ],
    [
      "4-Past",
      { en: "Poor", ru: "Низкий", uz_lat: "Past", uz_cyr: "Паст" },
    ],
  ])("VEGETATION_CATEGORY_LABELS[%s] matches the bar panel category chain", (key, expected) => {
    // Arrange
    const label = VEGETATION_CATEGORY_LABELS[key];

    // Act
    const actual = pickAllLanguages(label);

    // Assert
    expect(actual).toEqual({ ...expected, unknown: expected.uz_cyr });
  });
});

describe("indicatorGroupTotal", () => {
  test("builds the per-language group total caption with the field name", () => {
    // Arrange
    const field = "crop_type";

    // Act & Assert
    expect(indicatorGroupTotal("en", field)).toBe("Total (crop_type)");
    expect(indicatorGroupTotal("ru", field)).toBe("Итого по полю crop_type");
    expect(indicatorGroupTotal("uz_lat", field)).toBe("Jami (crop_type)");
    expect(indicatorGroupTotal("uz_cyr", field)).toBe("Жами (crop_type)");
  });

  test("falls back to the uz_cyr caption for an unknown language", () => {
    // Arrange
    const field = "crop_type";

    // Act
    const actual = indicatorGroupTotal(UNKNOWN_LANGUAGE, field);

    // Assert
    expect(actual).toBe("Жами (crop_type)");
  });
});
