/**
 * Pure helpers of status-latest-window: shared types, reading comparison,
 * uniqueid slicing, per-status summaries and the small async limiter.
 */

import { type VegetationStatusCount, type VegetationCropBreakdownRow, VEG_PIXEL_AREA_HA } from "../veg-base";
import type { VhWindowParams } from "./status-vh-window";

/**
 * Every request on this service costs ~3.4 s regardless of size, so the
 * per-field scan is split by the uniqueid's first character and the slices
 * run in parallel (a viloyat finishes in ~one round instead of 6+ serial
 * pages). Bounds are contiguous, so every id falls in exactly one slice
 * under any collation (digits < letters, case-insensitive or not).
 */
const UNIQUEID_PARTITION_BOUNDS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f",
];

export type VegetationLatestStatusParams = VhWindowParams;

export interface VegetationLatestStatusSummary {
  startDate: string;
  endDate: string;
  /** One row per status: distinct fields, px area, assigned uniqueids. */
  rows: VegetationStatusCount[];
  /** status → crop mix of the fields assigned to that status. */
  cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]>;
  /** Per-field assignment behind rows (raw uniqueid, status, crop, px). */
  fields: VhFieldAssignment[];
  fieldCount: number;
  truncated: boolean;
}

export interface VhFieldAssignment {
  uniqueId: string;
  status: string;
  cropId: string;
  pxAll: number;
}

export const EMPTY_SUMMARY = (startDate: string, endDate: string): VegetationLatestStatusSummary => ({
  startDate,
  endDate,
  rows: [],
  cropRowsByStatus: {},
  fields: [],
  fieldCount: 0,
  truncated: false,
});

export type Reading = {
  status: string;
  cropId: string;
  lastDate: number;
  rowCount: number;
  pxAll: number;
};

export const readAttribute = (attributes: Record<string, unknown>, field: string): unknown =>
  attributes?.[field] ??
  attributes?.[field.toLowerCase()] ??
  attributes?.[field.toUpperCase()];

/** ArcGIS date stats come back as epoch ms; tolerate string dates too. */
export const toTime = (raw: unknown): number => {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  const parsed = Date.parse(String(raw ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Newest reading wins; same day falls back to the old majority/area rule. */
export const isBetterReading = (a: Reading, b: Reading): boolean =>
  a.lastDate !== b.lastDate
    ? a.lastDate > b.lastDate
    : a.rowCount !== b.rowCount
      ? a.rowCount > b.rowCount
      : a.pxAll !== b.pxAll
        ? a.pxAll > b.pxAll
        : a.status.localeCompare(b.status) < 0;

export function partitionClauses(field: string): string[] {
  const bounds = UNIQUEID_PARTITION_BOUNDS;
  const out = [`${field} < '${bounds[0]}'`];
  for (let i = 1; i < bounds.length; i += 1) {
    out.push(`${field} >= '${bounds[i - 1]}' AND ${field} < '${bounds[i]}'`);
  }
  out.push(`${field} >= '${bounds[bounds.length - 1]}'`);
  return out;
}

/** Status rows (px area) + crop mix from per-field assignments. */
export function summarizeFields(
  fields: VhFieldAssignment[],
  startDate: string,
  endDate: string,
  truncated: boolean,
): VegetationLatestStatusSummary {
  const byStatus = new Map<string, { count: number; pxAll: number; ids: string[] }>();
  const cropByStatus = new Map<string, Map<string, { pxAll: number; count: number }>>();
  for (const field of fields) {
    const bucket = byStatus.get(field.status) || { count: 0, pxAll: 0, ids: [] };
    bucket.count += 1;
    bucket.pxAll += field.pxAll;
    bucket.ids.push(field.uniqueId);
    byStatus.set(field.status, bucket);
    if (field.cropId) {
      const crops = cropByStatus.get(field.status) || new Map<string, { pxAll: number; count: number }>();
      const crop = crops.get(field.cropId) || { pxAll: 0, count: 0 };
      crop.pxAll += field.pxAll;
      crop.count += 1;
      crops.set(field.cropId, crop);
      cropByStatus.set(field.status, crops);
    }
  }
  const cropRowsByStatus: Record<string, VegetationCropBreakdownRow[]> = {};
  for (const [status, crops] of cropByStatus) {
    cropRowsByStatus[status] = Array.from(crops.entries(), ([cropId, crop]) => ({
      cropId,
      areaHa: crop.pxAll * VEG_PIXEL_AREA_HA,
      fieldCount: crop.count,
    }));
  }
  return {
    startDate,
    endDate,
    rows: Array.from(byStatus.entries(), ([status, bucket]) => ({
      ndvi_status: status,
      count: bucket.count,
      areaHa: bucket.pxAll * VEG_PIXEL_AREA_HA,
      uniqueIds: bucket.ids,
    })),
    cropRowsByStatus,
    fields,
    fieldCount: fields.length,
    truncated,
  };
}

/** Agri_table scope matching a VH scope (same viloyat / tuman / year). */
export const tableScope = (params: VegetationLatestStatusParams) => ({
  region: params.region,
  district: params.district,
  year: String(params.date || "").trim().slice(0, 4),
});

/** Run `tasks` with at most `limit` in flight. */
export async function runLimited<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
