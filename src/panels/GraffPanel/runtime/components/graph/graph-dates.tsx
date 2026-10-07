import type { GraffWidgetHost } from "../../graff-host";
import { graffLog } from "../../graff-log";
import { setVegetationOverlayContext } from "../../../../../gis/agri-vegetation-overlay-prefetch";
import type { VegetationIndiceType } from "../../../../../gis/agri-polygon-api-source";
import { formatArcgisDateToYmd } from "../../../../../gis/agri-vegetation-data-source";
import { VEGETATION_IMAGE_LAYER_ID } from "../../graff-raster-overlay";
import { INDEX_COLORS } from "./graph-view";
import type { ChartVegetationRow } from "../../graff-state";
import { describeThrown, eventDetail } from "../../graff-guards";
import { isPlainRecord } from "../../../../../shared/agri-plain-object";

/** Chart rows read by dynamic key (`ndvi`, `ndvi_min`, …). */
type ChartRowRecord = Record<string, unknown>;

/**
 * vegetationData rows are shaped differently depending on mode: a selected
 * polygon's own series uses `raster_date` (VegetationIndex), while the
 * regional (no-polygon-selected) timeseries normalizes it to `date`.
 */
const chartRowYmd = (
  host: GraffWidgetHost,
  row: ChartVegetationRow | null | undefined,
  advertised: string[],
): string | null => {
  const rec: ChartRowRecord | undefined = isPlainRecord(row) ? row : undefined;
  const rawDate = rec?.raster_date ?? rec?.date;
  if (!rawDate) return null;
  return (
    host.resolveAgainstAvailableDates(rawDate, advertised) ||
    formatArcgisDateToYmd(rawDate) ||
    null
  );
};

const findChartRowByYmd = (
  host: GraffWidgetHost,
  rows: ChartVegetationRow[] | null | undefined,
  advertised: string[],
  ymd: string,
): ChartRowRecord | undefined => {
  const found = (rows || []).find((r) => chartRowYmd(host, r, advertised) === ymd);
  return isPlainRecord(found) ? found : undefined;
};

/**
 * Tells the bottom-left map indicator (AgriDateIndexIndicator) which
 * date+index is currently selected on this chart, and its value — fired
 * from componentDidUpdate whenever selectedNdviDate/selectedChartIndexKey
 * change, for any reason (chart click, polygon switch/clear, deselect).
 */
export const broadcastDateIndexSelection = (host: GraffWidgetHost): void => {
  const {
    selectedNdviDate,
    selectedChartIndexKey,
    vegetationData,
    language,
    selecteduniqueid,
    polygonAvailableDates,
  } = host.state;

  const navigable = Boolean(selecteduniqueid);
  const availableDates = navigable
    ? host.getNavigableDateIndexDates()
    : [];

  if (!selectedNdviDate || !selectedChartIndexKey) {
    graffLog('chartPoint:indicator-broadcast-clear', {
      selectedNdviDate: selectedNdviDate || null,
      selectedChartIndexKey: selectedChartIndexKey || null,
    });
    document.dispatchEvent(
      new CustomEvent("graffDateIndexSelectionChanged", {
        detail: {
          date: null,
          indexKey: null,
          value: null,
          language,
          availableDates: [],
          navigable: false,
        },
        bubbles: true,
      }),
    );
    return;
  }

  setVegetationOverlayContext({
    regionId: host.resolveCurrentRegionId(),
    year: host.resolveCurrentYear(),
    lastDate: String(selectedNdviDate).trim(),
    lastIndex: selectedChartIndexKey as VegetationIndiceType,
  });

  // Match on raster_date OR date (see chartRowYmd) — checking only
  // raster_date showed "-" for dates clicked on the regional chart.
  const row = findChartRowByYmd(
    host,
    vegetationData,
    polygonAvailableDates || [],
    selectedNdviDate,
  );
  const rawValue = row ? Number(row[selectedChartIndexKey]) : NaN;

  graffLog('chartPoint:indicator-broadcast', {
    date: selectedNdviDate,
    indexKey: selectedChartIndexKey,
    value: Number.isFinite(rawValue) ? rawValue : null,
    rowFound: Boolean(row),
    vegetationRowCount: vegetationData?.length || 0,
    availableDatesCount: availableDates.length,
    navigable,
  });

  document.dispatchEvent(
    new CustomEvent("graffDateIndexSelectionChanged", {
      detail: {
        date: selectedNdviDate,
        indexKey: selectedChartIndexKey,
        value: Number.isFinite(rawValue) ? rawValue : null,
        language,
        availableDates,
        navigable,
      },
      bubbles: true,
    }),
  );
};
/**
 * Sorted unique YYYY-MM-DD dates from the selected polygon's chart series
 * (prefers advertised /available-dates when present).
 */
