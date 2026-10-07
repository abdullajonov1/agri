import type { PieECharts } from "./echarts-setup";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSource,
  DataSourceComponent,
  ImmutableArray,
  QueriableDataSource,
  React,
} from "jimu-core";
import { Button } from "jimu-ui";
import { TriangleAlert } from "lucide-react";
import AgriChartLoader from "../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../shared/agriNoDataLabel";
import { getAgriDashboardBootstrap } from "../../../data/agri-bootstrap";
import {
  buildSpatialJoinWhere,
  expandUniqueIdsForAgriTable,
  getAgriTableDataLayer,
  queryAgriRegionDistrictMappings,
  queryAgriTuriCropMappings,
} from "../../../gis/agri-table-data-source";
import { escapeArcGIS } from "../../../gis/feature-layer-data";
import {
  VH_CATEGORY_TO_NDVI_STATUS,
  queryVegetationCropBreakdownForStatus,
  queryVegetationCropStatsForStatus,
  type VegetationCropBreakdownRow,
} from "../../../gis/agri-vegetation-data-source";
import {
  getPieVhFilterUniqueIds,
  getPieVhFilterUniqueIdsSig,
} from "../../../gis/agri-chart-filter-order";
import { agroV5Log } from "../../../gis/agri-debug-log";
import { resolveInitialLanguage } from "../../../shared/agri-language";
import { bindMasterFilter } from "../../../data/agri-filter-bus";
import { getPieCategoryStatsCached } from "../../../data/agri-stats-store";
import {
  AREA_FIELD_PREFERRED_PIE,
  findAreaFieldByPreferredNames,
} from "../../../data/agri-area-field";
import { getDashboardPack, waitForDashboardPackReady } from "../../../store/agri-dashboard-store";
import { matchPieDashboardPack } from "../../../data/agri-dashboard-pack-match";
import {
  buildPieCategoriesFromMergedRows,
  buildPieCategoriesFromPackRows,
  syncPieSelectionAgainstCategories,
} from "../../../data/agri-dashboard-pack-apply";
import { buildPieStatsWhere } from "../../../controller/agri-where-builder";
import {
  MAP_CONNECTION_RETRY_MS,
  MAX_MAP_CONNECTION_ATTEMPTS,
} from "../../../shared/map-connection-service";
import {
  getCropColor,
  getCropDisplayName,
  getTuriCropLookupKey,
  normalizeCropName,
  type AgriCropLanguage,
} from "../../../shared/agri-crop-labels";

/* ---------- Types ---------- */

export interface CategoryData {
  key: string;
  value: number;
  percentage?: number;
}

/** Config is the dashboard's plain record; the Pie panel does not read it. */
export interface AgriPieProps extends AllWidgetProps<Record<string, unknown>> {
  externalFilters?: {
    viloyat?: string;
    tuman?: string;
    yil?: string;
    turi?: string;
  };
  useMapWidgetIds?: ImmutableArray<string>;
}

export interface AgriPieState {
  loading: boolean;
  error: string | null;

  categoryData: {
    categories: CategoryData[];
    totalValue: number;
  };
  vh: string;
  /** NDVI raster date used by VH bar (from master filter). */
  ndviDate: string;
  /** Bar chart's current attribute (e.g. status_2025_06_12); use with barCategoryValue to filter like Graff */
  barCategoryField: string | null;
  barCategoryValue: string | null;

  // Filter hierarchy (incoming from other widgets)
  yil: string;
  viloyat: string;
  /** AgriFilter scope: viloyat qulflash (filters.viloyat bo‘sh bo‘lishi mumkin) */
  lockedViloyat: string;
  tuman: string;
  turi: string;
  turlar: string[];
  /** When true, pie is scoped by VH uniqueids (VH was selected first). */
  filterPieByVh: boolean;
  /** Signature of the uniqueid set used for VH→pie filtering. */
  pieVhUniqueIdsSig: string;
  /** Exact STIR from header search (master filter). */
  farmerInn: string;

