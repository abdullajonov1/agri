import type { AgriGraffWidgetState, ChartVegetationRow } from "../widget";
import { graffLog } from "../graff-log";
import { type snapshotGraffRegionalFilters, isGraffRegionalFilterSnapshotStale } from "../../../../data/agri-graff-date";
import { buildGraffRegionalScopeKey, queryGraffRegionalTimeseriesMerged } from "../../../../data/agri-graff-stats";
import { type RepublicTimeseriesIndexField, isRepublicTimeseriesIndexField, REPUBLIC_TIMESERIES_INDEX_FIELDS } from "../graff-graph-constants";
import { type RegionalTimeseriesRow, mergeRegionalTimeseriesFieldsIntoChart } from "../graff-timeseries-helpers";
import { canConsumeGraffDashboardPack } from "../../../../data/agri-dashboard-pack-apply";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../store/agri-dashboard-store";
import { matchGraffDashboardPack } from "../../../../data/agri-dashboard-pack-match";
import type { GraffDataServiceHost } from "./regional-timeseries";

export type GraffFilterSnapshot = ReturnType<typeof snapshotGraffRegionalFilters>;
type GraffLanguage = AgriGraffWidgetState["language"];
export type UnresolvedScope = "region" | "district";

const PACK_READY_TIMEOUT_MS = 2500;

// ---------------------------------------------------------------- guards

export const createRegionalStaleCheck = (
  host: GraffDataServiceHost,
  requestId: number,
  filterSnapshot: GraffFilterSnapshot,
): (() => boolean) => () => {
  if (!host._isMounted) return true;
  if (host.state.viewMode !== "graph") return true;
  if (requestId !== host._regionalTimeseriesRequestId) return true;
  if (host.state.selecteduniqueid) return true;
  return isGraffRegionalFilterSnapshotStale(filterSnapshot, host.state.regionalFilters);
};

export const getUnresolvedScopeMessage = (
  language: GraffLanguage,
  scope: UnresolvedScope,
): string => {
  const isRegion = scope === "region";
  if (language === "en") {
    return isRegion
      ? "Could not determine the selected region code."
      : "Could not determine the selected district code.";
  }
  if (language === "ru") {
    return isRegion
      ? "Не удалось определить код выбранной области."
      : "Не удалось определить код выбранного района.";
  }
  if (language === "uz_lat") {
    return isRegion
      ? "Tanlangan viloyat kodi aniqlanmadi."
      : "Tanlangan tuman kodi aniqlanmadi.";
  }
  return isRegion
    ? "Танланган вилоят коди аниқланмади."
    : "Танланган туман коди аниқланмади.";
};

export const getUnresolvedCropMessage = (language: GraffLanguage): string => {
  if (language === "en") return "Could not determine the selected crop code.";
  if (language === "ru") return "Не удалось определить код выбранной культуры.";
  if (language === "uz_cyr") return "Танланган экин коди аниқланмади.";
  return "Tanlangan ekin kodi aniqlanmadi.";
};

// ------------------------------------------------- scope key + lookups

export interface RegionalGeoScope {
  effectiveViloyat: string;
  vilKey: string;
  effectiveTuman: string;
  regionNum: number | undefined;
  effectiveDistrictNum: number | undefined;
  unresolvedScope: UnresolvedScope | null;
}

const isFiniteNumber = (value: number | null | undefined): value is number =>
  value != null && Number.isFinite(value);

