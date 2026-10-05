import type { LocalizationHost } from "../../host";
import { JimuMapView } from "jimu-arcgis";
import { agriLog } from "../../localization-log";
import { safeLoadMapImageTree, getQueryableLayer } from "../../../../../../gis/feature-layer-data";
import { DataSourceManager, DataSource, QueriableDataSource } from "jimu-core";
import { getAgriTableDataLayer } from "../../../../../../gis/agri-table-data-source";
import { dedupedQueryFeatures } from "../../../../../../data/agri-query-gateway";
import { getAgriVegetationIndicesLayer } from "../../../../../../gis/agri-vegetation-data-source";

export const resolveFeatureLayerFromOneUseDataSource = async (
  host: LocalizationHost,
  useDs: any,
  jimuMapView: JimuMapView | null,
): Promise<__esri.FeatureLayer | null> => {
  if (!useDs?.dataSourceId) {
    agriLog("resolveOne:no-dataSourceId", { useDs });
    return null;
  }
  const dsId = useDs.dataSourceId;
  const rootDsId = useDs.rootDataSourceId;
  agriLog("resolveOne:start", {
    dsId,
    rootDsId,
    hasMap: !!jimuMapView?.view?.map,
  });

  const jlvList: any[] = jimuMapView?.view?.map
    ? jimuMapView.getAllJimuLayerViews?.() || []
    : [];
  const matchByDsId = (id: string) =>
    jlvList.find(
      (lv) => lv?.layerDataSourceId === id || lv?.dataSourceId === id,
    );

  let jlv = matchByDsId(dsId) || (rootDsId ? matchByDsId(rootDsId) : null);
  // MapImage sublayers often aren't queryable until the parent finishes loading.
  try {
    await safeLoadMapImageTree(jlv?.layer);
  } catch {
    /* ignore */
  }
  // getQueryableLayer handles both plain FeatureLayers and Map Image Layer
  // roots by drilling into .sublayers/.allSublayers for a queryable child —
  // the same shared helper agri/agri-main's widgets rely on.
  const jlvQueryable = getQueryableLayer(jlv?.layer);
  agriLog("resolveOne:jlvMatch", {
    dsId,
    found: !!jlv,
    layerType: jlv?.layer?.type,
    layerTitle: jlv?.layer?.title || jlv?.layer?.url,
    queryable: !!jlvQueryable,
    sublayerCount:
      jlv?.layer?.allSublayers?.length ??
      jlv?.layer?.allSublayers?.toArray?.()?.length ??
      jlv?.layer?.sublayers?.length ??
      jlv?.layer?.sublayers?.toArray?.()?.length ??
      0,
  });
  if (jlvQueryable) {
    agriLog("resolveOne:resolved-via-jlv", { dsId });
    return jlvQueryable as __esri.FeatureLayer;
  }

  // MapImage parents are never queryable themselves. Prefer first leaf
  // sublayer with createQuery/queryFeatures after load (region-year layers).
  try {
    const rootLayer: any = jlv?.layer;
    const leafs =
      rootLayer?.allSublayers?.toArray?.() ||
      rootLayer?.sublayers?.toArray?.() ||
      [];
    for (const sub of leafs) {
      const nestedKids =
        sub?.sublayers?.toArray?.()?.length || sub?.sublayers?.length || 0;
      if (nestedKids > 0) continue;
      const leaf = getQueryableLayer(sub) || sub;
      if (
        leaf &&
        (typeof leaf.createQuery === "function" ||
          typeof leaf.queryFeatures === "function")
      ) {
        agriLog("resolveOne:resolved-via-mapimage-leaf", {
          dsId,
          title: leaf?.title || leaf?.id,
        });
        return leaf as __esri.FeatureLayer;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const ds: any = DataSourceManager.getInstance().getDataSource(dsId);
    agriLog("resolveOne:dsManagerLookup", {
      dsId,
      found: !!ds,
      hasGetLayer: typeof ds?.getLayer === "function",
    });
    if (ds?.getLayer) {
      const lyr = await ds.getLayer();
      const queryableLyr = getQueryableLayer(lyr);
      agriLog("resolveOne:ds.getLayer result", {
        dsId,
        layerType: (lyr as any)?.type,
        queryable: !!queryableLyr,
      });
      if (queryableLyr) {
        agriLog("resolveOne:resolved-via-ds.getLayer", {
          dsId,
        });
        return queryableLyr as __esri.FeatureLayer;
      }
    }
    const url: string | undefined = ds?.url || ds?.layer?.url;
    if (url && jimuMapView?.view?.map) {
      const layers = jimuMapView.view.map.layers.toArray() as any[];
      const cand = layers.find((ly: any) => ly?.url === url);
      const queryableCand = getQueryableLayer(cand);
      agriLog("resolveOne:urlMatch", {
        dsId,
        url,
        found: !!cand,
        queryable: !!queryableCand,
      });
      if (queryableCand) return queryableCand as __esri.FeatureLayer;
    }
  } catch (e) {
    agriLog("resolveOne:error", {
      dsId,
      error: String((e as any)?.message || e),
    });
  }
  agriLog("resolveOne:unresolved", { dsId });
  return null;
};
/**
 * Resolves the actual spatial polygon layer(s) rendered on the map, via the
 * builder-assigned useDataSources — Agri_table_data itself has no geometry,
 * so visual map filtering must target these instead, joined by uniqueid.
 */
export const resolveSpatialMapLayers = async (
  host: LocalizationHost,
  jimuMapView: JimuMapView | null,
): Promise<__esri.FeatureLayer[]> => {
  const raw =
    (host.props.useDataSources as any)?.asMutable?.() ??
    host.props.useDataSources ??
    [];
  const useDss = Array.isArray(raw) ? raw : [];
  const results = await Promise.all(
    useDss.map((useDs) =>
      host.resolveFeatureLayerFromOneUseDataSource(useDs, jimuMapView),
    ),
  );
  return Array.from(new Set(results.filter(Boolean))) as __esri.FeatureLayer[];
};
export const resolveFeatureLayersFromUseDataSources = async (
  host: LocalizationHost,
  jimuMapView: JimuMapView | null,
): Promise<__esri.FeatureLayer[]> => {
  // Agri_table_data is an external Table, not an operational layer on any
  // map and not required to be assigned via useDataSources — every filter
  // dropdown reads from this same singleton layer, loaded directly by URL.
  try {
    const { layer } = await getAgriTableDataLayer();
    agriLog("resolveAll:agri-table-data", {
      url: (layer as any)?.url,
    });
    return [layer as __esri.FeatureLayer];
  } catch (e) {
    agriLog("resolveAll:agri-table-data-failed", {
      error: String((e as any)?.message || e),
    });
    return [];
  }
};
export const buildLayerViloyatIndex = async (host: LocalizationHost): Promise<void> => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];
  const layerToViloyatKeys: Record<string, string[]> = {};
  const viloyatToLayerSet: Record<string, Set<string>> = {};

  // Layers are independent — query concurrently, merge sequentially for stable keys.
  const perLayer = await Promise.all(
    layers.map(async (layer) => {
      const layerKey = host.getLayerKey(layer);
      const normalizedKeys = new Set<string>();
      try {
        const res = await dedupedQueryFeatures(layer, {
          where: "1=1",
          outFields: ["viloyat"],
          returnDistinctValues: true,
          orderByFields: ["viloyat ASC"],
          returnGeometry: false,
          num: 200,
        });
        for (const f of res?.features ?? []) {
          const raw = (f.attributes as any)?.viloyat;
          const k = host.makeRegionDistrictKey(raw != null ? String(raw) : "");
          if (k) normalizedKeys.add(k);
        }
      } catch (e) {
        agriLog("buildLayerViloyatIndex:error", {
          error: String((e as any)?.message || e),
        });
      }
      return { layerKey, normalizedKeys };
    }),
  );

  for (const { layerKey, normalizedKeys } of perLayer) {
    for (const k of normalizedKeys) {
      if (!viloyatToLayerSet[k]) viloyatToLayerSet[k] = new Set<string>();
      viloyatToLayerSet[k].add(layerKey);
    }
    layerToViloyatKeys[layerKey] = Array.from(normalizedKeys);
  }

  const viloyatKeyToLayerKeys: Record<string, string[]> = {};
  Object.keys(viloyatToLayerSet).forEach((k) => {
    viloyatKeyToLayerKeys[k] = Array.from(viloyatToLayerSet[k]);
  });

  host._layerToViloyatKeys = layerToViloyatKeys;
  host._viloyatKeyToLayerKeys = viloyatKeyToLayerKeys;
};
/**
 * Inspect the primary polygon layer fields and detect NDVI status fields that follow
 * a `status_YYYY_MM_DD` pattern (or a configurable prefix). Populates:
 *  - this._ndviDateFieldMap: date label → field name
 *  - this.state.ndviDateOptions: sorted list of date labels
 *  - this.state.ndviDate: keeps existing value when possible, otherwise latest date
 */
