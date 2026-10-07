jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));
jest.mock("./graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));

// jest.config maps every `esri/*` specifier to one shared module, so all
// esri classes (Extent, SpatialReference, MediaLayer, ...) and the projection
// namespace are provided by this single mock.
const mockProject = jest.fn();
const mockProjLoad = jest.fn((): Promise<void> => Promise.resolve());
const mockMediaLoad = jest.fn();
jest.mock("esri/layers/MediaLayer", () => ({
  __esModule: true,
  default: class EsriStub {
    constructor(props: Record<string, unknown>) {
      Object.assign(this, props);
    }
    load(): unknown {
      return mockMediaLoad();
    }
  },
  load: (): Promise<void> => mockProjLoad(),
  project: (...a: unknown[]): unknown => mockProject(...a),
}), { virtual: true });

const mockFetchTiff = jest.fn();
const mockSeason = jest.fn((): number[] => []);
const mockPick = jest.fn();
const mockWithoutImagery = jest.fn((): boolean => false);
const mockWithImagery = jest.fn((): boolean => false);
const mockOutOfSeason = jest.fn((): boolean => false);
const mockNoImageryErr = jest.fn((): boolean => false);
const mockRememberSeason = jest.fn();
const mockRememberNoImagery = jest.fn();
jest.mock("../../../gis/agri-polygon-api-source", () => ({
  fetchPolygonExportImageTiff: (...a: unknown[]): unknown => mockFetchTiff(...a),
  getExportImageSeasonMonths: (): number[] => mockSeason(),
  isExportImageNoImageryError: (): boolean => mockNoImageryErr(),
  isExportImageOutOfSeasonError: (): boolean => mockOutOfSeason(),
  isRegionDateWithImagery: (): boolean => mockWithImagery(),
  isRegionDateWithoutImagery: (): boolean => mockWithoutImagery(),
  parseExportImageCropId: (): number | null => 7,
  parseExportImageSeasonMonths: (): number[] => [6, 7],
  pickExportRasterDate: (...a: unknown[]): unknown => mockPick(...a),
  rememberExportImageSeasonMonths: (...a: unknown[]): void => mockRememberSeason(...a),
  rememberRegionDateWithoutImagery: (...a: unknown[]): void => mockRememberNoImagery(...a),
}));
jest.mock("../../../data/agri-uniqueid-sql", () => ({
  stripUniqueidBraces: (v: string | null | undefined): string => String(v ?? "").replace(/[{}]/g, ""),
}));
jest.mock("../../../data/agri-graff-stats", () => ({
  buildGraffPolygonRasterCacheKey: (p: { uniqueid: string; regionId: number; rasterDate: string; indiceType: string }): string =>
    `${p.uniqueid}|${p.regionId}|${p.rasterDate}|${p.indiceType}`,
}));
const mockSetContext = jest.fn();
jest.mock("../../../gis/agri-vegetation-overlay-prefetch", () => ({ setVegetationOverlayContext: (c: unknown): void => mockSetContext(c) }));

import { asMock, makeStubHost } from "./__test-utils__/stub-host";
import type { AgriGraffWidgetState } from "./graff-state";
import type { GraffRasterOverlayHost } from "./graff-raster-overlay";
import { applyGraffVegetationImageOverlay } from "./graff-raster-overlay";

const makeHost = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffRasterOverlayHost => {
  const map = { add: jest.fn() };
  return makeStubHost(
    {
      selecteduniqueid: "U",
      activeMapView: { view: { map, spatialReference: { wkid: 3857 } } } as unknown as AgriGraffWidgetState["activeMapView"],
      ...state,
    },
    {
      _polygonAvailableDatesUniqueid: "",
      _latestRasterDateByUniqueid: new Map<string, string>(),
      _verifiedOverlayDates: new Set<string>(["U|2024-06-10"]),
      _vegetationImageRequestId: 0,
      _vegetationOverlayAppliedKey: "",
      _vegetationOverlayPendingKey: "",
      _vegetationImageLayer: null,
      _missingVegetationRasterKeys: new Set<string>(),
      resolveCurrentRegionId: jest.fn(() => 5),
      resolveCurrentYear: jest.fn(() => 2024),
      resolveCropIdForUniqueid: jest.fn(() => 3),
      resolveAgainstAvailableDates: jest.fn((): null => null),
      resolveHoverIndexRange: jest.fn(() => ({ indexMin: 0, indexMax: 1 })),
      awaitPendingOverlayWalk: jest.fn(() => Promise.resolve(undefined)),
      ...extra,
    },
  ) as unknown as GraffRasterOverlayHost;
};
const mapOf = (h: GraffRasterOverlayHost): { add: jest.Mock } => (h.state.activeMapView as unknown as { view: { map: { add: jest.Mock } } }).view.map;

const tiff = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  bbox: [100000, 4000000, 101000, 4001000],
  width: 2,
  height: 2,
  epsgCode: 32641,
  canvas: {},
  values: new Float32Array(4),
  rgba: null,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSeason.mockReturnValue([]);
  mockWithoutImagery.mockReturnValue(false);
  mockWithImagery.mockReturnValue(false);
  mockOutOfSeason.mockReturnValue(false);
  mockNoImageryErr.mockReturnValue(false);
  mockPick.mockReturnValue(null);
  mockProject.mockImplementation((e: Record<string, unknown>) => ({ ...e, xmin: 1, ymin: 2, xmax: 3, ymax: 4 }));
  mockFetchTiff.mockResolvedValue(tiff());
});

