jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));

import { React } from "jimu-core";
import { render } from "@testing-library/react";
import { renderStatusBarShape, type StatusBarShapeProps } from "./statusBarShape";

const draw = (
  props: StatusBarShapeProps,
  color = "#16a34a",
  selected = false,
  dimmed = false,
  theme: "light" | "dark" = "light",
): HTMLElement => {
  const { container } = render(<svg>{renderStatusBarShape(props, color, selected, dimmed, theme)}</svg>);
  return container;
};

describe("renderStatusBarShape", () => {
  test("light theme uses tailwind-50 track for known colors", () => {
    const c = draw({ x: 0, y: 50, width: 40, height: 100, payload: { fill: 0.5 } });
    const paths = c.querySelectorAll("path");
    expect(paths).toHaveLength(3);
    expect(paths[0].getAttribute("fill")).toBe("#f0fdf4");
    expect(paths[2].getAttribute("fill")).toBe("#16a34a");
    expect(c.querySelector("filter")?.id).toBe("vh-bar-glow-16a34a");
    expect((c.querySelector("g") as SVGGElement).style.opacity).toBe("1");
  });

  test("unknown color uses color-mix; dark theme tint", () => {
    const light = draw({ x: 0, y: 0, width: 40, height: 100 }, "#123456");
    expect(light.querySelector("path")?.getAttribute("fill")).toContain("color-mix(in srgb, #123456 14%");
    const dark = draw({ x: 0, y: 0, width: 40, height: 100 }, "#16a34a", false, false, "dark");
    expect(dark.querySelector("path")?.getAttribute("fill")).toContain("22%, transparent");
  });

  test("selected adds outline and dimmed reduces opacity", () => {
    const c = draw({ x: 0, y: 0, width: 40, height: 100 }, "#ef4444", true, true);
    expect(c.querySelectorAll("path")).toHaveLength(4);
    expect((c.querySelector("g") as SVGGElement).style.opacity).toBe("0.68");
  });

  test("tiny bar uses minimum height and short-slant geometry", () => {
    const c = draw({ x: 5, y: 100, width: 30, height: 0 });
    const d = c.querySelectorAll("path")[2].getAttribute("d") || "";
    expect(d.startsWith("M ")).toBe(true);
    expect(d).toContain("Z");
  });

  test("zero width produces empty path", () => {
    const c = draw({});
    expect(c.querySelectorAll("path")[2].getAttribute("d")).toBe("");
  });
});
