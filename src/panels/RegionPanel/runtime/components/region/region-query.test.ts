const mockGetInstance = jest.fn();
jest.mock("jimu-core", () => ({
  React: jest.requireActual("react"),
  DataSourceManager: { getInstance: (): unknown => mockGetInstance() as unknown },
}));
jest.mock("jimu-arcgis", () => ({}));

const mockQueryable = jest.fn();
jest.mock("../../../../../gis/feature-layer-data", () => ({
  getQueryableLayer: (l: unknown): unknown => mockQueryable(l) as unknown,
}));
const mockFindArea = jest.fn();
jest.mock("../../../../../data/agri-area-field", () => ({
  findAreaFieldNumeric: (l: unknown, o: unknown): string | null => mockFindArea(l, o) as string | null,
}));
const mockBuildWhere = jest.fn();
jest.mock("../../../../../controller/agri-where-builder", () => ({
  buildRegionAggregatesWhere: (o: unknown): string => mockBuildWhere(o) as string,
}));
const mockGroupFeatures = jest.fn();
jest.mock("../../../../../data/agri-stats-store", () => ({
  getRegionGroupFeaturesCached: (o: unknown): Promise<unknown[]> => mockGroupFeatures(o) as Promise<unknown[]>,
}));
const mockWaitPack = jest.fn();
const mockGetPack = jest.fn();
jest.mock("../../../../../store/agri-dashboard-store", () => ({
  waitForDashboardPackReady: (ms: number): Promise<void> => mockWaitPack(ms) as Promise<void>,
  getDashboardPack: (): unknown => mockGetPack() as unknown,
}));
const mockMatchPack = jest.fn();
jest.mock("../../../../../data/agri-dashboard-pack-match", () => ({
  matchRegionDashboardPack: (...a: unknown[]): unknown => mockMatchPack(...a) as unknown,
}));

import type { DataSource } from "jimu-core";
import type { JimuMapView } from "jimu-arcgis";
import type { RegionWidgetHost } from "../../region-host";
import { makeStubHost } from "../../__test-utils__/stub-host";
import {
  buildVhScopedWheres,
  buildWhereForAggregates,
  calculateDynamicYAxisWidth,
  detectAreaField,
  fetchRegionalData,
  fetchRegionalDataDeduped,
  normalizeApos,
  onDataSourceCreated,
  queryAggregates,
  resolveFeatureLayerFromOneUseDataSource,
  resolveFeatureLayersFromUseDataSources,
  splitLabelTwoLines,
} from "./region-query";

const makeView = (map: boolean, jlvs: unknown[] = [], layers: unknown[] = []): JimuMapView =>
  ({
    view: map ? { map: { layers: { toArray: () => layers } } } : undefined,
    getAllJimuLayerViews: () => jlvs,
  }) as unknown as JimuMapView;

describe("small helpers", () => {
  const host = makeStubHost();
  it("splitLabelTwoLines trims and keeps a single line", () => {
    expect(splitLabelTwoLines(host, "  Andijon ")).toEqual(["Andijon"]);
    expect(splitLabelTwoLines(host, undefined as unknown as string)).toEqual([""]);
  });

  it.each([
    ["xs", 78],
    ["sm", 88],
    ["md", 96],
    ["lg", 104],
  ] as const)("axis width for %s is %i", (size, width) => {
    expect(calculateDynamicYAxisWidth(makeStubHost({ widgetSize: size }))).toBe(width);
  });

  it("detectAreaField passes the configured field", () => {
    mockFindArea.mockReturnValue("maydon");
    const h = makeStubHost();
    h.props = { ...h.props, config: { areaField: "area_ha" } };
    const layer = {} as __esri.FeatureLayer;
    expect(detectAreaField(h, layer)).toBe("maydon");
    expect(mockFindArea).toHaveBeenCalledWith(layer, { configField: "area_ha" });
  });

  it("onDataSourceCreated stores the data source", () => {
    const h = makeStubHost();
    const ds = { id: "ds" } as unknown as DataSource;
    onDataSourceCreated(h, ds);
    expect(h.state.dataSource).toBe(ds);
  });

  it("normalizeApos folds apostrophe variants", () => {
    expect(normalizeApos(host, "Farg’ona")).toBe(normalizeApos(host, "Farg'ona"));
  });

  it("buildVhScopedWheres returns the base where untouched", async () => {
    await expect(buildVhScopedWheres(host, "w")).resolves.toEqual(["w"]);
  });
});

