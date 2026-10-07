import {
  errorMessage,
  isPlainRecord,
  toPlainRecord,
  toPlainValue,
} from "./agri-plain-object";

describe("agri-plain-object", () => {
  test("toPlainValue deep-unwraps seamless-immutable values", () => {
    const asMutable = jest.fn(() => ({ a: 1 }));
    expect(toPlainValue({ asMutable })).toEqual({ a: 1 });
    expect(asMutable).toHaveBeenCalledWith({ deep: true });
  });

  test("toPlainValue passes other values through", () => {
    const obj = { a: 1 };
    expect(toPlainValue(obj)).toBe(obj);
    expect(toPlainValue(null)).toBeNull();
    expect(toPlainValue(3)).toBe(3);
  });

  test("isPlainRecord rejects arrays and primitives", () => {
    expect(isPlainRecord({})).toBe(true);
    expect(isPlainRecord([])).toBe(false);
    expect(isPlainRecord("x")).toBe(false);
    expect(isPlainRecord(null)).toBe(false);
  });

  test("toPlainRecord returns null for non-objects", () => {
    expect(toPlainRecord(undefined)).toBeNull();
    expect(toPlainRecord([1])).toBeNull();
    expect(toPlainRecord({ asMutable: () => ({ b: 2 }) })).toEqual({ b: 2 });
  });

  test("errorMessage reads Error, message-bearing objects and primitives", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage({ message: "shaped" })).toBe("shaped");
    expect(errorMessage("plain")).toBe("plain");
    expect(errorMessage(undefined)).toBe("undefined");
  });
});
