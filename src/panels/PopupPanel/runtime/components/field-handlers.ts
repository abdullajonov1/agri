import type { PopupWidgetHost } from "../popup-host";
import { default as esriRequest } from "esri/request";
import { default as FeatureLayer } from "esri/layers/FeatureLayer";
import type { AttachmentItem, Config, State } from "../widget";
import { isEsriDateFieldType, formatDateSmart as formatDateSmartShared, formatPopupAttributeValue, niceChartMax as niceChartMaxShared, formatChartTick as formatChartTickShared, formatChartTooltipValue as formatChartTooltipValueShared } from "../popup-format-helpers";
import { getAgriLayerMapKey } from "../../../../gis/feature-layer-data";
import { normalizeFieldAlias as normalizeFieldAliasShared, localizedPopupFieldLabel, localizedPopupVhValue } from "../popup-field-helpers";
import { getCropDisplayName } from "../../../../shared/agri-crop-labels";
import { translateAgriPlaceForDisplay } from "../../../../shared/agri-place-display";
import { bindMasterFilter } from "../../../../data/agri-filter-bus";
import { AGRI_MAP_VIEW_READY_EVENT, AGRI_MAP_CLICK_EVENT, AGRI_XY_PAGE_CLOSED_EVENT } from "../../../../gis/agri-data-layer-roles";
import { agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { getSelectedDsIds } from "../../../../gis/agri-data-source-engine";
import { AllWidgetProps, QueriableDataSource } from "jimu-core";
import { AGRI_ESRI_BLOB_TIMEOUT_MS } from "../../../../shared/agri-http";

export async function fetchAttachmentPreview(host: PopupWidgetHost, url: string): Promise<Blob> {
  const resp = await esriRequest(url, {
    responseType: "blob",
    query: {},
    timeout: AGRI_ESRI_BLOB_TIMEOUT_MS,
  } as any);
  return resp?.data instanceof Blob ? resp.data : (resp as unknown as Blob);
}

export function revokeAllAttachmentUrls(host: PopupWidgetHost) {
  try {
    const atts = host.state.attachments || [];
    atts.forEach((a) => {
      if (a.previewObjectUrl) URL.revokeObjectURL(a.previewObjectUrl);
    });
  } catch {}
}

export function isImageContentType(host: PopupWidgetHost, ct?: string) {
  if (!ct) return false;
  return /^image\//i.test(ct);
}

export function bytesToSize(host: PopupWidgetHost, n?: number): string {
  if (!n && n !== 0) return "";
  if (n === 0) return "0 B";
  const k = 1024,
    sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function loadAttachmentsForOid(host: PopupWidgetHost, layer: FeatureLayer, oid: number) {
  // ✅ If layer doesn’t support attachments -> silently show none (NO warning)
  if (!host.layerSupportsAttachments(layer)) {
    if (!host._isMounted) return;
    host.revokeAllAttachmentUrls();
    host.setState({
      loadingAttachments: false,
      attachments: [],
      attachmentsError: null,
      attachmentsExpanded: true, // keep area visible if you want "No attachments"
    });
    return;
  }

  try {
    host.revokeAllAttachmentUrls();
    host.setState({
      loadingAttachments: true,
      attachments: [],
      attachmentsError: null,
    });

    const result = await layer.queryAttachments({ objectIds: [oid] });
    const list = (result?.[oid] || []) as any[];

    const items: AttachmentItem[] = list.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      contentType: att.contentType,
      url: att.url,
    }));

    const withPreviews: AttachmentItem[] = [];
    for (const it of items) {
      if (it.url && host.isImageContentType(it.contentType)) {
        try {
          const blob = await host.fetchAttachmentPreview(it.url);
          it.previewObjectUrl = URL.createObjectURL(blob);
        } catch {
          // ignore preview failures
        }
      }
      withPreviews.push(it);
    }

    if (!host._isMounted) return;
    host.setState({
      attachments: withPreviews,
      loadingAttachments: false,
      attachmentsError: null,
      attachmentsExpanded: true,
    });
  } catch (err: any) {
    // ✅ If server says attachments not supported/enabled -> SILENT (no red warning)
    const msg = String(err?.message || err || "").toLowerCase();
    const isNotSupported =
      msg.includes("doesn't support attachments") ||
      msg.includes("does not support attachments") ||
      msg.includes("attachments are not enabled") ||
      msg.includes("attachments disabled") ||
      (msg.includes("not supported") && msg.includes("attachment"));

    if (!host._isMounted) return;

    if (isNotSupported) {
      host.setState({
        loadingAttachments: false,
        attachments: [],
        attachmentsError: null,
        attachmentsExpanded: true,
      });
      return;
    }

    host.setState({
      loadingAttachments: false,
      attachments: [],
      attachmentsError: String(err?.message || err || "Attachments failed"),
      attachmentsExpanded: true,
    });
  }
}

