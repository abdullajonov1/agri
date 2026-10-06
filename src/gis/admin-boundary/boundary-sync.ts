/**
 * Public admin-boundary entry points: sync outlines for a selection, the
 * extent-only zoom lookup, the visibility toggle and clear.
 */
import type Extent from "esri/geometry/Extent";
import { canonicalizeRegionFilterValue, isValidMapExtent } from "../feature-layer-data";
import { agroV5Log } from "../agri-debug-log";
import {
  type AdminBoundaryView,
  getAgriRegionBoundaryUrl,
  getDetachedQueryLayer,
  getDistrictLayerUrlCandidates,
  loadBoundaryModules,
  registerServerToken,
} from "./boundary-modules";
import {
  type AgriAdminBoundarySelection,
  buildSingleDistrictAttempts,
  resolveDistrictCode,
  resolveRegionParentCod,
  resolveRegionWhere,
} from "./boundary-where";
import {
  AGRI_DISTRICT_BOUNDARY_LAYER_ID,
  AGRI_REGION_BOUNDARY_LAYER_ID,
  clearDistrictFsBorderLayer,
  clearDistrictLabelFeatureLayer,
  clearDistrictViewGraphics,
  ensureOutlineLayer,
  findLayerById,
  hideLayer,
} from "./boundary-graphics";
import { queryLayerExtentOnly } from "./boundary-outline-query";
import {
  readAgriAdminBordersVisible,
  writeAgriAdminBordersVisible,
} from "./boundary-preference";
import { boundaryErrorText } from "./boundary-error";
import type { AgriAdminBoundarySyncResult } from "./boundary-sync-context";
import { syncSingleDistrict } from "./boundary-sync-district";
import { syncRegionWithDistricts } from "./boundary-sync-region";

let lastSelection: AgriAdminBoundarySelection = {};

function canonicalViloyat(selection: AgriAdminBoundarySelection): string {
  return canonicalizeRegionFilterValue(String(selection.viloyat ?? "").trim());
}

/** First valid extent across every single-district WHERE on every service. */
async function queryDistrictExtentOnly(
  FeatureLayerClass: Parameters<typeof getDetachedQueryLayer>[0],
  target: Parameters<typeof buildSingleDistrictAttempts>[1],
): Promise<Extent | null> {
  for (const url of getDistrictLayerUrlCandidates()) {
    try {
      const districtQueryLayer = await getDetachedQueryLayer(FeatureLayerClass, url);
      const attempts = buildSingleDistrictAttempts(districtQueryLayer, target);
      for (const attempt of attempts) {
        const extent = await queryLayerExtentOnly(districtQueryLayer, attempt.where);
        if (isValidMapExtent(extent)) return extent;
      }
    } catch {
      // Service unreachable or failed to load — try the next candidate.
      continue;
    }
  }
  return null;
}

/**
 * Returns admin boundary extent for zoom without drawing outline graphics.
 * Prefer this on the hot path; call syncAgriAdminBoundaries in the background
 * for the visual border.
 */
export async function queryAgriAdminBoundaryExtentOnly(
  selection: AgriAdminBoundarySelection,
): Promise<AgriAdminBoundarySyncResult> {
  const viloyat = canonicalViloyat(selection);
  const tuman = String(selection.tuman ?? "").trim();
  const parentCod = resolveRegionParentCod(selection);
  const districtCode = resolveDistrictCode(selection);

  if (!viloyat && !tuman && parentCod == null) {
    return { extent: null, level: "none" };
  }

  try {
    const { FeatureLayer } = await loadBoundaryModules();

    if (tuman) {
      const extent = await queryDistrictExtentOnly(FeatureLayer, {
        tuman,
        districtCode,
        parentCod,
        viloyat,
      });
      return { extent, level: "district" };
    }

    if (viloyat || parentCod != null) {
      const regionQueryLayer = await getDetachedQueryLayer(
        FeatureLayer,
        getAgriRegionBoundaryUrl(),
      );
      const where = resolveRegionWhere(regionQueryLayer, parentCod);
      const extent = await queryLayerExtentOnly(regionQueryLayer, where);
      return {
        extent: isValidMapExtent(extent) ? extent : null,
        level: "region",
      };
    }

    return { extent: null, level: "none" };
  } catch {
    // Modules or Hosted/regions unavailable — no admin extent, caller zooms otherwise.
    return { extent: null, level: "none" };
  }
}

