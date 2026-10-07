jest.mock("../../vendor/geotiff-decoders", () => ({
  RawDecoder: class {},
  LzwDecoder: class {},
  DeflateDecoder: class {},
  PackbitsDecoder: class {},
  JpegDecoder: class {},
  LercDecoder: class {},
  lercZstd: {},
  ZstdDecoder: class {},
  zstdInit: {},
  WebImageDecoder: class {},
}));

interface FakeImageSpec {
  bbox?: number[];
  width?: number;
  height?: number;
  spp?: number;
  geoKeys?: Record<string, unknown> | (() => never);
  noData?: unknown;
  interleaved?: number[];
  band?: number[];
}

const mockFromArrayBuffer = jest.fn();
jest.mock("geotiff", () => ({
  addDecoder: jest.fn(),
  fromArrayBuffer: (...args: unknown[]) => mockFromArrayBuffer(...args),
}));

import { decodeExportImageTiff } from "./tiff-decode";
import type { IndexHeaderStats } from "./config";

function useImage(spec: FakeImageSpec): void {
  const image = {
    getBoundingBox: () => spec.bbox ?? [69, 40, 69.01, 40.01],
    getWidth: () => spec.width ?? 2,
    getHeight: () => spec.height ?? 1,
    getSamplesPerPixel: () => spec.spp ?? 1,
    getGeoKeys: () => {
      if (typeof spec.geoKeys === "function") return spec.geoKeys();
      return spec.geoKeys ?? null;
    },
    getGDALNoData: () => spec.noData ?? null,
    readRasters: ({ interleave }: { interleave: boolean }) =>
      Promise.resolve(interleave ? spec.interleaved ?? [] : [spec.band ?? []]),
  };
  mockFromArrayBuffer.mockResolvedValue({ getImage: () => Promise.resolve(image) });
}

const NO_HEADERS: IndexHeaderStats = { indexMin: null, indexMax: null, indexMean: null };
const PARAMS = { uniqueid: "u", regionId: 1, rasterDate: "2024-04-01" };

let getContextSpy: jest.SpyInstance;
let putImageData: jest.Mock;

beforeEach(() => {
  putImageData = jest.fn();
  getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData,
  })) as unknown as HTMLCanvasElement["getContext"]);
});

afterEach(() => getContextSpy.mockRestore());

const pixels = (): number[] => Array.from((putImageData.mock.calls[0][0] as { data: Uint8ClampedArray }).data);

describe("decodeExportImageTiff validation", () => {
  test("rejects invalid bounding box or size", async () => {
    useImage({ bbox: [1, 1, 0, 2] });
    await expect(decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS)).rejects.toThrow("bounding box");
    useImage({ width: 0 });
    await expect(decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS)).rejects.toThrow("bounding box");
  });

  test("rejects rasters above the pixel cap", async () => {
    useImage({ width: 5000, height: 5000 });
    await expect(decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS)).rejects.toThrow("too large");
  });

  test("throws when 2D canvas is unavailable", async () => {
    getContextSpy.mockReturnValue(null);
    useImage({ band: [0.1, 0.2] });
    await expect(decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS)).rejects.toThrow("2D canvas");
  });
});

