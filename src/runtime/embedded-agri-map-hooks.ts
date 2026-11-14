/* eslint-disable react-hooks/exhaustive-deps -- dependency arrays are intentionally identical to the original component (setters/refs are stable; see R20). */
import { AGRI_EVENTS } from "../shared/agri-events";
import { React, type DataSource } from "jimu-core";
import { type JimuMapView } from "jimu-arcgis";
import { setAgriAdminBordersVisible } from "../gis/agri-admin-boundary-layer";
import { installAgriCorsGuard, recreateDataSource } from "../shared/agri-cors-guard";
import {
  type AgriMapInitContext,
  disposeAgriMap,
  initializeAgriMap,
  readSelectedRegionEvent,
  readThemeEvent,
  syncFullscreenState,
  toggleFullscreen as toggleMapFullscreen,
  zoomViewBy,
} from "./embedded-agri-map-setup";
import { agroV5Log } from "../shared/agri-debug-log";

export type MapLanguage = "uz_lat" | "uz_cyr" | "ru" | "en";

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
type MutableRef<T> = React.MutableRefObject<T>;

export function normalizeMapLanguage(raw: unknown): MapLanguage {
  const value = String(raw || "").trim().toLowerCase().replace(/-/g, "_");
  if (value === "en" || value === "english") return "en";
  if (value === "ru" || value === "russian") return "ru";
  if (value.startsWith("uz_cyr")) return "uz_cyr";
  if (value === "uz" || value.startsWith("uz_lat")) return "uz_lat";
  return "uz_lat";
}

function readInitialLanguage(): MapLanguage {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const fromStorage = localStorage.getItem("app_lang") || localStorage.getItem("agri_app_lang");
    return normalizeMapLanguage(fromUrl || fromStorage);
  } catch {
    return "uz_lat";
  }
}

/** Current map language: URL/storage on mount, then `languageChanged` events. */
export function useMapLanguage(): MapLanguage {
  const [language, setLanguage] = React.useState<MapLanguage>(readInitialLanguage);

  React.useEffect(() => {
    const handleLanguageChange = (event: Event): void => {
      const detail = (event as CustomEvent)?.detail || {};
      setLanguage(normalizeMapLanguage(detail.lang || detail.language || detail.code));
    };
    document.addEventListener(AGRI_EVENTS.languageChanged, handleLanguageChange);
    return () => { document.removeEventListener(AGRI_EVENTS.languageChanged, handleLanguageChange); };
  }, []);

  return language;
}

/** Marks the document while the basemap menu is open. */
export function useBasemapMenuOpenClass(basemapMenuOpen: boolean): void {
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("agri-basemap-menu-open", basemapMenuOpen);
    return () => { root.classList.remove("agri-basemap-menu-open"); };
  }, [basemapMenuOpen]);
}

export interface LatestCallbackRefs {
  onViewReadyRef: MutableRef<((jimuMapView: JimuMapView) => void) | undefined>;
  onLoadingChangeRef: MutableRef<((loading: boolean) => void) | undefined>;
  onErrorRef: MutableRef<((message: string) => void) | undefined>;
}

/** Keeps refs pointing at the latest parent callbacks (parents pass inline lambdas). */
export function useLatestCallbackRefs(
  onViewReady: ((jimuMapView: JimuMapView) => void) | undefined,
  onLoadingChange: ((loading: boolean) => void) | undefined,
  onError: ((message: string) => void) | undefined,
): LatestCallbackRefs {
  const onViewReadyRef = React.useRef(onViewReady);
  const onLoadingChangeRef = React.useRef(onLoadingChange);
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    onViewReadyRef.current = onViewReady;
    onLoadingChangeRef.current = onLoadingChange;
    onErrorRef.current = onError;
  }, [onViewReady, onLoadingChange, onError]);
  return { onViewReadyRef, onLoadingChangeRef, onErrorRef };
}

/**
 * One retry per WebMap: a failure caused by the JS API's host-wide proxy
 * fallback (see agri-cors-guard) succeeds once the guard removed the rule.
 */
export function useRootDataSourceRetry(
  dataSourceId: string,
  setRootDataSource: StateSetter<DataSource | null>,
  refs: Pick<LatestCallbackRefs, "onLoadingChangeRef" | "onErrorRef">,
): () => Promise<void> {
  const retriedRootIdRef = React.useRef("");
  return async (): Promise<void> => {
    const id = dataSourceId;
    if (id && retriedRootIdRef.current !== id) {
      retriedRootIdRef.current = id;
      await installAgriCorsGuard();
      try {
        setRootDataSource(await recreateDataSource(id));
        return;
      } catch (e: unknown) {
        agroV5Log("embeddedMap:recreate-failed", { id, error: e instanceof Error ? e.message : String(e) });
        /* still failing — report below */
      }
    }
    refs.onLoadingChangeRef.current?.(false);
    refs.onErrorRef.current?.("Web Map ma’lumot manbasini yaratib bo‘lmadi");
  };
}

