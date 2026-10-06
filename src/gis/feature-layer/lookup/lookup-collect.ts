import { isMapImageGroupSublayer, isQueryableFieldLayer, isLikelyBasemapServiceLayer, getLayerFieldNames, isAgriFieldLayerCandidate, expandDistrictVariants, hasFieldIn, layerFieldKind } from "../primitives";
import { isAgriWaterTableLayer } from "./lookup-map-image";
import { escapeArcGIS } from "../../../data/agri-sql";

/**
 * Collect every queryable leaf under a MapImage root / group / FeatureLayer.
 * Unlike getQueryableLayer (first match only), this walks the full tree so
 * district/year leaves under "Agri 2026 republic data" stay clickable.
 */
export function collectQueryableFieldLayers(root: any): any[] {
  const out: any[] = [];
  const seen = new Set<any>();
  const walk = (node: any) => {
    if (!node || seen.has(node)) return;
    seen.add(node);
    // Always descend into group / map-image folders first.
    if (isMapImageGroupSublayer(node)) {
      const kids =
        node?.allSublayers?.toArray?.() ||
        node?.sublayers?.toArray?.() ||
        [];
      if (Array.isArray(kids)) {
        for (const kid of kids) walk(kid);
      }
      return;
    }
    if (isQueryableFieldLayer(node)) {
      out.push(node);
      return;
    }
    const kids =
      node?.allSublayers?.toArray?.() ||
      node?.sublayers?.toArray?.() ||
      [];
    if (Array.isArray(kids)) {
      for (const kid of kids) walk(kid);
    }
  };
  walk(root);
  return out;
}
/** Map candidates for Agri + Agri — excludes basemaps only. */
export function isAgriMapLayerCandidate(layer: any): boolean {
  if (!isQueryableFieldLayer(layer)) return false;
  if (isLikelyBasemapServiceLayer(layer)) return false;
  const fields = getLayerFieldNames(layer);
  if (fields.length > 0) {
    return isAgriWaterTableLayer(layer) || isAgriFieldLayerCandidate(layer);
  }
  const haystack =
    `${String(layer?.title || "")} ${String(layer?.url || "")}`.toLowerCase();
  return (
    haystack.includes("water_") ||
    haystack.includes("/water") ||
    haystack.includes("test_gusniddin") ||
    haystack.includes("test/") ||
    haystack.includes("sgm.uzspace") ||
    /\bagri\b/.test(haystack) ||
    haystack.includes("agriculture") ||
    /mapserver\/\d+$/i.test(haystack)
  );
}
/**
 * Resolve a queryable field layer from a FeatureLayer or MapImageLayer root.
 * Map Service data sources expose the parent map-image layer; widgets need
 * the sublayer that owns fields + /query. Nested group-sublayers are walked.
 */
export function getQueryableLayer(layer: any): any | null {
  if (!layer) return null;
  if (isQueryableFieldLayer(layer)) return layer;

  const seen = new Set<any>();
  const walk = (node: any): any | null => {
    if (!node || seen.has(node)) return null;
    seen.add(node);
    if (isQueryableFieldLayer(node)) return node;
    const subs =
      node?.allSublayers?.toArray?.() ||
      node?.sublayers?.toArray?.() ||
      [];
    if (!Array.isArray(subs)) return null;
    for (const sub of subs) {
      const found = walk(sub);
      if (found) return found;
    }
    return null;
  };

  return walk(layer);
}
/**
 * Builds the definitionExpression for a region+year sublayer, optionally
 * narrowed to one tuman, crop type (turi), vegetation uniqueids, and/or a
 * legacy vh attribute. Vegetatsiya Holati filtering must use uniqueids from
 * agri_vegetation_indices (ndvi_status) — the polygon `vh` field does not
 * store bar-chart categories like "4-Past".
 */
/**
 * District filter for MapImage / FeatureLayer sublayers.
 *
 * Exactly one strategy wins. The name clause and the code clause are never
 * OR'd together: the code comes from Agri_table_data, and whenever its
 * numbering does not line up with the polygon service the OR silently widens
 * the result back to other districts (the map then looks unfiltered).
 */
export function buildMapDistrictClause(
  sublayer: any,
  tuman: string,
  districtCode?: number | null,
): string {
  const trimmedTuman = String(tuman ?? "").trim();
  const hasCode =
    districtCode != null && Number.isFinite(Number(districtCode));
  if (!trimmedTuman && !hasCode) return "";

  const fields: any[] = sublayer?.fields || [];
  const available = fields
    .map((f) => String(f?.name || ""))
    .filter(Boolean);
  const hasFieldMeta = available.length > 0;
  const realName = (name: string): string | null =>
    available.find((f) => f.toLowerCase() === name) ?? null;

  const equalsAny = (field: string, values: string[]): string => {
    const parts = values.map((v) => `${field}='${escapeArcGIS(v)}'`);
    return parts.length === 1 ? parts[0] : `(${parts.join(" OR ")})`;
  };

  const nameValues = (): string[] => {
    const variants = expandDistrictVariants(trimmedTuman);
    return variants.length ? variants : [trimmedTuman];
  };

  // 1) Numeric district code — preferred. Name→code is majority-voted from
  //    Agri_table so poison rows (Qamashi tagged with Yakkabog' SOATO) lose.
  if (hasCode) {
    const code = Number(districtCode);
    const idField = ["distrct_id", "district_id", "district"].find(
      (field) => !hasFieldMeta || hasFieldIn(available, field),
    );
    if (idField) {
      const kind = hasFieldMeta ? layerFieldKind(sublayer, idField) : "numeric";
      return kind === "string"
        ? `${idField}='${escapeArcGIS(String(code))}'`
        : `${idField}=${code}`;
    }
  }

  // 2) `tuman` text — fallback when no code is known yet.
  if (trimmedTuman && !/^\d+$/.test(trimmedTuman)) {
    const tumanField = hasFieldMeta ? realName("tuman") : "tuman";
    if (tumanField) return equalsAny(tumanField, nameValues());
  }

  // 3) Any other district-ish text field this service happens to expose.
  if (trimmedTuman && hasFieldMeta) {
    const textField = ["district", "tuman_nomi", "tuman_name", "region_district"]
      .map(realName)
      .find((f): f is string => !!f && layerFieldKind(sublayer, f) === "string");
    if (textField) return equalsAny(textField, nameValues());
  }

  return "";
}
