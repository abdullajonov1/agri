import { makePopupHost } from "../../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../../popup-host";
import type { PopupAttributes } from "../../popup-types";

const mockPrefetch = jest.fn();
const mockLoadLayer = jest.fn();

jest.mock("../../../../../gis/agri-table-data-source", () => ({ AGRI_TABLE_JOIN_FIELD: "uniqueid" }));
jest.mock("../../../../../gis/agri-polygon-api-source", () => ({
  resolveRegionIdFromAttributes: (a: { region_id?: number }) => a?.region_id ?? null,
  resolveCropIdFromAttributes: (a: { crop_id?: number }) => a?.crop_id ?? null,
}));
jest.mock("../../../../../gis/agri-vegetation-overlay-prefetch", () => ({
  prefetchVegetationOverlayForUniqueid: (...a: unknown[]) => mockPrefetch(...a),
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  getQueryableLayer: (l: { queryable?: unknown } | null | undefined) => l?.queryable ?? null,
  getAgriLayerMapKey: (l: { url?: string } | null | undefined) => l?.url || "",
  isMapImageOwnedLayer: (l: { mapImageOwned?: boolean }) => !!l?.mapImageOwned,
  isMapImageGroupSublayer: (l: { isGroup?: boolean }) => !!l?.isGroup,
  safeLoadMapLayer: (...a: unknown[]) => mockLoadLayer(...a),
}));

import { onViewClick } from "./click-view";

type Obj = Record<string, unknown>;
const asEv = (o: Obj): __esri.ViewClickEvent => o as unknown as __esri.ViewClickEvent;
const asGraphic = (o: Obj): __esri.Graphic => o as unknown as __esri.Graphic;
const asLayer = (o: Obj): __esri.FeatureLayer => o as unknown as __esri.FeatureLayer;

const geometry = { type: "polygon", extent: { expand: jest.fn(() => ({ target: "expanded" })) } };
const clickLayer = { url: "https://svc/0", title: "Fields", objectIdField: "OBJECTID", loaded: true, queryable: undefined as undefined };

interface Ctx {
  host: PopupWidgetHost;
  view: Obj & { goTo: jest.Mock };
  phases: string[];
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

const setup = (
  over: Partial<PopupWidgetHost> = {},
  state: Parameters<typeof makePopupHost>[0] = {},
  config: Obj = {},
): Ctx => {
  const view = {
    map: {},
    scale: 5000,
    extent: { clone: jest.fn(() => ({ saved: true })) },
    goTo: jest.fn(() => Promise.resolve()),
  };
  const hitGraphic = asGraphic({ attributes: { OBJECTID: 11, uniqueid: "{abc}", region_id: 4, crop_id: 2 }, geometry, layer: clickLayer });
  const { host } = makePopupHost(
    { jimuMapView: { view } as never, layerKeyToDsId: { "https://svc/0": "ds1" }, ...state },
    { config: config as never },
    {
      resolveClickLayers: jest.fn(() => Promise.resolve([asLayer(clickLayer)])),
      resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: hitGraphic, queryHitLayer: null })),
      findAttributeValueCaseInsensitive: jest.fn((a: PopupAttributes | null | undefined, n: string) => {
        const k = Object.keys(a || {}).find((x) => x.toLowerCase() === n.toLowerCase());
        return k ? (a as PopupAttributes)[k] : null;
      }),
      toLiveMapLayer: jest.fn((l) => l as never),
      getOutFields: jest.fn(() => ["*"]),
      queryFeatureByObjectIdCached: jest.fn(() => Promise.resolve(asGraphic({ attributes: { OBJECTID: 11, uniqueid: "{abc}" }, geometry }))),
      resolveDisplayAttrs: jest.fn((a) => Promise.resolve({ ...(a || {}), crop: "wheat" } as PopupAttributes)),
      calculatePopupPosition: jest.fn(() => ({ x: 7, y: 8 })),
      calculatePinnedPosition: jest.fn(() => ({ x: 1, y: 2 })),
      highlightPolygon: jest.fn(),
      notifyGraffPolygonSelection: jest.fn(),
      fetchLatestVegetationIndices: jest.fn(() => Promise.resolve()),
      loadAttachmentsForOid: jest.fn(() => Promise.resolve()),
      schedulePopupLayoutAfterContent: jest.fn(),
      expandPopup: jest.fn(),
      closePopup: jest.fn(),
      clearHighlight: jest.fn(),
      _queryOnlyLayers: new Map(),
      _extentBeforeSelection: null as never,
      _activeInspectedUniqueid: "",
      ...over,
    },
  );
  const phases: string[] = [];
  return { host, view: view as unknown as Ctx["view"], phases };
};

