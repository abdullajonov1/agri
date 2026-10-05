import { resolveInitialLanguage } from "../../../../shared/agri-language";
import type { AgriGraffWidgetState } from "../widget";

export function createInitialGraffState(initialIsDarkTheme: boolean): AgriGraffWidgetState {
  return {
    records: [],
    loading: false,
    error: null,

    // Default to graph: regional/polygon vegetation chart on first load.
    // Table remains available via the view-mode toggle.
    viewMode: "graph",

    searchText: "",
    searchLoading: false,
    searchError: null,
    searchResultCount: null,
    isSearchActive: false,
    farmerInn: "",

    configuredFields: [],
    externalFilters: {},
    localFilters: {},

    // ✅ include vh here
    // Default to graph; when no polygon is selected the graph uses
    // regional/republic timeseries API data.
    regionalFilters: {
      viloyat: "",
      tuman: "",
      yil: "",
      uzspace: "",
      vh: "",
    },

    regionalRegionCode: null,
    regionalDistrictCode: null,

    vhUniqueids: null,

    filterOptions: {},

    featureLayers: [],
    spatialClickLayers: [],

    loadingFilters: false,
    isDarkTheme: initialIsDarkTheme,

    mapConnectionAttempts: 0,
    connectionStatus: "idle",

    initialDataLoaded: false,

    currentPage: 1,
    totalRecordCount: 0,
    loadingMore: false,
    tableSort: null,

    lastUpdateTimestamp: 0,
    isProcessingExternalUpdate: false,

    vegetationData: [],
    loadingVegetation: false,
    vegetationError: null,
    chartAnimKey: 0,
    selectedIndices: ["ndvi"],
    chartTooltip: null,
    selectedNdviDate: null,
    selectedChartIndexKey: null,

    polygonAvailableDates: [],
    polygonImageLoading: false,
    polygonImageError: null,

    selectedMonth: null,
    isMonthPickerOpen: false,
    monthPickerPlacement: "down",
    dateRangeStartIndex: null,
    dateRangeEndIndex: null,
    graphViewportWidth: 860,
    graphViewportHeight: 360,
    language: resolveInitialLanguage(),
  };
}
