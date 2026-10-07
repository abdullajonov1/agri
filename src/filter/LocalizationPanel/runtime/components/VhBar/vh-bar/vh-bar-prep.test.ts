jest.mock("../../../../../localization/vh-bar-compute", () => ({
  executeVhBarCompute: jest.fn(),
}));
jest.mock("../../../../../../data/agri-filter-store", () => ({
  syncMasterFilterSnapshot: jest.fn(),
}));
jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationUniqueIdsForStatus: jest.fn(() => Promise.resolve(["u1"])),
}));

import { executeVhBarCompute } from "../../../../../localization/vh-bar-compute";
import { syncMasterFilterSnapshot } from "../../../../../../data/agri-filter-store";
import { queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";
import type { VHBarData } from "../../../../../localization/vh-constants";
import { makeFakeHost } from "../../__test-utils__/fake-host";
import type { LocalizationWidgetProps } from "../../host";
import {
  VH_UNIQUEID_CACHE_MAX,
  buildVhMapUniqueIdCacheKey,
  computeVhBarData,
  executeComputeVhBarData,
  getGeoScopedVhBarUsedDate,
  getLatestNdviDateForBar,
  isVhMapUniqueIdCacheWarm,
  makeVhBarComputeKey,
  prefetchVhStatusUniqueIds,
  publishVhBarPartial,
  setVhUniqueIdCacheEntry,
} from "./vh-bar-prep";

const computeMock = jest.mocked(executeVhBarCompute);
const queryIdsMock = jest.mocked(queryVegetationUniqueIdsForStatus);
const BAR: VHBarData = { items: [], total: 0 } as unknown as VHBarData;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

describe("vh-bar-prep", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getLatestNdviDateForBar", () => {
    test("uses selected date, then last option, then sorted map keys", () => {
      expect(getLatestNdviDateForBar(makeFakeHost({ state: { ndviDate: " 2025-06-02 " } }))).toBe("2025-06-02");
      expect(getLatestNdviDateForBar(makeFakeHost({ state: { ndviDateOptions: ["a", "b"] } }))).toBe("b");
      const host = makeFakeHost({ _ndviDateFieldMap: { "2025-07-01": "x", "2025-05-01": "y" } });
      expect(getLatestNdviDateForBar(host)).toBe("2025-07-01");
      const nonDates = makeFakeHost({ _ndviDateFieldMap: { beta: "x", alpha: "y" } });
      expect(getLatestNdviDateForBar(nonDates)).toBe("beta");
    });

    test("derives dates from status_ fields with configured prefix", () => {
      const layer = {
        fields: [{ name: "status_2025_05_01" }, { name: "STATUS_20250610" }, { name: "turi" }],
      } as unknown as __esri.FeatureLayer;
      expect(getLatestNdviDateForBar(makeFakeHost(), layer)).toBe("2025-06-10");
      const props = { config: { polygonStatusPrefix: "st_" } } as unknown as Partial<LocalizationWidgetProps>;
      const custom = { fields: [{ name: "st_x_y" }] } as unknown as __esri.FeatureLayer;
      expect(getLatestNdviDateForBar(makeFakeHost({ props }), custom)).toBe("x-y");
    });

    // Fixed bug: the sort comparator falls back to localeCompare whenever one side
    // is not a parseable date, so a stray non-date `status_*` field (label
    // "abc") sorts after real dates and is returned as the "latest" NDVI date.
    test("ignores non-date status_* fields when picking the latest date", () => {
      const layer = {
        fields: [{ name: "status_2025_05_01" }, { name: "status_20250610" }, { name: "status_abc" }],
      } as unknown as __esri.FeatureLayer;
      expect(getLatestNdviDateForBar(makeFakeHost(), layer)).toBe("2025-06-10");
    });

    test("returns null without any source", () => {
      expect(getLatestNdviDateForBar(makeFakeHost())).toBeNull();
      expect(getLatestNdviDateForBar(makeFakeHost(), { fields: [{ name: "turi" }] } as unknown as __esri.FeatureLayer)).toBeNull();
    });
  });

  describe("computeVhBarData", () => {
    test("returns memoized data without computing", async () => {
      const exec = jest.fn();
      const host = makeFakeHost({ makeVhBarComputeKey: () => "k", executeComputeVhBarData: exec });
      host._vhBarComputeMemo.set("k", BAR);
      await expect(computeVhBarData(host)).resolves.toBe(BAR);
      expect(exec).not.toHaveBeenCalled();
    });

    test("single-flights, memoizes and caps the memo", async () => {
      const exec = jest.fn(() => Promise.resolve(BAR));
      const host = makeFakeHost({ makeVhBarComputeKey: () => "new", executeComputeVhBarData: exec });
      for (let i = 0; i < 8; i += 1) host._vhBarComputeMemo.set(`old${i}`, BAR);
      const a = computeVhBarData(host);
      const b = computeVhBarData(host);
      expect(exec).toHaveBeenCalledTimes(1);
      expect(host._lastVhBarComputeKey).toBe("new");
      await expect(a).resolves.toBe(BAR);
      await b;
      expect(host._vhBarComputeMemo.has("new")).toBe(true);
      expect(host._vhBarComputeMemo.has("old0")).toBe(false);
      expect(host._vhBarComputeMemo.size).toBe(8);
      expect(host._vhBarComputeInFlight.size).toBe(0);
    });

    test("does not memoize null results", async () => {
      const host = makeFakeHost({ makeVhBarComputeKey: () => "k", executeComputeVhBarData: () => Promise.resolve(null) });
      await expect(computeVhBarData(host)).resolves.toBeNull();
      expect(host._vhBarComputeMemo.size).toBe(0);
    });
  });

  test("makeVhBarComputeKey includes turlar only when crop scopes the bar", () => {
    const base = { yil: "2025", viloyat: "A", tuman: "T" };
    const plain = makeFakeHost({ state: base, getSelectedTurlar: () => ["Paxta"] });
    const parsed = JSON.parse(makeVhBarComputeKey(plain)) as { turlar: string[]; tuman: string };
    expect(parsed.turlar).toEqual([]);
    expect(parsed.tuman).toBe("T");
    const scoped = makeFakeHost({
      state: { yil: "2025", tuman: "T" },
      getSelectedTurlar: () => ["Paxta"],
      getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
    });
    const scopedParsed = JSON.parse(makeVhBarComputeKey(scoped)) as { turlar: string[]; tuman: string };
    expect(scopedParsed.turlar).toEqual(["Paxta"]);
    expect(scopedParsed.tuman).toBe("");
  });

  test("executeComputeVhBarData wires host callbacks into the compute", async () => {
    computeMock.mockResolvedValue(BAR);
    const prefetch = jest.fn();
    const host = makeFakeHost({
      state: { viloyat: "A", selectedFarmerInn: "123" },
      _farmerMapUniqueIds: ["f1"],
      makeVhBarDateGeoKey: () => "a|",
      prefetchVhStatusUniqueIds: prefetch,
      resolveCropIdForTuri: () => "9",
    });
    await expect(executeComputeVhBarData(host)).resolves.toBe(BAR);
    const args = computeMock.mock.calls[0][0];
    expect(args.farmerUniqueIds).toEqual(["f1"]);
    expect(args.isMounted()).toBe(true);
    args.setVhBarUsedDate("2025-06-01");
    expect(host._vhBarUsedDate).toBe("2025-06-01");
    expect(host._vhBarUsedDateGeo).toBe("a|");
    args.setVhBarUsedDate(null);
    expect(host._vhBarUsedDateGeo).toBeNull();
    expect(args.getVhBarUsedDate()).toBeNull();
    args.prefetchVhStatusUniqueIds("d");
    expect(prefetch).toHaveBeenCalledWith("d");
    args.setState({ ndviDate: "2025-06-02" });
    expect(host.state.ndviDate).toBe("2025-06-02");
    expect(args.resolveCropIdForTuri("x")).toBe("9");
    expect(args.makeRegionDistrictKey("Q")).toBe("q");
    expect(args.getSelectedTurlar()).toEqual([]);
    expect(args.getChartFilterFlags().filterPieByVh).toBe(false);
    args.log("phase", {});
  });

  test("executeComputeVhBarData omits farmer ids without STIR", async () => {
    computeMock.mockResolvedValue(null);
    const host = makeFakeHost({ _farmerMapUniqueIds: ["f1"], makeVhBarDateGeoKey: () => "" });
    await executeComputeVhBarData(host);
    expect(computeMock.mock.calls[0][0].farmerUniqueIds).toBeNull();
  });

  describe("publishVhBarPartial", () => {
    test("dispatches a pending update for the current compute key", () => {
      const listener = jest.fn();
      document.addEventListener("masterFilterChanged", listener);
      const host = makeFakeHost({
        _lastBroadcastDetail: { filters: {} },
        _lastBroadcastDigest: "old",
        _lastVhBarComputeKey: "k",
        makeVhBarComputeKey: () => "k",
      });
      publishVhBarPartial(host, BAR);
      expect(host._lastBroadcastDigest).toBe("");
      expect(host._lastBroadcastDetail).toEqual({ filters: {}, vhBarData: BAR, vhBarDataPending: true });
      expect(jest.mocked(syncMasterFilterSnapshot)).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledTimes(1);
      document.removeEventListener("masterFilterChanged", listener);
    });

    test("skips when key changed, unmounted or no prior detail", () => {
      const listener = jest.fn();
      document.addEventListener("masterFilterChanged", listener);
      publishVhBarPartial(makeFakeHost({ _lastBroadcastDetail: {}, _lastVhBarComputeKey: "a", makeVhBarComputeKey: () => "b" }), BAR);
      publishVhBarPartial(makeFakeHost({ _isMounted: false, _lastBroadcastDetail: {} }), BAR);
      publishVhBarPartial(makeFakeHost(), BAR);
      expect(listener).not.toHaveBeenCalled();
      document.removeEventListener("masterFilterChanged", listener);
    });
  });

  test("getGeoScopedVhBarUsedDate only trusts the same geography", () => {
    const host = makeFakeHost({ _vhBarUsedDate: "2025-06-01", _vhBarUsedDateGeo: "a|", makeVhBarDateGeoKey: () => "a|" });
    expect(getGeoScopedVhBarUsedDate(host)).toBe("2025-06-01");
    host._vhBarUsedDateGeo = "b|";
    expect(getGeoScopedVhBarUsedDate(host)).toBe("");
    expect(getGeoScopedVhBarUsedDate(makeFakeHost({ makeVhBarDateGeoKey: () => "" }))).toBe("");
  });

  test("setVhUniqueIdCacheEntry ignores empty keys and caps size", () => {
    const host = makeFakeHost();
    setVhUniqueIdCacheEntry(host, "", ["x"]);
    expect(Object.keys(host._vhUniqueIdCache)).toHaveLength(0);
    for (let i = 0; i <= VH_UNIQUEID_CACHE_MAX; i += 1) {
      setVhUniqueIdCacheEntry(host, `k${i}`, [String(i)]);
    }
    const keys = Object.keys(host._vhUniqueIdCache);
    expect(keys).toHaveLength(VH_UNIQUEID_CACHE_MAX);
    expect(keys).not.toContain("k0");
    expect(host._vhUniqueIdCache[`k${VH_UNIQUEID_CACHE_MAX}`]).toEqual([String(VH_UNIQUEID_CACHE_MAX)]);
  });

  describe("buildVhMapUniqueIdCacheKey", () => {
    const geoHost = (state: Parameters<typeof makeFakeHost>[0]["state"]): ReturnType<typeof makeFakeHost> => {
      const host = makeFakeHost({
        state,
        _viloyatToRegion: { andijon: 1703 },
        _tumanToDistrict: { "region:1703|asaka": 1703203 },
        getGeoScopedVhBarUsedDate: () => "",
        getCropIdsForVhUniqueIdScope: () => ["5", "2"],
      });
      host.getGeoCodeHelpers = () => ({
        normalizeApos: host.normalizeApos,
        makeRegionDistrictKey: host.makeRegionDistrictKey,
      });
      return host;
    };

    test("builds status|date|region|district|crops", () => {
      const host = geoHost({ vh: "2-Yaxshi", ndviDate: "2025-06-01", viloyat: "Andijon", tuman: "Asaka" });
      expect(buildVhMapUniqueIdCacheKey(host)).toBe("yaxshi|2025-06-01|1703|1703203|2,5");
    });

    test("returns null when status, date or region is missing", () => {
      expect(buildVhMapUniqueIdCacheKey(geoHost({ vh: "", ndviDate: "d", viloyat: "Andijon" }))).toBeNull();
      expect(buildVhMapUniqueIdCacheKey(geoHost({ vh: "4-Past", viloyat: "Andijon" }))).toBeNull();
      expect(buildVhMapUniqueIdCacheKey(geoHost({ vh: "4-Past", ndviDate: "d", viloyat: "Nowhere" }))).toBeNull();
    });

    test("isVhMapUniqueIdCacheWarm checks the cache", () => {
      const host = makeFakeHost({ buildVhMapUniqueIdCacheKey: () => "k" });
      expect(isVhMapUniqueIdCacheWarm(host)).toBe(false);
      host._vhUniqueIdCache.k = [];
      expect(isVhMapUniqueIdCacheWarm(host)).toBe(true);
      expect(isVhMapUniqueIdCacheWarm(makeFakeHost({ buildVhMapUniqueIdCacheKey: () => null }))).toBe(false);
    });
  });

  describe("prefetchVhStatusUniqueIds", () => {
    const prefetchHost = (state: Parameters<typeof makeFakeHost>[0]["state"]): ReturnType<typeof makeFakeHost> => {
      const setEntry = jest.fn();
      const host = makeFakeHost({
        state,
        _viloyatToRegion: { andijon: 1703 },
        _tumanToDistrict: { "region:1703|asaka": 17 },
        getCropIdsForVhUniqueIdScope: () => [],
        setVhUniqueIdCacheEntry: setEntry,
      });
      host.getGeoCodeHelpers = () => ({
        normalizeApos: host.normalizeApos,
        makeRegionDistrictKey: host.makeRegionDistrictKey,
      });
      return host;
    };

    test("queries every status for district and viloyat scope", async () => {
      const host = prefetchHost({ vh: "2-Yaxshi", viloyat: "Andijon", tuman: "Asaka" });
      host._vhUniqueIdCache["yaxshi|2025-06-01|1703|17|"] = ["cached"];
      prefetchVhStatusUniqueIds(host, "2025-06-01");
      expect(queryIdsMock).toHaveBeenCalledTimes(7);
      await flush();
      expect(jest.mocked(host.setVhUniqueIdCacheEntry)).toHaveBeenCalledWith("juda_yaxshi|2025-06-01|1703|17|", ["u1"]);
    });

    test("skips without date, VH, region or mount", () => {
      prefetchVhStatusUniqueIds(prefetchHost({ vh: "2-Yaxshi", viloyat: "Andijon" }), " ");
      prefetchVhStatusUniqueIds(prefetchHost({ viloyat: "Andijon" }), "d");
      prefetchVhStatusUniqueIds(prefetchHost({ vh: "2-Yaxshi", viloyat: "X" }), "d");
      const unmounted = prefetchHost({ vh: "2-Yaxshi", viloyat: "Andijon" });
      unmounted._isMounted = false;
      prefetchVhStatusUniqueIds(unmounted, "d");
      expect(queryIdsMock).not.toHaveBeenCalled();
    });

    test("viloyat-only scope and swallowed failures", async () => {
      queryIdsMock.mockRejectedValue(new Error("x"));
      const host = prefetchHost({ vh: "2-Yaxshi", viloyat: "Andijon" });
      prefetchVhStatusUniqueIds(host, "d");
      expect(queryIdsMock).toHaveBeenCalledTimes(4);
      await flush();
      expect(jest.mocked(host.setVhUniqueIdCacheEntry)).not.toHaveBeenCalled();
    });
  });
});
