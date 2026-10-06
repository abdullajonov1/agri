/**
 * Mouse / click handlers for the Graff vegetation chart: hover tooltip and
 * point selection (which drives the vegetation raster overlay).
 */
import type { React } from "jimu-core";
import type { GraffIndexKey } from "../graff-graph-constants";
import { graffLog } from "../graff-log";
import {
  findNearestPointAcrossSeries,
  findNearestPointByX,
  toChartTooltipPoint,
} from "./chart-geometry";
import type {
  GraffChartPointValue,
  GraffChartScales,
  GraffGraphHost,
  GraffLineSeries,
  GraffSeriesByIndex,
  GraffSeriesPoint,
} from "./chart-types";

/** Multi-index click only selects when the cursor is this close to a dot. */
const NEAR_DOT_THRESHOLD = 10;

export interface GraffChartInteractionInput {
  host: GraffGraphHost;
  isMultiIndexMode: boolean;
  primaryIndex: GraffIndexKey;
  graphWidth: number;
  graphHeight: number;
  dataPoints: GraffSeriesPoint[];
  seriesByIndex: GraffSeriesByIndex;
  lineSeries: GraffLineSeries[];
  xScale: GraffChartScales["xScale"];
}

export interface GraffChartInteractions {
  setChartTooltipForIndex: (
    indexKey: GraffIndexKey,
    point: GraffChartPointValue,
  ) => void;
  findNearestSeriesPoint: (
    svgX: number,
    indexKey: GraffIndexKey,
  ) => GraffSeriesPoint | null;
  handleChartMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleChartMouseLeave: () => void;
  handleChartClick: (e: React.MouseEvent<SVGSVGElement>) => void;
}

const describeDate = (date: Date): string =>
  date?.toISOString?.() || String(date);

const dispatchSelectionChanged = (ndviDate: string): void => {
  document.dispatchEvent(
    new CustomEvent("widgetSelectionChanged", {
      detail: {
        ndviDate,
        source: "AgriGraffWidget",
        timestamp: Date.now(),
      },
      bubbles: true,
    }),
  );
};

/** Same date + same index click → clear selection and overlay. */
function toggleOffSelection(
  host: GraffGraphHost,
  indexKey: GraffIndexKey,
  selectedDateStr: string,
): void {
  graffLog("chartPoint:toggle-off", {
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
    dispatchSelectionChanged("");
    return;
  }
  graffLog("chartPoint:remove-overlay", {
    reason: "same-date-and-index-toggle-off",
    overlayPresent: Boolean(host._vegetationImageLayer),
  });
  host.cancelVegetationImageOverlay();
}

export function handleChartPointSelection(
  host: GraffGraphHost,
  indexKey: GraffIndexKey,
  point: GraffChartPointValue,
): void {
  if (!host.state.selecteduniqueid) {
    graffLog("chartPoint:SKIP-no-polygon", {
      indexKey,
      pointDate: describeDate(point.date),
      pointValue: point.value,
    });
    return;
  }

  const advertised = host.state.polygonAvailableDates || [];
  const selectedDateStr =
    host.resolveAgainstAvailableDates(point.date, advertised) ||
    host.formatLocalDateYmd(point.date);
  if (!selectedDateStr) {
    graffLog("chartPoint:SKIP-date-unresolved", {
      indexKey,
      pointDate: describeDate(point.date),
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
  graffLog("chartPoint:selection-resolved", {
    uniqueid: host.state.selecteduniqueid,
    indexKey,
    selectedDate: selectedDateStr,
    rawPointDate: describeDate(point.date),
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
    toggleOffSelection(host, indexKey, selectedDateStr);
    return;
  }

  host.setState({
    selectedNdviDate: selectedDateStr,
    selectedChartIndexKey: indexKey,
    chartTooltip: { indexKey, point: toChartTooltipPoint(point) },
  });

  if (!host.state.selecteduniqueid) {
    dispatchSelectionChanged(selectedDateStr);
    return;
  }
  // A polygon is selected and a date was picked on its chart — fetch
  // and overlay the colored index raster for that polygon+date.
  graffLog("chartPoint:request-overlay", {
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

function handleMultiIndexClick(
  host: GraffGraphHost,
  lineSeries: GraffLineSeries[],
  svgX: number,
  svgY: number,
): void {
  const nearest = findNearestPointAcrossSeries(lineSeries, svgX, svgY);
  // Only treat click as point-selection when cursor is actually close to a dot.
  if (!nearest || nearest.distance > NEAR_DOT_THRESHOLD) {
    graffLog("chartPoint:click-SKIP-no-near-dot", {
      nearestIndexKey: nearest?.indexKey || null,
      nearestDistance: nearest?.distance ?? null,
      threshold: NEAR_DOT_THRESHOLD,
    });
    return;
  }
  graffLog("chartPoint:nearest-dot", {
    indexKey: nearest.indexKey,
    distance: nearest.distance,
    date: describeDate(nearest.point.date),
    value: nearest.point.value,
  });
  handleChartPointSelection(host, nearest.indexKey, nearest.point);
}

export function createChartInteractions(
  input: GraffChartInteractionInput,
): GraffChartInteractions {
  const {
    host,
    isMultiIndexMode,
    primaryIndex,
    graphWidth,
    graphHeight,
    dataPoints,
    seriesByIndex,
    lineSeries,
    xScale,
  } = input;

  const findNearestPoint = (svgX: number) =>
    findNearestPointByX(dataPoints, xScale, svgX);

  const findNearestSeriesPoint = (svgX: number, indexKey: GraffIndexKey) =>
    findNearestPointByX(seriesByIndex[indexKey] || [], xScale, svgX);

  const setChartTooltipForIndex = (
    indexKey: GraffIndexKey,
    point: GraffChartPointValue,
  ) => {
    host.setState({
      chartTooltip: { indexKey, point: toChartTooltipPoint(point) },
    });
  };

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isMultiIndexMode) {
      host.setState({ chartTooltip: null });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * graphWidth;
    const point = findNearestPoint(svgX);
    if (point) {
      setChartTooltipForIndex(primaryIndex, point);
    }
  };

  const handleChartMouseLeave = () => {
    host.setState({ chartTooltip: null });
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!host.state.selecteduniqueid) {
      graffLog("chartPoint:click-SKIP-no-polygon", {
        selectedIndices: host.state.selectedIndices,
        isMultiIndexMode,
      });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * graphWidth;
    const svgY = ((e.clientY - rect.top) / rect.height) * graphHeight;
    graffLog("chartPoint:click", {
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
      handleMultiIndexClick(host, lineSeries, svgX, svgY);
      return;
    }

    const point = findNearestPoint(svgX);
    if (!point) {
      graffLog("chartPoint:click-SKIP-no-point", { primaryIndex, svgX });
      return;
    }
    graffLog("chartPoint:nearest-dot", {
      indexKey: primaryIndex,
      date: describeDate(point.date),
      value: point.value,
      sourceIndex: point.sourceIndex ?? null,
    });
    handleChartPointSelection(host, primaryIndex, point);
  };

  return {
    setChartTooltipForIndex,
    findNearestSeriesPoint,
    handleChartMouseMove,
    handleChartMouseLeave,
    handleChartClick,
  };
}
