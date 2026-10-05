import type { JimuMapView } from "jimu-arcgis";
import type { QueriableDataSource } from "jimu-core";
import type { RegionalTimeseriesRow } from "./graff-timeseries-helpers";
import type { AgriLanguage } from "../../../shared/agri-language";
import type { VegetationIndiceType } from "../../../gis/agri-polygon-api-source";

export interface ConfiguredFilters {
    [fieldName: string]: string;
}
export interface RecordData {
    uniqueid?: string;
    tuman?: string;
    f_name?: string;
    f_inn?: string;
    maydon?: string | number;
    turi?: string;
    vh?: string;
    status?: string;
    objectid?: number;
    [key: string]: any;
}
export interface VegetationIndex {
    uniqueid: string;
    raster_date: string;
    objectid: number;
    ndvi: number;
    ndvi_min: number;
    ndvi_max: number;
    savi: number;
    savi_min: number;
    savi_max: number;
    rvi: number;
    rvi_min: number;
    rvi_max: number;
    ci: number;
    ci_min: number;
    ci_max: number;
    evi: number;
    ndwi: number;
    ndwi_min: number;
    ndwi_max: number;
    pixel_count: number;
    mean_red: number;
    mean_nir: number;
    mean_green: number;
    id: number;
    raster_id: number;
    processed_at: string;
}
/** Chart accepts polygon data (raster_date) or regional data normalized to same shape */
export type ChartVegetationRow = VegetationIndex | (RegionalTimeseriesRow & {
    raster_date: string;
});
export interface AgriGraffWidgetState {
    records: RecordData[];
    loading: boolean;
    error: string | null;
    activeMapView?: JimuMapView;
    // View mode: 'table' or 'graph'
    viewMode: "table" | "graph";
    // 🔎 search UI state
    searchText?: string;
    searchLoading?: boolean;
    searchError?: string | null;
    searchResultCount?: number | null;
    isSearchActive?: boolean; // Track if search suggestion was selected (applies WHERE filter)
    /** Exact STIR from header search (master filter) — scopes Jadval to that farmer. */
    farmerInn?: string;
    // Only configured fields from settings
    configuredFields: string[];
    externalFilters: ConfiguredFilters;
    localFilters: ConfiguredFilters;
    // ✅ Regional filters - include VH + category (uzspace bucket)
    regionalFilters: {
        viloyat: string;
        tuman: string;
        yil: string;
        uzspace: string; // category (turi)
        turlar?: string[];
        vh: string; // selected vh
    };
    /** Numeric region code resolved from AgriFilter WHERE clause (e.g. 1733 for Xorazm viloyati). */
    regionalRegionCode: number | null;
    /** Numeric district code resolved from AgriFilter WHERE clause when available. */
    regionalDistrictCode: number | null;
    /** When set: filter polygons by these uniqueids (from NDVI table ndvi_status), not by polygon layer vh attribute */
    vhUniqueids: string[] | null;
    filterOptions: {
        [key: string]: string[];
    };
    featureLayer?: __esri.FeatureLayer;
    featureLayers: __esri.FeatureLayer[];
    /** Spatial polygon layer(s) used only for map-click hitTest/highlight — Agri_table_data has no geometry. */
    spatialClickLayers: __esri.FeatureLayer[];
    loadingFilters: boolean;
    isDarkTheme: boolean;
    dataSource?: QueriableDataSource;
    mapConnectionAttempts: number;
    connectionStatus: "idle" | "connecting" | "connected" | "failed";
    initialDataLoaded: boolean;
    selecteduniqueid?: string;
    // Pagination (Agrobank ContoursTable style — 1-based page)
    currentPage: number;
    totalRecordCount: number;
    loadingMore: boolean;
    /** Server-side table sort (Maydon), Agrobank ContoursTable cycle. */
    tableSort: {
        column: "maydon";
        order: "asc" | "desc";
    } | null;
    lastUpdateTimestamp: number;
    isProcessingExternalUpdate: boolean;
    // Graph view states (chart can show polygon data or regional timeseries when no polygon selected)
    vegetationData: ChartVegetationRow[];
    loadingVegetation: boolean;
    vegetationError: string | null;
    /** Remount SVG series to replay draw animation after data morph (Agrobank-style). */
    chartAnimKey: number;
    selectedIndices: VegetationIndiceType[];
    chartTooltip: {
        indexKey: "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi";
        point: {
            date: Date;
            value: number;
            min?: number;
            max?: number;
            /** Must match xScale(date, sourceIndex) so crosshair aligns with rendered dots */
            sourceIndex?: number;
        };
    } | null;
    selectedNdviDate?: string | null;
    selectedChartIndexKey?: VegetationIndiceType | null;
    /** Dates available for the selected polygon, from api-agri's /available-dates. */
    polygonAvailableDates: string[];
    /** True while fetching/decoding the export-image raster for the selected polygon+date. */
    polygonImageLoading: boolean;
    polygonImageError: string | null;
    selectedMonth: number | null;
    isMonthPickerOpen: boolean;
    monthPickerPlacement: "up" | "down";
    dateRangeStartIndex: number | null;
    dateRangeEndIndex: number | null;
    graphViewportWidth: number;
    graphViewportHeight: number;
    language: AgriLanguage;
}
