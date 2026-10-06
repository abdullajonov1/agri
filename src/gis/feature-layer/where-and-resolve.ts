import { collectRegionYearLeafLayers, getAllFeatureLayersFromMap, canonicalizeRegionFilterValue, buildFarmerTaxWhere, buildLandTypeWhere } from "./layer-lookup";
import { haystackMatchesYear, getMapImageParentLayer, type AgriFilters, type ResolvedFeatureLayer, pickYearRegionLayerPool, safeLoadMapLayer, disableLayerPbf, hasFieldIn, exactOrClause, getMavsumGroupedValues, normalizeFarmerTaxSearchValue, hasActiveLandTypeFilter, matchIndexedValues, buildEfficiencyRangeWhere, type PickWhereProgressiveResult, flLog, layerLabel } from "./primitives";
import { haystackMatchesRegion, preloadRegionYearMapImages, scoreLayerForFilters, textMatchClause, buildCropSelectionWhere, countWhere, pickWhereWithMavsumFallback, medianField } from "./map-and-stats";
import { escapeArcGIS } from "../../data/agri-sql";

/**
 * Wait for region-year MapImage metadata up to `maxWaitMs`, then reveal.
 * Never blocks forever on cold layer.load() — but unlike fire-and-forget
 * preload, this usually completes before the first export so layerDefs stick.
 *
 * `timedOut`: wait raced out before preload settled — caller should re-export
 * after `preload` finishes. When false, skip the late refresh (avoids canceled
 * duplicate MapServer `export` requests).
 */
export async function ensureRegionYearMapImagesReady(
  map: any,
  yil: string,
  viloyat?: string,
  maxWaitMs = 2000,
): Promise<{ timedOut: boolean; preload: Promise<number> }> {
  if (!map || maxWaitMs <= 0) {
    return { timedOut: false, preload: Promise.resolve(0) };
  }
  const year = String(yil || "").trim();
  if (!year) {
    return { timedOut: false, preload: Promise.resolve(0) };
  }
  const region = String(viloyat || "").trim();
  const leaves = collectRegionYearLeafLayers(map);
  let needsLoad = false;
  const parents = new Set<any>();
  for (const layer of leaves) {
    const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
    if (!haystackMatchesYear(haystack, year)) continue;
    if (region && !haystackMatchesRegion(haystack, region)) continue;
    const parent = getMapImageParentLayer(layer) || layer;
    if (!parent) continue;
    parents.add(parent);
    if (typeof parent?.load === "function" && !parent.loaded) {
      needsLoad = true;
    }
  }
  // Repeat visit: metadata is already warm — don't stall zoom for 2s.
  const effectiveWait = needsLoad ? maxWaitMs : Math.min(maxWaitMs, 400);
  let settled = false;
  const preload = preloadRegionYearMapImages(map, yil, viloyat).then((n) => {
    settled = true;
    return n;
  });
  let timedOut = false;
  await Promise.race([
    preload.then((): undefined => undefined),
    new Promise<void>((resolve) =>
      setTimeout(() => {
        if (!settled) timedOut = true;
        resolve();
      }, effectiveWait),
    ),
  ]);
  void preload.catch((): undefined => undefined);
  return { timedOut, preload };
}
/**
 * Pick the best feature layer for the current year/region filters.
 * In multi-layer apps (one layer per region+year), this avoids querying
 * the wrong layer (e.g. Kashkadarya when Farg'ona is selected).
 */
