import { React } from "jimu-core";
import { type ShownRegionYearLayer } from "../../../gis/feature-layer-data";
import { logoutFromAccount } from "../../../shared/agri-logout";
import { buildTurlarSqlClause } from "../../../shared/agri-crop-labels";
import { type ChartFilterFlags } from "../../../gis/agri-chart-filter-order";
import { type VHBarData, type VHBarDataItem } from "../../localization/vh-constants";
import { normalizeTurlarList } from "../../localization/broadcast-detail";
import { type MapZoomRequest } from "../../localization/map-zoom-policy";
import type { LocalizationWidgetProps, ValueChangeEvent } from "./components/host";
import {
  buildNdviDateClauseWithoutVh,
  buildNdviSpatialWhere,
  buildNdviStatusClauseForCurrentVh,
  buildTumanDistrictClause,
  buildUniqueIdClause,
  buildViloyatRegionClause,
  buildWhereClause,
} from "./components/Filters/where-builders";
import {
  beginNotificationPrefetch,
  formatFieldCount,
  formatNotificationDate,
  hydrateNotificationCache,
  loadNotificationFeed,
  onDashboardPackForNotifications,
  onNotificationsMenuOpened,
  resolveRegionNotificationName,
  updateNotificationScrollHint,
} from "./components/Toolbar/notifications-service";
import {
  applyFarmerSearchSelection,
  buildGraffSearchScopeWhere,
  buildGraffSearchTextWhere,
  clearFarmerSearchAndRestoreGeo,
  emitGraffTableRowSelected,
  emitGraffTableSearchChanged,
  emitGraffTableSearchClear,
  formatGraffSearchCellValue,
  getGraffDisplayFields,
  getGraffSearchFieldLabel,
  handleGraffSearchClear,
  handleGraffSearchFocus,
  handleGraffSearchInputChange,
  handleGraffSearchRowClick,
  runGraffAutoComplete,
} from "./components/GraffSearch/graff-search-service";
import { syncShownRegionYearLayers } from "./components/Map/region-year-layers";
import {
  buildVhMapUniqueIdCacheKey,
  computeVhBarData,
  executeComputeVhBarData,
  getGeoScopedVhBarUsedDate,
  getLatestNdviDateForBar,
  isVhMapUniqueIdCacheWarm,
  loadNdviBucketIds,
  makeVhBarComputeKey,
  prefetchVhStatusUniqueIds,
  publishVhBarPartial,
  resolveVhMapUniqueIds,
  resolveVhRegionChartUniqueIdsBackground,
  setVhUniqueIdCacheEntry,
} from "./components/VhBar/vh-bar-service";
import {
  applyFiltersPersistent,
  applyMapFiltersOptimized,
  buildTableWhereWithRegion,
  fetchDataWithCurrentState,
  getPolygonAreasWithCurrentFilter,
  zoomToSelectedDistrict,
} from "./components/Map/map-filter-service";
import {
  ensureCropIdForSelection,
  ensureRegionDistrictForSelection,
  fetchAndStoreRegionDistrictMappings,
  fetchFilterOptions,
  flDistinctFromLayer,
  getUniqueValues,
} from "./components/Connection/connection-service";
import {
  resolveThemeState,
  initializeTheme,
  applyThemeToDom,
  handleThemeChange,
  handleDocumentClick,
  applyThemeByValue,
} from "./components/Theme/theme-service";
import {
  ensureInitialization,
  toggleToolbarMenu,
  handleYilChange,
  applyLanguage,
  applyYil,
  handleNdviDateChange,
  syncChartDimOrder,
} from "./components/Shell/panel-handlers";
import { handleWidgetSelection } from "./components/Shell/selection-service";
import { broadcastFilterState } from "./components/Shell/broadcast-service";
import { componentDidMount, componentWillUnmount, componentDidUpdate } from "./components/Shell/lifecycle-service";
import { render } from "./components/Shell/render-panel";
import { createInitialGeoState } from "./components/Shell/initial-state";
import type { FilterState, GeoWidgetState, GraffSearchRecord } from "./widget-state";
import { LocalizationMapBase } from "./widget-map-base";
import {
  handleRequestMasterFilterState,
  eqAposSmart,
  getAposHelpers,
  getChartFilterFlags,
  getCropIdsForVhUniqueIdScope,
  buildTableDateWhere,
  getGeoCodeHelpers,
  makeVhBarDateGeoKey,
} from "./components/Shell/panel-helpers";

