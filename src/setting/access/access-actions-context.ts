import type {
    AccessConfig,
    AccessFieldRule,
    DialogState,
} from "./access-model";
import type { RuleFormController } from "./use-rule-form";

/** Shared inputs for the pure action factories used by useAccessSetting. */
export interface AccessActionsContext {
    selectedId: string;
    selectedField: AccessFieldRule | null;
    dialog: DialogState;
    selectedRuleIds: string[];
    selectedGroupKeys: string[];
    formTitle: string;
    formField: string;
    formGroup: string;
    ruleForm: RuleFormController;
    setDialog: (dialog: DialogState) => void;
    setSelectedId: (id: string) => void;
    setSelectedRuleIds: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedGroupKeys: React.Dispatch<React.SetStateAction<string[]>>;
    setFormTitle: (value: string) => void;
    setFormField: (value: string) => void;
    setFormGroup: (value: string) => void;
    setDraftConfig: (update: (previous: AccessConfig) => AccessConfig) => void;
    resetSelection: () => void;
}
