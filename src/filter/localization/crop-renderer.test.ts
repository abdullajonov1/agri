import {
  buildCropUniqueValueInfosFromValues,
  createCropFillSymbol,
  hexToRgba,
  normalizeCropKey,
  resolveCropRendererColor,
} from "./crop-renderer";
import {
  andWhereIfActive,
  augmentWhereWithNdviClauses,
  decideVhUniqueIdApplyPhase,
  isAgriTableDataUrl,
  isShownRegionYearLayerOpaque,
  pickPrimaryWhereForSpatialJoin,
  shouldForceRegionYearMapExportRefresh,
  spatialWhereFromPrimarySync,
} from "./map-filter-apply";

describe("crop renderer helpers", () => {
  test("normalizeCropKey unifies apostrophes, spaces and case", () => {
    expect(normalizeCropKey("  Bug’doy  ")).toBe("bug'doy");
    expect(normalizeCropKey("Yer   Yong`oq")).toBe("yer yong'oq");
  });

  test("resolveCropRendererColor exact, collapsed, partial, default", () => {
    expect(resolveCropRendererColor("Paxta")).toBe("#E8E1D1");
    expect(resolveCropRendererColor("Baliq  hovuz")).toBe("#0288D1");
    expect(resolveCropRendererColor("Kungaboqarlar")).toBe("#FDD835");
    expect(resolveCropRendererColor("Kosmik ekin")).toBe("#78909C");
    expect(resolveCropRendererColor("")).toBe("#78909C");
    expect(resolveCropRendererColor(null)).toBe("#78909C");
  });

  test("hexToRgba parses or falls back to grey", () => {
    expect(hexToRgba("#FF0080", 0.5)).toEqual([255, 0, 128, 0.5]);
    expect(hexToRgba("bad")).toEqual([170, 170, 170, 1]);
    expect(hexToRgba("")).toEqual([170, 170, 170, 1]);
  });

  test("createCropFillSymbol uses 30% fill and opaque outline", () => {
    expect(createCropFillSymbol("#000000")).toEqual({
      type: "simple-fill",
      color: [0, 0, 0, 0.3],
      outline: { color: [0, 0, 0, 1], width: 1 },
    });
  });

  test("buildCropUniqueValueInfosFromValues", () => {
    expect(buildCropUniqueValueInfosFromValues("turi", [])).toEqual([]);
    const byName = buildCropUniqueValueInfosFromValues("turi", ["Paxta"]);
    expect(byName[0]).toMatchObject({ value: "Paxta", label: "Paxta" });
    expect(byName[0].symbol.outline.color).toEqual([232, 225, 209, 1]);

    const byId = buildCropUniqueValueInfosFromValues("CROP_ID", ["5", "9"], { Sholi: 5 });
    expect(byId[0].symbol.outline.color).toEqual(hexToRgba("#26A69A", 1));
    expect(byId[1].symbol.outline.color).toEqual(hexToRgba("#78909C", 1));
  });
});

describe("map filter apply helpers", () => {
  test("isAgriTableDataUrl", () => {
    expect(isAgriTableDataUrl("https://x/Agri_Table_Data/FeatureServer/0")).toBe(true);
    expect(isAgriTableDataUrl(null)).toBe(false);
  });

  test("andWhereIfActive", () => {
    expect(andWhereIfActive("a=1", "b=2")).toBe("(a=1) AND (b=2)");
    expect(andWhereIfActive("a=1", "")).toBe("a=1");
    expect(andWhereIfActive("1=0", "b")).toBe("1=0");
    expect(andWhereIfActive("", "b")).toBe("");
  });

  test("augmentWhereWithNdviClauses: status wins, date only when locked", () => {
    const base = { where: "w", statusClause: "", dateClause: "d", ndviDateLocked: false };
    expect(augmentWhereWithNdviClauses({ ...base, statusClause: "s", ndviDateLocked: true })).toBe(
      "(w) AND (s)",
    );
    expect(augmentWhereWithNdviClauses({ ...base, ndviDateLocked: true })).toBe("(w) AND (d)");
    expect(augmentWhereWithNdviClauses(base)).toBe("w");
    expect(augmentWhereWithNdviClauses({ ...base, where: "1=0", statusClause: "s" })).toBe("1=0");
  });

  test("pickPrimaryWhereForSpatialJoin", () => {
    const agri = { isAgriTable: true, hasEffectiveViloyat: false };
    const normal = { isAgriTable: false, hasEffectiveViloyat: true };
    expect(pickPrimaryWhereForSpatialJoin(null, "x", agri)).toBe("1=0");
    expect(pickPrimaryWhereForSpatialJoin("p", "x", agri)).toBe("p");
    expect(pickPrimaryWhereForSpatialJoin("p", "x", normal)).toBe("x");
    expect(pickPrimaryWhereForSpatialJoin(null, "1=0", normal)).toBe("1=0");
    expect(pickPrimaryWhereForSpatialJoin("p", "1=0", normal)).toBe("p");
  });

  test("spatialWhereFromPrimarySync", () => {
    expect(spatialWhereFromPrimarySync("")).toBe("1=1");
    expect(spatialWhereFromPrimarySync("1=1")).toBe("1=1");
    expect(spatialWhereFromPrimarySync("1=0")).toBe("1=0");
    expect(spatialWhereFromPrimarySync("yil=1")).toBeNull();
  });

  test("decideVhUniqueIdApplyPhase", () => {
    expect(
      decideVhUniqueIdApplyPhase({ uniqueIdsReadyForApply: true, deferVhUniqueIdResolve: true }),
    ).toBe("ready-clear");
    expect(
      decideVhUniqueIdApplyPhase({ uniqueIdsReadyForApply: false, deferVhUniqueIdResolve: true }),
    ).toBe("defer-suppress");
    expect(
      decideVhUniqueIdApplyPhase({ uniqueIdsReadyForApply: false, deferVhUniqueIdResolve: false }),
    ).toBe("resolve");
  });

  test("shouldForceRegionYearMapExportRefresh", () => {
    expect(shouldForceRegionYearMapExportRefresh({ vhDeferredSecondPass: true })).toBe(false);
    expect(shouldForceRegionYearMapExportRefresh({ vhDeferredSecondPass: false })).toBe(true);
  });

  test("isShownRegionYearLayerOpaque", () => {
    expect(isShownRegionYearLayerOpaque({ layer: { visible: true } })).toBe(true);
    expect(isShownRegionYearLayerOpaque({ layer: { visible: true, opacity: 0.01 } })).toBe(false);
    expect(isShownRegionYearLayerOpaque({ layer: { visible: false, opacity: 1 } })).toBe(false);
    expect(isShownRegionYearLayerOpaque({ layer: null })).toBe(false);
  });
});
