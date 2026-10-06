import {
  finiteMetaNumber,
  messageOf,
  panelEventDetail,
  readPanelEventDetail,
} from "./panel-filter-detail";

describe("panelEventDetail", () => {
  test("returns the dispatched detail object itself", () => {
    const detail = { filters: { yil: "2026" } };
    const event = new CustomEvent("masterFilterChanged", { detail });
    expect(panelEventDetail(event)).toBe(detail);
  });

  test("returns {} when the event has no detail", () => {
    expect(panelEventDetail(new Event("languageChanged"))).toEqual({});
    expect(panelEventDetail(null)).toEqual({});
    expect(panelEventDetail(undefined)).toEqual({});
  });

  test("differs from readPanelEventDetail, which copies immutables", () => {
    const detail = { lang: "ru" };
    const event = new CustomEvent("languageChanged", { detail });
    expect(panelEventDetail(event)).toBe(detail);
    expect(readPanelEventDetail(event)).toEqual(detail);
  });
});

describe("finiteMetaNumber", () => {
  test("reads finite numbers", () => {
    expect(finiteMetaNumber({ timestamp: 42 }, "timestamp")).toBe(42);
  });

  test("falls back to 0 for missing, non-numeric or non-finite values", () => {
    expect(finiteMetaNumber(undefined, "timestamp")).toBe(0);
    expect(finiteMetaNumber(null, "timestamp")).toBe(0);
    expect(finiteMetaNumber({ timestamp: "42" }, "timestamp")).toBe(0);
    expect(finiteMetaNumber({ timestamp: Number.NaN }, "timestamp")).toBe(0);
    expect(finiteMetaNumber({ timestamp: Infinity }, "timestamp")).toBe(0);
  });
});

describe("messageOf", () => {
  test("reads Error and error-like messages", () => {
    expect(messageOf(new Error("boom"))).toBe("boom");
    expect(messageOf({ message: "esri failed" })).toBe("esri failed");
  });

  test("returns empty text when there is no message", () => {
    expect(messageOf("plain")).toBe("");
    expect(messageOf(null)).toBe("");
  });
});
