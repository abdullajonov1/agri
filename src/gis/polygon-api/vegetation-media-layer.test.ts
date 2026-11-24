const mockProject = jest.fn();
const mockProjLoad = jest.fn((): Promise<void> => Promise.resolve());
// jest.config maps every `esri/*` specifier to one shared module, so this one
// mock provides every esri class plus the projection namespace.
jest.mock("esri/layers/MediaLayer", () => ({
  __esModule: true,
  default: class EsriStub {
    constructor(props: Record<string, unknown>) {
      Object.assign(this, props);
    }
  },
  load: (): Promise<void> => mockProjLoad(),
  project: (...a: unknown[]): unknown => mockProject(...a),
}), { virtual: true });

import type { PolygonExportImageResult } from "./config";
import {
  VEGETATION_IMAGE_LAYER_ID,
  createVegetationMediaLayer,
  resolveOverlayExtent,
  resolveResultEpsgCode,
} from "./vegetation-media-layer";

const makeResult = (over: Partial<PolygonExportImageResult> = {}): PolygonExportImageResult => ({
  canvas: {} as HTMLCanvasElement,
  bbox: [100, 200, 300, 400],
  epsgCode: 32642,
  width: 10,
  height: 10,
  values: null,
  rgba: null,
  noData: null,
  indexMin: null,
  indexMax: null,
  indexMean: null,
  ...over,
});

const viewSr = (wkid: number): __esri.SpatialReference => ({ wkid }) as unknown as __esri.SpatialReference;

describe("vegetation-media-layer", () => {
  beforeEach(() => {
    mockProject.mockReset();
    mockProjLoad.mockClear();
  });

  test("exposes the shared layer id", () => {
    expect(VEGETATION_IMAGE_LAYER_ID).toBe("agri-graff-vegetation-image-overlay");
  });

  test("throws when bbox is invalid", async () => {
    await expect(resolveOverlayExtent(makeResult({ bbox: [5, 5, 5, 9] }), null)).rejects.toThrow(
      "GeoTIFF georeference/bbox invalid",
    );
    await expect(resolveOverlayExtent(makeResult({ width: 0 }), null)).rejects.toThrow(
      "GeoTIFF georeference/bbox invalid",
    );
  });

  test("falls back to EPSG 4326 for degree-sized coordinates without EPSG", async () => {
    const result = makeResult({ bbox: [69, 40, 70, 41], epsgCode: null });
    expect(resolveResultEpsgCode(result)).toBe(4326);
    const extent = await resolveOverlayExtent(result, null);
    expect((extent.spatialReference as { wkid: number }).wkid).toBe(4326);
  });

  test("throws when EPSG is missing and coordinates are projected", async () => {
    await expect(resolveOverlayExtent(makeResult({ epsgCode: null }), null)).rejects.toThrow("GeoTIFF CRS (EPSG)");
  });

  test("projects to the view spatial reference when it differs", async () => {
    const projected = { xmin: 1, ymin: 2, xmax: 3, ymax: 4 };
    mockProject.mockReturnValue(projected);
    const extent = await resolveOverlayExtent(makeResult(), viewSr(3857));
    expect(mockProjLoad).toHaveBeenCalled();
    expect(extent).toBe(projected);
  });

  test("keeps the native extent when projection fails", async () => {
    mockProject.mockImplementation(() => {
      throw new Error("boom");
    });
    const extent = await resolveOverlayExtent(makeResult(), viewSr(3857));
    expect(extent.xmin).toBe(100);
    expect((extent.spatialReference as { wkid: number }).wkid).toBe(32642);
  });

  test("keeps the native extent when the projected extent is degenerate", async () => {
    mockProject.mockReturnValue({ xmin: 1, ymin: 1, xmax: 1, ymax: 1 });
    const extent = await resolveOverlayExtent(makeResult(), viewSr(3857));
    expect(extent.xmax).toBe(300);
  });

  test("skips projection when the view already uses the native SR", async () => {
    const extent = await resolveOverlayExtent(makeResult(), viewSr(32642));
    expect(mockProject).not.toHaveBeenCalled();
    expect(extent.xmin).toBe(100);
  });

  test("createVegetationMediaLayer sets id, title and full opacity", () => {
    const extent = { xmin: 0 } as unknown as __esri.Extent;
    const layer = createVegetationMediaLayer({
      canvas: {} as HTMLCanvasElement,
      extent,
      id: "some-id",
      title: "Vegetation NDVI 2024-06-10",
    });
    expect(layer.id).toBe("some-id");
    expect(layer.title).toBe("Vegetation NDVI 2024-06-10");
    expect(layer.opacity).toBe(1);
    expect(Array.isArray(layer.source)).toBe(true);
  });
});
