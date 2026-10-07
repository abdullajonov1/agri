/**
 * Viloyat overview sync: region outline plus every district of that viloyat
 * (live FeatureLayer first, then typed-WHERE / spatial query fallbacks).
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type Geometry from "esri/geometry/Geometry";
import { isValidMapExtent } from "../feature-layer-data";
import { agroV5Log } from "../agri-debug-log";
import { getDetachedQueryLayer, getDistrictLayerUrlCandidates } from "./boundary-modules";
import {
  type ViloyatDistrictFilter,
  buildDistrictWhereAttempts,
  maxDistrictsForViloyat,
  resolveRegionWhere,
} from "./boundary-where";
import {
  AGRI_DISTRICT_FS_LAYER_ID,
  AGRI_DISTRICT_LABEL_LAYER_ID,
  bringToFront,
  clearDistrictLabelFeatureLayer,
  clearDistrictViewGraphics,
  countDistrictViewGraphics,
  findLayerById,
} from "./boundary-graphics";
import { type SpatialRelationship, queryAndDrawOutline } from "./boundary-outline-query";
import { syncDistrictsViaMapFeatureLayer } from "./boundary-fs-sync";
import { boundaryErrorText } from "./boundary-error";
import type {
  AgriAdminBoundarySyncResult,
  BoundarySyncContext,
} from "./boundary-sync-context";

/** Mutable bookkeeping of which strategy drew the districts (for logs). */
interface DistrictDrawState {
  featureCount: number;
  mode: string;
  field: string | null;
  url: string;
}

interface DistrictDrawRequest {
  queryLayer: FeatureLayer;
  where: string;
  mode: string;
  field: string | null;
  geometry?: Geometry | null;
  spatialRelationship?: SpatialRelationship;
}

function resetDistrictOverlays(ctx: BoundarySyncContext): void {
  try {
    ctx.districtOutline.removeAll?.();
  } catch {
    /* layer destroyed — the redraw below recreates graphics */
  }
  clearDistrictViewGraphics(ctx.view);
  clearDistrictLabelFeatureLayer(ctx.map);
}

/** Draw one candidate; rejects empty results and neighbour spill. */
async function tryDrawDistricts(
  ctx: BoundarySyncContext,
  filter: ViloyatDistrictFilter,
  state: DistrictDrawState,
  req: DistrictDrawRequest,
): Promise<boolean> {
  const { queryLayer, where, mode, field, geometry, spatialRelationship } = req;
  if ((!where || where === "1=0") && !geometry) return false;
  const drawn = await queryAndDrawOutline({
    queryLayer,
    outlineLayer: ctx.districtOutline,
    Graphic: ctx.modules.Graphic,
    FeatureLayer: ctx.modules.FeatureLayer,
    where: where || "1=1",
    view: ctx.view,
    outlineWidth: 0.75,
    bordersVisible: ctx.bordersVisible,
    withLabels: true,
    districtStyle: true,
    geometry: geometry || null,
    spatialRelationship,
    viloyatFilter: filter,
  });
  if (drawn.featureCount <= 0) return false;
  // Guard against neighbor spill from spatial queries.
  if (drawn.featureCount > maxDistrictsForViloyat(filter.districtCodes)) {
    agroV5Log(
      "admin-boundary:reject-too-many",
      { mode, count: drawn.featureCount },
      "tuman",
    );
    resetDistrictOverlays(ctx);
    return false;
  }
  state.featureCount = drawn.featureCount;
  state.mode = mode;
  state.field = field;
  return true;
}

/**
 * Query fallback — attribute filters only (no spatial-intersects:
 * intersects pulls Chinoz/Zomin/etc. that touch the region border).
 */
