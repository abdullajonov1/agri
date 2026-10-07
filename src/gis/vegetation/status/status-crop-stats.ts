import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { type VegetationCropBreakdownParams, type VegetationCropBreakdownRow, getAgriVegetationIndicesLayer, buildVegetationCropScopeWhere, vegetationCropStatsCache, VEG_CROP_STATS_MAX_ROWS, queryVegFeatures, VEG_PIXEL_AREA_HA, agriVegetationLog, type VegQuery } from "../veg-base";

/**
 * Crop mix for one VH status + date + region/district in a single grouped
 * stats query (groupBy crop_id, sum px_all).
 *
 * Same tradeoff as queryVegetationStatusCountsByStatus: duplicate raster rows
 * for one uniqueid are summed instead of majority-voted, so these totals match
 * the Vegetatsiya Holati bar buckets exactly. The uniqueid-level variant below
 * groups by a very high cardinality field and needs dozens of pages per
 * viloyat, which left the Ekin Turi panel loading for minutes.
 */
export async function queryVegetationCropStatsForStatus(
  params: VegetationCropBreakdownParams,
): Promise<VegetationCropBreakdownRow[]> {
  const status = String(params.ndviStatus || "")
    .trim()
    .toLowerCase();
  if (!status || !params.date) return [];

  const { layer, fields } = await getAgriVegetationIndicesLayer();
  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  const cropIdField =
    fieldByLower.get("crop_id") || fieldByLower.get("cropid") || "crop_id";
  const oidField = String(layer.objectIdField || "objectid");
  const where = buildVegetationCropScopeWhere(params, status);
  const cacheKey = `crop-stats|${where}|crop=${cropIdField}|oid=${oidField}`;
  const cached = vegetationCropStatsCache.get(cacheKey);
  if (cached) return cached;

  const request = (async (): Promise<VegetationCropBreakdownRow[]> => {
    const query: VegQuery = layer.createQuery();
    query.where = where;
    query.groupByFieldsForStatistics = [cropIdField];
    query.orderByFields = [`${cropIdField} ASC`];
    query.outFields = [cropIdField];
    query.outStatistics = asStatisticDefinitions([
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
    ]);
    query.returnGeometry = false;
    query.num = VEG_CROP_STATS_MAX_ROWS;
    query.resultRecordCount = VEG_CROP_STATS_MAX_ROWS;

    const result = await queryVegFeatures(layer, query);
    const readAttribute = (
      attributes: Record<string, unknown>,
      field: string,
    ): unknown =>
      attributes?.[field] ??
      attributes?.[field.toLowerCase()] ??
      attributes?.[field.toUpperCase()];

    const rows: VegetationCropBreakdownRow[] = [];
    for (const feature of result?.features ?? []) {
      const attributes = (feature?.attributes || {}) as Record<string, unknown>;
      const cropId = String(readAttribute(attributes, cropIdField) || "").trim();
      if (!cropId) continue;
      const fieldCount = Math.max(
        0,
        Number(readAttribute(attributes, "row_count")) || 0,
      );
      const pxAll = Math.max(
        0,
        Number(readAttribute(attributes, "sum_px_all")) || 0,
      );
      if (fieldCount <= 0 && pxAll <= 0) continue;
      rows.push({
        cropId,
        areaHa: pxAll * VEG_PIXEL_AREA_HA,
        fieldCount,
      });
    }

    agriVegetationLog("crop-stats:done", {
      where,
      cropIdField,
      // rawFeatureCount > rowCount means groups were dropped because
      // crop_id is null/empty in agri_vegetation_indices for this scope.
      rawFeatureCount: (result?.features ?? []).length,
      rowCount: rows.length,
    });
    return rows;
  })();

  vegetationCropStatsCache.set(cacheKey, request);
  while (vegetationCropStatsCache.size > 64) {
    const oldestKey = vegetationCropStatsCache.keys().next().value;
    if (!oldestKey) break;
    vegetationCropStatsCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (error) {
    vegetationCropStatsCache.delete(cacheKey);
    throw error;
  }
}
