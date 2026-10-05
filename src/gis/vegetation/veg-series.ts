import { vegetationSeriesByUniqueIdCache, getAgriVegetationIndicesLayer, queryVegFeatures, type VegetationRegionalTimeseriesParams, agriVegetationLog, VEG_AVG_FIELDS, vegetationRegionalTimeseriesCache, type VegetationScopeParams, vegetationAvailableDatesCache, formatArcgisDateToYmd, type VegetationLatestDateByRegion, vegetationLatestDatesByRegionCache, agriVhLog, buildVegetationScopeClauses, vegetationDistinctCropIdsCache, vegetationDistinctRegionsCache, vegetationDistinctDistrictsCache, vegetationMaxRasterDateCache, vegetationMaxDateByRegionCache, type VegetationAvgNdviUniqueRow, vegetationAvgNdviOidCursorCache, VEG_PIXEL_AREA_HA, vegetationAvgNdviByUniqueIdCache } from "./veg-base";
import { escapeArcGIS } from "../../data/agri-sql";
import { rememberAsync } from "../../data/agri-persistent-cache";

/**
 * One polygon's full vegetation index time series, ordered by date —
 * mirrors the shape previously returned by GET /api/v1/vegetation/uniqueid/{id}.
 */
export async function queryVegetationSeriesForUniqueId(
  uniqueId: string,
): Promise<Array<Record<string, any>>> {
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
    return (result?.features ?? []).map((f: any) => ({
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
): Promise<Array<Record<string, any>>> {
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
      query.outStatistics = [
        ...fieldsForStats.map((field) => ({
          statisticType: "avg",
          onStatisticField: field,
          outStatisticFieldName: `avg_${field}`,
        })),
        {
          statisticType: "count",
          onStatisticField: "objectid",
          outStatisticFieldName: "polygon_count",
        },
      ] as any;
      query.returnGeometry = false;

      const result = await queryVegFeatures(layer, query);
      const rows = (result?.features ?? []).map((feature: any) =>
        feature.attributes || {},
      );
      return rows.map((row: any) => {
        const normalized: Record<string, any> = {
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
      query.outStatistics = [
        {
          statisticType: "count",
          onStatisticField: "objectid",
          outStatisticFieldName: "cnt",
        },
      ] as any;
      query.returnGeometry = false;

      const result = await queryVegFeatures(layer, query);
      const dateSet = new Set<string>();
      for (const feature of result?.features ?? []) {
        const ymd = formatArcgisDateToYmd(
          (feature as any)?.attributes?.raster_date,
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
      query.outStatistics = [
        {
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = 100;

      const result = await queryVegFeatures(layer, query);
      const latestDates: VegetationLatestDateByRegion[] = [];
      for (const feature of result?.features ?? []) {
        const attributes = (feature as any)?.attributes || {};
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
      query.outStatistics = [
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = 500;
      const result = await queryVegFeatures(layer, query);
      const out: string[] = [];
      for (const feature of result?.features ?? []) {
        const cropId = String(
          (feature as any)?.attributes?.crop_id ?? "",
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
      query.outStatistics = [
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = 100;
      const result = await queryVegFeatures(layer, query);
      const out: number[] = [];
      for (const feature of result?.features ?? []) {
        const region = Number((feature as any)?.attributes?.region);
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
      query.outStatistics = [
        {
          statisticType: "count",
          onStatisticField: oidField,
          outStatisticFieldName: "cnt",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = 200;
      const result = await queryVegFeatures(layer, query);
      const out: number[] = [];
      for (const feature of result?.features ?? []) {
        const district = Number((feature as any)?.attributes?.district);
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
      query.outStatistics = [
        {
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ] as any;
      const result = await queryVegFeatures(layer, query);
      const raw =
        (result?.features?.[0] as any)?.attributes?.max_raster_date ??
        (result?.features?.[0] as any)?.attributes?.raster_date;
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
      query.outStatistics = [
        {
          statisticType: "max",
          onStatisticField: "raster_date",
          outStatisticFieldName: "max_raster_date",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = 100;
      const result = await queryVegFeatures(layer, query);
      const out = new Map<number, string>();
      for (const feature of result?.features ?? []) {
        const attrs = (feature as any)?.attributes || {};
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
/**
 * Continue groupBy stats after the first truncated page.
 * Fan out by uniqueid hex prefix (16 shards in parallel) — sgm ignores
 * resultOffset, so sequential uniqueid > lastId alone is too slow.
 */
export async function queryVegetationAvgNdviByUniqueIdPaged(params: {
  region: number;
  district?: number;
  cropIds?: string[];
  startDate: string;
  endDate: string;
  seedRows: VegetationAvgNdviUniqueRow[];
  pageSize: number;
}): Promise<VegetationAvgNdviUniqueRow[]> {
  const clauses = buildVegetationScopeClauses({
    region: params.region,
    district: params.district,
    cropIds: params.cropIds,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  clauses.push("uniqueid IS NOT NULL");
  clauses.push("ndvi IS NOT NULL");
  const baseWhere = clauses.join(" AND ");
  const cacheKey = `v9h-avg-ndvi-paged|${baseWhere}`;

  return rememberAsync({
    memory: vegetationAvgNdviOidCursorCache,
    namespace: "veg-avg-ndvi-paged",
    key: cacheKey,
    // Full uniqueid pages are large — memory-only (avoid truncated localStorage).
    ttlMs: 0,
    factory: async (): Promise<VegetationAvgNdviUniqueRow[]> => {
      const { layer, fields } = await getAgriVegetationIndicesLayer();
      const fieldByLower = new Map(
        (fields || []).map((f) => [String(f).toLowerCase(), String(f)]),
      );
      const uniqueIdField =
        fieldByLower.get("uniqueid") ||
        fieldByLower.get("unique_id") ||
        fieldByLower.get("globalid") ||
        "uniqueid";
      const ndviField = fieldByLower.get("ndvi") || "ndvi";
      const pxField = fieldByLower.get("px_all") || "px_all";
      const pageSize = Math.max(
        500,
        Math.min(10000, params.pageSize > 0 ? params.pageSize : 2000),
      );

      const hexDigits = "0123456789abcdef".split("");
      const shardClauses = hexDigits.map((d) => {
        const u = d.toUpperCase();
        return `(${uniqueIdField} LIKE '{${u}%' OR ${uniqueIdField} LIKE '{${d}%' OR ${uniqueIdField} LIKE '${u}%' OR ${uniqueIdField} LIKE '${d}%')`;
      });
      const otherClause = `NOT (${shardClauses.join(" OR ")})`;
      const allShardWheres = [...shardClauses, otherClause];

      agriVhLog("avg-ndvi:uniqueid-shards", {
        region: params.region,
        district: params.district ?? null,
        cropIds: params.cropIds || null,
        startDate: params.startDate,
        endDate: params.endDate,
        firstPageRows: params.seedRows.length,
        pageSize,
        shardCount: allShardWheres.length,
      });

      const fetchShardPages = async (
        shardWhere: string,
      ): Promise<VegetationAvgNdviUniqueRow[]> => {
        const out: VegetationAvgNdviUniqueRow[] = [];
        let lastId = "";
        let pages = 0;
        const maxPages = 80;
        while (pages < maxPages) {
          pages += 1;
          const where = lastId
            ? `${baseWhere} AND ${shardWhere} AND ${uniqueIdField} > '${escapeArcGIS(lastId)}'`
            : `${baseWhere} AND ${shardWhere}`;
          const query = layer.createQuery();
          query.where = where;
          query.groupByFieldsForStatistics = [uniqueIdField];
          query.orderByFields = [`${uniqueIdField} ASC`];
          query.outStatistics = [
            {
              statisticType: "avg",
              onStatisticField: ndviField,
              outStatisticFieldName: "avg_ndvi",
            },
            {
              statisticType: "max",
              onStatisticField: pxField,
              outStatisticFieldName: "max_px_all",
            },
          ] as any;
          query.returnGeometry = false;
          query.num = pageSize;

          const result = await queryVegFeatures(layer, query);
          const features = result?.features ?? [];
          if (!features.length) break;

          let pageMaxId = lastId;
          for (const feature of features) {
            const attrs = (feature as any)?.attributes || {};
            const uniqueid = String(
              attrs[uniqueIdField] ?? attrs.uniqueid ?? "",
            ).trim();
            const avgNdvi = Number(attrs.avg_ndvi);
            const maxPxAll = Number(attrs.max_px_all) || 0;
            if (!uniqueid || !Number.isFinite(avgNdvi)) continue;
            out.push({
              uniqueid,
              avgNdvi,
              maxPxAll,
              areaHa: maxPxAll * VEG_PIXEL_AREA_HA,
            });
            if (uniqueid > pageMaxId) pageMaxId = uniqueid;
          }

          if (pageMaxId === lastId) break;
          lastId = pageMaxId;
          if (features.length < pageSize) break;
        }
        return out;
      };

      // 4 shards at a time — keep headroom when several viloyats page in parallel.
      const shardRows: VegetationAvgNdviUniqueRow[] = [];
      const shardConcurrency = 4;
      for (let i = 0; i < allShardWheres.length; i += shardConcurrency) {
        const batch = allShardWheres.slice(i, i + shardConcurrency);
        const parts = await Promise.all(batch.map((w) => fetchShardPages(w)));
        for (const part of parts) shardRows.push(...part);
      }

      const byId = new Map<string, VegetationAvgNdviUniqueRow>();
      for (const row of params.seedRows) byId.set(row.uniqueid, row);
      for (const row of shardRows) byId.set(row.uniqueid, row);

      const rows = Array.from(byId.values());
      agriVhLog("avg-ndvi:uniqueid-shards-done", {
        region: params.region,
        district: params.district ?? null,
        cropIds: params.cropIds || null,
        startDate: params.startDate,
        endDate: params.endDate,
        fieldCount: rows.length,
        areaHaSum: Math.round(rows.reduce((s, r) => s + (r.areaHa || 0), 0)),
      });
      return rows;
    },
  });
}
export async function queryVegetationAvgNdviByUniqueIdOnce(params: {
  region: number;
  district?: number;
  cropIds?: string[];
  startDate: string;
  endDate: string;
}): Promise<{
  rows: VegetationAvgNdviUniqueRow[];
  truncated: boolean;
  maxRecordCount: number;
  exceededTransferLimit: boolean;
}> {
  const clauses = buildVegetationScopeClauses({
    region: params.region,
    district: params.district,
    cropIds: params.cropIds,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  clauses.push("uniqueid IS NOT NULL");
  clauses.push("ndvi IS NOT NULL");
  const where = clauses.join(" AND ");
  const cacheKey = `v9h-avg-ndvi-stats|${where}`;

  return rememberAsync({
    memory: vegetationAvgNdviByUniqueIdCache,
    namespace: "veg-avg-ndvi",
    key: cacheKey,
    factory: async () => {
      const { layer, fields } = await getAgriVegetationIndicesLayer();
      const fieldByLower = new Map(
        (fields || []).map((f) => [String(f).toLowerCase(), String(f)]),
      );
      const uniqueIdField =
        fieldByLower.get("uniqueid") ||
        fieldByLower.get("unique_id") ||
        fieldByLower.get("globalid") ||
        "uniqueid";
      const ndviField = fieldByLower.get("ndvi") || "ndvi";
      const pxField = fieldByLower.get("px_all") || "px_all";
      const maxRecordCount = Math.max(
        500,
        Math.min(
          100000,
          Number(layer?.maxRecordCount) > 0
            ? Math.floor(Number(layer.maxRecordCount))
            : 2000,
        ),
      );

      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = [uniqueIdField];
      query.orderByFields = [`${uniqueIdField} ASC`];
      query.outStatistics = [
        {
          statisticType: "avg",
          onStatisticField: ndviField,
          outStatisticFieldName: "avg_ndvi",
        },
        {
          statisticType: "max",
          onStatisticField: pxField,
          outStatisticFieldName: "max_px_all",
        },
      ] as any;
      query.returnGeometry = false;
      query.num = maxRecordCount;

      const result = await queryVegFeatures(layer, query);
      const rows: VegetationAvgNdviUniqueRow[] = [];
      for (const feature of result?.features ?? []) {
        const attrs = (feature as any)?.attributes || {};
        const uniqueid = String(
          attrs[uniqueIdField] ?? attrs.uniqueid ?? "",
        ).trim();
        const avgNdvi = Number(attrs.avg_ndvi);
        const maxPxAll = Number(attrs.max_px_all) || 0;
        if (!uniqueid || !Number.isFinite(avgNdvi)) continue;
        rows.push({
          uniqueid,
          avgNdvi,
          maxPxAll,
          areaHa: maxPxAll * VEG_PIXEL_AREA_HA,
        });
      }
      const exceededTransferLimit = Boolean(
        (result as any)?.exceededTransferLimit,
      );
      const truncated =
        exceededTransferLimit || rows.length >= maxRecordCount;
      if (truncated) {
        agriVhLog("avg-ndvi-stats:truncated", {
          cropIds: params.cropIds || null,
          region: params.region,
          district: params.district ?? null,
          rowCount: rows.length,
          maxRecordCount,
          exceededTransferLimit,
        });
      }
      return { rows, truncated, maxRecordCount, exceededTransferLimit };
    },
  });
}
