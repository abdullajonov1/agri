import {
  colorizeIndexValue,
  mapStretch01ToIndexRange,
  parseExportImageIndexHeaders,
  sampleIndexFromRgba,
} from "./index-color";

describe("parseExportImageIndexHeaders", () => {
  test("parses numeric headers and nulls missing / blank / NaN", () => {
    const headers = new Headers({
      "X-Index-Min": " -0.2 ",
      "X-Index-Max": "0.85",
      "X-Index-Mean": "abc",
    });
    expect(parseExportImageIndexHeaders(headers)).toEqual({
      indexMin: -0.2,
      indexMax: 0.85,
      indexMean: null,
    });
    expect(parseExportImageIndexHeaders(new Headers())).toEqual({
      indexMin: null,
      indexMax: null,
      indexMean: null,
    });
  });
});

describe("mapStretch01ToIndexRange", () => {
  test("maps 0..1 onto the header range and clamps", () => {
    expect(mapStretch01ToIndexRange(0.5, -1, 1)).toBeCloseTo(0);
    expect(mapStretch01ToIndexRange(2, 0, 10)).toBe(10);
    expect(mapStretch01ToIndexRange(-1, 0, 10)).toBe(0);
  });

  test("returns input unchanged without a valid range", () => {
    expect(mapStretch01ToIndexRange(0.3, null, 1)).toBe(0.3);
    expect(mapStretch01ToIndexRange(0.3, 1, 1)).toBe(0.3);
    expect(mapStretch01ToIndexRange(0.3, 2, 1)).toBe(0.3);
    expect(mapStretch01ToIndexRange(0.3, Number.NaN, 1)).toBe(0.3);
    expect(Number.isNaN(mapStretch01ToIndexRange(Number.NaN, 0, 1))).toBe(true);
  });
});

describe("colorizeIndexValue", () => {
  test("writes transparent black for non-finite values", () => {
    const out = new Uint8ClampedArray([9, 9, 9, 9]);
    colorizeIndexValue(Number.NaN, out, 0);
    expect(Array.from(out)).toEqual([0, 0, 0, 0]);
  });

  test("endpoints match the first and last colour stops and clamp", () => {
    const out = new Uint8ClampedArray(8);
    colorizeIndexValue(-5, out, 0);
    colorizeIndexValue(5, out, 4);
    expect(Array.from(out)).toEqual([165, 0, 38, 255, 0, 104, 55, 255]);
  });

  test("interpolates between stops", () => {
    const out = new Uint8ClampedArray(4);
    colorizeIndexValue(0.075, out, 0); // halfway 0.0 -> 0.15
    expect(Array.from(out)).toEqual([190, 24, 39, 255]);
  });
});

describe("sampleIndexFromRgba", () => {
  test("returns null for transparent or black pixels", () => {
    expect(sampleIndexFromRgba(100, 100, 100, 0)).toBeNull();
    expect(sampleIndexFromRgba(1, 2, 3)).toBeNull();
  });

  test("round-trips colorize -> sample approximately", () => {
    for (const v of [0, 0.22, 0.5, 0.7, 0.9, 1]) {
      const out = new Uint8ClampedArray(4);
      colorizeIndexValue(v, out, 0);
      const back = sampleIndexFromRgba(out[0], out[1], out[2], out[3]);
      expect(back).not.toBeNull();
      expect(back as number).toBeCloseTo(v, 1);
    }
  });
});
