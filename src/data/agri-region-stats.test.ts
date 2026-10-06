jest.mock("./agri-stats-store", () => ({
  getRegionGroupFeaturesCached: jest.fn(),
}));
jest.mock("../filter/localization/geo-keys", () => ({
  makeRegionDistrictKey: (value: string): string =>
    value.toLowerCase().replace(/\s+tumani$/, ""),
}));

import { getRegionGroupFeaturesCached } from "./agri-stats-store";
import {
  accumulateRegionGroupFeaturesByCode,
  attachRegionPercentages,
  queryRegionAggregateRows,
  regionAccumulatorToSortedRows,
  regionOutStatName,
  regionSumByNameToSortedRows,
} from "./agri-region-stats";

const feature = (attributes: Record<string, unknown>) => ({ attributes });

describe("agri-region-stats", () => {
  test("regionOutStatName maps the stat mode", () => {
    expect(regionOutStatName("sum")).toBe("sum_m");
    expect(regionOutStatName("count")).toBe("cnt_m");
  });

  test("regionSumByNameToSortedRows sorts by area descending", () => {
    expect(regionSumByNameToSortedRows({ a: 1, b: 3, c: 2 })).toEqual([
      { name: "b", maydon: 3 },
      { name: "c", maydon: 2 },
      { name: "a", maydon: 1 },
    ]);
  });

  test("groups spelling variants of one code onto a single bar", () => {
    const acc = accumulateRegionGroupFeaturesByCode(
      [
        feature({ tuman: "Farg'ona", district: 1730, sum_m: 10 }),
        feature({ tuman: "Fargona", district: 1730, sum_m: 30 }),
        feature({ tuman: "Asaka", district: 1703, sum_m: 5 }),
      ],
      { groupField: "tuman", codeField: "district", outName: "sum_m" },
    );
    expect(acc["code:1730"]).toEqual({
      display: "Fargona",
      displayValue: 30,
      value: 40,
    });
    expect(regionAccumulatorToSortedRows(acc)).toEqual([
      { name: "Fargona", maydon: 40 },
      { name: "Asaka", maydon: 5 },
    ]);
  });

  test("reads attributes case-insensitively and keys by name without a code", () => {
    const acc = accumulateRegionGroupFeaturesByCode(
      [
        feature({ Tuman: "Qamashi tumani", SUM_M: 4 }),
        feature({ tuman: "Qamashi", sum_m: 6 }),
      ],
      { groupField: "tuman", codeField: null, outName: "sum_m" },
    );
    expect(Object.keys(acc)).toEqual(["name:qamashi"]);
    expect(acc["name:qamashi"].value).toBe(10);
  });

  test("skips rows without a name or a positive value", () => {
    const acc = accumulateRegionGroupFeaturesByCode(
      [
        feature({ tuman: "", sum_m: 5 }),
        feature({ tuman: "A", sum_m: 0 }),
        null,
        { attributes: null },
      ],
      { groupField: "tuman", outName: "sum_m" },
    );
    expect(acc).toEqual({});
  });

  test("attachRegionPercentages computes shares and handles zero totals", () => {
    const { rows, totalArea } = attachRegionPercentages([
      { name: "a", maydon: 30 },
      { name: "b", maydon: 10 },
    ]);
    expect(totalArea).toBe(40);
    expect(rows.map((r) => r.percentage)).toEqual([75, 25]);
    expect(attachRegionPercentages([{ name: "z", maydon: 0 }]).rows[0].percentage).toBe(0);
  });

  test("queryRegionAggregateRows loads the layer then aggregates", async () => {
    const load = jest.fn(async () => undefined);
    (getRegionGroupFeaturesCached as jest.Mock).mockResolvedValue([
      feature({ viloyat: "Andijon", region: 17, sum_m: 3 }),
      feature({ viloyat: "Buxoro", region: 6, sum_m: 1 }),
    ]);
    const layer = { loaded: false, load } as unknown as __esri.FeatureLayer;
    const result = await queryRegionAggregateRows({
      layer,
      where: "1=1",
      groupField: "viloyat",
      codeField: "region",
      areaField: "maydon",
    });
    expect(load).toHaveBeenCalled();
    expect(getRegionGroupFeaturesCached).toHaveBeenCalledWith(
      expect.objectContaining({ statMode: "sum", groupField: "viloyat" }),
    );
    expect(result.totalArea).toBe(4);
    expect(result.rows[0]).toEqual({ name: "Andijon", maydon: 3, percentage: 75 });
  });

  test("queryRegionAggregateRows tolerates a failing layer load and counts without an area field", async () => {
    (getRegionGroupFeaturesCached as jest.Mock).mockResolvedValue([]);
    const layer = {
      loaded: false,
      load: jest.fn(async () => {
        throw new Error("offline");
      }),
    } as unknown as __esri.FeatureLayer;
    const result = await queryRegionAggregateRows({
      layer,
      where: "1=1",
      groupField: "viloyat",
    });
    expect(getRegionGroupFeaturesCached).toHaveBeenLastCalledWith(
      expect.objectContaining({ statMode: "count" }),
    );
    expect(result).toEqual({ rows: [], totalArea: 0 });
  });
});
