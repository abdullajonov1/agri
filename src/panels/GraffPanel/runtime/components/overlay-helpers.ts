import type { GraffWidgetHost } from "../graff-host";
import { applyGraffDefinitionExpression, eventDetail } from "../graff-guards";
import { buildUniqueidUpperEqualsWhere, stripUniqueidBraces } from "../../../../data/agri-uniqueid-sql";
import { setVegetationOverlayContext, getVegetationOverlayDateForRegion } from "../../../../gis/agri-vegetation-overlay-prefetch";
import type { VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import { getExportImageSeasonMonths, isRegionDateWithoutImagery, isRegionDateWithImagery, resolveExportImageWithDateWalk, pickExportRasterDate, fetchPolygonAvailableDates, fetchPolygonExportImageTiff } from "../../../../gis/agri-polygon-api-source";
import { clearMapSelectionGraphics } from "../graff-map-utils";
import { isMapImageOwnedLayer } from "../../../../gis/feature-layer-data";
import { graffLog } from "../graff-log";

export const updateGraphViewportSize = (host: GraffWidgetHost) => {
  const wrap = host.graphSvgWrapRef.current;
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const nextWidth = Math.max(120, Math.floor(rect.width));
  const nextHeight = Math.max(120, Math.floor(rect.height));

  host.setState((prev) => {
    if (
      Math.abs(prev.graphViewportWidth - nextWidth) < 2 &&
      Math.abs(prev.graphViewportHeight - nextHeight) < 2
    ) {
      return null;
    }
    return {
      graphViewportWidth: nextWidth,
      graphViewportHeight: nextHeight,
    };
  });
};

export const scheduleGraphViewportRefresh = (host: GraffWidgetHost) => {
  if (typeof window === "undefined") return;

  if (host._graphViewportRaf != null) {
    window.cancelAnimationFrame(host._graphViewportRaf);
    host._graphViewportRaf = null;
  }

  host._graphViewportRaf = window.requestAnimationFrame(() => {
    host._graphViewportRaf = window.requestAnimationFrame(() => {
      host._graphViewportRaf = null;
      host.updateGraphViewportSize();
    });
  });
};

export const observeGraphViewport = (host: GraffWidgetHost) => {
  host.graphResizeObserver?.disconnect();
  host.graphResizeObserver = null;

  const wrap = host.graphSvgWrapRef.current;
  if (!wrap) return;
  const container = host.graphContainerRef.current;

  if (typeof ResizeObserver !== "undefined") {
    host.graphResizeObserver = new ResizeObserver(() => {
      host.scheduleGraphViewportRefresh();
    });
    host.graphResizeObserver.observe(wrap);
    if (container && container !== wrap) {
      host.graphResizeObserver.observe(container);
    }
  }

  host.scheduleGraphViewportRefresh();
};

export const handleDocumentMouseDown = (host: GraffWidgetHost, event: MouseEvent) => {
  if (!host.state.isMonthPickerOpen) return;

  const pickerRoot = host.monthPickerRef.current;
  const targetNode = event.target as Node | null;

  if (!pickerRoot || !targetNode) return;
  if (pickerRoot.contains(targetNode)) return;

  host.setState({ isMonthPickerOpen: false });
};

// Keep braces/no-braces variants and normalize case safely
export const builduniqueidWhere = (host: GraffWidgetHost, raw: string, field: string = "uniqueid") =>
  buildUniqueidUpperEqualsWhere(raw, field);

/** Resolve actual cased field name on the layer or null if missing */
export const resolveFieldCaseInsensitive = (host: GraffWidgetHost, name: string): string | null => {
  const fl = host.state.featureLayer;
  if (!fl?.fields) return null;
  const lower = name.toLowerCase();
  const f = fl.fields.find((ff) => ff.name.toLowerCase() === lower);
  return f?.name ?? null;
};

/** Viloyat (yoki qulflash) tanlanguncha jadval/grafik faqat ko‘rinadi — bosishlar ishlamaydi. */
export const isRegionalInteractionEnabled = (host: GraffWidgetHost): boolean =>
  !!String(host.state.regionalFilters?.viloyat || "").trim();

/** AgriPopup polygon-selection broadcast payload (untrusted). */
interface PopupPolygonSelectionDetail {
  source?: unknown;
  regionId?: unknown;
  polygonMode?: unknown;
  uniqueid?: unknown;
  clickedAt?: unknown;
}

/** Hit-test result entry; only graphic hits carry attributes. */
type HitWithGraphic = { graphic?: { attributes?: Record<string, unknown> | null } | null };

/**
 * AgriPopup → Graff direct path (skips Localization setState hop) so TIFF
 * can start in the same event turn as the map click notify.
 */
export const handlePopupPolygonSelectionFastPath = (host: GraffWidgetHost, event: Event): void => {
  if (!host._isMounted) return;
  const d = eventDetail<PopupPolygonSelectionDetail>(event);
  if (d?.source !== "AgriPopup") return;
  const regionHint =
    d.regionId != null && Number.isFinite(Number(d.regionId))
      ? Number(d.regionId)
      : null;
  if (d.polygonMode && d.uniqueid) {
    host.syncExternalPolygonSelection(
      String(d.uniqueid),
      true,
      regionHint,
      typeof d.clickedAt === "number" ? d.clickedAt : undefined,
    );
    return;
  }
  if (d.polygonMode === false) {
    host.syncExternalPolygonSelection(
      "",
      false,
      regionHint,
      typeof d.clickedAt === "number" ? d.clickedAt : undefined,
    );
  }
};

/**
 * Remembered overlay date, but only when it came from the same region+year.
 * Sentinel scene dates differ per region, so a cross-region guess makes
 * export-image answer 400 (no raster for that date).
 */
export function getCarriedOverlayDate(host: GraffWidgetHost, regionId: number | undefined, year: number | undefined): string | null {
  const date = String(host._lastSuccessfulOverlayDate || "").trim();
  if (!date || regionId === undefined) return null;
  if (
    host._lastSuccessfulOverlayRegionId != null &&
    host._lastSuccessfulOverlayRegionId !== regionId
  ) {
    return null;
  }
  if (
    year !== undefined &&
    host._lastSuccessfulOverlayYear != null &&
    host._lastSuccessfulOverlayYear !== year
  ) {
    return null;
  }
  return date;
}

/**
 * Start export-image before /available-dates or ArcGIS series return.
 * Uses per-polygon cached latest date, else last successful overlay date
 * (same district scenes often share a date).
 */
export const kickOptimisticVegetationOverlay = (host: GraffWidgetHost, uniqueid: string): void => {
  const regionId = host.resolveCurrentRegionId();
  const year = host.resolveCurrentYear();
  // A remembered date only transfers to another polygon of the SAME
  // region/year — otherwise export-image 400s on a nonexistent scene.
  const carriedDate = host.getCarriedOverlayDate(regionId, year);
  if (regionId !== undefined) {
    setVegetationOverlayContext({
      regionId,
      year,
      lastDate: carriedDate,
      lastIndex: host._lastSuccessfulOverlayIndex,
    });
  }
  if (regionId === undefined) return;
  if (year === undefined) return;
  const clean = stripUniqueidBraces(uniqueid);
  if (!clean) return;
  const indexKey = (host.state.selectedIndices?.[0] ||
    host._lastSuccessfulOverlayIndex ||
    "ndvi") as VegetationIndiceType;
  // Chart date captured just before a map-click switch — same region only.
  const priorChartDate = carriedDate
    ? String(host._optimisticDateBeforeClear || "").trim()
    : "";
  const guessedDate =
    host._latestRasterDateByUniqueid.get(clean) ||
    carriedDate ||
    priorChartDate ||
    getVegetationOverlayDateForRegion(regionId, year) ||
    "";
  // Skip a guess export-image already refused for this crop season or for
  // this region's date (both answer HTTP 400) — go via /available-dates.
  const cropId = host.resolveCropIdForUniqueid(clean);
  const seasonMonths = getExportImageSeasonMonths(clean, cropId);
  const guessRefused =
    !!guessedDate &&
    ((seasonMonths.length > 0 &&
      !seasonMonths.includes(Number(guessedDate.slice(5, 7)))) ||
      isRegionDateWithoutImagery(regionId, guessedDate));
  const date = guessRefused ? "" : guessedDate;
  host._optimisticDateBeforeClear = null;
  // Only fire a direct export-image when this date is already proven for
  // the region/polygon. Otherwise a guessed date + the dates walk race
  // two (or three) different raster_date requests on one click.
  const dateProven =
    !!date &&
    (host._verifiedOverlayDates.has(`${clean}|${date.slice(0, 10)}`) ||
      isRegionDateWithImagery(regionId, date));
  if (!dateProven) {
    host.beginVegetationImageSurfaceLoading();
    // Prefetch warms cache for Popup; also apply MediaLayer when the walk
    // finishes — do not wait only on fetchVegetationData (Portal races
    // often skip that path when regionId arrives late).
    void resolveExportImageWithDateWalk({
      uniqueid: clean,
      regionId,
      year: year as number,
      indiceType: indexKey,
      cropId,
    })
      .then((hit) => {
        if (!hit || !host._isMounted) return;
        if (stripUniqueidBraces(host.state.selecteduniqueid) !== clean) return;
        host.markOverlayDateVerified(clean, hit.date);
        host._latestRasterDateByUniqueid.set(clean, hit.date);
        setVegetationOverlayContext({
          regionId,
          year,
          lastDate: hit.date,
          lastDateRegionId: regionId,
          lastDateYear: year,
          lastIndex: indexKey,
        });
        void host.applyVegetationImageOverlay(
          uniqueid,
          hit.date,
          indexKey,
          hit.result,
        );
      })
      .catch(() => {
        /* fetchVegetationData / apply paths surface errors */
      });
    graffLog("kickOptimisticVegetationOverlay:prefetch-dates", {
      uniqueid: clean,
      regionId,
      year: year ?? null,
      guessedDate: date || null,
      reason: date ? "guess-unproven" : "no-date",
    });
    return;
  }
  graffLog("kickOptimisticVegetationOverlay:start", {
    uniqueid: clean,
    regionId,
    rasterDate: date,
    indiceType: indexKey,
    source: host._latestRasterDateByUniqueid.has(clean)
      ? "uniqueid-cache"
      : carriedDate
        ? "last-success-same-region"
        : "session-same-region",
  });
  host.beginVegetationImageSurfaceLoading();
  void host.applyVegetationImageOverlay(uniqueid, date, indexKey);
};

export const markOverlayDateVerified = (host: GraffWidgetHost, cleanId: string, date: string): void => {
  const key = `${cleanId}|${String(date || "").slice(0, 10)}`;
  if (!cleanId || key.endsWith("|")) return;
  host._verifiedOverlayDates.add(key);
  while (host._verifiedOverlayDates.size > 256) {
    const oldest = host._verifiedOverlayDates.values().next().value;
    if (oldest == null) break;
    host._verifiedOverlayDates.delete(oldest);
  }
};

/**
 * If the available-dates → export-image walk for this polygon is still
 * running, wait for it (bounded) and return the date it proved servable.
 * Returns undefined when there is nothing to wait for.
 */
export const awaitPendingOverlayWalk = async (host: GraffWidgetHost, cleanId: string, timeoutMs = 8000): Promise<string | null | undefined> => {
  const pending = host._pendingOverlayWalk;
  if (!pending || pending.uniqueid !== cleanId) return undefined;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => resolve(undefined), timeoutMs);
  });
  try {
    const hit = await Promise.race([
      pending.promise.then((h) => (h ? h.date : null)),
      timeout,
    ]);
    return hit;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const rememberRasterDateForUniqueid = (host: GraffWidgetHost, uniqueid: string, dates: string[]): void => {
  const clean = stripUniqueidBraces(uniqueid);
  if (!clean || !dates?.length) return;
  // Never downgrade a date export-image actually served to a fresh guess.
  const known = host._latestRasterDateByUniqueid.get(clean);
  if (known && host._verifiedOverlayDates.has(`${clean}|${known}`)) return;
  // /available-dates lists every index date; export-image also needs the
  // crop's season and the region's scene, so keep a date it can serve.
  const regionId = host.resolveCurrentRegionId() ?? null;
  const cropId = host.resolveCropIdForUniqueid(clean);
  const latest = pickExportRasterDate(dates, {
    uniqueid: clean,
    cropId,
    regionId,
  });
  if (latest) host._latestRasterDateByUniqueid.set(clean, latest);
  while (host._latestRasterDateByUniqueid.size > 64) {
    const oldest = host._latestRasterDateByUniqueid.keys().next().value;
    if (oldest == null) break;
    host._latestRasterDateByUniqueid.delete(oldest);
  }
};

export const detachMapHoverPrefetch = (host: GraffWidgetHost): void => {
  try {
    host._mapHoverPrefetchHandle?.remove?.();
  } catch {
    /* ignore */
  }
  host._mapHoverPrefetchHandle = null;
  if (host._hoverPrefetchTimer != null) {
    window.clearTimeout(host._hoverPrefetchTimer);
    host._hoverPrefetchTimer = null;
  }
};

export const attachMapHoverPrefetch = (host: GraffWidgetHost, view: __esri.MapView | __esri.SceneView): void => {
  host.detachMapHoverPrefetch();
  if (!view?.on) return;
  host._mapHoverPrefetchHandle = view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
    if (!host._isMounted) return;
    const regionId = host.resolveCurrentRegionId();
    const year = host.resolveCurrentYear();
    if (regionId === undefined || year === undefined) return;
    const scale = Number(view.scale);
    if (Number.isFinite(scale) && scale > 80000) return;

    if (host._hoverPrefetchTimer != null) {
      window.clearTimeout(host._hoverPrefetchTimer);
    }
    host._hoverPrefetchTimer = window.setTimeout(() => {
      void host.prefetchVegetationForMapPoint(view, event, regionId, year);
    }, 280);
  });
};

