import {
    GLOBAL_ACCESS_ID,
    makeId,
    type AccessConfig,
    type AccessFieldRule,
    type AccessRule,
} from "./access-model";

/** Adds the item to the list when absent, removes it when present. */
export const toggleItem = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

/** Returns the list without the given item. */
export const withoutItem = (list: string[], item: string): string[] =>
    list.filter((value) => value !== item);

/** Finds the field rule selected in the left list (null for the global item). */
export const findSelectedField = (
    config: AccessConfig,
    selectedId: string,
): AccessFieldRule | null =>
    selectedId === GLOBAL_ACCESS_ID
        ? null
        : config.rules.find((item) => item.id === selectedId) ?? null;

/** Builds a new field rule from trimmed form values and an optional first rule. */
export const buildNewField = (
    title: string,
    field: string,
    firstRule: AccessRule | null,
): AccessFieldRule => ({
    id: makeId(),
    title: title.trim(),
    field: field.trim(),
    rules: firstRule ? [firstRule] : [],
});

/** Id to select after a field was removed: the first remaining rule or global. */
export const nextSelectedIdAfterRemoval = (config: AccessConfig): string =>
    config.rules[0]?.id ?? GLOBAL_ACCESS_ID;
