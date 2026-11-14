import { agriMapClickDebug } from "../../../../../gis/agri-map-click-debug";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../../gis/agri-table-data-source";
import { resolveRegionIdFromAttributes, resolveCropIdFromAttributes } from "../../../../../gis/agri-polygon-api-source";
import { prefetchVegetationOverlayForUniqueid } from "../../../../../gis/agri-vegetation-overlay-prefetch";
import type { PopupAttributes } from "../../popup-types";
import {
  cleanKey,
  startGeometryZoom,
  type ClickContext,
  type ClickHit,
} from "./click-view-shared";

export interface HitIdentity {
  hitAttrs: PopupAttributes;
  hitUniqueId: string;
  hitCleanKey: string;
}

export const readHitIdentity = (
  ctx: ClickContext,
  g: ClickHit["graphic"],
): HitIdentity => {
  const hitAttrs: PopupAttributes = g.attributes || {};
  const raw = ctx.host.findAttributeValueCaseInsensitive(
    hitAttrs,
    AGRI_TABLE_JOIN_FIELD,
  );
  const hitUniqueId = raw != null && String(raw).trim() !== "" ? String(raw).trim() : "";
  return { hitAttrs, hitUniqueId, hitCleanKey: hitUniqueId.replace(/[{}]/g, "").trim() };
};

/** Zooms from hitTest geometry; returns whether a zoom was started. */
export const zoomFromHit = (
  ctx: ClickContext,
  g: ClickHit["graphic"],
  hitCleanKey: string,
): boolean => {
  const zoomToSelection =
    ctx.host.props.config?.settings?.zoomToSelection !== false;
  if (!zoomToSelection || !g.geometry || ctx.isStale()) return false;
  let zoomed = false;
  try {
    startGeometryZoom(
      ctx,
      g.geometry,
      hitCleanKey || null,
      {
        start: "zoom:start-hit",
        complete: "zoom:complete-hit",
        failed: "zoom:failed-hit",
      },
      () => {
        zoomed = true;
      },
    );
  } catch {
    zoomed = false;
  }
  return zoomed;
};

export const highlightHit = (ctx: ClickContext, g: ClickHit["graphic"]): void => {
  if (!g.geometry) return;
  try {
    ctx.host.highlightPolygon(g.geometry);
  } catch {
    /* OID path may re-highlight */
  }
};

/** Expands when minimized, otherwise toggles the already-active field off. */
export const handleSameFieldToggle = (
  ctx: ClickContext,
  uniqueid: string,
  source?: string,
): void => {
  const { host } = ctx;
  const extra = source ? { source } : {};
  if (host.state.popupMinimized) {
    agriMapClickDebug("selection:expand-minimized-same-field", { uniqueid, ...extra });
    host.expandPopup();
    return;
  }
  agriMapClickDebug("selection:toggle-off-same-field", { uniqueid, ...extra });
  host.clearHighlight();
  host._activeInspectedUniqueid = null;
  host.closePopup({ restoreExtent: true, notifyDeselect: true });
};

export type HitSelection = "stop" | "kicked" | "none";

/** Early selection broadcast from hitTest attributes. */
export const applyHitSelection = (
  ctx: ClickContext,
  identity: HitIdentity,
): HitSelection => {
  const { host } = ctx;
  const { hitAttrs, hitUniqueId, hitCleanKey } = identity;
  if (!hitCleanKey) return "none";
  const activeKeyEarly = cleanKey(host._activeInspectedUniqueid);
  if (activeKeyEarly && activeKeyEarly === hitCleanKey) {
    handleSameFieldToggle(ctx, hitCleanKey, "hit-attrs");
    return "stop";
  }
  const regionFromHit = resolveRegionIdFromAttributes(hitAttrs);
  host._activeInspectedUniqueid = hitCleanKey;
  agriMapClickDebug("selection:broadcast-hit", {
    uniqueid: hitUniqueId,
    source: "AgriPopup",
    polygonMode: true,
    regionId: regionFromHit,
    destinations: ["AgriLocalization", "AgriGraff10"],
  });
  host.notifyGraffPolygonSelection(hitUniqueId, true, ctx.clickStartedAt, regionFromHit);
  prefetchVegetationOverlayForUniqueid(hitUniqueId, {
    cropId: resolveCropIdFromAttributes(hitAttrs),
    regionId: regionFromHit ?? undefined,
  });
  return "kicked";
};
