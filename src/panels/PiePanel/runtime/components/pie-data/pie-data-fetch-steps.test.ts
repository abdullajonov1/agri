import { buildPieWhereParts, mergeCategoryRows } from "./pie-data-fetch-steps";

describe("buildPieWhereParts", () => {
  it("returns 1=1 when no where and no chunks", () => {
    expect(buildPieWhereParts("", null)).toEqual(["1=1"]);
  });
  it("returns base where when chunks are empty", () => {
    expect(buildPieWhereParts("a=1", [])).toEqual(["a=1"]);
  });
  it("uses chunks alone when where is 1=1", () => {
    expect(buildPieWhereParts("1=1", ["x IN (1)", "x IN (2)"])).toEqual(["x IN (1)", "x IN (2)"]);
  });
  it("ANDs base where with each chunk", () => {
    expect(buildPieWhereParts("a=1", ["c1"])).toEqual(["(a=1) AND (c1)"]);
  });
});

describe("mergeCategoryRows", () => {
  it("sums values per key without mutating the input", () => {
    const base = new Map([["1", { key: "1", value: 5 }]]);
    const next = mergeCategoryRows(base, [
      { key: " 1 ", value: 2 },
      { key: "2", value: "3" },
    ]);
    expect(next.get("1")?.value).toBe(7);
    expect(next.get("2")?.value).toBe(3);
    expect(base.get("1")?.value).toBe(5);
  });
  it("skips empty keys and treats bad values as 0", () => {
    const next = mergeCategoryRows(new Map(), [{ key: "", value: 1 }, { key: null, value: 1 }, { key: "9", value: undefined }]);
    expect(Array.from(next.values())).toEqual([{ key: "9", value: 0 }]);
  });
});
