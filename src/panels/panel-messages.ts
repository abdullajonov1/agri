import type { AgriLabel } from "../shared/agri-i18n";

export const CROP_TYPE_TITLE: AgriLabel = {
  en: "Crop Type",
  ru: "Тип культуры",
  uz_lat: "Ekin Turi",
  uz_cyr: "Экин Тури",
};

export const REGION_TOOLTIP_VALUE: AgriLabel = {
  en: "Value:",
  ru: "Значение:",
  uz_lat: "Qiymat:",
  uz_cyr: "Қиймат:",
};

export const REGION_TOOLTIP_PERCENT: AgriLabel = {
  en: "Percentage:",
  ru: "Процент:",
  uz_lat: "Foiz:",
  uz_cyr: "Фоиз:",
};

export const PIE_CENTER_ALL: AgriLabel = {
  en: "All",
  ru: "Все",
  uz_lat: "Barchasi",
  uz_cyr: "Барчаси",
};

export const INDICATOR_DEFAULT_STAT: AgriLabel = {
  en: "Crop area",
  ru: "Площадь посевов",
  uz_lat: "Ekin maydonlari",
  uz_cyr: "Экин майдонлари",
};

export const INDICATOR_RECONNECT: AgriLabel = {
  en: "Reconnect",
  ru: "Повторить подключение",
  uz_lat: "Qayta ulanish",
  uz_cyr: "Қайта уланиш",
};

export const VEGETATION_TITLE: AgriLabel = {
  en: "Vegetation Status",
  ru: "Состояние вегетации",
  uz_lat: "Vegetatsiya Holati",
  uz_cyr: "Вегетация Ҳолати",
};

export const VEGETATION_SELECT_REGION_TITLE: AgriLabel = {
  en: "Select a region",
  ru: "Выберите регион",
  uz_lat: "Viloyatni tanlang",
  uz_cyr: "Вилоятни танланг",
};

export const VEGETATION_SELECT_REGION_BODY: AgriLabel = {
  en: "Select a region first to view vegetation status",
  ru: "Чтобы увидеть состояние вегетации, сначала выберите регион",
  uz_lat: "Vegetatsiya holatini ko‘rish uchun avval viloyatni tanlang",
  uz_cyr: "Вегетация ҳолатини кўриш учун аввал вилоятни танланг",
};

export const VEGETATION_CATEGORY_LABELS: Readonly<Record<string, AgriLabel>> = {
  "1-Juda yaxshi": { en: "Excellent", ru: "Очень хороший", uz_lat: "A'lo", uz_cyr: "Жуда яхши" },
  "2-Yaxshi": { en: "Good", ru: "Хороший", uz_lat: "Yaxshi", uz_cyr: "Яхши" },
  "3-O'rta": { en: "Moderate", ru: "Средний", uz_lat: "O'rta", uz_cyr: "Ўрта" },
  "4-Past": { en: "Poor", ru: "Низкий", uz_lat: "Past", uz_cyr: "Паст" },
};

export function indicatorGroupTotal(language: string, field: string): string {
  if (language === "en") return `Total (${field})`;
  if (language === "ru") return `Итого по полю ${field}`;
  if (language === "uz_lat") return `Jami (${field})`;
  return `Жами (${field})`;
}
