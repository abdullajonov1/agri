jest.mock("../gis/agri-debug-log", () => ({
  agroV5Log: jest.fn(),
}));

import { agroV5Log } from "../gis/agri-debug-log";
import { emptyDashboardPack, type DashboardPack } from "../types/dashboard-pack";
import {
  dashboardPackPersistId,
  getDashboardPack,
  getPersistedDashboardPack,
  patchDashboardPack,
  resetDashboardPackStore,
  setDashboardPack,
  subscribeDashboardPack,
  waitForDashboardPackReady,
} from "./agri-dashboard-store";

const readyPack = (key: string, yil = "2025"): DashboardPack =>
  emptyDashboardPack({
    phase: "ready",
    key,
    filter: { ...emptyDashboardPack().filter, yil },
  });

describe("agri-dashboard-store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDashboardPackStore();
    jest.useRealTimers();
  });

  test("starts idle", () => {
    expect(getDashboardPack().phase).toBe("idle");
  });

  test("dashboardPackPersistId is stable and short", () => {
    const id = dashboardPackPersistId('{"yil":"2025"}');
    expect(id).toBe(dashboardPackPersistId('{"yil":"2025"}'));
    expect(id).toMatch(/^k_[0-9a-f]+$/);
    expect(id).not.toBe(dashboardPackPersistId('{"yil":"2024"}'));
  });

  test("ready packs persist per key and come back by exact key", () => {
    setDashboardPack(readyPack("key-a"));
    setDashboardPack(readyPack("key-b"));
    expect(getPersistedDashboardPack("key-a")?.key).toBe("key-a");
    expect(getPersistedDashboardPack("key-b")?.key).toBe("key-b");
    expect(getPersistedDashboardPack("key-c")).toBeNull();
  });

  test("ready packs without a year are not persisted", () => {
    setDashboardPack(readyPack("no-year", ""));
    expect(getPersistedDashboardPack("no-year")).toBeNull();
  });

  test("persisted packs drop the panel-owned polygon slice", () => {
    setDashboardPack({
      ...readyPack("poly"),
      graffPolygon: {
        scopeKey: "s",
        uniqueid: "u",
        regionId: 1,
        year: 2025,
        rows: [],
      },
    });
    expect(getPersistedDashboardPack("poly")?.graffPolygon).toBeNull();
  });

  test("patch merges into the current pack and notifies listeners", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDashboardPack(listener);
    const next = patchDashboardPack({ phase: "loading-stats", key: "k" });
    expect(next.phase).toBe("loading-stats");
    expect(listener).toHaveBeenCalledWith(next);
    unsubscribe();
    patchDashboardPack({ phase: "error" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("a throwing listener is logged and does not stop siblings", () => {
    const sibling = jest.fn();
    subscribeDashboardPack(() => {
      throw new Error("panel crash");
    });
    subscribeDashboardPack(sibling);
    patchDashboardPack({ phase: "loading-stats" });
    expect(sibling).toHaveBeenCalled();
    expect(agroV5Log).toHaveBeenCalledWith(
      "dashboardPack:listener-error",
      expect.objectContaining({ error: "panel crash" }),
    );
  });

  test("waitForDashboardPackReady resolves at once for terminal phases", async () => {
    patchDashboardPack({ phase: "error" });
    await expect(waitForDashboardPackReady()).resolves.toMatchObject({
      phase: "error",
    });
  });

  test("waitForDashboardPackReady resolves when the pack becomes ready", async () => {
    patchDashboardPack({ phase: "loading-stats" });
    const waiting = waitForDashboardPackReady(5000);
    setDashboardPack(readyPack("later"));
    await expect(waiting).resolves.toMatchObject({ phase: "ready", key: "later" });
  });

  test("waitForDashboardPackReady gives up after the timeout", async () => {
    jest.useFakeTimers();
    patchDashboardPack({ phase: "loading-stats" });
    const waiting = waitForDashboardPackReady(100);
    jest.advanceTimersByTime(100);
    await expect(waiting).resolves.toMatchObject({ phase: "loading-stats" });
  });
});
