import {
  applyRegionRowPercentages,
  buildPieCategoriesFromMergedRows,
  buildPieCategoriesFromPackRows,
  canConsumeGraffDashboardPack,
  canConsumeGraffPolygonDashboardPack,
  canConsumeIndicatorDashboardPack,
  formatIndicatorStatValue,
  mapRegionPackRows,
  resolveRegionAggregateView,
  syncPieSelectionAgainstCategories,
} from "./agri-dashboard-pack-apply";

describe("resolveRegionAggregateView", () => {
  test("no viloyat -> republic view by region code", () => {
    expect(resolveRegionAggregateView({})).toEqual({
      effectiveViloyat: "",
      effectiveView: "viloyat",
      groupField: "viloyat",
      codeField: "region",
    });
  });

  test("locked > drilldown > filter precedence, switching to tuman view", () => {
    expect(
      resolveRegionAggregateView({
        lockedViloyat: "L",
        selectedViloyatForDrillDown: "D",
        filterViloyat: "F",
      }).effectiveViloyat,
    ).toBe("L");
    expect(
      resolveRegionAggregateView({ selectedViloyatForDrillDown: "D", filterViloyat: "F" })
        .effectiveViloyat,
    ).toBe("D");
    expect(resolveRegionAggregateView({ filterViloyat: "F" })).toEqual({
      effectiveViloyat: "F",
      effectiveView: "tuman",
      groupField: "tuman",
      codeField: "district",
    });
  });
});

describe("region rows", () => {
  test("mapRegionPackRows copies name/maydon/percentage only", () => {
    const rows = mapRegionPackRows({
      view: "viloyat",
      groupField: "viloyat",
      where: "",
      totalArea: 3,
      rows: [{ name: "A", maydon: 3, percentage: 100 }],
    });
    expect(rows).toEqual([{ name: "A", maydon: 3, percentage: 100 }]);
  });

  test("pack total keeps existing percentages and fills missing ones", () => {
    const { totalArea, withPct } = applyRegionRowPercentages(
      [
        { name: "A", maydon: 25, percentage: 40 },
        { name: "B", maydon: 50 },
      ],
      200,
    );
    expect(totalArea).toBe(200);
    expect(withPct.map((r) => r.percentage)).toEqual([40, 25]);
  });

  test("pack total of 0 yields 0% without dividing by zero", () => {
    const { withPct } = applyRegionRowPercentages([{ name: "A", maydon: 5 }], 0);
    expect(withPct[0].percentage).toBe(0);
  });

  test("non-finite pack total falls back to summed rows", () => {
    const { totalArea } = applyRegionRowPercentages(
      [
        { name: "A", maydon: 1 },
        { name: "B", maydon: 3 },
      ],
      NaN,
    );
    expect(totalArea).toBe(4);
  });

  test("query fallback (null total) recomputes all percentages", () => {
    const { totalArea, withPct } = applyRegionRowPercentages(
      [
        { name: "A", maydon: 1, percentage: 99 },
        { name: "B", maydon: 3 },
      ],
      null,
    );
    expect(totalArea).toBe(4);
    expect(withPct.map((r) => r.percentage)).toEqual([25, 75]);
    expect(applyRegionRowPercentages([], null)).toEqual({ totalArea: 0, withPct: [] });
  });
});

