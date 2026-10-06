import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { FilterState } from "../../widget";
import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import { preloadRegionYearMapImages } from "../../../../../gis/feature-layer-data";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";
import { hasDistrictMappingForSelection } from "../../../../localization/resolve-geo-codes";
import { errorMessage } from "../../../../../shared/agri-plain-object";

export const handleWidgetSelection = async (host: LocalizationHost, event: Event) => {
  if (!host._isMounted) return;

  const d: any = (event as CustomEvent).detail || {};
  agriLog("handleWidgetSelection:received", {
    detail: d,
    currentLockedViloyat: host.state.lockedViloyat,
    currentViloyat: host.state.viloyat,
  });

  // Drop out-of-order geography events (delayed Region/Graff notifies).
  const eventTs =
    typeof d.timestamp === "number" && Number.isFinite(d.timestamp)
      ? d.timestamp
      : 0;
  const isGeographyEvent =
    d.yil !== undefined ||
    d.viloyat !== undefined ||
    d.tuman !== undefined ||
    d.turi !== undefined ||
    d.turlar !== undefined;
  if (
    isGeographyEvent &&
    eventTs > 0 &&
    host._lastGeographySelectionTs > 0 &&
    eventTs < host._lastGeographySelectionTs
  ) {
    agriLog("handleWidgetSelection:SKIP-stale-timestamp", {
      eventTs,
      lastTs: host._lastGeographySelectionTs,
      source: d.source,
    });
    return;
  }

  const updates: Partial<FilterState> = {};

  if (d.yil !== undefined) updates.yil = String(d.yil || "");
  if (d.viloyat !== undefined)
    updates.viloyat = host.normalizeApos(d.viloyat || "");
  if (d.tuman !== undefined)
    updates.tuman = host.normalizeApos(d.tuman || "");
  if (d.turlar !== undefined || d.turi !== undefined) {
    const nextTurlar = host.normalizeTurlar(d.turlar, d.turi || "");
    updates.turlar = nextTurlar;
    updates.turi = nextTurlar.length === 1 ? nextTurlar[0] : "";
  }
  if (d.vh !== undefined) {
    // Only AgriBar may clear VH (toggle-off). Other widgets often echo
    // vh:"" and would wipe a live bar selection.
    const incomingVh = host.normalizeApos(d.vh || "");
    if (d.source === "AgriBar" || incomingVh) {
      updates.vh = incomingVh;
    }
    // Do not clear ekin turi on VH pick — chartDimOrder keeps
    // first-selected-wins (crop-first: VH bar stays crop-scoped, Pie
    // unfiltered by VH; VH-first: Pie scoped by VH, VH bar not by crop).
  }
  if (d.uniqueid !== undefined) {
    (updates as any).selectedGraffUniqueid = String(d.uniqueid || "").trim();
    /*
     * Only keep a real map-click timestamp (AgriPopup / explicit clickedAt).
     * Inventing Date.now() for AgriGraff table selection made Graff treat the
     * echo as "click same polygon on map" and immediately deselect.
     */
    if (typeof d.clickedAt === "number") {
      (updates as any).selectedGraffUniqueidClickedAt = d.clickedAt;
    } else if (d.source === "AgriPopup") {
      (updates as any).selectedGraffUniqueidClickedAt = Date.now();
    }
  }
  if (d.language !== undefined) updates.language = d.language;
  const ndviDateChanged = d.ndviDate !== undefined;
  if (ndviDateChanged) {
    // When a polygon graph is active, ignore external NDVI date changes from Graff.
    if ((host.state as any).polygonMode && d.source === "AgriGraffWidget") {
    } else {
      updates.ndviDate = String(d.ndviDate || "");
      if (updates.ndviDate !== host.state.ndviDate)
        host._ndviBucketToIds = {};
    }
  }

  // Track whether a polygon chart is currently active in Graff
  if (d.polygonMode !== undefined) {
    (updates as any).polygonMode = Boolean(d.polygonMode);
    if (!Boolean(d.polygonMode)) {
      (updates as any).selectedGraffUniqueid = "";
      (updates as any).selectedGraffUniqueidClickedAt = undefined;
    }
  }

  // Search-selected field is active: a map click on a *different* field
  // (AgriPopup) keeps the new map selection/zoom and only clears search UI.
  const hadSearchSelection = Boolean(
    String(host.state.graffSearchText || "").trim(),
  );
  const incomingUniqueClean = String(
    (updates as any).selectedGraffUniqueid ??
      host.state.selectedGraffUniqueid ??
      "",
  )
    .replace(/[{}]/g, "")
    .trim();
  const currentUniqueClean = String(host.state.selectedGraffUniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  const mapPickedDifferentField =
    d.source === "AgriPopup" &&
    hadSearchSelection &&
    Boolean(d.polygonMode) &&
    !!incomingUniqueClean &&
    incomingUniqueClean !== currentUniqueClean;

  if (mapPickedDifferentField || (d.polygonMode === false && hadSearchSelection)) {
    (updates as any).graffSearchText = "";
    (updates as any).graffSearchSuggestions = [];
    (updates as any).graffSearchShowSuggestions = false;
    (updates as any).graffSearchLoading = false;
    if (host._graffSearchDebounceTimer) {
      clearTimeout(host._graffSearchDebounceTimer);
      host._graffSearchDebounceTimer = null;
    }
  }

  // Update global debug year flag for console filtering.
  try {
    if (updates.yil !== undefined) {
      const y = String(updates.yil || "");
      const w: any = typeof window !== "undefined" ? (window as any) : null;
      if (w) w.__AGRI3_DEBUG_YEAR__ = /\b2024\b/.test(y) ? "2024" : "";
    }
  } catch {
    /* ignore */
  }

  // ✅ IMPORTANT: if user is locked, never accept external viloyat overrides
  if (host.state.lockedViloyat) {
    if (
      updates.viloyat !== undefined &&
      updates.viloyat !== host.state.lockedViloyat
    ) {
      agriLog(
        "handleWidgetSelection:viloyat-STRIPPED — account is locked to one viloyat " +
          "(portal group scoping); the requested viloyat was silently dropped",
        {
          requestedViloyat: updates.viloyat,
          lockedViloyat: host.state.lockedViloyat,
        },
      );
    }
    delete (updates as any).viloyat;
  }

  // ✅ hierarchy clearing (prevents caching old selections)
  const yearChanged =
    updates.yil !== undefined && updates.yil !== host.state.yil;
  const viloyatChanged =
    updates.viloyat !== undefined && updates.viloyat !== host.state.viloyat;
  const tumanChanged =
    updates.tuman !== undefined && updates.tuman !== host.state.tuman;
  if (tumanChanged || updates.tuman !== undefined) {
    agriLog("localization:tuman-update", {
      source: d.source || null,
      prevTuman: host.state.tuman || "",
      nextTuman: updates.tuman !== undefined ? updates.tuman : host.state.tuman,
      viloyat: updates.viloyat ?? host.state.viloyat ?? "",
      yil: updates.yil ?? host.state.yil ?? "",
      tumanChanged,
      uniqueid: d.uniqueid ?? null,
      polygonMode: d.polygonMode ?? null,
    });
  }
  const turiChanged =
    updates.turi !== undefined &&
    (updates.turi !== host.state.turi ||
      JSON.stringify(updates.turlar || []) !== JSON.stringify(host.state.turlar || []));

  // ✅ Reset VH only when geographic scope changes (year/viloyat/tuman), not when only crop (turi) changes
  // so that bar selection + crop selection can both apply.
  // AgriBar's own event always wins for vh (set above).
  if (
    (yearChanged || viloyatChanged || tumanChanged) &&
    d.source !== "AgriBar"
  ) {
    updates.vh = "";
    // Field popup / Graff single-polygon focus is stale once geography moves.
    (updates as any).polygonMode = false;
    (updates as any).selectedGraffUniqueid = "";
    // While locking geo from a STIR row, keep farmer search / text.
    if (!host._farmerSearchApplying) {
      (updates as any).selectedFarmerInn = "";
      host._farmerMapUniqueIds = null;
      host._preFarmerSearchGeo = null;
      // Search modal + bottom-table search filter must not survive geo change.
      (updates as any).graffSearchText = "";
      (updates as any).graffSearchSuggestions = [];
      (updates as any).graffSearchShowSuggestions = false;
      (updates as any).graffSearchLoading = false;
      if (host._graffSearchDebounceTimer) {
        clearTimeout(host._graffSearchDebounceTimer);
        host._graffSearchDebounceTimer = null;
      }
    }
  }

  // ✅ If year changes -> clear everything below
  if (yearChanged) {
    updates.viloyat = "";
    updates.tuman = "";
    updates.turi = "";
    updates.turlar = [];
    updates.vh = "";
    (updates as any).ndviDate = "";
    (updates as any).ndviDateOptions = [];
    host._ndviBucketToIds = {};
    host._vhUniqueIdCache = {};
    host._vhMapUniqueIds = null;
    host._vhRegionChartUniqueIds = null;
    host._vhUniqueIdsCropScoped = false;
    host._vhBarUsedDate = null;
    host._vhBarUsedDateGeo = null;
  }

  // ✅ If viloyat changes -> clear below, but keep an explicitly
  // provided tuman from the same event (Region sends both together).
  // `_vhUniqueIdCache` / `_vhBarUsedDate` survive on purpose: cache keys
  // carry region+district, and the bar date is scope-tagged, so switching
  // back to a viloyat stays instant instead of re-paging every uniqueid.
  if (!yearChanged && viloyatChanged) {
    if (d.tuman === undefined) updates.tuman = "";
    if (d.turlar === undefined && d.turi === undefined) {
      updates.turi = "";
      updates.turlar = [];
    }
    if (d.vh === undefined) updates.vh = "";
    if (d.vh === undefined) {
      host._vhMapUniqueIds = null;
      host._vhRegionChartUniqueIds = null;
      host._vhUniqueIdsCropScoped = false;
    }
  }

  // ✅ If tuman changes -> clear turi and vh
  if (!yearChanged && !viloyatChanged && tumanChanged) {
    updates.turi = "";
    updates.turlar = [];
    updates.vh = "";
    host._vhMapUniqueIds = null;
    host._vhRegionChartUniqueIds = null;
    host._vhUniqueIdsCropScoped = false;
  }

  // ✅ When only turi (crop) changes: keep vh so map ANDs crop + status.
  // Cache keys already include cropIds — do not wipe the whole cache (that
  // forced a full uniqueid re-page and made VH+crop feel stuck).
  // Flag reuse / uniqueid-ready is decided AFTER syncChartDimOrder below.
  if (turiChanged) {
    const nextTurlarEmpty = !(updates.turlar && updates.turlar.length);
    const prevHadCrop =
      (host.state.turlar || []).length > 0 ||
      Boolean(String(host.state.turi || "").trim());
    // Crop cleared while VH stays: drop crop-scoped uniqueids so Pie/map
    // do not keep the previous crop until all-crop ids resolve.
    if (nextTurlarEmpty && prevHadCrop) {
      host._vhMapUniqueIds = null;
      host._vhRegionChartUniqueIds = null;
      host._vhUniqueIdsCropScoped = false;
      clearPieVhFilterUniqueIds();
    }
  }

  // IMPORTANT:
  // Crop selection (turi) coming from AgriPie should FILTER polygons only.
  // Color renderer must stay strictly manual (toolbar button), so we do not
  // auto-enable/disable cropRendererMode on turi changes.

  const nextVhForOrder =
    updates.vh !== undefined ? String(updates.vh || "") : String(host.state.vh || "");
  const nextTurlarForOrder =
    updates.turlar !== undefined
      ? host.normalizeTurlar(updates.turlar, updates.turi || "")
      : host.getSelectedTurlar();
  // Capture before syncChartDimOrder drops "turi" from the order on clear.
  const prevChartFlags = host.getChartFilterFlags();
  host.syncChartDimOrder(
    nextVhForOrder,
    nextTurlarForOrder,
    yearChanged || viloyatChanged || tumanChanged,
  );

  if (turiChanged) {
    const chartFlags = host.getChartFilterFlags(
      nextVhForOrder,
      nextTurlarForOrder,
    );
    const nextTurlarEmpty = nextTurlarForOrder.length === 0;
    const prevHadCrop =
      (host.state.turlar || []).length > 0 ||
      Boolean(String(host.state.turi || "").trim());
    const vhActive = Boolean(String(nextVhForOrder || "").trim());
    if (chartFlags.filterVhBarByCrop) {
      // Crop-first: VH bar + uniqueids are crop-scoped — must recompute.
      host._vhUniqueIdsReadyForApply = false;
      host._reuseVhBarDataOnNextBroadcast = false;
    } else if (prevChartFlags.filterVhBarByCrop && nextTurlarEmpty) {
      // Crop-first cleared: last VH bar is still crop-scoped — recompute all crops.
      host._vhUniqueIdsReadyForApply = false;
      host._reuseVhBarDataOnNextBroadcast = false;
      host._lastVhBarData = null;
    } else if (vhActive && nextTurlarEmpty && prevHadCrop) {
      // Crop cleared under VH-first: re-resolve all-crop uniqueids; bar OK.
      host._vhUniqueIdsReadyForApply = false;
      host._reuseVhBarDataOnNextBroadcast = true;
    } else {
      // Crop-second (or crop without VH scoping): keep all-crop VH bar and
      // existing status uniqueids — map only ANDs turi.
      host._reuseVhBarDataOnNextBroadcast = true;
    }
  }

  const hasChanges = Object.keys(updates).some(
    (key) => (updates as any)[key] !== (host.state as any)[key],
  );

  if (!hasChanges) {
    agriLog(
      "handleWidgetSelection:NO-OP — updates matched current state exactly, " +
        "nothing will be applied",
      { updates, currentState: { viloyat: host.state.viloyat, tuman: host.state.tuman, yil: host.state.yil } },
    );
    return;
  }

  const isPolygonSelectionOnly =
    (d.uniqueid !== undefined || d.polygonMode !== undefined) &&
    d.yil === undefined &&
    d.viloyat === undefined &&
    d.tuman === undefined &&
    d.turi === undefined &&
    d.turlar === undefined &&
    d.vh === undefined;

  if (!isPolygonSelectionOnly) host.clearPolygonFilterGuards();

  let zoomRequest: MapZoomRequest = { mode: "none", reason: "other" };
  if (isPolygonSelectionOnly) {
    zoomRequest =
      (d.source === "AgriGraffWidget" || d.source === "AgriPopup") &&
      d.polygonMode === false
        ? { mode: "selection", reason: "polygon-exit" }
        : { mode: "none", reason: "polygon" };
  } else if (yearChanged) {
    zoomRequest = { mode: "home", reason: "year" };
  } else if (viloyatChanged) {
    zoomRequest = {
      mode: updates.viloyat || host.state.lockedViloyat ? "selection" : "home",
      reason: "region",
    };
  } else if (tumanChanged) {
    zoomRequest = {
      mode: "selection",
      reason: updates.tuman ? "district" : "district-clear",
    };
  } else if (turiChanged) {
    // Crop toggle only ANDs/removes turi on DE. Re-zooming district/region
    // (queryExtent + goTo) made VH crop filter/clear feel multi-second slow.
    zoomRequest = { mode: "none", reason: "crop" };
  } else if (d.vh !== undefined) {
    // VH filter rewrites MapImage DE with a large uniqueid IN (...).
    // Do not zoom/queryExtent — that duplicates a heavy server round-trip.
    zoomRequest = { mode: "none", reason: "vegetation" };
  } else if (ndviDateChanged) {
    zoomRequest = { mode: "selection", reason: "ndvi" };
  }

  agriLog("handleWidgetSelection:applying", {
    updates,
    zoomRequest,
    chartDimOrder: host._chartDimOrder.slice(),
    chartFlags: host.getChartFilterFlags(nextVhForOrder, nextTurlarForOrder),
  });

  if (isGeographyEvent && eventTs > 0) {
    host._lastGeographySelectionTs = eventTs;
  }

  const applyId = isPolygonSelectionOnly
    ? host._geographyApplyId
    : ++host._geographyApplyId;
  if (!isPolygonSelectionOnly) {
    // Drop any in-flight VH broadcast still holding the previous geography.
    host._broadcastGeneration += 1;
  }
  const isApplyCurrent = () =>
    host._isMounted && applyId === host._geographyApplyId;

  host.setState(
    {
      ...(updates as any),
      // Polygon pick must not flip the dashboard loading overlay — that
      // path used to re-enter map sync and flash whole-viloyat tiles.
      loading: isPolygonSelectionOnly ? host.state.loading : true,
      // Lock NDVI date only when explicitly set AND geography didn't change.
      // If yil/viloyat/tuman changed, return to auto mode for the new area.
      ndviDateLocked:
        ndviDateChanged && !(yearChanged || viloyatChanged || tumanChanged)
          ? Boolean(updates.ndviDate)
          : false,
    },
    async () => {
      // Polygon selection/deselection only needs uniqueid/polygonMode for
      // Graff (+ highlight owned by AgriPopup). Do NOT call
      // syncRegionYearLayerVisibility here — re-assigning MapImage
      // definitionExpression / visibility forces a fresh export that
      // briefly paints every district before the tuman DE sticks again.
      if (isPolygonSelectionOnly) {
        if (mapPickedDifferentField) {
          // New map field stays selected/zoomed; only drop search filter/UI.
          host.emitGraffTableSearchClear({ preserveSelection: true });
        } else if (
          d.source === "AgriPopup" &&
          d.polygonMode === false &&
          hadSearchSelection
        ) {
          host.emitGraffTableSearchClear();
        }
        host.broadcastFilterState();
        if (Boolean((updates as any).polygonMode ?? d.polygonMode)) {
          host.schedulePolygonFilterGuards();
        }
        return;
      }

      try {
        // VH-only: publish charts as soon as uniqueids resolve; map redraw
        // continues in the background so Pie/Graff/Bar don't wait on export.
        const turiClearedWithVh =
          turiChanged &&
          !(updates.turlar && updates.turlar.length) &&
          Boolean(String((updates.vh ?? host.state.vh) || "").trim());
        const vhOnly =
          d.source === "AgriBar" &&
          d.vh !== undefined &&
          !yearChanged &&
          !viloyatChanged &&
          !tumanChanged &&
          (!turiChanged || turiClearedWithVh);

        // Geography/crop codes are already known on VH-only toggles —
        // skip the extra round-trips that dominate perceived lag.
        if (!vhOnly) {
          const turiOnly =
            turiChanged &&
            !yearChanged &&
            !viloyatChanged &&
            !tumanChanged;
          const cropCleared =
            turiOnly && host.getSelectedTurlar().length === 0;

          // Show Vegetatsiya Holati / Pie loaders immediately while crop_id
          // and region codes resolve — don't wait for the network round-trip.
          // Crop-second keeps all-crop VH bar: skip pending spinner + reuse.
          // Crop-first clear: restore all-crop VH from memo immediately
          // (pending spinner + region await made deselect feel stuck).
          if (!host._reuseVhBarDataOnNextBroadcast) {
            if (cropCleared) {
              host.broadcastFilterState();
            } else {
              host.broadcastFilterState({ pendingOnly: true });
            }
          }

          // First viloyat/tuman open: region-year MapImage matching uses the
          // viloyat *name*, and admin borders have a name→parent_cod map.
          // Do not block layer reveal on Agri_table region-code lookup.
          const geographyRevealWithoutCodes =
            (viloyatChanged || yearChanged || tumanChanged) &&
            !turiChanged &&
            !String(host.state.vh || "").trim();
          const ensureRegionPromise = host.ensureRegionDistrictForSelection();
          // turi-only: region/district codes are already cached from the
          // geography click — don't block VH bar on another lookup.
          if (!geographyRevealWithoutCodes && !turiOnly) {
            await ensureRegionPromise;
            if (!isApplyCurrent()) {
              agriLog(
                "handleWidgetSelection:SKIP-stale-apply",
                { applyId, phase: "after-region-district" },
              );
              return;
            }
          } else {
            void ensureRegionPromise;
          }

          // Ekin turi: resolve crop_id before map + charts (Pie sends
          // canonical keys like "bugdoy", not DB spellings).
          if (host.getSelectedTurlar().length > 0) {
            await host.ensureCropIdForSelection();
            if (!isApplyCurrent()) {
              agriLog(
                "handleWidgetSelection:SKIP-stale-apply",
                { applyId, phase: "after-crop-id-before-map" },
              );
              return;
            }
          }

          if (host._isMounted) {
            host.setState({ loading: false });
          }
          // Start MapImage metadata load immediately so it overlaps the
          // region-code race + apply path (cold load used to start only
          // inside ensureRegionYearMapImagesReady, delaying first export).
          const mapForPreload = host.state.activeMapView?.view?.map;
          const preloadViloyat = host.getEffectiveViloyat();
          if (
            mapForPreload &&
            host.state.yil &&
            preloadViloyat &&
            (viloyatChanged || yearChanged || tumanChanged)
          ) {
            void preloadRegionYearMapImages(
              mapForPreload,
              host.state.yil,
              preloadViloyat,
            );
          }
          void (async () => {
            try {
              // Let region-code lookup finish (or race) before zoom so
              // admin boundaries can prefer numeric parent_cod when ready.
              // Skip the 120ms wait when codes are already cached.
              if (geographyRevealWithoutCodes) {
                const vKey = host.makeRegionDistrictKey(preloadViloyat);
                const tKey = host.makeRegionDistrictKey(
                  host.state.tuman || "",
                );
                const codesReady =
                  (!vKey || host._viloyatToRegion[vKey] != null) &&
                  (!tKey ||
                    hasDistrictMappingForSelection(
                      preloadViloyat,
                      host.state.tuman || "",
                      host._tumanToDistrict,
                      host._viloyatToRegion,
                      host.getGeoCodeHelpers(),
                    ));
                if (!codesReady) {
                  await Promise.race([
                    ensureRegionPromise,
                    new Promise<void>((resolve) =>
                      setTimeout(resolve, 120),
                    ),
                  ]);
                }
              }
              await host.applyMapFiltersOptimized(zoomRequest, isApplyCurrent);
              if (!isApplyCurrent()) {
                agriLog(
                  "handleWidgetSelection:SKIP-stale-apply",
                  { applyId, phase: "after-map-filters" },
                );
                return;
              }
              if (geographyRevealWithoutCodes) {
                await ensureRegionPromise;
                if (!isApplyCurrent()) return;
              }
              void host.fetchDataWithCurrentState();
              if (!isApplyCurrent()) {
                agriLog(
                  "handleWidgetSelection:SKIP-stale-apply",
                  { applyId, phase: "after-fetch-data" },
                );
              }
            } catch (error) {
              agriLog(
                "handleWidgetSelection:map-apply-FAILED",
                { error: errorMessage(error) },
              );
              if (host._isMounted && isApplyCurrent()) {
                host.setState({
                  error: errorMessage(error),
                  loading: false,
                });
              }
            } finally {
              if (isApplyCurrent()) {
                ++host._mapSurfaceLoadingToken;
                host.setMapSurfaceLoading(false, "latest-filter-settled");
              }
            }
          })();

          host.broadcastFilterState();
          return;
        }

        if (vhOnly) {
          // Cold + narrow (tuman and/or ekin): paint geography/turi DE first,
          // resolve uniqueids in background (same pattern as crop+VH defer).
          // Cold + wide (viloyat/republic only): keep overlay until ids ready
          // so the map never flashes every polygon in the region.
          const narrowScope =
            !!String(host.state.tuman || "").trim() ||
            host.getSelectedTurlar().length > 0;
          const cacheWarm = host.isVhMapUniqueIdCacheWarm();
          const deferColdVh = !cacheWarm && narrowScope;

          agriLog("handleWidgetSelection:vh-only", {
            applyId,
            cacheWarm,
            narrowScope,
            deferColdVh,
            vh: host.state.vh,
          });

          host.setMapSurfaceLoading(true, "vegetation");

          if (deferColdVh) {
            // Drop stale status ids so charts stay pending (null) and the
            // map uses turi/tuman only until the new status ids arrive.
            // Clear Pie bridge too — filterPieByVh must not reuse the
            // previous status's district-scoped ids while we wait.
            host._vhMapUniqueIds = null;
            host._vhRegionChartUniqueIds = null;
            host._vhUniqueIdsCropScoped = false;
            clearPieVhFilterUniqueIds();
            host._vhUniqueIdsReadyForApply = false;
            host._deferVhUniqueIdResolve = true;
            host._suppressLegacyVhOnMap = true;
            if (host._isMounted) {
              host.setState({ loading: false });
            }
            host._reuseVhBarDataOnNextBroadcast = true;
            host.broadcastFilterState();
            void host.applyMapFiltersOptimized(zoomRequest, isApplyCurrent)
              .catch((error: unknown) => {
                agriLog(
                  "handleWidgetSelection:vh-map-apply-FAILED",
                  { error: errorMessage(error) },
                );
              })
              .finally(() => {
                if (isApplyCurrent()) {
                  ++host._mapSurfaceLoadingToken;
                  host.setMapSurfaceLoading(false, "latest-filter-settled");
                }
              });
            return;
          }

          await host.resolveVhMapUniqueIds(isApplyCurrent);
          host._vhUniqueIdsReadyForApply = true;
          if (!isApplyCurrent()) {
            host._vhUniqueIdsReadyForApply = false;
            ++host._mapSurfaceLoadingToken;
            host.setMapSurfaceLoading(false, "vegetation-stale");
            agriLog(
              "handleWidgetSelection:SKIP-stale-apply",
              { applyId, phase: "after-vh-uniqueids" },
            );
            return;
          }

          // Drop the selected field when it is not part of the new VH status.
          const vhActive = !!String(host.state.vh || "").trim();
          const selectedClean = String(host.state.selectedGraffUniqueid || "")
            .replace(/[{}]/g, "")
            .toLowerCase();
          const polygonActive =
            Boolean(host.state.polygonMode) && !!selectedClean;
          let releasedPolygon = false;
          if (vhActive && polygonActive) {
            const ids = Array.isArray(host._vhMapUniqueIds)
              ? host._vhMapUniqueIds
              : [];
            const inStatus = ids.some(
              (id) =>
                String(id || "")
                  .replace(/[{}]/g, "")
                  .toLowerCase() === selectedClean,
            );
            if (!inStatus) {
              releasedPolygon = true;
              await new Promise<void>((resolve) => {
                if (!host._isMounted) {
                  resolve();
                  return;
                }
                host.setState(
                  {
                    polygonMode: false,
                    selectedGraffUniqueid: "",
                    selectedGraffUniqueidClickedAt: undefined,
                    loading: false,
                  } as any,
                  () => resolve(),
                );
              });
              if (!isApplyCurrent()) return;
              try {
                document.dispatchEvent(
                  new CustomEvent("widgetSelectionChanged", {
                    detail: {
                      source: "AgriFilter",
                      polygonMode: false,
                      uniqueid: "",
                      timestamp: Date.now(),
                    },
                    bubbles: true,
                  }),
                );
              } catch {
                /* ignore */
              }
              agriLog(
                "handleWidgetSelection:release-polygon-not-in-vh",
                {
                  vh: host.state.vh,
                  uniqueid: selectedClean,
                  vhIdCount: ids.length,
                },
              );
            }
          }

          if (host._isMounted && !releasedPolygon) {
            host.setState({ loading: false });
          }
          host._reuseVhBarDataOnNextBroadcast = true;
          host.broadcastFilterState();
          void host.applyMapFiltersOptimized(zoomRequest, isApplyCurrent)
            .then(async () => {
              if (isApplyCurrent()) {
                await host.fetchDataWithCurrentState();
              }
            })
            .catch((error: unknown) => {
              agriLog(
                "handleWidgetSelection:vh-map-apply-FAILED",
                { error: errorMessage(error) },
              );
            })
            .finally(() => {
              if (isApplyCurrent()) {
                ++host._mapSurfaceLoadingToken;
                host.setMapSurfaceLoading(false, "latest-filter-settled");
              }
            });
          return;
        }
      } catch (e) {
        if (host._isMounted && isApplyCurrent()) {
          host.setState({ error: errorMessage(e), loading: false });
          // pendingOnly may already have spun AgriBar — clear it on failure.
          host.broadcastFilterState();
        }
      } finally {
        // Rapid crop multi-select/clear can make several map applies stale.
        // The newest completed apply is authoritative: invalidate any older
        // overlay owner and always release the blocking map surface loader.
        if (isApplyCurrent()) {
          ++host._mapSurfaceLoadingToken;
          host.setMapSurfaceLoading(false, "latest-filter-settled");
        }
      }
    },
  );
};
