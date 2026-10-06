/**
 * Admin-boundary schema knowledge: candidate field names on Hosted/regions,
 * Hosted/district and Tuman_chegara, field-kind detection, and the region /
 * district name spelling variants used to build WHERE clauses.
 */
import { normalizeApos } from "../../data/agri-sql";
import {
  REGION_SOATO_TO_UZ_NAME,
  normalizeRegionToken,
  regionAliasTokens,
} from "../feature-layer/region-names";
import type { AgriFieldLike } from "../agri-layer-types";

/** Anything with an ArcGIS `fields` array (FeatureLayer, Sublayer, …). */
export interface FieldsSource {
  fields?: AgriFieldLike[] | null;
}

/** District → parent region link — numeric parent only (not free-text `region`). */
export const DISTRICT_PARENT_COD_FIELDS = [
  "parent_cod",
  "PARENT_COD",
  "region_cod",
  "region_code",
  "reg_code",
  "viloyat_cod",
  "parent",
];

/** Same field as Agrobank / eco-monitoring / geo-react admin outlines. */
export const REGION_PARENT_COD_FIELDS = ["parent_cod", "PARENT_COD"];
export const DISTRICT_CODE_FIELDS = ["district", "DISTRICT"];
/** SOATO / district code fields (Tuman_chegara uses `soato`, both are text). */
export const DISTRICT_SOATO_FIELDS = [
  "soato",
  "SOATO",
  ...DISTRICT_CODE_FIELDS,
  "district_cod",
  "district_code",
];
/** Region link fields that hold the viloyat *name* (Tuman_chegara `viloyat_no`). */
export const DISTRICT_REGION_NAME_FIELDS = [
  "viloyat_no",
  "viloyat_nomi",
  "viloyat_uz",
  "viloyat",
  "region_name",
  "region",
];
/** District name fields — `tuman_nomi` / `label` are the Tuman_chegara ones. */
export const DISTRICT_NAME_FIELDS = [
  "tuman_nomi",
  "label",
  "name_uz",
  "name_lat",
  "name_ru",
  "name",
  "nomi",
  "tuman",
  "district_name",
  "NAME",
  // Tuman_chegara / Evapo-style schemas
  "tuman_uz",
  "tuman_lat",
  "tuman_ru",
  "tuman_en",
  "district_uz",
  "district_lat",
];
/** Map label preference: Latin first (dashboard default), then Cyrillic / RU. */
export const DISTRICT_LABEL_FIELD_PREF = [
  "tuman_nomi",
  "label",
  "name_lat",
  "name_uz",
  "tuman_lat",
  "tuman_uz",
  "name_ru",
  "tuman_ru",
  "name",
  "nomi",
  "tuman",
  "district_name",
  "NAME",
  "tuman_en",
  "district_uz",
  "district_lat",
];

/**
 * Hosted/regions `parent_cod` for a viloyat label. Uses the Agri region table
 * (same coding as Hosted) — NOT the official SOATO table (codes differ).
 */
export function hostedParentCodFromName(name: string): number | null {
  const matchTokens = regionAliasTokens(name);
  if (!matchTokens.size) return null;

  // Prefer city over viloyat when token is just "toshkent" and user said shahri.
  const rawLower = String(name ?? "").toLowerCase();
  const preferCity =
    /shahri|shahar|city|г\./i.test(rawLower) ||
    normalizeRegionToken(name).endsWith("sh");

  let fallback: number | null = null;
  for (const [code, label] of Object.entries(REGION_SOATO_TO_UZ_NAME)) {
    const labelToken = normalizeRegionToken(label);
    if (!labelToken || !matchTokens.has(labelToken)) continue;
    const isCity = /shahri|shahar|city/i.test(label) || labelToken.endsWith("sh");
    const n = Number(code);
    if (preferCity === isCity) return Number.isFinite(n) ? n : null;
    if (fallback == null && Number.isFinite(n)) fallback = n;
  }
  return fallback;
}

function fieldsOf(layer: FieldsSource | null | undefined): AgriFieldLike[] {
  return Array.isArray(layer?.fields) ? layer.fields : [];
}

