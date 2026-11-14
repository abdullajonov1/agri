import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { rememberAsync } from "../../data/agri-persistent-cache";
import { escapeArcGIS, isExactArcGisYmd } from "../../data/agri-sql";
import { getAccessWhere } from "../../shared/agri-access-config";
import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../shared/agri-http";
import { getAgriServiceUrls } from "../../shared/agri-service-urls";
import { agroV5Log } from "../agri-debug-log";
import type { AgriAttributes, AgriStatisticJson } from "../agri-layer-types";
import {
  formatArcgisDateToYmd,
  type VegetationRegionalTimeseriesParams,
  type VegetationSeriesRow,
} from "./veg-base";

export const SUMMARY_INDEX_KEYS = [
  "ndvi",
  "savi",
  "rvi",
  "ci",
  "evi",
  "ndwi",
  "ndre",
] as const;

const ACCESS_ALL = "1=1";
const ACCESS_NONE = "1=0";
const LOG_TOPIC = "agriVh";
const LOG_CACHE_NAMESPACE = "veg-summary";
const LOG_WHERE_MAX = 160;
const SQL_LITERAL_RE = /'(?:[^']|'')*'/g;
const IDENTIFIER_RE = /[A-Za-z_][A-Za-z0-9_]*/g;
const RENAMED_FIELDS: Readonly<Record<string, string>> = {
  region: "region_id",
  district: "district_id",
};
const ALLOWED_WORDS: ReadonlySet<string> = new Set([
  "crop_id",
  "raster_date",
  "year",
  "region_id",
  "district_id",
  "and",
  "or",
  "not",
  "in",
  "between",
  "like",
  "null",
  "is",
  "true",
  "false",
  "date",
]);

export function translateAccessWhereForSummary(access: string): string | null {
  const text = String(access ?? "").trim();
  if (!text || text === ACCESS_ALL) return "";
  if (text === ACCESS_NONE) return ACCESS_NONE;
  const blanked = text.replace(SQL_LITERAL_RE, (m) => `'${" ".repeat(m.length - 2)}'`);
  let result = "";
  let cursor = 0;
  for (const match of blanked.matchAll(IDENTIFIER_RE)) {
    const word = match[0].toLowerCase();
    const renamed = RENAMED_FIELDS[word];
    if (!renamed && !ALLOWED_WORDS.has(word)) return null;
    const start = match.index ?? 0;
    result += text.slice(cursor, start) + (renamed ?? match[0]);
    cursor = start + match[0].length;
  }
  return result + text.slice(cursor);
}

function buildCropClause(params: VegetationRegionalTimeseriesParams): string | null {
  const ids = Array.from(
    new Set(
      [...(params.cropIds ?? []), params.cropId]
        .map((id) => String(id ?? "").trim())
        .filter(Boolean),
    ),
  ).map((id) => `'${escapeArcGIS(id)}'`);
  if (ids.length === 0) return null;
  return ids.length === 1 ? `crop_id=${ids[0]}` : `crop_id IN (${ids.join(",")})`;
}

export function buildSummaryWhere(
  params: VegetationRegionalTimeseriesParams,
): string | null {
  const { startDate, endDate } = params;
  if (params.ndviStatus) return null;
  if (!isExactArcGisYmd(startDate) || !isExactArcGisYmd(endDate)) return null;
  const clauses: string[] = [];
  if (params.region != null) {
    clauses.push(`region_id='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district_id='${escapeArcGIS(String(params.district))}'`);
  }
  const crop = buildCropClause(params);
  if (crop) clauses.push(crop);
  clauses.push(
    `raster_date >= DATE '${startDate}' AND raster_date <= DATE '${endDate}'`,
    "valid_fields > 0",
  );
  return combineWithSummaryAccess(clauses.join(" AND "));
}

export function combineWithSummaryAccess(main: string): string | null {
  const access = translateAccessWhereForSummary(getAccessWhere());
  if (access === null) return null;
  if (access === ACCESS_NONE) return ACCESS_NONE;
  return access ? `(${access}) AND (${main})` : main;
}

export function buildSummaryOutStatistics(): AgriStatisticJson[] {
  const stats: AgriStatisticJson[] = SUMMARY_INDEX_KEYS.flatMap((k) => [
    {
      statisticType: "sum",
      onStatisticField: `${k}_avg * valid_fields`,
      outStatisticFieldName: `wsum_${k}`,
    },
    {
      statisticType: "sum",
      onStatisticField: `valid_fields + ${k}_avg * 0`,
      outStatisticFieldName: `w_${k}`,
    },
    {
      statisticType: "min",
      onStatisticField: `${k}_min`,
      outStatisticFieldName: `min_${k}`,
    },
    {
      statisticType: "max",
      onStatisticField: `${k}_max`,
      outStatisticFieldName: `max_${k}`,
    },
  ]);
  return [
    ...stats,
    {
      statisticType: "sum",
      onStatisticField: "valid_fields",
      outStatisticFieldName: "polygon_count",
    },
  ];
}

