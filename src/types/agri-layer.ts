/**
 * Structural layer shapes shared by data / gis helpers.
 * Callers pass FeatureLayer, MapImage sublayers, or jimu data-source layers;
 * these interfaces describe only what the helpers read, so all of them fit.
 */

export interface AgriFieldLike {
  name: string;
  type?: string;
  alias?: string | null;
}

export interface AgriLayerWithFields {
  fields?: AgriFieldLike[] | null;
}

export interface AgriLayerUrlLike {
  url?: string | null;
  layer?: { url?: string | null } | null;
}

/** Minimal queryable layer — FeatureLayer and Sublayer both satisfy it. */
export interface AgriQueryableLayer extends AgriLayerUrlLike {
  objectIdField?: string;
  createQuery(): __esri.Query;
  queryFeatures(query: __esri.Query | __esri.QueryProperties): Promise<__esri.FeatureSet>;
  queryFeatureCount?(query: __esri.Query | __esri.QueryProperties): Promise<number>;
}

/** Layer that may need an explicit `load()` before fields are available. */
export interface AgriLoadableLayer {
  loaded?: boolean;
  load?: () => Promise<unknown>;
}

/** Feature set as returned with returnCountOnly (count is not on FeatureSet typings). */
export type AgriCountFeatureSet = __esri.FeatureSet & {
  count?: number;
  totalCount?: number;
};

export type AgriAttributes = Record<string, unknown>;

/** Read a layer's service URL (layer.url, or parent layer.url for sublayers). */
export const readLayerUrl = (layer: AgriLayerUrlLike | null | undefined): string =>
  String(layer?.url || layer?.layer?.url || "").trim();

/** Ensure a lazily loaded layer is ready; no-op when already loaded. */
export const ensureLayerLoaded = async (
  layer: AgriLoadableLayer | null | undefined,
): Promise<void> => {
  if (layer && !layer.loaded && typeof layer.load === "function") {
    await layer.load();
  }
};
