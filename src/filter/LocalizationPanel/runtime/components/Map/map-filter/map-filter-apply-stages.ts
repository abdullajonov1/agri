import type { MapFilterApplyHost } from "../map-host";
import { type MapZoomRequest, decideMapSurfaceCover } from "../../../../../localization/map-zoom-policy";
import { isShownRegionYearLayerOpaque } from "../../../../../localization/map-filter-apply";
import { agriLog } from "../../localization-log";
import { zoomGoToDurationMsForReason, isDistrictZoomPath } from "../../../../../localization/map-zoom-target";
import { errorMessage, errorName } from "../../../../../../shared/agri-plain-object";
import { createExtentNavigator, queryShownRegionYearExtent as queryShownRegionYearExtentFor } from "./map-filter-zoom-extent";
import { type AdminBoundaryResult, createAdminBoundaryExtentResolver } from "./map-filter-admin-boundary";
import { type NavigationContext, navigateDistrictZoom, navigateHomeZoom, navigateMergedExtentZoom } from "./map-filter-navigation";

type CoverDecision = ReturnType<typeof decideMapSurfaceCover>;

export interface CoverStage extends CoverDecision {
  expectRegionLayer: boolean;
}

const SETTLE_EXTRA_MS = 120;
const SETTLE_NO_NAVIGATE_MS = 150;

/**
 * Cover the map only when a region layer is about to be revealed from
 * scratch (opacity 0 / new year-region). Re-filtering tuman/turi on an
 * already-visible opaque layer must stay clickable.
 */
export const decideCoverStage = (
  host: MapFilterApplyHost,
  zoomRequest: MapZoomRequest,
): CoverStage => {
  const expectRegionLayer = !!String(host.getEffectiveViloyat() || "").trim();
  const alreadyOpaqueRegion =
    expectRegionLayer &&
    (host._lastShownRegionYearLayers || []).some((entry) =>
      isShownRegionYearLayerOpaque(entry),
    );
  const decision = decideMapSurfaceCover({
    expectRegionLayer,
    alreadyOpaqueRegion,
    zoomReason: zoomRequest.reason,
    vhSelected: !!String(host.state.vh || "").trim(),
    vhUniqueIdsReady: Array.isArray(host._vhMapUniqueIds),
  });
  return { ...decision, expectRegionLayer };
};

/** Records the polygon mode and reports whether it was just exited. */
export const trackPolygonModeExit = (host: MapFilterApplyHost): boolean => {
  const wasPolygonMode = host._prevPolygonModeForZoomGuard;
  host._prevPolygonModeForZoomGuard = host.state.polygonMode;
  return Boolean(wasPolygonMode && !host.state.polygonMode);
};

/**
 * goTo aborts in-flight MapImage export — fields stay blank until the
 * user zooms by hand. Reassert DE + refresh after the animation settles.
 */
export const scheduleSettleRepaintStage = (
  host: MapFilterApplyHost,
  requestId: number,
  zoomRequest: MapZoomRequest,
  shouldNavigate: boolean,
): void => {
  const settleDelay = shouldNavigate
    ? zoomGoToDurationMsForReason(zoomRequest.reason) + SETTLE_EXTRA_MS
    : SETTLE_NO_NAVIGATE_MS;
  host.scheduleShownRegionYearSettleRepaint(
    requestId,
    settleDelay,
    `after-${zoomRequest.reason}`,
  );
};

export const buildNavigationContext = (
  host: MapFilterApplyHost,
  zoomRequest: MapZoomRequest,
  activeMapView: NonNullable<MapFilterApplyHost["state"]["activeMapView"]>,
  primaryLayer: NavigationContext["primaryLayer"],
  adminBoundary: AdminBoundaryResult,
  requestId: number,
): NavigationContext => {
  const view = activeMapView.view;
  const isStale = (): boolean =>
    !host._isMounted || requestId !== host._zoomRequestId;
  return {
    host,
    zoomRequest,
    view,
    primaryLayer,
    adminBoundary,
    isStale,
    navigate: createExtentNavigator(view, isStale),
    queryShownRegionYearExtent: () =>
      queryShownRegionYearExtentFor(host, zoomRequest, isStale),
    resolveAdminBoundaryExtent: createAdminBoundaryExtentResolver(
      host,
      activeMapView,
      adminBoundary,
      isStale,
    ),
  };
};

/** Runs the matching zoom path; AbortError is silent, others are logged. */
export const runNavigationStage = async (ctx: NavigationContext): Promise<void> => {
  const { host, zoomRequest, adminBoundary } = ctx;
  try {
    agriLog("zoom:navigate-start", {
      reason: zoomRequest.reason,
      mode: zoomRequest.mode,
      viloyat: host.getEffectiveViloyat(),
      tuman: host.state.tuman,
      shownLayerCount: (host._lastShownRegionYearLayers || []).length,
      adminBoundaryLevel: adminBoundary.level,
    });
    if (isDistrictZoomPath(zoomRequest.reason, host.state.tuman || "")) {
      await navigateDistrictZoom(ctx);
    } else if (zoomRequest.mode === "home") {
      await navigateHomeZoom(ctx);
    } else {
      await navigateMergedExtentZoom(ctx);
    }
  } catch (error) {
    if (errorName(error) !== "AbortError") {
      agriLog("zoom:navigation-failed", {
        reason: zoomRequest.reason,
        message: errorMessage(error),
      });
    }
  }
};
