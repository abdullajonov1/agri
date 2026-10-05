import { pruneTimedCache, queryCountCache, queryStatsCache, queryJsonCache, getQueryUrl, cacheKey, stableCachePayload, getEsriRequest, QUERY_CACHE_TTL_MS, getExtentClass, isValidMapExtent, flLog, layerLabel } from "../primitives";
import { getQueryableLayer } from "./lookup-collect";

export function pruneAgriQueryCache(now = Date.now()): void {
  pruneTimedCache(queryCountCache, now);
  pruneTimedCache(queryStatsCache, now);
  pruneTimedCache(queryJsonCache, now);
}
export function invalidateAgriQueryCache(forceClear = false): void {
  if (forceClear) {
    queryCountCache.clear();
    queryStatsCache.clear();
    queryJsonCache.clear();
    return;
  }
  pruneAgriQueryCache();
}
export async function queryLayerJson(
  layer: any,
  params: Record<string, unknown>,
): Promise<any> {
  const url = getQueryUrl(layer);
  if (!url) throw new Error("Layer has no URL for JSON query");

  const key = cacheKey(layer, "json", stableCachePayload(params));
  const now = Date.now();
  pruneAgriQueryCache(now);
  const hit = queryJsonCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const job = (async () => {
    const esriRequest = await getEsriRequest();
    const res = await esriRequest(url, {
      query: { f: "json", ...params },
      responseType: "json",
    });
    const data = res?.data;
    if (data?.error) {
      throw new Error(String(data.error?.message || "Query error"));
    }
    return data;
  })();

  queryJsonCache.set(key, { expires: now + QUERY_CACHE_TTL_MS, value: job });
  try {
    return await job;
  } catch (err) {
    if (queryJsonCache.get(key)?.value === job) queryJsonCache.delete(key);
    throw err;
  }
}
async function extentFromJson(ext: Record<string, any>): Promise<any> {
  const Extent = await getExtentClass();
  return new Extent({
    xmin: ext.xmin,
    ymin: ext.ymin,
    xmax: ext.xmax,
    ymax: ext.ymax,
    spatialReference: ext.spatialReference,
  });
}
/**
 * Query filtered feature extent — Map Image sublayers often need REST fallback
 * because LayerView.queryExtent is unavailable on map-image sublayers.
 */
