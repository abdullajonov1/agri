/** @jsx jsx */
import { jsx, React } from "jimu-core";
import { monthCells, shiftMonth, ymdParts, type MonthCursor } from "./field-compare-hooks";

export interface CalendarCopy {
  mapDate: string;
  legend: string;
  prev: string;
  next: string;
  weekdays: string[];
  months: string[];
}

interface Props {
  copy: CalendarCopy;
  cursor: MonthCursor;
  setCursor: React.Dispatch<React.SetStateAction<MonthCursor>>;
  known: Set<string>;
  displayDate: string | null;
  pinnedDate: string | null;
  mapDate: string | null;
  seededRef: React.MutableRefObject<boolean>;
  userPickedRef: React.MutableRefObject<boolean>;
  setPinnedDate: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FieldCompareCalendar(props: Props): JSX.Element {
  const { copy, cursor, setCursor, known, displayDate, pinnedDate, mapDate, seededRef, userPickedRef, setPinnedDate } = props;
  const cells = monthCells(cursor.year, cursor.month);
  return (
    <div className="agri-dashboard-compare-calendar">
      <div className="agri-dashboard-compare-month">
        <button
          type="button"
          aria-label={copy.prev}
          onClick={() => { setCursor((current) => shiftMonth(current.year, current.month, -1)); }}
        >
          ‹
        </button>
        <span>{copy.months[cursor.month - 1]} {cursor.year}</span>
        <button
          type="button"
          aria-label={copy.next}
          onClick={() => { setCursor((current) => shiftMonth(current.year, current.month, 1)); }}
        >
          ›
        </button>
      </div>
      <div className="agri-dashboard-compare-weekdays">
        {copy.weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="agri-dashboard-compare-days">
        {cells.map((ymd, index) => {
          if (!ymd) return <span key={`empty-${index}`} />;
          const hasScene = known.has(ymd);
          const selected = ymd === displayDate;
          const isMap = ymd === mapDate;
          const className = [
            "agri-dashboard-compare-day",
            hasScene ? "has-scene" : "",
            selected ? "is-selected" : "",
            isMap && !selected ? "is-map" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              key={ymd}
              type="button"
              className={className}
              data-date={ymd}
              disabled={!hasScene}
              aria-pressed={selected}
              onClick={() => {
                if (!hasScene) return;
                seededRef.current = true;
                userPickedRef.current = true;
                setPinnedDate(ymd);
              }}
            >
              {Number(ymd.slice(-2))}
            </button>
          );
        })}
      </div>
      <div className="agri-dashboard-compare-legend">
        <i />
        <span>{copy.legend}</span>
        {pinnedDate && mapDate && pinnedDate !== mapDate ? (
          <button
            type="button"
            onClick={() => {
              if (!mapDate) return;
              seededRef.current = true;
              userPickedRef.current = true;
              setPinnedDate(mapDate);
              const parts = ymdParts(mapDate);
              if (parts) setCursor(parts);
            }}
          >
            {copy.mapDate}
          </button>
        ) : null}
      </div>
    </div>
  );
}
