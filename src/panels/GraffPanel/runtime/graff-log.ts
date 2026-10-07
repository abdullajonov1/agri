import { agroV5Log } from "../../../gis/agri-debug-log";

/** Tuman / Jadval debug — visible when __AGRO_V5_TUMAN_DEBUG !== false (default ON). */
export function graffLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  const topic =
    /tuman|tableRow|fetchData|buildWhereClause|spatial|polygon/i.test(phase)
      ? ("tuman" as const)
      : ("all" as const);
  agroV5Log(phase, detail, topic);
}

/**
 * Debug trace for a deliberately swallowed, non-fatal error (best-effort
 * UI/map side effects). Never throws.
 */
export function graffDebugCatch(phase: string, err: unknown): void {
  const message =
    err != null && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : String(err);
  graffLog(`${phase}:ignored-error`, { error: message });
}
