/** @jsx jsx */
import {
  DataSourceComponent,
  DataSourceManager,
  jsx,
  React,
  type DataSource,
  type UseDataSource,
} from "jimu-core";
import { type JimuMapView } from "jimu-arcgis";
import plusLight from "./assets/PlusLight.svg";
import minusLight from "./assets/MinusLight.svg";
import expandLight from "./assets/ExpandLight.svg";
import compressLight from "./assets/CompressLight.svg";
import basemapIcon from "./assets/basemap.svg";
import { readAgriAdminBordersVisible } from "../gis/agri-admin-boundary-layer";
import { isUseDataSourceLike } from "../shared/agri-type-guards";
import FieldComparePanel from "./field-compare-panel";
import MapLandLayersPanel from "./map-land-layers-panel";
import { dispatchMapSettingsRequest } from "./embedded-agri-map-setup";
import {
  type MapLanguage,
  useAgriMapInit,
  useAutomaticBasemap,
  useBasemapMenuOpenClass,
  useFullscreenSync,
  useLatestCallbackRefs,
  useMapControlHandlers,
  useMapLanguage,
  useRootDataSourceRetry,
  useThemeAndRegionListeners,
} from "./embedded-agri-map-hooks";

interface Props {
  mapWidgetId: string;
  webMapDataSourceId?: string;
  webMapUseDataSource?: UseDataSource | null;
  featureUseDataSources?: UseDataSource[];
  onViewReady?: (jimuMapView: JimuMapView) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
}

function resolveInitialDarkTheme(): boolean {
  try {
    const saved = String(localStorage.getItem("agri_v11_app_theme") || "").toLowerCase();
    if (saved === "dark" || saved === "light") return saved === "dark";
    const attr = String(document.documentElement.getAttribute("data-theme") || "").toLowerCase();
    if (attr === "dark" || attr === "light") return attr === "dark";
  } catch {
    // Default dashboard theme is dark.
  }
  return true;
}

const BASEMAP_TEXT: Record<MapLanguage, {
  controls: string;
  zoomIn: string;
  zoomOut: string;
  enterFullscreen: string;
  exitFullscreen: string;
  choose: string;
  title: string;
  borders: string;
  items: Array<[string, string]>;
}> = {
  uz_lat: {
    controls: "Xarita boshqaruvlari",
    zoomIn: "Yaqinlashtirish",
    zoomOut: "Uzoqlashtirish",
    enterFullscreen: "To'liq ekranga o'tish",
    exitFullscreen: "To'liq ekrandan chiqish",
    choose: "Xarita turini tanlash",
    title: "Asosiy xaritalar",
    borders: "Chegaralar",
    items: [["Qorong'u", "dark-gray-vector"], ["Kulrang", "gray-vector"], ["Sun'iy yo'ldosh", "satellite"], ["Gibrid", "hybrid"], ["Topografik", "topo-vector"]],
  },
  uz_cyr: {
    controls: "Харита бошқарувлари",
    zoomIn: "Яқинлаштириш",
    zoomOut: "Узоқлаштириш",
    enterFullscreen: "Тўлиқ экранга ўтиш",
    exitFullscreen: "Тўлиқ экрандан чиқиш",
    choose: "Харита турини танлаш",
    title: "Асосий хариталар",
    borders: "Чегаралар",
    items: [["Қоронғу", "dark-gray-vector"], ["Кулранг", "gray-vector"], ["Сунъий йўлдош", "satellite"], ["Гибрид", "hybrid"], ["Топографик", "topo-vector"]],
  },
  en: {
    controls: "Map controls",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    enterFullscreen: "Enter fullscreen",
    exitFullscreen: "Exit fullscreen",
    choose: "Choose basemap",
    title: "Basemaps",
    borders: "Borders",
    items: [["Dark", "dark-gray-vector"], ["Gray", "gray-vector"], ["Satellite", "satellite"], ["Hybrid", "hybrid"], ["Topographic", "topo-vector"]],
  },
  ru: {
    controls: "Управление картой",
    zoomIn: "Приблизить",
    zoomOut: "Отдалить",
    enterFullscreen: "На весь экран",
    exitFullscreen: "Выйти из полноэкранного режима",
    choose: "Выбрать тип карты",
    title: "Базовые карты",
    borders: "Границы",
    items: [["Тёмная", "dark-gray-vector"], ["Серая", "gray-vector"], ["Спутник", "satellite"], ["Гибрид", "hybrid"], ["Топографическая", "topo-vector"]],
  },
};

