import {
  buildYearLikeClause,
  joinAndClauses,
} from "../../../../../../controller/agri-where-builder";
import { buildTumanEqualsSql, eqAposSmart } from "../../../../../../data/agri-sql";
import {
  getAgriTableDataLayer,
  queryAgriRegionDistrictMappings,
  queryAgriTuriCropMappings,
  type AgriRegionDistrictMappingRow,
} from "../../../../../../gis/agri-table-data-source";
import { getAgriCropPlanLayer } from "../../../../../../gis/agri-crop-plan-data-source";
import { getAgriReserveLandLayer } from "../../../../../../gis/agri-reserve-land-data-source";
import { getAgriUnusedLandLayer } from "../../../../../../gis/agri-unused-land-data-source";
import { normalizeLandTypeValue } from "../../../../../../gis/feature-layer/where-values";
import { featureAttributeBag } from "../../../../../../gis/agri-layer-types";
import { combineAccessWhereIfFieldsExist } from "../../../../../../shared/agri-access-config";
import { asStatisticDefinitions } from "../../../../../../shared/agri-plain-object";
import {
  buildTurlarSqlClause,
  getTuriCropLookupKey,
} from "../../../../../../shared/agri-crop-labels";
import { reportPlaceKey, sameReportPlace } from "./place-key";
import type {
  CropAreaRow,
  FarmerRow,
  PlanAreaRow,
  ReportGeoRow,
  ReportScope,
  ReserveAreaRow,
  UnusedAreaRow,
} from "./types";

type LayerLike = {
  fields?: Array<{ name?: string; type?: string }>;
  objectIdField?: string;
  createQuery: () => any;
  queryFeatures: (q: any) => Promise<{ features?: any[] }>;
};

type FieldRef = { name: string; type: string };

/** One summary line per report query so empty sheets can be traced from DevTools. */
async function runQuery(label: string, L: LayerLike, q: any): Promise<any[]> {
  const features = (await L.queryFeatures(q))?.features || [];
  try {
    console.info(`[Agro Excel] ${label}`, {
      url: (L as { url?: string }).url,
      fields: (L.fields || []).map((f) => `${f?.name}:${f?.type}`),
      where: q.where,
      groupBy: q.groupByFieldsForStatistics,
      rows: features.length,
      sample: features.slice(0, 3).map((f: any) => f?.attributes),
    });
  } catch {
    /* logging must never break the export */
  }
  return features;
}

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

function layerField(layer: LayerLike, ...names: string[]): FieldRef | null {
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

function readNum(attrs: Record<string, unknown>, name: string): number {
  const n = Number(readAttr(attrs, name));
  return Number.isFinite(n) ? n : 0;
}

function readStr(attrs: Record<string, unknown>, name: string): string {
  const v = readAttr(attrs, name);
  return v == null ? "" : String(v).trim();
}

/** Geo columns of one layer: name field and/or numeric code field. */
type GeoFields = { name: FieldRef | null; code: FieldRef | null };

function geoFields(layer: LayerLike, level: "viloyat" | "tuman"): GeoFields {
  return level === "viloyat"
    ? { name: layerField(layer, "viloyat"), code: layerField(layer, "region") }
    : { name: layerField(layer, "tuman"), code: layerField(layer, "district") };
}

/**
 * agri_crop geo: `region`/`district` are place names; codes are region_id /
 * distrct_id (typo in the service schema).
 */
function cropPlanGeoFields(layer: LayerLike, level: "viloyat" | "tuman"): GeoFields {
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

function cropPlanScopeWhere(
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
  const fieldNames = (layer.fields || []).map((f) => String(f?.name || ""));
  return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), fieldNames);
}

/**
 * Resolves a grouped row to a place name. Text names win; numeric values
 * (or a code-only layer) go through the Agri_table region/district mapping.
 */
function placeResolver(
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

function scopeWhere(
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
  const fieldNames = (layer.fields || []).map((f) => String(f?.name || ""));
  return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), fieldNames);
}

function groupByList(fields: GeoFields, ...extra: Array<FieldRef | null>): string[] {
  return [fields.name, fields.code, ...extra]
    .filter((f): f is FieldRef => Boolean(f))
    .map((f) => f.name);
}

