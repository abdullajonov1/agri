import {
  cacheKey,
  flLog,
  getQueryUrl,
  isValidMapExtent,
  layerLabel,
  pruneTimedCache,
  stableCachePayload,
} from "./query-cache";
import { makeLayer } from "./__test-utils__/fake-layer";

describe("getQueryUrl", () => {
  test("appends /query to an indexed layer URL and trims trailing slashes", () => {
    expect(getQueryUrl(makeLayer({ url: "https://h/MapServer/3//" }))).toBe(
      "https://h/MapServer/3/query",
    );
  });

  test("appends layerId to a service root", () => {
    expect(getQueryUrl(makeLayer({ url: "https://h/MapServer", layerId: 5 }))).toBe(
      "https://h/MapServer/5/query",
    );
  });

  test("does not double the index when the URL already has one", () => {
    expect(getQueryUrl(makeLayer({ url: "https://h/MapServer/2", layerId: 5 }))).toBe(
      "https://h/MapServer/2/query",
    );
  });

  test("returns empty for a layer without URL", () => {
    expect(getQueryUrl(makeLayer())).toBe("");
    expect(getQueryUrl(null)).toBe("");
  });
});

test("layerLabel prefers title, then url, then id", () => {
  expect(layerLabel(makeLayer({ title: "T", url: "U", id: "I" }))).toBe("T");
  expect(layerLabel(makeLayer({ url: "U", id: "I" }))).toBe("U");
  expect(layerLabel(makeLayer({ id: 7 }))).toBe("7");
  expect(layerLabel(undefined)).toBe("unknown");
});

test("cacheKey falls back to the layer label when there is no URL", () => {
  expect(cacheKey(makeLayer({ url: "https://h/MapServer/1" }), "count", "1=1")).toBe(
    "https://h/MapServer/1/query|count|1=1",
  );
  expect(cacheKey(makeLayer({ title: "Fields" }), "count", "x")).toBe("Fields|count|x");
});

describe("stableCachePayload", () => {
  test("is independent of key order", () => {
    expect(stableCachePayload({ b: 1, a: [1, { d: 2, c: 3 }] })).toBe(
      stableCachePayload({ a: [1, { c: 3, d: 2 }], b: 1 }),
    );
  });

  test("serializes primitives and undefined distinctly", () => {
    expect(stableCachePayload(undefined)).toBe("__undefined__");
    expect(stableCachePayload(null)).toBe("null");
    expect(stableCachePayload("x")).toBe('"x"');
    expect(stableCachePayload({ a: undefined })).toBe('{"a":__undefined__}');
  });
});

test("pruneTimedCache removes only expired entries", () => {
  const cache = new Map<string, { expires: number; value: Promise<number> }>([
    ["old", { expires: 100, value: Promise.resolve(1) }],
    ["edge", { expires: 200, value: Promise.resolve(2) }],
    ["fresh", { expires: 300, value: Promise.resolve(3) }],
  ]);
  pruneTimedCache(cache, 200);
  expect(Array.from(cache.keys())).toEqual(["fresh"]);
});

describe("isValidMapExtent", () => {
  test.each([
    [null, false],
    [{ xmin: 0, ymin: 0, xmax: 0, ymax: 0 }, false],
    [{ xmin: -180, ymin: -90, xmax: 180, ymax: 90 }, false],
    [{ xmin: 1, ymin: 1, xmax: 1.0001, ymax: 2 }, false],
    [{ xmin: Number.NaN, ymin: 1, xmax: 2, ymax: 2 }, false],
    [{ xmin: 60, ymin: 40, xmax: 61, ymax: 41 }, true],
  ])("%p -> %p", (extent, expected) => {
    expect(isValidMapExtent(extent)).toBe(expected);
  });
});

describe("flLog", () => {
  afterEach(() => {
    localStorage.removeItem("agri_fl_data_debug");
    jest.restoreAllMocks();
  });

  test("is silent unless the debug flag is set", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    flLog("phase");
    expect(spy).not.toHaveBeenCalled();
    localStorage.setItem("agri_fl_data_debug", "1");
    flLog("phase", { a: 1 });
    expect(spy).toHaveBeenCalledWith("[AgriFLData]", "phase", { a: 1 });
  });
});
