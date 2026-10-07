import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState, RecordData } from "../graff-state";
import {
  buildUniqueidWhere,
  ensureSelectedRowVisible,
  goToTablePage,
  resolveTablePageForUniqueid,
  scheduleScrollSelectedRowIntoCenter,
  scrollSelectedRowIntoCenter,
} from "./table-handlers";

type StatePatch = Partial<AgriGraffWidgetState>;

const makeHost = (state: Partial<AgriGraffWidgetState> = {}, extra: Record<string, unknown> = {}): GraffWidgetHost => {
  const host = {
    state: {
      records: [] as RecordData[],
      viewMode: "table",
      currentPage: 1,
      totalRecordCount: 100,
      loading: false,
      tableSort: null,
      ...state,
    },
    RECORDS_PER_PAGE: 10,
    _isMounted: true,
    _pendingScrollUniqueid: null,
    _selectionPageResolveToken: 0,
    tableContainerRef: { current: null },
    normalizeUniqueidKey: (s: string): string => s.replace(/[{}]/g, "").toUpperCase(),
    recordMatchesUniqueid: (r: RecordData, id: string): boolean => r.uniqueid === id,
    scheduleScrollSelectedRowIntoCenter: jest.fn(),
    scrollSelectedRowIntoCenter: jest.fn(),
    resolveTablePageForUniqueid: jest.fn((): Promise<number | null> => Promise.resolve(null)),
    fetchData: jest.fn((): Promise<void> => Promise.resolve()),
    buildWhereClause: (): string => "year=2024",
    buildUniqueidWhere: (id: string): string => `uniqueid='${id}'`,
    getMaydonSortFieldName: (): string | null => "maydon",
    ...extra,
  } as unknown as GraffWidgetHost;
  host.setState = ((patch: StatePatch, cb?: () => void): void => {
    host.state = { ...host.state, ...patch };
    cb?.();
  }) as GraffWidgetHost["setState"];
  return host;
};

describe("scrollSelectedRowIntoCenter", () => {
  test("scrolls selected row, or matching data-uniqueid row", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<table><tbody><tr class="kadastr-table-row" data-uniqueid="{abc}"></tr></tbody></table>';
    const row = container.querySelector("tr") as HTMLElement;
    const scrollIntoView = jest.fn();
    row.scrollIntoView = scrollIntoView;
    const host = makeHost({ selecteduniqueid: "ABC" }, { tableContainerRef: { current: container } });
    scrollSelectedRowIntoCenter(host);
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "center" }));
  });

  test("falls back to container.scrollTo when scrollIntoView throws", () => {
    const container = document.createElement("div");
    container.innerHTML = '<table><tbody><tr class="kadastr-table-row selected-row"></tr></tbody></table>';
    const row = container.querySelector("tr") as HTMLElement;
    row.scrollIntoView = (): void => {
      throw new Error("unsupported");
    };
    const scrollTo = jest.fn();
    container.scrollTo = scrollTo as unknown as typeof container.scrollTo;
    scrollSelectedRowIntoCenter(makeHost({}, { tableContainerRef: { current: container } }));
    expect(scrollTo).toHaveBeenCalled();
  });

  test("no container / no row is a no-op", () => {
    expect(() => scrollSelectedRowIntoCenter(makeHost())).not.toThrow();
    const container = document.createElement("div");
    expect(() =>
      scrollSelectedRowIntoCenter(makeHost({ selecteduniqueid: "X" }, { tableContainerRef: { current: container } })),
    ).not.toThrow();
  });
});

test("scheduleScrollSelectedRowIntoCenter runs via frames and timers", () => {
  jest.useFakeTimers();
  const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback): number => {
    cb(0);
    return 1;
  });
  const host = makeHost();
  scheduleScrollSelectedRowIntoCenter(host);
  jest.advanceTimersByTime(300);
  expect(host.scrollSelectedRowIntoCenter).toHaveBeenCalledTimes(3);
  raf.mockRestore();
  jest.useRealTimers();
});

test("buildUniqueidWhere covers braced and plain forms", () => {
  const where = buildUniqueidWhere(makeHost(), "abc");
  expect(where).toContain("abc");
});

