import type { PopupWidgetHost } from "../popup-host";
import type { PopupAttributes } from "../popup-types";
import { ChevronUp, Pin, MapPin, X, AlertTriangle, FolderOpen, Paperclip, Download, Inbox } from "lucide-react";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { React } from "jimu-core";

export const renderChartTrigger = (
  host: PopupWidgetHost,
  chartType: "bar" | "line",
  chartLabel: string,
): JSX.Element => (
      <button
        type="button"
        className="agri3-chart-trigger"
        onClick={host.toggleChartExpanded}
      >
        <span className="agri3-chart-trigger-icon">{host.renderChartIcon(chartType)}</span>
        <span className="agri3-chart-trigger-label">{chartLabel}</span>
        <span className="agri3-chart-trigger-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
);

export const renderChartPanel = (
  host: PopupWidgetHost,
  chartType: "bar" | "line",
  chartLabel: string,
  pinned: boolean,
  chartBody: JSX.Element,
): JSX.Element => (
    <div className="agri3-chart-panel">
      {!pinned ? (
        <button
          type="button"
          className="agri3-chart-panel-header"
          onClick={host.toggleChartExpanded}
        >
          <span className="agri3-chart-trigger-icon">{host.renderChartIcon(chartType)}</span>
          <span className="agri3-chart-trigger-label">{chartLabel}</span>
          <span
            className="agri3-chart-trigger-chevron is-open"
            aria-hidden="true"
          >
            ▴
          </span>
        </button>
      ) : (
        <div className="agri3-chart-panel-header agri3-chart-panel-header--static">
          <span className="agri3-chart-trigger-icon">{host.renderChartIcon(chartType)}</span>
          <span className="agri3-chart-trigger-label">{chartLabel}</span>
        </div>
      )}
      <div className="agri3-chart-container">{chartBody}</div>
    </div>
);

