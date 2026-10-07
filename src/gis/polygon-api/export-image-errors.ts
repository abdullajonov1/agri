/**
 * Classifies export-image HTTP failures (season, imagery gaps, missing polygon)
 * from the error status and server message.
 */

interface ErrorLike {
  status?: unknown;
  responseText?: unknown;
  message?: unknown;
}

const asErrorLike = (err: unknown): ErrorLike =>
  err && typeof err === "object" ? (err as ErrorLike) : {};

const errorStatus = (err: unknown): number => Number(asErrorLike(err).status);

/** responseText, else message, else the value itself ("" when nothing usable). */
const errorText = (err: unknown, includeSelf = false): string => {
  const e = asErrorLike(err);
  const fallback = includeSelf && err != null && typeof err !== "object" ? err : "";
  return String(e.responseText || e.message || fallback || "");
};

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/**
 * export-image rejects dates outside a crop's index season with HTTP 400, e.g.
 * "Indices for crop_id=6 (wheat) are calculated only in March, April; September
 * is outside the season". /available-dates lists every scene date regardless of
 * crop, so an out-of-season date is a normal answer there — the season is only
 * discoverable from this error.
 */
export function isExportImageOutOfSeasonError(err: unknown): boolean {
  const status = errorStatus(err);
  const text = errorText(err);
  if (status !== 400 && !/HTTP\s+400/i.test(text)) return false;
  return /outside the season|calculated only in/i.test(text);
}

/** Month numbers (1–12) named in an out-of-season export-image error. */
export function parseExportImageSeasonMonths(err: unknown): number[] {
  const text = errorText(err, true).toLowerCase();
  const marker = text.indexOf("calculated only in");
  if (marker < 0) return [];
  // Stop before the "; <Month> is outside the season" tail — that month is NOT allowed.
  const tail = text.slice(marker);
  const allowedPart = tail.split(";")[0];
  const months = new Set<number>();
  for (const [name, num] of Object.entries(MONTH_NAME_TO_NUMBER)) {
    if (allowedPart.includes(name)) months.add(num);
  }
  return Array.from(months).sort((a, b) => a - b);
}

/** crop_id from "Indices for crop_id=6 (wheat) are calculated only in …". */
export function parseExportImageCropId(err: unknown): number | null {
  const text = errorText(err, true);
  const match = text.match(/crop_id\s*=\s*(\d+)/i);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

/**
 * `/available-dates` lists dates that have *index records*, but export-image
 * also needs the region's raster scene for that day. Missing scenes answer:
 * - HTTP 400: "No imagery available for region_id=… on …" (older API)
 * - HTTP 404: "No imagery in AdminRaster/… for region='…' on …" (current API)
 * - HTTP 400: "Imagery for … could not be rendered (no valid pixels …)"
 * That gap is region-wide, so cache it for every polygon of the region.
 */
export function isExportImageNoImageryError(err: unknown): boolean {
  const status = errorStatus(err);
  const text = errorText(err);
  const statusOk =
    status === 400 ||
    status === 404 ||
    /HTTP\s+40[04]/i.test(text);
  if (!statusOk) return false;
  return /no imagery|could not be rendered|no valid pixels/i.test(text);
}

/** Hard miss — uniqueid not in the year's SDE table; do not probe other dates. */
export function isExportImagePolygonNotFoundError(err: unknown): boolean {
  const status = errorStatus(err);
  const text = errorText(err);
  if (status !== 404 && !/HTTP\s+404/i.test(text)) return false;
  return /uniqueid=.*not found|polygon.*not found/i.test(text);
}
