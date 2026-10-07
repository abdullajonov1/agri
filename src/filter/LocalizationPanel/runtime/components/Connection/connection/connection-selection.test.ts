jest.mock("../../../../../../data/agri-bootstrap", () => ({
  getAgriDashboardBootstrap: jest.fn(),
}));
jest.mock("../../../../../localization/resolve-geo-codes", () => ({
  storeScopedRegionDistrictMapping: jest.fn(),
  hasDistrictMappingForSelection: jest.fn(),
  resolveDistrictNumberFromMaps: jest.fn(() => 7),
}));
jest.mock("../../../../../../shared/agri-crop-labels", () => ({
  getTuriCropLookupKey: jest.fn((s: string) => String(s || "").trim().toLowerCase()),
}));
jest.mock("../../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));

import { getTuriCropLookupKey } from "../../../../../../shared/agri-crop-labels";
import { getAgriDashboardBootstrap } from "../../../../../../data/agri-bootstrap";
import {
  hasDistrictMappingForSelection,
  storeScopedRegionDistrictMapping,
} from "../../../../../localization/resolve-geo-codes";
import { makeFakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import {
  ensureCropIdForSelection,
  ensureRegionDistrictForSelection,
  fetchAndStoreRegionDistrictMappings,
} from "./connection-selection";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;

interface FakeQ { where?: string; outFields?: string[]; returnGeometry?: boolean; num?: number }
const queryLayer = (pages: Array<Array<Record<string, unknown>>>): { layer: __esri.FeatureLayer; queries: FakeQ[] } => {
  const queries: FakeQ[] = [];
  let i = 0;
  const layer = {
    createQuery: (): FakeQ => {
      const q: FakeQ = {};
      queries.push(q);
      return q;
    },
    queryFeatures: jest.fn(() => Promise.resolve({ features: (pages[i++] ?? []).map((attributes) => ({ attributes })) })),
  } as unknown as __esri.FeatureLayer;
  return { layer, queries };
};

beforeEach(() => jest.resetAllMocks());
beforeEach(() => {
  m(hasDistrictMappingForSelection).mockReturnValue(false);
  m(getTuriCropLookupKey).mockImplementation((v: string) => String(v || "").trim().toLowerCase());
});

describe("fetchAndStoreRegionDistrictMappings", () => {
  it("builds region/viloyat/crop maps (longest viloyat name wins, blank crops skipped)", async () => {
    m(getAgriDashboardBootstrap).mockResolvedValue({
      regionDistrictRows: [
        { viloyat: "And", region: 3, tuman: "T1", district: 1, count: 5 },
        { viloyat: "Andijon", region: 3, tuman: "T2", district: 2, count: 4 },
        { viloyat: "", region: 4, tuman: "T3", district: 3, count: 1 },
        { viloyat: "Nan", region: Number.NaN, tuman: "T4", district: 4, count: 1 },
      ],
      turiCropRows: [
        { turi: " Paxta ", cropId: "11" },
        { turi: "Bug'doy", cropId: "" },
        { turi: "", cropId: "9" },
      ],
    });
    const h = makeFakeHost({ getGeoCodeHelpers: () => ({ normalizeApos: (s: string) => s, makeRegionDistrictKey: (s) => String(s) }) });
    await fetchAndStoreRegionDistrictMappings(h);
    expect(h._regionToViloyat).toEqual({ "3": "Andijon" });
    expect(h._turiToCropId).toEqual({ paxta: "11" });
    expect(storeScopedRegionDistrictMapping).toHaveBeenCalledTimes(4);
    expect(m(storeScopedRegionDistrictMapping).mock.calls[0][0]).toBe("And");
    expect(m(storeScopedRegionDistrictMapping).mock.calls[0][7]).toMatchObject({ count: 5 });
  });

  it("swallows bootstrap failures and leaves maps untouched", async () => {
    m(getAgriDashboardBootstrap).mockRejectedValue(new Error("down"));
    const h = makeFakeHost({ getGeoCodeHelpers: () => ({ normalizeApos: (s: string) => s, makeRegionDistrictKey: (s) => String(s) }) });
    await expect(fetchAndStoreRegionDistrictMappings(h)).resolves.toBeUndefined();
    expect(h._regionToViloyat).toEqual({});
  });
});

describe("ensureRegionDistrictForSelection", () => {
  const base = (layer: __esri.FeatureLayer, init: FakeHostInit = {}) =>
    makeFakeHost({
      getGeoCodeHelpers: () => ({ normalizeApos: (s: string) => s, makeRegionDistrictKey: (s) => String(s ?? "").toLowerCase() }),
      eqAposSmart: (f: string, v: string) => `${f}='${v}'`,
      ...init,
      state: { featureLayer: layer, featureLayers: [], viloyat: "Andijon", tuman: "Asaka", ...init.state },
    });

  it("returns without layers or when nothing is missing", async () => {
    const h = makeFakeHost();
    await ensureRegionDistrictForSelection(h);
    const { layer } = queryLayer([]);
    m(hasDistrictMappingForSelection).mockReturnValue(true);
    const h2 = base(layer, { _viloyatToRegion: { andijon: 3 } });
    await ensureRegionDistrictForSelection(h2);
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  it("queries with AND of viloyat and tuman and stores mappings", async () => {
    const { layer, queries } = queryLayer([[
      { viloyat: "Andijon", region: 3, tuman: "Asaka", district: 9 },
      { viloyat: "", region: "", tuman: "", district: null },
    ]]);
    const h = base(layer);
    await ensureRegionDistrictForSelection(h);
    expect(queries[0].where).toBe("(viloyat='Andijon') AND (tuman='Asaka')");
    expect(queries[0]).toMatchObject({ returnGeometry: false, num: 100, outFields: ["viloyat", "region", "tuman", "district"] });
    expect(storeScopedRegionDistrictMapping).toHaveBeenCalledTimes(2);
    expect(m(storeScopedRegionDistrictMapping).mock.calls[1][0]).toBeNull();
    expect(h._regionToViloyat).toEqual({ "3": "Andijon" });
  });

  it("queries only viloyat when the district mapping is known, only tuman when region known", async () => {
    m(hasDistrictMappingForSelection).mockReturnValue(true);
    const a = queryLayer([[]]);
    await ensureRegionDistrictForSelection(base(a.layer));
    expect(a.queries[0].where).toBe("(viloyat='Andijon')");

    m(hasDistrictMappingForSelection).mockReturnValue(false);
    const b = queryLayer([[]]);
    await ensureRegionDistrictForSelection(base(b.layer, { _viloyatToRegion: { andijon: 3 } }));
    expect(b.queries[0].where).toBe("(tuman='Asaka')");
  });

  it("falls back to lockedViloyat and logs errors without throwing", async () => {
    const { layer } = queryLayer([]);
    m(layer.queryFeatures).mockRejectedValue(new Error("q"));
    const h = base(layer, { state: { viloyat: "", lockedViloyat: "Andijon", tuman: "" } });
    await expect(ensureRegionDistrictForSelection(h)).resolves.toBeUndefined();
    expect(layer.queryFeatures).toHaveBeenCalled();
  });
});

describe("ensureCropIdForSelection", () => {
  const base = (layer: __esri.FeatureLayer, init: FakeHostInit = {}) =>
    makeFakeHost({
      getSelectedTurlar: () => ["Paxta", "Bug'doy"],
      resolveCropIdForTuri: jest.fn((t: string) => (t === "Paxta" ? "1" : undefined)),
      buildViloyatRegionClause: () => "region=3",
      buildTurlarClause: jest.fn((_f?: string, v?: string[]) => `turi IN (${(v ?? []).join(",")})`),
      ...init,
      state: { featureLayer: layer, featureLayers: [] },
    });

  it("returns early without layers or missing crops", async () => {
    await ensureCropIdForSelection(makeFakeHost());
    const { layer } = queryLayer([]);
    await ensureCropIdForSelection(base(layer, { resolveCropIdForTuri: () => "1" }));
    expect(layer.queryFeatures).not.toHaveBeenCalled();
  });

  it("queries the missing crops and stores the discovered crop id", async () => {
    const { layer, queries } = queryLayer([[
      { turi: "Bug'doy", crop_id: 5 },
      { turi: "", crop_id: 6 },
      { turi: "X", crop_id: "" },
    ]]);
    const h = base(layer);
    await ensureCropIdForSelection(h);
    expect(queries[0].where).toBe("(region=3) AND (turi IN (Bug'doy))");
    expect(queries[0].num).toBe(20);
    expect(h._turiToCropId).toEqual({ "bug'doy": "5" });
  });

  it("stops at the first layer that resolves everything, otherwise tries the next", async () => {
    const first = queryLayer([[{ turi: "Bug'doy", crop_id: 5 }]]);
    const second = queryLayer([[]]);
    let resolved = false;
    const h = makeFakeHost({
      getSelectedTurlar: () => ["Bug'doy"],
      resolveCropIdForTuri: () => (resolved ? "5" : undefined),
      buildViloyatRegionClause: () => "",
      buildTurlarClause: () => "t=1",
      state: { featureLayers: [first.layer, second.layer] },
    });
    m(first.layer.queryFeatures).mockImplementation(() => { resolved = true; return Promise.resolve({ features: [] }); });
    await ensureCropIdForSelection(h);
    expect(second.layer.queryFeatures).not.toHaveBeenCalled();
  });

  it("returns when no WHERE can be built and survives query errors", async () => {
    const a = queryLayer([]);
    await ensureCropIdForSelection(base(a.layer, { buildViloyatRegionClause: () => "", buildTurlarClause: () => "" }));
    expect(a.layer.queryFeatures).not.toHaveBeenCalled();
    const b = queryLayer([]);
    m(b.layer.queryFeatures).mockRejectedValue(new Error("x"));
    await expect(ensureCropIdForSelection(base(b.layer))).resolves.toBeUndefined();
  });
});
