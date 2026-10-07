jest.mock("../../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationAvailableDates: jest.fn(() => Promise.resolve([])),
  queryVegetationUniqueIdsForStatus: jest.fn(() => Promise.resolve([])),
}));

import {
  queryVegetationAvailableDates,
  queryVegetationUniqueIdsForStatus,
} from "../../../../../../gis/agri-vegetation-data-source";
import {
  clearPieVhFilterUniqueIds,
  getPieVhFilterUniqueIds,
  setPieVhFilterUniqueIds,
} from "../../../../../../gis/agri-chart-filter-order";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import { resolveVhMapUniqueIds } from "./vh-bar-resolve";

const datesMock = jest.mocked(queryVegetationAvailableDates);
const idsMock = jest.mocked(queryVegetationUniqueIdsForStatus);

type IdQuery = Parameters<typeof queryVegetationUniqueIdsForStatus>[0];

const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

const resolveHost = (init: FakeHostInit = {}): FakeHost => {
  const host = makeFakeHost({
    _viloyatToRegion: { andijon: 1703 },
    _tumanToDistrict: { "region:1703|asaka": 17 },
    getGeoScopedVhBarUsedDate: () => "",
    getCropIdsForVhUniqueIdScope: () => [],
    resolveCropIdForTuri: () => undefined,
    broadcastFilterState: jest.fn(),
    resolveVhRegionChartUniqueIdsBackground: jest.fn(() => Promise.resolve()),
    _vhResolveGen: 0,
    ...init,
    state: { viloyat: "Andijon", vh: "2-Yaxshi", yil: "2025", ...init.state },
  });
  host.getGeoCodeHelpers = () => ({
    normalizeApos: host.normalizeApos,
    makeRegionDistrictKey: host.makeRegionDistrictKey,
  });
  host.setVhUniqueIdCacheEntry = (key: string, ids: string[]) => {
    host._vhUniqueIdCache[key] = ids;
  };
  return host;
};

