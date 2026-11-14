jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));
jest.mock("../../../../gis/agri-polygon-api-source", () => ({
  fetchPolygonAvailableDates: jest.fn(),
  resolveExportImageWithDateWalk: jest.fn(),
  getExportImageSeasonMonths: (): number[] => [],
}));
jest.mock("../../../../store/agri-dashboard-store", () => ({ patchDashboardPack: jest.fn() }));
jest.mock("../../../../data/agri-stats-store", () => ({ getGraffPolygonSeriesCached: jest.fn() }));

import { isRefineNoop, scopeRowsToAvailableDates, toVegetationIndexRows } from "./vegetation-data-steps";
import type { VegetationIndex } from "../graff-state";

const row = (raster_date: string): VegetationIndex => ({ raster_date, ndvi: 0.5 }) as VegetationIndex;

describe("scopeRowsToAvailableDates", () => {
  const resolve = (raw: unknown, dates: string[]): string | null =>
    dates.includes(String(raw)) ? String(raw) : null;

  test("keeps only rows that resolve onto an available date", () => {
    const out = scopeRowsToAvailableDates([row("2024-05-01"), row("2024-04-01")], ["2024-04-01"], resolve);
    expect(out.map((r) => r.raster_date)).toEqual(["2024-04-01"]);
  });

  test("rewrites the date to the resolved match without mutating input", () => {
    const input = [row("2024-04-02")];
    const out = scopeRowsToAvailableDates(input, ["2024-04-01"], () => "2024-04-01");
    expect(out[0].raster_date).toBe("2024-04-01");
    expect(input[0].raster_date).toBe("2024-04-02");
  });

  test("drops rows whose resolved date is not in the available set", () => {
    expect(scopeRowsToAvailableDates([row("2024-04-01")], ["2024-01-01"], () => "2024-04-01")).toEqual([]);
  });
});

describe("isRefineNoop", () => {
  const painted = { date: "d", index: "ndvi", fingerprint: "f" };

  test("true when fingerprint, date and index match", () => {
    expect(isRefineNoop({ fingerprint: "f", nextDate: "d", nextIndexKey: "ndvi" }, painted)).toBe(true);
  });

  test("false when any part differs", () => {
    expect(isRefineNoop({ fingerprint: "g", nextDate: "d", nextIndexKey: "ndvi" }, painted)).toBe(false);
    expect(isRefineNoop({ fingerprint: "f", nextDate: "x", nextIndexKey: "ndvi" }, painted)).toBe(false);
    expect(isRefineNoop({ fingerprint: "f", nextDate: "d", nextIndexKey: null }, painted)).toBe(false);
  });
});

describe("toVegetationIndexRows", () => {
  test("returns the same rows typed as chart rows", () => {
    const rows = [{ raster_date: "2024-05-01", ndvi: 0.4 }];
    expect(toVegetationIndexRows(rows)).toEqual(rows);
  });
});
