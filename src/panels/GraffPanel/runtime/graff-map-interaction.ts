import { type React } from "jimu-core";
import { applyGraffDefinitionExpression } from "./graff-guards";
import { arcgisEaseInOut } from "../../../shared/agri-plain-object";
import type { TaggedLayer } from "./components/spatial-candidates";
import type { JimuMapView } from "jimu-arcgis";
import {
  stripUniqueidBraces,
} from "../../../data/agri-uniqueid-sql";
import {
  mapStretch01ToIndexRange,
  sampleIndexFromRgba,
} from "../../../gis/agri-polygon-api-source";
import { clearMapSelectionGraphics } from "./graff-map-utils";
import { graffLog } from "./graff-log";
import type { GraffVegetationRasterSample } from "./graff-raster-overlay";
import type { AgriGraffWidgetState } from "./widget";
import type { GraffWidgetProps } from "./graff-state";

export interface GraffMapInteractionHost {
  state: AgriGraffWidgetState;
  setState: React.Component<GraffWidgetProps, AgriGraffWidgetState>["setState"];
  _isMounted: boolean;
  _extentBeforeTableSelection: __esri.Extent | null;
  _polygonSelectionOrigin: "table" | "map" | null;
  _selectionCommittedAt: number;
  _tableRowClickGeneration: number;
  _detachedSpatialQueryLayers: Map<string, __esri.FeatureLayer>;
  _lastAppliedPolygonClickedAt: number;
  _optimisticDateBeforeClear: string | null;
  _lastSuccessfulOverlayDate: string | null;
  _missingVegetationRasterKeys: Set<string>;
  _pendingScrollUniqueid: string | null;
  _vegetationHoverTooltipEl: HTMLDivElement | null;
  _vegetationHoverHandle: __esri.Handle | null;
  _vegetationHoverLeaveHandle: __esri.Handle | null;
  _vegetationRasterSample: GraffVegetationRasterSample | null;
  isRegionalInteractionEnabled: () => boolean;
  getTableSpatialQueryCandidates: () => TaggedLayer[];
  cancelVegetationImageOverlay: () => void;
  buildWhereClause: () => string;
  fetchRegionalTimeseries: () => Promise<void>;
  highlightFeature: (feature: __esri.Graphic, activeMapView: JimuMapView) => Promise<void>;
  beginVegetationImageSurfaceLoading: () => void;
  builduniqueidWhere: (raw: string, field?: string) => string;
  fetchVegetationData: () => Promise<void>;
  ensureSelectedRowVisible: (uniqueid?: string | null) => Promise<void>;
  kickOptimisticVegetationOverlay: (uniqueid: string) => void;
  fetchData: (opts?: { preservePage?: boolean }) => Promise<void>;
  clearPolygonSelectionFromMapClick: () => void;
  getIndexDisplayColor: (indexKey?: string | null) => string;
  ensureVegetationHoverTooltipEl: () => HTMLDivElement | null;
  updateVegetationHoverTooltip: (value: number, clientX: number, clientY: number) => void;
  hideVegetationHoverTooltip: () => void;
  detachVegetationRasterHover: () => void;
  sampleVegetationRasterValue: (mapPoint: __esri.Point) => number | null;
}

/** Defers the table reload so the export-image request gets bandwidth first. */
const DEFERRED_TABLE_RELOAD_MS = 400;

