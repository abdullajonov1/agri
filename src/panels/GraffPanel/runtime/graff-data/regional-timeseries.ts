import type { AgriGraffWidgetState, ChartVegetationRow, VegetationIndex } from "../widget";
import type { GraffWidgetProps } from "../graff-state";
import { type React } from "jimu-core";
import type { GraffPendingOverlayWalk } from "../graff-raster-overlay";
import type { VegetationIndiceType, PolygonExportImageResult } from "../../../../gis/agri-polygon-api-source";
import { graffLog } from "../graff-log";
import { describeThrown, thrownMessage } from "../graff-guards";
import { snapshotGraffRegionalFilters, extractGraffYearToken } from "../../../../data/agri-graff-date";
import { getTuriCropLookupKey } from "../../../../shared/agri-crop-labels";
import type { RegionalTimeseriesRow } from "../graff-timeseries-helpers";
import {
  type GraffFilterSnapshot,
  type RegionalCropSelection,
  type RegionalGeoScope,
  type UnresolvedScope,
  buildRegionalChartRows,
  buildRegionalScopeKeyFor,
  createRegionalStaleCheck,
  finishRegionalWithError,
  getDesiredRepublicFields,
  getUnresolvedCropMessage,
  getUnresolvedScopeMessage,
  lookupRegionalDashboardPack,
  markRegionalFieldsLoaded,
  pickRegionalFetchedFields,
  queryRegionalRows,
  resetRegionalAppliedCache,
  resolveRegionalCropSelection,
  resolveRegionalGeoScope,
  sortRowsByDate,
  summarizeRegionalResponse,
} from "./regional-timeseries-steps";

export interface GraffDataServiceHost {
  state: AgriGraffWidgetState;
  setState: React.Component<GraffWidgetProps, AgriGraffWidgetState>["setState"];
  _isMounted: boolean;
  _hasCompletedGraphFetch: boolean;
  _vegetationDataRequestId: number;
  _regionalTimeseriesRequestId: number;
  _regionalTimeseriesRequestKey: string;
  _regionalTimeseriesAppliedKey: string;
  _regionalTimeseriesLoadedAvgFields: Set<string>;
  _viloyatToRegion: Record<string, number>;
  _turiToCropId: Record<string, string>;
  _polygonAvailableDatesUniqueid: string;
  _latestRasterDateByUniqueid: Map<string, string>;
  _pendingOverlayWalk: GraffPendingOverlayWalk | null;
  _vegetationImageRequestId: number;
  _vegetationOverlayPendingKey: string;
  _vegetationOverlayAppliedKey: string;
  clearVegetationImageSurfaceLoading: (requestId: number) => void;
  beginGraphFetch: () => void;
  ensureRegionDistrictForSelection: () => Promise<void>;
  normalizeApos: (s: string) => string;
  makeRegionDistrictKey: (raw: string | null | undefined) => string;
  resolveDistrictNumber: (
    viloyat: string,
    tuman: string,
    regionHint?: number,
  ) => number | undefined;
  resolveCropIdForTuri: (turi: string) => string | undefined;
  applyGraphData: (
    nextData: ChartVegetationRow[],
    extra?: Partial<AgriGraffWidgetState>,
    options?: { animate?: boolean },
  ) => void;
  resolveCurrentRegionId: () => number | undefined;
  resolveCurrentYear: () => number | undefined;
  resolveCropIdForUniqueid: (uniqueid: string | null | undefined) => number | null;
  rememberRasterDateForUniqueid: (uniqueid: string, dates: string[]) => void;
  markOverlayDateVerified: (cleanId: string, date: string) => void;
  applyVegetationImageOverlay: (
    uniqueid: string,
    rasterDate: string,
    indiceType?: VegetationIndiceType,
    prefetched?: PolygonExportImageResult | null,
    options?: { interactive?: boolean },
  ) => Promise<void>;
  getCarriedOverlayDate: (
    regionId: number | undefined,
    year: number | undefined,
  ) => string | null;
  kickOptimisticVegetationOverlay: (uniqueid: string) => void;
  beginVegetationImageSurfaceLoading: () => void;
  preparePolygonGraphSeries: (
    rows: VegetationIndex[],
    availableDates: string[],
  ) => {
    sorted: VegetationIndex[];
    nextDate: string | null;
    nextIndexKey: VegetationIndiceType | null;
    fingerprint: string;
  };
  cancelVegetationImageOverlay: () => void;
  resolveAgainstAvailableDates: (rawDate: unknown, availableDates: string[]) => string | null;
}

