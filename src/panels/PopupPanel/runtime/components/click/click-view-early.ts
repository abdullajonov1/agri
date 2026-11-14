import { agriMapClickDebug } from "../../../../../gis/agri-map-click-debug";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../../gis/agri-table-data-source";
import { resolveRegionIdFromAttributes, resolveCropIdFromAttributes } from "../../../../../gis/agri-polygon-api-source";
import { prefetchVegetationOverlayForUniqueid } from "../../../../../gis/agri-vegetation-overlay-prefetch";
import { isMapImageOwnedLayer, isMapImageGroupSublayer, safeLoadMapLayer } from "../../../../../gis/feature-layer-data";
import type { PopupAttributes } from "../../popup-types";
import { handleSameFieldToggle } from "./click-view-hit";
import {
  cleanKey,
  startGeometryZoom,
  INDICES_DEFER_MS,
  type ClickContext,
  type ClickFeature,
} from "./click-view-shared";

export interface EarlyIdentity {
  earlyUniqueId: unknown;
  earlyCleanKey: string;
}

export const readEarlyIdentity = (
  ctx: ClickContext,
  f: ClickFeature,
): EarlyIdentity => {
  const earlyUniqueId =
    ctx.host.findAttributeValueCaseInsensitive(f.attributes, AGRI_TABLE_JOIN_FIELD) ??
    null;
  return { earlyUniqueId, earlyCleanKey: cleanKey(earlyUniqueId) };
};

/**
 * Same already-active field (incl. table selection) clicked on map ->
 * deactivate without zooming in again. Returns true when handled.
 */
export const handleEarlySameField = (
  ctx: ClickContext,
  early: EarlyIdentity,
  overlayKickedFromHit: boolean,
): boolean => {
  const activeKey = cleanKey(ctx.host._activeInspectedUniqueid);
  if (
    overlayKickedFromHit ||
    !activeKey ||
    !early.earlyCleanKey ||
    activeKey !== early.earlyCleanKey
  ) {
    return false;
  }
  handleSameFieldToggle(ctx, early.earlyCleanKey);
  return true;
};

/** Kick Graff overlay only if hitTest attrs lacked uniqueid. */
export const broadcastEarlySelection = (
  ctx: ClickContext,
  f: ClickFeature,
  early: EarlyIdentity,
  overlayKickedFromHit: boolean,
): void => {
  const { earlyUniqueId, earlyCleanKey } = early;
  if (
    overlayKickedFromHit ||
    earlyUniqueId == null ||
    String(earlyUniqueId).trim() === ""
  ) {
    return;
  }
  const { host } = ctx;
  const earlyNotifyId = String(earlyUniqueId).trim();
  const attrs: PopupAttributes = f.attributes;
  const regionFromPoly = resolveRegionIdFromAttributes(attrs);
  host._activeInspectedUniqueid = earlyCleanKey;
  agriMapClickDebug("selection:broadcast-early", {
    uniqueid: earlyNotifyId,
    source: "AgriPopup",
    polygonMode: true,
    regionId: regionFromPoly,
    destinations: ["AgriLocalization", "AgriGraff10"],
  });
  host.notifyGraffPolygonSelection(earlyNotifyId, true, ctx.clickStartedAt, regionFromPoly);
  prefetchVegetationOverlayForUniqueid(earlyNotifyId, {
    cropId: resolveCropIdFromAttributes(attrs),
    regionId: regionFromPoly ?? undefined,
  });
};

/** Defers the FeatureServer series so export-image gets bandwidth first. */
export const scheduleLatestIndices = (
  ctx: ClickContext,
  early: EarlyIdentity,
  hitUniqueId: string,
  hitCleanKey: string,
): void => {
  const { host } = ctx;
  const indicesUnique =
    early.earlyCleanKey || hitCleanKey || cleanKey(host._activeInspectedUniqueid);
  if (!indicesUnique) return;
  window.setTimeout(() => {
    if (!host._isMounted) return;
    if (cleanKey(host._activeInspectedUniqueid) !== indicesUnique) return;
    void host.fetchLatestVegetationIndices(
      early.earlyUniqueId
        ? String(early.earlyUniqueId).trim()
        : hitUniqueId || indicesUnique,
    );
  }, INDICES_DEFER_MS);
};

export const zoomEarly = (
  ctx: ClickContext,
  f: ClickFeature,
  early: EarlyIdentity,
  hitCleanKey: string,
  zoomedFromHit: boolean,
): void => {
  const zoomToEarly =
    !zoomedFromHit && ctx.host.props.config?.settings?.zoomToSelection !== false;
  if (zoomToEarly && f.geometry && !ctx.isStale()) {
    try {
      startGeometryZoom(ctx, f.geometry, early.earlyCleanKey || null, {
        start: "zoom:start-early",
        complete: "zoom:complete",
        failed: "zoom:failed",
      });
    } catch {
      /* zoom is cosmetic — never block opening the popup */
    }
  } else if (zoomedFromHit) {
    agriMapClickDebug("zoom:skip-oid-already-hit", {
      uniqueid: early.earlyCleanKey || hitCleanKey || null,
    });
  }
};

export const ensureLayerLoaded = async (
  clickedLayer: __esri.FeatureLayer,
): Promise<void> => {
  try {
    const loadStatus = String(clickedLayer.loadStatus || "").toLowerCase();
    const isLoaded = Boolean(clickedLayer.loaded) || loadStatus === "loaded";
    const definitionExpression = clickedLayer.definitionExpression || null;
    // Loading a live MapImage-owned sublayer rehydrates it and can clear
    // the runtime tuman definitionExpression (other-district flash). The
    // detached client from queryFeatureByObjectIdCached is already loaded
    // and provides the same field metadata.
    if (
      !isLoaded &&
      !isMapImageOwnedLayer(clickedLayer) &&
      !isMapImageGroupSublayer(clickedLayer)
    ) {
      agriMapClickDebug("layer:load-required", {
        title: clickedLayer.title,
        loadStatus: loadStatus || null,
        definitionExpression,
      });
      await safeLoadMapLayer(clickedLayer);
    } else {
      agriMapClickDebug("layer:load-skip-already-loaded", {
        title: clickedLayer.title,
        loadStatus: loadStatus || "loaded",
        definitionExpression,
      });
    }
  } catch {
    /* fresh field aliases from live layer */
  }
};
