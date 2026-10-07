// AgriRegion - Pure UI widget that informs AgriFilter of region selections
// Does NOT filter map directly, only displays data and notifies AgriFilter

import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import {
  DataSource,
  DataSourceComponent,
  DataSourceManager,
  QueriableDataSource,
  React,
} from "jimu-core";
import { Button } from "jimu-ui";
import { TriangleAlert, ChevronLeft } from "lucide-react";
import AgriChartLoader from "../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../shared/agriNoDataLabel";
import { AgriRegionBarChart } from "./AgriRegionBarChart";
import { SortAscIcon, SortDescIcon } from "./SortIcons";
import {
  getQueryableLayer,
} from "../../../gis/feature-layer-data";
import {
  getAgriTableDataLayer,
} from "../../../gis/agri-table-data-source";
import { translateAgriPlaceForDisplay } from "../../../shared/agri-place-display";
import { bindMasterFilter } from "../../../data/agri-filter-bus";
import { getRegionGroupFeaturesCached } from "../../../data/agri-stats-store";
import {
  accumulateRegionGroupFeaturesByCode,
  regionAccumulatorToSortedRows,
  regionOutStatName,
  type RegionGroupAccumulator,
} from "../../../data/agri-region-stats";
import { findAreaFieldNumeric } from "../../../data/agri-area-field";
import {
  detectIsDarkTheme,
  normalizeLanguage,
  resolveInitialLanguage,
} from "../../../shared/agri-language";
import { getDashboardPack, waitForDashboardPackReady } from "../../../store/agri-dashboard-store";
import { matchRegionDashboardPack } from "../../../data/agri-dashboard-pack-match";
import {
  applyRegionRowPercentages,
  mapRegionPackRows,
  resolveRegionAggregateView,
} from "../../../data/agri-dashboard-pack-apply";
import {
  buildRegionAggregatesWhere,
} from "../../../controller/agri-where-builder";
import "./AgriRegion.css";

export type AgriDisplayLanguage = "uz_cyr" | "uz_lat" | "ru" | "en";

export type WidgetSize = "xs" | "sm" | "md" | "lg";



const REGION_DISPLAY_COUNT_OPTIONS = [10, 15, 20] as const;

export interface RegionalDataItem {
  name: string;
  maydon: number;
  percentage?: number;
}

export interface AgriRegionState {
  regionalLoading: boolean;
  regionalError: string | null;
  regionalData: {
    viloyatlar: RegionalDataItem[];
    tumanlar: RegionalDataItem[];
    totalArea: number;
  };
  // Scope from master (lock)
  lockedViloyat: string | null;
  isLocked: boolean;

  // Current filters from AgriFilter
  currentFilters: {
    yil: string;
    viloyat: string;
    tuman: string;
    turi: string;
    turlar: string[];
    vh: string;
    vhUniqueids: string[] | null;
    /** When VH was selected before ekin turi, charts stay VH-scoped. */
    filterPieByVh: boolean;
  };

  // Navigation
  currentView: "viloyat" | "tuman";
  selectedViloyatForDrillDown: string | null;
  selectedRegion: string | null;

  // UI
  displayCount: number;
  displayCountMenuOpen: boolean;
  /** Default is highest value first; icons cycle through the other sorts. */
  sortMode: "value_desc" | "value_asc";
  isDarkTheme: boolean;
  widgetSize: WidgetSize;
  containerWidth: number;
  chartAreaHeight: number;

  // Map/DS
  activeMapView?: JimuMapView;
  featureLayer?: __esri.FeatureLayer;
  featureLayers: __esri.FeatureLayer[];
  dataSource?: QueriableDataSource;

  areaField: string | null;
  statMode: "sum" | "count";

  connectionStatus: "idle" | "connecting" | "connected" | "failed";
  language: "uz_cyr" | "uz_lat" | "ru" | "en";

  cursorTooltip: {
    visible: boolean;
    data: (RegionalDataItem & { displayName?: string }) | null;
  };
}

