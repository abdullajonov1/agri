import type { VegetationUniqueIdsForStatusParams } from "../veg-base";
import { queryVegetationLatestStatusSummary } from "./status-latest-window";

/**
 * Uniqueids whose newest reading in the VH window (see status-latest-window)
 * is the selected Vegetatsiya Holati bucket. Used to filter map polygons,
 * AgriRegion bars and the VH-first Pie — the same per-field assignment the
 * VH bar counts, so a clicked bucket shows exactly the fields it counted.
 */
export async function queryVegetationUniqueIdsForStatus(
  params: VegetationUniqueIdsForStatusParams,
): Promise<string[]> {
  const status = String(params.ndviStatus || "")
    .trim()
    .toLowerCase();
  if (!status || !params.date) return [];

  const summary = await queryVegetationLatestStatusSummary(params);
  const row = summary.rows.find((r) => r.ndvi_status === status);
  return row ? row.uniqueIds.slice() : [];
}
