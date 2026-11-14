import {
  DataSourceManager,
  getAppStore,
  type DataSource,
} from "jimu-core";
import {
  type JimuMapView,
  MapViewManager,
  loadArcGISJSAPIModules,
} from "jimu-arcgis";
import { looksLikeRegionYearLayerHaystack } from "../gis/feature-layer-data";

/** MapView exposes `resize()` at runtime although it is not in the public typings. */
export type ResizableMapView = __esri.MapView & { resize?: () => void };

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

const MAP_SLOT_SELECTOR = ".agri-dashboard-map-slot";

function findMapSlot(container: HTMLElement | null): HTMLElement | null {
  return (container?.closest(MAP_SLOT_SELECTOR) as HTMLElement | null) ?? null;
}

function getActiveFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement || doc.webkitFullscreenElement || null;
}

async function exitFullscreen(): Promise<void> {
  if (typeof document.exitFullscreen === "function") {
    await document.exitFullscreen();
  } else {
    await Promise.resolve((document as FullscreenDocument).webkitExitFullscreen?.());
  }
}

/** Updates the fullscreen flag and asks the view to resize on the next frame. */
export function syncFullscreenState(
  container: HTMLElement | null,
  viewRef: { current: __esri.MapView | null },
  setIsFullscreen: (value: boolean) => void,
): void {
  const mapSlot = findMapSlot(container);
  setIsFullscreen(Boolean(mapSlot && getActiveFullscreenElement() === mapSlot));
  window.requestAnimationFrame(() => {
    try {
      (viewRef.current as ResizableMapView | null)?.resize?.();
    } catch {
      /* MapView resize observer will handle it */
    }
  });
}

export async function toggleFullscreen(
  container: HTMLElement | null,
  onToggled: () => void,
): Promise<void> {
  const mapSlot = findMapSlot(container);
  if (!mapSlot) return;
  const slot = mapSlot as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  try {
    const activeElement = getActiveFullscreenElement();
    if (activeElement === mapSlot) {
      await exitFullscreen();
    } else {
      if (activeElement) await exitFullscreen();
      if (typeof mapSlot.requestFullscreen === "function") {
        await mapSlot.requestFullscreen();
      } else {
        await Promise.resolve(slot.webkitRequestFullscreen?.());
      }
    }
    onToggled();
  } catch {
    /* Fullscreen may be blocked by the browser or iframe policy. */
  }
}

export function zoomViewBy(view: __esri.MapView | null, delta: number): void {
  if (!view || view.destroyed) return;
  const minZoom = Number(view.constraints?.minZoom ?? 5);
  const targetZoom = Math.max(minZoom, Number(view.zoom || minZoom) + delta);
  void view.goTo(
    { center: view.center, zoom: targetZoom },
    { animate: true, duration: 420, easing: "ease-in-out" },
  ).catch((): undefined => undefined);
}

export function readThemeEvent(event: Event): boolean {
  const detail = (event as CustomEvent)?.detail || {};
  return typeof detail.isDarkTheme === "boolean"
    ? detail.isDarkTheme
    : String(detail.theme || "").toLowerCase() === "dark";
}

export function readSelectedRegionEvent(event: Event): boolean {
  const detail = (event as CustomEvent)?.detail || {};
  const filters = detail.filters || detail.currentFilters || {};
  const locked = detail.scope?.lockedViloyat || "";
  return Boolean(String(locked || filters.viloyat || "").trim());
}

export function dispatchMapSettingsRequest(mapWidgetId: string): void {
  window.dispatchEvent(
    new CustomEvent("agri-main:map-settings-request", {
      detail: { widgetId: mapWidgetId.replace(/-embedded-map$/, "") },
    }),
  );
}

/** Hides every region+year operational layer without loading it. */
export function hideRegionYearLayers(map: __esri.Map): void {
  const operationalLayers =
    map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  for (const layer of operationalLayers) {
    const haystack = `${String(layer?.title || "")} ${String((layer as { url?: string })?.url || "")}`;
    const isRegionYearLayer =
      String(layer?.type || "").toLowerCase() !== "group" &&
      looksLikeRegionYearLayerHaystack(haystack);
    if (!isRegionYearLayer) continue;
    // Hide only — do not layer.when()/load every region service here.
    // Forcing load on all agri region layers at once can flood MapServer.
    layer.visible = false;
    if (Number(layer.opacity ?? 1) !== 1) layer.opacity = 1;
  }
}

