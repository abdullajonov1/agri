/**
 * Evapo-style district borders: put Tuman_chegara (or Hosted/district) on the
 * map as a live FeatureLayer with definitionExpression + labelingInfo.
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type EsriMap from "esri/Map";
import { agroV5Log } from "../agri-debug-log";
import {
  DISTRICT_LABEL_FIELD_PREF,
  DISTRICT_NAME_FIELDS,
  DISTRICT_SOATO_FIELDS,
  pickField,
} from "./boundary-fields";
import {
  getAgriDistrictBoundaryFallbackUrl,
  getAgriDistrictBoundaryUrl,
} from "./boundary-modules";
import {
  type DistrictWhereAttempt,
  type ViloyatDistrictFilter,
  buildDistrictWhereAttempts,
  maxDistrictsForViloyat,
} from "./boundary-where";
import {
  bringToFront,
  buildDistrictLabelingInfo,
  clearDistrictFsBorderLayer,
  ensureDistrictFsBorderLayer,
} from "./boundary-graphics";
import { boundaryErrorText } from "./boundary-error";

export interface DistrictFsSyncResult {
  count: number;
  mode: string;
  field: string | null;
  url: string;
}

export interface DistrictFsSyncOptions extends ViloyatDistrictFilter {
  map: EsriMap;
  FeatureLayer: typeof FeatureLayer;
  bordersVisible: boolean;
}

/** Ensure + load the on-map border layer for `url`, or null on failure. */
async function loadFsBorderLayer(
  map: EsriMap,
  FeatureLayerClass: typeof FeatureLayer,
  url: string,
): Promise<FeatureLayer | null> {
  try {
    const layer = ensureDistrictFsBorderLayer(map, FeatureLayerClass, url, true);
    if (!layer) return null;
    if (typeof layer.load === "function") await layer.load();
    return layer;
  } catch (err) {
    agroV5Log(
      "admin-boundary:fs-layer-FAILED",
      { url, error: boundaryErrorText(err) },
      "tuman",
    );
    return null;
  }
}

/** Show the layer filtered to `attempt.where` and label it. */
function applyFsAttempt(
  map: EsriMap,
  layer: FeatureLayer,
  attempt: DistrictWhereAttempt,
): void {
  layer.definitionExpression = attempt.where;
  layer.visible = true;
  const labelField =
    pickField(layer, DISTRICT_LABEL_FIELD_PREF) ||
    pickField(layer, DISTRICT_NAME_FIELDS) ||
    pickField(layer, DISTRICT_SOATO_FIELDS);
  if (labelField) {
    layer.labelingInfo = buildDistrictLabelingInfo(labelField) as __esri.LabelClass[];
    layer.labelsVisible = true;
  }
  bringToFront(map, layer);
}

/**
 * Try every WHERE attempt on one loaded layer; returns the first whose
 * feature count is plausible for a single viloyat.
 */
async function tryFsAttempts(
  map: EsriMap,
  layer: FeatureLayer,
  url: string,
  filter: ViloyatDistrictFilter,
): Promise<DistrictFsSyncResult | null> {
  const attempts = buildDistrictWhereAttempts(layer, filter);
  agroV5Log(
    "admin-boundary:fs-layer-attempts",
    {
      url,
      fields: (layer?.fields || []).map((f) => f?.name),
      modes: attempts.map((a) => a.mode),
    },
    "tuman",
  );

  const maxCount = maxDistrictsForViloyat(filter.districtCodes);

  for (const attempt of attempts) {
    if (!attempt.where || attempt.where === "1=0") continue;
    try {
      const countQuery: __esri.Query | __esri.QueryProperties =
        layer.createQuery?.() || {};
      countQuery.where = attempt.where;
      const count = await layer.queryFeatureCount(countQuery);
      // Reject expressions that clearly include neighboring viloyats.
      if (count <= 0 || count > maxCount) {
        agroV5Log(
          "admin-boundary:fs-layer-skip",
          {
            url,
            mode: attempt.mode,
            count,
            maxCount,
            where: attempt.where.slice(0, 120),
          },
          "tuman",
        );
        continue;
      }
      applyFsAttempt(map, layer, attempt);
      agroV5Log(
        "admin-boundary:fs-layer-ok",
        {
          url,
          mode: attempt.mode,
          field: attempt.field,
          count,
          where: attempt.where.slice(0, 160),
        },
        "tuman",
      );
      return { count, mode: `fs:${attempt.mode}`, field: attempt.field, url };
    } catch (err) {
      agroV5Log(
        "admin-boundary:fs-layer-query-FAILED",
        { url, mode: attempt.mode, error: boundaryErrorText(err) },
        "tuman",
      );
    }
  }
  return null;
}

/**
 * Evapo-style: put Tuman_chegara on the map with definitionExpression + labels.
 * Returns feature count when the expression matches, else 0.
 */
export async function syncDistrictsViaMapFeatureLayer(
  opts: DistrictFsSyncOptions,
): Promise<DistrictFsSyncResult> {
  const { map, FeatureLayer: FeatureLayerClass, bordersVisible } = opts;
  const empty: DistrictFsSyncResult = { count: 0, mode: "none", field: null, url: "" };
  if (!bordersVisible) {
    clearDistrictFsBorderLayer(map);
    return empty;
  }

  const filter: ViloyatDistrictFilter = {
    parentCod: opts.parentCod,
    viloyat: opts.viloyat,
    districtNames: opts.districtNames,
    districtCodes: opts.districtCodes,
  };
  // Prefer chegara for live map FL (Hosted/district PBF tiles are flaky on-map).
  const urls = Array.from(
    new Set(
      [getAgriDistrictBoundaryFallbackUrl(), getAgriDistrictBoundaryUrl()].filter(
        Boolean,
      ),
    ),
  );
  for (const url of urls) {
    const layer = await loadFsBorderLayer(map, FeatureLayerClass, url);
    if (!layer) continue;
    const hit = await tryFsAttempts(map, layer, url, filter);
    if (hit) return hit;
  }

  clearDistrictFsBorderLayer(map);
  return empty;
}
