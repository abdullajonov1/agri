import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { GeoWidgetState } from "../../widget";
import type { MapZoomRequest } from "../../../../localization/map-zoom-policy";
import { errorMessage } from "../../../../../shared/agri-plain-object";
import { applyGeographyOrCropSelection, applyVhOnlySelection } from "./selection-apply";
import {
  applyHierarchyClearing,
  collectBasicUpdates,
  computeZoomRequest,
  detectGeoChanges,
  hasStateChanges,
  isGeographyDetail,
  isPolygonSelectionOnlyDetail,
  isStaleGeographyEvent,
  isVhOnlyApply,
  readEventTimestamp,
  resetStaleSelectionOnGeoChange,
  resolveSearchSelection,
  runPolygonSelectionCallback,
  stripLockedViloyat,
  syncChartOrderAndCropFlags,
  updateDebugYearFlag,
  type WidgetSelectionDetail,
} from "./selection-service-steps";

export const handleWidgetSelection = async (host: LocalizationHost, event: Event) => {
  if (!host._isMounted) return;

  const d: WidgetSelectionDetail =
    ((event as CustomEvent<WidgetSelectionDetail | null>).detail) || {};
  agriLog("handleWidgetSelection:received", {
    detail: d,
    currentLockedViloyat: host.state.lockedViloyat,
    currentViloyat: host.state.viloyat,
  });

  const eventTs = readEventTimestamp(d);
  const isGeographyEvent = isGeographyDetail(d);
  if (isStaleGeographyEvent(isGeographyEvent, eventTs, host._lastGeographySelectionTs)) {
    agriLog("handleWidgetSelection:SKIP-stale-timestamp", {
      eventTs,
      lastTs: host._lastGeographySelectionTs,
      source: d.source,
    });
    return;
  }

  const updates = collectBasicUpdates(host, d);
  const ndviDateChanged = d.ndviDate !== undefined;
  const search = resolveSearchSelection(host, d, updates);
  updateDebugYearFlag(updates);
  stripLockedViloyat(host, updates);

  const flags = detectGeoChanges(host, d, updates);
  const { yearChanged, viloyatChanged, tumanChanged, turiChanged } = flags;
  resetStaleSelectionOnGeoChange(host, d, updates, flags);
  applyHierarchyClearing(host, d, updates, flags);
  const { nextVhForOrder, nextTurlarForOrder } = syncChartOrderAndCropFlags(
    host,
    updates,
    flags,
  );

  if (!hasStateChanges(host, updates)) {
    agriLog(
      "handleWidgetSelection:NO-OP — updates matched current state exactly, " +
        "nothing will be applied",
      { updates, currentState: { viloyat: host.state.viloyat, tuman: host.state.tuman, yil: host.state.yil } },
    );
    return;
  }

  const isPolygonSelectionOnly = isPolygonSelectionOnlyDetail(d);
  if (!isPolygonSelectionOnly) host.clearPolygonFilterGuards();

  const zoomRequest: MapZoomRequest = computeZoomRequest({
    d,
    isPolygonSelectionOnly,
    updates,
    lockedViloyat: host.state.lockedViloyat,
    ...flags,
    ndviDateChanged,
  });

  agriLog("handleWidgetSelection:applying", {
    updates,
    zoomRequest,
    chartDimOrder: host._chartDimOrder.slice(),
    chartFlags: host.getChartFilterFlags(nextVhForOrder, nextTurlarForOrder),
  });

  if (isGeographyEvent && eventTs > 0) {
    host._lastGeographySelectionTs = eventTs;
  }

  const applyId = isPolygonSelectionOnly
    ? host._geographyApplyId
    : ++host._geographyApplyId;
  if (!isPolygonSelectionOnly) {
    // Drop any in-flight VH broadcast still holding the previous geography.
    host._broadcastGeneration += 1;
  }
  const isApplyCurrent = () =>
    host._isMounted && applyId === host._geographyApplyId;

  host.setState(
    {
      ...(updates as GeoWidgetState),
      // Polygon pick must not flip the dashboard loading overlay — that
      // path used to re-enter map sync and flash whole-viloyat tiles.
      loading: isPolygonSelectionOnly ? host.state.loading : true,
      // Lock NDVI date only when explicitly set AND geography didn't change.
      // If yil/viloyat/tuman changed, return to auto mode for the new area.
      ndviDateLocked:
        ndviDateChanged && !(yearChanged || viloyatChanged || tumanChanged)
          ? Boolean(updates.ndviDate)
          : false,
    },
    async () => {
      // Polygon selection/deselection only needs uniqueid/polygonMode for
      // Graff (+ highlight owned by AgriPopup). Do NOT call
      // syncRegionYearLayerVisibility here.
      if (isPolygonSelectionOnly) {
        runPolygonSelectionCallback(host, d, updates, search);
        return;
      }

      try {
        // VH-only toggles skip the geography/crop code round-trips and
        // publish charts as soon as uniqueids resolve.
        const applyArgs = {
          host,
          applyId,
          isApplyCurrent,
          zoomRequest,
          yearChanged,
          viloyatChanged,
          tumanChanged,
          turiChanged,
        };
        if (isVhOnlyApply(d, updates, host, flags)) {
          await applyVhOnlySelection(applyArgs);
        } else {
          await applyGeographyOrCropSelection(applyArgs);
        }
      } catch (e) {
        if (host._isMounted && isApplyCurrent()) {
          host.setState({ error: errorMessage(e), loading: false });
          // pendingOnly may already have spun AgriBar — clear it on failure.
          host.broadcastFilterState();
        }
      } finally {
        // The newest completed apply is authoritative: invalidate any older
        // overlay owner and always release the blocking map surface loader.
        if (isApplyCurrent()) {
          ++host._mapSurfaceLoadingToken;
          host.setMapSurfaceLoading(false, "latest-filter-settled");
        }
      }
    },
  );
};
