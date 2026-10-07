/**
 * Selection → Hosted/regions + district WHERE candidates, plus the
 * client-side guard that drops district features from neighbouring viloyats.
 */
import { escapeLikeLiteral, normalizeApos } from "../../data/agri-sql";
import { canonicalizeRegionFilterValue } from "../feature-layer-data";
import type { AgriAttributes } from "../agri-layer-types";
import {
  DISTRICT_CODE_FIELDS,
  DISTRICT_LABEL_FIELD_PREF,
  DISTRICT_NAME_FIELDS,
  DISTRICT_PARENT_COD_FIELDS,
  DISTRICT_REGION_NAME_FIELDS,
  DISTRICT_SOATO_FIELDS,
  REGION_PARENT_COD_FIELDS,
  type FieldsSource,
  buildNumericOrStringEquals,
  equalsAnyEscaped,
  escapeSql,
  expandDistrictNameVariants,
  expandRegionNameVariants,
  fieldValueKind,
  findFieldMeta,
  hostedParentCodFromName,
  pickField,
  pickFields,
} from "./boundary-fields";

export interface AgriAdminBoundarySelection {
  viloyat?: string | null;
  tuman?: string | null;
  /** Numeric region code from Agri_table_data (`region`). */
  regionCode?: number | string | null;
  /** Numeric district code from Agri_table_data (`district`). */
  districtCode?: number | string | null;
  /** All tuman display keys for the selected viloyat (from Agri_table map). */
  districtNames?: string[] | null;
  /** All district SOATO codes for the selected viloyat. */
  districtCodes?: Array<number | string> | null;
}

export interface DistrictWhereAttempt {
  where: string;
  mode: string;
  field: string | null;
}

export interface ViloyatDistrictFilter {
  parentCod: number | null;
  viloyat: string;
  districtNames: string[];
  districtCodes: Array<number | string>;
}

/** 4-digit region prefix of a parent code, or "". */
function regionPrefix(parentCod: number | null): string {
  return parentCod != null && Number.isFinite(parentCod)
    ? String(Math.trunc(parentCod))
    : "";
}

/** Half-open numeric SOATO range covering every district of a region. */
export function soatoRangeForPrefix(prefix: string): { lo: number; hi: number } {
  return { lo: Number(prefix) * 1000, hi: (Number(prefix) + 1) * 1000 };
}

/**
 * Resolve a single Hosted/regions `parent_cod`.
 * Prefer Agri_table_data `region` (same coding as Hosted), then name→code via
 * Agrobank regions.json — never the official SOATO table (codes differ).
 */
export function resolveRegionParentCod(
  selection: AgriAdminBoundarySelection,
): number | null {
  const fromMap = String(selection.regionCode ?? "").trim();
  if (/^\d{4}$/.test(fromMap)) {
    const n = Number(fromMap);
    if (Number.isFinite(n)) return n;
  }

  const viloyat = canonicalizeRegionFilterValue(
    String(selection.viloyat ?? "").trim(),
  );
  if (/^\d{4}$/.test(viloyat)) {
    // Numeric codes coming from UI / agri are Hosted parent_cod, not SOATO.
    const n = Number(viloyat);
    return Number.isFinite(n) ? n : null;
  }

  return hostedParentCodFromName(viloyat);
}

/**
 * Numeric district SOATO for Tuman_chegara / Hosted borders.
 * Prefer an explicit `selection.districtCode` from Agri_table maps (scoped by
 * viloyat). Fall back to a numeric `tuman` string when the UI selection itself
 * is a district id.
 */
export function resolveDistrictCode(
  selection: AgriAdminBoundarySelection,
): string | null {
  const fromSelection = String(selection.districtCode ?? "").trim();
  if (/^\d+$/.test(fromSelection)) return fromSelection;
  const tuman = String(selection.tuman ?? "").trim();
  if (/^\d+$/.test(tuman)) return tuman;
  return null;
}

export function resolveRegionWhere(
  layer: FieldsSource | null | undefined,
  parentCod: number | null,
): string {
  if (parentCod == null || !Number.isFinite(parentCod)) return "1=0";
  const field = pickField(layer, REGION_PARENT_COD_FIELDS) || "parent_cod";
  return buildNumericOrStringEquals(field, parentCod);
}

