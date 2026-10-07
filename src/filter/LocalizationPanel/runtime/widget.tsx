import { React } from "jimu-core";
import "./AgriFilter.css";
import { type ShownRegionYearLayer } from "../../../gis/feature-layer-data";
import { logoutFromAccount } from "../../../shared/agri-logout";
import { buildTurlarSqlClause } from "../../../shared/agri-crop-labels";
import { type ChartFilterFlags } from "../../../gis/agri-chart-filter-order";
import { type VHBarData, type VHBarDataItem } from "../../localization/vh-constants";
import { normalizeTurlarList } from "../../localization/broadcast-detail";
import { type MapZoomRequest } from "../../localization/map-zoom-policy";
import type { LocalizationHost, LocalizationWidgetProps, ValueChangeEvent } from "./components/host";
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

export default class AgriLocalization
  extends LocalizationMapBase
  implements LocalizationHost
{
  constructor(props: LocalizationWidgetProps) {
    super(props);
    this.state = createInitialGeoState();
  }

  /** This instance viewed through the interface the extracted services use. */
  protected get host(): LocalizationHost {
    return this;
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

  handleWidgetSelection = async (event: Event) => {
    return handleWidgetSelection(this.host, event);
  };

  /* ---------------------- Broadcast Current State ---------------------- */

  handleRequestMasterFilterState = (): void => {
    return handleRequestMasterFilterState(this.host);
  };

  broadcastFilterState = (opts?: { pendingOnly?: boolean }) => {
    return broadcastFilterState(this.host, opts);
  };

  ensureInitialization = async () => {
    return ensureInitialization(this.host);
  };

  getUniqueValues = (fieldName: string): Promise<string[]> =>
    getUniqueValues(this.host, fieldName);

  fetchFilterOptions = () =>
    fetchFilterOptions(this.host);

  async flDistinctFromLayer(
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

  fetchAndStoreRegionDistrictMappings = (): Promise<void> =>
    fetchAndStoreRegionDistrictMappings(this.host);

  ensureRegionDistrictForSelection = (): Promise<void> =>
    ensureRegionDistrictForSelection(this.host);

  ensureCropIdForSelection = (): Promise<void> =>
    ensureCropIdForSelection(this.host);

  /* ---------------------- UI Handlers ---------------------- */

  resolveThemeState = (): boolean => {
    return resolveThemeState(this.host);
  };

  initializeTheme = () => {
    return initializeTheme(this.host);
  };

  applyThemeToDom = (isDarkTheme: boolean): void => {
    return applyThemeToDom(this.host, isDarkTheme);
  };

  handleThemeChange = (event: ValueChangeEvent) => {
    return handleThemeChange(this.host, event);
  };

  handleDocumentClick = (event: MouseEvent): void => {
    return handleDocumentClick(this.host, event);
  };

  toggleToolbarMenu = (
    menu: "yil" | "language" | "indexInfo" | "notifications",
  ): void => {
    return toggleToolbarMenu(this.host, menu);
  };

  hydrateNotificationCache = (): void =>
    hydrateNotificationCache(this.host);

  onDashboardPackForNotifications = (pack: {
    phase?: string;
    filter?: { yil?: string };
  }): void =>
    onDashboardPackForNotifications(this.host, pack);

  beginNotificationPrefetch = (): void =>
    beginNotificationPrefetch(this.host);

  onNotificationsMenuOpened = (): void =>
    onNotificationsMenuOpened(this.host);

  loadNotificationFeed = (): Promise<void> =>
    loadNotificationFeed(this.host);

  formatNotificationDate = (ymd: string): string =>
    formatNotificationDate(this.host, ymd);

  resolveRegionNotificationName = (regionCode: string): string =>
    resolveRegionNotificationName(this.host, regionCode);

  formatFieldCount = (value: number): string =>
    formatFieldCount(this.host, value);

  updateNotificationScrollHint = (): void =>
    updateNotificationScrollHint(this.host);

  onNotificationBodyScroll = (): void => {
    this.updateNotificationScrollHint();
  };

  openIndexInfoDetail = (key: string): void => {
    this.setState({ selectedIndexInfoKey: key });
  };

  /** "×" / backdrop click — dismiss the indexInfo popover entirely. */
  closeIndexInfoMenu = (): void => {
    this.setState({ openToolbarMenu: null, selectedIndexInfoKey: null });
  };

  toggleProfileMenu = (): void => {
    this.setState((prev) => ({ showProfileMenu: !prev.showProfileMenu }));
  };

  closeProfileMenu = (): void => {
    this.setState({ showProfileMenu: false });
  };

  handleLogout = (): void => {
    this.setState({ showProfileMenu: false });
    void logoutFromAccount();
  };

  handleYilChange = (event: ValueChangeEvent) => {
    return handleYilChange(this.host, event);
  };

  applyLanguage = (lang: FilterState["language"]) => {
    return applyLanguage(this.host, lang);
  };

  applyYil = (selectedYil: string) => {
    return applyYil(this.host, selectedYil);
  };

  applyThemeByValue = (value: "light" | "dark") => {
    return applyThemeByValue(this.host, value);
  };

  emitGraffTableSearchChanged = (query: string, options?: { preserveSelection?: boolean }) =>
    emitGraffTableSearchChanged(this.host, query, options);

  emitGraffTableSearchClear = (options?: { preserveSelection?: boolean; }) =>
    emitGraffTableSearchClear(this.host, options);

  emitGraffTableRowSelected = (record: GraffSearchRecord) =>
    emitGraffTableRowSelected(this.host, record);

  getGraffDisplayFields = (): string[] =>
    getGraffDisplayFields(this.host);

  buildGraffSearchTextWhere = (raw: string, layer?: __esri.FeatureLayer): string =>
    buildGraffSearchTextWhere(this.host, raw, layer);

  buildGraffSearchScopeWhere = (): string =>
    buildGraffSearchScopeWhere(this.host);

  getGraffSearchFieldLabel = (fieldName: string, language: FilterState["language"]): string =>
    getGraffSearchFieldLabel(this.host, fieldName, language);

  formatGraffSearchCellValue = (fieldName: string, rawValue: unknown): string =>
    formatGraffSearchCellValue(this.host, fieldName, rawValue);

  runGraffAutoComplete = (term: string) =>
    runGraffAutoComplete(this.host, term);

  handleGraffSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleGraffSearchInputChange(this.host, event);

  handleGraffSearchFocus = (): void =>
    handleGraffSearchFocus(this.host);

  clearFarmerSearchAndRestoreGeo = (): void =>
    clearFarmerSearchAndRestoreGeo(this.host);

  handleGraffSearchClear = () =>
    handleGraffSearchClear(this.host);

  handleGraffSearchRowClick = (record: GraffSearchRecord) =>
    handleGraffSearchRowClick(this.host, record);

  applyFarmerSearchSelection = (inn: string): Promise<void> =>
    applyFarmerSearchSelection(this.host, inn);


  handleNdviDateChange = (event: ValueChangeEvent) => {
    return handleNdviDateChange(this.host, event);
  };

  /* ---------------------- WHERE Clause Builder ---------------------- */

  eqAposSmart(field: string, raw: string): string {
    return eqAposSmart(this.host, field, raw);
  }

  getAposHelpers = () =>
    getAposHelpers(this.host);

  normalizeTurlar = (raw: unknown, fallback = ""): string[] =>
    normalizeTurlarList(raw, fallback);

  getSelectedTurlar = (): string[] =>
    this.normalizeTurlar(this.state.turlar, this.state.turi || "");

  getChartFilterFlags = (
    vh = String(this.state.vh || "").trim(),
    turlar = this.getSelectedTurlar(),
  ): ChartFilterFlags =>
    getChartFilterFlags(this.host, vh, turlar);

  getCropIdsForVhUniqueIdScope = (): string[] => {
    return getCropIdsForVhUniqueIdScope(this.host);
  };

  syncChartDimOrder = (
    nextVh: string,
    nextTurlar: string[],
    resetGeography: boolean,
  ): void => {
    return syncChartDimOrder(this.host, nextVh, nextTurlar, resetGeography);
  };

  buildTurlarClause = (
    field = "turi",
    values: string[] = this.getSelectedTurlar(),
  ): string => buildTurlarSqlClause(field, values);

  buildUniqueIdClause(raw: string, layer?: __esri.FeatureLayer): string {
    return buildUniqueIdClause(this.host, raw, layer);
  }

  buildViloyatRegionClause(): string {
    return buildViloyatRegionClause(this.host);
  }

  buildTumanDistrictClause(): string {
    return buildTumanDistrictClause(this.host);
  }

  buildNdviSpatialWhere(includeTuri = true): string {
    return buildNdviSpatialWhere(this.host, includeTuri);
  }

  buildNdviStatusClauseForCurrentVh(): string {
    return buildNdviStatusClauseForCurrentVh(this.host);
  }

  buildNdviDateClauseWithoutVh(): string {
    return buildNdviDateClauseWithoutVh(this.host);
  }

  buildWhereClause(
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

  getLatestNdviDateForBar(primaryLayer?: __esri.FeatureLayer): string | null {
    return getLatestNdviDateForBar(this.host, primaryLayer);
  }

  computeVhBarData = (): Promise<VHBarData | null> =>
    computeVhBarData(this.host);

  makeVhBarComputeKey = (): string =>
    makeVhBarComputeKey(this.host);

  executeComputeVhBarData = (): Promise<VHBarData | null> =>
    executeComputeVhBarData(this.host);

  publishVhBarPartial = (vhBarData: VHBarData): void =>
    publishVhBarPartial(this.host, vhBarData);

  buildTableDateWhere(
    dateField: string,
    ndviDate: string,
  ): string | null {
    return buildTableDateWhere(this.host, dateField, ndviDate);
  }

  buildTableWhereWithRegion(
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

  getPolygonAreasWithCurrentFilter = (opts?: { includeTuri?: boolean; }): Promise<Map<string, number>> =>
    getPolygonAreasWithCurrentFilter(this.host, opts);

  getGeoCodeHelpers = () =>
    getGeoCodeHelpers(this.host);

  makeVhBarDateGeoKey = (): string =>
    makeVhBarDateGeoKey(this.host);

  getGeoScopedVhBarUsedDate = (): string =>
    getGeoScopedVhBarUsedDate(this.host);

  setVhUniqueIdCacheEntry = (key: string, ids: string[]): void =>
    setVhUniqueIdCacheEntry(this.host, key, ids);

  buildVhMapUniqueIdCacheKey = (): string | null =>
    buildVhMapUniqueIdCacheKey(this.host);


  isVhMapUniqueIdCacheWarm = (): boolean =>
    isVhMapUniqueIdCacheWarm(this.host);

  prefetchVhStatusUniqueIds = (ndviDate: string): void =>
    prefetchVhStatusUniqueIds(this.host, ndviDate);

  resolveVhMapUniqueIds = (isCurrent?: () => boolean): Promise<string[] | null> =>
    resolveVhMapUniqueIds(this.host, isCurrent);

  resolveVhRegionChartUniqueIdsBackground = (resolveGen: number, params: { status: string; regionNum: number; cropIds: string[]; ndviDate: string; vhCategory: string; }, isCurrent?: () => boolean): Promise<void> =>
    resolveVhRegionChartUniqueIdsBackground(this.host, resolveGen, params, isCurrent);

  syncShownRegionYearLayers = (map: __esri.Map | null | undefined): ShownRegionYearLayer[] =>
    syncShownRegionYearLayers(this.host, map);
  loadNdviBucketIds = (vhCategory: string): Promise<void> =>
    loadNdviBucketIds(this.host, vhCategory);

  async applyFiltersPersistent(
    isCurrent?: () => boolean,
    opts?: { vhDeferredSecondPass?: boolean },
  ): Promise<void> {
    return applyFiltersPersistent(this.host, isCurrent, opts);
  }

  zoomToSelectedDistrict = (view: __esri.MapView | __esri.SceneView): Promise<boolean> =>
    zoomToSelectedDistrict(this.host, view);
  applyMapFiltersOptimized = (zoomRequest: MapZoomRequest = { mode: "none", reason: "other" }, isApplyCurrent?: () => boolean): Promise<void> =>
    applyMapFiltersOptimized(this.host, zoomRequest, isApplyCurrent);

  fetchDataWithCurrentState = () =>
    fetchDataWithCurrentState(this.host);

  /* ---------------------- Render ---------------------- */

  render() {
    return render(this.host);
  }
}
