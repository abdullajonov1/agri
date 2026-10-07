import {
  appendSpatialFeatureExtent,
  canQuerySpatialFeatureExtent,
  collectShownRegionYearQueryTargets,
  readQueryableDefinitionExpression,
  readSpatialFeatureExtentWhere,
  unionMapExtents,
  unionShownRegionYearFullExtents,
} from "./map-shown-extent";
import type { AgriMapLayer } from "./agri-map-layer";

/** Minimal axis-aligned extent fake implementing clone/union/isEmpty. */
class FakeExtent {
  constructor(
    readonly xmin: number,
    readonly ymin: number,
    readonly xmax: number,
    readonly ymax: number,
  ) {}

  get width(): number {
    return this.xmax - this.xmin;
  }

  get height(): number {
    return this.ymax - this.ymin;
  }

  isEmpty(): boolean {
    return this.width <= 0 && this.height <= 0;
  }

  clone(): FakeExtent {
    return new FakeExtent(this.xmin, this.ymin, this.xmax, this.ymax);
  }

  union(other: FakeExtent): FakeExtent {
    return new FakeExtent(
      Math.min(this.xmin, other.xmin),
      Math.min(this.ymin, other.ymin),
      Math.max(this.xmax, other.xmax),
      Math.max(this.ymax, other.ymax),
    );
  }
}

const ext = (a: number, b: number, c: number, d: number): __esri.Extent =>
  new FakeExtent(a, b, c, d) as unknown as __esri.Extent;

const asLayer = (value: object): AgriMapLayer => value as AgriMapLayer;

describe("collectShownRegionYearQueryTargets", () => {
  test("null entry yields empty list", () => {
    expect(collectShownRegionYearQueryTargets(null)).toEqual([]);
  });

  test("merges entry and live sublayers without duplicates", () => {
    const s1 = asLayer({ id: "s1" });
    const s2 = asLayer({ id: "s2" });
    const parent = asLayer({
      id: "p",
      allSublayers: { toArray: (): AgriMapLayer[] => [s1, s2] },
    });
    expect(collectShownRegionYearQueryTargets({ layer: parent, sublayers: [s1] })).toEqual([
      s1,
      s2,
    ]);
  });

  test("falls back to parent layer, or empty", () => {
    const parent = asLayer({ id: "p" });
    expect(collectShownRegionYearQueryTargets({ layer: parent })).toEqual([parent]);
    expect(collectShownRegionYearQueryTargets({})).toEqual([]);
  });
});

describe("definition expression readers", () => {
  test("readQueryableDefinitionExpression", () => {
    expect(readQueryableDefinitionExpression(null)).toBe("1=1");
    expect(readQueryableDefinitionExpression(asLayer({ definitionExpression: " a=1 " }))).toBe(
      "a=1",
    );
    expect(readQueryableDefinitionExpression(asLayer({ definitionExpression: "1=0" }))).toBeNull();
    expect(readQueryableDefinitionExpression(asLayer({ definitionExpression: "   " }))).toBeNull();
  });

  test("readSpatialFeatureExtentWhere", () => {
    expect(readSpatialFeatureExtentWhere(undefined)).toBe("1=1");
    expect(readSpatialFeatureExtentWhere(asLayer({ definitionExpression: " b " }))).toBe(" b ");
    expect(readSpatialFeatureExtentWhere(asLayer({ definitionExpression: "1=0" }))).toBeNull();
  });

  test("canQuerySpatialFeatureExtent", () => {
    expect(canQuerySpatialFeatureExtent(asLayer({ geometryType: "polygon" }))).toBe(true);
    expect(canQuerySpatialFeatureExtent(asLayer({}))).toBe(false);
    expect(canQuerySpatialFeatureExtent(null)).toBe(false);
  });
});

describe("extent unions", () => {
  test("unionMapExtents skips empty and returns null when nothing", () => {
    expect(unionMapExtents([])).toBeNull();
    expect(unionMapExtents([null, ext(0, 0, 0, 0)])).toBeNull();
    const merged = unionMapExtents([ext(0, 0, 1, 1), undefined, ext(2, 2, 3, 3)]);
    expect(merged).toMatchObject({ xmin: 0, ymin: 0, xmax: 3, ymax: 3 });
  });

  test("unionShownRegionYearFullExtents", () => {
    expect(unionShownRegionYearFullExtents(null)).toBeNull();
    expect(unionShownRegionYearFullExtents([])).toBeNull();
    const merged = unionShownRegionYearFullExtents([
      { layer: asLayer({ fullExtent: ext(0, 0, 2, 2) }) },
      { layer: asLayer({ fullExtent: ext(0, 0, 0, 0) }) },
      { layer: null },
      { layer: asLayer({ fullExtent: ext(-1, -1, 1, 1) }) },
    ]);
    expect(merged).toMatchObject({ xmin: -1, ymin: -1, xmax: 2, ymax: 2 });
  });

  test("appendSpatialFeatureExtent", () => {
    expect(appendSpatialFeatureExtent(undefined, null)).toBeNull();
    const a = ext(0, 0, 1, 1);
    expect(appendSpatialFeatureExtent(a, ext(0, 0, 0, 0))).toBe(a);
    const first = appendSpatialFeatureExtent(null, a);
    expect(first).not.toBe(a);
    expect(first).toMatchObject({ xmax: 1 });
    expect(appendSpatialFeatureExtent(first, ext(5, 5, 6, 6))).toMatchObject({ xmax: 6, ymax: 6 });
  });
});
