import { makePopupHost } from "../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../popup-host";
import type { AttachmentItem, State } from "../popup-types";

const mockRequest = jest.fn();
const mockUnbind = jest.fn();
const mockBind = jest.fn((_handler: unknown) => mockUnbind);

jest.mock("esri/request", () => ({ default: (...a: unknown[]) => mockRequest(...a) }), { virtual: true });
jest.mock("../../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (h: unknown) => mockBind(h),
}));

import {
  closePopup,
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
  fetchAttachmentPreview,
  loadAttachmentsForOid,
  onDataSourceCreated,
  revokeAllAttachmentUrls,
} from "./field-handlers";
import { AGRI_MAP_CLICK_EVENT, AGRI_MAP_VIEW_READY_EVENT, AGRI_XY_PAGE_CLOSED_EVENT } from "../../../../gis/agri-data-layer-roles";

type Obj = Record<string, unknown>;
const asLayer = (o: Obj): never => o as never;

describe("field-handlers: attachments", () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  beforeEach(() => {
    mockRequest.mockReset();
    URL.createObjectURL = jest.fn(() => "blob:preview");
    URL.revokeObjectURL = jest.fn();
  });
  afterAll(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  const attachmentHost = (over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
    makePopupHost({}, {}, {
      layerSupportsAttachments: jest.fn(() => true),
      isImageContentType: jest.fn((ct?: string) => /^image\//.test(ct || "")),
      fetchAttachmentPreview: jest.fn(() => Promise.resolve(new Blob(["x"]))),
      ...over,
    }).host;

  test("fetchAttachmentPreview unwraps response data blobs", async () => {
    const { host } = makePopupHost();
    const blob = new Blob(["a"]);
    mockRequest.mockResolvedValueOnce({ data: blob });
    expect(await fetchAttachmentPreview(host, "http://x/a")).toBe(blob);
    expect(mockRequest).toHaveBeenCalledWith("http://x/a", expect.objectContaining({ responseType: "blob" }));
    const raw = new Blob(["b"]);
    mockRequest.mockResolvedValueOnce(raw);
    expect(await fetchAttachmentPreview(host, "http://x/b")).toBe(raw);
  });

  test("revokeAllAttachmentUrls frees preview URLs only", () => {
    const attachments = [{ id: 1, previewObjectUrl: "blob:1" }, { id: 2 }] as AttachmentItem[];
    const { host } = makePopupHost({ attachments });
    revokeAllAttachmentUrls(host);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:1");
    (URL.revokeObjectURL as jest.Mock).mockImplementationOnce(() => { throw new Error("x"); });
    expect(() => revokeAllAttachmentUrls(host)).not.toThrow();
  });

  test("layers without attachment support show an empty list silently", async () => {
    const host = attachmentHost({ layerSupportsAttachments: jest.fn(() => false) });
    await loadAttachmentsForOid(host, asLayer({}), 1);
    expect(host.state).toMatchObject({ loadingAttachments: false, attachments: [], attachmentsError: null, attachmentsExpanded: true });
    const unmounted = attachmentHost({ layerSupportsAttachments: jest.fn(() => false), _isMounted: false });
    await loadAttachmentsForOid(unmounted, asLayer({}), 1);
    expect(unmounted.setState).not.toHaveBeenCalled();
  });

  test("loads attachment list and previews only for images", async () => {
    const host = attachmentHost();
    const layer = asLayer({
      queryAttachments: jest.fn(() => Promise.resolve({
        7: [
          { id: 1, name: "a.png", size: 10, contentType: "image/png", url: "http://x/1" },
          { id: 2, name: "b.pdf", size: 20, contentType: "application/pdf", url: "http://x/2" },
          { id: 3, name: "c.png", size: 5, contentType: "image/png" },
        ],
      })),
    });
    await loadAttachmentsForOid(host, layer, 7);
    expect((layer as Obj).queryAttachments).toHaveBeenCalledWith({ objectIds: [7] });
    const items = host.state.attachments;
    expect(items.map((i) => i.id)).toEqual([1, 2, 3]);
    expect(items[0].previewObjectUrl).toBe("blob:preview");
    expect(items[1].previewObjectUrl).toBeUndefined();
    expect(items[2].previewObjectUrl).toBeUndefined();
    expect(host.fetchAttachmentPreview).toHaveBeenCalledTimes(1);
    expect(host.state).toMatchObject({ loadingAttachments: false, attachmentsError: null, attachmentsExpanded: true });
  });

  test("preview failures and empty results are tolerated", async () => {
    const host = attachmentHost({ fetchAttachmentPreview: jest.fn(() => Promise.reject(new Error("img"))) });
    const layer = asLayer({ queryAttachments: () => Promise.resolve({ 1: [{ id: 1, name: "a", contentType: "image/png", url: "u" }] }) });
    await loadAttachmentsForOid(host, layer, 1);
    expect(host.state.attachments).toHaveLength(1);
    expect(host.state.attachments[0].previewObjectUrl).toBeUndefined();
    await loadAttachmentsForOid(host, asLayer({ queryAttachments: () => Promise.resolve({}) }), 9);
    expect(host.state.attachments).toEqual([]);
  });

  test("unmounted host skips final state update", async () => {
    const host = attachmentHost();
    const layer = asLayer({
      queryAttachments: () => { host._isMounted = false; return Promise.resolve({}); },
    });
    await loadAttachmentsForOid(host, layer, 1);
    expect(host.state.attachments).toEqual([]);
    expect(host.state.loadingAttachments).toBe(true);
  });

  test("unsupported-attachment server errors are silent, others surface", async () => {
    const silent = attachmentHost();
    await loadAttachmentsForOid(silent, asLayer({ queryAttachments: () => Promise.reject(new Error("Layer does not support attachments")) }), 1);
    expect(silent.state.attachmentsError).toBeNull();
    expect(silent.state.attachments).toEqual([]);

    const notSupported = attachmentHost();
    await loadAttachmentsForOid(notSupported, asLayer({ queryAttachments: () => Promise.reject(new Error("Operation not supported for attachment")) }), 1);
    expect(notSupported.state.attachmentsError).toBeNull();

    const loud = attachmentHost();
    await loadAttachmentsForOid(loud, asLayer({ queryAttachments: () => Promise.reject(new Error("Network exploded")) }), 1);
    expect(loud.state).toMatchObject({ loadingAttachments: false, attachmentsError: "Network exploded", attachmentsExpanded: true });

    const gone = attachmentHost({ _isMounted: true });
    await loadAttachmentsForOid(gone, asLayer({ queryAttachments: () => { gone._isMounted = false; return Promise.reject(new Error("late")); } }), 1);
    expect(gone.state.attachmentsError).toBeNull();
  });
});

describe("field-handlers: lifecycle", () => {
  afterEach(() => {
    jest.useRealTimers();
    mockBind.mockClear();
    mockUnbind.mockClear();
  });

  const lifecycleHost = (state: Partial<State> = {}, over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
    makePopupHost(state, {}, {
      setupThemeObserver: jest.fn(),
      getResolvedTheme: jest.fn(() => true),
      handleThemeChange: jest.fn(),
      handleLanguageChange: jest.fn(),
      handleOutsideClick: jest.fn(),
      handleMasterFilterChanged: jest.fn(),
      handleWidgetSelectionChanged: jest.fn(),
      schedulePopupLayout: jest.fn(),
      handleMapViewReady: jest.fn(),
      handleSharedMapClick: jest.fn(),
      handleXyPageClosed: jest.fn(),
      isDashboardEmbedded: jest.fn(() => false),
      scheduleMapViewFallback: jest.fn(),
      ensureMapClickAttached: jest.fn(() => false),
      getLinkedMapWidgetId: jest.fn(() => "map"),
      detachMapClick: jest.fn(),
      cleanupHighlight: jest.fn(),
      onPopupDragMove: jest.fn(),
      onPopupDragEnd: jest.fn(),
      ...over,
    }).host;

  test("componentDidMount wires every listener and bootstraps the map click", () => {
    jest.useFakeTimers();
    const host = lifecycleHost({ isDarkTheme: true });
    componentDidMount(host);
    expect(host._isMounted).toBe(true);
    expect(host.setupThemeObserver).toHaveBeenCalled();
    expect(mockBind).toHaveBeenCalledWith(host.handleMasterFilterChanged);
    expect(host.scheduleMapViewFallback).toHaveBeenCalled();

    document.dispatchEvent(new CustomEvent("themeChanged"));
    document.dispatchEvent(new CustomEvent("languageChanged"));
    document.dispatchEvent(new CustomEvent("widgetSelectionChanged"));
    document.dispatchEvent(new MouseEvent("mousedown"));
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event(AGRI_MAP_VIEW_READY_EVENT));
    window.dispatchEvent(new Event(AGRI_MAP_CLICK_EVENT));
    window.dispatchEvent(new Event(AGRI_XY_PAGE_CLOSED_EVENT));
    window.dispatchEvent(new Event("scroll"));
    expect(host.handleThemeChange).toHaveBeenCalledTimes(1);
    expect(host.handleLanguageChange).toHaveBeenCalledTimes(1);
    expect(host.handleWidgetSelectionChanged).toHaveBeenCalledTimes(1);
    expect(host.handleOutsideClick).toHaveBeenCalledTimes(1);
    expect(host.handleMapViewReady).toHaveBeenCalledTimes(1);
    expect(host.handleSharedMapClick).toHaveBeenCalledTimes(1);
    expect(host.handleXyPageClosed).toHaveBeenCalledTimes(1);
    expect((host.schedulePopupLayout as jest.Mock).mock.calls.length).toBe(2);

    jest.advanceTimersByTime(2500);
    expect(host.mapClickBootstrapTimer).not.toBeNull();
    (host.ensureMapClickAttached as jest.Mock).mockReturnValue(true);
    jest.advanceTimersByTime(2500);
    expect(host.mapClickBootstrapTimer).toBeNull();

    componentWillUnmount(host);
    document.dispatchEvent(new CustomEvent("themeChanged"));
    window.dispatchEvent(new Event("resize"));
    expect(host.handleThemeChange).toHaveBeenCalledTimes(1);
    expect(host.schedulePopupLayout).toHaveBeenCalledTimes(2);
  });

  test("componentDidMount syncs theme and skips scroll listener when embedded", () => {
    const host = lifecycleHost({ isDarkTheme: false }, { isDashboardEmbedded: jest.fn(() => true) });
    componentDidMount(host);
    expect(host.state.isDarkTheme).toBe(true);
    window.dispatchEvent(new Event("scroll"));
    expect(host.schedulePopupLayout).not.toHaveBeenCalled();
    componentWillUnmount(host);
    if (host.mapClickBootstrapTimer) clearInterval(host.mapClickBootstrapTimer);
  });

  test("componentWillUnmount releases timers, observers and caches", () => {
    jest.useFakeTimers();
    const disconnect = jest.fn();
    const themeDisconnect = jest.fn();
    const cancel = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const host = lifecycleHost({ showPopup: true, attachments: [{ id: 1, previewObjectUrl: "blob:z" }] as AttachmentItem[] }, {
      _unbindMasterFilter: mockUnbind,
      mapViewFallbackTimer: setTimeout(() => undefined, 1000),
      mapInitRetryTimer: setTimeout(() => undefined, 1000),
      mapClickBootstrapTimer: setInterval(() => undefined, 1000),
      _popupLayoutTimer: setTimeout(() => undefined, 1000),
      _popupLayoutRaf: 7,
      mapAreaResizeObserver: { disconnect } as never,
      themeObserver: { disconnect: themeDisconnect } as never,
      broadcastPopupVisibility: jest.fn(),
    });
    host._featureQueryCache.set("k", { expires: 1, value: Promise.resolve(null) });
    URL.revokeObjectURL = jest.fn();
    componentWillUnmount(host);
    expect(host._isMounted).toBe(false);
    expect(host.broadcastPopupVisibility).toHaveBeenCalledWith(false);
    expect(host.detachMapClick).toHaveBeenCalled();
    expect(host.cleanupHighlight).toHaveBeenCalled();
    expect(mockUnbind).toHaveBeenCalled();
    expect(host._unbindMasterFilter).toBeNull();
    expect(cancel).toHaveBeenCalledWith(7);
    expect(disconnect).toHaveBeenCalled();
    expect(themeDisconnect).toHaveBeenCalled();
    expect(host.mapAreaResizeObserver).toBeNull();
    expect(host.themeObserver).toBeNull();
    expect(host._featureQueryCache.size).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:z");
    cancel.mockRestore();
  });

  describe("componentDidUpdate", () => {
    const props = (ids: unknown, ds: unknown = undefined): never => ({ useMapWidgetIds: ids, useDataSources: ds }) as never;
    const withProps = (host: PopupWidgetHost, ids: unknown, ds: unknown = undefined): PopupWidgetHost => {
      host.props = { ...host.props, useMapWidgetIds: ids, useDataSources: ds } as never;
      return host;
    };
    const prev = (over: Partial<State> = {}): State => ({ ...makePopupHost().host.state, ...over });

    test("re-initializes map connection when data sources or map change with a live view", () => {
      const jmv = { view: {} } as never;
      const host = withProps(lifecycleHost({ jimuMapView: jmv }, { initializeMapConnection: jest.fn(() => Promise.resolve()) }), ["m2"]);
      componentDidUpdate(host, props(["m1"]), prev({ jimuMapView: jmv }));
      expect(host.initializeMapConnection).toHaveBeenCalledWith(jmv);
      const ds = withProps(lifecycleHost({ jimuMapView: jmv }, { initializeMapConnection: jest.fn(() => Promise.resolve()) }), ["m1"], [{ dataSourceId: "b" }]);
      componentDidUpdate(ds, props(["m1"], [{ dataSourceId: "a" }]), prev({ jimuMapView: jmv }));
      expect(ds.initializeMapConnection).toHaveBeenCalled();
    });

    test("map change without a view falls back to scheduling; no change does nothing", () => {
      const host = withProps(lifecycleHost(), ["m2"]);
      componentDidUpdate(host, props(["m1"]), prev());
      expect(host.scheduleMapViewFallback).toHaveBeenCalledTimes(1);
      const same = withProps(lifecycleHost({}, { initializeMapConnection: jest.fn() }), ["m1"]);
      componentDidUpdate(same, props(["m1"]), prev());
      expect(same.scheduleMapViewFallback).not.toHaveBeenCalled();
      expect(same.initializeMapConnection).not.toHaveBeenCalled();
      const viaGet = withProps(lifecycleHost(), { 0: undefined, get: () => "m3" });
      componentDidUpdate(viaGet, props(["m1"]), prev());
      expect(viaGet.scheduleMapViewFallback).toHaveBeenCalled();
    });

    test("broadcasts visibility on open/minimize/pin transitions", () => {
      const mk = (state: Partial<State>): PopupWidgetHost =>
        withProps(lifecycleHost(state, { broadcastPopupVisibility: jest.fn(), schedulePopupLayoutAfterContent: jest.fn() }), undefined);
      const opened = mk({ showPopup: true });
      componentDidUpdate(opened, props(undefined), prev({ showPopup: false }));
      expect(opened.broadcastPopupVisibility).toHaveBeenCalledWith(true);
      expect(opened.schedulePopupLayoutAfterContent).toHaveBeenCalled();

      const minimized = mk({ showPopup: true, popupMinimized: true });
      componentDidUpdate(minimized, props(undefined), prev({ showPopup: true, popupMinimized: false }));
      expect(minimized.broadcastPopupVisibility).toHaveBeenCalledWith(false);
      expect(minimized.schedulePopupLayoutAfterContent).not.toHaveBeenCalled();

      const pinned = mk({ showPopup: true, pinToCorner: true });
      componentDidUpdate(pinned, props(undefined), prev({ showPopup: true, pinToCorner: false }));
      expect(pinned.broadcastPopupVisibility).toHaveBeenCalledWith(true);
    });

    test("relayouts only when visible content changed", () => {
      const mk = (state: Partial<State>): PopupWidgetHost =>
        withProps(lifecycleHost(state, { broadcastPopupVisibility: jest.fn(), schedulePopupLayoutAfterContent: jest.fn() }), undefined);
      const attrs = { a: 1 };
      const idle = mk({ showPopup: true, selectedAttrs: attrs });
      componentDidUpdate(idle, props(undefined), prev({ showPopup: true, selectedAttrs: attrs }));
      expect(idle.schedulePopupLayoutAfterContent).not.toHaveBeenCalled();
      for (const patch of [{ selectedAttrs: { b: 2 } }, { loading: true }, { loadingAttachments: true }, { attachments: [{ id: 1 } as AttachmentItem] }]) {
        const h = mk({ showPopup: true, selectedAttrs: attrs, ...patch });
        componentDidUpdate(h, props(undefined), prev({ showPopup: true, selectedAttrs: attrs }));
        expect(h.schedulePopupLayoutAfterContent).toHaveBeenCalledTimes(1);
      }
      const hidden = mk({ showPopup: false });
      componentDidUpdate(hidden, props(undefined), prev({ showPopup: false, loading: true }));
      expect(hidden.schedulePopupLayoutAfterContent).not.toHaveBeenCalled();
    });
  });

  describe("onDataSourceCreated and closePopup", () => {
    test("registers data source and kicks off map connection or fallback", () => {
      const onDsCreated = jest.fn();
      const jmv = { view: {} } as never;
      const withView = makePopupHost({ jimuMapView: jmv }, {}, {
        dataSourceEngine: { onDsCreated } as never,
        initializeMapConnection: jest.fn(() => Promise.resolve()),
        scheduleMapViewFallback: jest.fn(),
      }).host;
      const ds = { id: "ds1" } as never;
      onDataSourceCreated(withView, ds);
      expect(onDsCreated).toHaveBeenCalledWith(ds, []);
      expect(withView.state.dataSourcesById).toEqual({ ds1: ds });
      expect(withView.initializeMapConnection).toHaveBeenCalledWith(jmv);

      const noView = makePopupHost({}, {}, { dataSourceEngine: { onDsCreated } as never, scheduleMapViewFallback: jest.fn() }).host;
      onDataSourceCreated(noView, ds);
      expect(noView.scheduleMapViewFallback).toHaveBeenCalled();

      onDsCreated.mockClear();
      onDataSourceCreated(noView, { id: "" } as never);
      expect(onDsCreated).not.toHaveBeenCalled();
    });

    test("closePopup with default options hides panel but keeps highlight, then optionally restores extent", () => {
      const host = makePopupHost({ showPopup: true, selectedAttrs: { a: 1 }, chartExpanded: true }, {}, {
        revokeAllAttachmentUrls: jest.fn(),
        restoreExtentBeforeSelection: jest.fn(),
        clearHighlight: jest.fn(),
        notifyGraffPolygonSelection: jest.fn(),
        _extentBeforeSelection: {} as never,
      }).host;
      closePopup(host, { restoreExtent: true, notifyDeselect: true });
      expect(host.state).toMatchObject({ showPopup: false, selectedAttrs: null, chartExpanded: false, latestIndexValues: null });
      expect(host.clearHighlight).toHaveBeenCalled();
      expect(host.notifyGraffPolygonSelection).toHaveBeenCalledWith("", false);
      expect(host.restoreExtentBeforeSelection).toHaveBeenCalled();
    });
  });
});
