/**
 * Per-render context shared by the Graff chart SVG part renderers.
 */
import type { GraffIndexKey } from "../graff-graph-constants";
import type { GraffChartInteractions } from "./chart-interactions";
import type { GraffChartLayout, GraffChartTheme } from "./chart-layout";
import type {
  GraffChartGuide,
  GraffChartScales,
  GraffGraphHost,
  GraffLineSeries,
} from "./chart-types";

export interface GraffChartRenderCtx {
  host: GraffGraphHost;
  language: string;
  layout: GraffChartLayout;
  theme: GraffChartTheme;
  isIpadLayout: boolean;
  isMultiIndexMode: boolean;
  finalIndices: GraffIndexKey[];
  indexColorMap: Record<GraffIndexKey, string>;
  scales: GraffChartScales;
  lineSeries: GraffLineSeries[];
  yAxisTickValues: number[];
  selectionGuide: GraffChartGuide | null;
  chartTooltip: GraffChartGuide | null;
  selectedNdviDate: string | null | undefined;
  interactions: GraffChartInteractions;
}
