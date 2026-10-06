import type { LocalizationHost } from "../../host";
import { JimuMapView } from "jimu-arcgis";
import { getAgriServiceUrls } from "../../../../../../shared/agri-service-urls";
import esriRequest from "esri/request";
import { debugCatch, agriLog } from "../../localization-log";
import { dispatchMapViewReady, dispatchMapClick } from "../../../../../../gis/agri-data-layer-roles";
import { MAX_DS_ONLY_RETRIES, DS_ONLY_RETRY_DELAY_MS } from "../../../../../../shared/map-connection-service";
import { getAppStore, type IMUseDataSource } from "jimu-core";
import { isAccessConfigured, isAccessDenied, resolveAllowedViloyatsForGroups, lockedViloyat as accessLockedViloyat } from "../../../../../../shared/agri-access-config";
import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../../../../../shared/agri-http";

const FAIL_OPEN_IF_NO_MATCH = false;
/* ---------------------- Map / DataSource ---------------------- */

/** Mutable copy of the widget's configured useDataSources (or `[]`). */
function readUseDataSourcesFromProps(host: LocalizationHost): IMUseDataSource[] {
  const raw: unknown =
    host.props.useDataSources?.asMutable?.() ??
    host.props.useDataSources ??
    [];
  return Array.isArray(raw) ? (raw as IMUseDataSource[]) : [];
}