export async function resolveFeatureLayerForFilters(
  jimuMapView: any,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
): Promise<ResolvedFeatureLayer | null> {
  if (!jimuMapView?.view?.map) return null;
  try {
    const candidates = getAllFeatureLayersFromMap(jimuMapView.view.map);
    if (!candidates.length) return null;

    const wantsRegion = !!String(filters.viloyat ?? "").trim();
    const scored = candidates.map((candidate) => {
      const haystack = `${String(candidate?.title || "")} ${String(candidate?.url || "")}`;
      return {
        candidate,
        score: scoreLayerForFilters(candidate, filters),
        regionMatch: haystackMatchesRegion(haystack, filters.viloyat),
      };
    });

    const pool = pickYearRegionLayerPool(
      scored,
      candidates.length,
      filters,
      (item) =>
        `${String(item.candidate?.title || "")} ${String(item.candidate?.url || "")}`,
    );
    if (!pool.length) return null;

    let best: any = null;
    let bestScore = -1;
    let bestRegionMatch = false;
    for (const item of pool) {
      const { candidate, score, regionMatch } = item;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
        bestRegionMatch = regionMatch;
      }
    }

    const layer = best || pool[0]?.candidate || candidates[0];
    await safeLoadMapLayer(layer);
    disableLayerPbf(layer);
    const fields: string[] = (layer.fields || []).map((f: any) => f.name);
    const haystack = `${String(layer?.title || "")} ${String(layer?.url || "")}`;
    return {
      layer,
      fields,
      regionScoped: bestRegionMatch || bestScore >= 25,
      yearScoped: haystackMatchesYear(haystack, filters.yil),
    };
  } catch {
    return null;
  }
}
/** Resolve the first feature layer from a JimuMapView, loaded and ready. */
export async function getFeatureLayerFromView(
  jimuMapView: any,
  filters?: Pick<AgriFilters, "yil" | "viloyat">,
): Promise<{ layer: any; fields: string[] } | null> {
  if (filters?.yil || filters?.viloyat) {
    const resolved = await resolveFeatureLayerForFilters(jimuMapView, filters);
    if (!resolved) return null;
    return { layer: resolved.layer, fields: resolved.fields };
  }

  if (!jimuMapView?.view?.map) return null;
  try {
    const candidates = getAllFeatureLayersFromMap(jimuMapView.view.map);
    const layer = candidates[0];
    if (!layer) return null;
    await safeLoadMapLayer(layer);
    const fields: string[] = (layer.fields || []).map((f: any) => f.name);
    return { layer, fields };
  } catch {
    return null;
  }
}
/**
 * Build the WHERE clause from filters using FeatureLayer fields only.
 * `available` is the list of field names present on the layer.
 */
