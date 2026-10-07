import {
  districtAdminExpandFactor,
  districtFallbackRegionExpandFactor,
  homeGoToDurationMs,
  isDistrictZoomPath,
  pickHomeExtentCandidate,
  pickRegionExtentSource,
  planCropNdviExtentSource,
  preferShownRegionYearExtent,
  raceRegionExtentPick,
  shouldNarrowSpatialUnionWithShownExtent,
  shouldSkipHomeGoTo,
  zoomExpandFactorForReason,
  zoomGoToDurationMsForReason,
} from "./map-zoom-target";
import { isEmptyMapExtent, type ExtentLike } from "./map-zoom-policy";

const full: ExtentLike = { width: 10, height: 10 };
const empty: ExtentLike = { width: 0, height: 0 };

describe("zoom target simple policies", () => {
  test("isDistrictZoomPath", () => {
    expect(isDistrictZoomPath("district", "Olot")).toBe(true);
    expect(isDistrictZoomPath("district", "  ")).toBe(false);
    expect(isDistrictZoomPath("region", "Olot")).toBe(false);
  });

  test("preferShownRegionYearExtent", () => {
    expect(preferShownRegionYearExtent("region")).toBe(true);
    expect(preferShownRegionYearExtent("district-clear")).toBe(true);
    expect(preferShownRegionYearExtent("polygon-exit")).toBe(true);
    expect(preferShownRegionYearExtent("crop")).toBe(false);
  });

  test("expand factors and durations per reason", () => {
    expect(zoomExpandFactorForReason("district")).toBe(1.03);
    expect(zoomExpandFactorForReason("year")).toBe(1.06);
    expect(zoomExpandFactorForReason("ndvi")).toBe(1.12);
    expect(zoomExpandFactorForReason("other")).toBe(1.18);
    expect(zoomGoToDurationMsForReason("region")).toBe(450);
    expect(zoomGoToDurationMsForReason("crop")).toBe(700);
    expect(districtAdminExpandFactor()).toBe(1.08);
    expect(districtFallbackRegionExpandFactor()).toBe(1.03);
    expect(homeGoToDurationMs()).toBe(800);
  });

  test("shouldSkipHomeGoTo debounces", () => {
    expect(shouldSkipHomeGoTo({ now: 1000, lastHomeGoToAt: 700 })).toBe(true);
    expect(shouldSkipHomeGoTo({ now: 1000, lastHomeGoToAt: 500 })).toBe(false);
    expect(shouldSkipHomeGoTo({ now: 1000, lastHomeGoToAt: 950, minGapMs: 10 })).toBe(false);
  });

  test("pickHomeExtentCandidate order", () => {
    const a = { id: "a" } as unknown as __esri.Extent;
    const b = { id: "b" } as unknown as __esri.Extent;
    expect(pickHomeExtentCandidate({ storedHome: a, mapFullExtent: b, layerFullExtent: null })).toBe(a);
    expect(pickHomeExtentCandidate({ storedHome: null, mapFullExtent: null, layerFullExtent: b })).toBe(b);
    expect(
      pickHomeExtentCandidate({ storedHome: undefined, mapFullExtent: null, layerFullExtent: null }),
    ).toBeNull();
  });

  test("pickRegionExtentSource", () => {
    expect(pickRegionExtentSource({ fieldExtent: full, adminExtent: full, adminLevel: "region" })).toBe(
      "admin-region",
    );
    expect(pickRegionExtentSource({ fieldExtent: full, adminExtent: full, adminLevel: "district" })).toBe(
      "field",
    );
    expect(pickRegionExtentSource({ fieldExtent: empty, adminExtent: null, adminLevel: "none" })).toBe(
      "none",
    );
  });

  test("crop/ndvi extent plan", () => {
    expect(
      planCropNdviExtentSource({ hasMergedSpatialExtent: false, hasTuman: true, selectedTurlarCount: 0 }),
    ).toBe("fallback-shown");
    expect(
      planCropNdviExtentSource({ hasMergedSpatialExtent: true, hasTuman: false, selectedTurlarCount: 2 }),
    ).toBe("narrow-shown");
    expect(
      planCropNdviExtentSource({ hasMergedSpatialExtent: true, hasTuman: false, selectedTurlarCount: 0 }),
    ).toBe("use-spatial");
    expect(
      shouldNarrowSpatialUnionWithShownExtent({
        hasMergedSpatialExtent: false,
        hasTuman: true,
        selectedTurlarCount: 1,
      }),
    ).toBe(false);
  });
});

describe("raceRegionExtentPick", () => {
  const isEmpty = (e: ExtentLike | null | undefined): boolean => isEmptyMapExtent(e);

  test("resolves with field when it arrives first", async () => {
    const out = await raceRegionExtentPick<ExtentLike>({
      fieldPromise: Promise.resolve(full),
      adminPromise: new Promise<void>(() => undefined),
      getAdminExtent: () => null,
      getAdminLevel: () => "none",
      isEmptyExtent: isEmpty,
    });
    expect(out).toEqual({ source: "field", extent: full });
  });

  test("resolves with admin-region when admin is region level", async () => {
    const admin: ExtentLike = { width: 3, height: 3 };
    const out = await raceRegionExtentPick<ExtentLike>({
      fieldPromise: new Promise<ExtentLike | null>(() => undefined),
      adminPromise: Promise.resolve(),
      getAdminExtent: () => admin,
      getAdminLevel: () => "region",
      isEmptyExtent: isEmpty,
    });
    expect(out).toEqual({ source: "admin-region", extent: admin });
  });

  test("falls back to none when both settle empty", async () => {
    const out = await raceRegionExtentPick<ExtentLike>({
      fieldPromise: Promise.resolve(empty),
      adminPromise: Promise.resolve(),
      getAdminExtent: () => null,
      getAdminLevel: () => "district",
      isEmptyExtent: isEmpty,
    });
    expect(out).toEqual({ source: "none", extent: null });
  });

  test("fallback picks admin-region when custom emptiness rejects the race", async () => {
    const admin: ExtentLike = { width: 3, height: 3 };
    const out = await raceRegionExtentPick<ExtentLike>({
      fieldPromise: Promise.resolve(empty),
      adminPromise: Promise.resolve(),
      getAdminExtent: () => admin,
      getAdminLevel: () => "region",
      isEmptyExtent: () => true,
    });
    expect(out).toEqual({ source: "admin-region", extent: admin });
  });

  test("fallback picks field when custom emptiness rejects the race", async () => {
    const out = await raceRegionExtentPick<ExtentLike>({
      fieldPromise: Promise.resolve(full),
      adminPromise: Promise.resolve(),
      getAdminExtent: () => null,
      getAdminLevel: () => "none",
      isEmptyExtent: () => true,
    });
    expect(out).toEqual({ source: "field", extent: full });
  });
});
