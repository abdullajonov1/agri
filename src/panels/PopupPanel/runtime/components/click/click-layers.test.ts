import { makePopupHost } from "../../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../../popup-host";
import type { AgriLayerLike } from "../../popup-types";

const mockCollect = jest.fn();
const mockLoad = jest.fn();
const mockAllLayers = jest.fn();

jest.mock("../../../../../gis/feature-layer-data", () => ({
  getAgriLayerMapKey: (l: { url?: string }) => l?.url || "",
  getQueryableLayer: (l: { queryable?: unknown }) => l?.queryable ?? null,
  isAgriAdminBoundaryLayer: (l: { title?: string } | null) => /tuman_chegara|district borders/i.test(String(l?.title || "")),
  isMapImageGroupSublayer: (l: { isGroup?: boolean }) => !!l?.isGroup,
  isQueryableFieldLayer: (l: { queryFeatures?: unknown } | null) => typeof l?.queryFeatures === "function",
  collectQueryableFieldLayers: (...a: unknown[]) => mockCollect(...a),
  getAllFeatureLayersFromMap: (...a: unknown[]) => mockAllLayers(...a),
  safeLoadMapLayer: (...a: unknown[]) => mockLoad(...a),
}));
jest.mock("esri/geometry/Point", () => ({
  default: class {
    x: number; y: number; spatialReference: unknown;
    constructor(o: { x: number; y: number; spatialReference: unknown }) {
      this.x = o.x; this.y = o.y; this.spatialReference = o.spatialReference;
    }
  },
}), { virtual: true });

import {
  findHitGraphic,
  getClickTargetLayers,
  isAgriculturalFieldGraphic,
  isAgriculturalFieldLayer,
  isHighlightLayer,
  isLayerEffectivelyVisible,
  pickClickGraphic,
  resolveClickFeatureAt,
  resolveClickLayers,
  toClickQueryGeometry,
} from "./click-layers";

type Obj = Record<string, unknown>;
const asLayer = (o: Obj): __esri.FeatureLayer => o as unknown as __esri.FeatureLayer;
const asView = (o: Obj): __esri.MapView => o as unknown as __esri.MapView;
const asAgri = (o: Obj): AgriLayerLike => o as unknown as AgriLayerLike;
const asGraphic = (o: Obj): __esri.Graphic => o as unknown as __esri.Graphic;
const asHit = (results: unknown[]): __esri.HitTestResult => ({ results }) as unknown as __esri.HitTestResult;

describe("click-layers: layer classification", () => {
  const { host } = makePopupHost();

  test("isHighlightLayer matches id, title and admin boundary", () => {
    expect(isHighlightLayer(host, asAgri({ id: "agri-polygon-highlight" }))).toBe(true);
    expect(isHighlightLayer(host, asAgri({ title: "My Sketch layer" }))).toBe(true);
    expect(isHighlightLayer(host, asAgri({ title: "Tuman_chegara" }))).toBe(true);
    expect(isHighlightLayer(host, asAgri({ id: "x", title: "Fields" }))).toBe(false);
    expect(isHighlightLayer(host, null)).toBe(false);
  });

  const visHost = makePopupHost({}, {}, {
    isHighlightLayer: jest.fn((l) => isHighlightLayer(host, l as AgriLayerLike)),
  }).host;

  test("isLayerEffectivelyVisible checks parents, scale and definitionExpression", () => {
    const view = asView({ scale: 1000 });
    expect(isLayerEffectivelyVisible(visHost, null, view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ id: "agri-polygon-highlight" }), view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ visible: true }), view)).toBe(true);
    const hiddenParent = asAgri({ visible: true, parent: { visible: false } });
    expect(isLayerEffectivelyVisible(visHost, hiddenParent, view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ minScale: 500 }), view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ maxScale: 2000 }), view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ definitionExpression: " 1=0 " }), view)).toBe(false);
    expect(isLayerEffectivelyVisible(visHost, asAgri({ definitionExpression: "x=1" }), view)).toBe(true);
  });

  test("isLayerEffectivelyVisible survives cyclic parents", () => {
    const a: Obj = { visible: true };
    const b: Obj = { visible: true, parent: a };
    a.parent = b;
    expect(isLayerEffectivelyVisible(visHost, asAgri(a), asView({}))).toBe(true);
  });

  test("isAgriculturalFieldLayer", () => {
    const q = (): void => undefined;
    expect(isAgriculturalFieldLayer(host, null)).toBe(false);
    expect(isAgriculturalFieldLayer(host, asAgri({ isGroup: true, title: "agri" }))).toBe(false);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Agri district borders" }))).toBe(false);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Roads", queryFeatures: q }))).toBe(false);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Roads", queryFeatures: q, fields: [{ name: "UniqueID" }] }))).toBe(true);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Roads", queryFeatures: q, fields: [{ name: "turi" }], geometryType: "point" }))).toBe(false);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Agri fields" }))).toBe(true);
    expect(isAgriculturalFieldLayer(host, asAgri({ title: "Roads", queryFeatures: q, fields: [] }))).toBe(false);
  });

  test("isAgriculturalFieldGraphic uses attributes or layer", () => {
    const h = makePopupHost({}, {}, { isAgriculturalFieldLayer: jest.fn(() => false) }).host;
    expect(isAgriculturalFieldGraphic(h, asGraphic({ geometry: { type: "point" } }), null)).toBe(false);
    expect(isAgriculturalFieldGraphic(h, asGraphic({ attributes: { UNIQUEID: "1" } }), null)).toBe(true);
    expect(isAgriculturalFieldGraphic(h, asGraphic({ attributes: { foo: 1 } }), null)).toBe(false);
    expect(isAgriculturalFieldGraphic(h, asGraphic({}), null)).toBe(false);
  });
});

