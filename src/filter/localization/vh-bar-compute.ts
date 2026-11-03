/**
 * VH bar compute pipeline — hectares per ndvi_status, each field once with its
 * newest status inside its crop's last 10 days (Bug'doy: Mart–Aprel, Paxta:
 * Iyun–Sentabr; see status-vh-window).
 * LocalizationPanel supplies deps; this module has no React class state.
 */

import type { ChartFilterFlags } from "../../gis/agri-chart-filter-order";
import { queryVegetationAvailableDates } from "../../gis/agri-vegetation-data-source";
import { getVhBarLatestStatusCountsCached } from "../../data/agri-stats-store";
import { aggregateVhServiceRows, buildEmptyVhBarData } from "./vh-bar-aggregate";
import type { VHBarData } from "./vh-constants";
import { errorMessage } from "../../shared/agri-plain-object";

export type VhBarComputeStateSlice = {
  viloyat: string;
  lockedViloyat: string | null;
  tuman: string;
  yil: string;
  ndviDate?: string;
  ndviDateLocked?: boolean;
};

/** State patch the VH bar compute may publish (NDVI date discovery). */
export type VhBarStatePatch = {
  ndviDateOptions?: string[];
  ndviDate?: string;
};

export type VhBarComputeDeps = {
  state: VhBarComputeStateSlice;
  isMounted: () => boolean;
  viloyatToRegion: Record<string, number>;
  tumanToDistrict: Record<string, number>;
  normalizeApos: (s: string) => string;
  makeRegionDistrictKey: (raw: string | null | undefined) => string;
  getChartFilterFlags: () => ChartFilterFlags;
  getSelectedTurlar: () => string[];
  resolveCropIdForTuri: (turi: string) => string | null | undefined;
  getVhBarUsedDate: () => string | null;
  setVhBarUsedDate: (date: string | null) => void;
  setState: (patch: VhBarStatePatch) => void;
  prefetchVhStatusUniqueIds: (date: string) => void;
  log: (phase: string, detail?: Record<string, unknown>) => void;
  /** Header STIR selection — uniqueids of that farmer's parcels. */
  farmerUniqueIds?: string[] | null;
};

