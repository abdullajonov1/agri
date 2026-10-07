jest.mock("../../../../../localization/map-where-clauses", () => ({
  buildNdviTableWhereWithRegion: jest.fn(() => "NDVI_WHERE"),
}));
jest.mock("../../../../../../gis/feature-layer-data", () => ({
  ensureRegionYearMapImagesReady: jest.fn(() => Promise.resolve({ timedOut: false, preload: Promise.resolve() })),
  unlockShownRegionYearFieldScales: jest.fn(),
  refreshRegionYearMapExports: jest.fn(),
  isMapImageOwnedLayer: jest.fn((l: { owned?: boolean } | null) => Boolean(l?.owned)),
  getDetachedQueryLayerFor: jest.fn(),
}));
jest.mock("../../../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataUrl: jest.fn(() => "https://x/Agri_table_data/FeatureServer/0"),
  buildSpatialJoinWhere: jest.fn((ids: string[]) => (ids.length ? `uniqueid IN (${ids.join(",")})` : "1=0")),
  queryAgriUniqueIdsForWhere: jest.fn(() => Promise.resolve(["a", "b"])),
}));

import { buildNdviTableWhereWithRegion } from "../../../../../localization/map-where-clauses";
import {
  ensureRegionYearMapImagesReady,
  getDetachedQueryLayerFor,
  refreshRegionYearMapExports,
  type ShownRegionYearLayer,
} from "../../../../../../gis/feature-layer-data";
import { queryAgriUniqueIdsForWhere } from "../../../../../../gis/agri-table-data-source";
import type { JimuMapView } from "jimu-arcgis";
import { makeFakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import {
  applyFiltersPersistent,
  buildTableWhereWithRegion,
  getPolygonAreasWithCurrentFilter,
  setMapNoData,
  zoomToSelectedDistrict,
} from "./map-filter-helpers";

type Attrs = Record<string, unknown>;
interface FakeQuery { where?: string; outFields?: string[] }

const flush = async (): Promise<void> => {
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
};

/** Paged FeatureLayer double: serves `pages` in order. */
const pagedLayer = (pages: Attrs[][], extra: Record<string, unknown> = {}): { layer: __esri.FeatureLayer; queries: FakeQuery[] } => {
  const queries: FakeQuery[] = [];
  let i = 0;
  const layer = {
    url: "https://x/FeatureServer/0",
    objectIdField: "objectid",
    createQuery: (): FakeQuery => {
      const q: FakeQuery = {};
      queries.push(q);
      return q;
    },
    queryFeatures: jest.fn(() => Promise.resolve({ features: (pages[i++] || []).map((attributes) => ({ attributes })) })),
    ...extra,
  } as unknown as __esri.FeatureLayer;
  return { layer, queries };
};

describe("map-filter-helpers", () => {
  beforeEach(() => jest.clearAllMocks());

  test("setMapNoData dispatches the overlay event", () => {
    const listener = jest.fn();
    document.addEventListener("agriMapNoData", listener);
    setMapNoData(makeFakeHost(), true, "empty");
    const detail = (listener.mock.calls[0][0] as CustomEvent<{ noData: boolean; reason: string }>).detail;
    expect(detail).toMatchObject({ noData: true, reason: "empty" });
    document.removeEventListener("agriMapNoData", listener);
  });

  test("buildTableWhereWithRegion forwards host state and helpers", () => {
    const host = makeFakeHost({
      state: { yil: "2025", viloyat: "A", tuman: "T", lockedViloyat: "L" },
      _viloyatToRegion: { a: 1 },
      buildTurlarClause: () => "turi = 'Paxta'",
    });
    expect(buildTableWhereWithRegion(host, "date", "2025-06-01", ["date"])).toBe("NDVI_WHERE");
    const args = jest.mocked(buildNdviTableWhereWithRegion).mock.calls[0][0];
    expect(args).toMatchObject({ dateField: "date", ndviDate: "2025-06-01", yil: "2025", viloyat: "A", tuman: "T", lockedViloyat: "L", cropClause: "turi = 'Paxta'" });
    expect(args.normalizeApos(" x ")).toBe("x");
  });

  describe("getPolygonAreasWithCurrentFilter", () => {
    const areaHost = (layer: __esri.FeatureLayer | undefined, init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({
        state: { featureLayers: layer ? [layer] : [], viloyat: "A" },
        buildWhereClause: () => "yil = 2025",
        findLayerFieldName: () => null,
        ...init,
      });

    test("returns empty without layer or with a blocked where", async () => {
      await expect(getPolygonAreasWithCurrentFilter(areaHost(undefined))).resolves.toEqual(new Map());
      const { layer } = pagedLayer([]);
      await expect(getPolygonAreasWithCurrentFilter(areaHost(layer, { buildWhereClause: () => "1=0" }))).resolves.toEqual(new Map());
    });

    test("pages by objectid, keeps max area per normalized id and caches", async () => {
      const page1: Attrs[] = Array.from({ length: 2000 }, (_v, i) => ({ objectid: i + 1, uniqueid: `{ID${i % 3}}`, maydon: i % 3 }));
      page1.push({ objectid: 0, uniqueid: "", maydon: 5 });
      const page2: Attrs[] = [
        { objectid: 2001, uniqueid: "{ID0}", maydon: 99 },
        { objectid: 2002, uniqueid: "neg", maydon: -1 },
      ];
      const { layer, queries } = pagedLayer([page1, page2]);
      const host = areaHost(layer, { getSelectedTurlar: () => [] });
      const areas = await getPolygonAreasWithCurrentFilter(host, { includeTuri: true });
      expect(areas.get("id0")).toBe(99);
      expect(areas.get("id1")).toBe(1);
      expect(areas.has("neg")).toBe(false);
      expect(queries[1].where).toBe("(yil = 2025) AND objectid > 2000");
      expect(queries[0].outFields).toEqual(["objectid", "uniqueid", "maydon"]);
      const again = await getPolygonAreasWithCurrentFilter(host, { includeTuri: true });
      expect(again).toBe(areas);
      expect(jest.mocked(layer.queryFeatures)).toHaveBeenCalledTimes(2);
    });

    test("uses configured join/area fields and evicts old cache entries", async () => {
      const { layer } = pagedLayer([[{ objectid: 1, gid: "X", area_ha: 3 }]]);
      const host = areaHost(layer, {
        props: { config: { polygonJoinField: "gid", indicator: { attributeField: "area_ha" } } },
      });
      for (let i = 0; i < 6; i += 1) host._polygonAreaQueryCache.set(`old${i}`, Promise.resolve(new Map()));
      const areas = await getPolygonAreasWithCurrentFilter(host);
      expect(areas.get("x")).toBe(3);
      expect(host._polygonAreaQueryCache.has("old0")).toBe(false);
      expect(host._polygonAreaQueryCache.size).toBe(6);
    });

    test("throws and uncaches when pagination stalls", async () => {
      const page: Attrs[] = Array.from({ length: 2000 }, () => ({ objectid: "x", uniqueid: "a", maydon: 1 }));
      const { layer } = pagedLayer([page]);
      const host = areaHost(layer);
      await expect(getPolygonAreasWithCurrentFilter(host)).rejects.toThrow("did not advance");
      expect(host._polygonAreaQueryCache.size).toBe(0);
    });
  });

  describe("applyFiltersPersistent", () => {
    const fl = (extra: Record<string, unknown> = {}): __esri.FeatureLayer =>
      ({ url: "https://x/Agri_table_data/FeatureServer/0", title: "T", definitionExpression: "", ...extra }) as unknown as __esri.FeatureLayer;

    const applyHost = (init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({
        resolveVhMapUniqueIds: jest.fn(() => Promise.resolve(null)),
        getEffectiveViloyat: () => "A",
        syncShownRegionYearLayers: jest.fn(() => [] as ShownRegionYearLayer[]),
        applyInstantCropPaletteNoRefresh: jest.fn(),
        buildWhereForLayer: () => "yil = 2025",
        buildNdviStatusClauseForCurrentVh: () => "",
        buildNdviDateClauseWithoutVh: () => "",
        getLayerKey: () => "k",
        getLayerMatchStateForViloyat: () => "match",
        ...init,
        state: { connectionStatus: "connected", ...init.state },
      });

    test("does nothing unless mounted and connected", async () => {
      const host = applyHost({ state: { connectionStatus: "idle" } });
      await applyFiltersPersistent(host);
      expect(jest.mocked(host.resolveVhMapUniqueIds)).not.toHaveBeenCalled();
    });

    test("ready-clear and defer-suppress VH phases skip resolve", async () => {
      const ready = applyHost({ _vhUniqueIdsReadyForApply: true, _suppressLegacyVhOnMap: true });
      await applyFiltersPersistent(ready);
      expect(ready._vhUniqueIdsReadyForApply).toBe(false);
      expect(ready._suppressLegacyVhOnMap).toBe(false);
      expect(jest.mocked(ready.resolveVhMapUniqueIds)).not.toHaveBeenCalled();
      const defer = applyHost({ _deferVhUniqueIdResolve: true });
      await applyFiltersPersistent(defer);
      expect(defer._suppressLegacyVhOnMap).toBe(true);
    });

    test("aborts after resolve when superseded", async () => {
      const host = applyHost({ state: { featureLayers: [fl()] } });
      await applyFiltersPersistent(host, () => false);
      expect(jest.mocked(host.resolveVhMapUniqueIds)).toHaveBeenCalled();
      expect(host._prevDefinitionExpression).toBeUndefined();
    });

    test("syncs region-year layers, applies DE and mirrors to spatial layers", async () => {
      const table = fl();
      const spatial = { definitionExpression: "1=1" } as unknown as __esri.FeatureLayer;
      const owned = { owned: true, definitionExpression: "keep" } as unknown as __esri.FeatureLayer;
      const map = { id: "m" };
      const host = applyHost({
        state: {
          yil: "2025",
          vh: "2-Yaxshi",
          activeMapView: { view: { map, scale: 1 } } as unknown as JimuMapView,
          featureLayers: [table],
          spatialMapLayers: [spatial, owned],
        },
        buildNdviStatusClauseForCurrentVh: () => "ndvi_status = 'yaxshi'",
      });
      await applyFiltersPersistent(host);
      expect(jest.mocked(ensureRegionYearMapImagesReady)).toHaveBeenCalledWith(map, "2025", "A", 2000);
      expect(jest.mocked(refreshRegionYearMapExports)).toHaveBeenCalled();
      expect(table.definitionExpression).toBe("(yil = 2025) AND (ndvi_status = 'yaxshi')");
      expect(jest.mocked(queryAgriUniqueIdsForWhere)).toHaveBeenCalledWith("(yil = 2025) AND (ndvi_status = 'yaxshi')");
      expect(spatial.definitionExpression).toBe("uniqueid IN (a,b)");
      expect(owned.definitionExpression).toBe("keep");
      expect(host._prevDefinitionExpression).toBe("(yil = 2025) AND (ndvi_status = 'yaxshi')");
    });

    test("timed-out ensure re-syncs after preload; deferred pass skips refresh", async () => {
      jest.mocked(ensureRegionYearMapImagesReady).mockResolvedValueOnce({ timedOut: true, preload: Promise.resolve(0) });
      const map = { id: "m" };
      const host = applyHost({ state: { yil: "2025", activeMapView: { view: { map } } as unknown as JimuMapView } });
      await applyFiltersPersistent(host);
      await flush();
      expect(jest.mocked(host.syncShownRegionYearLayers)).toHaveBeenCalledTimes(2);
      expect(jest.mocked(refreshRegionYearMapExports)).toHaveBeenCalledTimes(2);

      jest.clearAllMocks();
      const deferred = applyHost({ state: { activeMapView: { view: { map } } as unknown as JimuMapView } });
      await applyFiltersPersistent(deferred, undefined, { vhDeferredSecondPass: true });
      expect(jest.mocked(deferred.syncShownRegionYearLayers)).toHaveBeenCalledTimes(1);
      expect(jest.mocked(refreshRegionYearMapExports)).not.toHaveBeenCalled();
    });

    test("uniqueid query failure hides spatial layers; locked date clause applies", async () => {
      jest.mocked(queryAgriUniqueIdsForWhere).mockRejectedValueOnce(new Error("down"));
      const table = fl();
      const spatial = { definitionExpression: "1=1" } as unknown as __esri.FeatureLayer;
      const host = applyHost({
        state: { featureLayers: [table], spatialMapLayers: [spatial], ndviDateLocked: true },
        buildNdviDateClauseWithoutVh: () => "date = '2025-06-01'",
      });
      await applyFiltersPersistent(host);
      expect(table.definitionExpression).toBe("(yil = 2025) AND (date = '2025-06-01')");
      expect(spatial.definitionExpression).toBe("1=0");
    });

    test("republic Agri_table keeps spatial layers hidden", async () => {
      const spatial = { definitionExpression: "1=1" } as unknown as __esri.FeatureLayer;
      const host = applyHost({
        state: { featureLayers: [fl()], spatialMapLayers: [spatial] },
        getEffectiveViloyat: () => "",
      });
      await applyFiltersPersistent(host);
      expect(spatial.definitionExpression).toBe("1=0");
      expect(jest.mocked(queryAgriUniqueIdsForWhere)).not.toHaveBeenCalled();
    });
  });

  describe("zoomToSelectedDistrict", () => {
    interface Ext { xmin: number; ymin: number; xmax: number; ymax: number; isEmpty: () => boolean; union: (o: Ext) => Ext; clone: () => Ext; expand: (f: number) => Ext }
    const ext = (xmin: number, xmax: number): Ext => {
      const e: Ext = {
        xmin, ymin: 0, xmax, ymax: 1,
        isEmpty: () => xmax <= xmin,
        union: (o: Ext) => ext(Math.min(xmin, o.xmin), Math.max(xmax, o.xmax)),
        clone: () => ext(xmin, xmax),
        expand: () => e,
      };
      return e;
    };
    const sub = (where = "district = 1"): __esri.Sublayer => ({ title: "S", definitionExpression: where }) as unknown as __esri.Sublayer;
    const view = (): __esri.MapView => ({ goTo: jest.fn(() => Promise.resolve()), animation: { state: "running", stop: jest.fn() } }) as unknown as __esri.MapView;
    const zoomHost = (layers: ShownRegionYearLayer[], init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
      makeFakeHost({ state: { tuman: "Asaka" }, _lastShownRegionYearLayers: layers, ...init });

    test("returns false without district or view", async () => {
      await expect(zoomToSelectedDistrict(makeFakeHost(), view())).resolves.toBe(false);
      await expect(zoomToSelectedDistrict(zoomHost([]), null as unknown as __esri.MapView)).resolves.toBe(false);
    });

    test("merges sublayer extents and animates to them", async () => {
      jest.mocked(getDetachedQueryLayerFor).mockResolvedValue({
        createQuery: () => ({}),
        queryExtent: jest.fn().mockResolvedValueOnce({ extent: ext(0, 2) }).mockResolvedValueOnce({ extent: ext(1, 5) }),
      } as unknown as __esri.FeatureLayer);
      const v = view();
      const host = zoomHost([{ layer: { title: "L" }, sublayers: [sub(), sub()] } as unknown as ShownRegionYearLayer]);
      await expect(zoomToSelectedDistrict(host, v)).resolves.toBe(true);
      const target = jest.mocked(v.goTo).mock.calls[0][0] as unknown as Ext;
      expect([target.xmin, target.xmax]).toEqual([0, 5]);
    });

    test("falls back to feature geometries when queryExtent is empty", async () => {
      jest.mocked(getDetachedQueryLayerFor).mockResolvedValue({
        createQuery: () => ({}),
        queryExtent: jest.fn(() => Promise.reject(new Error("unsupported"))),
        queryFeatures: jest.fn(() => Promise.resolve({ features: [{ geometry: { extent: ext(3, 4) } }, { geometry: { extent: ext(5, 9) } }, { geometry: null }] })),
      } as unknown as __esri.FeatureLayer);
      const v = view();
      const host = zoomHost([{ layer: { title: "L" }, sublayers: [sub()] } as unknown as ShownRegionYearLayer]);
      await expect(zoomToSelectedDistrict(host, v)).resolves.toBe(true);
      const target = jest.mocked(v.goTo).mock.calls[0][0] as unknown as Ext;
      expect([target.xmin, target.xmax]).toEqual([3, 9]);
    });

    test("returns false when nothing queryable or goTo fails", async () => {
      jest.mocked(getDetachedQueryLayerFor).mockResolvedValue(null);
      const host = zoomHost([{ layer: { title: "L" }, sublayers: [sub("1=0"), sub()] } as unknown as ShownRegionYearLayer]);
      await expect(zoomToSelectedDistrict(host, view())).resolves.toBe(false);

      jest.mocked(getDetachedQueryLayerFor).mockResolvedValue({
        createQuery: () => ({}),
        queryExtent: () => Promise.resolve({ extent: ext(0, 1) }),
      } as unknown as __esri.FeatureLayer);
      const failing = { goTo: jest.fn(() => Promise.reject(new Error("abort"))) } as unknown as __esri.MapView;
      await expect(zoomToSelectedDistrict(zoomHost([{ layer: { title: "L" }, sublayers: [sub()] } as unknown as ShownRegionYearLayer]), failing)).resolves.toBe(false);
    });

    test("stale request returns false", async () => {
      const host = zoomHost([{ layer: { title: "L" }, sublayers: [sub()] } as unknown as ShownRegionYearLayer]);
      jest.mocked(getDetachedQueryLayerFor).mockImplementation(async () => {
        host._districtZoomRequestId += 1;
        return null;
      });
      await expect(zoomToSelectedDistrict(host, view())).resolves.toBe(false);
    });
  });
});
