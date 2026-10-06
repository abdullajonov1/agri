import type { PopupWidgetHost } from "../popup-host";
import { getInitialTheme, t } from "../messages";
import { React } from "jimu-core";

export function getPopupWidth(host: PopupWidgetHost, view?: __esri.MapView | __esri.SceneView | null): number {
  const margin = host.POPUP_MARGIN;
  let preferred = host.POPUP_WIDTH;

  if (host.isDashboardEmbedded()) {
    const root =
      (document.querySelector(".agri-dashboard-v3") as HTMLElement | null) ||
      document.documentElement;
    const raw = getComputedStyle(root)
      .getPropertyValue("--agri-dashboard-popup-width")
      .trim();
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      preferred = parsed;
    }
  }

  if (view) {
    const mapW = host.getMapAreaRect(view).width;
    return Math.max(220, Math.min(preferred, mapW - margin * 2));
  }
  return preferred;
}

export function getPinnedPopupHeight(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView, topY: number): number {
  const rect = host.getMapAreaRect(view);
  if (host.isDashboardEmbedded()) {
    const bottomInset = host.DASHBOARD_POPUP_VERTICAL_INSET;
    return Math.max(160, rect.bottom - bottomInset - topY);
  }

  const margin = host.POPUP_MARGIN;
  const mapBottom = host.getEffectiveMapBottom(view, margin);
  return Math.max(160, mapBottom - topY);
}

export function getPopupDimensions(host: PopupWidgetHost, view?: __esri.MapView | __esri.SceneView | null, pinned = false, position?: { x: number; y: number } | null): { width: number; height: number } {
  const width = host.getPopupWidth(view);
  if (pinned && view) {
    const topY =
      position?.y ?? host.calculatePinnedPosition(view).y;
    const height = host.getPinnedPopupHeight(view, topY);
    return { width, height };
  }
  return { width, height: width };
}

export const getResolvedTheme = (host: PopupWidgetHost): boolean => {
  const root = document.documentElement;
  const body = document.body;

  try {
    const savedTheme =
      localStorage.getItem("agri_v11_app_theme");

    if (savedTheme === "light") return false;
    if (savedTheme === "dark") return true;
  } catch {
    // ignore storage access issues
  }

  const isLight =
    root.classList.contains("light-theme") ||
    root.getAttribute("data-theme") === "light" ||
    body.classList.contains("light-theme");

  return getInitialTheme() ?? !isLight;
};

export function pruneFeatureQueryCache(host: PopupWidgetHost, now = Date.now()): void {
  for (const [key, entry] of host._featureQueryCache) {
    if (entry.expires <= now) host._featureQueryCache.delete(key);
  }
}

export function getFeatureQueryCacheKey(host: PopupWidgetHost, layer: __esri.FeatureLayer, oidField: string, oid: unknown, outFields: string[]): string {
  const layerKey = String(layer?.url || layer.id || layer.title || "");
  const fieldsKey = Array.from(new Set(outFields.map((f) => String(f))))
    .sort()
    .join(",");
  return `${layerKey}|${oidField}|${String(oid)}|${fieldsKey}`;
}

export const tr = (host: PopupWidgetHost, key: string, params?: Record<string, string | number>): string => {
  return t(host.state.currentLang, key, params);
};

export function isDashboardEmbedded(host: PopupWidgetHost): boolean {
  return String(host.props.id || "").endsWith("-popup");
}

/** Crop overlay top in viewport coords; null when not used. */
export function getCropOverlayTop(host: PopupWidgetHost): number | null {
  if (!host.isDashboardEmbedded()) return null;

  const cropEl = document.querySelector(
    ".agri-dashboard-crop-overlay.agri-dashboard-managed-crop",
  ) as HTMLElement | null;
  if (cropEl) {
    const rect = cropEl.getBoundingClientRect();
    if (rect.height > 0 && Number.isFinite(rect.top)) {
      return rect.top;
    }
  }

  return null;
}

export function getMapAreaRect(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView): DOMRect {
  if (host.isDashboardEmbedded()) {
    const mapSlot = document.querySelector(
      ".agri-dashboard-map-slot",
    ) as HTMLElement | null;
    if (mapSlot) {
      const slotRect = mapSlot.getBoundingClientRect();
      if (slotRect.width > 40 && slotRect.height > 40) {
        return slotRect;
      }
    }
  }
  return (view.container as HTMLElement).getBoundingClientRect();
}

