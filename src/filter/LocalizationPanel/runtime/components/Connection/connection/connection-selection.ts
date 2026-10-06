import type { LocalizationHost } from "../../host";
import { getAgriDashboardBootstrap } from "../../../../../../data/agri-bootstrap";
import { storeScopedRegionDistrictMapping, hasDistrictMappingForSelection, resolveDistrictNumberFromMaps } from "../../../../../localization/resolve-geo-codes";
import { getTuriCropLookupKey } from "../../../../../../shared/agri-crop-labels";
import { agriLog } from "../../localization-log";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/**
 * Stores viloyat→region / tuman→district / turi→crop_id from Agri_table_data
 * via grouped DISTINCT queries (not a 50k-row attribute dump).
 */
export const fetchAndStoreRegionDistrictMappings = async (host: LocalizationHost): Promise<void> => {
  const viloyatToRegion: Record<string, number> = {};
  const regionToViloyat: Record<string, string> = {};
  const tumanToDistrict: Record<string, number> = {};
  const tumanToDistrictVotes: Record<string, number> = {};
  const turiToCropId: Record<string, string> = {};
  const helpers = host.getGeoCodeHelpers();

  try {
    const { regionDistrictRows, turiCropRows } =
      await getAgriDashboardBootstrap();

    for (const row of regionDistrictRows) {
      storeScopedRegionDistrictMapping(
        row.viloyat,
        row.region,
        row.tuman,
        row.district,
        viloyatToRegion,
        tumanToDistrict,
        helpers,
        {
          count: row.count,
          tumanToDistrictVotes,
        },
      );
      const code = String(row.region);
      const name = String(row.viloyat || "").trim();
      if (
        name &&
        Number.isFinite(row.region) &&
        (!regionToViloyat[code] || name.length > regionToViloyat[code].length)
      ) {
        regionToViloyat[code] = name;
      }
    }

    for (const row of turiCropRows) {
      const key = getTuriCropLookupKey(row.turi);
      if (key && row.cropId) turiToCropId[key] = row.cropId;
    }

    host._viloyatToRegion = viloyatToRegion;
    host._regionToViloyat = regionToViloyat;
    host._tumanToDistrict = tumanToDistrict;
    host._turiToCropId = turiToCropId;
    agriLog("regionDistrictMap:stored", {
      viloyatKeys: Object.keys(viloyatToRegion).length,
      districtKeys: Object.keys(tumanToDistrict).length,
      note: "district keys are viloyat/region-scoped",
    });
  } catch (e) {
    agriLog("regionDistrictMap:FAILED", {
      error: errorMessage(e),
    });
  }
};
/**
 * Ensure we have region/district codes for the currently selected viloyat/tuman by
 * querying the polygon layer first. This runs when the user changes viloyat/tuman so
 * converter functions always have up-to-date codes.
 */
