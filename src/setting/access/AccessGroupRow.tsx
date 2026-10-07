import { React } from "jimu-core";
import type { PortalGroupInfo } from "./access-model";

interface GroupIdentityProps {
    groupId: string;
    groupInfo: PortalGroupInfo | undefined;
    groupsLoading: boolean;
    onCopyGroupId: (groupId: string) => Promise<void>;
}

/** Group title (from Portal), copyable id and member count. */
export function AccessGroupIdentity(props: GroupIdentityProps) {
    const { groupId, groupInfo, groupsLoading, onCopyGroupId } = props;

    return (
        <div className="groupIdentity">
            <div className="groupName">
                {groupsLoading ? (
                    <span className="groupNameLoading" aria-busy="true" aria-live="polite">
                        Загрузка…
                    </span>
                ) : (
                    groupInfo?.title ?? "Название недоступно"
                )}
            </div>

            <button
                type="button"
                className="groupIdCopyButton"
                title="Скопировать ID"
                onClick={(event) => {
                    event.stopPropagation();
                    void onCopyGroupId(groupId);
                }}
            >
                {groupId}
            </button>

            {groupInfo?.usersCount !== null && groupInfo?.usersCount !== undefined && (
                <div className="groupMembers">
                    Пользователей: {groupInfo.usersCount}
                </div>
            )}
        </div>
    );
}

interface AccessGroupRowProps extends GroupIdentityProps {
    isSelected: boolean;
    onToggleSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/** One selectable group row with edit/delete actions. */
export function AccessGroupRow(props: AccessGroupRowProps) {
    const { isSelected, onToggleSelect, onEdit, onDelete, ...identity } = props;

    return (
        <div className={`groupRow ${isSelected ? "selectedGroup" : ""}`}>
            <input
                type="checkbox"
                className="selectCheckbox"
                checked={isSelected}
                onChange={onToggleSelect}
            />

            <AccessGroupIdentity {...identity} />

            <div className="groupActions">
                <button className="miniIconButton" onClick={onEdit}>
                    ✎
                </button>

                <button className="miniIconButton danger" onClick={onDelete}>
                    ×
                </button>
            </div>
        </div>
    );
}