function scopeLevel(scope: ReportScope): "viloyat" | "tuman" {
  return scope.viloyat ? "tuman" : "viloyat";
}

/** Distinct geo rows for the current scope (republic viloyats or one viloyat's tumans). */
export async function resolveReportGeos(scope: ReportScope): Promise<ReportGeoRow[]> {
  const mappings = await queryAgriRegionDistrictMappings();
  const byKey = new Map<string, ReportGeoRow>();
  for (const row of mappings) {
    if (scope.viloyat && !sameReportPlace(row.viloyat, scope.viloyat)) continue;
    const name = String((scope.viloyat ? row.tuman : row.viloyat) || "").trim();
    const key = reportPlaceKey(name);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, { name, key });
  }
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name, "uz"));
}

async function queryCropAreas(
  scope: ReportScope,
  cropKeys: string[],
): Promise<CropAreaRow[]> {
  const [{ layer }, mappings] = await Promise.all([
    getAgriTableDataLayer(),
    queryAgriRegionDistrictMappings(),
  ]);
  const L = layer as unknown as LayerLike;
  const turi = layerField(L, "turi");
  const area = layerField(L, "maydon");
  if (!turi || !area) return [];
  const cropClause = buildTurlarSqlClause(turi.name, cropKeys);
  if (!cropClause) return [];

  const level = scopeLevel(scope);
  const geo = geoFields(L, level);
  // Agri_table_data uses land_type; map / water layers use type_id / yer_turi.
  const landFields = [
    layerField(L, "land_type"),
    layerField(L, "type_id"),
    layerField(L, "yer_turi"),
    layerField(L, "type"),
  ].filter((f): f is FieldRef => Boolean(f));

  const q = L.createQuery();
  q.where = scopeWhere(L, scope, mappings, [cropClause]);
  q.groupByFieldsForStatistics = groupByList(geo, ...landFields);
  q.outStatistics = asStatisticDefinitions([
    { statisticType: "sum", onStatisticField: area.name, outStatisticFieldName: "sum_m" },
  ]);
  q.returnGeometry = false;

  const features = await runQuery(`crop ${cropKeys.join(",")}`, L, q);
  const placeOf = placeResolver(level, geo, mappings);
  const byKey = new Map<string, CropAreaRow>();
  for (const feature of features) {
    const attrs = featureAttributeBag(feature) as Record<string, unknown>;
    const key = reportPlaceKey(placeOf(attrs));
    const value = readNum(attrs, "sum_m");
    if (!key || !(value > 0)) continue;
    let row = byKey.get(key);
    if (!row) {
      row = { key, area: 0, asosiy: 0, lalmi: 0, reja: 0, ehtimoliy: 0 };
      byKey.set(key, row);
    }
    row.area += value;
    const isLalmi = landFields.some(
      (f) => normalizeLandTypeValue(readStr(attrs, f.name)) === "lalmi",
    );
    if (isLalmi) row.lalmi += value;
    else row.asosiy += value;
  }
  return Array.from(byKey.values());
}

export async function queryPaxtaAreas(scope: ReportScope): Promise<CropAreaRow[]> {
  return queryCropAreas(scope, ["paxta"]);
}

export async function queryGallaAreas(scope: ReportScope): Promise<CropAreaRow[]> {
  return queryCropAreas(scope, ["bugdoy"]);
}

/** Ozuqa monitoring area — fills the g'alla "ehtimoliy g'alla" column. */
export async function queryOzuqaAreas(scope: ReportScope): Promise<CropAreaRow[]> {
  return queryCropAreas(scope, ["ozuqa"]);
}

function isVegetativTuri(raw: string): boolean {
  const t = String(raw || "").toLowerCase();
  return (
    t.includes("veget") ||
    t.includes("vegitat") ||
    t.includes("vegitativ") ||
    t.includes("вегет")
  );
}

/** Layer crop keys whose area belongs to another template column. */
const RESERVE_COLUMN_ALIASES: Record<string, string> = {
  makkajoxori: "makka",
  qovun: "poliz",
  tarvuz: "poliz",
  qovoq: "poliz",
  kungabokar: "kungaboqar",
};

/** Reserve crop column keys used in the Excel templates. */
export const RESERVE_CROP_COLUMNS_TUMAN = [
  "bugdoy",
  "paxta",
  "sholi",
  "beda",
  "makka",
  "vegetativ",
] as const;