interface RegionalFetchContext {
  host: GraffDataServiceHost;
  filterSnapshot: GraffFilterSnapshot;
  yearToken: string;
  requestId: number;
  requestKey: string;
  isStale: () => boolean;
}

interface RegionalApplyOptions {
  usedDashboardPack: boolean;
  isRepublicScope: boolean;
  canAugmentExisting: boolean;
  avgFields: string[] | undefined;
}

const failUnresolvedScope = (
  ctx: RegionalFetchContext,
  geo: RegionalGeoScope,
  scope: UnresolvedScope,
): void => {
  const { host, filterSnapshot, requestId } = ctx;
  resetRegionalAppliedCache(host);
  const vegetationError = getUnresolvedScopeMessage(host.state.language, scope);
  graffLog("fetchRegionalTimeseries:SKIP-unresolved-scope", {
    viloyat: filterSnapshot.viloyat,
    tuman: filterSnapshot.tuman,
    unresolvedScope: scope,
    resolvedRegionNum: geo.regionNum,
    resolvedDistrictNum: geo.effectiveDistrictNum,
    requestId,
  });
  finishRegionalWithError(host, vegetationError);
};

const applyRegionalRows = (
  ctx: RegionalFetchContext,
  data: RegionalTimeseriesRow[],
  opts: RegionalApplyOptions,
): void => {
  const { host, filterSnapshot, requestId, requestKey, isStale } = ctx;
  graffLog("fetchRegionalTimeseries:response", {
    ...summarizeRegionalResponse(data),
    rowCount: data.length,
    duplicateDateRowsMerged: 0,
    usedDashboardPack: opts.usedDashboardPack,
    avgFields: opts.avgFields || "full",
    requestId,
    stale: isStale(),
  });
  if (isStale()) {
    graffLog("fetchRegionalTimeseries:SKIP-stale", {
      requestId,
      selecteduniqueid: host.state.selecteduniqueid,
      filterSnapshot,
      current: host.state.regionalFilters,
    });
    return;
  }
  const sorted = sortRowsByDate(data);
  const fetchedFields = pickRegionalFetchedFields(
    opts.usedDashboardPack,
    opts.isRepublicScope,
    opts.avgFields,
  );
  const chartRows = buildRegionalChartRows(
    host.state.vegetationData,
    sorted,
    fetchedFields,
    opts.canAugmentExisting,
  );
  host._regionalTimeseriesAppliedKey = requestKey;
  markRegionalFieldsLoaded(
    host,
    opts.isRepublicScope,
    opts.canAugmentExisting,
    sorted.length,
    fetchedFields,
  );
  host.applyGraphData(chartRows, { dateRangeStartIndex: null, dateRangeEndIndex: null });
};

