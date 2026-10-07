import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import { preloadRegionYearMapImages } from "../../../../../gis/feature-layer-data";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";
import { hasDistrictMappingForSelection } from "../../../../localization/resolve-geo-codes";
import { errorMessage } from "../../../../../shared/agri-plain-object";

/**
 * Apply phase of `handleWidgetSelection` (runs inside its setState callback).
 * Split out of selection-service.ts to keep that module under the size cap;
 * behavior is unchanged — each function is the former inline branch body.
 */
export interface SelectionApplyContext {
  host: LocalizationHost;
  applyId: number;
  isApplyCurrent: () => boolean;
  zoomRequest: MapZoomRequest;
  yearChanged: boolean;
  viloyatChanged: boolean;
  tumanChanged: boolean;
  turiChanged: boolean;
}

/** Geography / crop change: resolve codes, then map apply + data refetch. */
export async function applyGeographyOrCropSelection(
  ctx: SelectionApplyContext,
): Promise<void> {
  const {
    host,
    applyId,
    isApplyCurrent,
    zoomRequest,
    yearChanged,
    viloyatChanged,
    tumanChanged,
    turiChanged,
  } = ctx;
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

/** AgriBar VH toggle only: resolve status uniqueids, then map apply. */
export async function applyVhOnlySelection(
  ctx: SelectionApplyContext,
): Promise<void> {
  const { host, applyId, isApplyCurrent, zoomRequest } = ctx;
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
            },
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
