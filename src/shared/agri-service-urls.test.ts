import {
  getAgriPortalSharingRestUrl,
  getAgriServiceUrls,
  normalizeAgriServiceUrls,
  setAgriServiceUrls,
} from "./agri-service-urls";

describe("agri-service-urls", () => {
  afterEach(() => setAgriServiceUrls(undefined));

  test("defaults to production URLs", () => {
    const urls = normalizeAgriServiceUrls(undefined);
    expect(urls.portalUrl).toBe("https://sgm.uzspace.uz/portal");
    expect(urls.polygonApiBaseUrl).toBe("https://api-agri.sgm.uzspace.uz");
  });

  test("applies trimmed overrides and ignores blanks", () => {
    const urls = normalizeAgriServiceUrls({
      portalUrl: "  https://portal.test/portal  ",
      arcgisServer: "   ",
    });
    expect(urls.portalUrl).toBe("https://portal.test/portal");
    expect(urls.arcgisServer).toBe("https://sgm.uzspace.uz/server");
  });

  test("unwraps immutable config objects", () => {
    const urls = normalizeAgriServiceUrls({
      asMutable: () => ({ tableDataUrl: "https://t.test/0" }),
    });
    expect(urls.tableDataUrl).toBe("https://t.test/0");
  });

  test("ignores unknown keys", () => {
    const urls = normalizeAgriServiceUrls({ evil: "https://x" });
    expect(urls).not.toHaveProperty("evil");
  });

  test("setAgriServiceUrls drives getters and the sharing REST URL", () => {
    setAgriServiceUrls({ portalUrl: "https://p.test/portal/" });
    expect(getAgriServiceUrls().portalUrl).toBe("https://p.test/portal/");
    expect(getAgriPortalSharingRestUrl()).toBe(
      "https://p.test/portal/sharing/rest",
    );
  });
});
