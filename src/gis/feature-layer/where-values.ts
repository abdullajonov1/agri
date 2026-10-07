/**
 * Filter model + WHERE value helpers: efficiency range, spelling variants,
 * distinct-value index matching, field kinds and land-type normalization.
 */
import { combineAccessWhere } from "../../shared/agri-access-config";
import { getCropTuriMatchValues } from "../../shared/agri-crop-labels";
import { escapeArcGIS } from "../../data/agri-sql";
import type { AgriFieldLike, AgriLayerLike } from "../agri-layer-types";
import { getQueryUrl } from "./query-cache";

/** Portal group access + business WHERE. */
export function withAgriAccessWhere(mainWhere?: string): string {
  return combineAccessWhere(mainWhere);
}

export interface AgriFilters {
  yil?: string;
  viloyat?: string;
  tuman?: string;
  mavsum?: string;
  /** Multiple mavsum values joined with OR (e.g. grouped season labels). */
  mavsumOrValues?: string[];
  fermer?: string;
  /** STIR / tax_number qidiruv (raqamli maydon). */
  farmerTax?: string;
  crop?: string;
  /** Numeric crop_id from AgriCrop cropSelected (preferred over name on crop_id field). */
  cropId?: string;
  /** Land type selected in AgriLocalization: sugoriladigan | lalmi | "". */
  yerTuri?: string;
  /** water_table type_id: 1 = Sug'oriladigan/Sug'orilgan, 2 = Lalmi. */
  yerTuriId?: string;
  manba?: string;
  kanal?: string;
  minMax?: string; // "Min" | "Max" | "both" | ""
  /** Efficiency range filter (0–100), applied when not full range. */
  effMin?: number | null;
  effMax?: number | null;
  /** When true, viloyat is not added to WHERE (layer is already region-specific). */
  skipRegionFilter?: boolean;
  /** When true, yil is not added (year-layer mode — DS is already per-year). */
  skipYearFilter?: boolean;
}

export interface ResolvedFeatureLayer {
  layer: AgriLayerLike;
  fields: string[];
  /** True when the layer title/url already identifies the selected region. */
  regionScoped: boolean;
  /** True when the layer title/url already identifies the selected year. */
  yearScoped: boolean;
}

export interface PickWhereWithMavsumFallbackResult {
  where: string;
  count: number;
  mavsumRelaxed: boolean;
  landTypeRelaxed?: boolean;
}

export interface PickWhereProgressiveResult {
  where: string;
  count: number;
  mavsumRelaxed: boolean;
  landTypeRelaxed: boolean;
}

export const MONTHLY_FIELDS: Array<{ field: string; month: number; key: string }> =
  [3, 4, 5, 6, 7, 8, 9, 10].map((month) => ({
    field: `uw${month}_m3`,
    month,
    key: `uw${month}_m3`,
  }));

/** Bar category → ndvi_status token (same mapping as AgriLocalization). */
export const VH_CATEGORY_TO_STATUS: Record<string, string> = {
  "1-Juda yaxshi": "juda_yaxshi",
  "2-Yaxshi": "yaxshi",
  "3-O'rta": "orta",
  "4-Past": "past",
};

/* ── Efficiency range ── */

export function resolveEfficiencyField(available: string[]): string | null {
  const lower = new Map(
    available.map((name) => [String(name).toLowerCase(), name]),
  );
  for (const candidate of ["eff", "efficiency", "wp_tot"]) {
    const hit = lower.get(candidate);
    if (hit) return hit;
  }
  return null;
}

