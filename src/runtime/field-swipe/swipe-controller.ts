import Swipe from "esri/widgets/Swipe";
import * as reactiveUtils from "esri/core/reactiveUtils";
import {
  fetchPolygonExportImageTiff,
  type ExportImageRequestParams,
  type PolygonExportImageResult,
  type VegetationIndiceType,
} from "../../gis/agri-polygon-api-source";
import {
  VEGETATION_IMAGE_LAYER_ID,
  createVegetationMediaLayer,
  resolveOverlayExtent,
} from "../../gis/polygon-api/vegetation-media-layer";
import { setSwipeCompareState } from "../../shared/agri-swipe-state";
import "./field-swipe.css";

export const SWIPE_COMPARE_LAYER_ID = "agri-field-swipe-compare-layer";
const DEFAULT_POSITION = 50;
/** Scopes the Swipe divider/handle styles (field-swipe.css) to this view only. */
export const SWIPE_VIEW_CLASS = "agri-field-swipe-active";

export type SwipeStatus = "idle" | "loading" | "ready" | "error";

export interface SwipeControllerState {
  readonly status: SwipeStatus;
  /** Swipe divider position, 0-100. */
  readonly position: number;
}

export interface SwipeCompareParams {
  uniqueid: string;
  regionId: number;
  date: string;
  indexKey: VegetationIndiceType;
}

export interface FieldSwipeController {
  setCompare: (params: SwipeCompareParams | null) => void;
  setPosition: (pct: number) => void;
  retry: () => void;
  subscribe: (fn: (state: SwipeControllerState) => void) => () => void;
  destroy: () => void;
}

export interface SwipeControllerDeps {
  fetchImage: (params: ExportImageRequestParams) => Promise<PolygonExportImageResult>;
  resolveOverlayExtent: typeof resolveOverlayExtent;
  createVegetationMediaLayer: typeof createVegetationMediaLayer;
  createSwipe: (props: __esri.SwipeProperties) => __esri.Swipe;
  watchPosition: (swipe: __esri.Swipe, onChange: (position: number) => void) => { remove: () => void };
}

export const defaultSwipeControllerDeps: SwipeControllerDeps = {
  fetchImage: fetchPolygonExportImageTiff,
  resolveOverlayExtent,
  createVegetationMediaLayer,
  createSwipe: (props) => new Swipe(props),
  watchPosition: (swipe, onChange) =>
    reactiveUtils.watch(
      () => swipe.position,
      (position) => {
        onChange(position);
      },
    ),
};

export function createFieldSwipeController(
  view: __esri.MapView,
  deps: SwipeControllerDeps = defaultSwipeControllerDeps,
): FieldSwipeController {
  const subscribers = new Set<(state: SwipeControllerState) => void>();
  let requestId = 0;
  let params: SwipeCompareParams | null = null;
  let compareLayer: __esri.Layer | null = null;
  let swipe: __esri.Swipe | null = null;
  let positionHandle: { remove: () => void } | null = null;
  let position = DEFAULT_POSITION;
  let destroyed = false;
  let status: SwipeStatus = "idle";

  const layers = (): __esri.Collection<__esri.Layer> | null => view.map?.layers ?? null;

  const findMain = (): __esri.Layer | null =>
    layers()?.find((layer) => layer.id === VEGETATION_IMAGE_LAYER_ID) ?? null;

  const notify = (): void => {
    subscribers.forEach((fn) => {
      fn({ status, position });
    });
  };

  const setStatus = (next: SwipeStatus): void => {
    status = next;
    notify();
  };

  const removeCompareLayer = (): void => {
    if (!compareLayer) return;
    const layer = compareLayer;
    compareLayer = null;
    layers()?.remove(layer);
  };

  const destroySwipe = (): void => {
    positionHandle?.remove();
    positionHandle = null;
    if (!swipe) return;
    view.container?.classList.remove(SWIPE_VIEW_CLASS);
    view.ui.remove(swipe);
    swipe.destroy();
    swipe = null;
  };

  const bindLeading = (main: __esri.Layer): void => {
    if (!swipe) return;
    swipe.leadingLayers.removeAll();
    swipe.leadingLayers.add(main);
  };

  const cleanup = (): void => {
    removeCompareLayer();
    destroySwipe();
    setSwipeCompareState({ active: false });
  };

  const onLayersChange = (): void => {
    const layer = compareLayer;
    const collection = layers();
    if (!layer || !collection) return;
    const main = findMain();
    if (!main) {
      layer.visible = false;
      return;
    }
    const mainChanged = swipe?.leadingLayers.getItemAt(0) !== main;
    if (mainChanged) bindLeading(main);
    if (collection.indexOf(layer) !== collection.indexOf(main) + 1) {
      compareLayer = null; // avoid re-entrancy while we move the layer
      collection.remove(layer);
      compareLayer = layer;
      collection.add(layer, collection.indexOf(main) + 1);
    }
    layer.visible = true;
  };

  const layersHandle = view.map?.layers.on("change", onLayersChange) ?? null;

  const applyResult = async (result: PolygonExportImageResult, p: SwipeCompareParams, current: number): Promise<void> => {
    const extent = await deps.resolveOverlayExtent(result, view.spatialReference ?? null);
    if (destroyed || current !== requestId) return;
    const layer = deps.createVegetationMediaLayer({
      canvas: result.canvas,
      extent,
      id: SWIPE_COMPARE_LAYER_ID,
      title: `Compare ${p.indexKey.toUpperCase()} ${p.date}`,
    });
    removeCompareLayer();
    const collection = layers();
    const main = findMain();
    compareLayer = layer;
    collection?.add(layer, main && collection ? collection.indexOf(main) + 1 : collection.length);
    layer.visible = main != null;
    if (swipe) {
      swipe.trailingLayers.removeAll();
      swipe.trailingLayers.add(layer);
      if (main) bindLeading(main);
    } else {
      swipe = deps.createSwipe({
        view,
        leadingLayers: main ? [main] : [],
        trailingLayers: [layer],
        direction: "horizontal",
        position,
      });
      view.ui.add(swipe);
      view.container?.classList.add(SWIPE_VIEW_CLASS);
      positionHandle = deps.watchPosition(swipe, (next) => {
        position = next;
        setSwipeCompareState({ position: next });
        notify();
      });
    }
    setStatus("ready");
    setSwipeCompareState({ active: true, position });
  };

  const load = (p: SwipeCompareParams): void => {
    requestId += 1;
    const current = requestId;
    setStatus("loading");
    deps
      .fetchImage({
        uniqueid: p.uniqueid,
        regionId: p.regionId,
        rasterDate: p.date,
        indiceType: p.indexKey,
        stretch: "fixed",
      })
      .then(async (result) => {
        if (destroyed || current !== requestId) return;
        await applyResult(result, p, current);
      })
      .catch((error: unknown) => {
        if (destroyed || current !== requestId) return;
        console.error("[agri] swipe compare snapshot failed", error);
        cleanup();
        setStatus("error");
      });
  };

  return {
    setCompare(next) {
      if (destroyed) return;
      params = next;
      if (!next) {
        requestId += 1;
        cleanup();
        setStatus("idle");
        return;
      }
      load(next);
    },
    setPosition(pct) {
      if (!Number.isFinite(pct)) return;
      position = pct;
      if (swipe) swipe.position = pct;
      setSwipeCompareState({ position: pct });
      notify();
    },
    retry() {
      if (destroyed || !params) return;
      load(params);
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      requestId += 1;
      layersHandle?.remove();
      cleanup();
      subscribers.clear();
      params = null;
    },
  };
}
