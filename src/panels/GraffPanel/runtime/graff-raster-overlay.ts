import { type React } from "jimu-core";
import {
  fetchPolygonExportImageTiff,
  type PolygonExportImageResult,
  type VegetationIndiceType,
} from "../../../gis/agri-polygon-api-source";
import { stripUniqueidBraces } from "../../../data/agri-uniqueid-sql";
import { buildGraffPolygonRasterCacheKey } from "../../../data/agri-graff-stats";
import { graffLog } from "./graff-log";
import {
  addVegetationMediaLayer,
  applyHoverSample,
  handleOverlayFailure,
  recordOverlaySuccess,
  resolveInitialDate,
  resolveOverlayExtent,
  rewriteUnservableDate,
  shouldSkipOverlay,
  waitForWalkDate,
  VEGETATION_IMAGE_LAYER_ID,
  hasActiveVegetationOverlay,
  releaseIdleSurfaceLoading,
  isDateStepContinue,
  type OverlayCallContext,
  type OverlayCallOptions,
} from "./graff-raster-overlay-steps";
import type { AgriGraffWidgetState } from "./widget";
import type { GraffWidgetProps } from "./graff-state";

export {
  VEGETATION_IMAGE_LAYER_ID,
  hasActiveVegetationOverlay,
  releaseIdleSurfaceLoading,
  isDateStepContinue,
};

export type GraffPendingOverlayWalk = {
  uniqueid: string;
  promise: Promise<{
    date: string;
    result?: PolygonExportImageResult;
  } | null>;
};

export type GraffVegetationRasterSample = {
  values: Float32Array | null;
  rgba: Uint8ClampedArray | null;
  /** export-image X-Index-Min — remap RGBA 0..1 stretch when values missing. */
  indexMin: number | null;
  /** export-image X-Index-Max. */
  indexMax: number | null;
  width: number;
  height: number;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: __esri.SpatialReference;
};

export interface GraffRasterOverlayHost {
  state: AgriGraffWidgetState;
  setState: React.Component<GraffWidgetProps, AgriGraffWidgetState>["setState"];
  _isMounted: boolean;
  _polygonAvailableDatesUniqueid: string;
  _latestRasterDateByUniqueid: Map<string, string>;
  _verifiedOverlayDates: Set<string>;
  _vegetationImageRequestId: number;
  _vegetationOverlayAppliedKey: string;
  _vegetationImageLayer: __esri.MediaLayer | null;
  _vegetationOverlayPendingKey: string;
  _missingVegetationRasterKeys: Set<string>;
  _vegetationRasterSample: GraffVegetationRasterSample | null;
  _lastSuccessfulOverlayDate: string | null;
  _lastSuccessfulOverlayIndex: VegetationIndiceType;
  _lastSuccessfulOverlayRegionId: number | null;
  _lastSuccessfulOverlayYear: number | null;
  resolveCurrentRegionId: () => number | undefined;
  resolveCurrentYear: () => number | undefined;
  resolveCropIdForUniqueid: (uniqueid: string | null | undefined) => number | null;
  resolveAgainstAvailableDates: (rawDate: unknown, availableDates: string[]) => string | null;
  cancelVegetationImageOverlay: () => void;
  retryOverlayWithUsableDate: (
    cleanId: string,
    regionId: number,
    refusedDate: string,
    indiceType: VegetationIndiceType,
  ) => Promise<void>;
  awaitPendingOverlayWalk: (
    cleanId: string,
    timeoutMs?: number,
  ) => Promise<string | null | undefined>;
  clearVegetationImageSurfaceLoading: (requestId: number) => void;
  beginVegetationImageSurfaceLoading: () => void;
  removeVegetationImageOverlay: () => void;
  resolveHoverIndexRange: (
    indiceType: string,
    rasterDate: string,
    fromExport?: { indexMin: number | null; indexMax: number | null } | null,
  ) => { indexMin: number | null; indexMax: number | null };
  attachVegetationRasterHover: (view: __esri.MapView | __esri.SceneView) => void;
  markOverlayDateVerified: (cleanId: string, date: string) => void;
}

