import { React } from "jimu-core";
// Source uses `import ReactDOM from "react-dom"`; ts-jest emits no default
// interop, so expose the CJS module as `default` for createPortal.
jest.mock("react-dom", () => {
  const actual = jest.requireActual<typeof import("react-dom")>("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
import { act, fireEvent, render, screen } from "@testing-library/react";
import FieldComparePanel from "./field-compare-panel";
import { createFieldSwipeController } from "./field-swipe/swipe-controller";

jest.mock("../gis/agri-polygon-api-source", () => ({
  fetchPolygonAvailableDates: jest.fn().mockResolvedValue([]),
}));

jest.mock("../gis/agri-vegetation-overlay-prefetch", () => ({
  getVegetationOverlayContext: () => ({ regionId: 4, year: 2026, lastIndex: "ndvi" }),
}));

jest.mock("./field-swipe/swipe-controller", () => ({
  createFieldSwipeController: jest.fn(),
}));

const createController = createFieldSwipeController as jest.Mock;
const setCompare = jest.fn();
const setPosition = jest.fn();
const retry = jest.fn();
const destroy = jest.fn();
type SwipeState = { status: string; position?: number };
let notify: (state: SwipeState) => void = () => undefined;

const container = document.createElement("div");
document.body.appendChild(container);
const view = { container, width: 1000 } as unknown as __esri.MapView;
const AVAILABLE = ["2026-06-01", "2026-06-15", "2026-06-20"];

const selectField = (uniqueid = "{abc}"): void => {
  document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
    detail: { source: "AgriPopup", polygonMode: true, uniqueid, regionId: 4 },
  }));
};

const chartDate = (date: string | null, indexKey = "ndvi", availableDates = AVAILABLE): void => {
  document.dispatchEvent(new CustomEvent("graffDateIndexSelectionChanged", {
    detail: { date, indexKey, availableDates, navigable: true },
  }));
};

const day = (ymd: string): HTMLButtonElement =>
  document.querySelector(`[data-date="${ymd}"]`) as HTMLButtonElement;

const openButton = (): HTMLElement =>
  document.querySelector(".agri-dashboard-compare-button") as HTMLElement;

const setup = (): void => {
  render(<FieldComparePanel language="en" view={view} />);
  act(() => { selectField(); chartDate("2026-06-01"); });
};

const pickJune15 = (): void => {
  fireEvent.click(openButton());
  fireEvent.click(day("2026-06-15"));
};