describe("applyGraffVegetationImageOverlay early exits", () => {
  test("no map view is a no-op", async () => {
    const host = makeHost({ activeMapView: undefined });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(mockFetchTiff).not.toHaveBeenCalled();
  });
  test("missing region cancels the overlay and reports an error", async () => {
    const host = makeHost({}, { resolveCurrentRegionId: jest.fn((): undefined => undefined) });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(asMock(host.cancelVegetationImageOverlay)).toHaveBeenCalled();
    expect(host.state.polygonImageError).toContain("Viloyat");
  });
  test("out-of-season date with no replacement retries instead of fetching", async () => {
    mockSeason.mockReturnValue([6, 7]);
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "U", "2024-09-10");
    expect(asMock(host.retryOverlayWithUsableDate)).toHaveBeenCalledWith("U", 5, "2024-09-10", "ndvi");
    expect(mockFetchTiff).not.toHaveBeenCalled();
  });
  test("unservable date is rewritten to a picked alternative", async () => {
    mockSeason.mockReturnValue([6]);
    mockPick.mockReturnValue("2024-06-10");
    const host = makeHost({ polygonAvailableDates: ["2024-06-10"] }, { _polygonAvailableDatesUniqueid: "U" });
    await applyGraffVegetationImageOverlay(host, "U", "2024-09-10");
    expect(mockFetchTiff).toHaveBeenCalledWith(expect.objectContaining({ rasterDate: "2024-06-10" }));
  });
  test("known-missing in-season date falls back to cached latest date when no advertised dates", async () => {
    mockWithoutImagery.mockReturnValueOnce(true).mockReturnValue(false);
    mockPick.mockReturnValue("2024-06-10");
    const host = makeHost({}, { _latestRasterDateByUniqueid: new Map([["U", "2024-06-01"]]) });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-20");
    expect(mockPick).toHaveBeenCalledWith(["2024-06-01"], expect.objectContaining({ exclude: ["2024-06-20"] }));
  });
  test("walk: unverified date waits for the walk, adopts its date or skips when proven empty", async () => {
    const adopt = makeHost({}, { _verifiedOverlayDates: new Set<string>(), awaitPendingOverlayWalk: jest.fn(() => Promise.resolve("2024-06-10")) });
    await applyGraffVegetationImageOverlay(adopt, "U", "2024-06-15");
    expect(mockFetchTiff).toHaveBeenCalledWith(expect.objectContaining({ rasterDate: "2024-06-10" }));
    mockFetchTiff.mockClear();
    mockWithoutImagery.mockReturnValue(true);
    const skip = makeHost({}, { _verifiedOverlayDates: new Set<string>(), awaitPendingOverlayWalk: jest.fn(() => Promise.resolve(null)) });
    await applyGraffVegetationImageOverlay(skip, "U", "2024-06-15");
    expect(mockFetchTiff).not.toHaveBeenCalled();
    expect(asMock(skip.clearVegetationImageSurfaceLoading)).toHaveBeenCalled();
    mockWithoutImagery.mockReturnValue(false);
    const changed = makeHost({}, { _verifiedOverlayDates: new Set<string>(), awaitPendingOverlayWalk: jest.fn(() => Promise.resolve("2024-06-10")) });
    (changed.awaitPendingOverlayWalk as jest.Mock).mockImplementation(() => {
      changed.state = { ...changed.state, selecteduniqueid: "OTHER" };
      return Promise.resolve("2024-06-10");
    });
    await applyGraffVegetationImageOverlay(changed, "U", "2024-06-15");
    expect(mockFetchTiff).not.toHaveBeenCalled();
    const unmounted = makeHost({}, { _verifiedOverlayDates: new Set<string>() });
    (unmounted.awaitPendingOverlayWalk as jest.Mock).mockImplementation(() => {
      unmounted._isMounted = false;
      return Promise.resolve("x");
    });
    await applyGraffVegetationImageOverlay(unmounted, "U", "2024-06-15");
    expect(mockFetchTiff).not.toHaveBeenCalled();
  });
  test("already applied, in-flight, unadvertised and known-missing keys skip the request", async () => {
    const key = "U|5|2024-06-10|ndvi";
    const applied = makeHost({}, { _vegetationOverlayAppliedKey: key, _vegetationImageLayer: {} });
    await applyGraffVegetationImageOverlay(applied, "U", "2024-06-10");
    expect(applied.state.polygonImageLoading).toBe(false);
    const inflight = makeHost({ polygonImageLoading: true }, { _vegetationOverlayPendingKey: key });
    await applyGraffVegetationImageOverlay(inflight, "U", "2024-06-10");
    const unadvertised = makeHost({ polygonAvailableDates: ["2024-05-01"] }, { _polygonAvailableDatesUniqueid: "U" });
    await applyGraffVegetationImageOverlay(unadvertised, "U", "2024-06-10");
    expect(asMock(unadvertised.clearVegetationImageSurfaceLoading)).toHaveBeenCalled();
    const keepsExisting = makeHost({ polygonAvailableDates: ["2024-05-01"] }, { _polygonAvailableDatesUniqueid: "U", _vegetationOverlayAppliedKey: "other" });
    await applyGraffVegetationImageOverlay(keepsExisting, "U", "2024-06-10");
    expect(asMock(keepsExisting.clearVegetationImageSurfaceLoading)).not.toHaveBeenCalled();
    const missing = makeHost({}, { _missingVegetationRasterKeys: new Set([key]) });
    await applyGraffVegetationImageOverlay(missing, "U", "2024-06-10");
    expect(asMock(missing.clearVegetationImageSurfaceLoading)).toHaveBeenCalled();
    const missingKeep = makeHost({}, { _missingVegetationRasterKeys: new Set([key]), _vegetationOverlayPendingKey: "p" });
    await applyGraffVegetationImageOverlay(missingKeep, "U", "2024-06-10");
    expect(asMock(missingKeep.clearVegetationImageSurfaceLoading)).not.toHaveBeenCalled();
    expect(mockFetchTiff).not.toHaveBeenCalled();
  });
});

