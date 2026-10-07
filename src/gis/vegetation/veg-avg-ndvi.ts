/**
 * Per-uniqueid AVG(ndvi) / MAX(px_all) statistics — single page and the
 * uniqueid-prefix sharded continuation for truncated results.
 */
import { getAgriVegetationIndicesLayer, queryVegFeatures, agriVhLog, buildVegetationScopeClauses, type VegetationAvgNdviUniqueRow, vegetationAvgNdviOidCursorCache, VEG_PIXEL_AREA_HA, vegetationAvgNdviByUniqueIdCache } from "./veg-base";
import { escapeArcGIS } from "../../data/agri-sql";
import { rememberAsync } from "../../data/agri-persistent-cache";
import type { AgriLayerWithMaxRecordCount } from "../agri-layer-types";
import { asStatisticDefinitions } from "../../shared/agri-plain-object";

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
          query.outStatistics = asStatisticDefinitions([
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
          ]);
          query.returnGeometry = false;
          query.num = pageSize;

          const result = await queryVegFeatures(layer, query);
          const features = result?.features ?? [];
          if (!features.length) break;

          let pageMaxId = lastId;
          for (const feature of features) {
            const attrs = feature?.attributes || {};
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
      // Not on the FeatureLayer typings — read defensively (see resolveVegetationUniqueIdPageSize).
      const maxRecordCountRaw = (layer as AgriLayerWithMaxRecordCount | null)
        ?.maxRecordCount;
      const maxRecordCount = Math.max(
        500,
        Math.min(
          100000,
          Number(maxRecordCountRaw) > 0
            ? Math.floor(Number(maxRecordCountRaw))
            : 2000,
        ),
      );

      const query = layer.createQuery();
      query.where = where;
      query.groupByFieldsForStatistics = [uniqueIdField];
      query.orderByFields = [`${uniqueIdField} ASC`];
      query.outStatistics = asStatisticDefinitions([
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
      ]);
      query.returnGeometry = false;
      query.num = maxRecordCount;

      const result = await queryVegFeatures(layer, query);
      const rows: VegetationAvgNdviUniqueRow[] = [];
      for (const feature of result?.features ?? []) {
        const attrs = feature?.attributes || {};
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
        result?.exceededTransferLimit,
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