export const RESERVE_CROP_COLUMNS_VILOYAT = [
  "bugdoy",
  "paxta",
  "sholi",
  "beda",
  "makka",
  "noxat",
  "kartoshka",
  "tariq",
  "poliz",
  "yeryongoq",
  "piyoz",
  "kungaboqar",
  "sabzi",
  "mosh",
] as const;

const RESERVE_COLUMN_KEYS = new Set<string>([
  ...RESERVE_CROP_COLUMNS_TUMAN,
  ...RESERVE_CROP_COLUMNS_VILOYAT,
]);

/**
 * Map a reserve-land `turi` / crop name onto a template column key.
 * Unknown names stay "boshqa" (not written into G–T columns).
 */
export function reserveColumnKey(turi: string): string {
  if (isVegetativTuri(turi)) return "vegetativ";
  const key = getTuriCropLookupKey(turi);
  if (!key) return "boshqa";
  const mapped = RESERVE_COLUMN_ALIASES[key] || key;
  return RESERVE_COLUMN_KEYS.has(mapped) ? mapped : "boshqa";
}

/** Merge crop_id → column from Agri_table and from the reserve layer itself. */
async function cropIdToReserveColumn(L: LayerLike): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const add = (cropId: string, turi: string) => {
    const id = String(cropId || "").trim();
    if (!id || map.has(id)) return;
    const col = reserveColumnKey(turi);
    if (col !== "boshqa") map.set(id, col);
  };
  try {
    for (const row of await queryAgriTuriCropMappings()) {
      add(row.cropId, row.turi);
    }
  } catch {
    /* Agri_table map is optional — reserve-layer pairs still help */
  }
  const turi = layerField(L, "turi");
  const cropId = layerField(L, "crop_id");
  const year = layerField(L, "yil", "year");
  if (turi && cropId) {
    try {
      const q = L.createQuery();
      q.where = "1=1";
      q.groupByFieldsForStatistics = [turi.name, cropId.name, ...(year ? [year.name] : [])];
      q.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: L.objectIdField || "objectid",
          outStatisticFieldName: "cnt",
        },
      ]);
      q.returnGeometry = false;
      const features = (await L.queryFeatures(q))?.features || [];
      const byYear: Array<{ yil: string; turi: string; crop_id: string; cnt: number }> = [];
      for (const f of features) {
        const attrs = featureAttributeBag(f) as Record<string, unknown>;
        add(readStr(attrs, cropId.name), readStr(attrs, turi.name));
        byYear.push({
          yil: year ? readStr(attrs, year.name) : "",
          turi: readStr(attrs, turi.name),
          crop_id: readStr(attrs, cropId.name),
          cnt: readNum(attrs, "cnt"),
        });
      }
      console.info("[Agro Excel] reserve yil × turi × crop_id", byYear);
    } catch {
      /* ignore — keep whatever Agri_table provided */
    }
  }
  return map;
}

/**
 * Prefer turi name; if unknown / empty / numeric, resolve via crop_id map.
 * Numeric `turi` values are treated as crop_id (some layers store the id there).
 */
export function resolveReserveCropColumn(
  turi: string,
  cropId: string,
  idMap: Map<string, string>,
): string {
  const fromTuri = reserveColumnKey(turi);
  if (fromTuri !== "boshqa") return fromTuri;
  for (const raw of [cropId, turi]) {
    const id = String(raw || "").trim();
    if (!id) continue;
    const col = idMap.get(id);
    if (col) return col;
  }
  return "boshqa";
}

type CountAreaRow = { key: string; kontur: number; maydon: number };

