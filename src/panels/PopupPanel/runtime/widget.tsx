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

/** The component instance seen through the handler-module host contract. */
const asHost = (widget: AgriPolygon): PopupWidgetHost =>
  widget as unknown as PopupWidgetHost;

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

  private getPopupWidth(view?: View | null): number {
    return layout.getPopupWidth(asHost(this), view);
  }

  private getPinnedPopupHeight(view: View, topY: number): number {
    return layout.getPinnedPopupHeight(asHost(this), view, topY);
  }

  private getPopupDimensions(
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

  private getResolvedTheme = (): boolean => layout.getResolvedTheme(asHost(this));

  componentDidMount(): void {
    return field.componentDidMount(asHost(this));
  }

  componentWillUnmount(): void {
    return field.componentWillUnmount(asHost(this));
  }

  private pruneFeatureQueryCache(now = Date.now()): void {
    return layout.pruneFeatureQueryCache(asHost(this), now);
  }

  private getFeatureQueryCacheKey(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): string {
    return layout.getFeatureQueryCacheKey(asHost(this), layer, oidField, oid, outFields);
  }

  private getDetachedQueryLayer = async (
    layer: MaybeLayer,
  ): Promise<__esri.FeatureLayer | null> => mapH.getDetachedQueryLayer(asHost(this), layer);

  private snapshotDefinitionExpressions(layers: MaybeLayer[]): Map<AgriLayerLike, string> {
    return mapH.snapshotDefinitionExpressions(asHost(this), layers);
  }

  private restoreDriftedDefinitionExpressions(snapshot: Map<AgriLayerLike, string>): void {
    return mapH.restoreDriftedDefinitionExpressions(asHost(this), snapshot);
  }

  private async queryFeatureByObjectIdCached(
    layer: __esri.FeatureLayer,
    oidField: string,
    oid: unknown,
    outFields: string[],
  ): Promise<__esri.Graphic | null> {
    return mapH.queryFeatureByObjectIdCached(asHost(this), layer, oidField, oid, outFields);
  }

  private tr = (key: string, params?: Record<string, string | number>): string =>
    layout.tr(asHost(this), key, params);

  private setupThemeObserver = (): void => mapH.setupThemeObserver(asHost(this));

  private handleThemeChange = (e: CustomEvent<PopupThemeDetail> | null | undefined): void =>
    mapH.handleThemeChange(asHost(this), e);

  private handleLanguageChange = (e: CustomEvent<PopupLanguageDetail> | null | undefined): void =>
    mapH.handleLanguageChange(asHost(this), e);

  /* --- pinned popup helpers --- */
  private isDashboardEmbedded(): boolean {
    return layout.isDashboardEmbedded(asHost(this));
  }

  private getCropOverlayTop(): number | null {
    return layout.getCropOverlayTop(asHost(this));
  }

  private getMapAreaRect(view: View): DOMRect {
    return layout.getMapAreaRect(asHost(this), view);
  }

  private observeMapAreaResize(view: View): void {
    return layout.observeMapAreaResize(asHost(this), view);
  }

  private getEffectiveMapBottom(view: View, gap = 4): number {
    return layout.getEffectiveMapBottom(asHost(this), view, gap);
  }

  private measurePopupHeight(popupEl: HTMLElement): number {
    return layout.measurePopupHeight(asHost(this), popupEl);
  }

  private popupPositionsEqual(a: XY | null | undefined, b: XY, epsilon = 1): boolean {
    return layout.popupPositionsEqual(asHost(this), a, b, epsilon);
  }

  private applyPopupPosition = (pos: XY): void => layout.applyPopupPosition(asHost(this), pos);

  private schedulePopupLayout = (): void => layout.schedulePopupLayout(asHost(this));

  private schedulePopupLayoutAfterContent = (): void =>
    layout.schedulePopupLayoutAfterContent(asHost(this));

  private calculatePinnedPosition = (view: View): XY =>
    layout.calculatePinnedPosition(asHost(this), view);

  private repositionPinnedIfNeeded = () => layout.repositionPinnedIfNeeded(asHost(this));

  private togglePinToCorner = () => layout.togglePinToCorner(asHost(this));

  private handleOutsideClick = (event: MouseEvent) =>
    layout.handleOutsideClick(asHost(this), event);

  private onPopupHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) =>
    layout.onPopupHeaderMouseDown(asHost(this), e);

  private onPopupDragMove = (e: MouseEvent) => layout.onPopupDragMove(asHost(this), e);

  private onPopupDragEnd = () => layout.onPopupDragEnd(asHost(this));

  private layerSupportsAttachments(
    layer: __esri.FeatureLayer | FeatureLayer | null | undefined,
  ): boolean {
    return mapH.layerSupportsAttachments(asHost(this), layer);
  }

  /* ---------------- Highlight management ---------------- */

  private setupHighlightLayer = (view: View) => mapH.setupHighlightLayer(asHost(this), view);

  private highlightPolygon = (geometry: __esri.Geometry) =>
    mapH.highlightPolygon(asHost(this), geometry);

  private clearHighlight = () => mapH.clearHighlight(asHost(this));

  private restoreExtentBeforeSelection = () => mapH.restoreExtentBeforeSelection(asHost(this));

  private cleanupHighlight = () => mapH.cleanupHighlight(asHost(this));

  /* ---------------- Map wiring ---------------- */

  private getLinkedMapWidgetId(): string | null {
    return mapH.getLinkedMapWidgetId(asHost(this));
  }

  private getMapViewFromManager(mapWidgetId: string | null): JimuMapView | null {
    return mapH.getMapViewFromManager(asHost(this), mapWidgetId);
  }

  private handleMapViewReady = (event: Event): void =>
    mapH.handleMapViewReady(asHost(this), event);

  private scheduleMapViewFallback = (): void => mapH.scheduleMapViewFallback(asHost(this));

  private scheduleMapInitRetry = (jmv: JimuMapView): void =>
    mapH.scheduleMapInitRetry(asHost(this), jmv);

  private expandUseDataSourceEntries(useList: PopupUseDataSource[]): PopupUseDataSource[] {
    return mapH.expandUseDataSourceEntries(asHost(this), useList);
  }

  private addResolvedLayer = (
    target: __esri.FeatureLayer[],
    layerKeyToDsId: Record<string, string>,
    seen: Set<string>,
    layer: MaybeLayer,
    dsId?: string,
  ): void => mapH.addResolvedLayer(asHost(this), target, layerKeyToDsId, seen, layer, dsId);

  private collectLayersFromDataSources = (
    jmv: JimuMapView,
    useList: PopupUseDataSource[],
  ): {
    layers: __esri.FeatureLayer[];
    layerKeyToDsId: Record<string, string>;
  } => mapH.collectLayersFromDataSources(asHost(this), jmv, useList);

  onActiveViewChange = (jimuMapView: JimuMapView) =>
    mapH.onActiveViewChange(asHost(this), jimuMapView);

  private initializeMapConnection = async (jmv: JimuMapView) =>
    mapH.initializeMapConnection(asHost(this), jmv);

  private toLiveMapLayer = (
    layer: MaybeLayer,
    map: __esri.Map | null | undefined,
  ): __esri.FeatureLayer | null => mapH.toLiveMapLayer(asHost(this), layer, map);

  private layerKeysMatch = (a: MaybeLayer, b: MaybeLayer): boolean =>
    mapH.layerKeysMatch(asHost(this), a, b);

  private resolveFeatureLayerForUseDataSource = async (
    jmv: JimuMapView,
    useDs: PopupUseDataSource | null | undefined,
  ): Promise<__esri.FeatureLayer | null> =>
    mapH.resolveFeatureLayerForUseDataSource(asHost(this), jmv, useDs);

  private clampPopupToMapContainer = (pos: XY, view: View) =>
    layout.clampPopupToMapContainer(asHost(this), pos, view);

  private attachMapClick(jmv: JimuMapView) {
    return click.attachMapClick(asHost(this), jmv);
  }

  private ensureMapClickAttached = (): boolean => click.ensureMapClickAttached(asHost(this));

  private handleXyPageClosed = (): void => click.handleXyPageClosed(asHost(this));

  private handleMasterFilterChanged = (event: Event): void =>
    click.handleMasterFilterChanged(asHost(this), event);

  private handleWidgetSelectionChanged = (event: Event): void =>
    click.handleWidgetSelectionChanged(asHost(this), event);

  private openPopupForUniqueid = async (
    uniqueid: string,
    opts?: { zoom?: boolean; notifySelection?: boolean },
  ): Promise<void> => click.openPopupForUniqueid(asHost(this), uniqueid, opts);

  private handleSharedMapClick = async (event: Event): Promise<void> =>
    click.handleSharedMapClick(asHost(this), event);

  private detachMapClick() {
    return click.detachMapClick(asHost(this));
  }

  /* ---------------- Click → hitTest → query full attrs ---------------- */

  private toClickQueryGeometry = (
    view: View,
    screenPoint: XY,
    mapPoint?: { x?: number; y?: number; spatialReference?: { wkid?: number } },
  ): __esri.Point | null => click.toClickQueryGeometry(asHost(this), view, screenPoint, mapPoint);

  private findHitGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    layers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => click.findHitGraphic(asHost(this), hit, layers);

  private pickClickGraphic = (
    hit: __esri.HitTestResult | null | undefined,
    preferredLayers: __esri.FeatureLayer[],
  ): __esri.Graphic | null => click.pickClickGraphic(asHost(this), hit, preferredLayers);

  private isHighlightLayer(layer: MaybeLayer): boolean {
    return click.isHighlightLayer(asHost(this), layer);
  }

  private isLayerEffectivelyVisible(layer: MaybeLayer, view: View): boolean {
    return click.isLayerEffectivelyVisible(asHost(this), layer, view);
  }

  private isAgriculturalFieldLayer(layer: MaybeLayer): boolean {
    return click.isAgriculturalFieldLayer(asHost(this), layer);
  }

  private isAgriculturalFieldGraphic(graphic: __esri.Graphic, layer: MaybeLayer): boolean {
    return click.isAgriculturalFieldGraphic(asHost(this), graphic, layer);
  }

  private getClickTargetLayers(view: View): __esri.FeatureLayer[] {
    return click.getClickTargetLayers(asHost(this), view);
  }

  private async resolveClickLayers(view: View, jmv: JimuMapView): Promise<__esri.FeatureLayer[]> {
    return click.resolveClickLayers(asHost(this), view, jmv);
  }

  private resolveClickFeatureAt = async (
    ev: __esri.ViewClickEvent,
    view: View,
    layers: __esri.FeatureLayer[],
  ): Promise<{
    graphic: __esri.Graphic;
    queryHitLayer: __esri.FeatureLayer | null;
  } | null> => click.resolveClickFeatureAt(asHost(this), ev, view, layers);

  private findAttributeValueCaseInsensitive(
    attributes: PopupAttributes | null | undefined,
    fieldName: string,
  ): unknown {
    return click.findAttributeValueCaseInsensitive(asHost(this), attributes, fieldName);
  }

  private notifyGraffPolygonSelection = (
    uniqueid: string,
    polygonMode: boolean,
    clickedAt?: number,
    regionId?: number | null,
  ): void =>
    click.notifyGraffPolygonSelection(asHost(this), uniqueid, polygonMode, clickedAt, regionId);

  private broadcastPopupVisibility = (open: boolean): void =>
    click.broadcastPopupVisibility(asHost(this), open);

  private static readonly VEG_INDEX_FIELDS = popupVegIndexFields;

  private fetchLatestVegetationIndices = async (uniqueId: string): Promise<void> =>
    click.fetchLatestVegetationIndices(asHost(this), uniqueId);

  private async resolveDisplayAttrs(
    polygonAttributes: PopupAttributes | null | undefined,
  ): Promise<PopupAttributes> {
    return click.resolveDisplayAttrs(asHost(this), polygonAttributes);
  }

  private onViewClick = async (ev: __esri.ViewClickEvent) => click.onViewClick(asHost(this), ev);

  /* ---------------- Attachments helpers ---------------- */

  private async fetchAttachmentPreview(url: string): Promise<Blob> {
    return field.fetchAttachmentPreview(asHost(this), url);
  }

  private revokeAllAttachmentUrls() {
    return field.revokeAllAttachmentUrls(asHost(this));
  }

  private isImageContentType(ct?: string) {
    return field.isImageContentType(asHost(this), ct);
  }

  private bytesToSize(n?: number): string {
    return field.bytesToSize(asHost(this), n);
  }

  private async loadAttachmentsForOid(layer: FeatureLayer, oid: number) {
    return field.loadAttachmentsForOid(asHost(this), layer, oid);
  }

  /* ---------------- Field alias + formatting ---------------- */

  private isDateField(name: string): boolean {
    return field.isDateField(asHost(this), name);
  }

  private getClickedLayer(): __esri.FeatureLayer | null {
    return field.getClickedLayer(asHost(this));
  }

  private resolveFieldName = (key: string): string | null =>
    field.resolveFieldName(asHost(this), key);

  private normalizeFieldAlias(meta: PopupFieldMeta | null | undefined, fallbackName: string): string {
    return field.normalizeFieldAlias(asHost(this), meta, fallbackName);
  }

  private findFieldMetaOnLayer(layer: MaybeLayer, fieldName: string) {
    return field.findFieldMetaOnLayer(asHost(this), layer, fieldName);
  }

  private resolveAliasFromLiveLayers(fieldName: string): string | null {
    return field.resolveAliasFromLiveLayers(asHost(this), fieldName);
  }

  private resolveAliasFromDataSourceSchema(fieldName: string, ds: unknown): string | null {
    return field.resolveAliasFromDataSourceSchema(asHost(this), fieldName, ds);
  }

  private getFieldAlias(name: string): string {
    return field.getFieldAlias(asHost(this), name);
  }

  private formatDateSmart(raw: unknown): string {
    return field.formatDateSmart(asHost(this), raw);
  }

  private formatValue(name: string, raw: unknown): string {
    return field.formatValue(asHost(this), name, raw);
  }

  private getOutFields(layer: FeatureLayer, oidField: string): string[] {
    return field.getOutFields(asHost(this), layer, oidField);
  }

  /* ---------------- Popup positioning ---------------- */

  private calculatePopupPosition = (clickPoint: XY, view: View): XY =>
    field.calculatePopupPosition(asHost(this), clickPoint, view);

  componentDidUpdate(
    prevProps: Readonly<AllWidgetProps<Config>>,
    prevState: Readonly<State>,
  ) {
    return field.componentDidUpdate(asHost(this), prevProps, prevState);
  }

  private closePopup = (opts?: { restoreExtent?: boolean; notifyDeselect?: boolean }) =>
    field.closePopup(asHost(this), opts);

  private minimizePopup = (): void => field.minimizePopup(asHost(this));

  private expandPopup = (): void => field.expandPopup(asHost(this));

  /* ---------------- DS hook (instantiates DS) ---------------- */

  onDataSourceCreated = (ds: QueriableDataSource) => field.onDataSourceCreated(asHost(this), ds);

  /* ---------------- Chart rendering ---------------- */

  private toggleChartExpanded = (): void => field.toggleChartExpanded(asHost(this));

  private renderChartIcon = (type: "bar" | "line" = "bar"): JSX.Element =>
    panel.renderChartIcon(asHost(this), type);

  private clearChartHover = (): void => field.clearChartHover(asHost(this));

  private setChartHover = (index: number): void => field.setChartHover(asHost(this), index);

  private niceChartMax(value: number): number {
    return field.niceChartMax(asHost(this), value);
  }

  private formatChartTick(value: number): string {
    return field.formatChartTick(asHost(this), value);
  }

  private formatChartTooltipValue(value: number): string {
    return field.formatChartTooltipValue(asHost(this), value);
  }

  private buildSmoothLinePath(points: XY[]): string {
    return field.buildSmoothLinePath(asHost(this), points);
  }

  private buildRoundedBarPath(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): string {
    return field.buildRoundedBarPath(asHost(this), x, y, width, height, radius);
  }

  private renderLatestIndices = () => panel.renderLatestIndices(asHost(this));

  private renderChart = () => panel.renderChart(asHost(this));

  /* ---------------- Popup UI ---------------- */

  private renderPopup = () => panel.renderPopup(asHost(this));

  render() {
    return panel.render(asHost(this));
  }
}
