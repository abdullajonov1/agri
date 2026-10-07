/**
 * Spatial polygon layer lookup for Graff: Agri_table_data has no geometry,
 * so highlight/zoom resolves the matching feature on a live spatial leaf.
 */
import type { GraffWidgetHost } from "../graff-host";
import type { AgriLayerLike } from "../../../../gis/agri-layer-types";
import { isAgriSpatialLayerUrl, isLayerTreeVisible } from "../graff-map-utils";
import { buildUniqueidUpperEqualsWhere } from "../../../../data/agri-uniqueid-sql";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../gis/agri-table-data-source";
import {
  ensureAgriServerIdentityToken,
  resolveQueryableServiceUrl,
  getDetachedQueryLayerForUrl,
  isMapImageGroupSublayer,
  collectQueryableFieldLayers,
  getQueryableLayer,
  getMapImageParentLayer,
  scoreHaystackForFilters,
  haystackMatchesRegion,
} from "../../../../gis/feature-layer-data";
import { graffDebugCatch } from "../graff-log";

/** Layer tagged with the REST URL resolved for it (see add() below). */
/** A queryable layer tagged with its resolved service URL. */
export type TaggedLayer = AgriLayerLike & { __agriQueryableUrl?: string };

/** Cap: wrong-year republic leaves burn tokens and hide the real miss. */
const MAX_SPATIAL_CANDIDATES = 8;
const VISIBLE_LAYER_BONUS = 50;
const REGION_MATCH_BONUS = 40;
const LEAF_ENDPOINT_RE = /\/(?:MapServer|FeatureServer)\/\d+$/i;
const SPATIAL_KEY_FIELDS = ["uniqueid", AGRI_TABLE_JOIN_FIELD, "turi", "crop_id"];

/** Agri_table_data has no geometry — look up the matching spatial feature (for highlight/zoom) by uniqueid. */
export const findSpatialFeatureByUniqueId = async (host: GraffWidgetHost, uniqueId: string): Promise<__esri.Graphic | null> => {
  const id = String(uniqueId || "").trim();
  if (!id) return null;
  const where = buildUniqueidUpperEqualsWhere(id, AGRI_TABLE_JOIN_FIELD);
  if (!where || where === "1=0") return null;
  await ensureAgriServerIdentityToken();
  for (const spatialLayer of host.getTableSpatialQueryCandidates()) {
    const url = resolveQueryableServiceUrl(spatialLayer);
    if (!url) continue;
    let detached: __esri.FeatureLayer | null | undefined =
      host._detachedSpatialQueryLayers.get(url);
    if (!detached) {
      try {
        detached = await getDetachedQueryLayerForUrl(url);
        if (detached) host._detachedSpatialQueryLayers.set(url, detached);
      } catch {
        detached = null;
      }
    }
    if (!detached) continue;
    const q = detached.createQuery();
    q.outFields = ["*"];
    q.returnGeometry = true;
    q.num = 1;
    q.where = where;
    try {
      const res = await detached.queryFeatures(q);
      if (res?.features?.length) return res.features[0];
    } catch {
      /* try next layer */
    }
  }
  return null;
};

/** Leaf layer carries at least one join/category field (or exposes none yet). */
const hasSpatialKeyField = (layer: AgriLayerLike): boolean => {
  const fields = (layer.fields || []).map((field) =>
    String(field?.name || "").toLowerCase(),
  );
  return !fields.length || SPATIAL_KEY_FIELDS.some((name) => fields.includes(name));
};

const collectSpatialCandidates = (host: GraffWidgetHost): TaggedLayer[] => {
  const candidates: TaggedLayer[] = [];
  const seen = new Set<string>();
  const add = (layer: AgriLayerLike | null | undefined) => {
    if (!layer || isMapImageGroupSublayer(layer)) return;
    const rawUrl = resolveQueryableServiceUrl(layer);
    if (!rawUrl || !isAgriSpatialLayerUrl(rawUrl)) return;
    // FeatureLayer queries need a leaf endpoint — MapServer roots always 499/fail.
    if (!LEAF_ENDPOINT_RE.test(rawUrl)) return;
    const key = rawUrl.toLowerCase();
    if (seen.has(key)) return;
    if (!hasSpatialKeyField(layer)) return;
    seen.add(key);
    const tagged: TaggedLayer = layer;
    // Stash resolved URL so the query loop does not re-derive from a bad live.url
    try {
      tagged.__agriQueryableUrl = rawUrl;
    } catch (err) {
      graffDebugCatch("getTableSpatialQueryCandidates:tagUrl", err);
    }
    candidates.push(tagged);
  };

  (host.state.spatialClickLayers || []).forEach(add);
  const map = host.state.activeMapView?.view?.map;
  // allLayers is essential here: map.layers only contains top-level
  // GroupLayers in this portal, while the regional MapImageLayers live
  // below database-YYYY groups.
  const roots: AgriLayerLike[] =
    map?.allLayers?.toArray?.() || map?.layers?.toArray?.() || [];
  for (const root of roots) {
    for (const leaf of collectQueryableFieldLayers(root)) {
      add(leaf);
    }
    // Fallback when collectQueryableFieldLayers finds nothing yet (still hydrating)
    add(getQueryableLayer(root));
  }
  return candidates;
};

export const getTableSpatialQueryCandidates = (host: GraffWidgetHost): TaggedLayer[] => {
  const filters = {
    yil: String(host.state.regionalFilters?.yil || "").trim(),
    viloyat: String(host.state.regionalFilters?.viloyat || "").trim(),
  };
  const scored = collectSpatialCandidates(host).map((layer) => {
    const parent = getMapImageParentLayer(layer);
    const haystack = `${parent?.title || ""} ${layer?.title || ""} ${
      layer.__agriQueryableUrl || resolveQueryableServiceUrl(layer)
    }`;
    let score = scoreHaystackForFilters(haystack, filters);
    if (isLayerTreeVisible(layer)) score += VISIBLE_LAYER_BONUS;
    if (haystackMatchesRegion(haystack, filters.viloyat)) score += REGION_MATCH_BONUS;
    return { layer, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Live FeatureLayer / MapImage sublayer instances, typed structurally.
  return scored
    .slice(0, MAX_SPATIAL_CANDIDATES)
    .map((item) => item.layer);
};
