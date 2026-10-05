import { combineAccessWhere } from "../../shared/agri-access-config";
import { isAgriAdminBoundaryLayer } from "../map-image-predicates";
import { SessionManager } from "jimu-core";
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { getAgriServiceUrls, getAgriPortalSharingRestUrl } from "../../shared/agri-service-urls";
import { getCropTuriMatchValues } from "../../shared/agri-crop-labels";
import { escapeArcGIS } from "../../data/agri-sql";

/** Portal group access + business WHERE. */
export function withAgriAccessWhere(mainWhere?: string): string {
  return combineAccessWhere(mainWhere);
}
export interface AgriFilters {
  yil?: string;
  viloyat?: string;
  tuman?: string;
  mavsum?: string;
  /** Multiple mavsum values joined with OR (e.g. grouped season labels). */
  mavsumOrValues?: string[];
  fermer?: string;
  /** STIR / tax_number qidiruv (raqamli maydon). */
  farmerTax?: string;
  crop?: string;
  /** Numeric crop_id from AgriCrop cropSelected (preferred over name on crop_id field). */
  cropId?: string;
  /** Land type selected in AgriLocalization: sugoriladigan | lalmi | "". */
  yerTuri?: string;
  /** water_table type_id: 1 = Sug'oriladigan/Sug'orilgan, 2 = Lalmi. */
  yerTuriId?: string;
  manba?: string;
  kanal?: string;
  minMax?: string; // "Min" | "Max" | "both" | ""
  /** Efficiency range filter (0–100), applied when not full range. */
  effMin?: number | null;
  effMax?: number | null;
  /** When true, viloyat is not added to WHERE (layer is already region-specific). */
  skipRegionFilter?: boolean;
  /** When true, yil is not added (year-layer mode — DS is already per-year). */
  skipYearFilter?: boolean;
}
export function resolveEfficiencyField(available: string[]): string | null {
  const lower = new Map(
    available.map((name) => [String(name).toLowerCase(), name]),
  );
  for (const candidate of ["eff", "efficiency", "wp_tot"]) {
    const hit = lower.get(candidate);
    if (hit) return hit;
  }
  return null;
}
export function clampEfficiencyValue(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
export function isEfficiencyRangeActive(
  min: number | null | undefined,
  max: number | null | undefined,
): boolean {
  if (min == null || max == null) return false;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  return min > 0 || max < 100;
}
export function buildEfficiencyRangeWhere(
  min: number | null | undefined,
  max: number | null | undefined,
  available: string[],
): string {
  if (!isEfficiencyRangeActive(min, max)) return "";
  const field =
    resolveEfficiencyField(available) ??
    (available.length === 0 ? "eff" : null);
  if (!field) return "";
  const lo = clampEfficiencyValue(Number(min));
  const hi = clampEfficiencyValue(Number(max));
  const safeMin = Math.min(lo, hi);
  const safeMax = Math.max(lo, hi);
  return `${field} >= ${safeMin} AND ${field} <= ${safeMax}`;
}
export function mergeEfficiencyIntoFilters(
  filters: AgriFilters,
  effMin: number | null | undefined,
  effMax: number | null | undefined,
): AgriFilters {
  if (!isEfficiencyRangeActive(effMin, effMax)) return filters;
  return {
    ...filters,
    effMin: clampEfficiencyValue(Number(effMin)),
    effMax: clampEfficiencyValue(Number(effMax)),
  };
}
export interface ResolvedFeatureLayer {
  layer: any;
  fields: string[];
  /** True when the layer title/url already identifies the selected region. */
  regionScoped: boolean;
  /** True when the layer title/url already identifies the selected year. */
  yearScoped: boolean;
}
export const MONTHLY_FIELDS: Array<{ field: string; month: number; key: string }> =
  [
    { field: "uw3_m3", month: 3, key: "uw3_m3" },
    { field: "uw4_m3", month: 4, key: "uw4_m3" },
    { field: "uw5_m3", month: 5, key: "uw5_m3" },
    { field: "uw6_m3", month: 6, key: "uw6_m3" },
    { field: "uw7_m3", month: 7, key: "uw7_m3" },
    { field: "uw8_m3", month: 8, key: "uw8_m3" },
    { field: "uw9_m3", month: 9, key: "uw9_m3" },
    { field: "uw10_m3", month: 10, key: "uw10_m3" },
  ];
/**
 * Agri region codes (`region` / Hosted `parent_cod`) → display name.
 * Same table as vegetation indices / Agri_table_data — NOT the official SOATO
 * table (which swaps Navoi↔Namangan and Fergana↔Kashkadarya).
 */
export const REGION_SOATO_TO_UZ_NAME: Record<string, string> = {
  "1703": "Andijon viloyati",
  "1706": "Buxoro viloyati",
  "1708": "Jizzax viloyati",
  "1710": "Qashqadaryo viloyati",
  "1712": "Navoiy viloyati",
  "1714": "Namangan viloyati",
  "1718": "Samarqand viloyati",
  "1722": "Surxondaryo viloyati",
  "1724": "Sirdaryo viloyati",
  "1726": "Toshkent shahri",
  "1727": "Toshkent viloyati",
  "1730": "Farg'ona viloyati",
  "1733": "Xorazm viloyati",
  "1735": "Qoraqalpog'iston Respublikasi",
};
export function regionSoatoToDisplayName(code: string): string | null {
  const c = String(code ?? "").trim();
  return REGION_SOATO_TO_UZ_NAME[c] || null;
}
/** English / translit aliases used when resolving a region label to SOATO. */
const REGION_NAME_ALIAS_GROUPS: string[][] = [
  ["fargona", "fergana", "ferghana", "фарғона", "фергана"],
  ["samarqand", "samarkand", "samar", "samarkhand"],
  ["toshkent", "tashkent"],
  ["andijon", "andijan"],
  ["namangan"],
  ["buxoro", "bukhara", "buxara"],
  ["qashqadaryo", "kashkadarya", "kashkadaria", "qashqadarya", "kashkada"],
  // "sukhandarya" (missing the 'r') is a typo in the WebMap's 2025 layer title.
  ["surxondaryo", "surkhandarya", "surxandarya", "sukhandarya"],
  ["jizzax", "jizzakh", "jizakh"],
  ["sirdaryo", "syrdarya", "sirdarya"],
  ["navoiy", "navoi"],
  ["xorazm", "khorezm", "xorezm", "kharezm"],
  ["qoraqalpogiston", "karakalpakstan", "nukus", "qqr"],
];
export function regionDisplayNameToSoato(name: string): string | null {
  const target = normalizeRegionToken(name);
  if (!target) return null;

  const matchTokens = new Set<string>([target]);
  for (const group of REGION_NAME_ALIAS_GROUPS) {
    const norms = group.map((alias) => normalizeRegionToken(alias)).filter(Boolean);
    if (norms.some((alias) => alias === target)) {
      norms.forEach((alias) => matchTokens.add(alias));
      break;
    }
  }

  for (const [code, label] of Object.entries(REGION_SOATO_TO_UZ_NAME)) {
    const labelToken = normalizeRegionToken(label);
    if (labelToken && matchTokens.has(labelToken)) return code;
  }
  return null;
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
export function isMapImageGroupSublayer(layer: any): boolean {
  if (!layer) return false;
  const type = String(layer.type || "").toLowerCase();
  const sourceType = String(
    layer.sourceJSON?.type ||
      layer.resourceInfo?.type ||
      layer.source?.type ||
      "",
  ).toLowerCase();
  if (sourceType.includes("group")) return true;
  const kidCount =
    layer.sublayers?.length ?? layer.sublayers?.toArray?.()?.length ?? 0;
  if (type === "sublayer" && kidCount > 0) return true;
  // Nested group folders under MapImage also show up as type "group".
  if (type === "group") return true;
  return false;
}
/** Skip Group Layer folders — FeatureLayer#load logs unsupported-type noise. */
export async function safeLoadMapLayer(layer: any): Promise<boolean> {
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
export function isQueryableFieldLayer(layer: any): boolean {
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
  const type = String(layer.type || "").toLowerCase();
  if (type === "sublayer") {
    if (layer.url || layer.id != null) {
      return (
        typeof layer.queryFeatures === "function" ||
        typeof layer.createQuery === "function"
      );
    }
  }
  return false;
}
export function getLayerFieldNames(layer: any): string[] {
  return (layer?.fields || []).map((f: any) =>
    String(f?.name || "").toLowerCase(),
  );
}
export function extractYearFromHaystack(haystack: string): string | null {
  const match = String(haystack || "").match(/(?:19|20)\d{2}/);
  return match ? match[0] : null;
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
export function getAgriLayerMapKey(layer: any): string {
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
export function getMapImageParentLayer(layer: any): any | null {
  let parent = layer?.parent;
  while (parent) {
    if (String(parent?.type || "").toLowerCase() === "map-image") return parent;
    parent = parent?.parent;
  }
  // Sublayer.layer points at the MapImageLayer even when nested groups
  // sit between this leaf and the root (parent chain may lack type).
  if (String(layer?.layer?.type || "").toLowerCase() === "map-image") {
    return layer.layer;
  }
  return null;
}
/**
 * True for MapImageLayer roots and any queryable leaf that belongs to one.
 * Used to gate uniqueid-IN definitionExpression mirrors — those must never
 * overwrite the short tuman/turi clauses owned by syncRegionYearLayerVisibility
 * (long uniqueid IN (...) layerDefs flash unfiltered / whole-viloyat tiles).
 */
export function isMapImageOwnedLayer(layer: any): boolean {
  if (!layer) return false;
  const type = String(layer?.type || "").toLowerCase();
  if (type === "map-image" || type === "sublayer") return true;
  if (getMapImageParentLayer(layer)) return true;
  const url = String(layer?.url || "");
  if (/\/MapServer\/\d+/i.test(url) && (layer?.parent || layer?.layer)) {
    return true;
  }
  return false;
}
/**
 * Off-map FeatureLayer clients per service URL. Querying a live MapImage
 * Sublayer (createQuery/queryFeatures/queryExtent/load) rehydrates it and can
 * clear its runtime definitionExpression — the map then exports and briefly
 * paints every district's fields until a guard restores the filter. Every
 * read-only query in filter/zoom/renderer flows must go through these
 * detached clients instead of the live layer.
 */
export const detachedQueryLayerCache = new Map<string, any>();
/** URLs that FeatureLayer#load() rejected (Group Layer / bad endpoint). */
export const detachedQueryLayerFailedUrls = new Set<string>();
/** Auth failures — cleared after IdentityManager token registration so we retry. */
export const detachedQueryLayerAuthFailedUrls = new Set<string>();
export let agriIdentityTokenRegistered = false;
function readAgriAuthToken(): string | null {
  try {
    const session = SessionManager.getInstance().getMainSession() as any;
    const fromSession = String(session?.token || "").trim();
    if (fromSession) return fromSession;
  } catch {
    /* ignore */
  }
  if (typeof window === "undefined") return null;
  try {
    for (const storage of [window.sessionStorage, window.localStorage]) {
      const exbRaw = storage.getItem("exb_auth");
      if (exbRaw) {
        const parsed = JSON.parse(exbRaw) as { token?: unknown };
        const token =
          typeof parsed.token === "string" ? parsed.token.trim() : "";
        if (token) return token;
      }
      for (const key of ["token", "authToken", "arcgis_token", "arcgisToken"]) {
        const value = storage.getItem(key)?.trim();
        if (value) return value;
      }
    }
  } catch {
    return null;
  }
  return null;
}
export function isAuthFailureMessage(err: unknown): boolean {
  const msg = String(
    (err as any)?.message ||
      (err as any)?.details?.message ||
      err ||
      "",
  ).toLowerCase();
  const status = Number(
    (err as any)?.details?.httpStatus ??
      (err as any)?.httpStatus ??
      (err as any)?.code ??
      0,
  );
  if (status === 401 || status === 403 || status === 498 || status === 499) {
    return true;
  }
  return /token|unauthorized|credential|sign in|login required/.test(msg);
}
/**
 * Register the EXB session token against the agri ArcGIS Server so detached
 * FeatureLayer queries (MapServer/N) succeed — same pattern as admin borders.
 */
export async function ensureAgriServerIdentityToken(): Promise<boolean> {
  const token = readAgriAuthToken();
  if (!token) return agriIdentityTokenRegistered;
  try {
    const [IdentityManager] = await loadArcGISJSAPIModules([
      "esri/identity/IdentityManager",
    ]);
    const arcgisServer = getAgriServiceUrls().arcgisServer.replace(/\/$/, "");
    for (const server of [
      `${arcgisServer}/rest/services`,
      `${arcgisServer}/rest`,
      arcgisServer,
      getAgriPortalSharingRestUrl(),
    ]) {
      try {
        IdentityManager.registerToken({ server, token });
      } catch {
        /* best effort */
      }
    }
    agriIdentityTokenRegistered = true;
    // Prior loads that failed with 499 can succeed now.
    for (const url of Array.from(detachedQueryLayerAuthFailedUrls)) {
      detachedQueryLayerAuthFailedUrls.delete(url);
      detachedQueryLayerFailedUrls.delete(url);
      detachedQueryLayerCache.delete(url);
    }
    return true;
  } catch {
    return agriIdentityTokenRegistered;
  }
}
/**
 * Normalize a live MapImage sublayer / FeatureLayer URL to a queryable
 * .../MapServer/N (or FeatureServer/N) endpoint. Parent MapServer roots are
 * useless for FeatureLayer#load.
 */
export function resolveQueryableServiceUrl(layer: any): string {
  let url = String(layer?.url || "").trim().replace(/\/+$/, "");
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
export function isLikelyBasemapServiceLayer(layer: any): boolean {
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
export function isAgriFieldLayerCandidate(layer: any): boolean {
  const fields = getLayerFieldNames(layer);
  if (
    fields.includes("uniqueid") ||
    fields.includes("crop_id") ||
    fields.includes("turi") ||
    fields.includes("maydon") ||
    fields.includes("viloyat")
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
export function buildTuriMapClause(
  sublayer: any,
  turi: string | string[],
): string {
  const fields: any[] = sublayer?.fields || [];
  const findField = (name: string) =>
    fields.find((f) => String(f?.name || "").toLowerCase() === name);
  const selectedTurlar = (Array.isArray(turi) ? turi : [turi])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  if (!selectedTurlar.length) return "";
  const turiField = findField("turi");
  const turiFieldName = turiField?.name || (fields.length ? null : "turi");
  if (!turiFieldName) return "";
  // Pie sends canonical keys (bugdoy) — MapImage stores Bug'doy / Буғдой.
  const cropClauses = selectedTurlar.flatMap((value) => {
    const matchValues = getCropTuriMatchValues(value);
    return matchValues.flatMap((v) => {
      const variants = apostropheVariants(v);
      const values = variants.length ? variants : [v];
      return values.map(
        (literal) => `${turiFieldName}='${escapeArcGIS(literal)}'`,
      );
    });
  });
  if (!cropClauses.length) return "";
  return cropClauses.length === 1
    ? cropClauses[0]
    : `(${cropClauses.join(" OR ")})`;
}
/** A group sublayer owns children and ignores definitionExpression. */
export function isGroupSublayer(sublayer: any): boolean {
  const subs = sublayer?.sublayers?.toArray?.();
  return Array.isArray(subs) && subs.length > 0;
}
/**
 * WebMap field layers often ship with minScale (e.g. 1:100000) so parcels
 * only draw when zoomed in. Dashboard zooms to full viloyat/tuman extent —
 * clear client scale gates so MapImage exports at that framing.
 * Also clear group sublayers: skipping them left parent scale gates active.
 */
export function clearFieldLayerScaleLimits(layer: any): void {
  if (!layer) return;
  try {
    if (Number(layer.minScale ?? 0) !== 0) layer.minScale = 0;
    if (Number(layer.maxScale ?? 0) !== 0) layer.maxScale = 0;
  } catch {
    /* ignore */
  }
}
/**
 * Clear min/max scale on the leaf, its MapImage parent, and every nested
 * sublayer (including groups). Must run again after layer.load() — service
 * metadata can restore minScale and blank fields at viloyat zoom.
 */
export function clearScaleLimitsOnRegionYearTree(layer: any): void {
  if (!layer) return;
  clearFieldLayerScaleLimits(layer);
  try {
    const parent = getMapImageParentLayer(layer);
    if (parent && parent !== layer) {
      clearFieldLayerScaleLimits(parent);
      // Walk the full MapImage tree from the parent once so siblings/groups
      // under the same service also drop scale gates.
      const parentSubs =
        parent?.allSublayers?.toArray?.() ||
        parent?.sublayers?.toArray?.() ||
        [];
      if (Array.isArray(parentSubs)) {
        for (const sub of parentSubs) clearFieldLayerScaleLimits(sub);
      }
    }
  } catch {
    /* ignore */
  }
  const subs =
    layer?.sublayers?.toArray?.() || layer?.allSublayers?.toArray?.() || [];
  if (Array.isArray(subs) && subs.length) {
    for (const sub of subs) clearScaleLimitsOnRegionYearTree(sub);
  }
}
/** Bar category → ndvi_status token (same mapping as AgriLocalization). */
export const VH_CATEGORY_TO_STATUS: Record<string, string> = {
  "1-Juda yaxshi": "juda_yaxshi",
  "2-Yaxshi": "yaxshi",
  "3-O'rta": "orta",
  "4-Past": "past",
};
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
  layer: any,
  out: any[] = [],
): any[] {
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
  layer: any;
  sublayers: any[];
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
  any,
  { expected: string; handle: any }
>();
export function guardSublayerDefinitionExpression(sub: any, expected: string): void {
  const existing = sublayerDefinitionGuards.get(sub);
  if (existing) {
    existing.expected = String(expected ?? "");
    return;
  }
  const entry = { expected: String(expected ?? ""), handle: null as any };
  sublayerDefinitionGuards.set(sub, entry);
  try {
    entry.handle = sub?.watch?.(
      "definitionExpression",
      (newValue: unknown) => {
        const next = String(newValue ?? "");
        if (next === entry.expected) return;
        let stack = "";
        try {
          stack = String(new Error().stack || "")
            .split("\n")
            .slice(1, 10)
            .map((line) => line.trim())
            .join(" <= ");
        } catch {
          /* ignore */
        }
        regionYearLog("definitionExpression:DRIFT-restored", {
          sublayer: sub?.title ?? sub?.id,
          drifted: next || "<empty>",
          restored: entry.expected || "<empty>",
          setterStack: stack,
        });
        try {
          sub.definitionExpression = entry.expected;
        } catch {
          /* ignore */
        }
      },
    );
  } catch {
    /* watch unsupported on this layer type */
  }
}
// Silent by default. Set `window.__AGRO_V5_DEBUG = true` in the console to
// stream region/year + district filter decisions while reproducing an issue.
export function regionYearLog(phase: string, detail?: Record<string, unknown>): void {
  try {
    if (!(globalThis as any)?.__AGRO_V5_DEBUG) return;
    // eslint-disable-next-line no-console
    console.log(`[AgroV5] ${phase}`, detail ?? {});
  } catch {
    /* ignore */
  }
}
/** Opacity must be set on MapImage parent — Sublayer.opacity does not paint tiles. */
export function getRegionYearOpacityTarget(layer: any): any {
  const type = String(layer?.type || "").toLowerCase();
  if (type === "sublayer") {
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
  const seen = new Set<any>();
  for (const entry of shown || []) {
    const layer = entry?.layer;
    if (!layer) continue;
    const type = String(layer?.type || "").toLowerCase();
    const target =
      type === "map-image" ? layer : getMapImageParentLayer(layer) || layer;
    if (!target || seen.has(target)) continue;
    seen.add(target);
    try {
      target.refresh?.();
    } catch {
      /* ignore */
    }
  }
}
export function normalizeRegionToken(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’'`ʻ‘ʼ]/g, "")
    .replace(/\s+viloyati/g, "")
    .replace(/\s+viloyat/g, "")
    .replace(/\s+region/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]/g, "")
    .trim();
}
/** Compare region labels ignoring apostrophe / viloyati spelling variants. */
export function regionFilterValuesEqual(a: string, b: string): boolean {
  return normalizeRegionToken(a) === normalizeRegionToken(b);
}
export const REGION_ALIAS_GROUPS: string[][] = [
  ["fargona", "fergana", "ferghana", "фарғона", "фергана"],
  ["samarqand", "samarkand", "samar", "samarkhand"],
  ["toshkent", "tashkent"],
  ["andijon", "andijan"],
  ["namangan", "namangan"],
  ["buxoro", "bukhara", "buxara"],
  ["qashqadaryo", "kashkadarya", "kashkadaria", "qashqadarya", "kashkada"],
  // "sukhandarya" (missing the 'r') is a typo in the WebMap's 2025 layer title.
  ["surxondaryo", "surkhandarya", "surxandarya", "sukhandarya"],
  ["jizzax", "jizzakh", "jizakh"],
  ["sirdaryo", "syrdarya", "sirdarya"],
  ["navoiy", "navoi"],
  ["xorazm", "khorezm", "xorezm", "kharezm"],
  ["qoraqalpogiston", "karakalpakstan", "nukus", "qqr"],
];
/**
 * Detect region+year field layers by title/url.
 * Accepts both:
 * - classic: "... year ... 2026" / "agri andijan 2026 year"
 * - Test agri style: "agri andijan 2026" (agri + year number, no "year" word)
 *
 * Does NOT by itself mean the layer should be toggled — callers must also
 * require a known region token so aggregate titles like
 * "agri 2026 republic data" are never treated as a single region leaf
 * (forcing all of its sublayers visible would export every region at once).
 */
export function looksLikeRegionYearLayerHaystack(haystack: string): boolean {
  const text = String(haystack || "");
  if (!/\b(19|20)\d{2}\b/.test(text)) return false;
  return /\byear\b/i.test(text) || /\bagri\b/i.test(text);
}
/** True when title/url contains a known viloyat alias (andijan, ferghana, …). */
export function haystackHasKnownRegionToken(haystack: string): boolean {
  const text = normalizeRegionToken(haystack);
  if (!text) return false;
  for (const group of REGION_ALIAS_GROUPS) {
    if (group.some((alias) => text.includes(normalizeRegionToken(alias)))) {
      return true;
    }
  }
  return false;
}
export function haystackMatchesYear(haystack: string, yil?: string): boolean {
  const year = String(yil ?? "").trim();
  if (!/^\d{4}$/.test(year)) return false;
  return String(haystack || "").toLowerCase().includes(year);
}
type ScoredLayerItem<T> = T & { regionMatch: boolean };
/**
 * When a single Map Service layer is used, its title may say 2024 while the UI
 * filter is 2025 — year is still applied via the `year` field in WHERE.
 */
export function pickYearRegionLayerPool<T extends ScoredLayerItem<{ score: number }>>(
  scored: T[],
  totalCandidates: number,
  filters: Pick<AgriFilters, "yil" | "viloyat">,
  haystackFor: (item: T) => string,
): T[] {
  const wantsYear = /^\d{4}$/.test(String(filters.yil ?? "").trim());
  const wantsRegion = !!String(filters.viloyat ?? "").trim();

  let yearPool = wantsYear
    ? scored.filter((item) => haystackMatchesYear(haystackFor(item), filters.yil))
    : scored;

  if (wantsYear && !yearPool.length && scored.length) {
    const regionMatched = scored.filter((item) => item.regionMatch);
    if (regionMatched.length === 1) {
      yearPool = regionMatched;
    } else if (scored.length === 1 || totalCandidates === 1) {
      yearPool = scored;
    } else if (regionMatched.length > 0) {
      yearPool = regionMatched;
    }
  }

  if (!yearPool.length) return [];

  if (!wantsRegion) return yearPool;

  const regionPool = yearPool.filter((item) => item.regionMatch);
  if (regionPool.length) return regionPool;

  if (yearPool.length === 1 || totalCandidates === 1) return yearPool;

  const regionMatched = scored.filter((item) => item.regionMatch);
  return regionMatched.length ? regionMatched : yearPool;
}
export function hasFieldIn(fields: string[], name: string): boolean {
  const target = name.toLowerCase();
  return fields.some((f) => String(f).toLowerCase() === target);
}
/** Apostrophe / quote variants so values like Farg'ona match all encodings. */
export function apostropheVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  // Same glyph set as agri-sql.normalizeApos (includes U+2018 Yakkabog‘).
  const base = raw.replace(/['\u2018\u2019\u201A\u201B\u02BB\u02BC\u02B9\u00B4\u2032\u2035`]/g, "'");
  return Array.from(
    new Set([
      base,
      base.replace(/'/g, "\u2019"),
      base.replace(/'/g, "`"),
      base.replace(/'/g, "\u02BB"),
      base.replace(/'/g, "\u2018"),
      base.replace(/'/g, "\u02BC"),
    ]),
  ).filter(Boolean);
}
function sortDistinctStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((v) => String(v).trim()).filter(Boolean)),
  ).sort((a, b) =>
    a.localeCompare(b, "uz", {
      sensitivity: "base",
      ignorePunctuation: true,
      numeric: true,
    }),
  );
}
/** Region name variants for WHERE (viloyat / region_id). */
export function expandRegionVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const expanded = new Set<string>();
  const hasCyrillic = /[\u0400-\u04FF]/.test(raw);
  const latinSuffix = " viloyati";
  const cyrSuffix = " вилояти";

  const push = (candidate: string): void => {
    const clean = String(candidate ?? "").trim();
    if (!clean) return;
    expanded.add(clean);
    apostropheVariants(clean).forEach((variant) => expanded.add(variant));
  };

  apostropheVariants(raw).forEach((variant) => {
    push(variant);
    const lower = variant.toLowerCase();
    if (hasCyrillic) {
      if (lower.endsWith(cyrSuffix)) {
        push(variant.slice(0, -cyrSuffix.length).trim());
      } else {
        push(`${variant}${cyrSuffix}`);
      }
    } else {
      if (lower.endsWith(latinSuffix)) {
        push(variant.slice(0, -latinSuffix.length).trim());
      } else if (!lower.endsWith(" viloyat")) {
        push(`${variant}${latinSuffix}`);
      }
    }
  });

  return sortDistinctStrings(Array.from(expanded));
}
/** District name variants for WHERE (tuman / distrct_id). */
export function expandDistrictVariants(value: string): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const expanded = new Set<string>();
  const push = (candidate: string): void => {
    const clean = String(candidate ?? "").trim();
    if (!clean) return;
    expanded.add(clean);
    apostropheVariants(clean).forEach((variant) => expanded.add(variant));
  };

  push(raw);
  const lower = raw.toLowerCase();
  const suffixes = [
    " tumani",
    " shahri",
    " shahar",
    " тумани",
    " шаҳри",
    " район",
  ];
  for (const suf of suffixes) {
    const s = suf.toLowerCase();
    if (lower.endsWith(s)) {
      push(raw.slice(0, raw.length - suf.length).trim());
    } else {
      push(`${raw}${suf}`);
    }
  }
  return sortDistinctStrings(Array.from(expanded));
}
/** Grouped mavsum labels (ikkilamchi / birlamchi) for OR clauses. */
export function getMavsumGroupedValues(selectedValue: string): string[] {
  const selected = String(selectedValue ?? "").trim();
  if (!selected) return [];

  const normalized = selected
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const expandedValues = [selected];

  const isIkkilamchi =
    normalized.includes("ikkilamchi") ||
    normalized.includes("иккиламчи") ||
    normalized.includes("вторич");
  if (isIkkilamchi) {
    expandedValues.push(" Ikkilamchi", "Ikkilamchi");
  }

  const isBirlamchi =
    normalized.includes("birlamchi") ||
    normalized.includes("бирламчи") ||
    normalized.includes("первич");
  if (isBirlamchi) {
    expandedValues.push(
      "Birlamchi va umummavsumiy",
      "Umumiy va birlamchi mavsum",
    );
  }

  const unique = sortDistinctStrings(expandedValues);
  return unique.length ? unique : [selected];
}
/* ── Distinct-value index ──
 * UI filter values (e.g. "Birlamchi va umummavsumiy", "Bog‘dod tumani") may
 * not match the layer's stored values exactly. We load the distinct values of
 * each filterable field once per layer and match UI values fuzzily against
 * them, so WHERE clauses use the layer's REAL values.
 */
export const VALUE_INDEX_FIELDS = [
  "season_id",
  "mavsum",
  "distrct_id",
  "district_id",
  "tuman",
  "region_id",
  "viloyat",
  "crop_id",
  "crop",
  "type_id",
  "type",
  "yer_turi",
  "full_name",
  "real_name",
  "real_n1",
  "minmax",
];
export const valueIndexCache = new Map<string, Record<string, string[]>>();
export const valueIndexLoading = new Map<string, Promise<void>>();
/** Aggressive normalization for value comparison (apostrophes, suffixes). */
export function normalizeValueToken(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’'`ʻ‘ʼ]/g, "")
    .replace(/\s+tumani\b/g, "")
    .replace(/\s+viloyati\b/g, "")
    .replace(/\s+shahri\b/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]/g, "")
    .trim();
}
/**
 * Match a UI value against the layer's indexed distinct values of a field.
 * Returns: matched actual values; [] = index loaded but no match;
 * null = no index for this field (caller falls back to literal variants).
 */
export function matchIndexedValues(
  layer: any,
  field: string,
  value: string,
): string[] | null {
  if (!layer) return null;
  const idx = valueIndexCache.get(getQueryUrl(layer));
  const vals = idx?.[field.toLowerCase()];
  if (!vals) return null;
  if (!vals.length) return [];
  const target = normalizeValueToken(value);
  if (!target) return [];

  const exact = vals.filter((v) => normalizeValueToken(v) === target);
  if (exact.length) return exact;

  const contains = vals.filter((v) => {
    const n = normalizeValueToken(v);
    return (
      n.length >= 3 &&
      target.length >= 3 &&
      (n.includes(target) || target.includes(n))
    );
  });
  return contains;
}
export type TextMatchKind = "region" | "district" | "default";
export type LayerFieldKind = "numeric" | "string" | "unknown";
/**
 * Field type from layer metadata. Returns "unknown" when metadata is missing —
 * callers must NOT guess numeric in that case: an unquoted numeric literal on
 * a string field makes this server fail with "Unable to complete operation",
 * which silently kills the whole query (empty dropdowns, broken map filter).
 */
export function layerFieldKind(layer: any, field: string): LayerFieldKind {
  const target = String(field || "").toLowerCase();
  const meta = (layer?.fields || []).find(
    (f: any) => String(f?.name || "").toLowerCase() === target,
  );
  if (!meta?.type) return "unknown";
  const t = String(meta.type).toLowerCase();
  if (
    t.includes("integer") ||
    t.includes("double") ||
    t.includes("single") ||
    t.includes("oid")
  ) {
    return "numeric";
  }
  return "string";
}
/** Exact OR clause across all available aliases (e.g. season_id + mavsum). */
export function exactOrClause(
  fieldAliases: string[],
  values: string[],
  available: string[],
  numeric = false,
): string {
  const fields = fieldAliases.filter((f) => hasFieldIn(available, f));
  if (!fields.length || !values.length) return "";
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const field of fields) {
    for (const v of values) {
      const raw = String(v ?? "").trim();
      if (!raw) continue;
      let term = "";
      if (numeric) {
        const digits = raw.replace(/[^\d]/g, "");
        if (!digits || isNaN(Number(digits))) continue;
        term = `${field}=${Number(digits)}`;
      } else {
        term = `${field}='${escapeArcGIS(raw)}'`;
      }
      if (term && !seen.has(term)) {
        seen.add(term);
        terms.push(term);
      }
    }
  }
  if (!terms.length) return "";
  return terms.length === 1 ? terms[0] : `(${terms.join(" OR ")})`;
}
export const FARMER_TAX_NUMBER_FIELD = "tax_number";
export const FARMER_TAX_NUMBER_DIGITS = 9;
export function normalizeFarmerTaxSearchValue(value: string): string {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, FARMER_TAX_NUMBER_DIGITS);
}
export function normalizeLandTypeValue(value: string): "" | "sugoriladigan" | "lalmi" {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’`ʻ‘ʼ]/g, "'")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "");
  if (!normalized || normalized === "barchasi" || normalized === "umumiy") {
    return "";
  }
  if (normalized === "1" || normalized.includes("sugor")) {
    return "sugoriladigan";
  }
  if (normalized === "2" || normalized.includes("lalmi")) return "lalmi";
  return "";
}
export function landTypeIdForValue(value: string): string {
  const key = normalizeLandTypeValue(value);
  if (key === "sugoriladigan") return "1";
  if (key === "lalmi") return "2";
  return "";
}
/** True when a specific land type is selected (not Barchasi / empty). */
export function hasActiveLandTypeFilter(
  yerTuri?: string | null,
  yerTuriId?: string | null,
): boolean {
  return !!(
    normalizeLandTypeValue(String(yerTuriId ?? "")) ||
    normalizeLandTypeValue(String(yerTuri ?? ""))
  );
}
/** Disabled by default. Enable: localStorage agri_fl_data_debug=1 */
export function flLog(phase: string, detail?: Record<string, unknown>): void {
  try {
    if (globalThis.localStorage?.getItem("agri_fl_data_debug") !== "1") return;
    (globalThis as { console?: Console }).console?.log?.("[AgriFLData]", phase, detail ?? {});
  } catch {
    /* ignore */
  }
}
export function layerLabel(layer: any): string {
  return String(layer?.title || layer?.url || layer?.id || "unknown");
}
/**
 * REST JSON fallback. The JS API prefers PBF responses; this server returns
 * malformed PBF ("Error while parsing FeatureSet PBF payload" in console),
 * so on failure we re-run the same query through esri/request with f=json.
 */
/**
 * Workaround for servers returning malformed PBF: rewrite f=pbf -> f=json on
 * query requests so both map rendering and our statistics queries get JSON.
 */
let pbfInterceptorInstalled = false;
export async function installPbfJsonWorkaround(): Promise<void> {
  if (pbfInterceptorInstalled) return;
  pbfInterceptorInstalled = true;
  try {
    const [esriConfig] = await loadArcGISJSAPIModules(["esri/config"]);
    const interceptors = esriConfig?.request?.interceptors;
    if (!interceptors) return;
    interceptors.push({
      urls: /sgm\.uzspace\.uz/i,
      before: (params: any) => {
        const q = params?.requestOptions?.query;
        if (!q) return;
        const fmt = String(q.f ?? "").toLowerCase();
        if (fmt === "pbf") q.f = "json";
      },
    });
    flLog("PBF→JSON interceptor installed for sgm.uzspace.uz");
  } catch (err: any) {
    flLog("PBF→JSON interceptor FAILED", {
      error: String(err?.message || err),
    });
  }
}
/** Disable PBF on a FeatureLayer instance (map view worker path). */
export function disableLayerPbf(layer: any): void {
  if (!layer) return;
  try {
    if (Object.prototype.hasOwnProperty.call(layer, "pbfEnabled")) {
      layer.pbfEnabled = false;
    }
  } catch {
    /* ignore */
  }
}
// Install as early as possible — before map layers start fetching PBF tiles.
void installPbfJsonWorkaround();
let esriRequestPromise: Promise<any> | null = null;
export async function getEsriRequest(): Promise<any> {
  if (!esriRequestPromise) {
    esriRequestPromise = (async () => {
      const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
      return esriRequest;
    })();
  }
  return esriRequestPromise;
}
export function getQueryUrl(layer: any): string {
  const base = String(layer?.url || "").replace(/\/+$/, "");
  if (!base) return "";
  const layerId = layer?.layerId;
  const hasIndex = /\/\d+$/.test(base);
  const withIndex =
    hasIndex || layerId === undefined || layerId === null
      ? base
      : `${base}/${layerId}`;
  return `${withIndex}/query`;
}
export const QUERY_CACHE_TTL_MS = 60 * 60 * 1000;
type TimedPromiseCache<T> = Map<string, { expires: number; value: Promise<T> }>;
export const queryCountCache: TimedPromiseCache<number> = new Map();
export const queryStatsCache: TimedPromiseCache<Array<Record<string, any>>> = new Map();
export const queryJsonCache: TimedPromiseCache<any> = new Map();
export function pruneTimedCache<T>(
  cache: TimedPromiseCache<T>,
  now = Date.now(),
): void {
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }
}
export function cacheKey(layer: any, kind: string, payload: string): string {
  return `${getQueryUrl(layer) || layerLabel(layer)}|${kind}|${payload}`;
}
export function stableCachePayload(value: unknown): string {
  if (value === undefined) return "__undefined__";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableCachePayload(item)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableCachePayload(obj[key])}`)
    .join(",")}}`;
}
let extentClassPromise: Promise<any> | null = null;
export async function getExtentClass(): Promise<any> {
  if (!extentClassPromise) {
    extentClassPromise = loadArcGISJSAPIModules([
      "esri/geometry/Extent",
    ]).then(([Extent]) => Extent);
  }
  return extentClassPromise;
}
/** Validate extent envelope before view.goTo (guards null / world bounds). */
export function isValidMapExtent(extent: any): boolean {
  if (!extent) return false;
  const xmin = Number(extent.xmin ?? 0);
  const ymin = Number(extent.ymin ?? 0);
  const xmax = Number(extent.xmax ?? 0);
  const ymax = Number(extent.ymax ?? 0);
  return (
    Number.isFinite(xmin) &&
    Number.isFinite(ymin) &&
    Number.isFinite(xmax) &&
    Number.isFinite(ymax) &&
    !(xmin === 0 && ymin === 0 && xmax === 0 && ymax === 0) &&
    !(xmin === -180 && ymin === -90 && xmax === 180 && ymax === 90) &&
    Math.abs(xmax - xmin) > 0.001 &&
    Math.abs(ymax - ymin) > 0.001
  );
}
export interface PickWhereWithMavsumFallbackResult {
  where: string;
  count: number;
  mavsumRelaxed: boolean;
  landTypeRelaxed?: boolean;
}
export interface PickWhereProgressiveResult {
  where: string;
  count: number;
  mavsumRelaxed: boolean;
  landTypeRelaxed: boolean;
}

export async function getDetachedQueryLayerForUrl(url: string): Promise<any | null> {
  const cleanUrl = String(url || "").trim().replace(/\/+$/, "");
  if (!cleanUrl) return null;
  await ensureAgriServerIdentityToken();
  if (detachedQueryLayerFailedUrls.has(cleanUrl)) return null;
  // FeatureLayer requires a layer endpoint (.../MapServer/0 or FeatureServer/N).
  // MapServer roots fail #load() and only spam the console.
  if (
    !/\/(?:MapServer|FeatureServer)\/\d+$/i.test(cleanUrl) &&
    !/\/FeatureServer$/i.test(cleanUrl)
  ) {
    detachedQueryLayerFailedUrls.add(cleanUrl);
    return null;
  }
  let layer = detachedQueryLayerCache.get(cleanUrl);
  if (!layer) {
    try {
      const [FeatureLayer] = await loadArcGISJSAPIModules([
        "esri/layers/FeatureLayer",
      ]);
      layer = new FeatureLayer({ url: cleanUrl });
      detachedQueryLayerCache.set(cleanUrl, layer);
    } catch (err) {
      if (isAuthFailureMessage(err)) {
        detachedQueryLayerAuthFailedUrls.add(cleanUrl);
      } else {
        detachedQueryLayerFailedUrls.add(cleanUrl);
      }
      return null;
    }
  }
  try {
    await layer.load();
  } catch (err) {
    detachedQueryLayerCache.delete(cleanUrl);
    if (isAuthFailureMessage(err)) {
      // Don't permanently blacklist — token may arrive a moment later.
      detachedQueryLayerAuthFailedUrls.add(cleanUrl);
      agriIdentityTokenRegistered = false;
    } else {
      // Group Layer endpoints and other unsupported sources — never retry.
      detachedQueryLayerFailedUrls.add(cleanUrl);
    }
    return null;
  }
  return layer;
}
