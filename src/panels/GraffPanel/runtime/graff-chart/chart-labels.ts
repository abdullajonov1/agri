/**
 * Localized static labels for the Graff vegetation chart.
 * Any language other than en / ru / uz_lat falls back to Uzbek Cyrillic.
 */

type ChartLabelSet = {
  en: string;
  ru: string;
  uz_lat: string;
  fallback: string;
};

const pickLabel = (language: string, labels: ChartLabelSet): string =>
  language === "en"
    ? labels.en
    : language === "ru"
      ? labels.ru
      : language === "uz_lat"
        ? labels.uz_lat
        : labels.fallback;

export const graffChartErrorTitle = (language: string): string =>
  pickLabel(language, {
    en: "Could not load data",
    ru: "Не удалось загрузить данные",
    uz_lat: "Maʼlumot yuklanmadi",
    fallback: "Маълумот юклана олмади",
  });

export const graffChartRetryLabel = (language: string): string =>
  pickLabel(language, {
    en: "Retry",
    ru: "Повторить",
    uz_lat: "Qayta urinib ko‘rish",
    fallback: "Qayta urinish",
  });

export const graffChartMaxLabel = (language: string): string =>
  pickLabel(language, { en: "Max", ru: "Макс", uz_lat: "Max", fallback: "Макс" });

export const graffChartMinLabel = (language: string): string =>
  pickLabel(language, { en: "Min", ru: "Мин", uz_lat: "Min", fallback: "Мин" });

const MONTHS_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_SHORT_CYR = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const MONTHS_SHORT_UZ_LAT = ["Yan", "Feb", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

/** Short month labels for the x-axis (index 0 = January). */
export const graffChartMonthLabels = (language: string): string[] =>
  language === "en"
    ? MONTHS_SHORT_EN
    : language === "uz_lat"
      ? MONTHS_SHORT_UZ_LAT
      : MONTHS_SHORT_CYR;
