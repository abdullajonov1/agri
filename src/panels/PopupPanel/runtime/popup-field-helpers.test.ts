import {
  localizedPopupFieldLabel,
  localizedPopupVhValue,
  normalizeFieldAlias,
} from "./popup-field-helpers";

describe("popup-field-helpers", () => {
  test("localizedPopupFieldLabel is case/whitespace-insensitive", () => {
    expect(localizedPopupFieldLabel(" MAYDON ", "en")).toBe("Area (ha)");
    expect(localizedPopupFieldLabel("viloyat", "ru")).toBe("Область");
    expect(localizedPopupFieldLabel("yil", "uz_cyr")).toBe("Йил");
    expect(localizedPopupFieldLabel("f_inn", "uz_lat")).toBe("STIR");
    expect(localizedPopupFieldLabel("unknown_field", "en")).toBeNull();
    expect(localizedPopupFieldLabel("", "en")).toBeNull();
  });

  test("localizedPopupVhValue maps vegetation statuses", () => {
    expect(localizedPopupVhValue("1 - Juda yaxshi", "en")).toBe("Excellent");
    expect(localizedPopupVhValue("Yaxshi", "ru")).toBe("Хороший");
    expect(localizedPopupVhValue("O‘rta", "en")).toBe("Moderate");
    expect(localizedPopupVhValue("orta", "uz_cyr")).toBe("Ўрта");
    expect(localizedPopupVhValue("PAST", "uz_lat")).toBe("Past");
    expect(localizedPopupVhValue("Паст", "en")).toBe("Poor");
    expect(localizedPopupVhValue("", "en")).toBeNull();
    expect(localizedPopupVhValue(null, "en")).toBeNull();
    expect(localizedPopupVhValue("unknown", "en")).toBeNull();
  });

  test("normalizeFieldAlias prefers alias, displayName, label, then name", () => {
    expect(normalizeFieldAlias({ name: "a", alias: " Alias " }, "x")).toBe("Alias");
    expect(normalizeFieldAlias({ name: "a", displayName: "Disp" }, "x")).toBe("Disp");
    expect(normalizeFieldAlias({ name: "a", label: "Lbl" }, "x")).toBe("Lbl");
    expect(normalizeFieldAlias({ name: "a" }, "x")).toBe("a");
    expect(normalizeFieldAlias(null, " fb ")).toBe("fb");
    expect(normalizeFieldAlias(undefined, "")).toBe("");
  });
});
