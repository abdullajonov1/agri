import {
  AgriHttpError,
  AGRI_ESRI_REQUEST_TIMEOUT_MS,
  fetchArrayBuffer,
  fetchJson,
  fetchWithTimeout,
  isAgriHttpTimeout,
  truncateResponseText,
} from "./agri-http";

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

const makeResponse = (
  body: string | ArrayBuffer,
  init: { status?: number; statusText?: string; headers?: Record<string, string> } = {},
): Response => {
  const status = init.status ?? 200;
  const headers = new Map(
    Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const asText = typeof body === "string" ? body : "";
  const asBuffer =
    typeof body === "string" ? new TextEncoder().encode(body).buffer : body;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? "",
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
    text: () => Promise.resolve(asText),
    json: () => Promise.resolve(JSON.parse(asText)),
    arrayBuffer: () => Promise.resolve(asBuffer),
  } as unknown as Response;
};

const unexpectedSuccess = (): AgriHttpError => {
  throw new Error("expected the request to reject");
};
const asHttpError = (e: unknown): AgriHttpError => e as AgriHttpError;

/** fetch that never settles until its signal aborts — models a hung server. */
const hangingFetch = (): FetchMock =>
  jest.fn((_url: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("The operation was aborted.");
        err.name = "AbortError";
        reject(err);
      });
    }),
  );

describe("agri-http", () => {
  const realFetch = global.fetch;
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.useRealTimers();
  });

  test("exports a 30s esriRequest timeout constant", () => {
    expect(AGRI_ESRI_REQUEST_TIMEOUT_MS).toBe(30000);
  });

  describe("fetchJson", () => {
    test("returns parsed JSON on 200", async () => {
      fetchMock.mockResolvedValue(makeResponse('{"total":5}'));
      await expect(fetchJson("https://x.test/a", { timeoutMs: 1000 })).resolves.toEqual({
        total: 5,
      });
      expect(fetchMock.mock.calls[0][1]?.signal).toBeDefined();
    });

    test.each([400, 404, 500, 503])("throws AgriHttpError on HTTP %i", async (status) => {
      fetchMock.mockResolvedValue(makeResponse("boom", { status, statusText: "Bad" }));
      const err = await fetchJson("https://x.test/a", { timeoutMs: 1000 }).then(unexpectedSuccess, asHttpError);
      expect(err).toBeInstanceOf(AgriHttpError);
      expect(err.status).toBe(status);
      expect(err.responseText).toBe("boom");
      expect(err.url).toBe("https://x.test/a");
      expect(err.message).toContain(`HTTP ${status}`);
    });

    test("truncates long error bodies", async () => {
      fetchMock.mockResolvedValue(makeResponse("x".repeat(5000), { status: 500 }));
      const err = await fetchJson("https://x.test/a", { timeoutMs: 1000 }).then(unexpectedSuccess, asHttpError);
      expect(err.responseText.length).toBeLessThanOrEqual(520);
      expect(err.message.length).toBeLessThan(600);
    });

    test("throws a parse error on malformed JSON", async () => {
      fetchMock.mockResolvedValue(makeResponse("{not json"));
      const err = await fetchJson("https://x.test/a", { timeoutMs: 1000 }).then(unexpectedSuccess, asHttpError);
      expect(err).toBeInstanceOf(AgriHttpError);
      expect(err.kind).toBe("parse");
    });

    test("times out a hung request", async () => {
      jest.useFakeTimers();
      global.fetch = hangingFetch() as unknown as typeof fetch;
      const pending = fetchJson("https://x.test/a", { timeoutMs: 1000 }).then(unexpectedSuccess, asHttpError);
      jest.advanceTimersByTime(1001);
      const err = await pending;
      expect(err).toBeInstanceOf(AgriHttpError);
      expect(isAgriHttpTimeout(err)).toBe(true);
      expect(err.kind).toBe("timeout");
    });

    test("propagates a caller abort as AbortError (not a timeout)", async () => {
      global.fetch = hangingFetch() as unknown as typeof fetch;
      const controller = new AbortController();
      const pending = fetchJson("https://x.test/a", {
        timeoutMs: 10000,
        signal: controller.signal,
      }).then(unexpectedSuccess, asHttpError);
      controller.abort();
      const err = await pending;
      expect(err.name).toBe("AbortError");
      expect(isAgriHttpTimeout(err)).toBe(false);
    });

    test("rejects immediately when the caller signal is already aborted", async () => {
      const controller = new AbortController();
      controller.abort();
      const err = await fetchJson("https://x.test/a", {
        timeoutMs: 1000,
        signal: controller.signal,
      }).then(unexpectedSuccess, asHttpError);
      expect(err.name).toBe("AbortError");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test("wraps network failures with kind=network", async () => {
      fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
      const err = await fetchJson("https://x.test/a", { timeoutMs: 1000 }).then(unexpectedSuccess, asHttpError);
      expect(err).toBeInstanceOf(AgriHttpError);
      expect(err.kind).toBe("network");
    });

    test("rejects oversized declared content-length", async () => {
      fetchMock.mockResolvedValue(
        makeResponse('{"a":1}', { headers: { "content-length": "999999" } }),
      );
      const err = await fetchJson("https://x.test/a", {
        timeoutMs: 1000,
        maxBytes: 100,
      }).then(unexpectedSuccess, asHttpError);
      expect(err.kind).toBe("too-large");
    });
  });

  describe("fetchArrayBuffer", () => {
    test("returns bytes and the response on 200", async () => {
      const bytes = new Uint8Array([1, 2, 3]).buffer;
      fetchMock.mockResolvedValue(makeResponse(bytes, { headers: { "x-index-min": "0.1" } }));
      const { buffer, response } = await fetchArrayBuffer("https://x.test/t", {
        timeoutMs: 1000,
        maxBytes: 10,
      });
      expect(buffer.byteLength).toBe(3);
      expect(response.headers.get("X-Index-Min")).toBe("0.1");
    });

    test("rejects an oversized body even without content-length", async () => {
      fetchMock.mockResolvedValue(makeResponse(new Uint8Array(50).buffer));
      const err = await fetchArrayBuffer("https://x.test/t", {
        timeoutMs: 1000,
        maxBytes: 10,
      }).then(unexpectedSuccess, asHttpError);
      expect(err).toBeInstanceOf(AgriHttpError);
      expect(err.kind).toBe("too-large");
    });
  });

  describe("fetchWithTimeout", () => {
    test("clears its timer after success", async () => {
      jest.useFakeTimers();
      fetchMock.mockResolvedValue(makeResponse("ok"));
      await fetchWithTimeout("https://x.test/a", { timeoutMs: 1000 });
      expect(jest.getTimerCount()).toBe(0);
    });

    test("forwards method and headers", async () => {
      fetchMock.mockResolvedValue(makeResponse("ok"));
      await fetchWithTimeout("https://x.test/a", {
        timeoutMs: 1000,
        init: { method: "GET", headers: { accept: "application/json" } },
      });
      const init = fetchMock.mock.calls[0][1];
      expect(init?.method).toBe("GET");
      expect(init?.headers).toEqual({ accept: "application/json" });
    });
  });

  test("truncateResponseText keeps short text and marks cut text", () => {
    expect(truncateResponseText("abc")).toBe("abc");
    const cut = truncateResponseText("y".repeat(1000), 10);
    expect(cut.startsWith("yyyyyyyyyy")).toBe(true);
    expect(cut.length).toBeLessThan(20);
  });
});
