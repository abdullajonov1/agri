/**
 * Distinct crop / region / district scans and MAX(raster_date) lookups on
 * agri_vegetation_indices (groupBy statistics, cached).
 */
import { getAgriVegetationIndicesLayer, queryVegFeatures, formatArcgisDateToYmd, agriVhLog, buildVegetationScopeClauses, vegetationDistinctCropIdsCache, vegetationDistinctRegionsCache, vegetationDistinctDistrictsCache, vegetationMaxRasterDateCache, vegetationMaxDateByRegionCache } from "./veg-base";
import { rememberAsync } from "../../data/agri-persistent-cache";
import { asStatisticDefinitions } from "../../shared/agri-plain-object";

/**
 * Distinct crop_id values in scope (year + optional region/district).
 * When `cropIds` is provided, returns only those that exist in the table.
 */
export async function queryVegetationDistinctCropIds(params: {
  region?: number;
  district?: number;
  year?: string;
  cropIds?: string[];
} = {}): Promise<string[]> {
  const requested = Array.from(
    new Set((params.cropIds || []).map((v) => String(v).trim()).filter(Boolean)),
  );
  const clauses = buildVegetationScopeClauses({
    region: params.region,
    district: params.district,
    year: params.year,
    cropIds: requested.length ? requested : undefined,
  });
  clauses.push("crop_id IS NOT NULL");
  const where = clauses.length ? clauses.join(" AND ") : "crop_id IS NOT NULL";
  const cacheKey = `v9-crop-ids|${where}`;

  return rememberAsync({
    memory: vegetationDistinctCropIdsCache,
    namespace: "veg-crop-ids",
    key: cacheKey,
    factory: async (): Promise<string[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const oidField = String(layer.objectIdField || "objectid");
      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = ["crop_id"];
      query.orderByFields = ["crop_id ASC"];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ]);
      query.returnGeometry = false;
      query.num = 500;
      const result = await queryVegFeatures(layer, query);
      const out: string[] = [];
      for (const feature of result?.features ?? []) {
        const cropId = String(
          feature?.attributes?.crop_id ?? "",
        ).trim();
        if (cropId) out.push(cropId);
      }
      return out;
    },
  });
}
/** Distinct region codes with vegetation rows in the selected year. */
export async function queryVegetationDistinctRegions(params: {
  year?: string;
} = {}): Promise<number[]> {
  const year = String(params.year || "").match(/\b(18|19|20)\d{2}\b/)?.[0];
  const cacheKey = year || "*";
  return rememberAsync({
    memory: vegetationDistinctRegionsCache,
    namespace: "veg-regions",
    key: cacheKey,
    factory: async (): Promise<number[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const oidField = String(layer.objectIdField || "objectid");
      const clauses = ["region IS NOT NULL"];
      if (year) {
        const nextYear = String(Number(year) + 1);
        clauses.push(
          `raster_date >= DATE '${year}-01-01' AND raster_date < DATE '${nextYear}-01-01'`,
        );
      }
      const query = layer.createQuery();
      query.where = clauses.join(" AND ");
      query.groupByFieldsForStatistics = ["region"];
      query.orderByFields = ["region ASC"];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ]);
      query.returnGeometry = false;
      query.num = 100;
      const result = await queryVegFeatures(layer, query);
      const out: number[] = [];
      for (const feature of result?.features ?? []) {
        const region = Number(feature?.attributes?.region);
        if (Number.isFinite(region)) out.push(region);
      }
      agriVhLog("distinct-regions", { year: year || null, regions: out });
      return out;
    },
  });
}
/** Distinct district codes for one region (+ optional crop/date window). */
export async function queryVegetationDistinctDistricts(params: {
  region: number;
  year?: string;
  cropId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<number[]> {
  const region = Number(params.region);
  if (!Number.isFinite(region)) return [];
  const clauses = buildVegetationScopeClauses({
    region,
    year: params.year,
    cropId: params.cropId,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  clauses.push("district IS NOT NULL");
  const where = clauses.join(" AND ");
  const cacheKey = `v9-districts|${where}`;
  return rememberAsync({
    memory: vegetationDistinctDistrictsCache,
    namespace: "veg-districts",
    key: cacheKey,
    factory: async (): Promise<number[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const oidField = String(layer.objectIdField || "objectid");
      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = ["district"];
      query.orderByFields = ["district ASC"];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ]);
      query.returnGeometry = false;
      query.num = 200;
      const result = await queryVegFeatures(layer, query);
      const out: number[] = [];
      for (const feature of result?.features ?? []) {
        const district = Number(feature?.attributes?.district);
        if (Number.isFinite(district)) out.push(district);
      }
      return out;
    },
  });
}
/**
 * Latest raster_date (YYYY-MM-DD) for one crop in scope.
 * `endDateCap` clamps the result (ndviDateLocked window end).
 */
export async function queryVegetationMaxRasterDate(params: {
  region?: number;
  district?: number;
  year?: string;
  /** When omitted, max date is for the whole region/district scope. */
  cropId?: string;
  endDateCap?: string;
}): Promise<string | null> {
  const cropId = String(params.cropId || "").trim();
  const cap = String(params.endDateCap || "").trim();
  const clauses = buildVegetationScopeClauses({
    region: params.region,
    district: params.district,
    year: params.year,
    cropId: cropId || undefined,
  });
  if (cap && /^\d{4}-\d{2}-\d{2}$/.test(cap)) {
    const capParts = cap.split("-").map((p) => parseInt(p, 10));
    const next = new Date(
      Date.UTC(capParts[0], capParts[1] - 1, capParts[2] + 1),
    );
    const nextYmd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
    clauses.push(`raster_date < DATE '${nextYmd}'`);
  }
  clauses.push("raster_date IS NOT NULL");
  const where = clauses.length ? clauses.join(" AND ") : "raster_date IS NOT NULL";
  const cacheKey = `v9e-max-date|${where}`;

  return rememberAsync({
    memory: vegetationMaxRasterDateCache,
    namespace: "veg-max-date",
    key: cacheKey,
    factory: async (): Promise<string | null> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const query = layer.createQuery();
      query.where = where;
      query.returnGeometry = false;
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ]);
      const result = await queryVegFeatures(layer, query);
      const raw =
        result?.features?.[0]?.attributes?.max_raster_date ??
        result?.features?.[0]?.attributes?.raster_date;
      return formatArcgisDateToYmd(raw);
    },
  });
}
/**
 * One round-trip: MAX(raster_date) per region for a year (republic VH prefetch).
 */