export function isDateField(host: PopupWidgetHost, name: string): boolean {
  // Use the clicked layer if possible
  const clickedLayer = host.getClickedLayer();
  const fld = clickedLayer?.fields?.find((ff: any) => ff.name === name);
  return isEsriDateFieldType((fld as any)?.type);
}

export function getClickedLayer(host: PopupWidgetHost): __esri.FeatureLayer | null {
  const key = host.state.lastClickedLayerKey;
  if (!key) return null;
  return (
    host.state.featureLayers.find(
      (L) =>
        getAgriLayerMapKey(L) === key ||
        String(L.url || L.id || "") === key,
    ) || null
  );
}

export const resolveFieldName = (host: PopupWidgetHost, key: string): string | null => {
  // Prefer DS schema for the LAST clicked ds (best for alias/jimuName)
  const dsId = host.state.lastClickedDsId;
  const ds: any =
    dsId && host.state.dataSourcesById?.[dsId]
      ? host.state.dataSourcesById[dsId]
      : null;

  try {
    const schema = ds?.getSchema?.();
    const fieldsObj = schema?.fields || {};
    if (fieldsObj[key]?.name) return fieldsObj[key].name;
    for (const k of Object.keys(fieldsObj)) {
      const f = (fieldsObj as any)[k];
      if (f?.name === key || f?.jimuName === key || k === key)
        return f?.name || key;
    }
  } catch {}

  // fallback to clicked layer fields
  const clickedLayer = host.getClickedLayer();
  const lf = clickedLayer?.fields?.find(
    (ff: any) => ff.name === key || ff.alias === key,
  );
  return lf?.name || null;
};

export function normalizeFieldAlias(host: PopupWidgetHost, field: any, fallbackName: string): string {
  return normalizeFieldAliasShared(field, fallbackName);
}

export function findFieldMetaOnLayer(host: PopupWidgetHost, layer: any, fieldName: string): __esri.Field | null {
  const target = fieldName.toLowerCase();
  const fields = Array.isArray(layer?.fields) ? layer.fields : [];
  return (
    (fields.find(
      (f: any) => String(f?.name || "").toLowerCase() === target,
    ) as __esri.Field | undefined) || null
  );
}

export function resolveAliasFromLiveLayers(host: PopupWidgetHost, fieldName: string): string | null {
  const layers: __esri.FeatureLayer[] = [];
  const clicked = host.getClickedLayer();
  if (clicked) layers.push(clicked);
  for (const layer of host.state.featureLayers || []) {
    if (layer && !layers.includes(layer)) layers.push(layer);
  }

  for (const layer of layers) {
    const fld = host.findFieldMetaOnLayer(layer, fieldName);
    if (!fld) continue;
    const alias = host.normalizeFieldAlias(fld, fieldName);
    if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
      return alias;
    }
  }
  return null;
}

