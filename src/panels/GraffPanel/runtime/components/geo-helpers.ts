import type { GraffWidgetHost } from "../graff-host";
import { describeThrown } from "../graff-guards";
import { normalizeApos as normalizeAposSql, eqAposSmart as eqAposSmartShared, buildTumanEqualsSql } from "../../../../data/agri-sql";
import { makeRegionDistrictKey as makeRegionDistrictKeyShared } from "../../../../filter/localization/geo-keys";
import { getTuriCropLookupKey } from "../../../../shared/agri-crop-labels";
import { stripUniqueidBraces } from "../../../../data/agri-uniqueid-sql";
import { getAgriTableDataLayer } from "../../../../gis/agri-table-data-source";
import { formatArcgisDateToYmd } from "../../../../gis/agri-vegetation-data-source";
import { resolveAgainstAvailableDates as resolveAgainstAvailableDatesShared } from "../../../../data/agri-graff-date";
import { graffLog } from "../graff-log";

// Handle apostrophe variants for consistent text filtering
/** No trailing trim — matches agri-sql.normalizeApos (Graff historical behavior). */
export function normalizeApos(host: GraffWidgetHost, s: string): string {
  return normalizeAposSql(s);
}

// Canonicalize keys used for viloyat/tuman → region/district dictionaries
export function makeRegionDistrictKey(host: GraffWidgetHost, raw: string | null | undefined): string {
  return makeRegionDistrictKeyShared(raw);
}

export const resolveCropIdForTuri = (host: GraffWidgetHost, turi: string): string | undefined => {
  const key = getTuriCropLookupKey(turi);
  return key ? host._turiToCropId[key] : undefined;
};

/** Numeric crop_id for the selected polygon (table row turi → crop map). */
export const resolveCropIdForUniqueid = (host: GraffWidgetHost, uniqueid: string | null | undefined): number | null => {
  const clean = stripUniqueidBraces(uniqueid || "");
  if (!clean) return null;
  const record =
    (host.state.records || []).find(
      (r) => stripUniqueidBraces(String(r?.uniqueid || "")) === clean,
    ) || null;
  const turi = String(record?.turi || "").trim();
  const fromTuri = turi ? host.resolveCropIdForTuri(turi) : undefined;
  const raw =
    fromTuri ??
    record?.crop_id ??
    record?.cropId ??
    null;
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  // Wheat is crop_id=6 in api-agri; map by name when the table has no id yet.
  const turiKey = getTuriCropLookupKey(turi);
  if (turiKey === "bugdoy") return 6;
  return null;
};

/**
 * Resolve a district inside its parent region. Tuman names are not
 * guaranteed to be unique across Uzbekistan, so a name-only dictionary
 * can silently select another viloyat's district.
 */
export function resolveDistrictNumber(host: GraffWidgetHost, viloyat: string, tuman: string, regionHint?: number): number | undefined {
  const effectiveTuman = host.normalizeApos(tuman);
  if (/^\d+$/.test(effectiveTuman)) return Number(effectiveTuman);

  const tumanKey = host.makeRegionDistrictKey(effectiveTuman);
  if (!tumanKey) return undefined;

  const effectiveViloyat = host.normalizeApos(viloyat);
  const viloyatKey = host.makeRegionDistrictKey(effectiveViloyat);
  const mappedRegion =
    regionHint !== undefined && Number.isFinite(regionHint)
      ? regionHint
      : /^\d+$/.test(effectiveViloyat)
        ? Number(effectiveViloyat)
        : viloyatKey
          ? host._viloyatToRegion[viloyatKey]
          : undefined;

  const lookupKeys: string[] = [];
  if (mappedRegion !== undefined && Number.isFinite(mappedRegion)) {
    lookupKeys.push(`region:${mappedRegion}|${tumanKey}`);
  }
  if (viloyatKey) lookupKeys.push(`viloyat:${viloyatKey}|${tumanKey}`);

  for (const key of lookupKeys) {
    const district = host._tumanToDistrict[key];
    if (district !== undefined && Number.isFinite(district)) return district;
  }
  return undefined;
}

export const storeRegionDistrictMappingRow = (host: GraffWidgetHost, viloyatRaw: string | null | undefined, regionRaw: unknown, tumanRaw: string | null | undefined, districtRaw: unknown, count: number = 1): void => {
  const viloyatKey = host.makeRegionDistrictKey(
    viloyatRaw != null && viloyatRaw !== "" ? String(viloyatRaw) : null,
  );
  const region =
    regionRaw != null && regionRaw !== "" ? Number(regionRaw) : NaN;
  const tumanKey = host.makeRegionDistrictKey(
    tumanRaw != null && tumanRaw !== "" ? String(tumanRaw) : null,
  );
  const district =
    districtRaw != null && districtRaw !== "" ? Number(districtRaw) : NaN;
  const vote = Number.isFinite(count) && count > 0 ? count : 1;

  if (viloyatKey && Number.isFinite(region)) {
    host._viloyatToRegion[viloyatKey] = region;
  }
  if (!(tumanKey && Number.isFinite(district))) return;

  const put = (key: string) => {
    const prevVote = host._tumanToDistrictVotes[key] ?? 0;
    if (host._tumanToDistrict[key] == null || vote > prevVote) {
      host._tumanToDistrict[key] = district;
      host._tumanToDistrictVotes[key] = vote;
    }
  };
  if (Number.isFinite(region)) {
    put(`region:${region}|${tumanKey}`);
  }
  if (viloyatKey) {
    put(`viloyat:${viloyatKey}|${tumanKey}`);
  }
};

