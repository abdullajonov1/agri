/**
 * Year / region scoring of layer titles, URLs and data-source labels
 * (shared by map layer selection and data-source matching).
 */
import { type AgriFilters, normalizeRegionToken, REGION_SOATO_TO_UZ_NAME } from "./primitives";
import { getRegionMatchTokens, canonicalizeRegionFilterValue } from "./layer-lookup";
import type { AgriLayerLike } from "../agri-layer-types";

/** Score a title/url/label string for year + region match (shared by map + DS). */
export function scoreHaystackForFilters(
  haystack: string,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
): number {
  const text = String(haystack || "").toLowerCase();
  let score = 0;

  const yil = String(filters.yil ?? "").trim();
  if (yil && /^\d{4}$/.test(yil) && text.includes(yil)) {
    score += 10;
  }

  const viloyat = String(filters.viloyat ?? "").trim();
  if (viloyat) {
    for (const token of getRegionMatchTokens(viloyat)) {
      if (token && text.includes(token)) {
        score += 25;
        break;
      }
    }
  }

  return score;
}
/** True when a layer title/url/label explicitly matches the selected region. */
export function haystackMatchesRegion(haystack: string, viloyat?: string): boolean {
  const value = canonicalizeRegionFilterValue(String(viloyat ?? "").trim());
  if (!value) return false;
  const text = normalizeRegionToken(haystack);
  if (!text) return false;
  return getRegionMatchTokens(value).some((token) => !!token && text.includes(token));
}
/** Infer canonical region display name from a layer/DS title or URL (e.g. "water ferghana 2025"). */
export function inferRegionDisplayFromHaystack(haystack: string): string | null {
  for (const label of Object.values(REGION_SOATO_TO_UZ_NAME)) {
    if (haystackMatchesRegion(haystack, label)) return label;
  }
  return null;
}
export function scoreLayerForFilters(
  layer: AgriLayerLike | null | undefined,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
): number {
  const title = String(layer?.title || "").toLowerCase();
  const url = String(layer?.url || "").toLowerCase();
  return scoreHaystackForFilters(`${title} ${url}`, filters);
}
