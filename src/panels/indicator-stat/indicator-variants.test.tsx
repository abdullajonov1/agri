jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../shared/agri-access-config", () => ({
  ...jest.requireActual("../../shared/agri-access-config"),
  combineAccessWhereIfFieldsExist: (w: string): string => w,
}));
jest.mock("../../shared/AgriDashboardSpinner", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="spinner" />,
}));
jest.mock("../../shared/AgriAnimatedCount", () => ({
  __esModule: true,
  default: (p: { value: number | null; emptyFallback: string }): JSX.Element => (
    <span data-testid="count">{p.value == null ? p.emptyFallback : String(p.value)}</span>
  ),
}));

type FilterHandler = (e: Event) => void;
const mockState: { handler: FilterHandler | null } = { handler: null };
const mockGetLayer = jest.fn();
const mockQuery = jest.fn();
jest.mock("../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: FilterHandler): (() => void) => {
    mockState.handler = h;
    return (): void => undefined;
  },
}));
jest.mock("../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../gis/agri-unused-land-data-source", () => ({
  getAgriUnusedLandLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../gis/agri-reserve-land-data-source", () => ({
  getAgriReserveLandLayer: (): Promise<unknown> => mockGetLayer() as Promise<unknown>,
}));
jest.mock("../../gis/feature-layer-data", () => ({
  withAgriAccessWhere: (w: string): string => `ACCESS(${w})`,
}));
jest.mock("../../data/agri-indicator-stats", () => ({
  queryIndicatorOutStatNullable: (o: unknown): Promise<number> => mockQuery(o) as Promise<number>,
  queryIndicatorOutStat: (o: unknown): Promise<number> => mockQuery(o) as Promise<number>,
}));

import { act, render } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriIndicatorYield from "../IndicatorYieldPanel/runtime/widget";
import AgriIndicatorUnusedLand from "../IndicatorUnusedLandPanel/runtime/widget";
import AgriIndicatorReserveLand from "../IndicatorReserveLandPanel/runtime/widget";

type Props = AllWidgetProps<Record<string, unknown>>;
type Lang = "en" | "ru" | "uz_lat" | "uz_cyr";
const LANGS: Lang[] = ["en", "ru", "uz_lat", "uz_cyr"];
const UNITS: Record<Lang, string> = { en: "ha", ru: "га", uz_lat: "ga", uz_cyr: "га" };

const FIELDS = [
  { name: "yil", type: "string" },
  { name: "maydon", type: "double" },
  { name: "viloyat", type: "string" },
  { name: "tuman", type: "string" },
  { name: "turi", type: "string" },
  { name: "uniqueid", type: "string" },
];
const LAYER = {
  url: "http://x/0",
  fields: FIELDS,
  objectIdField: "OBJECTID",
  createQuery: (): Record<string, unknown> => ({}),
  queryFeatures: (): Promise<{ features: unknown[] }> => Promise.resolve({ features: [] }),
};

interface Variant {
  name: string;
  Component: React.ComponentType<Props>;
  labels: Record<Lang, string>;
  hasUnit: boolean;
  statisticType: string;
  field: string;
  where: string;
}

const VARIANTS: Variant[] = [
  {
    name: "Yield",
    Component: AgriIndicatorYield,
    labels: {
      en: "Average yield",
      ru: "Средняя урожайность",
      uz_lat: "O'rtacha hosildorlik",
      uz_cyr: "Ўртача ҳосилдорлик",
    },
    hasUnit: false,
    statisticType: "avg",
    field: "yld",
    where: "ACCESS(yil LIKE '2024%' AND viloyat='Andijon' AND (tuman='Asaka' OR tuman='Asaka tumani'))",
  },
  {
    name: "UnusedLand",
    Component: AgriIndicatorUnusedLand,
    labels: {
      en: "Unused land",
      ru: "Неиспользуемые земли",
      uz_lat: "Foydalanilmagan yer",
      uz_cyr: "Фойдаланилмаган ер",
    },
    hasUnit: true,
    statisticType: "sum",
    field: "maydon",
    where: "yil LIKE '2024%' AND viloyat='Andijon' AND (tuman='Asaka' OR tuman='Asaka tumani')",
  },
  {
    name: "ReserveLand",
    Component: AgriIndicatorReserveLand,
    labels: {
      en: "Reserve land",
      ru: "Резервные земли",
      uz_lat: "Zaxira maydonlari",
      uz_cyr: "Захира майдонлари",
    },
    hasUnit: true,
    statisticType: "sum",
    field: "maydon",
    where: "ACCESS(yil LIKE '2024%' AND viloyat='Andijon' AND tuman='Asaka')",
  },
];

const expectedMarkup = (v: Variant, lang: Lang): string =>
  '<div class="vegetation-stats-widget light-theme map-overlay-mode" data-ind-size="sm">' +
  '<div class="widget-content"><div class="stat-main">' +
  `<div class="stat-label">${v.labels[lang]}</div>` +
  '<div class="stat-value"><span data-testid="count">5</span>' +
  (v.hasUnit ? `<span class="unit">${UNITS[lang]}</span>` : "") +
  "</div></div></div></div>";

describe.each(VARIANTS)("indicator variant $name", (v) => {
  beforeEach(() => {
    mockState.handler = null;
    mockGetLayer.mockReset().mockResolvedValue({ layer: LAYER });
    mockQuery.mockReset().mockResolvedValue(5);
  });

  const mountWithFilter = async (): Promise<HTMLElement> => {
    const { container } = render(<v.Component {...({} as unknown as Props)} />);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      mockState.handler?.(
        new CustomEvent("masterFilterChanged", {
          detail: { filters: { yil: "2024", viloyat: "Andijon", tuman: "Asaka" } },
        }),
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    return container;
  };

  it.each(LANGS)("renders the exact markup in %s", async (lang) => {
    const container = await mountWithFilter();
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { theme: "light" } }));
    });
    expect(container.innerHTML).toBe(expectedMarkup(v, lang));
  });

  it("builds the expected statistic request for a sample filter", async () => {
    await mountWithFilter();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const arg = mockQuery.mock.calls[0][0] as {
      layer: unknown;
      where: string;
      statisticType: string;
      onStatisticField: string;
    };
    expect(arg.layer).toBe(LAYER);
    expect(arg.statisticType).toBe(v.statisticType);
    expect(arg.onStatisticField).toBe(v.field);
    expect(arg.where).toBe(v.where);
  });
});
