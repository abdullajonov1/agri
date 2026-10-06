import type { AgriGraffWidgetState, ChartVegetationRow, VegetationIndex } from "../widget";
import { React } from "jimu-core";
import type { GraffPendingOverlayWalk } from "../graff-raster-overlay";
import type { VegetationIndiceType, PolygonExportImageResult } from "../../../../gis/agri-polygon-api-source";
import { graffLog } from "../graff-log";
import { snapshotGraffRegionalFilters, isGraffRegionalFilterSnapshotStale, extractGraffYearToken } from "../../../../data/agri-graff-date";
import { getTuriCropLookupKey } from "../../../../shared/agri-crop-labels";
import { buildGraffRegionalScopeKey, queryGraffRegionalTimeseriesMerged } from "../../../../data/agri-graff-stats";
import { type RepublicTimeseriesIndexField, isRepublicTimeseriesIndexField, REPUBLIC_TIMESERIES_INDEX_FIELDS } from "../graff-graph-constants";
import { VH_TO_NDVI_STATUS } from "../../../../filter/localization/vh-constants";
import { type RegionalTimeseriesRow, mergeRegionalTimeseriesFieldsIntoChart } from "../graff-timeseries-helpers";
import { canConsumeGraffDashboardPack } from "../../../../data/agri-dashboard-pack-apply";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../store/agri-dashboard-store";
import { matchGraffDashboardPack } from "../../../../data/agri-dashboard-pack-match";

