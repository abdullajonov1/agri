/**
 * Index ↔ color helpers for export-image rasters: header stats, stretch
 * calibration, client-side colorize and RGB → index reverse lookup.
 */
import type { IndexHeaderStats } from "./config";

/** Read api-agri export-image stats headers (sent with response_format=tiff). */
export function parseExportImageIndexHeaders(headers: Headers): IndexHeaderStats {
  const read = (name: string): number | null => {
    const raw =
      headers.get(name) ||
      headers.get(name.toLowerCase()) ||
      headers.get(name.replace(/X-/i, "x-"));
    if (raw == null || String(raw).trim() === "") return null;
    const n = Number(String(raw).trim());
    return Number.isFinite(n) ? n : null;
  };
  return {
    indexMin: read("X-Index-Min"),
    indexMax: read("X-Index-Max"),
    indexMean: read("X-Index-Mean"),
  };
}

/**
 * Map a 0..1 colormap / stretch position onto the real index range from
 * export-image headers (chart min/max). Without headers, returns t01 as-is.
 */
export function mapStretch01ToIndexRange(
  t01: number,
  indexMin: number | null,
  indexMax: number | null,
): number {
  if (!Number.isFinite(t01)) return t01;
  if (
    indexMin == null ||
    indexMax == null ||
    !Number.isFinite(indexMin) ||
    !Number.isFinite(indexMax) ||
    !(indexMax > indexMin)
  ) {
    return t01;
  }
  const t = Math.max(0, Math.min(1, t01));
  return indexMin + t * (indexMax - indexMin);
}

/** Classic vegetation color stops (low → high) for client-side colorize + RGB reverse. */
const VEG_COLOR_STOPS: Array<{ v: number; r: number; g: number; b: number }> = [
  { v: 0.0, r: 165, g: 0, b: 38 },
  { v: 0.15, r: 215, g: 48, b: 39 },
  { v: 0.3, r: 244, g: 109, b: 67 },
  { v: 0.45, r: 253, g: 174, b: 97 },
  { v: 0.55, r: 254, g: 224, b: 139 },
  { v: 0.65, r: 217, g: 239, b: 139 },
  { v: 0.75, r: 166, g: 217, b: 106 },
  { v: 0.85, r: 102, g: 189, b: 99 },
  { v: 0.95, r: 26, g: 152, b: 80 },
  { v: 1.0, r: 0, g: 104, b: 55 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function colorizeIndexValue(
  value: number,
  out: Uint8ClampedArray,
  offset: number,
): void {
  if (!Number.isFinite(value)) {
    out[offset] = 0;
    out[offset + 1] = 0;
    out[offset + 2] = 0;
    out[offset + 3] = 0;
    return;
  }
  const v = Math.max(0, Math.min(1, value));
  let i = 0;
  while (i < VEG_COLOR_STOPS.length - 1 && VEG_COLOR_STOPS[i + 1].v < v) i++;
  const a = VEG_COLOR_STOPS[i];
  const b = VEG_COLOR_STOPS[Math.min(i + 1, VEG_COLOR_STOPS.length - 1)];
  const span = b.v - a.v || 1;
  const t = (v - a.v) / span;
  out[offset] = Math.round(lerp(a.r, b.r, t));
  out[offset + 1] = Math.round(lerp(a.g, b.g, t));
  out[offset + 2] = Math.round(lerp(a.b, b.b, t));
  out[offset + 3] = 255;
}

/**
 * Recover an approximate continuous index (0..1) from a pre-colored RGB pixel.
 * Projects onto the nearest segment of VEG_COLOR_STOPS (not nearest stop only),
 * so hover shows values like 0.22 / 0.37 instead of only 0.15 / 0.30 / 0.45.
 * Still an approximation when the TIFF has no float band — true NDVI needs floats.
 */
export function sampleIndexFromRgba(
  r: number,
  g: number,
  b: number,
  a?: number,
): number | null {
  if (a != null && a < 8) return null;
  if (r + g + b < 8) return null;

  let bestVal = 0;
  let bestDist = Infinity;

  for (let i = 0; i < VEG_COLOR_STOPS.length - 1; i++) {
    const stopA = VEG_COLOR_STOPS[i];
    const stopC = VEG_COLOR_STOPS[i + 1];
    const abx = stopC.r - stopA.r;
    const aby = stopC.g - stopA.g;
    const abz = stopC.b - stopA.b;
    const ab2 = abx * abx + aby * aby + abz * abz || 1;
    const apx = r - stopA.r;
    const apy = g - stopA.g;
    const apz = b - stopA.b;
    let t = (apx * abx + apy * aby + apz * abz) / ab2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const cx = stopA.r + abx * t;
    const cy = stopA.g + aby * t;
    const cz = stopA.b + abz * t;
    const dr = r - cx;
    const dg = g - cy;
    const db = b - cz;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      bestVal = stopA.v + (stopC.v - stopA.v) * t;
    }
  }

  return bestVal;
}
