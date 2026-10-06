import { clearAgriDashboardBootstrapCache } from "./agri-bootstrap";
import { clearAgriQueryGatewayCache } from "./agri-query-gateway";
import { clearAgriStatsStoreCache } from "./agri-stats-store";
import { resetStatsQueryScheduler } from "./agri-query-scheduler";
import { clearMasterFilterSnapshot } from "./agri-filter-store";
import { resetDashboardPackStore } from "../store/agri-dashboard-store";
import { resetDashboardOrchestrator } from "../controller/agri-dashboard-orchestrator";

function runClearStep(name: string, step: () => void): void {
  try {
    step();
  } catch (err) {
    // One failed store must not skip the rest of unmount cleanup.
    // eslint-disable-next-line no-console
    console.warn(`[AgroV5] dashboard cache clear failed: ${name}`, err);
  }
}

/** Clear in-memory dashboard caches / schedulers on widget unmount. */
export function clearDashboardCaches(): void {
  runClearStep("orchestrator", resetDashboardOrchestrator);
  runClearStep("pack", resetDashboardPackStore);
  runClearStep("scheduler", resetStatsQueryScheduler);
  runClearStep("filter", clearMasterFilterSnapshot);
  runClearStep("bootstrap", clearAgriDashboardBootstrapCache);
  runClearStep("gateway", clearAgriQueryGatewayCache);
  runClearStep("stats", clearAgriStatsStoreCache);
}
