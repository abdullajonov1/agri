jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceComponent: (): JSX.Element => <div data-testid="ds" />,
}));
jest.mock("jimu-arcgis", () => ({
  JimuMapViewComponent: (p: { useMapWidgetId: string }): JSX.Element => <div data-testid="map" data-id={p.useMapWidgetId} />,
}));
jest.mock("jimu-ui", () => ({
  Button: (p: { onClick?: () => void; children?: unknown }): JSX.Element => (
    <button type="button" onClick={p.onClick}>{p.children as string}</button>
  ),
}));
jest.mock("lucide-react", () => ({
  TriangleAlert: (): JSX.Element => <i data-testid="alert-icon" />,
}));
jest.mock("../../../../shared/AgriChartLoader", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="loader" />,
}));
jest.mock("../../../../shared/agriNoDataLabel", () => ({
  agriNoDataLabel: (lang: string): string => `NODATA-${lang}`,
}));

import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { React } from "jimu-core";
import type { PieWidgetHost } from "../pie-host";
import type { AgriPieState } from "../widget";
import { render, renderRadarPieChart } from "./render-panel";

type StatePatch = Partial<AgriPieState>;

const CATS = [
  { key: "wheat", value: 30, percentage: 30 },
  { key: "corn", value: 70, percentage: 70 },
];

const makeHost = (state: StatePatch = {}, extra: Record<string, unknown> = {}, overrides: Partial<PieWidgetHost> = {}): PieWidgetHost =>
  ({
    props: { ...extra },
    state: {
      loading: false,
      error: null,
      categoryData: { categories: CATS, totalValue: 100 },
      activeSlice: null,
      selectedCategories: [],
      mapLoadingStatus: "loaded",
      connectionStatus: "connected",
      debugInfo: "",
      yil: "2025",
      viloyat: "V",
      lockedViloyat: "",
      language: "en",
      isDarkTheme: false,
      ...state,
    },
    _hasCompletedFetch: true,
    _pieChartRef: React.createRef<HTMLDivElement>(),
    isIpadLayout: () => false,
    getCategoryDisplayName: (k: string) => `Name ${k}`,
    getCropColor: () => "#abc",
    normalizeName: (s: string) => String(s).trim().toLowerCase(),
    handleSliceClick: jest.fn(),
    retryMapConnection: jest.fn(),
    fetchCategoryData: jest.fn(),
    onDataSourceCreated: jest.fn(),
    onDataSourceInfoChange: jest.fn(),
    onActiveViewChange: jest.fn(),
    renderRadarPieChart: (...a: Parameters<typeof renderRadarPieChart> extends [PieWidgetHost, ...infer R] ? R : never) =>
      renderRadarPieChart({ _pieChartRef: React.createRef<HTMLDivElement>() } as unknown as PieWidgetHost, ...a),
    getPieCenterContent: () => ({ showPercent: true, percent: 30, area: 30, label: "Name wheat" }),
    getCenterAllLabel: () => "ALL",
    formatCenterPercent: (v: number) => `${v}%`,
    formatCenterArea: (v: number) => `${v} ha`,
    ...overrides,
  }) as unknown as PieWidgetHost;

const mountPie = (state: StatePatch = {}, extra: Record<string, unknown> = {}, overrides: Partial<PieWidgetHost> = {}): { host: PieWidgetHost; container: HTMLElement } => {
  const host = makeHost(state, extra, overrides);
  const { container } = rtlRender(<div>{render(host)}</div>);
  return { host, container };
};

