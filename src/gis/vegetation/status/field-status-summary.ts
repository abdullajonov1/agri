import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { rememberAsync } from "../../../data/agri-persistent-cache";
import { escapeArcGIS } from "../../../data/agri-sql";
import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../../shared/agri-http";
import { getAgriServiceUrls } from "../../../shared/agri-service-urls";
import { agroV5Log } from "../../agri-debug-log";
import type { AgriAttributes } from "../../agri-layer-types";
import { combineWithSummaryAccess } from "../veg-summary-series";
import { STATUS_CODE_TO_NDVI_STATUS } from "./status-counts-summary";

const ACCESS_NONE = "1=0";
const LOG_TOPIC = "agriVh";
const LOG_CACHE_NAMESPACE = "veg-field-status-ids";
const LOG_WHERE_MAX = 160;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const PAGE_SIZE = 2000;
const MAX_PAGES = 100;

export interface FieldStatusUniqueIdsParams {
  year: number;
  region?: number;
  district?: number;
  cropIds?: string[];
  ndviStatus: string;
}

export const fieldStatusIdsCache = new Map<string, Promise<string[]>>();

function statusToCode(ndviStatus: string): number | null {
  const wanted = String(ndviStatus ?? "").trim().toLowerCase();
  for (const [code, name] of Object.entries(STATUS_CODE_TO_NDVI_STATUS)) {
    if (name === wanted) return Number(code);
  }
  return null;
}

function buildCropClause(cropIds: string[] | undefined): string | null {
  const ids = Array.from(
    new Set((cropIds ?? []).map((id) => String(id ?? "").trim()).filter(Boolean)),
  ).map((id) => `'${escapeArcGIS(id)}'`);
  if (ids.length === 0) return null;
  return ids.length === 1 ? `crop_id=${ids[0]}` : `crop_id IN (${ids.join(",")})`;
}

function buildFieldStatusWhere(params: FieldStatusUniqueIdsParams): string | null {
  const { year } = params;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) return null;
  const code = statusToCode(params.ndviStatus);
  if (code === null) return null;
  const clauses: string[] = [`year = ${year}`, `status_code = ${code}`];
  if (params.region != null) {
    clauses.push(`region_id='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district_id='${escapeArcGIS(String(params.district))}'`);
  }
  const crop = buildCropClause(params.cropIds);
  if (crop) clauses.push(crop);
  return combineWithSummaryAccess(clauses.join(" AND "));
}

const idKey = (value: string): string => value.replace(/[{}]/g, "").toLowerCase();

async function fetchFieldStatusIds(where: string): Promise<string[]> {
  const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
  const url = `${getAgriServiceUrls().fieldStatusYearUrl}/query`;
  const seen = new Map<string, string>();
  let lastObjectId = -1;
  let pages = 0;
  let isLastPage = false;
  while (!isLastPage && pages < MAX_PAGES) {
    const res = await esriRequest(url, {
      query: {
        f: "json",
        where: `(${where}) AND objectid > ${lastObjectId}`,
        outFields: "uniqueid,objectid",
        orderByFields: "objectid ASC",
        resultRecordCount: PAGE_SIZE,
        returnGeometry: false,
      },
      responseType: "json",
      timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
    });
    if (res?.data?.error) {
      throw new Error(String(res.data.error.message || "query error"));
    }
    const features: Array<{ attributes?: AgriAttributes }> = res?.data?.features ?? [];
    pages += 1;
    for (const f of features) {
      const raw = String(f.attributes?.uniqueid ?? "").trim();
      if (raw && !seen.has(idKey(raw))) seen.set(idKey(raw), raw);
      const oid = Number(f.attributes?.objectid);
      if (Number.isFinite(oid) && oid > lastObjectId) lastObjectId = oid;
    }
    isLastPage = features.length < PAGE_SIZE;
  }
  if (!isLastPage) agroV5Log("field-status:truncated", { pages }, LOG_TOPIC);
  agroV5Log("field-status:ok", { count: seen.size, pages }, LOG_TOPIC);
  return Array.from(seen.values());
}

export async function queryFieldStatusUniqueIds(
  params: FieldStatusUniqueIdsParams,
): Promise<string[] | null> {
  const where = buildFieldStatusWhere(params);
  if (where === null) return null;
  if (where === ACCESS_NONE) return [];
  try {
    return await rememberAsync({
      memory: fieldStatusIdsCache,
      namespace: LOG_CACHE_NAMESPACE,
      key: where,
      ttlMs: 0,
      factory: () => fetchFieldStatusIds(where),
    });
  } catch (err) {
    agroV5Log(
      "field-status:fallback",
      {
        reason: err instanceof Error ? err.message : String(err),
        where: where.slice(0, LOG_WHERE_MAX),
      },
      LOG_TOPIC,
    );
    return null;
  }
}
