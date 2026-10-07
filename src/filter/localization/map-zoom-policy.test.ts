import {
  buildDefinitionExpressionDigest,
  decideMapSurfaceCover,
  isEmptyMapExtent,
  isGeographyZoomReason,
  isHeavyCoverZoomReason,
  shouldDeferCropForFastReveal,
  shouldDeferVhUniqueIdResolve,
  shouldNavigateMapZoom,
} from "./map-zoom-policy";

describe("zoom reason classifiers", () => {
  test("geography reasons", () => {
    expect(isGeographyZoomReason("district")).toBe(true);
    expect(isGeographyZoomReason("polygon")).toBe(false);
    expect(isGeographyZoomReason("other")).toBe(false);
  });

  test("heavy cover reasons", () => {
    expect(isHeavyCoverZoomReason("region")).toBe(true);
    expect(isHeavyCoverZoomReason("crop")).toBe(false);
  });

  test("fast reveal defers crop only for region/year", () => {
    expect(shouldDeferCropForFastReveal("region")).toBe(true);
    expect(shouldDeferCropForFastReveal("year")).toBe(true);
    expect(shouldDeferCropForFastReveal("crop")).toBe(false);
  });
});

describe("isEmptyMapExtent", () => {
  test("null and zero-sized extents are empty", () => {
    expect(isEmptyMapExtent(null)).toBe(true);
    expect(isEmptyMapExtent(undefined)).toBe(true);
    expect(isEmptyMapExtent({ width: 0, height: 0 })).toBe(true);
    expect(isEmptyMapExtent({ width: 1, height: 0 })).toBe(false);
  });

  test("uses isEmpty() when available", () => {
    expect(isEmptyMapExtent({ isEmpty: (): boolean => true, width: 5 })).toBe(true);
    expect(isEmptyMapExtent({ isEmpty: (): boolean => false })).toBe(false);
  });
});

describe("decideMapSurfaceCover", () => {
  const base = {
    expectRegionLayer: false,
    alreadyOpaqueRegion: false,
    zoomReason: "other" as const,
    vhSelected: false,
    vhUniqueIdsReady: false,
  };

  test("plain filter does not cover", () => {
    expect(decideMapSurfaceCover(base)).toEqual({
      coverMap: false,
      coverReason: "filter",
      coverForCropReveal: false,
      vhOnly: false,
      vhCacheWarm: false,
    });
  });

  test("vegetation with cold cache covers, warm cache does not", () => {
    expect(decideMapSurfaceCover({ ...base, zoomReason: "vegetation" })).toMatchObject({
      coverMap: true,
      coverReason: "vegetation",
      vhOnly: true,
    });
    expect(
      decideMapSurfaceCover({
        ...base,
        zoomReason: "vegetation",
        vhSelected: true,
        vhUniqueIdsReady: true,
      }),
    ).toMatchObject({ coverMap: false, vhCacheWarm: true });
  });

  test("region layer reveal covers when not yet opaque", () => {
    expect(
      decideMapSurfaceCover({ ...base, expectRegionLayer: true, zoomReason: "crop" }),
    ).toMatchObject({ coverMap: true, coverReason: "crop-renderer", coverForCropReveal: true });
    expect(
      decideMapSurfaceCover({
        ...base,
        expectRegionLayer: true,
        alreadyOpaqueRegion: true,
        zoomReason: "region",
      }),
    ).toMatchObject({ coverMap: false, coverForCropReveal: true });
    expect(
      decideMapSurfaceCover({
        ...base,
        expectRegionLayer: true,
        alreadyOpaqueRegion: true,
        zoomReason: "crop",
      }),
    ).toMatchObject({ coverMap: false, coverForCropReveal: false, coverReason: "filter" });
  });

  test("heavy reason covers when not opaque", () => {
    expect(decideMapSurfaceCover({ ...base, zoomReason: "reset" }).coverMap).toBe(true);
  });
});

describe("shouldDeferVhUniqueIdResolve", () => {
  const base = {
    priorDefer: false,
    vhOnly: false,
    vhSelected: true,
    zoomReason: "crop" as const,
  };

  test("prior defer wins", () => {
    expect(shouldDeferVhUniqueIdResolve({ ...base, priorDefer: true, vhOnly: true })).toBe(true);
  });

  test("vh-only or no VH selection never defers", () => {
    expect(shouldDeferVhUniqueIdResolve({ ...base, vhOnly: true })).toBe(false);
    expect(shouldDeferVhUniqueIdResolve({ ...base, vhSelected: false })).toBe(false);
  });

  test("crop second-selected does not defer", () => {
    expect(shouldDeferVhUniqueIdResolve({ ...base, cropScopesVhUniqueIds: false })).toBe(false);
    expect(shouldDeferVhUniqueIdResolve({ ...base, cropScopesVhUniqueIds: true })).toBe(true);
  });

  test("geography reasons defer, others do not", () => {
    expect(shouldDeferVhUniqueIdResolve({ ...base, zoomReason: "district-clear" })).toBe(true);
    expect(shouldDeferVhUniqueIdResolve({ ...base, zoomReason: "ndvi" })).toBe(false);
  });
});

describe("shouldNavigateMapZoom", () => {
  const base = {
    zoomEnabled: true,
    zoomMode: "selection" as const,
    hasActiveMapView: true,
    zoomReason: "polygon" as const,
    polygonMode: false,
    justExitedPolygonMode: false,
  };

  test("disabled / none / no view blocks navigation", () => {
    expect(shouldNavigateMapZoom({ ...base, zoomEnabled: false })).toBe(false);
    expect(shouldNavigateMapZoom({ ...base, zoomMode: "none" })).toBe(false);
    expect(shouldNavigateMapZoom({ ...base, hasActiveMapView: false })).toBe(false);
  });

  test("non-geography reasons blocked during polygon mode", () => {
    expect(shouldNavigateMapZoom(base)).toBe(true);
    expect(shouldNavigateMapZoom({ ...base, polygonMode: true })).toBe(false);
    expect(shouldNavigateMapZoom({ ...base, justExitedPolygonMode: true })).toBe(false);
    expect(
      shouldNavigateMapZoom({ ...base, polygonMode: true, zoomReason: "region" }),
    ).toBe(true);
  });
});

describe("buildDefinitionExpressionDigest", () => {
  test("joins expressions defaulting missing to 1=0", () => {
    expect(
      buildDefinitionExpressionDigest([
        { definitionExpression: "a=1" },
        null,
        {},
      ]),
    ).toBe("a=1 || 1=0 || 1=0");
  });
});
