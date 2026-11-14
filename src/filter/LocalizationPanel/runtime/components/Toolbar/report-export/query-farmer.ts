/**
 * Fermer report rows: farmer × crop SUM(areaha) from agri_crop, with AVG(yld)
 * from Agri_table_data matched by INN / name × crop.
 */
import { buildTumanEqualsSql } from "../../../../../../data/agri-sql";
import {
  getAgriTableDataLayer,
  queryAgriRegionDistrictMappings,
  type AgriRegionDistrictMappingRow,
} from "../../../../../../gis/agri-table-data-source";
import { getAgriCropPlanLayer } from "../../../../../../gis/agri-crop-plan-data-source";
import { featureAttributeBag } from "../../../../../../gis/agri-layer-types";
import { asStatisticDefinitions } from "../../../../../../shared/agri-plain-object";
import { getTuriCropLookupKey } from "../../../../../../shared/agri-crop-labels";
import {
  cropPlanScopeWhere,
  layerField,
  layerFieldNames,
  readNum,
  readStr,
  reportLog,
  runQuery,
  scopeWhere,
  type FieldRef,
  type LayerLike,
} from "./query-helpers";
import type { FarmerRow, ReportScope } from "./types";

const FARMER_PAGE_SIZE = 2000;
const FARMER_MAX_PAGES = 50;

/**
 * Grouped statistics query paged by resultOffset (one tuman can exceed 2000
 * groups). Pages are ordered by the group fields: without a stable order the
 * server may return overlapping pages, which duplicated or dropped farmers.
 */
async function queryGroupedPages(
  label: string,
  L: LayerLike,
  base: () => __esri.Query,
): Promise<__esri.Graphic[]> {
  const all: __esri.Graphic[] = [];
  const seen = new Set<string>();
  for (let page = 0; page < FARMER_MAX_PAGES; page++) {
    const q = base();
    if (!q.orderByFields?.length && q.groupByFieldsForStatistics?.length) {
      q.orderByFields = [...q.groupByFieldsForStatistics];
    }
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
    q.orderByFields = groupBy;
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
    reportLog("agri_crop farmer skipped: fields missing", { fields: layerFieldNames(L) });
    return [];
  }
  const region = layerField(L, "region", "viloyat");
  const name = layerField(L, "full_name", "f_name");
  const inn = layerField(L, "inn", "f_inn");

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
