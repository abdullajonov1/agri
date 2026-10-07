import type Extent from "esri/geometry/Extent";
import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type EsriMap from "esri/Map";
import type { BoundaryModules, AdminBoundaryView } from "./boundary-modules";
import type { BoundarySyncContext } from "./boundary-sync-context";
import type { OutlineQueryOptions, OutlineQueryResult } from "./boundary-outline-query";
import type { DistrictFsSyncOptions, DistrictFsSyncResult } from "./boundary-fs-sync";

type Props = Record<string, unknown>;

const mockGetDetached = jest.fn<Promise<FeatureLayer>, [unknown, string]>();
const mockDraw = jest.fn<Promise<OutlineQueryResult>, [OutlineQueryOptions]>();
const mockFsSync = jest.fn<Promise<DistrictFsSyncResult>, [DistrictFsSyncOptions]>();

jest.mock("./boundary-modules", () => ({
  getAgriDistrictBoundaryUrl: () => "https://s/district/3",
  getDistrictLayerUrlCandidates: () => ["https://s/tuman/0", "https://s/district/3"],
  getDetachedQueryLayer: (cls: unknown, url: string) => mockGetDetached(cls, url),
}));
jest.mock("./boundary-outline-query", () => ({
  queryAndDrawOutline: (opts: OutlineQueryOptions) => mockDraw(opts),
}));
jest.mock("./boundary-fs-sync", () => ({
  syncDistrictsViaMapFeatureLayer: (opts: DistrictFsSyncOptions) => mockFsSync(opts),
}));

import { syncSingleDistrict } from "./boundary-sync-district";
import { syncRegionWithDistricts } from "./boundary-sync-region";

const VALID = { xmin: 0, ymin: 0, xmax: 1, ymax: 1 } as unknown as Extent;

const drawResult = (featureCount: number, extent: Extent | null = VALID): OutlineQueryResult => ({
  extent,
  featureCount,
  firstGeometry: featureCount ? ({ type: "polygon" } as unknown as OutlineQueryResult["firstGeometry"]) : null,
  features: [],
  labelFields: [],
});

const layerWithFields = (...names: string[]): FeatureLayer =>
  ({ fields: names.map((name) => ({ name, type: "esriFieldTypeString" })) }) as unknown as FeatureLayer;

function makeCtx(overrides: Partial<BoundarySyncContext> = {}): BoundarySyncContext {
  const items: Props[] = [];
  const map = {
    layers: {
      find: (p: (l: Props) => boolean) => items.find(p),
      toArray: () => items.slice(),
      length: 0,
    },
    add: (l: Props) => items.push(l),
    remove: jest.fn(),
    reorder: jest.fn(),
  } as unknown as EsriMap;
  const outline = (): GraphicsLayer => ({ removeAll: jest.fn(), visible: true }) as unknown as GraphicsLayer;
  return {
    view: { map, graphics: { toArray: (): never[] => [], remove: jest.fn() } } as unknown as AdminBoundaryView,
    map,
    modules: { FeatureLayer: "FL", Graphic: "G" } as unknown as BoundaryModules,
    regionOutline: outline(),
    districtOutline: outline(),
    regionQueryLayer: layerWithFields("parent_cod"),
    bordersVisible: true,
    selection: {},
    viloyat: "Andijon",
    tuman: "",
    parentCod: 1703,
    districtCode: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

describe("syncSingleDistrict", () => {
  test("returns the first candidate-service draw with features", async () => {
    mockGetDetached.mockResolvedValue(layerWithFields("soato", "tuman_nomi"));
    mockDraw.mockResolvedValueOnce(drawResult(0)).mockResolvedValue(drawResult(1));
    const ctx = makeCtx({ tuman: "Quva", districtCode: "1703212" });
    const res = await syncSingleDistrict(ctx);
    expect(res).toEqual({ extent: VALID, level: "district" });
    expect(ctx.regionOutline.visible).toBe(false);
    expect(mockDraw.mock.calls[0][0]).toMatchObject({ districtStyle: true, withLabels: true, outlineWidth: 0.85 });
    expect(ctx.map.reorder).toHaveBeenCalled();
  });

  test("falls back to the legacy district WHERE when candidates draw nothing", async () => {
    // Both candidate services fail to load; the legacy Hosted/district layer works.
    mockGetDetached
      .mockRejectedValueOnce(new Error("down"))
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue(layerWithFields("district"));
    mockDraw.mockResolvedValue(drawResult(1));
    const res = await syncSingleDistrict(makeCtx({ tuman: "Quva", bordersVisible: false }));
    expect(res).toEqual({ extent: VALID, level: "district" });
    expect(mockGetDetached.mock.calls.map((c) => c[1])).toEqual([
      "https://s/tuman/0",
      "https://s/district/3",
      "https://s/district/3",
    ]);
    expect(mockDraw).toHaveBeenCalledTimes(1);
    expect(mockDraw.mock.calls[0][0].where).toContain("Quva");
  });

  test("nothing drawn anywhere -> null extent", async () => {
    mockGetDetached.mockRejectedValue(new Error("down"));
    const res = await syncSingleDistrict(makeCtx({ tuman: "Quva" }));
    expect(res).toEqual({ extent: null, level: "district" });
  });
});

describe("syncRegionWithDistricts", () => {
  test("uses live FS districts when available and skips query fallback", async () => {
    mockDraw.mockResolvedValue(drawResult(1));
    mockFsSync.mockResolvedValue({ count: 14, mode: "fs:soato", field: "soato", url: "u" });
    const ctx = makeCtx({ selection: { districtNames: [" Quva ", ""], districtCodes: [1703212] } });
    const res = await syncRegionWithDistricts(ctx);
    expect(res).toEqual({ extent: VALID, level: "region" });
    expect(mockDraw).toHaveBeenCalledTimes(1);
    expect(mockDraw.mock.calls[0][0]).toMatchObject({ outlineWidth: 2.4 });
    expect(mockFsSync.mock.calls[0][0]).toMatchObject({
      parentCod: 1703,
      districtNames: ["Quva"],
      districtCodes: [1703212],
      bordersVisible: true,
    });
    expect(mockGetDetached).not.toHaveBeenCalled();
  });

  test("falls back to queries, rejecting neighbour spill, then spatial contains", async () => {
    mockFsSync.mockResolvedValue({ count: 0, mode: "none", field: null, url: "" });
    mockGetDetached.mockResolvedValue(layerWithFields("soato"));
    mockDraw.mockImplementation((opts) => {
      if (opts.outlineWidth === 2.4) return Promise.resolve(drawResult(1));
      if (opts.spatialRelationship === "contains") return Promise.resolve(drawResult(12));
      return Promise.resolve(drawResult(999));
    });
    const ctx = makeCtx();
    const res = await syncRegionWithDistricts(ctx);
    expect(res.level).toBe("region");
    const spatialCall = mockDraw.mock.calls.find((c) => c[0].spatialRelationship === "contains");
    expect(spatialCall?.[0]).toMatchObject({ where: "1=1", districtStyle: true });
    // too-many draws reset the district outline
    expect(ctx.districtOutline.removeAll).toHaveBeenCalled();
  });

  test("invalid region extent yields null", async () => {
    mockFsSync.mockResolvedValue({ count: 3, mode: "fs", field: null, url: "u" });
    mockDraw.mockResolvedValue(drawResult(1, null));
    const res = await syncRegionWithDistricts(makeCtx({ bordersVisible: false }));
    expect(res).toEqual({ extent: null, level: "region" });
  });
});