const ev = asEv({ x: 10, y: 20, mapPoint: { x: 1, y: 2, spatialReference: { wkid: 3857 } } });

describe("onViewClick", () => {
  const phases: string[] = [];
  const listener = (e: Event): void => { phases.push((e as CustomEvent<{ phase: string }>).detail.phase); };
  beforeEach(() => {
    phases.length = 0;
    document.addEventListener("agriPolygonMapClickPhase", listener);
    mockPrefetch.mockReset();
    mockLoadLayer.mockReset();
    geometry.extent.expand.mockClear();
  });
  afterEach(() => {
    document.removeEventListener("agriPolygonMapClickPhase", listener);
    jest.useRealTimers();
  });

  test("ignores clicks without a map view", async () => {
    const { host } = makePopupHost({ jimuMapView: undefined }, {}, { resolveClickLayers: jest.fn() });
    await onViewClick(host, ev);
    expect(host.resolveClickLayers).not.toHaveBeenCalled();
    expect(phases).toEqual(["click-start"]);
  });

  test("click outside polygons closes an open popup and restores extent", async () => {
    const open = setup({ resolveClickFeatureAt: jest.fn(() => Promise.resolve(null)) }, { showPopup: true });
    await onViewClick(open.host, ev);
    expect(open.host.closePopup).toHaveBeenCalledWith({ restoreExtent: true, notifyDeselect: true });
    expect(phases).toEqual(["click-start", "after-hit-test"]);
    const idle = setup({ resolveClickFeatureAt: jest.fn(() => Promise.resolve(null)) });
    await onViewClick(idle.host, ev);
    expect(idle.host.closePopup).not.toHaveBeenCalled();
  });

  test("happy path opens popup, zooms, notifies and loads attachments", async () => {
    jest.useFakeTimers();
    const s = setup({}, { pinToCorner: false }, { fieldsToShow: ["crop"] });
    const p = onViewClick(s.host, ev);
    await jest.advanceTimersByTimeAsync(0);
    await p;
    const h = s.host;
    expect(s.view.goTo).toHaveBeenCalledTimes(1);
    expect(s.view.goTo).toHaveBeenCalledWith({ target: { target: "expanded" } }, { duration: 500, easing: "ease-in-out" });
    expect(geometry.extent.expand).toHaveBeenCalledWith(1.15);
    expect(h._extentBeforeSelection).toEqual({ saved: true });
    expect(h.state).toMatchObject({
      loading: false,
      showPopup: true,
      selectedOID: 11,
      objectIdField: "OBJECTID",
      lastClickedDsId: "ds1",
      lastClickedLayerKey: "https://svc/0",
      popupPosition: { x: 7, y: 8 },
      clickScreenPoint: { x: 10, y: 20 },
      chartExpanded: false,
      error: null,
    });
    expect(h._activeInspectedUniqueid).toBe("abc");
    expect(h.notifyGraffPolygonSelection).toHaveBeenCalledTimes(1);
    expect(h.notifyGraffPolygonSelection).toHaveBeenCalledWith("{abc}", true, expect.any(Number), 4);
    expect(mockPrefetch).toHaveBeenCalledWith("{abc}", { cropId: 2, regionId: 4 });
    expect(h.loadAttachmentsForOid).toHaveBeenCalledWith(expect.anything(), 11);
    // vegetation indices are deferred
    expect(h.fetchLatestVegetationIndices).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(650);
    expect(h.fetchLatestVegetationIndices).toHaveBeenCalledWith("{abc}");
    expect(phases).toEqual(["click-start", "after-hit-test"]);
  });

  test("pinned and dashboard-embedded layout paths", async () => {
    const pinned = setup({}, { pinToCorner: true });
    await onViewClick(pinned.host, ev);
    expect(pinned.host.state.popupPosition).toEqual({ x: 1, y: 2 });
    expect(pinned.host.state.chartExpanded).toBe(true);
    expect(pinned.host.schedulePopupLayoutAfterContent).toHaveBeenCalled();
    const dash = setup({ isDashboardEmbedded: jest.fn(() => true) });
    await onViewClick(dash.host, ev);
    expect(dash.host.schedulePopupLayoutAfterContent).toHaveBeenCalled();
    const normal = setup({ isDashboardEmbedded: jest.fn(() => false) });
    await onViewClick(normal.host, ev);
    expect(normal.host.schedulePopupLayoutAfterContent).not.toHaveBeenCalled();
  });

  test("zoomToSelection=false skips zoom and extent capture; attachments off", async () => {
    const s = setup({}, {}, { settings: { zoomToSelection: false, showAttachments: false } });
    await onViewClick(s.host, ev);
    expect(s.view.goTo).not.toHaveBeenCalled();
    expect(s.host._extentBeforeSelection).toBeNull();
    expect(s.host.loadAttachmentsForOid).not.toHaveBeenCalled();
    expect(s.host.state.loadingAttachments).toBe(false);
    expect(s.host.state.showPopup).toBe(true);
  });

  test("clicking the active field again toggles it off", async () => {
    const s = setup({ _activeInspectedUniqueid: "abc" }, { showPopup: true });
    await onViewClick(s.host, ev);
    expect(s.host.clearHighlight).toHaveBeenCalled();
    expect(s.host._activeInspectedUniqueid).toBeNull();
    expect(s.host.closePopup).toHaveBeenCalledWith({ restoreExtent: true, notifyDeselect: true });
    expect(s.host.queryFeatureByObjectIdCached).not.toHaveBeenCalled();
  });

  test("clicking the active field while minimized expands instead", async () => {
    const s = setup({ _activeInspectedUniqueid: "abc" }, { showPopup: true, popupMinimized: true });
    await onViewClick(s.host, ev);
    expect(s.host.expandPopup).toHaveBeenCalled();
    expect(s.host.closePopup).not.toHaveBeenCalled();
  });

  test("uniqueid only found after OID query: broadcasts then, handles toggle-off", async () => {
    const noUid = asGraphic({ attributes: { OBJECTID: 11 }, geometry: undefined, layer: clickLayer });
    const s = setup(
      { resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: noUid, queryHitLayer: null })) },
      {},
      {},
    );
    await onViewClick(s.host, ev);
    expect(s.host.notifyGraffPolygonSelection).toHaveBeenCalledWith("{abc}", true, expect.any(Number), null);
    expect(s.host._activeInspectedUniqueid).toBe("abc");
    expect(s.view.goTo).toHaveBeenCalledTimes(1);
    expect(s.host.notifyGraffPolygonSelection).toHaveBeenCalledTimes(1);

    const toggled = setup(
      { resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: noUid, queryHitLayer: null })), _activeInspectedUniqueid: "abc" },
      { showPopup: true },
    );
    await onViewClick(toggled.host, ev);
    expect(toggled.host.closePopup).toHaveBeenCalledWith({ restoreExtent: true, notifyDeselect: true });
    expect(toggled.host.state.showPopup).toBe(true);
  });

  test("uniqueid only in joined table attributes still notifies once", async () => {
    const bare = asGraphic({ attributes: { OBJECTID: 11 }, geometry, layer: clickLayer });
    const s = setup({
      resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: bare, queryHitLayer: null })),
      queryFeatureByObjectIdCached: jest.fn(() => Promise.resolve(asGraphic({ attributes: { OBJECTID: 11 }, geometry }))),
      resolveDisplayAttrs: jest.fn(() => Promise.resolve({ uniqueid: "tbl-1" } as PopupAttributes)),
    });
    await onViewClick(s.host, ev);
    expect(s.host.notifyGraffPolygonSelection).toHaveBeenCalledWith("tbl-1", true, expect.any(Number), null);
    expect(s.host.fetchLatestVegetationIndices).toHaveBeenCalledWith("tbl-1");
    expect(s.host._activeInspectedUniqueid).toBe("tbl-1");
  });

  test("no uniqueid anywhere resets vegetation indices", async () => {
    const bare = asGraphic({ attributes: { OBJECTID: 11 }, geometry, layer: clickLayer });
    const s = setup({
      resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: bare, queryHitLayer: null })),
      queryFeatureByObjectIdCached: jest.fn(() => Promise.resolve(asGraphic({ attributes: { OBJECTID: 11 } }))),
      resolveDisplayAttrs: jest.fn(() => Promise.resolve({} as PopupAttributes)),
    }, { latestIndexDate: "old" }, { fieldsToShow: ["x"] });
    await onViewClick(s.host, ev);
    expect(s.host.notifyGraffPolygonSelection).not.toHaveBeenCalled();
    expect(s.host.state).toMatchObject({ loadingLatestIndices: false, latestIndexDate: null, latestIndexValues: null });
    expect(s.host.state.error).toContain("configured fields not found");
  });

  test("reports no-data when configured fields are all empty", async () => {
    const s = setup({ resolveDisplayAttrs: jest.fn(() => Promise.resolve({ crop: null, uniqueid: "abc" } as PopupAttributes)) }, {}, { fieldsToShow: ["crop"] });
    await onViewClick(s.host, ev);
    expect(s.host.state.error).toBe("No data available for configured fields");
  });

  test("query hit layer takes precedence for layer resolution", async () => {
    const queried = asLayer({ ...clickLayer, url: "https://other/1" });
    const hit = asGraphic({ attributes: { OBJECTID: 11, uniqueid: "u" }, geometry });
    const s = setup({ resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: hit, queryHitLayer: queried })) });
    await onViewClick(s.host, ev);
    expect(s.host.state.lastClickedLayerKey).toBe("https://other/1");
    expect(s.host.state.lastClickedDsId).toBeNull();
  });

  test("no live layer for hit graphic aborts without popup", async () => {
    const hit = asGraphic({ attributes: { OBJECTID: 11 }, geometry });
    const s = setup({
      resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: hit, queryHitLayer: null })),
      toLiveMapLayer: jest.fn((): null => null),
    });
    await onViewClick(s.host, ev);
    expect(s.host.state).toMatchObject({ loading: false, showPopup: false });
  });

  test("missing objectId field or value shows an error and clears highlight", async () => {
    const noField = setup({ toLiveMapLayer: jest.fn(() => ({ title: "x", fields: [] }) as never) });
    await onViewClick(noField.host, ev);
    expect(noField.host.state.error).toBe("ObjectId field not found for clicked layer.");
    expect(noField.host.clearHighlight).toHaveBeenCalled();

    const hit = asGraphic({ attributes: { other: 1 }, geometry, layer: clickLayer });
    const noValue = setup({ resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: hit, queryHitLayer: null })) });
    await onViewClick(noValue.host, ev);
    expect(noValue.host.state.showPopup).toBe(false);
    expect(noValue.host.state.error).toContain("OBJECTID");
    expect(noValue.host.queryFeatureByObjectIdCached).not.toHaveBeenCalled();
  });

  test("oid field discovered from layer fields", async () => {
    const layer = { url: "https://svc/0", loaded: true, fields: [{ type: "oid", name: "FID" }] };
    const hit = asGraphic({ attributes: { FID: 3, uniqueid: "u" }, geometry, layer });
    const s = setup({
      resolveClickFeatureAt: jest.fn(() => Promise.resolve({ graphic: hit, queryHitLayer: null })),
      toLiveMapLayer: jest.fn(() => layer as never),
    });
    await onViewClick(s.host, ev);
    expect(s.host.state.objectIdField).toBe("FID");
    expect(s.host.state.selectedOID).toBe(3);
  });

  test("feature not found by OID shows error", async () => {
    const s = setup({ queryFeatureByObjectIdCached: jest.fn(() => Promise.resolve(null)) });
    await onViewClick(s.host, ev);
    expect(s.host.state).toMatchObject({ showPopup: false, loading: false });
    expect(s.host.state.error).toBeTruthy();
    expect(s.host.clearHighlight).toHaveBeenCalled();
  });

  test("unloaded plain layers are loaded; map-image-owned layers are not", async () => {
    const unloaded = { ...clickLayer, loaded: false, loadStatus: "not-loaded" };
    const a = setup({ toLiveMapLayer: jest.fn(() => unloaded as never) });
    await onViewClick(a.host, ev);
    expect(mockLoadLayer).toHaveBeenCalledTimes(1);
    mockLoadLayer.mockClear();
    const owned = { ...unloaded, mapImageOwned: true };
    const b = setup({ toLiveMapLayer: jest.fn(() => owned as never) });
    await onViewClick(b.host, ev);
    expect(mockLoadLayer).not.toHaveBeenCalled();
    mockLoadLayer.mockRejectedValue(new Error("fail"));
    const c = setup({ toLiveMapLayer: jest.fn(() => unloaded as never) });
    await onViewClick(c.host, ev);
    expect(c.host.state.showPopup).toBe(true);
  });

  test("attachment failure keeps popup open", async () => {
    const s = setup({ loadAttachmentsForOid: jest.fn(() => Promise.reject(new Error("media"))) });
    await onViewClick(s.host, ev);
    expect(s.host.state.showPopup).toBe(true);
    expect(s.host.state.loadingAttachments).toBe(false);
  });

  test("uses query-only detached layer for attachments when registered", async () => {
    const detached = asLayer({ id: "detached" });
    const s = setup({ _queryOnlyLayers: new Map([["https://svc/0", detached as never]]) });
    await onViewClick(s.host, ev);
    expect(s.host.loadAttachmentsForOid).toHaveBeenCalledWith(detached, 11);
  });

  test("zoom errors are non-fatal (sync throw and rejected promise)", async () => {
    const s = setup();
    s.view.goTo.mockImplementation(() => { throw new Error("sync"); });
    await onViewClick(s.host, ev);
    expect(s.host.state.showPopup).toBe(true);
    const r = setup();
    r.view.goTo.mockImplementation(() => Promise.reject(new Error("async")));
    await onViewClick(r.host, ev);
    await flush();
    expect(r.host.state.showPopup).toBe(true);
  });

  test("highlight failure from hit geometry is tolerated", async () => {
    const s = setup({ highlightPolygon: jest.fn().mockImplementationOnce(() => { throw new Error("h"); }) });
    await onViewClick(s.host, ev);
    expect(s.host.state.showPopup).toBe(true);
  });

  test("unexpected error before popup opens rolls everything back", async () => {
    const s = setup({ resolveDisplayAttrs: jest.fn(() => Promise.reject(new Error("join exploded"))), restoreExtentBeforeSelection: jest.fn() });
    await onViewClick(s.host, ev);
    expect(s.host.state).toMatchObject({ loading: false, showPopup: false, loadingAttachments: false });
    expect(s.host.state.error).toContain("join exploded");
    expect(s.host.clearHighlight).toHaveBeenCalled();
    expect(s.host.notifyGraffPolygonSelection).toHaveBeenLastCalledWith("", false);
    expect(s.host.restoreExtentBeforeSelection).toHaveBeenCalled();
  });

  test("unexpected error after popup opened keeps popup open", async () => {
    const s = setup({ calculatePopupPosition: jest.fn(() => ({ x: 0, y: 0 })), schedulePopupLayoutAfterContent: jest.fn(() => { throw new Error("layout"); }), isDashboardEmbedded: jest.fn(() => true) });
    await onViewClick(s.host, ev);
    expect(s.host.state.showPopup).toBe(true);
    expect(s.host.state.error).toContain("layout");
    expect(s.host.restoreExtentBeforeSelection).not.toHaveBeenCalled();
  });

  test("superseded click does not touch state", async () => {
    const s = setup();
    s.host.resolveClickLayers = jest.fn(() => {
      s.host._clickGeneration += 1;
      return Promise.resolve([]);
    });
    await onViewClick(s.host, ev);
    expect(s.host.resolveClickFeatureAt).not.toHaveBeenCalled();
    expect(s.host.state.showPopup).toBe(false);
    const unmounted = setup();
    unmounted.host.resolveClickLayers = jest.fn(() => {
      unmounted.host._isMounted = false;
      return Promise.resolve([]);
    });
    await onViewClick(unmounted.host, ev);
    expect(unmounted.host.resolveClickFeatureAt).not.toHaveBeenCalled();
  });

  test("a newer click during OID query discards the older result", async () => {
    const s = setup();
    s.host.queryFeatureByObjectIdCached = jest.fn(() => {
      s.host._clickGeneration += 1;
      return Promise.resolve(asGraphic({ attributes: { OBJECTID: 11 }, geometry }));
    });
    await onViewClick(s.host, ev);
    expect(s.host.state.showPopup).toBe(false);
    expect(s.host.resolveDisplayAttrs).not.toHaveBeenCalled();
  });
});
