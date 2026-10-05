import type { PopupWidgetHost } from "../../popup-host";
import { JimuMapView } from "jimu-arcgis";
import { AGRI_TABLE_JOIN_FIELD, queryAgriRecordByUniqueId } from "../../../../../gis/agri-table-data-source";
import { escapeArcGIS } from "../../../../../data/agri-sql";
import { getAgriLayerMapKey, getQueryableLayer, isAgriAdminBoundaryLayer, isMapImageGroupSublayer, isQueryableFieldLayer, collectQueryableFieldLayers, getAllFeatureLayersFromMap, safeLoadMapLayer } from "../../../../../gis/feature-layer-data";
import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { default as Point } from "esri/geometry/Point";
import { findAttributeValueCaseInsensitive as findAttributeValueCaseInsensitiveShared } from "../../popup-format-helpers";
import { queryVegetationSeriesForUniqueId, formatArcgisDateToYmd } from "../../../../../gis/agri-vegetation-data-source";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "../../popup-constants";

export function attachMapClick(host: PopupWidgetHost, jmv: JimuMapView) {
  host.detachMapClick();
  const view = jmv?.view as { on?: (event: string, cb: unknown) => unknown } | null;
  if (!view || typeof view.on !== "function") return;
  host._clickHandle = view.on("click", host.onViewClick) as any;
}
export const ensureMapClickAttached = (host: PopupWidgetHost): boolean => {
  if (!host._isMounted) return false;
  const mapWidgetId = host.getLinkedMapWidgetId();
  const jmv =
    host.state.jimuMapView?.view
      ? host.state.jimuMapView
      : host.getMapViewFromManager(mapWidgetId);
  if (!jmv?.view) return false;

  if (!host.state.jimuMapView?.view) {
    host.onActiveViewChange(jmv);
    return true;
  }

  if (!host._clickHandle) {
    host.attachMapClick(jmv);
  }
  return !!host._clickHandle;
};
export const handleXyPageClosed = (host: PopupWidgetHost): void => {
  if (!host.isDashboardEmbedded()) return;
  if (host.state.showPopup) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
  }
};
/**
 * Close the field popup when the hub geography moves (other tuman /
 * viloyat / year) or when polygon focus is cleared. Do not restore the
 * pre-field extent on geography change — Localization is already zooming
 * to the new district/region.
 */
export const handleMasterFilterChanged = (host: PopupWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const detail: any = (event as CustomEvent).detail || {};
  const f: any = detail.filters || {};
  const geoKey = `${String(f.yil || "")}|${String(f.viloyat || "")}|${String(f.tuman || "")}`;
  const prevGeo = host._lastMasterGeoKey;
  host._lastMasterGeoKey = geoKey;

  const geoChanged = Boolean(prevGeo) && prevGeo !== geoKey;
  const polygonCleared = f.polygonMode === false;
  const incomingUnique = String(f.uniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (f.polygonMode === true && incomingUnique) {
    host._activeInspectedUniqueid = incomingUnique;
    // Fallback: if selection arrived via hub but popup is still closed, open it.
    if (!host.state.showPopup) {
      void host.openPopupForUniqueid(incomingUnique, {
        zoom: false,
        notifySelection: false,
      });
    }
  } else if (polygonCleared) {
    host._activeInspectedUniqueid = null;
  }

  if (geoChanged) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
    return;
  }
  // Same geography but hub cleared polygon focus (e.g. Graff deselect).
  if (polygonCleared && (host.state.showPopup || host.state.loading)) {
    host.closePopup({ restoreExtent: true, notifyDeselect: false });
  }
};
/** Immediate close when Region/Pie/year change geography (before map sync finishes). */
export const handleWidgetSelectionChanged = (host: PopupWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const d: any = (event as CustomEvent).detail || {};
  // Our own polygon notify must not close the popup we just opened.
  if (d.source === "AgriPopup") return;
  if (
    d.yil !== undefined ||
    d.viloyat !== undefined ||
    d.tuman !== undefined
  ) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
    return;
  }
  if (d.polygonMode === false) {
    host._activeInspectedUniqueid = null;
    host.closePopup({ restoreExtent: true, notifyDeselect: false });
    return;
  }
  if (
    (d.source === "AgriGraffWidget" || d.source === "AgriGraff10") &&
    d.polygonMode === true &&
    d.uniqueid
  ) {
    const clean = String(d.uniqueid)
      .replace(/[{}]/g, "")
      .trim();
    host._activeInspectedUniqueid = clean;
    // Table / Graff selection must always open the field popup.
    void host.openPopupForUniqueid(clean, {
      zoom: false,
      notifySelection: false,
    });
  }
};
/**
 * Open (or refresh) the field popup for a polygon uniqueid — used when
 * selection comes from the table/Graff path (map click already opens itself).
 */
