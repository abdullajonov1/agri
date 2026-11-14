/**
 * Shared crop (turlar / turi) list normalisation for the panels.
 */
import { normalizeApos } from "../shared/agri-sql";

export interface NormalizeTurlarOptions {
  /** Drop repeated values (first occurrence wins). */
  dedupe?: boolean;
  /** Applied to each stringified value before empties are dropped. */
  normalize?: (value: string) => string;
  /** Converts each raw value to text (default: `String(value || "")`). */
  stringify?: (value: unknown) => string;
  /** Used when `raw` is neither an array nor a truthy single value. */
  fallback?: string;
}

/** Source list from a master-filter detail: `turlar` array, else single `turi`. */
export function turlarSourceFromDetail(detail: {
  turlar?: unknown;
  turi?: unknown;
}): unknown[] {
  if (Array.isArray(detail.turlar)) return detail.turlar;
  return detail.turi ? [detail.turi] : [];
}

/** array | single truthy value | fallback -> clean string list. */
export function normalizeTurlar(
  raw: unknown,
  options: NormalizeTurlarOptions = {},
): string[] {
  const {
    dedupe = false,
    normalize,
    fallback = "",
    stringify = (value: unknown): string => String(value || ""),
  } = options;
  const source: unknown[] = Array.isArray(raw)
    ? raw
    : raw
      ? [raw]
      : fallback
        ? [fallback]
        : [];
  const values = source
    .map((value) => {
      const text = stringify(value);
      return normalize ? normalize(text) : text;
    })
    .filter(Boolean);
  return dedupe ? Array.from(new Set(values)) : values;
}

/**
 * Matches IndicatorPanel / IndicatorYieldPanel historical normalizeTurlar:
 * agri-sql apostrophe normalize; unique.
 */
export function normalizeTurlarListSql(raw: unknown, fallback = ""): string[] {
  return normalizeTurlar(raw, { dedupe: true, normalize: normalizeApos, fallback });
}
