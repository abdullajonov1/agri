/**
 * Renders the REAL FieldComparePanel and writes static pages
 * to dist-report/swipe-harness/<state>.html for the browser gate (T10).
 */
import { React } from "jimu-core";
import { act, fireEvent, render } from "@testing-library/react";
import * as fs from "fs";
import * as path from "path";
import FieldComparePanel from "../../src/runtime/field-compare-panel";

// Source uses `import ReactDOM from "react-dom"`; ts-jest emits no default
// interop, so expose the CJS module as `default` for createPortal.
jest.mock("react-dom", () => {
  const actual = jest.requireActual<typeof import("react-dom")>("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("../../src/gis/agri-polygon-api-source", () => ({
  fetchPolygonAvailableDates: jest.fn().mockResolvedValue([]),
}));
jest.mock("../../src/gis/agri-vegetation-overlay-prefetch", () => ({
  getVegetationOverlayContext: () => ({ regionId: 4, year: 2026, lastIndex: "ndvi" }),
}));
let mockStatus: "idle" | "loading" | "ready" | "error" = "ready";

jest.mock("../../src/runtime/field-swipe/swipe-controller", () => ({
  createFieldSwipeController: () => ({
    setCompare: jest.fn(),
    setPosition: jest.fn(),
    retry: jest.fn(),
    destroy: jest.fn(),
    // Each page decides the status the real panel receives.
    subscribe: (listener: (state: { status: typeof mockStatus; position: number }) => void) => {
      listener({ status: mockStatus, position: 50 });
      return () => undefined;
    },
  }),
}));

const OUT_DIR = path.resolve(__dirname, "../../dist-report/swipe-harness");
const WIDGET_SRC = path.resolve(__dirname, "../../src");
const AVAILABLE = ["2026-06-01", "2026-06-10", "2026-06-15", "2026-06-20"];
const MAIN_DATE = "2026-06-01";
const COMPARE_DATE = "2026-06-15";

const cssHref = (file: string): string =>
  path.relative(OUT_DIR, path.join(WIDGET_SRC, file)).split(path.sep).join("/");

const STYLES = [
  "runtime/agri-dashboard.css",
  "runtime/field-swipe/field-swipe.css",
  "shared/agri-dashboard-spinner.css",
];

const PAGE_CSS = `
html,body{margin:0;height:100%;background:#1b1c2a;font-family:system-ui,sans-serif}
html.light-theme body{background:#e8eef2}
.harness-map{position:relative;width:1440px;max-width:100%;height:380px;margin:0 auto;overflow:hidden;
background:linear-gradient(135deg,#7a9a6a 0%,#a7b98a 35%,#8aa7b8 70%,#5e7d94 100%)}
.harness-divider{position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#fff;opacity:.9}
.harness-handle{position:absolute;top:50%;left:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:#fff}
`;

const THEME_SCRIPT = "if(new URLSearchParams(location.search).get('theme')==='light'){document.documentElement.classList.add('light-theme')}";

const page = (title: string, body: string): string => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
${STYLES.map((file) => `<link rel="stylesheet" href="${cssHref(file)}">`).join("\n")}
<style>${PAGE_CSS}</style>
<script>${THEME_SCRIPT}</script></head>
<body><div class="agri-dashboard-map harness-map"><div class="harness-divider"></div><div class="harness-handle"></div>${body}</div></body></html>
`;

const write = (name: string, html: string): void => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${name}.html`), html, "utf8");
};

// The map-view container the date tags portal into; its markup is added to the map box.
const MAP_VIEW_WIDTH = 1440;
let viewHost: HTMLElement;

const renderPanelWithPolygon = (): ReturnType<typeof render> => {
  const view = { container: viewHost, width: MAP_VIEW_WIDTH } as unknown as __esri.MapView;
  const result = render(<FieldComparePanel language="en" view={view} />);
  act(() => {
    document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
      detail: { source: "AgriPopup", polygonMode: true, uniqueid: "{abc}", regionId: 4 },
    }));
    document.dispatchEvent(new CustomEvent("graffDateIndexSelectionChanged", {
      detail: { date: MAIN_DATE, indexKey: "ndvi", availableDates: AVAILABLE, navigable: true },
    }));
  });
  fireEvent.click(result.getByRole("button", { name: "Compare snapshots" }));
  return result;
};

const pickCompareDate = (result: ReturnType<typeof render>): void => {
  fireEvent.click(result.container.querySelector(`[data-date="${COMPARE_DATE}"]`) as HTMLElement);
};

const writeFromPanel = (
  name: string,
  title: string,
  status: typeof mockStatus,
  prepare: (result: ReturnType<typeof render>) => void,
): string => {
  mockStatus = status;
  const result = renderPanelWithPolygon();
  prepare(result);
  const html = page(title, result.container.innerHTML + viewHost.innerHTML);
  result.unmount();
  write(name, html);
  return html;
};

describe("swipe render harness", () => {
  beforeEach(() => {
    viewHost = document.createElement("div");
    document.body.appendChild(viewHost);
  });
  afterEach(() => {
    mockStatus = "ready";
    viewHost.remove();
  });

  test("writes the calendar popover page from the real panel", () => {
    const html = writeFromPanel("popover", "Calendar popover", "idle", () => undefined);
    expect(html).toContain("agri-dashboard-compare-panel is-open");
    expect(html).toContain(`data-date="${COMPARE_DATE}"`);
  });

  test("writes the active page: ready, popover closed", () => {
    const html = writeFromPanel("active", "Swipe active", "ready", pickCompareDate);
    expect(html).toContain("agri-dashboard-compare-button");
    expect(html).toContain("is-active");
    expect(html).not.toContain("agri-dashboard-compare-panel is-open");
    expect(html).toContain("agri-field-swipe-tag--main");
    expect(html).toContain("agri-field-swipe-tag--compare");
  });

  test("writes the loading page", () => {
    const html = writeFromPanel("loading", "Swipe loading", "loading", pickCompareDate);
    expect(html).toContain("is-loading");
    expect(html).not.toContain("agri-field-swipe-tag");
  });

  test("writes the popover error page", () => {
    const html = writeFromPanel("popover-error", "Swipe error", "error", (result) => {
      pickCompareDate(result);
      fireEvent.click(result.container.querySelector(".agri-dashboard-compare-button") as HTMLElement);
    });
    expect(html).toContain("agri-dashboard-compare-panel is-open");
    expect(html).toContain('role="alert"');
    expect(html).toContain("agri-dashboard-compare-retry");
  });
});
