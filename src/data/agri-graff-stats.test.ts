jest.mock("./agri-stats-store", () => ({
  getGraffRegionalTimeseriesCached: jest.fn(),
}));
jest.mock("../filter/localization/geo-keys", () => ({
  makeRegionDistrictKey: (value: string): string => value,
}));
jest.mock("../filter/localization/vh-constants", () => ({
  VH_TO_NDVI_STATUS: { yaxshi: "good" } as Record<string, string>,
}));
jest.mock("../shared/agri-crop-labels", () => ({
  getTuriCropLookupKey: (value: string): string => value,
}));

import {
  buildGraffRegionalScopeKey,
  mergeRegionalTimeseriesGroups,
  type GraffRegionalTimeseriesRow,
} from "./agri-graff-stats";

const row = (
  overrides: Partial<GraffRegionalTimeseriesRow>,
): GraffRegionalTimeseriesRow =>
  ({
    date: "2025-05-01",
    ndvi: 0,
    ndvi_min: 0,
    ndvi_max: 0,
    savi: 0,
    savi_min: 0,
    savi_max: 0,
    rvi: 0,
    rvi_min: 0,
    rvi_max: 0,
    ci: 0,
    ci_min: 0,
    ci_max: 0,
    evi: 0,
    ndwi: 0,
    ndwi_min: 0,
    ndwi_max: 0,
    polygon_count: 1,
    ...overrides,
  }) as GraffRegionalTimeseriesRow;

describe("mergeRegionalTimeseriesGroups", () => {
  test("weights averages by polygon count and widens min/max", () => {
    const merged = mergeRegionalTimeseriesGroups([
      [row({ ndvi: 0.2, ndvi_min: 0.1, ndvi_max: 0.3, polygon_count: 1 })],
      [row({ ndvi: 0.5, ndvi_min: 0.05, ndvi_max: 0.6, polygon_count: 3 })],
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].ndvi).toBeCloseTo((0.2 * 1 + 0.5 * 3) / 4);
    expect(merged[0].ndvi_min).toBeCloseTo(0.05);
    expect(merged[0].ndvi_max).toBeCloseTo(0.6);
    expect(merged[0].polygon_count).toBe(4);
  });

  test("treats a zero polygon count as weight 1", () => {
    const merged = mergeRegionalTimeseriesGroups([
      [row({ savi: 0.4, polygon_count: 0 })],
      [row({ savi: 0.2, polygon_count: 0 })],
    ]);
    expect(merged[0].savi).toBeCloseTo(0.3);
    expect(merged[0].polygon_count).toBe(0);
  });

  test("keeps separate dates apart and normalises epoch dates", () => {
    const epochMs = Date.UTC(2025, 4, 2);
    const merged = mergeRegionalTimeseriesGroups([
      [row({ date: "2025-05-01" })],
      [row({ date: String(epochMs) })],
      [row({ date: String(epochMs / 1000) })],
    ]);
    expect(merged.map((r) => r.date).sort()).toEqual([
      "2025-05-01",
      "2025-05-02",
    ]);
  });

  test("skips rows whose date cannot be parsed", () => {
    expect(mergeRegionalTimeseriesGroups([[row({ date: "nope" })]])).toEqual(
      [],
    );
  });

  test("an index with no finite values becomes null; empty ranges become 0", () => {
    const merged = mergeRegionalTimeseriesGroups([
      [
        row({
          ci: null as unknown as number,
          ci_min: null as unknown as number,
          ci_max: Number.NaN,
        }),
      ],
    ]);
    expect(merged[0].ci).toBeNull();
    expect(merged[0].ci_min).toBe(0);
    expect(merged[0].ci_max).toBe(0);
  });

  test("carries non-index columns from the first row", () => {
    const merged = mergeRegionalTimeseriesGroups([
      [row({ crop: "paxta" })],
      [row({ crop: "bug'doy" })],
    ]);
    expect(merged[0].crop).toBe("paxta");
    expect(merged[0]).not.toHaveProperty("__fieldWeights");
  });

  test("does not mutate its input rows", () => {
    const input = row({ ndvi: 0.5 });
    const snapshot = { ...input };
    mergeRegionalTimeseriesGroups([[input], [row({ ndvi: 0.1 })]]);
    expect(input).toEqual(snapshot);
  });
});

describe("buildGraffRegionalScopeKey", () => {
  test("is order-independent for crop ids", () => {
    const a = buildGraffRegionalScopeKey({
      region: 1,
      district: null,
      cropIds: ["2", "1"],
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    const b = buildGraffRegionalScopeKey({
      region: 1,
      district: null,
      cropIds: ["1", "2"],
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    expect(a).toBe(b);
  });

  test("maps the VH status into the key", () => {
    const key = JSON.parse(
      buildGraffRegionalScopeKey({
        region: null,
        district: null,
        cropIds: [],
        startDate: "",
        endDate: "",
        vh: "yaxshi",
      }),
    );
    expect(key.vh).toBe("yaxshi");
    expect(key.ndviStatus).toBe("good");
    expect(key.startDate).toBeNull();
  });
});