export function pickField(
  layer: FieldsSource | null | undefined,
  candidates: string[],
): string | null {
  const lower = new Map(
    fieldsOf(layer).map((f) => [
      String(f?.name || "").toLowerCase(),
      String(f?.name || ""),
    ]),
  );
  for (const candidate of candidates) {
    const hit = lower.get(candidate.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

/** All present fields from a candidate list, in candidate order. */
export function pickFields(
  layer: FieldsSource | null | undefined,
  candidates: string[],
): string[] {
  const out: string[] = [];
  for (const candidate of candidates) {
    const hit = pickField(layer, [candidate]);
    if (hit && !out.includes(hit)) out.push(hit);
  }
  return out;
}

export function findFieldMeta(
  layer: FieldsSource | null | undefined,
  field: string,
): AgriFieldLike | undefined {
  const target = String(field || "").toLowerCase();
  return fieldsOf(layer).find(
    (f) => String(f?.name || "").toLowerCase() === target,
  );
}

export type BoundaryFieldKind = "string" | "number" | "unknown";

/**
 * "string" / "number" / "unknown" for a layer field.
 * Tuman_chegara stores `soato` / `district` as text — numeric comparisons
 * there fail with "Invalid data type for expression".
 */
export function fieldValueKind(
  layer: FieldsSource | null | undefined,
  field: string,
): BoundaryFieldKind {
  const type = String(findFieldMeta(layer, field)?.type || "").toLowerCase();
  if (!type) return "unknown";
  if (type.includes("string") || type.includes("text")) return "string";
  if (
    ["integer", "double", "single", "number", "small", "long"].some((t) =>
      type.includes(t),
    )
  ) {
    return "number";
  }
  return "unknown";
}

export function escapeSql(value: string): string {
  return String(value ?? "").replace(/'/g, "''");
}

export function equalsAnyEscaped(field: string, values: string[]): string {
  const parts = values
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .map((v) => `${field}='${escapeSql(v)}'`);
  if (!parts.length) return "1=0";
  return parts.length === 1 ? parts[0] : `(${parts.join(" OR ")})`;
}

/** Integer or text `parent_cod` — PBF tiles were strict about the unquoted form. */
export function buildNumericOrStringEquals(field: string, value: number): string {
  const raw = String(value);
  return `(${field} = ${raw} OR ${field} = '${escapeSql(raw)}')`;
}

/** Viloyat display spellings for text region fields (`viloyat_no`). */
export function expandRegionNameVariants(viloyat: string): string[] {
  const raw = String(viloyat || "").trim();
  if (!raw) return [];
  const normalized = normalizeApos(raw);
  const base = normalized
    .replace(/\s+(viloyati|viloyat|shahri|respublikasi)$/i, "")
    .trim();
  const out = new Set<string>();
  for (const value of [
    raw,
    normalized,
    base,
    base ? `${base} viloyati` : "",
    base ? `${base} vil.` : "",
  ]) {
    if (!value) continue;
    out.add(value);
    // Services mix ' / ʻ / ’ for Farg'ona, Qoraqalpog'iston …
    out.add(value.replace(/['’ʻ`]/g, "'"));
    out.add(value.replace(/['’ʻ`]/g, "ʻ"));
    out.add(value.replace(/['’ʻ`]/g, "’"));
  }
  return Array.from(out);
}

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Expand tuman keys into Hosted/district name spellings (same as single-tuman zoom). */
export function expandDistrictNameVariants(names: string[]): string[] {
  const out = new Set<string>();
  for (const raw of names) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) continue;
    const normalized = normalizeApos(trimmed);
    const base = normalized.replace(/\s+tumani$/i, "").trim();
    const titled = base ? titleCaseWords(base) : "";
    for (const value of [
      trimmed,
      normalized,
      base,
      base ? `${base} tumani` : "",
      titled,
      titled ? `${titled} tumani` : "",
    ]) {
      if (value) out.add(value);
    }
  }
  return Array.from(out);
}
