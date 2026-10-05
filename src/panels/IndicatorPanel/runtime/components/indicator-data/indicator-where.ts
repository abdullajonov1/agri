import type { IndicatorWidgetHost } from "../../indicator-host";
import { FILTER_FIELDS } from "../../indicator-constants";
import { escapeLikeLiteral, eqAposSmart } from "../../../../../data/agri-sql";
import { buildSpatialJoinWhere } from "../../../../../gis/agri-table-data-source";
import { withAgriAccessWhere } from "../../../../../gis/feature-layer-data";
import { buildIndicatorStatsWhere } from "../../../../../controller/agri-where-builder";
import type { IndicatorConfig } from "../../widget";

export function buildWhereClause(host: IndicatorWidgetHost, includeViloyat = true): string {
  const {
    selectedYil,
    selectedViloyat,
    selectedTuman,
    selectedCropType,
    selectedYerToifas,
    selectedYerToifalari,
    selectedUniqueid,
    selectedVegetationStatus,
    vhUniqueids,
  } = host.state;

  // VH / uniqueid path stays fully local — pack never owns these queries.
  if (selectedVegetationStatus) {
    const vhClauses: string[] = [];
    if (selectedYil) {
      const yDigits =
        String(selectedYil).match(/\b(18|19|20)\d{2}\b/)?.[0] ??
        String(selectedYil).replace(/[^\d]/g, "");
      if (yDigits)
        vhClauses.push(
          `${FILTER_FIELDS.YIL} LIKE '${escapeLikeLiteral(yDigits)}%'`,
        );
      else
        vhClauses.push(
          `${FILTER_FIELDS.YIL} LIKE '%${escapeLikeLiteral(String(selectedYil))}%'`,
        );
    }
    const vhScoped =
      !!String(selectedVegetationStatus || "").trim() &&
      Array.isArray(vhUniqueids) &&
      vhUniqueids.length > 0;
    if (includeViloyat && selectedViloyat && !vhScoped)
      vhClauses.push(eqAposSmart(FILTER_FIELDS.VILOYAT, selectedViloyat));
    if (selectedTuman && !vhScoped)
      vhClauses.push(eqAposSmart(FILTER_FIELDS.TUMAN, selectedTuman));

    const yerToifasFieldVh = (
      host.props.config?.yerToifasField || FILTER_FIELDS.TURI
    ).trim();
    const selectedTurlarVh = host.normalizeTurlar(
      selectedYerToifalari,
      selectedYerToifas,
    );
    const cropClauseVh = host.buildTurlarClause(
      yerToifasFieldVh,
      selectedTurlarVh,
    );
    if (cropClauseVh) vhClauses.push(cropClauseVh);

    if (!Array.isArray(vhUniqueids)) {
      // Pending Localization resolve — not confirmed empty.
      // fetchData() already keeps the spinner when !Array.isArray; this
      // blocks any other caller from querying unscoped geography as "0".
      return "1=0";
    }
    if (!vhUniqueids.length) return "1=0";
    const joinIds =
      host._vhJoinSource === vhUniqueids && host._vhJoinExpanded
        ? host._vhJoinExpanded
        : vhUniqueids;
    vhClauses.push(buildSpatialJoinWhere(joinIds));

    if (selectedCropType)
      vhClauses.push(eqAposSmart(FILTER_FIELDS.EKIN, selectedCropType));
    if (selectedUniqueid)
      vhClauses.push(eqAposSmart("uniqueid", selectedUniqueid));

    const configFilterExpressionVh = host.props.config?.filterExpression;
    if (
      configFilterExpressionVh &&
      configFilterExpressionVh.trim() !== "" &&
      configFilterExpressionVh !== "1=1" &&
      !vhClauses.some((c) => c.includes(configFilterExpressionVh))
    ) {
      vhClauses.push(`(${configFilterExpressionVh})`);
    }

    return withAgriAccessWhere(
      vhClauses.length > 0 ? vhClauses.join(" AND ") : "1=1",
    );
  }

  const yerToifasField = (
    host.props.config?.yerToifasField || FILTER_FIELDS.TURI
  ).trim();
  const selectedTurlar = host.normalizeTurlar(
    selectedYerToifalari,
    selectedYerToifas,
  );

  let where = buildIndicatorStatsWhere(
    {
      yil: selectedYil || "",
      viloyat: selectedViloyat || "",
      tuman: selectedTuman || "",
      turi: selectedYerToifas || "",
      turlar: selectedTurlar,
    },
    {
      includeViloyat,
      yearField: FILTER_FIELDS.YIL,
      turiField: yerToifasField,
    },
  );

  const extras: string[] = [];
  if (selectedCropType)
    extras.push(eqAposSmart(FILTER_FIELDS.EKIN, selectedCropType));
  if (selectedUniqueid) extras.push(eqAposSmart("uniqueid", selectedUniqueid));

  const configFilterExpression = host.props.config?.filterExpression;
  if (
    configFilterExpression &&
    configFilterExpression.trim() !== "" &&
    configFilterExpression !== "1=1" &&
    !String(where).includes(configFilterExpression)
  ) {
    extras.push(`(${configFilterExpression})`);
  }

  if (extras.length) {
    where = `(${where}) AND (${extras.join(" AND ")})`;
  }

  return where;
}
export function buildApiUrl(host: IndicatorWidgetHost): string {
  const cfg = (host.props.config || {}) as IndicatorConfig;

  let endpoint: string = (
    cfg.apiEndpoint ??
    cfg.apiUrl ??
    cfg.endpoint ??
    cfg.url ??
    ""
  )
    .toString()
    .trim();

  if (!endpoint)
    throw new Error(
      "Missing API endpoint: set config.apiEndpoint (or apiUrl/endpoint/url).",
    );

  endpoint = endpoint.split("?")[0].replace(/[?&]$/, "");

  const {
    selectedYil,
    selectedViloyat,
    selectedTuman,
    selectedYerToifas,
    selectedCropType,
  } = host.state;

  const enc = (v: string) =>
    encodeURIComponent(host.normalizeUzbekForApi(v || ""));

  const replacements: Record<string, string> = {
    "{yil}": enc(selectedYil),
    "{viloyat}": enc(selectedViloyat),
    "{tuman}": enc(selectedTuman),

    // ✅ CHANGED: support {turi} and old {tur}
    "{turi}": enc(selectedYerToifas),
    "{tur}": enc(selectedYerToifas),

    // Vegetatsiya Holati (AgriBar) never filters this indicator.
    "{vh}": "",
    "{ekin_turi}": enc(selectedCropType),
  };

  endpoint = endpoint.replace(
    /\{(yil|viloyat|tuman|turi|tur|vh|ekin_turi)\}/g,
    (m) => replacements[m] ?? "",
  );

  return endpoint;
}
