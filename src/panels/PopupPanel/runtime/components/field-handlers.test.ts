import { makePopupHost, makeView } from "../__test-utils__/popup-host-stub";
import {
  buildRoundedBarPath,
  buildSmoothLinePath,
  bytesToSize,
  calculatePopupPosition,
  clearChartHover,
  closePopup,
  expandPopup,
  findFieldMetaOnLayer,
  formatChartTick,
  formatChartTooltipValue,
  formatValue,
  getClickedLayer,
  getFieldAlias,
  getOutFields,
  isDateField,
  isImageContentType,
  minimizePopup,
  niceChartMax,
  resolveAliasFromDataSourceSchema,
  resolveAliasFromLiveLayers,
  resolveFieldName,
  setChartHover,
  toggleChartExpanded,
} from "./field-handlers";

const VIEW_RECT = { left: 0, top: 0, width: 1000, height: 800 };

const layer = (fields: Array<{ name: string; alias?: string; type?: string }>, url = "https://x/0"): __esri.FeatureLayer =>
  ({ url, id: "L1", fields }) as unknown as __esri.FeatureLayer;

const schemaDs = (fields: Record<string, { name?: string; jimuName?: string; alias?: string }>) => ({
  getSchema: () => ({ fields }),
});

describe("popup field-handlers: simple helpers", () => {
  const { host } = makePopupHost();

  test("isImageContentType / bytesToSize", () => {
    expect(isImageContentType(host, "image/png")).toBe(true);
    expect(isImageContentType(host, "application/pdf")).toBe(false);
    expect(isImageContentType(host)).toBe(false);
    expect(bytesToSize(host)).toBe("");
    expect(bytesToSize(host, 0)).toBe("0 B");
    expect(bytesToSize(host, 1536)).toBe("1.50 KB");
    expect(bytesToSize(host, 5 * 1024 * 1024)).toBe("5.00 MB");
  });

  test("chart helpers delegate to shared formatters", () => {
    expect(niceChartMax(host, 7)).toBe(10);
    expect(formatChartTick(host, 2.25)).toBe("2.3");
    expect(formatChartTooltipValue(host, 1000)).toBe("1 000");
    expect(getOutFields(host, {} as never, "oid")).toEqual(["*"]);
  });

  test("buildSmoothLinePath", () => {
    expect(buildSmoothLinePath(host, [])).toBe("");
    expect(buildSmoothLinePath(host, [{ x: 1, y: 2 }])).toBe("M 1 2");
    const path = buildSmoothLinePath(host, [
      { x: 0, y: 0 },
      { x: 6, y: 6 },
      { x: 12, y: 0 },
    ]);
    expect(path.startsWith("M 0 0 C 1 1, ")).toBe(true);
    expect(path.match(/ C /g)).toHaveLength(2);
    expect(path.endsWith("12 0")).toBe(true);
  });

  test("buildRoundedBarPath clamps the radius", () => {
    expect(buildRoundedBarPath(host, 0, 0, 10, 20, 2)).toBe(
      "M 0 20 L 0 2 Q 0 0 2 0 L 8 0 Q 10 0 10 2 L 10 20 Z",
    );
    expect(buildRoundedBarPath(host, 0, 0, 4, 1, 10)).toContain("L 0 1 Q 0 0 1 0");
  });
});

