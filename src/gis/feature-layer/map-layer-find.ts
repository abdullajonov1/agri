/**
 * Locate a queryable field layer on the live map by service URL or layer id
 * (FeatureLayers and MapImage sublayers alike).
 */
import { normalizeQueryableLayerUrl, isQueryableFieldLayer } from "./primitives";
import { getAllFeatureLayersFromMap } from "./layer-lookup";
import type { AgriLayerLike, AgriMapLike } from "../agri-layer-types";

export function findQueryableLayerOnMapByUrl(
  map: AgriMapLike | null | undefined,
  url: string,
): AgriLayerLike | null {
  const target = normalizeQueryableLayerUrl(url);
  if (!map || !target) return null;

  for (const layer of getAllFeatureLayersFromMap(map)) {
    if (normalizeQueryableLayerUrl(String(layer?.url || "")) === target) {
      return layer;
    }
  }

  const roots: AgriLayerLike[] = map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  for (const root of roots) {
    if (String(root?.type || "").toLowerCase() !== "map-image") continue;
    const subs =
      root.allSublayers?.toArray?.() || root.sublayers?.toArray?.() || [];
    for (const sub of subs) {
      if (
        isQueryableFieldLayer(sub) &&
        normalizeQueryableLayerUrl(String(sub?.url || "")) === target
      ) {
        return sub;
      }
    }
  }
  return null;
}
/** @deprecated Prefer findQueryableLayerOnMapByUrl — numeric ids collide across Map Services. */
export function findQueryableLayerOnMapById(
  map: AgriMapLike | null | undefined,
  layerId: string,
): AgriLayerLike | null {
  const id = String(layerId ?? "").trim();
  if (!map || !id) return null;

  const matches: AgriLayerLike[] = [];
  for (const layer of getAllFeatureLayersFromMap(map)) {
    if (String(layer?.id ?? "") === id) matches.push(layer);
  }

  const roots: AgriLayerLike[] = map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  for (const root of roots) {
    if (String(root?.type || "").toLowerCase() !== "map-image") continue;
    const subs =
      root.allSublayers?.toArray?.() || root.sublayers?.toArray?.() || [];
    for (const sub of subs) {
      if (String(sub?.id ?? "") === id && isQueryableFieldLayer(sub)) {
        matches.push(sub);
      }
    }
  }

  if (matches.length === 1) return matches[0];
  return null;
}
