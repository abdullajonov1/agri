import { hasAsMutable, toPlainArray, toPlainDeep } from "./plain-value";

const immutableLike = <T>(plain: T) => ({
  asMutable: jest.fn((_options?: { deep?: boolean }) => plain),
});

describe("plain-value", () => {
  test("hasAsMutable detects seamless-immutable style values", () => {
    expect(hasAsMutable(immutableLike({}))).toBe(true);
    expect(hasAsMutable({})).toBe(false);
    expect(hasAsMutable(null)).toBe(false);
    expect(hasAsMutable(undefined)).toBe(false);
  });

  test("toPlainDeep calls asMutable deep and passes other values through", () => {
    const source = immutableLike({ a: 1 });
    expect(toPlainDeep(source)).toEqual({ a: 1 });
    expect(source.asMutable).toHaveBeenCalledWith({ deep: true });
    const plain = { b: 2 };
    expect(toPlainDeep(plain)).toBe(plain);
  });

  test("toPlainArray handles arrays, immutables, toArray and junk", () => {
    const arr = [1, 2];
    expect(toPlainArray(arr)).toBe(arr);
    expect(toPlainArray(immutableLike([3]))).toEqual([3]);
    expect(toPlainArray({ toArray: () => [4] })).toEqual([4]);
    expect(toPlainArray(null)).toEqual([]);
    expect(toPlainArray({})).toEqual([]);
    expect(toPlainArray(5)).toEqual([]);
  });
});
