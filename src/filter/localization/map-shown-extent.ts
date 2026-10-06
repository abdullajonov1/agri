/**
 * Pure helpers for shown region-year MapImage extent collection.
 * ArcGIS queryExtent / goTo stay in LocalizationPanel.
 */
import type { AgriMapLayer } from "./agri-map-layer";
import { isEmptyMapExtent } from "./map-zoom-policy";

export type ShownRegionYearExtentEntry = {
  layer?: AgriMapLayer | null;
  sublayers?: AgriMapLayer[];
};

type MapExtent = __esri.Extent | null | undefined;

/**
 * Sublayers to query for a shown region-year entry.
 * Prefer entry.sublayers ∪ live allSublayers; else the parent layer.
 */
export function collectShownRegionYearQueryTargets(
  entry: ShownRegionYearExtentEntry | null | undefined,
): AgriMapLayer[] {
  if (!entry) return [];
  const liveSublayers: AgriMapLayer[] =
    entry.layer?.allSublayers?.toArray?.() || [];
  const childSublayers = Array.from(
    new Set<AgriMapLayer>([...(entry.sublayers || []), ...liveSublayers]),
  );
  if (childSublayers.length > 0) return childSublayers;
  return entry.layer ? [entry.layer] : [];
}

/**
 * Live definitionExpression for extent query.
 * Returns null when empty or blocked (`1=0`) — matches shown-region / district paths.
 */
export function readQueryableDefinitionExpression(
  layer: AgriMapLayer | null | undefined,
): string | null {
  const where = String(layer?.definitionExpression || "1=1").trim();
  if (!where || where === "1=0") return null;
  return where;
}

/** Union non-empty extents (clone first, then union). */
export function unionMapExtents(extents: MapExtent[]): __esri.Extent | null {
  let merged: __esri.Extent | null = null;
  for (const extent of extents) {
    if (!extent || isEmptyMapExtent(extent)) continue;
    merged = merged ? merged.union(extent) : extent.clone?.() || extent;
  }
  return isEmptyMapExtent(merged) ? null : merged;
}

/**
 * Fallback when DE queryExtent yields nothing: parent MapImage fullExtent.
 */
export function unionShownRegionYearFullExtents(
  entries: ShownRegionYearExtentEntry[] | null | undefined,
): __esri.Extent | null {
  if (!entries?.length) return null;
  const fulls: __esri.Extent[] = [];
  for (const entry of entries) {
    const full = entry.layer?.fullExtent;
    if (full && !isEmptyMapExtent(full)) fulls.push(full);
  }
  return unionMapExtents(fulls);
}

/**
 * Crop / NDVI / vegetation spatial FeatureLayer WHERE for extent query.
 * Intentionally no trim — matches applyMapFiltersOptimized crop path.
 */
export function readSpatialFeatureExtentWhere(
  layer: AgriMapLayer | null | undefined,
): string | null {
  const where = layer?.definitionExpression || "1=1";
  if (where === "1=0") return null;
  return where;
}

/** After load: only layers with geometryType are queryExtent-capable. */
export function canQuerySpatialFeatureExtent(
  layer: AgriMapLayer | null | undefined,
): boolean {
  return !!layer?.geometryType;
}

/**
 * Accumulate crop-path spatial extents.
 * Uses `extent.clone()` (not clone?.() || extent) — matches panel crop loop.
 */
export function appendSpatialFeatureExtent(
  merged: MapExtent,
  extent: MapExtent,
): __esri.Extent | null {
  if (!extent || isEmptyMapExtent(extent)) return merged ?? null;
  return merged ? merged.union(extent) : extent.clone();
}