async function drawDistrictsViaQuery(
  ctx: BoundarySyncContext,
  filter: ViloyatDistrictFilter,
  state: DistrictDrawState,
  regionGeometry: Geometry | null,
): Promise<void> {
  for (const url of getDistrictLayerUrlCandidates()) {
    if (state.featureCount > 0) break;
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
    state.url = url;

    for (const attempt of buildDistrictWhereAttempts(queryLayer, filter)) {
      if (await tryDrawDistricts(ctx, filter, state, { queryLayer, ...attempt })) {
        return;
      }
    }

    // Last resort: districts fully inside the viloyat polygon — still
    // client-filtered by soato / name so neighbors cannot slip in.
    if (
      regionGeometry &&
      (await tryDrawDistricts(ctx, filter, state, {
        queryLayer,
        where: "1=1",
        mode: "spatial-contains-region",
        field: null,
        geometry: regionGeometry,
        spatialRelationship: "contains",
      }))
    ) {
      return;
    }
  }
}

function selectionDistrictNames(ctx: BoundarySyncContext): string[] {
  const names = ctx.selection.districtNames;
  return Array.isArray(names)
    ? names.map((n) => String(n || "").trim()).filter(Boolean)
    : [];
}

function logRegionDistricts(
  ctx: BoundarySyncContext,
  filter: ViloyatDistrictFilter,
  state: DistrictDrawState,
  fsCount: number,
): void {
  const { districtNames, districtCodes } = filter;
  agroV5Log(
    "admin-boundary:region-districts",
    {
      viloyat: ctx.viloyat,
      parentCod: ctx.parentCod,
      mode: state.mode,
      field: state.field,
      url: state.url,
      nameCount: districtNames.length,
      codeCount: districtCodes.length,
      nameSample: districtNames.slice(0, 5),
      districtFeatureCount: state.featureCount,
      bordersVisible: ctx.bordersVisible,
      fsCount,
      viewGraphicsCount: countDistrictViewGraphics(ctx.view),
    },
    "tuman",
  );
  try {
    // Deliberately always-on border summary (not gated by the debug flag).
    // eslint-disable-next-line no-console
    console.warn("[AgroV5 admin-boundary]", {
      mode: state.mode,
      districtFeatureCount: state.featureCount,
      fsCount,
      nameCount: districtNames.length,
      codeCount: districtCodes.length,
      url: state.url,
    });
  } catch {
    /* console unavailable (embedded host) — the summary is diagnostic only */
  }
}

export async function syncRegionWithDistricts(
  ctx: BoundarySyncContext,
): Promise<AgriAdminBoundarySyncResult> {
  const { map, modules, bordersVisible } = ctx;
  const regionWhere = resolveRegionWhere(ctx.regionQueryLayer, ctx.parentCod);
  const regionDrawn = await queryAndDrawOutline({
    queryLayer: ctx.regionQueryLayer,
    outlineLayer: ctx.regionOutline,
    Graphic: modules.Graphic,
    where: regionWhere,
    view: ctx.view,
    outlineWidth: 2.4,
    bordersVisible,
  });

  const filter: ViloyatDistrictFilter = {
    parentCod: ctx.parentCod,
    viloyat: ctx.viloyat,
    districtNames: selectionDistrictNames(ctx),
    districtCodes: Array.isArray(ctx.selection.districtCodes)
      ? ctx.selection.districtCodes
      : [],
  };

  // Reset previous district overlays before redrawing.
  resetDistrictOverlays(ctx);

  // 1) Evapo-style: live FeatureServer layer + labelingInfo (best labels).
  const fsSync = await syncDistrictsViaMapFeatureLayer({
    map,
    FeatureLayer: modules.FeatureLayer,
    bordersVisible,
    ...filter,
  });

  const state: DistrictDrawState = {
    featureCount: fsSync.count,
    mode: fsSync.mode,
    field: fsSync.field,
    url: fsSync.url,
  };

  // 2) Query fallback.
  if (state.featureCount <= 0) {
    await drawDistrictsViaQuery(ctx, filter, state, regionDrawn.firstGeometry);
  }

  logRegionDistricts(ctx, filter, state, fsSync.count);
  if (bordersVisible) {
    bringToFront(map, findLayerById(map, AGRI_DISTRICT_FS_LAYER_ID));
    bringToFront(map, findLayerById(map, AGRI_DISTRICT_LABEL_LAYER_ID));
    bringToFront(map, ctx.districtOutline);
    bringToFront(map, ctx.regionOutline);
  }
  return {
    extent: isValidMapExtent(regionDrawn.extent) ? regionDrawn.extent : null,
    level: "region",
  };
}
