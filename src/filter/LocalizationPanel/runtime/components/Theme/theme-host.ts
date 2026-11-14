import type { LocalizationHost } from "../host";

export type ThemeHost = Pick<
  LocalizationHost,
  "_isMounted" | "applyThemeToDom" | "resolveThemeState" | "setState" | "state"
>;