/** COUNT + SUM(maydon) per geo; optional extra group field (e.g. turi). */
async function queryCountArea(
  label: string,
  L: LayerLike,
  scope: ReportScope,
  mappings: AgriRegionDistrictMappingRow[],
  extra?: FieldRef | null,
): Promise<Array<CountAreaRow & { extra: string }>> {
  const area = layerField(L, "maydon");
  const level = scopeLevel(scope);
  const geo = geoFields(L, level);
  if (!area || (!geo.name && !geo.code)) {
    console.info(`[Agro Excel] ${label} skipped: maydon/${level} field missing`, {
      fields: (L.fields || []).map((f) => f?.name),
    });
    return [];
  }

  const q = L.createQuery();
  q.where = scopeWhere(L, scope, mappings);
  q.groupByFieldsForStatistics = groupByList(geo, extra || null);
  q.outStatistics = asStatisticDefinitions([
    {
      statisticType: "count",
      onStatisticField: L.objectIdField || "objectid",
      outStatisticFieldName: "cnt",
    },
    { statisticType: "sum", onStatisticField: area.name, outStatisticFieldName: "sum_m" },
  ]);
  q.returnGeometry = false;

  const features = await runQuery(label, L, q);
  const placeOf = placeResolver(level, geo, mappings);
  const rows: Array<CountAreaRow & { extra: string }> = [];
  for (const feature of features) {
    const attrs = featureAttributeBag(feature) as Record<string, unknown>;
    const key = reportPlaceKey(placeOf(attrs));
    if (!key) continue;
    rows.push({
      key,
      kontur: readNum(attrs, "cnt"),
      maydon: readNum(attrs, "sum_m"),
      extra: extra ? readStr(attrs, extra.name) : "",
    });
  }
  return rows;
}

export async function queryReserveAreas(scope: ReportScope): Promise<ReserveAreaRow[]> {
  const [{ layer }, mappings] = await Promise.all([
    getAgriReserveLandLayer(),
    queryAgriRegionDistrictMappings(),
  ]);
  const L = layer as unknown as LayerLike;
  const idMap = await cropIdToReserveColumn(L);
  const turi = layerField(L, "turi");
  const cropId = layerField(L, "crop_id");
  // Group by turi + crop_id so either field can resolve the Excel column.
  const level = scopeLevel(scope);
  const geo = geoFields(L, level);
  const area = layerField(L, "maydon");
  if (!area || (!geo.name && !geo.code)) {
    console.info("[Agro Excel] reserve skipped: maydon/geo field missing", {
      fields: (L.fields || []).map((f) => f?.name),
    });
    return [];
  }

  const q = L.createQuery();
  q.where = scopeWhere(L, scope, mappings);
  q.groupByFieldsForStatistics = groupByList(geo, turi, cropId);
  q.outStatistics = asStatisticDefinitions([
    {
      statisticType: "count",
      onStatisticField: L.objectIdField || "objectid",
      outStatisticFieldName: "cnt",
    },
    { statisticType: "sum", onStatisticField: area.name, outStatisticFieldName: "sum_m" },
  ]);
  q.returnGeometry = false;

  const features = await runQuery("reserve", L, q);
  const placeOf = placeResolver(level, geo, mappings);
  const byKey = new Map<string, ReserveAreaRow>();
  const unresolved: Array<{ turi: string; crop_id: string; maydon: number }> = [];
  const mappedTotals: Record<string, number> = {};

  for (const feature of features) {
    const attrs = featureAttributeBag(feature) as Record<string, unknown>;
    const key = reportPlaceKey(placeOf(attrs));
    if (!key) continue;
    let row = byKey.get(key);
    if (!row) {
      row = { key, kontur: 0, umumiy: 0, byCrop: {} };
      byKey.set(key, row);
    }
    const kontur = readNum(attrs, "cnt");
    const maydon = readNum(attrs, "sum_m");
    row.kontur += kontur;
    row.umumiy += maydon;
    if (!(maydon > 0)) continue;
    const turiVal = turi ? readStr(attrs, turi.name) : "";
    const cropIdVal = cropId ? readStr(attrs, cropId.name) : "";
    const crop = resolveReserveCropColumn(turiVal, cropIdVal, idMap);
    if (crop === "boshqa") {
      if (unresolved.length < 12) {
        unresolved.push({ turi: turiVal, crop_id: cropIdVal, maydon });
      }
      continue;
    }
    row.byCrop[crop] = (row.byCrop[crop] || 0) + maydon;
    mappedTotals[crop] = (mappedTotals[crop] || 0) + maydon;
  }
  console.info("[Agro Excel] reserve crop mapping", {
    idMapSize: idMap.size,
    idMapSample: Array.from(idMap.entries()).slice(0, 12),
    mappedTotals,
    unresolvedSample: unresolved,
  });
  return Array.from(byKey.values());
}

