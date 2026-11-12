import {
  queryAgriRegionDistrictMappings,
  queryAgriTuriCropMappings,
  getAgriTableDataLayer,
  type AgriRegionDistrictMappingRow,
} from "../../../../../../gis/agri-table-data-source";
import { getAgriCropPlanLayer } from "../../../../../../gis/agri-crop-plan-data-source";
import { getAgriReserveLandLayer } from "../../../../../../gis/agri-reserve-land-data-source";
import { getAgriUnusedLandLayer } from "../../../../../../gis/agri-unused-land-data-source";
import { normalizeLandTypeValue } from "../../../../../../gis/feature-layer/where-values";
import { featureAttributeBag } from "../../../../../../gis/agri-layer-types";
import { asStatisticDefinitions } from "../../../../../../shared/agri-plain-object";
import {
  buildTurlarSqlClause,
  getTuriCropLookupKey,
} from "../../../../../../shared/agri-crop-labels";
import { reportPlaceKey, sameReportPlace } from "./place-key";
import {
  cropPlanGeoFields,
  cropPlanScopeWhere,
  geoFields,
  groupByList,
  layerField,
  layerFieldNames,
  placeResolver,
  readNum,
  readStr,
  reportLog,
  runQuery,
  scopeLevel,
  scopeWhere,
  type FieldRef,
  type LayerLike,
} from "./query-helpers";
import type {
  CropAreaRow,
  PlanAreaRow,
  ReportGeoRow,
  ReportScope,
  ReserveAreaRow,
  UnusedAreaRow,
} from "./types";

export { queryFarmerRows } from "./query-farmer";

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
  if (turi && cropId) {
    try {
      const q = L.createQuery();
      q.where = "1=1";
      q.groupByFieldsForStatistics = [turi.name, cropId.name];
      q.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: L.objectIdField || "objectid",
          outStatisticFieldName: "cnt",
        },
      ]);
      q.returnGeometry = false;
      const features = (await L.queryFeatures(q))?.features || [];
      for (const f of features) {
        const attrs = featureAttributeBag(f) as Record<string, unknown>;
        add(readStr(attrs, cropId.name), readStr(attrs, turi.name));
      }
      reportLog("reserve turi × crop_id pairs", { rows: features.length });
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
    reportLog(`${label} skipped: maydon/${level} field missing`, { fields: layerFieldNames(L) });
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
    reportLog("reserve skipped: maydon/geo field missing", { fields: layerFieldNames(L) });
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
  reportLog("reserve crop mapping", {
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
    reportLog("agri_crop plan skipped: areaha/plant_name missing", { fields: layerFieldNames(L) });
    return [];
  }
  const cropClause = buildTurlarSqlClause(plant.name, cropKeys);
  if (!cropClause) return [];

  const level = scopeLevel(scope);
  const geo = cropPlanGeoFields(L, level);
  if (!geo.name && !geo.code) {
    reportLog("agri_crop plan skipped: geo fields missing", { fields: layerFieldNames(L) });
    return [];
  }

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
