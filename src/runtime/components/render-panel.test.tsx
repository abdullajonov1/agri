import { AppMode, getAppStore, React } from "jimu-core";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { makeDashboardHost } from "./__test-utils__/dashboard-host-stub";
import { render } from "./render-panel";
import type { DashboardWidgetHost } from "../dashboard-host";

interface PanelProps {
  id?: string;
}
interface MapProps {
  mapWidgetId: string;
  webMapDataSourceId: string;
  webMapUseDataSource?: { dataSourceId: string };
  featureUseDataSources: Array<{ dataSourceId: string }>;
  onViewReady: () => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
}

let mapProps: MapProps | null = null;

function mockMarker(label: string) {
  return { __esModule: true, default: (p: PanelProps) => <div data-testid={label}>{p.id}</div> };
}

jest.mock("../AgriMapIndicatorDrawer", () => mockMarker("drawer"));
jest.mock("../../panels/DateIndexPanel/runtime/widget", () => mockMarker("date-index"));
jest.mock("../../panels/PopupPanel/runtime/widget", () => mockMarker("popup"));
jest.mock("../../filter/LocalizationPanel", () => mockMarker("localization"));
jest.mock("../../panels/RegionPanel", () => mockMarker("region"));
jest.mock("../../panels/PiePanel", () => mockMarker("pie"));
jest.mock("../../panels/GraffPanel", () => mockMarker("graff"));
jest.mock("../../panels/BarPanel", () => mockMarker("bar"));
jest.mock("../../shared/AgriChartLoader", () => ({ __esModule: true, default: () => <div data-testid="loader" /> }));
jest.mock("../embedded-agri-map", () => ({
  __esModule: true,
  default: (p: MapProps) => {
    mapProps = p;
    return <div data-testid="map" />;
  },
}));
jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: jest.fn(),
}));

const mockStore = getAppStore as unknown as jest.Mock<{ getState: () => { appRuntimeInfo?: { appMode?: string } } }, []>;

const stubMember = <K extends keyof DashboardWidgetHost>(host: DashboardWidgetHost, key: K, value: DashboardWidgetHost[K]): void => {
  (host as unknown as Record<string, unknown>)[key as string] = value;
};

const makeHost = (state: Parameters<typeof makeDashboardHost>[0] = {}) => {
  const stubbed = makeDashboardHost(state);
  const { host } = stubbed;
  (host.props as unknown as Record<string, unknown>).useDataSources = [{ dataSourceId: "wm" }, { dataSourceId: "fl" }];
  (host.props as unknown as Record<string, unknown>).manifest = { label: "My Dash" };
  stubMember(host, "toPlainConfig", () => ({ webMapDataSourceId: "wm" }));
  stubMember(host, "getIndicatorConfig", (c) => c);
  stubMember(host, "getPopupConfig", (c) => c);
  stubMember(host, "getStableIndicatorChildProps", () => ({ indicator: {}, yield: {}, unused: {}, reserve: {} }) as never);
  stubMember(host, "childProps", ((suffix: string) => ({ id: `dash-${suffix}` })) as DashboardWidgetHost["childProps"]);
  stubMember(host, "getRowFrValues", () => ({ top: 62, bottom: 38 }));
  stubMember(host, "getLeftPanelWidth", () => "26%");
  stubMember(host, "getUiLanguage", () => "uz_lat");
  stubMember(host, "toggleIndicatorsDrawer", jest.fn());
  stubMember(host, "forceUpdate", jest.fn());
  stubMember(host, "scheduleMapSlotLayout", jest.fn());
  stubMember(host, "setMapLoading", jest.fn());
  return stubbed;
};