/** Listens for theme toggles and master-filter (selected region) changes. */
export function useThemeAndRegionListeners(
  setIsDarkTheme: StateSetter<boolean>,
  setHasSelectedRegion: StateSetter<boolean>,
): void {
  React.useEffect(() => {
    const handleTheme = (event: Event): void => {
      setIsDarkTheme(readThemeEvent(event));
    };
    const handleFilter = (event: Event): void => {
      setHasSelectedRegion(readSelectedRegionEvent(event));
    };
    document.addEventListener("agriV11ThemeToggled", handleTheme);
    document.addEventListener(AGRI_EVENTS.masterFilterChanged, handleFilter);
    return () => {
      document.removeEventListener("agriV11ThemeToggled", handleTheme);
      document.removeEventListener(AGRI_EVENTS.masterFilterChanged, handleFilter);
    };
  }, []);
}

/** Applies the automatic (theme/region driven) basemap to the live map. */
export function useAutomaticBasemap(
  automaticBasemapId: string,
  viewRef: MutableRef<__esri.MapView | null>,
  mapRef: MutableRef<__esri.Map | null>,
  setActiveBasemapId: StateSetter<string>,
  setBasemapMenuOpen: StateSetter<boolean>,
): void {
  React.useEffect(() => {
    const map = viewRef.current?.map || mapRef.current;
    if (!map || viewRef.current?.destroyed) return;
    if (String(map.basemap?.id || map.basemap || "") !== automaticBasemapId) {
      map.basemap = automaticBasemapId;
    }
    setActiveBasemapId(automaticBasemapId);
    setBasemapMenuOpen(false);
  }, [automaticBasemapId]);
}

/** Mirrors the browser fullscreen state of the map container into React state. */
export function useFullscreenSync(
  containerRef: React.RefObject<HTMLDivElement>,
  viewRef: MutableRef<__esri.MapView | null>,
  setIsFullscreen: StateSetter<boolean>,
): void {
  React.useEffect(() => {
    const syncState = (): void => {
      syncFullscreenState(containerRef.current, viewRef, setIsFullscreen);
    };

    document.addEventListener("fullscreenchange", syncState);
    document.addEventListener("webkitfullscreenchange", syncState as EventListener);
    syncState();

    return () => {
      document.removeEventListener("fullscreenchange", syncState);
      document.removeEventListener("webkitfullscreenchange", syncState as EventListener);
    };
  }, []);
}

export interface MapControlHandlers {
  zoomBy: (delta: number) => void;
  toggleFullscreen: () => Promise<void>;
  selectBasemap: (basemapId: string) => void;
  toggleBordersVisible: () => void;
}

/** Zoom, fullscreen, basemap-select and borders-toggle handlers. */
export function useMapControlHandlers(
  containerRef: React.RefObject<HTMLDivElement>,
  viewRef: MutableRef<__esri.MapView | null>,
  bordersVisible: boolean,
  setBordersVisible: StateSetter<boolean>,
  setActiveBasemapId: StateSetter<string>,
  setBasemapMenuOpen: StateSetter<boolean>,
): MapControlHandlers {
  const zoomBy = React.useCallback((delta: number): void => {
    zoomViewBy(viewRef.current, delta);
  }, []);

  const toggleFullscreen = React.useCallback(async (): Promise<void> => {
    await toggleMapFullscreen(containerRef.current, () => { setBasemapMenuOpen(false); });
  }, []);

  const selectBasemap = React.useCallback((basemapId: string): void => {
    const view = viewRef.current;
    if (!view?.map || view.destroyed) return;
    view.map.basemap = basemapId;
    setActiveBasemapId(basemapId);
    setBasemapMenuOpen(false);
  }, []);

  const toggleBordersVisible = React.useCallback((): void => {
    const next = !bordersVisible;
    setBordersVisible(next);
    void setAgriAdminBordersVisible(viewRef.current, next);
  }, [bordersVisible]);

  return { zoomBy, toggleFullscreen, selectBasemap, toggleBordersVisible };
}

export type AgriMapInitParams = Omit<AgriMapInitContext, "session">;

/** Creates the map for the root data source and disposes it on change/unmount. */
export function useAgriMapInit(params: AgriMapInitParams): void {
  const { mapWidgetId, dataSourceId, rootDataSource } = params;
  React.useEffect(() => {
    const ctx: AgriMapInitContext = {
      ...params,
      session: { disposed: false, view: null, jimuMapViewId: "" },
    };
    void initializeAgriMap(ctx);
    return () => { disposeAgriMap(ctx); };
    // Intentionally omit onLoadingChange/onViewReady/onError — parent passes
    // inline lambdas; including them remounts the map every setState (infinite loop).
  }, [mapWidgetId, dataSourceId, rootDataSource]);
}
