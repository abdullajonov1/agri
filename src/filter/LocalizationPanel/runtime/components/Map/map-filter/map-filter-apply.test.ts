jest.mock("../../../../../localization/map-zoom-policy", () => ({
  decideMapSurfaceCover: jest.fn(),
  shouldDeferCropForFastReveal: jest.fn(),
  shouldDeferVhUniqueIdResolve: jest.fn(),
  buildDefinitionExpressionDigest: jest.fn(),
  isGeographyZoomReason: jest.fn(),
  shouldNavigateMapZoom: jest.fn(),
  isEmptyMapExtent: jest.fn(),
}));
jest.mock("../../../../../localization/map-filter-apply", () => ({
  isShownRegionYearLayerOpaque: jest.fn(),
}));
jest.mock("../../../../../../gis/agri-admin-boundary-layer", () => ({
  clearAgriAdminBoundaries: jest.fn(),
  syncAgriAdminBoundaries: jest.fn(),
  queryAgriAdminBoundaryExtentOnly: jest.fn(),
}));
jest.mock("../../../../../localization/map-zoom-target", () => ({
  zoomGoToDurationMsForReason: jest.fn(),
  isDistrictZoomPath: jest.fn(),
  districtAdminExpandFactor: jest.fn(),
  districtFallbackRegionExpandFactor: jest.fn(),
  shouldSkipHomeGoTo: jest.fn(),
  pickHomeExtentCandidate: jest.fn(),
  homeGoToDurationMs: jest.fn(),
  preferShownRegionYearExtent: jest.fn(),
  raceRegionExtentPick: jest.fn(),
  planCropNdviExtentSource: jest.fn(),
  zoomExpandFactorForReason: jest.fn(),
}));
jest.mock("../../../../../localization/map-shown-extent", () => ({
  collectShownRegionYearQueryTargets: jest.fn(),
  readQueryableDefinitionExpression: jest.fn(),
  unionMapExtents: jest.fn(),
  unionShownRegionYearFullExtents: jest.fn(),
  canQuerySpatialFeatureExtent: jest.fn(),
  readSpatialFeatureExtentWhere: jest.fn(),
  appendSpatialFeatureExtent: jest.fn(),
}));
jest.mock("../../../../../../gis/feature-layer-data", () => ({
  getDetachedQueryLayerFor: jest.fn(),
  isMapImageOwnedLayer: jest.fn(),
  safeLoadMapLayer: jest.fn(),
}));
jest.mock("../../localization-log", () => ({
  agriLog: jest.fn(),
  debugCatch: jest.fn(),
}));

import * as policy from "../../../../../localization/map-zoom-policy";
import * as target from "../../../../../localization/map-zoom-target";
import * as shown from "../../../../../localization/map-shown-extent";
import * as admin from "../../../../../../gis/agri-admin-boundary-layer";
import * as fld from "../../../../../../gis/feature-layer-data";
import { isShownRegionYearLayerOpaque } from "../../../../../localization/map-filter-apply";
import { makeFakeHost, type FakeHost, type FakeHostInit } from "../../__test-utils__/fake-host";
import { applyMapFiltersOptimized } from "./map-filter-apply";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;

interface FakeExtent { empty: boolean; expand: jest.Mock }
const extent = (empty = false): FakeExtent => {
  const e: FakeExtent = { empty, expand: jest.fn() };
  e.expand.mockReturnValue(e);
  return e;
};
const asExt = (e: FakeExtent | null): __esri.Extent => e as unknown as __esri.Extent;

interface FakeView {
  animation: { state: string; stop: jest.Mock } | null;
  goTo: jest.Mock;
  map: { fullExtent: FakeExtent | null };
}
const makeView = (): FakeView => ({
  animation: null,
  goTo: jest.fn(() => Promise.resolve()),
  map: { fullExtent: null },
});

const flush = async (): Promise<void> => {
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
};

const layerOf = (props: Record<string, unknown> = {}): __esri.FeatureLayer =>
  ({ fullExtent: null, geometryType: "polygon", createQuery: () => ({}), queryExtent: jest.fn(), ...props }) as unknown as __esri.FeatureLayer;