export function observeMapAreaResize(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView): void {
  host.mapAreaResizeObserver?.disconnect();
  host.mapAreaResizeObserver = null;

  if (typeof ResizeObserver === "undefined") return;

  const target = host.isDashboardEmbedded()
    ? ((document.querySelector(
        ".agri-dashboard-map-slot",
      ) as HTMLElement | null) || (view.container as HTMLElement | null))
    : (view.container as HTMLElement | null);
  if (!target) return;

  host.mapAreaResizeObserver = new ResizeObserver(() => {
    host.schedulePopupLayout();
  });
  host.mapAreaResizeObserver.observe(target);
}

export function getEffectiveMapBottom(host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView, gap = 4): number {
  const rect = host.getMapAreaRect(view);
  const cropTop = host.getCropOverlayTop();
  if (cropTop != null && cropTop > rect.top && cropTop <= rect.bottom + 2) {
    return cropTop - gap;
  }
  return rect.bottom - gap;
}

export function measurePopupHeight(host: PopupWidgetHost, popupEl: HTMLElement): number {
  const header = popupEl.querySelector(
    ".agri3-popup-header",
  ) as HTMLElement | null;
  const content = popupEl.querySelector(
    ".agri3-popup-content",
  ) as HTMLElement | null;
  const headerH = header?.offsetHeight || 0;
  const contentH = content?.scrollHeight || content?.offsetHeight || 0;
  const natural = headerH + contentH;
  if (natural > 0) return Math.ceil(natural);

  const rect = popupEl.getBoundingClientRect();
  return rect.height > 0 ? Math.ceil(rect.height) : Math.ceil(popupEl.scrollHeight);
}

export function popupPositionsEqual(host: PopupWidgetHost, a: { x: number; y: number } | null | undefined, b: { x: number; y: number }, epsilon = 1): boolean {
  if (!a) return false;
  return (
    Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon
  );
}

export const applyPopupPosition = (host: PopupWidgetHost, pos: { x: number; y: number }): void => {
  if (host.popupPositionsEqual(host.state.popupPosition, pos)) return;
  host.setState({ popupPosition: pos });
};

export const schedulePopupLayout = (host: PopupWidgetHost): void => {
  if (host._isDraggingPopup) return;
  if (host._popupLayoutTimer) clearTimeout(host._popupLayoutTimer);
  host._popupLayoutTimer = setTimeout(() => {
    host._popupLayoutTimer = null;
    host.repositionPinnedIfNeeded();
  }, 48);
};

export const schedulePopupLayoutAfterContent = (host: PopupWidgetHost): void => {
  if (host._popupLayoutRaf) cancelAnimationFrame(host._popupLayoutRaf);
  host._popupLayoutRaf = requestAnimationFrame(() => {
    host._popupLayoutRaf = requestAnimationFrame(() => {
      host._popupLayoutRaf = 0;
      host.repositionPinnedIfNeeded();
    });
  });
};

export const calculatePinnedPosition = (host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView): { x: number; y: number } => {
  const rect = host.getMapAreaRect(view);
  const margin = host.POPUP_MARGIN;
  const popupWidth = host.getPopupWidth(view);
  if (host.isDashboardEmbedded()) {
    return {
      x: rect.right - popupWidth - host.DASHBOARD_POPUP_HORIZONTAL_INSET,
      y: rect.top + host.DASHBOARD_POPUP_VERTICAL_INSET,
    };
  }

  return {
    x: rect.right - popupWidth - margin,
    y: rect.top + margin,
  };
};

export const repositionPinnedIfNeeded = (host: PopupWidgetHost) => {
  if (!host._isMounted) return;
  if (!host.state.showPopup) return;
  if (host._isDraggingPopup) return;
  const view = host.state.jimuMapView?.view;
  if (!view) return;

  if (host.state.pinToCorner) {
    const pos = host.calculatePinnedPosition(view);
    if (host.popupPositionsEqual(host.state.popupPosition, pos)) {
      host.forceUpdate();
    } else {
      host.setState({ popupPosition: pos });
    }
    return;
  }

  if (!host.state.popupPosition) return;
  const clamped = host.clampPopupToMapContainer(
    host.state.popupPosition,
    view,
  );
  host.applyPopupPosition(clamped);
};

