jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import {
  buildMapDistrictClause,
  collectQueryableFieldLayers,
  getQueryableLayer,
  isAgriMapLayerCandidate,
} from "./lookup-collect";
import { isAgriWaterTableLayer, safeLoadMapImageTree } from "./lookup-map-image";
import {
  collectRegionYearLeafLayers,
  getAllFeatureLayersFromMap,
  unlockShownRegionYearFieldScales,
} from "./lookup-region-year";
import type { AgriLayerLike } from "../../agri-layer-types";
import { asFeatureSet, asQuery, collection, fields, makeLayer } from "../__test-utils__/fake-layer";

const leaf = (overrides: Partial<AgriLayerLike> = {}): AgriLayerLike =>
  makeLayer({
    createQuery: () => asQuery({}),
    queryFeatures: () => Promise.resolve(asFeatureSet({ features: [] })),
    ...overrides,
  });

describe("buildMapDistrictClause", () => {
  test("returns empty without tuman or code", () => {
    expect(buildMapDistrictClause(null, "", null)).toBe("");
  });

  test("prefers a numeric district code on distrct_id when field metadata is unknown", () => {
    expect(buildMapDistrictClause(null, "Rishton", 1730424)).toBe("distrct_id=1730424");
  });

  test("quotes the code on a string id field, using the first available id field", () => {
    const sub = makeLayer({ fields: fields(["district_id", "esriFieldTypeString"]) });
    expect(buildMapDistrictClause(sub, "", 17)).toBe("district_id='17'");
  });

  test("falls back to tuman name variants when no id field exists", () => {
    const sub = makeLayer({ fields: fields(["Tuman", "esriFieldTypeString"]) });
    const clause = buildMapDistrictClause(sub, "Rishton", 17);
    expect(clause.startsWith("(")).toBe(true);
    expect(clause).toContain("Tuman='Rishton'");
    expect(clause).toContain("Tuman='Rishton tumani'");
  });

  test("uses tuman field name when metadata unknown and no code", () => {
    expect(buildMapDistrictClause(undefined, "Rishton")).toContain("tuman='Rishton'");
  });

  test("uses another district-ish string field when tuman is absent", () => {
    const sub = makeLayer({ fields: fields(["tuman_nomi", "esriFieldTypeString"]) });
    expect(buildMapDistrictClause(sub, "Rishton")).toContain("tuman_nomi='Rishton'");
  });

  test("numeric-only tuman without id field yields no clause", () => {
    const sub = makeLayer({ fields: fields(["other", "esriFieldTypeString"]) });
    expect(buildMapDistrictClause(sub, "123")).toBe("");
  });
});

describe("queryable layer discovery", () => {
  test("getQueryableLayer returns the layer itself or the first queryable descendant", () => {
    const a = leaf({ id: "a" });
    expect(getQueryableLayer(a)).toBe(a);
    const nested = leaf({ id: "nested" });
    const root = makeLayer({
      type: "map-image",
      sublayers: collection([makeLayer({ sublayers: collection([nested]) })]),
    });
    expect(getQueryableLayer(root)).toBe(nested);
    expect(getQueryableLayer(makeLayer())).toBeNull();
    expect(getQueryableLayer(null)).toBeNull();
  });

  test("collectQueryableFieldLayers walks groups and collects every leaf", () => {
    const a = leaf({ id: "a" });
    const b = leaf({ id: "b" });
    const group = makeLayer({ type: "group", sublayers: collection([b]) });
    const root = makeLayer({ type: "map-image", allSublayers: collection([a, group]) });
    expect(collectQueryableFieldLayers(root).map((l) => l.id)).toEqual(["a", "b"]);
    expect(collectQueryableFieldLayers(null)).toEqual([]);
  });

  test("isAgriWaterTableLayer requires both metric and region fields", () => {
    expect(isAgriWaterTableLayer(leaf({ fields: fields(["area_ha"], ["region_id"]) }))).toBe(true);
    expect(isAgriWaterTableLayer(leaf({ fields: fields(["area_ha"]) }))).toBe(false);
    expect(isAgriWaterTableLayer(leaf())).toBe(false);
    expect(isAgriWaterTableLayer(makeLayer({ fields: fields(["year"], ["viloyat"]) }))).toBe(false);
  });

  test("isAgriMapLayerCandidate uses fields when known, title/url otherwise", () => {
    expect(isAgriMapLayerCandidate(leaf({ fields: fields(["uniqueid"]) }))).toBe(true);
    expect(isAgriMapLayerCandidate(leaf({ fields: fields(["road_name"]), title: "roads" }))).toBe(
      false,
    );
    expect(isAgriMapLayerCandidate(leaf({ url: "https://h/rest/services/x/MapServer/2" }))).toBe(
      true,
    );
    expect(isAgriMapLayerCandidate(leaf({ title: "World Hillshade agri" }))).toBe(false);
    expect(isAgriMapLayerCandidate(makeLayer({ title: "agri" }))).toBe(false);
  });
});