export const prefetchVegetationForMapPoint = async (host: GraffWidgetHost, view: __esri.MapView | __esri.SceneView, event: __esri.ViewPointerMoveEvent, regionId: number, year: number): Promise<void> => {
  try {
    const hit = await view.hitTest(event);
    const results = (hit?.results || []) as HitWithGraphic[];
    let uniqueid = "";
    for (const r of results) {
      const attrs = r?.graphic?.attributes;
      if (!attrs) continue;
      const raw =
        attrs.uniqueid ??
        attrs.UNIQUEID ??
        attrs.UniqueId ??
        attrs.UniqueID;
      if (raw != null && String(raw).trim()) {
        uniqueid = String(raw).trim();
        break;
      }
    }
    const clean = stripUniqueidBraces(uniqueid);
    if (!clean || clean === host._hoverPrefetchUniqueid) return;
    host._hoverPrefetchUniqueid = clean;

    const indexKey = (host.state.selectedIndices?.[0] ||
      "ndvi") as VegetationIndiceType;
    let date = host._latestRasterDateByUniqueid.get(clean) || "";
    if (!date) {
      const dates = await fetchPolygonAvailableDates(clean, regionId, year);
      if (!host._isMounted) return;
      host.rememberRasterDateForUniqueid(clean, dates);
      date = host._latestRasterDateByUniqueid.get(clean) || "";
    }
    if (!date) date = host.getCarriedOverlayDate(regionId, year) || "";
    if (!date) return;

    void fetchPolygonExportImageTiff({
      uniqueid: clean,
      regionId,
      rasterDate: date,
      indiceType: indexKey,
      stretch: "fixed",
    }).catch(() => {
      /* hover prefetch is best-effort */
    });
  } catch {
    /* ignore */
  }
};

/** Clear selection when the user clicks the same active polygon on the map. */
export const clearPolygonSelectionFromMapClick = (host: GraffWidgetHost): void => {
  host._polygonSelectionOrigin = null;
  host._selectionCommittedAt = 0;
  host._pendingScrollUniqueid = null;
  host._selectionPageResolveToken += 1;
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
  const featureLayer = host.state.featureLayer;
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
      try {
        const baseWhere = host.buildWhereClause();
        applyGraffDefinitionExpression(featureLayer, host.state.dataSource, baseWhere || "1=0");
      } catch {
        /* ignore */
      }
      try {
        document.dispatchEvent(
          new CustomEvent("widgetSelectionChanged", {
            detail: {
              source: "AgriGraffWidget",
              polygonMode: false,
              uniqueid: "",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
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
};
