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
  const rect = (top: number, height: number): DOMRect =>
    ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;

  const sizeContainer = (container: HTMLElement, scrollHeight: number, clientHeight: number): void => {
    Object.defineProperty(container, "scrollHeight", { configurable: true, value: scrollHeight });
    Object.defineProperty(container, "clientHeight", { configurable: true, value: clientHeight });
  };

  test("centres matching data-uniqueid row by scrolling only the container", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<table><tbody><tr class="kadastr-table-row" data-uniqueid="{abc}"></tr></tbody></table>';
    const row = container.querySelector("tr") as HTMLElement;
    const scrollIntoView = jest.fn();
    row.scrollIntoView = scrollIntoView;
    sizeContainer(container, 1000, 200);
    container.getBoundingClientRect = (): DOMRect => rect(100, 200);
    row.getBoundingClientRect = (): DOMRect => rect(500, 40);
    const scrollTo = jest.fn();
    container.scrollTo = scrollTo as unknown as typeof container.scrollTo;
    const host = makeHost({ selecteduniqueid: "ABC" }, { tableContainerRef: { current: container } });
    scrollSelectedRowIntoCenter(host);
    // row at 400px inside container; centre = 400 + 20 - 100 = 320
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 320 }));
    // Never scrolls ancestors (card / Graff-Zaxira swap slot / page).
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test("clamps to the last scroll position for rows at the end of the page", () => {
    const container = document.createElement("div");
    container.innerHTML = '<table><tbody><tr class="kadastr-table-row selected-row"></tr></tbody></table>';
    const row = container.querySelector("tr") as HTMLElement;
    sizeContainer(container, 600, 200);
    container.getBoundingClientRect = (): DOMRect => rect(0, 200);
    row.getBoundingClientRect = (): DOMRect => rect(560, 40);
    const scrollTo = jest.fn();
    container.scrollTo = scrollTo as unknown as typeof container.scrollTo;
    scrollSelectedRowIntoCenter(makeHost({}, { tableContainerRef: { current: container } }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 400 }));
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

  test("maydon sort: NULL areas sorted first are counted before every value", async () => {
    const { layer, queryFeatureCount } = makeLayer(
      [
        { features: [{ attributes: { objectid: 5, maydon: 2.5 } }] },
        { features: [{ attributes: { maydon: null } }] },
      ],
      0,
    );
    const host = makeHost({ featureLayer: layer, tableSort: { column: "maydon", order: "desc" } });
    await resolveTablePageForUniqueid(host, "U");
    const where = (queryFeatureCount.mock.calls[0] as Array<{ where: string }>)[0].where;
    expect(where).toBe(
      "(year=2024) AND (maydon IS NULL OR maydon > 2.5 OR (maydon = 2.5 AND objectid < 5))",
    );
  });

  test("maydon sort: a row without area is placed inside the NULL block", async () => {
    const last = makeLayer(
      [
        { features: [{ attributes: { objectid: 9, maydon: null } }] },
        { features: [{ attributes: { maydon: 4 } }] },
      ],
      0,
    );
    await resolveTablePageForUniqueid(
      makeHost({ featureLayer: last.layer, tableSort: { column: "maydon", order: "asc" } }),
      "U",
    );
    expect((last.queryFeatureCount.mock.calls[0] as Array<{ where: string }>)[0].where).toBe(
      "(year=2024) AND (maydon IS NOT NULL OR (maydon IS NULL AND objectid < 9))",
    );
    const first = makeLayer(
      [
        { features: [{ attributes: { objectid: 9, maydon: null } }] },
        { features: [{ attributes: { maydon: null } }] },
      ],
      0,
    );
    await resolveTablePageForUniqueid(
      makeHost({ featureLayer: first.layer, tableSort: { column: "maydon", order: "asc" } }),
      "U",
    );
    expect((first.queryFeatureCount.mock.calls[0] as Array<{ where: string }>)[0].where).toBe(
      "(year=2024) AND (maydon IS NULL AND objectid < 9)",
    );
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