/**
 * When the initial grouped scan missed a selection (new year, spelling
 * variant, etc.), look up the exact viloyat/tuman pair in Agri_table_data.
 */
export const ensureRegionDistrictForSelection = async (host: GraffWidgetHost): Promise<void> => {
  const { viloyat, tuman } = host.state.regionalFilters;
  const effectiveViloyat = host.normalizeApos(viloyat);
  const effectiveTuman = host.normalizeApos(tuman);
  const vilKey = host.makeRegionDistrictKey(effectiveViloyat);
  const tumanKey = host.makeRegionDistrictKey(effectiveTuman);

  const storedRegionCode =
    host.state.regionalRegionCode != null &&
    Number.isFinite(host.state.regionalRegionCode)
      ? host.state.regionalRegionCode
      : undefined;
  const regionHint =
    storedRegionCode ??
    (vilKey ? host._viloyatToRegion[vilKey] : undefined);

  const districtResolved =
    !effectiveTuman ||
    (host.state.regionalDistrictCode != null &&
      Number.isFinite(host.state.regionalDistrictCode)) ||
    host.resolveDistrictNumber(effectiveViloyat, effectiveTuman, regionHint) !==
      undefined;
  const regionResolved =
    !effectiveViloyat ||
    storedRegionCode !== undefined ||
    (vilKey ? host._viloyatToRegion[vilKey] : undefined) !== undefined;

  if (districtResolved && regionResolved) return;

  const whereParts: string[] = [];
  if (effectiveViloyat) whereParts.push(host.eqAposSmart("viloyat", viloyat));
  if (effectiveTuman) whereParts.push(host.eqAposSmart("tuman", tuman));
  if (!whereParts.length) return;

  try {
    const { layer } = await getAgriTableDataLayer();
    const query = layer.createQuery();
    query.where = whereParts.join(" AND ");
    query.outFields = ["viloyat", "region", "tuman", "district"];
    query.returnGeometry = false;
    query.num = 25;

    const result = await layer.queryFeatures(query);
    for (const feature of result?.features ?? []) {
      const attrs: { viloyat?: string | null; region?: unknown; tuman?: string | null; district?: unknown } = feature?.attributes || {};
      host.storeRegionDistrictMappingRow(
        attrs.viloyat,
        attrs.region,
        attrs.tuman,
        attrs.district,
      );
    }
    graffLog("regionDistrictMap:on-demand", {
      viloyat,
      tuman,
      matchCount: result?.features?.length ?? 0,
      resolvedRegionNum: vilKey ? host._viloyatToRegion[vilKey] : null,
      resolvedDistrictNum: effectiveTuman
        ? host.resolveDistrictNumber(
            effectiveViloyat,
            effectiveTuman,
            regionHint,
          )
        : null,
    });
  } catch (err) {
    graffLog("regionDistrictMap:on-demand-FAILED", {
      viloyat,
      tuman,
      error: describeThrown(err),
    });
  }
};

export function eqAposSmart(host: GraffWidgetHost, field: string, raw: string): string {
  if (!raw) return "";
  // agri-sql.eqAposSmart already trims + normalizeApos (no Localization trim).
  return eqAposSmartShared(field, raw);
}

/**
 * Tuman WHERE — prefer numeric district SOATO when mapped; fall back to
 * compact apostrophe + tumani name forms.
 */
export function buildTumanNameClause(host: GraffWidgetHost, tuman: string, viloyat?: string): string {
  const code = host.resolveDistrictNumber(String(viloyat || ""), tuman);
  if (code != null && Number.isFinite(code)) {
    return `district = '${code}'`;
  }
  return buildTumanEqualsSql("tuman", tuman);
}

/**
 * Vegetation /available-dates and export-image speak plain "YYYY-MM-DD"
 * (calendar day in the pipeline). Always derive that via UTC so chart
 * clicks, ArcGIS date filtering, and the API stay on the same string —
 * local getFullYear/getMonth/getDate shifts the day in non-UTC browser
 * timezones and silently skipped rasters (SKIP-unavailable-date).
 */
export const formatLocalDateYmd = (host: GraffWidgetHost, dt: Date): string => {
  return formatArcgisDateToYmd(dt) || "";
};

/**
 * Map a raw ArcGIS date (or Date) onto an advertised available-dates YMD.
 * Tries UTC day first, then local day, then nearest advertised day within
 * 2 days — covers timezone skew between agri_vegetation_indices and
 * api-agri without inventing distant dates.
 */
export const resolveAgainstAvailableDates = (host: GraffWidgetHost, rawDate: unknown, availableDates: string[]): string | null =>
  resolveAgainstAvailableDatesShared(rawDate, availableDates);
