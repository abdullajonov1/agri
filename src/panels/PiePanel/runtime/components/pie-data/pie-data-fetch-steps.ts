import type { PieWidgetHost } from "../../pie-host";
import { agroV5Log } from "../../../../../shared/agri-debug-log";
import { expandUniqueIdsForAgriTable } from "../../../../../gis/agri-table-data-source";
import {
  buildPieCategoriesFromMergedRows,
  syncPieSelectionAgainstCategories,
  buildPieCategoriesFromPackRows,
} from "../../../../../data/agri-dashboard-pack-apply";
import { getPieVhFilterUniqueIds, getPieVhFilterUniqueIdsSig } from "../../../../../gis/agri-chart-filter-order";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../../store/agri-dashboard-store";
import { matchPieDashboardPack } from "../../../../../data/agri-dashboard-pack-match";

const PACK_READY_TIMEOUT_MS = 2500;

export type MergedCategoryRow = { key: string; value: number };

/** True when the fetch was superseded or the widget unmounted. */
export function isStaleFetch(host: PieWidgetHost, fetchId: number): boolean {
  return !host._isMounted || fetchId !== host._fetchCounter;
}

/** Combines the base WHERE with each VH uniqueid chunk (one query per chunk). */
export function buildPieWhereParts(
  whereClause: string | null | undefined,
  vhChunks: readonly string[] | null | undefined,
): string[] {
  if (vhChunks && vhChunks.length) {
    return vhChunks.map((chunk) =>
      whereClause && whereClause !== "1=1"
        ? `(${whereClause}) AND (${chunk})`
        : chunk,
    );
  }
  return [whereClause || "1=1"];
}

/** Adds a query part's rows into a copy of the merged map (sums values per crop key). */
export function mergeCategoryRows(
  merged: ReadonlyMap<string, MergedCategoryRow>,
  part: ReadonlyArray<{ key?: unknown; value?: unknown }>,
): Map<string, MergedCategoryRow> {
  const next = new Map(merged);
  for (const r of part) {
    const cropId = String(r.key ?? "").trim();
    if (!cropId) continue;
    const prev = next.get(cropId);
    const value = Number(r.value || 0);
    next.set(cropId, { key: cropId, value: prev ? prev.value + value : value });
  }
  return next;
}

/** Empty-year state: no year means nothing to query. */
export function applyMissingYearState(host: PieWidgetHost, key: string): void {
  host._lastFetchKey = key;
  host._pendingVhPieFetchKey = "";
  host._hasCompletedFetch = false;
  host.setState({
    categoryData: { categories: [], totalValue: 0 },
    loading: false,
    error: null,
  });
}

export function applyNoCategoryFieldState(host: PieWidgetHost, key: string): void {
  host._hasCompletedFetch = true;
  host._lastFetchKey = key;
  host._pendingVhPieFetchKey = "";
  host.setState({
    loading: false,
    error: "No category field found. Please check your layer fields.",
  });
}

/**
 * VH-first branch. Returns true when the caller must stop (handled, stale or
 * waiting on the uniqueid bridge); false to continue with the table join.
 */
export async function runVhFirstStep(
  host: PieWidgetHost,
  key: string,
  fetchId: number,
): Promise<boolean> {
  const handled = await host.fetchPieCategoriesViaVegetation(fetchId);
  if (isStaleFetch(host, fetchId)) return true;
  if (handled) {
    host._lastFetchKey = key;
    host._pendingVhPieFetchKey = "";
    return true;
  }
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
    return true;
  }
  agroV5Log(
    "pie:vegetation-empty-fallback-join",
    {
      vh: host.state.vh,
      vhIdsCount: getPieVhFilterUniqueIds()?.length ?? null,
    },
    "vh",
  );
  return false;
}

/**
 * Expands bridge uniqueids to the table's id style. Returns null when the
 * fetch went stale while awaiting.
 */
export async function resolveVhJoinIds(
  host: PieWidgetHost,
  fetchId: number,
): Promise<{ vhIds: string[] | null | undefined } | null> {
  const vhIdsRaw = host.state.filterPieByVh ? getPieVhFilterUniqueIds() : null;
  let vhIds = vhIdsRaw;
  if (Array.isArray(vhIdsRaw) && vhIdsRaw.length) {
    try {
      vhIds = await expandUniqueIdsForAgriTable(vhIdsRaw);
    } catch {
      vhIds = vhIdsRaw;
    }
    if (isStaleFetch(host, fetchId)) return null;
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
  return { vhIds };
}

/** Shared DashboardPack hit (no VH). Returns true when the caller must stop. */
export async function tryServePieFromPack(
  host: PieWidgetHost,
  key: string,
  fetchId: number,
  whereClause: string,
): Promise<boolean> {
  await waitForDashboardPackReady(PACK_READY_TIMEOUT_MS);
  if (isStaleFetch(host, fetchId)) return true;
  const piePack = matchPieDashboardPack(getDashboardPack(), {
    where: whereClause,
    hasVh: false,
  });
  if (!piePack) return false;
  const { categories, totalValue } = buildPieCategoriesFromPackRows(piePack.rows);
  if (isStaleFetch(host, fetchId)) return true;
  const { validSelectedCategories, activeSlice, singleSelection } =
    syncPieSelectionAgainstCategories(
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
  return true;
}

/** Runs the grouped stats query per WHERE part and merges rows by crop key. */
export async function queryMergedCategoryRows(
  host: PieWidgetHost,
  layer: __esri.FeatureLayer,
  whereParts: readonly string[],
): Promise<MergedCategoryRow[]> {
  let merged = new Map<string, MergedCategoryRow>();
  const layerCategoryField = host.findCategoryField(layer);
  if (!layerCategoryField) return [];
  for (const partWhere of whereParts) {
    const part = await host.queryCategoryStatsJSON(layer, partWhere, layerCategoryField);
    merged = mergeCategoryRows(merged, part);
  }
  return Array.from(merged.values());
}

export function logPieFetchQuery(
  host: PieWidgetHost,
  info: {
    vhScoped: boolean;
    vhIds: string[] | null | undefined;
    vhChunkCount: number;
    whereClause: string;
    wherePartCount: number;
    scopeViloyat: string;
  },
): void {
  agroV5Log(
    "pie:fetch-query",
    {
      filterPieByVh: host.state.filterPieByVh,
      vhScopedSkipGeography: info.vhScoped,
      vh: host.state.vh,
      vhIdsCount: info.vhIds?.length ?? null,
      vhIdsSig: getPieVhFilterUniqueIdsSig(),
      vhChunkCount: info.vhChunkCount,
      whereClause: info.whereClause,
      wherePartCount: info.wherePartCount,
      turlar: host.state.turlar,
      turi: host.state.turi,
      viloyat: info.scopeViloyat,
      tuman: host.state.tuman,
      yil: host.state.yil,
    },
    host.state.tuman ? "tuman" : "vh",
  );
}

/** Builds categories from merged rows, logs, and commits the final state. */
export function commitMergedCategories(
  host: PieWidgetHost,
  key: string,
  rows: MergedCategoryRow[],
  whereClause: string,
): void {
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

  const { validSelectedCategories, activeSlice, singleSelection } =
    syncPieSelectionAgainstCategories(
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
}
