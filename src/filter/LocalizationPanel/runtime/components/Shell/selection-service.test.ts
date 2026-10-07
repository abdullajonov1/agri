jest.mock("../../../../../gis/agri-chart-filter-order", () => ({
  clearPieVhFilterUniqueIds: jest.fn(),
}));
jest.mock("./selection-apply", () => ({
  applyGeographyOrCropSelection: jest.fn(() => Promise.resolve()),
  applyVhOnlySelection: jest.fn(() => Promise.resolve()),
}));
jest.mock("../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import type { ChartFilterFlags } from "../../../../../gis/agri-chart-filter-order";
import { applyGeographyOrCropSelection, applyVhOnlySelection } from "./selection-apply";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import { handleWidgetSelection } from "./selection-service";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const flush = async (): Promise<void> => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };

const normalizeTurlar = (raw: unknown, fallback = ""): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  return fallback ? [fallback] : [];
};

const mk = (init: FakeHostInit = {}): FakeHost =>
  makeFakeHost({
    normalizeTurlar,
    syncChartDimOrder: jest.fn(),
    clearPolygonFilterGuards: jest.fn(),
    schedulePolygonFilterGuards: jest.fn(),
    emitGraffTableSearchClear: jest.fn(),
    ...init,
  });

const ev = (detail: object | null): Event => ({ detail }) as unknown as Event;

interface ApplyCall { zoomRequest: { mode: string; reason: string }; yearChanged: boolean; viloyatChanged: boolean; tumanChanged: boolean; turiChanged: boolean; isApplyCurrent: () => boolean }
const lastGeoCall = (): ApplyCall => m(applyGeographyOrCropSelection).mock.calls.slice(-1)[0][0] as ApplyCall;

beforeEach(() => {
  jest.clearAllMocks();
  m(applyGeographyOrCropSelection).mockResolvedValue(undefined);
  m(applyVhOnlySelection).mockResolvedValue(undefined);
});

describe("handleWidgetSelection guards", () => {
  it("ignores events when unmounted", async () => {
    const h = mk({ _isMounted: false });
    await handleWidgetSelection(h, ev({ viloyat: "A" }));
    expect(h.setState).not.toHaveBeenCalled();
  });

  it("drops out-of-order geography events but accepts newer or untimed ones", async () => {
    const h = mk({ _lastGeographySelectionTs: 100 });
    await handleWidgetSelection(h, ev({ viloyat: "A", timestamp: 50 }));
    expect(h.setState).not.toHaveBeenCalled();
    await handleWidgetSelection(h, ev({ viloyat: "A", timestamp: 150 }));
    expect(h._lastGeographySelectionTs).toBe(150);
    await handleWidgetSelection(h, ev({ viloyat: "B" }));
    expect(h.state.viloyat).toBe("B");
  });

  it("is a no-op when updates match the current state", async () => {
    const h = mk({ state: { viloyat: "A" } });
    await handleWidgetSelection(h, ev({ viloyat: "A" }));
    expect(h.setState).not.toHaveBeenCalled();
    await handleWidgetSelection(h, ev(null));
    expect(h.setState).not.toHaveBeenCalled();
  });
});

