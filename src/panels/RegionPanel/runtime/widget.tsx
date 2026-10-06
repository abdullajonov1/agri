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
> {
  /** Tuman select debug — visible when __AGRO_V5_TUMAN_DEBUG !== false (default ON). */
  private static regionLog(
    phase: string,
    detail?: Record<string, unknown>,
  ): void {
    regionLogFn(phase, detail);
  }

  _isMounted = false;
  private _unbindMasterFilter: (() => void) | null = null;
  private   _rootRef = React.createRef<HTMLDivElement>();
  private _countFilterRef = React.createRef<HTMLDivElement>();
  private _chartAreaRef = React.createRef<HTMLDivElement>();
  private _chartContainerRef = React.createRef<HTMLDivElement>();
  private _cursorTooltipRef = React.createRef<HTMLDivElement>();
  private _pointerTracking = false;
  private readonly TOOLTIP_PAD = 10;
  private readonly TOOLTIP_OFFSET_X = 16;
  private readonly TOOLTIP_OFFSET_Y = 14;
  private _resizeObserver: ResizeObserver | null = null;
  private _chartAreaObserved = false;
  private _themeObserver: MutationObserver | null = null;
  /**
   * When the user navigates back from a selected tuman, we want to show the VILOYAT list
   * with that viloyat highlighted, while still keeping the map filtered/zoomed to that viloyat.
   * Master filter echoes keep carrying viloyat=<name>; without a sticky highlight mode they
   * would immediately auto-drill back into the tuman list and "Back" would appear broken.
   */
  private _pendingBackToViloyatHighlight: string | null = null;
  /**
   * Bumps on every user-driven geography notify so a delayed async
   * callback (fetchRegionalDataDeduped → notifyAgriFilter) cannot
   * overwrite a newer viloyat/tuman selection.
   */
  private _selectionNotifyGeneration = 0;
  /** Latest regional aggregation request; prevents stale responses/UI states. */
  private _regionalRequestId = 0;

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
    return componentDidMount(this as unknown as RegionWidgetHost);
  }

  componentWillUnmount() {
    return componentWillUnmount(this as unknown as RegionWidgetHost);
  }

  private handleDocumentClickForCountFilter = (event: MouseEvent): void => {
    return handleDocumentClickForCountFilter(this as unknown as RegionWidgetHost, event);
  };

  private toggleDisplayCountMenu = (): void => {
    return toggleDisplayCountMenu(this as unknown as RegionWidgetHost);
  };

  private getCurrentDataLength = (): number => {
    return getCurrentDataLength(this as unknown as RegionWidgetHost);
  };

  private getEffectiveDisplayCount = (): number => {
    return getEffectiveDisplayCount(this as unknown as RegionWidgetHost);
  };

  private getDisplayCountOptions = (): number[] => {
    return getDisplayCountOptions(this as unknown as RegionWidgetHost);
  };

  private resolveDisplayCountForData = (dataLength: number): number => {
    return resolveDisplayCountForData(this as unknown as RegionWidgetHost, dataLength);
  };

  private handleDisplayCountPillClick = (count: number): void => {
    return handleDisplayCountPillClick(this as unknown as RegionWidgetHost, count);
  };

  private applyDisplayCount = (count: number): void => {
    return applyDisplayCount(this as unknown as RegionWidgetHost, count);
  };

  private cycleSortMode = (): void => {
    return cycleSortMode(this as unknown as RegionWidgetHost);
  };

  private syncThemeState = () => {
    return syncThemeState(this as unknown as RegionWidgetHost);
  };

  private handleAgriV10ThemeChanged = (event: Event): void => {
    return handleAgriV10ThemeChanged(this as unknown as RegionWidgetHost, event);
  };

  private resolveWidgetSize = (width: number): WidgetSize => {
    return resolveWidgetSize(this as unknown as RegionWidgetHost, width);
  };

  private setupResizeObserver = () => {
    return setupResizeObserver(this as unknown as RegionWidgetHost);
  };

  componentDidUpdate(): void {
    return componentDidUpdate(this as unknown as RegionWidgetHost);
  }

  /* ---------------------- Master Filter Listener ---------------------- */

  private handleMasterFilterChange = (event: Event) => {
    return handleMasterFilterChange(this as unknown as RegionWidgetHost, event);
  };

  /* ---------------------- Notify AgriFilter ---------------------- */

  private notifyAgriFilter = (
    updates: RegionFilterUpdates,
    generation?: number,
  ) => {
    return notifyAgriFilter(this as unknown as RegionWidgetHost, updates, generation);
  };

  private beginSelectionNotify = (): number => {
    return beginSelectionNotify(this as unknown as RegionWidgetHost);
  };

  /* ---------------------- Map Connection ---------------------- */

  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    return onActiveViewChange(this as unknown as RegionWidgetHost, jimuMapView);
  };

  private resolveFeatureLayerFromUseDataSource = async (
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer | null> => {
    return resolveFeatureLayerFromUseDataSource(this as unknown as RegionWidgetHost, jimuMapView);
  };

  private resolveFeatureLayerFromOneUseDataSource = async (
    useDs: RegionUseDataSourceRef | null | undefined,
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer | null> => {
    return resolveFeatureLayerFromOneUseDataSource(this as unknown as RegionWidgetHost, useDs, jimuMapView);
  };

  private splitLabelTwoLines = (label: string): [string, string?] => {
    return splitLabelTwoLines(this as unknown as RegionWidgetHost, label);
  };

  private calculateDynamicYAxisWidth = (): number => {
    return calculateDynamicYAxisWidth(this as unknown as RegionWidgetHost);
  };

  private resolveFeatureLayersFromUseDataSources = async (
    jimuMapView: JimuMapView,
  ): Promise<__esri.FeatureLayer[]> => {
    return resolveFeatureLayersFromUseDataSources(this as unknown as RegionWidgetHost, jimuMapView);
  };

  private detectAreaField = (layer: __esri.FeatureLayer): string | null =>
    detectAreaField(this as unknown as RegionWidgetHost, layer);

  onDataSourceCreated = (ds: DataSource) => {
    return onDataSourceCreated(this as unknown as RegionWidgetHost, ds);
  };

  /* ---------------------- Data Fetch ---------------------- */

  private normalizeApos = (s: string) =>
    normalizeApos(this as unknown as RegionWidgetHost, s);

  private buildWhereForAggregates(
    viewOverride?: "viloyat" | "tuman",
    drillViloyatOverride?: string,
  ): string {
    return buildWhereForAggregates(this as unknown as RegionWidgetHost, viewOverride, drillViloyatOverride);
  }

  private buildVhScopedWheres = async (
    baseWhere: string,
  ): Promise<string[]> => {
    return buildVhScopedWheres(this as unknown as RegionWidgetHost, baseWhere);
  };

  private queryAggregates = async (
    groupField: string,
    whereOverride?: string,
    /** `region` / `district` — bars are identified by this code, not the name. */
    codeField?: string | null,
  ): Promise<RegionalDataItem[]> => {
    return queryAggregates(this as unknown as RegionWidgetHost, groupField, whereOverride, codeField);
  };

  private fetchRegionalData = async () => {
    return fetchRegionalData(this as unknown as RegionWidgetHost);
  };

  private _lastRegionalFetchKey = "";

  private fetchRegionalDataDeduped = async () => {
    return fetchRegionalDataDeduped(this as unknown as RegionWidgetHost);
  };

  /* ---------------------- User Interactions ---------------------- */

  private handleRegionSelectionClick = (
    data: { name?: string; payload?: RegionalDataItem & { name?: string } },
    _index?: number,
    _e?: React.MouseEvent<SVGPathElement, MouseEvent>,
  ): void => {
    return handleRegionSelectionClick(this as unknown as RegionWidgetHost, data, _index, _e);
  };

  private navigateBack = () => {
    return navigateBack(this as unknown as RegionWidgetHost);
  };

  /* ---------------------- Render ---------------------- */

  private formatNumber = (value: number | null | undefined, decimals = 0) => {
    return formatNumber(this as unknown as RegionWidgetHost, value, decimals);
  };

  private clampCursorPosition = (
    clientX: number,
    clientY: number,
  ): { x: number; y: number } => {
    return clampCursorPosition(this as unknown as RegionWidgetHost, clientX, clientY);
  };

  private getClientPoint = (
    ...args: Array<{ nativeEvent?: MouseEvent } & Partial<MouseEvent> | unknown>
  ): { x: number; y: number } => {
    return getClientPoint(this as unknown as RegionWidgetHost, args);
  };

  private applyTooltipPosition = (x: number, y: number): void => {
    return applyTooltipPosition(this as unknown as RegionWidgetHost, x, y);
  };

  private bindPointerTracking = (): void => {
    return bindPointerTracking(this as unknown as RegionWidgetHost);
  };

  private unbindPointerTracking = (): void => {
    return unbindPointerTracking(this as unknown as RegionWidgetHost);
  };

  private handleGlobalPointerMove = (e: MouseEvent): void => {
    return handleGlobalPointerMove(this as unknown as RegionWidgetHost, e);
  };

  private hideCursorTooltip = (): void => {
    return hideCursorTooltip(this as unknown as RegionWidgetHost);
  };

  private handleWidgetPointerLeave = (): void => {
    return handleWidgetPointerLeave(this as unknown as RegionWidgetHost);
  };

  private handleBarRowClick = (
    item: RegionalDataItem & { displayName?: string },
  ): void => {
    return handleBarRowClick(this as unknown as RegionWidgetHost, item);
  };

  private handleBarRowPointerEnter = (
    item: RegionalDataItem & { displayName?: string },
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return handleBarRowPointerEnter(this as unknown as RegionWidgetHost, item, event);
  };

  private handleBarRowPointerMove = (
    _item: RegionalDataItem & { displayName?: string },
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return handleBarRowPointerMove(this as unknown as RegionWidgetHost, _item, event);
  };

  private handleBarPointerEnter = (
    data: unknown,
    _index: number,
    e: React.MouseEvent<SVGPathElement, MouseEvent>,
  ): void => {
    return handleBarPointerEnter(this as unknown as RegionWidgetHost, data, _index, e);
  };

  private handleBarPointerMove = (
    data: unknown,
    _index: number,
    e: React.MouseEvent<SVGPathElement, MouseEvent>,
  ): void => {
    return handleBarPointerMove(this as unknown as RegionWidgetHost, data, _index, e);
  };

  private handleChartSurfaceMove = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    return handleChartSurfaceMove(this as unknown as RegionWidgetHost, e);
  };

  private renderCursorTooltipContent = (
    d: RegionalDataItem & { displayName?: string },
  ): React.ReactNode => {
    return renderCursorTooltipContent(this as unknown as RegionWidgetHost, d);
  };

  render() {
    return render(this as unknown as RegionWidgetHost);
  }
}
