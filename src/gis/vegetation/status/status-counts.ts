import { vegAccessCacheTag, type VegetationStatusCountsParams, type VegetationStatusCount, getAgriVegetationIndicesLayer, agriVegetationLog, vegetationStatusCountsCache, vegetationAssignedUniqueIdsCache, VEG_PIXEL_AREA_HA } from "../veg-base";
import {
  assignStatuses,
  buildStatusCountsWhere,
  resolveUniqueIdField,
  sweepVotes,
} from "./status-counts-steps";

const MAX_STATUS_COUNTS_CACHE_ENTRIES = 64;

/**
 * Row counts grouped by ndvi_status for one date + region/district scope —
 * the data behind the "Vegetatsiya Holati" bar chart (Past/O'rta/Yaxshi/A'lo).
 */
export async function queryVegetationStatusCounts(
  params: VegetationStatusCountsParams,
): Promise<VegetationStatusCount[]> {
  const { layer, fields } = await getAgriVegetationIndicesLayer();

  const where = buildStatusCountsWhere(params);
  if (where === null) return [];

  const uniqueIdField = resolveUniqueIdField(fields);
  if (!uniqueIdField) {
    agriVegetationLog("status-counts:FAILED-no-uniqueid-field", { fields });
    return [];
  }

  const cacheKey = `${where}|id=${uniqueIdField}${vegAccessCacheTag()}`;
  const cached = vegetationStatusCountsCache.get(cacheKey);
  if (cached) return cached;

  const request = (async (): Promise<VegetationStatusCount[]> => {
    const { byUniqueId, sourceRowCount, pagesFetched, truncated } =
      await sweepVotes(layer, where, uniqueIdField);
    const { byStatus, assignedIdsByStatus, statusPairCount } =
      assignStatuses(byUniqueId);

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
  while (vegetationStatusCountsCache.size > MAX_STATUS_COUNTS_CACHE_ENTRIES) {
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
