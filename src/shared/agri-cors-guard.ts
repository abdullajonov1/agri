/**
 * Keeps one failed request from breaking every request to the Agri servers.
 *
 * ArcGIS JS API (4.31 request.js): when a cross-origin GET fails with a
 * network TypeError (e.g. an error page sent without CORS headers, such as the
 * IIS "Access to this data is not allowed for your territory" 403), the API
 * adds a proxy rule for the WHOLE host through `esriConfig.request.proxyUrl`,
 * which jimu-arcgis sets to `<portal>/sharing/proxy`. The sgm.uzspace.uz
 * portal proxy answers 403, so after that single failure every later request
 * to the host fails too — the WebMap item included ("Failed to load portal
 * item"; Select data then shows the WebMap without its layers).
 *
 * The API never adds that rule for a host in `request.trustedServers`, so the
 * Agri hosts are listed there and a rule that was already added is removed.
 * Only ArcGIS hosts are trusted (requests to them carry credentials); the
 * polygon REST API is a different service and is left alone.
 */
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { DataSourceManager, getAppStore, type DataSource } from "jimu-core";
import { getAgriServiceUrls, type AgriServiceUrls } from "./agri-service-urls";

interface ProxyRuleLike {
  proxyUrl?: string;
  urlPrefix?: string;
}

export interface RequestConfigLike {
  trustedServers?: string[];
  proxyRules?: ProxyRuleLike[];
}

/** Service URL keys that are not ArcGIS hosts. */
const NON_ARCGIS_KEYS: ReadonlyArray<keyof AgriServiceUrls> = ["polygonApiBaseUrl"];

/** "https://host[:port]" of an http(s) URL, "" otherwise. */
export function originOf(url: unknown): string {
  const text = String(url ?? "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  try {
    return new URL(text).origin.toLowerCase();
  } catch {
    return "";
  }
}

