import { React } from "jimu-core";
import type { IMConfig } from "../../config";
import { getInitialAccessConfig, type AccessConfig } from "./access-model";

/** Draft/saved access config state, resynced when the stored accessConfig changes. */
export function useAccessDraft(storedConfig: IMConfig | undefined) {
    const [config, setConfig] = React.useState<AccessConfig>(() =>
        getInitialAccessConfig(storedConfig)
    );
    const [savedConfig, setSavedConfig] = React.useState<AccessConfig>(() =>
        getInitialAccessConfig(storedConfig)
    );
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);

    // Only accessConfig — full props.config would reset drafts on unrelated
    // setting patches (layout, serviceUrls) and discard unsaved edits.
    const storedAccessConfig = storedConfig?.accessConfig;
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

    return {
        config,
        setConfig,
        savedConfig,
        setSavedConfig,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        setDraftConfig,
    };
}
