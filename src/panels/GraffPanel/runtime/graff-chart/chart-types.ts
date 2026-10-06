/**
 * Shared types for the Graff vegetation chart renderer.
 */
import type { React } from "jimu-core";
import type {
  PolygonExportImageResult,
  VegetationIndiceType,
} from "../../../../gis/agri-polygon-api-source";
import type { GraffIndexKey } from "../graff-graph-constants";
import type { AgriGraffWidgetState, GraffWidgetProps } from "../graff-state";

/** A point the chart can select / hover (tooltip + crosshair shape). */
export type GraffChartPointValue = {
  date: Date;
  value: number;
  min?: number;
  max?: number;
  /** Must match xScale(date, sourceIndex) so crosshair aligns with rendered dots */
  sourceIndex?: number;
};

/** One sample of a single index series after date filtering. */
export type GraffSeriesPoint = {
  date: Date;
  value: number;
  sourceIndex: number;
  min?: number;
  max?: number;
};

export type GraffSeriesByIndex = Record<GraffIndexKey, GraffSeriesPoint[]>;

export type GraffLineSeriesPoint = {
  x: number;
  y: number;
  value: number;
  date: Date;
  min?: number;
  max?: number;
  sourceIndex: number;
};

export type GraffLineSeries = {
  key: GraffIndexKey;
  color: string;
  path: string;
  areaPath: string;
  points: GraffLineSeriesPoint[];
};

export type GraffChartGeometryCache = {
  minMaxAreaPath: string;
  lineSeries: GraffLineSeries[];
  yAxisTickValues: number[];
};

/** Guide (selection or hover) anchored on one index series point. */
export type GraffChartGuide = {
  indexKey: GraffIndexKey;
  point: GraffChartPointValue;
};

export interface GraffChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface GraffChartScales {
  xScale: (date: Date, sourceIndex?: number) => number;
  yScale: (value: number) => number;
}

/** Widget members the chart reads or calls. */
export interface GraffGraphHost {
  state: AgriGraffWidgetState;
  setState: React.Component<GraffWidgetProps, AgriGraffWidgetState>["setState"];
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
    rawDate: unknown,
    availableDates: string[],
  ) => string | null;
  localizeRuntimeMessage: (value: unknown) => string;
  renderGraphHeader: () => React.ReactNode;
  wrapGraphFrame: (
    body: React.ReactNode,
    options?: { refreshLoading?: boolean },
  ) => React.ReactElement;
}
