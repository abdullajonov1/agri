jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

import {
  childSublayers,
  clearFieldLayerScaleLimits,
  clearScaleLimitsOnRegionYearTree,
  collectLiveSublayers,
  disableLayerPbf,
  extractMapLayerIdFromDsId,
  getAgriLayerMapKey,
  getLayerFieldNames,
  getMapImageParentLayer,
  getRegionYearOpacityTarget,
  guardSublayerDefinitionExpression,
  isAgriFieldLayerCandidate,
  isGroupSublayer,
  isLikelyBasemapServiceLayer,
  isMapImageGroupSublayer,
  isMapImageOwnedLayer,
  isQueryableFieldLayer,
  normalizeMapServiceUrl,
  normalizeQueryableLayerUrl,
  refreshRegionYearMapExports,
  resolveQueryableServiceUrl,
  safeLoadMapLayer,
  summarizeDefinitionExpression,
} from "./layer-tree";
import type { AgriLayerLike } from "../agri-layer-types";
import { asFeatureSet, asQuery, collection, fields, makeLayer } from "./__test-utils__/fake-layer";

const queryable = (overrides: Partial<AgriLayerLike> = {}): AgriLayerLike =>
  makeLayer({
    createQuery: () => asQuery({}),
    queryFeatures: jest.fn(() => Promise.resolve(asFeatureSet({ features: [] }))),
    ...overrides,
  });

describe("layer classification", () => {
  test("isMapImageGroupSublayer detects group source types, sublayers with kids, and type=group", () => {
    expect(isMapImageGroupSublayer(null)).toBe(false);
    expect(isMapImageGroupSublayer(makeLayer({ sourceJSON: { type: "Group Layer" } }))).toBe(true);
    expect(isMapImageGroupSublayer(makeLayer({ resourceInfo: { type: "Group Layer" } }))).toBe(true);
    expect(
      isMapImageGroupSublayer(makeLayer({ type: "sublayer", sublayers: collection([makeLayer()]) })),
    ).toBe(true);
    expect(isMapImageGroupSublayer(makeLayer({ type: "group" }))).toBe(true);
    expect(isMapImageGroupSublayer(makeLayer({ type: "sublayer" }))).toBe(false);
  });

  test("isQueryableFieldLayer accepts query-capable leaves and rejects groups / admin boundaries", () => {
    expect(isQueryableFieldLayer(queryable())).toBe(true);
    expect(
      isQueryableFieldLayer(
        makeLayer({
          createQuery: () => asQuery({}),
          queryFeatureCount: () => Promise.resolve(0),
        }),
      ),
    ).toBe(true);
    expect(isQueryableFieldLayer(queryable({ type: "group" }))).toBe(false);
    expect(isQueryableFieldLayer(queryable({ title: "Region boundary" }))).toBe(false);
    expect(isQueryableFieldLayer(makeLayer({ type: "sublayer", url: "u" }))).toBe(false);
    expect(isQueryableFieldLayer(null)).toBe(false);
  });

  test("isGroupSublayer requires non-empty child sublayers", () => {
    expect(isGroupSublayer(makeLayer({ sublayers: collection([makeLayer()]) }))).toBe(true);
    expect(isGroupSublayer(makeLayer({ sublayers: collection([]) }))).toBe(false);
    expect(isGroupSublayer(null)).toBe(false);
  });

  test("isLikelyBasemapServiceLayer flags esri basemap services", () => {
    expect(isLikelyBasemapServiceLayer(makeLayer({ title: "World Hillshade" }))).toBe(true);
    expect(
      isLikelyBasemapServiceLayer(
        makeLayer({ url: "https://services.arcgisonline.com/arcgis/rest/x" }),
      ),
    ).toBe(true);
    expect(isLikelyBasemapServiceLayer(makeLayer({ title: "agri fields" }))).toBe(false);
  });

  test("isAgriFieldLayerCandidate by field names or agri title", () => {
    expect(isAgriFieldLayerCandidate(makeLayer({ fields: fields(["UNIQUEID"]) }))).toBe(true);
    expect(isAgriFieldLayerCandidate(makeLayer({ title: "Agri andijan 2026" }))).toBe(true);
    expect(
      isAgriFieldLayerCandidate(makeLayer({ parent: makeLayer({ title: "Qishloq xo'jaligi" }) })),
    ).toBe(true);
    expect(isAgriFieldLayerCandidate(makeLayer({ title: "roads" }))).toBe(false);
  });

  test("getLayerFieldNames lowercases names", () => {
    expect(getLayerFieldNames(makeLayer({ fields: fields(["A"], ["bC"]) }))).toEqual(["a", "bc"]);
    expect(getLayerFieldNames(null)).toEqual([]);
  });
});

