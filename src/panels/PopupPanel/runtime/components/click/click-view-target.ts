import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { getQueryableLayer, getAgriLayerMapKey } from "../../../../../gis/feature-layer-data";
import type { ClickContext, ClickHit } from "./click-view-shared";

export interface ClickTarget {
  clickedLayer: __esri.FeatureLayer;
  layerKey: string;
  dsId: string | null;
  oidField: string;
  oid: unknown;
}

const failOpen = (ctx: ClickContext, error: string): void => {
  if (ctx.isStale()) return;
  ctx.host.setState({
    loading: false,
    error,
    showPopup: false,
    loadingAttachments: false,
    attachments: [],
  });
  ctx.host.clearHighlight();
};

/** Resolves the live layer, its OID field and the hit OID; null when the click must stop. */
export const resolveClickTarget = (
  ctx: ClickContext,
  g: ClickHit["graphic"],
  queryHitLayer: ClickHit["queryHitLayer"],
): ClickTarget | null => {
  const { host, view } = ctx;
  // queryFeatures results have no graphic.layer — use the layer we queried
  const clickedLayer = (
    queryHitLayer
      ? host.toLiveMapLayer(queryHitLayer, view.map) || queryHitLayer
      : host.toLiveMapLayer(getQueryableLayer(g.layer) || g.layer, view.map)
  ) as __esri.FeatureLayer;
  if (!clickedLayer) {
    agriMapClickWarn("no live layer for hit graphic");
    if (!ctx.isStale()) host.setState({ loading: false, showPopup: false });
    return null;
  }
  const layerKey =
    getAgriLayerMapKey(clickedLayer) ||
    String(clickedLayer?.url || clickedLayer?.id || "");
  const dsId = host.state.layerKeyToDsId?.[layerKey] || null;
  agriMapClickDebug("layer:resolved", {
    title: clickedLayer.title,
    id: clickedLayer.id,
    url: clickedLayer.url || null,
    layerKey,
    dataSourceId: dsId,
    definitionExpression: clickedLayer.definitionExpression || null,
  });

  const oidField =
    clickedLayer.objectIdField ||
    clickedLayer.fields?.find((fld) => fld.type === "oid")?.name ||
    null;
  if (!oidField) {
    failOpen(ctx, host.tr("error.objectIdFieldMissing"));
    return null;
  }
  const oid = g.attributes?.[oidField];
  if (oid == null) {
    failOpen(ctx, host.tr("error.objectIdMissing", { field: oidField }));
    return null;
  }
  return { clickedLayer, layerKey, dsId, oidField, oid };
};
