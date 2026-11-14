jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): { user: null } => ({ user: null }) }),
}));
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no arcgis in tests")),
}));
jest.mock("../../../shared/agri-singleton-layer-loader", () =>
  jest.requireActual("../__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
);
const mockBootstrap = jest.fn();
jest.mock("../../../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: () => mockBootstrap(),
}));

import { setAccessConfig } from "../../../shared/agri-access-config";
import { clearAgriQueryGatewayCache } from "../../../data/agri-query-gateway";
import {
  resolveVhStatusWindows,
  vhStatusWindowStart,
  vhWindowCache,
  VH_STATUS_WINDOW_DAYS,
} from "./status-vh-window";
import {
  DEFAULT_VEG_FIELDS,
  makeFakeVegLayer,
  setVegLayer,
  type FakeAttrs,
  type FakeQuery,
  type FakeVegLayer,
} from "../__test-utils__/veg-fake-layer";

const day = (ymd: string): number => Date.parse(`${ymd}T00:00:00Z`);
const isMaxQuery = (q: FakeQuery): boolean =>
  (q.outStatistics || []).some((s) => s.outStatisticFieldName === "last_date");

/** Bug'doy → 6 and 7 (two spellings), Paxta → 10; others are plain crops. */
const SEASON_ROWS = [
  { turi: "Bug'doy", cropId: "6" },
  { turi: "Буғдой", cropId: "7" },
  { turi: "Paxta", cropId: "10" },
  { turi: "Sholi", cropId: "12" },
];

const useLayer = (maxRows: FakeAttrs[]): FakeVegLayer => {
  const layer = makeFakeVegLayer(async (q) => (isMaxQuery(q) ? maxRows : []));
  setVegLayer(layer, DEFAULT_VEG_FIELDS);
  return layer;
};

beforeEach(() => {
  setAccessConfig(undefined);
  clearAgriQueryGatewayCache();
  localStorage.clear();
  vhWindowCache.clear();
  mockBootstrap.mockReset();
  mockBootstrap.mockResolvedValue({ regionDistrictRows: [], turiCropRows: SEASON_ROWS });
});

describe("vhStatusWindowStart", () => {
  test("default is the 10-day window, inclusive across month boundaries", () => {
    expect(VH_STATUS_WINDOW_DAYS).toBe(10);
    expect(vhStatusWindowStart("2026-09-30")).toBe("2026-09-21");
    expect(vhStatusWindowStart("2026-10-03")).toBe("2026-09-24");
    expect(vhStatusWindowStart("2026-10-03", 1)).toBe("2026-10-03");
    expect(vhStatusWindowStart("bad")).toBe("");
  });
});

