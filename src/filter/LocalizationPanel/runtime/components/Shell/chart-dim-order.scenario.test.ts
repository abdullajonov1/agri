/**
 * End-to-end "first-selected wins" rule between Ekin turi (Pie) and
 * Vegetatsiya Holati (VH bar), driven through the real selection →
 * apply → broadcast → VH memo chain. Only network-facing pieces are faked:
 * the VH compute returns ALL (100) or a per-crop total, so every broadcast
 * shows which scope the bar was computed for.
 *
 * Rule: whichever chart is picked first filters the other chart; the second
 * pick only narrows the map and never filters the first chart back.
 */
jest.mock("../../../../localization/vh-bar-compute", () => ({
  executeVhBarCompute: jest.fn(),
}));
jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationUniqueIdsForStatus: jest.fn(() => Promise.resolve([])),
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  preloadRegionYearMapImages: jest.fn(),
}));
jest.mock("../../../../../data/agri-filter-store", () => ({
  syncMasterFilterSnapshot: jest.fn(),
  getMasterFilterSnapshot: jest.fn(() => null),
}));
jest.mock("../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import type { VHBarData } from "../../../../localization/vh-constants";
import { makeFakeHost, type FakeHost } from "../__test-utils__/fake-host";
import { computeVhBarData, makeVhBarComputeKey } from "../VhBar/vh-bar/vh-bar-prep";
import { broadcastFilterState } from "./broadcast-service";
import { syncChartDimOrder } from "./panel-handlers";
import { getChartFilterFlags } from "./panel-helpers";
import { handleWidgetSelection } from "./selection-service";

interface Detail {
  filters: { vh: string; turlar: string[]; filterPieByVh: boolean; filterVhBarByCrop: boolean };
  vhBarData: VHBarData | null;
  vhBarDataPending: boolean;
}

const bar = (totalCount: number): VHBarData => ({ categories: [], totalCount });
const ALL = 100;
const BY_CROP: Record<string, number> = { Paxta: 30, "Bug'doy": 20 };
const LAYER = { id: "fl" } as unknown as __esri.FeatureLayer;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

const normalizeTurlar = (raw: unknown, fallback = ""): string[] =>
  Array.isArray(raw) ? raw.map(String).filter(Boolean) : fallback ? [fallback] : [];

let events: Detail[];
const onMaster = (e: Event): void => {
  events.push((e as CustomEvent<Detail>).detail);
};
let ts = 1000;

function makeDashboard(): { h: FakeHost; computeCalls: () => string[][] } {
  const scopes: string[][] = [];
  const h = makeFakeHost({
    state: {
      connectionStatus: "connected",
      yil: "2026",
      viloyat: "Sirdaryo",
      featureLayers: [LAYER],
      language: "uz_lat",
    },
    _chartDimOrder: [],
  });
  Object.assign(h, {
    normalizeTurlar,
    getSelectedTurlar: () => normalizeTurlar(h.state.turlar, h.state.turi),
    getChartFilterFlags: (vh?: string, turlar?: string[]) => getChartFilterFlags(h, vh, turlar),
    syncChartDimOrder: (v: string, t: string[], reset: boolean) => syncChartDimOrder(h, v, t, reset),
    makeVhBarComputeKey: () => makeVhBarComputeKey(h),
    computeVhBarData: () => computeVhBarData(h),
    executeComputeVhBarData: jest.fn(async () => {
      const { turlar } = JSON.parse(makeVhBarComputeKey(h)) as { turlar: string[] };
      scopes.push(turlar);
      return bar(turlar.length ? turlar.reduce((s, t) => s + (BY_CROP[t] || 0), 0) : ALL);
    }),
    broadcastFilterState: (opts?: { pendingOnly?: boolean }) => broadcastFilterState(h, opts),
    getGeoScopedVhBarUsedDate: () => "2026-09-30",
    getLatestNdviDateForBar: () => "2026-09-30",
    buildWhereClause: () => "1=1",
    getEffectiveViloyat: () => "Sirdaryo",
    clearPolygonFilterGuards: jest.fn(),
    schedulePolygonFilterGuards: jest.fn(),
    emitGraffTableSearchClear: jest.fn(),
    ensureRegionDistrictForSelection: jest.fn(() => Promise.resolve()),
    ensureCropIdForSelection: jest.fn(() => Promise.resolve()),
    applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    isVhMapUniqueIdCacheWarm: () => true,
    resolveVhMapUniqueIds: jest.fn(async () => {
      h._vhMapUniqueIds = String(h.state.vh || "") ? ["m1"] : null;
      return h._vhMapUniqueIds;
    }),
  });
  return { h, computeCalls: () => scopes };
}

const pickCrop = (h: FakeHost, turlar: string[]): Promise<void> =>
  handleWidgetSelection(
    h,
    new CustomEvent("widgetSelectionChanged", {
      detail: {
        turi: turlar.length === 1 ? turlar[0] : "",
        turlar,
        polygonMode: false,
        source: "AgriPie",
        timestamp: (ts += 10),
      },
    }),
  );

const pickVh = (h: FakeHost, vh: string): Promise<void> =>
  handleWidgetSelection(
    h,
    new CustomEvent("widgetSelectionChanged", {
      detail: { source: "AgriBar", vh, language: "uz_lat" },
    }),
  );

/** What Bar and Pie see after the dust settles. */
const settled = async (): Promise<{ pieFilteredByVh: boolean; barFilteredByCrop: boolean; barTotal: number | undefined }> => {
  await flush();
  const last = events[events.length - 1];
  expect(last.vhBarDataPending).toBe(false);
  return {
    pieFilteredByVh: last.filters.filterPieByVh,
    barFilteredByCrop: last.filters.filterVhBarByCrop,
    barTotal: last.vhBarData?.totalCount,
  };
};

beforeEach(() => {
  events = [];
  document.addEventListener("masterFilterChanged", onMaster);
});
afterEach(() => document.removeEventListener("masterFilterChanged", onMaster));

async function openViloyat(h: FakeHost): Promise<void> {
  h.broadcastFilterState();
  await expect(settled()).resolves.toEqual({ pieFilteredByVh: false, barFilteredByCrop: false, barTotal: ALL });
}

describe("Ekin turi first → filters VH; VH then does not filter Pie", () => {
  test("crop → VH → VH off → crop off", async () => {
    const { h, computeCalls } = makeDashboard();
    await openViloyat(h);

    await pickCrop(h, ["Paxta"]);
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });

    await pickVh(h, "2-Yaxshi");
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });

    await pickVh(h, "4-Past");
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });

    await pickVh(h, "");
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });

    await pickCrop(h, []);
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: false, barTotal: ALL });

    // VH toggles never recomputed the bar — only crop changes did.
    expect(computeCalls()).toEqual([[], ["Paxta"]]);
  });

  test("changing / adding crops while VH is on keeps re-scoping the bar", async () => {
    const { h } = makeDashboard();
    await openViloyat(h);
    await pickCrop(h, ["Paxta"]);
    await pickVh(h, "2-Yaxshi");
    await settled();

    await pickCrop(h, ["Bug'doy"]);
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 20 });

    await pickCrop(h, ["Bug'doy", "Paxta"]);
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 50 });
  });

  test("crop cleared while VH stays → VH becomes first: Pie filtered, bar all crops", async () => {
    const { h } = makeDashboard();
    await openViloyat(h);
    await pickCrop(h, ["Paxta"]);
    await pickVh(h, "2-Yaxshi");
    await settled();

    await pickCrop(h, []);
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });

    // Crop picked again now comes second → bar stays all-crop.
    await pickCrop(h, ["Paxta"]);
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });
  });
});

