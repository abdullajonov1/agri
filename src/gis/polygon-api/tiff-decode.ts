/**
 * GeoTIFF → canvas decode for export-image (geotiff.js, main thread).
 */
import { addDecoder, fromArrayBuffer } from "geotiff";
import {
  DeflateDecoder,
  JpegDecoder,
  LercDecoder,
  LzwDecoder,
  PackbitsDecoder,
  RawDecoder,
  WebImageDecoder,
  ZstdDecoder,
  lercZstd,
  zstdInit,
} from "../../vendor/geotiff-decoders";
import {
  agriPolygonApiLog,
  EXPORT_IMAGE_MAX_PIXELS,
  type ExportImageRequestParams,
  type IndexHeaderStats,
  type PolygonExportImageResult,
} from "./config";
import {
  colorizeIndexValue,
  mapStretch01ToIndexRange,
  sampleIndexFromRgba,
} from "./index-color";

type GeoTiffDecoderClass = Parameters<typeof addDecoder>[1] extends () => Promise<infer T>
  ? T
  : never;

/** lerc / zstd export a wasm module whose init() must run before decoding. */
interface WasmModule {
  init?: () => Promise<unknown>;
}

const initWasm = async (mod: unknown): Promise<void> => {
  const wasm = mod as WasmModule | null | undefined;
  if (typeof wasm?.init === "function") await wasm.init();
};

const decoder = (cls: unknown): GeoTiffDecoderClass => cls as GeoTiffDecoderClass;

// PreferWorker=false — Portal custom widgets cannot load geotiff's async
// widgets/chunks/* (publicPath → jimuConfig.baseUrl → 404 on Enterprise).
addDecoder([undefined, 1], async () => decoder(RawDecoder), undefined, false);
addDecoder(5, async () => decoder(LzwDecoder), undefined, false);
addDecoder(7, async () => decoder(JpegDecoder), undefined, false);
addDecoder([8, 32946], async () => decoder(DeflateDecoder), undefined, false);
addDecoder(32773, async () => decoder(PackbitsDecoder), undefined, false);
addDecoder(
  34887,
  async () => {
    await initWasm(lercZstd);
    return decoder(LercDecoder);
  },
  undefined,
  false,
);
addDecoder(
  50000,
  async () => {
    await initWasm(zstdInit);
    return decoder(ZstdDecoder);
  },
  undefined,
  false,
);
addDecoder(50001, async () => decoder(WebImageDecoder), undefined, false);

/**
 * Decode export-image GeoTIFF bytes into a colored canvas plus calibrated
 * per-pixel hover values. Rejects rasters above EXPORT_IMAGE_MAX_PIXELS
 * before any pixel buffer is allocated.
 */
