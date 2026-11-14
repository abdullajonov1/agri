jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({ JimuMapViewComponent: () => null }));
jest.mock("react-dom", () => {
  const actual: Record<string, unknown> = jest.requireActual("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("../../../../shared/AgriChartLoader", () => ({ __esModule: true, default: () => null }));
jest.mock("lucide-react", () => ({
  TriangleAlert: () => null,
  ChevronDown: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
}));

import { renderToStaticMarkup } from "react-dom/server";
import type { GraffWidgetHost } from "../graff-host";
import { render } from "./render-panel";

type Lang = "en" | "ru" | "uz_lat" | "uz_cyr";
const LANGS: Lang[] = ["en", "ru", "uz_lat", "uz_cyr"];

const FIELDS = [
  "vh", "tuman", "viloyat", "region", "district", "yil", "turi", "shape_leng",
  "globalid", "f_name", "f_inn", "f_cad", "yld", "numeric_id", "uniqueid", "maydon", "name",
];

function build(language: Lang, state: Record<string, unknown>, extra: Record<string, unknown> = {}): GraffWidgetHost {
  return {
    state: {
      loading: false, error: null, records: [], isDarkTheme: false, connectionStatus: "connected",
      selecteduniqueid: null, currentPage: 1, totalRecordCount: 0, configuredFields: FIELDS,
      regionalFilters: { yil: "2024" }, language, viewMode: "table", tableSort: null, ...state,
    },
    props: {},
    RECORDS_PER_PAGE: 10,
    _hasCompletedTableFetch: true,
    isRegionalInteractionEnabled: () => false,
    getDisplayFields: () => FIELDS,
    getFieldDisplayName: (f: string) => f,
    localizeRuntimeMessage: (m: unknown) => (m ? String(m) : ""),
    renderViewModeToggle: () => null,
    formatFieldValue: () => "",
    getStatusValueForRecord: () => "",
    recordMatchesUniqueid: () => false,
    ...extra,
  } as unknown as GraffWidgetHost;
}

const html = (h: GraffWidgetHost): string => renderToStaticMarkup(render(h) as React.ReactElement);
const text = (h: string): string => h.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");

const HEADERS: Record<Lang, string> = {
  en: "|Status|District|Region|Region|District|Year|Crop type|Boundary length|Global ID|Farmer name|TIN|Cadastral number|Yield|Numeric ID|UID|Area|Name|",
  ru: "|Состояние|Район|Область|Регион|Район|Год|Тип посева|Длина границы|Глобальный ID|Название фермера|ИНН|Кадастровый номер|Урожайность|Числовой ID|UID|Площадь|Имя|",
  uz_lat: "|Holat|Tuman|Viloyat|Region|Tuman|Yil|Ekin turi|Chegara uzunligi|Global ID|Fermer nomi|STIR|Kadastr raqami|Hosildorlik|Raqamli ID|UID|Maydon|Nom|",
  uz_cyr: "|Ҳолат|Туман|Вилоят|Регион|Туман|Йил|Экин тури|Чегара узунлиғи|Глобал ID|Фермер номи|СТИР|Кадастр рақами|Ҳосилдорлик|Рақамли ID|UID|Майдон|Ном|",
};
const TITLE: Record<Lang, string> = { en: "TABLE", ru: "ТАБЛИЦА", uz_lat: "JADVAL", uz_cyr: "ЖАДВАЛ" };
const PAGING: Record<Lang, string[]> = {
  en: ["Total", "Page", "Rows"],
  ru: ["Всего", "Страница", "Строк"],
  uz_lat: ["Jami", "Sahifa", "Qator"],
  uz_cyr: ["Жами", "Саҳифа", "Қатор"],
};
const NO_FIELDS: Record<Lang, [string, string]> = {
  en: ["Widget fields are required", "Select widget fields in Settings."],
  ru: ["Требуются поля виджета", "Выберите поля виджета в настройках."],
  uz_lat: ["Widget maydonlari talab qilinadi", "Widget maydonlarini sozlamalarda tanlang."],
  uz_cyr: ["Виджет майдонлари талаб қилинади", "Виджет майдонларини созламаларда танланг."],
};
const RECONNECT: Record<Lang, [string, string]> = {
  en: ["Could not connect to the map. Try again.", "Reconnect"],
  ru: ["Не удалось подключиться к карте. Попробуйте снова.", "Подключиться снова"],
  uz_lat: ["Xaritaga ulana olmadi. Qayta urinib ko'ring.", "Qayta ulanish"],
  uz_cyr: ["Харитага улана олмади. Қайта уриниб кўринг.", "Қайта уланиш"],
};
const RETRY: Record<Lang, string> = { en: "Retry", ru: "Повторить", uz_lat: "Qayta urinish", uz_cyr: "Қайта уриниш" };

describe("Graff render-panel labels", () => {
  it.each(LANGS)("renders title and column headers in %s", (lang) => {
    const out = html(build(lang, { records: [{ uniqueid: "1" }], totalRecordCount: 1 }));
    expect(text(out)).toContain(`|${TITLE[lang]}|`);
    const head = out.slice(out.indexOf("<thead>"), out.indexOf("</thead>"));
    expect(text(head).replace(/^\|<thead>/, "")).toContain(HEADERS[lang]);
  });

  it.each(LANGS)("renders pagination labels in %s", (lang) => {
    const out = html(build(lang, { records: [{ uniqueid: "1" }], totalRecordCount: 25 }));
    const labels = [...out.matchAll(/pagination-label">([^<]*)</g)].map((m) => m[1]);
    expect(labels).toEqual(PAGING[lang]);
  });

  it.each(LANGS)("renders missing-fields message in %s", (lang) => {
    const out = html(build(lang, { configuredFields: [] }));
    expect(out).toContain(`<h3>${NO_FIELDS[lang][0]}</h3>`);
    expect(out).toContain(`<p>${NO_FIELDS[lang][1]}</p>`);
  });

  it.each(LANGS)("renders connection-failed message and reconnect button in %s", (lang) => {
    const out = html(build(lang, { connectionStatus: "failed" }));
    expect(out).toContain(`<p>${RECONNECT[lang][0].replace("'", "&#x27;")}</p>`);
    expect(out).toContain(`>${RECONNECT[lang][1]}</button>`);
  });

  it.each(LANGS)("renders retry button on error in %s", (lang) => {
    const out = html(build(lang, { error: "boom" }));
    expect(out).toContain(`>${RETRY[lang]}</button>`);
  });
});
