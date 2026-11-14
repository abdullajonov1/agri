/**
 * Shared field / WHERE helpers of the Excel report queries (query-stats.ts,
 * query-farmer.ts). Field names are always read from the layer itself.
 */
import {
  buildYearLikeClause,
  joinAndClauses,
} from "../../../../../../controller/agri-where-builder";
import { buildTumanEqualsSql, eqAposSmart } from "../../../../../../data/agri-sql";
import type { AgriRegionDistrictMappingRow } from "../../../../../../gis/agri-table-data-source";
import { agroV5Log } from "../../../../../../gis/agri-debug-log";
import { combineAccessWhereIfFieldsExist } from "../../../../../../shared/agri-access-config";
import { sameReportPlace } from "./place-key";
import type { ReportScope } from "./types";

export type LayerLike = {
  fields?: Array<{ name?: string; type?: string }>;
  objectIdField?: string;
  url?: string;
  createQuery: () => __esri.Query;
  queryFeatures: (q: __esri.Query) => Promise<{ features?: __esri.Graphic[] }>;
};

export type FieldRef = { name: string; type: string };

/**
 * Opt-in trace of a report query (`window.__AGRO_V5_DEBUG = true`). Only the
 * query shape and the row count are logged — never attribute values (farmer
 * names / INN must not end up in the console).
 */
export function reportLog(phase: string, detail?: Record<string, unknown>): void {
  agroV5Log(`[Excel] ${phase}`, detail);
}

export async function runQuery(
  label: string,
  L: LayerLike,
  q: __esri.Query,
): Promise<__esri.Graphic[]> {
  const features = (await L.queryFeatures(q))?.features || [];
  reportLog(label, {
    url: L.url,
    where: q.where,
    groupBy: q.groupByFieldsForStatistics,
    rows: features.length,
  });
  return features;
}

export const layerFieldNames = (layer: LayerLike): string[] =>
  (layer.fields || []).map((f) => String(f?.name || ""));

const NUMERIC_FIELD_TYPES = new Set([
  "small-integer",
  "integer",
  "big-integer",
  "single",
  "double",
  "long",
  "oid",
  "esrifieldtypesmallinteger",
  "esrifieldtypeinteger",
  "esrifieldtypedouble",
  "esrifieldtypesingle",
]);

export function layerField(layer: LayerLike, ...names: string[]): FieldRef | null {
  for (const name of names) {
    const wanted = name.toLowerCase();
    for (const f of layer.fields || []) {
      const n = String(f?.name || "");
      if (n.toLowerCase() === wanted) {
        return { name: n, type: String(f?.type || "").toLowerCase() };
      }
    }
  }
  return null;
}

function isNumericField(field: FieldRef): boolean {
  return NUMERIC_FIELD_TYPES.has(field.type);
}

function readAttr(attrs: Record<string, unknown>, name: string): unknown {
  if (name in attrs) return attrs[name];
  const wanted = name.toLowerCase();
  for (const key of Object.keys(attrs)) {
    if (key.toLowerCase() === wanted) return attrs[key];
  }
  return undefined;
}

export function readNum(attrs: Record<string, unknown>, name: string): number {
  const n = Number(readAttr(attrs, name));
  return Number.isFinite(n) ? n : 0;
}

export function readStr(attrs: Record<string, unknown>, name: string): string {
  const v = readAttr(attrs, name);
  return v == null ? "" : String(v).trim();
}

/** Geo columns of one layer: name field and/or numeric code field. */
export type GeoFields = { name: FieldRef | null; code: FieldRef | null };

export function geoFields(layer: LayerLike, level: "viloyat" | "tuman"): GeoFields {
  return level === "viloyat"
    ? { name: layerField(layer, "viloyat"), code: layerField(layer, "region") }
    : { name: layerField(layer, "tuman"), code: layerField(layer, "district") };
}

/**
 * agri_crop geo: `region`/`district` are place names; codes are region_id /
 * distrct_id (typo in the service schema).
 */
export function cropPlanGeoFields(layer: LayerLike, level: "viloyat" | "tuman"): GeoFields {
  return level === "viloyat"
    ? {
        name: layerField(layer, "region", "viloyat"),
        code: layerField(layer, "region_id"),
      }
    : {
        name: layerField(layer, "district", "tuman"),
        code: layerField(layer, "distrct_id", "district_id"),
      };
}

