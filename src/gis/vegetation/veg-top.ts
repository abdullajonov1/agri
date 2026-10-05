import { type VegetationAvgNdviUniqueRow, agriVhLog, type VegetationStatusCount, vegetationStatusStatsCache, getAgriVegetationIndicesLayer, queryVegFeatures, VEG_PIXEL_AREA_HA, agriVegetationLog, resolveVegetationUniqueIdPageSize, processedAtTashkentDayWhere, agriNotifyLog, type VegetationRecentDayGroup, vegetationRecentDaysCacheKey, vegetationRecentDaysCache, type VegetationRecentRegionRow } from "./veg-base";
import { queryVegetationAvgNdviByUniqueIdOnce, queryVegetationAvgNdviByUniqueIdPaged } from "./veg-series";
import { queryVegetationStatusCountsByStatus, listRegionsForProcessedDay, countDistinctUniqueIdsByRegionParallel, countDistinctViaOidCursor, fetchLastProcessedAtCalendarWindow } from "./veg-status";
import { dateEqualsClause, escapeArcGIS } from "../../data/agri-sql";
import { rememberAsync } from "../../data/agri-persistent-cache";

/**
 * Per-uniqueid AVG(ndvi) + MAX(px_all) inside an inclusive raster_date window.
 * Pass cropId / cropIds to limit crops; omit both = all crops in the geo scope
 * (one query instead of N per-crop round-trips).
 */
export async function queryVegetationAvgNdviByUniqueId(params: {
  region?: number;
  district?: number;
  cropId?: string;
  cropIds?: string[];
  startDate: string;
  endDate: string;
}): Promise<VegetationAvgNdviUniqueRow[]> {
  const startDate = String(params.startDate || "").trim();
  const endDate = String(params.endDate || "").trim();
  if (!startDate || !endDate) return [];

  const cropIds = Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  );

  if (params.region == null || !Number.isFinite(Number(params.region))) {
    agriVhLog("avg-ndvi:REJECT-no-region", {
      cropIds: cropIds.length ? cropIds : null,
      startDate,
      endDate,
      hint: "Use per-region batching for republic VH",
    });
    return [];
  }

  const region = Number(params.region);
  const district =
    params.district != null && Number.isFinite(Number(params.district))
      ? Number(params.district)
      : undefined;

  const once = await queryVegetationAvgNdviByUniqueIdOnce({
    region,
    district,
    cropIds: cropIds.length ? cropIds : undefined,
    startDate,
    endDate,
  });

  if (!once.truncated) return once.rows;

  return queryVegetationAvgNdviByUniqueIdPaged({
    region,
    district,
    cropIds: cropIds.length ? cropIds : undefined,
    startDate,
    endDate,
    seedRows: once.rows,
    pageSize: once.maxRecordCount,
  });
}
/**
 * Republic VH overview: group region scopes by shared latest date, then one
 * stats query per date (`region IN (...)` + groupBy ndvi_status). Typically
 * 1–3 round-trips instead of ~14 per-region queries.
 */
export async function queryVegetationStatusCountsByRegionScopes(
  scopes: Array<{ region: number; date: string }>,
  cropIds?: string[],
): Promise<VegetationStatusCount[]> {
  const byDate = new Map<string, number[]>();
  for (const scope of scopes) {
    const date = String(scope.date || "").trim();
    const region = Number(scope.region);
    if (!date || !Number.isFinite(region)) continue;
    const list = byDate.get(date) || [];
    list.push(region);
    byDate.set(date, list);
  }
  if (!byDate.size) return [];

  const cropFilter = Array.from(
    new Set((cropIds || []).map((v) => String(v).trim()).filter(Boolean)),
  );

  const batches = await Promise.all(
    Array.from(byDate.entries()).map(([date, regions]) =>
      queryVegetationStatusCountsForRegionsOnDate({
        date,
        regions: Array.from(new Set(regions)),
        cropIds: cropFilter.length ? cropFilter : undefined,
      }),
    ),
  );
  return batches.flat();
}
async function queryVegetationStatusCountsForRegionsOnDate(params: {
  date: string;
  regions: number[];
  cropIds?: string[];
}): Promise<VegetationStatusCount[]> {
  const date = String(params.date || "").trim();
  const regions = Array.from(
    new Set(
      (params.regions || [])
        .map((r) => Number(r))
        .filter((r) => Number.isFinite(r)),
    ),
  );
  if (!date || !regions.length) return [];

  if (regions.length === 1) {
    return queryVegetationStatusCountsByStatus({
      date,
      region: regions[0],
      cropIds: params.cropIds,
    });
  }

  const clauses: string[] = [
    dateEqualsClause("raster_date", date),
    `region IN (${regions.map((r) => `'${escapeArcGIS(String(r))}'`).join(",")})`,
  ];
  const cropFilter = Array.from(
    new Set((params.cropIds || []).map((v) => String(v).trim()).filter(Boolean)),
  );
  if (cropFilter.length === 1) {
    clauses.push(`crop_id='${escapeArcGIS(cropFilter[0])}'`);
  } else if (cropFilter.length > 1) {
    clauses.push(
      `crop_id IN (${cropFilter.map((v) => `'${escapeArcGIS(v)}'`).join(",")})`,
    );
  }
  const where = clauses.join(" AND ");
  const cacheKey = `status-stats-multi|${where}`;
  return rememberAsync({
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

      const out: VegetationStatusCount[] = [];
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
        out.push({
          ndvi_status: status,
          count,
          areaHa: pxAll * VEG_PIXEL_AREA_HA,
          uniqueIds: [],
        });
      }
      agriVegetationLog("status-counts:by-status-multi-region", {
        where,
        regionCount: regions.length,
        rowCount: out.length,
      });
      return out;
    },
  });
}
/**
 * DISTINCT uniqueid per region for one processed_at day.
 * Fast path: returnDistinctValues + returnCountOnly (1 request per region).
 * Server does not support countDistinct stats — never use those.
 */
