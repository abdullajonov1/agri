jest.mock("../feature-layer-data", () => ({
  isValidMapExtent: (e: { xmin?: number; xmax?: number } | null | undefined) =>
    !!e && Number.isFinite(e.xmin) && Number.isFinite(e.xmax) && (e.xmax as number) > (e.xmin as number),
}));

import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Graphic from "esri/Graphic";
import type Extent from "esri/geometry/Extent";
import type { AdminBoundaryView } from "./boundary-modules";
import { extentFromFeatures, queryAndDrawOutline, queryLayerExtentOnly } from "./boundary-outline-query";

type Props = Record<string, unknown>;

interface FakeExtent {
  xmin: number;
  xmax: number;
  union(other: FakeExtent): FakeExtent;
  clone(): FakeExtent;
}

function ext(xmin: number, xmax: number): FakeExtent {
  return {
    xmin,
    xmax,
    union(o: FakeExtent) {
      return ext(Math.min(this.xmin, o.xmin), Math.max(this.xmax, o.xmax));
    },
    clone() {
      return ext(this.xmin, this.xmax);
    },
  };
}

const feat = (attrs: Props, extent: FakeExtent | null = ext(0, 1)): Graphic =>
  ({
    attributes: attrs,
    geometry: extent ? { type: "polygon", extent, centroid: { type: "point" } } : null,
  }) as unknown as Graphic;

interface QueryResult {
  features: Graphic[];
  exceededTransferLimit?: boolean;
}

function fakeQueryLayer(
  pages: Array<QueryResult | Error>,
  opts: { fields?: string[]; extent?: FakeExtent | null } = {},
): { layer: FeatureLayer; queries: Props[]; queryExtent: jest.Mock } {
  const queries: Props[] = [];
  let call = 0;
  const queryExtent = jest.fn(() => Promise.resolve({ extent: opts.extent ?? null }));
  const layer = {
    objectIdField: "OID",
    fields: (opts.fields || []).map((name) => ({ name })),
    createQuery: () => ({}) as Props,
    queryFeatures: jest.fn((q: Props) => {
      queries.push({ ...q });
      const page = pages[Math.min(call++, pages.length - 1)];
      return page instanceof Error ? Promise.reject(page) : Promise.resolve(page);
    }),
    queryExtent,
  };
  return { layer: layer as unknown as FeatureLayer, queries, queryExtent };
}

class FakeGraphic {
  constructor(props: Props) {
    Object.assign(this, props);
  }
}

function outlineLayer(): { layer: GraphicsLayer; added: Props[]; state: { visible: boolean } } {
  const added: Props[] = [];
  const state = { visible: true };
  const layer = {
    add: (g: Props) => added.push(g),
    removeAll: () => {
      added.length = 0;
    },
    get visible() {
      return state.visible;
    },
    set visible(v: boolean) {
      state.visible = v;
    },
  };
  return { layer: layer as unknown as GraphicsLayer, added, state };
}

const GraphicCls = FakeGraphic as unknown as typeof Graphic;

describe("extentFromFeatures", () => {
  test("unions valid feature extents and skips invalid ones", () => {
    const merged = extentFromFeatures([feat({}, ext(0, 2)), feat({}, null), feat({}, ext(5, 9)), feat({}, ext(3, 3))]);
    expect(merged).toMatchObject({ xmin: 0, xmax: 9 });
  });

  test("returns null when nothing usable", () => {
    expect(extentFromFeatures([])).toBeNull();
    expect(extentFromFeatures([feat({}, null)])).toBeNull();
  });
});

describe("queryLayerExtentOnly", () => {
  test("returns null for missing layer or empty where", async () => {
    expect(await queryLayerExtentOnly(null, "a=1")).toBeNull();
    const { layer } = fakeQueryLayer([]);
    expect(await queryLayerExtentOnly(layer, "1=0")).toBeNull();
  });

  test("returns a valid extent, null for invalid, null on error", async () => {
    const good = fakeQueryLayer([], { extent: ext(1, 2) });
    expect(await queryLayerExtentOnly(good.layer, "a=1")).toMatchObject({ xmin: 1, xmax: 2 });
    const bad = fakeQueryLayer([], { extent: ext(2, 1) });
    expect(await queryLayerExtentOnly(bad.layer, "a=1")).toBeNull();
    const err = fakeQueryLayer([]);
    err.queryExtent.mockRejectedValue(new Error("x"));
    expect(await queryLayerExtentOnly(err.layer, "a=1")).toBeNull();
  });
});