describe("applyGraffVegetationImageOverlay success path", () => {
  test("places a MediaLayer, stores hover sample and records success", async () => {
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "{U}", "2024-06-10T00:00:00Z", "savi");
    expect(mockFetchTiff).toHaveBeenCalledWith(expect.objectContaining({ uniqueid: "U", regionId: 5, indiceType: "savi", stretch: "fixed" }));
    expect(asMock(host.removeVegetationImageOverlay)).toHaveBeenCalled();
    const layer = mapOf(host).add.mock.calls[0][0] as { id: string; title: string };
    expect(layer.id).toBe("agri-graff-vegetation-image-overlay");
    expect(layer.title).toBe("Vegetation SAVI 2024-06-10");
    expect(host._vegetationImageLayer).toBe(layer);
    expect(host._vegetationRasterSample).toMatchObject({ width: 2, height: 2, indexMin: 0, indexMax: 1, rgba: null });
    expect(host._vegetationRasterSample?.xmin).toBe(1);
    expect(asMock(host.attachVegetationRasterHover)).toHaveBeenCalled();
    expect(host._vegetationOverlayAppliedKey).toBe("U|5|2024-06-10|savi");
    expect(host._vegetationOverlayPendingKey).toBe("");
    expect(host._lastSuccessfulOverlayDate).toBe("2024-06-10");
    expect(host._lastSuccessfulOverlayIndex).toBe("savi");
    expect(host._lastSuccessfulOverlayRegionId).toBe(5);
    expect(host._latestRasterDateByUniqueid.get("U")).toBe("2024-06-10");
    expect(asMock(host.markOverlayDateVerified)).toHaveBeenCalledWith("U", "2024-06-10");
    expect(mockSetContext).toHaveBeenCalledWith({ regionId: 5, year: 2024, lastDate: "2024-06-10", lastIndex: "savi" });
    expect(host.state.polygonImageLoading).toBe(false);
    expect(asMock(host.clearVegetationImageSurfaceLoading)).toHaveBeenCalled();
  });
  test("uses prefetched TIFF without fetching, rgba sample when no float values, none when neither", async () => {
    const rgba = new Uint8ClampedArray(16);
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10", "ndvi", tiff({ values: null, rgba }) as never);
    expect(mockFetchTiff).not.toHaveBeenCalled();
    expect(host._vegetationRasterSample?.rgba).toBe(rgba);
    expect(host._vegetationRasterSample?.values).toBeNull();
    const none = makeHost();
    await applyGraffVegetationImageOverlay(none, "U", "2024-06-10", "ndvi", tiff({ values: null, rgba: null }) as never);
    expect(none._vegetationRasterSample).toBeNull();
    expect(asMock(none.attachVegetationRasterHover)).not.toHaveBeenCalled();
  });
  test("geographic bbox without EPSG defaults to 4326; same view SR keeps the native extent", async () => {
    const host = makeHost({}, {});
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10", "ndvi", tiff({ bbox: [60, 40, 61, 41], epsgCode: null }) as never);
    expect(mockProject).toHaveBeenCalled();
    const same = makeHost({ activeMapView: { view: { map: { add: jest.fn() }, spatialReference: { wkid: 32641 } } } as unknown as AgriGraffWidgetState["activeMapView"] });
    mockProject.mockClear();
    await applyGraffVegetationImageOverlay(same, "U", "2024-06-10", "ndvi", tiff() as never);
    expect(mockProject).not.toHaveBeenCalled();
    expect(same._vegetationRasterSample?.xmin).toBe(100000);
  });
  test("projection failure or degenerate projection keeps the native extent", async () => {
    mockProject.mockImplementationOnce(() => {
      throw new Error("proj");
    });
    const failing = makeHost();
    await applyGraffVegetationImageOverlay(failing, "U", "2024-06-10", "ndvi", tiff() as never);
    expect(failing._vegetationRasterSample?.xmin).toBe(100000);
    mockProject.mockImplementationOnce(() => ({ xmin: 5, xmax: 1, ymin: 1, ymax: 2 }));
    const degenerate = makeHost();
    await applyGraffVegetationImageOverlay(degenerate, "U", "2024-06-10", "ndvi", tiff() as never);
    expect(degenerate._vegetationRasterSample?.xmin).toBe(100000);
  });
  test("selection changing during the request discards the overlay", async () => {
    const host = makeHost();
    mockFetchTiff.mockImplementation(() => {
      host.state = { ...host.state, selecteduniqueid: "OTHER" };
      return Promise.resolve(tiff());
    });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(mapOf(host).add).not.toHaveBeenCalled();
    expect(host._vegetationOverlayAppliedKey).toBe("");
  });
  test("selection changing right after placing the layer removes it again", async () => {
    const host = makeHost();
    mockMediaLoad.mockImplementationOnce(() => {
      host.state = { ...host.state, selecteduniqueid: "OTHER" };
      return Promise.resolve();
    });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(asMock(host.removeVegetationImageOverlay)).toHaveBeenCalledTimes(2);
    expect(asMock(host.attachVegetationRasterHover)).not.toHaveBeenCalled();
  });
  test("MediaLayer.load throwing synchronously is tolerated", async () => {
    mockMediaLoad.mockImplementationOnce(() => {
      throw new Error("load");
    });
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(host._vegetationOverlayAppliedKey).toBe("U|5|2024-06-10|ndvi");
  });
});

