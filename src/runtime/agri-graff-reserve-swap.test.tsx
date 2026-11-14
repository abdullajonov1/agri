jest.mock("../panels/ReserveCropPanel/runtime/widget", () => ({
  __esModule: true,
  default: (props: { active: boolean }): JSX.Element => (
    <div data-testid="reserve-crop" data-active={String(props.active)} />
  ),
}));

import { act, render, screen } from "@testing-library/react";
import { React } from "jimu-core";
import AgriGraffReserveSwap from "./agri-graff-reserve-swap";
import { setAgriLandOverlay } from "../store/agri-land-overlay-store";

const renderSwap = (): HTMLElement =>
  render(<AgriGraffReserveSwap><div data-testid="graff" /></AgriGraffReserveSwap>).container;

describe("AgriGraffReserveSwap", () => {
  afterEach(() => {
    act(() => setAgriLandOverlay(null));
  });

  it("shows Graff and does not mount the crop chart before reserve is used", () => {
    const container = renderSwap();
    expect(screen.getByTestId("graff")).toBeTruthy();
    expect(screen.queryByTestId("reserve-crop")).toBeNull();
    expect(container.querySelector(".agri-dashboard-graff-swap")?.classList.contains("is-reserve")).toBe(false);
  });

  it("slides the crop chart in for reserve, keeping Graff mounted", () => {
    const container = renderSwap();
    act(() => setAgriLandOverlay("reserve"));
    expect(container.querySelector(".agri-dashboard-graff-swap")?.classList.contains("is-reserve")).toBe(true);
    expect(screen.getByTestId("reserve-crop").getAttribute("data-active")).toBe("true");
    expect(screen.getByTestId("graff")).toBeTruthy();
  });

  it("unused land leaves the widgets alone", () => {
    const container = renderSwap();
    act(() => setAgriLandOverlay("unused"));
    expect(container.querySelector(".agri-dashboard-graff-swap")?.classList.contains("is-reserve")).toBe(false);
    expect(screen.queryByTestId("reserve-crop")).toBeNull();
  });

  it("switching from reserve to unused slides Graff back", () => {
    const container = renderSwap();
    act(() => setAgriLandOverlay("reserve"));
    act(() => setAgriLandOverlay("unused"));
    expect(container.querySelector(".agri-dashboard-graff-swap")?.classList.contains("is-reserve")).toBe(false);
    expect(screen.getByTestId("reserve-crop").getAttribute("data-active")).toBe("false");
  });
});
