const mockRegisterToken = jest.fn();
const mockLayerLoad = jest.fn();
const mockInterceptors: Array<{ urls: RegExp; before: (p: { requestOptions?: { query?: Record<string, unknown> } }) => void }> = [];
let mockSessionToken = "";
let mockFailModules = false;

class MockFeatureLayer {
  url: string;
  constructor(props: { url: string }) {
    this.url = props.url;
  }
  load(): Promise<unknown> {
    return mockLayerLoad(this.url);
  }
}

jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): null => null }),
  SessionManager: {
    getInstance: () => ({ getMainSession: () => ({ token: mockSessionToken }) }),
  },
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (names: string[]) => {
    if (mockFailModules) return Promise.reject(new Error("module load failed"));
    return Promise.resolve(
      names.map((name) => {
        if (name === "esri/identity/IdentityManager") return { registerToken: mockRegisterToken };
        if (name === "esri/layers/FeatureLayer") return MockFeatureLayer;
        if (name === "esri/config") return { request: { interceptors: mockInterceptors } };
        if (name === "esri/request") return jest.fn();
        if (name === "esri/geometry/Extent") return class {};
        throw new Error(`unexpected module ${name}`);
      }),
    );
  },
}));

import {
  detachedQueryLayerAuthFailedUrls,
  detachedQueryLayerCache,
  detachedQueryLayerFailedUrls,
  ensureAgriServerIdentityToken,
  getDetachedQueryLayerForUrl,
  getEsriRequest,
  getExtentClass,
  isAuthFailureMessage,
} from "./detached-query";

const LAYER_URL = "https://h/arcgis/rest/services/agri/MapServer/3";

beforeEach(() => {
  mockRegisterToken.mockReset();
  mockLayerLoad.mockReset();
  mockLayerLoad.mockResolvedValue(undefined);
  mockSessionToken = "";
  mockFailModules = false;
  detachedQueryLayerCache.clear();
  detachedQueryLayerFailedUrls.clear();
  detachedQueryLayerAuthFailedUrls.clear();
});

describe("isAuthFailureMessage", () => {
  test.each([
    [{ details: { httpStatus: 401 } }, true],
    [{ httpStatus: 403 }, true],
    [{ code: 498 }, true],
    [{ code: 499 }, true],
    [{ message: "Invalid token" }, true],
    [{ details: { message: "Login required" } }, true],
    ["Unauthorized access", true],
    [new Error("Unable to complete operation"), false],
    [{ code: 500 }, false],
    [null, false],
  ])("%p -> %p", (err, expected) => {
    expect(isAuthFailureMessage(err)).toBe(expected);
  });
});

describe("module loaders", () => {
  test("PBF interceptor rewrites f=pbf to f=json for sgm.uzspace.uz", () => {
    expect(mockInterceptors).toHaveLength(1);
    const { urls, before } = mockInterceptors[0];
    expect(urls.test("https://sgm.uzspace.uz/arcgis")).toBe(true);
    const query: Record<string, unknown> = { f: "PBF" };
    before({ requestOptions: { query } });
    expect(query.f).toBe("json");
    const other: Record<string, unknown> = { f: "geojson" };
    before({ requestOptions: { query: other } });
    expect(other.f).toBe("geojson");
    expect(() => before({})).not.toThrow();
  });

  test("getEsriRequest and getExtentClass memoize their module promise", async () => {
    const a = await getEsriRequest();
    const b = await getEsriRequest();
    expect(a).toBe(b);
    expect(await getExtentClass()).toBe(await getExtentClass());
  });
});

describe("ensureAgriServerIdentityToken", () => {
  test("does nothing without a token", async () => {
    await ensureAgriServerIdentityToken();
    expect(mockRegisterToken).not.toHaveBeenCalled();
  });

  test("registers the session token for every server prefix and clears auth failures", async () => {
    mockSessionToken = "tok";
    detachedQueryLayerAuthFailedUrls.add(LAYER_URL);
    detachedQueryLayerFailedUrls.add(LAYER_URL);
    await expect(ensureAgriServerIdentityToken()).resolves.toBe(true);
    expect(mockRegisterToken).toHaveBeenCalledTimes(4);
    expect(mockRegisterToken.mock.calls.every(([arg]) => arg.token === "tok")).toBe(true);
    expect(detachedQueryLayerAuthFailedUrls.size).toBe(0);
    expect(detachedQueryLayerFailedUrls.size).toBe(0);
  });

  test("one failing server prefix does not stop the others", async () => {
    mockSessionToken = "tok";
    mockRegisterToken.mockImplementationOnce(() => {
      throw new Error("bad server");
    });
    await expect(ensureAgriServerIdentityToken()).resolves.toBe(true);
    expect(mockRegisterToken).toHaveBeenCalledTimes(4);
  });
});

describe("getDetachedQueryLayerForUrl", () => {
  test("rejects empty and non-layer endpoints (and remembers them)", async () => {
    await expect(getDetachedQueryLayerForUrl("")).resolves.toBeNull();
    const root = "https://h/arcgis/rest/services/agri/MapServer";
    await expect(getDetachedQueryLayerForUrl(root)).resolves.toBeNull();
    expect(detachedQueryLayerFailedUrls.has(root)).toBe(true);
  });

  test("creates, loads and caches a FeatureLayer per clean URL", async () => {
    const a = await getDetachedQueryLayerForUrl(`${LAYER_URL}/`);
    const b = await getDetachedQueryLayerForUrl(LAYER_URL);
    expect(a).toBeInstanceOf(MockFeatureLayer);
    expect(b).toBe(a);
    expect(detachedQueryLayerCache.get(LAYER_URL)).toBe(a);
  });

  test("FeatureServer roots are accepted", async () => {
    await expect(
      getDetachedQueryLayerForUrl("https://h/arcgis/rest/services/x/FeatureServer"),
    ).resolves.toBeInstanceOf(MockFeatureLayer);
  });

  test("non-auth load failures are blacklisted permanently", async () => {
    mockLayerLoad.mockRejectedValueOnce(new Error("Source type Group Layer is not supported"));
    await expect(getDetachedQueryLayerForUrl(LAYER_URL)).resolves.toBeNull();
    expect(detachedQueryLayerFailedUrls.has(LAYER_URL)).toBe(true);
    expect(detachedQueryLayerCache.has(LAYER_URL)).toBe(false);
    await expect(getDetachedQueryLayerForUrl(LAYER_URL)).resolves.toBeNull();
    expect(mockLayerLoad).toHaveBeenCalledTimes(1);
  });

  test("auth load failures are retryable", async () => {
    mockLayerLoad.mockRejectedValueOnce({ details: { httpStatus: 499 } });
    await expect(getDetachedQueryLayerForUrl(LAYER_URL)).resolves.toBeNull();
    expect(detachedQueryLayerAuthFailedUrls.has(LAYER_URL)).toBe(true);
    expect(detachedQueryLayerFailedUrls.has(LAYER_URL)).toBe(false);
    await expect(getDetachedQueryLayerForUrl(LAYER_URL)).resolves.toBeInstanceOf(MockFeatureLayer);
  });

  test("module load failure returns null and blacklists the URL", async () => {
    mockFailModules = true;
    await expect(getDetachedQueryLayerForUrl(LAYER_URL)).resolves.toBeNull();
    expect(detachedQueryLayerFailedUrls.has(LAYER_URL)).toBe(true);
  });
});
