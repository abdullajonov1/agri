import {
  computeChartLayout,
  detectIpadLayout,
  resolveChartTheme,
  resolveDotStyle,
  resolveMaxVisibleDots,
} from "./chart-layout";
import {
  graffChartErrorTitle,
  graffChartMaxLabel,
  graffChartMinLabel,
  graffChartMonthLabels,
  graffChartRetryLabel,
} from "./chart-labels";

describe("computeChartLayout", () => {
  test("wide layout uses roomy padding", () => {
    const layout = computeChartLayout(1000, 400, false);
    expect(layout.padding).toEqual({ top: 12, right: 8, bottom: 36, left: 56 });
    expect(layout.chartWidth).toBe(1000 - 56 - 8);
    expect(layout.chartHeight).toBe(400 - 12 - 36);
    expect(layout.isNarrow).toBe(false);
    expect(layout.compactChart).toBe(false);
    expect(layout.monthTickY).toBe(12 + layout.chartHeight + 17);
    expect(layout.lineStrokeWidth).toBe(2.85);
  });

  test("narrow layout clamps to a 120px minimum and compacts", () => {
    const layout = computeChartLayout(50, 10, true);
    expect(layout.graphWidth).toBe(120);
    expect(layout.graphHeight).toBe(120);
    expect(layout.isNarrow).toBe(true);
    expect(layout.compactChart).toBe(true);
    expect(layout.padding.left).toBe(50);
    expect(layout.monthTickY).toBe(8 + layout.chartHeight + 16);
    expect(layout.lineStrokeWidth).toBe(3.8);
  });

  test("680px is compact but not narrow", () => {
    const layout = computeChartLayout(680, 300, false);
    expect(layout.isNarrow).toBe(false);
    expect(layout.compactChart).toBe(true);
  });
});

describe("detectIpadLayout", () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("false without matchMedia", () => {
    // jsdom does not implement matchMedia by default.
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    expect(detectIpadLayout()).toBe(false);
  });

  test("true when an iPad media query matches", () => {
    window.matchMedia = ((query: string) => ({ matches: query.includes("1024px") })) as unknown as typeof window.matchMedia;
    expect(detectIpadLayout()).toBe(true);
  });

  test("false when no query matches on a non-touch UA", () => {
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia;
    expect(detectIpadLayout()).toBe(false);
  });
});

describe("theme + dots", () => {
  test("theme colors follow dark mode", () => {
    expect(resolveChartTheme(true).themeText).toBe("#e9f8ff");
    expect(resolveChartTheme(false).themeText).toBe("#111827");
    expect(resolveChartTheme(false).themeGrid).toBe("rgba(15, 23, 42, 0.12)");
  });

  test("max visible dots is clamped per layout", () => {
    expect(resolveMaxVisibleDots(100, false)).toBe(18);
    expect(resolveMaxVisibleDots(10000, false)).toBe(42);
    expect(resolveMaxVisibleDots(100, true)).toBe(8);
    expect(resolveMaxVisibleDots(10000, true)).toBe(14);
  });

  test("dot sizing for light / dark and active / hovered", () => {
    const lightActive = resolveDotStyle(false, true, true, false);
    expect(lightActive.radius).toBe(7.6);
    expect(lightActive.strokeWidth).toBe(2.6);
    expect(lightActive.outerRingWidth).toBe(1.6);
    expect(lightActive.outerRadius).toBeCloseTo(7.6 + 1.3 + 0.8 + 0.4);
    expect(lightActive.glowRadius).toBeCloseTo(9.8);

    const darkIpadHover = resolveDotStyle(true, false, false, true);
    expect(darkIpadHover.radius).toBeCloseTo(5.2);
    expect(darkIpadHover.outerRingWidth).toBe(0);
    expect(darkIpadHover.strokeWidth).toBe(1.7);
    expect(darkIpadHover.glowRadius).toBeCloseTo(6.6);

    expect(resolveDotStyle(false, true, false, false).radius).toBe(5.1);
  });
});

describe("chart labels", () => {
  test("localized strings with uz_cyr fallback", () => {
    expect(graffChartErrorTitle("en")).toBe("Could not load data");
    expect(graffChartRetryLabel("ru")).toBe("Повторить");
    expect(graffChartRetryLabel("uz_lat")).toBe("Qayta urinib ko‘rish");
    expect(graffChartRetryLabel("uz_cyr")).toBe("Qayta urinish");
    expect(graffChartMaxLabel("uz_cyr")).toBe("Макс");
    expect(graffChartMinLabel("en")).toBe("Min");
  });

  test("month labels per language", () => {
    expect(graffChartMonthLabels("en")[0]).toBe("Jan");
    expect(graffChartMonthLabels("uz_lat")[5]).toBe("Iyun");
    expect(graffChartMonthLabels("ru")[11]).toBe("Дек");
    expect(graffChartMonthLabels("uz_cyr")).toHaveLength(12);
  });
});
