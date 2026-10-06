import {
  collectionToArray,
  errorMessage,
  featureAttributeBag,
  firstCollectionArray,
  layerFieldNameList,
  readTypeTag,
} from "./agri-layer-types";

describe("featureAttributeBag", () => {
  test("returns the attributes object of a feature", () => {
    const attributes = { uniqueid: "{A}", ndvi: 0.4 };
    expect(featureAttributeBag({ attributes })).toBe(attributes);
  });

  test("falls back to an empty bag for missing features or attributes", () => {
    expect(featureAttributeBag(null)).toEqual({});
    expect(featureAttributeBag({ attributes: null })).toEqual({});
    expect(featureAttributeBag({})).toEqual({});
  });
});

describe("layerFieldNameList", () => {
  test("lists field names in order", () => {
    expect(
      layerFieldNameList({ fields: [{ name: "objectid" }, { name: "crop_id" }] }),
    ).toEqual(["objectid", "crop_id"]);
  });

  test("returns [] when the layer has no fields yet", () => {
    expect(layerFieldNameList({ fields: null })).toEqual([]);
  });
});

describe("collection helpers", () => {
  test("collectionToArray reads toArray() or returns []", () => {
    expect(collectionToArray({ toArray: () => [1, 2] })).toEqual([1, 2]);
    expect(collectionToArray(null)).toEqual([]);
  });

  test("firstCollectionArray prefers the first collection that answers", () => {
    expect(firstCollectionArray({ toArray: () => [] }, { toArray: () => [3] })).toEqual([]);
    expect(firstCollectionArray(undefined, { toArray: () => [3] })).toEqual([3]);
  });
});

describe("readTypeTag / errorMessage", () => {
  test("readTypeTag reads .type off objects only", () => {
    expect(readTypeTag({ type: "map-image" })).toBe("map-image");
    expect(readTypeTag("map-image")).toBe("");
    expect(readTypeTag(null)).toBe("");
  });

  test("errorMessage prefers .message and falls back to String()", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage("plain")).toBe("plain");
  });
});
