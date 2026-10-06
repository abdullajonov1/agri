/**
 * Pure, immutable transforms of the draft AccessConfig used by the access
 * settings editor. Every function returns a new config and never mutates input.
 */
import {
    makeGlobalGroupKey,
    makeGroupKey,
    type AccessConfig,
    type AccessFieldRule,
    type AccessRule,
} from "./access-model";

const mapField = (
    config: AccessConfig,
    fieldId: string,
    update: (field: AccessFieldRule) => AccessFieldRule,
): AccessConfig => ({
    ...config,
    rules: config.rules.map((field) =>
        field.id === fieldId ? update(field) : field
    ),
});

const mapRule = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
    update: (rule: AccessRule) => AccessRule,
): AccessConfig =>
    mapField(config, fieldId, (field) => ({
        ...field,
        rules: field.rules.map((rule) => (rule.id === ruleId ? update(rule) : rule)),
    }));

export const addField = (config: AccessConfig, field: AccessFieldRule): AccessConfig => ({
    ...config,
    rules: [...config.rules, field],
});

export const updateFieldMeta = (
    config: AccessConfig,
    fieldId: string,
    title: string,
    fieldName: string,
): AccessConfig =>
    mapField(config, fieldId, (item) => ({
        ...item,
        title,
        field: fieldName,
    }));

export const removeField = (config: AccessConfig, fieldId: string): AccessConfig => ({
    ...config,
    rules: config.rules.filter((item) => item.id !== fieldId),
});

export const addRule = (
    config: AccessConfig,
    fieldId: string,
    rule: AccessRule,
): AccessConfig =>
    mapField(config, fieldId, (field) => ({
        ...field,
        rules: [...field.rules, rule],
    }));

/** Replaces a rule's condition while keeping its id and groups. */
export const replaceRuleCondition = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
    formRule: AccessRule,
): AccessConfig =>
    mapRule(config, fieldId, ruleId, (rule) => ({
        ...formRule,
        id: rule.id,
        groups: rule.groups,
    }));

export const removeRules = (
    config: AccessConfig,
    fieldId: string,
    ruleIds: string[],
): AccessConfig =>
    mapField(config, fieldId, (field) => ({
        ...field,
        rules: field.rules.filter((rule) => !ruleIds.includes(rule.id)),
    }));

export const removeRule = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
): AccessConfig =>
    mapField(config, fieldId, (field) => ({
        ...field,
        rules: field.rules.filter((rule) => rule.id !== ruleId),
    }));

export const addRuleGroup = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
    group: string,
): AccessConfig =>
    mapRule(config, fieldId, ruleId, (rule) => ({
        ...rule,
        groups: [...rule.groups, group],
    }));

export const updateRuleGroup = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
    groupIndex: number,
    group: string,
): AccessConfig =>
    mapRule(config, fieldId, ruleId, (rule) => ({
        ...rule,
        groups: rule.groups.map((item, index) => (index === groupIndex ? group : item)),
    }));

export const removeRuleGroup = (
    config: AccessConfig,
    fieldId: string,
    ruleId: string,
    groupIndex: number,
): AccessConfig =>
    mapRule(config, fieldId, ruleId, (rule) => ({
        ...rule,
        groups: rule.groups.filter((_, index) => index !== groupIndex),
    }));

/** Removes every rule group of a field whose selection key is in `keys`. */
export const removeRuleGroupsByKeys = (
    config: AccessConfig,
    fieldId: string,
    keys: string[],
): AccessConfig =>
    mapField(config, fieldId, (field) => ({
        ...field,
        rules: field.rules.map((rule) => ({
            ...rule,
            groups: rule.groups.filter(
                (_, index) => !keys.includes(makeGroupKey(rule.id, index))
            ),
        })),
    }));

export const addGlobalGroup = (config: AccessConfig, group: string): AccessConfig => ({
    ...config,
    fullAccessGroups: [...config.fullAccessGroups, group],
});

export const updateGlobalGroup = (
    config: AccessConfig,
    groupIndex: number,
    group: string,
): AccessConfig => ({
    ...config,
    fullAccessGroups: config.fullAccessGroups.map((item, index) =>
        index === groupIndex ? group : item
    ),
});

export const removeGlobalGroup = (config: AccessConfig, groupIndex: number): AccessConfig => ({
    ...config,
    fullAccessGroups: config.fullAccessGroups.filter((_, index) => index !== groupIndex),
});

/** Removes every full-access group whose selection key is in `keys`. */
export const removeGlobalGroupsByKeys = (
    config: AccessConfig,
    keys: string[],
): AccessConfig => ({
    ...config,
    fullAccessGroups: config.fullAccessGroups.filter(
        (_, index) => !keys.includes(makeGlobalGroupKey(index))
    ),
});
