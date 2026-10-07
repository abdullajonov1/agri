jest.mock("../../../../gis/AgriHiddenConnectors", () => ({
  AgriHiddenConnectors: (props: { useMapWidgetIds?: unknown }) => (
    <div data-testid="connectors" data-map={String(props.useMapWidgetIds)} />
  ),
}));

import { React } from "jimu-core";
import { fireEvent, render as rtlRender } from "@testing-library/react";
import { makePopupHost } from "../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../popup-host";
import type { AttachmentItem, Config, PopupAttributes, State } from "../popup-types";
import * as field from "./field-handlers";
import {
  render,
  renderChart,
  renderChartIcon,
  renderLatestIndices,
  renderPopup,
} from "./render-panel";

type StatePatch = Partial<State>;

const makeHost = (state: StatePatch = {}, config: Config = {}, over: Partial<PopupWidgetHost> = {}): PopupWidgetHost => {
  const h = makePopupHost(state, { config }).host;
  const bind = <A extends unknown[], R>(fn: (host: PopupWidgetHost, ...a: A) => R) => (...a: A): R => fn(h, ...a);
  Object.assign(h, {
    getFieldAlias: (n: string) => `alias:${n}`,
    formatValue: (n: string, v: unknown) => `fmt:${n}=${String(v)}`,
    niceChartMax: bind(field.niceChartMax),
    formatChartTick: bind(field.formatChartTick),
    formatChartTooltipValue: bind(field.formatChartTooltipValue),
    buildRoundedBarPath: bind(field.buildRoundedBarPath),
    buildSmoothLinePath: bind(field.buildSmoothLinePath),
    bytesToSize: bind(field.bytesToSize),
    renderChartIcon: (t?: "bar" | "line") => renderChartIcon(h, t),
    renderLatestIndices: () => renderLatestIndices(h),
    renderChart: () => renderChart(h),
    renderPopup: () => renderPopup(h),
    setChartHover: jest.fn(),
    clearChartHover: jest.fn(),
    toggleChartExpanded: jest.fn(),
    togglePinToCorner: jest.fn(),
    minimizePopup: jest.fn(),
    expandPopup: jest.fn(),
    onPopupHeaderMouseDown: jest.fn(),
    onDataSourceCreated: jest.fn(),
    onActiveViewChange: jest.fn(),
    getMapAreaRect: jest.fn(() => ({ right: 900, top: 50 }) as DOMRect),
    getPopupDimensions: jest.fn(() => ({ width: 320, height: 480 })),
    resolveFieldName: (n: string) => n,
    ...over,
  });
  return h;
};

const show = (el: React.ReactNode | null): HTMLElement => rtlRender(<div>{el}</div>).container;

describe("renderLatestIndices", () => {
  test("shows blocking loader while loading without values", () => {
    const c = show(renderLatestIndices(makeHost({ loadingLatestIndices: true })));
    expect(c.querySelector('[role="status"]')).not.toBeNull();
    expect(c.querySelector(".agri3-indices-date")).toBeNull();
  });

  test("lists only present indices with 4 decimals and the date", () => {
    const c = show(renderLatestIndices(makeHost({ latestIndexDate: "2025-06-01", latestIndexValues: { ndvi: 0.5, evi: 1.23456 } })));
    expect(c.querySelector(".agri3-indices-date")?.textContent).toContain("2025-06-01");
    const rows = Array.from(c.querySelectorAll(".agri3-index-row")).map((r) => r.textContent);
    expect(rows).toEqual(expect.arrayContaining(["NDVI0.5000", "EVI1.2346"]));
    expect(rows).toHaveLength(2);
  });

  test("keeps values with a refresh loader and hides date while refreshing", () => {
    const c = show(renderLatestIndices(makeHost({ loadingLatestIndices: true, latestIndexDate: "d", latestIndexValues: { ndvi: 1 } })));
    expect(c.querySelector(".agri3-indices-body--loading")).not.toBeNull();
    expect(c.querySelector('[role="status"]')).not.toBeNull();
    expect(c.querySelector(".agri3-indices-date")).toBeNull();
  });

  test("shows placeholder when nothing is available", () => {
    const c = show(renderLatestIndices(makeHost()));
    expect(c.querySelector(".agri3-status-waiting")?.textContent).toBeTruthy();
  });
});

