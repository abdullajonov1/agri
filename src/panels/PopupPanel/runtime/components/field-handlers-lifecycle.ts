import { AGRI_EVENTS } from "../../../../shared/agri-events";
import type { PopupWidgetHost } from "../popup-host";
import type {
  Config,
  State,
} from "../popup-types";
import { bindMasterFilter } from "../../../../data/agri-filter-bus";
import { AGRI_MAP_VIEW_READY_EVENT, AGRI_MAP_CLICK_EVENT, AGRI_XY_PAGE_CLOSED_EVENT } from "../../../../gis/agri-data-layer-roles";
import { agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { getSelectedDsIds } from "../../../../gis/agri-data-source-engine";
import { type AllWidgetProps, type QueriableDataSource } from "jimu-core";

/** Polling interval while waiting for the map click handler to attach. */
const MAP_CLICK_BOOTSTRAP_POLL_MS = 2500;

/** `props.useMapWidgetIds` read defensively (ImmutableArray or plain array). */
interface MapWidgetIdIndex {
  [index: number]: unknown;
  get?(index: number): unknown;
}

export const calculatePopupPosition = (host: PopupWidgetHost, clickPoint: { x: number; y: number }, view: __esri.MapView | __esri.SceneView): { x: number; y: number } => {
  const container = view.container as HTMLElement;
  const rect = container.getBoundingClientRect();

  const margin = host.POPUP_MARGIN;
  const popupW = host.getPopupWidth(view);
  const popupH = popupW;

  // ✅ EB builds differ:
  // - some give ev.x/ev.y relative to container (0..rect.width)
  // - others give viewport coords (same space as rect.left/top)
  const looksContainerRelative =
    clickPoint.x >= 0 &&
    clickPoint.y >= 0 &&
    clickPoint.x <= rect.width + 2 &&
    clickPoint.y <= rect.height + 2;

  // Convert click to VIEWPORT coords (because popup is position: fixed)
  const viewportClickX = looksContainerRelative
    ? rect.left + clickPoint.x
    : clickPoint.x;
  const viewportClickY = looksContainerRelative
    ? rect.top + clickPoint.y
    : clickPoint.y;

  // Map container boundaries in viewport coords
  const mapLeft = rect.left;
  const mapTop = rect.top;
  const mapRight = rect.right;
  const mapBottom = host.getEffectiveMapBottom(view, margin);

  // Prefer bottom-right of click
  let x = viewportClickX + margin;
  let y = viewportClickY + margin;

  // Flip left if overflowing right edge (CRITICAL!)
  // Check if popup would go outside map's right boundary
  if (x + popupW > mapRight - margin) {
    x = viewportClickX - popupW - margin;
  }

  // Flip up if overflowing bottom edge
  if (y + popupH > mapBottom - margin) {
    y = viewportClickY - popupH - margin;
  }

  // Final hard clamp to map container bounds
  // This is the critical part - ensure popup NEVER exceeds map bounds
  const minX = mapLeft + margin;
  const maxX = mapRight - popupW - margin;
  const minY = mapTop + margin;
  const maxY = mapBottom - popupH - margin;

  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));

  // FINAL SAFETY NET: Ensure x never exceeds right boundary
  if (x + popupW > mapRight - margin) {
    x = mapRight - popupW - margin;
  }
  // Also ensure x >= left boundary
  if (x < mapLeft + margin) {
    x = mapLeft + margin;
  }

  return { x, y };
};

