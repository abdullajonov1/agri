import { queryVegFeatures, readVegAttr, agriNotifyLog } from "../veg-base";

export async function countDistinctViaOidCursor(
  layer: any,
  where: string,
  regionField: string,
  uniqueIdField: string,
  oidField: string,
  ymd: string,
  pageSize: number,
): Promise<Map<string, number>> {
  const regionSets = new Map<string, Set<string>>();
  let lastOid: number | null = null;
  let pages = 0;
  let rowsRead = 0;
  const maxPages = 2500;

  while (pages < maxPages) {
    pages += 1;
    const clauses = [where];
    if (lastOid != null && Number.isFinite(lastOid)) {
      clauses.push(`${oidField} > ${lastOid}`);
    }
    const query = layer.createQuery();
    query.where = clauses.join(" AND ");
    query.outFields = [oidField, uniqueIdField, regionField];
    query.orderByFields = [`${oidField} ASC`];
    query.returnGeometry = false;
    query.num = pageSize;
    query.resultRecordCount = pageSize;

    const result = await queryVegFeatures(layer, query);
    const features = result?.features ?? [];
    if (!features.length) break;

    let pageMaxOid = lastOid;
    for (const feature of features) {
      const attrs = (feature as any)?.attributes || {};
      const oid = Number(readVegAttr(attrs, oidField, "objectid", "OBJECTID"));
      const uniqueId = String(
        readVegAttr(attrs, uniqueIdField, "uniqueid") ?? "",
      ).trim();
      const regionCode = String(
        readVegAttr(attrs, regionField, "region") ?? "",
      ).trim();
      if (Number.isFinite(oid)) {
        pageMaxOid = pageMaxOid == null ? oid : Math.max(pageMaxOid, oid);
      }
      if (!uniqueId || !regionCode) continue;
      let set = regionSets.get(regionCode);
      if (!set) {
        set = new Set<string>();
        regionSets.set(regionCode, set);
      }
      set.add(uniqueId);
    }

    rowsRead += features.length;
    if (pages === 1 || pages % 50 === 0 || features.length < pageSize) {
      agriNotifyLog("count:page", {
        ymd,
        page: pages,
        got: features.length,
        rowsRead,
        regionCount: regionSets.size,
        distinctUniqueIdsSoFar: Array.from(regionSets.values()).reduce(
          (sum, set) => sum + set.size,
          0,
        ),
      });
    }

    if (pageMaxOid == null || pageMaxOid === lastOid) break;
    lastOid = pageMaxOid;
    if (features.length < pageSize) break;
  }

  const counts = new Map<string, number>();
  for (const [regionCode, set] of regionSets) {
    counts.set(regionCode, set.size);
  }

  agriNotifyLog("count:day-done", {
    ymd,
    path: "oid-cursor",
    pages,
    rowsRead,
    regions: counts.size,
    totalDistinctUniqueIds: Array.from(counts.values()).reduce(
      (s, n) => s + n,
      0,
    ),
    byRegion: Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([regionCode, fieldCount]) => ({ regionCode, fieldCount })),
  });

  return counts;
}
