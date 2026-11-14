import type { AgriLabel } from "../../../../../shared/agri-i18n";

export const TOOLBAR_GROUP_MESSAGES = {
  year: { en: "Year", ru: "Год", uz_lat: "Yil", uz_cyr: "Йил" },
  indexInfo: {
    en: "About indices",
    ru: "Инфо про индексы",
    uz_lat: "Indekslar haqida",
    uz_cyr: "Индекслар ҳақида",
  },
  language: { en: "Language", ru: "Язык", uz_lat: "Til", uz_cyr: "Тил" },
  theme: { en: "Theme", ru: "Тема", uz_lat: "Tema", uz_cyr: "Тема" },
  logout: { en: "Log out", ru: "Выйти", uz_lat: "Chiqish", uz_cyr: "Чиқиш" },
  excel: {
    en: "Download Excel report",
    ru: "Скачать Excel-отчёт",
    uz_lat: "Excel hisobotni yuklash",
    uz_cyr: "Excel ҳисоботни юклаш",
  },
  notifications: {
    en: "Notifications",
    ru: "Уведомления",
    uz_lat: "Bildirishnomalar",
    uz_cyr: "Билдиришномалар",
  },
} as const satisfies Record<string, AgriLabel>;
