import {
  AGRI_MAP_CLICK_EVENT,
  AGRI_MAP_VIEW_READY_EVENT,
  AGRI_XY_PAGE_CLOSED_EVENT,
  dispatchMapClick,
  dispatchMapViewReady,
  dispatchXyPageClosed,
} from "./agri-data-layer-roles";

jest.mock("./agri-map-click-debug", () => ({ agriMapClickDebug: jest.fn() }));

function captureEvents(type: string): { details: unknown[]; stop: () => void } {
  const details: unknown[] = [];
  const handler = (ev: Event) => details.push((ev as CustomEvent).detail);
  window.addEventListener(type, handler);
  return { details, stop: () => window.removeEventListener(type, handler) };
}

describe("agri-data-layer-roles dispatchers", () => {
  test("dispatchMapClick emits detail when mapWidgetId set", () => {
    const cap = captureEvents(AGRI_MAP_CLICK_EVENT);
    dispatchMapClick({ mapWidgetId: "map1", x: 1, y: 2 });
    dispatchMapClick({ mapWidgetId: "", x: 1, y: 2 });
    cap.stop();
    expect(cap.details).toEqual([{ mapWidgetId: "map1", x: 1, y: 2 }]);
  });

  test("dispatchMapViewReady ignores empty id", () => {
    const cap = captureEvents(AGRI_MAP_VIEW_READY_EVENT);
    dispatchMapViewReady("");
    dispatchMapViewReady("m");
    cap.stop();
    expect(cap.details).toEqual([{ mapWidgetId: "m" }]);
  });

  test("dispatchXyPageClosed always fires, stringifying id", () => {
    const cap = captureEvents(AGRI_XY_PAGE_CLOSED_EVENT);
    dispatchXyPageClosed(null);
    dispatchXyPageClosed("m2");
    cap.stop();
    expect(cap.details).toEqual([{ mapWidgetId: "" }, { mapWidgetId: "m2" }]);
  });
});