export const syncGraffExternalPolygonSelection = (
  host: GraffMapInteractionHost,
  uniqueid: string,
  polygonMode: boolean,
  regionIdHint?: number | null,
  clickedAt?: number,
): void => {
  const current = (host.state.selecteduniqueid || "").replace(/[{}]/g, "");
  const incoming = uniqueid.replace(/[{}]/g, "");

  // Drop a notification that's older than whatever selection (from this
  // widget's own map click or a previous external relay) has already been
  // applied — see _lastAppliedPolygonClickedAt for why this races.
  if (
    typeof clickedAt === "number" &&
    clickedAt < host._lastAppliedPolygonClickedAt
  ) {
    graffLog("syncExternalPolygonSelection:SKIP-stale", {
      uniqueid,
      polygonMode,
      clickedAt,
      lastApplied: host._lastAppliedPolygonClickedAt,
    });
    return;
  }
  if (typeof clickedAt === "number") {
    host._lastAppliedPolygonClickedAt = clickedAt;
  }

  if (polygonMode && incoming && incoming !== current) {
    host._polygonSelectionOrigin = "map";
    host._selectionCommittedAt = Date.now();
    // Keep prior chart/indicator date for optimistic TIFF before state clears it.
    host._optimisticDateBeforeClear =
      (host.state.selectedNdviDate || "").trim() ||
      host._lastSuccessfulOverlayDate ||
      null;
    host.cancelVegetationImageOverlay();
    // Show map loader immediately — TIFF may still be waiting on dates.
    host.beginVegetationImageSurfaceLoading();
    // Session-scoped 404 cache is keyed by uniqueid|region|date|index —
    // clear when the polygon changes so a transient miss on one field
    // cannot permanently block the same date/index on the next field.
    host._missingVegetationRasterKeys.clear();
    // Clear any stale highlight graphic left over from a previous
    // this-widget-driven row selection — otherwise it stays stuck on the
    // old polygon when the selection instead changes via the map
    // (AgriPopup), since that path never touches our view.graphics.
    try {
      host.state.activeMapView?.view?.graphics?.removeAll?.();
    } catch {
      /* ignore */
    }
    const clearSearch =
      Boolean(host.state.isSearchActive) ||
      Boolean(String(host.state.searchText || "").trim());
    host.setState(
      {
        selecteduniqueid: uniqueid,
        // Show jadval so the selected row can be highlighted + scrolled into view.
        viewMode: "table",
        error: null,
        vegetationError: null,
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
        polygonImageError: null,
        isMonthPickerOpen: false,
        loading: true,
        regionalRegionCode:
          regionIdHint != null && Number.isFinite(regionIdHint)
            ? regionIdHint
            : host.state.regionalRegionCode,
        ...(clearSearch
          ? {
              searchText: "",
              searchError: null,
              searchResultCount: null,
              isSearchActive: false,
              farmerInn: "",
            }
          : {}),
      },
      () => {
        host._pendingScrollUniqueid = uniqueid;
        // Paint TIFF immediately with a plausible date (last success /
        // cached dates) — do not wait for Localization hop or date APIs.
        host.kickOptimisticVegetationOverlay(uniqueid);
        host.fetchVegetationData();
        // Defer table reload so export-image gets bandwidth first.
        if (host.state.connectionStatus === "connected") {
          window.setTimeout(() => {
            if (
              !host._isMounted ||
              stripUniqueidBraces(host.state.selecteduniqueid) !==
                stripUniqueidBraces(uniqueid)
            ) {
              return;
            }
            void host.fetchData();
          }, DEFERRED_TABLE_RELOAD_MS);
        }
      },
    );
    return;
  }

  /*
   * Same polygon clicked on the map while selected → deactivate
   * (same as clicking the row again). Require a real later map clickAt so
   * table-selection echoes do not immediately clear the row.
   */
  if (
    polygonMode &&
    incoming &&
    incoming === current &&
    typeof clickedAt === "number" &&
    clickedAt > host._selectionCommittedAt
  ) {
    host.clearPolygonSelectionFromMapClick();
    return;
  }

  if (!polygonMode && !incoming && current) {
    host._polygonSelectionOrigin = null;
    host._selectionCommittedAt = 0;
    host.cancelVegetationImageOverlay();
    clearMapSelectionGraphics(host.state.activeMapView?.view);
    const restoreExtent = host._extentBeforeTableSelection;
    host._extentBeforeTableSelection = null;
    const view = host.state.activeMapView?.view;
    if (restoreExtent && view) {
      try {
        void view.goTo(restoreExtent, {
          duration: 700,
          easing: arcgisEaseInOut,
        });
      } catch {
        /* ignore */
      }
    }
    host.setState(
      {
        selecteduniqueid: "",
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
        polygonImageError: null,
        vegetationError: null,
        searchText: "",
        searchError: null,
        searchResultCount: null,
        isSearchActive: false,
        farmerInn: "",
      },
      () => {
        try {
          const baseWhere = host.buildWhereClause();
          const featureLayer = host.state.featureLayer;
          applyGraffDefinitionExpression(featureLayer, host.state.dataSource, baseWhere || "1=0");
        } catch {
          /* ignore */
        }
        if (host.state.viewMode === "graph") {
          host.fetchRegionalTimeseries();
        }
        if (host.state.connectionStatus === "connected") {
          void host.fetchData();
        }
      },
    );
  }
};

export { handleGraffRowClick } from "./graff-row-click";

export const ensureGraffHoverTooltipEl = (host: GraffMapInteractionHost): HTMLDivElement | null => {
  if (typeof document === "undefined") return null;
  if (host._vegetationHoverTooltipEl?.isConnected) {
    return host._vegetationHoverTooltipEl;
  }
  const el = document.createElement("div");
  el.className = "agri-graff-raster-hover-tooltip";
  el.setAttribute("role", "tooltip");
  el.innerHTML = `
    <div class="agri-graff-raster-hover-tooltip__card">
      <span class="agri-graff-raster-hover-tooltip__label"></span>
      <span class="agri-graff-raster-hover-tooltip__value"></span>
    </div>
    <span class="agri-graff-raster-hover-tooltip__caret" aria-hidden="true"></span>
  `;
  document.body.appendChild(el);
  host._vegetationHoverTooltipEl = el;
  return el;
};

