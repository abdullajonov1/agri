/**
 * ✅ MAIN INPUT: Master filter state from AgriFilter
 * - reacts to yil + viloyat + tuman + turi + vh
 */
import type { GraffWidgetHost } from "../graff-host";
import type { VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import type { AgriLanguage } from "../../../../shared/agri-language";
import { clearMapSelectionGraphics } from "../graff-map-utils";
import { eventDetail } from "../graff-guards";
import { graffDebugCatch, graffLog } from "../graff-log";
import {
  buildNextRegionalFilters,
  isPolygonOnlyEvent,
  isPolygonOutsideVhStatus,
  normalizeVhUniqueids,
  parseRegionDistrictCodes,
  readMasterFilterOrdering,
  vhUniqueidsSignature,
  type GraffRegionalFilters,
  type MasterFilterEventDetail,
  type MasterFilterPayload,
} from "./master-filter-parse";

/** Drop events older than the last applied broadcast; record the newest. */
function acceptMasterFilterOrdering(
  host: GraffWidgetHost,
  d: MasterFilterEventDetail,
): boolean {
  const { eventTs, eventGen } = readMasterFilterOrdering(d);
  if (
    eventGen > 0 &&
    host._lastMasterFilterBroadcastGeneration > 0 &&
    eventGen < host._lastMasterFilterBroadcastGeneration
  ) {
    graffLog("handleMasterFilterChanged:SKIP-stale-generation", {
      eventGen,
      lastGen: host._lastMasterFilterBroadcastGeneration,
      viloyat: d.filters?.viloyat,
      tuman: d.filters?.tuman,
    });
    return false;
  }
  if (eventTs > 0 && host._lastMasterFilterTs > 0 && eventTs < host._lastMasterFilterTs) {
    graffLog("handleMasterFilterChanged:SKIP-stale-timestamp", {
      eventTs,
      lastTs: host._lastMasterFilterTs,
      viloyat: d.filters?.viloyat,
      tuman: d.filters?.tuman,
    });
    return false;
  }
  if (eventGen > 0) host._lastMasterFilterBroadcastGeneration = eventGen;
  if (eventTs > 0) host._lastMasterFilterTs = eventTs;
  return true;
}

interface ResolvedCodes {
  regionalRegionCode: number | null;
  regionalDistrictCode: number | null;
}

/**
 * Never retain a code belonging to the previous viloyat / tuman. If this
 * event does not carry a fresh numeric code, the name→region mapping is
 * safer than reusing stale state.
 */
function resolveRegionalCodes(
  host: GraffWidgetHost,
  parsed: { regionCode: number | null; districtCode: number | null },
  initialRegionCode: number | null,
  effectiveViloyat: string,
  effectiveTuman: string,
): ResolvedCodes {
  let regionalRegionCode: number | null = initialRegionCode;
  let regionalDistrictCode: number | null = parsed.districtCode;
  const viloyatChanged = effectiveViloyat !== host.state.regionalFilters.viloyat;
  if (!effectiveViloyat || (viloyatChanged && parsed.regionCode == null)) {
    regionalRegionCode = null;
  }
  const tumanChanged = effectiveTuman !== host.state.regionalFilters.tuman;
  if (!effectiveTuman || (tumanChanged && parsed.districtCode == null)) {
    regionalDistrictCode = null;
  }
  return { regionalRegionCode, regionalDistrictCode };
}

/**
 * A polygon was selected/deselected elsewhere (e.g. AgriPopup's map click
 * inspector) — sync our own chart to it. Only when geography is unchanged:
 * a Back/region change must exit single-field mode even if a stale
 * broadcast still carries uniqueid/polygonMode.
 */
function syncPolygonFromBroadcast(
  host: GraffWidgetHost,
  f: MasterFilterPayload,
  effectiveViloyat: string,
  effectiveTuman: string,
  regionCodeHint: number | null,
): void {
  const geographyChanging =
    effectiveViloyat !== host.state.regionalFilters.viloyat ||
    effectiveTuman !== host.state.regionalFilters.tuman ||
    String(f.yil || "") !== host.state.regionalFilters.yil;
  if (geographyChanging) {
    host.syncExternalPolygonSelection("", false, regionCodeHint);
    return;
  }
  host.syncExternalPolygonSelection(
    f.uniqueid ? String(f.uniqueid).trim() : "",
    Boolean(f.polygonMode),
    regionCodeHint,
    typeof f.uniqueidClickedAt === "number" ? f.uniqueidClickedAt : undefined,
  );
}

const sameTurlar = (a: string[] | undefined, b: string[] | undefined): boolean =>
  JSON.stringify(a || []) === JSON.stringify(b || []);

interface MasterFilterPlan {
  next: GraffRegionalFilters;
  codes: ResolvedCodes;
  vhUniqueids: string[] | null;
  parentChanged: boolean;
  ndviDate: string;
  nextFarmerInn: string;
  nextLanguage: AgriLanguage;
}

/** setState + follow-up refresh once the plan decided a refetch is needed. */
function applyMasterFilterPlan(host: GraffWidgetHost, plan: MasterFilterPlan): void {
  const { next, vhUniqueids, parentChanged, ndviDate, nextFarmerInn } = plan;
  const prevFilters = host.state.regionalFilters;
  const targetLayer = next.viloyat
    ? host.getFeatureLayerForViloyat(next.viloyat) || host.state.featureLayer
    : host.state.featureLayer;

  // If parent geography/time changed, polygon selection becomes stale.
  // Also release the field when a VH status is active and the polygon is
  // not in that status's uniqueid list — then show regional VH chart.
  const selectedId = String(host.state.selecteduniqueid || "").trim();
  const geographyMoved =
    next.viloyat !== prevFilters.viloyat ||
    next.tuman !== prevFilters.tuman ||
    next.yil !== prevFilters.yil;
  const shouldClearPolygonSelection =
    !!selectedId &&
    (geographyMoved || isPolygonOutsideVhStatus(selectedId, next.vh, vhUniqueids));

  // Search filter is scoped to the previous geography — clear on yil/viloyat/tuman,
  // unless master filter still carries an active header STIR selection.
  const shouldClearSearch = !nextFarmerInn && geographyMoved;

  if (shouldClearPolygonSelection || shouldClearSearch) {
    // Prevent restoring a pre-selection extent from a previous geography.
    host._extentBeforeTableSelection = null;
  }

  const vhChanged = next.vh !== prevFilters.vh;
  const willHavePolygon = !!selectedId && !shouldClearPolygonSelection;
  const shouldRefreshGraph =
    host.state.viewMode === "graph" &&
    (shouldClearPolygonSelection || !willHavePolygon || vhChanged);
  // Republic default is NDVI-only — drop SAVI/RVI/etc. when viloyat clears.
  const returningToRepublic =
    !String(next.viloyat || "").trim() && !!String(prevFilters.viloyat || "").trim();
  const clearSearchMeta = shouldClearSearch && !nextFarmerInn;

  host.setState(
    {
      regionalFilters: next,
      featureLayer: targetLayer,
      regionalRegionCode: plan.codes.regionalRegionCode,
      regionalDistrictCode: plan.codes.regionalDistrictCode,
      vhUniqueids,
      selectedNdviDate: ndviDate || null,
      selectedChartIndexKey: null,
      selectedIndices: returningToRepublic
        ? (["ndvi"] as VegetationIndiceType[])
        : host.state.selectedIndices,
      selectedMonth: parentChanged ? null : host.state.selectedMonth,
      isMonthPickerOpen: false,
      chartTooltip: parentChanged ? null : host.state.chartTooltip,
      selecteduniqueid: shouldClearPolygonSelection ? "" : host.state.selecteduniqueid,
      // Keep previous graph series while the next filter result loads (Agrobank morph).
      vegetationData: host.state.vegetationData,
      vegetationError: null,
      loadingVegetation: shouldRefreshGraph ? true : host.state.loadingVegetation,
      farmerInn: nextFarmerInn,
      searchText: nextFarmerInn
        ? nextFarmerInn
        : shouldClearSearch
          ? ""
          : host.state.searchText,
      searchError: clearSearchMeta ? null : host.state.searchError,
      searchResultCount: clearSearchMeta ? null : host.state.searchResultCount,
      isSearchActive: nextFarmerInn
        ? true
        : shouldClearSearch
          ? false
          : host.state.isSearchActive,
      records: [],
      currentPage: 1,
      loading: true,
      language: plan.nextLanguage,
    },
    () => afterMasterFilterApplied(host, shouldClearPolygonSelection, vhChanged),
  );
}

function afterMasterFilterApplied(
  host: GraffWidgetHost,
  shouldClearPolygonSelection: boolean,
  vhChanged: boolean,
): void {
  host.publishVegetationOverlayContext();
  if (shouldClearPolygonSelection) {
    host.cancelVegetationImageOverlay();
    clearMapSelectionGraphics(host.state.activeMapView?.view);
    try {
      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            source: "AgriGraffWidget",
            polygonMode: false,
            uniqueid: "",
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );
    } catch (err) {
      graffDebugCatch("handleMasterFilterChanged:dispatchSelectionCleared", err);
    }
  }
  host.scheduleRefresh();
  if (host.state.viewMode === "graph" && !host.state.selecteduniqueid) {
    host.fetchRegionalTimeseries();
  } else if (host.state.viewMode === "graph" && host.state.selecteduniqueid && vhChanged) {
    // Polygon still in VH status — keep field chart, but refresh series.
    host.fetchVegetationData();
  }
}

