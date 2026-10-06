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
const WIDGET_ID = "AgriGraffWidget";
export type { AgriGraffWidgetState, ChartVegetationRow, ConfiguredFilters, RecordData, VegetationIndex };
export default class AgriGraffWidget extends React.PureComponent<GraffWidgetProps, AgriGraffWidgetState> {
    private _barCategoryField = "";
    private _barCategoryValue = "";
    /** Tuman / Jadval debug — visible when __AGRO_V5_TUMAN_DEBUG !== false (default ON). */
    private static graffLog(phase: string, detail?: Record<string, unknown>): void {
        graffLog(phase, detail);
    }
    private _prevDefinitionExpression = "";
    private _mapUpdateScheduled = false;
    private _onReset: () => void;
    private initializationTimer: TimerHandle | null = null;
    private _retryTimeout: TimerHandle | null = null;
    private _isMounted: boolean = false;
    private _unbindMasterFilter: (() => void) | null = null;
    /** MapView and fallback startup share one filter-options request batch. */
    private _filterOptionsPromise: Promise<void> | null = null;
    /** MediaLayer showing the export-image raster for the selected polygon+date; removed on deselect/change. */
    private _vegetationImageLayer: __esri.MediaLayer | null = null;
    /** Guards against a stale export-image response landing after a newer selection. */
    private _vegetationImageRequestId = 0;
    /** Last successfully placed overlay cache key (skip redundant re-apply). */
    private _vegetationOverlayAppliedKey = "";
    /** In-flight overlay key so series+dates paths do not cancel each other. */
    private _vegetationOverlayPendingKey = "";
    /**
     * Last raster date that successfully painted on the map (any polygon).
     * Same satellite scene often covers the whole district — optimistic first
     * paint uses this before /available-dates returns.
     */
    private _lastSuccessfulOverlayDate: string | null = null;
    private _lastSuccessfulOverlayIndex: VegetationIndiceType = "ndvi";
    /**
     * Region (and year) `_lastSuccessfulOverlayDate` belongs to. Scene dates are
     * region-specific, so reusing one across regions makes export-image reply
     * 400 for a raster_date that has no scene for the new polygon.
     */
    private _lastSuccessfulOverlayRegionId: number | null = null;
    private _lastSuccessfulOverlayYear: number | null = null;
    /** Per-polygon latest date from /available-dates (session). */
    private _latestRasterDateByUniqueid = new Map<string, string>();
    /** `${uniqueid}|${date}` pairs export-image already served (HTTP 200). */
    private _verifiedOverlayDates = new Set<string>();
    /**
     * In-flight available-dates → export-image walk for the selected polygon.
     * Series/pack-driven overlay calls wait on it instead of firing their own
     * unverified date (the ArcGIS series has rows for days the region raster
     * is missing → guaranteed 400).
     */
    private _pendingOverlayWalk: GraffPendingOverlayWalk | null = null;
    private _unbindPopupPolygonSelection: (() => void) | null = null;
    private _mapHoverPrefetchHandle: __esri.Handle | null = null;
    private _hoverPrefetchTimer: number | null = null;
    private _hoverPrefetchUniqueid = "";
    /** Date captured before setState clears selectedNdviDate on polygon switch. */
    private _optimisticDateBeforeClear: string | null = null;
    /** Export rasters confirmed missing by the API; prevents repeated 404 requests. */
    private _missingVegetationRasterKeys = new Set<string>();
    /** Per-polygon count of date step-backs after an export-image 400. */
    private _inSeasonRetryAttempts = new Map<string, number>();
    /**
     * uniqueid that `polygonAvailableDates` belongs to. Prevents a previous
     * polygon's date list from blocking the next field's overlay (SKIP-unavailable).
     */
    private _polygonAvailableDatesUniqueid = "";
    /** Pixel values + georef for the active vegetation overlay (map hover tooltip). */
    private _vegetationRasterSample: GraffVegetationRasterSample | null = null;
    private _vegetationHoverHandle: __esri.Handle | null = null;
    private _vegetationHoverLeaveHandle: __esri.Handle | null = null;
    private _vegetationHoverTooltipEl: HTMLDivElement | null = null;
    /**
     * Guards against a stale fetchVegetationData() response (chart series +
     * available-dates) landing after the user has already switched to a
     * different polygon — this function has two awaited network calls and
     * nothing previously stopped an older, slower call's response from
     * overwriting a newer polygon's already-loaded chart, which then fed a
     * date click for the wrong polygon's raster_date list.
     */
    private _vegetationDataRequestId = 0;
    /**
     * Invalidates in-flight fetchRegionalTimeseries results. Without this, a
     * regional fetch started on filter change (or before a polygon click)
     * can finish AFTER fetchVegetationData and overwrite the polygon chart
     * with aggregate dates that are not in /available-dates — clicks then
     * hit SKIP-unavailable-date and show nothing on the field.
     */
    private _regionalTimeseriesRequestId = 0;
    /** Last regional query signature, used to collapse duplicate mount/filter broadcasts. */
    private _regionalTimeseriesRequestKey = "";
    /** Signature of the regional series currently shown in vegetationData. */
    private _regionalTimeseriesAppliedKey = "";
    /**
     * Index fields already loaded for `_regionalTimeseriesAppliedKey` (republic
     * incremental fetch). Cleared on scope change, polygon mode, or failed fetch.
     * Viloyat/tuman full queries mark every CORE field as loaded.
     */
    private _regionalTimeseriesLoadedAvgFields = new Set<string>();
    /** True after a graph fetch finishes (success/empty/error) — prevents no-data flash. */
    private _hasCompletedGraphFetch = false;
    /** True after a table fetch finishes (success/empty/error) — prevents no-data flash. */
    private _hasCompletedTableFetch = false;
    /** Invalidates in-flight table page fetches when leaving table view mid-load. */
    private _tableDataRequestId = 0;
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
    private _lastAppliedPolygonClickedAt = 0;
    /** Scroll/center this uniqueid in the jadval after the matching page loads. */
    private _pendingScrollUniqueid: string | null = null;
    private _selectionPageResolveToken = 0;
    /**
     * Drops late masterFilterChanged payloads whose meta.timestamp /
     * broadcastGeneration is older than what we already applied — prevents a
     * slow VH-bar broadcast for the previous viloyat/tuman from overwriting
     * the chart after the user already moved on.
     */
    private _lastMasterFilterTs = 0;
    private _lastMasterFilterBroadcastGeneration = 0;
    /** View extent before a table-row polygon is selected; restored on toggle-off. */
    private _extentBeforeTableSelection: __esri.Extent | null = null;
    /**
     * Where the current polygon selection came from.
     * Table selection can also be deactivated by clicking the same polygon on the map.
     */
    private _polygonSelectionOrigin: "table" | "map" | null = null;
    /** Wall time when selection was committed — ignores echo "same-id" deselects. */
    private _selectionCommittedAt = 0;
    /** Detached query layers prevent MapImage sublayer queries from clearing its live district filter. */
    private _detachedSpatialQueryLayers = new Map<string, __esri.FeatureLayer>();
    /** Cancels stale table-row geometry lookups when the user clicks another row. */
    private _tableRowClickGeneration = 0;
    private tableContainerRef: React.RefObject<HTMLDivElement>;
    private graphContainerRef: React.RefObject<HTMLDivElement>;
    private graphSvgWrapRef: React.RefObject<HTMLDivElement>;
    private monthPickerRef: React.RefObject<HTMLDivElement>;
    private graphResizeObserver: ResizeObserver | null = null;
    private _graphViewportRaf: number | null = null;
    private _chartGeometryCacheKey = "";
    private _chartGeometryCache: GraffChartGeometryCache | null = null;
    // Single coalesced refresh: push WHERE to DS/layer, then fetch
    private scheduleRefresh = debounce(async () => {
        if (!this._isMounted || this.state.connectionStatus !== "connected")
            return;
        // Show loader immediately so UI never flashes "no data" during map-filter await.
        if (!this.state.loading) {
            this.setState({ loading: true, error: null });
        }
        await this.applyMapFilters();
        await this.fetchData();
    }, 250);
    private _allowClearOnce = false;
    /** Viloyat name → region number (from layer attribute `region`). Used in WHERE and API as region/district. */
    private _viloyatToRegion: Record<string, number> = {};
    /** Region/viloyat + tuman → district number (from layer attribute `district`). */
    private _tumanToDistrict: Record<string, number> = {};
    /** Vote weights for majority-pick when Agri_table has conflicting district codes. */
    private _tumanToDistrictVotes: Record<string, number> = {};
    /**
     * Crop type name (turi) → crop_id. agri_vegetation_indices doesn't carry
     * the human-readable `turi` name, only `crop_id`, so the regional
     * vegetation timeseries needs this resolved from Agri_table_data (which
     * has both) the same way viloyat/tuman get resolved to region/district.
     */
    private _turiToCropId: Record<string, string> = {};
    /** Viloyat normalized key → resolved feature layer index. */
    private _viloyatKeyToLayerIndex: Record<string, number> = {};
    // Debounce timer for external updates
    private _updateDebounceTimer: TimerHandle | null = null;
    private _debounceTimer: TimerHandle | null = null;
    private _searchDebounceTimer: TimerHandle | null = null;
    private _activeController: AbortController | null = null;
    private normalizeApos(s: string): string {
        return normalizeApos(this as unknown as GraffWidgetHost, s);
    }
    private makeRegionDistrictKey(raw: string | null | undefined): string {
        return makeRegionDistrictKey(this as unknown as GraffWidgetHost, raw);
    }
    private resolveCropIdForTuri = (turi: string): string | undefined => {
        return resolveCropIdForTuri(this as unknown as GraffWidgetHost, turi);
    };
    private resolveCropIdForUniqueid = (uniqueid: string | null | undefined): number | null => {
        return resolveCropIdForUniqueid(this as unknown as GraffWidgetHost, uniqueid);
    };
    private resolveDistrictNumber(viloyat: string, tuman: string, regionHint?: number): number | undefined {
        return resolveDistrictNumber(this as unknown as GraffWidgetHost, viloyat, tuman, regionHint);
    }
    private storeRegionDistrictMappingRow = (viloyatRaw: string | null | undefined, regionRaw: unknown, tumanRaw: string | null | undefined, districtRaw: unknown, count: number = 1): void => {
        return storeRegionDistrictMappingRow(this as unknown as GraffWidgetHost, viloyatRaw, regionRaw, tumanRaw, districtRaw, count);
    };
    private ensureRegionDistrictForSelection = async (): Promise<void> => {
        return ensureRegionDistrictForSelection(this as unknown as GraffWidgetHost);
    };
    private eqAposSmart(field: string, raw: string): string {
        return eqAposSmart(this as unknown as GraffWidgetHost, field, raw);
    }
    private buildTumanNameClause(tuman: string, viloyat?: string): string {
        return buildTumanNameClause(this as unknown as GraffWidgetHost, tuman, viloyat);
    }
    private formatLocalDateYmd = (dt: Date): string => {
        return formatLocalDateYmd(this as unknown as GraffWidgetHost, dt);
    };
    private resolveAgainstAvailableDates = (rawDate: unknown, availableDates: string[]): string | null => resolveAgainstAvailableDates(this as unknown as GraffWidgetHost, rawDate, availableDates);
    MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
    /** Same page size as Agrobank ContoursTable. */
    RECORDS_PER_PAGE = 50;
    private throttledFetchData: DebouncedFunc<() => Promise<void>>;
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
    private updateGraphViewportSize = () => {
        return updateGraphViewportSize(this as unknown as GraffWidgetHost);
    };
    private scheduleGraphViewportRefresh = () => {
        return scheduleGraphViewportRefresh(this as unknown as GraffWidgetHost);
    };
    private observeGraphViewport = () => {
        return observeGraphViewport(this as unknown as GraffWidgetHost);
    };
    private handleDocumentMouseDown = (event: MouseEvent) => {
        return handleDocumentMouseDown(this as unknown as GraffWidgetHost, event);
    };
    private builduniqueidWhere = (raw: string, field: string = "uniqueid") => builduniqueidWhere(this as unknown as GraffWidgetHost, raw, field);
    private resolveFieldCaseInsensitive = (name: string): string | null => {
        return resolveFieldCaseInsensitive(this as unknown as GraffWidgetHost, name);
    };
    private isRegionalInteractionEnabled = (): boolean => isRegionalInteractionEnabled(this as unknown as GraffWidgetHost);
    private handlePopupPolygonSelectionFastPath = (event: Event): void => {
        return handlePopupPolygonSelectionFastPath(this as unknown as GraffWidgetHost, event);
    };
    private getCarriedOverlayDate(regionId: number | undefined, year: number | undefined): string | null {
        return getCarriedOverlayDate(this as unknown as GraffWidgetHost, regionId, year);
    }
    private kickOptimisticVegetationOverlay = (uniqueid: string): void => {
        return kickOptimisticVegetationOverlay(this as unknown as GraffWidgetHost, uniqueid);
    };
    private markOverlayDateVerified = (cleanId: string, date: string): void => {
        return markOverlayDateVerified(this as unknown as GraffWidgetHost, cleanId, date);
    };
    private awaitPendingOverlayWalk = async (cleanId: string, timeoutMs = 8000): Promise<string | null | undefined> => {
        return awaitPendingOverlayWalk(this as unknown as GraffWidgetHost, cleanId, timeoutMs);
    };
    private rememberRasterDateForUniqueid = (uniqueid: string, dates: string[]): void => {
        return rememberRasterDateForUniqueid(this as unknown as GraffWidgetHost, uniqueid, dates);
    };
    private detachMapHoverPrefetch = (): void => {
        return detachMapHoverPrefetch(this as unknown as GraffWidgetHost);
    };
    private attachMapHoverPrefetch = (view: __esri.MapView | __esri.SceneView): void => {
        return attachMapHoverPrefetch(this as unknown as GraffWidgetHost, view);
    };
    private prefetchVegetationForMapPoint = async (view: __esri.MapView | __esri.SceneView, event: __esri.ViewPointerMoveEvent, regionId: number, year: number): Promise<void> => {
        return prefetchVegetationForMapPoint(this as unknown as GraffWidgetHost, view, event, regionId, year);
    };
    /**
     * Enters/exits "single polygon" chart mode in response to a polygon
     * selection made outside this widget (currently: AgriPopup's map-click
     * inspector). Mirrors what handleRowClick already does for a polygon
     * picked from this widget's own table, minus the map highlight/zoom/
     * definitionExpression narrowing — the widget that owns the selection
     * (AgriPopup) already handles that on its own layer.
     */
    private syncExternalPolygonSelection = (uniqueid: string, polygonMode: boolean, regionIdHint?: number | null, clickedAt?: number): void => syncGraffExternalPolygonSelection(this as unknown as GraffMapInteractionHost, uniqueid, polygonMode, regionIdHint, clickedAt);
    private clearPolygonSelectionFromMapClick = (): void => {
        return clearPolygonSelectionFromMapClick(this as unknown as GraffWidgetHost);
    };
    private handleMasterFilterChanged = (event: Event) => {
        return handleMasterFilterChanged(this as unknown as GraffWidgetHost, event);
    };
    private getSearchField = (): "uniqueid" | "gidv" => {
        return getSearchField(this as unknown as GraffWidgetHost);
    };
    private buildGidvWhere = (raw: string, field: string = "gidv") => buildGidvWhere(this as unknown as GraffWidgetHost, raw, field);
    private buildSearchWhere = (raw: string): string => {
        return buildSearchWhere(this as unknown as GraffWidgetHost, raw);
    };
    private findSpatialFeatureByUniqueId = async (uniqueId: string): Promise<__esri.Graphic | null> => {
        return findSpatialFeatureByUniqueId(this as unknown as GraffWidgetHost, uniqueId);
    };
    private getTableSpatialQueryCandidates = (): __esri.FeatureLayer[] => {
        return getTableSpatialQueryCandidates(this as unknown as GraffWidgetHost);
    };
    private runAutoSearch = async (termRaw: string) => {
        return runAutoSearch(this as unknown as GraffWidgetHost, termRaw);
    };
    private clearSelectionAfterSearchClear = async () => {
        return clearSelectionAfterSearchClear(this as unknown as GraffWidgetHost);
    };
    private handleExternalTableSearchChanged = (event: Event) => {
        return handleExternalTableSearchChanged(this as unknown as GraffWidgetHost, event);
    };
    private handleExternalTableRowSelected = async (event: Event) => {
        return handleExternalTableRowSelected(this as unknown as GraffWidgetHost, event);
    };
    private buildWhereClause(): string {
        return buildWhereClause(this as unknown as GraffWidgetHost);
    }
    private fetchAndStoreRegionDistrictMappings = async (): Promise<void> => {
        return fetchAndStoreRegionDistrictMappings(this as unknown as GraffWidgetHost);
    };
    /* ---------------------- ENHANCED EVENT HANDLERS FOR ALL 4 WIDGETS ---------------------- */
    private handleConstructionYearChange = (event: CustomEvent) => {
        return handleConstructionYearChange(this as unknown as GraffWidgetHost, event);
    };
    private getDisplayFields(): string[] {
        return getDisplayFields(this as unknown as GraffWidgetHost);
    }
    private getMaydonSortFieldName(): string | null {
        return getMaydonSortFieldName(this as unknown as GraffWidgetHost);
    }
    private getTableOrderByFields = (): string[] => {
        return getTableOrderByFields(this as unknown as GraffWidgetHost);
    };
    private toggleMaydonSort = (): void => {
        return toggleMaydonSort(this as unknown as GraffWidgetHost);
    };
    private buildVhUniqueIdsClause(): string {
        return buildVhUniqueIdsClause(this as unknown as GraffWidgetHost);
    }
    private getStatusFieldNameForCurrentDate(): string | null {
        return getStatusFieldNameForCurrentDate(this as unknown as GraffWidgetHost);
    }
    private buildNdviStatusClauseForCurrentVh(): string {
        return buildNdviStatusClauseForCurrentVh(this as unknown as GraffWidgetHost);
    }
    private getFieldDisplayName(fieldName: string): string {
        return getFieldDisplayName(this as unknown as GraffWidgetHost, fieldName);
    }
    private handleLandCategoryChange = (event: CustomEvent) => {
        return handleLandCategoryChange(this as unknown as GraffWidgetHost, event);
    };
    private handleRegionalChange = (event: CustomEvent) => {
        return handleRegionalChange(this as unknown as GraffWidgetHost, event);
    };
    private handleGeneralFilterChange = (event: CustomEvent) => {
        return handleGeneralFilterChange(this as unknown as GraffWidgetHost, event);
    };
    private processExternalFilterUpdate = (sourceWidget: string, updates: ConfiguredFilters) => {
        return processExternalFilterUpdate(this as unknown as GraffWidgetHost, sourceWidget, updates);
    };
    private applyExternalFilterUpdate = async (sourceWidget: string, updates: ConfiguredFilters) => {
        return applyExternalFilterUpdate(this as unknown as GraffWidgetHost, sourceWidget, updates);
    };
    /* ---------------------- Table pagination (Agrobank ContoursTable) ---------------------- */
    private normalizeUniqueidKey = (value: string | null | undefined): string => normalizeUniqueidKey(this as unknown as GraffWidgetHost, value);
    private recordMatchesUniqueid = (record: RecordData, uniqueid: string): boolean => recordMatchesUniqueid(this as unknown as GraffWidgetHost, record, uniqueid);
    private scrollSelectedRowIntoCenter = (): void => {
        return scrollSelectedRowIntoCenter(this as unknown as GraffWidgetHost);
    };
    private scheduleScrollSelectedRowIntoCenter = (): void => {
        return scheduleScrollSelectedRowIntoCenter(this as unknown as GraffWidgetHost);
    };
    private buildUniqueidWhere = (uniqueid: string): string => buildUniqueidWhere(this as unknown as GraffWidgetHost, uniqueid);
    private async resolveTablePageForUniqueid(uniqueid: string): Promise<number | null> {
        return resolveTablePageForUniqueid(this as unknown as GraffWidgetHost, uniqueid);
    }
    private ensureSelectedRowVisible = async (uniqueid?: string | null): Promise<void> => {
        return ensureSelectedRowVisible(this as unknown as GraffWidgetHost, uniqueid);
    };
    private goToTablePage = (page: number): void => {
        return goToTablePage(this as unknown as GraffWidgetHost, page);
    };
    retryMapConnection() {
        return retryMapConnection(this as unknown as GraffWidgetHost);
    }
    onActiveViewChange = (jimuMapView: JimuMapView) => {
        return onActiveViewChange(this as unknown as GraffWidgetHost, jimuMapView);
    };
    private formatFieldValue(fieldName: string, value: unknown): string {
        return formatFieldValue(this as unknown as GraffWidgetHost, fieldName, value);
    }
    private getStatusValueForRecord(record: RecordData): string {
        return getStatusValueForRecord(this as unknown as GraffWidgetHost, record);
    }
    private initializeMapConnection = async (jimuMapView: JimuMapView) => {
        return initializeMapConnection(this as unknown as GraffWidgetHost, jimuMapView);
    };
    private addSelectionGlow = (view: __esri.MapView | __esri.SceneView, feature: __esri.Graphic) => {
        return addSelectionGlow(this as unknown as GraffWidgetHost, view, feature);
    };
    private highlightFeature = async (feature: __esri.Graphic, activeMapView: JimuMapView) => {
        return highlightFeature(this as unknown as GraffWidgetHost, feature, activeMapView);
    };
    private getConfiguredFilterFields(): string[] {
        return getConfiguredFilterFields(this as unknown as GraffWidgetHost);
    }
    private refreshFiltersFromConfig() {
        return refreshFiltersFromConfig(this as unknown as GraffWidgetHost);
    }
    private resolveFeatureLayerFromDataSource = async (jimuMapView: JimuMapView, useDsOverride?: UseDataSource | ImmutableObject<UseDataSource>): Promise<__esri.FeatureLayer | null> => {
        return resolveFeatureLayerFromDataSource(this as unknown as GraffWidgetHost, jimuMapView, useDsOverride);
    };
    private resolveFeatureLayersFromUseDataSources = async (jimuMapView: JimuMapView): Promise<__esri.FeatureLayer[]> => {
        return resolveFeatureLayersFromUseDataSources(this as unknown as GraffWidgetHost, jimuMapView);
    };
    private buildViloyatKeyToLayerIndex = async (): Promise<void> => {
        return buildViloyatKeyToLayerIndex(this as unknown as GraffWidgetHost);
    };
    private getFeatureLayerForViloyat = (viloyat: string): __esri.FeatureLayer | undefined => {
        return getFeatureLayerForViloyat(this as unknown as GraffWidgetHost, viloyat);
    };
    ensureInitialization = () => {
        return ensureInitialization(this as unknown as GraffWidgetHost);
    };
    componentDidMount() {
        return componentDidMount(this as unknown as GraffWidgetHost);
    }
    componentDidUpdate(prevProps: GraffWidgetProps, prevState: AgriGraffWidgetState) {
        return componentDidUpdate(this as unknown as GraffWidgetHost, prevProps, prevState);
    }
    componentWillUnmount() {
        return componentWillUnmount(this as unknown as GraffWidgetHost);
    }
    private initializeTheme = (): void => {
        return initializeTheme(this as unknown as GraffWidgetHost);
    };
    private handleAppLanguageChanged = (event: Event): void => {
        return handleAppLanguageChanged(this as unknown as GraffWidgetHost, event);
    };
    handleThemeChange = (event: CustomEvent<{
        isDarkTheme?: boolean;
    }> | Event): void => {
        return handleThemeChange(this as unknown as GraffWidgetHost, event);
    };
    onDataSourceCreated = (ds: DataSource) => {
        return onDataSourceCreated(this as unknown as GraffWidgetHost, ds);
    };
    onDataSourceInfoChange = (info: unknown) => {
        return onDataSourceInfoChange(this as unknown as GraffWidgetHost, info);
    };
    fetchFilterOptions = (): Promise<void> => {
        return fetchFilterOptions(this as unknown as GraffWidgetHost);
    };
    private fetchFilterOptionsOnce = async (): Promise<void> => {
        return fetchFilterOptionsOnce(this as unknown as GraffWidgetHost);
    };
    getUniqueValues = async (fieldName: string): Promise<string[]> => {
        return getUniqueValues(this as unknown as GraffWidgetHost, fieldName);
    };
    fetchData = async (opts?: {
        preservePage?: boolean;
    }) => {
        return fetchData(this as unknown as GraffWidgetHost, opts);
    };
    private async applyMapFilters(): Promise<void> {
        return applyMapFilters(this as unknown as GraffWidgetHost);
    }
    handleFilterChange = async (field: string, value: string) => {
        return handleFilterChange(this as unknown as GraffWidgetHost, field, value);
    };
    handleResetFilters = async () => {
        return handleResetFilters(this as unknown as GraffWidgetHost);
    };
    private handleRowClick = (record: RecordData) => handleGraffRowClick(this as unknown as GraffMapInteractionHost, record);
    private filtersChanged(a: typeof this.state.regionalFilters, b: typeof this.state.regionalFilters) {
        return filtersChanged(this as unknown as GraffWidgetHost, a, b);
    }
    private handleGeoFilterChanged = (event: CustomEvent) => {
        return handleGeoFilterChanged(this as unknown as GraffWidgetHost, event);
    };
    private handleResetAll = () => {
        return handleResetAll(this as unknown as GraffWidgetHost);
    };
    private refetchDebounced = () => {
        return refetchDebounced(this as unknown as GraffWidgetHost);
    };
    private refetchNow = () => {
        return refetchNow(this as unknown as GraffWidgetHost);
    };
    private buildApiUrlWithFilters(baseUrl: string): string {
        return buildApiUrlWithFilters(this as unknown as GraffWidgetHost, baseUrl);
    }
    private getCategoryFieldName(): string | null {
        return getCategoryFieldName(this as unknown as GraffWidgetHost);
    }
    private getVhFieldName(): string | null {
        return getVhFieldName(this as unknown as GraffWidgetHost);
    }
    private getPolygonJoinFieldName(): string {
        return getPolygonJoinFieldName(this as unknown as GraffWidgetHost);
    }
    /* ==================== GRAPH VIEW FUNCTIONS ==================== */
    private beginGraphFetch = (): void => {
        return beginGraphFetch(this as unknown as GraffWidgetHost);
    };
    private applyGraphData = (nextData: ChartVegetationRow[], extra?: Partial<AgriGraffWidgetState>, options?: {
        animate?: boolean;
    }): void => {
        return applyGraphData(this as unknown as GraffWidgetHost, nextData, extra, options);
    };
    /** Fetch regional timeseries when no polygon is selected (uses viloyat, optional tuman, optional yil for date range). */
    private fetchRegionalTimeseries = () => fetchGraffRegionalTimeseries(this as unknown as GraffDataServiceHost);
    private switchToTable = () => {
        return switchToTable(this as unknown as GraffWidgetHost);
    };
    private switchToGraph = () => {
        return switchToGraph(this as unknown as GraffWidgetHost);
    };
    private renderViewModeToggle = (activeMode: "table" | "graph") => {
        return renderViewModeToggle(this as unknown as GraffWidgetHost, activeMode);
    };
    private renderGraphLegend = () => {
        return renderGraphLegend(this as unknown as GraffWidgetHost);
    };
    private renderGraphHeader = () => {
        return renderGraphHeader(this as unknown as GraffWidgetHost);
    };
    private wrapGraphFrame = (body: React.ReactNode, options?: {
        refreshLoading?: boolean;
    }) => wrapGraphFrame(this as unknown as GraffWidgetHost, body, options);
    private toggleMonthPicker = () => {
        return toggleMonthPicker(this as unknown as GraffWidgetHost);
    };
    private resolveMonthPickerPlacement = (): "up" | "down" => {
        return resolveMonthPickerPlacement(this as unknown as GraffWidgetHost);
    };
    private handleMonthOptionClick = (month: number | null) => {
        return handleMonthOptionClick(this as unknown as GraffWidgetHost, month);
    };
    private resolveCurrentRegionId(): number | undefined {
        return resolveCurrentRegionId(this as unknown as GraffWidgetHost);
    }
    private publishVegetationOverlayContext = (): void => {
        return publishVegetationOverlayContext(this as unknown as GraffWidgetHost);
    };
    private resolveCurrentYear(): number | undefined {
        return resolveCurrentYear(this as unknown as GraffWidgetHost);
    }
    private broadcastDateIndexSelection = (): void => {
        return broadcastDateIndexSelection(this as unknown as GraffWidgetHost);
    };
    private getNavigableDateIndexDates = (): string[] => {
        return getNavigableDateIndexDates(this as unknown as GraffWidgetHost);
    };
    private handleDateIndexNavigate = (event: Event): void => {
        return handleDateIndexNavigate(this as unknown as GraffWidgetHost, event);
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
    private clearVegetationImageSurfaceLoading = (requestId: number): void => {
        return clearVegetationImageSurfaceLoading(this as unknown as GraffWidgetHost, requestId);
    };
    private beginVegetationImageSurfaceLoading = (): void => {
        return beginVegetationImageSurfaceLoading(this as unknown as GraffWidgetHost);
    };
    private cancelVegetationImageOverlay = (): void => {
        return cancelVegetationImageOverlay(this as unknown as GraffWidgetHost);
    };
    private removeVegetationImageOverlay = (): void => {
        return removeVegetationImageOverlay(this as unknown as GraffWidgetHost);
    };
    private ensureVegetationHoverTooltipEl = (): HTMLDivElement | null => ensureGraffHoverTooltipEl(this as unknown as GraffMapInteractionHost);
    private static readonly INDEX_COLORS: Record<string, string> = GraffIndexColors;
    private getIndexDisplayColor = (indexKey?: string | null): string => {
        return getIndexDisplayColor(this as unknown as GraffWidgetHost, indexKey);
    };
    private updateVegetationHoverTooltip = (value: number, clientX: number, clientY: number): void => updateGraffHoverTooltip(this as unknown as GraffMapInteractionHost, value, clientX, clientY);
    private hideVegetationHoverTooltip = (): void => hideGraffHoverTooltip(this as unknown as GraffMapInteractionHost);
    private detachVegetationRasterHover = (): void => detachGraffRasterHover(this as unknown as GraffMapInteractionHost);
    private sampleVegetationRasterValue = (mapPoint: __esri.Point): number | null => sampleGraffRasterValue(this as unknown as GraffMapInteractionHost, mapPoint);
    private resolveHoverIndexRange = (indiceType: string, rasterDate: string, fromExport?: {
        indexMin: number | null;
        indexMax: number | null;
    } | null): {
        indexMin: number | null;
        indexMax: number | null;
    } => {
        return resolveHoverIndexRange(this as unknown as GraffWidgetHost, indiceType, rasterDate, fromExport);
    };
    private attachVegetationRasterHover = (view: __esri.MapView | __esri.SceneView): void => attachGraffRasterHover(this as unknown as GraffMapInteractionHost, view);
    private retryOverlayWithUsableDate = async (cleanId: string, regionId: number, refusedDate: string, indiceType: VegetationIndiceType): Promise<void> => {
        return retryOverlayWithUsableDate(this as unknown as GraffWidgetHost, cleanId, regionId, refusedDate, indiceType);
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
    private applyVegetationImageOverlay = (uniqueid: string, rasterDate: string, indiceType: VegetationIndiceType = "ndvi", prefetched?: PolygonExportImageResult | null): Promise<void> => applyGraffVegetationImageOverlay(this as unknown as GraffRasterOverlayHost, uniqueid, rasterDate, indiceType, prefetched);
    private preparePolygonGraphSeries = (rows: VegetationIndex[], availableDates: string[]): {
        sorted: VegetationIndex[];
        nextDate: string | null;
        nextIndexKey: VegetationIndiceType | null;
        fingerprint: string;
    } => {
        return preparePolygonGraphSeries(this as unknown as GraffWidgetHost, rows, availableDates);
    };
    private fetchVegetationData = () => fetchGraffVegetationData(this as unknown as GraffDataServiceHost);
    private handleIndexChange = (index: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi") => {
        return handleIndexChange(this as unknown as GraffWidgetHost, index);
    };
    private handleToggleAllIndices = () => {
        return handleToggleAllIndices(this as unknown as GraffWidgetHost);
    };
    private localizeRuntimeMessage = (value: unknown): string => {
        return localizeRuntimeMessage(this as unknown as GraffWidgetHost, value);
    };
    private renderGraph = () => renderGraffGraph(this as unknown as GraffGraphHost);
    render() {
        return render(this as unknown as GraffWidgetHost);
    }
}
