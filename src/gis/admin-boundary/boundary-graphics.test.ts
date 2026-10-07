import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Graphic from "esri/Graphic";
import type EsriMap from "esri/Map";
import type Layer from "esri/layers/Layer";
import type { AdminBoundaryView } from "./boundary-modules";
import {
  AGRI_DISTRICT_FS_LAYER_ID,
  AGRI_DISTRICT_LABEL_LAYER_ID,
  AGRI_DISTRICT_VIEW_GRAPHIC_TAG,
  addGraphicSafely,
  bringToFront,
  buildDistrictLabelingInfo,
  buildDistrictOutlineSymbol,
  buildFeatureLabelGraphicProps,
  buildOutlineSymbol,
  clearDistrictFsBorderLayer,
  clearDistrictLabelFeatureLayer,
  clearDistrictViewGraphics,
  countDistrictViewGraphics,
  ensureDistrictFsBorderLayer,
  ensureOutlineLayer,
  findLayerById,
  hideLayer,
  paintDistrictsOnViewGraphics,
  pickFeatureLabel,
  publishDistrictLabelFeatureLayer,
} from "./boundary-graphics";

type Props = Record<string, unknown>;

/** Minimal esri Collection stand-in. */
class FakeCollection<T> {
  items: T[] = [];
  get length(): number {
    return this.items.length;
  }
  add(item: T): void {
    this.items.push(item);
  }
  remove(item: T): void {
    this.items = this.items.filter((i) => i !== item);
  }
  toArray(): T[] {
    return this.items.slice();
  }
  find(pred: (item: T) => boolean): T | undefined {
    return this.items.find(pred);
  }
}

/** Constructor stand-in for Graphic / FeatureLayer / GraphicsLayer: stores props as fields. */
class FakeCtor {
  constructor(props: Props) {
    Object.assign(this, props);
  }
}

class ThrowingCtor {
  constructor() {
    throw new Error("bad geometry");
  }
}

const GraphicCls = FakeCtor as unknown as typeof Graphic;
const FeatureLayerCls = FakeCtor as unknown as typeof FeatureLayer;
const GraphicsLayerCls = FakeCtor as unknown as typeof GraphicsLayer;

interface FakeMap {
  layers: FakeCollection<Props>;
  add: jest.Mock;
  remove: jest.Mock;
  reorder: jest.Mock;
}

function fakeMap(initial: Props[] = []): FakeMap {
  const layers = new FakeCollection<Props>();
  initial.forEach((l) => layers.add(l));
  return {
    layers,
    add: jest.fn((l: Props) => layers.add(l)),
    remove: jest.fn((l: Props) => layers.remove(l)),
    reorder: jest.fn(),
  };
}

const asMap = (m: FakeMap): EsriMap => m as unknown as EsriMap;

const polygon = (cx: number, cy: number): Props => ({
  type: "polygon",
  centroid: { type: "point", x: cx, y: cy },
  spatialReference: { wkid: 3857 },
});

const feature = (attrs: Props, geometry: Props | null = polygon(1, 2)): Graphic =>
  ({ attributes: attrs, geometry }) as unknown as Graphic;

describe("symbols", () => {
  test("outline symbol is a transparent fill with a line outline", () => {
    expect(buildOutlineSymbol()).toEqual({
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: { type: "simple-line", color: [255, 255, 255, 0.95], width: 2.2 },
    });
    expect(buildDistrictOutlineSymbol(1).outline).toMatchObject({ width: 1, color: [255, 255, 255, 0.88] });
  });

  test("labelingInfo quotes the field and strips double quotes", () => {
    const [info] = buildDistrictLabelingInfo('na"me');
    expect(info.labelExpressionInfo).toEqual({ expression: '$feature["name"]' });
    expect(buildDistrictLabelingInfo("  ")[0].labelExpressionInfo).toEqual({ expression: '$feature["label"]' });
  });
});

describe("pickFeatureLabel", () => {
  test("uses preferred fields first", () => {
    expect(pickFeatureLabel({ name: " ", nomi: "Oltiariq" }, ["name", "nomi"])).toBe("Oltiariq");
  });

  test("falls back to a plausible name-like attribute, skipping ids/areas", () => {
    expect(
      pickFeatureLabel({ OBJECTID: 5, parent_cod: "Abc", area_ha: "Xyz", title: "Quva tumani" }, []),
    ).toBe("Quva tumani");
  });

  test("returns empty for null or no candidate", () => {
    expect(pickFeatureLabel(null, ["x"])).toBe("");
    expect(pickFeatureLabel({ code: "12", t: "ab" }, [])).toBe("");
  });
});

