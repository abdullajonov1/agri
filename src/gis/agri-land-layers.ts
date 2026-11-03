/**
 * Reserve / unused land polygons on the map. The two services do not share a
 * schema (`yil` or `year`, text or number), so every WHERE is built from the
 * fields of the layer it runs on, the same way the land indicator cards do.
 */
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { React } from "jimu-core";
import { bindMasterFilter } from "../data/agri-filter-bus";
import { buildTumanEqualsSql, eqAposSmart, normalizeApos } from "../data/agri-sql";
import { buildYearLikeClause, joinAndClauses } from "../controller/agri-where-builder";
import { panelEventDetail } from "../panels/panel-filter-detail";
import { combineAccessWhereIfFieldsExist } from "../shared/agri-access-config";
import { getAgriReserveLandUrl } from "./agri-reserve-land-data-source";
import { getAgriUnusedLandUrl } from "./agri-unused-land-data-source";
import type { AgriLandOverlay } from "../store/agri-land-overlay-store";
import { collectRegionYearLeafLayers } from "./feature-layer/lookup/lookup-region-year";
import type { AgriMapLike } from "./agri-layer-types";

export interface AgriLandScope {
  yil: string;
  viloyat: string;
  tuman: string;
  lockedViloyat: string;
}

const EMPTY_SCOPE: AgriLandScope = { yil: "", viloyat: "", tuman: "", lockedViloyat: "" };

const NUMERIC_FIELD_TYPES = new Set([
  "small-integer",
  "integer",
  "single",
  "double",
  "long",
  "oid",
]);

type LandLayerFields = Pick<__esri.FeatureLayer, "fields">;

function landField(layer: LandLayerFields, ...names: string[]): __esri.Field | null {
  const fields = Array.isArray(layer.fields) ? layer.fields : [];
  for (const name of names) {
    const hit = fields.find((field) => String(field?.name || "").toLowerCase() === name);
    if (hit) return hit;
  }
  return null;
}

function landYearClause(field: __esri.Field, yil: string): string {
  const digits = yil.match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
  if (digits && NUMERIC_FIELD_TYPES.has(String(field.type || "").toLowerCase())) {
    return `${field.name} = ${Number(digits)}`;
  }
  return buildYearLikeClause(yil, { field: field.name });
}

function landTumanClause(layer: LandLayerFields, tuman: string): string {
  const normalized = normalizeApos(tuman);
  if (/^\d+$/.test(normalized)) {
    const district = landField(layer, "district");
    return district ? `${district.name} = '${Number(normalized)}'` : "";
  }
  const field = landField(layer, "tuman");
  return field ? buildTumanEqualsSql(field.name, tuman) : "";
}

/** WHERE for one land layer, or "" when the scope has no usable year yet. */
export function buildLandLayerWhere(layer: LandLayerFields, scope: AgriLandScope): string {
  const yearField = landField(layer, "yil", "year");
  const yearClause = yearField && scope.yil ? landYearClause(yearField, scope.yil) : "";
  if (!yearClause) return "";

  const clauses = [yearClause];
  const viloyat = scope.lockedViloyat || scope.viloyat;
  const viloyatField = landField(layer, "viloyat");
  if (viloyat && viloyatField) {
    const clause = eqAposSmart(viloyatField.name, viloyat);
    if (clause) clauses.push(clause);
  }
  if (scope.tuman) {
    const clause = landTumanClause(layer, scope.tuman);
    if (clause) clauses.push(clause);
  }
  return combineAccessWhereIfFieldsExist(
    joinAndClauses(clauses, "1=1"),
    (layer.fields || []).map((field) => String(field?.name || "")),
  );
}

/** No viloyat chosen (nor locked by access): the whole republic. */
export function isRepublicLandScope(scope: AgriLandScope): boolean {
  return !String(scope.viloyat || "").trim() && !String(scope.lockedViloyat || "").trim();
}

