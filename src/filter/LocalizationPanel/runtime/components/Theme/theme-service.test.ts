import { makeFakeHost } from "../__test-utils__/fake-host";
import {
  applyThemeByValue,
  applyThemeToDom,
  handleDocumentClick,
  handleThemeChange,
  initializeTheme,
  resolveThemeState,
} from "./theme-service";

const THEME_KEY = "agri_v11_app_theme";

const resetDom = (): void => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.className = "";
  document.body.className = "";
  document.body.innerHTML = "";
};

describe("theme-service", () => {
  beforeEach(resetDom);

  describe("resolveThemeState", () => {
    test("prefers the saved localStorage theme", () => {
      localStorage.setItem(THEME_KEY, "light");
      document.documentElement.setAttribute("data-theme", "dark");
      expect(resolveThemeState(makeFakeHost())).toBe(false);
      localStorage.setItem(THEME_KEY, "dark");
      expect(resolveThemeState(makeFakeHost())).toBe(true);
    });

    test("falls back to the data-theme attribute", () => {
      document.documentElement.setAttribute("data-theme", "LIGHT");
      expect(resolveThemeState(makeFakeHost())).toBe(false);
      document.documentElement.setAttribute("data-theme", "dark");
      expect(resolveThemeState(makeFakeHost())).toBe(true);
    });

    test("reads dark/light classes from root or body", () => {
      document.body.className = "theme-dark";
      expect(resolveThemeState(makeFakeHost())).toBe(true);
      document.body.className = "";
      document.documentElement.className = "light-theme";
      expect(resolveThemeState(makeFakeHost())).toBe(false);
    });

    test("defaults to dark when nothing is known", () => {
      localStorage.setItem(THEME_KEY, "purple");
      expect(resolveThemeState(makeFakeHost())).toBe(true);
    });
  });

  test("applyThemeToDom toggles attribute, classes and background", () => {
    applyThemeToDom(makeFakeHost(), true);
    const root = document.documentElement;
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(root.classList.contains("dark-theme")).toBe(true);
    expect(document.body.classList.contains("light-theme")).toBe(false);
    expect(root.classList.contains("agri-app-bg-dark")).toBe(true);

    applyThemeToDom(makeFakeHost(), false);
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(document.body.classList.contains("light-theme")).toBe(true);
    expect(root.classList.contains("agri-app-bg-light")).toBe(true);
    expect(root.classList.contains("agri-app-bg-dark")).toBe(false);
  });

  test("initializeTheme stores, applies and announces the resolved theme", () => {
    const applyToDom = jest.fn();
    const host = makeFakeHost({
      resolveThemeState: () => false,
      applyThemeToDom: applyToDom,
    });
    const listener = jest.fn();
    document.addEventListener("agriV11ThemeToggled", listener);

    initializeTheme(host);

    expect(host.state.isDarkTheme).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    expect(applyToDom).toHaveBeenCalledWith(false);
    const event = listener.mock.calls[0][0] as CustomEvent<{ theme: string }>;
    expect(event.detail.theme).toBe("light");
    document.removeEventListener("agriV11ThemeToggled", listener);
  });

  test("handleThemeChange is a no-op when unmounted", () => {
    const host = makeFakeHost({ _isMounted: false });
    handleThemeChange(host, { target: { value: "dark" } });
    expect(host.setState).not.toHaveBeenCalled();
  });

  test("handleThemeChange switches to dark and persists", () => {
    const applyToDom = jest.fn();
    const host = makeFakeHost({ applyThemeToDom: applyToDom });
    handleThemeChange(host, { target: { value: "dark" } });
    expect(host.state.isDarkTheme).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(applyToDom).toHaveBeenCalledWith(true);
  });

  test("handleThemeChange defaults missing value to light", () => {
    const host = makeFakeHost({ applyThemeToDom: jest.fn() });
    handleThemeChange(host, { target: null });
    expect(host.state.isDarkTheme).toBe(false);
  });

  test("applyThemeByValue closes the toolbar menu", () => {
    const host = makeFakeHost({
      applyThemeToDom: jest.fn(),
      state: { openToolbarMenu: "yil" },
    });
    applyThemeByValue(host, "light");
    expect(host.state.openToolbarMenu).toBeNull();
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    const unmounted = makeFakeHost({ _isMounted: false });
    applyThemeByValue(unmounted, "dark");
    expect(unmounted.setState).not.toHaveBeenCalled();
  });

  describe("handleDocumentClick", () => {
    const clickOn = (el: HTMLElement): MouseEvent =>
      ({ target: el }) as unknown as MouseEvent;

    test("closes open menus when clicking outside", () => {
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const host = makeFakeHost({
        state: {
          openToolbarMenu: "language",
          selectedIndexInfoKey: "ndvi",
          graffSearchShowSuggestions: true,
          showProfileMenu: true,
        },
      });
      handleDocumentClick(host, clickOn(outside));
      expect(host.state.openToolbarMenu).toBeNull();
      expect(host.state.selectedIndexInfoKey).toBeNull();
      expect(host.state.graffSearchShowSuggestions).toBe(false);
      expect(host.state.showProfileMenu).toBe(false);
    });

    test("keeps menus open when clicking inside them", () => {
      document.body.innerHTML = `
        <div class="agri-v20-toolbar-group"><span id="t"></span></div>
        <div class="agri-v20-graff-search-wrap"><span id="s"></span></div>
        <div class="agri-v20-profile-wrapper"><span id="p"></span></div>`;
      const host = makeFakeHost({
        state: {
          openToolbarMenu: "yil",
          graffSearchShowSuggestions: true,
          showProfileMenu: true,
        },
      });
      handleDocumentClick(host, clickOn(document.getElementById("t") as HTMLElement));
      expect(host.state.openToolbarMenu).toBe("yil");
      expect(host.state.graffSearchShowSuggestions).toBe(false);
      expect(host.state.showProfileMenu).toBe(false);
      const profileHost = makeFakeHost({ state: { showProfileMenu: true } });
      handleDocumentClick(profileHost, clickOn(document.getElementById("p") as HTMLElement));
      expect(profileHost.state.showProfileMenu).toBe(true);
      const searchHost = makeFakeHost({ state: { graffSearchShowSuggestions: true } });
      handleDocumentClick(searchHost, clickOn(document.getElementById("s") as HTMLElement));
      expect(searchHost.state.graffSearchShowSuggestions).toBe(true);
    });

    test("ignores events without a target", () => {
      const host = makeFakeHost();
      handleDocumentClick(host, { target: null } as unknown as MouseEvent);
      expect(host.setState).not.toHaveBeenCalled();
    });
  });
});
