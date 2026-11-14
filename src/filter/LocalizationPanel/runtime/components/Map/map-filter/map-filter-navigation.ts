import type { MapFilterApplyHost } from "../map-host";
import { type MapZoomRequest, isEmptyMapExtent } from "../../../../../localization/map-zoom-policy";
import { agriLog, debugCatch } from "../../localization-log";
import { clearAgriAdminBoundaries } from "../../../../../../gis/agri-admin-boundary-layer";
import { zoomGoToDurationMsForReason, districtAdminExpandFactor, districtFallbackRegionExpandFactor, shouldSkipHomeGoTo, pickHomeExtentCandidate, homeGoToDurationMs, preferShownRegionYearExtent, raceRegionExtentPick, planCropNdviExtentSource, zoomExpandFactorForReason } from "../../../../../localization/map-zoom-target";
import { queryMergedSpatialExtent } from "./map-filter-spatial-extent";
import type { ExtentNavigator } from "./map-filter-zoom-extent";
import type { AdminBoundaryResult } from "./map-filter-admin-boundary";

/** Runtime `fullExtent` some web maps carry (not in the Map typings). */
type MapWithFullExtent = __esri.Map & { fullExtent?: __esri.Extent | null };

type PrimaryLayer = NonNullable<MapFilterApplyHost["state"]["featureLayer"]>;

/** Everything a navigation stage needs from the apply call. */
export interface NavigationContext {
  host: MapFilterApplyHost;
  zoomRequest: MapZoomRequest;
  view: __esri.MapView | __esri.SceneView;
  primaryLayer: PrimaryLayer;
  adminBoundary: AdminBoundaryResult;
  isStale: () => boolean;
  navigate: ExtentNavigator;
  queryShownRegionYearExtent: () => Promise<__esri.Extent | null>;
  resolveAdminBoundaryExtent: () => Promise<void>;
}

/** District zoom: admin outline first, then district feature, then region. */
export const navigateDistrictZoom = async (ctx: NavigationContext): Promise<void> => {
  const { host, view, adminBoundary, isStale, navigate } = ctx;
  // Start field extent in parallel so admin miss → fallback is warm.
  const fieldFallbackPromise = ctx.queryShownRegionYearExtent();
  await ctx.resolveAdminBoundaryExtent();
  if (!isEmptyMapExtent(adminBoundary.extent) && !isStale()) {
    agriLog("zoom:district:admin-boundary", { district: host.state.tuman });
    await navigate(adminBoundary.extent.expand(districtAdminExpandFactor()), 700);
    return;
  }
  const districtZoomed = await host.zoomToSelectedDistrict(view);
  if (districtZoomed) {
    agriLog("zoom:district:done", { district: host.state.tuman });
    return;
  }
  const [fallback] = await Promise.all([
    fieldFallbackPromise,
    ctx.resolveAdminBoundaryExtent(),
  ]);
  if (!isEmptyMapExtent(fallback) && !isStale()) {
    agriLog("zoom:district:fallback-region", {});
    await navigate(fallback.expand(districtFallbackRegionExpandFactor()), 700);
  } else if (!isEmptyMapExtent(adminBoundary.extent) && !isStale()) {
    await navigate(adminBoundary.extent.expand(districtAdminExpandFactor()), 700);
  }
};

/** Home zoom: reset to the stored / full / layer extent. */
export const navigateHomeZoom = async (ctx: NavigationContext): Promise<void> => {
  const { host, view, primaryLayer, isStale } = ctx;
  const now = Date.now();
  if (
    shouldSkipHomeGoTo({ now, lastHomeGoToAt: host._lastHomeGoToAt }) ||
    isStale()
  ) {
    return;
  }

  try {
    await clearAgriAdminBoundaries(view);
  } catch {
    /* ignore */
  }

  let home: __esri.Extent | null = pickHomeExtentCandidate({
    storedHome: host._homeExtent,
    mapFullExtent: (view.map as MapWithFullExtent)?.fullExtent,
    layerFullExtent: primaryLayer.fullExtent,
  });
  if (!home && primaryLayer?.geometryType) {
    try {
      home = (await primaryLayer.queryExtent(primaryLayer.createQuery()))?.extent;
    } catch (err) {
      debugCatch("zoom:home:query-extent-failed", err);
    }
  }

  if (!isEmptyMapExtent(home) && !isStale()) {
    host._lastHomeGoToAt = now;
    agriLog("zoom:home:goTo", {});
    await ctx.navigate(home, homeGoToDurationMs());
  }
};