export const getNavigableDateIndexDates = (host: GraffWidgetHost): string[] => {
  const { vegetationData, polygonAvailableDates } = host.state;
  const advertised = polygonAvailableDates || [];
  const fromSeries = (vegetationData || [])
    .map((r) => chartRowYmd(host, r, advertised) || "")
    .filter(Boolean);
  const unique = Array.from(new Set(fromSeries));
  unique.sort((a, b) => a.localeCompare(b));
  return unique;
};
/**
 * Day-step from AgriDateIndexIndicator chevrons — select prev/next date
 * for the current polygon + index and refresh the raster overlay.
 */
export const handleDateIndexNavigate = (host: GraffWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const d = eventDetail<{ date?: unknown; direction?: unknown }>(event);
  const {
    selecteduniqueid,
    selectedNdviDate,
    selectedChartIndexKey,
    vegetationData,
  } = host.state;

  if (!selecteduniqueid || !selectedNdviDate || !selectedChartIndexKey) {
    return;
  }

  const dates = host.getNavigableDateIndexDates();
  if (dates.length < 2) return;

  let nextDate = d.date ? String(d.date).trim() : "";
  if (!nextDate || !dates.includes(nextDate)) {
    const direction = Number(d.direction) === -1 ? -1 : 1;
    const idx = dates.indexOf(selectedNdviDate);
    if (idx < 0) return;
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= dates.length) return;
    nextDate = dates[nextIdx];
  }

  if (nextDate === selectedNdviDate) return;

  const row = findChartRowByYmd(
    host,
    vegetationData,
    host.state.polygonAvailableDates || [],
    nextDate,
  );
  const rawValue = row ? Number(row[selectedChartIndexKey]) : NaN;

  graffLog("chartPoint:indicator-navigate", {
    uniqueid: selecteduniqueid,
    from: selectedNdviDate,
    to: nextDate,
    indexKey: selectedChartIndexKey,
    value: Number.isFinite(rawValue) ? rawValue : null,
  });

  host.setState({
    selectedNdviDate: nextDate,
    chartTooltip: null,
  });

  host.applyVegetationImageOverlay(
    selecteduniqueid,
    nextDate,
    selectedChartIndexKey,
  );
};
/** Drop map-surface + polygon-image loaders owned by a vegetation raster request. */
export const clearVegetationImageSurfaceLoading = (host: GraffWidgetHost, requestId: number): void => {
  if (requestId !== host._vegetationImageRequestId) return;
  if (host.state.polygonImageLoading) {
    host.setState({ polygonImageLoading: false });
  }
  document.dispatchEvent(
    new CustomEvent("agriMapSurfaceLoading", {
      detail: {
        loading: false,
        source: "AgriGraffWidget",
        requestId,
        reason: "vegetation-raster",
      },
    }),
  );
};
/** Show map-center spinner until the polygon index raster is on the map. */
export const beginVegetationImageSurfaceLoading = (host: GraffWidgetHost): void => {
  if (!host.state.polygonImageLoading) {
    host.setState({ polygonImageLoading: true, polygonImageError: null });
  }
  document.dispatchEvent(
    new CustomEvent("agriMapSurfaceLoading", {
      detail: {
        loading: true,
        source: "AgriGraffWidget",
        requestId: host._vegetationImageRequestId,
        reason: "vegetation-raster",
      },
    }),
  );
};
/**
 * Invalidate any in-flight export-image fetch, remove the overlay, and
 * always release the map loader. Use on deselect / polygon switch — not
 * inside applyVegetationImageOverlay while swapping the active layer.
 */
