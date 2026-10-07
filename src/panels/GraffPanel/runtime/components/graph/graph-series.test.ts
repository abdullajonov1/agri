jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockFetchDates = jest.fn();
const mockSeasonMonths = jest.fn((): number[] => []);
const mockPick = jest.fn();
jest.mock("../../../../../gis/agri-polygon-api-source", () => ({
  fetchPolygonAvailableDates: (...a: unknown[]): unknown => mockFetchDates(...a),
  getExportImageSeasonMonths: (): number[] => mockSeasonMonths(),
  pickExportRasterDate: (...a: unknown[]): unknown => mockPick(...a),
}));
jest.mock("../../../../../data/agri-uniqueid-sql", () => ({
  stripUniqueidBraces: (v: string | null | undefined): string => String(v ?? "").replace(/[{}]/g, ""),
}));

import { asMock, makeStubHost } from "../../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../../graff-host";
import type { AgriGraffWidgetState, VegetationIndex } from "../../graff-state";
import * as gs from "./graph-series";

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    _inSeasonRetryAttempts: new Map<string, number>(),
    _polygonAvailableDatesUniqueid: "",
    resolveCurrentYear: (): number => 2024,
    resolveCurrentRegionId: (): number => 5,
    resolveCropIdForUniqueid: (): number => 3,
    resolveAgainstAvailableDates: (): string | null => null,
    formatLocalDateYmd: (d: Date): string => (Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)),
    isRegionalInteractionEnabled: jest.fn(() => true),
    ...extra,
  });
const vrow = (d: string): VegetationIndex => ({ raster_date: d }) as unknown as VegetationIndex;

beforeEach(() => {
  mockFetchDates.mockReset();
  mockPick.mockReset();
  mockSeasonMonths.mockReset().mockReturnValue([]);
});

describe("retryOverlayWithUsableDate", () => {
  test("fetches dates, remembers them and applies the next usable date", async () => {
    mockFetchDates.mockResolvedValue(["2024-05-01", "2024-06-01"]);
    mockPick.mockReturnValue("2024-05-01");
    const host = wired({ selecteduniqueid: "{U}" });
    await gs.retryOverlayWithUsableDate(host, "U", 5, "2024-09-01", "ndvi");
    expect(mockFetchDates).toHaveBeenCalledWith("U", 5, 2024);
    expect(asMock(host.rememberRasterDateForUniqueid)).toHaveBeenCalledWith("U", ["2024-05-01", "2024-06-01"]);
    expect(mockPick).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ exclude: ["2024-09-01"], regionId: 5 }));
    expect(asMock(host.applyVegetationImageOverlay)).toHaveBeenCalledWith("U", "2024-05-01", "ndvi");
  });
  test("uses already advertised dates for the same polygon without fetching", async () => {
    mockPick.mockReturnValue("2024-05-01");
    const host = wired({ selecteduniqueid: "U", polygonAvailableDates: ["2024-05-01"] }, { _polygonAvailableDatesUniqueid: "U" });
    await gs.retryOverlayWithUsableDate(host, "U", 5, "x", "savi");
    expect(mockFetchDates).not.toHaveBeenCalled();
    expect(asMock(host.applyVegetationImageOverlay)).toHaveBeenCalledWith("U", "2024-05-01", "savi");
  });
  test("gives up after six attempts per polygon/region/index", async () => {
    const host = wired({ selecteduniqueid: "U" }, { _inSeasonRetryAttempts: new Map([["U|5|ndvi", 6]]) });
    await gs.retryOverlayWithUsableDate(host, "U", 5, "x", "ndvi");
    expect(mockFetchDates).not.toHaveBeenCalled();
    const fresh = wired({ selecteduniqueid: "U" });
    mockFetchDates.mockResolvedValue([]);
    mockPick.mockReturnValue(null);
    await gs.retryOverlayWithUsableDate(fresh, "U", 5, "x", "ndvi");
    expect(fresh._inSeasonRetryAttempts.get("U|5|ndvi")).toBe(1);
  });
  test("tolerates fetch failures, unmount, no candidate, same date and changed selection", async () => {
    mockFetchDates.mockRejectedValue(new Error("net"));
    mockPick.mockReturnValue("n");
    const failing = wired({ selecteduniqueid: "U" });
    await gs.retryOverlayWithUsableDate(failing, "U", 5, "x", "ndvi");
    expect(asMock(failing.rememberRasterDateForUniqueid)).not.toHaveBeenCalled();
    expect(asMock(failing.applyVegetationImageOverlay)).toHaveBeenCalled();
    mockFetchDates.mockResolvedValue(["d"]);
    const gone = wired({ selecteduniqueid: "U" }, { _isMounted: false });
    await gs.retryOverlayWithUsableDate(gone, "U", 5, "x", "ndvi");
    expect(asMock(gone.applyVegetationImageOverlay)).not.toHaveBeenCalled();
    mockPick.mockReturnValue(null);
    const none = wired({ selecteduniqueid: "U" });
    await gs.retryOverlayWithUsableDate(none, "U", 5, "x", "ndvi");
    mockPick.mockReturnValue("x");
    const same = wired({ selecteduniqueid: "U" });
    await gs.retryOverlayWithUsableDate(same, "U", 5, "x", "ndvi");
    mockPick.mockReturnValue("y");
    const moved = wired({ selecteduniqueid: "OTHER" });
    await gs.retryOverlayWithUsableDate(moved, "U", 5, "x", "ndvi");
    for (const h of [none, same, moved]) expect(asMock(h.applyVegetationImageOverlay)).not.toHaveBeenCalled();
  });
  test("skips fetching when the year is unknown", async () => {
    mockPick.mockReturnValue(null);
    const host = wired({ selecteduniqueid: "U" }, { resolveCurrentYear: (): undefined => undefined });
    await gs.retryOverlayWithUsableDate(host, "U", 5, "x", "ndvi");
    expect(mockFetchDates).not.toHaveBeenCalled();
  });
});

