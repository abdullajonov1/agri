import {
  type VegetationStatusCountsParams,
  agriVegetationLog,
  resolveVegetationUniqueIdPageSize,
  VEG_STATUS_ROW_MAX_PAGES,
  queryVegFeatures,
  type VegQuery,
} from "../veg-base";
import { errorMessage } from "../../agri-layer-types";
import { buildCropClause } from "../veg-sql";
import { dateEqualsClause, escapeArcGIS } from "../../../data/agri-sql";
import { buildSpatialJoinWhere } from "../../agri-table-data-source";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";

export interface StatusVote {
  pxAll: number;
  rowCount: number;
}

export interface OneField {
  rawUniqueId: string;
  statuses: Map<string, StatusVote>;
}

export type VoteMap = Map<string, OneField>;

export interface SweepResult {
  byUniqueId: VoteMap;
  sourceRowCount: number;
  pagesFetched: number;
  truncated: boolean;
}

type VegLayer = Parameters<typeof queryVegFeatures>[0];
type Attributes = Record<string, unknown>;

/** Returns null when an explicit empty uniqueIds list means "no rows". */
export function buildStatusCountsWhere(
  params: VegetationStatusCountsParams,
): string | null {
  const clauses: string[] = [dateEqualsClause("raster_date", params.date)];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const cropClause = buildCropClause([
    ...(params.cropIds || []),
    params.cropId,
  ]);
  if (cropClause) clauses.push(cropClause);
  const farmerUniqueIds = Array.from(
    new Set(
      (params.uniqueIds || [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
  if (farmerUniqueIds.length) {
    clauses.push(buildSpatialJoinWhere(farmerUniqueIds));
  } else if (Array.isArray(params.uniqueIds) && params.uniqueIds.length === 0) {
    return null;
  }
  return clauses.join(" AND ");
}

/**
 * `uniqueid` is the stable polygon join key. ArcGIS' system GlobalID, when
 * present, identifies an individual table row and must not be preferred.
 */
export function resolveUniqueIdField(fields: readonly string[]): string | undefined {
  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  return (
    fieldByLower.get("uniqueid") ||
    fieldByLower.get("unique_id") ||
    fieldByLower.get("globalid") ||
    fieldByLower.get("global_id")
  );
}

export function readAttribute(attributes: Attributes, field: string): unknown {
  return (
    attributes?.[field] ??
    attributes?.[field.toLowerCase()] ??
    attributes?.[field.toUpperCase()]
  );
}

/** Adds one vote to the per-id map. `uniqueId` is lower-cased for the key. */
export function addVote(
  byUniqueId: VoteMap,
  rawUniqueId: string,
  status: string,
  rowCount: number,
  pxAll: number,
): void {
  const key = rawUniqueId.toLowerCase();
  const field = byUniqueId.get(key) || {
    rawUniqueId,
    statuses: new Map<string, StatusVote>(),
  };
  const vote = field.statuses.get(status) || { pxAll: 0, rowCount: 0 };
  vote.rowCount += rowCount;
  vote.pxAll = Math.max(vote.pxAll, pxAll);
  field.statuses.set(status, vote);
  byUniqueId.set(key, field);
}

function readIdAndStatus(
  attributes: Attributes,
  uniqueIdField: string,
): { rawUniqueId: string; status: string } | null {
  const rawUniqueId = readAttribute(attributes, uniqueIdField);
  if (rawUniqueId == null || String(rawUniqueId).trim() === "") return null;
  const status = String(readAttribute(attributes, "ndvi_status") || "")
    .trim()
    .toLowerCase();
  if (!status) return null;
  return { rawUniqueId: String(rawUniqueId).trim(), status };
}

function pageSignatureOf(features: Array<{ attributes?: unknown }>, uniqueIdField: string): string {
  const firstAttrs = (features[0]?.attributes || {}) as Attributes;
  const lastAttrs = (features[features.length - 1]?.attributes || {}) as Attributes;
  return `${String(readAttribute(firstAttrs, uniqueIdField) || "")}|${String(
    readAttribute(firstAttrs, "ndvi_status") || "",
  )}|${String(readAttribute(lastAttrs, uniqueIdField) || "")}|${String(
    readAttribute(lastAttrs, "ndvi_status") || "",
  )}`;
}

/**
 * Collapse duplicate raster rows on the ArcGIS server first: group by the
 * stable polygon id + status so only one compact vote row per pair is
 * transferred. May throw on services rejecting aggregated pagination.
 */
export async function sweepGroupedVotes(
  layer: VegLayer,
  where: string,
  uniqueIdField: string,
  pageSize: number,
): Promise<SweepResult> {
  const byUniqueId: VoteMap = new Map();
  let sourceRowCount = 0;
  let pagesFetched = 0;
  let truncated = false;
  const oidField = String(layer.objectIdField || "objectid");
  let offset = 0;
  let previousPageSignature = "";
  for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
    const query: VegQuery = layer.createQuery();
    query.where = where;
    query.groupByFieldsForStatistics = [uniqueIdField, "ndvi_status"];
    query.orderByFields = [`${uniqueIdField} ASC`, "ndvi_status ASC"];
    query.outFields = [uniqueIdField, "ndvi_status"];
    query.outStatistics = asStatisticDefinitions([
      {
        statisticType: "count",
        onStatisticField: oidField,
        outStatisticFieldName: "row_count",
      },
      {
        statisticType: "max",
        onStatisticField: "px_all",
        outStatisticFieldName: "max_px_all",
      },
    ]);
    query.returnGeometry = false;
    query.start = offset;
    query.resultOffset = offset;
    query.num = pageSize;
    query.resultRecordCount = pageSize;

    const result = await queryVegFeatures(layer, query);
    const features = result?.features ?? [];
    if (!features.length) break;
    pagesFetched += 1;

    const pageSignature = pageSignatureOf(features, uniqueIdField);
    if (page > 0 && pageSignature === previousPageSignature) {
      throw new Error("Vegetation grouped pagination did not advance.");
    }
    previousPageSignature = pageSignature;

    for (const feature of features) {
      const attributes = (feature?.attributes || {}) as Attributes;
      const parsed = readIdAndStatus(attributes, uniqueIdField);
      if (!parsed) continue;
      const rowCount = Math.max(1, Number(readAttribute(attributes, "row_count")) || 0);
      const pxAll = Number(readAttribute(attributes, "max_px_all")) || 0;
      sourceRowCount += rowCount;
      addVote(byUniqueId, parsed.rawUniqueId, parsed.status, rowCount, pxAll);
    }

    offset += features.length;
    if (features.length < pageSize) break;
    if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
  }
  return { byUniqueId, sourceRowCount, pagesFetched, truncated };
}

/** Exact raw-row fallback using an object-id cursor. */
export async function sweepRawVotes(
  layer: VegLayer,
  where: string,
  uniqueIdField: string,
  pageSize: number,
): Promise<SweepResult> {
  const byUniqueId: VoteMap = new Map();
  let sourceRowCount = 0;
  let pagesFetched = 0;
  let truncated = false;
  const oidField = String(layer.objectIdField || "objectid");
  let lastOid = -1;
  for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
    const query: VegQuery = layer.createQuery();
    query.where = lastOid < 0 ? where : `(${where}) AND ${oidField} > ${lastOid}`;
    query.orderByFields = [`${oidField} ASC`];
    query.outFields = [oidField, uniqueIdField, "ndvi_status", "px_all"];
    query.returnGeometry = false;
    query.num = pageSize;
    query.resultRecordCount = pageSize;

    const result = await queryVegFeatures(layer, query);
    const features = result?.features ?? [];
    if (!features.length) break;
    pagesFetched += 1;
    let pageMaxOid = lastOid;
    for (const feature of features) {
      const attributes = (feature?.attributes || {}) as Attributes;
      const oid = Number(readAttribute(attributes, oidField));
      if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
      const parsed = readIdAndStatus(attributes, uniqueIdField);
      if (!parsed) continue;
      const pxAll = Number(readAttribute(attributes, "px_all")) || 0;
      sourceRowCount += 1;
      addVote(byUniqueId, parsed.rawUniqueId, parsed.status, 1, pxAll);
    }
    if (!(pageMaxOid > lastOid)) {
      truncated = true;
      break;
    }
    lastOid = pageMaxOid;
    if (features.length < pageSize) break;
    if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
  }
  return { byUniqueId, sourceRowCount, pagesFetched, truncated };
}

/** Grouped sweep with a raw-row fallback for services rejecting it. */
export async function sweepVotes(
  layer: VegLayer,
  where: string,
  uniqueIdField: string,
): Promise<SweepResult> {
  const pageSize = resolveVegetationUniqueIdPageSize(layer);
  try {
    return await sweepGroupedVotes(layer, where, uniqueIdField, pageSize);
  } catch (groupedError) {
    // Older ArcGIS services can reject pagination on aggregated queries.
    agriVegetationLog("status-counts:grouped-fallback", {
      where,
      error: errorMessage(groupedError),
    });
    return sweepRawVotes(layer, where, uniqueIdField, pageSize);
  }
}

export interface AssignmentResult {
  byStatus: Map<string, { count: number; pxAll: number }>;
  assignedIdsByStatus: Map<string, string[]>;
  statusPairCount: number;
}

/** Majority status per id: rows, then px, then status name. */
export function assignStatuses(byUniqueId: VoteMap): AssignmentResult {
  const byStatus = new Map<string, { count: number; pxAll: number }>();
  const assignedIdsByStatus = new Map<string, string[]>();
  let statusPairCount = 0;
  for (const field of byUniqueId.values()) {
    const rankedStatuses = Array.from(field.statuses.entries()).sort(
      ([statusA, a], [statusB, b]) =>
        b.rowCount - a.rowCount || b.pxAll - a.pxAll || statusA.localeCompare(statusB),
    );
    statusPairCount += rankedStatuses.length;
    const assigned = rankedStatuses[0];
    if (!assigned) continue;
    const [status, vote] = assigned;
    const bucket = byStatus.get(status) || { count: 0, pxAll: 0 };
    bucket.count += 1;
    bucket.pxAll += vote.pxAll;
    byStatus.set(status, bucket);
    const ids = assignedIdsByStatus.get(status) || [];
    ids.push(field.rawUniqueId);
    assignedIdsByStatus.set(status, ids);
  }
  return { byStatus, assignedIdsByStatus, statusPairCount };
}