describe("popup field-handlers: field resolution", () => {
  test("getClickedLayer finds by url key", () => {
    const L = layer([]);
    expect(getClickedLayer(makePopupHost().host)).toBeNull();
    const { host } = makePopupHost({ featureLayers: [L], lastClickedLayerKey: "https://x/0" });
    expect(getClickedLayer(host)).toBe(L);
  });

  test("isDateField reads the clicked layer field type", () => {
    const L = layer([{ name: "d", type: "date" }, { name: "s", type: "string" }]);
    const { host } = makePopupHost({ featureLayers: [L], lastClickedLayerKey: "https://x/0" });
    expect(isDateField(host, "d")).toBe(true);
    expect(isDateField(host, "s")).toBe(false);
  });

  test("resolveFieldName prefers data-source schema then layer fields", () => {
    const L = layer([{ name: "real_name", alias: "Alias" }]);
    const ds = schemaDs({ k1: { name: "ds_name", jimuName: "jimu1" } });
    const { host } = makePopupHost({
      featureLayers: [L],
      lastClickedLayerKey: "https://x/0",
      lastClickedDsId: "ds",
      dataSourcesById: { ds } as never,
    });
    expect(resolveFieldName(host, "k1")).toBe("ds_name");
    expect(resolveFieldName(host, "jimu1")).toBe("ds_name");
    expect(resolveFieldName(host, "Alias")).toBe("real_name");
    expect(resolveFieldName(host, "nope")).toBeNull();
  });

  test("findFieldMetaOnLayer is case-insensitive", () => {
    const { host } = makePopupHost();
    expect(findFieldMetaOnLayer(host, layer([{ name: "ABC" }]), "abc")?.name).toBe("ABC");
    expect(findFieldMetaOnLayer(host, null, "abc")).toBeNull();
  });

  test("resolveAliasFromLiveLayers / DataSourceSchema skip aliases equal to name", () => {
    const L = layer([{ name: "f1", alias: "Field One" }, { name: "f2", alias: "F2" }]);
    const { host } = makePopupHost({ featureLayers: [L] });
    expect(resolveAliasFromLiveLayers(host, "f1")).toBe("Field One");
    expect(resolveAliasFromLiveLayers(host, "f2")).toBeNull();
    const ds = schemaDs({ f3: { name: "f3", alias: "Three" } });
    expect(resolveAliasFromDataSourceSchema(host, "F3", ds)).toBe("Three");
    expect(resolveAliasFromDataSourceSchema(host, "zz", ds)).toBeNull();
    expect(resolveAliasFromDataSourceSchema(host, "f3", null)).toBeNull();
  });

  test("getFieldAlias: custom label, localized, layer alias, raw name", () => {
    const L = layer([{ name: "custom_f", alias: "Custom alias" }]);
    const { host } = makePopupHost(
      { featureLayers: [L], currentLang: "en" },
      { config: { labels: { x: "My X" } } as never },
    );
    expect(getFieldAlias(host, "x")).toBe("My X");
    expect(getFieldAlias(host, "maydon")).toBe("Area (ha)");
    expect(getFieldAlias(host, "custom_f")).toBe("Custom alias");
    expect(getFieldAlias(host, "plain")).toBe("plain");
  });

  test("formatValue localizes vh and formats plain numbers", () => {
    const { host } = makePopupHost({ currentLang: "en" });
    expect(formatValue(host, "vh", "Yaxshi")).toBe("Good");
    expect(formatValue(host, "vh", "zzz")).toBe("zzz");
    expect(formatValue(host, "other", 12.5)).toBe("12.5");
    expect(formatValue(host, "other", null)).toBe("—");
  });
});

describe("popup field-handlers: state transitions", () => {
  test("calculatePopupPosition places bottom-right then flips at edges", () => {
    const view = makeView(VIEW_RECT);
    const { host } = makePopupHost();
    expect(calculatePopupPosition(host, { x: 100, y: 100 }, view)).toEqual({ x: 110, y: 110 });
    expect(calculatePopupPosition(host, { x: 900, y: 700 }, view)).toEqual({ x: 590, y: 390 });
  });

  test("minimize / expand respect current state", () => {
    const { host } = makePopupHost({ showPopup: true });
    expandPopup(host);
    expect(host.state.popupMinimized).toBe(false);
    minimizePopup(host);
    expect(host.state.popupMinimized).toBe(true);
    minimizePopup(host);
    expandPopup(host);
    expect(host.state.popupMinimized).toBe(false);
  });

  test("chart hover/expand toggles", () => {
    const { host, setState } = makePopupHost();
    toggleChartExpanded(host);
    expect(host.state.chartExpanded).toBe(true);
    setChartHover(host, 2);
    setChartHover(host, 2);
    expect(host.state.chartHoverIndex).toBe(2);
    clearChartHover(host);
    clearChartHover(host);
    expect(host.state.chartHoverIndex).toBeNull();
    expect(setState).toHaveBeenCalledTimes(3);
  });

  test("closePopup on a visible popup resets state and restores extent on request", () => {
    const { host } = makePopupHost({ showPopup: true, selectedOID: 5, chartExpanded: true });
    closePopup(host, { restoreExtent: true, notifyDeselect: true });
    expect(host.state).toMatchObject({ showPopup: false, selectedOID: null, chartExpanded: false });
    expect(host.clearHighlight).toHaveBeenCalled();
    expect(host.notifyGraffPolygonSelection).toHaveBeenCalledWith("", false);
    expect(host.restoreExtentBeforeSelection).toHaveBeenCalled();
    expect(host._clickGeneration).toBe(1);
  });

  test("closePopup on hidden popup clears selection only", () => {
    const { host } = makePopupHost({ showPopup: false, selectedOID: 3 });
    closePopup(host);
    expect(host.state.selectedOID).toBeNull();
    expect(host.clearHighlight).not.toHaveBeenCalled();
    expect(host._extentBeforeSelection).toBeNull();
  });
});
