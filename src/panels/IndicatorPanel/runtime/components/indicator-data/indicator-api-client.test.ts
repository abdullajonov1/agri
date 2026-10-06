import {
  INDICATOR_API_TIMEOUT_MS,
  parseIndicatorApiValue,
  requestIndicatorApiValue,
} from "./indicator-api-client";

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

const makeResponse = (body: string, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    headers: { get: (): null => null },
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
  }) as unknown as Response;

const rejectionOf = (p: Promise<unknown>): Promise<Error> =>
  p.then(
    () => {
      throw new Error("expected rejection");
    },
    (e: unknown) => e as Error,
  );

describe("parseIndicatorApiValue", () => {
  test.each([
    [{ total: 12 }, "", 12],
    [{ result: { value: "7" } }, "", 7],
    [{ custom: 3, total: 9 }, "custom", 3],
    [{ maydon: 5 }, "", 5],
    [42, "", 42],
    [{ total: "abc" }, "", null],
    [null, "", null],
    ["text", "", null],
  ])("parses %j (field=%s) → %s", (data, field, expected) => {
    expect(parseIndicatorApiValue(data, field)).toBe(expected);
  });
});

describe("requestIndicatorApiValue", () => {
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

  test("returns the parsed value and sends Accept: application/json", async () => {
    fetchMock.mockResolvedValue(makeResponse('{"total": 1234.4}'));
    await expect(requestIndicatorApiValue("https://api.test/s", null, "")).resolves.toBe(1234.4);
    const init = fetchMock.mock.calls[0][1];
    expect(init?.method).toBe("GET");
    expect(init?.headers).toEqual({ Accept: "application/json" });
  });

  test.each([400, 404, 500, 503])("maps HTTP %i to the legacy message", async (status) => {
    fetchMock.mockResolvedValue(makeResponse("nope", status));
    const err = await rejectionOf(requestIndicatorApiValue("https://api.test/s", null, ""));
    expect(err.message).toBe(`API request failed with status ${status}`);
  });

  test("rejects malformed JSON", async () => {
    fetchMock.mockResolvedValue(makeResponse("{bad"));
    const err = await rejectionOf(requestIndicatorApiValue("https://api.test/s", null, ""));
    expect(err.message).toMatch(/invalid json/i);
  });

  test("times out a hung API", async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }),
    );
    const pending = rejectionOf(requestIndicatorApiValue("https://api.test/s", null, ""));
    jest.advanceTimersByTime(INDICATOR_API_TIMEOUT_MS + 1);
    const err = await pending;
    expect(err.message).toMatch(/timed out/i);
  });

  test("propagates a caller abort as AbortError", async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }),
    );
    const controller = new AbortController();
    const pending = rejectionOf(
      requestIndicatorApiValue("https://api.test/s", controller.signal, ""),
    );
    controller.abort();
    expect((await pending).name).toBe("AbortError");
  });

  test("returns null for a non-numeric payload", async () => {
    fetchMock.mockResolvedValue(makeResponse('{"total": "n/a"}'));
    await expect(requestIndicatorApiValue("https://api.test/s", null, "")).resolves.toBeNull();
  });
});
