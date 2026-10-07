import { React } from "jimu-core";
import {
    buildRuleFromForm,
    type AccessRule,
    type RuleOperator,
} from "./access-model";

export interface RuleFormController {
    ruleOperator: RuleOperator;
    setRuleOperator: (operator: RuleOperator) => void;
    ruleValue: string;
    setRuleValue: (value: string) => void;
    ruleFrom: string;
    setRuleFrom: (value: string) => void;
    ruleTo: string;
    setRuleTo: (value: string) => void;
    ruleValues: string[];
    newListValue: string;
    setNewListValue: (value: string) => void;
    resetRuleForm: () => void;
    fillRuleForm: (rule: AccessRule) => void;
    getRuleFromForm: () => AccessRule | null;
    addValueToInList: () => void;
    removeValueFromInList: (indexForRemove: number) => void;
    updateValueInList: (indexForUpdate: number, value: string) => void;
}

/** Local state of the add/edit rule form (operator + values). */
export function useRuleForm(): RuleFormController {
    const [ruleOperator, setRuleOperator] = React.useState<RuleOperator>("equal");
    const [ruleValue, setRuleValue] = React.useState<string>("");
    const [ruleFrom, setRuleFrom] = React.useState<string>("");
    const [ruleTo, setRuleTo] = React.useState<string>("");
    const [ruleValues, setRuleValues] = React.useState<string[]>([]);
    const [newListValue, setNewListValue] = React.useState<string>("");

    const resetRuleForm = (): void => {
        setRuleOperator("equal");
        setRuleValue("");
        setRuleFrom("");
        setRuleTo("");
        setRuleValues([]);
        setNewListValue("");
    };

    const fillRuleForm = (rule: AccessRule): void => {
        setRuleOperator(rule.operator);
        setRuleValue(rule.value ?? "");
        setRuleFrom(rule.from ?? "");
        setRuleTo(rule.to ?? "");
        setRuleValues(rule.values ?? []);
        setNewListValue("");
    };

    const getRuleFromForm = (): AccessRule | null =>
        buildRuleFromForm({
            operator: ruleOperator,
            value: ruleValue,
            from: ruleFrom,
            to: ruleTo,
            values: ruleValues,
        });

    const addValueToInList = (): void => {
        const value = newListValue.trim();

        if (!value) return;

        setRuleValues((prev) => [...prev, value]);
        setNewListValue("");
    };

    const removeValueFromInList = (indexForRemove: number): void => {
        setRuleValues((prev) => prev.filter((_, index) => index !== indexForRemove));
    };

    const updateValueInList = (indexForUpdate: number, value: string): void => {
        setRuleValues((prev) =>
            prev.map((item, index) => (index === indexForUpdate ? value : item))
        );
    };

    return {
        ruleOperator,
        setRuleOperator,
        ruleValue,
        setRuleValue,
        ruleFrom,
        setRuleFrom,
        ruleTo,
        setRuleTo,
        ruleValues,
        newListValue,
        setNewListValue,
        resetRuleForm,
        fillRuleForm,
        getRuleFromForm,
        addValueToInList,
        removeValueFromInList,
        updateValueInList,
    };
}