export const updateGraffHoverTooltip = (
  host: GraffMapInteractionHost,
  value: number,
  clientX: number,
  clientY: number,
): void => {
  const tooltip = host.ensureVegetationHoverTooltipEl();
  if (!tooltip) return;

  const rawKey = String(host.state.selectedChartIndexKey || "ndvi");
  const indexKey = rawKey.toUpperCase();
  const indexColor = host.getIndexDisplayColor(rawKey);
  const labelEl = tooltip.querySelector(
    ".agri-graff-raster-hover-tooltip__label",
  ) as HTMLElement | null;
  const valueEl = tooltip.querySelector(
    ".agri-graff-raster-hover-tooltip__value",
  ) as HTMLElement | null;
  if (labelEl) {
    labelEl.textContent = indexKey;
    labelEl.style.color = indexColor;
  }
  if (valueEl) {
    // 2 decimals when float TIFF; RGB-reverse is continuous after palette interp.
    valueEl.textContent = Number(value).toFixed(2);
    valueEl.style.color = indexColor;
  }

  tooltip.style.left = `${clientX}px`;
  tooltip.style.top = `${clientY}px`;
  tooltip.classList.add("is-visible");
};

export const hideGraffHoverTooltip = (host: GraffMapInteractionHost): void => {
  if (host._vegetationHoverTooltipEl) {
    host._vegetationHoverTooltipEl.classList.remove("is-visible");
  }
};

export const detachGraffRasterHover = (host: GraffMapInteractionHost): void => {
  try {
    host._vegetationHoverHandle?.remove?.();
  } catch {
    /* ignore */
  }
  try {
    host._vegetationHoverLeaveHandle?.remove?.();
  } catch {
    /* ignore */
  }
  host._vegetationHoverHandle = null;
  host._vegetationHoverLeaveHandle = null;
  host.hideVegetationHoverTooltip();
  if (host._vegetationHoverTooltipEl?.parentNode) {
    try {
      host._vegetationHoverTooltipEl.parentNode.removeChild(
        host._vegetationHoverTooltipEl,
      );
    } catch {
      /* ignore */
    }
  }
  host._vegetationHoverTooltipEl = null;
};

export const sampleGraffRasterValue = (
  host: GraffMapInteractionHost,
  mapPoint: __esri.Point,
): number | null => {
  const sample = host._vegetationRasterSample;
  if (!sample || !mapPoint) return null;

  const x = mapPoint.x;
  const y = mapPoint.y;
  const {
    xmin,
    ymin,
    xmax,
    ymax,
    width,
    height,
    values,
    rgba,
    indexMin,
    indexMax,
  } = sample;
  if (x < xmin || x > xmax || y < ymin || y > ymax) return null;

  const col = Math.floor(((x - xmin) / (xmax - xmin)) * width);
  // GeoTIFF rows start at the top (ymax).
  const row = Math.floor(((ymax - y) / (ymax - ymin)) * height);
  if (col < 0 || col >= width || row < 0 || row >= height) return null;

  const pixelIndex = row * width + col;
  if (values && values.length === width * height) {
    const v = values[pixelIndex];
    if (!Number.isFinite(v)) return null;
    // Absolute indices stay; 0..1 stretch above field max → header/chart range.
    if (
      indexMin != null &&
      indexMax != null &&
      indexMax > indexMin &&
      v > indexMax + 0.08
    ) {
      return mapStretch01ToIndexRange(v, indexMin, indexMax);
    }
    return v;
  }
  if (rgba && rgba.length === width * height * 4) {
    const o = pixelIndex * 4;
    const t01 = sampleIndexFromRgba(
      rgba[o],
      rgba[o + 1],
      rgba[o + 2],
      rgba[o + 3],
    );
    if (t01 == null) return null;
    // Prefer header/chart range so tooltip matches Index series (not 0..1 ramp).
    return mapStretch01ToIndexRange(t01, indexMin, indexMax);
  }
  return null;
};

export const attachGraffRasterHover = (
  host: GraffMapInteractionHost,
  view: __esri.MapView | __esri.SceneView,
): void => {
  host.detachVegetationRasterHover();
  if (!host._vegetationRasterSample) return;

  const tooltip = host.ensureVegetationHoverTooltipEl();
  if (!tooltip) return;

  host._vegetationHoverHandle = view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
    if (!host._vegetationRasterSample || !host._isMounted) {
      host.hideVegetationHoverTooltip();
      return;
    }
    try {
      const mapPoint = view.toMap({ x: event.x, y: event.y });
      if (!mapPoint) {
        host.hideVegetationHoverTooltip();
        return;
      }
      const value = host.sampleVegetationRasterValue(mapPoint);
      if (value == null) {
        host.hideVegetationHoverTooltip();
        return;
      }
      const screen = view.toScreen(mapPoint);
      const rect = view.container?.getBoundingClientRect?.();
      if (!screen || !rect) {
        host.hideVegetationHoverTooltip();
        return;
      }
      host.updateVegetationHoverTooltip(
        value,
        rect.left + screen.x,
        rect.top + screen.y,
      );
    } catch {
      host.hideVegetationHoverTooltip();
    }
  });

  host._vegetationHoverLeaveHandle = view.on("pointer-leave", () => {
    host.hideVegetationHoverTooltip();
  });
};
