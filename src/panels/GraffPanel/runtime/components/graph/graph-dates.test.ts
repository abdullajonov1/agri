jest.mock("jimu-arcgis", () => ({}));
jest.mock("../../graff-log", () => ({ graffLog: jest.fn(), graffDebugCatch: jest.fn() }));
const mockSetContext = jest.fn();
jest.mock("../../../../../gis/agri-vegetation-overlay-prefetch", () => ({
  setVegetationOverlayContext: (c: unknown): void => mockSetContext(c),
}));
jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({
  formatArcgisDateToYmd: (raw: unknown): string | null => {
    const d = raw instanceof Date ? raw : new Date(String(raw));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  },
}));
jest.mock("../../graff-raster-overlay", () => ({ VEGETATION_IMAGE_LAYER_ID: "overlay-id" }));
jest.mock("./graph-view", () => ({ INDEX_COLORS: { ndvi: "#111111", savi: "#222222" } }));

import { asMock, makeStubHost } from "../../__test-utils__/stub-host";
import type { GraffWidgetHost } from "../../graff-host";
import type { AgriGraffWidgetState } from "../../graff-state";
import * as gd from "./graph-dates";

const rows = (list: Array<Record<string, unknown>>): AgriGraffWidgetState["vegetationData"] =>
  list as unknown as AgriGraffWidgetState["vegetationData"];

const wired = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost =>
  makeStubHost(state, {
    resolveAgainstAvailableDates: (): string | null => null,
    _vegetationImageRequestId: 1,
    _vegetationImageLayer: null,
    ...extra,
  });

const captured: CustomEvent[] = [];
const names = ["graffDateIndexSelectionChanged", "agriMapSurfaceLoading"];
beforeAll(() => names.forEach((n) => document.addEventListener(n, (e) => captured.push(e as CustomEvent))));
beforeEach(() => {
  captured.length = 0;
  mockSetContext.mockClear();
});

describe("getNavigableDateIndexDates", () => {
  test("returns sorted unique dates from raster_date and date columns", () => {
    const host = wired({
      vegetationData: rows([{ raster_date: "2024-06-10" }, { date: "2024-05-01" }, { raster_date: "2024-06-10" }, { raster_date: "" }, { other: 1 }]),
    });
    expect(gd.getNavigableDateIndexDates(host)).toEqual(["2024-05-01", "2024-06-10"]);
  });
  test("prefers advertised dates through resolveAgainstAvailableDates", () => {
    const host = wired(
      { vegetationData: rows([{ raster_date: "2024-06-10T09:00:00" }]), polygonAvailableDates: ["2024-06-11"] },
      { resolveAgainstAvailableDates: jest.fn((_r: unknown, adv: string[]) => adv[0] ?? null) },
    );
    expect(gd.getNavigableDateIndexDates(host)).toEqual(["2024-06-11"]);
  });
});

describe("broadcastDateIndexSelection", () => {
  test("clears the indicator when no date or index is selected", () => {
    gd.broadcastDateIndexSelection(wired({ language: "en" as AgriGraffWidgetState["language"] }));
    expect(captured[0].detail).toMatchObject({ date: null, indexKey: null, value: null, navigable: false, availableDates: [] });
    expect(mockSetContext).not.toHaveBeenCalled();
  });
  test("publishes the date/index value, navigable dates and overlay context", () => {
    const host = wired(
      {
        selectedNdviDate: "2024-06-10",
        selectedChartIndexKey: "ndvi",
        selecteduniqueid: "U",
        vegetationData: rows([{ raster_date: "2024-06-10", ndvi: 0.42 }]),
      },
      { getNavigableDateIndexDates: jest.fn(() => ["2024-06-10", "2024-06-20"]), resolveCurrentRegionId: jest.fn(() => 5), resolveCurrentYear: jest.fn(() => 2024) },
    );
    gd.broadcastDateIndexSelection(host);
    expect(captured[0].detail).toMatchObject({ date: "2024-06-10", indexKey: "ndvi", value: 0.42, navigable: true, availableDates: ["2024-06-10", "2024-06-20"] });
    expect(mockSetContext).toHaveBeenCalledWith({ regionId: 5, year: 2024, lastDate: "2024-06-10", lastIndex: "ndvi" });
  });
  test("value is null when the row or numeric value is missing; not navigable without polygon", () => {
    const host = wired({ selectedNdviDate: "2024-06-10", selectedChartIndexKey: "ndvi", vegetationData: rows([{ date: "2024-06-10", ndvi: "n/a" }]) });
    gd.broadcastDateIndexSelection(host);
    expect(captured[0].detail).toMatchObject({ value: null, navigable: false, availableDates: [] });
    captured.length = 0;
    gd.broadcastDateIndexSelection(wired({ selectedNdviDate: "2024-01-01", selectedChartIndexKey: "ndvi", vegetationData: rows([]) }));
    expect(captured[0].detail.value).toBeNull();
  });
});

