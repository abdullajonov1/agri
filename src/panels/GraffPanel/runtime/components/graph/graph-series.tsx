import type { GraffWidgetHost } from "../../graff-host";
import { type VegetationIndiceType, fetchPolygonAvailableDates, getExportImageSeasonMonths, pickExportRasterDate } from "../../../../../gis/agri-polygon-api-source";
import { graffLog } from "../../graff-log";
import { stripUniqueidBraces } from "../../../../../data/agri-uniqueid-sql";
import type { VegetationIndex } from "../../widget";

/**
 * export-image refused a date (outside the crop's index season, or no
 * regional scene that day). Step back to the newest date it can serve.
 * Bounded per polygon so a sparse region cannot spin through every date.
 */
export const retryOverlayWithUsableDate = async (host: GraffWidgetHost, cleanId: string, regionId: number, refusedDate: string, indiceType: VegetationIndiceType): Promise<void> => {
  const attemptKey = `${cleanId}|${regionId}|${indiceType}`;
  // Regional scenes are sparse (several consecutive dates can be missing),
  // but the region+date gaps are cached, so later clicks skip them upfront.
  const attempts = host._inSeasonRetryAttempts.get(attemptKey) || 0;
  if (attempts >= 6) return;
  host._inSeasonRetryAttempts.set(attemptKey, attempts + 1);

  const year = host.resolveCurrentYear();
  let dates =
    host._polygonAvailableDatesUniqueid === cleanId
      ? host.state.polygonAvailableDates || []
      : [];
  if (!dates.length && year !== undefined) {
    try {
      dates = await fetchPolygonAvailableDates(cleanId, regionId, year);
    } catch {
      dates = [];
    }
  }
  if (!host._isMounted) return;
  if (dates.length) host.rememberRasterDateForUniqueid(cleanId, dates);

  const months = getExportImageSeasonMonths(
    cleanId,
    host.resolveCropIdForUniqueid(cleanId),
  );
  const nextDate = pickExportRasterDate(dates, {
    uniqueid: cleanId,
    cropId: host.resolveCropIdForUniqueid(cleanId),
    regionId,
    exclude: [refusedDate],
  });
  graffLog("applyVegetationImageOverlay:date-retry", {
    uniqueid: cleanId,
    regionId,
    refusedDate,
    months,
    attempt: attempts + 1,
    dateCount: dates.length,
    nextDate: nextDate || null,
  });
  if (!nextDate || nextDate === refusedDate) return;
  if (stripUniqueidBraces(host.state.selecteduniqueid) !== cleanId) return;
  void host.applyVegetationImageOverlay(cleanId, nextDate, indiceType);
};
/**
 * Sort polygon vegetation rows and pick the chart's selected date/index.
 * When `availableDates` is non-empty, stamp API-canonical YMD on each row.
 */