describe("hierarchy clearing and zoom selection", () => {
  it("year change clears everything below and zooms home", async () => {
    const h = mk({
      state: { yil: "2023", viloyat: "A", tuman: "T", turi: "x", turlar: ["x"], vh: "good", ndviDate: "d" },
      _vhMapUniqueIds: ["a"],
      _vhUniqueIdCache: { k: ["1"] },
      _vhBarUsedDate: "d",
    });
    await handleWidgetSelection(h, ev({ yil: 2024, timestamp: 10 }));
    await flush();
    expect(h.state).toMatchObject({ yil: "2024", viloyat: "", tuman: "", turi: "", turlar: [], vh: "", ndviDate: "" });
    expect(h._vhMapUniqueIds).toBeNull();
    expect(h._vhUniqueIdCache).toEqual({});
    expect(h._vhBarUsedDate).toBeNull();
    expect(h.state.loading).toBe(true);
    const call = lastGeoCall();
    expect(call.zoomRequest).toEqual({ mode: "home", reason: "year" });
    expect(call.yearChanged).toBe(true);
    expect(h._geographyApplyId).toBe(1);
    expect(h._broadcastGeneration).toBe(1);
    expect(h.clearPolygonFilterGuards).toHaveBeenCalled();
  });

  it("viloyat change keeps explicit tuman/turi from the same event and clears vh", async () => {
    const h = mk({ state: { viloyat: "A", tuman: "T", vh: "good" }, _vhMapUniqueIds: ["a"] });
    await handleWidgetSelection(h, ev({ viloyat: "B", tuman: "T2", turi: "paxta" }));
    await flush();
    expect(h.state).toMatchObject({ viloyat: "B", tuman: "T2", turi: "paxta", turlar: ["paxta"], vh: "" });
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "selection", reason: "region" });
  });

  it("viloyat cleared zooms home; clears tuman and crops when not provided", async () => {
    const h = mk({ state: { viloyat: "A", tuman: "T", turi: "p", turlar: ["p"] } });
    await handleWidgetSelection(h, ev({ viloyat: "" }));
    await flush();
    expect(h.state).toMatchObject({ viloyat: "", tuman: "", turi: "", turlar: [] });
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "home", reason: "region" });
  });

  it("locked accounts never accept a different viloyat", async () => {
    const h = mk({ state: { lockedViloyat: "L", viloyat: "L", tuman: "" } });
    await handleWidgetSelection(h, ev({ viloyat: "Other", tuman: "T" }));
    await flush();
    expect(h.state.viloyat).toBe("L");
    expect(h.state.tuman).toBe("T");
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "selection", reason: "district" });
  });

  it("tuman change clears crops and VH; clearing tuman uses district-clear", async () => {
    const h = mk({ state: { viloyat: "A", tuman: "T", turi: "p", turlar: ["p"], vh: "good" } });
    await handleWidgetSelection(h, ev({ tuman: "" }));
    await flush();
    expect(h.state).toMatchObject({ tuman: "", turi: "", turlar: [], vh: "" });
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "selection", reason: "district-clear" });
  });

  it("geography change from another widget resets farmer search and polygon focus", async () => {
    const timer = setTimeout(() => undefined, 10000);
    const h = mk({
      state: { viloyat: "A", polygonMode: true, selectedGraffUniqueid: "u", selectedFarmerInn: "123", graffSearchText: "abc" },
      _graffSearchDebounceTimer: timer,
      _farmerMapUniqueIds: ["x"],
    });
    await handleWidgetSelection(h, ev({ viloyat: "B", source: "Region" }));
    expect(h.state).toMatchObject({ polygonMode: false, selectedGraffUniqueid: "", selectedFarmerInn: "", graffSearchText: "" });
    expect(h._farmerMapUniqueIds).toBeNull();
    expect(h._graffSearchDebounceTimer).toBeNull();
  });

  it("keeps farmer search while a farmer geo lock is applying", async () => {
    const h = mk({ _farmerSearchApplying: true, state: { viloyat: "A", selectedFarmerInn: "123", graffSearchText: "abc" } });
    await handleWidgetSelection(h, ev({ viloyat: "B" }));
    expect(h.state.selectedFarmerInn).toBe("123");
    expect(h.state.graffSearchText).toBe("abc");
  });

  it("AgriBar events keep their own VH across geography", async () => {
    const h = mk({ state: { viloyat: "A" } });
    await handleWidgetSelection(h, ev({ viloyat: "B", vh: "good", source: "AgriBar" }));
    expect(h.state.vh).toBe("good");
  });
});