type ActiveView = NonNullable<FakeHost["state"]["activeMapView"]>;
interface Setup { host: FakeHost; view: FakeView }
const setup = (init: FakeHostInit = {}, view: FakeView = makeView()): Setup => {
  const host = makeFakeHost({
    applyFiltersPersistent: jest.fn(() => Promise.resolve()),
    resolveVhMapUniqueIds: jest.fn(() => Promise.resolve(null)),
    fetchDataWithCurrentState: jest.fn(() => Promise.resolve()),
    syncCropRenderer: jest.fn(() => Promise.resolve()),
    waitForShownRegionYearRedraw: jest.fn(() => Promise.resolve()),
    setShownRegionYearOpacity: jest.fn(),
    scheduleShownRegionYearSettleRepaint: jest.fn(),
    zoomToSelectedDistrict: jest.fn(() => Promise.resolve(false)),
    getAdminBoundarySelection: jest.fn(() => ({ viloyat: "", tuman: "" })),
    ...init,
    state: {
      connectionStatus: "connected",
      featureLayer: layerOf(),
      featureLayers: [],
      activeMapView: { view } as unknown as ActiveView,
      ...init.state,
    },
  });
  return { host, view };
};

beforeEach(() => {
  jest.clearAllMocks();
  (window as unknown as { requestAnimationFrame: (cb: () => void) => number }).requestAnimationFrame = (cb) => { cb(); return 0; };
  m(policy.decideMapSurfaceCover).mockReturnValue({ coverMap: false, coverReason: "r", vhOnly: false });
  m(policy.shouldDeferCropForFastReveal).mockReturnValue(false);
  m(policy.shouldDeferVhUniqueIdResolve).mockReturnValue(false);
  m(policy.buildDefinitionExpressionDigest).mockReturnValue("digest");
  m(policy.isGeographyZoomReason).mockReturnValue(false);
  m(policy.shouldNavigateMapZoom).mockReturnValue(true);
  m(policy.isEmptyMapExtent).mockImplementation((e: FakeExtent | null) => !e || e.empty);
  m(target.zoomGoToDurationMsForReason).mockReturnValue(100);
  m(target.isDistrictZoomPath).mockReturnValue(false);
  m(target.districtAdminExpandFactor).mockReturnValue(1.1);
  m(target.districtFallbackRegionExpandFactor).mockReturnValue(1.2);
  m(target.shouldSkipHomeGoTo).mockReturnValue(false);
  m(target.pickHomeExtentCandidate).mockReturnValue(null);
  m(target.homeGoToDurationMs).mockReturnValue(50);
  m(target.preferShownRegionYearExtent).mockReturnValue(false);
  m(target.planCropNdviExtentSource).mockReturnValue("none");
  m(target.zoomExpandFactorForReason).mockReturnValue(1.5);
  m(shown.collectShownRegionYearQueryTargets).mockReturnValue([]);
  m(shown.unionMapExtents).mockReturnValue(null);
  m(shown.unionShownRegionYearFullExtents).mockReturnValue(null);
  m(admin.syncAgriAdminBoundaries).mockResolvedValue({ extent: null, level: "none" });
  m(admin.queryAgriAdminBoundaryExtentOnly).mockResolvedValue({ extent: null, level: "none" });
  m(admin.clearAgriAdminBoundaries).mockResolvedValue(undefined);
  m(isShownRegionYearLayerOpaque).mockReturnValue(false);
});

describe("applyMapFiltersOptimized guards", () => {
  it("returns when unmounted, disconnected, or without a layer", async () => {
    const a = setup({ _isMounted: false });
    await applyMapFiltersOptimized(a.host);
    const b = setup({ state: { connectionStatus: "failed" } });
    await applyMapFiltersOptimized(b.host);
    const c = setup({ state: { featureLayer: null, featureLayers: [] } });
    await applyMapFiltersOptimized(c.host);
    for (const s of [a, b, c]) expect(s.host.applyFiltersPersistent).not.toHaveBeenCalled();
  });
});

