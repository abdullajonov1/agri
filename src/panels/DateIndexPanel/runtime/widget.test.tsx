jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));

import { act, fireEvent, render, screen } from "@testing-library/react";
import { React, type AllWidgetProps } from "jimu-core";
import AgriDateIndexIndicator from "./widget";

type Props = AllWidgetProps<Record<string, unknown>>;

const emit = (name: string, detail: unknown): void => {
  act(() => {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  });
};

const renderWidget = () =>
  render(<AgriDateIndexIndicator {...({} as unknown as Props)} />);

const select = (extra: Record<string, unknown> = {}): void =>
  emit("graffDateIndexSelectionChanged", {
    date: "2024-05-02",
    indexKey: "ndvi",
    value: 0.5,
    ...extra,
  });

describe("AgriDateIndexIndicator", () => {
  it("renders nothing until a selection arrives", () => {
    const { container } = renderWidget();
    expect(container.firstChild).toBeNull();
  });

  it("shows index key, DD.MM.YYYY date and 4-decimal value", () => {
    const { container } = renderWidget();
    select();
    expect(screen.getByText("NDVI")).toBeTruthy();
    expect(screen.getByText("02.05.2024")).toBeTruthy();
    expect(screen.getByText("0.5000")).toBeTruthy();
    expect(container.querySelector(".agri-date-index-nav")).toBeNull();
    const shell = container.firstChild as HTMLElement;
    expect(shell.style.getPropertyValue("--agri-date-index-color")).toBe("#00d084");
  });

  it("falls back to dash for non-numeric values and default colour for unknown index", () => {
    const { container } = renderWidget();
    select({ value: "x", indexKey: "zzz", date: "May" });
    expect(screen.getByText("-", { selector: ".stat-value" })).toBeTruthy();
    expect(screen.getByText("May")).toBeTruthy();
    const shell = container.firstChild as HTMLElement;
    expect(shell.style.getPropertyValue("--agri-date-index-color")).toBe("#2ec4f1");
  });

  it("hides again when selection is cleared", () => {
    const { container } = renderWidget();
    select();
    emit("graffDateIndexSelectionChanged", null);
    expect(container.firstChild).toBeNull();
  });

  it("navigates days with chevrons and disables at the edges", () => {
    renderWidget();
    const nav = jest.fn();
    const listener = (e: Event): void => nav((e as CustomEvent).detail);
    document.addEventListener("graffDateIndexNavigate", listener);
    select({
      availableDates: ["2024-05-01", "2024-05-02", "2024-05-03"],
      navigable: true,
    });
    fireEvent.click(screen.getByLabelText("Previous day"));
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(nav).toHaveBeenNthCalledWith(1, expect.objectContaining({ date: "2024-05-01", direction: -1 }));
    expect(nav).toHaveBeenNthCalledWith(2, expect.objectContaining({ date: "2024-05-03", direction: 1 }));

    select({ date: "2024-05-01", availableDates: ["2024-05-01", "2024-05-02"], navigable: true });
    expect((screen.getByLabelText("Previous day") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(nav).toHaveBeenCalledTimes(2);
    document.removeEventListener("graffDateIndexNavigate", listener);
  });

  it("is not navigable with a single date", () => {
    renderWidget();
    select({ availableDates: ["2024-05-02"], navigable: true });
    expect(screen.queryByLabelText("Next day")).toBeNull();
  });

  it("does not navigate when current date is not in the list", () => {
    renderWidget();
    const nav = jest.fn();
    document.addEventListener("graffDateIndexNavigate", nav);
    select({ availableDates: ["2024-06-01", "2024-06-02"], navigable: true });
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(nav).not.toHaveBeenCalled();
    document.removeEventListener("graffDateIndexNavigate", nav);
  });

  it("reacts to theme and language events and ignores events after unmount", () => {
    const { container, unmount } = renderWidget();
    select();
    emit("agriV11ThemeToggled", { theme: "dark" });
    expect((container.firstChild as HTMLElement).className).toContain("dark-theme");
    emit("agriV11ThemeToggled", { theme: "light" });
    expect((container.firstChild as HTMLElement).className).toContain("light-theme");
    emit("agriV11ThemeToggled", null);
    emit("languageChanged", { lang: "ru" });
    emit("languageChanged", { lang: "ru" });
    select({ language: "en", availableDates: "bad" });
    unmount();
    expect(() => select()).not.toThrow();
  });
});