describe("crop (turi) changes", () => {
  it("crop selection zooms nowhere and records crop state", async () => {
    const h = mk({ state: { vh: "" } });
    await handleWidgetSelection(h, ev({ turlar: ["paxta", "bugdoy"] }));
    await flush();
    expect(h.state.turlar).toEqual(["paxta", "bugdoy"]);
    expect(h.state.turi).toBe("");
    const call = lastGeoCall();
    expect(call.zoomRequest).toEqual({ mode: "none", reason: "crop" });
    expect(call.turiChanged).toBe(true);
    expect(h._reuseVhBarDataOnNextBroadcast).toBe(true);
  });

  it("clearing the crop under VH drops crop-scoped ids and re-resolves (VH-first)", async () => {
    const h = mk({
      state: { turlar: ["paxta"], turi: "paxta", vh: "good" },
      _vhMapUniqueIds: ["a"],
      getChartFilterFlags: () => ({ filterPieByVh: true, filterVhBarByCrop: false }) as ChartFilterFlags,
    });
    await handleWidgetSelection(h, ev({ turlar: [] }));
    expect(h._vhMapUniqueIds).toBeNull();
    expect(clearPieVhFilterUniqueIds).toHaveBeenCalled();
    expect(h._vhUniqueIdsReadyForApply).toBe(false);
    expect(h._reuseVhBarDataOnNextBroadcast).toBe(true);
  });

  it("crop-first VH bar forces a recompute", async () => {
    const h = mk({
      state: { vh: "good" },
      getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }) as ChartFilterFlags,
      _reuseVhBarDataOnNextBroadcast: true,
    });
    await handleWidgetSelection(h, ev({ turlar: ["paxta"] }));
    expect(h._reuseVhBarDataOnNextBroadcast).toBe(false);
    expect(h._vhUniqueIdsReadyForApply).toBe(false);
  });

  it("crop-first cleared drops the cached VH bar", async () => {
    let calls = 0;
    const h = mk({
      state: { turlar: ["paxta"], turi: "paxta" },
      _lastVhBarData: { total: 1 } as never,
      getChartFilterFlags: () => {
        calls += 1;
        return { filterPieByVh: false, filterVhBarByCrop: calls === 1 } as ChartFilterFlags;
      },
    });
    await handleWidgetSelection(h, ev({ turlar: [] }));
    expect(h._lastVhBarData).toBeNull();
    expect(h._vhUniqueIdsReadyForApply).toBe(false);
  });
});

describe("other updates", () => {
  it("VH picks from non-AgriBar sources ignore blank values; AgriBar may clear", async () => {
    const a = mk({ state: { vh: "good" } });
    await handleWidgetSelection(a, ev({ vh: "", source: "AgriPie" }));
    expect(a.setState).not.toHaveBeenCalled();
    const b = mk({ state: { vh: "good" } });
    await handleWidgetSelection(b, ev({ vh: "", source: "AgriBar" }));
    await flush();
    expect(b.state.vh).toBe("");
    expect(m(applyVhOnlySelection)).toHaveBeenCalledTimes(1);
    expect(m(applyGeographyOrCropSelection)).not.toHaveBeenCalled();
  });

  it("a vh event from another source maps to a vegetation zoom reason", async () => {
    const h = mk();
    await handleWidgetSelection(h, ev({ vh: "good", source: "AgriPie" }));
    await flush();
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "none", reason: "vegetation" });
  });

  it("NDVI date changes lock the date (unless geography changed) and zoom to selection", async () => {
    const h = mk({ state: { ndviDate: "2024-01-01" }, _ndviBucketToIds: { a: ["1"] } });
    await handleWidgetSelection(h, ev({ ndviDate: "2024-02-01" }));
    await flush();
    expect(h.state.ndviDate).toBe("2024-02-01");
    expect(h.state.ndviDateLocked).toBe(true);
    expect(h._ndviBucketToIds).toEqual({});
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "selection", reason: "ndvi" });
  });

  it("ignores Graff NDVI date changes while a polygon chart is active", async () => {
    const h = mk({ state: { polygonMode: true, ndviDate: "2024-01-01" } });
    await handleWidgetSelection(h, ev({ ndviDate: "2024-02-01", source: "AgriGraffWidget" }));
    expect(h.state.ndviDate).toBe("2024-01-01");
  });

  it("language updates apply without zoom", async () => {
    const h = mk();
    await handleWidgetSelection(h, ev({ language: "ru" }));
    await flush();
    expect(h.state.language).toBe("ru");
    expect(lastGeoCall().zoomRequest).toEqual({ mode: "none", reason: "other" });
  });

  it("sets the debug-year flag for 2024", async () => {
    const h = mk({ state: { yil: "2022" } });
    await handleWidgetSelection(h, ev({ yil: "2024" }));
    expect(window.__AGRI3_DEBUG_YEAR__).toBe("2024");
    await handleWidgetSelection(h, ev({ yil: "2023" }));
    expect(window.__AGRI3_DEBUG_YEAR__).toBe("");
  });

  it("apply errors are surfaced and the apply surface is released", async () => {
    m(applyGeographyOrCropSelection).mockRejectedValue(new Error("apply fail"));
    const h = mk();
    await handleWidgetSelection(h, ev({ language: "ru" }));
    await flush();
    expect(h.state.error).toBe("apply fail");
    expect(h.state.loading).toBe(false);
    expect(h.setMapSurfaceLoading).toHaveBeenCalledWith(false, "latest-filter-settled");
    expect(h.broadcastFilterState).toHaveBeenCalled();
  });
});

