/**
 * Click-target layer resolution: which live layers are clickable agricultural
 * field layers, and which feature a view click resolves to.
 */
import type { PopupWidgetHost } from "../../popup-host";
import type { JimuMapView } from "jimu-arcgis";
import type { AgriLayerLike, PopupLayerLike } from "../../popup-types";
import type { AgriFieldLike } from "../../../../../gis/agri-layer-types";
import { getAgriLayerMapKey, getQueryableLayer, isAgriAdminBoundaryLayer, isMapImageGroupSublayer, isQueryableFieldLayer, collectQueryableFieldLayers, getAllFeatureLayersFromMap, safeLoadMapLayer } from "../../../../../gis/feature-layer-data";
import { default as Point } from "esri/geometry/Point";

type MaybeLayer = AgriLayerLike | null | undefined;

export const toClickQueryGeometry = (host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView, screenPoint: { x: number; y: number }, mapPoint?: { x?: number; y?: number; spatialReference?: { wkid?: number } }): __esri.Point | null => {
  if (typeof view.toMap === "function") {
    try {
      const fromView = view.toMap(screenPoint);
      if (fromView) return fromView as __esri.Point;
    } catch {
      /* ignore */
    }
  }
  const x = Number(mapPoint?.x);
  const y = Number(mapPoint?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  try {
    return new Point({
      x,
      y,
      spatialReference:
        mapPoint?.spatialReference || view.spatialReference,
    });
  } catch {
    return null;
  }
};
export const findHitGraphic = (host: PopupWidgetHost, hit: __esri.HitTestResult | null | undefined, layers: __esri.FeatureLayer[]): __esri.Graphic | null => {
  const hitResult = hit?.results?.find((r) => {
    if ("graphic" in r && r.graphic) {
      const lyr = r.graphic.layer;
      if (!lyr) return false;
      return layers.some((L) => host.layerKeysMatch(L, lyr));
    }
    return false;
  });
  return hitResult && "graphic" in hitResult ? hitResult.graphic : null;
};
export const pickClickGraphic = (host: PopupWidgetHost, hit: __esri.HitTestResult | null | undefined, preferredLayers: __esri.FeatureLayer[]): __esri.Graphic | null => {
  const activeView = host.state.jimuMapView?.view;
  const map = activeView?.map;
  const candidates: __esri.Graphic[] = [];
  const restrictToPreferred = preferredLayers.length > 0;

  for (const r of hit?.results || []) {
    if (!r || typeof r !== "object") continue;
    const graphic: __esri.Graphic | null =
      "graphic" in r && r.graphic ? r.graphic : null;
    if (!graphic) continue;

    const rawLayer = graphic.layer;
    if (host.isHighlightLayer(rawLayer)) continue;

    const layer = host.toLiveMapLayer(
      getQueryableLayer(rawLayer) || rawLayer,
      map,
    );
    if (!layer || !host.isAgriculturalFieldLayer(layer)) continue;
    if (!activeView || !host.isLayerEffectivelyVisible(layer, activeView)) continue;
    if (!host.isAgriculturalFieldGraphic(graphic, layer)) continue;
    if (
      restrictToPreferred &&
      !preferredLayers.some((L) => host.layerKeysMatch(L, layer))
    ) {
      continue;
    }

    const geomType = String(graphic.geometry?.type || "").toLowerCase();
    const isPolygonLike =
      !geomType || geomType === "polygon" || geomType === "multipolygon";
    const hasAttributes =
      !!graphic.attributes && Object.keys(graphic.attributes).length > 0;

    if (geomType && !isPolygonLike) continue;
    if (!hasAttributes && !graphic.geometry) continue;

    candidates.push(graphic);
  }

  if (!candidates.length) return null;

  if (restrictToPreferred) {
    for (const graphic of candidates) {
      const layer = host.toLiveMapLayer(
        getQueryableLayer(graphic.layer) || graphic.layer,
        map,
      );
      if (
        layer &&
        preferredLayers.some((L) => host.layerKeysMatch(L, layer)) &&
        layer.visible !== false
      ) {
        return graphic;
      }
    }
    return null;
  }

  for (const graphic of candidates) {
    const layer = graphic.layer;
    if (layer?.visible !== false) return graphic;
  }

  return candidates[0];
};
export function isHighlightLayer(host: PopupWidgetHost, layer: MaybeLayer): boolean {
  const id = String(layer?.id || "").toLowerCase();
  const title = String(layer?.title || "").toLowerCase();
  return id === "agri-polygon-highlight" ||
    title.includes("selected polygon highlight") ||
    title.includes("sketch") ||
    // Viloyat/tuman outline + label layers sit on top of the fields; a
    // hitTest returns their polygon first and it has no uniqueid.
    isAgriAdminBoundaryLayer(layer);
}
/** A sublayer is clickable only when it and every parent are visible. */
export function isLayerEffectivelyVisible(host: PopupWidgetHost, layer: MaybeLayer, view: __esri.MapView | __esri.SceneView): boolean {
  if (!layer || host.isHighlightLayer(layer)) return false;
  const seen = new Set<AgriLayerLike>();
  let current: MaybeLayer = layer;
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current.visible === false) return false;
    current = current.parent || current.layer || null;
  }
  const scale = Number(view?.scale || 0);
  const minScale = Number(layer.minScale || 0);
  const maxScale = Number(layer.maxScale || 0);
  if (scale > 0 && minScale > 0 && scale > minScale) return false;
  if (scale > 0 && maxScale > 0 && scale < maxScale) return false;
  return String(layer.definitionExpression || "1=1").trim() !== "1=0";
}
export function isAgriculturalFieldLayer(host: PopupWidgetHost, layer: PopupLayerLike | null | undefined): boolean {
  if (!layer) return false;
  // Group Layer folders are not field polygons — never accept them for click.
  if (isMapImageGroupSublayer(layer)) return false;
  // "Agri district borders" / Tuman_chegara outlines match the \bagri\b
  // heuristic below but are administrative polygons, not fields.
  if (isAgriAdminBoundaryLayer(layer)) return false;
  // Prefer queryable layers, but title/url identity is enough to accept a
  // live MapImage leaf that is still hydrating its query methods.
  const identity = `${layer.title || ""} ${layer.url || ""} ${layer.parent?.title || ""}`.toLowerCase();
  const looksAgri = /\bagri\b|agriculture|qishloq/.test(identity);
  if (!isQueryableFieldLayer(layer) && !looksAgri) return false;
  const geometryType = String(layer.geometryType || "").toLowerCase();
  if (geometryType && geometryType !== "polygon") return false;
  const fields: AgriFieldLike[] = Array.isArray(layer.fields) ? layer.fields : [];
  const names = new Set(fields.map((field) => String(field?.name || "").toLowerCase()));
  if (names.has("uniqueid") || names.has("crop_id") || names.has("turi")) return true;
  // looksAgri alone is OK for a hydrating leaf; groups already rejected above.
  return looksAgri;
}
export function isAgriculturalFieldGraphic(host: PopupWidgetHost, graphic: __esri.Graphic, layer: MaybeLayer): boolean {
  const geometryType = String(graphic?.geometry?.type || "").toLowerCase();
  if (geometryType && geometryType !== "polygon" && geometryType !== "multipolygon") return false;
  const attrs = graphic?.attributes || {};
  const keys = new Set(Object.keys(attrs).map((key) => key.toLowerCase()));
  return keys.has("uniqueid") || keys.has("crop_id") || keys.has("turi") ||
    host.isAgriculturalFieldLayer(layer);
}
export function getClickTargetLayers(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView): __esri.FeatureLayer[] {
  const { featureLayers, layerKeyToDsId } = host.state;
  const dsKeys = Object.keys(layerKeyToDsId || {});
  const map = view.map;
  const configuredLayers = featureLayers || [];
  const liveRoots: __esri.Layer[] =
    map?.allLayers?.toArray?.() || [];
  // MapImage parents are not queryable — expand to agri/feature sublayers.
  const liveMapLayers: __esri.FeatureLayer[] = [];
  const seen = new Set<string>();
  const pushLive = (layer: MaybeLayer) => {
    if (!layer || !isQueryableFieldLayer(layer)) return;
    const key =
      getAgriLayerMapKey(layer) ||
      String(layer.url || layer.id || "");
    if (!key || seen.has(key)) return;
    seen.add(key);
    liveMapLayers.push(layer as __esri.FeatureLayer);
  };
  for (const root of liveRoots) {
    // Walk groups fully — never push the Group Layer node itself
    // (FeatureLayer#load fails with unsupported-type "Group Layer").
    for (const leaf of collectQueryableFieldLayers(root)) {
      pushLive(leaf);
    }
  }

  const candidates = Array.from(
    new Set<__esri.FeatureLayer>([
      ...configuredLayers,
      ...liveMapLayers,
    ]),
  );

  return candidates
    .map((layer) => host.toLiveMapLayer(layer, map) || layer)
    .filter((layer) => {
      if (!host.isLayerEffectivelyVisible(layer, view)) return false;
      if (!host.isAgriculturalFieldLayer(layer)) return false;
      const key =
        getAgriLayerMapKey(layer) ||
        String(layer.url || layer.id || "");
      if (host.isDashboardEmbedded()) return true;
      if (!dsKeys.length) return true;
      return !!layerKeyToDsId[key];
    });
}
export async function resolveClickLayers(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView, jmv: JimuMapView): Promise<__esri.FeatureLayer[]> {
  let layers = host.getClickTargetLayers(view);
  if (layers.length) return layers;

  await host.initializeMapConnection(jmv);
  layers = host.getClickTargetLayers(view);
  if (layers.length) return layers;

  // Last resort: scan map again after layers may have finished loading
  // (portal / MapImage sublayers often aren't queryable at first connect).
  try {
    const mapLayers = getAllFeatureLayersFromMap(view.map);
    for (const layer of mapLayers) {
      await safeLoadMapLayer(layer);
    }
  } catch {
    /* best-effort reload; fall through to whatever is queryable now */
  }
  return host.getClickTargetLayers(view);
}
export const resolveClickFeatureAt = async (host: PopupWidgetHost, ev: __esri.ViewClickEvent, view: __esri.MapView | __esri.SceneView, layers: __esri.FeatureLayer[]): Promise<{
    graphic: __esri.Graphic;
    queryHitLayer: __esri.FeatureLayer | null;
  } | null> => {
  const clickScreenPoint = { x: ev.x, y: ev.y };
  const queryGeometry = host.toClickQueryGeometry(
    view,
    clickScreenPoint,
    ev.mapPoint,
  );

  const queryLayers =
    layers.length > 0
      ? layers
      : (host.getClickTargetLayers(view) as __esri.FeatureLayer[]);

  // hitTest / identify can rehydrate MapImage sublayers and clear their
  // runtime definitionExpression (district filter) — snapshot every click
  // candidate now and restore any drift synchronously afterwards, before
  // an unfiltered export gets painted (other-district fields flash).
  const definitionSnapshot = host.snapshotDefinitionExpressions([
    ...layers,
    ...queryLayers,
  ]);

  // Always hit-test the rendered map without an include restriction. Map-image
  // sublayers frequently have runtime ids/URLs that differ from configured DS
  // wrappers; restricting include/preferred layers makes visible fields unclickable.
  const hit = await view.hitTest(ev);
  host.restoreDriftedDefinitionExpressions(definitionSnapshot);
  // Only accept graphics belonging to the configured agricultural layers.
  // WebMap sketch/map-notes graphics can contain page-sized polygons; treating
  // one as a field makes goTo zoom out to a world extent.
  // Empty `layers` still allows agricultural hits (no preferred restriction).
  let g = host.pickClickGraphic(hit, layers);
  let queryHitLayer: __esri.FeatureLayer | null = null;

  if (!g && queryGeometry && queryLayers.length) {
    for (const layer of queryLayers) {
      if (!host.isLayerEffectivelyVisible(layer, view)) continue;
      if (!host.isAgriculturalFieldLayer(layer)) continue;
      try {
        // NEVER query the live layer here: on a MapImage sublayer that
        // rehydrates it and clears the tuman definitionExpression, so the
        // map briefly exports/paints every district's fields while the
        // popup zoom runs. Use the detached off-map client instead and
        // mirror the live filter onto the query WHERE.
        const liveWhere = String(
          layer.definitionExpression || "",
        ).trim();
        const detached = await host.getDetachedQueryLayer(layer);
        const queryTarget = detached || layer;
        const q = queryTarget.createQuery();
        q.geometry = queryGeometry;
        q.spatialRelationship = "intersects";
        q.outFields = ["*"];
        q.returnGeometry = true;
        q.num = 1;
        if (liveWhere && liveWhere !== "1=1") q.where = liveWhere;
        const res = await queryTarget.queryFeatures(q);
        if (!detached) {
          // Live-layer fallback (no URL) — repair any drift immediately.
          host.restoreDriftedDefinitionExpressions(definitionSnapshot);
        }
        if (res.features?.[0]) {
          g = res.features[0];
          // Keep the LIVE layer as the hit layer — downstream layer-key /
          // dsId / alias resolution must map back to the map's own layer.
          queryHitLayer = layer;
          break;
        }
      } catch {
        /* try next layer */
      }
    }
  }

  if (!g) return null;
  return { graphic: g, queryHitLayer };
};