describe("safeLoadMapImageTree", () => {
  test("loads leaves but never calls load on group folders", async () => {
    const leafLoad = jest.fn(() => Promise.resolve());
    const groupLoad = jest.fn(() => Promise.resolve());
    const group = makeLayer({
      type: "group",
      load: groupLoad,
      sublayers: collection([makeLayer({ load: leafLoad })]),
    });
    const rootLoad = jest.fn(() => Promise.resolve());
    await safeLoadMapImageTree(makeLayer({ load: rootLoad, sublayers: collection([group]) }));
    expect(rootLoad).toHaveBeenCalled();
    expect(groupLoad).not.toHaveBeenCalled();
    expect(leafLoad).toHaveBeenCalled();
    await expect(safeLoadMapImageTree(null)).resolves.toBeUndefined();
  });
});

describe("region-year leaves", () => {
  test("collectRegionYearLeafLayers keeps only region+year leaves under groups and map-images", () => {
    const andijan = makeLayer({ type: "sublayer", title: "agri andijan 2026" });
    const republic = makeLayer({ type: "sublayer", title: "agri 2026 republic data" });
    const fergana = makeLayer({ type: "map-image", title: "Water Fergana 2025 year", sublayers: collection([]) });
    const mapImage = makeLayer({
      type: "map-image",
      title: "database 2026",
      allSublayers: collection([andijan, republic]),
    });
    const group = makeLayer({ type: "group" });
    const groupNode = Object.assign(group, { layers: collection<AgriLayerLike>([fergana]) });
    const map = { layers: collection<AgriLayerLike>([mapImage, groupNode]) };
    expect(collectRegionYearLeafLayers(map)).toEqual([andijan, fergana]);
  });

  test("getAllFeatureLayersFromMap dedupes by map key and drops non-candidates", () => {
    const a = leaf({ url: "https://h/MapServer/1", fields: fields(["uniqueid"]) });
    const dup = leaf({ url: "https://H/MapServer/1/", fields: fields(["uniqueid"]) });
    const roads = leaf({ url: "https://h/MapServer/2", fields: fields(["road"]), title: "roads" });
    const root = makeLayer({ type: "map-image", sublayers: collection([a, dup, roads]) });
    expect(getAllFeatureLayersFromMap({ allLayers: collection([root]) })).toEqual([a]);
    expect(getAllFeatureLayersFromMap(null)).toEqual([]);
  });

  test("unlockShownRegionYearFieldScales clears scale gates on shown layers and sublayers", () => {
    const layer = makeLayer({ minScale: 5 });
    const sub = makeLayer({ maxScale: 7 });
    unlockShownRegionYearFieldScales([{ layer, sublayers: [sub] }]);
    expect(layer.minScale).toBe(0);
    expect(sub.maxScale).toBe(0);
    expect(() => unlockShownRegionYearFieldScales(null)).not.toThrow();
  });
});
