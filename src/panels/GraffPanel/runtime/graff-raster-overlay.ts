import { React } from "jimu-core";
import SpatialReference from "esri/geometry/SpatialReference";
import Extent from "esri/geometry/Extent";
import * as projection from "esri/geometry/projection";
import ImageElement from "esri/layers/support/ImageElement";
import ExtentAndRotationGeoreference from "esri/layers/support/ExtentAndRotationGeoreference";
import MediaLayer from "esri/layers/MediaLayer";
import {
  fetchPolygonExportImageTiff,
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
import { buildGraffPolygonRasterCacheKey } from "../../../data/agri-graff-stats";
import { setVegetationOverlayContext } from "../../../gis/agri-vegetation-overlay-prefetch";
import { graffLog } from "./graff-log";
import { asThrownObject, describeThrown, thrownMessage, thrownStatus } from "./graff-guards";
import type { AgriGraffWidgetState } from "./widget";
import type { GraffWidgetProps } from "./graff-state";

export const VEGETATION_IMAGE_LAYER_ID = "agri-graff-vegetation-image-overlay";

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

export const applyGraffVegetationImageOverlay = async (
  host: GraffRasterOverlayHost,
  uniqueid: string,
  rasterDate: string,
  indiceType: VegetationIndiceType = "ndvi",
  prefetched?: PolygonExportImageResult | null,
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
  const cropId = host.resolveCropIdForUniqueid(cleanId);
  const advertisedDates =
    host._polygonAvailableDatesUniqueid === cleanId
      ? host.state.polygonAvailableDates || []
      : [];
  let normalizedDate =
    host.resolveAgainstAvailableDates(rasterDate, advertisedDates) ||
    String(rasterDate || "").slice(0, 10);

  // Rewrite out-of-season / known-missing dates BEFORE the HTTP call so the
  // network tab does not show a cascade of 400s for every table row.
  const seasonMonths = getExportImageSeasonMonths(cleanId, cropId);
  const dateMonth = Number(String(normalizedDate).slice(5, 7));
  const needsRewrite =
    (seasonMonths.length > 0 && !seasonMonths.includes(dateMonth)) ||
    isRegionDateWithoutImagery(regionId, normalizedDate);
  if (needsRewrite) {
    const rewritten = pickExportRasterDate(
      advertisedDates.length
        ? advertisedDates
        : host._latestRasterDateByUniqueid.has(cleanId)
          ? [host._latestRasterDateByUniqueid.get(cleanId)!]
          : [],
      {
        uniqueid: cleanId,
        cropId,
        regionId,
        exclude: [normalizedDate],
      },
    );
    if (rewritten && rewritten !== normalizedDate) {
      graffLog(
        "applyVegetationImageOverlay:rewrite-unservable-date",
        {
          uniqueid: cleanId,
          from: normalizedDate,
          to: rewritten,
          cropId,
          seasonMonths,
        },
      );
      normalizedDate = rewritten;
    } else if (seasonMonths.length > 0 && !seasonMonths.includes(dateMonth)) {
      // Season known but no alternative yet — fetch dates then retry, skip
      // the doomed September request entirely.
      graffLog(
        "applyVegetationImageOverlay:SKIP-out-of-season",
        {
          uniqueid: cleanId,
          rasterDate: normalizedDate,
          cropId,
          seasonMonths,
        },
      );
      void host.retryOverlayWithUsableDate(
        cleanId,
        regionId,
        normalizedDate,
        indiceType,
      );
      return;
    }
  }

  // An unverified date while the dates→TIFF walk is still probing this
  // polygon: wait for the walk instead of racing a parallel export-image
  // that the series date (04-30 in the index table, no regional scene)
  // would turn into a 400. Skip when caller already handed us the walk TIFF.
  if (
    !prefetched &&
    !host._verifiedOverlayDates.has(`${cleanId}|${normalizedDate}`) &&
    !isRegionDateWithImagery(regionId, normalizedDate)
  ) {
    const walkDate = await host.awaitPendingOverlayWalk(cleanId);
    if (!host._isMounted) return;
    if (stripUniqueidBraces(host.state.selecteduniqueid) !== cleanId) return;
    if (walkDate) {
      if (walkDate !== normalizedDate) {
        graffLog(
          "applyVegetationImageOverlay:use-walk-date",
          {
            uniqueid: cleanId,
            from: normalizedDate,
            to: walkDate,
            indiceType,
          },
        );
        normalizedDate = walkDate;
      }
    } else if (
      walkDate === null &&
      isRegionDateWithoutImagery(regionId, normalizedDate)
    ) {
      // Walk finished without a hit and proved this date missing too.
      graffLog(
        "applyVegetationImageOverlay:SKIP-walk-no-imagery",
        { uniqueid: cleanId, rasterDate: normalizedDate, indiceType },
      );
      host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
      return;
    }
  }

  const rasterKey = buildGraffPolygonRasterCacheKey({
    uniqueid: cleanId,
    regionId,
    rasterDate: normalizedDate,
    indiceType,
  });

  // Early available-dates path and series path often request the same key —
  // do not cancel an in-flight/already-drawn overlay for a redundant call.
  if (
    host._vegetationOverlayAppliedKey === rasterKey &&
    host._vegetationImageLayer
  ) {
    graffLog("applyVegetationImageOverlay:SKIP-already-applied", {
      uniqueid: cleanId,
      rasterDate: normalizedDate,
      indiceType,
    });
    host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
    host.setState({ polygonImageLoading: false, polygonImageError: null });
    return;
  }
  if (
    host.state.polygonImageLoading &&
    host._vegetationOverlayPendingKey === rasterKey
  ) {
    graffLog("applyVegetationImageOverlay:SKIP-in-flight", {
      uniqueid: cleanId,
      rasterDate: normalizedDate,
      indiceType,
    });
    return;
  }

  // Avoid requests for dates the polygon pipeline never produced — before
  // bumping requestId so we don't cancel an early valid overlay.
  if (
    advertisedDates.length > 0 &&
    !advertisedDates.includes(normalizedDate)
  ) {
    graffLog(
      "applyVegetationImageOverlay:SKIP-unavailable-date",
      {
        uniqueid: cleanId,
        rasterDate: normalizedDate,
        requestedDate: String(rasterDate || "").slice(0, 10),
        indiceType,
        keptExistingOverlay: Boolean(
          host._vegetationOverlayAppliedKey ||
            host._vegetationOverlayPendingKey,
        ),
      },
    );
    if (
      !host._vegetationOverlayAppliedKey &&
      !host._vegetationOverlayPendingKey
    ) {
      host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
    }
    return;
  }

  if (host._missingVegetationRasterKeys.has(rasterKey)) {
    graffLog(
      "applyVegetationImageOverlay:SKIP-known-missing",
      {
        uniqueid: cleanId,
        rasterDate: normalizedDate,
        indiceType,
      },
    );
    if (
      !host._vegetationOverlayAppliedKey &&
      !host._vegetationOverlayPendingKey
    ) {
      host.clearVegetationImageSurfaceLoading(host._vegetationImageRequestId);
    }
    return;
  }

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
    advertisedDateCount: advertisedDates.length,
    currentSelecteduniqueid: host.state.selecteduniqueid,
  });

  // The requestId counter alone only catches a NEWER applyVegetationImageOverlay
  // call superseding an older one — it says nothing about whether the
  // polygon this fetch was FOR is still even selected. Checking
  // selecteduniqueid directly closes that gap.
  const stillCurrent = (): boolean => {
    if (!host._isMounted || requestId !== host._vegetationImageRequestId)
      return false;
    const currentClean = stripUniqueidBraces(host.state.selecteduniqueid);
    return currentClean === cleanId;
  };

  try {
    // Map-center spinner until MediaLayer is placed (or request fails/cancels).
    host.beginVegetationImageSurfaceLoading();

    graffLog("chartPoint:raster-api-request", {
      requestId,
      uniqueid: cleanId,
      regionId,
      rasterDate: normalizedDate,
      indiceType,
      prefetched: Boolean(prefetched),
    });
    const result =
      prefetched ||
      (await fetchPolygonExportImageTiff({
        uniqueid: cleanId,
        regionId,
        rasterDate: normalizedDate,
        indiceType,
        stretch: "fixed",
      }));

    graffLog("chartPoint:raster-api-response", {
      requestId,
      uniqueid: cleanId,
      rasterDate: normalizedDate,
      indiceType,
      width: result.width,
      height: result.height,
      bbox: result.bbox,
      epsgCode: result.epsgCode,
      stillCurrent: stillCurrent(),
    });

    if (!stillCurrent()) {
      graffLog(
        "applyVegetationImageOverlay:SKIP-stale-selection",
        {
          uniqueid: cleanId,
          rasterDate,
          currentSelecteduniqueid: host.state.selecteduniqueid,
        },
      );
      return;
    }

    const [minX, minY, maxX, maxY] = result.bbox;
    if (
      ![minX, minY, maxX, maxY].every((n) => Number.isFinite(n)) ||
      !(maxX > minX) ||
      !(maxY > minY) ||
      !(result.width > 0) ||
      !(result.height > 0)
    ) {
      throw new Error("GeoTIFF georeference/bbox invalid");
    }

    // Never treat projected-metre coords as the view SR (Web Mercator) —
    // that misplaces/stretches the MediaLayer until it looks broken.
    const absMax = Math.max(
      Math.abs(minX),
      Math.abs(minY),
      Math.abs(maxX),
      Math.abs(maxY),
    );
    let epsgCode = result.epsgCode;
    if (
      (epsgCode == null || !Number.isFinite(epsgCode)) &&
      absMax <= 180
    ) {
      epsgCode = 4326;
    }
    if (epsgCode == null || !Number.isFinite(epsgCode)) {
      throw new Error(
        "GeoTIFF CRS (EPSG) topilmadi — indeks rasmini joylashtirib bo‘lmadi.",
      );
    }

    const nativeSr = new SpatialReference({ wkid: Number(epsgCode) });
    let overlayExtent = new Extent({
      xmin: minX,
      ymin: minY,
      xmax: maxX,
      ymax: maxY,
      spatialReference: nativeSr,
    });

    // MediaLayer stretches linearly in the view SR. Project first so small
    // field rasters keep a stable aspect instead of being warped through
    // on-the-fly reprojection of native CRS corners.
    const viewSr = activeMapView.view.spatialReference;
    if (
      viewSr?.wkid &&
      Number(viewSr.wkid) !== Number(nativeSr.wkid)
    ) {
      try {
        await projection.load();
        const projected = projection.project(
          overlayExtent,
          viewSr,
        ) as __esri.Extent;
        if (
          projected &&
          Number.isFinite(projected.xmin) &&
          Number.isFinite(projected.ymin) &&
          projected.xmax > projected.xmin &&
          projected.ymax > projected.ymin
        ) {
          overlayExtent = projected;
        }
      } catch {
        /* keep native extent; ArcGIS may still reproject */
      }
    }

    const imageElement = new ImageElement({
      image: result.canvas,
      georeference: new ExtentAndRotationGeoreference({
        extent: overlayExtent,
      }),
    });

    host.removeVegetationImageOverlay();

    const mediaLayer = new MediaLayer({
      id: VEGETATION_IMAGE_LAYER_ID,
      source: [imageElement],
      title: `Vegetation ${indiceType.toUpperCase()} ${normalizedDate}`,
      opacity: 0.85,
    });
    activeMapView.view.map.add(mediaLayer);
    host._vegetationImageLayer = mediaLayer;

    // Attach as soon as the layer is on the map — do not wait for layerView
    // or extra animation frames (first paint latency).
    try {
      void mediaLayer.load();
    } catch {
      /* draw can finish without load() acknowledgement */
    }

    if (!stillCurrent()) {
      host.removeVegetationImageOverlay();
      return;
    }

    const hasFloatValues =
      !!result.values &&
      result.values.length === result.width * result.height;
    const hasRgba =
      !!result.rgba &&
      result.rgba.length === result.width * result.height * 4;

    if (hasFloatValues || hasRgba) {
      const hoverRange = host.resolveHoverIndexRange(
        indiceType,
        normalizedDate,
        result,
      );
      host._vegetationRasterSample = {
        values: hasFloatValues ? result.values : null,
        rgba: hasFloatValues ? null : result.rgba,
        indexMin: hoverRange.indexMin,
        indexMax: hoverRange.indexMax,
        width: result.width,
        height: result.height,
        xmin: overlayExtent.xmin,
        ymin: overlayExtent.ymin,
        xmax: overlayExtent.xmax,
        ymax: overlayExtent.ymax,
        spatialReference: overlayExtent.spatialReference || viewSr || nativeSr,
      };
      host.attachVegetationRasterHover(activeMapView.view);
    } else {
      host._vegetationRasterSample = null;
    }

    host.setState({ polygonImageLoading: false, polygonImageError: null });

    graffLog("applyVegetationImageOverlay:added", {
      uniqueid: cleanId,
      rasterDate: normalizedDate,
      indiceType,
      width: result.width,
      height: result.height,
      bbox: result.bbox,
      epsgCode,
      overlayWkId: overlayExtent.spatialReference?.wkid ?? null,
      hasHoverValues: hasFloatValues,
      hasRgbaHover: hasRgba && !hasFloatValues,
    });
    host._vegetationOverlayAppliedKey = rasterKey;
    if (host._vegetationOverlayPendingKey === rasterKey) {
      host._vegetationOverlayPendingKey = "";
    }
    host._lastSuccessfulOverlayDate = normalizedDate;
    host._lastSuccessfulOverlayIndex = indiceType;
    host._lastSuccessfulOverlayRegionId = regionId;
    host._lastSuccessfulOverlayYear = host.resolveCurrentYear() ?? null;
    host._latestRasterDateByUniqueid.set(cleanId, normalizedDate);
    host.markOverlayDateVerified(cleanId, normalizedDate);
    setVegetationOverlayContext({
      regionId,
      year: host.resolveCurrentYear(),
      lastDate: normalizedDate,
      lastIndex: indiceType,
    });
  } catch (err: unknown) {
    if (!stillCurrent()) return;
    const status = Number(thrownStatus(err));
    // 400 = date not servable for this polygon/crop, 404 = no raster at all.
    // Both mean "never ask for this key again"; a valid date comes from the
    // available-dates path (season-filtered) below.
    const dateRejected =
      status === 400 ||
      status === 404 ||
      /HTTP\s+40[04]/i.test(describeThrown(err));
    if (dateRejected) {
      host._missingVegetationRasterKeys.add(rasterKey);
      host.removeVegetationImageOverlay();
    }
    const outOfSeason = isExportImageOutOfSeasonError(err);
    const noImagery = isExportImageNoImageryError(err);
    if (outOfSeason) {
      const months = parseExportImageSeasonMonths(err);
      const parsedCrop = parseExportImageCropId(err);
      if (months.length) {
        rememberExportImageSeasonMonths(
          cleanId,
          months,
          parsedCrop ?? cropId,
        );
      }
    } else if (noImagery) {
      rememberRegionDateWithoutImagery(regionId, normalizedDate);
    }
    if (outOfSeason || noImagery) {
      void host.retryOverlayWithUsableDate(
        cleanId,
        regionId,
        normalizedDate,
        indiceType,
      );
    }
    const httpErr = asThrownObject(err);
    graffLog("applyVegetationImageOverlay:FAILED", {
      uniqueid,
      rasterDate: normalizedDate,
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
      outOfSeason ||
      noImagery ||
      (dateRejected && advertisedDates.length === 0);
    host.setState({
      polygonImageLoading: false,
      polygonImageError: wasGuess
        ? null
        : thrownMessage(err) || "Расм юклана олмади",
    });
  } finally {
    // Clears orphaned loaders from early skips that bumped requestId, and
    // always releases the surface loader for the active request.
    host.clearVegetationImageSurfaceLoading(requestId);
  }
};
