/** @jsx jsx */
jest.mock("jimu-core", () => {
  const react = jest.requireActual<typeof import("react")>("react");
  return { React: react, jsx: react.createElement };
});
import { jsx } from "jimu-core";
import { render } from "@testing-library/react";
import SwipeDateTags, { formatSwipeDate, SWIPE_TAG_MIN_SPACE } from "./SwipeDateTags";

const base = { mainDate: "2026-04-12", compareDate: "2026-04-28", viewWidth: 1000, mainLabel: "Main", compareLabel: "Compare" };
const main = (c: HTMLElement): HTMLElement | null => c.querySelector(".agri-field-swipe-tag--main");
const cmp = (c: HTMLElement): HTMLElement | null => c.querySelector(".agri-field-swipe-tag--compare");

describe("formatSwipeDate", () => {
  test("formats YYYY-MM-DD as DD.MM.YYYY", () => {
    expect(formatSwipeDate("2026-04-28")).toBe("28.04.2026");
  });
  test("returns input unchanged when it does not match", () => {
    expect(formatSwipeDate("bad")).toBe("bad");
  });
});

describe("SwipeDateTags", () => {
  test("renders both tags with formatted dates and sr labels at 50%", () => {
    const { container } = render(<SwipeDateTags {...base} position={50} />);
    expect(SWIPE_TAG_MIN_SPACE).toBe(104);
    expect(main(container)?.textContent).toBe("Main: 12.04.2026");
    expect(cmp(container)?.textContent).toBe("Compare: 28.04.2026");
    expect(main(container)?.style.right).toBe("calc(50% + 30px)");
    expect(cmp(container)?.style.left).toBe("calc(50% + 30px)");
    expect(container.querySelector(".agri-field-swipe-tag-sr")).not.toBeNull();
  });
  test("hides main tag when left side is too narrow", () => {
    const { container } = render(<SwipeDateTags {...base} position={5} />);
    expect(main(container)).toBeNull();
    expect(cmp(container)).not.toBeNull();
  });
  test("hides compare tag when right side is too narrow", () => {
    const { container } = render(<SwipeDateTags {...base} position={95} />);
    expect(cmp(container)).toBeNull();
    expect(main(container)).not.toBeNull();
  });
  test("clamps position above 100", () => {
    const { container } = render(<SwipeDateTags {...base} position={150} />);
    expect(main(container)?.style.right).toBe("calc(0% + 30px)");
    expect(cmp(container)).toBeNull();
  });
  test("renders both when viewWidth is not positive", () => {
    const { container } = render(<SwipeDateTags {...base} position={1} viewWidth={0} />);
    expect(main(container)).not.toBeNull();
    expect(cmp(container)).not.toBeNull();
  });
});