export const preparePolygonGraphSeries = (host: GraffWidgetHost, rows: VegetationIndex[], availableDates: string[]): {
    sorted: VegetationIndex[];
    nextDate: string | null;
    nextIndexKey: VegetationIndiceType | null;
    fingerprint: string;
  } => {
  const dates = availableDates || [];
  const sorted = rows
    .slice()
    .sort(
      (a, b) =>
        new Date(a.raster_date).getTime() - new Date(b.raster_date).getTime(),
    );
  if (!sorted.length) {
    return {
      sorted,
      nextDate: null,
      nextIndexKey: null,
      fingerprint: "",
    };
  }

  const lastRow = sorted[sorted.length - 1];
  const lastDateRaw =
    host.resolveAgainstAvailableDates(lastRow.raster_date, dates) ||
    host.formatLocalDateYmd(new Date(lastRow.raster_date)) ||
    String(lastRow.raster_date || "").slice(0, 10);
  // Prefer a date export-image will accept (crop season + known imagery).
  const cleanId = stripUniqueidBraces(host.state.selecteduniqueid);
  const cropId = host.resolveCropIdForUniqueid(cleanId);
  const regionId = host.resolveCurrentRegionId() ?? null;
  const datePool =
    dates.length > 0
      ? dates
      : sorted.map(
          (row) =>
            host.resolveAgainstAvailableDates(row.raster_date, dates) ||
            host.formatLocalDateYmd(new Date(row.raster_date)) ||
            String(row.raster_date || "").slice(0, 10),
        );
  const lastDate =
    pickExportRasterDate(datePool, {
      uniqueid: cleanId,
      cropId,
      regionId,
    }) || lastDateRaw;
  const indexKey = (host.state.selectedIndices?.[0] ||
    "ndvi") as VegetationIndiceType;

  // Prefer the date already chosen (chart click / NDVI chevrons), unless it
  // is outside the known crop season (would 400 on export-image).
  const existingDate = (host.state.selectedNdviDate || "").trim();
  const seasonMonths = getExportImageSeasonMonths(cleanId, cropId);
  const existingInSeason =
    !existingDate ||
    !seasonMonths.length ||
    seasonMonths.includes(Number(existingDate.slice(5, 7)));
  const dateStillAvailable =
    existingDate && existingInSeason
      ? sorted.some((row) => {
          const ymd =
            host.resolveAgainstAvailableDates(row.raster_date, dates) ||
            host.formatLocalDateYmd(new Date(row.raster_date)) ||
            String(row.raster_date || "").slice(0, 10);
          return ymd === existingDate;
        })
      : false;
  const nextDate = dateStillAvailable ? existingDate : lastDate || null;
  const existingIndexKey = host.state.selectedChartIndexKey;
  const selectedIndices = host.state.selectedIndices || [];
  const nextIndexKey = (nextDate
    ? existingIndexKey && selectedIndices.includes(existingIndexKey)
      ? existingIndexKey
      : indexKey
    : null) as VegetationIndiceType | null;

  const fingerprint = sorted
    .map(
      (row) =>
        host.resolveAgainstAvailableDates(row.raster_date, dates) ||
        host.formatLocalDateYmd(new Date(row.raster_date)) ||
        String(row.raster_date || "").slice(0, 10),
    )
    .join("|");

  return { sorted, nextDate, nextIndexKey, fingerprint };
};
export const handleIndexChange = (host: GraffWidgetHost, index: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi") => {
  if (!host.isRegionalInteractionEnabled()) return;

  host.setState(
    (prevState) => {
      const exists = prevState.selectedIndices.includes(index);
      if (exists) {
        const next = prevState.selectedIndices.filter((k) => k !== index);
        // Keep at least NDVI so chart is never empty
        return { selectedIndices: next.length > 0 ? next : ["ndvi"] };
      }
      return { selectedIndices: [...prevState.selectedIndices, index] };
    },
    () => {
      const {
        selecteduniqueid,
        selectedNdviDate,
        selectedIndices,
        selectedChartIndexKey,
        viewMode,
      } = host.state;
      // Republic regional chart: fetch any newly enabled index columns on demand.
      if (!selecteduniqueid && viewMode === "graph") {
        void host.fetchRegionalTimeseries();
      }
      if (!selecteduniqueid || !selectedNdviDate) return;
      // Overlay follows the chart-selected index. Only refresh when that
      // index was toggled off the series list (fall back to primary).
      if (
        selectedChartIndexKey &&
        selectedIndices.includes(selectedChartIndexKey)
      ) {
        return;
      }
      const nextKey = (selectedIndices[0] || "ndvi") as VegetationIndiceType;
      host.setState({ selectedChartIndexKey: nextKey });
      host.applyVegetationImageOverlay(
        selecteduniqueid,
        selectedNdviDate,
        nextKey,
      );
    },
  );
};
export const handleToggleAllIndices = (host: GraffWidgetHost) => {
  if (!host.isRegionalInteractionEnabled()) return;
  const allKeys: Array<"ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi"> = [
    "ndvi",
    "savi",
    "rvi",
    "ci",
    "evi",
    "ndwi",
  ];
  host.setState(
    (prev) => {
      const isAll = allKeys.every((k) => prev.selectedIndices.includes(k));
      return { selectedIndices: isAll ? ["ndvi"] : allKeys };
    },
    () => {
      if (!host.state.selecteduniqueid && host.state.viewMode === "graph") {
        void host.fetchRegionalTimeseries();
      }
    },
  );
};
export const localizeRuntimeMessage = (host: GraffWidgetHost, value: unknown): string => {
  const message = String(value ?? "");
  if (host.state.language !== "en" || !message) return message;
  if (message.includes("Майдонлар танланмаган")) return "No fields are selected. Select widget fields in Settings.";
  if (message.includes("Созланган қатламда") || message.includes("ишлатиладиган майдонлар йўқ")) return "The configured layer has no usable fields. Check the layer settings.";
  if (message.includes("Маълумот манбаи мавжуд эмас")) return "The data source is unavailable.";
  if (message.includes("Бошланғич маълумот")) return "Could not load the initial data.";
  if (message.includes("Қатлам мавжуд эмас")) return "The configured layer is unavailable.";
  if (message.includes("Күтүлмаган хатолик")) return "An unexpected error occurred.";
  if (message.includes("Объектни танлаш")) return "Could not select the feature.";
  if (message.includes("Вилоят вақт қатори")) return "Could not load the regional time series.";
  if (message.includes("Вегетация маълумоти")) return "Could not load vegetation data.";
  return message;
};
