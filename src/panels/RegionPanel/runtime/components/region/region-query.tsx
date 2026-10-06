import type { RegionWidgetHost } from "../../region-host";
import { JimuMapView } from "jimu-arcgis";
import { getQueryableLayer } from "../../../../../gis/feature-layer-data";
import { DataSourceManager, DataSource, QueriableDataSource } from "jimu-core";
import { findAreaFieldNumeric } from "../../../../../data/agri-area-field";
import { normalizeAposKey } from "../../../../../data/agri-sql";
import { buildRegionAggregatesWhere } from "../../../../../controller/agri-where-builder";
import type { RegionalDataItem } from "../../widget";
import { type RegionGroupAccumulator, regionOutStatName, accumulateRegionGroupFeaturesByCode, regionAccumulatorToSortedRows } from "../../../../../data/agri-region-stats";
import { getRegionGroupFeaturesCached } from "../../../../../data/agri-stats-store";
import { resolveRegionAggregateView, mapRegionPackRows, applyRegionRowPercentages } from "../../../../../data/agri-dashboard-pack-apply";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../../store/agri-dashboard-store";
import { matchRegionDashboardPack } from "../../../../../data/agri-dashboard-pack-match";
import type { AgriStatFeature } from "../../../../../data/agri-stats-store";
import { messageOf } from "../../../../panel-filter-detail";
import type { RegionUseDataSourceRef } from "../../region-host";

/** Layer shape accepted by the shared queryable-layer resolver. */
type QueryableLayerInput = Parameters<typeof getQueryableLayer>[0];

/** Some jimu layer views also carry the plain `dataSourceId`. */
type JimuLayerViewRef = ReturnType<JimuMapView["getAllJimuLayerViews"]>[number] & {
  dataSourceId?: string;
};

/** Layer-backed data sources (FeatureLayer / MapService) expose these at runtime. */
interface LayerBackedDataSource {
  getLayer?: () => Promise<QueryableLayerInput>;
  url?: string;
  layer?: { url?: string };
}

export const resolveFeatureLayerFromOneUseDataSource = async (host: RegionWidgetHost, useDs: RegionUseDataSourceRef | null | undefined, jimuMapView: JimuMapView): Promise<__esri.FeatureLayer | null> => {
  if (!jimuMapView?.view?.map || !useDs?.dataSourceId) return null;

  const dsId = useDs.dataSourceId;
  const rootId = useDs.rootDataSourceId;

  const jlvList: JimuLayerViewRef[] = jimuMapView.getAllJimuLayerViews?.() || [];
  const matchByDsId = (id: string) =>
    jlvList.find(
      (lv) => lv?.layerDataSourceId === id || lv?.dataSourceId === id,
    );
  let jlv = matchByDsId(dsId) || (rootId ? matchByDsId(rootId) : null);
  // getQueryableLayer handles both plain FeatureLayers and Map Image Layer
  // roots by drilling into .sublayers/.allSublayers for a queryable child —
  // the same shared helper agri/agri-main's widgets rely on.
  const jlvQueryable = getQueryableLayer(jlv?.layer);
  if (jlvQueryable) {
    return jlvQueryable as __esri.FeatureLayer;
  }

  try {
    const ds = DataSourceManager.getInstance().getDataSource(dsId) as
      | (DataSource & LayerBackedDataSource)
      | null;
    if (ds?.getLayer) {
      const lyr = await ds.getLayer();
      const queryableLyr = getQueryableLayer(lyr);
      if (queryableLyr) return queryableLyr as __esri.FeatureLayer;
    }
    const url: string | undefined = ds?.url || ds?.layer?.url;
    if (url) {
      const layers = jimuMapView.view.map.layers.toArray() as QueryableLayerInput[];
      const cand = layers.find((ly) => ly?.url === url);
      const queryableCand = getQueryableLayer(cand);
      if (queryableCand) return queryableCand as __esri.FeatureLayer;
    }
  } catch {
    /* ignore */
  }

  return null;
};
export const splitLabelTwoLines = (host: RegionWidgetHost, label: string): [string, string?] => {
  // Single-line + CSS ellipsis (eco RegionStatsChart overflow: truncate).
  const safe = String(label || "").trim();
  return [safe || ""];
};
export const calculateDynamicYAxisWidth = (host: RegionWidgetHost): number => {
  // Fixed label column like eco-monitoring RegionStatsChart
  // (axisYLabelWidth ~88–104). Long names truncate with "…".
  const { widgetSize } = host.state;
  if (widgetSize === "xs") return 78;
  if (widgetSize === "sm") return 88;
  if (widgetSize === "md") return 96;
  return 104;
};
export const resolveFeatureLayersFromUseDataSources = async (host: RegionWidgetHost, jimuMapView: JimuMapView): Promise<__esri.FeatureLayer[]> => {
  const raw =
    host.props.useDataSources?.asMutable?.() ??
    host.props.useDataSources ??
    [];
  const useDss = Array.isArray(raw) ? raw : [];
  const layers: __esri.FeatureLayer[] = [];
  for (const useDs of useDss) {
    const layer = await host.resolveFeatureLayerFromOneUseDataSource(
      useDs,
      jimuMapView,
    );
    if (layer) layers.push(layer);
  }
  return layers;
};
export const detectAreaField = (host: RegionWidgetHost, layer: __esri.FeatureLayer): string | null =>
  findAreaFieldNumeric(layer, {
      configField: host.props.config?.areaField,
    });
