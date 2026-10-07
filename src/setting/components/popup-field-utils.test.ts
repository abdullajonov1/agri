import {
  computePopupMenuFrame,
  dataSourceKeyOf,
  fieldsFromLayerFields,
  fieldsFromSchemaFields,
  formatFieldInfoLabel,
  isSameMenuFrame,
  mergeFieldNameOrder,
  moveListItem,
  shouldReplaceField,
} from "./popup-field-utils";

describe("popup-field-utils", () => {
  test("computePopupMenuFrame opens below when there is room", () => {
    const frame = computePopupMenuFrame({ top: 100, bottom: 130, left: 10, width: 200 }, 800);
    expect(frame).toEqual({ top: 132, left: 10, width: 200, maxHeight: 280 });
  });

  test("computePopupMenuFrame opens upward near the viewport bottom", () => {
    const frame = computePopupMenuFrame({ top: 700, bottom: 730, left: 0, width: 50 }, 800);
    expect(frame.maxHeight).toBe(280);
    expect(frame.top).toBe(700 - 280 - 2);
  });

  test("isSameMenuFrame compares all members", () => {
    const a = { top: 1, left: 2, width: 3, maxHeight: 4 };
    expect(isSameMenuFrame(a, { ...a })).toBe(true);
    expect(isSameMenuFrame(a, { ...a, width: 5 })).toBe(false);
    expect(isSameMenuFrame(null, a)).toBe(false);
  });

  test("dataSourceKeyOf sorts ids from arrays and immutables", () => {
    expect(dataSourceKeyOf([{ dataSourceId: "b" }, { dataSourceId: "a" }, {}])).toBe("a|b");
    expect(dataSourceKeyOf({ asMutable: () => [{ dataSourceId: "z" }] })).toBe("z");
    expect(dataSourceKeyOf(undefined)).toBe("");
  });

  test("fieldsFromSchemaFields falls back through name/alias/type keys", () => {
    expect(
      fieldsFromSchemaFields({
        k1: { jimuName: "j", displayName: "Disp", esriType: "esriFieldTypeString" },
        k2: undefined,
      }),
    ).toEqual([
      { name: "j", alias: "Disp", type: "esriFieldTypeString" },
      { name: "k2", alias: "k2", type: "unknown" },
    ]);
  });

  test("fieldsFromLayerFields skips nameless fields", () => {
    expect(
      fieldsFromLayerFields({ fields: [{ name: " a ", alias: "A", type: "int" }, { alias: "x" }] }),
    ).toEqual([{ name: "a", alias: "A", type: "int" }]);
    expect(fieldsFromLayerFields(null)).toEqual([]);
  });

  test("shouldReplaceField prefers a real alias over a default one", () => {
    const plain = { name: "a", alias: "a", type: "" };
    const nice = { name: "a", alias: "Nice", type: "" };
    expect(shouldReplaceField(plain, nice)).toBe(true);
    expect(shouldReplaceField(nice, plain)).toBe(false);
  });

  test("mergeFieldNameOrder keeps saved order then appends new fields", () => {
    const fields = ["a", "b", "c"].map((name) => ({ name, alias: name, type: "" }));
    expect(mergeFieldNameOrder(fields, ["c", "x", "a"])).toEqual(["c", "a", "b"]);
    expect(mergeFieldNameOrder(fields, undefined)).toEqual(["a", "b", "c"]);
  });

  test("formatFieldInfoLabel shows alias with name when different", () => {
    expect(formatFieldInfoLabel({ name: "a", alias: "Area", type: "" })).toBe("Area (a)");
    expect(formatFieldInfoLabel({ name: "a", alias: "A", type: "" })).toBe("A");
    expect(formatFieldInfoLabel({ name: "a", alias: "", type: "" })).toBe("a");
  });

  test("moveListItem moves without mutating and rejects bad indexes", () => {
    const order = ["a", "b", "c"];
    expect(moveListItem(order, 0, 2)).toEqual(["b", "c", "a"]);
    expect(order).toEqual(["a", "b", "c"]);
    expect(moveListItem(order, 1, 1)).toBeNull();
    expect(moveListItem(order, -1, 1)).toBeNull();
    expect(moveListItem(order, 0, 3)).toBeNull();
  });
});
