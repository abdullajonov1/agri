import {
  computeZoomRequest,
  isGeographyDetail,
  isPolygonSelectionOnlyDetail,
  isStaleGeographyEvent,
  readEventTimestamp,
} from "./selection-service-steps";

const noChange = {
  yearChanged: false,
  viloyatChanged: false,
  tumanChanged: false,
  turiChanged: false,
  ndviDateChanged: false,
};

describe("selection-service-steps pure helpers", () => {
  test("readEventTimestamp returns 0 for non-finite or non-number values", () => {
    expect(readEventTimestamp({ timestamp: "5" })).toBe(0);
    expect(readEventTimestamp({ timestamp: NaN })).toBe(0);
    expect(readEventTimestamp({ timestamp: 42 })).toBe(42);
  });

  test("isGeographyDetail is true when any geography key is present", () => {
    expect(isGeographyDetail({ yil: 2024 })).toBe(true);
    expect(isGeographyDetail({ turlar: [] })).toBe(true);
    expect(isGeographyDetail({ vh: "x", uniqueid: "1" })).toBe(false);
  });

  test("isStaleGeographyEvent only drops older geography events", () => {
    expect(isStaleGeographyEvent(true, 5, 10)).toBe(true);
    expect(isStaleGeographyEvent(true, 10, 10)).toBe(false);
    expect(isStaleGeographyEvent(false, 5, 10)).toBe(false);
    expect(isStaleGeographyEvent(true, 0, 10)).toBe(false);
    expect(isStaleGeographyEvent(true, 5, 0)).toBe(false);
  });

  test("isPolygonSelectionOnlyDetail requires uniqueid or polygonMode and no other keys", () => {
    expect(isPolygonSelectionOnlyDetail({ uniqueid: "1" })).toBe(true);
    expect(isPolygonSelectionOnlyDetail({ polygonMode: false })).toBe(true);
    expect(isPolygonSelectionOnlyDetail({ uniqueid: "1", vh: "a" })).toBe(false);
    expect(isPolygonSelectionOnlyDetail({ yil: 2024, polygonMode: true })).toBe(false);
    expect(isPolygonSelectionOnlyDetail({})).toBe(false);
  });

  test("computeZoomRequest handles polygon exit and polygon pick", () => {
    expect(
      computeZoomRequest({ ...noChange, d: { source: "AgriPopup", polygonMode: false, uniqueid: "1" }, isPolygonSelectionOnly: true, updates: {}, lockedViloyat: "" }),
    ).toEqual({ mode: "selection", reason: "polygon-exit" });
    expect(
      computeZoomRequest({ ...noChange, d: { polygonMode: true, uniqueid: "1" }, isPolygonSelectionOnly: true, updates: {}, lockedViloyat: "" }),
    ).toEqual({ mode: "none", reason: "polygon" });
  });

  test("computeZoomRequest follows year, region, district, crop, vh, ndvi priority", () => {
    const base = { d: {}, isPolygonSelectionOnly: false, updates: {}, lockedViloyat: "" };
    expect(computeZoomRequest({ ...base, ...noChange, yearChanged: true })).toEqual({ mode: "home", reason: "year" });
    expect(computeZoomRequest({ ...base, ...noChange, viloyatChanged: true })).toEqual({ mode: "home", reason: "region" });
    expect(computeZoomRequest({ ...base, ...noChange, viloyatChanged: true, updates: { viloyat: "A" } })).toEqual({ mode: "selection", reason: "region" });
    expect(computeZoomRequest({ ...base, ...noChange, viloyatChanged: true, lockedViloyat: "L" })).toEqual({ mode: "selection", reason: "region" });
    expect(computeZoomRequest({ ...base, ...noChange, tumanChanged: true })).toEqual({ mode: "selection", reason: "district-clear" });
    expect(computeZoomRequest({ ...base, ...noChange, tumanChanged: true, updates: { tuman: "T" } })).toEqual({ mode: "selection", reason: "district" });
    expect(computeZoomRequest({ ...base, ...noChange, turiChanged: true })).toEqual({ mode: "none", reason: "crop" });
    expect(computeZoomRequest({ ...base, ...noChange, d: { vh: "a" } })).toEqual({ mode: "none", reason: "vegetation" });
    expect(computeZoomRequest({ ...base, ...noChange, ndviDateChanged: true })).toEqual({ mode: "selection", reason: "ndvi" });
    expect(computeZoomRequest({ ...base, ...noChange })).toEqual({ mode: "none", reason: "other" });
  });
});
