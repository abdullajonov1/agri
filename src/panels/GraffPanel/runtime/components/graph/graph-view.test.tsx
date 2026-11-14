jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("react-dom", () => {
  const actual: Record<string, unknown> = jest.requireActual("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("../../../../../shared/AgriChartLoader", () => ({ __esModule: true, default: () => null }));
jest.mock("../../../../../gis/agri-vegetation-overlay-prefetch", () => ({
  setVegetationOverlayContext: (): void => undefined,
}));
jest.mock("../../../../../data/agri-graff-date", () => ({ extractGraffYearToken: (): string => "" }));
jest.mock("lucide-react", () => ({ Table: () => null, ChartLine: () => null }));

import { renderToStaticMarkup } from "react-dom/server";
import type { GraffWidgetHost } from "../../graff-host";
import { renderGraphHeader, renderGraphLegend, renderViewModeToggle } from "./graph-view";

const EXPECTED = {
  en: {
    table: "Table", chart: "Chart", group: "View mode", all: "All",
    legend: "Index indicators", indicator: "Index Indicators", note: "VH filter not applied",
  },
  ru: {
    table: "Таблица", chart: "График", group: "Режим просмотра", all: "Все",
    legend: "Индекс показателей", indicator: "Индекс Показателей", note: "Фильтр VH не применён",
  },
  uz_lat: {
    table: "Jadval", chart: "Grafik", group: "Ko‘rinish", all: "Barchasi",
    legend: "Index ko‘rsatkichlari", indicator: "Index Ko&#x27;rsatkichlari", note: "VH filtri qo‘llanmagan",
  },
  uz_cyr: {
    table: "Жадвал", chart: "График", group: "Кўриниш", all: "Барчаси",
    legend: "Индекс кўрсаткичлари", indicator: "Индекс Кўрсаткичлари", note: "VH фильтри қўлланмаган",
  },
} as const;

const makeHost = (language: string): GraffWidgetHost => {
  const host = {
    state: {
      selectedIndices: ["ndvi"],
      language,
      regionalFilters: { vh: "3" },
      selecteduniqueid: null,
    },
    isRegionalInteractionEnabled: () => true,
    handleToggleAllIndices: () => undefined,
    handleIndexChange: () => undefined,
    renderGraphLegend: () => renderGraphLegend(host),
    renderViewModeToggle: (mode: "table" | "graph") => renderViewModeToggle(host, mode),
  } as unknown as GraffWidgetHost;
  return host;
};

describe("graph view labels", () => {
  (Object.keys(EXPECTED) as Array<keyof typeof EXPECTED>).forEach((lang) => {
    it(`renders exact visible text in ${lang}`, () => {
      // Arrange
      const host = makeHost(lang);
      const e = EXPECTED[lang];

      // Act
      const graphToggle = renderToStaticMarkup(renderViewModeToggle(host, "graph"));
      const tableToggle = renderToStaticMarkup(renderViewModeToggle(host, "table"));
      const legend = renderToStaticMarkup(renderGraphLegend(host));
      const header = renderToStaticMarkup(renderGraphHeader(host));

      // Assert
      expect(graphToggle).toContain(`aria-label="${e.group}"`);
      expect(graphToggle).toContain(`title="${e.chart}"`);
      expect(tableToggle).toContain(`title="${e.table}"`);
      expect(legend).toContain(`aria-label="${e.legend}"`);
      expect(legend).toContain(`<span class="index-btn-h-label">${e.all}</span>`);
      expect(header).toContain(`<span>${e.indicator}</span>`);
      expect(header).toContain(`title="${e.note}">${e.note}</span>`);
    });
  });
});
