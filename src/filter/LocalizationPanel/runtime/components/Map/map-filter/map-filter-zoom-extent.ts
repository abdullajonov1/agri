import type { MapFilterZoomExtentHost } from "../map-host";
import type { MapZoomRequest } from "../../../../../localization/map-zoom-policy";
import { isEmptyMapExtent } from "../../../../../localization/map-zoom-policy";
import { agriLog, debugCatch } from "../../localization-log";
import { collectShownRegionYearQueryTargets, readQueryableDefinitionExpression, unionMapExtents, unionShownRegionYearFullExtents } from "../../../../../localization/map-shown-extent";
import { getDetachedQueryLayerFor } from "../../../../../../gis/feature-layer-data";
import { arcgisEaseInOut, errorMessage, errorName } from "../../../../../../shared/agri-plain-object";

/** View animation members read before goTo (MapView exposes them). */
interface ViewAnimationLike {
  animation?: { state?: string; stop?: () => void } | null;
}

/** Extra wait past the animation duration before goTo is considered hung. */
const GOTO_TIMEOUT_GRACE_MS = 1200;

export type ExtentNavigator = (
  target: __esri.Extent | null | undefined,
  duration: number,
) => Promise<void>;

/** Build the goTo helper bound to a view and a staleness check. */
export const createExtentNavigator = (
  view: __esri.MapView | __esri.SceneView,
  isStale: () => boolean,
): ExtentNavigator => async (target, duration) => {
  if (!target || isStale()) return;
  try {
    const animation = (view as ViewAnimationLike)?.animation;
    if (animation?.state === "running" && typeof animation.stop === "function") {
      animation.stop();
    }
  } catch (err) {
    debugCatch("zoom:navigate:animation-stop-failed", err);
  }
  if (isStale()) return;
  // view.goTo() can occasionally never settle (interrupted animation, view
  // mid-update) — and this navigate() is awaited inside the
  // handleWidgetSelection apply chain, so a hung goTo would leave `loading`
  // (the map spinner) stuck forever. This bit users when deselecting a
  // viloyat (mode:"home"). Race goTo against a timeout and swallow the
  // expected AbortError so the chain always continues and loading clears.
  try {
    await Promise.race([
      view.goTo(target, {
        duration,
        easing: arcgisEaseInOut,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, duration + GOTO_TIMEOUT_GRACE_MS)),
    ]);
  } catch (error) {
    if (errorName(error) !== "AbortError") {
      agriLog("zoom:navigate:failed", {
        message: errorMessage(error),
      });
    }
  }
};

/** Extent of one shown region-year sublayer under its live definitionExpression. */
const querySublayerExtent = async (
  sublayer: Parameters<typeof readQueryableDefinitionExpression>[0],
  isStale: () => boolean,
): Promise<__esri.Extent | null> => {
  if (isStale()) return null;
  try {
    const where = readQueryableDefinitionExpression(sublayer);
    if (!where) return null;
    const detached = (await getDetachedQueryLayerFor(
      sublayer,
    )) as __esri.FeatureLayer | null;
    if (!detached || isStale()) return null;
    const query = detached.createQuery();
    query.where = where;
    query.returnGeometry = true;
    const extent = (await detached.queryExtent(query))?.extent;
    return isEmptyMapExtent(extent) ? null : extent;
  } catch {
    return null;
  }
};

/**
 * Extent of the currently shown region-year MapImage layer(s), using the
 * live definitionExpression (tuman/turi when set, else whole viloyat).
 * Never unions every spatialMapLayers entry — those are MapImage leaves
 * for ALL regions and would zoom to the entire republic.
 */
export const queryShownRegionYearExtent = async (
  host: MapFilterZoomExtentHost,
  zoomRequest: MapZoomRequest,
  isStale: () => boolean,
): Promise<__esri.Extent | null> => {
  const extentTasks: Promise<__esri.Extent | null>[] = [];
  for (const entry of host._lastShownRegionYearLayers) {
    if (isStale()) return null;
    for (const sublayer of collectShownRegionYearQueryTargets(entry)) {
      extentTasks.push(querySublayerExtent(sublayer, isStale));
    }
  }

  const results = await Promise.all(extentTasks);
  let queried = 0;
  for (const extent of results) {
    if (!isEmptyMapExtent(extent)) queried += 1;
  }
  let merged = unionMapExtents(results);

  if (isEmptyMapExtent(merged)) {
    merged = unionShownRegionYearFullExtents(
      host._lastShownRegionYearLayers,
    );
  }

  agriLog("zoom:shown-region-extent", {
    reason: zoomRequest.reason,
    queriedSublayerCount: queried,
    parallelTasks: extentTasks.length,
    hasExtent: !isEmptyMapExtent(merged),
    xmin: merged?.xmin,
    ymin: merged?.ymin,
    xmax: merged?.xmax,
    ymax: merged?.ymax,
  });
  return isEmptyMapExtent(merged) ? null : merged;
};
