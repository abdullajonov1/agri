import { makeRegionDistrictKey, normalizeLocalizationApos } from "./geo-keys";
import { applyAppBackgroundTheme, APP_BG_DARK_CLASS, APP_BG_LIGHT_CLASS } from "./app-theme";
import { normalizeConnectionId } from "./connection-ids";
import { featureAttributes, isPresentValue, type AgriMapLayer } from "./agri-map-layer";
import {
  buildCropDistinctCacheKey,
  findLayerFieldName,
  getFeatureLayerKey,
  getLayerMatchStateForViloyat,
} from "./layer-utils";
import { resolveStoredAgriLanguage } from "./lang";

describe("geo-keys", () => {
  test("normalizeLocalizationApos unifies apostrophes and trims", () => {
    expect(normalizeLocalizationApos("  Yakkabog‘ ")).toBe("Yakkabog'");
  });

  test("makeRegionDistrictKey lowercases and handles null", () => {
    expect(makeRegionDistrictKey(" Qo’qon ")).toBe("qo'qon");
    expect(makeRegionDistrictKey(null)).toBe("");
    expect(makeRegionDistrictKey(undefined)).toBe("");
  });
});

describe("applyAppBackgroundTheme", () => {
  test("switches classes on root and body", () => {
    applyAppBackgroundTheme("dark");
    expect(document.documentElement.classList.contains(APP_BG_DARK_CLASS)).toBe(true);
    expect(document.body.classList.contains(APP_BG_DARK_CLASS)).toBe(true);

    applyAppBackgroundTheme("dark");
    expect(document.body.classList.contains(APP_BG_DARK_CLASS)).toBe(true);

    applyAppBackgroundTheme("light");
    expect(document.documentElement.classList.contains(APP_BG_DARK_CLASS)).toBe(false);
    expect(document.body.classList.contains(APP_BG_LIGHT_CLASS)).toBe(true);
  });
});

describe("normalizeConnectionId", () => {
  test("keeps lowercase alphanumerics only", () => {
    expect(normalizeConnectionId(" Widget_12-A ")).toBe("widget12a");
    expect(normalizeConnectionId()).toBe("");
  });
});

describe("agri-map-layer helpers", () => {
  test("featureAttributes falls back to empty bag", () => {
    expect(featureAttributes({ attributes: { a: 1 } })).toEqual({ a: 1 });
    expect(featureAttributes({ attributes: null })).toEqual({});
    expect(featureAttributes(null)).toEqual({});
  });

  test("isPresentValue", () => {
    expect(isPresentValue(0)).toBe(true);
    expect(isPresentValue("x")).toBe(true);
    expect(isPresentValue(" ")).toBe(false);
    expect(isPresentValue(null)).toBe(false);
    expect(isPresentValue(undefined)).toBe(false);
  });
});

describe("layer-utils", () => {
  const layer = {
    id: "",
    url: "https://srv/0",
    title: "T",
    fields: [{ name: "Viloyat" }, { name: "crop_type" }],
  } as AgriMapLayer;

  test("getFeatureLayerKey prefers id, url, title", () => {
    expect(getFeatureLayerKey({ id: "L1", url: "u" } as AgriMapLayer)).toBe("L1");
    expect(getFeatureLayerKey(layer)).toBe("https://srv/0");
    expect(getFeatureLayerKey({ title: "Only" } as AgriMapLayer)).toBe("Only");
    expect(getFeatureLayerKey(null)).toBe("unknown_layer");
  });

  test("findLayerFieldName exact, case-insensitive, partial, none", () => {
    expect(findLayerFieldName(layer, "Viloyat")).toBe("Viloyat");
    expect(findLayerFieldName(layer, "viloyat")).toBe("Viloyat");
    expect(findLayerFieldName(layer, "crop")).toBe("crop_type");
    expect(findLayerFieldName(layer, "zzz")).toBeNull();
    expect(findLayerFieldName({ fields: [] } as unknown as AgriMapLayer, "a")).toBeNull();
    expect(findLayerFieldName(undefined, "a")).toBeNull();
  });

  test("buildCropDistinctCacheKey uses url or parent url/id", () => {
    expect(buildCropDistinctCacheKey(layer, "turi", "1=1")).toBe("https://srv/0|turi|1=1");
    const sub = { id: 3, layer: { url: "https://srv" } } as unknown as AgriMapLayer;
    expect(buildCropDistinctCacheKey(sub, "turi", "w")).toBe("https://srv/3|turi|w");
  });

  test("getLayerMatchStateForViloyat", () => {
    const base = {
      effectiveViloyat: "Buxoro",
      layer: { id: "L1" } as AgriMapLayer,
      viloyatKeyToLayerKeys: { buxoro: ["L1"], navoiy: ["L2"] },
      makeRegionDistrictKey,
    };
    expect(getLayerMatchStateForViloyat(base)).toBe("match");
    expect(getLayerMatchStateForViloyat({ ...base, effectiveViloyat: "Navoiy" })).toBe(
      "mismatch",
    );
    expect(getLayerMatchStateForViloyat({ ...base, effectiveViloyat: "" })).toBe("unknown");
    expect(getLayerMatchStateForViloyat({ ...base, effectiveViloyat: "Xiva" })).toBe(
      "unknown",
    );
    expect(
      getLayerMatchStateForViloyat({ ...base, makeRegionDistrictKey: (): string => "" }),
    ).toBe("unknown");
    expect(
      getLayerMatchStateForViloyat({ ...base, getLayerKey: (): string => "L2" }),
    ).toBe("mismatch");
  });
});

describe("resolveStoredAgriLanguage", () => {
  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("reads stored language", () => {
    localStorage.setItem("agri_app_lang", "ru");
    expect(resolveStoredAgriLanguage()).toBe("ru");
  });

  test("falls back to uz_lat when storage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(resolveStoredAgriLanguage()).toBe("uz_lat");
  });
});