function soatoAttempts(
  layer: FieldsSource | null | undefined,
  prefix: string,
  codes: string[],
): DistrictWhereAttempt[] {
  const attempts: DistrictWhereAttempt[] = [];
  for (const field of pickFields(layer, DISTRICT_SOATO_FIELDS)) {
    const kind = fieldValueKind(layer, field);
    if (/^\d{4}$/.test(prefix) && kind !== "number") {
      attempts.push({
        where: `${field} LIKE '${escapeLikeLiteral(prefix)}%'`,
        mode: `soato-prefix:${field}`,
        field,
      });
    }
    if (/^\d{4}$/.test(prefix) && kind !== "string") {
      const { lo, hi } = soatoRangeForPrefix(prefix);
      attempts.push({
        where: `(${field} >= ${lo} AND ${field} < ${hi})`,
        mode: `soato-range:${field}`,
        field,
      });
    }
    if (codes.length && kind !== "number") {
      attempts.push({
        where: `${field} IN (${codes.map((c) => `'${escapeSql(c)}'`).join(",")})`,
        mode: `code-list-text:${field}`,
        field,
      });
    }
    if (codes.length && kind !== "string") {
      attempts.push({
        where: `${field} IN (${codes.join(",")})`,
        mode: `code-list-num:${field}`,
        field,
      });
    }
  }
  return attempts;
}

function regionLinkAttempts(
  layer: FieldsSource | null | undefined,
  prefix: string,
  viloyat: string,
): DistrictWhereAttempt[] {
  const attempts: DistrictWhereAttempt[] = [];
  const regionNameVariants = expandRegionNameVariants(viloyat);
  for (const field of pickFields(layer, [
    ...DISTRICT_PARENT_COD_FIELDS,
    ...DISTRICT_REGION_NAME_FIELDS,
  ])) {
    const kind = fieldValueKind(layer, field);
    if (prefix && kind !== "string") {
      attempts.push({
        where: `${field} = ${Number(prefix)}`,
        mode: `region-num:${field}`,
        field,
      });
    }
    if (prefix && kind !== "number") {
      attempts.push({
        where: `${field} = '${escapeSql(prefix)}'`,
        mode: `region-text:${field}`,
        field,
      });
    }
    if (regionNameVariants.length && kind !== "number") {
      attempts.push({
        where: equalsAnyEscaped(field, regionNameVariants),
        mode: `region-name:${field}`,
        field,
      });
    }
  }
  return attempts;
}

/**
 * Every WHERE we are willing to try for "all districts of this viloyat",
 * strongest first. Each attempt targets a single field with a single value
 * kind — mixing text and numeric comparisons made the whole expression fail
 * ("Invalid data type for expression [district < 1725000]").
 */
export function buildDistrictWhereAttempts(
  layer: FieldsSource | null | undefined,
  opts: ViloyatDistrictFilter,
): DistrictWhereAttempt[] {
  const { parentCod, viloyat, districtNames, districtCodes } = opts;
  const prefix = regionPrefix(parentCod);
  const codes = districtCodes
    .map((c) => Number(c))
    .filter((n) => Number.isFinite(n))
    .map((n) => String(n));

  const attempts: DistrictWhereAttempt[] = [
    ...soatoAttempts(layer, prefix, codes),
    // Region link fields: numeric parent_cod or the viloyat name.
    ...regionLinkAttempts(layer, prefix, viloyat),
  ];

  // District names last — spelling differences make these the least reliable.
  const nameVariants = expandDistrictNameVariants(districtNames);
  if (nameVariants.length) {
    for (const field of pickFields(layer, DISTRICT_NAME_FIELDS)) {
      if (fieldValueKind(layer, field) === "number") continue;
      attempts.push({
        where: equalsAnyEscaped(field, nameVariants),
        mode: `name-list:${field}`,
        field,
      });
    }
  }

  return attempts.filter((a) => a.where && a.where !== "1=0");
}

/**
 * Clause that keeps a query inside the selected viloyat, so a district name
 * that exists in two regions (Qamashi / Yakkabog') cannot resolve elsewhere.
 */
