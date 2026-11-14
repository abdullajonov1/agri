jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.resolve([jest.fn()]),
}));
jest.mock("../../shared/agri-access-config", () => ({
  getAccessWhere: (): string => "1=1",
  combineAccessWhereIfFieldsExist: (where: string): string => where,
}));

import { buildCropClause, buildVegetationScopeClauses, buildVegetationStatusWhere } from "./veg-sql";
import { buildSummaryWhere } from "./veg-summary-series";
import { buildStatusCountsWhere as buildStepsWhere } from "./status/status-counts-steps";
import { normalizeCropIds } from "./status/status-vh-window";

const CASES: Array<{ name: string; ids: string[]; expected: string | null }> = [
  { name: "no ids", ids: [], expected: null },
  { name: "blank ids only", ids: ["", "  "], expected: null },
  { name: "single id", ids: ["7"], expected: "crop_id='7'" },
  { name: "duplicates and padding collapse", ids: [" 7", "7 ", "7"], expected: "crop_id='7'" },
  { name: "several ids keep order", ids: ["9", "3", "9"], expected: "crop_id IN ('9','3')" },
  { name: "quotes are escaped", ids: ["a'b"], expected: "crop_id='a''b'" },
];

describe("buildCropClause", () => {
  it.each(CASES)("$name", ({ ids, expected }) => {
    expect(buildCropClause(ids)).toBe(expected);
  });

  it("ignores null and undefined entries", () => {
    expect(buildCropClause([undefined, "5", null])).toBe("crop_id='5'");
  });

  it("uses the given field name", () => {
    expect(buildCropClause(["1", "2"], "cid")).toBe("cid IN ('1','2')");
  });
});

describe("call sites keep their byte-identical SQL", () => {
  const params = { cropIds: ["9", "3", "9"], cropId: "4" };
  const IN_CLAUSE = "crop_id IN ('9','3','4')";

  it("veg-sql scope clauses", () => {
    expect(buildVegetationScopeClauses(params)).toEqual([IN_CLAUSE]);
    expect(buildVegetationScopeClauses({ cropId: "4" })).toEqual(["crop_id='4'"]);
  });

  it("veg-sql status where", () => {
    const base = buildVegetationStatusWhere({ date: "2025-04-01" });
    expect(buildVegetationStatusWhere({ date: "2025-04-01", ...params })).toBe(`${base} AND ${IN_CLAUSE}`);
  });

  it("status-counts-steps where", () => {
    const base = buildStepsWhere({ date: "2025-04-01" });
    expect(buildStepsWhere({ date: "2025-04-01", ...params })).toBe(`${base} AND ${IN_CLAUSE}`);
  });

  it("summary where", () => {
    const base = { startDate: "2025-04-01", endDate: "2025-04-30" };
    const where = buildSummaryWhere({ ...base, ...params });
    expect(where).toBe(
      `${IN_CLAUSE} AND raster_date >= DATE '2025-04-01' AND raster_date <= DATE '2025-04-30' AND valid_fields > 0`,
    );
    expect(buildSummaryWhere({ ...base, cropId: "4" })).toContain("crop_id='4'");
  });

  it("status-vh-window normalizes sorted", () => {
    expect(normalizeCropIds({ date: "2025-04-01", ...params })).toEqual(["3", "4", "9"]);
    expect(buildCropClause(normalizeCropIds({ date: "2025-04-01", ...params }))).toBe("crop_id IN ('3','4','9')");
  });
});
