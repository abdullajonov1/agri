import type { IndicatorWidgetHost } from "../indicator-host";
import { normalizeLanguage } from "../../../../shared/agri-language";
import { normalizeTurlarListSql } from "../../../../data/agri-turlar";
import { buildTurlarSqlClause } from "../../../../shared/agri-crop-labels";
import { expandUniqueIdsForAgriTable } from "../../../../gis/agri-table-data-source";
import { agriVhIndicatorLog } from "../../../../gis/agri-debug-log";
import { errorMessage } from "../../../../shared/agri-plain-object";
import { readPanelEventDetail } from "../../../panel-filter-detail";
import { normalizeUzbekPlaceForApi } from "./indicator-data/indicator-api-places";

export const labelNoValue = (host: IndicatorWidgetHost): string => {
  const L = host.state.language;
  if (L === "en") return "No value";
  if (L === "ru") return "Нет значения";
  if (L === "uz_lat") return "Qiymat yo‘q";
  return "Қиймат йўқ";
};

export const translateKnownError = (host: IndicatorWidgetHost, msg: string): string => {
  if (host.state.language === "en") return msg;
  const L = host.state.language;
  const pick = (ru: string, uzLat: string, uzCyr: string) =>
    L === "ru" ? ru : L === "uz_lat" ? uzLat : uzCyr;

  const table: Record<string, [string, string, string]> = {
    "Map view has no map": [
      "У карты нет вида карты",
      "Xarita ko‘rinishi yo‘q",
      "Харита кўриниши йўқ",
    ],
    "No suitable feature layers found in the map.": [
      "На карте нет подходящих векторных слоёв",
      "Xaritada mos feature layer topilmadi",
      "Харитада мос feature layer топилмади",
    ],
    "No feature layer available": [
      "Нет доступного векторного слоя",
      "Feature layer mavjud emas",
      "Feature layer мавжуд эмас",
    ],
    "Select attribute field for this aggregation": [
      "Выберите поле атрибутов для агрегации",
      "Agregatsiya uchun attribut maydonini tanlang",
      "Агрегация учун атрибут майдонини танланг",
    ],
    "Failed to fetch data from API": [
      "Не удалось получить данные по API",
      "API dan ma’lumot olinmadi",
      "API дан маълумот олинмади",
    ],
    "Query failed": [
      "Ошибка запроса",
      "So‘rov xatosi",
      "Сўров хатоси",
    ],
  };

  const row = table[msg];
  if (row) return pick(row[0], row[1], row[2]);
  return msg;
};

export const handleLanguageChange = (host: IndicatorWidgetHost, event: Event) => {
  if (!host._isMounted || host._isResetting) return;
  const d = readPanelEventDetail(event);
  const raw = d.lang ?? d.language ?? d.code;
  const next = normalizeLanguage(raw);
  if (next === host.state.language) return;
  host.setState({ language: next });
};

// ── API-side canonicalization (ASCII apostrophe; normalize o'/g')
export const normalizeUzbekForApi = (host: IndicatorWidgetHost, s: string): string => {
  return normalizeUzbekPlaceForApi(s);
};

// Find field type on the active feature layer (if available)
export const getFieldType = (host: IndicatorWidgetHost, name: string): string | null => {
  const fl = host.state.featureLayer;
  if (!fl?.fields) return null;
  const f = fl.fields.find(
    (ff) => ff.name.toLowerCase() === (name || "").toLowerCase(),
  );
  return f?.type || null;
};

// Zero-like filter that works for numeric *and* string fields
export const nz = (host: IndicatorWidgetHost, field: string) => {
  const f = (field || "").trim();
  if (!f) return "(1=1)";

  const t = (host.getFieldType(f) || "").toLowerCase();
  if (/(smallinteger|integer|double|single|float)/.test(t)) {
    return `(${f} > 0)`;
  }
  return `(${f} IS NOT NULL AND ${f} <> '' AND ${f} NOT IN ('0','00','0.0','0,0','-'))`;
};

