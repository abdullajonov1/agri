import SpatialReference from "esri/geometry/SpatialReference";
import Extent from "esri/geometry/Extent";
import * as projection from "esri/geometry/projection";
import ImageElement from "esri/layers/support/ImageElement";
import ExtentAndRotationGeoreference from "esri/layers/support/ExtentAndRotationGeoreference";
import MediaLayer from "esri/layers/MediaLayer";
import {
  getExportImageSeasonMonths,
  isExportImageNoImageryError,
  isExportImageOutOfSeasonError,
  isRegionDateWithImagery,
  isRegionDateWithoutImagery,
  parseExportImageCropId,
  parseExportImageSeasonMonths,
  pickExportRasterDate,
  rememberExportImageSeasonMonths,
  rememberRegionDateWithoutImagery,
  type PolygonExportImageResult,
  type VegetationIndiceType,
} from "../../../gis/agri-polygon-api-source";
import { stripUniqueidBraces } from "../../../data/agri-uniqueid-sql";
import {
  announceVegetationOverlayApplied,
  setVegetationOverlayContext,
} from "../../../gis/agri-vegetation-overlay-prefetch";
import { graffLog } from "./graff-log";
import { asThrownObject, describeThrown, thrownMessage, thrownStatus } from "./graff-guards";
import type {
  GraffRasterOverlayHost,
  GraffSurfaceLoadingOwner,
  GraffVegetationRasterSample,
} from "./graff-raster-overlay";

export const VEGETATION_IMAGE_LAYER_ID = "agri-graff-vegetation-image-overlay";

/**
 * Drop the map loader unless an export-image fetch is in flight (that fetch
 * clears it itself). Use on every path that ends without fetching — a date
 * walk with no hit, a retry that gives up, a skipped date — otherwise the
 * loader stays up until the dashboard's 25 s safety timer.
 */
export const releaseIdleSurfaceLoading = (
  host: GraffSurfaceLoadingOwner,
): void => {
  if (host._vegetationOverlayPendingKey) return;
  host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
};

/**
 * True when an overlay is already drawn or loading for the current
 * selection. A late date-walk result must not replace it — that is a date
 * the user (or an earlier path) already chose.
 */
export const hasActiveVegetationOverlay = (
  host: GraffSurfaceLoadingOwner,
): boolean =>
  Boolean(host._vegetationOverlayAppliedKey || host._vegetationOverlayPendingKey);

/** Per-call facts shared by every step. */
export interface OverlayCallContext {
  uniqueid: string;
  cleanId: string;
  regionId: number;
  cropId: number | null;
  advertisedDates: string[];
  indiceType: VegetationIndiceType;
  requestedDate: string;
  /** The user picked this day (navigator, chart click, index switch). */
  interactive: boolean;
}

/** Optional flags for applyGraffVegetationImageOverlay. */
export interface OverlayCallOptions {
  /** Set only for user-driven picks; automatic paths wait for the date walk. */
  interactive?: boolean;
}

export interface OverlayExtentResult {
  extent: __esri.Extent;
  epsgCode: number;
  nativeSr: __esri.SpatialReference;
}

/** Result of a step that may end the whole call (`stop`) or yield a date. */
export type DateStepResult = { stop: true } | { stop: false; date: string };

/** Narrowing guard that works without strictNullChecks. */
export const isDateStepContinue = (
  result: DateStepResult,
): result is { stop: false; date: string } => !result.stop;

const RASTER_REQUEST_REJECTED_RE = /HTTP\s+40[04]/i;
const MAX_GEOGRAPHIC_ABS = 180;

// ---- pure helpers ---------------------------------------------------------

/** True when bbox and pixel size describe a usable georeferenced raster. */
export const isValidRasterGeoreference = (
  bbox: readonly number[],
  width: number,
  height: number,
): boolean => {
  const [minX, minY, maxX, maxY] = bbox;
  return (
    [minX, minY, maxX, maxY].every((n) => Number.isFinite(n)) &&
    maxX > minX &&
    maxY > minY &&
    width > 0 &&
    height > 0
  );
};

/**
 * EPSG of the raster. Falls back to 4326 only when coords look geographic;
 * projected-metre coords must never be treated as the view SR.
 */
export const resolveRasterEpsg = (
  epsgCode: number | null | undefined,
  bbox: readonly number[],
): number | null => {
  if (epsgCode != null && Number.isFinite(epsgCode)) return epsgCode;
  const absMax = Math.max(...bbox.map((n) => Math.abs(n)));
  return absMax <= MAX_GEOGRAPHIC_ABS ? 4326 : null;
};

/** True when an export-image failure means the date can never be served. */
export const isDateRejectedError = (err: unknown): boolean => {
  const status = Number(thrownStatus(err));
  return (
    status === 400 ||
    status === 404 ||
    RASTER_REQUEST_REJECTED_RE.test(describeThrown(err))
  );
};

