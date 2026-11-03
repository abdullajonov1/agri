import { getRegionGroupFeaturesCached, type AgriStatFeature } from "../../../data/agri-stats-store";
import { buildLandLayerWhere, type AgriLandScope } from "../../../gis/agri-land-layers";
import { getAgriReserveLandLayer } from "../../../gis/agri-reserve-land-data-source";
import { queryAgriTuriCropMappings } from "../../../gis/agri-table-data-source";
import { getTuriCropLookupKey } from "../../../shared/agri-crop-labels";
import { escapeArcGIS } from "../../../data/agri-sql";

/** Raw values a merged crop row came from — what the map filter matches. */
export interface ReserveCropMatch {
  /** `turi` spellings stored as text (or a numeric turi with no crop_id). */
  turi: string[];
  /** crop_id of rows whose turi was empty / numeric. */
  cropIds: string[];
  /** Some rows had neither turi nor crop_id. */
  blank: boolean;
}

export interface ReserveCropRow {
  /** Crop name as stored; display label and colour are derived from it. */
  crop: string;
  maydon: number;
  match: ReserveCropMatch;
  /** WHERE on Agri_reserve_land selecting this crop ("" = cannot filter). */
  where?: string;
}

const FALLBACK_CROP = "Boshqa";

/**
 * Summary rows stored next to the crops: "Zaxira yer" / "Zahira yer" /
 * "Zaxira yeri" (live data, 2026-11-03: ~1.4M ga together) are the uncropped
 * reserve area, not a crop, and would dwarf every real bar.
 */
const TOTAL_ROW =
  /^(jami|жами|umumiy|умумий|всего|итого|total|zaxira|zahira|захира|заҳира|резерв|reserve)(?![a-zа-яёўқғҳ])/i;

/** Some land layers keep the crop_id in `turi` or leave it empty. */
const needsCropLookup = (turi: string): boolean => !turi || /^\d+$/.test(turi);

async function cropNamesById(): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  try {
    for (const row of await queryAgriTuriCropMappings()) {
      if (!names.has(row.cropId)) names.set(row.cropId, row.turi);
    }
  } catch {
    /* Labels only — unresolved rows stay under "Boshqa". */
  }
  return names;
}

/** Sum `sum_m` per crop (spellings merged), largest first. */
export function toReserveCropRows(
  features: AgriStatFeature[],
  names: Map<string, string>,
): ReserveCropRow[] {
  const byKey = new Map<string, ReserveCropRow>();
  for (const feature of features) {
    const attrs = feature?.attributes || {};
    // sum_m = summed area; cnt_m = polygon count when the layer has no area field.
    const maydon = Number(attrs.sum_m ?? attrs.cnt_m);
    if (!(maydon > 0)) continue;
    const turi = String(attrs.turi ?? "").trim();
    const cropId = String(attrs.crop_id ?? "").trim();
    const crop = needsCropLookup(turi)
      ? names.get(cropId) || names.get(turi) || FALLBACK_CROP
      : turi;
    if (TOTAL_ROW.test(crop.replace(/['ʻʼ‘’`]/g, ""))) continue;
    const key = getTuriCropLookupKey(crop) || crop;
    let row = byKey.get(key);
    if (!row) {
      row = { crop, maydon: 0, match: { turi: [], cropIds: [], blank: false } };
      byKey.set(key, row);
    }
    row.maydon += maydon;
    const { match } = row;
    if (!needsCropLookup(turi)) addOnce(match.turi, turi);
    else if (cropId) addOnce(match.cropIds, cropId);
    else if (turi) addOnce(match.turi, turi);
    else match.blank = true;
  }
  return Array.from(byKey.values()).sort((a, b) => b.maydon - a.maydon);
}

function addOnce(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

const NUMERIC_FIELD_TYPES = new Set(["small-integer", "integer", "single", "double", "long", "oid"]);

/**
 * WHERE selecting one crop row on the reserve layer, from the raw values the
 * row merged. Field names and quoting come from the layer itself.
 */
export function buildReserveCropWhere(
  layer: Pick<__esri.FeatureLayer, "fields">,
  match: ReserveCropMatch,
): string {
  const fields = Array.isArray(layer.fields) ? layer.fields : [];
  const field = (name: string): __esri.Field | undefined =>
    fields.find((f) => String(f?.name || "").toLowerCase() === name);
  const turiField = field("turi");
  const cropField = field("crop_id");
  const parts: string[] = [];
  if (turiField && match.turi.length) {
    parts.push(`${turiField.name} IN (${match.turi.map((v) => `'${escapeArcGIS(v)}'`).join(", ")})`);
  }
  if (cropField && match.cropIds.length) {
    const numeric = NUMERIC_FIELD_TYPES.has(String(cropField.type || "").toLowerCase());
    const values = match.cropIds
      .filter((v) => !numeric || /^-?\d+(\.\d+)?$/.test(v))
      .map((v) => (numeric ? v : `'${escapeArcGIS(v)}'`));
    if (values.length) parts.push(`${cropField.name} IN (${values.join(", ")})`);
  }
  if (turiField && match.blank) {
    parts.push(`(${turiField.name} IS NULL OR ${turiField.name} = '')`);
  }
  if (!parts.length) return "";
  return parts.length === 1 ? parts[0] : `(${parts.join(" OR ")})`;
}

export async function queryReserveCropRows(scope: AgriLandScope): Promise<ReserveCropRow[]> {
  const { layer } = await getAgriReserveLandLayer();
  return queryLandCropRows(layer, scope, "maydon");
}

/**
 * Crop rows of any land layer (reserve / unused) for `scope`, merged the same
 * way as the reserve chart. [] when the layer has no `turi` column. Without an
 * area field the rows are weighted by polygon count.
 */
export async function queryLandCropRows(
  layer: __esri.FeatureLayer,
  scope: AgriLandScope,
  areaField: string | null,
): Promise<ReserveCropRow[]> {
  const hasTuri = (Array.isArray(layer.fields) ? layer.fields : []).some(
    (field) => String(field?.name || "").toLowerCase() === "turi",
  );
  if (!hasTuri) return [];
  const where = buildLandLayerWhere(layer, scope);
  if (!where) return [];
  const features = await getRegionGroupFeaturesCached({
    layer,
    where,
    groupField: "turi",
    codeField: "crop_id",
    statMode: areaField ? "sum" : "count",
    areaField,
  });
  const needsNames = features.some((feature) =>
    needsCropLookup(String(feature?.attributes?.turi ?? "").trim()),
  );
  const rows = toReserveCropRows(features, needsNames ? await cropNamesById() : new Map());
  return rows.map((row) => ({ ...row, where: buildReserveCropWhere(layer, row.match) }));
}
