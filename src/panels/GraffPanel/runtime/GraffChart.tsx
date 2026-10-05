/**
 * Graff vegetation chart renderer, moved verbatim out of AgriGraffWidget.
 * `host` is the widget instance: state, setState, geometry cache and the
 * overlay/fetch methods stay owned by the widget.
 */
import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { TriangleAlert } from "lucide-react";
import AgriChartLoader from "../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../shared/agriNoDataLabel";
import { formatGraffRangeDate } from "../../../data/agri-graff-date";
import {
  type PolygonExportImageResult,
  type VegetationIndiceType,
} from "../../../gis/agri-polygon-api-source";
import {
  GRAFF_INDEX_BUTTONS,
  GRAFF_INDEX_ORDER,
} from "./graff-graph-constants";
import {
  buildGraffSmoothPath,
  resolveDefaultDateRangeIndices,
} from "./graff-timeseries-helpers";
import { graffLog } from "./graff-log";
import type { AgriGraffWidgetState } from "./widget";

export type GraffChartGeometryCache = {
  minMaxAreaPath: string;
  lineSeries: Array<{
    key: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi";
    color: string;
    path: string;
    areaPath: string;
    points: Array<{
      x: number;
      y: number;
      value: number;
      date: Date;
      min?: number;
      max?: number;
      sourceIndex: number;
    }>;
  }>;
  yAxisTickValues: number[];
};

/** Widget members the chart reads or calls. */
export interface GraffGraphHost {
  state: AgriGraffWidgetState;
  setState: React.Component<any, AgriGraffWidgetState>["setState"];
  _chartGeometryCacheKey: string;
  _chartGeometryCache: GraffChartGeometryCache | null;
  _hasCompletedGraphFetch: boolean;
  _vegetationImageLayer: __esri.MediaLayer | null;
  graphContainerRef: React.RefObject<HTMLDivElement>;
  graphSvgWrapRef: React.RefObject<HTMLDivElement>;
  fetchVegetationData: () => Promise<void>;
  fetchRegionalTimeseries: () => Promise<void>;
  applyVegetationImageOverlay: (
    uniqueid: string,
    rasterDate: string,
    indiceType?: VegetationIndiceType,
    prefetched?: PolygonExportImageResult | null,
  ) => Promise<void>;
  cancelVegetationImageOverlay: () => void;
  formatLocalDateYmd: (dt: Date) => string;
  resolveAgainstAvailableDates: (
    rawDate: any,
    availableDates: string[],
  ) => string | null;
  localizeRuntimeMessage: (value: unknown) => string;
  renderGraphHeader: () => React.ReactNode;
  wrapGraphFrame: (
    body: React.ReactNode,
    options?: { refreshLoading?: boolean },
  ) => React.ReactElement;
}

