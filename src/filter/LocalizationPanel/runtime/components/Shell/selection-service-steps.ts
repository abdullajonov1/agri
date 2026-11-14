import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { FilterState, GeoWidgetState } from "../../widget";
import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";

/** Untyped `widgetSelectionChanged` event detail (published by sibling widgets). */
export interface WidgetSelectionDetail {
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

export interface GeoChangeFlags {
  yearChanged: boolean;
  viloyatChanged: boolean;
  tumanChanged: boolean;
  turiChanged: boolean;
}

export interface SearchClearInfo {
  hadSearchSelection: boolean;
  mapPickedDifferentField: boolean;
}

// ---------------------------------------------------------------- pure helpers

export const readEventTimestamp = (d: WidgetSelectionDetail): number =>
  typeof d.timestamp === "number" && Number.isFinite(d.timestamp)
    ? d.timestamp
    : 0;

export const isGeographyDetail = (d: WidgetSelectionDetail): boolean =>
  d.yil !== undefined ||
  d.viloyat !== undefined ||
  d.tuman !== undefined ||
  d.turi !== undefined ||
  d.turlar !== undefined;

/** Drop out-of-order geography events (delayed Region/Graff notifies). */
export const isStaleGeographyEvent = (
  isGeographyEvent: boolean,
  eventTs: number,
  lastGeographyTs: number,
): boolean =>
  isGeographyEvent &&
  eventTs > 0 &&
  lastGeographyTs > 0 &&
  eventTs < lastGeographyTs;

export const isPolygonSelectionOnlyDetail = (d: WidgetSelectionDetail): boolean =>
  (d.uniqueid !== undefined || d.polygonMode !== undefined) &&
  d.yil === undefined &&
  d.viloyat === undefined &&
  d.tuman === undefined &&
  d.turi === undefined &&
  d.turlar === undefined &&
  d.vh === undefined;

export const computeZoomRequest = (args: {
  d: WidgetSelectionDetail;
  isPolygonSelectionOnly: boolean;
  updates: Partial<GeoWidgetState>;
  lockedViloyat: string;
  yearChanged: boolean;
  viloyatChanged: boolean;
  tumanChanged: boolean;
  turiChanged: boolean;
  ndviDateChanged: boolean;
}): MapZoomRequest => {
  const { d, updates } = args;
  if (args.isPolygonSelectionOnly) {
    return (d.source === "AgriGraffWidget" || d.source === "AgriPopup") &&
      d.polygonMode === false
      ? { mode: "selection", reason: "polygon-exit" }
      : { mode: "none", reason: "polygon" };
  }
  if (args.yearChanged) return { mode: "home", reason: "year" };
  if (args.viloyatChanged) {
    return {
      mode: updates.viloyat || args.lockedViloyat ? "selection" : "home",
      reason: "region",
    };
  }
  if (args.tumanChanged) {
    return {
      mode: "selection",
      reason: updates.tuman ? "district" : "district-clear",
    };
  }
  // Crop toggle only ANDs/removes turi on DE. Re-zooming district/region
  // (queryExtent + goTo) made VH crop filter/clear feel multi-second slow.
  if (args.turiChanged) return { mode: "none", reason: "crop" };
  // VH filter rewrites MapImage DE with a large uniqueid IN (...).
  // Do not zoom/queryExtent — that duplicates a heavy server round-trip.
  if (d.vh !== undefined) return { mode: "none", reason: "vegetation" };
  if (args.ndviDateChanged) return { mode: "selection", reason: "ndvi" };
  return { mode: "none", reason: "other" };
};

// ------------------------------------------------------------- host-bound steps

const clearGraffSearchUpdates = (
  host: LocalizationHost,
  updates: Partial<GeoWidgetState>,
) => {
  updates.graffSearchText = "";
  updates.graffSearchSuggestions = [];
  updates.graffSearchShowSuggestions = false;
  updates.graffSearchLoading = false;
  if (host._graffSearchDebounceTimer) {
    clearTimeout(host._graffSearchDebounceTimer);
    host._graffSearchDebounceTimer = null;
  }
};

/** Translate the event detail into raw state updates (no hierarchy clearing yet). */
export const collectBasicUpdates = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
): Partial<GeoWidgetState> => {
  const updates: Partial<GeoWidgetState> = {};

  if (d.yil !== undefined) updates.yil = String(d.yil || "");
  if (d.viloyat !== undefined)
    { updates.viloyat = host.normalizeApos(d.viloyat || ""); }
  if (d.tuman !== undefined)
    { updates.tuman = host.normalizeApos(d.tuman || ""); }
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
  if (d.ndviDate !== undefined) {
    // When a polygon graph is active, ignore external NDVI date changes from Graff.
    if (!(host.state.polygonMode && d.source === "AgriGraffWidget")) {
      updates.ndviDate = String(d.ndviDate || "");
      if (updates.ndviDate !== host.state.ndviDate)
        { host._ndviBucketToIds = {}; }
    }
  }

  // Track whether a polygon chart is currently active in Graff
  if (d.polygonMode !== undefined) {
    updates.polygonMode = Boolean(d.polygonMode);
    if (!d.polygonMode) {
      updates.selectedGraffUniqueid = "";
      updates.selectedGraffUniqueidClickedAt = undefined;
    }
  }
  return updates;
};

