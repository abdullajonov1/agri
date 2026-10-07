import { makeDashboardHost } from "./__test-utils__/dashboard-host-stub";
import {
  applyDateIndexOverlayBounds,
  applyIndicatorOverlayBounds,
  bringPortalHostToFront,
  clearIndicatorOverlayLayout,
  createPortalHost,
  ensureLayoutObservers,
  ensurePortalHost,
  findSharedLayoutSurface,
  onWindowResize,
  readDashboardCssPx,
  removePortalHost,
  scheduleMapSlotLayout,
  setupMapSlotObserver,
  syncIndicatorOverlayLayout,
} from "./dashboard-layout";

/** Test-only: point a component ref at a fixture element. */
const setRef = <T,>(ref: { readonly current: T | null }, value: T): void => {
  (ref as { current: T | null }).current = value;
};

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

const withRect = <T extends HTMLElement>(el: T, r: DOMRect): T => {
  el.getBoundingClientRect = () => r;
  return el;
};

/** layout-item > dashboard root, inside a surface div attached to body. */
const buildSurface = (): { surface: HTMLDivElement; root: HTMLDivElement } => {
  const surface = document.createElement("div");
  const item = document.createElement("div");
  item.className = "layout-item";
  const root = document.createElement("div");
  item.appendChild(root);
  surface.appendChild(item);
  document.body.appendChild(surface);
  return { surface, root };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("portal host", () => {
  test("creates the portal host on body when no layout surface", () => {
    const { host } = makeDashboardHost();
    expect(findSharedLayoutSurface(host)).toBeNull();
    const portal = createPortalHost(host);
    expect(portal.parentElement).toBe(document.body);
    expect(createPortalHost(host)).toBe(portal);
  });

  test("uses the shared layout surface when the root sits in a layout item", () => {
    const { surface, root } = buildSurface();
    const { host } = makeDashboardHost();
    setRef(host.dashboardRootRef, root);
    expect(findSharedLayoutSurface(host)).toBe(surface);
    const portal = ensurePortalHost(host);
    expect(portal.parentElement).toBe(surface);
    expect(host.portalReady).toBe(true);
    expect(ensurePortalHost(host)).toBe(portal);

    const sibling = document.createElement("div");
    surface.appendChild(sibling);
    bringPortalHostToFront(host);
    expect(surface.lastElementChild).toBe(portal);

    removePortalHost(host);
    expect(portal.isConnected).toBe(false);
    expect(host.portalHost).toBeNull();
    expect(host.portalReady).toBe(false);
  });
});

describe("observers and map reflow", () => {
  const originalRO = (window as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
  const originalRaf = window.requestAnimationFrame;
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames = [];
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => frames.push(cb);
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    (window as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = originalRO;
  });

  test("ensureLayoutObservers attaches resize listener and observes root + slot", () => {
    const observed: Element[] = [];
    class FakeRO {
      constructor(private readonly cb: () => void) {}
      observe(el: Element): void {
        observed.push(el);
      }
      disconnect(): void {
        /* noop */
      }
      unobserve(): void {
        /* noop */
      }
    }
    (window as { ResizeObserver?: unknown }).ResizeObserver = FakeRO;
    const addSpy = jest.spyOn(window, "addEventListener");
    const { host } = makeDashboardHost();
    setRef(host.dashboardRootRef, document.createElement("div"));
    setupMapSlotObserver(host);
    expect(host.layoutObserversReady).toBe(false);
    setRef(host.mapSlotRef, document.createElement("div"));
    ensureLayoutObservers(host);
    expect(host.layoutObserversReady).toBe(true);
    expect(observed).toHaveLength(3);
    expect(addSpy.mock.calls.filter(([type]) => type === "resize")).toHaveLength(1);
    addSpy.mockRestore();
  });

  test("scheduleMapSlotLayout resizes view unless slot size is unchanged", () => {
    const resize = jest.fn();
    const { host } = makeDashboardHost({}, {
      getActiveJimuMapView: () => ({ view: { resize } }) as never,
    });
    const slot = document.createElement("div");
    Object.defineProperty(slot, "clientWidth", { value: 400 });
    Object.defineProperty(slot, "clientHeight", { value: 300 });
    setRef(host.mapSlotRef, slot);

    scheduleMapSlotLayout(host);
    frames.shift()?.(0);
    expect(resize).toHaveBeenCalledTimes(1);
    expect(host.lastMapSlotSize).toEqual({ w: 400, h: 300 });

    scheduleMapSlotLayout(host);
    frames.shift()?.(0);
    expect(resize).toHaveBeenCalledTimes(1);

    onWindowResize(host);
    frames.shift()?.(0);
    expect(resize).toHaveBeenCalledTimes(2);
  });
});

describe("overlay bounds", () => {
  test("readDashboardCssPx falls back without root or value", () => {
    const { host } = makeDashboardHost();
    expect(readDashboardCssPx(host, "--x", 7)).toBe(7);
    setRef(host.dashboardRootRef, document.createElement("div"));
    expect(readDashboardCssPx(host, "--missing", 9)).toBe(9);
  });

  test("applyIndicatorOverlayBounds uses fixed position off-surface", () => {
    const { host } = makeDashboardHost();
    const slot = withRect(document.createElement("div"), rect(100, 50, 800, 600));
    const overlay = document.createElement("div");
    applyIndicatorOverlayBounds(host, slot, overlay);
    expect(overlay.style.getPropertyValue("position")).toBe("fixed");
    expect(overlay.style.getPropertyValue("top")).toBe("60px");
    expect(overlay.style.getPropertyValue("left")).toBe("110px");
    expect(overlay.style.getPropertyValue("height")).toBe("58px");
    expect(overlay.classList.contains("agri-dashboard-managed-indicator")).toBe(true);
  });

  test("applyIndicatorOverlayBounds uses absolute position on the layout surface", () => {
    const { surface, root } = buildSurface();
    withRect(surface, rect(20, 10, 1000, 1000));
    const { host } = makeDashboardHost();
    setRef(host.dashboardRootRef, root);
    const slot = withRect(document.createElement("div"), rect(100, 50, 800, 600));
    const overlay = document.createElement("div");
    surface.appendChild(overlay);
    applyIndicatorOverlayBounds(host, slot, overlay);
    expect(overlay.style.getPropertyValue("position")).toBe("absolute");
    expect(overlay.style.getPropertyValue("top")).toBe("50px");
    expect(overlay.style.getPropertyValue("left")).toBe("90px");
  });

  test("applyDateIndexOverlayBounds positions bottom-right by default", () => {
    const { host } = makeDashboardHost();
    const slot = withRect(document.createElement("div"), rect(0, 0, 1000, 800));
    const overlay = document.createElement("div");
    applyDateIndexOverlayBounds(host, slot, overlay);
    expect(overlay.style.getPropertyValue("top")).toBe("722px");
    expect(overlay.style.getPropertyValue("left")).toBe("780px");
    expect(overlay.style.getPropertyValue("width")).toBe("210px");
    expect(overlay.style.getPropertyValue("z-index")).toBe("45");
  });

  test("applyDateIndexOverlayBounds sits left of a pinned popup", () => {
    const slot = withRect(document.createElement("div"), rect(0, 0, 1000, 800));
    const overlay = document.createElement("div");
    const shell = document.createElement("div");
    shell.className = "agri-date-index-shell has-day-nav";
    overlay.appendChild(shell);

    const noPopup = makeDashboardHost({ mapPopupOpen: true, mapPopupPinned: true }).host;
    applyDateIndexOverlayBounds(noPopup, slot, overlay);
    expect(overlay.style.getPropertyValue("width")).toBe("290px");
    expect(overlay.style.getPropertyValue("left")).toBe("346px");
    expect(overlay.style.getPropertyValue("z-index")).toBe("10001");

    const popup = withRect(document.createElement("div"), rect(600, 100, 340, 400));
    popup.className = "agri3-popup-direct";
    document.body.appendChild(popup);
    applyDateIndexOverlayBounds(noPopup, slot, overlay);
    expect(overlay.style.getPropertyValue("left")).toBe("302px");
    expect(overlay.style.getPropertyValue("top")).toBe("434px");

    const openOnly = makeDashboardHost({ mapPopupOpen: true }).host;
    applyDateIndexOverlayBounds(openOnly, slot, overlay);
    expect(overlay.style.getPropertyValue("z-index")).toBe("10001");
  });

  test("syncIndicatorOverlayLayout clears in-slot overlay and positions date card", () => {
    const { host } = makeDashboardHost();
    const slot = withRect(document.createElement("div"), rect(0, 0, 1000, 800));
    const indicator = document.createElement("div");
    indicator.style.setProperty("top", "5px");
    indicator.classList.add("agri-dashboard-managed-indicator");
    slot.appendChild(indicator);
    const dateCard = document.createElement("div");
    setRef(host.mapSlotRef, slot);
    setRef(host.indicatorOverlayRef, indicator);
    setRef(host.dateIndexOverlayRef, dateCard);

    syncIndicatorOverlayLayout(host);
    expect(host.mapIndicatorHost).toBe(slot);
    expect(indicator.style.getPropertyValue("top")).toBe("");
    expect(indicator.classList.contains("agri-dashboard-managed-indicator")).toBe(false);
    expect(dateCard.style.getPropertyValue("position")).toBe("fixed");

    clearIndicatorOverlayLayout(host);
    expect(dateCard.style.getPropertyValue("position")).toBe("");
  });

  test("syncIndicatorOverlayLayout applies bounds to an out-of-slot overlay", () => {
    const { host } = makeDashboardHost();
    const slot = withRect(document.createElement("div"), rect(0, 0, 100, 100));
    const indicator = document.createElement("div");
    setRef(host.mapSlotRef, slot);
    setRef(host.indicatorOverlayRef, indicator);
    syncIndicatorOverlayLayout(host);
    expect(indicator.style.getPropertyValue("position")).toBe("fixed");
  });
});
