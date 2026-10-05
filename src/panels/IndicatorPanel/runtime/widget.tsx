import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSource,
  DataSourceComponent,
  DataSourceStatus,
  QueriableDataSource,
  React,
} from "jimu-core";
import throttle from "lodash/throttle";
import AgriDashboardSpinner from "../../../shared/AgriDashboardSpinner";
import AgriAnimatedCount from "../../../shared/AgriAnimatedCount";
import {
  buildSpatialJoinWhere,
  expandUniqueIdsForAgriTable,
  getAgriTableDataLayer,
} from "../../../gis/agri-table-data-source";
import { withAgriAccessWhere } from "../../../gis/feature-layer-data";
import {
  escapeLikeLiteral,
  eqAposSmart,
  normalizeApos,
} from "../../../data/agri-sql";
import {
  detectIsDarkTheme,
  normalizeLanguage,
  resolveInitialLanguage,
  type AgriLanguage,
} from "../../../shared/agri-language";
import { bindMasterFilter } from "../../../data/agri-filter-bus";
import { buildTurlarSqlClause } from "../../../shared/agri-crop-labels";
import {
  MAP_CONNECTION_RETRY_MS,
  MAX_MAP_CONNECTION_ATTEMPTS,
} from "../../../shared/map-connection-service";
import { buildIndicatorStatsWhere } from "../../../controller/agri-where-builder";
import {
  getDashboardPack,
  waitForDashboardPackReady,
} from "../../../store/agri-dashboard-store";
import { matchIndicatorDashboardPack } from "../../../data/agri-dashboard-pack-match";
import {
  canConsumeIndicatorDashboardPack,
  formatIndicatorStatValue,
} from "../../../data/agri-dashboard-pack-apply";
import { queryIndicatorOutStat } from "../../../data/agri-indicator-stats";
import { normalizeTurlarListSql } from "../../../data/agri-turlar";
import "./KadastrIndicator.css";
import {
  labelNoValue,
  translateKnownError,
  handleLanguageChange,
  normalizeUzbekForApi,
  getFieldType,
  nz,
  makeApostropheVariants,
  makeDistrictSuffixVariants,
  makeRegionSuffixVariants,
  normalizeTurlar,
  buildTurlarClause,
  shouldFetchForViloyat,
  prepareVhJoinIds,
} from "./components/text-helpers";
import {
  componentDidMount,
  handleMasterFilterChanged,
  componentWillUnmount,
  componentDidUpdate,
  handleExternalCategory,
  handleConstructionYearChanged,
  handleRegionChange,
  handleYilChange,
  handleWaterSupplyFilterChange,
  handleCategorySelection,
  handleKadastrFiltersChanged,
  handleKadastrFiltersReset,
  handleVegetationStatusChange,
  handleCropTypeChange,
  refreshData,
  readFiltersFromUrl,
} from "./components/filter-handlers";




const WIDGET_EVENTS = {
  YIL_CHANGED: "yilChanged",
  REGION_CHANGED: "regionChanged",
  VEGETATION_STATUS_CHANGED: "vegetationStatusChanged",
  CROP_TYPE_CHANGED: "cropTypeChanged",
  RESET_ALL: "resetAllWidgets",
};

export interface IndicatorConfig {
  useApiDataSource?: boolean;

  attributeField?: string; // numeric field to aggregate (for sum/avg/min/max/first)
  decimalPlaces?: number;
  statOperation?: "count" | "sum" | "avg" | "min" | "max" | "first";

  // grouping
  groupByField?: string; // e.g. 'buzilish'
  includeNullCategory?: boolean;
  categoryMode?: "AUTO" | "ENUM";
  enumCategories?: Array<{ label: string; value: string | number | null }>;
  outStatName?: string; // default 'agg'
  displayGroupValue?: string | number | null;

  // “exclude zeros”
  excludeZeroValues?: boolean;

  // filters
  filterExpression?: string;

  // ✅ CHANGED DEFAULT: turi (not tur)
  yerToifasField?: string; // FeatureLayer field name
  yerToifasParam?: string; // API query param name

