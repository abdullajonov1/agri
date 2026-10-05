import { type VegetationStatusCountsParams, type VegetationStatusCount, buildVegetationStatusWhere, vegetationStatusStatsCache, getAgriVegetationIndicesLayer, queryVegFeatures, VEG_PIXEL_AREA_HA, agriVegetationLog } from "../veg-base";
import { rememberAsync } from "../../../data/agri-persistent-cache";

/**
 * Lightweight VH totals for republic overview: ONE grouped stats query per
 * region/date (groupBy ndvi_status). No uniqueid paging, no uniqueIds list.
 *
 * Tradeoff vs queryVegetationStatusCounts: duplicate raster rows for the same
 * uniqueid can inflate area/fieldCount slightly. Callers that need exact
 * majority-vote semantics (viloyat/tuman + map uniqueid filter) must keep
 * using queryVegetationStatusCounts.
 */
export async function queryVegetationStatusCountsByStatus(
  params: VegetationStatusCountsParams,
): Promise<VegetationStatusCount[]> {
  const date = String(params.date || "").trim();
  if (!date) return [];

  const where = buildVegetationStatusWhere(params);
  // oid field is stable on this service; keep key small for persist.
  const cacheKey = `status-stats|${where}`;
  const promise = rememberAsync({
    memory: vegetationStatusStatsCache,
    namespace: "veg-status-stats",
    key: cacheKey,
    factory: async (): Promise<VegetationStatusCount[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const oidField = String(layer.objectIdField || "objectid");
      const query: any = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = ["ndvi_status"];
      query.orderByFields = ["ndvi_status ASC"];
      query.outFields = ["ndvi_status"];
      query.outStatistics = [
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "row_count",
        },
        {
          statisticType: "sum",
          onStatisticField: "px_all",
          outStatisticFieldName: "sum_px_all",
        },
      ];
      query.returnGeometry = false;
      // Status cardinality is tiny (4 buckets); one page is enough.
      query.num = 50;
      query.resultRecordCount = 50;

      const result = await queryVegFeatures(layer, query);
      const readAttribute = (
        attributes: Record<string, unknown>,
        field: string,
      ): unknown =>
        attributes?.[field] ??
        attributes?.[field.toLowerCase()] ??
        attributes?.[field.toUpperCase()];

      const rows: VegetationStatusCount[] = [];
      for (const feature of result?.features ?? []) {
        const attributes = (feature?.attributes || {}) as Record<
          string,
          unknown
        >;
        const status = String(readAttribute(attributes, "ndvi_status") || "")
          .trim()
          .toLowerCase();
        if (!status) continue;
        const count = Math.max(
          0,
          Number(readAttribute(attributes, "row_count")) || 0,
        );
        const pxAll = Math.max(
          0,
          Number(readAttribute(attributes, "sum_px_all")) || 0,
        );
        if (count <= 0 && pxAll <= 0) continue;
        rows.push({
          ndvi_status: status,
          count,
          areaHa: pxAll * VEG_PIXEL_AREA_HA,
          uniqueIds: [],
        });
      }

      agriVegetationLog("status-counts:by-status", {
        where,
        rowCount: rows.length,
        rows: rows.map((row) => ({
          ndvi_status: row.ndvi_status,
          count: row.count,
          areaHa: row.areaHa,
        })),
      });
      return rows;
    },
  });
  while (vegetationStatusStatsCache.size > 64) {
    const oldestKey = vegetationStatusStatsCache.keys().next().value;
    if (!oldestKey) break;
    vegetationStatusStatsCache.delete(oldestKey);
  }
  return promise;
}