describe("polygon-only selections", () => {
  it("polygon pick stores the unique id, broadcasts and schedules guards without loading flip", async () => {
    const h = mk({ state: { loading: false } });
    await handleWidgetSelection(h, ev({ uniqueid: "{U1}", polygonMode: true, source: "AgriPopup" }));
    await flush();
    expect(h.state.selectedGraffUniqueid).toBe("{U1}");
    expect(typeof h.state.selectedGraffUniqueidClickedAt).toBe("number");
    expect(h.state.loading).toBe(false);
    expect(h.clearPolygonFilterGuards).not.toHaveBeenCalled();
    expect(h.broadcastFilterState).toHaveBeenCalled();
    expect(h.schedulePolygonFilterGuards).toHaveBeenCalled();
    expect(h._geographyApplyId).toBe(0);
    expect(m(applyGeographyOrCropSelection)).not.toHaveBeenCalled();
  });

  it("uses an explicit clickedAt and does not invent one for Graff selections", async () => {
    const a = mk();
    await handleWidgetSelection(a, ev({ uniqueid: "u", clickedAt: 99, polygonMode: true }));
    expect(a.state.selectedGraffUniqueidClickedAt).toBe(99);
    const b = mk();
    await handleWidgetSelection(b, ev({ uniqueid: "u", polygonMode: true, source: "AgriGraffWidget" }));
    expect(b.state.selectedGraffUniqueidClickedAt).toBeUndefined();
  });

  it("polygon exit resets selection and requests a polygon-exit zoom context", async () => {
    const h = mk({ state: { polygonMode: true, selectedGraffUniqueid: "u" } });
    await handleWidgetSelection(h, ev({ polygonMode: false, source: "AgriPopup" }));
    await flush();
    expect(h.state.polygonMode).toBe(false);
    expect(h.state.selectedGraffUniqueid).toBe("");
    expect(h.schedulePolygonFilterGuards).not.toHaveBeenCalled();
  });

  it("popup polygon-exit clears the table search when a search selection existed", async () => {
    const h = mk({ state: { polygonMode: true, selectedGraffUniqueid: "u", graffSearchText: "q" } });
    await handleWidgetSelection(h, ev({ polygonMode: false, source: "AgriPopup" }));
    await flush();
    expect(h.state.graffSearchText).toBe("");
    expect(h.emitGraffTableSearchClear).toHaveBeenCalledWith();
  });

  it("map-picking a different field keeps the selection and only clears search UI", async () => {
    const timer = setTimeout(() => undefined, 10000);
    const h = mk({
      state: { graffSearchText: "q", selectedGraffUniqueid: "{OLD}" },
      _graffSearchDebounceTimer: timer,
    });
    await handleWidgetSelection(h, ev({ uniqueid: "{NEW}", polygonMode: true, source: "AgriPopup" }));
    await flush();
    expect(h.state.graffSearchText).toBe("");
    expect(h.state.selectedGraffUniqueid).toBe("{NEW}");
    expect(h.emitGraffTableSearchClear).toHaveBeenCalledWith({ preserveSelection: true });
    expect(h._graffSearchDebounceTimer).toBeNull();
  });
});

describe("staleness", () => {
  it("a newer selection invalidates the previous apply", async () => {
    const h = mk();
    await handleWidgetSelection(h, ev({ language: "ru" }));
    const first = lastGeoCall();
    expect(first.isApplyCurrent()).toBe(true);
    await handleWidgetSelection(h, ev({ language: "en" }));
    expect(first.isApplyCurrent()).toBe(false);
    expect(lastGeoCall().isApplyCurrent()).toBe(true);
    h._isMounted = false;
    expect(lastGeoCall().isApplyCurrent()).toBe(false);
  });
});