// Variants generator for retries (API **only**). Cap glyph fan-out —
// ASCII-normalized first, then at most 2 extra apostrophe forms.
export const makeApostropheVariants = (host: IndicatorWidgetHost, s: string): string[] => {
  if (!s) return [""];
  const baseAscii = host.normalizeUzbekForApi(s);
  if (!/['\u02BB\u02BC\u2019\u2018\u2032\u2035`´ˊˋ]/.test(s)) {
    return [baseAscii];
  }
  const variants = ["'", "\u02BB", "\u2019"]; // ASCII, ʻ, ’
  const set = new Set<string>();

  for (const a of variants) {
    let v = s
      .replace(/[\u02BB\u02BC\u2019\u2018\u2032\u2035`´ˊˋ]/g, a)
      .replace(/o['\u02BB\u02BC\u2019\u2018`´ˊˋ]/gi, "o" + a)
      .replace(/g['\u02BB\u02BC\u2019\u2018`´ˊˋ]/gi, "g" + a)
      .replace(/\s+/g, " ")
      .trim();
    set.add(v);
  }

  set.delete(baseAscii);
  return [baseAscii, ...Array.from(set)].slice(0, 3);
};

// District/city suffix variants for API tries
export const makeDistrictSuffixVariants = (host: IndicatorWidgetHost, raw: string): string[] => {
  if (!raw) return [""];
  const s = raw.trim();
  const hasTumani = /\btumani$/i.test(s);
  const hasShahar = /\bshahar$|\bshahri$/i.test(s);

  const bases = host.makeApostropheVariants(s);
  const out = new Set<string>();

  for (const b of bases) {
    const n = host.normalizeUzbekForApi(b);
    out.add(n);
    if (!hasTumani && !hasShahar) {
      out.add(`${n} tumani`);
      out.add(`${n} shahar`);
      out.add(`${n} shahri`);
    }
  }
  return Array.from(out);
};

// Region suffix variants for API tries (viloyat vs shahar)
export const makeRegionSuffixVariants = (host: IndicatorWidgetHost, raw: string): string[] => {
  if (!raw) return [""];
  const s = raw.trim();
  const bases = host.makeApostropheVariants(s);

  const looksVil = /\bviloyati$/i.test(s);
  const looksSh = /\bshahar$/i.test(s);

  const out = new Set<string>();
  for (const b of bases) {
    const n = host.normalizeUzbekForApi(b);
    out.add(n);
    if (!looksVil && !looksSh) {
      out.add(`${n} viloyati`);
      out.add(`${n} shahar`);
    }
  }
  return Array.from(out);
};

export function normalizeTurlar(host: IndicatorWidgetHost, raw: unknown, fallback = ""): string[] {
  return normalizeTurlarListSql(raw, fallback);
}

export function buildTurlarClause(host: IndicatorWidgetHost, field: string, values: string[]): string {
  return buildTurlarSqlClause(field, values);
}

export function shouldFetchForViloyat(host: IndicatorWidgetHost): boolean {
  // Allow republic-wide fetch when year is set; viloyat not required.
  return !!(host.state.selectedYil || "").trim();
}

export const prepareVhJoinIds = async (host: IndicatorWidgetHost, ids: string[] | null): Promise<void> => {
  if (!Array.isArray(ids) || !ids.length) {
    host._vhJoinSource = ids ?? null;
    host._vhJoinExpanded = null;
    return;
  }
  try {
    const expanded = await expandUniqueIdsForAgriTable(ids);
    host._vhJoinSource = ids;
    host._vhJoinExpanded = expanded;
    agriVhIndicatorLog("2-id-moslash", {
      widgetId: host.props?.id,
      inputCount: ids.length,
      expandedCount: expanded.length,
      inputSample: ids.slice(0, 2),
      expandedSample: expanded.slice(0, 4),
    });
  } catch (err: unknown) {
    host._vhJoinSource = ids;
    host._vhJoinExpanded = null;
    agriVhIndicatorLog("2-id-moslash-XATO", {
      widgetId: host.props?.id,
      inputCount: ids.length,
      error: errorMessage(err),
    });
  }
};
