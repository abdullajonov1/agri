import { queryVegFeatures, readVegAttr, formatEpochToTashkentYmd, agriNotifyLog, formatArcgisDateToYmd, shiftYmd } from "../veg-base";
import type { AgriQueryableLayer } from "../../../types/agri-layer";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";

/**
 * Exactly `dayCount` consecutive Tashkent calendar days ending at MAX(processed_at).
 * Does NOT skip empty days — that was pulling in Sep 7 / Sep 6 instead of Sep 13–11.
 */
export async function fetchLastProcessedAtCalendarWindow(
  layer: AgriQueryableLayer,
  dateField: string,
  dayCount: number,
): Promise<string[]> {
  const maxQuery = layer.createQuery();
  maxQuery.where = `${dateField} IS NOT NULL`;
  maxQuery.returnGeometry = false;
  maxQuery.outStatistics = asStatisticDefinitions([
    {
      statisticType: "max",
      onStatisticField: dateField,
      outStatisticFieldName: "max_processed_at",
    },
  ]);

  const maxResult = await queryVegFeatures(layer, maxQuery);
  const maxRaw = readVegAttr(
    maxResult?.features?.[0]?.attributes || {},
    "max_processed_at",
    dateField,
  );
  const maxYmd = formatEpochToTashkentYmd(maxRaw);
  agriNotifyLog("dates:window", {
    dateField,
    maxRaw,
    maxYmdUtc: formatArcgisDateToYmd(maxRaw),
    maxYmdTashkent: maxYmd,
    dayCount,
  });
  if (!maxYmd) return [];

  const days: string[] = [];
  for (let i = 0; i < dayCount; i++) {
    const ymd = shiftYmd(maxYmd, -i);
    if (ymd) days.push(ymd);
  }
  return days;
}
