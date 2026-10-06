import type { IndicatorWidgetHost } from "../indicator-host";
import { JimuMapView } from "jimu-arcgis";
import { normalizeApos } from "../../../../data/agri-sql";
import { FILTER_FIELDS } from "../indicator-constants";
import { getAgriTableDataLayer } from "../../../../gis/agri-table-data-source";
import { DataSource, QueriableDataSource, DataSourceStatus } from "jimu-core";
import { agriVhIndicatorLog } from "../../../../gis/agri-debug-log";
import { errorMessage, toPlainRecord } from "../../../../shared/agri-plain-object";
import { isRepublicFeatureLayer, pickDefaultFeatureLayer } from "../../../panel-layer-helpers";

const VILOYAT_INDEX_MAX_ROWS = 5000;

export const ensureInitialization = (host: IndicatorWidgetHost) => {
  const { dataSource, connectionStatus } = host.state;
  const { config } = host.props;

  if (config?.useApiDataSource) {
    if (!host.shouldFetchForViloyat()) {
      host.setState({
        loading: true,
        error: null,
        vegetationArea: null,
        totalArea: null,
        featureCount: 0,
      });
      return;
    }
    host.fetchApiData();
  } else if (dataSource && connectionStatus === "connected") {
    if (!host.shouldFetchForViloyat()) {
      host.setState({
        loading: true,
        error: null,
        vegetationArea: null,
        totalArea: null,
        featureCount: 0,
      });
      return;
    }
    host.fetchData();
  } else if (
    connectionStatus === "failed" ||
    connectionStatus === "connecting"
  ) {
    host.retryMapConnection();
  }
};

export function retryMapConnection(host: IndicatorWidgetHost) {
  host.setState({
    connectionStatus: "connecting",
    mapConnectionAttempts: 0,
    error: null,
  });
}

export const onActiveViewChange = (host: IndicatorWidgetHost, jimuMapView: JimuMapView) => {
  if (!jimuMapView) {
    host.setState({ activeMapView: null, featureLayer: null });
    return;
  }

  host.setState({ activeMapView: jimuMapView }, () => {
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
  });
};

export const makeViloyatKeyForRouting = (host: IndicatorWidgetHost, viloyat: string): string => {
  return normalizeApos(viloyat || "")
    .replace(/['ʻʼ`´]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export const getFeatureLayerForViloyat = (host: IndicatorWidgetHost, viloyat: string, layersOverride?: __esri.FeatureLayer[]): __esri.FeatureLayer | undefined => {
  const key = host.makeViloyatKeyForRouting(viloyat);
  const idx = host._viloyatKeyToLayerIndex[key];
  const layers = layersOverride ?? host.state.featureLayers ?? [];
  if (typeof idx === "number" && layers[idx]) return layers[idx];
  return host.state.featureLayer || layers[0];
};

export const isRepublicLayer = (host: IndicatorWidgetHost, layer?: __esri.FeatureLayer): boolean =>
  isRepublicFeatureLayer(layer);

export const getDefaultFeatureLayer = (host: IndicatorWidgetHost, layersOverride?: __esri.FeatureLayer[]): __esri.FeatureLayer | undefined => {
  const layers =
    layersOverride && layersOverride.length
      ? layersOverride
      : host.state.featureLayers;
  return pickDefaultFeatureLayer(layers, host.state.featureLayer, (l) =>
    host.isRepublicLayer(l),
  );
};

export const buildViloyatLayerIndex = async (host: IndicatorWidgetHost, layers: __esri.FeatureLayer[]): Promise<void> => {
  host._viloyatKeyToLayerIndex = {};

  const vilField = FILTER_FIELDS.VILOYAT;
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer) continue;
    try {
      if (!layer.loaded && typeof layer.load === "function") await layer.load();

      const q = layer.createQuery();
      q.where = "1=1";
      q.outFields = [vilField];
      q.returnGeometry = false;
      q.returnDistinctValues = true;
      // PostgreSQL DISTINCT requires ORDER BY fields to be selected too.
      q.orderByFields = [`${vilField} ASC`];
      q.num = VILOYAT_INDEX_MAX_ROWS;

      const res = await layer.queryFeatures(q);
      const feats = res?.features ?? [];
      for (const f of feats) {
        const v = toPlainRecord(f.attributes)?.[vilField];
        const key = host.makeViloyatKeyForRouting(String(v ?? ""));
        if (key && host._viloyatKeyToLayerIndex[key] === undefined) {
          host._viloyatKeyToLayerIndex[key] = i;
        }
      }
    } catch (error) {
      // Layer stays unindexed; routing falls back to the default layer.
      agriVhIndicatorLog("viloyat-layer-index-failed", {
        layerIndex: i,
        error: errorMessage(error),
      });
    }
  }
  
};

export const initializeMapConnection = (host: IndicatorWidgetHost, jimuMapView: JimuMapView): Promise<void> => {
  if (host.state.connectionStatus === 'connected') return Promise.resolve();
  if (host._mapConnectionPromise) return host._mapConnectionPromise;
  const run = host.initializeMapConnectionOnce(jimuMapView).finally(() => {
    if (host._mapConnectionPromise === run) host._mapConnectionPromise = null;
  });
  host._mapConnectionPromise = run;
  return run;
};

export const initializeMapConnectionOnce = async (host: IndicatorWidgetHost, jimuMapView: JimuMapView) => {
  // Agri_table_data is an external Table, not part of the map — it is
  // loaded directly by URL instead of scanned from the map's layers.
  let featureLayers: __esri.FeatureLayer[];
  try {
    const { layer } = await getAgriTableDataLayer();
    featureLayers = [layer];
  } catch {
    host.setState({
      connectionStatus: "failed",
      error: "Agri_table_data external layer failed to load.",
    });
    return;
  }

  await host.buildViloyatLayerIndex(featureLayers);

  const routed = host.getDefaultFeatureLayer(featureLayers);
  host._canonicalFeatureLayer = routed;

  

  host.setState(
    {
      featureLayers,
      featureLayer: routed,
      connectionStatus: "connected",
      error: null,
    },
    () => {
      // No builder-assigned Data Source is required — Agri_table_data is
      // loaded directly by URL above, independent of useDataSources.
      if (host.shouldFetchForViloyat()) host.fetchData();
      else {
        host.setState({
          loading: true,
          error: null,
          vegetationArea: null,
          totalArea: null,
          featureCount: 0,
        });
      }
    },
  );
};

export const onDataSourceCreated = (host: IndicatorWidgetHost, dataSource: DataSource) => {
  host.setState(
    {
      dataSource: dataSource as QueriableDataSource,
      error: null,
    },
    () => {
      if (
        !host.props.config?.useApiDataSource &&
        host.state.connectionStatus === "connected"
      ) {
        if (host.shouldFetchForViloyat()) host.fetchData();
        else
          host.setState({
            loading: true,
            error: null,
            vegetationArea: null,
            totalArea: null,
            featureCount: 0,
          });
      }
    },
  );
};

export const onDataSourceInfoChange = (host: IndicatorWidgetHost, info: unknown) => {
  if (host.props.config?.useApiDataSource) return;
  if (host.state.connectionStatus !== "connected") return;

  const record = toPlainRecord(info);
  if (record && record.status === DataSourceStatus.Loaded) {
    const selectIds = record.selectIds;
    const isSelectionChange = Array.isArray(selectIds) && selectIds.length > 0;
    if (!isSelectionChange) host.throttledFetchData();
  }
};
