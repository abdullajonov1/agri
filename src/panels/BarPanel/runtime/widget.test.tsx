jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("recharts", () => ({
  ResponsiveContainer: (p: { children?: React.ReactNode; className?: string }): JSX.Element => (
    <div data-testid="rc" className={p.className}>
      {p.children}
    </div>
  ),
  BarChart: (p: { children?: React.ReactNode }): JSX.Element => <div>{p.children}</div>,
  Bar: (): null => null,
  XAxis: (): null => null,
  YAxis: (): null => null,
}));
jest.mock("../../../shared/AgriChartLoader", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="loader" />,
}));
const mockLog = jest.fn();
jest.mock("../../../gis/agri-debug-log", () => ({
  agroV5Log: (...a: unknown[]): void => {
    mockLog(...a);
  },
}));

type FilterHandler = (e: Event) => void;
const mockBound: { handler: FilterHandler | null; unbind: jest.Mock } = { handler: null, unbind: jest.fn() };
jest.mock("../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: FilterHandler): (() => void) => {
    mockBound.handler = h;
    return mockBound.unbind;
  },
}));

import { act, fireEvent, render, screen } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriBar from "./widget";

type Props = AllWidgetProps<Record<string, unknown>> & {
  externalFilters?: { tuman?: string; viloyat?: string; yil?: string; tur?: string };
};

const CATEGORIES = [
  { category: "2-Yaxshi", count: 300, color: "#0f0", order: 2 },
  { category: "1-Juda yaxshi", count: 700, color: "", order: 1 },
  { category: "9-Other", count: 0, color: "#00f", order: 3 },
];

const send = (detail: Record<string, unknown>): void => {
  act(() => {
    mockBound.handler?.(new CustomEvent("masterFilterChanged", { detail }));
  });
};

const full = (filters: Record<string, unknown> = {}, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  filters: { yil: "2024", viloyat: "Andijon", language: "uz_lat", ...filters },
  vhBarData: { categories: CATEGORIES, totalCount: 1000 },
  ...extra,
});

const mount = (props: Partial<Props> = {}) =>
  render(<AgriBar {...({ ...props } as unknown as Props)} />);

