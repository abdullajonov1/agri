/**
 * Typed read boundary for dashboard CustomEvent details consumed by the
 * Bar / Pie / Indicator / Region panels. The filter store publishes
 * `Record<string, unknown>`; panels read it through these shapes instead of
 * `any` so field access stays checked.
 */
import type { AgriLanguage } from "../shared/agri-language";
import { toPlainRecord } from "../shared/agri-plain-object";

/** `detail.filters` of masterFilterChanged (all optional — producers vary). */
export interface PanelFilterFields {
  yil?: string;
  viloyat?: string;
  tuman?: string;
  turi?: string;
  tur?: string;
  turlar?: unknown[];
  vh?: string;
  ndviDate?: string;
  ndviDateLocked?: boolean;
  language?: string;
  farmerInn?: string;
  uniqueid?: string;
  polygonMode?: boolean;
  filterPieByVh?: boolean;
  barCategoryField?: string | null;
  barCategoryValue?: string | null;
  chartDimOrder?: unknown;
  yerToifas?: unknown;
  [key: string]: unknown;
}

export interface PanelFilterScope {
  lockedViloyat?: string | null;
  [key: string]: unknown;
}

export interface PanelVhBarData {
  /** Category rows from VH bar prep; consumers narrow to their own row type. */
  categories?: unknown[];
  totalCount?: number;
}

/** Detail of masterFilterChanged / legacy filter CustomEvents. */
export interface PanelFilterDetail extends PanelFilterFields {
  filters?: PanelFilterFields;
  scope?: PanelFilterScope;
  source?: string;
  meta?: Record<string, unknown>;
  vhUniqueids?: unknown;
  vhRegionChartUniqueids?: unknown;
  vhBarDataPending?: boolean;
  vhBarData?: PanelVhBarData | null;
  category?: string;
  status?: string;
  cropType?: string;
  ekin_turi?: string;
  year?: string | number;
  lang?: string;
  code?: string;
  isDarkTheme?: boolean;
  theme?: string;
}

/**
 * Read a CustomEvent detail as a plain record. Unwraps seamless-immutable
 * values; returns `{}` for missing / non-object details.
 */
export const readPanelEventDetail = (event: Event | null | undefined): PanelFilterDetail => {
  const detail = (event as CustomEvent<unknown> | null | undefined)?.detail;
  return (toPlainRecord(detail) ?? {}) as PanelFilterDetail;
};

const AGRI_LANGUAGES: readonly AgriLanguage[] = ["uz_cyr", "uz_lat", "ru", "en"];

export const isAgriLanguage = (value: unknown): value is AgriLanguage =>
  typeof value === "string" && (AGRI_LANGUAGES as readonly string[]).includes(value);

/** Accept an incoming language only when it is a known dashboard language. */
export const toPanelLanguage = (
  value: unknown,
  fallback: AgriLanguage,
): AgriLanguage => (isAgriLanguage(value) ? value : fallback);

/** Theme from a `themeToggled`-style detail, or null when it carries none. */
export const readThemeIsDark = (detail: PanelFilterDetail): boolean | null => {
  if (typeof detail.isDarkTheme === "boolean") return detail.isDarkTheme;
  if (detail.theme === "dark" || detail.theme === "light") {
    return detail.theme === "dark";
  }
  return null;
};

/** Normalise `turlar` / `turi` into a clean string list. */
export const readTurlar = (filters: PanelFilterFields): string[] => {
  if (Array.isArray(filters.turlar)) {
    return filters.turlar.map((value) => String(value || "")).filter(Boolean);
  }
  return filters.turi ? [String(filters.turi)] : [];
};

/**
 * `.message` of a thrown value (Error or esri error-like object), or "" when
 * it has none — lets callers keep their own fallback text.
 */
export const messageOf = (error: unknown): string => {
  if (error instanceof Error) return error.message || "";
  const message = toPlainRecord(error)?.message;
  return message == null ? "" : String(message);
};

/** CSS custom properties are not in React.CSSProperties; type them once. */
export type CssVarStyle = Record<`--${string}`, string>;
