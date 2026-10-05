import * as echarts from "echarts";
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

export interface AgriPieProps extends AllWidgetProps<any> {
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
import type { PieWidgetHost } from "./pie-host";
export default class AgriPie extends React.PureComponent<
  AgriPieProps,
  AgriPieState
> {
  _isMounted = false;
  private _unbindMasterFilter: (() => void) | null = null;

  // Crop palette (matches AgriLocalization renderer)
  private static readonly CROP_COLOR_MAP: Record<string, string> = pieCropColorMap;
  private static readonly PIE_SLICE_EDGE = pieSliceEdge;
  private static readonly FALLBACK_COLORS = pieFallbackColors;
  private static adjustHexColor(hex: string, amount: number): string {
    return pieAdjustHexColor(hex, amount);
  }
  private getSliceBorderColor = (): string =>
    getSliceBorderColor(this as unknown as PieWidgetHost);

  private getSliceFillStyle = (
    baseColor: string,
  ): string | { type: "linear"; x: number; y: number; x2: number; y2: number; colorStops: Array<{ offset: number; color: string }> } => {
    return getSliceFillStyle(this as unknown as PieWidgetHost, baseColor);
  };

  // Timing/connection — shared with dashboard / Localization / Indicator / Graff
  MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
  CONNECTION_TIMEOUT_MS = 15000;

  private static readonly APOSTROPHE_VARIANTS = pieApostropheVariants;
  private _latestKey = "";
  private _didInitOnce = false;

  // Viloyat normalized key -> index into `state.featureLayers`
  private _viloyatKeyToLayerIndex: Record<string, number> = {};
  private _featureLayersInitPromise: Promise<void> | null = null;

  // ✅ NEW: De-duplication for fetch
  private _fetchCounter = 0;
  private _lastFetchKey = "";
  /** Key of an in-flight VH pie wait (bridge pending) — must not clear loader. */
  private _pendingVhPieFetchKey = "";
  private _fetchDebounceTimer: any = null;
  private _pieChartRef = React.createRef<HTMLDivElement>();
  private _pieChart: echarts.ECharts | null = null;
  private _pieChartHostEl: HTMLDivElement | null = null;
  private _pieResizeObserver: ResizeObserver | null = null;
  private _pieObservedStage: Element | null = null;
  private _pieResizeRaf = 0;
  /** After first paint, subsequent option updates morph like Agrobank. */
  private _pieHasRendered = false;
  /** Stable slice key order so region changes morph arcs in place. */
  private _pieStableKeys: string[] = [];
  private _pieStableRawKeys: Record<string, string> = {};
  /** True only after at least one category fetch finished (success or empty). */
  private _hasCompletedFetch = false;
  /** crop_id → display turi (first spelling seen in Agri_table_data). */
  private _cropIdToTuri: Record<string, string> = {};
  /** Canonical turi key → crop_id for master-filter selection sync. */
  private _turiToCropId: Record<string, string> = {};
  private _cropMapsReady = false;

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

  private initializeTheme = () => {
    return initializeTheme(this as unknown as PieWidgetHost);
  };

  private handleThemeToggled = (event: Event) => {
    return handleThemeToggled(this as unknown as PieWidgetHost, event);
  };

  /* ---------- DS helpers ---------- */

  onDataSourceCreated = (ds: DataSource) => {
    return onDataSourceCreated(this as unknown as PieWidgetHost, ds);
  };

  onDataSourceInfoChange = (info: any) => {
    return onDataSourceInfoChange(this as unknown as PieWidgetHost, info);
  };

  findFieldByPossibleNames(possibleNames: string[]): string | null {
    return findFieldByPossibleNames(this as unknown as PieWidgetHost, possibleNames);
  }

  findCategoryField(flOverride?: __esri.FeatureLayer | null): string | null {
    return findCategoryField(this as unknown as PieWidgetHost, flOverride);
  }

  private buildWhereClauseForDS(
    opts: {
      includeCategory?: boolean;
      includeViloyat?: boolean;
      districtCode?: number | null;
    } = {},
  ): string {
    return buildWhereClauseForDS(this as unknown as PieWidgetHost, opts);
  }

  private buildPieVhWhereChunks(
    idsOverride?: string[] | null,
  ): string[] | null {
    return buildPieVhWhereChunks(this as unknown as PieWidgetHost, idsOverride);
  }

  /* ---------- Normalize / Escape ---------- */

  private normalizeName(s: string): string {
    return normalizeName(this as unknown as PieWidgetHost, s);
  }

  private async ensureCropIdMaps(): Promise<void> {
    return ensureCropIdMaps(this as unknown as PieWidgetHost);
  }

  private resolveCropIdToTuri(cropId: string): string {
    return resolveCropIdToTuri(this as unknown as PieWidgetHost, cropId);
  }

  private resolveTuriToCropId(turi: string): string {
    return resolveTuriToCropId(this as unknown as PieWidgetHost, turi);
  }

  private cropIdsToTuriNames(ids: string[]): string[] {
    return cropIdsToTuriNames(this as unknown as PieWidgetHost, ids);
  }

  private turiNamesToCropIds(names: string[]): string[] {
    return turiNamesToCropIds(this as unknown as PieWidgetHost, names);
  }

  private getCropColor(rawKey: string, index: number): string {
    return pieGetCropColor(this as unknown as PieWidgetHost, rawKey, index);
  }

  private getCategoryDisplayName(
    rawKey: string,
    language: AgriCropLanguage,
  ): string {
    return getCategoryDisplayName(this as unknown as PieWidgetHost, rawKey, language);
  }

  private makeAposVariants(s: string): string[] {
    return makeAposVariants(this as unknown as PieWidgetHost, s);
  }

  private eqAposSmart(field: string, raw: string): string {
    return eqAposSmart(this as unknown as PieWidgetHost, field, raw);
  }
  private makeViloyatKey(raw: string | null | undefined): string {
    return makeViloyatKey(this as unknown as PieWidgetHost, raw);
  }

  private isRepublicLayer = (layer?: __esri.FeatureLayer): boolean => {
    return isRepublicLayer(this as unknown as PieWidgetHost, layer);
  };

  private getDefaultFeatureLayer = (
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getDefaultFeatureLayer(this as unknown as PieWidgetHost, layersOverride);
  };

  private getFeatureLayerForViloyat = (
    viloyat: string,
  ): __esri.FeatureLayer | undefined => {
    return getFeatureLayerForViloyat(this as unknown as PieWidgetHost, viloyat);
  };

  private resolveFeatureLayersFromUseDataSources = async (): Promise<
    __esri.FeatureLayer[]
  > => {
    return resolveFeatureLayersFromUseDataSources(this as unknown as PieWidgetHost);
  };

  private buildViloyatKeyToLayerIndex = async (
    layers: __esri.FeatureLayer[],
  ): Promise<void> => {
    return buildViloyatKeyToLayerIndex(this as unknown as PieWidgetHost, layers);
  };

  private ensureFeatureLayersResolved = async (): Promise<
    __esri.FeatureLayer | undefined
  > => {
    return ensureFeatureLayersResolved(this as unknown as PieWidgetHost);
  };

  /* ---------- Map connection ---------- */

  waitForMapToLoad = (jimuMapView: JimuMapView): Promise<void> => {
    return waitForMapToLoad(this as unknown as PieWidgetHost, jimuMapView);
  };

  connectToMap = async (jimuMapView: JimuMapView): Promise<void> => {
    return connectToMap(this as unknown as PieWidgetHost, jimuMapView);
  };

  private initializeAfterConnection = (): void => {
    return initializeAfterConnection(this as unknown as PieWidgetHost);
  };

  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this as unknown as PieWidgetHost, jimuMapView);
  };

  retryMapConnection = () => {
    return retryMapConnection(this as unknown as PieWidgetHost);
  };

  /* ---------- Lifecycle ---------- */
  private handleMasterFilterChange = (event: Event) => {
    return handleMasterFilterChange(this as unknown as PieWidgetHost, event);
  };

  componentDidMount() {
    return componentDidMount(this as unknown as PieWidgetHost);
  }

  updateFiltersFromProps = (filters: {
    yil?: string;
    viloyat?: string;
    tuman?: string;
    turi?: string;
  }): void => {
    return updateFiltersFromProps(this as unknown as PieWidgetHost, filters);
  };
  private findAreaStatisticField(fl: __esri.FeatureLayer): string | null {
    return findAreaStatisticField(this as unknown as PieWidgetHost, fl);
  }

  private async queryCategoryStatsJSON(
    fl: __esri.FeatureLayer,
    where: string,
    categoryField: string,
  ): Promise<Array<{ key: string; value: number }>> {
    return queryCategoryStatsJSON(this as unknown as PieWidgetHost, fl, where, categoryField);
  }

  componentDidUpdate(prevProps: AgriPieProps, prevState: AgriPieState) {
    return componentDidUpdate(this as unknown as PieWidgetHost, prevProps, prevState);
  }

  componentWillUnmount() {
    return componentWillUnmount(this as unknown as PieWidgetHost);
  }

  /* ---------- Local UI helpers ---------- */

  private selectCategoryByName = (name: string | null) => {
    return selectCategoryByName(this as unknown as PieWidgetHost, name);
  };

  private _lastIpadLayout: boolean | null = null;

  private schedulePieChartResize = (): void => {
    return schedulePieChartResize(this as unknown as PieWidgetHost);
  };

  private attachPieResizeObserver = (host: HTMLDivElement): void => {
    return attachPieResizeObserver(this as unknown as PieWidgetHost, host);
  };

  private detachPieResizeObserver = (): void => {
    return detachPieResizeObserver(this as unknown as PieWidgetHost);
  };

  private handleResize = () => {
    return handleResize(this as unknown as PieWidgetHost);
  };

  private getChartDataForPie = () => {
    return getChartDataForPie(this as unknown as PieWidgetHost);
  };

  private ensurePieChart = () => {
    return ensurePieChart(this as unknown as PieWidgetHost);
  };

  private formatCenterArea = (value: number): string => {
    return formatCenterArea(this as unknown as PieWidgetHost, value);
  };

  private formatCenterPercent = (value: number): string => {
    return formatCenterPercent(this as unknown as PieWidgetHost, value);
  };

  private getCenterAllLabel = (): string => {
    return getCenterAllLabel(this as unknown as PieWidgetHost);
  };

  private isIpadLayout = (): boolean => {
    return isIpadLayout(this as unknown as PieWidgetHost);
  };

  private getPieCenterContent = (
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
    return getPieCenterContent(this as unknown as PieWidgetHost, chartData);
  };

  private updatePieChart = (reason: "data" | "selection" = "data") => {
    return updatePieChart(this as unknown as PieWidgetHost, reason);
  };

  /* ---------- Interactions ---------- */

  handleSliceClick = (
    data: { rawKey?: string; name?: string },
    index: number,
  ): void => {
    return handleSliceClick(this as unknown as PieWidgetHost, data, index);
  };
  applyCategoryFilter = async (): Promise<void> => {
    return applyCategoryFilter(this as unknown as PieWidgetHost);
  };

  /* ---------- Data fetch ---------- */
  private resolveNdviDateForVhPie(): string {
    return resolveNdviDateForVhPie(this as unknown as PieWidgetHost);
  }

  private async resolveRegionDistrictForPie(): Promise<{
    region?: number;
    district?: number;
  }> {
    return resolveRegionDistrictForPie(this as unknown as PieWidgetHost);
  }

  private async fetchPieCategoriesViaVegetation(
    fetchId: number,
  ): Promise<boolean> {
    return fetchPieCategoriesViaVegetation(this as unknown as PieWidgetHost, fetchId);
  }

  private makeQueryKey(
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
    return makeQueryKey(this as unknown as PieWidgetHost, yil, viloyat, tuman, vh, barField, barValue, filterPieByVh, pieVhSig, ndviDate);
  }

  private fetchCategoryData = (): void => {
    return fetchCategoryData(this as unknown as PieWidgetHost);
  };
  private async _doFetchCategoryData(): Promise<void> {
    return _doFetchCategoryData(this as unknown as PieWidgetHost);
  }

  /* ---------- Chart ---------- */

  private renderRadarPieChart = (
    _chartData: any[],
    _containerWidth: number = 300,
    _containerHeight: number = 300,
  ): JSX.Element => {
    return renderRadarPieChart(this as unknown as PieWidgetHost, _chartData, _containerWidth, _containerHeight);
  };

  /* ---------- Render ---------- */

  render() {
    return render(this as unknown as PieWidgetHost);
  }
}
