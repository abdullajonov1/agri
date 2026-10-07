import { isAgriLanguage, readThemeIsDark, readTurlar, toPanelLanguage } from "./panel-filter-detail";

describe("panel-filter-detail language/theme/turlar helpers", () => {
  test("isAgriLanguage / toPanelLanguage accept only known codes", () => {
    expect(isAgriLanguage("ru")).toBe(true);
    expect(isAgriLanguage("uz_cyr")).toBe(true);
    expect(isAgriLanguage("fr")).toBe(false);
    expect(isAgriLanguage(3)).toBe(false);
    expect(toPanelLanguage("en", "ru")).toBe("en");
    expect(toPanelLanguage("xx", "uz_lat")).toBe("uz_lat");
  });

  test("readThemeIsDark prefers isDarkTheme then theme string", () => {
    expect(readThemeIsDark({ isDarkTheme: false, theme: "dark" })).toBe(false);
    expect(readThemeIsDark({ theme: "dark" })).toBe(true);
    expect(readThemeIsDark({ theme: "light" })).toBe(false);
    expect(readThemeIsDark({ theme: "blue" })).toBeNull();
    expect(readThemeIsDark({})).toBeNull();
  });

  test("readTurlar normalises arrays and single turi", () => {
    expect(readTurlar({ turlar: ["a", "", "b"] })).toEqual(["a", "b"]);
    expect(readTurlar({ turi: "x" })).toEqual(["x"]);
    expect(readTurlar({})).toEqual([]);
  });
});
