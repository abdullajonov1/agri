import { React } from "jimu-core";
import { fireEvent, render, screen } from "@testing-library/react";
import SwipeDateBar from "./SwipeDateBar";
import { SWIPE_COPY, type SwipeLanguage } from "./swipe-copy";

type Status = "loading" | "ready" | "error";

const setup = (status: Status = "ready", language: SwipeLanguage = "en") => {
  const onClose = jest.fn();
  const onRetry = jest.fn();
  const onFocusSide = jest.fn();
  const utils = render(
    <SwipeDateBar
      language={language}
      mainDate="2026-06-01"
      compareDate="2026-06-15"
      status={status}
      onClose={onClose}
      onRetry={onRetry}
      onFocusSide={onFocusSide}
    />,
  );
  return { ...utils, onClose, onRetry, onFocusSide };
};

describe("SwipeDateBar", () => {
  it("renders both dates", () => {
    setup();
    expect(screen.getByText(/2026-06-01/)).toBeTruthy();
    expect(screen.getByText(/2026-06-15/)).toBeTruthy();
  });

  it("shows spinner and aria-busy while loading", () => {
    const { container } = setup("loading");
    expect(container.querySelector(".agri-dashboard-spinner")).not.toBeNull();
    expect(container.querySelector(".agri-field-swipe-chip--compare")?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it("shows error text and retry calls onRetry", () => {
    const { onRetry } = setup("error");
    expect(screen.getByText(SWIPE_COPY.en.error)).toBeTruthy();
    fireEvent.click(screen.getByText(SWIPE_COPY.en.retry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("close calls onClose", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByLabelText(SWIPE_COPY.en.close));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chips call onFocusSide", () => {
    const { container, onFocusSide } = setup();
    fireEvent.click(container.querySelector(".agri-field-swipe-chip--main") as Element);
    fireEvent.click(container.querySelector(".agri-field-swipe-chip--compare") as Element);
    expect(onFocusSide).toHaveBeenNthCalledWith(1, "main");
    expect(onFocusSide).toHaveBeenNthCalledWith(2, "compare");
  });

  it("stops pointerdown propagation", () => {
    const parent = jest.fn();
    render(
      <div onPointerDown={parent}>
        <SwipeDateBar language="en" mainDate="a" compareDate="b" status="ready"
          onClose={jest.fn()} onRetry={jest.fn()} onFocusSide={jest.fn()} />
      </div>,
    );
    fireEvent.pointerDown(document.querySelector(".agri-field-swipe-bar") as Element);
    expect(parent).not.toHaveBeenCalled();
  });

  it.each(["uz_lat", "uz_cyr", "ru", "en"] as SwipeLanguage[])("renders %s captions", (lang) => {
    setup("ready", lang);
    expect(screen.getByText(SWIPE_COPY[lang].main)).toBeTruthy();
    expect(screen.getByText(SWIPE_COPY[lang].compare)).toBeTruthy();
  });
});
