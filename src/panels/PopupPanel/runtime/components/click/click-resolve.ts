/**
 * Click resolution entry point. Implementation lives in cohesive modules:
 * - click-events.ts: map-click wiring + hub event handlers / broadcasts
 * - click-open.ts: open-by-uniqueid + display attribute resolution
 * - click-layers.ts: click target layers and hit / query feature resolution
 */
export {
  attachMapClick,
  ensureMapClickAttached,
  handleXyPageClosed,
  handleMasterFilterChanged,
  handleWidgetSelectionChanged,
  handleSharedMapClick,
  detachMapClick,
  notifyGraffPolygonSelection,
  broadcastPopupVisibility,
} from "./click-events";
export {
  openPopupForUniqueid,
  findAttributeValueCaseInsensitive,
  fetchLatestVegetationIndices,
  resolveDisplayAttrs,
} from "./click-open";
export {
  toClickQueryGeometry,
  findHitGraphic,
  pickClickGraphic,
  isHighlightLayer,
  isLayerEffectivelyVisible,
  isAgriculturalFieldLayer,
  isAgriculturalFieldGraphic,
  getClickTargetLayers,
  resolveClickLayers,
  resolveClickFeatureAt,
} from "./click-layers";
