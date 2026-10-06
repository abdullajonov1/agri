/**
 * One-shot JSON query of an admin boundary layer, drawn onto an outline
 * GraphicsLayer (and, for districts, the client label FeatureLayer +
 * view.graphics). Also the extent-only lookup used before zooming.
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Graphic from "esri/Graphic";
import type Geometry from "esri/geometry/Geometry";
import type Extent from "esri/geometry/Extent";
import { isValidMapExtent } from "../feature-layer-data";
import { agroV5Log } from "../agri-debug-log";
import { DISTRICT_LABEL_FIELD_PREF, pickField } from "./boundary-fields";
import type { ViloyatDistrictFilter } from "./boundary-where";
import { filterDistrictFeaturesToViloyat } from "./boundary-where";
import type { AdminBoundaryView } from "./boundary-modules";
import { boundaryErrorText } from "./boundary-error";
import {
  addGraphicSafely,
  buildDistrictOutlineSymbol,
  buildFeatureLabelGraphicProps,
  buildOutlineSymbol,
  clearDistrictViewGraphics,
  hideLayer,
  paintDistrictsOnViewGraphics,
  pickFeatureLabel,
  publishDistrictLabelFeatureLayer,
} from "./boundary-graphics";

export type SpatialRelationship = __esri.Query["spatialRelationship"];

/** `resultOffset` is honoured by the REST API but missing from Query typings. */
type PagedQuery = __esri.Query & { resultOffset?: number };

const PAGE_SIZE = 200;
const MAX_PAGES = 50;

export interface OutlineQueryOptions {
  queryLayer: FeatureLayer | null;
  outlineLayer: GraphicsLayer;
  Graphic: typeof Graphic;
  FeatureLayer?: typeof FeatureLayer | null;
  where: string;
  view: AdminBoundaryView | null | undefined;
  outlineWidth: number;
  bordersVisible: boolean;
  /** Draw district names at polygon centroids (viloyat overview). */
  withLabels?: boolean;
  /** Use high-contrast district stroke (yellow) instead of white. */
  districtStyle?: boolean;
  /** Optional spatial filter (e.g. districts contained by viloyat polygon). */
  geometry?: Geometry | null;
  spatialRelationship?: SpatialRelationship;
  /** When set, drop features that do not belong to this viloyat. */
  viloyatFilter?: ViloyatDistrictFilter | null;
}

export interface OutlineQueryResult {
  extent: Extent | null;
  featureCount: number;
  /** First polygon geometry — used as spatial filter for child districts. */
  firstGeometry: Geometry | null;
  features: Graphic[];
  labelFields: string[];
}

interface PagedQueryOptions {
  queryLayer: FeatureLayer;
  where: string;
  outFields: string[];
  geometry: Geometry | null;
  spatialRelationship: SpatialRelationship;
}

async function queryAllPages(
  opts: PagedQueryOptions,
  maxAllowableOffset?: number,
): Promise<Graphic[]> {
  const { queryLayer, where, outFields, geometry, spatialRelationship } = opts;
  const allFeatures: Graphic[] = [];
  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const query: PagedQuery = queryLayer.createQuery();
    query.where = where && where !== "1=0" ? where : "1=1";
    query.returnGeometry = true;
    query.outFields = outFields;
    query.num = PAGE_SIZE;
    if (geometry) {
      query.geometry = geometry;
      query.spatialRelationship = spatialRelationship;
    }
    if (maxAllowableOffset != null && maxAllowableOffset > 0) {
      query.maxAllowableOffset = maxAllowableOffset;
    }
    query.resultOffset = offset;
    const result = await queryLayer.queryFeatures(query);
    const batch = result?.features || [];
    allFeatures.push(...batch);
    const exceeded = Boolean(result?.exceededTransferLimit);
    if (batch.length < PAGE_SIZE && !exceeded) break;
    if (!batch.length) break;
    offset += batch.length;
    if (!exceeded && batch.length < PAGE_SIZE) break;
  }
  return allFeatures;
}

