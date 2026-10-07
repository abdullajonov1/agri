jest.mock("../../../../../gis/agri-chart-filter-order", () => ({
  clearPieVhFilterUniqueIds: jest.fn(),
  upsertChartDimOrder: jest.fn((order: string[], dim: string, on: boolean) => {
    if (!on) return order.filter((d) => d !== dim);
    return order.includes(dim) ? order : [...order, dim];
  }),
}));
jest.mock("../../../../localization/layer-utils", () => ({
  getLayerMatchStateForViloyat: jest.fn(() => "match"),
}));
jest.mock("../../../../localization/resolve-geo-codes", () => ({
  resolveRegionNumberFromMaps: jest.fn(() => 3),
  resolveDistrictNumberFromMaps: jest.fn(() => 9),
  listDistrictsForViloyat: jest.fn(() => ({ names: ["A"], codes: [1] })),
}));
jest.mock("../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { clearPieVhFilterUniqueIds } from "../../../../../gis/agri-chart-filter-order";
import { getLayerMatchStateForViloyat as sharedMatch } from "../../../../localization/layer-utils";
import { resolveDistrictNumberFromMaps, resolveRegionNumberFromMaps } from "../../../../localization/resolve-geo-codes";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import {
  applyLanguage,
  applyYil,
  ensureInitialization,
  getAdminBoundarySelection,
  getLayerMatchStateForViloyat,
  handleNdviDateChange,
  handlePolygonMapClickPhase,
  handleYilChange,
  resolveAllowedViloyats,
  resolveGroupScope,
  setMapSurfaceLoading,
  syncChartDimOrder,
  toggleToolbarMenu,
} from "./panel-handlers";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const flush = async (): Promise<void> => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };

const mk = (init: FakeHostInit = {}): FakeHost =>
  makeFakeHost({
    getGeoCodeHelpers: () => ({ normalizeApos: (s: string) => s, makeRegionDistrictKey: (s) => String(s ?? "") }),
    applyMapFiltersOptimized: jest.fn(() => Promise.resolve()),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    warmYearRegionMapImages: jest.fn(),
    runInitialDataLoad: jest.fn(() => Promise.resolve()),
    retryMapConnection: jest.fn(),
    onNotificationsMenuOpened: jest.fn(),
    _normId: (s?: string) => String(s ?? "").toLowerCase(),
    ...init,
  });

beforeEach(() => jest.clearAllMocks());

describe("getAdminBoundarySelection", () => {
  it("combines viloyat, tuman and resolved codes/district lists", () => {
    const h = mk({ getEffectiveViloyat: () => "Andijon", state: { tuman: "Asaka" } });
    const sel = getAdminBoundarySelection(h);
    expect(sel).toEqual({ viloyat: "Andijon", tuman: "Asaka", regionCode: 3, districtCode: 9, districtNames: ["A"], districtCodes: [1] });
    expect(resolveRegionNumberFromMaps).toHaveBeenCalled();
    expect(m(resolveDistrictNumberFromMaps).mock.calls[0][3]).toMatchObject({ rawViloyat: "Andijon" });
  });
});

describe("setMapSurfaceLoading", () => {
  it("dispatches an agriMapSurfaceLoading event", () => {
    const events: CustomEvent<{ loading: boolean; reason: string }>[] = [];
    const listener = (e: Event): void => { events.push(e as CustomEvent<{ loading: boolean; reason: string }>); };
    document.addEventListener("agriMapSurfaceLoading", listener);
    try {
      setMapSurfaceLoading(mk(), true, "why");
    } finally {
      document.removeEventListener("agriMapSurfaceLoading", listener);
    }
    expect(events[0].detail).toMatchObject({ loading: true, reason: "why" });
  });
});

describe("getLayerMatchStateForViloyat", () => {
  it("delegates to the shared matcher with host key helpers", () => {
    const h = mk({ _viloyatKeyToLayerKeys: { a: ["k"] }, getLayerKey: () => "k", makeRegionDistrictKey: (r) => `key:${r}` });
    const layer = {} as __esri.FeatureLayer;
    expect(getLayerMatchStateForViloyat(h, layer, "Andijon")).toBe("match");
    const arg = m(sharedMatch).mock.calls[0][0] as { makeRegionDistrictKey: (r: string) => string; getLayerKey: (l: __esri.FeatureLayer) => string; effectiveViloyat: string };
    expect(arg.effectiveViloyat).toBe("Andijon");
    expect(arg.makeRegionDistrictKey("x")).toBe("key:x");
    expect(arg.getLayerKey(layer)).toBe("k");
  });
});