export interface GraffDataServiceHost {
  state: AgriGraffWidgetState;
  setState: React.Component<any, AgriGraffWidgetState>["setState"];
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
  resolveAgainstAvailableDates: (rawDate: any, availableDates: string[]) => string | null;
}
export const fetchGraffRegionalTimeseries = async (host: GraffDataServiceHost) => {
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

  const { regionalFilters } = host.state;
  const filterSnapshot = snapshotGraffRegionalFilters(regionalFilters);
  // Own this fetch immediately so overlapping calls invalidate each other
  // before the async region/district resolve — otherwise a later call can
  // be skipped as a "duplicate" of a request that then becomes stale and
  // leaves loadingVegetation stuck true.
  const requestId = ++host._regionalTimeseriesRequestId;
  host._regionalTimeseriesRequestKey = "";
  let requestKey = "";
  const isStale = () => {
    if (!host._isMounted) return true;
    if (host.state.viewMode !== "graph") return true;
    if (requestId !== host._regionalTimeseriesRequestId) {
      return true;
    }
    if (host.state.selecteduniqueid) return true;
    return isGraffRegionalFilterSnapshotStale(
      filterSnapshot,
      host.state.regionalFilters,
    );
  };

  // Never hit vegetation with an open date window — that used to become
  // `1=1` + 16 AVGs and saturate the FeatureServer on cold start.
  const yearToken = extractGraffYearToken(filterSnapshot.yil);
  if (!yearToken) {
    graffLog("fetchRegionalTimeseries:SKIP-no-year", {
      yil: filterSnapshot.yil,
      requestId,
    });
    // Keep spinner until Localization broadcasts a year — do not flash empty.
    host.setState({
      loadingVegetation: true,
      vegetationError: null,
    });
    return;
  }

  try {
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
    const effectiveViloyat = host.normalizeApos(filterSnapshot.viloyat);
    const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
    const effectiveTuman = filterSnapshot.tuman
      ? host.normalizeApos(filterSnapshot.tuman)
      : "";
    const storedRegionCode =
      host.state.regionalRegionCode != null &&
      Number.isFinite(host.state.regionalRegionCode)
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
    const regionNum =
      mappedRegionFromName !== undefined &&
      Number.isFinite(mappedRegionFromName)
        ? mappedRegionFromName
        : storedRegionCode ?? undefined;
    const districtNum = effectiveTuman
      ? host.state.regionalDistrictCode != null &&
        Number.isFinite(host.state.regionalDistrictCode)
        ? host.state.regionalDistrictCode
        : host.resolveDistrictNumber(
            effectiveViloyat,
            effectiveTuman,
            regionNum,
          )
      : undefined;
    const effectiveDistrictNum =
      filterSnapshot.tuman &&
      districtNum !== undefined &&
      Number.isFinite(districtNum)
        ? districtNum
        : undefined;

    // Fail closed. Silently omitting an unresolved geographic code would
    // display a republic/viloyat average under a narrower selection.
    const unresolvedScope =
      effectiveViloyat &&
      (regionNum === undefined || !Number.isFinite(regionNum))
        ? "region"
        : effectiveTuman && effectiveDistrictNum === undefined
          ? "district"
          : null;
    if (unresolvedScope) {
      host._regionalTimeseriesRequestKey = "";
      host._regionalTimeseriesAppliedKey = "";
      host._regionalTimeseriesLoadedAvgFields.clear();
      const { language } = host.state;
      const vegetationError =
        language === "en"
          ? unresolvedScope === "region"
            ? "Could not determine the selected region code."
            : "Could not determine the selected district code."
          : language === "ru"
          ? unresolvedScope === "region"
            ? "Не удалось определить код выбранной области."
            : "Не удалось определить код выбранного района."
          : language === "uz_lat"
            ? unresolvedScope === "region"
              ? "Tanlangan viloyat kodi aniqlanmadi."
              : "Tanlangan tuman kodi aniqlanmadi."
            : unresolvedScope === "region"
              ? "Танланган вилоят коди аниқланмади."
              : "Танланган туман коди аниқланмади.";
      graffLog("fetchRegionalTimeseries:SKIP-unresolved-scope", {
        viloyat: filterSnapshot.viloyat,
        tuman: filterSnapshot.tuman,
        unresolvedScope,
        resolvedRegionNum: regionNum,
        resolvedDistrictNum: effectiveDistrictNum,
        requestId,
      });
      host._hasCompletedGraphFetch = true;
      host.setState({
        vegetationData: [],
        loadingVegetation: false,
        vegetationError,
      });
      return;
    }

    const startDate = `${yearToken}-01-01`;
    const endDate = `${yearToken}-12-31`;

    const snapshotTurlar: string[] = JSON.parse(filterSnapshot.turlar || "[]");
    const selectedTurlar = snapshotTurlar.length
      ? snapshotTurlar
      : filterSnapshot.turi
        ? [filterSnapshot.turi]
        : [];
    const resolvedCropIds = selectedTurlar.map((crop) =>
      host.resolveCropIdForTuri(crop),
    );
    const unresolvedCrops = selectedTurlar.filter(
      (_crop, index) => !resolvedCropIds[index],
    );
    if (unresolvedCrops.length) {
      const vegetationError =
        host.state.language === "en"
          ? "Could not determine the selected crop code."
          : host.state.language === "ru"
            ? "Не удалось определить код выбранной культуры."
            : host.state.language === "uz_cyr"
              ? "Танланган экин коди аниқланмади."
              : "Tanlangan ekin kodi aniqlanmadi.";
      host._regionalTimeseriesRequestKey = "";
      host._regionalTimeseriesAppliedKey = "";
      host._regionalTimeseriesLoadedAvgFields.clear();
      host._hasCompletedGraphFetch = true;
      host.setState({
        vegetationData: [],
        loadingVegetation: false,
        vegetationError,
      });
      return;
    }
    const cropIds = Array.from(
      new Set(resolvedCropIds.filter((value): value is string => Boolean(value))),
    );
    const cropId = cropIds.length === 1 ? cropIds[0] : undefined;
    const turiKey = filterSnapshot.turi
      ? getTuriCropLookupKey(filterSnapshot.turi)
      : "";

    // Geographic / filter scope only (not selected chart indices).
    requestKey = buildGraffRegionalScopeKey({
      region:
        regionNum !== undefined && Number.isFinite(regionNum)
          ? regionNum
          : null,
      district: effectiveDistrictNum ?? null,
      cropIds,
      startDate,
      endDate,
      vh: filterSnapshot.vh || "",
    });
    if (requestKey !== host._regionalTimeseriesAppliedKey) {
      // New geography/year/crop/VH — drop partial index cache for the old scope.
      host._regionalTimeseriesLoadedAvgFields.clear();
    }

    const isRepublicScope = !(
      regionNum !== undefined && Number.isFinite(regionNum)
    );
    const desiredRepublicFields: RepublicTimeseriesIndexField[] = Array.from(
      new Set(
        (host.state.selectedIndices || ["ndvi"])
          .map((key) => String(key).toLowerCase())
          .filter(isRepublicTimeseriesIndexField),
      ),
    );
    if (!desiredRepublicFields.length) {
      desiredRepublicFields.push("ndvi");
    }

    // Same resolved scope already showing — finish loading without refetch.
    // Republic: also require every currently selected index to be loaded
    // (SAVI/EVI toggles fetch only the missing columns).
    // Do NOT skip merely because another in-flight call shares this key:
    // that older call may still become stale and never clear the spinner.
    const republicFieldsReady =
      !isRepublicScope ||
      desiredRepublicFields.every((field) =>
        host._regionalTimeseriesLoadedAvgFields.has(field),
      );
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

    graffLog("fetchRegionalTimeseries:request", {
      viloyat: filterSnapshot.viloyat,
      tuman: filterSnapshot.tuman,
      yil: filterSnapshot.yil,
      turi: filterSnapshot.turi,
      vh: filterSnapshot.vh,
      resolvedRegionNum: regionNum,
      resolvedDistrictNum: effectiveDistrictNum,
      resolvedCropId: cropId,
      turiKeyFoundInMap: turiKey ? turiKey in host._turiToCropId : null,
      vilKeyFoundInMap: vilKey ? vilKey in host._viloyatToRegion : null,
      isRepublicScope,
      desiredRepublicFields,
      avgFields: avgFields || "full",
      canAugmentExisting,
      requestId,
    });
    const ndviStatus = VH_TO_NDVI_STATUS[filterSnapshot.vh] || undefined;

    // Shared DashboardPack hit — skip duplicate vegetation groupBy.
    // Republic pack is NDVI-only; use it only when no other index is needed.
    let data: RegionalTimeseriesRow[] | null = null;
    let usedDashboardPack = false;
    const republicNeedsMoreThanNdvi =
      isRepublicScope &&
      desiredRepublicFields.some((field) => field !== "ndvi");
    if (
      !republicNeedsMoreThanNdvi &&
      canConsumeGraffDashboardPack({
        hasVh: !!String(filterSnapshot.vh || "").trim(),
        selectedUniqueid: host.state.selecteduniqueid,
        canAugmentExisting,
      })
    ) {
      await waitForDashboardPackReady(2500);
      if (isStale()) return;
      const graffPack = matchGraffDashboardPack(getDashboardPack(), {
        scopeKey: requestKey,
        hasVh: !!String(filterSnapshot.vh || "").trim(),
        canAugmentExisting,
      });
      if (graffPack) {
        data = graffPack.rows as RegionalTimeseriesRow[];
        usedDashboardPack = true;
        graffLog("fetchRegionalTimeseries:pack-hit", {
          requestKey,
          rowCount: data.length,
          requestId,
          republicNdviOnly: isRepublicScope,
        });
      }
    }

    if (!data) {
      data = (await queryGraffRegionalTimeseriesMerged({
        region:
          regionNum !== undefined && Number.isFinite(regionNum)
            ? regionNum
            : undefined,
        district: effectiveDistrictNum,
        cropIds,
        startDate,
        endDate,
        ndviStatus,
        avgFields,
      })) as RegionalTimeseriesRow[];
    }

    const rawRowCount = data.length;
    const validNdviRows = data.filter((row) => Number.isFinite(Number(row.ndvi)));
    const ndviValues = validNdviRows.map((row) => Number(row.ndvi));
    const polygonCounts = validNdviRows.map(
      (row) => Number(row.polygon_count) || 0,
    );
    graffLog("fetchRegionalTimeseries:response", {
      rawRowCount,
      rowCount: data.length,
      duplicateDateRowsMerged: 0,
      usedDashboardPack,
      validNdviRowCount: validNdviRows.length,
      avgFields: avgFields || "full",
      ndviRange: ndviValues.length
        ? {
            min: Math.min(...ndviValues),
            max: Math.max(...ndviValues),
          }
        : null,
      polygonCountRange: polygonCounts.length
        ? {
            min: Math.min(...polygonCounts),
            max: Math.max(...polygonCounts),
          }
        : null,
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
    const sorted = data
      .slice()
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    // Republic pack / query may be NDVI-only; viloyat/tuman (or full query)
    // loads every index so legend toggles do not refetch.
    const fetchedFields = usedDashboardPack
      ? isRepublicScope
        ? (["ndvi"] as string[])
        : [...REPUBLIC_TIMESERIES_INDEX_FIELDS]
      : avgFields?.length
        ? avgFields
        : [...REPUBLIC_TIMESERIES_INDEX_FIELDS];
    const chartRows: ChartVegetationRow[] = canAugmentExisting
      ? mergeRegionalTimeseriesFieldsIntoChart(
          host.state.vegetationData,
          sorted,
          fetchedFields,
        )
      : sorted.map((row) => ({
          ...row,
          raster_date: row.date,
        }));
    host._regionalTimeseriesAppliedKey = requestKey;
    if (isRepublicScope) {
      // First scope paint: mark requested fields even when empty (no rows).
      // Augment: only mark when the server returned rows — empty augment
      // must remain retryable (do not permanently skip a missing index).
      if (!canAugmentExisting || sorted.length > 0) {
        fetchedFields.forEach((field) => {
          if (isRepublicTimeseriesIndexField(field)) {
            host._regionalTimeseriesLoadedAvgFields.add(field);
          }
        });
      }
    } else {
      REPUBLIC_TIMESERIES_INDEX_FIELDS.forEach((field) => {
        host._regionalTimeseriesLoadedAvgFields.add(field);
      });
    }
    host.applyGraphData(chartRows, {
      dateRangeStartIndex: null,
      dateRangeEndIndex: null,
    });
  } catch (err: any) {
    graffLog("fetchRegionalTimeseries:FAILED", {
      error: String(err?.message || err),
    });
    if (isStale()) return;
    if (host._regionalTimeseriesRequestKey === requestKey) {
      host._regionalTimeseriesRequestKey = "";
    }
    host._regionalTimeseriesAppliedKey = "";
    host._regionalTimeseriesLoadedAvgFields.clear();
    host._hasCompletedGraphFetch = true;
    host.setState({
      vegetationData: [],
      loadingVegetation: false,
      vegetationError: err?.message || "Вилоят вақт қатори юклана олмади.",
    });
  }
};
