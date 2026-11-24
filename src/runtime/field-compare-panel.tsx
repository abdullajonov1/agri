/** @jsx jsx */
import { jsx, React } from "jimu-core";
import {
  fetchPolygonAvailableDates,
  type VegetationIndiceType,
} from "../gis/agri-polygon-api-source";
import { getVegetationOverlayContext } from "../gis/agri-vegetation-overlay-prefetch";
import {
  isSelectableCompareDate,
  isSwipeActive,
  reconcileCompareDate,
} from "./field-swipe/compare-dates";
import {
  createFieldSwipeController,
  type FieldSwipeController,
  type SwipeStatus,
} from "./field-swipe/swipe-controller";
import { SWIPE_COPY, type SwipeCopy, type SwipeLanguage } from "./field-swipe/swipe-copy";

export type CompareLanguage = SwipeLanguage;

interface Props {
  language: CompareLanguage;
  view?: __esri.MapView | null;
  onOpenChange?: (open: boolean) => void;
}

const INDICES: readonly VegetationIndiceType[] = ["ndvi", "savi", "rvi", "ci", "evi", "ndre", "ndwi"];
const POLYGON_SOURCES = ["AgriPopup", "AgriGraffWidget", "AgriGraff10", "AgriFilter"];

function readRecord(event: Event): Record<string, unknown> {
  const detail = (event as CustomEvent<unknown>).detail;
  if (!detail || typeof detail !== "object") return {};
  return detail as Record<string, unknown>;
}

function readRegion(value: unknown): number | null {
  const region = Number(value);
  return Number.isFinite(region) ? region : null;
}

function readIndex(value: unknown): VegetationIndiceType {
  const key = String(value || "").trim().toLowerCase();
  return INDICES.includes(key as VegetationIndiceType)
    ? (key as VegetationIndiceType)
    : "ndvi";
}

function readYmd(value: unknown): string | null {
  const text = String(value || "").trim().slice(0, 10);
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(text) ? text : null;
}

function readDates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => readYmd(item)).filter((item): item is string => Boolean(item));
}