describe("handleDateIndexNavigate", () => {
  const ev = (detail: Record<string, unknown> | null): Event => ({ detail }) as unknown as Event;
  const nav = (over: Partial<AgriGraffWidgetState> = {}, dates: string[] = ["2024-01-01", "2024-02-01", "2024-03-01"]): GraffWidgetHost =>
    wired(
      { selecteduniqueid: "U", selectedNdviDate: "2024-02-01", selectedChartIndexKey: "ndvi", vegetationData: rows([{ raster_date: "2024-03-01", ndvi: 0.7 }]), ...over },
      { getNavigableDateIndexDates: jest.fn(() => dates) },
    );

  test("steps by direction and re-applies overlay for the new date", () => {
    const host = nav();
    gd.handleDateIndexNavigate(host, ev({ direction: 1 }));
    expect(host.state.selectedNdviDate).toBe("2024-03-01");
    expect(host.state.chartTooltip).toBeNull();
    expect(asMock(host.applyVegetationImageOverlay)).toHaveBeenCalledWith("U", "2024-03-01", "ndvi");
    const back = nav();
    gd.handleDateIndexNavigate(back, ev({ direction: -1 }));
    expect(back.state.selectedNdviDate).toBe("2024-01-01");
  });
  test("honors an explicit target date from the event", () => {
    const host = nav();
    gd.handleDateIndexNavigate(host, ev({ date: " 2024-01-01 " }));
    expect(host.state.selectedNdviDate).toBe("2024-01-01");
  });
  test("ignores edges, unknown current date, same date, short lists and missing selection", () => {
    const edge = nav({ selectedNdviDate: "2024-03-01" });
    gd.handleDateIndexNavigate(edge, ev({ direction: 1 }));
    const first = nav({ selectedNdviDate: "2024-01-01" });
    gd.handleDateIndexNavigate(first, ev({ direction: -1 }));
    const unknown = nav({ selectedNdviDate: "2023-01-01" });
    gd.handleDateIndexNavigate(unknown, ev({ direction: 1 }));
    const same = nav();
    gd.handleDateIndexNavigate(same, ev({ date: "2024-02-01" }));
    const short = nav({}, ["2024-02-01"]);
    gd.handleDateIndexNavigate(short, ev({ direction: 1 }));
    const noSel = nav({ selecteduniqueid: "" });
    gd.handleDateIndexNavigate(noSel, ev({ direction: 1 }));
    const gone = nav({}, ["a", "b"]);
    gone._isMounted = false;
    gd.handleDateIndexNavigate(gone, ev({ direction: 1 }));
    for (const h of [edge, first, unknown, same, short, noSel, gone]) {
      expect(asMock(h.applyVegetationImageOverlay)).not.toHaveBeenCalled();
    }
  });
});

describe("map surface loading", () => {
  test("begin sets loading flags and broadcasts once state is not already loading", () => {
    const host = wired({ polygonImageLoading: false, polygonImageError: "e" });
    gd.beginVegetationImageSurfaceLoading(host);
    expect(host.state).toMatchObject({ polygonImageLoading: true, polygonImageError: null });
    expect(captured[0].detail).toMatchObject({ loading: true, requestId: 1, reason: "vegetation-raster" });
    const already = wired({ polygonImageLoading: true });
    gd.beginVegetationImageSurfaceLoading(already);
    expect(asMock(already.setState)).not.toHaveBeenCalled();
  });
  test("clear only acts for the current request", () => {
    const host = wired({ polygonImageLoading: true });
    gd.clearVegetationImageSurfaceLoading(host, 99);
    expect(captured).toHaveLength(0);
    gd.clearVegetationImageSurfaceLoading(host, 1);
    expect(host.state.polygonImageLoading).toBe(false);
    expect(captured[0].detail).toMatchObject({ loading: false, requestId: 1 });
    const idle = wired({ polygonImageLoading: false });
    gd.clearVegetationImageSurfaceLoading(idle, 1);
    expect(asMock(idle.setState)).not.toHaveBeenCalled();
  });
  test("cancel bumps the request id, removes overlay and releases loader", () => {
    const host = wired({ polygonImageLoading: true, polygonImageError: "e" });
    gd.cancelVegetationImageOverlay(host);
    expect(host._vegetationImageRequestId).toBe(2);
    expect(asMock(host.removeVegetationImageOverlay)).toHaveBeenCalled();
    expect(host.state).toMatchObject({ polygonImageLoading: false, polygonImageError: null });
    expect(captured[0].detail).toMatchObject({ requestId: 2, reason: "vegetation-raster-cancel" });
  });
});

