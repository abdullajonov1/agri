import type { GraffDataServiceHost } from "./regional-timeseries";
import { stripUniqueidBraces } from "../../../../data/agri-uniqueid-sql";
import { graffLog } from "../graff-log";
import { warmPolygonApiConnection, type VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import { buildGraffPolygonSeriesScopeKey } from "../../../../data/agri-graff-stats";
import { canConsumeGraffPolygonDashboardPack } from "../../../../data/agri-dashboard-pack-apply";
import { matchGraffPolygonDashboardPack } from "../../../../data/agri-dashboard-pack-match";
import { getDashboardPack } from "../../../../store/agri-dashboard-store";
import {
  type VegetationLoadContext,
  handleVegetationLoadError,
  kickEarlyOverlay,
  loadSeriesRows,
  paintPhase1,
  refinePhase2,
  startAvailableDatesAndWalk,
} from "./vegetation-data-steps";

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
    // Do NOT await /available-dates here. Stage-2 polygon Pack: match
    // panel-published series; controller never prefetches TIFF / uniqueid.
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

    const ctx: VegetationLoadContext = {
      host,
      isStale,
      selecteduniqueid,
      cleanId,
      regionId,
      year,
      polygonScopeKey,
      earlyIndexKey: (host.state.selectedIndices?.[0] ||
        "ndvi") as VegetationIndiceType,
      availableDatesAttempted,
    };

    const availableDatesPromise = startAvailableDatesAndWalk(ctx);
    kickEarlyOverlay(ctx, polygonPack, availableDatesPromise);

    const data = await loadSeriesRows(ctx, polygonPack);

    graffLog("fetchVegetationData:series-response", {
      uniqueid: cleanId,
      rowCount: data.length,
      usedPolygonPack,
      requestId,
    });

    if (isStale()) return;

    const painted = paintPhase1(ctx, data, polygonPack);
    if (!painted) return;

    // ── Phase 2: available-dates refine (non-blocking for first paint) ──
    if (!availableDatesAttempted || !availableDatesPromise) return;
    await refinePhase2(ctx, data, availableDatesPromise, painted);
  } catch (error: unknown) {
    handleVegetationLoadError(host, isStale, error);
  }
};
