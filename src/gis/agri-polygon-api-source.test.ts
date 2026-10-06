jest.mock("../vendor/geotiff-decoders", () => ({
  RawDecoder: class {},
  LzwDecoder: class {},
  DeflateDecoder: class {},
  PackbitsDecoder: class {},
  JpegDecoder: class {},
  LercDecoder: class {},
  lercZstd: {},
  ZstdDecoder: class {},
  zstdInit: {},
  WebImageDecoder: class {},
}));

const mockFromArrayBuffer = jest.fn();
jest.mock("geotiff", () => ({
  addDecoder: jest.fn(),
  fromArrayBuffer: (...args: unknown[]) => mockFromArrayBuffer(...args),
}));

import {
  fetchPolygonAvailableDates,
  fetchPolygonExportImageTiff,
  getExportImageSeasonMonths,
  isExportImagePolygonNotFoundError,
  isRegionDateWithoutImagery,
  resolveExportImageWithDateWalk,
  warmPolygonApiConnection,
  EXPORT_IMAGE_MAX_BYTES,
  EXPORT_IMAGE_MAX_PIXELS,
} from "./agri-polygon-api-source";

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

interface FakeResponseInit {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

const makeResponse = (body: string | ArrayBuffer, init: FakeResponseInit = {}): Response => {
  const status = init.status ?? 200;
  const headers = new Map(
    Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const text = typeof body === "string" ? body : "";
  const buffer = typeof body === "string" ? new TextEncoder().encode(body).buffer : body;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? "",
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(JSON.parse(text)),
    arrayBuffer: () => Promise.resolve(buffer),
  } as unknown as Response;
};

const hangingFetch = (): FetchMock =>
  jest.fn((_url: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    }),
  );

interface FakeImageSpec {
  width?: number;
  height?: number;
  bbox?: number[];
  band?: number[];
}

const fakeTiff = (spec: FakeImageSpec = {}) => {
  const width = spec.width ?? 2;
  const height = spec.height ?? 2;
  const readRasters = jest.fn(() =>
    Promise.resolve([Float32Array.from(spec.band ?? [0.1, 0.2, 0.3, 0.4])]),
  );
  return {
    readRasters,
    tiff: {
      getImage: () =>
        Promise.resolve({
          getBoundingBox: () => spec.bbox ?? [69, 41, 69.01, 41.01],
          getWidth: () => width,
          getHeight: () => height,
          getSamplesPerPixel: () => 1,
          getGeoKeys: () => ({ GeographicTypeGeoKey: 4326 }),
          getGDALNoData: (): null => null,
          readRasters,
        }),
    },
  };
};

const rejectionOf = (p: Promise<unknown>): Promise<Error & Record<string, unknown>> =>
  p.then(
    () => {
      throw new Error("expected rejection");
    },
    (e: unknown) => e as Error & Record<string, unknown>,
  );

