import type { LocalizationHost, LocalizationWidgetProps } from "../host";
import { debugCatch } from "../localization-log";
import type { GeoWidgetState } from "../../widget";
import { isMapImageOwnedLayer } from "../../../../../gis/feature-layer-data";
import { MAP_CONNECTION_RETRY_MS } from "../../../../../shared/map-connection-service";
import { subscribeDashboardPack, getDashboardPack } from "../../../../../store/agri-dashboard-store";

export function componentDidMount(host: LocalizationHost) {
  host._isMounted = true;
  host.hydrateNotificationCache();
  host._unbindNotificationPack = subscribeDashboardPack(
    host.onDashboardPackForNotifications,
  );
  host.onDashboardPackForNotifications(getDashboardPack());

  host.setState({ connectionStatus: "connecting" });
  host.initializeTheme();
  document.addEventListener("mousedown", host.handleDocumentClick);

  // ✅ define handler BEFORE registering it
  host._onReset = () => {
    if (!host._isMounted) return;

    host.setState(
      {
        yil: "",
        viloyat: "",
        tuman: "",
        turi: "",
        turlar: [],
        vh: "",
        ndviDate: "",
        yilOptions: [],
        graffSearchText: "",
        graffSearchSuggestions: [],
        graffSearchShowSuggestions: false,
        graffSearchLoading: false,
        initialPreselectionProcessed: true,
        selectedGraffUniqueid: "",
        polygonMode: false,
        selectedFarmerInn: "",
      },
      async () => {
        host._allowClearOnce = true;
        host._farmerMapUniqueIds = null;
        host._preFarmerSearchGeo = null;

        if (host.state.connectionStatus === "connected") {
          try {
            await host.applyMapFiltersOptimized({ mode: "home", reason: "reset" });
            await host.fetchDataWithCurrentState();
            host.broadcastFilterState();
            host.emitGraffTableSearchClear();
          } catch {
            /* ignore */
          }
        }
      },
    );
  };

  // ONLY listen to widget selection events - no cross-widget events
  document.addEventListener(
    "widgetSelectionChanged",
    host.handleWidgetSelection as EventListener,
  );
  document.addEventListener(
    "agriPolygonMapClickPhase",
    host.handlePolygonMapClickPhase as EventListener,
  );
  document.addEventListener("resetAllFilters", host._onReset as EventListener);
  document.addEventListener(
    "requestMasterFilterState",
    host.handleRequestMasterFilterState as EventListener,
  );

  host.initializationTimer = setTimeout(
    () => host.ensureInitialization(),
    3000,
  );
}

export function componentWillUnmount(host: LocalizationHost) {
  host._isMounted = false;
  host._unbindNotificationPack?.();
  host._unbindNotificationPack = null;
  if (host._notificationPaintFrame) {
    cancelAnimationFrame(host._notificationPaintFrame);
    host._notificationPaintFrame = 0;
  }
  document.removeEventListener(
    "widgetSelectionChanged",
    host.handleWidgetSelection as EventListener,
  );
  document.removeEventListener(
    "agriPolygonMapClickPhase",
    host.handlePolygonMapClickPhase as EventListener,
  );
  document.removeEventListener("resetAllFilters", host._onReset);
  document.removeEventListener(
    "requestMasterFilterState",
    host.handleRequestMasterFilterState as EventListener,
  );
  document.removeEventListener("mousedown", host.handleDocumentClick);

  if (host.initializationTimer) clearTimeout(host.initializationTimer);
  if (host._retryTimeout) clearTimeout(host._retryTimeout);
  if (host._dsOnlyRetryTimer) {
    clearTimeout(host._dsOnlyRetryTimer);
    host._dsOnlyRetryTimer = null;
  }
  if (host._graffSearchDebounceTimer) {
    clearTimeout(host._graffSearchDebounceTimer);
    host._graffSearchDebounceTimer = null;
  }
  if (host._dataSourceInfoDebounceTimer) {
    clearTimeout(host._dataSourceInfoDebounceTimer);
    host._dataSourceInfoDebounceTimer = null;
  }
  if (host._mapClickHandle) {
    try {
      host._mapClickHandle.remove();
    } catch {
      /* ignore */
    }
    host._mapClickHandle = null;
  }
  if (host._mapInteractionHandle) {
    try {
      host._mapInteractionHandle.remove();
    } catch {
      /* ignore */
    }
    host._mapInteractionHandle = null;
  }
  host._zoomRequestId += 1;
  host.clearPolygonFilterGuards();
  host.clearRegionYearSettleRepaintTimers();

  try {
    host.state.featureLayers?.forEach((fl) => {
      if (!isMapImageOwnedLayer(fl)) fl.definitionExpression = "";
    });
    if (
      host.state.featureLayer &&
      !isMapImageOwnedLayer(host.state.featureLayer)
    )
      host.state.featureLayer.definitionExpression = "";
  } catch (err) {
    debugCatch("componentWillUnmount:reset-definition-failed", err);
  }
}

export function componentDidUpdate(host: LocalizationHost, prevProps: LocalizationWidgetProps, prevState: GeoWidgetState) {
  const { connectionStatus, mapConnectionAttempts } = host.state;

  const shouldRetry =
    connectionStatus === "connecting" &&
    host.props.useMapWidgetIds?.length > 0 &&
    !host.state.activeMapView &&
    mapConnectionAttempts !== prevState.mapConnectionAttempts &&
    mapConnectionAttempts < host.MAX_CONNECTION_ATTEMPTS;

  if (shouldRetry) {
    if (host._retryTimeout) clearTimeout(host._retryTimeout);
    host._retryTimeout = setTimeout(() => {
      if (!host._isMounted) return;
      host.setState((s) => ({
        mapConnectionAttempts: s.mapConnectionAttempts + 1,
      }));
    }, MAP_CONNECTION_RETRY_MS);
  }

  if (
    host.state.openToolbarMenu === "notifications" &&
    (prevState.openToolbarMenu !== "notifications" ||
      prevState.notificationDays !== host.state.notificationDays ||
      prevState.notificationLoading !== host.state.notificationLoading)
  ) {
    requestAnimationFrame(() => host.updateNotificationScrollHint());
  }
}
