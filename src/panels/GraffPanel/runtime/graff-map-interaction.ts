import { React } from "jimu-core";
import { applyGraffDefinitionExpression } from "./graff-guards";
import type { JimuMapView } from "jimu-arcgis";
import {
  ensureAgriServerIdentityToken,
  getDetachedQueryLayerForUrl,
  isMapImageOwnedLayer,
  resolveQueryableServiceUrl,
} from "../../../gis/feature-layer-data";
import { AGRI_TABLE_JOIN_FIELD } from "../../../gis/agri-table-data-source";
import {
  buildUniqueidUpperEqualsWhere,
  stripUniqueidBraces,
} from "../../../data/agri-uniqueid-sql";
import {
  mapStretch01ToIndexRange,
  sampleIndexFromRgba,
} from "../../../gis/agri-polygon-api-source";
import { clearMapSelectionGraphics, isLayerTreeVisible } from "./graff-map-utils";
import { copyUniqueIdToClipboard } from "./graff-clipboard";
import { graffLog } from "./graff-log";
import type { GraffVegetationRasterSample } from "./graff-raster-overlay";
import type { AgriGraffWidgetState, RecordData } from "./widget";

export interface GraffMapInteractionHost {
  state: AgriGraffWidgetState;
  setState: React.Component<any, AgriGraffWidgetState>["setState"];
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
  getTableSpatialQueryCandidates: () => __esri.FeatureLayer[];
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
          }, 400);
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
          easing: "ease-in-out" as const,
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