export const getPortalSelf = async (
  host: LocalizationHost,
  jimuMapView: JimuMapView,
): Promise<{
  username: string | null;
  groups: Array<{ id: string; title: string }>;
  portalUrl: string;
}> => {
  try {
    const portalUrl =
      getAgriServiceUrls().portalUrl ||
      (jimuMapView?.view?.map as __esri.WebMap)?.portalItem?.portal?.url ||
      "https://www.arcgis.com";

    const resp = await esriRequest(
      `${portalUrl}/sharing/rest/community/self`,
      {
        query: { f: "json" },
        responseType: "json",
        withCredentials: true,
        timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
      },
    );

    const username = resp?.data?.username ?? null;
    const groups = Array.isArray(resp?.data?.groups)
      ? resp.data.groups.map((g: { id: string; title: string }) => ({
          id: g.id,
          title: g.title,
        }))
      : [];
    return { username, groups, portalUrl };
  } catch (e) {
    debugCatch("getPortalSelf", e);
    return { username: null, groups: [], portalUrl: "unknown" };
  }
};
/** Effective data sources to use. By default use all selected sources. */
export function getEffectiveUseDataSources(host: LocalizationHost): IMUseDataSource[] {
  const arr = readUseDataSourcesFromProps(host);
  const cfgN = Number(host.props.config?.numberOfDataSources);
  const hasLimit = Number.isFinite(cfgN) && cfgN > 0;
  const n = hasLimit ? Math.min(arr.length, Math.floor(cfgN)) : arr.length;
  return arr.slice(0, n);
}
export const attachMapClickDispatcher = (host: LocalizationHost, jimuMapView: JimuMapView): void => {
  const view = jimuMapView?.view;
  if (!view) return;

  if (host._mapInteractionHandle) {
    try {
      host._mapInteractionHandle.remove();
    } catch (err) {
      debugCatch("mapInteraction:remove-failed", err);
    }
    host._mapInteractionHandle = null;
  }
  host._mapInteractionHandle = view.watch("interacting", (interacting) => {
    if (interacting) host._zoomRequestId += 1;
  });

  if (host._mapClickHandle) {
    try {
      host._mapClickHandle.remove();
    } catch {
      /* ignore */
    }
    host._mapClickHandle = null;
  }

  const mapWidgetId = host.getMapWidgetId();
  if (mapWidgetId) {
    dispatchMapViewReady(mapWidgetId);
  }

  host._mapClickHandle = view.on("click", (ev: __esri.ViewClickEvent) => {
    if (!mapWidgetId) return;
    dispatchMapClick({
      mapWidgetId,
      x: Number(ev?.x ?? 0),
      y: Number(ev?.y ?? 0),
      mapPoint: ev?.mapPoint
        ? {
            x: Number(ev.mapPoint.x),
            y: Number(ev.mapPoint.y),
            spatialReference: ev.mapPoint.spatialReference
              ? { wkid: ev.mapPoint.spatialReference.wkid }
              : undefined,
          }
        : undefined,
    });
  });
};
export const onActiveViewChange = (host: LocalizationHost, jimuMapView: JimuMapView) => {
  if (!jimuMapView) {
    host.setState({
      activeMapView: null,
      featureLayer: undefined,
      featureLayers: [],
      spatialMapLayers: [],
    });
    return;
  }
  host.setState({ activeMapView: jimuMapView }, () => {
    host.attachMapClickDispatcher(jimuMapView);
    const captureHomeExtent = (): void => {
      try {
        const ex = jimuMapView.view?.extent;
        host._homeExtent = ex?.clone ? ex.clone() : ex || null;
      } catch {
        host._homeExtent = null;
      }
    };
    if (jimuMapView.view?.ready) {
      // EmbeddedAgriMap frames Uzbekistan before ready — capture that as home.
      captureHomeExtent();
      host.initializeMapConnection(jimuMapView);
    } else {
      const h = jimuMapView.view.watch("ready", (isReady) => {
        if (isReady) {
          h.remove();
          captureHomeExtent();
          host.initializeMapConnection(jimuMapView);
        }
      });
    }
  });
};
export const initializeMapConnection = (host: LocalizationHost, jimuMapView: JimuMapView): Promise<void> => {
  if (!host._isMounted || host.state.connectionStatus === 'connected') {
    return Promise.resolve();
  }
  if (host._mapConnectionPromise) return host._mapConnectionPromise;

  const run = host.initializeMapConnectionOnce(jimuMapView).finally(() => {
    if (host._mapConnectionPromise === run) host._mapConnectionPromise = null;
  });
  host._mapConnectionPromise = run;
  return run;
};
export const reassertPolygonGeographyFilter = (host: LocalizationHost, phase: string): void => {
  if (!host._isMounted || !host.state.polygonMode) return;
  const map = host.state.activeMapView?.view?.map;
  if (!map) return;
  const shown = host.syncShownRegionYearLayers(map);
  shown.forEach((entry) => {
    try {
      if (Number(entry.layer?.opacity ?? 1) <= 0.05) entry.layer.opacity = 1;
    } catch {
      /* best-effort */
    }
  });
  host._lastShownRegionYearLayers = shown;
  agriLog("polygonFilterGuard:checked", {
    phase,
    yil: host.state.yil,
    viloyat: host.getEffectiveViloyat(),
    tuman: host.state.tuman,
    shownLayerCount: shown.length,
  });
};
export const initializeMapConnectionOnce = async (host: LocalizationHost, jimuMapView: JimuMapView) => {
  if (!host._isMounted) return;
  agriLog("initializeMapConnection:start", {
    hasMapView: !!jimuMapView,
    hasMap: !!jimuMapView?.view?.map,
    useDataSources: host.getEffectiveUseDataSources().map((d) => ({
      dataSourceId: d?.dataSourceId,
      rootDataSourceId: d?.rootDataSourceId,
    })),
  });

  const featureLayers =
    await host.resolveFeatureLayersFromUseDataSources(jimuMapView);
  agriLog("initializeMapConnection:resolved", {
    count: featureLayers?.length ?? 0,
    layers: (featureLayers || []).map((l) => l?.title || l?.url || l?.id),
  });

  // Best-effort — visual map filtering degrades gracefully (no-op) if this
  // comes back empty; it never blocks the Agri_table_data connection.
  try {
    const useDsRaw = readUseDataSourcesFromProps(host);
    agriLog("spatialMapLayers:useDataSources-from-settings", {
      count: Array.isArray(useDsRaw) ? useDsRaw.length : 0,
      dataSourceIds: useDsRaw.map((d) => d?.dataSourceId),
    });
    // Spatial wrappers are optional: live MapImage sublayers are discovered
    // separately. Never let many non-queryable roots block dashboard startup.
    void host.resolveSpatialMapLayers(jimuMapView).then((spatialMapLayers) => {
      agriLog("spatialMapLayers:resolved", {
        requestedCount: Array.isArray(useDsRaw) ? useDsRaw.length : 0,
        resolvedCount: spatialMapLayers.length,
      });
      if (host._isMounted) host.setState({ spatialMapLayers });
    }).catch((e) => {
      agriLog("spatialMapLayers:resolve-FAILED", {
        error: String(e?.message || e),
      });
    });
  } catch (e) {
    agriLog("spatialMapLayers:resolve-FAILED", {
      error: String(e?.message || e),
    });
  }

  if (!featureLayers?.length) {
    // Map didn't have a matching operational layer — fall back to the
    // selected data source directly instead of failing outright.
    agriLog(
      "initializeMapConnection:no-map-match -> falling back to data-source-only",
    );
    await host.initializeDataSourceOnlyConnection(
      "Could not resolve the map layer(s) for the selected data source(s).",
    );
    return;
  }
  await host.finalizeConnection(featureLayers, jimuMapView);
};
/**
 * Connects using the selected DataSourceSelector layer(s) directly,
 * without requiring the layer to also exist on a linked Map widget.
 * Used when no Map widget is linked, or when map-layer matching fails.
 */
