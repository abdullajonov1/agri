import {
  compareGroupKeys,
  firstValuePerGroup,
  labelGroupRows,
  mapRowsToEnumCategories,
  resolveDisplayGroupValue,
  sumGroupValues,
  toGroupKey,
} from "./indicator-group-rows";

describe("indicator-group-rows", () => {
  test("toGroupKey keeps primitives, null stays null, objects stringify", () => {
    expect(toGroupKey(null)).toBeNull();
    expect(toGroupKey(undefined)).toBeNull();
    expect(toGroupKey(3)).toBe(3);
    expect(toGroupKey("a")).toBe("a");
    expect(toGroupKey(true)).toBe("true");
  });

  test("compareGroupKeys puts null first and sorts numerically", () => {
    const keys = ["10", null, "2", 1];
    expect([...keys].sort(compareGroupKeys)).toEqual([null, 1, "2", "10"]);
    expect(compareGroupKeys(null, null)).toBe(0);
    expect(compareGroupKeys("a", null)).toBe(1);
  });

  test("labelGroupRows sorts without mutating input and labels null bucket", () => {
    const rows = [
      { key: "b", value: 2 },
      { key: null, value: 5 },
    ];
    const out = labelGroupRows(rows, "No value");
    expect(out).toEqual([
      { key: null, label: "No value", value: 5 },
      { key: "b", label: "b", value: 2 },
    ]);
    expect(rows[0].key).toBe("b");
  });

  test("mapRowsToEnumCategories sums matching keys in config order", () => {
    const out = mapRowsToEnumCategories(
      [
        { key: 1, value: 2 },
        { key: "1", value: 3 },
        { key: null, value: 7 },
      ],
      [
        { label: "Missing", value: null },
        { label: "One", value: 1 },
        { label: "Two", value: "2" },
      ],
    );
    expect(out).toEqual([
      { key: null, label: "Missing", value: 7 },
      { key: 1, label: "One", value: 5 },
      { key: "2", label: "Two", value: 0 },
    ]);
  });

  test("sumGroupValues skips NaN", () => {
    expect(
      sumGroupValues([
        { key: "a", value: 1 },
        { key: "b", value: NaN },
        { key: "c", value: 2.5 },
      ]),
    ).toBe(3.5);
  });

  test("resolveDisplayGroupValue returns total, matched bucket or 0", () => {
    const rows = [
      { key: null, value: 4 },
      { key: 2, value: 9 },
    ];
    expect(resolveDisplayGroupValue(rows, undefined, 13)).toBe(13);
    expect(resolveDisplayGroupValue(rows, null, 13)).toBe(4);
    expect(resolveDisplayGroupValue(rows, "2", 13)).toBe(9);
    expect(resolveDisplayGroupValue(rows, "x", 13)).toBe(0);
  });

  test("firstValuePerGroup keeps first per key and zeroes non-finite", () => {
    const out = firstValuePerGroup(
      [
        { g: "a", v: 1 },
        null,
        { g: "a", v: 99 },
        { g: "b", v: "oops" },
        undefined,
        { g: null, v: "3" },
      ],
      "g",
      "v",
    );
    expect(out).toEqual([
      { key: "a", value: 1 },
      { key: "b", value: 0 },
      { key: null, value: 3 },
    ]);
  });
});
