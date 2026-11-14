import { AGRI_EVENTS } from "./agri-events";

describe("AGRI_EVENTS", () => {
  it("pins the wire names", () => {
    expect(AGRI_EVENTS).toEqual({
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
    });
  });
});
