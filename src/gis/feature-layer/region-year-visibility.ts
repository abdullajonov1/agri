/**
 * Region+year map layer visibility: show the one region/year layer matching
 * the filters (narrowed by tuman / crop / vegetation status), hide the rest,
 * and warm MapImage metadata ahead of the first export.
 */
import { type AgriFilters, type ShownRegionYearLayer, regionYearLog, haystackMatchesYear, getRegionYearOpacityTarget, clearScaleLimitsOnRegionYearTree, collectLiveSublayers, getMapImageParentLayer, regionYearPreloadFailedUrls, clearFieldLayerScaleLimits, guardSublayerDefinitionExpression, summarizeDefinitionExpression } from "./primitives";
import { collectRegionYearLeafLayers, buildSublayerDefinitionExpression, forceSublayersVisible } from "./layer-lookup";
import { haystackMatchesRegion } from "./haystack-scoring";
import type { AgriLayerLike, AgriMapLike } from "../agri-layer-types";

/**
 * Toggles visibility of region+year map layers (e.g. "agri andijan 2026
 * year", grouped under a "database 2026 year" group layer, with one such
 * sibling layer per region per year). Agri_table_data (the external table)
 * has no geometry and cannot represent this — the map's spatial
 * representation is still organized as one distinct layer per region+year,
 * so "filtering the map" here means showing the one layer that matches the
 * selected viloyat+yil (and, when set, narrowing its sublayer(s) further to
 * one tuman, crop type, and/or vegetation status) and hiding every other
 * region/year layer.
 *
 * Region+year matching is purely title/url text matching — schema-agnostic,
 * so it works regardless of what fields the underlying layers expose. Tuman,
 * turi, and vh narrowing need a matching attribute field on the sublayer; see
 * buildSublayerDefinitionExpression().
 *
 * Returns the layer(s) actually shown, with their live sublayer references,
 * so the caller can zoom to the real (tuman-aware) extent instead of the
 * whole region's fullExtent.
 */
