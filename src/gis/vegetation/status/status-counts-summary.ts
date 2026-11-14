import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { rememberAsync } from "../../../data/agri-persistent-cache";
import { escapeArcGIS } from "../../../data/agri-sql";
import { getAccessWhere } from "../../../shared/agri-access-config";
import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../../shared/agri-http";
import { getAgriServiceUrls } from "../../../shared/agri-service-urls";
import { agroV5Log } from "../../agri-debug-log";
import type { AgriAttributes } from "../../agri-layer-types";
import { translateAccessWhereForSummary } from "../veg-summary-series";
import type { VegetationStatusCount } from "../veg-base";
import type { VegetationLatestStatusCounts } from "./status-latest-window";

const ACCESS_NONE = "1=0";
const LOG_TOPIC = "agriVh";
const LOG_CACHE_NAMESPACE = "status-summary";
const LOG_WHERE_MAX = 160;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/**
 * Order assumed from VH_CATEGORIES (src/filter/localization/vh-constants.ts).
 * Must be confirmed against sample rows of agri_status_counts_year.
 */
export const STATUS_CODE_TO_NDVI_STATUS: Readonly<Record<number, string>> = {
  1: "juda_yaxshi",
  2: "yaxshi",
  3: "orta",
  4: "past",
};

export interface StatusCountsSummaryParams {
  year: number;
  region?: number;
  district?: number;
  cropIds?: string[];
}

function buildCropClause(cropIds: string[] | undefined): string | null {
  const ids = Array.from(
    new Set((cropIds ?? []).map((id) => String(id ?? "").trim()).filter(Boolean)),
  ).map((id) => `'${escapeArcGIS(id)}'`);
  if (ids.length === 0) return null;
  return ids.length === 1 ? `crop_id=${ids[0]}` : `crop_id IN (${ids.join(",")})`;
}

export function buildStatusCountsWhere(
  params: StatusCountsSummaryParams,
): string | null {
  const { year } = params;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) return null;
  const clauses: string[] = [`year = ${year}`];
  if (params.region != null) {
    clauses.push(`region_id='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district_id='${escapeArcGIS(String(params.district))}'`);
  }
  const crop = buildCropClause(params.cropIds);
  if (crop) clauses.push(crop);
  const main = clauses.join(" AND ");
  const access = translateAccessWhereForSummary(getAccessWhere());
  if (access === null) return null;
  if (access === ACCESS_NONE) return ACCESS_NONE;
  return access ? `(${access}) AND (${main})` : main;
}

export function mapStatusCountRows(rows: AgriAttributes[]): VegetationStatusCount[] {
  const unknownCodes: number[] = [];
  const mapped: VegetationStatusCount[] = [];
  for (const row of rows) {
    const code = Number(row.status_code);
    const status = STATUS_CODE_TO_NDVI_STATUS[code];
    if (!status) {
      unknownCodes.push(code);
      continue;
    }
    mapped.push({
      ndvi_status: status,
      count: Number(row.field_count_sum) || 0,
      areaHa: Number(row.area_ha_sum) || 0,
      uniqueIds: [],
    });
  }
  if (unknownCodes.length > 0) {
    agroV5Log("status-summary:unknown-codes", { codes: unknownCodes }, LOG_TOPIC);
  }
  return mapped;
}

export const statusCountsSummaryCache = new Map<
  string,
  Promise<VegetationLatestStatusCounts>
>();

const OUT_STATISTICS = JSON.stringify([
  { statisticType: "sum", onStatisticField: "area_ha", outStatisticFieldName: "area_ha_sum" },
  {
    statisticType: "sum",
    onStatisticField: "field_count",
    outStatisticFieldName: "field_count_sum",
  },
]);

async function fetchStatusCounts(where: string): Promise<VegetationLatestStatusCounts> {
  const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
  const res = await esriRequest(`${getAgriServiceUrls().statusCountsYearUrl}/query`, {
    query: {
      f: "json",
      where,
      groupByFieldsForStatistics: "status_code",
      outStatistics: OUT_STATISTICS,
      returnGeometry: false,
    },
    responseType: "json",
    timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
  });
  if (res?.data?.error) {
    throw new Error(String(res.data.error.message || "query error"));
  }
  const features: Array<{ attributes?: AgriAttributes }> = res?.data?.features ?? [];
  if (features.length === 0) throw new Error("no status rows");
  const rows = mapStatusCountRows(features.map((f) => f.attributes ?? {}));
  if (rows.length === 0) throw new Error("no mapped status rows");
  return { rows, startDate: "", endDate: "" };
}

export async function queryStatusCountsSummary(
  params: StatusCountsSummaryParams,
): Promise<VegetationLatestStatusCounts | null> {
  const where = buildStatusCountsWhere(params);
  if (where === null) return null;
  if (where === ACCESS_NONE) return { rows: [], startDate: "", endDate: "" };
  try {
    const result = await rememberAsync({
      memory: statusCountsSummaryCache,
      namespace: LOG_CACHE_NAMESPACE,
      key: where,
      factory: () => fetchStatusCounts(where),
    });
    const totalAreaHa = result.rows.reduce((sum, r) => sum + r.areaHa, 0);
    agroV5Log(
      "status-summary:ok",
      { rows: result.rows.length, totalAreaHa },
      LOG_TOPIC,
    );
    return result;
  } catch (err) {
    agroV5Log(
      "status-summary:fallback",
      {
        reason: err instanceof Error ? err.message : String(err),
        where: where.slice(0, LOG_WHERE_MAX),
      },
      LOG_TOPIC,
    );
    return null;
  }
}