export const initializeDataSourceOnlyConnection = async (
  host: LocalizationHost,
  failureMessage = "Could not resolve a queryable layer for the selected data source(s).",
): Promise<void> => {
  agriLog("initializeDataSourceOnlyConnection:start", {
    isMounted: host._isMounted,
    connectionStatus: host.state?.connectionStatus,
    retryCount: host._dsOnlyRetryCount,
  });
  if (!host._isMounted || host.state.connectionStatus === "connected") return;

  const featureLayers = await host.resolveFeatureLayersFromUseDataSources(
    null,
  );
  agriLog("initializeDataSourceOnlyConnection:resolved", {
    count: featureLayers?.length ?? 0,
    layers: (featureLayers || []).map((l) => l?.title || l?.url || l?.id),
  });
  if (!featureLayers?.length) {
    // The data source may just not be fully loaded yet (e.g. right after
    // mount, or while the Map Image Layer sublayer is still resolving) —
    // retry with backoff instead of failing on the first empty attempt.
    if (host._dsOnlyRetryCount < MAX_DS_ONLY_RETRIES) {
      host._dsOnlyRetryCount += 1;
      agriLog(
        "initializeDataSourceOnlyConnection:retrying",
        { attempt: host._dsOnlyRetryCount },
      );
      if (host._dsOnlyRetryTimer) clearTimeout(host._dsOnlyRetryTimer);
      host._dsOnlyRetryTimer = setTimeout(() => {
        host._dsOnlyRetryTimer = null;
        void host.initializeDataSourceOnlyConnection(failureMessage);
      }, DS_ONLY_RETRY_DELAY_MS);
      return;
    }
    agriLog("initializeDataSourceOnlyConnection:failed", {
      failureMessage,
    });
    host.setState({ connectionStatus: "failed", error: failureMessage });
    return;
  }
  host._dsOnlyRetryCount = 0;
  await host.finalizeConnection(featureLayers, host.state.activeMapView);
};
/** Shared tail of both the map-matched and data-source-only connection paths. */
export const finalizeConnection = async (
  host: LocalizationHost,
  featureLayers: __esri.FeatureLayer[],
  jimuMapView: JimuMapView | null,
): Promise<void> => {
  if (!host._isMounted) return;
  const featureLayer = featureLayers[0];
  agriLog("finalizeConnection:start", {
    primaryLayer: featureLayer?.title || featureLayer?.url,
    layerCount: featureLayers.length,
    hasMapView: !!jimuMapView,
  });

  const { username, groups } = await host.getPortalSelf(jimuMapView);
  const accessGroups = Array.from(
    getAppStore().getState()?.user?.groups ?? [],
  ).map((group: { id?: unknown; title?: unknown }) => ({
    id: String(group.id),
    title: String(group.title || ""),
  }));
  let allowedViloyats: string[] = [];
  let lockedViloyat: string | null = null;

  if (isAccessConfigured()) {
    if (isAccessDenied()) {
      agriLog(
        "finalizeConnection:failed - access denied by portal groups",
      );
      host.setState({
        connectionStatus: "failed",
        error: "Доступ запрещён для вашей группы пользователей.",
      });
      return;
    }

    allowedViloyats = resolveAllowedViloyatsForGroups(accessGroups).map(
      (value) => host.normalizeApos(value),
    );
    if (accessLockedViloyat) {
      lockedViloyat = host.normalizeApos(accessLockedViloyat);
    } else if (allowedViloyats.length === 1) {
      lockedViloyat = allowedViloyats[0];
    }
  } else {
    allowedViloyats = host.resolveAllowedViloyats(groups);
    if (allowedViloyats.length === 1) {
      lockedViloyat = allowedViloyats[0];
    } else if (
      allowedViloyats.length === 0 &&
      typeof FAIL_OPEN_IF_NO_MATCH !== "undefined" &&
      FAIL_OPEN_IF_NO_MATCH
    ) {
      agriLog(
        "finalizeConnection:failed - no matching scoped group",
      );
      host.setState({
        connectionStatus: "failed",
        error: "No matching scoped group.",
      });
      return;
    }
  }

  agriLog("finalizeConnection:portal", {
    username,
    groupCount: groups.length,
    allowedViloyats,
  });

  agriLog("finalizeConnection:connected", {
    lockedViloyat,
  });
  host.setState(
    {
      featureLayer,
      featureLayers,
      connectionStatus: "connected",
      error: null,
      userName: username,
      userGroupIds: groups.map((g) => g.id),
      allowedViloyats,
      lockedViloyat,
    },
    async () => {
      try {
        // Start with everything hidden until user picks filters.
        featureLayers.forEach((fl) => {
          fl.definitionExpression = "1=0";
        });
      } catch (err) {
        debugCatch("finalizeConnection:hide-layers-failed", err);
      }
      host._allowClearOnce = true;
      // NDVI date discovery now happens lazily in computeVhBarData(),
      // scoped to the selected region/district via
      // queryVegetationAvailableDates() (agri_vegetation_indices) — no
      // eager per-layer field scan needed here anymore.
      await host.runInitialDataLoad();
    },
  );
};