export function buildRegionScopeClause(
  layer: FieldsSource | null | undefined,
  parentCod: number | null,
  viloyat: string,
): string | null {
  const prefix = regionPrefix(parentCod);
  if (/^\d{4}$/.test(prefix)) {
    const [field] = pickFields(layer, DISTRICT_SOATO_FIELDS);
    if (field) {
      if (fieldValueKind(layer, field) === "number") {
        const { lo, hi } = soatoRangeForPrefix(prefix);
        return `(${field} >= ${lo} AND ${field} < ${hi})`;
      }
      return `${field} LIKE '${escapeLikeLiteral(prefix)}%'`;
    }
  }
  const regionNames = expandRegionNameVariants(viloyat);
  if (regionNames.length) {
    for (const field of pickFields(layer, DISTRICT_REGION_NAME_FIELDS)) {
      if (fieldValueKind(layer, field) === "number") continue;
      return equalsAnyEscaped(field, regionNames);
    }
  }
  return null;
}

/** WHERE candidates for one selected tuman, strongest first. */
export function buildSingleDistrictAttempts(
  layer: FieldsSource | null | undefined,
  opts: {
    tuman: string;
    districtCode: string | null;
    parentCod: number | null;
    viloyat: string;
  },
): DistrictWhereAttempt[] {
  const { tuman, districtCode, parentCod, viloyat } = opts;
  const attempts: DistrictWhereAttempt[] = [];
  const scope = buildRegionScopeClause(layer, parentCod, viloyat);
  const scoped = (where: string) => (scope ? `(${where}) AND ${scope}` : where);

  const code = String(districtCode ?? "").trim();
  if (/^\d+$/.test(code)) {
    for (const field of pickFields(layer, DISTRICT_SOATO_FIELDS)) {
      const kind = fieldValueKind(layer, field);
      if (kind !== "number") {
        attempts.push({
          where: `${field} = '${escapeSql(code)}'`,
          mode: `district-code-text:${field}`,
          field,
        });
      }
      if (kind !== "string") {
        attempts.push({
          where: `${field} = ${Number(code)}`,
          mode: `district-code-num:${field}`,
          field,
        });
      }
    }
  }

  const nameVariants = expandDistrictNameVariants([tuman]);
  if (nameVariants.length && !/^\d+$/.test(tuman)) {
    for (const field of pickFields(layer, DISTRICT_NAME_FIELDS)) {
      if (fieldValueKind(layer, field) === "number") continue;
      attempts.push({
        where: scoped(equalsAnyEscaped(field, nameVariants)),
        mode: `district-name:${field}`,
        field,
      });
    }
  }

  return attempts.filter((a) => a.where && a.where !== "1=0");
}

/** Case-insensitive attribute reader (exact key first). */
function attributeReader(attrs: AgriAttributes): (key: string) => unknown {
  const lowerAttrs = new Map<string, unknown>();
  for (const [k, v] of Object.entries(attrs)) {
    lowerAttrs.set(String(k).toLowerCase(), v);
  }
  return (key: string) => attrs[key] ?? lowerAttrs.get(String(key).toLowerCase());
}

function matchesDistrictCode(
  getAttr: (key: string) => unknown,
  codeSet: Set<string>,
  prefix: string,
): boolean {
  for (const key of DISTRICT_SOATO_FIELDS) {
    const raw = getAttr(key);
    if (raw == null || raw === "") continue;
    const asStr = String(raw).trim();
    if (codeSet.has(String(Number(raw))) || codeSet.has(asStr)) return true;
    if (prefix && /^\d+$/.test(asStr) && asStr.startsWith(prefix)) return true;
  }
  return false;
}

function matchesParentCod(
  getAttr: (key: string) => unknown,
  parentCod: number | null,
  prefix: string,
): boolean {
  for (const key of DISTRICT_PARENT_COD_FIELDS) {
    const raw = getAttr(key);
    if (raw == null || raw === "") continue;
    if (parentCod != null && Number(raw) === Number(parentCod)) return true;
    if (prefix && String(raw).trim() === prefix) return true;
  }
  return false;
}