describe("resolveTablePageForUniqueid", () => {
  const makeLayer = (responses: Array<unknown>, count: number | null): {
    layer: __esri.FeatureLayer;
    queryFeatures: jest.Mock;
    queryFeatureCount: jest.Mock;
  } => {
    const queryFeatures = jest.fn();
    responses.forEach((r) => queryFeatures.mockResolvedValueOnce(r));
    const queryFeatureCount = jest.fn((): Promise<number | null> => Promise.resolve(count));
    const layer = {
      objectIdField: "objectid",
      load: (): Promise<void> => Promise.reject(new Error("ignored")),
      createQuery: (): Record<string, unknown> => ({}),
      queryFeatures,
      queryFeatureCount,
    } as unknown as __esri.FeatureLayer;
    return { layer, queryFeatures, queryFeatureCount };
  };

  test("null without layer or id", async () => {
    await expect(resolveTablePageForUniqueid(makeHost(), "U")).resolves.toBeNull();
  });

  test("computes page from rows before", async () => {
    const { layer, queryFeatureCount } = makeLayer([{ features: [{ attributes: { objectid: 50 } }] }], 25);
    const host = makeHost({ featureLayer: layer });
    await expect(resolveTablePageForUniqueid(host, "U")).resolves.toBe(3);
    expect(queryFeatureCount).toHaveBeenCalledWith({ where: "(year=2024) AND (objectid < 50)" });
  });

  test("maydon sort uses value comparison", async () => {
    const { layer, queryFeatureCount } = makeLayer([{ features: [{ attributes: { objectid: 5, maydon: 2.5 } }] }], 0);
    const host = makeHost({ featureLayer: layer, tableSort: { column: "maydon", order: "desc" } });
    await expect(resolveTablePageForUniqueid(host, "U")).resolves.toBe(1);
    const where = (queryFeatureCount.mock.calls[0] as Array<{ where: string }>)[0].where;
    expect(where).toContain("maydon > 2.5");
  });

  test("fallback: id outside filter returns null; inside filter works", async () => {
    const outside = makeLayer([{ features: [] }, { features: [{ attributes: { objectid: 7 } }] }, { features: [] }], 0);
    await expect(resolveTablePageForUniqueid(makeHost({ featureLayer: outside.layer }), "U")).resolves.toBeNull();
    const inside = makeLayer(
      [{ features: [] }, { features: [{ attributes: { objectid: 7 } }] }, { features: [{ attributes: { objectid: 7 } }] }],
      12,
    );
    await expect(resolveTablePageForUniqueid(makeHost({ featureLayer: inside.layer }), "U")).resolves.toBe(2);
    const missing = makeLayer([{ features: [] }, { features: [] }], 0);
    await expect(resolveTablePageForUniqueid(makeHost({ featureLayer: missing.layer }), "U")).resolves.toBeNull();
  });

  test("invalid count or query error -> null", async () => {
    const bad = makeLayer([{ features: [{ attributes: { objectid: 1 } }] }], null);
    await expect(resolveTablePageForUniqueid(makeHost({ featureLayer: bad.layer }), "U")).resolves.toBeNull();
    const err = makeLayer([], 0);
    err.queryFeatures.mockRejectedValue(new Error("x"));
    await expect(resolveTablePageForUniqueid(makeHost({ featureLayer: err.layer }), "U")).resolves.toBeNull();
  });
});

describe("ensureSelectedRowVisible", () => {
  test("no id is no-op; graph mode only stores pending id", async () => {
    const host = makeHost({ viewMode: "graph" });
    await ensureSelectedRowVisible(host);
    expect(host._pendingScrollUniqueid).toBeNull();
    await ensureSelectedRowVisible(host, "U");
    expect(host._pendingScrollUniqueid).toBe("U");
    expect(host.resolveTablePageForUniqueid).not.toHaveBeenCalled();
  });

  test("row on current page scrolls immediately", async () => {
    const host = makeHost({ records: [{ uniqueid: "U" }] });
    await ensureSelectedRowVisible(host, "U");
    expect(host.scheduleScrollSelectedRowIntoCenter).toHaveBeenCalled();
    expect(host._pendingScrollUniqueid).toBeNull();
  });

  test("waits while loading", async () => {
    const host = makeHost({ loading: true });
    await ensureSelectedRowVisible(host, "U");
    expect(host.resolveTablePageForUniqueid).not.toHaveBeenCalled();
  });

  test("switches page and refetches", async () => {
    const host = makeHost({}, { resolveTablePageForUniqueid: jest.fn((): Promise<number> => Promise.resolve(4)) });
    await ensureSelectedRowVisible(host, "U");
    expect(host.state.currentPage).toBe(4);
    expect(host.fetchData).toHaveBeenCalledWith({ preservePage: true });
  });

  test("same page or unresolved page just scrolls", async () => {
    const same = makeHost({}, { resolveTablePageForUniqueid: jest.fn((): Promise<number> => Promise.resolve(1)) });
    await ensureSelectedRowVisible(same, "U");
    expect(same.scheduleScrollSelectedRowIntoCenter).toHaveBeenCalled();
    const none = makeHost();
    await ensureSelectedRowVisible(none, "U");
    expect(none.scheduleScrollSelectedRowIntoCenter).toHaveBeenCalled();
  });
});

describe("goToTablePage", () => {
  test("clamps and fetches", () => {
    const host = makeHost();
    goToTablePage(host, 99);
    expect(host.state.currentPage).toBe(10);
    expect(host.fetchData).toHaveBeenCalled();
    goToTablePage(host, -3);
    expect(host.state.currentPage).toBe(1);
  });

  test("same page with records is a no-op", () => {
    const host = makeHost({ records: [{ uniqueid: "a" }] });
    goToTablePage(host, 1);
    expect(host.fetchData).not.toHaveBeenCalled();
  });
});
