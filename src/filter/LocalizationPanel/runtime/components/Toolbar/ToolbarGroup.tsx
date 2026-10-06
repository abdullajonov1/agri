import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { getAccountDisplayInfo } from "../../../../../shared/getAccountDisplayInfo";
import type { GeoWidgetState } from "../../widget";
import {
  BellIcon,
  CalendarIcon,
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
};

export const ToolbarGroup = (props: ToolbarGroupProps) => {
  const { openToolbarMenu, language, isDarkTheme, connectionStatus } = props;

  const yilLabel =
    language === "en" ? "Year" : language === "ru" ? "Год" : language === "uz_lat" ? "Yil" : "Йил";

  const indexInfoLabel =
    language === "en"
      ? "About indices"
      : language === "ru"
        ? "Инфо про индексы"
      : language === "uz_lat"
        ? "Indekslar haqida"
        : "Индекслар ҳақида";

  const langLabel =
    language === "en" ? "Language" : language === "ru" ? "Язык" : language === "uz_lat" ? "Til" : "Тил";

  const themeLabel =
    language === "en" ? "Theme" : language === "ru" ? "Тема" : language === "uz_lat" ? "Tema" : "Тема";

  const logoutLabel =
    language === "en" ? "Log out" : language === "ru" ? "Выйти" : language === "uz_lat" ? "Chiqish" : "Чиқиш";

  return (
    <div className="agri-v20-toolbar-group">
      <div
        className="agri-v20-toolbar-item"
        ref={props._notificationsToolbarItemRef}
      >
        <button
          type="button"
          className={`agri-v20-toolbar-btn ${openToolbarMenu === "notifications" ? "is-active" : ""}`}
          onClick={() => props.toggleToolbarMenu("notifications")}
          data-tooltip={
            language === "en"
              ? "Notifications"
              : language === "ru"
                ? "Уведомления"
                : language === "uz_lat"
                  ? "Bildirishnomalar"
                  : "Билдиришномалар"
          }
          aria-label={
            language === "en"
              ? "Notifications"
              : language === "ru"
                ? "Уведомления"
                : language === "uz_lat"
                  ? "Bildirishnomalar"
                  : "Билдиришномалар"
          }
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
          onClick={() => props.toggleToolbarMenu("indexInfo")}
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
          onClick={() => props.toggleToolbarMenu("yil")}
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
          onClick={() => props.toggleToolbarMenu("language")}
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
            props.applyThemeByValue(isDarkTheme ? "light" : "dark")
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
                onClick={() => props.closeProfileMenu()}
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