describe("applyGraffVegetationImageOverlay failures", () => {
  const httpError = (status: number, message = "HTTP"): Error & { status: number } => Object.assign(new Error(message), { status });

  test("invalid georeference or missing CRS surface an error", async () => {
    const bad = makeHost();
    await applyGraffVegetationImageOverlay(bad, "U", "2024-06-10", "ndvi", tiff({ bbox: [1, 1, 0, 0] }) as never);
    expect(bad.state.polygonImageError).toContain("georeference");
    const nan = makeHost();
    await applyGraffVegetationImageOverlay(nan, "U", "2024-06-10", "ndvi", tiff({ bbox: [NaN, 1, 2, 2] }) as never);
    expect(nan.state.polygonImageError).toBeTruthy();
    const noCrs = makeHost();
    await applyGraffVegetationImageOverlay(noCrs, "U", "2024-06-10", "ndvi", tiff({ epsgCode: null }) as never);
    expect(noCrs.state.polygonImageError).toContain("EPSG");
    expect(noCrs.state.polygonImageLoading).toBe(false);
  });
  test("HTTP 400/404 mark the key missing and drop the overlay; guessed dates stay quiet", async () => {
    mockFetchTiff.mockRejectedValue(httpError(404, "nope"));
    const guessed = makeHost();
    await applyGraffVegetationImageOverlay(guessed, "U", "2024-06-10");
    expect(guessed._missingVegetationRasterKeys.has("U|5|2024-06-10|ndvi")).toBe(true);
    expect(asMock(guessed.removeVegetationImageOverlay)).toHaveBeenCalled();
    expect(guessed.state.polygonImageError).toBeNull();
    const advertised = makeHost({ polygonAvailableDates: ["2024-06-10"] }, { _polygonAvailableDatesUniqueid: "U" });
    mockFetchTiff.mockRejectedValue(new Error("HTTP 400 bad"));
    await applyGraffVegetationImageOverlay(advertised, "U", "2024-06-10");
    expect(advertised._missingVegetationRasterKeys.size).toBe(1);
    expect(advertised.state.polygonImageError).toBe("HTTP 400 bad");
  });
  test("other errors show the message or the default text and are not cached as missing", async () => {
    mockFetchTiff.mockRejectedValue(httpError(500, "server down"));
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(host.state.polygonImageError).toBe("server down");
    expect(host._missingVegetationRasterKeys.size).toBe(0);
    mockFetchTiff.mockRejectedValue(httpError(500, ""));
    const empty = makeHost();
    await applyGraffVegetationImageOverlay(empty, "U", "2024-06-10");
    expect(empty.state.polygonImageError).toBe("Расм юклана олмади");
  });
  test("out-of-season error remembers the season and retries without a banner", async () => {
    mockFetchTiff.mockRejectedValue(httpError(400));
    mockOutOfSeason.mockReturnValue(true);
    const host = makeHost({ polygonAvailableDates: ["2024-06-10"] }, { _polygonAvailableDatesUniqueid: "U" });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(mockRememberSeason).toHaveBeenCalledWith("U", [6, 7], 7);
    expect(asMock(host.retryOverlayWithUsableDate)).toHaveBeenCalledWith("U", 5, "2024-06-10", "ndvi");
    expect(host.state.polygonImageError).toBeNull();
  });
  test("no-imagery error remembers the region date and retries", async () => {
    mockFetchTiff.mockRejectedValue(httpError(404));
    mockNoImageryErr.mockReturnValue(true);
    const host = makeHost();
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(mockRememberNoImagery).toHaveBeenCalledWith(5, "2024-06-10");
    expect(asMock(host.retryOverlayWithUsableDate)).toHaveBeenCalled();
  });
  test("stale failures are ignored", async () => {
    const host = makeHost();
    mockFetchTiff.mockImplementation(() => {
      host.state = { ...host.state, selecteduniqueid: "OTHER" };
      return Promise.reject(httpError(500, "late"));
    });
    await applyGraffVegetationImageOverlay(host, "U", "2024-06-10");
    expect(host.state.polygonImageError).toBeNull();
  });
});