export type { VHBarData, VHBarDataItem };
export type { FilterState, GeoWidgetState, GraffSearchRecord };

export default class AgriLocalization extends LocalizationMapBase {
  constructor(props: LocalizationWidgetProps) {
    super(props);
    this.state = createInitialGeoState();
  }

  /* ---------------------- Lifecycle ---------------------- */
  componentDidMount() {
    return componentDidMount(this.host);
  }

  componentWillUnmount() {
    return componentWillUnmount(this.host);
  }

  componentDidUpdate(
    prevProps: LocalizationWidgetProps,
    prevState: GeoWidgetState,
  ) {
    return componentDidUpdate(this.host, prevProps, prevState);
  }

  /* ---------------------- Widget Selection Handler (SINGLE ENTRY POINT) ---------------------- */

  private handleWidgetSelection = async (event: Event) => {
    return handleWidgetSelection(this.host, event);
  };

  /* ---------------------- Broadcast Current State ---------------------- */

  private handleRequestMasterFilterState = (): void => {
    return handleRequestMasterFilterState(this.host);
  };

  private broadcastFilterState = (opts?: { pendingOnly?: boolean }) => {
    return broadcastFilterState(this.host, opts);
  };

  ensureInitialization = async () => {
    return ensureInitialization(this.host);
  };

  private getUniqueValues = (fieldName: string): Promise<string[]> =>
    getUniqueValues(this.host, fieldName);

  private fetchFilterOptions = () =>
    fetchFilterOptions(this.host);

  private async flDistinctFromLayer(
    layer: __esri.FeatureLayer,
    fieldName: string,
    where: string,
  ): Promise<string[]> {
    return flDistinctFromLayer(
      this.host,
      layer,
      fieldName,
      where,
    );
  }

  private fetchAndStoreRegionDistrictMappings = (): Promise<void> =>
    fetchAndStoreRegionDistrictMappings(this.host);

  private ensureRegionDistrictForSelection = (): Promise<void> =>
    ensureRegionDistrictForSelection(this.host);

  private ensureCropIdForSelection = (): Promise<void> =>
    ensureCropIdForSelection(this.host);

  /* ---------------------- UI Handlers ---------------------- */

  private resolveThemeState = (): boolean => {
    return resolveThemeState(this.host);
  };

  private initializeTheme = () => {
    return initializeTheme(this.host);
  };

  private applyThemeToDom = (isDarkTheme: boolean): void => {
    return applyThemeToDom(this.host, isDarkTheme);
  };

  private handleThemeChange = (event: ValueChangeEvent) => {
    return handleThemeChange(this.host, event);
  };

  private handleDocumentClick = (event: MouseEvent): void => {
    return handleDocumentClick(this.host, event);
  };

  private toggleToolbarMenu = (
    menu: "yil" | "language" | "indexInfo" | "notifications",
  ): void => {
    return toggleToolbarMenu(this.host, menu);
  };

  private hydrateNotificationCache = (): void =>
    hydrateNotificationCache(this.host);

  private onDashboardPackForNotifications = (pack: {
    phase?: string;
    filter?: { yil?: string };
  }): void =>
    onDashboardPackForNotifications(this.host, pack);

  private beginNotificationPrefetch = (): void =>
    beginNotificationPrefetch(this.host);

  private onNotificationsMenuOpened = (): void =>
    onNotificationsMenuOpened(this.host);

  private loadNotificationFeed = (): Promise<void> =>
    loadNotificationFeed(this.host);

  private formatNotificationDate = (ymd: string): string =>
    formatNotificationDate(this.host, ymd);

  private resolveRegionNotificationName = (regionCode: string): string =>
    resolveRegionNotificationName(this.host, regionCode);

  private formatFieldCount = (value: number): string =>
    formatFieldCount(this.host, value);

  private updateNotificationScrollHint = (): void =>
    updateNotificationScrollHint(this.host);

  private onNotificationBodyScroll = (): void => {
    this.updateNotificationScrollHint();
  };

  private openIndexInfoDetail = (key: string): void => {
    this.setState({ selectedIndexInfoKey: key });
  };

  /** "×" / backdrop click — dismiss the indexInfo popover entirely. */
  private closeIndexInfoMenu = (): void => {
    this.setState({ openToolbarMenu: null, selectedIndexInfoKey: null });
  };

  private toggleProfileMenu = (): void => {
    this.setState((prev) => ({ showProfileMenu: !prev.showProfileMenu }));
  };

