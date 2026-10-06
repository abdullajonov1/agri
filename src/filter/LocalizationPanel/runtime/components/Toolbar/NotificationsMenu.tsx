import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { ChevronDown, X } from "lucide-react";
import type { GeoWidgetState } from "../../widget";

export type NotificationsMenuProps = Pick<
  GeoWidgetState,
  | "openToolbarMenu"
  | "language"
  | "notificationDays"
  | "notificationLoading"
  | "notificationError"
  | "notificationCanScrollDown"
> & {
  _notificationsToolbarItemRef: React.RefObject<HTMLDivElement>;
  _notificationBodyRef: React.RefObject<HTMLDivElement>;
  onNotificationBodyScroll: () => void;
  formatNotificationDate: (ymd: string) => string;
  formatFieldCount: (value: number) => string;
  resolveRegionNotificationName: (regionCode: string) => string;
  onClose: () => void;
};

export const NotificationsMenu = (props: NotificationsMenuProps) => {
  if (props.openToolbarMenu !== "notifications") return null;

  const anchor = props._notificationsToolbarItemRef.current;
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const { language, notificationDays, notificationLoading, notificationError, notificationCanScrollDown } =
    props;

  const headerLabel =
    language === "en"
      ? "New fields (last 5 days)"
      : language === "ru"
        ? "Новые поля (последние 5 дней)"
        : language === "uz_lat"
          ? "Yangi maydonlar (oxirgi 5 kun)"
          : "Янги майдонлар (охирги 5 кун)";

  const emptyLabel =
    language === "en"
      ? "No recent data"
      : language === "ru"
        ? "Нет новых данных"
        : language === "uz_lat"
          ? "Yangi ma'lumot yo'q"
          : "Янги маълумот йўқ";

  const loadingLabel =
    language === "en"
      ? "Loading…"
      : language === "ru"
        ? "Загрузка…"
        : language === "uz_lat"
          ? "Yuklanmoqda…"
          : "Юкланмоқда…";

  const fieldsLabel =
    language === "en"
      ? "fields"
      : language === "ru"
        ? "полей"
        : language === "uz_lat"
          ? "maydon"
          : "майдон";

  return ReactDOM.createPortal(
    <div
      className="agri-v20-toolbar-popover agri-v20-toolbar-popover-floating agri-v20-floating-overlay agri-v20-notifications-popover"
      style={{
        position: "fixed",
        top: rect.bottom + 10,
        left: Math.min(
          Math.max(12, rect.left),
          Math.max(12, window.innerWidth - 372),
        ),
        width: 360,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 2147483001,
      }}
    >
      <div
        className="agri-v20-notifications-menu"
        role="dialog"
        aria-label={headerLabel}
      >
        <div className="agri-v20-notifications-header">
          <span>{headerLabel}</span>
          <button
            type="button"
            className="agri-v20-notifications-close"
            onClick={() =>
              props.onClose()
            }
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {notificationLoading ? (
          <div className="agri-v20-notifications-status">{loadingLabel}</div>
        ) : notificationError ? (
          <div className="agri-v20-notifications-status agri-v20-notifications-status--error">
            {notificationError}
          </div>
        ) : !notificationDays.length ? (
          <div className="agri-v20-notifications-status">{emptyLabel}</div>
        ) : (
          <div className="agri-v20-notifications-body-wrap">
            <div
              className="agri-v20-notifications-body"
              ref={props._notificationBodyRef}
              onScroll={props.onNotificationBodyScroll}
            >
              {notificationDays.map((day) => (
                <section
                  className="agri-v20-notifications-day"
                  key={day.date}
                >
                  <div className="agri-v20-notifications-day-title">
                    <span>{props.formatNotificationDate(day.date)}</span>
                    <span className="agri-v20-notifications-day-total">
                      {props.formatFieldCount(day.totalFields)} {fieldsLabel}
                    </span>
                  </div>
                  <ul className="agri-v20-notifications-region-list">
                    {day.regions.map((row) => (
                      <li
                        className="agri-v20-notifications-region-row"
                        key={`${day.date}-${row.regionCode}`}
                      >
                        <span className="agri-v20-notifications-region-name">
                          {props.resolveRegionNotificationName(row.regionCode)}
                        </span>
                        <span className="agri-v20-notifications-region-count">
                          {props.formatFieldCount(row.fieldCount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {notificationCanScrollDown ? (
              <div
                className="agri-v20-notifications-scroll-cue"
                aria-hidden="true"
              >
                <ChevronDown size={20} strokeWidth={2.5} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
