jest.mock("jimu-arcgis", () => ({}));
jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../../gis/feature-layer-data", () => ({ isMapImageOwnedLayer: (): boolean => false }));

const mockGetLayer = jest.fn();
jest.mock("../../../../gis/agri-table-data-source", () => ({
  getAgriTableDataLayer: (): unknown => mockGetLayer(),
  AGRI_TABLE_JOIN_FIELD: "uniqueid",
}));
jest.mock("../../../../gis/agri-vegetation-data-source", () => ({
  formatArcgisDateToYmd: (raw: unknown): string | null => {
    const d = raw instanceof Date ? raw : new Date(String(raw));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  },
}));

import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import {
  buildTumanNameClause,
  ensureRegionDistrictForSelection,
  eqAposSmart,
  formatLocalDateYmd,
  makeRegionDistrictKey,
  normalizeApos,
  resolveAgainstAvailableDates,
  resolveCropIdForTuri,
  resolveCropIdForUniqueid,
  resolveDistrictNumber,
  storeRegionDistrictMappingRow,
} from "./geo-helpers";

interface FakeHost {
  state: Partial<AgriGraffWidgetState>;
  _turiToCropId: Record<string, string>;
  _viloyatToRegion: Record<string, number>;
  _tumanToDistrict: Record<string, number>;
  _tumanToDistrictVotes: Record<string, number>;
}

const makeHost = (state: Partial<AgriGraffWidgetState> = {}): GraffWidgetHost => {
  const fake: FakeHost = {
    state: {
      records: [],
      regionalFilters: { viloyat: "", tuman: "", yil: "2024", uzspace: "", vh: "" },
      regionalRegionCode: null,
      regionalDistrictCode: null,
      ...state,
    },
    _turiToCropId: { paxta: "3" },
    _viloyatToRegion: {},
    _tumanToDistrict: {},
    _tumanToDistrictVotes: {},
  };
  const host = fake as unknown as GraffWidgetHost;
  Object.assign(host, {
    normalizeApos: (s: string): string => normalizeApos(host, s),
    makeRegionDistrictKey: (raw: string | null | undefined): string => makeRegionDistrictKey(host, raw),
    resolveCropIdForTuri: (t: string): string | undefined => resolveCropIdForTuri(host, t),
    resolveDistrictNumber: (v: string, t: string, hint?: number): number | undefined =>
      resolveDistrictNumber(host, v, t, hint),
    storeRegionDistrictMappingRow: (
      v: string | null | undefined,
      r: unknown,
      t: string | null | undefined,
      d: unknown,
      c?: number,
    ): void => storeRegionDistrictMappingRow(host, v, r, t, d, c),
    eqAposSmart: (field: string, raw: string): string => eqAposSmart(host, field, raw),
  });
  return host;
};

describe("simple wrappers", () => {
  test("normalizeApos and makeRegionDistrictKey", () => {
    const host = makeHost();
    expect(normalizeApos(host, "Bog‘ot")).toBe("Bog'ot");
    expect(makeRegionDistrictKey(host, "  Sirdaryo ")).toBe("sirdaryo");
    expect(makeRegionDistrictKey(host, null)).toBe("");
  });

  test("eqAposSmart returns empty for blank and sql otherwise", () => {
    const host = makeHost();
    expect(eqAposSmart(host, "viloyat", "")).toBe("");
    expect(eqAposSmart(host, "viloyat", "Toshkent")).toBe("viloyat='Toshkent'");
  });

  test("formatLocalDateYmd and resolveAgainstAvailableDates", () => {
    const host = makeHost();
    expect(formatLocalDateYmd(host, new Date("2024-03-05T00:00:00Z"))).toBe("2024-03-05");
    expect(resolveAgainstAvailableDates(host, "2024-03-05T00:00:00Z", [])).toBe("2024-03-05");
  });
});

