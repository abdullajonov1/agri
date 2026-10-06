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
} from "./AgriMapIndicatorDrawer";
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
import type { DashboardWidgetHost } from "./dashboard-host";
export default class AgriDashboard extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  AgriDashboardState
> {
  private dashboardRootRef = React.createRef<HTMLDivElement>();
  private mapSlotRef = React.createRef<HTMLElement>();
  private indicatorOverlayRef = React.createRef<HTMLDivElement>();
  private indicatorPanelRef = React.createRef<HTMLDivElement>();
  private dateIndexOverlayRef = React.createRef<HTMLDivElement>();
  private portalHost: HTMLElement | null = null;
  private portalReady = false;
  private dashboardResizeObserver: ResizeObserver | null = null;
  private mapLayoutRaf = 0;
  private layoutObserversReady = false;
  private resizeListenerAttached = false;
  private lastIndicatorToggleAt = 0;
  private indicatorAnimTimer: ReturnType<typeof setTimeout> | null = null;
  private mapIndicatorHost: HTMLElement | null = null;
  private indicatorChildPropsCache: {
    signature: string;
    indicator: AllWidgetProps<any>;
    yield: AllWidgetProps<any>;
    unused: AllWidgetProps<any>;
    reserve: AllWidgetProps<any>;
  } | null = null;
  /** Last map-slot CSS size that triggered view.resize — skip no-op resizes. */
  private lastMapSlotSize = { w: -1, h: -1 };
  private mapReadyWatchHandle: { remove?: () => void } | null = null;
  private mapUpdatingWatchHandle: { remove?: () => void } | null = null;
  private mapLoadingRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private mapSurfaceLoadingSafetyTimer: ReturnType<typeof setTimeout> | null =
    null;
  private watchedMapView: unknown = null;
  private embeddedMapReady = false;
  private mapViewWatchAttempts = 0;
  private lastMapWatchWidgetId = "";

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

  private syncConfigSideEffects = (): void => {
    return syncConfigSideEffects(this as unknown as DashboardWidgetHost);
  };

  private isBuilderDesignMode(): boolean {
    return isBuilderDesignMode(this as unknown as DashboardWidgetHost);
  }

  private getUiLanguage(): string {
    return getUiLanguage(this as unknown as DashboardWidgetHost);
  }

  componentDidMount(): void {
    return componentDidMount(this as unknown as DashboardWidgetHost);
  }

  componentDidUpdate(
    prevProps: AllWidgetProps<IMConfig>,
    prevState: AgriDashboardState,
  ): void {
    return componentDidUpdate(this as unknown as DashboardWidgetHost, prevProps, prevState);
  }

  private toggleIndicatorsDrawer = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    return toggleIndicatorsDrawer(this as unknown as DashboardWidgetHost, event);
  };

  componentWillUnmount(): void {
    return componentWillUnmount(this as unknown as DashboardWidgetHost);
  }

  private handleMapSurfaceLoading = (event: Event): void => {
    return handleMapSurfaceLoading(this as unknown as DashboardWidgetHost, event);
  };

  private handleMapNoData = (event: Event): void => {
    return handleMapNoData(this as unknown as DashboardWidgetHost, event);
  };

  private handleMapPopupVisibility = (event: Event): void => {
    return handleMapPopupVisibility(this as unknown as DashboardWidgetHost, event);
  };

  private createPortalHost(): HTMLElement {
    return createPortalHost(this as unknown as DashboardWidgetHost);
  }

  private ensurePortalHost(): HTMLElement {
    return ensurePortalHost(this as unknown as DashboardWidgetHost);
  }

  private removePortalHost(): void {
    return removePortalHost(this as unknown as DashboardWidgetHost);
  }

  private bringPortalHostToFront(): void {
    return bringPortalHostToFront(this as unknown as DashboardWidgetHost);
  }

  private toPlainConfig(): Record<string, unknown> {
    return toPlainConfig(this as unknown as DashboardWidgetHost);
  }

  private toPlainPopup(value: unknown): AgriPopupConfig {
    return toPlainPopup(this as unknown as DashboardWidgetHost, value);
  }

  private getIndicatorConfig(
    baseConfig: Record<string, unknown>,
  ): Record<string, unknown> {
    return getIndicatorConfig(this as unknown as DashboardWidgetHost, baseConfig);
  }

  private getPopupConfig(
    baseConfig: Record<string, unknown>,
  ): Record<string, unknown> {
    return getPopupConfig(this as unknown as DashboardWidgetHost, baseConfig);
  }

  private childProps(
    suffix: ChildSuffix,
    config?: Record<string, unknown>,
  ): AllWidgetProps<any> {
    return childProps(this as unknown as DashboardWidgetHost, suffix, config);
  }

  private getStableIndicatorChildProps(
    indicatorConfig: Record<string, unknown>,
    baseConfig: Record<string, unknown>,
  ): {
    indicator: AllWidgetProps<any>;
    yield: AllWidgetProps<any>;
    unused: AllWidgetProps<any>;
    reserve: AllWidgetProps<any>;
  } {
    return getStableIndicatorChildProps(this as unknown as DashboardWidgetHost, indicatorConfig, baseConfig);
  }

  private getLeftPanelWidth(): string {
    return getLeftPanelWidth(this as unknown as DashboardWidgetHost);
  }

  private getRowFrValues(): { top: number; bottom: number } {
    return getRowFrValues(this as unknown as DashboardWidgetHost);
  }

  private getActiveMapWidgetId(): string {
    return getActiveMapWidgetId(this as unknown as DashboardWidgetHost);
  }

  private getActiveJimuMapView(): any | null {
    return getActiveJimuMapView(this as unknown as DashboardWidgetHost);
  }

  private detachMapLoadingWatchers(): void {
    return detachMapLoadingWatchers(this as unknown as DashboardWidgetHost);
  }

  private setMapLoading(mapLoading: boolean): void {
    return setMapLoading(this as unknown as DashboardWidgetHost, mapLoading);
  }

  private getMapLoadingState(jimuMapView: any | null): boolean {
    return getMapLoadingState(this as unknown as DashboardWidgetHost, jimuMapView);
  }

  private updateMapLoadingState = (): void => {
    return updateMapLoadingState(this as unknown as DashboardWidgetHost);
  };

  private attachMapLoadingWatchers(): void {
    return attachMapLoadingWatchers(this as unknown as DashboardWidgetHost);
  }

  private scheduleMapLoadingWatchers = (delay = 0): void => {
    return scheduleMapLoadingWatchers(this as unknown as DashboardWidgetHost, delay);
  };

  private getDashboardLoadingState(): boolean {
    return getDashboardLoadingState(this as unknown as DashboardWidgetHost);
  }

  private updateDashboardLoadingState(): void {
    return updateDashboardLoadingState(this as unknown as DashboardWidgetHost);
  }

  private onWindowResize = (): void => {
    return onWindowResize(this as unknown as DashboardWidgetHost);
  };

  private ensureLayoutObservers(): void {
    return ensureLayoutObservers(this as unknown as DashboardWidgetHost);
  }

  private setupMapSlotObserver(): void {
    return setupMapSlotObserver(this as unknown as DashboardWidgetHost);
  }

  private scheduleMapSlotLayout = (force = false): void => {
    return scheduleMapSlotLayout(this as unknown as DashboardWidgetHost, force);
  };

  private findSharedLayoutSurface(): HTMLElement | null {
    return findSharedLayoutSurface(this as unknown as DashboardWidgetHost);
  }

  private readDashboardCssPx(variable: string, fallback: number): number {
    return readDashboardCssPx(this as unknown as DashboardWidgetHost, variable, fallback);
  }

  private applyIndicatorOverlayBounds(
    slotEl: HTMLElement,
    overlayEl: HTMLElement,
  ): void {
    return applyIndicatorOverlayBounds(this as unknown as DashboardWidgetHost, slotEl, overlayEl);
  }

  private applyDateIndexOverlayBounds(
    slotEl: HTMLElement,
    overlayEl: HTMLElement,
  ): void {
    return applyDateIndexOverlayBounds(this as unknown as DashboardWidgetHost, slotEl, overlayEl);
  }

  private syncIndicatorOverlayLayout(): void {
    return syncIndicatorOverlayLayout(this as unknown as DashboardWidgetHost);
  }

  private clearOverlayLayout(overlay: HTMLElement | null): void {
    return clearOverlayLayout(this as unknown as DashboardWidgetHost, overlay);
  }

  private clearIndicatorOverlayLayout(): void {
    return clearIndicatorOverlayLayout(this as unknown as DashboardWidgetHost);
  }

  render() {
    return render(this as unknown as DashboardWidgetHost);
  }
}
