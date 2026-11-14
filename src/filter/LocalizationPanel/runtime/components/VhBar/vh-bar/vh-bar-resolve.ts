import type { VhBarResolveHost } from "../vh-bar-host";
import { VH_TO_NDVI_STATUS } from "../../../../../localization/vh-constants";
import { resolveRegionNumberFromMaps, resolveDistrictNumberFromMaps } from "../../../../../localization/resolve-geo-codes";
import { agriLog } from "../../localization-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";
import {
  collectCropIds,
  createFetchIdsForCrops,
  hasDistrict,
  probeDates,
  probeFallbackDates,
  publishPieIds,
  resetVhIds,
  resolveDateCandidates,
  resolveRegionChartIds,
  type VhResolveCtx,
} from "./vh-bar-resolve-steps";

/**
 * Resolve polygon uniqueids for the current Vegetatsiya Holati selection.
 * Bar chart categories come from agri_vegetation_indices.ndvi_status for a
 * specific NDVI date — NOT from the polygon layer's static `vh` attribute.
 */
export const resolveVhMapUniqueIds = async (
  host: VhBarResolveHost,
  isCurrent?: () => boolean,
): Promise<string[] | null> => {
  const gen = ++host._vhResolveGen;
  const stillOk = () =>
    host._isMounted &&
    gen === host._vhResolveGen &&
    (!isCurrent || isCurrent());

  const vhCategory = host.normalizeApos(String(host.state.vh || "")).trim();
  if (!vhCategory) return resetVhIds(host, null);

  const status = VH_TO_NDVI_STATUS[vhCategory];
  if (!status) return resetVhIds(host, []);

  const rawViloyat = (host.state.lockedViloyat || host.state.viloyat || "").toString();
  const regionNum = resolveRegionNumberFromMaps(
    rawViloyat,
    host._viloyatToRegion,
    host.getGeoCodeHelpers(),
  );
  if (regionNum === undefined) return resetVhIds(host, []);

  const rawTuman = (host.state.tuman || "").toString();
  const districtNum = rawTuman
    ? resolveDistrictNumberFromMaps(rawTuman, host._tumanToDistrict, host.getGeoCodeHelpers(), {
        rawViloyat,
        viloyatToRegion: host._viloyatToRegion,
      })
    : undefined;

  const ctx: VhResolveCtx = {
    host, gen, stillOk, isCurrent, vhCategory, status, regionNum, districtNum,
  };

  const cropIdsForUniqueIds = host.getCropIdsForVhUniqueIdScope();
  // Chart-order rule: crop scopes vegetation uniqueids only when crop was
  // selected *before* VH (filterVhBarByCrop). When VH was first, uniqueids
  // stay status-wide and MapImage/Agri_table `turi` ANDs the crop.
  const chartFlags = host.getChartFilterFlags();
  const cropIds = collectCropIds(host.getSelectedTurlar(), (turi) =>
    host.resolveCropIdForTuri(turi),
  );

  const forcedNdvi = (host.state.ndviDate || "").trim();
  const barDate = host.getGeoScopedVhBarUsedDate();
  const dateCandidates = await resolveDateCandidates(ctx, barDate, forcedNdvi);
  if (dateCandidates === null) return host._vhMapUniqueIds;
  if (!dateCandidates.length) return resetVhIds(host, []);

  const fetchIds = createFetchIdsForCrops(host, status, regionNum);

  try {
    let ndviDate = dateCandidates[0];

    // Start viloyat-wide Region fetch in parallel with the map-scoped query
    // (same first candidate date). The map path never awaits it.
    let parallelRegionPromise: Promise<string[]> | null = null;
    if (hasDistrict(districtNum)) {
      parallelRegionPromise = fetchIds(cropIdsForUniqueIds, dateCandidates[0], undefined);
      // The branches below may never await this promise; attach a no-op
      // handler so a failed fetch cannot become an unhandled rejection.
      parallelRegionPromise.catch((): void => undefined);
    }

    const primary = await probeDates(fetchIds, cropIdsForUniqueIds, dateCandidates, districtNum, stillOk);
    if (primary.stale) {
      agriLog("vhMapUniqueIds:SKIP-stale", { vhCategory, gen });
      return host._vhMapUniqueIds;
    }
    let ids = primary.ids;
    if (primary.date !== null) ndviDate = primary.date;

    // Preferred date(s) empty → walk other available dates (same as chart).
    if (!ids.length && (barDate || forcedNdvi)) {
      const fallback = await probeFallbackDates(ctx, fetchIds, cropIdsForUniqueIds, dateCandidates);
      if (fallback.stale) return host._vhMapUniqueIds;
      if (fallback.date !== null) {
        ids = fallback.ids;
        ndviDate = fallback.date;
      }
    }

    // Crop-first but vegetation crop_id empty for this scope → fall back to
    // status-wide ids; map/Region/Indicator still AND `turi` text.
    let usedCropScopedIds = cropIdsForUniqueIds.length > 0 && ids.length > 0;
    if (!ids.length && cropIdsForUniqueIds.length > 0 && chartFlags.filterVhBarByCrop) {
      agriLog("vhMapUniqueIds:crop-id-empty-fallback", {
        vhCategory,
        cropIds: cropIdsForUniqueIds,
        ndviDate: dateCandidates[0],
      });
      const statusWide = await probeDates(fetchIds, [], dateCandidates, districtNum, stillOk, ids);
      if (statusWide.stale) return host._vhMapUniqueIds;
      ids = statusWide.ids;
      if (statusWide.date !== null) {
        ndviDate = statusWide.date;
        usedCropScopedIds = false;
      }
    }

    // Terminal staleness check: a superseded resolve must not publish its
    // ids over a newer selection's.
    if (!stillOk()) {
      agriLog("vhMapUniqueIds:SKIP-stale-write", { vhCategory, gen, count: ids.length });
      return host._vhMapUniqueIds;
    }

    host._vhMapUniqueIds = ids;
    host._vhUniqueIdsCropScoped = usedCropScopedIds;

    const { regionChartIds, regionChartPending } = resolveRegionChartIds(ctx, {
      ids,
      ndviDate,
      usedCropScopedIds,
      cropIdsForUniqueIds,
      dateCandidates,
      parallelRegionPromise,
    });

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
      regionChartCount: Array.isArray(regionChartIds) ? regionChartIds.length : null,
      regionChartPending,
      triedDates: dateCandidates.length,
      sampleMapIds: ids.slice(0, 3),
    });

    publishPieIds(ctx, fetchIds, {
      filterPieByVh: chartFlags.filterPieByVh,
      cropIds,
      usedCropScopedIds,
      ids,
      ndviDate,
    });

    return ids;
  } catch (e) {
    if (!stillOk()) return host._vhMapUniqueIds;
    agriLog("vhMapUniqueIds:FAILED", { vhCategory, error: errorMessage(e) });
    return resetVhIds(host, []);
  }
};
