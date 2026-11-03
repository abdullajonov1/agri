const mockLoad = jest.fn<Promise<unknown[]>, [string[]]>();
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]) => mockLoad(mods),
}));
jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
const mockAccess = jest.fn((where: string, _fields: string[]): string => where);
jest.mock("../shared/agri-access-config", () => ({
  ...jest.requireActual("../shared/agri-access-config"),
  combineAccessWhereIfFieldsExist: (where: string, fields: string[]): string => mockAccess(where, fields),
}));

import {
  buildLandLayerWhere,
  holdInactiveLandLayersHidden,
  syncAgriLandLayers,
  type AgriLandScope,
} from "./agri-land-layers";

const SCOPE: AgriLandScope = { yil: "2026", viloyat: "Sirdaryo viloyati", tuman: "", lockedViloyat: "" };

const textFields = [
  { name: "yil", type: "string" },
  { name: "viloyat", type: "string" },
  { name: "tuman", type: "string" },
  { name: "district", type: "string" },
] as __esri.Field[];

interface FakeLayer {
  type: string;
  url: string;
  title: string;
  visible: boolean;
  definitionExpression: string;
  fields: __esri.Field[];
  load: jest.Mock;
}

const fakeLayer = (over: Partial<FakeLayer>): FakeLayer => ({
  type: "feature",
  url: "",
  title: "",
  visible: false,
  definitionExpression: "",
  fields: textFields,
  load: jest.fn(async (): Promise<void> => undefined),
  ...over,
});

const viewOf = (layers: FakeLayer[], add = jest.fn()): __esri.MapView =>
  ({ map: { allLayers: { toArray: () => layers }, add } }) as unknown as __esri.MapView;

describe("buildLandLayerWhere", () => {
  it("scopes a text year column to year and viloyat", () => {
    const where = buildLandLayerWhere({ fields: textFields }, SCOPE);
    expect(where).toContain("yil LIKE '2026%'");
    expect(where).toContain("viloyat");
    expect(where).toContain("Sirdaryo");
  });

  it("applies the access rules using the layer's own fields", () => {
    mockAccess.mockReturnValueOnce("ACCESS");
    expect(buildLandLayerWhere({ fields: textFields }, SCOPE)).toBe("ACCESS");
    expect(mockAccess.mock.calls.pop()?.[1]).toEqual(["yil", "viloyat", "tuman", "district"]);
  });

  it("compares a numeric `year` column as a number", () => {
    const fields = [{ name: "Year", type: "integer" }] as __esri.Field[];
    expect(buildLandLayerWhere({ fields }, { ...SCOPE, viloyat: "" })).toContain("Year = 2026");
  });

  it("prefers the locked viloyat", () => {
    const where = buildLandLayerWhere({ fields: textFields }, { ...SCOPE, lockedViloyat: "Andijon viloyati" });
    expect(where).toContain("Andijon");
    expect(where).not.toContain("Sirdaryo");
  });

  it("uses `district` for a numeric tuman and `tuman` for a name", () => {
    expect(buildLandLayerWhere({ fields: textFields }, { ...SCOPE, tuman: "1724" })).toContain("district = '1724'");
    expect(buildLandLayerWhere({ fields: textFields }, { ...SCOPE, tuman: "Guliston" })).toContain("Guliston");
  });

  it("is empty until the layer has a year column and a year is chosen", () => {
    expect(buildLandLayerWhere({ fields: textFields }, { ...SCOPE, yil: "" })).toBe("");
    expect(buildLandLayerWhere({ fields: [] }, SCOPE)).toBe("");
  });
});

