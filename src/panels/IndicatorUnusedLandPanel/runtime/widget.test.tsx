jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../../shared/agri-access-config", () => ({
  ...jest.requireActual("../../../shared/agri-access-config"),
  combineAccessWhereIfFieldsExist: (w: string): string => w,
}));
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
jest.mock("../../../gis/agri-unused-land-data-source", () => ({
  getAgriUnusedLandLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../../data/agri-indicator-stats", () => ({
  queryIndicatorOutStatNullable: (o: unknown): Promise<number | null> =>
    mockQuery(o) as Promise<number | null>,
}));

import { act, render, screen } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriIndicatorUnusedLand from "./widget";

type Props = AllWidgetProps<Record<string, unknown>>;
interface QueryArg {
  where: string;
  statisticType: string;
  onStatisticField: string;
}

const FIELDS = [
  { name: "YIL", type: "string" },
  { name: "maydon", type: "double" },
  { name: "viloyat", type: "string" },
  { name: "tuman", type: "string" },
  { name: "turi", type: "string" },
  { name: "uniqueid", type: "string" },
];

const makeLayer = (fields: Array<{ name: string; type: string }> = FIELDS) => ({
  url: "http://x/1",
  fields,
});

const send = async (detail: unknown): Promise<void> => {
  await act(async () => {
    mockState.handler?.(new CustomEvent("masterFilterChanged", { detail }));
    await Promise.resolve();
  });
};

const mount = async () => {
  const utils = render(<AgriIndicatorUnusedLand {...({} as unknown as Props)} />);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
};

const lastWhere = (): string => {
  const calls = mockQuery.mock.calls;
  return (calls[calls.length - 1][0] as QueryArg).where;
};

describe("AgriIndicatorUnusedLand", () => {
  beforeEach(() => {
    mockState.handler = null;
    mockGetLayer.mockReset().mockResolvedValue({ layer: makeLayer() });
    mockQuery.mockReset().mockResolvedValue(120);
  });

  it("shows spinner and issues no query until a year is selected", async () => {
    await mount();
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("sums maydon scoped by year and renders value with unit", async () => {
    await mount();
    await send({ filters: { yil: "2024" } });
    const arg = mockQuery.mock.calls[0][0] as QueryArg;
    expect(arg.statisticType).toBe("sum");
    expect(arg.onStatisticField).toBe("maydon");
    expect(arg.where).toContain("YIL");
    expect(arg.where).toContain("2024");
    expect(screen.getByTestId("count").textContent).toBe("120");
    expect(screen.getByText("ga")).toBeTruthy();
  });

  it("uses numeric equality when the year column is numeric", async () => {
    mockGetLayer.mockResolvedValue({
      layer: makeLayer([{ name: "yil", type: "integer" }, { name: "maydon", type: "double" }]),
    });
    await mount();
    await send({ filters: { yil: "2024-yil" } });
    expect(lastWhere()).toContain("yil = 2024");
  });

  it("applies viloyat, tuman, crop and uniqueid clauses when columns exist", async () => {
    await mount();
    await send({
      filters: {
        yil: "2024",
        viloyat: "Andijon",
        tuman: "Asaka",
        turlar: ["Bugdoy"],
        polygonMode: true,
        uniqueid: "u-9",
      },
    });
    const where = lastWhere();
    expect(where).toContain("Andijon");
    expect(where).toContain("Asaka");
    expect(where).toContain("Bugdoy");
    expect(where).toContain("u-9");
  });

  it("uses the district column for numeric tuman codes and skips absent columns", async () => {
    mockGetLayer.mockResolvedValue({
      layer: makeLayer([
        { name: "yil", type: "string" },
        { name: "maydon", type: "double" },
        { name: "district", type: "string" },
      ]),
    });
    await mount();
    await send({ filters: { yil: "2024", viloyat: "Andijon", tuman: "1703", turlar: ["Bugdoy"] } });
    const where = lastWhere();
    expect(where).toContain("district = '1703'");
    expect(where).not.toContain("Andijon");
    expect(where).not.toContain("Bugdoy");
  });

  it("prefers the locked viloyat from scope", async () => {
    await mount();
    await send({ filters: { yil: "2024", viloyat: "Other" }, scope: { lockedViloyat: "Locked" } });
    expect(lastWhere()).toContain("Locked");
    expect(lastWhere()).not.toContain("Other");
  });

  it("does not query and shows empty value when schema lacks maydon", async () => {
    mockGetLayer.mockResolvedValue({ layer: makeLayer([{ name: "yil", type: "string" }]) });
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(mockQuery).not.toHaveBeenCalled();
    expect(screen.queryByTestId("spinner")).toBeNull();
    expect(screen.getByTestId("count").textContent).toBe("-");
  });

  it("renders a dash for a null aggregate and for query failures", async () => {
    mockQuery.mockResolvedValueOnce(null);
    await mount();
    await send({ filters: { yil: "2024" } });
    expect(screen.getByTestId("count").textContent).toBe("-");
    mockQuery.mockRejectedValueOnce(new Error("x"));
    await send({ filters: { yil: "2025" } });
    expect(screen.getByTestId("count").textContent).toBe("-");
  });

  it("surfaces layer load failure as a dash with the message as title", async () => {
    mockGetLayer.mockRejectedValue(new Error("layer down"));
    await mount();
    expect(screen.getByTitle("layer down").textContent).toBe("-");
  });

  it("ignores stale and unchanged events", async () => {
    await mount();
    await send({ filters: { yil: "2024" }, meta: { timestamp: 50, broadcastGeneration: 2 } });
    await send({ filters: { yil: "2023" }, meta: { timestamp: 10, broadcastGeneration: 1 } });
    await send({ filters: { yil: "2024" } });
    await send({});
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("localises label and unit", async () => {
    await mount();
    await send({ filters: { yil: "2024" } });
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "en" } }));
    });
    expect(screen.getByText("Unused land")).toBeTruthy();
    expect(screen.getByText("ha")).toBeTruthy();
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "ru" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { theme: "dark" } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: null }));
    });
    expect(screen.getByText("Неиспользуемые земли")).toBeTruthy();
    expect(screen.getByText("га")).toBeTruthy();
  });
});
