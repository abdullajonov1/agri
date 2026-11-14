import type { PopupWidgetHost } from "../popup-host";
import { getQueryableLayer, isQueryableFieldLayer, getAgriLayerMapKey, getAllFeatureLayersFromMap, safeLoadMapLayer, findQueryableLayerOnMapByUrl, findQueryableLayerOnMapById, normalizeQueryableLayerUrl, extractMapLayerIdFromDsId } from "../../../../gis/feature-layer-data";
import { agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { discoverMapWidgetIdInApp } from "../../../../gis/agri-linked-map-layout";
import { type JimuMapView, MapViewManager } from "jimu-arcgis";
import { DataSourceManager } from "jimu-core";
import { getSelectedDsIds } from "../../../../gis/agri-data-source-engine";
import type {
  AgriLayerLike,
  PopupJimuLayerViewLike,
  PopupUseDataSource,
} from "../popup-types";
import { asDataSourceLike } from "../popup-type-guards";


/** Waits for the map view to report in before falling back to the map view manager. */
const MAP_VIEW_FALLBACK_MS = 600;
/** Waits before retrying map connection initialization after a failed attempt. */
const MAP_INIT_RETRY_MS = 800;

type MaybeLayer = AgriLayerLike | null | undefined;

/** `props.useMapWidgetIds` read defensively (ImmutableArray or plain array). */
interface MapWidgetIdList {
  length?: number;
  asMutable?(): unknown;
  toArray?(): unknown;
}

/** JimuMapView members probed beyond the typed public API. */
interface JimuMapViewProbe {
  id?: string;
  mapWidgetId?: string;
  getJimuLayerViewByDataSourceId?(dsId: string): PopupJimuLayerViewLike | null | undefined;
}

export function getLinkedMapWidgetId(host: PopupWidgetHost): string | null {
  const ids: MapWidgetIdList | null | undefined = host.props.useMapWidgetIds;
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
      const firstLoaded = groupViews.find((view: JimuMapView | null | undefined) => view?.view);
      if (firstLoaded) return firstLoaded;
    }
    const all = manager.getAllJimuMapViews?.() || [];
    return (
      all.find((view: JimuMapView | null | undefined) => view?.view && view?.isActive !== false) ||
      all.find((view: JimuMapView | null | undefined) => view?.view) ||
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
  }, MAP_VIEW_FALLBACK_MS);
};

export const scheduleMapInitRetry = (host: PopupWidgetHost, jmv: JimuMapView): void => {
  if (host.mapInitRetryCount >= host.maxMapInitRetries) return;
  if (host.mapInitRetryTimer) clearTimeout(host.mapInitRetryTimer);
  host.mapInitRetryCount += 1;
  host.mapInitRetryTimer = setTimeout(() => {
    host.mapInitRetryTimer = null;
    if (!host._isMounted) return;
    void host.initializeMapConnection(jmv);
  }, MAP_INIT_RETRY_MS);
};

