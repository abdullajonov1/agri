import type { IndicatorWidgetHost } from "../../indicator-host";
import type { IndicatorConfig } from "../../widget";
import { formatIndicatorStatValue } from "../../../../../data/agri-dashboard-pack-apply";
import {
  firstValuePerGroup,
  labelGroupRows,
  mapRowsToEnumCategories,
  resolveDisplayGroupValue,
  sumGroupValues,
  toGroupKey,
  type IndicatorAggregateOp,
  type IndicatorGroupResult,
  type IndicatorGroupRow,
} from "./indicator-group-rows";

const GROUPED_STATS_MAX_ROWS = 2000;
const GROUPED_FIRST_MAX_ROWS = 3000;

const readIndicatorConfig = (host: IndicatorWidgetHost): IndicatorConfig =>
  (host.props.config || {}) as IndicatorConfig;

/** WHERE suffix that drops zero / null values when excludeZeroValues is on. */
const buildNonZeroSuffix = (
  host: IndicatorWidgetHost,
  cfg: IndicatorConfig,
  statOp: IndicatorAggregateOp,
  valueField: string,
): string => {
  if (!cfg.excludeZeroValues) return "";
  let suffix = "";
  const attributeField = (cfg.attributeField || "").trim();
  if (statOp === "count" && attributeField) {
    suffix += ` AND ${host.nz(attributeField)}`;
  }
  if (statOp !== "count" && valueField && valueField !== "*") {
    suffix += ` AND ${host.nz(valueField)}`;
  }
  return suffix;
};

const commitGroupResults = (
  host: IndicatorWidgetHost,
  requestId: number,
  results: IndicatorGroupResult[],
  displayKey: IndicatorConfig["displayGroupValue"],
): void => {
  const total = sumGroupValues(results);
  const displayVal = resolveDisplayGroupValue(results, displayKey, total);

  if (!host._isMounted || requestId !== host._requestId) return;

  host.setState({
    groupResults: results,
    vegetationArea: displayVal,
    totalArea: total,
    loading: false,
    lastUpdate: new Date(),
    error: null,
  });
};

export async function fetchGroupedStats(host: IndicatorWidgetHost): Promise<void> {
  const { featureLayer, connectionStatus } = host.state;
  const cfg = readIndicatorConfig(host);

  const groupField = (cfg.groupByField || "").trim();
  const statOp = cfg.statOperation || "count";
  const valueField = cfg.attributeField || "*";
  const outName = cfg.outStatName || "agg";

  if (!featureLayer || connectionStatus !== "connected" || !groupField) {
    return host.fetchData();
  }

  if (statOp === "first") {
    return host.fetchGroupedFirst(
      featureLayer,
      groupField,
      valueField,
      outName,
    );
  }

  const requestId = ++host._requestId;

  host.setState({
    loading: host.state.vegetationArea == null,
    error: null,
  });

  const baseWhere = host.buildWhereClause();

  const oidField = featureLayer.objectIdField || "objectid";
  const outStatistics: __esri.StatisticDefinitionProperties[] = [
    {
      onStatisticField: statOp === "count" ? oidField : valueField,
      statisticType: statOp,
      outStatisticFieldName: outName,
    },
  ];
  const nonZeroSuffix = buildNonZeroSuffix(host, cfg, statOp, valueField);

  let nonNullWhere = `${baseWhere} AND ${groupField} IS NOT NULL${nonZeroSuffix}`;
  if (cfg.excludeZeroValues) {
    nonNullWhere += ` AND ${groupField} <> 0 AND ${groupField} <> '0'`;
  }

  const qGrouped = featureLayer.createQuery();
  qGrouped.where = nonNullWhere;
  qGrouped.groupByFieldsForStatistics = [groupField];
  qGrouped.set("outStatistics", outStatistics);
  qGrouped.returnGeometry = false;
  qGrouped.num = GROUPED_STATS_MAX_ROWS;

  const grouped = await featureLayer.queryFeatures(qGrouped);
  if (!host._isMounted || requestId !== host._requestId) return;
  const rows: IndicatorGroupRow[] = (grouped?.features || []).map((feature) => {
    const attributes = (feature?.attributes || {}) as Record<string, unknown>;
    return {
      key: toGroupKey(attributes[groupField]),
      value: Number(attributes[outName] ?? 0),
    };
  });

  if (cfg.includeNullCategory) {
    const qNull = featureLayer.createQuery();
    qNull.where = `${baseWhere} AND ${groupField} IS NULL${nonZeroSuffix}`;
    qNull.set("outStatistics", outStatistics);
    qNull.returnGeometry = false;
    qNull.num = 1;

    const nullRes = await featureLayer.queryFeatures(qNull);
    if (!host._isMounted || requestId !== host._requestId) return;
    const nullAttributes = (nullRes?.features?.[0]?.attributes || {}) as Record<string, unknown>;
    rows.push({ key: null, value: Number(nullAttributes[outName] ?? 0) });
  }

  const isEnumMode =
    (cfg.categoryMode || "AUTO") === "ENUM" &&
    Array.isArray(cfg.enumCategories) &&
    cfg.enumCategories.length > 0;
  const final = isEnumMode
    ? mapRowsToEnumCategories(rows, cfg.enumCategories)
    : labelGroupRows(rows, host.labelNoValue());

  const dp = Number(cfg.decimalPlaces || 0);
  const rounded = final.map((row) => ({
    ...row,
    value: formatIndicatorStatValue(row.value, dp),
  }));

  commitGroupResults(host, requestId, rounded, cfg.displayGroupValue);
}

export async function fetchGroupedFirst(host: IndicatorWidgetHost, featureLayer: __esri.FeatureLayer, groupField: string, valueField: string, _outName: string): Promise<void> {
  const cfg = readIndicatorConfig(host);

  const requestId = ++host._requestId;

  host.setState({ loading: true, error: null });

  const baseWhere = host.buildWhereClause();
  const nonZeroSuffix =
    cfg.excludeZeroValues && valueField ? ` AND ${host.nz(valueField)}` : "";

  const q = featureLayer.createQuery();
  q.where = `${baseWhere} AND ${groupField} IS NOT NULL${nonZeroSuffix}`;
  q.outFields = [groupField, valueField];
  q.orderByFields = [`${groupField} ASC`];
  q.returnGeometry = false;
  q.num = GROUPED_FIRST_MAX_ROWS;

  const res = await featureLayer.queryFeatures(q);
  if (!host._isMounted || requestId !== host._requestId) return;

  const rows = firstValuePerGroup(
    (res?.features || []).map(
      (feature) => feature?.attributes as Record<string, unknown> | undefined,
    ),
    groupField,
    valueField,
  );

  if (cfg.includeNullCategory) {
    const qNull = featureLayer.createQuery();
    qNull.where = `${baseWhere} AND ${groupField} IS NULL${nonZeroSuffix}`;
    qNull.outFields = [valueField];
    qNull.returnGeometry = false;
    qNull.num = 1;

    const resNull = await featureLayer.queryFeatures(qNull);
    if (!host._isMounted || requestId !== host._requestId) return;

    const nullAttributes = (resNull?.features?.[0]?.attributes || {}) as Record<string, unknown>;
    const v = Number(nullAttributes[valueField] ?? 0);
    rows.push({ key: null, value: Number.isFinite(v) ? v : 0 });
  }

  const dp = Number(cfg.decimalPlaces || 0);
  const final = labelGroupRows(rows, host.labelNoValue()).map((row) => ({
    ...row,
    value: formatIndicatorStatValue(row.value, dp),
  }));

  commitGroupResults(host, requestId, final, cfg.displayGroupValue);
}