export async function queryUnusedAreas(scope: ReportScope): Promise<UnusedAreaRow[]> {
  const [{ layer }, mappings] = await Promise.all([
    getAgriUnusedLandLayer(),
    queryAgriRegionDistrictMappings(),
  ]);
  const rows = await queryCountArea(
    "unused",
    layer as unknown as LayerLike,
    scope,
    mappings,
  );
  const byKey = new Map<string, UnusedAreaRow>();
  for (const r of rows) {
    const prev = byKey.get(r.key) || { key: r.key, kontur: 0, maydon: 0 };
    prev.kontur += r.kontur;
    prev.maydon += r.maydon;
    byKey.set(r.key, prev);
  }
  return Array.from(byKey.values());
}

const FARMER_PAGE_SIZE = 2000;
const FARMER_MAX_PAGES = 50;

/** Grouped statistics query paged by resultOffset (one tuman can exceed 2000 groups). */
async function queryGroupedPages(label: string, L: LayerLike, base: () => any): Promise<any[]> {
  const all: any[] = [];
  const seen = new Set<string>();
  for (let page = 0; page < FARMER_MAX_PAGES; page++) {
    const q = base();
    q.num = FARMER_PAGE_SIZE;
    q.start = page * FARMER_PAGE_SIZE;
    const features = await runQuery(`${label} p${page}`, L, q);
    // Servers without aggregate paging return page 0 again — stop on a repeat.
    const firstSig = JSON.stringify(features[0]?.attributes ?? null);
    if (!features.length || seen.has(firstSig)) break;
    seen.add(firstSig);
    all.push(...features);
    if (features.length < FARMER_PAGE_SIZE) break;
  }
  return all;
}

/**
 * Crop Agro plan (REJA): SUM(areaha) from agri_crop by geo + plant_name filter.
 * Republic → group by region; viloyat selected → group by district.
 */
export async function queryPlanAreas(
  scope: ReportScope,
  cropKeys: string[],
): Promise<PlanAreaRow[]> {
  const [{ layer }, mappings] = await Promise.all([
    getAgriCropPlanLayer(),
    queryAgriRegionDistrictMappings(),
  ]);
  const L = layer as unknown as LayerLike;
  const area = layerField(L, "areaha", "maydon");
  const plant = layerField(L, "plant_name", "turi");
  if (!area || !plant) {
    console.info("[Agro Excel] agri_crop plan skipped: areaha/plant_name missing", {
      fields: (L.fields || []).map((f) => f?.name),
    });
    return [];
  }
  const cropClause = buildTurlarSqlClause(plant.name, cropKeys);
  if (!cropClause) return [];

  const level = scopeLevel(scope);
  const geo = cropPlanGeoFields(L, level);
  if (!geo.name && !geo.code) {
    console.info("[Agro Excel] agri_crop plan skipped: geo fields missing", {
      fields: (L.fields || []).map((f) => f?.name),
    });
    return [];
  }

  await logCropPlanProbe(L);

  const q = L.createQuery();
  q.where = cropPlanScopeWhere(L, scope, mappings, [cropClause]);
  q.groupByFieldsForStatistics = groupByList(geo);
  q.outStatistics = asStatisticDefinitions([
    { statisticType: "sum", onStatisticField: area.name, outStatisticFieldName: "sum_m" },
  ]);
  q.returnGeometry = false;

  const features = await runQuery(`plan ${cropKeys.join(",")}`, L, q);
  const placeOf = placeResolver(level, geo, mappings);
  const byKey = new Map<string, number>();
  for (const feature of features) {
    const attrs = featureAttributeBag(feature) as Record<string, unknown>;
    const key = reportPlaceKey(placeOf(attrs));
    const value = readNum(attrs, "sum_m");
    if (!key || !(value > 0)) continue;
    byKey.set(key, (byKey.get(key) || 0) + value);
  }
  return Array.from(byKey.entries()).map(([key, areaSum]) => ({ key, area: areaSum }));
}

