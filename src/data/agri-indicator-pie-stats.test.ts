const outStat = jest.fn();
const outStatNullable = jest.fn();
const pieStats = jest.fn();

jest.mock("./agri-stats-store", () => ({
  getOutStatisticCached: (opts: Record<string, unknown>): Promise<number> => outStat(opts),
  getOutStatisticCachedNullable: (opts: Record<string, unknown>): Promise<number | null> =>
    outStatNullable(opts),
  getPieCategoryStatsCached: (opts: Record<string, unknown>): Promise<unknown> => pieStats(opts),
}));

import {
  queryIndicatorOutStat,
  queryIndicatorOutStatNullable,
  queryIndicatorSumMaydon,
} from "./agri-indicator-stats";
import { queryPieAggregateRows } from "./agri-pie-stats";

const layer = { objectIdField: "FID" } as unknown as __esri.FeatureLayer;

beforeEach(() => {
  outStat.mockReset();
  outStatNullable.mockReset();
  pieStats.mockReset();
});

describe("indicator stats", () => {
  test("queryIndicatorOutStat defaults where and output field name", async () => {
    outStat.mockResolvedValue(7);
    await expect(
      queryIndicatorOutStat({ layer, where: "", statisticType: "count", onStatisticField: "id" }),
    ).resolves.toBe(7);
    expect(outStat).toHaveBeenCalledWith({
      layer,
      where: "1=1",
      statisticType: "count",
      onStatisticField: "id",
      outStatisticFieldName: "agg",
    });
  });

  test("queryIndicatorOutStatNullable preserves null and custom out name", async () => {
    outStatNullable.mockResolvedValue(null);
    await expect(
      queryIndicatorOutStatNullable({
        layer,
        where: "a=1",
        statisticType: "avg",
        onStatisticField: "hosil",
        outStatisticFieldName: "x",
      }),
    ).resolves.toBeNull();
    expect(outStatNullable).toHaveBeenCalledWith(
      expect.objectContaining({ where: "a=1", outStatisticFieldName: "x" }),
    );
  });

  test("queryIndicatorSumMaydon rounds and maps non-finite to 0", async () => {
    outStat.mockResolvedValueOnce(10.6).mockResolvedValueOnce(NaN);
    await expect(queryIndicatorSumMaydon({ layer, where: "" })).resolves.toBe(11);
    await expect(queryIndicatorSumMaydon({ layer, where: "" })).resolves.toBe(0);
    expect(outStat).toHaveBeenCalledWith(
      expect.objectContaining({ statisticType: "sum", onStatisticField: "maydon" }),
    );
  });
});

describe("queryPieAggregateRows", () => {
  test("totals row values and defaults objectIdField from the layer", async () => {
    pieStats.mockResolvedValue([
      { key: "a", value: 2 },
      { key: "b", value: 3.5 },
      { key: "c", value: 0 },
    ]);
    const result = await queryPieAggregateRows({ layer, where: "", categoryField: "crop_id" });
    expect(result.totalValue).toBe(5.5);
    expect(result.rows).toHaveLength(3);
    expect(pieStats).toHaveBeenCalledWith(
      expect.objectContaining({ where: "1=1", objectIdField: "FID", categoryField: "crop_id" }),
    );
  });

  test("falls back to OBJECTID when neither option nor layer provide one", async () => {
    pieStats.mockResolvedValue([]);
    const bare = {} as unknown as __esri.FeatureLayer;
    const result = await queryPieAggregateRows({ layer: bare, where: "x", categoryField: "c" });
    expect(result).toEqual({ rows: [], totalValue: 0 });
    expect(pieStats).toHaveBeenCalledWith(expect.objectContaining({ objectIdField: "OBJECTID" }));
  });
});
