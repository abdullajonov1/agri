import { vegetationSeriesByUniqueIdCache, getAgriVegetationIndicesLayer, queryVegFeatures, type VegetationRegionalTimeseriesParams, agriVegetationLog, VEG_AVG_FIELDS, vegetationRegionalTimeseriesCache, type VegetationScopeParams, vegetationAvailableDatesCache, formatArcgisDateToYmd, type VegetationLatestDateByRegion, vegetationLatestDatesByRegionCache, agriVhLog, type VegetationSeriesRow, type VegetationPolygonSeriesRow } from "./veg-base";
import { escapeArcGIS } from "../../data/agri-sql";
import { rememberAsync } from "../../data/agri-persistent-cache";
import type { AgriAttributes, AgriStatisticJson } from "../agri-layer-types";
import { asStatisticDefinitions } from "../../shared/agri-plain-object";

/*
 * Vegetation index series + date lookups. Distinct-value / max-date scans
 * live in veg-distinct, uniqueid NDVI averages in veg-avg-ndvi; both are
 * re-exported here so the historical import path keeps working.
 */
export { queryVegetationDistinctCropIds, queryVegetationDistinctRegions, queryVegetationDistinctDistricts, queryVegetationMaxRasterDate, queryVegetationMaxRasterDateByRegion } from "./veg-distinct";
export { queryVegetationAvgNdviByUniqueIdPaged, queryVegetationAvgNdviByUniqueIdOnce } from "./veg-avg-ndvi";

/**
 * One polygon's full vegetation index time series, ordered by date —
 * mirrors the shape previously returned by GET /api/v1/vegetation/uniqueid/{id}.
 */
