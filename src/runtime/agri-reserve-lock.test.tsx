import { act, render } from "@testing-library/react";
import { React } from "jimu-core";
import AgriReserveLock from "./agri-reserve-lock";
import { setAgriLandOverlay } from "../store/agri-land-overlay-store";

describe("AgriReserveLock", () => {
  afterEach(() => act(() => setAgriLandOverlay(null)));

  const lockOf = (container: HTMLElement): HTMLElement =>
    container.querySelector(".agri-dashboard-reserve-lock") as HTMLElement;

  it("fades and blocks its widget while the reserve overlay is on", () => {
    const { container } = render(<AgriReserveLock><button>pie</button></AgriReserveLock>);
    expect(lockOf(container).classList.contains("is-locked")).toBe(false);
    expect(lockOf(container).hasAttribute("inert")).toBe(false);

    act(() => setAgriLandOverlay("reserve"));
    expect(lockOf(container).classList.contains("is-locked")).toBe(true);
    expect(lockOf(container).hasAttribute("inert")).toBe(true);
    expect(lockOf(container).getAttribute("aria-disabled")).toBe("true");

    act(() => setAgriLandOverlay(null));
    expect(lockOf(container).classList.contains("is-locked")).toBe(false);
    expect(lockOf(container).hasAttribute("inert")).toBe(false);
  });

  it("stays open for the unused land overlay", () => {
    const { container } = render(<AgriReserveLock><span /></AgriReserveLock>);
    act(() => setAgriLandOverlay("unused"));
    expect(lockOf(container).classList.contains("is-locked")).toBe(false);
  });
});
