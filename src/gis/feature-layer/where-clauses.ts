/**
 * Text / crop WHERE builders backed by the per-layer distinct-value index.
 */
import { getQueryUrl, valueIndexCache, valueIndexLoading, VALUE_INDEX_FIELDS, hasFieldIn, flLog, layerLabel, type TextMatchKind, regionDisplayNameToSoato, layerFieldKind, expandRegionVariants, apostropheVariants } from "./primitives";
import { canonicalizeRegionFilterValue, distinctValues, matchRegionValuesFromIndex, addTextEqTerms, literalVariantsForMatch } from "./layer-lookup";
import { isRegionSoatoCode } from "../map-image-predicates";
import { escapeArcGIS } from "../../data/agri-sql";
import type { AgriLayerLike } from "../agri-layer-types";

export async function prepareValueIndex(
  layer: AgriLayerLike | null | undefined,
  available: string[],
): Promise<void> {
  const key = getQueryUrl(layer);
  if (!key || valueIndexCache.has(key)) return;
  const pending = valueIndexLoading.get(key);
  if (pending) return pending;

  const job = (async () => {
    const index: Record<string, string[]> = {};
    const fields = VALUE_INDEX_FIELDS.filter((f) => hasFieldIn(available, f));
    await Promise.all(
      fields.map(async (f) => {
        try {
          index[f.toLowerCase()] = await distinctValues(layer, f);
        } catch {
          index[f.toLowerCase()] = [];
        }
      }),
    );
    valueIndexCache.set(key, index);
    const sample: Record<string, string[]> = {};
    for (const f of Object.keys(index)) sample[f] = index[f].slice(0, 15);
    flLog("value index loaded", { layer: layerLabel(layer), sample });
  })();
  valueIndexLoading.set(key, job);
  try {
    await job;
  } finally {
    valueIndexLoading.delete(key);
  }
}
/** Build an OR clause matching `value` (+ variants) across the given fields. */
export function textMatchClause(
  fields: string[],
  available: string[],
  value: string,
  layer?: AgriLayerLike | null,
  kind: TextMatchKind = "default",
): string {
  const usable = fields.filter((f) => hasFieldIn(available, f));
  if (!usable.length) return "";

  const terms: string[] = [];
  const seen = new Set<string>();

  const addTerm = (term: string): void => {
    if (!term || seen.has(term)) return;
    seen.add(term);
    terms.push(term);
  };

  if (kind === "region") {
    const canonical = canonicalizeRegionFilterValue(value);
    const soato = isRegionSoatoCode(value)
      ? value.trim()
      : regionDisplayNameToSoato(canonical);

    for (const field of usable) {
      const fl = field.toLowerCase();
      if (fl === "region_id" || fl.endsWith("_id")) {
        const indexed = matchRegionValuesFromIndex(
          layer,
          field,
          canonical,
          soato,
        );
        if (indexed?.length) {
          for (const v of indexed) {
            addTextEqTerms(field, [v], layer, v, addTerm);
          }
        } else if (soato) {
          const kind = layerFieldKind(layer, field);
          if (kind === "numeric") {
            addTerm(`${field}=${Number(soato)}`);
          } else {
            addTerm(`${field}='${escapeArcGIS(soato)}'`);
          }
        }
        continue;
      }
      if (fl === "viloyat") {
        const indexed = matchRegionValuesFromIndex(
          layer,
          field,
          canonical,
          soato,
        );
        if (indexed?.length) {
          for (const v of indexed) {
            addTextEqTerms(field, [v], layer, v, addTerm);
          }
        } else {
          addTextEqTerms(
            field,
            expandRegionVariants(canonical),
            layer,
            canonical,
            addTerm,
          );
        }
      }
    }

    if (!terms.length && canonical) {
      addTextEqTerms(
        usable[0],
        expandRegionVariants(canonical),
        layer,
        canonical,
        addTerm,
      );
    }
  } else {
    const literals = literalVariantsForMatch(value, kind);
    if (!literals.length) return "";
    for (const field of usable) {
      addTextEqTerms(field, literals, layer, value, addTerm);
    }
  }

  if (!terms.length) return "";
  return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
}
/**
 * WHERE for crop picker → map / min-max / stats.
 * Matches display name on `crop` only; numeric (or typed) id on `crop_id`.
 * Never compares crop names against a numeric `crop_id` field.
 */
export function buildCropSelectionWhere(
  cropType: string,
  cropId: string | undefined | null,
  available: string[],
  layer?: AgriLayerLike | null,
): string {
  const clauses: string[] = [];

  const buildIdClause = (): string => {
    const id = String(cropId ?? "").trim();
    if (!id) return "";
    if (available.length && !hasFieldIn(available, "crop_id")) return "";

    const terms: string[] = [];
    const seen = new Set<string>();
    const addTerm = (term: string): void => {
      if (!term || seen.has(term)) return;
      seen.add(term);
      terms.push(term);
    };
    const kind = layerFieldKind(layer, "crop_id");
    if (/^\d+$/.test(id)) {
      if (kind === "numeric") {
        addTerm(`crop_id=${Number(id)}`);
      } else if (kind === "string") {
        addTerm(`crop_id='${escapeArcGIS(id)}'`);
      } else {
        addTerm(`crop_id=${Number(id)}`);
      }
    } else if (available.length) {
      addTextEqTerms("crop_id", [id], layer, id, addTerm);
    }
    if (!terms.length) return "";
    return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
  };

  const buildNameClause = (): string => {
    const name = String(cropType ?? "").trim();
    if (!name) return "";
    if (available.length && !hasFieldIn(available, "crop")) return "";

    if (available.length) {
      return textMatchClause(["crop"], available, name, layer);
    }
    const literals = apostropheVariants(name);
    if (!literals.length) return "";
    if (literals.length === 1) {
      return `crop='${escapeArcGIS(literals[0])}'`;
    }
    return `(${literals
      .map((v) => `crop='${escapeArcGIS(v)}'`)
      .join(" OR ")})`;
  };

  const idClause = buildIdClause();
  const nameClause = buildNameClause();
  if (idClause) clauses.push(idClause);
  if (nameClause) clauses.push(nameClause);

  if (!clauses.length) return "";
  return clauses.length === 1 ? clauses[0] : `(${clauses.join(" OR ")})`;
}
