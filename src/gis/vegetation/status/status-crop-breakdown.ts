import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import { type VegetationCropBreakdownParams, type VegetationCropBreakdownRow, buildVegetationCropScopeWhere, vegetationCropBreakdownCache, getAgriVegetationIndicesLayer, VEG_STATUS_ROW_MAX_PAGES, VEG_STATUS_ROW_PAGE_SIZE, queryVegFeatures, agriVegetationLog, VEG_PIXEL_AREA_HA, type VegQuery } from "../veg-base";

/**
 * Crop mix (by crop_id) for one VH status + date + region/district — same
 * source as the Vegetatsiya Holati bar. Exact per-uniqueid variant kept as the
 * fallback for services that reject grouped stats on crop_id.
 */
export async function queryVegetationCropBreakdownForStatus(
  params: VegetationCropBreakdownParams,
): Promise<VegetationCropBreakdownRow[]> {
  const status = String(params.ndviStatus || "")
    .trim()
    .toLowerCase();
  if (!status || !params.date) return [];

  const where = buildVegetationCropScopeWhere(params, status);
  const cacheKey = where;
  const cached = vegetationCropBreakdownCache.get(cacheKey);
  if (cached) return cached;

  const request = (async (): Promise<VegetationCropBreakdownRow[]> => {
    const { layer, fields } = await getAgriVegetationIndicesLayer();
    const fieldByLower = new Map(
      fields.map((field) => [String(field).toLowerCase(), String(field)]),
    );
    const uniqueIdField =
      fieldByLower.get("uniqueid") ||
      fieldByLower.get("unique_id") ||
      fieldByLower.get("globalid") ||
      fieldByLower.get("global_id");
    const cropIdField =
      fieldByLower.get("crop_id") || fieldByLower.get("cropid") || "crop_id";
    if (!uniqueIdField) return [];

    type FieldCrop = { cropId: string; pxAll: number };
    const byUniqueId = new Map<string, FieldCrop>();

    const readAttribute = (
      attributes: Record<string, unknown>,
      field: string,
    ): unknown =>
      attributes?.[field] ??
      attributes?.[field.toLowerCase()] ??
      attributes?.[field.toUpperCase()];

    let offset = 0;
    let previousPageSignature = "";
    for (let page = 0; page < VEG_STATUS_ROW_MAX_PAGES; page++) {
      const query: VegQuery = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = [uniqueIdField, cropIdField];
      query.orderByFields = [`${uniqueIdField} ASC`, `${cropIdField} ASC`];
      query.outFields = [uniqueIdField, cropIdField];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "max",
          onStatisticField: "px_all",
          outStatisticFieldName: "max_px_all",
        },
      ]);
      query.returnGeometry = false;
      query.start = offset;
      query.resultOffset = offset;
      query.num = VEG_STATUS_ROW_PAGE_SIZE;
      query.resultRecordCount = VEG_STATUS_ROW_PAGE_SIZE;

      const result = await queryVegFeatures(layer, query);
      const features = result?.features ?? [];
      if (!features.length) break;

      const firstAttrs = (features[0]?.attributes || {}) as Record<
        string,
        unknown
      >;
      const lastAttrs = (features[features.length - 1]?.attributes ||
        {}) as Record<string, unknown>;
      const pageSignature = [
        String(readAttribute(firstAttrs, uniqueIdField) || ""),
        String(readAttribute(firstAttrs, cropIdField) || ""),
        String(readAttribute(lastAttrs, uniqueIdField) || ""),
        String(readAttribute(lastAttrs, cropIdField) || ""),
      ].join("|");
      // Some services ignore resultOffset on aggregated queries and keep
      // re-serving page 1. Stop with partial data instead of repeating the
      // same expensive page for every remaining slot.
      if (page > 0 && pageSignature === previousPageSignature) {
        agriVegetationLog("crop-breakdown:pagination-stalled", {
          where,
          page,
          collected: byUniqueId.size,
        });
        break;
      }
      previousPageSignature = pageSignature;

      for (const feature of features) {
        const attributes = (feature?.attributes || {}) as Record<
          string,
          unknown
        >;
        const rawUniqueId = readAttribute(attributes, uniqueIdField);
        if (rawUniqueId == null || String(rawUniqueId).trim() === "") continue;
        const uniqueId = String(rawUniqueId).trim().toLowerCase();
        const cropId = String(readAttribute(attributes, cropIdField) || "")
          .trim();
        if (!cropId) continue;
        const pxAll = Number(readAttribute(attributes, "max_px_all")) || 0;
        const prev = byUniqueId.get(uniqueId);
        if (!prev || pxAll > prev.pxAll) {
          byUniqueId.set(uniqueId, { cropId, pxAll });
        }
      }

      offset += features.length;
      if (features.length < VEG_STATUS_ROW_PAGE_SIZE) break;
    }

    const byCrop = new Map<string, { areaHa: number; fieldCount: number }>();
    for (const entry of byUniqueId.values()) {
      const bucket = byCrop.get(entry.cropId) || {
        areaHa: 0,
        fieldCount: 0,
      };
      bucket.fieldCount += 1;
      bucket.areaHa += entry.pxAll * VEG_PIXEL_AREA_HA;
      byCrop.set(entry.cropId, bucket);
    }

    return Array.from(byCrop.entries())
      .map(([cropId, stats]) => ({
        cropId,
        areaHa: stats.areaHa,
        fieldCount: stats.fieldCount,
      }))
      .filter((row) => row.areaHa > 0 || row.fieldCount > 0);
  })();

  vegetationCropBreakdownCache.set(cacheKey, request);
  while (vegetationCropBreakdownCache.size > 64) {
    const oldestKey = vegetationCropBreakdownCache.keys().next().value;
    if (!oldestKey) break;
    vegetationCropBreakdownCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (err) {
    vegetationCropBreakdownCache.delete(cacheKey);
    throw err;
  }
}
