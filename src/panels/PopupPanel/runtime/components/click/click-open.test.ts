import { makePopupHost } from "../../__test-utils__/popup-host-stub";
import type { PopupWidgetHost } from "../../popup-host";
import type { PopupAttributes } from "../../popup-types";

const mockQueryRecord = jest.fn();
const mockSeries = jest.fn();

jest.mock("../../../../../gis/agri-table-data-source", () => ({
  AGRI_TABLE_JOIN_FIELD: "uniqueid",
  queryAgriRecordByUniqueId: (...a: unknown[]) => mockQueryRecord(...a),
}));
jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({
  queryVegetationSeriesForUniqueId: (...a: unknown[]) => mockSeries(...a),
  formatArcgisDateToYmd: (v: unknown) => `date:${String(v)}`,
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  getAgriLayerMapKey: (l: { url?: string }) => l?.url || "",
}));

import {
  fetchLatestVegetationIndices,
  findAttributeValueCaseInsensitive,
  openPopupForUniqueid,
  resolveDisplayAttrs,
} from "./click-open";

type Obj = Record<string, unknown>;
const asLayer = (o: Obj): __esri.FeatureLayer => o as unknown as __esri.FeatureLayer;
const asGraphic = (o: Obj): __esri.Graphic => o as unknown as __esri.Graphic;

describe("click-open: resolveDisplayAttrs", () => {
  const host = makePopupHost({}, {}, {
    findAttributeValueCaseInsensitive: jest.fn((a, n) => findAttributeValueCaseInsensitive(host, a, n)),
  }).host;
  beforeEach(() => mockQueryRecord.mockReset());

  test("findAttributeValueCaseInsensitive ignores casing", () => {
    expect(findAttributeValueCaseInsensitive(host, { UniqueID: "a" }, "uniqueid")).toBe("a");
    expect(findAttributeValueCaseInsensitive(host, null, "uniqueid")).toBeNull();
  });

  test("returns polygon attributes untouched when no join value", async () => {
    const attrs: PopupAttributes = { name: "x", uniqueid: "  " };
    expect(await resolveDisplayAttrs(host, attrs)).toBe(attrs);
    expect(await resolveDisplayAttrs(host, null)).toEqual({});
    expect(mockQueryRecord).not.toHaveBeenCalled();
  });

  test("merges joined record over polygon attributes", async () => {
    mockQueryRecord.mockResolvedValue({ crop: "wheat", name: "joined" });
    const res = await resolveDisplayAttrs(host, { UNIQUEID: "u1", name: "poly", area: 5 });
    expect(mockQueryRecord).toHaveBeenCalledWith("u1");
    expect(res).toEqual({ UNIQUEID: "u1", name: "joined", area: 5, crop: "wheat" });
  });

  test("falls back to polygon attributes when no record or lookup fails", async () => {
    const attrs: PopupAttributes = { uniqueid: "u1" };
    mockQueryRecord.mockResolvedValueOnce(null);
    expect(await resolveDisplayAttrs(host, attrs)).toBe(attrs);
    mockQueryRecord.mockRejectedValueOnce(new Error("net"));
    expect(await resolveDisplayAttrs(host, attrs)).toBe(attrs);
  });
});

