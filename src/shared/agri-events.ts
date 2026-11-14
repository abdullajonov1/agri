/** Wire names of the widget's document/window CustomEvents (shared with other widgets and ExB; do not change values). */
export const AGRI_EVENTS = {
  widgetSelectionChanged: "widgetSelectionChanged",
  masterFilterChanged: "masterFilterChanged",
  languageChanged: "languageChanged",
  graffDateIndexSelectionChanged: "graffDateIndexSelectionChanged",
  agriMapSurfaceLoading: "agriMapSurfaceLoading",
  agriFieldCompareToggled: "agriFieldCompareToggled",
  resetAllFilters: "resetAllFilters",
  agriLandLayersToggled: "agriLandLayersToggled",
  graffDateIndexNavigate: "graffDateIndexNavigate",
  agriMapPopupVisibility: "agriMapPopupVisibility",
  agriMapNoData: "agriMapNoData",
  agriIndicatorsDrawerToggled: "agriIndicatorsDrawerToggled",
  requestMasterFilterState: "requestMasterFilterState",
  categoryFilterChanged: "categoryFilterChanged",
  agriPolygonMapClickPhase: "agriPolygonMapClickPhase",
  themeChanged: "themeChanged",
  resetAllWidgets: "resetAllWidgets",
  agriVegetationOverlayApplied: "agriVegetationOverlayApplied",
} as const;

export type AgriEventName = (typeof AGRI_EVENTS)[keyof typeof AGRI_EVENTS];