describe("applyMapFiltersOptimized apply phase", () => {
  it("covers the map with a spinner and clears it when finished", async () => {
    m(policy.decideMapSurfaceCover).mockReturnValue({ coverMap: true, coverReason: "region", vhOnly: false });
    const { host } = setup({ getEffectiveViloyat: () => "Andijon" });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "region" });
    expect(host.setMapSurfaceLoading).toHaveBeenNthCalledWith(1, true, "region");
    expect(host.setMapSurfaceLoading).toHaveBeenLastCalledWith(false, "region");
    expect(host._mapSurfaceLoadingToken).toBe(1);
  });

  it("dismisses overlay early for fast-reveal reasons and defers crop sync", async () => {
    m(policy.decideMapSurfaceCover).mockReturnValue({ coverMap: true, coverReason: "region", vhOnly: false });
    m(policy.shouldDeferCropForFastReveal).mockReturnValue(true);
    const { host } = setup({
      state: { cropRendererMode: "on" },
      _lastShownRegionYearLayers: [{ layer: { opacity: 1 } } as never],
    });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "region" });
    await flush();
    expect(host.setMapSurfaceLoading).toHaveBeenCalledTimes(2);
    expect(host.waitForShownRegionYearRedraw).toHaveBeenCalledWith(false);
    expect(host.syncCropRenderer).toHaveBeenCalledTimes(1);
  });

  it("syncs crop synchronously and awaits redraw for non-deferred year changes", async () => {
    const { host } = setup({
      state: { cropRendererMode: "on" },
      _lastShownRegionYearLayers: [{ layer: { opacity: 1 } } as never],
    });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "year" });
    expect(host.syncCropRenderer).toHaveBeenCalledTimes(1);
    expect(host.waitForShownRegionYearRedraw).toHaveBeenCalledWith(false);
  });

  it("skips crop sync while a VH filter is active", async () => {
    const { host } = setup({
      state: { cropRendererMode: "on", vh: "good" },
      _lastShownRegionYearLayers: [{ layer: { opacity: 1 } } as never],
    });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "other" });
    expect(host.syncCropRenderer).not.toHaveBeenCalled();
  });

  it("reveals the layer at full opacity when it was hidden and flags VH no-data", async () => {
    m(policy.decideMapSurfaceCover).mockReturnValue({ coverMap: false, coverReason: "r", vhOnly: true });
    const { host } = setup({
      _vhMapUniqueIds: [],
      state: { vh: "bad" },
      _lastShownRegionYearLayers: [{ layer: { opacity: 0 } } as never],
    });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "vegetation" });
    expect(host.setShownRegionYearOpacity).toHaveBeenCalledWith(1);
    expect(host.waitForShownRegionYearRedraw).toHaveBeenCalledWith(false);
    expect(host.setMapNoData).toHaveBeenCalledWith(true, "vegetation");
  });

  it("does not mark no-data when the apply went stale", async () => {
    const { host } = setup({
      applyFiltersPersistent: jest.fn(() => {
        host._zoomRequestId += 1;
        return Promise.resolve();
      }),
    });
    await applyMapFiltersOptimized(host);
    expect(host.setMapNoData).not.toHaveBeenCalled();
    expect(host._deferVhUniqueIdResolve).toBe(false);
  });

  it("resolves VH ids in the background and rebroadcasts on success", async () => {
    m(policy.shouldDeferVhUniqueIdResolve).mockReturnValue(true);
    const { host } = setup({ state: { vh: "good" } });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "crop" });
    await flush();
    expect(host.resolveVhMapUniqueIds).toHaveBeenCalledTimes(1);
    expect(host.applyFiltersPersistent).toHaveBeenLastCalledWith(expect.any(Function), { vhDeferredSecondPass: true });
    expect(host._vhUniqueIdsReadyForApply).toBe(true);
    expect(host.broadcastFilterState).toHaveBeenCalled();
    expect(host.fetchDataWithCurrentState).toHaveBeenCalled();
  });

  it("keeps turi-only paint when deferred VH resolve fails", async () => {
    m(policy.shouldDeferVhUniqueIdResolve).mockReturnValue(true);
    const { host } = setup({
      state: { vh: "good" },
      resolveVhMapUniqueIds: jest.fn(() => Promise.reject(new Error("x"))),
    });
    await applyMapFiltersOptimized(host, { mode: "none", reason: "crop" });
    await flush();
    expect(host._suppressLegacyVhOnMap).toBe(true);
    expect(host.broadcastFilterState).toHaveBeenCalled();
  });
});

