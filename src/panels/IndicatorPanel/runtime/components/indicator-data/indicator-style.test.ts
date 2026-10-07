import { makeIndicatorHost } from "../../__test-utils__/indicator-host-stub";
import {
  getCustomStyles,
  handleThemeChange,
  initializeTheme,
  setupAutoRefresh,
} from "./indicator-style";

describe("indicator-style", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    jest.useRealTimers();
  });

  test("getCustomStyles returns empty style buckets for empty config", () => {
    const { host } = makeIndicatorHost();
    expect(getCustomStyles(host)).toEqual({
      container: {},
      statLabel: {},
      statValue: {},
      iconContainer: {},
      icon: {},
      hasBgOverride: false,
    });
  });

  test("getCustomStyles maps colors, sizes, gradient and clamps opacity", () => {
    const { host } = makeIndicatorHost(
      {},
      {
        backgroundColor: " linear-gradient(red, blue) ",
        textColor: "#fff",
        labelColor: "#aaa",
        borderRadius: "8",
        iconSize: 24,
        iconOpacity: 150,
      },
    );
    const s = getCustomStyles(host);
    expect(s.hasBgOverride).toBe(true);
    expect(s.container).toEqual({
      borderRadius: "8px",
      color: "#fff",
      background: "linear-gradient(red, blue)",
    });
    expect(s.statLabel).toEqual({ color: "#aaa" });
    expect(s.statValue).toEqual({ color: "#fff" });
    expect(s.iconContainer).toEqual({ width: "24px", height: "24px" });
    expect(s.icon).toEqual({ opacity: 1 });
  });

  test("getCustomStyles uses backgroundColor for plain colors and ignores NaN numbers", () => {
    const { host } = makeIndicatorHost(
      {},
      { backgroundColor: "#123", borderRadius: "abc", iconOpacity: 40, iconSize: " " },
    );
    const s = getCustomStyles(host);
    expect(s.container).toEqual({ backgroundColor: "#123" });
    expect(s.icon).toEqual({ opacity: 0.4 });
    expect(s.iconContainer).toEqual({});
  });

  test("initializeTheme prefers saved theme, then DOM attribute, then dark", () => {
    const a = makeIndicatorHost();
    initializeTheme(a.host);
    expect(a.setState).toHaveBeenLastCalledWith({ isDarkTheme: true });

    document.documentElement.setAttribute("data-theme", "light");
    initializeTheme(a.host);
    expect(a.setState).toHaveBeenLastCalledWith({ isDarkTheme: false });

    window.localStorage.setItem("agri_v11_app_theme", "dark");
    initializeTheme(a.host);
    expect(a.setState).toHaveBeenLastCalledWith({ isDarkTheme: true });
  });

  test("handleThemeChange applies detail theme or re-reads stored theme", () => {
    const { host, setState } = makeIndicatorHost();
    handleThemeChange(host, new CustomEvent("x", { detail: { theme: "light" } }));
    expect(setState).toHaveBeenCalledWith({ isDarkTheme: false });
    handleThemeChange(host, new CustomEvent("x", { detail: {} }));
    expect(host.initializeTheme).toHaveBeenCalled();
  });

  test("setupAutoRefresh refreshes only after idle interval while mounted", () => {
    jest.useFakeTimers();
    const { host } = makeIndicatorHost({}, { refreshInterval: 1 });
    host._lastFilterEventMs = 0;
    setupAutoRefresh(host);
    expect(host.refreshTimer).not.toBeNull();
    jest.advanceTimersByTime(60_000);
    expect(host.refreshData).toHaveBeenCalledTimes(1);

    host._isMounted = false;
    jest.advanceTimersByTime(60_000);
    expect(host.refreshData).toHaveBeenCalledTimes(1);
  });

  test("setupAutoRefresh clears existing timer and skips when disabled", () => {
    jest.useFakeTimers();
    const { host } = makeIndicatorHost({}, { autoRefresh: false, refreshInterval: 1 });
    host.refreshTimer = setInterval(() => undefined, 1000);
    setupAutoRefresh(host);
    expect(host.refreshTimer).toBeNull();
  });
});
