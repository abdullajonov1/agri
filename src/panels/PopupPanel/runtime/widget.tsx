// Polygon Attribute Inspector (AgriPolygon refactor)
// ✅ UPDATED: supports MULTIPLE selected Feature Layers (e.g. yearly layers filtered by another widget)
//
// The class is a thin host: every method delegates to a handler module that
// receives the instance as a PopupWidgetHost (see ./popup-host.ts).

import FeatureLayer from "esri/layers/FeatureLayer";
import { JimuMapView } from "jimu-arcgis";
import { AllWidgetProps, QueriableDataSource, React } from "jimu-core";
import { type AgriDataSourceEngine } from "../../../gis/agri-data-source-engine";
import { getSharedAgriDataSourceEngine } from "../../../gis/agri-engine-registry";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "./popup-constants";
import { getInitialLang } from "./messages";
import type { PopupWidgetHost } from "./popup-host";
import type {
  AgriLayerLike,
  Config,
  IHandleLike,
  PopupAttributes,
  PopupFieldMeta,
  PopupLanguageDetail,
  PopupThemeDetail,
  PopupUseDataSource,
  State,
} from "./popup-types";
import * as layout from "./components/layout-handlers";
import * as mapH from "./components/map-handlers";
import * as click from "./components/click-handlers";
import * as field from "./components/field-handlers";
import * as panel from "./components/render-panel";

export type { Config, AttachmentItem, State, IHandleLike } from "./popup-types";

type MaybeLayer = AgriLayerLike | null | undefined;
type View = __esri.MapView | __esri.SceneView;
type XY = { x: number; y: number };

/**
 * The component instance seen through the handler-module host contract.
 * Members the handler modules use are public so the class satisfies it.
 */
const asHost = (widget: AgriPolygon): PopupWidgetHost => widget;

export default class AgriPolygon extends React.PureComponent<
  AllWidgetProps<Config>,
  State