describe("pie categories", () => {
  test("pack rows merge duplicates, drop empty/non-positive, sort desc", () => {
    const { categories, totalValue } = buildPieCategoriesFromPackRows([
      { key: " 1 ", value: 2 },
      { key: "1", value: 3 },
      { key: "2", value: 15 },
      { key: "", value: 10 },
      { key: "3", value: 0 },
      { key: "4", value: -1 },
    ]);
    expect(totalValue).toBe(20);
    expect(categories).toEqual([
      { key: "2", value: 15, percentage: 75 },
      { key: "1", value: 5, percentage: 25 },
    ]);
  });

  test("empty pack rows -> empty result", () => {
    expect(buildPieCategoriesFromPackRows([])).toEqual({ categories: [], totalValue: 0 });
  });

  test("merged rows keep zeros and sort desc", () => {
    const { categories, totalValue } = buildPieCategoriesFromMergedRows([
      { key: "a", value: 0 },
      { key: "b", value: 4 },
    ]);
    expect(totalValue).toBe(4);
    expect(categories).toEqual([
      { key: "b", value: 4, percentage: 100 },
      { key: "a", value: 0, percentage: 0 },
    ]);
  });

  test("merged rows all zero -> 0%", () => {
    expect(buildPieCategoriesFromMergedRows([{ key: "a", value: 0 }]).categories[0].percentage).toBe(0);
  });
});

describe("syncPieSelectionAgainstCategories", () => {
  const norm = (v: string): string => v.toLowerCase().trim();
  const cats = [{ key: "Paxta" }, { key: "Bugdoy" }];

  test("keeps valid selections and finds active slice", () => {
    expect(syncPieSelectionAgainstCategories(["bugdoy"], cats, norm)).toEqual({
      validSelectedCategories: ["bugdoy"],
      activeSlice: 1,
      singleSelection: "bugdoy",
    });
  });

  test("drops missing selections; multi-select has no singleSelection", () => {
    expect(syncPieSelectionAgainstCategories(["x", "paxta", "BUGDOY"], cats, norm)).toEqual({
      validSelectedCategories: ["paxta", "BUGDOY"],
      activeSlice: 0,
      singleSelection: "",
    });
  });

  test("nothing valid -> null active slice", () => {
    expect(syncPieSelectionAgainstCategories(["x"], cats, norm)).toEqual({
      validSelectedCategories: [],
      activeSlice: null,
      singleSelection: "",
    });
  });
});

describe("formatIndicatorStatValue", () => {
  test.each([
    [10.456, 2, 10.46],
    [10.5, 0, 11],
    [10.4, null, 10],
    [10.4, undefined, 10],
    [1.23456, 3, 1.235],
  ])("%p @ %p dp -> %p", (v, dp, out) => {
    expect(formatIndicatorStatValue(v, dp)).toBe(out);
  });
});

describe("pack consumption gates", () => {
  test("indicator: only sum(maydon) without VH/uniqueid", () => {
    expect(canConsumeIndicatorDashboardPack({ op: "sum", field: " Maydon " })).toBe(true);
    expect(canConsumeIndicatorDashboardPack({ op: "avg", field: "maydon" })).toBe(false);
    expect(canConsumeIndicatorDashboardPack({ op: "sum", field: "hosil" })).toBe(false);
    expect(
      canConsumeIndicatorDashboardPack({ op: "sum", field: "maydon", selectedVegetationStatus: "x" }),
    ).toBe(false);
    expect(
      canConsumeIndicatorDashboardPack({ op: "sum", field: "maydon", selectedUniqueid: "u" }),
    ).toBe(false);
    expect(
      canConsumeIndicatorDashboardPack({
        op: "sum",
        field: "maydon",
        selectedVegetationStatus: "  ",
        selectedUniqueid: null,
      }),
    ).toBe(true);
  });

  test("graff regional: blocked by polygon uniqueid or augment, VH allowed", () => {
    expect(canConsumeGraffDashboardPack({ hasVh: true })).toBe(true);
    expect(canConsumeGraffDashboardPack({ hasVh: false, selectedUniqueid: "u" })).toBe(false);
    expect(canConsumeGraffDashboardPack({ hasVh: false, canAugmentExisting: true })).toBe(false);
  });

  test("graff polygon: requires uniqueid", () => {
    expect(canConsumeGraffPolygonDashboardPack({ uniqueid: "u" })).toBe(true);
    expect(canConsumeGraffPolygonDashboardPack({ uniqueid: "  " })).toBe(false);
    expect(canConsumeGraffPolygonDashboardPack({})).toBe(false);
  });
});