function cropPlanViloyatClause(
  layer: LayerLike,
  viloyat: string,
  mappings: AgriRegionDistrictMappingRow[],
): string {
  if (!viloyat) return "";
  const nameField = layerField(layer, "region", "viloyat");
  if (nameField) return eqAposSmart(nameField.name, viloyat);
  const codeField = layerField(layer, "region_id");
  const code = mappings.find((m) => sameReportPlace(m.viloyat, viloyat))?.region;
  if (codeField && Number.isFinite(code)) return `${codeField.name} = ${code}`;
  return "";
}

function cropPlanTumanClause(layer: LayerLike, tuman: string): string {
  if (!tuman) return "";
  const nameField = layerField(layer, "district", "tuman");
  if (nameField) return buildTumanEqualsSql(nameField.name, tuman);
  const codeField = layerField(layer, "distrct_id", "district_id");
  if (codeField && /^\d+$/.test(tuman)) return `${codeField.name} = ${Number(tuman)}`;
  return "";
}

export function cropPlanScopeWhere(
  layer: LayerLike,
  scope: ReportScope,
  mappings: AgriRegionDistrictMappingRow[],
  extra: string[] = [],
): string {
  const clauses = [
    yearClause(layer, scope.yil),
    cropPlanViloyatClause(layer, scope.viloyat, mappings),
    cropPlanTumanClause(layer, String(scope.tuman || "").trim()),
    ...extra,
  ].filter(Boolean);
  return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), layerFieldNames(layer));
}

/**
 * Resolves a grouped row to a place name. Text names win; numeric values
 * (or a code-only layer) go through the Agri_table region/district mapping.
 */
export function placeResolver(
  level: "viloyat" | "tuman",
  fields: GeoFields,
  mappings: AgriRegionDistrictMappingRow[],
): (attrs: Record<string, unknown>) => string {
  const byCode = new Map<number, string>();
  for (const m of mappings) {
    const code = level === "viloyat" ? m.region : m.district;
    const name = level === "viloyat" ? m.viloyat : m.tuman;
    if (Number.isFinite(code) && name && !byCode.has(code)) byCode.set(code, name);
  }
  return (attrs) => {
    const name = fields.name ? readStr(attrs, fields.name.name) : "";
    if (name && !/^\d+$/.test(name)) return name;
    const codeRaw = fields.code ? readStr(attrs, fields.code.name) : name;
    const code = Number(codeRaw);
    return Number.isFinite(code) ? byCode.get(code) || "" : "";
  };
}

function yearClause(layer: LayerLike, yil: string): string {
  const field = layerField(layer, "yil", "year");
  if (!field) return "";
  const digits = String(yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
  if (isNumericField(field) && digits) return `${field.name} = ${Number(digits)}`;
  return buildYearLikeClause(yil, { field: field.name });
}

function viloyatClause(
  layer: LayerLike,
  viloyat: string,
  mappings: AgriRegionDistrictMappingRow[],
): string {
  if (!viloyat) return "";
  const nameField = layerField(layer, "viloyat");
  if (nameField) return eqAposSmart(nameField.name, viloyat);
  const codeField = layerField(layer, "region");
  const code = mappings.find((m) => sameReportPlace(m.viloyat, viloyat))?.region;
  if (codeField && Number.isFinite(code)) return `${codeField.name} = ${code}`;
  return "";
}

export function scopeWhere(
  layer: LayerLike,
  scope: ReportScope,
  mappings: AgriRegionDistrictMappingRow[],
  extra: string[] = [],
): string {
  const clauses = [
    yearClause(layer, scope.yil),
    viloyatClause(layer, scope.viloyat, mappings),
    ...extra,
  ].filter(Boolean);
  return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), layerFieldNames(layer));
}

export function groupByList(fields: GeoFields, ...extra: Array<FieldRef | null>): string[] {
  return [fields.name, fields.code, ...extra]
    .filter((f): f is FieldRef => Boolean(f))
    .map((f) => f.name);
}

export function scopeLevel(scope: ReportScope): "viloyat" | "tuman" {
  return scope.viloyat ? "tuman" : "viloyat";
}