describe("URL helpers", () => {
  test("normalizeMapServiceUrl strips index and trailing slash", () => {
    expect(normalizeMapServiceUrl(" https://H/MapServer/3/ ")).toBe("https://h/mapserver");
  });

  test("normalizeQueryableLayerUrl keeps the index", () => {
    expect(normalizeQueryableLayerUrl("https://H/MapServer/3/")).toBe("https://h/mapserver/3");
  });

  test("resolveQueryableServiceUrl appends a numeric layer id to service roots", () => {
    expect(resolveQueryableServiceUrl(makeLayer({ url: "https://h/MapServer/2/" }))).toBe(
      "https://h/MapServer/2",
    );
    expect(resolveQueryableServiceUrl(makeLayer({ url: "https://h/MapServer", layerId: 4 }))).toBe(
      "https://h/MapServer/4",
    );
    expect(resolveQueryableServiceUrl(makeLayer({ url: "https://h/FeatureServer", id: "7" }))).toBe(
      "https://h/FeatureServer/7",
    );
    expect(resolveQueryableServiceUrl(makeLayer({ url: "https://h/MapServer", id: "abc" }))).toBe(
      "https://h/MapServer",
    );
    expect(resolveQueryableServiceUrl(makeLayer())).toBe("");
  });
});

describe("parents and keys", () => {
  const root = makeLayer({ type: "map-image", url: "https://h/MapServer/" });

  test("getMapImageParentLayer walks the parent chain or uses .layer", () => {
    const group = makeLayer({ type: "sublayer", parent: root });
    const leaf = makeLayer({ type: "sublayer", parent: group });
    expect(getMapImageParentLayer(leaf)).toBe(root);
    expect(getMapImageParentLayer(makeLayer({ layer: root }))).toBe(root);
    expect(getMapImageParentLayer(makeLayer())).toBeNull();
  });

  test("getAgriLayerMapKey uses own url, else parent url + id, else id", () => {
    expect(getAgriLayerMapKey(makeLayer({ url: "https://H/MapServer/1" }))).toBe(
      "https://h/mapserver/1",
    );
    expect(getAgriLayerMapKey(makeLayer({ id: 3, parent: root }))).toBe("https://h/mapserver/3");
    expect(getAgriLayerMapKey(makeLayer({ id: "x" }))).toBe("x");
    expect(getAgriLayerMapKey(null)).toBe("");
  });

  test("isMapImageOwnedLayer", () => {
    expect(isMapImageOwnedLayer(makeLayer({ type: "map-image" }))).toBe(true);
    expect(isMapImageOwnedLayer(makeLayer({ layer: root }))).toBe(true);
    expect(
      isMapImageOwnedLayer(makeLayer({ url: "https://h/MapServer/1", parent: makeLayer() })),
    ).toBe(true);
    expect(isMapImageOwnedLayer(makeLayer({ type: "feature", url: "https://h/FeatureServer/1" }))).toBe(
      false,
    );
    expect(isMapImageOwnedLayer(null)).toBe(false);
  });

  test("getRegionYearOpacityTarget redirects sublayers to their MapImage parent", () => {
    const sub = makeLayer({ type: "sublayer", parent: root });
    expect(getRegionYearOpacityTarget(sub)).toBe(root);
    const lone = makeLayer({ type: "sublayer" });
    expect(getRegionYearOpacityTarget(lone)).toBe(lone);
    const fl = makeLayer({ type: "feature" });
    expect(getRegionYearOpacityTarget(fl)).toBe(fl);
  });
});

