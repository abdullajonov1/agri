import type { PopupWidgetHost } from "../../popup-host";
import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import {
  broadcastEarlySelection,
  ensureLayerLoaded,
  handleEarlySameField,
  readEarlyIdentity,
  scheduleLatestIndices,
  zoomEarly,
} from "./click-view-early";
import {
  applyHitSelection,
  highlightHit,
  readHitIdentity,
  zoomFromHit,
} from "./click-view-hit";
import {
  handleClickError,
  loadClickAttachments,
  openPopupForClick,
  scheduleLayoutIfNeeded,
  syncSelectionAfterOpen,
} from "./click-view-popup";
import {
  dispatchClickPhase,
  type ClickContext,
  type ClickHit,
  type ClickProgress,
} from "./click-view-shared";
import { resolveClickTarget } from "./click-view-target";

const logClickReceived = (
  ev: __esri.ViewClickEvent,
  clickGeneration: number,
): void => {
  agriMapClickDebug("click:received", {
    clickGeneration,
    x: ev.x,
    y: ev.y,
    mapPoint: ev.mapPoint
      ? {
          x: ev.mapPoint.x,
          y: ev.mapPoint.y,
          wkid: ev.mapPoint.spatialReference?.wkid || null,
        }
      : null,
  });
};

const handleEmptyClick = (host: PopupWidgetHost): void => {
  // Empty map click while a field popup is open = deselect and return to
  // the district/region extent saved before the field zoom.
  if (host.state.showPopup || host.state.loading) {
    agriMapClickDebug("onViewClick: click outside — close popup + restore extent");
    host.closePopup({ restoreExtent: true, notifyDeselect: true });
  } else {
    agriMapClickDebug("onViewClick: click outside field polygons — ignored");
  }
};

interface HitSelectionState {
  hitUniqueId: string;
  hitCleanKey: string;
  zoomedFromHit: boolean;
  overlayKickedFromHit: boolean;
}

/** Zoom, highlight and early broadcast from hitTest data (outside the error boundary). */
const selectFromHit = (
  ctx: ClickContext,
  g: ClickHit["graphic"],
): HitSelectionState | null => {
  // Kick TIFF ASAP from hitTest attributes — do not wait for the OID query.
  const identity = readHitIdentity(ctx, g);
  const { hitUniqueId, hitCleanKey } = identity;
  // Zoom immediately from hitTest geometry.
  const zoomedFromHit = zoomFromHit(ctx, g, hitCleanKey);
  highlightHit(ctx, g);

  const selection = applyHitSelection(ctx, identity);
  if (selection === "stop") return null;
  return {
    hitUniqueId,
    hitCleanKey,
    zoomedFromHit,
    overlayKickedFromHit: selection === "kicked",
  };
};

const processHit = async (
  ctx: ClickContext,
  hitResult: ClickHit,
  hitState: HitSelectionState,
  progress: ClickProgress,
): Promise<void> => {
  const { host, isStale, clickScreenPoint } = ctx;
  const { graphic: g, queryHitLayer } = hitResult;
  const { hitUniqueId, hitCleanKey, zoomedFromHit, overlayKickedFromHit } = hitState;

  host.setState({
    loading: true,
    error: null,
    clickScreenPoint,
    loadingAttachments: true,
    attachments: [],
    attachmentsExpanded: true,
  });
  agriMapClickDebug("field polygon hit", {
    layerId: g.layer?.id,
    geometry: g.geometry?.type || null,
    attrKeys: g.attributes ? Object.keys(g.attributes).slice(0, 8) : [],
    overlayKickedFromHit,
  });

  const target = resolveClickTarget(ctx, g, queryHitLayer);
  if (!target) return;
  const { clickedLayer, oid, oidField } = target;

  const f = await host.queryFeatureByObjectIdCached(
    clickedLayer,
    oidField,
    oid,
    host.getOutFields(clickedLayer, oidField),
  );
  if (isStale()) return;
  if (!f) {
    host.setState({
      loading: false,
      error: host.tr("error.featureByObjectIdMissing"),
      showPopup: false,
      loadingAttachments: false,
      attachments: [],
    });
    host.clearHighlight();
    return;
  }
  if (f.geometry) host.highlightPolygon(f.geometry);

  const early = readEarlyIdentity(ctx, f);
  if (handleEarlySameField(ctx, early, overlayKickedFromHit)) return;
  broadcastEarlySelection(ctx, f, early, overlayKickedFromHit);
  scheduleLatestIndices(ctx, early, hitUniqueId, hitCleanKey);
  zoomEarly(ctx, f, early, hitCleanKey, zoomedFromHit);

  await ensureLayerLoaded(clickedLayer);
  if (isStale()) return;

  const displayAttrs = await openPopupForClick(ctx, f, target, progress);
  if (!displayAttrs) return;
  syncSelectionAfterOpen(ctx, f, displayAttrs, early);

  await loadClickAttachments(ctx, target);
  if (isStale()) return;
  scheduleLayoutIfNeeded(ctx);
};

export const onViewClick = async (host: PopupWidgetHost, ev: __esri.ViewClickEvent) => {
  dispatchClickPhase("click-start");
  // Captured BEFORE any awaits below — the attribute-resolution chain can take
  // longer than AgriGraff10's own handling of the same click; clickedAt lets
  // AgriGraff10 detect and drop a stale result.
  const clickStartedAt = Date.now();
  const clickGeneration = ++host._clickGeneration;
  logClickReceived(ev, clickGeneration);
  const isStale = () => !host._isMounted || clickGeneration !== host._clickGeneration;
  const progress: ClickProgress = { popupOpened: false };
  const jmv = host.state.jimuMapView;
  const view = jmv?.view;
  if (!view || !jmv) {
    agriMapClickWarn("onViewClick SKIP: no view/jmv");
    return;
  }

  const layers = await host.resolveClickLayers(view, jmv);
  if (isStale()) return;
  agriMapClickDebug("onViewClick start", {
    screen: { x: ev.x, y: ev.y },
    layerCount: layers.length,
    layers: layers.map((l) => ({ id: l.id, title: l.title, url: l.url })),
  });

  const clickScreenPoint = { x: ev.x, y: ev.y };
  const hitResult = await host.resolveClickFeatureAt(ev, view, layers);
  if (isStale()) return;
  dispatchClickPhase("after-hit-test");

  if (!hitResult) {
    handleEmptyClick(host);
    return;
  }

  const ctx: ClickContext = { host, view, clickStartedAt, clickScreenPoint, isStale };
  const hitState = selectFromHit(ctx, hitResult.graphic);
  if (!hitState) return;
  try {
    await processHit(ctx, hitResult, hitState, progress);
  } catch (e: unknown) {
    handleClickError(ctx, e, progress);
  }
};
