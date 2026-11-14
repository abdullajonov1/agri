import type { PieWidgetHost } from "../../pie-host";
import { VH_CATEGORY_TO_NDVI_STATUS, type VegetationCropBreakdownRow, queryVegetationCropStatsForStatus, queryVegetationCropBreakdownForStatus } from "../../../../../gis/agri-vegetation-data-source";
import { agroV5Log } from "../../../../../gis/agri-debug-log";
import { errorMessage } from "../../../../../shared/agri-plain-object";
import { messageOf } from "../../../../panel-filter-detail";
import { queryAgriTuriCropMappings, getAgriTableDataLayer } from "../../../../../gis/agri-table-data-source";
import { getTuriCropLookupKey } from "../../../../../shared/agri-crop-labels";
import { buildPieCategoriesFromMergedRows, syncPieSelectionAgainstCategories } from "../../../../../data/agri-dashboard-pack-apply";
import {
  isStaleFetch,
  applyMissingYearState,
  applyNoCategoryFieldState,
  runVhFirstStep,
  resolveVhJoinIds,
  tryServePieFromPack,
  buildPieWhereParts,
  logPieFetchQuery,
  queryMergedCategoryRows,
  commitMergedCategories,
} from "./pie-data-fetch-steps";

/** Coalesces rapid region changes before starting a pie data fetch. */
const FETCH_DEBOUNCE_MS = 16;

/**
 * VH-first Pie: crop mix from agri_vegetation_indices (same source as VH bar).
 * Agri_table_data uniqueid joins are incomplete for many polygons.
 */
export async function fetchPieCategoriesViaVegetation(host: PieWidgetHost, fetchId: number): Promise<boolean> {
  const vhCategory = String(host.state.vh || "").trim();
  const ndviStatus = VH_CATEGORY_TO_NDVI_STATUS[vhCategory];
  const ndviDate = host.resolveNdviDateForVhPie();
  if (!ndviStatus || !ndviDate) {
    agroV5Log(
      "pie:vegetation-skip-missing-meta",
      { vhCategory, ndviStatus, ndviDate },
      "vh",
    );
    return false;
  }

  const { region, district } = await host.resolveRegionDistrictForPie();
  if (!host._isMounted || fetchId !== host._fetchCounter) return true;

  agroV5Log(
    "pie:fetch-vegetation-query",
    {
      vh: vhCategory,
      ndviStatus,
      ndviDate,
      region: region ?? null,
      district: district ?? null,
    },
    "vh",
  );

  // Grouped crop_id stats: one round-trip, and its totals partition the same
  // px_all sum the VH bar shows for this status. The exact per-uniqueid
  // breakdown stays as a fallback only for *narrow* scopes — at viloyat
  // scale it pages dozens of groupBy(uniqueid,crop_id) queries (Network
  // flood) while Agri_table + VH uniqueid join below already covers that case.
  let breakdown: VegetationCropBreakdownRow[];
  try {
    breakdown = await queryVegetationCropStatsForStatus({
      date: ndviDate,
      ndviStatus,
      region,
      district,
    });
  } catch (statsError: unknown) {
    agroV5Log(
      "pie:fetch-vegetation-stats-failed",
      {
        vh: vhCategory,
        error: errorMessage(statsError),
        district: district ?? null,
        willTryBreakdown: district != null,
      },
      "vh",
    );
    if (district == null) {
      // Viloyat / republic: skip heavy uniqueid×crop paging → join path.
      return false;
    }
    breakdown = await queryVegetationCropBreakdownForStatus({
      date: ndviDate,
      ndviStatus,
      region,
      district,
    });
  }
  if (!host._isMounted || fetchId !== host._fetchCounter) return true;

  const mappings = await queryAgriTuriCropMappings();
  if (!host._isMounted || fetchId !== host._fetchCounter) return true;

  // Keep crop_id as the pie key; labels resolve via mapping.
  for (const row of mappings) {
    const id = String(row.cropId || "").trim();
    const turi = String(row.turi || "").trim();
    if (!id || !turi) continue;
    if (!host._cropIdToTuri[id]) host._cropIdToTuri[id] = turi;
    const turiKey = getTuriCropLookupKey(turi);
    if (turiKey && !host._turiToCropId[turiKey]) {
      host._turiToCropId[turiKey] = id;
    }
  }
  host._cropMapsReady = true;

  const merged = new Map<string, number>();
  for (const row of breakdown) {
    const cropId = String(row.cropId || "").trim();
    if (!cropId) continue;
    merged.set(cropId, (merged.get(cropId) || 0) + row.areaHa);
  }

  const rows = Array.from(merged.entries()).map(([key, value]) => ({
    key,
    value,
  }));
  const totalValueProbe = rows.reduce((sum, r) => sum + r.value, 0);

  // Vegetation rows exist for this status (the bar shows them), but the
  // crop mix came back empty — usually crop_id is not filled for this
  // scope. Report "not handled" so the caller can join crops from
  // Agri_table_data via the resolved VH uniqueids instead.
  if (!rows.length || totalValueProbe <= 0) {
    agroV5Log(
      "pie:fetch-vegetation-empty",
      {
        vh: vhCategory,
        ndviDate,
        region: region ?? null,
        district: district ?? null,
        breakdownRowCount: breakdown.length,
      },
      "vh",
    );
    return false;
  }
  const { categories, totalValue } = buildPieCategoriesFromMergedRows(rows);

  agroV5Log(
    "pie:fetch-vegetation-result",
    {
      vh: vhCategory,
      categoryCount: categories.length,
      totalValue,
      categories: categories.map((c) => ({
        key: c.key,
        value: Math.round(c.value),
        pct: Math.round(c.percentage),
      })),
    },
    "vh",
  );

  const {
    validSelectedCategories,
    activeSlice,
    singleSelection,
  } = syncPieSelectionAgainstCategories(
    host.state.selectedCategories,
    categories,
    (value) => host.normalizeName(value),
  );

  host._hasCompletedFetch = true;
  host.setState({
    categoryData: { categories, totalValue },
    loading: false,
    error: null,
    activeSlice,
    turi: singleSelection,
    turlar: validSelectedCategories,
    selectedCategory: singleSelection || null,
    selectedCategories: validSelectedCategories,
    debugInfo: `VH pie via vegetation (${categories.length} crops)`,
  });
  return true;
}
export function makeQueryKey(host: PieWidgetHost, yil: string, viloyat: string, tuman: string, vh: string, barField?: string | null, barValue?: string | null, filterPieByVh?: boolean, pieVhSig?: string, ndviDate?: string) {
  return [
    yil || "",
    viloyat || "",
    tuman || "",
    vh || "",
    barField ?? "",
    barValue ?? "",
    filterPieByVh ? "vhPie" : "",
    pieVhSig ?? "",
    ndviDate ?? "",
  ].join("|");
}
// ✅ Debounced fetch with de-duplication
/**
 * Drop any in-flight fetch for a different key (and a pending debounce) and
 * clear a leftover loader, so a result for the old key can never be applied.
 */