describe("removeVegetationImageOverlay", () => {
  test("removes the tracked layer and strays by id, then resets keys", () => {
    const own = { id: "overlay-id" };
    const stray = { id: "overlay-id" };
    const other = { id: "other" };
    const remove = jest.fn();
    const host = wired(
      { activeMapView: { view: { map: { remove, layers: { toArray: (): unknown[] => [stray, other] } } } } as unknown as AgriGraffWidgetState["activeMapView"] },
      { _vegetationImageLayer: own, _vegetationOverlayAppliedKey: "k", _vegetationOverlayPendingKey: "p", _vegetationRasterSample: {} },
    );
    gd.removeVegetationImageOverlay(host);
    expect(asMock(host.detachVegetationRasterHover)).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(own);
    expect(remove).toHaveBeenCalledWith(stray);
    expect(remove).not.toHaveBeenCalledWith(other);
    expect(host._vegetationImageLayer).toBeNull();
    expect(host._vegetationOverlayAppliedKey).toBe("");
    expect(host._vegetationOverlayPendingKey).toBe("");
    expect(host._vegetationRasterSample).toBeNull();
  });
  test("works without a map and swallows removal errors", () => {
    const host = wired({}, { _vegetationImageLayer: { id: "x" } });
    expect(() => gd.removeVegetationImageOverlay(host)).not.toThrow();
    expect(host._vegetationImageLayer).toBeNull();
    const failing = wired(
      {
        activeMapView: {
          view: {
            map: {
              remove: (): void => {
                throw new Error("gone");
              },
              layers: { toArray: (): unknown[] => [{ id: "overlay-id" }] },
            },
          },
        } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      { _vegetationImageLayer: null },
    );
    expect(() => gd.removeVegetationImageOverlay(failing)).not.toThrow();
    const tornDown = wired(
      {
        activeMapView: {
          view: {
            map: {
              remove: jest.fn(),
              get layers(): never {
                throw new Error("torn");
              },
            },
          },
        } as unknown as AgriGraffWidgetState["activeMapView"],
      },
      { _vegetationImageLayer: { id: "x" } },
    );
    expect(() => gd.removeVegetationImageOverlay(tornDown)).not.toThrow();
  });
});

describe("index colors and hover range", () => {
  test("getIndexDisplayColor falls back to green", () => {
    const host = wired();
    expect(gd.getIndexDisplayColor(host, "SAVI")).toBe("#222222");
    expect(gd.getIndexDisplayColor(host)).toBe("#111111");
    expect(gd.getIndexDisplayColor(host, "unknown")).toBe("#00d084");
  });
  test("resolveHoverIndexRange prefers valid export headers", () => {
    const host = wired();
    expect(gd.resolveHoverIndexRange(host, "ndvi", "2024-06-10", { indexMin: 0.1, indexMax: 0.9 })).toEqual({ indexMin: 0.1, indexMax: 0.9 });
  });
  test("falls back to the chart row min/max for the date", () => {
    const host = wired({ vegetationData: rows([{ raster_date: "2024-06-10", ndvi_min: 0.2, ndvi_max: 0.8 }]) });
    expect(gd.resolveHoverIndexRange(host, " NDVI ", "2024-06-10", { indexMin: 0.9, indexMax: 0.1 })).toEqual({ indexMin: 0.2, indexMax: 0.8 });
    expect(gd.resolveHoverIndexRange(host, "ndvi", "2024-06-10T10:00:00Z", null)).toEqual({ indexMin: 0.2, indexMax: 0.8 });
  });
  test("returns nulls when no row or invalid range", () => {
    expect(gd.resolveHoverIndexRange(wired(), "ndvi", "2024-06-10")).toEqual({ indexMin: null, indexMax: null });
    const bad = wired({ vegetationData: rows([{ raster_date: "2024-06-10", ndvi_min: 0.8, ndvi_max: 0.2 }]) });
    expect(gd.resolveHoverIndexRange(bad, "ndvi", "2024-06-10")).toEqual({ indexMin: null, indexMax: null });
    expect(gd.resolveHoverIndexRange(wired(), "", "")).toEqual({ indexMin: null, indexMax: null });
  });
});
