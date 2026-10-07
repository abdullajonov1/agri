// Enhanced Kadastr Status Widget - Fixed Regional Filtering + Graph View
import MediaLayer from "esri/layers/MediaLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import Extent from "esri/geometry/Extent";
import { JimuMapView } from "jimu-arcgis";
import { AllWidgetProps, DataSource, React } from "jimu-core";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import { MAX_MAP_CONNECTION_ATTEMPTS } from "../../../shared/map-connection-service";
import { graffLog } from "./graff-log";
import { renderGraffGraph, type GraffChartGeometryCache, type GraffGraphHost } from "./GraffChart";
import { fetchGraffRegionalTimeseries, fetchGraffVegetationData, type GraffDataServiceHost } from "./graff-data-service";
import { VEGETATION_IMAGE_LAYER_ID, applyGraffVegetationImageOverlay, type GraffPendingOverlayWalk, type GraffRasterOverlayHost, type GraffVegetationRasterSample } from "./graff-raster-overlay";
import { attachGraffRasterHover, detachGraffRasterHover, ensureGraffHoverTooltipEl, handleGraffRowClick, hideGraffHoverTooltip, sampleGraffRasterValue, syncGraffExternalPolygonSelection, updateGraffHoverTooltip, type GraffMapInteractionHost } from "./graff-map-interaction";
import { type PolygonExportImageResult, type VegetationIndiceType } from "../../../gis/agri-polygon-api-source";
import { normalizeApos, makeRegionDistrictKey, resolveCropIdForTuri, resolveCropIdForUniqueid, resolveDistrictNumber, storeRegionDistrictMappingRow, ensureRegionDistrictForSelection, eqAposSmart, buildTumanNameClause, formatLocalDateYmd, resolveAgainstAvailableDates } from "./components/geo-helpers";
import type { GraffWidgetHost } from "./graff-host";
import { updateGraphViewportSize, scheduleGraphViewportRefresh, observeGraphViewport, handleDocumentMouseDown, builduniqueidWhere, resolveFieldCaseInsensitive, isRegionalInteractionEnabled, handlePopupPolygonSelectionFastPath, getCarriedOverlayDate, kickOptimisticVegetationOverlay, markOverlayDateVerified, awaitPendingOverlayWalk, rememberRasterDateForUniqueid, detachMapHoverPrefetch, attachMapHoverPrefetch, prefetchVegetationForMapPoint, clearPolygonSelectionFromMapClick } from "./components/overlay-helpers";
import { handleMasterFilterChanged, getSearchField, buildGidvWhere, buildSearchWhere, findSpatialFeatureByUniqueId, getTableSpatialQueryCandidates, runAutoSearch, clearSelectionAfterSearchClear, handleExternalTableSearchChanged, handleExternalTableRowSelected } from "./components/search-handlers";
import { buildWhereClause, fetchAndStoreRegionDistrictMappings, handleConstructionYearChange, getDisplayFields, getMaydonSortFieldName, getTableOrderByFields, toggleMaydonSort, buildVhUniqueIdsClause, getStatusFieldNameForCurrentDate, buildNdviStatusClauseForCurrentVh, getFieldDisplayName, handleLandCategoryChange, handleRegionalChange, handleGeneralFilterChange, processExternalFilterUpdate, applyExternalFilterUpdate, normalizeUniqueidKey, recordMatchesUniqueid } from "./components/filter-handlers";
import { scrollSelectedRowIntoCenter, scheduleScrollSelectedRowIntoCenter, buildUniqueidWhere, resolveTablePageForUniqueid, ensureSelectedRowVisible, goToTablePage } from "./components/table-handlers";
import { retryMapConnection, onActiveViewChange, formatFieldValue, getStatusValueForRecord, initializeMapConnection, addSelectionGlow, highlightFeature, getConfiguredFilterFields, refreshFiltersFromConfig, resolveFeatureLayerFromDataSource, resolveFeatureLayersFromUseDataSources, buildViloyatKeyToLayerIndex, getFeatureLayerForViloyat, ensureInitialization } from "./components/connection-handlers";
import { componentDidMount, componentDidUpdate, componentWillUnmount, initializeTheme, handleAppLanguageChanged, handleThemeChange, onDataSourceCreated, onDataSourceInfoChange } from "./components/lifecycle-handlers";
import { fetchFilterOptions, fetchFilterOptionsOnce, getUniqueValues, fetchData, applyMapFilters, handleFilterChange, handleResetFilters, filtersChanged, handleGeoFilterChanged, handleResetAll, refetchDebounced, refetchNow, buildApiUrlWithFilters, getCategoryFieldName, getVhFieldName, getPolygonJoinFieldName } from "./components/data-handlers";
import { beginGraphFetch, applyGraphData, switchToTable, switchToGraph, renderViewModeToggle, renderGraphLegend, renderGraphHeader, wrapGraphFrame, toggleMonthPicker, resolveMonthPickerPlacement, handleMonthOptionClick, resolveCurrentRegionId, publishVegetationOverlayContext, resolveCurrentYear, broadcastDateIndexSelection, getNavigableDateIndexDates, handleDateIndexNavigate, clearVegetationImageSurfaceLoading, beginVegetationImageSurfaceLoading, cancelVegetationImageOverlay, removeVegetationImageOverlay, getIndexDisplayColor, resolveHoverIndexRange, retryOverlayWithUsableDate, preparePolygonGraphSeries, handleIndexChange, handleToggleAllIndices, localizeRuntimeMessage, INDEX_COLORS as GraffIndexColors } from "./components/graph-handlers";
import { render } from "./components/render-panel";
import { createInitialGraffState } from "./components/initial-state";
import type { AgriGraffWidgetState, ChartVegetationRow, ConfiguredFilters, GraffWidgetProps, RecordData, TimerHandle, VegetationIndex } from "./graff-state";
import type { DebouncedFunc } from "lodash";
import type { ImmutableObject, UseDataSource } from "jimu-core";
import type { TaggedLayer } from "./components/spatial-candidates";
const WIDGET_ID = "AgriGraffWidget";
export type { AgriGraffWidgetState, ChartVegetationRow, ConfiguredFilters, RecordData, VegetationIndex };
export default class AgriGraffWidget extends React.PureComponent<GraffWidgetProps, AgriGraffWidgetState> implements GraffWidgetHost, GraffGraphHost, GraffDataServiceHost, GraffRasterOverlayHost, GraffMapInteractionHost {
_barCategoryField = "";
_barCategoryValue = "";
    /** Tuman / Jadval debug — visible when __AGRO_V5_TUMAN_DEBUG !== false (default ON). */
    private static graffLog(phase: string, detail?: Record<string, unknown>): void {
        graffLog(phase, detail);
    }
_prevDefinitionExpression = "";
_mapUpdateScheduled = false;
_onReset: () => void;
initializationTimer: TimerHandle | null = null;
_retryTimeout: TimerHandle | null = null;
_isMounted: boolean = false;
_unbindMasterFilter: (() => void) | null = null;
    /** MapView and fallback startup share one filter-options request batch. */
_filterOptionsPromise: Promise<void> | null = null;
    /** MediaLayer showing the export-image raster for the selected polygon+date; removed on deselect/change. */
_vegetationImageLayer: __esri.MediaLayer | null = null;
    /** Guards against a stale export-image response landing after a newer selection. */
_vegetationImageRequestId = 0;
    /** Last successfully placed overlay cache key (skip redundant re-apply). */
_vegetationOverlayAppliedKey = "";
    /** In-flight overlay key so series+dates paths do not cancel each other. */
_vegetationOverlayPendingKey = "";
    /**
     * Last raster date that successfully painted on the map (any polygon).
     * Same satellite scene often covers the whole district — optimistic first
     * paint uses this before /available-dates returns.
     */
_lastSuccessfulOverlayDate: string | null = null;
_lastSuccessfulOverlayIndex: VegetationIndiceType = "ndvi";
    /**
     * Region (and year) `_lastSuccessfulOverlayDate` belongs to. Scene dates are
     * region-specific, so reusing one across regions makes export-image reply
     * 400 for a raster_date that has no scene for the new polygon.
     */
_lastSuccessfulOverlayRegionId: number | null = null;
_lastSuccessfulOverlayYear: number | null = null;
    /** Per-polygon latest date from /available-dates (session). */
_latestRasterDateByUniqueid = new Map<string, string>();
    /** `${uniqueid}|${date}` pairs export-image already served (HTTP 200). */
_verifiedOverlayDates = new Set<string>();
    /**
     * In-flight available-dates → export-image walk for the selected polygon.
     * Series/pack-driven overlay calls wait on it instead of firing their own
     * unverified date (the ArcGIS series has rows for days the region raster
     * is missing → guaranteed 400).
     */
_pendingOverlayWalk: GraffPendingOverlayWalk | null = null;
_unbindPopupPolygonSelection: (() => void) | null = null;
_mapHoverPrefetchHandle: __esri.Handle | null = null;
_hoverPrefetchTimer: number | null = null;
_hoverPrefetchUniqueid = "";
    /** Date captured before setState clears selectedNdviDate on polygon switch. */
_optimisticDateBeforeClear: string | null = null;
    /** Export rasters confirmed missing by the API; prevents repeated 404 requests. */
_missingVegetationRasterKeys = new Set<string>();
    /** Per-polygon count of date step-backs after an export-image 400. */
_inSeasonRetryAttempts = new Map<string, number>();
    /**
     * uniqueid that `polygonAvailableDates` belongs to. Prevents a previous
     * polygon's date list from blocking the next field's overlay (SKIP-unavailable).
     */
_polygonAvailableDatesUniqueid = "";
    /** Pixel values + georef for the active vegetation overlay (map hover tooltip). */
_vegetationRasterSample: GraffVegetationRasterSample | null = null;
_vegetationHoverHandle: __esri.Handle | null = null;
_vegetationHoverLeaveHandle: __esri.Handle | null = null;
_vegetationHoverTooltipEl: HTMLDivElement | null = null;
    /**
     * Guards against a stale fetchVegetationData() response (chart series +
     * available-dates) landing after the user has already switched to a
     * different polygon — this function has two awaited network calls and
     * nothing previously stopped an older, slower call's response from
     * overwriting a newer polygon's already-loaded chart, which then fed a
     * date click for the wrong polygon's raster_date list.
     */
_vegetationDataRequestId = 0;
    /**
     * Invalidates in-flight fetchRegionalTimeseries results. Without this, a
     * regional fetch started on filter change (or before a polygon click)
     * can finish AFTER fetchVegetationData and overwrite the polygon chart
     * with aggregate dates that are not in /available-dates — clicks then
     * hit SKIP-unavailable-date and show nothing on the field.
     */
_regionalTimeseriesRequestId = 0;
    /** Last regional query signature, used to collapse duplicate mount/filter broadcasts. */
_regionalTimeseriesRequestKey = "";
    /** Signature of the regional series currently shown in vegetationData. */
_regionalTimeseriesAppliedKey = "";
    /**
     * Index fields already loaded for `_regionalTimeseriesAppliedKey` (republic
     * incremental fetch). Cleared on scope change, polygon mode, or failed fetch.
     * Viloyat/tuman full queries mark every CORE field as loaded.
     */
_regionalTimeseriesLoadedAvgFields = new Set<string>();
    /** True after a graph fetch finishes (success/empty/error) — prevents no-data flash. */
_hasCompletedGraphFetch = false;
    /** True after a table fetch finishes (success/empty/error) — prevents no-data flash. */
_hasCompletedTableFetch = false;
    /** Invalidates in-flight table page fetches when leaving table view mid-load. */
_tableDataRequestId = 0;
    /**
     * Wall-clock time of the most recently APPLIED polygon selection, from
     * whichever source won the race — this widget's own handleMapClick, or an
     * external relay (AgriPopup, via AgriLocalization's masterFilterChanged).
     * Both sources hit-test the same map click independently and can resolve
     * out of order (AgriPopup's chain does extra attribute lookups and is
     * often slower); a later-arriving notification carrying an OLDER click
     * timestamp than what's already applied must be dropped, or it silently
     * reverts the selected polygon back to a stale one.
     */
_lastAppliedPolygonClickedAt = 0;
    /** Scroll/center this uniqueid in the jadval after the matching page loads. */
_pendingScrollUniqueid: string | null = null;
_selectionPageResolveToken = 0;
    /**
     * Drops late masterFilterChanged payloads whose meta.timestamp /
     * broadcastGeneration is older than what we already applied — prevents a
     * slow VH-bar broadcast for the previous viloyat/tuman from overwriting
     * the chart after the user already moved on.
     */
_lastMasterFilterTs = 0;
_lastMasterFilterBroadcastGeneration = 0;
    /** View extent before a table-row polygon is selected; restored on toggle-off. */
_extentBeforeTableSelection: __esri.Extent | null = null;
    /**
     * Where the current polygon selection came from.
     * Table selection can also be deactivated by clicking the same polygon on the map.
     */
_polygonSelectionOrigin: "table" | "map" | null = null;
    /** Wall time when selection was committed — ignores echo "same-id" deselects. */
_selectionCommittedAt = 0;
    /** Detached query layers prevent MapImage sublayer queries from clearing its live district filter. */
_detachedSpatialQueryLayers = new Map<string, __esri.FeatureLayer>();
    /** Cancels stale table-row geometry lookups when the user clicks another row. */
_tableRowClickGeneration = 0;
tableContainerRef: React.RefObject<HTMLDivElement>;
graphContainerRef: React.RefObject<HTMLDivElement>;
graphSvgWrapRef: React.RefObject<HTMLDivElement>;
monthPickerRef: React.RefObject<HTMLDivElement>;
graphResizeObserver: ResizeObserver | null = null;
_graphViewportRaf: number | null = null;
_chartGeometryCacheKey = "";
_chartGeometryCache: GraffChartGeometryCache | null = null;
    // Single coalesced refresh: push WHERE to DS/layer, then fetch
scheduleRefresh = debounce(async () => {
        if (!this._isMounted || this.state.connectionStatus !== "connected")
            return;
        // Show loader immediately so UI never flashes "no data" during map-filter await.
        if (!this.state.loading) {
            this.setState({ loading: true, error: null });
        }
        await this.applyMapFilters();
        await this.fetchData();
    }, 250);
_allowClearOnce = false;
    /** Viloyat name → region number (from layer attribute `region`). Used in WHERE and API as region/district. */
_viloyatToRegion: Record<string, number> = {};
    /** Region/viloyat + tuman → district number (from layer attribute `district`). */
_tumanToDistrict: Record<string, number> = {};
    /** Vote weights for majority-pick when Agri_table has conflicting district codes. */
_tumanToDistrictVotes: Record<string, number> = {};
    /**
     * Crop type name (turi) → crop_id. agri_vegetation_indices doesn't carry
     * the human-readable `turi` name, only `crop_id`, so the regional
     * vegetation timeseries needs this resolved from Agri_table_data (which
     * has both) the same way viloyat/tuman get resolved to region/district.
     */
_turiToCropId: Record<string, string> = {};
    /** Viloyat normalized key → resolved feature layer index. */
_viloyatKeyToLayerIndex: Record<string, number> = {};
    // Debounce timer for external updates
_updateDebounceTimer: TimerHandle | null = null;
_debounceTimer: TimerHandle | null = null;
_searchDebounceTimer: TimerHandle | null = null;
_activeController: AbortController | null = null;
normalizeApos(s: string): string {
        return normalizeApos(this, s);
    }
makeRegionDistrictKey(raw: string | null | undefined): string {
        return makeRegionDistrictKey(this, raw);
    }
resolveCropIdForTuri = (turi: string): string | undefined => {
        return resolveCropIdForTuri(this, turi);
    };
resolveCropIdForUniqueid = (uniqueid: string | null | undefined): number | null => {
        return resolveCropIdForUniqueid(this, uniqueid);
    };
resolveDistrictNumber(viloyat: string, tuman: string, regionHint?: number): number | undefined {
        return resolveDistrictNumber(this, viloyat, tuman, regionHint);
    }
storeRegionDistrictMappingRow = (viloyatRaw: string | null | undefined, regionRaw: unknown, tumanRaw: string | null | undefined, districtRaw: unknown, count: number = 1): void => {
        return storeRegionDistrictMappingRow(this, viloyatRaw, regionRaw, tumanRaw, districtRaw, count);
    };
ensureRegionDistrictForSelection = async (): Promise<void> => {
        return ensureRegionDistrictForSelection(this);
    };
eqAposSmart(field: string, raw: string): string {
        return eqAposSmart(this, field, raw);
    }
buildTumanNameClause(tuman: string, viloyat?: string): string {
        return buildTumanNameClause(this, tuman, viloyat);
    }
formatLocalDateYmd = (dt: Date): string => {
        return formatLocalDateYmd(this, dt);
    };
resolveAgainstAvailableDates = (rawDate: unknown, availableDates: string[]): string | null => resolveAgainstAvailableDates(this, rawDate, availableDates);
    MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
    /** Same page size as Agrobank ContoursTable. */
    RECORDS_PER_PAGE = 50;
throttledFetchData: DebouncedFunc<() => Promise<void>>;
    constructor(props: GraffWidgetProps) {
        super(props);
        let initialIsDarkTheme = true;
        try {
            const saved = typeof window !== "undefined"
                ? window.localStorage?.getItem("agri_v11_app_theme")
                : null;
            const domTheme = typeof document !== "undefined"
                ? document.documentElement.getAttribute("data-theme")
                : null;
            if (saved !== null && saved !== undefined) {
                initialIsDarkTheme = saved === "dark";
            }
            else if (domTheme === "light" || domTheme === "dark") {
                initialIsDarkTheme = domTheme === "dark";
            }
        }
        catch {
            initialIsDarkTheme = true;
        }
        this.state = createInitialGraffState(initialIsDarkTheme);
        this.tableContainerRef = React.createRef();
        this.graphContainerRef = React.createRef();
        this.graphSvgWrapRef = React.createRef();
        this.monthPickerRef = React.createRef();
        this.throttledFetchData = throttle(this.fetchData, 500, {
            leading: false,
            trailing: true,
        });
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleResetFilters = this.handleResetFilters.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.fetchFilterOptions = this.fetchFilterOptions.bind(this);
        this.onDataSourceCreated = this.onDataSourceCreated.bind(this);
        this.onDataSourceInfoChange = this.onDataSourceInfoChange.bind(this);
        this.retryMapConnection = this.retryMapConnection.bind(this);
        this.onActiveViewChange = this.onActiveViewChange.bind(this);
        this.initializeMapConnection = this.initializeMapConnection.bind(this);
        this.ensureInitialization = this.ensureInitialization.bind(this);
        this.handleThemeChange = this.handleThemeChange.bind(this);
        // Enhanced external filter handlers
        this.handleConstructionYearChange =
            this.handleConstructionYearChange.bind(this);
        this.handleLandCategoryChange = this.handleLandCategoryChange.bind(this);
        this.handleRegionalChange = this.handleRegionalChange.bind(this);
        this.handleGeneralFilterChange = this.handleGeneralFilterChange.bind(this);
        this.processExternalFilterUpdate =
            this.processExternalFilterUpdate.bind(this);
        this.applyExternalFilterUpdate = this.applyExternalFilterUpdate.bind(this);
        // Graph functions
        this.switchToGraph = this.switchToGraph.bind(this);
        this.switchToTable = this.switchToTable.bind(this);
        this.fetchVegetationData = this.fetchVegetationData.bind(this);
        this.toggleMonthPicker = this.toggleMonthPicker.bind(this);
        this.handleMonthOptionClick = this.handleMonthOptionClick.bind(this);
    }
updateGraphViewportSize = () => {
        return updateGraphViewportSize(this);
    };
scheduleGraphViewportRefresh = () => {
        return scheduleGraphViewportRefresh(this);
    };
observeGraphViewport = () => {
        return observeGraphViewport(this);
    };
handleDocumentMouseDown = (event: MouseEvent) => {
        return handleDocumentMouseDown(this, event);
    };
builduniqueidWhere = (raw: string, field: string = "uniqueid") => builduniqueidWhere(this, raw, field);
resolveFieldCaseInsensitive = (name: string): string | null => {
        return resolveFieldCaseInsensitive(this, name);
    };
isRegionalInteractionEnabled = (): boolean => isRegionalInteractionEnabled(this);
handlePopupPolygonSelectionFastPath = (event: Event): void => {
        return handlePopupPolygonSelectionFastPath(this, event);
    };
getCarriedOverlayDate(regionId: number | undefined, year: number | undefined): string | null {
        return getCarriedOverlayDate(this, regionId, year);
    }
kickOptimisticVegetationOverlay = (uniqueid: string): void => {
        return kickOptimisticVegetationOverlay(this, uniqueid);
    };
markOverlayDateVerified = (cleanId: string, date: string): void => {
        return markOverlayDateVerified(this, cleanId, date);
    };
awaitPendingOverlayWalk = async (cleanId: string, timeoutMs = 8000): Promise<string | null | undefined> => {
        return awaitPendingOverlayWalk(this, cleanId, timeoutMs);
    };
rememberRasterDateForUniqueid = (uniqueid: string, dates: string[]): void => {
        return rememberRasterDateForUniqueid(this, uniqueid, dates);
    };
detachMapHoverPrefetch = (): void => {
        return detachMapHoverPrefetch(this);
    };
attachMapHoverPrefetch = (view: __esri.MapView | __esri.SceneView): void => {
        return attachMapHoverPrefetch(this, view);
    };
prefetchVegetationForMapPoint = async (view: __esri.MapView | __esri.SceneView, event: __esri.ViewPointerMoveEvent, regionId: number, year: number): Promise<void> => {
        return prefetchVegetationForMapPoint(this, view, event, regionId, year);
    };
    /**
     * Enters/exits "single polygon" chart mode in response to a polygon
     * selection made outside this widget (currently: AgriPopup's map-click
     * inspector). Mirrors what handleRowClick already does for a polygon
     * picked from this widget's own table, minus the map highlight/zoom/
     * definitionExpression narrowing — the widget that owns the selection
     * (AgriPopup) already handles that on its own layer.
     */
syncExternalPolygonSelection = (uniqueid: string, polygonMode: boolean, regionIdHint?: number | null, clickedAt?: number): void => syncGraffExternalPolygonSelection(this, uniqueid, polygonMode, regionIdHint, clickedAt);
clearPolygonSelectionFromMapClick = (): void => {
        return clearPolygonSelectionFromMapClick(this);
    };
handleMasterFilterChanged = (event: Event) => {
        return handleMasterFilterChanged(this, event);
    };
getSearchField = (): "uniqueid" | "gidv" => {
        return getSearchField(this);
    };
buildGidvWhere = (raw: string, field: string = "gidv") => buildGidvWhere(this, raw, field);
buildSearchWhere = (raw: string): string => {
        return buildSearchWhere(this, raw);
    };
findSpatialFeatureByUniqueId = async (uniqueId: string): Promise<__esri.Graphic | null> => {
        return findSpatialFeatureByUniqueId(this, uniqueId);
    };
getTableSpatialQueryCandidates = (): TaggedLayer[] => {
        return getTableSpatialQueryCandidates(this);
    };
runAutoSearch = async (termRaw: string) => {
        return runAutoSearch(this, termRaw);
    };
clearSelectionAfterSearchClear = async () => {
        return clearSelectionAfterSearchClear(this);
    };
handleExternalTableSearchChanged = (event: Event) => {
        return handleExternalTableSearchChanged(this, event);
    };
handleExternalTableRowSelected = async (event: Event) => {
        return handleExternalTableRowSelected(this, event);
    };
buildWhereClause(): string {
        return buildWhereClause(this);
    }
fetchAndStoreRegionDistrictMappings = async (): Promise<void> => {
        return fetchAndStoreRegionDistrictMappings(this);
    };
    /* ---------------------- ENHANCED EVENT HANDLERS FOR ALL 4 WIDGETS ---------------------- */
handleConstructionYearChange = (event: CustomEvent) => {
        return handleConstructionYearChange(this, event);
    };
getDisplayFields(): string[] {
        return getDisplayFields(this);
    }
getMaydonSortFieldName(): string | null {
        return getMaydonSortFieldName(this);
    }
getTableOrderByFields = (): string[] => {
        return getTableOrderByFields(this);
    };
toggleMaydonSort = (): void => {
        return toggleMaydonSort(this);
    };
buildVhUniqueIdsClause(): string {
        return buildVhUniqueIdsClause(this);
    }
getStatusFieldNameForCurrentDate(): string | null {
        return getStatusFieldNameForCurrentDate(this);
    }
buildNdviStatusClauseForCurrentVh(): string {
        return buildNdviStatusClauseForCurrentVh(this);
    }
getFieldDisplayName(fieldName: string): string {
        return getFieldDisplayName(this, fieldName);
    }
handleLandCategoryChange = (event: CustomEvent) => {
        return handleLandCategoryChange(this, event);
    };
handleRegionalChange = (event: CustomEvent) => {
        return handleRegionalChange(this, event);
    };
handleGeneralFilterChange = (event: CustomEvent) => {
        return handleGeneralFilterChange(this, event);
    };
processExternalFilterUpdate = (sourceWidget: string, updates: ConfiguredFilters) => {
        return processExternalFilterUpdate(this, sourceWidget, updates);
    };
applyExternalFilterUpdate = async (sourceWidget: string, updates: ConfiguredFilters) => {
        return applyExternalFilterUpdate(this, sourceWidget, updates);
    };
    /* ---------------------- Table pagination (Agrobank ContoursTable) ---------------------- */
normalizeUniqueidKey = (value: string | null | undefined): string => normalizeUniqueidKey(this, value);
recordMatchesUniqueid = (record: RecordData, uniqueid: string): boolean => recordMatchesUniqueid(this, record, uniqueid);
scrollSelectedRowIntoCenter = (): void => {
        return scrollSelectedRowIntoCenter(this);
    };
scheduleScrollSelectedRowIntoCenter = (): void => {
        return scheduleScrollSelectedRowIntoCenter(this);
    };
buildUniqueidWhere = (uniqueid: string): string => buildUniqueidWhere(this, uniqueid);
async resolveTablePageForUniqueid(uniqueid: string): Promise<number | null> {
        return resolveTablePageForUniqueid(this, uniqueid);
    }
ensureSelectedRowVisible = async (uniqueid?: string | null): Promise<void> => {
        return ensureSelectedRowVisible(this, uniqueid);
    };
goToTablePage = (page: number): void => {
        return goToTablePage(this, page);
    };
    retryMapConnection() {
        return retryMapConnection(this);
    }
    onActiveViewChange = (jimuMapView: JimuMapView) => {
        return onActiveViewChange(this, jimuMapView);
    };
formatFieldValue(fieldName: string, value: unknown): string {
        return formatFieldValue(this, fieldName, value);
    }
getStatusValueForRecord(record: RecordData): string {
        return getStatusValueForRecord(this, record);
    }
initializeMapConnection = async (jimuMapView: JimuMapView) => {
        return initializeMapConnection(this, jimuMapView);
    };
addSelectionGlow = (view: __esri.MapView | __esri.SceneView, feature: __esri.Graphic) => {
        return addSelectionGlow(this, view, feature);
    };
highlightFeature = async (feature: __esri.Graphic, activeMapView: JimuMapView) => {
        return highlightFeature(this, feature, activeMapView);
    };
getConfiguredFilterFields(): string[] {
        return getConfiguredFilterFields(this);
    }
refreshFiltersFromConfig() {
        return refreshFiltersFromConfig(this);
    }
resolveFeatureLayerFromDataSource = async (jimuMapView: JimuMapView, useDsOverride?: UseDataSource | ImmutableObject<UseDataSource>): Promise<__esri.FeatureLayer | null> => {
        return resolveFeatureLayerFromDataSource(this, jimuMapView, useDsOverride);
    };
resolveFeatureLayersFromUseDataSources = async (jimuMapView: JimuMapView): Promise<__esri.FeatureLayer[]> => {
        return resolveFeatureLayersFromUseDataSources(this, jimuMapView);
    };
buildViloyatKeyToLayerIndex = async (): Promise<void> => {
        return buildViloyatKeyToLayerIndex(this);
    };
getFeatureLayerForViloyat = (viloyat: string): __esri.FeatureLayer | undefined => {
        return getFeatureLayerForViloyat(this, viloyat);
    };
    ensureInitialization = () => {
        return ensureInitialization(this);
    };
    componentDidMount() {
        return componentDidMount(this);
    }
    componentDidUpdate(prevProps: GraffWidgetProps, prevState: AgriGraffWidgetState) {
        return componentDidUpdate(this, prevProps, prevState);
    }
    componentWillUnmount() {
        return componentWillUnmount(this);
    }
initializeTheme = (): void => {
        return initializeTheme(this);
    };
handleAppLanguageChanged = (event: Event): void => {
        return handleAppLanguageChanged(this, event);
    };
    handleThemeChange = (event: CustomEvent<{
        isDarkTheme?: boolean;
    }> | Event): void => {
        return handleThemeChange(this, event);
    };
    onDataSourceCreated = (ds: DataSource) => {
        return onDataSourceCreated(this, ds);
    };
    onDataSourceInfoChange = (info: unknown) => {
        return onDataSourceInfoChange(this, info);
    };
    fetchFilterOptions = (): Promise<void> => {
        return fetchFilterOptions(this);
    };
fetchFilterOptionsOnce = async (): Promise<void> => {
        return fetchFilterOptionsOnce(this);
    };
    getUniqueValues = async (fieldName: string): Promise<string[]> => {
        return getUniqueValues(this, fieldName);
    };
    fetchData = async (opts?: {
        preservePage?: boolean;
    }) => {
        return fetchData(this, opts);
    };
async applyMapFilters(): Promise<void> {
        return applyMapFilters(this);
    }
    handleFilterChange = async (field: string, value: string) => {
        return handleFilterChange(this, field, value);
    };
    handleResetFilters = async () => {
        return handleResetFilters(this);
    };
handleRowClick = (record: RecordData) => handleGraffRowClick(this, record);
filtersChanged(a: typeof this.state.regionalFilters, b: typeof this.state.regionalFilters) {
        return filtersChanged(this, a, b);
    }
handleGeoFilterChanged = (event: CustomEvent) => {
        return handleGeoFilterChanged(this, event);
    };
handleResetAll = () => {
        return handleResetAll(this);
    };
refetchDebounced = () => {
        return refetchDebounced(this);
    };
refetchNow = () => {
        return refetchNow(this);
    };
buildApiUrlWithFilters(baseUrl: string): string {
        return buildApiUrlWithFilters(this, baseUrl);
    }
getCategoryFieldName(): string | null {
        return getCategoryFieldName(this);
    }
getVhFieldName(): string | null {
        return getVhFieldName(this);
    }
getPolygonJoinFieldName(): string {
        return getPolygonJoinFieldName(this);
    }
    /* ==================== GRAPH VIEW FUNCTIONS ==================== */
beginGraphFetch = (): void => {
        return beginGraphFetch(this);
    };
applyGraphData = (nextData: ChartVegetationRow[], extra?: Partial<AgriGraffWidgetState>, options?: {
        animate?: boolean;
    }): void => {
        return applyGraphData(this, nextData, extra, options);
    };
    /** Fetch regional timeseries when no polygon is selected (uses viloyat, optional tuman, optional yil for date range). */
fetchRegionalTimeseries = () => fetchGraffRegionalTimeseries(this);
switchToTable = () => {
        return switchToTable(this);
    };
switchToGraph = () => {
        return switchToGraph(this);
    };
renderViewModeToggle = (activeMode: "table" | "graph") => {
        return renderViewModeToggle(this, activeMode);
    };
renderGraphLegend = () => {
        return renderGraphLegend(this);
    };
renderGraphHeader = () => {
        return renderGraphHeader(this);
    };
wrapGraphFrame = (body: React.ReactNode, options?: {
        refreshLoading?: boolean;
    }) => wrapGraphFrame(this, body, options);
toggleMonthPicker = () => {
        return toggleMonthPicker(this);
    };
resolveMonthPickerPlacement = (): "up" | "down" => {
        return resolveMonthPickerPlacement(this);
    };
handleMonthOptionClick = (month: number | null) => {
        return handleMonthOptionClick(this, month);
    };
resolveCurrentRegionId(): number | undefined {
        return resolveCurrentRegionId(this);
    }
publishVegetationOverlayContext = (): void => {
        return publishVegetationOverlayContext(this);
    };
resolveCurrentYear(): number | undefined {
        return resolveCurrentYear(this);
    }
broadcastDateIndexSelection = (): void => {
        return broadcastDateIndexSelection(this);
    };
getNavigableDateIndexDates = (): string[] => {
        return getNavigableDateIndexDates(this);
    };
handleDateIndexNavigate = (event: Event): void => {
        return handleDateIndexNavigate(this, event);
    };
    /** Removes the current vegetation-index image overlay from the map, if any. */
    /** Fixed id stamped on every vegetation-image MediaLayer we add — lets
     * removeVegetationImageOverlay() find and remove ANY such layer still on
     * the map by id, not just whichever one this component instance happens
     * to still hold a reference to. Relying solely on _vegetationImageLayer
     * silently leaks an orphaned layer forever if this widget instance is
     * ever recreated (e.g. Experience Builder remounting it) between adding
     * one overlay and the next selection trying to remove it — the new
     * instance's _vegetationImageLayer starts back at null and has nothing
     * to remove, even though the old layer is still sitting on the map. */
    private static readonly VEGETATION_IMAGE_LAYER_ID = VEGETATION_IMAGE_LAYER_ID;
clearVegetationImageSurfaceLoading = (requestId: number): void => {
        return clearVegetationImageSurfaceLoading(this, requestId);
    };
beginVegetationImageSurfaceLoading = (): void => {
        return beginVegetationImageSurfaceLoading(this);
    };
cancelVegetationImageOverlay = (): void => {
        return cancelVegetationImageOverlay(this);
    };
removeVegetationImageOverlay = (): void => {
        return removeVegetationImageOverlay(this);
    };
ensureVegetationHoverTooltipEl = (): HTMLDivElement | null => ensureGraffHoverTooltipEl(this);
    private static readonly INDEX_COLORS: Record<string, string> = GraffIndexColors;
getIndexDisplayColor = (indexKey?: string | null): string => {
        return getIndexDisplayColor(this, indexKey);
    };
updateVegetationHoverTooltip = (value: number, clientX: number, clientY: number): void => updateGraffHoverTooltip(this, value, clientX, clientY);
hideVegetationHoverTooltip = (): void => hideGraffHoverTooltip(this);
detachVegetationRasterHover = (): void => detachGraffRasterHover(this);
sampleVegetationRasterValue = (mapPoint: __esri.Point): number | null => sampleGraffRasterValue(this, mapPoint);
resolveHoverIndexRange = (indiceType: string, rasterDate: string, fromExport?: {
        indexMin: number | null;
        indexMax: number | null;
    } | null): {
        indexMin: number | null;
        indexMax: number | null;
    } => {
        return resolveHoverIndexRange(this, indiceType, rasterDate, fromExport);
    };
attachVegetationRasterHover = (view: __esri.MapView | __esri.SceneView): void => attachGraffRasterHover(this, view);
retryOverlayWithUsableDate = async (cleanId: string, regionId: number, refusedDate: string, indiceType: VegetationIndiceType): Promise<void> => {
        return retryOverlayWithUsableDate(this, cleanId, regionId, refusedDate, indiceType);
    };
    /**
     * Fetches + decodes the export-image raster (api-agri, response_format=tiff)
     * for the selected polygon+date and overlays it on the map. A GeoTIFF
     * carries its own extent + CRS in its tags (read in
     * fetchPolygonExportImageTiff via geotiff.js), so the overlay is
     * positioned directly from that — no separate polygon-geometry lookup
     * needed for placement.
     *
     * Pass `prefetched` when the date-walk already decoded the TIFF so we
     * skip a second network/decode round-trip before MediaLayer paint.
     */
applyVegetationImageOverlay = (uniqueid: string, rasterDate: string, indiceType: VegetationIndiceType = "ndvi", prefetched?: PolygonExportImageResult | null): Promise<void> => applyGraffVegetationImageOverlay(this, uniqueid, rasterDate, indiceType, prefetched);
preparePolygonGraphSeries = (rows: VegetationIndex[], availableDates: string[]): {
        sorted: VegetationIndex[];
        nextDate: string | null;
        nextIndexKey: VegetationIndiceType | null;
        fingerprint: string;
    } => {
        return preparePolygonGraphSeries(this, rows, availableDates);
    };
fetchVegetationData = () => fetchGraffVegetationData(this);
handleIndexChange = (index: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi") => {
        return handleIndexChange(this, index);
    };
handleToggleAllIndices = () => {
        return handleToggleAllIndices(this);
    };
localizeRuntimeMessage = (value: unknown): string => {
        return localizeRuntimeMessage(this, value);
    };
renderGraph = () => renderGraffGraph(this);
    render() {
        return render(this);
    }
}