export const openPopupForUniqueid = async (host: PopupWidgetHost, uniqueid: string, opts?: { zoom?: boolean; notifySelection?: boolean }): Promise<void> => {
  const clean = String(uniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (!clean || !host._isMounted) return;

  const active = String(host._activeInspectedUniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (host.state.showPopup && active === clean && host.state.selectedAttrs) {
    if (host.state.popupMinimized) {
      host.expandPopup();
    } else {
      host.broadcastPopupVisibility(true);
    }
    return;
  }

  const jmv = host.state.jimuMapView;
  const view = jmv?.view;
  if (!view || !jmv) return;

  const clickGeneration = ++host._clickGeneration;
  const isStale = () =>
    !host._isMounted || clickGeneration !== host._clickGeneration;

  host.setState({
    loading: true,
    error: null,
    loadingAttachments: true,
    attachments: [],
    attachmentsExpanded: true,
  });

  try {
    const layers = await host.resolveClickLayers(view, jmv);
    if (isStale()) return;

    let feature: __esri.Graphic | null = null;
    let clickedLayer: __esri.FeatureLayer | null = null;

    for (const layer of layers) {
      if (!host.isAgriculturalFieldLayer(layer)) continue;
      if (!host.isLayerEffectivelyVisible(layer, view)) continue;
      const detached = await host.getDetachedQueryLayer(layer);
      if (isStale()) return;
      const queryTarget = detached || layer;
      const variants = [clean, `{${clean}}`];
      for (const v of variants) {
        const q = queryTarget.createQuery();
        q.outFields = ["*"];
        q.returnGeometry = true;
        q.num = 1;
        q.where = `${AGRI_TABLE_JOIN_FIELD}='${escapeArcGIS(v)}'`;
        try {
          const res = await queryTarget.queryFeatures(q);
          if (res.features?.[0]) {
            feature = res.features[0];
            clickedLayer = layer;
            break;
          }
        } catch {
          /* try next variant / layer */
        }
      }
      if (feature) break;
    }

    if (!feature || !clickedLayer || isStale()) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          attachments: [],
        });
      }
      return;
    }

    const liveLayer =
      (host.toLiveMapLayer(clickedLayer, view.map) ||
        clickedLayer) as __esri.FeatureLayer;
    const layerKey =
      getAgriLayerMapKey(liveLayer) ||
      String(liveLayer?.url || liveLayer?.id || "");
    const dsId = host.state.layerKeyToDsId?.[layerKey] || null;
    const oidField =
      liveLayer.objectIdField ||
      liveLayer.fields?.find((f: any) => f.type === "oid")?.name ||
      null;
    if (!oidField) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          showPopup: false,
        });
      }
      return;
    }

    const oid = feature.attributes?.[oidField];
    if (oid == null) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          showPopup: false,
        });
      }
      return;
    }

    const outFields = host.getOutFields(liveLayer as any, oidField);
    const f =
      (await host.queryFeatureByObjectIdCached(
        liveLayer,
        oidField,
        oid,
        outFields,
      )) || feature;
    if (isStale()) return;

    if (f.geometry) host.highlightPolygon(f.geometry);

    const displayAttrs = await host.resolveDisplayAttrs(f.attributes);
    if (isStale()) return;

    const shouldPin = host.state.pinToCorner;
    const popupPosition = shouldPin
      ? host.calculatePinnedPosition(view)
      : host.state.popupPosition || host.calculatePinnedPosition(view);

    const configuredFields = host.props.config?.fieldsToShow || [];
    const actualFields = Object.keys(displayAttrs);
    const missingFields = configuredFields.filter(
      (field) => !actualFields.includes(field),
    );
    const fieldsWithData = configuredFields.filter(
      (name) =>
        displayAttrs.hasOwnProperty(name) &&
        displayAttrs[name] != null &&
        displayAttrs[name] !== "",
    );

    host._activeInspectedUniqueid = clean;
    host.setState({
      loading: false,
      lastClickedDsId: dsId,
      lastClickedLayerKey: layerKey,
      selectedAttrs: displayAttrs,
      selectedOID: Number(oid),
      objectIdField: oidField,
      showPopup: true,
      popupMinimized: false,
      chartExpanded: shouldPin,
      chartHoverIndex: null,
      popupPosition,
      error:
        missingFields.length > 0
          ? host.tr("error.configuredFieldMissing", {
              fields: missingFields.join(", "),
            })
          : fieldsWithData.length === 0 && configuredFields.length > 0
            ? host.tr("error.noDataForConfiguredFields")
            : null,
    });

    if (opts?.notifySelection) {
      host.notifyGraffPolygonSelection(clean, true, Date.now());
    }
    void host.fetchLatestVegetationIndices(clean);

    if (opts?.zoom !== false && f.geometry && !isStale()) {
      try {
        if (!host._extentBeforeSelection && view.extent?.clone) {
          host._extentBeforeSelection = view.extent.clone();
        }
        const target =
          (f.geometry as any).extent?.expand?.(1.08) || f.geometry;
        void view.goTo(
          { target },
          { duration: 650, easing: "ease-in-out" as any },
        );
      } catch {
        /* ignore */
      }
    }

    if (host.props.config?.settings?.showAttachments !== false) {
      try {
        const clickedUrl = String((liveLayer as any).url || "").trim();
        const attachmentLayer =
          (clickedUrl && host._queryOnlyLayers.get(clickedUrl)) || liveLayer;
        await host.loadAttachmentsForOid(attachmentLayer as any, Number(oid));
      } catch {
        if (!isStale()) {
          host.setState({ loadingAttachments: false, attachments: [] });
        }
      }
    } else if (!isStale()) {
      host.setState({ loadingAttachments: false, attachments: [] });
    }

    if (!isStale()) {
      host.schedulePopupLayoutAfterContent();
    }
  } catch (e: any) {
    if (!isStale()) {
      host.setState({
        loading: false,
        loadingAttachments: false,
        error: e?.message || String(e),
      });
    }
  }
};
export const handleSharedMapClick = async (host: PopupWidgetHost, event: Event): Promise<void> => {
  // Always ignore the Localization click bus. AgriPopup owns view.on("click")
  // exclusively — handling both races two full onViewClick chains: the loser
  // often clears showPopup, restores the pre-selection extent, and flashes
  // other-district fields. Localization may still dispatch for other listeners.
  agriMapClickDebug(
    "AgriPolygon ← shared map-click SKIP (direct view click is sole owner)",
  );
  return;
};
export function detachMapClick(host: PopupWidgetHost) {
  if (host._clickHandle?.remove) host._clickHandle.remove();
  host._clickHandle = null;
}
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
        mapPoint?.spatialReference || (view as any).spatialReference,
    });
  } catch {
    return null;
  }
};
export const findHitGraphic = (host: PopupWidgetHost, hit: __esri.HitTestResult | null | undefined, layers: __esri.FeatureLayer[]): __esri.Graphic | null => {
  const hitResult = hit?.results?.find((r) => {
    if ("graphic" in r && r.graphic) {
      const lyr: any = r.graphic.layer;
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
    const graphic =
      "graphic" in r && (r as any).graphic
        ? ((r as any).graphic as __esri.Graphic)
        : null;
    if (!graphic) continue;

    const rawLayer: any = graphic.layer;
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
        (layer as any).visible !== false
      ) {
        return graphic;
      }
    }
    return null;
  }

  for (const graphic of candidates) {
    const layer: any = graphic.layer;
    if (layer?.visible !== false) return graphic;
  }

  return candidates[0];
};
export function isHighlightLayer(host: PopupWidgetHost, layer: any): boolean {
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
export function isLayerEffectivelyVisible(host: PopupWidgetHost, layer: any, view: __esri.MapView | __esri.SceneView): boolean {
  if (!layer || host.isHighlightLayer(layer)) return false;
  const seen = new Set<any>();
  let current: any = layer;
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current.visible === false) return false;
    current = current.parent || current.layer || null;
  }
  const scale = Number((view as any)?.scale || 0);
  const minScale = Number(layer.minScale || 0);
  const maxScale = Number(layer.maxScale || 0);
  if (scale > 0 && minScale > 0 && scale > minScale) return false;
  if (scale > 0 && maxScale > 0 && scale < maxScale) return false;
  return String(layer.definitionExpression || "1=1").trim() !== "1=0";
}
export function isAgriculturalFieldLayer(host: PopupWidgetHost, layer: any): boolean {
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
  const fields: any[] = Array.isArray(layer.fields) ? layer.fields : [];
  const names = new Set(fields.map((field) => String(field?.name || "").toLowerCase()));
  if (names.has("uniqueid") || names.has("crop_id") || names.has("turi")) return true;
  // looksAgri alone is OK for a hydrating leaf; groups already rejected above.
  return looksAgri;
}
export function isAgriculturalFieldGraphic(host: PopupWidgetHost, graphic: __esri.Graphic, layer: any): boolean {
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
  const liveRoots =
    ((map as any)?.allLayers?.toArray?.() as any[]) || [];
  // MapImage parents are not queryable — expand to agri/feature sublayers.
  const liveMapLayers: __esri.FeatureLayer[] = [];
  const seen = new Set<string>();
  const pushLive = (layer: any) => {
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
    .filter((layer: any) => {
      if (!host.isLayerEffectivelyVisible(layer, view)) return false;
      if (!host.isAgriculturalFieldLayer(layer)) return false;
      const key =
        getAgriLayerMapKey(layer) ||
        String(layer.url || layer.id || "");
      if (host.isDashboardEmbedded()) return true;
      if (!dsKeys.length) return true;
      return !!layerKeyToDsId[key];
    }) as __esri.FeatureLayer[];
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
    /* ignore */
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
          (layer as any).definitionExpression || "",
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
/** Case-insensitive attribute lookup — the polygon layer's join field casing is not guaranteed. */
export function findAttributeValueCaseInsensitive(host: PopupWidgetHost, attributes: Record<string, any> | null | undefined, fieldName: string): any {
  return findAttributeValueCaseInsensitiveShared(attributes, fieldName);
}
/**
 * Tells AgriGraff10 (via AgriLocalization, the central filter hub) which
 * polygon is currently inspected so its chart can switch to showing that
 * single polygon's vegetation-index series instead of the region-wide
 * timeseries. Mirrors the widgetSelectionChanged shape AgriGraffWidget
 * itself already dispatches on its own row-click selection.
 */
export const notifyGraffPolygonSelection = (host: PopupWidgetHost, uniqueid: string, polygonMode: boolean, clickedAt?: number, regionId?: number | null): void => {
  try {
    document.dispatchEvent(
      new CustomEvent("widgetSelectionChanged", {
        detail: {
          source: "AgriPopup",
          polygonMode,
          uniqueid: polygonMode ? uniqueid : "",
          regionId:
            regionId != null && Number.isFinite(regionId) ? regionId : undefined,
          // Timestamp of the ORIGINAL map click (captured before this
          // widget's own async attribute-resolution chain), not of this
          // dispatch — lets downstream listeners (AgriGraff10) detect and
          // ignore a stale notification that resolves after a newer click
          // was already applied (see AgriGraff10's _lastAppliedPolygonClickedAt).
          clickedAt: clickedAt ?? Date.now(),
          timestamp: Date.now(),
        },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
};
export const broadcastPopupVisibility = (host: PopupWidgetHost, open: boolean): void => {
  const pinned = !!host.state.pinToCorner;
  try {
    document.dispatchEvent(
      new CustomEvent("agriMapPopupVisibility", {
        detail: {
          open: !!open,
          pinned,
          source: "AgriPopup",
          timestamp: Date.now(),
        },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
  if (open) {
    // Re-notify after paint so NDVI can measure the real popup box.
    requestAnimationFrame(() => {
      try {
        document.dispatchEvent(
          new CustomEvent("agriMapPopupVisibility", {
            detail: {
              open: true,
              pinned,
              layout: true,
              source: "AgriPopup",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } catch {
        /* ignore */
      }
    });
  }
};
/**
 * Latest-day vegetation index values for the selected polygon, shown in
 * the popup. Reuses queryVegetationSeriesForUniqueId (queries the
 * agri_vegetation_indices ArcGIS table directly, same source AgriGraff10's
 * chart uses) rather than the api-agri export-image/available-dates REST
 * endpoints — those are for fetching a rendered raster for a specific
 * chosen date, which is unnecessary here; we only need the scalar index
 * values for whichever date is most recent, and the table already has
 * ndvi/savi/rvi/ci/evi/ndwi as plain fields per (uniqueid, raster_date).
 */
export const fetchLatestVegetationIndices = async (host: PopupWidgetHost, uniqueId: string): Promise<void> => {
  const id = String(uniqueId || "").trim();
  if (!id) {
    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    });
    return;
  }

  const requestId = ++host._latestIndicesRequestId;
  agriMapClickDebug("vegetation:request", {
    uniqueid: id,
    source: "agri_vegetation_indices/FeatureServer/1",
    requestId,
  });
  host.setState({
    loadingLatestIndices: true,
  });

  try {
    const rows = await queryVegetationSeriesForUniqueId(id);
    if (!host._isMounted || requestId !== host._latestIndicesRequestId) return;

    if (!rows.length) {
      host.setState({
        loadingLatestIndices: false,
        latestIndexDate: null,
        latestIndexValues: null,
      });
      return;
    }

    // Rows come back ordered by raster_date ASC — the last one is the
    // most recent processed date for this polygon.
    const latest = rows[rows.length - 1] as Record<string, any>;
    const date = formatArcgisDateToYmd(latest.raster_date);
    const values: Record<string, number> = {};
    for (const field of popupVegIndexFields) {
      const v = Number(latest[field]);
      if (Number.isFinite(v)) values[field] = v;
    }
    agriMapClickDebug("vegetation:response", {
      uniqueid: id,
      requestId,
      rowCount: rows.length,
      latestDate: date,
      values,
    });

    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: date,
      latestIndexValues: Object.keys(values).length ? values : null,
    });
  } catch {
    if (!host._isMounted || requestId !== host._latestIndicesRequestId) return;
    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    });
  }
};
/**
 * Agri_table_data is an external Table (no geometry) — the map click still
 * resolves the polygon feature for highlight/zoom, but the displayed
 * attributes come from Agri_table_data, joined by uniqueid.
 */
export async function resolveDisplayAttrs(host: PopupWidgetHost, polygonAttributes: Record<string, any> | null | undefined): Promise<Record<string, any>> {
  const joinValue = host.findAttributeValueCaseInsensitive(
    polygonAttributes,
    AGRI_TABLE_JOIN_FIELD,
  );
  if (joinValue == null || String(joinValue).trim() === "") {
    agriMapClickWarn("agri-table-join:SKIP-no-uniqueid", {
      polygonAttributeKeys: Object.keys(polygonAttributes || {}),
    });
    return polygonAttributes || {};
  }
  try {
    agriMapClickDebug("agri-table-join:request", {
      uniqueid: String(joinValue),
      source: "Agri_table_data/FeatureServer/2",
    });
    const agriRecord = await queryAgriRecordByUniqueId(String(joinValue));
    agriMapClickDebug("agri-table-join:response", {
      uniqueid: String(joinValue),
      found: Boolean(agriRecord),
      attributeKeys: Object.keys(agriRecord || {}),
    });
    if (agriRecord) {
      // Keep polygon-only values (for example st_area(shape)) while allowing
      // the joined Agri table to provide/override the popup's business data.
      return { ...(polygonAttributes || {}), ...agriRecord };
    }
  } catch (e) {
    agriMapClickWarn("Agri_table_data lookup failed", {
      uniqueId: joinValue,
      error: (e as any)?.message || String(e),
    });
  }
  return polygonAttributes || {};
}
