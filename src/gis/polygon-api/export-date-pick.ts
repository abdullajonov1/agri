/**
 * Chooses which available-dates entry export-image should be asked for, and
 * resolves crop / region ids from polygon attributes.
 */
import { getTuriCropLookupKey } from "../../shared/agri-crop-labels";
import {
  getExportImageSeasonMonths,
  isRegionDateWithoutImagery,
} from "./export-image-knowledge";

/** Newest→oldest export candidates (season + known imagery gaps). */
export function listExportRasterDateCandidates(
  dates: string[] | null | undefined,
  opts?: {
    uniqueid?: string;
    cropId?: number | null;
    regionId?: number | null;
    exclude?: string[];
    limit?: number;
  },
): string[] {
  const months = getExportImageSeasonMonths(
    opts?.uniqueid || "",
    opts?.cropId,
  );
  // Default 1 — one export-image at a time (caller retries on 400).
  const limit = Math.max(1, opts?.limit ?? 1);
  const out: string[] = [];
  const exclude = [...(opts?.exclude || [])];
  while (out.length < limit) {
    const next =
      pickLatestUsableExportDate(dates, {
        months,
        regionId: opts?.regionId,
        exclude,
      }) ||
      (!months.length
        ? pickLatestUsableExportDate(dates, {
            regionId: opts?.regionId,
            exclude,
          })
        : null);
    if (!next) break;
    out.push(next);
    exclude.push(next);
  }
  return out;
}

/**
 * Pick the newest available-dates entry that export-image is likely to serve
 * for this polygon (crop season + known regional imagery gaps).
 */
export function pickExportRasterDate(
  dates: string[] | null | undefined,
  opts?: {
    uniqueid?: string;
    cropId?: number | null;
    regionId?: number | null;
    exclude?: string[];
  },
): string | null {
  return (
    listExportRasterDateCandidates(dates, { ...opts, limit: 1 })[0] || null
  );
}

/**
 * crop_id from a field polygon's attributes (table row or clicked graphic):
 * numeric crop_id/cropId first, else the turi name (wheat → 6 in api-agri).
 */
export function resolveCropIdFromAttributes(
  attrs: Record<string, unknown> | null | undefined,
): number | null {
  if (!attrs || typeof attrs !== "object") return null;
  let turi = "";
  for (const [key, value] of Object.entries(attrs)) {
    const lower = key.toLowerCase();
    if (lower === "crop_id" || lower === "cropid") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    } else if (lower === "turi" && value != null) {
      turi = String(value).trim();
    }
  }
  if (turi && getTuriCropLookupKey(turi) === "bugdoy") return 6;
  return null;
}

/**
 * Numeric region_id for export-image from a clicked polygon's attributes.
 * Needed when Localization has no viloyat selected (republic) or Portal
 * filter broadcast has not yet mapped viloyat→region.
 */
export function resolveRegionIdFromAttributes(
  attrs: Record<string, unknown> | null | undefined,
): number | null {
  if (!attrs || typeof attrs !== "object") return null;
  for (const [key, value] of Object.entries(attrs)) {
    const lower = key.toLowerCase();
    if (
      lower === "region" ||
      lower === "region_id" ||
      lower === "regionid"
    ) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/**
 * Newest date export-image can plausibly serve: inside the crop season and not
 * already known to lack regional imagery.
 */
export function pickLatestUsableExportDate(
  dates: string[] | null | undefined,
  opts?: {
    months?: number[];
    regionId?: number | null;
    exclude?: string[];
  },
): string | null {
  const months = opts?.months || [];
  const exclude = new Set(
    (opts?.exclude || []).map((d) => String(d || "").slice(0, 10)),
  );
  const list = (dates || [])
    .map((d) => String(d || "").slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort((a, b) => a.localeCompare(b));

  for (let i = list.length - 1; i >= 0; i--) {
    const date = list[i];
    if (exclude.has(date)) continue;
    if (months.length && !months.includes(Number(date.slice(5, 7)))) continue;
    if (
      opts?.regionId != null &&
      isRegionDateWithoutImagery(opts.regionId, date)
    ) {
      continue;
    }
    return date;
  }
  return null;
}
