import type { LocalizationConfig, LocalizationHost } from "../../host";
import { type VHBarData, VH_TO_NDVI_STATUS } from "../../../../../localization/vh-constants";
import { buildVhBarComputeKey } from "../../../../../localization/vh-bar-aggregate";
import { executeVhBarCompute } from "../../../../../localization/vh-bar-compute";
import { agriLog } from "../../localization-log";
import { syncMasterFilterSnapshot } from "../../../../../../data/agri-filter-store";
import { resolveRegionNumberFromMaps, resolveDistrictNumberFromMaps, buildVhUniqueIdCacheKey } from "../../../../../localization/resolve-geo-codes";
import { queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";

/** Max entries kept in `_vhUniqueIdCache` (oldest inserted dropped first). */
export const VH_UNIQUEID_CACHE_MAX = 96;
/** Get latest available NDVI date for bar (selected date, or latest from options/map, or from layer fields). */
export function getLatestNdviDateForBar(
  host: LocalizationHost,
  primaryLayer?: __esri.FeatureLayer,
): string | null {
  const current = (host.state.ndviDate || "").trim();
  if (current) return current;
  const opts = host.state.ndviDateOptions;
  if (opts?.length) return opts[opts.length - 1];
  const keys = Object.keys(host._ndviDateFieldMap);
  if (keys.length) {
    const sorted = keys.slice().sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      if (Number.isNaN(ta) || Number.isNaN(tb)) return a.localeCompare(b);
      return ta - tb;
    });
    return sorted[sorted.length - 1];
  }
  if (primaryLayer?.fields?.length) {
    const cfg = (host.props.config || {}) as LocalizationConfig;
    const prefix =
      (cfg.polygonStatusPrefix || "status_").toString().trim() || "status_";
    const dateLabels: string[] = [];
    for (const f of primaryLayer.fields) {
      const name = f.name || "";
      if (!String(name).toLowerCase().startsWith(prefix.toLowerCase()))
        continue;
      const rawSuffix = String(name).slice(prefix.length);
      const digitsOnly = rawSuffix.replace(/[^0-9]/g, "");
      const label =
        digitsOnly.length >= 8
          ? `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6, 8)}`
          : rawSuffix.replace(/_/g, "-");
      dateLabels.push(label);
    }
    if (dateLabels.length) {
      dateLabels.sort((a, b) => {
        const ta = Date.parse(a);
        const tb = Date.parse(b);
        if (Number.isNaN(ta) || Number.isNaN(tb)) return a.localeCompare(b);
        return ta - tb;
      });
      return dateLabels[dateLabels.length - 1];
    }
  }
  return null;
}
/**
 * Compute VH bar data from agri_vegetation_indices' ndvi_status field —
 * grouped counts per status, for the current viloyat/tuman + an NDVI
 * date (explicit selection, or newest-with-data via queryVegetationAvailableDates).
 *
 * Previously this scanned the polygon layer for wide `status_YYYY_MM_DD`
 * columns — a schema that only ever existed on a different (Agri) layer.
 * `featureLayers` here is Agri_table_data, which never had those columns,
 * so this always returned the all-zero fallback. agri_vegetation_indices
 * has a real per-date `ndvi_status` field, no schema guessing needed.
 */
