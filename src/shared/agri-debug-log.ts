/**
 * Opt-in debug logging for Agro_widgetV5.
 *
 * Enable in browser console:
 *   window.__AGRO_V5_DEBUG = true         // all [AgroV5] logs
 *   window.__AGRO_V5_VH_DEBUG = true      // VH / Pie / Bar filter flow + [AgriVH] vegetation queries
 *   window.__AGRO_V5_TUMAN_DEBUG = true   // tuman select / Pie / Jadval
 *   window.__AGRO_V5_VH_INDICATOR_DEBUG = true // [AgroV5 VH-indikator] logs
 *
 * Every topic is silent by default and logs only when its flag is `true`
 * (window or localStorage), or when `__AGRO_V5_DEBUG` is `true`.
 */
export type AgroV5LogTopic =
  | "all"
  | "vh"
  | "map"
  | "connection"
  | "tuman"
  | "vhIndicator"
  /** Vegetation (VH) query diagnostics — `[AgriVH]` prefix, VH flag. */
  | "agriVh"
  /** Notification-feed diagnostics — `[AgriNotify]` prefix, global flag. */
  | "notify";

/**
 * The one console sink for opt-in debug output. Every debug line in the
 * widget goes through agroV5Log(), which checks the flags above first.
 */
const debugConsole: Pick<Console, "log"> | undefined = globalThis.console;

/**
 * `window.<name>` wins; otherwise `localStorage.<name> = "true" | "false"`,
 * which survives a reload — needed to log work that starts on page load
 * (e.g. the republic VH bar).
 */
function readGlobalFlag(name: string): boolean | undefined {
  try {
    const flag: unknown = (globalThis as Record<string, unknown>)?.[name];
    if (flag === true) return true;
    if (flag === false) return false;
    const stored = globalThis.localStorage?.getItem(name);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return undefined;
  } catch {
    return undefined;
  }
}

function isDebugEnabled(topic: AgroV5LogTopic = "all"): boolean {
  if (readGlobalFlag("__AGRO_V5_DEBUG") === true) return true;
  if (
    (topic === "vh" || topic === "agriVh") &&
    readGlobalFlag("__AGRO_V5_VH_DEBUG") === true
  ) {
    return true;
  }
  if (topic === "tuman") {
    return readGlobalFlag("__AGRO_V5_TUMAN_DEBUG") === true;
  }
  if (topic === "vhIndicator") {
    return readGlobalFlag("__AGRO_V5_VH_INDICATOR_DEBUG") === true;
  }
  return false;
}

const LOG_PREFIX: Partial<Record<AgroV5LogTopic, string>> = {
  tuman: "[AgroV5 tuman]",
  vhIndicator: "[AgroV5 VH-indikator]",
  agriVh: "[AgriVH]",
  notify: "[AgriNotify]",
};

export function agroV5Log(
  phase: string,
  detail?: Record<string, unknown>,
  topic: AgroV5LogTopic = "all",
): void {
  if (!isDebugEnabled(topic)) return;
  try {
    const prefix = LOG_PREFIX[topic] || "[AgroV5]";
    debugConsole?.log(`${prefix} ${phase}`, detail ?? {});
  } catch {
    /* ignore */
  }
}

/** Tuman selection diagnosis — `[AgroV5 tuman]` prefix, tuman flag. */
export function agriTumanLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  agroV5Log(phase, detail, "tuman");
}

/** Trace of how a VH selection reaches the area indicator — VH-indicator flag. */
export function agriVhIndicatorLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  agroV5Log(phase, detail, "vhIndicator");
}
