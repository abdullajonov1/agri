import { type QueriableDataSource } from "jimu-core";
import {
  buildAgriWhere,
  canonicalizeRegionFilterValue,
  disableLayerPbf,
  flLog,
  haystackMatchesRegion,
  haystackMatchesYear,
  getQueryableLayer,
  pickYearRegionLayerPool,
  prepareValueIndex,
  quickLayerFeatureCount,
  resolveFeatureLayerForFilters,
  safeLoadMapLayer,
  scoreHaystackForFilters,
  type AgriFilters,
  type ResolvedFeatureLayer,
} from "./feature-layer-data";
import {
  type AgriLayerLike,
  type AgriMapViewHostLike,
  layerFieldNameList,
} from "./agri-layer-types";

/** Immutable (asMutable) or Collection (toArray) wrappers around a list. */
interface PlainArraySource {
  asMutable?: (options: { deep: boolean }) => unknown;
  toArray?: () => unknown;
}

/** `useDataSources` entry — only the id is read here. */
interface UseDataSourceIdLike {
  dataSourceId?: string | null;
}

/** Feature-layer-backed data sources expose `layer` (or the private `_layer`). */
type LayerBackedDataSource = QueriableDataSource & {
  layer?: AgriLayerLike | null;
  _layer?: AgriLayerLike | null;
};

const dsLayer = (ds: QueriableDataSource): AgriLayerLike | null | undefined => {
  const backed = ds as LayerBackedDataSource;
  return backed.layer || backed._layer;
};

/**
 * Plain array from an array / Immutable list / esri Collection. Element type
 * `T` is the caller's claim about the list contents (not checked at runtime).
 */
export function toPlainArray<T = unknown>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  const source = val as PlainArraySource;
  if (typeof source.asMutable === "function")
    return source.asMutable({ deep: true }) as T[];
  if (typeof source.toArray === "function") return source.toArray() as T[];
  return [];
}

export function getSelectedDsIds(useDataSources: unknown): string[] {
  const uds = toPlainArray<UseDataSourceIdLike | null | undefined>(useDataSources);
  const ids = uds
    .map((u) => u?.dataSourceId)
    .filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}

type ScoredDs = {
  ds: QueriableDataSource;
  score: number;
  regionMatch: boolean;
};

/**
 * Resolves the active FeatureLayer for dashboard widgets.
 * Prefers EXB DataSources (same path as AgriLocalization),
 * falls back to JimuMapView map layers.
 */
export class AgriDataSourceEngine {
  private dsById: Record<string, QueriableDataSource> = {};
  private selectedIds: string[] = [];
  private resolveCache = new Map<
    string,
    Promise<ResolvedFeatureLayer | null>
  >();

  onDsCreated(ds: QueriableDataSource, ids: string[]): void {
    if (!ds?.id) return;
    this.dsById[ds.id] = ds;
    this.selectedIds = [...ids];
    this.resolveCache.clear();
  }

  syncSelection(ids: string[]): void {
    this.selectedIds = [...ids];
    this.resolveCache.clear();
  }

  clearResolveCache(): void {
    this.resolveCache.clear();
  }

  /** True while selected data sources are still connecting (no map fallback yet). */
  isResolvePending(jimuMapView: AgriMapViewHostLike | null | undefined): boolean {
    if (jimuMapView?.view?.map) return false;
    if (!this.selectedIds.length) return false;
    const connected = this.selectedIds.filter((id) => !!this.dsById[id]).length;
    return connected < this.selectedIds.length;
  }

  hasConnectedSources(): boolean {
    return this.selectedIds.some((id) => !!this.dsById[id]);
  }

  getLayerFromDs(ds: QueriableDataSource): AgriLayerLike | null {
    return getQueryableLayer(dsLayer(ds));
  }

  private getDsHaystack(ds: QueriableDataSource): string {
    const layer = dsLayer(ds);
    const title = String(layer?.title || "");
    const url = String(layer?.url || ds.getDataSourceJson?.()?.url || "");
    const label = String(
      ds.getLabel?.() ||
        ds.getDataSourceJson?.()?.label ||
        ds.getDataSourceJson?.()?.sourceLabel ||
        "",
    );
    return `${title} ${url} ${label}`;
  }

  private buildRegionProbeWhere(
    filters: Pick<AgriFilters, "yil" | "viloyat">,
    layer: AgriLayerLike,
    fields: string[],
    regionScoped: boolean,
    yearScoped: boolean,
  ): string {
    return buildAgriWhere(
      {
        yil: filters.yil,
        viloyat: filters.viloyat,
        skipRegionFilter: regionScoped,
        skipYearFilter: yearScoped,
      },
      fields,
      layer,
    );
  }

  private async pickBestDsByCount(
    pool: ScoredDs[],
    filters: Pick<AgriFilters, "yil" | "viloyat">,
    preferredDs: QueriableDataSource | null,
  ): Promise<ScoredDs | null> {
    if (!pool.length) return null;
    if (!String(filters.viloyat ?? "").trim() || pool.length === 1) {
      return pool[0];
    }

    const scored: Array<{ item: ScoredDs; count: number }> = [];
    const tryItem = async (item: ScoredDs): Promise<void> => {
      const layer = this.getLayerFromDs(item.ds);
      if (!layer) return;
      try {
        await safeLoadMapLayer(layer);
      } catch {
        /* ignore */
      }
      const fields: string[] = layerFieldNameList(layer);
      const where = this.buildRegionProbeWhere(
        filters,
        layer,
        fields,
        item.regionMatch,
        haystackMatchesYear(this.getDsHaystack(item.ds), filters.yil),
      );
      const count = await quickLayerFeatureCount(layer, where);
      scored.push({ item, count });
    };

    if (preferredDs) {
      const preferred = pool.find((p) => p.ds.id === preferredDs.id);
      if (preferred) {
        await tryItem(preferred);
        const preferredCount = scored[0]?.count ?? -1;
        if (preferredCount > 0) return preferred;
      }
    }

    const remaining = pool.filter(
      (p) => !preferredDs || p.ds.id !== preferredDs.id,
    );
    await Promise.all(remaining.map((item) => tryItem(item)));

    const positive = scored
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count);
    if (positive.length) return positive[0].item;