  // API
  apiEndpoint?: string;
  apiUrl?: string;
  endpoint?: string;
  url?: string;
  responseField?: string;

  // UI
  label?: string;
  unitLabel?: string;
  showFeatureCount?: boolean;
  showLastUpdate?: boolean;
  showFilterSummary?: boolean;
  iconImage?: any;

  // styling overrides (optional)
  backgroundColor?: string;
  textColor?: string;
  labelColor?: string;
  borderRadius?: number | string;
  iconSize?: number | string;
  iconOpacity?: number | string;

  // auto refresh
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

import { FILTER_FIELDS } from "./indicator-constants";

export interface VegetationStatsWidgetState {
  vegetationArea: number | null;
  loading: boolean;
  error: string | null;

  activeMapView?: JimuMapView;
  dataSource?: QueriableDataSource;
  featureLayer?: __esri.FeatureLayer;
  featureLayers?: __esri.FeatureLayer[];

  featureCount: number;
  lastUpdate: Date | null;

  connectionStatus: "idle" | "connecting" | "connected" | "failed";
  mapConnectionAttempts: number;

  // filters
  selectedYil: string;
  selectedViloyat: string;
  selectedTuman: string;
  selectedYerToifas: string; // kept name, but maps to field \
  /** Multi-select crop types from Pie/master filter (turi list). */
  selectedYerToifalari: string[];

  selectedVegetationStatus: string;
  /** Resolved VH uniqueids from master filter (map geography scope). */
  vhUniqueids: string[] | null;
  selectedCropType: string;
  /** Bar chart's current attribute (e.g. status_2025_06_12); use with barCategoryValue to filter like Graff */
  barCategoryField: string | null;
  barCategoryValue: string | null;
  /** Single-polygon focus from popup/graff when polygonMode is on. */
  selectedUniqueid: string;

  totalArea: number | null;

  // event tracking
  lastFilterEventTimestamp: number;
  isHandlingExternalEvent: boolean;

  // grouping output
  groupResults?: Array<{
    key: string | number | null;
    label: string;
    value: number;
  }>;

  isDarkTheme: boolean;
  widgetSize: "xs" | "sm" | "md" | "lg";

