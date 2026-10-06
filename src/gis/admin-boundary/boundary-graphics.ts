/**
 * Drawing side of the admin borders: outline / label symbols, view.graphics
 * district strokes, the client label FeatureLayer, the live Tuman_chegara
 * FeatureLayer and the outline GraphicsLayers.
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Graphic from "esri/Graphic";
import type Geometry from "esri/geometry/Geometry";
import type EsriMap from "esri/Map";
import type Layer from "esri/layers/Layer";
import type { AgriAttributes } from "../agri-layer-types";
import type { AdminBoundaryView } from "./boundary-modules";

export const AGRI_REGION_BOUNDARY_LAYER_ID = "agri-region-boundary";
export const AGRI_DISTRICT_BOUNDARY_LAYER_ID = "agri-district-boundary";
/** Client-side FeatureLayer (source graphics) — reliable labels above MapImage. */
export const AGRI_DISTRICT_LABEL_LAYER_ID = "agri-district-label-fl";
/** Live FeatureServer layer id (Evapo-style — labels via labelingInfo). */
export const AGRI_DISTRICT_FS_LAYER_ID = "agri-district-fs-border";
/** Tag on view.graphics so we can clear district overlays that sit above MapImage. */
export const AGRI_DISTRICT_VIEW_GRAPHIC_TAG = "agri-admin-district";

type OutlineSymbol = __esri.SimpleFillSymbolProperties & { type: "simple-fill" };
type LabelSymbol = __esri.TextSymbolProperties & { type: "text" };

const DISTRICT_STROKE: number[] = [255, 255, 255, 0.88];
const LABEL_TEXT_SYMBOL: LabelSymbol = {
  type: "text",
  color: [255, 255, 255, 1],
  haloColor: [70, 70, 70, 0.9],
  haloSize: 1.5,
  font: { size: 8, family: "Arial", weight: "normal" },
};

export function buildOutlineSymbol(
  width = 2.2,
  color: number[] = [255, 255, 255, 0.95],
): OutlineSymbol {
  return {
    type: "simple-fill",
    color: [0, 0, 0, 0],
    outline: {
      type: "simple-line",
      color,
      width,
    },
  };
}

/** District strokes: white, finer than the viloyat outline. */
export function buildDistrictOutlineSymbol(width = 0.75): OutlineSymbol {
  return buildOutlineSymbol(width, DISTRICT_STROKE);
}

function districtRenderer(): __esri.SimpleRendererProperties & { type: "simple" } {
  return { type: "simple", symbol: buildOutlineSymbol(0.85, DISTRICT_STROKE) };
}

function buildDistrictLabelSymbol(text: string): LabelSymbol {
  return {
    ...LABEL_TEXT_SYMBOL,
    text,
    horizontalAlignment: "center",
    verticalAlignment: "middle",
  };
}

function geometryLabelPoint(geometry: Geometry | null | undefined): Geometry | null {
  if (!geometry) return null;
  if (String(geometry.type || "").toLowerCase() === "point") return geometry;
  try {
    const centroid = (geometry as { centroid?: Geometry | null }).centroid;
    if (centroid) return centroid;
  } catch {
    /* centroid getter throws on degenerate rings — try the extent center */
  }
  try {
    const center = geometry.extent?.center;
    if (center) return center;
  } catch {
    /* no extent on this geometry — caller skips the label */
  }
  return null;
}

export function pickFeatureLabel(
  attributes: AgriAttributes | null | undefined,
  fields: string[],
): string {
  if (!attributes) return "";
  for (const field of fields) {
    const value = String(attributes[field] ?? "").trim();
    if (value) return value;
  }
  // Schema unknown — pick first plausible name-like string attribute.
  for (const [key, raw] of Object.entries(attributes)) {
    if (/objectid|oid|fid|shape|globalid|cod$|_id$|area|ha|length/i.test(key)) {
      continue;
    }
    const value = String(raw ?? "").trim();
    if (
      value.length >= 3 &&
      value.length < 64 &&
      /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'’ʻ`]/.test(value)
    ) {
      return value;
    }
  }
  return "";
}

function isDistrictViewGraphic(graphic: Graphic | null | undefined): boolean {
  const attrs = graphic?.attributes as AgriAttributes | null | undefined;
  return attrs?.agriAdminTag === AGRI_DISTRICT_VIEW_GRAPHIC_TAG;
}

/** Count of district overlays currently on view.graphics (-1 on error). */
export function countDistrictViewGraphics(view: AdminBoundaryView | null | undefined): number {
  try {
    return view?.graphics?.toArray?.()?.filter(isDistrictViewGraphic)?.length ?? 0;
  } catch {
    return -1;
  }
}

export function clearDistrictViewGraphics(view: AdminBoundaryView | null | undefined): void {
  const graphics = view?.graphics;
  if (!graphics) return;
  try {
    const items = graphics.toArray?.() || [];
    for (const graphic of items.filter(isDistrictViewGraphic)) {
      try {
        graphics.remove(graphic);
      } catch {
        /* already removed by another sync — nothing to do */
      }
    }
  } catch {
    /* view destroyed mid-sync */
  }
}

