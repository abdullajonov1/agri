/**
 * Region (viloyat) names, codes and title/url haystack matching.
 * Pure leaf module — no ArcGIS or widget imports, safe from every layer.
 */
import type { AgriFilters } from "./where-values";

/**
 * Agri region codes (`region` / Hosted `parent_cod`) → display name.
 * Same table as vegetation indices / Agri_table_data — NOT the official SOATO
 * table (which swaps Navoi↔Namangan and Fergana↔Kashkadarya).
 */
export const REGION_SOATO_TO_UZ_NAME: Record<string, string> = {
  "1703": "Andijon viloyati",
  "1706": "Buxoro viloyati",
  "1708": "Jizzax viloyati",
  "1710": "Qashqadaryo viloyati",
  "1712": "Navoiy viloyati",
  "1714": "Namangan viloyati",
  "1718": "Samarqand viloyati",
  "1722": "Surxondaryo viloyati",
  "1724": "Sirdaryo viloyati",
  "1726": "Toshkent shahri",
  "1727": "Toshkent viloyati",
  "1730": "Farg'ona viloyati",
  "1733": "Xorazm viloyati",
  "1735": "Qoraqalpog'iston Respublikasi",
};

/** English / translit aliases used when resolving a region label. */
export const REGION_ALIAS_GROUPS: string[][] = [
  ["fargona", "fergana", "ferghana", "фарғона", "фергана"],
  ["samarqand", "samarkand", "samar", "samarkhand"],
  ["toshkent", "tashkent"],
  ["andijon", "andijan"],
  ["namangan", "namangan"],
  ["buxoro", "bukhara", "buxara"],
  ["qashqadaryo", "kashkadarya", "kashkadaria", "qashqadarya", "kashkada"],
  // "sukhandarya" (missing the 'r') is a typo in the WebMap's 2025 layer title.
  ["surxondaryo", "surkhandarya", "surxandarya", "sukhandarya"],
  ["jizzax", "jizzakh", "jizakh"],
  ["sirdaryo", "syrdarya", "sirdarya"],
  ["navoiy", "navoi"],
  ["xorazm", "khorezm", "xorezm", "kharezm"],
  ["qoraqalpogiston", "karakalpakstan", "nukus", "qqr"],
];

export function normalizeRegionToken(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’'`ʻ‘ʼ]/g, "")
    .replace(/\s+viloyati/g, "")
    .replace(/\s+viloyat/g, "")
    .replace(/\s+region/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ]/g, "")
    .trim();
}

/** Compare region labels ignoring apostrophe / viloyati spelling variants. */
export function regionFilterValuesEqual(a: string, b: string): boolean {
  return normalizeRegionToken(a) === normalizeRegionToken(b);
}

/** Every normalized alias token in the same group as `name` (plus itself). */
export function regionAliasTokens(name: string): Set<string> {
  const target = normalizeRegionToken(name);
  const tokens = new Set<string>();
  if (!target) return tokens;
  tokens.add(target);
  for (const group of REGION_ALIAS_GROUPS) {
    const norms = group.map((alias) => normalizeRegionToken(alias)).filter(Boolean);
    if (norms.some((alias) => alias === target)) {
      norms.forEach((alias) => tokens.add(alias));
      break;
    }
  }
  return tokens;
}

export function regionSoatoToDisplayName(code: string): string | null {
  const c = String(code ?? "").trim();
  return REGION_SOATO_TO_UZ_NAME[c] || null;
}

export function regionDisplayNameToSoato(name: string): string | null {
  const matchTokens = regionAliasTokens(name);
  if (!matchTokens.size) return null;
  for (const [code, label] of Object.entries(REGION_SOATO_TO_UZ_NAME)) {
    const labelToken = normalizeRegionToken(label);
    if (labelToken && matchTokens.has(labelToken)) return code;
  }
  return null;
}

export function extractYearFromHaystack(haystack: string): string | null {
  const match = String(haystack || "").match(/(?:19|20)\d{2}/);
  return match ? match[0] : null;
}

/**
 * Detect region+year field layers by title/url.
 * Accepts both:
 * - classic: "... year ... 2026" / "agri andijan 2026 year"
 * - Test agri style: "agri andijan 2026" (agri + year number, no "year" word)
 *
 * Does NOT by itself mean the layer should be toggled — callers must also
 * require a known region token so aggregate titles like
 * "agri 2026 republic data" are never treated as a single region leaf
 * (forcing all of its sublayers visible would export every region at once).
 */
export function looksLikeRegionYearLayerHaystack(haystack: string): boolean {
  const text = String(haystack || "");
  if (!/\b(19|20)\d{2}\b/.test(text)) return false;
  return /\byear\b/i.test(text) || /\bagri\b/i.test(text);
}

/** True when title/url contains a known viloyat alias (andijan, ferghana, …). */
export function haystackHasKnownRegionToken(haystack: string): boolean {
  const text = normalizeRegionToken(haystack);
  if (!text) return false;
  for (const group of REGION_ALIAS_GROUPS) {
    if (group.some((alias) => text.includes(normalizeRegionToken(alias)))) {
      return true;
    }
  }
  return false;
}

export function haystackMatchesYear(haystack: string, yil?: string): boolean {
  const year = String(yil ?? "").trim();
  if (!/^\d{4}$/.test(year)) return false;
  return String(haystack || "").toLowerCase().includes(year);
}

type ScoredLayerItem<T> = T & { regionMatch: boolean };

/**
 * When a single Map Service layer is used, its title may say 2024 while the UI
 * filter is 2025 — year is still applied via the `year` field in WHERE.
 */
export function pickYearRegionLayerPool<T extends ScoredLayerItem<{ score: number }>>(
  scored: T[],
  totalCandidates: number,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
  haystackFor: (item: T) => string,
): T[] {
  const wantsYear = /^\d{4}$/.test(String(filters.yil ?? "").trim());
  const wantsRegion = !!String(filters.viloyat ?? "").trim();

  let yearPool = wantsYear
    ? scored.filter((item) => haystackMatchesYear(haystackFor(item), filters.yil))
    : scored;

  if (wantsYear && !yearPool.length && scored.length) {
    const regionMatched = scored.filter((item) => item.regionMatch);
    if (regionMatched.length === 1) {
      yearPool = regionMatched;
    } else if (scored.length === 1 || totalCandidates === 1) {
      yearPool = scored;
    } else if (regionMatched.length > 0) {
      yearPool = regionMatched;
    }
  }

  if (!yearPool.length) return [];

  if (!wantsRegion) return yearPool;

  const regionPool = yearPool.filter((item) => item.regionMatch);
  if (regionPool.length) return regionPool;

  if (yearPool.length === 1 || totalCandidates === 1) return yearPool;

  const regionMatched = scored.filter((item) => item.regionMatch);
  return regionMatched.length ? regionMatched : yearPool;
}
