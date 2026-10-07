jest.mock("../../../../../gis/feature-layer-data", () => ({
  getDetachedQueryLayerFor: jest.fn(() => Promise.resolve(null)),
  getMapImageParentLayer: jest.fn(() => null),
  isMapImageGroupSublayer: jest.fn((l: { isGroup?: boolean } | null) => Boolean(l?.isGroup)),
  isMapImageOwnedLayer: jest.fn((l: { owned?: boolean } | null) => Boolean(l?.owned)),
  safeLoadMapLayer: jest.fn(() => Promise.resolve()),
}));

import {
  getDetachedQueryLayerFor,
  getMapImageParentLayer,
  safeLoadMapLayer,
  type ShownRegionYearLayer,
} from "../../../../../gis/feature-layer-data";
import type { AgriMapLayer } from "../../../../localization/agri-map-layer";
import type { CropRendererJson } from "../../../../localization/crop-renderer";
import { makeFakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import {
  applyCropRenderer,
  applyInstantCropPaletteNoRefresh,
  getCropRendererTargetLayers,
  queryDistinctCropValues,
  refreshCropLayer,
  resetCropRenderer,
  syncCropRenderer,
} from "./crop-renderer-service";

type TestLayer = AgriMapLayer & {
  isGroup?: boolean;
  owned?: boolean;
  queryFeatures?: jest.Mock;
  refresh?: jest.Mock;
};

const collection = <T,>(items: T[]): { toArray: () => T[] } => ({ toArray: () => items });

const mkLayer = (props: Partial<TestLayer> = {}): TestLayer =>
  ({ id: Math.random(), title: "L", visible: true, definitionExpression: "1=1", refresh: jest.fn(), ...props }) as TestLayer;

const shown = (layer: TestLayer | null, sublayers: TestLayer[] = []): ShownRegionYearLayer =>
  ({ layer, sublayers }) as unknown as ShownRegionYearLayer;

const rendererOf = (layer: TestLayer): CropRendererJson => layer.renderer as CropRendererJson;

describe("crop-renderer-service", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getCropRendererTargetLayers", () => {
    test("collects entry + live sublayers, dedupes and drops hidden/group/blocked", () => {
      const a = mkLayer();
      const hidden = mkLayer({ visible: false });
      const group = mkLayer({ isGroup: true });
      const blocked = mkLayer({ definitionExpression: "1=0" });
      const live = mkLayer();
      const parent = mkLayer({ allSublayers: collection([live, hidden, group]) } as Partial<TestLayer>);
      const leaf = mkLayer();
      const host = makeFakeHost({
        _lastShownRegionYearLayers: [shown(parent, [a, a, blocked]), shown(leaf), shown(null)],
      });
      expect(getCropRendererTargetLayers(host)).toEqual([a, live, leaf]);
    });
  });

  describe("queryDistinctCropValues", () => {
    const keyHost = (init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({ cropDistinctCacheKey: (_l, f, w) => `${f}|${w}`, ...init });

    test("returns cached values", async () => {
      const host = keyHost();
      host._cropDistinctValueCache.set("turi|w", ["Paxta"]);
      await expect(queryDistinctCropValues(host, mkLayer(), "turi", "w")).resolves.toEqual(["Paxta"]);
    });

    test("groupBy query on the detached layer, deduped and cached", async () => {
      const queryFeatures = jest.fn((_query: __esri.QueryProperties) =>
        Promise.resolve({ features: [{ attributes: { turi: "Paxta" } }, { attributes: { turi: "Paxta" } }, { attributes: { turi: " " } }, { attributes: {} }] }),
      );
      const detached = { createQuery: () => ({}), queryFeatures };
      jest.mocked(getDetachedQueryLayerFor).mockResolvedValueOnce(detached as unknown as __esri.FeatureLayer);
      const host = keyHost();
      const values = await queryDistinctCropValues(host, mkLayer(), "turi", "");
      expect(values).toEqual(["Paxta"]);
      const q = queryFeatures.mock.calls[0][0] as __esri.QueryProperties;
      expect(q.where).toBe("1=1");
      expect(q.groupByFieldsForStatistics).toEqual(["turi"]);
      expect(host._cropDistinctValueCache.get("turi|")).toEqual(["Paxta"]);
    });

    test("falls back to returnDistinctValues, then to empty", async () => {
      const queryFeatures = jest
        .fn()
        .mockRejectedValueOnce(new Error("no stats"))
        .mockResolvedValueOnce({ features: [{ attributes: { turi: "Bug'doy" } }] });
      const layer = mkLayer({ queryFeatures } as Partial<TestLayer>);
      await expect(queryDistinctCropValues(keyHost(), layer, "turi", "x")).resolves.toEqual(["Bug'doy"]);
      expect((queryFeatures.mock.calls[1][0] as __esri.QueryProperties).returnDistinctValues).toBe(true);

      const failing = mkLayer({ queryFeatures: jest.fn(() => Promise.reject(new Error("x"))) } as Partial<TestLayer>);
      await expect(queryDistinctCropValues(keyHost(), failing, "turi", "y")).resolves.toEqual([]);
    });
  });

  describe("refreshCropLayer", () => {
    test("refreshes MapImage parent instead of the leaf", () => {
      const parentRefresh = jest.fn();
      jest.mocked(getMapImageParentLayer).mockReturnValueOnce({ refresh: parentRefresh } as unknown as __esri.MapImageLayer);
      const leaf = mkLayer({ owned: true });
      refreshCropLayer(makeFakeHost(), leaf);
      expect(parentRefresh).toHaveBeenCalled();
      expect(leaf.refresh).not.toHaveBeenCalled();
    });

    test("refreshes plain layers and swallows errors", () => {
      const layer = mkLayer();
      refreshCropLayer(makeFakeHost(), layer);
      expect(layer.refresh).toHaveBeenCalled();
      const broken = mkLayer({ refresh: jest.fn(() => { throw new Error("x"); }) });
      expect(() => refreshCropLayer(makeFakeHost(), broken)).not.toThrow();
    });
  });

  test("resetCropRenderer restores original renderers", () => {
    const original = { type: "simple" } as unknown as __esri.Renderer;
    const target = mkLayer({ renderer: null });
    const old = mkLayer();
    const refresh = jest.fn();
    const host = makeFakeHost({ getCropRendererTargetLayers: () => [target], refreshCropLayer: refresh });
    host._originalLayerRenderers.set(target, original);
    host._cropRenderedLayers.add(old);
    host._cropDistinctValueCache.set("k", []);
    resetCropRenderer(host);
    expect(host._cropRendererRequestId).toBe(1);
    expect(target.renderer).toBe(original);
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(host._cropRenderedLayers.size).toBe(0);
    expect(host._cropDistinctValueCache.size).toBe(0);
  });

  describe("applyCropRenderer", () => {
    const applyHost = (layers: TestLayer[], init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({
        state: { cropRendererMode: "on" },
        _cropRendererRequestId: 1,
        getCropRendererTargetLayers: () => layers,
        findLayerFieldName: (_l, n) => (n === "turi" ? "TURI" : null),
        refreshCropLayer: jest.fn(),
        queryDistinctCropValues: jest.fn(() => Promise.resolve(["Paxta"])),
        buildCropUniqueValueInfosFromValues: (field, values) =>
          values.map((v) => ({ value: v, label: v, symbol: { type: "simple-fill", color: [0, 0, 0, 1], outline: { color: [0, 0, 0, 1], width: 1 } } })),
        ...init,
      });

    test("skips without shown layers", async () => {
      const host = applyHost([]);
      await applyCropRenderer(host, 1);
      expect(jest.mocked(host.refreshCropLayer)).not.toHaveBeenCalled();
    });

    test("paints a unique-value renderer from distinct values", async () => {
      const layer = mkLayer({ loaded: false } as Partial<TestLayer>);
      const host = applyHost([layer]);
      await applyCropRenderer(host, 1);
      expect(jest.mocked(safeLoadMapLayer)).toHaveBeenCalledWith(layer);
      const r = rendererOf(layer);
      expect(r.type).toBe("unique-value");
      expect(r.type === "unique-value" && r.field).toBe("TURI");
      expect(host._cropRenderedLayers.has(layer)).toBe(true);
      expect(host._originalLayerRenderers.has(layer)).toBe(true);
    });

    test("single selected crop paints a simple renderer", async () => {
      const layer = mkLayer({ loaded: true } as Partial<TestLayer>);
      const host = applyHost([layer], { getSelectedTurlar: () => ["Paxta"] });
      await applyCropRenderer(host, 1);
      expect(rendererOf(layer).type).toBe("simple");
      expect(jest.mocked(host.queryDistinctCropValues)).not.toHaveBeenCalled();
    });

    test("skips layers without a crop field or distinct values", async () => {
      const noField = mkLayer({ loaded: true, fields: [{ name: "x" }] } as Partial<TestLayer>);
      const noValues = mkLayer({ loaded: true, owned: true });
      const host = applyHost([noField, noValues], {
        findLayerFieldName: () => null,
        queryDistinctCropValues: jest.fn(() => Promise.resolve([])),
      });
      await applyCropRenderer(host, 1);
      expect(noField.renderer).toBeUndefined();
      expect(noValues.renderer).toBeUndefined();
      expect(jest.mocked(host.queryDistinctCropValues)).toHaveBeenCalledWith(noValues, "turi", "1=1");
    });

    test("stops when request is superseded and survives per-layer errors", async () => {
      const layer = mkLayer({ loaded: true } as Partial<TestLayer>);
      const stale = applyHost([layer]);
      await applyCropRenderer(stale, 99);
      expect(layer.renderer).toBeUndefined();

      jest.mocked(safeLoadMapLayer).mockRejectedValueOnce(new Error("load"));
      const failing = mkLayer({ loaded: false } as Partial<TestLayer>);
      const host = applyHost([failing], { queryDistinctCropValues: jest.fn(() => Promise.reject(new Error("q"))) });
      await expect(applyCropRenderer(host, 1)).resolves.toBeUndefined();
    });
  });

  test("syncCropRenderer bumps the request id", async () => {
    const apply = jest.fn(() => Promise.resolve());
    const host = makeFakeHost({ applyCropRenderer: apply, _cropRendererRequestId: 4 });
    await syncCropRenderer(host);
    expect(apply).toHaveBeenCalledWith(5);
  });

  describe("applyInstantCropPaletteNoRefresh", () => {
    test("paints palette on shown layers", () => {
      const layer = mkLayer();
      const host = makeFakeHost({
        state: { cropRendererMode: "on" },
        getCropRendererTargetLayers: () => [layer],
        findLayerFieldName: () => null,
      });
      applyInstantCropPaletteNoRefresh(host);
      const r = rendererOf(layer);
      expect(r.type === "unique-value" && r.field).toBe("turi");
      expect(r.type === "unique-value" && r.uniqueValueInfos.length).toBeGreaterThan(0);
      expect(host._cropRenderedLayers.has(layer)).toBe(true);
      expect(layer.refresh).not.toHaveBeenCalled();
    });

    test("skips when off, VH active or no layers", () => {
      const layer = mkLayer();
      const get = jest.fn(() => [layer]);
      applyInstantCropPaletteNoRefresh(makeFakeHost({ state: { cropRendererMode: "off" }, getCropRendererTargetLayers: get }));
      applyInstantCropPaletteNoRefresh(makeFakeHost({ state: { cropRendererMode: "on", vh: "4-Past" }, getCropRendererTargetLayers: get }));
      expect(get).not.toHaveBeenCalled();
      applyInstantCropPaletteNoRefresh(makeFakeHost({ state: { cropRendererMode: "on" }, getCropRendererTargetLayers: () => [] }));
      expect(layer.renderer).toBeUndefined();
    });
  });
});
