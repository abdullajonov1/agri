/**
 * DOM layout for the AgriDashboard shell: the shared portal host, map-slot
 * resize scheduling, and fixed/absolute positioning of the map overlays
 * (indicator drawer, date/index card).
 */
import type { DashboardWidgetHost } from "../dashboard-host";

export function createPortalHost(dashboardHost: DashboardWidgetHost): HTMLElement {
  const surface = dashboardHost.findSharedLayoutSurface() || document.body;
  let host = surface.querySelector(
    ":scope > .agri-dashboard-portal-host",
  ) as HTMLElement | null;

  if (!host) {
    host = document.createElement("div");
    host.className = "agri-dashboard-portal-host";
    surface.appendChild(host);
  } else if (host.parentElement !== surface) {
    surface.appendChild(host);
  }

  if (surface !== document.body) {
    const surfaceStyle = getComputedStyle(surface);
    if (surfaceStyle.position === "static") {
      surface.style.setProperty("position", "relative");
    }
  }

  return host;
}

export function ensurePortalHost(host: DashboardWidgetHost): HTMLElement {
  if (!host.portalHost || !host.portalHost.isConnected) {
    host.portalHost = host.createPortalHost();
    host.portalReady = true;
  }
  return host.portalHost;
}

export function removePortalHost(host: DashboardWidgetHost): void {
  host.portalHost?.remove();
  host.portalHost = null;
  host.portalReady = false;
}

export function bringPortalHostToFront(dashboardHost: DashboardWidgetHost): void {
  const host = dashboardHost.portalHost;
  const surface = dashboardHost.findSharedLayoutSurface();
  // Only move when not already last — appendChild on an existing last child
  // still fires MutationObserver / layout work for no visual gain.
  if (
    host &&
    surface &&
    host.parentElement === surface &&
    surface.lastElementChild !== host
  ) {
    surface.appendChild(host);
  }
}

export const onWindowResize = (host: DashboardWidgetHost): void => {
  host.scheduleMapSlotLayout(true);
};

export function ensureLayoutObservers(host: DashboardWidgetHost): void {
  if (!host.resizeListenerAttached) {
    window.addEventListener("resize", host.onWindowResize, {
      passive: true,
    });
    host.resizeListenerAttached = true;
  }
  if (typeof ResizeObserver === "undefined") {
    return;
  }

  const root = host.dashboardRootRef.current;
  const slot = host.mapSlotRef.current;
  if (!root && !slot) return;

  // Create observer once; may attach root before slot exists on first paint.
  if (!host.dashboardResizeObserver) {
    host.dashboardResizeObserver = new ResizeObserver(() => {
      host.scheduleMapSlotLayout(false);
    });
  }

  // Observe only dashboard chrome size — never document.body. ArcGIS tile
  // paints mutate the map DOM constantly; a document MutationObserver that
  // called view.resize() created a CPU spin loop.
  if (root) {
    try {
      host.dashboardResizeObserver.observe(root);
    } catch {
      /* already observing */
    }
  }
  if (slot) {
    try {
      host.dashboardResizeObserver.observe(slot);
    } catch {
      /* already observing */
    }
  }
  // Ready only when the map slot is watched — otherwise first paint with
  // root-only would permanently skip slot size changes.
  if (root && slot) {
    host.layoutObserversReady = true;
  }
}

export function setupMapSlotObserver(host: DashboardWidgetHost): void {
  host.ensureLayoutObservers();
}

/**
 * Ask the MapView to reflow. Skips when the map-slot pixel size is unchanged
 * unless `force` (window resize, first mount, map ready).
 */
export const scheduleMapSlotLayout = (host: DashboardWidgetHost, force = false): void => {
  if (host.mapLayoutRaf) cancelAnimationFrame(host.mapLayoutRaf);
  host.mapLayoutRaf = requestAnimationFrame(() => {
    host.mapLayoutRaf = 0;
    const slot = host.mapSlotRef.current;
    if (slot) {
      const w = Math.round(slot.clientWidth);
      const h = Math.round(slot.clientHeight);
      if (
        !force &&
        w === host.lastMapSlotSize.w &&
        h === host.lastMapSlotSize.h
      ) {
        return;
      }
      host.lastMapSlotSize = { w, h };
    }
    const view = host.getActiveJimuMapView()?.view as
      | { resize?: () => void }
      | undefined;
    view?.resize?.();
  });
};