export default function EmbeddedAgriMap(props: Props) {
  const {
    mapWidgetId,
    webMapDataSourceId,
    webMapUseDataSource,
    onViewReady,
    onLoadingChange,
    onError,
  } = props;
  const [basemapMenuOpen, setBasemapMenuOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [readyView, setReadyView] = React.useState<__esri.MapView | null>(null);
  const [isDarkTheme, setIsDarkTheme] = React.useState(resolveInitialDarkTheme);
  const [hasSelectedRegion, setHasSelectedRegion] = React.useState(false);
  const [activeBasemapId, setActiveBasemapId] = React.useState<string>(() =>
    resolveInitialDarkTheme() ? "dark-gray-vector" : "gray-vector",
  );
  const [bordersVisible, setBordersVisible] = React.useState<boolean>(() =>
    readAgriAdminBordersVisible(),
  );
  const language = useMapLanguage();
  const basemapText = BASEMAP_TEXT[language];
  const fullscreenText = isFullscreen
    ? basemapText.exitFullscreen
    : basemapText.enterFullscreen;

  useBasemapMenuOpenClass(basemapMenuOpen);
  // Only the WebMap the settings connect is opened (render-panel resolves it:
  // the WebMap picked in "Select data", or the WebMap of the picked layers).
  const effectiveRootDataSourceId = String(webMapDataSourceId || "").trim();
  const effectiveRootUseDataSource = webMapUseDataSource ||
    (effectiveRootDataSourceId
      ? {
          dataSourceId: effectiveRootDataSourceId,
          mainDataSourceId: effectiveRootDataSourceId,
          rootDataSourceId: effectiveRootDataSourceId,
        }
      : null);
  const [rootDataSource, setRootDataSource] = React.useState<DataSource | null>(
    () => effectiveRootDataSourceId
      ? DataSourceManager.getInstance().getDataSource(effectiveRootDataSourceId) || null
      : null,
  );
  const { onViewReadyRef, onLoadingChangeRef, onErrorRef } = useLatestCallbackRefs(
    onViewReady,
    onLoadingChange,
    onError,
  );
  const retryRootDataSource = useRootDataSourceRetry(
    effectiveRootDataSourceId,
    setRootDataSource,
    { onLoadingChangeRef, onErrorRef },
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<__esri.MapView | null>(null);
  const mapRef = React.useRef<__esri.Map | null>(null);
  const jimuMapViewRef = React.useRef<JimuMapView | null>(null);
  const automaticBasemapId = hasSelectedRegion
    ? "satellite"
    : isDarkTheme
      ? "dark-gray-vector"
      : "gray-vector";
  const automaticBasemapRef = React.useRef(automaticBasemapId);
  automaticBasemapRef.current = automaticBasemapId;

  useThemeAndRegionListeners(setIsDarkTheme, setHasSelectedRegion);
  useAutomaticBasemap(automaticBasemapId, viewRef, mapRef, setActiveBasemapId, setBasemapMenuOpen);
  useFullscreenSync(containerRef, viewRef, setIsFullscreen);
  const { zoomBy, toggleFullscreen, selectBasemap, toggleBordersVisible } = useMapControlHandlers(
    containerRef,
    viewRef,
    bordersVisible,
    setBordersVisible,
    setActiveBasemapId,
    setBasemapMenuOpen,
  );
  useAgriMapInit({
    mapWidgetId,
    dataSourceId: effectiveRootDataSourceId,
    rootDataSource,
    containerRef,
    viewRef,
    mapRef,
    jimuMapViewRef,
    automaticBasemapRef,
    onViewReadyRef,
    onLoadingChangeRef,
    onErrorRef,
    setActiveBasemapId,
    setReadyView,
  });

  return (
    <React.Fragment>
      <div
        ref={containerRef}
        className="agri-dashboard-embedded-map"
        onPointerDownCapture={() => { dispatchMapSettingsRequest(mapWidgetId); }}
      />
      <div className="agri-dashboard-map-controls" aria-label={basemapText.controls}>
        <button
          type="button"
          className="agri-dashboard-map-zoom-button"
          aria-label={basemapText.zoomIn}
          title={basemapText.zoomIn}
          onPointerDown={(event) => { event.stopPropagation(); }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            zoomBy(1);
          }}
        >
          <img
            src={plusLight}
            alt=""
            className="agri-dashboard-map-control-icon"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="agri-dashboard-map-zoom-button"
          aria-label={basemapText.zoomOut}
          title={basemapText.zoomOut}
          onPointerDown={(event) => { event.stopPropagation(); }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            zoomBy(-1);
          }}
        >
          <img
            src={minusLight}
            alt=""
            className="agri-dashboard-map-control-icon"
            aria-hidden="true"
          />
        </button>
      </div>
      <button
        type="button"
        className={`agri-dashboard-map-zoom-button agri-dashboard-fullscreen-button${isFullscreen ? " is-active" : ""}`}
        aria-label={fullscreenText}
        aria-pressed={isFullscreen}
        title={fullscreenText}
        onPointerDown={(event) => { event.stopPropagation(); }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggleFullscreen();
        }}
      >
        <img
          src={isFullscreen ? compressLight : expandLight}
          alt=""
          className="agri-dashboard-map-control-icon"
          aria-hidden="true"
        />
      </button>
      <div className="agri-dashboard-basemap-control">
          <button
            type="button"
            className={`agri-dashboard-map-zoom-button agri-dashboard-basemap-button${basemapMenuOpen ? " is-active" : ""}`}
            aria-label={basemapText.choose}
            aria-expanded={basemapMenuOpen}
            title={basemapText.choose}
            onPointerDown={(event) => { event.stopPropagation(); }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setBasemapMenuOpen((open) => !open);
            }}
          >
            <img
              src={basemapIcon}
              alt=""
              className="agri-dashboard-map-control-icon"
              aria-hidden="true"
            />
          </button>
          {basemapMenuOpen && (
            <div
              className="agri-dashboard-basemap-menu"
              role="menu"
              onPointerDown={(event) => { event.stopPropagation(); }}
            >
              <div className="agri-dashboard-basemap-menu-title">{basemapText.title}</div>
              {basemapText.items.map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={activeBasemapId === id}
                  className={`agri-dashboard-basemap-option${activeBasemapId === id ? " is-active" : ""}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    selectBasemap(id);
                  }}
                >
                  {label}
                </button>
              ))}
              <div className="agri-dashboard-basemap-borders-row">
                <span className="agri-dashboard-basemap-borders-label">
                  {basemapText.borders}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={bordersVisible}
                  aria-label={basemapText.borders}
                  className={`agri-dashboard-basemap-borders-toggle${bordersVisible ? " is-on" : ""}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleBordersVisible();
                  }}
                >
                  <span className="agri-dashboard-basemap-borders-thumb" />
                </button>
              </div>
            </div>
          )}
        </div>
      <FieldComparePanel
        language={language}
        onOpenChange={(open) => {
          if (open) setBasemapMenuOpen(false);
        }}
      />
      <MapLandLayersPanel
        language={language}
        view={readyView}
        onOpenChange={(open) => {
          if (open) setBasemapMenuOpen(false);
        }}
      />
      {isUseDataSourceLike(effectiveRootUseDataSource) && (
        <div style={{ display: "none" }} aria-hidden="true">
          <DataSourceComponent
            // Plain (mutable) use-data-source object, exactly as before.
            useDataSource={effectiveRootUseDataSource}
            widgetId={mapWidgetId}
            onDataSourceCreated={(dataSource: DataSource) => { setRootDataSource(dataSource); }}
            // Without this the map waits for the data source forever and the
            // loader never clears (WebMap deleted, no access, portal down).
            onCreateDataSourceFailed={() => { void retryRootDataSource(); }}
          />
        </div>
      )}
    </React.Fragment>
  );
}
