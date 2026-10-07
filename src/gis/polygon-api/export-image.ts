/**
 * export-image client: GeoTIFF fetch (timeout + byte cap), session cache and
 * the sequential season-aware date walk.
 */
import {
  AgriHttpError,
  fetchArrayBuffer,
  fetchWithTimeout,
  isAgriHttpError,
} from "../../shared/agri-http";
import { fetchPolygonAvailableDates } from "./available-dates";
import {
  agriPolygonApiLog,
  EXPORT_IMAGE_MAX_BYTES,
  EXPORT_IMAGE_TIMEOUT_MS,
  getAgriPolygonApiBaseUrl,
  WARMUP_TIMEOUT_MS,
  type ExportImageRequestParams,
  type PolygonExportImageResult,
  type VegetationIndiceType,
} from "./config";
import { listExportRasterDateCandidates } from "./export-date-pick";
import {
  isExportImageNoImageryError,
  isExportImageOutOfSeasonError,
  isExportImagePolygonNotFoundError,
  parseExportImageCropId,
  parseExportImageSeasonMonths,
} from "./export-image-errors";
import {
  normalizeUniqueidKey,
  rememberExportImageSeasonMonths,
  rememberRegionDateWithImagery,
  rememberRegionDateWithoutImagery,
  syncExportImageKnowledgeFromStorage,
} from "./export-image-knowledge";
import { parseExportImageIndexHeaders } from "./index-color";
import { decodeExportImageTiff } from "./tiff-decode";

/** Session cache: first click pays network+decode; repeats reuse the canvas. */
const exportImageCache = new Map<string, Promise<PolygonExportImageResult>>();
const EXPORT_IMAGE_CACHE_MAX = 24;

function exportImageCacheKey(params: ExportImageRequestParams): string {
  return [
    String(params.uniqueid || "").replace(/[{}]/g, ""),
    params.regionId,
    params.rasterDate,
    params.indiceType || "ndvi",
    params.stretch || "fixed",
  ].join("|");
}

function cloneExportCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  const ctx = copy.getContext("2d");
  if (ctx) ctx.drawImage(source, 0, 0);
  return copy;
}

/**
 * Best-effort TLS / DNS warmup for api-agri so the first field click does not
 * pay cold-connection cost on export-image.
 */
export function warmPolygonApiConnection(): void {
  fetchWithTimeout(`${getAgriPolygonApiBaseUrl()}/`, {
    timeoutMs: WARMUP_TIMEOUT_MS,
    init: {
      method: "GET",
      headers: { accept: "*/*" },
      mode: "cors",
      cache: "no-store",
    },
  }).catch((err: unknown) => {
    // Warmup only — a failure here just means the first real call pays the handshake.
    agriPolygonApiLog("warmup:failed", { error: String(err) });
  });
}

/**
 * GET /v1/polygon/{uniqueid}/export-image, requested with
 * response_format=tiff — fetches the raw GeoTIFF bytes directly (skips the
 * response_format=json envelope, whose exact stats/base64 field names
 * weren't confirmed) and decodes it client-side with geotiff.js. A GeoTIFF
 * carries its own extent + CRS in its tags, so no separate georeferencing
 * call is needed — read it straight off the decoded image.
 */
export async function fetchPolygonExportImageTiff(
  params: ExportImageRequestParams,
): Promise<PolygonExportImageResult> {
  const cacheKey = exportImageCacheKey(params);
  let pending = exportImageCache.get(cacheKey);
  if (!pending) {
    pending = fetchPolygonExportImageTiffUncached(params).catch((err: unknown) => {
      exportImageCache.delete(cacheKey);
      throw err;
    });
    exportImageCache.set(cacheKey, pending);
    while (exportImageCache.size > EXPORT_IMAGE_CACHE_MAX) {
      const oldest = exportImageCache.keys().next().value;
      if (oldest == null) break;
      exportImageCache.delete(oldest);
    }
  }
  const result = await pending;
  // Clone canvas so a later MediaLayer remove/reuse cannot blank a cached entry.
  return {
    ...result,
    canvas: cloneExportCanvas(result.canvas),
  };
}

/** One in-flight date-walk per polygon — kickOptimistic + fetchData share it. */
const exportDateWalkInFlight = new Map<
  string,
  Promise<{ date: string; result: PolygonExportImageResult } | null>
>();

/**
 * Fetch available-dates (or use provided), then try export-image **one date
 * at a time** (newest in-season first). On HTTP 400/404 season or imagery
 * gaps, learn and step to the next candidate — never race 2–3 dates in
 * parallel (that was flooding Network on every polygon click).
 * Deduped so Popup prefetch + Graff share one walk per polygon.
 */
