/** Normalizes an ArcGIS date attribute (epoch ms, Date, or string) to "YYYY-MM-DD". */
export function formatArcgisDateToYmd(value: unknown): string | null {
  if (value == null) return null;
  // Non-Date values go straight to the Date constructor (epoch ms / ISO text).
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


/** Inclusive raster_date window: startYmd .. endYmd (both calendar days). */
export function dateRangeInclusiveClause(
  dateField: string,
  startYmd: string,
  endYmd: string,
): string {
  const start = String(startYmd || "").trim();
  const end = String(endYmd || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return "1=0";
  }
  if (start > end) return "1=0";
  const endParts = end.split("-").map((p) => parseInt(p, 10));
  const next = new Date(
    Date.UTC(endParts[0], endParts[1] - 1, endParts[2] + 1),
  );
  const nextYmd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  return `${dateField} >= DATE '${start}' AND ${dateField} < DATE '${nextYmd}'`;
}
export function shiftYmd(ymd: string, deltaDays: number): string | null {
  const parts = String(ymd || "").split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
/** Uzbekistan (Asia/Tashkent) is UTC+5 year-round (no DST). */
const TASHKENT_TZ_OFFSET_MS = 5 * 60 * 60 * 1000;
function epochMsFromDateValue(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const ms =
    value instanceof Date
      ? value.getTime()
      : new Date(value as string | number).getTime();
  return Number.isFinite(ms) ? ms : null;
}
/** Calendar day in Tashkent for a processed_at timestamp. */
export function formatEpochToTashkentYmd(value: unknown): string | null {
  const ms = epochMsFromDateValue(value);
  if (ms == null) return null;
  const shifted = new Date(ms + TASHKENT_TZ_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function tashkentDayBoundsMs(
  ymd: string,
): { startMs: number; endMs: number } | null {
  const parts = String(ymd || "")
    .trim()
    .split("-")
    .map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  // Midnight Tashkent = that civil date at 00:00 UTC minus +5h.
  const startMs = Date.UTC(y, m - 1, d) - TASHKENT_TZ_OFFSET_MS;
  return { startMs, endMs: startMs + 24 * 60 * 60 * 1000 };
}
function formatUtcSqlTimestamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
/**
 * One Tashkent calendar day of processed_at (overnight loads stay on local day).
 * Prefer TIMESTAMP range; fall back callers already use DATE for raster_date.
 */
export function processedAtTashkentDayWhere(dateField: string, ymd: string): string {
  const bounds = tashkentDayBoundsMs(ymd);
  if (!bounds) return "1=0";
  return (
    `${dateField} >= TIMESTAMP '${formatUtcSqlTimestamp(bounds.startMs)}' ` +
    `AND ${dateField} < TIMESTAMP '${formatUtcSqlTimestamp(bounds.endMs)}'`
  );
}
