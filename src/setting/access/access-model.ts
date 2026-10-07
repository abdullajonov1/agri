import type {
    AccessConfig,
    AccessFieldRule,
    AccessRule,
    RuleOperator,
} from "../../shared/agri-access-config";
import { toPlainDeep } from "../plain-value";

export type { AccessConfig, AccessFieldRule, AccessRule, RuleOperator };

export type PortalGroupInfo = {
    id: string;
    title: string;
    usersCount: number | null;
    isUnavailable?: boolean;
};

export type DialogType =
    | "addField"
    | "editField"
    | "deleteField"
    | "addRule"
    | "editRule"
    | "deleteRule"
    | "addGroup"
    | "editGroup"
    | "deleteGroup"
    | "addGlobalGroup"
    | "editGlobalGroup"
    | "deleteGlobalGroup";

export interface DialogPayload {
    fieldId?: string;
    ruleId?: string;
    groupIndex?: number;
}

export type DialogState = null | {
    type: DialogType;
    payload?: DialogPayload;
};

/** Raw rule-form values, before validation/trimming. */
export interface RuleFormValues {
    operator: RuleOperator;
    value: string;
    from: string;
    to: string;
    values: string[];
}

export const GLOBAL_ACCESS_ID = "__global_access__";

export const makeId = (): string => {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const defaultAccessConfig: AccessConfig = {
    fullAccessGroups: [],
    rules: [],
};

type LooseRecord = Record<string, unknown>;

export const normalizeOperator = (operator: unknown): RuleOperator => {
    if (operator === "equal") return "equal";
    if (operator === "range") return "range";
    if (operator === "include") return "include";
    if (operator === "like") return "like";

    if (operator === "eq") return "equal";
    if (operator === "between") return "range";
    if (operator === "in") return "include";

    return "equal";
};

const toStringList = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((item: unknown) => String(item)) : [];

const normalizeLoadedRule = (raw: unknown): AccessRule => {
    const rule = raw as LooseRecord;
    return {
        id: (rule.id as string) || makeId(),
        operator: normalizeOperator(rule.operator),
        value: rule.value as string,
        from: rule.from as string,
        to: rule.to as string,
        values: toStringList(rule.values),
        groups: toStringList(rule.groups),
    };
};

const normalizeLoadedField = (raw: unknown): AccessFieldRule => {
    const fieldItem = raw as LooseRecord;
    return {
        id: (fieldItem.id as string) || makeId(),
        title: (fieldItem.title as string) || "",
        field: (fieldItem.field as string) || "",
        rules: Array.isArray(fieldItem.rules)
            ? fieldItem.rules.map(normalizeLoadedRule)
            : [],
    };
};

export const normalizeLoadedConfig = (data: unknown): AccessConfig => {
    const source = data as LooseRecord | null | undefined;
    return {
        fullAccessGroups: toStringList(source?.fullAccessGroups),
        rules: Array.isArray(source?.rules)
            ? source.rules.map(normalizeLoadedField)
            : [],
    };
};

export const cloneAccessConfig = (data: AccessConfig): AccessConfig => {
    return normalizeLoadedConfig(JSON.parse(JSON.stringify(data)));
};

export const getInitialAccessConfig = (
    widgetConfig: { accessConfig?: unknown } | null | undefined,
): AccessConfig => {
    const storedConfig = widgetConfig?.accessConfig;

    if (!storedConfig) {
        return cloneAccessConfig(defaultAccessConfig);
    }

    return normalizeLoadedConfig(toPlainDeep<unknown>(storedConfig));
};

export const getConfigGroupIds = (config: AccessConfig): string[] => {
    const groupIds = [
        ...config.fullAccessGroups,
        ...config.rules.flatMap((field) =>
            field.rules.flatMap((rule) => rule.groups)
        ),
    ];

    return Array.from(new Set(groupIds)).sort();
};

export const makeGroupKey = (ruleId: string, index: number): string => {
    return `${ruleId}_${index}`;
};

export const makeGlobalGroupKey = (index: number): string => {
    return `global_${index}`;
};

/** Builds a new rule (fresh id, no groups) from form values, or null when incomplete. */
export const buildRuleFromForm = (form: RuleFormValues): AccessRule | null => {
    if (form.operator === "equal") {
        if (!form.value.trim()) return null;

        return {
            id: makeId(),
            operator: "equal",
            value: form.value.trim(),
            groups: [],
        };
    }

    if (form.operator === "range") {
        if (!form.from.trim() || !form.to.trim()) return null;

        return {
            id: makeId(),
            operator: "range",
            from: form.from.trim(),
            to: form.to.trim(),
            groups: [],
        };
    }

    if (form.operator === "include") {
        const cleanValues = form.values.map((item) => item.trim()).filter(Boolean);

        if (cleanValues.length === 0) return null;

        return {
            id: makeId(),
            operator: "include",
            values: cleanValues,
            groups: [],
        };
    }

    if (form.operator === "like") {
        if (!form.value.trim()) return null;

        return {
            id: makeId(),
            operator: "like",
            value: form.value.trim(),
            groups: [],
        };
    }

    return null;
};