export async function queryVegetationSeriesForUniqueId(
  uniqueId: string,
): Promise<VegetationPolygonSeriesRow[]> {
  const raw = String(uniqueId ?? "").trim();
  if (!raw) return [];

  const clean = raw.replace(/[{}]/g, "");
  const cacheKey = clean || raw;
  const cached = vegetationSeriesByUniqueIdCache.get(cacheKey);
  if (cached) return cached;

  const request = (async () => {
    const variants = Array.from(
      new Set(
        [raw, clean, clean ? `{${clean}}` : ""]
          .map((v) => String(v || "").trim())
          .filter(Boolean),
      ),
    );

    const { layer } = await getAgriVegetationIndicesLayer();
    // One query with OR — avoids sequential empty round-trips on brace mismatch.
    const query = layer.createQuery();
    query.where = variants
      .map((candidate) => `uniqueid='${escapeArcGIS(candidate)}'`)
      .join(" OR ");
    query.outFields = ["*"];
    query.returnGeometry = false;
    query.orderByFields = ["raster_date ASC"];
    query.num = 2000;

    const result = await queryVegFeatures(layer, query);
    return (result?.features ?? []).map((f) => ({
      ...(f.attributes || {}),
    }));
  })();

  vegetationSeriesByUniqueIdCache.set(cacheKey, request);
  while (vegetationSeriesByUniqueIdCache.size > 64) {
    const oldestKey = vegetationSeriesByUniqueIdCache.keys().next().value;
    if (!oldestKey) break;
    vegetationSeriesByUniqueIdCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (err) {
    vegetationSeriesByUniqueIdCache.delete(cacheKey);
    throw err;
  }
}
/**
 * Regional (aggregate) vegetation index time series — mean of every index
 * per raster_date, across every polygon matching region/district/date
 * range. Mirrors the shape previously returned by
 * GET /api/v1/vegetation/regional/timeseries: rows keyed by `date` plus the
 * bare index names (ndvi, savi, ...) and `polygon_count`.
 *
 * Requires a date window — never runs as `1=1` over the full history table.
 */
export async function queryVegetationRegionalTimeseries(
  params: VegetationRegionalTimeseriesParams,
): Promise<VegetationSeriesRow[]> {
  if (!params.startDate || !params.endDate) {
    agriVegetationLog("regionalTimeseries:SKIP-no-date-window", {
      region: params.region ?? null,
      district: params.district ?? null,
    });
    return [];
  }

  const avgFields = (
    params.avgFields?.length ? params.avgFields : VEG_AVG_FIELDS
  ).filter((field) => VEG_AVG_FIELDS.includes(field));
  const fieldsForStats = avgFields.length ? avgFields : VEG_AVG_FIELDS;

  const clauses: string[] = [];
  if (params.region != null) {
    clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  if (params.ndviStatus) {
    clauses.push(
      `ndvi_status='${escapeArcGIS(String(params.ndviStatus))}'`,
    );
  }
  clauses.push(
    `raster_date >= DATE '${params.startDate}' AND raster_date <= DATE '${params.endDate}'`,
  );
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
  const where = clauses.join(" AND ");
  const cacheKey = `${where}|avg=${fieldsForStats.join(",")}`;
  return rememberAsync({
    memory: vegetationRegionalTimeseriesCache,
    namespace: "veg-regional",
    key: cacheKey,
    factory: async () => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = ["raster_date"];
      query.orderByFields = ["raster_date ASC"];
      query.outStatistics = asStatisticDefinitions([
        ...fieldsForStats.map((field): AgriStatisticJson => ({
          statisticType: "avg",
          onStatisticField: field,
          outStatisticFieldName: `avg_${field}`,
        })),
        {
          statisticType: "count",
          onStatisticField: "objectid",
          outStatisticFieldName: "polygon_count",
        },
      ]);
      query.returnGeometry = false;

      const result = await queryVegFeatures(layer, query);
      const rows = (result?.features ?? []).map(
        (feature): AgriAttributes => feature.attributes || {},
      );
      return rows.map((row) => {
        const normalized: VegetationSeriesRow = {
          date: row.raster_date,
          polygon_count: row.polygon_count ?? 0,
        };
        for (const field of VEG_AVG_FIELDS) {
          const avgKey = `avg_${field}`;
          if (Object.prototype.hasOwnProperty.call(row, avgKey)) {
            normalized[field] = row[avgKey];
          } else if (field.endsWith("_min") || field.endsWith("_max")) {
            // Core-field queries omit min/max — collapse band to the mean.
            const base = field.replace(/_(min|max)$/, "");
            normalized[field] = row[`avg_${base}`] ?? null;
          } else {
            normalized[field] = null;
          }
        }
        return normalized;
      });
    },
  });
}
export async function queryVegetationAvailableDates(
  params: VegetationScopeParams = {},
): Promise<string[]> {
  const cacheKey = `r=${params.region ?? ""}|d=${params.district ?? ""}`;
  const promise = rememberAsync({
    memory: vegetationAvailableDatesCache,
    namespace: "veg-dates",
    key: cacheKey,
    factory: async (): Promise<string[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();

      const clauses: string[] = [];
      if (params.region != null) {
        clauses.push(`region='${escapeArcGIS(String(params.region))}'`);
      }
      if (params.district != null) {
        clauses.push(`district='${escapeArcGIS(String(params.district))}'`);
      }
      const where = clauses.length ? clauses.join(" AND ") : "1=1";

      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = ["raster_date"];
      query.orderByFields = ["raster_date ASC"];
      query.outStatistics = asStatisticDefinitions([
        {
          statisticType: "count",
          onStatisticField: "objectid",
          outStatisticFieldName: "cnt",
        },
      ]);
      query.returnGeometry = false;

      const result = await queryVegFeatures(layer, query);
      const dateSet = new Set<string>();
      for (const feature of result?.features ?? []) {
        const ymd = formatArcgisDateToYmd(
          feature?.attributes?.raster_date,
        );
        if (ymd) dateSet.add(ymd);
      }
      return Array.from(dateSet).sort();
    },
  });
  while (vegetationAvailableDatesCache.size > 32) {
    const oldestKey = vegetationAvailableDatesCache.keys().next().value;
    if (!oldestKey) break;
    vegetationAvailableDatesCache.delete(oldestKey);
  }
  return promise;
}
/**
 * Latest available vegetation date for every region that has data.
 * Republic-wide VH uses this instead of one global latest date: satellite
 * coverage dates differ by region, so a global latest date can contain only
 * one region and undercount the rest of Uzbekistan.
 */
export async function queryVegetationLatestDatesByRegion(
  params: { year?: string } = {},
): Promise<VegetationLatestDateByRegion[]> {
  const year = String(params.year || "").match(/\b(18|19|20)\d{2}\b/)?.[0];
  // v2: MAX(raster_date) per region (1 row/viloyat). Old groupBy(region,date)
  // + num cap silently dropped newest days and undercounted republic VH.
  const cacheKey = `v2-max|${year || "*"}`;

  const promise = rememberAsync({
    memory: vegetationLatestDatesByRegionCache,
    namespace: "veg-latest-by-region",
    key: cacheKey,
    factory: async (): Promise<VegetationLatestDateByRegion[]> => {
      const { layer } = await getAgriVegetationIndicesLayer();
      const clauses: string[] = [
        "region IS NOT NULL",
        "raster_date IS NOT NULL",
      ];
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
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ]);
      query.returnGeometry = false;
      query.num = 100;

      const result = await queryVegFeatures(layer, query);
      const latestDates: VegetationLatestDateByRegion[] = [];
      for (const feature of result?.features ?? []) {
        const attributes = feature?.attributes || {};
        const region = Number(attributes.region);
        const date = formatArcgisDateToYmd(
          attributes.max_raster_date ?? attributes.raster_date,
        );
        if (!Number.isFinite(region) || !date) continue;
        latestDates.push({ region, date });
      }
      latestDates.sort((a, b) => a.region - b.region);

      agriVhLog("latest-dates-by-region", {
        year: year || null,
        regionCount: latestDates.length,
        latestDates,
        algo: "max-raster-date-per-region",
      });
      return latestDates;
    },
  });
  while (vegetationLatestDatesByRegionCache.size > 4) {
    const oldestKey = vegetationLatestDatesByRegionCache.keys().next().value;
    if (!oldestKey) break;
    vegetationLatestDatesByRegionCache.delete(oldestKey);
  }
  return promise;
}
