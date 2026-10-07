import { AppMode, Immutable, React, getAppStore } from "jimu-core";
import { act, render, screen } from "@testing-library/react";
import type { AllWidgetProps } from "jimu-core";
import type { IMConfig } from "../config";
import AgriDashboard from "./widget";
import AgriMapIndicatorDrawer, { type IndicatorChildPropsSet } from "./AgriMapIndicatorDrawer";
import { LazyPanelFallback, LazyPanelSuspense } from "./lazy-panels";
import * as accessCfg from "../shared/agri-access-config";
import * as urls from "../shared/agri-service-urls";

interface PanelProps {
  id?: string;
}

function mockMarker(label: string) {
  return { __esModule: true, default: (p: PanelProps) => <div data-testid={label}>{p.id}</div> };
}

jest.mock("../filter/LocalizationPanel", () => mockMarker("localization"));
jest.mock("../panels/RegionPanel", () => mockMarker("region"));
jest.mock("../panels/PiePanel", () => mockMarker("pie"));
jest.mock("../panels/BarPanel", () => mockMarker("bar"));
jest.mock("../panels/GraffPanel", () => mockMarker("graff"));
jest.mock("../panels/DateIndexPanel/runtime/widget", () => mockMarker("date-index"));
jest.mock("../panels/PopupPanel/runtime/widget", () => mockMarker("popup"));
jest.mock("../panels/IndicatorPanel", () => mockMarker("ind"));
jest.mock("../panels/IndicatorYieldPanel/runtime/widget", () => mockMarker("ind-yield"));
jest.mock("../panels/IndicatorUnusedLandPanel/runtime/widget", () => mockMarker("ind-unused"));
jest.mock("../panels/IndicatorReserveLandPanel/runtime/widget", () => mockMarker("ind-reserve"));
jest.mock("../shared/AgriChartLoader", () => ({ __esModule: true, default: () => <div data-testid="loader" /> }));
jest.mock("./embedded-agri-map", () => ({ __esModule: true, default: () => <div data-testid="map" /> }));
jest.mock("../shared/agri-access-config", () => ({
  ...jest.requireActual("../shared/agri-access-config"),
  setAccessConfig: jest.fn(),
}));
jest.mock("../shared/agri-service-urls", () => ({
  ...jest.requireActual("../shared/agri-service-urls"),
  setAgriServiceUrls: jest.fn(),
}));
jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: jest.fn(),
}));

const mockStore = getAppStore as unknown as jest.Mock<{ getState: () => { appRuntimeInfo?: { appMode?: string } } }, []>;

const makeProps = (config: Record<string, unknown> = {}): AllWidgetProps<IMConfig> =>
  ({
    id: "dash",
    config: Immutable(config),
    useDataSources: Immutable([]),
    manifest: { label: "Dash" },
  }) as unknown as AllWidgetProps<IMConfig>;

describe("AgriDashboard widget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    mockStore.mockReturnValue({ getState: () => ({ appRuntimeInfo: { appMode: AppMode.Run } }) });
  });
  afterEach(() => jest.restoreAllMocks());

  test("constructor applies access and service config before the first render", () => {
    const props = makeProps({ accessConfig: { fullAccessGroups: ["g"], rules: [] }, serviceUrls: { portalUrl: "x" } });
    render(<AgriDashboard {...props} />);
    expect(accessCfg.setAccessConfig).toHaveBeenCalled();
    expect(urls.setAgriServiceUrls).toHaveBeenCalled();
  });

  test("runtime mode renders all panels and activates the dashboard class", () => {
    const { unmount } = render(<AgriDashboard {...makeProps()} />);
    for (const id of ["localization", "region", "map", "pie", "graff", "bar"]) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(false);
  });

  test("builder design mode shows the lightweight preview and never activates layout work", () => {
    mockStore.mockReturnValue({ getState: () => ({ appRuntimeInfo: { appMode: AppMode.Design } }) });
    render(<AgriDashboard {...makeProps()} />);
    expect(screen.getByText("Dash")).toBeTruthy();
    expect(screen.queryByTestId("map")).toBeNull();
    expect(document.documentElement.classList.contains("agri-dashboard-active")).toBe(false);
  });

  test("popup open event updates state and root classes", () => {
    const { container } = render(<AgriDashboard {...makeProps()} />);
    act(() => {
      document.dispatchEvent(new CustomEvent("agriMapPopupVisibility", { detail: { open: true, pinned: true } }));
    });
    const root = container.querySelector(".agri-dashboard-v3") as HTMLElement;
    expect(root.className).toContain("agri-popup-open");
    expect(root.className).toContain("agri-popup-pinned");
  });

  test("no-data stays hidden while the initial map load overlay is up", () => {
    const { container } = render(<AgriDashboard {...makeProps()} />);
    act(() => {
      document.dispatchEvent(new CustomEvent("agriMapSurfaceLoading", { detail: { loading: false } }));
      document.dispatchEvent(new CustomEvent("agriMapNoData", { detail: { noData: true } }));
    });
    expect(container.querySelector(".agri-dashboard-map-no-data")).toBeNull();
    expect(container.querySelector(".agri-dashboard-map-loading-overlay")).not.toBeNull();
  });

  test("language and size getters read from props", () => {
    const ref = React.createRef<AgriDashboard>();
    render(<AgriDashboard ref={ref} {...makeProps({ leftPanelWidthPercent: 30 })} />);
    expect(ref.current?.getLeftPanelWidth()).toContain("30");
    expect(ref.current?.getActiveMapWidgetId()).toBe("dash-embedded-map");
    expect(typeof ref.current?.getUiLanguage()).toBe("string");
    expect(ref.current?.getRowFrValues().top).toBeGreaterThan(0);
  });
});

