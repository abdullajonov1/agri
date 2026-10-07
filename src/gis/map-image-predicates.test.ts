import type { AgriLayerLike } from "./agri-layer-types";
import {
  isAgriAdminBoundaryLayer,
  isMapImageSublayer,
  isRegionSoatoCode,
  shouldRefreshMapImageParentOnly,
} from "./map-image-predicates";

const layer = (props: Record<string, unknown>): AgriLayerLike =>
  props as unknown as AgriLayerLike;

describe("isMapImageSublayer", () => {
  test("detects sublayer type case-insensitively", () => {
    expect(isMapImageSublayer(layer({ type: "Sublayer" }))).toBe(true);
    expect(isMapImageSublayer(layer({ type: "feature" }))).toBe(false);
    expect(isMapImageSublayer(null)).toBe(false);
  });
});

describe("isAgriAdminBoundaryLayer", () => {
  test("rejects null", () => {
    expect(isAgriAdminBoundaryLayer(undefined)).toBe(false);
  });

  test("matches known widget-owned ids", () => {
    expect(isAgriAdminBoundaryLayer(layer({ id: " agri-district-boundary " }))).toBe(true);
  });

  test("matches boundary titles", () => {
    expect(isAgriAdminBoundaryLayer(layer({ title: "Region Boundary" }))).toBe(true);
    expect(isAgriAdminBoundaryLayer(layer({ title: "Uzb district borders 2024" }))).toBe(true);
    expect(isAgriAdminBoundaryLayer(layer({ title: "Tuman chegara" }))).toBe(true);
  });

  test("matches boundary service urls", () => {
    expect(
      isAgriAdminBoundaryLayer(layer({ url: "https://x/arcgis/rest/services/Tuman_chegara/MapServer/0" })),
    ).toBe(true);
    expect(
      isAgriAdminBoundaryLayer(layer({ url: "https://x/server/rest/services/Hosted/districts/FeatureServer" })),
    ).toBe(true);
  });

  test("walks parent / layer pointers", () => {
    const parent = layer({ id: "agri-region-boundary" });
    expect(isAgriAdminBoundaryLayer(layer({ id: "child", parent }))).toBe(true);
    expect(isAgriAdminBoundaryLayer(layer({ id: "sub", layer: parent }))).toBe(true);
  });

  test("terminates on cyclic parent chains", () => {
    const a = layer({ id: "a", title: "fields" });
    const b = layer({ id: "b", parent: a });
    (a as unknown as Record<string, unknown>).parent = b;
    expect(isAgriAdminBoundaryLayer(a)).toBe(false);
  });

  test("ordinary field layers are not boundaries", () => {
    expect(
      isAgriAdminBoundaryLayer(layer({ id: "fields", title: "Agri fields", url: "https://x/Agri/MapServer/1" })),
    ).toBe(false);
  });
});

describe("isRegionSoatoCode", () => {
  test("accepts exactly four digits (trimmed)", () => {
    expect(isRegionSoatoCode("1703")).toBe(true);
    expect(isRegionSoatoCode(" 1703 ")).toBe(true);
    expect(isRegionSoatoCode("17030")).toBe(false);
    expect(isRegionSoatoCode("17a3")).toBe(false);
    expect(isRegionSoatoCode(null as unknown as string)).toBe(false);
  });
});

describe("shouldRefreshMapImageParentOnly", () => {
  test("map-image and sublayer types refresh parent only", () => {
    expect(shouldRefreshMapImageParentOnly(layer({ type: "map-image" }))).toBe(true);
    expect(shouldRefreshMapImageParentOnly(layer({ type: "sublayer" }))).toBe(true);
  });

  test("untyped leaf with distinct parent layer refreshes parent only", () => {
    const parent = layer({ type: "map-image" });
    expect(shouldRefreshMapImageParentOnly(layer({ layer: parent }))).toBe(true);
  });

  test("feature layers and null do not", () => {
    const parent = layer({ type: "map-image" });
    expect(shouldRefreshMapImageParentOnly(layer({ type: "feature", layer: parent }))).toBe(false);
    expect(shouldRefreshMapImageParentOnly(layer({ type: "feature" }))).toBe(false);
    expect(shouldRefreshMapImageParentOnly(null)).toBe(false);
  });
});
