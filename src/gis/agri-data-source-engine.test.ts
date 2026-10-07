import type { QueriableDataSource } from "jimu-core";
import type { AgriLayerLike, AgriMapViewHostLike } from "./agri-layer-types";

interface FakeLayer {
  title?: string;
  url?: string;
  fields?: Array<{ name: string }>;
}

const mockQuickCount = jest.fn<Promise<number>, [FakeLayer, string]>();
const mockResolveFromMap = jest.fn();
const mockPrepare = jest.fn();

jest.mock("jimu-core", () => ({}));
jest.mock("./feature-layer-data", () => ({
  buildAgriWhere: (f: { viloyat?: string; skipRegionFilter?: boolean }) =>
    f.skipRegionFilter ? "1=1" : `viloyat='${f.viloyat ?? ""}'`,
  canonicalizeRegionFilterValue: (v: string) => v.toLowerCase(),
  disableLayerPbf: jest.fn(),
  flLog: jest.fn(),
  haystackMatchesRegion: (h: string, v: string) => !!v && h.toLowerCase().includes(v),
  haystackMatchesYear: (h: string, y: string | undefined) => !!y && h.includes(String(y)),
  getQueryableLayer: (l: FakeLayer | null | undefined) => l ?? null,
  pickYearRegionLayerPool: <T>(items: T[]) => items,
  prepareValueIndex: (...args: unknown[]) => mockPrepare(...args),
  quickLayerFeatureCount: (l: FakeLayer, w: string) => mockQuickCount(l, w),
  resolveFeatureLayerForFilters: (...args: unknown[]) => mockResolveFromMap(...args),
  safeLoadMapLayer: () => Promise.resolve(),
  scoreHaystackForFilters: (h: string, f: { viloyat?: string }) =>
    f.viloyat && h.toLowerCase().includes(f.viloyat) ? 30 : 1,
}));
jest.mock("./agri-layer-types", () => ({
  layerFieldNameList: (l: FakeLayer) => (l.fields || []).map((f) => f.name),
}));

import { AgriDataSourceEngine, getSelectedDsIds, toPlainArray } from "./agri-data-source-engine";

function fakeDs(id: string, layer: FakeLayer | null, label = ""): QueriableDataSource {
  return {
    id,
    layer: layer as unknown as AgriLayerLike,
    getLabel: () => label,
    getDataSourceJson: () => ({ url: "", label }),
  } as unknown as QueriableDataSource;
}

describe("toPlainArray", () => {
  test("handles arrays, Immutable-like, Collection-like and junk", () => {
    const arr = [1, 2];
    expect(toPlainArray(arr)).toBe(arr);
    expect(toPlainArray({ asMutable: () => [3] })).toEqual([3]);
    expect(toPlainArray({ toArray: () => [4] })).toEqual([4]);
    expect(toPlainArray(null)).toEqual([]);
    expect(toPlainArray({})).toEqual([]);
  });
});

describe("getSelectedDsIds", () => {
  test("dedupes and drops empty ids", () => {
    expect(
      getSelectedDsIds([{ dataSourceId: "a" }, null, { dataSourceId: "" }, { dataSourceId: "a" }, { dataSourceId: "b" }]),
    ).toEqual(["a", "b"]);
  });
});