import { regionLog as regionLogFn } from "./region-log";
import {
  componentDidMount,
  componentWillUnmount,
  handleDocumentClickForCountFilter,
  toggleDisplayCountMenu,
  getCurrentDataLength,
  getEffectiveDisplayCount,
  getDisplayCountOptions,
  resolveDisplayCountForData,
  handleDisplayCountPillClick,
  applyDisplayCount,
  cycleSortMode,
  syncThemeState,
  handleAgriV10ThemeChanged,
  resolveWidgetSize,
  setupResizeObserver,
  componentDidUpdate,
  handleMasterFilterChange,
  notifyAgriFilter,
  beginSelectionNotify,
  onActiveViewChange,
  resolveFeatureLayerFromUseDataSource,
  resolveFeatureLayerFromOneUseDataSource,
  splitLabelTwoLines,
  calculateDynamicYAxisWidth,
  resolveFeatureLayersFromUseDataSources,
  detectAreaField,
  onDataSourceCreated,
  normalizeApos,
  buildWhereForAggregates,
  buildVhScopedWheres,
  queryAggregates,
  fetchRegionalData,
  fetchRegionalDataDeduped,
  handleRegionSelectionClick,
  navigateBack,
  formatNumber,
  clampCursorPosition,
  getClientPoint,
  applyTooltipPosition,
  bindPointerTracking,
  unbindPointerTracking,
  handleGlobalPointerMove,
  hideCursorTooltip,
  handleWidgetPointerLeave,
  handleBarRowClick,
  handleBarRowPointerEnter,
  handleBarRowPointerMove,
  handleBarPointerEnter,
  handleBarPointerMove,
  handleChartSurfaceMove,
  renderCursorTooltipContent,
} from "./components/region-handlers";
import {
  render,
} from "./components/render-panel";
import type {
  RegionFilterUpdates,
  RegionUseDataSourceRef,
  RegionWidgetHost,
  RegionWidgetProps,
} from "./region-host";
export default class AgriRegion extends React.PureComponent<
  RegionWidgetProps,
  AgriRegionState
