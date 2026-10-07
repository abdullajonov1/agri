jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../../shared/AgriDashboardSpinner", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="spinner" />,
}));
jest.mock("../../../shared/AgriAnimatedCount", () => ({
  __esModule: true,
  default: (p: { value: number | null; emptyFallback: string }): JSX.Element => (
    <span data-testid="count">{p.value == null ? p.emptyFallback : String(p.value)}</span>
  ),
}));

type FilterHandler = (e: Event) => void;
const mockState: { handler: FilterHandler | null; unbind: jest.Mock } = {
  handler: null,
  unbind: jest.fn(),
};
const mockGetLayer = jest.fn();
const mockQuery = jest.fn();
jest.mock("../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: FilterHandler): (() => void) => {
    mockState.handler = h;
    return mockState.unbind;
  },
}));
jest.mock("../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../../data/agri-indicator-stats", () => ({
  queryIndicatorOutStatNullable: (o: unknown): Promise<number | null> =>
    mockQuery(o) as Promise<number | null>,
}));

import { act, render, screen } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriIndicatorYield from "./widget";

type Props = AllWidgetProps<Record<string, unknown>>;
const LAYER = { url: "http://x/0" };

const send = async (detail: unknown): Promise<void> => {
  await act(async () => {
    mockState.handler?.(new CustomEvent("masterFilterChanged", { detail }));
    await Promise.resolve();
  });
};

const mount = async () => {
  const utils = render(<AgriIndicatorYield {...({} as unknown as Props)} />);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
};

describe("AgriIndicatorYield", () => {
  beforeEach(() => {
    mockState.handler = null;
    mockState.unbind = jest.fn();
    mockGetLayer.mockReset().mockResolvedValue({ layer: LAYER });
    mockQuery.mockReset().mockResolvedValue(3.5);
  });

  it("shows the spinner until a year is known and does not query", async () => {
    await mount();
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("queries avg(yld) with a year-scoped where and renders the value", async () => {
    await mount();
    await send({ filters: { yil: "2024", viloyat: "Andijon", tuman: "Asaka", turlar: ["Bugdoy"] } });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const arg = mockQuery.mock.calls[0][0] as { layer: unknown; where: string; statisticType: string; onStatisticField: string };
    expect(arg.layer).toBe(LAYER);
    expect(arg.statisticType).toBe("avg");
    expect(arg.onStatisticField).toBe("yld");
    expect(arg.where).toContain("2024");
    expect(arg.where).toContain("Andijon");
    expect(screen.getByTestId("count").textContent).toBe("3.5");
  });

  it("adds the uniqueid clause only in polygon mode and prefers locked viloyat", async () => {
    await mount();
    await send({
      filters: { yil: "2024", viloyat: "A", polygonMode: true, uniqueid: " u-1 " },
      scope: { lockedViloyat: "Locked" },
    });
    const where = (mockQuery.mock.calls[0][0] as { where: string }).where;
    expect(where).toContain("uniqueid");
    expect(where).toContain("u-1");
    expect(where).toContain("Locked");
    expect(where).not.toContain("'A'");
  });

  it("ignores events without filters and unchanged filters", async () => {
    await mount();
    await send({});
    await send({ filters: { yil: "2024" } });
    await send({ filters: { yil: "2024" } });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("ignores stale master filter events", async () => {
    await mount();
    await send({ filters: { yil: "2024" }, meta: { timestamp: 200, broadcastGeneration: 5 } });
    await send({ filters: { yil: "2023" }, meta: { timestamp: 100, broadcastGeneration: 4 } });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("renders a dash when the aggregate is null", async () => {
    mockQuery.mockResolvedValue(null);
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(screen.getByTestId("count").textContent).toBe("-");
  });

  it("falls back to empty value (no error) when the query fails", async () => {
    mockQuery.mockRejectedValue(new Error("boom"));
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(screen.getByTestId("count").textContent).toBe("-");
  });

  it("shows a dash with the error title when the layer fails to load", async () => {
    mockGetLayer.mockRejectedValue(new Error("no layer"));
    await mount();
    const dash = screen.getByTitle("no layer");
    expect(dash.textContent).toBe("-");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("localises the label and reacts to theme", async () => {
    const { container } = await mount();
    await send({ filters: { yil: "2024" } });
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "en" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { theme: "dark" } }));
    });
    expect(screen.getByText("Average yield")).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("dark-theme");
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "ru" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: null }));
    });
    expect(screen.getByText("Средняя урожайность")).toBeTruthy();
  });

  it("unbinds the master filter on unmount and ignores late events", async () => {
    const { unmount } = await mount();
    unmount();
    expect(mockState.unbind).toHaveBeenCalled();
    await send({ filters: { yil: "2024" } });
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
