import type { LocalizationHost } from "../host";

/** Host members read or called by vh-bar-load.ts. */
export type VhBarLoadHost = Pick<
  LocalizationHost,
  | "_isMounted"
  | "_ndviBucketToIds"
  | "_ndviDateFieldMap"
  | "_reuseVhBarDataOnNextBroadcast"
  | "_vhRegionChartUniqueIds"
  | "_vhResolveGen"
  | "_vhUniqueIdCache"
  | "broadcastFilterState"
  | "buildNdviSpatialWhere"
  | "props"
  | "setVhUniqueIdCacheEntry"
  | "state"
>;

/** Host members read or called by vh-bar-prep.ts. */
export type VhBarPrepHost = Pick<
  LocalizationHost,
  | "_farmerMapUniqueIds"
  | "_isMounted"
  | "_lastBroadcastDetail"
  | "_lastBroadcastDigest"
  | "_lastVhBarComputeKey"
  | "_ndviDateFieldMap"
  | "_tumanToDistrict"
  | "_vhBarComputeInFlight"
  | "_vhBarComputeMemo"
  | "_vhBarUsedDate"
  | "_vhBarUsedDateGeo"
  | "_vhUniqueIdCache"
  | "_viloyatToRegion"
  | "buildVhMapUniqueIdCacheKey"
  | "executeComputeVhBarData"
  | "getChartFilterFlags"
  | "getCropIdsForVhUniqueIdScope"
  | "getGeoCodeHelpers"
  | "getGeoScopedVhBarUsedDate"
  | "getSelectedTurlar"
  | "makeRegionDistrictKey"
  | "makeVhBarComputeKey"
  | "makeVhBarDateGeoKey"
  | "normalizeApos"
  | "prefetchVhStatusUniqueIds"
  | "props"
  | "resolveCropIdForTuri"
  | "setState"
  | "setVhUniqueIdCacheEntry"
  | "state"
>;

/** Host members read or called by vh-bar-resolve.ts. */
export type VhBarResolveHost = Pick<
  LocalizationHost,
  | "_chartDimOrder"
  | "_isMounted"
  | "_reuseVhBarDataOnNextBroadcast"
  | "_tumanToDistrict"
  | "_vhBarUsedDate"
  | "_vhMapUniqueIds"
  | "_vhRegionChartUniqueIds"
  | "_vhResolveGen"
  | "_vhUniqueIdCache"
  | "_vhUniqueIdsCropScoped"
  | "_viloyatToRegion"
  | "broadcastFilterState"
  | "getChartFilterFlags"
  | "getCropIdsForVhUniqueIdScope"
  | "getGeoCodeHelpers"
  | "getGeoScopedVhBarUsedDate"
  | "getSelectedTurlar"
  | "normalizeApos"
  | "resolveCropIdForTuri"
  | "resolveVhRegionChartUniqueIdsBackground"
  | "setState"
  | "setVhUniqueIdCacheEntry"
  | "state"
>;

/** Host members read by isVhYearSummaryScope. */
export type VhBarYearScopeHost = Pick<LocalizationHost, "state">;
