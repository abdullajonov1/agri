jest.mock("../../../../../gis/feature-layer-data", () => ({
  preloadRegionYearMapImages: jest.fn(() => Promise.resolve(2)),
  refreshRegionYearMapExports: jest.fn(),
  syncRegionYearLayerVisibility: jest.fn(() => []),
  unlockShownRegionYearFieldScales: jest.fn(),
}));

import {
  preloadRegionYearMapImages,
  refreshRegionYearMapExports,
  syncRegionYearLayerVisibility,
  unlockShownRegionYearFieldScales,
  type ShownRegionYearLayer,
} from "../../../../../gis/feature-layer-data";
import type { JimuMapView } from "jimu-arcgis";
import { makeFakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import {
  buildWhereForLayer,
  clearRegionYearSettleRepaintTimers,
  repaintShownRegionYearLayers,
  scheduleShownRegionYearSettleRepaint,
  setShownRegionYearOpacity,
  syncShownRegionYearLayers,
  waitForShownRegionYearRedraw,
  warmYearRegionMapImages,
} from "./region-year-layers";

const MAP = { id: "map" } as unknown as __esri.Map;

interface FakeLayer {
  type?: string;
  opacity?: number;
  parent?: FakeLayer | null;
  refresh?: jest.Mock;
}

const mapView = (extra: Record<string, unknown> = {}): JimuMapView =>
  ({ view: { map: MAP, scale: 5000, ...extra } }) as unknown as JimuMapView;

const entry = (layer: FakeLayer): ShownRegionYearLayer =>
  ({ layer, sublayers: [] }) as unknown as ShownRegionYearLayer;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 4; i += 1) await Promise.resolve();
};

