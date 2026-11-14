import type { PopupWidgetHost } from "../../popup-host";
import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { arcgisEaseInOut } from "../../../../../shared/agri-plain-object";
import { messageOrString } from "../../popup-type-guards";

export const ZOOM_DURATION_MS = 500;
export const INDICES_DEFER_MS = 650;

export type ClickView = NonNullable<
  NonNullable<PopupWidgetHost["state"]["jimuMapView"]>["view"]
>;
export type ClickHit = NonNullable<
  Awaited<ReturnType<PopupWidgetHost["resolveClickFeatureAt"]>>
>;
export type ClickFeature = NonNullable<
  Awaited<ReturnType<PopupWidgetHost["queryFeatureByObjectIdCached"]>>
>;

export interface ClickContext {
  host: PopupWidgetHost;
  view: ClickView;
  clickStartedAt: number;
  clickScreenPoint: { x: number; y: number };
  isStale: () => boolean;
}

/** Mutable per-click flag read by the dispatcher's catch block. */
export interface ClickProgress {
  popupOpened: boolean;
}

export const cleanKey = (value: unknown): string =>
  String(value || "")
    .replace(/[{}]/g, "")
    .trim();

export const dispatchClickPhase = (phase: string): void => {
  try {
    document.dispatchEvent(
      new CustomEvent("agriPolygonMapClickPhase", {
        detail: { phase, timestamp: Date.now() },
      }),
    );
  } catch {
    /* best-effort filter guard */
  }
};

export interface ZoomLabels {
  start: string;
  complete: string;
  failed: string;
}

/** Starts the (non-awaited) goTo for a geometry; throws only synchronously. */
export const startGeometryZoom = (
  ctx: ClickContext,
  geometry: __esri.Geometry,
  uniqueid: string | null,
  labels: ZoomLabels,
  onStarted?: () => void,
): void => {
  const { host, view } = ctx;
  if (!host._extentBeforeSelection && view.extent?.clone) {
    host._extentBeforeSelection = view.extent.clone();
  }
  const target = geometry.extent?.expand?.(1.15) || geometry;
  onStarted?.();
  agriMapClickDebug(labels.start, {
    uniqueid,
    geometryType: geometry.type,
    durationMs: ZOOM_DURATION_MS,
  });
  void view
    .goTo({ target }, { duration: ZOOM_DURATION_MS, easing: arcgisEaseInOut })
    .then(
      () => {
        agriMapClickDebug(labels.complete, { uniqueid, scale: view.scale });
      },
      (error: unknown) => {
        agriMapClickWarn(labels.failed, {
          uniqueid,
          error: messageOrString(error),
        });
      },
    );
};
