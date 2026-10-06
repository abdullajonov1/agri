// Polygon Attribute Inspector (AgriPolygon refactor)
// ✅ UPDATED: supports MULTIPLE selected Feature Layers (e.g. yearly layers filtered by another widget)

import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Point from "esri/geometry/Point";
import { JimuMapView } from "jimu-arcgis";
import { AllWidgetProps, QueriableDataSource, React } from "jimu-core";
import { type AgriDataSourceEngine } from "../../../gis/agri-data-source-engine";
import { getSharedAgriDataSourceEngine } from "../../../gis/agri-engine-registry";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "./popup-constants";
import { getInitialLang, type LangCode } from "./messages";
import {
  getPopupWidth,
  getPinnedPopupHeight,
  getPopupDimensions,
  getResolvedTheme,
  pruneFeatureQueryCache,
  getFeatureQueryCacheKey,
  tr,
  isDashboardEmbedded,
  getCropOverlayTop,
  getMapAreaRect,
  observeMapAreaResize,
  getEffectiveMapBottom,
  measurePopupHeight,
  popupPositionsEqual,
  applyPopupPosition,
  schedulePopupLayout,
  schedulePopupLayoutAfterContent,
  calculatePinnedPosition,
  repositionPinnedIfNeeded,
  togglePinToCorner,
  handleOutsideClick,
  onPopupHeaderMouseDown,
  onPopupDragMove,
  onPopupDragEnd,
  clampPopupToMapContainer,
} from "./components/layout-handlers";

export type Config = {
  fieldsToShow?: string[];
  titleField?: string;
  labels?: Record<string, string>;
  settings?: {
    zoomToSelection?: boolean; // default true
    showMapPopup?: boolean; // default false
    showAttachments?: boolean; // default true (when undefined)
  };
  chartEnabled?: boolean;
  chartType?: "bar" | "line";
  chartTitle?: string;
  chartFields?: string[];
  chartColor?: string;
};

export type AttachmentItem = {
  id: number;
  name?: string;
  size?: number;
  contentType?: string;
  url?: string; // direct download URL
  previewObjectUrl?: string; // created via URL.createObjectURL for <img> previews
};

export interface State {
  currentLang: LangCode;
  isDarkTheme: boolean;

  jimuMapView?: JimuMapView | null;

  /** ✅ MULTI: all resolved layers from settings */
  featureLayers: __esri.FeatureLayer[];
  /** ✅ MULTI: map clicked layer => dsId (best-effort) */
  layerKeyToDsId: Record<string, string>;

  /** ✅ MULTI: store DS schemas per DS id */
  dataSourcesById: Record<string, QueriableDataSource>;

  /** which layer was last clicked (for aliases/field resolving) */
  lastClickedDsId: string | null;
  lastClickedLayerKey: string | null;

  pinToCorner: boolean;

  // attachments UI
  loadingAttachments: boolean;
  attachments: AttachmentItem[];
  attachmentsError: string | null;
  attachmentsExpanded: boolean;

  loading: boolean;
  error: string | null;

  selectedAttrs: Record<string, any> | null;
  selectedOID: number | null;
  objectIdField: string | null;

  showPopup: boolean;
  /** X collapses the panel; selection + data stay until real deselect. */
  popupMinimized: boolean;
  popupPosition: { x: number; y: number } | null;
  clickScreenPoint: { x: number; y: number } | null;

  debugInfo: {
    layerInfo?: any;
    hitTestResults?: any;
    queryResults?: any;
    fieldMapping?: any;
    availableLayers?: any;
  };

  chartExpanded: boolean;
  chartHoverIndex: number | null;

  // Latest-day vegetation index values (NDVI/SAVI/RVI/CI/EVI/NDWI) for the
  // currently selected polygon, from agri_vegetation_indices.
  loadingLatestIndices: boolean;
  latestIndexDate: string | null;
  latestIndexValues: Record<string, number> | null;
}