export const computeVhBarData = async (host: LocalizationHost): Promise<VHBarData | null> => {
  const key = host.makeVhBarComputeKey();
  const memoized = host._vhBarComputeMemo.get(key);
  if (memoized) return memoized;
  const inflight = host._vhBarComputeInFlight.get(key);
  if (inflight) return inflight;

  const promise = host.executeComputeVhBarData()
    .then((result) => {
      if (result) {
        host._vhBarComputeMemo.set(key, result);
        while (host._vhBarComputeMemo.size > 8) {
          const oldestKey = host._vhBarComputeMemo.keys().next().value;
          if (!oldestKey) break;
          host._vhBarComputeMemo.delete(oldestKey);
        }
      }
      return result;
    })
    .finally(() => {
      host._vhBarComputeInFlight.delete(key);
    });
  host._vhBarComputeInFlight.set(key, promise);
  host._lastVhBarComputeKey = key;
  return promise;
};
export const makeVhBarComputeKey = (host: LocalizationHost): string => {
  const {
    viloyat,
    lockedViloyat,
    tuman,
    yil,
    ndviDate,
    ndviDateLocked,
  } = host.state;
  const effectiveViloyat = lockedViloyat || viloyat;
  const chartFlags = host.getChartFilterFlags();
  const selectedTurlar = chartFlags.filterVhBarByCrop
    ? host.getSelectedTurlar()
    : [];
  return buildVhBarComputeKey({
    yil: String(yil || ""),
    viloyat: String(effectiveViloyat || ""),
    tuman: String(effectiveViloyat ? tuman || "" : ""),
    turlar: selectedTurlar,
    ndviDate: String(ndviDate || "").trim(),
    ndviDateLocked: Boolean(ndviDateLocked),
    polygonMode: false,
    uniqueid: "",
    filterVhBarByCrop: chartFlags.filterVhBarByCrop,
    farmerInn: String(host.state.selectedFarmerInn || "").trim(),
  });
};
export const executeComputeVhBarData = async (host: LocalizationHost): Promise<VHBarData | null> => {
  // Tag the resulting bar date with the geography this compute reads below;
  // by the time it resolves the user may already be on another viloyat.
  const geoKeyAtStart = host.makeVhBarDateGeoKey();
  return executeVhBarCompute({
    state: {
      viloyat: host.state.viloyat,
      lockedViloyat: host.state.lockedViloyat,
      tuman: host.state.tuman,
      yil: host.state.yil,
      ndviDate: host.state.ndviDate,
      ndviDateLocked: host.state.ndviDateLocked,
    },
    isMounted: () => host._isMounted,
    viloyatToRegion: host._viloyatToRegion,
    tumanToDistrict: host._tumanToDistrict,
    normalizeApos: host.normalizeApos,
    makeRegionDistrictKey: (raw) => host.makeRegionDistrictKey(raw),
    getChartFilterFlags: () => host.getChartFilterFlags(),
    getSelectedTurlar: () => host.getSelectedTurlar(),
    resolveCropIdForTuri: (turi) => host.resolveCropIdForTuri(turi),
    getVhBarUsedDate: () => host._vhBarUsedDate,
    setVhBarUsedDate: (date) => {
      host._vhBarUsedDate = date;
      host._vhBarUsedDateGeo = date ? geoKeyAtStart : null;
    },
    setState: (patch) => host.setState(patch),
    prefetchVhStatusUniqueIds: (date) => host.prefetchVhStatusUniqueIds(date),
    log: (phase, detail) => agriLog(phase, detail),
    farmerUniqueIds: String(host.state.selectedFarmerInn || "").trim()
      ? host._farmerMapUniqueIds
      : null,
  });
};
/**
 * Progressive republic totals while spinner stays on (pending=true).
 * Avoids the old bug where pending=false made incomplete totals look final.
 */
export const publishVhBarPartial = (host: LocalizationHost, vhBarData: VHBarData): void => {
  if (!host._isMounted || !host._lastBroadcastDetail) return;
  const computeKey = host.makeVhBarComputeKey();
  if (
    host._lastVhBarComputeKey &&
    computeKey !== host._lastVhBarComputeKey
  ) {
    return;
  }
  const detail = {
    ...host._lastBroadcastDetail,
    vhBarData,
    vhBarDataPending: true,
  };
  host._lastBroadcastDetail = detail;
  host._lastBroadcastDigest = "";
  syncMasterFilterSnapshot(detail);
  document.dispatchEvent(
    new CustomEvent("masterFilterChanged", {
      detail,
      bubbles: true,
    }),
  );
};
/**
 * VH bar date, but only when it was proved on the current viloyat/tuman.
 * Callers that need a date for the *current* scope (cache keys, Pie) must
 * not reuse another region's date; date probing may still try it first.
 */
