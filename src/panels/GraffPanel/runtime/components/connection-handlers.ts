import type { GraffWidgetHost } from "../graff-host";
import { JimuMapView } from "jimu-arcgis";
import { getCropDisplayName } from "../../../../shared/agri-crop-labels";
import type { RecordData } from "../widget";
import { NDVI_STATUS_TO_VH } from "../../../../filter/localization/vh-constants";
import { getAgriTableDataLayer } from "../../../../gis/agri-table-data-source";
import { buildSelectionSymbol, clearMapSelectionGraphics } from "../graff-map-utils";
import { getQueryableLayer } from "../../../../gis/feature-layer-data";
import { DataSourceManager } from "jimu-core";
import { getAgriDashboardBootstrap } from "../../../../data/agri-bootstrap";
import type { AgriLanguage } from "../../../../shared/agri-language";
import { translateAgriPlaceForDisplay } from "../../../../shared/agri-place-display";

function translateForDisplay(
  text: string,
  language: AgriLanguage,
  placeKind?: "region" | "district",
): string {
  return translateAgriPlaceForDisplay(text, language, placeKind ?? "region");
}

const getLocalizedVhCategoryLabel = (
  category: string,
  language: AgriLanguage,
): string => {
  const base = category.trim();
  if (base === "1-Juda yaxshi") {
    if (language === "en") return "Excellent";
    if (language === "ru") return "Очень хороший";
    if (language === "uz_lat") return "Juda yaxshi";
    return "Жуда яхши";
  }
  if (base === "2-Yaxshi") {
    if (language === "en") return "Good";
    if (language === "ru") return "Хороший";
    if (language === "uz_lat") return "Yaxshi";
    return "Яхши";
  }
  if (base === "3-O'rta") {
    if (language === "en") return "Moderate";
    if (language === "ru") return "Средний";
    if (language === "uz_lat") return "O'rta";
    return "Ўрта";
  }
  if (base === "4-Past") {
    if (language === "en") return "Poor";
    if (language === "ru") return "Низкий";
    if (language === "uz_lat") return "Past";
    return "Паст";
  }
  return category;
};

// Required fields for the widget to function
const REQUIRED_FIELDS = [
  "uniqueid",
  "tuman",
  "f_name",
  "f_inn",
  "maydon",
  "turi",
  "vh",
  "viloyat",
  "yil",
];

export function retryMapConnection(host: GraffWidgetHost) {

  host.setState({
    connectionStatus: "connecting",
    mapConnectionAttempts: 0,
    error: null,
  });
}

export const onActiveViewChange = (host: GraffWidgetHost, jimuMapView: JimuMapView) => {

  if (!jimuMapView) {
    
    host.detachMapHoverPrefetch();
    host.setState({
      activeMapView: null,
      featureLayer: null,
    });
    return;
  }

  host.setState(
    {
      activeMapView: jimuMapView,
    },
    () => {
      if (jimuMapView.view && jimuMapView.view.ready) {
        
        host.initializeMapConnection(jimuMapView);
      } else {
        
        const readyWatch = jimuMapView.view.watch("ready", (isReady) => {
          if (isReady) {

            readyWatch.remove();
            host.initializeMapConnection(jimuMapView);
          }
        });
      }
    },
  );
};

/** Format a field value for display */
export function formatFieldValue(host: GraffWidgetHost, fieldName: string, value: any): string {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const lowerFieldName = fieldName.toLowerCase();

  if (lowerFieldName.includes("maydon") || lowerFieldName.includes("area")) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
  }

  if (lowerFieldName.includes("date") || lowerFieldName.includes("sana")) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {}
  }

  // Translate display-only region/district names; selection notifications must use original values.
  if (lowerFieldName.includes("viloyat")) {
    return translateForDisplay(String(value), host.state.language, "region");
  }
  if (lowerFieldName.includes("tuman")) {
    return translateForDisplay(String(value), host.state.language, "district");
  }
  if (
    lowerFieldName === "turi" ||
    lowerFieldName === "uzspace" ||
    lowerFieldName === "ekin_turi" ||
    lowerFieldName === "crop_type"
  ) {
    return getCropDisplayName(value, host.state.language);
  }

  return String(value);
}

