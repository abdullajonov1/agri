jest.mock("jimu-arcgis", () => ({ JimuMapView: class {} }));
jest.mock("esri/request", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("jimu-core", () => ({ getAppStore: jest.fn() }));
jest.mock("../../../../../../shared/agri-service-urls", () => ({
  getAgriServiceUrls: jest.fn(() => ({ portalUrl: "https://portal.example" })),
}));
jest.mock("../../../../../../gis/agri-data-layer-roles", () => ({
  dispatchMapViewReady: jest.fn(),
  dispatchMapClick: jest.fn(),
}));
jest.mock("../../../../../../shared/map-connection-service", () => ({
  MAX_DS_ONLY_RETRIES: 2,
  DS_ONLY_RETRY_DELAY_MS: 500,
}));
jest.mock("../../../../../../shared/agri-access-config", () => ({
  isAccessConfigured: jest.fn(),
  isAccessDenied: jest.fn(),
  resolveAllowedViloyatsForGroups: jest.fn(),
  lockedViloyat: "",
}));
jest.mock("../../../../../../shared/agri-http", () => ({ AGRI_ESRI_REQUEST_TIMEOUT_MS: 1000 }));
jest.mock("../../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import type { JimuMapView } from "jimu-arcgis";
import esriRequest from "esri/request";
import { getAppStore } from "jimu-core";
import { getAgriServiceUrls } from "../../../../../../shared/agri-service-urls";
import { dispatchMapClick, dispatchMapViewReady } from "../../../../../../gis/agri-data-layer-roles";
import * as access from "../../../../../../shared/agri-access-config";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import {
  attachMapClickDispatcher,
  finalizeConnection,
  getEffectiveUseDataSources,
  getPortalSelf,
  initializeDataSourceOnlyConnection,
  initializeMapConnection,
  initializeMapConnectionOnce,
  onActiveViewChange,
  reassertPolygonGeographyFilter,
} from "./connection-init";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
const accessMock = access as unknown as { lockedViloyat: string };
const flush = async (): Promise<void> => { for (let i = 0; i < 8; i += 1) await Promise.resolve(); };
const asView = (o: object): JimuMapView => o as unknown as JimuMapView;
const layer = (o: object = {}): __esri.FeatureLayer => ({ title: "L", ...o }) as unknown as __esri.FeatureLayer;

beforeEach(() => {
  jest.resetAllMocks();
  m(getAgriServiceUrls).mockReturnValue({ portalUrl: "https://portal.example" });
  accessMock.lockedViloyat = "";
});

describe("getPortalSelf", () => {
  it("reads username and groups from the community self endpoint", async () => {
    m(esriRequest).mockResolvedValue({ data: { username: "u", groups: [{ id: "1", title: "G", extra: 1 }] } });
    const res = await getPortalSelf(makeFakeHost(), asView({}));
    expect(res).toEqual({ username: "u", groups: [{ id: "1", title: "G" }], portalUrl: "https://portal.example" });
    expect(m(esriRequest).mock.calls[0][0]).toBe("https://portal.example/sharing/rest/community/self");
  });

  it("derives the portal from the web map or the default and tolerates missing data", async () => {
    m(getAgriServiceUrls).mockReturnValue({ portalUrl: "" });
    m(esriRequest).mockResolvedValue({ data: {} });
    const view = asView({ view: { map: { portalItem: { portal: { url: "https://wm" } } } } });
    expect((await getPortalSelf(makeFakeHost(), view)).portalUrl).toBe("https://wm");
    const res = await getPortalSelf(makeFakeHost(), asView({}));
    expect(res).toEqual({ username: null, groups: [], portalUrl: "https://www.arcgis.com" });
  });

  it("returns an anonymous fallback on request failure", async () => {
    m(esriRequest).mockRejectedValue(new Error("x"));
    expect(await getPortalSelf(makeFakeHost(), asView({}))).toEqual({ username: null, groups: [], portalUrl: "unknown" });
  });
});

describe("getEffectiveUseDataSources", () => {
  const ds = (n: number): never => Array.from({ length: n }, (_, i) => ({ dataSourceId: String(i) })) as never;
  it("returns all, limited by numberOfDataSources, handling asMutable and empty", () => {
    expect(getEffectiveUseDataSources(makeFakeHost({ props: { useDataSources: ds(3) } }))).toHaveLength(3);
    expect(getEffectiveUseDataSources(makeFakeHost({ props: { useDataSources: ds(3), config: { numberOfDataSources: 2 } } }))).toHaveLength(2);
    expect(getEffectiveUseDataSources(makeFakeHost({ props: { useDataSources: ds(1), config: { numberOfDataSources: 5 } } }))).toHaveLength(1);
    expect(getEffectiveUseDataSources(makeFakeHost({ props: { useDataSources: ds(2), config: { numberOfDataSources: 0 } } }))).toHaveLength(2);
    expect(getEffectiveUseDataSources(makeFakeHost({ props: { useDataSources: { asMutable: () => [{ dataSourceId: "x" }] } as never } }))).toHaveLength(1);
    expect(getEffectiveUseDataSources(makeFakeHost())).toEqual([]);
  });
});

describe("attachMapClickDispatcher", () => {
  interface FakeMapView {
    watch: jest.Mock;
    on: jest.Mock;
  }
  const mkView = (): { view: FakeMapView; jmv: JimuMapView; interactingHandle: { remove: jest.Mock }; clickHandle: { remove: jest.Mock } } => {
    const interactingHandle = { remove: jest.fn() };
    const clickHandle = { remove: jest.fn() };
    const view: FakeMapView = {
      watch: jest.fn(() => interactingHandle),
      on: jest.fn(() => clickHandle),
    };
    return { view, jmv: asView({ view }), interactingHandle, clickHandle };
  };

  it("does nothing without a view", () => {
    const h = makeFakeHost();
    attachMapClickDispatcher(h, asView({}));
    expect(h._mapClickHandle).toBeNull();
  });

  it("invalidates in-flight zooms on interaction and relays clicks", () => {
    const { view, jmv } = mkView();
    const h = makeFakeHost({ getMapWidgetId: () => "mw" });
    attachMapClickDispatcher(h, jmv);
    expect(dispatchMapViewReady).toHaveBeenCalledWith("mw");
    const watchCb = view.watch.mock.calls[0][1] as (v: boolean) => void;
    watchCb(true);
    watchCb(false);
    expect(h._zoomRequestId).toBe(1);
    const clickCb = view.on.mock.calls[0][1] as (e: object) => void;
    clickCb({ x: 5, y: 6, mapPoint: { x: 1, y: 2, spatialReference: { wkid: 4326 } } });
    expect(dispatchMapClick).toHaveBeenCalledWith({ mapWidgetId: "mw", x: 5, y: 6, mapPoint: { x: 1, y: 2, spatialReference: { wkid: 4326 } } });
    clickCb({});
    expect(m(dispatchMapClick).mock.calls[1][0]).toEqual({ mapWidgetId: "mw", x: 0, y: 0, mapPoint: undefined });
  });

  it("removes previous handles (tolerating removal errors) and skips dispatch without a widget id", () => {
    const { view, jmv } = mkView();
    const throwing = { remove: jest.fn(() => { throw new Error("x"); }) };
    const h = makeFakeHost({
      getMapWidgetId: () => null,
      _mapInteractionHandle: throwing as never,
      _mapClickHandle: throwing as never,
    });
    attachMapClickDispatcher(h, jmv);
    expect(throwing.remove).toHaveBeenCalledTimes(2);
    expect(dispatchMapViewReady).not.toHaveBeenCalled();
    (view.on.mock.calls[0][1] as (e: object) => void)({ x: 1 });
    expect(dispatchMapClick).not.toHaveBeenCalled();
  });
});

describe("onActiveViewChange", () => {
  it("clears map state when the view disappears", () => {
    const h = makeFakeHost();
    onActiveViewChange(h, null as unknown as JimuMapView);
    expect(h.state.activeMapView).toBeNull();
    expect(h.state.featureLayers).toEqual([]);
  });

  it("captures the home extent and connects immediately when the view is ready", () => {
    const clone = { c: 1 };
    const h = makeFakeHost({ attachMapClickDispatcher: jest.fn(), initializeMapConnection: jest.fn(() => Promise.resolve()) });
    onActiveViewChange(h, asView({ view: { ready: true, extent: { clone: () => clone } } }));
    expect(h.attachMapClickDispatcher).toHaveBeenCalled();
    expect(h._homeExtent).toBe(clone);
    expect(h.initializeMapConnection).toHaveBeenCalled();
  });

  it("uses the raw extent when it cannot clone and nulls it if reading throws", () => {
    const ext = { a: 1 };
    const h = makeFakeHost({ attachMapClickDispatcher: jest.fn(), initializeMapConnection: jest.fn() });
    onActiveViewChange(h, asView({ view: { ready: true, extent: ext } }));
    expect(h._homeExtent).toBe(ext);
    const bad = asView({ get view() { return { ready: true, get extent(): never { throw new Error("x"); } }; } });
    const h2 = makeFakeHost({ attachMapClickDispatcher: jest.fn(), initializeMapConnection: jest.fn() });
    onActiveViewChange(h2, bad);
    expect(h2._homeExtent).toBeNull();
  });

  it("waits for the view to become ready", () => {
    const handle = { remove: jest.fn() };
    const watch = jest.fn((_prop: string, _cb: (r: boolean) => void) => handle);
    const h = makeFakeHost({ attachMapClickDispatcher: jest.fn(), initializeMapConnection: jest.fn() });
    onActiveViewChange(h, asView({ view: { ready: false, extent: null, watch } }));
    expect(h.initializeMapConnection).not.toHaveBeenCalled();
    const cb = watch.mock.calls[0][1] as (r: boolean) => void;
    cb(false);
    expect(h.initializeMapConnection).not.toHaveBeenCalled();
    cb(true);
    expect(h.initializeMapConnection).toHaveBeenCalledTimes(1);
  });
});

describe("initializeMapConnection", () => {
  it("skips when unmounted or connected, de-duplicates concurrent runs and clears the promise", async () => {
    const once = jest.fn(() => Promise.resolve());
    await initializeMapConnection(makeFakeHost({ _isMounted: false, initializeMapConnectionOnce: once }), asView({}));
    await initializeMapConnection(makeFakeHost({ state: { connectionStatus: "connected" }, initializeMapConnectionOnce: once }), asView({}));
    expect(once).not.toHaveBeenCalled();
    const h = makeFakeHost({ initializeMapConnectionOnce: once });
    const p1 = initializeMapConnection(h, asView({}));
    const p2 = initializeMapConnection(h, asView({}));
    expect(p2).toBe(p1);
    await p1;
    expect(once).toHaveBeenCalledTimes(1);
    expect(h._mapConnectionPromise).toBeNull();
  });
});

describe("reassertPolygonGeographyFilter", () => {
  it("restores hidden shown layers while in polygon mode", () => {
    const hidden = { layer: { opacity: 0 } };
    const visible = { layer: { opacity: 1 } };
    const h = makeFakeHost({
      syncShownRegionYearLayers: jest.fn(() => [hidden, visible] as never),
      state: { polygonMode: true, activeMapView: { view: { map: {} } } as never },
    });
    reassertPolygonGeographyFilter(h, "p");
    expect(hidden.layer.opacity).toBe(1);
    expect(h._lastShownRegionYearLayers).toHaveLength(2);
  });

  it("does nothing outside polygon mode, when unmounted or without a map", () => {
    const sync = jest.fn(() => []);
    reassertPolygonGeographyFilter(makeFakeHost({ syncShownRegionYearLayers: sync, state: { polygonMode: false } }), "p");
    reassertPolygonGeographyFilter(makeFakeHost({ _isMounted: false, syncShownRegionYearLayers: sync, state: { polygonMode: true } }), "p");
    reassertPolygonGeographyFilter(makeFakeHost({ syncShownRegionYearLayers: sync, state: { polygonMode: true, activeMapView: null } }), "p");
    expect(sync).not.toHaveBeenCalled();
  });

  it("tolerates a layer whose opacity cannot be set", () => {
    const entry = { layer: Object.defineProperty({}, "opacity", { get: () => 0, set: () => { throw new Error("ro"); } }) };
    const h = makeFakeHost({
      syncShownRegionYearLayers: jest.fn(() => [entry] as never),
      state: { polygonMode: true, activeMapView: { view: { map: {} } } as never },
    });
    expect(() => reassertPolygonGeographyFilter(h, "p")).not.toThrow();
  });
});

describe("initializeMapConnectionOnce", () => {
  const mk = (init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      getEffectiveUseDataSources: () => [],
      resolveFeatureLayersFromUseDataSources: jest.fn(() => Promise.resolve([layer()])),
      resolveSpatialMapLayers: jest.fn(() => Promise.resolve([layer()])),
      finalizeConnection: jest.fn(() => Promise.resolve()),
      initializeDataSourceOnlyConnection: jest.fn(() => Promise.resolve()),
      ...init,
    });

  it("returns when unmounted", async () => {
    const h = mk({ _isMounted: false });
    await initializeMapConnectionOnce(h, asView({}));
    expect(h.finalizeConnection).not.toHaveBeenCalled();
  });

  it("finalizes with resolved layers and stores spatial layers in the background", async () => {
    const h = mk();
    await initializeMapConnectionOnce(h, asView({}));
    await flush();
    expect(h.finalizeConnection).toHaveBeenCalledTimes(1);
    expect(h.state.spatialMapLayers).toHaveLength(1);
  });

  it("falls back to the data-source-only path when no layers resolve", async () => {
    const h = mk({ resolveFeatureLayersFromUseDataSources: jest.fn(() => Promise.resolve([])) });
    await initializeMapConnectionOnce(h, asView({}));
    expect(h.initializeDataSourceOnlyConnection).toHaveBeenCalledWith(expect.stringContaining("Could not resolve the map layer"));
    expect(h.finalizeConnection).not.toHaveBeenCalled();
  });

  it("tolerates spatial resolution failure and sync throw", async () => {
    const h = mk({ resolveSpatialMapLayers: jest.fn(() => Promise.reject(new Error("x"))) });
    await initializeMapConnectionOnce(h, asView({}));
    await flush();
    expect(h.finalizeConnection).toHaveBeenCalled();
    const h2 = mk({ resolveSpatialMapLayers: jest.fn(() => { throw new Error("sync"); }) });
    await initializeMapConnectionOnce(h2, asView({}));
    expect(h2.finalizeConnection).toHaveBeenCalled();
  });

  it("skips setState for spatial layers resolved after unmount", async () => {
    let release: (l: __esri.FeatureLayer[]) => void = () => undefined;
    const h = mk({ resolveSpatialMapLayers: jest.fn(() => new Promise<__esri.FeatureLayer[]>((r) => { release = r; })) });
    await initializeMapConnectionOnce(h, asView({}));
    h._isMounted = false;
    release([layer()]);
    await flush();
    expect(h.state.spatialMapLayers).not.toHaveLength(1);
  });
});

describe("initializeDataSourceOnlyConnection", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const mk = (layers: __esri.FeatureLayer[], init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      resolveFeatureLayersFromUseDataSources: jest.fn(() => Promise.resolve(layers)),
      finalizeConnection: jest.fn(() => Promise.resolve()),
      initializeDataSourceOnlyConnection: jest.fn(() => Promise.resolve()),
      ...init,
    });

  it("is a no-op when unmounted or already connected", async () => {
    const a = mk([layer()], { _isMounted: false });
    await initializeDataSourceOnlyConnection(a);
    const b = mk([layer()], { state: { connectionStatus: "connected" } });
    await initializeDataSourceOnlyConnection(b);
    expect(a.finalizeConnection).not.toHaveBeenCalled();
    expect(b.finalizeConnection).not.toHaveBeenCalled();
  });

  it("finalizes and resets the retry counter on success", async () => {
    const h = mk([layer()], { _dsOnlyRetryCount: 2 });
    await initializeDataSourceOnlyConnection(h);
    expect(h._dsOnlyRetryCount).toBe(0);
    expect(h.finalizeConnection).toHaveBeenCalled();
  });

  it("retries with a timer, then fails after the maximum number of retries", async () => {
    const h = mk([]);
    await initializeDataSourceOnlyConnection(h, "custom");
    expect(h._dsOnlyRetryCount).toBe(1);
    expect(h._dsOnlyRetryTimer).not.toBeNull();
    jest.advanceTimersByTime(500);
    expect(h._dsOnlyRetryTimer).toBeNull();
    expect(h.initializeDataSourceOnlyConnection).toHaveBeenCalledWith("custom");
    h._dsOnlyRetryCount = 2;
    await initializeDataSourceOnlyConnection(h, "custom");
    expect(h.state.connectionStatus).toBe("failed");
    expect(h.state.error).toBe("custom");
  });

  it("replaces a pending retry timer", async () => {
    const h = mk([], { _dsOnlyRetryTimer: setTimeout(() => undefined, 9999) });
    await initializeDataSourceOnlyConnection(h);
    expect(h._dsOnlyRetryCount).toBe(1);
  });
});

