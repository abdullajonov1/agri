import { getDetachedQueryLayerFor, getMapImageParentLayer, isMapImageGroupSublayer, isMapImageOwnedLayer, safeLoadMapLayer } from "../../../../../gis/feature-layer-data";
import { CROP_RENDERER_ITEMS, createCropFillSymbol, normalizeCropKey, resolveCropRendererColor } from "../../../../localization/crop-renderer";
import { agriLog, debugCatch } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { AgriMapLayer } from "../../../../localization/agri-map-layer";
import { featureAttributes, isPresentValue } from "../../../../localization/agri-map-layer";
import { firstCollectionArray } from "../../../../../gis/agri-layer-types";
import { errorMessage } from "../../../../../shared/agri-plain-object";

export const getCropRendererTargetLayers = (host: LocalizationHost): AgriMapLayer[] => {
  // Only paint layers RegionYear sync currently shows. Never fall back to
  // every map sublayer (that caused ~hundreds of groupBy requests).
  // Test agri leaves are FeatureLayer / MapImage Sublayer with no children —
  // include entry.layer itself when sublayers is empty.
  const candidates: AgriMapLayer[] = [];
  for (const entry of host._lastShownRegionYearLayers || []) {
    const fromEntry = (entry?.sublayers || []).filter(Boolean);
    const loaded = firstCollectionArray(
      entry?.layer?.allSublayers,
      entry?.layer?.sublayers,
    );
    const fromLoaded: AgriMapLayer[] = [];
    for (const sub of loaded) {
      if (sub?.visible !== false && !isMapImageGroupSublayer(sub)) {
        fromLoaded.push(sub);
      }
    }
    if (fromEntry.length || fromLoaded.length) {
      candidates.push(...fromEntry, ...fromLoaded);
    } else if (entry?.layer) {
      candidates.push(entry.layer);
    }
  }

  const seen = new Set<AgriMapLayer>();
  return candidates.filter((layer) => {
    if (!layer || seen.has(layer) || isMapImageGroupSublayer(layer)) {
      return false;
    }
    const where = String(layer?.definitionExpression || "1=1");
    if (layer?.visible === false || where === "1=0") return false;
    seen.add(layer);
    return true;
  });
};

/**
 * Fetch DISTINCT crop attribute values actually present on the (shown)
 * layer. UniqueValueRenderer must use these exact attribute strings as
 * `value` — a fixed transliteration palette never matches DB casing /
 * Cyrillic / apostrophe variants, so every polygon falls through to
 * defaultSymbol (uniform blue-grey).
 */
export const queryDistinctCropValues = async (
  host: LocalizationHost,
  layer: AgriMapLayer,
  field: string,
  where: string,
): Promise<string[]> => {
  const cacheKey = host.cropDistinctCacheKey(layer, field, where);
  if (host._cropDistinctValueCache.has(cacheKey)) {
    return host._cropDistinctValueCache.get(cacheKey) || [];
  }

  // createQuery/queryFeatures on the live MapImage sublayer rehydrates it
  // and can clear its runtime definitionExpression (district filter) —
  // the exact drift seen as definitionExpressionBefore:"" in the click
  // logs. Run the distinct-values query on the detached off-map client.
  const queryTarget: AgriMapLayer =
    ((await getDetachedQueryLayerFor(layer)) as AgriMapLayer | null) || layer;

  let distinctValues: string[] = [];
  try {
    const q: __esri.QueryProperties = queryTarget.createQuery?.() ?? {};
    q.where = where || "1=1";
    q.returnGeometry = false;
    q.outFields = [field];
    q.groupByFieldsForStatistics = [field];
    q.outStatistics = [
      {
        statisticType: "count",
        onStatisticField: field,
        outStatisticFieldName: "cnt",
      },
    ];
    const res = await queryTarget.queryFeatures?.(q);
    distinctValues = (res?.features || [])
      .map((f) => featureAttributes(f)[field])
      .filter(isPresentValue)
      .map((v) => String(v));
  } catch {
    try {
      const q2: __esri.QueryProperties = queryTarget.createQuery?.() ?? {};
      q2.where = where || "1=1";
      q2.returnGeometry = false;
      q2.outFields = [field];
      q2.returnDistinctValues = true;
      q2.num = 200;
      const res2 = await queryTarget.queryFeatures?.(q2);
      distinctValues = (res2?.features || [])
        .map((f) => featureAttributes(f)[field])
        .filter(isPresentValue)
        .map((v) => String(v));
    } catch {
      distinctValues = [];
    }
  }

  distinctValues = Array.from(new Set(distinctValues));
  host._cropDistinctValueCache.set(cacheKey, distinctValues);
  return distinctValues;
};

