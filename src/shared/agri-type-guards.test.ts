import {
  hasChangeEmitter,
  isRendererJson,
  isUseDataSourceLike,
  readStatePortalUrl,
} from "./agri-type-guards";

describe("agri-type-guards", () => {
  test("isUseDataSourceLike requires a string dataSourceId", () => {
    expect(isUseDataSourceLike({ dataSourceId: "a" })).toBe(true);
    expect(isUseDataSourceLike({ dataSourceId: 1 })).toBe(false);
    expect(isUseDataSourceLike(null)).toBe(false);
    expect(isUseDataSourceLike("a")).toBe(false);
  });

  test("isRendererJson requires a string type", () => {
    expect(isRendererJson({ type: "unique-value" })).toBe(true);
    expect(isRendererJson({})).toBe(false);
    expect(isRendererJson(undefined)).toBe(false);
  });

  test("hasChangeEmitter requires an on function", () => {
    expect(hasChangeEmitter({ on: () => ({ remove: () => undefined }) })).toBe(true);
    expect(hasChangeEmitter({ on: 1 })).toBe(false);
    expect(hasChangeEmitter(null)).toBe(false);
  });

  test("readStatePortalUrl returns only non-empty strings", () => {
    expect(readStatePortalUrl({ portalUrl: "https://p" })).toBe("https://p");
    expect(readStatePortalUrl({ portalUrl: "" })).toBeUndefined();
    expect(readStatePortalUrl({ portalUrl: 3 })).toBeUndefined();
    expect(readStatePortalUrl(null)).toBeUndefined();
  });
});