const fetchAndApplyRegionalScope = async (
  ctx: RegionalFetchContext,
  geo: RegionalGeoScope,
  crops: RegionalCropSelection,
  startDate: string,
  endDate: string,
): Promise<void> => {
  const { host, filterSnapshot, requestId, requestKey, isStale } = ctx;
  if (requestKey !== host._regionalTimeseriesAppliedKey) {
    // New geography/year/crop/VH — drop partial index cache for the old scope.
    host._regionalTimeseriesLoadedAvgFields.clear();
  }
  const isRepublicScope = geo.regionNum === undefined || !Number.isFinite(geo.regionNum);
  const desiredRepublicFields = getDesiredRepublicFields(host.state.selectedIndices);

  // Same resolved scope already showing — finish loading without refetch.
  // Republic: also require every currently selected index to be loaded
  // (SAVI/EVI toggles fetch only the missing columns).
  // Do NOT skip merely because another in-flight call shares this key:
  // that older call may still become stale and never clear the spinner.
  const republicFieldsReady =
    !isRepublicScope ||
    desiredRepublicFields.every((field) => host._regionalTimeseriesLoadedAvgFields.has(field));
  if (
    requestKey === host._regionalTimeseriesAppliedKey &&
    host.state.vegetationData.length > 0 &&
    !host.state.vegetationError &&
    republicFieldsReady
  ) {
    graffLog("fetchRegionalTimeseries:SKIP-already-applied", {
      requestKey,
      existingRowCount: host.state.vegetationData.length,
      isRepublicScope,
      desiredRepublicFields,
      loadedFields: Array.from(host._regionalTimeseriesLoadedAvgFields),
    });
    host._hasCompletedGraphFetch = true;
    host.setState({ loadingVegetation: false });
    return;
  }
  host._regionalTimeseriesRequestKey = requestKey;
  host.setState({ loadingVegetation: true, vegetationError: null });

  // Republic (no viloyat): only AVG selected indices — default NDVI alone.
  // Viloyat/tuman: full outStatistics (all indices + min/max) so toggles are instant.
  const missingRepublicFields = desiredRepublicFields.filter(
    (field) => !host._regionalTimeseriesLoadedAvgFields.has(field),
  );
  const avgFields: string[] | undefined = isRepublicScope
    ? missingRepublicFields.length
      ? missingRepublicFields
      : desiredRepublicFields
    : undefined;
  const canAugmentExisting =
    isRepublicScope &&
    requestKey === host._regionalTimeseriesAppliedKey &&
    host._regionalTimeseriesLoadedAvgFields.size > 0 &&
    host.state.vegetationData.length > 0;

  const turiKey = filterSnapshot.turi ? getTuriCropLookupKey(filterSnapshot.turi) : "";
  graffLog("fetchRegionalTimeseries:request", {
    viloyat: filterSnapshot.viloyat,
    tuman: filterSnapshot.tuman,
    yil: filterSnapshot.yil,
    turi: filterSnapshot.turi,
    vh: filterSnapshot.vh,
    resolvedRegionNum: geo.regionNum,
    resolvedDistrictNum: geo.effectiveDistrictNum,
    resolvedCropId: crops.cropId,
    turiKeyFoundInMap: turiKey ? turiKey in host._turiToCropId : null,
    vilKeyFoundInMap: geo.vilKey ? geo.vilKey in host._viloyatToRegion : null,
    isRepublicScope,
    desiredRepublicFields,
    avgFields: avgFields || "full",
    canAugmentExisting,
    requestId,
  });
  // No ndviStatus: the summary table has no status column; VH filter is intentionally not applied (option B).

  // Shared DashboardPack hit — skip duplicate vegetation groupBy.
  // Republic pack is NDVI-only; use it only when no other index is needed.
  const packRows = await lookupRegionalDashboardPack(
    host,
    {
      requestKey,
      requestId,
      vh: filterSnapshot.vh,
      isRepublicScope,
      canAugmentExisting,
      needsMoreThanNdvi: isRepublicScope && desiredRepublicFields.some((field) => field !== "ndvi"),
    },
    isStale,
  );
  if (packRows === "stale") return;
  const data =
    packRows ??
    (await queryRegionalRows({
      regionNum: geo.regionNum,
      districtNum: geo.effectiveDistrictNum,
      cropIds: crops.cropIds,
      startDate,
      endDate,
      avgFields,
    }));
  applyRegionalRows(ctx, data, {
    usedDashboardPack: packRows !== null,
    isRepublicScope,
    canAugmentExisting,
    avgFields,
  });
};

