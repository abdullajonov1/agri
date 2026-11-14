import {
  normalizeLayerUrl,
  pickNationalSumLayers,
  vhWhereSummary,
} from "./indicator-fetch-steps";

const layer = (url: string) => ({ url }) as unknown as __esri.FeatureLayer;

describe("indicator-fetch-steps", () => {
  it("normalizes layer urls by trimming trailing slashes", () => {
    expect(normalizeLayerUrl(layer("http://a/b///"))).toBe("http://a/b");
    expect(normalizeLayerUrl(undefined)).toBe("");
  });

  it("summarizes where clauses", () => {
    const s = vhWhereSummary("a IN ('x','y') AND b='z'");
    expect(s.inLiteralCount).toBe(3);
    expect(s.whereLength).toBe(24);
  });

  it("uses canonical layer when no regional layers exist", () => {
    const fl = layer("u/0");
    expect(pickNationalSumLayers(fl, [], () => false)).toEqual([fl]);
  });

  it("uses canonical layer when all regional layers share one url", () => {
    const fl = layer("u/0");
    expect(pickNationalSumLayers(fl, [layer("u/0/"), layer("u/0")], () => false)).toEqual([fl]);
  });

  it("uses all non-republic layers when urls differ", () => {
    const fl = layer("u/0");
    const a = layer("u/1");
    const b = layer("u/2");
    const rep = layer("u/9");
    const res = pickNationalSumLayers(fl, [a, b, rep], (l) => l === rep);
    expect(res).toEqual([a, b]);
  });
});