function matchesAnyName(
  getAttr: (key: string) => unknown,
  keys: string[],
  names: Set<string>,
  allowTumaniSuffix: boolean,
): boolean {
  if (!names.size) return false;
  for (const key of keys) {
    const raw = String(getAttr(key) ?? "").trim();
    if (!raw) continue;
    if (names.has(normalizeApos(raw).toLowerCase())) return true;
    if (!allowTumaniSuffix) continue;
    const base = normalizeApos(raw)
      .replace(/\s+tumani$/i, "")
      .trim()
      .toLowerCase();
    if (base && names.has(base)) return true;
  }
  return false;
}

/** Keep only features that belong to the selected viloyat (client-side guard). */
export function featureBelongsToViloyat(
  attrs: AgriAttributes | null | undefined,
  opts: ViloyatDistrictFilter,
): boolean {
  if (!attrs) return false;
  const { parentCod, viloyat, districtNames, districtCodes } = opts;
  const getAttr = attributeReader(attrs);
  const prefix = regionPrefix(parentCod);
  const codeSet = new Set(
    districtCodes
      .map((c) => String(Number(c)))
      .filter((s) => s && s !== "NaN"),
  );
  if (matchesDistrictCode(getAttr, codeSet, prefix)) return true;
  if (matchesParentCod(getAttr, parentCod, prefix)) return true;

  // Text region link (`viloyat_no` = "Sirdaryo").
  const regionNames = new Set(
    expandRegionNameVariants(viloyat).map((n) => n.toLowerCase()),
  );
  if (matchesAnyName(getAttr, DISTRICT_REGION_NAME_FIELDS, regionNames, false)) {
    return true;
  }

  const nameSet = new Set(
    expandDistrictNameVariants(districtNames).map((n) =>
      normalizeApos(n).toLowerCase(),
    ),
  );
  return matchesAnyName(
    getAttr,
    [...DISTRICT_LABEL_FIELD_PREF, ...DISTRICT_NAME_FIELDS],
    nameSet,
    true,
  );
}

export function filterDistrictFeaturesToViloyat<
  T extends { attributes?: AgriAttributes | null },
>(features: T[], opts: ViloyatDistrictFilter): T[] {
  if (!features?.length) return [];
  const filtered = features.filter((f) =>
    featureBelongsToViloyat(f?.attributes, opts),
  );
  // If every feature was dropped (schema mismatch), fall back only when the
  // attribute filter had nothing to match on — otherwise keep empty.
  if (
    !filtered.length &&
    !opts.districtCodes.length &&
    opts.parentCod == null &&
    !opts.districtNames.length
  ) {
    return features;
  }
  return filtered;
}

/**
 * Max districts we ever expect for one viloyat (guards against 1=1 / spatial).
 * Border services also carry city polygons (Guliston, Yangiyer, Shirin) that
 * the Agri district map does not list, so allow generous headroom.
 */
export function maxDistrictsForViloyat(districtCodes: Array<number | string>): number {
  const n = districtCodes.length;
  return n > 0 ? Math.min(60, n + 12) : 30;
}

export function resolveDistrictWhere(
  layer: FieldsSource | null | undefined,
  districtCode: string | null,
  tumanName?: string | null,
): string {
  const trimmedName = String(tumanName ?? "").trim();

  // Named selection → Hosted/district name fields (authoritative for zoom).
  if (trimmedName && !/^\d+$/.test(trimmedName)) {
    const normalized = normalizeApos(trimmedName);
    const base = normalized.replace(/\s+tumani$/i, "").trim();
    const nameValues = Array.from(
      new Set(
        [trimmedName, normalized, base, base ? `${base} tumani` : ""].filter(
          Boolean,
        ),
      ),
    );
    const nameField = pickField(layer, DISTRICT_NAME_FIELDS);
    if (nameField) return equalsAnyEscaped(nameField, nameValues);

    // Some Hosted layers store the district *name* in `district` (string).
    const codeField = pickField(layer, DISTRICT_CODE_FIELDS) || "district";
    const codeFieldMeta = findFieldMeta(layer, codeField);
    const codeType = String(codeFieldMeta?.type || "").toLowerCase();
    if (codeType.includes("string") || !codeFieldMeta) {
      return equalsAnyEscaped(codeField, nameValues);
    }
  }

  if (!districtCode) return "1=0";
  const field = pickField(layer, DISTRICT_CODE_FIELDS) || "district";
  return `${field} = '${escapeSql(districtCode)}'`;
}