export const getGeoScopedVhBarUsedDate = (host: LocalizationHost): string => {
  const date = String(host._vhBarUsedDate || "").trim();
  if (!date) return "";
  return host._vhBarUsedDateGeo === host.makeVhBarDateGeoKey() ? date : "";
};
/** Write a uniqueid list, dropping the oldest entries past the cap. */
export const setVhUniqueIdCacheEntry = (host: LocalizationHost, key: string, ids: string[]): void => {
  if (!key) return;
  host._vhUniqueIdCache[key] = ids;
  const keys = Object.keys(host._vhUniqueIdCache);
  const overflow = keys.length - VH_UNIQUEID_CACHE_MAX;
  for (let i = 0; i < overflow; i += 1) {
    if (keys[i] === key) continue;
    delete host._vhUniqueIdCache[keys[i]];
  }
};
/**
 * Build the cache key used by resolve/prefetch for map-scoped VH uniqueids.
 * Returns null when region/status/date cannot be resolved yet.
 */
export const buildVhMapUniqueIdCacheKey = (host: LocalizationHost): string | null => {
  const vhCategory = host.normalizeApos(String(host.state.vh || "")).trim();
  const status = vhCategory ? VH_TO_NDVI_STATUS[vhCategory] : undefined;
  if (!status) return null;

  const ndviDate =
    (host.state.ndviDateLocked && (host.state.ndviDate || "").trim()) ||
    host.getGeoScopedVhBarUsedDate() ||
    (host.state.ndviDate || "").trim();
  if (!ndviDate) return null;

  const rawViloyat = (
    host.state.lockedViloyat ||
    host.state.viloyat ||
    ""
  ).toString();
  const regionNum = resolveRegionNumberFromMaps(
    rawViloyat,
    host._viloyatToRegion,
    host.getGeoCodeHelpers(),
  );
  if (regionNum === undefined) return null;

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

  const cropIds = host.getCropIdsForVhUniqueIdScope();

  return buildVhUniqueIdCacheKey({
    status,
    ndviDate,
    regionNum,
    districtNum,
    cropIds,
  });
};
/** True when the current VH map-scope uniqueid list is already cached. */
export const isVhMapUniqueIdCacheWarm = (host: LocalizationHost): boolean => {
  const key = host.buildVhMapUniqueIdCacheKey();
  return !!key && Array.isArray(host._vhUniqueIdCache[key]);
};
/**
 * Warm the uniqueid cache for every VH status on the chart's working date.
 * Prefetches map scope (optional district) AND viloyat-wide (no district) so
 * AgriRegion's background resolve is usually a cache hit on VH click.
 *
 * Only runs while a VH bucket is already selected — geography-only viloyat
 * select must not page 4× status uniqueid chains in the background (~dozens
 * of PBF queries that never get used until the user clicks VH).
 */
export const prefetchVhStatusUniqueIds = (host: LocalizationHost, ndviDate: string): void => {
  const date = String(ndviDate || "").trim();
  if (!date || !host._isMounted) return;
  if (!String(host.state.vh || "").trim()) return;

  const rawViloyat = (
    host.state.lockedViloyat ||
    host.state.viloyat ||
    ""
  ).toString();
  const regionNum = resolveRegionNumberFromMaps(
    rawViloyat,
    host._viloyatToRegion,
    host.getGeoCodeHelpers(),
  );
  if (regionNum === undefined) return;

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

  const cropIds = host.getCropIdsForVhUniqueIdScope();
  // Map scope (+ district when set) and always viloyat-wide for Region bars.
  const districtScopes: Array<number | undefined> =
    districtNum != null && Number.isFinite(districtNum)
      ? [districtNum, undefined]
      : [undefined];

  for (const status of Object.values(VH_TO_NDVI_STATUS)) {
    for (const districtScope of districtScopes) {
      const cacheKey = buildVhUniqueIdCacheKey({
        status,
        ndviDate: date,
        regionNum,
        districtNum: districtScope,
        cropIds,
      });
      if (host._vhUniqueIdCache[cacheKey]) continue;
      void queryVegetationUniqueIdsForStatus({
        region: regionNum,
        district: districtScope,
        date,
        ndviStatus: status,
        cropIds: cropIds.length ? cropIds : undefined,
      })
        .then((ids) => {
          if (!host._isMounted) return;
          host.setVhUniqueIdCacheEntry(cacheKey, ids);
        })
        .catch(() => {
          /* prefetch is best-effort */
        });
    }
  }
};
