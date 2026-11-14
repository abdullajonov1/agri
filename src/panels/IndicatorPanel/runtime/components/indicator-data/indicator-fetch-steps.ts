import type { IndicatorWidgetHost } from "../../indicator-host";
import { formatIndicatorStatValue } from "../../../../../data/agri-dashboard-pack-apply";

export const vhWhereSummary = (where: string) => ({
  whereLength: where.length,
  whereHead: where.slice(0, 220),
  inLiteralCount: (where.match(/'[^']*'/g) || []).length,
});

export const normalizeLayerUrl = (layer: __esri.FeatureLayer | null | undefined): string =>
  String(layer?.url || "").replace(/\/+$/, "");

/** Republic overview: Agri_table_data is one national table — summing every
 *  non-republic layer duplicates the same FeatureServer query. */
export const pickNationalSumLayers = (
  fl: __esri.FeatureLayer,
  allLayers: __esri.FeatureLayer[],
  isRepublicLayer: (l: __esri.FeatureLayer) => boolean,
): __esri.FeatureLayer[] => {
  const canonicalUrl = normalizeLayerUrl(fl);
  const nonRepublic = allLayers.filter((l) => !isRepublicLayer(l));
  const distinctUrls = new Set(nonRepublic.map(normalizeLayerUrl).filter(Boolean));
  const sameAsCanonical = (layer: __esri.FeatureLayer) => {
    const a = normalizeLayerUrl(layer);
    return !!a && !!canonicalUrl && a === canonicalUrl;
  };
  if (!nonRepublic.length || distinctUrls.size <= 1 || nonRepublic.every(sameAsCanonical)) {
    return [fl];
  }
  return nonRepublic;
};

export const isStale = (host: IndicatorWidgetHost, requestId: number): boolean =>
  !host._isMounted || requestId !== host._requestId;

/** Format and publish a successful single value (same state shape every branch). */
export const publishValue = (
  host: IndicatorWidgetHost,
  raw: number,
  featureCount?: number,
) => {
  const val = formatIndicatorStatValue(raw, host.props.config?.decimalPlaces || 0);
  const done = { loading: false, lastUpdate: new Date(), error: null };
  if (featureCount === undefined) {
    host.setState({ vegetationArea: val, totalArea: val, ...done });
    return;
  }
  host.setState({ vegetationArea: val, totalArea: val, featureCount, ...done });
};
