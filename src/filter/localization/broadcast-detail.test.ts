import {
  buildBarCategoryBroadcast,
  buildBroadcastGeoSnapshot,
  isBroadcastGeoCurrent,
  normalizeTurlarList,
  resolveVhUniqueidSlices,
} from "./broadcast-detail";
import type { ChartDim, ChartFilterFlags } from "../../gis/agri-chart-filter-order";

describe("normalizeTurlarList", () => {
  test("dedupes, normalizes apostrophes, drops blanks", () => {
    expect(normalizeTurlarList(["G‘o‘za ", "G'o'za", "", null])).toEqual([
      "G'o'za",
    ]);
  });

  test("wraps scalar and uses fallback when empty", () => {
    expect(normalizeTurlarList("Bug'doy")).toEqual(["Bug'doy"]);
    expect(normalizeTurlarList(undefined, "Paxta")).toEqual(["Paxta"]);
    expect(normalizeTurlarList(null)).toEqual([]);
  });
});

describe("resolveVhUniqueidSlices", () => {
  test("no VH selection returns nulls", () => {
    expect(
      resolveVhUniqueidSlices({
        vh: "",
        tuman: "",
        vhMapUniqueIds: ["a"],
        vhRegionChartUniqueIds: ["b"],
      }),
    ).toEqual({ vhUniqueids: null, vhRegionChartUniqueids: null });
  });

  test("copies region chart ids when present", () => {
    const map = ["a"];
    const region = ["b"];
    const out = resolveVhUniqueidSlices({
      vh: "2-Yaxshi",
      tuman: "x",
      vhMapUniqueIds: map,
      vhRegionChartUniqueIds: region,
    });
    expect(out).toEqual({ vhUniqueids: ["a"], vhRegionChartUniqueids: ["b"] });
    expect(out.vhUniqueids).not.toBe(map);
    expect(out.vhRegionChartUniqueids).not.toBe(region);
  });

  test("falls back to map ids only when no tuman selected", () => {
    expect(
      resolveVhUniqueidSlices({
        vh: "2-Yaxshi",
        tuman: " ",
        vhMapUniqueIds: ["a"],
        vhRegionChartUniqueIds: null,
      }).vhRegionChartUniqueids,
    ).toEqual(["a"]);
    expect(
      resolveVhUniqueidSlices({
        vh: "2-Yaxshi",
        tuman: "Olot",
        vhMapUniqueIds: ["a"],
        vhRegionChartUniqueIds: undefined,
      }).vhRegionChartUniqueids,
    ).toBeNull();
    expect(
      resolveVhUniqueidSlices({
        vh: "2-Yaxshi",
        tuman: "",
        vhMapUniqueIds: null,
        vhRegionChartUniqueIds: null,
      }),
    ).toEqual({ vhUniqueids: null, vhRegionChartUniqueids: null });
  });
});

describe("buildBarCategoryBroadcast", () => {
  test("derives field from date and value from VH", () => {
    expect(
      buildBarCategoryBroadcast({
        polygonStatusPrefix: "st_",
        effectiveNdviDate: "2025-09-01",
        vh: "4-Past",
      }),
    ).toEqual({ barCategoryField: "st_2025_09_01", barCategoryValue: "past" });
  });

  test("defaults prefix and returns nulls for missing date / unknown VH", () => {
    expect(
      buildBarCategoryBroadcast({ polygonStatusPrefix: "  ", effectiveNdviDate: "", vh: "zz" }),
    ).toEqual({ barCategoryField: null, barCategoryValue: null });
    expect(
      buildBarCategoryBroadcast({ effectiveNdviDate: "2025-01-02", vh: "" }),
    ).toEqual({ barCategoryField: "status_2025_01_02", barCategoryValue: null });
  });
});

describe("broadcast geo snapshot", () => {
  const flags: ChartFilterFlags = { filterPieByVh: true, filterVhBarByCrop: false };
  const order: ChartDim[] = ["vh", "turi"];
  const live = {
    yil: "2025",
    viloyat: "Buxoro",
    tuman: "Olot",
    turi: "G'o'za",
    turlar: ["G'o'za", "Bug'doy"],
    polygonMode: true,
    selectedGraffUniqueid: "u1",
    chartFlags: flags,
    chartDimOrder: order,
  };

  test("builds snapshot fields", () => {
    const snap = buildBroadcastGeoSnapshot({ ...live, effectiveViloyat: "Buxoro" });
    expect(snap).toEqual({
      yil: "2025",
      viloyat: "Buxoro",
      tuman: "Olot",
      turi: "G'o'za",
      turlar: JSON.stringify(["G'o'za", "Bug'doy"]),
      polygonMode: true,
      uniqueid: "u1",
      filterPieByVh: true,
      filterVhBarByCrop: false,
      chartDimOrder: "vh>turi",
    });
  });

  test("uniqueid is blank outside polygon mode", () => {
    const snap = buildBroadcastGeoSnapshot({
      ...live,
      effectiveViloyat: "",
      polygonMode: false,
      yil: "",
      tuman: "",
      turi: "",
    });
    expect(snap.uniqueid).toBe("");
    expect(snap.viloyat).toBe("");
  });

  test("isBroadcastGeoCurrent detects equality and staleness", () => {
    const snap = buildBroadcastGeoSnapshot({ ...live, effectiveViloyat: "Buxoro" });
    expect(isBroadcastGeoCurrent(snap, live)).toBe(true);
    expect(isBroadcastGeoCurrent(snap, { ...live, yil: "2024" })).toBe(false);
    expect(isBroadcastGeoCurrent(snap, { ...live, turlar: ["Paxta"] })).toBe(false);
    expect(isBroadcastGeoCurrent(snap, { ...live, selectedGraffUniqueid: "u2" })).toBe(
      false,
    );
    expect(isBroadcastGeoCurrent(snap, { ...live, chartDimOrder: ["turi"] })).toBe(false);
    expect(
      isBroadcastGeoCurrent(snap, {
        ...live,
        chartFlags: { filterPieByVh: false, filterVhBarByCrop: false },
      }),
    ).toBe(false);
  });
});
