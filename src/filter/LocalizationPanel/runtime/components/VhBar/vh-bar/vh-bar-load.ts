import type { LocalizationHost } from "../../host";
import { buildVhUniqueIdCacheKey } from "../../../../../localization/resolve-geo-codes";
import { queryVegetationUniqueIdsForStatus } from "../../../../../../gis/agri-vegetation-data-source";
import { agriLog } from "../../localization-log";
import { VH_TO_NDVI_STATUS } from "../../../../../localization/vh-constants";
import { escapeArcGIS } from "../../../../../../data/agri-sql";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/**
 * After map-scoped VH ids are ready, finish viloyat-wide ids for AgriRegion
 * without holding up map filter / first broadcast.
 */
export const resolveVhRegionChartUniqueIdsBackground = async (
  host: LocalizationHost,
  resolveGen: number,
  params: {
    status: string;
    regionNum: number;
    cropIds: string[];
    ndviDate: string;
    vhCategory: string;
  },
  isCurrent?: () => boolean,
): Promise<void> => {
  const stillOk = () =>
    host._isMounted &&
    resolveGen === host._vhResolveGen &&
    (!isCurrent || isCurrent()) &&
    !!String(host.state.vh || "").trim();

  const cacheKey = buildVhUniqueIdCacheKey({
    status: params.status,
    ndviDate: params.ndviDate,
    regionNum: params.regionNum,
    districtNum: undefined,
    cropIds: params.cropIds,
  });

  try {
    let ids = host._vhUniqueIdCache[cacheKey];
    const fromCache = Boolean(ids);
    if (!ids) {
      ids = await queryVegetationUniqueIdsForStatus({
        region: params.regionNum,
        district: undefined,
        date: params.ndviDate,
        ndviStatus: params.status,
        cropIds: params.cropIds.length ? params.cropIds : undefined,
      });
      if (!stillOk()) return;
      host.setVhUniqueIdCacheEntry(cacheKey, ids);
    }
    if (!stillOk()) return;

    host._vhRegionChartUniqueIds = ids;
    agriLog("vhRegionChartUniqueIds:background-resolved", {
      vhCategory: params.vhCategory,
      status: params.status,
      ndviDate: params.ndviDate,
      regionNum: params.regionNum,
      cropCount: params.cropIds.length,
      count: ids.length,
      fromCache,
    });
    host._reuseVhBarDataOnNextBroadcast = true;
    host.broadcastFilterState();
  } catch (e) {
    if (!stillOk()) return;
    agriLog("vhRegionChartUniqueIds:background-FAILED", {
      vhCategory: params.vhCategory,
      error: errorMessage(e),
    });
    host._vhRegionChartUniqueIds = [];
    host._reuseVhBarDataOnNextBroadcast = true;
    host.broadcastFilterState();
  }
};
export const loadNdviBucketIds = async (host: LocalizationHost, vhCategory: string): Promise<void> => {
  const ndviDate = (host.state.ndviDate || "").trim();
  if (!ndviDate) return;

  const cfg = (host.props.config || {}) as any;
  const polygonJoinField =
    (cfg.polygonJoinField || "uniqueid").toString().trim() || "uniqueid";

  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];
  if (!primaryLayer) return;

  const statusTableValue = VH_TO_NDVI_STATUS[vhCategory];
  if (!statusTableValue) return;

  const ids = new Set<string>();

  const prefix =
    (cfg.polygonStatusPrefix || "status_").toString().trim() || "status_";

  let statusField = host._ndviDateFieldMap[ndviDate];
  if (!statusField) {
    const suffix = ndviDate.replace(/-/g, "_");
    statusField = `${prefix}${suffix}`;
  }

  const fields: any[] = (primaryLayer as any).fields || [];
  const hasStatusField = fields.some(
    (f) =>
      (f?.name || "").toString().toLowerCase() === statusField.toLowerCase(),
  );
  if (!hasStatusField) {
    return;
  }

  // Same rule as VH bar: spatial filters only, no yil restriction.
  const baseWhere = host.buildNdviSpatialWhere();
  const whereParts: string[] = [];
  if (baseWhere && baseWhere !== "1=0") whereParts.push(`(${baseWhere})`);
  whereParts.push(
    `${statusField} = '${escapeArcGIS(statusTableValue)}'`,
  );
  const where = whereParts.join(" AND ");

  // Page through polygons to collect join IDs (hard page cap — same as area query).
  const pageSize = 2000;
  let offset = 0;
  let lastSize = 0;

  for (let page = 0; page < 250 && host._isMounted; page++) {
    const q = primaryLayer.createQuery();
    (q as any).where = where;
    (q as any).outFields = [polygonJoinField];
    (q as any).returnGeometry = false;
    (q as any).resultOffset = offset;
    (q as any).resultRecordCount = pageSize;

    const res = await primaryLayer.queryFeatures(q);
    const features = res?.features ?? [];
    for (const f of features) {
      const v = (f.attributes as any)?.[polygonJoinField];
      if (v != null && v !== "") ids.add(String(v));
    }

    const newSize = ids.size;
    if (features.length < pageSize) break;

    if (newSize === lastSize) {
      break;
    }
    lastSize = newSize;
    offset += pageSize;
  }

  host._ndviBucketToIds[vhCategory] = Array.from(ids);
};