/** Which hover payload (float values or RGBA) the raster can serve. */
export const detectHoverPayload = (
  result: Pick<PolygonExportImageResult, "values" | "rgba" | "width" | "height">,
): { hasFloatValues: boolean; hasRgba: boolean } => ({
  hasFloatValues:
    !!result.values && result.values.length === result.width * result.height,
  hasRgba:
    !!result.rgba && result.rgba.length === result.width * result.height * 4,
});

const isProjectedExtentUsable = (e: __esri.Extent | null | undefined): e is __esri.Extent =>
  !!e &&
  Number.isFinite(e.xmin) &&
  Number.isFinite(e.ymin) &&
  e.xmax > e.xmin &&
  e.ymax > e.ymin;

// ---- date steps -----------------------------------------------------------

export const resolveInitialDate = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
): string =>
  host.resolveAgainstAvailableDates(ctx.requestedDate, ctx.advertisedDates) ||
  String(ctx.requestedDate || "").slice(0, 10);

const pickRewriteCandidates = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
): Array<string | undefined> => {
  if (ctx.advertisedDates.length) return ctx.advertisedDates;
  return host._latestRasterDateByUniqueid.has(ctx.cleanId)
    ? [host._latestRasterDateByUniqueid.get(ctx.cleanId)]
    : [];
};

/**
 * Rewrite out-of-season / known-missing dates BEFORE the HTTP call so the
 * network tab does not show a cascade of 400s for every table row.
 */
export const rewriteUnservableDate = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  date: string,
): DateStepResult => {
  const { cleanId, cropId, regionId, advertisedDates, indiceType } = ctx;
  const seasonMonths = getExportImageSeasonMonths(cleanId, cropId);
  const dateMonth = Number(String(date).slice(5, 7));
  // The polygon's own index dates are proof the API can serve that scene.
  // A season learned from another crop must not hide a listed date.
  const listedForPolygon = advertisedDates.includes(date);
  const outOfSeason = seasonMonths.length > 0 && !seasonMonths.includes(dateMonth);
  const needsRewrite =
    !listedForPolygon && (outOfSeason || isRegionDateWithoutImagery(regionId, date));
  if (!needsRewrite) return { stop: false, date };

  const rewritten = pickExportRasterDate(pickRewriteCandidates(host, ctx), {
    uniqueid: cleanId,
    cropId,
    regionId,
    exclude: [date],
  });
  if (rewritten && rewritten !== date) {
    graffLog("applyVegetationImageOverlay:rewrite-unservable-date", {
      uniqueid: cleanId,
      from: date,
      to: rewritten,
      cropId,
      seasonMonths,
    });
    return { stop: false, date: rewritten };
  }
  if (outOfSeason) {
    // Season known but no alternative yet — fetch dates then retry, skip
    // the doomed September request entirely.
    graffLog("applyVegetationImageOverlay:SKIP-out-of-season", {
      uniqueid: cleanId,
      rasterDate: date,
      cropId,
      seasonMonths,
    });
    void host.retryOverlayWithUsableDate(cleanId, regionId, date, indiceType);
    return { stop: true };
  }
  return { stop: false, date };
};

/**
 * An unverified date while the dates→TIFF walk is still probing this
 * polygon: wait for the walk instead of racing a parallel export-image.
 * Skipped when the caller handed us the walk TIFF, or when the USER picked a
 * date that is in the polygon's own list (skipWait). Automatic paths always
 * wait, so one selection sends one export-image request, not two or three.
 */
export const waitForWalkDate = async (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  date: string,
  hasPrefetched: boolean,
  skipWait: boolean,
): Promise<DateStepResult> => {
  const { cleanId, regionId, indiceType } = ctx;
  const shouldWait =
    !hasPrefetched &&
    !skipWait &&
    !host._verifiedOverlayDates.has(`${cleanId}|${date}`) &&
    !isRegionDateWithImagery(regionId, date);
  if (!shouldWait) return { stop: false, date };

  const walkDate = await host.awaitPendingOverlayWalk(cleanId);
  if (!host._isMounted) return { stop: true };
  if (stripUniqueidBraces(host.state.selecteduniqueid) !== cleanId) return { stop: true };
  if (walkDate) {
    if (walkDate === date) return { stop: false, date };
    graffLog("applyVegetationImageOverlay:use-walk-date", {
      uniqueid: cleanId,
      from: date,
      to: walkDate,
      indiceType,
    });
    return { stop: false, date: walkDate };
  }
  if (walkDate === null && isRegionDateWithoutImagery(regionId, date)) {
    // Walk finished without a hit and proved this date missing too.
    graffLog("applyVegetationImageOverlay:SKIP-walk-no-imagery", {
      uniqueid: cleanId,
      rasterDate: date,
      indiceType,
    });
    host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
    return { stop: true };
  }
  return { stop: false, date };
};

