jest.mock("../../../../../data/agri-filter-store", () => ({
  syncMasterFilterSnapshot: jest.fn(),
}));

import { syncMasterFilterSnapshot } from "../../../../../data/agri-filter-store";
import type { VHBarData } from "../../../../localization/vh-constants";
import { makeFakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import type { LocalizationWidgetProps } from "../host";
import { broadcastFilterState } from "./broadcast-service";

interface BroadcastDetail {
  filters: Record<string, unknown>;
  vhUniqueids: string[] | null;
  vhRegionChartUniqueids: string[] | null;
  vhBarData: VHBarData | null;
  vhBarDataPending: boolean;
  meta: { recordCount: number; whereClause: string };
}

const BAR: VHBarData = { items: [], total: 1 } as unknown as VHBarData;
const LAYER = { id: "fl" } as unknown as __esri.FeatureLayer;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
};

const broadcastHost = (init: FakeHostInit = {}): ReturnType<typeof makeFakeHost> =>
  makeFakeHost({
    getGeoScopedVhBarUsedDate: () => "",
    getLatestNdviDateForBar: () => "2025-06-01",
    normalizeTurlar: (raw: unknown) => (Array.isArray(raw) ? (raw as string[]) : []),
    buildWhereClause: () => "yil = 2025",
    makeVhBarComputeKey: () => "key",
    computeVhBarData: jest.fn(() => Promise.resolve(BAR)),
    ...init,
    state: { connectionStatus: "connected", yil: "2025", featureLayers: [LAYER], ...init.state },
  });

describe("broadcastFilterState", () => {
  let events: BroadcastDetail[];
  const listener = (e: Event): void => {
    events.push((e as CustomEvent<BroadcastDetail>).detail);
  };

  beforeEach(() => {
    events = [];
    jest.clearAllMocks();
    document.addEventListener("masterFilterChanged", listener);
  });
  afterEach(() => document.removeEventListener("masterFilterChanged", listener));

  test("does nothing when unmounted or disconnected", () => {
    broadcastFilterState(broadcastHost({ _isMounted: false }));
    broadcastFilterState(broadcastHost({ state: { connectionStatus: "idle" } }));
    expect(events).toHaveLength(0);
  });

  test("sends pending payload then attaches VH bar data", async () => {
    const host = broadcastHost({
      state: { viloyat: "Andijon", vh: "2-Yaxshi", turlar: ["Paxta"] },
      _vhMapUniqueIds: ["u1"],
    });
    broadcastFilterState(host);
    expect(events).toHaveLength(1);
    expect(events[0].vhBarDataPending).toBe(true);
    expect(events[0].filters).toMatchObject({
      yil: "2025",
      viloyat: "Andijon",
      ndviDate: "2025-06-01",
      barCategoryField: "status_2025_06_01",
      barCategoryValue: "yaxshi",
      turlar: ["Paxta"],
    });
    expect(events[0].vhUniqueids).toEqual(["u1"]);
    expect(events[0].meta.whereClause).toBe("yil = 2025");
    await flush();
    expect(events).toHaveLength(2);
    expect(events[1].vhBarData).toBe(BAR);
    expect(events[1].vhBarDataPending).toBe(false);
    expect(host._lastVhBarData).toBe(BAR);
    expect(jest.mocked(syncMasterFilterSnapshot)).toHaveBeenCalledTimes(2);
  });

  test("explicit locked NDVI date wins and uniqueid follows polygon mode", () => {
    const props = { config: { polygonStatusPrefix: "st_" } } as unknown as Partial<LocalizationWidgetProps>;
    const host = broadcastHost({
      props,
      state: { ndviDate: "2025-05-05", ndviDateLocked: true, polygonMode: true, selectedGraffUniqueid: "g1", selectedFarmerInn: " 9 " },
    });
    broadcastFilterState(host, { pendingOnly: true });
    expect(events[0].filters).toMatchObject({
      ndviDate: "2025-05-05",
      ndviDateLocked: true,
      barCategoryField: "st_2025_05_05",
      uniqueid: "g1",
      polygonMode: true,
      farmerInn: "9",
    });
    expect(jest.mocked(host.computeVhBarData)).not.toHaveBeenCalled();
  });

  test("reuses last VH data on VH-only toggles", () => {
    const host = broadcastHost({ _reuseVhBarDataOnNextBroadcast: true, _lastVhBarData: BAR });
    broadcastFilterState(host);
    expect(events).toHaveLength(1);
    expect(events[0].vhBarData).toBe(BAR);
    expect(host._reuseVhBarDataOnNextBroadcast).toBe(false);
  });

  test("uses memoized VH data without recomputing", () => {
    const host = broadcastHost();
    host._vhBarComputeMemo.set("key", BAR);
    broadcastFilterState(host);
    expect(events[0].vhBarData).toBe(BAR);
    expect(jest.mocked(host.computeVhBarData)).not.toHaveBeenCalled();
  });

  test("skips duplicate payloads", () => {
    const host = broadcastHost({ state: { featureLayers: [] } });
    broadcastFilterState(host);
    broadcastFilterState(host);
    expect(events).toHaveLength(1);
    expect(events[0].vhBarDataPending).toBe(false);
  });

  test("drops VH result when geography changed meanwhile", async () => {
    const host = broadcastHost();
    broadcastFilterState(host);
    host.state = { ...host.state, viloyat: "Other" };
    await flush();
    expect(events).toHaveLength(1);
  });

  test("drops VH result when compute key changed", async () => {
    let key = "a";
    const host = broadcastHost({ makeVhBarComputeKey: () => key });
    broadcastFilterState(host);
    key = "b";
    await flush();
    expect(events).toHaveLength(1);
  });

  test("empty or failed VH compute clears pending", async () => {
    const empty = broadcastHost({ computeVhBarData: () => Promise.resolve(null) });
    broadcastFilterState(empty);
    await flush();
    expect(events[1]).toMatchObject({ vhBarData: null, vhBarDataPending: false });

    events = [];
    const failing = broadcastHost({ computeVhBarData: () => Promise.reject(new Error("x")), state: { yil: "2024" } });
    broadcastFilterState(failing);
    await flush();
    expect(events[1]).toMatchObject({ vhBarData: null, vhBarDataPending: false });
  });

  test("stale broadcast generation is not sent", async () => {
    let rejectCompute: (e: Error) => void = () => undefined;
    const host = broadcastHost({
      computeVhBarData: () => new Promise<VHBarData | null>((_r, rej) => { rejectCompute = rej; }),
    });
    broadcastFilterState(host);
    host._broadcastGeneration += 1;
    rejectCompute(new Error("late"));
    await flush();
    expect(events).toHaveLength(1);
  });
});