export async function queryLayerExtent(
  layer: any,
  where: string,
): Promise<any | null> {
  const queryable = getQueryableLayer(layer) || layer;
  if (!queryable) return null;
  const w = String(where || "1=1").trim() || "1=1";

  try {
    if (typeof queryable.queryExtent === "function") {
      const q =
        typeof queryable.createQuery === "function"
          ? queryable.createQuery()
          : { where: w };
      q.where = w;
      q.returnGeometry = true;
      if ("maxAllowableOffset" in q) q.maxAllowableOffset = 0;
      const res = await queryable.queryExtent(q);
      if (isValidMapExtent(res?.extent)) return res.extent;
    }
  } catch {
    /* REST fallback below */
  }

  try {
    const data = await queryLayerJson(queryable, {
      where: w,
      returnExtentOnly: true,
      returnGeometry: false,
    });
    if (isValidMapExtent(data?.extent)) {
      return extentFromJson(data.extent);
    }
  } catch {
    /* geometry fallback below */
  }

  try {
    const data = await queryLayerJson(queryable, {
      where: w,
      returnGeometry: true,
      outFields: queryable?.objectIdField || "OBJECTID",
      resultRecordCount: 200,
    });
    const features = Array.isArray(data?.features) ? data.features : [];
    if (!features.length) return null;

    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    let spatialReference: any = null;

    for (const feature of features) {
      const geom = feature?.geometry;
      if (!geom) continue;
      spatialReference = spatialReference || geom.spatialReference;
      const rings = geom.rings;
      const paths = geom.paths;
      const x = Number(geom.x);
      const y = Number(geom.y);
      if (Array.isArray(rings)) {
        for (const ring of rings) {
          for (const pt of ring) {
            const px = Number(pt?.[0]);
            const py = Number(pt?.[1]);
            if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
            xmin = Math.min(xmin, px);
            ymin = Math.min(ymin, py);
            xmax = Math.max(xmax, px);
            ymax = Math.max(ymax, py);
          }
        }
      } else if (Array.isArray(paths)) {
        for (const path of paths) {
          for (const pt of path) {
            const px = Number(pt?.[0]);
            const py = Number(pt?.[1]);
            if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
            xmin = Math.min(xmin, px);
            ymin = Math.min(ymin, py);
            xmax = Math.max(xmax, px);
            ymax = Math.max(ymax, py);
          }
        }
      } else if (Number.isFinite(x) && Number.isFinite(y)) {
        xmin = Math.min(xmin, x);
        ymin = Math.min(ymin, y);
        xmax = Math.max(xmax, x);
        ymax = Math.max(ymax, y);
      }
    }

    if (
      Number.isFinite(xmin) &&
      Number.isFinite(ymin) &&
      Number.isFinite(xmax) &&
      Number.isFinite(ymax)
    ) {
      const ext = await extentFromJson({
        xmin,
        ymin,
        xmax,
        ymax,
        spatialReference,
      });
      if (isValidMapExtent(ext)) return ext;
    }
  } catch {
    /* no extent */
  }

  return null;
}
export async function countWhereUncached(layer: any, where: string): Promise<number> {
  const w = where || "1=1";
  try {
    const query = layer.createQuery();
    query.where = w;
    query.returnGeometry = false;
    const count = await layer.queryFeatureCount(query);
    flLog("countWhere OK", { layer: layerLabel(layer), where: w, count });
    return Number(count) || 0;
  } catch (err: any) {
    flLog("countWhere layer query FAILED → JSON fallback", {
      layer: layerLabel(layer),
      where: w,
      error: String(err?.message || err),
    });
  }
  try {
    const data = await queryLayerJson(layer, {
      where: w,
      returnCountOnly: true,
    });
    const count = Number(data?.count) || 0;
    flLog("countWhere JSON OK", { layer: layerLabel(layer), where: w, count });
    return count;
  } catch (err: any) {
    flLog("countWhere JSON FAILED", {
      layer: layerLabel(layer),
      where: w,
      error: String(err?.message || err),
    });
    return 0;
  }
}
export async function runStatsQueryUncached(
  layer: any,
  where: string,
  outStatistics: Array<Record<string, unknown>>,
  groupBy?: string[],
): Promise<Array<Record<string, any>>> {
  const w = where || "1=1";

  const queryJson = async (): Promise<Array<Record<string, any>>> => {
    const params: Record<string, unknown> = {
      where: w,
      returnGeometry: false,
      outStatistics: JSON.stringify(outStatistics),
    };
    if (groupBy?.length) {
      params.groupByFieldsForStatistics = groupBy.join(",");
    }
    const data = await queryLayerJson(layer, params);
    const rows = (data?.features || []).map((f: any) => f?.attributes || {});
    flLog("stats JSON OK", {
      layer: layerLabel(layer),
      where: w,
      groupBy: groupBy || null,
      rowCount: rows.length,
      firstRow: rows[0] || null,
    });
    return rows;
  };

  const queryLayer = async (): Promise<Array<Record<string, any>>> => {
    const query = layer.createQuery();
    query.where = w;
    query.returnGeometry = false;
    query.outStatistics = outStatistics as any;
    if (groupBy?.length) query.groupByFieldsForStatistics = groupBy as any;
    const res = await layer.queryFeatures(query);
    const rows = (res?.features || []).map((f: any) => f?.attributes || {});
    flLog("stats layer query OK", {
      layer: layerLabel(layer),
      where: w,
      groupBy: groupBy || null,
      rowCount: rows.length,
      firstRow: rows[0] || null,
    });
    return rows;
  };

  const hasPercentile = outStatistics.some((stat) =>
    String(stat?.statisticType ?? "").toLowerCase().includes("percentile"),
  );
  const preferJsonFirst = !groupBy?.length || hasPercentile;

  if (preferJsonFirst) {
    try {
      return await queryJson();
    } catch (err: any) {
      flLog("stats JSON fallback to layer", {
        layer: layerLabel(layer),
        where: w,
        groupBy: groupBy || null,
        error: String(err?.message || err),
      });
    }
  }

  try {
    return await queryLayer();
  } catch (err: any) {
    flLog("stats layer query fallback to JSON", {
      layer: layerLabel(layer),
      where: w,
      groupBy: groupBy || null,
      error: String(err?.message || err),
    });
  }

  try {
    return await queryJson();
  } catch (err: any) {
    flLog("stats JSON FAILED", {
      layer: layerLabel(layer),
      where: w,
      groupBy: groupBy || null,
      error: String(err?.message || err),
    });
    return [];
  }
}
/** Distinct non-empty values of a field (optionally filtered).
 * Single-page query — ArcGIS often rejects distinct+offset paging with
 * "Unable to complete operation". Incomplete pages return [] so callers
 * fall back to literal matching instead of a truncated index.
 */
export async function distinctValues(
  layer: any,
  field: string,
  where = "1=1",
): Promise<string[]> {
  const collect = (features: any[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const feat of features || []) {
      const raw = feat?.attributes?.[field];
      const v = String(raw ?? "").trim();
      if (v && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
    return out;
  };

  const pageSize = (() => {
    const maxRecordCount = Number(layer?.maxRecordCount);
    if (Number.isFinite(maxRecordCount) && maxRecordCount > 0) {
      return Math.min(maxRecordCount, 2000);
    }
    return 2000;
  })();

  try {
    const query = layer.createQuery();
    query.where = where || "1=1";
    query.returnGeometry = false;
    query.returnDistinctValues = true;
    query.outFields = [field];
    query.orderByFields = [field] as any;
    query.num = pageSize;
    const res = await layer.queryFeatures(query);
    if (res?.exceededTransferLimit === true) {
      return [];
    }
    return collect(res?.features || []);
  } catch {
    /* JSON fallback below */
  }

  try {
    const data = await queryLayerJson(layer, {
      where: where || "1=1",
      returnGeometry: false,
      returnDistinctValues: true,
      outFields: field,
      orderByFields: field,
      resultRecordCount: pageSize,
    });
    if (data?.exceededTransferLimit === true) {
      return [];
    }
    return collect(data?.features || []);
  } catch {
    return [];
  }
}
