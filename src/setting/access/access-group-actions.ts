import * as ops from "./access-config-ops";
import { GLOBAL_ACCESS_ID, makeGlobalGroupKey, makeGroupKey } from "./access-model";
import type { AccessActionsContext } from "./access-actions-context";
import { toggleItem, withoutItem } from "./access-setting-helpers";

export function createGroupActions(ctx: AccessActionsContext) {
    const { selectedField, dialog, selectedGroupKeys, selectedId } = ctx;
    const payload = dialog?.payload;

    const toggleGroupSelect = (key: string): void => {
        ctx.setSelectedGroupKeys((prev) => toggleItem(prev, key));
    };

    const deleteSelectedGroups = (): void => {
        if (selectedGroupKeys.length === 0) return;

        if (selectedId === GLOBAL_ACCESS_ID) {
            ctx.setDraftConfig((prev) => ops.removeGlobalGroupsByKeys(prev, selectedGroupKeys));
        }

        if (selectedField) {
            ctx.setDraftConfig((prev) =>
                ops.removeRuleGroupsByKeys(prev, selectedField.id, selectedGroupKeys)
            );
        }

        ctx.setSelectedGroupKeys([]);
    };

    const openAddGroup = (ruleId: string): void => {
        ctx.setFormGroup("");
        ctx.setDialog({ type: "addGroup", payload: { ruleId } });
    };

    const openEditGroup = (ruleId: string, groupIndex: number, groupValue: string): void => {
        ctx.setFormGroup(groupValue);
        ctx.setDialog({ type: "editGroup", payload: { ruleId, groupIndex } });
    };

    const saveGroup = (): void => {
        const group = ctx.formGroup.trim();
        if (!selectedField || !group) return;

        if (dialog?.type === "addGroup") {
            ctx.setDraftConfig((prev) =>
                ops.addRuleGroup(prev, selectedField.id, payload.ruleId, group)
            );
        }

        if (dialog?.type === "editGroup") {
            ctx.setDraftConfig((prev) =>
                ops.updateRuleGroup(prev, selectedField.id, payload.ruleId, payload.groupIndex, group)
            );
        }

        ctx.setDialog(null);
    };

    const deleteGroup = (): void => {
        if (!selectedField || !payload) return;

        ctx.setDraftConfig((prev) =>
            ops.removeRuleGroup(prev, selectedField.id, payload.ruleId, payload.groupIndex)
        );
        ctx.setSelectedGroupKeys((prev) =>
            withoutItem(prev, makeGroupKey(payload.ruleId, payload.groupIndex))
        );

        ctx.setDialog(null);
    };

    const openAddGlobalGroup = (): void => {
        ctx.setFormGroup("");
        ctx.setDialog({ type: "addGlobalGroup" });
    };

    const openEditGlobalGroup = (groupIndex: number, groupValue: string): void => {
        ctx.setFormGroup(groupValue);
        ctx.setDialog({ type: "editGlobalGroup", payload: { groupIndex } });
    };

    const saveGlobalGroup = (): void => {
        const group = ctx.formGroup.trim();
        if (!group) return;

        if (dialog?.type === "addGlobalGroup") {
            ctx.setDraftConfig((prev) => ops.addGlobalGroup(prev, group));
        }

        if (dialog?.type === "editGlobalGroup") {
            ctx.setDraftConfig((prev) => ops.updateGlobalGroup(prev, payload.groupIndex, group));
        }

        ctx.setDialog(null);
    };

    const deleteGlobalGroup = (): void => {
        if (!payload) return;

        ctx.setDraftConfig((prev) => ops.removeGlobalGroup(prev, payload.groupIndex));
        ctx.setSelectedGroupKeys((prev) =>
            withoutItem(prev, makeGlobalGroupKey(payload.groupIndex))
        );

        ctx.setDialog(null);
    };

    return {
        toggleGroupSelect,
        deleteSelectedGroups,
        openAddGroup,
        openEditGroup,
        saveGroup,
        deleteGroup,
        openAddGlobalGroup,
        openEditGlobalGroup,
        saveGlobalGroup,
        deleteGlobalGroup,
    };
}