  // UI state
  activeSlice: number | null;
  selectedCategory: string | null;
  selectedCategories: string[];
  hoveredSlice: number | null;

  // Map-related
  activeMapView?: JimuMapView;

  // Event tracking
  lastFilterEventTimestamp: number;
  isHandlingExternalEvent: boolean;

  // Connection status
  mapConnectionAttempts: number;
  mapLoadingStatus: "idle" | "loading" | "loaded" | "failed";
  connectionStatus: "idle" | "connecting" | "connected" | "failed";

  // Data source
  dataSource?: QueriableDataSource;

  // Resolved FeatureLayers for multi-DS routing by viloyat
  featureLayers?: __esri.FeatureLayer[];
  activeFeatureLayer?: __esri.FeatureLayer;

  // Debug
  debugInfo: string;
  language: "uz_cyr" | "uz_lat" | "ru" | "en";
  isDarkTheme: boolean;
}

/* ---------- Component ---------- */

import {
  CROP_COLOR_MAP as pieCropColorMap,
  PIE_SLICE_EDGE as pieSliceEdge,
  FALLBACK_COLORS as pieFallbackColors,
  APOSTROPHE_VARIANTS as pieApostropheVariants,
  adjustHexColor as pieAdjustHexColor,
} from "./pie-colors";
import {
  getSliceBorderColor,
  getSliceFillStyle,
  initializeTheme,
  handleThemeToggled,
  onDataSourceCreated,
  onDataSourceInfoChange,
  findFieldByPossibleNames,
  findCategoryField,
  buildWhereClauseForDS,
  buildPieVhWhereChunks,
  normalizeName,
  ensureCropIdMaps,
  resolveCropIdToTuri,
  resolveTuriToCropId,
  cropIdsToTuriNames,
  turiNamesToCropIds,
  getCropColor as pieGetCropColor,
  getCategoryDisplayName,
  makeAposVariants,
  eqAposSmart,
  makeViloyatKey,
  isRepublicLayer,
  getDefaultFeatureLayer,
  getFeatureLayerForViloyat,
  resolveFeatureLayersFromUseDataSources,
  buildViloyatKeyToLayerIndex,
  ensureFeatureLayersResolved,
  waitForMapToLoad,
  connectToMap,
  initializeAfterConnection,
  onActiveViewChange,
  retryMapConnection,
} from "./components/chart-helpers";
import {
  handleMasterFilterChange,
  componentDidMount,
  updateFiltersFromProps,
  findAreaStatisticField,
  queryCategoryStatsJSON,
  componentDidUpdate,
  componentWillUnmount,
  selectCategoryByName,
  schedulePieChartResize,
  attachPieResizeObserver,
  detachPieResizeObserver,
  handleResize,
  getChartDataForPie,
  ensurePieChart,
  formatCenterArea,
  formatCenterPercent,
  getCenterAllLabel,
  isIpadLayout,
  getPieCenterContent,
  updatePieChart,
  handleSliceClick,
  applyCategoryFilter,
  resolveNdviDateForVhPie,
  resolveRegionDistrictForPie,
  fetchPieCategoriesViaVegetation,
  makeQueryKey,
  fetchCategoryData,
  _doFetchCategoryData,
} from "./components/data-handlers";
import {
  renderRadarPieChart,
  render,
} from "./components/render-panel";
import type { PieChartDatum, PieWidgetHost } from "./pie-host";
export default class AgriPie extends React.PureComponent<
  AgriPieProps,
  AgriPieState