  private closeProfileMenu = (): void => {
    this.setState({ showProfileMenu: false });
  };

  private handleLogout = (): void => {
    this.setState({ showProfileMenu: false });
    void logoutFromAccount();
  };

  private handleYilChange = (event: ValueChangeEvent) => {
    return handleYilChange(this.host, event);
  };

  private applyLanguage = (lang: FilterState["language"]) => {
    return applyLanguage(this.host, lang);
  };

  private applyYil = (selectedYil: string) => {
    return applyYil(this.host, selectedYil);
  };

  private applyThemeByValue = (value: "light" | "dark") => {
    return applyThemeByValue(this.host, value);
  };

  private emitGraffTableSearchChanged = (query: string, options?: { preserveSelection?: boolean }) =>
    emitGraffTableSearchChanged(this.host, query, options);

  private emitGraffTableSearchClear = (options?: { preserveSelection?: boolean; }) =>
    emitGraffTableSearchClear(this.host, options);

  private emitGraffTableRowSelected = (record: GraffSearchRecord) =>
    emitGraffTableRowSelected(this.host, record);

  private getGraffDisplayFields = (): string[] =>
    getGraffDisplayFields(this.host);

  private buildGraffSearchTextWhere = (raw: string, layer?: __esri.FeatureLayer): string =>
    buildGraffSearchTextWhere(this.host, raw, layer);

  private buildGraffSearchScopeWhere = (): string =>
    buildGraffSearchScopeWhere(this.host);

  private getGraffSearchFieldLabel = (fieldName: string, language: FilterState["language"]): string =>
    getGraffSearchFieldLabel(this.host, fieldName, language);

  private formatGraffSearchCellValue = (fieldName: string, rawValue: unknown): string =>
    formatGraffSearchCellValue(this.host, fieldName, rawValue);

  private runGraffAutoComplete = (term: string) =>
    runGraffAutoComplete(this.host, term);

  private handleGraffSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleGraffSearchInputChange(this.host, event);

  private handleGraffSearchFocus = (): void =>
    handleGraffSearchFocus(this.host);

  private clearFarmerSearchAndRestoreGeo = (): void =>
    clearFarmerSearchAndRestoreGeo(this.host);

  private handleGraffSearchClear = () =>
    handleGraffSearchClear(this.host);

  private handleGraffSearchRowClick = (record: GraffSearchRecord) =>
    handleGraffSearchRowClick(this.host, record);

  private applyFarmerSearchSelection = (inn: string): Promise<void> =>
    applyFarmerSearchSelection(this.host, inn);


  private handleNdviDateChange = (event: ValueChangeEvent) => {
    return handleNdviDateChange(this.host, event);
  };

  /* ---------------------- WHERE Clause Builder ---------------------- */

  private eqAposSmart(field: string, raw: string): string {
    return eqAposSmart(this.host, field, raw);
  }

  private getAposHelpers = () =>
    getAposHelpers(this.host);

  private normalizeTurlar = (raw: unknown, fallback = ""): string[] =>
    normalizeTurlarList(raw, fallback);

  private getSelectedTurlar = (): string[] =>
    this.normalizeTurlar(this.state.turlar, this.state.turi || "");

  private getChartFilterFlags = (
    vh = String(this.state.vh || "").trim(),
    turlar = this.getSelectedTurlar(),
  ): ChartFilterFlags =>
    getChartFilterFlags(this.host, vh, turlar);

  private getCropIdsForVhUniqueIdScope = (): string[] => {
    return getCropIdsForVhUniqueIdScope(this.host);
  };

  private syncChartDimOrder = (
    nextVh: string,
    nextTurlar: string[],
    resetGeography: boolean,
  ): void => {
    return syncChartDimOrder(this.host, nextVh, nextTurlar, resetGeography);
  };

  private buildTurlarClause = (
    field = "turi",
    values: string[] = this.getSelectedTurlar(),
  ): string => buildTurlarSqlClause(field, values);

  private buildUniqueIdClause(raw: string, layer?: __esri.FeatureLayer): string {
    return buildUniqueIdClause(this.host, raw, layer);
  }

  private buildViloyatRegionClause(): string {
    return buildViloyatRegionClause(this.host);
  }

  private buildTumanDistrictClause(): string {
    return buildTumanDistrictClause(this.host);
  }

  private buildNdviSpatialWhere(includeTuri = true): string {
    return buildNdviSpatialWhere(this.host, includeTuri);
  }

