import type { GraffDataServiceHost } from "./regional-timeseries";
import { graffLog } from "../graff-log";
import { describeThrown, thrownMessage } from "../graff-guards";
import {
  type VegetationIndiceType,
  fetchPolygonAvailableDates,
  type PolygonExportImageResult,
  resolveExportImageWithDateWalk,
  getExportImageSeasonMonths,
} from "../../../../gis/agri-polygon-api-source";
import type { VegetationPolygonSeriesRow } from "../../../../gis/agri-vegetation-data-source";
import { patchDashboardPack } from "../../../../store/agri-dashboard-store";
import type { VegetationIndex } from "../widget";
import { getGraffPolygonSeriesCached } from "../../../../data/agri-stats-store";
import { hasActiveVegetationOverlay, releaseIdleSurfaceLoading } from "../graff-raster-overlay";

/** Everything the loader steps share for one polygon request. */
export interface VegetationLoadContext {
  host: GraffDataServiceHost;
  isStale: () => boolean;
  selecteduniqueid: string;
  cleanId: string;
  regionId: number | undefined;
  year: number | undefined;
  polygonScopeKey: string;
  earlyIndexKey: VegetationIndiceType;
  availableDatesAttempted: boolean;
}

export interface PolygonPackSlice {
  rows?: unknown[];
  availableDates?: string[];
}

export interface PaintedSeries {
  date: string | null;
  index: string | null;
  fingerprint: string;
}

interface WalkHit {
  date: string;
  result?: PolygonExportImageResult;
}

/**
 * FeatureServer rows are untyped attribute bags that carry the index fields;
 * this is the single place they are narrowed to the chart row shape.
 */
export const toVegetationIndexRows = (
  rows: readonly VegetationPolygonSeriesRow[],
): VegetationIndex[] => rows as readonly unknown[] as VegetationIndex[];

/** Keep rows whose date resolves onto an available date; rewrite to that date. */
export const scopeRowsToAvailableDates = (
  rows: readonly VegetationIndex[],
  availableDates: readonly string[],
  resolve: (rawDate: unknown, dates: string[]) => string | null | undefined,
): VegetationIndex[] => {
  const datesList = availableDates as string[];
  const availableSet = new Set(availableDates);
  return rows
    .map((row) => {
      const matched = resolve(row.raster_date, datesList);
      if (!matched || !availableSet.has(matched)) return null;
      return { ...row, raster_date: matched };
    })
    .filter((row): row is VegetationIndex => row != null);
};

/** True when the refined series would paint exactly what phase 1 painted. */
export const isRefineNoop = (
  refined: { fingerprint: string; nextDate: string | null; nextIndexKey: string | null },
  painted: PaintedSeries,
): boolean =>
  refined.fingerprint === painted.fingerprint &&
  refined.nextDate === painted.date &&
  refined.nextIndexKey === painted.index;

const publishPolygonSlice = (
  ctx: VegetationLoadContext,
  rows: VegetationIndex[],
  availableDates: string[] | undefined,
): void => {
  patchDashboardPack({
    graffPolygon: {
      scopeKey: ctx.polygonScopeKey,
      uniqueid: ctx.cleanId,
      regionId: ctx.regionId ?? null,
      year: ctx.year ?? null,
      rows,
      availableDates,
    },
  });
};

const logDatesFailed = (cleanId: string, err: unknown): void => {
  graffLog("fetchVegetationData:available-dates-FAILED", {
    uniqueid: cleanId,
    error: describeThrown(err),
  });
};