function addGraphicSafely(
  target: { add(graphic: Graphic): unknown },
  GraphicClass: typeof Graphic,
  props: __esri.GraphicProperties,
): boolean {
  try {
    target.add(new GraphicClass(props));
    return true;
  } catch {
    // Invalid geometry from the service — skip this one feature.
    return false;
  }
}

/** Label graphic for a feature, or null when it has no label / anchor. */
export function buildFeatureLabelGraphicProps(
  feature: Pick<Graphic, "geometry"> & { attributes?: AgriAttributes | null },
  labelFields: string[],
  attributes?: AgriAttributes,
): __esri.GraphicProperties | null {
  const label = pickFeatureLabel(feature.attributes, labelFields);
  const labelPoint = geometryLabelPoint(feature.geometry);
  if (!label || !labelPoint) return null;
  return { geometry: labelPoint, symbol: buildDistrictLabelSymbol(label), attributes };
}

export { addGraphicSafely };

/**
 * MapImage crop layers often cover GraphicsLayers. view.graphics always
 * paints on top — use it for district strokes (+ optional names).
 */
export function paintDistrictsOnViewGraphics(opts: {
  view: AdminBoundaryView | null | undefined;
  Graphic: typeof Graphic;
  features: Graphic[];
  labelFields: string[];
  bordersVisible: boolean;
  /** When false, only outlines — labels come from the client FeatureLayer. */
  withLabels?: boolean;
}): number {
  const { view, Graphic: GraphicClass, features, labelFields, bordersVisible } = opts;
  const withLabels = opts.withLabels ?? true;
  clearDistrictViewGraphics(view);
  const graphics = view?.graphics;
  if (!bordersVisible || !graphics || !features.length) return 0;

  const outlineSymbol = buildDistrictOutlineSymbol(0.85);
  const tag = { agriAdminTag: AGRI_DISTRICT_VIEW_GRAPHIC_TAG };
  let painted = 0;
  for (const feature of features) {
    if (!feature?.geometry) continue;
    if (
      addGraphicSafely(graphics, GraphicClass, {
        geometry: feature.geometry,
        symbol: outlineSymbol,
        attributes: tag,
      })
    ) {
      painted += 1;
    }
    if (!withLabels) continue;
    const labelProps = buildFeatureLabelGraphicProps(feature, labelFields, tag);
    if (labelProps) addGraphicSafely(graphics, GraphicClass, labelProps);
  }
  return painted;
}

export function findLayerById<T extends Layer = Layer>(
  map: EsriMap | null | undefined,
  id: string,
): T | null {
  if (!map?.layers) return null;
  return (map.layers.find((layer) => layer?.id === id) as T) || null;
}

function removeLayerSafely(map: EsriMap, layer: Layer | null): void {
  if (!layer) return;
  try {
    map.remove(layer);
  } catch {
    /* layer was already removed from the map */
  }
}

export function bringToFront(map: EsriMap | null | undefined, layer: Layer | null): void {
  if (!map || !layer || typeof map.reorder !== "function") return;
  try {
    map.reorder(layer, Math.max(0, (map.layers?.length || 1) - 1));
  } catch {
    /* layer not on this map (removed concurrently) */
  }
}

/**
 * Publish districts as a client FeatureLayer with labelingInfo.
 * TextSymbol on GraphicsLayer / view.graphics is unreliable under ExB MapImage;
 * FeatureLayer labels render consistently on top.
 */
export function publishDistrictLabelFeatureLayer(opts: {
  map: EsriMap;
  FeatureLayer: typeof FeatureLayer;
  Graphic: typeof Graphic;
  features: Graphic[];
  labelFields: string[];
  bordersVisible: boolean;
}): number {
  const { map, labelFields, bordersVisible, features } = opts;
  removeLayerSafely(map, findLayerById(map, AGRI_DISTRICT_LABEL_LAYER_ID));
  if (!bordersVisible || !features.length) return 0;

  const spatialReference =
    features.find((f) => f?.geometry?.spatialReference)?.geometry
      ?.spatialReference || undefined;
  const source = features
    .map((feature, index) => {
      if (!feature?.geometry) return null;
      const label =
        pickFeatureLabel(feature.attributes, labelFields) || `Tuman ${index + 1}`;
      return new opts.Graphic({
        geometry: feature.geometry,
        attributes: { OBJECTID: index + 1, label },
      });
    })
    .filter((graphic): graphic is Graphic => !!graphic);

  if (!source.length) return 0;

  const layer = new opts.FeatureLayer({
    id: AGRI_DISTRICT_LABEL_LAYER_ID,
    title: "Agri district borders",
    source,
    objectIdField: "OBJECTID",
    fields: [
      { name: "OBJECTID", type: "oid" },
      { name: "label", type: "string" },
    ],
    geometryType: "polygon",
    spatialReference,
    renderer: districtRenderer(),
    labelingInfo: [
      {
        labelExpressionInfo: { expression: "$feature.label" },
        labelPlacement: "always-horizontal",
        symbol: LABEL_TEXT_SYMBOL,
      },
    ],
    labelsVisible: true,
    listMode: "hide",
    legendEnabled: false,
    popupEnabled: false,
    opacity: 1,
  });
  try {
    map.add(layer);
    bringToFront(map, layer);
  } catch {
    return 0;
  }
  return source.length;
}