    return (
      scored.find((s) => s.count >= 0)?.item ||
      pool.find((p) => p.ds.id === preferredDs?.id) ||
      pool[0]
    );
  }

  async resolveFromDataSources(
    filters: Pick<AgriFilters, "yil" | "viloyat">,
  ): Promise<ResolvedFeatureLayer | null> {
    const normalizedFilters = {
      yil: filters.yil,
      viloyat: canonicalizeRegionFilterValue(String(filters.viloyat ?? "").trim()),
    };
    const wantsRegion = !!normalizedFilters.viloyat;
    const scored: ScoredDs[] = [];

    for (const id of this.selectedIds) {
      const ds = this.dsById[id];
      if (!ds || !this.getLayerFromDs(ds)) continue;
      const haystack = this.getDsHaystack(ds);
      scored.push({
        ds,
        score: scoreHaystackForFilters(haystack, normalizedFilters),
        regionMatch: haystackMatchesRegion(haystack, normalizedFilters.viloyat),
      });
    }

    if (!scored.length) return null;

    const pool = pickYearRegionLayerPool(
      scored,
      scored.length,
      normalizedFilters,
      (item) => this.getDsHaystack(item.ds),
    );
    if (!pool.length) return null;

    let bestScore = -1;
    let scoreWinner: ScoredDs | null = null;
    for (const item of pool) {
      if (item.score > bestScore) {
        bestScore = item.score;
        scoreWinner = item;
      }
    }

    const preferredDs = scoreWinner?.ds || null;
    const bestItem =
      wantsRegion && pool.length > 1
        ? await this.pickBestDsByCount(pool, normalizedFilters, preferredDs)
        : scoreWinner;

    const bestDs = bestItem?.ds || preferredDs;
    if (!bestDs) return null;

    const layer = this.getLayerFromDs(bestDs);
    if (!layer) return null;

    try {
      await safeLoadMapLayer(layer);
    } catch {
      /* layer may already be loaded */
    }
    disableLayerPbf(layer);

    const fields: string[] = layerFieldNameList(layer);
    const regionMatch = bestItem?.regionMatch ?? false;
    const regionScoped = regionMatch || (bestItem?.score ?? 0) >= 25;
    const haystack = this.getDsHaystack(bestDs);
    const yearScoped = haystackMatchesYear(haystack, normalizedFilters.yil);

    flLog("resolve via DataSource", {
      filters: normalizedFilters,
      dsId: bestDs.id,
      layerTitle: layer?.title || layer?.url || null,
      score: bestItem?.score ?? bestScore,
      regionScoped,
      yearScoped,
      fieldCount: fields.length,
      countBased: wantsRegion && pool.length > 1,
    });
    void prepareValueIndex(layer, fields);
    return {
      layer,
      fields,
      regionScoped,
      yearScoped,
    };
  }

  async resolve(
    filters: Pick<AgriFilters, "yil" | "viloyat">,
    jimuMapView: AgriMapViewHostLike | null | undefined,
  ): Promise<ResolvedFeatureLayer | null> {
    const cacheKey = JSON.stringify({
      yil: filters.yil || "",
      viloyat: canonicalizeRegionFilterValue(String(filters.viloyat ?? "").trim()),
      ids: this.selectedIds,
      mapReady: !!jimuMapView,
    });
    const pending = this.resolveCache.get(cacheKey);
    if (pending) return pending;

    const job = this.resolveInternal(filters, jimuMapView);
    this.resolveCache.set(cacheKey, job);
    try {
      return await job;
    } finally {
      if (this.resolveCache.get(cacheKey) === job) {
        this.resolveCache.delete(cacheKey);
      }
    }
  }

  private async resolveInternal(
    filters: Pick<AgriFilters, "yil" | "viloyat">,
    jimuMapView: AgriMapViewHostLike | null | undefined,
  ): Promise<ResolvedFeatureLayer | null> {
    const fromDs = await this.resolveFromDataSources(filters);
    if (fromDs) return fromDs;
    if (!jimuMapView) {
      flLog("resolve FAILED (no DS layer, no map view)", {
        filters,
        selectedIds: this.selectedIds,
        connectedIds: this.selectedIds.filter((id) => !!this.dsById[id]),
      });
      return null;
    }
    const fromMap = await resolveFeatureLayerForFilters(jimuMapView, filters);
    flLog("resolve via Map", {
      filters,
      layerTitle: fromMap?.layer?.title || fromMap?.layer?.url || null,
      regionScoped: fromMap?.regionScoped ?? null,
      yearScoped: fromMap?.yearScoped ?? null,
      found: !!fromMap,
    });
    if (fromMap?.layer) {
      void prepareValueIndex(fromMap.layer, fromMap.fields);
    }
    return fromMap;
  }
}