export const ensureRegionDistrictForSelection = async (host: LocalizationHost): Promise<void> => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];
  if (!layers.length) return;

  const vRaw = (
    host.state.viloyat ||
    host.state.lockedViloyat ||
    ""
  ).toString();
  const tRaw = (host.state.tuman || "").toString();
  const vKey = host.makeRegionDistrictKey(vRaw);
  const tKey = host.makeRegionDistrictKey(tRaw);
  const helpers = host.getGeoCodeHelpers();

  const needsViloyat = !!vKey && host._viloyatToRegion[vKey] == null;
  const needsTuman =
    !!tKey &&
    !hasDistrictMappingForSelection(
      vRaw,
      tRaw,
      host._tumanToDistrict,
      host._viloyatToRegion,
      helpers,
    );
  if (!needsViloyat && !needsTuman) return;

  const vilClause = needsViloyat ? host.eqAposSmart("viloyat", vRaw) : "";
  // Prefer AND when both are known so we don't pull every district in the viloyat.
  const tumanClause = needsTuman ? host.eqAposSmart("tuman", tRaw) : "";
  const whereParts: string[] = [];
  if (vilClause && tumanClause) {
    whereParts.push(`(${vilClause}) AND (${tumanClause})`);
  } else if (vilClause) {
    whereParts.push(`(${vilClause})`);
  } else if (tumanClause) {
    whereParts.push(`(${tumanClause})`);
  }
  if (!whereParts.length) return;

  try {
    const where = whereParts.join(" OR ");
    let featureCount = 0;
    for (const layer of layers) {
      const q = layer.createQuery();
      (q as any).where = where;
      (q as any).outFields = ["viloyat", "region", "tuman", "district"];
      (q as any).returnGeometry = false;
      (q as any).num = 100;

      const res = await layer.queryFeatures(q);
      const features = res?.features ?? [];
      featureCount += features.length;

      for (const f of features) {
        const a = (f.attributes || {}) as Record<string, unknown>;
        storeScopedRegionDistrictMapping(
          a?.viloyat != null && a.viloyat !== "" ? String(a.viloyat) : null,
          a?.region,
          a?.tuman != null && a.tuman !== "" ? String(a.tuman) : null,
          a?.district,
          host._viloyatToRegion,
          host._tumanToDistrict,
          helpers,
        );
        const r =
          a?.region != null && a.region !== "" ? Number(a.region) : NaN;
        const name =
          a?.viloyat != null && a.viloyat !== ""
            ? String(a.viloyat).trim()
            : "";
        if (name && Number.isFinite(r)) {
          const code = String(r);
          if (
            !host._regionToViloyat[code] ||
            name.length > host._regionToViloyat[code].length
          ) {
            host._regionToViloyat[code] = name;
          }
        }
      }
    }
    agriLog("ensureRegionDistrictForSelection:done", {
      featureCount,
      viloyat: vRaw,
      tuman: tRaw,
      district: resolveDistrictNumberFromMaps(
        tRaw,
        host._tumanToDistrict,
        helpers,
        {
          rawViloyat: vRaw,
          viloyatToRegion: host._viloyatToRegion,
        },
      ),
    });
  } catch (e) {
    agriLog("ensureRegionDistrictForSelection:error", {
      error: errorMessage(e),
    });
  }
};
/**
 * Ensure we have a crop_id for the currently selected turi (crop type) by
 * querying the polygon layer if it wasn't already found in the initial
 * broad scan (fetchAndStoreRegionDistrictMappings, which only samples
 * whatever's in this.state.featureLayers at connect time — a crop that
 * only appears in a viloyat/tuman outside that initial sample would
 * otherwise never resolve). Mirrors ensureRegionDistrictForSelection().
 */
export const ensureCropIdForSelection = async (host: LocalizationHost): Promise<void> => {
  const layers = host.state.featureLayers?.length
    ? host.state.featureLayers
    : host.state.featureLayer
      ? [host.state.featureLayer]
      : [];
  if (!layers.length) return;

  const missingTurlar = host.getSelectedTurlar().filter(
    (turi) => !host.resolveCropIdForTuri(turi),
  );
  if (!missingTurlar.length) return;

  try {
    const whereParts: string[] = [];
    const vilClause = host.buildViloyatRegionClause();
    if (vilClause) whereParts.push(`(${vilClause})`);
    const turiClause = host.buildTurlarClause("turi", missingTurlar);
    if (turiClause) whereParts.push(`(${turiClause})`);
    const where = whereParts.join(" AND ");
    if (!where) return;

    for (const layer of layers) {
      const q = layer.createQuery();
      (q as any).where = where;
      (q as any).outFields = ["turi", "crop_id"];
      (q as any).returnGeometry = false;
      (q as any).num = Math.max(20, missingTurlar.length * 4);

      const res = await layer.queryFeatures(q);
      for (const feature of res?.features ?? []) {
        const attributes = (feature.attributes || {}) as Record<string, unknown>;
        const key = getTuriCropLookupKey(
          attributes?.turi != null && attributes.turi !== ""
            ? String(attributes.turi)
            : "",
        );
        const cropId =
          attributes?.crop_id != null && attributes.crop_id !== ""
            ? String(attributes.crop_id)
            : "";
        if (key && cropId) host._turiToCropId[key] = cropId;
      }

      const unresolved = missingTurlar.some(
        (turi) => !host.resolveCropIdForTuri(turi),
      );
      if (!unresolved) break;
    }
  } catch (e) {
    agriLog("ensureCropIdForSelection:error", {
      error: errorMessage(e),
    });
  }
};