describe("AgriMapIndicatorDrawer", () => {
  const baseProps = (phase: "expanded" | "collapsed", onToggle = jest.fn()) => {
    const set = { indicator: { id: "a" }, yield: { id: "b" }, unused: { id: "c" }, reserve: { id: "d" } } as unknown as IndicatorChildPropsSet;
    return {
      overlayRef: React.createRef<HTMLDivElement>(),
      panelRef: React.createRef<HTMLDivElement>(),
      phase,
      onToggle,
      indicatorProps: set.indicator,
      yieldProps: set.yield,
      unusedLandProps: set.unused,
      reserveLandProps: set.reserve,
    };
  };

  test("expanded phase renders four slots and an open toggle", () => {
    const { container } = render(<AgriMapIndicatorDrawer {...baseProps("expanded")} />);
    expect(container.querySelectorAll(".agri-dashboard-indicator-slot")).toHaveLength(4);
    expect(container.querySelector(".agri-dashboard-indicator-drawer--expanded")).not.toBeNull();
    const toggle = container.querySelector("button") as HTMLButtonElement;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.title).toBe("Indikatorlarni yopish");
    expect(container.querySelector("#agri-dashboard-indicator-panel")?.getAttribute("aria-hidden")).toBe("false");
  });

  test("collapsed phase marks the panel hidden and the toggle callback fires", () => {
    const onToggle = jest.fn();
    const { container } = render(<AgriMapIndicatorDrawer {...baseProps("collapsed", onToggle)} />);
    const toggle = container.querySelector("button") as HTMLButtonElement;
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.title).toBe("Indikatorlarni ochish");
    toggle.click();
    expect(onToggle).toHaveBeenCalled();
  });

  test("only re-renders when phase, props or toggle change", () => {
    const props = baseProps("expanded");
    const drawer = new AgriMapIndicatorDrawer(props);
    expect(drawer.shouldComponentUpdate({ ...props })).toBe(false);
    expect(drawer.shouldComponentUpdate({ ...props, phase: "collapsing" })).toBe(true);
    expect(drawer.shouldComponentUpdate({ ...props, yieldProps: { ...props.yieldProps } })).toBe(true);
    expect(drawer.shouldComponentUpdate({ ...props, onToggle: jest.fn() })).toBe(true);
    expect(drawer.shouldComponentUpdate({ ...props, overlayRef: React.createRef<HTMLDivElement>() })).toBe(false);
  });
});

describe("lazy panels", () => {
  test("fallback shows the loader with an accessible label", () => {
    render(<LazyPanelFallback />);
    expect(screen.getByLabelText("Loading panel")).toBeTruthy();
    expect(screen.getByTestId("loader")).toBeTruthy();
  });

  test("suspense renders its children", () => {
    render(
      <LazyPanelSuspense>
        <span>content</span>
      </LazyPanelSuspense>,
    );
    expect(screen.getByText("content")).toBeTruthy();
  });
});
