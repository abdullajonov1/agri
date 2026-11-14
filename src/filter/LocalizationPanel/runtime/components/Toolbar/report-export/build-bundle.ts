import {
  mergeEhtimoliyIntoCrops,
  mergePlanIntoCrops,
  queryGallaAreas,
  queryOzuqaAreas,
  queryPaxtaAreas,
  queryPlanAreas,
  queryReserveAreas,
  queryUnusedAreas,
  resolveReportGeos,
} from "./query-stats";
import type { ReportDataBundle, ReportScope } from "./types";

/** Fetch every sheet's numbers for the current filter scope. */
export async function buildReportDataBundle(
  scope: ReportScope,
): Promise<ReportDataBundle> {
  const yil = String(scope.yil || "").trim();
  if (!yil) {
    throw new Error("Yil tanlanmagan");
  }
  const normalized: ReportScope = {
    yil,
    viloyat: String(scope.viloyat || "").trim(),
  };

  const [geos, paxtaMon, gallaMon, paxtaPlan, gallaPlan, ozuqa, reserve, unused] =
    await Promise.all([
      resolveReportGeos(normalized),
      queryPaxtaAreas(normalized),
      queryGallaAreas(normalized),
      queryPlanAreas(normalized, ["paxta"]),
      queryPlanAreas(normalized, ["bugdoy"]),
      queryOzuqaAreas(normalized),
      queryReserveAreas(normalized),
      queryUnusedAreas(normalized),
    ]);

  return {
    scope: normalized,
    geos,
    paxta: mergePlanIntoCrops(paxtaMon, paxtaPlan),
    galla: mergeEhtimoliyIntoCrops(mergePlanIntoCrops(gallaMon, gallaPlan), ozuqa),
    reserve,
    unused,
  };
}
