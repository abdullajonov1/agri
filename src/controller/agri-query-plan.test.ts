import { buildDashboardQueryPlan } from "./agri-query-plan";
import type { DashboardFilterSlice } from "../types/dashboard-pack";

const slice = (overrides: Partial<DashboardFilterSlice> = {}): DashboardFilterSlice => ({
  yil: "2025",
  viloyat: "",
  tuman: "",
  turi: "",
  turlar: [],
  vh: "",
  lockedViloyat: "",
  filterPieByVh: false,
  ...overrides,
});

describe("buildDashboardQueryPlan", () => {
  test("does nothing without a year", () => {
    expect(buildDashboardQueryPlan(slice({ yil: "  " }))).toEqual({
      warmupLayers: false,
      prefetchRegion: false,
      prefetchPie: false,
      prefetchIndicator: false,
      prefetchGraff: false,
      deferStatsToPanels: false,
    });
  });

  test("prefetches every slice for a plain year filter", () => {
    expect(buildDashboardQueryPlan(slice())).toEqual({
      warmupLayers: true,
      prefetchRegion: true,
      prefetchPie: true,
      prefetchIndicator: true,
      prefetchGraff: true,
      deferStatsToPanels: false,
    });
  });

  test.each([
    ["an active VH status", { vh: "yaxshi" }],
    ["filterPieByVh", { filterPieByVh: true }],
  ])("defers Pie/Indicator to panels under %s", (_label, overrides) => {
    const plan = buildDashboardQueryPlan(slice(overrides));
    expect(plan.prefetchPie).toBe(false);
    expect(plan.prefetchIndicator).toBe(false);
    expect(plan.prefetchRegion).toBe(true);
    expect(plan.prefetchGraff).toBe(true);
    expect(plan.deferStatsToPanels).toBe(true);
  });
});