async function countDistinctUniqueIdsForProcessedDay(
  layer: any,
  dateField: string,
  regionField: string,
  uniqueIdField: string,
  oidField: string,
  ymd: string,
): Promise<Map<string, number>> {
  const pageSize = resolveVegetationUniqueIdPageSize(layer);
  const whereCandidates = [
    processedAtTashkentDayWhere(dateField, ymd),
    // Fallback: UTC DATE range (same as raster_date clauses) if TIMESTAMP is rejected.
    dateEqualsClause(dateField, ymd),
  ];

  let where = whereCandidates[0];
  let regionList: string[] = [];

  for (let i = 0; i < whereCandidates.length; i++) {
    where = whereCandidates[i];
    regionList = await listRegionsForProcessedDay(
      layer,
      where,
      regionField,
      oidField,
      ymd,
    );
    if (regionList.length) {
      if (i > 0) {
        agriNotifyLog("count:day-done", {
          ymd,
          path: "where-fallback-date-clause",
          regions: regionList.length,
        });
      }
      break;
    }
  }

  agriNotifyLog("count:start-day", {
    ymd,
    where,
    dateField,
    regionField,
    uniqueIdField,
  });

  if (!regionList.length) {
    agriNotifyLog("count:day-done", {
      ymd,
      path: "no-regions",
      totalDistinctUniqueIds: 0,
      byRegion: [],
    });
    return new Map();
  }

  const distinctCounts = await countDistinctUniqueIdsByRegionParallel(
    layer,
    where,
    regionField,
    uniqueIdField,
    regionList,
    ymd,
  );
  if (distinctCounts) return distinctCounts;

  agriNotifyLog("count:fallback-oid-cursor", {
    ymd,
    reason: "returnDistinctValues+returnCountOnly unavailable",
    regionHint: regionList,
  });

  return countDistinctViaOidCursor(
    layer,
    where,
    regionField,
    uniqueIdField,
    oidField,
    ymd,
    pageSize,
  );
}
export async function queryVegetationRecentDayRegionCounts(
  dayCount = 5,
): Promise<VegetationRecentDayGroup[]> {
  const n = Math.max(1, Math.min(14, Math.floor(Number(dayCount)) || 5));
  const cacheKey = vegetationRecentDaysCacheKey(dayCount);

  return rememberAsync({
    memory: vegetationRecentDaysCache,
    namespace: "veg-recent-days",
    key: cacheKey,
    factory: async (): Promise<VegetationRecentDayGroup[]> => {
      agriNotifyLog("query:start", { dayCount: n, cacheKey });
      const { layer, fields } = await getAgriVegetationIndicesLayer();
      const fieldByLower = new Map(
        (fields || []).map((f) => [String(f).toLowerCase(), String(f)]),
      );
      const dateField =
        fieldByLower.get("processed_at") ||
        fieldByLower.get("processedat") ||
        "processed_at";
      const regionField = fieldByLower.get("region") || "region";
      const uniqueIdField =
        fieldByLower.get("uniqueid") ||
        fieldByLower.get("unique_id") ||
        fieldByLower.get("globalid") ||
        "uniqueid";
      const oidField = String(layer.objectIdField || "objectid");

      const selectedDates = await fetchLastProcessedAtCalendarWindow(
        layer,
        dateField,
        n,
      );
      if (!selectedDates.length) {
        agriNotifyLog("query:no-dates");
        return [];
      }

      const groups = await Promise.all(
        selectedDates.map(async (date) => {
          const regionMap = await countDistinctUniqueIdsForProcessedDay(
            layer,
            dateField,
            regionField,
            uniqueIdField,
            oidField,
            date,
          );
          const regions: VegetationRecentRegionRow[] = Array.from(
            regionMap.entries(),
          )
            .map(([regionCode, fieldCount]) => ({ regionCode, fieldCount }))
            .filter((row) => row.fieldCount > 0)
            .sort(
              (a, b) =>
                b.fieldCount - a.fieldCount ||
                a.regionCode.localeCompare(b.regionCode),
            );
          return {
            date,
            regions,
            totalFields: regions.reduce((sum, row) => sum + row.fieldCount, 0),
          };
        }),
      );

      const byDate = new Map(groups.map((g) => [g.date, g]));
      const ordered = selectedDates
        .map((d) => byDate.get(d))
        .filter(Boolean) as VegetationRecentDayGroup[];

      agriNotifyLog("query:done", {
        days: ordered.map((g) => ({
          date: g.date,
          totalFields: g.totalFields,
          regionCount: g.regions.length,
          topRegions: g.regions.slice(0, 5),
        })),
      });

      return ordered;
    },
  });
}
