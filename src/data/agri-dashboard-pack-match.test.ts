import {
  matchGraffDashboardPack,
  matchGraffPolygonDashboardPack,
  matchIndicatorDashboardPack,
  matchPieDashboardPack,
  matchRegionDashboardPack,
} from "./agri-dashboard-pack-match";
import { emptyDashboardPack, type DashboardPack } from "../types/dashboard-pack";

const W = "yil = 2024";

function readyPack(partial: Partial<DashboardPack> = {}): DashboardPack {
  return emptyDashboardPack({
    phase: "ready",
    region: { view: "viloyat", groupField: "viloyat", where: W, rows: [], totalArea: 0 },
    pie: { where: W, categoryField: "CROP_ID", rows: [], totalValue: 0 },
    indicator: { where: W, statOperation: "sum", attributeField: "MAYDON", value: 5 },
    graff: {
      scopeKey: "k1",
      region: 1,
      district: null,
      cropIds: [],
      startDate: "",
      endDate: "",
      rows: [],
    },
    graffPolygon: { scopeKey: "p1", uniqueid: "{ABC}", regionId: 1, year: 2024, rows: [] },
    ...partial,
  });
}

describe("matchRegionDashboardPack", () => {
  const opts = { view: "viloyat" as const, groupField: "viloyat", where: W, hasVh: true };

  test("matches regardless of VH", () => {
    expect(matchRegionDashboardPack(readyPack(), opts)).not.toBeNull();
  });

  test("rejects non-ready, missing, or mismatched packs", () => {
    expect(matchRegionDashboardPack(readyPack({ phase: "loading-stats" }), opts)).toBeNull();
    expect(matchRegionDashboardPack(readyPack({ region: null }), opts)).toBeNull();
    expect(matchRegionDashboardPack(readyPack(), { ...opts, view: "tuman" })).toBeNull();
    expect(matchRegionDashboardPack(readyPack(), { ...opts, groupField: "tuman" })).toBeNull();
    expect(matchRegionDashboardPack(readyPack(), { ...opts, where: "1=1" })).toBeNull();
  });
});

describe("matchPieDashboardPack", () => {
  const ok = { where: W, hasVh: false };

  test("matches crop_id grouped pack (case-insensitive)", () => {
    expect(matchPieDashboardPack(readyPack(), ok)).not.toBeNull();
  });

  test("rejects VH, deferred, non-ready, missing, where mismatch", () => {
    expect(matchPieDashboardPack(readyPack(), { ...ok, hasVh: true })).toBeNull();
    expect(matchPieDashboardPack(readyPack({ statsDeferredToPanels: true }), ok)).toBeNull();
    expect(matchPieDashboardPack(readyPack({ phase: "warming" }), ok)).toBeNull();
    expect(matchPieDashboardPack(readyPack({ pie: null }), ok)).toBeNull();
    expect(matchPieDashboardPack(readyPack(), { ...ok, where: "x" })).toBeNull();
  });

  test("rejects stale packs grouped by legacy turi field", () => {
    const pack = readyPack({ pie: { where: W, categoryField: "turi", rows: [], totalValue: 0 } });
    expect(matchPieDashboardPack(pack, ok)).toBeNull();
  });
});

describe("matchIndicatorDashboardPack", () => {
  const ok = { where: W, hasVh: false };

  test("defaults attribute field to maydon (case-insensitive)", () => {
    expect(matchIndicatorDashboardPack(readyPack(), ok)?.value).toBe(5);
  });

  test("rejects other fields, VH, deferred, where mismatch, missing, error phase", () => {
    expect(matchIndicatorDashboardPack(readyPack(), { ...ok, attributeField: "area" })).toBeNull();
    expect(matchIndicatorDashboardPack(readyPack(), { ...ok, hasVh: true })).toBeNull();
    expect(matchIndicatorDashboardPack(readyPack({ statsDeferredToPanels: true }), ok)).toBeNull();
    expect(matchIndicatorDashboardPack(readyPack(), { ...ok, where: "x" })).toBeNull();
    expect(matchIndicatorDashboardPack(readyPack({ indicator: null }), ok)).toBeNull();
    expect(matchIndicatorDashboardPack(readyPack({ phase: "error" }), ok)).toBeNull();
  });
});

describe("matchGraffDashboardPack", () => {
  test("matches by scopeKey even with VH", () => {
    expect(matchGraffDashboardPack(readyPack(), { scopeKey: "k1", hasVh: true })).not.toBeNull();
  });

  test("rejects augment, non-ready, missing, key mismatch", () => {
    const ok = { scopeKey: "k1", hasVh: false };
    expect(matchGraffDashboardPack(readyPack(), { ...ok, canAugmentExisting: true })).toBeNull();
    expect(matchGraffDashboardPack(readyPack({ phase: "idle" }), ok)).toBeNull();
    expect(matchGraffDashboardPack(readyPack({ graff: null }), ok)).toBeNull();
    expect(matchGraffDashboardPack(readyPack(), { ...ok, scopeKey: "k2" })).toBeNull();
  });
});

describe("matchGraffPolygonDashboardPack", () => {
  const ok = { scopeKey: "p1", uniqueid: "abc" };

  test("matches normalized uniqueid in ready or loading-stats phase", () => {
    expect(matchGraffPolygonDashboardPack(readyPack(), ok)).not.toBeNull();
    expect(
      matchGraffPolygonDashboardPack(readyPack({ phase: "loading-stats" }), {
        scopeKey: "p1",
        uniqueid: " {abc} ",
      }),
    ).not.toBeNull();
  });

  test("rejects other phases, missing pack, empty/mismatched id, scope mismatch", () => {
    expect(matchGraffPolygonDashboardPack(readyPack({ phase: "warming" }), ok)).toBeNull();
    expect(matchGraffPolygonDashboardPack(readyPack({ graffPolygon: null }), ok)).toBeNull();
    expect(matchGraffPolygonDashboardPack(readyPack(), { ...ok, uniqueid: "" })).toBeNull();
    expect(matchGraffPolygonDashboardPack(readyPack(), { ...ok, uniqueid: "abd" })).toBeNull();
    expect(matchGraffPolygonDashboardPack(readyPack(), { ...ok, scopeKey: "p2" })).toBeNull();
  });
});
