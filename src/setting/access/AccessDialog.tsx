import { React } from "jimu-core";
import { AccessRuleForm } from "./AccessRuleForm";
import type { AccessSettingController } from "./use-access-setting";

interface DialogProps {
    ctl: AccessSettingController;
}

interface ConfirmDeleteProps {
    title: string;
    text: string;
    onCancel: () => void;
    onConfirm: () => void;
}

function ConfirmDelete({ title, text, onCancel, onConfirm }: ConfirmDeleteProps) {
    return (
        <>
            <div className="dialogTitle">{title}</div>
            <div className="dialogText">{text}</div>

            <div className="dialogActions">
                <button onClick={onCancel}>Cancel / Отмена</button>
                <button className="dangerButton" onClick={onConfirm}>
                    Delete / Удалить
                </button>
            </div>
        </>
    );
}

interface GroupInputProps {
    title: string;
    ctl: AccessSettingController;
    onSave: () => void;
}

function GroupInputDialog({ title, ctl, onSave }: GroupInputProps) {
    return (
        <>
            <div className="dialogTitle">{title}</div>

            <input
                className="dialogInput"
                placeholder="Группа"
                value={ctl.formGroup}
                onChange={(e) => ctl.setFormGroup(e.target.value)}
            />

            <div className="dialogActions">
                <button onClick={() => ctl.setDialog(null)}>Cancel / Отмена</button>
                <button onClick={onSave}>Save / Сохранить</button>
            </div>
        </>
    );
}

function FieldDialog({ ctl }: DialogProps) {
    const isAdd = ctl.dialog.type === "addField";

    return (
        <>
            <div className="dialogTitle">
                {isAdd ? "Add field / Добавить столбец" : "Edit field / Редактировать столбец"}
            </div>

            <input
                className="dialogInput"
                placeholder="Название"
                value={ctl.formTitle}
                onChange={(e) => ctl.setFormTitle(e.target.value)}
            />

            <input
                className="dialogInput"
                placeholder="Поле"
                value={ctl.formField}
                onChange={(e) => ctl.setFormField(e.target.value)}
            />

            {isAdd && (
                <div className="optionalRuleBlock">
                    <div className="optionalRuleTitle">
                        Первое правило
                    </div>
                    <AccessRuleForm form={ctl.ruleForm} selectedField={ctl.selectedField} />
                </div>
            )}

            <div className="dialogActions">
                <button onClick={() => ctl.setDialog(null)}>Cancel / Отмена</button>
                <button onClick={ctl.saveField}>Save / Сохранить</button>
            </div>
        </>
    );
}

function RuleDialog({ ctl }: DialogProps) {
    return (
        <>
            <div className="dialogTitle">
                {ctl.dialog.type === "addRule"
                    ? "Add rule / Добавить правило"
                    : "Edit rule / Редактировать правило"}
            </div>

            <AccessRuleForm form={ctl.ruleForm} selectedField={ctl.selectedField} />

            <div className="dialogActions">
                <button onClick={() => ctl.setDialog(null)}>Cancel / Отмена</button>
                <button onClick={ctl.saveRule}>Save / Сохранить</button>
            </div>
        </>
    );
}

/** Content of the currently open add/edit/delete dialog. */
function AccessDialogContent({ ctl }: DialogProps) {
    const close = (): void => ctl.setDialog(null);

    switch (ctl.dialog.type) {
        case "addField":
        case "editField":
            return <FieldDialog ctl={ctl} />;
        case "deleteField":
            return (
                <ConfirmDelete
                    title="Delete field? / Удалить столбец?"
                    text="Все правила внутри него тоже будут удалены."
                    onCancel={close}
                    onConfirm={ctl.deleteField}
                />
            );
        case "addRule":
        case "editRule":
            return <RuleDialog ctl={ctl} />;
        case "deleteRule":
            return (
                <ConfirmDelete
                    title="Delete rule? / Удалить правило?"
                    text="Группы внутри этого правила тоже будут удалены."
                    onCancel={close}
                    onConfirm={ctl.deleteRule}
                />
            );
        case "addGroup":
        case "editGroup":
            return (
                <GroupInputDialog
                    ctl={ctl}
                    title={ctl.dialog.type === "addGroup" ? "Добавить группу" : "Редактировать группу"}
                    onSave={ctl.saveGroup}
                />
            );
        case "deleteGroup":
            return (
                <ConfirmDelete
                    title="Delete group? / Удалить группу?"
                    text="Группа будет удалена только из этого правила."
                    onCancel={close}
                    onConfirm={ctl.deleteGroup}
                />
            );
        case "addGlobalGroup":
        case "editGlobalGroup":
            return (
                <GroupInputDialog
                    ctl={ctl}
                    title={
                        ctl.dialog.type === "addGlobalGroup"
                            ? "Add full-access group / Добавить группу полного доступа"
                            : "Edit full-access group / Редактировать группу полного доступа"
                    }
                    onSave={ctl.saveGlobalGroup}
                />
            );
        case "deleteGlobalGroup":
            return (
                <ConfirmDelete
                    title="Delete full-access group? / Удалить группу полного доступа?"
                    text="Эта группа больше не будет получать доступ ко всем данным."
                    onCancel={close}
                    onConfirm={ctl.deleteGlobalGroup}
                />
            );
        default:
            return null;
    }
}

/** Modal dialog overlay for the access editor; renders nothing when closed. */
export function AccessDialog({ ctl }: DialogProps) {
    if (!ctl.dialog) return null;

    return (
        <div className="dialogArea">
            <div className="dialogBlock">
                <AccessDialogContent ctl={ctl} />
            </div>
        </div>
    );
}