  /** App UI language (Russian by default — not Uzbek Cyrillic) */
  language: AgriLanguage;
}

import {
  ensureInitialization,
  retryMapConnection,
  onActiveViewChange,
  makeViloyatKeyForRouting,
  getFeatureLayerForViloyat,
  isRepublicLayer,
  getDefaultFeatureLayer,
  buildViloyatLayerIndex,
  initializeMapConnection,
  initializeMapConnectionOnce,
  onDataSourceCreated,
  onDataSourceInfoChange,
} from "./components/map-handlers";
import {
  buildWhereClause,
  buildApiUrl,
  fetchGroupedStats,
  fetchGroupedFirst,
  fetchApiData,
  fetchData,
  setupAutoRefresh,
  initializeTheme,
  handleThemeChange,
  getCustomStyles,
} from "./components/data-handlers";
import {
  render,
} from "./components/render-panel";
import type { IndicatorWidgetHost } from "./indicator-host";
export default class VegetationStatsWidget extends React.PureComponent<
  AllWidgetProps<any>,
  VegetationStatsWidgetState
> {
  private throttledFetchData: any;
  private MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
  private initializationTimer: any;
  private _mapConnectionPromise: Promise<void> | null = null;
  private refreshTimer: any;
  private _abortController: AbortController | null = null;
  private _isMounted = false;
  private _requestId = 0;
  private _unbindMasterFilter: (() => void) | null = null;
  /** Timestamp of the last masterFilterChanged event — used to skip auto-refresh
   * when a filter change already triggered refreshData() recently. */
  private _lastFilterEventMs = 0;
  private _onReset: () => void;
  private _isResetting = false;
  private _lastMasterFilterTs = 0;
  private _lastMasterFilterBroadcastGeneration = 0;
  private _canonicalFeatureLayer?: __esri.FeatureLayer;

  // Viloyat routing cache (viloyat normalized key -> index in `this.state.featureLayers`)
  private _viloyatKeyToLayerIndex: Record<string, number> = {};
  private _containerRef = React.createRef<HTMLDivElement>();
  private _resizeObserver: ResizeObserver | null = null;

  private labelNoValue = (): string => {
    return labelNoValue(this as unknown as IndicatorWidgetHost);
  };

  private translateKnownError = (msg: string): string => {
    return translateKnownError(this as unknown as IndicatorWidgetHost, msg);
  };

  private handleLanguageChange = (event: Event) => {
    return handleLanguageChange(this as unknown as IndicatorWidgetHost, event);
  };

  constructor(props: AllWidgetProps<any>) {
    super(props);

    const initialLanguage = resolveInitialLanguage();
    const initialIsDarkTheme = detectIsDarkTheme();

    this.state = {
      vegetationArea: null,
      loading: true,
      error: null,

      featureCount: 0,
      lastUpdate: null,

      connectionStatus: "idle",
      mapConnectionAttempts: 0,
      featureLayers: [],

      selectedYil: "",
      selectedViloyat: "",
      selectedTuman: "",
      selectedYerToifas: "",
      selectedYerToifalari: [],

      totalArea: null,

      selectedVegetationStatus: "",
      vhUniqueids: null,
      selectedCropType: "",
      barCategoryField: null,
      barCategoryValue: null,
      selectedUniqueid: "",

      lastFilterEventTimestamp: 0,
      isHandlingExternalEvent: false,

      isDarkTheme: initialIsDarkTheme,
      widgetSize: "lg",
      language: initialLanguage,
    };

    this.throttledFetchData = throttle(this.fetchData, 300, {
      leading: false,
      trailing: true,
    });

    // Bind
    this.fetchData = this.fetchData.bind(this);
    this.fetchApiData = this.fetchApiData.bind(this);
    this.onDataSourceCreated = this.onDataSourceCreated.bind(this);
    this.onDataSourceInfoChange = this.onDataSourceInfoChange.bind(this);
    this.onActiveViewChange = this.onActiveViewChange.bind(this);
    this.retryMapConnection = this.retryMapConnection.bind(this);
    this.initializeMapConnection = this.initializeMapConnection.bind(this);
    this.readFiltersFromUrl = this.readFiltersFromUrl.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.setupAutoRefresh = this.setupAutoRefresh.bind(this);

    // External handlers
    this.handleYilChange = this.handleYilChange.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleConstructionYearChanged =
      this.handleConstructionYearChanged.bind(this);
    this.handleWaterSupplyFilterChange =
      this.handleWaterSupplyFilterChange.bind(this);
    this.handleCategorySelection = this.handleCategorySelection.bind(this);
    this.handleKadastrFiltersChanged =
      this.handleKadastrFiltersChanged.bind(this);
    this.handleKadastrFiltersReset = this.handleKadastrFiltersReset.bind(this);
    this.handleVegetationStatusChange =
      this.handleVegetationStatusChange.bind(this);
    this.handleCropTypeChange = this.handleCropTypeChange.bind(this);

    this._onReset = () => {

      this._isResetting = true;

      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }

      this.setState(
        {
          selectedYil: "",
          selectedViloyat: "",
          selectedTuman: "",
          selectedYerToifas: "",
          selectedYerToifalari: [],
          selectedVegetationStatus: "",
          vhUniqueids: null,
          selectedCropType: "",
          barCategoryField: null,
          barCategoryValue: null,
          selectedUniqueid: "",
          vegetationArea: null,
          totalArea: null,
          loading: true,
          error: null,
          groupResults: undefined,
        },
        () => {
          if (this.props.config?.useApiDataSource) this.fetchApiData();
          else if (this.state.connectionStatus === "connected")
            this.fetchData(true);

          setTimeout(() => (this._isResetting = false), 500);
        },
      );
    };
  }

  private normalizeUzbekForApi = (s: string): string => {
    return normalizeUzbekForApi(this as unknown as IndicatorWidgetHost, s);
  };

