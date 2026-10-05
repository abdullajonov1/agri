jest.mock("../controller/agri-dashboard-orchestrator", () => ({
  resetDashboardOrchestrator: () => {
    throw new Error("orchestrator boom");
  },
}));

import { clearDashboardCaches } from "./agri-dashboard-cache-clear";
import { getDashboardPack } from "../store/agri-dashboard-store";

describe("clearDashboardCaches failure", () => {
  test("logs the failed step and still clears the pack", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    clearDashboardCaches();
    expect(warn).toHaveBeenCalled();
    const text = warn.mock.calls.map((call) => String(call[0])).join("\n");
    expect(text).toContain("orchestrator");
    expect(getDashboardPack().phase).toBe("idle");
    warn.mockRestore();
  });
});
