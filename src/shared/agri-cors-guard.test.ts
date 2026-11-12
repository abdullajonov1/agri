import {
  addTokenToRequest,
  agriTokenServerPrefixes,
  applyAgriCorsGuard,
  applyAgriTokenInterceptor,
  collectAgriArcgisUrls,
  findDataSourceJson,
  findPortalToken,
  originOf,
  type InterceptorLike,
  type RequestConfigLike,
} from "./agri-cors-guard";

const portalUrl = "https://sgm.uzspace.uz/portal";

describe("findPortalToken", () => {
  const now = 1_000_000;
  const portal = { server: "https://sgm.uzspace.uz/portal", token: "PT", expires: now + 3_600_000 };

  test("Builder case: the portal credential's token", () => {
    const server = { server: "https://sgm.uzspace.uz/server", token: "ST", expires: now + 3_600_000 };
    expect(findPortalToken([server, portal], portalUrl, now)).toBe("PT");
    expect(findPortalToken([portal], "https://SGM.uzspace.uz/portal/", now)).toBe("PT");
  });

  test("no (live) portal credential → \"\"", () => {
    expect(findPortalToken([], portalUrl, now)).toBe("");
    expect(findPortalToken(null, portalUrl, now)).toBe("");
    expect(findPortalToken([{ ...portal, expires: now }], portalUrl, now)).toBe("");
  });
});

describe("agriTokenServerPrefixes", () => {
  test("servers on the portal's origin only, /rest/services not doubled", () => {
    expect(
      agriTokenServerPrefixes(portalUrl, [
        "https://sgm.uzspace.uz/server",
        "https://sgm.uzspace.uz/server/rest/services/",
        "https://other.host/server",
        "",
      ]),
    ).toEqual(["https://sgm.uzspace.uz/server/rest/services/"]);
  });

  test("no portal → nothing", () => {
    expect(agriTokenServerPrefixes("", ["https://sgm.uzspace.uz/server"])).toEqual([]);
  });
});

describe("addTokenToRequest", () => {
  test("adds the token, keeps the query", () => {
    const params = { url: "https://h/server/rest/services/A/MapServer", requestOptions: { query: { f: "json" } } };
    addTokenToRequest(params, "PT");
    expect(params.requestOptions.query).toEqual({ f: "json", token: "PT" });
  });

  test("creates requestOptions/query when missing", () => {
    const params: { url: string; requestOptions?: { query?: Record<string, unknown> | null } } = { url: "u" };
    addTokenToRequest(params, "PT");
    expect(params.requestOptions?.query).toEqual({ token: "PT" });
  });

  test("a request that already has a token, or no token to add, is left alone", () => {
    const inQuery = { url: "u", requestOptions: { query: { token: "OWN" } } };
    addTokenToRequest(inQuery, "PT");
    expect(inQuery.requestOptions.query.token).toBe("OWN");
    const inUrl = { url: "u?f=json&token=OWN", requestOptions: { query: {} } };
    addTokenToRequest(inUrl, "PT");
    expect(inUrl.requestOptions.query).toEqual({});
    const none = { url: "u", requestOptions: { query: {} } };
    addTokenToRequest(none, "");
    expect(none.requestOptions.query).toEqual({});
  });
});

describe("applyAgriTokenInterceptor", () => {
  const prefixes = ["https://sgm.uzspace.uz/server/rest/services/"];

  test("goes first (the JS API uses the first matching one) and reads the token per request", () => {
    const other: InterceptorLike = { urls: ["https://sgm.uzspace.uz/"] };
    const request: { interceptors?: InterceptorLike[] } = { interceptors: [other] };
    let token = "T1";
    expect(applyAgriTokenInterceptor(request, prefixes, () => token)).toBe(true);
    const [pattern] = request.interceptors?.[0].urls as RegExp[];
    expect(pattern.test("https://SGM.uzspace.uz/server/rest/services/Agriculture/x/MapServer")).toBe(true);
    expect(pattern.test("https://sgm.uzspace.uz/portal/sharing/rest")).toBe(false);
    expect(pattern.test("https://evil.host/?u=https://sgm.uzspace.uz/server/rest/services/")).toBe(false);
    expect(request.interceptors?.[1]).toBe(other);
    token = "T2";
    const params = { url: "x", requestOptions: { query: {} as Record<string, unknown> } };
    request.interceptors?.[0].before?.(params);
    expect(params.requestOptions.query.token).toBe("T2");
  });

  test("a second install replaces the first", () => {
    const request: { interceptors?: InterceptorLike[] } = {};
    applyAgriTokenInterceptor(request, prefixes, () => "a");
    applyAgriTokenInterceptor(request, prefixes, () => "b");
    expect(request.interceptors).toHaveLength(1);
  });

  test("nothing to do without prefixes or config", () => {
    expect(applyAgriTokenInterceptor({}, [], () => "a")).toBe(false);
    expect(applyAgriTokenInterceptor(null, prefixes, () => "a")).toBe(false);
  });
});