export const handleGraffRowClick = async (host: GraffMapInteractionHost, record: RecordData) => {
  graffLog("tableRow:click", {
    uniqueid: record?.uniqueid || null,
    objectid: record?.objectid ?? null,
    recordTuman: String((record as any)?.tuman || ""),
    recordViloyat: String((record as any)?.viloyat || ""),
    filterViloyat: host.state.regionalFilters?.viloyat || "",
    filterTuman: host.state.regionalFilters?.tuman || "",
    interactionEnabled: host.isRegionalInteractionEnabled(),
    hasFeatureLayer: !!host.state.featureLayer,
    hasMapView: !!host.state.activeMapView,
    spatialCandidateCount: host.getTableSpatialQueryCandidates().length,
  });
  if (!host.isRegionalInteractionEnabled()) {
    graffLog("tableRow:click:BLOCKED-no-interaction", {
      viloyat: host.state.regionalFilters?.viloyat || "",
      tuman: host.state.regionalFilters?.tuman || "",
    });
    return;
  }

  const { featureLayer, activeMapView, selecteduniqueid } = host.state;

  if (record?.uniqueid) {
    void copyUniqueIdToClipboard(String(record.uniqueid));
  }

  if (!record || !featureLayer || !activeMapView) {
    graffLog("tableRow:click:BLOCKED-missing-layer-or-map", {
      hasRecord: !!record,
      hasFeatureLayer: !!featureLayer,
      hasMapView: !!activeMapView,
    });
    return;
  }

  // Extract uniqueid first
  const uniqueid = record.uniqueid || record.objectid?.toString();

  // 🔁 Toggle behavior: if the same polygon is already selected, clear selection instead.
  const currentClean = (selecteduniqueid || "").replace(/[{}]/g, "");
  const nextClean = (uniqueid || "").toString().replace(/[{}]/g, "");
  if (currentClean && nextClean && currentClean === nextClean) {
    // Clear highlight graphics only
    clearMapSelectionGraphics(activeMapView.view);

    const restoreExtent = host._extentBeforeTableSelection;
    host._extentBeforeTableSelection = null;
    if (restoreExtent) {
      try {
        await activeMapView.view.goTo(restoreExtent, {
          duration: 700,
          easing: "ease-in-out" as const,
        });
      } catch {
        /* navigation interruption is harmless */
      }
    }

    // AgriLocalization owns the spatial zoom-out after the polygonMode=false
    // event below. The Graff data source can be a non-spatial table, so it
    // must not attempt queryExtent here.

    // Only clear the row selection / graph data – keep regional filters intact
    host.cancelVegetationImageOverlay();
    host._polygonSelectionOrigin = null;
    host._selectionCommittedAt = 0;
    host.setState(
      {
        selecteduniqueid: "",
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
        polygonImageError: null,
        vegetationError: null,
      },
      () => {
        // Restore normal regional filter when row selection is cleared.
        // MapImage-owned sublayers keep AgriLocalization's tuman/turi DE.
        try {
          const baseWhere = host.buildWhereClause();
          applyGraffDefinitionExpression(featureLayer, host.state.dataSource, baseWhere || "1=0");
        } catch {}
        try {
          document.dispatchEvent(
            new CustomEvent("widgetSelectionChanged", {
              detail: {
                source: "AgriGraffWidget",
                polygonMode: false,
                timestamp: Date.now(),
              },
              bubbles: true,
            }),
          );
        } catch {}
        if (host.state.viewMode === "graph") {
          host.fetchRegionalTimeseries();
        }
      },
    );
    return;
  }

  try {
    host.setState({ loading: true }); // ❌ DON'T set selecteduniqueid here yet

    // Agri_table_data has no geometry — highlight/zoom must query the
    // spatial polygon layer(s), joined by uniqueid, not the external table.
    const clickGeneration = ++host._tableRowClickGeneration;
    const isStaleClick = () =>
      !host._isMounted || clickGeneration !== host._tableRowClickGeneration;

    let results: __esri.FeatureSet | null = null;
    await ensureAgriServerIdentityToken();
    const spatialLayersForHighlight = host.getTableSpatialQueryCandidates();
    graffLog("tableRow:spatial-candidates", {
      count: spatialLayersForHighlight.length,
      layers: spatialLayersForHighlight.map((layer: any) => ({
        title: layer?.title || null,
        url:
          (layer as any)?.__agriQueryableUrl ||
          resolveQueryableServiceUrl(layer) ||
          layer?.url ||
          null,
        visible: isLayerTreeVisible(layer),
      })),
    });

    const uniqueWhere = record.uniqueid
      ? buildUniqueidUpperEqualsWhere(
          String(record.uniqueid),
          AGRI_TABLE_JOIN_FIELD,
        )
      : "";

    for (const spatialLayer of spatialLayersForHighlight) {
      if (isStaleClick()) return;
      const url =
        String((spatialLayer as any)?.__agriQueryableUrl || "").trim() ||
        resolveQueryableServiceUrl(spatialLayer);
      if (!url) continue;

      let detached = host._detachedSpatialQueryLayers.get(url);
      if (!detached) {
        try {
          detached = await getDetachedQueryLayerForUrl(url);
          if (detached) host._detachedSpatialQueryLayers.set(url, detached);
        } catch (err) {
          graffLog("tableRow:detached-FAILED", {
            url,
            error: String((err as any)?.message || err),
          });
          detached = null as any;
        }
      }
      // Never query the live MapImage sublayer — it rehydrates and can
      // clear the district definitionExpression (other districts flash).
      if (!detached) {
        graffLog("tableRow:skip-no-detached", {
          url,
          title: (spatialLayer as any)?.title || null,
        });
        continue;
      }
      if (isStaleClick()) return;

      if (uniqueWhere && uniqueWhere !== "1=0") {
        const q = detached.createQuery();
        q.outFields = ["*"];
        q.returnGeometry = true;
        q.num = 1;
        q.where = uniqueWhere;
        try {
          results = await detached.queryFeatures(q);
        } catch (err) {
          graffLog("tableRow:query-FAILED", {
            url,
            where: uniqueWhere,
            error: String((err as any)?.message || err),
          });
          results = null;
        }
      }

      if (results?.features?.length) {
        graffLog("tableRow:geometry-found", {
          uniqueid: uniqueid || null,
          layer: (spatialLayer as any)?.title || null,
          url,
        });
        break;
      }
    }

    if (isStaleClick()) return;

    if (results?.features?.length) {
      const feature = results.features[0];
      if (!host._extentBeforeTableSelection && activeMapView.view.extent?.clone) {
        host._extentBeforeTableSelection = activeMapView.view.extent.clone();
      }
      // Same cyan outline-only highlight + zoom as AgriPopup map-click.
      // Do not await goTo — overlay fetch must start immediately.
      void host.highlightFeature(feature, activeMapView);
    } else {
      graffLog("tableRow:geometry-NOT-found", {
        uniqueid: uniqueid || null,
        candidateCount: spatialLayersForHighlight.length,
        where: uniqueWhere || null,
      });
    }

    // ✅✅✅ KEY FIX: Set selecteduniqueid AFTER successful query
    // A different polygon is now selected — any raster overlay/date
    // selection from the previous one no longer applies.
    host.cancelVegetationImageOverlay();
    host.beginVegetationImageSurfaceLoading();
    // Row-click selection is authoritative "now" — mark it so a
    // late-arriving stale external (AgriPopup) notification for an
    // earlier map click can't silently override it afterwards.
    host._lastAppliedPolygonClickedAt = Date.now();

    host._polygonSelectionOrigin = "table";
    host._selectionCommittedAt = Date.now();
    host.setState(
      {
        loading: false,
        selecteduniqueid: uniqueid,
        // Stay on the table when the user picks a row here; map highlight/
        // zoom still run above. Chart opens only via the Graph toggle
        // (or via AgriPopup map-click → syncExternalPolygonSelection).
        error: null,
        vegetationError: null,
        selectedNdviDate: null,
        selectedChartIndexKey: null,
        polygonAvailableDates: [],
        polygonImageError: null,
      },
      () => {
        // Keep only the selected row polygon visible on the map layer.
        // MapImage-owned sublayers keep AgriLocalization's tuman/turi DE —
        // rewriting them forces an export that flashes other districts.
        try {
          const baseWhere = host.buildWhereClause();
          const uniqueClause = host.builduniqueidWhere(
            String(uniqueid || ""),
            "uniqueid",
          );
          const selectedWhere =
            baseWhere && baseWhere !== "1=0"
              ? `(${baseWhere}) AND ${uniqueClause}`
              : uniqueClause;
          applyGraffDefinitionExpression(featureLayer, host.state.dataSource, selectedWhere || "1=0");
        } catch {}

        try {
          document.dispatchEvent(
            new CustomEvent("widgetSelectionChanged", {
              detail: {
                source: "AgriGraffWidget",
                polygonMode: true,
                uniqueid: uniqueid || "",
                timestamp: Date.now(),
              },
              bubbles: true,
            }),
          );
        } catch {}

        // Chart series + season-aware raster walk (single flight). Do not also
        // call kickOptimistic here — that stacked a second 400 cascade.
        host.fetchVegetationData();
        void host.ensureSelectedRowVisible(uniqueid);
      },
    );
  } catch (err) {
    host.setState({
      loading: false,
      error: "Объектни танлаш амалга ошмади",
    });
  }
};

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

  host._vegetationHoverHandle = view.on("pointer-move", (event: any) => {
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