describe("render (dashboard shell)", () => {
  beforeEach(() => {
    mapProps = null;
    mockStore.mockReturnValue({ getState: () => ({ appRuntimeInfo: { appMode: AppMode.Run } }) });
  });

  test("builder design mode renders only a lightweight preview with the manifest label", () => {
    mockStore.mockReturnValue({ getState: () => ({ appRuntimeInfo: { appMode: AppMode.Design } }) });
    const { host } = makeHost();
    rtlRender(<>{render(host)}</>);
    expect(screen.getByText("My Dash")).toBeTruthy();
    expect(screen.getByText("Natijani Preview", { exact: false })).toBeTruthy();
    expect(screen.queryByTestId("map")).toBeNull();
  });

  test("runtime mounts localization, region, map and the three chart panels", () => {
    const { host } = makeHost();
    rtlRender(<>{render(host)}</>);
    for (const id of ["localization", "region", "map", "pie", "graff", "bar"]) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    expect(screen.getByTestId("pie").textContent).toBe("dash-pie");
    expect(screen.getByTestId("popup").textContent).toBe("dash-popup");
    expect(screen.getByTestId("date-index").textContent).toBe("dash-date-index");
    expect(screen.getByTestId("drawer")).toBeTruthy();
  });

  test("css variables and grid rows reflect layout config and popup classes", () => {
    const { host } = makeHost({ mapPopupOpen: true, mapPopupPinned: true });
    const { container } = rtlRender(<>{render(host)}</>);
    const root = container.querySelector(".agri-dashboard-v3") as HTMLElement;
    expect(root.className).toContain("agri-popup-open");
    expect(root.className).toContain("agri-popup-pinned");
    expect(root.style.getPropertyValue("--agri-dashboard-left-width")).toBe("26%");
    expect(root.style.getPropertyValue("--agri-dashboard-top-fr")).toBe("62");
    expect((container.querySelector(".agri-dashboard-body") as HTMLElement).style.gridTemplateRows).toContain("62fr");
  });

  test("the embedded map gets the web map and only feature sources", () => {
    const { host } = makeHost();
    rtlRender(<>{render(host)}</>);
    expect(mapProps?.mapWidgetId).toBe("map1");
    expect(mapProps?.webMapDataSourceId).toBe("wm");
    expect(mapProps?.webMapUseDataSource?.dataSourceId).toBe("wm");
    expect(mapProps?.featureUseDataSources.map((s) => s.dataSourceId)).toEqual(["fl"]);
  });

  test("map callbacks update the host", () => {
    const { host, setState } = makeHost();
    rtlRender(<>{render(host)}</>);
    mapProps?.onViewReady();
    expect(host.embeddedMapReady).toBe(true);
    expect(host.setMapLoading).toHaveBeenCalledWith(false);
    expect(setState).toHaveBeenCalledWith({ mapError: "" });
    expect(host.scheduleMapSlotLayout).toHaveBeenCalledWith(true);
    expect(host.forceUpdate).toHaveBeenCalled();
    host.embeddedMapReady = false;
    mapProps?.onLoadingChange(true);
    expect(host.embeddedMapReady).toBe(false);
    expect(host.setMapLoading).toHaveBeenLastCalledWith(true);
    mapProps?.onLoadingChange(false);
    expect(host.embeddedMapReady).toBe(true);
    mapProps?.onError("boom");
    expect(setState).toHaveBeenLastCalledWith({ mapError: "boom" });
  });

  test("shows the loading overlay while the map or surface is loading, and hides no-data", () => {
    const { host } = makeHost({ mapLoading: true, mapNoData: true });
    const { container } = rtlRender(<>{render(host)}</>);
    expect(container.querySelector(".agri-dashboard-map-loading-overlay")).not.toBeNull();
    expect(container.querySelector(".agri-dashboard-map-slot")?.className).toContain("is-loading");
    expect(container.querySelector(".agri-dashboard-map-no-data")).toBeNull();
  });

  test("surface loading also triggers the overlay", () => {
    const { host } = makeHost({ mapSurfaceLoading: true });
    const { container } = rtlRender(<>{render(host)}</>);
    expect(container.querySelector(".agri-dashboard-map-loading-overlay")).not.toBeNull();
  });

  test("no-data card appears when idle and the map error is announced", () => {
    const { host } = makeHost({ mapNoData: true, mapError: "Map failed" });
    const { container } = rtlRender(<>{render(host)}</>);
    expect(container.querySelector(".agri-dashboard-map-no-data")).not.toBeNull();
    expect(container.querySelector(".agri-dashboard-map-no-data-title")?.textContent?.length).toBeGreaterThan(0);
    expect(screen.getByRole("alert").textContent).toBe("Map failed");
  });

  test("an attached map slot becomes the indicator portal host", () => {
    const { host } = makeHost();
    const slot = document.createElement("section");
    document.body.appendChild(slot);
    (host.mapSlotRef as { current: HTMLElement | null }).current = slot;
    rtlRender(<>{render(host)}</>);
    expect(host.mapIndicatorHost).toBe(slot);
    expect(slot.querySelector("[data-testid=drawer]")).not.toBeNull();
    expect(slot.querySelector("[data-testid=date-index]")).not.toBeNull();
    fireEvent.click(document.body);
    slot.remove();
  });

  test("uses the portal host for the popup when it is ready", () => {
    const { host } = makeHost();
    const portal = document.createElement("div");
    document.body.appendChild(portal);
    host.portalHost = portal;
    host.portalReady = true;
    rtlRender(<>{render(host)}</>);
    expect(portal.querySelector("[data-testid=popup]")).not.toBeNull();
    portal.remove();
  });
});
