import { createGroupActions } from "./access-group-actions";
import { createRuleActions } from "./access-rule-actions";
import { createFieldActions } from "./access-field-actions";
import type { AccessActionsContext } from "./access-actions-context";

function makeCtx(over: Partial<AccessActionsContext> = {}): AccessActionsContext {
    return {
        selectedId: "global",
        selectedField: null,
        dialog: null,
        selectedRuleIds: [],
        selectedGroupKeys: [],
        formTitle: "",
        formField: "",
        formGroup: "",
        ruleForm: {
            resetRuleForm: jest.fn(),
            fillRuleForm: jest.fn(),
            getRuleFromForm: jest.fn(),
        } as any,
        setDialog: jest.fn(),
        setSelectedId: jest.fn(),
        setSelectedRuleIds: jest.fn(),
        setSelectedGroupKeys: jest.fn(),
        setFormTitle: jest.fn(),
        setFormField: jest.fn(),
        setFormGroup: jest.fn(),
        setDraftConfig: jest.fn(),
        resetSelection: jest.fn(),
        ...over,
    };
}

describe("access action factories", () => {
    it("openAddGroup clears the group form and opens the dialog", () => {
        const ctx = makeCtx();
        createGroupActions(ctx).openAddGroup("r1");
        expect(ctx.setFormGroup).toHaveBeenCalledWith("");
        expect(ctx.setDialog).toHaveBeenCalledWith({ type: "addGroup", payload: { ruleId: "r1" } });
    });

    it("saveGlobalGroup does nothing for an empty group", () => {
        const ctx = makeCtx({ formGroup: "  ", dialog: { type: "addGlobalGroup" } as any });
        createGroupActions(ctx).saveGlobalGroup();
        expect(ctx.setDraftConfig).not.toHaveBeenCalled();
        expect(ctx.setDialog).not.toHaveBeenCalled();
    });

    it("saveGlobalGroup adds a trimmed group and closes the dialog", () => {
        const ctx = makeCtx({ formGroup: " g ", dialog: { type: "addGlobalGroup" } as any });
        createGroupActions(ctx).saveGlobalGroup();
        expect(ctx.setDraftConfig).toHaveBeenCalledTimes(1);
        expect(ctx.setDialog).toHaveBeenCalledWith(null);
    });

    it("deleteSelectedRules is a no-op without selection", () => {
        const ctx = makeCtx();
        createRuleActions(ctx).deleteSelectedRules();
        expect(ctx.setDraftConfig).not.toHaveBeenCalled();
    });

    it("openAddRule resets the rule form", () => {
        const ctx = makeCtx();
        createRuleActions(ctx).openAddRule();
        expect(ctx.ruleForm.resetRuleForm).toHaveBeenCalled();
        expect(ctx.setDialog).toHaveBeenCalledWith({ type: "addRule" });
    });

    it("openEditField is a no-op without a selected field", () => {
        const ctx = makeCtx();
        createFieldActions(ctx).openEditField();
        expect(ctx.setDialog).not.toHaveBeenCalled();
    });

    it("saveField ignores blank title", () => {
        const ctx = makeCtx({ formTitle: " ", formField: "f", dialog: { type: "addField" } as any });
        createFieldActions(ctx).saveField();
        expect(ctx.setDraftConfig).not.toHaveBeenCalled();
    });
});