/** Only a language change (or nothing) — update UI state without refetch. */
function applyLanguageOnly(host: GraffWidgetHost, nextLanguage: AgriLanguage): void {
  if (nextLanguage !== host.state.language) {
    host.setState({ language: nextLanguage });
  }
}

export const handleMasterFilterChanged = (host: GraffWidgetHost, event: Event) => {
  if (!host._isMounted) return;

  const d = eventDetail<MasterFilterEventDetail>(event);
  if (!d?.filters) return;
  if (d.source === "AgriGraffWidget") return;
  if (!acceptMasterFilterOrdering(host, d)) return;

  const f: MasterFilterPayload = d.filters || {};
  host._barCategoryField = String(f.barCategoryField || "").trim();
  host._barCategoryValue = String(f.barCategoryValue || "").trim();

  const nextLanguage: AgriLanguage =
    (f.language as AgriLanguage) || host.state.language || "ru";

  // AgriFilter may provide the active "locked viloyat" via scope.
  // In that case, f.viloyat can be empty, so we still need to route queries to the locked layer.
  const lockedViloyat = d?.scope?.lockedViloyat
    ? host.normalizeApos(String(d.scope.lockedViloyat))
    : "";

  // Try to capture numeric region code from AgriFilter WHERE clause, if available
  const parsedCodes = parseRegionDistrictCodes(d?.meta?.whereClause);
  const initialRegionCode: number | null =
    parsedCodes.regionCode ?? host.state.regionalRegionCode ?? null;
  const effectiveViloyat =
    lockedViloyat || (f.viloyat ? host.normalizeApos(String(f.viloyat)) : "");
  const effectiveTuman = f.tuman ? host.normalizeApos(String(f.tuman)) : "";

  syncPolygonFromBroadcast(
    host,
    f,
    effectiveViloyat,
    effectiveTuman,
    initialRegionCode,
  );

  const codes = resolveRegionalCodes(
    host,
    parsedCodes,
    initialRegionCode,
    effectiveViloyat,
    effectiveTuman,
  );
  if (
    codes.regionalDistrictCode != null &&
    Number.isFinite(codes.regionalDistrictCode) &&
    effectiveTuman &&
    effectiveViloyat
  ) {
    host.storeRegionDistrictMappingRow(
      effectiveViloyat,
      codes.regionalRegionCode,
      effectiveTuman,
      codes.regionalDistrictCode,
    );
  }

  const next = buildNextRegionalFilters(f, effectiveViloyat, host.normalizeApos);
  // We now filter directly on layer fields (including per-date status fields)
  // instead of receiving giant uniqueid IN (...) lists from AgriFilter.
  const vhUniqueids = normalizeVhUniqueids(d.vhUniqueids);
  const prevFilters = host.state.regionalFilters;

  // ✅ Defensive: if parent changed and vh not included properly, clear it
  const parentChanged =
    next.yil !== prevFilters.yil ||
    next.viloyat !== prevFilters.viloyat ||
    next.tuman !== prevFilters.tuman ||
    next.uzspace !== prevFilters.uzspace ||
    !sameTurlar(next.turlar, prevFilters.turlar);
  const keepVh = parentChanged && next.vh && next.vh === prevFilters.vh;
  if (!keepVh && parentChanged && !f.vh) {
    next.vh = "";
  }

  const ndviDate = f.ndviDate ? String(f.ndviDate) : "";
  const geographyUnchanged = !host.filtersChanged(prevFilters, next);
  const hadSelectedField = Boolean(String(host.state.selecteduniqueid || "").trim());
  const vhIdsChanged =
    vhUniqueidsSignature(vhUniqueids) !== vhUniqueidsSignature(host.state.vhUniqueids);
  const nextFarmerInn = String(f.farmerInn || "").trim();
  const farmerInnChanged = nextFarmerInn !== String(host.state.farmerInn || "").trim();
  const dataInputsUnchanged = geographyUnchanged && !vhIdsChanged && !farmerInnChanged;

  // Polygon pick/clear does not change geography. syncExternal already
  // cleared selectedNdviDate, so comparing against the hub's effective
  // ndviDate would falsely fall through into scheduleRefresh /
  // applyMapFilters — rewriting MapImage definitionExpression and racing
  // the popup click path.
  if (dataInputsUnchanged && isPolygonOnlyEvent(f, hadSelectedField)) {
    applyLanguageOnly(host, nextLanguage);
    return;
  }
  if (dataInputsUnchanged && ndviDate === (host.state.selectedNdviDate || "")) {
    // Language-only change: update UI state, but don't refetch data.
    applyLanguageOnly(host, nextLanguage);
    return;
  }

  applyMasterFilterPlan(host, {
    next,
    codes,
    vhUniqueids,
    parentChanged,
    ndviDate,
    nextFarmerInn,
    nextLanguage,
  });
};