/**
 * Search-selected field is active: a map click on a *different* field
 * (AgriPopup) keeps the new map selection/zoom and only clears search UI.
 */
export const resolveSearchSelection = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
): SearchClearInfo => {
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
    clearGraffSearchUpdates(host, updates);
  }
  return { hadSearchSelection, mapPickedDifferentField };
};

/** Update global debug year flag for console filtering. */
export const updateDebugYearFlag = (updates: Partial<GeoWidgetState>) => {
  try {
    if (updates.yil !== undefined) {
      const y = String(updates.yil || "");
      const w =
        typeof window !== "undefined"
          ? window
          : null;
      if (w) w.__AGRI3_DEBUG_YEAR__ = /\b2024\b/.test(y) ? "2024" : "";
    }
  } catch {
    /* ignore */
  }
};

/** If user is locked, never accept external viloyat overrides. */
export const stripLockedViloyat = (
  host: LocalizationHost,
  updates: Partial<GeoWidgetState>,
) => {
  if (!host.state.lockedViloyat) return;
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
};

/** Compare updates against current state and log the tuman update. */
export const detectGeoChanges = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
): GeoChangeFlags => {
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
  return { yearChanged, viloyatChanged, tumanChanged, turiChanged };
};

/**
 * Reset VH only when geographic scope changes (year/viloyat/tuman), not when
 * only crop (turi) changes, so bar selection + crop selection can both apply.
 * AgriBar's own event always wins for vh (set earlier).
 */
export const resetStaleSelectionOnGeoChange = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
  flags: GeoChangeFlags,
) => {
  if (
    !(flags.yearChanged || flags.viloyatChanged || flags.tumanChanged) ||
    d.source === "AgriBar"
  ) {
    return;
  }
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
    clearGraffSearchUpdates(host, updates);
  }
};

const clearVhUniqueIdScope = (host: LocalizationHost) => {
  host._vhMapUniqueIds = null;
  host._vhRegionChartUniqueIds = null;
  host._vhUniqueIdsCropScoped = false;
};