/** Host fields needed to decide who owns the map-surface loader. */
export type GraffSurfaceLoadingOwner = Pick<
  GraffRasterOverlayHost,
  | "_vegetationImageRequestId"
  | "_vegetationOverlayPendingKey"
  | "_vegetationOverlayAppliedKey"
  | "clearVegetationImageSurfaceLoading"
>;

/** Fetch, georeference and draw the overlay for an already-resolved key. */
const fetchAndDrawOverlay = async (
  host: GraffRasterOverlayHost,
  view: __esri.MapView | __esri.SceneView,
  ctx: OverlayCallContext,
  requestId: number,
  date: string,
  rasterKey: string,
  stillCurrent: () => boolean,
  prefetched?: PolygonExportImageResult | null,
): Promise<void> => {
  const { cleanId, regionId, indiceType } = ctx;
  // Map-center spinner until MediaLayer is placed (or request fails/cancels).
  host.beginVegetationImageSurfaceLoading();

  graffLog("chartPoint:raster-api-request", {
    requestId,
    uniqueid: cleanId,
    regionId,
    rasterDate: date,
    indiceType,
    prefetched: Boolean(prefetched),
  });
  const result =
    prefetched ||
    (await fetchPolygonExportImageTiff({
      uniqueid: cleanId,
      regionId,
      rasterDate: date,
      indiceType,
      stretch: "fixed",
    }));

  graffLog("chartPoint:raster-api-response", {
    requestId,
    uniqueid: cleanId,
    rasterDate: date,
    indiceType,
    width: result.width,
    height: result.height,
    bbox: result.bbox,
    epsgCode: result.epsgCode,
    stillCurrent: stillCurrent(),
  });

  if (!stillCurrent()) {
    graffLog("applyVegetationImageOverlay:SKIP-stale-selection", {
      uniqueid: cleanId,
      rasterDate: ctx.requestedDate,
      currentSelecteduniqueid: host.state.selecteduniqueid,
    });
    return;
  }

  const viewSr = view.spatialReference;
  const { extent, epsgCode, nativeSr } = await resolveOverlayExtent(result, viewSr);
  addVegetationMediaLayer(
    host,
    view.map,
    result.canvas,
    extent,
    `Vegetation ${indiceType.toUpperCase()} ${date}`,
  );

  if (!stillCurrent()) {
    host.removeVegetationImageOverlay();
    return;
  }

  const { hasFloatValues, hasRgba } = applyHoverSample(
    host,
    view,
    result,
    extent,
    viewSr || nativeSr,
    indiceType,
    date,
  );

  host.setState({ polygonImageLoading: false, polygonImageError: null });

  graffLog("applyVegetationImageOverlay:added", {
    uniqueid: cleanId,
    rasterDate: date,
    indiceType,
    width: result.width,
    height: result.height,
    bbox: result.bbox,
    epsgCode,
    overlayWkId: extent.spatialReference?.wkid ?? null,
    hasHoverValues: hasFloatValues,
    hasRgbaHover: hasRgba && !hasFloatValues,
  });
  recordOverlaySuccess(host, ctx, rasterKey, date);
};

/** Resolve the final date; null when the call must end without fetching. */
const resolveOverlayDate = async (
  host: GraffRasterOverlayHost,
  ctx: OverlayCallContext,
  hasPrefetched: boolean,
): Promise<string | null> => {
  const initialDate = resolveInitialDate(host, ctx);
  // Only a user pick of a listed day may skip the walk; automatic paths must
  // reuse the walk's result instead of racing their own export-image.
  const skipWalkWait = ctx.interactive && ctx.advertisedDates.includes(initialDate);
  const rewritten = rewriteUnservableDate(host, ctx, initialDate);
  if (!isDateStepContinue(rewritten)) return null;
  const walked = await waitForWalkDate(
    host,
    ctx,
    rewritten.date,
    hasPrefetched,
    skipWalkWait,
  );
  return isDateStepContinue(walked) ? walked.date : null;
};

