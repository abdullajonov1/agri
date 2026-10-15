import { React } from "jimu-core";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FieldComparePanel from "./field-compare-panel";
import {
  fetchPolygonAvailableDates,
  fetchPolygonExportImageTiff,
} from "../gis/agri-polygon-api-source";

jest.mock("../gis/agri-polygon-api-source", () => ({
  fetchPolygonExportImageTiff: jest.fn(),
  fetchPolygonAvailableDates: jest.fn(),
}));

jest.mock("../gis/agri-vegetation-overlay-prefetch", () => ({
  getVegetationOverlayContext: () => ({ regionId: 4, year: 2026, lastIndex: "ndvi" }),
}));

const fetchTiff = fetchPolygonExportImageTiff as jest.Mock;
const fetchDates = fetchPolygonAvailableDates as jest.Mock;

const selectField = (): void => {
  document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
    detail: { source: "AgriPopup", polygonMode: true, uniqueid: "{abc}", regionId: 4 },
  }));
  document.dispatchEvent(new CustomEvent("graffDateIndexSelectionChanged", {
    detail: {
      date: "2026-06-01",
      indexKey: "ndvi",
      availableDates: ["2026-06-01", "2026-06-15"],
      navigable: true,
    },
  }));
};

describe("FieldComparePanel", () => {
  beforeEach(() => {
    fetchTiff.mockReset();
    fetchDates.mockReset();
    fetchTiff.mockResolvedValue({ canvas: { toDataURL: () => "data:image/png;base64,abc" } });
    fetchDates.mockResolvedValue(["2026-06-20"]);
  });

  test("calendar changes only the popup image", async () => {
    render(<FieldComparePanel language="uz_lat" />);
    fireEvent.click(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }));
    act(() => { selectField(); });

    await waitFor(() => expect(fetchTiff).toHaveBeenCalledWith(expect.objectContaining({
      uniqueid: "abc",
      regionId: 4,
      rasterDate: "2026-06-01",
      indiceType: "ndvi",
      stretch: "fixed",
    })));

    const panel = document.querySelector(".agri-dashboard-compare-panel");
    const stage = panel?.querySelector(".agri-dashboard-compare-stage");
    const calendar = panel?.querySelector(".agri-dashboard-compare-calendar");
    expect(stage && calendar && stage.compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const callsAfterSeed = fetchTiff.mock.calls.length;
    act(() => {
      document.dispatchEvent(new CustomEvent("graffDateIndexSelectionChanged", {
        detail: {
          date: "2026-06-15",
          indexKey: "savi",
          availableDates: ["2026-06-01", "2026-06-15"],
          navigable: true,
        },
      }));
    });
    expect(fetchTiff.mock.calls.length).toBe(callsAfterSeed);
    expect(document.querySelector('[data-date="2026-06-01"]')?.getAttribute("aria-pressed")).toBe("true");

    const sceneDay = document.querySelector('[data-date="2026-06-15"]');
    const emptyDay = document.querySelector('[data-date="2026-06-02"]');
    const outsideIndex = document.querySelector('[data-date="2026-06-20"]');
    expect(sceneDay?.className).toContain("has-scene");
    expect(emptyDay?.className).not.toContain("has-scene");
    expect(outsideIndex?.className).not.toContain("has-scene");

    const callsBeforeNoise = fetchTiff.mock.calls.length;
    act(() => {
      document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
        detail: { source: "AgriPie", polygonMode: false, turi: "Bug'doy" },
      }));
      document.dispatchEvent(new CustomEvent("widgetSelectionChanged", {
        detail: { source: "AgriGraffWidget", ndviDate: "2026-06-02", timestamp: 1 },
      }));
    });
    expect(fetchTiff.mock.calls.length).toBe(callsBeforeNoise);

    const dispatched: string[] = [];
    const spy = jest.spyOn(document, "dispatchEvent").mockImplementation((event: Event) => {
      dispatched.push(event.type);
      return true;
    });
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    await waitFor(() => expect(fetchTiff).toHaveBeenCalledWith(expect.objectContaining({
      rasterDate: "2026-06-15",
    })));
    expect(dispatched.filter((type) => (
      type === "graffDateIndexSelectionChanged" ||
      type === "masterFilterChanged" ||
      type === "widgetSelectionChanged"
    ))).toEqual([]);
    spy.mockRestore();

    const callsAfterPopupPick = fetchTiff.mock.calls.length;
    act(() => {
      document.dispatchEvent(new CustomEvent("graffDateIndexSelectionChanged", {
        detail: {
          date: "2026-06-01",
          indexKey: "savi",
          availableDates: ["2026-06-01", "2026-06-15"],
          navigable: true,
        },
      }));
    });
    expect(fetchTiff.mock.calls.length).toBe(callsAfterPopupPick);
    expect(document.querySelector('[data-date="2026-06-15"]')?.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Xarita sanasi" }));
    await waitFor(() => expect(fetchTiff).toHaveBeenLastCalledWith(expect.objectContaining({
      rasterDate: "2026-06-01",
      indiceType: "ndvi",
    })));

    fireEvent.click(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }));
    expect(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }));
    act(() => {
      document.dispatchEvent(new CustomEvent("agriIndicatorsDrawerToggled", { detail: { open: true } }));
    });
    expect(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }).getAttribute("aria-expanded")).toBe("false");
  });

  test("shows the shared loader and a translated empty state", async () => {
    let rejectFetch: (reason: Error) => void = () => undefined;
    fetchTiff.mockReturnValue(new Promise((_resolve, reject) => {
      rejectFetch = reject;
    }));
    render(<FieldComparePanel language="ru" />);
    fireEvent.click(screen.getByRole("button", { name: "Сравнить снимок поля" }));
    act(() => { selectField(); });
    expect(document.querySelector(".agri-dashboard-spinner")).not.toBeNull();
    await act(async () => {
      rejectFetch(new Error("no raster"));
    });
    expect(screen.getByText("Снимок отсутствует")).toBeTruthy();
  });

  test("opens when a field is selected", () => {
    render(<FieldComparePanel language="uz_lat" />);
    expect(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }).getAttribute("aria-expanded")).toBe("false");
    act(() => { selectField(); });
    expect(screen.getByRole("button", { name: "Maydon rasmini solishtirish" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Indeks mavjud bo‘lgan sana")).toBeTruthy();
  });

  test("uses the selected language for the compare controls", () => {
    const { unmount } = render(<FieldComparePanel language="uz_cyr" />);
    expect(screen.getByRole("button", { name: "Майдон расмини солиштириш" })).toBeTruthy();
    unmount();
    render(<FieldComparePanel language="en" />);
    expect(screen.getByRole("button", { name: "Compare field image" })).toBeTruthy();
  });
});
