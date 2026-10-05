import { agroV5Log } from "../../../../gis/agri-debug-log";

/** Opt-in via window.__AGRO_V5_DEBUG / __AGRO_V5_VH_DEBUG / __AGRO_V5_TUMAN_DEBUG */
export function agriLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  const topic =
    /tuman|district|zoom:district|buildTuman|admin-boundary|jadval|tableRow|broadcastFilterState/i.test(
      phase,
    )
      ? ("tuman" as const)
      : /vh|pie|bar|vegetation|chartDim/i.test(phase)
        ? ("vh" as const)
        : ("all" as const);
  agroV5Log(phase, detail, topic);
}

export function debugCatch(phase: string, err: unknown): void {
  agroV5Log(phase, { error: String((err as any)?.message || err) });
}
