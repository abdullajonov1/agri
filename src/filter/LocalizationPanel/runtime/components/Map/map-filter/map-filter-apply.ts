import type { MapFilterApplyHost } from "../map-host";
import { type MapZoomRequest, buildDefinitionExpressionDigest, isGeographyZoomReason, shouldNavigateMapZoom } from "../../../../../localization/map-zoom-policy";
import { agriLog } from "../../localization-log";
import { runFilterPaintStage } from "./map-filter-paint-stage";
import { type AdminBoundaryResult, repaintAdminBoundaries, runAdminBoundarySyncStage } from "./map-filter-admin-boundary";
import { buildNavigationContext, decideCoverStage, runNavigationStage, scheduleSettleRepaintStage, trackPolygonModeExit } from "./map-filter-apply-stages";

export const applyMapFiltersOptimized = async (
  host: MapFilterApplyHost,
  zoomRequest: MapZoomRequest = { mode: "none", reason: "other" },
  isApplyCurrent?: () => boolean,
): Promise<void> => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;

  const requestId = ++host._zoomRequestId;
  const { featureLayer, featureLayers, activeMapView } = host.state;
  const primaryLayer = featureLayer ?? featureLayers?.[0];
  if (!primaryLayer) return;

  const stillCurrent = () =>
    host._isMounted &&
    requestId === host._zoomRequestId &&
    (!isApplyCurrent || isApplyCurrent());

  const { coverMap, coverReason, vhOnly, expectRegionLayer } = decideCoverStage(host, zoomRequest);
  const paintCurrent = await runFilterPaintStage(host, zoomRequest, stillCurrent, {
    coverMap,
    coverReason,
    vhOnly,
  });
  if (!paintCurrent) return;

  const adminBoundary: AdminBoundaryResult = { extent: null, level: "none" };
  await runAdminBoundarySyncStage(host, activeMapView, adminBoundary, stillCurrent);

  const expressionDigest = buildDefinitionExpressionDigest(
    featureLayers || [],
  );
  const justExitedPolygonMode = trackPolygonModeExit(host);

  // Geography zooms must run even when the same setState also cleared
  // polygonMode (field → new tuman / Back to viloyat). Only skip a bare
  // "other" pass that coincides with popup close — AgriPopup restores the
  // pre-field extent itself.
  const isGeographyZoom = isGeographyZoomReason(zoomRequest.reason);

  const zoomEnabled = host.props.config?.settings?.zoomToSelection !== false;
  const shouldNavigate = shouldNavigateMapZoom({
    zoomEnabled,
    zoomMode: zoomRequest.mode,
    hasActiveMapView: Boolean(activeMapView),
    zoomReason: zoomRequest.reason,
    polygonMode: host.state.polygonMode,
    justExitedPolygonMode,
  });

  if (stillCurrent() && expectRegionLayer && isGeographyZoom) {
    scheduleSettleRepaintStage(host, requestId, zoomRequest, shouldNavigate);
  }

  if (!shouldNavigate || !activeMapView) {
    agriLog("zoom:SKIP", {
      reason: zoomRequest.reason,
      mode: zoomRequest.mode,
      zoomEnabled,
      polygonMode: host.state.polygonMode,
      justExitedPolygonMode,
      isGeographyZoom,
    });
    host._prevDefinitionExpression = expressionDigest;
    host._allowClearOnce = false;
    return;
  }

  const ctx = buildNavigationContext(host, zoomRequest, activeMapView, primaryLayer, adminBoundary, requestId);
  try {
    await runNavigationStage(ctx);
  } finally {
    host._allowClearOnce = false;
    host._prevDefinitionExpression = expressionDigest;
    repaintAdminBoundaries(host, activeMapView, stillCurrent);
  }
};