describe("decodeExportImageTiff EPSG / noData", () => {
  test("uses projected geo key when present", async () => {
    useImage({ geoKeys: { ProjectedCSTypeGeoKey: 32642 }, bbox: [500000, 4400000, 500100, 4400100], band: [0.1, 0.2] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(res.epsgCode).toBe(32642);
  });

  test("defaults to 4326 for geographic-looking bbox without geo keys", async () => {
    useImage({ geoKeys: () => { throw new Error("no keys"); }, band: [0.1, 0.2] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(res.epsgCode).toBe(4326);
  });

  test("leaves projected bbox without geo keys untagged", async () => {
    useImage({ bbox: [500000, 4400000, 500100, 4400100], band: [0.1, 0.2] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(res.epsgCode).toBeNull();
  });

  test("reads GDAL noData", async () => {
    useImage({ noData: "-9999", band: [-9999, 0.5] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(res.noData).toBe(-9999);
  });
});

describe("decodeExportImageTiff single band", () => {
  test("float index band is colorized and kept as hover values", async () => {
    useImage({ band: [0, 1] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(Array.from(res.values as Float32Array)).toEqual([0, 1]);
    expect(res.rgba).toBeNull();
    expect(pixels()).toEqual([165, 0, 38, 255, 0, 104, 55, 255]);
  });

  test("byte band is scaled to 0..1 with zero as no-data", async () => {
    useImage({ band: [0, 255] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    const values = Array.from(res.values as Float32Array);
    expect(Number.isNaN(values[0])).toBe(true);
    expect(values[1]).toBe(1);
  });

  test("out-of-range band renders as grayscale without hover values", async () => {
    useImage({ band: [0, 1000] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(res.values).toBeNull();
    expect(pixels()).toEqual([0, 0, 0, 0, 255, 255, 255, 255]);
  });

  test("0..1 stretch band is calibrated to header range", async () => {
    useImage({ band: [0.05, 1] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), { indexMin: 0.2, indexMax: 0.6, indexMean: 0.4 }, PARAMS);
    const values = Array.from(res.values as Float32Array);
    expect(values[0]).toBeCloseTo(0.22);
    expect(values[1]).toBeCloseTo(0.6);
    expect(res.indexMean).toBe(0.4);
  });

  // Fixed bug (tiff-decode.ts ~line 135): geotiff's getGDALNoData() returns null when
  // the GDAL_NODATA tag is absent, and Number(null) === 0 is finite, so noData
  // becomes 0. Genuine 0-valued index pixels (bare soil / water NDVI ≈ 0) are
  // then excluded from dataMin/dataMax and turned into NaN hover values after
  // header calibration. Expected: a missing tag yields noData === null.
  test("missing GDAL_NODATA tag yields noData null and keeps 0-valued pixels", async () => {
    useImage({ noData: null, band: [0, 1] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), { indexMin: 0.2, indexMax: 0.6, indexMean: null }, PARAMS);
    expect(res.noData).toBeNull();
    const values = Array.from(res.values as Float32Array);
    expect(values[0]).toBeCloseTo(0.2);
  });

  test("band already in header range is not remapped", async () => {
    useImage({ band: [0.2, 0.5] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), { indexMin: 0.2, indexMax: 0.5, indexMean: null }, PARAMS);
    const values = Array.from(res.values as Float32Array);
    expect(values[0]).toBeCloseTo(0.2);
    expect(values[1]).toBeCloseTo(0.5);
  });
});

describe("decodeExportImageTiff RGB(A)", () => {
  test("RGBA is copied with clamping and kept for lazy hover", async () => {
    useImage({ spp: 4, interleaved: [300, -5, 10, 255, 1, 2, 3, 0] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), NO_HEADERS, PARAMS);
    expect(pixels()).toEqual([255, 0, 10, 255, 1, 2, 3, 0]);
    expect(res.values).toBeNull();
    expect(Array.from(res.rgba as Uint8ClampedArray)).toEqual([255, 0, 10, 255, 1, 2, 3, 0]);
  });

  test("RGB gets opaque alpha and header calibration from colour lookup", async () => {
    useImage({ spp: 3, interleaved: [165, 0, 38, 0, 104, 55] });
    const res = await decodeExportImageTiff(new ArrayBuffer(1), { indexMin: 0, indexMax: 0.8, indexMean: null }, PARAMS);
    expect(pixels()).toEqual([165, 0, 38, 255, 0, 104, 55, 255]);
    const values = Array.from(res.values as Float32Array);
    expect(values[0]).toBeCloseTo(0);
    expect(values[1]).toBeCloseTo(0.8);
    expect(res.rgba).toBeNull();
  });
});