describe("VH first → filters Pie; Ekin turi then does not filter VH", () => {
  test("VH → crop → VH change → crop change", async () => {
    const { h, computeCalls } = makeDashboard();
    await openViloyat(h);

    await pickVh(h, "2-Yaxshi");
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });

    await pickCrop(h, ["Paxta"]);
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });

    await pickVh(h, "3-O'rta");
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });

    await pickCrop(h, ["Bug'doy"]);
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });

    // The bar was never computed crop-scoped in this flow.
    expect(computeCalls()).toEqual([[]]);
  });

  test("crop cleared while VH stays → still VH-first, nothing recomputed", async () => {
    const { h, computeCalls } = makeDashboard();
    await openViloyat(h);
    await pickVh(h, "2-Yaxshi");
    await pickCrop(h, ["Paxta"]);
    await settled();

    await pickCrop(h, []);
    expect(await settled()).toEqual({ pieFilteredByVh: true, barFilteredByCrop: false, barTotal: ALL });
    expect(computeCalls()).toEqual([[]]);
  });

  test("VH cleared while crop stays → crop becomes first: bar re-scoped to crop", async () => {
    const { h } = makeDashboard();
    await openViloyat(h);
    await pickVh(h, "2-Yaxshi");
    await pickCrop(h, ["Paxta"]);
    await settled();

    await pickVh(h, "");
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });

    // VH picked again now comes second → Pie not filtered, bar stays crop.
    await pickVh(h, "1-Juda yaxshi");
    expect(await settled()).toEqual({ pieFilteredByVh: false, barFilteredByCrop: true, barTotal: 30 });
  });
});
