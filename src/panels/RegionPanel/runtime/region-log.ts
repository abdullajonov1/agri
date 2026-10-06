import { agroV5Log } from "../../../gis/agri-debug-log";

export function regionLog(
  phase: string,
  detail?: Record<string, unknown>,
): void {
  const topic =
    /barClicked|notifyAgriFilter|tuman|district/i.test(phase)
      ? ("tuman" as const)
      : ("all" as const);
  agroV5Log(phase, detail, topic);
}
