import { preloadRegionYearMapImages, refreshRegionYearMapExports, syncRegionYearLayerVisibility, type ShownRegionYearLayer, unlockShownRegionYearFieldScales } from "../../../../../gis/feature-layer-data";
import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import { errorMessage } from "../../../../../shared/agri-plain-object";

/** Background-warm the selected region's MapImage for the active year. */
export const warmYearRegionMapImages = (host: LocalizationHost): void => {
  const map = host.state.activeMapView?.view?.map;
  const yil = String(host.state.yil || "").trim();
  if (!map || !yil) return;
  // Only warm the region actually in view — warming every viloyat here
  // used to fire a load() at every region+year MapImage service
  // (including ones deleted/renamed on the server) on every mount/year
  // change, even before the user picked a region.
  const viloyat = host.getEffectiveViloyat();
  if (!viloyat) return;
  void preloadRegionYearMapImages(map, yil, viloyat).then((count) => {
    if (!count) return;
    agriLog("map:warm-year-region-layers", {
      yil,
      viloyat,
      loaded: count,
    });
  });
};

/**
 * Hide / show the just-revealed region-year MapImage layer(s) while the
 * crop UniqueValueRenderer is still loading.
 */
export const setShownRegionYearOpacity = (host: LocalizationHost, opacity: number): void => {
  for (const entry of host._lastShownRegionYearLayers || []) {
    const layer = (entry as any)?.layer;
    if (!layer) continue;
    try {
      // MapImage tiles paint from the parent service opacity; leaf Sublayer
      // opacity alone does not make fields visible.
      const type = String(layer?.type || "").toLowerCase();
      if (type === "sublayer") {
        let parent = layer.parent;
        while (parent) {
          if (String(parent?.type || "").toLowerCase() === "map-image") {
            parent.opacity = opacity;
            break;
          }
          parent = parent.parent;
        }
      }
      layer.opacity = opacity;
    } catch {
      /* ignore */
    }
  }
};

/**
 * Wait until MapImage has finished exporting with the new renderer.
 * `refresh=false` only waits for the in-flight export (e.g. after a
 * definitionExpression change) without forcing an extra server export.
 */
export const clearRegionYearSettleRepaintTimers = (host: LocalizationHost): void => {
  host._regionYearSettleRepaintTimers.forEach((timer) => clearTimeout(timer));
  host._regionYearSettleRepaintTimers = [];
};

/**
 * Re-apply region-year visibility/DE and force MapImage export at the
 * *current* view scale (no second zoom). Unlocks minScale again in case
 * layer.load() restored service scale gates after the first sync.
 */
export const repaintShownRegionYearLayers = (host: LocalizationHost, phase: string): void => {
  if (!host._isMounted) return;
  const map = host.state.activeMapView?.view?.map;
  const viloyat = host.getEffectiveViloyat();
  if (!map || !host.state.yil || !viloyat) return;
  try {
    const shown = host.syncShownRegionYearLayers(map);
    host._lastShownRegionYearLayers = shown;
    unlockShownRegionYearFieldScales(shown);
    for (const entry of shown) {
      try {
        if (Number(entry.layer?.opacity ?? 1) <= 0.05) {
          entry.layer.opacity = 1;
        }
      } catch {
        /* best-effort */
      }
    }
    refreshRegionYearMapExports(shown);
    agriLog("map:settle-repaint", {
      phase,
      shownLayerCount: shown.length,
      yil: host.state.yil,
      viloyat,
      tuman: host.state.tuman || "",
      viewScale: Number(host.state.activeMapView?.view?.scale || 0) || null,
    });
  } catch (error) {
    agriLog("map:settle-repaint:FAILED", {
      phase,
      error: errorMessage(error),
    });
  }
};

/**
 * Schedule 1–2 settle repaints after geography zoom. First after goTo
 * duration; second shortly after in case the settle refresh was also aborted.
 */
export const scheduleShownRegionYearSettleRepaint = (
  host: LocalizationHost,
  requestId: number,
  delayMs: number,
  phase: string,
): void => {
  host.clearRegionYearSettleRepaintTimers();
  const run = (label: string) => {
    if (!host._isMounted || requestId !== host._zoomRequestId) return;
    host.repaintShownRegionYearLayers(label);
  };
  host._regionYearSettleRepaintTimers.push(
    setTimeout(() => run(phase), Math.max(0, delayMs)),
  );
  host._regionYearSettleRepaintTimers.push(
    setTimeout(() => run(`${phase}:retry`), Math.max(0, delayMs) + 400),
  );
};

