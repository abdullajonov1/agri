/** @jsx jsx */
/** @jsxFrag React.Fragment */
import {
  AppMode,
  Immutable,
  jsx,
  React,
  ReactDOM,
  getAppStore,
  type AllWidgetProps,
} from "jimu-core";
import LocalizationPanel from "../filter/LocalizationPanel";
import RegionPanel from "../panels/RegionPanel";
import PiePanel from "../panels/PiePanel";
import BarPanel from "../panels/BarPanel";
import DateIndexPanel from "../panels/DateIndexPanel/runtime/widget";
import PopupPanel from "../panels/PopupPanel/runtime/widget";
import GraffPanel from "../panels/GraffPanel";
import { agriNoDataLabel } from "../shared/agriNoDataLabel";
import AgriChartLoader from "../shared/AgriChartLoader";
import { TriangleAlert } from "lucide-react";
import EmbeddedAgriMap from "./embedded-agri-map";
import AgriMapIndicatorDrawer, {
  type IndicatorAnimPhase,
  type IndicatorChildPropsSet,
} from "./AgriMapIndicatorDrawer";
import type { JimuMapView } from "jimu-arcgis";
import {
  type AgriPopupConfig,
  type IMConfig,
  type IndicatorChildConfig,
} from "../config";
// Panel CSS before dashboard so agri-dashboard.css layout rules win (donut stays circular).
import "../panels/PiePanel/runtime/AgriPie.css";
import "../panels/BarPanel/runtime/AgriBar.css";
import "../panels/PopupPanel/runtime/AgriPolygon.css";
import "../panels/GraffPanel/runtime/AgriGraff.css";
import "./agri-dashboard.css";
import { setAccessConfig } from "../shared/agri-access-config";
import { setAgriServiceUrls } from "../shared/agri-service-urls";
import { clearDashboardCaches } from "../data/agri-dashboard-cache-clear";
import {
  MAP_VIEW_WATCH_INTERVAL_MS,
  MAP_VIEW_WATCH_MAX_ATTEMPTS,
  isMapViewReady,
  resolveJimuMapView,
} from "../shared/map-connection-service";
import { agroV5Log } from "../gis/agri-debug-log";



export type ChildSuffix =
  | "localization"
  | "region"
  | "indicator"
  | "indicator-yield"
  | "indicator-unused-land"
  | "indicator-reserve-land"
  | "date-index"
  | "pie"
  | "graff"
  | "bar"
  | "popup";

export interface AgriDashboardState {
  indicatorsOpen: boolean;
  indicatorsAnimPhase: IndicatorAnimPhase;
  mapLoading: boolean;
  /** Crop renderer / region-layer prepare — show map spinner until colors ready. */
  mapSurfaceLoading: boolean;
  mapNoData: boolean;
  mapError: string;
  /** True while one of the embedded dashboard data widgets is pending. */
  dashboardLoading: boolean;
  mapPopupOpen: boolean;
  /** When true and popup is open, NDVI card docks left of the pinned popup. */
  mapPopupPinned: boolean;
}

import {
  syncConfigSideEffects,
  isBuilderDesignMode,
  getUiLanguage,
  componentDidMount,
  componentDidUpdate,
  toggleIndicatorsDrawer,
  componentWillUnmount,
  handleMapSurfaceLoading,
  handleMapNoData,
  handleMapPopupVisibility,
  createPortalHost,
  ensurePortalHost,
  removePortalHost,
  bringPortalHostToFront,
  toPlainConfig,
  toPlainPopup,
  getIndicatorConfig,
  getPopupConfig,
  childProps,
  getStableIndicatorChildProps,
  getLeftPanelWidth,
  getRowFrValues,
  getActiveMapWidgetId,
  getActiveJimuMapView,
  detachMapLoadingWatchers,
  setMapLoading,
  getMapLoadingState,
  updateMapLoadingState,
  attachMapLoadingWatchers,
  scheduleMapLoadingWatchers,
  getDashboardLoadingState,
  updateDashboardLoadingState,
  onWindowResize,
  ensureLayoutObservers,
  setupMapSlotObserver,
  scheduleMapSlotLayout,
  findSharedLayoutSurface,
  readDashboardCssPx,
  applyIndicatorOverlayBounds,
  applyDateIndexOverlayBounds,
  syncIndicatorOverlayLayout,
  clearOverlayLayout,
  clearIndicatorOverlayLayout,
} from "./components/dashboard-handlers";
import {
  render,
} from "./components/render-panel";
import type { DashboardChildProps, DashboardWidgetHost } from "./dashboard-host";
export default class AgriDashboard extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  AgriDashboardState
> implements DashboardWidgetHost {
dashboardRootRef = React.createRef<HTMLDivElement>();
mapSlotRef = React.createRef<HTMLElement>();
indicatorOverlayRef = React.createRef<HTMLDivElement>();
indicatorPanelRef = React.createRef<HTMLDivElement>();
dateIndexOverlayRef = React.createRef<HTMLDivElement>();
portalHost: HTMLElement | null = null;
portalReady = false;
dashboardResizeObserver: ResizeObserver | null = null;
mapLayoutRaf = 0;
layoutObserversReady = false;
resizeListenerAttached = false;
lastIndicatorToggleAt = 0;
indicatorAnimTimer: ReturnType<typeof setTimeout> | null = null;
mapIndicatorHost: HTMLElement | null = null;
indicatorChildPropsCache:
    | (IndicatorChildPropsSet & { signature: string })
    | null = null;
  /** Last map-slot CSS size that triggered view.resize — skip no-op resizes. */
lastMapSlotSize = { w: -1, h: -1 };
mapReadyWatchHandle: { remove?: () => void } | null = null;
mapUpdatingWatchHandle: { remove?: () => void } | null = null;
mapLoadingRetryTimer: ReturnType<typeof setTimeout> | null = null;
mapSurfaceLoadingSafetyTimer: ReturnType<typeof setTimeout> | null =
    null;
watchedMapView: unknown = null;
embeddedMapReady = false;
mapViewWatchAttempts = 0;
lastMapWatchWidgetId = "";

  state: AgriDashboardState = {
    indicatorsOpen: true,
    indicatorsAnimPhase: "expanded",
    mapLoading: true,
    mapSurfaceLoading: false,
    mapNoData: false,
    mapError: "",
    dashboardLoading: false,
    mapPopupOpen: false,
    mapPopupPinned: false,
  };

  constructor(props: AllWidgetProps<IMConfig>) {
    super(props);
    // Apply before first child render/mount — must not live in render().
    this.syncConfigSideEffects();
  }

syncConfigSideEffects = (): void => {
    return syncConfigSideEffects(this);
  };

isBuilderDesignMode(): boolean {
    return isBuilderDesignMode(this);
  }

getUiLanguage(): string {
    return getUiLanguage(this);
  }

  componentDidMount(): void {
    return componentDidMount(this);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<IMConfig>,
    prevState: AgriDashboardState,
  ): void {
    return componentDidUpdate(this, prevProps, prevState);
  }

toggleIndicatorsDrawer = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return toggleIndicatorsDrawer(this, event);
  };

  componentWillUnmount(): void {
    return componentWillUnmount(this);
  }

