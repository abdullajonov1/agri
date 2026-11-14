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

  test("provides default URLs for index daily summary and field status year", () => {
    const urls = normalizeAgriServiceUrls(undefined);
    expect(urls.indexDailySummaryUrl).toBe(
      "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_index_daily_summary/FeatureServer/0",
    );
    expect(urls.fieldStatusYearUrl).toBe(
      "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_field_status_year/FeatureServer/0",
    );
  });

  test("config overrides replace index daily summary and field status year URLs", () => {
    const urls = normalizeAgriServiceUrls({
      indexDailySummaryUrl: "  https://idx.test/FeatureServer/0  ",
      fieldStatusYearUrl: "https://fs.test/FeatureServer/0",
    });
    expect(urls.indexDailySummaryUrl).toBe("https://idx.test/FeatureServer/0");
    expect(urls.fieldStatusYearUrl).toBe("https://fs.test/FeatureServer/0");
  });

  test("provides default URL for status counts year", () => {
    const urls = normalizeAgriServiceUrls(undefined);
    expect(urls.statusCountsYearUrl).toBe(
      "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_status_counts_year/FeatureServer/0",
    );
  });

  test("config override replaces status counts year URL", () => {
    const urls = normalizeAgriServiceUrls({
      statusCountsYearUrl: "  https://sc.test/FeatureServer/0  ",
    });
    expect(urls.statusCountsYearUrl).toBe("https://sc.test/FeatureServer/0");
  });

  test("blank overrides keep default index daily summary and field status year URLs", () => {
    const urls = normalizeAgriServiceUrls({
      indexDailySummaryUrl: "   ",
      fieldStatusYearUrl: "",
    });
    expect(urls.indexDailySummaryUrl).toBe(
      "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_index_daily_summary/FeatureServer/0",
    );
    expect(urls.fieldStatusYearUrl).toBe(
      "https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_field_status_year/FeatureServer/0",
    );
  });
});