/** Get human-friendly NDVI status label for the record at the currently selected NDVI date. */
export function getStatusValueForRecord(host: GraffWidgetHost, record: RecordData): string {
  const statusField = host.getStatusFieldNameForCurrentDate();
  if (!statusField) return "N/A";

  const raw = (record as any)[statusField];
  if (raw === null || raw === undefined || raw === "") return "N/A";

  const key = String(raw).trim().toLowerCase().replace(/\s+/g, "_");
  const vhCategory = NDVI_STATUS_TO_VH[key];
  if (vhCategory)
    return getLocalizedVhCategoryLabel(vhCategory, host.state.language);

  return host.formatFieldValue(statusField, raw);
}

// AgriGraffWidget
export const initializeMapConnection = async (host: GraffWidgetHost, jimuMapView: JimuMapView) => {
  if (!host._isMounted) return;

  // Agri_table_data is an external Table, not part of the map — it is
  // loaded directly by URL instead of resolved from useDataSources/map layers.
  let featureLayers: __esri.FeatureLayer[] = [];
  try {
    const { layer } = await getAgriTableDataLayer();
    featureLayers = [layer];
  } catch {
    featureLayers = [];
  }
  const featureLayer = featureLayers?.[0] ?? null;

  if (!featureLayer) {
    host.setState({
      connectionStatus: "failed",
      error: "Agri_table_data external layer failed to load.",
    });
    return;
  }

  if (
    !featureLayer.loaded ||
    !featureLayer.fields ||
    featureLayer.fields.length === 0
  ) {
    
    try {
      await featureLayer.load();

      
      
    } catch (err: any) {
      
      host.setState({
        connectionStatus: "failed",
        error: `Error loading the configured feature layer: ${err.message || err}`,
      });
      return;
    }
  }

  if (!featureLayer.fields || featureLayer.fields.length === 0) {
    
    host.setState({
      connectionStatus: "failed",
      error:
        "Созланган қатламда ишлатиладиган майдонлар йўқ. Қатлам созламасини текшеринг.",
    });
    return;
  }

  

  const configuredFields = host.getConfiguredFilterFields();
  

  if (configuredFields.length === 0) {
    
    host.setState({
      connectionStatus: "failed",
      error:
        "Майдонлар танланмаган. Виджет созламаларида майдонларни танланг.",
    });
    return;
  }

  const layerFields = featureLayer.fields.map((f) => f.name.toLowerCase());
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !layerFields.includes(field.toLowerCase()),
  );

  if (missingFields.length > 0) {
    
    

    host.setState({
      connectionStatus: "failed",
      error: `The layer "${featureLayer.title}" is missing required fields: ${missingFields.join(", ")}. Please select a different layer that contains these fields: ${REQUIRED_FIELDS.join(", ")}`,
    });
    return;
  }

  

  host.setState(
    {
      featureLayers,
      featureLayer,
      configuredFields,
      connectionStatus: "connected",
      error: null,
      activeMapView: jimuMapView,
    },
    async () => {
      try {
        if (jimuMapView.view) {
          host.attachMapHoverPrefetch(jimuMapView.view);
        }
      } catch {
        /* ignore */
      }
      // Agri_table_data has no geometry — map-click hitTest/highlight
      // still needs the builder-assigned spatial polygon layer(s).
      try {
        const spatialClickLayers =
          await host.resolveFeatureLayersFromUseDataSources(jimuMapView);
        host.setState({ spatialClickLayers });
      } catch {
        /* map click will simply no-op without a spatial layer */
      }
      // NOT calling this.attachMapClick(jimuMapView) here anymore.
      //
      // AgriPopup already owns map-click -> polygon-inspection (it has its
      // own view.on("click", ...) listener, resolves the clicked feature,
      // and relays the result to this widget via
      // widgetSelectionChanged -> AgriLocalization -> masterFilterChanged
      // -> syncExternalPolygonSelection()). Graff's OWN handleMapClick was
      // a second, fully independent listener on the SAME view.on("click")
      // event, doing its own separate hitTest/query and setting
      // selecteduniqueid directly. Two independent async pipelines
      // resolving the same click at different speeds is a race by
      // construction: whichever finishes first "wins" the visible
      // selection, and a slow finisher landing after the user has already
      // moved on to a different polygon can silently revert/re-apply a
      // stale polygon+image — this was the actual root cause behind
      // repeated "old polygon's image still shows" reports, not something
      // patchable by timestamp-guarding each path individually.
      // Removing this second listener makes AgriPopup's relay the SOLE
      // source of truth for which polygon Graff's chart/image reflects,
      // which is guaranteed consistent with what the popup itself shows.
      await host.fetchAndStoreRegionDistrictMappings();
      await host.buildViloyatKeyToLayerIndex();

      // No builder-assigned Data Source is required — Agri_table_data is
      // loaded directly by URL above, independent of useDataSources.
      host.setState({ loading: true });
      host.fetchFilterOptions();
    },
  );
};

