import type { PopupWidgetHost } from "../popup-host";
import { LineChart, BarChart3, Sprout, CalendarDays, Inbox, ChevronUp, Pin, MapPin, X, AlertTriangle, Settings2, FolderOpen, Paperclip, Download, MousePointerClick } from "lucide-react";
import { default as AgriChartLoader } from "../../../../shared/AgriChartLoader";
import { React } from "jimu-core";
import { AgriHiddenConnectors } from "../../../../gis/AgriHiddenConnectors";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "../popup-constants";

export const renderChartIcon = (host: PopupWidgetHost, type: "bar" | "line" = "bar"): JSX.Element =>
  type === "line" ? (
      <LineChart className="agri3-chart-icon" strokeWidth={2} aria-hidden="true" />
    ) : (
      <BarChart3 className="agri3-chart-icon" strokeWidth={2} aria-hidden="true" />
    );

export const renderLatestIndices = (host: PopupWidgetHost) => {
  const { loadingLatestIndices, latestIndexDate, latestIndexValues } =
    host.state;

  const hasValues = !!latestIndexValues;
  const showBlockingLoader = loadingLatestIndices && !hasValues;
  const showRefreshLoader = loadingLatestIndices && hasValues;

  return (
    <div className="agri3-field-list agri3-indices-list">
      <div className="agri3-field-row agri3-indices-header-row">
        <span className="agri3-field-label agri3-indices-title">
          <Sprout size={14} strokeWidth={2.2} aria-hidden="true" />
          {host.tr("indices.title")}
        </span>
        {latestIndexDate && !loadingLatestIndices && (
          <span className="agri3-field-value agri3-indices-date">
            <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
            {latestIndexDate}
          </span>
        )}
      </div>
      {showBlockingLoader ? (
        <div className="agri3-indices-loading-container">
          <AgriChartLoader label={host.tr("indices.loading")} />
        </div>
      ) : hasValues ? (
        <div
          className={`agri3-indices-body${
            showRefreshLoader ? " agri3-indices-body--loading" : ""
          }`}
        >
          {showRefreshLoader ? (
            <AgriChartLoader label={host.tr("indices.loading")} />
          ) : null}
          {popupVegIndexFields.filter(
            (f) => latestIndexValues[f] != null,
          ).map((f) => (
            <div
              className={`agri3-field-row agri3-index-row agri3-index-row--${f}`}
              key={f}
            >
              <span
                className={`agri3-field-label agri3-index-label agri3-index-label--${f}`}
              >
                <span className="agri3-index-dot" aria-hidden="true" />
                {f.toUpperCase()}
              </span>
              <span className="agri3-field-value">
                {latestIndexValues[f].toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="agri3-status-indicator agri3-status-waiting">
          <Inbox className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
          {host.tr("indices.none")}
        </div>
      )}
    </div>
  );
};

export const renderChart = (host: PopupWidgetHost) => {
  const config = host.props.config;
  if (!config?.chartEnabled) return null;

  const chartFields = config.chartFields || [];
  const chartType = config.chartType || "bar";
  const chartTitle = config.chartTitle || "";
  const chartColor = config.chartColor || "#00a8e8";
  const attrs = host.state.selectedAttrs;
  const pinned = host.state.pinToCorner;
  const chartExpanded = pinned || host.state.chartExpanded;

  if (!attrs || chartFields.length === 0) return null;

  // Collect numeric data for chart
  const dataPoints: { label: string; value: number }[] = [];
  for (const fieldName of chartFields) {
    const raw = attrs[fieldName];
    const numVal = typeof raw === "number" ? raw : parseFloat(raw);
    if (!isNaN(numVal)) {
      dataPoints.push({
        label: host.getFieldAlias(fieldName),
        value: numVal,
      });
    }
  }

  if (dataPoints.length === 0) return null;

  const chartLabel = chartTitle || dataPoints[0]?.label || "Grafik";
  const hoverIndex = host.state.chartHoverIndex;

  const svgWidth = 340;
  const svgHeight = 168;
  const padding = { top: 12, right: 12, bottom: 8, left: 40 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...dataPoints.map((d) => d.value), 0);
  const yMax = host.niceChartMax(maxVal);
  const scaleY = (v: number) => chartH - (v / yMax) * chartH;

  const isDark = host.state.isDarkTheme;
  const axisColor = isDark ? "rgba(255,255,255,0.55)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.14)" : "#dbeafe";
  const chartBodyBg = isDark ? "transparent" : "#ffffff";
  const highlightFill = isDark
    ? "rgba(0, 168, 232, 0.12)"
    : "rgba(0, 168, 232, 0.1)";

  const gridLines = 4;
  const gridStep = yMax / gridLines;

  const barLayout =
    chartType === "bar"
      ? (() => {
          const barGap = Math.max(6, Math.min(10, chartW / dataPoints.length / 4));
          const barW = Math.max(
            8,
            (chartW - (dataPoints.length - 1) * barGap) / dataPoints.length,
          );
          return dataPoints.map((d, i) => {
            const x = padding.left + i * (barW + barGap);
            const barH = Math.max(2, (d.value / yMax) * chartH);
            const y = padding.top + chartH - barH;
            return { ...d, i, x, y, barW, barH, centerX: x + barW / 2 };
          });
        })()
      : [];

  const linePoints =
    chartType === "line"
      ? (() => {
          const stepX =
            dataPoints.length > 1 ? chartW / (dataPoints.length - 1) : 0;
          return dataPoints.map((d, i) => ({
            ...d,
            i,
            x:
              padding.left +
              (dataPoints.length > 1 ? i * stepX : chartW / 2),
            y: padding.top + scaleY(d.value),
          }));
        })()
      : [];

  const hoverPoint =
    hoverIndex != null
      ? chartType === "bar"
        ? barLayout[hoverIndex]
        : linePoints[hoverIndex]
      : null;

  const tooltipLeftPct = hoverPoint
    ? Math.max(8, Math.min(82, (hoverPoint.x / svgWidth) * 100))
    : 0;
  const tooltipTopPct = hoverPoint
    ? Math.max(6, Math.min(58, (hoverPoint.y / svgHeight) * 100 - 18))
    : 0;

  const chartSvg = (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="agri3-chart-svg"
      style={{ background: chartBodyBg }}
    >
      <rect
        x={padding.left}
        y={padding.top}
        width={chartW}
        height={chartH}
        fill={isDark ? "rgba(255,255,255,0.02)" : "#ffffff"}
        rx={6}
      />

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = gridStep * i;
        const y = padding.top + scaleY(val);
        return (
          <g key={`grid-${i}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
              strokeDasharray="3 5"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              fill={axisColor}
              fontSize={10}
              textAnchor="end"
            >
              {host.formatChartTick(val)}
            </text>
          </g>
        );
      })}

      {chartType === "bar" &&
        barLayout.map((bar) => (
          <g key={`bar-${bar.i}`}>
            {hoverIndex === bar.i && (
              <rect
                x={bar.x - 3}
                y={padding.top}
                width={bar.barW + 6}
                height={chartH}
                fill={highlightFill}
                rx={5}
              />
            )}
            <path
              d={host.buildRoundedBarPath(bar.x, bar.y, bar.barW, bar.barH, 5)}
              fill={chartColor}
              opacity={hoverIndex == null || hoverIndex === bar.i ? 1 : 0.45}
              className="agri3-chart-bar"
              onMouseEnter={() => host.setChartHover(bar.i)}
            />
            <rect
              x={bar.x}
              y={padding.top}
              width={bar.barW}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => host.setChartHover(bar.i)}
            />
          </g>
        ))}

      {chartType === "line" && (
        <g>
          {hoverIndex != null && linePoints[hoverIndex] && (
            <line
              x1={linePoints[hoverIndex].x}
              y1={padding.top}
              x2={linePoints[hoverIndex].x}
              y2={padding.top + chartH}
              stroke={chartColor}
              strokeWidth={1.5}
              opacity={0.35}
            />
          )}
          <path
            d={host.buildSmoothLinePath(linePoints)}
            fill="none"
            stroke={chartColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {linePoints.map((p) => (
            <g key={`pt-${p.i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === p.i ? 5.5 : 4}
                fill={isDark ? "#0b1a30" : "#ffffff"}
                stroke={chartColor}
                strokeWidth={hoverIndex === p.i ? 2.5 : 2}
                className="agri3-chart-point"
                onMouseEnter={() => host.setChartHover(p.i)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="transparent"
                onMouseEnter={() => host.setChartHover(p.i)}
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );

  const chartBody = (
    <div
      className="agri3-chart-body"
      onMouseLeave={host.clearChartHover}
    >
      {hoverPoint && (
        <div
          className="agri3-chart-tooltip"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
          }}
        >
          <div className="agri3-chart-tooltip-label">{hoverPoint.label}</div>
          <div className="agri3-chart-tooltip-value">
            {host.formatChartTooltipValue(hoverPoint.value)}
          </div>
        </div>
      )}
      {chartSvg}
    </div>
  );

  if (!chartExpanded) {
    return (
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
  }

  return (
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
};

export const renderPopup = (host: PopupWidgetHost) => {
  const {
    selectedAttrs,
    selectedOID,
    loading,
    error,
    showPopup,
    popupMinimized,
    popupPosition,
    loadingAttachments,
    attachments,
    attachmentsError,
    pinToCorner,
  } = host.state;

  if (!showPopup) return null;

  const fields = (host.props.config?.fieldsToShow || [])
    .map((n) => host.resolveFieldName(n) || n)
    .filter(Boolean);

  const title = host.tr("title.attributes");

  const view = host.state.jimuMapView?.view;
  const layoutPos = popupPosition;

  if (popupMinimized) {
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
  }

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
  const hasAttachments = (attachments?.length || 0) > 0;

  return (
    <div
      className={`agri3-popup-direct ${pinToCorner ? "is-pinned" : "is-floating"}`}
      style={popupStyle}
      ref={host._popupRef}
    >
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

      <div className="agri3-popup-content">
        {error && (
          <div className="agri3-error-container">
            <AlertTriangle className="agri3-error-icon" size={20} strokeWidth={2.2} aria-hidden="true" />
            <div className="agri3-error-title">
              {host.tr("status.warning")}
            </div>
            <div className="agri3-error-message">{error}</div>
          </div>
        )}

        {loading && (
          <div className="agri3-loading-container">
            <AgriChartLoader label={host.tr("status.loadingFeature")} />
          </div>
        )}

        {!loading && selectedAttrs && fields.length > 0 && (
          <div className="agri3-field-list">
            {fields
              .filter(
                (name) => {
                  if (!selectedAttrs.hasOwnProperty(name)) return false;
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
                selectedAttrs.hasOwnProperty(name) &&
                selectedAttrs[name] != null &&
                selectedAttrs[name] !== "",
            ).length === 0 && (
              <div className="agri3-status-indicator agri3-status-waiting">
                <Inbox className="agri3-status-icon" size={16} strokeWidth={2.2} aria-hidden="true" />
                {host.tr("status.noConfiguredData")}
              </div>
            )}
          </div>
        )}

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

        {showAttachments && (
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
                          src={a.previewObjectUrl!}
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
        )}

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

export function render(host: PopupWidgetHost) {
  const { useMapWidgetIds, useDataSources } = host.props;
  const themeClass = host.state.isDarkTheme
    ? "agri3-theme-dark"
    : "agri3-theme-light";

  return (
    <div className={`agri3-attr-card ${themeClass}`}>
      {host.renderPopup()}

      <AgriHiddenConnectors
        useDataSources={useDataSources}
        useMapWidgetIds={useMapWidgetIds}
        onDataSourceCreated={host.onDataSourceCreated}
        onActiveViewChange={host.onActiveViewChange}
      />

      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          width: "8px",
          height: "8px",
          background: host.state.featureLayers?.length
            ? "#10b981"
            : "#94a3b8",
          borderRadius: "50%",
          opacity: 0.6,
          transition: "all 0.3s ease",
          pointerEvents: "none",
        }}
        title={
          host.state.featureLayers?.length
            ? host.tr("status.ready")
            : host.tr("status.loading")
        }
      />
    </div>
  );
}
