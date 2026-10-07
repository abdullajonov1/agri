jest.mock("../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
jest.mock("../../../../gis/agri-table-data-source", () => ({ AGRI_TABLE_JOIN_FIELD: "uniqueid" }));

interface FakeLayer {
  id: string;
  title?: string;
  url?: string;
  visible?: boolean;
  fields?: Array<{ name: string }>;
  group?: boolean;
  children?: FakeLayer[];
  __agriQueryableUrl?: string;
}

const mockDetached = jest.fn();
jest.mock("../../../../gis/feature-layer-data", () => ({
  ensureAgriServerIdentityToken: (): Promise<void> => Promise.resolve(),
  resolveQueryableServiceUrl: (layer: FakeLayer): string => layer.url || "",
  getDetachedQueryLayerForUrl: (url: string): unknown => mockDetached(url),
  isMapImageGroupSublayer: (layer: FakeLayer): boolean => layer.group === true,
  collectQueryableFieldLayers: (root: FakeLayer): FakeLayer[] => root.children || [],
  getQueryableLayer: (root: FakeLayer): FakeLayer | null => (root.children ? null : root),
  getMapImageParentLayer: (): null => null,
  scoreHaystackForFilters: (haystack: string, filters: { yil: string }): number =>
    filters.yil && haystack.includes(filters.yil) ? 10 : 0,
  haystackMatchesRegion: (haystack: string, viloyat: string): boolean =>
    !!viloyat && haystack.toLowerCase().includes(viloyat.toLowerCase()),
}));

import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState } from "../graff-state";
import { findSpatialFeatureByUniqueId, getTableSpatialQueryCandidates } from "./spatial-candidates";

const leaf = (id: string, url: string, extra: Partial<FakeLayer> = {}): FakeLayer => ({
  id,
  url,
  title: id,
  visible: true,
  fields: [{ name: "uniqueid" }],
  ...extra,
});

const makeHost = (state: Partial<AgriGraffWidgetState>, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  ({
    state: {
      spatialClickLayers: [],
      regionalFilters: { viloyat: "", tuman: "", yil: "", uzspace: "", vh: "" },
      ...state,
    },
    _detachedSpatialQueryLayers: new Map<string, unknown>(),
    ...extra,
  }) as unknown as GraffWidgetHost;

const withMap = (roots: FakeLayer[]): Partial<AgriGraffWidgetState> =>
  ({
    activeMapView: { view: { map: { allLayers: { toArray: (): FakeLayer[] => roots } } } },
  }) as unknown as Partial<AgriGraffWidgetState>;

describe("getTableSpatialQueryCandidates", () => {
  test("filters non-agri, non-leaf, group, keyless and duplicate layers", () => {
    const good = leaf("good", "https://x/agri_sirdaryo_2024/MapServer/0");
    const host = makeHost({
      spatialClickLayers: [
        good as unknown as __esri.FeatureLayer,
        leaf("dup", "https://X/agri_sirdaryo_2024/MapServer/0") as unknown as __esri.FeatureLayer,
      ],
      ...withMap([
        { id: "root", children: [leaf("basemap", "https://tiles.arcgis.com/agri/MapServer/0")] },
        leaf("noleaf", "https://x/agri/MapServer"),
        leaf("group", "https://x/agri/MapServer/3", { group: true }),
        leaf("nokey", "https://x/agri/MapServer/4", { fields: [{ name: "other" }] }),
        leaf("nofields", "https://x/agri/MapServer/5", { fields: [] }),
      ]),
    });
    const ids = getTableSpatialQueryCandidates(host).map((l) => l.id);
    expect(ids).toEqual(["good", "nofields"]);
    expect(good.__agriQueryableUrl).toBe("https://x/agri_sirdaryo_2024/MapServer/0");
  });

  test("ranks by year, region and visibility and caps at 8", () => {
    const layers = Array.from({ length: 10 }, (_v, i) =>
      leaf(`l${i}`, `https://x/agri_${i === 3 ? "xorazm_2024" : "other"}/MapServer/${i}`, { visible: i !== 0 }),
    );
    const host = makeHost({
      regionalFilters: { viloyat: "Xorazm", tuman: "", yil: "2024", uzspace: "", vh: "" },
      ...withMap(layers),
    });
    const result = getTableSpatialQueryCandidates(host).map((l) => l.id);
    expect(result).toHaveLength(8);
    expect(result[0]).toBe("l3");
    expect(result).not.toContain("l0");
  });
});

describe("findSpatialFeatureByUniqueId", () => {
  beforeEach(() => mockDetached.mockReset());

  test("returns null for blank id", async () => {
    await expect(findSpatialFeatureByUniqueId(makeHost({}), " ")).resolves.toBeNull();
  });

  test("queries detached layers in order and caches them", async () => {
    const feature = { attributes: { uniqueid: "U1" } };
    const failing = {
      createQuery: (): Record<string, unknown> => ({}),
      queryFeatures: (): Promise<unknown> => Promise.reject(new Error("bad")),
    };
    const ok = {
      createQuery: (): Record<string, unknown> => ({}),
      queryFeatures: jest.fn((): Promise<unknown> => Promise.resolve({ features: [feature] })),
    };
    mockDetached.mockImplementation((url: string): Promise<unknown> => {
      if (url.endsWith("/0")) return Promise.resolve(failing);
      if (url.endsWith("/1")) return Promise.reject(new Error("no layer"));
      return Promise.resolve(ok);
    });
    const candidates = [
      leaf("a", "https://x/agri/MapServer/0"),
      leaf("b", "https://x/agri/MapServer/1"),
      leaf("noUrl", ""),
      leaf("c", "https://x/agri/MapServer/2"),
    ];
    const host = makeHost({}, {
      getTableSpatialQueryCandidates: (): FakeLayer[] => candidates,
    });
    await expect(findSpatialFeatureByUniqueId(host, "U1")).resolves.toBe(feature);
    const query = (ok.queryFeatures.mock.calls[0] as unknown[])[0] as { where: string; returnGeometry: boolean };
    expect(query.returnGeometry).toBe(true);
    expect(query.where).toContain("U1");
    expect(host._detachedSpatialQueryLayers.size).toBe(2);
  });

  test("null when no layer has the feature", async () => {
    mockDetached.mockResolvedValue({
      createQuery: (): Record<string, unknown> => ({}),
      queryFeatures: (): Promise<unknown> => Promise.resolve({ features: [] }),
    });
    const host = makeHost({}, {
      getTableSpatialQueryCandidates: (): FakeLayer[] => [leaf("a", "https://x/agri/MapServer/0")],
    });
    await expect(findSpatialFeatureByUniqueId(host, "U1")).resolves.toBeNull();
  });
});