import type { PopupWidgetHost } from "./popup-host";
import {
  getDetachedQueryLayer,
  snapshotDefinitionExpressions,
  restoreDriftedDefinitionExpressions,
  queryFeatureByObjectIdCached,
  setupThemeObserver,
  handleThemeChange,
  handleLanguageChange,
  layerSupportsAttachments,
  setupHighlightLayer,
  highlightPolygon,
  clearHighlight,
  restoreExtentBeforeSelection,
  cleanupHighlight,
  getLinkedMapWidgetId,
  getMapViewFromManager,
  handleMapViewReady,
  scheduleMapViewFallback,
  scheduleMapInitRetry,
  expandUseDataSourceEntries,
  addResolvedLayer,
  collectLayersFromDataSources,
  onActiveViewChange,
  initializeMapConnection,
  toLiveMapLayer,
  layerKeysMatch,
  resolveFeatureLayerForUseDataSource,
} from "./components/map-handlers";
import {
  attachMapClick,
  ensureMapClickAttached,
  handleXyPageClosed,
  handleMasterFilterChanged,
  handleWidgetSelectionChanged,
  openPopupForUniqueid,
  handleSharedMapClick,
  detachMapClick,
  toClickQueryGeometry,
  findHitGraphic,
  pickClickGraphic,
  isHighlightLayer,
  isLayerEffectivelyVisible,
  isAgriculturalFieldLayer,
  isAgriculturalFieldGraphic,
  getClickTargetLayers,
  resolveClickLayers,
  resolveClickFeatureAt,
  findAttributeValueCaseInsensitive,
  notifyGraffPolygonSelection,
  broadcastPopupVisibility,
  fetchLatestVegetationIndices,
  resolveDisplayAttrs,
  onViewClick,
} from "./components/click-handlers";
import {
  fetchAttachmentPreview,
  revokeAllAttachmentUrls,
  isImageContentType,
  bytesToSize,
  loadAttachmentsForOid,
  isDateField,
  getClickedLayer,
  resolveFieldName,
  normalizeFieldAlias,
  findFieldMetaOnLayer,
  resolveAliasFromLiveLayers,
  resolveAliasFromDataSourceSchema,
  getFieldAlias,
  formatDateSmart,
  formatValue,
  getOutFields,
  calculatePopupPosition,
  componentDidMount,
  componentWillUnmount,
  componentDidUpdate,
  closePopup,
  minimizePopup,
  expandPopup,
  onDataSourceCreated,
  toggleChartExpanded,
  clearChartHover,
  setChartHover,
  niceChartMax,
  formatChartTick,
  formatChartTooltipValue,
  buildSmoothLinePath,
  buildRoundedBarPath,
} from "./components/field-handlers";
import {
  renderChartIcon,
  renderLatestIndices,
  renderChart,
  renderPopup,
  render,
} from "./components/render-panel";

export default class AgriPolygon extends React.PureComponent<
  AllWidgetProps<Config>,
  State
