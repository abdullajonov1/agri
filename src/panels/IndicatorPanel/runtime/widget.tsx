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
import type { DebouncedFunc } from "lodash";
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
  iconImage?: unknown;

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

  /** Card sits on top of the map (transparent chrome). */
  mapOverlayMode?: boolean;
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
  AllWidgetProps<IndicatorConfig>,
  VegetationStatsWidgetState
> implements IndicatorWidgetHost {
  throttledFetchData: DebouncedFunc<(forceRefresh?: boolean) => Promise<void>>;
  MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;
  initializationTimer: ReturnType<typeof setTimeout> | null = null;
  _mapConnectionPromise: Promise<void> | null = null;
  refreshTimer: ReturnType<typeof setInterval> | null = null;
  _abortController: AbortController | null = null;
  _isMounted = false;
  _requestId = 0;
  _unbindMasterFilter: (() => void) | null = null;
  /** Timestamp of the last masterFilterChanged event — used to skip auto-refresh
   * when a filter change already triggered refreshData() recently. */
  _lastFilterEventMs = 0;
  _onReset: () => void;
  _isResetting = false;
  _lastMasterFilterTs = 0;
  _lastMasterFilterBroadcastGeneration = 0;
  _canonicalFeatureLayer?: __esri.FeatureLayer;

  // Viloyat routing cache (viloyat normalized key -> index in `this.state.featureLayers`)
  _viloyatKeyToLayerIndex: Record<string, number> = {};
  _containerRef = React.createRef<HTMLDivElement>();
  _resizeObserver: ResizeObserver | null = null;

  labelNoValue = (): string => {
    return labelNoValue(this);
  };

  translateKnownError = (msg: string): string => {
    return translateKnownError(this, msg);
  };

  handleLanguageChange = (event: Event) => {
    return handleLanguageChange(this, event);
  };

  constructor(props: AllWidgetProps<IndicatorConfig>) {
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

  normalizeUzbekForApi = (s: string): string => {
    return normalizeUzbekForApi(this, s);
  };

  getFieldType = (name: string): string | null => {
    return getFieldType(this, name);
  };

  nz = (field: string) => {
    return nz(this, field);
  };

  makeApostropheVariants = (s: string): string[] => {
    return makeApostropheVariants(this, s);
  };

  makeDistrictSuffixVariants = (raw: string): string[] => {
    return makeDistrictSuffixVariants(this, raw);
  };

  makeRegionSuffixVariants = (raw: string): string[] => {
    return makeRegionSuffixVariants(this, raw);
  };

  normalizeTurlar(raw: unknown, fallback = ""): string[] {
    return normalizeTurlar(this, raw, fallback);
  }

  buildTurlarClause(field: string, values: string[]): string {
    return buildTurlarClause(this, field, values);
  }
  componentDidMount() {
    return componentDidMount(this);
  }

  shouldFetchForViloyat(): boolean {
    return shouldFetchForViloyat(this);
  }

  handleMasterFilterChanged = (event: Event) => {
    return handleMasterFilterChanged(this, event);
  };

  /**
   * Expanded (id-style adapted) copy of state.vhUniqueids used for the
   * Agri_table_data join. `_vhJoinSource` keeps the exact array reference the
   * expansion was computed from so a stale expansion is never applied.
   */
  _vhJoinSource: string[] | null = null;
  _vhJoinExpanded: string[] | null = null;

  prepareVhJoinIds = async (ids: string[] | null): Promise<void> => {
    return prepareVhJoinIds(this, ids);
  };

  componentWillUnmount() {
    return componentWillUnmount(this);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<IndicatorConfig>,
    prevState: VegetationStatsWidgetState,
  ) {
    return componentDidUpdate(this, prevProps, prevState);
  }

  // =========================
  // External event handlers
  // =========================

  handleExternalCategory = async (event: CustomEvent) => {
    return handleExternalCategory(this, event);
  };

  handleConstructionYearChanged = (event: Event) => {
    return handleConstructionYearChanged(this, event);
  };

  handleRegionChange = (event: Event): void => {
    return handleRegionChange(this, event);
  };

  handleYilChange = (event: Event): void => {
    return handleYilChange(this, event);
  };

  handleWaterSupplyFilterChange = (event: CustomEvent) => {
    return handleWaterSupplyFilterChange(this, event);
  };

  handleCategorySelection = (event: CustomEvent) => {
    return handleCategorySelection(this, event);
  };

  handleKadastrFiltersChanged = (event: Event) => {
    return handleKadastrFiltersChanged(this, event);
  };

  handleKadastrFiltersReset = () =>
    handleKadastrFiltersReset(this);

  handleVegetationStatusChange = (event: CustomEvent) => {
    return handleVegetationStatusChange(this, event);
  };

  handleCropTypeChange = (event: CustomEvent) => {
    return handleCropTypeChange(this, event);
  };

  refreshData = () => {
    return refreshData(this);
  };

  // =========================
  // URL sync
  // =========================

  readFiltersFromUrl(): void {
    return readFiltersFromUrl(this);
  }

  // =========================
  // Map + DataSource
  // =========================

  ensureInitialization = () => {
    return ensureInitialization(this);
  };

  retryMapConnection() {
    return retryMapConnection(this);
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this, jimuMapView);
  };

  makeViloyatKeyForRouting = (viloyat: string): string => {
    return makeViloyatKeyForRouting(this, viloyat);
  };

  getFeatureLayerForViloyat = (
    viloyat: string,
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getFeatureLayerForViloyat(this, viloyat, layersOverride);
  };

  isRepublicLayer = (layer?: __esri.FeatureLayer): boolean => {
    return isRepublicLayer(this, layer);
  };

  getDefaultFeatureLayer = (
    layersOverride?: __esri.FeatureLayer[],
  ): __esri.FeatureLayer | undefined => {
    return getDefaultFeatureLayer(this, layersOverride);
  };

  buildViloyatLayerIndex = async (
    layers: __esri.FeatureLayer[],
  ): Promise<void> => {
    return buildViloyatLayerIndex(this, layers);
  };

  initializeMapConnection = (jimuMapView: JimuMapView): Promise<void> => {
    return initializeMapConnection(this, jimuMapView);
  };

  initializeMapConnectionOnce = async (jimuMapView: JimuMapView) => {
    return initializeMapConnectionOnce(this, jimuMapView);
  };

  onDataSourceCreated = (dataSource: DataSource) => {
    return onDataSourceCreated(this, dataSource);
  };

  onDataSourceInfoChange = (info: unknown) => {
    return onDataSourceInfoChange(this, info);
  };

  // =========================
  // WHERE builder (FeatureLayer)
  // =========================

  buildWhereClause(includeViloyat = true): string {
    return buildWhereClause(this, includeViloyat);
  }

  // =========================
  // API url builder
  // =========================

  buildApiUrl(): string {
    return buildApiUrl(this);
  }

  // =========================
  // Grouped stats
  // =========================

  async fetchGroupedStats(): Promise<void> {
    return fetchGroupedStats(this);
  }

  async fetchGroupedFirst(
    featureLayer: __esri.FeatureLayer,
    groupField: string,
    valueField: string,
    _outName: string,
  ): Promise<void> {
    return fetchGroupedFirst(this, featureLayer, groupField, valueField, _outName);
  }

  // =========================
  // API fetch
  // =========================

  fetchApiData = async () => {
    return fetchApiData(this);
  };

  // =========================
  // FeatureLayer stats fetch
  // =========================

  fetchData = async (_forceRefresh?: boolean) => {
    return fetchData(this, _forceRefresh);
  };

  // =========================
  // Formatting + theme
  // =========================

  setupAutoRefresh() {
    return setupAutoRefresh(this);
  }

  initializeTheme = (): void => {
    return initializeTheme(this);
  };

  handleThemeChange = (event: Event): void => {
    return handleThemeChange(this, event);
  };

  // =========================
  // ✅ KEY FIX: do not override CSS theme unless user explicitly sets values
  // =========================

  getCustomStyles = () => {
    return getCustomStyles(this);
  };

  // =========================
  // UI
  // =========================

  render() {
    return render(this);
  }
}
