import type { CropUniqueValueInfo, LocalizationHost } from "../host";
import type { AgriMapLayer } from "../../../../localization/agri-map-layer";
import { findLayerFieldName as findLayerFieldNameShared, buildCropDistinctCacheKey } from "../../../../localization/layer-utils";
import { buildCropUniqueValueInfosFromValues as buildCropUniqueValueInfosShared } from "../../../../localization/crop-renderer";
import { buildYearClauseForLayerFields, buildTableDateEqualsWhere } from "../../../../localization/map-where-clauses";
import { getMasterFilterSnapshot } from "../../../../../data/agri-filter-store";
import { eqAposSmart as eqAposSmartShared } from "../../../../../data/agri-sql";
import type { ChartFilterFlags } from "../../../../../gis/agri-chart-filter-order";
import { deriveChartFilterFlags } from "../../../../../gis/agri-chart-filter-order";

export function getEffectiveViloyat(host: LocalizationHost): string {
  return host.normalizeApos(
    (host.state.lockedViloyat || host.state.viloyat || "").toString(),
  );
}

export function findLayerFieldName(host: LocalizationHost, layer: AgriMapLayer, name: string): string | null {
  return findLayerFieldNameShared(layer, name);
}

export const cropDistinctCacheKey = (host: LocalizationHost, layer: AgriMapLayer, field: string, where: string): string =>
  buildCropDistinctCacheKey(layer, field, where);

export const buildCropUniqueValueInfosFromValues = (host: LocalizationHost, field: string, distinctValues: string[]): CropUniqueValueInfo[] =>
  buildCropUniqueValueInfosShared(
      field,
      distinctValues,
      host._turiToCropId || {},
    );

export function buildYearClauseForLayer(host: LocalizationHost, layer: __esri.FeatureLayer): string {
  return buildYearClauseForLayerFields(
    host.state.yil || "",
    layer?.fields || [],
  );
}

/** Late-mounted indicators ask for the last filter payload after Localization already broadcast. */
export const handleRequestMasterFilterState = (host: LocalizationHost): void => {
  if (!host._isMounted) return;
  const detail = getMasterFilterSnapshot() ?? host._lastBroadcastDetail;
  if (!detail) return;
  document.dispatchEvent(
    new CustomEvent("masterFilterChanged", {
      detail,
      bubbles: true,
    }),
  );
};

export function getMapWidgetId(host: LocalizationHost): string | null {
  const ids: ArrayLike<string> | null | undefined = host.props.useMapWidgetIds;
  const first = ids?.length ? ids[0] : null;
  return first ? String(first) : null;
}

export const schedulePolygonFilterGuards = (host: LocalizationHost): void => {
  host.clearPolygonFilterGuards();
  [0, 300, 900].forEach((delay) => {
    host._polygonFilterGuardTimers.push(
      setTimeout(
        () => host.reassertPolygonGeographyFilter(`after-${delay}ms`),
        delay,
      ),
    );
  });
};

export function eqAposSmart(host: LocalizationHost, field: string, raw: string): string {
  if (!raw) return "";
  // Localization normalize trims; agri-sql eqAposSmart also trims — keep both.
  return eqAposSmartShared(field, host.normalizeApos(String(raw)));
}

export const getAposHelpers = (host: LocalizationHost) =>
  ({
    normalizeApos: (s: string) => host.normalizeApos(s),
    makeRegionDistrictKey: (raw: string | null | undefined) =>
      host.makeRegionDistrictKey(raw),
    eqAposSmart: (field: string, value: string) =>
      host.eqAposSmart(field, value),
  });

export const getChartFilterFlags = (host: LocalizationHost, vh = String(host.state.vh || "").trim(), turlar = host.getSelectedTurlar()): ChartFilterFlags =>
  deriveChartFilterFlags(
      host._chartDimOrder,
      Boolean(vh),
      turlar.length > 0,
    );

/**
 * Crop ids that scope VH uniqueid queries — only when crop was selected
 * before VH (filterVhBarByCrop). VH-first keeps [] so cache keys match
 * resolveVhMapUniqueIds / map AND-turi behavior.
 */
export const getCropIdsForVhUniqueIdScope = (host: LocalizationHost): string[] => {
  if (!host.getChartFilterFlags().filterVhBarByCrop) return [];
  return Array.from(
    new Set(
      host.getSelectedTurlar()
        .map((turi) => host.resolveCropIdForTuri(turi))
        .filter((value): value is string => Boolean(value)),
    ),
  );
};

/** Build table WHERE for date field matching selected ndviDate (YYYY-MM-DD or string). */
export function buildTableDateWhere(host: LocalizationHost, dateField: string, ndviDate: string): string | null {
  return buildTableDateEqualsWhere(dateField, ndviDate);
}

export const getGeoCodeHelpers = (host: LocalizationHost) =>
  ({
    normalizeApos: (s: string) => host.normalizeApos(s),
    makeRegionDistrictKey: (raw: string | null | undefined) =>
      host.makeRegionDistrictKey(raw),
  });

/** Scope tag for `_vhBarUsedDate`: which viloyat/tuman proved that date. */
export const makeVhBarDateGeoKey = (host: LocalizationHost): string =>
  [
      host.makeRegionDistrictKey(host.state.lockedViloyat || host.state.viloyat),
      host.makeRegionDistrictKey(host.state.tuman),
    ].join("|");