describe("renderChart", () => {
  const chartConfig = (over: Partial<Config> = {}): Config => ({
    chartEnabled: true,
    chartFields: ["a", "b", "c"],
    chartType: "bar",
    ...over,
  } as Config);
  const attrs: PopupAttributes = { a: 10, b: "20", c: "abc" };

  test("renders nothing when disabled, without attributes, fields or numeric data", () => {
    expect(renderChart(makeHost({ selectedAttrs: attrs }, {}))).toBeNull();
    expect(renderChart(makeHost({}, chartConfig()))).toBeNull();
    expect(renderChart(makeHost({ selectedAttrs: attrs }, chartConfig({ chartFields: [] })))).toBeNull();
    expect(renderChart(makeHost({ selectedAttrs: { a: "x" } }, chartConfig()))).toBeNull();
  });

  test("collapsed (unpinned) shows trigger which toggles expansion", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: false, chartExpanded: false }, chartConfig({ chartTitle: "My chart" }));
    const c = show(renderChart(h));
    const btn = c.querySelector(".agri3-chart-trigger") as HTMLButtonElement;
    expect(btn.textContent).toContain("My chart");
    fireEvent.click(btn);
    expect(h.toggleChartExpanded).toHaveBeenCalled();
    expect(c.querySelector("svg.agri3-chart-svg")).toBeNull();
  });

  test("falls back to first data label as title", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: false }, chartConfig());
    expect(show(renderChart(h)).querySelector(".agri3-chart-trigger-label")?.textContent).toBe("alias:a");
  });

  test("expanded bar chart draws one bar per numeric field (NaN skipped) and wires hover", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: false, chartExpanded: true }, chartConfig());
    const c = show(renderChart(h));
    const bars = c.querySelectorAll("path.agri3-chart-bar");
    expect(bars).toHaveLength(2);
    expect(bars[0].getAttribute("d")).toMatch(/^M/);
    fireEvent.mouseEnter(bars[1]);
    expect(h.setChartHover).toHaveBeenCalledWith(1);
    fireEvent.mouseLeave(c.querySelector(".agri3-chart-body") as HTMLElement);
    expect(h.clearChartHover).toHaveBeenCalled();
    fireEvent.click(c.querySelector("button.agri3-chart-panel-header") as HTMLElement);
    expect(h.toggleChartExpanded).toHaveBeenCalled();
    expect(c.querySelectorAll("text")).toHaveLength(5);
  });

  test("hovered bar shows tooltip and dims other bars", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: false, chartExpanded: true, chartHoverIndex: 0 }, chartConfig());
    const c = show(renderChart(h));
    expect(c.querySelector(".agri3-chart-tooltip-label")?.textContent).toBe("alias:a");
    expect(c.querySelector(".agri3-chart-tooltip-value")?.textContent).toBe("10");
    const bars = c.querySelectorAll("path.agri3-chart-bar");
    expect(bars[0].getAttribute("opacity")).toBe("1");
    expect(bars[1].getAttribute("opacity")).toBe("0.45");
  });

  test("pinned chart is always expanded with a static header", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: true, chartExpanded: false }, chartConfig());
    const c = show(renderChart(h));
    expect(c.querySelector(".agri3-chart-panel-header--static")).not.toBeNull();
    expect(c.querySelector("button.agri3-chart-panel-header")).toBeNull();
    expect(c.querySelector("svg.agri3-chart-svg")).not.toBeNull();
  });

  test("line chart renders a path and points, including single-point layout", () => {
    const h = makeHost({ selectedAttrs: attrs, pinToCorner: true, chartHoverIndex: 1, isDarkTheme: false }, chartConfig({ chartType: "line" }));
    const c = show(renderChart(h));
    expect(c.querySelectorAll("circle.agri3-chart-point")).toHaveLength(2);
    expect(c.querySelectorAll("svg path")[0].getAttribute("d")).toMatch(/^M/);
    fireEvent.mouseEnter(c.querySelector("circle.agri3-chart-point") as Element);
    expect(h.setChartHover).toHaveBeenCalledWith(0);
    expect(c.querySelector(".agri3-chart-tooltip-label")?.textContent).toBe("alias:b");

    const single = makeHost({ selectedAttrs: { a: 5 }, pinToCorner: true }, chartConfig({ chartType: "line", chartFields: ["a"] }));
    expect(show(renderChart(single)).querySelectorAll("circle.agri3-chart-point")).toHaveLength(1);
  });
});