describe("click-open: fetchLatestVegetationIndices", () => {
  beforeEach(() => mockSeries.mockReset());

  test("blank id clears indices without querying", async () => {
    const { host, setState } = makePopupHost({ latestIndexDate: "x" });
    await fetchLatestVegetationIndices(host, "  ");
    expect(mockSeries).not.toHaveBeenCalled();
    expect(setState).toHaveBeenCalledWith({ loadingLatestIndices: false, latestIndexDate: null, latestIndexValues: null });
  });

  test("uses last row and keeps only finite index values", async () => {
    mockSeries.mockResolvedValue([
      { raster_date: 1, ndvi: 0.1 },
      { raster_date: 2, ndvi: 0.5, evi: "abc", savi: 0.25 },
    ]);
    const { host } = makePopupHost();
    await fetchLatestVegetationIndices(host, " u1 ");
    expect(mockSeries).toHaveBeenCalledWith("u1");
    expect(host.state.loadingLatestIndices).toBe(false);
    expect(host.state.latestIndexDate).toBe("date:2");
    expect(host.state.latestIndexValues).toEqual({ ndvi: 0.5, savi: 0.25 });
  });

  test("empty rows, or rows without finite values, yield null values", async () => {
    const { host } = makePopupHost({ latestIndexValues: { ndvi: 1 } });
    mockSeries.mockResolvedValueOnce([]);
    await fetchLatestVegetationIndices(host, "u1");
    expect(host.state.latestIndexValues).toBeNull();
    expect(host.state.latestIndexDate).toBeNull();
    mockSeries.mockResolvedValueOnce([{ raster_date: 3 }]);
    await fetchLatestVegetationIndices(host, "u1");
    expect(host.state.latestIndexDate).toBe("date:3");
    expect(host.state.latestIndexValues).toBeNull();
  });

  test("query failure resets state", async () => {
    mockSeries.mockRejectedValue(new Error("boom"));
    const { host } = makePopupHost({ loadingLatestIndices: true });
    await fetchLatestVegetationIndices(host, "u1");
    expect(host.state.loadingLatestIndices).toBe(false);
    expect(host.state.latestIndexValues).toBeNull();
  });

  test("stale response is dropped", async () => {
    let resolveFirst: (rows: PopupAttributes[]) => void = () => undefined;
    mockSeries.mockReturnValueOnce(new Promise<PopupAttributes[]>((r) => { resolveFirst = r; }));
    mockSeries.mockResolvedValueOnce([{ raster_date: 9, ndvi: 0.9 }]);
    const { host } = makePopupHost();
    const first = fetchLatestVegetationIndices(host, "old");
    await fetchLatestVegetationIndices(host, "new");
    resolveFirst([{ raster_date: 1, ndvi: 0.1 }]);
    await first;
    expect(host.state.latestIndexValues).toEqual({ ndvi: 0.9 });
    // unmounted host also ignores responses
    mockSeries.mockResolvedValueOnce([{ raster_date: 1, ndvi: 1 }]);
    const unmounted = makePopupHost({}, {}, { _isMounted: false }).host;
    await fetchLatestVegetationIndices(unmounted, "x");
    expect(unmounted.state.loadingLatestIndices).toBe(true);
  });
});