export const detectNdviStatusDateFieldsFromLayer = (host: LocalizationHost): void => {
  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];
  if (!primaryLayer) return;

  try {
    const cfg = (host.props.config || {}) as any;
    const prefix =
      (cfg.polygonStatusPrefix || "status_").toString().trim() || "status_";

    const fields: any[] = (primaryLayer as any).fields || [];
    const dateToField: Record<string, string> = {};
    const dateLabels: string[] = [];

    for (const f of fields) {
      const name = (f?.name || "").toString();
      if (!name) continue;
      if (!name.toLowerCase().startsWith(prefix.toLowerCase())) continue;

      const rawSuffix = name.slice(prefix.length); // e.g. "2025_06_12"
      const digitsOnly = rawSuffix.replace(/[^0-9]/g, "");

      let label: string;
      if (digitsOnly.length === 8) {
        const y = digitsOnly.slice(0, 4);
        const m = digitsOnly.slice(4, 6);
        const d = digitsOnly.slice(6, 8);
        label = `${y}-${m}-${d}`; // normalized to YYYY-MM-DD
      } else {
        // Fallback: just replace underscores with dashes.
        label = rawSuffix.replace(/_/g, "-");
      }

      if (!dateToField[label]) {
        dateToField[label] = name;
        dateLabels.push(label);
      }
    }

    if (!dateLabels.length) {
      host._ndviDateFieldMap = {};
      if (host._isMounted) {
        host.setState({ ndviDateOptions: [], ndviDate: "" });
      }
      return;
    }

    dateLabels.sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      if (Number.isNaN(ta) || Number.isNaN(tb)) return a.localeCompare(b);
      return ta - tb;
    });

    host._ndviDateFieldMap = dateToField;

    if (!host._isMounted) return;
    host.setState((prev) => {
      const current = (prev.ndviDate || "").trim();
      const locked = !!prev.ndviDateLocked;
      const latest = dateLabels[dateLabels.length - 1];
      const nextSelected =
        locked && current && dateLabels.includes(current)
          ? current
          : current && dateLabels.includes(current)
            ? current
            : latest;
      return {
        ndviDateOptions: dateLabels,
        ndviDate: nextSelected,
      };
    });
  } catch (e) {
    agriLog("detectNdviStatusDateFieldsFromLayer:error", {
      error: String((e as any)?.message || e),
    });
  }
};
export const onDataSourceCreated = (host: LocalizationHost, ds: DataSource) => {
  const qds = ds as QueriableDataSource;
  const dsId = ((qds as any)?.id || "").toString();
  agriLog("onDataSourceCreated:fired", {
    dsId,
    primaryDataSourceId: host._primaryDataSourceId,
    connectionStatus: host.state?.connectionStatus,
    hasMapWidgetLinked: !!host.props.useMapWidgetIds?.length,
  });

  if (!host._primaryDataSourceId) {
    host._primaryDataSourceId = dsId || null;
  }

  // Ignore non-primary data source instances to avoid repeated init loops.
  if (
    host._primaryDataSourceId &&
    dsId &&
    dsId !== host._primaryDataSourceId
  ) {
    agriLog("onDataSourceCreated:ignored-non-primary", {
      dsId,
      primaryDataSourceId: host._primaryDataSourceId,
    });
    return;
  }

  if (typeof (qds as any).setListenSelection === "function") {
    (qds as any).setListenSelection(false);
  }
  host.setState({ dataSource: qds, error: null }, async () => {
    if (host.state.connectionStatus === "connected") {
      agriLog(
        "onDataSourceCreated:already-connected -> fetching",
      );
      await host.runInitialDataLoad();
    } else if (!host.props.useMapWidgetIds?.length) {
      // No Map widget linked — the map-based connection path never runs,
      // so connect directly using the selected data source instead.
      agriLog(
        "onDataSourceCreated:no-map-linked -> initializeDataSourceOnlyConnection",
      );
      await host.initializeDataSourceOnlyConnection();
    } else {
      agriLog(
        "onDataSourceCreated:waiting-on-map-connection",
        { connectionStatus: host.state?.connectionStatus },
      );
    }
  });
};
export const onDataSourceInfoChange = (host: LocalizationHost, info: any) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;
  if (!info) return;

  const sawRecords = Array.isArray(info.records);
  if (!sawRecords) return;

  if (host._dataSourceInfoDebounceTimer) {
    clearTimeout(host._dataSourceInfoDebounceTimer);
  }
  host._dataSourceInfoDebounceTimer = setTimeout(() => {
    if (!host._isMounted) return;
    host.fetchDataWithCurrentState();
  }, 300);
};
export const retryMapConnection = (host: LocalizationHost) => {
  host.setState({
    connectionStatus: "connecting",
    mapConnectionAttempts: 0,
    error: null,
  });
};
export const runInitialDataLoad = (host: LocalizationHost): Promise<void> => {
  if (!host._isMounted || host.state.connectionStatus !== 'connected') {
    return Promise.resolve();
  }
  if (host._readyFired) return Promise.resolve();
  if (host._initialDataLoadPromise) return host._initialDataLoadPromise;

  const run = (async () => {
    host.setState({ loading: true });
    host._allowClearOnce = true;
    // Warm vegetation FeatureLayer in parallel so the first ekin-turi VH
    // refresh does not pay layer-load latency.
    void getAgriVegetationIndicesLayer().catch(() => {
      /* best-effort warmup */
    });
    await Promise.all([
      host.buildLayerViloyatIndex(),
      host.fetchFilterOptions(),
      host.fetchAndStoreRegionDistrictMappings(),
    ]);
    if (!host._isMounted) return;
    await host.applyMapFiltersOptimized();
    // Warm all region MapImages for the default year so the first viloyat
    // click does not pay cold layer.load() latency.
    host.warmYearRegionMapImages();
    await host.fetchDataWithCurrentState();
    if (!host._isMounted) return;

    if (host.initializationTimer) {
      clearTimeout(host.initializationTimer);
      host.initializationTimer = null;
    }
    if (!host._readyFired) {
      host._readyFired = true;
      host.broadcastFilterState();
    }
  })().finally(() => {
    if (host._initialDataLoadPromise === run) {
      host._initialDataLoadPromise = null;
    }
  });

  host._initialDataLoadPromise = run;
  return run;
};
/* ---------------------- Filter Options ---------------------- */