/** Year + geography from the master filter. Crop / VH selections do not apply. */
export function useAgriLandScope(): AgriLandScope {
  const [scope, setScope] = React.useState(EMPTY_SCOPE);
  React.useEffect(
    () =>
      bindMasterFilter((event) => {
        const detail = panelEventDetail(event);
        const filters = detail.filters;
        if (!filters) return;
        const next: AgriLandScope = {
          yil: String(filters.yil || ""),
          viloyat: String(filters.viloyat || ""),
          tuman: String(filters.tuman || ""),
          lockedViloyat: String(detail.scope?.lockedViloyat || ""),
        };
        setScope((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next,
        );
      }),
    [],
  );
  return scope;
}

const LAND_LAYERS: Record<AgriLandOverlay, { service: string; title: string; getUrl: () => string }> = {
  reserve: {
    service: "agri_reserve_land",
    title: "agri reserve land",
    getUrl: getAgriReserveLandUrl,
  },
  unused: {
    service: "agri_unused_land",
    title: "agri unused land",
    getUrl: getAgriUnusedLandUrl,
  },
};

const LAND_OVERLAYS = Object.keys(LAND_LAYERS) as AgriLandOverlay[];

function findMapLandLayer(map: __esri.Map, overlay: AgriLandOverlay): __esri.FeatureLayer | null {
  const { service, title } = LAND_LAYERS[overlay];
  const layers = (map.allLayers?.toArray?.() || []) as __esri.FeatureLayer[];
  const hit = layers.find((layer) => {
    if (String(layer?.type || "").toLowerCase() !== "feature") return false;
    return (
      String(layer.url || "").toLowerCase().includes(service) ||
      String(layer.title || "").trim().toLowerCase() === title
    );
  });
  return hit || null;
}

const addedLayers = new WeakMap<__esri.Map, Map<AgriLandOverlay, Promise<__esri.FeatureLayer>>>();

/** Map without the WebMap layer: draw the same service from its known URL. */
function addLandLayer(map: __esri.Map, overlay: AgriLandOverlay): Promise<__esri.FeatureLayer> {
  let added = addedLayers.get(map);
  if (!added) {
    added = new Map();
    addedLayers.set(map, added);
  }
  let pending = added.get(overlay);
  if (!pending) {
    pending = loadArcGISJSAPIModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
      const layer = new FeatureLayer({
        url: LAND_LAYERS[overlay].getUrl(),
        visible: false,
      }) as __esri.FeatureLayer;
      map.add(layer);
      return layer;
    });
    added.set(overlay, pending);
  }
  return pending;
}

function hideInactiveLandLayers(map: __esri.Map, active: AgriLandOverlay | null): void {
  for (const overlay of LAND_OVERLAYS) {
    if (overlay === active) continue;
    const layer = findMapLandLayer(map, overlay);
    if (layer && layer.visible) layer.visible = false;
  }
}

/**
 * A WebMap may carry the land layers switched on, and its layers arrive after
 * the view is handed over. Hide every land layer that is not switched on the
 * moment it shows up, so nothing is fetched for it (republic-wide polygons)
 * until the user turns it on. Returns the unsubscribe.
 */
export function holdInactiveLandLayersHidden(
  view: __esri.MapView,
  getActive: () => AgriLandOverlay | null,
): () => void {
  const map = view.map;
  if (!map) return () => undefined;
  const hide = (): void => hideInactiveLandLayers(map, getActive());
  hide();
  const handle = (map.allLayers as unknown as {
    on?: (name: "change", cb: () => void) => { remove: () => void };
  })?.on?.("change", hide);
  return () => handle?.remove();
}

let latestSync = 0;

/**
 * Show only `active`, filtered to `scope`; the other land layer is hidden.
 * Resolves to the layer now on the map, or null (nothing shown / superseded).
 */
export async function syncAgriLandLayers(
  view: __esri.MapView,
  active: AgriLandOverlay | null,
  scope: AgriLandScope,
  /** Reserve only: the crop clicked on the reserve chart. */
  reserveCropWhere = "",
  /**
   * Runs on the filtered layer before it is shown (crop colours). A failure
   * keeps the layer's own renderer; `isStale` is true once a newer sync began.
   */
  beforeShow?: (layer: __esri.FeatureLayer, isStale: () => boolean) => Promise<unknown>,
): Promise<__esri.FeatureLayer | null> {
  const sync = ++latestSync;
  const map = view.map;
  if (!map) return null;

  hideInactiveLandLayers(map, active);
  // Switched off: no layer is created, loaded or queried.
  if (!active) return null;

  // Only the land polygons stay on the map. Localization brings the field
  // layers back (repaint on overlay change) once the overlay is switched off.
  for (const leaf of collectRegionYearLeafLayers(map as unknown as AgriMapLike)) {
    try {
      leaf.visible = false;
    } catch {
      /* some layer types reject direct visibility writes */
    }
  }

  // Republic: land polygons are too many to draw — the map stays empty (the
  // reserve widgets still show their numbers). Nothing is created or queried.
  if (isRepublicLandScope(scope)) {
    const layer = findMapLandLayer(map, active);
    if (layer) layer.visible = false;
    return null;
  }

  const layer = findMapLandLayer(map, active) || (await addLandLayer(map, active));
  await layer.load();
  if (sync !== latestSync) return null;
  const where = buildLandLayerWhere(layer, scope);
  const crop = active === "reserve" ? reserveCropWhere.trim() : "";
  layer.definitionExpression = !where ? "1=0" : crop ? `(${where}) AND (${crop})` : where;
  if (where && beforeShow) {
    const isStale = (): boolean => sync !== latestSync;
    try {
      await beforeShow(layer, isStale);
    } catch {
      /* colours only — show the polygons anyway */
    }
    if (isStale()) return null;
  }
  layer.visible = true;
  return where ? layer : null;
}