describe("findDataSourceJson", () => {
  const webMap = { id: "dataSource_1", type: "WEB_MAP", itemId: "e03b" };

  test("Builder window: reads the edited app, not Builder's own appConfig", () => {
    const state = {
      appConfig: { dataSources: undefined as unknown },
      appStateInBuilder: { appConfig: { dataSources: { dataSource_1: webMap } } },
    };
    expect(findDataSourceJson(state, "dataSource_1")).toBe(webMap);
  });

  test("app runtime: reads appConfig", () => {
    expect(findDataSourceJson({ appConfig: { dataSources: { dataSource_1: webMap } } }, "dataSource_1")).toBe(webMap);
  });

  test("unknown id or empty state → null", () => {
    expect(findDataSourceJson({ appConfig: { dataSources: {} } }, "x")).toBeNull();
    expect(findDataSourceJson(null, "x")).toBeNull();
  });
});

describe("originOf", () => {
  test("returns the lower-case origin of http(s) URLs only", () => {
    expect(originOf("https://SGM.uzspace.uz/portal/sharing/rest")).toBe("https://sgm.uzspace.uz");
    expect(originOf("http://host:8080/x")).toBe("http://host:8080");
    expect(originOf("")).toBe("");
    expect(originOf("sgm.uzspace.uz/portal")).toBe("");
    expect(originOf(null)).toBe("");
  });
});

describe("applyAgriCorsGuard", () => {
  test("trusts each Agri origin once", () => {
    const request: RequestConfigLike = { trustedServers: [] };
    const result = applyAgriCorsGuard(request, [
      "https://sgm.uzspace.uz/portal",
      "https://sgm.uzspace.uz/server/rest/services/A/FeatureServer/2",
    ]);
    expect(request.trustedServers).toEqual(["https://sgm.uzspace.uz"]);
    expect(result.added).toEqual(["https://sgm.uzspace.uz"]);
    // second run adds nothing
    expect(applyAgriCorsGuard(request, ["https://sgm.uzspace.uz/portal"]).added).toEqual([]);
  });

  test("a host already trusted (with or without protocol) is not added again", () => {
    const request: RequestConfigLike = { trustedServers: ["sgm.uzspace.uz"] };
    applyAgriCorsGuard(request, ["https://sgm.uzspace.uz/portal"]);
    expect(request.trustedServers).toEqual(["sgm.uzspace.uz"]);
  });

  test("removes the JS API's host-wide portal-proxy rule, keeps other rules", () => {
    const custom = { proxyUrl: "https://my.proxy/proxy.ashx", urlPrefix: "sgm.uzspace.uz/server/secure" };
    const other = { proxyUrl: "https://other.host/portal/sharing/proxy", urlPrefix: "other.host/" };
    const request: RequestConfigLike = {
      trustedServers: [],
      proxyRules: [
        custom,
        { proxyUrl: "https://sgm.uzspace.uz/portal/sharing/proxy", urlPrefix: "sgm.uzspace.uz/" },
        other,
      ],
    };
    const rules = request.proxyRules;
    const result = applyAgriCorsGuard(request, ["https://sgm.uzspace.uz/portal"]);
    expect(result.removedRules).toBe(1);
    expect(request.proxyRules).toBe(rules); // same array — the JS API reads it per request
    expect(request.proxyRules).toEqual([custom, other]);
  });

  test("creates trustedServers when missing; ignores no config or no URLs", () => {
    const request: RequestConfigLike = {};
    applyAgriCorsGuard(request, ["https://sgm.uzspace.uz/portal"]);
    expect(request.trustedServers).toEqual(["https://sgm.uzspace.uz"]);
    expect(applyAgriCorsGuard(null, ["https://sgm.uzspace.uz"])).toEqual({ added: [], removedRules: 0 });
    const empty: RequestConfigLike = {};
    applyAgriCorsGuard(empty, ["", "not a url"]);
    expect(empty.trustedServers).toBeUndefined();
  });
});

describe("collectAgriArcgisUrls", () => {
  test("uses the ArcGIS service URLs but not the polygon REST API", () => {
    const urls = collectAgriArcgisUrls();
    expect(urls).toContain("https://sgm.uzspace.uz/portal");
    expect(urls.some((url) => url.includes("api-agri."))).toBe(false);
  });
});
