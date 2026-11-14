import type { LayerLike } from "./query-helpers";

export const asObjectRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

/** Narrow an arbitrary layer value to the query surface the report needs. */
export function asLayerLike(value: unknown): LayerLike | null {
  const rec = asObjectRecord(value);
  if (!rec) return null;
  if (typeof rec.createQuery !== "function" || typeof rec.queryFeatures !== "function") {
    return null;
  }
  return rec as unknown as LayerLike;
}

export function requireLayerLike(value: unknown): LayerLike {
  const layer = asLayerLike(value);
  if (!layer) throw new Error("Report layer is unavailable");
  return layer;
}
