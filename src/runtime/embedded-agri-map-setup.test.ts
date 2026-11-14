import { DataSourceManager } from "jimu-core";
import { MapViewManager, loadArcGISJSAPIModules } from "jimu-arcgis";
import {
  type AgriMapInitContext,
  createAgriMap,
  createAgriMapView,
  disposeAgriMap,
  getItemId,
  getPortalUrl,
  initializeAgriMap,
  registerJimuMapView,
  resolveWebMapDataSource,
  createUzbekistanExtentProps,
  dispatchMapSettingsRequest,
  hideRegionYearLayers,
  readThemeEvent,
  readSelectedRegionEvent,
  syncFullscreenState,
  toggleFullscreen,
  zoomViewBy,
} from "./embedded-agri-map-setup";

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: () => ({ portalUrl: "https://portal.test/" }) }),
  DataSourceManager: { getInstance: jest.fn() },
}));
jest.mock("jimu-arcgis", () => ({
  MapViewManager: { getInstance: jest.fn() },
  loadArcGISJSAPIModules: jest.fn(),
}));
jest.mock("../gis/feature-layer-data", () => ({
  looksLikeRegionYearLayerHaystack: (h: string) => h.includes("region-year"),
}));

describe("embedded-agri-map-setup", () => {
  it("hides only non-group region-year layers and resets opacity", () => {
    const layers = [
      { title: "region-year 2024", url: "", type: "feature", visible: true, opacity: 0.4 },
      { title: "region-year grp", url: "", type: "group", visible: true, opacity: 1 },
      { title: "other", url: "", type: "feature", visible: true, opacity: 1 },
    ];
    hideRegionYearLayers({ allLayers: { toArray: () => layers } } as unknown as __esri.Map);
    expect(layers.map((l) => l.visible)).toEqual([false, true, true]);
    expect(layers[0].opacity).toBe(1);
  });

  it("builds the Uzbekistan extent in wkid 4326", () => {
    expect(createUzbekistanExtentProps()).toMatchObject({
      xmin: 55.9, ymax: 45.65, spatialReference: { wkid: 4326 },
    });
  });

  it("reads theme events from boolean or name", () => {
    expect(readThemeEvent(new CustomEvent("x", { detail: { isDarkTheme: false } }))).toBe(false);
    expect(readThemeEvent(new CustomEvent("x", { detail: { theme: "Dark" } }))).toBe(true);
    expect(readThemeEvent(new CustomEvent("x", { detail: { theme: "light" } }))).toBe(false);
  });

  it("reads selected region from filters or locked scope", () => {
    expect(readSelectedRegionEvent(new CustomEvent("x", { detail: { filters: { viloyat: "A" } } }))).toBe(true);
    expect(readSelectedRegionEvent(new CustomEvent("x", { detail: { scope: { lockedViloyat: "B" } } }))).toBe(true);
    expect(readSelectedRegionEvent(new CustomEvent("x", { detail: { filters: { viloyat: " " } } }))).toBe(false);
  });

  it("dispatches the settings request without the embedded suffix", () => {
    const handler = jest.fn();
    window.addEventListener("agri-main:map-settings-request", handler);
    dispatchMapSettingsRequest("w1-embedded-map");
    window.removeEventListener("agri-main:map-settings-request", handler);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ widgetId: "w1" });
  });

  it("zooms by delta respecting minZoom and ignores destroyed views", () => {
    const goTo = jest.fn(async (): Promise<void> => undefined);
    const view = { destroyed: false, zoom: 6, center: "c", constraints: { minZoom: 5 }, goTo };
    zoomViewBy(view as unknown as __esri.MapView, -3);
    expect(goTo).toHaveBeenCalledWith(
      { center: "c", zoom: 5 }, { animate: true, duration: 420, easing: "ease-in-out" },
    );
    goTo.mockClear();
    zoomViewBy({ ...view, destroyed: true } as unknown as __esri.MapView, 1);
    zoomViewBy(null, 1);
    expect(goTo).not.toHaveBeenCalled();
  });

  it("syncFullscreenState reports false when no map slot is fullscreen", () => {
    const setIsFullscreen = jest.fn();
    syncFullscreenState(document.createElement("div"), { current: null }, setIsFullscreen);
    expect(setIsFullscreen).toHaveBeenCalledWith(false);
  });

  it("toggleFullscreen requests fullscreen on the slot and closes the menu", async () => {
    const slot = document.createElement("div");
    slot.className = "agri-dashboard-map-slot";
    const container = document.createElement("div");
    slot.appendChild(container);
    slot.requestFullscreen = jest.fn(async (): Promise<void> => undefined);
    const onDone = jest.fn();
    await toggleFullscreen(container, onDone);
    expect(slot.requestFullscreen).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });

  it("toggleFullscreen does nothing without a map slot", async () => {
    const onDone = jest.fn();
    await toggleFullscreen(document.createElement("div"), onDone);
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe("embedded-agri-map-setup view setup", () => {
  const makeCtx = (over: Partial<AgriMapInitContext> = {}): AgriMapInitContext => ({
    mapWidgetId: "w1",
    dataSourceId: "ds1",
    rootDataSource: null,
    session: { disposed: false, view: null, jimuMapViewId: "" },
    containerRef: { current: document.createElement("div") },
    viewRef: { current: null },
    mapRef: { current: null },
    jimuMapViewRef: { current: null },
    automaticBasemapRef: { current: "gray-vector" },
    onViewReadyRef: { current: jest.fn() },
    onLoadingChangeRef: { current: jest.fn() },
    onErrorRef: { current: jest.fn() },
    setActiveBasemapId: jest.fn(),
    setReadyView: jest.fn(),
    ...over,
  });

  const makeView = () => ({
    ui: { remove: jest.fn() },
    when: jest.fn(async () => undefined),
    goTo: jest.fn(async () => undefined),
    destroy: jest.fn(),
  });

  const mockModules = (map: unknown, view: unknown) => {
    const MapView = jest.fn(() => view);
    (loadArcGISJSAPIModules as jest.Mock).mockResolvedValue([
      jest.fn(() => map),
      jest.fn(() => map),
      MapView,
      jest.fn((props: unknown) => props),
    ]);
    return MapView;
  };

  const mockManager = (jimuMapView: { id: string }) => {
    const manager = {
      createJimuMapView: jest.fn(async () => jimuMapView),
      destroyJimuMapView: jest.fn(),
    };
    (MapViewManager.getInstance as jest.Mock).mockReturnValue(manager);
    return manager;
  };

  beforeEach(() => { jest.resetAllMocks(); });

  it("reads item id and portal url with fallbacks", () => {
    expect(getItemId({ getDataSourceJson: () => ({ itemId: " abc " }) })).toBe("abc");
    expect(getItemId(null)).toBe("");
    expect(getPortalUrl({ portalUrl: "https://p.test/" })).toBe("https://p.test");
  });

  it("resolves the root data source only when ids match", () => {
    const fromManager = { id: "ds1" };
    (DataSourceManager.getInstance as jest.Mock).mockReturnValue({
      getDataSource: () => fromManager,
    });
    const stale = { id: "old" } as never;
    const fresh = { id: "ds1" } as never;
    expect(resolveWebMapDataSource(fresh, "ds1")).toBe(fresh);
    expect(resolveWebMapDataSource(stale, "ds1")).toBe(fromManager);
    expect(resolveWebMapDataSource(null, "")).toBeNull();
  });

  it("creates a WebMap, loads it, applies the basemap and hides region layers", async () => {
    const layers = [{ title: "region-year 1", url: "", type: "feature", visible: true, opacity: 1 }];
    const map = { load: jest.fn(async () => undefined), basemap: "x", allLayers: { toArray: () => layers } };
    mockModules(map, makeView());
    const ctx = makeCtx();
    const created = await createAgriMap(ctx, { itemId: "item1" } as never);
    expect(created?.map).toBe(map);
    expect(map.basemap).toBe("gray-vector");
    expect(layers[0].visible).toBe(false);
    expect(ctx.mapRef.current).toBe(map);
    expect(ctx.setActiveBasemapId).toHaveBeenCalledWith("gray-vector");
  });

  it("creates a basemap-only map and does not load without an item id", async () => {
    const map = { load: jest.fn() };
    mockModules(map, makeView());
    const created = await createAgriMap(makeCtx(), {} as never);
    expect(created?.map).toBe(map);
    expect(map.load).not.toHaveBeenCalled();
  });

  it("returns null from createAgriMap when disposed during module load", async () => {
    mockModules({}, makeView());
    const ctx = makeCtx();
    ctx.session.disposed = true;
    expect(await createAgriMap(ctx, {} as never)).toBeNull();
    expect(ctx.mapRef.current).toBeNull();
  });

  it("creates a MapView framed on Uzbekistan and stores it", async () => {
    const view = makeView();
    const MapView = mockModules({}, view);
    const ctx = makeCtx();
    const created = await createAgriMap(ctx, {} as never);
    const result = await createAgriMapView(ctx, created!);
    expect(result).toBe(view);
    expect(ctx.viewRef.current).toBe(view);
    expect(ctx.session.view).toBe(view);
    expect(view.ui.remove).toHaveBeenCalledWith("attribution");
    expect(MapView).toHaveBeenCalledWith(expect.objectContaining({
      constraints: { rotationEnabled: false, minZoom: 5, snapToZoom: false },
    }));
    expect(view.goTo).toHaveBeenCalledWith(expect.anything(), { animate: false });
  });

  it("destroys the view when disposed while it becomes ready", async () => {
    const view = makeView();
    mockModules({}, view);
    const ctx = makeCtx();
    const created = await createAgriMap(ctx, {} as never);
    view.when.mockImplementation(async () => { ctx.session.disposed = true; });
    expect(await createAgriMapView(ctx, created!)).toBeNull();
    expect(view.destroy).toHaveBeenCalled();
  });

  it("registers the jimu map view and records its id", async () => {
    const manager = mockManager({ id: "j1" });
    const ctx = makeCtx();
    const result = await registerJimuMapView(ctx, makeView() as never);
    expect(result).toEqual({ id: "j1" });
    expect(ctx.session.jimuMapViewId).toBe("j1");
    expect(ctx.jimuMapViewRef.current).toEqual({ id: "j1" });
    expect(manager.createJimuMapView).toHaveBeenCalledWith(expect.objectContaining({
      mapWidgetId: "w1", dataSourceId: "ds1", isActive: true, isEnablePopup: false,
    }));
  });

  it("cleans up the jimu map view when disposed during registration", async () => {
    const manager = mockManager({ id: "j2" });
    const view = makeView();
    const ctx = makeCtx();
    ctx.session.disposed = true;
    expect(await registerJimuMapView(ctx, view as never)).toBeNull();
    expect(manager.destroyJimuMapView).toHaveBeenCalledWith("j2");
    expect(view.destroy).toHaveBeenCalled();
    expect(ctx.session.jimuMapViewId).toBe("");
  });

  it("initializes end to end and reports ready", async () => {
    const view = makeView();
    mockModules({}, view);
    mockManager({ id: "j3" });
    const ds = { id: "ds1", ready: jest.fn(async () => undefined) };
    const ctx = makeCtx({ rootDataSource: ds as never });
    await initializeAgriMap(ctx);
    expect(ctx.onLoadingChangeRef.current).toHaveBeenNthCalledWith(1, true);
    expect(ctx.onLoadingChangeRef.current).toHaveBeenLastCalledWith(false);
    expect(ctx.setReadyView).toHaveBeenCalledWith(view);
    expect(ctx.onViewReadyRef.current).toHaveBeenCalledWith({ id: "j3" });
  });

  it("opens nothing and stops loading when no WebMap is chosen", async () => {
    const ctx = makeCtx({ dataSourceId: "" });
    await initializeAgriMap(ctx);
    expect(loadArcGISJSAPIModules).not.toHaveBeenCalled();
    expect(ctx.onLoadingChangeRef.current).toHaveBeenLastCalledWith(false);
  });

  it("waits silently when the data source does not exist yet", async () => {
    (DataSourceManager.getInstance as jest.Mock).mockReturnValue({ getDataSource: () => undefined });
    const ctx = makeCtx();
    await initializeAgriMap(ctx);
    expect(loadArcGISJSAPIModules).not.toHaveBeenCalled();
    expect(ctx.onLoadingChangeRef.current).toHaveBeenCalledTimes(1);
  });

  it("reports errors unless disposed", async () => {
    (loadArcGISJSAPIModules as jest.Mock).mockRejectedValue(new Error("boom"));
    const ds = { id: "ds1" };
    const ctx = makeCtx({ rootDataSource: ds as never });
    await initializeAgriMap(ctx);
    expect(ctx.onErrorRef.current).toHaveBeenCalledWith("boom");
    const quiet = makeCtx({ rootDataSource: ds as never });
    quiet.session.disposed = true;
    await initializeAgriMap(quiet);
    expect(quiet.onErrorRef.current).not.toHaveBeenCalled();
  });

  it("disposes the jimu view, refs and MapView", () => {
    const manager = mockManager({ id: "j4" });
    const view = makeView();
    const ctx = makeCtx();
    ctx.session.view = view as never;
    ctx.session.jimuMapViewId = "j4";
    ctx.viewRef.current = view as never;
    disposeAgriMap(ctx);
    expect(ctx.session.disposed).toBe(true);
    expect(manager.destroyJimuMapView).toHaveBeenCalledWith("j4");
    expect(ctx.viewRef.current).toBeNull();
    expect(ctx.setReadyView).toHaveBeenCalledWith(null);
    expect(view.destroy).toHaveBeenCalled();
  });
});