/** Full rings first; on failure / no rows retry once with a generalized offset. */
async function queryOutlineFeatures(
  opts: PagedQueryOptions,
  view: AdminBoundaryView | null | undefined,
): Promise<Graphic[]> {
  let features: Graphic[] = [];
  let queryError: string | null = null;
  try {
    // Full rings — same visual as the previous FeatureLayer outline.
    // Do not generalize here: a 50–150 m offset made Farg'ona look jagged.
    features = await queryAllPages(opts);
  } catch (err) {
    queryError = boundaryErrorText(err);
    features = [];
  }
  if (!features.length) {
    try {
      const resolution = Number(view?.resolution);
      const fallbackOffset =
        Number.isFinite(resolution) && resolution > 0 ? resolution * 0.25 : 5;
      features = await queryAllPages(opts, fallbackOffset);
    } catch (err) {
      queryError = queryError || boundaryErrorText(err);
      features = [];
    }
  }

  if (queryError) {
    agroV5Log(
      "admin-boundary:query-failed",
      {
        where: String(opts.where).slice(0, 180),
        hasGeometry: !!opts.geometry,
        error: queryError,
        layerFields: (opts.queryLayer?.fields || [])
          .slice(0, 24)
          .map((f) => f?.name),
      },
      "tuman",
    );
  }
  return features;
}

function collectLabelFields(queryLayer: FeatureLayer, wanted: boolean): string[] {
  const labelFields: string[] = [];
  if (!wanted) return labelFields;
  for (const candidate of DISTRICT_LABEL_FIELD_PREF) {
    const hit = pickField(queryLayer, [candidate]);
    if (hit && !labelFields.includes(hit)) labelFields.push(hit);
  }
  return labelFields;
}

function drawOutlineGraphics(
  opts: OutlineQueryOptions,
  features: Graphic[],
  labelFields: string[],
): void {
  const { outlineLayer, Graphic: GraphicClass, outlineWidth } = opts;
  const withLabels = opts.withLabels ?? false;
  const districtStyle = opts.districtStyle ?? false;
  const symbol = districtStyle
    ? buildDistrictOutlineSymbol(outlineWidth)
    : buildOutlineSymbol(outlineWidth);
  for (const feature of features) {
    if (!feature?.geometry) continue;
    addGraphicSafely(outlineLayer, GraphicClass, {
      geometry: feature.geometry,
      symbol,
    });
    // districtStyle labels come from ONE of: client FeatureLayer or
    // view.graphics — never also from this GraphicsLayer (double text).
    if (districtStyle || !withLabels || !labelFields.length) continue;
    const labelProps = buildFeatureLabelGraphicProps(feature, labelFields);
    if (labelProps) addGraphicSafely(outlineLayer, GraphicClass, labelProps);
  }

  try {
    outlineLayer.visible = opts.bordersVisible && features.length > 0;
  } catch {
    /* layer destroyed mid-sync — nothing left to show or hide */
  }
}

/** Client label FeatureLayer first; view.graphics labels only as fallback. */
function publishDistrictOverlays(
  opts: OutlineQueryOptions,
  features: Graphic[],
  labelFields: string[],
): void {
  const { view, Graphic: GraphicClass, bordersVisible } = opts;
  let clientFl = 0;
  const map = view?.map;
  if (map && opts.FeatureLayer) {
    clientFl = publishDistrictLabelFeatureLayer({
      map,
      FeatureLayer: opts.FeatureLayer,
      Graphic: GraphicClass,
      features,
      labelFields,
      bordersVisible,
    });
  }
  // Prefer FeatureLayer labelingInfo. Only fall back to TextSymbol on
  // view.graphics when the client layer did not publish — never both.
  const painted = paintDistrictsOnViewGraphics({
    view,
    Graphic: GraphicClass,
    features,
    labelFields,
    bordersVisible,
    withLabels: clientFl <= 0,
  });
  agroV5Log(
    "admin-boundary:view-graphics",
    {
      featureCount: features.length,
      painted,
      clientFl,
      labelFieldCount: labelFields.length,
      sampleLabel: features[0]
        ? pickFeatureLabel(features[0].attributes, labelFields)
        : null,
      sampleAttrKeys: features[0]
        ? Object.keys(features[0].attributes || {}).slice(0, 12)
        : [],
    },
    "tuman",
  );
}

