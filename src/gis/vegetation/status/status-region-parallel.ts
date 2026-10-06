import { escapeArcGIS } from "../../../data/agri-sql";
import { queryDistinctFieldCount, agriNotifyLog } from "../veg-base";

export async function countDistinctUniqueIdsByRegionParallel(
  layer: any,
  baseWhere: string,
  regionField: string,
  uniqueIdField: string,
  regions: string[],
  ymd: string,
): Promise<Map<string, number> | null> {
  const results = await Promise.all(
    regions.map(async (regionCode) => {
      const where = `${baseWhere} AND ${regionField}='${escapeArcGIS(regionCode)}'`;
      const fieldCount = await queryDistinctFieldCount(
        layer,
        where,
        uniqueIdField,
      );
      agriNotifyLog("count:region-distinct", {
        ymd,
        regionCode,
        fieldCount,
      });
      return { regionCode, fieldCount };
    }),
  );

  if (results.some((row) => row.fieldCount == null)) {
    agriNotifyLog("count:region-distinct-incomplete", { ymd, results });
    return null;
  }

  const out = new Map<string, number>();
  for (const row of results) {
    const n = Number(row.fieldCount) || 0;
    if (n > 0) out.set(row.regionCode, n);
  }

  agriNotifyLog("count:day-done", {
    ymd,
    path: "returnDistinctValues+returnCountOnly",
    regions: out.size,
    totalDistinctUniqueIds: Array.from(out.values()).reduce((s, n) => s + n, 0),
    byRegion: Array.from(out.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([regionCode, fieldCount]) => ({ regionCode, fieldCount })),
  });

  return out;
}
