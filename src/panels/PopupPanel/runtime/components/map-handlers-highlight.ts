import type { PopupWidgetHost } from "../popup-host";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import Graphic from "esri/Graphic";

export const setupHighlightLayer = (host: PopupWidgetHost, view: __esri.MapView | __esri.SceneView) => {
  if (!host._highlightLayer) {
    host._highlightLayer = new GraphicsLayer({
      id: "agri-polygon-highlight",
      title: "Selected Polygon Highlight",
    });
    view.map.add(host._highlightLayer);
  }
};

export const highlightPolygon = (host: PopupWidgetHost, geometry: __esri.Geometry) => {
  if (!host._highlightLayer || !geometry) return;
  host.clearHighlight();

  // Drop Graff/table selection graphics so only one outline is visible.
  try {
    host.state.jimuMapView?.view?.graphics?.removeAll?.();
  } catch {
    /* ignore */
  }

  // Wide translucent halo plus a bright cyan core keeps the selected field
  // visible over both light and dark satellite imagery.
  const haloSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: new SimpleLineSymbol({
      color: [0, 229, 255, 0.32],
      width: 9,
      style: "solid",
    }),
  });
  const highlightSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: new SimpleLineSymbol({
      color: [128, 245, 255, 1],
      width: 3,
      style: "solid",
    }),
  });

  host._highlightHaloGraphic = new Graphic({ geometry, symbol: haloSymbol });
  host._highlightGraphic = new Graphic({ geometry, symbol: highlightSymbol });
  host._highlightLayer.addMany([
    host._highlightHaloGraphic,
    host._highlightGraphic,
  ]);
};

export const clearHighlight = (host: PopupWidgetHost) => {
  if (!host._highlightLayer) return;
  if (host._highlightHaloGraphic) {
    host._highlightLayer.remove(host._highlightHaloGraphic);
    host._highlightHaloGraphic = null;
  }
  if (host._highlightGraphic) {
    host._highlightLayer.remove(host._highlightGraphic);
    host._highlightGraphic = null;
  }
};

export const restoreExtentBeforeSelection = (host: PopupWidgetHost) => {
  const view = host.state.jimuMapView?.view;
  const savedExtent = host._extentBeforeSelection;
  host._extentBeforeSelection = null;
  const zoomTo = host.props.config?.settings?.zoomToSelection !== false;
  if (!zoomTo || !savedExtent || !view) return;
  try {
    void view.goTo(savedExtent, { duration: 400 });
  } catch {
    /* ignore */
  }
};

export const cleanupHighlight = (host: PopupWidgetHost) => {
  if (host._highlightLayer) {
    const view = host.state.jimuMapView?.view;
    if (view && view.map) {
      view.map.remove(host._highlightLayer);
    }
    host._highlightLayer = null;
    host._highlightGraphic = null;
    host._highlightHaloGraphic = null;
  }
  host._extentBeforeSelection = null;
};
