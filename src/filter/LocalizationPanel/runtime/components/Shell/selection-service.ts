import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { FilterState, GeoWidgetState } from "../../widget";
import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";
import { errorMessage } from "../../../../../shared/agri-plain-object";
import { applyGeographyOrCropSelection, applyVhOnlySelection } from "./selection-apply";

/** Untyped `widgetSelectionChanged` event detail (published by sibling widgets). */
interface WidgetSelectionDetail {
  timestamp?: unknown;
  yil?: string | number;
  viloyat?: string;
  tuman?: string;
  turi?: string;
  turlar?: unknown;
  vh?: string;
  uniqueid?: string | number;
  clickedAt?: unknown;
  source?: string;
  language?: FilterState["language"];
  ndviDate?: string;
  polygonMode?: boolean;
}

export const handleWidgetSelection = async (host: LocalizationHost, event: Event) => {
  if (!host._isMounted) return;

  const d: WidgetSelectionDetail =
    ((event as CustomEvent<WidgetSelectionDetail | null>).detail) || {};
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

  const updates: Partial<GeoWidgetState> = {};

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
    updates.selectedGraffUniqueid = String(d.uniqueid || "").trim();
    /*
     * Only keep a real map-click timestamp (AgriPopup / explicit clickedAt).
     * Inventing Date.now() for AgriGraff table selection made Graff treat the
     * echo as "click same polygon on map" and immediately deselect.
     */
    if (typeof d.clickedAt === "number") {
      updates.selectedGraffUniqueidClickedAt = d.clickedAt;
    } else if (d.source === "AgriPopup") {
      updates.selectedGraffUniqueidClickedAt = Date.now();
    }
  }
  if (d.language !== undefined) updates.language = d.language;
  const ndviDateChanged = d.ndviDate !== undefined;
  if (ndviDateChanged) {
    // When a polygon graph is active, ignore external NDVI date changes from Graff.
    if (host.state.polygonMode && d.source === "AgriGraffWidget") {
    } else {
      updates.ndviDate = String(d.ndviDate || "");
      if (updates.ndviDate !== host.state.ndviDate)
        host._ndviBucketToIds = {};
    }
  }

  // Track whether a polygon chart is currently active in Graff
  if (d.polygonMode !== undefined) {
    updates.polygonMode = Boolean(d.polygonMode);
    if (!Boolean(d.polygonMode)) {
      updates.selectedGraffUniqueid = "";
      updates.selectedGraffUniqueidClickedAt = undefined;
    }
  }

  // Search-selected field is active: a map click on a *different* field
  // (AgriPopup) keeps the new map selection/zoom and only clears search UI.
  const hadSearchSelection = Boolean(
    String(host.state.graffSearchText || "").trim(),
  );
  const incomingUniqueClean = String(
    updates.selectedGraffUniqueid ??
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
    updates.graffSearchText = "";
    updates.graffSearchSuggestions = [];
    updates.graffSearchShowSuggestions = false;
    updates.graffSearchLoading = false;
    if (host._graffSearchDebounceTimer) {
      clearTimeout(host._graffSearchDebounceTimer);
      host._graffSearchDebounceTimer = null;
    }
  }

  // Update global debug year flag for console filtering.
  try {
    if (updates.yil !== undefined) {
      const y = String(updates.yil || "");
      const w =
        typeof window !== "undefined"
          ? (window as unknown as { __AGRI3_DEBUG_YEAR__?: string })
          : null;
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
    delete updates.viloyat;
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
    updates.polygonMode = false;
    updates.selectedGraffUniqueid = "";
    // While locking geo from a STIR row, keep farmer search / text.
    if (!host._farmerSearchApplying) {
      updates.selectedFarmerInn = "";
      host._farmerMapUniqueIds = null;
      host._preFarmerSearchGeo = null;
      // Search modal + bottom-table search filter must not survive geo change.
      updates.graffSearchText = "";
      updates.graffSearchSuggestions = [];
      updates.graffSearchShowSuggestions = false;
      updates.graffSearchLoading = false;
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
    updates.ndviDate = "";
    updates.ndviDateOptions = [];
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

  const hasChanges = (Object.keys(updates) as Array<keyof GeoWidgetState>).some(
    (key) => updates[key] !== host.state[key],
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
      ...(updates as GeoWidgetState),
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
        if (Boolean(updates.polygonMode ?? d.polygonMode)) {
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
          await applyGeographyOrCropSelection({
            host,
            applyId,
            isApplyCurrent,
            zoomRequest,
            yearChanged,
            viloyatChanged,
            tumanChanged,
            turiChanged,
          });
          return;
        }

        if (vhOnly) {
          await applyVhOnlySelection({
            host,
            applyId,
            isApplyCurrent,
            zoomRequest,
            yearChanged,
            viloyatChanged,
            tumanChanged,
            turiChanged,
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
