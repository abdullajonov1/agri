/**
 * Map-click wiring and hub event handlers (master filter, widget selection,
 * popup visibility / Graff polygon broadcasts).
 */
import type { PopupWidgetHost } from "../../popup-host";
import type { JimuMapView } from "jimu-arcgis";
import type {
  IHandleLike,
  PopupMasterFilterDetail,
  PopupSelectionDetail,
} from "../../popup-types";
import { agriMapClickDebug } from "../../../../../gis/agri-map-click-debug";

export function attachMapClick(host: PopupWidgetHost, jmv: JimuMapView) {
  host.detachMapClick();
  const view = jmv?.view as { on?: (event: string, cb: unknown) => IHandleLike } | null;
  if (!view || typeof view.on !== "function") return;
  host._clickHandle = view.on("click", host.onViewClick);
}
export const ensureMapClickAttached = (host: PopupWidgetHost): boolean => {
  if (!host._isMounted) return false;
  const mapWidgetId = host.getLinkedMapWidgetId();
  const jmv =
    host.state.jimuMapView?.view
      ? host.state.jimuMapView
      : host.getMapViewFromManager(mapWidgetId);
  if (!jmv?.view) return false;

  if (!host.state.jimuMapView?.view) {
    host.onActiveViewChange(jmv);
    return true;
  }

  if (!host._clickHandle) {
    host.attachMapClick(jmv);
  }
  return !!host._clickHandle;
};
export const handleXyPageClosed = (host: PopupWidgetHost): void => {
  if (!host.isDashboardEmbedded()) return;
  if (host.state.showPopup) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
  }
};
/**
 * Close the field popup when the hub geography moves (other tuman /
 * viloyat / year) or when polygon focus is cleared. Do not restore the
 * pre-field extent on geography change — Localization is already zooming
 * to the new district/region.
 */
export const handleMasterFilterChanged = (host: PopupWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const detail: PopupMasterFilterDetail = (event as CustomEvent<PopupMasterFilterDetail>).detail || {};
  const f = detail.filters || {};
  const geoKey = `${String(f.yil || "")}|${String(f.viloyat || "")}|${String(f.tuman || "")}`;
  const prevGeo = host._lastMasterGeoKey;
  host._lastMasterGeoKey = geoKey;

  const geoChanged = Boolean(prevGeo) && prevGeo !== geoKey;
  const polygonCleared = f.polygonMode === false;
  const incomingUnique = String(f.uniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (f.polygonMode === true && incomingUnique) {
    host._activeInspectedUniqueid = incomingUnique;
    // Fallback: if selection arrived via hub but popup is still closed, open it.
    if (!host.state.showPopup) {
      void host.openPopupForUniqueid(incomingUnique, {
        zoom: false,
        notifySelection: false,
      });
    }
  } else if (polygonCleared) {
    host._activeInspectedUniqueid = null;
  }

  if (geoChanged) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
    return;
  }
  // Same geography but hub cleared polygon focus (e.g. Graff deselect).
  if (polygonCleared && (host.state.showPopup || host.state.loading)) {
    host.closePopup({ restoreExtent: true, notifyDeselect: false });
  }
};
/** Immediate close when Region/Pie/year change geography (before map sync finishes). */
export const handleWidgetSelectionChanged = (host: PopupWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const d: PopupSelectionDetail = (event as CustomEvent<PopupSelectionDetail>).detail || {};
  // Our own polygon notify must not close the popup we just opened.
  if (d.source === "AgriPopup") return;
  if (
    d.yil !== undefined ||
    d.viloyat !== undefined ||
    d.tuman !== undefined
  ) {
    host.closePopup({ restoreExtent: false, notifyDeselect: false });
    return;
  }
  if (d.polygonMode === false) {
    host._activeInspectedUniqueid = null;
    host.closePopup({ restoreExtent: true, notifyDeselect: false });
    return;
  }
  if (
    (d.source === "AgriGraffWidget" || d.source === "AgriGraff10") &&
    d.polygonMode === true &&
    d.uniqueid
  ) {
    const clean = String(d.uniqueid)
      .replace(/[{}]/g, "")
      .trim();
    host._activeInspectedUniqueid = clean;
    // Table / Graff selection must always open the field popup.
    void host.openPopupForUniqueid(clean, {
      zoom: false,
      notifySelection: false,
    });
  }
};
export const handleSharedMapClick = async (host: PopupWidgetHost, event: Event): Promise<void> => {
  // Always ignore the Localization click bus. AgriPopup owns view.on("click")
  // exclusively — handling both races two full onViewClick chains: the loser
  // often clears showPopup, restores the pre-selection extent, and flashes
  // other-district fields. Localization may still dispatch for other listeners.
  agriMapClickDebug(
    "AgriPolygon ← shared map-click SKIP (direct view click is sole owner)",
  );
  return;
};
export function detachMapClick(host: PopupWidgetHost) {
  if (host._clickHandle?.remove) host._clickHandle.remove();
  host._clickHandle = null;
}
/**
 * Tells AgriGraff10 (via AgriLocalization, the central filter hub) which
 * polygon is currently inspected so its chart can switch to showing that
 * single polygon's vegetation-index series instead of the region-wide
 * timeseries. Mirrors the widgetSelectionChanged shape AgriGraffWidget
 * itself already dispatches on its own row-click selection.
 */
export const notifyGraffPolygonSelection = (host: PopupWidgetHost, uniqueid: string, polygonMode: boolean, clickedAt?: number, regionId?: number | null): void => {
  try {
    document.dispatchEvent(
      new CustomEvent("widgetSelectionChanged", {
        detail: {
          source: "AgriPopup",
          polygonMode,
          uniqueid: polygonMode ? uniqueid : "",
          regionId:
            regionId != null && Number.isFinite(regionId) ? regionId : undefined,
          // Timestamp of the ORIGINAL map click (captured before this
          // widget's own async attribute-resolution chain), not of this
          // dispatch — lets downstream listeners (AgriGraff10) detect and
          // ignore a stale notification that resolves after a newer click
          // was already applied (see AgriGraff10's _lastAppliedPolygonClickedAt).
          clickedAt: clickedAt ?? Date.now(),
          timestamp: Date.now(),
        },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
};
export const broadcastPopupVisibility = (host: PopupWidgetHost, open: boolean): void => {
  const pinned = !!host.state.pinToCorner;
  try {
    document.dispatchEvent(
      new CustomEvent("agriMapPopupVisibility", {
        detail: {
          open: !!open,
          pinned,
          source: "AgriPopup",
          timestamp: Date.now(),
        },
        bubbles: true,
      }),
    );
  } catch {
    /* ignore */
  }
  if (open) {
    // Re-notify after paint so NDVI can measure the real popup box.
    requestAnimationFrame(() => {
      try {
        document.dispatchEvent(
          new CustomEvent("agriMapPopupVisibility", {
            detail: {
              open: true,
              pinned,
              layout: true,
              source: "AgriPopup",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } catch {
        /* ignore */
      }
    });
  }
};
