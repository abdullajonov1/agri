import { React, Immutable } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { Config, IMConfig } from "../../config";
import {
    GLOBAL_ACCESS_ID,
    cloneAccessConfig,
    type AccessConfig,
    type AccessFieldRule,
    type AccessRule,
    type DialogState,
    type PortalGroupInfo,
} from "./access-model";
import {
    copyTextToClipboard,
    downloadAccessConfigJson,
    resolveAccessImport,
} from "./access-io";
import { useAccessNotice } from "./use-access-notice";
import { usePortalGroups } from "./use-portal-groups";
import { useRuleForm, type RuleFormController } from "./use-rule-form";
import { useAccessFormFields } from "./use-access-form-fields";
import { findSelectedField } from "./access-setting-helpers";
import { useAccessDraft } from "./use-access-draft";
import type { AccessActionsContext } from "./access-actions-context";
import { createFieldActions } from "./access-field-actions";
import { createRuleActions } from "./access-rule-actions";
import { createGroupActions } from "./access-group-actions";

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

/** State + handlers of the access-rules editor modal. */
export function useAccessSetting(
    props: AllWidgetSettingProps<IMConfig>,
): AccessSettingController {
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const {
        config,
        setConfig,
        savedConfig,
        setSavedConfig,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        setDraftConfig,
    } = useAccessDraft(props.config);
    const { notice, showNotice } = useAccessNotice();

    const { groupsInfo, groupsLoading } = usePortalGroups(config);

    const [selectedId, setSelectedId] = React.useState<string>(GLOBAL_ACCESS_ID);
    const [dialog, setDialog] = React.useState<DialogState>(null);

    const [selectedRuleIds, setSelectedRuleIds] = React.useState<string[]>([]);
    const [selectedGroupKeys, setSelectedGroupKeys] = React.useState<string[]>([]);

    const {
        formTitle,
        setFormTitle,
        formField,
        setFormField,
        formGroup,
        setFormGroup,
    } = useAccessFormFields();

    const ruleForm = useRuleForm();

    const selectedField = findSelectedField(config, selectedId);

    const resetSelection = (): void => {
        setSelectedRuleIds([]);
        setSelectedGroupKeys([]);
    };

    const selectLeftItem = (id: string): void => {
        setSelectedId(id);
        resetSelection();
    };

    const ctx: AccessActionsContext = {
        selectedId,
        selectedField,
        dialog,
        selectedRuleIds,
        selectedGroupKeys,
        formTitle,
        formField,
        formGroup,
        ruleForm,
        setDialog,
        setSelectedId,
        setSelectedRuleIds,
        setSelectedGroupKeys,
        setFormTitle,
        setFormField,
        setFormGroup,
        setDraftConfig,
        resetSelection,
    };

    const fieldActions = createFieldActions(ctx);
    const ruleActions = createRuleActions(ctx);
    const groupActions = createGroupActions(ctx);

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
                    alert: (message) => { alert(message); },
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
        openAddField: fieldActions.openAddField,
        openEditField: fieldActions.openEditField,
        saveField: fieldActions.saveField,
        deleteField: fieldActions.deleteField,
        openAddRule: ruleActions.openAddRule,
        openEditRule: ruleActions.openEditRule,
        saveRule: ruleActions.saveRule,
        deleteRule: ruleActions.deleteRule,
        toggleRuleSelect: ruleActions.toggleRuleSelect,
        deleteSelectedRules: ruleActions.deleteSelectedRules,
        toggleGroupSelect: groupActions.toggleGroupSelect,
        deleteSelectedGroups: groupActions.deleteSelectedGroups,
        openAddGroup: groupActions.openAddGroup,
        openEditGroup: groupActions.openEditGroup,
        saveGroup: groupActions.saveGroup,
        deleteGroup: groupActions.deleteGroup,
        openAddGlobalGroup: groupActions.openAddGlobalGroup,
        openEditGlobalGroup: groupActions.openEditGlobalGroup,
        saveGlobalGroup: groupActions.saveGlobalGroup,
        deleteGlobalGroup: groupActions.deleteGlobalGroup,
        downloadJson,
        uploadJson,
        copyGroupId,
        applyConfig,
        cancelConfigChanges,
    };
}
