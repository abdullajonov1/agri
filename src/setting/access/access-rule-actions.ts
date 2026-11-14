import * as ops from "./access-config-ops";
import type { AccessRule } from "./access-model";
import type { AccessActionsContext } from "./access-actions-context";
import { toggleItem, withoutItem } from "./access-setting-helpers";

export function createRuleActions(ctx: AccessActionsContext) {
    const { selectedField, dialog, ruleForm, selectedRuleIds } = ctx;
    const payload = dialog?.payload;

    const openAddRule = (): void => {
        ruleForm.resetRuleForm();
        ctx.setDialog({ type: "addRule" });
    };

    const openEditRule = (rule: AccessRule): void => {
        ruleForm.fillRuleForm(rule);
        ctx.setDialog({ type: "editRule", payload: { ruleId: rule.id } });
    };

    const saveRule = (): void => {
        if (!selectedField) return;

        const formRule = ruleForm.getRuleFromForm();

        if (!formRule) {
            alert("Заполни значение правила");
            return;
        }

        if (dialog?.type === "addRule") {
            ctx.setDraftConfig((prev) => ops.addRule(prev, selectedField.id, formRule));
        }

        if (dialog?.type === "editRule") {
            ctx.setDraftConfig((prev) =>
                ops.replaceRuleCondition(prev, selectedField.id, payload.ruleId, formRule)
            );
        }

        ctx.setDialog(null);
    };

    const deleteRule = (): void => {
        if (!selectedField || !payload?.ruleId) return;

        const ruleId = payload.ruleId;
        ctx.setDraftConfig((prev) => ops.removeRule(prev, selectedField.id, ruleId));
        ctx.setSelectedRuleIds((prev) => withoutItem(prev, ruleId));
        ctx.setSelectedGroupKeys([]);

        ctx.setDialog(null);
    };

    const toggleRuleSelect = (ruleId: string): void => {
        ctx.setSelectedRuleIds((prev) => toggleItem(prev, ruleId));
    };

    const deleteSelectedRules = (): void => {
        if (!selectedField || selectedRuleIds.length === 0) return;

        ctx.setDraftConfig((prev) => ops.removeRules(prev, selectedField.id, selectedRuleIds));
        ctx.setSelectedRuleIds([]);
        ctx.setSelectedGroupKeys([]);
    };

    return {
        openAddRule,
        openEditRule,
        saveRule,
        deleteRule,
        toggleRuleSelect,
        deleteSelectedRules,
    };
}