describe("tree walking and mutation helpers", () => {
  test("childSublayers / collectLiveSublayers flatten nested sublayers depth-first", () => {
    const c = makeLayer({ id: "c" });
    const b = makeLayer({ id: "b", sublayers: collection([c]) });
    const a = makeLayer({ id: "a" });
    const root = makeLayer({ sublayers: collection([a, b]) });
    expect(childSublayers(root)).toEqual([a, b]);
    expect(collectLiveSublayers(root).map((l) => l.id)).toEqual(["a", "b", "c"]);
    expect(collectLiveSublayers(null)).toEqual([]);
  });

  test("clearFieldLayerScaleLimits resets non-zero scales", () => {
    const layer = makeLayer({ minScale: 100000, maxScale: 500 });
    clearFieldLayerScaleLimits(layer);
    expect(layer.minScale).toBe(0);
    expect(layer.maxScale).toBe(0);
    expect(() => clearFieldLayerScaleLimits(null)).not.toThrow();
  });

  test("clearScaleLimitsOnRegionYearTree clears leaf, parent, siblings and children", () => {
    const sibling = makeLayer({ minScale: 1 });
    const child = makeLayer({ minScale: 2 });
    const parent = makeLayer({ type: "map-image", minScale: 3 });
    const leaf = makeLayer({ minScale: 4, parent, sublayers: collection([child]) });
    parent.allSublayers = collection([leaf, sibling]);
    clearScaleLimitsOnRegionYearTree(leaf);
    expect([leaf, parent, sibling, child].map((l) => l.minScale)).toEqual([0, 0, 0, 0]);
  });

  test("safeLoadMapLayer skips groups, reports load success and failure", async () => {
    expect(await safeLoadMapLayer(null)).toBe(false);
    expect(await safeLoadMapLayer(makeLayer({ type: "group" }))).toBe(false);
    expect(await safeLoadMapLayer(makeLayer())).toBe(false);
    expect(await safeLoadMapLayer(makeLayer({ loaded: true, load: jest.fn() }))).toBe(true);
    const load = jest.fn(() => Promise.resolve());
    expect(await safeLoadMapLayer(makeLayer({ load }))).toBe(true);
    expect(load).toHaveBeenCalled();
    expect(await safeLoadMapLayer(makeLayer({ load: () => Promise.reject(new Error("x")) }))).toBe(
      false,
    );
  });

  test("disableLayerPbf only touches layers that own pbfEnabled", () => {
    const withPbf = makeLayer({ pbfEnabled: true });
    disableLayerPbf(withPbf);
    expect(withPbf.pbfEnabled).toBe(false);
    const without = makeLayer();
    disableLayerPbf(without);
    expect("pbfEnabled" in without).toBe(false);
  });

  test("refreshRegionYearMapExports refreshes each MapImage parent once", () => {
    const refresh = jest.fn();
    const parent = makeLayer({ type: "map-image", refresh });
    const a = makeLayer({ parent });
    const b = makeLayer({ parent });
    const throwing = makeLayer({
      refresh: () => {
        throw new Error("removed");
      },
    });
    refreshRegionYearMapExports([
      { layer: a, sublayers: [] },
      { layer: b, sublayers: [] },
      { layer: throwing, sublayers: [] },
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe("extractMapLayerIdFromDsId", () => {
  test("returns null when the DS id has no layer suffix", () => {
    expect(extractMapLayerIdFromDsId("dataSource_1")).toBeNull();
    expect(extractMapLayerIdFromDsId("")).toBeNull();
  });

  // Fixed bug (layer-tree.ts:31): the regex is /([0-9a-f]+-layer-d+)$/i — "d+" is a
  // literal "d", not "\d+", so real ExB child ids like "...-18c2f-layer-3"
  // never match and PopupPanel loses its layer-id hint.
  test("extracts the map layer id suffix from an ExB child DS id", () => {
    expect(extractMapLayerIdFromDsId("dataSource_1-18c2f3a4b5d-layer-3")).toBe(
      "18c2f3a4b5d-layer-3",
    );
  });
});

describe("summarizeDefinitionExpression", () => {
  test("passes short expressions through and nulls through", () => {
    expect(summarizeDefinitionExpression(null)).toBeNull();
    expect(summarizeDefinitionExpression("a=1")).toBe("a=1");
  });

  test("truncates long uniqueid IN lists with a summary", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `'id-${i}'`).join(",");
    const expr = `uniqueid IN (${ids})`;
    const summary = summarizeDefinitionExpression(expr) ?? "";
    expect(summary).toContain(`truncated ${expr.length} chars`);
    expect(summary).toContain("uniqueidInClauses=1");
    expect(summary).toContain("quotedValues≈60");
  });
});

describe("guardSublayerDefinitionExpression", () => {
  test("restores the expected expression when it drifts and tracks updates", () => {
    let watcher: ((value: unknown) => void) | null = null;
    const sub = makeLayer({
      definitionExpression: "a=1",
      watch: (_path, cb) => {
        watcher = cb;
        return { remove: jest.fn() };
      },
    });
    guardSublayerDefinitionExpression(sub, "a=1");
    sub.definitionExpression = "1=1";
    watcher?.("1=1");
    expect(sub.definitionExpression).toBe("a=1");

    guardSublayerDefinitionExpression(sub, "b=2");
    sub.definitionExpression = null;
    watcher?.(null);
    expect(sub.definitionExpression).toBe("b=2");

    sub.definitionExpression = "b=2";
    watcher?.("b=2");
    expect(sub.definitionExpression).toBe("b=2");
  });

  test("does not throw for layers without watch support", () => {
    expect(() => guardSublayerDefinitionExpression(makeLayer(), "x")).not.toThrow();
  });
});
