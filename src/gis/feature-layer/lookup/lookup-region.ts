import { isRegionSoatoCode } from "../../map-image-predicates";
import { regionSoatoToDisplayName } from "../primitives";

/** UI / filter state should always use human-readable region names when possible. */
export function normalizeRegionDisplayValue(value: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (isRegionSoatoCode(raw)) {
    return regionSoatoToDisplayName(raw) || raw;
  }
  return raw;
}
/** Canonical value for filter state + events (prefer region name over SOATO code). */
export function canonicalizeRegionFilterValue(value: string): string {
  return normalizeRegionDisplayValue(value);
}
