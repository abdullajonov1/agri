import type { AgriLanguage } from "./agri-language";

export type AgriLabel = Readonly<Record<AgriLanguage, string>>;

export function pickLabel(
  label: AgriLabel,
  language: string | null | undefined,
): string {
  if (language === "en") return label.en;
  if (language === "ru") return label.ru;
  if (language === "uz_lat") return label.uz_lat;
  return label.uz_cyr;
}