describe("queryAndDrawOutline", () => {
  test("hides the layer and returns empty result for 1=0 without geometry", async () => {
    const out = outlineLayer();
    const res = await queryAndDrawOutline({
      queryLayer: fakeQueryLayer([]).layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "1=0",
      view: null,
      outlineWidth: 2,
      bordersVisible: true,
    });
    expect(res).toEqual({ extent: null, featureCount: 0, firstGeometry: null, features: [], labelFields: [] });
    expect(out.state.visible).toBe(false);
  });

  test("draws region outline and returns merged extent", async () => {
    const out = outlineLayer();
    const f1 = feat({ OID: 1 }, ext(0, 1));
    const { layer, queries } = fakeQueryLayer([{ features: [f1] }]);
    const res = await queryAndDrawOutline({
      queryLayer: layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "parent_cod=1",
      view: null,
      outlineWidth: 2,
      bordersVisible: true,
    });
    expect(res.featureCount).toBe(1);
    expect(res.firstGeometry).toBe(f1.geometry);
    expect(res.extent).toMatchObject({ xmin: 0, xmax: 1 });
    expect(out.added).toHaveLength(1);
    expect(out.state.visible).toBe(true);
    expect(queries[0]).toMatchObject({ where: "parent_cod=1", outFields: ["OID"], num: 200, resultOffset: 0 });
  });

  test("pages through exceededTransferLimit results", async () => {
    const out = outlineLayer();
    const page1 = Array.from({ length: 200 }, () => feat({}));
    const { layer, queries } = fakeQueryLayer([
      { features: page1, exceededTransferLimit: true },
      { features: [feat({})] },
    ]);
    const res = await queryAndDrawOutline({
      queryLayer: layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "x=1",
      view: null,
      outlineWidth: 1,
      bordersVisible: true,
    });
    expect(res.featureCount).toBe(201);
    expect(queries.map((q) => q.resultOffset)).toEqual([0, 200]);
  });

  test("retries with generalized offset after a failure and uses queryExtent fallback", async () => {
    const out = outlineLayer();
    const f = feat({}, null);
    (f as unknown as Props).geometry = { type: "polygon" };
    const { layer, queries } = fakeQueryLayer([new Error("timeout"), { features: [f] }], { extent: ext(4, 8) });
    const res = await queryAndDrawOutline({
      queryLayer: layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "x=1",
      view: { resolution: 40 } as AdminBoundaryView,
      outlineWidth: 1,
      bordersVisible: false,
      geometry: { type: "polygon" } as unknown as Graphic["geometry"],
      spatialRelationship: "contains",
    });
    expect(queries[1]).toMatchObject({ maxAllowableOffset: 10, spatialRelationship: "contains" });
    expect(res.extent).toMatchObject({ xmin: 4, xmax: 8 });
    expect(out.state.visible).toBe(false);
  });

  test("labels region features on the outline layer when withLabels", async () => {
    const out = outlineLayer();
    const { layer, queries } = fakeQueryLayer([{ features: [feat({ TUMAN_NOMI: "Pop" })] }], {
      fields: ["TUMAN_NOMI", "other"],
    });
    const res = await queryAndDrawOutline({
      queryLayer: layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "x=1",
      view: null,
      outlineWidth: 1,
      bordersVisible: true,
      withLabels: true,
    });
    expect(queries[0].outFields).toEqual(["*"]);
    expect(res.labelFields).toEqual(["TUMAN_NOMI"]);
    // outline + label text graphic
    expect(out.added).toHaveLength(2);
    expect(out.added[1].symbol).toMatchObject({ type: "text", text: "Pop" });
  });

  test("district style paints view.graphics overlays", async () => {
    const out = outlineLayer();
    const graphicsItems: Props[] = [];
    const view = {
      graphics: {
        add: (g: Props) => graphicsItems.push(g),
        remove: jest.fn(),
        toArray: () => graphicsItems.slice(),
      },
    } as unknown as AdminBoundaryView;
    const { layer } = fakeQueryLayer([{ features: [feat({ name: "Quva" }), feat({ name: "Rishton" })] }], {
      fields: ["name"],
    });
    const res = await queryAndDrawOutline({
      queryLayer: layer,
      outlineLayer: out.layer,
      Graphic: GraphicCls,
      where: "x=1",
      view,
      outlineWidth: 1,
      bordersVisible: true,
      districtStyle: true,
    });
    expect(res.featureCount).toBe(2);
    // outlines only on outline layer (no label text there for district style)
    expect(out.added).toHaveLength(2);
    expect(graphicsItems.length).toBeGreaterThanOrEqual(2);
  });
});

export type { Extent };
