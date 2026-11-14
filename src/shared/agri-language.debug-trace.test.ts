import { agroV5Log } from "../gis/agri-debug-log";
import { detectIsDarkTheme, ensureAgri3UzLatLanguageDefault, resolveInitialLanguage } from "./agri-language";

jest.mock("../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

const logMock = agroV5Log as jest.Mock;

describe("agri-language debug traces", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    logMock.mockClear();
  });

  test("traces storage failure while seeding the default language", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => ensureAgri3UzLatLanguageDefault()).not.toThrow();
    expect(logMock).toHaveBeenCalledWith("language:default-storage-failed", { error: "denied" });
  });

  test("traces failure and keeps the uz_lat fallback when resolving language", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(resolveInitialLanguage()).toBe("uz_lat");
    expect(logMock).toHaveBeenCalledWith("language:resolve-failed", { error: "denied" });
  });

  test("traces theme detection failure and defaults to dark", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(detectIsDarkTheme()).toBe(true);
    expect(logMock).toHaveBeenCalledWith("language:theme-detect-failed", { error: "denied" });
  });
});
