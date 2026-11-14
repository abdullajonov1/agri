import { asLayerLike, requireLayerLike, asObjectRecord } from "./layer-like";

describe("layer-like", () => {
  const valid = { createQuery: () => ({}), queryFeatures: async () => ({ features: [] }) };

  it("returns the same object for a valid layer", () => {
    expect(asLayerLike(valid)).toBe(valid);
  });

  it("returns null for null, primitives and objects missing query methods", () => {
    expect(asLayerLike(null)).toBeNull();
    expect(asLayerLike(undefined)).toBeNull();
    expect(asLayerLike("x")).toBeNull();
    expect(asLayerLike({ createQuery: () => ({}) })).toBeNull();
  });

  it("requireLayerLike throws for an invalid value", () => {
    expect(() => requireLayerLike(null)).toThrow("Report layer is unavailable");
    expect(requireLayerLike(valid)).toBe(valid);
  });

  it("asObjectRecord accepts objects only", () => {
    const o = {};
    expect(asObjectRecord(o)).toBe(o);
    expect(asObjectRecord(null)).toBeNull();
    expect(asObjectRecord(1)).toBeNull();
  });
});
