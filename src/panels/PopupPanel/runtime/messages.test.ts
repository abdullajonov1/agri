import { getInitialLang, getInitialTheme, normalizeLang, t } from "./messages";

describe("PopupPanel messages", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    document.body.className = "";
  });

  test.each([
    ["en", "en"],
    ["English", "en"],
    ["RUS", "ru"],
    ["uz-cyrl", "uz_cyr"],
    ["cyrillic", "uz_cyr"],
    ["uz", "uz_lat"],
    ["uz-latin", "uz_lat"],
    ["", "uz_lat"],
    [null, "uz_lat"],
    ["fr", "uz_lat"],
  ])("normalizeLang(%p) -> %s", (input, expected) => {
    expect(normalizeLang(input)).toBe(expected);
  });

  test("getInitialLang reads agri_app_lang then app_lang", () => {
    expect(getInitialLang()).toBe("uz_lat");
    localStorage.setItem("app_lang", "ru");
    expect(getInitialLang()).toBe("ru");
    localStorage.setItem("agri_app_lang", "en");
    expect(getInitialLang()).toBe("en");
  });

  test("getInitialTheme honours storage then DOM light markers", () => {
    expect(getInitialTheme()).toBe(true);
    document.body.classList.add("light-theme");
    expect(getInitialTheme()).toBe(false);
    document.body.className = "";
    document.documentElement.setAttribute("data-theme", "light");
    expect(getInitialTheme()).toBe(false);
    localStorage.setItem("agri_v11_app_theme", "dark");
    expect(getInitialTheme()).toBe(true);
    localStorage.setItem("agri_v11_app_theme", "light");
    expect(getInitialTheme()).toBe(false);
  });

  test("t translates, interpolates and falls back to english or the key", () => {
    expect(t("en", "status.loading")).toBe("Loading...");
    expect(t("en", "error.objectIdMissing", { field: "OID" })).toContain("OID");
    expect(t("uz_lat", "title.record", { id: 7 })).toBe("Ma'lumot #7");
    expect(t("ru", "missing.key")).toBe("missing.key");
  });
});
