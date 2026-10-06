import {
  buildNextRegionalFilters,
  isPolygonOnlyEvent,
  isPolygonOutsideVhStatus,
  normalizeVhUniqueids,
  parseRegionDistrictCodes,
  readMasterFilterOrdering,
  vhUniqueidsSignature,
} from "./master-filter-parse";

const normalize = (s: string) => s.replace(/ʻ/g, "'").trim();

describe("readMasterFilterOrdering", () => {
  test("reads finite numbers and defaults to 0", () => {
    expect(readMasterFilterOrdering({ meta: { timestamp: 5, broadcastGeneration: 2 } })).toEqual({ eventTs: 5, eventGen: 2 });
    expect(readMasterFilterOrdering({ meta: { timestamp: "5", broadcastGeneration: Number.NaN } })).toEqual({ eventTs: 0, eventGen: 0 });
    expect(readMasterFilterOrdering({})).toEqual({ eventTs: 0, eventGen: 0 });
  });
});

describe("parseRegionDistrictCodes", () => {
  test("extracts quoted and unquoted codes", () => {
    expect(parseRegionDistrictCodes("region = '1733' AND district=12")).toEqual({ regionCode: 1733, districtCode: 12 });
    expect(parseRegionDistrictCodes("viloyat = 'x'")).toEqual({ regionCode: null, districtCode: null });
    expect(parseRegionDistrictCodes(undefined)).toEqual({ regionCode: null, districtCode: null });
  });
});

describe("buildNextRegionalFilters", () => {
  test("single turlar entry becomes uzspace and list is de-duplicated", () => {
    const next = buildNextRegionalFilters(
      { tuman: " Xiva ", yil: 2024, turlar: ["Bugʻdoy", "Bugʻdoy", ""], vh: "1" },
      "Xorazm",
      normalize,
    );
    expect(next).toEqual({
      viloyat: "Xorazm",
      tuman: "Xiva",
      yil: "2024",
      uzspace: "",
      turlar: ["Bug'doy"],
      vh: "1",
    });
    expect(buildNextRegionalFilters({ turlar: ["Paxta"] }, "", normalize).uzspace).toBe("Paxta");
  });

  test("falls back to turi when turlar is not an array", () => {
    const next = buildNextRegionalFilters({ turi: "Paxta" }, "", normalize);
    expect(next.uzspace).toBe("Paxta");
    expect(next.turlar).toEqual(["Paxta"]);
    expect(buildNextRegionalFilters({}, "", normalize)).toEqual({
      viloyat: "",
      tuman: "",
      yil: "",
      uzspace: "",
      turlar: [],
      vh: "",
    });
  });
});

describe("vh uniqueid helpers", () => {
  test("normalizeVhUniqueids trims and de-duplicates", () => {
    expect(normalizeVhUniqueids([" a ", "a", "", null, "b"])).toEqual(["a", "b"]);
    expect(normalizeVhUniqueids("a")).toBeNull();
  });

  test("signature distinguishes null, empty and contents", () => {
    expect(vhUniqueidsSignature(null)).toBe("null");
    expect(vhUniqueidsSignature([])).toBe("0::");
    expect(vhUniqueidsSignature(["a", "b", "c"])).toBe("3:a:c");
  });

  test("isPolygonOutsideVhStatus ignores braces and case", () => {
    expect(isPolygonOutsideVhStatus("{ABC}", "1", ["abc"])).toBe(false);
    expect(isPolygonOutsideVhStatus("{ABC}", "1", ["xyz"])).toBe(true);
    expect(isPolygonOutsideVhStatus("{ABC}", "", ["xyz"])).toBe(false);
    expect(isPolygonOutsideVhStatus("{ABC}", "1", null)).toBe(false);
    expect(isPolygonOutsideVhStatus("", "1", ["xyz"])).toBe(false);
  });
});

describe("isPolygonOnlyEvent", () => {
  test("focus, uniqueid or clearing an existing field", () => {
    expect(isPolygonOnlyEvent({ polygonMode: true }, false)).toBe(true);
    expect(isPolygonOnlyEvent({ uniqueid: " id " }, false)).toBe(true);
    expect(isPolygonOnlyEvent({ polygonMode: false, uniqueid: "" }, true)).toBe(true);
    expect(isPolygonOnlyEvent({ polygonMode: false }, false)).toBe(false);
    expect(isPolygonOnlyEvent({ uniqueid: 42 }, false)).toBe(false);
  });
});