> {
  private _isMounted = false;
  private _unbindMasterFilter: (() => void) | null = null;
  private themeObserver: MutationObserver | null = null;
  private _clickHandle: IHandleLike | null = null;
  /** Monotonic id so a slow/duplicate click path cannot close a newer popup. */
  private _clickGeneration = 0;
  private _popupRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _highlightLayer: __esri.GraphicsLayer | null = null;
  private _highlightGraphic: __esri.Graphic | null = null;
  private _highlightHaloGraphic: __esri.Graphic | null = null;
  private _extentBeforeSelection: __esri.Extent | null = null;
  /** Currently inspected field uniqueid (map or table via hub). Same-id map click toggles off. */
  private _activeInspectedUniqueid: string | null = null;
  /** Last yil|viloyat|tuman from masterFilterChanged — geography move closes popup. */
  private _lastMasterGeoKey = "";
  private _isDraggingPopup = false;
  private _popupDragOffset = { x: 0, y: 0 };
  private _popupLayoutTimer: ReturnType<typeof setTimeout> | null = null;
  private _popupLayoutRaf = 0;
  private mapAreaResizeObserver: ResizeObserver | null = null;
  private readonly _featureQueryCacheTtlMs = 60 * 60 * 1000;
  private _featureQueryCache = new Map<
    string,
    { expires: number; value: Promise<__esri.Graphic | null> }
  >();
  /** Detached query clients keyed by service URL; never mutate live map sublayers. */
  private _queryOnlyLayers = new Map<string, FeatureLayer>();
  private readonly dataSourceEngine: AgriDataSourceEngine;
  private mapViewFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private mapInitRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private connectedMapViewId = "";
  private mapInitRetryCount = 0;
  private readonly maxMapInitRetries = 12;
  private mapClickBootstrapTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POPUP_WIDTH = 340;
  private readonly POPUP_MARGIN = 12;
  /** Match dashboard map overlays: 16px horizontal and 12px vertical inset. */
  private readonly DASHBOARD_POPUP_HORIZONTAL_INSET = 16;
  private readonly DASHBOARD_POPUP_VERTICAL_INSET = 12;
  /** Guards against a stale latest-indices response landing after a newer polygon selection. */
  private _latestIndicesRequestId = 0;

  private getPopupWidth(
    view?: __esri.MapView | __esri.SceneView | null,
  ): number {
    return getPopupWidth(this as unknown as PopupWidgetHost, view);
  }

  private getPinnedPopupHeight(
    view: __esri.MapView | __esri.SceneView,
    topY: number,
  ): number {
    return getPinnedPopupHeight(this as unknown as PopupWidgetHost, view, topY);
  }

  private getPopupDimensions(
    view?: __esri.MapView | __esri.SceneView | null,
    pinned = false,
    position?: { x: number; y: number } | null,
  ): { width: number; height: number } {
    return getPopupDimensions(this as unknown as PopupWidgetHost, view, pinned, position);
  }

  constructor(props: AllWidgetProps<Config>) {
    super(props);
    this.dataSourceEngine = getSharedAgriDataSourceEngine(props.id);

    this.state = {
      currentLang: getInitialLang(),
      isDarkTheme: this.getResolvedTheme(),

      jimuMapView: null,

      featureLayers: [],
      layerKeyToDsId: {},
      dataSourcesById: {},

      lastClickedDsId: null,
      lastClickedLayerKey: null,

      pinToCorner: true,

      loadingAttachments: false,
      attachments: [],
      attachmentsError: null,
      attachmentsExpanded: false,

      loading: false,
      error: null,

      selectedAttrs: null,
      selectedOID: null,
      objectIdField: null,

      showPopup: false,
      popupMinimized: false,
      popupPosition: null,
      clickScreenPoint: null,

      debugInfo: {},
      chartExpanded: false,
      chartHoverIndex: null,

      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    };
  }

  private getResolvedTheme = (): boolean => {
    return getResolvedTheme(this as unknown as PopupWidgetHost);
  };

  componentDidMount(): void {
    return componentDidMount(this as unknown as PopupWidgetHost);
  }

  componentWillUnmount(): void {
    return componentWillUnmount(this as unknown as PopupWidgetHost);
  }

  private pruneFeatureQueryCache(now = Date.now()): void {
    return pruneFeatureQueryCache(this as unknown as PopupWidgetHost, now);
  }

  private getFeatureQueryCacheKey(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): string {
    return getFeatureQueryCacheKey(this as unknown as PopupWidgetHost, layer, oidField, oid, outFields);
  }

  private getDetachedQueryLayer = async (
    layer: any,
  ): Promise<__esri.FeatureLayer | null> => {
    return getDetachedQueryLayer(this as unknown as PopupWidgetHost, layer);
  };

  private snapshotDefinitionExpressions(
    layers: Array<__esri.FeatureLayer | any>,
  ): Map<any, string> {
    return snapshotDefinitionExpressions(this as unknown as PopupWidgetHost, layers);
  }

  private restoreDriftedDefinitionExpressions(
    snapshot: Map<any, string>,
  ): void {
    return restoreDriftedDefinitionExpressions(this as unknown as PopupWidgetHost, snapshot);
  }

  private async queryFeatureByObjectIdCached(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): Promise<__esri.Graphic | null> {
    return queryFeatureByObjectIdCached(this as unknown as PopupWidgetHost, layer, oidField, oid, outFields);
  }
  private tr = (
    key: string,
    params?: Record<string, string | number>,
  ): string => {
    return tr(this as unknown as PopupWidgetHost, key, params);
  };

  private setupThemeObserver = (): void => {
    return setupThemeObserver(this as unknown as PopupWidgetHost);
  };

  private handleThemeChange = (e: any): void => {
    return handleThemeChange(this as unknown as PopupWidgetHost, e);
  };

  private handleLanguageChange = (e: any): void => {
    return handleLanguageChange(this as unknown as PopupWidgetHost, e);
  };

  /* --- pinned popup helpers --- */
  private isDashboardEmbedded(): boolean {
    return isDashboardEmbedded(this as unknown as PopupWidgetHost);
  }

  private getCropOverlayTop(): number | null {
    return getCropOverlayTop(this as unknown as PopupWidgetHost);
  }

  private getMapAreaRect(
    view: __esri.MapView | __esri.SceneView,
  ): DOMRect {
    return getMapAreaRect(this as unknown as PopupWidgetHost, view);
  }

  private observeMapAreaResize(
    view: __esri.MapView | __esri.SceneView,
  ): void {
    return observeMapAreaResize(this as unknown as PopupWidgetHost, view);
  }

  private getEffectiveMapBottom(
    view: __esri.MapView | __esri.SceneView,
    gap = 4,
  ): number {
    return getEffectiveMapBottom(this as unknown as PopupWidgetHost, view, gap);
  }

  private measurePopupHeight(popupEl: HTMLElement): number {
    return measurePopupHeight(this as unknown as PopupWidgetHost, popupEl);
  }

  private popupPositionsEqual(
    a: { x: number; y: number } | null | undefined,
    b: { x: number; y: number },
    epsilon = 1,
  ): boolean {
    return popupPositionsEqual(this as unknown as PopupWidgetHost, a, b, epsilon);
  }

  private applyPopupPosition = (pos: { x: number; y: number }): void => {
    return applyPopupPosition(this as unknown as PopupWidgetHost, pos);
  };

  private schedulePopupLayout = (): void => {
    return schedulePopupLayout(this as unknown as PopupWidgetHost);
  };

  private schedulePopupLayoutAfterContent = (): void => {
    return schedulePopupLayoutAfterContent(this as unknown as PopupWidgetHost);
  };

  private calculatePinnedPosition = (
    view: __esri.MapView | __esri.SceneView,
  ): { x: number; y: number } => {
    return calculatePinnedPosition(this as unknown as PopupWidgetHost, view);
  };

  private repositionPinnedIfNeeded = () => {
    return repositionPinnedIfNeeded(this as unknown as PopupWidgetHost);
  };

  private togglePinToCorner = () => {
    return togglePinToCorner(this as unknown as PopupWidgetHost);
  };

  private handleOutsideClick = (event: MouseEvent) => {
    return handleOutsideClick(this as unknown as PopupWidgetHost, event);
  };

  private onPopupHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    return onPopupHeaderMouseDown(this as unknown as PopupWidgetHost, e);
  };

  private onPopupDragMove = (e: MouseEvent) => {
    return onPopupDragMove(this as unknown as PopupWidgetHost, e);
  };

  private onPopupDragEnd = () => {
    return onPopupDragEnd(this as unknown as PopupWidgetHost);
  };
  private layerSupportsAttachments(
    layer: __esri.FeatureLayer | FeatureLayer | null | undefined,
  ): boolean {
    return layerSupportsAttachments(this as unknown as PopupWidgetHost, layer);
  }

  /* ---------------- Highlight management ---------------- */

  private setupHighlightLayer = (view: __esri.MapView | __esri.SceneView) => {
    return setupHighlightLayer(this as unknown as PopupWidgetHost, view);
  };

  private highlightPolygon = (geometry: __esri.Geometry) => {
    return highlightPolygon(this as unknown as PopupWidgetHost, geometry);
  };

  private clearHighlight = () => {
    return clearHighlight(this as unknown as PopupWidgetHost);
  };

  private restoreExtentBeforeSelection = () => {
    return restoreExtentBeforeSelection(this as unknown as PopupWidgetHost);
  };

  private cleanupHighlight = () => {
    return cleanupHighlight(this as unknown as PopupWidgetHost);
  };

  /* ---------------- Map wiring ---------------- */

  private getLinkedMapWidgetId(): string | null {
    return getLinkedMapWidgetId(this as unknown as PopupWidgetHost);
  }

  private getMapViewFromManager(
    mapWidgetId: string | null,
  ): JimuMapView | null {
    return getMapViewFromManager(this as unknown as PopupWidgetHost, mapWidgetId);
  }

  private handleMapViewReady = (event: Event): void => {
    return handleMapViewReady(this as unknown as PopupWidgetHost, event);
  };

  private scheduleMapViewFallback = (): void => {
    return scheduleMapViewFallback(this as unknown as PopupWidgetHost);
  };

  private scheduleMapInitRetry = (jmv: JimuMapView): void => {
    return scheduleMapInitRetry(this as unknown as PopupWidgetHost, jmv);
  };

  private expandUseDataSourceEntries(useList: any[]): any[] {
    return expandUseDataSourceEntries(this as unknown as PopupWidgetHost, useList);
  }

  private addResolvedLayer = (
    target: __esri.FeatureLayer[],
    layerKeyToDsId: Record<string, string>,
    seen: Set<string>,
    layer: any,
    dsId?: string,
  ): void => {
    return addResolvedLayer(this as unknown as PopupWidgetHost, target, layerKeyToDsId, seen, layer, dsId);
  };

  private collectLayersFromDataSources = (
    jmv: JimuMapView,
    useList: any[],
  ): {
    layers: __esri.FeatureLayer[];
    layerKeyToDsId: Record<string, string>;
  } => {
    return collectLayersFromDataSources(this as unknown as PopupWidgetHost, jmv, useList);
  };

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this as unknown as PopupWidgetHost, jimuMapView);
  };

  private initializeMapConnection = async (jmv: JimuMapView) => {
    return initializeMapConnection(this as unknown as PopupWidgetHost, jmv);
  };

  private toLiveMapLayer = (
    layer: any,
    map: __esri.Map | null | undefined,
  ): __esri.FeatureLayer | null => {
    return toLiveMapLayer(this as unknown as PopupWidgetHost, layer, map);
  };

  private layerKeysMatch = (a: any, b: any): boolean => {
    return layerKeysMatch(this as unknown as PopupWidgetHost, a, b);
  };

  private resolveFeatureLayerForUseDataSource = async (
    jmv: JimuMapView,
    useDs: any,
  ): Promise<__esri.FeatureLayer | null> => {
    return resolveFeatureLayerForUseDataSource(this as unknown as PopupWidgetHost, jmv, useDs);
  };
  private clampPopupToMapContainer = (
    pos: { x: number; y: number },
    view: __esri.MapView | __esri.SceneView,
  ) => {
    return clampPopupToMapContainer(this as unknown as PopupWidgetHost, pos, view);
  };

  private attachMapClick(jmv: JimuMapView) {
    return attachMapClick(this as unknown as PopupWidgetHost, jmv);
  }

  private ensureMapClickAttached = (): boolean => {
    return ensureMapClickAttached(this as unknown as PopupWidgetHost);
  };

  private handleXyPageClosed = (): void => {
    return handleXyPageClosed(this as unknown as PopupWidgetHost);
  };

  private handleMasterFilterChanged = (event: Event): void => {
    return handleMasterFilterChanged(this as unknown as PopupWidgetHost, event);
  };

  private handleWidgetSelectionChanged = (event: Event): void => {
    return handleWidgetSelectionChanged(this as unknown as PopupWidgetHost, event);
  };

  private openPopupForUniqueid = async (
    uniqueid: string,
    opts?: { zoom?: boolean; notifySelection?: boolean },
  ): Promise<void> => {
    return openPopupForUniqueid(this as unknown as PopupWidgetHost, uniqueid, opts);
  };

  private handleSharedMapClick = async (event: Event): Promise<void> => {
    return handleSharedMapClick(this as unknown as PopupWidgetHost, event);
  };

  private detachMapClick() {
    return detachMapClick(this as unknown as PopupWidgetHost);
  }

  /* ---------------- Click → hitTest → query full attrs ---------------- */

  private toClickQueryGeometry = (
    view: __esri.MapView | __esri.SceneView,
    screenPoint: { x: number; y: number },
    mapPoint?: { x?: number; y?: number; spatialReference?: { wkid?: number } },
  ): __esri.Point | null => {
    return toClickQueryGeometry(this as unknown as PopupWidgetHost, view, screenPoint, mapPoint);
  };

  private findHitGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    layers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => {
    return findHitGraphic(this as unknown as PopupWidgetHost, hit, layers);
  };

  private pickClickGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    preferredLayers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => {
    return pickClickGraphic(this as unknown as PopupWidgetHost, hit, preferredLayers);
  };

  private isHighlightLayer(layer: any): boolean {
    return isHighlightLayer(this as unknown as PopupWidgetHost, layer);
  }

  private isLayerEffectivelyVisible(
    layer: any,
    view: __esri.MapView | __esri.SceneView,
  ): boolean {
    return isLayerEffectivelyVisible(this as unknown as PopupWidgetHost, layer, view);
  }

  private isAgriculturalFieldLayer(layer: any): boolean {
    return isAgriculturalFieldLayer(this as unknown as PopupWidgetHost, layer);
  }

  private isAgriculturalFieldGraphic(graphic: __esri.Graphic, layer: any): boolean {
    return isAgriculturalFieldGraphic(this as unknown as PopupWidgetHost, graphic, layer);
  }
  private getClickTargetLayers(
    view: __esri.MapView | __esri.SceneView,
  ): __esri.FeatureLayer[] {
    return getClickTargetLayers(this as unknown as PopupWidgetHost, view);
  }

  private async resolveClickLayers(
    view: __esri.MapView | __esri.SceneView,
    jmv: JimuMapView,
  ): Promise<__esri.FeatureLayer[]> {
    return resolveClickLayers(this as unknown as PopupWidgetHost, view, jmv);
  }

  private resolveClickFeatureAt = async (
    ev: __esri.ViewClickEvent,
    view: __esri.MapView | __esri.SceneView,
    layers: __esri.FeatureLayer[],
  ): Promise<{
    graphic: __esri.Graphic;
    queryHitLayer: __esri.FeatureLayer | null;
  } | null> => {
    return resolveClickFeatureAt(this as unknown as PopupWidgetHost, ev, view, layers);
  };

  private findAttributeValueCaseInsensitive(
    attributes: Record<string, any> | null | undefined,
    fieldName: string,
  ): any {
    return findAttributeValueCaseInsensitive(this as unknown as PopupWidgetHost, attributes, fieldName);
  }

  private notifyGraffPolygonSelection = (
    uniqueid: string,
    polygonMode: boolean,
    clickedAt?: number,
    regionId?: number | null,
  ): void => {
    return notifyGraffPolygonSelection(this as unknown as PopupWidgetHost, uniqueid, polygonMode, clickedAt, regionId);
  };

  private broadcastPopupVisibility = (open: boolean): void => {
    return broadcastPopupVisibility(this as unknown as PopupWidgetHost, open);
  };

  private static readonly VEG_INDEX_FIELDS = popupVegIndexFields;

  private fetchLatestVegetationIndices = async (
    uniqueId: string,
  ): Promise<void> => {
    return fetchLatestVegetationIndices(this as unknown as PopupWidgetHost, uniqueId);
  };

  private async resolveDisplayAttrs(
    polygonAttributes: Record<string, any> | null | undefined,
  ): Promise<Record<string, any>> {
    return resolveDisplayAttrs(this as unknown as PopupWidgetHost, polygonAttributes);
  }

  private onViewClick = async (ev: __esri.ViewClickEvent) => {
    return onViewClick(this as unknown as PopupWidgetHost, ev);
  };

  /* ---------------- Attachments helpers ---------------- */

  private async fetchAttachmentPreview(url: string): Promise<Blob> {
    return fetchAttachmentPreview(this as unknown as PopupWidgetHost, url);
  }

  private revokeAllAttachmentUrls() {
    return revokeAllAttachmentUrls(this as unknown as PopupWidgetHost);
  }

  private isImageContentType(ct?: string) {
    return isImageContentType(this as unknown as PopupWidgetHost, ct);
  }

  private bytesToSize(n?: number): string {
    return bytesToSize(this as unknown as PopupWidgetHost, n);
  }

  private async loadAttachmentsForOid(layer: FeatureLayer, oid: number) {
    return loadAttachmentsForOid(this as unknown as PopupWidgetHost, layer, oid);
  }

  /* ---------------- Field alias + formatting ---------------- */

  private isDateField(name: string): boolean {
    return isDateField(this as unknown as PopupWidgetHost, name);
  }

  private getClickedLayer(): __esri.FeatureLayer | null {
    return getClickedLayer(this as unknown as PopupWidgetHost);
  }

  private resolveFieldName = (key: string): string | null => {
    return resolveFieldName(this as unknown as PopupWidgetHost, key);
  };

  private normalizeFieldAlias(field: any, fallbackName: string): string {
    return normalizeFieldAlias(this as unknown as PopupWidgetHost, field, fallbackName);
  }

  private findFieldMetaOnLayer(
    layer: any,
    fieldName: string,
  ): __esri.Field | null {
    return findFieldMetaOnLayer(this as unknown as PopupWidgetHost, layer, fieldName);
  }

  private resolveAliasFromLiveLayers(fieldName: string): string | null {
    return resolveAliasFromLiveLayers(this as unknown as PopupWidgetHost, fieldName);
  }

  private resolveAliasFromDataSourceSchema(
    fieldName: string,
    ds: any,
  ): string | null {
    return resolveAliasFromDataSourceSchema(this as unknown as PopupWidgetHost, fieldName, ds);
  }

  private getFieldAlias(name: string): string {
    return getFieldAlias(this as unknown as PopupWidgetHost, name);
  }

  private formatDateSmart(raw: any): string {
    return formatDateSmart(this as unknown as PopupWidgetHost, raw);
  }

  private formatValue(name: string, raw: any): string {
    return formatValue(this as unknown as PopupWidgetHost, name, raw);
  }

  private getOutFields(layer: FeatureLayer, oidField: string): string[] {
    return getOutFields(this as unknown as PopupWidgetHost, layer, oidField);
  }

  /* ---------------- Popup positioning ---------------- */

  private calculatePopupPosition = (
    clickPoint: { x: number; y: number },
    view: __esri.MapView | __esri.SceneView,
  ): { x: number; y: number } => {
    return calculatePopupPosition(this as unknown as PopupWidgetHost, clickPoint, view);
  };

  componentDidUpdate(
    prevProps: Readonly<AllWidgetProps<Config>>,
    prevState: Readonly<State>,
  ) {
    return componentDidUpdate(this as unknown as PopupWidgetHost, prevProps, prevState);
  }

  private closePopup = (opts?: {
    restoreExtent?: boolean;
    notifyDeselect?: boolean;
  }) => {
    return closePopup(this as unknown as PopupWidgetHost, opts);
  };

  private minimizePopup = (): void => {
    return minimizePopup(this as unknown as PopupWidgetHost);
  };

  private expandPopup = (): void => {
    return expandPopup(this as unknown as PopupWidgetHost);
  };

  /* ---------------- DS hook (instantiates DS) ---------------- */

  onDataSourceCreated = (ds: QueriableDataSource) => {
    return onDataSourceCreated(this as unknown as PopupWidgetHost, ds);
  };

  /* ---------------- Chart rendering ---------------- */

  private toggleChartExpanded = (): void => {
    return toggleChartExpanded(this as unknown as PopupWidgetHost);
  };

  private renderChartIcon = (type: "bar" | "line" = "bar"): JSX.Element =>
    renderChartIcon(this as unknown as PopupWidgetHost, type);

  private clearChartHover = (): void => {
    return clearChartHover(this as unknown as PopupWidgetHost);
  };

  private setChartHover = (index: number): void => {
    return setChartHover(this as unknown as PopupWidgetHost, index);
  };

  private niceChartMax(value: number): number {
    return niceChartMax(this as unknown as PopupWidgetHost, value);
  }

  private formatChartTick(value: number): string {
    return formatChartTick(this as unknown as PopupWidgetHost, value);
  }

  private formatChartTooltipValue(value: number): string {
    return formatChartTooltipValue(this as unknown as PopupWidgetHost, value);
  }

  private buildSmoothLinePath(
    points: Array<{ x: number; y: number }>,
  ): string {
    return buildSmoothLinePath(this as unknown as PopupWidgetHost, points);
  }

  private buildRoundedBarPath(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): string {
    return buildRoundedBarPath(this as unknown as PopupWidgetHost, x, y, width, height, radius);
  }

  private renderLatestIndices = () => {
    return renderLatestIndices(this as unknown as PopupWidgetHost);
  };

  private renderChart = () => {
    return renderChart(this as unknown as PopupWidgetHost);
  };

  /* ---------------- Popup UI ---------------- */

  private renderPopup = () => {
    return renderPopup(this as unknown as PopupWidgetHost);
  };

  render() {
    return render(this as unknown as PopupWidgetHost);
  }
}

export interface IHandleLike {
  remove: () => void;
}
