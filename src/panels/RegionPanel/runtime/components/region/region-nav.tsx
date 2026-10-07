import type { RegionWidgetHost } from "../../region-host";

/** Recharts passes either the row itself or `{ payload: row }`. */
type ChartRowPayload = { payload?: unknown } | null | undefined;

/** Pointer-like source: a React synthetic event (`nativeEvent`) or a MouseEvent. */
interface ClientPointSource {
  nativeEvent?: unknown;
  clientX?: unknown;
  clientY?: unknown;
}
import type { RegionalDataItem } from "../../widget";
import { React } from "jimu-core";
import { regionLog as regionLogFn } from "../../region-log";

export const handleRegionSelectionClick = (host: RegionWidgetHost, data: { name?: string; payload?: RegionalDataItem & { name?: string } }, _index?: number, _e?: React.MouseEvent<SVGPathElement, MouseEvent>): void => {
  const item =
    data?.payload && typeof data.payload === "object"
      ? data.payload
      : data;
  regionLogFn("barClicked", {
    data: item,
    connectionStatus: host.state.connectionStatus,
    currentView: host.state.currentView,
    hasName: !!item?.name,
  });
  if (host.state.connectionStatus !== "connected" || !item?.name) {
    regionLogFn("barClicked:SKIPPED", {
      reason:
        host.state.connectionStatus !== "connected"
          ? "not-connected"
          : "no-name-on-clicked-datum",
    });
    return;
  }

  const regionName = item.name;

  if (regionName === host.state.selectedRegion) {
    // Deselect (toggle off) — works in both views:
    //  • TUMAN view: clear the tuman, keep the drilled viloyat.
    //  • VILOYAT view: clear the viloyat entirely (back to whole country).
    const gen = host.beginSelectionNotify();
    host.setState({ selectedRegion: null }, () => {
      if (host.state.currentView === "tuman") {
        host.notifyAgriFilter(
          {
            tuman: "",
            viloyat: host.state.selectedViloyatForDrillDown || "",
          },
          gen,
        );
      } else {
        host.notifyAgriFilter({ viloyat: "", tuman: "" }, gen);
      }
      // ❌ no fetch here needed, master will trigger it (and dedupe protects anyway)
    });
    return;
  }

  if (host.state.currentView === "viloyat") {
    // Drill down to tuman — notify geography FIRST so Localization/Graff
    // see the new viloyat immediately; bar data can load after.
    const gen = host.beginSelectionNotify();
    host.notifyAgriFilter({ viloyat: regionName, tuman: "" }, gen);
    host.setState(
      {
        currentView: "tuman",
        selectedViloyatForDrillDown: regionName,
        selectedRegion: null,
      },
      () => {
        void host.fetchRegionalDataDeduped();
      },
    );
    return;
  }

  // Select tuman — notify immediately with both viloyat + tuman.
  const gen = host.beginSelectionNotify();
  host.notifyAgriFilter(
    {
      viloyat: host.state.selectedViloyatForDrillDown || "",
      tuman: regionName,
    },
    gen,
  );
  host.setState({ selectedRegion: regionName });
};
export const navigateBack = (host: RegionWidgetHost) => {
  if (host.state.connectionStatus !== "connected") return;

  // ✅ If user is locked, "Back" should go to TUMAN list of locked viloyat
  if (host.state.lockedViloyat) {
    const lock = host.state.lockedViloyat;
    const gen = host.beginSelectionNotify();
    host.notifyAgriFilter(
      { tuman: "", polygonMode: false, uniqueid: "" },
      gen,
    );

    host.setState(
      {
        currentView: "tuman",
        selectedViloyatForDrillDown: lock,
        selectedRegion: null,
      },
      () => {
        void host.fetchRegionalDataDeduped();
      },
    );
    return;
  }

  // ✅ Normal (unlocked) behavior:
  // Back from a drilled region (or any selection) clears the region selection
  // and returns to the republic-wide viloyat list.
  const drilledViloyat = (host.state.selectedViloyatForDrillDown || "").trim();
  const selectedTuman = (host.state.selectedRegion || "").trim();

  if (
    (host.state.currentView === "tuman" && drilledViloyat) ||
    selectedTuman
  ) {
    host._pendingBackToViloyatHighlight = null;
    const gen = host.beginSelectionNotify();
    host.notifyAgriFilter(
      {
        viloyat: "",
        tuman: "",
        polygonMode: false,
        uniqueid: "",
      },
      gen,
    );
    host.setState(
      {
        currentView: "viloyat",
        selectedViloyatForDrillDown: null,
        selectedRegion: null,
        currentFilters: {
          ...host.state.currentFilters,
          viloyat: "",
          tuman: "",
        },
      },
      () => {
        void host.fetchRegionalDataDeduped();
      },
    );
    return;
  }

  const gen = host.beginSelectionNotify();
  // Full clear → republic-wide map + widgets.
  host.notifyAgriFilter(
    {
      viloyat: "",
      tuman: "",
      turi: "",
      vh: "",
      polygonMode: false,
      uniqueid: "",
    },
    gen,
  );
  host.setState(
    {
      currentView: "viloyat",
      selectedViloyatForDrillDown: null,
      selectedRegion: null,
      currentFilters: {
        ...host.state.currentFilters,
        viloyat: "",
        tuman: "",
        turi: "",
        turlar: [],
        vh: "",
        vhUniqueids: null,
      },
    },
    () => {
      host.fetchRegionalDataDeduped();
    },
  );
};
export const formatNumber = (host: RegionWidgetHost, value: number | null | undefined, decimals = 0) => {
  if (value == null) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
export const clampCursorPosition = (host: RegionWidgetHost, clientX: number, clientY: number): { x: number; y: number } => {
  const surface = host._rootRef.current;
  const tip = host._cursorTooltipRef.current;
  if (!surface) return { x: 0, y: 0 };

  const rect = surface.getBoundingClientRect();
  const pad = host.TOOLTIP_PAD;
  const tw = tip?.offsetWidth || 148;
  const th = tip?.offsetHeight || 58;

  let x = clientX - rect.left + host.TOOLTIP_OFFSET_X;
  let y = clientY - rect.top + host.TOOLTIP_OFFSET_Y;

  if (x + tw > surface.clientWidth - pad) {
    x = clientX - rect.left - tw - host.TOOLTIP_OFFSET_X;
  }
  if (y + th > surface.clientHeight - pad) {
    y = clientY - rect.top - th - host.TOOLTIP_OFFSET_Y;
  }

  x = Math.max(pad, Math.min(x, surface.clientWidth - tw - pad));
  y = Math.max(pad, Math.min(y, surface.clientHeight - th - pad));

  return { x: Math.round(x), y: Math.round(y) };
};
export const getClientPoint = (host: RegionWidgetHost, ...args: Array<{ nativeEvent?: MouseEvent } & Partial<MouseEvent> | unknown>): { x: number; y: number } => {
  for (const arg of args) {
    if (!arg || typeof arg !== "object") continue;
    const src = ((arg as ClientPointSource).nativeEvent || arg) as ClientPointSource;
    if (
      typeof src.clientX === "number" &&
      Number.isFinite(src.clientX) &&
      typeof src.clientY === "number" &&
      Number.isFinite(src.clientY)
    ) {
      return { x: src.clientX, y: src.clientY };
    }
  }
  return { x: 0, y: 0 };
};
export const applyTooltipPosition = (host: RegionWidgetHost, x: number, y: number): void => {
  const node = host._cursorTooltipRef.current;
  if (!node) return;
  // Prefer left/top over transform — dashboard/Recharts CSS often forces
  // `transform: none`, which freezes a translate3d-based cursor tip.
  node.style.setProperty("left", `${x}px`, "important");
  node.style.setProperty("top", `${y}px`, "important");
  node.style.setProperty("right", "auto", "important");
  node.style.setProperty("bottom", "auto", "important");
  node.style.setProperty("transform", "none", "important");
  node.style.setProperty("transition", "none", "important");
};
export const bindPointerTracking = (host: RegionWidgetHost): void => {
  if (host._pointerTracking) return;
  host._pointerTracking = true;
  window.addEventListener("mousemove", host.handleGlobalPointerMove, {
    passive: true,
  });
};
export const unbindPointerTracking = (host: RegionWidgetHost): void => {
  if (!host._pointerTracking) return;
  host._pointerTracking = false;
  window.removeEventListener(
    "mousemove",
    host.handleGlobalPointerMove,
    // match addEventListener options so the listener actually detaches
    { passive: true } as EventListenerOptions,
  );
};
export const handleGlobalPointerMove = (host: RegionWidgetHost, e: MouseEvent): void => {
  if (!host.state.cursorTooltip.visible) return;

  const surface = host._rootRef.current;
  if (!surface) return;

  const rect = surface.getBoundingClientRect();
  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (!inside) {
    host.hideCursorTooltip();
    return;
  }

  const pos = host.clampCursorPosition(e.clientX, e.clientY);
  host.applyTooltipPosition(pos.x, pos.y);
};
export const hideCursorTooltip = (host: RegionWidgetHost): void => {
  host.unbindPointerTracking();
  if (!host.state.cursorTooltip.visible) return;
  host.setState({
    cursorTooltip: { visible: false, data: null },
  });
};
export const handleWidgetPointerLeave = (host: RegionWidgetHost): void => {
  host.hideCursorTooltip();
};
export const handleBarRowClick = (host: RegionWidgetHost, item: RegionalDataItem & { displayName?: string }): void => {
  host.handleRegionSelectionClick({ payload: item });
};
export const handleBarRowPointerEnter = (host: RegionWidgetHost, item: RegionalDataItem & { displayName?: string }, event: React.MouseEvent<HTMLButtonElement>): void => {
  host.handleBarPointerEnter(item, 0, event);
};
export const handleBarRowPointerMove = (host: RegionWidgetHost, _item: RegionalDataItem & { displayName?: string }, event: React.MouseEvent<HTMLButtonElement>): void => {
  host.handleBarPointerMove(_item, 0, event);
};
export const handleBarPointerEnter = (host: RegionWidgetHost, data: unknown, _index: number, e: React.MouseEvent<Element, MouseEvent>): void => {
  const item = ((data as ChartRowPayload)?.payload ?? data) as RegionalDataItem & {
    displayName?: string;
  };
  const { x: clientX, y: clientY } = host.getClientPoint(e, data);

  host.bindPointerTracking();

  const showTooltip = () => {
    const pos = host.clampCursorPosition(clientX, clientY);
    host.applyTooltipPosition(pos.x, pos.y);
  };

  host.setState(
    {
      cursorTooltip: {
        visible: true,
        data: item,
      },
    },
    showTooltip,
  );
};
export const handleBarPointerMove = (host: RegionWidgetHost, data: unknown, _index: number, e: React.MouseEvent<Element, MouseEvent>): void => {
  if (!host.state.cursorTooltip.visible) return;
  const { x: clientX, y: clientY } = host.getClientPoint(e, data);
  if (!clientX && !clientY) return;
  const pos = host.clampCursorPosition(clientX, clientY);
  host.applyTooltipPosition(pos.x, pos.y);
};
export const handleChartSurfaceMove = (host: RegionWidgetHost, e: React.MouseEvent<HTMLDivElement>): void => {
  if (!host.state.cursorTooltip.visible) return;
  const { x: clientX, y: clientY } = host.getClientPoint(e.nativeEvent, e);
  if (!clientX && !clientY) return;
  const pos = host.clampCursorPosition(clientX, clientY);
  host.applyTooltipPosition(pos.x, pos.y);
};
export const renderCursorTooltipContent = (host: RegionWidgetHost, d: RegionalDataItem & { displayName?: string }): React.ReactNode => {
  const language = host.state.language;
  const tooltipValueLabel =
    language === "en"
      ? "Value:"
      : language === "ru"
      ? "Значение:"
      : language === "uz_lat"
        ? "Qiymat:"
        : "Қиймат:";
  const tooltipPercentLabel =
    language === "en"
      ? "Percentage:"
      : language === "ru"
      ? "Процент:"
      : language === "uz_lat"
        ? "Foiz:"
        : "Фоиз:";
  const areaUnit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";
  const tooltipTitle =
    d?.displayName ??
    (d as typeof d & { displayNameTranslated?: string })?.displayNameTranslated ??
    d?.name ??
    "";

  return (
    <>
      <div className="agri-v11-regional-tooltip-title">{tooltipTitle}</div>
      <div className="agri-v11-regional-tooltip-content">
        <div className="agri-v11-regional-tooltip-row">
          <span className="agri-v11-regional-tooltip-label">{tooltipValueLabel}</span>
          <span className="agri-v11-regional-tooltip-value">
            {host.formatNumber(d.maydon)} {areaUnit}
          </span>
        </div>
        <div className="agri-v11-regional-tooltip-row">
          <span className="agri-v11-regional-tooltip-label">{tooltipPercentLabel}</span>
          <span className="agri-v11-regional-tooltip-value">
            {(d.percentage ?? 0).toFixed(1)}%
          </span>
        </div>
      </div>
    </>
  );
};