  private getFieldType = (name: string): string | null => {
    return getFieldType(this as unknown as IndicatorWidgetHost, name);
  };

  private nz = (field: string) => {
    return nz(this as unknown as IndicatorWidgetHost, field);
  };

  private makeApostropheVariants = (s: string): string[] => {
    return makeApostropheVariants(this as unknown as IndicatorWidgetHost, s);
  };

  private makeDistrictSuffixVariants = (raw: string): string[] => {
    return makeDistrictSuffixVariants(this as unknown as IndicatorWidgetHost, raw);
  };

  private makeRegionSuffixVariants = (raw: string): string[] => {
    return makeRegionSuffixVariants(this as unknown as IndicatorWidgetHost, raw);
  };

  private normalizeTurlar(raw: unknown, fallback = ""): string[] {
    return normalizeTurlar(this as unknown as IndicatorWidgetHost, raw, fallback);
  }

  private buildTurlarClause(field: string, values: string[]): string {
    return buildTurlarClause(this as unknown as IndicatorWidgetHost, field, values);
  }
  componentDidMount() {
    return componentDidMount(this as unknown as IndicatorWidgetHost);
  }

  private shouldFetchForViloyat(): boolean {
    return shouldFetchForViloyat(this as unknown as IndicatorWidgetHost);
  }

  private handleMasterFilterChanged = (event: Event) => {
    return handleMasterFilterChanged(this as unknown as IndicatorWidgetHost, event);
  };

  /**
   * Expanded (id-style adapted) copy of state.vhUniqueids used for the
   * Agri_table_data join. `_vhJoinSource` keeps the exact array reference the
   * expansion was computed from so a stale expansion is never applied.
   */
  private _vhJoinSource: string[] | null = null;
  private _vhJoinExpanded: string[] | null = null;

  private prepareVhJoinIds = async (ids: string[] | null): Promise<void> => {
    return prepareVhJoinIds(this as unknown as IndicatorWidgetHost, ids);
  };

  componentWillUnmount() {
    return componentWillUnmount(this as unknown as IndicatorWidgetHost);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<any>,
    prevState: VegetationStatsWidgetState,
  ) {
    return componentDidUpdate(this as unknown as IndicatorWidgetHost, prevProps, prevState);
  }

  // =========================
  // External event handlers
  // =========================

  private handleExternalCategory = async (event: CustomEvent) => {
    return handleExternalCategory(this as unknown as IndicatorWidgetHost, event);
  };

  handleConstructionYearChanged = (event: any) => {
    return handleConstructionYearChanged(this as unknown as IndicatorWidgetHost, event);
  };

  handleRegionChange = (event: any): void => {
    return handleRegionChange(this as unknown as IndicatorWidgetHost, event);
  };

  handleYilChange = (event: any): void => {
    return handleYilChange(this as unknown as IndicatorWidgetHost, event);
  };

  handleWaterSupplyFilterChange = (event: CustomEvent) => {
    return handleWaterSupplyFilterChange(this as unknown as IndicatorWidgetHost, event);
  };

  handleCategorySelection = (event: CustomEvent) => {
    return handleCategorySelection(this as unknown as IndicatorWidgetHost, event);
  };

  handleKadastrFiltersChanged = (event: any) => {
    return handleKadastrFiltersChanged(this as unknown as IndicatorWidgetHost, event);
  };

  handleKadastrFiltersReset = () =>
    handleKadastrFiltersReset(this as unknown as IndicatorWidgetHost);

  handleVegetationStatusChange = (event: CustomEvent) => {
    return handleVegetationStatusChange(this as unknown as IndicatorWidgetHost, event);
  };

  handleCropTypeChange = (event: CustomEvent) => {
    return handleCropTypeChange(this as unknown as IndicatorWidgetHost, event);
  };

  refreshData = () => {
    return refreshData(this as unknown as IndicatorWidgetHost);
  };

  // =========================
  // URL sync
  // =========================

  readFiltersFromUrl(): void {
    return readFiltersFromUrl(this as unknown as IndicatorWidgetHost);
  }