export function clampEfficiencyValue(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function isEfficiencyRangeActive(
  min: number | null | undefined,
  max: number | null | undefined,
): boolean {
  if (min == null || max == null) return false;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  return min > 0 || max < 100;
}

export function buildEfficiencyRangeWhere(
  min: number | null | undefined,
  max: number | null | undefined,
  available: string[],
): string {
  if (!isEfficiencyRangeActive(min, max)) return "";
  const field =
    resolveEfficiencyField(available) ??
    (available.length === 0 ? "eff" : null);
  if (!field) return "";
  const lo = clampEfficiencyValue(Number(min));
  const hi = clampEfficiencyValue(Number(max));
  const safeMin = Math.min(lo, hi);
  const safeMax = Math.max(lo, hi);
  return `${field} >= ${safeMin} AND ${field} <= ${safeMax}`;
}

export function mergeEfficiencyIntoFilters(
  filters: AgriFilters,
  effMin: number | null | undefined,
  effMax: number | null | undefined,
): AgriFilters {
  if (!isEfficiencyRangeActive(effMin, effMax)) return filters;
  return {
    ...filters,
    effMin: clampEfficiencyValue(Number(effMin)),
    effMax: clampEfficiencyValue(Number(effMax)),
  };
}

/* ── Field metadata ── */

export function hasFieldIn(fields: string[], name: string): boolean {
  const target = name.toLowerCase();
  return fields.some((f) => String(f).toLowerCase() === target);
}

function layerFields(layer: AgriLayerLike | null | undefined): AgriFieldLike[] {
  return Array.isArray(layer?.fields) ? layer.fields : [];
}

export type TextMatchKind = "region" | "district" | "default";
export type LayerFieldKind = "numeric" | "string" | "unknown";

/**
 * Field type from layer metadata. Returns "unknown" when metadata is missing —
 * callers must NOT guess numeric in that case: an unquoted numeric literal on
 * a string field makes this server fail with "Unable to complete operation",
 * which silently kills the whole query (empty dropdowns, broken map filter).
 */
export function layerFieldKind(
  layer: AgriLayerLike | null | undefined,
  field: string,
): LayerFieldKind {
  const target = String(field || "").toLowerCase();
  const meta = layerFields(layer).find(
    (f) => String(f?.name || "").toLowerCase() === target,
  );
  if (!meta?.type) return "unknown";
  const t = String(meta.type).toLowerCase();
  if (
    t.includes("integer") ||
    t.includes("double") ||
    t.includes("single") ||
    t.includes("oid")
  ) {
    return "numeric";
  }
  return "string";
}

/* ── Spelling variants ── */

/** Apostrophe / quote variants so values like Farg'ona match all encodings. */
export function apostropheVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  // Same glyph set as agri-sql.normalizeApos (includes U+2018 Yakkabog‘).
  const base = raw.replace(/['‘’‚‛ʻʼʹ´′‵`]/g, "'");
  return Array.from(
    new Set([
      base,
      base.replace(/'/g, "’"),
      base.replace(/'/g, "`"),
      base.replace(/'/g, "ʻ"),
      base.replace(/'/g, "‘"),
      base.replace(/'/g, "ʼ"),
    ]),
  ).filter(Boolean);
}

function sortDistinctStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((v) => String(v).trim()).filter(Boolean)),
  ).sort((a, b) =>
    a.localeCompare(b, "uz", {
      sensitivity: "base",
      ignorePunctuation: true,
      numeric: true,
    }),
  );
}

/** Adds a value and all its apostrophe variants to a set. */
function variantCollector(expanded: Set<string>): (candidate: string) => void {
  return (candidate: string): void => {
    const clean = String(candidate ?? "").trim();
    if (!clean) return;
    expanded.add(clean);
    apostropheVariants(clean).forEach((variant) => expanded.add(variant));
  };
}

/** Region name variants for WHERE (viloyat / region_id). */
export function expandRegionVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const expanded = new Set<string>();
  const push = variantCollector(expanded);
  const hasCyrillic = /[Ѐ-ӿ]/.test(raw);
  const latinSuffix = " viloyati";
  const cyrSuffix = " вилояти";

  apostropheVariants(raw).forEach((variant) => {
    push(variant);
    const lower = variant.toLowerCase();
    if (hasCyrillic) {
      if (lower.endsWith(cyrSuffix)) {
        push(variant.slice(0, -cyrSuffix.length).trim());
      } else {
        push(`${variant}${cyrSuffix}`);
      }
    } else if (lower.endsWith(latinSuffix)) {
      push(variant.slice(0, -latinSuffix.length).trim());
    } else if (!lower.endsWith(" viloyat")) {
      push(`${variant}${latinSuffix}`);
    }
  });

  return sortDistinctStrings(Array.from(expanded));
}

const DISTRICT_SUFFIXES = [
  " tumani",
  " shahri",
  " shahar",
  " тумани",
  " шаҳри",
  " район",
];

/** District name variants for WHERE (tuman / distrct_id). */
export function expandDistrictVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const expanded = new Set<string>();
  const push = variantCollector(expanded);

  push(raw);
  const lower = raw.toLowerCase();
  for (const suf of DISTRICT_SUFFIXES) {
    if (lower.endsWith(suf.toLowerCase())) {
      push(raw.slice(0, raw.length - suf.length).trim());
    } else {
      push(`${raw}${suf}`);
    }
  }
  return sortDistinctStrings(Array.from(expanded));
}

/** Grouped mavsum labels (ikkilamchi / birlamchi) for OR clauses. */
export function getMavsumGroupedValues(selectedValue: string): string[] {
  const selected = String(selectedValue ?? "").trim();
  if (!selected) return [];

  const normalized = selected.toLowerCase().replace(/\s+/g, " ");
  const expandedValues = [selected];

  const isIkkilamchi =
    normalized.includes("ikkilamchi") ||
    normalized.includes("иккиламчи") ||
    normalized.includes("вторич");
  if (isIkkilamchi) {
    expandedValues.push(" Ikkilamchi", "Ikkilamchi");
  }

  const isBirlamchi =
    normalized.includes("birlamchi") ||
    normalized.includes("бирламчи") ||
    normalized.includes("первич");
  if (isBirlamchi) {
    expandedValues.push(
      "Birlamchi va umummavsumiy",
      "Umumiy va birlamchi mavsum",
    );
  }

  const unique = sortDistinctStrings(expandedValues);
  return unique.length ? unique : [selected];
}

export function buildTuriMapClause(
  sublayer: AgriLayerLike | null | undefined,
  turi: string | string[],
): string {
  const fields = layerFields(sublayer);
  const selectedTurlar = (Array.isArray(turi) ? turi : [turi])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  if (!selectedTurlar.length) return "";
  const turiField = fields.find(
    (f) => String(f?.name || "").toLowerCase() === "turi",
  );
  const turiFieldName = turiField?.name || (fields.length ? null : "turi");
  if (!turiFieldName) return "";
  // Pie sends canonical keys (bugdoy) — MapImage stores Bug'doy / Буғдой.
  const cropClauses = selectedTurlar.flatMap((value) =>
    getCropTuriMatchValues(value).flatMap((v) => {
      const variants = apostropheVariants(v);
      const values = variants.length ? variants : [v];
      return values.map(
        (literal) => `${turiFieldName}='${escapeArcGIS(literal)}'`,
      );
    }),
  );
  if (!cropClauses.length) return "";
  return cropClauses.length === 1
    ? cropClauses[0]
    : `(${cropClauses.join(" OR ")})`;
}

/* ── Distinct-value index ──
 * UI filter values (e.g. "Birlamchi va umummavsumiy", "Bog‘dod tumani") may
 * not match the layer's stored values exactly. We load the distinct values of
 * each filterable field once per layer and match UI values fuzzily against
 * them, so WHERE clauses use the layer's REAL values.
 */
export const VALUE_INDEX_FIELDS = [
  "season_id",
  "mavsum",
  "distrct_id",
  "district_id",
  "tuman",
  "region_id",
  "viloyat",
  "crop_id",
  "crop",
  "type_id",
  "type",
  "yer_turi",
  "full_name",
  "real_name",
  "real_n1",
  "minmax",
];
export const valueIndexCache = new Map<string, Record<string, string[]>>();
export const valueIndexLoading = new Map<string, Promise<void>>();

/** Aggressive normalization for value comparison (apostrophes, suffixes). */
export function normalizeValueToken(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’'`ʻ‘ʼ]/g, "")
    .replace(/\s+tumani\b/g, "")
    .replace(/\s+viloyati\b/g, "")
    .replace(/\s+shahri\b/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ]/g, "")
    .trim();
}

/**
 * Match a UI value against the layer's indexed distinct values of a field.
 * Returns: matched actual values; [] = index loaded but no match;
 * null = no index for this field (caller falls back to literal variants).
 */
export function matchIndexedValues(
  layer: AgriLayerLike | null | undefined,
  field: string,
  value: string,
): string[] | null {
  if (!layer) return null;
  const idx = valueIndexCache.get(getQueryUrl(layer));
  const vals = idx?.[field.toLowerCase()];
  if (!vals) return null;
  if (!vals.length) return [];
  const target = normalizeValueToken(value);
  if (!target) return [];

  const exact = vals.filter((v) => normalizeValueToken(v) === target);
  if (exact.length) return exact;

  return vals.filter((v) => {
    const n = normalizeValueToken(v);
    return (
      n.length >= 3 &&
      target.length >= 3 &&
      (n.includes(target) || target.includes(n))
    );
  });
}

/** Exact OR clause across all available aliases (e.g. season_id + mavsum). */
export function exactOrClause(
  fieldAliases: string[],
  values: string[],
  available: string[],
  numeric = false,
): string {
  const fields = fieldAliases.filter((f) => hasFieldIn(available, f));
  if (!fields.length || !values.length) return "";
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const field of fields) {
    for (const v of values) {
      const raw = String(v ?? "").trim();
      if (!raw) continue;
      let term = "";
      if (numeric) {
        const digits = raw.replace(/[^\d]/g, "");
        if (!digits || isNaN(Number(digits))) continue;
        term = `${field}=${Number(digits)}`;
      } else {
        term = `${field}='${escapeArcGIS(raw)}'`;
      }
      if (term && !seen.has(term)) {
        seen.add(term);
        terms.push(term);
      }
    }
  }
  if (!terms.length) return "";
  return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
}

