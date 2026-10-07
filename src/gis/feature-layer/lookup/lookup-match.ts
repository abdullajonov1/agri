import { canonicalizeRegionFilterValue } from "./lookup-region";
import { normalizeRegionToken, REGION_ALIAS_GROUPS, type TextMatchKind, expandRegionVariants, expandDistrictVariants, apostropheVariants, matchIndexedValues, layerFieldKind, valueIndexCache, getQueryUrl, normalizeValueToken } from "../primitives";
import { escapeArcGIS } from "../../../data/agri-sql";
import type { AgriLayerLike } from "../../agri-layer-types";

/** Region name tokens for matching layer titles like "Water Fergana region 2025 year". */
export function getRegionMatchTokens(viloyat: string): string[] {
  const canonical = canonicalizeRegionFilterValue(viloyat);
  const norm = normalizeRegionToken(canonical);
  if (!norm) return [];

  for (const group of REGION_ALIAS_GROUPS) {
    if (group.some((alias) => norm.includes(normalizeRegionToken(alias)))) {
      return group.map((alias) => normalizeRegionToken(alias)).filter(Boolean);
    }
  }

  return [norm];
}
export function literalVariantsForMatch(
  value: string,
  kind: TextMatchKind,
): string[] {
  const canonical =
    kind === "region" ? canonicalizeRegionFilterValue(value) : value;
  if (kind === "region") return expandRegionVariants(canonical);
  if (kind === "district") return expandDistrictVariants(value);
  return apostropheVariants(value);
}
export function addTextEqTerms(
  field: string,
  literals: string[],
  layer: AgriLayerLike | null | undefined,
  value: string,
  addTerm: (term: string) => void,
): void {
  const matched = matchIndexedValues(layer, field, value);
  const vals =
    matched === null
      ? literals
      : matched.length
        ? matched
        : literals;
  const numericField = layerFieldKind(layer, field) === "numeric";
  for (const v of vals) {
    const digits = String(v).replace(/[^\d]/g, "");
    if (numericField) {
      // Numeric field: only emit when the value is fully numeric — a quoted
      // text literal on a numeric field fails server-side and kills the query.
      const raw = String(v).trim();
      if (digits && digits === raw && !isNaN(Number(digits))) {
        addTerm(`${field}=${Number(digits)}`);
      }
    } else {
      addTerm(`${field}='${escapeArcGIS(v)}'`);
    }
  }
}
export function matchRegionValuesFromIndex(
  layer: AgriLayerLike | null | undefined,
  field: string,
  canonical: string,
  soato?: string | null,
): string[] | null {
  if (!layer) return null;
  const idx = valueIndexCache.get(getQueryUrl(layer));
  const vals = idx?.[field.toLowerCase()];
  if (!vals) return null;
  if (!vals.length) return [];

  const matched = new Set<string>();
  const probes = [
    canonical,
    ...(soato ? [soato] : []),
    ...expandRegionVariants(canonical),
  ];
  for (const probe of probes) {
    const fromIdx = matchIndexedValues(layer, field, probe);
    if (fromIdx?.length) fromIdx.forEach((v) => matched.add(v));
  }

  if (!matched.size) {
    const token = normalizeValueToken(canonical);
    for (const v of vals) {
      const n = normalizeValueToken(v);
      if (!token || !n || n.length < 4 || token.length < 4) continue;
      if (n === token || n.includes(token) || token.includes(n)) {
        matched.add(v);
      }
    }
  }

  return Array.from(matched);
}
