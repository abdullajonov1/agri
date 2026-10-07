import { makePopupHost } from "../../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../../popup-host";
import type { IHandleLike } from "../../popup-types";
import type { JimuMapView } from "jimu-arcgis";
import {
  attachMapClick,
  broadcastPopupVisibility,
  detachMapClick,
  ensureMapClickAttached,
  handleMasterFilterChanged,
  handleSharedMapClick,
  handleWidgetSelectionChanged,
  handleXyPageClosed,
  notifyGraffPolygonSelection,
} from "./click-events";

const asJmv = (view: unknown): JimuMapView => ({ view }) as unknown as JimuMapView;
const evt = (detail: unknown): Event => new CustomEvent("x", { detail });

describe("click-events: map click wiring", () => {
  test("attachMapClick detaches then registers click handler", () => {
    const handle: IHandleLike = { remove: jest.fn() };
    const on = jest.fn(() => handle);
    const { host } = makePopupHost({}, {}, { detachMapClick: jest.fn(), onViewClick: jest.fn() });
    attachMapClick(host, asJmv({ on }));
    expect(host.detachMapClick).toHaveBeenCalled();
    expect(on).toHaveBeenCalledWith("click", host.onViewClick);
    expect(host._clickHandle).toBe(handle);
  });

  test("attachMapClick ignores views without on()", () => {
    const { host } = makePopupHost({}, {}, { detachMapClick: jest.fn(), _clickHandle: null as never });
    attachMapClick(host, asJmv({}));
    attachMapClick(host, null as never);
    expect(host._clickHandle).toBeNull();
  });

  test("detachMapClick removes and clears handle", () => {
    const remove = jest.fn();
    const { host } = makePopupHost({}, {}, { _clickHandle: { remove } });
    detachMapClick(host);
    expect(remove).toHaveBeenCalled();
    expect(host._clickHandle).toBeNull();
    detachMapClick(host);
  });

  describe("ensureMapClickAttached", () => {
    const make = (state: Parameters<typeof makePopupHost>[0], over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
      makePopupHost(state, {}, {
        getLinkedMapWidgetId: jest.fn(() => "map1"),
        getMapViewFromManager: jest.fn(() => null),
        onActiveViewChange: jest.fn(),
        attachMapClick: jest.fn(),
        _clickHandle: null as never,
        ...over,
      }).host;

    test("false when unmounted", () => {
      expect(ensureMapClickAttached(make({}, { _isMounted: false }))).toBe(false);
    });
    test("false when no map view anywhere", () => {
      expect(ensureMapClickAttached(make({}))).toBe(false);
    });
    test("activates manager view when state has none", () => {
      const jmv = asJmv({});
      const host = make({}, { getMapViewFromManager: jest.fn(() => jmv) });
      expect(ensureMapClickAttached(host)).toBe(true);
      expect(host.getMapViewFromManager).toHaveBeenCalledWith("map1");
      expect(host.onActiveViewChange).toHaveBeenCalledWith(jmv);
    });
    test("attaches click when missing and reports handle state", () => {
      const jmv = asJmv({});
      const host = make({ jimuMapView: jmv });
      expect(ensureMapClickAttached(host)).toBe(false);
      expect(host.attachMapClick).toHaveBeenCalledWith(jmv);
      const attached = make({ jimuMapView: jmv }, { _clickHandle: { remove: jest.fn() } });
      expect(ensureMapClickAttached(attached)).toBe(true);
      expect(attached.attachMapClick).not.toHaveBeenCalled();
    });
  });
});

describe("click-events: hub handlers", () => {
  const make = (state: Parameters<typeof makePopupHost>[0] = {}, over: Partial<PopupWidgetHost> = {}): PopupWidgetHost =>
    makePopupHost(state, {}, {
      closePopup: jest.fn(),
      openPopupForUniqueid: jest.fn(() => Promise.resolve()),
      isDashboardEmbedded: jest.fn(() => true),
      _lastMasterGeoKey: "",
      _activeInspectedUniqueid: "",
      ...over,
    }).host;

  test("handleXyPageClosed only closes in dashboard with visible popup", () => {
    const h = make({ showPopup: true });
    handleXyPageClosed(h);
    expect(h.closePopup).toHaveBeenCalledWith({ restoreExtent: false, notifyDeselect: false });
    const hidden = make({ showPopup: false });
    handleXyPageClosed(hidden);
    expect(hidden.closePopup).not.toHaveBeenCalled();
    const notDash = make({ showPopup: true }, { isDashboardEmbedded: jest.fn(() => false) });
    handleXyPageClosed(notDash);
    expect(notDash.closePopup).not.toHaveBeenCalled();
  });

  describe("handleMasterFilterChanged", () => {
    test("ignored when unmounted", () => {
      const h = make({}, { _isMounted: false });
      handleMasterFilterChanged(h, evt({ filters: { yil: 1 } }));
      expect(h._lastMasterGeoKey).toBe("");
    });
    test("first geography does not close; later change closes without restore", () => {
      const h = make({ showPopup: true });
      handleMasterFilterChanged(h, evt({ filters: { yil: 2024, viloyat: "A", tuman: "B" } }));
      expect(h._lastMasterGeoKey).toBe("2024|A|B");
      expect(h.closePopup).not.toHaveBeenCalled();
      handleMasterFilterChanged(h, evt({ filters: { yil: 2024, viloyat: "A", tuman: "C" } }));
      expect(h.closePopup).toHaveBeenCalledWith({ restoreExtent: false, notifyDeselect: false });
    });
    test("polygon selection records id and opens popup when closed", () => {
      const h = make({ showPopup: false });
      handleMasterFilterChanged(h, evt({ filters: { polygonMode: true, uniqueid: "{abc-1}" } }));
      expect(h._activeInspectedUniqueid).toBe("abc-1");
      expect(h.openPopupForUniqueid).toHaveBeenCalledWith("abc-1", { zoom: false, notifySelection: false });
      const open = make({ showPopup: true });
      handleMasterFilterChanged(open, evt({ filters: { polygonMode: true, uniqueid: "x" } }));
      expect(open.openPopupForUniqueid).not.toHaveBeenCalled();
    });
    test("polygon cleared closes with restore when showing or loading", () => {
      const h = make({ showPopup: true }, { _activeInspectedUniqueid: "z" });
      handleMasterFilterChanged(h, evt({ filters: { polygonMode: false } }));
      expect(h._activeInspectedUniqueid).toBeNull();
      expect(h.closePopup).toHaveBeenCalledWith({ restoreExtent: true, notifyDeselect: false });
      const loading = make({ loading: true });
      handleMasterFilterChanged(loading, evt({ filters: { polygonMode: false } }));
      expect(loading.closePopup).toHaveBeenCalledTimes(1);
      const idle = make();
      handleMasterFilterChanged(idle, evt({ filters: { polygonMode: false } }));
      expect(idle.closePopup).not.toHaveBeenCalled();
    });
    test("tolerates missing detail", () => {
      const h = make();
      handleMasterFilterChanged(h, new Event("x"));
      expect(h._lastMasterGeoKey).toBe("||");
    });
  });

  describe("handleWidgetSelectionChanged", () => {
    test("ignores unmounted and self-originated events", () => {
      const h = make({}, { _isMounted: false });
      handleWidgetSelectionChanged(h, evt({ yil: 1 }));
      expect(h.closePopup).not.toHaveBeenCalled();
      const own = make();
      handleWidgetSelectionChanged(own, evt({ source: "AgriPopup", yil: 1 }));
      expect(own.closePopup).not.toHaveBeenCalled();
    });
    test("geography change closes without restore", () => {
      for (const d of [{ yil: 1 }, { viloyat: "a" }, { tuman: "b" }]) {
        const h = make();
        handleWidgetSelectionChanged(h, evt(d));
        expect(h.closePopup).toHaveBeenCalledWith({ restoreExtent: false, notifyDeselect: false });
      }
    });
    test("polygonMode false clears and restores", () => {
      const h = make({}, { _activeInspectedUniqueid: "q" });
      handleWidgetSelectionChanged(h, evt({ polygonMode: false }));
      expect(h._activeInspectedUniqueid).toBeNull();
      expect(h.closePopup).toHaveBeenCalledWith({ restoreExtent: true, notifyDeselect: false });
    });
    test("Graff selection opens popup for cleaned id", () => {
      const h = make();
      handleWidgetSelectionChanged(h, evt({ source: "AgriGraff10", polygonMode: true, uniqueid: "{u-1}" }));
      expect(h._activeInspectedUniqueid).toBe("u-1");
      expect(h.openPopupForUniqueid).toHaveBeenCalledWith("u-1", { zoom: false, notifySelection: false });
      const other = make();
      handleWidgetSelectionChanged(other, evt({ source: "Other", polygonMode: true, uniqueid: "u" }));
      expect(other.openPopupForUniqueid).not.toHaveBeenCalled();
      handleWidgetSelectionChanged(other, new Event("x"));
    });
  });

  test("handleSharedMapClick is a no-op", async () => {
    const h = make();
    await expect(handleSharedMapClick(h, evt({}))).resolves.toBeUndefined();
    expect(h.closePopup).not.toHaveBeenCalled();
  });
});

describe("click-events: broadcasts", () => {
  const events: CustomEvent[] = [];
  const listener = (e: Event): void => { events.push(e as CustomEvent); };
  beforeEach(() => {
    events.length = 0;
    document.addEventListener("widgetSelectionChanged", listener);
    document.addEventListener("agriMapPopupVisibility", listener);
  });
  afterEach(() => {
    document.removeEventListener("widgetSelectionChanged", listener);
    document.removeEventListener("agriMapPopupVisibility", listener);
    jest.restoreAllMocks();
  });
  const { host } = makePopupHost({ pinToCorner: true });

  test("notifyGraffPolygonSelection builds detail", () => {
    notifyGraffPolygonSelection(host, "u1", true, 123, 7);
    expect(events[0].detail).toMatchObject({ source: "AgriPopup", polygonMode: true, uniqueid: "u1", regionId: 7, clickedAt: 123 });
  });

  test("notifyGraffPolygonSelection blanks id when polygonMode off and drops bad region", () => {
    notifyGraffPolygonSelection(host, "u1", false, undefined, Number.NaN);
    const d = events[0].detail as { uniqueid: string; regionId?: number; clickedAt: number };
    expect(d.uniqueid).toBe("");
    expect(d.regionId).toBeUndefined();
    expect(typeof d.clickedAt).toBe("number");
    notifyGraffPolygonSelection(host, "u1", true, 1, null);
    expect((events[1].detail as { regionId?: number }).regionId).toBeUndefined();
  });

  test("broadcastPopupVisibility closed emits once, open re-notifies on frame", () => {
    broadcastPopupVisibility(host, false);
    expect(events).toHaveLength(1);
    expect(events[0].detail).toMatchObject({ open: false, pinned: true });
    const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(0); return 1; });
    broadcastPopupVisibility(host, true);
    expect(raf).toHaveBeenCalled();
    expect(events).toHaveLength(3);
    expect(events[2].detail).toMatchObject({ open: true, layout: true });
  });
});
