jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceComponent: (props: { useDataSource: { dataSourceId: string } }) =>
    jest.requireActual<typeof import("react")>("react").createElement("div", { "data-testid": "ds", "data-id": props.useDataSource.dataSourceId }),
}));
jest.mock("jimu-arcgis", () => ({
  JimuMapViewComponent: (props: { useMapWidgetId: string }) =>
    jest.requireActual<typeof import("react")>("react").createElement("div", { "data-testid": "map", "data-id": props.useMapWidgetId }),
}));
jest.mock("../../../assets/uzcosmos logo white.svg", () => "logo.svg", { virtual: true });
jest.mock("../GraffSearch/GraffSearchDropdown", () => ({ GraffSearchDropdown: (): null => null }));
jest.mock("../GraffSearch/GraffSearchInput", () => ({ GraffSearchInput: (): null => null }));
jest.mock("../Toolbar/IndexInfoMenu", () => ({ IndexInfoMenu: (): null => null }));
jest.mock("../Toolbar/LanguageMenu", () => ({ LanguageMenu: (): null => null }));
jest.mock("../Toolbar/NotificationsMenu", () => ({ NotificationsMenu: (): null => null }));
jest.mock("../Toolbar/ToolbarGroup", () => ({
  ToolbarGroup: () => jest.requireActual<typeof import("react")>("react").createElement("div", { "data-testid": "toolbar" }),
}));
jest.mock("../Toolbar/YilMenu", () => ({ YilMenu: (): null => null }));

import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { IMUseDataSource } from "jimu-core";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../__test-utils__/fake-host";
import { render as renderPanel } from "./render-panel";

afterEach(cleanup);

const mk = (init: FakeHostInit = {}): FakeHost =>
  makeFakeHost({
    getEffectiveUseDataSources: () => [],
    retryMapConnection: jest.fn(),
    ...init,
  });

describe("render-panel", () => {
  test("shows only a loading placeholder while connecting", () => {
    const { container } = render(renderPanel(mk({ state: { connectionStatus: "connecting" } })));
    expect(container.querySelector(".agri-region-loading-container")).not.toBeNull();
    expect(screen.queryByTestId("toolbar")).toBeNull();
  });

  test("shows the error with a working retry button when the connection failed", () => {
    const host = mk({ state: { connectionStatus: "failed", error: "No access" } });
    render(renderPanel(host));
    expect(screen.getByText("No access")).toBeTruthy();
    fireEvent.click(screen.getByText("Retry"));
    expect(host.retryMapConnection).toHaveBeenCalledTimes(1);
  });

  test("uses a default message when failed without an error", () => {
    render(renderPanel(mk({ state: { connectionStatus: "failed", error: null } })));
    expect(screen.getByText("Failed to connect. Please retry.")).toBeTruthy();
  });

  test("connected state renders brand, toolbar and applies the theme class", () => {
    const { container } = render(renderPanel(mk({ state: { connectionStatus: "connected", isDarkTheme: true } })));
    expect(screen.getByText("Space Agro Monitoring")).toBeTruthy();
    expect(screen.getByTestId("toolbar")).toBeTruthy();
    expect(container.querySelector(".agri-v20-root")?.className).toContain("dark-theme");
  });

  test("connected state shows an error banner only when not loading", () => {
    const a = render(renderPanel(mk({ state: { connectionStatus: "connected", error: "Oops", loading: false } })));
    expect(screen.getByText("Oops")).toBeTruthy();
    a.unmount();
    render(renderPanel(mk({ state: { connectionStatus: "connected", error: "Oops", loading: true } })));
    expect(screen.queryByText("Oops")).toBeNull();
  });

  test("mounts the map view component when a map widget is linked", () => {
    render(renderPanel(mk({ props: { useMapWidgetIds: ["w1"] as never }, state: { connectionStatus: "connecting" } })));
    expect(screen.getByTestId("map").getAttribute("data-id")).toBe("w1");
    expect(screen.queryByTestId("ds")).toBeNull();
  });

  test("mounts a single data source component when no map is linked", () => {
    const sources = [{ dataSourceId: "ds1" }, { dataSourceId: "ds2" }] as unknown as IMUseDataSource[];
    render(renderPanel(mk({ getEffectiveUseDataSources: () => sources, state: { connectionStatus: "connecting" } })));
    const nodes = screen.getAllByTestId("ds");
    expect(nodes).toHaveLength(1);
    expect(nodes[0].getAttribute("data-id")).toBe("ds1");
    expect(screen.queryByTestId("map")).toBeNull();
  });
});
