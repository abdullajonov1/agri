import { pickLabel, type AgriLabel } from "./agri-i18n";

const AREA_UNIT: AgriLabel = {
  en: "ha",
  ru: "га",
  uz_lat: "ga",
  uz_cyr: "га",
};

export function areaUnitLabel(language: string | null | undefined): string {
  return pickLabel(AREA_UNIT, language);
}
