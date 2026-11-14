jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("./graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../gis/agri-polygon-api-source", () => ({
  getExportImageSeasonMonths: (): number[] => [],
  isExportImageNoImageryError: (): boolean => false,
  isExportImageOutOfSeasonError: (): boolean => false,
  isRegionDateWithImagery: (): boolean => false,
  isRegionDateWithoutImagery: (): boolean => false,
  parseExportImageCropId: (): number | null => null,
  parseExportImageSeasonMonths: (): number[] => [],
  pickExportRasterDate: (): null => null,
  rememberExportImageSeasonMonths: jest.fn(),
  rememberRegionDateWithoutImagery: jest.fn(),
}));
jest.mock("../../../data/agri-uniqueid-sql", () => ({
  stripUniqueidBraces: (v: string | null | undefined): string => String(v ?? "").replace(/[{}]/g, ""),
}));
jest.mock("../../../gis/agri-vegetation-overlay-prefetch", () => ({ setVegetationOverlayContext: jest.fn() }));

import {
  detectHoverPayload,
  isDateRejectedError,
  isValidRasterGeoreference,
  resolveRasterEpsg,
} from "./graff-raster-overlay-steps";

describe("isValidRasterGeoreference", () => {
  test("accepts a normal bbox and size", () => {
    expect(isValidRasterGeoreference([0, 0, 10, 10], 2, 2)).toBe(true);
  });
  test("rejects non-finite, inverted or empty rasters", () => {
    expect(isValidRasterGeoreference([0, 0, NaN, 10], 2, 2)).toBe(false);
    expect(isValidRasterGeoreference([10, 0, 0, 10], 2, 2)).toBe(false);
    expect(isValidRasterGeoreference([0, 10, 10, 0], 2, 2)).toBe(false);
    expect(isValidRasterGeoreference([0, 0, 10, 10], 0, 2)).toBe(false);
    expect(isValidRasterGeoreference([0, 0, 10, 10], 2, 0)).toBe(false);
  });
});

describe("resolveRasterEpsg", () => {
  test("keeps a finite epsg", () => {
    expect(resolveRasterEpsg(32641, [1e5, 4e6, 1.1e5, 4.1e6])).toBe(32641);
  });
  test("falls back to 4326 for geographic coordinates", () => {
    expect(resolveRasterEpsg(null, [60, 40, 61, 41])).toBe(4326);
    expect(resolveRasterEpsg(NaN, [60, 40, 61, 41])).toBe(4326);
  });
  test("returns null for projected coordinates without epsg", () => {
    expect(resolveRasterEpsg(undefined, [1e5, 4e6, 1.1e5, 4.1e6])).toBeNull();
  });
});

describe("isDateRejectedError", () => {
  test("true for 400 and 404 status", () => {
    expect(isDateRejectedError({ status: 400 })).toBe(true);
    expect(isDateRejectedError({ status: 404 })).toBe(true);
  });
  test("true when the message names HTTP 400/404", () => {
    expect(isDateRejectedError(new Error("HTTP 404 not found"))).toBe(true);
  });
  test("false for other failures", () => {
    expect(isDateRejectedError({ status: 500 })).toBe(false);
    expect(isDateRejectedError(new Error("boom"))).toBe(false);
  });
});

describe("detectHoverPayload", () => {
  test("detects float values when length matches", () => {
    const r = detectHoverPayload({ values: new Float32Array(4), rgba: null, width: 2, height: 2 });
    expect(r).toEqual({ hasFloatValues: true, hasRgba: false });
  });
  test("detects rgba when length is w*h*4", () => {
    const r = detectHoverPayload({ values: null, rgba: new Uint8ClampedArray(16), width: 2, height: 2 });
    expect(r).toEqual({ hasFloatValues: false, hasRgba: true });
  });
  test("reports neither on length mismatch", () => {
    const r = detectHoverPayload({ values: new Float32Array(3), rgba: new Uint8ClampedArray(5), width: 2, height: 2 });
    expect(r).toEqual({ hasFloatValues: false, hasRgba: false });
  });
});