describe("agri-polygon-api-source", () => {
  const realFetch = global.fetch;
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  let fetchMock: FetchMock;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = function getContext() {
      return {
        createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: jest.fn(),
        drawImage: jest.fn(),
      };
    } as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = realGetContext;
  });

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    mockFromArrayBuffer.mockReset();
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.useRealTimers();
  });

  describe("fetchPolygonAvailableDates", () => {
    test("returns only well-formed YYYY-MM-DD dates", async () => {
      fetchMock.mockResolvedValue(
        makeResponse(JSON.stringify({ dates: ["2026-04-28", "bad", 42, null, "2026-03-01"] })),
      );
      await expect(fetchPolygonAvailableDates("uid-valid", 1, 2026)).resolves.toEqual([
        "2026-04-28",
        "2026-03-01",
      ]);
    });

    test("returns [] when dates is not an array", async () => {
      fetchMock.mockResolvedValue(makeResponse(JSON.stringify({ dates: "x" })));
      await expect(fetchPolygonAvailableDates("uid-not-array", 1, 2026)).resolves.toEqual([]);
    });

    test("rejects with status on HTTP 500", async () => {
      fetchMock.mockResolvedValue(makeResponse("server down", { status: 500 }));
      const err = await rejectionOf(fetchPolygonAvailableDates("uid-500", 1, 2026));
      expect(err.status).toBe(500);
    });

    test("rejects on malformed JSON", async () => {
      fetchMock.mockResolvedValue(makeResponse("{oops"));
      const err = await rejectionOf(fetchPolygonAvailableDates("uid-json", 1, 2026));
      expect(err.kind).toBe("parse");
    });

    test("times out a hung request", async () => {
      jest.useFakeTimers();
      global.fetch = hangingFetch() as unknown as typeof fetch;
      const pending = rejectionOf(fetchPolygonAvailableDates("uid-timeout", 1, 2026));
      jest.advanceTimersByTime(15001);
      const err = await pending;
      expect(err.kind).toBe("timeout");
    });

    test("dedupes concurrent requests for the same key", async () => {
      fetchMock.mockResolvedValue(makeResponse(JSON.stringify({ dates: ["2026-04-01"] })));
      const [a, b] = await Promise.all([
        fetchPolygonAvailableDates("uid-dedupe", 1, 2026),
        fetchPolygonAvailableDates("uid-dedupe", 1, 2026),
      ]);
      expect(a).toEqual(b);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchPolygonExportImageTiff", () => {
    const params = (uniqueid: string, regionId = 10, rasterDate = "2026-04-28") => ({
      uniqueid,
      regionId,
      rasterDate,
    });

    test("decodes a float GeoTIFF and returns header stats", async () => {
      const { tiff } = fakeTiff();
      mockFromArrayBuffer.mockResolvedValue(tiff);
      fetchMock.mockResolvedValue(
        makeResponse(new Uint8Array(8).buffer, {
          headers: { "X-Index-Min": "0.1", "X-Index-Max": "0.4", "X-Index-Mean": "0.25" },
        }),
      );
      const result = await fetchPolygonExportImageTiff(params("uid-ok"));
      expect(result.width).toBe(2);
      expect(result.epsgCode).toBe(4326);
      expect(result.indexMin).toBe(0.1);
      expect(result.indexMax).toBe(0.4);
      expect(result.values).toHaveLength(4);
    });

    test("learns region gaps from 400 no-imagery", async () => {
      fetchMock.mockResolvedValue(
        makeResponse("No imagery available for region_id=11 on 2026-04-20", { status: 400 }),
      );
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-gap", 11, "2026-04-20")));
      expect(err.status).toBe(400);
      expect(isRegionDateWithoutImagery(11, "2026-04-20")).toBe(true);
    });

    test("learns crop season from 400 out-of-season", async () => {
      fetchMock.mockResolvedValue(
        makeResponse(
          "Indices for crop_id=6 (wheat) are calculated only in March, April; September is outside the season",
          { status: 400 },
        ),
      );
      await rejectionOf(fetchPolygonExportImageTiff(params("uid-season", 12, "2026-09-01")));
      expect(getExportImageSeasonMonths("uid-season")).toEqual([3, 4]);
    });

    test("classifies 404 polygon-not-found", async () => {
      fetchMock.mockResolvedValue(
        makeResponse("uniqueid=abc not found", { status: 404 }),
      );
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-404", 13)));
      expect(isExportImagePolygonNotFoundError(err)).toBe(true);
    });

    test("truncates long error bodies", async () => {
      fetchMock.mockResolvedValue(makeResponse("z".repeat(10000), { status: 500 }));
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-long", 14)));
      expect(String(err.responseText).length).toBeLessThanOrEqual(520);
      expect(err.message.length).toBeLessThan(600);
    });

    test("keeps the 25s timeout message", async () => {
      jest.useFakeTimers();
      global.fetch = hangingFetch() as unknown as typeof fetch;
      const pending = rejectionOf(fetchPolygonExportImageTiff(params("uid-slow", 15)));
      jest.advanceTimersByTime(25001);
      const err = await pending;
      expect(err.message).toContain("25s");
    });

    test("rejects an oversized download before decoding", async () => {
      fetchMock.mockResolvedValue(
        makeResponse(new Uint8Array(4).buffer, {
          headers: { "content-length": String(EXPORT_IMAGE_MAX_BYTES + 1) },
        }),
      );
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-big", 16)));
      expect(err.kind).toBe("too-large");
      expect(mockFromArrayBuffer).not.toHaveBeenCalled();
    });

    test("rejects oversized raster dimensions before reading pixels", async () => {
      const side = Math.ceil(Math.sqrt(EXPORT_IMAGE_MAX_PIXELS)) + 1;
      const { tiff, readRasters } = fakeTiff({ width: side, height: side });
      mockFromArrayBuffer.mockResolvedValue(tiff);
      fetchMock.mockResolvedValue(makeResponse(new Uint8Array(8).buffer));
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-huge", 17)));
      expect(err.message).toMatch(/too large/i);
      expect(readRasters).not.toHaveBeenCalled();
    });

    test("rejects an invalid bounding box", async () => {
      const { tiff } = fakeTiff({ bbox: [5, 5, 1, 1] });
      mockFromArrayBuffer.mockResolvedValue(tiff);
      fetchMock.mockResolvedValue(makeResponse(new Uint8Array(8).buffer));
      const err = await rejectionOf(fetchPolygonExportImageTiff(params("uid-bbox", 18)));
      expect(err.message).toBe("GeoTIFF bounding box/size invalid");
    });
  });

  describe("resolveExportImageWithDateWalk", () => {
    test("steps past a no-imagery date to the next one, sequentially", async () => {
      const { tiff } = fakeTiff();
      mockFromArrayBuffer.mockResolvedValue(tiff);
      fetchMock
        .mockResolvedValueOnce(
          makeResponse("No imagery in AdminRaster for region='x' on 2026-04-28", { status: 404 }),
        )
        .mockResolvedValueOnce(makeResponse(new Uint8Array(8).buffer));
      const out = await resolveExportImageWithDateWalk({
        uniqueid: "uid-walk",
        regionId: 19,
        year: 2026,
        dates: ["2026-04-20", "2026-04-28"],
      });
      expect(out?.date).toBe("2026-04-20");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  test("warmPolygonApiConnection sends a bounded request and swallows failures", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(() => warmPolygonApiConnection()).not.toThrow();
    await Promise.resolve();
    expect(fetchMock.mock.calls[0][1]?.signal).toBeDefined();
  });
});
