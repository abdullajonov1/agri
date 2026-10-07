import { type ShownRegionYearLayer, clearScaleLimitsOnRegionYearTree, clearFieldLayerScaleLimits, looksLikeRegionYearLayerHaystack, haystackHasKnownRegionToken, getAgriLayerMapKey } from "../primitives";
import { isAgriMapLayerCandidate } from "./lookup-collect";
import type { AgriLayerLike, AgriMapLike } from "../../agri-layer-types";

/** GroupLayer exposes `layers`; MapImage / Feature leaves do not. */
type AgriTreeNode = AgriLayerLike & Pick<AgriMapLike, "layers">;

/** Public: re-unlock scales on already-shown region-year layers (post-load). */
export function unlockShownRegionYearFieldScales(
  shown: ShownRegionYearLayer[] | null | undefined,
): void {
  for (const entry of shown || []) {
    if (entry?.layer) clearScaleLimitsOnRegionYearTree(entry.layer);
    for (const sub of entry?.sublayers || []) {
      clearFieldLayerScaleLimits(sub);
    }
  }
}
/**
 * Collect only per-region field leaves (never the republic aggregate container).
 * Safe: does not toggle visibility and does not request exports.
 */
export function collectRegionYearLeafLayers(
  map: AgriMapLike,
): AgriLayerLike[] {
  const out: AgriLayerLike[] = [];
  const seen = new Set<AgriLayerLike>();

  const consider = (layer: AgriTreeNode | null | undefined): void => {
    if (!layer || seen.has(layer)) return;
    seen.add(layer);
    const type = String(layer?.type || "").toLowerCase();
    if (type === "group") {
      const children = layer.layers?.toArray?.() || [];
      for (const child of children) consider(child);
      return;
    }
    if (type === "map-image") {
      const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
      // Single-region MapImage (classic naming) — treat the service itself.
      if (
        looksLikeRegionYearLayerHaystack(haystack) &&
        haystackHasKnownRegionToken(haystack)
      ) {
        out.push(layer);
      }
      const subs =
        layer.allSublayers?.toArray?.() ||
        layer.sublayers?.toArray?.() ||
        [];
      for (const sub of subs) consider(sub);
      return;
    }

    const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
    if (
      looksLikeRegionYearLayerHaystack(haystack) &&
      haystackHasKnownRegionToken(haystack)
    ) {
      out.push(layer);
    }
  };

  const roots = map.layers?.toArray?.() || map.allLayers?.toArray?.() || [];
  for (const layer of roots) consider(layer);
  return out;
}
/** Collect every queryable field layer on the map (feature + map-image sublayers). */
export function getAllFeatureLayersFromMap(
  map: AgriMapLike | null | undefined,
): AgriLayerLike[] {
  if (!map) return [];
  const layers: AgriLayerLike[] =
    map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  const result: AgriLayerLike[] = [];
  const seen = new Set<string>();

  const push = (layer: AgriLayerLike): void => {
    if (!isAgriMapLayerCandidate(layer)) return;
    const key = getAgriLayerMapKey(layer);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(layer);
  };

  const walk = (node: AgriLayerLike | null | undefined): void => {
    if (!node) return;
    push(node);
    const subs =
      node?.allSublayers?.toArray?.() ||
      node?.sublayers?.toArray?.() ||
      [];
    if (!Array.isArray(subs)) return;
    for (const sub of subs) walk(sub);
  };

  for (const layer of layers) {
    walk(layer);
  }
  return result;
}
