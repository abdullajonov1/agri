jest.mock("../../../../../data/agri-filter-store", () => ({
  getMasterFilterSnapshot: jest.fn(() => null),
}));

import { getMasterFilterSnapshot } from "../../../../../data/agri-filter-store";
import { makeFakeHost } from "../__test-utils__/fake-host";
import type { AgriMapLayer } from "../../../../localization/agri-map-layer";
import type { LocalizationWidgetProps } from "../host";
import {
  buildCropUniqueValueInfosFromValues,
  buildTableDateWhere,
  buildYearClauseForLayer,
  cropDistinctCacheKey,
  eqAposSmart,
  findLayerFieldName,
  getAposHelpers,
  getChartFilterFlags,
  getCropIdsForVhUniqueIdScope,
  getEffectiveViloyat,
  getGeoCodeHelpers,
  getMapWidgetId,
  handleRequestMasterFilterState,
  makeVhBarDateGeoKey,
  schedulePolygonFilterGuards,
} from "./panel-helpers";

const snapshotMock = jest.mocked(getMasterFilterSnapshot);

const layerWithFields = (names: string[]): AgriMapLayer =>
  ({ id: "L1", url: "https://x/FeatureServer/0", fields: names.map((name) => ({ name })) }) as unknown as AgriMapLayer;

