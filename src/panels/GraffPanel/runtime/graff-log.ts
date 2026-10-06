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
