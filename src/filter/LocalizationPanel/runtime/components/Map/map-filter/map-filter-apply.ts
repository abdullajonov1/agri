import type { LocalizationHost } from "../../host";
import { type MapZoomRequest, decideMapSurfaceCover, buildDefinitionExpressionDigest, isGeographyZoomReason, shouldNavigateMapZoom, isEmptyMapExtent } from "../../../../../localization/map-zoom-policy";
import { isShownRegionYearLayerOpaque } from "../../../../../localization/map-filter-apply";
import { agriLog, debugCatch } from "../../localization-log";
import { clearAgriAdminBoundaries, syncAgriAdminBoundaries, queryAgriAdminBoundaryExtentOnly } from "../../../../../../gis/agri-admin-boundary-layer";
import { zoomGoToDurationMsForReason, isDistrictZoomPath, districtAdminExpandFactor, districtFallbackRegionExpandFactor, shouldSkipHomeGoTo, pickHomeExtentCandidate, homeGoToDurationMs, preferShownRegionYearExtent, raceRegionExtentPick, planCropNdviExtentSource, zoomExpandFactorForReason } from "../../../../../localization/map-zoom-target";
import { errorMessage, errorName } from "../../../../../../shared/agri-plain-object";
import { runFilterPaintStage } from "./map-filter-paint-stage";
import { queryMergedSpatialExtent } from "./map-filter-spatial-extent";
import { createExtentNavigator, queryShownRegionYearExtent as queryShownRegionYearExtentFor } from "./map-filter-zoom-extent";

/** Runtime `fullExtent` some web maps carry (not in the Map typings). */
type MapWithFullExtent = __esri.Map & { fullExtent?: __esri.Extent | null };

