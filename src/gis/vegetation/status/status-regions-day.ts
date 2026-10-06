import { queryVegFeatures, readVegAttr, agriNotifyLog } from "../veg-base";

export async function listRegionsForProcessedDay(
  layer: any,
  where: string,
  regionField: string,
  oidField: string,
  ymd: string,
): Promise<string[]> {
  try {
    const query = layer.createQuery();
    query.where = where;
    query.groupByFieldsForStatistics = [regionField];
    query.orderByFields = [`${regionField} ASC`];
    query.outStatistics = [
      {
        statisticType: "count",
        onStatisticField: oidField,
        outStatisticFieldName: "row_cnt",
      },
    ] as any;
    query.returnGeometry = false;
    query.num = 100;
    const result = await queryVegFeatures(layer, query);
    const regions: string[] = [];
    for (const feature of result?.features ?? []) {
      const attrs = (feature as any)?.attributes || {};
      const regionCode = String(
        readVegAttr(attrs, regionField, "region") ?? "",
      ).trim();
      const rowCnt = Number(readVegAttr(attrs, "row_cnt")) || 0;
      if (regionCode && rowCnt > 0) regions.push(regionCode);
    }
    agriNotifyLog("count:regions-for-day", { ymd, regions });
    return regions;
  } catch (err) {
    agriNotifyLog("count:regions-for-day-failed", {
      ymd,
      error: String((err as any)?.message || err),
    });
    return [];
  }
}
