const scheduleMock = jest.fn();
const logMock = jest.fn();

jest.mock("../controller/agri-dashboard-orchestrator", () => ({
  scheduleDashboardOrchestrator: (detail: Record<string, unknown>): void => scheduleMock(detail),
}));
jest.mock("../gis/agri-debug-log", () => ({
  agroV5Log: (tag: string, payload: unknown): void => logMock(tag, payload),
}));

import {
  bootstrapMasterFilterSync,
  clearMasterFilterSnapshot,
  getMasterFilterSnapshot,
  subscribeMasterFilter,
  syncMasterFilterSnapshot,
} from "./agri-filter-store";
import { bindMasterFilter, subscribeMasterFilterDetail } from "./agri-filter-bus";
import { normalizeTurlarListSql } from "./agri-turlar";

beforeEach(() => {
  clearMasterFilterSnapshot();
  scheduleMock.mockClear();
  logMock.mockClear();
});

describe("agri-filter-store", () => {
  test("ignores null / non-object snapshots", () => {
    syncMasterFilterSnapshot(null);
    syncMasterFilterSnapshot(undefined);
    syncMasterFilterSnapshot("x" as unknown as Record<string, unknown>);
    expect(getMasterFilterSnapshot()).toBeNull();
    expect(scheduleMock).not.toHaveBeenCalled();
  });

  test("stores snapshot, schedules orchestrator and notifies listeners", () => {
    const listener = jest.fn();
    const unsub = subscribeMasterFilter(listener);
    const detail = { yil: "2024" };
    syncMasterFilterSnapshot(detail);
    expect(getMasterFilterSnapshot()).toBe(detail);
    expect(scheduleMock).toHaveBeenCalledWith(detail);
    expect(listener).toHaveBeenCalledWith(detail);

    unsub();
    syncMasterFilterSnapshot({ yil: "2025" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("a throwing listener is logged and does not block siblings", () => {
    const bad = subscribeMasterFilter(() => {
      throw new Error("boom");
    });
    const good = jest.fn();
    const unsubGood = subscribeMasterFilter(good);
    syncMasterFilterSnapshot({ a: 1 });
    expect(good).toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith("masterFilter:listener-error", { error: "boom" });
    bad();
    unsubGood();
  });

  test("bootstrapMasterFilterSync replays snapshot when present", () => {
    syncMasterFilterSnapshot({ viloyat: "A" });
    const handler = jest.fn();
    bootstrapMasterFilterSync(handler);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("masterFilterChanged");
    expect(event.detail).toEqual({ viloyat: "A" });
  });

  test("bootstrapMasterFilterSync requests state when no snapshot", () => {
    const requested = jest.fn();
    document.addEventListener("requestMasterFilterState", requested);
    const handler = jest.fn();
    bootstrapMasterFilterSync(handler);
    expect(handler).not.toHaveBeenCalled();
    expect(requested).toHaveBeenCalledTimes(1);
    document.removeEventListener("requestMasterFilterState", requested);
  });
});

describe("agri-filter-bus", () => {
  test("bindMasterFilter replays snapshot then forwards updates as events", () => {
    syncMasterFilterSnapshot({ yil: "2023" });
    const handler = jest.fn();
    const unsub = bindMasterFilter(handler);
    syncMasterFilterSnapshot({ yil: "2024" });
    unsub();
    syncMasterFilterSnapshot({ yil: "2025" });

    const details = handler.mock.calls.map((c) => (c[0] as CustomEvent).detail);
    expect(details).toEqual([{ yil: "2023" }, { yil: "2024" }]);
  });

  test("bindMasterFilter requests state when nothing is cached", () => {
    const requested = jest.fn();
    document.addEventListener("requestMasterFilterState", requested);
    const unsub = bindMasterFilter(jest.fn());
    expect(requested).toHaveBeenCalledTimes(1);
    document.removeEventListener("requestMasterFilterState", requested);
    unsub();
  });

  test("subscribeMasterFilterDetail delivers raw detail", () => {
    const handler = jest.fn();
    const unsub = subscribeMasterFilterDetail(handler);
    syncMasterFilterSnapshot({ tuman: "B" });
    expect(handler).toHaveBeenCalledWith({ tuman: "B" });
    unsub();
  });
});

describe("normalizeTurlarListSql", () => {
  test("array input is normalized and deduped", () => {
    expect(normalizeTurlarListSql(["Bug’doy", "Bug'doy", "", "Paxta"])).toEqual([
      "Bug'doy",
      "Paxta",
    ]);
  });

  test("single value and fallback", () => {
    expect(normalizeTurlarListSql("Paxta")).toEqual(["Paxta"]);
    expect(normalizeTurlarListSql(null, "Sholi")).toEqual(["Sholi"]);
    expect(normalizeTurlarListSql(undefined)).toEqual([]);
  });
});
