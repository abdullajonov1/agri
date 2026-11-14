jest.mock("jimu-core", () => ({ React: {} }));
jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn() }));

import {
  getDesiredRepublicFields,
  getUnresolvedScopeMessage,
  getUnresolvedCropMessage,
  pickRegionalFetchedFields,
  summarizeRegionalResponse,
  sortRowsByDate,
} from "./regional-timeseries-steps";

describe("regional-timeseries-steps pure helpers", () => {
  test("getDesiredRepublicFields defaults to ndvi when nothing valid is selected", () => {
    expect(getDesiredRepublicFields(undefined)).toEqual(["ndvi"]);
    expect(getDesiredRepublicFields(["bogus"])).toEqual(["ndvi"]);
  });

  test("getDesiredRepublicFields lowercases and dedupes valid fields", () => {
    expect(getDesiredRepublicFields(["NDVI", "ndvi"])).toEqual(["ndvi"]);
  });

  test("getUnresolvedScopeMessage localises per language and scope", () => {
    expect(getUnresolvedScopeMessage("en", "region")).toBe("Could not determine the selected region code.");
    expect(getUnresolvedScopeMessage("en", "district")).toBe("Could not determine the selected district code.");
    expect(getUnresolvedScopeMessage("uz_lat", "region")).toBe("Tanlangan viloyat kodi aniqlanmadi.");
    expect(getUnresolvedScopeMessage("ru", "district")).toContain("района");
    expect(getUnresolvedScopeMessage("uz_cyr", "region")).toContain("вилоят");
  });

  test("getUnresolvedCropMessage localises per language", () => {
    expect(getUnresolvedCropMessage("en")).toBe("Could not determine the selected crop code.");
    expect(getUnresolvedCropMessage("uz_lat")).toBe("Tanlangan ekin kodi aniqlanmadi.");
    expect(getUnresolvedCropMessage("ru")).toContain("культуры");
    expect(getUnresolvedCropMessage("uz_cyr")).toContain("экин");
  });

  test("pickRegionalFetchedFields follows pack, republic and avg rules", () => {
    expect(pickRegionalFetchedFields(true, true, undefined)).toEqual(["ndvi"]);
    expect(pickRegionalFetchedFields(true, false, undefined).length).toBeGreaterThan(1);
    expect(pickRegionalFetchedFields(false, true, ["savi"])).toEqual(["savi"]);
    expect(pickRegionalFetchedFields(false, false, []).length).toBeGreaterThan(1);
  });

  test("sortRowsByDate sorts ascending without mutating input", () => {
    const input = [{ date: "2024-03-01" }, { date: "2024-01-01" }] as never[];
    const out = sortRowsByDate(input);
    expect((out[0] as { date: string }).date).toBe("2024-01-01");
    expect((input[0] as { date: string }).date).toBe("2024-03-01");
  });

  test("summarizeRegionalResponse computes ranges over valid ndvi rows", () => {
    const rows = [
      { date: "a", ndvi: 0.2, polygon_count: 3 },
      { date: "b", ndvi: 0.6, polygon_count: 7 },
      { date: "c", ndvi: "n/a", polygon_count: 1 },
    ] as never[];
    const s = summarizeRegionalResponse(rows);
    expect(s.rawRowCount).toBe(3);
    expect(s.validNdviRowCount).toBe(2);
    expect(s.ndviRange).toEqual({ min: 0.2, max: 0.6 });
    expect(s.polygonCountRange).toEqual({ min: 3, max: 7 });
  });

  test("summarizeRegionalResponse returns null ranges when no valid rows", () => {
    const s = summarizeRegionalResponse([]);
    expect(s.ndviRange).toBeNull();
    expect(s.polygonCountRange).toBeNull();
  });
});