export const applyGraffVegetationImageOverlay = async (
  host: GraffRasterOverlayHost,
  uniqueid: string,
  rasterDate: string,
  indiceType: VegetationIndiceType = "ndvi",
  prefetched?: PolygonExportImageResult | null,
  options: OverlayCallOptions = {},
): Promise<void> => {
  const { activeMapView } = host.state;
  if (!activeMapView?.view?.map) return;

  const regionId = host.resolveCurrentRegionId();
  if (regionId === undefined) {
    graffLog("applyVegetationImageOverlay:SKIP-no-region", {
      uniqueid,
      rasterDate,
    });
    host.cancelVegetationImageOverlay();
    host.setState({
      polygonImageError:
        "Viloyat kodi topilmadi — indeks rasmini yuklab bo‘lmadi.",
    });
    return;
  }

  const cleanId = stripUniqueidBraces(uniqueid);
  const ctx: OverlayCallContext = {
    uniqueid,
    cleanId,
    regionId,
    cropId: host.resolveCropIdForUniqueid(cleanId),
    advertisedDates:
      host._polygonAvailableDatesUniqueid === cleanId
        ? host.state.polygonAvailableDates || []
        : [],
    indiceType,
    requestedDate: rasterDate,
    interactive: options.interactive === true,
  };

  const normalizedDate = await resolveOverlayDate(host, ctx, Boolean(prefetched));
  if (normalizedDate === null) return;

  const rasterKey = buildGraffPolygonRasterCacheKey({
    uniqueid: cleanId,
    regionId,
    rasterDate: normalizedDate,
    indiceType,
  });
  if (shouldSkipOverlay(host, ctx, rasterKey, normalizedDate)) return;

  // Bumping requestId orphans any previous in-flight finally cleanup — every
  // exit path below MUST clear the map surface loader while still current.
  const requestId = ++host._vegetationImageRequestId;
  host._vegetationOverlayPendingKey = rasterKey;

  graffLog("chartPoint:raster-overlay-start", {
    requestId,
    uniqueid: cleanId,
    regionId,
    requestedDate: rasterDate,
    normalizedDate,
    indiceType,
    advertisedDateCount: ctx.advertisedDates.length,
    currentSelecteduniqueid: host.state.selecteduniqueid,
  });

  // The requestId counter alone only catches a NEWER call superseding an
  // older one — it says nothing about whether the polygon this fetch was FOR
  // is still selected. Checking selecteduniqueid directly closes that gap.
  const stillCurrent = (): boolean => {
    if (!host._isMounted || requestId !== host._vegetationImageRequestId) return false;
    return stripUniqueidBraces(host.state.selecteduniqueid) === cleanId;
  };

  try {
    await fetchAndDrawOverlay(
      host,
      activeMapView.view,
      ctx,
      requestId,
      normalizedDate,
      rasterKey,
      stillCurrent,
      prefetched,
    );
  } catch (err: unknown) {
    if (!stillCurrent()) return;
    handleOverlayFailure(host, ctx, rasterKey, normalizedDate, err);
  } finally {
    // A failed/stale fetch used to leave its pending key behind, which made
    // later skip paths think a fetch was still running and keep the loader.
    if (
      requestId === host._vegetationImageRequestId &&
      host._vegetationOverlayPendingKey === rasterKey
    ) {
      host._vegetationOverlayPendingKey = "";
    }
    // Clears orphaned loaders from early skips that bumped requestId, and
    // always releases the surface loader for the active request.
    host.clearVegetationImageSurfaceLoading(requestId);
  }
};