/** Race field queryExtent vs admin outline for region zooms. */
const pickRegionExtent = async (ctx: NavigationContext): Promise<__esri.Extent | null> => {
  const { zoomRequest, adminBoundary } = ctx;
  // Don't wait for the slow detached MapImage extent when admin region is ready.
  const fieldPromise = ctx.queryShownRegionYearExtent();
  const adminPromise = ctx.resolveAdminBoundaryExtent();
  const raced = await raceRegionExtentPick({
    fieldPromise,
    adminPromise,
    getAdminExtent: () => adminBoundary.extent,
    getAdminLevel: () => adminBoundary.level,
    isEmptyExtent: isEmptyMapExtent,
  });
  if (raced.source === "field") {
    agriLog("zoom:region:field-extent", { reason: zoomRequest.reason });
    return raced.extent;
  }
  if (raced.source === "admin-region") {
    agriLog("zoom:region:admin-boundary", { reason: zoomRequest.reason });
    return raced.extent;
  }
  return null;
};

/**
 * Crop / NDVI / vegetation: prefer non-MapImage spatial FeatureLayers that
 * carry the uniqueid mirror. Returns `stale` when the apply was superseded.
 */
const pickCropExtent = async (
  ctx: NavigationContext,
): Promise<{ stale: boolean; extent: __esri.Extent | null }> => {
  const { host, isStale } = ctx;
  const spatial = await queryMergedSpatialExtent(
    host.state.spatialMapLayers || [],
    isStale,
  );
  if (spatial.stale) return { stale: true, extent: null };
  let mergedExtent: __esri.Extent | null = spatial.extent;

  const cropPlan = planCropNdviExtentSource({
    hasMergedSpatialExtent: !!mergedExtent,
    hasTuman: !!host.state.tuman,
    selectedTurlarCount: host.getSelectedTurlar().length,
  });
  if (cropPlan === "fallback-shown") {
    mergedExtent = await ctx.queryShownRegionYearExtent();
  } else if (cropPlan === "narrow-shown") {
    // Narrow FeatureLayer union further using shown MapImage DE when
    // crop/NDVI zoom needs the live tuman/turi clause.
    const shown = await ctx.queryShownRegionYearExtent();
    if (!isEmptyMapExtent(shown)) mergedExtent = shown;
  }
  return { stale: false, extent: mergedExtent };
};

/** Region / crop zoom: resolve the merged extent and goTo it (or fall back). */
export const navigateMergedExtentZoom = async (ctx: NavigationContext): Promise<void> => {
  const { host, zoomRequest, view, isStale, navigate } = ctx;
  // Region / back-from-district / polygon-exit: only the shown region-year
  // layer. Do NOT query every spatialMapLayers MapImage leaf (that unions
  // Andijan+Tashkent+… and zooms to the whole map).
  let mergedExtent: __esri.Extent | null = null;
  if (preferShownRegionYearExtent(zoomRequest.reason)) {
    mergedExtent = await pickRegionExtent(ctx);
  } else {
    const crop = await pickCropExtent(ctx);
    if (crop.stale) return;
    mergedExtent = crop.extent;
  }

  if (!isEmptyMapExtent(mergedExtent) && !isStale()) {
    const expandFactor = zoomExpandFactorForReason(zoomRequest.reason);
    const goToMs = zoomGoToDurationMsForReason(zoomRequest.reason);
    agriLog("zoom:goTo", { reason: zoomRequest.reason, expandFactor, goToMs });
    // Full viloyat/tuman framing (no forced closer scale). Fields open via
    // unlocked minScale + settle repaint at this same view scale.
    await navigate(mergedExtent.expand(expandFactor), goToMs);
  } else if (!host.getEffectiveViloyat() && !isStale()) {
    const home = host._homeExtent || (view.map as MapWithFullExtent)?.fullExtent;
    if (!isEmptyMapExtent(home)) {
      agriLog("zoom:goTo-home-fallback", {});
      await navigate(home, homeGoToDurationMs());
    }
  } else {
    agriLog("zoom:no-extent", {
      reason: zoomRequest.reason,
      shownLayerCount: (host._lastShownRegionYearLayers || []).length,
    });
  }
};