const dateKey = (row: VegetationSeriesRow): number => {
  const v = row.date;
  return typeof v === "number" ? v : Date.parse(String(v)) || 0;
};

export function mapSummaryRows(rows: AgriAttributes[]): VegetationSeriesRow[] {
  const mapped = rows.map((row) => {
    const out: VegetationSeriesRow = {
      date: row.raster_date,
      polygon_count: Number(row.polygon_count) || 0,
    };
    for (const k of SUMMARY_INDEX_KEYS) {
      const wsum = Number(row[`wsum_${k}`]);
      const w = Number(row[`w_${k}`]);
      out[k] = w > 0 && Number.isFinite(wsum) ? wsum / w : null;
      out[`${k}_min`] = row[`min_${k}`] ?? null;
      out[`${k}_max`] = row[`max_${k}`] ?? null;
    }
    return out;
  });
  return [...mapped].sort((a, b) => dateKey(a) - dateKey(b));
}

export const vegetationSummaryTimeseriesCache = new Map<
  string,
  Promise<VegetationSeriesRow[]>
>();

async function fetchSummaryRows(where: string): Promise<VegetationSeriesRow[]> {
  const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
  const res = await esriRequest(`${getAgriServiceUrls().indexDailySummaryUrl}/query`, {
    query: {
      f: "json",
      where,
      groupByFieldsForStatistics: "raster_date",
      orderByFields: "raster_date ASC",
      outStatistics: JSON.stringify(buildSummaryOutStatistics()),
      returnGeometry: false,
    },
    responseType: "json",
    timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
  });
  if (res?.data?.error) {
    throw new Error(String(res.data.error.message || "query error"));
  }
  const features: Array<{ attributes?: AgriAttributes }> = res?.data?.features ?? [];
  if (features.length === 0) throw new Error("no summary rows");
  return mapSummaryRows(features.map((f) => f.attributes ?? {}));
}

export async function queryIndexSummaryTimeseries(
  params: VegetationRegionalTimeseriesParams,
): Promise<VegetationSeriesRow[] | null> {
  const where = buildSummaryWhere(params);
  if (where === null) return null;
  if (where === ACCESS_NONE) return [];
  try {
    const rows = await rememberAsync({
      memory: vegetationSummaryTimeseriesCache,
      namespace: LOG_CACHE_NAMESPACE,
      key: where,
      factory: () => fetchSummaryRows(where),
    });
    agroV5Log("summary:ok", { rows: rows.length }, LOG_TOPIC);
    return rows;
  } catch (err) {
    agroV5Log(
      "summary:fallback",
      {
        reason: err instanceof Error ? err.message : String(err),
        where: where.slice(0, LOG_WHERE_MAX),
      },
      LOG_TOPIC,
    );
    return null;
  }
}

export const vegetationSummaryDatesCache = new Map<string, Promise<string[]>>();

function buildSummaryDatesWhere(params: { region?: number; district?: number }): string | null {
  const clauses: string[] = [];
  if (params.region != null) {
    clauses.push(`region_id='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district_id='${escapeArcGIS(String(params.district))}'`);
  }
  clauses.push("valid_fields > 0");
  return combineWithSummaryAccess(clauses.join(" AND "));
}

async function fetchSummaryDates(where: string): Promise<string[]> {
  const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
  const res = await esriRequest(`${getAgriServiceUrls().indexDailySummaryUrl}/query`, {
    query: {
      f: "json",
      where,
      groupByFieldsForStatistics: "raster_date",
      orderByFields: "raster_date ASC",
      outStatistics: JSON.stringify([
        {
          statisticType: "count",
          onStatisticField: "valid_fields",
          outStatisticFieldName: "cnt",
        },
      ]),
      returnGeometry: false,
    },
    responseType: "json",
    timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
  });
  if (res?.data?.error) {
    throw new Error(String(res.data.error.message || "query error"));
  }
  const features: Array<{ attributes?: AgriAttributes }> = res?.data?.features ?? [];
  const dates = new Set<string>();
  for (const f of features) {
    const ymd = formatArcgisDateToYmd(f.attributes?.raster_date);
    if (ymd) dates.add(ymd);
  }
  if (dates.size === 0) throw new Error("no summary dates");
  return Array.from(dates).sort();
}

export async function queryIndexSummaryAvailableDates(params: {
  region?: number;
  district?: number;
}): Promise<string[] | null> {
  const where = buildSummaryDatesWhere(params);
  if (where === null) return null;
  if (where === ACCESS_NONE) return [];
  try {
    const dates = await rememberAsync({
      memory: vegetationSummaryDatesCache,
      namespace: "veg-summary-dates",
      key: where,
      factory: () => fetchSummaryDates(where),
    });
    agroV5Log("summary-dates:ok", { count: dates.length }, LOG_TOPIC);
    return dates;
  } catch (err) {
    agroV5Log(
      "summary-dates:fallback",
      {
        reason: err instanceof Error ? err.message : String(err),
        where: where.slice(0, LOG_WHERE_MAX),
      },
      LOG_TOPIC,
    );
    return null;
  }
}
