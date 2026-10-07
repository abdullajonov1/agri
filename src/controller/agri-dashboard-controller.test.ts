const bootstrapMock = jest.fn();
const regionRowsMock = jest.fn();
const pieRowsMock = jest.fn();
const indicatorMock = jest.fn();
const timeseriesMock = jest.fn();
const tableLayerMock = jest.fn();
const vegLayerMock = jest.fn();

jest.mock("../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: (): Promise<unknown> => bootstrapMock(),
}));
jest.mock("../data/agri-region-stats", () => ({
  queryRegionAggregateRows: (opts: Record<string, unknown>): Promise<unknown> => regionRowsMock(opts),
}));
jest.mock("../data/agri-pie-stats", () => ({
  queryPieAggregateRows: (opts: Record<string, unknown>): Promise<unknown> => pieRowsMock(opts),
}));
jest.mock("../data/agri-indicator-stats", () => ({
  queryIndicatorSumMaydon: (opts: Record<string, unknown>): Promise<unknown> => indicatorMock(opts),
}));
jest.mock("../data/agri-stats-store", () => ({
  getGraffRegionalTimeseriesCached: (opts: Record<string, unknown>): Promise<unknown> =>
    timeseriesMock(opts),
}));
jest.mock("../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): Promise<unknown> => tableLayerMock(),
}));
jest.mock("../gis/agri-vegetation-data-source", () => ({
  getAgriVegetationIndicesLayer: (): Promise<unknown> => vegLayerMock(),
}));
jest.mock("../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

import {
  buildDashboardPackKey,
  extractDashboardFilterSlice,
  resetDashboardController,
  scheduleDashboardController,
} from "./agri-dashboard-controller";
import {
  getDashboardPack,
  resetDashboardPackStore,
  setDashboardPack,
} from "../store/agri-dashboard-store";
import { emptyDashboardPack, type DashboardPack } from "../types/dashboard-pack";
import { VH_TO_NDVI_STATUS } from "../filter/localization/vh-constants";

interface TableLayerStub {
  objectIdField: string;
  loaded: boolean;
  load: jest.Mock;
  fields: Array<{ name: string; type: string }>;
}

function tableLayer(): TableLayerStub {
  return {
    objectIdField: "OBJECTID",
    loaded: false,
    load: jest.fn(() => Promise.resolve()),
    fields: [{ name: "maydon", type: "double" }],
  };
}

const BOOTSTRAP = {
  regionDistrictRows: [
    { viloyat: "Andijon", region: 1, tuman: "Asaka", district: 101, count: 3 },
  ],
  turiCropRows: [{ turi: "Bug'doy", cropId: "11" }],
};

function detail(filters: Record<string, unknown>, scope: Record<string, unknown> = {}): Record<string, unknown> {
  return { filters, scope };
}

async function runScheduled(): Promise<void> {
  jest.advanceTimersByTime(100);
  // Let the async controller chain settle.
  for (let i = 0; i < 20; i += 1) {
    await Promise.resolve();
  }
}

async function waitForPhase(phase: DashboardPack["phase"]): Promise<DashboardPack> {
  for (let i = 0; i < 50; i += 1) {
    if (getDashboardPack().phase === phase) return getDashboardPack();
    await Promise.resolve();
  }
  return getDashboardPack();
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  resetDashboardPackStore();
  resetDashboardController();
  [bootstrapMock, regionRowsMock, pieRowsMock, indicatorMock, timeseriesMock, tableLayerMock, vegLayerMock].forEach(
    (m) => m.mockReset(),
  );
  bootstrapMock.mockResolvedValue(BOOTSTRAP);
  vegLayerMock.mockResolvedValue({});
  tableLayerMock.mockResolvedValue({ layer: tableLayer() });
  regionRowsMock.mockResolvedValue({ rows: [{ name: "A", maydon: 10 }], totalArea: 10 });
  pieRowsMock.mockResolvedValue({ rows: [{ key: "11", value: 4 }], totalValue: 4 });
  indicatorMock.mockResolvedValue(42);
  timeseriesMock.mockResolvedValue([{ date: "2024-05-01", ndvi: 0.5, polygon_count: 1 }]);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("extractDashboardFilterSlice / buildDashboardPackKey", () => {
  test("normalizes strings, turlar fallback and scope lock", () => {
    const slice = extractDashboardFilterSlice(
      detail({ yil: 2024, viloyat: " A ", turi: "Paxta", filterPieByVh: "yes" }, { lockedViloyat: "L" }),
    );
    expect(slice).toEqual({
      yil: "2024",
      viloyat: "A",
      tuman: "",
      turi: "Paxta",
      turlar: ["Paxta"],
      vh: "",
      lockedViloyat: "L",
      filterPieByVh: false,
    });
  });

  test("turlar array is trimmed and deduped", () => {
    const slice = extractDashboardFilterSlice(
      detail({ turlar: [" a", "a", "", null, "b"], filterPieByVh: true }),
    );
    expect(slice.turlar).toEqual(["a", "b"]);
    expect(slice.filterPieByVh).toBe(true);
  });

  test("missing filters/scope yields empty slice", () => {
    const slice = extractDashboardFilterSlice({});
    expect(slice.yil).toBe("");
    expect(slice.turlar).toEqual([]);
  });

  test("pack key is stable and sensitive to every field", () => {
    const a = extractDashboardFilterSlice(detail({ yil: "2024" }));
    expect(buildDashboardPackKey(a)).toBe(buildDashboardPackKey({ ...a }));
    expect(buildDashboardPackKey(a)).not.toBe(buildDashboardPackKey({ ...a, vh: "x" }));
    expect(buildDashboardPackKey(a)).not.toBe(buildDashboardPackKey({ ...a, lockedViloyat: "L" }));
  });
});

describe("scheduleDashboardController", () => {
  test("ignores empty detail and VH-bar pending broadcasts", async () => {
    scheduleDashboardController(null);
    scheduleDashboardController({ vhBarDataPending: true, filters: { yil: "2024" } });
    await runScheduled();
    expect(getDashboardPack().phase).toBe("idle");
    expect(tableLayerMock).not.toHaveBeenCalled();
  });

  test("no year -> immediately ready, empty pack, no queries", async () => {
    scheduleDashboardController(detail({ viloyat: "A" }));
    expect(getDashboardPack().phase).toBe("ready");
    expect(getDashboardPack().filter.viloyat).toBe("A");
    await runScheduled();
    expect(tableLayerMock).not.toHaveBeenCalled();
  });

  test("republic year filter prefetches all slices and publishes ready pack", async () => {
    scheduleDashboardController(detail({ yil: "2024" }));
    expect(getDashboardPack().phase).toBe("warming");
    await runScheduled();
    const pack = await waitForPhase("ready");

    expect(pack.phase).toBe("ready");
    expect(pack.statsDeferredToPanels).toBe(false);
    expect(pack.region).toEqual(
      expect.objectContaining({ view: "viloyat", groupField: "viloyat", totalArea: 10 }),
    );
    expect(pack.pie).toEqual(expect.objectContaining({ categoryField: "crop_id", totalValue: 4 }));
    expect(pack.indicator).toEqual(
      expect.objectContaining({ statOperation: "sum", attributeField: "maydon", value: 42 }),
    );
    expect(pack.graff).toEqual(
      expect.objectContaining({
        region: null,
        district: null,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      }),
    );
    expect(pack.graffPolygon).toBeNull();
    // Republic graff only averages NDVI
    expect(timeseriesMock.mock.calls[0][0]).toEqual(expect.objectContaining({ avgFields: ["ndvi"] }));
    expect(regionRowsMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ groupField: "viloyat", codeField: "region", areaField: "maydon" }),
    );
  });

  test("viloyat + tuman resolve region/district codes for graff and tuman view for region", async () => {
    scheduleDashboardController(
      detail({ yil: "2024", viloyat: "Andijon", tuman: "Asaka", turlar: ["Wheat"] }),
    );
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.region?.view).toBe("tuman");
    expect(pack.graff).toEqual(expect.objectContaining({ region: 1, district: 101, cropIds: ["11"] }));
    expect(timeseriesMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ region: 1, district: 101, cropId: "11", avgFields: undefined }),
    );
  });

  test("numeric viloyat/tuman codes are used directly", async () => {
    scheduleDashboardController(detail({ yil: "2024", viloyat: "7", tuman: "701" }));
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.graff).toEqual(expect.objectContaining({ region: 7, district: 701 }));
  });

  test("unresolvable viloyat, tuman or crop leaves graff null but other slices ready", async () => {
    scheduleDashboardController(detail({ yil: "2024", viloyat: "Nowhere" }));
    await runScheduled();
    expect((await waitForPhase("ready")).graff).toBeNull();

    resetDashboardController();
    scheduleDashboardController(detail({ yil: "2024", viloyat: "Andijon", tuman: "Nowhere" }));
    await runScheduled();
    expect((await waitForPhase("ready")).graff).toBeNull();

    resetDashboardController();
    scheduleDashboardController(detail({ yil: "2024", turi: "Kiwi" }));
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.graff).toBeNull();
    expect(pack.indicator?.value).toBe(42);
  });

  test("year without a 4-digit token skips graff", async () => {
    scheduleDashboardController(detail({ yil: "joriy" }));
    await runScheduled();
    expect((await waitForPhase("ready")).graff).toBeNull();
    expect(timeseriesMock).not.toHaveBeenCalled();
  });

  test("VH active defers pie/indicator but still packs region and graff with ndvi status", async () => {
    const vh = Object.keys(VH_TO_NDVI_STATUS)[0];
    scheduleDashboardController(detail({ yil: "2024", vh }));
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.statsDeferredToPanels).toBe(true);
    expect(pack.pie).toBeNull();
    expect(pack.indicator).toBeNull();
    expect(pack.region).not.toBeNull();
    expect(pieRowsMock).not.toHaveBeenCalled();
    expect(timeseriesMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ ndviStatus: VH_TO_NDVI_STATUS[vh] }),
    );
  });

  test("a failing slice becomes null without failing the pack", async () => {
    pieRowsMock.mockRejectedValue(new Error("pie down"));
    scheduleDashboardController(detail({ yil: "2024" }));
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.pie).toBeNull();
    expect(pack.region).not.toBeNull();
  });

  test("table layer failure publishes error phase with message", async () => {
    tableLayerMock.mockRejectedValue(new Error("layer offline"));
    scheduleDashboardController(detail({ yil: "2024" }));
    await runScheduled();
    const pack = await waitForPhase("error");
    expect(pack.phase).toBe("error");
    expect(pack.error).toBe("layer offline");
    expect(pack.statsDeferredToPanels).toBe(true);
  });

  test("layer load failure is non-fatal", async () => {
    const layer = tableLayer();
    layer.load.mockRejectedValue(new Error("load failed"));
    tableLayerMock.mockResolvedValue({ layer });
    scheduleDashboardController(detail({ yil: "2024" }));
    await runScheduled();
    expect((await waitForPhase("ready")).phase).toBe("ready");
  });

  test("same key already ready in memory is not re-queried", async () => {
    const filter = extractDashboardFilterSlice(detail({ yil: "2024" }));
    setDashboardPack(emptyDashboardPack({ phase: "ready", key: buildDashboardPackKey(filter), filter }));
    scheduleDashboardController(detail({ yil: "2024" }));
    await runScheduled();
    expect(tableLayerMock).not.toHaveBeenCalled();
  });

  test("persisted ready pack for the key is adopted without queries", async () => {
    const filter = extractDashboardFilterSlice(detail({ yil: "2023" }));
    const key = buildDashboardPackKey(filter);
    setDashboardPack(emptyDashboardPack({ phase: "ready", key, filter }));
    // Move live store elsewhere; persisted copy remains in localStorage.
    setDashboardPack(emptyDashboardPack({ phase: "idle" }));
    scheduleDashboardController(detail({ yil: "2023" }));
    expect(getDashboardPack().key).toBe(key);
    expect(getDashboardPack().phase).toBe("ready");
    await runScheduled();
    expect(tableLayerMock).not.toHaveBeenCalled();
  });

  test("rapid filter changes are debounced to the last one", async () => {
    scheduleDashboardController(detail({ yil: "2022" }));
    scheduleDashboardController(detail({ yil: "2024" }));
    await runScheduled();
    const pack = await waitForPhase("ready");
    expect(pack.filter.yil).toBe("2024");
    expect(regionRowsMock).toHaveBeenCalledTimes(1);
  });
});