  private buildNdviStatusClauseForCurrentVh(): string {
    return buildNdviStatusClauseForCurrentVh(this.host);
  }

  private buildNdviDateClauseWithoutVh(): string {
    return buildNdviDateClauseWithoutVh(this.host);
  }

  private buildWhereClause(
    includeVh = true,
    includeTuri = true,
    includeViloyat = true,
    layer?: __esri.FeatureLayer,
  ): string {
    return buildWhereClause(
      this.host,
      includeVh,
      includeTuri,
      includeViloyat,
      layer,
    );
  }

  private getLatestNdviDateForBar(primaryLayer?: __esri.FeatureLayer): string | null {
    return getLatestNdviDateForBar(this.host, primaryLayer);
  }

  private computeVhBarData = (): Promise<VHBarData | null> =>
    computeVhBarData(this.host);

  private makeVhBarComputeKey = (): string =>
    makeVhBarComputeKey(this.host);

  private executeComputeVhBarData = (): Promise<VHBarData | null> =>
    executeComputeVhBarData(this.host);

  private publishVhBarPartial = (vhBarData: VHBarData): void =>
    publishVhBarPartial(this.host, vhBarData);

  private buildTableDateWhere(
    dateField: string,
    ndviDate: string,
  ): string | null {
    return buildTableDateWhere(this.host, dateField, ndviDate);
  }

  private buildTableWhereWithRegion(
    dateField: string,
    ndviDate: string,
    tableFieldNames: string[],
  ): string | null {
    return buildTableWhereWithRegion(
      this.host,
      dateField,
      ndviDate,
      tableFieldNames,
    );
  }

  private getPolygonAreasWithCurrentFilter = (opts?: { includeTuri?: boolean; }): Promise<Map<string, number>> =>
    getPolygonAreasWithCurrentFilter(this.host, opts);

  private getGeoCodeHelpers = () =>
    getGeoCodeHelpers(this.host);

  private makeVhBarDateGeoKey = (): string =>
    makeVhBarDateGeoKey(this.host);

  private getGeoScopedVhBarUsedDate = (): string =>
    getGeoScopedVhBarUsedDate(this.host);

  private setVhUniqueIdCacheEntry = (key: string, ids: string[]): void =>
    setVhUniqueIdCacheEntry(this.host, key, ids);

  private buildVhMapUniqueIdCacheKey = (): string | null =>
    buildVhMapUniqueIdCacheKey(this.host);


  private isVhMapUniqueIdCacheWarm = (): boolean =>
    isVhMapUniqueIdCacheWarm(this.host);

  private prefetchVhStatusUniqueIds = (ndviDate: string): void =>
    prefetchVhStatusUniqueIds(this.host, ndviDate);

  private resolveVhMapUniqueIds = (isCurrent?: () => boolean): Promise<string[] | null> =>
    resolveVhMapUniqueIds(this.host, isCurrent);

  private resolveVhRegionChartUniqueIdsBackground = (resolveGen: number, params: { status: string; regionNum: number; cropIds: string[]; ndviDate: string; vhCategory: string; }, isCurrent?: () => boolean): Promise<void> =>
    resolveVhRegionChartUniqueIdsBackground(this.host, resolveGen, params, isCurrent);

  private syncShownRegionYearLayers = (map: __esri.Map | null | undefined): ShownRegionYearLayer[] =>
    syncShownRegionYearLayers(this.host, map);
  private loadNdviBucketIds = (vhCategory: string): Promise<void> =>
    loadNdviBucketIds(this.host, vhCategory);

  private async applyFiltersPersistent(
    isCurrent?: () => boolean,
    opts?: { vhDeferredSecondPass?: boolean },
  ): Promise<void> {
    return applyFiltersPersistent(this.host, isCurrent, opts);
  }

  private zoomToSelectedDistrict = (view: __esri.MapView | __esri.SceneView): Promise<boolean> =>
    zoomToSelectedDistrict(this.host, view);
  private applyMapFiltersOptimized = (zoomRequest: MapZoomRequest = { mode: "none", reason: "other" }, isApplyCurrent?: () => boolean): Promise<void> =>
    applyMapFiltersOptimized(this.host, zoomRequest, isApplyCurrent);

  private fetchDataWithCurrentState = () =>
    fetchDataWithCurrentState(this.host);

  /* ---------------------- Render ---------------------- */

  render() {
    return render(this.host);
  }
}
