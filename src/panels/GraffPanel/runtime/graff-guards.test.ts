jest.mock("../../../gis/feature-layer-data", () => ({
  isMapImageOwnedLayer: (layer: { owned?: boolean }): boolean => layer.owned === true,
}));

import {
  applyGraffDefinitionExpression,
  asThrownObject,
  describeThrown,
  eventDetail,
  setDataSourceDefinitionExpression,
  thrownMessage,
  thrownName,
  thrownStatus,
} from "./graff-guards";

describe("thrown value guards", () => {
  test("thrownMessage reads string messages only", () => {
    expect(thrownMessage(new Error("boom"))).toBe("boom");
    expect(thrownMessage({ message: 42 })).toBeUndefined();
    expect(thrownMessage("text")).toBeUndefined();
    expect(thrownMessage(null)).toBeUndefined();
  });

  test("thrownName reads string names only", () => {
    expect(thrownName(new TypeError("x"))).toBe("TypeError");
    expect(thrownName({ name: 1 })).toBeUndefined();
    expect(thrownName(undefined)).toBeUndefined();
  });

  test("asThrownObject and thrownStatus", () => {
    expect(asThrownObject(5)).toBeNull();
    expect(asThrownObject({ status: 404 })).toEqual({ status: 404 });
    expect(thrownStatus({ status: 500 })).toBe(500);
    expect(thrownStatus("nope")).toBeUndefined();
  });

  test("describeThrown falls back to String()", () => {
    expect(describeThrown(new Error("bad"))).toBe("bad");
    expect(describeThrown("plain")).toBe("plain");
    expect(describeThrown(null)).toBe("null");
  });
});

describe("eventDetail", () => {
  test("returns object detail of CustomEvent", () => {
    const ev = new CustomEvent<{ a: number }>("x", { detail: { a: 1 } });
    expect(eventDetail<{ a: number }>(ev)).toEqual({ a: 1 });
  });

  test("returns {} for plain events, primitives and nullish", () => {
    expect(eventDetail(new Event("x"))).toEqual({});
    expect(eventDetail(new CustomEvent("x", { detail: 5 }))).toEqual({});
    expect(eventDetail(null)).toEqual({});
    expect(eventDetail(undefined)).toEqual({});
  });
});

describe("definition expressions", () => {
  test("setDataSourceDefinitionExpression calls method when present", () => {
    const setDefinitionExpression = jest.fn();
    setDataSourceDefinitionExpression({ setDefinitionExpression }, "a=1");
    expect(setDefinitionExpression).toHaveBeenCalledWith("a=1");
    expect(() => setDataSourceDefinitionExpression({}, "a=1")).not.toThrow();
    expect(() => setDataSourceDefinitionExpression(null, "a=1")).not.toThrow();
    expect(() => setDataSourceDefinitionExpression("ds", "a=1")).not.toThrow();
  });

  test("applyGraffDefinitionExpression sets layer unless map-image owned", () => {
    const ds = { setDefinitionExpression: jest.fn() };
    const layer = { definitionExpression: "" } as unknown as __esri.FeatureLayer;
    applyGraffDefinitionExpression(layer, ds, "x=1");
    expect(layer.definitionExpression).toBe("x=1");
    expect(ds.setDefinitionExpression).toHaveBeenCalledWith("x=1");

    const owned = { definitionExpression: "keep", owned: true } as unknown as __esri.FeatureLayer;
    applyGraffDefinitionExpression(owned, ds, "y=2");
    expect(owned.definitionExpression).toBe("keep");

    applyGraffDefinitionExpression(null, ds, "z=3");
    expect(ds.setDefinitionExpression).toHaveBeenLastCalledWith("z=3");
  });
});
