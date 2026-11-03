/**
 * Crop colours for the reserve / unused land polygons on the map. Each polygon
 * gets the colour of its crop row exactly as the "Zaxira maydonlari" chart and
 * the "Ekin turi" pie paint it (resolveCropColors over the same merged rows).
 *
 * The rows come from the same grouped query the reserve chart runs, so for the
 * reserve layer the colouring is served from the stats cache.
 */
import {
  queryLandCropRows,
  type ReserveCropRow,
} from "../panels/ReserveCropPanel/runtime/reserve-crop-data";
import { resolveCropColors } from "../shared/agri-crop-color-registry";
import { hexToRgba, type CropFillSymbolJson } from "../filter/localization/crop-renderer";
import { getAgriReserveLandLayer } from "./agri-reserve-land-data-source";
import { getAgriUnusedLandLayer } from "./agri-unused-land-data-source";
import type { AgriLandOverlay } from "../store/agri-land-overlay-store";
import type { AgriLandScope } from "./agri-land-layers";

/**
 * Polygons outside every crop row: mostly the uncropped "Zaxira yer" rows
 * (~79% of Sirdaryo reserve, 2026-11-03). Near-transparent with a thin outline
 * so the crop colours stand out on the satellite basemap.
 */
const OTHER_LAND_COLOR = "#B0BEC5";

/**
 * Land polygons are small and sit on imagery: the field layers' 30% fill made
 * them unreadable (Paxta is near-white). The border carries the crop colour
 * (user, 2026-11-03): solid and thick, over a lighter fill so it stays visible.
 */
function landCropSymbol(color: string): CropFillSymbolJson {
  return {
    type: "simple-fill",
    color: hexToRgba(color, 0.45),
    outline: { color: hexToRgba(color, 1), width: 2 },
  };
}

function uncroppedLandSymbol(): CropFillSymbolJson {
  return {
    type: "simple-fill",
    color: hexToRgba(OTHER_LAND_COLOR, 0.08),
    outline: { color: hexToRgba(OTHER_LAND_COLOR, 0.85), width: 0.6 },
  };
}

export interface LandCropRendererJson {
  type: "unique-value";
  valueExpression: string;
  valueExpressionTitle: string;
  defaultSymbol: CropFillSymbolJson;
  defaultLabel: string;
  uniqueValueInfos: Array<{ value: string; label: string; symbol: CropFillSymbolJson }>;
}

type LayerFields = Pick<__esri.FeatureLayer, "fields">;

function fieldName(layer: LayerFields, wanted: string): string {
  const fields = Array.isArray(layer.fields) ? layer.fields : [];
  const hit = fields.find((field) => String(field?.name || "").toLowerCase() === wanted);
  return hit ? String(hit.name) : "";
}

/** Arcade string literal (JSON escaping is valid Arcade). */
const arcadeString = (value: string): string => JSON.stringify(value);

/** `Decode(subject, a, ra, b, rb, …, "")`, or `""` with nothing to match. */
function arcadeDecode(subject: string, pairs: Array<[string, string]>): string {
  if (!pairs.length) return `""`;
  const args = pairs.map(([raw, key]) => `${arcadeString(raw)}, ${arcadeString(key)}`);
  return `Decode(${subject}, ${args.join(", ")}, "")`;
}

/**
 * Arcade that maps a polygon to its crop row key ("r0", "r1", …) with the
 * same rule `toReserveCropRows` merged the rows by: a text `turi` is the crop;
 * an empty / numeric `turi` falls back to `crop_id`.
 */
export function buildLandCropValueExpression(
  layer: LayerFields,
  rows: readonly ReserveCropRow[],
): string {
  const turiField = fieldName(layer, "turi");
  if (!turiField) return "";
  const cropField = fieldName(layer, "crop_id");

  const byTuri: Array<[string, string]> = [];
  const byCrop: Array<[string, string]> = [];
  let blankKey = "";
  rows.forEach((row, index) => {
    const key = `r${index}`;
    for (const turi of row.match.turi) byTuri.push([turi, key]);
    for (const cropId of row.match.cropIds) byCrop.push([cropId, key]);
    if (row.match.blank && !blankKey) blankKey = key;
  });

  const read = (name: string, variable: string): string[] => [
    `var ${variable} = "";`,
    `if (!IsEmpty($feature[${arcadeString(name)}])) { ${variable} = Trim(Text($feature[${arcadeString(name)}])); }`,
  ];
  const lines = [
    ...read(turiField, "t"),
    ...(cropField ? read(cropField, "c") : [`var c = "";`]),
    `if (t != "" && IsNan(Number(t))) { return ${arcadeDecode("t", byTuri)}; }`,
    `if (c != "") { return ${arcadeDecode("c", byCrop)}; }`,
    `if (t != "") { return ${arcadeDecode("t", byTuri)}; }`,
    `return ${arcadeString(blankKey)};`,
  ];
  return lines.join("\n");
}

/** Unique-value renderer painting each crop row in its chart colour, or null. */
export function buildLandCropRenderer(
  layer: LayerFields,
  rows: readonly ReserveCropRow[],
): LandCropRendererJson | null {
  if (!rows.length) return null;
  const valueExpression = buildLandCropValueExpression(layer, rows);
  if (!valueExpression) return null;
  const colors = resolveCropColors(rows.map((row) => row.crop));
  return {
    type: "unique-value",
    valueExpression,
    valueExpressionTitle: "Ekin turi",
    defaultSymbol: uncroppedLandSymbol(),
    defaultLabel: "Ekinsiz",
    uniqueValueInfos: rows.map((row, index) => ({
      value: `r${index}`,
      label: row.crop,
      symbol: landCropSymbol(colors[index]),
    })),
  };
}

async function queryOverlayCropRows(
  overlay: AgriLandOverlay,
  scope: AgriLandScope,
): Promise<ReserveCropRow[]> {
  if (overlay === "reserve") {
    // Same layer + arguments as the reserve chart → served from its cache.
    const { layer } = await getAgriReserveLandLayer();
    return queryLandCropRows(layer, scope, "maydon");
  }
  const { layer } = await getAgriUnusedLandLayer();
  return queryLandCropRows(layer, scope, fieldName(layer, "maydon") || null);
}

/**
 * Colour the shown land layer by crop. Keeps the layer's own renderer when it
 * has no crop column or no rows. `isStale` aborts when a newer sync started.
 */
export async function applyLandCropRenderer(
  layer: __esri.FeatureLayer,
  overlay: AgriLandOverlay,
  scope: AgriLandScope,
  isStale: () => boolean = () => false,
): Promise<boolean> {
  const rows = await queryOverlayCropRows(overlay, scope);
  if (isStale()) return false;
  const renderer = buildLandCropRenderer(layer, rows);
  if (!renderer) return false;
  layer.renderer = renderer as unknown as __esri.Renderer;
  return true;
}
