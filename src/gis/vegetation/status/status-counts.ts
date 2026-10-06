import { type VegetationStatusCountsParams, type VegetationStatusCount, getAgriVegetationIndicesLayer, agriVegetationLog, vegetationStatusCountsCache, resolveVegetationUniqueIdPageSize, VEG_STATUS_ROW_MAX_PAGES, queryVegFeatures, vegetationAssignedUniqueIdsCache, VEG_PIXEL_AREA_HA, type VegQuery } from "../veg-base";
import { errorMessage } from "../../agri-layer-types";
import { dateEqualsClause, escapeArcGIS } from "../../../data/agri-sql";
import { buildSpatialJoinWhere } from "../../agri-table-data-source";

/**
 * Row counts grouped by ndvi_status for one date + region/district scope —
 * the data behind the "Vegetatsiya Holati" bar chart (Past/O'rta/Yaxshi/A'lo).
 */
export async function queryVegetationStatusCounts(
  params: VegetationStatusCountsParams,
): Promise<VegetationStatusCount[]> {
  const { layer, fields } = await getAgriVegetationIndicesLayer();

  const clauses: string[] = [dateEqualsClause("raster_date", params.date)];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const requestedCropIds = Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );
  if (requestedCropIds.length === 1) {
    clauses.push(`crop_id='${escapeArcGIS(requestedCropIds[0])}'`);
  } else if (requestedCropIds.length > 1) {
    clauses.push(
      `crop_id IN (${requestedCropIds
        .map((value) => `'${escapeArcGIS(value)}'`)
        .join(",")})`,
    );
  }
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
    return [];
  }
  const where = clauses.join(" AND ");

  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  // `uniqueid` is the stable polygon join key. ArcGIS' system GlobalID, when
  // present, identifies an individual table row and must not be preferred.
  const uniqueIdField =
    fieldByLower.get("uniqueid") ||
    fieldByLower.get("unique_id") ||
    fieldByLower.get("globalid") ||
    fieldByLower.get("global_id");
  if (!uniqueIdField) {
    agriVegetationLog("status-counts:FAILED-no-uniqueid-field", { fields });
    return [];
  }

  const cacheKey = `${where}|id=${uniqueIdField}`;
  const cached = vegetationStatusCountsCache.get(cacheKey);
  if (cached) return cached;

  const request = (async (): Promise<VegetationStatusCount[]> => {
    type OneField = {
      rawUniqueId: string;
      statuses: Map<string, { pxAll: number; rowCount: number }>;
    };
    const byUniqueId = new Map<string, OneField>();
    let sourceRowCount = 0;
    let pagesFetched = 0;
    let truncated = false;
    const oidField = String(layer.objectIdField || "objectid");

    const readAttribute = (
      attributes: Record<string, unknown>,
      field: string,
    ): unknown =>
      attributes?.[field] ??
      attributes?.[field.toLowerCase()] ??
      attributes?.[field.toUpperCase()];

    // Collapse duplicate raster rows on the ArcGIS server first. The old path
    // downloaded every raw row (hundreds of thousands nationwide, often 200+
    // pages) and only then deduplicated in the browser. Grouping by the stable
    // polygon id + status preserves the same majority-status rule while
    // transferring only one compact vote row per id/status pair.
    const pageSize = resolveVegetationUniqueIdPageSize(layer);
    try {
      let offset = 0;
      let previousPageSignature = "";
      for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
      const query: VegQuery = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = [uniqueIdField, "ndvi_status"];
      query.orderByFields = [`${uniqueIdField} ASC`, "ndvi_status ASC"];
      query.outFields = [uniqueIdField, "ndvi_status"];
      query.outStatistics = [
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
      ];
      query.returnGeometry = false;
      query.start = offset;
      query.resultOffset = offset;
      query.num = pageSize;
      query.resultRecordCount = pageSize;

      const result = await queryVegFeatures(layer, query);
      const features = result?.features ?? [];
      if (!features.length) break;
      pagesFetched += 1;

      const firstAttrs = (features[0]?.attributes || {}) as Record<string, unknown>;
      const lastAttrs = (features[features.length - 1]?.attributes || {}) as Record<
        string,
        unknown
      >;
      const pageSignature = `${String(readAttribute(firstAttrs, uniqueIdField) || "")}|${String(
        readAttribute(firstAttrs, "ndvi_status") || "",
      )}|${String(readAttribute(lastAttrs, uniqueIdField) || "")}|${String(
        readAttribute(lastAttrs, "ndvi_status") || "",
      )}`;
      if (page > 0 && pageSignature === previousPageSignature) {
        throw new Error("Vegetation grouped pagination did not advance.");
      }
      previousPageSignature = pageSignature;

      for (const feature of features) {
        const attributes = (feature?.attributes || {}) as Record<string, unknown>;
        const rawUniqueId = readAttribute(attributes, uniqueIdField);
        if (rawUniqueId == null || String(rawUniqueId).trim() === "") continue;
        const rawUniqueIdString = String(rawUniqueId).trim();
        const uniqueId = rawUniqueIdString.toLowerCase();
        const status = String(readAttribute(attributes, "ndvi_status") || "")
          .trim()
          .toLowerCase();
        if (!status) continue;
        const rowCount = Math.max(
          1,
          Number(readAttribute(attributes, "row_count")) || 0,
        );
        const pxAll = Number(readAttribute(attributes, "max_px_all")) || 0;
        sourceRowCount += rowCount;

        const field = byUniqueId.get(uniqueId) || {
          rawUniqueId: rawUniqueIdString,
          statuses: new Map<string, { pxAll: number; rowCount: number }>(),
        };
        const vote = field.statuses.get(status) || { pxAll: 0, rowCount: 0 };
        vote.rowCount += rowCount;
        vote.pxAll = Math.max(vote.pxAll, pxAll);
        field.statuses.set(status, vote);
        byUniqueId.set(uniqueId, field);
      }

      offset += features.length;
      if (features.length < pageSize) break;
        if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
      }
    } catch (groupedError) {
      // Older ArcGIS services can reject pagination on aggregated queries.
      // Keep an exact raw-row fallback so the widget still produces data on
      // those deployments instead of ending in a permanent empty state.
      agriVegetationLog("status-counts:grouped-fallback", {
        where,
        error: errorMessage(groupedError),
      });
      byUniqueId.clear();
      sourceRowCount = 0;
      pagesFetched = 0;
      truncated = false;
      let lastOid = -1;
      for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
        const query: VegQuery = layer.createQuery();
        query.where =
          lastOid < 0 ? where : `(${where}) AND ${oidField} > ${lastOid}`;
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
          const attributes = (feature?.attributes || {}) as Record<string, unknown>;
          const oid = Number(readAttribute(attributes, oidField));
          if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
          const rawUniqueId = readAttribute(attributes, uniqueIdField);
          if (rawUniqueId == null || String(rawUniqueId).trim() === "") continue;
          const rawUniqueIdString = String(rawUniqueId).trim();
          const uniqueId = rawUniqueIdString.toLowerCase();
          const status = String(readAttribute(attributes, "ndvi_status") || "")
            .trim()
            .toLowerCase();
          if (!status) continue;
          const pxAll = Number(readAttribute(attributes, "px_all")) || 0;
          sourceRowCount += 1;
          const field = byUniqueId.get(uniqueId) || {
            rawUniqueId: rawUniqueIdString,
            statuses: new Map<string, { pxAll: number; rowCount: number }>(),
          };
          const vote = field.statuses.get(status) || { pxAll: 0, rowCount: 0 };
          vote.rowCount += 1;
          vote.pxAll = Math.max(vote.pxAll, pxAll);
          field.statuses.set(status, vote);
          byUniqueId.set(uniqueId, field);
        }
        if (!(pageMaxOid > lastOid)) {
          truncated = true;
          break;
        }
        lastOid = pageMaxOid;
        if (features.length < pageSize) break;
        if (page === VEG_STATUS_ROW_MAX_PAGES - 1) truncated = true;
      }
    }

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
    // Only publish the id→status assignment when paging completed. A truncated
    // sweep would make queryVegetationUniqueIdsForStatus() serve a short list
    // from cache instead of running its own (deeper) query, so the VH map
    // filter would silently drop fields.
    if (truncated) {
      vegetationAssignedUniqueIdsCache.delete(cacheKey);
      agriVegetationLog("status-counts:assigned-cache-skipped-truncated", {
        where,
        uniqueIdCount: byUniqueId.size,
      });
    } else {
      vegetationAssignedUniqueIdsCache.set(cacheKey, assignedIdsByStatus);
    }

    const rows = Array.from(byStatus.entries()).map(([status, bucket]) => ({
      ndvi_status: status,
      count: bucket.count,
      areaHa: bucket.pxAll * VEG_PIXEL_AREA_HA,
      uniqueIds: assignedIdsByStatus.get(status) || [],
    }));
    agriVegetationLog("status-counts:deduplicated", {
      where,
      uniqueIdField,
      pagesFetched,
      sourceRowCount,
      uniqueIdCount: byUniqueId.size,
      duplicateSourceRowsRemoved: Math.max(0, sourceRowCount - byUniqueId.size),
      statusConflictRowsRemoved: Math.max(0, statusPairCount - byUniqueId.size),
      truncated,
      rows: rows.map((row) => ({
        ndvi_status: row.ndvi_status,
        count: row.count,
        areaHa: row.areaHa,
      })),
    });
    return rows;
  })();

  vegetationStatusCountsCache.set(cacheKey, request);
  while (vegetationStatusCountsCache.size > 64) {
    const oldestKey = vegetationStatusCountsCache.keys().next().value;
    if (!oldestKey) break;
    vegetationStatusCountsCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (error) {
    vegetationStatusCountsCache.delete(cacheKey);
    throw error;
  }
}