  // =========================
  // Map + DataSource
  // =========================

  ensureInitialization = () => {
    return ensureInitialization(this as unknown as IndicatorWidgetHost);
  };

  retryMapConnection() {
    return retryMapConnection(this as unknown as IndicatorWidgetHost);
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this as unknown as IndicatorWidgetHost, jimuMapView);
  };

  private makeViloyatKeyForRouting = (viloyat: string): string => {
    return makeViloyatKeyForRouting(this as unknown as IndicatorWidgetHost, viloyat);
  };

  private getFeatureLayerForViloyat = (
    viloyat: string,
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getFeatureLayerForViloyat(this as unknown as IndicatorWidgetHost, viloyat, layersOverride);
  };

  private isRepublicLayer = (layer?: __esri.FeatureLayer): boolean => {
    return isRepublicLayer(this as unknown as IndicatorWidgetHost, layer);
  };

  private getDefaultFeatureLayer = (
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getDefaultFeatureLayer(this as unknown as IndicatorWidgetHost, layersOverride);
  };

  private buildViloyatLayerIndex = async (
    layers: __esri.FeatureLayer[],
  ): Promise<void> => {
    return buildViloyatLayerIndex(this as unknown as IndicatorWidgetHost, layers);
  };

  initializeMapConnection = (jimuMapView: JimuMapView): Promise<void> => {
    return initializeMapConnection(this as unknown as IndicatorWidgetHost, jimuMapView);
  };

  private initializeMapConnectionOnce = async (jimuMapView: JimuMapView) => {
    return initializeMapConnectionOnce(this as unknown as IndicatorWidgetHost, jimuMapView);
  };

  onDataSourceCreated = (dataSource: DataSource) => {
    return onDataSourceCreated(this as unknown as IndicatorWidgetHost, dataSource);
  };

  onDataSourceInfoChange = (info: any) => {
    return onDataSourceInfoChange(this as unknown as IndicatorWidgetHost, info);
  };

  // =========================
  // WHERE builder (FeatureLayer)
  // =========================

  buildWhereClause(includeViloyat = true): string {
    return buildWhereClause(this as unknown as IndicatorWidgetHost, includeViloyat);
  }

  // =========================
  // API url builder
  // =========================

  private buildApiUrl(): string {
    return buildApiUrl(this as unknown as IndicatorWidgetHost);
  }

  // =========================
  // Grouped stats
  // =========================

  private async fetchGroupedStats(): Promise<void> {
    return fetchGroupedStats(this as unknown as IndicatorWidgetHost);
  }

  private async fetchGroupedFirst(
    featureLayer: __esri.FeatureLayer,
    groupField: string,
    valueField: string,
    _outName: string,
  ): Promise<void> {
    return fetchGroupedFirst(this as unknown as IndicatorWidgetHost, featureLayer, groupField, valueField, _outName);
  }

  // =========================
  // API fetch
  // =========================

  fetchApiData = async () => {
    return fetchApiData(this as unknown as IndicatorWidgetHost);
  };

  // =========================
  // FeatureLayer stats fetch
  // =========================

  fetchData = async (_forceRefresh?: boolean) => {
    return fetchData(this as unknown as IndicatorWidgetHost, _forceRefresh);
  };

  // =========================
  // Formatting + theme
  // =========================

  setupAutoRefresh() {
    return setupAutoRefresh(this as unknown as IndicatorWidgetHost);
  }

  private initializeTheme = (): void => {
    return initializeTheme(this as unknown as IndicatorWidgetHost);
  };

  handleThemeChange = (event: any): void => {
    return handleThemeChange(this as unknown as IndicatorWidgetHost, event);
  };

  // =========================
  // ✅ KEY FIX: do not override CSS theme unless user explicitly sets values
  // =========================

  getCustomStyles = () => {
    return getCustomStyles(this as unknown as IndicatorWidgetHost);
  };

  // =========================
  // UI
  // =========================

  render() {
    return render(this as unknown as IndicatorWidgetHost);
  }
}