export function resolveAliasFromDataSourceSchema(host: PopupWidgetHost, fieldName: string, ds: any): string | null {
  if (!ds) return null;
  try {
    const fieldsObj = ds?.getSchema?.()?.fields || {};
    const target = fieldName.toLowerCase();
    for (const key of Object.keys(fieldsObj)) {
      const f = fieldsObj[key];
      const fname = String(f?.name || f?.jimuName || key || "");
      if (
        fname.toLowerCase() !== target &&
        key.toLowerCase() !== target &&
        String(f?.jimuName || "").toLowerCase() !== target
      ) {
        continue;
      }
      const alias = host.normalizeFieldAlias(f, fieldName);
      if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
        return alias;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getFieldAlias(host: PopupWidgetHost, name: string): string {
  const custom = host.props.config?.labels?.[name];
  if (custom) return custom;

  const realName = host.resolveFieldName(name) || name;
  const localized =
    localizedPopupFieldLabel(realName, host.state.currentLang) ||
    localizedPopupFieldLabel(name, host.state.currentLang);
  if (localized) return localized;

  // Unknown fields keep the service alias.
  const fromLayer = host.resolveAliasFromLiveLayers(realName);
  if (fromLayer) return fromLayer;

  const dsId = host.state.lastClickedDsId;
  const ds: any =
    dsId && host.state.dataSourcesById?.[dsId]
      ? host.state.dataSourcesById[dsId]
      : null;
  const fromDs = host.resolveAliasFromDataSourceSchema(realName, ds);
  if (fromDs) return fromDs;

  for (const layerDs of Object.values(host.state.dataSourcesById || {})) {
    const alias = host.resolveAliasFromDataSourceSchema(realName, layerDs);
    if (alias) return alias;
  }

  const clickedLayer = host.getClickedLayer();
  const layerFld = clickedLayer
    ? host.findFieldMetaOnLayer(clickedLayer, realName)
    : null;
  const layerAlias = String(layerFld?.alias || "").trim();
  if (
    layerAlias &&
    layerAlias.toLowerCase() !== realName.toLowerCase() &&
    layerAlias.toLowerCase() !== String(name).toLowerCase()
  ) {
    return layerAlias;
  }

  return (
    localizedPopupFieldLabel(realName, host.state.currentLang) ||
    localizedPopupFieldLabel(name, host.state.currentLang) ||
    realName
  );
}

export function formatDateSmart(host: PopupWidgetHost, raw: any): string {
  return formatDateSmartShared(raw);
}

export function formatValue(host: PopupWidgetHost, name: string, raw: any): string {
  const formatted = formatPopupAttributeValue(raw, {
    isDateField: host.isDateField(name),
    formatDate: (value) => host.formatDateSmart(value),
  });
  const key = String(host.resolveFieldName(name) || name)
    .trim()
    .toLowerCase();
  const lang = host.state.currentLang;
  if (key === "turi" || key === "crop" || key === "uzspace") {
    const crop = getCropDisplayName(raw, lang);
    if (crop) return crop;
  }
  if (key === "viloyat") {
    return translateAgriPlaceForDisplay(String(raw ?? ""), lang, "region");
  }
  if (key === "tuman") {
    return translateAgriPlaceForDisplay(String(raw ?? ""), lang, "district");
  }
  if (key === "vh" || key === "ndvi_status") {
    return localizedPopupVhValue(raw, lang) || formatted;
  }
  return formatted;
}

export function getOutFields(host: PopupWidgetHost, layer: FeatureLayer, oidField: string): string[] {
  // keep your debugging behavior
  return ["*"];
}

export const calculatePopupPosition = (host: PopupWidgetHost, clickPoint: { x: number; y: number }, view: __esri.MapView | __esri.SceneView): { x: number; y: number } => {
  const container = view.container as HTMLElement;
  const rect = container.getBoundingClientRect();

  const margin = host.POPUP_MARGIN;
  const popupW = host.getPopupWidth(view);
  const popupH = popupW;

  // ✅ EB builds differ:
  // - some give ev.x/ev.y relative to container (0..rect.width)
  // - others give viewport coords (same space as rect.left/top)
  const looksContainerRelative =
    clickPoint.x >= 0 &&
    clickPoint.y >= 0 &&
    clickPoint.x <= rect.width + 2 &&
    clickPoint.y <= rect.height + 2;

  // Convert click to VIEWPORT coords (because popup is position: fixed)
  const viewportClickX = looksContainerRelative
    ? rect.left + clickPoint.x
    : clickPoint.x;
  const viewportClickY = looksContainerRelative
    ? rect.top + clickPoint.y
    : clickPoint.y;

  // Map container boundaries in viewport coords
  const mapLeft = rect.left;
  const mapTop = rect.top;
  const mapRight = rect.right;
  const mapBottom = host.getEffectiveMapBottom(view, margin);

  // Prefer bottom-right of click
  let x = viewportClickX + margin;
  let y = viewportClickY + margin;

  // Flip left if overflowing right edge (CRITICAL!)
  // Check if popup would go outside map's right boundary
  if (x + popupW > mapRight - margin) {
    x = viewportClickX - popupW - margin;
  }

  // Flip up if overflowing bottom edge
  if (y + popupH > mapBottom - margin) {
    y = viewportClickY - popupH - margin;
  }

  // Final hard clamp to map container bounds
  // This is the critical part - ensure popup NEVER exceeds map bounds
  const minX = mapLeft + margin;
  const maxX = mapRight - popupW - margin;
  const minY = mapTop + margin;
  const maxY = mapBottom - popupH - margin;

  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));

  // FINAL SAFETY NET: Ensure x never exceeds right boundary
  if (x + popupW > mapRight - margin) {
    x = mapRight - popupW - margin;
  }
  // Also ensure x >= left boundary
  if (x < mapLeft + margin) {
    x = mapLeft + margin;
  }

  return { x, y };
};

export function componentDidMount(host: PopupWidgetHost): void {
  host._isMounted = true;
  host.setupThemeObserver();
  const isDarkTheme = host.getResolvedTheme();
  if (isDarkTheme !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme });
  }
  document.addEventListener(
    "themeChanged",
    host.handleThemeChange as EventListener,
  );
  document.addEventListener(
    "languageChanged",
    host.handleLanguageChange as EventListener,
  );
  document.addEventListener("mousedown", host.handleOutsideClick);
  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChanged);
  document.addEventListener(
    "widgetSelectionChanged",
    host.handleWidgetSelectionChanged as EventListener,
  );
  window.addEventListener("resize", host.schedulePopupLayout);
  window.addEventListener(
    AGRI_MAP_VIEW_READY_EVENT,
    host.handleMapViewReady as EventListener,
  );
  window.addEventListener(
    AGRI_MAP_CLICK_EVENT,
    host.handleSharedMapClick as EventListener,
  );
  window.addEventListener(
    AGRI_XY_PAGE_CLOSED_EVENT,
    host.handleXyPageClosed as EventListener,
  );
  if (!host.isDashboardEmbedded()) {
    window.addEventListener("scroll", host.schedulePopupLayout, true);
  }
  host.scheduleMapViewFallback();
  host.mapClickBootstrapTimer = setInterval(() => {
    if (host.ensureMapClickAttached() && host.mapClickBootstrapTimer) {
      clearInterval(host.mapClickBootstrapTimer);
      host.mapClickBootstrapTimer = null;
    }
  }, 2500);
  agriMapClickDebug("AgriPolygon mounted", {
    widgetId: host.props.id,
    embedded: host.isDashboardEmbedded(),
    mapWidgetId: host.getLinkedMapWidgetId(),
    useDataSourceIds: getSelectedDsIds(host.props.useDataSources),
  });
}