export const togglePinToCorner = (host: PopupWidgetHost) => {
  host.setState(
    (prev) => {
      const next = !prev.pinToCorner;
      const view = host.state.jimuMapView?.view;

      let pos = prev.popupPosition;

      if (next) {
        if (view) pos = host.calculatePinnedPosition(view);
      } else if (view && prev.clickScreenPoint) {
        pos = host.calculatePopupPosition(prev.clickScreenPoint, view);
      } else if (view) {
        const rect = (view.container as HTMLElement).getBoundingClientRect();
        pos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      return {
        pinToCorner: next,
        popupPosition: pos,
        chartExpanded: next ? true : prev.chartExpanded,
      };
    },
    () => {
      host.schedulePopupLayoutAfterContent();
      if (host.state.showPopup) {
        host.broadcastPopupVisibility(true);
      }
    },
  );
};

export const handleOutsideClick = (host: PopupWidgetHost, event: MouseEvent) => {
  if (!host.state.showPopup || !host._popupRef.current) return;
  // Collapsed chip stays until an empty-map deselect / geography reset.
  if (host.state.popupMinimized) return;

  const target = event.target as Node | null;
  if (!target || host._popupRef.current.contains(target)) return;

  const mapContainer = host.state.jimuMapView?.view?.container;
  if (mapContainer && mapContainer.contains(target)) return;

  if (host.isDashboardEmbedded()) {
    const dashboardUi = (target as HTMLElement).closest?.(
      ".agri-dashboard-v3, .agri-dashboard-crop-overlay, .agri-dashboard-header, .agri-dashboard-left-panel, .agri-dashboard-bottom-row, .agri-dashboard-widget-slot, .agri-dashboard-indicator-overlay, .agri-dashboard-date-index-overlay, .agri-v20-floating-overlay",
    );
    if (dashboardUi) return;
  }

  // Outside dashboard chrome → collapse instead of wiping selection.
  host.minimizePopup();
};

export const onPopupHeaderMouseDown = (host: PopupWidgetHost, e: React.MouseEvent<HTMLDivElement>) => {
  // Allow normal behavior for controls inside header.
  const target = e.target as HTMLElement;
  if (target?.closest("button, a, input, textarea, select")) return;
  if (e.button !== 0) return;

  const popupEl = host._popupRef.current;
  if (!popupEl) return;

  const rect = popupEl.getBoundingClientRect();
  host._isDraggingPopup = true;
  host._popupDragOffset = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  if (host.state.pinToCorner) {
    host.setState({ pinToCorner: false });
  }

  window.addEventListener("mousemove", host.onPopupDragMove);
  window.addEventListener("mouseup", host.onPopupDragEnd);
  e.preventDefault();
};

export const onPopupDragMove = (host: PopupWidgetHost, e: MouseEvent) => {
  if (!host._isDraggingPopup || !host._isMounted) return;
  const view = host.state.jimuMapView?.view;
  if (!view) return;

  const nextPos = {
    x: e.clientX - host._popupDragOffset.x,
    y: e.clientY - host._popupDragOffset.y,
  };
  const clamped = host.clampPopupToMapContainer(nextPos, view);
  host.applyPopupPosition(clamped);
};

export const onPopupDragEnd = (host: PopupWidgetHost) => {
  host._isDraggingPopup = false;
  window.removeEventListener("mousemove", host.onPopupDragMove);
  window.removeEventListener("mouseup", host.onPopupDragEnd);
};

export const clampPopupToMapContainer = (host: PopupWidgetHost, pos: { x: number; y: number }, view: __esri.MapView | __esri.SceneView) => {
  const container = view.container as HTMLElement;
  const rect = container.getBoundingClientRect();
  const margin = host.POPUP_MARGIN;
  const pinned = host.state.pinToCorner;
  const { width: popupW, height: popupH } = host.getPopupDimensions(
    view,
    pinned,
    pos,
  );

  const mapLeft = rect.left;
  const mapTop = rect.top;
  const mapRight = rect.right;
  const mapBottom = host.getEffectiveMapBottom(view, margin);

  const x = Math.max(
    mapLeft + margin,
    Math.min(pos.x, mapRight - popupW - margin),
  );

  let y = pos.y;
  if (y + popupH > mapBottom) {
    y = mapBottom - popupH - margin;
  }
  y = Math.max(mapTop + margin, y);

  return { x, y };
};
