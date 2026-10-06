import { resolveStoredAgriLanguage } from "../../../../localization/lang";
import type { GeoWidgetState } from "../../widget-state";

export function createInitialGeoState(): GeoWidgetState {
  return {
    records: [],
    totalRecordCount: 0,
    loading: false,
    error: null,
    allowedViloyats: [],

    yil: "",
    viloyat: "",
    tuman: "",
    turi: "",
    turlar: [],
    vh: "",
    ndviDate: "",
    language: resolveStoredAgriLanguage(),

    userName: null,
    userGroupIds: [],
    lockedViloyat: null,

    yilOptions: [],
    ndviDateOptions: [],
    ndviDateLocked: false,
    loadingFilters: false,
    isDarkTheme: false,
    featureLayers: [],
    spatialMapLayers: [],

    mapConnectionAttempts: 0,
    connectionStatus: "idle",
    initialPreselectionProcessed: false,
    polygonMode: false,
    selectedGraffUniqueid: "",
    selectedFarmerInn: "",
    openToolbarMenu: null,
    selectedIndexInfoKey: null,
    notificationDays: [],
    notificationLoading: false,
    notificationError: null,
    notificationCanScrollDown: false,
    cropRendererMode: "on",
    graffSearchText: "",
    graffSearchSuggestions: [],
    graffSearchShowSuggestions: false,
    graffSearchLoading: false,
    showProfileMenu: false,
  };
}