describe("click-layers: toClickQueryGeometry", () => {
  const { host } = makePopupHost();
  const pt = { x: 1, y: 2 };

  test("prefers view.toMap", () => {
    const toMap = jest.fn(() => pt);
    expect(toClickQueryGeometry(host, asView({ toMap }), { x: 5, y: 6 })).toBe(pt);
    expect(toMap).toHaveBeenCalledWith({ x: 5, y: 6 });
  });

  test("falls back to map point when toMap throws or returns null", () => {
    const throwing = asView({ toMap: () => { throw new Error("x"); }, spatialReference: { wkid: 1 } });
    const res = toClickQueryGeometry(host, throwing, { x: 0, y: 0 }, { x: 10, y: 20 }) as unknown as Obj;
    expect(res.x).toBe(10);
    expect(res.y).toBe(20);
    expect(res.spatialReference).toEqual({ wkid: 1 });
    const own = toClickQueryGeometry(host, asView({ toMap: (): null => null }), { x: 0, y: 0 }, { x: 1, y: 2, spatialReference: { wkid: 9 } }) as unknown as Obj;
    expect(own.spatialReference).toEqual({ wkid: 9 });
  });

  test("returns null without usable coordinates", () => {
    expect(toClickQueryGeometry(host, asView({}), { x: 0, y: 0 })).toBeNull();
    expect(toClickQueryGeometry(host, asView({}), { x: 0, y: 0 }, { x: NaN, y: 1 })).toBeNull();
  });
});

describe("click-layers: hit graphic selection", () => {
  test("findHitGraphic returns first graphic on matching layer", () => {
    const L = asLayer({ id: "a" });
    const g1 = { layer: { id: "b" } };
    const g2 = { layer: { id: "a" } };
    const host = makePopupHost({}, {}, {
      layerKeysMatch: jest.fn((a, b) => (a as { id: string }).id === (b as { id: string }).id),
    }).host;
    expect(findHitGraphic(host, asHit([{ graphic: g1 }, { graphic: { layer: null } }, { notGraphic: 1 }, { graphic: g2 }]), [L])).toBe(g2);
    expect(findHitGraphic(host, asHit([{ graphic: g1 }]), [L])).toBeNull();
    expect(findHitGraphic(host, null, [L])).toBeNull();
  });

  const makeHost = (visible = true): PopupWidgetHost => {
    const view = asView({ map: {} });
    return makePopupHost(
      { jimuMapView: { view } as never },
      {},
      {
        isHighlightLayer: jest.fn((l) => (l as { id?: string })?.id === "hl"),
        toLiveMapLayer: jest.fn((l) => l as never),
        isAgriculturalFieldLayer: jest.fn(() => true),
        isLayerEffectivelyVisible: jest.fn(() => visible),
        isAgriculturalFieldGraphic: jest.fn(() => true),
        layerKeysMatch: jest.fn((a, b) => (a as { id?: string })?.id === (b as { id?: string })?.id),
      },
    ).host;
  };
  const poly = { type: "polygon" };

  test("returns null with no candidates", () => {
    expect(pickClickGraphic(makeHost(), null, [])).toBeNull();
    expect(pickClickGraphic(makeHost(), asHit([null, { graphic: null }]), [])).toBeNull();
  });

  test("skips highlight, hidden, non-polygon and empty graphics", () => {
    const hit = asHit([
      { graphic: { layer: { id: "hl" }, geometry: poly, attributes: { a: 1 } } },
      { graphic: { layer: { id: "p" }, geometry: { type: "point" }, attributes: { a: 1 } } },
      { graphic: { layer: { id: "p" }, geometry: undefined, attributes: {} } },
    ]);
    expect(pickClickGraphic(makeHost(), hit, [])).toBeNull();
    const visibleHit = asHit([{ graphic: { layer: { id: "p" }, geometry: poly, attributes: { a: 1 } } }]);
    expect(pickClickGraphic(makeHost(false), visibleHit, [])).toBeNull();
  });

  test("returns first visible candidate when no preferred layers", () => {
    const g1 = { layer: { id: "p", visible: false }, geometry: poly, attributes: { a: 1 } };
    const g2 = { layer: { id: "q" }, geometry: poly, attributes: { a: 1 } };
    expect(pickClickGraphic(makeHost(), asHit([{ graphic: g1 }, { graphic: g2 }]), [])).toBe(g2);
    expect(pickClickGraphic(makeHost(), asHit([{ graphic: g1 }]), [])).toBe(g1);
  });

  test("restricts to preferred layers", () => {
    const g1 = { layer: { id: "p" }, geometry: poly, attributes: { a: 1 } };
    const g2 = { layer: { id: "q" }, geometry: poly, attributes: { a: 1 } };
    const hit = asHit([{ graphic: g1 }, { graphic: g2 }]);
    expect(pickClickGraphic(makeHost(), hit, [asLayer({ id: "q" })])).toBe(g2);
    expect(pickClickGraphic(makeHost(), hit, [asLayer({ id: "zzz" })])).toBeNull();
  });
});

