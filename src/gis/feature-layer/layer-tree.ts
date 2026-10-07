/**
 * Live map layer-tree helpers: classify MapImage / Group / Feature layers,
 * resolve parents and service URLs, clear scale gates, guard sublayer
 * definitionExpressions and refresh MapImage exports.
 */
import { isAgriAdminBoundaryLayer } from "../map-image-predicates";
import { agroV5Log } from "../agri-debug-log";
import {
  type AgriLayerLike,
  type AgriWatchHandle,
  firstCollectionArray,
  readTypeTag,
} from "../agri-layer-types";

// Silent by default. Set `window.__AGRO_V5_DEBUG = true` in the console to
// stream region/year + district filter decisions while reproducing an issue.
export function regionYearLog(phase: string, detail?: Record<string, unknown>): void {
  agroV5Log(phase, detail, "all");
}

const lowerType = (layer: AgriLayerLike | null | undefined): string =>
  String(layer?.type || "").toLowerCase();

/** Direct sublayers, falling back to allSublayers (MapImage roots). */
export function childSublayers(layer: AgriLayerLike | null | undefined): AgriLayerLike[] {
  return firstCollectionArray(layer?.sublayers, layer?.allSublayers);
}

/** ArcGIS map layer id suffix embedded in Experience Builder child DS ids. */
export function extractMapLayerIdFromDsId(dsId: string): string | null {
  const match = String(dsId || "").match(/([0-9a-f]+-layer-\d+)$/i);
  return match ? match[1] : null;
}

/**
 * MapImage "Group Layer" nodes (e.g. title "Agri 2026 republic data").
 * They often expose a /MapServer/N URL and sometimes createQuery stubs, but
 * FeatureLayer#load() rejects them: Source type "Group Layer" is not supported.
 */
export function isMapImageGroupSublayer(layer: AgriLayerLike | null | undefined): boolean {
  if (!layer) return false;
  const type = lowerType(layer);
  const sourceType = String(
    layer.sourceJSON?.type || layer.resourceInfo?.type || readTypeTag(layer.source),
  ).toLowerCase();
  if (sourceType.includes("group")) return true;
  const kidCount =
    layer.sublayers?.length ?? layer.sublayers?.toArray?.()?.length ?? 0;
  if (type === "sublayer" && kidCount > 0) return true;
  // Nested group folders under MapImage also show up as type "group".
  return type === "group";
}

/** Skip Group Layer folders — FeatureLayer#load logs unsupported-type noise. */
export async function safeLoadMapLayer(layer: AgriLayerLike | null | undefined): Promise<boolean> {
  if (!layer || isMapImageGroupSublayer(layer)) return false;
  if (typeof layer.load !== "function") return false;
  if (layer.loaded) return true;
  try {
    await layer.load();
    return true;
  } catch {
    return false;
  }
}

/** True for FeatureLayer and MapImageLayer sublayers that support query APIs. */
export function isQueryableFieldLayer(layer: AgriLayerLike | null | undefined): boolean {
  if (!layer) return false;
  // Never treat Group Layer folders as queryable — even if they expose
  // createQuery while hydrating (FeatureLayer load then hard-fails).
  if (isMapImageGroupSublayer(layer)) return false;
  // Viloyat/tuman outline + label layers are drawn on top of the fields and
  // are FeatureLayers too — they must never be treated as field polygons.
  if (isAgriAdminBoundaryLayer(layer)) return false;
  // Prefer queryFeatures — some MapImage Sublayer builds expose createQuery +
  // queryFeatures but not queryFeatureCount until fully hydrated.
  if (typeof layer.createQuery === "function") {
    if (typeof layer.queryFeatures === "function") return true;
    if (typeof layer.queryFeatureCount === "function") return true;
  }
  // Leaf MapImage sublayer that can still be queried once load() finishes.
  if (lowerType(layer) === "sublayer" && (layer.url || layer.id != null)) {
    return (
      typeof layer.queryFeatures === "function" ||
      typeof layer.createQuery === "function"
    );
  }
  return false;
}

export function getLayerFieldNames(layer: AgriLayerLike | null | undefined): string[] {
  return (layer?.fields || []).map((f) => String(f?.name || "").toLowerCase());
}

export function normalizeMapServiceUrl(url: string): string {
  return String(url || "")
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "")
    .replace(/\/\d+$/, "");
}

/** Full layer URL including MapServer index — unique per sublayer. */
export function normalizeQueryableLayerUrl(url: string): string {
  return String(url || "").trim().toLowerCase().replace(/\/+$/, "");
}

export function getMapImageParentLayer(
  layer: AgriLayerLike | null | undefined,
): AgriLayerLike | null {
  let parent = layer?.parent;
  while (parent) {
    if (lowerType(parent) === "map-image") return parent;
    parent = parent.parent;
  }
  // Sublayer.layer points at the MapImageLayer even when nested groups
  // sit between this leaf and the root (parent chain may lack type).
  if (lowerType(layer?.layer) === "map-image") {
    return layer.layer;
  }
  return null;
}

