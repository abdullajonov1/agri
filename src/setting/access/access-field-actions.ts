import * as ops from "./access-config-ops";
import type { AccessActionsContext } from "./access-actions-context";
import { buildNewField, nextSelectedIdAfterRemoval } from "./access-setting-helpers";

export function createFieldActions(ctx: AccessActionsContext) {
    const { selectedField, dialog, ruleForm } = ctx;
    const payload = dialog?.payload;

    const openAddField = (): void => {
        ctx.setFormTitle("");
        ctx.setFormField("");
        ruleForm.resetRuleForm();
        ctx.setDialog({ type: "addField" });
    };

    const openEditField = (): void => {
        if (!selectedField) return;

        ctx.setFormTitle(selectedField.title);
        ctx.setFormField(selectedField.field);
        ctx.setDialog({ type: "editField", payload: { fieldId: selectedField.id } });
    };

    const saveField = (): void => {
        const { formTitle, formField } = ctx;
        if (!formTitle.trim() || !formField.trim()) return;

        if (dialog?.type === "addField") {
            const firstRule = ruleForm.getRuleFromForm();
            const newField = buildNewField(formTitle, formField, firstRule);

            ctx.setDraftConfig((prev) => ops.addField(prev, newField));
            ctx.setSelectedId(newField.id);
            ctx.resetSelection();
        }

        if (dialog?.type === "editField") {
            ctx.setDraftConfig((prev) =>
                ops.updateFieldMeta(prev, payload.fieldId, formTitle.trim(), formField.trim())
            );
        }

        ctx.setDialog(null);
    };

    const deleteField = (): void => {
        if (!selectedField) return;

        ctx.setDraftConfig((prev) => {
            const next = ops.removeField(prev, selectedField.id);

            ctx.setSelectedId(nextSelectedIdAfterRemoval(next));
            ctx.resetSelection();

            return next;
        });

        ctx.setDialog(null);
    };

    return { openAddField, openEditField, saveField, deleteField };
}
