jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { buildCropSelectionWhere, prepareValueIndex, textMatchClause } from "./where-clauses";
import { getQueryUrl, valueIndexCache } from "./primitives";
import type { AgriLayerLike } from "../agri-layer-types";
import { asFeatureSet, asQuery, fields, makeLayer, uniqueLayerUrl } from "./__test-utils__/fake-layer";

/** Layer returning distinct values per requested outFields[0]. */
function indexedLayer(values: Record<string, string[]>): AgriLayerLike {
  let lastField = "";
  return makeLayer({
    url: uniqueLayerUrl("index"),
    createQuery: () => {
      const q: Record<string, unknown> = {};
      return asQuery(
        new Proxy(q, {
          set(target, prop, value) {
            if (prop === "outFields") lastField = String((value as string[])[0]);
            target[String(prop)] = value;
            return true;
          },
        }),
      );
    },
    queryFeatures: jest.fn(() => {
      const field = lastField;
      return Promise.resolve(
        asFeatureSet({ features: (values[field] ?? []).map((v) => ({ attributes: { [field]: v } })) }),
      );
    }),
  });
}

describe("prepareValueIndex", () => {
  test("loads distinct values for indexable fields once per layer", async () => {
    const layer = indexedLayer({ mavsum: ["Bahor", "Kuz"], tuman: ["Asaka tumani"] });
    await Promise.all([
      prepareValueIndex(layer, ["mavsum", "tuman", "area_ha"]),
      prepareValueIndex(layer, ["mavsum", "tuman", "area_ha"]),
    ]);
    expect(valueIndexCache.get(getQueryUrl(layer))).toEqual({
      mavsum: ["Bahor", "Kuz"],
      tuman: ["Asaka tumani"],
    });
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
    await prepareValueIndex(layer, ["mavsum"]);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(2);
  });

  test("is a no-op for layers without URL", async () => {
    await expect(prepareValueIndex(makeLayer(), ["mavsum"])).resolves.toBeUndefined();
  });

  test("indexed values drive textMatchClause", async () => {
    const layer = indexedLayer({ tuman: ["Asaka tumani"] });
    await prepareValueIndex(layer, ["tuman"]);
    expect(textMatchClause(["tuman"], ["tuman"], "Asaka", layer, "district")).toBe(
      "tuman='Asaka tumani'",
    );
  });
});

describe("textMatchClause region kind", () => {
  test("string region_id gets the quoted SOATO code", () => {
    const layer = makeLayer({ fields: fields(["region_id", "esriFieldTypeString"]) });
    expect(textMatchClause(["region_id"], ["region_id"], "Andijon", layer, "region")).toBe(
      "region_id='1703'",
    );
  });

  test("unknown region on an id-only layer falls back to name variants", () => {
    expect(textMatchClause(["region_id"], ["region_id"], "Atlantis", null, "region")).toBe(
      "(region_id='Atlantis' OR region_id='Atlantis viloyati')",
    );
  });

  test("indexed viloyat values are preferred", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("vil") });
    valueIndexCache.set(getQueryUrl(layer), { viloyat: ["ANDIJON VILOYATI"] });
    expect(textMatchClause(["viloyat"], ["viloyat"], "1703", layer, "region")).toBe(
      "viloyat='ANDIJON VILOYATI'",
    );
  });

  test("returns empty for empty default-kind value", () => {
    expect(textMatchClause(["mavsum"], ["mavsum"], "  ")).toBe("");
  });
});

describe("buildCropSelectionWhere", () => {
  test("numeric id on a string crop_id field is quoted", () => {
    const layer = makeLayer({ fields: fields(["crop_id", "esriFieldTypeString"]) });
    expect(buildCropSelectionWhere("", "5", ["crop_id"], layer)).toBe("crop_id='5'");
  });

  test("id and name are ORed", () => {
    expect(buildCropSelectionWhere("Paxta", "5", ["crop_id", "crop"])).toBe(
      "(crop_id=5 OR crop='Paxta')",
    );
  });

  test("non-numeric id uses text terms; skipped when field list unknown", () => {
    expect(buildCropSelectionWhere("", "abc", ["crop_id"])).toBe("crop_id='abc'");
    expect(buildCropSelectionWhere("", "abc", [])).toBe("");
  });

  test("name without field metadata uses apostrophe variants on crop", () => {
    expect(buildCropSelectionWhere("Paxta", null, [])).toBe("crop='Paxta'");
    expect(buildCropSelectionWhere("Bug'doy", null, [])).toContain("crop='Bug''doy'");
    expect(buildCropSelectionWhere("Paxta", null, ["crop_id"])).toBe("");
    expect(buildCropSelectionWhere("", "", ["crop"])).toBe("");
  });
});
