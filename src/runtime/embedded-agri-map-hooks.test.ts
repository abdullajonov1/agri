import { act, renderHook } from "@testing-library/react";
import { type DataSource } from "jimu-core";
import { installAgriCorsGuard, recreateDataSource } from "../shared/agri-cors-guard";
import {
  normalizeMapLanguage,
  useAutomaticBasemap,
  useBasemapMenuOpenClass,
  useLatestCallbackRefs,
  useMapLanguage,
  useRootDataSourceRetry,
  useThemeAndRegionListeners,
} from "./embedded-agri-map-hooks";

jest.mock("../gis/agri-admin-boundary-layer", () => ({
  setAgriAdminBordersVisible: jest.fn(async (): Promise<void> => undefined),
}));
jest.mock("../shared/agri-cors-guard", () => ({
  installAgriCorsGuard: jest.fn(async () => ({ added: [], removedRules: 0 })),
  recreateDataSource: jest.fn(),
}));

describe("embedded-agri-map-hooks", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
    jest.mocked(installAgriCorsGuard).mockClear();
    jest.mocked(recreateDataSource).mockReset();
  });

  it("normalizes language aliases", () => {
    expect(normalizeMapLanguage("English")).toBe("en");
    expect(normalizeMapLanguage("ru")).toBe("ru");
    expect(normalizeMapLanguage("uz-cyr")).toBe("uz_cyr");
    expect(normalizeMapLanguage("garbage")).toBe("uz_lat");
  });

  it("useMapLanguage reads storage and follows languageChanged", () => {
    window.localStorage.setItem("agri_app_lang", "ru");
    const { result } = renderHook(() => useMapLanguage());
    expect(result.current).toBe("ru");
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "en" } }));
    });
    expect(result.current).toBe("en");
  });

  it("useBasemapMenuOpenClass toggles the root class and cleans up", () => {
    const { rerender, unmount } = renderHook(({ open }) => { useBasemapMenuOpenClass(open); }, {
      initialProps: { open: true },
    });
    expect(document.documentElement.classList.contains("agri-basemap-menu-open")).toBe(true);
    rerender({ open: false });
    expect(document.documentElement.classList.contains("agri-basemap-menu-open")).toBe(false);
    unmount();
  });

  it("useLatestCallbackRefs keeps refs on the newest callbacks", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useLatestCallbackRefs(undefined, cb, undefined),
      { initialProps: { cb: first as (loading: boolean) => void } },
    );
    expect(result.current.onLoadingChangeRef.current).toBe(first);
    rerender({ cb: second });
    expect(result.current.onLoadingChangeRef.current).toBe(second);
  });

  it("useThemeAndRegionListeners forwards theme and filter events", () => {
    const setDark = jest.fn();
    const setRegion = jest.fn();
    const { unmount } = renderHook(() => { useThemeAndRegionListeners(setDark, setRegion); });
    act(() => {
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { isDarkTheme: false } }));
      document.dispatchEvent(new CustomEvent("masterFilterChanged", { detail: { filters: { viloyat: "A" } } }));
    });
    expect(setDark).toHaveBeenCalledWith(false);
    expect(setRegion).toHaveBeenCalledWith(true);
    unmount();
    setDark.mockClear();
    document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { isDarkTheme: true } }));
    expect(setDark).not.toHaveBeenCalled();
  });

  it("useAutomaticBasemap sets the basemap and closes the menu", () => {
    const map = { basemap: "gray-vector" };
    const viewRef = { current: { map, destroyed: false } as unknown as __esri.MapView };
    const mapRef = { current: null };
    const setActive = jest.fn();
    const setMenu = jest.fn();
    renderHook(() => { useAutomaticBasemap("satellite", viewRef, mapRef, setActive, setMenu); });
    expect(map.basemap).toBe("satellite");
    expect(setActive).toHaveBeenCalledWith("satellite");
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("useAutomaticBasemap does nothing without a map", () => {
    const setActive = jest.fn();
    renderHook(() => {
      useAutomaticBasemap("satellite", { current: null }, { current: null }, setActive, jest.fn());
    });
    expect(setActive).not.toHaveBeenCalled();
  });

  it("useRootDataSourceRetry recreates once, then reports the failure", async () => {
    const created = { id: "wm" } as unknown as DataSource;
    jest.mocked(recreateDataSource).mockResolvedValueOnce(created as never);
    const setDs = jest.fn();
    const refs = {
      onLoadingChangeRef: { current: jest.fn() },
      onErrorRef: { current: jest.fn() },
    };
    const { result } = renderHook(() => useRootDataSourceRetry("wm", setDs, refs));
    await act(async () => { await result.current(); });
    expect(setDs).toHaveBeenCalledWith(created);
    expect(refs.onErrorRef.current).not.toHaveBeenCalled();
    await act(async () => { await result.current(); });
    expect(recreateDataSource).toHaveBeenCalledTimes(1);
    expect(refs.onLoadingChangeRef.current).toHaveBeenCalledWith(false);
    expect(refs.onErrorRef.current).toHaveBeenCalledWith(expect.stringContaining("Web Map"));
  });
});