export const renderGraffGraph = (host: GraffGraphHost) => {
  const {
    vegetationData,
    loadingVegetation,
    vegetationError,
    selectedIndices,
    selecteduniqueid,
    chartTooltip,
    selectedNdviDate,
    selectedMonth,
    dateRangeStartIndex,
    dateRangeEndIndex,
    language,
  } = host.state;

  const allMonthsLabel =
    language === "en" ? "All months" : language === "ru"
      ? "Все месяцы"
      : language === "uz_lat"
        ? "Barcha oylar"
        : "Барча ойлар";

  const hasGraphData = !!(vegetationData && vegetationData.length > 0);
  const awaitingFirstGraphData = !host._hasCompletedGraphFetch;
  // Loader only on cold start — keep previous series while refetching (Agrobank morph).
  const showBlockingLoader =
    !hasGraphData && (loadingVegetation || awaitingFirstGraphData);
  // Empty state only after a real fetch returned zero rows.
  const showNoData =
    !loadingVegetation && host._hasCompletedGraphFetch && !hasGraphData;

  if (showBlockingLoader) {
    return host.wrapGraphFrame(
      <div className="kadastr-status-loading-container">
        <AgriChartLoader />
      </div>,
    );
  }

  if (vegetationError) {
    const onRetry = selecteduniqueid
      ? host.fetchVegetationData
      : host.fetchRegionalTimeseries;
    return host.wrapGraphFrame(
      <div className="kadastr-status-error">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <h3>
          {language === "en" ? "Could not load data" : language === "ru"
            ? "Не удалось загрузить данные"
            : language === "uz_lat"
              ? "Maʼlumot yuklanmadi"
              : "Маълумот юклана олмади"}
        </h3>
        <p>{host.localizeRuntimeMessage(vegetationError)}</p>
        <button onClick={onRetry} className="kadastr-status-retry-button">
          {language === "en" ? "Retry" : language === "ru"
            ? "Повторить"
            : language === "uz_lat"
              ? "Qayta urinib ko‘rish"
              : "Qayta urinish"}
        </button>
      </div>,
    );
  }

  if (showNoData) {
    return host.wrapGraphFrame(
      <div className="kadastr-status-no-data">
        <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <h3>{agriNoDataLabel(language)}</h3>
      </div>,
    );
  }

  const indexButtons = GRAFF_INDEX_BUTTONS;

  const indexOrder = GRAFF_INDEX_ORDER;
  const activeIndices = indexOrder.filter((idx) =>
    selectedIndices.includes(idx),
  );
  const finalIndices: Array<"ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi"> =
    activeIndices.length > 0 ? activeIndices : ["ndvi"];
  const primaryIndex = finalIndices[0];
  const isMultiIndexMode = finalIndices.length > 1;
  const indexColorMap = indexButtons.reduce(
    (acc, item) => {
      acc[item.key] = item.color;
      return acc;
    },
    {} as Record<"ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi", string>,
  );

  // Calculate SVG dimensions from live container size
  const graphWidth = Math.max(host.state.graphViewportWidth, 120);
  const graphHeight = Math.max(host.state.graphViewportHeight, 120);
  const isNarrow = graphWidth < 640;
  const compactChart = graphWidth < 720;
  const isIpadLayout =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    (window.matchMedia(
      "(min-width: 1080px) and (max-width: 1400px) and (min-height: 780px) and (max-aspect-ratio: 3/2)",
    ).matches ||
      window.matchMedia(
        "(min-width: 1080px) and (max-width: 1400px) and (max-height: 910px) and (min-height: 500px)",
      ).matches ||
      window.matchMedia(
        "(min-width: 1024px) and (max-width: 1400px) and (min-height: 760px) and (max-height: 1100px)",
      ).matches ||
      // iPadOS Safari (incl. “Request Desktop Website”) often reports odd sizes
      (/iPad|Macintosh/.test(navigator.userAgent) &&
        navigator.maxTouchPoints > 1));
  const axisTickFont = 10;
  const axisTitleFont = 10;
  const monthTickFont = 10;
  const tooltipFont = 10;
  // Short viewports scale the SVG down — keep strokes readable on iPad band.
  // Safari often fails stroke-dash draw anim → line stays at offset 100 (invisible).
  const lineStrokeWidth = isIpadLayout ? 3.8 : 2.85;
  const lineGlowStrokeWidth = isIpadLayout ? 3.8 : 5.2;
  const padding = {
    top: compactChart ? 8 : 12,
    right: compactChart ? 6 : 8,
    bottom: compactChart ? 32 : 36,
    left: compactChart ? 50 : 56,
  };
  const chartWidth = graphWidth - padding.left - padding.right;
  const chartHeight = graphHeight - padding.top - padding.bottom;
  const monthTickY = padding.top + chartHeight + (isNarrow ? 16 : 17);

  const monthNamesFull =
    language === "en"
      ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      : language === "ru"
      ? [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ]
      : language === "uz_lat"
        ? [
            "Yanvar",
            "Fevral",
            "Mart",
            "Aprel",
            "May",
            "Iyun",
            "Iyul",
            "Avgust",
            "Sentabr",
            "Oktabr",
            "Noyabr",
            "Dekabr",
          ]
        : [
            "Январ",
            "Феврал",
            "Март",
            "Апрел",
            "Май",
            "Июн",
            "Июл",
            "Август",
            "Сентябр",
            "Октябр",
            "Ноябр",
            "Декабр",
          ];

  const availableMonthIndices: number[] = Array.from(
    new Set(
      vegetationData
        .map((row) => new Date(row.raster_date))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.getMonth()),
    ),
  ).sort((a, b) => a - b);

  const sortedRowsBase = [...vegetationData].sort(
    (a, b) =>
      new Date(a.raster_date).getTime() - new Date(b.raster_date).getTime(),
  );
  const lastRangeIndex = Math.max(sortedRowsBase.length - 1, 0);
  const defaultRange = resolveDefaultDateRangeIndices(sortedRowsBase);
  const effectiveRangeStart = Math.min(
    Math.max(dateRangeStartIndex ?? defaultRange.startIndex, 0),
    lastRangeIndex,
  );
  const effectiveRangeEnd = Math.max(
    effectiveRangeStart,
    Math.min(dateRangeEndIndex ?? defaultRange.endIndex, lastRangeIndex),
  );
  const sortedRows = sortedRowsBase.slice(
    effectiveRangeStart,
    effectiveRangeEnd + 1,
  );
  const rangeStartDate = sortedRowsBase[effectiveRangeStart]?.raster_date;
  const rangeEndDate = sortedRowsBase[effectiveRangeEnd]?.raster_date;
  const rangeStartPercent = lastRangeIndex
    ? (effectiveRangeStart / lastRangeIndex) * 100
    : 0;
  const rangeEndPercent = lastRangeIndex
    ? (effectiveRangeEnd / lastRangeIndex) * 100
    : 100;
  const formatRangeDate = formatGraffRangeDate;

  const seriesByIndex = finalIndices.reduce(
    (acc, idx) => {
      acc[idx] = sortedRows
        .map((row, rowIndex) => {
          const raw = row as any;
          const value = raw[idx] == null ? Number.NaN : Number(raw[idx]);
          const minRaw = raw[`${idx}_min`];
          const maxRaw = raw[`${idx}_max`];
          return {
            date: new Date(row.raster_date),
            value,
            sourceIndex: rowIndex,
            min:
              minRaw == null || Number.isNaN(Number(minRaw))
                ? undefined
                : Number(minRaw),
            max:
              maxRaw == null || Number.isNaN(Number(maxRaw))
                ? undefined
                : Number(maxRaw),
          };
        })
        .filter(
          (point) =>
            !Number.isNaN(point.date.getTime()) &&
            Number.isFinite(point.value),
        )
        .map((point, sourceIndex) => ({ ...point, sourceIndex }));
      return acc;
    },
    {} as Record<
      "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi",
      Array<{
        date: Date;
        value: number;
        sourceIndex: number;
        min?: number;
        max?: number;
      }>
    >,
  );

  const dataPoints = seriesByIndex[primaryIndex] || [];

  // Find min/max values across selected indicators for comparison scale
  const allSeriesPoints = finalIndices.flatMap((idx) => seriesByIndex[idx]);
  const values = allSeriesPoints
    .map((d) => d.value)
    .filter((v) => Number.isFinite(v));
  const allMaxs = allSeriesPoints
    .map((d) => d.max)
    .filter((v): v is number => v != null && Number.isFinite(v));

  if (values.length === 0 || dataPoints.length === 0) {
    return (
      <div className="kadastr-status-no-data">
        <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
        <h3>{agriNoDataLabel(language)}</h3>
      </div>
    );
  }

  const rawMaxValue = Math.max(...values, ...allMaxs);
  // Y scale always starts at 0 (product rule) — never auto-zoom to series min
  // and never dip below 0 even when an index has negative samples.
  const topPadding = Math.max(rawMaxValue * 0.06, 0.02);
  const axisMinValue = 0;
  const axisMaxValue = Math.max(rawMaxValue + topPadding, axisMinValue + 0.01);
  const axisRange = Math.max(axisMaxValue - axisMinValue, 0.001);

  // Scale functions
  const minDate = dataPoints[0].date.getTime();
  const maxDate = dataPoints[dataPoints.length - 1].date.getTime();
  const dateRange = Math.max(maxDate - minDate, 1);
  const innerPaddingX = 8;
  const rawXScale = (date: Date) => {
    return (
      padding.left +
      innerPaddingX +
      ((date.getTime() - minDate) / dateRange) * (chartWidth - innerPaddingX * 2)
    );
  };
  const xScale = (date: Date, sourceIndex?: number) => {
    if (
      sourceIndex == null ||
      dataPoints.length < 3 ||
      sourceIndex < 0 ||
      sourceIndex >= dataPoints.length
    ) {
      return rawXScale(date);
    }

    const uniformX =
      padding.left +
      innerPaddingX +
      (sourceIndex / Math.max(dataPoints.length - 1, 1)) *
        (chartWidth - innerPaddingX * 2);
    const rawX = rawXScale(date);

    // Blend date-based spacing with uniform spacing so dense points spread out visually.
    return rawX * 0.25 + uniformX * 0.75;
  };

  const yScale = (value: number) => {
    return (
      padding.top +
      chartHeight -
      ((value - axisMinValue) / axisRange) * chartHeight
    );
  };

  const geometryCacheKey = [
    vegetationData?.length ?? 0,
    dataPoints[0]?.date?.getTime?.() ?? 0,
    dataPoints[dataPoints.length - 1]?.date?.getTime?.() ?? 0,
    finalIndices.join(","),
    graphWidth,
    graphHeight,
    selectedMonth ?? "",
    dateRangeStartIndex,
    dateRangeEndIndex,
    Math.round(axisMaxValue * 1000),
  ].join("|");

  let yAxisTickValues: number[];
  let minMaxAreaPath: string;
  let lineSeries: NonNullable<typeof host._chartGeometryCache>["lineSeries"];

  if (
    host._chartGeometryCacheKey === geometryCacheKey &&
    host._chartGeometryCache
  ) {
    ({ yAxisTickValues, minMaxAreaPath, lineSeries } =
      host._chartGeometryCache);
  } else {
    yAxisTickValues = (() => {
      const steps = 4;
      const ticks: number[] = [];
      for (let i = 0; i <= steps; i++) {
        ticks.push(axisMinValue + (axisRange * i) / steps);
      }
      return ticks;
    })();

    minMaxAreaPath = (() => {
      if (dataPoints.length === 0) return "";

      const valid = dataPoints.filter((d) => d.min != null && d.max != null);
      if (valid.length < 2) return "";

      const top = valid
        .map((d, index) => {
          const x = xScale(d.date, d.sourceIndex);
          const y = yScale(d.max as number);
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(" ");

      const bottom = valid
        .slice()
        .reverse()
        .map((d) => {
          const x = xScale(d.date, d.sourceIndex);
          const y = yScale(d.min as number);
          return `L ${x} ${y}`;
        })
        .join(" ");

      return `${top} ${bottom} Z`;
    })();

    lineSeries = finalIndices.map((idx) => {
      const points = (seriesByIndex[idx] || []).map((d) => ({
        x: xScale(d.date, d.sourceIndex),
        y: yScale(d.value),
        value: d.value,
        date: d.date,
        min: d.min,
        max: d.max,
        sourceIndex: d.sourceIndex,
      }));

      const baselineY = padding.top + chartHeight;
      const areaPath =
        points.length < 2
          ? ""
          : `${buildGraffSmoothPath(points)} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

      return {
        key: idx,
        color: indexColorMap[idx],
        points,
        path: buildGraffSmoothPath(points),
        areaPath,
      };
    });

    host._chartGeometryCacheKey = geometryCacheKey;
    host._chartGeometryCache = { yAxisTickValues, minMaxAreaPath, lineSeries };
  }

  // Persistent guide for the chart-selected date (survives mouse leave).
  const selectionGuide = (() => {
    if (!selectedNdviDate) return null;
    const indexKey = (host.state.selectedChartIndexKey ||
      primaryIndex) as
      | "ndvi"
      | "savi"
      | "rvi"
      | "ci"
      | "evi"
      | "ndwi";
    const series = seriesByIndex[indexKey] || [];
    const advertised = host.state.polygonAvailableDates || [];
    for (const p of series) {
      const ymd =
        host.resolveAgainstAvailableDates(p.date, advertised) ||
        host.formatLocalDateYmd(p.date);
      if (ymd !== selectedNdviDate) continue;
      return {
        indexKey,
        point: {
          date: p.date,
          value: p.value,
          min: p.min,
          max: p.max,
          sourceIndex: p.sourceIndex,
        },
      };
    }
    return null;
  })();

  const isSameGuidePoint = (
    a: typeof selectionGuide,
    b: typeof chartTooltip,
  ): boolean => {
    if (!a || !b) return false;
    if (a.indexKey !== b.indexKey) return false;
    const aIdx = a.point.sourceIndex;
    const bIdx = b.point.sourceIndex;
    if (aIdx != null && bIdx != null) return aIdx === bIdx;
    return a.point.date.getTime() === b.point.date.getTime();
  };

  // Sticky selection line always stays; hover adds a second line only when
  // the cursor is over a different point.
  const hoverGuide =
    chartTooltip && !isSameGuidePoint(selectionGuide, chartTooltip)
      ? chartTooltip
      : null;

  // Month labels for x-axis
  const monthLabels =
    language === "en"
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      : language === "ru"
      ? [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Ноя",
          "Дек",
        ]
      : language === "uz_lat"
        ? [
            "Yan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Iyun",
            "Iyul",
            "Avg",
            "Sen",
            "Okt",
            "Noy",
            "Dek",
          ]
        : [
            "Янв",
            "Фев",
            "Мар",
            "Апр",
            "Май",
            "Июн",
            "Июл",
            "Авг",
            "Сен",
            "Окт",
            "Ноя",
            "Дек",
          ];

  const visibleRangeMs = Math.max(
    dataPoints[dataPoints.length - 1].date.getTime() -
      dataPoints[0].date.getTime(),
    0,
  );
  const showDailyDateTicks = visibleRangeMs <= 31 * 24 * 60 * 60 * 1000;

  // For a one-month (or shorter) range show every observation date;
  // otherwise keep the compact one-label-per-month axis.
  const monthTickPoints = (() => {
    if (dataPoints.length === 0) return [];
    if (showDailyDateTicks) {
      return dataPoints.map((point) => ({
        x: xScale(point.date, point.sourceIndex),
        label: `${String(point.date.getDate()).padStart(2, '0')}.${String(
          point.date.getMonth() + 1,
        ).padStart(2, '0')}`,
        daily: true,
      }));
    }
    const seen = new Set<string>();
    const ticks: { x: number; label: string; daily?: boolean }[] = [];
    for (const d of dataPoints) {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        ticks.push({
          x: xScale(d.date, d.sourceIndex),
          label: monthLabels[d.date.getMonth()],
        });
      }
    }
    if (graphWidth < 560 && ticks.length > 5) {
      return ticks.filter((_, index) => index % 2 === 0);
    }
    return ticks;
  })();

  const themeText = host.state.isDarkTheme ? "#e9f8ff" : "#111827";
  const themeGrid = host.state.isDarkTheme
    ? "rgba(233, 248, 255, 0.28)"
    : "rgba(15, 23, 42, 0.12)";
  const tooltipBg = host.state.isDarkTheme
    ? "rgba(7, 26, 43, 0.96)"
    : "rgba(250,250,249,0.98)";
  const tooltipHeaderBg = host.state.isDarkTheme
    ? "rgba(233,248,255,0.1)"
    : "rgba(15,23,42,0.06)";
  const tooltipBorder = host.state.isDarkTheme
    ? "rgba(126, 214, 255, 0.28)"
    : "rgba(15,23,42,0.12)";

  const findNearestPoint = (svgX: number) => {
    if (dataPoints.length === 0) return null;
    let nearest = 0;
    let minDist = Math.abs(
      xScale(dataPoints[0].date, dataPoints[0].sourceIndex) - svgX,
    );
    for (let i = 1; i < dataPoints.length; i++) {
      const d = Math.abs(
        xScale(dataPoints[i].date, dataPoints[i].sourceIndex) - svgX,
      );
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    return dataPoints[nearest];
  };

  const findNearestSeriesPoint = (
    svgX: number,
    indexKey: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi",
  ) => {
    const series = seriesByIndex[indexKey] || [];
    if (series.length === 0) return null;
    let nearest = 0;
    let minDist = Math.abs(
      xScale(series[0].date, series[0].sourceIndex) - svgX,
    );
    for (let i = 1; i < series.length; i++) {
      const distance = Math.abs(
        xScale(series[i].date, series[i].sourceIndex) - svgX,
      );
      if (distance < minDist) {
        minDist = distance;
        nearest = i;
      }
    }
    return series[nearest];
  };

  const findNearestPointAcrossSeries = (svgX: number, svgY: number) => {
    let best:
      | {
          distance: number;
          indexKey: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi";
          point: {
            date: Date;
            value: number;
            min?: number;
            max?: number;
            sourceIndex?: number;
          };
        }
      | null = null;

    for (const series of lineSeries) {
      for (const p of series.points) {
        const dx = p.x - svgX;
        const dy = p.y - svgY;
        const distance = Math.hypot(dx, dy);
        if (!best || distance < best.distance) {
          best = {
            distance,
            indexKey: series.key,
            point: {
              date: p.date,
              value: p.value,
              min: p.min,
              max: p.max,
              sourceIndex: p.sourceIndex,
            },
          };
        }
      }
    }

    return best;
  };

  const setChartTooltipForIndex = (
    indexKey: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi",
    point: {
      date: Date;
      value: number;
      min?: number;
      max?: number;
      sourceIndex?: number;
    },
  ) => {
    host.setState({
      chartTooltip: {
        indexKey,
        point: {
          date: point.date,
          value: point.value,
          min: point.min,
          max: point.max,
          ...(point.sourceIndex != null && point.sourceIndex >= 0
            ? { sourceIndex: point.sourceIndex }
            : {}),
        },
      },
    });
  };

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isMultiIndexMode) {
      host.setState({ chartTooltip: null });
      return;
    }
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * graphWidth;
    const point = findNearestPoint(svgX);
    if (point) {
      setChartTooltipForIndex(primaryIndex, point);
    }
  };

  const handleChartMouseLeave = () => {
    host.setState({ chartTooltip: null });
  };

  const handlePointSelection = (
    indexKey: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi",
    point: {
      date: Date;
      value: number;
      min?: number;
      max?: number;
      sourceIndex?: number;
    },
  ) => {
    if (!host.state.selecteduniqueid) {
      graffLog('chartPoint:SKIP-no-polygon', {
        indexKey,
        pointDate: point.date?.toISOString?.() || String(point.date),
        pointValue: point.value,
      });
      return;
    }

    const advertised = host.state.polygonAvailableDates || [];
    const selectedDateStr =
      host.resolveAgainstAvailableDates(point.date, advertised) ||
      host.formatLocalDateYmd(point.date);
    if (!selectedDateStr) {
      graffLog('chartPoint:SKIP-date-unresolved', {
        indexKey,
        pointDate: point.date?.toISOString?.() || String(point.date),
        advertisedDateCount: advertised.length,
      });
      return;
    }

    const isSameDateClick =
      (host.state.selectedNdviDate || "") === selectedDateStr;
    const isSameIndexClick =
      (host.state.selectedChartIndexKey || "") === indexKey;

    // Same date + same index → toggle off. Same date + different index
    // (e.g. NDVI → EVI on that day) must still fetch/show the new raster;
    // previously any same-date click cleared the overlay, so switching
    // index indicators looked like "nothing on the field".
    graffLog('chartPoint:selection-resolved', {
      uniqueid: host.state.selecteduniqueid,
      indexKey,
      selectedDate: selectedDateStr,
      rawPointDate: point.date?.toISOString?.() || String(point.date),
      value: point.value,
      min: point.min ?? null,
      max: point.max ?? null,
      sourceIndex: point.sourceIndex ?? null,
      advertisedDateCount: advertised.length,
      previousDate: host.state.selectedNdviDate || null,
      previousIndexKey: host.state.selectedChartIndexKey || null,
      isSameDateClick,
      isSameIndexClick,
    });

    if (isSameDateClick && isSameIndexClick) {
      graffLog('chartPoint:toggle-off', {
        uniqueid: host.state.selecteduniqueid,
        indexKey,
        selectedDate: selectedDateStr,
        overlayPresent: Boolean(host._vegetationImageLayer),
      });
      host.setState({
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        chartTooltip: null,
      });

      if (!host.state.selecteduniqueid) {
        document.dispatchEvent(
          new CustomEvent("widgetSelectionChanged", {
            detail: {
              ndviDate: "",
              source: "AgriGraffWidget",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } else {
        graffLog('chartPoint:remove-overlay', {
          reason: 'same-date-and-index-toggle-off',
          overlayPresent: Boolean(host._vegetationImageLayer),
        });
        host.cancelVegetationImageOverlay();
      }
      return;
    }

    host.setState({
      selectedNdviDate: selectedDateStr,
      selectedChartIndexKey: indexKey,
      chartTooltip: {
        indexKey,
        point: {
          date: point.date,
          value: point.value,
          min: point.min,
          max: point.max,
          ...(point.sourceIndex != null && point.sourceIndex >= 0
            ? { sourceIndex: point.sourceIndex }
            : {}),
        },
      },
    });

    if (!host.state.selecteduniqueid) {
      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            ndviDate: selectedDateStr,
            source: "AgriGraffWidget",
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );
    } else {
      // A polygon is selected and a date was picked on its chart — fetch
      // and overlay the colored index raster for that polygon+date.
      graffLog('chartPoint:request-overlay', {
        uniqueid: host.state.selecteduniqueid,
        selectedDate: selectedDateStr,
        indexKey,
      });
      host.applyVegetationImageOverlay(
        host.state.selecteduniqueid,
        selectedDateStr,
        indexKey,
      );
    }
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!host.state.selecteduniqueid) {
      graffLog('chartPoint:click-SKIP-no-polygon', {
        selectedIndices: host.state.selectedIndices,
        isMultiIndexMode,
      });
      return;
    }

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * graphWidth;
    const svgY = ((e.clientY - rect.top) / rect.height) * graphHeight;

    graffLog('chartPoint:click', {
      uniqueid: host.state.selecteduniqueid,
      clientX: e.clientX,
      clientY: e.clientY,
      svgX,
      svgY,
      graphWidth,
      graphHeight,
      isMultiIndexMode,
      primaryIndex,
      selectedIndices: host.state.selectedIndices,
    });

    if (isMultiIndexMode) {
      const nearest = findNearestPointAcrossSeries(svgX, svgY);
      // Only treat click as point-selection when cursor is actually close to a dot.
      if (!nearest || nearest.distance > 10) {
        graffLog('chartPoint:click-SKIP-no-near-dot', {
          nearestIndexKey: nearest?.indexKey || null,
          nearestDistance: nearest?.distance ?? null,
          threshold: 10,
        });
        return;
      }
      graffLog('chartPoint:nearest-dot', {
        indexKey: nearest.indexKey,
        distance: nearest.distance,
        date:
          nearest.point.date?.toISOString?.() || String(nearest.point.date),
        value: nearest.point.value,
      });
      handlePointSelection(nearest.indexKey, nearest.point);
      return;
    }

    const point = findNearestPoint(svgX);
    if (!point) {
      graffLog('chartPoint:click-SKIP-no-point', {
        primaryIndex,
        svgX,
      });
      return;
    }
    graffLog('chartPoint:nearest-dot', {
      indexKey: primaryIndex,
      date: point.date?.toISOString?.() || String(point.date),
      value: point.value,
      sourceIndex: point.sourceIndex ?? null,
    });
    handlePointSelection(primaryIndex, point);
  };

  const renderCrosshair = (
    guide: NonNullable<typeof selectionGuide> | NonNullable<typeof chartTooltip>,
    variant: "selection" | "hover",
  ) => {
    const pt = guide.point;
    const lineX = xScale(pt.date, pt.sourceIndex);
    const yVal = yScale(pt.value);
    const yMin = pt.min != null ? yScale(pt.min) : null;
    const yMax = pt.max != null ? yScale(pt.max) : null;
    const lineHt = 12;
    // Hover guide is a bit softer so the sticky selection line stays primary.
    const lineStroke =
      variant === "selection"
        ? "rgba(16, 185, 129, 0.55)"
        : "rgba(16, 185, 129, 0.28)";
    const lineWidth = variant === "selection" ? 1.5 : 1.2;
    return (
      <g
        key={`graph-crosshair-${variant}`}
        className={`graph-crosshair graph-crosshair--${variant}`}
        pointerEvents="none"
      >
        <line
          x1={lineX}
          y1={padding.top}
          x2={lineX}
          y2={padding.top + chartHeight}
          stroke={lineStroke}
          strokeWidth={lineWidth}
          strokeDasharray="6,4"
        />
        {yMin != null && (
          <line
            x1={lineX - lineHt / 2}
            y1={yMin}
            x2={lineX + lineHt / 2}
            y2={yMin}
            stroke="#f87171"
            strokeWidth={2}
            opacity={variant === "selection" ? 1 : 0.7}
          />
        )}
        {yMax != null && (
          <line
            x1={lineX - lineHt / 2}
            y1={yMax}
            x2={lineX + lineHt / 2}
            y2={yMax}
            stroke="#34d399"
            strokeWidth={2}
            opacity={variant === "selection" ? 1 : 0.7}
          />
        )}
        <line
          x1={lineX - lineHt / 2}
          y1={yVal}
          x2={lineX + lineHt / 2}
          y2={yVal}
          stroke="#fbbf24"
          strokeWidth={2}
          opacity={variant === "selection" ? 1 : 0.7}
        />
      </g>
    );
  };

  const floatingTooltip = chartTooltip
    ? (() => {
        const pt = chartTooltip.point;
        const lineX = xScale(pt.date, pt.sourceIndex);
        const boxW = 156;
        const boxH = 92;
        const wrapRect = host.graphSvgWrapRef.current?.getBoundingClientRect();
        if (!wrapRect) return null;

        let left = wrapRect.left + lineX - boxW / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - boxW - 8));
        const top = Math.max(8, wrapRect.top - boxH - 10);

        const minStr = pt.min != null ? pt.min.toFixed(4) : "—";
        const maxStr = pt.max != null ? pt.max.toFixed(4) : "—";
        const valStr = pt.value.toFixed(4);
        const dateLocale = language === "ru" ? "ru-RU" : "en-GB";
        const dateStr = pt.date.toLocaleDateString(dateLocale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const indicatorColor = indexColorMap[chartTooltip.indexKey] || "#fbbf24";

        return {
          left,
          top,
          minStr,
          maxStr,
          valStr,
          dateStr,
          indicatorColor,
          key: chartTooltip.indexKey,
        };
      })()
    : null;

  const isRefreshing = !!loadingVegetation && hasGraphData;

  return (
    <div
      className={`vegetation-graph-container ${isNarrow ? "is-narrow" : ""} ${compactChart ? "is-compact" : ""}${
        isIpadLayout ? " is-ipad-layout" : ""
      }${isRefreshing ? " vegetation-graph-container--loading" : ""}`}
      ref={host.graphContainerRef}
    >
      {host.renderGraphHeader()}
      {isRefreshing ? <AgriChartLoader /> : null}

      <div className="graff-date-range" aria-label="Chart date range">
        <div
          className="graff-date-range-track"
          style={
            {
              '--range-start': `${rangeStartPercent}%`,
              '--range-end': `${rangeEndPercent}%`,
            } as React.CSSProperties
          }
        >
          <input
            className="graff-date-range-input graff-date-range-input-start"
            type="range"
            min={0}
            max={lastRangeIndex}
            step={1}
            value={effectiveRangeStart}
            disabled={lastRangeIndex < 1}
            aria-label="Start date"
            onChange={(event) => {
              const next = Math.min(
                Number(event.currentTarget.value),
                effectiveRangeEnd,
              );
              host.setState({
                dateRangeStartIndex: next,
                chartTooltip: null,
              });
            }}
          />
          <input
            className="graff-date-range-input graff-date-range-input-end"
            type="range"
            min={0}
            max={lastRangeIndex}
            step={1}
            value={effectiveRangeEnd}
            disabled={lastRangeIndex < 1}
            aria-label="End date"
            onChange={(event) => {
              const next = Math.max(
                Number(event.currentTarget.value),
                effectiveRangeStart,
              );
              host.setState({
                dateRangeEndIndex: next,
                chartTooltip: null,
              });
            }}
          />
        </div>
        <div className="graff-date-range-labels">
          <span>{formatRangeDate(rangeStartDate)}</span>
          <span>{formatRangeDate(rangeEndDate)}</span>
        </div>
      </div>

      {/* Chart area - center */}
      <div className="graff-chart-area">
        <div className="graph-svg-wrap" ref={host.graphSvgWrapRef}>
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            className="graph-svg"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
            onClick={handleChartClick}
          >
            <defs>
              <filter
                id="toolinfoShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="0"
                  floodColor="none"
                  floodOpacity="0"
                />
              </filter>
              <linearGradient
                id="minMaxFill"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#94a3b8", stopOpacity: 0.16 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#94a3b8", stopOpacity: 0.02 }}
                />
              </linearGradient>
              {lineSeries.map((series) => (
                <linearGradient
                  key={`area-gradient-${series.key}`}
                  id={`areaFill-${series.key}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: series.color, stopOpacity: 0.26 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: series.color, stopOpacity: 0.03 }}
                  />
                </linearGradient>
              ))}
              {/* Soft glow only — expanded region avoids clipped “border” artifacts */}
              <filter
                id="lineGlow"
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
                filterUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="2.8"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.55 0"
                  result="soft"
                />
                <feMerge>
                  <feMergeNode in="soft" />
                </feMerge>
              </filter>
              <filter
                id="dotGlow"
                x="-120%"
                y="-120%"
                width="340%"
                height="340%"
                filterUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="2.4"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.6 0"
                  result="soft"
                />
                <feMerge>
                  <feMergeNode in="soft" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle background fill for chart area */}
            <rect
              x={padding.left}
              y={padding.top}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
              stroke="none"
              rx="0"
            />

            {/* Chart content */}
            <g>
              {/* Grid lines */}
              <g className="grid">
                {yAxisTickValues.map((value) => {
                  const y = yScale(value);
                  // Hide axis labels that fall outside the plot (e.g. clipped "0.00").
                  if (
                    y < padding.top - 1 ||
                    y > padding.top + chartHeight + 1
                  ) {
                    return null;
                  }
                  // If a selected min/max sits on this tick, skip the tick
                  // number so the colored extremum label owns that row.
                  const selPt = selectionGuide?.point;
                  const extremumNearTick =
                    !!selPt &&
                    [selPt.min, selPt.max].some(
                      (ext) =>
                        ext != null &&
                        Number.isFinite(ext) &&
                        Math.abs(yScale(ext) - y) < 11,
                    );
                  if (extremumNearTick) return null;
                  return (
                    <g key={value}>
                      <text
                        x={padding.left - 12}
                        y={y + 4}
                        textAnchor="end"
                        fontSize={axisTickFont}
                        fill={themeText}
                        fontWeight="400"
                        fontFamily="'Manrope', sans-serif"
                      >
                        {value.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={padding.top + chartHeight}
                  stroke={themeGrid}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <line
                  x1={padding.left}
                  y1={padding.top + chartHeight}
                  x2={padding.left + chartWidth}
                  y2={padding.top + chartHeight}
                  stroke={themeGrid}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* Selected-point min/max — left column with Y-axis numbers */}
                {selectionGuide &&
                  (() => {
                    const pt = selectionGuide.point;
                    const tickLen = 8;
                    const labelX = padding.left - 12;
                    const renderExtremum = (
                      kind: "min" | "max",
                      value: number | undefined,
                      color: string,
                    ) => {
                      if (value == null || !Number.isFinite(value)) return null;
                      const y = yScale(value);
                      if (
                        y < padding.top - 1 ||
                        y > padding.top + chartHeight + 1
                      ) {
                        return null;
                      }
                      return (
                        <g
                          key={`y-sel-${kind}`}
                          className={`graph-y-sel-extremum graph-y-sel-extremum--${kind}`}
                        >
                          <line
                            x1={padding.left - tickLen}
                            y1={y}
                            x2={padding.left + 3}
                            y2={y}
                            stroke={color}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          <circle
                            cx={padding.left}
                            cy={y}
                            r={2.4}
                            fill={color}
                          />
                          <text
                            x={labelX}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize={Math.max(9, axisTickFont - 1)}
                            fill={color}
                            fontWeight="700"
                            fontFamily="'Manrope', sans-serif"
                          >
                            {value.toFixed(2)}
                          </text>
                        </g>
                      );
                    };
                    return (
                      <g className="graph-y-sel-extrema" pointerEvents="none">
                        {renderExtremum("max", pt.max, "#34d399")}
                        {renderExtremum("min", pt.min, "#f87171")}
                      </g>
                    );
                  })()}
              </g>

              {false && minMaxAreaPath && (
                <path
                  d={minMaxAreaPath}
                  fill="url(#minMaxFill)"
                  fillOpacity={1}
                />
              )}
              {lineSeries.map((series, seriesIdx) => (
                <g key={`${series.key}-${host.state.chartAnimKey}`}>
                  {series.areaPath && finalIndices.length <= 2 && (
                    <path
                      d={series.areaPath}
                      fill={`url(#areaFill-${series.key})`}
                      opacity={0.92}
                    />
                  )}
                  {series.path && (
                    <>
                      <path
                        className={`graff-line-path graff-line-path--glow${
                          isIpadLayout ? " graff-line-path--static" : ""
                        }`}
                        d={series.path}
                        pathLength={isIpadLayout ? undefined : 100}
                        strokeDasharray={isIpadLayout ? undefined : 100}
                        strokeDashoffset={isIpadLayout ? undefined : 100}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={lineStrokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={isIpadLayout ? undefined : "url(#lineGlow)"}
                        style={{
                          pointerEvents: "none",
                          animationDelay: isIpadLayout
                            ? undefined
                            : `${70 + seriesIdx * 130}ms`,
                        }}
                      />
                      <path
                        className={`graff-line-path${
                          isIpadLayout ? " graff-line-path--static" : ""
                        }`}
                        d={series.path}
                        pathLength={isIpadLayout ? undefined : 100}
                        strokeDasharray={isIpadLayout ? undefined : 100}
                        strokeDashoffset={isIpadLayout ? undefined : 100}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={lineStrokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          opacity: 0.98,
                          animationDelay: isIpadLayout
                            ? undefined
                            : `${70 + seriesIdx * 130}ms`,
                        }}
                        onMouseMove={(e) => {
                          if (!isMultiIndexMode) return;
                          e.stopPropagation();
                          const svg = e.currentTarget.ownerSVGElement;
                          if (!svg) return;
                          const rect = svg.getBoundingClientRect();
                          const svgX =
                            ((e.clientX - rect.left) / rect.width) *
                            graphWidth;
                          const point = findNearestSeriesPoint(
                            svgX,
                            series.key,
                          );
                          if (point) {
                            setChartTooltipForIndex(series.key, point);
                          }
                        }}
                      />
                    </>
                  )}
                  {series.points.map((d, i) => {
                    const totalPoints = series.points.length;
                    // Thin visible markers a bit so dense series don't look cluttered.
                    const maxVisibleDots = (() => {
                      if (isIpadLayout) {
                        return Math.max(
                          8,
                          Math.min(14, Math.floor(chartWidth / 48)),
                        );
                      }
                      return Math.max(
                        18,
                        Math.min(42, Math.floor(chartWidth / 16)),
                      );
                    })();
                    const sampleStep = Math.max(
                      1,
                      Math.ceil(totalPoints / maxVisibleDots),
                    );
                    const localDateStr =
                      host.resolveAgainstAvailableDates(
                        d.date,
                        host.state.polygonAvailableDates || [],
                      ) || host.formatLocalDateYmd(d.date);
                    const isActive =
                      !!selectedNdviDate &&
                      localDateStr === selectedNdviDate &&
                      (!isMultiIndexMode ||
                        host.state.selectedChartIndexKey === series.key);
                    const isHovered =
                      !!chartTooltip &&
                      chartTooltip.indexKey === series.key &&
                      chartTooltip.point?.sourceIndex === d.sourceIndex;
                    const isSampled =
                      i % sampleStep === 0 || i === totalPoints - 1;
                    if (!isSampled && !isActive && !isHovered) return null;
                    const isInstantReveal = isHovered && !isSampled && !isActive;
                    const isLightTheme = !host.state.isDarkTheme;
                    // Dark: no colored outer ring — bump radius so size matches ring look.
                    // iPad / short windows: slightly smaller markers.
                    const baseRadius = isIpadLayout
                      ? isActive
                        ? 5.2
                        : isHovered
                          ? 4.4
                          : 3.5
                      : isActive
                        ? 7.6
                        : isHovered
                          ? 6.4
                          : 5.1;
                    const outerRingWidth = isLightTheme
                      ? isIpadLayout
                        ? 1.2
                        : 1.6
                      : 0;
                    const radius = isLightTheme
                      ? baseRadius
                      : baseRadius + (isIpadLayout ? 0.8 : 1.2);
                    const strokeWidth = isIpadLayout
                      ? isActive
                        ? 2
                        : isHovered
                          ? 1.7
                          : 1.35
                      : isActive
                        ? 2.6
                        : isHovered
                          ? 2.2
                          : 1.7;
                    const innerStroke = "#ffffff";
                    const outerRadius =
                      radius + strokeWidth / 2 + outerRingWidth / 2 + 0.4;
                    const glowRadius = isIpadLayout
                      ? radius + 1.4
                      : radius + 2.2;
                    return (
                      <g
                        key={`${series.key}-${i}`}
                        className={`graff-line-dot-group${
                          isInstantReveal ? " graff-line-dot-group--instant" : ""
                        }`}
                        style={{
                          animationDelay: isInstantReveal
                            ? undefined
                            : `${160 + seriesIdx * 120 + Math.floor(i / sampleStep) * 28}ms`,
                        }}
                        onMouseMove={(e) => {
                          if (!isMultiIndexMode) return;
                          e.stopPropagation();
                          setChartTooltipForIndex(series.key, {
                            date: d.date,
                            value: d.value,
                            min: d.min,
                            max: d.max,
                            sourceIndex: d.sourceIndex,
                          });
                        }}
                      >
                        <circle
                          className="graff-line-dot-glow"
                          cx={d.x}
                          cy={d.y}
                          r={glowRadius}
                          fill={series.color}
                          stroke="none"
                          filter="url(#dotGlow)"
                          style={{ pointerEvents: "none" }}
                        />
                        {isLightTheme ? (
                          <circle
                            className="graff-line-dot-ring"
                            cx={d.x}
                            cy={d.y}
                            r={outerRadius}
                            fill="none"
                            stroke={series.color}
                            strokeWidth={outerRingWidth}
                          />
                        ) : null}
                        <circle
                          className="graff-line-dot"
                          cx={d.x}
                          cy={d.y}
                          r={radius}
                          fill={series.color}
                          stroke={innerStroke}
                          strokeWidth={strokeWidth}
                          style={{
                            transition: "r 0.2s ease",
                          }}
                        >
                          <title>
                            {`${series.key.toUpperCase()}: ${d.value.toFixed(4)}`}
                            {"\n"}
                            {d.date.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              ))}

              {monthTickPoints.map((tick, i) => (
                <text
                  key={i}
                  x={tick.x}
                  y={monthTickY}
                  textAnchor="middle"
                  fontSize={tick.daily ? 8 : monthTickFont}
                  fill={themeText}
                  fontWeight="400"
                  fontFamily="'Manrope', sans-serif"
                  transform={
                    tick.daily
                      ? `rotate(-38, ${tick.x}, ${monthTickY})`
                      : undefined
                  }
                >
                  {tick.label}
                </text>
              ))}

              {/* X-axis title removed by request */}
              {/* Y-axis title (INDEX) removed by request */}
            </g>

            {/* Sticky selection crosshair + optional hover crosshair */}
            {selectionGuide ? renderCrosshair(selectionGuide, "selection") : null}
            {hoverGuide ? renderCrosshair(hoverGuide, "hover") : null}
          </svg>
          {floatingTooltip &&
            ReactDOM.createPortal(
              <div
                className={`graff-chart-tooltip${
                  host.state.isDarkTheme ? "" : " graff-chart-tooltip--light"
                }`}
                style={{
                  left: `${floatingTooltip.left}px`,
                  top: `${floatingTooltip.top}px`,
                }}
              >
                <div className="graff-chart-tooltip__title">
                  {floatingTooltip.dateStr}
                </div>
                <div className="graff-chart-tooltip__content">
                  <div className="graff-chart-tooltip__row">
                    <span className="graff-chart-tooltip__label">
                      {language === "en"
                        ? "Max"
                        : language === "ru"
                          ? "Макс"
                          : language === "uz_lat"
                            ? "Max"
                            : "Макс"}
                    </span>
                    <span className="graff-chart-tooltip__value">
                      {floatingTooltip.maxStr}
                    </span>
                  </div>
                  <div className="graff-chart-tooltip__row">
                    <span className="graff-chart-tooltip__label">
                      <span
                        className="graff-chart-tooltip__dot"
                        style={{ background: floatingTooltip.indicatorColor }}
                      />
                      {floatingTooltip.key.toUpperCase()}
                    </span>
                    <span className="graff-chart-tooltip__value">
                      {floatingTooltip.valStr}
                    </span>
                  </div>
                  <div className="graff-chart-tooltip__row">
                    <span className="graff-chart-tooltip__label">
                      {language === "en"
                        ? "Min"
                        : language === "ru"
                          ? "Мин"
                          : language === "uz_lat"
                            ? "Min"
                            : "Мин"}
                    </span>
                    <span className="graff-chart-tooltip__value">
                      {floatingTooltip.minStr}
                    </span>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
};
