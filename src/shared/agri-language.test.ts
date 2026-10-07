import {
  AGRI3_LANG_PREF_KEY_V3,
  detectIsDarkTheme,
  ensureAgri3UzLatLanguageDefault,
  normalizeLanguage,
  resolveInitialLanguage,
} from "./agri-language";
import { agriNoDataLabel } from "./agriNoDataLabel";
import {
  isCurrentIndicatorRequest,
  isStaleMasterFilterEvent,
  nextIndicatorRequestId,
  recordMasterFilterMeta,
  type MasterFilterMetaState,
} from "./agri-indicator-common";

function setSearch(search: string): void {
  window.history.replaceState(null, "", `/${search}`);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  setSearch("");
  jest.restoreAllMocks();
});

describe("normalizeLanguage", () => {
  test.each([
    ["en", "en"],
    ["English", "en"],
    [" RU ", "ru"],
    ["russian", "ru"],
    ["uz_cyr", "uz_cyr"],
    ["uz-Cyrl", "uz_cyr"],
    ["uz_lat", "uz_lat"],
    ["uz-latn", "uz_lat"],
    ["uz", "uz_lat"],
    ["fr", "uz_lat"],
    ["", "uz_lat"],
  ])("%p -> %p", (raw, expected) => {
    expect(normalizeLanguage(raw)).toBe(expected);
  });

  test("null/undefined default to uz_lat", () => {
    expect(normalizeLanguage(null)).toBe("uz_lat");
    expect(normalizeLanguage(undefined)).toBe("uz_lat");
  });
});

describe("ensureAgri3UzLatLanguageDefault", () => {
  test("first run seeds uz_lat and marks initialized", () => {
    ensureAgri3UzLatLanguageDefault();
    expect(localStorage.getItem("app_lang")).toBe("uz_lat");
    expect(localStorage.getItem("agro_lang")).toBe("uz_lat");
    expect(localStorage.getItem(AGRI3_LANG_PREF_KEY_V3)).toBe("1");
  });

  test("does not overwrite a choice after initialization", () => {
    localStorage.setItem(AGRI3_LANG_PREF_KEY_V3, "1");
    localStorage.setItem("app_lang", "ru");
    ensureAgri3UzLatLanguageDefault();
    expect(localStorage.getItem("app_lang")).toBe("ru");
  });

  test("swallows storage errors", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => ensureAgri3UzLatLanguageDefault()).not.toThrow();
  });
});

describe("resolveInitialLanguage", () => {
  test("URL ?lang wins over storage", () => {
    localStorage.setItem(AGRI3_LANG_PREF_KEY_V3, "1");
    localStorage.setItem("app_lang", "ru");
    setSearch("?lang=en");
    expect(resolveInitialLanguage()).toBe("en");
  });

  test("falls back to storage keys in order", () => {
    localStorage.setItem(AGRI3_LANG_PREF_KEY_V3, "1");
    localStorage.setItem("agri_app_lang", "uz_cyr");
    expect(resolveInitialLanguage()).toBe("uz_cyr");
  });

  test("first run defaults to uz_lat", () => {
    expect(resolveInitialLanguage()).toBe("uz_lat");
  });

  test("returns uz_lat when storage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(resolveInitialLanguage()).toBe("uz_lat");
  });
});

describe("detectIsDarkTheme", () => {
  test("saved preference wins", () => {
    localStorage.setItem("agri_v11_app_theme", "light");
    document.documentElement.setAttribute("data-theme", "dark");
    expect(detectIsDarkTheme()).toBe(false);
    localStorage.setItem("agri_v11_app_theme", "dark");
    expect(detectIsDarkTheme()).toBe(true);
  });

  test("falls back to DOM attribute", () => {
    document.documentElement.setAttribute("data-theme", "light");
    expect(detectIsDarkTheme()).toBe(false);
    document.documentElement.setAttribute("data-theme", "dark");
    expect(detectIsDarkTheme()).toBe(true);
  });

  test("defaults to dark", () => {
    expect(detectIsDarkTheme()).toBe(true);
  });
});

describe("agriNoDataLabel", () => {
  test.each([
    ["en", "No data found"],
    ["ru", "Данные не найдены"],
    ["uz_cyr", "Маълумот топилмади"],
    ["uz_lat", "Ma'lumot topilmadi"],
    ["xx", "Ma'lumot topilmadi"],
  ])("%s", (lang, label) => {
    expect(agriNoDataLabel(lang)).toBe(label);
  });
});

describe("indicator master-filter meta", () => {
  const state = (ts: number, gen: number): MasterFilterMetaState => ({
    lastMasterFilterTs: ts,
    lastMasterFilterBroadcastGeneration: gen,
  });

  test("older generation is stale", () => {
    expect(isStaleMasterFilterEvent(500, 2, state(100, 3))).toBe(true);
  });

  test("older timestamp is stale", () => {
    expect(isStaleMasterFilterEvent(50, 0, state(100, 3))).toBe(true);
  });

  test("newer or unknown meta is not stale", () => {
    expect(isStaleMasterFilterEvent(200, 4, state(100, 3))).toBe(false);
    expect(isStaleMasterFilterEvent(0, 0, state(100, 3))).toBe(false);
    expect(isStaleMasterFilterEvent(50, 1, state(0, 0))).toBe(false);
  });

  test("recordMasterFilterMeta only records positive values", () => {
    const s = state(10, 1);
    recordMasterFilterMeta(0, 0, s);
    expect(s).toEqual(state(10, 1));
    recordMasterFilterMeta(20, 5, s);
    expect(s).toEqual(state(20, 5));
  });

  test("request id helpers", () => {
    expect(nextIndicatorRequestId(4)).toBe(5);
    expect(isCurrentIndicatorRequest(5, 5, true)).toBe(true);
    expect(isCurrentIndicatorRequest(5, 5, false)).toBe(false);
    expect(isCurrentIndicatorRequest(4, 5, true)).toBe(false);
  });
});
