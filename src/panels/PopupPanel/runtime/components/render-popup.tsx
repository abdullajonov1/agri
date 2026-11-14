import type { PopupWidgetHost } from "../popup-host";
import { MousePointerClick, Settings2 } from "lucide-react";
import AgriChartLoader from "../../../../shared/AgriChartLoader";
import { React } from "jimu-core";
import {
  renderAttachments,
  renderErrorBlock,
  renderFieldList,
  renderMinimizedChip,
  renderPopupHeader,
} from "./render-popup-parts";

export const renderPopup = (host: PopupWidgetHost) => {
  const { selectedAttrs, loading, error, showPopup, popupMinimized, popupPosition, pinToCorner } = host.state;

  if (!showPopup) return null;

  const fields = (host.props.config?.fieldsToShow || [])
    .map((n) => host.resolveFieldName(n) || n)
    .filter(Boolean);

  const title = host.tr("title.attributes");
  const view = host.state.jimuMapView?.view;
  const layoutPos = popupPosition;

  if (popupMinimized) return renderMinimizedChip(host, title);

  const { width: popupWidth, height: popupHeight } = host.getPopupDimensions(
    view || null,
    pinToCorner,
    layoutPos,
  );

  const dimensionStyle: React.CSSProperties = {
    width: `${popupWidth}px`,
    minWidth: `${popupWidth}px`,
    maxWidth: `${popupWidth}px`,
    height: `${popupHeight}px`,
    maxHeight: `${popupHeight}px`,
  };

  const stylePinned: React.CSSProperties = layoutPos
    ? {
        left: layoutPos.x,
        top: layoutPos.y,
        transform: "none",
        ...dimensionStyle,
      }
    : { ...dimensionStyle };

  const styleFree: React.CSSProperties = {
    left: layoutPos?.x || "50%",
    top: layoutPos?.y || "50%",
    transform: !layoutPos ? "translate(-50%, -50%)" : "none",
    ...dimensionStyle,
  };

  const popupStyle = pinToCorner ? stylePinned : styleFree;

  const showAttachments =
    host.props.config?.settings?.showAttachments !== false;


  return (
    <div
      className={`agri3-popup-direct ${pinToCorner ? "is-pinned" : "is-floating"}`}
      style={popupStyle}
      ref={host._popupRef}
    >
      {renderPopupHeader(host, title)}

      <div className="agri3-popup-content">
        {error && renderErrorBlock(host, error)}

        {loading && (
          <div className="agri3-loading-container">
            <AgriChartLoader label={host.tr("status.loadingFeature")} />
          </div>
        )}

        {!loading && selectedAttrs && fields.length > 0 && renderFieldList(host, fields, selectedAttrs)}

        {!loading && selectedAttrs && fields.length === 0 && (
          <div className="agri3-status-indicator agri3-status-waiting">
            <Settings2 className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
            {host.tr("status.noFields")}
          </div>
        )}

        {/* Latest-day vegetation indices */}
        {!loading && selectedAttrs && host.renderLatestIndices()}

        {/* Chart */}
        {!loading && selectedAttrs && host.renderChart()}

        {showAttachments && renderAttachments(host)}

        {!loading && !selectedAttrs && !error && (
          <div className="agri3-status-indicator agri3-status-waiting">
            <MousePointerClick className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
            {host.tr("status.clickPolygon")}
          </div>
        )}
      </div>
    </div>
  );
};
