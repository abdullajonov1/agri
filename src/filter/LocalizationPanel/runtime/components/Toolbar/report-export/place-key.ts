import { normalizeApos } from "../../../../../../data/agri-sql";
import { makeRegionDistrictKey } from "../../../../../localization/geo-keys";

const SPELLING_ALIASES: Record<string, string> = {
  surhandaryo: "surhondaryo",
};

/**
 * Join key between template names, mapping rows and layer aggregates.
 * Suffix markers keep cities, tumans and viloyats with the same base name apart:
 *   "Guliston"          → guliston
 *   "Guliston tumani"   → guliston t
 *   "Guliston shahri"   → guliston sh
 *   "Toshkent viloyati" → toshkent   (viloyat suffix stripped, no mark)
 */
export function reportPlaceKey(raw: string | null | undefined): string {
  const base = makeRegionDistrictKey(raw);
  if (!base) return "";
  let key = base
    .replace(/[‘’ʻʼ`´']/g, "")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let mark = "";
  if (/\s(shahri|shahar|sh)$/.test(key)) mark = " sh";
  else if (/\s(tumani|tuman)$/.test(key)) mark = " t";

  key = key
    .replace(/\s(viloyati|viloyat|vil)$/, "")
    .replace(/\s(tumani|tuman)$/, "")
    .replace(/\s(shahri|shahar|sh)$/, "")
    .replace(/\s(respublika\S*|resp|r)$/, "")
    .replace(/x/g, "h")
    .trim();
  if (key.startsWith("qoraqalpo")) key = "qoraqalpogiston";
  key = SPELLING_ALIASES[key] || key;
  return key ? key + mark : "";
}

export function sameReportPlace(a: string, b: string): boolean {
  const ka = reportPlaceKey(a);
  return Boolean(ka) && ka === reportPlaceKey(b);
}

/**
 * Alternate keys when one side omits the city suffix (mapping "Shirin" vs
 * layer "Shirin shahri"). Never bridges tuman ↔ city.
 */
export function reportPlaceKeyAlts(key: string): string[] {
  if (!key) return [];
  if (key.endsWith(" sh")) return [key.slice(0, -3)];
  if (key.endsWith(" t")) return [];
  return [`${key} sh`];
}

/** Short viloyat label for Zaxira "Hudud" column (e.g. Andijon). */
export function shortViloyatLabel(viloyat: string): string {
  const cleaned = normalizeApos(String(viloyat || ""))
    .replace(/\s*viloyati\s*$/i, "")
    .replace(/\s*viloyat\s*$/i, "")
    .replace(/\s*respublikasi\s*$/i, "")
    .trim();
  return cleaned || String(viloyat || "").trim();
}

/** Full viloyat name for sheet titles ("Andijon" → "Andijon viloyati"). */
export function viloyatTitleName(viloyat: string): string {
  const name = String(viloyat || "").trim();
  if (!name) return "";
  if (/(viloyati|respublikasi|shahri|shahar)$/i.test(name)) return name;
  return `${name} viloyati`;
}

export function formatReportDate(d = new Date()): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
