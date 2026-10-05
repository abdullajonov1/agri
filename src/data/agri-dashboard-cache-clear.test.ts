import { clearDashboardCaches } from "./agri-dashboard-cache-clear";
import { getDashboardPack, setDashboardPack } from "../store/agri-dashboard-store";
import { emptyDashboardPack } from "../types/dashboard-pack";

describe("clearDashboardCaches", () => {
  test("unmount reset returns the pack to idle", () => {
    setDashboardPack(
      emptyDashboardPack({
        phase: "ready",
        key: "yil=2026",
      }),
    );
    expect(getDashboardPack().phase).toBe("ready");
    clearDashboardCaches();
    expect(getDashboardPack().phase).toBe("idle");
    expect(getDashboardPack().key).toBe("");
  });
});