export function clearDistrictLabelFeatureLayer(map: EsriMap | null | undefined): void {
  if (!map) return;
  removeLayerSafely(map, findLayerById(map, AGRI_DISTRICT_LABEL_LAYER_ID));
}

export function buildDistrictLabelingInfo(
  labelField: string,
): __esri.LabelClassProperties[] {
  const field = String(labelField || "label")
    .trim()
    .replace(/"/g, "");
  const safe = field || "label";
  return [
    {
      labelExpressionInfo: { expression: `$feature["${safe}"]` },
      labelPlacement: "always-horizontal",
      symbol: LABEL_TEXT_SYMBOL,
      minScale: 0,
      maxScale: 0,
    },
  ];
}

const trimSlash = (url: unknown): string => String(url || "").replace(/\/$/, "");

export function ensureDistrictFsBorderLayer(
  map: EsriMap,
  FeatureLayerClass: typeof FeatureLayer,
  url: string,
  visible: boolean,
): FeatureLayer | null {
  let layer = findLayerById<FeatureLayer>(map, AGRI_DISTRICT_FS_LAYER_ID);
  if (layer && trimSlash(layer.url) !== trimSlash(url)) {
    removeLayerSafely(map, layer);
    layer = null;
  }
  if (layer) {
    try {
      layer.visible = visible;
    } catch {
      /* layer destroyed — next sync recreates it */
    }
    return layer;
  }
  const created = new FeatureLayerClass({
    id: AGRI_DISTRICT_FS_LAYER_ID,
    title: "Agri district borders",
    url,
    listMode: "hide",
    legendEnabled: false,
    popupEnabled: false,
    outFields: ["*"],
    visible,
    opacity: 1,
    definitionExpression: "1=0",
    labelingInfo: [],
    labelsVisible: true,
    renderer: districtRenderer(),
  });
  try {
    map.add(created);
  } catch {
    return null;
  }
  return created;
}

export function clearDistrictFsBorderLayer(map: EsriMap | null | undefined): void {
  if (!map) return;
  const existing = findLayerById<FeatureLayer>(map, AGRI_DISTRICT_FS_LAYER_ID);
  if (!existing) return;
  try {
    existing.definitionExpression = "1=0";
    existing.visible = false;
  } catch {
    /* layer destroyed — removal below still runs */
  }
  removeLayerSafely(map, existing);
}

function removeLegacyFeatureBoundaryLayers(map: EsriMap, urlHint: string): void {
  if (!map?.layers || !urlHint) return;
  for (const layer of map.layers.toArray?.() || []) {
    if (
      layer?.id === AGRI_DISTRICT_FS_LAYER_ID ||
      layer?.id === AGRI_DISTRICT_LABEL_LAYER_ID
    ) {
      continue;
    }
    const type = String(layer?.type || "").toLowerCase();
    const url = String((layer as Layer & { url?: string | null }).url || "");
    if (type === "feature" && url.includes(urlHint)) {
      removeLayerSafely(map, layer);
    }
  }
}

export function ensureOutlineLayer(
  map: EsriMap,
  GraphicsLayerClass: typeof GraphicsLayer,
  opts: { id: string; title: string; urlHint: string },
): GraphicsLayer {
  removeLegacyFeatureBoundaryLayers(map, opts.urlHint);
  let layer = findLayerById(map, opts.id);
  if (layer && String(layer.type || "").toLowerCase() !== "graphics") {
    removeLayerSafely(map, layer);
    layer = null;
  }
  if (layer) return layer as GraphicsLayer;
  const created = new GraphicsLayerClass({
    id: opts.id,
    title: opts.title,
    listMode: "hide",
    visible: false,
    opacity: 1,
  });
  map.add(created);
  return created;
}

/** Layers hideLayer can reset (GraphicsLayer outline or FeatureLayer). */
interface HideableLayer {
  visible?: boolean;
  removeAll?(): void;
  definitionExpression?: string | null;
}

export function hideLayer(layer: HideableLayer | null | undefined): void {
  if (!layer) return;
  try {
    layer.visible = false;
    if (typeof layer.removeAll === "function") layer.removeAll();
    if ("definitionExpression" in layer) layer.definitionExpression = "1=0";
  } catch {
    /* layer destroyed mid-sync */
  }
}
