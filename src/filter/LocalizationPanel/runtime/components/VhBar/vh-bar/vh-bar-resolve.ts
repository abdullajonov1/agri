import type { LocalizationHost } from "../../host";
import { clearPieVhFilterUniqueIds, setPieVhFilterUniqueIds } from "../../../../../../gis/agri-chart-filter-order";
import { VH_TO_NDVI_STATUS } from "../../../../../localization/vh-constants";
import { resolveRegionNumberFromMaps, resolveDistrictNumberFromMaps, buildVhUniqueIdCacheKey } from "../../../../../localization/resolve-geo-codes";
import { queryVegetationAvailableDates, queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";
import { agriLog } from "../../localization-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/**
 * Resolve polygon uniqueids for the current Vegetatsiya Holati selection.
 * Bar chart categories come from agri_vegetation_indices.ndvi_status for a
 * specific NDVI date — NOT from the polygon layer's static `vh` attribute.
 */
export const resolveVhMapUniqueIds = async (
  host: LocalizationHost,
  isCurrent?: () => boolean,
): Promise<string[] | null> => {
  const gen = ++host._vhResolveGen;
  const stillOk = () =>
    host._isMounted &&
    gen === host._vhResolveGen &&
    (!isCurrent || isCurrent());

  const vhCategory = host.normalizeApos(String(host.state.vh || "")).trim();
  if (!vhCategory) {
    host._vhMapUniqueIds = null;
    host._vhRegionChartUniqueIds = null;
    host._vhUniqueIdsCropScoped = false;
    clearPieVhFilterUniqueIds();
    return null;
  }

  const status = VH_TO_NDVI_STATUS[vhCategory];
  if (!status) {
    host._vhMapUniqueIds = [];
    host._vhRegionChartUniqueIds = [];
    host._vhUniqueIdsCropScoped = false;
    clearPieVhFilterUniqueIds();
    return [];
  }

  const rawViloyat = (host.state.lockedViloyat || host.state.viloyat || "").toString();
  const regionNum = resolveRegionNumberFromMaps(
    rawViloyat,
    host._viloyatToRegion,
    host.getGeoCodeHelpers(),
  );
  if (regionNum === undefined) {
    host._vhMapUniqueIds = [];
    host._vhRegionChartUniqueIds = [];
    host._vhUniqueIdsCropScoped = false;
    clearPieVhFilterUniqueIds();
    return [];
  }

  const rawTuman = (host.state.tuman || "").toString();
  const districtNum = rawTuman
    ? resolveDistrictNumberFromMaps(
        rawTuman,
        host._tumanToDistrict,
        host.getGeoCodeHelpers(),
        {
          rawViloyat,
          viloyatToRegion: host._viloyatToRegion,
        },
      )
    : undefined;

  const cropIdsForUniqueIds = host.getCropIdsForVhUniqueIdScope();
  // Chart-order rule: crop scopes vegetation uniqueids only when crop was
  // selected *before* VH (filterVhBarByCrop). When VH was first, uniqueids
  // stay status-wide and MapImage/Agri_table `turi` ANDs the crop.
  const chartFlags = host.getChartFilterFlags();
  const cropIds = Array.from(
    new Set(
      host.getSelectedTurlar()
        .map((turi) => host.resolveCropIdForTuri(turi))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  // Prefer the single date the VH chart already proved has rows — walking
  // every NDVI date on each status click is the main latency source.
  let dateCandidates: string[] = [];
  const forcedNdvi = (host.state.ndviDate || "").trim();
  const barDate = host.getGeoScopedVhBarUsedDate();
  // Ascending from service → probe newest first, stop at first hit below.
  // Cap walk length — probing an entire year of empty dates floods Network
  // with uniqueid PBF pages when VH is on and no date is known yet.
  const MAX_VH_DATE_WALK = 8;
  const buildWalk = (knownDates: string[], limit: number): string[] => {
    const selectedYear =
      String(host.state.yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
    const scoped = selectedYear
      ? knownDates.filter((d) => String(d).startsWith(`${selectedYear}-`))
      : knownDates;
    return scoped.slice().reverse().slice(0, limit);
  };

  if (host.state.ndviDateLocked && forcedNdvi) {
    dateCandidates = [forcedNdvi];
  } else if (barDate) {
    dateCandidates = [barDate];
  } else {
    // Dates known from another viloyat/tuman are the cheapest first guess
    // (NDVI composites usually share dates across regions), but they may be
    // empty here — keep already-known dates behind them as fallbacks so a
    // scope change cannot end in a false "no data".
    const preferred = Array.from(
      new Set(
        [String(host._vhBarUsedDate || "").trim(), forcedNdvi].filter(Boolean),
      ),
    );
    let knownDates = host.state.ndviDateOptions || [];
    if (!knownDates.length && !preferred.length) {
      try {
        knownDates = await queryVegetationAvailableDates({
          region: regionNum,
          district: districtNum,
        });
        if (!stillOk()) return host._vhMapUniqueIds;
        if (host._isMounted && knownDates.length) {
          host.setState({ ndviDateOptions: knownDates });
        }
      } catch {
        knownDates = [];
      }
    }
    // Keep the fallback tail short when a likely date is already at hand —
    // a genuinely empty VH status must not turn into eight page-throughs.
    const walk = buildWalk(
      knownDates,
      preferred.length ? 3 : MAX_VH_DATE_WALK,
    );
    dateCandidates = [
      ...preferred,
      ...walk.filter((d) => !preferred.includes(d)),
    ];
  }

  if (!dateCandidates.length) {
    host._vhMapUniqueIds = [];
    host._vhRegionChartUniqueIds = [];
    host._vhUniqueIdsCropScoped = false;
    clearPieVhFilterUniqueIds();
    return [];
  }

  const fetchIdsForCrops = async (
    forCropIds: string[],
    forDate: string,
    /** Omit district for AgriRegion viloyat-wide bars. */
    forDistrict?: number,
  ): Promise<string[]> => {
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
    });
    host.setVhUniqueIdCacheEntry(cacheKey, ids);
    return ids;
  };

  try {
    // Map always ANDs crop + VH when both are set (crop-scoped ids).
    let ids: string[] = [];
    let ndviDate = dateCandidates[0];

    // Start viloyat-wide Region fetch in parallel with the map-scoped query
    // (same first candidate date). Map path never awaits this — if it finishes
    // first, the cache is warm and the first broadcast already has Region ids.
    let parallelRegionPromise: Promise<string[]> | null = null;
    if (districtNum != null && Number.isFinite(districtNum)) {
      parallelRegionPromise = fetchIdsForCrops(
        cropIdsForUniqueIds,
        dateCandidates[0],
        undefined,
      );
      // The branches below may never await this promise (cache hit / date
      // mismatch). Attach a no-op handler so a failed viloyat-wide fetch
      // cannot surface as an unhandled rejection.
      parallelRegionPromise.catch((): void => undefined);
    }

    for (const candidate of dateCandidates) {
      ids = await fetchIdsForCrops(cropIdsForUniqueIds, candidate, districtNum);
      if (!stillOk()) {
        agriLog("vhMapUniqueIds:SKIP-stale", {
          vhCategory,
          gen,
        });
        return host._vhMapUniqueIds;
      }
      // Strict filters: do not fall back to "all crops" when crop is selected.
      if (ids.length) {
        ndviDate = candidate;
        break;
      }
    }

    // Preferred date(s) empty → walk other available dates (same as chart).
    if (!ids.length && (barDate || forcedNdvi)) {
      try {
        let knownDates = host.state.ndviDateOptions || [];
        if (!knownDates.length) {
          knownDates = await queryVegetationAvailableDates({
            region: regionNum,
            district: districtNum,
          });
          if (!stillOk()) return host._vhMapUniqueIds;
        }
        const selectedYear =
          String(host.state.yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
        if (selectedYear) {
          knownDates = knownDates.filter((d) =>
            String(d).startsWith(`${selectedYear}-`),
          );
        }
        const fallback = knownDates
          .slice()
          .reverse()
          .filter((d) => !dateCandidates.includes(d));
        for (const candidate of fallback) {
          ids = await fetchIdsForCrops(
            cropIdsForUniqueIds,
            candidate,
            districtNum,
          );
          if (!stillOk()) return host._vhMapUniqueIds;
          if (ids.length) {
            ndviDate = candidate;
            break;
          }
        }
      } catch {
        /* keep ids as-is */
      }
    }

    // Crop-first but vegetation crop_id empty for this scope → fall back to
    // status-wide ids; map/Region/Indicator still AND `turi` text.
    let usedCropScopedIds = cropIdsForUniqueIds.length > 0 && ids.length > 0;
    if (
      !ids.length &&
      cropIdsForUniqueIds.length > 0 &&
      chartFlags.filterVhBarByCrop
    ) {
      agriLog("vhMapUniqueIds:crop-id-empty-fallback", {
        vhCategory,
        cropIds: cropIdsForUniqueIds,
        ndviDate: dateCandidates[0],
      });
      for (const candidate of dateCandidates) {
        ids = await fetchIdsForCrops([], candidate, districtNum);
        if (!stillOk()) return host._vhMapUniqueIds;
        if (ids.length) {
          ndviDate = candidate;
          usedCropScopedIds = false;
          break;
        }
      }
    }

    // Terminal staleness check: the loops above can await between the last
    // stillOk() and this write, so a superseded resolve must not publish its
    // ids over a newer selection's.
    if (!stillOk()) {
      agriLog("vhMapUniqueIds:SKIP-stale-write", {
        vhCategory,
        gen,
        count: ids.length,
      });
      return host._vhMapUniqueIds;
    }

    host._vhMapUniqueIds = ids;
    host._vhUniqueIdsCropScoped = usedCropScopedIds;

    // Region chart: same VH(+crop)/date, but never district-scoped.
    // When a tuman is selected, do NOT block map paint on the viloyat-wide
    // fetch — use cache / parallel result if ready, otherwise finish in
    // background and rebroadcast (AgriRegion keeps loader while ids are null).
    const regionCropIds = usedCropScopedIds ? cropIdsForUniqueIds : [];
    let regionChartIds: string[] | null = ids;
    let regionChartPending = false;
    if (districtNum != null && Number.isFinite(districtNum)) {
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
        usedCropScopedIds === cropIdsForUniqueIds.length > 0;
      if (cachedRegion) {
        regionChartIds = cachedRegion;
        host._vhRegionChartUniqueIds = cachedRegion;
      } else if (parallelRegionPromise && parallelMatchesDate) {
        regionChartIds = null;
        regionChartPending = true;
        host._vhRegionChartUniqueIds = null;
        void parallelRegionPromise
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
            agriLog(
              "vhRegionChartUniqueIds:parallel-resolved",
              {
                vhCategory,
                status,
                ndviDate,
                regionNum,
                cropCount: regionCropIds.length,
                count: regionIds.length,
              },
            );
            host._reuseVhBarDataOnNextBroadcast = true;
            host.broadcastFilterState();
          })
          .catch((e: unknown) => {
            if (
              !host._isMounted ||
              gen !== host._vhResolveGen ||
              (isCurrent && !isCurrent())
            ) {
              return;
            }
            agriLog(
              "vhRegionChartUniqueIds:parallel-FAILED",
              {
                vhCategory,
                error: errorMessage(e),
              },
            );
            host._vhRegionChartUniqueIds = [];
            host._reuseVhBarDataOnNextBroadcast = true;
            host.broadcastFilterState();
          });
      } else {
        regionChartIds = null;
        regionChartPending = true;
        host._vhRegionChartUniqueIds = null;
        void host.resolveVhRegionChartUniqueIdsBackground(
          gen,
          {
            status,
            regionNum,
            cropIds: regionCropIds,
            ndviDate,
            vhCategory,
          },
          isCurrent,
        );
      }
    } else {
      host._vhRegionChartUniqueIds = ids;
    }

    agriLog("vhMapUniqueIds:resolved", {
      vhCategory,
      status,
      ndviDate,
      regionNum,
      districtNum: districtNum ?? null,
      cropIds,
      cropIdsForUniqueIds,
      cropScoped: usedCropScopedIds,
      cropCount: cropIds.length,
      filterPieByVh: chartFlags.filterPieByVh,
      filterVhBarByCrop: chartFlags.filterVhBarByCrop,
      chartDimOrder: host._chartDimOrder.slice(),
      count: ids.length,
      regionChartCount: Array.isArray(regionChartIds)
        ? regionChartIds.length
        : null,
      regionChartPending,
      triedDates: dateCandidates.length,
      sampleMapIds: ids.slice(0, 3),
    });

    // Pie needs VH-only uniqueids (no crop) when VH was selected first.
    // Keep Pie at map geography (incl. district) — crop unscoped only.
    // Do not block map/Region broadcast on a second vegetation-table page
    // when crops are also selected; Pie refetches on the follow-up broadcast.
    if (chartFlags.filterPieByVh) {
      if (cropIds.length === 0 || !usedCropScopedIds) {
        setPieVhFilterUniqueIds(ids);
        agriLog("vhPieUniqueIds:published", {
          count: ids.length,
          unscopedByCrop: false,
        });
      } else {
        // Drop stale crop-scoped / previous-geo ids immediately so Pie keeps
        // its loader until the unscoped Pie fetch + follow-up broadcast.
        clearPieVhFilterUniqueIds();
        void fetchIdsForCrops([], ndviDate, districtNum)
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
      }
    } else {
      clearPieVhFilterUniqueIds();
    }

    return ids;
  } catch (e) {
    if (!stillOk()) return host._vhMapUniqueIds;
    agriLog("vhMapUniqueIds:FAILED", {
      vhCategory,
      error: errorMessage(e),
    });
    host._vhMapUniqueIds = [];
    host._vhRegionChartUniqueIds = [];
    host._vhUniqueIdsCropScoped = false;
    clearPieVhFilterUniqueIds();
    return [];
  }
};
