import type { LocalizationHost } from "../../host";
import type { MapFilterPaintStageHost } from "../map-host";
import { type MapZoomRequest, shouldDeferCropForFastReveal, shouldDeferVhUniqueIdResolve } from "../../../../../localization/map-zoom-policy";
import { agriLog } from "../../localization-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/** Result of decideMapSurfaceCover consumed by the paint stage. */
export interface MapSurfaceCover {
  coverMap: boolean;
  coverReason: Parameters<LocalizationHost["setMapSurfaceLoading"]>[1];
  vhOnly: boolean;
}

/**
 * Stage 1 of a map filter apply: cover the map when needed, apply the
 * persistent filters, sync crop paint, then clear the overlay / no-data flag.
 * Resolves false when the apply went stale and the caller must stop.
 */
export const runFilterPaintStage = async (
  host: MapFilterPaintStageHost,
  zoomRequest: MapZoomRequest,
  stillCurrent: () => boolean,
  { coverMap, coverReason, vhOnly }: MapSurfaceCover,
): Promise<boolean> => {
  let loadingToken = 0;
  let mapOverlayDismissed = false;
  const dismissMapOverlay = (): void => {
    if (
      !mapOverlayDismissed &&
      coverMap &&
      loadingToken === host._mapSurfaceLoadingToken
    ) {
      mapOverlayDismissed = true;
      host.setMapSurfaceLoading(false, coverReason);
    }
  };
  if (coverMap) {
    loadingToken = ++host._mapSurfaceLoadingToken;
    host.setMapSurfaceLoading(true, coverReason);
    // One frame is enough for the overlay to paint; double-rAF added
    // ~32ms of pure wait before every region/year reveal.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => { resolve(); });
    });
  }

  let revealAfterCrop = false;
  // First viloyat/year reveal: do NOT block zoom/overlay on crop distinct
  // query + forced MapImage redraw (often 1–3s). Layer visibility already
  // starts the export; crop colors catch up in the background.
  const deferCropForFastReveal = shouldDeferCropForFastReveal(
    zoomRequest.reason,
  );
  // Preserve a defer requested by VH-only cold+narrow click; otherwise
  // defer only for crop/tuman refreshes while a VH status stays active.
  const deferVhIds = shouldDeferVhUniqueIdResolve({
    priorDefer: host._deferVhUniqueIdResolve,
    vhOnly,
    vhSelected: !!String(host.state.vh || "").trim(),
    zoomReason: zoomRequest.reason,
    cropScopesVhUniqueIds: host.getChartFilterFlags().filterVhBarByCrop,
  });
  host._deferVhUniqueIdResolve = deferVhIds;
  try {
    await host.applyFiltersPersistent(stillCurrent);
    if (!stillCurrent()) return false;

    // Region/year: layers are visible and exporting — lift the spinner now
    // instead of waiting for admin-boundary sync + zoom animation.
    if (deferCropForFastReveal) {
      dismissMapOverlay();
    }

    // Crop/tuman first paint done — resolve VH uniqueids in background and
    // re-apply DE without covering the map again.
    if (deferVhIds && stillCurrent()) {
      host._deferVhUniqueIdResolve = false;
      void (async () => {
        try {
          await host.resolveVhMapUniqueIds(stillCurrent);
          if (!stillCurrent()) {
            // Do not leave the map stuck on turi-only after a superseded
            // apply — the newer apply owns the next uniqueid resolve.
            return;
          }
          host._suppressLegacyVhOnMap = false;
          host._vhUniqueIdsReadyForApply = true;
          await host.applyFiltersPersistent(stillCurrent, {
            vhDeferredSecondPass: true,
          });
          // Region/Pie/Indicator listen to masterFilterChanged — without
          // this rebroadcast they keep 1=0 / stale ids after VH→crop.
          if (stillCurrent()) {
            host.broadcastFilterState();
            await host.fetchDataWithCurrentState();
          }
        } catch (error) {
          agriLog(
            "applyMapFiltersOptimized:deferred-vh-FAILED",
            { error: errorMessage(error) },
          );
          // Keep turi-only paint (suppressLegacy) rather than writing legacy vh.
          if (stillCurrent()) {
            host._suppressLegacyVhOnMap = true;
            host.broadcastFilterState();
          }
        }
      })();
    }

    // Opacity stays at 1 now (leaf/Sublayer paint fix), so revealAfterCrop
    // is often false — still wait for MapImage redraw after region/year
    // crop-renderer so the first paint isn't default symbology.
    revealAfterCrop = (host._lastShownRegionYearLayers || []).some(
      (entry) =>
        !!entry?.layer && Number(entry.layer?.opacity ?? 1) <= 0.05,
    );
    const awaitRedrawAfterCrop =
      revealAfterCrop ||
      zoomRequest.reason === "region" ||
      zoomRequest.reason === "year";
    // Skip crop re-query while VH uniqueid filter is active (or loading):
    // distinct-turi over a huge `uniqueid IN (...)` WHERE is very slow and
    // raced with deferred VH resolve when ekin turi was picked after VH.
    const vhFilterActive = !!String(host.state.vh || "").trim();
    const shouldSyncCrop =
      !vhOnly &&
      !vhFilterActive &&
      host.state.cropRendererMode === "on" &&
      (host._lastShownRegionYearLayers || []).length > 0;
    if (shouldSyncCrop && deferCropForFastReveal) {
      agriLog("applyMapFiltersOptimized:defer-crop", {
        reason: zoomRequest.reason,
      });
      // CRITICAL: do NOT refresh/crop while the first visibility export is
      // in flight — that aborts the MapImage request and fields stay blank
      // until a second export finishes. Wait for the first paint, then colorize.
      void (async () => {
        try {
          await host.waitForShownRegionYearRedraw(false);
          if (!stillCurrent()) return;
          await host.syncCropRenderer();
        } catch (error) {
          agriLog(
            "applyMapFiltersOptimized:deferred-crop-FAILED",
            { error: errorMessage(error) },
          );
        }
      })();
    } else if (shouldSyncCrop) {
      await host.syncCropRenderer();
      if (!stillCurrent()) return false;
      // Crop refresh already kicked parent MapImage — wait for that export
      // instead of forcing another (canceled duplicate rows).
      if (awaitRedrawAfterCrop) await host.waitForShownRegionYearRedraw(false);
    }
    if (vhOnly) {
      // Apply DE immediately; don't block the UI on a full MapImage export
      // (that was the main perceived lag when switching VH statuses).
      void host.waitForShownRegionYearRedraw(false);
    }
    if (revealAfterCrop) {
      host.setShownRegionYearOpacity(1);
      // One more paint under the spinner so the colored export is on screen
      // before the overlay lifts (avoids a green flash at dismiss).
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => { resolve(); });
      });
    }
  } finally {
    host._deferVhUniqueIdResolve = false;
    if (revealAfterCrop) host.setShownRegionYearOpacity(1);
    // Always clear if this call still owns the overlay — including when the
    // apply went stale. Previously we only cleared when stillCurrent, which
    // left the spinner stuck after SKIP-stale-apply races.
    if (!mapOverlayDismissed && coverMap && loadingToken === host._mapSurfaceLoadingToken) {
      host.setMapSurfaceLoading(false, coverReason);
    }
    // Strict: VH selection with zero matching uniqueids → no-data overlay.
    const vhSelected = !!String(host.state.vh || "").trim();
    const vhNoData =
      vhSelected &&
      Array.isArray(host._vhMapUniqueIds) &&
      host._vhMapUniqueIds.length === 0;
    if (stillCurrent()) {
      host.setMapNoData(vhNoData, "vegetation");
    }
  }
  return true;
};