describe("renderChartIcon", () => {
  test("renders distinct icons for line and bar", () => {
    const h = makeHost();
    const line = show(renderChartIcon(h, "line")).querySelector("svg");
    const bar = show(renderChartIcon(h)).querySelector("svg");
    expect(line).not.toBeNull();
    expect(bar).not.toBeNull();
    expect(line?.outerHTML).not.toBe(bar?.outerHTML);
  });
});

describe("renderPopup", () => {
  const open = (state: StatePatch = {}, config: Config = {}, over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
    makeHost({ showPopup: true, ...state }, config, over);

  test("renders nothing while hidden", () => {
    expect(renderPopup(makeHost({ showPopup: false }))).toBeNull();
  });

  test("minimized state shows a chip positioned from the map rect that expands on click", () => {
    const h = open({ popupMinimized: true, jimuMapView: { view: {} } as never });
    const c = show(renderPopup(h));
    const chip = c.querySelector(".agri3-popup-minimized") as HTMLElement;
    expect(chip.style.top).toBe("70px");
    expect(chip.style.right).toBe(`${Math.max(8, window.innerWidth - 900 + 20)}px`);
    fireEvent.click(c.querySelector(".agri3-popup-minimized-btn") as HTMLElement);
    expect(h.expandPopup).toHaveBeenCalledTimes(1);
  });

  test("minimized chip without map view falls back to fixed inset", () => {
    const h = open({ popupMinimized: true, pinToCorner: false });
    const chip = show(renderPopup(h)).querySelector(".agri3-popup-minimized") as HTMLElement;
    expect(chip.className).toContain("is-floating");
    expect(chip.style.top).toBe("20px");
    expect(chip.style.right).toBe("20px");
  });

  test("lists configured fields that have values and hides empty ones", () => {
    const h = open(
      { selectedAttrs: { a: 1, b: "", c: "  ", d: null, e: "x" }, pinToCorner: true, popupPosition: { x: 5, y: 6 } },
      { fieldsToShow: ["a", "b", "c", "d", "e", "missing"] } as Config,
    );
    const c = show(renderPopup(h));
    const rows = Array.from(c.querySelectorAll(".agri3-field-list:not(.agri3-indices-list) .agri3-field-row")).map((r) => r.textContent);
    expect(rows).toEqual(["alias:afmt:a=1", "alias:efmt:e=x"]);
    const popup = c.querySelector(".agri3-popup-direct") as HTMLElement;
    expect(popup.className).toContain("is-pinned");
    expect(popup.style.left).toBe("5px");
    expect(popup.style.width).toBe("320px");
  });

  test("floating popup without position is centred", () => {
    const h = open({ selectedAttrs: { a: 1 }, pinToCorner: false, popupPosition: null }, { fieldsToShow: ["a"] } as Config);
    const popup = show(renderPopup(h)).querySelector(".agri3-popup-direct") as HTMLElement;
    expect(popup.style.transform).toBe("translate(-50%, -50%)");
    expect(popup.style.left).toBe("50%");
  });

  test("header buttons call pin and minimize handlers", () => {
    const h = open({ pinToCorner: true });
    const c = show(renderPopup(h));
    const pin = c.querySelector(".agri3-popup-pin") as HTMLElement;
    expect(pin.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(pin);
    fireEvent.click(c.querySelector(".agri3-popup-close") as HTMLElement);
    fireEvent.mouseDown(c.querySelector(".agri3-popup-header") as HTMLElement);
    expect(h.togglePinToCorner).toHaveBeenCalled();
    expect(h.minimizePopup).toHaveBeenCalled();
    expect(h.onPopupHeaderMouseDown).toHaveBeenCalled();
  });

  test("status messages for no configured fields, no data and no selection", () => {
    const noFields = show(renderPopup(open({ selectedAttrs: { a: 1 } }, { fieldsToShow: [] } as Config)));
    expect(noFields.textContent).toContain("No fields configured");
    const noData = show(renderPopup(open({ selectedAttrs: { a: "" } }, { fieldsToShow: ["a"] } as Config)));
    expect(noData.querySelectorAll(".agri3-status-waiting").length).toBeGreaterThan(0);
    const empty = show(renderPopup(open({ selectedAttrs: null })));
    expect(empty.querySelectorAll(".agri3-status-waiting").length).toBeGreaterThan(0);
    const withError = show(renderPopup(open({ selectedAttrs: null, error: "Boom" })));
    expect(withError.querySelector(".agri3-error-message")?.textContent).toBe("Boom");
  });

  test("loading hides attribute lists and shows loader", () => {
    const c = show(renderPopup(open({ loading: true, selectedAttrs: { a: 1 } }, { fieldsToShow: ["a"] } as Config)));
    expect(c.querySelector(".agri3-loading-container")).not.toBeNull();
    expect(c.querySelector(".agri3-indices-list")).toBeNull();
  });

  test("attachment states: disabled, loading, error, empty", () => {
    const off = show(renderPopup(open({}, { settings: { showAttachments: false } } as Config)));
    expect(off.querySelector(".agri3-attachments")).toBeNull();
    const loading = show(renderPopup(open({ loadingAttachments: true })));
    expect(loading.querySelector(".agri3-loading-container--compact")).not.toBeNull();
    const err = show(renderPopup(open({ attachmentsError: "net down" })));
    expect(err.querySelector('[title="net down"]')).not.toBeNull();
    const none = show(renderPopup(open({})));
    expect(none.querySelector(".agri3-attachments-body")).toBeNull();
    expect(none.querySelectorAll(".agri3-status-waiting").length).toBeGreaterThan(0);
  });

  test("attachments split into image thumbnails and file cards", () => {
    const attachments = [
      { id: 1, name: "photo.jpg", url: "http://x/1", contentType: "image/jpeg", size: 10, previewObjectUrl: "blob:1" },
      { id: 2, name: "doc.pdf", url: "http://x/2", contentType: "application/pdf", size: 2048, previewObjectUrl: null },
      { id: 3, name: "", url: "http://x/3", contentType: "", size: 0, previewObjectUrl: null },
    ] as AttachmentItem[];
    const c = show(renderPopup(open({ attachments })));
    expect(c.querySelector(".agri3-attachments-title")?.textContent).toContain("(3)");
    const thumb = c.querySelector(".agri3-attachment-thumb") as HTMLAnchorElement;
    expect(thumb.getAttribute("href")).toBe("http://x/1");
    expect((thumb.querySelector("img") as HTMLImageElement).getAttribute("src")).toBe("blob:1");
    const files = c.querySelectorAll(".agri3-attachment-file");
    expect(files).toHaveLength(2);
    expect(files[0].querySelector(".agri3-attachment-file-meta")?.textContent).toContain("pdf");
    expect(files[0].querySelector(".agri3-attachment-file-meta")?.textContent).toContain("2.00 KB");
    expect(files[1].querySelector(".agri3-attachment-file-name")?.textContent).toContain("3");
    expect((files[0].querySelector(".agri3-attachment-download") as HTMLAnchorElement).getAttribute("href")).toBe("http://x/2");
  });
});

describe("render", () => {
  test("applies theme class, passes map ids to connectors and reflects readiness", () => {
    const dark = makeHost({ isDarkTheme: true, featureLayers: [] }, {}, { renderPopup: () => <span data-testid="popup" /> as never });
    dark.props = { ...dark.props, useMapWidgetIds: ["m1"] } as never;
    const { container, getByTestId } = rtlRender(<div>{render(dark)}</div>);
    expect(container.querySelector(".agri3-attr-card")?.className).toContain("agri3-theme-dark");
    expect(getByTestId("popup")).not.toBeNull();
    expect(getByTestId("connectors").getAttribute("data-map")).toBe("m1");
    const dot = container.querySelector('div[title]') as HTMLElement;
    expect(dot.style.background).toBe("rgb(148, 163, 184)");

    const lightReady = makeHost({ isDarkTheme: false, featureLayers: [{} as __esri.FeatureLayer] }, {}, { renderPopup: () => null as never });
    const c2 = rtlRender(<div>{render(lightReady)}</div>).container;
    expect(c2.querySelector(".agri3-attr-card")?.className).toContain("agri3-theme-light");
    expect((c2.querySelector("div[title]") as HTMLElement).style.background).toBe("rgb(16, 185, 129)");
  });
});