export function componentWillUnmount(host: PopupWidgetHost): void {
  host._isMounted = false;
  if (host.state.showPopup) {
    host.broadcastPopupVisibility(false);
  }
  document.removeEventListener(
    "themeChanged",
    host.handleThemeChange as EventListener,
  );
  document.removeEventListener(
    "languageChanged",
    host.handleLanguageChange as EventListener,
  );
  host.detachMapClick();
  host.cleanupHighlight();
  document.removeEventListener("mousedown", host.handleOutsideClick);
  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;
  document.removeEventListener(
    "widgetSelectionChanged",
    host.handleWidgetSelectionChanged as EventListener,
  );
  window.removeEventListener("resize", host.schedulePopupLayout);
  window.removeEventListener(
    AGRI_MAP_VIEW_READY_EVENT,
    host.handleMapViewReady as EventListener,
  );
  window.removeEventListener(
    AGRI_MAP_CLICK_EVENT,
    host.handleSharedMapClick as EventListener,
  );
  window.removeEventListener(
    AGRI_XY_PAGE_CLOSED_EVENT,
    host.handleXyPageClosed as EventListener,
  );
  if (host.mapViewFallbackTimer) clearTimeout(host.mapViewFallbackTimer);
  if (host.mapInitRetryTimer) clearTimeout(host.mapInitRetryTimer);
  if (host.mapClickBootstrapTimer) clearInterval(host.mapClickBootstrapTimer);
  window.removeEventListener("scroll", host.schedulePopupLayout, true);
  if (host._popupLayoutTimer) clearTimeout(host._popupLayoutTimer);
  if (host._popupLayoutRaf) cancelAnimationFrame(host._popupLayoutRaf);
  host.mapAreaResizeObserver?.disconnect();
  host.mapAreaResizeObserver = null;
  window.removeEventListener("mousemove", host.onPopupDragMove);
  window.removeEventListener("mouseup", host.onPopupDragEnd);
  if (host.themeObserver) {
    host.themeObserver.disconnect();
    host.themeObserver = null;
  }
  host.revokeAllAttachmentUrls();
  host._featureQueryCache.clear();
}