/** Dates -> sequential export-image walk, registered as the pending walk. */
const startDateWalk = (
  ctx: VegetationLoadContext,
  availableDatesPromise: Promise<string[]>,
): void => {
  const { host, isStale, cleanId, regionId, year, earlyIndexKey } = ctx;
  // One shared walk — one export-image date at a time (sequential on
  // 400). Popup prefetch + this path share exportDateWalkInFlight.
  // Registered as the pending walk so series/pack overlay paths wait
  // for its verified date instead of probing their own.
  const walkPromise: Promise<WalkHit | null> = availableDatesPromise
    .then(async (dates): Promise<WalkHit | null> => {
      if (isStale() || !dates.length || regionId === undefined) {
        return null;
      }
      const cropId = host.resolveCropIdForUniqueid(cleanId);
      host.rememberRasterDateForUniqueid(cleanId, dates);
      host._polygonAvailableDatesUniqueid = cleanId;
      host.setState({ polygonAvailableDates: dates });
      const hit = await resolveExportImageWithDateWalk({
        uniqueid: cleanId,
        regionId,
        year: year as number,
        cropId,
        dates,
        indiceType: earlyIndexKey,
      });
      if (!hit) return null;
      host.markOverlayDateVerified(cleanId, hit.date);
      host._latestRasterDateByUniqueid.set(cleanId, hit.date);
      graffLog("fetchVegetationData:early-overlay-from-dates", {
        uniqueid: cleanId,
        rasterDate: hit.date,
        indiceType: earlyIndexKey,
        dateCount: dates.length,
        cropId,
        seasonMonths: getExportImageSeasonMonths(cleanId, cropId),
      });
      return { date: hit.date, result: hit.result };
    })
    .catch((): WalkHit | null => null)
    .finally(() => {
      if (host._pendingOverlayWalk?.uniqueid === cleanId) {
        host._pendingOverlayWalk = null;
      }
    });
  host._pendingOverlayWalk = { uniqueid: cleanId, promise: walkPromise };
  void walkPromise.then((hit) => {
    if (isStale() || !host.state.selecteduniqueid) return;
    if (!hit) {
      releaseIdleSurfaceLoading(host);
      return;
    }
    // A day picked (or drawn) while the walk ran wins over the walk date.
    if (hasActiveVegetationOverlay(host)) return;
    void host.applyVegetationImageOverlay(
      host.state.selecteduniqueid,
      hit.date,
      earlyIndexKey,
      hit.result || null,
    );
  });
};

/**
 * Start available-dates immediately (parallel with series) and its date walk.
 * Returns null when region/year are unknown.
 */
export const startAvailableDatesAndWalk = (
  ctx: VegetationLoadContext,
): Promise<string[]> | null => {
  if (!ctx.availableDatesAttempted) return null;
  const availableDatesPromise = fetchPolygonAvailableDates(
    ctx.cleanId,
    ctx.regionId as number,
    ctx.year as number,
  ).catch((err: unknown) => {
    logDatesFailed(ctx.cleanId, err);
    return [] as string[];
  });
  startDateWalk(ctx, availableDatesPromise);
  return availableDatesPromise;
};

/** Early overlay: immediate paint for a known date, plus pack-driven TIFF start. */
export const kickEarlyOverlay = (
  ctx: VegetationLoadContext,
  polygonPack: PolygonPackSlice | null,
  availableDatesPromise: Promise<string[]> | null,
): void => {
  const { host, cleanId, regionId, year, selecteduniqueid } = ctx;
  // Immediate paint only when we already know a servable date for this
  // polygon/region — otherwise the dates walk owns export-image.
  const knownOverlayDate =
    host._latestRasterDateByUniqueid.get(cleanId) ||
    host.getCarriedOverlayDate(regionId, year);
  if (knownOverlayDate || !ctx.availableDatesAttempted) {
    host.kickOptimisticVegetationOverlay(selecteduniqueid);
  } else {
    host.beginVegetationImageSurfaceLoading();
  }

  // If pack rows are already in memory, start TIFF download immediately
  // (before any React chart paint) — overlaps with prepare/applyGraphData.
  if (polygonPack?.rows?.length && regionId !== undefined) {
    const packDates = polygonPack.availableDates || [];
    if (packDates.length) {
      host._polygonAvailableDatesUniqueid = cleanId;
      host.setState({ polygonAvailableDates: packDates });
    }
    const early = host.preparePolygonGraphSeries(
      polygonPack.rows as VegetationIndex[],
      packDates,
    );
    if (early.nextDate && early.nextIndexKey) {
      void host.applyVegetationImageOverlay(
        selecteduniqueid,
        early.nextDate,
        early.nextIndexKey,
      );
    }
  } else if (!availableDatesPromise) {
    // Drop previous polygon's advertised dates so overlay is not SKIP'd.
    host._polygonAvailableDatesUniqueid = "";
  }
};

/** Pack rows when matched, otherwise the cached FeatureServer series. */
export const loadSeriesRows = async (
  ctx: VegetationLoadContext,
  polygonPack: PolygonPackSlice | null,
): Promise<VegetationIndex[]> =>
  polygonPack
    ? (polygonPack.rows as VegetationIndex[])
    : toVegetationIndexRows(await getGraffPolygonSeriesCached(ctx.cleanId));

/**
 * Phase 1: publish pack slice, start overlay, paint the chart.
 * Returns null when there are no rows (chart and overlay are cleared).
 */
