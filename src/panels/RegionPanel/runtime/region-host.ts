import type { JimuMapView } from "jimu-arcgis";
import type { AllWidgetProps, DataSource, React, UseDataSource } from "jimu-core";
import type { AgriRegionState, RegionalDataItem, WidgetSize } from "./widget";

/** Region panel reads only `areaField`; the dashboard passes its whole plain config. */
export interface RegionPanelConfig {
  areaField?: string;
  [key: string]: unknown;
}

export type RegionWidgetProps = AllWidgetProps<RegionPanelConfig>;

/** The use-data-source fields needed to locate a layer (plain or immutable). */
export type RegionUseDataSourceRef = Partial<Pick<UseDataSource, "dataSourceId" | "rootDataSourceId">>;

/** Filter fields AgriRegion broadcasts via `widgetSelectionChanged`. */
export type RegionFilterUpdates = Partial<AgriRegionState["currentFilters"]> & {
  polygonMode?: boolean;
  uniqueid?: string;
};

export interface RegionWidgetHost {
  props: RegionWidgetProps;
  state: AgriRegionState;
  setState: React.Component<RegionWidgetProps, AgriRegionState>["setState"];
  _isMounted: boolean;
  _unbindMasterFilter: () => void;
  handleMasterFilterChange: (event: Event) => void;
  handleDocumentClickForCountFilter: (event: MouseEvent) => void;
  handleAgriV10ThemeChanged: (event: Event) => void;
  setupResizeObserver: () => void;
  syncThemeState: () => void;
  unbindPointerTracking: () => void;
  _resizeObserver: ResizeObserver;
  _countFilterRef: React.RefObject<HTMLDivElement>;
  getCurrentDataLength: () => number;
  getEffectiveDisplayCount: () => number;
  applyDisplayCount: (count: number) => void;
  toggleDisplayCountMenu: () => void;
  _rootRef: React.RefObject<HTMLDivElement>;
  _chartAreaRef: React.RefObject<HTMLDivElement>;
  _chartAreaObserved: boolean;
  normalizeApos: (s: string) => string;
  _pendingBackToViloyatHighlight: string;
  fetchRegionalDataDeduped: () => Promise<void>;
  _selectionNotifyGeneration: number;
  detectAreaField: (layer: __esri.FeatureLayer) => string | null;
  resolveFeatureLayerFromOneUseDataSource: (useDs: RegionUseDataSourceRef | null | undefined, jimuMapView: JimuMapView) => Promise<__esri.FeatureLayer | null>;
  buildWhereForAggregates: (viewOverride?: "viloyat" | "tuman", drillViloyatOverride?: string) => string;
  buildVhScopedWheres: (baseWhere: string) => Promise<string[]>;
  _regionalRequestId: number;
  queryAggregates: (groupField: string, whereOverride?: string, codeField?: string | null) => Promise<RegionalDataItem[]>;
  resolveDisplayCountForData: (dataLength: number) => number;
  _lastRegionalFetchKey: string;
  fetchRegionalData: () => Promise<void>;
  beginSelectionNotify: () => number;
  notifyAgriFilter: (updates: RegionFilterUpdates, generation?: number) => void;
  _cursorTooltipRef: React.RefObject<HTMLDivElement>;
  TOOLTIP_PAD: number;
  TOOLTIP_OFFSET_X: number;
  TOOLTIP_OFFSET_Y: number;
  _pointerTracking: boolean;
  handleGlobalPointerMove: (e: MouseEvent) => void;
  hideCursorTooltip: () => void;
  clampCursorPosition: (clientX: number, clientY: number) => { x: number; y: number; };
  applyTooltipPosition: (x: number, y: number) => void;
  handleRegionSelectionClick: (data: { name?: string; payload?: RegionalDataItem & { name?: string; }; }, _index?: number, _e?: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  handleBarPointerEnter: (data: unknown, _index: number, e: React.MouseEvent<Element, MouseEvent>) => void;
  handleBarPointerMove: (data: unknown, _index: number, e: React.MouseEvent<Element, MouseEvent>) => void;
  getClientPoint: (...args: Array<({ nativeEvent?: MouseEvent; } & Partial<MouseEvent>) | unknown>) => { x: number; y: number; };
  bindPointerTracking: () => void;
  resolveWidgetSize: (width: number) => WidgetSize;
  formatNumber: (value: number | null | undefined, decimals?: number) => string;
  calculateDynamicYAxisWidth: () => number;
  handleWidgetPointerLeave: () => void;
  onDataSourceCreated: (ds: DataSource) => void;
  onActiveViewChange: (jimuMapView: JimuMapView) => Promise<void>;
  navigateBack: () => void;
  getDisplayCountOptions: () => number[];
  handleDisplayCountPillClick: (count: number) => void;
  cycleSortMode: () => void;
  _chartContainerRef: React.RefObject<HTMLDivElement>;
  handleChartSurfaceMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleBarRowClick: (item: RegionalDataItem & { displayName?: string; }) => void;
  handleBarRowPointerEnter: (item: RegionalDataItem & { displayName?: string; }, event: React.MouseEvent<HTMLButtonElement>) => void;
  handleBarRowPointerMove: (_item: RegionalDataItem & { displayName?: string; }, event: React.MouseEvent<HTMLButtonElement>) => void;
  renderCursorTooltipContent: (d: RegionalDataItem & { displayName?: string; }) => React.ReactNode;
}