> implements PieWidgetHost {
  _isMounted = false;
  _unbindMasterFilter: (() => void) | null = null;

  // Crop palette (matches AgriLocalization renderer)
  private static readonly CROP_COLOR_MAP: Record<string, string> = pieCropColorMap;
  private static readonly PIE_SLICE_EDGE = pieSliceEdge;
  private static readonly FALLBACK_COLORS = pieFallbackColors;
  private static adjustHexColor(hex: string, amount: number): string {
    return pieAdjustHexColor(hex, amount);
  }
  getSliceBorderColor = (): string =>
    getSliceBorderColor(this);

  getSliceFillStyle = (
    baseColor: string,
  ): string | { type: "linear"; x: number; y: number; x2: number; y2: number; colorStops: Array<{ offset: number; color: string }> } => {
    return getSliceFillStyle(this, baseColor);
  };

  // Timing/connection — shared with dashboard / Localization / Indicator / Graff
  MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
  CONNECTION_TIMEOUT_MS = 15000;

  private static readonly APOSTROPHE_VARIANTS = pieApostropheVariants;
  _latestKey = "";
  _didInitOnce = false;

  // Viloyat normalized key -> index into `state.featureLayers`
  _viloyatKeyToLayerIndex: Record<string, number> = {};
  _featureLayersInitPromise: Promise<void> | null = null;

  // ✅ NEW: De-duplication for fetch
  _fetchCounter = 0;
  _lastFetchKey = "";
  /** Key of an in-flight VH pie wait (bridge pending) — must not clear loader. */
  _pendingVhPieFetchKey = "";
  _fetchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  _pieChartRef = React.createRef<HTMLDivElement>();
  _pieChart: PieECharts | null = null;
  _pieChartHostEl: HTMLDivElement | null = null;
  _pieResizeObserver: ResizeObserver | null = null;
  _pieObservedStage: Element | null = null;
  _pieResizeRaf = 0;
  /** After first paint, subsequent option updates morph like Agrobank. */
  _pieHasRendered = false;
  /** Stable slice key order so region changes morph arcs in place. */
  _pieStableKeys: string[] = [];
  _pieStableRawKeys: Record<string, string> = {};
  /** True only after at least one category fetch finished (success or empty). */
  _hasCompletedFetch = false;
  /** crop_id → display turi (first spelling seen in Agri_table_data). */
  _cropIdToTuri: Record<string, string> = {};
  /** Canonical turi key → crop_id for master-filter selection sync. */
  _turiToCropId: Record<string, string> = {};
  _cropMapsReady = false;

  constructor(props: AgriPieProps) {
    super(props);

    const initialLanguage = resolveInitialLanguage();

    let initialIsDarkTheme = true;
    try {
      const savedTheme = localStorage.getItem("agri_v11_app_theme");
      initialIsDarkTheme =
        savedTheme !== null ? savedTheme === "dark" : true;
    } catch {
      initialIsDarkTheme = true;
    }

    this.state = {
      loading: false,
      error: null,
      categoryData: { categories: [], totalValue: 0 },

      yil: "",
      viloyat: "",
      lockedViloyat: "",
      tuman: "",
      turi: "",
      turlar: [],
      filterPieByVh: false,
      pieVhUniqueIdsSig: "",
      farmerInn: "",
      vh: "",
      ndviDate: "",
      barCategoryField: null,
      barCategoryValue: null,

      activeSlice: null,
      selectedCategory: null,
      selectedCategories: [],
      hoveredSlice: null,

      activeMapView: undefined,

      lastFilterEventTimestamp: 0,
      isHandlingExternalEvent: false,

      mapConnectionAttempts: 0,
      mapLoadingStatus: "idle",
      connectionStatus: "idle",

      dataSource: undefined,

      featureLayers: [],
      activeFeatureLayer: undefined,

      debugInfo: "Widget initializing",
      language: initialLanguage,
      isDarkTheme: initialIsDarkTheme,
    };
  }

  initializeTheme = () => {
    return initializeTheme(this);
  };

  handleThemeToggled = (event: Event) => {
    return handleThemeToggled(this, event);
  };

  /* ---------- DS helpers ---------- */

  onDataSourceCreated = (ds: DataSource) => {
    return onDataSourceCreated(this, ds);
  };

  onDataSourceInfoChange = (info: unknown) => {
    return onDataSourceInfoChange(this, info);
  };

  findFieldByPossibleNames(possibleNames: string[]): string | null {
    return findFieldByPossibleNames(this, possibleNames);
  }

  findCategoryField(flOverride?: __esri.FeatureLayer | null): string | null {
    return findCategoryField(this, flOverride);
  }

  buildWhereClauseForDS(
    opts: {
      includeCategory?: boolean;
      includeViloyat?: boolean;
      districtCode?: number | null;
    } = {},
  ): string {
    return buildWhereClauseForDS(this, opts);
  }

  buildPieVhWhereChunks(
    idsOverride?: string[] | null,
  ): string[] | null {
    return buildPieVhWhereChunks(this, idsOverride);
  }

  /* ---------- Normalize / Escape ---------- */

  normalizeName(s: string): string {
    return normalizeName(this, s);
  }

  async ensureCropIdMaps(): Promise<void> {
    return ensureCropIdMaps(this);
  }

  resolveCropIdToTuri(cropId: string): string {
    return resolveCropIdToTuri(this, cropId);
  }

  resolveTuriToCropId(turi: string): string {
    return resolveTuriToCropId(this, turi);
  }

  cropIdsToTuriNames(ids: string[]): string[] {
    return cropIdsToTuriNames(this, ids);
  }

  turiNamesToCropIds(names: string[]): string[] {
    return turiNamesToCropIds(this, names);
  }

  getCropColor(rawKey: string, index: number): string {
    return pieGetCropColor(this, rawKey, index);
  }

  getCategoryDisplayName(
    rawKey: string,
    language: AgriCropLanguage,
  ): string {
    return getCategoryDisplayName(this, rawKey, language);
  }

  makeAposVariants(s: string): string[] {
    return makeAposVariants(this, s);
  }

  eqAposSmart(field: string, raw: string): string {
    return eqAposSmart(this, field, raw);
  }
  makeViloyatKey(raw: string | null | undefined): string {
    return makeViloyatKey(this, raw);
  }

  isRepublicLayer = (layer?: __esri.FeatureLayer): boolean => {
    return isRepublicLayer(this, layer);
  };

  getDefaultFeatureLayer = (
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getDefaultFeatureLayer(this, layersOverride);
  };

  getFeatureLayerForViloyat = (
    viloyat: string,
  ): __esri.FeatureLayer | undefined => {
    return getFeatureLayerForViloyat(this, viloyat);
  };

  resolveFeatureLayersFromUseDataSources = async (): Promise<
    __esri.FeatureLayer[]
  > => {
    return resolveFeatureLayersFromUseDataSources(this);
  };

  buildViloyatKeyToLayerIndex = async (
    layers: __esri.FeatureLayer[],
  ): Promise<void> => {
    return buildViloyatKeyToLayerIndex(this, layers);
  };

  ensureFeatureLayersResolved = async (): Promise<
    __esri.FeatureLayer | undefined
  > => {
    return ensureFeatureLayersResolved(this);
  };

  /* ---------- Map connection ---------- */

  waitForMapToLoad = (jimuMapView: JimuMapView): Promise<void> => {
    return waitForMapToLoad(this, jimuMapView);
  };

  connectToMap = async (jimuMapView: JimuMapView): Promise<void> => {
    return connectToMap(this, jimuMapView);
  };

  initializeAfterConnection = (): void => {
    return initializeAfterConnection(this);
  };

  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this, jimuMapView);
  };

  retryMapConnection = () => {
    return retryMapConnection(this);
  };

  /* ---------- Lifecycle ---------- */
  handleMasterFilterChange = (event: Event) => {
    return handleMasterFilterChange(this, event);
  };

  componentDidMount() {
    return componentDidMount(this);
  }

  updateFiltersFromProps = (filters: {
    yil?: string;
    viloyat?: string;
    tuman?: string;
    turi?: string;
  }): void => {
    return updateFiltersFromProps(this, filters);
  };
  findAreaStatisticField(fl: __esri.FeatureLayer): string | null {
    return findAreaStatisticField(this, fl);
  }

  async queryCategoryStatsJSON(
    fl: __esri.FeatureLayer,
    where: string,
    categoryField: string,
  ): Promise<Array<{ key: string; value: number }>> {
    return queryCategoryStatsJSON(this, fl, where, categoryField);
  }

  componentDidUpdate(prevProps: AgriPieProps, prevState: AgriPieState) {
    return componentDidUpdate(this, prevProps, prevState);
  }

  componentWillUnmount() {
    return componentWillUnmount(this);
  }

  /* ---------- Local UI helpers ---------- */

  selectCategoryByName = (name: string | null) => {
    return selectCategoryByName(this, name);
  };

  _lastIpadLayout: boolean | null = null;

  schedulePieChartResize = (): void => {
    return schedulePieChartResize(this);
  };

  attachPieResizeObserver = (host: HTMLDivElement): void => {
    return attachPieResizeObserver(this, host);
  };

  detachPieResizeObserver = (): void => {
    return detachPieResizeObserver(this);
  };

  handleResize = () => {
    return handleResize(this);
  };

  getChartDataForPie = () => {
    return getChartDataForPie(this);
  };

  ensurePieChart = () => {
    return ensurePieChart(this);
  };

  formatCenterArea = (value: number): string => {
    return formatCenterArea(this, value);
  };

  formatCenterPercent = (value: number): string => {
    return formatCenterPercent(this, value);
  };

  getCenterAllLabel = (): string => {
    return getCenterAllLabel(this);
  };

  isIpadLayout = (): boolean => {
    return isIpadLayout(this);
  };

  getPieCenterContent = (
    chartData: Array<{
      name: string;
      rawKey?: string;
      value: number;
      percentage?: number;
    }>,
  ): {
    showPercent: boolean;
    percent: number;
    area: number;
    label: string;
  } => {
    return getPieCenterContent(this, chartData);
  };

  updatePieChart = (reason: "data" | "selection" = "data") => {
    return updatePieChart(this, reason);
  };

  /* ---------- Interactions ---------- */

  handleSliceClick = (
    data: { rawKey?: string; name?: string },
    index: number,
  ): void => {
    return handleSliceClick(this, data, index);
  };
  applyCategoryFilter = async (): Promise<void> => {
    return applyCategoryFilter(this);
  };

  /* ---------- Data fetch ---------- */
  resolveNdviDateForVhPie(): string {
    return resolveNdviDateForVhPie(this);
  }

  async resolveRegionDistrictForPie(): Promise<{
    region?: number;
    district?: number;
  }> {
    return resolveRegionDistrictForPie(this);
  }

  async fetchPieCategoriesViaVegetation(
    fetchId: number,
  ): Promise<boolean> {
    return fetchPieCategoriesViaVegetation(this, fetchId);
  }

  makeQueryKey(
    yil: string,
    viloyat: string,
    tuman: string,
    vh: string,
    barField?: string | null,
    barValue?: string | null,
    filterPieByVh?: boolean,
    pieVhSig?: string,
    ndviDate?: string,
  ) {
    return makeQueryKey(this, yil, viloyat, tuman, vh, barField, barValue, filterPieByVh, pieVhSig, ndviDate);
  }

  fetchCategoryData = (): void => {
    return fetchCategoryData(this);
  };
  async _doFetchCategoryData(): Promise<void> {
    return _doFetchCategoryData(this);
  }

  /* ---------- Chart ---------- */

  renderRadarPieChart = (
    _chartData: PieChartDatum[],
    _containerWidth: number = 300,
    _containerHeight: number = 300,
  ): JSX.Element => {
    return renderRadarPieChart(this, _chartData, _containerWidth, _containerHeight);
  };

  /* ---------- Render ---------- */

  render() {
    return render(this);
  }
}
