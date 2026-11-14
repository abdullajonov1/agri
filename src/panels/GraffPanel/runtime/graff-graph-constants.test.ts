import {
  GRAFF_INDEX_BUTTONS,
  GRAFF_INDEX_ORDER,
  REPUBLIC_TIMESERIES_INDEX_FIELDS,
} from "./graff-graph-constants";

describe("graff index constants", () => {
  test("ndre is hidden from the chart buttons and order", () => {
    expect(GRAFF_INDEX_ORDER).toEqual(["ndvi", "savi", "rvi", "ci", "evi", "ndwi"]);
    expect(GRAFF_INDEX_BUTTONS.some((b) => b.key === "ndre")).toBe(false);
  });

  test("ndre stays in the republic timeseries field allow-list", () => {
    expect(REPUBLIC_TIMESERIES_INDEX_FIELDS).toContain("ndre");
  });
});