describe("buildWhereForAggregates", () => {
  beforeEach(() => mockBuildWhere.mockReset().mockReturnValue("WHERE"));

  it("omits crop filters and uses the drilled viloyat", () => {
    const h = makeStubHost({
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon",
      currentFilters: { ...makeStubHost().state.currentFilters, yil: "2024", viloyat: "Other", turi: "Bugdoy", turlar: ["Bugdoy"] },
    });
    expect(buildWhereForAggregates(h)).toBe("WHERE");
    expect(mockBuildWhere).toHaveBeenCalledWith({
      yil: "2024",
      viloyat: "Other",
      turi: "",
      turlar: [],
      lockedViloyat: "",
      view: "tuman",
      drillViloyat: "Andijon",
    });
  });

  it("prefers overrides and the locked viloyat", () => {
    const h = makeStubHost({ lockedViloyat: "Locked" });
    buildWhereForAggregates(h, "viloyat", "Explicit");
    expect(mockBuildWhere).toHaveBeenCalledWith(
      expect.objectContaining({ view: "viloyat", drillViloyat: "Explicit", lockedViloyat: "Locked" }),
    );
    buildWhereForAggregates(h);
    expect(mockBuildWhere).toHaveBeenLastCalledWith(expect.objectContaining({ drillViloyat: "Locked" }));
  });
});

describe("resolveFeatureLayerFromOneUseDataSource", () => {
  beforeEach(() => {
    mockQueryable.mockReset().mockReturnValue(null);
    mockGetInstance.mockReset();
  });
  const host = makeStubHost();

  it("returns null without a map or data source id", async () => {
    expect(await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, makeView(false))).toBeNull();
    expect(await resolveFeatureLayerFromOneUseDataSource(host, undefined, makeView(true))).toBeNull();
    expect(await resolveFeatureLayerFromOneUseDataSource(host, {}, makeView(true))).toBeNull();
  });

  it("matches a jimu layer view by data source id, then by root id", async () => {
    const layer = { id: "L" };
    mockQueryable.mockImplementation((l: unknown) => (l === layer ? layer : null));
    const byId = makeView(true, [{ layerDataSourceId: "a", layer }]);
    expect(await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, byId)).toBe(layer);
    const byRoot = makeView(true, [{ dataSourceId: "root", layer }]);
    expect(
      await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "x", rootDataSourceId: "root" }, byRoot),
    ).toBe(layer);
  });

  it("falls back to the data source getLayer()", async () => {
    const layer = { id: "viaDs" };
    mockGetInstance.mockReturnValue({ getDataSource: () => ({ getLayer: () => Promise.resolve(layer) }) });
    mockQueryable.mockImplementation((l: unknown) => (l === layer ? layer : null));
    expect(await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, makeView(true))).toBe(layer);
  });

  it("falls back to matching a map layer by url", async () => {
    const mapLayer = { url: "http://u" };
    mockGetInstance.mockReturnValue({ getDataSource: () => ({ url: "http://u" }) });
    mockQueryable.mockImplementation((l: unknown) => (l === mapLayer ? mapLayer : null));
    expect(
      await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, makeView(true, [], [mapLayer])),
    ).toBe(mapLayer);
  });

  it("returns null when nothing resolves or the manager throws", async () => {
    mockGetInstance.mockReturnValue({ getDataSource: (): null => null });
    expect(await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, makeView(true))).toBeNull();
    mockGetInstance.mockImplementation(() => {
      throw new Error("x");
    });
    expect(await resolveFeatureLayerFromOneUseDataSource(host, { dataSourceId: "a" }, makeView(true))).toBeNull();
  });
});