export const cancelVegetationImageOverlay = (host: GraffWidgetHost): void => {
  const requestId = ++host._vegetationImageRequestId;
  host.removeVegetationImageOverlay();
  host.setState({ polygonImageLoading: false, polygonImageError: null });
  document.dispatchEvent(
    new CustomEvent("agriMapSurfaceLoading", {
      detail: {
        loading: false,
        source: "AgriGraffWidget",
        requestId,
        reason: "vegetation-raster-cancel",
      },
    }),
  );
};
export const removeVegetationImageOverlay = (host: GraffWidgetHost): void => {
  host.detachVegetationRasterHover();
  host._vegetationRasterSample = null;

  const map = host.state.activeMapView?.view?.map;
  if (map) {
    try {
      if (host._vegetationImageLayer) {
        map.remove(host._vegetationImageLayer);
      }
      // Defensive sweep: remove any other/orphaned overlay(s) sharing our
      // fixed id, regardless of whether this instance still references them.
      const stray = (map.layers?.toArray?.() || []).filter(
        (l) => l?.id === VEGETATION_IMAGE_LAYER_ID,
      );
      for (const l of stray) {
        try {
          map.remove(l);
        } catch (err) {
          // Layer already removed by another instance — keep sweeping.
          graffLog("overlay:remove-stray-failed", { error: describeThrown(err) });
        }
      }
    } catch (err) {
      // Map torn down mid-remove; references are cleared below regardless.
      graffLog("overlay:remove-failed", { error: describeThrown(err) });
    }
  }
  host._vegetationImageLayer = null;
  host._vegetationOverlayAppliedKey = "";
  host._vegetationOverlayPendingKey = "";
};
export const getIndexDisplayColor = (host: GraffWidgetHost, indexKey?: string | null): string => {
  const key = String(indexKey || "ndvi").toLowerCase();
  return INDEX_COLORS[key] || "#00d084";
};
/**
 * Field index min/max for hover calibration: prefer export-image
 * `X-Index-*` headers, else the selected date's chart row (`ndvi_min`…).
 */
export const resolveHoverIndexRange = (host: GraffWidgetHost, indiceType: string, rasterDate: string, fromExport?: { indexMin: number | null; indexMax: number | null } | null): { indexMin: number | null; indexMax: number | null } => {
  const expMin = fromExport?.indexMin ?? null;
  const expMax = fromExport?.indexMax ?? null;
  if (
    expMin != null &&
    expMax != null &&
    Number.isFinite(expMin) &&
    Number.isFinite(expMax) &&
    expMax > expMin
  ) {
    return { indexMin: expMin, indexMax: expMax };
  }

  const key = String(indiceType || "ndvi")
    .trim()
    .toLowerCase();
  const advertised = host.state.polygonAvailableDates || [];
  const target =
    host.resolveAgainstAvailableDates(rasterDate, advertised) ||
    formatArcgisDateToYmd(rasterDate) ||
    String(rasterDate || "").trim();
  const row = findChartRowByYmd(host, host.state.vegetationData, advertised, target);
  if (!row) return { indexMin: null, indexMax: null };

  const min = Number(row[`${key}_min`]);
  const max = Number(row[`${key}_max`]);
  if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
    return { indexMin: min, indexMax: max };
  }
  return { indexMin: null, indexMax: null };
};