export function extentFromFeatures(
  features: Array<Pick<Graphic, "geometry">>,
): Extent | null {
  let merged: Extent | null = null;
  for (const feature of features) {
    const featureExtent = feature?.geometry?.extent;
    if (!featureExtent || !isValidMapExtent(featureExtent)) continue;
    merged = merged
      ? merged.union(featureExtent)
      : featureExtent.clone?.() || featureExtent;
  }
  return isValidMapExtent(merged) ? merged : null;
}

/** queryExtent fallback when no feature carried a usable extent. */
async function queryFallbackExtent(
  queryLayer: FeatureLayer,
  where: string,
  geometry: Geometry | null,
  spatialRelationship: SpatialRelationship,
): Promise<Extent | null> {
  try {
    const query = queryLayer.createQuery();
    query.where = where && where !== "1=0" ? where : "1=1";
    if (geometry) {
      query.geometry = geometry;
      query.spatialRelationship = spatialRelationship;
    }
    query.returnGeometry = true;
    const extent = (await queryLayer.queryExtent(query))?.extent;
    if (isValidMapExtent(extent)) return extent;
  } catch {
    /* extent is optional — callers fall back to the feature extent / null */
  }
  return null;
}

export async function queryAndDrawOutline(
  opts: OutlineQueryOptions,
): Promise<OutlineQueryResult> {
  const { queryLayer, outlineLayer, where, view } = opts;
  const withLabels = opts.withLabels ?? false;
  const districtStyle = opts.districtStyle ?? false;
  const geometry = opts.geometry ?? null;
  const spatialRelationship: SpatialRelationship =
    opts.spatialRelationship ?? "intersects";
  const viloyatFilter = opts.viloyatFilter ?? null;

  try {
    outlineLayer.removeAll?.();
  } catch {
    /* layer destroyed — the hide / redraw below handles it */
  }

  if (!queryLayer || ((!where || where === "1=0") && !geometry)) {
    hideLayer(outlineLayer);
    if (districtStyle) clearDistrictViewGraphics(view);
    return {
      extent: null,
      featureCount: 0,
      firstGeometry: null,
      features: [],
      labelFields: [],
    };
  }

  const oidField = queryLayer.objectIdField || "OBJECTID";
  const labelFields = collectLabelFields(queryLayer, withLabels || districtStyle);
  // Request all fields for districts so unknown name schemas still label.
  const outFields =
    withLabels || districtStyle
      ? ["*"]
      : Array.from(new Set([oidField, ...labelFields]));

  let features = await queryOutlineFeatures(
    { queryLayer, where, outFields, geometry, spatialRelationship },
    view,
  );

  if (districtStyle && viloyatFilter) {
    const before = features.length;
    features = filterDistrictFeaturesToViloyat(features, viloyatFilter);
    if (before !== features.length) {
      agroV5Log(
        "admin-boundary:client-filter",
        { before, after: features.length, parentCod: viloyatFilter.parentCod },
        "tuman",
      );
    }
  }

  drawOutlineGraphics(opts, features, labelFields);
  if (districtStyle) publishDistrictOverlays(opts, features, labelFields);

  const firstGeometry = features.find((f) => f?.geometry)?.geometry || null;
  const extent =
    extentFromFeatures(features) ||
    (await queryFallbackExtent(queryLayer, where, geometry, spatialRelationship));
  return {
    extent,
    featureCount: features.length,
    firstGeometry,
    features,
    labelFields,
  };
}

/** Extent-only admin boundary lookup — no map draw (use before zoom). */
export async function queryLayerExtentOnly(
  queryLayer: FeatureLayer | null,
  where: string,
): Promise<Extent | null> {
  if (!queryLayer || !where || where === "1=0") return null;
  try {
    const query = queryLayer.createQuery();
    query.where = where;
    query.returnGeometry = true;
    const extent = (await queryLayer.queryExtent(query))?.extent;
    if (isValidMapExtent(extent)) return extent;
  } catch {
    /* unreachable / bad WHERE — caller tries the next attempt or gives up */
  }
  return null;
}
