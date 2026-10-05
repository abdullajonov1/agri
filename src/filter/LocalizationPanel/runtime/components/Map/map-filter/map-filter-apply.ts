import type { LocalizationHost } from "../../host";
import { type MapZoomRequest, decideMapSurfaceCover, shouldDeferCropForFastReveal, shouldDeferVhUniqueIdResolve, buildDefinitionExpressionDigest, isGeographyZoomReason, shouldNavigateMapZoom, isEmptyMapExtent } from "../../../../../localization/map-zoom-policy";
import { isShownRegionYearLayerOpaque } from "../../../../../localization/map-filter-apply";
import { agriLog } from "../../localization-log";
import { clearAgriAdminBoundaries, syncAgriAdminBoundaries, queryAgriAdminBoundaryExtentOnly } from "../../../../../../gis/agri-admin-boundary-layer";
import { zoomGoToDurationMsForReason, isDistrictZoomPath, districtAdminExpandFactor, districtFallbackRegionExpandFactor, shouldSkipHomeGoTo, pickHomeExtentCandidate, homeGoToDurationMs, preferShownRegionYearExtent, raceRegionExtentPick, planCropNdviExtentSource, zoomExpandFactorForReason } from "../../../../../localization/map-zoom-target";
import { collectShownRegionYearQueryTargets, readQueryableDefinitionExpression, unionMapExtents, unionShownRegionYearFullExtents, canQuerySpatialFeatureExtent, readSpatialFeatureExtentWhere, appendSpatialFeatureExtent } from "../../../../../localization/map-shown-extent";
import { getDetachedQueryLayerFor, isMapImageOwnedLayer, safeLoadMapLayer } from "../../../../../../gis/feature-layer-data";

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
      requestAnimationFrame(() => resolve());
    });
  }

  const prevExpr = host._prevDefinitionExpression;
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
    if (!stillCurrent()) return;

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
        } catch (error: any) {
          agriLog(
            "applyMapFiltersOptimized:deferred-vh-FAILED",
            { error: String(error?.message || error) },
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
        !!entry?.layer && Number((entry.layer as any)?.opacity ?? 1) <= 0.05,
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
        } catch (error: any) {
          agriLog(
            "applyMapFiltersOptimized:deferred-crop-FAILED",
            { error: String(error?.message || error) },
          );
        }
      })();
    } else if (shouldSyncCrop) {
      await host.syncCropRenderer();
      if (!stillCurrent()) return;
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
        requestAnimationFrame(() => resolve());
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

  // Admin boundary outlines — await so district names paint on view.graphics
  // above MapImage (fire-and-forget used to lose the race / look unchanged).
  const adminBoundary: {
    extent: any;
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
    } catch (error: any) {
      agriLog("zoom:admin-boundary:failed", {
        message: String(error?.message || error),
      });
    }
  }

  const expressionDigest = buildDefinitionExpressionDigest(
    featureLayers || [],
  );
  const expressionChanged = expressionDigest !== prevExpr;

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

  const navigate = async (target: any, duration: number): Promise<void> => {
    if (!target || isStale()) return;
    try {
      const animation = (view as any)?.animation;
      if (animation?.state === "running" && typeof animation.stop === "function") {
        animation.stop();
      }
    } catch {}
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
          easing: "ease-in-out" as any,
        }),
        new Promise<void>((resolve) => setTimeout(resolve, duration + 1200)),
      ]);
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        agriLog("zoom:navigate:failed", {
          message: String(error?.message || error),
        });
      }
    }
  };

  /**
   * Extent of the currently shown region-year MapImage layer(s), using the
   * live definitionExpression (tuman/turi when set, else whole viloyat).
   * Never unions every spatialMapLayers entry — those are MapImage leaves
   * for ALL regions and would zoom to the entire republic.
   */
  const queryShownRegionYearExtent = async (): Promise<any | null> => {
    const extentTasks: Promise<any | null>[] = [];
    for (const entry of host._lastShownRegionYearLayers) {
      if (isStale()) return null;
      const queryTargets = collectShownRegionYearQueryTargets(entry);
      for (const sublayer of queryTargets) {
        extentTasks.push(
          (async (): Promise<any | null> => {
            if (isStale()) return null;
            try {
              const where = readQueryableDefinitionExpression(sublayer);
              if (!where) return null;
              const detached = await getDetachedQueryLayerFor(sublayer);
              if (!detached || isStale()) return null;
              const query = detached.createQuery();
              query.where = where;
              query.returnGeometry = true;
              const extent = (await detached.queryExtent(query))?.extent;
              return isEmptyExtent(extent) ? null : extent;
            } catch {
              return null;
            }
          })(),
        );
      }
    }

    const results = await Promise.all(extentTasks);
    let queried = 0;
    for (const extent of results) {
      if (!isEmptyExtent(extent)) queried += 1;
    }
    let merged = unionMapExtents(results);

    if (isEmptyExtent(merged)) {
      merged = unionShownRegionYearFullExtents(
        host._lastShownRegionYearLayers,
      );
    }

    agriLog("zoom:shown-region-extent", {
      reason: zoomRequest.reason,
      queriedSublayerCount: queried,
      parallelTasks: extentTasks.length,
      hasExtent: !isEmptyExtent(merged),
      xmin: merged?.xmin,
      ymin: merged?.ymin,
      xmax: merged?.xmax,
      ymax: merged?.ymax,
    });
    return isEmptyExtent(merged) ? null : merged;
  };

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
    } catch (error: any) {
      agriLog("zoom:admin-boundary:extent-failed", {
        message: String(error?.message || error),
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

      let home: any = pickHomeExtentCandidate({
        storedHome: host._homeExtent,
        mapFullExtent: (view.map as any)?.fullExtent,
        layerFullExtent: primaryLayer.fullExtent,
      });
      if (!home && (primaryLayer as any)?.geometryType) {
        try {
          home = (
            await primaryLayer.queryExtent(primaryLayer.createQuery())
          )?.extent;
        } catch {}
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
      for (const spatialLayer of host.state.spatialMapLayers || []) {
        if (isStale()) return;
        if (isMapImageOwnedLayer(spatialLayer)) continue;
        try {
          if (typeof (spatialLayer as any)?.load === "function") {
            await safeLoadMapLayer(spatialLayer);
          }
          if (!canQuerySpatialFeatureExtent(spatialLayer)) continue;
          const where = readSpatialFeatureExtentWhere(spatialLayer);
          if (!where) continue;
          const query = (spatialLayer as any)?.createQuery
            ? (spatialLayer as any).createQuery()
            : {};
          query.where = where;
          const result = await (spatialLayer as any).queryExtent(query);
          if (isStale()) return;
          mergedExtent = appendSpatialFeatureExtent(
            mergedExtent,
            result?.extent,
          );
        } catch {
          /* continue */
        }
      }

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
      await navigate(mergedExtent!.expand(expandFactor), goToMs);
    } else if (!host.getEffectiveViloyat() && !isStale()) {
      const home =
        host._homeExtent || (view.map as any)?.fullExtent;
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
  } catch (error: any) {
    if (error?.name !== "AbortError") {
      agriLog("zoom:navigation-failed", {
        reason: zoomRequest.reason,
        message: String(error?.message || error),
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