export function getAgriLayerMapKey(layer: AgriLayerLike | null | undefined): string {
  if (!layer) return "";
  const url = normalizeQueryableLayerUrl(String(layer.url || ""));
  if (url) return url;
  const parent = getMapImageParentLayer(layer);
  const parentUrl = parent
    ? normalizeQueryableLayerUrl(String(parent.url || ""))
    : "";
  const selfId = String(layer.id ?? "");
  if (parentUrl && selfId) return `${parentUrl}/${selfId}`;
  return selfId;
}

/**
 * True for MapImageLayer roots and any queryable leaf that belongs to one.
 * Used to gate uniqueid-IN definitionExpression mirrors — those must never
 * overwrite the short tuman/turi clauses owned by syncRegionYearLayerVisibility
 * (long uniqueid IN (...) layerDefs flash unfiltered / whole-viloyat tiles).
 */
export function isMapImageOwnedLayer(layer: AgriLayerLike | null | undefined): boolean {
  if (!layer) return false;
  const type = lowerType(layer);
  if (type === "map-image" || type === "sublayer") return true;
  if (getMapImageParentLayer(layer)) return true;
  const url = String(layer.url || "");
  return /\/MapServer\/\d+/i.test(url) && !!(layer.parent || layer.layer);
}

/**
 * Normalize a live MapImage sublayer / FeatureLayer URL to a queryable
 * .../MapServer/N (or FeatureServer/N) endpoint. Parent MapServer roots are
 * useless for FeatureLayer#load.
 */
export function resolveQueryableServiceUrl(layer: AgriLayerLike | null | undefined): string {
  const url = String(layer?.url || "").trim().replace(/\/+$/, "");
  if (!url) return "";
  if (/\/(?:MapServer|FeatureServer)\/\d+$/i.test(url)) return url;
  if (/\/(?:MapServer|FeatureServer)$/i.test(url)) {
    const layerId = layer?.layerId ?? layer?.id;
    if (layerId != null && /^\d+$/.test(String(layerId))) {
      return `${url}/${layerId}`;
    }
  }
  return url;
}

export function isLikelyBasemapServiceLayer(layer: AgriLayerLike | null | undefined): boolean {
  const haystack =
    `${String(layer?.title || "")} ${String(layer?.url || "")}`.toLowerCase();
  return (
    haystack.includes("hillshade") ||
    haystack.includes("elevation/world") ||
    haystack.includes("services.arcgisonline.com") ||
    haystack.includes("arcgisonline.com/arcgis/rest")
  );
}

/** Agri region/year polygon fields (MapImage sublayers + FeatureLayers). */
export function isAgriFieldLayerCandidate(layer: AgriLayerLike | null | undefined): boolean {
  const fields = getLayerFieldNames(layer);
  if (
    ["uniqueid", "crop_id", "turi", "maydon", "viloyat"].some((name) =>
      fields.includes(name),
    )
  ) {
    return true;
  }
  const haystack =
    `${String(layer?.title || "")} ${String(layer?.url || "")} ${String(layer?.parent?.title || "")}`.toLowerCase();
  return (
    /\bagri\b/.test(haystack) ||
    haystack.includes("agriculture") ||
    haystack.includes("qishloq")
  );
}

/** A group sublayer owns children and ignores definitionExpression. */
export function isGroupSublayer(sublayer: AgriLayerLike | null | undefined): boolean {
  const subs = sublayer?.sublayers?.toArray?.();
  return Array.isArray(subs) && subs.length > 0;
}

/**
 * WebMap field layers often ship with minScale (e.g. 1:100000) so parcels
 * only draw when zoomed in. Dashboard zooms to full viloyat/tuman extent —
 * clear client scale gates so MapImage exports at that framing.
 * Also clear group sublayers: skipping them left parent scale gates active.
 */
export function clearFieldLayerScaleLimits(layer: AgriLayerLike | null | undefined): void {
  if (!layer) return;
  try {
    if (Number(layer.minScale ?? 0) !== 0) layer.minScale = 0;
    if (Number(layer.maxScale ?? 0) !== 0) layer.maxScale = 0;
  } catch {
    /* read-only scale on some layer kinds — nothing to clear */
  }
}

/**
 * Clear min/max scale on the leaf, its MapImage parent, and every nested
 * sublayer (including groups). Must run again after layer.load() — service
 * metadata can restore minScale and blank fields at viloyat zoom.
 */
