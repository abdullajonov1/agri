import { adjustHexColor, CROP_COLOR_MAP, FALLBACK_COLORS } from "./pie-colors";

describe("adjustHexColor", () => {
  test("lightens and darkens with clamping", () => {
    expect(adjustHexColor("#101010", 16)).toBe("#202020");
    expect(adjustHexColor("#fff", 10)).toBe("#ffffff");
    expect(adjustHexColor("#000000", -10)).toBe("#000000");
  });
  test("returns input for invalid hex", () => {
    expect(adjustHexColor("#", 5)).toBe("#");
    expect(adjustHexColor("#12345", 5)).toBe("#12345");
  });
  test("palette sanity", () => {
    expect(CROP_COLOR_MAP.paxta).toMatch(/^#/);
    expect(FALLBACK_COLORS.length).toBeGreaterThan(5);
  });
});