export const resolveRegionalGeoScope = (
  host: GraffDataServiceHost,
  filterSnapshot: GraffFilterSnapshot,
): RegionalGeoScope => {
  const effectiveViloyat = host.normalizeApos(filterSnapshot.viloyat);
  const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
  const effectiveTuman = filterSnapshot.tuman ? host.normalizeApos(filterSnapshot.tuman) : "";
  const storedRegionCode = isFiniteNumber(host.state.regionalRegionCode)
    ? host.state.regionalRegionCode
    : null;
  const mappedRegionFromName =
    /^\d+$/.test(effectiveViloyat) && effectiveViloyat
      ? Number(effectiveViloyat)
      : vilKey
        ? host._viloyatToRegion[vilKey]
        : undefined;
  // Prefer name→region mapping over cached regionalRegionCode — the
  // cache can briefly belong to the previous viloyat during rapid clicks.
  const regionNum = isFiniteNumber(mappedRegionFromName)
    ? mappedRegionFromName
    : storedRegionCode ?? undefined;
  const districtNum = effectiveTuman
    ? isFiniteNumber(host.state.regionalDistrictCode)
      ? host.state.regionalDistrictCode
      : host.resolveDistrictNumber(effectiveViloyat, effectiveTuman, regionNum)
    : undefined;
  const effectiveDistrictNum =
    filterSnapshot.tuman && isFiniteNumber(districtNum) ? districtNum : undefined;

  // Fail closed. Silently omitting an unresolved geographic code would
  // display a republic/viloyat average under a narrower selection.
  const unresolvedScope: UnresolvedScope | null =
    effectiveViloyat && !isFiniteNumber(regionNum)
      ? "region"
      : effectiveTuman && effectiveDistrictNum === undefined
        ? "district"
        : null;
  return { effectiveViloyat, vilKey, effectiveTuman, regionNum, effectiveDistrictNum, unresolvedScope };
};

export const resetRegionalAppliedCache = (host: GraffDataServiceHost): void => {
  host._regionalTimeseriesRequestKey = "";
  host._regionalTimeseriesAppliedKey = "";
  host._regionalTimeseriesLoadedAvgFields.clear();
};

export const finishRegionalWithError = (
  host: GraffDataServiceHost,
  vegetationError: string,
): void => {
  host._hasCompletedGraphFetch = true;
  host.setState({ vegetationData: [], loadingVegetation: false, vegetationError });
};

export interface RegionalCropSelection {
  cropIds: string[];
  cropId: string | undefined;
  unresolvedCrops: string[];
}

export const resolveRegionalCropSelection = (
  host: GraffDataServiceHost,
  filterSnapshot: GraffFilterSnapshot,
): RegionalCropSelection => {
  const snapshotTurlar: string[] = JSON.parse(filterSnapshot.turlar || "[]");
  const selectedTurlar = snapshotTurlar.length
    ? snapshotTurlar
    : filterSnapshot.turi
      ? [filterSnapshot.turi]
      : [];
  const resolvedCropIds = selectedTurlar.map((crop) => host.resolveCropIdForTuri(crop));
  const unresolvedCrops = selectedTurlar.filter((_crop, index) => !resolvedCropIds[index]);
  const cropIds = Array.from(
    new Set(resolvedCropIds.filter((value): value is string => Boolean(value))),
  );
  const cropId = cropIds.length === 1 ? cropIds[0] : undefined;
  return { cropIds, cropId, unresolvedCrops };
};

export const buildRegionalScopeKeyFor = (
  regionNum: number | undefined,
  districtNum: number | undefined,
  cropIds: string[],
  startDate: string,
  endDate: string,
): string =>
  buildGraffRegionalScopeKey({
    region: isFiniteNumber(regionNum) ? regionNum : null,
    district: districtNum ?? null,
    cropIds,
    startDate,
    endDate,
  });

export const getDesiredRepublicFields = (
  selectedIndices: readonly string[] | null | undefined,
): RepublicTimeseriesIndexField[] => {
  const fields: RepublicTimeseriesIndexField[] = Array.from(
    new Set((selectedIndices || ["ndvi"]).map((key) => String(key).toLowerCase()).filter(isRepublicTimeseriesIndexField)),
  );
  return fields.length ? fields : ["ndvi"];
};

// ----------------------------------------------------------------- query

export interface RegionalQueryParams {
  regionNum: number | undefined;
  districtNum: number | undefined;
  cropIds: string[];
  startDate: string;
  endDate: string;
  avgFields: string[] | undefined;
}

export const queryRegionalRows = async (
  params: RegionalQueryParams,
): Promise<RegionalTimeseriesRow[]> =>
  (await queryGraffRegionalTimeseriesMerged({
    region: isFiniteNumber(params.regionNum) ? params.regionNum : undefined,
    district: params.districtNum,
    cropIds: params.cropIds,
    startDate: params.startDate,
    endDate: params.endDate,
    avgFields: params.avgFields,
  })) as RegionalTimeseriesRow[];

