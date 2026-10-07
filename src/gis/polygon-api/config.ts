/**
 * Shared types, limits and logging for the api-agri.sgm.uzspace.uz client.
 */
import { getAgriServiceUrls } from "../../shared/agri-service-urls";

export function getAgriPolygonApiBaseUrl(): string {
  return getAgriServiceUrls().polygonApiBaseUrl;
}

/** Logger disabled — keep call sites without console noise. */
export function agriPolygonApiLog(
  _phase: string,
  _detail?: Record<string, unknown>,
): void {
  /* no-op */
}

/** /available-dates is a small JSON list; 15s bounds a hung API. */
export const AVAILABLE_DATES_TIMEOUT_MS = 15000;
/** Cap for the available-dates JSON body (a year of dates is a few KB). */
export const AVAILABLE_DATES_MAX_BYTES = 1024 * 1024;
/** Bound hung export-image calls so the map loader cannot stick forever. */
export const EXPORT_IMAGE_TIMEOUT_MS = 25000;
/** Single-polygon GeoTIFFs are well under 5 MB; refuse anything absurd. */
export const EXPORT_IMAGE_MAX_BYTES = 50 * 1024 * 1024;
/** 4096×4096 — beyond this the RGBA canvas alone would cost >64 MB. */
export const EXPORT_IMAGE_MAX_PIXELS = 16_777_216;
/** TLS / DNS warmup only — never worth waiting long for. */
export const WARMUP_TIMEOUT_MS = 5000;

export interface PolygonAvailableDatesResponse {
  uniqueid: string;
  region: string;
  year: number;
  count: number;
  dates: string[];
}

export type VegetationIndiceType =
  | "ndvi"
  | "savi"
  | "rvi"
  | "ci"
  | "evi"
  | "ndre"
  | "ndwi";

export interface PolygonExportImageResult {
  /** Decoded, colored raster drawn onto a canvas (RGBA), ready to display. */
  canvas: HTMLCanvasElement;
  /** [minX, minY, maxX, maxY], read directly from the GeoTIFF's own geo tags. */
  bbox: [number, number, number, number];
  /** EPSG/WKID read from the GeoTIFF geo keys, when present. */
  epsgCode: number | null;
  width: number;
  height: number;
  /**
   * Row-major per-pixel index values for map hover tooltips.
   * Prefer values calibrated from export-image `X-Index-Min` / `X-Index-Max`
   * headers (not raw TIFF stretch / RGB reverse on a 0..1 ramp).
   */
  values: Float32Array | null;
  /**
   * Row-major RGBA (length width*height*4) for lazy hover sampling on RGB TIFFs.
   * Null when `values` already holds calibrated indices.
   */
  rgba: Uint8ClampedArray | null;
  /** Sentinel for transparent / outside-polygon pixels. */
  noData: number | null;
  /** From response header `X-Index-Min` (field stats for this export). */
  indexMin: number | null;
  /** From response header `X-Index-Max`. */
  indexMax: number | null;
  /** From response header `X-Index-Mean`. */
  indexMean: number | null;
}

export interface ExportImageRequestParams {
  uniqueid: string;
  regionId: number;
  /** YYYY-MM-DD */
  rasterDate: string;
  indiceType?: VegetationIndiceType;
  stretch?: "fixed" | "minmax";
}

export interface IndexHeaderStats {
  indexMin: number | null;
  indexMax: number | null;
  indexMean: number | null;
}