export function componentDidMount(host: PopupWidgetHost): void {
  host._isMounted = true;
  host.setupThemeObserver();
  const isDarkTheme = host.getResolvedTheme();
  if (isDarkTheme !== host.state.isDarkTheme) {
    host.setState({ isDarkTheme });
  }
  document.addEventListener(
    AGRI_EVENTS.themeChanged,
    host.handleThemeChange as EventListener,
  );
  document.addEventListener(
    AGRI_EVENTS.languageChanged,
    host.handleLanguageChange as EventListener,
  );
  document.addEventListener("mousedown", host.handleOutsideClick);
  host._unbindMasterFilter = bindMasterFilter(host.handleMasterFilterChanged);
  document.addEventListener(
    AGRI_EVENTS.widgetSelectionChanged,
    host.handleWidgetSelectionChanged as EventListener,
  );
  window.addEventListener("resize", host.schedulePopupLayout);
  window.addEventListener(
    AGRI_MAP_VIEW_READY_EVENT,
    host.handleMapViewReady as EventListener,
  );
  window.addEventListener(
    AGRI_MAP_CLICK_EVENT,
    host.handleSharedMapClick as EventListener,
  );
  window.addEventListener(
    AGRI_XY_PAGE_CLOSED_EVENT,
    host.handleXyPageClosed as EventListener,
  );
  if (!host.isDashboardEmbedded()) {
    window.addEventListener("scroll", host.schedulePopupLayout, true);
  }
  host.scheduleMapViewFallback();
  host.mapClickBootstrapTimer = setInterval(() => {
    if (host.ensureMapClickAttached() && host.mapClickBootstrapTimer) {
      clearInterval(host.mapClickBootstrapTimer);
      host.mapClickBootstrapTimer = null;
    }
  }, MAP_CLICK_BOOTSTRAP_POLL_MS);
  agriMapClickDebug("AgriPolygon mounted", {
    widgetId: host.props.id,
    embedded: host.isDashboardEmbedded(),
    mapWidgetId: host.getLinkedMapWidgetId(),
    useDataSourceIds: getSelectedDsIds(host.props.useDataSources),
  });
}

export function componentWillUnmount(host: PopupWidgetHost): void {
  host._isMounted = false;
  if (host.state.showPopup) {
    host.broadcastPopupVisibility(false);
  }
  document.removeEventListener(
    AGRI_EVENTS.themeChanged,
    host.handleThemeChange as EventListener,
  );
  document.removeEventListener(
    AGRI_EVENTS.languageChanged,
    host.handleLanguageChange as EventListener,
  );
  host.detachMapClick();
  host.cleanupHighlight();
  document.removeEventListener("mousedown", host.handleOutsideClick);
  host._unbindMasterFilter?.();
  host._unbindMasterFilter = null;
  document.removeEventListener(
    AGRI_EVENTS.widgetSelectionChanged,
    host.handleWidgetSelectionChanged as EventListener,
  );
  window.removeEventListener("resize", host.schedulePopupLayout);
  window.removeEventListener(
    AGRI_MAP_VIEW_READY_EVENT,
    host.handleMapViewReady as EventListener,
  );
  window.removeEventListener(
    AGRI_MAP_CLICK_EVENT,
    host.handleSharedMapClick as EventListener,
  );
  window.removeEventListener(
    AGRI_XY_PAGE_CLOSED_EVENT,
    host.handleXyPageClosed as EventListener,
  );
  if (host.mapViewFallbackTimer) clearTimeout(host.mapViewFallbackTimer);
  if (host.mapInitRetryTimer) clearTimeout(host.mapInitRetryTimer);
  if (host.mapClickBootstrapTimer) clearInterval(host.mapClickBootstrapTimer);
  window.removeEventListener("scroll", host.schedulePopupLayout, true);
  if (host._popupLayoutTimer) clearTimeout(host._popupLayoutTimer);
  if (host._popupLayoutRaf) cancelAnimationFrame(host._popupLayoutRaf);
  host.mapAreaResizeObserver?.disconnect();
  host.mapAreaResizeObserver = null;
  window.removeEventListener("mousemove", host.onPopupDragMove);
  window.removeEventListener("mouseup", host.onPopupDragEnd);
  if (host.themeObserver) {
    host.themeObserver.disconnect();
    host.themeObserver = null;
  }
  host.revokeAllAttachmentUrls();
  host._featureQueryCache.clear();
}

