/**
 * Structural types for the ArcGIS objects the gis layer duck-types.
 *
 * The widget walks FeatureLayers, MapImageLayers, MapImage Sublayers and
 * GroupLayers through the same helpers, reading optional members that only
 * some of those classes expose. These interfaces describe exactly the members
 * the helpers touch, so every real ArcGIS layer class is assignable to them
 * without `any`. `declaredClass` (present on every esri Accessor) keeps the
 * all-optional shapes from tripping TypeScript's weak-type check.
 */
import type Query from "esri/rest/support/Query";
import type FeatureSet from "esri/rest/support/FeatureSet";
import type Extent from "esri/geometry/Extent";
import type Graphic from "esri/Graphic";

export type AgriQueryInput = Query | __esri.QueryProperties;

export interface AgriFieldLike {
  name?: string;
  alias?: string | null;
  type?: string;
}

export interface AgriCollectionLike<T> {
  length?: number;
  items?: T[];
  toArray?(): T[];
  find?(callback: (item: T) => boolean): T | null | undefined;
}

export interface AgriWatchHandle {
  remove(): void;
}

export interface AgriExtentQueryResult {
  count?: number;
  extent?: Extent | null;
}

export interface AgriLayerLike {
  declaredClass?: string;
  id?: string | number;
  title?: string | null;
  url?: string | null;
  type?: string;
  layerId?: number | string;
  fields?: AgriFieldLike[] | null;
  objectIdField?: string | null;
  parent?: AgriLayerLike | null;
  layer?: AgriLayerLike | null;
  sublayers?: AgriCollectionLike<AgriLayerLike> | null;
  allSublayers?: AgriCollectionLike<AgriLayerLike> | null;
  /** esri types this as `any`; we only ever read `.type`. */
  sourceJSON?: { type?: string } | null;
  resourceInfo?: { type?: string } | null;
  /** DynamicMapLayer / Collection<Graphic> / … — read via readTypeTag(). */
  source?: unknown;
  loaded?: boolean;
  definitionExpression?: string | null;
  minScale?: number;
  maxScale?: number;
  visible?: boolean;
  opacity?: number;
  pbfEnabled?: boolean;
  fullExtent?: Extent | null;
  load?(options?: unknown): Promise<unknown>;
  refresh?(): void;
  watch?(
    path: string,
    callback: (newValue: unknown) => void,
  ): AgriWatchHandle;
  createQuery?(): Query;
  queryFeatures?(query?: AgriQueryInput, options?: unknown): Promise<FeatureSet>;
  queryFeatureCount?(query?: AgriQueryInput, options?: unknown): Promise<number>;
  queryExtent?(
    query?: AgriQueryInput,
    options?: unknown,
  ): Promise<AgriExtentQueryResult>;
  queryObjectIds?(
    query?: AgriQueryInput,
    options?: unknown,
  ): Promise<Array<number | string>>;
}

/** Map / GroupLayer containers walked when collecting field layers. */
export interface AgriMapLike {
  declaredClass?: string;
  layers?: AgriCollectionLike<AgriLayerLike> | null;
  allLayers?: AgriCollectionLike<AgriLayerLike> | null;
}

/**
 * `maxRecordCount` read off a layer — not on the esri layer typings, but some
 * service-backed layers carry it at runtime; read defensively.
 */
export type AgriLayerWithMaxRecordCount = AgriLayerLike & {
  maxRecordCount?: unknown;
};

/** Plain statistic JSON for Query.outStatistics (autocast by the setter). */
export type AgriStatisticJson = __esri.StatisticDefinitionProperties;

/** JimuMapView-like host: only `view.map` is read. */
export interface AgriMapViewHostLike {
  view?: { map?: AgriMapLike | null } | null;
}

/** `attributes` bag of a queried feature (esri types it as `any`). */
export type AgriAttributes = Record<string, unknown>;

/** Graphic as returned by queryFeatures — attributes read defensively. */
export type AgriFeature = Pick<Graphic, "geometry"> & {
  attributes?: AgriAttributes | null;
};

/** Geometry JSON from a REST `/query` response (only the members read). */
export interface AgriRestGeometryJson {
  x?: number | null;
  y?: number | null;
  rings?: number[][][] | null;
  paths?: number[][][] | null;
  spatialReference?: __esri.SpatialReferenceProperties | null;
}

/** One feature of a REST `/query` JSON response. */
export interface AgriRestFeatureJson {
  attributes?: AgriAttributes | null;
  geometry?: AgriRestGeometryJson | null;
}

/** Envelope JSON (REST `extent`, or built locally from coordinates). */
export interface AgriRestExtentJson {
  xmin?: number;
  ymin?: number;
  xmax?: number;
  ymax?: number;
  spatialReference?: __esri.SpatialReferenceProperties | null;
}

/**
 * REST `/query` JSON response (`f=json`). Shape depends on the request
 * parameters, so every member is optional and read defensively.
 */
export interface AgriRestQueryResponse {
  features?: AgriRestFeatureJson[] | null;
  count?: number | null;
  extent?: AgriRestExtentJson | null;
  objectIds?: Array<number | string> | null;
  exceededTransferLimit?: boolean;
  error?: { message?: string | null } | null;
}

/** `feature.attributes || {}` — attribute bag of a queried feature / REST row. */
export function featureAttributeBag(
  feature: { attributes?: unknown } | null | undefined,
): AgriAttributes {
  return (feature?.attributes || {}) as AgriAttributes;
}

/**
 * `layer.fields[].name` in field order (loaded esri fields always carry a
 * name; a null entry throws exactly like the inline `.map(f => f.name)`).
 */
export function layerFieldNameList(
  layer: Pick<AgriLayerLike, "fields">,
): string[] {
  return (layer.fields || []).map((f) => f.name as string);
}

/** Read a `.type` tag off an untyped object (`layer.source`, REST JSON, …). */
export function readTypeTag(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const tag = (value as { type?: unknown }).type;
  return tag == null ? "" : String(tag);
}

/** `.toArray()` of a collection-like, or `[]`. */
export function collectionToArray<T>(
  collection: AgriCollectionLike<T> | null | undefined,
): T[] {
  const arr = collection?.toArray?.();
  return Array.isArray(arr) ? arr : [];
}

/**
 * First collection whose toArray() returns something — mirrors the original
 * `a?.toArray?.() || b?.toArray?.() || []` chains (an empty array still wins).
 */
export function firstCollectionArray<T>(
  ...collections: Array<AgriCollectionLike<T> | null | undefined>
): T[] {
  for (const collection of collections) {
    const arr = collection?.toArray?.();
    if (arr) return Array.isArray(arr) ? arr : [];
  }
  return [];
}

/** Error message from an unknown thrown value. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (msg != null && String(msg)) return String(msg);
  }
  return String(err);
}
