import { isMapImageGroupSublayer, safeLoadMapLayer, isQueryableFieldLayer, getLayerFieldNames, getDetachedQueryLayerForUrl, resolveQueryableServiceUrl } from "../primitives";

/** Load MapImage metadata; recurse into group folders without load() on them. */
export async function safeLoadMapImageTree(root: any): Promise<void> {
  if (!root) return;
  const walk = async (node: any): Promise<void> => {
    if (!node) return;
    if (isMapImageGroupSublayer(node)) {
      const kids =
        node?.allSublayers?.toArray?.() ||
        node?.sublayers?.toArray?.() ||
        [];
      await Promise.all(kids.map((kid: any) => walk(kid)));
      return;
    }
    await safeLoadMapLayer(node);
    const kids =
      node?.allSublayers?.toArray?.() ||
      node?.sublayers?.toArray?.() ||
      [];
    if (kids.length) await Promise.all(kids.map((kid: any) => walk(kid)));
  };
  await walk(root);
}
/** water_table / Map Service polygon layers used by Agri dashboards. */
export function isAgriWaterTableLayer(layer: any): boolean {
  if (!isQueryableFieldLayer(layer)) return false;
  const fields = getLayerFieldNames(layer);
  if (!fields.length) return false;
  const hasMetric =
    fields.includes("area_ha") ||
    fields.includes("uwt_m3") ||
    fields.includes("uwt_m3ha") ||
    fields.includes("year");
  const hasRegion =
    fields.includes("region_id") || fields.includes("viloyat");
  return hasMetric && hasRegion;
}
/** Detached query client for a live layer/sublayer (null when it has no URL). */
export async function getDetachedQueryLayerFor(liveLayer: any): Promise<any | null> {
  if (!liveLayer || isMapImageGroupSublayer(liveLayer)) return null;
  return getDetachedQueryLayerForUrl(resolveQueryableServiceUrl(liveLayer));
}