describe("handlePolygonMapClickPhase", () => {
  const ev = (detail: object | null): Event => ({ detail }) as unknown as Event;
  it("re-syncs shown region-year layers when a map is present", () => {
    const shown = [{ layer: {} }];
    const h = mk({ syncShownRegionYearLayers: jest.fn(() => shown as never), state: { activeMapView: { view: { map: {} } } as never } });
    handlePolygonMapClickPhase(h, ev({ phase: "x" }));
    expect(h._lastShownRegionYearLayers).toBe(shown);
  });
  it("does nothing when unmounted or no map", () => {
    const sync = jest.fn((): never[] => []);
    handlePolygonMapClickPhase(mk({ _isMounted: false, syncShownRegionYearLayers: sync }), ev(null));
    handlePolygonMapClickPhase(mk({ syncShownRegionYearLayers: sync }), ev(null));
    expect(sync).not.toHaveBeenCalled();
  });
});

describe("ensureInitialization", () => {
  it("runs the initial load when connected with a data source but no year options", async () => {
    const h = mk({ state: { dataSource: {} as never, connectionStatus: "connected", yilOptions: [] } });
    await ensureInitialization(h);
    expect(h.runInitialDataLoad).toHaveBeenCalled();
  });
  it("retries a failed connection and ignores other states", async () => {
    const f = mk({ state: { connectionStatus: "failed" } });
    await ensureInitialization(f);
    expect(f.retryMapConnection).toHaveBeenCalled();
    const ok = mk({ state: { dataSource: {} as never, connectionStatus: "connected", yilOptions: ["2024"] } });
    await ensureInitialization(ok);
    expect(ok.runInitialDataLoad).not.toHaveBeenCalled();
    const off = mk({ _isMounted: false, state: { connectionStatus: "failed" } });
    await ensureInitialization(off);
    expect(off.retryMapConnection).not.toHaveBeenCalled();
  });
});

describe("group scope helpers (no mapped groups configured)", () => {
  const groups = [{ id: "ABC", title: "G" }];
  it("resolveGroupScope finds nothing", () => {
    expect(resolveGroupScope(mk(), groups)).toBeNull();
  });
  it("resolveAllowedViloyats is empty", () => {
    expect(resolveAllowedViloyats(mk(), groups)).toEqual([]);
  });
});

describe("toggleToolbarMenu", () => {
  it("opens, toggles closed and notifies when notifications open", () => {
    const h = mk();
    toggleToolbarMenu(h, "yil");
    expect(h.state.openToolbarMenu).toBe("yil");
    toggleToolbarMenu(h, "yil");
    expect(h.state.openToolbarMenu).toBeNull();
    toggleToolbarMenu(h, "notifications");
    expect(h.onNotificationsMenuOpened).toHaveBeenCalledTimes(1);
    expect(h.state.selectedIndexInfoKey).toBeNull();
  });
});

describe("year changes", () => {
  it("handleYilChange resets the hierarchy, picks latest NDVI date and refreshes", async () => {
    const h = mk({ state: { yil: "2023", viloyat: "A", ndviDateOptions: ["d1", "d2"] } });
    handleYilChange(h, { target: { value: "2024" } });
    await flush();
    expect(h.state).toMatchObject({ yil: "2024", viloyat: "", tuman: "", vh: "", ndviDate: "d2" });
    expect(h.applyMapFiltersOptimized).toHaveBeenCalledWith({ mode: "home", reason: "year" });
    expect(h.warmYearRegionMapImages).toHaveBeenCalled();
    expect(h.fetchDataWithCurrentState).toHaveBeenCalled();
    expect(h.broadcastFilterState).toHaveBeenCalled();
    expect(window.__AGRI3_DEBUG_YEAR__).toBe("2024");
  });

  it("handleYilChange reports errors and ignores unmounted hosts", async () => {
    const h = mk({ applyMapFiltersOptimized: jest.fn(() => Promise.reject(new Error("bad"))) });
    handleYilChange(h, { target: { value: "2022" } });
    await flush();
    expect(h.state.error).toBe("bad");
    expect(h.state.loading).toBe(false);
    expect(window.__AGRI3_DEBUG_YEAR__).toBe("");
    const off = mk({ _isMounted: false });
    handleYilChange(off, undefined as never);
    expect(off.setState).not.toHaveBeenCalled();
  });

  it("applyYil closes the menu for empty/same year, otherwise switches year", async () => {
    const h = mk({ state: { yil: "2024", openToolbarMenu: "yil" } });
    applyYil(h, "2024");
    expect(h.state.openToolbarMenu).toBeNull();
    expect(h.applyMapFiltersOptimized).not.toHaveBeenCalled();
    applyYil(h, "");
    expect(h.applyMapFiltersOptimized).not.toHaveBeenCalled();
    applyYil(h, "2025");
    await flush();
    expect(h.state.yil).toBe("2025");
    expect(h.state.ndviDate).toBe("");
    expect(h.applyMapFiltersOptimized).toHaveBeenCalledTimes(1);
    expect(h.broadcastFilterState).toHaveBeenCalled();
  });

  it("applyYil reports failures and is inert when unmounted", async () => {
    const h = mk({ fetchDataWithCurrentState: jest.fn(() => Promise.reject(new Error("f"))) });
    applyYil(h, "2025");
    await flush();
    expect(h.state.error).toBe("f");
    const off = mk({ _isMounted: false });
    applyYil(off, "2025");
    expect(off.setState).not.toHaveBeenCalled();
  });
});