export async function resolveExportImageWithDateWalk(params: {
  uniqueid: string;
  regionId: number;
  year: number;
  indiceType?: VegetationIndiceType;
  cropId?: number | null;
  dates?: string[] | null;
  stretch?: "fixed" | "minmax";
}): Promise<{ date: string; result: PolygonExportImageResult } | null> {
  const id = normalizeUniqueidKey(params.uniqueid);
  if (!id) return null;
  const indiceType = params.indiceType || "ndvi";
  const key = `${id}|${params.regionId}|${indiceType}`;
  const existing = exportDateWalkInFlight.get(key);
  if (existing) return existing;
  // Pull what other widget instances learned (seasons, gaps, proven scenes).
  syncExportImageKnowledgeFromStorage(true);

  const walk = (async () => {
    let dates = params.dates || null;
    if (!dates?.length) {
      try {
        dates = await fetchPolygonAvailableDates(
          id,
          params.regionId,
          params.year,
        );
      } catch (err: unknown) {
        // No date list → nothing to walk; callers treat null as "no raster".
        agriPolygonApiLog("date-walk:available-dates-failed", { error: String(err) });
        return null;
      }
    }
    if (!dates?.length) return null;

    const tried: string[] = [];
    // Up to 6 sequential probes — AdminRaster often gaps several consecutive
    // April dates (404) before a servable scene (e.g. 2026-04-28).
    for (let round = 0; round < 6; round++) {
      const candidates = listExportRasterDateCandidates(dates, {
        uniqueid: id,
        cropId: params.cropId,
        regionId: params.regionId,
        exclude: tried,
        limit: 1,
      });
      if (!candidates.length) return null;
      const date = candidates[0];
      tried.push(date);

      try {
        const result = await fetchPolygonExportImageTiff({
          uniqueid: id,
          regionId: params.regionId,
          rasterDate: date,
          indiceType,
          stretch: params.stretch || "fixed",
        });
        rememberRegionDateWithImagery(params.regionId, date);
        return { date, result };
      } catch (err) {
        if (isExportImagePolygonNotFoundError(err)) {
          return null;
        }
        if (isExportImageOutOfSeasonError(err)) {
          const months = parseExportImageSeasonMonths(err);
          const crop = parseExportImageCropId(err);
          if (months.length) {
            rememberExportImageSeasonMonths(id, months, crop ?? params.cropId);
          }
        } else if (isExportImageNoImageryError(err)) {
          rememberRegionDateWithoutImagery(params.regionId, date);
        } else {
          // Unknown failure — do not burn remaining candidates blindly.
          return null;
        }
      }
    }
    return null;
  })().finally(() => {
    exportDateWalkInFlight.delete(key);
  });

  exportDateWalkInFlight.set(key, walk);
  return walk;
}

/**
 * Learn from every caller's refusal (not only the date walk) so the next
 * polygon in this region / crop never re-asks the same refused date.
 */
function learnFromExportImageRefusal(
  error: AgriHttpError,
  params: ExportImageRequestParams,
): void {
  if (isExportImageNoImageryError(error)) {
    rememberRegionDateWithoutImagery(params.regionId, params.rasterDate);
    return;
  }
  if (isExportImageOutOfSeasonError(error)) {
    const months = parseExportImageSeasonMonths(error);
    if (months.length) {
      rememberExportImageSeasonMonths(
        params.uniqueid,
        months,
        parseExportImageCropId(error),
      );
    }
  }
}

async function fetchPolygonExportImageTiffUncached(
  params: ExportImageRequestParams,
): Promise<PolygonExportImageResult> {
  const qs = new URLSearchParams({
    region_id: String(params.regionId),
    raster_date: params.rasterDate,
    indice_type: params.indiceType || "ndvi",
    stretch: params.stretch || "fixed",
    response_format: "tiff",
  });
  const url = `${getAgriPolygonApiBaseUrl()}/v1/polygon/${encodeURIComponent(params.uniqueid)}/export-image?${qs.toString()}`;
  agriPolygonApiLog("export-image:request", { url, ...params });

  let download: { buffer: ArrayBuffer; response: Response };
  try {
    download = await fetchArrayBuffer(url, {
      timeoutMs: EXPORT_IMAGE_TIMEOUT_MS,
      maxBytes: EXPORT_IMAGE_MAX_BYTES,
      init: { headers: { accept: "*/*" } },
    });
  } catch (err: unknown) {
    if (!isAgriHttpError(err)) throw err;
    if (err.kind === "timeout") {
      throw new AgriHttpError("Export-image so‘rovi vaqtidan oshdi (25s).", {
        kind: "timeout",
        url,
        cause: err,
      });
    }
    if (err.kind === "http") {
      agriPolygonApiLog("export-image:FAILED-response", {
        url,
        status: err.status,
        statusText: err.statusText,
        contentType: err.contentType,
        responseText: err.responseText,
      });
      learnFromExportImageRefusal(err, params);
    }
    throw err;
  }

  rememberRegionDateWithImagery(params.regionId, params.rasterDate);
  // Stats for this polygon+date — chart/hover must use these, not raw TIFF
  // stretch values (RGB reverse on a 0..1 ramp often shows ~0.9 while true
  // field NDVI max is ~0.5).
  const indexHeaders = parseExportImageIndexHeaders(download.response.headers);
  return decodeExportImageTiff(download.buffer, indexHeaders, params);
}
