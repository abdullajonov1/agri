jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceComponent: (p: { useDataSource: { dataSourceId: string } }): JSX.Element => (
    <div data-testid="ds" data-id={p.useDataSource.dataSourceId} />
  ),
}));
jest.mock("jimu-arcgis", () => ({
  JimuMapViewComponent: (p: { useMapWidgetId?: string }): JSX.Element => (
    <div data-testid="mapview" data-id={p.useMapWidgetId} />
  ),
}));
jest.mock("jimu-ui", () => ({
  Button: (p: { onClick?: () => void; children?: React.ReactNode }): JSX.Element => (
    <button type="button" onClick={p.onClick}>
      {p.children}
    </button>
  ),
}));
jest.mock("../../../../shared/AgriChartLoader", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="loader" />,
}));
jest.mock("../../../../shared/agri-place-display", () => ({
  translateAgriPlaceForDisplay: (text: string, lang: string, kind: string): string => `${text}|${lang}|${kind}`,
}));

import { fireEvent, render, screen, within } from "@testing-library/react";
import { React } from "jimu-core";
import type { AgriRegionState } from "../widget";
import type { RegionWidgetHost } from "../region-host";
import { makeStubHost } from "../__test-utils__/stub-host";
import { render as renderPanel } from "./render-panel";

const FILTERS = { ...makeStubHost().state.currentFilters, yil: "2024" };

const DATA = {
  viloyatlar: [
    { name: "Andijon viloyati", maydon: 10, percentage: 10 },
    { name: "Buxoro viloyati", maydon: 90, percentage: 90 },
  ],
  tumanlar: [
    { name: "Asaka tumani", maydon: 5 },
    { name: "Xonobod tumani", maydon: 7 },
    { name: "Baliqchi tumani", maydon: 3 },
  ],
  totalArea: 100,
};

const mount = (state: Partial<AgriRegionState> = {}, over: Parameters<typeof makeStubHost>[1] = {}) => {
  const host = makeStubHost(
    { currentFilters: FILTERS, regionalData: DATA, ...state },
    {
      calculateDynamicYAxisWidth: () => 90,
      getEffectiveDisplayCount: () => 2,
      getDisplayCountOptions: () => [2, 3],
      formatNumber: (n: number) => `#${n}`,
      renderCursorTooltipContent: () => <span>TIP</span>,
      ...over,
    },
  );
  const utils = render(<div>{renderPanel(host)}</div>);
  return { host, ...utils };
};

describe("RegionPanel render", () => {
  it("shows the loader while connecting, with no year, or while loading", () => {
    const states: Array<Partial<AgriRegionState>> = [
      { connectionStatus: "connecting" },
      { currentFilters: { ...FILTERS, yil: "" } },
      { regionalLoading: true },
    ];
    for (const state of states) {
      const { container } = mount(state);
      expect(container.querySelector("[data-testid=loader]")).toBeTruthy();
    }
  });

  it("shows the connection error or a localized fallback", () => {
    const { container } = mount({ connectionStatus: "failed", regionalError: "Connection error: x" });
    expect(container.textContent).toContain("Connection error: x");
    const fallback = mount({ connectionStatus: "failed", language: "en" });
    expect(fallback.container.textContent).toContain("Could not connect to the map.");
  });

  it("shows a reload button that refetches on a load error", () => {
    const fetchRegionalData = jest.fn();
    const { getByText } = mount({ regionalError: "Failed" }, { fetchRegionalData });
    fireEvent.click(getByText("Qayta yuklash"));
    expect(fetchRegionalData).toHaveBeenCalled();
  });

  it("shows the empty state when the current list has no rows", () => {
    const { container } = mount({ regionalData: { viloyatlar: [], tumanlar: [], totalArea: 0 } });
    expect(container.querySelector(".agri-v11-regional-stats-no-data")).toBeTruthy();
  });

  it("renders viloyat rows sorted by value desc with translated names and the unit", () => {
    const { container, host } = mount();
    const names = Array.from(container.querySelectorAll(".agri-v11-regional-stats-chart-scroll button")).map(
      (b) => b.textContent ?? "",
    );
    expect(names.join(" ")).toMatch(/Buxoro\|uz_lat\|region[\s\S]*Andijon\|uz_lat\|region/);
    expect(container.textContent).toContain("#90");
    expect(container.textContent).toContain("ga");
    expect(container.querySelector(".agri-v11-regional-stats-header-title")?.textContent).toBe("Viloyatlar kesimida");
    expect(screen.queryByLabelText("Orqaga")).toBeNull();
    const firstRow = container.querySelector(".agri-v11-regional-stats-chart-scroll button") as HTMLElement;
    fireEvent.click(firstRow);
    expect(host.handleBarRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: "Buxoro viloyati", maydon: 90 }));
  });

  it("limits tuman rows to the display count, sorts ascending and shows back + count pills", () => {
    const { container, host } = mount({
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon viloyati",
      sortMode: "value_asc",
    });
    const rows = container.querySelectorAll(".agri-v11-regional-stats-chart-scroll button");
    expect(rows.length).toBe(2);
    expect((rows[0].textContent ?? "")).toContain("Baliqchi|uz_lat|district");
    expect(container.querySelector(".agri-v11-regional-stats-header-title")?.textContent).toBe(
      "Andijon|uz_lat|region - tumanlar kesimida",
    );
    fireEvent.click(screen.getByLabelText("Orqaga"));
    expect(host.navigateBack).toHaveBeenCalled();
    const menu = screen.getByRole("listbox");
    const pills = within(menu).getAllByRole("option");
    fireEvent.click(pills[0]);
    expect(host.handleDisplayCountPillClick).toHaveBeenCalledWith(3);
    expect(pills.map((p) => p.getAttribute("aria-selected"))).toEqual(["false", "true"]);
  });

  it("cycles sort mode and labels the sort button for the current mode and language", () => {
    const { host } = mount({ sortMode: "value_asc", language: "ru" });
    const button = screen.getByLabelText("По возрастанию");
    fireEvent.click(button);
    expect(host.cycleSortMode).toHaveBeenCalled();
    const en = mount({ language: "en" });
    expect(within(en.container).getByLabelText("Descending")).toBeTruthy();
  });

  it("renders the data source and map view wiring", () => {
    const host = makeStubHost({ currentFilters: FILTERS, regionalData: DATA }, { calculateDynamicYAxisWidth: () => 90 });
    host.props = {
      ...host.props,
      useDataSources: [{ dataSourceId: "ds-1" }],
      useMapWidgetIds: ["map-1"],
    } as unknown as RegionWidgetHost["props"];
    const { getByTestId } = render(<div>{renderPanel(host)}</div>);
    expect(getByTestId("ds").getAttribute("data-id")).toBe("ds-1");
    expect(getByTestId("mapview").getAttribute("data-id")).toBe("map-1");
  });

  it("renders the cursor tooltip only when visible with data and applies theme/size", () => {
    const hidden = mount();
    expect(hidden.container.querySelector(".agri-v11-regional-tooltip")).toBeNull();
    const shown = mount({
      cursorTooltip: { visible: true, data: { name: "A", maydon: 1 } },
      isDarkTheme: true,
      widgetSize: "lg",
    });
    expect(shown.container.textContent).toContain("TIP");
    const card = shown.container.querySelector(".agri-v11-regional-stats-card") as HTMLElement;
    expect(card.className).toContain("agri-v11-region-dark");
    expect(card.getAttribute("data-region-size")).toBe("lg");
  });
});

