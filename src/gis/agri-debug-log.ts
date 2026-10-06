/**
 * Opt-in debug logging for Agro_widgetV5.
 *
 * Enable in browser console:
 *   window.__AGRO_V5_DEBUG = true         // all [AgroV5] logs
 *   window.__AGRO_V5_VH_DEBUG = true      // VH / Pie / Bar filter flow only
 *   window.__AGRO_V5_TUMAN_DEBUG = true   // tuman select / Pie / Jadval (default ON)
 *   window.__AGRO_V5_TUMAN_DEBUG = false  // turn tuman logs off
 *   window.__AGRO_V5_VH_INDICATOR_DEBUG = false // turn [AgroV5 VH-indikator] logs off (default ON)
 */
export type AgroV5LogTopic =
  | "all"
  | "vh"
  | "map"
  | "connection"
  | "tuman"
  | "vhIndicator";

function readGlobalFlag(name: string): boolean | undefined {
  try {
    const g = globalThis as any;
    if (g?.[name] === true) return true;
    if (g?.[name] === false) return false;
    return undefined;
  } catch {
    return undefined;
  }
}

function isDebugEnabled(topic: AgroV5LogTopic = "all"): boolean {
  if (readGlobalFlag("__AGRO_V5_DEBUG") === true) return true;
  if (topic === "vh" && readGlobalFlag("__AGRO_V5_VH_DEBUG") === true) {
    return true;
  }
  if (topic === "tuman") {
    // Default ON so tuman select debugging is visible without setup.
    const flag = readGlobalFlag("__AGRO_V5_TUMAN_DEBUG");
    return flag !== false;
  }
  if (topic === "vhIndicator") {
    return readGlobalFlag("__AGRO_V5_VH_INDICATOR_DEBUG") !== false;
  }
  return false;
}

const LOG_PREFIX: Partial<Record<AgroV5LogTopic, string>> = {
  tuman: "[AgroV5 tuman]",
  vhIndicator: "[AgroV5 VH-indikator]",
};

export function agroV5Log(
  phase: string,
  detail?: Record<string, unknown>,
  topic: AgroV5LogTopic = "all",
): void {
  if (!isDebugEnabled(topic)) return;
  try {
    const prefix = LOG_PREFIX[topic] || "[AgroV5]";
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${phase}`, detail ?? {});
  } catch {
    /* ignore */
  }
}

/** Always-visible helper for tuman selection diagnosis. */
export function agriTumanLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  agroV5Log(phase, detail, "tuman");
}

/** Always-visible trace of how a VH selection reaches the area indicator. */
export function agriVhIndicatorLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  agroV5Log(phase, detail, "vhIndicator");
}
