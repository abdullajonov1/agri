import { buildMapDistrictClause } from "./lookup-collect";
import { escapeArcGIS } from "../../../data/agri-sql";
import type { AgriFieldLike, AgriLayerLike } from "../../agri-layer-types";
import { buildTuriMapClause, VH_CATEGORY_TO_STATUS, regionYearLog, isGroupSublayer, clearFieldLayerScaleLimits, guardSublayerDefinitionExpression, summarizeDefinitionExpression } from "../primitives";

export function buildSublayerDefinitionExpression(
  sublayer: AgriLayerLike | null | undefined,
  tuman: string,
  turi: string | string[],
  vh = "",
  uniqueIds: string[] | null = null,
  districtCode?: number | null,
  /**
   * When VH was selected first, uniqueids are status-wide (all crops). The
   * second-selected crop must AND via MapImage `turi` text. When crop was
   * first, uniqueids are already crop-scoped via vegetation crop_id — skip
   * turi to avoid apostrophe/spelling wipe.
   */
  andTuriWithUniqueIds = false,
): string {
  const fields: AgriFieldLike[] = sublayer?.fields || [];
  const findField = (name: string) =>
    fields.find((f) => String(f?.name || "").toLowerCase() === name);

  const clauses: string[] = [];

  const trimmedTuman = String(tuman ?? "").trim();
  const districtClause = buildMapDistrictClause(
    sublayer,
    trimmedTuman,
    districtCode,
  );
  if (districtClause) clauses.push(districtClause);

  // Prefer uniqueid IN (...) from vegetation ndvi_status (bar chart source).
  // Chunk large lists — a single 2k–10k UUID IN blows MapImage export URLs
  // and makes the filter feel stuck even when the expression is correct.
  if (uniqueIds) {
    if (!uniqueIds.length) {
      clauses.push("1=0");
    } else {
      const idField = findField("uniqueid")?.name || "uniqueid";
      const CHUNK = 800;
      const chunks: string[] = [];
      for (let i = 0; i < uniqueIds.length; i += CHUNK) {
        const slice = uniqueIds.slice(i, i + CHUNK);
        const values = slice
          .map((id) => `'${escapeArcGIS(String(id))}'`)
          .join(",");
        chunks.push(`${idField} IN (${values})`);
      }
      clauses.push(
        chunks.length === 1 ? chunks[0] : `(${chunks.join(" OR ")})`,
      );
      if (andTuriWithUniqueIds) {
        const turiClause = buildTuriMapClause(sublayer, turi);
        if (turiClause) clauses.push(turiClause);
      }
    }
  } else {
    // No uniqueid filter yet (turi-only, or deferred VH first paint).
    const turiClause = buildTuriMapClause(sublayer, turi);
    if (turiClause) clauses.push(turiClause);

    // Legacy fallback: attribute `vh` with category label OR ndvi_status token.
    // Callers must pass vh="" when using vegetation uniqueids / deferred paint
    // — polygon `vh` does not store bar categories like "4-Past".
    const trimmedVh = String(vh ?? "").trim();
    if (trimmedVh) {
      const vhField = findField("vh");
      const vhFieldName = vhField?.name || (fields.length ? null : "vh");
      if (vhFieldName) {
        const statusToken = VH_CATEGORY_TO_STATUS[trimmedVh] || "";
        const variants = Array.from(
          new Set(
            [trimmedVh, statusToken].filter((v) => String(v || "").trim()),
          ),
        );
        const vhClauses = variants.map(
          (v) => `${vhFieldName}='${escapeArcGIS(String(v))}'`,
        );
        clauses.push(
          vhClauses.length === 1 ? vhClauses[0] : `(${vhClauses.join(" OR ")})`,
        );
      }
    }
  }

  const expression = clauses.length ? clauses.join(" AND ") : "1=1";
  regionYearLog("sublayer:definitionExpression", {
    sublayer: sublayer?.title ?? sublayer?.id,
    url: sublayer?.url,
    isGroup: isGroupSublayer(sublayer),
    fieldNames: fields.map((f) => String(f?.name || "")).filter(Boolean),
    tuman: trimmedTuman || null,
    districtCode: districtCode ?? null,
    districtClause: districtClause || "<empty -> NOT FILTERED>",
    expression,
  });
  return expression;
}
/**
 * Recursively forces every sublayer of a MapImageLayer (and any nested
 * sublayer groups) to `visible = true` and applies the correct tuman/turi/vh
 * -aware `definitionExpression`. A MapImageLayer's own `visible` flag only
 * controls whether it's requested from the server at all — what actually
 * gets drawn is driven independently by each sublayer's own `visible`,
 * which defaults to off, and its own `definitionExpression`, which these
 * services default to "1=0" (matches zero rows).
 */
export function forceSublayersVisible(
  layer: AgriLayerLike | null | undefined,
  tuman: string,
  turi: string | string[],
  vh = "",
  uniqueIds: string[] | null = null,
  districtCode?: number | null,
  andTuriWithUniqueIds = false,
  out: Array<Record<string, unknown>> = [],
): Array<Record<string, unknown>> {
  const subs = layer?.sublayers?.toArray?.() || layer?.allSublayers?.toArray?.();
  if (!Array.isArray(subs)) return out;
  for (const sub of subs) {
    const definitionExpressionBefore = sub?.definitionExpression ?? null;
    try {
      sub.visible = true;
      clearFieldLayerScaleLimits(sub);
      // Group sublayers only carry children; layerDefs on a group id is
      // ignored by the server, so filtering happens on the leaves below.
      if (isGroupSublayer(sub)) {
        if (definitionExpressionBefore != null) sub.definitionExpression = null;
      } else {
        const nextExpression = buildSublayerDefinitionExpression(
          sub,
          tuman,
          turi,
          vh,
          uniqueIds,
          districtCode,
          andTuriWithUniqueIds,
        );
        // Register/refresh the guard BEFORE assigning, so our own legitimate
        // assignment below isn't treated as drift. From now on, any external
        // mutation of this sublayer's definitionExpression is logged (with the
        // setter's stack) and rolled back synchronously.
        guardSublayerDefinitionExpression(sub, nextExpression);
        // Avoid re-assigning an identical expression — MapImageLayer treats
        // that as a fresh export and briefly can show unfiltered tiles.
        if (
          String(definitionExpressionBefore ?? "") !==
          String(nextExpression ?? "")
        ) {
          sub.definitionExpression = nextExpression;
        }
      }
    } catch {
      /* ignore */
    }
    out.push({
      id: sub?.id,
      title: sub?.title,
      visible: sub?.visible,
      minScale: sub?.minScale,
      maxScale: sub?.maxScale,
      definitionExpressionBefore: summarizeDefinitionExpression(
        definitionExpressionBefore,
      ),
      definitionExpressionAfter: summarizeDefinitionExpression(
        sub?.definitionExpression ?? null,
      ),
    });
    forceSublayersVisible(
      sub,
      tuman,
      turi,
      vh,
      uniqueIds,
      districtCode,
      andTuriWithUniqueIds,
      out,
    );
  }
  return out;
}