describe("finalizeConnection", () => {
  const groupsState = (groups: Array<{ id: string; title?: string }>): void => {
    m(getAppStore).mockReturnValue({ getState: () => ({ user: { groups } }) });
  };
  const mk = (init: FakeHostInit = {}): FakeHost =>
    makeFakeHost({
      getPortalSelf: jest.fn(() => Promise.resolve({ username: "bob", groups: [{ id: "g1", title: "G" }], portalUrl: "p" })),
      resolveAllowedViloyats: jest.fn(() => []),
      runInitialDataLoad: jest.fn(() => Promise.resolve()),
      normalizeApos: (s: string) => s.toUpperCase(),
      ...init,
    });

  it("does nothing when unmounted", async () => {
    const h = mk({ _isMounted: false });
    await finalizeConnection(h, [layer()], null);
    expect(h.getPortalSelf).not.toHaveBeenCalled();
  });

  it("connects, hides layers, and starts the initial load (legacy scope with one group locks the viloyat)", async () => {
    groupsState([]);
    m(access.isAccessConfigured).mockReturnValue(false);
    const l = layer();
    const h = mk({ resolveAllowedViloyats: jest.fn(() => ["Andijon"]) });
    await finalizeConnection(h, [l], null);
    await flush();
    expect(h.state.connectionStatus).toBe("connected");
    expect(h.state.userName).toBe("bob");
    expect(h.state.userGroupIds).toEqual(["g1"]);
    expect(h.state.lockedViloyat).toBe("Andijon");
    expect((l as unknown as { definitionExpression: string }).definitionExpression).toBe("1=0");
    expect(h._allowClearOnce).toBe(true);
    expect(h.runInitialDataLoad).toHaveBeenCalled();
  });

  it("leaves the viloyat unlocked with multiple or no allowed viloyats", async () => {
    groupsState([]);
    m(access.isAccessConfigured).mockReturnValue(false);
    const h = mk({ resolveAllowedViloyats: jest.fn(() => ["A", "B"]) });
    await finalizeConnection(h, [layer()], null);
    expect(h.state.lockedViloyat).toBeNull();
    const h2 = mk();
    await finalizeConnection(h2, [layer()], null);
    expect(h2.state.connectionStatus).toBe("connected");
    expect(h2.state.allowedViloyats).toEqual([]);
  });

  it("fails when access is configured but denied", async () => {
    groupsState([]);
    m(access.isAccessConfigured).mockReturnValue(true);
    m(access.isAccessDenied).mockReturnValue(true);
    const h = mk();
    await finalizeConnection(h, [layer()], null);
    expect(h.state.connectionStatus).toBe("failed");
    expect(h.runInitialDataLoad).not.toHaveBeenCalled();
  });

  it("uses configured access groups (normalised), locking a single allowed viloyat", async () => {
    groupsState([{ id: "7", title: "Grp" }]);
    m(access.isAccessConfigured).mockReturnValue(true);
    m(access.isAccessDenied).mockReturnValue(false);
    m(access.resolveAllowedViloyatsForGroups).mockReturnValue(["andijon"]);
    const h = mk();
    await finalizeConnection(h, [layer()], null);
    expect(m(access.resolveAllowedViloyatsForGroups).mock.calls[0][0]).toEqual([{ id: "7", title: "Grp" }]);
    expect(h.state.allowedViloyats).toEqual(["ANDIJON"]);
    expect(h.state.lockedViloyat).toBe("ANDIJON");
  });

  it("prefers an explicitly locked viloyat from access config", async () => {
    groupsState([{ id: "7" }]);
    accessMock.lockedViloyat = "toshkent";
    m(access.isAccessConfigured).mockReturnValue(true);
    m(access.isAccessDenied).mockReturnValue(false);
    m(access.resolveAllowedViloyatsForGroups).mockReturnValue(["a", "b"]);
    const h = mk();
    await finalizeConnection(h, [layer()], null);
    expect(h.state.lockedViloyat).toBe("TOSHKENT");
  });

  it("survives layers whose definitionExpression cannot be set", async () => {
    groupsState([]);
    m(access.isAccessConfigured).mockReturnValue(false);
    const bad = Object.defineProperty({ title: "x" }, "definitionExpression", { set: () => { throw new Error("ro"); } }) as unknown as __esri.FeatureLayer;
    const h = mk();
    await finalizeConnection(h, [bad], null);
    await flush();
    expect(h.runInitialDataLoad).toHaveBeenCalled();
  });
});
