import type { VhBarResolveHost } from "../vh-bar-host";
import { clearPieVhFilterUniqueIds, setPieVhFilterUniqueIds } from "../../../../../../gis/agri-chart-filter-order";
import type { VH_TO_NDVI_STATUS } from "../../../../../localization/vh-constants";
import { buildVhUniqueIdCacheKey } from "../../../../../localization/resolve-geo-codes";
import { queryVegetationAvailableDates, queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";
import { isVhYearSummaryScope } from "./vh-bar-prep";
import { agriLog } from "../../localization-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/** Cap walk length so an empty year of dates cannot flood Network with PBF pages. */
export const MAX_VH_DATE_WALK = 8;
/** Shorter fallback tail when a likely date is already known. */
export const SHORT_VH_DATE_WALK = 3;

export type VhNdviStatus = NonNullable<(typeof VH_TO_NDVI_STATUS)[string]>;
export type FetchVhIds = (
  forCropIds: string[],
  forDate: string,
  forDistrict?: number,
) => Promise<string[]>;

/** Everything the steps share for one resolve run. */
export interface VhResolveCtx {
  host: VhBarResolveHost;
  gen: number;
  stillOk: () => boolean;
  isCurrent?: () => boolean;
  vhCategory: string;
  status: VhNdviStatus;
  regionNum: number;
  districtNum: number | undefined;
}

export const hasDistrict = (districtNum: number | undefined): districtNum is number =>
  districtNum != null && Number.isFinite(districtNum);

/** First 4-digit year (18xx/19xx/20xx) found in the selection, or "". */
export const extractSelectedYear = (yil: unknown): string =>
  String(yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";

/** Keep only dates of the selected year (all dates when no year). */
export const filterDatesByYear = (knownDates: string[], year: string): string[] =>
  year ? knownDates.filter((d) => String(d).startsWith(`${year}-`)) : knownDates;

/** Newest-first walk of year-scoped dates, capped at `limit`. */
export const buildDateWalk = (
  knownDates: string[],
  limit: number,
  yil: unknown,
): string[] =>
  filterDatesByYear(knownDates, extractSelectedYear(yil))
    .slice()
    .reverse()
    .slice(0, limit);

/** Preferred (cheapest guess) dates first, then walk dates not already listed. */
export const mergeDateCandidates = (preferred: string[], walk: string[]): string[] => [
  ...preferred,
  ...walk.filter((d) => !preferred.includes(d)),
];

/** Newest-first year-scoped dates that were not already tried. */
export const buildFallbackDates = (
  knownDates: string[],
  yil: unknown,
  tried: string[],
): string[] =>
  filterDatesByYear(knownDates, extractSelectedYear(yil))
    .slice()
    .reverse()
    .filter((d) => !tried.includes(d));

/** Unique crop ids resolved from the selected turlar. */
export const collectCropIds = (
  turlar: string[],
  resolveCropIdForTuri: (turi: string) => string | undefined,
): string[] =>
  Array.from(
    new Set(
      turlar
        .map((turi) => resolveCropIdForTuri(turi))
        .filter((value): value is string => Boolean(value)),
    ),
  );

/** Reset host ids (empty arrays, or null for "no VH category") and clear Pie. */
export const resetVhIds = (host: VhBarResolveHost, ids: string[] | null): string[] | null => {
  host._vhMapUniqueIds = ids;
  host._vhRegionChartUniqueIds = ids;
  host._vhUniqueIdsCropScoped = false;
  clearPieVhFilterUniqueIds();
  return ids;
};

/** Cached uniqueid fetch for one status/date/district/crop scope. */
export const createFetchIdsForCrops = (
  host: VhBarResolveHost,
  status: VhNdviStatus,
  regionNum: number,
): FetchVhIds => async (forCropIds, forDate, forDistrict) => {
  const cacheKey = buildVhUniqueIdCacheKey({
    status,
    ndviDate: forDate,
    regionNum,
    districtNum: forDistrict,
    cropIds: forCropIds,
  });
  const cached = host._vhUniqueIdCache[cacheKey];
  if (cached) return cached;
  const ids = await queryVegetationUniqueIdsForStatus({
    region: regionNum,
    district: forDistrict,
    date: forDate,
    ndviStatus: status,
    cropIds: forCropIds.length ? forCropIds : undefined,
    useYearSummary: isVhYearSummaryScope(host),
  });
  host.setVhUniqueIdCacheEntry(cacheKey, ids);
  return ids;
};

/**
 * Initial date candidates. Returns null when the run went stale while
 * loading the available dates.
 */
export const resolveDateCandidates = async (
  ctx: VhResolveCtx,
  barDate: string,
  forcedNdvi: string,
): Promise<string[] | null> => {
  const { host, regionNum, districtNum, stillOk } = ctx;
  if (host.state.ndviDateLocked && forcedNdvi) return [forcedNdvi];
  if (barDate) return [barDate];

  const preferred = Array.from(
    new Set([String(host._vhBarUsedDate || "").trim(), forcedNdvi].filter(Boolean)),
  );
  let knownDates = host.state.ndviDateOptions || [];
  if (!knownDates.length && !preferred.length) {
    try {
      knownDates = await queryVegetationAvailableDates({
        region: regionNum,
        district: districtNum,
      });
      if (!stillOk()) return null;
      if (host._isMounted && knownDates.length) {
        host.setState({ ndviDateOptions: knownDates });
      }
    } catch {
      knownDates = [];
    }
  }
  const walk = buildDateWalk(
    knownDates,
    preferred.length ? SHORT_VH_DATE_WALK : MAX_VH_DATE_WALK,
    host.state.yil,
  );
  return mergeDateCandidates(preferred, walk);
};

export interface ProbeResult {
  ids: string[];
  /** Date that produced ids, or null when none did. */
  date: string | null;
  stale: boolean;
}

/** Try dates in order until one yields ids; the last ids are kept when none do. */
export const probeDates = async (
  fetchIds: FetchVhIds,
  cropIds: string[],
  dates: string[],
  districtNum: number | undefined,
  stillOk: () => boolean,
  initialIds: string[] = [],
): Promise<ProbeResult> => {
  let ids = initialIds;
  for (const candidate of dates) {
    ids = await fetchIds(cropIds, candidate, districtNum);
    if (!stillOk()) return { ids, date: null, stale: true };
    if (ids.length) return { ids, date: candidate, stale: false };
  }
  return { ids, date: null, stale: false };
};

/** Preferred date(s) empty: walk the other available dates (same as chart). */
export const probeFallbackDates = async (
  ctx: VhResolveCtx,
  fetchIds: FetchVhIds,
  cropIds: string[],
  tried: string[],
): Promise<ProbeResult> => {
  const { host, regionNum, districtNum, stillOk } = ctx;
  try {
    let knownDates = host.state.ndviDateOptions || [];
    if (!knownDates.length) {
      knownDates = await queryVegetationAvailableDates({
        region: regionNum,
        district: districtNum,
      });
      if (!stillOk()) return { ids: [], date: null, stale: true };
    }
    const fallback = buildFallbackDates(knownDates, host.state.yil, tried);
    return await probeDates(fetchIds, cropIds, fallback, districtNum, stillOk);
  } catch {
    return { ids: [], date: null, stale: false };
  }
};

export interface RegionChartInput {
  ids: string[];
  ndviDate: string;
  usedCropScopedIds: boolean;
  cropIdsForUniqueIds: string[];
  dateCandidates: string[];
  parallelRegionPromise: Promise<string[]> | null;
}

export interface RegionChartResult {
  regionChartIds: string[] | null;
  regionChartPending: boolean;
}

const attachParallelRegionHandlers = (
  ctx: VhResolveCtx,
  promise: Promise<string[]>,
  regionCacheKey: string,
  ndviDate: string,
  regionCropIds: string[],
): void => {
  const { host, gen, isCurrent, vhCategory, status, regionNum } = ctx;
  void promise
    .then((regionIds) => {
      if (
        !host._isMounted ||
        gen !== host._vhResolveGen ||
        (isCurrent && !isCurrent()) ||
        !String(host.state.vh || "").trim()
      ) {
        return;
      }
      host.setVhUniqueIdCacheEntry(regionCacheKey, regionIds);
      host._vhRegionChartUniqueIds = regionIds;
      agriLog("vhRegionChartUniqueIds:parallel-resolved", {
        vhCategory,
        status,
        ndviDate,
        regionNum,
        cropCount: regionCropIds.length,
        count: regionIds.length,
      });
      host._reuseVhBarDataOnNextBroadcast = true;
      host.broadcastFilterState();
    })
    .catch((e: unknown) => {
      if (!host._isMounted || gen !== host._vhResolveGen || (isCurrent && !isCurrent())) {
        return;
      }
      agriLog("vhRegionChartUniqueIds:parallel-FAILED", {
        vhCategory,
        error: errorMessage(e),
      });
      host._vhRegionChartUniqueIds = [];
      host._reuseVhBarDataOnNextBroadcast = true;
      host.broadcastFilterState();
    });
};

/**
 * Region chart ids: same VH(+crop)/date, never district-scoped. With a tuman
 * selected the viloyat-wide fetch never blocks map paint.
 */
export const resolveRegionChartIds = (
  ctx: VhResolveCtx,
  input: RegionChartInput,
): RegionChartResult => {
  const { host, gen, isCurrent, vhCategory, status, regionNum, districtNum } = ctx;
  const { ids, ndviDate, usedCropScopedIds, cropIdsForUniqueIds, dateCandidates, parallelRegionPromise } = input;
  if (!hasDistrict(districtNum)) {
    host._vhRegionChartUniqueIds = ids;
    return { regionChartIds: ids, regionChartPending: false };
  }

  const regionCropIds = usedCropScopedIds ? cropIdsForUniqueIds : [];
  const regionCacheKey = buildVhUniqueIdCacheKey({
    status,
    ndviDate,
    regionNum,
    districtNum: undefined,
    cropIds: regionCropIds,
  });
  const cachedRegion = host._vhUniqueIdCache[regionCacheKey];
  const parallelMatchesDate =
    ndviDate === dateCandidates[0] &&
    usedCropScopedIds === (cropIdsForUniqueIds.length > 0);
  if (cachedRegion) {
    host._vhRegionChartUniqueIds = cachedRegion;
    return { regionChartIds: cachedRegion, regionChartPending: false };
  }
  host._vhRegionChartUniqueIds = null;
  if (parallelRegionPromise && parallelMatchesDate) {
    attachParallelRegionHandlers(ctx, parallelRegionPromise, regionCacheKey, ndviDate, regionCropIds);
  } else {
    void host.resolveVhRegionChartUniqueIdsBackground(
      gen,
      { status, regionNum, cropIds: regionCropIds, ndviDate, vhCategory },
      isCurrent,
    );
  }
  return { regionChartIds: null, regionChartPending: true };
};

/**
 * Pie needs VH-only uniqueids (no crop) when VH was selected first. Pie stays
 * at map geography (incl. district); the crop-scoped case refetches deferred.
 */
export const publishPieIds = (
  ctx: VhResolveCtx,
  fetchIds: FetchVhIds,
  input: {
    filterPieByVh: boolean;
    cropIds: string[];
    usedCropScopedIds: boolean;
    ids: string[];
    ndviDate: string;
  },
): void => {
  const { host, stillOk, districtNum } = ctx;
  const { filterPieByVh, cropIds, usedCropScopedIds, ids, ndviDate } = input;
  if (!filterPieByVh) {
    clearPieVhFilterUniqueIds();
    return;
  }
  if (cropIds.length === 0 || !usedCropScopedIds) {
    setPieVhFilterUniqueIds(ids);
    agriLog("vhPieUniqueIds:published", { count: ids.length, unscopedByCrop: false });
    return;
  }
  // Drop stale crop-scoped / previous-geo ids so Pie keeps its loader.
  clearPieVhFilterUniqueIds();
  void fetchIds([], ndviDate, districtNum)
    .then((pieIds) => {
      if (!stillOk()) return;
      setPieVhFilterUniqueIds(pieIds);
      agriLog("vhPieUniqueIds:published", {
        count: pieIds.length,
        unscopedByCrop: true,
        deferred: true,
      });
      host._reuseVhBarDataOnNextBroadcast = true;
      host.broadcastFilterState();
    })
    .catch(() => {
      if (!stillOk()) return;
      clearPieVhFilterUniqueIds();
    });
};
