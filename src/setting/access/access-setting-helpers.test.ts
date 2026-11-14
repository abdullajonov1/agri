import { GLOBAL_ACCESS_ID, type AccessConfig, type AccessRule } from "./access-model";
import {
    buildNewField,
    findSelectedField,
    nextSelectedIdAfterRemoval,
    toggleItem,
    withoutItem,
} from "./access-setting-helpers";

const makeConfig = (ids: string[]): AccessConfig =>
    ({
        globalGroups: [],
        rules: ids.map((id) => ({ id, title: id, field: id, rules: [] })),
    }) as unknown as AccessConfig;

describe("access-setting-helpers", () => {
    it("toggleItem adds and removes without mutating", () => {
        const list = ["a"];
        expect(toggleItem(list, "b")).toEqual(["a", "b"]);
        expect(toggleItem(list, "a")).toEqual([]);
        expect(list).toEqual(["a"]);
    });

    it("withoutItem removes the item", () => {
        expect(withoutItem(["a", "b"], "a")).toEqual(["b"]);
    });

    it("findSelectedField returns null for global and unknown ids", () => {
        const config = makeConfig(["x"]);
        expect(findSelectedField(config, GLOBAL_ACCESS_ID)).toBeNull();
        expect(findSelectedField(config, "nope")).toBeNull();
        expect(findSelectedField(config, "x")?.id).toBe("x");
    });

    it("buildNewField trims values and wraps the first rule", () => {
        const rule = { id: "r" } as unknown as AccessRule;
        const withRule = buildNewField(" T ", " f ", rule);
        expect(withRule.title).toBe("T");
        expect(withRule.field).toBe("f");
        expect(withRule.rules).toEqual([rule]);
        expect(buildNewField("t", "f", null).rules).toEqual([]);
    });

    it("nextSelectedIdAfterRemoval falls back to global", () => {
        expect(nextSelectedIdAfterRemoval(makeConfig(["a", "b"]))).toBe("a");
        expect(nextSelectedIdAfterRemoval(makeConfig([]))).toBe(GLOBAL_ACCESS_ID);
    });
});