export const refreshCropLayer = (host: LocalizationHost, layer: AgriMapLayer): void => {
  // MapImage dynamic drawing is owned by the parent service layer —
  // refreshing both leaf + parent aborts the first export (canceled
  // MapServer `export` / sublayer id rows in DevTools).
  try {
    if (isMapImageOwnedLayer(layer)) {
      const parent =
        getMapImageParentLayer(layer) || layer?.layer || layer;
      parent?.refresh?.();
      return;
    }
    layer.refresh?.();
  } catch {
    /* ignore */
  }
};

export const resetCropRenderer = (host: LocalizationHost): void => {
  host._cropRendererRequestId = (host._cropRendererRequestId || 0) + 1;
  host._cropDistinctValueCache.clear();
  const renderedLayers =
    host._cropRenderedLayers instanceof Set
      ? host._cropRenderedLayers
      : (host._cropRenderedLayers = new Set<AgriMapLayer>());
  const layers = Array.from(
    new Set<AgriMapLayer>([
      ...host.getCropRendererTargetLayers(),
      ...renderedLayers,
    ]),
  );
  for (const layer of layers) {
    try {
      if (host._originalLayerRenderers.has(layer)) {
        layer.renderer = host._originalLayerRenderers.get(layer) ?? null;
      }
      host.refreshCropLayer(layer);
    } catch (err) {
      debugCatch("cropRenderer:restore-failed", err);
    }
  }
  host._cropRenderedLayers.clear();
};