export const addSelectionGlow = (host: GraffWidgetHost, view: __esri.MapView | __esri.SceneView, feature: __esri.Graphic) => {
  const geometryType = feature?.geometry?.type;
  const halo = feature.clone() as any;
  halo.symbol = buildSelectionSymbol(geometryType, true);
  const core = feature.clone() as any;
  core.symbol = buildSelectionSymbol(geometryType);
  view.graphics.addMany([halo, core]);
};

export const highlightFeature = async (host: GraffWidgetHost, feature: __esri.Graphic, activeMapView: JimuMapView) => {
  try {
    const view = activeMapView.view;
    clearMapSelectionGraphics(view);

    host.addSelectionGlow(view, feature);

    try {
      void view.goTo(
        feature.geometry?.extent?.expand(1.35) || feature.geometry,
        {
        duration: 700,
        easing: "ease-in-out" as any,
      });
    } catch (goToErr) {
      /* ignore */
    }
  } catch (hErr) {
    /* ignore */
  }
};

// SIMPLIFIED: Only return fields explicitly configured in settings
export function getConfiguredFilterFields(host: GraffWidgetHost): string[] {
  const cfg = host.props?.config?.filterFields;
  if (!cfg) {
    
    return REQUIRED_FIELDS;
  }

  const dsId =
    (host.state.dataSource as any)?.id ||
    host.props.useDataSources?.[0]?.dataSourceId;

  let filterMap: Record<string, string[]>;
  if (typeof (cfg as any).asMutable === "function") {
    filterMap = (cfg as any).asMutable({ deep: true });
  } else {
    filterMap = cfg as any;
  }

  const configuredFields = dsId && filterMap[dsId] ? filterMap[dsId] : [];

  
  return configuredFields;
}

export function refreshFiltersFromConfig(host: GraffWidgetHost) {
  const fields = host.getConfiguredFilterFields();

  if (fields.length === 0) {
    
    host.setState({
      configuredFields: [],
      filterOptions: {},
      localFilters: {},
    });
    return;
  }

  const makeMap = (def: any) =>
    fields.reduce(
      (acc, f) => {
        acc[f] = def;
        return acc;
      },
      {} as Record<string, any>,
    );

  host.setState({
    configuredFields: fields,
    filterOptions: makeMap([]),
    localFilters: makeMap(""),
  });

  
}

export const resolveFeatureLayerFromDataSource = async (host: GraffWidgetHost, jimuMapView: JimuMapView, useDsOverride?: any): Promise<__esri.FeatureLayer | null> => {
  

  if (!jimuMapView?.view?.map) {
    
    return null;
  }

  const useDs = useDsOverride ?? host.props.useDataSources?.[0];
  
  

  if (!useDs?.dataSourceId) {
    
    return null;
  }

  const dsId = useDs.dataSourceId;
  const rootDsId = (useDs as any).rootDataSourceId;

  const jlvList: any[] = jimuMapView.getAllJimuLayerViews?.() || [];
  

  jlvList.forEach((lv, idx) => {
    
  });

  const matchByDsId = (id: string) =>
    jlvList.find(
      (lv) =>
        lv?.layerDataSourceId === id ||
        lv?.dataSourceId === id ||
        lv?.layer?.dataSourceId === id,
    );

  let jlv = matchByDsId(dsId) || (rootDsId ? matchByDsId(rootDsId) : null);

  // getQueryableLayer handles both plain FeatureLayers and Map Image Layer
  // roots by drilling into .sublayers/.allSublayers for a queryable child —
  // the same shared helper agri/agri-main's widgets rely on.
  const jlvQueryable = getQueryableLayer(jlv?.layer);
  if (jlvQueryable) {
    return jlvQueryable as __esri.FeatureLayer;
  }

  try {
    const dsManager = DataSourceManager.getInstance();
    const ds: any = dsManager.getDataSource(dsId);

    if (ds?.getLayer) {
      const layer = await ds.getLayer();
      const queryableLayer = getQueryableLayer(layer);

      if (queryableLayer) {
        return queryableLayer as __esri.FeatureLayer;
      }
    }

    const queryableDsLayer = getQueryableLayer(ds?.layer);
    if (queryableDsLayer) {
      return queryableDsLayer as __esri.FeatureLayer;
    }

    const url: string | undefined = ds?.url || ds?.layer?.url;

    if (url) {
      const layers = jimuMapView.view.map.layers.toArray() as any[];

      const matchedLayer = layers
        .filter((ly: any) => ly?.url === url)
        .map((ly: any) => getQueryableLayer(ly))
        .find((ly: any) => !!ly);
      if (matchedLayer) {
        return matchedLayer as __esri.FeatureLayer;
      }
    }
  } catch (e) {

  }

  
  
  return null;
};