export function buildAgriWhere(
  filters: AgriFilters,
  available: string[],
  layer?: any,
): string {
  const clauses: string[] = [];
  const push = (clause: string): void => {
    if (clause) clauses.push(clause);
  };

  const yil = String(filters.yil ?? "").trim();
  if (yil && !filters.skipYearFilter && /^\d{4}$/.test(yil)) {
    if (hasFieldIn(available, "year")) push(`year='${escapeArcGIS(yil)}'`);
    else if (hasFieldIn(available, "yil")) push(`yil=${Number(yil)}`);
  }

  if (filters.viloyat && !filters.skipRegionFilter)
    push(
      textMatchClause(
        ["region_id", "viloyat"],
        available,
        canonicalizeRegionFilterValue(filters.viloyat),
        layer,
        "region",
      ),
    );
  if (filters.tuman)
    push(
      textMatchClause(
        ["distrct_id", "district_id", "tuman"],
        available,
        filters.tuman,
        layer,
        "district",
      ),
    );
  if (filters.mavsumOrValues?.length) {
    push(
      exactOrClause(
        ["season_id", "mavsum"],
        filters.mavsumOrValues,
        available,
      ),
    );
  } else if (filters.mavsum) {
    const groupedMavsumValues = getMavsumGroupedValues(filters.mavsum);
    push(
      groupedMavsumValues.length > 1
        ? exactOrClause(
            ["season_id", "mavsum"],
            groupedMavsumValues,
            available,
          )
        : textMatchClause(
            ["season_id", "mavsum"],
            available,
            filters.mavsum,
            layer,
          ),
    );
  }
  const farmerTax = normalizeFarmerTaxSearchValue(
    String(filters.farmerTax ?? ""),
  );
  if (farmerTax) {
    push(buildFarmerTaxWhere(farmerTax, available, layer));
  } else if (filters.fermer) {
    push(textMatchClause(["full_name"], available, filters.fermer, layer));
  }
  if (filters.crop || filters.cropId) {
    push(
      buildCropSelectionWhere(
        String(filters.crop ?? ""),
        filters.cropId,
        available,
        layer,
      ),
    );
  }
  if (hasActiveLandTypeFilter(filters.yerTuri, filters.yerTuriId)) {
    push(
      buildLandTypeWhere(
        filters.yerTuri,
        filters.yerTuriId,
        available,
        layer,
      ),
    );
  }
  if (filters.manba)
    push(textMatchClause(["real_name"], available, filters.manba, layer));
  if (filters.kanal)
    push(textMatchClause(["real_n1"], available, filters.kanal, layer));

  const mm = String(filters.minMax ?? "").trim().toLowerCase();
  if (mm && hasFieldIn(available, "minmax")) {
    const valuesFor = (want: string): string[] => {
      const matched = matchIndexedValues(layer, "minmax", want);
      if (matched && matched.length) return matched;
      return [want.charAt(0).toUpperCase() + want.slice(1)];
    };
    const eq = (vals: string[]): string =>
      vals.length === 1
        ? `minmax='${escapeArcGIS(vals[0])}'`
        : `(${vals.map((v) => `minmax='${escapeArcGIS(v)}'`).join(" OR ")})`;
    if (mm === "both")
      push(`(${eq(valuesFor("min"))} OR ${eq(valuesFor("max"))})`);
    else if (mm === "min") push(eq(valuesFor("min")));
    else if (mm === "max") push(eq(valuesFor("max")));
    else push(`minmax='${escapeArcGIS(String(filters.minMax))}'`);
  }

  if (filters.effMin != null || filters.effMax != null) {
    const effWhere = buildEfficiencyRangeWhere(
      filters.effMin,
      filters.effMax,
      available,
    );
    if (effWhere) push(effWhere);
  }

  return clauses.length ? clauses.join(" AND ") : "1=1";
}
/** Try strict WHERE, then drop mavsum and/or land type when count is 0. */
export async function pickWhereWithProgressiveFallback(
  layer: any,
  filters: AgriFilters,
  available: string[],
  options?: {
    regionScoped?: boolean;
    yearScoped?: boolean;
    polygonFilter?: string;
    allowMavsumRelax?: boolean;
    allowLandTypeRelax?: boolean;
  },
): Promise<PickWhereProgressiveResult> {
  const build = (overrides: Partial<AgriFilters>): string => {
    const merged = { ...filters, ...overrides };
    let where = buildAgriWhere(
      {
        ...merged,
        skipRegionFilter: options?.regionScoped,
        skipYearFilter: options?.yearScoped,
      },
      available,
      layer,
    );
    const polygon = String(options?.polygonFilter || "").trim();
    if (polygon) where = `(${where}) AND (${polygon})`;
    return where || "1=1";
  };

  const hasMavsum = !!String(filters.mavsum || "").trim();
  const hasLandType = hasActiveLandTypeFilter(
    filters.yerTuri,
    filters.yerTuriId,
  );
  const hasTuman = !!String(filters.tuman || "").trim();
  const allowMavsum = options?.allowMavsumRelax !== false && !hasTuman;
  const allowLandType = options?.allowLandTypeRelax !== false && !hasTuman;

  const attempts: Array<{
    where: string;
    mavsumRelaxed: boolean;
    landTypeRelaxed: boolean;
  }> = [
    { where: build({}), mavsumRelaxed: false, landTypeRelaxed: false },
  ];

  if (hasMavsum && allowMavsum) {
    attempts.push({
      where: build({ mavsum: "" }),
      mavsumRelaxed: true,
      landTypeRelaxed: false,
    });
  }
  if (hasLandType && allowLandType) {
    attempts.push({
      where: build({ yerTuri: "", yerTuriId: "" }),
      mavsumRelaxed: false,
      landTypeRelaxed: true,
    });
  }
  if (hasMavsum && hasLandType && allowMavsum && allowLandType) {
    attempts.push({
      where: build({ mavsum: "", yerTuri: "", yerTuriId: "" }),
      mavsumRelaxed: true,
      landTypeRelaxed: true,
    });
  }

  const seen = new Set<string>();
  let lastCount = 0;
  let lastWhere = attempts[0].where;

  for (const attempt of attempts) {
    if (seen.has(attempt.where)) continue;
    seen.add(attempt.where);
    const count = await countWhere(layer, attempt.where);
    lastCount = count;
    lastWhere = attempt.where;
    if (count > 0) {
      if (attempt.mavsumRelaxed || attempt.landTypeRelaxed) {
        flLog("pickWhereWithProgressiveFallback relaxed", {
          layer: layerLabel(layer),
          count,
          mavsumRelaxed: attempt.mavsumRelaxed,
          landTypeRelaxed: attempt.landTypeRelaxed,
          wherePreview:
            attempt.where.length > 120
              ? `${attempt.where.slice(0, 120)}…`
              : attempt.where,
        });
      }
      return { ...attempt, count };
    }
  }

  return {
    where: lastWhere,
    count: lastCount,
    mavsumRelaxed: false,
    landTypeRelaxed: false,
  };
}
/** Median with mavsum relaxation when strict WHERE matches no rows. */
export async function medianFieldWithMavsumFallback(
  layer: any,
  strictWhere: string,
  relaxedWhere: string,
  field: string,
  options?: { regionScoped?: boolean },
): Promise<number> {
  const picked = await pickWhereWithMavsumFallback(
    layer,
    strictWhere,
    relaxedWhere,
    options,
  );
  return medianField(layer, picked.where, field);
}