describe("resolveVhMapUniqueIds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idsMock.mockResolvedValue([]);
    datesMock.mockResolvedValue([]);
    clearPieVhFilterUniqueIds();
  });

  test("no VH clears ids and returns null", async () => {
    setPieVhFilterUniqueIds(["x"]);
    const host = resolveHost({ state: { vh: "" }, _vhMapUniqueIds: ["a"] });
    await expect(resolveVhMapUniqueIds(host)).resolves.toBeNull();
    expect(host._vhMapUniqueIds).toBeNull();
    expect(getPieVhFilterUniqueIds()).toBeNull();
  });

  test("unknown category, unknown region or no dates resolve to []", async () => {
    await expect(resolveVhMapUniqueIds(resolveHost({ state: { vh: "9-Bad" } }))).resolves.toEqual([]);
    await expect(resolveVhMapUniqueIds(resolveHost({ state: { viloyat: "Nowhere" } }))).resolves.toEqual([]);
    const host = resolveHost();
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual([]);
    expect(datesMock).toHaveBeenCalledWith({ region: 1703, district: undefined });
    expect(host._vhRegionChartUniqueIds).toEqual([]);
  });

  test("walks newest year-scoped dates and publishes Pie ids when VH first", async () => {
    datesMock.mockResolvedValue(["2024-12-01", "2025-05-01", "2025-06-01"]);
    idsMock.mockImplementation(async (q: IdQuery) => (q.date === "2025-05-01" ? ["u1", "u2"] : []));
    const host = resolveHost({
      getChartFilterFlags: () => ({ filterPieByVh: true, filterVhBarByCrop: false }),
    });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["u1", "u2"]);
    expect(idsMock.mock.calls.map((c) => c[0].date)).toEqual(["2025-06-01", "2025-05-01"]);
    expect(host.state.ndviDateOptions).toEqual(["2024-12-01", "2025-05-01", "2025-06-01"]);
    expect(host._vhRegionChartUniqueIds).toEqual(["u1", "u2"]);
    expect(getPieVhFilterUniqueIds()).toEqual(["u1", "u2"]);
    expect(host._vhUniqueIdCache["yaxshi|2025-05-01|1703||"]).toEqual(["u1", "u2"]);
  });

  test("locked date is used alone and served from cache", async () => {
    const host = resolveHost({ state: { ndviDate: "2025-06-01", ndviDateLocked: true } });
    host._vhUniqueIdCache["yaxshi|2025-06-01|1703||"] = ["c1"];
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["c1"]);
    expect(idsMock).not.toHaveBeenCalled();
    expect(datesMock).not.toHaveBeenCalled();
  });

  test("empty bar date falls back to other known dates", async () => {
    idsMock.mockImplementation(async (q: IdQuery) => (q.date === "2025-04-01" ? ["late"] : []));
    const host = resolveHost({
      getGeoScopedVhBarUsedDate: () => "2025-06-01",
      state: { ndviDateOptions: ["2024-01-01", "2025-04-01", "2025-06-01"] },
    });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["late"]);
    expect(idsMock.mock.calls.map((c) => c[0].date)).toEqual(["2025-06-01", "2025-04-01"]);
  });

  test("crop-scoped empty result falls back to status-wide ids", async () => {
    idsMock.mockImplementation(async (q: IdQuery) => (q.cropIds ? [] : ["wide"]));
    const host = resolveHost({
      state: { ndviDateOptions: ["2025-06-01"] },
      getCropIdsForVhUniqueIdScope: () => ["7"],
      getChartFilterFlags: () => ({ filterPieByVh: false, filterVhBarByCrop: true }),
    });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["wide"]);
    expect(host._vhUniqueIdsCropScoped).toBe(false);
  });

  test("district scope uses parallel viloyat-wide fetch and rebroadcasts", async () => {
    let releaseRegion: (ids: string[]) => void = () => undefined;
    const regionIds = new Promise<string[]>((r) => { releaseRegion = r; });
    idsMock.mockImplementation((q: IdQuery) => (q.district === 17 ? Promise.resolve(["d1"]) : regionIds));
    const host = resolveHost({ state: { tuman: "Asaka", ndviDateOptions: ["2025-06-01"] } });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["d1"]);
    expect(host._vhRegionChartUniqueIds).toBeNull();
    releaseRegion(["v1", "v2"]);
    await flush();
    expect(host._vhRegionChartUniqueIds).toEqual(["v1", "v2"]);
    expect(host._reuseVhBarDataOnNextBroadcast).toBe(true);
    expect(jest.mocked(host.broadcastFilterState)).toHaveBeenCalled();
  });

  test("district scope uses cached viloyat-wide ids", async () => {
    idsMock.mockResolvedValue(["d1"]);
    const host = resolveHost({ state: { tuman: "Asaka", ndviDateOptions: ["2025-06-01"] } });
    host._vhUniqueIdCache["yaxshi|2025-06-01|1703||"] = ["cachedRegion"];
    await resolveVhMapUniqueIds(host);
    expect(host._vhRegionChartUniqueIds).toEqual(["cachedRegion"]);
  });

  test("district scope defers to background resolve when dates differ", async () => {
    idsMock.mockImplementation(async (q: IdQuery) => (q.district === 17 && q.date === "2025-05-01" ? ["d1"] : []));
    const host = resolveHost({ state: { tuman: "Asaka", ndviDateOptions: ["2025-05-01", "2025-06-01"] } });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["d1"]);
    expect(host._vhRegionChartUniqueIds).toBeNull();
    expect(jest.mocked(host.resolveVhRegionChartUniqueIdsBackground)).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: "yaxshi", regionNum: 1703, ndviDate: "2025-05-01" }),
      undefined,
    );
  });

  test("parallel viloyat fetch failure sets empty region ids", async () => {
    let failRegion: (e: Error) => void = () => undefined;
    const regionIds = new Promise<string[]>((_r, rej) => { failRegion = rej; });
    idsMock.mockImplementation((q: IdQuery) => (q.district === undefined ? regionIds : Promise.resolve(["d1"])));
    const host = resolveHost({ state: { tuman: "Asaka", ndviDateOptions: ["2025-06-01"] } });
    await resolveVhMapUniqueIds(host);
    failRegion(new Error("region failed"));
    await flush();
    expect(host._vhRegionChartUniqueIds).toEqual([]);
    expect(jest.mocked(host.broadcastFilterState)).toHaveBeenCalled();
  });

  test("Pie gets crop-unscoped ids in a deferred fetch", async () => {
    idsMock.mockImplementation(async (q: IdQuery) => (q.cropIds ? ["crop"] : ["all"]));
    const host = resolveHost({
      state: { ndviDateOptions: ["2025-06-01"] },
      getSelectedTurlar: () => ["Paxta"],
      resolveCropIdForTuri: () => "7",
      getCropIdsForVhUniqueIdScope: () => ["7"],
      getChartFilterFlags: () => ({ filterPieByVh: true, filterVhBarByCrop: true }),
    });
    await expect(resolveVhMapUniqueIds(host)).resolves.toEqual(["crop"]);
    await flush();
    expect(getPieVhFilterUniqueIds()).toEqual(["all"]);
    expect(jest.mocked(host.broadcastFilterState)).toHaveBeenCalled();
  });

  test("query failure resets ids; stale resolve keeps previous", async () => {
    idsMock.mockRejectedValue(new Error("down"));
    const failing = resolveHost({ state: { ndviDateOptions: ["2025-06-01"] } });
    await expect(resolveVhMapUniqueIds(failing)).resolves.toEqual([]);
    expect(failing._vhMapUniqueIds).toEqual([]);

    idsMock.mockResolvedValue(["new"]);
    const stale = resolveHost({ state: { ndviDateOptions: ["2025-06-01"] }, _vhMapUniqueIds: ["prev"] });
    await expect(resolveVhMapUniqueIds(stale, () => false)).resolves.toEqual(["prev"]);
    expect(stale._vhMapUniqueIds).toEqual(["prev"]);
  });
});