function ymdParts(ymd: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(ymd);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function monthCells(year: number, month: number): Array<string | null> {
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month, 0).getDate();
  const cells: Array<string | null> = [];
  for (let index = 0; index < lead; index += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return cells;
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

interface Cursor {
  year: number;
  month: number;
}

interface CalendarProps {
  copy: SwipeCopy;
  cursor: Cursor;
  mainDate: string | null;
  compareDate: string | null;
  availableDates: readonly string[];
  onShift: (delta: number) => void;
  onPick: (ymd: string) => void;
}

function dayClassName(hasScene: boolean, isMain: boolean, isSelected: boolean): string {
  return [
    "agri-dashboard-compare-day",
    hasScene ? "has-scene" : "",
    isMain ? "is-main" : "",
    isSelected ? "is-selected" : "",
  ].filter(Boolean).join(" ");
}

function CompareCalendar(props: CalendarProps): JSX.Element {
  const { copy, cursor, mainDate, compareDate, availableDates } = props;
  const cells = monthCells(cursor.year, cursor.month);
  return (
    <div className="agri-dashboard-compare-calendar">
      <div className="agri-dashboard-compare-month">
        <button type="button" aria-label={copy.prev} onClick={() => { props.onShift(-1); }}>‹</button>
        <span>{copy.months[cursor.month - 1]} {cursor.year}</span>
        <button type="button" aria-label={copy.next} onClick={() => { props.onShift(1); }}>›</button>
      </div>
      <div className="agri-dashboard-compare-weekdays">
        {copy.weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="agri-dashboard-compare-days">
        {cells.map((ymd, index) => {
          if (!ymd) return <span key={`empty-${index}`} />;
          const isSelectable = isSelectableCompareDate(ymd, mainDate, availableDates);
          const isMain = ymd === mainDate;
          const isSelected = ymd === compareDate;
          return (
            <button
              key={ymd}
              type="button"
              className={dayClassName(isSelectable, isMain, isSelected)}
              data-date={ymd}
              disabled={!isSelectable}
              aria-pressed={isSelected}
              onClick={() => { if (isSelectable) props.onPick(ymd); }}
            >
              {Number(ymd.slice(-2))}
            </button>
          );
        })}
      </div>
      <div className="agri-dashboard-compare-legend">
        <i className="agri-dashboard-compare-legend-available" />
        <span>{copy.available}</span>
        <i className="agri-dashboard-compare-legend-main" />
        <span>{copy.chartDate}</span>
      </div>
    </div>
  );
}

function dispatchCompareToggled(): void {
  document.dispatchEvent(new CustomEvent("agriFieldCompareToggled", {
    detail: { open: true },
    bubbles: true,
  }));
}

export default function FieldComparePanel(props: Props): JSX.Element {
  const copy = SWIPE_COPY[props.language] || SWIPE_COPY.uz_lat;
  const [open, setOpen] = React.useState(false);
  const [uniqueid, setUniqueid] = React.useState("");
  const [regionId, setRegionId] = React.useState<number | null>(null);
  const [mainDate, setMainDate] = React.useState<string | null>(null);
  const [indexKey, setIndexKey] = React.useState<VegetationIndiceType>("ndvi");
  const [availableDates, setAvailableDates] = React.useState<string[]>([]);
  const [compareDate, setCompareDate] = React.useState<string | null>(null);
  const [cursor, setCursor] = React.useState<Cursor>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [controller, setController] = React.useState<FieldSwipeController | null>(null);
  const [status, setStatus] = React.useState<SwipeStatus>("idle");
  const uniqueidRef = React.useRef("");
  const availableRef = React.useRef<string[]>([]);
  const indexDatesRef = React.useRef(false);
  const openRef = React.useRef(false);
  const onOpenChangeRef = React.useRef(props.onOpenChange);
  onOpenChangeRef.current = props.onOpenChange;
  openRef.current = open;
  availableRef.current = availableDates;
  const isActive = isSwipeActive(compareDate, mainDate);

  const closePopover = React.useCallback((): void => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onOpenChangeRef.current?.(false);
  }, []);

  React.useEffect(() => {
    const clearField = (): void => {
      indexDatesRef.current = false;
      uniqueidRef.current = "";
      setUniqueid("");
      setMainDate(null);
      setCompareDate(null);
      setAvailableDates([]);
      closePopover();
    };
    const onSelection = (event: Event): void => {
      const detail = readRecord(event);
      const mentionsPolygon = Object.prototype.hasOwnProperty.call(detail, "polygonMode")
        || Object.prototype.hasOwnProperty.call(detail, "uniqueid");
      if (!mentionsPolygon || !POLYGON_SOURCES.includes(String(detail.source || ""))) return;
      const nextId = String(detail.uniqueid || "").replace(/[{}]/g, "").trim();
      if (detail.polygonMode !== true || !nextId) {
        clearField();
        return;
      }
      const region = readRegion(detail.regionId) ?? readRegion(getVegetationOverlayContext().regionId);
      if (nextId === uniqueidRef.current) {
        if (region != null) setRegionId(region);
        return;
      }
      indexDatesRef.current = false;
      uniqueidRef.current = nextId;
      setAvailableDates([]);
      setUniqueid(nextId);
      setRegionId(region);
      setCompareDate(null);
      closePopover();
    };
    const onDate = (event: Event): void => {
      const detail = readRecord(event);
      const nextDate = readYmd(detail.date);
      const advertised = readDates(detail.availableDates).sort();
      const hasAdvertised = advertised.length > 0 && Boolean(uniqueidRef.current);
      if (hasAdvertised) {
        indexDatesRef.current = true;
        setAvailableDates(advertised);
      }
      if (detail.indexKey) setIndexKey(readIndex(detail.indexKey));
      setMainDate(nextDate);
      setRegionId((current) => current ?? readRegion(getVegetationOverlayContext().regionId));
      const reference = hasAdvertised ? advertised : availableRef.current;
      setCompareDate((current) => reconcileCompareDate(current, nextDate, reference));
    };
    const onPanelOpened = (event: Event): void => {
      if (readRecord(event).open === true) closePopover();
    };
    document.addEventListener("widgetSelectionChanged", onSelection);
    document.addEventListener("graffDateIndexSelectionChanged", onDate);
    document.addEventListener("agriIndicatorsDrawerToggled", onPanelOpened);
    document.addEventListener("agriLandLayersToggled", onPanelOpened);
    return () => {
      document.removeEventListener("widgetSelectionChanged", onSelection);
      document.removeEventListener("graffDateIndexSelectionChanged", onDate);
      document.removeEventListener("agriIndicatorsDrawerToggled", onPanelOpened);
      document.removeEventListener("agriLandLayersToggled", onPanelOpened);
    };
  }, [closePopover]);

  React.useEffect(() => {
    if (!uniqueid || regionId == null || indexDatesRef.current) return undefined;
    const year = ymdParts(mainDate || "")?.year ?? getVegetationOverlayContext().year;
    if (year == null) return undefined;
    let cancelled = false;
    void fetchPolygonAvailableDates(uniqueid, regionId, year)
      .then((dates) => {
        if (cancelled || indexDatesRef.current) return;
        setAvailableDates(readDates(dates).slice().sort());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [uniqueid, regionId, mainDate]);

  React.useEffect(() => {
    if (!props.view) {
      setController(null);
      return undefined;
    }
    const next = createFieldSwipeController(props.view);
    const unsubscribe = next.subscribe((state) => { setStatus(state.status); });
    setController(next);
    return () => {
      unsubscribe();
      next.destroy();
    };
  }, [props.view]);

  React.useEffect(() => {
    if (!controller) return;
    if (!isActive || !compareDate || !uniqueid || regionId == null) {
      controller.setCompare(null);
      return;
    }
    controller.setCompare({ uniqueid, regionId, date: compareDate, indexKey });
  }, [controller, uniqueid, regionId, mainDate, compareDate, indexKey, isActive]);

  const toggle = (): void => {
    const next = !open;
    if (next) {
      const parts = ymdParts(compareDate || mainDate || "");
      if (parts) setCursor(parts);
      dispatchCompareToggled();
    }
    setOpen(next);
    onOpenChangeRef.current?.(next);
  };

  const isLoading = isActive && status === "loading";
  const hasError = isActive && status === "error";
  const turnsOff = isActive && status !== "error" && !open;
  const buttonLabel = isActive && !open ? copy.close : copy.open;

  return (
    <React.Fragment>
      <div className="agri-dashboard-compare-control">
        <button
          type="button"
          className={`agri-dashboard-map-zoom-button agri-dashboard-compare-button${open || isActive ? " is-active" : ""}${isLoading ? " is-loading" : ""}${hasError ? " has-error" : ""}`}
          aria-label={buttonLabel}
          aria-expanded={open}
          aria-pressed={isActive}
          aria-busy={isLoading ? "true" : undefined}
          title={buttonLabel}
          onPointerDown={(event) => { event.stopPropagation(); }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (turnsOff) {
              setCompareDate(null);
              return;
            }
            toggle();
          }}
        >
          <svg
            className="agri-dashboard-map-control-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <path d="M12 2.5v19" />
            <path d="M8.5 12H5.5m0 0 1.6-1.6M5.5 12l1.6 1.6M15.5 12h3m0 0-1.6-1.6M18.5 12l-1.6 1.6" />
          </svg>
        </button>
      </div>
      <div
        className={`agri-dashboard-compare-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-label={copy.title}
        aria-hidden={!open}
        onPointerDown={(event) => { event.stopPropagation(); }}
      >
        {!uniqueid ? <p>{copy.pickField}</p> : null}
        {hasError ? (
          <div className="agri-dashboard-compare-error" role="alert">
            <span>{copy.error}</span>
            <button type="button" className="agri-dashboard-compare-retry" onClick={() => { controller?.retry(); }}>
              {copy.retry}
            </button>
          </div>
        ) : null}
        <CompareCalendar
          copy={copy}
          cursor={cursor}
          mainDate={mainDate}
          compareDate={compareDate}
          availableDates={availableDates}
          onShift={(delta) => { setCursor((current) => shiftMonth(current.year, current.month, delta)); }}
          onPick={(ymd) => {
            setCompareDate(ymd);
            closePopover();
          }}
        />
      </div>
    </React.Fragment>
  );
}
