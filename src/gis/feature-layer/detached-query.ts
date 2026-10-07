/**
 * Off-map ("detached") FeatureLayer clients + ArcGIS JS API module loaders,
 * server token registration and the PBF→JSON request workaround.
 */
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import type esriRequestFn from "esri/request";
import type Extent from "esri/geometry/Extent";
import type FeatureLayer from "esri/layers/FeatureLayer";
import type IdentityManager from "esri/identity/IdentityManager";
import type esriConfigType from "esri/config";
import { getAgriServiceUrls, getAgriPortalSharingRestUrl } from "../../shared/agri-service-urls";
import { readAgriAuthToken } from "../agri-auth-token";
import { errorMessage } from "../agri-layer-types";
import { flLog } from "./query-cache";

type FeatureLayerConstructor = typeof FeatureLayer;
type ExtentConstructor = typeof Extent;
export type EsriRequest = typeof esriRequestFn;

/**
 * Off-map FeatureLayer clients per service URL. Querying a live MapImage
 * Sublayer (createQuery/queryFeatures/queryExtent/load) rehydrates it and can
 * clear its runtime definitionExpression — the map then exports and briefly
 * paints every district's fields until a guard restores the filter. Every
 * read-only query in filter/zoom/renderer flows must go through these
 * detached clients instead of the live layer.
 */
export const detachedQueryLayerCache = new Map<string, FeatureLayer>();
/** URLs that FeatureLayer#load() rejected (Group Layer / bad endpoint). */
export const detachedQueryLayerFailedUrls = new Set<string>();
/** Auth failures — cleared after IdentityManager token registration so we retry. */
export const detachedQueryLayerAuthFailedUrls = new Set<string>();
export let agriIdentityTokenRegistered = false;

interface EsriErrorLike {
  message?: unknown;
  code?: unknown;
  httpStatus?: unknown;
  details?: { message?: unknown; httpStatus?: unknown } | null;
}

export function isAuthFailureMessage(err: unknown): boolean {
  const e: EsriErrorLike =
    err && typeof err === "object" ? (err as EsriErrorLike) : {};
  const msg = String(e.message || e.details?.message || err || "").toLowerCase();
  const status = Number(e.details?.httpStatus ?? e.httpStatus ?? e.code ?? 0);
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
  const token = readAgriAuthToken({ allowGenericStorageKeys: true });
  if (!token) return agriIdentityTokenRegistered;
  try {
    const [identityManager] = (await loadArcGISJSAPIModules([
      "esri/identity/IdentityManager",
    ])) as [typeof IdentityManager];
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
    agriIdentityTokenRegistered = true;
    // Prior loads that failed with 499 can succeed now.
    for (const url of Array.from(detachedQueryLayerAuthFailedUrls)) {
      detachedQueryLayerAuthFailedUrls.delete(url);
      detachedQueryLayerFailedUrls.delete(url);
      detachedQueryLayerCache.delete(url);
    }
    return true;
  } catch {
    // IdentityManager module failed to load — keep the previous state.
    return agriIdentityTokenRegistered;
  }
}

/**
 * Workaround for servers returning malformed PBF ("Error while parsing
 * FeatureSet PBF payload"): rewrite f=pbf -> f=json on query requests so both
 * map rendering and our statistics queries get JSON.
 */
let pbfInterceptorInstalled = false;
export async function installPbfJsonWorkaround(): Promise<void> {
  if (pbfInterceptorInstalled) return;
  pbfInterceptorInstalled = true;
  try {
    const [esriConfig] = (await loadArcGISJSAPIModules(["esri/config"])) as [
      typeof esriConfigType,
    ];
    const interceptors = esriConfig?.request?.interceptors;
    if (!interceptors) return;
    interceptors.push({
      urls: /sgm\.uzspace\.uz/i,
      before: (params) => {
        const request = params as {
          requestOptions?: { query?: Record<string, unknown> };
        };
        const q = request?.requestOptions?.query;
        if (!q || typeof q !== "object") return;
        const fmt = String(q.f ?? "").toLowerCase();
        if (fmt === "pbf") q.f = "json";
      },
    });
    flLog("PBF→JSON interceptor installed for sgm.uzspace.uz");
  } catch (err: unknown) {
    flLog("PBF→JSON interceptor FAILED", { error: errorMessage(err) });
  }
}

// Install as early as possible — before map layers start fetching PBF tiles.
void installPbfJsonWorkaround();

let esriRequestPromise: Promise<EsriRequest> | null = null;
export async function getEsriRequest(): Promise<EsriRequest> {
  if (!esriRequestPromise) {
    esriRequestPromise = loadArcGISJSAPIModules(["esri/request"]).then(
      ([esriRequest]) => esriRequest as EsriRequest,
    );
  }
  return esriRequestPromise;
}

let extentClassPromise: Promise<ExtentConstructor> | null = null;
export async function getExtentClass(): Promise<ExtentConstructor> {
  if (!extentClassPromise) {
    extentClassPromise = loadArcGISJSAPIModules([
      "esri/geometry/Extent",
    ]).then(([ExtentClass]) => ExtentClass as ExtentConstructor);
  }
  return extentClassPromise;
}

function rememberLoadFailure(cleanUrl: string, err: unknown): void {
  if (isAuthFailureMessage(err)) {
    // Don't permanently blacklist — token may arrive a moment later.
    detachedQueryLayerAuthFailedUrls.add(cleanUrl);
  } else {
    // Group Layer endpoints and other unsupported sources — never retry.
    detachedQueryLayerFailedUrls.add(cleanUrl);
  }
}

export async function getDetachedQueryLayerForUrl(url: string): Promise<FeatureLayer | null> {
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
      const [FeatureLayerClass] = (await loadArcGISJSAPIModules([
        "esri/layers/FeatureLayer",
      ])) as [FeatureLayerConstructor];
      layer = new FeatureLayerClass({ url: cleanUrl });
      detachedQueryLayerCache.set(cleanUrl, layer);
    } catch (err) {
      rememberLoadFailure(cleanUrl, err);
      return null;
    }
  }
  try {
    await layer.load();
  } catch (err) {
    detachedQueryLayerCache.delete(cleanUrl);
    rememberLoadFailure(cleanUrl, err);
    if (isAuthFailureMessage(err)) agriIdentityTokenRegistered = false;
    return null;
  }
  return layer;
}
