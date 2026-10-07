import { React, getAppStore } from "jimu-core";
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import {
    getConfigGroupIds,
    type AccessConfig,
    type PortalGroupInfo,
} from "./access-model";
import { getPortalGroupInfo, type EsriRequestFunction } from "./portal-groups";

export interface PortalGroupsState {
    groupsInfo: Record<string, PortalGroupInfo>;
    groupsLoading: boolean;
}

/** Loads Portal title / member count for every group id referenced by the config. */
export function usePortalGroups(config: AccessConfig): PortalGroupsState {
    const [groupsInfo, setGroupsInfo] = React.useState<Record<string, PortalGroupInfo>>({});
    const [groupsLoading, setGroupsLoading] = React.useState<boolean>(false);

    // Latest config, read inside the effect. The effect itself is keyed on
    // the group-id signature so unrelated AccessConfig edits (rule values,
    // titles, operators) do not trigger a Portal re-fetch.
    const configRef = React.useRef<AccessConfig>(config);
    configRef.current = config;

    const groupIdsSignature = getConfigGroupIds(config).join("|");

    React.useEffect(() => {
        let isCancelled = false;

        const loadGroupsInfo = async (): Promise<void> => {
            const groupIds = getConfigGroupIds(configRef.current);

            if (groupIds.length === 0) {
                setGroupsInfo({});
                return;
            }

            const portalUrl = getAppStore().getState()?.portalUrl;

            if (!portalUrl) {
                return;
            }

            setGroupsLoading(true);

            try {
                const [esriRequest] = await loadArcGISJSAPIModules([
                    "esri/request",
                ]) as [EsriRequestFunction];

                const result = await Promise.all(
                    groupIds.map((groupId) =>
                        getPortalGroupInfo(esriRequest, portalUrl, groupId)
                    )
                );

                if (!isCancelled) {
                    const mapped = result.reduce<Record<string, PortalGroupInfo>>(
                        (value, item) => ({ ...value, [item.id]: item }),
                        {}
                    );

                    setGroupsInfo(mapped);
                }
            } finally {
                if (!isCancelled) {
                    setGroupsLoading(false);
                }
            }
        };

        void loadGroupsInfo();

        return () => {
            isCancelled = true;
        };
    }, [groupIdsSignature]);

    return { groupsInfo, groupsLoading };
}