export const onDataSourceCreated = (host: RegionWidgetHost, ds: DataSource) => {
  host.setState({ dataSource: ds as QueriableDataSource });
};
export const normalizeApos = (host: RegionWidgetHost, s: string) =>
  normalizeAposKey(s);
export function buildWhereForAggregates(host: RegionWidgetHost, viewOverride?: "viloyat" | "tuman", drillViloyatOverride?: string): string {
  const { currentFilters, lockedViloyat } = host.state;
  const view = viewOverride || host.state.currentView;

  const effectiveLock = lockedViloyat || "";
  const drillViloyat =
    drillViloyatOverride ||
    host.state.selectedViloyatForDrillDown ||
    effectiveLock ||
    currentFilters.viloyat ||
    "";

  return buildRegionAggregatesWhere({
    yil: currentFilters.yil || "",
    viloyat: currentFilters.viloyat || "",
    // Hudud ignores Pie crop — omit turi/turlar from the aggregate WHERE.
    turi: "",
    turlar: [],
    lockedViloyat: effectiveLock,
    view,
    drillViloyat,
  });
}
/**
 * Hudud (Region) is never scoped by Vegetatsiya Holati or ekin turi —
 * only yil / geography. Kept as a no-op wrapper so queryAggregates stays simple.
 */