handleMapSurfaceLoading = (event: Event): void => {
    return handleMapSurfaceLoading(this, event);
  };

handleMapNoData = (event: Event): void => {
    return handleMapNoData(this, event);
  };

handleMapPopupVisibility = (event: Event): void => {
    return handleMapPopupVisibility(this, event);
  };

createPortalHost(): HTMLElement {
    return createPortalHost(this);
  }

ensurePortalHost(): HTMLElement {
    return ensurePortalHost(this);
  }

removePortalHost(): void {
    return removePortalHost(this);
  }

bringPortalHostToFront(): void {
    return bringPortalHostToFront(this);
  }

toPlainConfig(): Record<string, unknown> {
    return toPlainConfig(this);
  }

toPlainPopup(value: unknown): AgriPopupConfig {
    return toPlainPopup(this, value);
  }

getIndicatorConfig(
    baseConfig: Record<string, unknown>,
  ): Record<string, unknown> {
    return getIndicatorConfig(this, baseConfig);
  }

getPopupConfig(
    baseConfig: Record<string, unknown>,
  ): Record<string, unknown> {
    return getPopupConfig(this, baseConfig);
  }

childProps(
    suffix: ChildSuffix,
    config?: Record<string, unknown>,
  ): DashboardChildProps {
    return childProps(this, suffix, config);
  }

getStableIndicatorChildProps(
    indicatorConfig: Record<string, unknown>,
    baseConfig: Record<string, unknown>,
  ): IndicatorChildPropsSet {
    return getStableIndicatorChildProps(this, indicatorConfig, baseConfig);
  }

getLeftPanelWidth(): string {
    return getLeftPanelWidth(this);
  }

getRowFrValues(): { top: number; bottom: number } {
    return getRowFrValues(this);
  }

getActiveMapWidgetId(): string {
    return getActiveMapWidgetId(this);
  }

getActiveJimuMapView(): JimuMapView | null {
    return getActiveJimuMapView(this);
  }

detachMapLoadingWatchers(): void {
    return detachMapLoadingWatchers(this);
  }

setMapLoading(mapLoading: boolean): void {
    return setMapLoading(this, mapLoading);
  }

getMapLoadingState(jimuMapView: JimuMapView | null): boolean {
    return getMapLoadingState(this, jimuMapView);
  }

updateMapLoadingState = (): void => {
    return updateMapLoadingState(this);
  };

attachMapLoadingWatchers(): void {
    return attachMapLoadingWatchers(this);
  }

scheduleMapLoadingWatchers = (delay = 0): void => {
    return scheduleMapLoadingWatchers(this, delay);
  };

getDashboardLoadingState(): boolean {
    return getDashboardLoadingState(this);
  }

updateDashboardLoadingState(): void {
    return updateDashboardLoadingState(this);
  }

onWindowResize = (): void => {
    return onWindowResize(this);
  };

ensureLayoutObservers(): void {
    return ensureLayoutObservers(this);
  }

setupMapSlotObserver(): void {
    return setupMapSlotObserver(this);
  }

scheduleMapSlotLayout = (force = false): void => {
    return scheduleMapSlotLayout(this, force);
  };

findSharedLayoutSurface(): HTMLElement | null {
    return findSharedLayoutSurface(this);
  }

readDashboardCssPx(variable: string, fallback: number): number {
    return readDashboardCssPx(this, variable, fallback);
  }

applyIndicatorOverlayBounds(
    slotEl: HTMLElement,
    overlayEl: HTMLElement,
  ): void {
    return applyIndicatorOverlayBounds(this, slotEl, overlayEl);
  }

applyDateIndexOverlayBounds(
    slotEl: HTMLElement,
    overlayEl: HTMLElement,
  ): void {
    return applyDateIndexOverlayBounds(this, slotEl, overlayEl);
  }

syncIndicatorOverlayLayout(): void {
    return syncIndicatorOverlayLayout(this);
  }

clearOverlayLayout(overlay: HTMLElement | null): void {
    return clearOverlayLayout(this, overlay);
  }

clearIndicatorOverlayLayout(): void {
    return clearIndicatorOverlayLayout(this);
  }

  render() {
    return render(this);
  }
}