describe("region-year-layers", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("warmYearRegionMapImages", () => {
    test("preloads the selected region for the year", async () => {
      const host = makeFakeHost({
        state: { activeMapView: mapView(), yil: " 2025 " },
        getEffectiveViloyat: () => "Andijon",
      });
      warmYearRegionMapImages(host);
      await flush();
      expect(jest.mocked(preloadRegionYearMapImages)).toHaveBeenCalledWith(MAP, "2025", "Andijon");
    });

    test("skips without map, year or region", () => {
      warmYearRegionMapImages(makeFakeHost({ state: { yil: "2025" }, getEffectiveViloyat: () => "A" }));
      warmYearRegionMapImages(makeFakeHost({ state: { activeMapView: mapView() }, getEffectiveViloyat: () => "A" }));
      warmYearRegionMapImages(makeFakeHost({ state: { activeMapView: mapView(), yil: "2025" }, getEffectiveViloyat: () => "" }));
      expect(jest.mocked(preloadRegionYearMapImages)).not.toHaveBeenCalled();
    });

    test("handles zero loaded layers", async () => {
      jest.mocked(preloadRegionYearMapImages).mockResolvedValueOnce(0);
      const host = makeFakeHost({ state: { activeMapView: mapView(), yil: "2025" }, getEffectiveViloyat: () => "A" });
      warmYearRegionMapImages(host);
      await flush();
      expect(jest.mocked(preloadRegionYearMapImages)).toHaveBeenCalledTimes(1);
    });
  });

  test("setShownRegionYearOpacity also sets the MapImage parent opacity", () => {
    const service: FakeLayer = { type: "map-image", opacity: 1, parent: null };
    const group: FakeLayer = { type: "group", parent: service };
    const sub: FakeLayer = { type: "sublayer", opacity: 1, parent: group };
    const plain: FakeLayer = { type: "feature", opacity: 1 };
    const host = makeFakeHost({
      _lastShownRegionYearLayers: [entry(sub), entry(plain), { layer: null } as unknown as ShownRegionYearLayer],
    });
    setShownRegionYearOpacity(host, 0);
    expect(sub.opacity).toBe(0);
    expect(service.opacity).toBe(0);
    expect(plain.opacity).toBe(0);
  });

  test("clearRegionYearSettleRepaintTimers clears all timers", () => {
    const clear = jest.spyOn(global, "clearTimeout");
    const t1 = setTimeout(() => undefined, 1000);
    const host = makeFakeHost({ _regionYearSettleRepaintTimers: [t1] });
    clearRegionYearSettleRepaintTimers(host);
    expect(clear).toHaveBeenCalledWith(t1);
    expect(host._regionYearSettleRepaintTimers).toEqual([]);
    clear.mockRestore();
  });

  describe("repaintShownRegionYearLayers", () => {
    test("re-syncs, restores opacity and refreshes exports", () => {
      const faded: FakeLayer = { opacity: 0 };
      const shown = [entry(faded)];
      const host = makeFakeHost({
        state: { activeMapView: mapView(), yil: "2025" },
        getEffectiveViloyat: () => "A",
        syncShownRegionYearLayers: () => shown,
      });
      repaintShownRegionYearLayers(host, "phase");
      expect(host._lastShownRegionYearLayers).toBe(shown);
      expect(faded.opacity).toBe(1);
      expect(jest.mocked(unlockShownRegionYearFieldScales)).toHaveBeenCalledWith(shown);
      expect(jest.mocked(refreshRegionYearMapExports)).toHaveBeenCalledWith(shown);
    });

    test("skips when unmounted or no geography and survives sync errors", () => {
      const sync = jest.fn(() => {
        throw new Error("sync failed");
      });
      repaintShownRegionYearLayers(makeFakeHost({ _isMounted: false, syncShownRegionYearLayers: sync }), "p");
      repaintShownRegionYearLayers(
        makeFakeHost({ state: { activeMapView: mapView(), yil: "2025" }, getEffectiveViloyat: () => "", syncShownRegionYearLayers: sync }),
        "p",
      );
      expect(sync).not.toHaveBeenCalled();
      const host = makeFakeHost({
        state: { activeMapView: mapView(), yil: "2025" },
        getEffectiveViloyat: () => "A",
        syncShownRegionYearLayers: sync,
      });
      expect(() => repaintShownRegionYearLayers(host, "p")).not.toThrow();
      expect(jest.mocked(refreshRegionYearMapExports)).not.toHaveBeenCalled();
    });
  });

  test("scheduleShownRegionYearSettleRepaint runs twice for the current zoom only", () => {
    jest.useFakeTimers();
    const repaint = jest.fn();
    const host = makeFakeHost({
      _zoomRequestId: 3,
      clearRegionYearSettleRepaintTimers: jest.fn(),
      repaintShownRegionYearLayers: repaint,
    });
    scheduleShownRegionYearSettleRepaint(host, 3, -50, "goto");
    jest.advanceTimersByTime(0);
    expect(repaint).toHaveBeenCalledWith("goto");
    jest.advanceTimersByTime(400);
    expect(repaint).toHaveBeenCalledWith("goto:retry");

    repaint.mockClear();
    scheduleShownRegionYearSettleRepaint(host, 2, 10, "old");
    jest.advanceTimersByTime(1000);
    expect(repaint).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  describe("waitForShownRegionYearRedraw", () => {
    test("returns immediately without a view", async () => {
      await expect(waitForShownRegionYearRedraw(makeFakeHost())).resolves.toBeUndefined();
    });

    test("refreshes and resolves when updating flips true then false", async () => {
      let watcher: (updating: boolean) => void = () => undefined;
      const remove = jest.fn();
      const layerView = {
        updating: false,
        watch: (_p: string, cb: (u: boolean) => void) => {
          watcher = cb;
          return { remove };
        },
      };
      const layer: FakeLayer = { refresh: jest.fn() };
      const host = makeFakeHost({
        state: { activeMapView: mapView({ whenLayerView: () => Promise.resolve(layerView) }) },
        _lastShownRegionYearLayers: [entry(layer), { layer: null } as unknown as ShownRegionYearLayer],
      });
      const pending = waitForShownRegionYearRedraw(host);
      await flush();
      watcher(true);
      watcher(false);
      await pending;
      expect(layer.refresh).toHaveBeenCalled();
      expect(remove).toHaveBeenCalled();
    });

    test("times out when updating never flips and tolerates layerView errors", async () => {
      jest.useFakeTimers();
      const layer: FakeLayer = { refresh: jest.fn(() => { throw new Error("x"); }) };
      const broken: FakeLayer = {};
      const host = makeFakeHost({
        state: {
          activeMapView: mapView({
            whenLayerView: (l: FakeLayer) => (l === broken ? Promise.reject(new Error("no lv")) : Promise.resolve({ updating: false })),
          }),
        },
        _lastShownRegionYearLayers: [entry(layer), entry(broken)],
      });
      const pending = waitForShownRegionYearRedraw(host, false);
      await flush();
      jest.advanceTimersByTime(900);
      await pending;
      expect(layer.refresh).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe("buildWhereForLayer", () => {
    const layer = {} as __esri.FeatureLayer;
    const whereHost = (init: FakeHostInit): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({
        buildWhereClause: () => "yil = 2025",
        getEffectiveViloyat: () => "A",
        getLayerMatchStateForViloyat: () => "match",
        buildViloyatRegionClause: () => "region = 1",
        ...init,
      });

    test("blocked base where stays blocked", () => {
      expect(buildWhereForLayer(whereHost({ buildWhereClause: () => "1=0" }), layer)).toBe("1=0");
      expect(buildWhereForLayer(whereHost({ buildWhereClause: () => "" }), layer)).toBe("1=0");
    });

    test("without region only stats see the republic", () => {
      const host = whereHost({ getEffectiveViloyat: () => "" });
      expect(buildWhereForLayer(host, layer)).toBe("1=0");
      expect(buildWhereForLayer(host, layer, false, true, true)).toBe("yil = 2025");
    });

    test("routes by layer/viloyat match state", () => {
      expect(buildWhereForLayer(whereHost({}), layer)).toBe("yil = 2025");
      expect(buildWhereForLayer(whereHost({ getLayerMatchStateForViloyat: () => "mismatch" }), layer)).toBe("1=0");
      expect(buildWhereForLayer(whereHost({ getLayerMatchStateForViloyat: () => "unknown" }), layer)).toBe(
        "(yil = 2025) AND (region = 1)",
      );
      expect(
        buildWhereForLayer(whereHost({ getLayerMatchStateForViloyat: () => "unknown", buildViloyatRegionClause: () => "" }), layer),
      ).toBe("1=0");
    });
  });

  describe("syncShownRegionYearLayers", () => {
    type SyncOpts = { uniqueIds: string[] | null; vh: string; andTuriWithUniqueIds: boolean; districtCode: number | null };
    const lastOpts = (): SyncOpts => jest.mocked(syncRegionYearLayerVisibility).mock.calls[0][1] as SyncOpts;
    const syncHost = (init: FakeHostInit): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({
        getEffectiveViloyat: () => "A",
        getAdminBoundarySelection: () => ({ viloyat: "A", tuman: "" }),
        ...init,
      });

    test("VH ids drive the map; turi ANDed when not crop-scoped", () => {
      const host = syncHost({
        state: { vh: "2-Yaxshi", yil: "2025" },
        _vhMapUniqueIds: ["a"],
        getSelectedTurlar: () => ["Paxta"],
        getAdminBoundarySelection: () => ({ viloyat: "A", tuman: "T", districtCode: 17 }),
      });
      syncShownRegionYearLayers(host, MAP);
      expect(lastOpts()).toMatchObject({ uniqueIds: ["a"], vh: "", andTuriWithUniqueIds: true, districtCode: 17 });
    });

    test("falls back to legacy vh attribute without ids", () => {
      syncShownRegionYearLayers(syncHost({ state: { vh: "4-Past" } }), MAP);
      expect(lastOpts()).toMatchObject({ uniqueIds: null, vh: "4-Past", districtCode: null });
    });

    test("deferred paint ignores VH ids and legacy vh", () => {
      syncShownRegionYearLayers(syncHost({ state: { vh: "4-Past" }, _vhMapUniqueIds: ["a"], _suppressLegacyVhOnMap: true }), MAP);
      expect(lastOpts()).toMatchObject({ uniqueIds: null, vh: "" });
    });

    test("intersects STIR ids with VH ids", () => {
      syncShownRegionYearLayers(
        syncHost({
          state: { vh: "2-Yaxshi", selectedFarmerInn: "1" },
          _vhMapUniqueIds: ["{ABC}", "d"],
          _farmerMapUniqueIds: ["abc", "x"],
        }),
        MAP,
      );
      expect(lastOpts().uniqueIds).toEqual(["abc"]);
    });

    test("STIR ids alone are used as-is", () => {
      syncShownRegionYearLayers(syncHost({ state: { selectedFarmerInn: "1" }, _farmerMapUniqueIds: ["x"] }), MAP);
      expect(lastOpts()).toMatchObject({ uniqueIds: ["x"], vh: "" });
    });
  });
});
