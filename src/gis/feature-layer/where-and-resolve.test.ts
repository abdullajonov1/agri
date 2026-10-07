jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import {
  buildAgriWhere,
  ensureRegionYearMapImagesReady,
  getFeatureLayerFromView,
  medianFieldWithMavsumFallback,
  pickWhereWithProgressiveFallback,
  resolveFeatureLayerForFilters,
} from "./where-and-resolve";
import { invalidateAgriQueryCache } from "./layer-lookup";
import { getQueryUrl, valueIndexCache } from "./primitives";
import type { AgriLayerLike } from "../agri-layer-types";
import type { FakeQuery } from "./__test-utils__/fake-layer";
import {
  asFeatureSet,
  asQuery,
  collection,
  fields,
  makeLayer,
  uniqueLayerUrl,
} from "./__test-utils__/fake-layer";

describe("buildAgriWhere", () => {
  test("no filters → 1=1", () => {
    expect(buildAgriWhere({}, ["year"])).toBe("1=1");
  });

  test("year uses quoted year field, falls back to numeric yil, skips invalid years", () => {
    expect(buildAgriWhere({ yil: "2025" }, ["year"])).toBe("year='2025'");
    expect(buildAgriWhere({ yil: "2025" }, ["yil"])).toBe("yil=2025");
    expect(buildAgriWhere({ yil: "25" }, ["year"])).toBe("1=1");
    expect(buildAgriWhere({ yil: "2025", skipYearFilter: true }, ["year"])).toBe("1=1");
  });

  test("region and district use spelling variants; skipRegionFilter drops region", () => {
    const where = buildAgriWhere({ viloyat: "1703", tuman: "Asaka" }, ["viloyat", "tuman"]);
    expect(where).toContain("viloyat='Andijon viloyati'");
    expect(where).toContain("tuman='Asaka tumani'");
    expect(where).toContain(" AND ");
    expect(
      buildAgriWhere({ viloyat: "Andijon", skipRegionFilter: true }, ["viloyat"]),
    ).toBe("1=1");
  });

  test("mavsumOrValues ORs exact values; grouped mavsum expands", () => {
    expect(buildAgriWhere({ mavsumOrValues: ["A", "B"] }, ["mavsum"])).toBe(
      "(mavsum='A' OR mavsum='B')",
    );
    const grouped = buildAgriWhere({ mavsum: "Birlamchi" }, ["mavsum"]);
    expect(grouped).toContain("mavsum='Birlamchi va umummavsumiy'");
    expect(buildAgriWhere({ mavsum: "Bahor" }, ["mavsum"])).toBe("mavsum='Bahor'");
  });

  test("farmer tax number wins over farmer name", () => {
    expect(
      buildAgriWhere({ farmerTax: "123456789", fermer: "Ali" }, ["tax_number", "full_name"]),
    ).toBe("(tax_number='123456789' OR tax_number=123456789)");
    expect(buildAgriWhere({ fermer: "Ali" }, ["full_name"])).toBe("full_name='Ali'");
  });

  test("land type, manba, kanal and efficiency clauses", () => {
    const where = buildAgriWhere(
      { yerTuriId: "2", manba: "Daryo", kanal: "K1", effMin: 10, effMax: 90 },
      ["type_id", "real_name", "real_n1", "eff"],
    );
    expect(where).toBe(
      "type_id='2' AND real_name='Daryo' AND real_n1='K1' AND eff >= 10 AND eff <= 90",
    );
  });

  test("minMax variants", () => {
    expect(buildAgriWhere({ minMax: "Min" }, ["minmax"])).toBe("minmax='Min'");
    expect(buildAgriWhere({ minMax: "max" }, ["minmax"])).toBe("minmax='Max'");
    expect(buildAgriWhere({ minMax: "both" }, ["minmax"])).toBe("(minmax='Min' OR minmax='Max')");
    expect(buildAgriWhere({ minMax: "o'rta" }, ["minmax"])).toBe("minmax='o''rta'");
    expect(buildAgriWhere({ minMax: "min" }, ["other"])).toBe("1=1");
  });

  test("minMax uses indexed spellings when available", () => {
    const layer = makeLayer({ url: uniqueLayerUrl("minmax") });
    valueIndexCache.set(getQueryUrl(layer), { minmax: ["MIN", "min "] });
    expect(buildAgriWhere({ minMax: "min" }, ["minmax"], layer)).toBe(
      "(minmax='MIN' OR minmax='min ')",
    );
  });

  test("crop filter adds a crop clause", () => {
    expect(buildAgriWhere({ cropId: "5" }, ["crop_id"])).toContain("crop_id");
  });
});

/** Layer whose count depends on WHERE substrings. */
function countingLayer(count: (where: string) => number): AgriLayerLike {
  return makeLayer({
    title: uniqueLayerUrl("progressive"),
    createQuery: () => asQuery({}),
    queryFeatureCount: jest.fn((q?: unknown) => Promise.resolve(count(String((q as FakeQuery).where)))),
    queryFeatures: jest.fn(() =>
      Promise.resolve(asFeatureSet({ features: [{ attributes: { stat_med: 4 } }] })),
    ),
  });
}

