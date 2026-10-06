import type { LocalizationHost } from "../../host";
import { buildNdviTableWhereWithRegion } from "../../../../../localization/map-where-clauses";
import { normalizeUniqueidKey } from "../../../../../../data/agri-uniqueid-sql";
import { shouldForceRegionYearMapExportRefresh, decideVhUniqueIdApplyPhase, isAgriTableDataUrl, augmentWhereWithNdviClauses, pickPrimaryWhereForSpatialJoin, spatialWhereFromPrimarySync } from "../../../../../localization/map-filter-apply";
import { ensureRegionYearMapImagesReady, unlockShownRegionYearFieldScales, refreshRegionYearMapExports, isMapImageOwnedLayer, getDetachedQueryLayerFor } from "../../../../../../gis/feature-layer-data";
import { getAgriTableDataUrl, buildSpatialJoinWhere, queryAgriUniqueIdsForWhere } from "../../../../../../gis/agri-table-data-source";
import { buildDefinitionExpressionDigest, isEmptyMapExtent } from "../../../../../localization/map-zoom-policy";
import { agriLog } from "../../localization-log";
import { collectShownRegionYearQueryTargets, readQueryableDefinitionExpression, unionMapExtents } from "../../../../../localization/map-shown-extent";
import { errorMessage } from "../../../../../../shared/agri-plain-object";