/* ── Farmer tax number / land type ── */

export const FARMER_TAX_NUMBER_FIELD = "tax_number";
export const FARMER_TAX_NUMBER_DIGITS = 9;

export function normalizeFarmerTaxSearchValue(value: string): string {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, FARMER_TAX_NUMBER_DIGITS);
}

export function normalizeLandTypeValue(value: string): "" | "sugoriladigan" | "lalmi" {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’`ʻ‘ʼ]/g, "'")
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, "");
  if (!normalized || normalized === "barchasi" || normalized === "umumiy") {
    return "";
  }
  if (normalized === "1" || normalized.includes("sugor")) {
    return "sugoriladigan";
  }
  if (normalized === "2" || normalized.includes("lalmi")) return "lalmi";
  return "";
}

export function landTypeIdForValue(value: string): string {
  const key = normalizeLandTypeValue(value);
  if (key === "sugoriladigan") return "1";
  if (key === "lalmi") return "2";
  return "";
}

/** True when a specific land type is selected (not Barchasi / empty). */
export function hasActiveLandTypeFilter(
  yerTuri?: string | null,
  yerTuriId?: string | null,
): boolean {
  return !!(
    normalizeLandTypeValue(String(yerTuriId ?? "")) ||
    normalizeLandTypeValue(String(yerTuri ?? ""))
  );
}