export async function executeVhBarCompute(
  deps: VhBarComputeDeps,
): Promise<VHBarData | null> {
  const zeroResult: VHBarData = buildEmptyVhBarData();

  const { viloyat, lockedViloyat, tuman, yil } = deps.state;
  const rawViloyat = (lockedViloyat ?? viloyat ?? "").toString();
  const effectiveViloyat = deps.normalizeApos(rawViloyat);
  const regionKey = deps.makeRegionDistrictKey(rawViloyat);
  const regionNum = effectiveViloyat
    ? /^\d+$/.test(effectiveViloyat)
      ? Number(effectiveViloyat)
      : regionKey
        ? deps.viloyatToRegion[regionKey]
        : undefined
    : undefined;
  if (
    effectiveViloyat &&
    (regionNum === undefined || !Number.isFinite(regionNum))
  ) {
    return zeroResult;
  }

  const rawTuman = (tuman ?? "").toString();
  const effectiveTuman = effectiveViloyat
    ? deps.normalizeApos(rawTuman)
    : "";
  let districtNum: number | undefined;
  if (effectiveTuman) {
    districtNum = /^\d+$/.test(effectiveTuman)
      ? Number(effectiveTuman)
      : undefined;
    if (districtNum === undefined) {
      const tumanKey = deps.makeRegionDistrictKey(rawTuman);
      const regionKey = deps.makeRegionDistrictKey(rawViloyat);
      const lookupKeys: string[] = [];
      if (regionNum != null && Number.isFinite(regionNum) && tumanKey) {
        lookupKeys.push(`region:${regionNum}|${tumanKey}`);
      }
      if (regionKey && tumanKey) {
        lookupKeys.push(`viloyat:${regionKey}|${tumanKey}`);
      }
      if (tumanKey) lookupKeys.push(tumanKey);
      for (const key of lookupKeys) {
        const mapped = deps.tumanToDistrict[key];
        if (mapped !== undefined && Number.isFinite(mapped)) {
          districtNum = mapped;
          break;
        }
      }
    }
    if (!Number.isFinite(districtNum as number)) districtNum = undefined;
  }
  if (effectiveTuman && districtNum === undefined) return zeroResult;

  const chartFlags = deps.getChartFilterFlags();
  const selectedTurlar = chartFlags.filterVhBarByCrop
    ? deps.getSelectedTurlar()
    : [];
  const cropIds = chartFlags.filterVhBarByCrop
    ? Array.from(
        new Set(
          selectedTurlar
            .map((turi) => deps.resolveCropIdForTuri(turi))
            .filter((value): value is string => Boolean(value)),
        ),
      )
    : [];
  // Unresolved crop → empty bar. Compare per turi, not list lengths: two
  // spellings of one crop (Noxot / No'xat) share a crop_id and dedupe above.
  if (selectedTurlar.some((turi) => !deps.resolveCropIdForTuri(turi))) {
    return zeroResult;
  }

  const cropFilter = cropIds.length ? cropIds : undefined;
  const selectedYear =
    String(yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
  if (!selectedYear) return zeroResult;

  const farmerUniqueIds = Array.from(
    new Set(
      (deps.farmerUniqueIds || [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
  // STIR selected but no parcels resolved → empty VH bar.
  if (
    Array.isArray(deps.farmerUniqueIds) &&
    deps.farmerUniqueIds.length === 0
  ) {
    return zeroResult;
  }
  const farmerFilter = farmerUniqueIds.length ? farmerUniqueIds : undefined;

  const forcedNdvi = (deps.state.ndviDate || "").trim();
  const locked = Boolean(deps.state.ndviDateLocked && forcedNdvi);
  // Locked calendar day caps every crop's window end; otherwise each crop
  // runs to its own newest raster_date in the selected year.
  const endBound = locked ? forcedNdvi : `${selectedYear}-12-31`;
  const republic = !effectiveViloyat && !farmerFilter;
  const startedAt = Date.now();

  try {
    // Calendar options (viloyat / tuman only) load beside the VH stats.
    const datesPromise = republic
      ? Promise.resolve([] as string[])
      : queryVegetationAvailableDates({
          region: regionNum,
          district: districtNum,
        }).catch(() => [] as string[]);

    const [counts, knownDatesRaw] = await Promise.all([
      getVhBarLatestStatusCountsCached({
        region: republic ? undefined : regionNum,
        district: republic ? undefined : districtNum,
        date: endBound,
        cropIds: cropFilter,
        uniqueIds: farmerFilter,
      }),
      datesPromise,
    ]);
    if (!deps.isMounted()) return null;

    const knownDates = (knownDatesRaw || []).filter((date) =>
      String(date).startsWith(`${selectedYear}-`),
    );
    if (knownDates.length) deps.setState({ ndviDateOptions: knownDates });

    const result = aggregateVhServiceRows(counts.rows);
    if (result.totalCount <= 0) {
      deps.setVhBarUsedDate(null);
      return zeroResult;
    }

    const usedDate = counts.endDate || null;
    deps.setVhBarUsedDate(usedDate);
    if (usedDate && !republic) {
      deps.prefetchVhStatusUniqueIds(usedDate);
      if (!locked && deps.state.ndviDate !== usedDate) {
        deps.setState({ ndviDate: usedDate });
      }
    }

    deps.log(republic ? "computeVhBarData:republic-result" : "computeVhBarData:region-result", {
      ms: Date.now() - startedAt,
      year: selectedYear,
      region: republic ? null : regionNum ?? null,
      district: republic ? null : districtNum ?? null,
      cropIds: cropFilter || null,
      lockedDate: locked ? forcedNdvi : null,
      windowStart: counts.startDate || null,
      windowEnd: usedDate,
      totalAreaHa: result.totalCount,
      categories: result.categories.map((category) => ({
        category: category.category,
        areaHa: category.count,
        fieldCount: category.fieldCount,
      })),
    });
    return result;
  } catch (error) {
    deps.log(republic ? "computeVhBarData:republic-failed" : "computeVhBarData:region-failed", {
      error: errorMessage(error),
    });
    return null;
  }
}
