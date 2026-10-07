import { AGRI_ESRI_REQUEST_TIMEOUT_MS } from "../../shared/agri-http";
import type { PortalGroupInfo } from "./access-model";

/** Subset of the Portal REST JSON read by the access settings panel. */
export interface PortalGroupJson {
    error?: { message?: string };
    title?: string;
    total?: number;
}

export type EsriRequestFunction = (
    url: string,
    options?: {
        query?: Record<string, string | number>;
        responseType?: string;
        timeout?: number;
    }
) => Promise<{ data: PortalGroupJson }>;

const fetchGroupUsersCount = async (
    esriRequest: EsriRequestFunction,
    groupUrl: string,
): Promise<number | null> => {
    try {
        const usersResponse = await esriRequest(`${groupUrl}/userList`, {
            query: {
                f: "json",
                start: 1,
                num: 1,
            },
            responseType: "json",
            timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
        });

        if (
            !usersResponse.data?.error &&
            typeof usersResponse.data?.total === "number"
        ) {
            /*
             * userList возвращает owner отдельно от массива users.
             * Владелец намеренно не добавляется к количеству пользователей.
             */
            return usersResponse.data.total;
        }
        return null;
    } catch {
        // The member count is optional decoration; the group still renders.
        return null;
    }
};

export const getPortalGroupInfo = async (
    esriRequest: EsriRequestFunction,
    portalUrl: string,
    groupId: string
): Promise<PortalGroupInfo> => {
    const encodedGroupId = encodeURIComponent(groupId);
    const groupUrl =
        `${portalUrl}/sharing/rest/community/groups/${encodedGroupId}`;

    try {
        const groupResponse = await esriRequest(groupUrl, {
            query: { f: "json" },
            responseType: "json",
            timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS,
        });

        if (groupResponse.data?.error) {
            throw new Error(groupResponse.data.error.message || "Группа недоступна");
        }

        const usersCount = await fetchGroupUsersCount(esriRequest, groupUrl);

        return {
            id: groupId,
            title: groupResponse.data?.title || "Без названия",
            usersCount,
        };
    } catch {
        // Unreachable / private group: show a placeholder instead of failing the list.
        return {
            id: groupId,
            title: "Название недоступно",
            usersCount: null,
            isUnavailable: true,
        };
    }
};
