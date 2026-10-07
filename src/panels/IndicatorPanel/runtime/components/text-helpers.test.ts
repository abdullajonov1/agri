import { makeIndicatorHost } from "../__test-utils__/indicator-host-stub";
import type { AgriLanguage } from "../../../../shared/agri-language";
import {
  buildTurlarClause,
  getFieldType,
  handleLanguageChange,
  labelNoValue,
  makeApostropheVariants,
  makeDistrictSuffixVariants,
  makeRegionSuffixVariants,
  normalizeTurlar,
  nz,
  shouldFetchForViloyat,
  translateKnownError,
} from "./text-helpers";

const withVariants = () => {
  const stub = makeIndicatorHost();
  stub.host.makeApostropheVariants = (s: string) => makeApostropheVariants(stub.host, s);
  return stub;
};

describe("Indicator text-helpers", () => {
  test.each<[AgriLanguage, string]>([
    ["en", "No value"],
    ["ru", "Нет значения"],
    ["uz_lat", "Qiymat yo‘q"],
    ["uz_cyr", "Қиймат йўқ"],
  ])("labelNoValue(%s)", (language, expected) => {
    const { host } = makeIndicatorHost({ language });
    expect(labelNoValue(host)).toBe(expected);
  });

  test("translateKnownError translates known messages and passes others through", () => {
    const tr = (language: AgriLanguage, msg: string): string =>
      translateKnownError(makeIndicatorHost({ language }).host, msg);
    expect(tr("en", "Query failed")).toBe("Query failed");
    expect(tr("ru", "Query failed")).toBe("Ошибка запроса");
    expect(tr("uz_lat", "Query failed")).toBe("So‘rov xatosi");
    expect(tr("uz_cyr", "Query failed")).toBe("Сўров хатоси");
    expect(tr("ru", "other")).toBe("other");
  });

  test("handleLanguageChange updates only on a new language while mounted", () => {
    const { host, setState } = makeIndicatorHost({ language: "ru" });
    handleLanguageChange(host, new CustomEvent("l", { detail: { lang: "ru" } }));
    expect(setState).not.toHaveBeenCalled();
    handleLanguageChange(host, new CustomEvent("l", { detail: { language: "en" } }));
    expect(setState).toHaveBeenCalledWith({ language: "en" });
    host._isMounted = false;
    handleLanguageChange(host, new CustomEvent("l", { detail: { code: "uz_lat" } }));
    expect(setState).toHaveBeenCalledTimes(1);
  });

  test("getFieldType is case-insensitive and null without layer", () => {
    expect(getFieldType(makeIndicatorHost().host, "a")).toBeNull();
    const layer = { fields: [{ name: "Maydon", type: "double" }] } as unknown as __esri.FeatureLayer;
    const { host } = makeIndicatorHost({ featureLayer: layer });
    expect(getFieldType(host, "maydon")).toBe("double");
    expect(getFieldType(host, "none")).toBeNull();
  });

  test("nz builds numeric or string zero filters", () => {
    const numeric = makeIndicatorHost({}, {}, { getFieldType: () => "esriFieldTypeDouble" });
    expect(nz(numeric.host, " f ")).toBe("(f > 0)");
    const text = makeIndicatorHost({}, {}, { getFieldType: () => null });
    expect(nz(text.host, "f")).toContain("f IS NOT NULL AND f <> ''");
    expect(nz(text.host, "")).toBe("(1=1)");
  });

  test("makeApostropheVariants returns ascii first, at most three", () => {
    const { host } = withVariants();
    expect(makeApostropheVariants(host, "")).toEqual([""]);
    expect(makeApostropheVariants(host, "Andijon")).toEqual(["Andijon"]);
    const v = makeApostropheVariants(host, "Farg‘ona");
    expect(v[0]).toBe("Farg'ona");
    expect(v.length).toBeLessThanOrEqual(3);
    expect(v).toContain("Fargʻona");
  });

  test("makeDistrictSuffixVariants adds suffixes unless already present", () => {
    const { host } = withVariants();
    expect(makeDistrictSuffixVariants(host, "")).toEqual([""]);
    expect(makeDistrictSuffixVariants(host, "Asaka")).toEqual([
      "Asaka",
      "Asaka tumani",
      "Asaka shahar",
      "Asaka shahri",
    ]);
    expect(makeDistrictSuffixVariants(host, "Asaka tumani")).toEqual(["Asaka tumani"]);
  });

  test("makeRegionSuffixVariants adds viloyati/shahar unless present", () => {
    const { host } = withVariants();
    expect(makeRegionSuffixVariants(host, "")).toEqual([""]);
    expect(makeRegionSuffixVariants(host, "Andijon")).toEqual([
      "Andijon",
      "Andijon viloyati",
      "Andijon shahar",
    ]);
    expect(makeRegionSuffixVariants(host, "Toshkent shahar")).toEqual(["Toshkent shahar"]);
  });

  test("normalizeTurlar / buildTurlarClause delegate to shared helpers", () => {
    const { host } = makeIndicatorHost();
    expect(normalizeTurlar(host, [], "")).toEqual([]);
    expect(buildTurlarClause(host, "turi", [])).toBe("");
  });

  test("shouldFetchForViloyat requires a non-blank year", () => {
    expect(shouldFetchForViloyat(makeIndicatorHost({ selectedYil: " " }).host)).toBe(false);
    expect(shouldFetchForViloyat(makeIndicatorHost({ selectedYil: "2024" }).host)).toBe(true);
  });
});