describe("applyMapFiltersOptimized admin boundary + skip", () => {
  it("clears boundaries when no geography is selected and skips zoom", async () => {
    m(policy.shouldNavigateMapZoom).mockReturnValue(false);
    const { host, view } = setup({ state: { polygonMode: true } });
    await applyMapFiltersOptimized(host);
    expect(admin.clearAgriAdminBoundaries).toHaveBeenCalledWith(view);
    expect(host._prevDefinitionExpression).toBe("digest");
    expect(host._prevPolygonModeForZoomGuard).toBe(true);
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it("syncs boundaries for a selection and tolerates failures", async () => {
    m(policy.shouldNavigateMapZoom).mockReturnValue(false);
    const sel = { viloyat: "Andijon", tuman: "" };
    m(admin.syncAgriAdminBoundaries).mockRejectedValueOnce(new Error("sync"));
    const { host, view } = setup({ getAdminBoundarySelection: jest.fn(() => sel) });
    await applyMapFiltersOptimized(host);
    expect(admin.syncAgriAdminBoundaries).toHaveBeenCalledWith(view, sel);
  });

  it("schedules a settle repaint for geography zooms (with and without navigation)", async () => {
    m(policy.isGeographyZoomReason).mockReturnValue(true);
    m(policy.shouldNavigateMapZoom).mockReturnValue(false);
    const a = setup({ getEffectiveViloyat: () => "Andijon" });
    await applyMapFiltersOptimized(a.host, { mode: "none", reason: "region" });
    expect(a.host.scheduleShownRegionYearSettleRepaint).toHaveBeenCalledWith(1, 150, "after-region");
    m(policy.shouldNavigateMapZoom).mockReturnValue(true);
    const b = setup({ getEffectiveViloyat: () => "Andijon" });
    await applyMapFiltersOptimized(b.host, { mode: "selection", reason: "region" });
    expect(b.host.scheduleShownRegionYearSettleRepaint).toHaveBeenCalledWith(1, 220, "after-region");
  });
});

describe("applyMapFiltersOptimized navigation", () => {
  it("district zoom uses the admin boundary extent when available", async () => {
    const ext = extent();
    m(target.isDistrictZoomPath).mockReturnValue(true);
    m(admin.queryAgriAdminBoundaryExtentOnly).mockResolvedValue({ extent: ext, level: "district" });
    const { host, view } = setup({
      state: { tuman: "T" },
      getAdminBoundarySelection: jest.fn(() => ({ viloyat: "V", tuman: "T" })),
    });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "district" });
    expect(ext.expand).toHaveBeenCalledWith(1.1);
    expect(view.goTo).toHaveBeenCalledWith(ext, expect.objectContaining({ duration: 700 }));
    expect(host.zoomToSelectedDistrict).not.toHaveBeenCalled();
    expect(host._allowClearOnce).toBe(false);
  });

  it("district zoom falls back to the district feature zoom", async () => {
    m(target.isDistrictZoomPath).mockReturnValue(true);
    const { host, view } = setup({
      state: { tuman: "T" },
      zoomToSelectedDistrict: jest.fn(() => Promise.resolve(true)),
    });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "district" });
    expect(host.zoomToSelectedDistrict).toHaveBeenCalledWith(view);
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it("district zoom falls back to the shown region extent, then to admin extent", async () => {
    const field = extent();
    m(target.isDistrictZoomPath).mockReturnValue(true);
    m(shown.collectShownRegionYearQueryTargets).mockReturnValue([{}]);
    m(shown.readQueryableDefinitionExpression).mockReturnValue("w=1");
    const detached = { createQuery: () => ({}), queryExtent: jest.fn(() => Promise.resolve({ extent: field })) };
    m(fld.getDetachedQueryLayerFor).mockResolvedValue(detached);
    m(shown.unionMapExtents).mockReturnValue(field);
    const a = setup({ state: { tuman: "T" }, _lastShownRegionYearLayers: [{ layer: {} } as never] });
    await applyMapFiltersOptimized(a.host, { mode: "selection", reason: "district" });
    expect(field.expand).toHaveBeenCalledWith(1.2);
    expect(a.view.goTo).toHaveBeenCalledTimes(1);

    m(shown.unionMapExtents).mockReturnValue(null);
    const adminExt = extent();
    m(admin.queryAgriAdminBoundaryExtentOnly)
      .mockResolvedValueOnce({ extent: null, level: "none" })
      .mockResolvedValueOnce({ extent: adminExt, level: "district" });
    const b = setup({
      state: { tuman: "T" },
      getAdminBoundarySelection: jest.fn(() => ({ viloyat: "V", tuman: "T" })),
    });
    await applyMapFiltersOptimized(b.host, { mode: "selection", reason: "district" });
    expect(adminExt.expand).toHaveBeenCalledWith(1.1);
  });

  it("home mode goes to the picked home extent and records the time", async () => {
    const home = extent();
    m(target.pickHomeExtentCandidate).mockReturnValue(home);
    const { host, view } = setup();
    await applyMapFiltersOptimized(host, { mode: "home", reason: "other" });
    expect(admin.clearAgriAdminBoundaries).toHaveBeenCalledWith(view);
    expect(view.goTo).toHaveBeenCalledWith(home, expect.objectContaining({ duration: 50 }));
    expect(host._lastHomeGoToAt).toBeGreaterThan(0);
  });

  it("home mode queries the layer extent when no candidate exists; skips when throttled", async () => {
    const qe = extent();
    const layer = layerOf({ queryExtent: jest.fn(() => Promise.resolve({ extent: qe })) });
    const a = setup({ state: { featureLayer: layer } });
    await applyMapFiltersOptimized(a.host, { mode: "home", reason: "other" });
    expect(a.view.goTo).toHaveBeenCalledWith(qe, expect.anything());

    m(target.shouldSkipHomeGoTo).mockReturnValue(true);
    const b = setup();
    await applyMapFiltersOptimized(b.host, { mode: "home", reason: "other" });
    expect(b.view.goTo).not.toHaveBeenCalled();
  });

  it("home mode survives a failing queryExtent", async () => {
    const layer = layerOf({ queryExtent: jest.fn(() => Promise.reject(new Error("q"))) });
    const { host, view } = setup({ state: { featureLayer: layer } });
    await applyMapFiltersOptimized(host, { mode: "home", reason: "other" });
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it("region zoom races field vs admin and uses the field extent", async () => {
    const ext = extent();
    m(target.preferShownRegionYearExtent).mockReturnValue(true);
    m(target.raceRegionExtentPick).mockResolvedValue({ source: "field", extent: ext });
    const { host, view } = setup();
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "region" });
    expect(ext.expand).toHaveBeenCalledWith(1.5);
    expect(view.goTo).toHaveBeenCalledWith(ext, expect.objectContaining({ duration: 100 }));
  });

  it("region zoom accepts an admin-region pick", async () => {
    const ext = extent();
    m(target.preferShownRegionYearExtent).mockReturnValue(true);
    m(target.raceRegionExtentPick).mockResolvedValue({ source: "admin-region", extent: ext });
    const { host, view } = setup({ getEffectiveViloyat: () => "V" });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "region" });
    expect(view.goTo).toHaveBeenCalledTimes(1);
  });

  it("stops a running animation before goTo and swallows AbortError", async () => {
    const ext = extent();
    m(target.preferShownRegionYearExtent).mockReturnValue(true);
    m(target.raceRegionExtentPick).mockResolvedValue({ source: "field", extent: ext });
    const view = makeView();
    view.animation = { state: "running", stop: jest.fn() };
    view.goTo.mockRejectedValue(Object.assign(new Error("a"), { name: "AbortError" }));
    const { host } = setup({}, view);
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "region" });
    expect(view.animation.stop).toHaveBeenCalled();
  });

  it("logs non-abort goTo failures without throwing", async () => {
    const ext = extent();
    m(target.preferShownRegionYearExtent).mockReturnValue(true);
    m(target.raceRegionExtentPick).mockResolvedValue({ source: "field", extent: ext });
    const view = makeView();
    view.goTo.mockRejectedValue(new Error("fail"));
    const { host } = setup({}, view);
    await expect(applyMapFiltersOptimized(host, { mode: "selection", reason: "region" })).resolves.toBeUndefined();
  });

  it("crop/NDVI zoom unions non-MapImage spatial layers", async () => {
    const ext = extent();
    m(fld.isMapImageOwnedLayer).mockImplementation((l: { owned?: boolean }) => Boolean(l.owned));
    m(shown.canQuerySpatialFeatureExtent).mockReturnValue(true);
    m(shown.readSpatialFeatureExtentWhere).mockReturnValue("uid IN (1)");
    m(shown.appendSpatialFeatureExtent).mockImplementation((_a: unknown, b: unknown) => b);
    const q = jest.fn(() => Promise.resolve({ extent: ext }));
    const spatial = { load: jest.fn(), createQuery: () => ({}), queryExtent: q };
    const owned = { owned: true };
    m(fld.safeLoadMapLayer).mockResolvedValue(undefined);
    const { host, view } = setup({
      state: { spatialMapLayers: [owned, spatial] as never },
    });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "crop" });
    expect(q).toHaveBeenCalledTimes(1);
    expect(fld.safeLoadMapLayer).toHaveBeenCalledWith(spatial);
    expect(view.goTo).toHaveBeenCalledWith(ext, expect.anything());
  });

  it("crop zoom falls back to the shown extent per plan; layers skipped when no WHERE", async () => {
    const shownExt = extent();
    m(shown.canQuerySpatialFeatureExtent).mockReturnValue(true);
    m(shown.readSpatialFeatureExtentWhere).mockReturnValue("");
    m(target.planCropNdviExtentSource).mockReturnValue("fallback-shown");
    m(shown.unionShownRegionYearFullExtents).mockReturnValue(shownExt);
    const spatial = { createQuery: () => ({}), queryExtent: jest.fn() };
    const { host, view } = setup({ state: { spatialMapLayers: [spatial] as never } });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "crop" });
    expect(spatial.queryExtent).not.toHaveBeenCalled();
    expect(view.goTo).toHaveBeenCalledWith(shownExt, expect.anything());
  });

  it("narrow-shown plan keeps merged extent when shown extent is empty", async () => {
    const merged = extent();
    m(shown.canQuerySpatialFeatureExtent).mockReturnValue(true);
    m(shown.readSpatialFeatureExtentWhere).mockReturnValue("w");
    m(shown.appendSpatialFeatureExtent).mockReturnValue(merged);
    m(target.planCropNdviExtentSource).mockReturnValue("narrow-shown");
    const spatial = { createQuery: () => ({}), queryExtent: jest.fn(() => Promise.resolve({ extent: merged })) };
    const { host, view } = setup({ state: { spatialMapLayers: [spatial] as never } });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "crop" });
    expect(view.goTo).toHaveBeenCalledWith(merged, expect.anything());
  });

  it("without extent and without viloyat, zooms to home fallback; otherwise logs no-extent", async () => {
    const homeExt = extent();
    const a = setup({ _homeExtent: asExt(homeExt) });
    await applyMapFiltersOptimized(a.host, { mode: "selection", reason: "crop" });
    expect(a.view.goTo).toHaveBeenCalledWith(homeExt, expect.anything());

    const b = setup({ getEffectiveViloyat: () => "V" });
    await applyMapFiltersOptimized(b.host, { mode: "selection", reason: "crop" });
    expect(b.view.goTo).not.toHaveBeenCalled();
  });

  it("repaints boundaries after navigation when a geography is selected", async () => {
    const homeExt = extent();
    const sel = { viloyat: "V", tuman: "" };
    const { host } = setup({ _homeExtent: asExt(homeExt), getAdminBoundarySelection: jest.fn(() => sel), getEffectiveViloyat: () => "" });
    await applyMapFiltersOptimized(host, { mode: "selection", reason: "crop" });
    expect(admin.syncAgriAdminBoundaries).toHaveBeenCalledTimes(2);
  });
});