/** Host of a proxy rule prefix ("sgm.uzspace.uz/" or "https://sgm.uzspace.uz/x"). */
function ruleHost(urlPrefix: unknown): string {
  const text = String(urlPrefix ?? "").trim().toLowerCase();
  if (!text) return "";
  const withoutProtocol = text.replace(/^[a-z]+:\/\//, "").replace(/^\/\//, "");
  return withoutProtocol.split("/")[0];
}

/** The portal's built-in proxy — the one the JS API falls back to. */
const isPortalSharingProxy = (proxyUrl: unknown): boolean =>
  /\/sharing\/proxy\/?(\?.*)?$/i.test(String(proxyUrl ?? "").trim());

/**
 * Trust every origin of `urls` and drop portal-proxy rules for their hosts.
 * Mutates `request` in place (the JS API reads these arrays on each request).
 */
export function applyAgriCorsGuard(
  request: RequestConfigLike | null | undefined,
  urls: readonly unknown[],
): { added: string[]; removedRules: number } {
  const result = { added: [] as string[], removedRules: 0 };
  if (!request) return result;
  const origins = Array.from(new Set(urls.map(originOf).filter(Boolean)));
  if (!origins.length) return result;

  if (!Array.isArray(request.trustedServers)) request.trustedServers = [];
  const trusted = request.trustedServers;
  for (const origin of origins) {
    const known = trusted.some((entry) => {
      const value = String(entry || "").trim().toLowerCase().replace(/\/+$/, "");
      return value === origin || value === origin.replace(/^https?:\/\//, "");
    });
    if (!known) {
      trusted.push(origin);
      result.added.push(origin);
    }
  }

  const hosts = new Set(origins.map((origin) => origin.replace(/^https?:\/\//, "")));
  const rules = request.proxyRules;
  if (Array.isArray(rules)) {
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (hosts.has(ruleHost(rule?.urlPrefix)) && isPortalSharingProxy(rule?.proxyUrl)) {
        rules.splice(i, 1);
        result.removedRules += 1;
      }
    }
  }
  return result;
}

/** ArcGIS URLs the widget talks to: configured services + the app portal. */
export function collectAgriArcgisUrls(): string[] {
  const urls = getAgriServiceUrls();
  const list = (Object.keys(urls) as Array<keyof AgriServiceUrls>)
    .filter((key) => !NON_ARCGIS_KEYS.includes(key))
    .map((key) => urls[key]);
  try {
    const state = getAppStore().getState() as unknown as { portalUrl?: string };
    if (state?.portalUrl) list.push(state.portalUrl);
  } catch {
    /* no store (tests) */
  }
  return list;
}

interface DataSourceJsonStateLike {
  appStateInBuilder?: { appConfig?: { dataSources?: Record<string, unknown> } };
  appConfig?: { dataSources?: Record<string, unknown> };
}

/**
 * JSON of a data source of the edited app. In the Builder window
 * `appConfig` is Builder's own config (no app data sources); the app being
 * edited lives in `appStateInBuilder.appConfig`.
 */
export function findDataSourceJson(state: unknown, dataSourceId: string): unknown {
  const s = (state || {}) as DataSourceJsonStateLike;
  return (
    s.appStateInBuilder?.appConfig?.dataSources?.[dataSourceId] ??
    s.appConfig?.dataSources?.[dataSourceId] ??
    null
  );
}

/**
 * A data source that failed (e.g. while the proxy rule was in place) stays
 * failed; destroy and create it again. Waits for child layers when asked
 * (Select data lists a WebMap's layers only once they exist).
 *
 * Created from its JSON, not its id: `createDataSource(id)` looks the id up in
 * `appConfig`, which in the Builder window has no app data sources — the
 * settings then destroyed the WebMap and could not create it again.
 */
export async function recreateDataSource(
  dataSourceId: string,
  waitForChildren = false,
): Promise<DataSource> {
  const manager = DataSourceManager.getInstance();
  let json: unknown = null;
  try {
    json = findDataSourceJson(getAppStore().getState(), dataSourceId);
  } catch {
    /* no store (tests) */
  }
  // Without its JSON it could not be created again — keep the current one.
  if (!json) throw new Error(`No data source JSON for ${dataSourceId}`);
  try {
    manager.destroyDataSource(dataSourceId);
  } catch {
    /* was never created */
  }
  const dataSource = await manager.createDataSource(
    json as Parameters<typeof manager.createDataSource>[0],
  );
  if (waitForChildren && dataSource?.isDataSourceSet?.()) {
    await dataSource.childDataSourcesReady();
  }
  return dataSource;
}

/** The parts of an `esri/identity/Credential` read here. */
export interface CredentialLike {
  server?: string;
  token?: string;
  expires?: number;
}

/** The parts of the `params` an `esri/config` interceptor's `before` gets. */
export interface InterceptParamsLike {
  url?: string;
  requestOptions?: { query?: Record<string, unknown> | null };
}

export interface InterceptorLike {
  urls?: string | RegExp | Array<string | RegExp>;
  before?: (params: InterceptParamsLike) => void;
  /** Marks the interceptor added here, so a second install replaces it. */
  agriPortalToken?: true;
}

/** Lower-case URL without trailing slashes. */
const normalizeUrl = (url: unknown): string =>
  String(url ?? "").trim().toLowerCase().replace(/\/+$/, "");

/** A credential that still has more than a minute left (or no expiry). */
const isLive = (credential: CredentialLike, now: number): boolean =>
  !!credential.token && (!credential.expires || credential.expires > now + 60_000);

/** Token of the signed-in portal, "" when there is none (or it expired). */
export function findPortalToken(
  credentials: readonly CredentialLike[] | null | undefined,
  portalUrl: unknown,
  now: number = Date.now(),
): string {
  const portal = normalizeUrl(portalUrl);
  if (!portal) return "";
  const credential = (credentials || []).find(
    (entry) => normalizeUrl(entry?.server) === portal && isLive(entry, now),
  );
  return credential?.token || "";
}

/**
 * "<server>/rest/services/" prefixes of the ArcGIS Servers that get the
 * portal token: only servers on the portal's own origin.
 */
export function agriTokenServerPrefixes(portalUrl: unknown, serverUrls: readonly unknown[]): string[] {
  const portal = normalizeUrl(portalUrl);
  const portalOrigin = originOf(portal);
  if (!portalOrigin) return [];
  const prefixes = new Set<string>();
  for (const serverUrl of serverUrls) {
    const base = normalizeUrl(serverUrl).replace(/\/rest\/services(\/.*)?$/, "");
    if (!base || base === portal || originOf(base) !== portalOrigin) continue;
    prefixes.add(`${base}/rest/services/`);
  }
  return Array.from(prefixes);
}

/** Add `token` to a request that has none. */
export function addTokenToRequest(params: InterceptParamsLike, token: string): void {
  if (!token || !params) return;
  if (/[?&]token=/i.test(String(params.url || ""))) return;
  const options = params.requestOptions || (params.requestOptions = {});
  const query = options.query || {};
  if (query.token) return;
  options.query = { ...query, token };
}

/**
 * Puts (or replaces) the portal-token interceptor first in `interceptors`.
 * The JS API uses only the first interceptor whose `urls` match a request.
 */
export function applyAgriTokenInterceptor(
  request: { interceptors?: InterceptorLike[] } | null | undefined,
  prefixes: readonly string[],
  getToken: () => string,
): boolean {
  if (!request || !prefixes.length) return false;
  if (!Array.isArray(request.interceptors)) request.interceptors = [];
  const list = request.interceptors;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i]?.agriPortalToken) list.splice(i, 1);
  }
  list.unshift({
    agriPortalToken: true,
    // The JS API matches string prefixes case-sensitively; these are lower-case.
    urls: prefixes.map(
      (prefix) => new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "i"),
    ),
    before: (params) => { addTokenToRequest(params, getToken()); },
  });
  return true;
}

