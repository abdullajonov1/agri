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

    const groupIdsSignature = getConfigGroupIds(config).join("|");

    React.useEffect(() => {
        let isCancelled = false;

        const loadGroupsInfo = async (): Promise<void> => {
            const groupIds = getConfigGroupIds(config);

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
        // groupIdsSignature is derived from config group ids — intentional
        // dependency (avoids re-fetch on unrelated AccessConfig field edits).
    }, [groupIdsSignature]);

    return { groupsInfo, groupsLoading };
}