function invalidateInFlightFetch(host: PieWidgetHost): void {
  host._fetchCounter++;
  if (host._fetchDebounceTimer) {
    clearTimeout(host._fetchDebounceTimer);
    host._fetchDebounceTimer = null;
  }
  if (host.state.loading) {
    host.setState({ loading: false });
  }
}

/**
 * Query key of what the pie would fetch now. Effective viloyat
 * (viloyat || lockedViloyat, same as the query scope); the VH
 * class and its date only count when they scope the pie (never, by default).
 */
export function currentPieQueryKey(host: PieWidgetHost): string {
  const scopedByVh = Boolean(host.state.filterPieByVh);
  return host.makeQueryKey(
    host.state.yil,
    String(host.state.viloyat || host.state.lockedViloyat || "").trim(),
    host.state.tuman,
    scopedByVh ? host.state.vh : "",
    host.state.barCategoryField,
    host.state.barCategoryValue,
    host.state.filterPieByVh,
    host.state.pieVhUniqueIdsSig,
    scopedByVh ? host.state.ndviDate : "",
  );
}

export const fetchCategoryData = (host: PieWidgetHost): void => {
  // Nothing that changes the pie changed (e.g. a VH click re-filtered the
  // map layers and the data source fired): keep the chart, no loader flash.
  if (
    host._hasCompletedFetch &&
    !host.state.error &&
    !host._pendingVhPieFetchKey &&
    currentPieQueryKey(host) === host._lastFetchKey
  ) {
    invalidateInFlightFetch(host);
    return;
  }

  // Clear any pending fetch
  if (host._fetchDebounceTimer) {
    clearTimeout(host._fetchDebounceTimer);
  }

  // Show loader immediately so UI never flashes "no data" during debounce.
  if (!host.state.loading) {
    host.setState({ loading: true, error: null });
  }

  // Short debounce so region changes feel immediate
  host._fetchDebounceTimer = setTimeout(() => {
    host._doFetchCategoryData();
  }, FETCH_DEBOUNCE_MS);
};
export async function _doFetchCategoryData(host: PieWidgetHost): Promise<void> {
  const key = currentPieQueryKey(host);

  if (key === host._lastFetchKey) {
    // Completed fetch for this key — drop a leftover spinner and any
    // in-flight fetch for a different key.
    invalidateInFlightFetch(host);
    return;
  }
  // Same VH scope still waiting on uniqueid bridge — keep loader, do not
  // restore the pre-VH pie (that painted Barchasi 9721 under A'lo).
  if (key === host._pendingVhPieFetchKey && host.state.loading) {
    return;
  }

  // Requires at least yil; viloyat optional (empty = republic-wide)
  if (!host.state.yil) {
    applyMissingYearState(host, key);
    return;
  }

  if (host.state.connectionStatus !== "connected") {
    return;
  }

  host._fetchCounter++;
  const fetchId = host._fetchCounter;

  try {
    if (!host.state.loading) {
      host.setState({ loading: true, error: null });
    } else {
      host.setState({ error: null });
    }

    const { layer: tableLayer } = await getAgriTableDataLayer();
    await host.ensureCropIdMaps();
    if (isStaleFetch(host, fetchId)) return;
    const categoryField =
      host.findCategoryField(tableLayer as __esri.FeatureLayer) || "crop_id";
    if (!categoryField) {
      applyNoCategoryFieldState(host, key);
      return;
    }

    // includeCategory: false — this widget always shows the full crop
    // breakdown (every slice); the selected crop is only a visual highlight.

    // VH-first: query vegetation crop mix immediately (same source as VH bar).
    // Do NOT block on the uniqueid bridge.
    if (host.state.filterPieByVh && String(host.state.vh || "").trim()) {
      if (await runVhFirstStep(host, key, fetchId)) return;
    } else {
      host._pendingVhPieFetchKey = "";
    }

    const scopeViloyat = String(
      host.state.viloyat || host.state.lockedViloyat || "",
    ).trim();
    // Vegetation ids are lower-case unbraced GUIDs; Agri_table_data may
    // store braced/upper-case ones, so expand to the table's style.
    const joinIds = await resolveVhJoinIds(host, fetchId);
    if (!joinIds) return;
    const { vhIds } = joinIds;
    const vhScoped =
      host.state.filterPieByVh && Array.isArray(vhIds) && vhIds.length > 0;
    const { district: pieDistrictCode } =
      await host.resolveRegionDistrictForPie();
    if (isStaleFetch(host, fetchId)) return;
    const whereClause = host.buildWhereClauseForDS({
      includeCategory: false,
      // VH uniqueids are already region/district scoped in
      // agri_vegetation_indices — skip viloyat/tuman name predicates.
      includeViloyat: !!scopeViloyat && !vhScoped,
      districtCode: pieDistrictCode ?? null,
    });

    if (
      !host.state.filterPieByVh &&
      (await tryServePieFromPack(host, key, fetchId, whereClause))
    ) {
      return;
    }

    const vhChunks = host.buildPieVhWhereChunks(vhIds);
    const whereParts = buildPieWhereParts(whereClause, vhChunks);

    logPieFetchQuery(host, {
      vhScoped,
      vhIds,
      vhChunkCount: vhChunks?.length ?? 0,
      whereClause,
      wherePartCount: whereParts.length,
      scopeViloyat,
    });

    const rows = await queryMergedCategoryRows(
      host,
      tableLayer as __esri.FeatureLayer,
      whereParts,
    );
    if (isStaleFetch(host, fetchId)) return;

    commitMergedCategories(host, key, rows, whereClause);
  } catch (error: unknown) {
    if (isStaleFetch(host, fetchId)) return;

    // Do not store _lastFetchKey: the same key must retry after an error.
    host._hasCompletedFetch = true;
    host._pendingVhPieFetchKey = "";
    host.setState({
      loading: false,
      error: messageOf(error) || "Failed to load data from layer.",
    });
  }
}