const runRegionalFetch = async (ctx: RegionalFetchContext): Promise<void> => {
  const { host, filterSnapshot, yearToken, requestId, isStale } = ctx;
  await host.ensureRegionDistrictForSelection();
  if (isStale()) {
    graffLog("fetchRegionalTimeseries:SKIP-stale-after-ensure", {
      filterSnapshot,
      current: host.state.regionalFilters,
      requestId,
    });
    return;
  }

  // Re-read after the await — filters may have moved; prefer live state
  // only when it still matches the snapshot we started with.
  const geo = resolveRegionalGeoScope(host, filterSnapshot);
  if (geo.unresolvedScope) {
    failUnresolvedScope(ctx, geo, geo.unresolvedScope);
    return;
  }
  const startDate = `${yearToken}-01-01`;
  const endDate = `${yearToken}-12-31`;
  const crops = resolveRegionalCropSelection(host, filterSnapshot);
  if (crops.unresolvedCrops.length) {
    const vegetationError = getUnresolvedCropMessage(host.state.language);
    resetRegionalAppliedCache(host);
    finishRegionalWithError(host, vegetationError);
    return;
  }
  // Geographic / filter scope only (not selected chart indices).
  ctx.requestKey = buildRegionalScopeKeyFor(
    geo.regionNum,
    geo.effectiveDistrictNum,
    crops.cropIds,
    startDate,
    endDate,
  );
  await fetchAndApplyRegionalScope(ctx, geo, crops, startDate, endDate);
};

export const fetchGraffRegionalTimeseries = async (host: GraffDataServiceHost): Promise<void> => {
  // Polygon mode owns vegetationData — never start (or apply) a regional
  // overwrite while a uniqueid is selected. Do NOT touch
  // loadingVegetation / _hasCompletedGraphFetch here: that used to mark the
  // graph "complete + empty" while fetchVegetationData was still in flight,
  // flashing "Ma'lumot topilmadi" even though the popup already had indices.
  if (host.state.selecteduniqueid) {
    graffLog("fetchRegionalTimeseries:SKIP-polygon-selected", {
      uniqueid: host.state.selecteduniqueid,
    });
    return;
  }
  if (host.state.viewMode !== "graph") return;

  // Show loader only when there is no previous series (Agrobank morph style).
  host.beginGraphFetch();

  const filterSnapshot = snapshotGraffRegionalFilters(host.state.regionalFilters);
  // Own this fetch immediately so overlapping calls invalidate each other
  // before the async region/district resolve — otherwise a later call can
  // be skipped as a "duplicate" of a request that then becomes stale and
  // leaves loadingVegetation stuck true.
  const requestId = ++host._regionalTimeseriesRequestId;
  host._regionalTimeseriesRequestKey = "";
  const isStale = createRegionalStaleCheck(host, requestId, filterSnapshot);

  // Never hit vegetation with an open date window — that used to become
  // `1=1` + 16 AVGs and saturate the FeatureServer on cold start.
  const yearToken = extractGraffYearToken(filterSnapshot.yil);
  if (!yearToken) {
    graffLog("fetchRegionalTimeseries:SKIP-no-year", { yil: filterSnapshot.yil, requestId });
    // Keep spinner until Localization broadcasts a year — do not flash empty.
    host.setState({ loadingVegetation: true, vegetationError: null });
    return;
  }

  const ctx: RegionalFetchContext = { host, filterSnapshot, yearToken, requestId, requestKey: "", isStale };
  try {
    await runRegionalFetch(ctx);
  } catch (err: unknown) {
    graffLog("fetchRegionalTimeseries:FAILED", { error: describeThrown(err) });
    if (isStale()) return;
    if (host._regionalTimeseriesRequestKey === ctx.requestKey) {
      host._regionalTimeseriesRequestKey = "";
    }
    host._regionalTimeseriesAppliedKey = "";
    host._regionalTimeseriesLoadedAvgFields.clear();
    finishRegionalWithError(host, thrownMessage(err) || "Вилоят вақт қатори юклана олмади.");
  }
};