describe("preparePolygonGraphSeries", () => {
  test("empty rows yield empty result", () => {
    expect(gs.preparePolygonGraphSeries(wired(), [], [])).toEqual({ sorted: [], nextDate: null, nextIndexKey: null, fingerprint: "" });
  });
  test("sorts rows, picks the export-friendly last date and fingerprints the series", () => {
    mockPick.mockImplementation((pool: string[]) => pool[pool.length - 1]);
    const host = wired({ selecteduniqueid: "{U}", selectedIndices: ["savi", "ndvi"] });
    const out = gs.preparePolygonGraphSeries(host, [vrow("2024-06-10"), vrow("2024-05-01")], []);
    expect(out.sorted.map((r) => r.raster_date)).toEqual(["2024-05-01", "2024-06-10"]);
    expect(out.nextDate).toBe("2024-06-10");
    expect(out.nextIndexKey).toBe("savi");
    expect(out.fingerprint).toBe("2024-05-01|2024-06-10");
  });
  test("falls back to the last raw date when no pick, and uses advertised dates as the pool", () => {
    mockPick.mockReturnValue(null);
    const host = wired({}, { resolveAgainstAvailableDates: jest.fn((_r: unknown, d: string[]) => d[0] ?? null) });
    const out = gs.preparePolygonGraphSeries(host, [vrow("2024-06-10")], ["2024-06-11"]);
    expect(out.nextDate).toBe("2024-06-11");
    expect(mockPick).toHaveBeenCalledWith(["2024-06-11"], expect.anything());
    const raw = gs.preparePolygonGraphSeries(wired(), [{ raster_date: "garbage" } as unknown as VegetationIndex], []);
    expect(raw.nextDate).toBe("garbage");
  });
  test("keeps the existing date when still present and in season; otherwise switches", () => {
    mockPick.mockReturnValue("2024-06-10");
    const keep = wired({ selectedNdviDate: "2024-05-01", selectedChartIndexKey: "savi", selectedIndices: ["ndvi", "savi"] });
    const out = gs.preparePolygonGraphSeries(keep, [vrow("2024-05-01"), vrow("2024-06-10")], []);
    expect(out.nextDate).toBe("2024-05-01");
    expect(out.nextIndexKey).toBe("savi");
    mockSeasonMonths.mockReturnValue([6, 7]);
    const outOfSeason = gs.preparePolygonGraphSeries(wired({ selectedNdviDate: "2024-05-01" }), [vrow("2024-05-01"), vrow("2024-06-10")], []);
    expect(outOfSeason.nextDate).toBe("2024-06-10");
    mockSeasonMonths.mockReturnValue([]);
    const gone = gs.preparePolygonGraphSeries(wired({ selectedNdviDate: "2023-01-01" }), [vrow("2024-06-10")], []);
    expect(gone.nextDate).toBe("2024-06-10");
    expect(gone.nextIndexKey).toBe("ndvi");
  });
});

