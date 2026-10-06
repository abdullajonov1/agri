import {
  assembleLocalizationWhere,
  buildNdviDateNotNullSqlClause,
  buildNdviStatusEqualsSqlClause,
  buildUniqueIdSqlClause,
  buildViloyatRegionSqlClause,
} from "../../../../localization/map-where-clauses";
import { resolveDistrictNumberFromMaps } from "../../../../localization/resolve-geo-codes";
import { buildTumanEqualsSql, escapeArcGIS } from "../../../../../data/agri-sql";
import { buildYearLikeClause } from "../../../../../controller/agri-where-builder";
import { buildSpatialJoinWhere } from "../../../../../gis/agri-table-data-source";
import { withAgriAccessWhere } from "../../../../../gis/feature-layer-data";
import { agriLog } from "../localization-log";
import type { LocalizationConfig, LocalizationHost } from "../host";

export function buildUniqueIdClause(host: LocalizationHost, raw: string, layer?: __esri.FeatureLayer): string {
  const field = layer
    ? host.findLayerFieldName(layer, "uniqueid") || "uniqueid"
    : "uniqueid";
  return buildUniqueIdSqlClause(raw, field);
}

/**
 * Build viloyat filter clause using stored viloyat → region mapping.
 * Supports: viloyat name (looks up region number from _viloyatToRegion) or raw region number.
 */
export function buildViloyatRegionClause(host: LocalizationHost): string {
  const { viloyat, lockedViloyat } = host.state;
  const rawViloyat = (lockedViloyat ?? viloyat ?? "").toString();
  return buildViloyatRegionSqlClause(
    rawViloyat,
    host._viloyatToRegion,
    host.getAposHelpers(),
  );
}

/**
 * Build tuman filter for Agri_table / Jadval / map definitionExpression.
 *
 * Prefer numeric `district` SOATO (same id used for Tuman_chegara borders
 * and VH). Name→code comes from majority-voted Agri_table mappings so rare
 * poison rows (Qamashi tagged with Yakkabog' code) cannot win. Fall back to
 * tuman text only when no code is known yet.
 */
export function buildTumanDistrictClause(host: LocalizationHost): string {
  const { tuman, viloyat, lockedViloyat } = host.state;
  const rawViloyat = (lockedViloyat ?? viloyat ?? "").toString();
  const rawTuman = (tuman ?? "").toString();
  const effectiveTuman = host.normalizeApos(rawTuman);
  if (!effectiveTuman) return "";

  const districtCode = resolveDistrictNumberFromMaps(
    rawTuman,
    host._tumanToDistrict,
    host.getGeoCodeHelpers(),
    {
      rawViloyat,
      viloyatToRegion: host._viloyatToRegion,
    },
  );

  let clause: string;
  let mode: string;
  if (/^\d+$/.test(effectiveTuman)) {
    clause = `district = '${Number(effectiveTuman)}'`;
    mode = "tuman-numeric";
  } else if (districtCode != null && Number.isFinite(districtCode)) {
    clause = `district = '${districtCode}'`;
    mode = "district-id";
  } else {
    clause = buildTumanEqualsSql("tuman", effectiveTuman);
    mode = "tuman-text";
  }

  agriLog("buildTumanDistrictClause", {
    viloyat: rawViloyat,
    tuman: effectiveTuman,
    districtCode: districtCode ?? null,
    clause,
    mode,
  });
  return clause;
}

/**
 * Build spatial WHERE clause (yil + viloyat + tuman [+ optional turi]).
 * When includeTuri is false, bar/chart logic can ignore crop (turi) and
 * show vegetation for the whole region; when true, it is included.
 */
export function buildNdviSpatialWhere(host: LocalizationHost, includeTuri = true): string {
  const where = host.buildWhereClause(false, includeTuri);
  return where;
}

/**
 * Build NDVI status filter clause for the currently selected VH bucket and ndviDate.
 * Example: status_2025_09_01 = 'yaxshi'
 */
export function buildNdviStatusClauseForCurrentVh(host: LocalizationHost): string {
  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];
  if (!primaryLayer) return "";

  const cfg = (host.props.config || {}) as LocalizationConfig;
  const prefix =
    (cfg.polygonStatusPrefix || "status_").toString().trim() || "status_";

  return buildNdviStatusEqualsSqlClause({
    ndviDate: host.state.ndviDate || "",
    vhCategory: host.state.vh || "",
    prefix,
    dateFieldMap: host._ndviDateFieldMap,
    layerFields: primaryLayer.fields || [],
  });
}

/**
 * Build NDVI date-only clause (no VH bucket) for the current ndviDate.
 * Example: status_2025_09_18 IS NOT NULL
 */
export function buildNdviDateClauseWithoutVh(host: LocalizationHost): string {
  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];
  if (!primaryLayer) return "";

  const cfg = (host.props.config || {}) as LocalizationConfig;
  const prefix =
    (cfg.polygonStatusPrefix || "status_").toString().trim() || "status_";

  return buildNdviDateNotNullSqlClause({
    ndviDate: host.state.ndviDate || "",
    prefix,
    dateFieldMap: host._ndviDateFieldMap,
    layerFields: primaryLayer.fields || [],
  });
}

export function buildWhereClause(
  host: LocalizationHost,
  includeVh = true,
  includeTuri = true,
  includeViloyat = true,
  layer?: __esri.FeatureLayer,
): string {
  const { yil, viloyat, tuman, lockedViloyat } = host.state;

  // Require year first
  if (!yil) return "1=0";

  let yearClause: string;
  if (layer) {
    yearClause = host.buildYearClauseForLayer(layer);
  } else {
    yearClause = buildYearLikeClause(yil);
    if (!yearClause) return "1=0";
  }

  // In default republic mode (no effective viloyat), ignore stale tuman so
  // VH bar reflects full-country totals for the selected year.
  const hasEffectiveViloyat = !!host.normalizeApos(
    (lockedViloyat || viloyat || "").toString(),
  );
  const vhCategory = host.normalizeApos(String(host.state.vh || "")).trim();

  let uniqueIdClause = "";
  if (host.state.polygonMode && host.state.selectedGraffUniqueid) {
    uniqueIdClause =
      host.buildUniqueIdClause(host.state.selectedGraffUniqueid, layer) || "";
  }

  const farmerInn = String(host.state.selectedFarmerInn || "").trim();
  const farmerInnClause = farmerInn
    ? `UPPER(f_inn)=UPPER('${escapeArcGIS(farmerInn)}')`
    : "";

  return assembleLocalizationWhere({
    yearClause,
    includeViloyat,
    viloyatClause: host.buildViloyatRegionClause(),
    includeTuman: !!(tuman && (includeViloyat || hasEffectiveViloyat)),
    tumanClause: host.buildTumanDistrictClause(),
    includeTuri,
    cropClause: host.buildTurlarClause("turi"),
    includeVh,
    vhCategory,
    vhUniqueIds: host._vhMapUniqueIds,
    uniqueIdClause,
    farmerInnClause,
    buildSpatialJoinWhere,
    withAccessWhere: withAgriAccessWhere,
  });
}