export async function queryVegetationMaxRasterDateByRegion(params: {
  year: string;
  endDateCap?: string;
}): Promise<Map<number, string>> {
  const year = String(params.year || "").match(/\b(18|19|20)\d{2}\b/)?.[0];
  if (!year) return new Map();
  const cap = String(params.endDateCap || "").trim();
  const cacheKey = `v9g-max-by-region|${year}|${cap}`;

  return rememberAsync({
    memory: vegetationMaxDateByRegionCache,
    namespace: "veg-max-date-by-region",
    key: cacheKey,
    factory: async (): Promise<Map<number, string>> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const nextYear = String(Number(year) + 1);
      const clauses = [
        "region IS NOT NULL",
        "raster_date IS NOT NULL",
        `raster_date >= DATE '${year}-01-01' AND raster_date < DATE '${nextYear}-01-01'`,
      ];
      if (cap && /^\d{4}-\d{2}-\d{2}$/.test(cap)) {
        const capParts = cap.split("-").map((p) => parseInt(p, 10));
        const next = new Date(
          Date.UTC(capParts[0], capParts[1] - 1, capParts[2] + 1),
        );
        const nextYmd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
        clauses.push(`raster_date < DATE '${nextYmd}'`);
      }
      const query = layer.createQuery();
      query.where = clauses.join(" AND ");
      query.groupByFieldsForStatistics = ["region"];
      query.orderByFields = ["region ASC"];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ]);
      query.returnGeometry = false;
      query.num = 100;
      const result = await queryVegFeatures(layer, query);
      const out = new Map<number, string>();
      for (const feature of result?.features ?? []) {
        const attrs = feature?.attributes || {};
        const region = Number(attrs.region);
        const ymd = formatArcgisDateToYmd(
          attrs.max_raster_date ?? attrs.raster_date,
        );
        if (!Number.isFinite(region) || !ymd) continue;
        out.set(region, ymd);
      }
      agriVhLog("max-date-by-region", {
        year,
        cap: cap || null,
        regions: Array.from(out.entries()).map(([region, maxDate]) => ({
          region,
          maxDate,
        })),
      });
      return out;
    },
  });
}
