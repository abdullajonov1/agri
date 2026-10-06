import { normalizeQueryableLayerUrl, isQueryableFieldLayer, type AgriFilters, type ShownRegionYearLayer, regionYearLog, haystackMatchesYear, getRegionYearOpacityTarget, clearScaleLimitsOnRegionYearTree, collectLiveSublayers, getMapImageParentLayer, regionYearPreloadFailedUrls, clearFieldLayerScaleLimits, guardSublayerDefinitionExpression, summarizeDefinitionExpression, normalizeRegionToken, REGION_SOATO_TO_UZ_NAME, getQueryUrl, valueIndexCache, valueIndexLoading, VALUE_INDEX_FIELDS, hasFieldIn, flLog, layerLabel, type TextMatchKind, regionDisplayNameToSoato, layerFieldKind, expandRegionVariants, apostropheVariants, cacheKey, queryCountCache, QUERY_CACHE_TTL_MS, type PickWhereWithMavsumFallbackResult, queryStatsCache } from "./primitives";
import { getAllFeatureLayersFromMap, collectRegionYearLeafLayers, buildSublayerDefinitionExpression, forceSublayersVisible, getRegionMatchTokens, canonicalizeRegionFilterValue, distinctValues, matchRegionValuesFromIndex, addTextEqTerms, literalVariantsForMatch, pruneAgriQueryCache, countWhereUncached, runStatsQueryUncached, queryLayerJson } from "./layer-lookup";
import { isRegionSoatoCode } from "../map-image-predicates";
import { escapeArcGIS } from "../../data/agri-sql";