export function syncRegionYearLayerVisibility(
  map: AgriMapLike | null | undefined,
  filters: Pick<AgriFilters, "yil" | "viloyat" | "tuman"> & {
    turi?: string;
    turlar?: string[];
    vh?: string;
    /** Numeric district code from Agri_table_data mapping (preferred on map). */
    districtCode?: number | null;
    /** When set (including []), filter polygons by uniqueid IN (...). */
    uniqueIds?: string[] | null;
    /**
     * AND MapImage `turi` even when uniqueids are set — required when VH was
     * selected first (status-wide ids) and crop is the second map narrow.
     */
    andTuriWithUniqueIds?: boolean;
  },
): ShownRegionYearLayer[] {
  const shown: ShownRegionYearLayer[] = [];
  const log = regionYearLog;

  if (!map) {
    log("SKIP:no-map");
    return shown;
  }
  const yil = String(filters.yil ?? "").trim();
  const viloyat = String(filters.viloyat ?? "").trim();
  const tuman = String(filters.tuman ?? "").trim();
  const districtCode = filters.districtCode;
  const vh = String(filters.vh ?? "").trim();
  const andTuriWithUniqueIds = Boolean(filters.andTuriWithUniqueIds);
  const uniqueIds =
    filters.uniqueIds === undefined ? null : filters.uniqueIds;
  const turlar = Array.from(
    new Set(
      (Array.isArray(filters.turlar) && filters.turlar.length
        ? filters.turlar
        : [filters.turi || ""]
      )
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
  const turi = turlar.length === 1 ? turlar[0] : "";
  if (!yil) {
    log("SKIP:no-year-selected-yet");
    return shown;
  }

  // Walk GroupLayer / MapImage / FeatureLayer trees explicitly. Relying only
  // on allLayers can miss Map Viewer TOC titles that live as nested sublayers
  // under "agri YYYY republic data".
  const regionYearLeaves = collectRegionYearLeafLayers(map);
  log("scan:start", {
    filters: {
      yil,
      viloyat,
      tuman,
      turi,
      turlar,
      vh,
      uniqueIdCount: uniqueIds ? uniqueIds.length : null,
    },
    totalRegionYearLeaves: regionYearLeaves.length,
    allLayerTitles: regionYearLeaves.map(
      (l) => l?.title || l?.url || l?.id,
    ),
  });

  const candidates: Array<{
    title: string | number | null | undefined;
    matchesYear: boolean;
    matchesRegion: boolean;
    visible: boolean;
  }> = [];
  // Prepare DE / parents first, then flip visibility. Starting the MapImage
  // export only after definitionExpression is set avoids a wasted first
  // export against the service default (often "1=0" or unfiltered).
  const pendingShow: AgriLayerLike[] = [];

  for (const layer of regionYearLeaves) {
    const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
    const matchesYear = haystackMatchesYear(haystack, yil);
    const matchesRegion = viloyat
      ? haystackMatchesRegion(haystack, viloyat)
      : false;
    const shouldShow = matchesYear && matchesRegion;

    try {
      if (shouldShow) {
        // Keep opacity at 1. The old opacity-0 → crop → opacity-1 dance left
        // MapImage sublayers / FeatureLayers permanently invisible when the
        // opacity target was the leaf (Sublayer.opacity is not the paint
        // opacity of the parent MapImage export).
        try {
          const opacityTarget = getRegionYearOpacityTarget(layer);
          if (opacityTarget && Number(opacityTarget.opacity ?? 1) !== 1) {
            opacityTarget.opacity = 1;
          }
          if (Number(layer.opacity ?? 1) !== 1) layer.opacity = 1;
        } catch {
          /* ignore */
        }

        let parent = layer?.parent;
        while (parent) {
          const parentType = String(parent?.type || "").toLowerCase();
          if (parentType === "group" || parentType === "map-image") {
            try {
              parent.visible = true;
            } catch {
              /* ignore */
            }
          }
          parent = parent?.parent;
        }

        clearScaleLimitsOnRegionYearTree(layer);

        applyShownRegionYearLayerFilters(
          layer,
          tuman,
          turlar,
          vh,
          uniqueIds,
          districtCode,
          andTuriWithUniqueIds,
        );

        const liveSublayers = collectLiveSublayers(layer);
        shown.push({ layer, sublayers: liveSublayers });
        pendingShow.push(layer);
      } else {
        layer.visible = false;
      }
    } catch {
      /* some layer types may not support direct visibility assignment */
    }
    candidates.push({
      title: layer?.title || layer?.url || layer?.id,
      matchesYear,
      matchesRegion,
      visible: shouldShow,
    });
  }

  for (const layer of pendingShow) {
    try {
      layer.visible = true;
    } catch {
      /* ignore */
    }
  }

  if (!candidates.length && viloyat) {
    // Local-only diagnostic — no network. Helps confirm title mismatch.
    try {
      const titles = (
        map.allLayers?.toArray?.() ||
        map.layers?.toArray?.() ||
        []
      ).map((l) => `${l?.type || "?"}:${l?.title || l?.id || "?"}`);
      // eslint-disable-next-line no-console
      console.warn(
        "[Agro_widgetV5] No region-year field layers matched selection",
        { yil, viloyat, mapLayerTitles: titles },
      );
    } catch {
      /* ignore */
    }
  }

  log("scan:result", {
    candidates,
    shownCount: candidates.filter((c) => c.visible).length,
  });

  return shown;
}
/**
 * Load MapImage metadata for region-year leaves (current year, optional viloyat)
 * without toggling visibility. Speeds the first export when the user later
 * reveals that region — cold `load()` no longer shares the critical path
 * with the heavy `export` request.
 */
export async function preloadRegionYearMapImages(
  map: AgriMapLike | null | undefined,
  yil: string,
  viloyat?: string,
): Promise<number> {
  if (!map) return 0;
  const year = String(yil || "").trim();
  if (!year) return 0;
  const region = String(viloyat || "").trim();
  const leaves = collectRegionYearLeafLayers(map);
  const parents = new Set<AgriLayerLike>();
  for (const layer of leaves) {
    const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
    if (!haystackMatchesYear(haystack, year)) continue;
    if (region && !haystackMatchesRegion(haystack, region)) continue;
    const parent = getMapImageParentLayer(layer) || layer;
    if (parent) parents.add(parent);
  }
  let loaded = 0;
  await Promise.all(
    Array.from(parents).map(async (layer) => {
      const key = String(layer?.url || layer?.id || "");
      if (key && regionYearPreloadFailedUrls.has(key)) return;
      try {
        if (typeof layer?.load === "function" && !layer.loaded) {
          await layer.load();
          loaded += 1;
        }
      } catch {
        // Dead/renamed service on the server side — stop retrying it every
        // year-change or widget mount.
        if (key) regionYearPreloadFailedUrls.add(key);
      }
    }),
  );
  return loaded;
}
/**
 * Apply tuman/turi/vh DE for a shown region leaf.
 * - MapImage with children: only that service's sublayers (one region).
 * - Leaf FeatureLayer / MapImage sublayer: DE on itself only.
 * Never walks sibling region sublayers of a republic aggregate.
 */
function applyShownRegionYearLayerFilters(
  layer: AgriLayerLike,
  tuman: string,
  turi: string | string[],
  vh = "",
  uniqueIds: string[] | null = null,
  districtCode?: number | null,
  andTuriWithUniqueIds = false,
): Array<Record<string, unknown>> {
  const subs =
    layer?.sublayers?.toArray?.() || layer?.allSublayers?.toArray?.() || [];
  const hasChildSublayers = Array.isArray(subs) && subs.length > 0;

  // Leaf (FeatureLayer or MapImage Sublayer): filter this layer only.
  // A *group* sublayer (type "sublayer" with children, e.g. the per-region
  // group inside "agri YYYY republic data") must not take this branch: the
  // server ignores layerDefs on a group id, so its polygon children would keep
  // rendering every district while still picking up the crop renderer.
  if (!hasChildSublayers) {
    const definitionExpressionBefore = layer?.definitionExpression ?? null;
    try {
      clearFieldLayerScaleLimits(layer);
      const nextExpression = buildSublayerDefinitionExpression(
        layer,
        tuman,
        turi,
        vh,
        uniqueIds,
        districtCode,
        andTuriWithUniqueIds,
      );
      guardSublayerDefinitionExpression(layer, nextExpression);
      if (
        String(definitionExpressionBefore ?? "") !==
        String(nextExpression ?? "")
      ) {
        layer.definitionExpression = nextExpression;
      }
    } catch {
      /* ignore */
    }
    return [
      {
        id: layer?.id,
        title: layer?.title,
        visible: layer?.visible,
        definitionExpressionBefore: summarizeDefinitionExpression(
          definitionExpressionBefore,
        ),
        definitionExpressionAfter: summarizeDefinitionExpression(
          layer?.definitionExpression ?? null,
        ),
        mode: "leaf",
      },
    ];
  }

  // Single-region MapImage: force only its own field sublayers.
  return forceSublayersVisible(
    layer,
    tuman,
    turi,
    vh,
    uniqueIds,
    districtCode,
    andTuriWithUniqueIds,
  );
}
