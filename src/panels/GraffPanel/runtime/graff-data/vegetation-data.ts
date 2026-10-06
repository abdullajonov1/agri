import type { GraffDataServiceHost } from "./regional-timeseries";
import { stripUniqueidBraces } from "../../../../data/agri-uniqueid-sql";
import { graffLog } from "../graff-log";
import { describeThrown, thrownMessage } from "../graff-guards";
import { warmPolygonApiConnection, type VegetationIndiceType, fetchPolygonAvailableDates, type PolygonExportImageResult, resolveExportImageWithDateWalk, getExportImageSeasonMonths } from "../../../../gis/agri-polygon-api-source";
import { buildGraffPolygonSeriesScopeKey } from "../../../../data/agri-graff-stats";
import { canConsumeGraffPolygonDashboardPack } from "../../../../data/agri-dashboard-pack-apply";
import { matchGraffPolygonDashboardPack } from "../../../../data/agri-dashboard-pack-match";
import { getDashboardPack, patchDashboardPack } from "../../../../store/agri-dashboard-store";
import type { VegetationIndex } from "../widget";
import { getGraffPolygonSeriesCached } from "../../../../data/agri-stats-store";

export const fetchGraffVegetationData = async (host: GraffDataServiceHost) => {
  const { selecteduniqueid } = host.state;

  if (!selecteduniqueid) {
    host._hasCompletedGraphFetch = true;
    host.setState({
      vegetationError:
        "Полигон танланмаган. Аввал жадвалдаги қатор ёки харитадаги полигонни босинг.",
      loadingVegetation: false,
    });
    return;
  }

  const requestId = ++host._vegetationDataRequestId;
  // Invalidate any in-flight regional chart fetch so its later response
  // cannot clobber this polygon's available-dates-filtered series.
  host._regionalTimeseriesRequestId++;
  // Polygon series replaces regional data — never SKIP-already-applied
  // with stale regional keys after the polygon chart is cleared.
  host._regionalTimeseriesRequestKey = "";
  host._regionalTimeseriesAppliedKey = "";
  host._regionalTimeseriesLoadedAvgFields.clear();
  // Allow completion in table mode too — row selection must still auto-pick
  // the latest date and apply the polygon raster overlay. Switch-to-table
  // already bumps _vegetationDataRequestId to cancel in-flight work.
  const isStale = () =>
    !host._isMounted || requestId !== host._vegetationDataRequestId;

  try {
    host.beginGraphFetch();

    const cleanId = stripUniqueidBraces(selecteduniqueid);
    const regionId = host.resolveCurrentRegionId();
    const year = host.resolveCurrentYear();
    const availableDatesAttempted =
      regionId !== undefined && year !== undefined;
    graffLog("fetchVegetationData:request", {
      uniqueid: cleanId,
      regionId,
      year,
      progressive: true,
    });

    // Warm TLS/DNS while series loads so export-image is not cold.
    warmPolygonApiConnection();

    // ── Phase 1: ArcGIS series only — unblock Index chart ASAP ──────────
    // Do NOT await /available-dates here. That REST call used to gate the
    // whole loader even when FeatureServer rows were already in hand.
    // Stage-2 polygon Pack: match panel-published series; controller never
    // prefetches TIFF / uniqueid (outside DashboardFilterSlice).
    const polygonScopeKey = buildGraffPolygonSeriesScopeKey({
      uniqueid: cleanId,
      regionId: regionId ?? null,
      year: year ?? null,
    });
    const polygonPack =
      canConsumeGraffPolygonDashboardPack({ uniqueid: cleanId })
        ? matchGraffPolygonDashboardPack(getDashboardPack(), {
            scopeKey: polygonScopeKey,
            uniqueid: cleanId,
          })
        : null;
    const usedPolygonPack = !!polygonPack;

    const earlyIndexKey = (host.state.selectedIndices?.[0] ||
      "ndvi") as VegetationIndiceType;

    // Start available-dates immediately (parallel with series). As soon as
    // dates arrive, kick the TIFF overlay — do not wait for FeatureServer.
    let availableDatesPromise: Promise<string[]> | null = null;
    if (availableDatesAttempted) {
      availableDatesPromise = fetchPolygonAvailableDates(
        cleanId,
        regionId as number,
        year as number,
      ).catch((err: unknown) => {
        graffLog(
          "fetchVegetationData:available-dates-FAILED",
          {
            uniqueid: cleanId,
            error: describeThrown(err),
          },
        );
        return [] as string[];
      });
      // One shared walk — one export-image date at a time (sequential on
      // 400). Popup prefetch + this path share exportDateWalkInFlight.
      // Registered as the pending walk so series/pack overlay paths wait
      // for its verified date instead of probing their own.
      const walkPromise: Promise<{
        date: string;
        result?: PolygonExportImageResult;
      } | null> =
        availableDatesPromise
          .then(async (dates) => {
            if (isStale() || !dates.length || regionId === undefined) {
              return null;
            }
            const cropId = host.resolveCropIdForUniqueid(cleanId);
            host.rememberRasterDateForUniqueid(cleanId, dates);
            host._polygonAvailableDatesUniqueid = cleanId;
            host.setState({ polygonAvailableDates: dates });
            const hit = await resolveExportImageWithDateWalk({
              uniqueid: cleanId,
              regionId: regionId as number,
              year: year as number,
              cropId,
              dates,
              indiceType: earlyIndexKey,
            });
            if (!hit) return null;
            host.markOverlayDateVerified(cleanId, hit.date);
            host._latestRasterDateByUniqueid.set(cleanId, hit.date);
            graffLog(
              "fetchVegetationData:early-overlay-from-dates",
              {
                uniqueid: cleanId,
                rasterDate: hit.date,
                indiceType: earlyIndexKey,
                dateCount: dates.length,
                cropId,
                seasonMonths: getExportImageSeasonMonths(cleanId, cropId),
              },
            );
            return { date: hit.date, result: hit.result };
          })
          .catch((): {
            date: string;
            result?: PolygonExportImageResult;
          } | null => null)
          .finally(() => {
            if (host._pendingOverlayWalk?.uniqueid === cleanId) {
              host._pendingOverlayWalk = null;
            }
          });
      host._pendingOverlayWalk = { uniqueid: cleanId, promise: walkPromise };
      void walkPromise.then((hit) => {
        if (isStale() || !hit || !host.state.selecteduniqueid) return;
        void host.applyVegetationImageOverlay(
          host.state.selecteduniqueid,
          hit.date,
          earlyIndexKey,
          hit.result || null,
        );
      });
    }

    // Immediate paint only when we already know a servable date for this
    // polygon/region — otherwise the dates walk above owns export-image.
    const knownOverlayDate =
      host._latestRasterDateByUniqueid.get(cleanId) ||
      host.getCarriedOverlayDate(regionId, year);
    if (knownOverlayDate) {
      host.kickOptimisticVegetationOverlay(selecteduniqueid);
    } else if (!availableDatesAttempted) {
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

    const data = (polygonPack
      ? (polygonPack.rows as VegetationIndex[])
      : // FeatureServer rows are untyped attribute bags with the index fields.
        ((await getGraffPolygonSeriesCached(
          cleanId,
        )) as unknown as VegetationIndex[]));

    graffLog("fetchVegetationData:series-response", {
      uniqueid: cleanId,
      rowCount: data.length,
      usedPolygonPack,
      requestId,
    });

    if (isStale()) return;

    if (!data.length) {
      host.cancelVegetationImageOverlay();
      host.applyGraphData([], {
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
      });
      return;
    }

    // Publish / refresh panel-owned polygon slice for re-select / re-entry.
    patchDashboardPack({
      graffPolygon: {
        scopeKey: polygonScopeKey,
        uniqueid: cleanId,
        regionId: regionId ?? null,
        year: year ?? null,
        rows: data,
        availableDates: polygonPack?.availableDates,
      },
    });

    const firstPass = host.preparePolygonGraphSeries(data, []);
    let paintedDate = firstPass.nextDate;
    let paintedIndex = firstPass.nextIndexKey;
    let paintedFingerprint = firstPass.fingerprint;

    // Start overlay before chart setState so TIFF decode overlaps React paint.
    // Early dates/pack path above shares the same cache / skip-if-applied key.
    if (
      !isStale() &&
      paintedDate &&
      paintedIndex &&
      host.state.selecteduniqueid
    ) {
      void host.applyVegetationImageOverlay(
        host.state.selecteduniqueid,
        paintedDate,
        paintedIndex,
      );
    }

    host.applyGraphData(firstPass.sorted, {
      dateRangeStartIndex: null,
      dateRangeEndIndex: null,
      selectedNdviDate: firstPass.nextDate,
      selectedChartIndexKey: firstPass.nextIndexKey,
    });

    // ── Phase 2: available-dates refine (non-blocking for first paint) ──
    if (!availableDatesAttempted || !availableDatesPromise) return;

    let availableDates: string[] = [];
    let availableDatesFailed = false;
    try {
      availableDates = await availableDatesPromise;
      availableDatesFailed = availableDates.length === 0;
    } catch (err: unknown) {
      availableDatesFailed = true;
      graffLog(
        "fetchVegetationData:available-dates-FAILED",
        {
          uniqueid: cleanId,
          error: describeThrown(err),
        },
      );
      availableDates = [];
    }

    if (isStale()) return;

    host.setState({ polygonAvailableDates: availableDates });
    host._polygonAvailableDatesUniqueid = cleanId;
    host.rememberRasterDateForUniqueid(cleanId, availableDates);
    patchDashboardPack({
      graffPolygon: {
        scopeKey: polygonScopeKey,
        uniqueid: cleanId,
        regionId: regionId ?? null,
        year: year ?? null,
        rows: data,
        availableDates,
      },
    });

    // Empty/failed dates: keep Phase-1 ArcGIS series (never blank the chart).
    if (availableDatesFailed || !availableDates.length) {
      graffLog(
        "fetchVegetationData:KEEP-phase1-no-available-dates",
        {
          uniqueid: cleanId,
          availableDatesFailed,
          availableDatesCount: availableDates.length,
        },
      );
      return;
    }

    const availableDatesSet = new Set(availableDates);
    let scopedData = data
      .map((row) => {
        const matched = host.resolveAgainstAvailableDates(
          row.raster_date,
          availableDates,
        );
        if (!matched || !availableDatesSet.has(matched)) return null;
        return { ...row, raster_date: matched };
      })
      .filter((row): row is VegetationIndex => row != null);

    if (!scopedData.length) {
      graffLog(
        "fetchVegetationData:FALLBACK-unfiltered-arcgis",
        {
          uniqueid: cleanId,
          regionId,
          year,
          arcgisRowCount: data.length,
          availableDatesCount: availableDates.length,
        },
      );
      return;
    }

    const refined = host.preparePolygonGraphSeries(
      scopedData,
      availableDates,
    );

    patchDashboardPack({
      graffPolygon: {
        scopeKey: polygonScopeKey,
        uniqueid: cleanId,
        regionId: regionId ?? null,
        year: year ?? null,
        rows: scopedData,
        availableDates,
      },
    });

    // No material change — avoid chart remount / overlay re-fetch.
    if (
      refined.fingerprint === paintedFingerprint &&
      refined.nextDate === paintedDate &&
      refined.nextIndexKey === paintedIndex
    ) {
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
      refined.nextDate !== paintedDate ||
      refined.nextIndexKey !== paintedIndex;
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
  } catch (error: unknown) {
    if (isStale()) return;

    host._hasCompletedGraphFetch = true;
    host.setState({
      vegetationData: [],
      loadingVegetation: false,
      vegetationError: thrownMessage(error) || "Вегетация маълумоти юклана олмади",
      selectedNdviDate: null,
      selectedChartIndexKey: null,
    });
  }
};
