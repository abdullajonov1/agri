/**
 * ArcGIS module loading, server-token registration, service URLs and the
 * off-map query FeatureLayers used by the admin-boundary outlines.
 */
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Graphic from "esri/Graphic";
import type IdentityManager from "esri/identity/IdentityManager";
import type EsriMap from "esri/Map";
import type Collection from "esri/core/Collection";
import {
  getAgriPortalSharingRestUrl,
  getAgriServiceUrls,
} from "../../shared/agri-service-urls";
import { readAgriAuthToken } from "../agri-auth-token";

export interface BoundaryModules {
  FeatureLayer: typeof FeatureLayer;
  GraphicsLayer: typeof GraphicsLayer;
  Graphic: typeof Graphic;
  IdentityManager: typeof IdentityManager;
}

/** The members of MapView / SceneView the boundary code touches. */
export interface AdminBoundaryView {
  map?: EsriMap | null;
  graphics?: Collection<Graphic> | null;
  resolution?: number;
}

export function getAgriRegionBoundaryUrl(): string {
  return getAgriServiceUrls().adminRegionsUrl;
}

export function getAgriDistrictBoundaryUrl(): string {
  return getAgriServiceUrls().adminDistrictsUrl;
}

export function getAgriDistrictBoundaryFallbackUrl(): string {
  return getAgriServiceUrls().adminDistrictsFallbackUrl;
}

/** Candidate FeatureServer layer URLs for district polygons. */
export function getDistrictLayerUrlCandidates(): string[] {
  const primary = getAgriDistrictBoundaryUrl();
  const fallback = getAgriDistrictBoundaryFallbackUrl();
  const urls: string[] = [];
  // Tuman_chegara first — Evapo-style SOATO borders (Hosted/district often empty/broken).
  if (fallback) urls.push(fallback);
  // Only the configured Hosted layer — probing sibling indexes /0…/5 floods the
  // console with request:server errors when those layers do not exist.
  if (primary) urls.push(primary);
  return Array.from(new Set(urls.filter(Boolean)));
}

let modulesPromise: Promise<BoundaryModules> | null = null;

export async function loadBoundaryModules(): Promise<BoundaryModules> {
  if (!modulesPromise) {
    modulesPromise = loadArcGISJSAPIModules([
      "esri/layers/FeatureLayer",
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
      "esri/identity/IdentityManager",
    ]).then(
      ([FeatureLayerClass, GraphicsLayerClass, GraphicClass, identityManager]) => ({
        FeatureLayer: FeatureLayerClass as typeof FeatureLayer,
        GraphicsLayer: GraphicsLayerClass as typeof GraphicsLayer,
        Graphic: GraphicClass as typeof Graphic,
        IdentityManager: identityManager as typeof IdentityManager,
      }),
    );
  }
  return modulesPromise;
}

export function registerServerToken(identityManager: typeof IdentityManager): void {
  // Only well-known EXB auth storage — do not scan generic keys like "token"
  // (could pick up unrelated app secrets and forward them to ArcGIS Server).
  const token = readAgriAuthToken({ allowGenericStorageKeys: false });
  if (!token) return;
  const arcgisServer = getAgriServiceUrls().arcgisServer.replace(/\/$/, "");
  for (const server of [
    `${arcgisServer}/rest/services`,
    `${arcgisServer}/rest`,
    arcgisServer,
    getAgriPortalSharingRestUrl(),
  ]) {
    try {
      identityManager.registerToken({ server, token });
    } catch {
      /* best effort — one bad server prefix must not block the others */
    }
  }
}

const detachedQueryLayers = new Map<string, FeatureLayer>();
/** URLs whose FeatureLayer.load() already failed this session — skip re-probe. */
const failedDetachedQueryUrls = new Set<string>();

/**
 * Off-map FeatureLayer used only for queryFeatures / queryExtent.
 * Never added to the view — that is what triggered the failing PBF tiles.
 */
export async function getDetachedQueryLayer(
  FeatureLayerClass: typeof FeatureLayer,
  url: string,
): Promise<FeatureLayer> {
  const key = String(url || "").trim();
  if (!key) throw new Error("empty district layer url");
  if (failedDetachedQueryUrls.has(key)) {
    throw new Error(`district layer previously failed: ${key}`);
  }
  let layer = detachedQueryLayers.get(key);
  if (!layer) {
    layer = new FeatureLayerClass({
      url: key,
      outFields: ["*"],
    });
    detachedQueryLayers.set(key, layer);
  }
  try {
    if (typeof layer.load === "function") await layer.load();
  } catch (err) {
    detachedQueryLayers.delete(key);
    failedDetachedQueryUrls.add(key);
    throw err instanceof Error ? err : new Error(String(err));
  }
  return layer;
}
