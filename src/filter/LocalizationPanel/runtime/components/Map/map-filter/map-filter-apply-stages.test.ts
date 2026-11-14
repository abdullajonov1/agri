jest.mock("../../../../../localization/map-zoom-policy", () => ({
  decideMapSurfaceCover: jest.fn(),
}));
jest.mock("../../../../../localization/map-filter-apply", () => ({
  isShownRegionYearLayerOpaque: jest.fn(),
}));
jest.mock("../../../../../localization/map-zoom-target", () => ({
  zoomGoToDurationMsForReason: jest.fn(),
  isDistrictZoomPath: jest.fn(),
}));
jest.mock("../../localization-log", () => ({ agriLog: jest.fn(), debugCatch: jest.fn() }));
jest.mock("./map-filter-navigation", () => ({
  navigateDistrictZoom: jest.fn(() => Promise.resolve()),
  navigateHomeZoom: jest.fn(() => Promise.resolve()),
  navigateMergedExtentZoom: jest.fn(() => Promise.resolve()),
}));

import * as policy from "../../../../../localization/map-zoom-policy";
import * as target from "../../../../../localization/map-zoom-target";
import { isShownRegionYearLayerOpaque } from "../../../../../localization/map-filter-apply";
import { agriLog } from "../../localization-log";
import * as nav from "./map-filter-navigation";
import { makeFakeHost } from "../../__test-utils__/fake-host";
import { decideCoverStage, runNavigationStage, scheduleSettleRepaintStage, trackPolygonModeExit } from "./map-filter-apply-stages";

const m = (fn: unknown): jest.Mock => fn as jest.Mock;
type Host = Parameters<typeof decideCoverStage>[0];
type Request = Parameters<typeof decideCoverStage>[1];
type NavCtx = Parameters<typeof runNavigationStage>[0];
const asHost = (h: unknown): Host => h as Host;
const request: Request = { mode: "none", reason: "other" };

beforeEach(() => {
  jest.clearAllMocks();
  m(policy.decideMapSurfaceCover).mockReturnValue({ coverMap: true, coverReason: "r", vhOnly: false });
});

describe("decideCoverStage", () => {
  it("passes region/opacity/vh inputs to the policy and echoes expectRegionLayer", () => {
    const host = makeFakeHost({ getEffectiveViloyat: jest.fn(() => " 1 "), _lastShownRegionYearLayers: [{ layer: null, sublayers: [] } as never], _vhMapUniqueIds: [] });
    host.state.vh = "x";
    m(isShownRegionYearLayerOpaque).mockReturnValue(true);
    const result = decideCoverStage(asHost(host), request);
    expect(m(policy.decideMapSurfaceCover).mock.calls[0][0]).toEqual({
      expectRegionLayer: true, alreadyOpaqueRegion: true, zoomReason: "other", vhSelected: true, vhUniqueIdsReady: true,
    });
    expect(result).toEqual({ coverMap: true, coverReason: "r", vhOnly: false, expectRegionLayer: true });
  });

  it("does not check opacity without a viloyat", () => {
    const host = makeFakeHost({ getEffectiveViloyat: jest.fn(() => "") });
    const result = decideCoverStage(asHost(host), request);
    expect(isShownRegionYearLayerOpaque).not.toHaveBeenCalled();
    expect(result.expectRegionLayer).toBe(false);
  });
});

describe("trackPolygonModeExit", () => {
  it("reports an exit only when polygon mode went from on to off, and records the mode", () => {
    const host = makeFakeHost({});
    host._prevPolygonModeForZoomGuard = true;
    host.state.polygonMode = false;
    expect(trackPolygonModeExit(asHost(host))).toBe(true);
    expect(host._prevPolygonModeForZoomGuard).toBe(false);
    expect(trackPolygonModeExit(asHost(host))).toBe(false);
  });
});

describe("scheduleSettleRepaintStage", () => {
  it("uses goTo duration + 120 when navigating, 150 otherwise", () => {
    m(target.zoomGoToDurationMsForReason).mockReturnValue(100);
    const schedule = jest.fn();
    const host = makeFakeHost({ scheduleShownRegionYearSettleRepaint: schedule });
    scheduleSettleRepaintStage(asHost(host), 7, request, true);
    scheduleSettleRepaintStage(asHost(host), 7, request, false);
    expect(schedule).toHaveBeenNthCalledWith(1, 7, 220, "after-other");
    expect(schedule).toHaveBeenNthCalledWith(2, 7, 150, "after-other");
  });
});

describe("runNavigationStage", () => {
  const ctxFor = (mode: string): NavCtx => ({
    host: makeFakeHost({ getEffectiveViloyat: jest.fn(() => "v") }),
    zoomRequest: { mode, reason: "other" },
    adminBoundary: { extent: null, level: "none" },
  }) as unknown as NavCtx;

  it("picks the district, home or merged path", async () => {
    m(target.isDistrictZoomPath).mockReturnValueOnce(true);
    await runNavigationStage(ctxFor("none"));
    await runNavigationStage(ctxFor("home"));
    await runNavigationStage(ctxFor("fit"));
    expect(nav.navigateDistrictZoom).toHaveBeenCalledTimes(1);
    expect(nav.navigateHomeZoom).toHaveBeenCalledTimes(1);
    expect(nav.navigateMergedExtentZoom).toHaveBeenCalledTimes(1);
  });

  it("logs non-abort failures and swallows AbortError", async () => {
    m(nav.navigateMergedExtentZoom).mockRejectedValueOnce(new Error("boom"));
    await runNavigationStage(ctxFor("fit"));
    expect(agriLog).toHaveBeenCalledWith("zoom:navigation-failed", { reason: "other", message: "boom" });
    jest.clearAllMocks();
    const abort = Object.assign(new Error("a"), { name: "AbortError" });
    m(nav.navigateMergedExtentZoom).mockRejectedValueOnce(abort);
    await runNavigationStage(ctxFor("fit"));
    expect(agriLog).not.toHaveBeenCalledWith("zoom:navigation-failed", expect.anything());
  });
});
