import type { PopupWidgetHost } from "../popup-host";
import { isMapImageGroupSublayer, getDetachedQueryLayerFor } from "../../../../gis/feature-layer-data";
import { agriMapClickWarn, agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { type default as FeatureLayer } from "esri/layers/FeatureLayer";
import type {
  AgriLayerLike,
} from "../popup-types";
import { readSupportsAttachments } from "../popup-type-guards";

type MaybeLayer = AgriLayerLike | null | undefined;

/**
 * Off-map FeatureLayer client for a live map layer's URL. Every query in
 * the click chain must run against these detached clients: createQuery /
 * queryFeatures on a live MapImage Sublayer rehydrates it and can clear its
 * runtime definitionExpression, which makes the map export (and briefly
 * paint) every district's fields until the filter guard restores it.
 *
 * Shared helper also skips MapServer roots and Group Layer folders
 * ("Agri 2026 republic data") that FeatureLayer cannot load.
 */
export const getDetachedQueryLayer = async (host: PopupWidgetHost, layer: MaybeLayer): Promise<__esri.FeatureLayer | null> => {
  if (!layer || isMapImageGroupSublayer(layer)) return null;
  // The shared helper returns an off-map esri FeatureLayer (typed loosely there).
  const detached = (await getDetachedQueryLayerFor(layer)) as FeatureLayer | null;
  if (!detached) return null;
  const url = String(layer?.url || "").trim().replace(/\/+$/, "");
  if (url) host._queryOnlyLayers.set(url, detached);
  return detached;
};

/** Snapshot the live definitionExpression of each layer (pre-hitTest). */
export function snapshotDefinitionExpressions(host: PopupWidgetHost, layers: MaybeLayer[]): Map<AgriLayerLike, string> {
  const snapshot = new Map<AgriLayerLike, string>();
  for (const layer of layers) {
    if (!layer || snapshot.has(layer)) continue;
    try {
      snapshot.set(layer, String(layer.definitionExpression ?? ""));
    } catch {
      /* ignore */
    }
  }
  return snapshot;
}

/**
 * Restore any definitionExpression that drifted (was cleared by hitTest /
 * identify / load rehydration) synchronously, before the unfiltered
 * MapImage export can be painted.
 */
export function restoreDriftedDefinitionExpressions(host: PopupWidgetHost, snapshot: Map<AgriLayerLike, string>): void {
  snapshot.forEach((expression, layer) => {
    try {
      const current = String(layer.definitionExpression ?? "");
      if (current !== expression) {
        layer.definitionExpression = expression;
        agriMapClickWarn("definitionExpression drift restored", {
          layer: layer?.title || layer?.url || layer?.id,
          drifted: current || "<empty>",
          restored: expression || "<empty>",
        });
      }
    } catch {
      /* ignore */
    }
  });
}

export async function queryFeatureByObjectIdCached(host: PopupWidgetHost, layer: __esri.FeatureLayer, oidField: string, oid: unknown, outFields: string[]): Promise<__esri.Graphic | null> {
  const now = Date.now();
  host.pruneFeatureQueryCache(now);
  const key = host.getFeatureQueryCacheKey(layer, oidField, oid, outFields);
  const hit = host._featureQueryCache.get(key);
  if (hit && hit.expires > now) {
    agriMapClickDebug("feature-query:cache-hit", {
      layer: layer.title || layer.url || layer.id,
      oidField,
      oid,
      outFieldCount: outFields.length,
    });
    return hit.value;
  }

  const job = (async () => {
    const liveDefinitionExpression = String(
      layer.definitionExpression || "",
    );

    // Calling queryFeatures on a live MapImage sublayer can rehydrate that
    // sublayer and temporarily clear its runtime definitionExpression. The
    // map then renders every district until Localization's guard restores
    // the filter. Query an off-map FeatureLayer client instead.
    const detachedQueryLayer = await host.getDetachedQueryLayer(layer);
    const queryLayer: __esri.FeatureLayer = detachedQueryLayer || layer;

    const q = queryLayer.createQuery();
    q.where = `${oidField} = ${Number(oid)}`;
    q.outFields = outFields;
    q.returnGeometry = true;
    agriMapClickDebug("feature-query:request", {
      layer: layer.title || layer.url || layer.id,
      url: layer.url || null,
      where: q.where,
      outFields,
      returnGeometry: true,
    });
    const res = await queryLayer.queryFeatures(q);
    // Defensive restore for the no-URL fallback. The detached path above
    // never touches the live layer.
    if (
      queryLayer === layer &&
      String(layer.definitionExpression || "") !==
        liveDefinitionExpression
    ) {
      layer.definitionExpression = liveDefinitionExpression;
    }
    agriMapClickDebug("feature-query:response", {
      layer: layer.title || layer.url || layer.id,
      featureCount: res.features?.length || 0,
      hasGeometry: Boolean(res.features?.[0]?.geometry),
      attributeKeys: Object.keys(res.features?.[0]?.attributes || {}),
      queryMode: queryLayer === layer ? "live-fallback" : "detached",
      liveDefinitionExpression:
        layer.definitionExpression || null,
    });
    return res.features?.[0] || null;
  })();

  host._featureQueryCache.set(key, {
    expires: now + host._featureQueryCacheTtlMs,
    value: job,
  });

  try {
    const feature = await job;
    if (!feature && host._featureQueryCache.get(key)?.value === job) {
      host._featureQueryCache.delete(key);
    }
    return feature;
  } catch (err) {
    if (host._featureQueryCache.get(key)?.value === job) {
      host._featureQueryCache.delete(key);
    }
    throw err;
  }
}

/** ✅ NEW: safely detect whether this layer supports attachments */
export function layerSupportsAttachments(host: PopupWidgetHost, layer: __esri.FeatureLayer | FeatureLayer | null | undefined): boolean {
  // Different JSAPI/EB builds expose it slightly differently.
  return readSupportsAttachments(layer);
}