describe("Pie render", () => {
  it("renders legend entries sorted by value with formatted areas", () => {
    const { container } = mountPie();
    const names = Array.from(container.querySelectorAll(".legend-label")).map((n) => n.textContent);
    expect(names).toEqual(["Name corn", "Name wheat"]);
    const areas = Array.from(container.querySelectorAll(".legend-area-value")).map((n) => n.textContent);
    expect(areas).toEqual(["70 ha", "30 ha"]);
    expect(container.querySelector(".land-category-echart")).toBeTruthy();
  });

  it("renders the center content from host helpers", () => {
    const { container } = mountPie();
    expect(container.querySelector(".land-category-pie-center-value")?.textContent).toBe("30%");
    expect(container.querySelector(".land-category-pie-center-area")?.textContent).toBe("30 ha");
    expect(container.querySelector(".land-category-pie-center-label")?.textContent).toBe("Name wheat");
  });

  it("flags a multi-selection label", () => {
    const { container } = mountPie({ selectedCategories: ["wheat", "corn"] });
    expect(container.querySelector(".land-category-pie-center-label--multi")).toBeTruthy();
  });

  it.each([
    ["en", "Crop Type", "ha"],
    ["ru", "Тип культуры", "га"],
    ["uz_lat", "Ekin Turi", "ga"],
    ["uz_cyr", "Экин Тури", "га"],
  ] as const)("title and unit for %s", (language, title, unit) => {
    const { container } = mountPie({ language });
    expect(screen.getByText(title)).toBeTruthy();
    expect(container.querySelector(".legend-area-value")?.textContent?.endsWith(unit)).toBe(true);
  });

  it("formats legend area digits by magnitude", () => {
    const { container } = mountPie({
      categoryData: {
        categories: [
          { key: "a", value: 1234.56, percentage: 1 },
          { key: "b", value: 12.34, percentage: 1 },
          { key: "c", value: 1.234, percentage: 1 },
          { key: "d", value: NaN, percentage: 1 },
        ],
        totalValue: 1,
      },
    });
    const areas = Array.from(container.querySelectorAll(".legend-area-value")).map((n) => (n.textContent || "").replace(/ /g, " "));
    expect(areas[0]).toBe("1 235 ha");
    expect(areas[1]).toBe("12.3 ha");
    expect(areas[2]).toBe("1.23 ha");
    expect(areas[3]).toBe("0 ha");
  });

  it("marks selected legend items and forwards clicks when a region is selected", () => {
    const { host, container } = mountPie({ selectedCategories: ["Wheat"] });
    const items = container.querySelectorAll<HTMLButtonElement>(".legend-item");
    expect(items[1].className).toContain("legend-item-selected");
    expect(items[0].className).not.toContain("legend-item-selected");
    fireEvent.click(items[0]);
    expect(host.handleSliceClick).toHaveBeenCalledWith(expect.objectContaining({ rawKey: "corn" }), 0);
  });

  it("disables legend clicks when no viloyat is selected", () => {
    const { host, container } = mountPie({ viloyat: "", lockedViloyat: "" });
    const item = container.querySelector<HTMLButtonElement>(".legend-item");
    expect(item?.disabled).toBe(true);
    fireEvent.click(item as HTMLButtonElement);
    expect(host.handleSliceClick).not.toHaveBeenCalled();
  });

  it("locked viloyat also enables slice interaction", () => {
    const { container } = mountPie({ viloyat: "", lockedViloyat: "L" });
    expect(container.querySelector<HTMLButtonElement>(".legend-item")?.disabled).toBe(false);
  });

  it("hides the legend in iPad layout", () => {
    const { container } = mountPie({}, {}, { isIpadLayout: () => true });
    expect(container.querySelector(".category-legend")).toBeNull();
    expect(container.querySelector(".land-category-card--ipad")).toBeTruthy();
    expect(container.querySelector(".land-category-main-content--no-legend")).toBeTruthy();
  });

  it("applies the theme class", () => {
    const { container } = mountPie({ isDarkTheme: true });
    expect(container.querySelector(".land-category-card.dark-theme")).toBeTruthy();
  });

  it("mounts data source and map components when configured", () => {
    mountPie({}, { useDataSources: [{ dataSourceId: "d" }], useMapWidgetIds: ["w1"] });
    expect(screen.getByTestId("ds")).toBeTruthy();
    expect(screen.getByTestId("map").getAttribute("data-id")).toBe("w1");
  });

  it("shows the no-data state after a fetch returned zero categories", () => {
    const { container } = mountPie({ categoryData: { categories: [], totalValue: 0 } }, {}, {});
    expect(screen.getByText("NODATA-en")).toBeTruthy();
    expect(container.querySelector(".category-legend")).toBeNull();
  });

  it("shows the loader (not no-data) while the first fetch is pending", () => {
    const host = makeHost({ categoryData: { categories: [], totalValue: 0 } });
    (host as unknown as { _hasCompletedFetch: boolean })._hasCompletedFetch = false;
    rtlRender(<div>{render(host)}</div>);
    expect(screen.getByTestId("loader")).toBeTruthy();
    expect(screen.queryByText("NODATA-en")).toBeNull();
  });

  it("shows the loader while connecting or without a year", () => {
    mountPie({ connectionStatus: "connecting" });
    expect(screen.getAllByTestId("loader").length).toBeGreaterThan(0);
  });

  it("overlays a refresh loader and dims the legend when reloading with data", () => {
    const { container } = mountPie({ loading: true });
    expect(screen.getByTestId("loader")).toBeTruthy();
    expect(container.querySelector(".land-category-chart-container--loading")).toBeTruthy();
    expect(container.querySelector(".land-category-pie-center")).toBeNull();
    expect(container.querySelector(".category-legend")?.getAttribute("aria-disabled")).toBe("true");
  });

  it("shows an error with a retry that refetches", () => {
    const { host } = mountPie({ error: "bad data" });
    expect(screen.getByText("bad data")).toBeTruthy();
    fireEvent.click(screen.getByText("Қайта уриниш"));
    expect(host.fetchCategoryData).toHaveBeenCalled();
  });

  it("shows a map failure with a reconnect action", () => {
    const { host } = mountPie({ mapLoadingStatus: "failed", connectionStatus: "failed", error: null });
    expect(screen.getByText(/Харитага уланишда хатолик/)).toBeTruthy();
    fireEvent.click(screen.getByText("Қайта уланиш"));
    expect(host.retryMapConnection).toHaveBeenCalled();
  });
});

describe("renderRadarPieChart", () => {
  it("renders the chart host div bound to the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    rtlRender(renderRadarPieChart({ _pieChartRef: ref } as unknown as PieWidgetHost, []));
    expect(ref.current?.className).toBe("land-category-echart");
  });
});