> implements RegionWidgetHost {
  /** Tuman select debug — visible when __AGRO_V5_TUMAN_DEBUG !== false (default ON). */
  static regionLog(
    phase: string,
    detail?: Record<string, unknown>,
  ): void {
    regionLogFn(phase, detail);
  }

  _isMounted = false;
  _unbindMasterFilter: (() => void) | null = null;
  _rootRef = React.createRef<HTMLDivElement>();
  _countFilterRef = React.createRef<HTMLDivElement>();
  _chartAreaRef = React.createRef<HTMLDivElement>();
  _chartContainerRef = React.createRef<HTMLDivElement>();
  _cursorTooltipRef = React.createRef<HTMLDivElement>();
  _pointerTracking = false;
  readonly TOOLTIP_PAD = 10;
  readonly TOOLTIP_OFFSET_X = 16;
  readonly TOOLTIP_OFFSET_Y = 14;
  _resizeObserver: ResizeObserver | null = null;
  _chartAreaObserved = false;
  _themeObserver: MutationObserver | null = null;
  /**
   * When the user navigates back from a selected tuman, we want to show the VILOYAT list
   * with that viloyat highlighted, while still keeping the map filtered/zoomed to that viloyat.
   * Master filter echoes keep carrying viloyat=<name>; without a sticky highlight mode they
   * would immediately auto-drill back into the tuman list and "Back" would appear broken.
   */
  _pendingBackToViloyatHighlight: string | null = null;
  /**
   * Bumps on every user-driven geography notify so a delayed async
   * callback (fetchRegionalDataDeduped → notifyAgriFilter) cannot
   * overwrite a newer viloyat/tuman selection.
   */
  _selectionNotifyGeneration = 0;
  /** Latest regional aggregation request; prevents stale responses/UI states. */
  _regionalRequestId = 0;

  REGIONAL_COLOR = "#00D2FF";

  constructor(props: RegionWidgetProps) {
    super(props);
    const initialLanguage = resolveInitialLanguage();

    this.state = {
      regionalLoading: false,
      regionalError: null,
      regionalData: { viloyatlar: [], tumanlar: [], totalArea: 0 },
      lockedViloyat: null,
      isLocked: false,

      currentFilters: {
        yil: "",
        viloyat: "",
        tuman: "",
        turi: "",
        turlar: [],
        vh: "",
        vhUniqueids: null,
        filterPieByVh: false,
      },

      currentView: "viloyat",
      selectedViloyatForDrillDown: null,
      selectedRegion: null,

      displayCount: 15,
      displayCountMenuOpen: false,
      sortMode: "value_desc",
      isDarkTheme: detectIsDarkTheme(),
      widgetSize: "lg",
      containerWidth: 0,
      chartAreaHeight: 0,

      activeMapView: undefined,
      featureLayer: undefined,
      featureLayers: [],
      dataSource: undefined,

      areaField: this.props.config?.areaField || null,
      statMode: this.props.config?.areaField ? "sum" : "count",

      connectionStatus: "idle",
      language: initialLanguage,

      cursorTooltip: {
        visible: false,
        data: null,
      },
    };
  }

  componentDidMount() {
    return componentDidMount(this);
  }

  componentWillUnmount() {
    return componentWillUnmount(this);
  }

  handleDocumentClickForCountFilter = (event: MouseEvent): void => {
    return handleDocumentClickForCountFilter(this, event);
  };

  toggleDisplayCountMenu = (): void => {
    return toggleDisplayCountMenu(this);
  };

  getCurrentDataLength = (): number => {
    return getCurrentDataLength(this);
  };

  getEffectiveDisplayCount = (): number => {
    return getEffectiveDisplayCount(this);
  };

  getDisplayCountOptions = (): number[] => {
    return getDisplayCountOptions(this);
  };

  resolveDisplayCountForData = (dataLength: number): number => {
    return resolveDisplayCountForData(this, dataLength);
  };

  handleDisplayCountPillClick = (count: number): void => {
    return handleDisplayCountPillClick(this, count);
  };

  applyDisplayCount = (count: number): void => {
    return applyDisplayCount(this, count);
  };

  cycleSortMode = (): void => {
    return cycleSortMode(this);
  };

  syncThemeState = () => {
    return syncThemeState(this);
  };

  handleAgriV10ThemeChanged = (event: Event): void => {
    return handleAgriV10ThemeChanged(this, event);
  };

  resolveWidgetSize = (width: number): WidgetSize => {
    return resolveWidgetSize(this, width);
  };

  setupResizeObserver = () => {
    return setupResizeObserver(this);
  };

  componentDidUpdate(): void {
    return componentDidUpdate(this);
  }

  /* ---------------------- Master Filter Listener ---------------------- */

  handleMasterFilterChange = (event: Event) => {
    return handleMasterFilterChange(this, event);
  };

  /* ---------------------- Notify AgriFilter ---------------------- */

  notifyAgriFilter = (
    updates: RegionFilterUpdates,
    generation?: number,
  ) => {
    return notifyAgriFilter(this, updates, generation);
  };

  beginSelectionNotify = (): number => {
    return beginSelectionNotify(this);
  };

  /* ---------------------- Map Connection ---------------------- */

  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this, jimuMapView);
  };

  resolveFeatureLayerFromUseDataSource = async (
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer | null> => {
    return resolveFeatureLayerFromUseDataSource(this, jimuMapView);
  };

  resolveFeatureLayerFromOneUseDataSource = async (
    useDs: RegionUseDataSourceRef | null | undefined,
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer | null> => {
    return resolveFeatureLayerFromOneUseDataSource(this, useDs, jimuMapView);
  };

  splitLabelTwoLines = (label: string): [string, string?] => {
    return splitLabelTwoLines(this, label);
  };

  calculateDynamicYAxisWidth = (): number => {
    return calculateDynamicYAxisWidth(this);
  };

  resolveFeatureLayersFromUseDataSources = async (
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer[]> => {
    return resolveFeatureLayersFromUseDataSources(this, jimuMapView);
  };

  detectAreaField = (layer: __esri.FeatureLayer): string | null =>
    detectAreaField(this, layer);

  onDataSourceCreated = (ds: DataSource) => {
    return onDataSourceCreated(this, ds);
  };

  /* ---------------------- Data Fetch ---------------------- */

  normalizeApos = (s: string) =>
    normalizeApos(this, s);

  buildWhereForAggregates(
    viewOverride?: "viloyat" | "tuman",
    drillViloyatOverride?: string,
  ): string {
    return buildWhereForAggregates(this, viewOverride, drillViloyatOverride);
  }

  buildVhScopedWheres = async (
    baseWhere: string,
  ): Promise<string[]> => {
    return buildVhScopedWheres(this, baseWhere);
  };

  queryAggregates = async (
    groupField: string,
    whereOverride?: string,
    /** `region` / `district` — bars are identified by this code, not the name. */
    codeField?: string | null,
  ): Promise<RegionalDataItem[]> => {
    return queryAggregates(this, groupField, whereOverride, codeField);
  };

  fetchRegionalData = async () => {
    return fetchRegionalData(this);
  };

  _lastRegionalFetchKey = "";

  fetchRegionalDataDeduped = async () => {
    return fetchRegionalDataDeduped(this);
  };

  /* ---------------------- User Interactions ---------------------- */

  handleRegionSelectionClick = (
    data: { name?: string; payload?: RegionalDataItem & { name?: string } },
    _index?: number,
    _e?: React.MouseEvent<SVGPathElement, MouseEvent>,
  ): void => {
    return handleRegionSelectionClick(this, data, _index, _e);
  };

  navigateBack = () => {
    return navigateBack(this);
  };

  /* ---------------------- Render ---------------------- */

  formatNumber = (value: number | null | undefined, decimals = 0) => {
    return formatNumber(this, value, decimals);
  };

  clampCursorPosition = (
    clientX: number,
    clientY: number,
  ): { x: number; y: number } => {
    return clampCursorPosition(this, clientX, clientY);
  };

  getClientPoint = (
    ...args: Array<{ nativeEvent?: MouseEvent } & Partial<MouseEvent> | unknown>
  ): { x: number; y: number } => {
    return getClientPoint(this, args);
  };

  applyTooltipPosition = (x: number, y: number): void => {
    return applyTooltipPosition(this, x, y);
  };

  bindPointerTracking = (): void => {
    return bindPointerTracking(this);
  };

  unbindPointerTracking = (): void => {
    return unbindPointerTracking(this);
  };

  handleGlobalPointerMove = (e: MouseEvent): void => {
    return handleGlobalPointerMove(this, e);
  };

  hideCursorTooltip = (): void => {
    return hideCursorTooltip(this);
  };

  handleWidgetPointerLeave = (): void => {
    return handleWidgetPointerLeave(this);
  };

  handleBarRowClick = (
    item: RegionalDataItem & { displayName?: string },
  ): void => {
    return handleBarRowClick(this, item);
  };

  handleBarRowPointerEnter = (
    item: RegionalDataItem & { displayName?: string },
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return handleBarRowPointerEnter(this, item, event);
  };

  handleBarRowPointerMove = (
    _item: RegionalDataItem & { displayName?: string },
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return handleBarRowPointerMove(this, _item, event);
  };

  handleBarPointerEnter = (
    data: unknown,
    _index: number,
    e: React.MouseEvent<Element, MouseEvent>,
  ): void => {
    return handleBarPointerEnter(this, data, _index, e);
  };

  handleBarPointerMove = (
    data: unknown,
    _index: number,
    e: React.MouseEvent<Element, MouseEvent>,
  ): void => {
    return handleBarPointerMove(this, data, _index, e);
  };

  handleChartSurfaceMove = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    return handleChartSurfaceMove(this, e);
  };

  renderCursorTooltipContent = (
    d: RegionalDataItem & { displayName?: string },
  ): React.ReactNode => {
    return renderCursorTooltipContent(this, d);
  };

  render() {
    return render(this);
  }
}