function rememberSelection(selection: AgriAdminBoundarySelection): void {
  lastSelection = {
    viloyat: selection.viloyat ?? "",
    tuman: selection.tuman ?? "",
    regionCode: selection.regionCode ?? null,
    districtCode: selection.districtCode ?? null,
    districtNames: selection.districtNames ?? [],
    districtCodes: selection.districtCodes ?? [],
  };
}

/**
 * Sync admin outline layers for the current viloyat/tuman selection and
 * return the preferred zoom extent (district > region > null).
 * Visibility toggle only hides the outline — extent is still returned for zoom.
 */
export async function syncAgriAdminBoundaries(
  view: AdminBoundaryView | null | undefined,
  selection: AgriAdminBoundarySelection,
): Promise<AgriAdminBoundarySyncResult> {
  const map = view?.map;
  if (!map || !view) return { extent: null, level: "none" };

  rememberSelection(selection);

  const bordersVisible = readAgriAdminBordersVisible();
  const viloyat = canonicalViloyat(selection);
  const tuman = String(selection.tuman ?? "").trim();
  const parentCod = resolveRegionParentCod(selection);
  const districtCode = resolveDistrictCode(selection);

  try {
    const modules = await loadBoundaryModules();
    registerServerToken(modules.IdentityManager);

    const regionOutline = ensureOutlineLayer(map, modules.GraphicsLayer, {
      id: AGRI_REGION_BOUNDARY_LAYER_ID,
      title: "Region boundary",
      urlHint: "Hosted/regions",
    });
    const districtOutline = ensureOutlineLayer(map, modules.GraphicsLayer, {
      id: AGRI_DISTRICT_BOUNDARY_LAYER_ID,
      title: "District boundary",
      urlHint: "Hosted/district",
    });
    const regionQueryLayer = await getDetachedQueryLayer(
      modules.FeatureLayer,
      getAgriRegionBoundaryUrl(),
    );
    // Do NOT eagerly load Hosted/district here — it often 500s and would abort
    // the whole sync before Tuman_chegara (first candidate) is tried.

    const ctx = {
      view,
      map,
      modules,
      regionOutline,
      districtOutline,
      regionQueryLayer,
      bordersVisible,
      selection,
      viloyat,
      tuman,
      parentCod,
      districtCode,
    };
    if (tuman) return await syncSingleDistrict(ctx);
    if (viloyat || parentCod != null) return await syncRegionWithDistricts(ctx);

    hideLayer(regionOutline);
    hideLayer(districtOutline);
    clearDistrictFsBorderLayer(map);
    clearDistrictLabelFeatureLayer(map);
    clearDistrictViewGraphics(view);
    return { extent: null, level: "none" };
  } catch (err) {
    agroV5Log(
      "admin-boundary:sync-failed",
      { error: boundaryErrorText(err) },
      "map",
    );
    return { extent: null, level: "none" };
  }
}

/** Toggle outline visibility without clearing the last selection. */
export async function setAgriAdminBordersVisible(
  view: AdminBoundaryView | null | undefined,
  visible: boolean,
): Promise<void> {
  writeAgriAdminBordersVisible(visible);
  if (!view) return;
  if (!visible) {
    clearDistrictViewGraphics(view);
    const map = view.map;
    if (!map) return;
    clearDistrictFsBorderLayer(map);
    clearDistrictLabelFeatureLayer(map);
    for (const layer of [
      findLayerById(map, AGRI_REGION_BOUNDARY_LAYER_ID),
      findLayerById(map, AGRI_DISTRICT_BOUNDARY_LAYER_ID),
    ]) {
      if (!layer) continue;
      try {
        layer.visible = false;
      } catch {
        /* layer destroyed — nothing to hide */
      }
    }
    return;
  }
  await syncAgriAdminBoundaries(view, lastSelection);
}

/** Clear both boundary outlines (home / no selection). */
export async function clearAgriAdminBoundaries(
  view: AdminBoundaryView | null | undefined,
): Promise<void> {
  lastSelection = {};
  clearDistrictViewGraphics(view);
  const map = view?.map;
  if (!map) return;
  clearDistrictFsBorderLayer(map);
  clearDistrictLabelFeatureLayer(map);
  hideLayer(findLayerById(map, AGRI_REGION_BOUNDARY_LAYER_ID));
  hideLayer(findLayerById(map, AGRI_DISTRICT_BOUNDARY_LAYER_ID));
}