describe("pickWhereWithProgressiveFallback", () => {
  beforeEach(() => invalidateAgriQueryCache(true));
  const available = ["year", "mavsum", "type_id"];
  const filters = { yil: "2025", mavsum: "Bahor", yerTuriId: "1" };

  test("strict WHERE wins when it has rows", async () => {
    const layer = countingLayer(() => 3);
    const res = await pickWhereWithProgressiveFallback(layer, filters, available);
    expect(res).toMatchObject({ count: 3, mavsumRelaxed: false, landTypeRelaxed: false });
    expect(res.where).toContain("mavsum='Bahor'");
  });

  test("drops mavsum first, then land type, then both", async () => {
    const noMavsum = countingLayer((w) => (w.includes("mavsum") ? 0 : 5));
    await expect(
      pickWhereWithProgressiveFallback(noMavsum, filters, available),
    ).resolves.toMatchObject({ count: 5, mavsumRelaxed: true, landTypeRelaxed: false });

    const noLand = countingLayer((w) => (w.includes("type_id") ? 0 : 6));
    await expect(
      pickWhereWithProgressiveFallback(noLand, filters, available),
    ).resolves.toMatchObject({ count: 6, mavsumRelaxed: false, landTypeRelaxed: true });

    const neither = countingLayer((w) => (w.includes("type_id") || w.includes("mavsum") ? 0 : 7));
    await expect(
      pickWhereWithProgressiveFallback(neither, filters, available),
    ).resolves.toMatchObject({ count: 7, mavsumRelaxed: true, landTypeRelaxed: true });
  });

  test("no relaxation when a tuman is selected; returns last attempt with count 0", async () => {
    const layer = countingLayer((w) => (w.includes("mavsum") ? 0 : 5));
    const res = await pickWhereWithProgressiveFallback(
      layer,
      { ...filters, tuman: "Asaka" },
      [...available, "tuman"],
    );
    expect(res).toMatchObject({ count: 0, mavsumRelaxed: false, landTypeRelaxed: false });
    expect(res.where).toContain("mavsum='Bahor'");
  });

  test("applies scoped flags and wraps the polygon filter", async () => {
    const layer = countingLayer(() => 1);
    const res = await pickWhereWithProgressiveFallback(layer, { yil: "2025" }, ["year"], {
      yearScoped: true,
      polygonFilter: "uniqueid IN ('a')",
    });
    expect(res.where).toBe("(1=1) AND (uniqueid IN ('a'))");
  });

  test("medianFieldWithMavsumFallback computes the median on the picked WHERE", async () => {
    const layer = countingLayer(() => 2);
    await expect(medianFieldWithMavsumFallback(layer, "a", "b", "ndvi")).resolves.toBe(4);
  });
});

describe("layer resolution from a map view", () => {
  const fieldLayer = (title: string, url: string): AgriLayerLike =>
    makeLayer({
      title,
      url,
      loaded: true,
      fields: fields(["uniqueid"], ["year"]),
      createQuery: () => asQuery({}),
      queryFeatures: () => Promise.resolve(asFeatureSet({ features: [] })),
    });

  const andijan = fieldLayer("agri andijan 2025", "https://h/svc/MapServer/1");
  const fergana = fieldLayer("agri fergana 2025", "https://h/svc/MapServer/2");
  const view = { view: { map: { allLayers: collection([andijan, fergana]) } } };

  test("returns null without a map or candidates", async () => {
    await expect(resolveFeatureLayerForFilters(null, { yil: "2025" })).resolves.toBeNull();
    await expect(
      resolveFeatureLayerForFilters({ view: { map: { allLayers: collection([]) } } }, {}),
    ).resolves.toBeNull();
  });

  test("picks the layer matching the selected region and year", async () => {
    const res = await resolveFeatureLayerForFilters(view, { yil: "2025", viloyat: "Farg'ona" });
    expect(res?.layer).toBe(fergana);
    expect(res?.fields).toEqual(["uniqueid", "year"]);
    expect(res?.regionScoped).toBe(true);
    expect(res?.yearScoped).toBe(true);
  });

  test("getFeatureLayerFromView returns the first candidate without filters", async () => {
    await expect(getFeatureLayerFromView(view)).resolves.toEqual({
      layer: andijan,
      fields: ["uniqueid", "year"],
    });
    await expect(getFeatureLayerFromView(view, { viloyat: "Andijon" })).resolves.toMatchObject({
      layer: andijan,
    });
    await expect(getFeatureLayerFromView({ view: null })).resolves.toBeNull();
  });
});

describe("ensureRegionYearMapImagesReady", () => {
  test("short-circuits without map, wait budget or year", async () => {
    await expect(ensureRegionYearMapImagesReady(null, "2025")).resolves.toMatchObject({
      timedOut: false,
    });
    const map = { layers: collection<AgriLayerLike>([]) };
    await expect(ensureRegionYearMapImagesReady(map, "2025", "", 0)).resolves.toMatchObject({
      timedOut: false,
    });
    const res = await ensureRegionYearMapImagesReady(map, " ");
    await expect(res.preload).resolves.toBe(0);
  });
});