export const applyCropRenderer = async (host: LocalizationHost, requestId: number): Promise<void> => {
  const layers = host.getCropRendererTargetLayers();
  if (!layers.length) {
    agriLog("cropRenderer:SKIP-no-shown-layers", {
      shownEntries: (host._lastShownRegionYearLayers || []).length,
    });
    return;
  }

  const isCurrent = (): boolean =>
    host._isMounted &&
    host.state.cropRendererMode === "on" &&
    requestId === host._cropRendererRequestId;

  const selectedTurlar = host.getSelectedTurlar();
  const selectedTuriKey =
    selectedTurlar.length === 1 ? normalizeCropKey(selectedTurlar[0]) : "";

  agriLog("cropRenderer:start", {
    layerCount: layers.length,
    selectedTuriKey: selectedTuriKey || null,
    titles: layers.map(
      (l) => l?.title || l?.name || `sublayer-${l?.id}`,
    ),
  });

  for (const layer of layers) {
    if (!isCurrent()) return;
    try {
      // Do NOT load() the live MapImage sublayer for field discovery —
      // hydration can clear its runtime definitionExpression (district
      // filter) and flash other districts. Loading only happens for
      // non-MapImage layers; sublayer field names come from the detached
      // client or the known "turi" fallback below.
      if (
        !layer?.loaded &&
        !isMapImageOwnedLayer(layer) &&
        !isMapImageGroupSublayer(layer)
      ) {
        try {
          await safeLoadMapLayer(layer);
        } catch (err) {
          debugCatch("cropRenderer:load-failed", err);
        }
      }
      if (!isCurrent()) return;

      const field =
        host.findLayerFieldName(layer, "turi") ||
        host.findLayerFieldName(layer, "crop") ||
        host.findLayerFieldName(layer, "ekin_turi") ||
        host.findLayerFieldName(layer, "crop_id") ||
        // MapImage sublayers sometimes expose fields late; turi is the
        // standard crop attribute on agri_* RegionYear services.
        (Array.isArray(layer?.fields) &&
        layer.fields.length > 0
          ? null
          : "turi");
      if (!field) {
        agriLog("cropRenderer:SKIP-no-field", {
          title: layer?.title || layer?.name,
          fieldCount: Array.isArray(layer?.fields)
            ? layer.fields.length
            : 0,
        });
        continue;
      }

      if (!host._originalLayerRenderers.has(layer)) {
        host._originalLayerRenderers.set(layer, layer.renderer ?? null);
      }

      if (selectedTuriKey) {
        if (!isCurrent()) return;
        layer.renderer = {
          type: "simple",
          symbol: createCropFillSymbol(
            resolveCropRendererColor(selectedTuriKey),
          ),
        };
        host._cropRenderedLayers.add(layer);
        host.refreshCropLayer(layer);
        continue;
      }

      const where = layer.definitionExpression || "1=1";
      const distinctValues = await host.queryDistinctCropValues(
        layer,
        field,
        where,
      );
      if (!isCurrent()) return;

      const uniqueValueInfos = host.buildCropUniqueValueInfosFromValues(
        field,
        distinctValues,
      );
      if (!uniqueValueInfos.length) {
        agriLog("cropRenderer:SKIP-no-distinct-values", {
          title: layer?.title || layer?.name,
          field,
          where,
        });
        continue;
      }

      layer.renderer = {
        type: "unique-value",
        field,
        defaultSymbol: createCropFillSymbol("#78909C"),
        uniqueValueInfos,
      };
      host._cropRenderedLayers.add(layer);
      host.refreshCropLayer(layer);

      agriLog("cropRenderer:applied", {
        title: layer?.title || layer?.name,
        field,
        distinctCount: distinctValues.length,
        sampleValues: distinctValues.slice(0, 8),
      });
    } catch (err) {
      agriLog("cropRenderer:FAILED", {
        title: layer?.title || layer?.name,
        error: errorMessage(err),
      });
    }
  }
};

export const syncCropRenderer = async (host: LocalizationHost): Promise<void> => {
  // Crop colors are a permanent map style; every filter/layer change reapplies
  // them to the currently visible live sublayers.
  const requestId = ++host._cropRendererRequestId;
  await host.applyCropRenderer(requestId);
};

/**
 * Paint a best-effort crop palette on shown layers WITHOUT refresh.
 * Lets the first MapImage export (from visibility) already use crop colors
 * instead of waiting for distinct-turi query + a second export.
 */
export const applyInstantCropPaletteNoRefresh = (host: LocalizationHost): void => {
  if (host.state.cropRendererMode !== "on") return;
  if (String(host.state.vh || "").trim()) return;
  const layers = host.getCropRendererTargetLayers();
  if (!layers.length) return;

  const seenLabels = new Set<string>();
  const uniqueValueInfos = CROP_RENDERER_ITEMS.filter((item) => {
    const label = String(item.label || item.value || "").trim();
    if (!label || seenLabels.has(label)) return false;
    seenLabels.add(label);
    return true;
  }).map((item) => ({
    value: item.label || item.value,
    label: item.label || item.value,
    symbol: createCropFillSymbol(item.color),
  }));
  if (!uniqueValueInfos.length) return;

  for (const layer of layers) {
    try {
      const field =
        host.findLayerFieldName(layer, "turi") ||
        host.findLayerFieldName(layer, "crop") ||
        "turi";
      if (!host._originalLayerRenderers.has(layer)) {
        host._originalLayerRenderers.set(layer, layer.renderer ?? null);
      }
      layer.renderer = {
        type: "unique-value",
        field,
        defaultSymbol: createCropFillSymbol("#78909C"),
        uniqueValueInfos,
      };
      host._cropRenderedLayers.add(layer);
    } catch {
      /* ignore */
    }
  }
};
