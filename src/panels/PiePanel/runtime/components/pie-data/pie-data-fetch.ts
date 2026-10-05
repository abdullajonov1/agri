import type { PieWidgetHost } from "../../pie-host";
import { VH_CATEGORY_TO_NDVI_STATUS, type VegetationCropBreakdownRow, queryVegetationCropStatsForStatus, queryVegetationCropBreakdownForStatus } from "../../../../../gis/agri-vegetation-data-source";
import { agroV5Log } from "../../../../../gis/agri-debug-log";
import { queryAgriTuriCropMappings, getAgriTableDataLayer, expandUniqueIdsForAgriTable } from "../../../../../gis/agri-table-data-source";
import { getTuriCropLookupKey } from "../../../../../shared/agri-crop-labels";
import { buildPieCategoriesFromMergedRows, syncPieSelectionAgainstCategories, buildPieCategoriesFromPackRows } from "../../../../../data/agri-dashboard-pack-apply";
import { getPieVhFilterUniqueIds, getPieVhFilterUniqueIdsSig } from "../../../../../gis/agri-chart-filter-order";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../../store/agri-dashboard-store";
import { matchPieDashboardPack } from "../../../../../data/agri-dashboard-pack-match";

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
  } catch (statsError: any) {
    agroV5Log(
      "pie:fetch-vegetation-stats-failed",
      {
        vh: vhCategory,
        error: String(statsError?.message || statsError),
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
export const fetchCategoryData = (host: PieWidgetHost): void => {
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
  }, 16);
};
export async function _doFetchCategoryData(host: PieWidgetHost): Promise<void> {
  // Match Agro_widgetV1 query key / routing: selected viloyat only
  // (lockedViloyat stays in state for UI/access, not in the stats key).
  const selectedViloyat = (host.state.viloyat || "").trim();
  const key = host.makeQueryKey(
    host.state.yil,
    selectedViloyat,
    host.state.tuman,
    host.state.vh,
    host.state.barCategoryField,
    host.state.barCategoryValue,
    host.state.filterPieByVh,
    host.state.pieVhUniqueIdsSig,
    host.state.ndviDate,
  );

  if (key === host._lastFetchKey) {
    // Completed fetch for this key — drop a leftover spinner only.
    if (host.state.loading) {
      host.setState({ loading: false });
    }
    return;
  }
  // Same VH scope still waiting on uniqueid bridge — keep loader, do not
  // restore the pre-VH pie (that painted Barchasi 9721 under A'lo).
  if (key === host._pendingVhPieFetchKey && host.state.loading) {
    return;
  }

  // Requires at least yil; viloyat optional (empty = republic-wide)
  if (!host.state.yil) {
    host._lastFetchKey = key;
    host._pendingVhPieFetchKey = "";
    host._hasCompletedFetch = false;
    host.setState({
      categoryData: { categories: [], totalValue: 0 },
      loading: false,
      error: null,
    });
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
    if (!host._isMounted || fetchId !== host._fetchCounter) return;
    const categoryField =
      host.findCategoryField(tableLayer as __esri.FeatureLayer) || "crop_id";
    if (!categoryField) {
      host._hasCompletedFetch = true;
      host._lastFetchKey = key;
      host._pendingVhPieFetchKey = "";
      host.setState({
        loading: false,
        error: "No category field found. Please check your layer fields.",
      });
      return;
    }

    // includeCategory: false — this widget always shows the full crop
    // breakdown (every slice), regardless of which crop is currently
    // selected. The selected crop is only ever a visual highlight
    // (selectedCategory/activeSlice), never a self-filter on this query.

    // VH-first: query vegetation crop mix immediately (same source as VH bar).
    // Do NOT block on the uniqueid bridge — that left the pie stuck on the
    // unscoped region total until (or unless) a follow-up broadcast arrived.
    if (
      host.state.filterPieByVh &&
      String(host.state.vh || "").trim()
    ) {
      const handled = await host.fetchPieCategoriesViaVegetation(fetchId);
      if (!host._isMounted || fetchId !== host._fetchCounter) return;
      if (handled) {
        host._lastFetchKey = key;
        host._pendingVhPieFetchKey = "";
        return;
      }
      // Vegetation unavailable — join Agri_table via bridge uniqueids.
      if (getPieVhFilterUniqueIds() == null) {
        agroV5Log(
          "pie:fetch-wait-uniqueids-pending",
          { filterPieByVh: true, vh: host.state.vh },
          "vh",
        );
        host._pendingVhPieFetchKey = key;
        if (fetchId === host._fetchCounter && host._isMounted) {
          host.setState({ loading: true, error: null });
        }
        return;
      }
      agroV5Log(
        "pie:vegetation-empty-fallback-join",
        {
          vh: host.state.vh,
          vhIdsCount: getPieVhFilterUniqueIds()?.length ?? null,
        },
        "vh",
      );
    } else {
      host._pendingVhPieFetchKey = "";
    }

    const scopeViloyat = String(
      host.state.viloyat || host.state.lockedViloyat || "",
    ).trim();
    const vhIdsRaw = host.state.filterPieByVh
      ? getPieVhFilterUniqueIds()
      : null;
    // Vegetation ids are lower-case unbraced GUIDs; Agri_table_data may
    // store braced/upper-case ones (PostgreSQL equality is case-sensitive).
    // Expand to the table's detected style so the join cannot miss rows.
    let vhIds = vhIdsRaw;
    if (Array.isArray(vhIdsRaw) && vhIdsRaw.length) {
      try {
        vhIds = await expandUniqueIdsForAgriTable(vhIdsRaw);
      } catch {
        vhIds = vhIdsRaw;
      }
      if (!host._isMounted || fetchId !== host._fetchCounter) return;
      // Do not await getAgriTableUniqueIdSamples here — it always hit the
      // network even when __AGRO_V5_*_DEBUG is off (args evaluated first).
      agroV5Log(
        "pie:vh-join-ids",
        {
          rawCount: vhIdsRaw.length,
          expandedCount: vhIds?.length ?? null,
          vegIdSample: vhIdsRaw[0] ?? null,
        },
        "vh",
      );
    }
    const vhScoped =
      host.state.filterPieByVh &&
      Array.isArray(vhIds) &&
      vhIds.length > 0;
    const { district: pieDistrictCode } =
      await host.resolveRegionDistrictForPie();
    if (!host._isMounted || fetchId !== host._fetchCounter) return;
    const whereClause = host.buildWhereClauseForDS({
      includeCategory: false,
      // VH uniqueids are already region/district scoped in
      // agri_vegetation_indices — skip viloyat/tuman name predicates on
      // Agri_table_data (e.g. "Sirdaryo" vs "Sirdaryo viloyati").
      includeViloyat: !!scopeViloyat && !vhScoped,
      districtCode: pieDistrictCode ?? null,
    });

    // Shared DashboardPack hit (no VH) — skip duplicate ArcGIS groupBy.
    if (!host.state.filterPieByVh && !String(host.state.vh || "").trim()) {
      await waitForDashboardPackReady(2500);
      if (!host._isMounted || fetchId !== host._fetchCounter) return;
      const piePack = matchPieDashboardPack(getDashboardPack(), {
        where: whereClause,
        hasVh: Boolean(String(host.state.vh || "").trim()),
      });
      if (piePack) {
        const { categories, totalValue } = buildPieCategoriesFromPackRows(
          piePack.rows,
        );
        if (!host._isMounted || fetchId !== host._fetchCounter) return;
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
        host._lastFetchKey = key;
        host._pendingVhPieFetchKey = "";
        host.setState({
          categoryData: { categories, totalValue },
          loading: false,
          error: null,
          activeSlice,
          selectedCategories: validSelectedCategories,
          selectedCategory: singleSelection,
        });
        return;
      }
    }

    const layersForQuery: __esri.FeatureLayer[] = [
      tableLayer as __esri.FeatureLayer,
    ];

    const merged = new Map<string, { key: string; value: number }>();
    const vhChunks = host.buildPieVhWhereChunks(vhIds);
    const whereParts =
      vhChunks && vhChunks.length
        ? vhChunks.map((chunk) =>
            whereClause && whereClause !== "1=1"
              ? `(${whereClause}) AND (${chunk})`
              : chunk,
          )
        : [whereClause || "1=1"];

    agroV5Log(
      "pie:fetch-query",
      {
        filterPieByVh: host.state.filterPieByVh,
        vhScopedSkipGeography: vhScoped,
        vh: host.state.vh,
        vhIdsCount: vhIds?.length ?? null,
        vhIdsSig: getPieVhFilterUniqueIdsSig(),
        vhChunkCount: vhChunks?.length ?? 0,
        whereClause,
        wherePartCount: whereParts.length,
        turlar: host.state.turlar,
        turi: host.state.turi,
        viloyat: scopeViloyat,
        tuman: host.state.tuman,
        yil: host.state.yil,
      },
      host.state.tuman ? "tuman" : "vh",
    );

    for (const layer of layersForQuery) {
      const layerCategoryField = host.findCategoryField(layer);
      if (!layerCategoryField) continue;

      for (const partWhere of whereParts) {
        const part = await host.queryCategoryStatsJSON(
          layer,
          partWhere,
          layerCategoryField,
        );

        for (const r of part) {
          const cropId = String(r.key ?? "").trim();
          if (!cropId) continue;
          const prev = merged.get(cropId);
          if (prev) {
            prev.value += Number(r.value || 0);
          } else {
            merged.set(cropId, {
              key: cropId,
              value: Number(r.value || 0),
            });
          }
        }
      }
    }

    const rows = Array.from(merged.values());

    if (!host._isMounted || fetchId !== host._fetchCounter) return;

    const { categories, totalValue } = buildPieCategoriesFromMergedRows(rows);

    agroV5Log(
      "pie:fetch-result",
      {
        filterPieByVh: host.state.filterPieByVh,
        vh: host.state.vh,
        viloyat: host.state.viloyat,
        tuman: host.state.tuman,
        yil: host.state.yil,
        categoryCount: categories.length,
        totalValue,
        categories: categories.map((c) => ({
          key: c.key,
          value: Math.round(c.value),
          pct: Math.round(c.percentage),
        })),
        mergedRawCount: rows.length,
      },
      host.state.tuman ? "tuman" : "vh",
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
    host._lastFetchKey = key;
    host._pendingVhPieFetchKey = "";
    host.setState({
      categoryData: { categories, totalValue },
      loading: false,
      error: null,
      activeSlice,
      turi: singleSelection,
      turlar: validSelectedCategories,
      selectedCategory: singleSelection || null,
      selectedCategories: validSelectedCategories,
      debugInfo: `Loaded ${categories.length} categories (WHERE: ${whereClause})`,
    });
  } catch (error: any) {
    if (!host._isMounted || fetchId !== host._fetchCounter) return;

    host._hasCompletedFetch = true;
    host._lastFetchKey = key;
    host._pendingVhPieFetchKey = "";
    host.setState({
      loading: false,
      error: error?.message || "Failed to load data from layer.",
    });
  }
}