export const getUniqueValues = async (host: LocalizationHost, fieldName: string): Promise<string[]> => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];
  if (!layers.length) return [];

  const perLayer = await Promise.all(
    layers.map((layer) => host.flDistinctFromLayer(layer, fieldName, "1=1")),
  );

  const distinct = new Set<string>();
  for (const values of perLayer) {
    values.forEach((v) => distinct.add(v));
  }

  const merged = Array.from(distinct);
  if (fieldName.toLowerCase() === "yil") {
    return merged.sort((a, b) => Number(a) - Number(b));
  }
  return merged.sort();
};
export const fetchFilterOptions = async (host: LocalizationHost) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") return;

  try {
    host.setState({ loadingFilters: true });

    const yilValues = await host.getUniqueValues("yil");

    if (!host._isMounted) return;

    // Sort years so newest is last
    const sorted = yilValues.slice().sort((a, b) => {
      const ay = parseInt(String(a).replace(/[^\d]/g, ""), 10);
      const by = parseInt(String(b).replace(/[^\d]/g, ""), 10);
      if (isNaN(ay) || isNaN(by)) return String(a).localeCompare(String(b));
      return ay - by;
    });
    const latest = sorted.length ? sorted[sorted.length - 1] : "";
    const prevYil = host.state.yil;
    const prevStillValid =
      !!prevYil && sorted.some((v) => String(v) === String(prevYil));
    // Refresh always opens default republic scope (latest year only).
    // Prior viloyat/tuman/crop filters stay in DashboardPack / stats cache
    // for 1h — re-selecting them reuses data without UI restore.
    const nextYil = prevStillValid ? prevYil : latest;

    host.setState({
      yilOptions: sorted,
      yil: nextYil,
      viloyat: "",
      tuman: "",
      turi: "",
      turlar: [],
      lockedViloyat: null,
      vh: "",
      loadingFilters: false,
      loading: false,
      error: null,
    });
  } catch (e: any) {
    if (!host._isMounted) return;
    host.setState({
      error: `Failed to fetch initial filters: ${e.message}`,
      loadingFilters: false,
    });
  }
};
export async function flDistinctFromLayer(
  host: LocalizationHost,
  layer: __esri.FeatureLayer,
  fieldName: string,
  where: string,
): Promise<string[]> {
  try {
    const res = await dedupedQueryFeatures(layer, {
      where: where || "1=1",
      outFields: [fieldName],
      returnDistinctValues: true,
      orderByFields: [`${fieldName} ASC`],
      returnGeometry: false,
    });
    const vals = (res.features ?? [])
      .map((f) => f.attributes?.[fieldName])
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map((v) => String(v));

    if (fieldName.toLowerCase() === "yil") {
      return Array.from(new Set(vals)).sort((a, b) => Number(a) - Number(b));
    }
    return Array.from(new Set(vals)).sort();
  } catch (e) {

    return [];
  }
}
