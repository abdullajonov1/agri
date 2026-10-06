/**
 * Tree-shaken echarts entry for AgriPie. `import * as echarts from "echarts"`
 * pulled the whole library (~1 MB); register only what the donut uses:
 *  - PieChart            → series[0].type "pie"
 *  - TooltipComponent    → `tooltip` + dispatchAction({ type: "showTip" })
 *  - LegendComponent     → `legend: { show: false }` (kept so the key is known)
 *  - TitleComponent      → `title: { show: false }`
 *  - CanvasRenderer      → echarts.init(el) default renderer
 * Add a registration here before using a new series/component in options.
 */
import * as echartsCore from "echarts/core";
import { PieChart } from "echarts/charts";
import type { PieSeriesOption } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import type {
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { toPlainRecord } from "../../../shared/agri-plain-object";

export const PIE_ECHARTS_MODULES = [
  PieChart,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
] as const;

echartsCore.use([...PIE_ECHARTS_MODULES]);

/** Series types registered above — kept in sync by echarts-setup.test.ts. */
export const PIE_REGISTERED_SERIES_TYPES: readonly string[] = ["pie"];

export type PieEChartsOption = echartsCore.ComposeOption<
  | PieSeriesOption
  | TooltipComponentOption
  | LegendComponentOption
  | TitleComponentOption
>;

export type PieECharts = echartsCore.ECharts;

/** Payload passed to chart "click" handlers. */
export type PieSliceClickParams = echartsCore.ECElementEvent;

export interface PieSliceData {
  rawKey?: string;
  name?: string;
}

/** Read rawKey / name from a clicked slice's data item (shape set in updatePieChart). */
export const toPieSliceData = (data: unknown): PieSliceData => {
  const record = toPlainRecord(data);
  if (!record) return {};
  const slice: PieSliceData = {};
  if (record.rawKey != null) slice.rawKey = String(record.rawKey);
  if (record.name != null) slice.name = String(record.name);
  return slice;
};

export const initPieChart = (el: HTMLElement): PieECharts =>
  echartsCore.init(el);