describe("resolveVhStatusWindows", () => {
  test("October: Bug'doy keeps late April, Paxta late September, other crops their own last 10 days", async () => {
    const layer = useLayer([
      { region: 1730, crop_id: "6", last_date: day("2026-04-28") },
      { region: 1730, crop_id: "10", last_date: day("2026-09-30") },
      { region: 1730, crop_id: "3", last_date: day("2026-10-19") },
      { region: 1730, crop_id: "12", last_date: day("2026-10-02") },
    ]);
    const resolved = await resolveVhStatusWindows({ date: "2026-12-31", region: 1730 });

    expect(resolved.windows).toEqual([
      { region: "1730", cropId: "10", startDate: "2026-09-21", endDate: "2026-09-30", lookbackStart: "2026-06-01" },
      { region: "1730", cropId: "12", startDate: "2026-09-23", endDate: "2026-10-02", lookbackStart: "2026-01-01" },
      { region: "1730", cropId: "3", startDate: "2026-10-10", endDate: "2026-10-19", lookbackStart: "2026-01-01" },
      { region: "1730", cropId: "6", startDate: "2026-04-19", endDate: "2026-04-28", lookbackStart: "2026-03-01" },
    ]);
    expect(resolved.startDate).toBe("2026-04-19");
    expect(resolved.endDate).toBe("2026-10-19");

    // MAX(raster_date) per region × crop, seasonal crops limited to their months.
    const max = layer.executed[0];
    expect(max.groupByFieldsForStatistics).toEqual(["region", "crop_id"]);
    expect(max.where).toContain("crop_id NOT IN ('10','6','7')");
    expect(max.where).toContain(
      "(raster_date >= DATE '2026-03-01' AND raster_date < DATE '2026-05-01' AND crop_id IN ('6','7'))",
    );
    expect(max.where).toContain(
      "(raster_date >= DATE '2026-06-01' AND raster_date < DATE '2026-10-01' AND crop_id IN ('10'))",
    );
    expect(max.where).toContain("region='1730'");

    // The main scan reads only the 10-day windows; lookbackStart is for the fallback.
    expect(resolved.where).toContain(
      "(raster_date >= DATE '2026-04-19' AND raster_date < DATE '2026-04-29' AND ((region='1730' AND crop_id='6')))",
    );
    expect(resolved.where).toContain(
      "(raster_date >= DATE '2026-09-21' AND raster_date < DATE '2026-10-01' AND ((region='1730' AND crop_id='10')))",
    );
    expect(resolved.where).toContain(
      "(raster_date >= DATE '2026-10-10' AND raster_date < DATE '2026-10-20' AND ((region='1730' AND crop_id='3')))",
    );
    expect(resolved.scopeClauses).toEqual(["region='1730'"]);
    expect(resolved.regionField).toBe("region");
    expect(resolved.cropField).toBe("crop_id");
    expect(resolved.where).toMatch(/ AND region='1730'$/);
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });

  test("a season window never reaches back before the season's first month", async () => {
    useLayer([{ region: 1730, crop_id: "6", last_date: day("2026-03-04") }]);
    const resolved = await resolveVhStatusWindows({ date: "2026-12-31", region: 1730 });
    expect(resolved.windows).toEqual([
      { region: "1730", cropId: "6", startDate: "2026-03-01", endDate: "2026-03-04", lookbackStart: "2026-03-01" },
    ]);
  });

  test("republic: shared windows collapse into one date clause; null crop / region kept", async () => {
    useLayer([
      { region: 1724, crop_id: "3", last_date: day("2026-10-19") },
      { region: 1727, crop_id: "3", last_date: day("2026-10-19") },
      { region: 1727, crop_id: null, last_date: day("2026-10-19") },
      { region: null, crop_id: "4", last_date: day("2026-10-19") },
    ]);
    const resolved = await resolveVhStatusWindows({ date: "2026-12-31" });
    expect(resolved.where).toBe(
      "((raster_date >= DATE '2026-10-10' AND raster_date < DATE '2026-10-20' AND (" +
        "(region='1724' AND crop_id='3') OR " +
        "(region='1727' AND (crop_id='3' OR crop_id IS NULL)) OR " +
        "(region IS NULL AND crop_id='4'))))",
    );
  });

  test("locked date caps the season: no Paxta before June, Bug'doy up to the day", async () => {
    const layer = useLayer([]);
    const resolved = await resolveVhStatusWindows({ date: "2026-04-10", region: 1730 });
    expect(resolved.where).toBeNull();
    const where = String(layer.executed[0].where);
    expect(where).toContain(
      "(raster_date >= DATE '2026-03-01' AND raster_date < DATE '2026-04-11' AND crop_id IN ('6','7'))",
    );
    expect(where).not.toContain("2026-06-01");
    expect(where).toContain("raster_date >= DATE '2026-01-01' AND raster_date < DATE '2026-04-11'");
  });

  test("without the turi ↔ crop_id mapping every crop gets the plain window", async () => {
    mockBootstrap.mockRejectedValue(new Error("offline"));
    const layer = useLayer([{ region: 1730, crop_id: "6", last_date: day("2026-04-28") }]);
    const resolved = await resolveVhStatusWindows({ date: "2026-12-31", region: 1730 });
    expect(String(layer.executed[0].where)).not.toContain("NOT IN");
    expect(resolved.windows[0].startDate).toBe("2026-04-19");
  });

  test("crop, district and farmer scope reach both queries; empty farmer list skips the service", async () => {
    const layer = useLayer([{ region: 1730, crop_id: "3", last_date: day("2026-10-19") }]);
    const resolved = await resolveVhStatusWindows({
      date: "2026-12-31",
      region: 1730,
      district: 5,
      cropIds: ["3"],
      uniqueIds: ["abc"],
    });
    for (const where of [String(layer.executed[0].where), String(resolved.where)]) {
      expect(where).toContain("district='5'");
      expect(where).toContain("crop_id='3'");
      expect(where).toContain("'abc'");
    }
    await expect(resolveVhStatusWindows({ date: "2026-12-31", uniqueIds: [] })).resolves.toEqual(
      expect.objectContaining({ where: null }),
    );
    await expect(resolveVhStatusWindows({ date: "bad" })).resolves.toEqual(
      expect.objectContaining({ where: null }),
    );
    expect(layer.queryFeatures).toHaveBeenCalledTimes(1);
  });
});