describe("buildFeatureLabelGraphicProps", () => {
  test("anchors at centroid with text symbol and attributes", () => {
    const props = buildFeatureLabelGraphicProps(feature({ name: "Pop" }), ["name"], { tag: 1 });
    expect(props?.geometry).toEqual({ type: "point", x: 1, y: 2 });
    expect(props?.symbol).toMatchObject({ type: "text", text: "Pop" });
    expect(props?.attributes).toEqual({ tag: 1 });
  });

  test("point geometry is its own anchor; extent center is the fallback", () => {
    const pt = { type: "point", x: 9, y: 9 };
    expect(buildFeatureLabelGraphicProps(feature({ name: "A" }, pt), ["name"])?.geometry).toBe(pt);
    const center = { type: "point", x: 0, y: 0 };
    const geom = { type: "polygon", extent: { center } };
    expect(buildFeatureLabelGraphicProps(feature({ name: "A" }, geom), ["name"])?.geometry).toBe(center);
  });

  test("throwing centroid getter falls back to extent center", () => {
    const center = { type: "point", x: 3, y: 3 };
    const geom = {
      type: "polygon",
      get centroid(): never {
        throw new Error("degenerate");
      },
      extent: { center },
    };
    expect(buildFeatureLabelGraphicProps(feature({ name: "A" }, geom), ["name"])?.geometry).toBe(center);
  });

  test("returns null without label or anchor", () => {
    expect(buildFeatureLabelGraphicProps(feature({}), ["name"])).toBeNull();
    expect(buildFeatureLabelGraphicProps(feature({ name: "A" }, null), ["name"])).toBeNull();
    expect(buildFeatureLabelGraphicProps(feature({ name: "A" }, { type: "polygon" }), ["name"])).toBeNull();
  });
});

describe("addGraphicSafely", () => {
  test("adds constructed graphic and reports success", () => {
    const target = new FakeCollection<unknown>();
    expect(addGraphicSafely(target, GraphicCls, { attributes: { a: 1 } })).toBe(true);
    expect(target.length).toBe(1);
  });

  test("swallows constructor errors", () => {
    const target = new FakeCollection<unknown>();
    expect(addGraphicSafely(target, ThrowingCtor as unknown as typeof Graphic, {})).toBe(false);
    expect(target.length).toBe(0);
  });
});

describe("view.graphics district overlays", () => {
  const makeView = (): { view: AdminBoundaryView; graphics: FakeCollection<Props> } => {
    const graphics = new FakeCollection<Props>();
    return { view: { graphics } as unknown as AdminBoundaryView, graphics };
  };

  test("paints outlines + labels and tags them; clear removes only tagged", () => {
    const { view, graphics } = makeView();
    graphics.add({ attributes: { other: true } });
    const painted = paintDistrictsOnViewGraphics({
      view,
      Graphic: GraphicCls,
      features: [feature({ name: "A" }), feature({ name: "B" }), feature({}, null)],
      labelFields: ["name"],
      bordersVisible: true,
    });
    expect(painted).toBe(2);
    expect(countDistrictViewGraphics(view)).toBe(4);
    clearDistrictViewGraphics(view);
    expect(countDistrictViewGraphics(view)).toBe(0);
    expect(graphics.length).toBe(1);
  });

  test("withLabels=false paints outlines only", () => {
    const { view } = makeView();
    paintDistrictsOnViewGraphics({
      view,
      Graphic: GraphicCls,
      features: [feature({ name: "A" })],
      labelFields: ["name"],
      bordersVisible: true,
      withLabels: false,
    });
    expect(countDistrictViewGraphics(view)).toBe(1);
  });

  test("hidden borders paint nothing", () => {
    const { view } = makeView();
    expect(
      paintDistrictsOnViewGraphics({
        view,
        Graphic: GraphicCls,
        features: [feature({ name: "A" })],
        labelFields: [],
        bordersVisible: false,
      }),
    ).toBe(0);
  });

  test("count is 0 without view and -1 on error", () => {
    expect(countDistrictViewGraphics(null)).toBe(0);
    const broken = {
      graphics: {
        toArray: () => {
          throw new Error("destroyed");
        },
      },
    } as unknown as AdminBoundaryView;
    expect(countDistrictViewGraphics(broken)).toBe(-1);
    expect(() => clearDistrictViewGraphics(broken)).not.toThrow();
    expect(AGRI_DISTRICT_VIEW_GRAPHIC_TAG).toBe("agri-admin-district");
  });
});