/** Tell the dashboard shell to show/hide the "no data found" map overlay. */
export const setMapNoData = (host: LocalizationHost, noData: boolean, reason: string): void => {
  try {
    document.dispatchEvent(
      new CustomEvent("agriMapNoData", {
        detail: { noData, reason, timestamp: Date.now() },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
};
/**
 * Build NDVI table WHERE: selected date + yil + region (from viloyat) + district (from tuman) + turi.
 * User selects yil → viloyat, tuman; we use their region/district data for the server query.
 * Prefers numeric region/district when the table has those fields (same mapping as polygon layer).
 */
export function buildTableWhereWithRegion(
  host: LocalizationHost,
  dateField: string,
  ndviDate: string,
  tableFieldNames: string[],
): string | null {
  const { yil, viloyat, tuman, lockedViloyat } = host.state;
  return buildNdviTableWhereWithRegion({
    dateField,
    ndviDate,
    tableFieldNames,
    yil: yil || "",
    viloyat: viloyat || "",
    tuman: tuman || "",
    lockedViloyat,
    viloyatToRegion: host._viloyatToRegion,
    tumanToDistrict: host._tumanToDistrict,
    normalizeApos: (s) => host.normalizeApos(s),
    cropClause: host.buildTurlarClause("turi"),
  });
}
/**
 * Canonical hectare value for every filtered polygon. Vegetation rows only
 * determine the status; displayed area must come from Agri_table_data so
 * VH categories partition the same total used by Indicator/Pie/Region.
 */
export const getPolygonAreasWithCurrentFilter = async (host: LocalizationHost, opts?: {
  includeTuri?: boolean;
}): Promise<Map<string, number>> => {
  const primaryLayer =
    host.state.featureLayer ?? host.state.featureLayers?.[0];
  if (!primaryLayer) return new Map();

  const hasRegion = !!host.normalizeApos(
    (host.state.lockedViloyat || host.state.viloyat || "").toString(),
  );
  // Match VH bar crop scoping: only AND turi when crop was selected first.
  const includeTuri = opts?.includeTuri === true;
  const where = host.buildWhereClause(
    false,
    includeTuri,
    hasRegion,
    primaryLayer,
  );
  if (!where || where === "1=0") return new Map();
  const layerKey = String((primaryLayer as any).url || primaryLayer.id || "");
  const cacheKey = `${layerKey}|turi=${includeTuri ? 1 : 0}|${where}`;
  const cached = host._polygonAreaQueryCache.get(cacheKey);
  if (cached) return cached;

  const cfg = (host.props.config || {}) as any;
  const requestedJoinField =
    (cfg.polygonJoinField || "uniqueid").trim() || "uniqueid";
  const polygonJoinField =
    host.findLayerFieldName(primaryLayer, requestedJoinField) ||
    requestedJoinField;
  const requestedAreaField =
    String(cfg?.indicator?.attributeField || "maydon").trim() || "maydon";
  const areaField =
    host.findLayerFieldName(primaryLayer, requestedAreaField) ||
    host.findLayerFieldName(primaryLayer, "maydon") ||
    requestedAreaField;
  const oidField = String(primaryLayer.objectIdField || "objectid");
  const pageSize = 2000;
  const request = (async (): Promise<Map<string, number>> => {
    const areas = new Map<string, number>();
    let lastOid = -1;
    let completed = false;
    for (let page = 0; page < 250 && host._isMounted; page++) {
      const q = primaryLayer.createQuery();
      (q as any).where =
        lastOid < 0 ? where : `(${where}) AND ${oidField} > ${lastOid}`;
      (q as any).outFields = [oidField, polygonJoinField, areaField];
      (q as any).returnGeometry = false;
      (q as any).orderByFields = [`${oidField} ASC`];
      (q as any).num = pageSize;
      (q as any).resultRecordCount = pageSize;

      const res = await primaryLayer.queryFeatures(q);
      const features = res?.features ?? [];
      if (!features.length) {
        completed = true;
        break;
      }
      let pageMaxOid = lastOid;
      for (const f of features) {
        const attrs = (f.attributes || {}) as Record<string, unknown>;
        const oid = Number(
          attrs[oidField] ?? attrs[oidField.toLowerCase()] ?? attrs.OBJECTID,
        );
        if (Number.isFinite(oid) && oid > pageMaxOid) pageMaxOid = oid;
        const rawId =
          attrs[polygonJoinField] ?? attrs[polygonJoinField.toLowerCase()];
        const area = Number(
          attrs[areaField] ?? attrs[areaField.toLowerCase()] ?? 0,
        );
        if (rawId == null || String(rawId).trim() === "") continue;
        if (!Number.isFinite(area) || area < 0) continue;
        const key = normalizeUniqueidKey(String(rawId));
        if (!key) continue;
        areas.set(key, Math.max(areas.get(key) ?? 0, area));
      }
      if (features.length < pageSize) {
        completed = true;
        break;
      }
      if (!(pageMaxOid > lastOid)) {
        throw new Error("Polygon area pagination did not advance.");
      }
      lastOid = pageMaxOid;
    }
    if (!completed) {
      throw new Error("Polygon area query exceeded the safe page limit.");
    }
    return areas;
  })();

  host._polygonAreaQueryCache.set(cacheKey, request);
  while (host._polygonAreaQueryCache.size > 6) {
    const oldestKey = host._polygonAreaQueryCache.keys().next().value;
    if (!oldestKey) break;
    host._polygonAreaQueryCache.delete(oldestKey);
  }
  try {
    return await request;
  } catch (error) {
    host._polygonAreaQueryCache.delete(cacheKey);
    throw error;
  }
};
/* ---------------------- Map Filter Application ---------------------- */

export async function applyFiltersPersistent(
  host: LocalizationHost,
  isCurrent?: () => boolean,
  opts?: { vhDeferredSecondPass?: boolean },
): Promise<void> {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;

  const forceMapExportRefresh = shouldForceRegionYearMapExportRefresh({
    vhDeferredSecondPass: !!opts?.vhDeferredSecondPass,
  });

  // Resolve VH → uniqueids before touching MapImage definitionExpression.
  // VH-only path may already have resolved once — skip the duplicate walk.
  // Crop/tuman refreshes and VH-only cold+narrow clicks defer uniqueids so
  // geography/turi DE can paint before vegetation-table paging finishes.
  const vhApplyPhase = decideVhUniqueIdApplyPhase({
    uniqueIdsReadyForApply: host._vhUniqueIdsReadyForApply,
    deferVhUniqueIdResolve: host._deferVhUniqueIdResolve,
  });
  if (vhApplyPhase === "ready-clear") {
    host._vhUniqueIdsReadyForApply = false;
    host._suppressLegacyVhOnMap = false;
  } else if (vhApplyPhase === "defer-suppress") {
    // First paint: map uses geography + turi only (see syncShownRegionYearLayers).
    // Keep previous _vhMapUniqueIds for chart broadcast — nulling them made
    // AgriRegion buildVhScopedWheres return 1=0 ("Ma'lumot topilmadi") until
    // a rebroadcast that never came. NEVER fall back to polygon `vh`.
    host._suppressLegacyVhOnMap = true;
  } else {
    host._suppressLegacyVhOnMap = false;
    await host.resolveVhMapUniqueIds(isCurrent);
    if (isCurrent && !isCurrent()) return;
  }

  // Reveal region-year MapImage layers before chart/table DE work so the
  // first export starts while Agri_table filters are still updating.
  try {
    const map = host.state.activeMapView?.view?.map;
    if (map) {
      const effectiveViloyat = host.getEffectiveViloyat();
      if (host.state.yil && effectiveViloyat) {
        // MapImage layerDefs only stick after metadata load — but never
        // block forever (race with maxWaitMs). Early preload overlaps this
        // wait. Geography uses ~1.5s so cold load usually finishes before
        // first DE (700ms left fields blank until a manual zoom).
        const hasVh = !!String(host.state.vh || "").trim();
        const ensureResult = await ensureRegionYearMapImagesReady(
          map,
          host.state.yil,
          effectiveViloyat,
          hasVh ? 2000 : 1500,
        );
        if (isCurrent && !isCurrent()) return;
        host._lastShownRegionYearLayers = host.syncShownRegionYearLayers(map);
        unlockShownRegionYearFieldScales(host._lastShownRegionYearLayers);
        host.applyInstantCropPaletteNoRefresh();
        if (forceMapExportRefresh) {
          refreshRegionYearMapExports(host._lastShownRegionYearLayers);
          // Timed-out ensure: metadata was not ready — re-sync DE after
          // load (layerDefs often don't stick before load), then refresh.
          if (ensureResult.timedOut) {
            void ensureResult.preload.then(() => {
              if (isCurrent && !isCurrent()) return;
              const mapReady = host.state.activeMapView?.view?.map;
              if (mapReady && host.state.yil && host.getEffectiveViloyat()) {
                host._lastShownRegionYearLayers =
                  host.syncShownRegionYearLayers(mapReady);
              }
              unlockShownRegionYearFieldScales(
                host._lastShownRegionYearLayers,
              );
              refreshRegionYearMapExports(host._lastShownRegionYearLayers);
            });
          }
        }
      } else {
        host._lastShownRegionYearLayers = host.syncShownRegionYearLayers(map);
        host.applyInstantCropPaletteNoRefresh();
        if (forceMapExportRefresh) {
          refreshRegionYearMapExports(host._lastShownRegionYearLayers);
        }
      }
    }
  } catch {
    /* best-effort; attribute-level data queries are unaffected */
  }

  const { featureLayers, spatialMapLayers } = host.state;
  let primaryWhere: string | null = null;
  const effectiveViloyatForTable = host.getEffectiveViloyat();

  if (featureLayers?.length) {
    featureLayers.forEach((fl) => {
      const isAgriTable = isAgriTableDataUrl(
        (fl as any)?.url || getAgriTableDataUrl(),
      );
      // Charts query Agri_table_data in republic mode (year only).
      // Map polygons still stay hidden until a viloyat is selected.
      let where = host.buildWhereForLayer(
        fl,
        true,
        true,
        isAgriTable,
      );
      where = augmentWhereWithNdviClauses({
        where,
        statusClause: host.buildNdviStatusClauseForCurrentVh(),
        dateClause: host.buildNdviDateClauseWithoutVh(),
        ndviDateLocked: !!host.state.ndviDateLocked,
      });
      if (fl.definitionExpression !== where) fl.definitionExpression = where;
      primaryWhere = pickPrimaryWhereForSpatialJoin(primaryWhere, where, {
        isAgriTable,
        hasEffectiveViloyat: !!effectiveViloyatForTable,
      });
    });

    // Agri_table_data has no geometry — mirror the same filter onto
    // FeatureLayer polygon layers, joined by uniqueid.
    // NEVER overwrite MapImage / sublayer definitionExpression here:
    // region-year MapImages are owned by syncRegionYearLayerVisibility
    // (tuman/turi text clauses). A uniqueid-IN rewrite flashes every
    // other district and races the first field click / popup.
    if (spatialMapLayers?.length && primaryWhere != null) {
      try {
        let spatialWhere = spatialWhereFromPrimarySync(primaryWhere);
        if (spatialWhere == null) {
          try {
            spatialWhere = buildSpatialJoinWhere(
              await queryAgriUniqueIdsForWhere(primaryWhere),
            );
          } catch {
            // While AGRI_UNIQUEID_QUERY_ENABLED=false the query returns []
            // (buildSpatialJoinWhere → "1=0") instead of reaching here.
            // On a real query failure, hide rather than leave the layer at
            // its last "1=1" (every parcel in the country).
            spatialWhere = "1=0";
          }
        }
        spatialMapLayers.forEach((sl) => {
          if (isMapImageOwnedLayer(sl)) return;
          if (sl.definitionExpression !== spatialWhere) {
            sl.definitionExpression = spatialWhere;
          }
        });
      } catch {
        /* map visual sync is best-effort; data-side filtering is unaffected */
      }
    }

    const effectiveViloyat = effectiveViloyatForTable;
    const layerDebug = featureLayers.map((fl) => {
      const key = host.getLayerKey(fl);
      const title = ((fl as any)?.title || (fl as any)?.id || key).toString();
      const matchState = host.getLayerMatchStateForViloyat(
        fl,
        effectiveViloyat,
      );
      return {
        title,
        matchState,
        definitionExpression: fl.definitionExpression || "1=0",
        visible: (fl as any)?.visible,
        minScale: (fl as any)?.minScale,
        maxScale: (fl as any)?.maxScale,
        effectiveScale: (host.state.activeMapView?.view as any)?.scale,
      };
    });
    const activeLayerTitles = layerDebug
      .filter((l) => l.definitionExpression !== "1=0")
      .map((l) => l.title);
  }
  host._prevDefinitionExpression = buildDefinitionExpressionDigest(
    featureLayers || [],
  );
}
export const zoomToSelectedDistrict = async (host: LocalizationHost, view: any): Promise<boolean> => {
  const district = String(host.state.tuman || "").trim();
  if (!district || !view) return false;

  const districtRequestId = ++host._districtZoomRequestId;
  const entries = [...host._lastShownRegionYearLayers];
  const isCurrent = (): boolean =>
    host._isMounted && districtRequestId === host._districtZoomRequestId;
  const isEmptyExtent = isEmptyMapExtent;

  agriLog("zoom:district:start", {
    district,
    shownLayerCount: entries.length,
  });

  let mergedExtent: any = null;
  let queriedSublayerCount = 0;

  const extentTasks: Promise<any | null>[] = [];

  try {
    for (const entry of entries) {
      if (!isCurrent()) return false;

      const queryTargets = collectShownRegionYearQueryTargets(entry);

      agriLog("zoom:district:layer", {
        district,
        layer: String((entry.layer as any)?.title || (entry.layer as any)?.id || ""),
        sublayerCount: queryTargets.length,
      });

      for (const sublayer of queryTargets) {
        extentTasks.push(
          (async (): Promise<any | null> => {
            if (!isCurrent()) return null;
            try {
              const where = readQueryableDefinitionExpression(sublayer);
              if (!where) return null;

              const detached = await getDetachedQueryLayerFor(sublayer);
              if (!detached || !isCurrent()) return null;
              queriedSublayerCount += 1;

              let extent: any = null;
              try {
                const query = detached.createQuery();
                query.where = where;
                query.returnGeometry = true;
                extent = (await detached.queryExtent(query))?.extent;
              } catch (error) {
                agriLog("zoom:district:query-extent-failed", {
                  district,
                  sublayer: String(
                    (sublayer as any)?.title || (sublayer as any)?.id || "",
                  ),
                  message: errorMessage(error),
                });
              }

              if (isEmptyExtent(extent)) {
                const query = detached.createQuery();
                query.where = where;
                query.returnGeometry = true;
                const objectIdField = String(
                  (detached as any)?.objectIdField || "OBJECTID",
                );
                query.outFields = [objectIdField];
                const result = await detached.queryFeatures(query);
                for (const feature of result?.features || []) {
                  const featureExtent = feature?.geometry?.extent;
                  if (isEmptyExtent(featureExtent)) continue;
                  extent = extent
                    ? extent.union(featureExtent)
                    : featureExtent.clone?.() || featureExtent;
                }
              }

              return isEmptyExtent(extent) ? null : extent;
            } catch (error) {
              agriLog("zoom:district:sublayer-failed", {
                district,
                sublayer: String(
                  (sublayer as any)?.title || (sublayer as any)?.id || "",
                ),
                message: errorMessage(error),
              });
              return null;
            }
          })(),
        );
      }
    }

    const extents = await Promise.all(extentTasks);
    mergedExtent = unionMapExtents(extents);

    if (isEmptyExtent(mergedExtent) || !isCurrent()) {
      agriLog("zoom:district:no-extent", {
        district,
        queriedSublayerCount,
      });
      return false;
    }

    agriLog("zoom:district:extent", {
      district,
      queriedSublayerCount,
      xmin: mergedExtent.xmin,
      ymin: mergedExtent.ymin,
      xmax: mergedExtent.xmax,
      ymax: mergedExtent.ymax,
    });

    try {
      const animation = view?.animation;
      if (animation?.state === "running" && typeof animation.stop === "function") {
        animation.stop();
      }
    } catch {}
    if (!isCurrent()) return false;

    await view.goTo(mergedExtent.expand(1.03), {
      duration: 700,
      easing: "ease-in-out" as any,
    });
    if (!isCurrent()) return false;

    agriLog("zoom:district:goTo", { district });
    return true;
  } catch (error) {
    if (error?.name !== "AbortError") {
      agriLog("zoom:district:failed", {
        district,
        message: errorMessage(error),
      });
    }
    return false;
  }
};
