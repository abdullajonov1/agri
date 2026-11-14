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

describe("Graff render-panel state characterization", () => {
  const rows = [
    { uniqueid: "u1", objectid: 1, f_name: "Alpha", f_inn: "111" },
    { uniqueid: "u2", objectid: 2, f_name: "Beta", f_inn: "222" },
  ];
  const fmt = { formatFieldValue: (f: string, v: unknown) => `${f}:${String(v ?? "")}` };

  it("renders loader while connecting", () => {
    expect(html(build("en", { connectionStatus: "connecting" }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-loading-container"></div></div></div>"`);
  });
  it("renders loader when year is missing", () => {
    expect(html(build("en", { regionalFilters: {} }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-loading-container"></div></div></div>"`);
  });
  it("renders loader while loading with no rows", () => {
    expect(html(build("en", { loading: true }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-loading-container"></div></div></div>"`);
  });
  it("renders loader while loading with rows", () => {
    expect(html(build("en", { loading: true, records: rows, totalRecordCount: 2 }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-loading-container"></div></div></div>"`);
  });
  it("renders loader before first fetch completes", () => {
    expect(html(build("en", {}, { _hasCompletedTableFetch: false }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-loading-container"></div></div></div>"`);
  });
  it("renders empty state", () => {
    expect(html(build("ru", {}))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">ТАБЛИЦА</div></div><div class="kadastr-status-no-data"><h3>Данные не найдены</h3></div></div></div>"`);
  });
  it("renders search error above the table", () => {
    expect(html(build("en", { searchError: "bad search", records: rows, totalRecordCount: 2 }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-error" style="padding:8px"><p>bad search</p></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr><tr data-uniqueid="u2" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("renders table rows in dark theme", () => {
    expect(html(build("en", { isDarkTheme: true, records: rows, totalRecordCount: 2 }, fmt))).toMatchInlineSnapshot(`"<div class="kadastr-status-card dark-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="" style="cursor:default"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Alpha"><span class="kadastr-table-cell-text">f_name:Alpha</span></td><td title="f_inn:111"><span class="kadastr-table-cell-text">f_inn:111</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u1"><span class="kadastr-table-cell-text">uniqueid:u1</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr><tr data-uniqueid="u2" class="kadastr-table-row" title="" style="cursor:default"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Beta"><span class="kadastr-table-cell-text">f_name:Beta</span></td><td title="f_inn:222"><span class="kadastr-table-cell-text">f_inn:222</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u2"><span class="kadastr-table-cell-text">uniqueid:u2</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("renders selected polygon row with interaction and active sort", () => {
    const host = build(
      "uz_lat",
      { records: rows, totalRecordCount: 2, selecteduniqueid: "u2", tableSort: { column: "maydon", order: "asc" } },
      { ...fmt, isRegionalInteractionEnabled: () => true, recordMatchesUniqueid: (r: { uniqueid?: string }, id: string) => r.uniqueid === id },
    );
    expect(html(host)).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">JADVAL</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Holat</th><th>Tuman</th><th>Viloyat</th><th>Region</th><th>Tuman</th><th>Yil</th><th>Ekin turi</th><th>Chegara uzunligi</th><th>Global ID</th><th>Fermer nomi</th><th>STIR</th><th>Kadastr raqami</th><th>Hosildorlik</th><th>Raqamli ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn kadastr-table-sort-btn--active" aria-label="Maydon sort"><span>Maydon</span></button></th><th>Nom</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="Харитада кўрсатиш ва график учун танлаш" style="cursor:pointer"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Alpha"><span class="kadastr-table-cell-text">f_name:Alpha</span></td><td title="f_inn:111"><span class="kadastr-table-cell-text">f_inn:111</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u1"><span class="kadastr-table-cell-text">uniqueid:u1</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr><tr data-uniqueid="u2" class="kadastr-table-row selected-row" title="Харитада кўрсатиш ва график учун танлаш" style="cursor:pointer"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Beta"><span class="kadastr-table-cell-text">f_name:Beta</span></td><td title="f_inn:222"><span class="kadastr-table-cell-text">f_inn:222</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u2"><span class="kadastr-table-cell-text">uniqueid:u2</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("renders descending sort header", () => {
    expect(html(build("en", { records: rows, totalRecordCount: 2, tableSort: { column: "maydon", order: "desc" } }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn kadastr-table-sort-btn--active" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr><tr data-uniqueid="u2" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("filters rows by farmer inn", () => {
    expect(html(build("en", { records: rows, totalRecordCount: 2, farmerInn: "222" }, fmt))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u2" class="kadastr-table-row" title="" style="cursor:default"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Beta"><span class="kadastr-table-cell-text">f_name:Beta</span></td><td title="f_inn:222"><span class="kadastr-table-cell-text">f_inn:222</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u2"><span class="kadastr-table-cell-text">uniqueid:u2</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("filters rows by committed search text", () => {
    expect(html(build("en", { records: rows, totalRecordCount: 2, isSearchActive: true, searchText: "alp" }, fmt))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="" style="cursor:default"><td title="vh:"><span class="kadastr-table-cell-text">vh:</span></td><td title="tuman:"><span class="kadastr-table-cell-text">tuman:</span></td><td title="viloyat:"><span class="kadastr-table-cell-text">viloyat:</span></td><td title="region:"><span class="kadastr-table-cell-text">region:</span></td><td title="district:"><span class="kadastr-table-cell-text">district:</span></td><td title="yil:"><span class="kadastr-table-cell-text">yil:</span></td><td title="turi:"><span class="kadastr-table-cell-text">turi:</span></td><td title="shape_leng:"><span class="kadastr-table-cell-text">shape_leng:</span></td><td title="globalid:"><span class="kadastr-table-cell-text">globalid:</span></td><td title="f_name:Alpha"><span class="kadastr-table-cell-text">f_name:Alpha</span></td><td title="f_inn:111"><span class="kadastr-table-cell-text">f_inn:111</span></td><td title="f_cad:"><span class="kadastr-table-cell-text">f_cad:</span></td><td title="yld:"><span class="kadastr-table-cell-text">yld:</span></td><td title="numeric_id:"><span class="kadastr-table-cell-text">numeric_id:</span></td><td title="uniqueid:u1"><span class="kadastr-table-cell-text">uniqueid:u1</span></td><td title="maydon:"><span class="kadastr-table-cell-text">maydon:</span></td><td title="name:"><span class="kadastr-table-cell-text">name:</span></td></tr></tbody></table></div></div></div></div>"`);
  });
  it("renders pagination mid-page", () => {
    expect(html(build("en", { records: rows, totalRecordCount: 45, currentPage: 3 }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-table-frame"><div class="kadastr-status-table-container"><table class="kadastr-status-table"><thead><tr><th>Status</th><th>District</th><th>Region</th><th>Region</th><th>District</th><th>Year</th><th>Crop type</th><th>Boundary length</th><th>Global ID</th><th>Farmer name</th><th>TIN</th><th>Cadastral number</th><th>Yield</th><th>Numeric ID</th><th>UID</th><th><button type="button" class="kadastr-table-sort-btn" aria-label="Area sort"><span>Area</span></button></th><th>Name</th></tr></thead><tbody><tr data-uniqueid="u1" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr><tr data-uniqueid="u2" class="kadastr-table-row" title="" style="cursor:default"><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td><td title=""><span class="kadastr-table-cell-text"></span></td></tr></tbody></table><div class="contours-table__pagination" aria-label="Table pagination"><span class="contours-table__pagination-chip contours-table__pagination-range"><span class="contours-table__pagination-label">Total</span><span class="contours-table__pagination-value">45</span></span><div class="contours-table__pagination-actions"><button type="button" class="contours-table__pagination-btn" aria-label="Previous page"></button><span class="contours-table__pagination-chip contours-table__pagination-page"><span class="contours-table__pagination-label">Page</span><span class="contours-table__pagination-value">3 / 5</span></span><button type="button" class="contours-table__pagination-btn" aria-label="Next page"></button></div><span class="contours-table__pagination-chip contours-table__pagination-size"><span class="contours-table__pagination-label">Rows</span><span class="contours-table__pagination-value">10</span></span></div></div></div></div></div>"`);
  });
  it("renders failed connection with custom error", () => {
    expect(html(build("en", { connectionStatus: "failed", error: "net down" }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"><div class="kadastr-table-topbar"><div class="kadastr-table-top-label">TABLE</div></div><div class="kadastr-status-error"><p>net down</p><button class="kadastr-status-retry-button">Reconnect</button></div></div></div>"`);
  });
  it("renders graph view wrapper", () => {
    expect(html(build("en", { viewMode: "graph" }, { renderGraph: () => "GRAPH" }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content">GRAPH</div></div>"`);
  });
  it("renders map view component slot when map widget configured", () => {
    expect(html(build("en", { viewMode: "graph" }, { props: { useMapWidgetIds: ["m1"] }, renderGraph: () => null }))).toMatchInlineSnapshot(`"<div class="kadastr-status-card light-theme"><div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0"></div><div class="kadastr-status-content"></div></div>"`);
  });
});
