jest.mock("../../../../../gis/agri-chart-filter-order", () => ({
  clearPieVhFilterUniqueIds: jest.fn(),
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  preloadRegionYearMapImages: jest.fn(),
}));
jest.mock("../../../../localization/resolve-geo-codes", () => ({
  hasDistrictMappingForSelection: jest.fn(),
}));
jest.mock("../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import { preloadRegionYearMapImages } from "../../../../../gis/feature-layer-data";
import { hasDistrictMappingForSelection } from "../../../../localization/resolve-geo-codes";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import {
  applyGeographyOrCropSelection,
  applyVhOnlySelection,
  type SelectionApplyContext,
} from "./selection-apply";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const flush = async (): Promise<void> => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };
const zoom: MapZoomRequest = { mode: "none", reason: "other" };

const hostWith = (init: FakeHostInit = {}): FakeHost =>
  makeFakeHost({
    ensureRegionDistrictForSelection: jest.fn(() => Promise.resolve()),
    ensureCropIdForSelection: jest.fn(() => Promise.resolve()),
    applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    resolveVhMapUniqueIds: jest.fn(() => Promise.resolve(null)),
    isVhMapUniqueIdCacheWarm: jest.fn(() => true),
    getGeoCodeHelpers: () => ({ normalizeApos: (s: string) => s, makeRegionDistrictKey: (s) => String(s ?? "").toLowerCase() }),
    ...init,
  });

const ctxOf = (host: FakeHost, over: Partial<SelectionApplyContext> = {}): SelectionApplyContext => ({
  host,
  applyId: 1,
  isApplyCurrent: () => true,
  zoomRequest: zoom,
  yearChanged: false,
  viloyatChanged: false,
  tumanChanged: false,
  turiChanged: false,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  m(hasDistrictMappingForSelection).mockReturnValue(false);
});

describe("applyGeographyOrCropSelection", () => {
  it("geography change: awaits nothing blocking, applies map filters, fetches data and releases the loader", async () => {
    const host = hostWith({
      state: { yil: "2024", tuman: "", activeMapView: { view: { map: {} } } as never },
      getEffectiveViloyat: () => "Andijon",
    });
    await applyGeographyOrCropSelection(ctxOf(host, { viloyatChanged: true }));
    await flush();
    expect(host.broadcastFilterState).toHaveBeenCalledWith({ pendingOnly: true });
    expect(host.broadcastFilterState).toHaveBeenLastCalledWith();
    expect(preloadRegionYearMapImages).toHaveBeenCalledWith(expect.anything(), "2024", "Andijon");
    expect(host.applyMapFiltersOptimized).toHaveBeenCalledWith(zoom, expect.any(Function));
    expect(host.fetchDataWithCurrentState).toHaveBeenCalledTimes(1);
    expect(host.setMapSurfaceLoading).toHaveBeenCalledWith(false, "latest-filter-settled");
    expect(host.state.loading).toBe(false);
  });

  it("waits up to 120ms for region codes when they are not cached yet", async () => {
    jest.useFakeTimers();
    try {
      let release: () => void = () => undefined;
      const host = hostWith({
        ensureRegionDistrictForSelection: jest.fn(() => new Promise<void>((r) => { release = r; })),
        getEffectiveViloyat: () => "Andijon",
        state: { tuman: "T" },
      });
      await applyGeographyOrCropSelection(ctxOf(host, { tumanChanged: true }));
      await flush();
      expect(host.applyMapFiltersOptimized).not.toHaveBeenCalled();
      jest.advanceTimersByTime(121);
      await flush();
      expect(host.applyMapFiltersOptimized).toHaveBeenCalled();
      release();
      await flush();
      expect(host.fetchDataWithCurrentState).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it("skips the wait when codes are already cached", async () => {
    m(hasDistrictMappingForSelection).mockReturnValue(true);
    const host = hostWith({
      _viloyatToRegion: { andijon: 3 },
      getEffectiveViloyat: () => "Andijon",
      state: { tuman: "T" },
    });
    await applyGeographyOrCropSelection(ctxOf(host, { tumanChanged: true }));
    await flush();
    expect(host.applyMapFiltersOptimized).toHaveBeenCalled();
  });

  it("crop-only change: awaits crop ids; clearing a crop broadcasts without pending", async () => {
    const host = hostWith({ getSelectedTurlar: () => [] });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true }));
    expect(host.broadcastFilterState).toHaveBeenNthCalledWith(1);
    const host2 = hostWith({ getSelectedTurlar: () => ["paxta"] });
    await applyGeographyOrCropSelection(ctxOf(host2, { turiChanged: true }));
    expect(host2.broadcastFilterState).toHaveBeenNthCalledWith(1, { pendingOnly: true });
    expect(host2.ensureCropIdForSelection).toHaveBeenCalled();
  });

  it("skips pending broadcast when the VH bar data is reused", async () => {
    const host = hostWith({ _reuseVhBarDataOnNextBroadcast: true });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true }));
    expect(host.broadcastFilterState).toHaveBeenCalledTimes(1);
    expect(host.broadcastFilterState).toHaveBeenCalledWith();
  });

  it("stops early when the apply goes stale after region lookup", async () => {
    const host = hostWith({ getSelectedTurlar: () => ["paxta"] });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true, tumanChanged: true, isApplyCurrent: () => false }));
    expect(host.ensureCropIdForSelection).not.toHaveBeenCalled();
    expect(host.applyMapFiltersOptimized).not.toHaveBeenCalled();
  });

  it("stops after crop id resolution when stale", async () => {
    let current = true;
    const host = hostWith({
      getSelectedTurlar: () => ["paxta"],
      ensureCropIdForSelection: jest.fn(() => { current = false; return Promise.resolve(); }),
    });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true, isApplyCurrent: () => current }));
    expect(host.applyMapFiltersOptimized).not.toHaveBeenCalled();
  });

  it("does not fetch data when the apply goes stale after the map filter pass", async () => {
    let current = true;
    const host = hostWith({
      applyMapFiltersOptimized: jest.fn(() => { current = false; return Promise.resolve(); }),
    });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true, isApplyCurrent: () => current }));
    await flush();
    expect(host.fetchDataWithCurrentState).not.toHaveBeenCalled();
    expect(host.setMapSurfaceLoading).not.toHaveBeenCalled();
  });

  it("surfaces map apply failures in state", async () => {
    const host = hostWith({ applyMapFiltersOptimized: jest.fn(() => Promise.reject(new Error("map down"))) });
    await applyGeographyOrCropSelection(ctxOf(host, { turiChanged: true }));
    await flush();
    expect(host.state.error).toBe("map down");
    expect(host.state.loading).toBe(false);
    expect(host.setMapSurfaceLoading).toHaveBeenCalledWith(false, "latest-filter-settled");
  });
});

