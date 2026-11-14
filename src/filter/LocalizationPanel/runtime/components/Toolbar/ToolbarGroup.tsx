import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { getAccountDisplayInfo } from "../../../../../shared/getAccountDisplayInfo";
import { pickLabel } from "../../../../../shared/agri-i18n";
import type { GeoWidgetState } from "../../widget";
import { TOOLBAR_GROUP_MESSAGES } from "./toolbar-group-messages";
import {
  BellIcon,
  CalendarIcon,
  ExcelIcon,
  InfoIcon,
  LanguageIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from "./toolbar-icons";

export type ToolbarGroupProps = Pick<
  GeoWidgetState,
  "openToolbarMenu" | "language" | "isDarkTheme" | "connectionStatus" | "showProfileMenu"
> & {
  _notificationsToolbarItemRef: React.RefObject<HTMLDivElement>;
  _indexInfoToolbarItemRef: React.RefObject<HTMLDivElement>;
  _yilToolbarItemRef: React.RefObject<HTMLDivElement>;
  _languageToolbarItemRef: React.RefObject<HTMLDivElement>;
  toggleToolbarMenu: (menu: "yil" | "language" | "indexInfo" | "notifications") => void;
  applyThemeByValue: (value: "light" | "dark") => void;
  toggleProfileMenu: () => void;
  closeProfileMenu: () => void;
  handleLogout: () => void;
  reportExporting?: boolean;
  onExportReport?: () => void;
};

export const ToolbarGroup = (props: ToolbarGroupProps) => {
  const { openToolbarMenu, language, isDarkTheme, connectionStatus } = props;

  const yilLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.year, language);
  const indexInfoLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.indexInfo, language);
  const langLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.language, language);
  const themeLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.theme, language);
  const logoutLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.logout, language);
  const excelLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.excel, language);
  const notificationsLabel = pickLabel(TOOLBAR_GROUP_MESSAGES.notifications, language);

  return (
    <div className="agri-v20-toolbar-group">
      <div className="agri-v20-toolbar-item">
        <button
          type="button"
          className={`agri-v20-toolbar-btn${props.reportExporting ? " is-active" : ""}`}
          onClick={() => { props.onExportReport?.(); }}
          disabled={props.reportExporting || connectionStatus !== "connected" || !props.onExportReport}
          data-tooltip={excelLabel}
          aria-label={excelLabel}
          aria-busy={props.reportExporting ? true : undefined}
        >
          <ExcelIcon />
        </button>
      </div>

      <div
        className="agri-v20-toolbar-item"
        ref={props._notificationsToolbarItemRef}
      >
        <button
          type="button"
          className={`agri-v20-toolbar-btn ${openToolbarMenu === "notifications" ? "is-active" : ""}`}
          onClick={() => { props.toggleToolbarMenu("notifications"); }}
          data-tooltip={notificationsLabel}
          aria-label={notificationsLabel}
          aria-pressed={openToolbarMenu === "notifications"}
        >
          <BellIcon />
        </button>
      </div>

      <div
        className="agri-v20-toolbar-item"
        ref={props._indexInfoToolbarItemRef}
      >
        <button
          type="button"
          className={`agri-v20-toolbar-btn ${openToolbarMenu === "indexInfo" ? "is-active" : ""}`}
          onClick={() => { props.toggleToolbarMenu("indexInfo"); }}
          data-tooltip={indexInfoLabel}
          aria-label={indexInfoLabel}
          aria-pressed={openToolbarMenu === "indexInfo"}
        >
          <InfoIcon />
        </button>
      </div>

      <div
        className="agri-v20-toolbar-item"
        ref={props._yilToolbarItemRef}
      >
        <button
          type="button"
          className={`agri-v20-toolbar-btn ${openToolbarMenu === "yil" ? "is-active" : ""}`}
          onClick={() => { props.toggleToolbarMenu("yil"); }}
          data-tooltip={yilLabel}
          aria-label={yilLabel}
          aria-pressed={openToolbarMenu === "yil"}
        >
          <CalendarIcon />
        </button>
      </div>

      <div
        className="agri-v20-toolbar-item"
        ref={props._languageToolbarItemRef}
      >
        <button
          type="button"
          className={`agri-v20-toolbar-btn agri-v20-language-btn ${openToolbarMenu === "language" ? "is-active" : ""}`}
          onClick={() => { props.toggleToolbarMenu("language"); }}
          data-tooltip={langLabel}
          aria-label={langLabel}
          aria-pressed={openToolbarMenu === "language"}
        >
          <LanguageIcon
            active={openToolbarMenu === "language"}
            isLight={!isDarkTheme}
          />
        </button>
      </div>

      <div className="agri-v20-toolbar-item">
        <button
          type="button"
          className={`agri-v20-theme-toggle ${isDarkTheme ? "agri-v20-theme-toggle--dark" : ""}`}
          role="switch"
          aria-label={themeLabel}
          data-tooltip={themeLabel}
          aria-checked={isDarkTheme}
          onClick={() =>
            { props.applyThemeByValue(isDarkTheme ? "light" : "dark"); }
          }
        >
          <SunIcon className="agri-v20-theme-toggle__icon agri-v20-theme-toggle__icon--sun" />
          <MoonIcon className="agri-v20-theme-toggle__icon agri-v20-theme-toggle__icon--moon" />
          <span
            className="agri-v20-theme-toggle__thumb"
            aria-hidden="true"
          >
            {isDarkTheme ? (
              <MoonIcon size={13} />
            ) : (
              <SunIcon size={13} />
            )}
          </span>
        </button>
      </div>

      <div className="agri-v20-toolbar-item agri-v20-profile-wrapper">
        <button
          type="button"
          className={`agri-v20-toolbar-btn agri-v20-logout-btn${props.showProfileMenu ? " agri-v20-profile-open" : ""}`}
          onClick={props.toggleProfileMenu}
          disabled={connectionStatus !== "connected"}
          data-tooltip={logoutLabel}
          aria-label={logoutLabel}
          aria-haspopup="menu"
          aria-expanded={props.showProfileMenu}
        >
          {getAccountDisplayInfo().initial}
        </button>
        {props.showProfileMenu &&
          ReactDOM.createPortal(
            <div className={`agri-v20-root ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
              <div
                className="agri-v20-profile-backdrop"
                onClick={() => { props.closeProfileMenu(); }}
              />
              <div className="agri-v20-profile-dropdown" role="menu">
                <div className="agri-v20-profile-header">
                  <div className="agri-v20-profile-name">
                    {getAccountDisplayInfo().displayName || logoutLabel}
                  </div>
                </div>
                <button
                  type="button"
                  className="agri-v20-profile-logout-item"
                  role="menuitem"
                  onClick={props.handleLogout}
                >
                  <LogoutIcon />
                  <span>{logoutLabel}</span>
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};