describe("FieldComparePanel", () => {
  beforeEach(() => {
    setCompare.mockReset();
    setPosition.mockReset();
    retry.mockReset();
    destroy.mockReset();
    createController.mockReset();
    createController.mockImplementation(() => ({
      setCompare,
      setPosition,
      retry,
      destroy,
      subscribe: (fn: (state: SwipeState) => void) => {
        notify = fn;
        return () => undefined;
      },
    }));
  });

  test("does not open the calendar when a field is selected", () => {
    setup();
    expect(openButton().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(openButton());
    expect(openButton().getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector(".agri-dashboard-compare-panel")?.className).toContain("is-open");
  });

  test("enables only available days and disables the chart date", () => {
    setup();
    fireEvent.click(openButton());
    expect(day("2026-06-15").disabled).toBe(false);
    expect(day("2026-06-15").className).toContain("has-scene");
    expect(day("2026-06-02").disabled).toBe(true);
    expect(day("2026-06-01").disabled).toBe(true);
    expect(day("2026-06-01").className).toContain("is-main");
  });

  test("asks to select a field when no polygon is chosen", () => {
    render(<FieldComparePanel language="en" view={view} />);
    fireEvent.click(openButton());
    expect(screen.getByText("Select a field on the map")).toBeTruthy();
  });

  test("picking a day closes the popover and compares with the chart index", () => {
    setup();
    pickJune15();
    expect(openButton().getAttribute("aria-expanded")).toBe("false");
    expect(setCompare).toHaveBeenLastCalledWith({
      uniqueid: "abc",
      regionId: 4,
      date: "2026-06-15",
      indexKey: "ndvi",
    });
    expect(document.querySelector(".agri-field-swipe-bar")).toBeNull();
    expect(day("2026-06-15").className).toContain("is-selected");
  });

  test("keeps the compare date when the chart date moves to another available date", () => {
    setup();
    pickJune15();
    act(() => { chartDate("2026-06-20"); });
    expect(setCompare).toHaveBeenLastCalledWith(expect.objectContaining({ date: "2026-06-15" }));
  });

  test("clears the compare date when it is no longer available", () => {
    setup();
    pickJune15();
    act(() => { chartDate("2026-06-01", "ndvi", ["2026-06-01", "2026-06-20"]); });
    expect(setCompare).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".agri-field-swipe-bar")).toBeNull();
  });

  test("index change calls setCompare with the new index", () => {
    setup();
    pickJune15();
    act(() => { chartDate("2026-06-01", "savi"); });
    expect(setCompare).toHaveBeenLastCalledWith(expect.objectContaining({
      date: "2026-06-15",
      indexKey: "savi",
    }));
  });

  test("same date as the chart means no swipe and no bar", () => {
    setup();
    pickJune15();
    act(() => { chartDate("2026-06-15"); });
    expect(setCompare).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".agri-field-swipe-bar")).toBeNull();
  });

  test("active Swipe button turns comparison off without opening the popover", () => {
    setup();
    pickJune15();
    const button = screen.getByRole("button", { name: "Close comparison" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(setCompare).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".agri-dashboard-compare-panel")?.className).not.toContain("is-open");
    expect(document.querySelector(".agri-field-swipe-bar")).toBeNull();
  });

  test("loading status marks the button busy", () => {
    setup();
    pickJune15();
    act(() => { notify({ status: "loading" }); });
    const button = screen.getByRole("button", { name: "Close comparison" });
    expect(button.className).toContain("is-loading");
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  test("error status opens the popover with an alert and Retry", () => {
    setup();
    pickJune15();
    act(() => { notify({ status: "error" }); });
    const button = openButton();
    expect(button.className).toContain("has-error");
    fireEvent.click(button);
    expect(document.querySelector(".agri-dashboard-compare-panel")?.className).toContain("is-open");
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalled();
  });

  test("popover has no visible title element", () => {
    setup();
    fireEvent.click(openButton());
    expect(document.querySelector(".agri-dashboard-compare-title")).toBeNull();
  });

  test("polygon change clears the comparison and closes the popover", () => {
    setup();
    pickJune15();
    act(() => { selectField("{def}"); });
    expect(openButton().getAttribute("aria-expanded")).toBe("false");
    expect(setCompare).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".agri-field-swipe-bar")).toBeNull();
  });

  test("deselecting the polygon clears the comparison", () => {
    setup();
    pickJune15();
    act(() => {
      document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
        detail: { source: "AgriPopup", polygonMode: false, uniqueid: "" },
      }));
    });
    expect(setCompare).toHaveBeenLastCalledWith(null);
  });

  test("never dispatches chart events", () => {
    setup();
    const dispatched: string[] = [];
    const spy = jest.spyOn(document, "dispatchEvent").mockImplementation((event: Event) => {
      dispatched.push(event.type);
      return true;
    });
    pickJune15();
    spy.mockRestore();
    expect(dispatched).not.toContain("graffDateIndexSelectionChanged");
    expect(dispatched).not.toContain("widgetSelectionChanged");
  });

  test("closes when the indicators or land layers panels open", () => {
    setup();
    fireEvent.click(openButton());
    act(() => {
      document.dispatchEvent(new CustomEvent("agriLandLayersToggled", { detail: { open: true } }));
    });
    expect(openButton().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(openButton());
    act(() => {
      document.dispatchEvent(new CustomEvent("agriIndicatorsDrawerToggled", { detail: { open: true } }));
    });
    expect(openButton().getAttribute("aria-expanded")).toBe("false");
  });

  test("destroys the controller on unmount and uses the selected language", () => {
    const { unmount } = render(<FieldComparePanel language="ru" view={view} />);
    expect(screen.getByRole("button", { name: "Сравнить снимки" })).toBeTruthy();
    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  describe("date tags", () => {
    const tag = (kind: string): HTMLElement | null =>
      container.querySelector(`.agri-field-swipe-tag--${kind}`);

    test("shows both dates in the map view when ready", () => {
      setup();
      pickJune15();
      act(() => { notify({ status: "ready", position: 50 }); });
      expect(tag("main")?.textContent).toContain("01.06.2026");
      expect(tag("compare")?.textContent).toContain("15.06.2026");
    });

    test("moves the compare tag with the swipe position", () => {
      setup();
      pickJune15();
      act(() => { notify({ status: "ready", position: 30 }); });
      expect(tag("compare")?.style.left).toBe("calc(30% + 8px)");
    });

    test("shows no tags while loading", () => {
      setup();
      pickJune15();
      act(() => { notify({ status: "loading", position: 50 }); });
      expect(tag("main")).toBeNull();
      expect(tag("compare")).toBeNull();
    });

    test("removes the tags when comparison is turned off", () => {
      setup();
      pickJune15();
      act(() => { notify({ status: "ready", position: 50 }); });
      fireEvent.click(screen.getByRole("button", { name: "Close comparison" }));
      expect(tag("main")).toBeNull();
      expect(tag("compare")).toBeNull();
    });
  });
});