describe("applyVhOnlySelection", () => {
  it("defers cold narrow VH resolution and paints geography first", async () => {
    const host = hostWith({
      isVhMapUniqueIdCacheWarm: jest.fn(() => false),
      getSelectedTurlar: () => ["paxta"],
      _vhMapUniqueIds: ["a"],
    });
    await applyVhOnlySelection(ctxOf(host));
    await flush();
    expect(host._vhMapUniqueIds).toBeNull();
    expect(host._deferVhUniqueIdResolve).toBe(true);
    expect(host._suppressLegacyVhOnMap).toBe(true);
    expect(host._reuseVhBarDataOnNextBroadcast).toBe(true);
    expect(clearPieVhFilterUniqueIds).toHaveBeenCalled();
    expect(host.resolveVhMapUniqueIds).not.toHaveBeenCalled();
    expect(host.applyMapFiltersOptimized).toHaveBeenCalled();
    expect(host.setMapSurfaceLoading).toHaveBeenNthCalledWith(1, true, "vegetation");
    expect(host.setMapSurfaceLoading).toHaveBeenLastCalledWith(false, "latest-filter-settled");
  });

  it("logs a failing deferred map apply without throwing", async () => {
    const host = hostWith({
      isVhMapUniqueIdCacheWarm: jest.fn(() => false),
      getSelectedTurlar: () => ["paxta"],
      applyMapFiltersOptimized: jest.fn(() => Promise.reject(new Error("x"))),
    });
    await expect(applyVhOnlySelection(ctxOf(host))).resolves.toBeUndefined();
    await flush();
    expect(host.setMapSurfaceLoading).toHaveBeenLastCalledWith(false, "latest-filter-settled");
  });

  it("resolves ids, marks them ready, applies the map and refetches data (warm cache)", async () => {
    const host = hostWith({ state: { vh: "good" } });
    await applyVhOnlySelection(ctxOf(host));
    await flush();
    expect(host.resolveVhMapUniqueIds).toHaveBeenCalled();
    expect(host._vhUniqueIdsReadyForApply).toBe(true);
    expect(host.broadcastFilterState).toHaveBeenCalledTimes(1);
    expect(host.applyMapFiltersOptimized).toHaveBeenCalled();
    expect(host.fetchDataWithCurrentState).toHaveBeenCalledTimes(1);
  });

  it("aborts and releases the overlay when stale after resolving ids", async () => {
    const host = hostWith({ state: { vh: "good" } });
    await applyVhOnlySelection(ctxOf(host, { isApplyCurrent: () => false }));
    expect(host._vhUniqueIdsReadyForApply).toBe(false);
    expect(host.setMapSurfaceLoading).toHaveBeenLastCalledWith(false, "vegetation-stale");
    expect(host.applyMapFiltersOptimized).not.toHaveBeenCalled();
  });

  it("releases the selected polygon when it is not part of the new VH status", async () => {
    const events: Event[] = [];
    const listener = (e: Event): void => { events.push(e); };
    document.addEventListener("widgetSelectionChanged", listener);
    try {
      const host = hostWith({
        _vhMapUniqueIds: ["{OTHER}"],
        state: { vh: "good", polygonMode: true, selectedGraffUniqueid: "{ABC}" },
      });
      await applyVhOnlySelection(ctxOf(host));
      await flush();
      expect(host.state.polygonMode).toBe(false);
      expect(host.state.selectedGraffUniqueid).toBe("");
      expect(events).toHaveLength(1);
      expect((events[0] as CustomEvent<{ polygonMode: boolean }>).detail.polygonMode).toBe(false);
    } finally {
      document.removeEventListener("widgetSelectionChanged", listener);
    }
  });

  it("keeps the selected polygon when it is in the status ids", async () => {
    const host = hostWith({
      _vhMapUniqueIds: ["abc"],
      state: { vh: "good", polygonMode: true, selectedGraffUniqueid: "{ABC}" },
    });
    await applyVhOnlySelection(ctxOf(host));
    expect(host.state.polygonMode).toBe(true);
  });

  it("does not refetch when the apply becomes stale after the map pass", async () => {
    let current = true;
    const host = hostWith({
      applyMapFiltersOptimized: jest.fn(() => { current = false; return Promise.resolve(); }),
    });
    await applyVhOnlySelection(ctxOf(host, { isApplyCurrent: () => current }));
    await flush();
    expect(host.fetchDataWithCurrentState).not.toHaveBeenCalled();
  });
});