/** Clear everything below the changed hierarchy level (year > viloyat > tuman > turi). */
export const applyHierarchyClearing = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
  flags: GeoChangeFlags,
) => {
  const { yearChanged, viloyatChanged, tumanChanged, turiChanged } = flags;

  // If year changes -> clear everything below.
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
    clearVhUniqueIdScope(host);
    host._vhBarUsedDate = null;
    host._vhBarUsedDateGeo = null;
  }

  // If viloyat changes -> clear below, but keep an explicitly provided tuman
  // from the same event (Region sends both together). `_vhUniqueIdCache` /
  // `_vhBarUsedDate` survive on purpose: cache keys carry region+district,
  // and the bar date is scope-tagged, so switching back to a viloyat stays
  // instant instead of re-paging every uniqueid.
  if (!yearChanged && viloyatChanged) {
    if (d.tuman === undefined) updates.tuman = "";
    if (d.turlar === undefined && d.turi === undefined) {
      updates.turi = "";
      updates.turlar = [];
    }
    if (d.vh === undefined) {
      updates.vh = "";
      clearVhUniqueIdScope(host);
    }
  }

  // If tuman changes -> clear turi and vh.
  if (!yearChanged && !viloyatChanged && tumanChanged) {
    updates.turi = "";
    updates.turlar = [];
    updates.vh = "";
    clearVhUniqueIdScope(host);
  }

  // When only turi (crop) changes: keep vh so map ANDs crop + status.
  // Cache keys already include cropIds — do not wipe the whole cache (that
  // forced a full uniqueid re-page and made VH+crop feel stuck).
  // Flag reuse / uniqueid-ready is decided AFTER syncChartDimOrder.
  if (turiChanged) {
    const nextTurlarEmpty = !(updates.turlar && updates.turlar.length);
    const prevHadCrop =
      (host.state.turlar || []).length > 0 ||
      Boolean(String(host.state.turi || "").trim());
    // Crop cleared while VH stays: drop crop-scoped uniqueids so Pie/map
    // do not keep the previous crop until all-crop ids resolve.
    if (nextTurlarEmpty && prevHadCrop) {
      clearVhUniqueIdScope(host);
      clearPieVhFilterUniqueIds();
    }
  }
};

/**
 * Sync chart dim order and, on crop change, decide VH recompute/reuse flags.
 * Crop selection (turi) from AgriPie FILTERS polygons only; the color
 * renderer stays strictly manual, so cropRendererMode is never auto-toggled.
 */
export const syncChartOrderAndCropFlags = (
  host: LocalizationHost,
  updates: Partial<GeoWidgetState>,
  flags: GeoChangeFlags,
): { nextVhForOrder: string; nextTurlarForOrder: string[] } => {
  const { yearChanged, viloyatChanged, tumanChanged, turiChanged } = flags;
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
  return { nextVhForOrder, nextTurlarForOrder };
};

export const hasStateChanges = (
  host: LocalizationHost,
  updates: Partial<GeoWidgetState>,
): boolean =>
  (Object.keys(updates) as Array<keyof GeoWidgetState>).some(
    (key) => updates[key] !== host.state[key],
  );

/** VH-only toggles from AgriBar skip the geography/crop code round-trips. */
export const isVhOnlyApply = (
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
  host: LocalizationHost,
  flags: GeoChangeFlags,
): boolean => {
  const turiClearedWithVh =
    flags.turiChanged &&
    !(updates.turlar && updates.turlar.length) &&
    Boolean(String((updates.vh ?? host.state.vh) || "").trim());
  return (
    d.source === "AgriBar" &&
    d.vh !== undefined &&
    !flags.yearChanged &&
    !flags.viloyatChanged &&
    !flags.tumanChanged &&
    (!flags.turiChanged || turiClearedWithVh)
  );
};

/** Polygon-only path of the setState callback: no map layer re-sync. */
export const runPolygonSelectionCallback = (
  host: LocalizationHost,
  d: WidgetSelectionDetail,
  updates: Partial<GeoWidgetState>,
  search: SearchClearInfo,
) => {
  if (search.mapPickedDifferentField) {
    // New map field stays selected/zoomed; only drop search filter/UI.
    host.emitGraffTableSearchClear({ preserveSelection: true });
  } else if (
    d.source === "AgriPopup" &&
    d.polygonMode === false &&
    search.hadSearchSelection
  ) {
    host.emitGraffTableSearchClear();
  }
  host.broadcastFilterState();
  if (updates.polygonMode ?? d.polygonMode) {
    host.schedulePolygonFilterGuards();
  }
};