describe("RegionPanel render labels per language", () => {
  type Lang = AgriRegionState["language"];
  const EXPECTED: Record<
    string,
    {
      viloyat: string;
      tumanSuffix: string;
      unit: string;
      asc: string;
      desc: string;
      back: string;
      count: string;
      retry: string;
      fallback: string;
    }
  > = {
    en: {
      viloyat: "By regions",
      tumanSuffix: "by districts",
      unit: "ha",
      asc: "Ascending",
      desc: "Descending",
      back: "Back",
      count: "Row count",
      retry: "Reload",
      fallback: "Could not connect to the map.",
    },
    ru: {
      viloyat: "Статистика по областям",
      tumanSuffix: "по районам",
      unit: "га",
      asc: "По возрастанию",
      desc: "По убыванию",
      back: "Назад",
      count: "Количество строк",
      retry: "Перезагрузить",
      fallback: "Не удалось подключиться к карте.",
    },
    uz_lat: {
      viloyat: "Viloyatlar kesimida",
      tumanSuffix: "tumanlar kesimida",
      unit: "ga",
      asc: "O'sish",
      desc: "Kamayish",
      back: "Orqaga",
      count: "Qatorlar soni",
      retry: "Qayta yuklash",
      fallback: "Xaritaga ulana olmadik.",
    },
    uz_cyr: {
      viloyat: "Вилоят кесимида",
      tumanSuffix: "туманлар кесимида",
      unit: "га",
      asc: "Ўсиш",
      desc: "Камайиш",
      back: "Орқага",
      count: "Қаторлар сони",
      retry: "Қайта юкла",
      fallback: "Харитага улана олмадик.",
    },
  };

  it.each(Object.keys(EXPECTED))("renders exact viloyat-view text in %s", (lang) => {
    const e = EXPECTED[lang];
    const { container } = mount({ language: lang as Lang });
    expect(container.querySelector(".agri-v11-regional-stats-header-title")?.textContent).toBe(e.viloyat);
    expect(container.textContent).toContain(e.unit);
    expect(container.querySelector(".agri-v11-regional-stats-sort-button")?.getAttribute("aria-label")).toBe(e.desc);
    expect(container.querySelector(".agri-v11-regional-stats-sort-button")?.getAttribute("title")).toBe(e.desc);
  });

  it.each(Object.keys(EXPECTED))("renders exact tuman-view text in %s", (lang) => {
    const e = EXPECTED[lang];
    const { container } = mount({
      language: lang as Lang,
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon viloyati",
      sortMode: "value_asc",
    });
    expect(container.querySelector(".agri-v11-regional-stats-header-title")?.textContent).toBe(
      `Andijon|${lang}|region - ${e.tumanSuffix}`,
    );
    const sort = container.querySelector(".agri-v11-regional-stats-sort-button");
    expect(sort?.getAttribute("aria-label")).toBe(e.asc);
    expect(sort?.getAttribute("title")).toBe(e.asc);
    const back = container.querySelector(".agri-v11-regional-stats-back-button");
    expect(back?.getAttribute("aria-label")).toBe(e.back);
    expect(back?.getAttribute("title")).toBe(e.back);
    expect(container.querySelector("[role=listbox]")?.getAttribute("aria-label")).toBe(e.count);
  });

  it.each(Object.keys(EXPECTED))("renders exact error texts in %s", (lang) => {
    const e = EXPECTED[lang];
    const failed = mount({ language: lang as Lang, connectionStatus: "failed" });
    expect(failed.container.querySelector(".agri-v11-regional-stats-error p")?.textContent).toBe(e.fallback);
    const errored = mount({ language: lang as Lang, regionalError: "Boom" });
    expect(errored.container.querySelector(".agri-v11-regional-stats-error button")?.textContent).toBe(e.retry);
  });
});