// ---- skip checks ----------------------------------------------------------

/** Returns true when the call must end without fetching. */
export const shouldSkipOverlay = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  rasterKey: string,
  date: string,
): boolean => {
  const { cleanId, indiceType, advertisedDates } = ctx;
  // Early available-dates path and series path often request the same key —
  // do not cancel an in-flight/already-drawn overlay for a redundant call.
  if (host._vegetationOverlayAppliedKey === rasterKey && host._vegetationImageLayer) {
    graffLog("applyVegetationImageOverlay:SKIP-already-applied", {
      uniqueid: cleanId,
      rasterDate: date,
      indiceType,
    });
    host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
    host.setState({ polygonImageLoading: false, polygonImageError: null });
    return true;
  }
  if (host.state.polygonImageLoading && host._vegetationOverlayPendingKey === rasterKey) {
    graffLog("applyVegetationImageOverlay:SKIP-in-flight", {
      uniqueid: cleanId,
      rasterDate: date,
      indiceType,
    });
    return true;
  }
  // Avoid requests for dates the polygon pipeline never produced — before
  // bumping requestId so we don't cancel an early valid overlay.
  if (advertisedDates.length > 0 && !advertisedDates.includes(date)) {
    graffLog("applyVegetationImageOverlay:SKIP-unavailable-date", {
      uniqueid: cleanId,
      rasterDate: date,
      requestedDate: String(ctx.requestedDate || "").slice(0, 10),
      indiceType,
      keptExistingOverlay: hasActiveVegetationOverlay(host),
    });
    releaseIdleSurfaceLoading(host);
    return true;
  }
  if (host._missingVegetationRasterKeys.has(rasterKey)) {
    graffLog("applyVegetationImageOverlay:SKIP-known-missing", {
      uniqueid: cleanId,
      rasterDate: date,
      indiceType,
    });
    releaseIdleSurfaceLoading(host);
    return true;
  }
  return false;
};

// ---- fetch / georeference -------------------------------------------------

/** Compute the extent in the view SR (projected when SRs differ). */
export const resolveOverlayExtent = async (
  result: PolygonExportImageResult,
  viewSr: __esri.SpatialReference | null | undefined,
): Promise<OverlayExtentResult> => {
  const [minX, minY, maxX, maxY] = result.bbox;
  if (!isValidRasterGeoreference(result.bbox, result.width, result.height)) {
    throw new Error("GeoTIFF georeference/bbox invalid");
  }
  const epsgCode = resolveRasterEpsg(result.epsgCode, result.bbox);
  if (epsgCode == null) {
    throw new Error(
      "GeoTIFF CRS (EPSG) topilmadi — indeks rasmini joylashtirib bo‘lmadi.",
    );
  }
  const nativeSr = new SpatialReference({ wkid: Number(epsgCode) });
  let extent = new Extent({
    xmin: minX,
    ymin: minY,
    xmax: maxX,
    ymax: maxY,
    spatialReference: nativeSr,
  });
  // MediaLayer stretches linearly in the view SR. Project first so small
  // field rasters keep a stable aspect instead of being warped through
  // on-the-fly reprojection of native CRS corners.
  if (viewSr?.wkid && Number(viewSr.wkid) !== Number(nativeSr.wkid)) {
    try {
      await projection.load();
      const projected = projection.project(extent, viewSr) as __esri.Extent;
      if (isProjectedExtentUsable(projected)) extent = projected;
    } catch {
      /* keep native extent; ArcGIS may still reproject */
    }
  }
  return { extent, epsgCode, nativeSr };
};

// ---- draw -----------------------------------------------------------------

/** Replace the previous overlay with a new MediaLayer on the map. */
export const addVegetationMediaLayer = (
  host: GraffRasterOverlayHost,
  map: __esri.Map,
  canvas: PolygonExportImageResult["canvas"],
  extent: __esri.Extent,
  title: string,
): void => {
  const imageElement = new ImageElement({
    image: canvas,
    georeference: new ExtentAndRotationGeoreference({ extent }),
  });
  host.removeVegetationImageOverlay();
  const mediaLayer = new MediaLayer({
    id: VEGETATION_IMAGE_LAYER_ID,
    source: [imageElement],
    title,
    opacity: 1,
  });
  map.add(mediaLayer);
  host._vegetationImageLayer = mediaLayer;
  // Attach as soon as the layer is on the map — do not wait for layerView
  // or extra animation frames (first paint latency).
  try {
    void mediaLayer.load();
  } catch {
    /* draw can finish without load() acknowledgement */
  }
};