export interface DashboardPackLookup {
  requestKey: string;
  requestId: number;
  vh: string;
  isRepublicScope: boolean;
  canAugmentExisting: boolean;
  needsMoreThanNdvi: boolean;
}

/** Returns "stale" if the request went stale while waiting, rows on a hit, else null. */
export const lookupRegionalDashboardPack = async (
  host: GraffDataServiceHost,
  lookup: DashboardPackLookup,
  isStale: () => boolean,
): Promise<RegionalTimeseriesRow[] | "stale" | null> => {
  const hasVh = !!String(lookup.vh || "").trim();
  if (
    lookup.needsMoreThanNdvi ||
    !canConsumeGraffDashboardPack({
      hasVh,
      selectedUniqueid: host.state.selecteduniqueid,
      canAugmentExisting: lookup.canAugmentExisting,
    })
  ) {
    return null;
  }
  await waitForDashboardPackReady(PACK_READY_TIMEOUT_MS);
  if (isStale()) return "stale";
  const graffPack = matchGraffDashboardPack(getDashboardPack(), {
    scopeKey: lookup.requestKey,
    hasVh,
    canAugmentExisting: lookup.canAugmentExisting,
  });
  if (!graffPack) return null;
  const rows = graffPack.rows as RegionalTimeseriesRow[];
  graffLog("fetchRegionalTimeseries:pack-hit", {
    requestKey: lookup.requestKey,
    rowCount: rows.length,
    requestId: lookup.requestId,
    republicNdviOnly: lookup.isRepublicScope,
  });
  return rows;
};

// ------------------------------------------------------ merge into chart

interface MinMax {
  min: number;
  max: number;
}

const rangeOf = (values: number[]): MinMax | null =>
  values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;

export const summarizeRegionalResponse = (rows: readonly RegionalTimeseriesRow[]) => {
  const validNdviRows = rows.filter((row) => Number.isFinite(Number(row.ndvi)));
  return {
    rawRowCount: rows.length,
    validNdviRowCount: validNdviRows.length,
    ndviRange: rangeOf(validNdviRows.map((row) => Number(row.ndvi))),
    polygonCountRange: rangeOf(validNdviRows.map((row) => Number(row.polygon_count) || 0)),
  };
};

export const sortRowsByDate = <T extends { date: string }>(rows: readonly T[]): T[] =>
  rows.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Republic pack / query may be NDVI-only; viloyat/tuman (or full query)
// loads every index so legend toggles do not refetch.
export const pickRegionalFetchedFields = (
  usedDashboardPack: boolean,
  isRepublicScope: boolean,
  avgFields: string[] | undefined,
): string[] => {
  if (usedDashboardPack) {
    return isRepublicScope ? ["ndvi"] : [...REPUBLIC_TIMESERIES_INDEX_FIELDS];
  }
  return avgFields?.length ? avgFields : [...REPUBLIC_TIMESERIES_INDEX_FIELDS];
};

export const buildRegionalChartRows = (
  existing: ChartVegetationRow[],
  sorted: RegionalTimeseriesRow[],
  fetchedFields: string[],
  canAugmentExisting: boolean,
): ChartVegetationRow[] =>
  canAugmentExisting
    ? mergeRegionalTimeseriesFieldsIntoChart(existing, sorted, fetchedFields)
    : sorted.map((row) => ({ ...row, raster_date: row.date }));

// ----------------------------------------------------------- apply/state

export const markRegionalFieldsLoaded = (
  host: GraffDataServiceHost,
  isRepublicScope: boolean,
  canAugmentExisting: boolean,
  sortedRowCount: number,
  fetchedFields: string[],
): void => {
  const loaded = host._regionalTimeseriesLoadedAvgFields;
  if (!isRepublicScope) {
    REPUBLIC_TIMESERIES_INDEX_FIELDS.forEach((field) => loaded.add(field));
    return;
  }
  // First scope paint: mark requested fields even when empty (no rows).
  // Augment: only mark when the server returned rows — empty augment
  // must remain retryable (do not permanently skip a missing index).
  if (canAugmentExisting && sortedRowCount === 0) return;
  fetchedFields.forEach((field) => {
    if (isRepublicTimeseriesIndexField(field)) loaded.add(field);
  });
};