export const waitForShownRegionYearRedraw = async (
  host: LocalizationHost,
  refresh = true,
): Promise<void> => {
  const view = host.state.activeMapView?.view;
  if (!view) return;

  await Promise.all(
    (host._lastShownRegionYearLayers || []).map(async (entry) => {
      const layer = (entry as any)?.layer;
      if (!layer) return;
      if (refresh) {
        try {
          layer.refresh?.();
        } catch {
          /* ignore */
        }
      }
      try {
        const lv: any = await view.whenLayerView(layer);
        if (!lv) return;

        // Give the layerView a chance to flip into `updating=true` after
        // refresh — resolving immediately when updating is already false
        // revealed the previous (green) MapImage tile.
        await new Promise<void>((resolve) => {
          let settled = false;
          let sawUpdating = !!lv.updating;
          let handle: { remove?: () => void } | null = null;
          const done = () => {
            if (settled) return;
            settled = true;
            try {
              handle?.remove?.();
            } catch {
              /* ignore */
            }
            resolve();
          };
          handle = lv.watch?.("updating", (updating: boolean) => {
            if (updating) {
              sawUpdating = true;
              return;
            }
            if (sawUpdating) done();
          });
          // If updating never flips on, don't hang forever.
          setTimeout(done, sawUpdating ? 3000 : 900);
        });
      } catch {
        /* ignore */
      }
    }),
  );
};

export function buildWhereForLayer(
  host: LocalizationHost,
  layer: __esri.FeatureLayer,
  includeVh = false,
  includeTuri = true,
  forStats = false,
): string {
  // Build base without viloyat so we can route per layer.
  let where = host.buildWhereClause(includeVh, includeTuri, false, layer);
  if (!where || where === "1=0") return "1=0";

  const effectiveViloyat = host.getEffectiveViloyat();
  if (!effectiveViloyat) {
    // For stats (VH bar data) allow republic-wide queries without viloyat filter.
    // For map polygon display keep hidden (1=0) until user picks a region.
    return forStats ? where : "1=0";
  }

  const layerMatch = host.getLayerMatchStateForViloyat(
    layer,
    effectiveViloyat,
  );
  if (layerMatch === "mismatch") return "1=0";

  // If layer<->viloyat mapping is unknown, keep fallback viloyat predicate for safety.
  if (layerMatch === "unknown") {
    const vilClause = host.buildViloyatRegionClause();
    if (!vilClause) return "1=0";
    where = `(${where}) AND (${vilClause})`;
  }

  return where;
}

export const syncShownRegionYearLayers = (host: LocalizationHost, map: any): ShownRegionYearLayer[] => {
  // Strict: null = no VH uniqueid filter; [] = VH active but zero matches (1=0);
  // non-empty = uniqueid IN (...). Never treat [] as null (that showed all polygons).
  // Deferred first paint: ignore previous uniqueids on the map (turi-only) but
  // keep them in _vhMapUniqueIds so Region/Pie broadcasts do not go empty.
  const deferredMapPaint = host._suppressLegacyVhOnMap;
  const vhActive = !!String(host.state.vh || "").trim();
  const farmerActive = !!String(host.state.selectedFarmerInn || "").trim();
  const farmerIds =
    farmerActive && Array.isArray(host._farmerMapUniqueIds)
      ? host._farmerMapUniqueIds
      : null;
  const vhIds = deferredMapPaint
    ? null
    : vhActive && host._vhMapUniqueIds != null
      ? host._vhMapUniqueIds
      : null;
  // Prefer STIR uniqueids; when both VH + STIR are active, intersect.
  let uniqueIds: string[] | null = farmerIds;
  if (farmerIds && vhIds) {
    const vhSet = new Set(
      vhIds.map((id) => String(id || "").replace(/[{}]/g, "").toLowerCase()),
    );
    uniqueIds = farmerIds.filter((id) =>
      vhSet.has(String(id || "").replace(/[{}]/g, "").toLowerCase()),
    );
  } else if (!farmerIds) {
    uniqueIds = vhIds;
  }
  const mapVh =
    vhActive && uniqueIds == null && !deferredMapPaint && !farmerActive
      ? String(host.state.vh || "")
      : "";
  const selectedTurlar = host.getSelectedTurlar();
  // VH-first (or crop_id fallback): uniqueids are status-wide — AND turi on
  // the MapImage so the second-selected crop actually narrows the map.
  const andTuriWithUniqueIds =
    Array.isArray(uniqueIds) &&
    uniqueIds.length > 0 &&
    selectedTurlar.length > 0 &&
    !host._vhUniqueIdsCropScoped;
  const { districtCode } = host.getAdminBoundarySelection();
  return syncRegionYearLayerVisibility(map, {
    yil: host.state.yil,
    viloyat: host.getEffectiveViloyat(),
    tuman: host.state.tuman,
    districtCode: districtCode ?? null,
    turi: host.state.turi,
    turlar: selectedTurlar,
    vh: mapVh,
    uniqueIds,
    andTuriWithUniqueIds,
  });
};