/** Store the hover sample (or clear it) and attach hover when data exists. */
export const applyHoverSample = (
  host: GraffRasterOverlayHost,
  view: __esri.MapView | __esri.SceneView,
  result: PolygonExportImageResult,
  extent: __esri.Extent,
  fallbackSr: __esri.SpatialReference,
  indiceType: VegetationIndiceType,
  date: string,
): { hasFloatValues: boolean; hasRgba: boolean } => {
  const payload = detectHoverPayload(result);
  const { hasFloatValues, hasRgba } = payload;
  if (!hasFloatValues && !hasRgba) {
    host._vegetationRasterSample = null;
    return payload;
  }
  const hoverRange = host.resolveHoverIndexRange(indiceType, date, result);
  const sample: GraffVegetationRasterSample = {
    values: hasFloatValues ? result.values : null,
    rgba: hasFloatValues ? null : result.rgba,
    indexMin: hoverRange.indexMin,
    indexMax: hoverRange.indexMax,
    width: result.width,
    height: result.height,
    xmin: extent.xmin,
    ymin: extent.ymin,
    xmax: extent.xmax,
    ymax: extent.ymax,
    spatialReference: extent.spatialReference || fallbackSr,
  };
  host._vegetationRasterSample = sample;
  host.attachVegetationRasterHover(view);
  return payload;
};

/** Success bookkeeping after the overlay is drawn. */
export const recordOverlaySuccess = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  rasterKey: string,
  date: string,
): void => {
  const { cleanId, regionId, indiceType } = ctx;
  host._vegetationOverlayAppliedKey = rasterKey;
  if (host._vegetationOverlayPendingKey === rasterKey) {
    host._vegetationOverlayPendingKey = "";
  }
  host._lastSuccessfulOverlayDate = date;
  host._lastSuccessfulOverlayIndex = indiceType;
  host._lastSuccessfulOverlayRegionId = regionId;
  host._lastSuccessfulOverlayYear = host.resolveCurrentYear() ?? null;
  host._latestRasterDateByUniqueid.set(cleanId, date);
  host.markOverlayDateVerified(cleanId, date);
  setVegetationOverlayContext({
    regionId,
    year: host.resolveCurrentYear(),
    lastDate: date,
    lastIndex: indiceType,
  }); announceVegetationOverlayApplied({ uniqueid: cleanId, regionId, date, indexKey: indiceType });
};

// ---- failure --------------------------------------------------------------

/** Remember what the failure taught us; returns flags for the caller. */
const learnFromFailure = (
  err: unknown,
  ctx: OverlayCallContext,
  date: string,
): { outOfSeason: boolean; noImagery: boolean } => {
  const outOfSeason = isExportImageOutOfSeasonError(err);
  const noImagery = isExportImageNoImageryError(err);
  if (outOfSeason) {
    const months = parseExportImageSeasonMonths(err);
    const parsedCrop = parseExportImageCropId(err);
    if (months.length) {
      rememberExportImageSeasonMonths(ctx.cleanId, months, parsedCrop ?? ctx.cropId);
    }
  } else if (noImagery) {
    rememberRegionDateWithoutImagery(ctx.regionId, date);
  }
  return { outOfSeason, noImagery };
};

/** Failure handling for a still-current request. */
export const handleOverlayFailure = (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  rasterKey: string,
  date: string,
  err: unknown,
): void => {
  const { cleanId, regionId, indiceType, advertisedDates } = ctx;
  // 400 = date not servable for this polygon/crop, 404 = no raster at all.
  // Both mean "never ask for this key again"; a valid date comes from the
  // available-dates path (season-filtered).
  const dateRejected = isDateRejectedError(err);
  if (dateRejected) {
    host._missingVegetationRasterKeys.add(rasterKey);
    host.removeVegetationImageOverlay();
  }
  const { outOfSeason, noImagery } = learnFromFailure(err, ctx, date);
  if (outOfSeason || noImagery) {
    void host.retryOverlayWithUsableDate(cleanId, regionId, date, indiceType);
  }
  const httpErr = asThrownObject(err);
  graffLog("applyVegetationImageOverlay:FAILED", {
    uniqueid: ctx.uniqueid,
    rasterDate: date,
    indiceType,
    status: httpErr?.status ?? null,
    statusText: httpErr?.statusText || null,
    contentType: httpErr?.contentType || null,
    responseText: httpErr?.responseText || null,
    responseUrl: httpErr?.url || null,
    guessedDate: advertisedDates.length === 0,
    error: describeThrown(err),
  });
  // A guessed date, an out-of-season date, or a day the region has no
  // scene for is expected to fail — the retry supplies a servable date,
  // so don't flash an error banner for it.
  const wasGuess =
    outOfSeason || noImagery || (dateRejected && advertisedDates.length === 0);
  host.setState({
    polygonImageLoading: false,
    polygonImageError: wasGuess ? null : thrownMessage(err) || "Расм юклана олмади",
  });
};
