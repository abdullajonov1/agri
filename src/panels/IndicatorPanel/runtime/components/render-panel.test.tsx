jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceComponent: (p: { useDataSource: unknown }): JSX.Element => <div data-testid="ds" data-ds={JSON.stringify(p.useDataSource)} />,
}));
jest.mock("jimu-arcgis", () => ({
  JimuMapViewComponent: (p: { useMapWidgetId: string }): JSX.Element => <div data-testid="map" data-id={p.useMapWidgetId} />,
}));
jest.mock("../../../../shared/AgriDashboardSpinner", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="spinner" />,
}));
jest.mock("../../../../shared/AgriAnimatedCount", () => ({
  __esModule: true,
  default: (p: { value: number | null; emptyFallback: string }): JSX.Element => (
    <span data-testid="count">{p.value == null ? p.emptyFallback : String(p.value)}</span>
  ),
}));

import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { React } from "jimu-core";
import { makeIndicatorHost } from "../__test-utils__/indicator-host-stub";
import type { IndicatorWidgetHost } from "../indicator-host";
import type { IndicatorConfig, VegetationStatsWidgetState } from "../widget";
import { render } from "./render-panel";

const mountPanel = (
  state: Partial<VegetationStatsWidgetState> = {},
  config: IndicatorConfig = {},
  extraProps: Record<string, unknown> = {},
  overrides: Partial<IndicatorWidgetHost> = {},
): { host: IndicatorWidgetHost; container: HTMLElement } => {
  const { host } = makeIndicatorHost(
    { connectionStatus: "connected", selectedYil: "2025", vegetationArea: 12, ...state },
    config,
    {
      getCustomStyles: () => ({ container: { color: "red" }, statLabel: {}, statValue: {} }) as unknown as ReturnType<IndicatorWidgetHost["getCustomStyles"]>,
      labelNoValue: () => "NOVAL",
      translateKnownError: (m: string) => `T(${m})`,
      retryMapConnection: jest.fn(),
      onDataSourceCreated: jest.fn(),
      onDataSourceInfoChange: jest.fn(),
      onActiveViewChange: jest.fn(),
      _containerRef: React.createRef<HTMLDivElement>(),
      ...overrides,
    },
  );
  host.props = { ...host.props, ...extraProps } as IndicatorWidgetHost["props"];
  const { container } = rtlRender(<div>{render(host)}</div>);
  return { host, container };
};