export function componentDidUpdate(host: PopupWidgetHost, prevProps: Readonly<AllWidgetProps<Config>>, prevState: Readonly<State>) {
  const prevDs = getSelectedDsIds(prevProps.useDataSources).join("|");
  const nextDs = getSelectedDsIds(host.props.useDataSources).join("|");
  const dsChanged = prevDs !== nextDs;
  const prevMap = String(
    (prevProps.useMapWidgetIds as any)?.[0] ||
      (prevProps.useMapWidgetIds as any)?.get?.(0) ||
      "",
  );
  const nextMap = String(
    (host.props.useMapWidgetIds as any)?.[0] ||
      (host.props.useMapWidgetIds as any)?.get?.(0) ||
      "",
  );
  const mapChanged = prevMap !== nextMap;
  if ((dsChanged || mapChanged) && host.state.jimuMapView) {
    void host.initializeMapConnection(host.state.jimuMapView);
  } else if (mapChanged) {
    host.scheduleMapViewFallback();
  }

  if (
    prevState.showPopup !== host.state.showPopup ||
    prevState.popupMinimized !== host.state.popupMinimized
  ) {
    host.broadcastPopupVisibility(
      host.state.showPopup && !host.state.popupMinimized,
    );
  } else if (
    host.state.showPopup &&
    !host.state.popupMinimized &&
    prevState.pinToCorner !== host.state.pinToCorner
  ) {
    host.broadcastPopupVisibility(true);
  }

  if (!host.state.showPopup || host.state.popupMinimized) return;

  const openedNow =
    (host.state.showPopup && !prevState.showPopup) ||
    (prevState.popupMinimized && !host.state.popupMinimized);
  const attachmentsChanged =
    host.state.loadingAttachments !== prevState.loadingAttachments ||
    (host.state.attachments?.length || 0) !==
      (prevState.attachments?.length || 0);
  const loadingChanged = host.state.loading !== prevState.loading;
  const attrsChanged = host.state.selectedAttrs !== prevState.selectedAttrs;

  if (
    !openedNow &&
    !attachmentsChanged &&
    !loadingChanged &&
    !attrsChanged
  ) {
    return;
  }

  host.schedulePopupLayoutAfterContent();
}

