import { React, Immutable } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { Config, IMConfig } from "../../config";
import {
    GLOBAL_ACCESS_ID,
    cloneAccessConfig,
    getInitialAccessConfig,
    makeGlobalGroupKey,
    makeGroupKey,
    makeId,
    type AccessConfig,
    type AccessFieldRule,
    type AccessRule,
    type DialogState,
    type PortalGroupInfo,
} from "./access-model";
import * as ops from "./access-config-ops";
import {
    copyTextToClipboard,
    downloadAccessConfigJson,
    resolveAccessImport,
} from "./access-io";
import { useAccessNotice } from "./use-access-notice";
import { usePortalGroups } from "./use-portal-groups";
import { useRuleForm, type RuleFormController } from "./use-rule-form";

export interface AccessSettingController {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    config: AccessConfig;
    hasUnsavedChanges: boolean;
    notice: string | null;
    groupsInfo: Record<string, PortalGroupInfo>;
    groupsLoading: boolean;
    selectedId: string;
    selectedField: AccessFieldRule | null;
    dialog: DialogState;
    setDialog: (dialog: DialogState) => void;
    selectedRuleIds: string[];
    selectedGroupKeys: string[];
    formTitle: string;
    setFormTitle: (value: string) => void;
    formField: string;
    setFormField: (value: string) => void;
    formGroup: string;
    setFormGroup: (value: string) => void;
    ruleForm: RuleFormController;
    selectLeftItem: (id: string) => void;
    openAddField: () => void;
    openEditField: () => void;
    saveField: () => void;
    deleteField: () => void;
    openAddRule: () => void;
    openEditRule: (rule: AccessRule) => void;
    saveRule: () => void;
    deleteRule: () => void;
    toggleRuleSelect: (ruleId: string) => void;
    deleteSelectedRules: () => void;
    toggleGroupSelect: (key: string) => void;
    deleteSelectedGroups: () => void;
    openAddGroup: (ruleId: string) => void;
    openEditGroup: (ruleId: string, groupIndex: number, groupValue: string) => void;
    saveGroup: () => void;
    deleteGroup: () => void;
    openAddGlobalGroup: () => void;
    openEditGlobalGroup: (groupIndex: number, groupValue: string) => void;
    saveGlobalGroup: () => void;
    deleteGlobalGroup: () => void;
    downloadJson: () => void;
    uploadJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
    copyGroupId: (groupId: string) => Promise<void>;
    applyConfig: () => void;
    cancelConfigChanges: () => void;
}

const toggleItem = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

