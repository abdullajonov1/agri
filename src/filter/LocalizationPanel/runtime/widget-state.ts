import { JimuMapView } from "jimu-arcgis";
import { QueriableDataSource } from "jimu-core";
import { type VegetationRecentDayGroup } from "../../../gis/agri-vegetation-data-source";
import { type CropRendererMode } from "../../localization/crop-renderer";

interface RecordData {
  viloyat?: string;
  tuman?: string;
  yil?: string | number;
  tur?: string;
  vh?: string;
  [key: string]: any;
}

export interface FilterState {
  yil: string;
  viloyat: string;
  tuman: string;
  turi: string;
  turlar: string[];
  vh: string;
  /** Selected NDVI date (YYYY-MM-DD or similar) */
  ndviDate?: string;
  /** UI/data language for all linked widgets */
  language: "uz_cyr" | "uz_lat" | "ru" | "en";
}

export interface GeoWidgetState extends FilterState {
  records: RecordData[];
  totalRecordCount: number;
  loading: boolean;
  error: string | null;
  activeMapView?: JimuMapView;
  userName: string | null;
  userGroupIds: string[];
  lockedViloyat: string | null;
  allowedViloyats: string[];

  yilOptions: string[];
  /** Distinct NDVI dates available for current filter (if table date field is known) */
  ndviDateOptions?: string[];
  /** True when ndviDate was explicitly chosen by the user (e.g. from Graff) */
  ndviDateLocked?: boolean;

  /** True when a specific polygon graph is active (selected in Graff) */
  polygonMode?: boolean;
  /** Selected polygon id from AgriGraff row; used to keep only one polygon visible. */
  selectedGraffUniqueid?: string;
  /**
   * Exact STIR (`f_inn`) from header search — scopes pie / VH / map to that
   * farmer's parcels (not a single uniqueid).
   */
  selectedFarmerInn?: string;
  /**
   * Timestamp of the click/selection that produced selectedGraffUniqueid
   * (from the originating widget, e.g. AgriPopup's pre-await click time) —
   * forwarded so AgriGraff10 can drop a stale, late-arriving notification
   * that resolves after a newer polygon selection was already applied.
   */
  selectedGraffUniqueidClickedAt?: number;

  featureLayer?: __esri.FeatureLayer;
  /** All resolved feature layers (up to numberOfDataSources) */
  featureLayers: __esri.FeatureLayer[];
  /** Spatial polygon layer(s) rendered on the map — Agri_table_data has no geometry, so the
   *  master filter's visual map sync targets these (joined by uniqueid) instead of featureLayers. */
  spatialMapLayers: __esri.FeatureLayer[];
  loadingFilters: boolean;
  isDarkTheme: boolean;
  dataSource?: QueriableDataSource;

  mapConnectionAttempts: number;
  connectionStatus: "idle" | "connecting" | "connected" | "failed";
  initialPreselectionProcessed: boolean;
  openToolbarMenu: "yil" | "language" | "indexInfo" | "notifications" | null;
  /** Index (NDVI/SAVI/…) currently expanded to its full detail page within the indexInfo menu. */
  selectedIndexInfoKey: string | null;
  notificationDays: VegetationRecentDayGroup[];
  notificationLoading: boolean;
  notificationError: string | null;
  notificationCanScrollDown: boolean;
  cropRendererMode: CropRendererMode;
  graffSearchText: string;
  graffSearchSuggestions: GraffSearchRecord[];
  graffSearchShowSuggestions: boolean;
  graffSearchLoading: boolean;
  showProfileMenu: boolean;
}

export type GraffSearchRecord = Record<string, string | number | undefined> & {
  uniqueid?: string;
  objectid?: number;
  f_name?: string;
  f_inn?: string;
};