export const renderMinimizedChip = (host: PopupWidgetHost, title: string): JSX.Element => {
  const { pinToCorner } = host.state;
  const view = host.state.jimuMapView?.view;
    const viewForChip = view || host.state.jimuMapView?.view || null;
    const mapRect = viewForChip ? host.getMapAreaRect(viewForChip) : null;
    const chipStyle: React.CSSProperties = mapRect
      ? {
          position: "fixed",
          right: Math.max(
            8,
            (typeof window !== "undefined" ? window.innerWidth : mapRect.right) -
              mapRect.right +
              host.DASHBOARD_POPUP_VERTICAL_INSET,
          ),
          top: mapRect.top + host.DASHBOARD_POPUP_VERTICAL_INSET,
          left: "auto",
          bottom: "auto",
          transform: "none",
        }
      : {
          position: "fixed",
          right: host.DASHBOARD_POPUP_VERTICAL_INSET,
          top: host.DASHBOARD_POPUP_VERTICAL_INSET,
          left: "auto",
          bottom: "auto",
        };

    const stopMapHit = (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

  return (
      <div
        className={`agri3-popup-minimized ${
          pinToCorner ? "is-pinned" : "is-floating"
        }`}
        style={chipStyle}
        ref={host._popupRef}
        onMouseDown={stopMapHit}
        onPointerDown={stopMapHit}
        onClick={stopMapHit}
      >
        <button
          type="button"
          className="agri3-popup-minimized-btn"
          onMouseDown={stopMapHit}
          onPointerDown={stopMapHit}
          onClick={(e) => {
            stopMapHit(e);
            host.expandPopup();
          }}
          title={host.tr("action.expand")}
          aria-label={host.tr("action.expand")}
        >
          <span className="agri3-popup-minimized-accent" aria-hidden="true" />
          <span className="agri3-popup-minimized-title">{title}</span>
          <ChevronUp
            className="agri3-popup-minimized-icon"
            size={16}
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </button>
      </div>
    );
};

export const renderPopupHeader = (host: PopupWidgetHost, title: string): JSX.Element => {
  const { pinToCorner } = host.state;
  return (
      <div className="agri3-popup-header" onMouseDown={host.onPopupHeaderMouseDown}>
        <button
          className={`agri3-popup-pin${pinToCorner ? " active" : ""}`}
          onClick={host.togglePinToCorner}
          title={
            pinToCorner ? host.tr("action.unpin") : host.tr("action.pin")
          }
          aria-pressed={pinToCorner}
          type="button"
        >
          {pinToCorner ? (
            <Pin size={15} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
          )}
        </button>

        <h2 className="agri3-popup-title">{title}</h2>

        <button
          type="button"
          className="agri3-popup-close"
          onClick={host.minimizePopup}
          aria-label={host.tr("action.minimize")}
          title={host.tr("action.minimize")}
        >
          <X size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
  );
};

export const renderErrorBlock = (host: PopupWidgetHost, error: string): JSX.Element => (
          <div className="agri3-error-container">
            <AlertTriangle className="agri3-error-icon" size={20} strokeWidth={2.2} aria-hidden="true" />
            <div className="agri3-error-title">
              {host.tr("status.warning")}
            </div>
            <div className="agri3-error-message">{error}</div>
          </div>
);

export const renderFieldList = (
  host: PopupWidgetHost,
  fields: string[],
  selectedAttrs: PopupAttributes,
): JSX.Element => (
          <div className="agri3-field-list">
            {fields
              .filter(
                (name) => {
                  if (!Object.prototype.hasOwnProperty.call(selectedAttrs, name)) return false;
                  const val = selectedAttrs[name];
                  if (val == null || val === "") return false;
                  if (typeof val === "string" && !val.trim()) return false;
                  return true;
                },
              )
              .map((name) => (
                <div className="agri3-field-row" key={name}>
                  <span className="agri3-field-label">
                    {host.getFieldAlias(name)}
                  </span>
                  <span className="agri3-field-value">
                    {host.formatValue(name, selectedAttrs[name])}
                  </span>
                </div>
              ))}

            {fields.filter(
              (name) =>
                Object.prototype.hasOwnProperty.call(selectedAttrs, name) &&
                selectedAttrs[name] != null &&
                selectedAttrs[name] !== "",
            ).length === 0 && (
              <div className="agri3-status-indicator agri3-status-waiting">
                <Inbox className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
                {host.tr("status.noConfiguredData")}
              </div>
            )}
          </div>
);

export const renderAttachments = (host: PopupWidgetHost): JSX.Element => {
  const { loadingAttachments, attachments, attachmentsError } = host.state;
  const hasAttachments = (attachments?.length || 0) > 0;
  return (
          <div className="agri3-attachments">
            <div className="agri3-attachments-header">
              <div className="agri3-attachments-title">
                <FolderOpen size={15} strokeWidth={2.2} aria-hidden="true" />
                {host.tr("attachments.title")}{" "}
                {hasAttachments ? `(${attachments.length})` : ""}
              </div>
            </div>

            {loadingAttachments && (
              <div
                className="agri3-loading-container agri3-loading-container--compact"
                style={{ marginTop: 8 }}
              >
                <AgriChartLoader label={host.tr("status.loadingAttachments")} />
              </div>
            )}

            {!loadingAttachments && attachmentsError && (
              <div
                className="agri3-status-indicator agri3-status-waiting"
                style={{ marginTop: 6 }}
                title={attachmentsError}
              >
                <AlertTriangle className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
                {host.tr("status.attachmentsError") || attachmentsError}
              </div>
            )}

            {!loadingAttachments && !attachmentsError && !hasAttachments && (
              <div
                className="agri3-status-indicator agri3-status-waiting"
                style={{ marginTop: 6 }}
              >
                <FolderOpen className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
                {host.tr("status.noAttachments")}
              </div>
            )}

            {!loadingAttachments && hasAttachments && (
              <div className="agri3-attachments-body">
                <div className="agri3-attachments-images agri3-grid">
                  {attachments
                    .filter((a) => a.previewObjectUrl)
                    .map((a) => (
                      <a
                        key={`img-${a.id}`}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="agri3-attachment-thumb agri3-card"
                        title={a.name || host.tr("attachment.imageFallback")}
                        download={a.name || undefined}
                      >
                        <img
                          src={a.previewObjectUrl}
                          alt={a.name || host.tr("attachment.imageFallback")}
                        />
                        <div
                          className="agri3-thumb-caption"
                          title={a.name || ""}
                        >
                          {a.name || host.tr("attachment.imageFallback")}
                        </div>
                      </a>
                    ))}
                </div>

                <div className="agri3-attachments-files">
                  {attachments
                    .filter((a) => !a.previewObjectUrl)
                    .map((a) => (
                      <div
                        className="agri3-attachment-file agri3-card"
                        key={`file-${a.id}`}
                      >
                        <div className="agri3-attachment-file-top">
                          <div
                            className="agri3-attachment-file-name"
                            title={a.name || ""}
                          >
                            <Paperclip size={14} strokeWidth={2.2} aria-hidden="true" />
                            {a.name ||
                              host.tr("attachment.fileFallback", {
                                id: a.id,
                              })}
                          </div>
                          <a
                            className="agri3-attachment-download"
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={a.name || undefined}
                          >
                            <Download size={13} strokeWidth={2.2} aria-hidden="true" />
                            {host.tr("attachment.download")}
                          </a>
                        </div>
                        <div className="agri3-attachment-file-meta">
                          {(a.contentType || "").split("/").pop() || ""}{" "}
                          {a.size ? `• ${host.bytesToSize(a.size)}` : ""}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
  );
};