interface IdentityManagerLike {
  credentials?: CredentialLike[];
}

/**
 * Sends the signed-in portal token with every Agri ArcGIS Server request.
 *
 * The Agri services sit behind an IIS rule that answers a request WITHOUT a
 * token with 403 "Access to this data is not allowed for your territory" and
 * no CORS headers, instead of ArcGIS Server's 499 "Token Required". The JS
 * API's first request to a layer carries no token, the browser reports only
 * "Failed to fetch", and the API never learns it should sign in — so in
 * Builder every layer of the WebMap failed and Select data could not expand
 * it (2026-11-05: only the portal had a credential; the same request with
 * the portal token returned 200). `registerToken` does not help: the API
 * attaches a credential only to services listed in its `resources`.
 * The token is read on each request, so a refreshed portal token is used.
 * Never throws.
 */
export async function installAgriTokenInterceptor(): Promise<boolean> {
  try {
    const urls = getAgriServiceUrls();
    const prefixes = agriTokenServerPrefixes(urls.portalUrl, [urls.arcgisServer]);
    if (!prefixes.length) return false;
    const [esriConfig, identityManager] = (await loadArcGISJSAPIModules([
      "esri/config",
      "esri/identity/IdentityManager",
    ])) as [
      { request?: { interceptors?: InterceptorLike[] } } | undefined,
      IdentityManagerLike | undefined,
    ];
    return applyAgriTokenInterceptor(esriConfig?.request, prefixes, () =>
      findPortalToken(identityManager?.credentials, urls.portalUrl),
    );
  } catch {
    return false;
  }
}

/** Apply the guard to the live `esri/config` and send the portal token. Never throws. */
export async function installAgriCorsGuard(
  urls: readonly unknown[] = collectAgriArcgisUrls(),
): Promise<{ added: string[]; removedRules: number; tokenInterceptor: boolean }> {
  const tokenInterceptor = await installAgriTokenInterceptor();
  try {
    const [esriConfig] = (await loadArcGISJSAPIModules(["esri/config"])) as [
      { request?: RequestConfigLike } | undefined,
    ];
    return { ...applyAgriCorsGuard(esriConfig?.request, urls), tokenInterceptor };
  } catch {
    return { added: [], removedRules: 0, tokenInterceptor };
  }
}
