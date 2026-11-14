import type { PopupWidgetHost } from "../popup-host";
import { normalizeLang } from "../messages";
import type { PopupLanguageDetail, PopupThemeDetail } from "../popup-types";

export const setupThemeObserver = (host: PopupWidgetHost): void => {
  const root = document.documentElement;
  const body = document.body;
  host.themeObserver = new MutationObserver(() => {
    const isDarkTheme = host.getResolvedTheme();
    if (host._isMounted && isDarkTheme !== host.state.isDarkTheme) {
      host.setState({ isDarkTheme });
    }
  });

  host.themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  host.themeObserver.observe(body, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

export const handleThemeChange = (host: PopupWidgetHost, e: CustomEvent<PopupThemeDetail> | null | undefined): void => {
  if (!host._isMounted) return;
  const detail: PopupThemeDetail = e?.detail || {};
  let isDarkTheme = host.getResolvedTheme();

  const flag = detail.isDarkTheme;
  if (typeof flag === "boolean") {
    isDarkTheme = flag;
  } else if (typeof detail.theme === "string") {
    isDarkTheme = String(detail.theme).toLowerCase() !== "light";
  }

  if (isDarkTheme !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme });
  }
};

export const handleLanguageChange = (host: PopupWidgetHost, e: CustomEvent<PopupLanguageDetail> | null | undefined): void => {
  if (!host._isMounted) return;
  const lang = e?.detail?.lang || e?.detail?.language || e?.detail?.code;
  const normalized = normalizeLang(lang);
  if (normalized !== host.state.currentLang) {
    host.setState({ currentLang: normalized });
  }
};
