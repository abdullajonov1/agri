import type { JimuMapView } from "jimu-arcgis";
import { makePopupHost, makeRect, makeView } from "../__test-utils__/popup-host-stub";
import {
  calculatePinnedPosition,
  clampPopupToMapContainer,
  getCropOverlayTop,
  getEffectiveMapBottom,
  getFeatureQueryCacheKey,
  getMapAreaRect,
  getPinnedPopupHeight,
  getPopupDimensions,
  getPopupWidth,
  getResolvedTheme,
  handleOutsideClick,
  isDashboardEmbedded,
  measurePopupHeight,
  onPopupDragEnd,
  onPopupDragMove,
  popupPositionsEqual,
  pruneFeatureQueryCache,
  repositionPinnedIfNeeded,
  schedulePopupLayout,
  togglePinToCorner,
  tr,
} from "./layout-handlers";

const VIEW_RECT = { left: 0, top: 0, width: 1000, height: 800 };
const jmv = (view: __esri.MapView): JimuMapView => ({ view }) as unknown as JimuMapView;

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  jest.useRealTimers();
});

describe("popup geometry", () => {
  test("getPopupWidth clamps to map width with a 220px floor", () => {
    const { host } = makePopupHost();
    expect(getPopupWidth(host)).toBe(300);
    expect(getPopupWidth(host, makeView(VIEW_RECT))).toBe(300);
    expect(getPopupWidth(host, makeView({ ...VIEW_RECT, width: 200 }))).toBe(220);
  });

  test("calculatePinnedPosition differs for standalone vs dashboard", () => {
    const view = makeView(VIEW_RECT);
    expect(calculatePinnedPosition(makePopupHost().host, view)).toEqual({ x: 690, y: 10 });
    const dash = makePopupHost({}, { id: "agri-popup" }).host;
    expect(isDashboardEmbedded(dash)).toBe(true);
    expect(calculatePinnedPosition(dash, view)).toEqual({ x: 670, y: 20 });
  });

  test("getEffectiveMapBottom respects the crop overlay in dashboard mode", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost({}, { id: "agri-popup" });
    expect(getCropOverlayTop(host)).toBeNull();
    expect(getEffectiveMapBottom(host, view)).toBe(796);

    const crop = document.createElement("div");
    crop.className = "agri-dashboard-crop-overlay agri-dashboard-managed-crop";
    crop.getBoundingClientRect = () => makeRect({ left: 0, top: 600, width: 100, height: 50 });
    document.body.appendChild(crop);
    expect(getCropOverlayTop(host)).toBe(600);
    expect(getEffectiveMapBottom(host, view, 10)).toBe(590);
    expect(getCropOverlayTop(makePopupHost().host)).toBeNull();
  });

  test("getMapAreaRect prefers a sized dashboard map slot", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost({}, { id: "agri-popup" });
    const slot = document.createElement("div");
    slot.className = "agri-dashboard-map-slot";
    slot.getBoundingClientRect = () => makeRect({ left: 5, top: 5, width: 500, height: 400 });
    document.body.appendChild(slot);
    expect(getMapAreaRect(host, view).width).toBe(500);
    expect(getMapAreaRect(makePopupHost().host, view).width).toBe(1000);
  });

  test("getPinnedPopupHeight and getPopupDimensions", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost();
    expect(getPinnedPopupHeight(host, view, 10)).toBe(780);
    expect(getPinnedPopupHeight(host, view, 750)).toBe(160);
    expect(getPinnedPopupHeight(makePopupHost({}, { id: "x-popup" }).host, view, 10)).toBe(770);
    expect(getPopupDimensions(host)).toEqual({ width: 300, height: 300 });
    expect(getPopupDimensions(host, view, true, { x: 0, y: 10 })).toEqual({ width: 300, height: 780 });
    expect(getPopupDimensions(host, view, true)).toEqual({ width: 300, height: 780 });
  });

  test("clampPopupToMapContainer keeps the popup inside the map", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost();
    expect(clampPopupToMapContainer(host, { x: 900, y: 700 }, view)).toEqual({ x: 690, y: 480 });
    expect(clampPopupToMapContainer(host, { x: -50, y: -50 }, view)).toEqual({ x: 10, y: 10 });
  });

  test("popupPositionsEqual uses an epsilon", () => {
    const { host } = makePopupHost();
    expect(popupPositionsEqual(host, null, { x: 0, y: 0 })).toBe(false);
    expect(popupPositionsEqual(host, { x: 1, y: 1 }, { x: 1.5, y: 0.5 })).toBe(true);
    expect(popupPositionsEqual(host, { x: 1, y: 1 }, { x: 3, y: 1 })).toBe(false);
  });

  test("measurePopupHeight sums header + content or falls back to rect", () => {
    const { host } = makePopupHost();
    const el = document.createElement("div");
    el.getBoundingClientRect = () => makeRect({ left: 0, top: 0, width: 10, height: 42.2 });
    expect(measurePopupHeight(host, el)).toBe(43);
    const header = document.createElement("div");
    header.className = "agri3-popup-header";
    Object.defineProperty(header, "offsetHeight", { value: 30 });
    const content = document.createElement("div");
    content.className = "agri3-popup-content";
    Object.defineProperty(content, "scrollHeight", { value: 100.4 });
    el.append(header, content);
    expect(measurePopupHeight(host, el)).toBe(131);
  });
});