/** Attach plan hectares onto monitoring crop rows (matched by place key). */
export function mergePlanIntoCrops(
  monitoring: CropAreaRow[],
  plan: PlanAreaRow[],
): CropAreaRow[] {
  const byKey = new Map<string, CropAreaRow>();
  for (const row of monitoring) {
    byKey.set(row.key, { ...row, reja: row.reja || 0, ehtimoliy: row.ehtimoliy || 0 });
  }
  for (const p of plan) {
    const prev = byKey.get(p.key);
    if (prev) {
      prev.reja = p.area;
    } else {
      byKey.set(p.key, {
        key: p.key,
        area: 0,
        asosiy: 0,
        lalmi: 0,
        reja: p.area,
        ehtimoliy: 0,
      });
    }
  }
  return Array.from(byKey.values());
}

/** Attach ozuqa hectares onto g'alla rows (ehtimoliy column). */
export function mergeEhtimoliyIntoCrops(
  galla: CropAreaRow[],
  ozuqa: CropAreaRow[],
): CropAreaRow[] {
  const byKey = new Map<string, CropAreaRow>();
  for (const row of galla) {
    byKey.set(row.key, { ...row, ehtimoliy: row.ehtimoliy || 0 });
  }
  for (const o of ozuqa) {
    const prev = byKey.get(o.key);
    if (prev) {
      prev.ehtimoliy = o.area;
    } else {
      byKey.set(o.key, {
        key: o.key,
        area: 0,
        asosiy: 0,
        lalmi: 0,
        reja: 0,
        ehtimoliy: o.area,
      });
    }
  }
  return Array.from(byKey.values());
}

let cropPlanProbeDone = false;

/** One-shot layer probe: years + plant_name sample (DevTools). */
async function logCropPlanProbe(L: LayerLike): Promise<void> {
  if (cropPlanProbeDone) return;
  cropPlanProbeDone = true;
  const year = layerField(L, "year", "yil");
  const plant = layerField(L, "plant_name", "turi");
  if (!year && !plant) return;
  try {
    const oid = L.objectIdField || "objectid";
    const group = [year, plant].filter((f): f is FieldRef => Boolean(f)).map((f) => f.name);
    const q = L.createQuery();
    q.where = "1=1";
    q.groupByFieldsForStatistics = group;
    q.outStatistics = asStatisticDefinitions([
      { statisticType: "count", onStatisticField: oid, outStatisticFieldName: "cnt" },
    ]);
    q.returnGeometry = false;
    const features = (await L.queryFeatures(q))?.features || [];
    console.info(
      "[Agro Excel] agri_crop year × plant_name",
      features.slice(0, 40).map((f: any) => {
        const a = featureAttributeBag(f) as Record<string, unknown>;
        return {
          year: year ? readStr(a, year.name) : "",
          plant_name: plant ? readStr(a, plant.name) : "",
          cnt: readNum(a, "cnt"),
        };
      }),
    );
  } catch (err) {
    console.info("[Agro Excel] agri_crop probe failed", err);
  }
}

function farmerYieldKeys(inn: string, name: string, turi: string): string[] {
  const crop = getTuriCropLookupKey(turi);
  if (!crop) return [];
  const keys: string[] = [];
  const innKey = String(inn || "").trim();
  const nameKey = String(name || "").trim().toLowerCase();
  if (innKey) keys.push(`inn:${innKey}\u0001${crop}`);
  if (nameKey) keys.push(`name:${nameKey}\u0001${crop}`);
  return keys;
}