export function findQueryableLayerOnMapByUrl(map: any, url: string): any | null {
  const target = normalizeQueryableLayerUrl(url);
  if (!map || !target) return null;

  for (const layer of getAllFeatureLayersFromMap(map)) {
    if (normalizeQueryableLayerUrl(String(layer?.url || "")) === target) {
      return layer;
    }
  }

  const roots: any[] = map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  for (const root of roots) {
    if (String(root?.type || "").toLowerCase() !== "map-image") continue;
    const subs =
      root.allSublayers?.toArray?.() || root.sublayers?.toArray?.() || [];
    for (const sub of subs) {
      if (
        isQueryableFieldLayer(sub) &&
        normalizeQueryableLayerUrl(String(sub?.url || "")) === target
      ) {
        return sub;
      }
    }
  }
  return null;
}
/** @deprecated Prefer findQueryableLayerOnMapByUrl — numeric ids collide across Map Services. */
export function findQueryableLayerOnMapById(map: any, layerId: string): any | null {
  const id = String(layerId ?? "").trim();
  if (!map || !id) return null;

  const matches: any[] = [];
  for (const layer of getAllFeatureLayersFromMap(map)) {
    if (String(layer?.id ?? "") === id) matches.push(layer);
  }

  const roots: any[] = map.allLayers?.toArray?.() || map.layers?.toArray?.() || [];
  for (const root of roots) {
    if (String(root?.type || "").toLowerCase() !== "map-image") continue;
    const subs =
      root.allSublayers?.toArray?.() || root.sublayers?.toArray?.() || [];
    for (const sub of subs) {
      if (String(sub?.id ?? "") === id && isQueryableFieldLayer(sub)) {
        matches.push(sub);
      }
    }
  }

  if (matches.length === 1) return matches[0];
  return null;
}
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
  map: any,
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
      (l: any) => l?.title || l?.url || l?.id,
    ),
  });

  const candidates: Array<{
    title: string;
    matchesYear: boolean;
    matchesRegion: boolean;
    visible: boolean;
  }> = [];
  // Prepare DE / parents first, then flip visibility. Starting the MapImage
  // export only after definitionExpression is set avoids a wasted first
  // export against the service default (often "1=0" or unfiltered).
  const pendingShow: any[] = [];

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

        let parent = (layer as any)?.parent;
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
      ).map((l: any) => `${l?.type || "?"}:${l?.title || l?.id || "?"}`);
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
  map: any,
  yil: string,
  viloyat?: string,
): Promise<number> {
  if (!map) return 0;
  const year = String(yil || "").trim();
  if (!year) return 0;
  const region = String(viloyat || "").trim();
  const leaves = collectRegionYearLeafLayers(map);
  const parents = new Set<any>();
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
  layer: any,
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
/** Score a title/url/label string for year + region match (shared by map + DS). */
export function scoreHaystackForFilters(
  haystack: string,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
): number {
  const text = String(haystack || "").toLowerCase();
  let score = 0;

  const yil = String(filters.yil ?? "").trim();
  if (yil && /^\d{4}$/.test(yil) && text.includes(yil)) {
    score += 10;
  }

  const viloyat = String(filters.viloyat ?? "").trim();
  if (viloyat) {
    for (const token of getRegionMatchTokens(viloyat)) {
      if (token && text.includes(token)) {
        score += 25;
        break;
      }
    }
  }

  return score;
}
/** True when a layer title/url/label explicitly matches the selected region. */
export function haystackMatchesRegion(haystack: string, viloyat?: string): boolean {
  const value = canonicalizeRegionFilterValue(String(viloyat ?? "").trim());
  if (!value) return false;
  const text = normalizeRegionToken(haystack);
  if (!text) return false;
  return getRegionMatchTokens(value).some((token) => !!token && text.includes(token));
}
/** Infer canonical region display name from a layer/DS title or URL (e.g. "water ferghana 2025"). */
export function inferRegionDisplayFromHaystack(haystack: string): string | null {
  for (const label of Object.values(REGION_SOATO_TO_UZ_NAME)) {
    if (haystackMatchesRegion(haystack, label)) return label;
  }
  return null;
}
export function scoreLayerForFilters(
  layer: any,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
): number {
  const title = String(layer?.title || "").toLowerCase();
  const url = String(layer?.url || "").toLowerCase();
  return scoreHaystackForFilters(`${title} ${url}`, filters);
}
export async function prepareValueIndex(
  layer: any,
  available: string[],
): Promise<void> {
  const key = getQueryUrl(layer);
  if (!key || valueIndexCache.has(key)) return;
  const pending = valueIndexLoading.get(key);
  if (pending) return pending;

  const job = (async () => {
    const index: Record<string, string[]> = {};
    const fields = VALUE_INDEX_FIELDS.filter((f) => hasFieldIn(available, f));
    await Promise.all(
      fields.map(async (f) => {
        try {
          index[f.toLowerCase()] = await distinctValues(layer, f);
        } catch {
          index[f.toLowerCase()] = [];
        }
      }),
    );
    valueIndexCache.set(key, index);
    const sample: Record<string, string[]> = {};
    for (const f of Object.keys(index)) sample[f] = index[f].slice(0, 15);
    flLog("value index loaded", { layer: layerLabel(layer), sample });
  })();
  valueIndexLoading.set(key, job);
  try {
    await job;
  } finally {
    valueIndexLoading.delete(key);
  }
}
/** Build an OR clause matching `value` (+ variants) across the given fields. */
export function textMatchClause(
  fields: string[],
  available: string[],
  value: string,
  layer?: any,
  kind: TextMatchKind = "default",
): string {
  const usable = fields.filter((f) => hasFieldIn(available, f));
  if (!usable.length) return "";

  const terms: string[] = [];
  const seen = new Set<string>();

  const addTerm = (term: string): void => {
    if (!term || seen.has(term)) return;
    seen.add(term);
    terms.push(term);
  };

  if (kind === "region") {
    const canonical = canonicalizeRegionFilterValue(value);
    const soato = isRegionSoatoCode(value)
      ? value.trim()
      : regionDisplayNameToSoato(canonical);

    for (const field of usable) {
      const fl = field.toLowerCase();
      if (fl === "region_id" || fl.endsWith("_id")) {
        const indexed = matchRegionValuesFromIndex(
          layer,
          field,
          canonical,
          soato,
        );
        if (indexed?.length) {
          for (const v of indexed) {
            addTextEqTerms(field, [v], layer, v, addTerm);
          }
        } else if (soato) {
          const kind = layerFieldKind(layer, field);
          if (kind === "numeric") {
            addTerm(`${field}=${Number(soato)}`);
          } else {
            addTerm(`${field}='${escapeArcGIS(soato)}'`);
          }
        }
        continue;
      }
      if (fl === "viloyat") {
        const indexed = matchRegionValuesFromIndex(
          layer,
          field,
          canonical,
          soato,
        );
        if (indexed?.length) {
          for (const v of indexed) {
            addTextEqTerms(field, [v], layer, v, addTerm);
          }
        } else {
          addTextEqTerms(
            field,
            expandRegionVariants(canonical),
            layer,
            canonical,
            addTerm,
          );
        }
      }
    }

    if (!terms.length && canonical) {
      addTextEqTerms(
        usable[0],
        expandRegionVariants(canonical),
        layer,
        canonical,
        addTerm,
      );
    }
  } else {
    const literals = literalVariantsForMatch(value, kind);
    if (!literals.length) return "";
    for (const field of usable) {
      addTextEqTerms(field, literals, layer, value, addTerm);
    }
  }

  if (!terms.length) return "";
  return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
}
/**
 * WHERE for crop picker → map / min-max / stats.
 * Matches display name on `crop` only; numeric (or typed) id on `crop_id`.
 * Never compares crop names against a numeric `crop_id` field.
 */
export function buildCropSelectionWhere(
  cropType: string,
  cropId: string | undefined | null,
  available: string[],
  layer?: any,
): string {
  const clauses: string[] = [];

  const buildIdClause = (): string => {
    const id = String(cropId ?? "").trim();
    if (!id) return "";
    if (available.length && !hasFieldIn(available, "crop_id")) return "";

    const terms: string[] = [];
    const seen = new Set<string>();
    const addTerm = (term: string): void => {
      if (!term || seen.has(term)) return;
      seen.add(term);
      terms.push(term);
    };
    const kind = layerFieldKind(layer, "crop_id");
    if (/^\d+$/.test(id)) {
      if (kind === "numeric") {
        addTerm(`crop_id=${Number(id)}`);
      } else if (kind === "string") {
        addTerm(`crop_id='${escapeArcGIS(id)}'`);
      } else {
        addTerm(`crop_id=${Number(id)}`);
      }
    } else if (available.length) {
      addTextEqTerms("crop_id", [id], layer, id, addTerm);
    }
    if (!terms.length) return "";
    return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
  };

  const buildNameClause = (): string => {
    const name = String(cropType ?? "").trim();
    if (!name) return "";
    if (available.length && !hasFieldIn(available, "crop")) return "";

    if (available.length) {
      return textMatchClause(["crop"], available, name, layer);
    }
    const literals = apostropheVariants(name);
    if (!literals.length) return "";
    if (literals.length === 1) {
      return `crop='${escapeArcGIS(literals[0])}'`;
    }
    return `(${literals
      .map((v) => `crop='${escapeArcGIS(v)}'`)
      .join(" OR ")})`;
  };

  const idClause = buildIdClause();
  const nameClause = buildNameClause();
  if (idClause) clauses.push(idClause);
  if (nameClause) clauses.push(nameClause);

  if (!clauses.length) return "";
  return clauses.length === 1 ? clauses[0] : `(${clauses.join(" OR ")})`;
}
/** Fast feature count for layer selection (shared one-hour cache). */
export async function quickLayerFeatureCount(
  layer: any,
  where: string,
): Promise<number> {
  return countWhere(layer, where);
}
/** Count features matching the WHERE clause (shared one-hour cache). */
export async function countWhere(layer: any, where: string): Promise<number> {
  const w = where || "1=1";
  const key = cacheKey(layer, "count", w);
  const now = Date.now();
  pruneAgriQueryCache(now);
  const hit = queryCountCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const job = countWhereUncached(layer, w);
  queryCountCache.set(key, { expires: now + QUERY_CACHE_TTL_MS, value: job });
  return job;
}
/**
 * Region+year scoped layers may not store UI mavsum labels (e.g. Samarqand 2025).
 * Combined layers (e.g. test_gusniddin) may also store different mavsum/type_id values.
 * When strict WHERE returns 0 rows, retry without mavsum and/or land type.
 */
export async function pickWhereWithMavsumFallback(
  layer: any,
  strictWhere: string,
  relaxedWhere: string,
  options?: { regionScoped?: boolean; allowRelax?: boolean },
): Promise<PickWhereWithMavsumFallbackResult> {
  const strict = String(strictWhere || "1=1").trim();
  const relaxed = String(relaxedWhere || strict).trim();
  const allowRelax = options?.allowRelax !== false && relaxed !== strict;

  const strictCount = await countWhere(layer, strict);
  if (strictCount > 0 || !allowRelax) {
    return { where: strict, count: strictCount, mavsumRelaxed: false };
  }

  const relaxedCount = await countWhere(layer, relaxed);
  if (relaxedCount > 0) {
    flLog("pickWhereWithMavsumFallback relaxed", {
      layer: layerLabel(layer),
      strictCount,
      relaxedCount,
      strictPreview:
        strict.length > 120 ? `${strict.slice(0, 120)}…` : strict,
    });
    return { where: relaxed, count: relaxedCount, mavsumRelaxed: true };
  }

  return { where: strict, count: strictCount, mavsumRelaxed: false };
}
async function runStatsQuery(
  layer: any,
  where: string,
  outStatistics: Array<Record<string, unknown>>,
  groupBy?: string[],
): Promise<Array<Record<string, any>>> {
  const w = where || "1=1";
  const payload = JSON.stringify({ outStatistics, groupBy: groupBy || [] });
  const key = cacheKey(layer, "stats", `${w}|${payload}`);
  const now = Date.now();
  pruneAgriQueryCache(now);
  const hit = queryStatsCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const job = runStatsQueryUncached(layer, w, outStatistics, groupBy);
  queryStatsCache.set(key, { expires: now + QUERY_CACHE_TTL_MS, value: job });
  return job;
}
/** SUM of a single field for the WHERE clause. */
export async function sumField(
  layer: any,
  where: string,
  field: string,
): Promise<number> {
  const rows = await runStatsQuery(layer, where, [
    {
      statisticType: "sum",
      onStatisticField: field,
      outStatisticFieldName: "stat_v",
    },
  ]);
  const attrs = rows[0] || {};
  const val =
    attrs.stat_v ?? attrs.STAT_V ?? Object.values(attrs)[0];
  return Number(val) || 0;
}
/** SUM of several fields in one query. Returns a map field->sum. */
export async function sumFields(
  layer: any,
  where: string,
  fields: string[],
): Promise<Record<string, number>> {
  const rows = await runStatsQuery(
    layer,
    where,
    fields.map((f, i) => ({
      statisticType: "sum",
      onStatisticField: f,
      outStatisticFieldName: `s${i}`,
    })),
  );
  const attrs: Record<string, any> = rows[0] || {};
  const lowerAttrs: Record<string, any> = {};
  for (const k of Object.keys(attrs)) lowerAttrs[k.toLowerCase()] = attrs[k];
  const out: Record<string, number> = {};
  fields.forEach((f, i) => {
    out[f] = Number(lowerAttrs[`s${i}`]) || 0;
  });
  return out;
}
/** MEDIAN of a field. Tries percentile_cont, falls back to client-side. */
export async function medianField(
  layer: any,
  where: string,
  field: string,
): Promise<number> {
  // 1) Server-side percentile_cont (ArcGIS 10.9.1+)
  const rows = await runStatsQuery(layer, where, [
    {
      statisticType: "percentile_cont",
      onStatisticField: field,
      outStatisticFieldName: "stat_med",
      statisticParameters: { value: 0.5 },
    },
  ]);
  const attrs: Record<string, any> = rows[0] || {};
  for (const k of Object.keys(attrs)) {
    if (k.toLowerCase() === "stat_med" && attrs[k] !== null) {
      return Number(attrs[k]) || 0;
    }
  }

  // 2) Client-side median over non-null values (JSON to avoid PBF issues)
  const w = `(${where || "1=1"}) AND ${field} IS NOT NULL`;
  try {
    const data = await queryLayerJson(layer, {
      where: w,
      returnGeometry: false,
      outFields: field,
      resultRecordCount: 4000,
    });
    const values = (data?.features || [])
      .map((feat: any) => Number(feat?.attributes?.[field]))
      .filter((n: number) => Number.isFinite(n))
      .sort((a: number, b: number) => a - b);
    flLog("median client-side", {
      layer: layerLabel(layer),
      where: w,
      field,
      valueCount: values.length,
    });
    if (!values.length) return 0;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  } catch (err: any) {
    flLog("median client-side FAILED", {
      layer: layerLabel(layer),
      field,
      error: String(err?.message || err),
    });
    return 0;
  }
}
/** Group by a field and SUM another. Returns sorted [{name, total}] desc. */
export async function sumByGroup(
  layer: any,
  where: string,
  groupField: string,
  sumF: string,
): Promise<Array<{ name: string; total: number }>> {
  const rows = await runStatsQuery(
    layer,
    where,
    [
      {
        statisticType: "sum",
        onStatisticField: sumF,
        outStatisticFieldName: "stat_total",
      },
    ],
    [groupField],
  );
  return rows
    .map((a: Record<string, any>) => {
      const lower: Record<string, any> = {};
      for (const k of Object.keys(a)) lower[k.toLowerCase()] = a[k];
      return {
        name: String(lower[groupField.toLowerCase()] ?? "").trim(),
        total: Number(lower.stat_total) || 0,
      };
    })
    .filter((row) => row.name && row.total > 0)
    .sort((a, b) => b.total - a.total);
}
/**
 * Group by crop_id (or any field): count, AVG of numeric field, MAX of label.
 * Single server round-trip — works when percentile_cont+groupBy does not.
 */
export async function cropStatsByGroup(
  layer: any,
  where: string,
  groupField: string,
  valueField?: string,
  labelField?: string,
): Promise<
  Array<{ id: string; label: string; count: number; avg: number }>
> {
  const oidField =
    String(layer?.objectIdField || "objectid").trim() || "objectid";
  const stats: Array<Record<string, unknown>> = [
    {
      statisticType: "count",
      onStatisticField: oidField,
      outStatisticFieldName: "stat_cnt",
    },
  ];
  if (valueField) {
    stats.push({
      statisticType: "avg",
      onStatisticField: valueField,
      outStatisticFieldName: "stat_avg",
    });
  }
  if (labelField) {
    stats.push({
      statisticType: "max",
      onStatisticField: labelField,
      outStatisticFieldName: "stat_label",
    });
  }
  const rows = await runStatsQuery(layer, where, stats, [groupField]);
  return rows
    .map((a: Record<string, any>) => {
      const lower: Record<string, any> = {};
      for (const k of Object.keys(a)) lower[k.toLowerCase()] = a[k];
      const id = String(lower[groupField.toLowerCase()] ?? "").trim();
      return {
        id,
        label: String(lower.stat_label ?? "").trim() || id,
        count: Number(lower.stat_cnt) || 0,
        avg: Number(lower.stat_avg) || 0,
      };
    })
    .filter((row) => row.id && row.count > 0);
}