describe("popup cache, theme and i18n", () => {
  test("pruneFeatureQueryCache drops expired entries", () => {
    const { host } = makePopupHost();
    const value = Promise.resolve(null);
    host._featureQueryCache.set("old", { expires: 5, value });
    host._featureQueryCache.set("new", { expires: 50, value });
    pruneFeatureQueryCache(host, 10);
    expect(Array.from(host._featureQueryCache.keys())).toEqual(["new"]);
  });

  test("getFeatureQueryCacheKey dedupes and sorts out fields", () => {
    const { host } = makePopupHost();
    const layer = { url: "https://x/0" } as __esri.FeatureLayer;
    expect(getFeatureQueryCacheKey(host, layer, "oid", 7, ["b", "a", "b"])).toBe("https://x/0|oid|7|a,b");
  });

  test("getResolvedTheme honours stored preference", () => {
    const { host } = makePopupHost();
    localStorage.setItem("agri_v11_app_theme", "light");
    expect(getResolvedTheme(host)).toBe(false);
    localStorage.setItem("agri_v11_app_theme", "dark");
    expect(getResolvedTheme(host)).toBe(true);
    localStorage.clear();
    expect(getResolvedTheme(host)).toBe(true);
  });

  test("tr uses the current language", () => {
    expect(tr(makePopupHost({ currentLang: "en" }).host, "status.loading")).toBe("Loading...");
  });
});

describe("popup positioning flows", () => {
  test("repositionPinnedIfNeeded pins to corner or clamps free position", () => {
    const view = makeView(VIEW_RECT);
    const pinned = makePopupHost({ showPopup: true, pinToCorner: true, jimuMapView: jmv(view) });
    repositionPinnedIfNeeded(pinned.host);
    expect(pinned.host.state.popupPosition).toEqual({ x: 690, y: 10 });
    repositionPinnedIfNeeded(pinned.host);
    expect(pinned.host.forceUpdate).toHaveBeenCalled();

    const free = makePopupHost({ showPopup: true, popupPosition: { x: 990, y: 5 }, jimuMapView: jmv(view) });
    repositionPinnedIfNeeded(free.host);
    expect(free.host.state.popupPosition).toEqual({ x: 690, y: 10 });

    const hidden = makePopupHost({ showPopup: false, jimuMapView: jmv(view) });
    repositionPinnedIfNeeded(hidden.host);
    expect(hidden.setState).not.toHaveBeenCalled();
  });

  test("schedulePopupLayout debounces and skips while dragging", () => {
    jest.useFakeTimers();
    const reposition = jest.fn();
    const { host } = makePopupHost({}, {}, { repositionPinnedIfNeeded: reposition });
    schedulePopupLayout(host);
    schedulePopupLayout(host);
    jest.advanceTimersByTime(60);
    expect(reposition).toHaveBeenCalledTimes(1);
    host._isDraggingPopup = true;
    schedulePopupLayout(host);
    jest.advanceTimersByTime(60);
    expect(reposition).toHaveBeenCalledTimes(1);
  });

  test("togglePinToCorner pins, then unpins back to click point", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost(
      { showPopup: true, jimuMapView: jmv(view), clickScreenPoint: { x: 100, y: 100 } },
      {},
      { schedulePopupLayoutAfterContent: jest.fn() },
    );
    togglePinToCorner(host);
    expect(host.state.pinToCorner).toBe(true);
    expect(host.state.chartExpanded).toBe(true);
    expect(host.state.popupPosition).toEqual({ x: 690, y: 10 });
    expect(host.broadcastPopupVisibility).toHaveBeenCalledWith(true);
    togglePinToCorner(host);
    expect(host.state.pinToCorner).toBe(false);
    expect(host.state.popupPosition).toEqual({ x: 110, y: 110 });
  });

  test("handleOutsideClick minimizes only for clicks outside popup and map", () => {
    const view = makeView(VIEW_RECT);
    const popupEl = document.createElement("div");
    const inner = document.createElement("span");
    popupEl.appendChild(inner);
    const outside = document.createElement("p");
    document.body.append(popupEl, outside, view.container as HTMLElement);
    const { host } = makePopupHost({ showPopup: true, jimuMapView: jmv(view) }, {}, { _popupRef: { current: popupEl } });

    handleOutsideClick(host, { target: inner } as unknown as MouseEvent);
    handleOutsideClick(host, { target: view.container } as unknown as MouseEvent);
    expect(host.minimizePopup).not.toHaveBeenCalled();
    handleOutsideClick(host, { target: outside } as unknown as MouseEvent);
    expect(host.minimizePopup).toHaveBeenCalledTimes(1);
  });

  test("drag move clamps and drag end stops dragging", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost({ jimuMapView: jmv(view) });
    host._isDraggingPopup = true;
    host._popupDragOffset = { x: 5, y: 5 };
    onPopupDragMove(host, { clientX: 105, clientY: 105 } as MouseEvent);
    expect(host.state.popupPosition).toEqual({ x: 100, y: 100 });
    onPopupDragEnd(host);
    expect(host._isDraggingPopup).toBe(false);
  });
});
