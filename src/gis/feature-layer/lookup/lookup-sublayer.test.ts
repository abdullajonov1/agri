jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { buildSublayerDefinitionExpression, forceSublayersVisible } from "./lookup-sublayer";
import { collection, fields, makeLayer } from "../__test-utils__/fake-layer";

const sub = makeLayer({
  fields: fields(
    ["distrct_id", "esriFieldTypeInteger"],
    ["turi", "esriFieldTypeString"],
    ["uniqueid", "esriFieldTypeString"],
    ["vh", "esriFieldTypeString"],
  ),
});

describe("buildSublayerDefinitionExpression", () => {
  test("no filters → 1=1", () => {
    expect(buildSublayerDefinitionExpression(sub, "", [])).toBe("1=1");
  });

  test("district code + crop turi are ANDed", () => {
    const expr = buildSublayerDefinitionExpression(sub, "Rishton", "paxta", "", null, 1730424);
    expect(expr.startsWith("distrct_id=1730424 AND ")).toBe(true);
    expect(expr).toContain("turi='paxta'");
  });

  test("empty uniqueId list matches nothing", () => {
    expect(buildSublayerDefinitionExpression(sub, "", "paxta", "", [])).toBe("1=0");
  });

  test("uniqueIds replace turi unless andTuriWithUniqueIds is set", () => {
    expect(buildSublayerDefinitionExpression(sub, "", "paxta", "", ["a", "b'c"])).toBe(
      "uniqueid IN ('a','b''c')",
    );
    const withTuri = buildSublayerDefinitionExpression(sub, "", "paxta", "", ["a"], null, true);
    expect(withTuri.startsWith("uniqueid IN ('a') AND ")).toBe(true);
    expect(withTuri).toContain("turi='paxta'");
  });

  test("large uniqueId lists are chunked into 800-item IN clauses", () => {
    const ids = Array.from({ length: 1700 }, (_, i) => `id${i}`);
    const expr = buildSublayerDefinitionExpression(sub, "", "", "", ids);
    expect(expr.match(/uniqueid IN \(/g)).toHaveLength(3);
    expect(expr.startsWith("(")).toBe(true);
  });

  test("legacy vh category adds the ndvi_status token variant", () => {
    expect(buildSublayerDefinitionExpression(sub, "", [], "4-Past")).toBe(
      "(vh='4-Past' OR vh='past')",
    );
    expect(buildSublayerDefinitionExpression(sub, "", [], "custom")).toBe("vh='custom'");
  });

  test("vh is skipped when the layer has fields but none named vh", () => {
    const noVh = makeLayer({ fields: fields(["turi", "esriFieldTypeString"]) });
    expect(buildSublayerDefinitionExpression(noVh, "", [], "4-Past")).toBe("1=1");
  });
});

describe("forceSublayersVisible", () => {
  test("shows every sublayer, clears scales, filters leaves and clears group expressions", () => {
    const leafA = makeLayer({ id: 1, fields: sub.fields, minScale: 100, definitionExpression: "1=0" });
    const group = makeLayer({
      id: 2,
      definitionExpression: "x=1",
      sublayers: collection([leafA]),
    });
    const root = makeLayer({ sublayers: collection([group]) });
    const report = forceSublayersVisible(root, "", "paxta");
    expect(group.visible).toBe(true);
    expect(group.definitionExpression).toBeNull();
    expect(leafA.visible).toBe(true);
    expect(leafA.minScale).toBe(0);
    expect(leafA.definitionExpression).toContain("turi='paxta'");
    expect(report.map((r) => r.id)).toEqual([2, 1]);
    expect(report[1].definitionExpressionBefore).toBe("1=0");
  });

  test("returns the accumulator unchanged for layers without sublayers", () => {
    expect(forceSublayersVisible(makeLayer(), "", "")).toEqual([]);
  });
});