export const closePopup = (host: PopupWidgetHost, opts?: {
    restoreExtent?: boolean;
    notifyDeselect?: boolean;
  }) => {
  // Closing the panel alone must keep the polygon highlight + map extent.
  // Explicit callers (empty map click / geo reset) opt into restore/deselect.
  const restoreExtent = opts?.restoreExtent === true;
  const notifyDeselect = opts?.notifyDeselect === true;

  // Invalidate every pending hitTest/query/attachment request. Otherwise a
  // field click that was still loading could reopen its stale popup after
  // the user had already moved to another district or region.
  host._clickGeneration += 1;
  host._latestIndicesRequestId += 1;

  if (!host.state.showPopup) {
    if (notifyDeselect) {
      host.clearHighlight();
      host.notifyGraffPolygonSelection("", false);
    }
    if (!restoreExtent) host._extentBeforeSelection = null;
    host.setState({
      loading: false,
      error: null,
      selectedAttrs: null,
      selectedOID: null,
      objectIdField: null,
      lastClickedDsId: null,
      lastClickedLayerKey: null,
      popupPosition: null,
      clickScreenPoint: null,
      popupMinimized: false,
    });
    return;
  }

  if (notifyDeselect) {
    host.clearHighlight();
    host.notifyGraffPolygonSelection("", false);
  }
  host.revokeAllAttachmentUrls();
  host.setState({
    showPopup: false,
    popupMinimized: false,
    popupPosition: null,
    clickScreenPoint: null,
    loading: false,
    error: null,
    selectedAttrs: null,
    selectedOID: null,
    objectIdField: null,
    lastClickedDsId: null,
    lastClickedLayerKey: null,
    attachments: [],
    attachmentsExpanded: false,
    loadingAttachments: false,
    chartExpanded: false,
    chartHoverIndex: null,
    loadingLatestIndices: false,
    latestIndexDate: null,
    latestIndexValues: null,
  });
  if (restoreExtent) {
    host.restoreExtentBeforeSelection();
  } else {
    host._extentBeforeSelection = null;
  }
};

/** Header X — collapse the panel; keep polygon selection + loaded attrs. */
export const minimizePopup = (host: PopupWidgetHost): void => {
  if (!host._isMounted || !host.state.showPopup || host.state.popupMinimized) {
    return;
  }
  host.setState({ popupMinimized: true });
};

/** Expand a previously minimized attribute panel. */
export const expandPopup = (host: PopupWidgetHost): void => {
  if (!host._isMounted || !host.state.showPopup || !host.state.popupMinimized) {
    return;
  }
  host.setState({ popupMinimized: false });
};

export const onDataSourceCreated = (host: PopupWidgetHost, ds: QueriableDataSource) => {
  if (!ds?.id) return;
  host.dataSourceEngine.onDsCreated(
    ds,
    getSelectedDsIds(host.props.useDataSources),
  );
  host.setState((prev) => ({
    dataSourcesById: { ...(prev.dataSourcesById || {}), [ds.id]: ds },
  }));
  if (host.state.jimuMapView) {
    void host.initializeMapConnection(host.state.jimuMapView);
  } else {
    host.scheduleMapViewFallback();
  }
};

export const toggleChartExpanded = (host: PopupWidgetHost): void => {
  host.setState((prev) => ({ chartExpanded: !prev.chartExpanded }));
};

export const clearChartHover = (host: PopupWidgetHost): void => {
  if (host.state.chartHoverIndex != null) {
    host.setState({ chartHoverIndex: null });
  }
};

export const setChartHover = (host: PopupWidgetHost, index: number): void => {
  if (host.state.chartHoverIndex !== index) {
    host.setState({ chartHoverIndex: index });
  }
};

export function niceChartMax(host: PopupWidgetHost, value: number): number {
  return niceChartMaxShared(value);
}

export function formatChartTick(host: PopupWidgetHost, value: number): string {
  return formatChartTickShared(value);
}

export function formatChartTooltipValue(host: PopupWidgetHost, value: number): string {
  return formatChartTooltipValueShared(value);
}

export function buildSmoothLinePath(host: PopupWidgetHost, points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function buildRoundedBarPath(host: PopupWidgetHost, x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height);
  const bottom = y + height;
  return [
    `M ${x} ${bottom}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${bottom}`,
    "Z",
  ].join(" ");
}
