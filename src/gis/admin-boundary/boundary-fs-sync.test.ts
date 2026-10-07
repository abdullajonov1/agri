jest.mock("./boundary-modules", () => ({
  getAgriDistrictBoundaryFallbackUrl: () => "https://s/Tuman_chegara/0",
  getAgriDistrictBoundaryUrl: () => "https://s/Hosted/district/3",
}));

import type FeatureLayer from "esri/layers/FeatureLayer";
import type EsriMap from "esri/Map";
import { AGRI_DISTRICT_FS_LAYER_ID } from "./boundary-graphics";
import { syncDistrictsViaMapFeatureLayer } from "./boundary-fs-sync";

type Props = Record<string, unknown>;

interface LayerBehaviour {
  load?: () => Promise<void>;
  count?: (where: string) => Promise<number>;
  fields?: Array<{ name: string; type: string }>;
}

/** Build a FeatureLayer stand-in whose behaviour depends on its url. */
function makeFeatureLayerClass(byUrl: Record<string, LayerBehaviour>): typeof FeatureLayer {
  class FakeFL {
    [key: string]: unknown;
    url = "";
    fields: Array<{ name: string; type: string }> = [];
    constructor(props: Props) {
      Object.assign(this, props);
      this.fields = byUrl[this.url]?.fields ?? [];
    }
    load(): Promise<void> {
      return byUrl[this.url]?.load?.() ?? Promise.resolve();
    }
    createQuery(): Props {
      return {};
    }
    queryFeatureCount(q: { where: string }): Promise<number> {
      return byUrl[this.url]?.count?.(q.where) ?? Promise.resolve(0);
    }
  }
  return FakeFL as unknown as typeof FeatureLayer;
}

function fakeMap(): { map: EsriMap; items: Props[] } {
  const items: Props[] = [];
  const map = {
    layers: {
      find: (p: (l: Props) => boolean) => items.find(p),
      toArray: () => items.slice(),
      get length() {
        return items.length;
      },
    },
    add: (l: Props) => items.push(l),
    remove: (l: Props) => {
      const i = items.indexOf(l);
      if (i >= 0) items.splice(i, 1);
    },
    reorder: jest.fn(),
  };
  return { map: map as unknown as EsriMap, items };
}

const filter = {
  parentCod: 1703,
  viloyat: "Andijon",
  districtNames: [] as string[],
  districtCodes: [] as Array<number | string>,
};

describe("syncDistrictsViaMapFeatureLayer", () => {
  test("hidden borders clear the live layer and return empty", async () => {
    const { map, items } = fakeMap();
    items.push({ id: AGRI_DISTRICT_FS_LAYER_ID });
    const res = await syncDistrictsViaMapFeatureLayer({
      map,
      FeatureLayer: makeFeatureLayerClass({}),
      bordersVisible: false,
      ...filter,
    });
    expect(res).toEqual({ count: 0, mode: "none", field: null, url: "" });
    expect(items).toHaveLength(0);
  });

  test("applies the first plausible WHERE on chegara and labels it", async () => {
    const { map, items } = fakeMap();
    const FL = makeFeatureLayerClass({
      "https://s/Tuman_chegara/0": {
        fields: [
          { name: "soato", type: "esriFieldTypeString" },
          { name: "tuman_nomi", type: "esriFieldTypeString" },
        ],
        count: () => Promise.resolve(14),
      },
    });
    const res = await syncDistrictsViaMapFeatureLayer({ map, FeatureLayer: FL, bordersVisible: true, ...filter });
    expect(res.count).toBe(14);
    expect(res.url).toBe("https://s/Tuman_chegara/0");
    expect(res.mode.startsWith("fs:")).toBe(true);
    const layer = items[0];
    expect(layer.visible).toBe(true);
    expect(String(layer.definitionExpression)).toContain("1703");
    expect(layer.labelsVisible).toBe(true);
    expect(layer.labelingInfo).toEqual([
      expect.objectContaining({ labelExpressionInfo: { expression: '$feature["tuman_nomi"]' } }),
    ]);
  });

  test("rejects implausible counts and falls through to the next service", async () => {
    const { map, items } = fakeMap();
    const FL = makeFeatureLayerClass({
      "https://s/Tuman_chegara/0": {
        fields: [{ name: "soato", type: "esriFieldTypeString" }],
        count: () => Promise.resolve(500),
      },
      "https://s/Hosted/district/3": {
        fields: [{ name: "parent_cod", type: "esriFieldTypeInteger" }],
        count: () => Promise.resolve(10),
      },
    });
    const res = await syncDistrictsViaMapFeatureLayer({ map, FeatureLayer: FL, bordersVisible: true, ...filter });
    expect(res.url).toBe("https://s/Hosted/district/3");
    expect(res.count).toBe(10);
    expect(items).toHaveLength(1);
    expect(items[0].url).toBe("https://s/Hosted/district/3");
  });

  test("load failures and query errors end in a cleared empty result", async () => {
    const { map, items } = fakeMap();
    const FL = makeFeatureLayerClass({
      "https://s/Tuman_chegara/0": { load: () => Promise.reject(new Error("401")) },
      "https://s/Hosted/district/3": {
        fields: [{ name: "soato", type: "esriFieldTypeString" }],
        count: () => Promise.reject(new Error("bad where")),
      },
    });
    const res = await syncDistrictsViaMapFeatureLayer({ map, FeatureLayer: FL, bordersVisible: true, ...filter });
    expect(res).toEqual({ count: 0, mode: "none", field: null, url: "" });
    expect(items).toHaveLength(0);
  });
});