describe("resolveFeatureLayersFromUseDataSources", () => {
  it("collects the resolved layers, skipping misses (immutable or plain lists)", async () => {
    const resolver = jest
      .fn()
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 3 });
    const h = makeStubHost({}, { resolveFeatureLayerFromOneUseDataSource: resolver });
    h.props = {
      ...h.props,
      useDataSources: { asMutable: () => [{ dataSourceId: "a" }, { dataSourceId: "b" }, { dataSourceId: "c" }] },
    } as unknown as RegionWidgetHost["props"];
    const { resolveFeatureLayersFromUseDataSources: fn } = jest.requireActual<
      typeof import("./region-query")
    >("./region-query");
    expect(await fn(h, makeView(true))).toEqual([{ id: 1 }, { id: 3 }]);
    const none = makeStubHost();
    expect(await resolveFeatureLayersFromUseDataSources(none, makeView(true))).toEqual([]);
  });
});

describe("queryAggregates", () => {
  beforeEach(() => mockGroupFeatures.mockReset());

  it("returns nothing without layers", async () => {
    expect(await queryAggregates(makeStubHost(), "viloyat")).toEqual([]);
    expect(mockGroupFeatures).not.toHaveBeenCalled();
  });

  it("queries each layer with the stat settings and merges rows by code", async () => {
    mockGroupFeatures.mockImplementation((o: { layer: { id: string } }) =>
      Promise.resolve(
        o.layer.id === "a"
          ? [
              { attributes: { viloyat: "Andijon", region: 1, sum_m: 30 } },
              { attributes: { viloyat: "Buxoro", region: 2, sum_m: 10 } },
            ]
          : [{ attributes: { viloyat: "Andijon", region: 1, sum_m: 20 } }],
      ),
    );
    const layerA = { id: "a", loaded: true, objectIdField: "FID" };
    const layerB = { id: "b", loaded: false, load: jest.fn().mockRejectedValue(new Error("x")) };
    const h = makeStubHost(
      { featureLayers: [layerA, layerB] as unknown as __esri.FeatureLayer[], areaField: "maydon", statMode: "sum" },
      { buildWhereForAggregates: jest.fn(() => "DEFAULT") },
    );
    const rows = await queryAggregates(h, "viloyat", undefined, "region");
    expect(rows.map((r) => [r.name, r.maydon])).toEqual([
      ["Andijon", 50],
      ["Buxoro", 10],
    ]);
    expect(layerB.load).toHaveBeenCalled();
    expect(mockGroupFeatures).toHaveBeenCalledWith(
      expect.objectContaining({
        where: "DEFAULT",
        groupField: "viloyat",
        codeField: "region",
        statMode: "sum",
        areaField: "maydon",
        objectIdField: "FID",
      }),
    );
    expect(mockGroupFeatures).toHaveBeenCalledWith(expect.objectContaining({ objectIdField: "OBJECTID" }));
  });

  it("falls back to the single featureLayer and the count stat", async () => {
    mockGroupFeatures.mockResolvedValue([{ attributes: { tuman: "Asaka", cnt_m: 4 } }]);
    const h = makeStubHost({
      featureLayer: { loaded: true } as unknown as __esri.FeatureLayer,
      statMode: "count",
    });
    const rows = await queryAggregates(h, "tuman", "W");
    expect(rows).toEqual([{ name: "Asaka", maydon: 4 }]);
    expect(mockGroupFeatures).toHaveBeenCalledWith(expect.objectContaining({ where: "W", codeField: null }));
  });
});

