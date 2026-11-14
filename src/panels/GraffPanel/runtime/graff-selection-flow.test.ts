/**
 * Integration test for the polygon-selection image flow: real data loader,
 * real overlay, real optimistic kick and the real export-image module (lane +
 * cache). Only the network, the GeoTIFF decode, esri and the FeatureServer
 * series are replaced.
 */
jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));
jest.mock("./graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));

// jest.config maps every `esri/*` specifier to one shared module.
jest.mock(
  "esri/layers/MediaLayer",
  () => ({
    __esModule: true,
    default: class EsriStub {
      constructor(props: Record<string, unknown>) {
        Object.assign(this, props);
      }
      load(): Promise<void> {
        return Promise.resolve();
      }
    },
    load: (): Promise<void> => Promise.resolve(),
    project: (extent: unknown): unknown => extent,
  }),
  { virtual: true },
);

const mockSeries = jest.fn();
jest.mock("../../../data/agri-stats-store", () => ({
  getGraffPolygonSeriesCached: (...args: unknown[]): unknown => mockSeries(...args),
}));
jest.mock("../../../store/agri-dashboard-store", () => ({
  getDashboardPack: (): unknown => ({ phase: "idle" }),
  patchDashboardPack: jest.fn(),
}));

const mockDecode = jest.fn();
jest.mock("../../../gis/polygon-api/tiff-decode", () => ({
  decodeExportImageTiff: (...args: unknown[]): unknown => mockDecode(...args),
}));

import { makeStubHost } from "./__test-utils__/stub-host";
import type { AgriGraffWidgetState, VegetationIndex } from "./graff-state";
import type { GraffWidgetHost } from "./graff-host";
import type { GraffDataServiceHost } from "./graff-data/regional-timeseries";
import { fetchGraffVegetationData } from "./graff-data/vegetation-data";
import { applyGraffVegetationImageOverlay, type GraffRasterOverlayHost } from "./graff-raster-overlay";
import {
  awaitPendingOverlayWalk,
  getCarriedOverlayDate,
  kickOptimisticVegetationOverlay,
  markOverlayDateVerified,
  rememberRasterDateForUniqueid,
} from "./components/overlay-helpers";
import {
  beginVegetationImageSurfaceLoading,
  cancelVegetationImageOverlay,
  clearVegetationImageSurfaceLoading,
  removeVegetationImageOverlay,
} from "./components/graph/graph-dates";
import type { PolygonExportImageResult, VegetationIndiceType } from "../../../gis/agri-polygon-api-source";

type FlowHost = GraffWidgetHost & GraffDataServiceHost & GraffRasterOverlayHost;
interface SurfaceDetail { loading: boolean; requestId: number }
interface AppliedDetail { uniqueid: string; regionId: number; date: string; indexKey: string }
interface MockMedia { title: string }
interface MockMap { add: jest.Mock; remove: jest.Mock }

const UNIQUEID = "U1";
const REGION_ID = 1724;
const YEAR = 2024;
const DATES = ["2024-04-10", "2024-04-20"];
const LATENCY_MS = 5;
const SETTLE_TIMEOUT_MS = 3000;
const QUIET_ROUNDS = 3;

const wait = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

const fakeResponse = (body: string): Response =>
  ({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { get: (): string | null => null },
    text: (): Promise<string> => Promise.resolve(body),
    arrayBuffer: (): Promise<ArrayBuffer> => Promise.resolve(new ArrayBuffer(8)),
  }) as unknown as Response;

const fetchCalls: string[] = [];
const fetchMock = jest.fn(async (input: RequestInfo | URL): Promise<Response> => {
  const url = String(input);
  fetchCalls.push(url);
  await wait(LATENCY_MS);
  if (url.includes("/available-dates")) return fakeResponse(JSON.stringify({ dates: DATES }));
  return fakeResponse("");
});

const callsMatching = (fragment: string): string[] => fetchCalls.filter((u) => u.includes(fragment));

const fakeTiff = (canvas: HTMLCanvasElement): PolygonExportImageResult => ({
  canvas,
  bbox: [100000, 4000000, 101000, 4001000],
  epsgCode: 32641,
  width: 2,
  height: 2,
  values: new Float32Array(4),
  rgba: null,
  noData: null,
  indexMin: 0,
  indexMax: 1,
  indexMean: 0.5,
});

const surfaceEvents: SurfaceDetail[] = [];
const appliedEvents: AppliedDetail[] = [];
const onSurface = (e: Event): void => { surfaceEvents.push((e as CustomEvent<SurfaceDetail>).detail); };
const onApplied = (e: Event): void => { appliedEvents.push((e as CustomEvent<AppliedDetail>).detail); };

const lastOf = <T,>(items: readonly T[]): T => items[items.length - 1];

const prepareSeries = (rows: VegetationIndex[], dates: string[]) => {
  const sorted = rows.slice().sort((a, b) => a.raster_date.localeCompare(b.raster_date));
  const last = sorted[sorted.length - 1];
  return {
    sorted,
    nextDate: last ? last.raster_date : null,
    nextIndexKey: last ? ("ndvi" as const) : null,
    fingerprint: `${sorted.map((r) => r.raster_date).join(",")}|${dates.length}`,
  };
};

const makeFlowHost = (): { host: FlowHost; map: MockMap } => {
  const map: MockMap = { add: jest.fn(), remove: jest.fn() };
  const state: Partial<AgriGraffWidgetState> = {
    selecteduniqueid: `{${UNIQUEID}}`,
    selectedIndices: ["ndvi"],
    activeMapView: {
      view: { map, spatialReference: { wkid: 32641 } },
    } as unknown as AgriGraffWidgetState["activeMapView"],
  };
  const holder: { host: FlowHost | null } = { host: null };
  const self = (): FlowHost => holder.host as FlowHost;
  const extra: Record<string, unknown> = {
    _hasCompletedGraphFetch: false,
    _vegetationDataRequestId: 0,
    _regionalTimeseriesRequestId: 0,
    _regionalTimeseriesRequestKey: "",
    _regionalTimeseriesAppliedKey: "",
    _regionalTimeseriesLoadedAvgFields: new Set<string>(),
    _polygonAvailableDatesUniqueid: "",
    _latestRasterDateByUniqueid: new Map<string, string>(),
    _verifiedOverlayDates: new Set<string>(),
    _missingVegetationRasterKeys: new Set<string>(),
    _pendingOverlayWalk: null,
    _vegetationImageRequestId: 0,
    _vegetationOverlayAppliedKey: "",
    _vegetationOverlayPendingKey: "",
    _vegetationImageLayer: null,
    _vegetationRasterSample: null,
    _lastSuccessfulOverlayDate: null,
    _lastSuccessfulOverlayIndex: "ndvi",
    _lastSuccessfulOverlayRegionId: null,
    _lastSuccessfulOverlayYear: null,
    _optimisticDateBeforeClear: null,
    resolveCurrentRegionId: (): number => REGION_ID,
    resolveCurrentYear: (): number => YEAR,
    resolveCropIdForUniqueid: (): number | null => 3,
    resolveAgainstAvailableDates: (raw: unknown, dates: string[]): string | null =>
      dates.includes(String(raw)) ? String(raw) : null,
    resolveHoverIndexRange: (): { indexMin: number | null; indexMax: number | null } => ({
      indexMin: 0,
      indexMax: 1,
    }),
    attachVegetationRasterHover: jest.fn(),
    detachVegetationRasterHover: jest.fn(),
    retryOverlayWithUsableDate: jest.fn((): Promise<void> => Promise.resolve()),
    beginGraphFetch: jest.fn(),
    applyGraphData: jest.fn(),
    preparePolygonGraphSeries: prepareSeries,
    // Real method bindings, same shape as the widget's arrow members.
    getCarriedOverlayDate: (r: number | undefined, y: number | undefined): string | null =>
      getCarriedOverlayDate(self(), r, y),
    kickOptimisticVegetationOverlay: (id: string): void => { kickOptimisticVegetationOverlay(self(), id); },
    markOverlayDateVerified: (id: string, d: string): void => { markOverlayDateVerified(self(), id, d); },
    rememberRasterDateForUniqueid: (id: string, d: string[]): void => { rememberRasterDateForUniqueid(self(), id, d); },
    awaitPendingOverlayWalk: (id: string, t?: number): Promise<string | null | undefined> =>
      awaitPendingOverlayWalk(self(), id, t),
    beginVegetationImageSurfaceLoading: (): void => { beginVegetationImageSurfaceLoading(self()); },
    clearVegetationImageSurfaceLoading: (id: number): void => { clearVegetationImageSurfaceLoading(self(), id); },
    cancelVegetationImageOverlay: (): void => { cancelVegetationImageOverlay(self()); },
    removeVegetationImageOverlay: (): void => { removeVegetationImageOverlay(self()); },
    applyVegetationImageOverlay: (
      uniqueid: string,
      date: string,
      index: VegetationIndiceType = "ndvi",
      prefetched?: PolygonExportImageResult | null,
      options?: { interactive?: boolean },
    ): Promise<void> => applyGraffVegetationImageOverlay(self(), uniqueid, date, index, prefetched, options),
  };
  holder.host = makeStubHost(state, extra) as unknown as FlowHost;
  return { host: holder.host, map };
};

/** Poll until an overlay is drawn and nothing is pending any more. */
const settle = async (host: FlowHost): Promise<void> => {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;
  let quietRounds = 0;
  while (Date.now() < deadline) {
    await wait(LATENCY_MS * 2);
    const isIdle =
      !host._vegetationOverlayPendingKey &&
      !host._pendingOverlayWalk &&
      Boolean(host._vegetationOverlayAppliedKey);
    quietRounds = isIdle ? quietRounds + 1 : 0;
    if (quietRounds >= QUIET_ROUNDS) return;
  }
  throw new Error("selection flow did not settle");
};

beforeEach(() => {
  fetchCalls.length = 0;
  surfaceEvents.length = 0;
  appliedEvents.length = 0;
  fetchMock.mockClear();
  mockSeries.mockReset();
  mockDecode.mockReset();
  (global as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  mockDecode.mockImplementation(() => Promise.resolve(fakeTiff(document.createElement("canvas"))));
  mockSeries.mockImplementation(async (): Promise<VegetationIndex[]> => {
    await wait(LATENCY_MS);
    return DATES.map((d) => ({ raster_date: d, uniqueid: UNIQUEID, ndvi: 0.5 }) as unknown as VegetationIndex);
  });
  document.addEventListener("agriMapSurfaceLoading", onSurface);
  document.addEventListener("agriVegetationOverlayApplied", onApplied);
});

afterEach(() => {
  document.removeEventListener("agriMapSurfaceLoading", onSurface);
  document.removeEventListener("agriVegetationOverlayApplied", onApplied);
  jest.restoreAllMocks();
});

const selectPolygon = async (): Promise<{ host: FlowHost; map: MockMap }> => {
  const made = makeFlowHost();
  await fetchGraffVegetationData(made.host);
  await settle(made.host);
  return made;
};

const pickDay = (host: FlowHost, date: string): Promise<void> =>
  host.applyVegetationImageOverlay(`{${UNIQUEID}}`, date, "ndvi", null, { interactive: true });

describe("polygon selection image flow", () => {
  test("one selection sends one export-image and one available-dates request", async () => {
    await selectPolygon();

    expect(callsMatching("/export-image")).toHaveLength(1);
    expect(callsMatching("/available-dates")).toHaveLength(1);
    expect(callsMatching("/export-image")[0]).toContain("raster_date=2024-04-20");
  });

  test("the map surface loader is released for the final request", async () => {
    const { host } = await selectPolygon();

    expect(surfaceEvents.some((e) => e.loading)).toBe(true);
    const last = lastOf(surfaceEvents);
    expect(last.loading).toBe(false);
    expect(last.requestId).toBe(host._vegetationImageRequestId);
    expect(host.state.polygonImageLoading).toBe(false);
  });

  test("a later user day pick requests that date once and ends on it", async () => {
    const { host, map } = await selectPolygon();
    fetchCalls.length = 0;
    surfaceEvents.length = 0;

    await pickDay(host, "2024-04-10");

    const exportCalls = callsMatching("/export-image");
    expect(exportCalls).toHaveLength(1);
    expect(exportCalls[0]).toContain("raster_date=2024-04-10");
    expect(host._vegetationOverlayAppliedKey).toContain("2024-04-10");
    expect((lastOf(map.add.mock.calls)[0] as MockMedia).title).toContain("2024-04-10");
    expect(lastOf(surfaceEvents).loading).toBe(false);
  });

  test("agriVegetationOverlayApplied announces the drawn date and index", async () => {
    const { host } = await selectPolygon();
    expect(lastOf(appliedEvents)).toEqual({
      uniqueid: UNIQUEID,
      regionId: REGION_ID,
      date: "2024-04-20",
      indexKey: "ndvi",
    });

    await pickDay(host, "2024-04-10");

    expect(lastOf(appliedEvents)).toEqual({
      uniqueid: UNIQUEID,
      regionId: REGION_ID,
      date: "2024-04-10",
      indexKey: "ndvi",
    });
  });
});