export const resolveFeatureLayersFromUseDataSources = async (host: GraffWidgetHost, jimuMapView: JimuMapView): Promise<__esri.FeatureLayer[]> => {
  const raw =
    (host.props.useDataSources as any)?.asMutable?.() ??
    host.props.useDataSources ??
    [];
  const useDss = Array.isArray(raw) ? raw : [];

  const resolved: __esri.FeatureLayer[] = [];
  for (const useDs of useDss) {
    const fl = await host.resolveFeatureLayerFromDataSource(
      jimuMapView,
      useDs,
    );
    if (fl) resolved.push(fl);
  }
  return resolved;
};

// featureLayers/featureLayer here is always the single shared
// Agri_table_data layer (see initializeMapConnection), so a per-widget
// distinct-viloyat scan is redundant with the already-shared/cached
// queryAgriRegionDistrictMappings() — reuse it instead of re-querying.
export const buildViloyatKeyToLayerIndex = async (host: GraffWidgetHost): Promise<void> => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];

  const idx: Record<string, number> = {};

  if (layers.length > 1) {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      try {
        if (!layer?.fields || layer.fields.length === 0) {
          await layer.load();
        }
        const q = layer.createQuery();
        (q as any).where = "1=1";
        (q as any).outFields = ["viloyat"];
        (q as any).returnGeometry = false;
        (q as any).returnDistinctValues = true;
        // PostgreSQL DISTINCT requires ORDER BY fields to be selected too.
        (q as any).orderByFields = ["viloyat ASC"];
        (q as any).num = 50000;

        const res = await layer.queryFeatures(q);
        const features = res?.features ?? [];
        for (const f of features) {
          const a: any = f.attributes || {};
          const v = a?.viloyat;
          const key = host.makeRegionDistrictKey(v != null ? String(v) : null);
          if (key && idx[key] === undefined) idx[key] = i;
        }
      } catch (e) {

      }
    }
  } else if (layers.length === 1) {
    try {
      const { regionDistrictRows } = await getAgriDashboardBootstrap();
      for (const row of regionDistrictRows) {
        const key = host.makeRegionDistrictKey(row.viloyat);
        if (key && idx[key] === undefined) idx[key] = 0;
      }
    } catch (e) {

    }
  }

  host._viloyatKeyToLayerIndex = idx;

};

export const getFeatureLayerForViloyat = (host: GraffWidgetHost, viloyat: string): __esri.FeatureLayer | undefined => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];
  if (!layers.length) return undefined;
  const key = host.makeRegionDistrictKey(viloyat);
  const idx = key ? host._viloyatKeyToLayerIndex[key] : undefined;
  return typeof idx === "number" ? layers[idx] : host.state.featureLayer;
};

export const ensureInitialization = (host: GraffWidgetHost) => {
  if (!host._isMounted) {

    return;
  }

  const { featureLayer, connectionStatus, mapConnectionAttempts } = host.state;

  

  if (
    featureLayer &&
    connectionStatus === "connected" &&
    !host.state.initialDataLoaded
  ) {
    
    host.setState({ loading: true });
    host.fetchFilterOptions();
  } else if (
    connectionStatus === "failed" &&
    mapConnectionAttempts === host.MAX_CONNECTION_ATTEMPTS
  ) {
    
    host.retryMapConnection();
  }
};
