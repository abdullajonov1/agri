jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import type { AgriLayerLike, AgriMapLike } from "../agri-layer-types";
import {
  findQueryableLayerOnMapById,
  findQueryableLayerOnMapByUrl,
} from "./map-layer-find";

const collection = <T>(items: T[]): { length: number; toArray: () => T[] } => ({
  length: items.length,
  toArray: () => items,
});

const queryable = (id: string, url: string): AgriLayerLike => ({
  declaredClass: "test.FeatureLayer",
  id,
  url,
  title: "Agri fields",
  type: "feature",
  fields: [{ name: "uniqueid" }],
  createQuery: jest.fn(),
  queryFeatures: jest.fn(),
});

const mapOf = (layers: AgriLayerLike[]): AgriMapLike => ({
  declaredClass: "test.Map",
  layers: collection(layers),
  allLayers: collection(layers),
});

describe("findQueryableLayerOnMapByUrl", () => {
  test("finds a layer by normalized URL", () => {
    // Arrange
    const layer = queryable("a", "https://example.test/arcgis/rest/services/agri/MapServer/3");
    const map = mapOf([layer]);

    // Act
    const found = findQueryableLayerOnMapByUrl(
      map,
      "HTTPS://example.test/arcgis/rest/services/agri/MapServer/3/",
    );

    // Assert
    expect(found).toBe(layer);
  });

  test("returns null without a map or url, or when nothing matches", () => {
    const map = mapOf([queryable("a", "https://example.test/agri/MapServer/1")]);
    expect(findQueryableLayerOnMapByUrl(null, "https://example.test/x")).toBeNull();
    expect(findQueryableLayerOnMapByUrl(map, "")).toBeNull();
    expect(findQueryableLayerOnMapByUrl(map, "https://example.test/other/MapServer/9")).toBeNull();
  });
});

describe("findQueryableLayerOnMapById", () => {
  test("returns the single layer with that id", () => {
    const layer = queryable("7", "https://example.test/agri/MapServer/7");
    expect(findQueryableLayerOnMapById(mapOf([layer]), "7")).toBe(layer);
  });

  test("returns null when ids collide across services", () => {
    const map = mapOf([
      queryable("0", "https://example.test/agri_a/MapServer/0"),
      queryable("0", "https://example.test/agri_b/MapServer/0"),
    ]);
    expect(findQueryableLayerOnMapById(map, "0")).toBeNull();
  });

  test("returns null for a blank id", () => {
    expect(findQueryableLayerOnMapById(mapOf([]), " ")).toBeNull();
  });
});
