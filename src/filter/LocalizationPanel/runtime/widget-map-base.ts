import { JimuMapView } from "jimu-arcgis";
import type { DataSource, IMDataSourceInfo, IMUseDataSource } from "jimu-core";
import type { AgriMapLayer } from "../../localization/agri-map-layer";
import { getTuriCropLookupKey } from "../../../shared/agri-crop-labels";
import { MAX_MAP_CONNECTION_ATTEMPTS } from "../../../shared/map-connection-service";
import { makeRegionDistrictKey as makeRegionDistrictKeyShared, normalizeLocalizationApos } from "../../localization/geo-keys";
import { getFeatureLayerKey } from "../../localization/layer-utils";
import { normalizeConnectionId } from "../../localization/connection-ids";
import type { CropUniqueValueInfo, LocalizationHost } from "./components/host";
import {
  applyCropRenderer,
  applyInstantCropPaletteNoRefresh,
  getCropRendererTargetLayers,
  queryDistinctCropValues,
  refreshCropLayer,
  resetCropRenderer,
  syncCropRenderer,
} from "./components/Map/crop-renderer-service";
import {
  buildWhereForLayer,
  clearRegionYearSettleRepaintTimers,
  repaintShownRegionYearLayers,
  scheduleShownRegionYearSettleRepaint,
  setShownRegionYearOpacity,
  waitForShownRegionYearRedraw,
  warmYearRegionMapImages,
} from "./components/Map/region-year-layers";
import { setMapNoData } from "./components/Map/map-filter-service";
import {
  attachMapClickDispatcher,
  buildLayerViloyatIndex,
  detectNdviStatusDateFieldsFromLayer,
  finalizeConnection,
  getEffectiveUseDataSources,
  getPortalSelf,
  initializeDataSourceOnlyConnection,
  initializeMapConnection,
  initializeMapConnectionOnce,
  onActiveViewChange,
  onDataSourceCreated,
  onDataSourceInfoChange,
  reassertPolygonGeographyFilter,
  resolveFeatureLayerFromOneUseDataSource,
  resolveFeatureLayersFromUseDataSources,
  resolveSpatialMapLayers,
  retryMapConnection,
  runInitialDataLoad,
} from "./components/Connection/connection-service";
import {
  getAdminBoundarySelection,
  setMapSurfaceLoading,
  getLayerMatchStateForViloyat,
  handlePolygonMapClickPhase,
  resolveGroupScope,
  resolveAllowedViloyats,
} from "./components/Shell/panel-handlers";
import { LocalizationWidgetFields } from "./widget-fields";
import {
  getEffectiveViloyat,
  findLayerFieldName,
  cropDistinctCacheKey,
  buildCropUniqueValueInfosFromValues,
  buildYearClauseForLayer,
  getMapWidgetId,
  schedulePolygonFilterGuards,
} from "./components/Shell/panel-helpers";


/**
 * Map, crop-renderer, RegionYear-layer and connection delegates for
 * AgriLocalization. Each member forwards to an extracted service with the
 * widget instance as its LocalizationHost.
 */
export abstract class LocalizationMapBase extends LocalizationWidgetFields {
  // Canonicalize keys used for viloyat/tuman → region/district dictionaries
  protected makeRegionDistrictKey(raw: string | null | undefined): string {
    return makeRegionDistrictKeyShared(raw);
  }

  protected resolveCropIdForTuri = (turi: string): string | undefined => {
    const key = getTuriCropLookupKey(turi);
    return key ? this._turiToCropId[key] : undefined;
  };

  protected getLayerKey(layer: AgriMapLayer | null | undefined): string {
    return getFeatureLayerKey(layer);
  }

  protected getEffectiveViloyat(): string {
    return getEffectiveViloyat(this.host);
  }

  protected getAdminBoundarySelection(): {
    viloyat: string;
    tuman: string;
    regionCode?: number;
    districtCode?: number;
    districtNames?: string[];
    districtCodes?: number[];
  } {
    return getAdminBoundarySelection(this.host);
  }

  protected findLayerFieldName(
    layer: AgriMapLayer | __esri.FeatureLayer,
    name: string,
  ): string | null {
    return findLayerFieldName(this.host, layer, name);
  }

  protected getCropRendererTargetLayers = (): AgriMapLayer[] =>
    getCropRendererTargetLayers(this.host);

  protected cropDistinctCacheKey = (
    layer: AgriMapLayer,
    field: string,
    where: string,
  ): string =>
    cropDistinctCacheKey(this.host, layer, field, where);

  protected queryDistinctCropValues = (layer: AgriMapLayer, field: string, where: string): Promise<string[]> =>
    queryDistinctCropValues(this.host, layer, field, where);

  protected buildCropUniqueValueInfosFromValues = (
    field: string,
    distinctValues: string[],
  ): CropUniqueValueInfo[] =>
    buildCropUniqueValueInfosFromValues(this.host, field, distinctValues);

  protected refreshCropLayer = (layer: AgriMapLayer): void =>
    refreshCropLayer(this.host, layer);

  protected resetCropRenderer = (): void =>
    resetCropRenderer(this.host);

  protected applyCropRenderer = (requestId: number): Promise<void> =>
    applyCropRenderer(this.host, requestId);

  protected syncCropRenderer = (): Promise<void> =>
    syncCropRenderer(this.host);

  protected applyInstantCropPaletteNoRefresh = (): void =>
    applyInstantCropPaletteNoRefresh(this.host);

  protected warmYearRegionMapImages = (): void =>
    warmYearRegionMapImages(this.host);

  protected setShownRegionYearOpacity = (opacity: number): void =>
    setShownRegionYearOpacity(this.host, opacity);