export async function decodeExportImageTiff(
  buffer: ArrayBuffer,
  indexHeaders: IndexHeaderStats,
  params: ExportImageRequestParams,
): Promise<PolygonExportImageResult> {
  const tiff = await fromArrayBuffer(buffer);
  const image = await tiff.getImage();
  const bbox = image.getBoundingBox() as [number, number, number, number];
  const width = image.getWidth();
  const height = image.getHeight();
  const samplesPerPixel = image.getSamplesPerPixel();
  const pixelCount = width * height;
  if (
    !Array.isArray(bbox) ||
    bbox.length < 4 ||
    ![bbox[0], bbox[1], bbox[2], bbox[3]].every((n) => Number.isFinite(n)) ||
    !(bbox[2] > bbox[0]) ||
    !(bbox[3] > bbox[1]) ||
    !(width > 0) ||
    !(height > 0)
  ) {
    throw new Error("GeoTIFF bounding box/size invalid");
  }
  if (pixelCount > EXPORT_IMAGE_MAX_PIXELS) {
    throw new Error(
      `GeoTIFF too large (${width}×${height} > ${EXPORT_IMAGE_MAX_PIXELS} pixels)`,
    );
  }

  let epsgCode: number | null = null;
  try {
    const geoKeys = image.getGeoKeys() as Record<string, unknown> | null;
    epsgCode =
      Number(geoKeys?.ProjectedCSTypeGeoKey) ||
      Number(geoKeys?.GeographicTypeGeoKey) ||
      null;
    if (!Number.isFinite(epsgCode as number)) epsgCode = null;
  } catch (err: unknown) {
    // Missing / malformed geo keys: fall through to the bbox heuristic below.
    agriPolygonApiLog("export-image:geokeys-failed", { error: String(err) });
    epsgCode = null;
  }
  // Geographic coords without geo-keys: safe default. Projected metres without
  // an EPSG must not be tagged as the map view SR (causes stretch/misplace).
  if (epsgCode == null) {
    const absMax = Math.max(
      Math.abs(bbox[0]),
      Math.abs(bbox[1]),
      Math.abs(bbox[2]),
      Math.abs(bbox[3]),
    );
    if (absMax <= 180) epsgCode = 4326;
  }

  let noData: number | null = null;
  try {
    const gd = Number(image.getGDALNoData());
    noData = Number.isFinite(gd) ? gd : null;
  } catch (err: unknown) {
    // No GDAL_NODATA tag — treat every finite pixel as data.
    agriPolygonApiLog("export-image:nodata-failed", { error: String(err) });
    noData = null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  const imageData = ctx.createImageData(width, height);
  const out = imageData.data;
  const clamp255 = (v: unknown): number => {
    const n = Math.round(Number(v) || 0);
    return n < 0 ? 0 : n > 255 ? 255 : n;
  };

  let hoverValues: Float32Array | null = null;
  let dataMin = Infinity;
  let dataMax = -Infinity;

  if (samplesPerPixel >= 3) {
    // Pre-colored RGB/RGBA: one interleaved read only (was double-read before).
    const raster = (await image.readRasters({ interleave: true })) as
      | Uint8Array
      | Uint8ClampedArray
      | Float32Array
      | number[];
    const stride = samplesPerPixel;
    if (samplesPerPixel >= 4) {
      for (let p = 0; p < pixelCount; p++) {
        const o = p * stride;
        out[p * 4] = clamp255(raster[o]);
        out[p * 4 + 1] = clamp255(raster[o + 1]);
        out[p * 4 + 2] = clamp255(raster[o + 2]);
        out[p * 4 + 3] = clamp255(raster[o + 3]);
      }
    } else {
      for (let p = 0; p < pixelCount; p++) {
        const o = p * 3;
        out[p * 4] = clamp255(raster[o]);
        out[p * 4 + 1] = clamp255(raster[o + 1]);
        out[p * 4 + 2] = clamp255(raster[o + 2]);
        out[p * 4 + 3] = 255;
      }
    }
  } else {
    const bands = (await image.readRasters({ interleave: false })) as unknown as ArrayLike<number>[];
    const band0 = bands?.[0];
    const values = new Float32Array(pixelCount);
    for (let p = 0; p < pixelCount; p++) {
      const raw = Number(band0?.[p]);
      const v = Number.isFinite(raw) ? raw : NaN;
      values[p] = v;
      if (Number.isFinite(v) && (noData == null || v !== noData)) {
        if (v < dataMin) dataMin = v;
        if (v > dataMax) dataMax = v;
      }
    }

    const looksLikeIndex =
      Number.isFinite(dataMin) &&
      Number.isFinite(dataMax) &&
      dataMin >= -1.5 &&
      dataMax <= 1.5;
    const looksLikeByte =
      Number.isFinite(dataMin) &&
      Number.isFinite(dataMax) &&
      dataMax > 2 &&
      dataMax <= 255;

    if (looksLikeIndex) {
      hoverValues = values;
    } else if (looksLikeByte) {
      hoverValues = new Float32Array(pixelCount);
      for (let p = 0; p < pixelCount; p++) {
        const v = values[p];
        hoverValues[p] =
          !Number.isFinite(v) || v <= 0 || (noData != null && v === noData)
            ? NaN
            : v / 255;
      }
    }

    if (looksLikeIndex || (looksLikeByte && hoverValues)) {
      const src = hoverValues || values;
      for (let p = 0; p < pixelCount; p++) {
        colorizeIndexValue(src[p], out, p * 4);
      }
    } else {
      for (let p = 0; p < pixelCount; p++) {
        const v = clamp255(values[p]);
        out[p * 4] = v;
        out[p * 4 + 1] = v;
        out[p * 4 + 2] = v;
        out[p * 4 + 3] = v > 0 ? 255 : 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const { indexMin, indexMax, indexMean } = indexHeaders;
  const hasHeaderRange =
    indexMin != null &&
    indexMax != null &&
    Number.isFinite(indexMin) &&
    Number.isFinite(indexMax) &&
    indexMax > indexMin;

  // Calibrate hover to header min/max. Server stretch=fixed paints a 0..1
  // colormap; sampleIndexFromRgba / float 0..1 must be remapped to the real
  // field range (e.g. 0.15–0.57) so tooltip matches Index chart stats.
  let calibratedValues: Float32Array | null = null;
  if (hasHeaderRange && hoverValues) {
    // Float band already in header range → keep as-is. Remap only when the
    // band looks like a 0..1 stretch (max well above X-Index-Max).
    const looksLike01Stretch =
      Number.isFinite(dataMax) && dataMax > (indexMax as number) + 0.08;
    if (looksLike01Stretch) {
      calibratedValues = new Float32Array(pixelCount);
      for (let p = 0; p < pixelCount; p++) {
        const v = hoverValues[p];
        if (!Number.isFinite(v) || (noData != null && v === noData)) {
          calibratedValues[p] = NaN;
          continue;
        }
        calibratedValues[p] = mapStretch01ToIndexRange(v, indexMin, indexMax);
      }
    }
  } else if (hasHeaderRange && samplesPerPixel >= 3) {
    calibratedValues = new Float32Array(pixelCount);
    for (let p = 0; p < pixelCount; p++) {
      const o = p * 4;
      const t = sampleIndexFromRgba(out[o], out[o + 1], out[o + 2], out[o + 3]);
      calibratedValues[p] =
        t == null ? NaN : mapStretch01ToIndexRange(t, indexMin, indexMax);
    }
  }

  const finalHoverValues = calibratedValues || hoverValues;

  // Only keep RGBA when calibrated/float hover values are missing.
  const rgbaForHover =
    !finalHoverValues && samplesPerPixel >= 3
      ? new Uint8ClampedArray(out)
      : null;

  agriPolygonApiLog("export-image:decoded", {
    uniqueid: params.uniqueid,
    rasterDate: params.rasterDate,
    width,
    height,
    samplesPerPixel,
    bbox,
    epsgCode,
    dataMin: Number.isFinite(dataMin) ? dataMin : null,
    dataMax: Number.isFinite(dataMax) ? dataMax : null,
    indexMin,
    indexMax,
    indexMean,
    hasHoverValues: Boolean(finalHoverValues),
    hasRgbaHover: Boolean(rgbaForHover),
    hoverCalibratedFromHeaders: Boolean(calibratedValues),
  });

  return {
    canvas,
    bbox,
    epsgCode,
    width,
    height,
    values: finalHoverValues,
    rgba: rgbaForHover,
    noData,
    indexMin,
    indexMax,
    indexMean,
  };
}