/** Constructor properties of the Uzbekistan framing extent. */
export function createUzbekistanExtentProps(): __esri.ExtentProperties {
  return {
    xmin: 55.9,
    ymin: 37.15,
    xmax: 73.2,
    ymax: 45.65,
    spatialReference: { wkid: 4326 },
  };
}

/** Portal-item fields read from a WebMap data source (some live only on the instance). */
export interface PortalItemDataSourceLike {
  portalUrl?: string;
  itemId?: string;
  getDataSourceJson?: () => { portalUrl?: string; itemId?: string } | null;
}

/** `appConfig.portalUrl` is present at runtime but not declared on AppConfig. */
const readUndeclaredPortalUrl = (value: unknown): unknown =>
  (value as { portalUrl?: unknown } | null | undefined)?.portalUrl;

type WindowWithJimuConfig = Window & { jimuConfig?: { portalUrl?: string } };

export function getPortalUrl(dataSource: PortalItemDataSourceLike | null): string {
  const json = dataSource?.getDataSourceJson?.();
  const state = getAppStore().getState();
  return String(
    dataSource?.portalUrl || json?.portalUrl || state?.portalUrl ||
      readUndeclaredPortalUrl(state?.appConfig) ||
      (window as WindowWithJimuConfig)?.jimuConfig?.portalUrl ||
      "https://www.arcgis.com",
  ).replace(/\/$/, "");
}

export function getItemId(dataSource: PortalItemDataSourceLike | null): string {
  const json = dataSource?.getDataSourceJson?.();
  return String(dataSource?.itemId || json?.itemId || "").trim();
}

type Ref<T> = { current: T };

/** Mutable handles the effect cleanup needs (filled while initializing). */
export interface AgriMapSession {
  disposed: boolean;
  view: __esri.MapView | null;
  jimuMapViewId: string;
}

export interface AgriMapInitContext {
  mapWidgetId: string;
  dataSourceId: string;
  rootDataSource: DataSource | null;
  session: AgriMapSession;
  containerRef: Ref<HTMLDivElement | null>;
  viewRef: Ref<__esri.MapView | null>;
  mapRef: Ref<__esri.Map | null>;
  jimuMapViewRef: Ref<JimuMapView | null>;
  automaticBasemapRef: Ref<string>;
  onViewReadyRef: Ref<((jimuMapView: JimuMapView) => void) | undefined>;
  onLoadingChangeRef: Ref<((loading: boolean) => void) | undefined>;
  onErrorRef: Ref<((message: string) => void) | undefined>;
  setActiveBasemapId: (id: string) => void;
  setReadyView: (view: __esri.MapView | null) => void;
}

export interface CreatedAgriMap {
  map: __esri.Map;
  MapView: new (properties: __esri.MapViewProperties) => __esri.MapView;
  Extent: __esri.ExtentConstructor;
}

/**
 * After the settings switch to another WebMap, `rootDataSource` still holds
 * the previous one until DataSourceComponent reports the new one; opening it
 * would pair the old map with the new data source id.
 */
export function resolveWebMapDataSource(
  rootDataSource: DataSource | null,
  dataSourceId: string,
): DataSource | null {
  if (rootDataSource && rootDataSource.id === dataSourceId) return rootDataSource;
  return dataSourceId
    ? DataSourceManager.getInstance().getDataSource(dataSourceId) || null
    : null;
}

/**
 * Creates the WebMap (or a basemap-only Map) and, for WebMaps, parses it and
 * hides every region+year layer BEFORE the MapView exists, so the view never
 * sends exports for the WebMap's saved visibility.
 */
export async function createAgriMap(
  ctx: AgriMapInitContext,
  ds: DataSource,
): Promise<CreatedAgriMap | null> {
  const itemId = getItemId(ds as PortalItemDataSourceLike);
  const portalUrl = getPortalUrl(ds as PortalItemDataSourceLike);
  const [WebMap, EsriMap, MapView, Extent] = await loadArcGISJSAPIModules([
    "esri/WebMap",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Extent",
  ]);
  if (ctx.session.disposed || !ctx.containerRef.current) return null;

  const webMap: __esri.WebMap | null = itemId
    ? new WebMap({ portalItem: { id: itemId, portal: { url: portalUrl } } })
    : null;
  const map: __esri.Map =
    webMap ?? new EsriMap({ basemap: ctx.automaticBasemapRef.current });
  ctx.mapRef.current = map;
  ctx.setActiveBasemapId(ctx.automaticBasemapRef.current);

  if (webMap && typeof webMap.load === "function") {
    await webMap.load();
    map.basemap = ctx.automaticBasemapRef.current as unknown as __esri.Basemap;
    ctx.setActiveBasemapId(ctx.automaticBasemapRef.current);
    hideRegionYearLayers(map);
  }
  return { map, MapView, Extent };
}