describe("handleNdviDateChange", () => {
  it("clears VH and refreshes map and data", async () => {
    const h = mk({ state: { vh: "good" }, _ndviBucketToIds: { a: ["1"] } });
    handleNdviDateChange(h, { target: { value: " 2024-05-01 " } });
    await flush();
    expect(h.state.ndviDate).toBe("2024-05-01");
    expect(h.state.vh).toBe("");
    expect(h._ndviBucketToIds).toEqual({});
    expect(h.applyMapFiltersOptimized).toHaveBeenCalledWith({ mode: "selection", reason: "ndvi" });
    expect(h.broadcastFilterState).toHaveBeenCalled();
  });

  it("ignores manual date changes in polygon mode, and unmounted hosts", () => {
    const p = mk({ state: { polygonMode: true } });
    handleNdviDateChange(p, { target: { value: "x" } });
    expect(p.setState).not.toHaveBeenCalled();
    const off = mk({ _isMounted: false });
    handleNdviDateChange(off, { target: { value: "x" } });
    expect(off.setState).not.toHaveBeenCalled();
  });

  it("reports failures", async () => {
    const h = mk({ applyMapFiltersOptimized: jest.fn(() => Promise.reject(new Error("nd"))) });
    handleNdviDateChange(h, { target: { value: "x" } });
    await flush();
    expect(h.state.error).toBe("nd");
  });
});

describe("applyLanguage", () => {
  it("stores the language, notifies listeners and broadcasts", () => {
    const events: CustomEvent<{ lang: string }>[] = [];
    const listener = (e: Event): void => { events.push(e as CustomEvent<{ lang: string }>); };
    document.addEventListener("languageChanged", listener);
    try {
      const h = mk({ state: { language: "uz_lat", openToolbarMenu: "language" } });
      applyLanguage(h, "ru");
      expect(h.state.language).toBe("ru");
      expect(h.state.openToolbarMenu).toBeNull();
      expect(localStorage.getItem("app_lang")).toBe("ru");
      expect(localStorage.getItem("agri_app_lang")).toBe("ru");
      expect(h.broadcastFilterState).toHaveBeenCalled();
    } finally {
      document.removeEventListener("languageChanged", listener);
    }
    expect(events[0].detail.lang).toBe("ru");
  });

  it("ignores unchanged, empty and unmounted", () => {
    const h = mk({ state: { language: "uz_lat" } });
    applyLanguage(h, "uz_lat");
    applyLanguage(h, undefined as never);
    const off = mk({ _isMounted: false });
    applyLanguage(off, "ru");
    expect(h.setState).not.toHaveBeenCalled();
    expect(off.setState).not.toHaveBeenCalled();
  });

  it("survives localStorage failures", () => {
    const spy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    try {
      const h = mk({ state: { language: "uz_lat" } });
      expect(() => applyLanguage(h, "ru")).not.toThrow();
      expect(h.broadcastFilterState).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("syncChartDimOrder", () => {
  it("resets the order on geography change", () => {
    const h = mk({ _chartDimOrder: ["vh", "turi"] });
    syncChartDimOrder(h, "good", ["p"], true);
    expect(h._chartDimOrder).toEqual([]);
    expect(clearPieVhFilterUniqueIds).toHaveBeenCalled();
  });

  it("keeps first-selected-wins ordering of vh and turi", () => {
    const h = mk({ _chartDimOrder: [] });
    syncChartDimOrder(h, "", ["p"], false);
    expect(h._chartDimOrder).toEqual(["turi"]);
    syncChartDimOrder(h, "good", ["p"], false);
    expect(h._chartDimOrder).toEqual(["turi", "vh"]);
    syncChartDimOrder(h, "good", [], false);
    expect(h._chartDimOrder).toEqual(["vh"]);
  });
});