describe("fetchRegionalData", () => {
  const filters = (yil: string) => ({ ...makeStubHost().state.currentFilters, yil });
  const rows = [
    { name: "A", maydon: 30 },
    { name: "B", maydon: 10 },
  ];
  const withHost = (state: Parameters<typeof makeStubHost>[0] = {}, over: Parameters<typeof makeStubHost>[1] = {}) =>
    makeStubHost(
      { currentFilters: filters("2024"), ...state },
      { buildWhereForAggregates: jest.fn(() => "W"), queryAggregates: jest.fn().mockResolvedValue(rows), ...over },
    );

  beforeEach(() => {
    mockWaitPack.mockReset().mockResolvedValue(undefined);
    mockGetPack.mockReset().mockReturnValue({});
    mockMatchPack.mockReset().mockReturnValue(null);
  });

  it("does nothing when unmounted or not connected", async () => {
    const h = withHost({ connectionStatus: "idle" });
    await fetchRegionalData(h);
    await fetchRegionalData(withHost({}, { _isMounted: false }));
    expect(h.setState).not.toHaveBeenCalled();
  });

  it("resets to an empty viloyat view without a year", async () => {
    const h = withHost({ currentFilters: filters(""), currentView: "tuman", selectedRegion: "X" });
    await fetchRegionalData(h);
    expect(h.state).toMatchObject({
      currentView: "viloyat",
      selectedRegion: null,
      regionalData: { viloyatlar: [], tumanlar: [], totalArea: 0 },
    });
    expect(h.queryAggregates).not.toHaveBeenCalled();
  });

  it("queries the viloyat list and computes percentages", async () => {
    const h = withHost();
    await fetchRegionalData(h);
    expect(h.queryAggregates).toHaveBeenCalledWith("viloyat", "W", "region");
    expect(h.state.regionalLoading).toBe(false);
    expect(h.state.regionalData.totalArea).toBe(40);
    expect(h.state.regionalData.viloyatlar.map((r) => r.percentage)).toEqual([75, 25]);
    expect(h.state.regionalData.tumanlar).toEqual([]);
  });

  it("queries tumans for a drilled viloyat and syncs the view", async () => {
    const h = withHost(
      { selectedViloyatForDrillDown: "Andijon" },
      { resolveDisplayCountForData: jest.fn(() => 2) },
    );
    await fetchRegionalData(h);
    expect(h.buildWhereForAggregates).toHaveBeenCalledWith("tuman", "Andijon");
    expect(h.queryAggregates).toHaveBeenCalledWith("tuman", "W", "district");
    expect(h.state.currentView).toBe("tuman");
    expect(h.state.regionalData.tumanlar).toHaveLength(2);
    expect(h.state.displayCount).toBe(2);
  });

  it("switches back to the viloyat view when the effective view is viloyat", async () => {
    const h = withHost({ currentView: "tuman" });
    await fetchRegionalData(h);
    expect(h.state.currentView).toBe("viloyat");
    expect(h.state.selectedViloyatForDrillDown).toBeNull();
  });

  it("prefers a matching dashboard pack over a query", async () => {
    mockMatchPack.mockReturnValue({ totalArea: 200, rows: [{ name: "P", maydon: 50, percentage: 25 }] });
    const h = withHost();
    await fetchRegionalData(h);
    expect(h.queryAggregates).not.toHaveBeenCalled();
    expect(mockWaitPack).toHaveBeenCalledWith(2500);
    expect(h.state.regionalData).toEqual({
      viloyatlar: [{ name: "P", maydon: 50, percentage: 25 }],
      tumanlar: [],
      totalArea: 200,
    });
  });

  it("reports a load error", async () => {
    const h = withHost({}, { queryAggregates: jest.fn().mockRejectedValue(new Error("boom")) });
    await fetchRegionalData(h);
    expect(h.state.regionalError).toBe("Failed to load data: boom");
    expect(h.state.regionalLoading).toBe(false);
  });

  it("drops a superseded response", async () => {
    let release: (v: unknown) => void = () => undefined;
    const slow = new Promise((r) => {
      release = r;
    });
    const h = withHost({}, { queryAggregates: jest.fn(() => slow) });
    const first = fetchRegionalData(h);
    await Promise.resolve();
    h._regionalRequestId += 1;
    release(rows);
    await first;
    expect(h.state.regionalData.viloyatlar).toEqual([]);
  });

  it("drops a superseded error", async () => {
    let fail: (e: unknown) => void = () => undefined;
    const slow = new Promise((_, rej) => {
      fail = rej;
    });
    const h = withHost({}, { queryAggregates: jest.fn(() => slow) });
    const first = fetchRegionalData(h);
    await Promise.resolve();
    h._regionalRequestId += 1;
    fail(new Error("late"));
    await first;
    expect(h.state.regionalError).toBeNull();
  });
});

describe("fetchRegionalDataDeduped", () => {
  it("fetches once per distinct year/view/drill/lock key", async () => {
    const h = makeStubHost({ currentFilters: { ...makeStubHost().state.currentFilters, yil: "2024" } });
    await fetchRegionalDataDeduped(h);
    await fetchRegionalDataDeduped(h);
    expect(h.fetchRegionalData).toHaveBeenCalledTimes(1);
    h.state = { ...h.state, currentView: "tuman", selectedViloyatForDrillDown: "A" };
    await fetchRegionalDataDeduped(h);
    expect(h.fetchRegionalData).toHaveBeenCalledTimes(2);
  });
});