/** State + handlers of the access-rules editor modal. */
export function useAccessSetting(
    props: AllWidgetSettingProps<IMConfig>,
): AccessSettingController {
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [config, setConfig] = React.useState<AccessConfig>(() =>
        getInitialAccessConfig(props.config)
    );
    const [savedConfig, setSavedConfig] = React.useState<AccessConfig>(() =>
        getInitialAccessConfig(props.config)
    );
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);
    const { notice, showNotice } = useAccessNotice();

    // Only accessConfig — full props.config would reset drafts on unrelated
    // setting patches (layout, serviceUrls) and discard unsaved edits.
    const storedAccessConfig = props.config?.accessConfig;
    React.useEffect(() => {
        const next = getInitialAccessConfig({ accessConfig: storedAccessConfig });
        setConfig(next);
        setSavedConfig(next);
        setHasUnsavedChanges(false);
    }, [storedAccessConfig]);

    const setDraftConfig = (
        update: (previous: AccessConfig) => AccessConfig
    ): void => {
        setConfig((previous) => update(previous));
        setHasUnsavedChanges(true);
    };

    const { groupsInfo, groupsLoading } = usePortalGroups(config);

    const [selectedId, setSelectedId] = React.useState<string>(GLOBAL_ACCESS_ID);
    const [dialog, setDialog] = React.useState<DialogState>(null);

    const [selectedRuleIds, setSelectedRuleIds] = React.useState<string[]>([]);
    const [selectedGroupKeys, setSelectedGroupKeys] = React.useState<string[]>([]);

    const [formTitle, setFormTitle] = React.useState<string>("");
    const [formField, setFormField] = React.useState<string>("");
    const [formGroup, setFormGroup] = React.useState<string>("");

    const ruleForm = useRuleForm();

    const selectedField =
        selectedId === GLOBAL_ACCESS_ID
            ? null
            : config.rules.find((item) => item.id === selectedId) ?? null;

    const payload = dialog?.payload;

    const resetSelection = (): void => {
        setSelectedRuleIds([]);
        setSelectedGroupKeys([]);
    };

    const selectLeftItem = (id: string): void => {
        setSelectedId(id);
        resetSelection();
    };

    const openAddField = (): void => {
        setFormTitle("");
        setFormField("");
        ruleForm.resetRuleForm();
        setDialog({ type: "addField" });
    };

    const openEditField = (): void => {
        if (!selectedField) return;

        setFormTitle(selectedField.title);
        setFormField(selectedField.field);
        setDialog({ type: "editField", payload: { fieldId: selectedField.id } });
    };

    const saveField = (): void => {
        if (!formTitle.trim() || !formField.trim()) return;

        if (dialog?.type === "addField") {
            const firstRule = ruleForm.getRuleFromForm();

            const newField: AccessFieldRule = {
                id: makeId(),
                title: formTitle.trim(),
                field: formField.trim(),
                rules: firstRule ? [firstRule] : [],
            };

            setDraftConfig((prev) => ops.addField(prev, newField));
            setSelectedId(newField.id);
            resetSelection();
        }

        if (dialog?.type === "editField") {
            setDraftConfig((prev) =>
                ops.updateFieldMeta(prev, payload.fieldId, formTitle.trim(), formField.trim())
            );
        }

        setDialog(null);
    };

    const deleteField = (): void => {
        if (!selectedField) return;

        setDraftConfig((prev) => {
            const next = ops.removeField(prev, selectedField.id);

            setSelectedId(next.rules[0]?.id ?? GLOBAL_ACCESS_ID);
            resetSelection();

            return next;
        });

        setDialog(null);
    };

    const openAddRule = (): void => {
        ruleForm.resetRuleForm();
        setDialog({ type: "addRule" });
    };

    const openEditRule = (rule: AccessRule): void => {
        ruleForm.fillRuleForm(rule);
        setDialog({ type: "editRule", payload: { ruleId: rule.id } });
    };

    const saveRule = (): void => {
        if (!selectedField) return;

        const formRule = ruleForm.getRuleFromForm();

        if (!formRule) {
            alert("Заполни значение правила");
            return;
        }

        if (dialog?.type === "addRule") {
            setDraftConfig((prev) => ops.addRule(prev, selectedField.id, formRule));
        }

        if (dialog?.type === "editRule") {
            setDraftConfig((prev) =>
                ops.replaceRuleCondition(prev, selectedField.id, payload.ruleId, formRule)
            );
        }

        setDialog(null);
    };

    const deleteRule = (): void => {
        if (!selectedField || !payload?.ruleId) return;

        const ruleId = payload.ruleId;
        setDraftConfig((prev) => ops.removeRule(prev, selectedField.id, ruleId));
        setSelectedRuleIds((prev) => prev.filter((id) => id !== ruleId));
        setSelectedGroupKeys([]);

        setDialog(null);
    };

    const toggleRuleSelect = (ruleId: string): void => {
        setSelectedRuleIds((prev) => toggleItem(prev, ruleId));
    };

    const deleteSelectedRules = (): void => {
        if (!selectedField || selectedRuleIds.length === 0) return;

        setDraftConfig((prev) => ops.removeRules(prev, selectedField.id, selectedRuleIds));
        setSelectedRuleIds([]);
        setSelectedGroupKeys([]);
    };

    const toggleGroupSelect = (key: string): void => {
        setSelectedGroupKeys((prev) => toggleItem(prev, key));
    };

    const deleteSelectedGroups = (): void => {
        if (selectedGroupKeys.length === 0) return;

        if (selectedId === GLOBAL_ACCESS_ID) {
            setDraftConfig((prev) => ops.removeGlobalGroupsByKeys(prev, selectedGroupKeys));
        }

        if (selectedField) {
            setDraftConfig((prev) =>
                ops.removeRuleGroupsByKeys(prev, selectedField.id, selectedGroupKeys)
            );
        }

        setSelectedGroupKeys([]);
    };

    const openAddGroup = (ruleId: string): void => {
        setFormGroup("");
        setDialog({ type: "addGroup", payload: { ruleId } });
    };

    const openEditGroup = (ruleId: string, groupIndex: number, groupValue: string): void => {
        setFormGroup(groupValue);
        setDialog({ type: "editGroup", payload: { ruleId, groupIndex } });
    };

    const saveGroup = (): void => {
        if (!selectedField || !formGroup.trim()) return;

        if (dialog?.type === "addGroup") {
            setDraftConfig((prev) =>
                ops.addRuleGroup(prev, selectedField.id, payload.ruleId, formGroup.trim())
            );
        }

        if (dialog?.type === "editGroup") {
            setDraftConfig((prev) =>
                ops.updateRuleGroup(
                    prev,
                    selectedField.id,
                    payload.ruleId,
                    payload.groupIndex,
                    formGroup.trim()
                )
            );
        }

        setDialog(null);
    };

    const deleteGroup = (): void => {
        if (!selectedField || !payload) return;

        setDraftConfig((prev) =>
            ops.removeRuleGroup(prev, selectedField.id, payload.ruleId, payload.groupIndex)
        );
        setSelectedGroupKeys((prev) =>
            prev.filter((key) => key !== makeGroupKey(payload.ruleId, payload.groupIndex))
        );

        setDialog(null);
    };

    const openAddGlobalGroup = (): void => {
        setFormGroup("");
        setDialog({ type: "addGlobalGroup" });
    };

    const openEditGlobalGroup = (groupIndex: number, groupValue: string): void => {
        setFormGroup(groupValue);
        setDialog({ type: "editGlobalGroup", payload: { groupIndex } });
    };

    const saveGlobalGroup = (): void => {
        if (!formGroup.trim()) return;

        if (dialog?.type === "addGlobalGroup") {
            setDraftConfig((prev) => ops.addGlobalGroup(prev, formGroup.trim()));
        }

        if (dialog?.type === "editGlobalGroup") {
            setDraftConfig((prev) =>
                ops.updateGlobalGroup(prev, payload.groupIndex, formGroup.trim())
            );
        }

        setDialog(null);
    };

    const deleteGlobalGroup = (): void => {
        if (!payload) return;

        setDraftConfig((prev) => ops.removeGlobalGroup(prev, payload.groupIndex));
        setSelectedGroupKeys((prev) =>
            prev.filter((key) => key !== makeGlobalGroupKey(payload.groupIndex))
        );

        setDialog(null);
    };

    const downloadJson = (): void => {
        downloadAccessConfigJson(config);
    };

    const uploadJson = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const importedConfig = resolveAccessImport(
                String(reader.result),
                config,
                groupsInfo,
                {
                    alert: (message) => alert(message),
                    confirm: (message) => window.confirm(message),
                },
            );
            if (!importedConfig) return;

            setDraftConfig(() => importedConfig);
            setSelectedId(GLOBAL_ACCESS_ID);
            resetSelection();
        };

        reader.readAsText(file);
        event.target.value = "";
    };

    const copyGroupId = async (groupId: string): Promise<void> => {
        try {
            await copyTextToClipboard(groupId);
            showNotice("ID скопирован");
        } catch {
            showNotice("Не удалось скопировать ID");
        }
    };

    const applyConfig = (): void => {
        const nextConfig = cloneAccessConfig(config);
        const widgetConfig = props.config ?? Immutable.from<Config>({});

        props.onSettingChange({
            id: props.id,
            config: widgetConfig.set("accessConfig", Immutable.from(nextConfig)),
        });

        setSavedConfig(nextConfig);
        setHasUnsavedChanges(false);
        showNotice("Настройки применены");
    };

    const cancelConfigChanges = (): void => {
        setConfig(cloneAccessConfig(savedConfig));
        setSelectedId(GLOBAL_ACCESS_ID);
        setDialog(null);
        resetSelection();
        setHasUnsavedChanges(false);
        showNotice("Изменения отменены");
    };

    return {
        showModal,
        setShowModal,
        config,
        hasUnsavedChanges,
        notice,
        groupsInfo,
        groupsLoading,
        selectedId,
        selectedField,
        dialog,
        setDialog,
        selectedRuleIds,
        selectedGroupKeys,
        formTitle,
        setFormTitle,
        formField,
        setFormField,
        formGroup,
        setFormGroup,
        ruleForm,
        selectLeftItem,
        openAddField,
        openEditField,
        saveField,
        deleteField,
        openAddRule,
        openEditRule,
        saveRule,
        deleteRule,
        toggleRuleSelect,
        deleteSelectedRules,
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
        downloadJson,
        uploadJson,
        copyGroupId,
        applyConfig,
        cancelConfigChanges,
    };
}