export function componentDidUpdate(host: PopupWidgetHost, prevProps: Readonly<AllWidgetProps<Config>>, prevState: Readonly<State>) {
  const prevDs = getSelectedDsIds(prevProps.useDataSources).join("|");
  const nextDs = getSelectedDsIds(host.props.useDataSources).join("|");
  const dsChanged = prevDs !== nextDs;
  const prevIds: MapWidgetIdIndex | null | undefined = prevProps.useMapWidgetIds;
  const nextIds: MapWidgetIdIndex | null | undefined = host.props.useMapWidgetIds;
  const prevMap = String(prevIds?.[0] || prevIds?.get?.(0) || "");
  const nextMap = String(nextIds?.[0] || nextIds?.get?.(0) || "");
  const mapChanged = prevMap !== nextMap;
  if ((dsChanged || mapChanged) && host.state.jimuMapView) {
    void host.initializeMapConnection(host.state.jimuMapView);
  } else if (mapChanged) {
    host.scheduleMapViewFallback();
  }

  if (
    prevState.showPopup !== host.state.showPopup ||
    prevState.popupMinimized !== host.state.popupMinimized
  ) {
    host.broadcastPopupVisibility(
      host.state.showPopup && !host.state.popupMinimized,
    );
  } else if (
    host.state.showPopup &&
    !host.state.popupMinimized &&
    prevState.pinToCorner !== host.state.pinToCorner
  ) {
    host.broadcastPopupVisibility(true);
  }

  if (!host.state.showPopup || host.state.popupMinimized) return;

  const openedNow =
    (host.state.showPopup && !prevState.showPopup) ||
    (prevState.popupMinimized && !host.state.popupMinimized);
  const attachmentsChanged =
    host.state.loadingAttachments !== prevState.loadingAttachments ||
    (host.state.attachments?.length || 0) !==
      (prevState.attachments?.length || 0);
  const loadingChanged = host.state.loading !== prevState.loading;
  const attrsChanged = host.state.selectedAttrs !== prevState.selectedAttrs;

  if (
    !openedNow &&
    !attachmentsChanged &&
    !loadingChanged &&
    !attrsChanged
  ) {
    return;
  }

  host.schedulePopupLayoutAfterContent();
}

export const closePopup = (host: PopupWidgetHost, opts?: {
    restoreExtent?: boolean;
    notifyDeselect?: boolean;
  }) => {
  // Closing the panel alone must keep the polygon highlight + map extent.
  // Explicit callers (empty map click / geo reset) opt into restore/deselect.
  const restoreExtent = opts?.restoreExtent === true;
  const notifyDeselect = opts?.notifyDeselect === true;

  // Invalidate every pending hitTest/query/attachment request. Otherwise a
  // field click that was still loading could reopen its stale popup after
  // the user had already moved to another district or region.
  host._clickGeneration += 1;
  host._latestIndicesRequestId += 1;

  if (!host.state.showPopup) {
    if (notifyDeselect) {
      host.clearHighlight();
      host.notifyGraffPolygonSelection("", false);
    }
    if (!restoreExtent) host._extentBeforeSelection = null;
    host.setState({
      loading: false,
      error: null,
      selectedAttrs: null,
      selectedOID: null,
      objectIdField: null,
      lastClickedDsId: null,
      lastClickedLayerKey: null,
      popupPosition: null,
      clickScreenPoint: null,
      popupMinimized: false,
    });
    return;
  }

  if (notifyDeselect) {
    host.clearHighlight();
    host.notifyGraffPolygonSelection("", false);
  }
  host.revokeAllAttachmentUrls();
  host.setState({
    showPopup: false,
    popupMinimized: false,
    popupPosition: null,
    clickScreenPoint: null,
    loading: false,
    error: null,
    selectedAttrs: null,
    selectedOID: null,
    objectIdField: null,
    lastClickedDsId: null,
    lastClickedLayerKey: null,
    attachments: [],
    attachmentsExpanded: false,
    loadingAttachments: false,
    chartExpanded: false,
    chartHoverIndex: null,
    loadingLatestIndices: false,
    latestIndexDate: null,
    latestIndexValues: null,
  });
  if (restoreExtent) {
    host.restoreExtentBeforeSelection();
  } else {
    host._extentBeforeSelection = null;
  }
};

/** Header X — collapse the panel; keep polygon selection + loaded attrs. */
export const minimizePopup = (host: PopupWidgetHost): void => {
  if (!host._isMounted || !host.state.showPopup || host.state.popupMinimized) {
    return;
  }
  host.setState({ popupMinimized: true });
};

/** Expand a previously minimized attribute panel. */
export const expandPopup = (host: PopupWidgetHost): void => {
  if (!host._isMounted || !host.state.showPopup || !host.state.popupMinimized) {
    return;
  }
  host.setState({ popupMinimized: false });
};

export const onDataSourceCreated = (host: PopupWidgetHost, ds: QueriableDataSource) => {
  if (!ds?.id) return;
  host.dataSourceEngine.onDsCreated(
    ds,
    getSelectedDsIds(host.props.useDataSources),
  );
  host.setState((prev) => ({
    dataSourcesById: { ...(prev.dataSourcesById || {}), [ds.id]: ds },
  }));
  if (host.state.jimuMapView) {
    void host.initializeMapConnection(host.state.jimuMapView);
  } else {
    host.scheduleMapViewFallback();
  }
};