describe("AgriDataSourceEngine", () => {
  beforeEach(() => {
    mockQuickCount.mockReset();
    mockResolveFromMap.mockReset();
    mockPrepare.mockReset();
  });

  test("connection state helpers", () => {
    const engine = new AgriDataSourceEngine();
    expect(engine.isResolvePending(null)).toBe(false);
    engine.syncSelection(["a", "b"]);
    expect(engine.isResolvePending(null)).toBe(true);
    expect(engine.hasConnectedSources()).toBe(false);
    engine.onDsCreated(fakeDs("a", { title: "x" }), ["a", "b"]);
    expect(engine.hasConnectedSources()).toBe(true);
    expect(engine.isResolvePending(null)).toBe(true);
    const host = { view: { map: {} } } as unknown as AgriMapViewHostLike;
    expect(engine.isResolvePending(host)).toBe(false);
    engine.onDsCreated(fakeDs("b", { title: "y" }), ["a", "b"]);
    expect(engine.isResolvePending(null)).toBe(false);
  });

  test("onDsCreated ignores data sources without id", () => {
    const engine = new AgriDataSourceEngine();
    engine.onDsCreated(fakeDs("", { title: "x" }), ["x"]);
    expect(engine.hasConnectedSources()).toBe(false);
  });

  test("resolves the single DS layer without counting", async () => {
    const engine = new AgriDataSourceEngine();
    const layer: FakeLayer = { title: "Fields 2024", fields: [{ name: "viloyat" }] };
    engine.onDsCreated(fakeDs("a", layer), ["a"]);
    const res = await engine.resolve({ yil: "2024", viloyat: "Andijon" }, null);
    expect(res).toEqual({
      layer,
      fields: ["viloyat"],
      regionScoped: false,
      yearScoped: true,
    });
    expect(mockQuickCount).not.toHaveBeenCalled();
    expect(mockPrepare).toHaveBeenCalledWith(layer, ["viloyat"]);
  });

  test("region-matching DS is region scoped", async () => {
    const engine = new AgriDataSourceEngine();
    const layer: FakeLayer = { title: "Andijon fields" };
    engine.onDsCreated(fakeDs("a", layer), ["a"]);
    const res = await engine.resolveFromDataSources({ yil: "2024", viloyat: "ANDIJON" });
    expect(res?.regionScoped).toBe(true);
    expect(res?.yearScoped).toBe(false);
  });

  test("with several DS and a region, picks the preferred DS when it has rows", async () => {
    const engine = new AgriDataSourceEngine();
    const a: FakeLayer = { title: "andijon" };
    const b: FakeLayer = { title: "other" };
    engine.onDsCreated(fakeDs("a", a), ["a", "b"]);
    engine.onDsCreated(fakeDs("b", b), ["a", "b"]);
    mockQuickCount.mockResolvedValue(10);
    const res = await engine.resolveFromDataSources({ yil: "2024", viloyat: "andijon" });
    expect(res?.layer).toBe(a);
    expect(mockQuickCount).toHaveBeenCalledTimes(1);
  });

  test("falls back to the DS with the most rows when preferred is empty", async () => {
    const engine = new AgriDataSourceEngine();
    const a: FakeLayer = { title: "andijon" };
    const b: FakeLayer = { title: "b" };
    const c: FakeLayer = { title: "c" };
    for (const [id, l] of [["a", a], ["b", b], ["c", c]] as Array<[string, FakeLayer]>) {
      engine.onDsCreated(fakeDs(id, l), ["a", "b", "c"]);
    }
    mockQuickCount.mockImplementation((l) => Promise.resolve(l === a ? 0 : l === b ? 5 : 50));
    const res = await engine.resolveFromDataSources({ yil: "2024", viloyat: "andijon" });
    expect(res?.layer).toBe(c);
  });

  test("returns null without DS and without a map view", async () => {
    const engine = new AgriDataSourceEngine();
    engine.syncSelection(["missing"]);
    await expect(engine.resolve({ yil: "2024", viloyat: "" }, null)).resolves.toBeNull();
  });

  test("falls back to the map when no DS layer resolves", async () => {
    const engine = new AgriDataSourceEngine();
    const mapLayer: FakeLayer = { title: "map" };
    mockResolveFromMap.mockResolvedValue({ layer: mapLayer, fields: ["f"], regionScoped: false, yearScoped: false });
    const host = { view: { map: {} } } as unknown as AgriMapViewHostLike;
    const res = await engine.resolve({ yil: "2024", viloyat: "" }, host);
    expect(res?.layer).toBe(mapLayer);
    expect(mockPrepare).toHaveBeenCalledWith(mapLayer, ["f"]);
  });

  test("dedupes concurrent resolves with the same key", async () => {
    const engine = new AgriDataSourceEngine();
    mockResolveFromMap.mockResolvedValue(null);
    const host = { view: { map: {} } } as unknown as AgriMapViewHostLike;
    const [r1, r2] = await Promise.all([
      engine.resolve({ yil: "2024", viloyat: "X" }, host),
      engine.resolve({ yil: "2024", viloyat: "x" }, host),
    ]);
    expect(r1).toBeNull();
    expect(r2).toBeNull();
    expect(mockResolveFromMap).toHaveBeenCalledTimes(1);
    engine.clearResolveCache();
  });
});