export function findSharedLayoutSurface(host: DashboardWidgetHost): HTMLElement | null {
  const dashboardRoot = host.dashboardRootRef.current;
  if (!dashboardRoot) return null;

  const dashboardItem = dashboardRoot.closest(
    ".layout-item, .builder-layout-item",
  ) as HTMLElement | null;
  return dashboardItem?.parentElement || null;
}

export function readDashboardCssPx(host: DashboardWidgetHost, variable: string, fallback: number): number {
  const root = host.dashboardRootRef.current;
  if (!root) return fallback;
  const raw = getComputedStyle(root).getPropertyValue(variable).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function applyIndicatorOverlayBounds(dashboardHost: DashboardWidgetHost, slotEl: HTMLElement, overlayEl: HTMLElement): void {
  const slotRect = slotEl.getBoundingClientRect();
  const surface = dashboardHost.findSharedLayoutSurface();
  const host = overlayEl.parentElement;
  const onLayoutSurface =
    !!surface &&
    !!host &&
    (host === surface || host.parentElement === surface);

  const topOffset = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-top",
    10,
  );
  const leftOffset = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-left",
    10,
  );
  const height = dashboardHost.readDashboardCssPx(
    "--agri-dashboard-indicator-height",
    58,
  );

  let top = slotRect.top + topOffset;
  let left = slotRect.left + leftOffset;
  let positionMode: "fixed" | "absolute" = "fixed";

  if (onLayoutSurface && surface) {
    const surfaceRect = surface.getBoundingClientRect();
    top = slotRect.top - surfaceRect.top + surface.scrollTop + topOffset;
    left = slotRect.left - surfaceRect.left + surface.scrollLeft + leftOffset;
    positionMode = "absolute";
  }

  const entries: Array<[string, string]> = [
    ["position", positionMode],
    ["top", `${top}px`],
    ["left", `${left}px`],
    ["height", `${height}px`],
    ["min-height", `${height}px`],
    ["max-height", `${height}px`],
    ["right", "auto"],
    ["bottom", "auto"],
    ["margin", "0"],
    ["padding", "0"],
    ["transform", "none"],
    ["z-index", "40"],
    ["box-sizing", "border-box"],
  ];

  entries.forEach(([key, value]) => {
    overlayEl.style.setProperty(key, value, "important");
  });
  overlayEl.style.removeProperty("width");
  overlayEl.style.removeProperty("min-width");
  overlayEl.style.removeProperty("max-width");
  overlayEl.style.removeProperty("overflow");
  overlayEl.style.removeProperty("pointer-events");
  overlayEl.classList.add("agri-dashboard-managed-indicator");
}

