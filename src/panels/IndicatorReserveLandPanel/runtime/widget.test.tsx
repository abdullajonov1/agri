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
const mockState: { handler: FilterHandler | null } = { handler: null };
const mockGetLayer = jest.fn();
const mockQuery = jest.fn();
jest.mock("../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: FilterHandler): (() => void) => {
    mockState.handler = h;
    return (): void => undefined;
  },
}));
jest.mock("../../../gis/agri-reserve-land-data-source", () => ({
  getAgriReserveLandLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../../gis/feature-layer-data", () => ({
  withAgriAccessWhere: (w: string): string => `ACCESS(${w})`,
}));
jest.mock("../../../data/agri-indicator-stats", () => ({
  queryIndicatorOutStat: (o: unknown): Promise<number> => mockQuery(o) as Promise<number>,
}));

import { act, render, screen } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriIndicatorReserveLand from "./widget";

type Props = AllWidgetProps<Record<string, unknown>>;
interface QueryArg {
  where: string;
  statisticType: string;
  onStatisticField: string;
}

interface StubLayer {
  url: string;
  objectIdField: string;
  createQuery: jest.Mock;
  queryFeatures: jest.Mock;
}

const makeLayer = (): StubLayer => ({
  url: "http://x/2",
  objectIdField: "OBJECTID",
  createQuery: jest.fn(() => ({}) as Record<string, unknown>),
  queryFeatures: jest.fn().mockResolvedValue({
    features: [
      { attributes: { turi: "Bugdoy", crop_id: "11" } },
      { attributes: { turi: "Bugdoy", crop_id: "12" } },
      { attributes: { turi: "", crop_id: "13" } },
    ],
  }),
});

const send = async (detail: unknown): Promise<void> => {
  await act(async () => {
    mockState.handler?.(new CustomEvent("masterFilterChanged", { detail }));
    await Promise.resolve();
    await Promise.resolve();
  });
};

const mount = async () => {
  const utils = render(<AgriIndicatorReserveLand {...({} as unknown as Props)} />);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
};

const lastWhere = (): string => {
  const calls = mockQuery.mock.calls;
  return (calls[calls.length - 1][0] as QueryArg).where;
};

describe("AgriIndicatorReserveLand", () => {
  let layer: StubLayer;
  beforeEach(() => {
    mockState.handler = null;
    layer = makeLayer();
    mockGetLayer.mockReset().mockResolvedValue({ layer });
    mockQuery.mockReset().mockResolvedValue(77);
  });

  it("shows spinner and does not query before any master filter", async () => {
    await mount();
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("does not query for an empty year and keeps the spinner", async () => {
    await mount();
    await send({ filters: { yil: "" } });
    expect(mockQuery).not.toHaveBeenCalled();
    expect(screen.getByTestId("spinner")).toBeTruthy();
  });

  it("sums maydon for the year via LIKE and renders value with unit", async () => {
    await mount();
    await send({ filters: { yil: "2024-yil" } });
    const arg = mockQuery.mock.calls[0][0] as QueryArg;
    expect(arg.statisticType).toBe("sum");
    expect(arg.onStatisticField).toBe("maydon");
    expect(arg.where).toBe("ACCESS(yil LIKE '2024%')");
    expect(screen.getByTestId("count").textContent).toBe("77");
    expect(screen.getByText("ga")).toBeTruthy();
  });

  it("adds viloyat, tuman and uniqueid clauses (locked viloyat wins)", async () => {
    await mount();
    await send({
      filters: { yil: "2024", viloyat: "Andijon", tuman: "Asaka", polygonMode: true, uniqueid: "u-1" },
      scope: { lockedViloyat: "Locked" },
    });
    const where = lastWhere();
    expect(where).toContain("Locked");
    expect(where).not.toContain("Andijon");
    expect(where).toContain("Asaka");
    expect(where).toContain("u-1");
  });

  it("resolves selected crops to crop_id values via a cached grouped query", async () => {
    await mount();
    await send({ filters: { yil: "2024", turlar: ["Bugdoy"] } });
    expect(lastWhere()).toContain("crop_id IN ('11','12')");
    await send({ filters: { yil: "2025", turlar: ["Bugdoy"] } });
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
    expect(layer.createQuery).toHaveBeenCalledTimes(1);
  });

  it("matches nothing when the selected crop has no crop_id mapping", async () => {
    await mount();
    await send({ filters: { yil: "2024", turlar: ["Unknown"] } });
    expect(lastWhere()).toContain("1=0");
  });

  it("treats a failing crop-id lookup as an empty mapping", async () => {
    layer.queryFeatures.mockRejectedValue(new Error("nope"));
    await mount();
    await send({ filters: { yil: "2024", turlar: ["Bugdoy"] } });
    expect(lastWhere()).toContain("1=0");
  });

  it("shows 0 for a non-finite aggregate", async () => {
    mockQuery.mockResolvedValue(Number.NaN);
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("renders a dash when the query fails", async () => {
    mockQuery.mockRejectedValue(new Error("x"));
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(screen.getByTestId("count").textContent).toBe("-");
  });

  it("surfaces layer load failure as a dash with title", async () => {
    mockGetLayer.mockRejectedValue(new Error("layer down"));
    await mount();
    expect(screen.getByTitle("layer down").textContent).toBe("-");
  });

  it("queries once the layer connects if a filter already arrived", async () => {
    let resolve: (v: unknown) => void = () => undefined;
    mockGetLayer.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(mockQuery).not.toHaveBeenCalled();
    await act(async () => {
      resolve({ layer });
      for (let i = 0; i < 6; i++) await Promise.resolve();
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("ignores stale events and re-queries only on changed filters", async () => {
    await mount();
    await send({ filters: { yil: "2024" }, meta: { timestamp: 50, broadcastGeneration: 2 } });
    await send({ filters: { yil: "2023" }, meta: { timestamp: 10, broadcastGeneration: 1 } });
    await send({ filters: { yil: "2024" } });
    await send({});
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("localises label and unit, and reacts to theme", async () => {
    const { container } = await mount();
    await send({ filters: { yil: "2024" } });
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "en" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { theme: "dark" } }));
    });
    expect(screen.getByText("Reserve land")).toBeTruthy();
    expect(screen.getByText("ha")).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("dark-theme");
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "uz_lat" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: null }));
    });
    expect(screen.getByText("Zaxira maydonlari")).toBeTruthy();
  });
});