  protected setMapSurfaceLoading = (loading: boolean, reason: string): void => {
    return setMapSurfaceLoading(this.host, loading, reason);
  };

  protected setMapNoData = (noData: boolean, reason: string): void =>
    setMapNoData(this.host, noData, reason);

  protected clearRegionYearSettleRepaintTimers = (): void =>
    clearRegionYearSettleRepaintTimers(this.host);

  protected repaintShownRegionYearLayers = (phase: string): void =>
    repaintShownRegionYearLayers(this.host, phase);

  protected scheduleShownRegionYearSettleRepaint = (requestId: number, delayMs: number, phase: string): void =>
    scheduleShownRegionYearSettleRepaint(this.host, requestId, delayMs, phase);

  protected waitForShownRegionYearRedraw = (refresh = true): Promise<void> =>
    waitForShownRegionYearRedraw(this.host, refresh);

  protected getLayerMatchStateForViloyat(
    layer: __esri.FeatureLayer,
    effectiveViloyat: string,
  ): "match" | "mismatch" | "unknown" {
    return getLayerMatchStateForViloyat(this.host, layer, effectiveViloyat);
  }

  protected buildWhereForLayer(
    layer: __esri.FeatureLayer,
    includeVh = false,
    includeTuri = true,
    forStats = false,
  ): string {
    return buildWhereForLayer(
      this.host,
      layer,
      includeVh,
      includeTuri,
      forStats,
    );
  }

  protected buildYearClauseForLayer(layer: __esri.FeatureLayer): string {
    return buildYearClauseForLayer(this.host, layer);
  }

  protected _normId = (s?: string) => normalizeConnectionId(s);

  protected normalizeApos = (s: string) => normalizeLocalizationApos(s);

  MAX_CONNECTION_ATTEMPTS = MAX_MAP_CONNECTION_ATTEMPTS;


  protected getPortalSelf = (jimuMapView: JimuMapView): Promise<{
    username: string | null;
    groups: Array<{ id: string; title: string }>;
    portalUrl: string;
  }> =>
    getPortalSelf(this.host, jimuMapView);

  protected resolveGroupScope = (
    groups: Array<{ id: string; title: string }>,
  ): { viewItemId: string; viloyat: string } | null => {
    return resolveGroupScope(this.host, groups);
  };

  protected resolveAllowedViloyats = (
    groups: Array<{ id: string; title: string }>,
  ): string[] => {
    return resolveAllowedViloyats(this.host, groups);
  };

  protected getEffectiveUseDataSources(): IMUseDataSource[] {
    return getEffectiveUseDataSources(this.host);
  }

  protected getMapWidgetId(): string | null {
    return getMapWidgetId(this.host);
  }

  protected attachMapClickDispatcher = (jimuMapView: JimuMapView): void =>
    attachMapClickDispatcher(this.host, jimuMapView);

  onActiveViewChange = (jimuMapView: JimuMapView) =>
    onActiveViewChange(this.host, jimuMapView);


  protected initializeMapConnection = (jimuMapView: JimuMapView): Promise<void> =>
    initializeMapConnection(this.host, jimuMapView);

  /**
   * Portal MapImageLayer identify/goTo can finish after the polygon event and
   * restore a stale visible-sublayer snapshot. Re-assert the current
   * year/region/district filter after each async phase settles. The shared
   * sync helper does not reassign an identical definitionExpression, so the
   * normal path causes no extra export; it only repairs a layer that drifted.
   */
  protected clearPolygonFilterGuards = (): void => {
    this._polygonFilterGuardTimers.forEach((timer) => clearTimeout(timer));
    this._polygonFilterGuardTimers = [];
  };

  protected reassertPolygonGeographyFilter = (phase: string): void =>
    reassertPolygonGeographyFilter(this.host, phase);

  protected handlePolygonMapClickPhase = (event: Event): void => {
    return handlePolygonMapClickPhase(this.host, event);
  };

  protected schedulePolygonFilterGuards = (): void => {
    return schedulePolygonFilterGuards(this.host);
  };

  protected initializeMapConnectionOnce = (jimuMapView: JimuMapView) =>
    initializeMapConnectionOnce(this.host, jimuMapView);

  protected initializeDataSourceOnlyConnection = (failureMessage = "Could not resolve a queryable layer for the selected data source(s)."): Promise<void> =>
    initializeDataSourceOnlyConnection(this.host, failureMessage);

  protected finalizeConnection = (featureLayers: __esri.FeatureLayer[], jimuMapView: JimuMapView | null): Promise<void> =>
    finalizeConnection(this.host, featureLayers, jimuMapView);

  protected resolveFeatureLayerFromOneUseDataSource = (useDs: IMUseDataSource, jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer | null> =>
    resolveFeatureLayerFromOneUseDataSource(this.host, useDs, jimuMapView);

  protected resolveSpatialMapLayers = (jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer[]> =>
    resolveSpatialMapLayers(this.host, jimuMapView);

  protected resolveFeatureLayersFromUseDataSources = (jimuMapView: JimuMapView | null): Promise<__esri.FeatureLayer[]> =>
    resolveFeatureLayersFromUseDataSources(this.host, jimuMapView);

  protected buildLayerViloyatIndex = (): Promise<void> =>
    buildLayerViloyatIndex(this.host);

  protected detectNdviStatusDateFieldsFromLayer = (): void =>
    detectNdviStatusDateFieldsFromLayer(this.host);

  onDataSourceCreated = (ds: DataSource) =>
    onDataSourceCreated(this.host, ds);

  onDataSourceInfoChange = (info: IMDataSourceInfo) =>
    onDataSourceInfoChange(this.host, info);

  retryMapConnection = () =>
    retryMapConnection(this.host);

  protected runInitialDataLoad = (): Promise<void> =>
    runInitialDataLoad(this.host);
}
