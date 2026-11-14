import type { MapFilterApplyHost } from "../map-host";
import { agriLog } from "../../localization-log";
import { clearAgriAdminBoundaries, syncAgriAdminBoundaries, queryAgriAdminBoundaryExtentOnly } from "../../../../../../gis/agri-admin-boundary-layer";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

type ActiveMapView = MapFilterApplyHost["state"]["activeMapView"];

/** Admin boundary extent/level gathered while a map filter apply runs. */
export interface AdminBoundaryResult {
  extent: __esri.Extent | null;
  level: "district" | "region" | "none";
}

/**
 * Admin boundary outlines — awaited so district names paint on view.graphics
 * above MapImage (fire-and-forget used to lose the race / look unchanged).
 */
export const runAdminBoundarySyncStage = async (
  host: MapFilterApplyHost,
  activeMapView: ActiveMapView,
  adminBoundary: AdminBoundaryResult,
  stillCurrent: () => boolean,
): Promise<void> => {
  if (!stillCurrent() || !activeMapView?.view) return;
  try {
    const selection = host.getAdminBoundarySelection();
    agriLog("zoom:admin-boundary:sync-start", {
      viloyat: selection.viloyat,
      tuman: selection.tuman,
      regionCode: selection.regionCode ?? null,
      nameCount: selection.districtNames?.length ?? 0,
      codeCount: selection.districtCodes?.length ?? 0,
      nameSample: (selection.districtNames || []).slice(0, 5),
    });
    if (!selection.viloyat && !selection.tuman) {
      await clearAgriAdminBoundaries(activeMapView.view);
    } else {
      const synced = await syncAgriAdminBoundaries(activeMapView.view, selection);
      adminBoundary.extent = synced.extent;
      adminBoundary.level = synced.level;
    }
  } catch (error) {
    agriLog("zoom:admin-boundary:failed", { message: errorMessage(error) });
  }
};

/** Build the extent-only admin boundary resolver used during navigation. */
export const createAdminBoundaryExtentResolver = (
  host: MapFilterApplyHost,
  activeMapView: ActiveMapView,
  adminBoundary: AdminBoundaryResult,
  isStale: () => boolean,
): (() => Promise<void>) => async () => {
  if (!activeMapView?.view || isStale()) return;
  const selection = host.getAdminBoundarySelection();
  if (!selection.viloyat && !selection.tuman) return;
  try {
    const synced = await queryAgriAdminBoundaryExtentOnly(selection);
    if (isStale()) return;
    adminBoundary.extent = synced.extent;
    adminBoundary.level = synced.level;
    agriLog("zoom:admin-boundary", {
      level: adminBoundary.level,
      hasExtent: !!adminBoundary.extent,
      viloyat: selection.viloyat,
      tuman: selection.tuman,
      regionCode: selection.regionCode ?? null,
      districtCode: selection.districtCode ?? null,
    });
  } catch (error) {
    agriLog("zoom:admin-boundary:extent-failed", { message: errorMessage(error) });
  }
};

/**
 * Re-paint district strokes/labels on view.graphics after goTo / MapImage
 * export — first sync can finish before the view is stable.
 */
export const repaintAdminBoundaries = (
  host: MapFilterApplyHost,
  activeMapView: ActiveMapView,
  stillCurrent: () => boolean,
): void => {
  if (!stillCurrent() || !activeMapView?.view) return;
  const selection = host.getAdminBoundarySelection();
  if (selection.viloyat || selection.tuman) {
    void syncAgriAdminBoundaries(activeMapView.view, selection).catch(
      (): void => undefined,
    );
  }
};
