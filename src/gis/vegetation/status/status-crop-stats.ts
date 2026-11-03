import type { VegetationCropBreakdownParams, VegetationCropBreakdownRow } from "../veg-base";
import { queryVegetationLatestStatusAreas } from "./status-latest-window";

/**
 * Crop mix for one VH status — the fields the VH bar assigned to that status
 * (newest reading in the VH window), grouped by their crop_id. Totals
 * partition the bar bucket exactly, so the VH-first Ekin Turi pie matches it.
 */
export async function queryVegetationCropStatsForStatus(
  params: VegetationCropBreakdownParams,
): Promise<VegetationCropBreakdownRow[]> {
  const status = String(params.ndviStatus || "")
    .trim()
    .toLowerCase();
  if (!status || !params.date) return [];

  const summary = await queryVegetationLatestStatusAreas({
    date: params.date,
    region: params.region,
    district: params.district,
  });
  return (summary.cropRowsByStatus[status] || []).map((row) => ({ ...row }));
}