describe("AgriBar", () => {
  beforeEach(() => {
    mockBound.handler = null;
    mockBound.unbind = jest.fn();
    mockLog.mockClear();
    localStorage.clear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the loader until a year arrives", () => {
    mount();
    expect(screen.getByTestId("loader")).toBeTruthy();
  });

  it("renders sorted category columns with localized labels and counts", () => {
    mount();
    send(full());
    const buttons = screen.getAllByRole("listitem");
    expect(buttons.map((b) => b.querySelector(".agri-status-label")?.textContent)).toEqual([
      "A'lo",
      "Yaxshi",
      "9-Other",
    ]);
    expect(buttons[0].querySelector(".agri-status-value")?.textContent).toContain("700");
    expect(buttons[0].querySelector(".agri-status-value")?.textContent).toContain("ga");
    expect(screen.getByText("Vegetatsiya Holati")).toBeTruthy();
  });

  it.each([
    ["en", "Excellent", "Good", "Moderate", "Poor", "ha"],
    ["ru", "Очень хороший", "Хороший", "Средний", "Низкий", "га"],
    ["uz_cyr", "Жуда яхши", "Яхши", "Ўрта", "Паст", "га"],
  ] as const)("localizes categories for %s", (lang, a, b, c, d, unit) => {
    mount();
    send({
      filters: { yil: "2024", viloyat: "A", language: lang },
      vhBarData: {
        categories: [
          { category: "1-Juda yaxshi", count: 1, color: "#1", order: 1 },
          { category: "2-Yaxshi", count: 1, color: "#2", order: 2 },
          { category: "3-O'rta", count: 1, color: "#3", order: 3 },
          { category: "4-Past", count: 1, color: "#4", order: 4 },
        ],
        totalCount: 4,
      },
    });
    const labels = screen.getAllByRole("listitem").map((x) => x.querySelector(".agri-status-label")?.textContent);
    expect(labels).toEqual([a, b, c, d]);
    expect(screen.getAllByRole("listitem")[0].textContent).toContain(unit);
  });

  it("shows the empty state after a real fetch returns no categories", () => {
    mount();
    send({ filters: { yil: "2024" }, vhBarData: { categories: [], totalCount: 0 } });
    expect(document.querySelector(".construction-years-no-data")).toBeTruthy();
  });

  it("keeps the spinner while pending and paints progressive totals", () => {
    mount();
    send({ ...full(), vhBarDataPending: true });
    expect(screen.getAllByRole("listitem").length).toBe(3);
    expect(document.querySelector(".agri-status-root--loading")).toBeTruthy();
    expect((screen.getAllByRole("listitem")[0] as HTMLButtonElement).disabled).toBe(true);
    send({ filters: { yil: "2024" }, vhBarDataPending: true });
    send(full());
    expect(document.querySelector(".agri-status-root--loading")).toBeNull();
  });

  it("ignores events without filters", () => {
    mount();
    send({});
    expect(screen.getByTestId("loader")).toBeTruthy();
  });

  it("disables selection and explains why when no region is selected", () => {
    mount();
    send(full({ viloyat: "" }));
    const root = document.querySelector(".agri-status-root") as HTMLElement;
    expect(root.getAttribute("aria-disabled")).toBe("true");
    expect(root.getAttribute("title")).toContain("Viloyatni tanlang");
    expect((screen.getAllByRole("listitem")[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("uses the locked viloyat from scope to enable the chart", () => {
    mount();
    send(full({ viloyat: "" }, { scope: { lockedViloyat: "Locked" } }));
    expect((screen.getAllByRole("listitem")[0] as HTMLButtonElement).disabled).toBe(false);
  });

  it("clicking a column selects it and broadcasts only the VH after the debounce", () => {
    mount();
    send(full());
    const received: Array<Record<string, unknown>> = [];
    const listener = (e: Event): void => {
      received.push((e as CustomEvent<Record<string, unknown>>).detail);
    };
    document.addEventListener("widgetSelectionChanged", listener);
    const first = screen.getAllByRole("listitem")[0];
    fireEvent.click(first);
    fireEvent.click(first);
    fireEvent.click(first);
    expect(received).toHaveLength(0);
    act(() => {
      jest.advanceTimersByTime(60);
    });
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(received).toEqual([{ source: "AgriBar", vh: "1-Juda yaxshi", language: "uz_lat" }]);
    expect(first.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("listitem")[1].className).toContain("agri-status-col--dimmed");
    expect(mockLog).toHaveBeenCalledWith("bar:vh-click", expect.any(Object), "vh");
  });

  it("clicking the selected column again clears the selection", () => {
    mount();
    send(full({ vh: "1-Juda yaxshi" }));
    const first = screen.getAllByRole("listitem")[0];
    expect(first.getAttribute("aria-pressed")).toBe("true");
    const received: Array<Record<string, unknown>> = [];
    const listener = (e: Event): void => {
      received.push((e as CustomEvent<Record<string, unknown>>).detail);
    };
    document.addEventListener("widgetSelectionChanged", listener);
    fireEvent.click(first);
    act(() => {
      jest.advanceTimersByTime(60);
    });
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(received[0].vh).toBe("");
    expect(first.getAttribute("aria-pressed")).toBe("false");
  });

  it("supports keyboard activation with Enter and Space only", () => {
    mount();
    send(full());
    const first = screen.getAllByRole("listitem")[0];
    fireEvent.keyDown(first, { key: "a" });
    expect(first.getAttribute("aria-pressed")).toBe("false");
    fireEvent.keyDown(first, { key: "Enter" });
    expect(first.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(first, { key: " " });
    expect(first.getAttribute("aria-pressed")).toBe("false");
  });

  it("derives a single crop and reads the VH selection from the master filter", () => {
    mount();
    send(full({ turlar: ["Bugdoy"], tuman: "Asaka", vh: "2-Yaxshi" }));
    expect(screen.getAllByRole("listitem")[1].getAttribute("aria-pressed")).toBe("true");
  });

  it("resets everything on resetAllFilters", () => {
    mount();
    send(full());
    act(() => {
      document.dispatchEvent(new Event("resetAllFilters"));
    });
    expect(screen.getByTestId("loader")).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("reads the saved theme and reacts to theme toggles", () => {
    localStorage.setItem("agri_v11_app_theme", "dark");
    const { container } = mount();
    expect((container.firstChild as HTMLElement).className).toContain("dark-theme");
    act(() => {
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { isDarkTheme: false } }));
    });
    expect((container.firstChild as HTMLElement).className).toContain("light-theme");
    act(() => {
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: {} }));
    });
    expect((container.firstChild as HTMLElement).className).toContain("light-theme");
  });

  it("accepts external filters on mount and on prop change", () => {
    const { rerender } = mount({ externalFilters: { viloyat: "A", yil: "2023" } });
    expect(screen.getByTestId("loader")).toBeTruthy();
    send({ filters: { yil: "2023", viloyat: "" }, vhBarData: { categories: CATEGORIES, totalCount: 1000 } });
    rerender(<AgriBar {...({ externalFilters: { viloyat: " B ", tuman: "T", yil: "2024", tur: "X" } } as unknown as Props)} />);
    expect((screen.getAllByRole("listitem")[0] as HTMLButtonElement).disabled).toBe(false);
  });

  it("sizes the widget from ResizeObserver entries", () => {
    type Entry = { contentRect: { width: number; height: number } };
    let trigger: ((entries: Entry[]) => void) | null = null;
    const disconnect = jest.fn();
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(cb: (entries: Entry[]) => void) {
        trigger = cb;
      }
      observe = jest.fn();
      disconnect = disconnect;
      unobserve = jest.fn();
    } as unknown as typeof ResizeObserver;
    const { container, unmount } = mount();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const card = container.firstChild as HTMLElement;
    act(() => trigger?.([{ contentRect: { width: 200, height: 100 } }]));
    expect(card.getAttribute("data-bar-size")).toBe("xs");
    expect(card.getAttribute("data-compact-height")).toBe("true");
    act(() => trigger?.([{ contentRect: { width: 300, height: 400 } }]));
    expect(card.getAttribute("data-bar-size")).toBe("sm");
    act(() => trigger?.([{ contentRect: { width: 400, height: 400 } }]));
    expect(card.getAttribute("data-bar-size")).toBe("md");
    act(() => trigger?.([{ contentRect: { width: 800, height: 400 } }]));
    expect(card.getAttribute("data-bar-size")).toBe("lg");
    act(() => trigger?.([]));
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(mockBound.unbind).toHaveBeenCalled();
    globalThis.ResizeObserver = original;
  });

  it("does not dispatch a pending VH selection after unmount", () => {
    const { unmount } = mount();
    send(full());
    fireEvent.click(screen.getAllByRole("listitem")[0]);
    const listener = jest.fn();
    document.addEventListener("widgetSelectionChanged", listener);
    unmount();
    act(() => {
      jest.advanceTimersByTime(100);
    });
    document.removeEventListener("widgetSelectionChanged", listener);
    expect(listener).not.toHaveBeenCalled();
  });

  it("exposes display count, sort toggle and number formatting helpers", () => {
    const ref = React.createRef<AgriBar>();
    render(<AgriBar ref={ref} {...({} as unknown as Props)} />);
    const bar = ref.current as AgriBar;
    act(() => bar.handleDisplayCountChange(2));
    expect(bar.state.displayCount).toBe(2);
    act(() => bar.handleDisplayCountChange(Number.NaN));
    expect(bar.state.displayCount).toBe(-1);
    act(() => bar.toggleSortOrder());
    expect(bar.state.sortOrder).toBe("asc");
    act(() => bar.toggleSortOrder());
    expect(bar.state.sortOrder).toBe("desc");
    expect(bar.formatNumber(null)).toBe("-");
    expect(bar.formatNumber(1.234, 1)).toBe("1.2");
  });

  it("limits categories to the display count", () => {
    const ref = React.createRef<AgriBar>();
    render(<AgriBar ref={ref} {...({} as unknown as Props)} />);
    send(full());
    act(() => (ref.current as AgriBar).handleDisplayCountChange(1));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("ignores a click without a category or without a region", () => {
    const ref = React.createRef<AgriBar>();
    render(<AgriBar ref={ref} {...({} as unknown as Props)} />);
    const bar = ref.current as AgriBar;
    act(() => bar.handleVHSelectionClick({ category: "x" }));
    expect(bar.state.selectedVHCategory).toBeNull();
    send(full());
    act(() => bar.handleVHSelectionClick(null));
    act(() => bar.handleVHSelectionClick({ payload: { category: "2-Yaxshi" } }));
    expect(bar.state.selectedVHCategory).toBe("2-Yaxshi");
  });
});