describe("click-layers: getClickTargetLayers", () => {
  beforeEach(() => mockCollect.mockReset());
  const queryable = (url: string): Obj => ({ url, queryFeatures: (): undefined => undefined });

  const build = (state: Parameters<typeof makePopupHost>[0], dashboard = false): PopupWidgetHost =>
    makePopupHost(state, {}, {
      toLiveMapLayer: jest.fn((l) => l as never),
      isLayerEffectivelyVisible: jest.fn(() => true),
      isAgriculturalFieldLayer: jest.fn(() => true),
      isDashboardEmbedded: jest.fn(() => dashboard),
    }).host;

  test("merges configured and live layers, deduplicating by key", () => {
    const configured = queryable("u1");
    mockCollect.mockReturnValue([queryable("u1"), queryable("u1"), queryable("u2"), { url: "" }]);
    const view = asView({ map: { allLayers: { toArray: () => [{}] } } });
    const out = getClickTargetLayers(build({ featureLayers: [asLayer(configured)] }), view);
    expect(out.map((l) => l.url)).toEqual(["u1", "u1", "u2"]);
    expect(out[0]).toBe(asLayer(configured));
  });

  test("filters by datasource keys unless dashboard embedded", () => {
    mockCollect.mockReturnValue([queryable("u1"), queryable("u2")]);
    const view = asView({ map: { allLayers: { toArray: () => [{}] } } });
    const state = { layerKeyToDsId: { u2: "ds" } };
    expect(getClickTargetLayers(build(state), view).map((l) => l.url)).toEqual(["u2"]);
    expect(getClickTargetLayers(build(state, true), view)).toHaveLength(2);
  });

  test("handles missing map", () => {
    expect(getClickTargetLayers(build({}), asView({}))).toEqual([]);
  });
});

describe("click-layers: resolveClickLayers", () => {
  beforeEach(() => {
    mockLoad.mockReset();
    mockAllLayers.mockReset();
  });
  const L = asLayer({ id: "a" });

  test("returns immediately when layers exist", async () => {
    const init = jest.fn();
    const host = makePopupHost({}, {}, { getClickTargetLayers: jest.fn(() => [L]), initializeMapConnection: init }).host;
    expect(await resolveClickLayers(host, asView({}), {} as never)).toEqual([L]);
    expect(init).not.toHaveBeenCalled();
  });

  test("initializes map connection then retries", async () => {
    const get = jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([L]);
    const init = jest.fn(() => Promise.resolve());
    const host = makePopupHost({}, {}, { getClickTargetLayers: get, initializeMapConnection: init }).host;
    expect(await resolveClickLayers(host, asView({}), {} as never)).toEqual([L]);
    expect(init).toHaveBeenCalledTimes(1);
  });

  test("last resort loads map layers and tolerates failures", async () => {
    mockAllLayers.mockReturnValue([{ id: 1 }, { id: 2 }]);
    mockLoad.mockResolvedValue(undefined);
    const get = jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([]).mockReturnValueOnce([L]);
    const host = makePopupHost({}, {}, { getClickTargetLayers: get, initializeMapConnection: jest.fn(() => Promise.resolve()) }).host;
    expect(await resolveClickLayers(host, asView({ map: {} }), {} as never)).toEqual([L]);
    expect(mockLoad).toHaveBeenCalledTimes(2);

    mockAllLayers.mockImplementation(() => { throw new Error("boom"); });
    get.mockReset().mockReturnValue([]);
    expect(await resolveClickLayers(host, asView({}), {} as never)).toEqual([]);
  });
});

