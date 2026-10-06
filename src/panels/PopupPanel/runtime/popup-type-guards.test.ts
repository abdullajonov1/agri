import {
  asDataSourceLike,
  messageOr,
  messageOrString,
  readMessage,
  readSupportsAttachments,
} from "./popup-type-guards";

describe("readMessage", () => {
  test("returns undefined for null and undefined", () => {
    expect(readMessage(null)).toBeUndefined();
    expect(readMessage(undefined)).toBeUndefined();
  });

  test("reads message from Error and plain objects", () => {
    expect(readMessage(new Error("boom"))).toBe("boom");
    expect(readMessage({ message: "plain" })).toBe("plain");
  });

  test("returns undefined for primitives without message", () => {
    expect(readMessage("text")).toBeUndefined();
    expect(readMessage(42)).toBeUndefined();
  });
});

describe("messageOr / messageOrString", () => {
  test("prefers the message when truthy", () => {
    expect(messageOr(new Error("bad"), "fallback")).toBe("bad");
    expect(messageOrString(new Error("bad"))).toBe("bad");
  });

  test("falls back when message is empty or missing", () => {
    expect(messageOr({ message: "" }, "fallback")).toBe("fallback");
    expect(messageOr(null, "Unknown error")).toBe("Unknown error");
    expect(messageOrString("raw failure")).toBe("raw failure");
    expect(messageOrString(undefined)).toBe("undefined");
  });
});

describe("asDataSourceLike", () => {
  test("returns null for empty and primitive values", () => {
    expect(asDataSourceLike(null)).toBeNull();
    expect(asDataSourceLike(undefined)).toBeNull();
    expect(asDataSourceLike("ds-1")).toBeNull();
  });

  test("returns the same object for data-source-like values", () => {
    const ds = { id: "ds-1", getSchema: () => ({ fields: {} }) };
    expect(asDataSourceLike(ds)).toBe(ds);
  });
});

describe("readSupportsAttachments", () => {
  test("is false for missing layers", () => {
    expect(readSupportsAttachments(null)).toBe(false);
    expect(readSupportsAttachments(undefined)).toBe(false);
  });

  test("uses the direct boolean flag first", () => {
    expect(readSupportsAttachments({ supportsAttachments: true })).toBe(true);
    expect(
      readSupportsAttachments({
        supportsAttachments: false,
        capabilities: { data: { supportsAttachment: true } },
      }),
    ).toBe(false);
  });

  test("falls back through capability bags in order", () => {
    expect(
      readSupportsAttachments({ capabilities: { data: { supportsAttachments: true } } }),
    ).toBe(true);
    expect(
      readSupportsAttachments({ capabilities: { data: { supportsAttachment: true } } }),
    ).toBe(true);
    expect(
      readSupportsAttachments({ capabilities: { operations: { supportsAttachments: true } } }),
    ).toBe(true);
    expect(
      readSupportsAttachments({ capabilities: { operations: { supportsAttachment: false } } }),
    ).toBe(false);
  });

  test("is false when no boolean signal exists", () => {
    expect(readSupportsAttachments({ capabilities: { data: { supportsAttachments: "yes" } } })).toBe(false);
    expect(readSupportsAttachments({})).toBe(false);
  });
});
