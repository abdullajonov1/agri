import { React } from "jimu-core";
import { makeGlobalGroupKey } from "./access-model";
import { AccessGroupRow } from "./AccessGroupRow";
import type { AccessSettingController } from "./use-access-setting";

interface PanelProps {
    ctl: AccessSettingController;
}

/** Bulk "delete selected groups" bar shown while any group checkbox is set. */
export function SelectedGroupsBar({ ctl }: PanelProps) {
    if (ctl.selectedGroupKeys.length === 0) return null;

    return (
        <div className="bulkActionBar">
            <span>Выбрано групп: {ctl.selectedGroupKeys.length}</span>

            <button className="dangerButtonSmall" onClick={ctl.deleteSelectedGroups}>
                Delete selected / Удалить выбранные
            </button>
        </div>
    );
}

/** Right-hand panel for the "Full access" pseudo-field (1=1 groups). */
export function AccessGlobalPanel({ ctl }: PanelProps) {
    const { config, selectedGroupKeys } = ctl;

    return (
        <>
            <div className="rightHeader">
                <div>
                    <div className="rightTitle">Full access / Полный доступ</div>
                    <div className="rightField">Условие: 1=1</div>
                </div>

                <button className="smallButton" onClick={ctl.openAddGlobalGroup}>
                    + Add group / Добавить группу
                </button>
            </div>

            <div className="rulesArea">
                <SelectedGroupsBar ctl={ctl} />

                {config.fullAccessGroups.length === 0 ? (
                    <div className="emptyRules">
                        Группы полного доступа ещё не добавлены
                    </div>
                ) : (
                    config.fullAccessGroups.map((group, index) => {
                        const groupKey = makeGlobalGroupKey(index);

                        return (
                            <AccessGroupRow
                                key={`${group}_${index}`}
                                groupId={group}
                                groupInfo={ctl.groupsInfo[group]}
                                groupsLoading={ctl.groupsLoading}
                                onCopyGroupId={ctl.copyGroupId}
                                isSelected={selectedGroupKeys.includes(groupKey)}
                                onToggleSelect={() => ctl.toggleGroupSelect(groupKey)}
                                onEdit={() => ctl.openEditGlobalGroup(index, group)}
                                onDelete={() =>
                                    ctl.setDialog({
                                        type: "deleteGlobalGroup",
                                        payload: { groupIndex: index },
                                    })
                                }
                            />
                        );
                    })
                )}
            </div>
        </>
    );
}
