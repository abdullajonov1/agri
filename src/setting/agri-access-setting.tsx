import { React } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import { Button } from "jimu-ui";
import { type IMConfig } from "../config";
import "./agri-access-setting.css";
import { GLOBAL_ACCESS_ID } from "./access/access-model";
import { AccessDialog } from "./access/AccessDialog";
import { AccessFieldPanel } from "./access/AccessFieldPanel";
import { AccessGlobalPanel } from "./access/AccessGlobalPanel";
import {
    useAccessSetting,
    type AccessSettingController,
} from "./access/use-access-setting";

interface ModalPartProps {
    ctl: AccessSettingController;
}

/** Left column: full-access entry, field list, JSON import/export. */
function AccessRulesList({ ctl }: ModalPartProps) {
    const { selectedId } = ctl;

    return (
        <div className="modalList">
            <div className="modalListHeader">
                <div>
                    <div className="modalListTitle">Access rules / Правила доступа</div>
                    <div className="modalListSubtitle">JSON access config</div>
                </div>
            </div>

            <div
                className={`modalItem ${selectedId === GLOBAL_ACCESS_ID ? "selected" : ""}`}
                onClick={() => ctl.selectLeftItem(GLOBAL_ACCESS_ID)}
            >
                <div className="modalItemTitle">Full access / Полный доступ</div>
                <div className="modalItemInfo">
                    Условие: <span>1=1</span>
                </div>
            </div>

            <div className="fieldList">
                {ctl.config.rules.map((item) => (
                    <div
                        key={item.id}
                        className={`modalItem ${selectedId === item.id ? "selected" : ""}`}
                        onClick={() => ctl.selectLeftItem(item.id)}
                    >
                        <div className="modalItemTitle">{item.title}</div>
                        <div className="modalItemInfo">
                            Атрибут: <span>{item.field}</span>
                        </div>
                    </div>
                ))}

                <button className="addFieldButton" onClick={ctl.openAddField} title="Add field / Добавить столбец">
                    +
                </button>
            </div>

            <div className="modalBottomActions">
                <label className="jsonButton">
                    Import / Загрузить JSON
                    <input
                        type="file"
                        accept="application/json"
                        onChange={ctl.uploadJson}
                    />
                </label>

                <button className="jsonButton" onClick={ctl.downloadJson}>
                    Export / Скачать JSON
                </button>
            </div>
        </div>
    );
}

/** Apply / cancel footer with unsaved-changes indicator. */
function AccessSaveActions({ ctl }: ModalPartProps) {
    const { hasUnsavedChanges } = ctl;

    return (
        <div className="globalSettingActions">
            <div className={`saveState ${hasUnsavedChanges ? "changed" : ""}`}>
                {hasUnsavedChanges
                    ? "Есть несохранённые изменения"
                    : "Изменений нет"}
            </div>

            <div className="globalSettingButtons">
                <button
                    className="cancelConfigButton"
                    type="button"
                    onClick={ctl.cancelConfigChanges}
                    disabled={!hasUnsavedChanges}
                >
                    Cancel / Отменить
                </button>

                <button
                    className="applyConfigButton"
                    type="button"
                    onClick={ctl.applyConfig}
                    disabled={!hasUnsavedChanges}
                >
                    Apply / Применить
                </button>
            </div>
        </div>
    );
}

function AccessRightPanel({ ctl }: ModalPartProps) {
    const renderContent = () => {
        if (ctl.selectedId === GLOBAL_ACCESS_ID) {
            return <AccessGlobalPanel ctl={ctl} />;
        }
        if (!ctl.selectedField) {
            return <div className="emptyRules">Empty</div>;
        }
        return <AccessFieldPanel ctl={ctl} field={ctl.selectedField} />;
    };

    return (
        <div className="modalRightPanel">
            <div className="modalItemFullInfo">{renderContent()}</div>

            <AccessSaveActions ctl={ctl} />
        </div>
    );
}

export default function AgriAccessSettingPanel(
    props: AllWidgetSettingProps<IMConfig>,
) {
    const ctl = useAccessSetting(props);

    return (
        <div className="settingArea">
            {ctl.notice && <div className="settingNotice">{ctl.notice}</div>}

            <div className="settingsContent">
                <div className="accessControlCard">
                    <div className="accessControlHeader">
                        <div className="accessControlTitle">Data access / Доступ к данным</div>
                        <div className="accessControlDescription">
                            Configure groups and feature visibility rules / Настройте группы и условия отображения объектов
                        </div>
                    </div>

                    <Button
                        type="primary"
                        size="sm"
                        className="accessSettingsButton"
                        onClick={() => ctl.setShowModal(true)}
                    >
                        Настройка доступа / Access settings
                    </Button>
                </div>
            </div>

            {ctl.showModal && (
                <div
                    className="modalArea"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) ctl.setShowModal(false);
                    }}
                >
                    <div className="modalBlock">
                        <AccessRulesList ctl={ctl} />
                        <AccessRightPanel ctl={ctl} />
                    </div>

                    <AccessDialog ctl={ctl} />
                </div>
            )}
        </div>
    );
}