describe("syncAgriLandLayers", () => {
  const reserve = (): FakeLayer => fakeLayer({
    url: "https://x/Agriculture/Agri_reserve_land/FeatureServer/1",
  });
  const unused = (): FakeLayer => fakeLayer({ title: "Agri unused land" });

  it("shows the active layer filtered and hides the other one", async () => {
    const r = reserve();
    const u = { ...unused(), visible: true };
    await syncAgriLandLayers(viewOf([r, u]), "reserve", SCOPE);
    expect(r.visible).toBe(true);
    expect(r.definitionExpression).toContain("yil LIKE '2026%'");
    expect(u.visible).toBe(false);
  });

  it("switching overlays swaps the visible layer", async () => {
    const r = reserve();
    const u = unused();
    await syncAgriLandLayers(viewOf([r, u]), "reserve", SCOPE);
    await syncAgriLandLayers(viewOf([r, u]), "unused", SCOPE);
    expect(r.visible).toBe(false);
    expect(u.visible).toBe(true);
  });

  it("hides the field layers so only the land polygons stay on the map", async () => {
    const r = reserve();
    const fields = fakeLayer({ title: "agri sirdaryo 2026 year", visible: true });
    const roads = fakeLayer({ title: "roads", visible: true });
    await syncAgriLandLayers(viewOf([r, fields, roads]), "reserve", SCOPE);
    expect(r.visible).toBe(true);
    expect(fields.visible).toBe(false);
    expect(roads.visible).toBe(true);
  });

  it("leaves the field layers alone when no overlay is on", async () => {
    const fields = fakeLayer({ title: "agri sirdaryo 2026 year", visible: true });
    await syncAgriLandLayers(viewOf([fields]), null, SCOPE);
    expect(fields.visible).toBe(true);
  });

  it("hides both when nothing is active", async () => {
    const r = { ...reserve(), visible: true };
    const u = { ...unused(), visible: true };
    await syncAgriLandLayers(viewOf([r, u]), null, SCOPE);
    expect([r.visible, u.visible]).toEqual([false, false]);
  });

  it("narrows the reserve layer to the crop picked on the chart", async () => {
    const r = reserve();
    await syncAgriLandLayers(viewOf([r]), "reserve", SCOPE, "turi IN ('Paxta')");
    expect(r.definitionExpression).toContain("yil LIKE '2026%'");
    expect(r.definitionExpression.endsWith(") AND (turi IN ('Paxta'))")).toBe(true);
  });

  it("colours the filtered layer before showing it", async () => {
    const r = reserve();
    const seen: Array<[string, boolean]> = [];
    const beforeShow = jest.fn(async (layer: __esri.FeatureLayer) => {
      seen.push([layer.definitionExpression, layer.visible]);
    });
    await syncAgriLandLayers(viewOf([r]), "reserve", SCOPE, "", beforeShow);
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toContain("yil LIKE '2026%'");
    expect(seen[0][1]).toBe(false);
    expect(r.visible).toBe(true);
  });

  it("still shows the polygons when colouring fails", async () => {
    const u = unused();
    await syncAgriLandLayers(viewOf([u]), "unused", SCOPE, "", async () => {
      throw new Error("no rows");
    });
    expect(u.visible).toBe(true);
  });

  it("does not colour a layer with nothing to show", async () => {
    const beforeShow = jest.fn(async () => undefined);
    await syncAgriLandLayers(viewOf([reserve()]), "reserve", { ...SCOPE, yil: "" }, "", beforeShow);
    expect(beforeShow).not.toHaveBeenCalled();
  });

  it("ignores a crop pick for the unused layer and before a year is known", async () => {
    const u = unused();
    await syncAgriLandLayers(viewOf([u]), "unused", SCOPE, "turi IN ('Paxta')");
    expect(u.definitionExpression).not.toContain("Paxta");
    const r = reserve();
    await syncAgriLandLayers(viewOf([r]), "reserve", { ...SCOPE, yil: "" }, "turi IN ('Paxta')");
    expect(r.definitionExpression).toBe("1=0");
  });

  it("republic: draws nothing on the map and loads nothing", async () => {
    const r = { ...reserve(), visible: true };
    const add = jest.fn();
    const republic = { ...SCOPE, viloyat: "" };
    mockLoad.mockClear();
    await syncAgriLandLayers(viewOf([r], add), "reserve", republic);
    expect(r.visible).toBe(false);
    expect(r.load).not.toHaveBeenCalled();
    await syncAgriLandLayers(viewOf([], add), "unused", republic);
    expect(add).not.toHaveBeenCalled();
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("a locked viloyat is not the republic", async () => {
    const r = reserve();
    await syncAgriLandLayers(viewOf([r]), "reserve", { ...SCOPE, viloyat: "", lockedViloyat: "Andijon viloyati" });
    expect(r.visible).toBe(true);
  });

  it("draws nothing before a year is known", async () => {
    const r = reserve();
    await syncAgriLandLayers(viewOf([r]), "reserve", { ...SCOPE, yil: "" });
    expect(r.definitionExpression).toBe("1=0");
  });

  it("ignores a non-feature layer that only shares the name", async () => {
    class FakeFeatureLayer {
      url: string;
      visible: boolean;
      definitionExpression = "";
      fields = textFields;
      constructor(props: { url: string; visible: boolean }) {
        this.url = props.url;
        this.visible = props.visible;
      }
      load(): Promise<void> {
        return Promise.resolve();
      }
    }
    mockLoad.mockResolvedValue([FakeFeatureLayer]);
    const add = jest.fn();
    const group = fakeLayer({ type: "group", title: "Agri reserve land" });
    await syncAgriLandLayers(viewOf([group], add), "reserve", SCOPE);
    const added = add.mock.calls[0][0] as FakeFeatureLayer;
    expect(added.url).toMatch(/Agri_reserve_land\/FeatureServer\/1$/);
    expect(added.visible).toBe(true);
    expect(group.visible).toBe(false);
  });

  it("a newer sync wins over one still loading", async () => {
    let finishLoad: () => void = () => undefined;
    const r = reserve();
    r.load.mockImplementation(() => new Promise<void>((resolve) => { finishLoad = resolve; }));
    const u = unused();
    const first = syncAgriLandLayers(viewOf([r, u]), "reserve", SCOPE);
    await syncAgriLandLayers(viewOf([r, u]), "unused", SCOPE);
    finishLoad();
    await first;
    expect(r.visible).toBe(false);
    expect(u.visible).toBe(true);
  });
});

describe("holdInactiveLandLayersHidden", () => {
  const watchedView = (layers: FakeLayer[]) => {
    let onChange: (() => void) | null = null;
    const remove = jest.fn();
    const view = {
      map: {
        allLayers: {
          toArray: () => layers,
          on: (_name: string, cb: () => void) => {
            onChange = cb;
            return { remove };
          },
        },
      },
    } as unknown as __esri.MapView;
    return { view, remove, fireChange: () => onChange?.() };
  };

  it("hides WebMap land layers that start switched on, without loading them", () => {
    const r = fakeLayer({ title: "agri reserve land", visible: true });
    const u = fakeLayer({ url: "https://x/Agri_unused_land/FeatureServer/0", visible: true });
    const { view } = watchedView([r, u]);
    holdInactiveLandLayersHidden(view, () => null);
    expect([r.visible, u.visible]).toEqual([false, false]);
    expect(r.load).not.toHaveBeenCalled();
    expect(u.load).not.toHaveBeenCalled();
  });

  it("hides a land layer that arrives later, but not the one switched on", () => {
    const layers: FakeLayer[] = [];
    const { view, fireChange } = watchedView(layers);
    let active: "reserve" | null = null;
    holdInactiveLandLayersHidden(view, () => active);
    const r = fakeLayer({ title: "agri reserve land", visible: true });
    layers.push(r);
    fireChange();
    expect(r.visible).toBe(false);
    active = "reserve";
    r.visible = true;
    fireChange();
    expect(r.visible).toBe(true);
  });

  it("returns the unsubscribe", () => {
    const { view, remove } = watchedView([]);
    holdInactiveLandLayersHidden(view, () => null)();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