describe("panel-helpers", () => {
  test("getEffectiveViloyat prefers lockedViloyat", () => {
    expect(getEffectiveViloyat(makeFakeHost({ state: { viloyat: " A ", lockedViloyat: "B" } }))).toBe("B");
    expect(getEffectiveViloyat(makeFakeHost({ state: { viloyat: " A " } }))).toBe("A");
    expect(getEffectiveViloyat(makeFakeHost())).toBe("");
  });

  test("findLayerFieldName matches case-insensitively", () => {
    const host = makeFakeHost();
    expect(findLayerFieldName(host, layerWithFields(["TURI", "yil"]), "turi")).toBe("TURI");
    expect(findLayerFieldName(host, layerWithFields(["yil"]), "turi")).toBeNull();
  });

  test("cropDistinctCacheKey includes field and where", () => {
    const key = cropDistinctCacheKey(makeFakeHost(), layerWithFields([]), "turi", "a=1");
    expect(key).toContain("turi");
    expect(key).toContain("a=1");
  });

  test("buildCropUniqueValueInfosFromValues returns one info per value", () => {
    const infos = buildCropUniqueValueInfosFromValues(makeFakeHost(), "turi", ["Paxta", "Bug'doy"]);
    expect(infos.map((i) => i.value)).toEqual(expect.arrayContaining(["Paxta", "Bug'doy"]));
  });

  test("buildYearClauseForLayer returns 1=0 without year", () => {
    const layer = { fields: [{ name: "yil" }] } as unknown as __esri.FeatureLayer;
    expect(buildYearClauseForLayer(makeFakeHost(), layer)).toBe("1=0");
    expect(buildYearClauseForLayer(makeFakeHost({ state: { yil: "2025" } }), layer)).toContain("2025");
  });

  describe("handleRequestMasterFilterState", () => {
    test("dispatches snapshot, else last broadcast detail", () => {
      const listener = jest.fn();
      document.addEventListener("masterFilterChanged", listener);
      snapshotMock.mockReturnValueOnce({ from: "snapshot" });
      handleRequestMasterFilterState(makeFakeHost());
      handleRequestMasterFilterState(makeFakeHost({ _lastBroadcastDetail: { from: "last" } }));
      const details = listener.mock.calls.map((c) => (c[0] as CustomEvent).detail);
      expect(details).toEqual([{ from: "snapshot" }, { from: "last" }]);
      document.removeEventListener("masterFilterChanged", listener);
    });

    test("does nothing when unmounted or without detail", () => {
      const listener = jest.fn();
      document.addEventListener("masterFilterChanged", listener);
      handleRequestMasterFilterState(makeFakeHost({ _isMounted: false, _lastBroadcastDetail: { a: 1 } }));
      handleRequestMasterFilterState(makeFakeHost());
      expect(listener).not.toHaveBeenCalled();
      document.removeEventListener("masterFilterChanged", listener);
    });
  });

  test("getMapWidgetId returns first id or null", () => {
    const props = { useMapWidgetIds: ["map_1", "map_2"] } as unknown as Partial<LocalizationWidgetProps>;
    expect(getMapWidgetId(makeFakeHost({ props }))).toBe("map_1");
    expect(getMapWidgetId(makeFakeHost())).toBeNull();
  });

  test("schedulePolygonFilterGuards schedules three reasserts", () => {
    jest.useFakeTimers();
    const reassert = jest.fn();
    const clear = jest.fn();
    const host = makeFakeHost({ reassertPolygonGeographyFilter: reassert, clearPolygonFilterGuards: clear });
    schedulePolygonFilterGuards(host);
    expect(clear).toHaveBeenCalled();
    expect(host._polygonFilterGuardTimers).toHaveLength(3);
    jest.advanceTimersByTime(1000);
    expect(reassert.mock.calls.map((c) => c[0])).toEqual(["after-0ms", "after-300ms", "after-900ms"]);
    jest.useRealTimers();
  });

  test("eqAposSmart returns empty for empty input and a predicate otherwise", () => {
    const host = makeFakeHost();
    expect(eqAposSmart(host, "tuman", "")).toBe("");
    expect(eqAposSmart(host, "tuman", "Qo'qon")).toContain("tuman");
  });

  test("apos and geo-code helper bags delegate to host", () => {
    const eq = jest.fn(() => "eq");
    const host = makeFakeHost({ eqAposSmart: eq });
    const apos = getAposHelpers(host);
    expect(apos.normalizeApos(" x ")).toBe("x");
    expect(apos.makeRegionDistrictKey(" AB ")).toBe("ab");
    expect(apos.eqAposSmart("f", "v")).toBe("eq");
    const geo = getGeoCodeHelpers(host);
    expect(geo.normalizeApos(" y ")).toBe("y");
    expect(geo.makeRegionDistrictKey("Q")).toBe("q");
  });

  test("getChartFilterFlags derives flags from selection order", () => {
    const host = makeFakeHost({ _chartDimOrder: ["vh", "turi"], state: { vh: "2-Yaxshi" } });
    const flags = getChartFilterFlags(host, "2-Yaxshi", ["Paxta"]);
    expect(flags.filterPieByVh).toBe(true);
    expect(flags.filterVhBarByCrop).toBe(false);
    const noSelection = getChartFilterFlags(makeFakeHost(), "", []);
    expect(noSelection).toEqual({ filterPieByVh: false, filterVhBarByCrop: false });
  });

  test("getCropIdsForVhUniqueIdScope only scopes when crop came first", () => {
    const resolve = (t: string): string | undefined => ({ Paxta: "1", "Bug'doy": "2" })[t];
    const notScoped = makeFakeHost({ getSelectedTurlar: () => ["Paxta"], resolveCropIdForTuri: resolve });
    expect(getCropIdsForVhUniqueIdScope(notScoped)).toEqual([]);
    const scoped = makeFakeHost({
      getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
      getSelectedTurlar: () => ["Paxta", "Paxta", "Bug'doy", "Unknown"],
      resolveCropIdForTuri: resolve,
    });
    expect(getCropIdsForVhUniqueIdScope(scoped)).toEqual(["1", "2"]);
  });

  test("buildTableDateWhere accepts exact YMD only", () => {
    const host = makeFakeHost();
    expect(buildTableDateWhere(host, "date", "2025-06-01")).toBe("date = '2025-06-01'");
    expect(buildTableDateWhere(host, "date", "June")).toBeNull();
    expect(buildTableDateWhere(host, "", "2025-06-01")).toBeNull();
  });

  test("makeVhBarDateGeoKey joins viloyat and tuman keys", () => {
    expect(makeVhBarDateGeoKey(makeFakeHost({ state: { viloyat: "A", tuman: "B" } }))).toBe("a|b");
    expect(makeVhBarDateGeoKey(makeFakeHost({ state: { viloyat: "A", lockedViloyat: "Z" } }))).toBe("z|");
  });
});
