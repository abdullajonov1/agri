import type { AgriMapLayer } from "../../../../../localization/agri-map-layer";
import { canQuerySpatialFeatureExtent, readSpatialFeatureExtentWhere, appendSpatialFeatureExtent } from "../../../../../localization/map-shown-extent";
import { isMapImageOwnedLayer, safeLoadMapLayer } from "../../../../../../gis/feature-layer-data";
import { agroV5Log } from "../../../../../../shared/agri-debug-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

export interface SpatialExtentResult {
  extent: __esri.Extent | null;
  /** True when the apply was superseded while querying; caller must stop. */
  stale: boolean;
}

type LayerQueryOutcome =
  | { queried: false }
  | { queried: true; extent: __esri.Extent | null | undefined };

/** Query one spatial layer; `queried: false` when it cannot be queried. Throws on failure. */
const querySpatialLayerExtent = async (
  spatialLayer: AgriMapLayer,
): Promise<LayerQueryOutcome> => {
  if (typeof spatialLayer?.load === "function") {
    await safeLoadMapLayer(spatialLayer);
  }
  if (!canQuerySpatialFeatureExtent(spatialLayer)) return { queried: false };
  const where = readSpatialFeatureExtentWhere(spatialLayer);
  if (!where) return { queried: false };
  const query: __esri.QueryProperties = spatialLayer?.createQuery
    ? spatialLayer.createQuery()
    : {};
  query.where = where;
  const result = await spatialLayer.queryExtent(query);
  return { queried: true, extent: result?.extent };
};

/**
 * Crop / NDVI / vegetation zoom: union the extents of non-MapImage spatial
 * FeatureLayers that carry the uniqueid mirror (MapImage leaves are skipped).
 */
export const queryMergedSpatialExtent = async (
  spatialLayers: readonly AgriMapLayer[],
  isStale: () => boolean,
): Promise<SpatialExtentResult> => {
  let merged: __esri.Extent | null = null;
  for (const spatialLayer of spatialLayers) {
    if (isStale()) return { extent: merged, stale: true };
    if (isMapImageOwnedLayer(spatialLayer)) continue;
    try {
      const outcome = await querySpatialLayerExtent(spatialLayer);
      if (!outcome.queried) continue;
      if (isStale()) return { extent: merged, stale: true };
      merged = appendSpatialFeatureExtent(merged, outcome.extent);
    } catch (error) {
      agroV5Log(
        "map-filter spatial layer extent failed",
        { layerId: (spatialLayer as { id?: string })?.id, error: errorMessage(error) },
        "map",
      );
    }
  }
  return { extent: merged, stale: false };
};
