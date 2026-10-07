jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));

import { preloadRegionYearMapImages, syncRegionYearLayerVisibility } from "./region-year-visibility";
import type { AgriLayerLike, AgriMapLike } from "../agri-layer-types";
import { collection, fields, makeLayer } from "./__test-utils__/fake-layer";

const polyFields = fields(["distrct_id", "esriFieldTypeInteger"], ["turi", "esriFieldTypeString"]);

function buildMap(): {
  map: AgriMapLike;
  group: AgriLayerLike;
  andijan2025: AgriLayerLike;
  fergana2025: AgriLayerLike;
  fergana2024: AgriLayerLike;
} {
  const group = makeLayer({ type: "group", visible: false });
  const andijan2025 = makeLayer({ title: "agri andijan 2025", visible: true, fields: polyFields, parent: group });
  const fergana2025 = makeLayer({
    title: "agri fergana 2025",
    visible: false,
    opacity: 0,
    minScale: 100000,
    fields: polyFields,
    parent: group,
  });
  const fergana2024 = makeLayer({ title: "agri fergana 2024", visible: true, fields: polyFields, parent: group });
  const groupNode = Object.assign(group, {
    layers: collection<AgriLayerLike>([andijan2025, fergana2025, fergana2024]),
  });
  return {
    map: { layers: collection<AgriLayerLike>([groupNode]) },
    group,
    andijan2025,
    fergana2025,
    fergana2024,
  };
}

describe("syncRegionYearLayerVisibility", () => {
  test("returns nothing without a map or a year", () => {
    expect(syncRegionYearLayerVisibility(null, { yil: "2025" })).toEqual([]);
    const { map, andijan2025 } = buildMap();
    expect(syncRegionYearLayerVisibility(map, { yil: "" })).toEqual([]);
    expect(andijan2025.visible).toBe(true);
  });

  test("shows only the matching region+year layer, filters it and hides the rest", () => {
    const { map, group, andijan2025, fergana2025, fergana2024 } = buildMap();
    const shown = syncRegionYearLayerVisibility(map, {
      yil: "2025",
      viloyat: "Farg'ona",
      districtCode: 1730424,
      turi: "paxta",
    });
    expect(shown.map((s) => s.layer)).toEqual([fergana2025]);
    expect(fergana2025.visible).toBe(true);
    expect(fergana2025.opacity).toBe(1);
    expect(fergana2025.minScale).toBe(0);
    expect(group.visible).toBe(true);
    expect(fergana2025.definitionExpression).toContain("distrct_id=1730424");
    expect(fergana2025.definitionExpression).toContain("turi='paxta'");
    expect(andijan2025.visible).toBe(false);
    expect(fergana2024.visible).toBe(false);
  });

  test("without a region every region-year layer is hidden", () => {
    const { map, andijan2025, fergana2025 } = buildMap();
    expect(syncRegionYearLayerVisibility(map, { yil: "2025" })).toEqual([]);
    expect(andijan2025.visible).toBe(false);
    expect(fergana2025.visible).toBe(false);
  });

  test("a shown MapImage with children filters its sublayers via uniqueIds", () => {
    const leaf = makeLayer({ id: 0, fields: fields(["uniqueid", "esriFieldTypeString"]) });
    const mapImage = makeLayer({
      type: "map-image",
      title: "Water Fergana 2025 year",
      sublayers: collection([leaf]),
    });
    const shown = syncRegionYearLayerVisibility(
      { layers: collection([mapImage]) },
      { yil: "2025", viloyat: "1730", uniqueIds: ["u1"] },
    );
    expect(shown).toHaveLength(1);
    expect(shown[0].sublayers).toEqual([leaf]);
    expect(leaf.visible).toBe(true);
    expect(leaf.definitionExpression).toBe("uniqueid IN ('u1')");
  });

  test("warns when a region is selected but no region-year layers exist", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    syncRegionYearLayerVisibility(
      { layers: collection([makeLayer({ title: "roads" })]) },
      { yil: "2025", viloyat: "Andijon" },
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("preloadRegionYearMapImages", () => {
  test("returns 0 without map or year", async () => {
    await expect(preloadRegionYearMapImages(null, "2025")).resolves.toBe(0);
    await expect(preloadRegionYearMapImages({ layers: collection([]) }, "")).resolves.toBe(0);
  });

  test("loads unloaded MapImage parents of matching leaves once, and blacklists failures", async () => {
    const load = jest.fn(() => Promise.resolve());
    const parent = makeLayer({ type: "map-image", title: "database 2025", url: "https://h/ok/MapServer", load });
    const a = makeLayer({ type: "sublayer", title: "agri andijan 2025", parent });
    const b = makeLayer({ type: "sublayer", title: "agri fergana 2025", parent });
    parent.allSublayers = collection([a, b]);

    const failLoad = jest.fn(() => Promise.reject(new Error("gone")));
    const dead = makeLayer({ type: "map-image", title: "agri namangan 2025", url: "https://h/dead/MapServer", load: failLoad });

    const map = { layers: collection<AgriLayerLike>([parent, dead]) };
    await expect(preloadRegionYearMapImages(map, "2025")).resolves.toBe(1);
    expect(load).toHaveBeenCalledTimes(1);
    expect(failLoad).toHaveBeenCalledTimes(1);

    await preloadRegionYearMapImages(map, "2025");
    expect(failLoad).toHaveBeenCalledTimes(1);
  });

  test("region filter restricts which parents are loaded", async () => {
    const loadA = jest.fn(() => Promise.resolve());
    const loadB = jest.fn(() => Promise.resolve());
    const a = makeLayer({ type: "map-image", title: "agri andijan 2026", load: loadA });
    const b = makeLayer({ type: "map-image", title: "agri buxoro 2026", load: loadB });
    await preloadRegionYearMapImages({ layers: collection([a, b]) }, "2026", "Buxoro");
    expect(loadA).not.toHaveBeenCalled();
    expect(loadB).toHaveBeenCalled();
  });
});