export const buildVhScopedWheres = async (host: RegionWidgetHost, baseWhere: string): Promise<string[]> => {
  return [baseWhere];
};
export const queryAggregates = async (host: RegionWidgetHost, groupField: string, whereOverride?: string, codeField?: string | null): Promise<RegionalDataItem[]> => {
  const { featureLayers, featureLayer, areaField, statMode } = host.state;
  const layers = featureLayers?.length
    ? featureLayers
    : featureLayer
      ? [featureLayer]
      : [];
  if (!layers.length) return [];

  const acc: RegionGroupAccumulator = {};
  const where = whereOverride || host.buildWhereForAggregates();
  const scopedWheres = await host.buildVhScopedWheres(where);
  const outName = regionOutStatName(statMode as "sum" | "count");

  for (const fl of layers) {
    // Reuse the already-loaded Agri_table_data singleton — do not
    // new FeatureLayer().load() per aggregate (extra FeatureServer?f=json).
    const layerForQuery = fl as __esri.FeatureLayer;
    if (!layerForQuery?.loaded && typeof layerForQuery?.load === "function") {
      try {
        await layerForQuery.load();
      } catch {
        /* query may still succeed */
      }
    }

    const queryOne = async (scopedWhere: string): Promise<AgriStatFeature[]> => {
      return getRegionGroupFeaturesCached({
        layer: layerForQuery,
        where: scopedWhere,
        groupField,
        codeField: codeField ?? null,
        statMode,
        areaField,
        objectIdField: layerForQuery.objectIdField || "OBJECTID",
      });
    };

    // Avoid both the old sequential waterfall and an unbounded request
    // burst. Four concurrent statistics queries keeps the server responsive.
    const concurrency = 4;
    for (let i = 0; i < scopedWheres.length; i += concurrency) {
      const batches = await Promise.all(
        scopedWheres.slice(i, i + concurrency).map(queryOne),
      );
      for (const feats of batches) {
        accumulateRegionGroupFeaturesByCode(
          feats,
          { groupField, codeField: codeField ?? null, outName },
          acc,
        );
      }
    }
  }

  return regionAccumulatorToSortedRows(acc) as RegionalDataItem[];
};
export const fetchRegionalData = async (host: RegionWidgetHost) => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;

  const requestId = ++host._regionalRequestId;
  const isCurrent = () =>
    host._isMounted && requestId === host._regionalRequestId;
  const { currentFilters, lockedViloyat } = host.state;

  // ✅ Only require YEAR
  if (!currentFilters.yil) {
    host.setState({
      regionalData: { viloyatlar: [], tumanlar: [], totalArea: 0 },
      regionalLoading: false,
      regionalError: null,
      currentView: "viloyat",
      selectedViloyatForDrillDown: null,
      selectedRegion: null,
    });
    return;
  }

  host.setState({
    // Every real query gets a visible pending state. Existing bars must not
    // remain interactive while they represent the previous filter.
    regionalLoading: true,
    regionalError: null,
  });

  try {
    const { effectiveViloyat, effectiveView, groupField, codeField } =
      resolveRegionAggregateView({
        lockedViloyat,
        selectedViloyatForDrillDown: host.state.selectedViloyatForDrillDown,
        filterViloyat: currentFilters.viloyat,
      });

    const where = host.buildWhereForAggregates(
      effectiveView,
      effectiveViloyat,
    );
    // Region ignores VH — never wait on vhUniqueids / flash empty under VH.

    // Shared DashboardPack hit — Region is never VH-scoped, so pack is OK
    // even while Pie/Indicator are deferred under an active VH status.
    let rows: RegionalDataItem[] | null = null;
    let packTotalArea: number | null = null;
    {
      await waitForDashboardPackReady(2500);
      if (!isCurrent()) return;
      const regionPack = matchRegionDashboardPack(getDashboardPack(), {
        view: effectiveView,
        groupField,
        where,
        hasVh: false,
      });
      if (regionPack) {
        rows = mapRegionPackRows(regionPack);
        packTotalArea = regionPack.totalArea;
      }
    }
    if (!rows) {
      rows = await host.queryAggregates(groupField, where, codeField);
    }
    if (!isCurrent()) return;

    const { totalArea, withPct } = applyRegionRowPercentages(
      rows,
      packTotalArea,
    );

    if (!isCurrent()) return;

    // ✅ Sync view state so UI matches the real effective view
    if (effectiveView === "tuman") {
      if (
        host.state.currentView !== "tuman" ||
        host.state.selectedViloyatForDrillDown !== effectiveViloyat
      ) {
        host.setState({
          currentView: "tuman",
          selectedViloyatForDrillDown: effectiveViloyat,
          selectedRegion: host.state.selectedRegion, // keep
        });
      }

      host.setState({
        regionalData: { viloyatlar: [], tumanlar: withPct, totalArea },
        displayCount: host.resolveDisplayCountForData(withPct.length),
        regionalLoading: false,
        regionalError: null,
      });
    } else {
      if (host.state.currentView !== "viloyat") {
        host.setState({
          currentView: "viloyat",
          selectedViloyatForDrillDown: null,
          selectedRegion: null,
        });
      }

      host.setState({
        regionalData: { viloyatlar: withPct, tumanlar: [], totalArea },
        regionalLoading: false,
        regionalError: null,
      });
    }
  } catch (e) {
    if (!isCurrent()) return;
    host.setState({
      regionalError: `Failed to load data: ${messageOf(e) || e}`,
      regionalLoading: false,
    });
  }
};
export const fetchRegionalDataDeduped = async (host: RegionWidgetHost) => {
  const {
    currentFilters,
    currentView,
    selectedViloyatForDrillDown,
    lockedViloyat,
  } = host.state;

  const key = JSON.stringify({
    yil: currentFilters.yil || "",
    view: currentView,
    drillViloyat: selectedViloyatForDrillDown || "",
    lockedViloyat: lockedViloyat || "",
  });

  if (key === host._lastRegionalFetchKey) {
    return;
  }

  host._lastRegionalFetchKey = key;
  await host.fetchRegionalData();
};
