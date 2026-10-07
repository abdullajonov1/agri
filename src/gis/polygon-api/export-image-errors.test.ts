import {
  isExportImageNoImageryError,
  isExportImageOutOfSeasonError,
  isExportImagePolygonNotFoundError,
  parseExportImageCropId,
  parseExportImageSeasonMonths,
} from "./export-image-errors";

const SEASON_TEXT =
  "Indices for crop_id=6 (wheat) are calculated only in March, April; September is outside the season";

describe("isExportImageOutOfSeasonError", () => {
  test("detects status 400 with season message", () => {
    expect(isExportImageOutOfSeasonError({ status: 400, responseText: SEASON_TEXT })).toBe(true);
  });

  test("detects 'HTTP 400' embedded in message when status missing", () => {
    expect(isExportImageOutOfSeasonError({ message: `HTTP 400: ${SEASON_TEXT}` })).toBe(true);
  });

  test("rejects other statuses or unrelated text", () => {
    expect(isExportImageOutOfSeasonError({ status: 500, responseText: SEASON_TEXT })).toBe(false);
    expect(isExportImageOutOfSeasonError({ status: 400, responseText: "bad request" })).toBe(false);
    expect(isExportImageOutOfSeasonError(null)).toBe(false);
    expect(isExportImageOutOfSeasonError("HTTP 400 outside the season")).toBe(false);
  });
});

describe("parseExportImageSeasonMonths", () => {
  test("extracts only the allowed months, excluding the outside-season tail", () => {
    expect(parseExportImageSeasonMonths({ responseText: SEASON_TEXT })).toEqual([3, 4]);
  });

  test("accepts a raw string error", () => {
    expect(parseExportImageSeasonMonths("calculated only in June, May")).toEqual([5, 6]);
  });

  test("returns [] without the marker", () => {
    expect(parseExportImageSeasonMonths({ message: "boom" })).toEqual([]);
    expect(parseExportImageSeasonMonths(undefined)).toEqual([]);
  });
});

describe("parseExportImageCropId", () => {
  test("reads crop_id from message or string", () => {
    expect(parseExportImageCropId({ message: SEASON_TEXT })).toBe(6);
    expect(parseExportImageCropId("crop_id = 12")).toBe(12);
  });

  test("returns null when absent", () => {
    expect(parseExportImageCropId({ responseText: "no crop" })).toBeNull();
    expect(parseExportImageCropId(null)).toBeNull();
  });
});

describe("isExportImageNoImageryError", () => {
  test("recognizes old 400, current 404 and render failures", () => {
    expect(
      isExportImageNoImageryError({ status: 400, responseText: "No imagery available for region_id=3 on 2024-04-01" }),
    ).toBe(true);
    expect(
      isExportImageNoImageryError({ status: 404, responseText: "No imagery in AdminRaster/x for region='y'" }),
    ).toBe(true);
    expect(
      isExportImageNoImageryError({ message: "HTTP 400 Imagery could not be rendered (no valid pixels)" }),
    ).toBe(true);
  });

  test("rejects other statuses and messages", () => {
    expect(isExportImageNoImageryError({ status: 500, responseText: "no imagery" })).toBe(false);
    expect(isExportImageNoImageryError({ status: 404, responseText: "polygon not found" })).toBe(false);
  });
});

describe("isExportImagePolygonNotFoundError", () => {
  test("detects 404 polygon / uniqueid not found", () => {
    expect(isExportImagePolygonNotFoundError({ status: 404, responseText: "uniqueid=abc not found" })).toBe(true);
    expect(isExportImagePolygonNotFoundError({ message: "HTTP 404 Polygon xyz not found" })).toBe(true);
  });

  test("rejects non-404 or unrelated 404s", () => {
    expect(isExportImagePolygonNotFoundError({ status: 400, responseText: "polygon not found" })).toBe(false);
    expect(isExportImagePolygonNotFoundError({ status: 404, responseText: "No imagery" })).toBe(false);
  });
});