describe("handleIndexChange", () => {
  test("ignored when interaction is disabled", () => {
    const host = wired({}, { isRegionalInteractionEnabled: jest.fn(() => false) });
    gs.handleIndexChange(host, "savi");
    expect(asMock(host.setState)).not.toHaveBeenCalled();
  });
  test("toggles indices, never leaving the list empty", () => {
    const host = wired({ selectedIndices: ["ndvi"] });
    gs.handleIndexChange(host, "savi");
    expect(host.state.selectedIndices).toEqual(["ndvi", "savi"]);
    gs.handleIndexChange(host, "ndvi");
    gs.handleIndexChange(host, "savi");
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
  });
  test("republic graph mode fetches regional series", () => {
    const host = wired({ viewMode: "graph", selectedIndices: ["ndvi"] });
    gs.handleIndexChange(host, "evi");
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalled();
  });
  test("polygon selected: overlay is refreshed only when the chart index was toggled off", () => {
    const base: Partial<AgriGraffWidgetState> = { selecteduniqueid: "U", selectedNdviDate: "2024-06-10", selectedIndices: ["ndvi", "savi"], selectedChartIndexKey: "savi" };
    const dropped = wired(base);
    gs.handleIndexChange(dropped, "savi");
    expect(dropped.state.selectedChartIndexKey).toBe("ndvi");
    expect(asMock(dropped.applyVegetationImageOverlay)).toHaveBeenCalledWith("U", "2024-06-10", "ndvi");
    const kept = wired(base);
    gs.handleIndexChange(kept, "evi");
    expect(asMock(kept.applyVegetationImageOverlay)).not.toHaveBeenCalled();
    const noDate = wired({ ...base, selectedNdviDate: null });
    gs.handleIndexChange(noDate, "evi");
    expect(asMock(noDate.applyVegetationImageOverlay)).not.toHaveBeenCalled();
    const noKey = wired({ ...base, selectedChartIndexKey: null, selectedIndices: ["ndvi"] });
    gs.handleIndexChange(noKey, "savi");
    expect(asMock(noKey.applyVegetationImageOverlay)).toHaveBeenCalledWith("U", "2024-06-10", "ndvi");
  });
});

describe("handleToggleAllIndices", () => {
  test("selects all, then collapses back to NDVI", () => {
    const host = wired({ selectedIndices: ["ndvi"], viewMode: "graph" });
    gs.handleToggleAllIndices(host);
    expect(host.state.selectedIndices).toEqual(["ndvi", "savi", "rvi", "ci", "evi", "ndwi"]);
    expect(asMock(host.fetchRegionalTimeseries)).toHaveBeenCalledTimes(1);
    gs.handleToggleAllIndices(host);
    expect(host.state.selectedIndices).toEqual(["ndvi"]);
  });
  test("disabled interaction and selected polygon skip work", () => {
    const off = wired({}, { isRegionalInteractionEnabled: jest.fn(() => false) });
    gs.handleToggleAllIndices(off);
    expect(asMock(off.setState)).not.toHaveBeenCalled();
    const poly = wired({ selecteduniqueid: "U", viewMode: "graph" });
    gs.handleToggleAllIndices(poly);
    expect(asMock(poly.fetchRegionalTimeseries)).not.toHaveBeenCalled();
  });
});

describe("localizeRuntimeMessage", () => {
  const en = (): GraffWidgetHost => wired({ language: "en" as AgriGraffWidgetState["language"] });
  test.each([
    ["Майдонлар танланмаган. x", "No fields are selected. Select widget fields in Settings."],
    ["Созланган қатламда", "The configured layer has no usable fields. Check the layer settings."],
    ["x ишлатиладиган майдонлар йўқ", "The configured layer has no usable fields. Check the layer settings."],
    ["Маълумот манбаи мавжуд эмас", "The data source is unavailable."],
    ["Бошланғич маълумот юклана олмади", "Could not load the initial data."],
    ["Қатлам мавжуд эмас (x)", "The configured layer is unavailable."],
    ["Күтүлмаган хатолик", "An unexpected error occurred."],
    ["Объектни танлаш", "Could not select the feature."],
    ["Вилоят вақт қатори", "Could not load the regional time series."],
    ["Вегетация маълумоти", "Could not load vegetation data."],
    ["something else", "something else"],
  ])("translates %s for English", (input, expected) => {
    expect(gs.localizeRuntimeMessage(en(), input)).toBe(expected);
  });
  test("non-English or empty messages pass through", () => {
    expect(gs.localizeRuntimeMessage(wired({ language: "ru" as AgriGraffWidgetState["language"] }), "Майдонлар танланмаган")).toBe("Майдонлар танланмаган");
    expect(gs.localizeRuntimeMessage(en(), null)).toBe("");
    expect(gs.localizeRuntimeMessage(en(), undefined)).toBe("");
  });
});