export function clearScaleLimitsOnRegionYearTree(layer: AgriLayerLike | null | undefined): void {
  if (!layer) return;
  clearFieldLayerScaleLimits(layer);
  try {
    const parent = getMapImageParentLayer(layer);
    if (parent && parent !== layer) {
      clearFieldLayerScaleLimits(parent);
      // Walk the full MapImage tree from the parent once so siblings/groups
      // under the same service also drop scale gates.
      const parentSubs = firstCollectionArray(parent.allSublayers, parent.sublayers);
      for (const sub of parentSubs) clearFieldLayerScaleLimits(sub);
    }
  } catch {
    /* parent tree not hydrated yet — the leaf was still cleared */
  }
  for (const sub of childSublayers(layer)) clearScaleLimitsOnRegionYearTree(sub);
}

export function summarizeDefinitionExpression(
  expression: unknown,
): string | null {
  if (expression == null) return null;
  const text = String(expression);
  if (text.length <= 420) return text;

  const uniqueIdInCount = (text.match(/\buniqueid\s+IN\s*\(/gi) || []).length;
  const quotedValueCount = (text.match(/'/g) || []).length / 2;
  return `${text.slice(0, 220)} ... [truncated ${text.length} chars, uniqueidInClauses=${uniqueIdInCount}, quotedValues≈${Math.floor(quotedValueCount)}]`;
}

export function collectLiveSublayers(
  layer: AgriLayerLike | null | undefined,
  out: AgriLayerLike[] = [],
): AgriLayerLike[] {
  const sublayers =
    layer?.sublayers?.toArray?.() || layer?.allSublayers?.toArray?.();
  if (!Array.isArray(sublayers)) return out;
  for (const sublayer of sublayers) {
    out.push(sublayer);
    collectLiveSublayers(sublayer, out);
  }
  return out;
}

export interface ShownRegionYearLayer {
  layer: AgriLayerLike;
  sublayers: AgriLayerLike[];
}

function shortStack(): string {
  try {
    return String(new Error().stack || "")
      .split("\n")
      .slice(1, 10)
      .map((line) => line.trim())
      .join(" <= ");
  } catch {
    return "";
  }
}

/**
 * Always-on definitionExpression guard for a shown region-year sublayer.
 * Whatever code path clears/overwrites the sublayer's runtime
 * definitionExpression (hitTest identify hydration, a stray live-layer query,
 * another widget) is logged WITH a stack trace and the expected tuman/turi
 * filter is restored immediately — before the unfiltered export can paint
 * other districts' fields.
 */
const sublayerDefinitionGuards = new WeakMap<
  AgriLayerLike,
  { expected: string; handle: AgriWatchHandle | null }
>();

export function guardSublayerDefinitionExpression(sub: AgriLayerLike, expected: string): void {
  const existing = sublayerDefinitionGuards.get(sub);
  if (existing) {
    existing.expected = String(expected ?? "");
    return;
  }
  const entry: { expected: string; handle: AgriWatchHandle | null } = {
    expected: String(expected ?? ""),
    handle: null,
  };
  sublayerDefinitionGuards.set(sub, entry);
  try {
    entry.handle =
      sub?.watch?.("definitionExpression", (newValue: unknown) => {
        const next = String(newValue ?? "");
        if (next === entry.expected) return;
        regionYearLog("definitionExpression:DRIFT-restored", {
          sublayer: sub?.title ?? sub?.id,
          drifted: next || "<empty>",
          restored: entry.expected || "<empty>",
          setterStack: shortStack(),
        });
        try {
          sub.definitionExpression = entry.expected;
        } catch {
          /* layer destroyed between the watch firing and the restore */
        }
      }) ?? null;
  } catch {
    /* watch unsupported on this layer type */
  }
}

/** Opacity must be set on MapImage parent — Sublayer.opacity does not paint tiles. */
export function getRegionYearOpacityTarget(layer: AgriLayerLike): AgriLayerLike {
  if (lowerType(layer) === "sublayer") {
    return getMapImageParentLayer(layer) || layer;
  }
  return layer;
}

/** Region-year MapImage parent URLs whose load() already failed (e.g. deleted/renamed service) — never retry. */
export const regionYearPreloadFailedUrls = new Set<string>();

/** Force a MapImage export after visibility / layerDefs change. */
export function refreshRegionYearMapExports(
  shown: ShownRegionYearLayer[],
): void {
  const seen = new Set<AgriLayerLike>();
  for (const entry of shown || []) {
    const layer = entry?.layer;
    if (!layer) continue;
    const target =
      lowerType(layer) === "map-image" ? layer : getMapImageParentLayer(layer) || layer;
    if (!target || seen.has(target)) continue;
    seen.add(target);
    try {
      target.refresh?.();
    } catch {
      /* layer removed from the map — nothing to refresh */
    }
  }
}

/** Disable PBF on a FeatureLayer instance (map view worker path). */
export function disableLayerPbf(layer: AgriLayerLike | null | undefined): void {
  if (!layer) return;
  try {
    if (Object.prototype.hasOwnProperty.call(layer, "pbfEnabled")) {
      layer.pbfEnabled = false;
    }
  } catch {
    /* read-only on this build — the request interceptor still forces JSON */
  }
}