export const applyMapFiltersOptimized = async (
  host: LocalizationHost,
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

  // Cover the map only when a region layer is about to be revealed from
  // scratch (opacity 0 / new year-region). Re-filtering tuman/turi on an
  // already-visible opaque layer must stay clickable — otherwise the
  // overlay eats the first polygon click and makes VH bar lag feel like
  // it is blocking the map.
  const expectRegionLayer = !!String(host.getEffectiveViloyat() || "").trim();
  const alreadyOpaqueRegion =
    expectRegionLayer &&
    (host._lastShownRegionYearLayers || []).some((entry) =>
      isShownRegionYearLayerOpaque(entry),
    );
  const {
    coverMap,
    coverReason,
    vhOnly,
  } = decideMapSurfaceCover({
    expectRegionLayer,
    alreadyOpaqueRegion,
    zoomReason: zoomRequest.reason,
    vhSelected: !!String(host.state.vh || "").trim(),
    vhUniqueIdsReady: Array.isArray(host._vhMapUniqueIds),
  });
  const paintCurrent = await runFilterPaintStage(host, zoomRequest, stillCurrent, {
    coverMap,
    coverReason,
    vhOnly,
  });
  if (!paintCurrent) return;

  // Admin boundary outlines — await so district names paint on view.graphics
  // above MapImage (fire-and-forget used to lose the race / look unchanged).
  const adminBoundary: {
    extent: __esri.Extent | null;
    level: "district" | "region" | "none";
  } = { extent: null, level: "none" };
  if (stillCurrent() && activeMapView?.view) {
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
        const synced = await syncAgriAdminBoundaries(
          activeMapView.view,
          selection,
        );
        adminBoundary.extent = synced.extent;
        adminBoundary.level = synced.level;
      }
    } catch (error) {
      agriLog("zoom:admin-boundary:failed", {
        message: errorMessage(error),
      });
    }
  }

  const expressionDigest = buildDefinitionExpressionDigest(
    featureLayers || [],
  );

  const wasPolygonMode = host._prevPolygonModeForZoomGuard;
  host._prevPolygonModeForZoomGuard = host.state.polygonMode;
  const justExitedPolygonMode = wasPolygonMode && !host.state.polygonMode;

  // Geography zooms must run even when the same setState also cleared
  // polygonMode (field → new tuman / Back to viloyat). The old
  // justExitedPolygonMode guard blocked those and left the map stuck on
  // the field extent. Only skip a bare "other" pass that coincides with
  // popup close — AgriPopup restores the pre-field extent itself.
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

  // goTo aborts in-flight MapImage export — fields stay blank until the
  // user zooms by hand. Reassert DE + refresh after the animation settles.
  if (
    stillCurrent() &&
    expectRegionLayer &&
    isGeographyZoom
  ) {
    // One goTo already lands at field-visible scale — settle after that.
    const settleDelay = shouldNavigate
      ? zoomGoToDurationMsForReason(zoomRequest.reason) + 120
      : 150;
    host.scheduleShownRegionYearSettleRepaint(
      requestId,
      settleDelay,
      `after-${zoomRequest.reason}`,
    );
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

  const view = activeMapView.view;
  const isStale = (): boolean =>
    !host._isMounted || requestId !== host._zoomRequestId;
  const isEmptyExtent = isEmptyMapExtent;

  const navigate = createExtentNavigator(view, isStale);
  const queryShownRegionYearExtent = (): Promise<__esri.Extent | null> =>
    queryShownRegionYearExtentFor(host, zoomRequest, isStale);


  const resolveAdminBoundaryExtent = async (): Promise<void> => {
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
      agriLog("zoom:admin-boundary:extent-failed", {
        message: errorMessage(error),
      });
    }
  };

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
      // Start field extent in parallel so admin miss → fallback is warm.
      const fieldFallbackPromise = queryShownRegionYearExtent();
      await resolveAdminBoundaryExtent();
      if (!isEmptyExtent(adminBoundary.extent) && !isStale()) {
        agriLog("zoom:district:admin-boundary", {
          district: host.state.tuman,
        });
        await navigate(
          adminBoundary.extent.expand(districtAdminExpandFactor()),
          700,
        );
        return;
      }
      const districtZoomed = await host.zoomToSelectedDistrict(view);
      if (districtZoomed) {
        agriLog("zoom:district:done", {
          district: host.state.tuman,
        });
      } else {
        const [fallback] = await Promise.all([
          fieldFallbackPromise,
          resolveAdminBoundaryExtent(),
        ]);
        if (!isEmptyExtent(fallback) && !isStale()) {
          agriLog("zoom:district:fallback-region", {});
          await navigate(
            fallback.expand(districtFallbackRegionExpandFactor()),
            700,
          );
        } else if (!isEmptyExtent(adminBoundary.extent) && !isStale()) {
          await navigate(
            adminBoundary.extent.expand(districtAdminExpandFactor()),
            700,
          );
        }
      }
      return;
    }

    if (zoomRequest.mode === "home") {
      const now = Date.now();
      if (
        shouldSkipHomeGoTo({
          now,
          lastHomeGoToAt: host._lastHomeGoToAt,
        }) ||
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
          home = (
            await primaryLayer.queryExtent(primaryLayer.createQuery())
          )?.extent;
        } catch (err) {
          debugCatch("zoom:home:query-extent-failed", err);
        }
      }

      if (!isEmptyExtent(home) && !isStale()) {
        host._lastHomeGoToAt = now;
        agriLog("zoom:home:goTo", {});
        await navigate(home, homeGoToDurationMs());
      }
      return;
    }

    // Region / back-from-district / polygon-exit: only the shown
    // region-year layer. Do NOT query every spatialMapLayers MapImage
    // leaf (that unions Andijan+Tashkent+… and zooms to the whole map).
    const useShownRegionExtent = preferShownRegionYearExtent(
      zoomRequest.reason,
    );

    let mergedExtent: __esri.Extent | null = null;

    if (useShownRegionExtent) {
      // Race field queryExtent vs admin outline — don't wait for the slow
      // detached MapImage extent when admin region is already ready.
      const fieldPromise = queryShownRegionYearExtent();
      const adminPromise = resolveAdminBoundaryExtent();
      const raced = await raceRegionExtentPick({
        fieldPromise,
        adminPromise,
        getAdminExtent: () => adminBoundary.extent,
        getAdminLevel: () => adminBoundary.level,
        isEmptyExtent,
      });
      if (raced.source === "field") {
        mergedExtent = raced.extent;
        agriLog("zoom:region:field-extent", {
          reason: zoomRequest.reason,
        });
      } else if (raced.source === "admin-region") {
        mergedExtent = raced.extent;
        agriLog("zoom:region:admin-boundary", {
          reason: zoomRequest.reason,
        });
      }
    } else {
      // Crop / NDVI / vegetation: prefer non-MapImage spatial FeatureLayers
      // that carry the uniqueid mirror; skip MapImage-owned leaves.
      const spatial = await queryMergedSpatialExtent(
        host.state.spatialMapLayers || [],
        isStale,
      );
      if (spatial.stale) return;
      mergedExtent = spatial.extent;

      const cropPlan = planCropNdviExtentSource({
        hasMergedSpatialExtent: !!mergedExtent,
        hasTuman: !!host.state.tuman,
        selectedTurlarCount: host.getSelectedTurlar().length,
      });
      if (cropPlan === "fallback-shown") {
        mergedExtent = await queryShownRegionYearExtent();
      } else if (cropPlan === "narrow-shown") {
        // Narrow FeatureLayer union further using shown MapImage DE when
        // crop/NDVI zoom needs the live tuman/turi clause.
        const shown = await queryShownRegionYearExtent();
        if (!isEmptyExtent(shown)) mergedExtent = shown;
      }
    }

    if (!isEmptyExtent(mergedExtent) && !isStale()) {
      const expandFactor = zoomExpandFactorForReason(zoomRequest.reason);
      const goToMs = zoomGoToDurationMsForReason(zoomRequest.reason);
      agriLog("zoom:goTo", {
        reason: zoomRequest.reason,
        expandFactor,
        goToMs,
      });
      // Full viloyat/tuman framing (no forced closer scale). Fields open via
      // unlocked minScale + settle repaint at this same view scale.
      await navigate(mergedExtent.expand(expandFactor), goToMs);
    } else if (!host.getEffectiveViloyat() && !isStale()) {
      const home =
        host._homeExtent || (view.map as MapWithFullExtent)?.fullExtent;
      if (!isEmptyExtent(home)) {
        agriLog("zoom:goTo-home-fallback", {});
        await navigate(home, homeGoToDurationMs());
      }
    } else {
      agriLog("zoom:no-extent", {
        reason: zoomRequest.reason,
        shownLayerCount: (host._lastShownRegionYearLayers || []).length,
      });
    }
  } catch (error) {
    if (errorName(error) !== "AbortError") {
      agriLog("zoom:navigation-failed", {
        reason: zoomRequest.reason,
        message: errorMessage(error),
      });
    }
  } finally {
    host._allowClearOnce = false;
    host._prevDefinitionExpression = expressionDigest;
    // Re-paint district strokes/labels on view.graphics after goTo / MapImage
    // export — first sync can finish before the view is stable.
    if (stillCurrent() && activeMapView?.view) {
      const selection = host.getAdminBoundarySelection();
      if (selection.viloyat || selection.tuman) {
        void syncAgriAdminBoundaries(activeMapView.view, selection).catch(
          (): void => undefined,
        );
      }
    }
  }
};
