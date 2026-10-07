jest.mock("./agri-data-source-engine", () => ({
  AgriDataSourceEngine: class FakeEngine {},
}));

import { getAgriDashboardRootId, getSharedAgriDataSourceEngine } from "./agri-engine-registry";

describe("getAgriDashboardRootId", () => {
  test("strips known embedded child suffixes", () => {
    expect(getAgriDashboardRootId("widget_1-pie")).toBe("widget_1");
    expect(getAgriDashboardRootId("widget_1-localization")).toBe("widget_1");
    expect(getAgriDashboardRootId("widget_1-popup")).toBe("widget_1");
  });

  test("leaves other ids unchanged", () => {
    expect(getAgriDashboardRootId("widget_1")).toBe("widget_1");
    expect(getAgriDashboardRootId("widget_1-chart")).toBe("widget_1-chart");
    expect(getAgriDashboardRootId(null as unknown as string)).toBe("");
  });
});

describe("getSharedAgriDataSourceEngine", () => {
  test("children of one dashboard share an engine; dashboards are isolated", () => {
    const root = getSharedAgriDataSourceEngine("w1");
    expect(getSharedAgriDataSourceEngine("w1-graff")).toBe(root);
    expect(getSharedAgriDataSourceEngine("w1-bar")).toBe(root);
    expect(getSharedAgriDataSourceEngine("w2-bar")).not.toBe(root);
  });
});
