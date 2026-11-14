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

describe("characterization: markup is stable across refactors", () => {
  const LANGS = ["en", "ru", "uz_lat", "uz_cyr"] as const;
  const crypto = require("crypto") as typeof import("crypto");
  const hash = (html: string): string => crypto.createHash("md5").update(html).digest("hex");
  const chartCfg = (over: Partial<Config> = {}): Config =>
    ({ chartEnabled: true, chartFields: ["a", "b", "c"], chartType: "bar", chartTitle: "T", ...over }) as Config;
  const attrs: PopupAttributes = { a: 10, b: "20", c: "abc", d: "x", e: "", f: 3 };
  const attachments = [
    { id: 1, name: "p.png", url: "u1", previewObjectUrl: "blob:1", contentType: "image/png", size: 2048 },
    { id: 2, name: "", url: "u2", contentType: "application/pdf", size: 0 },
  ] as unknown as AttachmentItem[];
  const base = { showPopup: true, selectedAttrs: attrs };
  const cfg: Config = { fieldsToShow: ["d", "e", "f"], ...chartCfg() } as Config;

  type Case = [string, (lang: (typeof LANGS)[number]) => React.ReactNode | null];
  const cases: Case[] = [
    ["chart-collapsed", (l) => renderChart(makeHost({ selectedAttrs: attrs, currentLang: l }, chartCfg()))],
    ["chart-bar-hover", (l) => renderChart(makeHost({ selectedAttrs: attrs, currentLang: l, chartExpanded: true, chartHoverIndex: 1 }, chartCfg()))],
    ["chart-line-light", (l) => renderChart(makeHost({ selectedAttrs: attrs, currentLang: l, chartExpanded: true, chartHoverIndex: 0, isDarkTheme: false }, chartCfg({ chartType: "line" })))],
    ["chart-pinned", (l) => renderChart(makeHost({ selectedAttrs: attrs, currentLang: l, pinToCorner: true }, chartCfg()))],
    ["popup-minimized", (l) => renderPopup(makeHost({ ...base, currentLang: l, popupMinimized: true }, cfg))],
    ["popup-full", (l) => renderPopup(makeHost({ ...base, currentLang: l, attachments, chartExpanded: true, latestIndexValues: { ndvi: 0.5 } as never }, cfg))],
    ["popup-pinned-pos", (l) => renderPopup(makeHost({ ...base, currentLang: l, pinToCorner: true, popupPosition: { x: 5, y: 6 } as never }, cfg))],
    ["popup-error-loading", (l) => renderPopup(makeHost({ showPopup: true, currentLang: l, error: "boom", loading: true, loadingAttachments: true }, cfg))],
    ["popup-no-selection", (l) => renderPopup(makeHost({ showPopup: true, currentLang: l, attachmentsError: "err" }, {}))],
    ["popup-no-fields", (l) => renderPopup(makeHost({ ...base, currentLang: l }, {}))],
    ["popup-empty-values", (l) => renderPopup(makeHost({ showPopup: true, currentLang: l, selectedAttrs: { d: "" } }, { fieldsToShow: ["d"], settings: { showAttachments: false } } as Config))],
  ];
  const rows = cases.flatMap(([name, fn]) => LANGS.map((l) => [`${name}:${l}`, name, l] as const));
  const EXPECTED: Record<string, string> = {
  "chart-collapsed:en": "41fd3f90b7c58867e1fec75fee083bdb",
  "chart-collapsed:ru": "41fd3f90b7c58867e1fec75fee083bdb",
  "chart-collapsed:uz_lat": "41fd3f90b7c58867e1fec75fee083bdb",
  "chart-collapsed:uz_cyr": "41fd3f90b7c58867e1fec75fee083bdb",
  "chart-bar-hover:en": "35ae884574a23455e964116ae44fbf50",
  "chart-bar-hover:ru": "35ae884574a23455e964116ae44fbf50",
  "chart-bar-hover:uz_lat": "35ae884574a23455e964116ae44fbf50",
  "chart-bar-hover:uz_cyr": "35ae884574a23455e964116ae44fbf50",
  "chart-line-light:en": "a97061d1fe7510ab52e8d9d3364f2b1f",
  "chart-line-light:ru": "a97061d1fe7510ab52e8d9d3364f2b1f",
  "chart-line-light:uz_lat": "a97061d1fe7510ab52e8d9d3364f2b1f",
  "chart-line-light:uz_cyr": "a97061d1fe7510ab52e8d9d3364f2b1f",
  "chart-pinned:en": "19a0bb27d8b58e63736c4045c4f19be1",
  "chart-pinned:ru": "19a0bb27d8b58e63736c4045c4f19be1",
  "chart-pinned:uz_lat": "19a0bb27d8b58e63736c4045c4f19be1",
  "chart-pinned:uz_cyr": "19a0bb27d8b58e63736c4045c4f19be1",
  "popup-minimized:en": "2f94ca324b83e08511007a43e2c4ebd4",
  "popup-minimized:ru": "f71d9bcc0668617ffbf791b9e36eefa5",
  "popup-minimized:uz_lat": "3282807f74aea1a684d7e23a1a88ab8a",
  "popup-minimized:uz_cyr": "9fba21477117592ab7df6d631e220742",
  "popup-full:en": "13aba18a02f262bf18a27bfdbfd864d1",
  "popup-full:ru": "c19284815b0e7c6028136f17c3f38075",
  "popup-full:uz_lat": "8841684b115403b90f214894b62989f7",
  "popup-full:uz_cyr": "3af71bf0d0a4f30feed7860b013183c1",
  "popup-pinned-pos:en": "459be6d2a4d49cb796e141ce07a81ef4",
  "popup-pinned-pos:ru": "6b1b7a9e10915980c39cedc0ebe6f647",
  "popup-pinned-pos:uz_lat": "c15b9573d148df08a2590345993b0043",
  "popup-pinned-pos:uz_cyr": "fba8b566d9f8356b10c85178bacae87b",
  "popup-error-loading:en": "a39259063c5a080dbd9262b64e327d5f",
  "popup-error-loading:ru": "00448b04e33adb7f1fe24b7d92da5faf",
  "popup-error-loading:uz_lat": "571cd8c0eb069585f1023eaa2e85b202",
  "popup-error-loading:uz_cyr": "cf2ec3b48752db306e6aaef5ef55b531",
  "popup-no-selection:en": "564275a883c462e6b93d424c61c170cf",
  "popup-no-selection:ru": "a9e60527e718f3763763d8ccb8df7802",
  "popup-no-selection:uz_lat": "ad673eca39480a549d624a9998326f0d",
  "popup-no-selection:uz_cyr": "f894c4ba1cea73f84fd8e462b140d3e0",
  "popup-no-fields:en": "a12d03378ff9a04c9f30bf5a2f867c69",
  "popup-no-fields:ru": "7ba8ee6a224431968aa239aa15b69639",
  "popup-no-fields:uz_lat": "24f1eba4c5f54bd04bf9be219e271625",
  "popup-no-fields:uz_cyr": "ab8c2da01ef095a8aa98f324afb06e7d",
  "popup-empty-values:en": "c14d71b9434942f6bd5ba43f187b010b",
  "popup-empty-values:ru": "be9c802dbd9144d41e64c42b68fe98dc",
  "popup-empty-values:uz_lat": "d52740db081161f4fccef28c0ddac67c",
  "popup-empty-values:uz_cyr": "f517f6a26dbc68b2e0135980990ea87f",
  };

  test.each(rows)("%s", (key, name, lang) => {
    const fn = cases.find((c) => c[0] === name)![1];
    const html = require("react-dom/server").renderToStaticMarkup(<div>{fn(lang)}</div>) as string;
    expect(`${key}=${hash(html)}`).toBe(`${key}=${EXPECTED[key]}`);
  });
});
