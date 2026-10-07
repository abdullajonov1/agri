jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));

const mockFetchDates = jest.fn();
const mockDateWalk = jest.fn();
jest.mock("../../../../gis/agri-polygon-api-source", () => ({
  warmPolygonApiConnection: jest.fn(),
  fetchPolygonAvailableDates: (...args: unknown[]): unknown => mockFetchDates(...args),
  resolveExportImageWithDateWalk: (...args: unknown[]): unknown => mockDateWalk(...args),
  getExportImageSeasonMonths: (): number[] => [4, 5],
}));
jest.mock("../../../../data/agri-graff-stats", () => ({
  buildGraffPolygonSeriesScopeKey: (opts: Record<string, unknown>): string => JSON.stringify(opts),
}));
const mockPatchPack = jest.fn();
jest.mock("../../../../store/agri-dashboard-store", () => ({
  getDashboardPack: (): unknown => ({ phase: "idle" }),
  patchDashboardPack: (...args: unknown[]): void => {
    mockPatchPack(...args);
  },
}));
const mockSeries = jest.fn();
jest.mock("../../../../data/agri-stats-store", () => ({
  getGraffPolygonSeriesCached: (...args: unknown[]): unknown => mockSeries(...args),
}));

import { fetchGraffVegetationData } from "./vegetation-data";
import type { GraffDataServiceHost } from "./regional-timeseries";
import type { AgriGraffWidgetState, VegetationIndex } from "../graff-state";

type HostState = Partial<AgriGraffWidgetState>;

interface Prepared {
  sorted: VegetationIndex[];
  nextDate: string | null;
  nextIndexKey: "ndvi" | null;
  fingerprint: string;
}

const prepare = (rows: VegetationIndex[], dates: string[]): Prepared => {
  const sorted = rows.slice().sort((a, b) => a.raster_date.localeCompare(b.raster_date));
  const last = sorted[sorted.length - 1];
  return {
    sorted,
    nextDate: last ? last.raster_date : null,
    nextIndexKey: last ? "ndvi" : null,
    fingerprint: `${sorted.map((r) => r.raster_date).join(",")}|${dates.length}`,
  };
};

const makeHost = (
  state: HostState = {},
  ids: { region?: number; year?: number } = { region: 1724, year: 2024 },
): GraffDataServiceHost => {
  const host = {
    state: { selecteduniqueid: "{U1}", selectedIndices: ["ndvi"], vegetationData: [], ...state },
    _isMounted: true,
    _hasCompletedGraphFetch: false,
    _vegetationDataRequestId: 0,
    _regionalTimeseriesRequestId: 0,
    _regionalTimeseriesRequestKey: "k",
    _regionalTimeseriesAppliedKey: "k",
    _regionalTimeseriesLoadedAvgFields: new Set<string>(["ndvi"]),
    _polygonAvailableDatesUniqueid: "",
    _latestRasterDateByUniqueid: new Map<string, string>(),
    _pendingOverlayWalk: null,
    beginGraphFetch: jest.fn(),
    resolveCurrentRegionId: (): number | undefined => ids.region,
    resolveCurrentYear: (): number | undefined => ids.year,
    resolveCropIdForUniqueid: (): number | null => 3,
    rememberRasterDateForUniqueid: jest.fn(),
    markOverlayDateVerified: jest.fn(),
    applyVegetationImageOverlay: jest.fn((): Promise<void> => Promise.resolve()),
    getCarriedOverlayDate: (): string | null => null,
    kickOptimisticVegetationOverlay: jest.fn(),
    beginVegetationImageSurfaceLoading: jest.fn(),
    preparePolygonGraphSeries: jest.fn(prepare),
    cancelVegetationImageOverlay: jest.fn(),
    resolveAgainstAvailableDates: (raw: unknown, dates: string[]): string | null =>
      dates.includes(String(raw)) ? String(raw) : null,
    applyGraphData: jest.fn(),
  } as unknown as GraffDataServiceHost;
  host.setState = ((patch: HostState): void => {
    host.state = { ...host.state, ...patch };
  }) as GraffDataServiceHost["setState"];
  return host;
};

const veg = (raster_date: string): VegetationIndex => ({ raster_date, uniqueid: "U1", ndvi: 0.5 }) as VegetationIndex;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

beforeEach(() => {
  mockFetchDates.mockReset();
  mockDateWalk.mockReset();
  mockSeries.mockReset();
  mockPatchPack.mockReset();
});