describe("Indicator render", () => {
  it("shows label, value and default unit for the language", () => {
    mountPanel({ language: "en" });
    expect(screen.getByText("Crop area")).toBeTruthy();
    expect(screen.getByTestId("count").textContent).toBe("12");
    expect(screen.getByText("ha")).toBeTruthy();
  });

  it.each([
    ["ru", "Площадь посевов", "га"],
    ["uz_lat", "Ekin maydonlari", "ga"],
    ["uz_cyr", "Экин майдонлари", "га"],
  ] as const)("localizes default label/unit for %s", (language, label, unit) => {
    mountPanel({ language });
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText(unit)).toBeTruthy();
  });

  it("keeps a custom label and custom unit", () => {
    mountPanel({}, { label: "My label", unitLabel: "tons" });
    expect(screen.getByText("My label")).toBeTruthy();
    expect(screen.getByText("tons")).toBeTruthy();
  });

  it("replaces a default-looking label from another language with the current one", () => {
    mountPanel({ language: "en" }, { label: "Площадь посевов" });
    expect(screen.getByText("Crop area")).toBeTruthy();
  });

  it("shows a spinner while waiting for the first value", () => {
    mountPanel({ vegetationArea: null, loading: true });
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(screen.queryByTestId("count")).toBeNull();
  });

  it("shows a spinner while the year is unknown", () => {
    mountPanel({ vegetationArea: null, selectedYil: "" });
    expect(screen.getByTestId("spinner")).toBeTruthy();
  });

  it("keeps the previous value visible during soft refresh", () => {
    mountPanel({ loading: true, vegetationArea: 5 });
    expect(screen.getByTestId("count").textContent).toBe("5");
  });

  it("shows initializing spinner while connecting (map mode)", () => {
    mountPanel({ connectionStatus: "connecting", vegetationArea: null });
    expect(screen.getByTestId("spinner")).toBeTruthy();
  });

  it("shows the translated error and a retry button on failed connection", () => {
    const { host } = mountPanel({ vegetationArea: null, error: "boom", connectionStatus: "failed", language: "en" });
    expect(screen.getByText("T(boom)")).toBeTruthy();
    fireEvent.click(screen.getByText("Reconnect"));
    expect(host.retryMapConnection).toHaveBeenCalled();
  });

  it.each([
    ["ru", "Повторить подключение"],
    ["uz_lat", "Qayta ulanish"],
    ["uz_cyr", "Қайта уланиш"],
  ] as const)("retry button text for %s", (language, text) => {
    mountPanel({ vegetationArea: null, error: "x", connectionStatus: "failed", language });
    expect(screen.getByText(text)).toBeTruthy();
  });

  it("API mode errors have no retry button", () => {
    mountPanel({ vegetationArea: null, error: "x", connectionStatus: "failed" }, { useApiDataSource: true });
    expect(screen.queryByText("Qayta ulanish")).toBeNull();
    expect(screen.queryByText("Повторить подключение")).toBeNull();
  });

  it("error is ignored while a value is still shown", () => {
    mountPanel({ error: "x", vegetationArea: 3 });
    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.queryByText("T(x)")).toBeNull();
  });

  it("mounts data source and map components only outside API mode", () => {
    mountPanel({}, {}, { useDataSources: [{ dataSourceId: "d" }], useMapWidgetIds: ["w9"] });
    expect(screen.getByTestId("ds")).toBeTruthy();
    expect(screen.getByTestId("map").getAttribute("data-id")).toBe("w9");
  });

  it("does not mount data source or map components in API mode", () => {
    mountPanel({}, { useApiDataSource: true }, { useDataSources: [{ dataSourceId: "d" }], useMapWidgetIds: ["w9"] });
    expect(screen.queryByTestId("ds")).toBeNull();
    expect(screen.queryByTestId("map")).toBeNull();
  });

  it("applies theme, overlay and size classes", () => {
    const { container } = mountPanel({ isDarkTheme: false, widgetSize: "xs" }, { mapOverlayMode: true });
    const root = container.querySelector(".vegetation-stats-widget") as HTMLElement;
    expect(root.className).toContain("light-theme");
    expect(root.className).toContain("map-overlay-mode");
    expect(root.getAttribute("data-ind-size")).toBe("xs");
  });

  describe("grouped mode", () => {
    it("shows a localized total caption and count mode omits the unit", () => {
      mountPanel({ language: "en" }, { groupByField: "turi" });
      expect(screen.getByText("Total (turi)")).toBeTruthy();
      expect(screen.queryByText("ha")).toBeNull();
    });

    it("sum mode keeps the unit", () => {
      mountPanel({ language: "en" }, { groupByField: "turi", statOperation: "sum" });
      expect(screen.getByText("ha")).toBeTruthy();
    });

    it.each([
      ["ru", "Итого по полю turi"],
      ["uz_lat", "Jami (turi)"],
      ["uz_cyr", "Жами (turi)"],
    ] as const)("caption for %s", (language, text) => {
      mountPanel({ language }, { groupByField: "turi" });
      expect(screen.getByText(text)).toBeTruthy();
    });

    it("caption uses the displayed group value and ENUM label mapping", () => {
      mountPanel(
        {},
        {
          groupByField: "status",
          displayGroupValue: 2,
          categoryMode: "ENUM",
          enumCategories: [{ label: "Active", value: 2 }],
        },
      );
      expect(screen.getByText("status = Active")).toBeTruthy();
    });

    it("falls back to the raw value or the no-value label", () => {
      mountPanel({}, { groupByField: "status", displayGroupValue: "raw" });
      expect(screen.getByText("status = raw")).toBeTruthy();
    });

    it("null group value uses labelNoValue", () => {
      mountPanel({}, { groupByField: "status", displayGroupValue: null as unknown as string });
      expect(screen.getByText("status = NOVAL")).toBeTruthy();
    });
  });

  it("renders the '-' fallback for a null value once connected and not loading", () => {
    mountPanel({ vegetationArea: null, error: null, loading: false, selectedYil: "2025" }, { useApiDataSource: true });
    // No year/loading gate in effect would hide it, but waitingForYear is false here
    expect(screen.queryByTestId("spinner")).toBeNull();
    expect(screen.getByTestId("count").textContent).toBe("-");
  });
});
