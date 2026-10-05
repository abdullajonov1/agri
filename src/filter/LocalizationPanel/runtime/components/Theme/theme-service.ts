import type { LocalizationHost } from "../host";
import { applyAppBackgroundTheme } from "../../../../localization/app-theme";

export const resolveThemeState = (host: LocalizationHost) => {
  try {
    const savedTheme = localStorage.getItem("agri_v11_app_theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme === "dark";
    }
  } catch {
    // ignore storage read errors
  }

  const root = document.documentElement;
  const body = document.body;
  const attr = String(root.getAttribute("data-theme") || "")
    .trim()
    .toLowerCase();
  if (attr === "dark") return true;
  if (attr === "light") return false;

  const rootClass = (root.className || "").toLowerCase();
  const bodyClass = (body.className || "").toLowerCase();
  if (
    /\bdark-theme\b|\btheme-dark\b|\bdark\b/.test(rootClass) ||
    /\bdark-theme\b|\btheme-dark\b|\bdark\b/.test(bodyClass)
  ) {
    return true;
  }
  if (
    /\blight-theme\b|\btheme-light\b|\blight\b/.test(rootClass) ||
    /\blight-theme\b|\btheme-light\b|\blight\b/.test(bodyClass)
  ) {
    return false;
  }

  return true;
};

export const initializeTheme = (host: LocalizationHost) => {
  const isDarkTheme = host.resolveThemeState();
  host.setState({ isDarkTheme });
  try {
    localStorage.setItem(
      "agri_v11_app_theme",
      isDarkTheme ? "dark" : "light",
    );
  } catch {
    // ignore storage access errors
  }
  host.applyThemeToDom(isDarkTheme);
  document.dispatchEvent(
    new CustomEvent("agriV11ThemeToggled", {
      detail: { isDarkTheme, theme: isDarkTheme ? "dark" : "light" },
      bubbles: true,
    }),
  );
};

export const applyThemeToDom = (host: LocalizationHost, isDarkTheme: boolean) => {
  const root = document.documentElement;
  const body = document.body;
  const theme = isDarkTheme ? "dark" : "light";

  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark-theme", isDarkTheme);
  body.classList.toggle("dark-theme", isDarkTheme);
  root.classList.toggle("light-theme", !isDarkTheme);
  body.classList.toggle("light-theme", !isDarkTheme);

  // Keep page background in sync with theme (same as AgriLocalization)
  applyAppBackgroundTheme(theme);
};

export const handleThemeChange = (host: LocalizationHost, event: any) => {
  if (!host._isMounted) return;
  const value = String(event?.target?.value || "light");
  const isDarkTheme = value === "dark";

  host.setState({ isDarkTheme }, () => {
    try {
      localStorage.setItem("agri_v11_app_theme", isDarkTheme ? "dark" : "light");
    } catch {
      // ignore storage errors
    }

    host.applyThemeToDom(isDarkTheme);

    document.dispatchEvent(
      new CustomEvent("agriV11ThemeToggled", {
        detail: { isDarkTheme, theme: isDarkTheme ? "dark" : "light" },
        bubbles: true,
      }),
    );
  });
};

export const handleDocumentClick = (host: LocalizationHost, event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const inToolbar =
    !!target.closest(".agri-v20-toolbar-group") ||
    !!target.closest(".agri-v20-floating-overlay");
  const inSearch =
    !!target.closest(".agri-v20-graff-search-wrap") ||
    !!target.closest(".agri-v20-graff-search-dropdown-floating");

  if (!inToolbar && host.state.openToolbarMenu) {
    host.setState({ openToolbarMenu: null, selectedIndexInfoKey: null });
  }

  if (!inSearch && host.state.graffSearchShowSuggestions) {
    host.setState({ graffSearchShowSuggestions: false });
  }

  const inProfile =
    !!target.closest(".agri-v20-profile-wrapper") ||
    !!target.closest(".agri-v20-profile-dropdown");
  if (!inProfile && host.state.showProfileMenu) {
    host.setState({ showProfileMenu: false });
  }
};

export const applyThemeByValue = (host: LocalizationHost, value: "light" | "dark") => {
  if (!host._isMounted) return;
  const isDarkTheme = value === "dark";

  host.setState({ isDarkTheme, openToolbarMenu: null }, () => {
    try {
      localStorage.setItem("agri_v11_app_theme", isDarkTheme ? "dark" : "light");
    } catch {
      // ignore storage errors
    }

    host.applyThemeToDom(isDarkTheme);

    document.dispatchEvent(
      new CustomEvent("agriV11ThemeToggled", {
        detail: { isDarkTheme, theme: isDarkTheme ? "dark" : "light" },
        bubbles: true,
      }),
    );
  });
};
