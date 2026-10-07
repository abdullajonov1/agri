// All `esri/*` specifiers resolve to one mapped module, so one mock serves every class.
jest.mock("esri/Color", () => ({
  __esModule: true,
  default: class {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

import {
  buildSelectionSymbol,
  clearMapSelectionGraphics,
  isAgriSpatialLayerUrl,
  isLayerTreeVisible,
} from "./graff-map-utils";

interface FakeSymbol {
  props: { width?: number; size?: number; outline?: FakeSymbol; color?: unknown };
}

describe("isAgriSpatialLayerUrl", () => {
  test("accepts internal agri services", () => {
    expect(isAgriSpatialLayerUrl("https://x/arcgis/rest/services/Agri_table/MapServer/0")).toBe(true);
  });
  test("rejects empty, basemap and non-agri urls", () => {
    expect(isAgriSpatialLayerUrl("")).toBe(false);
    expect(isAgriSpatialLayerUrl("https://services.arcgisonline.com/agri")).toBe(false);
    expect(isAgriSpatialLayerUrl("https://tiles.arcgis.com/agri")).toBe(false);
    expect(isAgriSpatialLayerUrl("https://x/rest/services/water/MapServer")).toBe(false);
  });
});

describe("isLayerTreeVisible", () => {
  test("false for nullish", () => {
    expect(isLayerTreeVisible(null)).toBe(false);
  });
  test("walks parents and layer links", () => {
    const root = { visible: true };
    const group = { visible: true, parent: root };
    expect(isLayerTreeVisible({ visible: true, parent: group })).toBe(true);
    expect(isLayerTreeVisible({ visible: true, layer: { visible: false } })).toBe(false);
    expect(isLayerTreeVisible({ visible: false })).toBe(false);
  });
  test("terminates on cycles", () => {
    const a: { visible: boolean; parent?: unknown } = { visible: true };
    const b = { visible: true, parent: a };
    a.parent = b;
    expect(isLayerTreeVisible(a)).toBe(true);
  });
});

describe("clearMapSelectionGraphics", () => {
  test("clears view graphics and highlight layer", () => {
    const removeAll = jest.fn();
    const layerRemoveAll = jest.fn();
    const findLayerById = jest.fn(() => ({ removeAll: layerRemoveAll }));
    const view = {
      graphics: { removeAll },
      map: { findLayerById },
    } as unknown as __esri.MapView;
    clearMapSelectionGraphics(view);
    expect(removeAll).toHaveBeenCalled();
    expect(findLayerById).toHaveBeenCalledWith("agri-polygon-highlight");
    expect(layerRemoveAll).toHaveBeenCalled();
  });
  test("swallows errors and handles missing view", () => {
    const view = {
      graphics: {
        removeAll: (): void => {
          throw new Error("x");
        },
      },
      map: {
        findLayerById: (): void => {
          throw new Error("y");
        },
      },
    } as unknown as __esri.MapView;
    expect(() => clearMapSelectionGraphics(view)).not.toThrow();
    expect(() => clearMapSelectionGraphics(null)).not.toThrow();
    expect(() => clearMapSelectionGraphics()).not.toThrow();
  });
});

describe("buildSelectionSymbol", () => {
  const sym = (g: string | undefined, halo?: boolean): FakeSymbol =>
    buildSelectionSymbol(g, halo) as unknown as FakeSymbol;
  test("polygon -> fill symbol", () => {
    expect(sym("polygon").props.outline?.props.width).toBe(3);
    expect(sym("polygon", true).props.outline?.props.width).toBe(9);
    expect(sym("polygon").props.size).toBeUndefined();
  });
  test("polyline -> line symbol with halo width", () => {
    expect(sym("polyline").props.width).toBe(4);
    expect(sym("polyline", true).props.width).toBe(10);
  });
  test("other -> marker", () => {
    expect(sym("point").props.outline?.props.width).toBe(2);
    expect(sym(undefined, true).props.size).toBe(22);
    expect(sym(undefined).props.size).toBe(14);
  });
});
