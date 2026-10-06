/**
 * Pure parsing helpers for the AgriFilter master-filter broadcast consumed by
 * the Graff panel (no widget state, no side effects).
 */
import type { AgriGraffWidgetState } from "../graff-state";

/** `filters` payload of the master-filter event (all fields untrusted). */
export interface MasterFilterPayload {
  viloyat?: unknown;
  tuman?: unknown;
  yil?: unknown;
  turi?: unknown;
  turlar?: unknown;
  vh?: unknown;
  uniqueid?: unknown;
  polygonMode?: unknown;
  uniqueidClickedAt?: unknown;
  language?: unknown;
  barCategoryField?: unknown;
  barCategoryValue?: unknown;
  ndviDate?: unknown;
  farmerInn?: unknown;
}

export interface MasterFilterEventDetail {
  filters?: MasterFilterPayload;
  source?: unknown;
  meta?: {
    timestamp?: unknown;
    broadcastGeneration?: unknown;
    whereClause?: unknown;
  };
  scope?: { lockedViloyat?: unknown };
  vhUniqueids?: unknown;
}

export type GraffRegionalFilters = AgriGraffWidgetState["regionalFilters"] & {
  turlar: string[];
};

const finitePositiveOrZero = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

/** Event timestamp / broadcast generation (0 when absent or invalid). */
export function readMasterFilterOrdering(detail: MasterFilterEventDetail): {
  eventTs: number;
  eventGen: number;
} {
  return {
    eventTs: finitePositiveOrZero(detail?.meta?.timestamp),
    eventGen: finitePositiveOrZero(detail?.meta?.broadcastGeneration),
  };
}

const matchCode = (whereClause: string, re: RegExp): number | null => {
  const match = whereClause.match(re);
  if (!match || !match[1]) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Numeric region / district codes from an AgriFilter WHERE clause. */
export function parseRegionDistrictCodes(whereClause: unknown): {
  regionCode: number | null;
  districtCode: number | null;
} {
  if (typeof whereClause !== "string") {
    return { regionCode: null, districtCode: null };
  }
  return {
    regionCode: matchCode(whereClause, /region\s*=\s*'?(\d+)'?/i),
    districtCode: matchCode(whereClause, /district\s*=\s*'?(\d+)'?/i),
  };
}

/** Build the next regional filter set from the broadcast payload. */
export function buildNextRegionalFilters(
  f: MasterFilterPayload,
  effectiveViloyat: string,
  normalizeApos: (s: string) => string,
): GraffRegionalFilters {
  const turlar = Array.isArray(f.turlar) ? (f.turlar as unknown[]) : null;
  return {
    viloyat: effectiveViloyat,
    tuman: f.tuman ? normalizeApos(String(f.tuman)) : "",
    yil: f.yil ? String(f.yil) : "",
    uzspace:
      turlar && turlar.length === 1
        ? normalizeApos(String(turlar[0]))
        : f.turi
          ? normalizeApos(String(f.turi))
          : "",
    turlar: turlar
      ? Array.from(
          new Set(
            turlar
              .map((value: unknown) => normalizeApos(String(value || "")))
              .filter(Boolean),
          ),
        )
      : f.turi
        ? [normalizeApos(String(f.turi))]
        : [],
    vh: f.vh ? normalizeApos(String(f.vh)) : "", // ✅ vh
  };
}

/** De-duplicated, trimmed VH uniqueid list (null when not provided). */
export function normalizeVhUniqueids(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return Array.from(
    new Set(
      (raw as unknown[]).map((id) => String(id || "").trim()).filter(Boolean),
    ),
  );
}

/** Cheap signature: pending null → resolved id list (or empty []) must differ. */
export function vhUniqueidsSignature(ids: string[] | null): string {
  return ids == null
    ? "null"
    : `${ids.length}:${ids[0] || ""}:${ids[ids.length - 1] || ""}`;
}

const cleanUniqueid = (id: unknown): string =>
  String(id || "").replace(/[{}]/g, "").toLowerCase();

/** Selected polygon is not among the active VH status uniqueids. */
export function isPolygonOutsideVhStatus(
  selectedId: string,
  vh: string,
  vhUniqueids: string[] | null,
): boolean {
  const selectedClean = cleanUniqueid(selectedId);
  const vhActive = !!String(vh || "").trim();
  return (
    !!selectedClean &&
    vhActive &&
    Array.isArray(vhUniqueids) &&
    !vhUniqueids.some((id) => cleanUniqueid(id) === selectedClean)
  );
}

/**
 * Localization always sends polygonMode/uniqueid on every broadcast.
 * Only treat as polygon-only when a field is being focused or cleared —
 * bare polygonMode:false must not swallow VH uniqueid follow-ups.
 */
export function isPolygonOnlyEvent(
  f: MasterFilterPayload,
  hadSelectedField: boolean,
): boolean {
  const incomingUniqueid =
    typeof f.uniqueid === "string" ? String(f.uniqueid).trim() : "";
  return (
    f.polygonMode === true ||
    incomingUniqueid !== "" ||
    (f.polygonMode === false && hadSelectedField && incomingUniqueid === "")
  );
}
