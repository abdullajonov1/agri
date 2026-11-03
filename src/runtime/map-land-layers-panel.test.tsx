const mockSync = jest.fn(async (): Promise<void> => undefined);
const mockRelease = jest.fn();
const mockHold = jest.fn((): (() => void) => mockRelease);
const SIRDARYO = { yil: "2026", viloyat: "Sirdaryo viloyati", tuman: "", lockedViloyat: "" };
let mockScope = SIRDARYO;
jest.mock("../gis/agri-land-layers", () => ({
  syncAgriLandLayers: (...args: unknown[]): Promise<void> => mockSync(...(args as [])),
  holdInactiveLandLayersHidden: (...args: unknown[]): (() => void) => mockHold(...(args as [])),
  useAgriLandScope: () => mockScope,
  isRepublicLandScope: (scope: { viloyat: string; lockedViloyat: string }): boolean =>
    !scope.viloyat && !scope.lockedViloyat,
}));

import { act, fireEvent, render, screen } from "@testing-library/react";
import { React } from "jimu-core";
import MapLandLayersPanel from "./map-land-layers-panel";
import { getAgriLandOverlay, setAgriLandOverlay, setReserveCropFilter } from "../store/agri-land-overlay-store";

const view = {} as __esri.MapView;

const toggleOf = (name: string): HTMLElement => screen.getByRole("switch", { name, hidden: true });

describe("MapLandLayersPanel", () => {
  beforeEach(() => {
    mockSync.mockClear();
    mockScope = SIRDARYO;
    act(() => setAgriLandOverlay(null));
  });

  it("slides the panel open and closed from its button", () => {
    const onOpenChange = jest.fn();
    const { container } = render(<MapLandLayersPanel language="uz_lat" view={view} onOpenChange={onOpenChange} />);
    const panel = container.querySelector(".agri-dashboard-land-panel");
    expect(panel?.classList.contains("is-open")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Yer qatlamlari" }));
    expect(panel?.classList.contains("is-open")).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Yer qatlamlari" }));
    expect(panel?.classList.contains("is-open")).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps only one overlay on at a time", () => {
    render(<MapLandLayersPanel language="uz_lat" view={view} />);
    fireEvent.click(toggleOf("Zaxira maydonlari"));
    expect(toggleOf("Zaxira maydonlari").getAttribute("aria-checked")).toBe("true");

    fireEvent.click(toggleOf("Foydalanilmagan yer"));
    expect(getAgriLandOverlay()).toBe("unused");
    expect(toggleOf("Zaxira maydonlari").getAttribute("aria-checked")).toBe("false");
    expect(toggleOf("Foydalanilmagan yer").getAttribute("aria-checked")).toBe("true");

    fireEvent.click(toggleOf("Foydalanilmagan yer"));
    expect(getAgriLandOverlay()).toBeNull();
  });

  it("applies the overlay and scope to the map view", () => {
    render(<MapLandLayersPanel language="uz_lat" view={view} />);
    fireEvent.click(toggleOf("Zaxira maydonlari"));
    expect(mockSync).toHaveBeenLastCalledWith(view, "reserve", mockScope, "");
  });

  it("passes the crop picked on the reserve chart to the map", () => {
    render(<MapLandLayersPanel language="uz_lat" view={view} />);
    fireEvent.click(toggleOf("Zaxira maydonlari"));
    act(() => setReserveCropFilter({ key: "Paxta", where: "turi IN ('Paxta')" }));
    expect(mockSync).toHaveBeenLastCalledWith(view, "reserve", mockScope, "turi IN ('Paxta')");
    // Leaving reserve drops the pick.
    fireEvent.click(toggleOf("Foydalanilmagan yer"));
    expect(mockSync).toHaveBeenLastCalledWith(view, "unused", mockScope, "");
  });

  it("waits for the map view", () => {
    const { rerender } = render(<MapLandLayersPanel language="uz_lat" view={null} />);
    expect(mockSync).not.toHaveBeenCalled();
    rerender(<MapLandLayersPanel language="uz_lat" view={view} />);
    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it("closes when field compare opens, and announces its own opening", () => {
    const heard = jest.fn();
    document.addEventListener("agriLandLayersToggled", heard);
    const { container } = render(<MapLandLayersPanel language="ru" view={view} />);
    fireEvent.click(screen.getByRole("button", { name: "Слои земель" }));
    expect(heard).toHaveBeenCalledTimes(1);
    act(() => {
      document.dispatchEvent(new CustomEvent("agriFieldCompareToggled", { detail: { open: true } }));
    });
    expect(container.querySelector(".agri-dashboard-land-panel")?.classList.contains("is-open")).toBe(false);
    document.removeEventListener("agriLandLayersToggled", heard);
  });

  it("keeps the land layers hidden from the start and releases the watch on unmount", () => {
    mockHold.mockClear();
    mockRelease.mockClear();
    const { unmount } = render(<MapLandLayersPanel language="uz_lat" view={view} />);
    expect(mockHold).toHaveBeenCalledTimes(1);
    expect((mockHold.mock.calls[0] as unknown[])[0]).toBe(view);
    unmount();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it("locks unused land in the republic view; reserve stays switchable", () => {
    mockScope = { ...SIRDARYO, viloyat: "" };
    render(<MapLandLayersPanel language="uz_lat" view={view} />);
    const unused = toggleOf("Foydalanilmagan yer") as HTMLButtonElement;
    expect(unused.disabled).toBe(true);
    expect(unused.title).toBe("Avval viloyatni tanlang");
    fireEvent.click(unused);
    expect(getAgriLandOverlay()).toBeNull();
    fireEvent.click(toggleOf("Zaxira maydonlari"));
    expect(getAgriLandOverlay()).toBe("reserve");
  });

  it("a locked viloyat (access) counts as chosen", () => {
    mockScope = { ...SIRDARYO, viloyat: "", lockedViloyat: "Sirdaryo viloyati" };
    render(<MapLandLayersPanel language="uz_lat" view={view} />);
    expect((toggleOf("Foydalanilmagan yer") as HTMLButtonElement).disabled).toBe(false);
  });

  it("switches unused land off when the view goes back to the republic", () => {
    const { rerender } = render(<MapLandLayersPanel language="uz_lat" view={view} />);
    fireEvent.click(toggleOf("Foydalanilmagan yer"));
    expect(getAgriLandOverlay()).toBe("unused");
    mockScope = { ...SIRDARYO, viloyat: "" };
    rerender(<MapLandLayersPanel language="uz_lat" view={view} />);
    expect(getAgriLandOverlay()).toBeNull();
  });

  it("turns the overlay off when unmounted", () => {
    const { unmount } = render(<MapLandLayersPanel language="uz_lat" view={view} />);
    fireEvent.click(toggleOf("Zaxira maydonlari"));
    unmount();
    expect(getAgriLandOverlay()).toBeNull();
  });
});
