jest.mock("../panels/ReserveCropPanel/runtime/reserve-crop-data", () => ({
  queryLandCropRows: jest.fn(),
}));
jest.mock("./agri-reserve-land-data-source", () => ({ getAgriReserveLandLayer: jest.fn() }));
jest.mock("./agri-unused-land-data-source", () => ({ getAgriUnusedLandLayer: jest.fn() }));
jest.mock("../shared/agri-crop-color-registry", () => ({
  resolveCropColors: (crops: string[]) =>
    crops.map((crop) => ({ Paxta: "#ffffff", "Bug'doy": "#ffcc00" })[crop] || "#123456"),
}));

import { queryLandCropRows } from "../panels/ReserveCropPanel/runtime/reserve-crop-data";
import type { ReserveCropRow } from "../panels/ReserveCropPanel/runtime/reserve-crop-data";
import { getAgriReserveLandLayer } from "./agri-reserve-land-data-source";
import { getAgriUnusedLandLayer } from "./agri-unused-land-data-source";
import {
  applyLandCropRenderer,
  buildLandCropRenderer,
  buildLandCropValueExpression,
} from "./agri-land-crop-renderer";

const fields = [
  { name: "Turi", type: "string" },
  { name: "crop_id", type: "string" },
  { name: "yil", type: "string" },
] as __esri.Field[];

const ROWS: ReserveCropRow[] = [
  { crop: "Paxta", maydon: 50, match: { turi: ["Paxta", "paxta "], cropIds: [], blank: false } },
  { crop: "Bug'doy", maydon: 30, match: { turi: ["Bug'doy"], cropIds: ["6"], blank: false } },
  { crop: "Boshqa", maydon: 5, match: { turi: [], cropIds: [], blank: true } },
];

const SCOPE = { yil: "2026", viloyat: "Sirdaryo viloyati", tuman: "", lockedViloyat: "" };

describe("buildLandCropValueExpression", () => {
  it("maps text turi, then crop_id, then blank to the row keys", () => {
    const expr = buildLandCropValueExpression({ fields }, ROWS);
    expect(expr).toContain('$feature["Turi"]');
    expect(expr).toContain('$feature["crop_id"]');
    expect(expr).toContain('"Paxta", "r0", "paxta ", "r0", "Bug\'doy", "r1"');
    expect(expr).toContain('Decode(c, "6", "r1", "")');
    expect(expr.trim().endsWith('return "r2";')).toBe(true);
  });

  it("is empty without a turi column", () => {
    expect(buildLandCropValueExpression({ fields: [] }, ROWS)).toBe("");
  });
});

describe("buildLandCropRenderer", () => {
  it("paints each crop row in its chart colour", () => {
    const renderer = buildLandCropRenderer({ fields }, ROWS);
    expect(renderer?.type).toBe("unique-value");
    expect(renderer?.uniqueValueInfos.map((info) => [info.value, info.label])).toEqual([
      ["r0", "Paxta"],
      ["r1", "Bug'doy"],
      ["r2", "Boshqa"],
    ]);
    expect(renderer?.uniqueValueInfos[1].symbol.outline.color).toEqual([255, 204, 0, 1]);
  });

  it("draws crop borders solid in the crop colour and leaves uncropped land almost clear", () => {
    const renderer = buildLandCropRenderer({ fields }, ROWS);
    const paxta = renderer?.uniqueValueInfos[0].symbol;
    expect(paxta?.outline).toEqual({ color: [255, 255, 255, 1], width: 2 });
    expect(paxta?.color).toEqual([255, 255, 255, 0.45]);
    expect(renderer?.defaultSymbol.color[3]).toBeLessThanOrEqual(0.1);
    expect(renderer?.defaultLabel).toBe("Ekinsiz");
  });

  it("is null with no rows or no turi column", () => {
    expect(buildLandCropRenderer({ fields }, [])).toBeNull();
    expect(buildLandCropRenderer({ fields: [] }, ROWS)).toBeNull();
  });
});

describe("applyLandCropRenderer", () => {
  const rowsMock = queryLandCropRows as jest.Mock;

  beforeEach(() => {
    rowsMock.mockReset().mockResolvedValue(ROWS);
    (getAgriReserveLandLayer as jest.Mock).mockResolvedValue({ layer: { fields, id: "reserve" } });
    (getAgriUnusedLandLayer as jest.Mock).mockResolvedValue({
      layer: { fields: [...fields, { name: "Maydon", type: "double" }], id: "unused" },
    });
  });

  it("sets the renderer on the reserve layer from the chart's query", async () => {
    const layer = { fields, renderer: null } as unknown as __esri.FeatureLayer;
    await expect(applyLandCropRenderer(layer, "reserve", SCOPE)).resolves.toBe(true);
    expect(rowsMock).toHaveBeenCalledWith(expect.objectContaining({ id: "reserve" }), SCOPE, "maydon");
    expect((layer.renderer as unknown as { type: string }).type).toBe("unique-value");
  });

  it("weights unused land by its own area field", async () => {
    const layer = { fields, renderer: null } as unknown as __esri.FeatureLayer;
    await applyLandCropRenderer(layer, "unused", SCOPE);
    expect(rowsMock).toHaveBeenCalledWith(expect.objectContaining({ id: "unused" }), SCOPE, "Maydon");
  });

  it("keeps the layer renderer when superseded or without rows", async () => {
    const own = { type: "simple" };
    const layer = { fields, renderer: own } as unknown as __esri.FeatureLayer;
    await expect(applyLandCropRenderer(layer, "reserve", SCOPE, () => true)).resolves.toBe(false);
    rowsMock.mockResolvedValueOnce([]);
    await expect(applyLandCropRenderer(layer, "reserve", SCOPE)).resolves.toBe(false);
    expect(layer.renderer).toBe(own);
  });
});
