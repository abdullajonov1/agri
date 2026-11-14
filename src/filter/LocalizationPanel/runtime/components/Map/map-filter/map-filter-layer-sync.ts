import type { LocalizationHost } from "../../host";
import type { MapFilterLayerSyncHost } from "../map-host";
import { debugCatch } from "../../localization-log";
import { spatialWhereFromPrimarySync } from "../../../../../localization/map-filter-apply";
import { ensureRegionYearMapImagesReady, unlockShownRegionYearFieldScales, refreshRegionYearMapExports, isMapImageOwnedLayer } from "../../../../../../gis/feature-layer-data";
import { buildSpatialJoinWhere, queryAgriUniqueIdsForWhere } from "../../../../../../gis/agri-table-data-source";

/** Re-sync the shown region-year layers once a timed-out preload settles. */
const resyncAfterPreload = (
  host: MapFilterLayerSyncHost,
  isCurrent: (() => boolean) | undefined,
  preload: Promise<unknown>,
): void => {
  void preload.then(() => {
    if (isCurrent && !isCurrent()) return;
    const mapReady = host.state.activeMapView?.view?.map;
    if (mapReady && host.state.yil && host.getEffectiveViloyat()) {
      host._lastShownRegionYearLayers =
        host.syncShownRegionYearLayers(mapReady);
    }
    unlockShownRegionYearFieldScales(host._lastShownRegionYearLayers);
    refreshRegionYearMapExports(host._lastShownRegionYearLayers);
  });
};

/** Year + viloyat selected: wait (bounded) for MapImage metadata, then sync. */
const revealYearRegionLayers = async (
  host: MapFilterLayerSyncHost,
  map: __esri.Map,
  isCurrent: (() => boolean) | undefined,
  forceMapExportRefresh: boolean,
): Promise<boolean> => {
  // MapImage layerDefs only stick after metadata load — but never
  // block forever (race with maxWaitMs). Early preload overlaps this
  // wait. Geography uses ~1.5s so cold load usually finishes before
  // first DE (700ms left fields blank until a manual zoom).
  const hasVh = !!String(host.state.vh || "").trim();
  const ensureResult = await ensureRegionYearMapImagesReady(
    map,
    host.state.yil,
    host.getEffectiveViloyat(),
    hasVh ? 2000 : 1500,
  );
  if (isCurrent && !isCurrent()) return false;
  host._lastShownRegionYearLayers = host.syncShownRegionYearLayers(map);
  unlockShownRegionYearFieldScales(host._lastShownRegionYearLayers);
  host.applyInstantCropPaletteNoRefresh();
  if (!forceMapExportRefresh) return true;
  refreshRegionYearMapExports(host._lastShownRegionYearLayers);
  // Timed-out ensure: metadata was not ready — re-sync DE after
  // load (layerDefs often don't stick before load), then refresh.
  if (ensureResult.timedOut) {
    resyncAfterPreload(host, isCurrent, ensureResult.preload);
  }
  return true;
};

/**
 * Reveal region-year MapImage layers before chart/table DE work so the
 * first export starts while Agri_table filters are still updating.
 * Resolves false when the apply went stale and the caller must stop.
 */
export const revealRegionYearLayers = async (
  host: MapFilterLayerSyncHost,
  isCurrent: (() => boolean) | undefined,
  forceMapExportRefresh: boolean,
): Promise<boolean> => {
  try {
    const map = host.state.activeMapView?.view?.map;
    if (!map) return true;
    if (host.state.yil && host.getEffectiveViloyat()) {
      return await revealYearRegionLayers(host, map, isCurrent, forceMapExportRefresh);
    }
    host._lastShownRegionYearLayers = host.syncShownRegionYearLayers(map);
    host.applyInstantCropPaletteNoRefresh();
    if (forceMapExportRefresh) {
      refreshRegionYearMapExports(host._lastShownRegionYearLayers);
    }
  } catch (err) {
    debugCatch("revealRegionYearLayers:failed", err);
  }
  return true;
};

/** Where for spatial layers: sync from the primary where, else resolve uniqueids. */
const resolveSpatialWhere = async (primaryWhere: string): Promise<string> => {
  const syncWhere = spatialWhereFromPrimarySync(primaryWhere);
  if (syncWhere != null) return syncWhere;
  try {
    return buildSpatialJoinWhere(await queryAgriUniqueIdsForWhere(primaryWhere));
  } catch (err) {
    debugCatch("resolveSpatialWhere:failed", err);
    // While AGRI_UNIQUEID_QUERY_ENABLED=false the query returns []
    // (buildSpatialJoinWhere → "1=0") instead of reaching here.
    // On a real query failure, hide rather than leave the layer at
    // its last "1=1" (every parcel in the country).
    return "1=0";
  }
};

/**
 * Agri_table_data has no geometry — mirror the same filter onto
 * FeatureLayer polygon layers, joined by uniqueid.
 * NEVER overwrite MapImage / sublayer definitionExpression here:
 * region-year MapImages are owned by syncRegionYearLayerVisibility
 * (tuman/turi text clauses). A uniqueid-IN rewrite flashes every
 * other district and races the first field click / popup.
 */
export const mirrorWhereOnSpatialLayers = async (
  spatialMapLayers: LocalizationHost["state"]["spatialMapLayers"],
  primaryWhere: string | null,
): Promise<void> => {
  if (!spatialMapLayers?.length || primaryWhere == null) return;
  try {
    const spatialWhere = await resolveSpatialWhere(primaryWhere);
    spatialMapLayers.forEach((sl) => {
      if (isMapImageOwnedLayer(sl)) return;
      if (sl.definitionExpression !== spatialWhere) {
        sl.definitionExpression = spatialWhere;
      }
    });
  } catch (err) {
    debugCatch("mirrorWhereOnSpatialLayers:failed", err);
  }
};