/** Creates the MapView framed on Uzbekistan and waits until it is ready. */
export async function createAgriMapView(
  ctx: AgriMapInitContext,
  created: CreatedAgriMap,
): Promise<__esri.MapView | null> {
  // Always frame Uzbekistan: the WebMap portal viewpoint is often all of Central Asia.
  const uzbekistanExtent = new created.Extent(createUzbekistanExtentProps());
  const view: __esri.MapView = new created.MapView({
    container: ctx.containerRef.current,
    map: created.map,
    extent: uzbekistanExtent,
    constraints: { rotationEnabled: false, minZoom: 5, snapToZoom: false },
    ui: { components: [] },
  });
  ctx.session.view = view;
  ctx.viewRef.current = view;
  try {
    view.ui.remove("attribution");
  } catch {
    /* already absent */
  }
  await view.when();
  if (ctx.session.disposed) { view.destroy(); return null; }
  try {
    await view.goTo(uzbekistanExtent, { animate: false });
  } catch {
    /* viewpoint already set via extent */
  }
  return view;
}

/** Registers the view with the MapViewManager; destroys it when disposed meanwhile. */
export async function registerJimuMapView(
  ctx: AgriMapInitContext,
  view: __esri.MapView,
): Promise<JimuMapView | null> {
  const manager = MapViewManager.getInstance();
  const jimuMapView = await manager.createJimuMapView({
    mapWidgetId: ctx.mapWidgetId,
    dataSourceId: ctx.dataSourceId,
    view,
    isActive: true,
    isEnablePopup: false,
    mapViewManager: manager,
    useUrlHashLayersVisibility: false,
  });
  if (ctx.session.disposed) {
    try {
      MapViewManager.getInstance().destroyJimuMapView(jimuMapView.id);
    } catch {
      /* noop */
    }
    try { view.destroy(); } catch { /* noop */ }
    return null;
  }
  ctx.session.jimuMapViewId = jimuMapView.id;
  ctx.jimuMapViewRef.current = jimuMapView;
  return jimuMapView;
}

/** Opens the connected WebMap and reports loading/ready/error through the refs. */
export async function initializeAgriMap(ctx: AgriMapInitContext): Promise<void> {
  if (!ctx.containerRef.current) return;
  ctx.onLoadingChangeRef.current?.(true);
  try {
    // No WebMap chosen in the settings: open nothing (no basemap-only map).
    if (!ctx.dataSourceId) {
      ctx.onLoadingChangeRef.current?.(false);
      return;
    }
    const ds = resolveWebMapDataSource(ctx.rootDataSource, ctx.dataSourceId);
    // WebMap data source not created yet: the rootDataSource effect re-runs this.
    if (!ds) return;
    try { await ds.ready?.(); } catch { /* WebMap loads from the portal item */ }

    const created = await createAgriMap(ctx, ds);
    if (!created) return;
    const view = await createAgriMapView(ctx, created);
    if (!view) return;
    const jimuMapView = await registerJimuMapView(ctx, view);
    if (!jimuMapView) return;
    ctx.setReadyView(view);
    // The map is usable as soon as the view is ready; background layer
    // updates must not keep the dashboard behind a loader.
    ctx.onLoadingChangeRef.current?.(false);
    ctx.onViewReadyRef.current?.(jimuMapView);
  } catch (error) {
    if (!ctx.session.disposed) {
      ctx.onLoadingChangeRef.current?.(false);
      ctx.onErrorRef.current?.(
        error instanceof Error ? error.message : "Xaritani yuklab bo'lmadi",
      );
    }
  }
}

/** Effect cleanup: releases the jimu map view, refs and the MapView. */
export function disposeAgriMap(ctx: AgriMapInitContext): void {
  ctx.session.disposed = true;
  if (ctx.session.jimuMapViewId) {
    MapViewManager.getInstance().destroyJimuMapView(ctx.session.jimuMapViewId);
  }
  ctx.jimuMapViewRef.current = null;
  ctx.setReadyView(null);
  ctx.viewRef.current = null;
  ctx.mapRef.current = null;
  try { ctx.session.view?.destroy(); } catch { /* noop */ }
}