describe("click-open: openPopupForUniqueid", () => {
  const view = {
    map: {},
    extent: { clone: jest.fn(() => ({ cloned: true })) },
    goTo: jest.fn(() => Promise.resolve()),
  };
  const polyGeom = { type: "polygon", extent: { expand: jest.fn(() => ({ expanded: true })) } };

  interface Setup {
    host: PopupWidgetHost;
    queryFeatures: jest.Mock;
    createQuery: () => Obj;
  }

  const setup = (over: Partial<PopupWidgetHost> = {}, state: Parameters<typeof makePopupHost>[0] = {}, config: Obj = {}): Setup => {
    const queries: Obj[] = [];
    const queryFeatures = jest.fn(() => Promise.resolve({ features: [asGraphic({ attributes: { OBJECTID: 5, uniqueid: "u1" }, geometry: polyGeom })] }));
    const layer = asLayer({
      url: "https://svc/0",
      objectIdField: "OBJECTID",
      createQuery: () => { const q: Obj = {}; queries.push(q); return q; },
      queryFeatures,
    });
    const { host } = makePopupHost(
      { jimuMapView: { view } as never, layerKeyToDsId: { "https://svc/0": "ds1" }, ...state },
      { config: config as never },
      {
        resolveClickLayers: jest.fn(() => Promise.resolve([layer])),
        isAgriculturalFieldLayer: jest.fn(() => true),
        isLayerEffectivelyVisible: jest.fn(() => true),
        getDetachedQueryLayer: jest.fn(() => Promise.resolve(null)),
        toLiveMapLayer: jest.fn((l) => l as never),
        getOutFields: jest.fn(() => ["*"]),
        queryFeatureByObjectIdCached: jest.fn(() => Promise.resolve(null)),
        highlightPolygon: jest.fn(),
        resolveDisplayAttrs: jest.fn((a) => Promise.resolve({ ...(a || {}), crop: "wheat" } as PopupAttributes)),
        calculatePinnedPosition: jest.fn(() => ({ x: 1, y: 2 })),
        notifyGraffPolygonSelection: jest.fn(),
        fetchLatestVegetationIndices: jest.fn(() => Promise.resolve()),
        loadAttachmentsForOid: jest.fn(() => Promise.resolve()),
        schedulePopupLayoutAfterContent: jest.fn(),
        expandPopup: jest.fn(),
        broadcastPopupVisibility: jest.fn(),
        _queryOnlyLayers: new Map(),
        _extentBeforeSelection: null as never,
        _activeInspectedUniqueid: "",
        ...over,
      },
    );
    return { host, queryFeatures, createQuery: () => queries[queries.length - 1] };
  };

  beforeEach(() => {
    view.goTo.mockClear();
    view.extent.clone.mockClear();
  });

  test("does nothing for blank id, unmounted host or missing view", async () => {
    const a = setup();
    await openPopupForUniqueid(a.host, " {} ");
    expect(a.host.resolveClickLayers).not.toHaveBeenCalled();
    const b = setup({ _isMounted: false });
    await openPopupForUniqueid(b.host, "u1");
    expect(b.host.resolveClickLayers).not.toHaveBeenCalled();
    const c = setup({}, { jimuMapView: undefined });
    await openPopupForUniqueid(c.host, "u1");
    expect(c.host.resolveClickLayers).not.toHaveBeenCalled();
  });

  test("already-open same polygon re-broadcasts or expands when minimized", async () => {
    const open = setup({ _activeInspectedUniqueid: "{u1}" }, { showPopup: true, selectedAttrs: { a: 1 } });
    await openPopupForUniqueid(open.host, "u1");
    expect(open.host.broadcastPopupVisibility).toHaveBeenCalledWith(true);
    expect(open.host.resolveClickLayers).not.toHaveBeenCalled();
    const min = setup({ _activeInspectedUniqueid: "u1" }, { showPopup: true, selectedAttrs: { a: 1 }, popupMinimized: true });
    await openPopupForUniqueid(min.host, "u1");
    expect(min.host.expandPopup).toHaveBeenCalled();
  });

  test("opens popup with queried feature, zoom, notification and attachments", async () => {
    const s = setup({}, { pinToCorner: false, popupPosition: { x: 9, y: 9 } }, { fieldsToShow: ["crop", "missing"] });
    await openPopupForUniqueid(s.host, "{u1}", { notifySelection: true });
    const q = s.createQuery();
    expect(q.where).toBe("uniqueid='u1'");
    expect(s.host.state).toMatchObject({
      loading: false,
      showPopup: true,
      selectedOID: 5,
      objectIdField: "OBJECTID",
      lastClickedDsId: "ds1",
      lastClickedLayerKey: "https://svc/0",
      popupPosition: { x: 9, y: 9 },
      chartExpanded: false,
    });
    expect(s.host.state.error).toContain("configured fields not found");
    expect(s.host._activeInspectedUniqueid).toBe("u1");
    expect(s.host.notifyGraffPolygonSelection).toHaveBeenCalledWith("u1", true, expect.any(Number));
    expect(s.host.fetchLatestVegetationIndices).toHaveBeenCalledWith("u1");
    expect(s.host.highlightPolygon).toHaveBeenCalledWith(polyGeom);
    expect(view.goTo).toHaveBeenCalledWith({ target: { expanded: true } }, expect.objectContaining({ duration: 650 }));
    expect(s.host._extentBeforeSelection).toEqual({ cloned: true });
    expect(s.host.loadAttachmentsForOid).toHaveBeenCalledWith(expect.anything(), 5);
    expect(s.host.schedulePopupLayoutAfterContent).toHaveBeenCalled();
  });

  test("tries brace-wrapped variant when plain query is empty", async () => {
    const s = setup();
    s.queryFeatures
      .mockResolvedValueOnce({ features: [] })
      .mockRejectedValueOnce(new Error("bad"));
    await openPopupForUniqueid(s.host, "u1");
    expect(s.queryFeatures).toHaveBeenCalledTimes(2);
    expect(s.createQuery().where).toBe("uniqueid='{u1}'");
    expect(s.host.state.showPopup).toBe(false);
    expect(s.host.state.loading).toBe(false);
  });

  test("pinned popup uses pinned position, zoom disabled and attachments off", async () => {
    const s = setup({}, { pinToCorner: true }, { settings: { showAttachments: false }, fieldsToShow: ["zzz"] });
    s.host.queryFeatureByObjectIdCached = jest.fn(() => Promise.resolve(asGraphic({ attributes: { OBJECTID: 5 } })));
    await openPopupForUniqueid(s.host, "u1", { zoom: false });
    expect(s.host.state.popupPosition).toEqual({ x: 1, y: 2 });
    expect(s.host.state.chartExpanded).toBe(true);
    expect(view.goTo).not.toHaveBeenCalled();
    expect(s.host.loadAttachmentsForOid).not.toHaveBeenCalled();
    expect(s.host.state.loadingAttachments).toBe(false);
    expect(s.host.state.error).toContain("configured fields not found");
  });

  test("reports no data for configured fields", async () => {
    const s = setup({ resolveDisplayAttrs: jest.fn(() => Promise.resolve({ crop: "" })) }, {}, { fieldsToShow: ["crop"] });
    await openPopupForUniqueid(s.host, "u1");
    expect(s.host.state.error).toBe("No data available for configured fields");
  });

  test("closes loading state when objectId field or value is missing", async () => {
    const noOid = setup();
    noOid.host.resolveClickLayers = jest.fn(() => Promise.resolve([asLayer({
      createQuery: () => ({}),
      queryFeatures: () => Promise.resolve({ features: [asGraphic({ attributes: { a: 1 } })] }),
      fields: [],
    })]));
    await openPopupForUniqueid(noOid.host, "u1");
    expect(noOid.host.state).toMatchObject({ loading: false, showPopup: false });

    const noValue = setup();
    noValue.queryFeatures.mockResolvedValue({ features: [asGraphic({ attributes: { other: 1 } })] });
    await openPopupForUniqueid(noValue.host, "u1");
    expect(noValue.host.state).toMatchObject({ loading: false, showPopup: false });
    expect(noValue.host.resolveDisplayAttrs).not.toHaveBeenCalled();
  });

  test("falls back to oid field type and skips non-agri/hidden layers", async () => {
    const s = setup({ isAgriculturalFieldLayer: jest.fn((l) => (l as Obj).skip !== true) });
    const skipped = asLayer({ skip: true });
    const real = asLayer({
      url: "https://svc/0",
      fields: [{ type: "oid", name: "FID" }],
      createQuery: () => ({}),
      queryFeatures: () => Promise.resolve({ features: [asGraphic({ attributes: { FID: 3 } })] }),
    });
    s.host.resolveClickLayers = jest.fn(() => Promise.resolve([skipped, real]));
    await openPopupForUniqueid(s.host, "u1", { zoom: false });
    expect(s.host.state.objectIdField).toBe("FID");
    expect(s.host.state.selectedOID).toBe(3);
  });

  test("uses detached query layer and query-only layer for attachments", async () => {
    const s = setup();
    const detachedFeature = asGraphic({ attributes: { OBJECTID: 7 } });
    const detached = asLayer({ createQuery: () => ({}), queryFeatures: () => Promise.resolve({ features: [detachedFeature] }) });
    s.host.getDetachedQueryLayer = jest.fn(() => Promise.resolve(detached));
    const queryOnly = asLayer({ id: "q" });
    s.host._queryOnlyLayers.set("https://svc/0", queryOnly as never);
    await openPopupForUniqueid(s.host, "u1", { zoom: false });
    expect(s.queryFeatures).not.toHaveBeenCalled();
    expect(s.host.state.selectedOID).toBe(7);
    expect(s.host.loadAttachmentsForOid).toHaveBeenCalledWith(queryOnly, 7);
  });

  test("attachment failure keeps popup open and clears loading", async () => {
    const s = setup({ loadAttachmentsForOid: jest.fn(() => Promise.reject(new Error("x"))) });
    await openPopupForUniqueid(s.host, "u1", { zoom: false });
    expect(s.host.state.showPopup).toBe(true);
    expect(s.host.state.loadingAttachments).toBe(false);
  });

  test("goTo failure is swallowed", async () => {
    const s = setup();
    view.goTo.mockImplementationOnce(() => { throw new Error("nogo"); });
    await openPopupForUniqueid(s.host, "u1");
    expect(s.host.state.showPopup).toBe(true);
  });

  test("unexpected error surfaces message in state", async () => {
    const s = setup({ resolveClickLayers: jest.fn(() => Promise.reject(new Error("layers exploded"))) });
    await openPopupForUniqueid(s.host, "u1");
    expect(s.host.state).toMatchObject({ loading: false, loadingAttachments: false, error: "layers exploded" });
  });

  test("superseded call does not touch state", async () => {
    const s = setup();
    s.host.resolveClickLayers = jest.fn(() => {
      s.host._clickGeneration += 1;
      return Promise.resolve([]);
    });
    await openPopupForUniqueid(s.host, "u1");
    expect(s.host.state.loading).toBe(true);
    expect(s.host.state.showPopup).toBe(false);
  });
});