> {
  _isMounted = false;
  _unbindMasterFilter: (() => void) | null = null;
  themeObserver: MutationObserver | null = null;
  _clickHandle: IHandleLike | null = null;
  /** Monotonic id so a slow/duplicate click path cannot close a newer popup. */
  _clickGeneration = 0;
  _popupRef: React.RefObject<HTMLDivElement> = React.createRef();
  _highlightLayer: __esri.GraphicsLayer | null = null;
  _highlightGraphic: __esri.Graphic | null = null;
  _highlightHaloGraphic: __esri.Graphic | null = null;
  _extentBeforeSelection: __esri.Extent | null = null;
  /** Currently inspected field uniqueid (map or table via hub). Same-id map click toggles off. */
  _activeInspectedUniqueid: string | null = null;
  /** Last yil|viloyat|tuman from masterFilterChanged — geography move closes popup. */
  _lastMasterGeoKey = "";
  _isDraggingPopup = false;
  _popupDragOffset = { x: 0, y: 0 };
  _popupLayoutTimer: ReturnType<typeof setTimeout> | null = null;
  _popupLayoutRaf = 0;
  mapAreaResizeObserver: ResizeObserver | null = null;
  readonly _featureQueryCacheTtlMs = 60 * 60 * 1000;
  _featureQueryCache = new Map<
    string,
    { expires: number; value: Promise<__esri.Graphic | null> }
  >();
  /** Detached query clients keyed by service URL; never mutate live map sublayers. */
  _queryOnlyLayers = new Map<string, FeatureLayer>();
  readonly dataSourceEngine: AgriDataSourceEngine;
  mapViewFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  mapInitRetryTimer: ReturnType<typeof setTimeout> | null = null;
  connectedMapViewId = "";
  mapInitRetryCount = 0;
  readonly maxMapInitRetries = 12;
  mapClickBootstrapTimer: ReturnType<typeof setInterval> | null = null;
  readonly POPUP_WIDTH = 340;
  readonly POPUP_MARGIN = 12;
  /** Match dashboard map overlays: 16px horizontal and 12px vertical inset. */
  readonly DASHBOARD_POPUP_HORIZONTAL_INSET = 16;
  readonly DASHBOARD_POPUP_VERTICAL_INSET = 12;
  /** Guards against a stale latest-indices response landing after a newer polygon selection. */
  _latestIndicesRequestId = 0;

  getPopupWidth(view?: View | null): number {
    return layout.getPopupWidth(asHost(this), view);
  }

  getPinnedPopupHeight(view: View, topY: number): number {
    return layout.getPinnedPopupHeight(asHost(this), view, topY);
  }

  getPopupDimensions(
    view?: View | null,
    pinned = false,
    position?: XY | null,
  ): { width: number; height: number } {
    return layout.getPopupDimensions(asHost(this), view, pinned, position);
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

  getResolvedTheme = (): boolean => layout.getResolvedTheme(asHost(this));

  componentDidMount(): void {
    return field.componentDidMount(asHost(this));
  }

  componentWillUnmount(): void {
    return field.componentWillUnmount(asHost(this));
  }

  pruneFeatureQueryCache(now = Date.now()): void {
    return layout.pruneFeatureQueryCache(asHost(this), now);
  }

  getFeatureQueryCacheKey(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): string {
    return layout.getFeatureQueryCacheKey(asHost(this), layer, oidField, oid, outFields);
  }

  getDetachedQueryLayer = async (
    layer: MaybeLayer,
  ): Promise<__esri.FeatureLayer | null> => mapH.getDetachedQueryLayer(asHost(this), layer);

  snapshotDefinitionExpressions(layers: MaybeLayer[]): Map<AgriLayerLike, string> {
    return mapH.snapshotDefinitionExpressions(asHost(this), layers);
  }

  restoreDriftedDefinitionExpressions(snapshot: Map<AgriLayerLike, string>): void {
    return mapH.restoreDriftedDefinitionExpressions(asHost(this), snapshot);
  }

  async queryFeatureByObjectIdCached(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): Promise<__esri.Graphic | null> {
    return mapH.queryFeatureByObjectIdCached(asHost(this), layer, oidField, oid, outFields);
  }

  tr = (key: string, params?: Record<string, string | number>): string =>
    layout.tr(asHost(this), key, params);

  setupThemeObserver = (): void => mapH.setupThemeObserver(asHost(this));

  handleThemeChange = (e: CustomEvent<PopupThemeDetail> | null | undefined): void =>
    mapH.handleThemeChange(asHost(this), e);

  handleLanguageChange = (e: CustomEvent<PopupLanguageDetail> | null | undefined): void =>
    mapH.handleLanguageChange(asHost(this), e);

  /* --- pinned popup helpers --- */
  isDashboardEmbedded(): boolean {
    return layout.isDashboardEmbedded(asHost(this));
  }

  getCropOverlayTop(): number | null {
    return layout.getCropOverlayTop(asHost(this));
  }

  getMapAreaRect(view: View): DOMRect {
    return layout.getMapAreaRect(asHost(this), view);
  }

  observeMapAreaResize(view: View): void {
    return layout.observeMapAreaResize(asHost(this), view);
  }

  getEffectiveMapBottom(view: View, gap = 4): number {
    return layout.getEffectiveMapBottom(asHost(this), view, gap);
  }

  private measurePopupHeight(popupEl: HTMLElement): number {
    return layout.measurePopupHeight(asHost(this), popupEl);
  }

  popupPositionsEqual(a: XY | null | undefined, b: XY, epsilon = 1): boolean {
    return layout.popupPositionsEqual(asHost(this), a, b, epsilon);
  }

  applyPopupPosition = (pos: XY): void => layout.applyPopupPosition(asHost(this), pos);

  schedulePopupLayout = (): void => layout.schedulePopupLayout(asHost(this));

  schedulePopupLayoutAfterContent = (): void =>
    layout.schedulePopupLayoutAfterContent(asHost(this));

  calculatePinnedPosition = (view: View): XY =>
    layout.calculatePinnedPosition(asHost(this), view);

  repositionPinnedIfNeeded = () => layout.repositionPinnedIfNeeded(asHost(this));

  togglePinToCorner = () => layout.togglePinToCorner(asHost(this));

  handleOutsideClick = (event: MouseEvent) =>
    layout.handleOutsideClick(asHost(this), event);

  onPopupHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) =>
    layout.onPopupHeaderMouseDown(asHost(this), e);

  onPopupDragMove = (e: MouseEvent) => layout.onPopupDragMove(asHost(this), e);

  onPopupDragEnd = () => layout.onPopupDragEnd(asHost(this));

  layerSupportsAttachments(
    layer: __esri.FeatureLayer | FeatureLayer | null | undefined,
  ): boolean {
    return mapH.layerSupportsAttachments(asHost(this), layer);
  }

  /* ---------------- Highlight management ---------------- */

  setupHighlightLayer = (view: View) => mapH.setupHighlightLayer(asHost(this), view);

  highlightPolygon = (geometry: __esri.Geometry) =>
    mapH.highlightPolygon(asHost(this), geometry);

  clearHighlight = () => mapH.clearHighlight(asHost(this));

  restoreExtentBeforeSelection = () => mapH.restoreExtentBeforeSelection(asHost(this));

  cleanupHighlight = () => mapH.cleanupHighlight(asHost(this));

  /* ---------------- Map wiring ---------------- */

  getLinkedMapWidgetId(): string | null {
    return mapH.getLinkedMapWidgetId(asHost(this));
  }

  getMapViewFromManager(mapWidgetId: string | null): JimuMapView | null {
    return mapH.getMapViewFromManager(asHost(this), mapWidgetId);
  }

  handleMapViewReady = (event: Event): void =>
    mapH.handleMapViewReady(asHost(this), event);

  scheduleMapViewFallback = (): void => mapH.scheduleMapViewFallback(asHost(this));

  scheduleMapInitRetry = (jmv: JimuMapView): void =>
    mapH.scheduleMapInitRetry(asHost(this), jmv);

  expandUseDataSourceEntries(useList: PopupUseDataSource[]): PopupUseDataSource[] {
    return mapH.expandUseDataSourceEntries(asHost(this), useList);
  }

  addResolvedLayer = (
    target: __esri.FeatureLayer[],
    layerKeyToDsId: Record<string, string>,
    seen: Set<string>,
    layer: MaybeLayer,
    dsId?: string,
  ): void => mapH.addResolvedLayer(asHost(this), target, layerKeyToDsId, seen, layer, dsId);

  collectLayersFromDataSources = (
    jmv: JimuMapView,
    useList: PopupUseDataSource[],
  ): {
    layers: __esri.FeatureLayer[];
    layerKeyToDsId: Record<string, string>;
  } => mapH.collectLayersFromDataSources(asHost(this), jmv, useList);

  onActiveViewChange = (jimuMapView: JimuMapView) =>
    mapH.onActiveViewChange(asHost(this), jimuMapView);

  initializeMapConnection = async (jmv: JimuMapView) =>
    mapH.initializeMapConnection(asHost(this), jmv);

  toLiveMapLayer = (
    layer: MaybeLayer,
    map: __esri.Map | null | undefined,
  ): __esri.FeatureLayer | null => mapH.toLiveMapLayer(asHost(this), layer, map);

  layerKeysMatch = (a: MaybeLayer, b: MaybeLayer): boolean =>
    mapH.layerKeysMatch(asHost(this), a, b);

  resolveFeatureLayerForUseDataSource = async (
    jmv: JimuMapView,
    useDs: PopupUseDataSource | null | undefined,
  ): Promise<__esri.FeatureLayer | null> =>
    mapH.resolveFeatureLayerForUseDataSource(asHost(this), jmv, useDs);

  clampPopupToMapContainer = (pos: XY, view: View) =>
    layout.clampPopupToMapContainer(asHost(this), pos, view);

  attachMapClick(jmv: JimuMapView) {
    return click.attachMapClick(asHost(this), jmv);
  }

  ensureMapClickAttached = (): boolean => click.ensureMapClickAttached(asHost(this));

  handleXyPageClosed = (): void => click.handleXyPageClosed(asHost(this));

  handleMasterFilterChanged = (event: Event): void =>
    click.handleMasterFilterChanged(asHost(this), event);

  handleWidgetSelectionChanged = (event: Event): void =>
    click.handleWidgetSelectionChanged(asHost(this), event);

  openPopupForUniqueid = async (
    uniqueid: string,
    opts?: { zoom?: boolean; notifySelection?: boolean },
  ): Promise<void> => click.openPopupForUniqueid(asHost(this), uniqueid, opts);

  handleSharedMapClick = async (event: Event): Promise<void> =>
    click.handleSharedMapClick(asHost(this), event);

  detachMapClick() {
    return click.detachMapClick(asHost(this));
  }

  /* ---------------- Click → hitTest → query full attrs ---------------- */

  toClickQueryGeometry = (
    view: View,
    screenPoint: XY,
    mapPoint?: { x?: number; y?: number; spatialReference?: { wkid?: number } },
  ): __esri.Point | null => click.toClickQueryGeometry(asHost(this), view, screenPoint, mapPoint);

  private findHitGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    layers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => click.findHitGraphic(asHost(this), hit, layers);

  pickClickGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    preferredLayers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => click.pickClickGraphic(asHost(this), hit, preferredLayers);

  isHighlightLayer(layer: MaybeLayer): boolean {
    return click.isHighlightLayer(asHost(this), layer);
  }

  isLayerEffectivelyVisible(layer: MaybeLayer, view: View): boolean {
    return click.isLayerEffectivelyVisible(asHost(this), layer, view);
  }

  isAgriculturalFieldLayer(layer: MaybeLayer): boolean {
    return click.isAgriculturalFieldLayer(asHost(this), layer);
  }

  isAgriculturalFieldGraphic(graphic: __esri.Graphic, layer: MaybeLayer): boolean {
    return click.isAgriculturalFieldGraphic(asHost(this), graphic, layer);
  }

  getClickTargetLayers(view: View): __esri.FeatureLayer[] {
    return click.getClickTargetLayers(asHost(this), view);
  }

  async resolveClickLayers(view: View, jmv: JimuMapView): Promise<__esri.FeatureLayer[]> {
    return click.resolveClickLayers(asHost(this), view, jmv);
  }

  resolveClickFeatureAt = async (
    ev: __esri.ViewClickEvent,
    view: View,
    layers: __esri.FeatureLayer[],
  ): Promise<{
    graphic: __esri.Graphic;
    queryHitLayer: __esri.FeatureLayer | null;
  } | null> => click.resolveClickFeatureAt(asHost(this), ev, view, layers);

  findAttributeValueCaseInsensitive(
    attributes: PopupAttributes | null | undefined,
    fieldName: string,
  ): unknown {
    return click.findAttributeValueCaseInsensitive(asHost(this), attributes, fieldName);
  }

  notifyGraffPolygonSelection = (
    uniqueid: string,
    polygonMode: boolean,
    clickedAt?: number,
    regionId?: number | null,
  ): void =>
    click.notifyGraffPolygonSelection(asHost(this), uniqueid, polygonMode, clickedAt, regionId);

  broadcastPopupVisibility = (open: boolean): void =>
    click.broadcastPopupVisibility(asHost(this), open);

  private static readonly VEG_INDEX_FIELDS = popupVegIndexFields;

  fetchLatestVegetationIndices = async (uniqueId: string): Promise<void> =>
    click.fetchLatestVegetationIndices(asHost(this), uniqueId);

  async resolveDisplayAttrs(
    polygonAttributes: PopupAttributes | null | undefined,
  ): Promise<PopupAttributes> {
    return click.resolveDisplayAttrs(asHost(this), polygonAttributes);
  }

  onViewClick = async (ev: __esri.ViewClickEvent) => click.onViewClick(asHost(this), ev);

  /* ---------------- Attachments helpers ---------------- */

  async fetchAttachmentPreview(url: string): Promise<Blob> {
    return field.fetchAttachmentPreview(asHost(this), url);
  }

  revokeAllAttachmentUrls() {
    return field.revokeAllAttachmentUrls(asHost(this));
  }

  isImageContentType(ct?: string) {
    return field.isImageContentType(asHost(this), ct);
  }

  bytesToSize(n?: number): string {
    return field.bytesToSize(asHost(this), n);
  }

  async loadAttachmentsForOid(layer: FeatureLayer, oid: number) {
    return field.loadAttachmentsForOid(asHost(this), layer, oid);
  }

  /* ---------------- Field alias + formatting ---------------- */

  isDateField(name: string): boolean {
    return field.isDateField(asHost(this), name);
  }

  getClickedLayer(): __esri.FeatureLayer | null {
    return field.getClickedLayer(asHost(this));
  }

  resolveFieldName = (key: string): string | null =>
    field.resolveFieldName(asHost(this), key);

  normalizeFieldAlias(meta: PopupFieldMeta | null | undefined, fallbackName: string): string {
    return field.normalizeFieldAlias(asHost(this), meta, fallbackName);
  }

  findFieldMetaOnLayer(layer: MaybeLayer, fieldName: string) {
    return field.findFieldMetaOnLayer(asHost(this), layer, fieldName);
  }

  resolveAliasFromLiveLayers(fieldName: string): string | null {
    return field.resolveAliasFromLiveLayers(asHost(this), fieldName);
  }

  resolveAliasFromDataSourceSchema(fieldName: string, ds: unknown): string | null {
    return field.resolveAliasFromDataSourceSchema(asHost(this), fieldName, ds);
  }

  getFieldAlias(name: string): string {
    return field.getFieldAlias(asHost(this), name);
  }

  formatDateSmart(raw: unknown): string {
    return field.formatDateSmart(asHost(this), raw);
  }

  formatValue(name: string, raw: unknown): string {
    return field.formatValue(asHost(this), name, raw);
  }

  getOutFields(layer: FeatureLayer, oidField: string): string[] {
    return field.getOutFields(asHost(this), layer, oidField);
  }

  /* ---------------- Popup positioning ---------------- */

  calculatePopupPosition = (clickPoint: XY, view: View): XY =>
    field.calculatePopupPosition(asHost(this), clickPoint, view);

  componentDidUpdate(
    prevProps: Readonly<AllWidgetProps<Config>>,
    prevState: Readonly<State>,
  ) {
    return field.componentDidUpdate(asHost(this), prevProps, prevState);
  }

  closePopup = (opts?: { restoreExtent?: boolean; notifyDeselect?: boolean }) =>
    field.closePopup(asHost(this), opts);

  minimizePopup = (): void => field.minimizePopup(asHost(this));

  expandPopup = (): void => field.expandPopup(asHost(this));

  /* ---------------- DS hook (instantiates DS) ---------------- */

  onDataSourceCreated = (ds: QueriableDataSource) => field.onDataSourceCreated(asHost(this), ds);

  /* ---------------- Chart rendering ---------------- */

  toggleChartExpanded = (): void => field.toggleChartExpanded(asHost(this));

  renderChartIcon = (type: "bar" | "line" = "bar"): JSX.Element =>
    panel.renderChartIcon(asHost(this), type);

  clearChartHover = (): void => field.clearChartHover(asHost(this));

  setChartHover = (index: number): void => field.setChartHover(asHost(this), index);

  niceChartMax(value: number): number {
    return field.niceChartMax(asHost(this), value);
  }

  formatChartTick(value: number): string {
    return field.formatChartTick(asHost(this), value);
  }

  formatChartTooltipValue(value: number): string {
    return field.formatChartTooltipValue(asHost(this), value);
  }

  buildSmoothLinePath(points: XY[]): string {
    return field.buildSmoothLinePath(asHost(this), points);
  }

  buildRoundedBarPath(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): string {
    return field.buildRoundedBarPath(asHost(this), x, y, width, height, radius);
  }

  renderLatestIndices = () => panel.renderLatestIndices(asHost(this));

  renderChart = () => panel.renderChart(asHost(this));

  /* ---------------- Popup UI ---------------- */

  renderPopup = () => panel.renderPopup(asHost(this));

  render() {
    return panel.render(asHost(this));
  }
}
