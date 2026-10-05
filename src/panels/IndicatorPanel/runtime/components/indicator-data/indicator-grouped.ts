import type { IndicatorWidgetHost } from "../../indicator-host";
import type { IndicatorConfig } from "../../widget";
import { formatIndicatorStatValue } from "../../../../../data/agri-dashboard-pack-apply";

export async function fetchGroupedStats(host: IndicatorWidgetHost): Promise<void> {
  const { featureLayer, connectionStatus } = host.state;
  const cfg = (host.props.config || {}) as IndicatorConfig;

  const groupField = (cfg.groupByField || "").trim();
  const statOp = (cfg.statOperation ||
    "count") as IndicatorConfig["statOperation"];
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
  const onField = statOp === "count" ? oidField : valueField;
  const outStatistics = [
    {
      onStatisticField: onField,
      statisticType: (
        {
          count: "count",
          sum: "sum",
          avg: "avg",
          min: "min",
          max: "max",
        } as any
      )[statOp],
      outStatisticFieldName: outName,
    },
  ] as any;

  let nonNullWhere = `${baseWhere} AND ${groupField} IS NOT NULL`;

  if (cfg.excludeZeroValues) {
    if (statOp === "count" && (cfg.attributeField || "").trim()) {
      nonNullWhere += ` AND ${host.nz((cfg.attributeField as string).trim())}`;
    }
    if (statOp !== "count" && valueField && valueField !== "*") {
      nonNullWhere += ` AND ${host.nz(valueField)}`;
    }
    nonNullWhere += ` AND ${groupField} <> 0 AND ${groupField} <> '0'`;
  }

  const qGrouped = featureLayer.createQuery();
  qGrouped.where = nonNullWhere;
  (qGrouped as any).groupByFieldsForStatistics = [groupField];
  qGrouped.outStatistics = outStatistics as any;
  qGrouped.returnGeometry = false;
  (qGrouped as any).num = 2000;

  const grouped = await featureLayer.queryFeatures(qGrouped);
  if (!host._isMounted || requestId !== host._requestId) return;
  const rows: Array<{ key: string | number; value: number }> = (
    grouped?.features || []
  ).map((f: any) => {
    const d = f?.attributes as Record<string, any>;
    return { key: d[groupField], value: Number(d[outName] ?? 0) };
  });

  if (cfg.includeNullCategory) {
    let whereNull = `${baseWhere} AND ${groupField} IS NULL`;
    if (cfg.excludeZeroValues) {
      if (statOp === "count" && (cfg.attributeField || "").trim()) {
        whereNull += ` AND ${host.nz((cfg.attributeField as string).trim())}`;
      }
      if (statOp !== "count" && valueField && valueField !== "*") {
        whereNull += ` AND ${host.nz(valueField)}`;
      }
    }

    const qNull = featureLayer.createQuery();
    qNull.where = whereNull;
    qNull.outStatistics = outStatistics as any;
    qNull.returnGeometry = false;
    (qNull as any).num = 1;

    const nullRes = await featureLayer.queryFeatures(qNull);
    if (!host._isMounted || requestId !== host._requestId) return;
    const nullVal = Number(
      nullRes?.features?.[0]?.attributes?.[outName] ?? 0,
    );
    rows.push({ key: null as any, value: nullVal });
  }

  let final: Array<{ key: any; label: string; value: number }>;

  if (
    (cfg.categoryMode || "AUTO") === "ENUM" &&
    Array.isArray(cfg.enumCategories) &&
    cfg.enumCategories.length
  ) {
    const asMap = new Map<any, number>();
    rows.forEach((r) => {
      const k = r.key == null ? null : String(r.key);
      asMap.set(k, (asMap.get(k) || 0) + r.value);
    });

    final = cfg.enumCategories.map((c) => {
      const k = c.value == null ? null : String(c.value);
      return {
        key: c.value,
        label: c.label,
        value: Number(asMap.get(k) || 0),
      };
    });
  } else {
    final = rows
      .sort((a, b) => {
        if (a.key == null && b.key == null) return 0;
        if (a.key == null) return -1;
        if (b.key == null) return 1;
        return String(a.key).localeCompare(String(b.key), undefined, {
          numeric: true,
        });
      })
      .map((r) => ({
        key: r.key,
        label: r.key == null ? host.labelNoValue() : String(r.key),
        value: r.value,
      }));
  }

  const dp = Number(cfg.decimalPlaces || 0);
  const rounded = final.map((x) => ({
    ...x,
    value: formatIndicatorStatValue(x.value, dp),
  }));

  const total = rounded.reduce(
    (s, r) => s + (isNaN(r.value) ? 0 : r.value),
    0,
  );

  const displayKey = cfg.displayGroupValue as any;
  const displayVal =
    displayKey !== undefined
      ? (rounded.find(
          (r) =>
            (r.key == null && displayKey == null) ||
            String(r.key) === String(displayKey),
        )?.value ?? 0)
      : total;

  if (!host._isMounted || requestId !== host._requestId) return;

  host.setState({
    groupResults: rounded,
    vegetationArea: displayVal,
    totalArea: total,
    loading: false,
    lastUpdate: new Date(),
    error: null,
  });
}
export async function fetchGroupedFirst(host: IndicatorWidgetHost, featureLayer: __esri.FeatureLayer, groupField: string, valueField: string, _outName: string): Promise<void> {
  const cfg = (host.props.config || {}) as IndicatorConfig;

  const requestId = ++host._requestId;

  host.setState({ loading: true, error: null });

  const baseWhere = host.buildWhereClause();

  let where1 = `${baseWhere} AND ${groupField} IS NOT NULL`;
  if (cfg.excludeZeroValues && valueField)
    where1 += ` AND ${host.nz(valueField)}`;

  const q = featureLayer.createQuery();
  q.where = where1;
  q.outFields = [groupField, valueField];
  q.orderByFields = [`${groupField} ASC`];
  q.returnGeometry = false;
  (q as any).num = 3000;

  const res = await featureLayer.queryFeatures(q);
  if (!host._isMounted || requestId !== host._requestId) return;

  const firstMap = new Map<any, number>();
  for (const f of res?.features || []) {
    const d = f?.attributes as any;
    const k = d[groupField];
    if (!firstMap.has(k)) firstMap.set(k, Number(d[valueField]));
  }

  const rows: Array<{ key: any; value: number }> = Array.from(
    firstMap.entries(),
  ).map(([key, v]) => ({
    key,
    value: Number.isFinite(Number(v)) ? Number(v) : 0,
  }));

  if (cfg.includeNullCategory) {
    let whereNull = `${baseWhere} AND ${groupField} IS NULL`;
    if (cfg.excludeZeroValues && valueField)
      whereNull += ` AND ${host.nz(valueField)}`;

    const qNull = featureLayer.createQuery();
    qNull.where = whereNull;
    qNull.outFields = [valueField];
    qNull.returnGeometry = false;
    (qNull as any).num = 1;

    const resNull = await featureLayer.queryFeatures(qNull);
    if (!host._isMounted || requestId !== host._requestId) return;

    const v = Number(resNull?.features?.[0]?.attributes?.[valueField] ?? 0);
    rows.push({ key: null as any, value: Number.isFinite(v) ? v : 0 });
  }

  const dp = Number(cfg.decimalPlaces || 0);
  const final = rows
    .sort((a, b) => {
      if (a.key == null && b.key == null) return 0;
      if (a.key == null) return -1;
      if (b.key == null) return 1;
      return String(a.key).localeCompare(String(b.key), undefined, {
        numeric: true,
      });
    })
    .map((r) => ({
      key: r.key,
      label: r.key == null ? host.labelNoValue() : String(r.key),
      value: formatIndicatorStatValue(r.value, dp),
    }));

  const total = final.reduce((s, r) => s + (isNaN(r.value) ? 0 : r.value), 0);
  const displayKey = cfg.displayGroupValue as any;
  const displayVal =
    displayKey !== undefined
      ? (final.find(
          (r) =>
            (r.key == null && displayKey == null) ||
            String(r.key) === String(displayKey),
        )?.value ?? 0)
      : total;

  if (!host._isMounted || requestId !== host._requestId) return;

  host.setState({
    groupResults: final,
    vegetationArea: displayVal,
    totalArea: total,
    loading: false,
    lastUpdate: new Date(),
    error: null,
  });
}
