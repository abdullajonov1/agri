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

import {
  isRefineNoop,
  isVegetationIndexRow,
  scopeRowsToAvailableDates,
  toVegetationIndexRows,
} from "./vegetation-data-steps";
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

describe("isVegetationIndexRow", () => {
  test("accepts any object row, including epoch-number raster_date from ArcGIS", () => {
    expect(isVegetationIndexRow({ raster_date: "2024-05-01", ndvi: 0.4 })).toBe(true);
    expect(isVegetationIndexRow({ raster_date: 1714521600000, ndvi: 0.4 })).toBe(true);
    expect(isVegetationIndexRow({ ndvi: 0.4 })).toBe(true);
  });

  test("rejects non-objects and nullish values", () => {
    expect(isVegetationIndexRow(null)).toBe(false);
    expect(isVegetationIndexRow(undefined)).toBe(false);
    expect(isVegetationIndexRow("2024-05-01")).toBe(false);
  });
});

describe("toVegetationIndexRows", () => {
  test("returns the same rows typed as chart rows", () => {
    const rows = [{ raster_date: "2024-05-01", ndvi: 0.4 }];
    expect(toVegetationIndexRows(rows)).toEqual(rows);
  });

  test("keeps every object row (same identity and order), drops only non-objects", () => {
    const first = { raster_date: "2024-05-02", ndvi: 0.3 };
    const epoch = { raster_date: 1714521600000, ndvi: 0.5 };
    const second = { raster_date: "2024-04-01", ndvi: 0.6 };
    const out = toVegetationIndexRows([first, null, epoch, second, 42]);
    expect(out).toEqual([first, epoch, second]);
    expect(out[0]).toBe(first);
    expect(out[1]).toBe(epoch);
  });

  test("returns an empty array for empty input", () => {
    expect(toVegetationIndexRows([])).toEqual([]);
  });
});