/** AVG(yld) from Agri_table_data keyed by farmer inn/name × canonical crop. */
async function queryTableFarmerYields(
  scope: ReportScope,
  mappings: AgriRegionDistrictMappingRow[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const tuman = String(scope.tuman || "").trim();
  if (!tuman) return out;
  const { layer } = await getAgriTableDataLayer();
  const L = layer as unknown as LayerLike;
  const yld = layerField(L, "yld");
  const turi = layerField(L, "turi");
  const tumanField = layerField(L, "tuman");
  if (!yld || !turi || !tumanField) return out;
  const inn = layerField(L, "f_inn", "inn");
  const name = layerField(L, "f_name", "full_name");
  const where = scopeWhere(L, scope, mappings, [
    buildTumanEqualsSql(tumanField.name, tuman),
    `${yld.name} > 0`,
  ]);
  const groupBy = [inn, name, turi]
    .filter((f): f is FieldRef => Boolean(f))
    .map((f) => f.name);
  const features = await queryGroupedPages("farmer yld", L, () => {
    const q = L.createQuery();
    q.where = where;
    q.groupByFieldsForStatistics = groupBy;
    q.outStatistics = asStatisticDefinitions([
      { statisticType: "avg", onStatisticField: yld.name, outStatisticFieldName: "avg_y" },
    ]);
    q.returnGeometry = false;
    return q;
  });
  const sums = new Map<string, { sum: number; n: number }>();
  for (const f of features) {
    const attrs = featureAttributeBag(f) as Record<string, unknown>;
    const avg = readNum(attrs, "avg_y");
    if (!(avg > 0)) continue;
    const keys = farmerYieldKeys(
      inn ? readStr(attrs, inn.name) : "",
      name ? readStr(attrs, name.name) : "",
      readStr(attrs, turi.name),
    );
    for (const key of keys) {
      const prev = sums.get(key) || { sum: 0, n: 0 };
      prev.sum += avg;
      prev.n += 1;
      sums.set(key, prev);
    }
  }
  for (const [key, { sum, n }] of sums) {
    if (n > 0) out.set(key, sum / n);
  }
  return out;
}

function lookupFarmerYield(
  yields: Map<string, number>,
  inn: string,
  name: string,
  turi: string,
): number {
  for (const key of farmerYieldKeys(inn, name, turi)) {
    const v = yields.get(key);
    if (v && v > 0) return v;
  }
  return 0;
}

/**
 * Farmer × crop rows for the selected tuman from agri_crop (SUM(areaha)),
 * with AVG(yld) from Agri_table_data matched by INN/name × crop.
 */
export async function queryFarmerRows(scope: ReportScope): Promise<FarmerRow[]> {
  const tuman = String(scope.tuman || "").trim();
  if (!tuman) return [];
  const [{ layer }, mappings] = await Promise.all([
    getAgriCropPlanLayer(),
    queryAgriRegionDistrictMappings(),
  ]);
  const L = layer as unknown as LayerLike;
  const area = layerField(L, "areaha", "maydon");
  const plant = layerField(L, "plant_name", "turi");
  const district = layerField(L, "district", "tuman");
  if (!area || !plant || !district) {
    console.info("[Agro Excel] agri_crop farmer skipped: fields missing", {
      fields: (L.fields || []).map((f) => f?.name),
    });
    return [];
  }
  const region = layerField(L, "region", "viloyat");
  const name = layerField(L, "full_name", "f_name");
  const inn = layerField(L, "inn", "f_inn");

  await logCropPlanProbe(L);

  const where = cropPlanScopeWhere(L, { ...scope, tuman }, mappings);
  const groupBy = [region, district, name, inn, plant]
    .filter((f): f is FieldRef => Boolean(f))
    .map((f) => f.name);

  const [features, yields] = await Promise.all([
    queryGroupedPages("farmer areaha", L, () => {
      const q = L.createQuery();
      q.where = where;
      q.groupByFieldsForStatistics = groupBy;
      q.orderByFields = groupBy;
      q.outStatistics = asStatisticDefinitions([
        { statisticType: "sum", onStatisticField: area.name, outStatisticFieldName: "sum_m" },
      ]);
      q.returnGeometry = false;
      return q;
    }),
    queryTableFarmerYields({ ...scope, tuman }, mappings),
  ]);

  const rows: FarmerRow[] = [];
  for (const f of features) {
    const attrs = featureAttributeBag(f) as Record<string, unknown>;
    const maydon = readNum(attrs, "sum_m");
    if (!(maydon > 0)) continue;
    const farmerName = name ? readStr(attrs, name.name) : "";
    const farmerInn = inn ? readStr(attrs, inn.name) : "";
    const crop = readStr(attrs, plant.name);
    rows.push({
      viloyat: region ? readStr(attrs, region.name) : scope.viloyat,
      tuman: readStr(attrs, district.name) || tuman,
      name: farmerName,
      inn: farmerInn,
      turi: crop,
      hosildorlik: lookupFarmerYield(yields, farmerInn, farmerName, crop),
      maydon,
    });
  }
  return rows.sort(
    (a, b) =>
      a.name.localeCompare(b.name, "uz") ||
      a.inn.localeCompare(b.inn) ||
      a.turi.localeCompare(b.turi, "uz"),
  );
}