describe("click-layers: resolveClickFeatureAt", () => {
  const ev = { x: 3, y: 4, mapPoint: { x: 1, y: 2 } } as unknown as __esri.ViewClickEvent;
  const geom = { type: "point" };
  const live = (extra: Obj = {}): __esri.FeatureLayer => asLayer({ definitionExpression: "tuman=5", ...extra });

  const build = (over: Partial<PopupWidgetHost>): { host: PopupWidgetHost; restore: jest.Mock } => {
    const restore = jest.fn();
    const host = makePopupHost({}, {}, {
      toClickQueryGeometry: jest.fn(() => geom as unknown as __esri.Point),
      getClickTargetLayers: jest.fn((): never[] => []),
      snapshotDefinitionExpressions: jest.fn(() => new Map()),
      restoreDriftedDefinitionExpressions: restore,
      pickClickGraphic: jest.fn((): null => null),
      isLayerEffectivelyVisible: jest.fn(() => true),
      isAgriculturalFieldLayer: jest.fn(() => true),
      getDetachedQueryLayer: jest.fn(() => Promise.resolve(null)),
      ...over,
    }).host;
    return { host, restore };
  };
  const view = asView({ hitTest: jest.fn(() => Promise.resolve({ results: [] })) });

  test("returns hit graphic from hitTest without querying", async () => {
    const g = asGraphic({ attributes: {} });
    const { host, restore } = build({ pickClickGraphic: jest.fn(() => g) });
    const res = await resolveClickFeatureAt(host, ev, view, [live()]);
    expect(res).toEqual({ graphic: g, queryHitLayer: null });
    expect(restore).toHaveBeenCalledTimes(1);
  });

  test("falls back to detached query with live where clause", async () => {
    const feature = asGraphic({ attributes: { a: 1 } });
    const q: Obj = {};
    const queryFeatures = jest.fn(() => Promise.resolve({ features: [feature] }));
    const detached = { createQuery: () => q, queryFeatures };
    const layer = live();
    const { host, restore } = build({ getDetachedQueryLayer: jest.fn(() => Promise.resolve(detached as unknown as __esri.FeatureLayer)) });
    const res = await resolveClickFeatureAt(host, ev, view, [layer]);
    expect(res).toEqual({ graphic: feature, queryHitLayer: layer });
    expect(q).toMatchObject({ geometry: geom, spatialRelationship: "intersects", outFields: ["*"], returnGeometry: true, num: 1, where: "tuman=5" });
    expect(restore).toHaveBeenCalledTimes(1);
  });

  test("queries live layer when no detached client and repairs drift", async () => {
    const q: Obj = {};
    const layer = live({
      definitionExpression: "1=1",
      createQuery: () => q,
      queryFeatures: jest.fn(() => Promise.resolve({ features: [asGraphic({})] })),
    });
    const { host, restore } = build({ getClickTargetLayers: jest.fn(() => [layer]) });
    const res = await resolveClickFeatureAt(host, ev, view, []);
    expect(res?.queryHitLayer).toBe(layer);
    expect(q.where).toBeUndefined();
    expect(restore).toHaveBeenCalledTimes(2);
  });

  test("skips invisible/non-agri layers, swallows query errors, returns null", async () => {
    const bad = live({ createQuery: () => { throw new Error("x"); } });
    const hidden = live();
    const isVis = jest.fn((l: unknown) => l !== hidden);
    const { host } = build({ isLayerEffectivelyVisible: isVis as never });
    expect(await resolveClickFeatureAt(host, ev, view, [hidden, bad])).toBeNull();
    const none = build({ toClickQueryGeometry: jest.fn((): null => null) }).host;
    expect(await resolveClickFeatureAt(none, ev, view, [bad])).toBeNull();
    const nonAgri = build({ isAgriculturalFieldLayer: jest.fn(() => false) }).host;
    expect(await resolveClickFeatureAt(nonAgri, ev, view, [bad])).toBeNull();
  });

  test("continues to next layer when first returns no features", async () => {
    const empty = live({ createQuery: () => ({}), queryFeatures: () => Promise.resolve({ features: [] }) });
    const g = asGraphic({});
    const hit = live({ createQuery: () => ({}), queryFeatures: () => Promise.resolve({ features: [g] }) });
    const { host } = build({});
    const res = await resolveClickFeatureAt(host, ev, view, [empty, hit]);
    expect(res?.graphic).toBe(g);
    expect(res?.queryHitLayer).toBe(hit);
  });
});