export function expandUseDataSourceEntries(host: PopupWidgetHost, useList: PopupUseDataSource[]): PopupUseDataSource[] {
  const dsMgr = DataSourceManager.getInstance();
  const out: PopupUseDataSource[] = [];
  const seen = new Set<string>();

  for (const uds of useList) {
    const id = String(uds?.dataSourceId || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(uds);

    const ds = asDataSourceLike(dsMgr.getDataSource(id));
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

export const addResolvedLayer = (host: PopupWidgetHost, target: __esri.FeatureLayer[], layerKeyToDsId: Record<string, string>, seen: Set<string>, layer: MaybeLayer, dsId?: string): void => {
  const queryable: MaybeLayer = getQueryableLayer(layer) || layer;
  if (!isQueryableFieldLayer(queryable)) return;
  const key =
    getAgriLayerMapKey(queryable) ||
    String(queryable.url || queryable.id || "");
  if (!key || seen.has(key)) return;
  seen.add(key);
  target.push(queryable as __esri.FeatureLayer);
  if (dsId) layerKeyToDsId[key] = dsId;
};

export const collectLayersFromDataSources = (host: PopupWidgetHost, jmv: JimuMapView, useList: PopupUseDataSource[]): {
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

    const cachedDs = asDataSourceLike(host.state.dataSourcesById?.[dsId]);
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
    const ds = asDataSourceLike(dsMgr.getDataSource(dsId));
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

  const viewProbe: JimuMapViewProbe = jimuMapView;
  const viewId = String(viewProbe.id || viewProbe.mapWidgetId || "");
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

interface ResolvedConnectionLayers {
  resolvedLayers: __esri.FeatureLayer[];
  layerKeyToDsId: Record<string, string>;
}

/** Step 1: collect every FeatureLayer reachable from the map and the configured data sources. */
async function resolveConnectionLayers(
  host: PopupWidgetHost,
  jmv: JimuMapView,
  view: __esri.MapView | __esri.SceneView,
  useList: PopupUseDataSource[],
): Promise<ResolvedConnectionLayers> {
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
  return { resolvedLayers, layerKeyToDsId };
}

/** Step 2: nothing resolved yet — keep the click handler alive and retry later. */
function handleNoResolvedLayers(host: PopupWidgetHost, jmv: JimuMapView, hasUseList: boolean): void {
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
      error: hasUseList
        ? host.tr("error.selectedLayersMissing")
        : null,
    });
  }
  host.scheduleMapInitRetry(jmv);
}

/** Step 3: publish resolved layers to state and attach the map click handler. */
function applyResolvedLayers(host: PopupWidgetHost, jmv: JimuMapView, resolved: ResolvedConnectionLayers): void {
  const { resolvedLayers, layerKeyToDsId } = resolved;
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
}

export const initializeMapConnection = async (host: PopupWidgetHost, jmv: JimuMapView) => {
  if (!host._isMounted) return;
  const view = jmv?.view;
  if (!view || !view.map) return;

  const rawList: PopupUseDataSource[] = host.props.useDataSources?.asMutable?.() || [];
  const useList = host.expandUseDataSourceEntries(rawList);
  // Empty useDataSources is normal right after drop — resolve map layers only.
  // Never bounce through scheduleMapViewFallback here (that re-entered
  // onActiveViewChange and froze the page).

  host.dataSourceEngine.syncSelection(getSelectedDsIds(host.props.useDataSources));

  const resolved = await resolveConnectionLayers(host, jmv, view, useList);

  if (!host._isMounted) return;

  if (!resolved.resolvedLayers.length) {
    handleNoResolvedLayers(host, jmv, useList.length > 0);
    return;
  }

  applyResolvedLayers(host, jmv, resolved);
};

export const toLiveMapLayer = (host: PopupWidgetHost, layer: MaybeLayer, map: __esri.Map | null | undefined): __esri.FeatureLayer | null => {
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
  const queryable: MaybeLayer = getQueryableLayer(layer);
  return (queryable || layer) as __esri.FeatureLayer;
};

export const layerKeysMatch = (host: PopupWidgetHost, a: MaybeLayer, b: MaybeLayer): boolean => {
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
export const resolveFeatureLayerForUseDataSource = async (host: PopupWidgetHost, jmv: JimuMapView, useDs: PopupUseDataSource | null | undefined): Promise<__esri.FeatureLayer | null> => {
  try {
    if (!useDs?.dataSourceId) return null;

    const dsId = String(useDs.dataSourceId);
    const map = jmv?.view?.map;
    if (!map) return null;

    const jmvProbe: JimuMapViewProbe = jmv;
    const jlvByApi = jmvProbe.getJimuLayerViewByDataSourceId?.(dsId);
    const fromApi: MaybeLayer = getQueryableLayer(jlvByApi?.layer);
    if (fromApi) return host.toLiveMapLayer(fromApi, map);

    const jlvList: PopupJimuLayerViewLike[] = jmv.getAllJimuLayerViews?.() || [];
    const layerIdHint = extractMapLayerIdFromDsId(dsId);

    for (const lv of jlvList) {
      if (
        lv?.layerDataSourceId === dsId ||
        lv?.dataSourceId === dsId
      ) {
        const resolved: MaybeLayer = getQueryableLayer(lv?.layer);
        if (resolved) return host.toLiveMapLayer(resolved, map);
      }
    }

    if (layerIdHint) {
      const match = jlvList.find(
        (lv) => String(lv?.layer?.id || "") === layerIdHint,
      );
      const resolved: MaybeLayer = getQueryableLayer(match?.layer);
      if (resolved) return host.toLiveMapLayer(resolved, map);
    }

    const dsMgr = DataSourceManager.getInstance();
    const ds = asDataSourceLike(dsMgr.getDataSource(dsId));
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
      const queryable: MaybeLayer = getQueryableLayer(dsLayer);
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
