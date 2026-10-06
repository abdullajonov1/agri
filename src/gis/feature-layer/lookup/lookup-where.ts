import { normalizeFarmerTaxSearchValue, hasFieldIn, FARMER_TAX_NUMBER_FIELD, layerFieldKind, FARMER_TAX_NUMBER_DIGITS, normalizeLandTypeValue, matchIndexedValues, apostropheVariants } from "../primitives";
import { escapeArcGIS, escapeLikeLiteral } from "../../../data/agri-sql";
import { addTextEqTerms } from "./lookup-match";
import type { AgriLayerLike } from "../../agri-layer-types";

/**
 * WHERE for STIR qidiruv — `tax_number`.
 * Maydon tipi layer metadata dan olinadi: string maydonda raqamsiz literal
 * serverda "Unable to complete operation" beradi.
 */
export function buildFarmerTaxWhere(
  taxValue: string,
  available: string[],
  layer?: AgriLayerLike | null,
): string {
  const raw = normalizeFarmerTaxSearchValue(taxValue);
  if (!raw) return "";
  if (available.length && !hasFieldIn(available, FARMER_TAX_NUMBER_FIELD)) {
    return "1=0";
  }

  const fieldName =
    available.find(
      (f) => f.toLowerCase() === FARMER_TAX_NUMBER_FIELD,
    ) || FARMER_TAX_NUMBER_FIELD;

  const kind = layer ? layerFieldKind(layer, fieldName) : "unknown";
  const esc = escapeArcGIS(raw);
  const likeEsc = escapeLikeLiteral(raw);
  const numericValue = Number(raw);

  const exactClause = (): string => {
    if (kind === "string") {
      return `${fieldName}='${esc}'`;
    }
    if (kind === "numeric") {
      if (!Number.isFinite(numericValue)) return "1=0";
      return `${fieldName}=${numericValue}`;
    }
    const parts: string[] = [`${fieldName}='${esc}'`];
    if (Number.isFinite(numericValue)) {
      parts.push(`${fieldName}=${numericValue}`);
    }
    return parts.length === 1 ? parts[0] : `(${parts.join(" OR ")})`;
  };

  if (raw.length >= FARMER_TAX_NUMBER_DIGITS) {
    return exactClause();
  }

  const prefixStringClause = `${fieldName} LIKE '${likeEsc}%'`;

  if (kind === "string") {
    return prefixStringClause;
  }

  if (!Number.isFinite(numericValue)) return "1=0";

  const remainingDigits = FARMER_TAX_NUMBER_DIGITS - raw.length;
  const factor = Math.pow(10, remainingDigits);
  const min = numericValue * factor;
  const max = (numericValue + 1) * factor;
  const rangeClause = `(${fieldName}>=${min} AND ${fieldName}<${max})`;

  if (kind === "numeric") {
    return rangeClause;
  }
  return `(${rangeClause} OR ${prefixStringClause})`;
}
export function buildLandTypeWhere(
  yerTuri: string | undefined | null,
  yerTuriId: string | undefined | null,
  available: string[],
  layer?: AgriLayerLike | null,
): string {
  const key =
    normalizeLandTypeValue(String(yerTuriId ?? "")) ||
    normalizeLandTypeValue(String(yerTuri ?? ""));
  if (!key) return "";

  const id = key === "sugoriladigan" ? "1" : "2";

  const labels =
    key === "sugoriladigan"
      ? [
          "Sug'oriladigan",
          "Sug'orilgan",
          "Sugoriladigan",
          "Sugorilgan",
          "Sug’oriladigan",
          "Sug’orilgan",
        ]
      : ["Lalmi"];
  const terms: string[] = [];
  const seen = new Set<string>();
  const addTerm = (term: string): void => {
    if (!term || seen.has(term)) return;
    seen.add(term);
    terms.push(term);
  };

  // Prefer type_id (ID 1 = Sug'orilgan, ID 2 = Lalmi). Barchasi → no clause.
  if (!available.length || hasFieldIn(available, "type_id")) {
    const matchedIds = layer
      ? matchIndexedValues(layer, "type_id", id)
      : null;
    if (matchedIds?.length) {
      for (const v of matchedIds) {
        addTextEqTerms("type_id", [v], layer, v, addTerm);
      }
    } else {
      const kind = layerFieldKind(layer, "type_id");
      if (kind === "numeric") addTerm(`type_id=${Number(id)}`);
      else addTerm(`type_id='${escapeArcGIS(id)}'`);
    }
  }

  if (hasFieldIn(available, "type")) {
    for (const label of labels) {
      addTextEqTerms("type", apostropheVariants(label), layer, label, addTerm);
    }
  }

  if (hasFieldIn(available, "yer_turi")) {
    for (const label of labels) {
      addTextEqTerms(
        "yer_turi",
        apostropheVariants(label),
        layer,
        label,
        addTerm,
      );
    }
  }

  if (!terms.length) return "";
  return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
}