describe("fetchGraffVegetationData", () => {
  test("requires a selected polygon", async () => {
    const host = makeHost({ selecteduniqueid: undefined });
    await fetchGraffVegetationData(host);
    expect(host.state.vegetationError).toContain("Полигон");
    expect(host._hasCompletedGraphFetch).toBe(true);
  });

  test("empty series clears chart and overlay", async () => {
    mockFetchDates.mockResolvedValue([]);
    mockSeries.mockResolvedValue([]);
    const host = makeHost();
    await fetchGraffVegetationData(host);
    expect(host.cancelVegetationImageOverlay).toHaveBeenCalled();
    expect(host.applyGraphData).toHaveBeenCalledWith([], expect.objectContaining({ polygonAvailableDates: [] }));
    expect(host._regionalTimeseriesAppliedKey).toBe("");
    expect(host._regionalTimeseriesLoadedAvgFields.size).toBe(0);
  });

  test("phase 1 paints series; failed dates keep phase 1", async () => {
    mockFetchDates.mockRejectedValue(new Error("dates down"));
    mockSeries.mockResolvedValue([veg("2024-05-01"), veg("2024-04-01")]);
    const host = makeHost();
    await fetchGraffVegetationData(host);
    expect(host.beginVegetationImageSurfaceLoading).toHaveBeenCalled();
    expect(host.applyGraphData).toHaveBeenCalledTimes(1);
    expect(host.applyVegetationImageOverlay).toHaveBeenCalledWith("{U1}", "2024-05-01", "ndvi");
    expect(mockSeries).toHaveBeenCalledWith("U1");
    expect(host.state.polygonAvailableDates).toEqual([]);
  });

  test("phase 2 refines series against available dates and walks overlay", async () => {
    mockFetchDates.mockResolvedValue(["2024-04-01"]);
    mockDateWalk.mockResolvedValue({ date: "2024-04-01", result: { url: "x" } });
    mockSeries.mockResolvedValue([veg("2024-05-01"), veg("2024-04-01")]);
    const host = makeHost();
    await fetchGraffVegetationData(host);
    await flush();
    expect(host.applyGraphData).toHaveBeenCalledTimes(2);
    const [rows, extra, opts] = (host.applyGraphData as jest.Mock).mock.calls[1] as [
      VegetationIndex[],
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(rows.map((r) => r.raster_date)).toEqual(["2024-04-01"]);
    expect(extra.polygonAvailableDates).toEqual(["2024-04-01"]);
    expect(opts).toEqual({ animate: false });
    expect(host.markOverlayDateVerified).toHaveBeenCalledWith("U1", "2024-04-01");
    expect(host._latestRasterDateByUniqueid.get("U1")).toBe("2024-04-01");
    expect(mockPatchPack).toHaveBeenCalled();
    expect(host._pendingOverlayWalk).toBeNull();
  });

  test("no overlap with available dates falls back to unfiltered series", async () => {
    mockFetchDates.mockResolvedValue(["2023-01-01"]);
    mockDateWalk.mockResolvedValue(null);
    mockSeries.mockResolvedValue([veg("2024-05-01")]);
    const host = makeHost();
    await fetchGraffVegetationData(host);
    expect(host.applyGraphData).toHaveBeenCalledTimes(1);
  });

  test("no region/year -> optimistic overlay without dates", async () => {
    mockSeries.mockResolvedValue([veg("2024-05-01")]);
    const host = makeHost({}, {});
    await fetchGraffVegetationData(host);
    expect(mockFetchDates).not.toHaveBeenCalled();
    expect(host.kickOptimisticVegetationOverlay).toHaveBeenCalledWith("{U1}");
    expect(host._polygonAvailableDatesUniqueid).toBe("");
  });

  test("known raster date kicks optimistic overlay", async () => {
    mockFetchDates.mockResolvedValue([]);
    mockSeries.mockResolvedValue([veg("2024-05-01")]);
    const host = makeHost();
    host._latestRasterDateByUniqueid.set("U1", "2024-05-01");
    await fetchGraffVegetationData(host);
    expect(host.kickOptimisticVegetationOverlay).toHaveBeenCalled();
  });

  test("series failure surfaces error", async () => {
    mockFetchDates.mockResolvedValue([]);
    mockSeries.mockRejectedValue(new Error("fs down"));
    const host = makeHost();
    await fetchGraffVegetationData(host);
    expect(host.state.vegetationError).toBe("fs down");
    expect(host.state.loadingVegetation).toBe(false);
  });

  test("stale request discards results", async () => {
    mockFetchDates.mockResolvedValue([]);
    const host = makeHost();
    mockSeries.mockImplementation((): Promise<VegetationIndex[]> => {
      host._vegetationDataRequestId += 1;
      return Promise.resolve([veg("2024-05-01")]);
    });
    await fetchGraffVegetationData(host);
    expect(host.applyGraphData).not.toHaveBeenCalled();
  });
});
