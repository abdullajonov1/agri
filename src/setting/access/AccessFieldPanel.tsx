import { React } from "jimu-core";
import { buildAccessRuleWhere } from "../../shared/agri-access-config";
import { makeGroupKey, type AccessFieldRule, type AccessRule } from "./access-model";
import { AccessGroupRow } from "./AccessGroupRow";
import { SelectedGroupsBar } from "./AccessGlobalPanel";
import type { AccessSettingController } from "./use-access-setting";

interface RuleCardProps {
    ctl: AccessSettingController;
    field: AccessFieldRule;
    rule: AccessRule;
}

function AccessRuleCard({ ctl, field, rule }: RuleCardProps) {
    const isSelected = ctl.selectedRuleIds.includes(rule.id);

    return (
        <div className={`ruleCard ${isSelected ? "selectedRule" : ""}`}>
            <div className="ruleHeader">
                <input
                    type="checkbox"
                    className="selectCheckbox"
                    checked={isSelected}
                    onChange={() => ctl.toggleRuleSelect(rule.id)}
                />

                <div className="ruleInfo">
                    <div className="ruleLabel">Условие</div>
                    <div className="ruleValue">
                        {buildAccessRuleWhere(field.field, rule)}
                    </div>
                </div>

                <div className="ruleActions">
                    <button className="smallButton" onClick={() => ctl.openAddGroup(rule.id)}>
                        + группа
                    </button>

                    <button className="iconButton" onClick={() => ctl.openEditRule(rule)}>
                        ✎
                    </button>

                    <button
                        className="iconButton danger"
                        onClick={() =>
                            ctl.setDialog({ type: "deleteRule", payload: { ruleId: rule.id } })
                        }
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="groupsArea">
                {rule.groups.length === 0 ? (
                    <div className="emptyMini">Группы не добавлены</div>
                ) : (
                    rule.groups.map((group, index) => {
                        const groupKey = makeGroupKey(rule.id, index);

                        return (
                            <AccessGroupRow
                                key={`${group}_${index}`}
                                groupId={group}
                                groupInfo={ctl.groupsInfo[group]}
                                groupsLoading={ctl.groupsLoading}
                                onCopyGroupId={ctl.copyGroupId}
                                isSelected={ctl.selectedGroupKeys.includes(groupKey)}
                                onToggleSelect={() => ctl.toggleGroupSelect(groupKey)}
                                onEdit={() => ctl.openEditGroup(rule.id, index, group)}
                                onDelete={() =>
                                    ctl.setDialog({
                                        type: "deleteGroup",
                                        payload: { ruleId: rule.id, groupIndex: index },
                                    })
                                }
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

interface FieldPanelProps {
    ctl: AccessSettingController;
    field: AccessFieldRule;
}

/** Right-hand panel listing the rules (and their groups) of one field. */
export function AccessFieldPanel({ ctl, field }: FieldPanelProps) {
    return (
        <>
            <div className="rightHeader">
                <div>
                    <div className="rightTitle">{field.title}</div>
                    <div className="rightField">
                        Атрибут: {field.field}
                    </div>
                </div>

                <div className="rightHeaderActions">
                    <button className="iconButton" onClick={ctl.openEditField}>
                        ✎
                    </button>

                    <button
                        className="iconButton danger"
                        onClick={() => ctl.setDialog({ type: "deleteField" })}
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="rulesArea">
                {ctl.selectedRuleIds.length > 0 && (
                    <div className="bulkActionBar">
                        <span>Выбрано правил: {ctl.selectedRuleIds.length}</span>

                        <button className="dangerButtonSmall" onClick={ctl.deleteSelectedRules}>
                            Delete selected / Удалить выбранные
                        </button>
                    </div>
                )}

                <SelectedGroupsBar ctl={ctl} />

                {field.rules.length === 0 ? (
                    <div className="emptyRules">Правила ещё не добавлены</div>
                ) : (
                    field.rules.map((rule) => (
                        <AccessRuleCard key={rule.id} ctl={ctl} field={field} rule={rule} />
                    ))
                )}

                <button className="addRuleButton" onClick={ctl.openAddRule}>
                    + Add rule / Добавить правило
                </button>
            </div>
        </>
    );
}