describe("crop resolution", () => {
  test("resolveCropIdForTuri uses lookup map", () => {
    const host = makeHost();
    expect(resolveCropIdForTuri(host, "Paxta")).toBe("3");
    expect(resolveCropIdForTuri(host, "")).toBeUndefined();
  });

  test("resolveCropIdForUniqueid from turi, crop_id and wheat fallback", () => {
    const host = makeHost({
      records: [
        { uniqueid: "{A}", turi: "paxta" },
        { uniqueid: "B", crop_id: 12 },
      ],
    });
    expect(resolveCropIdForUniqueid(host, "A")).toBe(3);
    expect(resolveCropIdForUniqueid(host, "B")).toBe(12);
    expect(resolveCropIdForUniqueid(host, "")).toBeNull();
  });

  // Fixed bug (geo-helpers.ts resolveCropIdForUniqueid): `Number(null)` is 0, which is
  // finite, so a record with no crop id returns 0 and the wheat (crop_id=6)
  // fallback and the trailing `return null` are unreachable.
  test("falls back to wheat id 6 / null when the record has no crop id", () => {
    const host = makeHost({
      records: [
        { uniqueid: "C", turi: "Bug'doy" },
        { uniqueid: "D", turi: "noma'lum" },
      ],
    });
    expect(resolveCropIdForUniqueid(host, "C")).toBe(6);
    expect(resolveCropIdForUniqueid(host, "D")).toBeNull();
    expect(resolveCropIdForUniqueid(host, "missing")).toBeNull();
  });
});

describe("district mapping", () => {
  test("numeric tuman returns directly; empty returns undefined", () => {
    const host = makeHost();
    expect(resolveDistrictNumber(host, "x", "1724401")).toBe(1724401);
    expect(resolveDistrictNumber(host, "x", "")).toBeUndefined();
  });

  test("store then resolve scoped by region and viloyat", () => {
    const host = makeHost();
    storeRegionDistrictMappingRow(host, "Sirdaryo", "1724", "Guliston", "1724401");
    expect(resolveDistrictNumber(host, "Sirdaryo", "Guliston")).toBe(1724401);
    expect(resolveDistrictNumber(host, "1724", "Guliston")).toBe(1724401);
    expect(resolveDistrictNumber(host, "", "Guliston", 1724)).toBe(1724401);
    expect(resolveDistrictNumber(host, "Xorazm", "Guliston")).toBeUndefined();
  });

  test("higher vote wins, lower vote does not overwrite", () => {
    const host = makeHost();
    storeRegionDistrictMappingRow(host, "V", "1", "T", "10", 2);
    storeRegionDistrictMappingRow(host, "V", "1", "T", "11", 1);
    expect(resolveDistrictNumber(host, "V", "T")).toBe(10);
    storeRegionDistrictMappingRow(host, "V", "1", "T", "12", 5);
    expect(resolveDistrictNumber(host, "V", "T")).toBe(12);
  });

  test("ignores rows without district", () => {
    const host = makeHost();
    storeRegionDistrictMappingRow(host, "V", "", "T", "");
    expect(resolveDistrictNumber(host, "V", "T")).toBeUndefined();
  });

  test("buildTumanNameClause prefers district code", () => {
    const host = makeHost();
    storeRegionDistrictMappingRow(host, "V", "1", "T", "99");
    expect(buildTumanNameClause(host, "T", "V")).toBe("district = '99'");
    expect(buildTumanNameClause(host, "Other")).toContain("tuman");
  });
});

describe("ensureRegionDistrictForSelection", () => {
  beforeEach(() => mockGetLayer.mockReset());

  test("no query when nothing to resolve", async () => {
    await ensureRegionDistrictForSelection(makeHost());
    expect(mockGetLayer).not.toHaveBeenCalled();
  });

  test("queries table and stores mapping rows", async () => {
    const queryFeatures = jest.fn(() =>
      Promise.resolve({
        features: [{ attributes: { viloyat: "Sirdaryo", region: 1724, tuman: "Guliston", district: 1724401 } }],
      }),
    );
    mockGetLayer.mockResolvedValue({ layer: { createQuery: (): Record<string, unknown> => ({}), queryFeatures } });
    const host = makeHost({
      regionalFilters: { viloyat: "Sirdaryo", tuman: "Guliston", yil: "2024", uzspace: "", vh: "" },
    });
    await ensureRegionDistrictForSelection(host);
    const query = (queryFeatures.mock.calls[0] as unknown[])[0] as { where: string };
    expect(query.where).toBe("viloyat='Sirdaryo' AND tuman='Guliston'");
    expect(resolveDistrictNumber(host, "Sirdaryo", "Guliston")).toBe(1724401);
  });

  test("swallows query failure", async () => {
    mockGetLayer.mockRejectedValue(new Error("offline"));
    const host = makeHost({
      regionalFilters: { viloyat: "X", tuman: "", yil: "2024", uzspace: "", vh: "" },
    });
    await expect(ensureRegionDistrictForSelection(host)).resolves.toBeUndefined();
  });
});
