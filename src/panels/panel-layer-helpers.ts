/**
 * FeatureLayer helpers shared by the Pie / Indicator / Region panels.
 */

type LayerIdentity = Pick<__esri.FeatureLayer, "title" | "id" | "url">;

const REPUBLIC_LAYER_RE = /\brepublic\b|respublika/;

/** True for the country-wide ("Respublika") layer, matched on title / id / url. */
export const isRepublicFeatureLayer = (
  layer?: Partial<LayerIdentity> | null,
): boolean => {
  if (!layer) return false;
  const text = `${layer.title || ""} ${layer.id || ""} ${layer.url || ""}`.toLowerCase();
  return REPUBLIC_LAYER_RE.test(text);
};

/**
 * Default layer for queries: the republic layer when present, else the first
 * layer, else `fallback`.
 */
export const pickDefaultFeatureLayer = <T extends Partial<LayerIdentity>>(
  layers: readonly T[] | null | undefined,
  fallback: T | undefined,
  isRepublic: (layer: T) => boolean = isRepublicFeatureLayer,
): T | undefined => {
  const list = layers || [];
  if (!list.length) return fallback;
  return list.find((layer) => isRepublic(layer)) || list[0] || fallback;
};
