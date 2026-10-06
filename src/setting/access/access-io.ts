import {
    summarizeAccessConfigDiff,
    validateAccessConfigImport,
} from "../../shared/agri-access-config";
import {
    getConfigGroupIds,
    type AccessConfig,
    type PortalGroupInfo,
} from "./access-model";

/** Browser dialogs used by the import flow (injectable for tests). */
export interface ImportDialogs {
    alert: (message: string) => void;
    confirm: (message: string) => boolean;
}

/** Triggers a browser download of the config as pretty-printed JSON. */
export const downloadAccessConfigJson = (config: AccessConfig): void => {
    const blob = new Blob([JSON.stringify(config, null, 4)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "access-config.json";
    link.click();

    URL.revokeObjectURL(url);
};

/** Copies text to the clipboard, falling back to execCommand. Throws on failure. */
export const copyTextToClipboard = async (text: string): Promise<void> => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = text;
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.focus();
    temporaryInput.select();
    document.execCommand("copy");
    document.body.removeChild(temporaryInput);
};

/**
 * Parses + validates an imported access config JSON and asks the user to
 * confirm it. Returns the config to apply, or null when rejected/cancelled.
 */
export const resolveAccessImport = (
    rawText: string,
    currentConfig: AccessConfig,
    groupsInfo: Record<string, PortalGroupInfo>,
    dialogs: ImportDialogs,
): AccessConfig | null => {
    try {
        const parsed: unknown = JSON.parse(rawText);
        const validated = validateAccessConfigImport(parsed);
        if (validated.ok === false) {
            dialogs.alert(
                "Неверная структура JSON / invalid access config:\n" +
                    validated.errors.slice(0, 8).join("\n"),
            );
            return null;
        }

        const importedConfig = validated.config;
        const importedGroupIds = getConfigGroupIds(importedConfig);
        const knownGroupIds = Object.keys(groupsInfo);
        if (knownGroupIds.length > 0 && importedGroupIds.length > 0) {
            const unknownGroupIds = importedGroupIds.filter(
                (groupId) => !(groupId in groupsInfo),
            );
            if (unknownGroupIds.length > 0) {
                const proceed = dialogs.confirm(
                    "Warning / Предупреждение: imported config references group IDs not found in portal:\n" +
                        unknownGroupIds.join("\n") +
                        "\n\nContinue import?",
                );
                if (!proceed) return null;
            }
        }

        const diff = summarizeAccessConfigDiff(currentConfig, importedConfig);
        const confirmed = dialogs.confirm(
            "Import access config?\n\n" + diff + "\n\nApply to draft?",
        );
        if (!confirmed) return null;

        return importedConfig;
    } catch {
        dialogs.alert("Неверная структура JSON");
        return null;
    }
};