export function applyDateIndexOverlayBounds(host: DashboardWidgetHost, slotEl: HTMLElement, overlayEl: HTMLElement): void {
  const slotRect = slotEl.getBoundingClientRect();
  const bottomOffset = host.readDashboardCssPx(
    "--agri-dashboard-date-index-bottom",
    12,
  );
  const popupWidth = host.readDashboardCssPx(
    "--agri-dashboard-popup-width",
    340,
  );
  const popupInsetX = host.readDashboardCssPx(
    "--agri-dashboard-popup-inset-x",
    16,
  );
  const dateIndexGap = host.readDashboardCssPx(
    "--agri-dashboard-date-index-gap",
    8,
  );
  const cardWidth = host.readDashboardCssPx(
    "--agri-dashboard-date-index-width",
    210,
  );
  const navSize = host.readDashboardCssPx(
    "--agri-dashboard-date-index-nav-size",
    34,
  );
  const navGap = host.readDashboardCssPx(
    "--agri-dashboard-date-index-nav-gap",
    6,
  );
  const hasDayNav = !!overlayEl.querySelector(
    ".agri-date-index-shell.has-day-nav",
  );
  const width = hasDayNav
    ? cardWidth + 2 * (navSize + navGap)
    : cardWidth;
  const height = host.readDashboardCssPx(
    "--agri-dashboard-date-index-height",
    66,
  );

  // Always use fixed + high z-index so the card is never trapped under the
  // map-slot stacking context (popup lives in a higher portal layer).
  // Default: bottom-right of the map slot.
  let top = slotRect.bottom - height - bottomOffset;
  let left = slotRect.right - width - 10;
  let zIndex = "45";

  // Left of popup only when pinned; unpinned keeps bottom-right.
  // In pin mode also sit at the bottom edge of the popup (left of it).
  if (host.state.mapPopupOpen && host.state.mapPopupPinned) {
    const popupEl = document.querySelector(
      ".agri-dashboard-agri-host .agri3-popup-direct, .agri3-popup-direct.is-pinned, .agri3-popup-direct",
    ) as HTMLElement | null;
    if (popupEl) {
      const popupRect = popupEl.getBoundingClientRect();
      left = Math.max(8, popupRect.left - width - dateIndexGap);
      top = Math.max(8, popupRect.bottom - height);
    } else {
      left =
        slotRect.right - width - (popupWidth + popupInsetX + dateIndexGap);
      top = slotRect.bottom - height - bottomOffset;
    }
    zIndex = "10001";
  } else if (host.state.mapPopupOpen) {
    zIndex = "10001";
  }

  const entries: Array<[string, string]> = [
    ["position", "fixed"],
    ["top", `${Math.round(top)}px`],
    ["left", `${Math.round(left)}px`],
    ["width", `${width}px`],
    ["height", `${height}px`],
    ["max-width", `${width}px`],
    ["min-width", `${width}px`],
    ["min-height", `${height}px`],
    ["max-height", `${height}px`],
    ["right", "auto"],
    ["bottom", "auto"],
    ["margin", "0"],
    ["padding", "0"],
    ["transform", "none"],
    ["overflow", "hidden"],
    ["z-index", zIndex],
    ["pointer-events", "auto"],
    ["box-sizing", "border-box"],
  ];

  entries.forEach(([key, value]) => {
    overlayEl.style.setProperty(key, value, "important");
  });
  overlayEl.classList.add("agri-dashboard-managed-indicator");
}

export function syncIndicatorOverlayLayout(host: DashboardWidgetHost): void {
  host.ensurePortalHost();
  host.bringPortalHostToFront();
  const slot = host.mapSlotRef.current;
  if (slot) host.mapIndicatorHost = slot;
  const overlay = host.indicatorOverlayRef.current;
  if (slot && overlay) {
    if (slot.contains(overlay)) {
      host.clearOverlayLayout(overlay);
    } else {
      host.applyIndicatorOverlayBounds(slot, overlay);
    }
  }
  const dateIndexOverlay = host.dateIndexOverlayRef.current;
  if (slot && dateIndexOverlay) {
    // Always position via JS so the NDVI card can sit left of the pinned
    // popup while it is open (CSS-only path was leaving it under the popup).
    host.applyDateIndexOverlayBounds(slot, dateIndexOverlay);
  }
}

export function clearOverlayLayout(host: DashboardWidgetHost, overlay: HTMLElement | null): void {
  if (!overlay) return;
  [
    "position",
    "top",
    "left",
    "right",
    "bottom",
    "width",
    "height",
    "max-width",
    "min-width",
    "min-height",
    "max-height",
    "z-index",
    "margin",
    "padding",
    "transform",
    "overflow",
    "box-sizing",
  ].forEach((key) => {
    overlay.style.removeProperty(key);
  });
  overlay.classList.remove("agri-dashboard-managed-indicator");
}

export function clearIndicatorOverlayLayout(host: DashboardWidgetHost): void {
  host.clearOverlayLayout(host.indicatorOverlayRef.current);
  host.clearOverlayLayout(host.dateIndexOverlayRef.current);
}
