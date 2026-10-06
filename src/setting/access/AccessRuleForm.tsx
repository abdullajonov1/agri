import { React } from "jimu-core";
import { buildAccessRuleWhere } from "../../shared/agri-access-config";
import type { AccessFieldRule, RuleOperator } from "./access-model";
import type { RuleFormController } from "./use-rule-form";

interface AccessRuleFormProps {
    form: RuleFormController;
    selectedField: AccessFieldRule | null;
}

const OPERATOR_TABS: Array<{ operator: RuleOperator; label: string }> = [
    { operator: "equal", label: "Equal" },
    { operator: "range", label: "Range" },
    { operator: "include", label: "Include" },
    { operator: "like", label: "Like" },
];

function IncludeValuesEditor({ form }: { form: RuleFormController }) {
    return (
        <div className="inListArea">
            <div className="inAddRow">
                <input
                    className="dialogInput"
                    placeholder="Значение"
                    value={form.newListValue}
                    onChange={(e) => form.setNewListValue(e.target.value)}
                />

                <button className="smallButton" onClick={form.addValueToInList}>
                    Добавить
                </button>
            </div>

            {form.ruleValues.length === 0 ? (
                <div className="emptyMini">Список пуст</div>
            ) : (
                form.ruleValues.map((value, index) => (
                    <div className="inValueRow" key={`${value}_${index}`}>
                        <input
                            className="dialogInput"
                            placeholder="Значение"
                            value={value}
                            onChange={(e) => form.updateValueInList(index, e.target.value)}
                        />

                        <button
                            className="miniIconButton danger"
                            onClick={() => form.removeValueFromInList(index)}
                        >
                            ×
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

/** Operator tabs + value inputs + WHERE preview for an access rule. */
export function AccessRuleForm({ form, selectedField }: AccessRuleFormProps) {
    const { ruleOperator } = form;

    const renderPreview = (): string => {
        const tempRule = form.getRuleFromForm();

        return tempRule
            ? buildAccessRuleWhere(selectedField.field, tempRule)
            : `${selectedField.field} ...`;
    };

    return (
        <>
            <div className="operatorTabs fourTabs">
                {OPERATOR_TABS.map((tab) => (
                    <button
                        key={tab.operator}
                        className={ruleOperator === tab.operator ? "active" : ""}
                        onClick={() => form.setRuleOperator(tab.operator)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {(ruleOperator === "equal" || ruleOperator === "like") && (
                <input
                    className="dialogInput"
                    placeholder="Значение"
                    value={form.ruleValue}
                    onChange={(e) => form.setRuleValue(e.target.value)}
                />
            )}

            {ruleOperator === "range" && (
                <div className="twoInputGrid">
                    <input
                        className="dialogInput"
                        placeholder="От"
                        value={form.ruleFrom}
                        onChange={(e) => form.setRuleFrom(e.target.value)}
                    />

                    <input
                        className="dialogInput"
                        placeholder="До"
                        value={form.ruleTo}
                        onChange={(e) => form.setRuleTo(e.target.value)}
                    />
                </div>
            )}

            {ruleOperator === "include" && <IncludeValuesEditor form={form} />}

            {selectedField && (
                <div className="previewWhere">
                    <div>Итоговое условие:</div>
                    <span>{renderPreview()}</span>
                </div>
            )}
        </>
    );
}
