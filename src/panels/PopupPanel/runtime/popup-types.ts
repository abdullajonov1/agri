/**
 * Shared PopupPanel types: widget config/state plus the structural shapes of
 * the untyped ArcGIS / jimu objects the popup handlers read defensively.
 */
import type { JimuMapView } from "jimu-arcgis";
import type { QueriableDataSource } from "jimu-core";
import type { AgriLayerLike } from "../../../gis/agri-layer-types";
import type { LangCode } from "./messages";

export type { AgriLayerLike };

/** AgriLayerLike plus the FeatureLayer members the click path probes. */
export interface PopupLayerLike extends AgriLayerLike {
  geometryType?: string | null;
}

export type Config = {
  fieldsToShow?: string[];
  titleField?: string;
  labels?: Record<string, string>;
  settings?: {
    zoomToSelection?: boolean; // default true
    showMapPopup?: boolean; // default false
    showAttachments?: boolean; // default true (when undefined)
  };
  chartEnabled?: boolean;
  chartType?: "bar" | "line";
  chartTitle?: string;
  chartFields?: string[];
  chartColor?: string;
};

export type AttachmentItem = {
  id: number;
  name?: string;
  size?: number;
  contentType?: string;
  url?: string; // direct download URL
  previewObjectUrl?: string; // created via URL.createObjectURL for <img> previews
};

/** Attribute bag of a selected polygon / joined Agri table row. */
export type PopupAttributes = Record<string, unknown>;

export interface PopupDebugInfo {
  layerInfo?: unknown;
  hitTestResults?: unknown;
  queryResults?: unknown;
  fieldMapping?: unknown;
  availableLayers?: unknown;
}

export interface State {
  currentLang: LangCode;
  isDarkTheme: boolean;

  jimuMapView?: JimuMapView | null;

  /** ✅ MULTI: all resolved layers from settings */
  featureLayers: __esri.FeatureLayer[];
  /** ✅ MULTI: map clicked layer => dsId (best-effort) */
  layerKeyToDsId: Record<string, string>;

  /** ✅ MULTI: store DS schemas per DS id */
  dataSourcesById: Record<string, QueriableDataSource>;

  /** which layer was last clicked (for aliases/field resolving) */
  lastClickedDsId: string | null;
  lastClickedLayerKey: string | null;

  pinToCorner: boolean;

  // attachments UI
  loadingAttachments: boolean;
  attachments: AttachmentItem[];
  attachmentsError: string | null;
  attachmentsExpanded: boolean;

  loading: boolean;
  error: string | null;

  selectedAttrs: PopupAttributes | null;
  selectedOID: number | null;
  objectIdField: string | null;

  showPopup: boolean;
  /** X collapses the panel; selection + data stay until real deselect. */
  popupMinimized: boolean;
  popupPosition: { x: number; y: number } | null;
  clickScreenPoint: { x: number; y: number } | null;

  debugInfo: PopupDebugInfo;

  chartExpanded: boolean;
  chartHoverIndex: number | null;

  // Latest-day vegetation index values (NDVI/SAVI/RVI/CI/EVI/NDWI) for the
  // currently selected polygon, from agri_vegetation_indices.
  loadingLatestIndices: boolean;
  latestIndexDate: string | null;
  latestIndexValues: Record<string, number> | null;
}

export interface IHandleLike {
  remove: () => void;
}

/** A `useDataSources` entry (jimu UseDataSource or an expanded child entry). */
export interface PopupUseDataSource {
  dataSourceId?: string;
  mainDataSourceId?: string;
}

/** Field metadata from a layer or a jimu data-source schema. */
export interface PopupFieldMeta {
  name?: string | null;
  jimuName?: string | null;
  alias?: string | null;
  displayName?: string | null;
  label?: string | null;
  type?: string | null;
}

/** The parts of a jimu data source the popup probes for layers / schema. */
export interface PopupDataSourceLike {
  id?: string;
  url?: string | null;
  layer?: AgriLayerLike | null;
  getLayer?(): AgriLayerLike | null | undefined;
  getJimuLayer?(): AgriLayerLike | null | undefined;
  getChildDataSources?(): Array<{ id?: string } | null | undefined> | null;
  fetchSchema?(): Promise<unknown>;
  getSchema?(): { fields?: Record<string, PopupFieldMeta | null | undefined> | null } | null | undefined;
}

/** Jimu layer view entry as returned by JimuMapView#getAllJimuLayerViews. */
export interface PopupJimuLayerViewLike {
  layer?: AgriLayerLike | null;
  layerDataSourceId?: string | null;
  dataSourceId?: string | null;
}

/** Map-click/selection event detail broadcast on `widgetSelectionChanged`. */
export interface PopupSelectionDetail {
  source?: string;
  yil?: unknown;
  viloyat?: unknown;
  tuman?: unknown;
  polygonMode?: boolean;
  uniqueid?: unknown;
}

/** `masterFilterChanged` event detail (only the fields the popup reads). */
export interface PopupMasterFilterDetail {
  filters?: {
    yil?: unknown;
    viloyat?: unknown;
    tuman?: unknown;
    polygonMode?: boolean;
    uniqueid?: unknown;
  } | null;
}

/** `themeChanged` event detail. */
export interface PopupThemeDetail {
  isDarkTheme?: unknown;
  theme?: unknown;
}

/** `languageChanged` event detail. */
export interface PopupLanguageDetail {
  lang?: unknown;
  language?: unknown;
  code?: unknown;
}

/** A view-click handler target, typed loosely (MapView or SceneView). */
export type PopupView = __esri.MapView | __esri.SceneView;
