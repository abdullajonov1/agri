import SpatialReference from "esri/geometry/SpatialReference";
import Extent from "esri/geometry/Extent";
import * as projection from "esri/geometry/projection";
import ImageElement from "esri/layers/support/ImageElement";
import ExtentAndRotationGeoreference from "esri/layers/support/ExtentAndRotationGeoreference";
import MediaLayer from "esri/layers/MediaLayer";
import type { PolygonExportImageResult } from "./config";

export const VEGETATION_IMAGE_LAYER_ID = "agri-graff-vegetation-image-overlay";

const MAX_DEGREE_ABS = 180;
const WGS84_WKID = 4326;

/**
 * EPSG of the export-image raster. Falls back to 4326 when the GeoTIFF carries
 * no CRS but its coordinates are degree-sized; null when it cannot be known.
 */
export function resolveResultEpsgCode(result: PolygonExportImageResult): number | null {
  if (result.epsgCode != null && Number.isFinite(result.epsgCode)) {
    return result.epsgCode;
  }
  const absMax = Math.max(...result.bbox.map((n) => Math.abs(n)));
  return absMax <= MAX_DEGREE_ABS ? WGS84_WKID : null;
}

/**
 * Placement extent for a snapshot MediaLayer, projected into the view SR so
 * small field rasters keep a stable aspect. Projection failure keeps the
 * native extent (ArcGIS may still reproject).
 */
export async function resolveOverlayExtent(
  result: PolygonExportImageResult,
  viewSr: __esri.SpatialReference | null,
): Promise<__esri.Extent> {
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
  const epsgCode = resolveResultEpsgCode(result);
  if (epsgCode == null) {
    throw new Error(
      "GeoTIFF CRS (EPSG) topilmadi — indeks rasmini joylashtirib bo‘lmadi.",
    );
  }

  const nativeSr = new SpatialReference({ wkid: Number(epsgCode) });
  const nativeExtent = new Extent({
    xmin: minX,
    ymin: minY,
    xmax: maxX,
    ymax: maxY,
    spatialReference: nativeSr,
  });

  if (!viewSr?.wkid || Number(viewSr.wkid) === Number(nativeSr.wkid)) {
    return nativeExtent;
  }
  try {
    await projection.load();
    const projected = projection.project(nativeExtent, viewSr) as __esri.Extent;
    if (
      projected &&
      Number.isFinite(projected.xmin) &&
      Number.isFinite(projected.ymin) &&
      projected.xmax > projected.xmin &&
      projected.ymax > projected.ymin
    ) {
      return projected;
    }
  } catch {
    /* keep native extent; ArcGIS may still reproject */
  }
  return nativeExtent;
}

export function createVegetationMediaLayer(opts: {
  canvas: HTMLCanvasElement;
  extent: __esri.Extent;
  id: string;
  title: string;
}): __esri.MediaLayer {
  const imageElement = new ImageElement({
    image: opts.canvas,
    georeference: new ExtentAndRotationGeoreference({ extent: opts.extent }),
  });
  return new MediaLayer({
    id: opts.id,
    source: [imageElement],
    title: opts.title,
    opacity: 1,
  });
}
