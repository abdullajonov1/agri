import { isRepublicFeatureLayer, pickDefaultFeatureLayer } from "./panel-layer-helpers";

describe("isRepublicFeatureLayer", () => {
  test("matches title/id/url on word boundary", () => {
    expect(isRepublicFeatureLayer({ title: "Respublika" })).toBe(true);
    expect(isRepublicFeatureLayer({ url: "https://x/republic/MapServer/0" })).toBe(true);
    expect(isRepublicFeatureLayer({ title: "Sirdaryo" })).toBe(false);
    expect(isRepublicFeatureLayer(null)).toBe(false);
    expect(isRepublicFeatureLayer(undefined)).toBe(false);
  });
});

describe("pickDefaultFeatureLayer", () => {
  const fb = { title: "fallback" };
  test("empty -> fallback", () => {
    expect(pickDefaultFeatureLayer([], fb)).toBe(fb);
    expect(pickDefaultFeatureLayer(null, fb)).toBe(fb);
  });
  test("prefers republic layer else first", () => {
    const a = { title: "A" };
    const r = { title: "Respublika" };
    expect(pickDefaultFeatureLayer([a, r], fb)).toBe(r);
    expect(pickDefaultFeatureLayer([a], fb)).toBe(a);
    expect(pickDefaultFeatureLayer([r, a], fb, (l) => l.title === "A")).toBe(a);
  });
});
