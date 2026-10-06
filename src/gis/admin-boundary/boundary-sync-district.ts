/**
 * Single-tuman sync: draw the selected district's outline + label and return
 * its extent for zoom.
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type Extent from "esri/geometry/Extent";
import { isValidMapExtent } from "../feature-layer-data";
import { agroV5Log } from "../agri-debug-log";
import {
  getAgriDistrictBoundaryUrl,
  getDetachedQueryLayer,
  getDistrictLayerUrlCandidates,
} from "./boundary-modules";
import { buildSingleDistrictAttempts, resolveDistrictWhere } from "./boundary-where";
import {
  AGRI_DISTRICT_LABEL_LAYER_ID,
  bringToFront,
  clearDistrictFsBorderLayer,
  clearDistrictLabelFeatureLayer,
  clearDistrictViewGraphics,
  findLayerById,
  hideLayer,
} from "./boundary-graphics";
import { queryAndDrawOutline } from "./boundary-outline-query";
import { boundaryErrorText } from "./boundary-error";
import type {
  AgriAdminBoundarySyncResult,
  BoundarySyncContext,
} from "./boundary-sync-context";

interface SingleDistrictDraw {
  extent: Extent | null;
  featureCount: number;
  mode: string;
  url: string;
}

const NOTHING_DRAWN: SingleDistrictDraw = {
  extent: null,
  featureCount: 0,
  mode: "none",
  url: "",
};

function drawDistrictWhere(
  ctx: BoundarySyncContext,
  queryLayer: FeatureLayer,
  where: string,
): ReturnType<typeof queryAndDrawOutline> {
  return queryAndDrawOutline({
    queryLayer,
    outlineLayer: ctx.districtOutline,
    Graphic: ctx.modules.Graphic,
    FeatureLayer: ctx.modules.FeatureLayer,
    where,
    view: ctx.view,
    outlineWidth: 0.85,
    bordersVisible: ctx.bordersVisible,
    withLabels: true,
    districtStyle: true,
  });
}

/**
 * Same multi-service / typed-WHERE path as the viloyat overview:
 * Hosted/district alone returned 0 features for named tumans.
 */
async function drawViaCandidateServices(
  ctx: BoundarySyncContext,
): Promise<SingleDistrictDraw> {
  for (const url of getDistrictLayerUrlCandidates()) {
    let queryLayer: FeatureLayer;
    try {
      queryLayer = await getDetachedQueryLayer(ctx.modules.FeatureLayer, url);
    } catch (err) {
      agroV5Log(
        "admin-boundary:district-layer-FAILED",
        { url, error: boundaryErrorText(err) },
        "tuman",
      );
      continue;
    }
    const attempts = buildSingleDistrictAttempts(queryLayer, {
      tuman: ctx.tuman,
      districtCode: ctx.districtCode,
      parentCod: ctx.parentCod,
      viloyat: ctx.viloyat,
    });
    for (const attempt of attempts) {
      const result = await drawDistrictWhere(ctx, queryLayer, attempt.where);
      if (result.featureCount > 0) {
        return {
          extent: result.extent,
          featureCount: result.featureCount,
          mode: attempt.mode,
          url,
        };
      }
    }
  }
  return NOTHING_DRAWN;
}

/** Legacy single-layer path (numeric district ids / odd schemas). */
async function drawViaLegacyDistrictWhere(
  ctx: BoundarySyncContext,
): Promise<SingleDistrictDraw | null> {
  try {
    const districtQueryLayer = await getDetachedQueryLayer(
      ctx.modules.FeatureLayer,
      getAgriDistrictBoundaryUrl(),
    );
    const where = resolveDistrictWhere(
      districtQueryLayer,
      ctx.districtCode,
      ctx.tuman,
    );
    const result = await drawDistrictWhere(ctx, districtQueryLayer, where);
    if (result.featureCount > 0) {
      return {
        extent: result.extent,
        featureCount: result.featureCount,
        mode: "legacy-district-where",
        url: getAgriDistrictBoundaryUrl(),
      };
    }
  } catch (err) {
    agroV5Log(
      "admin-boundary:district-layer-FAILED",
      { url: getAgriDistrictBoundaryUrl(), error: boundaryErrorText(err) },
      "tuman",
    );
  }
  return null;
}

export async function syncSingleDistrict(
  ctx: BoundarySyncContext,
): Promise<AgriAdminBoundarySyncResult> {
  const { map, view } = ctx;
  hideLayer(ctx.regionOutline);
  clearDistrictFsBorderLayer(map);
  clearDistrictLabelFeatureLayer(map);
  clearDistrictViewGraphics(view);

  let drawn = await drawViaCandidateServices(ctx);
  if (drawn.featureCount <= 0) {
    drawn = (await drawViaLegacyDistrictWhere(ctx)) || drawn;
  }

  agroV5Log(
    "admin-boundary:single-district",
    {
      viloyat: ctx.viloyat,
      tuman: ctx.tuman,
      districtCode: ctx.districtCode,
      mode: drawn.mode,
      url: drawn.url,
      featureCount: drawn.featureCount,
    },
    "tuman",
  );

  if (ctx.bordersVisible) {
    bringToFront(map, findLayerById(map, AGRI_DISTRICT_LABEL_LAYER_ID));
    bringToFront(map, ctx.districtOutline);
  }
  return {
    extent: isValidMapExtent(drawn.extent) ? drawn.extent : null,
    level: "district",
  };
}
