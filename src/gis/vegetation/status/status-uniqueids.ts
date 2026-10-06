import { type VegetationUniqueIdsForStatusParams, getAgriVegetationIndicesLayer, vegetationAssignedUniqueIdsCache, agriVegetationLog, resolveVegetationUniqueIdPageSize, VEG_UNIQUEID_MAX_PAGES, queryVegFeatures } from "../veg-base";
import { dateEqualsClause, escapeArcGIS } from "../../../data/agri-sql";

/**
 * Uniqueids whose vegetation row matches the selected Vegetatsiya Holati
 * bucket (ndvi_status) for a given date + region/district. Used to filter
 * map polygons — the polygon layer's static `vh` attribute does NOT carry
 * these bar-chart categories.
 *
 * Uses objectid-cursor paging (`objectid > lastOid`) instead of resultOffset,
 * which some ArcGIS table services ignore (silently re-returning the first
 * page and making callers look "stuck" at MaxRecordCount).
 */
export async function queryVegetationUniqueIdsForStatus(
  params: VegetationUniqueIdsForStatusParams,
): Promise<string[]> {
  const status = String(params.ndviStatus || "")
    .trim()
    .toLowerCase();
  if (!status || !params.date) return [];

  const { layer, fields } = await getAgriVegetationIndicesLayer();
  const scopeClauses: string[] = [dateEqualsClause("raster_date", params.date)];
  if (params.region != null) {
    scopeClauses.push(`region='${escapeArcGIS(String(params.region))}'`);
  }
  if (params.district != null) {
    scopeClauses.push(`district='${escapeArcGIS(String(params.district))}'`);
  }
  const requestedCropIds = Array.from(
    new Set(
      [...(params.cropIds || []), ...(params.cropId ? [params.cropId] : [])]
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );
  if (requestedCropIds.length === 1) {
    scopeClauses.push(`crop_id='${escapeArcGIS(requestedCropIds[0])}'`);
  } else if (requestedCropIds.length > 1) {
    scopeClauses.push(
      `crop_id IN (${requestedCropIds
        .map((value) => `'${escapeArcGIS(value)}'`)
        .join(",")})`,
    );
  }
  const fieldByLower = new Map(
    fields.map((field) => [String(field).toLowerCase(), String(field)]),
  );
  const uniqueIdField =
    fieldByLower.get("uniqueid") ||
    fieldByLower.get("unique_id") ||
    fieldByLower.get("globalid") ||
    fieldByLower.get("global_id") ||
    "uniqueid";
  const scopeWhere = scopeClauses.join(" AND ");
  const assignedCacheKey = `${scopeWhere}|id=${uniqueIdField}`;
  const assignedIds =
    vegetationAssignedUniqueIdsCache.get(assignedCacheKey)?.get(status);
  if (assignedIds) {
    agriVegetationLog("uniqueids-for-status:assigned-cache", {
      status,
      date: params.date,
      region: params.region ?? null,
      district: params.district ?? null,
      count: assignedIds.length,
    });
    return assignedIds.slice();
  }

  const baseClauses = [
    ...scopeClauses,
    `ndvi_status='${escapeArcGIS(status)}'`,
  ];
  const baseWhere = baseClauses.join(" AND ");

  const ids = new Set<string>();
  const oidField = String(layer.objectIdField || "objectid");
  const pageSize = resolveVegetationUniqueIdPageSize(layer);
  const maxPages = Math.max(
    VEG_UNIQUEID_MAX_PAGES,
    Math.ceil(100_000 / pageSize),
  );
  let lastOid = -1;
  let pagesFetched = 0;
  let truncated = false;

  agriVegetationLog("uniqueids-for-status:start", {
    where: baseWhere,
    status,
    date: params.date,
    region: params.region ?? null,
    district: params.district ?? null,
    oidField,
    pageSize,
  });

  const readOid = (attrs: Record<string, unknown>): number => {
    const raw =
      attrs?.[oidField] ??
      attrs?.[oidField.toLowerCase()] ??
      attrs?.OBJECTID ??
      attrs?.objectid;
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  };
  const readUniqueId = (attrs: Record<string, unknown>): string => {
    const raw =
      attrs?.[uniqueIdField] ??
      attrs?.[uniqueIdField.toLowerCase()] ??
      attrs?.[uniqueIdField.toUpperCase()];
    return raw == null || raw === "" ? "" : String(raw);
  };

  for (let page = 0; page < maxPages; page++) {
    const where =
      lastOid < 0
        ? baseWhere
        : `(${baseWhere}) AND ${oidField} > ${lastOid}`;
    const query = layer.createQuery();
    query.where = where;
    query.outFields = [uniqueIdField, oidField];
    query.returnGeometry = false;
    query.orderByFields = [`${oidField} ASC`];
    (query as any).resultRecordCount = pageSize;
    // Do not rely on resultOffset — cursor paging above is the source of truth.

    const result = await queryVegFeatures(layer, query);
    const features = result?.features ?? [];
    pagesFetched += 1;
    if (!features.length) break;

    let pageMaxOid = lastOid;
    let newIds = 0;
    for (const f of features) {
      const attrs = (f.attributes || {}) as Record<string, unknown>;
      const oid = readOid(attrs);
      if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
      const v = readUniqueId(attrs);
      if (v) {
        const before = ids.size;
        ids.add(v);
        if (ids.size > before) newIds += 1;
      }
    }
    if (!(pageMaxOid > lastOid)) {
      truncated = true;
      break;
    }
    lastOid = pageMaxOid;

    if (features.length < pageSize) break;
    if (newIds === 0) {
      truncated = true;
      break;
    }
    if (page === maxPages - 1) truncated = true;
  }

  agriVegetationLog("uniqueids-for-status:done", {
    status,
    date: params.date,
    count: ids.size,
    pagesFetched,
    pageSize,
    truncated,
  });

  return Array.from(ids);
}
