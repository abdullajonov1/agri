import type { PopupWidgetHost } from "../popup-host";
import { isMapImageGroupSublayer, getDetachedQueryLayerFor, getQueryableLayer, isQueryableFieldLayer, getAgriLayerMapKey, getAllFeatureLayersFromMap, safeLoadMapLayer, findQueryableLayerOnMapByUrl, findQueryableLayerOnMapById, normalizeQueryableLayerUrl, extractMapLayerIdFromDsId } from "../../../../gis/feature-layer-data";
import { agriMapClickWarn, agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { normalizeLang } from "../messages";
import { default as FeatureLayer } from "esri/layers/FeatureLayer";
import { default as GraphicsLayer } from "esri/layers/GraphicsLayer";
import { default as SimpleFillSymbol } from "esri/symbols/SimpleFillSymbol";
import { default as SimpleLineSymbol } from "esri/symbols/SimpleLineSymbol";
import { default as Graphic } from "esri/Graphic";
import { discoverMapWidgetIdInApp } from "../../../../gis/agri-linked-map-layout";
import { JimuMapView, MapViewManager } from "jimu-arcgis";
import { DataSourceManager } from "jimu-core";
import { getSelectedDsIds } from "../../../../gis/agri-data-source-engine";

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
export const getDetachedQueryLayer = async (host: PopupWidgetHost, layer: any): Promise<__esri.FeatureLayer | null> => {
  if (!layer || isMapImageGroupSublayer(layer)) return null;
  const detached = await getDetachedQueryLayerFor(layer);
  if (!detached) return null;
  const url = String(layer?.url || "").trim().replace(/\/+$/, "");
  if (url) host._queryOnlyLayers.set(url, detached);
  return detached as unknown as __esri.FeatureLayer;
};

/** Snapshot the live definitionExpression of each layer (pre-hitTest). */
export function snapshotDefinitionExpressions(host: PopupWidgetHost, layers: Array<__esri.FeatureLayer | any>): Map<any, string> {
  const snapshot = new Map<any, string>();
  for (const layer of layers) {
    if (!layer || snapshot.has(layer)) continue;
    try {
      snapshot.set(layer, String((layer as any).definitionExpression ?? ""));
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
export function restoreDriftedDefinitionExpressions(host: PopupWidgetHost, snapshot: Map<any, string>): void {
  snapshot.forEach((expression, layer) => {
    try {
      const current = String((layer as any).definitionExpression ?? "");
      if (current !== expression) {
        (layer as any).definitionExpression = expression;
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
      (layer as any).definitionExpression || "",
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
      String((layer as any).definitionExpression || "") !==
        liveDefinitionExpression
    ) {
      (layer as any).definitionExpression = liveDefinitionExpression;
    }
    agriMapClickDebug("feature-query:response", {
      layer: layer.title || layer.url || layer.id,
      featureCount: res.features?.length || 0,
      hasGeometry: Boolean(res.features?.[0]?.geometry),
      attributeKeys: Object.keys(res.features?.[0]?.attributes || {}),
      queryMode: queryLayer === layer ? "live-fallback" : "detached",
      liveDefinitionExpression:
        (layer as any).definitionExpression || null,
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

export const setupThemeObserver = (host: PopupWidgetHost): void => {
  const root = document.documentElement;
  const body = document.body;
  host.themeObserver = new MutationObserver(() => {
    const isDarkTheme = host.getResolvedTheme();
    if (host._isMounted && isDarkTheme !== host.state.isDarkTheme) {
      host.setState({ isDarkTheme });
    }
  });

  host.themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  host.themeObserver.observe(body, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

export const handleThemeChange = (host: PopupWidgetHost, e: any): void => {
  if (!host._isMounted) return;
  const detail = e?.detail || {};
  let isDarkTheme = host.getResolvedTheme();

  if (typeof detail.isDarkTheme === "boolean") {
    isDarkTheme = detail.isDarkTheme;
  } else if (typeof detail.theme === "string") {
    isDarkTheme = String(detail.theme).toLowerCase() !== "light";
  }

  if (isDarkTheme !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme });
  }
};

export const handleLanguageChange = (host: PopupWidgetHost, e: any): void => {
  if (!host._isMounted) return;
  const lang = e?.detail?.lang || e?.detail?.language || e?.detail?.code;
  const normalized = normalizeLang(lang);
  if (normalized !== host.state.currentLang) {
    host.setState({ currentLang: normalized });
  }
};

/** ✅ NEW: safely detect whether this layer supports attachments */
export function layerSupportsAttachments(host: PopupWidgetHost, layer: __esri.FeatureLayer | FeatureLayer | null | undefined): boolean {
  if (!layer) return false;

  // Different JSAPI/EB builds expose it slightly differently
  const anyLayer: any = layer as any;

  // Common signals
  if (typeof anyLayer.supportsAttachments === "boolean")
    return anyLayer.supportsAttachments;

  const cap = anyLayer.capabilities;
  const supported =
    cap?.data?.supportsAttachments ??
    cap?.data?.supportsAttachment ??
    cap?.operations?.supportsAttachments ??
    cap?.operations?.supportsAttachment;

  if (typeof supported === "boolean") return supported;

  // Unknown => assume false to avoid ugly warning
  return false;
}

export const setupHighlightLayer = (host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView) => {
  if (!host._highlightLayer) {
    host._highlightLayer = new GraphicsLayer({
      id: "agri-polygon-highlight",
      title: "Selected Polygon Highlight",
    });
    view.map.add(host._highlightLayer);
  }
};

export const highlightPolygon = (host: PopupWidgetHost, geometry: __esri.Geometry) => {
  if (!host._highlightLayer || !geometry) return;
  host.clearHighlight();

  // Drop Graff/table selection graphics so only one outline is visible.
  try {
    host.state.jimuMapView?.view?.graphics?.removeAll?.();
  } catch {
    /* ignore */
  }

  // Wide translucent halo plus a bright cyan core keeps the selected field
  // visible over both light and dark satellite imagery.
  const haloSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: new SimpleLineSymbol({
      color: [0, 229, 255, 0.32],
      width: 9,
      style: "solid",
    }),
  });
  const highlightSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: new SimpleLineSymbol({
      color: [128, 245, 255, 1],
      width: 3,
      style: "solid",
    }),
  });

  host._highlightHaloGraphic = new Graphic({ geometry, symbol: haloSymbol });
  host._highlightGraphic = new Graphic({ geometry, symbol: highlightSymbol });
  host._highlightLayer.addMany([
    host._highlightHaloGraphic,
    host._highlightGraphic,
  ]);
};

export const clearHighlight = (host: PopupWidgetHost) => {
  if (!host._highlightLayer) return;
  if (host._highlightHaloGraphic) {
    host._highlightLayer.remove(host._highlightHaloGraphic);
    host._highlightHaloGraphic = null;
  }
  if (host._highlightGraphic) {
    host._highlightLayer.remove(host._highlightGraphic);
    host._highlightGraphic = null;
  }
};

export const restoreExtentBeforeSelection = (host: PopupWidgetHost) => {
  const view = host.state.jimuMapView?.view;
  const savedExtent = host._extentBeforeSelection;
  host._extentBeforeSelection = null;
  const zoomTo = host.props.config?.settings?.zoomToSelection !== false;
  if (!zoomTo || !savedExtent || !view) return;
  try {
    void view.goTo(savedExtent, { duration: 400 });
  } catch {
    /* ignore */
  }
};

export const cleanupHighlight = (host: PopupWidgetHost) => {
  if (host._highlightLayer) {
    const view = host.state.jimuMapView?.view;
    if (view && view.map) {
      view.map.remove(host._highlightLayer);
    }
    host._highlightLayer = null;
    host._highlightGraphic = null;
    host._highlightHaloGraphic = null;
  }
  host._extentBeforeSelection = null;
};

export function getLinkedMapWidgetId(host: PopupWidgetHost): string | null {
  const ids = host.props.useMapWidgetIds as any;
  const list = ids?.length
    ? ids.asMutable?.() || ids.toArray?.() || ids
    : [];
  const first = Array.isArray(list) ? list[0] : null;
  if (first) return String(first);
  const hostId = String(host.props.id || "").replace(/-popup$/, "");
  return discoverMapWidgetIdInApp({
    hostWidgetId: hostId,
    getSlotElement: () => {
      if (hostId) {
        const scoped = document.querySelector(
          `.widget-renderer[data-widgetid="${hostId}"] .agri-dashboard-map-slot`,
        );
        if (scoped instanceof HTMLElement) return scoped;
      }
      const fallback = document.querySelector(".agri-dashboard-map-slot");
      return fallback instanceof HTMLElement ? fallback : null;
    },
  });
}

export function getMapViewFromManager(host: PopupWidgetHost, mapWidgetId: string | null): JimuMapView | null {
  try {
    const manager = MapViewManager.getInstance();
    if (!manager) return null;
    if (mapWidgetId) {
      const group = manager.getJimuMapViewGroup(mapWidgetId);
      const active = group?.getActiveJimuMapView?.();
      if (active?.view) return active;
      const groupViews = group?.getAllJimuMapViews?.() || [];
      const firstLoaded = groupViews.find((view: any) => view?.view);
      if (firstLoaded) return firstLoaded;
    }
    const all = manager.getAllJimuMapViews?.() || [];
    return (
      all.find((view: any) => view?.view && view?.isActive !== false) ||
      all.find((view: any) => view?.view) ||
      null
    );
  } catch {
    return null;
  }
}

export const handleMapViewReady = (host: PopupWidgetHost, event: Event): void => {
  const mapWidgetId = (event as CustomEvent<{ mapWidgetId?: string }>).detail
    ?.mapWidgetId;
  const linked = host.getLinkedMapWidgetId();
  if (mapWidgetId && linked && mapWidgetId !== linked) return;
  host.scheduleMapViewFallback();
};

export const scheduleMapViewFallback = (host: PopupWidgetHost): void => {
  // Already have a live map view — do NOT re-enter onActiveViewChange
  // (that path setState → initializeMapConnection → scheduleMapViewFallback
  // and freezes the builder with React #185 when featureLayers stay empty).
  if (host.state.jimuMapView?.view) {
    if (!host.state.featureLayers?.length) {
      host.scheduleMapInitRetry(host.state.jimuMapView);
    }
    return;
  }
  const mapWidgetId = host.getLinkedMapWidgetId();
  const fromManager = host.getMapViewFromManager(mapWidgetId);
  if (fromManager?.view) {
    host.onActiveViewChange(fromManager);
    return;
  }
  if (!mapWidgetId) return;
  if (host.mapViewFallbackTimer) clearTimeout(host.mapViewFallbackTimer);
  host.mapViewFallbackTimer = setTimeout(() => {
    host.mapViewFallbackTimer = null;
    if (!host._isMounted) return;
    if (host.state.jimuMapView?.view) return;
    const late = host.getMapViewFromManager(mapWidgetId);
    if (late?.view) host.onActiveViewChange(late);
  }, 600);
};

export const scheduleMapInitRetry = (host: PopupWidgetHost, jmv: JimuMapView): void => {
  if (host.mapInitRetryCount >= host.maxMapInitRetries) return;
  if (host.mapInitRetryTimer) clearTimeout(host.mapInitRetryTimer);
  host.mapInitRetryCount += 1;
  host.mapInitRetryTimer = setTimeout(() => {
    host.mapInitRetryTimer = null;
    if (!host._isMounted) return;
    void host.initializeMapConnection(jmv);
  }, 800);
};

export function expandUseDataSourceEntries(host: PopupWidgetHost, useList: any[]): any[] {
  const dsMgr = DataSourceManager.getInstance();
  const out: any[] = [];
  const seen = new Set<string>();

  for (const uds of useList) {
    const id = String(uds?.dataSourceId || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(uds);

    const ds = dsMgr.getDataSource(id) as any;
    const children = ds?.getChildDataSources?.() || [];
    for (const child of children) {
      const childId = String(child?.id || "");
      if (!childId || seen.has(childId)) continue;
      seen.add(childId);
      out.push({ dataSourceId: childId, mainDataSourceId: id });
    }
  }

  return out;
}

export const addResolvedLayer = (host: PopupWidgetHost, target: __esri.FeatureLayer[], layerKeyToDsId: Record<string, string>, seen: Set<string>, layer: any, dsId?: string): void => {
  const queryable = getQueryableLayer(layer) || layer;
  if (!isQueryableFieldLayer(queryable)) return;
  const key =
    getAgriLayerMapKey(queryable) ||
    String(queryable.url || queryable.id || "");
  if (!key || seen.has(key)) return;
  seen.add(key);
  target.push(queryable as __esri.FeatureLayer);
  if (dsId) layerKeyToDsId[key] = dsId;
};

export const collectLayersFromDataSources = (host: PopupWidgetHost, jmv: JimuMapView, useList: any[]): {
    layers: __esri.FeatureLayer[];
    layerKeyToDsId: Record<string, string>;
  } => {
  const layers: __esri.FeatureLayer[] = [];
  const layerKeyToDsId: Record<string, string> = {};
  const seen = new Set<string>();
  const map = jmv?.view?.map;

  for (const uds of useList) {
    const dsId = String(uds?.dataSourceId || "");
    if (!dsId) continue;

    const cachedDs = host.state.dataSourcesById?.[dsId] as any;
    if (cachedDs) {
      const cachedLayer =
        cachedDs.layer ||
        (typeof cachedDs.getLayer === "function"
          ? cachedDs.getLayer()
          : null);
      const live = host.toLiveMapLayer(cachedLayer, map);
      if (live) host.addResolvedLayer(layers, layerKeyToDsId, seen, live, dsId);
    }

    const dsMgr = DataSourceManager.getInstance();
    const ds = dsMgr.getDataSource(dsId) as any;
    if (ds) {
      const dsLayer =
        (typeof ds.getLayer === "function" ? ds.getLayer() : null) ||
        ds.layer;
      const live = host.toLiveMapLayer(
        getQueryableLayer(dsLayer) || dsLayer,
        map,
      );
      if (live) host.addResolvedLayer(layers, layerKeyToDsId, seen, live, dsId);
    }
  }

  return { layers, layerKeyToDsId };
};

export const onActiveViewChange = (host: PopupWidgetHost, jimuMapView: JimuMapView) => {
  host.detachMapClick();
  host.cleanupHighlight();

  if (!jimuMapView) {
    host.mapAreaResizeObserver?.disconnect();
    host.mapAreaResizeObserver = null;
    host.connectedMapViewId = "";
    host.setState({
      jimuMapView: null,
      featureLayers: [],
      objectIdField: null,
      error: host.tr("error.noMapView"),
      debugInfo: {
        ...host.state.debugInfo,
        layerInfo: host.tr("error.noMapView"),
      },
    });
    return;
  }

  const activeView = jimuMapView.view;
  if (activeView) {
    host.observeMapAreaResize(activeView);
  }

  const viewId = String(
    (jimuMapView as any).id || (jimuMapView as any).mapWidgetId || "",
  );
  // Same map already wired — do not setState again (causes freeze loops).
  if (viewId && viewId === host.connectedMapViewId && host.state.jimuMapView) {
    if (!host._clickHandle) host.attachMapClick(jimuMapView);
    if (!host.state.featureLayers?.length) {
      void host.initializeMapConnection(jimuMapView);
    }
    return;
  }
  host.connectedMapViewId = viewId;

  host.setState({ jimuMapView }, async () => {
    const view = jimuMapView.view;
    if (!view) return;

    // Attach immediately so the first field click never races layer resolve.
    host.attachMapClick(jimuMapView);

    if (view.ready) {
      host.setupHighlightLayer(view);
      await host.initializeMapConnection(jimuMapView);
      host.repositionPinnedIfNeeded();
    } else {
      const h = view.watch("ready", async (ready) => {
        if (ready) {
          h.remove();
          host.attachMapClick(jimuMapView);
          host.setupHighlightLayer(view);
          await host.initializeMapConnection(jimuMapView);
          host.repositionPinnedIfNeeded();
        }
      });
    }
  });
};

export const initializeMapConnection = async (host: PopupWidgetHost, jmv: JimuMapView) => {
  if (!host._isMounted) return;
  const view = jmv?.view;
  if (!view || !view.map) return;

  const rawList = (host.props.useDataSources?.asMutable?.() as any[]) || [];
  const useList = host.expandUseDataSourceEntries(rawList);
  // Empty useDataSources is normal right after drop — resolve map layers only.
  // Never bounce through scheduleMapViewFallback here (that re-entered
  // onActiveViewChange and froze the page).

  host.dataSourceEngine.syncSelection(getSelectedDsIds(host.props.useDataSources));

  const resolvedLayers: __esri.FeatureLayer[] = [];
  const layerKeyToDsId: Record<string, string> = {};
  const seen = new Set<string>();

  const mapLayers = getAllFeatureLayersFromMap(view.map);
  // load() rehydrates MapImage sublayers and can drop their runtime
  // district definitionExpression — snapshot and repair synchronously so
  // a connect/retry that overlaps a field click never flashes other
  // districts' fields.
  const definitionSnapshot = host.snapshotDefinitionExpressions(mapLayers);
  for (const layer of mapLayers) {
    await safeLoadMapLayer(layer);
    host.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, layer);
  }
  host.restoreDriftedDefinitionExpressions(definitionSnapshot);

  if (useList.length) {
    const fromDs = host.collectLayersFromDataSources(jmv, useList);
    for (const layer of fromDs.layers) {
      const live = host.toLiveMapLayer(layer, view.map) || layer;
      const key = getAgriLayerMapKey(live) || String(live.url || live.id || "");
      const dsId = fromDs.layerKeyToDsId[key];
      host.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, live, dsId);
    }

    for (const useDs of useList) {
      const layer = await host.resolveFeatureLayerForUseDataSource(jmv, useDs);
      if (!layer) continue;

      await safeLoadMapLayer(layer);

      const dsId = String(useDs?.dataSourceId || "");
      const live = host.toLiveMapLayer(layer, view.map) || layer;
      host.addResolvedLayer(resolvedLayers, layerKeyToDsId, seen, live, dsId);
    }
  }

  if (!host._isMounted) return;

  if (!resolvedLayers.length) {
    // Soft fail — map may still be loading region-year sublayers. Retry
    // a few times without re-entering onActiveViewChange.
    // Still attach the click handler so the first field click works as soon
    // as live MapImage sublayers become hittable via getClickTargetLayers.
    if (!host._clickHandle) host.attachMapClick(jmv);
    if (
      host.state.error !== host.tr("error.selectedLayersMissing") ||
      (host.state.featureLayers?.length || 0) > 0
    ) {
      host.setState({
        featureLayers: [],
        objectIdField: null,
        error: useList.length
          ? host.tr("error.selectedLayersMissing")
          : null,
      });
    }
    host.scheduleMapInitRetry(jmv);
    return;
  }

  host.mapInitRetryCount = 0;
  agriMapClickDebug("initializeMapConnection OK", {
    layerCount: resolvedLayers.length,
    layers: resolvedLayers.map((l) => l.title || l.url || l.id),
  });

  const prevKeys = (host.state.featureLayers || [])
    .map((l) => getAgriLayerMapKey(l) || String(l.url || l.id || ""))
    .join("|");
  const nextKeys = resolvedLayers
    .map((l) => getAgriLayerMapKey(l) || String(l.url || l.id || ""))
    .join("|");
  if (prevKeys === nextKeys && host._clickHandle) {
    host.attachMapClick(jmv);
    return;
  }

  host.setState(
    {
      featureLayers: resolvedLayers,
      layerKeyToDsId,
      error: null,
      debugInfo: {
        ...host.state.debugInfo,
        layerInfo: resolvedLayers.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          objectIdField: l.objectIdField,
        })),
      },
    },
    () => {
      if (!host._isMounted) return;
      host.attachMapClick(jmv);
    },
  );
};

export const toLiveMapLayer = (host: PopupWidgetHost, layer: any, map: __esri.Map | null | undefined): __esri.FeatureLayer | null => {
  if (!layer) return null;
  const url = String(layer?.url || "");
  if (map && url) {
    const byUrl = findQueryableLayerOnMapByUrl(map, url);
    if (byUrl) return byUrl as __esri.FeatureLayer;
  }
  if (map && layer?.id != null) {
    const byId = findQueryableLayerOnMapById(map, String(layer.id));
    if (byId) return byId as __esri.FeatureLayer;
  }
  const queryable = getQueryableLayer(layer);
  return (queryable || layer) as __esri.FeatureLayer;
};

export const layerKeysMatch = (host: PopupWidgetHost, a: any, b: any): boolean => {
  if (!a || !b) return false;
  const keyA = getAgriLayerMapKey(a);
  const keyB = getAgriLayerMapKey(b);
  if (keyA && keyB && keyA === keyB) return true;
  if (a.id != null && b.id != null && String(a.id) === String(b.id)) {
    return true;
  }
  const urlA = normalizeQueryableLayerUrl(String(a.url || ""));
  const urlB = normalizeQueryableLayerUrl(String(b.url || ""));
  return !!(urlA && urlB && urlA === urlB);
};

/** Resolve the live map layer for a selected useDataSource (FeatureLayer or MapImage sublayer). */
export const resolveFeatureLayerForUseDataSource = async (host: PopupWidgetHost, jmv: JimuMapView, useDs: any): Promise<__esri.FeatureLayer | null> => {
  try {
    if (!useDs?.dataSourceId) return null;

    const dsId = String(useDs.dataSourceId);
    const map = jmv?.view?.map;
    if (!map) return null;

    const jlvByApi = (jmv as any).getJimuLayerViewByDataSourceId?.(dsId);
    const fromApi = getQueryableLayer(jlvByApi?.layer);
    if (fromApi) return host.toLiveMapLayer(fromApi, map);

    const jlvList: any[] = jmv.getAllJimuLayerViews?.() || [];
    const layerIdHint = extractMapLayerIdFromDsId(dsId);

    for (const lv of jlvList) {
      if (
        lv?.layerDataSourceId === dsId ||
        lv?.dataSourceId === dsId
      ) {
        const resolved = getQueryableLayer(lv?.layer);
        if (resolved) return host.toLiveMapLayer(resolved, map);
      }
    }

    if (layerIdHint) {
      const match = jlvList.find(
        (lv) => String(lv?.layer?.id || "") === layerIdHint,
      );
      const resolved = getQueryableLayer(match?.layer);
      if (resolved) return host.toLiveMapLayer(resolved, map);
    }

    const dsMgr = DataSourceManager.getInstance();
    const ds: any = dsMgr.getDataSource(dsId);
    if (ds) {
      try {
        if (typeof ds.fetchSchema === "function") await ds.fetchSchema();
      } catch {
        /* schema optional */
      }

      const dsLayer =
        (typeof ds.getLayer === "function" ? ds.getLayer() : null) ||
        ds.layer ||
        (typeof ds.getJimuLayer === "function" ? ds.getJimuLayer() : null);
      const queryable = getQueryableLayer(dsLayer);
      if (queryable) {
        const live = host.toLiveMapLayer(queryable, map);
        if (live) return live;
      }

      const dsUrl = String(ds?.url || queryable?.url || dsLayer?.url || "");
      if (dsUrl) {
        const byUrl = findQueryableLayerOnMapByUrl(map, dsUrl);
        if (byUrl) return byUrl as __esri.FeatureLayer;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
};
