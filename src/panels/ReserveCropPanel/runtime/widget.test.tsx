jest.mock("../../../shared/AgriChartLoader", () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="loader" />,
}));
const mockQuery = jest.fn();
jest.mock("./reserve-crop-data", () => ({
  queryReserveCropRows: (scope: unknown): Promise<unknown> => mockQuery(scope) as Promise<unknown>,
}));
const mockScope = { current: { yil: "2026", viloyat: "", tuman: "", lockedViloyat: "" } };
jest.mock("../../../gis/agri-land-layers", () => ({
  useAgriLandScope: () => mockScope.current,
}));
jest.mock("../../../data/agri-filter-bus", () => ({
  bindMasterFilter: (): (() => void) => () => undefined,
}));

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { React } from "jimu-core";
import ReserveCropPanel from "./widget";
import { rememberPieCropColor } from "../../../shared/agri-crop-color-registry";
import { getReserveCropFilter, setReserveCropFilter } from "../../../store/agri-land-overlay-store";

describe("ReserveCropPanel", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    act(() => setReserveCropFilter(null));
    mockScope.current = { yil: "2026", viloyat: "", tuman: "", lockedViloyat: "" };
  });

  it("charts the crops returned for the scope", async () => {
    mockQuery.mockResolvedValue([{ crop: "Paxta", maydon: 120 }]);
    render(<ReserveCropPanel active />);
    expect(screen.getByTestId("loader")).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("list")).toBeTruthy());
    expect(mockQuery).toHaveBeenCalledWith(mockScope.current);
  });

  it("scales bars to the largest crop and colours them like the pie", async () => {
    rememberPieCropColor("Paxta", "#abcdef");
    mockQuery.mockResolvedValue([
      { crop: "Paxta", maydon: 200 },
      { crop: "Bug'doy", maydon: 50 },
    ]);
    const { container } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    const cols = Array.from(container.querySelectorAll(".agri-reserve-crop-col"));
    expect(cols.map((c) => c.getAttribute("data-fill"))).toEqual(["1", "0.25"]);
    // Every bar shows its own value.
    expect(cols.map((c) => c.querySelector(".agri-reserve-crop-value")?.textContent)).toEqual([
      "200 ga",
      "50 ga",
    ]);
    expect((cols[0] as HTMLElement).style.getPropertyValue("--bar-color")).toBe("#abcdef");
    expect(cols.map((c) => c.querySelector(".agri-reserve-crop-share")?.textContent)).toEqual(["80%", "20%"]);
  });

  it("puts value, name and share in the header above every bar", async () => {
    mockQuery.mockResolvedValue([{ crop: "Paxta", maydon: 1000, where: "turi IN ('Paxta')" }]);
    const { container } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
    const head = container.querySelector(".agri-reserve-crop-head");
    expect(head?.querySelector(".agri-reserve-crop-value")?.textContent?.replace(/\s/g, " ")).toBe("1 000 ga");
    expect(head?.querySelector(".agri-reserve-crop-label")?.textContent).toBe("Paxta");
    expect(head?.querySelector(".agri-reserve-crop-share")?.textContent).toBe("100%");
    // The header sits before the bar, never inside it.
    expect(container.querySelector(".agri-reserve-crop-bar .agri-reserve-crop-value")).toBeNull();
  });

  it("clicking a bar filters the map to that crop; clicking again clears it", async () => {
    mockQuery.mockResolvedValue([
      { crop: "Paxta", maydon: 200, where: "turi IN ('Paxta')" },
      { crop: "Mosh", maydon: 50, where: "turi IN ('Mosh')" },
    ]);
    const { container } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    const cols = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(".agri-reserve-crop-col"));

    fireEvent.click(cols()[1]);
    expect(getReserveCropFilter()).toEqual({ key: "Mosh", where: "turi IN ('Mosh')" });
    expect(cols()[1].getAttribute("aria-pressed")).toBe("true");
    expect(cols()[0].classList.contains("is-dimmed")).toBe(true);

    fireEvent.click(cols()[1]);
    expect(getReserveCropFilter()).toBeNull();
    expect(cols()[0].classList.contains("is-dimmed")).toBe(false);
  });

  it("a bar without a usable WHERE cannot be clicked", async () => {
    mockQuery.mockResolvedValue([{ crop: "Boshqa", maydon: 5 }]);
    render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
    const col = screen.getByRole("listitem") as HTMLButtonElement;
    expect(col.disabled).toBe(true);
    fireEvent.click(col);
    expect(getReserveCropFilter()).toBeNull();
  });

  it("drops the pick when the new scope has no such crop", async () => {
    mockQuery.mockResolvedValueOnce([{ crop: "Mosh", maydon: 5, where: "turi IN ('Mosh')" }]);
    mockQuery.mockResolvedValueOnce([{ crop: "Paxta", maydon: 9, where: "turi IN ('Paxta')" }]);
    const { rerender } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
    fireEvent.click(screen.getByRole("listitem"));
    expect(getReserveCropFilter()?.key).toBe("Mosh");
    mockScope.current = { ...mockScope.current, viloyat: "Andijon viloyati" };
    rerender(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getByRole("listitem").textContent).toContain("Paxta"));
    await waitFor(() => expect(getReserveCropFilter()).toBeNull());
  });

  it("keeps the previous bars while a new scope loads", async () => {
    mockQuery.mockResolvedValueOnce([{ crop: "Paxta", maydon: 5 }]);
    mockQuery.mockReturnValueOnce(new Promise(() => undefined));
    const { container, rerender } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getByRole("list")).toBeTruthy());
    mockScope.current = { ...mockScope.current, viloyat: "Andijon viloyati" };
    rerender(<ReserveCropPanel active />);
    await waitFor(() =>
      expect(container.querySelector(".agri-reserve-crop-grid.is-refreshing")).not.toBeNull(),
    );
    expect(screen.queryByTestId("loader")).toBeNull();
  });

  it("has a table twin for screen readers", async () => {
    mockQuery.mockResolvedValue([{ crop: "Paxta", maydon: 120 }]);
    const { container } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(container.querySelector("table.agri-reserve-crop-sr")).not.toBeNull());
    expect(container.querySelector("table.agri-reserve-crop-sr td")?.textContent).toBe("120 ga");
  });

  it("does not query while hidden or before a year is known", () => {
    render(<ReserveCropPanel active={false} />);
    mockScope.current = { ...mockScope.current, yil: "" };
    render(<ReserveCropPanel active />);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("shows the empty state", async () => {
    mockQuery.mockResolvedValue([]);
    const { container } = render(<ReserveCropPanel active />);
    await waitFor(() => expect(container.querySelector(".agri-reserve-crop-empty")).not.toBeNull());
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows query errors", async () => {
    mockQuery.mockRejectedValue(new Error("server down"));
    render(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("server down"));
  });

  it("ignores a response for a scope it has left", async () => {
    let resolveOld: (rows: unknown[]) => void = () => undefined;
    mockQuery.mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }));
    mockQuery.mockResolvedValueOnce([{ crop: "Paxta", maydon: 1 }]);
    const { rerender } = render(<ReserveCropPanel active />);
    mockScope.current = { ...mockScope.current, viloyat: "Andijon viloyati" };
    rerender(<ReserveCropPanel active />);
    await waitFor(() => expect(screen.getByRole("list")).toBeTruthy());
    await act(async () => {
      resolveOld([]);
      await Promise.resolve();
    });
    expect(screen.getByRole("list")).toBeTruthy();
  });
});
