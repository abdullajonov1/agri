import { fetchJson, isAgriHttpError } from "../../../../../shared/agri-http";

/** A hung indicator API must not leave the card spinning forever. */
export const INDICATOR_API_TIMEOUT_MS = 20000;

/** Indicator payloads are a single number; anything bigger is not ours. */
const INDICATOR_API_MAX_BYTES = 1024 * 1024;

const DEFAULT_VALUE_KEYS = ["total", "value", "count", "maydon"];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const toFiniteNumber = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Picks the indicator value from `{key}` or `{result: {key}}`, trying the
 * configured field first, then the known API keys. A bare number is accepted.
 */
export function parseIndicatorApiValue(data: unknown, responseField: string): number | null {
  if (typeof data === "number") return toFiniteNumber(data);
  if (!isRecord(data)) return null;

  const keys = [responseField.trim(), ...DEFAULT_VALUE_KEYS].filter(Boolean);
  const nested = isRecord(data.result) ? data.result : null;
  for (const key of keys) {
    const direct = key in data ? toFiniteNumber(data[key]) : null;
    if (direct != null) return direct;
    const inner = nested && key in nested ? toFiniteNumber(nested[key]) : null;
    if (inner != null) return inner;
  }
  return null;
}

/**
 * GETs the indicator API and returns the parsed value (null when the payload
 * has no number). HTTP failures keep the legacy "API request failed with
 * status N" message; a caller abort re-throws the native AbortError.
 */
export async function requestIndicatorApiValue(
  url: string,
  signal: AbortSignal | null,
  responseField: string,
): Promise<number | null> {
  try {
    const data = await fetchJson(url, {
      timeoutMs: INDICATOR_API_TIMEOUT_MS,
      maxBytes: INDICATOR_API_MAX_BYTES,
      signal,
      init: { method: "GET", headers: { Accept: "application/json" } },
    });
    return parseIndicatorApiValue(data, responseField);
  } catch (err: unknown) {
    if (isAgriHttpError(err) && err.kind === "http") {
      throw new Error(`API request failed with status ${err.status}`);
    }
    throw err;
  }
}