export const paintPhase1 = (
  ctx: VegetationLoadContext,
  data: VegetationIndex[],
  polygonPack: PolygonPackSlice | null,
): PaintedSeries | null => {
  const { host, isStale } = ctx;
  if (!data.length) {
    host.cancelVegetationImageOverlay();
    host.applyGraphData([], {
      selectedNdviDate: null,
      selectedChartIndexKey: null,
      polygonAvailableDates: [],
    });
    return null;
  }

  // Publish / refresh panel-owned polygon slice for re-select / re-entry.
  publishPolygonSlice(ctx, data, polygonPack?.availableDates);

  const firstPass = host.preparePolygonGraphSeries(data, []);
  const painted: PaintedSeries = {
    date: firstPass.nextDate,
    index: firstPass.nextIndexKey,
    fingerprint: firstPass.fingerprint,
  };

  // Start overlay before chart setState so TIFF decode overlaps React paint.
  // Early dates/pack path shares the same cache / skip-if-applied key.
  if (
    !isStale() &&
    painted.date &&
    painted.index &&
    host.state.selecteduniqueid
  ) {
    void host.applyVegetationImageOverlay(
      host.state.selecteduniqueid,
      painted.date,
      painted.index as VegetationIndiceType,
    );
  }

  host.applyGraphData(firstPass.sorted, {
    dateRangeStartIndex: null,
    dateRangeEndIndex: null,
    selectedNdviDate: firstPass.nextDate,
    selectedChartIndexKey: firstPass.nextIndexKey,
  });
  return painted;
};

/** Phase 2: refine the painted series against available dates. */
export const refinePhase2 = async (
  ctx: VegetationLoadContext,
  data: VegetationIndex[],
  availableDatesPromise: Promise<string[]>,
  painted: PaintedSeries,
): Promise<void> => {
  const { host, isStale, cleanId, regionId, year } = ctx;

  let availableDates: string[] = [];
  let availableDatesFailed = false;
  try {
    availableDates = await availableDatesPromise;
    availableDatesFailed = availableDates.length === 0;
  } catch (err: unknown) {
    availableDatesFailed = true;
    logDatesFailed(cleanId, err);
    availableDates = [];
  }

  if (isStale()) return;

  host.setState({ polygonAvailableDates: availableDates });
  host._polygonAvailableDatesUniqueid = cleanId;
  host.rememberRasterDateForUniqueid(cleanId, availableDates);
  publishPolygonSlice(ctx, data, availableDates);

  // Empty/failed dates: keep Phase-1 ArcGIS series (never blank the chart).
  if (availableDatesFailed || !availableDates.length) {
    graffLog("fetchVegetationData:KEEP-phase1-no-available-dates", {
      uniqueid: cleanId,
      availableDatesFailed,
      availableDatesCount: availableDates.length,
    });
    return;
  }

  const scopedData = scopeRowsToAvailableDates(
    data,
    availableDates,
    (rawDate, dates) => host.resolveAgainstAvailableDates(rawDate, dates),
  );

  if (!scopedData.length) {
    graffLog("fetchVegetationData:FALLBACK-unfiltered-arcgis", {
      uniqueid: cleanId,
      regionId,
      year,
      arcgisRowCount: data.length,
      availableDatesCount: availableDates.length,
    });
    return;
  }

  const refined = host.preparePolygonGraphSeries(scopedData, availableDates);

  publishPolygonSlice(ctx, scopedData, availableDates);

  // No material change — avoid chart remount / overlay re-fetch.
  if (isRefineNoop(refined, painted)) {
    graffLog("fetchVegetationData:refine-noop", {
      uniqueid: cleanId,
      rowCount: refined.sorted.length,
    });
    return;
  }

  host.applyGraphData(
    refined.sorted,
    {
      dateRangeStartIndex: null,
      dateRangeEndIndex: null,
      polygonAvailableDates: availableDates,
      selectedNdviDate: refined.nextDate,
      selectedChartIndexKey: refined.nextIndexKey,
    },
    { animate: false },
  );

  const dateOrIndexChanged =
    refined.nextDate !== painted.date ||
    refined.nextIndexKey !== painted.index;
  if (
    !isStale() &&
    dateOrIndexChanged &&
    refined.nextDate &&
    refined.nextIndexKey &&
    host.state.selecteduniqueid
  ) {
    void host.applyVegetationImageOverlay(
      host.state.selecteduniqueid,
      refined.nextDate,
      refined.nextIndexKey,
    );
  }

  graffLog("fetchVegetationData:refined", {
    uniqueid: cleanId,
    phase1Rows: data.length,
    refinedRows: refined.sorted.length,
    nextDate: refined.nextDate,
    dateOrIndexChanged,
  });
};

/** Error path: ignored when stale, otherwise surfaces the failure in state. */
export const handleVegetationLoadError = (
  host: GraffDataServiceHost,
  isStale: () => boolean,
  error: unknown,
): void => {
  if (isStale()) return;

  host._hasCompletedGraphFetch = true;
  host.setState({
    vegetationData: [],
    loadingVegetation: false,
    vegetationError: thrownMessage(error) || "Вегетация маълумоти юклана олмади",
    selectedNdviDate: null,
    selectedChartIndexKey: null,
  });
};