describe("map layer helpers", () => {
  test("findLayerById and bringToFront", () => {
    const a = { id: "a" };
    const map = fakeMap([a, { id: "b" }]);
    expect(findLayerById(asMap(map), "a")).toBe(a);
    expect(findLayerById(asMap(map), "zz")).toBeNull();
    expect(findLayerById(null, "a")).toBeNull();
    bringToFront(asMap(map), a as unknown as Layer);
    expect(map.reorder).toHaveBeenCalledWith(a, 1);
    bringToFront(null, a as unknown as Layer);
    expect(map.reorder).toHaveBeenCalledTimes(1);
  });

  test("publishDistrictLabelFeatureLayer replaces the client label layer", () => {
    const old = { id: AGRI_DISTRICT_LABEL_LAYER_ID };
    const map = fakeMap([old]);
    const count = publishDistrictLabelFeatureLayer({
      map: asMap(map),
      FeatureLayer: FeatureLayerCls,
      Graphic: GraphicCls,
      features: [feature({ name: "Pop" }), feature({}), feature({}, null)],
      labelFields: ["name"],
      bordersVisible: true,
    });
    expect(count).toBe(2);
    expect(map.remove).toHaveBeenCalledWith(old);
    const created = findLayerById(asMap(map), AGRI_DISTRICT_LABEL_LAYER_ID) as unknown as {
      source: Array<{ attributes: Props }>;
      spatialReference: unknown;
    };
    expect(created.source.map((g) => g.attributes)).toEqual([
      { OBJECTID: 1, label: "Pop" },
      { OBJECTID: 2, label: "Tuman 2" },
    ]);
    expect(created.spatialReference).toEqual({ wkid: 3857 });
  });

  test("publishDistrictLabelFeatureLayer returns 0 when hidden, empty or add fails", () => {
    const map = fakeMap();
    const base = { map: asMap(map), FeatureLayer: FeatureLayerCls, Graphic: GraphicCls, labelFields: [] as string[] };
    expect(publishDistrictLabelFeatureLayer({ ...base, features: [feature({})], bordersVisible: false })).toBe(0);
    expect(publishDistrictLabelFeatureLayer({ ...base, features: [feature({}, null)], bordersVisible: true })).toBe(0);
    map.add.mockImplementation(() => {
      throw new Error("x");
    });
    expect(publishDistrictLabelFeatureLayer({ ...base, features: [feature({})], bordersVisible: true })).toBe(0);
  });

  test("clearDistrictLabelFeatureLayer removes the layer", () => {
    const layer = { id: AGRI_DISTRICT_LABEL_LAYER_ID };
    const map = fakeMap([layer]);
    clearDistrictLabelFeatureLayer(asMap(map));
    clearDistrictLabelFeatureLayer(null);
    expect(map.layers.length).toBe(0);
  });

  test("ensureDistrictFsBorderLayer reuses same url, recreates on url change", () => {
    const map = fakeMap();
    const first = ensureDistrictFsBorderLayer(asMap(map), FeatureLayerCls, "https://s/0", true) as unknown as Props;
    expect(first).toMatchObject({ id: AGRI_DISTRICT_FS_LAYER_ID, url: "https://s/0", definitionExpression: "1=0" });
    const again = ensureDistrictFsBorderLayer(asMap(map), FeatureLayerCls, "https://s/0/", false) as unknown as Props;
    expect(again).toBe(first);
    expect(again.visible).toBe(false);
    const other = ensureDistrictFsBorderLayer(asMap(map), FeatureLayerCls, "https://s/1", true);
    expect(other).not.toBe(first);
    expect(map.layers.length).toBe(1);
  });

  test("ensureDistrictFsBorderLayer returns null when map.add throws", () => {
    const map = fakeMap();
    map.add.mockImplementation(() => {
      throw new Error("x");
    });
    expect(ensureDistrictFsBorderLayer(asMap(map), FeatureLayerCls, "u", true)).toBeNull();
  });

  test("clearDistrictFsBorderLayer resets and removes", () => {
    const layer: Props = { id: AGRI_DISTRICT_FS_LAYER_ID, visible: true, definitionExpression: "x" };
    const map = fakeMap([layer]);
    clearDistrictFsBorderLayer(asMap(map));
    expect(layer).toMatchObject({ visible: false, definitionExpression: "1=0" });
    expect(map.layers.length).toBe(0);
    expect(() => clearDistrictFsBorderLayer(asMap(fakeMap()))).not.toThrow();
  });

  test("ensureOutlineLayer removes legacy feature layers and non-graphics layers with the id", () => {
    const legacy = { id: "legacy", type: "feature", url: "https://s/Tuman_chegara/FeatureServer/0" };
    const keep = { id: "keep", type: "feature", url: "https://s/Other" };
    const wrongType = { id: "outline", type: "feature" };
    const map = fakeMap([legacy, keep, wrongType]);
    const layer = ensureOutlineLayer(asMap(map), GraphicsLayerCls, {
      id: "outline",
      title: "Outline",
      urlHint: "Tuman_chegara",
    }) as unknown as Props;
    expect(layer).toMatchObject({ id: "outline", visible: false, listMode: "hide" });
    expect(map.layers.toArray()).toEqual([keep, layer]);
  });

  test("ensureOutlineLayer reuses an existing graphics layer", () => {
    const existing = { id: "outline", type: "graphics" };
    const map = fakeMap([existing]);
    expect(ensureOutlineLayer(asMap(map), GraphicsLayerCls, { id: "outline", title: "t", urlHint: "" })).toBe(existing);
  });

  test("hideLayer hides, clears and blanks definitionExpression", () => {
    const removeAll = jest.fn();
    const layer: { visible?: boolean; removeAll(): void; definitionExpression?: string | null } = {
      visible: true,
      removeAll,
      definitionExpression: "a=1",
    };
    hideLayer(layer);
    expect(layer.visible).toBe(false);
    expect(removeAll).toHaveBeenCalled();
    expect(layer.definitionExpression).toBe("1=0");
    expect(() => hideLayer(null)).not.toThrow();
  });
});
